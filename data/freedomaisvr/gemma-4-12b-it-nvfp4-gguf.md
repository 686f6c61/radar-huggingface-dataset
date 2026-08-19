# FreedomAISVR/Gemma-4-12B-it-NVFP4-GGUF

## Resumen

Gemma-4-12B-it-NVFP4-GGUF es una cuantización en formato NVFP4 (Blackwell FP4) del modelo multimodal Gemma 4 12B It de Google, realizada por FreedomAISVR. El modelo base, `google/gemma-4-12B-it`, pertenece a la cuarta generación de la familia Gemma de Google DeepMind, diseñada para ofrecer un alto rendimiento por parámetro en tareas de razonamiento, agentes, codificación y comprensión multimodal. Esta versión cuantizada aprovecha los tensor cores FP4 nativos de las GPU Blackwell (RTX 50-series), eliminando por completo el paso de dequantización y logrando aproximadamente el doble de throughput en comparación con cuantizaciones INT4 bloqueadas como Q4_K_M.

El repositorio contiene dos archivos: el backbone de texto (48 capas transformer, 3840 dimensiones ocultas, contexto de 262 144 tokens) cuantizado a NVFP4 con un peso de 6,50 GB, y un proyector de visión SigLIP en F16 de 117 MB, necesario para la entrada de imágenes. La arquitectura emplea atención híbrida (40 capas de ventana deslizante intercaladas con 8 capas de atención completa), softcapping logit final y un codificador de visión ligero basado en SigLIP. El modelo está optimizado para chat y seguimiento de instrucciones, con licencia Apache 2.0 que permite uso comercial.

