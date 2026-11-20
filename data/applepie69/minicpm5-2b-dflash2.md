# applepie69/MiniCPM5-2B-DFlash2

## Resumen

MiniCPM5-2B-DFlash2 es un modelo borrador (draft model) de decodificación especulativa por difusión de bloques, entrenado por el usuario applepie69 sobre el modelo objetivo congelado openbmb/MiniCPM5-2B. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens que el modelo objetivo verifica en un servidor de decodificación especulativa, de modo que la salida final sea idéntica a la del objetivo (decodificación sin pérdida). Sigue la receta DFlash 2 de z-lab y se distribuye con licencia Apache-2.0.

El modelo emplea una columna vertebral de 5 capas decoder de estilo Qwen3 con atención GQA, oculta de 2048 dimensiones, y opera con un tamaño de bloque de 8 (7 tokens propuestos por paso de verificación). Incorpora atención bidireccional dentro del bloque, convoluciones agrupadas dinámicas de dos tomas y un selector de ruta Markoviano de bajo rango. Los embeddings y la cabeza LM no se almacenan: se reutilizan del modelo objetivo en tiempo de ejecución.

Con aproximadamente 335 millones de parámetros (0,67 GB en bf16), el modelo está pensado para integración en SGLang y vLLM como borrador especulativo. Las mediciones publicadas por el autor muestran una aceleración modesta de 1,086x en media (batch 1, greedy), por debajo de los objetivos declarados de 1,5x-2,0x, lo que lo convierte en un artefacto de interés para experimentación con decodificación especulativa más que en una solución de producción madura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de difusión de bloques sobre backbone transformer decoder estilo Qwen3 (5 capas, hidden 2048, GQA) |
| Parametros totales | 334.865.664 (~335M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el borrador opera sobre contextos de prefijo completo de 1536 tokens en entrenamiento; la ventana efectiva depende del modelo objetivo) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), configuración en config.json |

## Arquitectura y entrenamiento

La arquitectura del borrador consta de 5 capas decoder de estilo Qwen3 con dimensión oculta 2048 y atención GQA. El bloque de difusión tiene tamaño 8 (7 tokens propuestos por paso de verificación) y usa atención bidireccional dentro del bloque (`is_causal: false`), junto con convoluciones agrupadas dinámicas de dos tomas (k=2, groups=16). Las tomas del objetivo corresponden a las capas [1, 10, 20, 30, 39] de 42, fusionadas mediante una capa lineal más RMSNorm. El selector de ruta es un selector Markoviano de bajo rango con rango 256 y top-k 16. El token de máscara es el id 75982, el mismo que usa el borrador oficial MiniCPM5-2B-DSpark de OpenBMB. Los embeddings y la cabeza LM no se almacenan y se reutilizan del objetivo en tiempo de ejecución.

El entrenamiento se realizó por auto-destilación con el objetivo congelado: destilación forward-KL de los logits de bloque del borrador contra la distribución teacher-forced del objetivo, con un ancla CE de peso 0,1, y entrenamiento del selector de rutas candidatas hacia la respuesta de aceptación greedy con cadenas predecesoras teacher-forced. Se entrenaron 4 bloques por fila con contextos de prefijo completo transmitidos por caché, replicando la disciplina de caché del bucle de inferencia de DFlash2. Los datos siguieron una mezcla en dos fases: fase 1 general con HuggingFaceH4/ultrachat_200k, open-r1/OpenR1-Math-220k, ise-uiuc/Magicoder-Evol-Instruct-110K, HuggingFaceTB/smoltalk y HuggingFaceFW/fineweb-edu; fase 2 de recocido en código y agentes con Magicoder-Evol-Instruct-110K, smoltalk, bigcode/self-oss-instruct-sc2-exec-filter-50k, ultrachat_200k y OpenR1-Math-220k. El formato de chat siguió la plantilla del objetivo, empaquetado en filas de 1536 tokens, 4600 pasos con batch efectivo de 8 filas. El hardware de entrenamiento fue una Tesla T4 con autocast fp16/bf16 y GradScaler.

## Capacidades

- Generación de tokens borrador para decodificación especulativa: propone bloques de 7 tokens que el modelo objetivo verifica.
- Decodificación sin pérdida: la salida greedy es idéntica a la del objetivo y el muestreo preserva su distribución, por construcción.
- Integración con SGLang mediante el algoritmo DFLASH y con vLLM mediante `speculative-config`.
- Evaluación offline con el paquete `dflash` de Python.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autónoma: es un borrador, no un modelo de propósito general.
- No dispone de capacidades multimodales, de audio ni de visión.
- Capacidades multilingües: no documentadas; dependen del modelo objetivo MiniCPM5-2B.
- No incluye modo thinking propio.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: desplegar MiniCPM5-2B junto al borrador con `--speculative-algorithm DFLASH` y `--speculative-num-draft-tokens 8` para reducir la latencia de decodificación en entornos con GPU limitada.
- Aceleración en vLLM: configurar `speculative-config` con método `dflash` y 7 tokens especulativos para aprovechar la verificación por bloques en pipelines existentes de vLLM.
- Investigación en decodificación especulativa: servir como caso de estudio reproducible de la receta DFlash 2 aplicada a un modelo de 2B, con métricas de aceptación por dominio publicadas.
- Evaluación comparativa de borradores: comparar la aceptación y la velocidad frente al borrador oficial MiniCPM5-2B-DSpark de OpenBMB en cargas de código, agentes, matemáticas y general.
- Prototipado de servidores de inferencia de bajo coste: al ocupar 0,67 GB en bf16, el borrador se puede añadir a un despliegue existente del objetivo sin un salto significativo de VRAM.
- Benchmarking de cadenas de decodificación: usar `measured_results.json` y `dflash2_training_meta.json` para reproducir las mediciones por dominio y validar la disciplina de caché del bucle de inferencia.

