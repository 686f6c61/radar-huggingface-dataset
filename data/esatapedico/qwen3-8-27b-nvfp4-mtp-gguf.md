# esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-GGUF es una familia de cinco archivos GGUF del modelo Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros desarrollado por Alibaba/Qwen con arquitectura híbrida Gated DeltaNet + Gated Attention y soporte nativo de visión y vídeo. Este repositorio, creado por esatapedico, convierte la versión cuantizada NVFP4 de unsloth a formato GGUF para su uso con llama.cpp, incorporando el cabezal especulativo MTP (multi-token prediction) integrado en cada archivo, lo que elimina la necesidad de un modelo drafter separado.

La relevancia de este lanzamiento radica en que ofrece una escalera de precisión/tamaño para ejecutar un modelo de 27B con contexto nativo de 262.144 tokens en hardware Blackwell de consumo (sm_120). Los cinco archivos comparten un backbone NVFP4 de 448 tensores byte-idéntico y difieren solo en la precisión de los tensores extra (LM head, embeddings y cabezal MTP), permitiendo elegir entre 15,53 GB (LOW) y 33,13 GB (ORIG) según las necesidades de calidad y VRAM. El modelo es un VLM nativo, por lo que admite imágenes y vídeo mediante el proyector mmproj incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet + Gated Attention hybrid, 64 capas, dense 27B, VLM nativo (vision+video) |
| Parametros totales | 27B (dense, segun model card; el dato de safetensors del repo es 460M, probablemente error de extraccion) |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4, BF16, F32; variantes LOW/MEDIUM/HIGH/VERY-HIGH con precisiones mixtas en tensores extra |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con 64 capas que combina dos mecanismos de atencion: Gated DeltaNet (una variante de atencion lineal con compuertas) y Gated Attention clasica. Esta arquitectura hibrida permite manejar contextos de hasta 262.144 tokens de forma nativa. El modelo es ademas un VLM nativo, entrenado para procesar imagenes y video ademas de texto.

Este repositorio no contiene entrenamiento nuevo: es una conversion a GGUF del checkpoint cuantizado NVFP4 de unsloth (unsloth/Qwen3.8-27B-NVFP4). El proceso de conversion incluyo un pre-procesado para des-cuantizar los tensores F8 del checkpoint original a BF16 (porque GGML no soporta el tipo F8), manteniendo los tensores NVFP4 intactos. A partir del archivo ORIG resultante se generaron cuatro variantes adicionales re-cuantizando la atencion a NVFP4 y ajustando la precision de los tensores extra. El cabezal MTP (multi-token prediction) esta integrado en todos los archivos, permitiendo decodificacion especulativa sin drafter externo.

## Capacidades

- Generacion de texto y razonamiento en multiples idiomas (ingles y otros, segun el entrenamiento multilingue del modelo base).
- Comprension de vision: procesa imagenes y video de forma nativa mediante el proyector mmproj-BF16.gguf incluido.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos, conversaciones multi-turno y analisis de video.
- Decodificacion especulativa MTP integrada en cada archivo GGUF, activable en llama.cpp con `--spec-type draft-mtp`, que reduce la latencia de generacion.
- Soporte de cuantizacion NVFP4 nativa para hardware Blackwell (sm_120), optimizada para GPUs de la serie RTX 50.
- Capacidad de tool calling y function calling probablemente heredada del modelo base Qwen3.8, aunque no se documenta explicitamente en este repositorio.

## Casos de uso

