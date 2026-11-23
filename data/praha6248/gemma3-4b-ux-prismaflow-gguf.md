# praha6248/gemma3-4b-ux-prismaflow-GGUF

## Resumen

gemma3-4b-ux-prismaflow es un ajuste fino por LoRA de Gemma 3 4B instruct, desarrollado por el usuario praha6248 y publicado en Hugging Face. El modelo está fusionado en los pesos base y cuantizado a GGUF Q4_K_M (2,5 GB), y su propósito es muy concreto: cubrir la fase "Deliver" de PrismaFlow, una aplicación de escritorio local-first para descubrimiento de producto basada en el marco Double Diamond. En esa fase, el modelo devuelve JSON restringido por esquema para dos tareas: `SuggestionSet` (hasta cuatro correcciones sobre hallazgos de una auditoría de flujos móviles) y `FlowDraft` (un flujo de 3 a 5 pantallas a partir de una persona y un backlog MoSCoW).

La arquitectura subyacente es la de Gemma 3 4B instruct de Google, con 3.880.263.168 parámetros totales, sobre la que se aplica un LoRA de rango 16 entrenado en bf16 durante 2 épocas y 140 pasos. El modelo resultante no es un asistente general: está entrenado con los prompts de sistema exactos de la aplicación y espera ser invocado con el parámetro `format` de Ollama apuntando al esquema JSON de la respuesta. Los nombres de pantalla, etiquetas y textos de sugerencia están mayoritariamente en polaco, aunque el inglés también funciona.

Su relevancia radica en que demuestra un patrón de especialización muy estrecho y medible: un modelo de 4B ajustado con 364 ejemplos sintéticos supera en su tarea concreta a Gemma 3 12B (por ejemplo, 68,7 % frente a 41,5 % de problemas de auditoría eliminados) y reduce la latencia media de 17,45 s a 3,08 s. Es, por tanto, un caso de estudio de ajuste fino orientado a esquema y a dominio, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 4B instruct) con ajuste LoRA fusionado |
| Parámetros totales | 3.880.263.168 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (2,5 GB) |
| Idiomas soportados | pl, en |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer de 3,88 mil millones de parámetros, y se ajusta mediante LoRA con r = 16, α = 32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP del modelo de lenguaje. El entrenamiento se realizó en bf16, 2 épocas, 140 pasos, tasa de aprendizaje 2e-4 con decaimiento coseno y pérdida calculada únicamente sobre los tokens de respuesta. Todo el proceso se completó en una única RTX 5060 Ti de 16 GB en 12,8 minutos, y los adaptadores se fusionaron posteriormente en los pesos base antes de cuantizar a GGUF Q4_K_M.

Los datos de entrenamiento se dividen en dos bloques. El primero, para la fase Deliver, consta de 364 ejemplos sintéticos sobre 28 nichos de producto (299 en polaco, 65 en inglés): entradas consistentes en flujos aleatorios con defectos de UX inyectados, los prompts reales de la aplicación y respuestas gold generadas por la auditoría determinista de la app, conservando una corrección solo si reduce el recuento de problemas de la auditoría. El segundo bloque son 195 pares de pregunta-respuesta en polaco parafraseados por Gemma 3 12B a partir de fuentes con licencia abierta (W3C WCAG 2.2 Understanding, GOV.UK Design System, guías de accesibilidad de MDN y Wikipedia EN/PL), descartando respuestas que compartieran ocho o más palabras consecutivas con su fuente. Las reglas que sustentan las respuestas gold provienen de Fitts (1954), MacKenzie (1992), FFitts law (2013), Hick (1952), Hyman (1953), KLM de Card, Moran y Newell (1980), Wobbrock et al. (2008), Hoober (2013), WCAG 2.2 SC 2.5.5 y 2.5.8, Material Design, Apple HIG, heurísticas de Nielsen, Miller (1956), Sweller (1988), MoSCoW y Double Diamond.

## Capacidades

