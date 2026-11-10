# atakans/Arete-27B-NVFP4

## Resumen

Arete-27B-NVFP4 es una version cuantizada en NVFP4 del modelo NousResearch/Arete-27B, publicada por el usuario atakans. La cuantizacion se ha realizado con NVIDIA ModelOpt 0.48.0 siguiendo la receta empleada por NVIDIA para su Qwen3.8-27B-NVFP4, y esta pensada especificamente para hardware Blackwell, en particular la plataforma DGX Spark (GB10). El objetivo es reducir el peso en memoria del modelo de 55 GB en BF16 a unos 20 GB, manteniendo una calidad muy proxima al modelo original.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`) y conserva un contexto declarado de hasta 262.144 tokens en la configuracion de servicio recomendada. La ficha tecnica real de safetensors indica 18.164.649.200 parametros, aunque la denominacion comercial del modelo es "27B", lo que sugiere una discrepancia entre el nombre y el conteo efectivo de pesos; este dato debe tratarse con cautela.

La relevancia de esta publicacion radica en que permite ejecutar un modelo conversacional de gran contexto en una unica DGX Spark con alrededor de 20 GB de pesos, a costa de una ligera perdida de calidad (del orden de 1-2,5 puntos porcentuales en GPQA Diamond e IFEval) y de un throughput de decodificacion moderado (entre 9 y 13 tokens por segundo segun la longitud de contexto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (atencion completa y atencion lineal; incluye componentes de vision) |
| Parametros totales | 18.164.649.200 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (`--max-model-len 262144`) |
| Tipos de cuantizacion | NVFP4 (MLP y lm_head), FP8 (atencion completa y lineal), BF16 (embeddings y vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del checkpoint NousResearch/Arete-27B (revision base 108f0afb), no un modelo entrenado desde cero. La receta de cuantizacion, aplicada con ModelOpt 0.48.0, combina tres precisiones: NVFP4 con calibracion Local-Hessian para las capas MLP y la cabeza de salida (lm_head), FP8 para los mecanismos de atencion completa y lineal, y BF16 para los embeddings y los modulos de vision. Esta mezcla busca preservar la sensibilidad de las capas de atencion y de entrada mientras se comprime agresivamente la parte con mayor numero de parametros.

La calibracion se realizo con 512 muestras procedentes de siete conjuntos del pipeline Nemotron post-training v3. El modelo base Arete incorpora atencion lineal ademas de atencion completa, lo que explica la necesidad de un tratamiento diferenciado en FP8. No se dispone de informacion sobre el volumen de tokens de preentrenamiento del modelo original, la composicion del dataset ni las fases de RLHF o DPO aplicadas por NousResearch.

Como nota operativa, la model card indica que Arete no incluye pesos MTP (multi-token prediction), por lo que no hay modelo draft disponible para decodificacion especulativa en esta version cuantizada.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de contexto muy largas (hasta 262.144 tokens en la configuracion recomendada).
- Razonamiento con modo "thinking" configurable; los benchmarks se midieron con thinking desactivado y temperatura 0.
- Soporte de tool calling y function calling mediante los parsers `qwen3` y `qwen3_coder` de vLLM (`--enable-auto-tool-choice`).
- Capacidades de vision, ya que los modulos visuales se mantienen en BF16.
- Soporte de prefix caching para reutilizar prefijos largos en conversaciones encadenadas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones con documentos extensos de hasta 128K-256K tokens, con tiempos de lectura de prompt de unos 82 s para 128K y respuestas posteriores de aproximadamente 1,1 s gracias al prefix caching.
- Analisis de repositorios o documentacion tecnica: con 262.144 tokens de ventana, es viable cargar varios ficheros de codigo o manuales completos en una sola sesion y formular preguntas cruzadas sobre ellos.
- Agentes con tool calling: la configuracion recomendada activa parsers de herramientas, lo que permite integrar el modelo en flujos de llamada a APIs y ejecucion de acciones estructuradas.
- Despliegue en estaciones de trabajo Blackwell: al ocupar unos 20 GB de pesos, cabe en una DGX Spark con memoria unificada, habilitando inferencia local de un modelo de gran contexto sin infraestructura de servidor dedicada.
- Procesamiento de documentos con imagenes: los modulos de vision en BF16 permiten tareas de comprension de capturas, diagramas o paginas escaneadas junto con texto.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la perdida de calidad NVFP4 frente a BF16 en tareas de razonamiento (GPQA Diamond) e instrucciones (IFEval) sobre el mismo harness.
- Servicio de inferencia con vLLM: integrable en un endpoint OpenAI-compatible con `--enable-prefix-caching` para cargas conversacionales donde se repite el mismo contexto.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el mismo harness y la misma build de vLLM, thinking desactivado y temperatura 0:

| Benchmark | BF16 (base) | Arete-27B-NVFP4 |
|---|---|---|
| GPQA Diamond (198 preguntas) | 81,8 % | 80,3 % |
| IFEval (200 casos) | 85,5 % | 83,0 % |

Rendimiento en una unica DGX Spark (vLLM 0.33.0 nightly, un usuario):

| Contexto | Decodificacion |
|---|---|
| Corto | 13,2 tok/s |
| 32K | 11,8 tok/s |
| 64K | 10,7 tok/s |
| 128K | 9,1 tok/s |

Lectura de prompt de 128K: 82 s; segundo turno sobre el mismo contexto de 128K: 1,1 s con prefix caching. Memoria libre minima durante la ejecucion a 128K: 65 GiB. No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: unos 20 GB de pesos (frente a 55 GB en BF16); el repo ocupa 21,1 GB.
- Hardware imprescindible: GPU Blackwell con soporte NVFP4 (probado en DGX Spark, GB10). No es ejecutable en arquitecturas anteriores.
- Memoria libre observada en la prueba a 128K: 65 GiB disponibles como minimo durante la ejecucion, lo que aconseja al menos 64-80 GB de memoria unificada o VRAM para contextos maximos.
- GPU de servidor: no se han publicado mediciones en A100, H100 ni RTX 4090; estas arquitecturas no soportan NVFP4 de forma nativa.
- Opciones de despliegue: vLLM (libreria declarada y unica via documentada), con los flags `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--enable-prefix-caching`.
- Throughput: 13,2 tok/s en contexto corto, descendiendo hasta 9,1 tok/s a 128K; sin decodificacion especulativa por ausencia de pesos MTP.
- Despliegue en consumer GPU: no confirmado; requiere silicio Blackwell y capacidad de memoria proxima a 64 GB para contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| atakans/Arete-27B-NVFP4 | 18,16 mil millones (safetensors) | 262.144 | NVFP4/FP8/BF16 | Apache 2.0 | Requiere Blackwell; 20 GB de pesos |
| NousResearch/Arete-27B (BF16) | 27B nominal | no disponible | BF16 | Apache 2.0 | Modelo base; 55 GB de pesos; 81,8 % GPQA Diamond, 85,5 % IFEval |
| nvidia/Qwen3.8-27B-NVFP4 | 27B nominal | no disponible | NVFP4 | no disponible | Referencia de receta y layout de cuantizacion citada por el autor |

No se dispone de datos de benchmarks de terceros ni de comparaciones directas con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad respecto a BF16: aproximadamente 1,5 puntos en GPQA Diamond y 2,5 puntos en IFEval, medidos con thinking desactivado.
- Dependencia estricta de hardware Blackwell; no funciona en GPUs Ampere, Ada o Hopper sin conversion a otro formato.
- Throughput modesto (9-13 tok/s) en DGX Spark, insuficiente para cargas de alta concurrencia; las mediciones corresponden a un unico usuario.
- Sin pesos MTP, no hay decodificacion especulativa disponible en esta version.
- Contexto maximo de 262.144 tokens declarado, pero el rendimiento decae con la longitud y el consumo de memoria crece; la prueba a 128K dejo 65 GiB libres como minimo.
- Discrepancia entre el nombre comercial (27B) y el conteo real de parametros (18,16 mil millones); conviene verificar la configuracion antes de dimensionar infraestructura.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin evaluacion propia.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser una cuantizacion PTQ, los sesgos del modelo base se heredan sin mitigacion adicional.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion comunitaria.
- La cuantizacion fue calibrada con datos Nemotron post-training v3; puede degradar en dominios alejados de esa distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atakans/Arete-27B-NVFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Referencia de receta NVFP4 citada: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- NVIDIA DGX Spark: https://www.nvidia.com/en-us/products/workstations/dgx-spark/
