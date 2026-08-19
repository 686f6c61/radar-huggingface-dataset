# google/gemma-4-E2B

## Resumen

Gemma 4 E2B es un modelo multimodal de código abierto desarrollado por Google DeepMind, publicado en marzo de 2026. Forma parte de la familia Gemma 4, que incluye cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B) con arquitecturas densas y de mezcla de expertos. El sufijo "E" indica "parámetros efectivos": el modelo declara 2.300 millones de parámetros efectivos, aunque el peso total en disco es de 5.123 millones de parámetros, debido al uso de embeddings por capa (Per-Layer Embeddings, PLE). Esta técnica permite una ejecución eficiente en dispositivos de borde, como teléfonos de gama alta y portátiles, manteniendo un rendimiento competitivo.

El modelo procesa texto, imagen y audio (este último de forma nativa en E2B, E4B y 12B) y genera texto. Dispone de una ventana de contexto de 128.000 tokens y soporta más de 140 idiomas. Incorpora un modo de razonamiento configurable (thinking mode), soporte nativo de function calling y del rol `system`, lo que lo hace adecuado para agentes autónomos y flujos de trabajo de razonamiento multi-paso. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño reducido lo hace desplegable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE) y atencion hibrida (sliding window + global) |
| Parametros totales | 5.123.178.051 (5,1B con embeddings; 2,3B efectivos) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; cuantizacion externa posible con herramientas como llama.cpp o AutoGPTQ) |
| Idiomas soportados | Mas de 140 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Gemma 4 E2B emplea una arquitectura de transformer decoder-only con una innovacion clave: Per-Layer Embeddings (PLE). En lugar de compartir una unica tabla de embeddings entre todas las capas, cada capa del decodificador posee su propia tabla de embeddings pequena para cada token. Estas tablas son grandes en memoria, pero se usan solo para busquedas rapidas, de ahi que el numero de parametros efectivos sea muy inferior al total. Esta tecnica maximiza la eficiencia de parametros en despliegues locales.

La atencion es hibrida: intercala ventanas deslizantes locales de 512 tokens con atencion global completa, garantizando que la ultima capa sea siempre global. Las capas globales comparten claves y valores (unified Keys and Values) y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos. El modelo incorpora encoders dedicados para vision (aproximadamente 150 millones de parametros) y audio (aproximadamente 300 millones de parametros) que preprocesan las entradas multimodales antes de pasarlas al LLM.

No se han publicado detalles especificos sobre el conjunto de datos de entrenamiento, el numero de tokens o las tecnicas de alineacion (RLHF, DPO, etc.) en la informacion disponible. La model card menciona que todos los modelos de Gemma 4 estan disenados como razonadores de alta capacidad con modos de pensamiento configurables, lo que sugiere un entrenamiento orientado a razonamiento explicito, aunque no se detalla el procedimiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento configurable (thinking mode).
- Comprension de imagenes con resolucion y relacion de aspecto variables.
- Procesamiento de audio de forma nativa (entrada de audio, salida de texto).
- Soporte nativo de function calling / tool calling para integracion con APIs y herramientas externas.
- Capacidades de agente autonomo: puede ejecutar tareas de multiples pasos y razonar sobre resultados intermedios.
- Soporte del rol `system` en las conversaciones, permitiendo instrucciones de sistema estructuradas.
- Multilingue: mas de 140 idiomas soportados.
- Optimizado para ejecucion en dispositivos de borde (moviles, portatiles) gracias a su tamano efectivo reducido.

## Casos de uso

