# mstrasser/jeff-adapter-passage-relevant

## Resumen

jeff-adapter-passage-relevant es un adaptador LoRA de tipo clasificación de texto desarrollado por mstrasser sobre el modelo base jeff-base v1.4, un fine-tune de Qwen3.5-0.8B. El adaptador resuelve una tarea concreta dentro de pipelines de recuperación de información: determinar si un pasaje recuperado responde realmente a una pregunta sobre un sujeto y un periodo de tiempo determinados, devolviendo una de tres etiquetas (`yes`, `partly`, `no`).

A diferencia de un modelo generativo al uso, el adaptador opera como modelo de decisión: recibe un contexto (`source` y `question`) y un pasaje, y devuelve una probabilidad calibrada por opción en un único forward pass, sin texto generado que haya que parsear. Esto lo hace adecuado para integrarse como filtro en sistemas RAG donde los resultados de búsqueda pueden cubrir el tema correcto pero referirse a otra empresa, producto o año.

El modelo es relevante para equipos que construyen pipelines de retrieval y necesitan una etapa de verificación ligera, calibrada y de bajo coste computacional, con licencia Apache 2.0 y soporte exclusivo en inglés. Su tamaño reducido (derivado de un base de 0,8B parámetros) permite desplegarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (PEFT) sobre jeff-base v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA sobre base de 0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre jeff-base v1.4, un modelo de decisión pequeño derivado de Qwen3.5-0.8B. La arquitectura subyacente es, por tanto, un transformer de aproximadamente 0,8B parámetros, sobre el que se aplica una capa de adaptación de bajo rango. El motor de Jeff rechaza adaptadores entrenados sobre otra revisión del base, por lo que este adaptador carga únicamente sobre la revisión `v1.4` de `mstrasser/jeff-base`.

El adaptador fue entrenado el 25 de octubre de 2026 para la función `jeff.retrieval.passage-relevant.relevant`, una clasificación de tres clases (`yes`, `partly`, `no`) con probabilidades calibradas. La model card reporta métricas de calibración sobre un conjunto de 2.000 filas: con un umbral de confianza de 0,521 se obtiene una precisión del 99,5% y una cobertura del 100,0%. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificación de relevancia de pasajes: determina si un pasaje responde a una pregunta sobre un sujeto (persona, organización, sitio, producto o caso) y un periodo de tiempo concretos.
- Salida de tres clases con probabilidad calibrada: `yes` (el pasaje contiene todos los detalles solicitados para el sujeto y periodo correctos), `partly` (cubre el sujeto y periodo correctos pero solo parte de los detalles) y `no` (sujeto o periodo distintos, o solo hechos relacionados).
- Decisión en un único forward pass, sin generación de texto que parsear.
- Manejo de preguntas que abarcan varios periodos, con etiqueta `partly` cuando solo se cubren algunos.
- Detección de sujetos con nombres similares pero distintos (por ejemplo, Aster 1 frente a Aster 2).
- Detección de pasajes que solo indican que un dato no se conoce o no está decidido, clasificándolos como `no`.
- Soporte de ejecución local (`Jeff.local`) y remota vía API (`api.jeffhub.ai`).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Filtrado de resultados en pipelines RAG: tras una búsqueda vectorial o híbrida, el adaptador verifica si cada pasaje recuperado responde realmente a la pregunta del usuario sobre el producto o periodo correcto, descartando coincidencias temáticas pero no factuales antes de pasarlas al generador.
- Atención al cliente sobre catálogos de productos: en un asistente que responde sobre garantías, especificaciones o condiciones de distintos modelos, el adaptador evita que se cite la ficha de un producto con nombre similar (por ejemplo, Aster 1 en lugar de Aster 2).
- Verificación de documentación legal o contractual: comprobar que un fragmento de contrato recuperado corresponde a la parte, el ejercicio o la cláusula preguntados, reduciendo respuestas basadas en documentos de otro periodo.
- Búsqueda documental con dimensión temporal: en preguntas del tipo "¿qué se decidió en la reunión de marzo de 2026?", el adaptador distingue pasajes del periodo correcto de los de periodos adyacentes, marcando `partly` cuando solo cubre parte de los periodos solicitados.
- Control de calidad de datasets de QA: filtrar pares pregunta-pasaje en la construcción de conjuntos de entrenamiento o evaluación, usando la etiqueta y la confianza calibrada como criterio de aceptación.
- Enrutado dentro de un pipeline multi-etapa: usar la salida `no` para reintentar la recuperación con otra consulta y la salida `partly` para activar una segunda pasada de búsqueda que complete los detalles faltantes.
- Moderación de respuestas basadas en fuentes: antes de mostrar una respuesta citada, comprobar que el pasaje citado contiene efectivamente los detalles afirmados para el sujeto y periodo correctos.

