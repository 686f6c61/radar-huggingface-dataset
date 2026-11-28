# OmniJev/OneJev1.6-27B

## Resumen

OneJev1.6-27B es un modelo multimodal de decisión de tipo "System One" desarrollado por OmniJev. Se trata de un fine-tune completo de Qwen/Qwen3.8-27B (27.356.728.560 parámetros reales según safetensors) entrenado sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Su particularidad es que no genera texto libre: recibe una captura de pantalla, una foto, un vídeo o texto plano junto con preguntas tipadas y devuelve una probabilidad calibrada para cada opción en un único forward pass.

El modelo resuelve el problema de la toma de decisiones calibrada en agentes autónomos y pipelines de automatización, donde se necesita saber "cuánto" de probable es cada acción posible en lugar de una respuesta generativa difícil de puntuar. Es relevante porque ocupa la segunda posición de 172 modelos en la parte pública de Decision Index 0.3 con una puntuación de 69,49, empatado con KnowLine 35B-A3B Gen1 y por detrás de StartLux-Decision v1.1 27B (72,88).

La arquitectura subyacente es la del transformer multimodal de Qwen3.8-27B, adaptada mediante fine-tune completo a la tarea de decisión. La licencia Apache 2.0 y el soporte de la librería Flide para servirlo con una API compatible con el patrón System One lo hacen directamente desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen/Qwen3.8-27B), fine-tune completo para decisión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal, y se somete a un fine-tune completo (no LoRA ni adaptadores) sobre aproximadamente 440.000 preguntas. Esas preguntas provienen de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. El resultado es un modelo que, en lugar de continuar texto, produce salidas tipadas: probabilidades de sí/no (`noul`), distribuciones sobre opciones (`choice`) y puntuaciones esperadas sobre niveles (`score`).

La innovación técnica central es el paradigma "System One": una única pasada hacia delante devuelve la probabilidad calibrada de cada opción, en lugar de requerir decodificación autoregresiva y posterior parseo. El modelo se sirve mediante Flide, que implementa la API System One de TypeSafe añadiendo un campo `media` para imágenes y vídeo. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Decisión multimodal calibrada sobre imágenes, vídeo y texto en una sola pasada.
- Preguntas de tipo `noul` (probabilidad de sí), `choice` (distribución sobre opciones con criterios definidos) y `score` (nivel esperado sobre una escala ordinal).
- Soporte de gui-agent: razonamiento sobre capturas de pantalla para decidir la siguiente acción (click, type, scroll, stop).
- Procesamiento de vídeo además de imagen fija y texto plano.
- Salidas numéricas directamente consumibles por pipelines, sin necesidad de parsear texto generado.
- Servicio mediante Flide con endpoint `/v1/systemone` y compatibilidad con el patrón System One de TypeSafe.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Agentes GUI automatizados: dado un screenshot y el estado de la tarea, el modelo devuelve la probabilidad de cada acción posible (click, type, scroll, stop), lo que permite a un orquestador elegir la acción con mayor probabilidad calibrada en lugar de parsear texto generado.
- Verificación de finalización de tareas: la pregunta `noul` ("la factura ha sido pagada") devuelve una probabilidad de sí directamente utilizable como condición de parada en un bucle de agente, sin necesidad de un clasificador adicional.
- Seguimiento de progreso en flujos multi-paso: la pregunta `score` sobre niveles ("no iniciado", "a medias", "casi hecho", "hecho") proporciona el nivel esperado, útil para dashboards de supervisión de agentes.
- Automatización de back-office con capturas de pantalla: procesar pantallas de ERP o CRM para decidir el siguiente paso en un proceso administrativo (por ejemplo, pagar una factura abierta de ACME) con una única llamada al endpoint.
- Análisis de vídeo para decisión: al aceptar vídeo como entrada, permite evaluar estados de un proceso a lo largo del tiempo y decidir acciones en función de la evolución observada.
- Enrutamiento y triaje en pipelines de decisión: usar las distribuciones `choice` como señal de confianza para derivar casos a revisión humana cuando la probabilidad máxima cae por debajo de un umbral.
- Evaluación comparativa de agentes: al devolver probabilidades calibradas, sirve como componente de scoring en suites de evaluación de agentes sobre benchmarks de decisión.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en porcentaje sobre el conjunto de test de OneJev, con preguntas de los tipos de entrenamiento que ningún modelo vio en entrenamiento):