- Atencion al cliente automatizada: con 128K tokens de contexto, puede gestionar conversaciones multi-turno extensas, recordar detalles de interacciones previas y responder en multiples idiomas. Su soporte de function calling permite conectarlo a sistemas CRM o bases de conocimiento.
- Asistente de codigo en local: puede generar, explicar y depurar codigo directamente en el equipo del desarrollador, sin necesidad de conexion a internet. Su modo de razonamiento ayuda a descomponer problemas de programacion complejos.
- Transcripcion y resumen de audio: al aceptar entrada de audio, puede transcribir reuniones, podcasts o notas de voz y generar resumenes estructurados en tiempo real, util en aplicaciones de productividad.
- Analisis de imagenes medicas o tecnicas: puede interpretar imagenes (radiografias, diagramas, capturas) y proporcionar descripciones o respuestas a preguntas sobre ellas, asistido por su encoder de vision.
- Agente de automatizacion de tareas: combinando function calling y razonamiento multi-paso, puede interactuar con APIs, rellenar formularios, consultar bases de datos y ejecutar flujos de trabajo de oficina de forma autonoma.
- Educacion y tutoria personalizada: su capacidad multilingue y su modo de razonamiento permiten explicar conceptos paso a paso, adaptarse al nivel del estudiante y responder preguntas en contextos largos, como cursos completos.
- Despliegue en dispositivos moviles: gracias a sus 2,3B parametros efectivos, puede ejecutarse en telefonos de gama alta con aceleracion por NPU, ofreciendo asistente personal offline con privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras notables en tareas de codificacion y capacidades de agente, pero no proporciona cifras concretas (MMLU, HumanEval, GSM8K, etc.) para Gemma 4 E2B. Se recomienda consultar el technical report (arxiv:2607.02770) cuando este disponible publicamente.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 5,1B parametros totales, una cuantizacion de 4 bits requeriria aproximadamente 3-4 GB de VRAM, mientras que en precision FP16 necesitaria alrededor de 10 GB. Estas son estimaciones orientativas basadas en el tamano del modelo; no se han publicado mediciones oficiales.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores. Para despliegue en servidor, una A10G o L4 seria suficiente.
- Cabe en GPUs de consumo: si, en cuantizacion 4 bits cabe en GPUs con 6 GB o mas (RTX 2060, RTX 3050, etc.). En FP16 requiere al menos 12 GB.
- Opciones de despliegue: al ser compatible con transformers y safetensors, puede servirse con vLLM, TGI, llama.cpp, Ollama o cualquier framework que soporte el formato. Para dispositivos moviles, Google ofrece LiteRT (antes TensorFlow Lite) con soporte especifico para Gemma 4.
- Latencia y throughput: no disponibles. Se espera una latencia baja en dispositivos de borde gracias a los parametros efectivos reducidos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de tamano similar (por ejemplo, Gemma 3 2B, Llama 3.2 3B o Qwen 2.5 3B) en la informacion proporcionada. La familia Gemma 4 incluye variantes mas grandes (E4B, 12B, 26B A4B, 31B) que ofrecen mayor capacidad a costa de mayores requisitos de hardware. Se recomienda consultar el technical report para comparaciones detalladas cuando este disponible.

## Limitaciones y advertencias

- Sesgos conocidos: como todo modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de genero presentes en los datos de entrenamiento. Google DeepMind afirma haber realizado evaluaciones de seguridad internas, pero no se detallan los resultados.
- Riesgo de alucinacion: el modelo puede generar informacion plausible pero incorrecta, especialmente en tareas de razonamiento complejo o cuando se le piden datos factuales no presentes en su entrenamiento. Se recomienda verificar las salidas en aplicaciones criticas.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento en contextos muy largos puede degradarse en tareas que requieren recuperacion precisa de informacion distante. La ventana deslizante de 512 tokens limita la atencion local, aunque las capas globales mitigan parcialmente este efecto.
- Limitaciones de idioma: aunque soporta mas de 140 idiomas, el rendimiento puede variar significativamente entre ellos, siendo generalmente mejor en ingles y otros idiomas con muchos datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no ofrece garantias ni soporte oficial. Los modelos Gemma 4 estan sujetos a la politica de uso aceptable de Google, que prohibe ciertos usos malintencionados.
- Consideraciones para produccion: al ser un modelo multimodal, el encoder de audio y vision anade latencia y requisitos de memoria adicionales. En despliegues de borde, es necesario evaluar el consumo energetico y la temperatura del dispositivo.

## Enlaces

- Hugging Face: https://huggingface.co/google/gemma-4-E2B
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Repositorio GitHub: https://github.com/google-gemma
- Model card de Google AI: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia de Google AI Edge (LiteRT): https://developers.google.com/edge/litert-lm/models/gemma-4
- Licencia Apache 2.0: https://ai.google.dev/gemma/docs/gemma_4_license
