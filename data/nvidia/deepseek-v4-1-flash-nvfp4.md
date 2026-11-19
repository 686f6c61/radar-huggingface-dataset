# nvidia/DeepSeek-V4.1-Flash-NVFP4

## Resumen

NVIDIA DeepSeek-V4.1-Flash-NVFP4 es la versión cuantizada a NVFP4 (FP4 de NVIDIA) del modelo DeepSeek-V4.1-Flash desarrollado por DeepSeek AI. Se trata de un modelo de lenguaje autorregresivo de tipo Mixture-of-Experts (MoE) con arquitectura transformer, codificador-decodificador causal (CED) y atención dispersa comprimida de segunda generación (CSA2), diseñado para contextos de hasta un millón de tokens. NVIDIA se limita a publicar el checkpoint ya cuantizado con su herramienta Model Optimizer (nvidia-modelopt v0.47.0rc0), sin reentrenar el modelo base.

El modelo combina un backbone de 552 mil millones de parámetros (con 8 mil millones activados en prefill y 16 mil millones en decode) con 196 mil millones adicionales de memoria condicional Engram, lo que da un total de 763.205.315.794 parámetros almacenados en safetensors. El repositorio ocupa 632,1 GB y está pensado para despliegue en producción sobre hardware NVIDIA Blackwell, con soporte en vLLM y SGLang.

Su relevancia actual radica en que ofrece una alternativa pre-cuantizada de un modelo multimodal de frontera con licencia MIT, lo que elimina la necesidad de ejecutar un pipeline de cuantización propio y facilita el despliegue en sistemas de agentes, chatbots y RAG. La actualización del 14 de octubre de 2026 convierte las tablas de búsqueda Engram de FP8 a MXFP4, un cambio que exige una build de vLLM con soporte específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2); clase `DeepseekV41ForCausalLM` |
| Parametros totales | 763.205.315.794 (552B de backbone + 196B de memoria condicional Engram) |
| Parametros activos | 8B en prefill y 16B en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) para el checkpoint principal; tablas Engram en MXFP4; tags adicionales de 8-bit y FP8 en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería Model Optimizer) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo de tipo Mixture-of-Experts con arquitectura Causal Encoder-Decoder y atención dispersa comprimida de segunda generación (CSA2), lo que permite manejar ventanas de hasta un millón de tokens con un coste de atención reducido. El backbone suma 552B de parámetros, de los cuales solo se activan 8B durante el prefill y 16B durante el decode, mientras que los 196B restantes corresponden a la memoria condicional Engram, un mecanismo de tablas de búsqueda que actúa como memoria externa condicionada por el contexto. El modelo es nativamente multimodal: acepta texto e imágenes RGB y produce texto.

La cuantización la realiza NVIDIA con Model Optimizer v0.47.0rc0 sobre la revisión `dba1be0a40aa45a94ad051997016db3960a90277` del modelo original. El calibrado empleó 1.024 muestras (512 de `cnn_dailymail` y 512 de `Nemotron-Post-Training-Dataset-v2`, con los subconjuntos `stem`, `chat`, `math` y `code`), longitud de secuencia 512, batch size 4 y semilla 0. La revisión del 14 de octubre de 2026 convierte las tablas Engram de FP8 a MXFP4 manteniendo el resto del checkpoint sin cambios. No se dispone de información sobre los datos de entrenamiento originales de DeepSeek-V4.1-Flash (modalidad, recolección y etiquetado figuran como "undisclosed" en la model card).

## Capacidades

