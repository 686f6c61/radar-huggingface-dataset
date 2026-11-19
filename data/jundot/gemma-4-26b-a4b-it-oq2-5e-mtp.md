# Jundot/gemma-4-26B-A4B-it-oQ2.5e-mtp

## Resumen

Jundot/gemma-4-26B-A4B-it-oQ2.5e-mtp es una cuantizacion mixta de precisión del modelo multimodal Gemma 4 26B-A4B-it de Google DeepMind, publicada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El checkpoint resultante pesa 11,8 GB y esta empaquetado en formato MLX, lo que lo hace ejecutable en Apple Silicon. Se trata de una variante derivada, no de un modelo original: el trabajo de Jundot consiste en comprimir el modelo base manteniendo el mayor rendimiento posible.

El modelo base es un mixture-of-experts (MoE) de la familia Gemma 4, con 25,2B parametros totales y 3,8B activos, entrada de texto e imagen, modos de razonamiento configurables y una ventana de contexto de 256K tokens. La cuantizacion oQ2.5e asigna bits por sensibilidad medida de cada capa, logrando una media efectiva de 3,113 bits/peso para el backbone de lenguaje y 3,600 bits/peso para el checkpoint completo.

La relevancia de esta ficha reside en que permite ejecutar un modelo multimodal de 26B con contexto de 256K en hardware de consumo Apple (Mac con memoria unificada), algo inviable con los pesos originales en BF16. Incluye tambien una cabeza de prediccion multi-token (MTP) fusionada desde el modelo asistente de Google, lo que habilita decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen), con cabeza MTP |
| Parametros totales | 26.225.647.442 (26,23B) |
| Parametros activos | 3,8B (segun model card del base) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ2.5e (mixta: affine 2-bit, 3-bit, 8-bit grupo 64 y BF16); media efectiva 3,600 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la Gemma 4 license de Google) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Gemma 4 de Google DeepMind. Segun la model card del autor, cuenta con 25,2B parametros totales y 3,8B activos por token, e incorpora un codificador de vision para entrada image-text-to-text. El checkpoint cuantizado conserva tres componentes: el backbone de lenguaje (25,233B parametros logicos), el codificador de vision (0,573B) y una cabeza de prediccion multi-token (MTP, 0,420B) fusionada desde google/gemma-4-26B-A4B-it-assistant.

La cuantizacion oQ2.5e, implementada en oMLX 0.8.0, asigna bits por sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y un reajuste de escala y sesgo por minimos cuadrados ponderados. La distribucion resultante es: 21,823B pesos en affine 2-bit (83,2%), 1,015B en 3-bit (3,9%), 2,387B en 8-bit (9,1%) y 1,001B en BF16 (3,8%). No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si se aplico RLHF/DPO; esos detalles corresponden a la model card de Google, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal (entrada de texto e imagen).
- Modos de razonamiento configurables (thinking modes) segun la model card del base.
- Procesamiento de imagenes mediante codificador de vision dedicado.
- Contexto largo de 256K tokens para conversaciones multi-turno y documentos extensos.
- Decodificacion especulativa mediante la cabeza MTP fusionada.
- Inferencia en Apple Silicon gracias al formato MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no listados).

## Casos de uso

- Asistente documental de contexto largo: con 256K tokens de ventana, el modelo puede ingerir informes, contratos o bases de conocimiento completas y responder preguntas sobre ellos en una sola pasada, sin troceado.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, permite extraer informacion de capturas, diagramas o paginas escaneadas junto al texto circundante en un flujo unico.
- Desarrollo local en Mac: al estar en formato MLX y pesar 11,8 GB, se puede ejecutar en un Mac con memoria unificada suficiente para prototipar aplicaciones sin depender de GPU en la nube.
- Razonamiento asistido con thinking mode: util para tareas de analisis paso a paso (resolucion de problemas, planificacion) donde el modo de razonamiento configurable mejora la calidad de la respuesta.
- Generacion aumentada por recuperacion (RAG) en local: el contexto de 256K permite concatenar muchos fragmentos recuperados y reducir la perdida de informacion entre trozos.
- Chatbot conversacional multi-turno: el pipeline conversational y la ventana amplia permiten mantener historiales largos sin truncamiento agresivo.
- Decodificacion especulativa acelerada: la cabeza MTP fusionada puede emplearse para acelerar la generacion en despliegues MLX, reduciendo latencia en produccion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 11,8 GB de pesos mas overhead de KV cache; con 256K de contexto el consumo de cache crece de forma significativa y debe presupuestarse aparte.
- Hardware objetivo: Apple Silicon con memoria unificada (formato MLX); se recomienda al menos 16-24 GB de memoria unificada para contexto moderado y 32 GB o mas para contextos largos.
- GPU CUDA (A100, H100, RTX 4090): no aplicable directamente, ya que el checkpoint esta en formato MLX y no en GGUF ni en safetensors estandar para transformers.
- Cabe en GPU de consumo: si, en Mac con memoria unificada suficiente; no se confirma compatibilidad con GPUs NVIDIA consumer en este formato.
- Opciones de despliegue: MLX (oMLX); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-26B-A4B-it-oQ2.5e-mtp | 26,23B totales / 3,8B activos | 256K | MLX safetensors | Apache-2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (base) | 25,2B totales / 3,8B activos | 256K | safetensors (BF16) | Gemma 4 license | Hugging Face |
| google/gemma-4-26B-A4B-it-assistant | no disponible | no disponible | safetensors | Gemma 4 license | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits en la mayoria de capas (83,2% de los pesos en affine 2-bit) introduce perdida de precision respecto al modelo base; la model card indica que el redondeo oQe reduce el error, pero no elimina la degradacion.
- Riesgo de alucinacion inherente a los modelos generativos; no se dispone de datos de evaluacion de fidelidad en esta variante cuantizada.
- Idiomas soportados no documentados en la informacion disponible; conviene verificar el comportamiento multilingue antes de usarlo en produccion.
- La licencia Apache-2.0 del checkpoint remite a la Gemma 4 license de Google, que puede imponer condiciones adicionales de uso comercial; es necesario revisar ese documento.
- El checkpoint esta en formato MLX y orientado a Apple Silicon; no es directamente desplegable en stacks CUDA habituales sin conversion.
- El consumo de memoria del KV cache con 256K de contexto puede superar la capacidad de equipos con menos de 32 GB de memoria unificada.
- No se han publicado benchmarks para esta variante, por lo que su rendimiento real frente al base no esta cuantificado en la informacion disponible.
- Compatibilidad con tool calling y function calling no confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-26B-A4B-it-oQ2.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo asistente (MTP): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