- Asistentes de vision-lenguaje en edge: con el archivo LOW (15,53 GB) y una GPU Blackwell de 16 GB, se puede desplegar un asistente que analice imagenes y video en tiempo real, gracias al soporte VLM nativo y la decodificacion MTP para baja latencia.
- Procesamiento de documentos legales o academicos extensos: la ventana de 262.144 tokens permite ingerir contratos completos, tesis o expedientes sin truncar, manteniendo el contexto integro para tareas de resumen, extraccion de datos o respuesta a preguntas.
- Generacion de codigo en entornos de desarrollo: el modelo base Qwen3.8 es competente en tareas de programacion; con el archivo MEDIUM (16,38 GB) y MTP, se puede integrar en IDEs o pipelines de CI/CD para autocompletado y revision de codigo con baja latencia.
- Analisis de video para vigilancia o media: la capacidad de procesar video nativamente permite detectar eventos, transcribir dialogos o generar descripciones de secuencias largas, usando el archivo HIGH (17,57 GB) en un servidor con una GPU Blackwell de 24 GB.
- Chatbots multilingues de atencion al cliente: el contexto largo y el soporte multilingue permiten mantener conversaciones prolongadas con historial completo, usando el archivo VERY-HIGH (19,69 GB) para maxima calidad de respuesta.
- Investigacion en IA multimodal: al ser Apache-2.0 y ofrecer multiples niveles de cuantizacion, es util para experimentos de eficiencia, evaluacion de perdida de precision por cuantizacion y desarrollo de aplicaciones de vision-lenguaje sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni otros tests estandar. Se recomienda consultar la model card del modelo base Qwen/Qwen3.8-27B para datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: los archivos van de 15,53 GB (LOW) a 33,13 GB (ORIG). Con cuantizacion LOW o MEDIUM caben en una GPU de 16 GB; HIGH y VERY-HIGH requieren 20-24 GB; ORIG necesita al menos 34 GB o dos GPUs.
- GPU recomendadas: cualquier GPU Blackwell con sm_120 (serie RTX 50, B200, etc.) para aprovechar la cuantizacion NVFP4. El autor menciona un setup dual de 16 GB Blackwell, lo que sugiere que dos RTX 5090 o similares pueden ejecutar todos los niveles.
- No es compatible con GPUs de arquitecturas anteriores (Ampere, Ada Lovelace) para los tensores NVFP4; se necesitaria una conversion adicional a otros formatos de cuantizacion.
- Opciones de despliegue: llama.cpp es la unica herramienta mencionada explicitamente, con soporte para `--spec-type draft-mtp` y `--mmproj` para vision. Tambien podria usarse con otros backends compatibles con GGUF como Ollama o LM Studio, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos numericos. La decodificacion MTP deberia reducir la latencia respecto a generacion autoregresiva estandar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni comparaciones directas en la informacion proporcionada. El modelo mas comparable es el Qwen3.8-27B original sin cuantizar (Qwen/Qwen3.8-27B), que comparte arquitectura y capacidades pero requiere mucha mas VRAM (formato BF16, ~54 GB). Otras alternativas de 27B como Llama 3.1 8B o Mistral 7B son de menor tamano y no ofrecen vision nativa ni contexto de 262k. Se recomienda consultar benchmarks publicos de Qwen3.8-27B para una comparativa cuantitativa.

## Limitaciones y advertencias

- Los archivos LOW, MEDIUM, HIGH y VERY-HIGH re-cuantizan la atencion de BF16 (que a su vez provenia de F8) a NVFP4, lo que supone una doble cuantizacion y una perdida adicional de precision en los tensores de atencion respecto al checkpoint original. El archivo ORIG preserva la calidad de la atencion original a costa de un tamano mucho mayor.
- Requiere hardware Blackwell (sm_120) para ejecutar los tensores NVFP4; en GPUs antiguas no funcionara sin reconvertir los pesos a otros formatos.
- No se documentan sesgos especificos, pero al ser un modelo derivado de Qwen3.8, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion inherente a modelos de lenguaje de este tamano, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El dato de parametros totales del repositorio (460.730.096) contradice la model card (27B); probablemente es un error de extraccion de HuggingFace y no debe tomarse como referencia.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los pesos del modelo base Qwen3.8-27B tambien esten bajo la misma licencia (asi es, segun la model card).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base cuantizado (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF de unsloth (proyector de vision): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
