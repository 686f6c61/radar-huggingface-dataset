# OmniJev/OneJev1.5-4B

## Resumen

OneJev1.5-4B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev, un ajuste fino completo del modelo base Qwen/Qwen3.5-4B. A diferencia de los modelos generativos convencionales, su función principal no es producir texto libre, sino devolver una probabilidad calibrada para cada opción de un conjunto de preguntas tipadas a partir de una captura de pantalla, una foto, un vídeo o texto plano, todo ello en un único paso forward. Está orientado a agentes autónomos, especialmente agentes de interfaz gráfica (GUI agents), donde la decisión rápida y calibrada sobre el siguiente paso es crítica.

El modelo cuenta con 5.174.964.736 parámetros reales según los pesos en safetensors (el nombre comercial indica 4B, en referencia al tamaño del modelo base) y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que aborda el problema de la calibración en la toma de decisiones de agentes: en lugar de generar una respuesta y esperar a que el agente la interprete, el modelo emite directamente distribuciones de probabilidad sobre opciones discretas, lo que facilita la integración en bucles de control y la evaluación de la confianza.

El modelo ha sido entrenado sobre aproximadamente 320.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y particiones de entrenamiento de conjuntos de datos públicos de decisión. En la parte pública del Decision Index 0.3 (37 benchmarks, 140.178 peticiones) obtiene una puntuación de 54,89, situándose entre los mejores modelos de menos de 8B parámetros de ese tablero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune completo de Qwen/Qwen3.5-4B) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OneJev1.5-4B es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen/Qwen3.5-4B, lo que implica que hereda la arquitectura transformer multimodal de este último, incluyendo su torre de visión y su mecanismo de atención. El modelo se especializa en la tarea de decisión: recibe un estado (texto e imágenes o vídeo) y un conjunto de preguntas tipadas (por ejemplo, `Noul` para preguntas booleanas o `Choice` para selección entre opciones), y devuelve una probabilidad calibrada para cada opción en un único paso forward.

El entrenamiento se realizó sobre aproximadamente 320.000 preguntas procedentes de ejecuciones reales de agentes, vídeos, imágenes y las particiones de entrenamiento de conjuntos de datos públicos de decisión. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica principal es el enfoque "System One": en lugar de razonamiento multi-paso o generación de cadenas de pensamiento, el modelo emite directamente distribuciones de probabilidad calibradas, lo que reduce la latencia y facilita la integración en bucles de control de agentes.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades para cada opción a partir de capturas de pantalla, fotos, vídeo o texto plano.
- Preguntas tipadas: soporta preguntas booleanas (`Noul`) y de elección entre opciones (`Choice`), así como preguntas de estado y de siguiente acción.
- Agente de interfaz gráfica (GUI agent): diseñado para decidir el siguiente paso en automatización de interfaces, como hacer clic, escribir o detener la ejecución.
- Procesamiento de vídeo e imagen: acepta entradas visuales y de vídeo además de texto.
- API compatible con TypeSafe System One, con un campo `media` para imágenes y vídeo.
- Integración con servidor propio mediante `qev serve` y cliente Python `qev`.
- Capacidades conversacionales y de comprensión del lenguaje (etiqueta `conversational` y mejor puntuación en Language Understanding entre los modelos comparados).
- Soporte de herramientas y automatización (Tools & Automation), con la mejor puntuación entre los cinco modelos comparados en el Decision Index.
- No se especifican capacidades de tool calling genérico, agentes multi-paso con razonamiento explícito ni modo "thinking" en la información disponible.

## Casos de uso

