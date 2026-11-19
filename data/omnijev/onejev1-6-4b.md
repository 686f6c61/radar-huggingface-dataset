# OmniJev/OneJev1.6-4B

## Resumen

OneJev1.6-4B es un modelo multimodal de decisión de 4.539 millones de parámetros (4,5B) desarrollado por OmniJev, presentado como un "System One decision model". No es un modelo generativo conversacional al uso: recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con un conjunto de preguntas tipadas, y devuelve en un único forward pass una probabilidad calibrada para cada opción de respuesta. Está construido como un fine-tune completo de Qwen/Qwen3.5-4B sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión.

El modelo resuelve un problema concreto en el despliegue de agentes: sustituir la generación autoregresiva de decisiones por una evaluación probabilística directa y calibrada. En lugar de pedir a un LLM que "decida" qué hacer a continuación en formato texto libre, OneJev devuelve distribuciones de probabilidad sobre opciones predefinidas (tipo `choice`), probabilidades de sí/no (tipo `noul`) y niveles esperados en escalas ordinales (tipo `score`). Esto facilita la integración en bucles de agente con umbrales de confianza y políticas de parada basadas en probabilidad.

Su relevancia actual radica en el rendimiento reportado: 62,01 en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones), frente a 54,89 de su versión anterior OneJev1.5-4B, superando a modelos de 25B a 36B parámetros en 42 de los 57 casos de esa franja. La licencia Apache 2.0 y el soporte de la herramienta Flide para servir la API System One lo hacen directamente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen/Qwen3.5-4B), pipeline image-text-to-text |
| Parámetros totales | 4.539.265.536 (4,5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Biblioteca | transformers |
| Fecha de creación | 2026-10-16 |
| Última actualización | 2026-11-10 |
| Descargas | 2.211 |
| Likes | 8 |

## Arquitectura y entrenamiento

OneJev1.6-4B es un fine-tune completo (full fine-tune) de Qwen/Qwen3.5-4B, un transformer multimodal con capacidad de procesamiento de imagen y texto. El modelo conserva la arquitectura del base y añade una cabeza de decisión que, en un único forward pass, produce salidas tipadas: probabilidades sobre opciones discretas (`choice`), probabilidad de sí/no (`noul`) y valor esperado en escalas ordinales (`score`). El pipeline declarado es `image-text-to-text` y acepta además vídeo a través del campo `media` de la API.

El entrenamiento se realizó sobre aproximadamente 440.000 preguntas provenientes de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el enfoque "System One": en lugar de razonamiento multi-paso autoregresivo, el modelo emite una evaluación calibrada inmediata, lo que reduce latencia y permite umbrales de confianza explícitos en bucles de agente.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades por opción en un solo forward pass a partir de imagen, vídeo o texto.
- Preguntas tipadas: soporta `choice` (probabilidades por opción), `noul` (probabilidad de sí/no) y `score` (nivel esperado en escala ordinal).
- Procesamiento de capturas de pantalla y GUI: orientado a agentes que operan interfaces gráficas.
- Procesamiento de vídeo: acepta vídeo como entrada mediante el campo `media`.
- Procesamiento de imagen y fotografía: pipeline image-text-to-text.
- Procesamiento de texto plano: admite estado textual sin medio asociado.
- Integración con API System One (TypeSafe) a través de Flide, con extensión `media` para imagen y vídeo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso generativos, thinking mode, audio ni multilingüismo explícito.

## Casos de uso

- Agentes de automatización de GUI: el modelo recibe la captura de pantalla y la tarea ("pagar la factura de ACME") y devuelve la probabilidad de cada acción siguiente (click, escribir, scroll, parar), permitiendo al agente elegir la acción con mayor confianza o detenerse si ninguna supera un umbral.
- Detección de finalización de tareas: mediante preguntas `noul` ("la factura ha sido pagada"), el modelo aporta una probabilidad de sí/no que el orquestador puede usar como condición de parada del bucle de agente.
- Estimación de progreso: con preguntas `score` sobre una escala ordinal ("no iniciado", "a medias", "casi hecho", "hecho"), devuelve el nivel esperado, útil para monitorización y para decidir si continuar o escalar a un humano.
- Enrutado y triaje de decisiones en pipelines: dado un estado textual o visual, calcular probabilidades sobre opciones discretas permite clasificar y derivar peticiones con umbrales de confianza explícitos en lugar de parsear texto generado.
- Evaluación de políticas de agente en vídeo: al aceptar vídeo, puede puntuar decisiones a partir de grabaciones de sesiones, útil para auditoría y evaluación offline de agentes.
- Verificación de estados visuales en CI de agentes: integrar el modelo en pruebas automatizadas que comprueben, con probabilidad calibrada, si una interfaz ha alcanzado el estado esperado tras una secuencia de acciones.
- Sustitución de llamadas generativas en bucles de decisión de baja latencia: al resolver la decisión en un solo forward pass de un modelo de 4,5B, reduce el coste frente a modelos generativos mayores en tareas de elección acotada.

## Benchmarks y rendimiento

Resultados en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones, evaluados con el kit del propio board). Comparativa con los modelos de 3B a 6B con mayor puntuación del board:

