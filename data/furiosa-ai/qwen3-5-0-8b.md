# furiosa-ai/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo denso de visión-lenguaje de 873 millones de parámetros desarrollado por el equipo Qwen (Alibaba). Combina un codificador visual con un decodificador que alterna atención lineal Gated DeltaNet y atención completa, una arquitectura híbrida que busca reducir el coste computacional del contexto largo sin renunciar a la calidad del razonamiento. El repositorio analizado, `furiosa-ai/Qwen3.5-0.8B`, es una redistribución del checkpoint original de Qwen empaquetada con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM.

El modelo está pensado para cargas multimodales de bajo coste: comprensión de imágenes, razonamiento textual, generación de código y llamadas a herramientas, con un modo de pensamiento (`enable_thinking`) desactivado por defecto que puede activarse por petición. Su tamaño reducido lo hace apto para despliegues en el borde, entornos con presupuesto de memoria ajustado y escenarios de alta concurrencia donde un modelo mayor resultaría prohibitivo.

La relevancia de esta ficha radica en que documenta tanto el modelo base como su integración específica en hardware NPU de FuriosaAI, incluyendo la estrategia de paralelismo (tensor-parallel de 4 PEs, media tarjeta RNGD) y los parsers de razonamiento y tool calling que acompañan al despliegue. La licencia Apache 2.0 del checkpoint original facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 densa (`Qwen3_5ForConditionalGeneration`), decodificador con Gated DeltaNet (atención lineal) + atención completa, más codificador visual |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sin cuantización en este repositorio: pesos y activaciones en BF16, KV cache en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más FXB para FuriosaAI RNGD) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 en variante densa, implementada en la clase `Qwen3_5ForConditionalGeneration`. El decodificador combina capas de atención lineal Gated DeltaNet con capas de atención completa, un esquema híbrido que reduce el coste de atención en secuencias largas manteniendo la capacidad de recuperación exacta de contexto. El modelo incorpora además un codificador visual que procesa imágenes y las proyecta al espacio de embeddings del decodificador, lo que habilita entradas de tipo imagen + texto con salida exclusivamente textual.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO en la información proporcionada. Tampoco se documentan innovaciones adicionales como decodificación especulativa. El repositorio de FuriosaAI no modifica los pesos: redistribuye el checkpoint original en BF16 junto con un bundle ejecutable (FXB) compilado para el acelerador RNGD, que ejecuta el modelo con un tamaño de tensor-parallel de 4 PEs (la mitad de una tarjeta RNGD, que dispone de 8 PEs).

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat compatible con la API de OpenAI.
- Comprensión de imágenes: acepta mensajes multimodales con partes `image_url` (URL remota, base64 inline o ruta local `file://` con el flag `--allowed-local-media-path`).
- Razonamiento explícito opcional mediante `enable_thinking`; el modo pensamiento está desactivado por defecto y, al activarse, el razonamiento se separa de la respuesta final usando el parser `qwen3`.
- Tool calling / function calling mediante el parser `qwen3_coder` (alias `qwen3_xml`), que interpreta el formato XML de llamadas a herramientas del modelo.
- Soporte de agentes y razonamiento multi-paso a través de la combinación de thinking mode y tool calling en el servidor Furiosa-LLM.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Salida exclusivamente textual (la entrada puede ser imagen + texto).

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, fotos de productos o documentos escaneados, respondiendo en texto. Su tamaño de 0,8B permite desplegar varias réplicas concurrentes sobre media tarjeta RNGD cada una.
- **Descripción y etiquetado automático de imágenes**: integrable en pipelines de catalogación de contenido donde se necesita generar descripciones, alt-text o metadatos a partir de imágenes, con coste por inferencia muy bajo gracias al reducido número de parámetros.
- **Asistente de código con tool calling**: el soporte del parser `qwen3_coder` permite conectar el modelo a herramientas externas (ejecutores de tests, linters, APIs de repositorios) en flujos de CI/CD, delegando en el modelo la decisión de qué herramienta invocar y con qué argumentos.
- **Agentes de razonamiento multi-paso en el borde**: con `enable_thinking` activado por petición, el modelo puede abordar tareas que requieren descomposición explícita, útil en asistentes desplegados en infraestructura NPU de baja potencia donde no cabe un modelo mayor.
- **Extracción de información de documentos con imágenes**: procesamiento de facturas, formularios o tickets fotografiados para extraer campos estructurados, combinando la entrada visual con salida textual guiada por prompt.
- **Prototipado rápido y evaluación de pipelines**: al ser un modelo pequeño con licencia Apache 2.0 y API compatible con OpenAI, sirve para validar arquitecturas de agentes y flujos multimodales antes de escalar a modelos mayores, sin cambiar el código de cliente.
- **Moderación de contenido asistida por imagen**: clasificación y descripción de imágenes subidas por usuarios para detectar contenido inapropiado, con latencia baja al ejecutarse en media tarjeta por réplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con pesos en BF16 y 873M de parámetros, el checkpoint ocupa aproximadamente 1,75 GB; el repositorio completo pesa 2,2 GB. A ello hay que sumar la caché KV en 16 bits, cuyo tamaño depende de la longitud de contexto (no documentada).
- **GPU de referencia para el despliegue documentado**: FuriosaAI RNGD (NPU), con tensor-parallel de 4 PEs, es decir, media tarjeta por réplica.
- **GPUs convencionales**: el modelo también puede ejecutarse en vLLM, SGLang y Transformers según la model card del repositorio original; por su tamaño cabría en GPUs de consumo como RTX 4090 o RTX 3090 en BF16, aunque no se proporcionan cifras de rendimiento para esas configuraciones.
- **Opciones de despliegue**: Furiosa-LLM (`furiosa-llm serve furiosa-ai/Qwen3.5-0.8B --reasoning-parser qwen3`), vLLM, SGLang y Transformers. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: no disponibles. El servidor Furiosa-LLM expone una API compatible con OpenAI en el puerto 8000 y, sin `--devices`, lanza una réplica por cada grupo de 4 PEs disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 873M | no disponible | Imagen + texto → texto | Apache 2.0 | Denso, atención híbrida Gated DeltaNet, thinking opcional, tool calling |
| Qwen/Qwen3.5-0.8B (upstream) | 873M | no disponible | Imagen + texto → texto | Apache 2.0 | Checkpoint original; mismo modelo sin bundle FXB |
| Alternativas de ~1B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo pequeño entrenado sobre datos web, es esperable heredar sesgos de ese corpus, pero no hay evaluación publicada al respecto.
- **Alucinación**: no hay datos de evaluación de fidelidad factual; en modelos de este tamaño el riesgo de alucinación es habitualmente elevado, especialmente en tareas de conocimiento factual y razonamiento matemático.
- **Contexto e idiomas**: la longitud de contexto no está documentada en este repositorio, y los idiomas soportados tampoco; conviene verificar ambos en la model card del checkpoint original antes de asumir cobertura multilingüe.
- **Licencia**: Apache 2.0 permite uso comercial, pero el bundle FXB está vinculado al hardware FuriosaAI RNGD; para otros aceleradores debe usarse el checkpoint original.
- **Precisión fija**: este repositorio no ofrece cuantizaciones; solo BF16 con KV cache en 16 bits, lo que limita el ahorro de memoria frente a variantes GGUF/AWQ de otros modelos.
- **Campo `reasoning` no estándar**: la separación del razonamiento usa un campo `reasoning` que no forma parte de la especificación de la API de OpenAI; los clientes deben tolerar su ausencia (acceder a él cuando no existe lanza `AttributeError`).
- **Entradas soportadas**: Furiosa-LLM sirve actualmente solo entradas de texto e imagen para este modelo; no se documentan audio ni vídeo.
- **Madurez del repositorio**: con 5 descargas y 0 likes en el momento de la consulta, es un artefacto reciente con poca validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3.5-0.8B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI (hardware RNGD): https://furiosa.ai