- Generación de JSON estructurado y restringido por esquema para dos tipos de respuesta: `SuggestionSet` y `FlowDraft`.
- `SuggestionSet`: hasta cuatro correcciones pequeñas sobre hallazgos de auditoría de flujos móviles, con operaciones permitidas `resize`, `move_zone`, `group_options`, `add_transition` y `remove_element`.
- Auditoría implícita de defectos: callejones sin salida, pantallas inalcanzables, índice de Fitts superior a 4,5, objetivos táctiles por debajo de 44 px (WCAG 2.5.5) y sobrecarga de Hick (más de 7 opciones).
- `FlowDraft`: generación de un flujo de 3 a 5 pantallas a partir de una persona y un backlog MoSCoW, con acciones primarias como botones grandes en la zona del pulgar, sin callejones sin salida y con todas las funcionalidades Must-have colocadas.
- Conversación de chat ordinaria al estilo Gemma 3, aunque el autor indica que este comportamiento no fue evaluado.
- Capacidades multilingües limitadas a polaco e inglés, con predominio del polaco en nombres de pantalla, etiquetas y textos de sugerencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Auditoría automática de flujos móviles en PrismaFlow: el modelo recibe un flujo con defectos y devuelve un `SuggestionSet` con correcciones válidas referenciadas a pantallas y elementos existentes; logra un 99,1 % de referencias válidas y elimina el 68,7 % de los problemas de auditoría, frente al 39,6 % del Gemma 3 4B base.
- Corrección de callejones sin salida: en la evaluación elimina el 100 % de los callejones sin salida, lo que lo hace adecuado para validar la navegabilidad de prototipos antes de pasarlos a diseño detallado.
- Ajuste de objetivos táctiles y cumplimiento WCAG: corrige el 71,0 % de los problemas de Fitts y de objetivos WCAG, útil para revisiones de accesibilidad de interfaces móviles con objetivos por debajo de 44 px.
- Generación de borradores de flujo en la fase de descubrimiento: a partir de una persona y un backlog MoSCoW produce un `FlowDraft` de 3 a 5 pantallas con estructura válida en el 100 % de los casos y el 95,4 % de las funcionalidades Must-have colocadas, lo que acelera la exploración inicial de producto.
- Reducción de defectos en borradores: los flujos generados presentan 0,06 problemas de auditoría de media, frente a 5,11 del modelo base y 5,94 de Gemma 3 12B, lo que permite usar el borrador como punto de partida casi limpio.
- Despliegue local en escritorio: al ocupar 2,5 GB en Q4_K_M y ejecutarse con Ollama, encaja en el enfoque local-first de PrismaFlow, que selecciona automáticamente `local/gemma3-4b-ux` para la fase Deliver cuando el modelo está instalado.
- Evaluación comparativa de ajustes finos: sirve como referencia metodológica para equipos que quieran medir si un LoRA pequeño supera a un modelo mayor en una tarea restringida por esquema, con latencia media de 3,08 s frente a 17,45 s de Gemma 3 12B.

## Benchmarks y rendimiento

Conjunto de evaluación: 60 flujos de auditoría y 18 backlogs de 6 nichos de producto no vistos en entrenamiento, invocados mediante la ruta real de salida estructurada de PrismaFlow.

Sugerencias de auditoría (`SuggestionSet`):

| Métrica | gemma3-4b (base) | gemma3-4b-ux | gemma3-12b |
|---|---|---|---|
| JSON válido según esquema | 100 % | 100 % | 98,3 % |
| Referencias válidas | 81,8 % | 99,1 % | 93,2 % |
| Problemas de auditoría eliminados (gold: 71,4 %) | 39,6 % | 68,7 % | 41,5 % |
| Callejones sin salida corregidos | 33,3 % | 100 % | 88,9 % |
| Problemas de Fitts/WCAG corregidos | 41,1 % | 71,0 % | 27,8 % |
| Latencia media | 3,26 s | 3,08 s | 17,45 s |

Borradores de flujo (`FlowDraft`):

