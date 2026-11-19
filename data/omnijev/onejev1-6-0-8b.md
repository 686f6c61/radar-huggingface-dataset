# OmniJev/OneJev1.6-0.8B

## Resumen

OneJev1.6-0.8B es un modelo de decisión multimodal de tipo "System One" desarrollado por OmniJev. A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (una captura de pantalla, una foto, un vídeo o texto plano) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está construido como un fine-tune completo de Qwen/Qwen3.5-0.8B, con 852.985.920 parámetros reales según los pesos en safetensors, y combina los pesos de tres fine-tunes independientes mediante weight averaging.

El modelo resuelve un problema concreto en el ámbito de los agentes: la evaluación rápida y calibrada de estados intermedios (¿ha terminado la tarea?, ¿qué acción toca ahora?, ¿qué progreso llevamos?) sin coste de generación autoregresiva. Su relevancia actual radica en que, con menos de 1.000 millones de parámetros, supera en el Decision Index 0.3 público (48,82) a modelos de hasta 2,5B e incluso a varios modelos de 4B o más, lo que lo sitúa como una pieza ligera y desplegable en local para pipelines de agentes GUI y vídeo.

La arquitectura subyacente es la del transformer multimodal de Qwen3.5, con pipeline image-text-to-text, licencia Apache 2.0 y pesos en safetensors compatibles con `transformers`. El modelo se distribuye con 2.758 descargas y 6 likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5), fine-tune completo con weight averaging de tres fine-tunes |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal con capacidad image-text-to-text. Sobre esa base se realizaron tres fine-tunes completos independientes, cuyos pesos se promedian para obtener el modelo final. El entrenamiento utilizó entre 390.000 y 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura sino en la formulación de la tarea: el modelo está entrenado para emitir probabilidades calibradas sobre preguntas tipadas (noul, choice, score) en un solo forward pass, en lugar de generar respuestas token a token. El despliegue se realiza mediante Flide, que sirve una API System One de TypeSafe ampliada con un campo `media` para imágenes y vídeo. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Evaluación de decisiones sobre imágenes, vídeo y texto: devuelve probabilidades calibradas por opción en un único forward pass.
- Preguntas tipadas: soporta tipos `noul` (probabilidad de sí), `choice` (una probabilidad por opción) y `score` (nivel esperado sobre una escala de criterios).
- Agentes GUI: evaluación de estados de pantalla para determinar la siguiente acción (click, type, scroll, stop) y el progreso de la tarea.
- Comprensión de vídeo: procesa entradas de vídeo además de imágenes fijas y texto.
- Razonamiento de progreso: estima en qué punto de una tarea se encuentra el agente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Agentes GUI de automatización de escritorio: el modelo recibe la captura de pantalla actual y devuelve la distribución de probabilidad sobre la siguiente acción (click, type, scroll, stop), lo que permite un bucle de control rápido y barato sin generación de texto.
- Verificación de finalización de tareas: con una pregunta de tipo `noul` ("la factura ha sido pagada"), el modelo estima la probabilidad de que la tarea esté completada, útil como condición de parada en pipelines de agentes.
- Monitorización de progreso en flujos multi-paso: mediante preguntas de tipo `score`, estima el avance sobre escalas definidas por el desarrollador, lo que permite detectar agentes bloqueados o en bucles.
- Enrutado y selección de herramientas en asistentes: dado un estado y un conjunto de criterios, devuelve la probabilidad de cada opción, sirviendo como clasificador ligero previo a la llamada a un modelo generativo mayor.
- Análisis de vídeo para agentes: al aceptar entradas de vídeo, puede evaluar estados en grabaciones de sesiones o tutoriales para decidir acciones o validar pasos.
- Evaluación de calidad en producción: al ser un modelo de 0,85B con licencia Apache 2.0, puede desplegarse en local para puntuar interacciones y decisiones de agentes sin enviar datos a servicios externos.
- Clasificación multimodal calibrada en investigación: su naturaleza de modelo de decisión con probabilidades calibradas lo hace adecuado para experimentos que requieran incertidumbre bien calibrada en lugar de texto generado.

## Benchmarks y rendimiento

Decision Index 0.3 (parte pública; 37 benchmarks, 140.178 peticiones, evaluado con el kit del propio board):

| Modelo | Parametros | Decision Index |
|---|---|---|
| OneJev1.6-0.8B | 0,85B | 48,82 |
| OneJev1.5-0.8B | 0,85B | 42,71 |
| vLLM-SR d3-nano | 2B | 42,22 |
| Sieve 2B v2 | 2B | 37,26 |
| vLLM-SR d3-lite | 0,8B | 36,93 |
| Crivo-150M | 150M | 36,39 |

Comparación con modelos de mayor tamaño en el mismo board (parte pública, 16 de octubre de 2026):

| Modelo | Parametros | Decision Index |
|---|---|---|
| OneJev1.6-0.8B | 0,85B | 48,8 |
| decisio 0.4.0 | no disponible | 48,4 |
| Hopper | 12B | 48,3 |
| Decider | 35B-A3B | 47,7 |
| JevK5 v0.3.3 | 9B | 47,6 |
| Jebadiah v2.1 | 9B | 47,2 |
| JPT | 9B | 47,0 |

El autor indica que OneJev1.6-0.8B obtiene la puntuación más alta de cualquier modelo de hasta 2,5B parámetros en el board y lidera su clase en las cinco áreas evaluadas. También supera a 47 modelos de 4B parámetros o más. No se publican resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 0,85B parámetros y pesos en fp32 el modelo ocupa aproximadamente 3,4 GB, y en fp16/bf16 alrededor de 1,7 GB (tamaño del repo: 1,7 GB).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y superiores, así como en A100 y H100.
- Cabe en GPU consumer: sí, por el tamaño de parámetros.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6-0.8B`), que sirve la API System One con soporte de `media`; compatible con `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor destaca el coste de un único forward pass frente a la generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-0.8B | 0,85B | no disponible | 48,82 | Apache 2.0 | Hugging Face, GitHub, Flide |
| vLLM-SR d3-nano | 2B | no disponible | 42,22 | no disponible | board Decision Index |
| Sieve 2B v2 | 2B | no disponible | 37,26 | no disponible | board Decision Index |
| vLLM-SR d3-lite | 0,8B | no disponible | 36,93 | no disponible | board Decision Index |
| Crivo-150M | 150M | no disponible | 36,39 | no disponible | board Decision Index |

Los cuatro modelos comparables son los de mayor puntuación de hasta 2,5B parámetros en el board. No se dispone de datos de contexto, licencia ni formato de pesos de los competidores en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre ni conversación abierta; solo responde a preguntas tipadas predefinidas.
- No se documentan sesgos conocidos, pero al entrenarse con ejecuciones reales de agentes y datasets públicos de decisión puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades calibradas pueden ser erróneas en estados fuera de la distribución de entrenamiento.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés (u otros idiomas no documentados) es desconocido.
- Longitud de contexto no disponible, lo que impide evaluar su comportamiento en estados muy largos o vídeos extensos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de la licencia del modelo base Qwen3.5-0.8B.
- El despliegue de referencia depende de Flide y de la API System One de TypeSafe; no hay soporte documentado para servidores de inferencia estándar.
- Los resultados del Decision Index proceden del propio autor y del kit del board; no hay validación independiente en la información disponible.
- El modelo tiene 6 likes y 2.758 descargas, lo que indica una adopción aún limitada y poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Web oficial: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Flide (servidor): https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Decision Index 0.3 (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Perfil del autor: https://huggingface.co/OmniJev
