# OmniJev/OneJev1.5-9B

## Resumen

OneJev1.5-9B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev, un fine-tune completo de Qwen/Qwen3.5-9B con 9.409.813.744 parámetros. A diferencia de un modelo generativo convencional, su función es recibir un estado multimodal (captura de pantalla, fotografía, vídeo o texto plano) junto con un conjunto de preguntas tipadas y devolver, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está pensado como motor de decisión para agentes, no como chatbot.

El modelo se entrena sobre aproximadamente 320.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Su relevancia actual radica en que aborda un problema distinto al de los LLM generativos: la evaluación rápida, calibrada y de baja latencia de alternativas discretas en bucles de agente (por ejemplo, decidir si una tarea está completada o cuál es la siguiente acción sobre una interfaz gráfica).

Según la model card, OneJev1.5-9B obtiene 59,03 en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones), la puntuación más alta de cualquier modelo de hasta 10B parámetros del tablero, y supera a 31 de los 43 modelos de 25B a 36B parámetros evaluados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-9B); detalles internos no disponibles |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

OneJev1.5-9B parte de Qwen/Qwen3.5-9B y se somete a un fine-tune completo (full fine-tune) sobre aproximadamente 320.000 preguntas. La composición del dataset combina preguntas derivadas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. La model card no detalla el número exacto de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación principal no reside en la arquitectura del backbone sino en la interfaz y el objetivo de entrenamiento: el modelo consume un estado (texto más medios) y un esquema de preguntas tipadas (`Noul` para preguntas booleanas, `Choice` para selección entre opciones) y produce probabilidades calibradas para cada opción en una sola pasada. El servidor expone la System One API de TypeSafe con un campo adicional `media` para imágenes y vídeo. No se documentan en la información disponible técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Decisión multimodal calibrada: devuelve una probabilidad por opción a partir de imagen, vídeo o texto, en un único forward pass.
- Preguntas tipadas: soporta preguntas booleanas (`Noul`) y de elección múltiple (`Choice`) mediante un esquema estructurado.
- Comprensión de capturas de pantalla e interfaces gráficas, orientada a agentes GUI.
- Procesamiento de vídeo como entrada de estado.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Integración con agentes: pensado para bucles de decisión de varios pasos donde se evalúa el estado tras cada acción.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento extendido (thinking): no documentado.

## Casos de uso

- Agentes de automatización de interfaz gráfica: dado un estado con captura de pantalla y la pregunta "¿qué hago ahora?", el modelo devuelve la probabilidad de cada acción (clic, parada, escritura), lo que permite políticas de agente con umbral de confianza explícito.
- Verificación de finalización de tareas: con `Noul("The invoice has been paid")` el agente comprueba si el objetivo se ha cumplido antes de cerrar el bucle, reduciendo acciones redundantes.
- Enrutamiento con abstención: al disponer de probabilidades calibradas, se puede derivar a un humano o a un modelo mayor cuando la confianza cae por debajo de un umbral, útil en pipelines de atención al cliente.
- Control de calidad de vídeo e imagen: clasificación binaria o multietiqueta de fotogramas o capturas con probabilidad asociada, apto para monitorización automatizada.
- Evaluación de políticas de agente en investigación: al ser un modelo de decisión puro, sirve como evaluador barato de trayectorias generadas por otros modelos en entornos simulados.
- Detección de estados de error en flujos de trabajo: preguntar al modelo si la pantalla muestra un mensaje de error permite disparar reintentos o alertas en sistemas RPA.
- Moderación o filtrado de decisiones en producción: la salida probabilística permite fijar umbrales auditables en lugar de depender de texto generado.

## Benchmarks y rendimiento

La model card incluye resultados en Decision Index 0.3 (parte pública) y en un test set propio de OneJev. Los datos concretos de la tabla de resultados contra Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking se presentan en imágenes SVG en la model card y no están disponibles como cifras textuales en la información proporcionada, salvo el agregado de Decision Index.

| Benchmark | OneJev1.5-9B | Nace.AI Drex v1.5 | Bespoke Nimble 9B v3 | Cloudflare clef-flash | Sieve 9B Plus |
|---|---|---|---|---|---|
| Decision Index 0.3 (parte pública) | 59,03 | 58,1 | 57,2 | 56,1 | 53,4 |

Comparación con modelos de mayor tamaño en el mismo tablero:

| Modelo | Parámetros | Decision Index 0.3 |
|---|---|---|
| OneJev1.5-9B | 9,4B | 59,03 |
| linne-fern 1.0 | no disponible | 58,9 |
| Surogate Rune v3 | no disponible | 58,3 |
| Blink v0.3 | no disponible | 58,2 |
| deck31b | no disponible | 58,2 |
| decisio 0.6.0 | no disponible | 58,1 |
| GEV-26B-Decide | 26B | 58,0 |

No se han publicado en la información disponible resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: con 9,41B parámetros en safetensors (18,8 GB en fp16/bf16), la inferencia en precisión nativa requiere aproximadamente 19-20 GB de VRAM más el coste de activaciones y del codificador visual; no se dispone de cifras oficiales.
- Cuantización: no se documentan versiones GGUF ni cuantizadas en la información disponible; el despliegue se realiza mediante el servidor `qev` del propio proyecto.
- GPU recomendadas: por tamaño, encajan A100 40/80 GB, H100, L40S y RTX A6000; en consumer, una RTX 4090 (24 GB) podría alojar los pesos en bf16, aunque sin margen para contexto largo.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 y RTX 3090 de 24 GB en bf16; en GPUs de 16 GB requeriría cuantización, no documentada.
- Opciones de despliegue: `qev serve` (servidor propio del proyecto, compatible con la System One API de TypeSafe), además de carga vía `transformers` al ser un modelo `qwen3_5` con safetensors. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-9B | 9,4B | no disponible | 59,03 | Apache 2.0 | Hugging Face, GitHub |
| Nace.AI Drex v1.5 | no disponible | no disponible | 58,1 | no disponible | no disponible |
| Bespoke Nimble 9B v3 | ~9B | no disponible | 57,2 | no disponible | no disponible |
| Cloudflare clef-flash | no disponible | no disponible | 56,1 | no disponible | no disponible |
| Sieve 9B Plus | ~9B | no disponible | 53,4 | no disponible | no disponible |

Los modelos comparados pertenecen a la misma categoría funcional (modelos de decisión evaluados en Decision Index) según la model card; sus parámetros y licencias no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no está diseñado para producir texto libre ni para tareas de generación abierta; usarlo como chatbot no es su propósito.
- Calibración dependiente del dominio: las probabilidades se calibraron sobre ejecuciones de agente, vídeo e imagen; fuera de esa distribución la fiabilidad de la calibración no está garantizada.
- Idiomas soportados no documentados: no hay evidencia publicada sobre rendimiento multilingüe, por lo que el uso en castellano u otros idiomas requiere validación propia.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: aunque la salida es probabilística, el modelo puede asignar alta confianza a opciones incorrectas en estados visuales ambiguos o fuera de distribución.
- Contexto máximo no especificado: limita la planificación de conversaciones o trayectorias largas.
- Ecosistema de despliegue propietario: la interfaz recomendada es el servidor `qev` del proyecto; el soporte en herramientas estándar (vLLM, TGI, llama.cpp) no está confirmado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B.
- Madurez del proyecto: creado en octubre de 2026 y actualizado en noviembre de 2026, con 1.232 descargas y 2 likes en el momento de la consulta; el ecosistema y la documentación pueden ser limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.5-9B
- Organización OmniJev en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Decision Index 0.3 (parte pública): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
