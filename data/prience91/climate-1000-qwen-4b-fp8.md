# Prience91/Climate-1000-Qwen-4b-FP8

## Resumen

Climate-1000-Qwen-4b-FP8 es una cuantizacion FP8 del modelo Climate-1000-Qwen-4b, un ajuste fino supervisado (SFT) del Qwen3.5-4B orientado a dominio climatico. Lo publica el usuario Prience91 en Hugging Face y esta pensado para reducir el coste de memoria y de ancho de banda en inferencia sin reentrenar el modelo original, que se conserva en BF16. La cuantizacion emplea el formato compressed-tensors FP8_DYNAMIC W8A8, con pesos FP8 E4M3 simetricos por canal y activaciones FP8 dinamicas por token, siguiendo la receta de RedHatAI para Qwen3.5-4B.

El modelo base tiene 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y una arquitectura hibrida que combina proyecciones de atencion lineal GatedDeltaNet con atencion completa y capas MLP. El export publicado sirve solo texto: los pesos de vision del modelo original no se incluyen. El repositorio ocupa 5,9 GB y los pesos almacenados suman 5.854.598.128 bytes, un 30,40 % menos que los 8.411.558.304 bytes del BF16 original.

Su relevancia practica es doble: por un lado demuestra un flujo de cuantizacion data-free (sin ejemplos de calibracion) sobre una arquitectura hibrida poco habitual, preservando en BF16 los componentes sensibles (proyecciones GatedDeltaNet, embeddings, cabeza de salida y cache KV); por otro, ofrece un artefacto listo para desplegar con vLLM en GPUs de gama media, validado en una NVIDIA GB10 con un presupuesto de memoria de 20 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GatedDeltaNet y atencion completa (Qwen3.5) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la configuracion de validacion usa max-model-len 16384 |
| Tipos de cuantizacion | FP8_DYNAMIC W8A8 (pesos E4M3 por canal, activaciones dinamicas por token); componentes excluidos en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Modelo base | Prience91/Climate-1000-Qwen-4b (commit b9146c78c4a30009a0eabd4ac89fdc0e15cc90ef, checkpoint SFT 230) |
| Upstream | Qwen/Qwen3.5-4B |
| Tamano del repo | 5,9 GB |
| Pesos almacenados | 5.854.598.128 bytes (frente a 8.411.558.304 en BF16) |
| Modadalidades servidas | texto (vision no incluida) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B: un transformer hibrido que intercala proyecciones de atencion lineal GatedDeltaNet con capas de atencion completa y bloques MLP. El modelo base Climate-1000-Qwen-4b resulta de un ajuste fino supervisado (SFT) sobre esa arquitectura con un dataset de dominio climatico, seguido de un merge de pesos; el checkpoint publicado corresponde al paso 230 del SFT. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica de esta ficha es la cuantizacion. Se aplica compressed-tensors FP8_DYNAMIC sobre 128 matrices de proyeccion de MLP y de atencion completa, con pesos simetricos estaticos por canal y activaciones dinamicas por token. Quedan fuera de la cuantizacion las proyecciones de atencion lineal GatedDeltaNet, los embeddings, la cabeza de salida y otros parametros excluidos: los 298 tensores excluidos coinciden exactamente con el modelo fuente en BF16. La cache KV tambien se mantiene en BF16. El proceso es data-free (sin ejemplos de calibracion ni referencias held-out) y conserva el modelo BF16 original. El ahorro de almacenamiento es del 30,40 %, por debajo del 50 % teorico, precisamente por preservar en BF16 los componentes sensibles del hibrido. La validacion se realizo con vLLM 0.26.0 sobre NVIDIA GB10 usando el kernel CutlassFP8ScaledMMLinearKernel, con torch 2.11.0, transformers 5.15.1, llmcompressor 0.12.0.1 y compressed-tensors 0.17.0.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `enable_thinking`.
- Respuestas de dominio climatico: el ajuste SFT esta orientado a contenido climatico y la validacion incluyo una respuesta sintetica basada en evidencias con hechos y citas esperadas.
- Razonamiento basado en evidencias y citas: la prueba de humo sintetica verifica la presencia de hechos y referencias concretas.
- Soporte de tool calling y function calling: no documentado en la model card; al heredar la arquitectura Qwen3.5 es plausible, pero no esta validado en este export.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni validadas.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking: el modelo base Qwen3.5 lo soporta; en la validacion se desactivo explicitamente con `chat_template_kwargs={"enable_thinking": false}`.
- Vision: no disponible en este export (los pesos de vision no se incluyen).
- Audio: no disponible.

## Casos de uso

