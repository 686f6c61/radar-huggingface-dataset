# crw72/Qwen3.6-35B-A3B-oQ5h-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ5h-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario crw72 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del modelo base de Qwen, convertido al formato MLX y cuantizado con la herramienta oQ (oMLX v0.8.0) mediante una estrategia de precision mixta que combina capas en 5 bits, 8 bits, FP16, FP32 y U32. El objetivo es permitir la ejecucion del modelo en hardware Apple Silicon con un equilibrio entre calidad y huella de memoria.

El checkpoint resultante ocupa 27,1 GB en disco y declara 8.492.746.608 parametros reales en safetensors, un dato que conviene interpretar con cautela: el nombre del modelo sugiere una arquitectura MoE de 35B parametros totales con 3B activos, pero el recuento de parametros del repo corresponde a los pesos efectivamente almacenados tras la cuantizacion, no al total del modelo original. La model card desglosa el almacenamiento en tres componentes: el modelo de lenguaje (7,202B pesos logicos), la torre de vision (0,447B) y una cabeza MTP (0,845B), lo que confirma que el modelo base es multimodal y soporta decodificacion especulativa mediante multi-token prediction.

La relevancia de esta ficha radica en que documenta un artefacto de cuantizacion para MLX, una libreria orientada a inferencia en chips Apple (M1/M2/M3/M4). Es util para desarrolladores que quieran evaluar el modelo base en un Mac sin recurrir a GPUs NVIDIA, pero presenta limitaciones importantes: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin informacion sobre idiomas y sin model card detallada sobre el entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), multimodal con torre de vision y cabeza MTP |
| Parametros totales | 8.492.746.608 pesos logicos en el checkpoint cuantizado; el nombre indica 35B totales / 3B activos en el modelo base (no verificado en la informacion disponible) |
| Parametros activos | 3B segun el nombre del modelo (no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64, affine 8-bit grupo 128, affine 8-bit grupo 64, FP16, FP32, U32; media efectiva de 25,538 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es, segun la nomenclatura y la etiqueta `qwen3_5_moe`, un transformer con mezcla de expertos (MoE) de 35B parametros totales y 3B activos. La presencia de una torre de vision de 0,447B pesos logicos y de una cabeza MTP de 0,845B indica que el modelo original es multimodal (procesa imagen y texto) y que incorpora multi-token prediction, una tecnica que permite predecir varios tokens por paso y que suele emplearse para decodificacion especulativa o para acelerar la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta la innovacion concreta de atencion (si usa attention lineal, GQA, etc.) ni detalles del tokenizador. Lo unico verificable es el proceso de cuantizacion: oQ (oMLX v0.8.0) asigna precision distinta por tipo de tensor, dejando en U32 el 66,4% de los pesos logicos (20,996 GiB) y en FP32 el 5,3%, mientras que solo el 9,5% queda en 5 bits. Esto sugiere que la herramienta preserva en alta precision las capas mas sensibles (probablemente embeddings, normalizaciones y algunas proyecciones) y comprime agresivamente el resto.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones especificas en esta ficha.
- Procesamiento de vision: la presencia de una torre de vision de 0,447B pesos logicos confirma soporte multimodal de imagen, si bien no se detallan tareas concretas (VQA, OCR, captioning).
- Multi-token prediction: la cabeza MTP de 0,845B pesos permite decodificacion especulativa, lo que puede reducir la latencia en generacion autoregresiva.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repo esta vacio.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 27,1 GB, por lo que puede cargarse en Macs con 32 GB o 64 GB de memoria unificada. Es adecuado para prototipado offline de un modelo multimodal sin depender de servicios en la nube.
- Evaluacion comparativa de cuantizacion: util para investigadores que quieran medir la perdida de calidad de una cuantizacion mixta de 25,5 bits/peso frente al modelo base en FP16, especialmente en tareas de vision y generacion larga.
- Desarrollo de asistentes multimodales en escritorio: la torre de vision permite construir aplicaciones que reciban capturas de pantalla o imagenes y generen descripciones o respuestas, ejecutandose integramente en local.
- Aceleracion de generacion con MTP: la cabeza de multi-token prediction puede aprovecharse para implementar decodificacion especulativa en pipelines de MLX, reduciendo el numero de pasos por token generado.
- Pruebas de integracion con oMLX: el artefacto sirve como referencia para validar la toolchain oQ (oMLX v0.8.0) y reproducir el proceso de cuantizacion mixta sobre otros modelos Qwen.
- Investigacion sobre eficiencia de memoria: el desglose por formato (U32, FP32, FP16, 8-bit, 5-bit) permite estudiar que proporciones de precision mixta mantienen calidad aceptable en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 27,1 GB en disco; en MLX la carga requiere al menos esa cantidad de memoria unificada, por lo que se recomienda un Mac con 32 GB como minimo y 64 GB para margen en contexto largo.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: si, en Macs consumer con memoria unificada suficiente; no esta pensado para GPUs NVIDIA consumer.
- Opciones de despliegue: MLX (libreria `mlx`), oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que los pesos estan en safetensors MLX y no en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crw72/Qwen3.6-35B-A3B-oQ5h-fp16-mtp | 8,49B pesos logicos (35B/3B segun nombre) | no disponible | safetensors MLX | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos (segun nombre) | no disponible | safetensors | apache-2.0 (presumible) | Hugging Face |
| Otras cuantizaciones MLX del mismo base | no disponible | no disponible | safetensors MLX | apache-2.0 | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no modelo original: la calidad puede degradarse respecto al Qwen3.6-35B-A3B en FP16, especialmente en tareas sensibles a precision como matematicas o vision fina.
- Cero validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el checkpoint haya sido probado por terceros.
- Sin benchmarks: no se han publicado metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no se puede afirmar su rendimiento real.
- Idiomas no declarados: el campo de idiomas esta vacio; no se garantiza soporte multilingue mas alla del que ofrezca el modelo base.
- Dependencia de MLX: los pesos solo son utilizables en el ecosistema Apple; no hay conversion a GGUF ni a formatos CUDA documentada.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B, ya que las obligaciones de atribucion pueden recaer sobre el modelo original.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones especificas que lo cuantifiquen.
- Sesgos: no documentados en la informacion disponible.
- Fecha de creacion futura (2026-11-19): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crw72/Qwen3.6-35B-A3B-oQ5h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
