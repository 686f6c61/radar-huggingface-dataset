# renish1/UI-TARS-2B-SFT-Q4_K_M-GGUF

## Resumen

UI-TARS-2B-SFT-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo multimodal UI-TARS-2B-SFT, desarrollado originalmente por ByteDance-Seed. Se trata de un modelo de tipo image-text-to-text especializado en la interacción con interfaces gráficas de usuario (GUI), es decir, capaz de recibir capturas de pantalla junto con instrucciones en lenguaje natural y producir acciones o texto orientados a la automatización de tareas en entornos de escritorio y web. Esta versión concreta ha sido convertida por el usuario renish1 mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp.

El modelo base cuenta con aproximadamente 1.777 millones de parámetros (1,777 mil millones), lo que lo sitúa en la categoría de modelos pequeños y desplegables en hardware de consumo. La cuantización Q4_K_M reduce el peso a un tamaño de repositorio de 1,1 GB, lo que facilita su ejecución en equipos con recursos limitados mediante llama.cpp. La licencia del modelo base es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia de esta ficha radica en que permite evaluar rápidamente una alternativa ligera para agentes de automatización de GUI, un nicho en el que los modelos multimodales de gran tamaño suelen ser costosos de desplegar. Al estar en formato GGUF, se integra con el ecosistema de inferencia local (llama.cpp, Ollama y derivados), lo que lo hace atractivo para prototipado y despliegue en entornos con GPU modestas o incluso CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base multimodal image-text-to-text; no se detalla en la información proporcionada) |
| Parámetros totales | 1.777.088.000 (aprox. 1,78 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de llama-server usa `-c 2048`, pero no confirma el máximo del modelo) |
| Tipos de cuantización | Q4_K_M (esta versión); el modelo base admite otras cuantizaciones GGUF, no detalladas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base original en safetensors/transformers |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base UI-TARS-2B-SFT más allá de su naturaleza multimodal image-text-to-text. No se especifican el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado (SFT, como sugiere el sufijo del nombre). Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

Lo que sí se conoce es que el modelo está orientado a tareas de GUI (interacción con interfaces gráficas), lo que implica un entrenamiento específico sobre capturas de pantalla y acciones de interfaz. El proceso de cuantización a Q4_K_M se realizó con llama.cpp a través del espacio GGUF-my-repo, un procedimiento estándar que reduce la precisión de los pesos a 4 bits con una mezcla de cuantización K-quant. Para obtener detalles sobre la arquitectura y el entrenamiento originales, es necesario consultar la model card del modelo base ByteDance-Seed/UI-TARS-2B-SFT.

## Capacidades

- Procesamiento multimodal image-text-to-text: acepta imágenes (capturas de pantalla) junto con texto y genera respuestas textuales.
- Automatización de interfaces gráficas: orientado a interpretar pantallas y producir acciones o instrucciones para interactuar con elementos de GUI.
- Generación de texto conversacional: pipeline etiquetado como conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque su orientación a GUI sugiere uso en agentes; no confirmado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): visión (image-text-to-text) confirmada; audio y thinking mode no disponibles.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede recibir una captura de pantalla y una instrucción en inglés para identificar elementos de la interfaz y generar la acción correspondiente, adecuado para prototipos de agentes que operan sobre aplicaciones de escritorio.
- Testing automatizado de interfaces: integrado en pipelines de QA, puede analizar capturas de pantalla de una aplicación y sugerir o validar interacciones, reduciendo la necesidad de scripts frágiles basados en selectores.
- Asistencia a usuarios en soporte técnico: dado un pantallazo del problema del usuario, el modelo puede interpretar el estado de la interfaz y generar instrucciones textuales para resolverlo, aprovechando su naturaleza conversacional.
- Extracción de información de pantallas: puede transcribir o describir el contenido visible de una captura, útil para digitalizar formularios o paneles de control en entornos controlados.
- Prototipado de agentes RPA ligeros: al ejecutarse en formato GGUF con llama.cpp, permite desplegar agentes de automatización en hardware de consumo para pruebas de concepto sin depender de APIs externas.
- Educación y demos de IA multimodal: su tamaño reducido (1,1 GB en Q4_K_M) lo hace apto para entornos de aprendizaje donde se quiere mostrar el funcionamiento de un modelo multimodal de GUI en local.
- Automatización web básica: con capturas de navegador, puede asistir en la identificación de elementos y la generación de pasos de navegación, siempre con supervisión humana dada la limitación de contexto no confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y 1,78 mil millones de parámetros, el peso del modelo ronda 1,1 GB; se estima un uso de VRAM de entre 2 y 4 GB incluyendo overhead de contexto y procesamiento de imagen (estimación orientativa, no confirmada en la información).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura. También es viable en Apple Silicon con Metal.
- Compatibilidad con GPU de consumo: sí, cabe en GPU de consumo modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (CLI y server), y por extensión herramientas compatibles con GGUF como Ollama o LM Studio (no confirmado explícitamente en la model card, pero estándar para GGUF). No se menciona soporte de vLLM o TGI para esta versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UI-TARS-2B-SFT-Q4_K_M-GGUF (este) | ~1,78 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Cuantización comunitaria del base de ByteDance |
| ByteDance-Seed/UI-TARS-2B-SFT (base) | ~1,78 B | No disponible | Apache 2.0 | Safetensors | Modelo original, sin cuantizar |
| Alternativas de GUI agents de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría (agentes de GUI multimodales de ~2B). Se recomienda consultar la model card del modelo base y la documentación de UI-TARS para obtener referencias comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado principalmente en inglés, puede presentar sesgos lingüísticos y culturales.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en tareas de GUI, una interpretación errónea de la pantalla puede derivar en acciones incorrectas, por lo que se recomienda supervisión humana en producción.
- Limitaciones de contexto o idioma: el campo `language` solo declara inglés; el contexto máximo no está confirmado y el ejemplo de servidor usa 2048 tokens, lo que sugiere ventanas modestas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento.
- Caveats para producción: esta es una cuantización comunitaria (autor renish1, 0 descargas, 0 likes en el momento de la ficha), sin validación oficial por parte de ByteDance; la calidad puede degradarse respecto al modelo original en safetensors. No se garantiza paridad de comportamiento con el base.
- El procesamiento de imágenes en llama.cpp puede tener limitaciones de soporte según la versión; verificar compatibilidad multimodal de la build utilizada.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/renish1/UI-TARS-2B-SFT-Q4_K_M-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ByteDance-Seed/UI-TARS-2B-SFT
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
