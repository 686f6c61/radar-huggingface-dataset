# Coenliu62/TimesJev

## Resumen

TimesJev es un adaptador ligero para razonamiento sobre series temporales que permite a un modelo de lenguaje "System 1" (Decider, de Mapika) responder preguntas de opción múltiple sobre series temporales en un único forward pass. Lo desarrolla Coenliu62 y se publica bajo licencia Apache-2.0. La innovación no reside en un LLM nuevo, sino en un pequeño codificador (0,54M–0,67M parámetros, 2–3 MB) que transforma 32 características numéricas de cada serie en vectores que sustituyen a tokens especiales dentro del prompt, sin modificar el modelo base congelado.

El modelo aborda un problema concreto: los LLM no procesan bien series numéricas largas dentro del texto. TimesJev evita ese cuello de botella resumiendo cada serie en 32 características con nombre (media, pendiente de tendencia, autocorrelación, etc.) y dejando que Decider razone sobre esa representación compacta. El resultado es un pipeline de bajo coste computacional que devuelve la opción elegida y la probabilidad de cada alternativa.

Es relevante ahora porque demuestra una vía eficiente para tareas de razonamiento sobre datos estructurados (detección de anomalías, clasificación de actividad, preguntas verdadero/falso) sin reentrenar el LLM ni consumir grandes ventanas de contexto. No obstante, el repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la ficha, y el tamaño del repo es de 0,0 GB (los pesos de Decider se descargan aparte).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador ligero sobre LLM congelado (Decider); transformer en el backbone |
| Parametros totales | 0,54M (encoder para Decider-2B); 0,67M (encoder para Decider-4B); el LLM base no se incluye |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 0,0 GB; pesos del encoder en `decider-2b/<dataset>/` y `decider-4b/<dataset>/`) |

## Arquitectura y entrenamiento

TimesJev no es un modelo monolítico: es un conjunto de codificadores entrenados por separado para cada subconjunto del dataset TSQA (env, aiops, health, web, cls, mcq, tf). El flujo es: (1) se calculan 32 características de la serie temporal (media, pendiente de tendencia, autocorrelación, etc.), (2) se escriben en el prompt como texto con tokens especiales tras cada valor, (3) el codificador convierte cada valor en un vector que ocupa el lugar de ese token, y (4) Decider lee el prompt y elige una opción. El LLM base permanece congelado; solo se entrena el codificador.

El entrenamiento se realizó sobre las preguntas de entrenamiento de un único dataset de TSQA por codificador, durante 3 épocas (6 épocas para env, aiops, web, cls y mcq en el caso de Decider-4B), con learning rate 1e-3. No se menciona RLHF, DPO ni decodificación especulativa. La selección de las 32 características se detalla en el repositorio de GitHub, no en la model card.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre series temporales en un solo forward pass.
- Detección de anomalías en cuatro dominios: entorno (env), operaciones de TI (aiops), salud (health) y web.
- Clasificación de actividad humana a partir de aceleración X, Y, Z en 6 actividades (cls).
- Preguntas de opción múltiple genéricas (mcq) y verdadero/falso (tf).
- Salida con la opción elegida y la probabilidad de cada opción.
- Procesamiento de series descritas como listas numéricas dentro del texto de la pregunta (p. ej. `[4.0, 6.0, 1.0]`).
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Monitorización de infraestructura TI: usar el codificador `aiops` para clasificar métricas de servidores como normales o anómalas, integrándolo en alertas operativas con un coste de inferencia mínimo al no reentrenar el LLM.
- Detección de anomalías en métricas web: el codificador `web` permite evaluar series de métricas de servidores (como el ejemplo de Yahoo del quickstart) y devolver la probabilidad de anomalía para priorizar revisiones.
- Salud y signos vitales: el codificador `health` puede clasificar series fisiológicas como normales o anómalas en triaje asistido, con la salvedad de que no es un dispositivo médico.
- Reconocimiento de actividad humana: el codificador `cls` clasifica aceleraciones X, Y, Z en una de 6 actividades, útil en aplicaciones de wearables o análisis de movimiento.
- Evaluación educativa o benchmarks de series temporales: el codificador `mcq` responde preguntas de opción múltiple sobre series, sirviendo como baseline rápido en experimentos de razonamiento temporal.
- Filtrado y verificación de afirmaciones: el codificador `tf` responde verdadero/falso sobre propiedades de una serie, útil en pipelines de validación de datos o control de calidad.
- Prototipado de investigación: al ser codificadores de 2–3 MB sobre un LLM congelado, permite experimentar con representaciones de series temporales sin coste de fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del LLM base (Decider-2B o Decider-4B) y de su cuantización, no del codificador (2–3 MB).
- GPU recomendadas: no disponible; la model card solo indica que se usa GPU cuando está disponible.
- Cabe en GPU consumer: previsiblemente sí para Decider-2B en cuantización baja, pero no se aportan datos concretos; para Decider-4B no disponible.
- Opciones de despliegue: script propio `timesjev_decider.py` con PyTorch y `huggingface_hub`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos de razonamiento sobre series temporales ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo admite preguntas de opción múltiple; no soporta forecasting ni respuestas de texto libre.
- Cada codificador se entrenó en un único dataset de TSQA; preguntas de otros formatos o dominios pueden dar respuestas menos fiables.
- Si la serie aparece en las opciones en lugar del texto de la pregunta, se lee como texto plano y no se procesa con el codificador.
- El modelo solo ve las 32 características calculadas, no los valores crudos de la serie, lo que puede perder información relevante.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación inherente al LLM base (Decider), no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Decider y del dataset TSQA.
- Repositorio con 0 descargas y 0 likes; madurez y mantenimiento no verificables.
- No es un dispositivo médico ni debe usarse en decisiones clínicas sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Coenliu62/TimesJev
- Código: https://github.com/coenliu/TimesJev
- Modelo base Decider-2B: https://huggingface.co/Mapika/decider-2b
- Modelo base Decider-4B: https://huggingface.co/Mapika/decider-4b
- Dataset TSQA: https://huggingface.co/datasets/Time-MQA/TSQA
