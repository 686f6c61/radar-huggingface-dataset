# AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP

## Resumen

AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP es una conversión a MLX (Apple Silicon) del modelo multimodal Qwen3.8-27B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un modelo denso de 27,8 mil millones de parámetros que procesa texto, imágenes y vídeo, con una ventana de contexto de 262.144 tokens. Esta versión concreta está cuantizada a 3 bits y adaptada para ejecutarse de forma eficiente en hardware Apple mediante la librería MLX, lo que permite su uso local sin necesidad de API externa.

El modelo base fue liberado el 14 de agosto de 2026 bajo licencia Apache 2.0, y destaca en tareas de generación de código, flujos agénticos y automatización de oficina. La conversión de AtomicChat mantiene el pipeline image-text-to-text y está pensada para desarrolladores que quieran desplegar un asistente multimodal en entornos Apple con recursos limitados. Aunque el repositorio no especifica la licencia de esta conversión, el modelo original es de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (basado en Qwen3.5) |
| Parametros totales | 3.825.044.720 (segun safetensors del repo; el modelo base Qwen3.8-27B tiene 27,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (segun la web del modelo base) |
| Tipos de cuantizacion | 3-bit (este repo); tambien existe version 6-bit de AtomicChat |
| Idiomas soportados | ingles (segun el repo; el modelo base puede soportar mas) |
| Licencia | no disponible en el repo (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso construido sobre la arquitectura de Qwen3.5. Integra un codificador visual (CLIP) para procesar imagenes y video, junto con un decodificador de lenguaje autoregresivo. Segun la documentacion oficial, esta disenado para tareas de razonamiento complejo, generacion de codigo y ejecucion de flujos agénticos de largo alcance. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La version de AtomicChat aplica una cuantizacion de 3 bits sobre los pesos del modelo y los convierte al formato MLX, optimizado para los chips Apple Silicon (M1, M2, M3, M4). Esta conversion reduce el tamano del repositorio a 12,7 GB, lo que facilita su carga en memoria unificada de Macs con al menos 16 GB de RAM.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imagenes y video, generando respuestas textuales coherentes con el contenido visual.
- Generacion de codigo: segun la web oficial, el modelo base destaca en tareas de programacion, incluyendo generacion, explicacion y depuracion de codigo.
- Flujos agénticos: soporta razonamiento multi-paso y ejecucion de tareas complejas de forma autonoma, util para agentes conversacionales.
- Automatizacion de oficina: capaz de resumir documentos, redactar correos, extraer informacion de tablas y gestionar tareas administrativas.
- Contexto largo: con 262.144 tokens de ventana, puede mantener conversaciones extensas y procesar documentos largos o multiples imagenes en una sola pasada.
- Capacidad conversacional: disenado para dialogos multi-turno con memoria de contexto amplia.

## Casos de uso

- Asistente multimodal en Mac: un desarrollador puede integrar este modelo en una aplicacion local de Apple para responder preguntas sobre capturas de pantalla, diagramas o fotos, sin enviar datos a la nube.
- Generacion de codigo asistida: el modelo puede sugerir implementaciones completas, explicar fragmentos existentes o convertir pseudocodigo en Python, Java o JavaScript, aprovechando su entrenamiento en coding.
- Automatizacion de documentos de oficina: procesar facturas escaneadas, extraer datos de tablas en imagenes y generar resumenes ejecutivos, gracias a su capacidad de vision y texto.
- Agente de soporte tecnico: mantener conversaciones de ayuda con contexto largo, recordando interacciones previas y accediendo a manuales o documentacion extensa.
- Analisis de video educativo: recibir un video corto y generar una transcripcion resumida o responder preguntas sobre su contenido, util para formacion interna.
- Prototipado rapido de chatbots: al ser un modelo abierto y ejecutable localmente, permite crear demos de asistentes con capacidades multimodales sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta conversion concreta ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 3 bits, el modelo ocupa aproximadamente 12,7 GB en disco. En Apple Silicon, la memoria unificada debe ser de al menos 16 GB para cargar el modelo y dejar espacio para el sistema y el contexto.
- GPU recomendadas: no aplica GPU NVIDIA; esta version esta optimizada para Apple Silicon (M1 Pro, M2 Max, M3 Ultra, etc.). Para otros hardware, se necesitaria una conversion a otro formato (por ejemplo, GGUF).
- Compatibilidad con consumer GPU: no directamente, ya que MLX es exclusivo de Apple. En Macs con 16 GB de RAM unificada puede ejecutarse, aunque con contextos reducidos.
- Opciones de despliegue: MLX (libreria oficial de Apple), integrable en aplicaciones Swift o Python. No se menciona soporte para vLLM, llama.cpp u Ollama en este repo.
- Latencia y throughput: no disponible. Dependera del chip concreto (M1 vs M4) y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos multimodales de tamano similar (por ejemplo, Qwen2.5-VL-27B o Llama-3.2-Vision). El modelo base Qwen3.8-27B se posiciona como una alternativa densa de alto rendimiento, pero no hay datos de benchmarks publicados en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantizacion de 3 bits puede degradar la precision en tareas complejas de razonamiento o generacion de codigo en comparacion con el modelo original en precision completa.
- El repositorio no especifica la licencia de esta conversion; aunque el modelo base es Apache 2.0, es recomendable contactar con el autor antes de un uso comercial.
- El idioma declarado es solo ingles; no se garantiza un rendimiento optimo en otros idiomas, aunque el modelo base podria soportarlos.
- Al ser una version MLX, no es compatible con entornos CUDA; su uso queda restringido a hardware Apple.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta conversion; como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente con entradas ambiguas.
- El numero de parametros reportado en el safetensors (3,8B) no coincide con el tamano declarado del modelo base (27,8B); esto sugiere un posible error en la extraccion de metadatos o una conversion parcial, por lo que se recomienda verificar la integridad del modelo antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP
- Pagina del modelo en Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Repositorio oficial de Alibaba Cloud: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Version 6-bit de AtomicChat: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-6bit
