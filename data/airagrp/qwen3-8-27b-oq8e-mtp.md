# airagrp/Qwen3.8-27B-oQ8e-mtp

## Resumen

El modelo `airagrp/Qwen3.8-27B-oQ8e-mtp` es una cuantización de 8 bits del modelo Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión concreta ha sido generada por el usuario `airagrp` utilizando la herramienta oQ (oMLX v0.6.0rc1), que aplica cuantización de precisión mixta sobre el formato MLX, orientado principalmente a hardware Apple Silicon. El objetivo es reducir el tamaño del modelo para poder ejecutarlo en dispositivos con memoria limitada, manteniendo una buena fidelidad respecto al original.

Qwen3.8-27B es un modelo vision-language de última generación que soporta entrada de imágenes y vídeo, con una ventana de contexto nativa de 262 144 tokens y decodificación multi-token (MTP). Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte, con control configurable del razonamiento. Esta cuantización en 8 bits con group size 64 ofrece un equilibrio entre tamaño y calidad, siendo una opción práctica para desplegar el modelo en entornos con recursos moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con visión) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (segun fuentes web) |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ8e) |
| Idiomas soportados | No disponible (el modelo base es multilingue) |
| Licencia | Apache-2.0 (modelo base, segun fuentes web) |
| Formato de pesos | MLX safetensors |

Nota: el archivo safetensors del repositorio reporta 8 184 279 792 parametros, un valor inconsistente con los 27B del modelo base. Se trata probablemente de un error en la metadata de HuggingFace; el numero real de parametros del modelo original es 27B.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con capacidades multimodales (vision y lenguaje). Incorpora decodificacion multi-token (MTP), que permite predecir varios tokens a la vez durante la generacion, mejorando la velocidad de inferencia. Su arquitectura interna corresponde a la serie qwen3_5, que incluye atencion con ventana deslizante y mecanismos de razonamiento configurable (modo thinking opcional). El entrenamiento del modelo base no se detalla en la informacion disponible, pero se sabe que Alibaba ha utilizado datasets masivos y tecnicas de alineacion como RLHF y DPO en generaciones anteriores.

La cuantizacion oQ8e aplica 8 bits con group size 64 sobre los pesos del modelo, utilizando la libreria oMLX. Este metodo de precision mixta asigna diferentes niveles de cuantizacion a distintas capas segun su sensibilidad, lo que permite conservar mejor la calidad en comparacion con una cuantizacion uniforme. El resultado es un archivo en formato MLX safetensors, listo para cargarse con MLX en Apple Silicon.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento configurable (thinking mode) que permite activar o desactivar el razonamiento paso a paso.
- Comprension de imagenes y video, incluyendo captura de informacion visual y respuesta a preguntas sobre contenido multimedia.
- Generacion de codigo en multiples lenguajes, con soporte para tool calling y function calling, lo que permite integrarse en pipelines de desarrollo.
- Ejecucion de tareas agente de largo horizonte, con planificacion multi-paso y manejo de feedback del entorno.
- Capacidades multilingues (el modelo base soporta numerosos idiomas, aunque no se especifican en esta cuantizacion).
- Ventana de contexto de 262 144 tokens, adecuada para documentos extensos, conversaciones largas y analisis de grandes volumenes de informacion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262K tokens, manteniendo el historial completo de la interaccion y resolviendo consultas complejas con informacion visual si el usuario adjunta capturas o imagenes.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en entornos de desarrollo como asistentes de programacion, generando funciones, revisando codigo o autocompletando fragmentos en repositorios grandes.
- Analisis de documentos extensos: su contexto nativo de 262K tokens permite procesar informes, contratos o articulos cientificos completos, extrayendo datos relevantes y respondiendo preguntas sobre el contenido sin necesidad de dividir el texto.
- Agentes autonomos para automatizacion de tareas: el modelo puede planificar y ejecutar secuencias de acciones (navegar por APIs, consultar bases de datos, enviar correos) gracias a su capacidad de razonamiento multi-paso y manejo de feedback.
- Asistente de investigacion: combina lectura de papers (con graficos e imagenes) y generacion de resumenes, hipotesis o codigo de analisis, siendo util para cientificos e ingenieros.
- Procesamiento de video: al aceptar entradas de video, puede transcribir, resumir o extraer informacion de contenido audiovisual, por ejemplo para generar subtitulos o analisis de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion oQ8e en la informacion disponible. El modelo base Qwen3.8-27B ha sido evaluado por Alibaba en tareas como MMLU, HumanEval y GSM8K, pero esos datos no se incluyen en las fuentes consultadas. Por tanto, no se presentan cifras comparativas.

## Requisitos de hardware

- Tamano del repositorio: 30.0 GB, lo que indica que los pesos en 8 bits ocupan aproximadamente 30 GB. Para cargar el modelo en memoria se necesitan al menos 30 GB de VRAM o RAM unificada, mas overhead de activaciones y cache.
- En Apple Silicon: se requiere un Mac con al menos 32 GB de memoria unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). Con 32 GB puede ejecutarse, aunque con margen ajustado; 64 GB es mas comodo.
- En GPU NVIDIA: una RTX 4090 (24 GB) no es suficiente; se necesitan GPUs con 32 GB o mas, como A6000 (48 GB), A100 (40/80 GB) o H100 (80 GB). Tambien podria ejecutarse en multiples GPUs con distribucion de capas.
- En CPU: aunque el formato MLX esta pensado para Apple Silicon, es posible convertir los pesos a GGUF y usar llama.cpp, pero requeriria mucha RAM del sistema (mas de 40 GB) y la velocidad seria baja.
- Opciones de despliegue: MLX (nativo en Apple Silicon), vLLM (si se convierte a formato compatible), llama.cpp (tras conversion a GGUF), Ollama (si se publica una version GGUF).
- Latencia y throughput: no disponibles para esta cuantizacion especifica. El modelo base con MTP ofrece mejoras de velocidad, pero no hay mediciones publicadas para oQ8e.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache-2.0 | safetensors, GGUF, MLX |
| Qwen3.8-27B-oQ8e (este) | 27B (cuantizado 8-bit) | 262K | Si | Apache-2.0 (base) | MLX safetensors |
| Qwen2.5-27B | 27B | 128K | No | Apache-2.0 | safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 | safetensors, GGUF |

La comparativa se centra en el modelo base y alternativas de tamano similar. Qwen3.8-27B destaca por su contexto nativo de 262K y capacidades de vision, algo que Qwen2.5-27B no ofrece. Llama 3.1 8B es mucho mas pequeno y no es comparable en capacidades, pero se incluye como referencia de un modelo denso popular. No se dispone de datos de rendimiento para comparar numericamente.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede introducir una ligera degradacion en la calidad de las respuestas respecto al modelo original, especialmente en tareas de razonamiento complejo o generacion de codigo muy preciso.
- El modelo base puede presentar sesgos presentes en sus datos de entrenamiento, como sesgos de genero, raza o idioma. No se han realizado evaluaciones especificas para esta version cuantizada.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o cuando se le pide informacion muy especifica.
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento puede degradarse en los extremos de la ventana; se recomienda validar en casos de uso reales.
- La licencia Apache-2.0 del modelo base permite uso comercial, pero esta cuantizacion no especifica su propia licencia; se asume que hereda la del modelo original, aunque conviene verificar con el autor del repositorio.
- El formato MLX limita el despliegue a Apple Silicon; para otros entornos es necesario convertir los pesos, lo que puede requerir herramientas adicionales y tiempo de procesamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-oQ8e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Guia de ejecucion local (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guia completa de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