| Métrica | gemma3-4b (base) | gemma3-4b-ux | gemma3-12b |
|---|---|---|---|
| Reglas estructurales (3-5 pantallas, un inicio y un objetivo, destinos válidos) | 16,7 % | 100 % | 55,6 % |
| Objetivo alcanzable | 83,3 % | 100 % | 100 % |
| Funcionalidades Must-have colocadas | 57,4 % | 95,4 % | 76,4 % |
| Problemas de auditoría en el borrador | 5,11 | 0,06 | 5,94 |

Conocimiento de UX (cuestionario de 26 preguntas sobre WCAG, Fitts, Hick, KLM, Nielsen y Material/HIG):

| gemma3-4b (base) | gemma3-4b-ux | gemma3-12b |
|---|---|---|
| 57,7 % | 57,7 % | 76,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,5 GB en Q4_K_M, por lo que cabe holgadamente en GPUs con 4 GB o más de VRAM; el autor no publica cifras de VRAM pico.
- GPU recomendadas: no disponible en la información proporcionada. El entrenamiento se realizó en una RTX 5060 Ti de 16 GB, pero no se documentan GPU recomendadas para inferencia.
- Cabe en GPU de consumo: sí, dado el tamaño de 2,5 GB del archivo GGUF; no se especifican modelos concretos.
- Opciones de despliegue: Ollama, tanto con `ollama run hf.co/praha6248/gemma3-4b-ux-prismaflow-GGUF` como creando el modelo con el Modelfile incluido mediante `ollama create local/gemma3-4b-ux -f Modelfile`. No se documentan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput: latencia media de 3,08 s en las pruebas de `SuggestionSet` (3,26 s para el modelo base y 17,45 s para Gemma 3 12B). No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| gemma3-4b-ux-prismaflow | 3,88 B | no disponible | Auditoría UX y borradores de flujo con JSON restringido | gemma | 68,7 % de problemas eliminados; 100 % de estructura válida en borradores |
| google/gemma-3-4b-it (base) | 3,88 B | no disponible | Asistente general | gemma | 39,6 % de problemas eliminados; 16,7 % de estructura válida en borradores |
| google/gemma-3-12b-it | no disponible en la información | no disponible | Asistente general | gemma | 41,5 % de problemas eliminados; 55,6 % de estructura válida en borradores; 76,9 % en el cuestionario de UX |

## Limitaciones y advertencias

- El conjunto de test proviene del mismo generador que el de entrenamiento: los nichos, etiquetas y flujos son nuevos, pero los tipos de defecto, la forma del prompt y el estilo de respuesta coinciden con el entrenamiento. Parte de la mejora es aprendizaje del estilo de las respuestas gold (por ejemplo, mover siempre un objetivo con Fitts alto a la zona inferior); cabe esperar un margen menor con flujos dibujados a mano.
- No hay mejora en conocimiento de UX: la puntuación del cuestionario es idéntica a la del modelo base (57,7 %). No debe usarse como referencia de UX o accesibilidad; un modelo general mayor es más fiable para eso. Una variante entrenada con ítems de opción múltiple adicionales alcanzó el 65,4 % manteniendo el rendimiento en Deliver, pero la mejora era de solo 2 de 26 preguntas y no se publicó.
- Solo se evaluaron las tareas de Deliver. El comportamiento con otros prompts es el de Gemma 3 4B, posiblemente desplazado por el ajuste fino.
- Cada modelo se evaluó una sola vez con temperatura de muestreo mayor que 0; el ruido entre ejecuciones es de varios puntos porcentuales (el 4B base obtuvo 34,4 % y 39,6 % de reducción de problemas en dos ejecuciones idénticas), por lo que solo deben considerarse reales las diferencias grandes.
- Los flujos sintéticos son un modelo simplificado de UI móvil: tamaños S/M/L = 24/40/56 px y zonas inferior/central/superior a 120/320/560 px de distancia al pulgar; los umbrales de la auditoría son heurísticas de diseño.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible.
- Licencia: sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; deben revisarse antes de cualquier uso comercial.
- El modelo espera ser invocado con los prompts de sistema exactos de la aplicación y con `format` fijado al esquema JSON de la respuesta; fuera de ese contexto su calidad no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praha6248/gemma3-4b-ux-prismaflow-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
