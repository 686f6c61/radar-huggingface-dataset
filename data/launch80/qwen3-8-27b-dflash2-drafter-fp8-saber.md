# Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER

## Resumen

Qwen3.8-27B-DFlash2-Drafter-FP8-SABER es un modelo borrador (draft model) para decodificacion especulativa, empaquetado en formato propio del motor Saber. No es un modelo generativo autonomo: es el componente "DFlash2" que predice bloques de tokens candidatos para acelerar la decodificacion de un modelo objetivo Qwen3.8-27B cuantizado (MACaQ-MXFP4, Quark-AWQ-MXFP4 o MACaQ-W4A8). Lo publica Launch80 como repositorio independiente para que una actualizacion del modelo objetivo no obligue a descargar de nuevo el borrador.

El borrador deriva de `tcclaviger/Qwen3.8-27B-DFlash2-FP8` (a su vez basado en `z-lab/Qwen3.8-27B-DFlash2`) y conserva sus lineales en fp8 e4m3 con escalas f32 por bloque de 128 x 128, en el orden de tiles premezclado de Saber. La cabeza de verificacion es el `lm_head` bf16 del objetivo Qwen3.8-27B, compartido byte a byte, y la cabeza de borrador es una recuantizacion int2 de esa misma cabeza.

Su relevancia es de infraestructura: solo funciona con el motor Saber sobre GPU AMD RDNA4 (gfx1201), tipicamente Radeon AI PRO R9700, y su proposito es elevar el throughput de decodificacion del modelo objetivo (medido en torno a 3,07 tokens aceptados por paso y 140 tok/s en decodificacion b1 con el objetivo W4A8). El repositorio ocupa 15,9 GB y contiene dos variantes: tensor-parallel 2 (8,2 GB) y tensor-parallel 1 (7,7 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 block drafter (modelo borrador para decodificacion especulativa) sobre base Qwen3.8-27B; lineales fp8 e4m3 con escalas f32 por bloque 128 x 128 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el borrador; el objetivo se sirve con 262.144 tokens en la medicion reportada |
| Tipos de cuantizacion | FP8 e4m3 (lineales del borrador); cabeza de borrador recuantizada a int2; cabeza de verificacion bf16 compartida con el objetivo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | SBRPACK1 (formato propio de Saber: `rank{0,1}.pack` + `manifest.json`); no safetensors, no GGUF |
| Tamano del repositorio | 15,9 GB (tp2: 8,2 GB; tp1: 7,7 GB) |
| Hardware requerido | AMD Radeon AI PRO R9700 (gfx1201 / RDNA4): dos para tp2, una para tp1 |
| Motor compatible | Saber con soporte DFlash2 |

## Arquitectura y entrenamiento

El modelo es un borrador de bloques DFlash2: en lugar de predecir un unico token siguiente, propone un bloque de tokens candidatos que el modelo objetivo verifica en paralelo, aceptando varios por paso de decodificacion. Los pesos provienen de `z-lab/Qwen3.8-27B-DFlash2`, publicados en FP8 por tcclaviger, y se almacenan en el orden de tiles premezclado que espera el motor Saber. La atencion y el resto de detalles internos del borrador no se documentan en la informacion disponible.

Un punto tecnico clave es el reparto de cabezas: Saber comparte un unico `lm_head` entre objetivo y borrador y rechaza borradores cuya cabeza difiera. Por eso este pack incluye `head.rerank.w` byte-identico al `lm_head` de los tres objetivos compatibles (sha256 conocidos para TP=2 rank 0/1 y TP=1), con la cabeza de verificacion en bf16 y la de borrador recuantizada a int2. El autor advierte que el borrador se entreno contra una cuantizacion del objetivo distinta de la actual, lo que condiciona la tasa de aceptacion. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Decodificacion especulativa por bloques: genera candidatos multi-token que el objetivo verifica en paralelo (hasta 3,07 tokens aceptados por paso en b1 con el objetivo W4A8).
- Aceleracion de inferencia del modelo objetivo Qwen3.8-27B en el motor Saber; no es un modelo para uso generativo directo.
- Compatibilidad con tres objetivos: MACaQ-MXFP4 (pareja oficial, ~3,2 tokens/paso a b1), Quark-AWQ-MXFP4 (pareja oficial) y MACaQ-W4A8 (funciona, 3,072 tokens/paso a b1; con el borrador W4A8 se obtiene +7,3 % en tok/s a b1).
- Soporte de tensor parallelism: packs separados para TP=2 (dos GPU) y TP=1 (una GPU).
- Integridad verificable: `SHA256SUMS` con el hash de cada fichero y hashes de cabeza documentados.
- Capacidades linguisticas, de codigo, matematicas, vision, tool calling o modo thinking: no disponibles para el borrador; dependen del modelo objetivo Qwen3.8-27B y no se documentan aqui.

## Casos de uso

- Servicio de inferencia de Qwen3.8-27B en produccion sobre RDNA4: emparejar `tp2/` con el pack TP=2 del objetivo MACaQ-MXFP4 o Quark-AWQ-MXFP4 para elevar el throughput de decodificacion manteniendo la calidad del objetivo.
- Despliegue en una sola GPU: usar `tp1/` con la carpeta TP=1 del objetivo en una unica Radeon AI PRO R9700, util para entornos de desarrollo o nodos con una sola tarjeta.
- Optimizacion de coste por token en granja de GPU AMD: la decodificacion especulativa reduce pasos por token aceptado, lo que se traduce en mayor tok/s por tarjeta; el autor reporta 233,4 tok/s en single-stream y hasta 657,9 tok/s con concurrencia 8.
- Benchmarking y evaluacion comparativa de cuantizaciones del objetivo: fijar este borrador permite medir el efecto de cambiar entre MXFP4, AWQ-MXFP4 y W4A8 sin variar el componente especulativo.
- Pipelines de evaluacion de calidad: con el objetivo W4A8 el autor reporta GSM8K 488/500 y needles 32k/120k 6/6, util para validar regresiones tras actualizar el pack del objetivo.
- Gestion de artefactos y CI de modelos: al estar en repositorio propio con hashes, se puede integrar en pipelines de descarga y verificacion (`sha256sum -c SHA256SUMS`) sin re-descargar el borrador cuando cambie el objetivo.
- Reproduccion de resultados en hardware AMD: dado que el formato SBRPACK1 solo lo carga Saber, sirve para replicar configuraciones de servido documentadas en tarjetas RDNA4.

## Benchmarks y rendimiento

Mediciones del autor con `Qwen3.8-27B-MACaQ-W4A8`, 2x R9700, TP=2, 210 W, contexto 262.144, dos arranques:

| Metrica | Resultado |
|---|---|
| Paso de decodificacion b1 | 21,52 / 21,60 ms |
| Tokens aceptados por paso | 3,072 |
| Tokens/s en decodificacion b1 | 140,9 / 140,4 tok/s |
| BetterBench `--quick` single-stream | 233,4 / 233,4 tok/s |
| BetterBench concurrencia 8 | 657,9 / 643,1 tok/s |
| GSM8K | 488/500 |
| Needles 32k + 120k | 6/6 |

Con el objetivo MACaQ-MXFP4 (pareja oficial) el autor indica aproximadamente 3,2 tokens por paso a b1 con prompt fijo, pero remite a la tarjeta del objetivo para las cifras completas. No se publican resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 8,2 GB para el pack `tp2/` repartido entre dos GPU y 7,7 GB para `tp1/` en una sola GPU; hay que sumar la memoria del modelo objetivo, no cuantificada aqui.
- GPU compatibles: exclusivamente AMD Radeon AI PRO R9700 (gfx1201 / RDNA4); dos unidades para TP=2, una para TP=1.
- GPU consumer: no se documenta soporte en GPU de consumo; el requisito explicito es RDNA4 gfx1201, lo que excluye arquitecturas anteriores y, por lo indicado, no se mencionan equivalentes NVIDIA.
- Despliegue: motor Saber con soporte DFlash2, con `--engine-draft-pack <dir>/tp2 --engine-draft-block 8` junto al `--pack` del objetivo. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato SBRPACK1.
- Latencia y throughput medidos: 21,5 ms por paso de decodificacion b1 y 140 tok/s b1; 233 tok/s single-stream y ~650 tok/s con concurrencia 8 en BetterBench `--quick`.
- Consumo: mediciones realizadas a 210 W por tarjeta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-Drafter-FP8-SABER (este) | Borrador DFlash2 FP8 para Saber | no disponible | no disponible (objetivo a 262.144) | SBRPACK1 | Apache-2.0 | Hugging Face, motor Saber en RDNA4 |
| Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER | Borrador DFlash2 W4A8 para Saber | no disponible | no disponible | SBRPACK1 | no disponible | Hugging Face; +7,3 % tok/s b1 frente a este pack con objetivo W4A8 |
| tcclaviger/Qwen3.8-27B-DFlash2-FP8 | Checkpoint del borrador en FP8 | no disponible | no disponible | safetensors (inferido del checkpoint) | no disponible | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | Borrador DFlash2 original | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con borradores de otros ecosistemas (por ejemplo, borradores EAGLE o Medusa para vLLM) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo funciona como borrador dentro del motor Saber con un objetivo compatible; no se puede cargar en vLLM, llama.cpp, Ollama ni TGI.
- Formato propietario SBRPACK1 (`rank{0,1}.pack` + `manifest.json`), sin safetensors ni GGUF; la interoperabilidad esta limitada al ecosistema Saber.
- Hardware restringido a AMD RDNA4 (gfx1201); no hay soporte documentado en NVIDIA, ROCm de generaciones anteriores ni GPU de consumo.
- Dependencia estricta de la cabeza compartida: Saber rechaza el borrador si `head.rerank.w` no coincide con el `lm_head` del objetivo; hay que emparejar `tp2/` con TP=2 y `tp1/` con TP=1.
- El borrador se entreno contra una cuantizacion del objetivo distinta de la actual, lo que puede reducir la tasa de aceptacion segun el objetivo usado.
- Con el objetivo W4A8, este pack es un 7,3 % mas lento a b1 que el borrador W4A8 especifico; conviene usar este solo con los objetivos MXFP4/AWQ-MXFP4.
- Riesgo de alucinacion y sesgos: no evaluables para el borrador; los resultados de calidad (GSM8K 488/500) corresponden al objetivo, no al borrador.
- Idiomas soportados no documentados; dependen del objetivo Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del checkpoint del borrador original.
- Duplicidad de descarga: los ficheros son byte-identicos a las carpetas `qwen38-dflash2-drafter-quarkhead` del repositorio Quark-AWQ-MXFP4; quien ya los tenga no necesita este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez de la comunidad no contrastada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-FP8-SABER
- Modelo base del borrador: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Borrador original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Objetivo MACaQ-MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-MXFP4-SABER
- Objetivo Quark-AWQ-MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-Quark-AWQ-MXFP4-SABER
- Objetivo MACaQ-W4A8: https://huggingface.co/Launch80/Qwen3.8-27B-MACaQ-W4A8-SABER
- Borrador W4A8 alternativo: https://huggingface.co/Launch80/Qwen3.8-27B-DFlash2-Drafter-W4A8-SABER
- Modelo Qwen3.8-27B (origen de la cabeza): https://huggingface.co/Qwen/Qwen3.8-27B
