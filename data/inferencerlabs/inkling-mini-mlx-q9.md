# inferencerlabs/Inkling-Mini-MLX-Q9

## Resumen

Inkling-Mini-MLX-Q9 es una cuantización de 9 bits del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines y redistribuido por Inferencer Labs en formato MLX para su ejecución en hardware Apple Silicon. Se trata de un modelo de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera respuestas conversacionales en inglés. El repositorio ocupa 18,4 GB y emplea la librería MLX, lo que lo orienta específicamente al ecosistema de chips M-series de Apple.

El modelo base, thinkingmachines/Inkling-2-Mini, no está documentado en la información disponible más allá de su identificador y su carácter multimodal. La ficha del reparto cuantizado indica que se repackaron los pesos ya cuantizados y se cuantizaron las capas restantes a 9 bits con una versión modificada de MLX, con el objetivo declarado de lograr una calidad "casi sin pérdida" respecto al original. No se especifican parámetros totales, longitud de contexto ni composición del dataset de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local en Mac para un modelo multimodal; por otro, evidencia las limitaciones de información de muchos repacks de la comunidad, donde los datos técnicos del modelo original no se reproducen y deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 9 bits (Q9), pesos repackados y capas restantes cuantizadas con MLX modificado |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini: no se especifica si es un transformer denso, un mixture-of-experts, un modelo híbrido ni sus dimensiones. La única información arquitectónica disponible es la del proceso de cuantización: el repack parte de pesos ya cuantizados del modelo original y aplica cuantización a 9 bits sobre las capas restantes mediante una versión modificada de MLX, empaquetando el resultado en safetensors para su carga con la librería MLX.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. La model card menciona soporte de MTP (Multi-Token Prediction) activable desde los controles de inferencia de la aplicación Inferencer, lo que sugiere que el modelo base incorpora decodificación especulativa o predicción multi-token, pero no se detalla su implementación.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text): el modelo acepta imágenes junto con texto y genera respuestas.
- Conversación multi-turno (tag "conversational").
- Soporte de MTP (Multi-Token Prediction) para acelerar la decodificación, activable en la aplicación Inferencer v2.5.4.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, modo thinking, audio ni otras capacidades especiales.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo puede recibir una imagen y generar una descripción o responder preguntas sobre ella, ejecutándose íntegramente en un Mac con Apple Silicon sin conexión a servicios externos.
- Asistente conversacional de escritorio: integrado en la aplicación Inferencer, permite mantener diálogos multi-turno con contexto visual, útil para prototipado rápido en entornos macOS.
- Extracción de información de documentos escaneados: al combinar visión y texto, puede transcribir o resumir contenido de capturas y documentos, siempre que el caso de uso tolere la ausencia de garantías de licencia.
- Evaluación de modelos multimodales en hardware consumer: sirve como banco de pruebas para medir rendimiento de inferencia MLX en chips M3 Ultra, con cifras de referencia de ~31 tokens/s y 16,5 GiB de memoria.
- Prototipado de aplicaciones de accesibilidad: descripción de imágenes para usuarios con discapacidad visual en un entorno local y privado.
- Investigación sobre cuantización: el repack a 9 bits permite estudiar la pérdida de calidad frente al modelo original en tareas imagen-texto, comparando salidas entre ambas versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son medidas de inferencia del autor del repack:

| Configuracion | Throughput | Memoria |
|---|---|---|
| M3 Ultra, 500 tokens | ~31 tokens/s | ~16,5 GiB |
| M3 Ultra con MTP, 500 tokens (coding) | ~37 tokens/s | ~17,1 GiB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16,5 GiB en inferencia estándar y ~17,1 GiB con MTP activado, según las mediciones del autor en un M3 Ultra.
- Hardware de referencia: Apple M3 Ultra (memoria unificada); no se documentan pruebas en otras GPU.
- GPU consumer: al ser un formato MLX, está pensado para Apple Silicon; no se indica compatibilidad con GPU NVIDIA o AMD.
- Memoria mínima práctica: se recomienda al menos 24 GB de memoria unificada para dejar margen al sistema, aunque el autor no lo especifica.
- Opciones de despliegue: librería MLX y la aplicación Inferencer v2.5.4 (probado con esa versión); no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~31 tokens/s sin MTP y ~37 tokens/s con MTP en M3 Ultra para 500 tokens.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base (thinkingmachines/Inkling-2-Mini) sería la referencia natural, pero sus especificaciones no están disponibles en esta ficha. Tampoco se documentan alternativas multimodales de la comunidad con cuantización MLX Q9 para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-Mini-MLX-Q9 | no disponible | no disponible | no disponible | safetensors (MLX, 9 bits) |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: no cuantificado; la model card del repack incluye un descargo de responsabilidad explícito sobre posibles inexactitudes en el contenido generado.
- Limitaciones de idioma: el modelo declara únicamente inglés ("en"); el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- Cuantización a 9 bits: aunque el autor la describe como "casi sin pérdida", no se aportan métricas comparativas que lo respalden; conviene validar la calidad frente al modelo original en la tarea concreta.
- Ecosistema restringido: el formato MLX limita el despliegue a hardware Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- Repack de terceros: Inferencer Labs no es el creador del modelo original y declina responsabilidad sobre exactitud o idoneidad contextual; la trazabilidad del proceso de cuantización depende de su documentación.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inferencerlabs/Inkling-Mini-MLX-Q9
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Vídeos de demostración: https://youtube.com/xcreate
- Aplicación Inferencer: https://inferencer.com
- Repositorio MLX: https://github.com/ml-explore/mlx