| Modelo | Puntuación global |
|---|---|
| OneJev1.6-4B | 62,01 |
| Perplexity Decider Flash v1.2 (4B) | 60,06 |
| CoCo-Decision-4B 2.3.0 | 55,38 |
| vLLM-SR d3-mini (4B) | 54,90 |
| RSI-Jev v6.1 VL 4B | 50,98 |

Comparativa con modelos de mayor tamaño (28B a 35B):

| Modelo | Parámetros | Puntuación |
|---|---|---|
| OneJev1.6-4B | 4,5B | 62,0 |
| Cloudflare clef | no disponible | 61,7 |
| Nace.AI Drex v2.0 | no disponible | 61,2 |
| Quyet-1.0 Large | no disponible | 60,8 |
| MORJ 1.0.1 | no disponible | 60,2 |
| Sieve 27B | 27B | 60,0 |
| AnyJev L0 | 28B–35B | 59,8 |

El modelo supera a 42 de los 57 modelos de 25B a 36B parámetros del board. Las puntuaciones de los demás modelos corresponden a la parte pública del board a 16 de octubre de 2026.

Resultados adicionales (precisión en porcentaje) frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking: la información disponible referencia una tabla en imagen (`assets/results.svg`) sin valores numéricos textuales, por lo que los datos concretos de esa comparativa no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.539 millones de parámetros en safetensors y un repositorio de 9,1 GB, la inferencia en precisión completa requiere del orden de 9–10 GB de VRAM solo para pesos, más memoria para activaciones y el codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de pesos, sería viable en GPUs de consumo con 12–16 GB o más, pero no se documenta oficialmente.
- Opciones de despliegue: Flide (`flide serve --model OmniJev/OneJev1.6-4B`), que sirve la API System One de TypeSafe más un campo `media` para imagen y vídeo. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-4B | 4,5B | no disponible | 62,01 | Apache 2.0 | Hugging Face, Flide |
| Perplexity Decider Flash v1.2 | 4B | no disponible | 60,06 | no disponible | no disponible |
| CoCo-Decision-4B 2.3.0 | 4B | no disponible | 55,38 | no disponible | no disponible |
| RSI-Jev v6.1 VL 4B | 4B | no disponible | 50,98 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no está diseñado para generar texto libre ni para razonamiento multi-paso; su salida son probabilidades sobre preguntas predefinidas.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ejecuciones reales de agentes y datasets públicos, puede heredar sesgos de esos datos.
- Riesgo de alucinación: la calibración reportada es agregada en el board; no se documentan garantías de calibración por dominio ni por tipo de tarea.
- Idiomas: no se especifican los idiomas soportados; no debe asumirse cobertura multilingüe.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar tareas con estados textuales o visuales extensos.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-4B y de los datasets de entrenamiento.
- Dependencia de herramienta: el quick start oficial usa Flide; no se documentan alternativas de despliegue estándar como vLLM o llama.cpp.
- Benchmarks: las puntuaciones provienen de un board propio (Decision Index 0.3) y de la parte pública; no hay resultados en benchmarks estándar como MMLU o HumanEval.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-4B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Herramienta Flide: https://github.com/OmniJev/Flide
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Decision Index 0.3 (parte pública): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