- Generación de texto autorregresiva con contexto de hasta un millón de tokens.
- Procesamiento de imágenes como entrada (pipeline `image-text-to-text`), con salida exclusivamente textual.
- Razonamiento multi-paso y soporte de tool calling / function calling, validado en SGLang mediante pruebas de carga, generación y parseo de razonamiento y llamadas a herramientas.
- Capacidades de agente para sistemas que requieren planificación y ejecución de acciones encadenadas.
- Memoria condicional Engram: tablas de búsqueda que aportan información recuperable condicionada por el contexto, orientadas a tareas de conocimiento factual y contexto largo.
- Capacidades multilingües: no disponible (la model card no detalla los idiomas soportados).
- Modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Sistemas de agentes autónomos: el modelo puede mantener estado a lo largo de conversaciones y cadenas de herramientas gracias a sus 8B/16B de parámetros activos y a la memoria Engram, lo que permite orquestar tareas multi-paso con un coste de cómputo por token contenido frente a un modelo denso de tamaño equivalente.
- RAG sobre documentación extensa: con 1M tokens de contexto se pueden inyectar corpus completos o historiales largos sin fragmentación agresiva, reduciendo la pérdida de información entre chunks.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y capacidad de invocar APIs internas mediante tool calling para consultar pedidos, estados o políticas.
- Análisis de documentos con imágenes: al aceptar entradas RGB además de texto, sirve para procesar informes escaneados, capturas de pantalla o diagramas junto con su texto asociado en un único flujo.
- Generación y revisión de código en pipelines de CI/CD: el soporte de function calling permite integrarlo en herramientas que ejecutan tests, consultan repositorios o aplican parches de forma automatizada.
- Despliegue en clústeres NVIDIA Blackwell: al estar pre-cuantizado en NVFP4, se puede servir con vLLM o SGLang sobre hardware Blackwell sin ejecutar un pipeline de cuantización propio, lo que simplifica la puesta en producción.
- Investigación sobre cuantización FP4: sirve como referencia para evaluar la degradación de calidad de NVFP4 frente al checkpoint original en tareas de razonamiento, matemáticas y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados de benchmark se obtuvieron con vLLM, pero no incluye la tabla de métricas en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 632,1 GB en safetensors; en NVFP4 se requiere aproximadamente esa cifra de memoria para cargar el checkpoint completo, sin margen para KV cache ni buffers de activación.
- GPU recomendadas: NVIDIA Blackwell (microarquitectura soportada oficialmente). Por el volumen de pesos, se necesita un nodo multi-GPU con GPUs Blackwell de alta capacidad (por ejemplo, B200 o GB200); no se dispone del número exacto de GPUs en la información proporcionada.
- GPU de consumo: no cabe en ninguna GPU consumer actual; 632 GB exceden con mucho los 24-48 GB de las RTX 4090/5090 y los 80-141 GB de las H100/H200.
- Opciones de despliegue: vLLM con soporte de Engram MXFP4 (requiere la build con el PR vllm-project/vllm#61530) y SGLang (solo con la revisión anterior `3431dde3247c13b5957f682b1e3c6fcae2566079`). Las imágenes estándar de vLLM, incluida `vllm/vllm-openai:deepseekv41-flash-0909`, no pueden cargar la revisión actual.
- Latencia y throughput: no disponible.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| NVIDIA DeepSeek-V4.1-Flash-NVFP4 | 763B totales (8B/16B activos + 196B Engram) | 1M | NVFP4 / MXFP4 | MIT | NVIDIA Blackwell |
| deepseek-ai/DeepSeek-V4.1-Flash | 552B backbone + 196B Engram | 1M | Original (FP8/BF16, no confirmado) | MIT | no disponible |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: inherente a los modelos generativos; la memoria Engram puede recuperar información incorrecta o desactualizada si las tablas no cubren el dominio.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad fuera de los idiomas cubiertos por el modelo base.
- Licencia MIT: permite uso comercial y modificación, pero NVIDIA advierte que el modelo no es de su propiedad y remite a la model card de DeepSeek AI para los términos aplicables al modelo original.
- Compatibilidad de despliegue: la revisión actual con Engram MXFP4 no carga en imágenes estándar de vLLM ni ha sido validada con SGLang; hay que fijar la revisión anterior o usar una build parcheada.
- Restricción de hardware: solo soportado en NVIDIA Blackwell; no hay soporte documentado para arquitecturas anteriores ni para CPU.
- Validación pendiente: la model card exige pruebas específicas del caso de uso antes de desplegar en producción, siguiendo la metodología V-model.
- Datos de entrenamiento no divulgados: impide auditar la composición del corpus y evaluar sesgos de origen.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR de vLLM para soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
