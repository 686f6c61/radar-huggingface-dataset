# Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER

## Resumen

Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER es un modelo borrador (drafter) de decodificacion especulativa por bloques, empaquetado en formato Saber y cuantizado con la receta entera W4A8 de MACaQ. Lo publica Launch80 y deriva del drafter DFlash2 de z-lab (`z-lab/Qwen3.8-27B-DFlash2`), pasando por la release FP8 de tcclaviger. No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que un modelo objetivo de 27B (Qwen3.8-27B en su variante MACaQ W4A8) verifica, acelerando la decodificacion sin cambiar la distribucion de salida del objetivo.

La relevancia es muy concreta: se trata de una pieza de infraestructura para servir Qwen3.8-27B en hardware AMD RDNA4 (gfx1201, Radeon AI PRO R9700) con el motor Saber, usando kernels enteros int8 WMMA. El pack pesa 7,3 GB en configuracion tensor-parallel 2 y 6,8 GB en TP=1, y solo es cargable por builds de Saber que entiendan la etiqueta de manifiesto `macaq_iu8d/1`.

El modelo no emplea safetensors sino el formato propietario `SBRPACK1` (`rank{0,1}.pack` + `manifest.json`), lo que limita su uso a ese motor y a esa familia de GPU. La ganancia medida frente al drafter FP8 equivalente es de en torno al +7 % en tok/s en decodificacion single-stream b1 y +2,9 % en BetterBench `--quick`, con paridad en calidad (GSM8K 487/500 frente a 488/500).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador DFlash2 por bloques (draft model de decodificacion especulativa), 5 capas con `qkv`, `o_proj`, `gate_up` y `down` cuantizados, mas proyeccion auxiliar de hidden states |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en TP=2; 32.768 tokens en TP=1 (segun configuracion medida) |
| Tipos de cuantizacion | W4A8: pesos int4 por fila en base MACaQ (escala por canal + Hadamard block-32), activaciones int8 por token; cabeza de borrador en int2; proyecciones K/V de contexto y convolucion en bf16; `lm_head` de verificacion en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Saber `SBRPACK1` (`rank{0,1}.pack` + `manifest.json`); no safetensors, no GGUF |

## Arquitectura y entrenamiento

El drafter es un modelo auxiliar de tipo DFlash2 que predice bloques de tokens candidatos (bloques de 8, segun el flag `--engine-draft-block 8`) que el modelo objetivo verifica en cada paso. Consta de cinco capas con proyecciones `qkv`, `o_proj`, `gate_up` y `down`, mas una proyeccion auxiliar de hidden states: 21 lineales en total, todas re-cuantizadas a int4 por fila en la base MACaQ (`W' = H32 (W / t)`, una escala f32 por fila de salida, clips ponderados por Hessiano y refinamiento de flip contra las activaciones de calibracion del objetivo). La cabeza de verificacion reutiliza el `lm_head` bf16 del objetivo (compartido byte a byte) y la cabeza de borrador es una re-cuantizacion int2 de ese mismo `lm_head`. Las proyecciones K/V de contexto y las de convolucion permanecen en bf16; normas, rope y selector de candidatos no se modifican respecto al pack estandar.

No hay informacion sobre el volumen de datos de entrenamiento ni sobre el proceso de ajuste (RLHF/DPO) del drafter original; lo unico documentado es el proceso de cuantizacion. La innovacion tecnica del pack es el empaquetado W4A8 con kernels enteros int8 WMMA en RDNA4, calibrado especificamente sobre los hidden states del objetivo `Qwen3.8-27B-MACaQ-W4A8-SABER`, lo que permite que drafter y objetivo compartan los mismos kernels enteros en el motor Saber.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa por bloques (hasta 8 tokens por paso en la configuracion medida).
- Verificacion compartida con el objetivo mediante `lm_head` bf16 identico byte a byte, requisito del motor Saber.
- Aceleracion de decodificacion en single-stream (b1) y en concurrencia 8 (b8).
- Mantenimiento de la calidad del objetivo: GSM8K 487/500 y needles 32k/120k 6/6 en la configuracion medida.
- Compatibilidad de cabeza con el objetivo MXFP4 (`Qwen3.8-27B-MACaQ-MXFP4-SABER`), aunque no medido.
- No soporta tool calling, agentes, vision ni audio por si mismo: es un componente de inferencia, no un modelo de proposito general.

## Casos de uso

- Servicio de Qwen3.8-27B en produccion sobre AMD RDNA4: el drafter se carga junto al objetivo con `--engine-draft-pack <dir>/tp2 --engine-draft-block 8` y reduce el coste por token en decodificacion single-stream (de 140,9 a 151,7 tok/s en la prueba b1). Es adecuado porque comparte kernels enteros con el objetivo y no requiere hardware adicional.
- Despliegue en una sola GPU Radeon AI PRO R9700: el pack `tp1/` (6,8 GB) permite servir el objetivo con contexto de 32.768 tokens y una mejora medida de +4,7 % en tok/s b1, util para entornos de desarrollo o inferencia de baja concurrencia.
- Evaluacion comparativa de tecnicas de cuantizacion de drafters: al existir un equivalente FP8 del mismo drafter, permite A/B testing pareado con el mismo binario y objetivo, como documenta la model card.
- Pipelines de generacion de codigo o texto largo con latencia critica: la mejora en TTFT (37 ms frente a 38 ms p50 single) y en prefill en frio 4k/16k (5.192/5.228 tok/s frente a 5.147/5.170) resulta relevante en cargas interactivas.
- Inferencia con contexto muy largo (262.144 tokens en TP=2): el drafter mantiene 6/6 en needles a 32k y 120k, por lo que es apto para tareas de recuperacion en documentos extensos servidas con el objetivo.
- Reproduccion de resultados de investigacion sobre decodificacion especulativa: el repositorio incluye `SHA256SUMS` y una descripcion detallada del manifiesto, lo que facilita la verificacion de integridad en experimentos.