| Benchmark / conjunto | OneJev1.6-27B | Jev 1.13 | Jev-Omni 12B | Qwen3.8-27B thinking |
|---|---|---|---|---|
| Decision Index 0.3 (parte pública) | 69,49 | no disponible | no disponible | no disponible |
| Test set OneJev | no disponible en detalle | no disponible en detalle | no disponible en detalle | no disponible en detalle |

Posición en Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones): segunda de 172 modelos, empatado con KnowLine 35B-A3B Gen1. Comparativa de los modelos de 25B a 36B parámetros mejor puntuados:

| Modelo | Puntuación Decision Index 0.3 (parte pública) |
|---|---|
| StartLux-Decision v1.1 27B | 72,88 |
| OneJev1.6-27B | 69,49 |
| KnowLine 35B-A3B Gen1 | 69,49 |
| Perplexity Decider v1.2 (27B) | 67,74 |
| RSI-Jev v6.1 VL 27B (effort auto) | 65,64 |

Las puntuaciones de los demás modelos corresponden a la parte pública del board a 16 de octubre de 2026. La model card incluye tablas de resultados por área (cinco áreas) en formato SVG, pero los valores numéricos por área no están disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27.356.728.560 parámetros en safetensors y un repo de 54,7 GB, la inferencia en precisión completa requiere del orden de 55 GB o más de VRAM, y en cuantizaciones de 8 bits o 4 bits bajaría aproximadamente a la mitad o a un cuarto, respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, GPUs de 80 GB (A100, H100) son las candidatas naturales para precisión completa.
- ¿Cabe en consumer GPU? No hay datos oficiales. Por tamaño, no cabría en GPUs consumer de 24 GB en precisión completa; requeriría cuantización agresiva, cuyo soporte no está documentado.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6-27B`), con endpoint `/v1/systemone`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-27B | 27,36B | no disponible | 69,49 | Apache 2.0 | Hugging Face |
| StartLux-Decision v1.1 27B | ~27B | no disponible | 72,88 | no disponible | no disponible |
| KnowLine 35B-A3B Gen1 | 35B (A3B, MoE) | no disponible | 69,49 | no disponible | no disponible |
| Perplexity Decider v1.2 (27B) | ~27B | no disponible | 67,74 | no disponible | no disponible |
| RSI-Jev v6.1 VL 27B | ~27B | no disponible | 65,64 | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado para devolver probabilidades sobre preguntas tipadas, no para generación de texto libre; usarlo fuera de ese paradigma no está soportado por la documentación.
- No se documentan sesgos conocidos, pero al entrenarse sobre ejecuciones reales de agentes y datasets públicos de decisión puede heredar sesgos de esos datos.
- Riesgo de calibración deficiente fuera de la distribución de los tipos de pregunta vistos en entrenamiento; la propia model card indica que el test set contiene tipos vistos en entrenamiento, lo que limita la evidencia sobre generalización a tipos nuevos.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe más allá de lo que herede de Qwen3.8-27B.
- Longitud de contexto no disponible: no se puede planificar el uso con estados de tarea o historiales largos sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B puede tener sus propias condiciones que conviene revisar.
- El ecosistema de serving se limita a Flide según la documentación; la ausencia de soporte documentado en vLLM, llama.cpp u Ollama complica el despliegue en infraestructuras existentes.
- Los benchmarks comparativos proceden del propio autor y del board Decision Index; conviene tratarlos con cautela y replicarlos en el dominio de aplicación.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-27B
- Perfil del autor: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Decision Index 0.3 (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