## Benchmarks y rendimiento

| Test | Filas | Precision |
|---|---:|---:|
| SQuAD 2.0 (benchmark público de QA con etiquetas humanas) | 2.000 | 83,9% |
| Test interno (generador) | 2.000 | 99,5% |
| Test interno en dominios no vistos en entrenamiento (generador) | 2.000 | 99,1% |

Calibración de la función `relevant`:

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| `relevant` | 0,521 | 99,5% | 100,0% | 2.000 |

La precisión se define como la proporción de filas de test cuya respuesta principal fue correcta. El test interno procede del mismo generador que los datos de entrenamiento, por lo que mide menos que un benchmark público o un conjunto de documentos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al derivar de un base de 0,8B parámetros, la huella es reducida, pero no se publican cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el tamaño del base (0,8B) sugiere que puede ejecutarse en GPU de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: SDK de Python `jeff` con ejecución local (`Jeff.local`) o remota contra `https://api.jeffhub.ai`; el motor y los SDK están en github.com/firelex/jeff. Hasta que los paquetes estén en PyPI, deben instalarse desde el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeff-adapter-passage-relevant | Adaptador LoRA sobre base de 0,8B | no disponible | Clasificación de relevancia de pasajes (3 clases, calibrada) | apache-2.0 | Hugging Face; requiere jeff-base v1.4 |
| Modelos de reranking tipo cross-encoder (p. ej. familia BGE reranker) | Variable (decenas a cientos de millones) | no disponible | Puntuación de relevancia query-documento | Variable según modelo | Hugging Face |
| LLM generativos con prompting para verificación de pasajes | Miles de millones | Variable | Verificación mediante generación de texto | Variable | Hugging Face y APIs |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada. La comparación cualitativa se limita a la forma de salida (probabilidad calibrada en un forward pass frente a puntuación de reranking o texto generado) y al requisito de cargar únicamente sobre la revisión `v1.4` de jeff-base.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- El adaptador está acoplado a la revisión `v1.4` de `mstrasser/jeff-base`: el motor rechaza cargarlo sobre otra revisión, lo que limita la portabilidad y obliga a fijar versiones.
- No está diseñado para comparar varios pasajes entre sí; para esa tarea la model card remite a otras funciones (Passage selection y answer verification).
- El resultado del test interno (99,5%) procede del mismo generador que los datos de entrenamiento y sobreestima el rendimiento real; la referencia más fiable es SQuAD 2.0 con 83,9% de precisión.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de clasificación errónea en pasajes ambiguos o con sujetos de nombre muy similar.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base jeff-base v1.4 y de Qwen3.5-0.8B antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación por parte de la comunidad.
- El ecosistema (SDK, motor, API) depende de un proyecto joven (github.com/firelex/jeff) cuyos paquetes aún no están publicados en PyPI según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-passage-relevant
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página del catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.passage-relevant
- Repositorio de código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API de Jeff: https://api.jeffhub.ai
- Portal de Jeff: https://jeffhub.ai
