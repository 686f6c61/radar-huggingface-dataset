# hanzoai/zen6-nano-4b-mlx

## Resumen

Zen 6 Nano (4B) es un modelo multimodal de tipo image-text-to-text publicado por Hanzo AI en colaboración con Zen LM, distribuido en formato MLX nativo para Apple Silicon. Se trata de la variante cuantizada a 2 bits con esquema afín y transformada de Hadamard de un modelo base de 4B parámetros, entrenado con cuantización ternaria durante el post-entrenamiento (STE QAT). El checkpoint incluye además una torre de visión en FP16, lo que lo convierte en un modelo capaz de procesar imagen y texto de forma conjunta.

El modelo resuelve el problema de desplegar un asistente multimodal con capacidades agénticas en hardware de consumo Apple (M1, M2, M3, M4 Max), sin necesidad de GPUs dedicadas. Incorpora soporte explícito de MCP (Model Context Protocol) mediante etiquetas `<tool_call>`, orientado a flujos de agentes y llamadas a herramientas. Su relevancia actual radica en la combinación de cuantización extrema (2 bits ternarios) con multimodalidad y tool calling en un único artefacto optimizado para MLX.

El repositorio ocupa 2,0 GB y contiene 4.540.042.240 parámetros totales según los safetensors. La licencia es Apache-2.0. No se han publicado datos sobre composición del dataset de entrenamiento, número de tokens ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión FP16; cuantización ternaria afín con transformada de Hadamard (STE QAT) |
| Parametros totales | 4.540.042.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit afín con Hadamard (ternario); torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con directorio `runtime/` para carga |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer multimodal con una torre de visión en FP16 y un cuerpo de lenguaje cuantizado a 2 bits mediante un esquema afín con transformada de Hadamard. El proceso de cuantización se aplicó durante el post-entrenamiento con Straight-Through Estimator (STE QAT), lo que permite que los pesos ternarios conserven el comportamiento del modelo original. El checkpoint incluye un directorio `runtime/` con lógica específica para el manejo de la base de Hadamard.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica la arquitectura exacta del backbone (número de capas, dimensiones ocultas, mecanismo de atención) más allá de la referencia al identificador `prism_hadamard_qwen35` en las etiquetas, que sugiere una base derivada de la familia Qwen. El modelo incorpora capacidades agénticas mediante el formato `<tool_call>` compatible con MCP.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Soporte de tool calling mediante etiquetas `<tool_call>` y el protocolo MCP.
- Capacidades agénticas orientadas a flujos multi-paso con invocación de herramientas.
- Identidad de modelo configurada (Zen 6) según la model card.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local en Mac con soporte de herramientas: el modelo puede ejecutarse íntegramente en Apple Silicon y gestionar llamadas MCP para consultar APIs, ficheros o servicios locales, sin enviar datos a la nube.
- Análisis de capturas y documentos escaneados: la torre de visión en FP16 permite extraer información de imágenes y combinarla con razonamiento textual en un mismo turno.
- Automatización de flujos agénticos en el escritorio: con soporte de `<tool_call>`, se puede integrar en orquestadores de agentes que encadenen varias herramientas (lectura de ficheros, ejecución de comandos, consultas a bases de datos) en un solo diálogo.
- Prototipado rápido de aplicaciones multimodales en MLX: al estar empaquetado con `runtime/` y `quickstart.py`, sirve para validar pipelines de visión y lenguaje en hardware Apple antes de escalar a GPUs.
- Asistente de accesibilidad en dispositivo: descripción de imágenes y respuesta a preguntas sobre contenido visual en tiempo real, con latencia baja al residir el modelo localmente.
- Experimentación con cuantización ternaria: útil para investigadores que quieran evaluar el impacto del esquema Hadamard + STE QAT en tareas multimodales y de tool calling.
- Chatbot de soporte técnico con contexto visual: el usuario puede adjuntar una captura de error y el modelo razona sobre ella invocando herramientas de diagnóstico mediante MCP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 2,0 GB, por lo que la inferencia requiere aproximadamente 2-3 GB de memoria unificada, dependiendo del overhead del runtime MLX y del contexto.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 Max según la model card). No está pensado para GPUs NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip de la serie M; los modelos con 8 GB de memoria unificada o más deberían ser suficientes.
- Opciones de despliegue: MLX con el runtime incluido (`runtime/vision_artifact.py`, `quickstart.py`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Zen 6 Nano 4B MLX (este) | 4,54B | no disponible | Sí (visión) | 2-bit ternario + Hadamard | Apache-2.0 | Apple Silicon (MLX) |
| Qwen2.5-VL 3B | ~3,75B | 32k (típico en la familia) | Sí | FP16/BF16, GGUF, AWQ | Apache-2.0 | Multiplataforma |
| Phi-3.5-vision | ~4,2B | 128k | Sí | FP16, INT4 | MIT | Multiplataforma |
| Llama 3.2 3B Vision | ~3,2B | 128k | Sí | FP16, GGUF | Llama 3.2 Community | Multiplataforma |

Nota: los datos de los modelos comparativos corresponden a especificaciones públicas de sus familias; no se dispone de resultados de benchmarks del modelo evaluado para comparar rendimiento de forma empírica.

## Limitaciones y advertencias

- Solo se ejecuta en Apple Silicon mediante MLX; no es portable a CUDA ni a otros runtimes sin conversión adicional.
- La cuantización a 2 bits ternarios puede degradar la calidad en tareas de razonamiento complejo o generación long-form; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- No se especifican idiomas soportados ni cobertura multilingüe; el comportamiento fuera del inglés es incierto.
- No se ha publicado la longitud de contexto, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a modelos de 4B parámetros; en producción conviene validar las salidas y las llamadas a herramientas.
- El formato `<tool_call>` requiere un parser compatible en el orquestador; un manejo incorrecto puede provocar invocaciones mal formadas.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se deben preservar los avisos del fichero `NOTICE`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hanzoai/zen6-nano-4b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