## Benchmarks y rendimiento

Medidos con `Qwen3.8-27B-MACaQ-W4A8`, 2x R9700, TP=2, 210 W y contexto de 262.144 tokens. A = drafter FP8; B = este drafter.

| Metrica | FP8 drafter | Este drafter | Cambio |
|---|---:|---:|---:|
| Paso de decodificacion b1 (ms) | 21,52 / 21,60 | 20,86 / 21,08 | -2,7 % |
| Tokens por paso b1 (prompt fijo) | 3,072 | 3,200 | +4,2 % |
| b1 tok/s (sonda) | 140,9 / 140,4 | 151,7 / 150,0 | +7,3 % |
| Paso de decodificacion b8 (ms) | 29,24 / 29,37 | 29,33 / 29,70 | +0,7 % |
| Tokens por paso, 124 prompts, conc 1 (IC 95 % pareado) | 4,1485 | 4,2132 | +1,56 % [-0,72, +3,97] |
| BetterBench `--quick` single-stream (tok/s) | 233,4 / 233,4 | 242,7 / 237,6 | +2,9 % |
| BetterBench `--quick` concurrencia 8 (tok/s agregados) | 657,9 / 643,1 | 660,4 / 663,0 | +1,7 % |
| TTFT p50 single (ms) | 38 / 38 | 37 / 37 | -1 ms |
| Prefill en frio 4k / 16k (tok/s) | 5.147 / 5.170, 5.131 / 5.150 | 5.192 / 5.228, 5.198 / 5.214 | +1,1 % / +1,1 % |
| GSM8K 500 preguntas / needles 32k + 120k | 488/500 / 6/6 | 487/500 / 6/6 | empatado |

En TP=1 (una tarjeta, contexto 32.768, pareado): paso b1 de 35,76/35,73 a 34,31/34,36 ms; b1 tok/s de 72,9/73,0 a 76,4/76,3 (+4,7 %); tokens por paso sobre los 124 prompts -0,43 % [-2,26, +1,40]; b8 empatado.

## Requisitos de hardware

- GPU: AMD Radeon AI PRO R9700 (gfx1201 / RDNA4). Dos unidades para `tp2/`, una para `tp1/`. No hay soporte documentado para NVIDIA ni para otras arquitecturas AMD.
- VRAM: el pack ocupa 7,3 GB (TP=2) o 6,8 GB (TP=1), adicionales al objetivo `Qwen3.8-27B-MACaQ-W4A8-SABER`.
- No cabe en GPU de consumo convencionales: requiere RDNA4 con soporte de kernels int8 WMMA y el motor Saber.
- Motor de despliegue: Saber, en una build que lea la etiqueta `macaq_iu8d/1` para el drafter y `macaq_iu8/1` para el objetivo. Las versiones anteriores rechazan el pack en el arranque.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, dado el formato `SBRPACK1`.
- Latencia y throughput medidos: 151,7 tok/s b1 y 660,4 tok/s agregados con concurrencia 8 en TP=2; 76,4 tok/s b1 en TP=1.
- Consumo medido: 210 W por tarjeta en la configuracion TP=2.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (W4A8-SABER) | Drafter DFlash2 | W4A8 int4/int8 | 262.144 (TP=2) / 32.768 (TP=1) | Apache-2.0 | `SBRPACK1` | Solo Saber en RDNA4 |
| `Qwen3.8-27B-DFlash2-Drafter-FP8-SABER` | Drafter DFlash2 | FP8 | no disponible | Apache-2.0 | `SBRPACK1` | Solo Saber en RDNA4 |
| `z-lab/Qwen3.8-27B-DFlash2` | Drafter DFlash2 | bf16 (original) | no disponible | no disponible | no disponible | Hugging Face |
| `tcclaviger/Qwen3.8-27B-DFlash2-FP8` | Drafter DFlash2 | FP8 | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera respuestas de forma autonoma, no soporta tool calling ni agentes; solo produce candidatos para verificacion.
- Requiere el objetivo `Qwen3.8-27B-MACaQ-W4A8-SABER` para el rendimiento medido; con el objetivo MXFP4 la cabeza es compatible pero no se ha medido el rendimiento.
- Saber exige que el `lm_head` del drafter sea identico byte a byte al del objetivo; un objetivo con otra cabeza sera rechazado.
- Las salidas greedy no son identicas byte a byte entre drafters: el objetivo guarda su estado GDN en f16 en cada paso de verificacion, por lo que el calendario de aceptacion altera los bits bajos en empates cercanos.
- Formato propietario `SBRPACK1`: no es portable a otros motores ni convertible a GGUF o safetensors con las herramientas habituales.
- Dependencia de hardware muy especifica (RDNA4, gfx1201) y de una build concreta de Saber; builds antiguas rechazan el pack en el arranque.
- Sin datos publicados sobre sesgos, idiomas soportados ni tasas de alucinacion del drafter; la calidad final hereda la del objetivo Qwen3.8-27B.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a las licencias del drafter base y del modelo Qwen subyacente.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026-11-19: ecosistema muy incipiente, con soporte comunitario limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Release FP8 del drafter: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Objetivo medido: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-SABER
- Objetivo alternativo compatible: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Drafter FP8 equivalente en Saber: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER
- Paper de la receta de cuantizacion MACaQ: https://arxiv.org/abs/2611.10649
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