La relevancia de esta cuantización radica en que es la primera implementación práctica de NVFP4 en formato GGUF para un modelo de 12B, permitiendo ejecutar un modelo multimodal de alto rendimiento en GPUs de consumo como la RTX 5060 Ti con una calidad casi sin pérdida (PPL estimada +0,2–0,5 % frente a F16). Está pensada para desarrolladores que buscan desplegar modelos locales con baja latencia y alta velocidad en hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (40 capas sliding-window + 8 capas full attention) y encoder de vision SigLIP |
| Parametros totales | 11 907 350 576 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (texto, 4.68 BPW) y F16 (proyector de vision) |
| Idiomas soportados | Ingles (segun la model card; la familia Gemma 4 es multilingue segun Google) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: `gemma-4-12b-it-nvfp4.gguf` y `mmproj-gemma-4-12b-it-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B It emplea una arquitectura transformer de 48 capas con dimensiones ocultas de 3840 y tamaño intermedio de FFN de 15360. La atención es híbrida: 40 capas utilizan atención de ventana deslizante con ventana de 1024 tokens, 8 cabezas de clave/valor y dimensión de cabeza de 256, intercaladas en un patrón 5:1 con 8 capas de atención completa (2 cabezas KV, dimensión de cabeza 512). Se aplica escalado RoPE con frecuencias base separadas para ambos tipos de atención, y un softcapping logit final para estabilizar predicciones sobre el vocabulario extenso.

La parte visual utiliza un embedder SigLIP ligero (no un ViT completo) con incrustaciones posicionales aprendidas, que permite comprensión nativa de imágenes sin necesidad de un transformer de visión separado. El modelo está ajustado mediante instrucciones (instruction-tuned) para chat y seguimiento de instrucciones con el formato de turnos estructurado de Gemma 4. No se especifican en la documentación disponible los detalles del entrenamiento (número de tokens, composición del dataset o uso de RLHF/DPO). La cuantización NVFP4 convierte los pesos de atención y FFN a formato E4M3 (1 bit de signo, 4 de exponente, 3 de mantisa) manteniendo los tensores 1D (normas y escalas) en F32, con una relación de compresión de 3,66× frente al original F16.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta optimizado para tareas de chat, instrucciones y razonamiento complejo.
- Comprension de imagenes: el proyector SigLIP en F16 permite entrada de imagenes y descripcion, analisis de diagramas y OCR basico.
- Contexto largo: ventana de hasta 262 144 tokens, util para documentos extensos o conversaciones multi-turno.
- Soporte de agentes y codificacion: segun la documentacion de Google DeepMind, la familia Gemma 4 esta disenada para flujos de trabajo agente y generacion de codigo.
- Razonamiento estructurado: la model card menciona soporte para "thinking" o razonamiento estructurado (el texto se corta en la descripcion, pero se confirma la capacidad).
- Despliegue local eficiente: el formato NVFP4 permite inferencia rapida en GPU Blackwell con baja latencia.

## Casos de uso

- Asistente de chat local en GPU Blackwell: con una RTX 5060 Ti o superior, se puede ejecutar el modelo completo (texto + vision) con contexto de 8K tokens en tiempo real, ideal para aplicaciones de escritorio o servidores personales.
- Analisis de documentos con imagenes: gracias al contexto de 262K tokens y la vision nativa, puede resumir informes largos que incluyan graficos, tablas o capturas, manteniendo coherencia a lo largo de todo el documento.
- Generacion de codigo asistida: el modelo base esta entrenado para tareas de programacion; con la cuantizacion NVFP4 se puede integrar en editores de codigo o pipelines CI/CD para sugerencias y autocompletado con baja latencia.
- API de chat compatible con OpenAI: usando `llama-server`, se puede exponer un endpoint `/v1/chat/completions` que acepta imagenes y texto, permitiendo integrar el modelo en aplicaciones existentes sin cambiar la interfaz.
- Prototipado rapido con Python: mediante `llama-cpp-python`, los desarrolladores pueden cargar el modelo y el proyector de vision en pocas lineas de codigo para experimentar con capacidades multimodales en entornos de investigacion.
- Despliegue en entornos con restriccion de hardware: al ocupar solo 6,5 GB para el backbone, cabe en GPUs de consumo con 8 GB de VRAM (con contexto moderado), habilitando IA local en equipos sin acceso a servidores en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. La unica referencia de rendimiento es la comparativa de perplejidad estimada frente a F16: +0,2–0,5 % para NVFP4, frente a +0,3–0,6 % para Q4_K_M y +0,3–0,7 % para MXFP4. Tambien se indica que NVFP4 ofrece aproximadamente el doble de throughput que Q4_K_M en hardware Blackwell, pero no se proporcionan cifras absolutas.

## Requisitos de hardware

- GPU Blackwell obligatoria para aprovechar NVFP4: RTX 5060 Ti, RTX 5070, RTX 5090 (y equivalentes profesionales). En GPU pre-Blackwell, AMD o CPU, se recomienda usar otras cuantizaciones como Q4_K_M o MXFP4.
- VRAM estimada: el archivo de texto pesa 6,50 GB y el proyector de vision 117 MB. Con contexto de 8K tokens, se estima un uso total de 7–8 GB de VRAM. Para contexto maximo de 262K tokens, la memoria necesaria aumentaria considerablemente (no especificado).
- GPU recomendadas: RTX 5060 Ti (16 GB) para uso comodo, RTX 5090 para contexto largo o mayor velocidad.
- Opciones de despliegue: llama.cpp CLI, llama-server (API OpenAI-compatible), LM Studio, llama-cpp-python y Ollama (segun la busqueda web).
- Latencia y throughput: no se proporcionan cifras exactas. La cuantizacion tardo ~119 segundos en una RTX 5060 Ti, y se afirma que NVFP4 duplica el throughput de Q4_K_M en el mismo hardware.

## Comparativa con modelos similares

La comparativa mas directa es entre las distintas cuantizaciones del mismo modelo base, segun los datos de la model card:

| Caracteristica | NVFP4 (este repo) | Q4_K_M | MXFP4 |
|---|---|---|---|
| Formato numerico | E4M3 FP4 nativo | INT4 bloqueado | E2M1 microscaling |
| Tamano de bloque | 32 elementos | 32 elementos | 32 elementos |
| BPW efectivo | 4.68 | ~4.50 | 4.72 |
| Overhead de dequantizacion | Ninguno (tensor cores nativos) | Requerido en cada carga | Requerido en cada carga |
| Aceleracion por hardware | Blackwell (RTX 50-series) | CUDA cores / CPU | CUDA cores / CPU / AMD |
| Rango dinamico (max normal) | 448 | 7 (INT4 simetrico) | 30 |
| PPL vs F16 (estimado) | +0,2–0,5 % | +0,3–0,6 % | +0,3–0,7 % |

No se dispone de datos comparativos con otros modelos de 12B (p. ej., Llama 3.1 8B, Mistral 12B) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware Blackwell para aprovechar NVFP4; en otras arquitecturas el rendimiento sera muy inferior o el formato no sera soportado.
- Idioma: la model card indica solo ingles, aunque la documentacion de Google menciona capacidades multilingues para la familia Gemma 4. No se garantiza un rendimiento optimo en otros idiomas.
- Riesgo de alucinacion: como todo LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Contexto largo: aunque la ventana es de 262K tokens, en la practica el uso de contexto muy extenso puede degradar la calidad y aumentar los requisitos de memoria.
- Sesgos: no se especifican sesgos conocidos en la documentacion disponible, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se debe mantener la atribucion correspondiente.
- Para produccion: se recomienda validar el comportamiento del modelo en el dominio especifico antes de desplegarlo, dado que no hay benchmarks publicados para esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Pagina de Google DeepMind sobre Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Pagina de Ollama para gemma4:12b-nvfp4: https://ollama.com/library/gemma4:12b-nvfp4
