# nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ

## Resumen

Qwen3.8-27B-DFlash2-W4A16-HGPTQ es una cuantizacion a 4 bits de un modelo borrador (*draft model*) de decodificacion especulativa basado en difusion por bloques, desarrollado por el usuario nchapman a partir de `incoai/Qwen3.8-27B-DFlash2`. No es un modelo generativo autonomo: su funcion es proponer varios tokens futuros en paralelo para acelerar la generacion del modelo objetivo `Qwen/Qwen3.8-27B`, que actua como verificador. El resultado es un artefacto auxiliar de inferencia, no un LLM de proposito general.

El modelo emplea cuantizacion W4A16 con GPTQ, rotaciones Hadamard y un formato de pesos gestionado por la libreria `compressed-tensors`. El repositorio ocupa 1,4 GB y los pesos en safetensors suman 1.924.404.480 parametros, aunque la denominacion comercial "27B" del modelo base no se corresponde con el tamano real del borrador, que es mucho menor.

Su relevancia actual es practica: reduce el coste de memoria del borrador de 3,58 GiB en BF16 a 1,31 GiB en W4A16 (un 2,74x menos), lo que permite desplegar decodificacion especulativa paralela en GPUs de consumo junto al modelo objetivo de 27B. La licencia es Apache 2.0 y esta disenado especificamente para el runtime `warp34`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador con difusion por bloques (block-diffusion speculative drafter) |
| Parametros totales | 1.924.404.480 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 con GPTQ, rotaciones Hadamard, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa que abandona el esquema clasico de propuesta token a token y emplea difusion por bloques: genera en paralelo un conjunto de tokens candidatos para el siguiente bloque, que el modelo objetivo `Qwen3.8-27B` verifica. Segun la model card, mantiene una longitud de aceptacion de 2,535 tokens por paso frente a 2,540 del borrador en BF16 (99,8% de retencion) y conserva el 100,0% del recall de candidatos top-16. El modelo base del borrador es `incoai/Qwen3.8-27B-DFlash2`.

La cuantizacion aplica GPTQ en modo W4A16 (pesos a 4 bits, activaciones a 16 bits) con transformaciones Hadamard y el formato de `compressed-tensors`. El resultado reduce el ancho de banda de memoria por paso de borrador de 3.175 MiB a 843 MiB (3,76x menos) y el uso de VRAM de 3,58 GiB a 1,31 GiB. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de propuestas especulativas en paralelo (multiples tokens por paso) para acelerar la decodificacion del modelo objetivo.
- Verificacion delegada: no valida sus propias propuestas; el modelo `Qwen3.8-27B` actua como verificador.
- Integracion directa como `--draft-model` en el runtime `warp34` con cualquier checkpoint de `Qwen3.8-27B`.
- Compatibilidad con los cuantizados objetivos `Qwen3.8-27B-W4A16-HGPTQ` y `Qwen3.8-27B-W2.6A16-HGPTQ-RCO`.
- No soporta tool calling, agentes, vision ni audio por si mismo: es un componente de inferencia, no un modelo de proposito general.
- Capacidades multilingues: no disponibles (heredadas del modelo objetivo, no documentadas para el borrador).

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el borrador junto a `Qwen3.8-27B` en `warp34` para reducir la latencia de generacion manteniendo la calidad del modelo objetivo, gracias a la decodificacion especulativa paralela.
- Despliegue en GPUs de consumo: con 1,31 GiB de VRAM para el borrador, es viable ejecutar el objetivo de 27B cuantizado y el borrador en una sola GPU de gama alta de consumo, algo inviable con el borrador en BF16 (3,58 GiB).
- Servicio de chat de baja latencia: usar el borrador para aumentar el throughput de tokens por segundo en endpoints interactivos donde el tiempo hasta el primer token y la velocidad de decodificacion son criticos.
- Pipelines de generacion por lotes: reducir el coste por token en tareas de generacion masiva (resumen, extraccion, redaccion) al disminuir el ancho de banda por paso de borrador (843 MiB frente a 3.175 MiB).
- Experimentacion en investigacion: comparar tasas de aceptacion y latencia de decodificacion especulativa con y sin cuantizacion del borrador usando `warp34-quant-lab`.
- Evaluacion de tecnicas de cuantizacion: servir como referencia para estudiar el impacto de W4A16 + GPTQ + Hadamard en la calidad de un borrador de difusion por bloques.

## Benchmarks y rendimiento

Datos publicados en la model card (no se dispone de MMLU, HumanEval ni GSM8K, que no aplican a un borrador):

| Metrica | BF16 | W4A16 (este modelo) | Variacion |
|---|---|---|---|
| VRAM del borrador | 3,58 GiB | 1,31 GiB | 2,74x menos |
| Ancho de banda por paso de borrador | 3.175 MiB | 843 MiB | 3,76x menos |
| Longitud de aceptacion (tokens/paso) | 2,540 | 2,535 | 99,8% retenido |
| Recall de candidatos top-16 | 100,0% | 100,0% | sin cambios |

No se han publicado resultados de benchmarks de calidad de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es un generador autonomo.

## Requisitos de hardware

- VRAM estimada para el borrador: 1,31 GiB en W4A16 (frente a 3,58 GiB en BF16); hay que sumar la VRAM del modelo objetivo `Qwen3.8-27B` cuantizado.
- GPU recomendadas: no especificadas en la informacion disponible; el autor indica que la reduccion de ancho de banda hace el borrado "noticeably faster on consumer GPUs".
- Cabe en GPU de consumo: si, el borrador por si solo ocupa 1,31 GiB; el limite real lo impone el modelo objetivo de 27B.
- Opciones de despliegue: runtime `warp34` (unico soportado explicitamente); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; se documenta la mejora relativa de memoria y ancho de banda, no de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-W4A16-HGPTQ (este) | 1,92 B | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face, runtime warp34 |
| incoai/Qwen3.8-27B-DFlash2 (BF16) | no disponible | no disponible | BF16 | no disponible | Hugging Face |
| Qwen3.8-27B-W4A16-HGPTQ (objetivo) | 27 B (nominal) | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face, runtime warp34 |
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO (objetivo) | 27 B (nominal) | no disponible | W2.6A16 | Apache 2.0 | Hugging Face, runtime warp34 |

No se dispone de informacion sobre otros borradores de decodificacion especulativa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera respuestas finales ni debe usarse como LLM autonomo; requiere el modelo objetivo `Qwen3.8-27B` como verificador.
- Dependencia de runtime: esta optimizado para `warp34`; fuera de ese runtime no se documenta compatibilidad.
- Idiomas soportados no documentados; las capacidades linguisticas dependen del modelo objetivo.
- La cuantizacion W4A16 introduce una perdida marginal de calidad (99,8% de longitud de aceptacion, 0,5% de diferencia en tokens/paso), aceptable pero no nula.
- Riesgo de alucinacion: no aplica directamente al borrador, pero las propuestas rechazadas por el verificador no llegan al usuario; la calidad final depende del objetivo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `incoai/Qwen3.8-27B-DFlash2`, no documentada en la informacion disponible.
- El autor no publica datos de contexto maximo ni de composicion del dataset de entrenamiento, lo que limita la evaluacion de sesgos.
- Modelo con muy poca traccion (285 descargas, 0 likes) y creado recientemente; sin validacion independiente de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ
- Modelo base del borrador: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizado objetivo W4A16: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Cuantizado objetivo W2.6A16: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