## Benchmarks y rendimiento

Mediciones publicadas por el autor (greedy, batch 1, 6 prompts por dominio):

| Dominio | tok/s plano | tok/s especulativo | Aceleración | Proyección | Longitud de aceptación | Greedy idéntico |
|---|---:|---:|---:|---:|---:|---:|
| Coding | 17,81 | 19,36 | 1,087x | 1,005x | 1,234 | 6/6 |
| Agentic | 17,98 | 19,94 | 1,109x | 1,032x | 1,267 | 5/6 |
| Math | 17,91 | 19,28 | 1,076x | 0,998x | 1,226 | 5/6 |
| General | 17,90 | 19,26 | 1,076x | 1,000x | 1,228 | 5/6 |
| **Global** | 17,89 | 19,42 | **1,086x** | 1,006x | 1,236 | 21/24 |

Costes medidos por ciclo: decodificación del objetivo 57,714 ms/token, verificación del objetivo (8) 55,433 ms, bloque del borrador 15,442 ms. La columna "proyección" corresponde a AL × t_decode / (t_verify8 + t_draft). Los objetivos de velocidad declarados (coding ≥ 2,0x, agentic ≥ 2,0x, global ≥ 1,5x) no se alcanzaron. Los borradores DFlash 2 publicados reportan longitudes de aceptación de ~4-5,5 sobre Qwen3.8-27B con entrenamiento a escala completa. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es un LM autónomo.

## Requisitos de hardware

- VRAM estimada para el borrador: ~0,67 GB en bf16; se suma a la VRAM del modelo objetivo MiniCPM5-2B.
- GPU de entrenamiento documentada: Tesla T4 (fp16/bf16 autocast con GradScaler).
- GPU recomendadas para servicio: no especificadas por el autor; el borrador es ligero y puede acompañar al objetivo en GPUs de consumo, aunque el rendimiento depende del objetivo.
- Cabe en GPU de consumo: sí, el borrador por sí solo; el despliegue completo requiere también el modelo objetivo.
- Opciones de despliegue: SGLang (build con soporte DFLASH de z-lab/dflash), vLLM (`--speculative-config`), Transformers con el paquete `dflash` para evaluación offline.
- Latencia y throughput medidos: 19,42 tok/s especulativos frente a 17,89 tok/s planos en el arnés del autor; decodificación del objetivo 57,714 ms/token, verificación 55,433 ms, bloque del borrador 15,442 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceleración medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-DFlash2 (este) | ~335M (borrador) | No disponible | 1,086x global | Apache-2.0 | Hugging Face |
| MiniCPM5-2B-DSpark (OpenBMB, oficial) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Borradores DFlash 2 sobre Qwen3.8-27B | No disponible | No disponible | Aceptación ~4-5,5 | No disponible | z-lab/dflash |

No se dispone de datos de benchmarks de calidad comparables, ya que estos artefactos son borradores de decodificación especulativa y no modelos de lenguaje autónomos.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el modelo objetivo openbmb/MiniCPM5-2B para funcionar.
- Los objetivos de velocidad declarados por el autor no se alcanzaron: 1,086x global frente a 1,5x-2,0x objetivo.
- La aceleración medida incluye el sobrecoste del bucle en Python del arnés de evaluación; la proyección en un motor de servicio (SGLang/vLLM) es de 1,006x, aún lejos de los objetivos.
- La tasa de identidad greedy (21/24) está limitada por desempates de argmax en bf16, no por pérdida de calidad.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas propias; hereda las del objetivo.
- Requiere builds específicos con soporte DFLASH (SGLang de z-lab/dflash); no funciona con versiones estándar sin ese parche.
- Licencia Apache-2.0, pero deben verificarse los términos del modelo base antes de uso comercial.
- Artefacto de comunidad (applepie69), sin validación por parte de OpenBMB; 0 likes y 1057 descargas en el momento de la consulta.
- No se publican cuantizaciones ni formatos GGUF, lo que limita su uso en llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/applepie69/MiniCPM5-2B-DFlash2
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Blog DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio z-lab/dflash: https://github.com/z-lab/dflash