- Asistente climatico conversacional: el modelo puede mantener dialogos multi-turno en ingles sobre climatologia, emisiones o politicas climaticas, con respuestas fundamentadas y citas, adecuado por su ajuste SFT especifico de dominio.
- Consulta de informes y sintesis de evidencias: util para resumir documentacion climatica y generar respuestas con referencias, como demuestra la prueba de humo con hechos y citas.
- Servicio de inferencia de bajo coste en GPU de gama media: con 5,67 GiB de memoria de carga y 13,08 GiB de cache KV disponible en la validacion sobre GB10, encaja en presupuestos de 20 GiB y permite servir peticiones con `--max-num-seqs 2` y `--max-num-batched-tokens 8192`.
- Backend de chatbot con vLLM: el export incluye un `config.json` de wrapper condicional para generacion de texto y una receta de servicio vLLM lista para usar con `--quantization compressed-tensors` y `--language-model-only`.
- Prototipado de pipelines RAG climaticos: la ventana de 16.384 tokens configurada en la validacion permite inyectar varios fragmentos de documentos y mantener contexto suficiente para respuestas con citas.
- Evaluacion comparativa de cuantizacion FP8 en arquitecturas hibridas: el repositorio incluye `validation_report.json`, `quantization_recipe.json`, `publication_manifest.json` y `SHA256SUMS`, lo que facilita reproducir y auditar el proceso.
- Despliegue con cache de prefijos y chunked prefill: las opciones `--enable-prefix-caching` y `--enable-chunked-prefill` de la configuracion validada lo hacen adecuado para cargas con prompts repetidos o largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta dos pruebas de humo cualitativas (una respuesta exacta de disponibilidad y una respuesta sintetica con hechos y citas) y advierte explicitamente que no se ha realizado evaluacion cientifica held-out sobre la copia FP8 ni se ha establecido equivalencia con el BF16.

Datos de memoria reportados en la validacion (NVIDIA GB10, vLLM 0.26.0):

| Metrica | Valor |
|---|---|
| Memoria de carga del modelo | 5,67 GiB |
| Memoria de cache KV disponible | 13,08 GiB |
| Presupuesto del ejecutor | 20 GiB |
| `--gpu-memory-utilization` validado | 0,1643529249346053 |
| Pesos almacenados (repo) | 5.854.598.128 bytes |
| Reduccion frente a BF16 | 30,40 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,67 GiB solo para cargar el modelo; el total de inferencia incluye activaciones y sobrecarga del runtime, por lo que conviene reservar al menos 20 GiB de presupuesto de ejecutor como en la validacion.
- GPU recomendadas: NVIDIA GB10 (validada), y por compatibilidad de kernels FP8 en vLLM, GPUs con soporte FP8 como H100, H200, L40S o RTX 4090/5090 (no validadas en la model card).
- Cabe en GPU consumer: si, en GPUs con soporte FP8 nativo y al menos 20 GiB de memoria; en GPUs sin FP8 nativo el kernel puede degradar o no estar disponible.
- Opciones de despliegue: vLLM 0.26.0 con `--quantization compressed-tensors` es la via validada; transformers 5.15.1 carga el modelo, pero no se documenta el rendimiento en ese backend. llama.cpp, Ollama y TGI no estan documentados para este export.
- Latencia y throughput: no disponibles; la model card no reporta metricas de latencia ni tokens por segundo.
- Nota sobre el kernel: la validacion uso `CutlassFP8ScaledMMLinearKernel`; otros kernels FP8 pueden requerir ajustes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climate-1000-Qwen-4b-FP8 (este) | ~4,2 B | no disponible (validado a 16.384) | FP8_DYNAMIC W8A8 + BF16 parcial | Apache 2.0 | Hugging Face, safetensors, vLLM |
| Prience91/Climate-1000-Qwen-4b (BF16) | ~4,2 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | BF16 y otras | no disponible | Hugging Face |
| RedHatAI/Qwen3.5-4B-FP8-dynamic | ~4 B | no disponible | FP8_DYNAMIC W8A8 | no disponible | Hugging Face |

La comparativa se limita a parametros, licencia y formato; no hay datos de rendimiento publicados para ninguno de los modelos en la informacion disponible, por lo que no se puede establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- No se ha realizado evaluacion cientifica held-out sobre esta copia FP8; la equivalencia con el modelo BF16 no esta establecida.
- Solo se sirve texto: los pesos de vision del modelo original no estan incluidos, por lo que no admite entradas de imagen.
- Idioma limitado a ingles segun la model card; no se documenta soporte multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; la validacion solo comprueba dos respuestas de humo y no mide tasas de error.
- Sesgos: no documentados por el autor; el dataset SFT y su composicion no se describen.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo upstream Qwen3.5-4B, cuya licencia no se detalla en la informacion disponible.
- Las exclusiones de cuantizacion por regex deben mantenerse intactas: los nombres de modulo causal concretos no coinciden con los prefijos del runtime de generacion condicional, y alterarlas puede romper la carga.
- El `config.json` incluido es un wrapper condicional de solo texto; `causal_export_config.json` se conserva solo como procedencia.
- El valor de `--gpu-memory-utilization` validado corresponde a un presupuesto de 20 GiB en un GB10; debe ajustarse en otros dispositivos.
- No hay metricas de latencia ni throughput publicadas, lo que dificulta dimensionar despliegues en produccion.
- El modelo tiene 40 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prience91/Climate-1000-Qwen-4b-FP8
- Modelo base BF16: https://huggingface.co/Prience91/Climate-1000-Qwen-4b
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Receta de cuantizacion de referencia: https://huggingface.co/RedHatAI/Qwen3.5-4B-FP8-dynamic
- Repositorio de compressed-tensors: no disponible en la informacion proporcionada
- Repositorio de vLLM: no disponible en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
