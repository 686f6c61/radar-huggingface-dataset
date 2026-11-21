# abamma/EurekaModer

## Resumen

EurekaModer es un adaptador LoRA experimental para moderación de contenido en ruso, desarrollado por el usuario abamma y publicado en Hugging Face. Se construye sobre el modelo base Google Gemma 4 E4B Instruct y está especializado en la detección de spam y la validación de publicaciones y pies de foto en canales de Telegram. El adaptador recibe como entrada las reglas del canal y el texto a revisar, y devuelve una etiqueta binaria (`YES` si la publicación es admisible, `NO` si infringe la regla proporcionada) mediante decodificación restringida a dos tokens.

El modelo se entrenó con QLoRA sobre 224 mensajes del dataset Telegram Spam y 32 ejemplos sintéticos de moderación general, con 64 pasos de optimizador en una NVIDIA T4. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, por lo que requiere descargar los pesos base de Gemma 4 E4B Instruct para funcionar. La licencia es Apache 2.0 y el único idioma declarado es el ruso.

Su relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la ficha, cuyos resultados proceden de un piloto de 64 mensajes de validación y 32 de control, sin un test completo sobre el conjunto de 2 139 mensajes. Resulta útil como referencia para quienes quieran construir moderadores binarios con adaptadores ligeros sobre modelos base, pero no como solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 4 E4B Instruct) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; los parametros del base no se detallan) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | NF4 (bitsandbytes) para el modelo base; adaptador en safetensors |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Google Gemma 4 E4B Instruct, un transformer decoder-only del que no se detallan en la información disponible ni el número de parámetros ni la longitud de contexto. La cuantización del base a NF4 con bitsandbytes permite ejecutar el ajuste y la inferencia en GPUs de gama media. El adaptador se carga mediante PEFT con `transformers==5.23.0`, `peft>=0.19,<1`, `bitsandbytes>=0.48,<1`, `accelerate` y `pillow`.

El conjunto de entrenamiento combina 224 mensajes del dataset `alt-gnome/telegram-spam` con 32 ejemplos ficticios de moderación general, y el ajuste se realizó en 64 pasos de optimizador sobre una NVIDIA T4. La innovación técnica principal es la decodificación restringida: el modelo solo puede emitir las etiquetas `YES` o `NO`, lo que convierte una tarea generativa en una clasificación binaria controlada y reduce la variabilidad de la salida. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre la composición exacta del corpus más allá del recuento de ejemplos.

## Capacidades

- Clasificación binaria de admisibilidad de textos en ruso: devuelve `YES` o `NO` según las reglas del canal proporcionadas en el prompt.
- Detección de spam en mensajes y pies de foto de Telegram.
- Moderación guiada por reglas: el usuario define la política en lenguaje natural y el modelo la aplica al texto evaluado.
- Decodificación restringida a dos etiquetas, lo que evita respuestas libres y facilita el parseo automático.
- Ejecución sobre el modelo base cuantizado en NF4, apta para GPUs con memoria limitada.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas ni razonamiento multi-paso.

## Casos de uso

- Filtro antispam en canales de Telegram: el adaptador evalúa cada mensaje entrante contra la regla del canal y devuelve `NO` para bloquear publicaciones promocionales o fraudulentas antes de que lleguen a los suscriptores, aprovechando su entrenamiento específico sobre mensajes de Telegram.
- Premoderación de comentarios en comunidades rusohablantes: se puede integrar como primera pasada automática que descarta spam evidente y deja el resto a revisión humana, reduciendo la carga de los moderadores.
- Clasificación de pies de foto en publicaciones: el modelo acepta texto de publicaciones y pies de foto, por lo que sirve para revisar el copy que acompaña a imágenes antes de publicar.
- Prototipado de políticas de moderación: al recibir las reglas en el prompt, un equipo puede probar distintas políticas (prohibir enlaces, prohibir ventas, etc.) sin reentrenar, usando el adaptador como banco de pruebas.
- Investigación sobre clasificadores binarios con LoRA: el repositorio sirve como referencia reproducible para estudiar el efecto de la decodificación restringida y del ajuste QLoRA con pocos pasos en tareas de moderación.
- Enrutamiento de contenido en pipelines de mensajería: la salida binaria se integra fácilmente en un sistema de colas que derive los mensajes marcados como `NO` a cuarentena o revisión manual.

## Benchmarks y rendimiento

Resultados del piloto publicados por el autor (no verificados de forma independiente):

| Prueba | Gemma base | Adaptador antispam |
|---|---:|---:|
| Validación Telegram Spam | 46/64 | 64/64 |
| Spam no detectado | 18/32 | 0/32 |
| Mensajes normales bloqueados | 0/32 | 0/32 |
| Control sintético de moderación general | 16/16 | 16/16 |

El autor indica que estos resultados se obtuvieron sobre los pesos de esta versión y coincidieron con el primer piloto, pero que el test completo sobre 2 139 mensajes aún está pendiente y que la calidad de moderación general en canales reales de Telegram no se ha medido por separado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al cargar el base en NF4 y un adaptador de 0,1 GB, el consumo será el del modelo Gemma 4 E4B cuantizado, que no se detalla en la información proporcionada.
- GPU recomendadas: el autor entrenó en una NVIDIA T4, lo que sugiere que la inferencia es viable en GPUs de gama media con suficiente memoria para el base en NF4.
- Cabe en GPU de consumo: probablemente en tarjetas con memoria suficiente para el base cuantizado, pero no se especifica el mínimo exacto.
- Opciones de despliegue: script `moderate.py` proporcionado por el autor con PyTorch + CUDA, `transformers`, `peft`, `bitsandbytes` y `accelerate`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EurekaModer (este) | Adaptador LoRA sobre Gemma 4 E4B | no disponible | Moderación binaria en ruso | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 4 E4B Instruct (base) | no disponible | no disponible | Generación de texto general | no disponible en la información | Hugging Face |
| Alternativas de moderación open source | no disponible | no disponible | Clasificación de contenido | variable | no disponible |

No se dispone en la información proporcionada de modelos comparables de moderación en ruso con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Resultados preliminares: el piloto cubre 64 mensajes de validación y 32 de control; el test completo sobre 2 139 mensajes está pendiente.
- La calidad de moderación general en canales reales de Telegram no se ha medido de forma independiente.
- Ámbito lingüístico limitado al ruso; no se declara soporte para otros idiomas.
- Entrenamiento con solo 224 mensajes reales y 32 sintéticos, lo que aumenta el riesgo de sobreajuste al dataset `alt-gnome/telegram-spam` y de generalización deficiente a otros tipos de spam.
- Riesgo de alucinación mitigado solo parcialmente por la decodificación restringida a `YES`/`NO`; errores de clasificación siguen siendo posibles.
- Sesgos no documentados: no se detalla la composición demográfica ni temática del corpus de entrenamiento.
- Uso comercial permitido por la licencia Apache 2.0, pero el autor recomienda usar los resultados como sugerencia para un moderador humano, no como decisión automática definitiva.
- Dependencia de versiones concretas de librerías (`transformers==5.23.0`, `peft>=0.19,<1`, `bitsandbytes>=0.48,<1`), lo que puede complicar la integración en entornos existentes.
- Requiere descargar los pesos base de Gemma 4 E4B Instruct, cuyas condiciones de uso deben respetarse además de la licencia del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abamma/EurekaModer
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/alt-gnome/telegram-spam