- Automatización de agentes GUI: el modelo recibe una captura de pantalla y decide la siguiente acción (clic, escritura, parada) con una probabilidad calibrada, lo que permite umbrales de confianza y reintentos controlados en pipelines de automatización de interfaces.
- Verificación de estado de tareas: con preguntas booleanas como "¿se ha pagado la factura?", el modelo evalúa el estado de un flujo de trabajo a partir de la pantalla o el texto, útil en sistemas de seguimiento de procesos.
- Enrutamiento de decisiones en asistentes conversacionales: dado un contexto y una serie de opciones, el modelo devuelve la probabilidad de cada una, lo que permite seleccionar la respuesta o acción más probable en un diálogo multi-turno.
- Análisis de vídeo para agentes: al aceptar entradas de vídeo, puede emplearse para decidir el siguiente paso en tareas que requieren comprensión temporal, como tutoriales o demostraciones grabadas.
- Control de calidad en pipelines de agentes: las probabilidades calibradas permiten detectar decisiones de baja confianza y derivarlas a revisión humana o a un modelo mayor, reduciendo errores en producción.
- Evaluación de políticas de agente: el modelo puede usarse como evaluador de decisiones en entornos simulados, comparando la probabilidad asignada a la acción correcta frente a alternativas.
- Asistencia a la accesibilidad: interpretación de capturas de pantalla para sugerir la siguiente acción a usuarios con dificultades motoras, con indicación de confianza para validación.

## Benchmarks y rendimiento

Los datos disponibles provienen del Decision Index 0.3 (parte pública: 37 benchmarks, 140.178 peticiones). La model card incluye tablas en formato SVG cuyos valores numéricos no se detallan en el texto extraído, salvo la puntuación global y la comparativa entre modelos.

| Modelo | Puntuación Decision Index (parte pública) |
|---|---|
| vLLM-SR d3-mini | 54,90 |
| OneJev1.5-4B | 54,89 |
| CoCo-Decision-4B | 51,93 |
| RSI-Jev v6.1 VL 4B | 50,98 |
| ezjev 4B s2 | 50,82 |

OneJev1.5-4B obtiene la mejor puntuación en Language Understanding y en Tools & Automation entre los cinco modelos comparados, y la segunda mejor en las otras tres áreas. No se dispone de los valores numéricos desglosados por área ni de resultados en benchmarks clásicos como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.174.964.736 parámetros, en precisión completa (fp32) requeriría aproximadamente 20,7 GB, en fp16/bf16 unos 10,3 GB y en cuantización de 8 bits unos 5,2 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, cabría en GPUs de consumo con 12-16 GB o más en fp16, pero no se especifica.
- Opciones de despliegue: servidor propio mediante `qev serve` (paquete `qev[torch]` instalado desde GitHub) y cliente Python `qev`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.5-4B | 5.174.964.736 | no disponible | 54,89 | Apache 2.0 | Hugging Face, GitHub |
| vLLM-SR d3-mini | no disponible | no disponible | 54,90 | no disponible | no disponible |
| CoCo-Decision-4B | ~4B | no disponible | 51,93 | no disponible | no disponible |
| RSI-Jev v6.1 VL 4B | ~4B | no disponible | 50,98 | no disponible | no disponible |
| ezjev 4B s2 | ~4B | no disponible | 50,82 | no disponible | no disponible |

Los cuatro modelos comparados son los de mayor puntuación del tablero en el rango de 3B a 6B parámetros, según la model card, con puntuaciones de la parte pública a 12 de octubre de 2026. No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisión calibrada, no en generación de texto libre; su uso fuera de ese paradigma puede dar resultados pobres.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido y podría estar sesgado hacia el inglés.
- No se detalla la longitud de contexto, lo que impide garantizar el manejo de estados largos o conversaciones extensas.
- Riesgo de alucinación en las probabilidades emitidas: al ser un modelo calibrado, una confianza alta no garantiza corrección, especialmente en dominios fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B, podría heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-4B y de los conjuntos de datos públicos de decisión utilizados en el entrenamiento.
- El despliegue requiere el paquete `qev` instalado desde el repositorio de GitHub, lo que implica dependencia de un ecosistema propio y no estándar.
- No se han publicado resultados en benchmarks clásicos de lenguaje, código o matemáticas, por lo que su rendimiento en esas tareas es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Decision Index 0.3 (parte pública): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Organización en Hugging Face: https://huggingface.co/OmniJev
