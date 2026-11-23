# nutrientdocs/nutrient-document-decision-v2

## Resumen

`nutrient-document-decision-v2` es un modelo especializado en el procesamiento de documentos desarrollado por Nutrient (nutrientdocs). No es un modelo generativo: no produce texto libre, sino que lee una imagen de página y su texto asociado una sola vez y responde a preguntas tipadas sobre el documento (sí/no, elección entre opciones, puntuación ordinal, regiones en la página y fragmentos exactos de texto). Está diseñado como un "modelo de decisión" de tipo *system-one*: una pasada, múltiples respuestas, cada una con una puntuación de confianza calibrada por tipo de salida.

La versión v2 amplía la v1 con tres capacidades nuevas: detección de cajas (*boxes*) con etiquetas opcionales y confianza por caja y por etiqueta, detección de *spans* (fragmentos de caracteres exactos) con etiquetas, y segmentación de flujos de páginas (*document split*) guiada por instrucciones en lenguaje natural. Además, las confianzas están calibradas por tipo de salida, de modo que un valor de 0,8 corresponde aproximadamente a un 80 % de acierto agregado.

El modelo se distribuye con licencia comercial propietaria (`nutrient-commercial`) y solo declara soporte para inglés. Su relevancia radica en que unifica en un único modelo tareas que habitualmente requieren varios especialistas (clasificación documental, *grounding*, detección de alucinaciones, detección de PII, segmentación de flujos), con resultados competitivos frente a sistemas propietarios y modelos especializados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión documental; pipeline `image-text-to-text`, sin generación de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | `nutrient-commercial` (licencia comercial propietaria, etiquetada como `other`) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de transformer, número de capas, dimensión oculta ni estrategia de atención). El modelo se presenta como un especialista documental de tipo *decision model* que procesa conjuntamente imagen de página y texto, y emite respuestas tipadas sin generar texto. La innovación principal declarada es la calibración de confianza por tipo de salida y la capacidad de responder múltiples preguntas heterogéneas en una sola lectura de la página.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona evaluaciones sobre conjuntos propios y públicos (DocLayNet, Forms, Tobacco3482, OpenPSS, TABME++, Tobacco800, LettuceDetect v2, RAGTruth, router-signal-suite), lo que sugiere entrenamiento y evaluación sobre corpus documentales diversos, pero sin detallar la receta de entrenamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Respuestas de tipo `noul` (sí/no) con probabilidad de "sí".
- Respuestas de tipo `choice` (elección entre opciones) con probabilidad por opción.
- Respuestas de tipo `score` (escala ordinal) con distribución de probabilidades.
- Detección de `boxes`: regiones en la página, opcionalmente etiquetadas, con confianza de localización y etiqueta; admite restricción a una sola caja (`max_boxes: 1`).
- Detección de `spans`: fragmentos de caracteres exactos en un campo de texto, opcionalmente etiquetados, con confianza de solapamiento (≥ 50 % con el span correcto) y confianza de etiqueta.
- Clasificación documental de imagen más OCR.
- Clasificación de figuras con vocabulario abierto (*open-vocabulary*), incluyendo robustez ante sinónimos en la redacción de etiquetas.
- Segmentación de flujos de páginas (*document split*) siguiendo instrucciones en lenguaje natural.
- Detección de alucinaciones: identificación de palabras de una respuesta no respaldadas por el contexto.
- Detección de PII (datos personales) como señal de enrutamiento.
- Preguntas formuladas en lenguaje natural y combinables en una misma petición sobre una página o un flujo de páginas.
- Sin generación de texto: todas las salidas son decisiones estructuradas con confianza.

## Casos de uso

- Clasificación automática de documentos en pipelines de ingesta: el modelo clasifica páginas de imagen más OCR en categorías predefinidas (formularios, facturas, contratos) con macro-F1 de hasta 0,995 en DocLayNet, lo que permite enrutar documentos a los procesos adecuados sin un clasificador específico por tipo.
- Segmentación de flujos de páginas en digitalización masiva: con instrucciones en lenguaje natural, separa documentos dentro de un PDF o lote escaneado (F1 de 0,994 en TABME++ y 0,990 en Tobacco800), sustituyendo reglas heurísticas frágiles por un modelo que sigue la instrucción del usuario.
- Verificación de *grounding* en sistemas RAG: comprueba si una afirmación está respaldada por su fuente documental (ROC AUC de 0,941 en inglés), útil para filtrar respuestas antes de mostrarlas al usuario.
- Detección de alucinaciones en respuestas generadas: identifica qué palabras de una respuesta no están respaldadas por el contexto (F1 de ejemplo de 89,5 en LettuceDetect v2), integrándose como capa de control de calidad sobre un LLM generativo.
- Detección de PII en textos documentales: señal de enrutamiento con ROC AUC de 0,946 en el conjunto router-signal-suite, adecuada para decidir si un documento requiere tratamiento de datos personales antes de su procesamiento posterior.
- Extracción de campos con localización: mediante `boxes` y `spans` etiquetados, localiza y etiqueta regiones y palabras exactas (por ejemplo, número de factura o fecha) en la página, con confianza por localización y por etiqueta, útil en extracción estructurada sin generación de texto.
- Clasificación de figuras y elementos gráficos con vocabulario abierto: top-1 de 0,944 en 48 etiquetas amplias y 0,891 en etiquetas especializadas sobre 9.375 imágenes, útil para catalogar tablas, gráficos y diagramas en repositorios documentales.
- Respuestas de tipo sí/no o elección sobre documentos: por ejemplo, verificar si un contrato contiene una cláusula concreta o seleccionar la categoría correcta entre opciones definidas por el usuario, con probabilidad calibrada por opción.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan v2 con v1, con el especialista de Nutrient para cada tarea y con el mejor sistema no-Nutrient del mismo leaderboard. No se han publicado resultados de benchmarks adicionales en la información disponible.

**Grounding (ROC AUC):**

| Conjunto | v2 | v1 | Especialista | Mejor otro |
|---|---|---|---|---|
| Inglés (5.000 pares) | 0,941 | 0,923 | 0,925 | 0,884 (Jev TypeSafe) |
| Multilingüe (8.421 pares) | 0,949 | 0,949 | 0,965 | 0,916 (Jev TypeSafe) |

**Clasificación documental, imagen + OCR (macro-F1):**

| Pista | v2 | v1 | Especialista | Mejor otro |
|---|---|---|---|---|
| DocLayNet | 0,995 | 0,914 | 0,968 | 0,832 (Claude Opus 4.5 / 5, Gemini Flash, GPT-sol) |
| Forms | 1,000 | 0,997 | 1,000 | 1,000 (varios) |
| OOD (tipos no vistos) | 0,768 | 0,632 | 0,946 | n/a |
| OOV (redacción de etiqueta no vista) | 0,919 | 0,812 | 0,830 | n/a |
| Tobacco3482 | 0,834 | 0,940 | 0,735 | 0,894 (OpenAI Decisions, gpt-6-luna) |

**Clasificación de vocabulario abierto / figuras (top-1, 9.375 imágenes):**

| Pista | v2 | v1 | Especialista | Mejor otro |
|---|---|---|---|---|
| Amplia (48 etiquetas) | 0,944 | 0,911 | 0,880 | 0,822 (OpenAI Decisions, gpt-6-luna) |
| Especializada | 0,891 | 0,827 | 0,713 | 0,596 (OpenAI Decisions, gpt-6-luna) |
| Sinónimos | 0,848 | 0,833 | 0,730 | 0,880 (OpenAI Decisions, gpt-6-luna) |

**Document split (F1):**

| Flujo | v2 | v1 | Especialista | Mejor otro |
|---|---|---|---|---|
| our-200 | 0,936 | 0,962 | 0,944 | 0,942 (GPT-sol) |
| OpenPSS-short | 0,624 | 0,683 | 0,652 | 0,598 (Gemini Flash) |
| OpenPSS-long | 0,923 | 0,959 | 0,891 | 0,244 (Gemini Flash) |
| TABME++ | 0,994 | 0,960 | 0,943 | n/a |
| Tobacco800 | 0,990 | 0,987 | 0,969 | n/a |
| val-full | 0,926 | 0,958 | 0,917 | n/a |

**Spans alucinados (LettuceDetect v2 test):**

| Métrica | v2 | Vela 3.1-fast | Vela 3-fast | LettuceDetect v2 (mmBERT-base) |
|---|---|---|---|---|
| F1 por ejemplo | 89,5 | 87,7 | 87,2 | 84,7 |
| F1 por span de caracteres | 59,1 | 66,4 | 65,4 | 62,7 |
| RAGTruth F1 ejemplo / span | 79,1 / 50,1 | 78,1 / 57,5 | n/a | 79,2 / 58,9 (LettuceDetect-large v1) |

Nota de la model card: los resultados de v2 se midieron sobre las 10.698 respuestas de test completas, mientras que las columnas de Vela 3.1-fast proceden de las 8.490 respuestas "clean" del mismo test, por lo que las filas no son idénticas. En respuestas no inglesas, v2 obtiene un F1 por ejemplo de 95,4.

**Señal de PII (ROC AUC, router-signal-suite test, mismas 3.000 filas):**

| Conjunto | v2 | Vela (publicado) | mmBERT-32K (publicado) |
|---|---|---|---|
| 3.000 textos | 0,946 | 0,943 | 0,920 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no incluye el tamaño del modelo, el número de parámetros ni las cuantizaciones soportadas, por lo que no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. La model card no menciona integración con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia.
- Latencia y throughput: no disponible. La model card destaca el diseño de una sola lectura por página para responder múltiples preguntas, pero no publica cifras de latencia ni de rendimiento.

## Comparativa con modelos similares

La model card compara el modelo con especialistas de la propia familia Nutrient y con sistemas propietarios y de terceros en cada leaderboard. Se resumen las alternativas más relevantes:

| Modelo | Categoría | Parámetros | Contexto | Rendimiento comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nutrient-document-decision-v2 | Decisión documental multi-tarea | no disponible | no disponible | Grounding inglés ROC AUC 0,941; DocLayNet F1 0,995; split TABME++ F1 0,994 | nutrient-commercial | Hugging Face |
| nutrient-document-decision (v1) | Decisión documental multi-tarea | no disponible | no disponible | Grounding inglés 0,923; DocLayNet 0,914; sin boxes/spans | nutrient-commercial | Hugging Face |
| grounding-en / grounding-multilingual (especialistas Nutrient) | Grounding | no disponible | no disponible | 0,925 inglés; 0,965 multilingüe | no disponible | Hugging Face |
| document-classification-v2 (especialista Nutrient) | Clasificación documental | no disponible | no disponible | DocLayNet 0,968; OOD 0,946 | no disponible | Hugging Face |
| LettuceDetect v2 (mmBERT-base) | Detección de alucinaciones | no disponible | no disponible | F1 ejemplo 84,7; F1 span 62,7 | no disponible | Hugging Face |
| Vela 3.1-fast | Detección de alucinaciones | no disponible | no disponible | F1 ejemplo 87,7; F1 span 66,4 | no disponible | Hugging Face |
| Claude Opus 4.5 / 5, Gemini Flash, GPT-sol, OpenAI Decisions (gpt-6-luna) | Modelos generalistas / propietarios | no disponible | no disponible | Inferiores en DocLayNet (0,832) y clasificación amplia (0,822); competitivos en Tobacco3482 (0,894) | propietaria | APIs comerciales |

No se dispone de datos de parámetros, contexto ni licencia de la mayoría de los comparadores en la información proporcionada.

## Limitaciones y advertencias

- Licencia comercial propietaria (`nutrient-commercial`): el uso comercial está sujeto a los términos de Nutrient; no es una licencia de código abierto y debe revisarse antes de cualquier despliegue en producción.
- Solo declara soporte para inglés; los resultados multilingües de *grounding* (0,949) no implican soporte general en otros idiomas para el resto de tareas.
- No genera texto: no puede usarse para redacción, resumen ni respuesta conversacional; sus salidas son decisiones estructuradas.
- Riesgo de calibración imperfecta: aunque las confianzas están calibradas por tipo de salida, la calibración es agregada y puede no cumplirse en subpoblaciones o dominios alejados de los datos de evaluación.
- Rendimiento inferior en tipos de documento no vistos (OOD 0,768 frente a 0,946 del especialista) y en Tobacco3482 (0,834 frente a 0,940 de v1), lo que indica degradación fuera de distribución.
- Detección de spans de alucinación menos precisa que alternativas: F1 por span de caracteres de 59,1 frente a 66,4 de Vela 3.1-fast; detecta *que* hay alucinación con precisión similar o mejor, pero marca *qué* palabras con menor exactitud.
- En segmentación de flujos, v1 supera a v2 en varias pistas (our-200, OpenPSS, val-full), por lo que la mejora de v2 no es uniforme.
- No se publican detalles de arquitectura, tamaño, contexto ni cuantizaciones, lo que dificulta la planificación de recursos y la auditoría técnica.
- Riesgo de sesgos no documentado: la model card no describe sesgos conocidos ni evaluaciones de equidad.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nutrientdocs/nutrient-document-decision-v2
- Demo: https://huggingface.co/spaces/nutrientdocs/nutrient-document-decision-v2-demo
- Versión anterior (v1): https://huggingface.co/nutrientdocs/nutrient-document-decision
- Leaderboard de grounding: https://huggingface.co/spaces/nutrientdocs/grounding-leaderboard
- Leaderboard de clasificación documental: https://huggingface.co/spaces/nutrientdocs/document-classification-leaderboard
- Leaderboard de clasificación con vocabulario abierto: https://huggingface.co/spaces/nutrientdocs/doc-openvocab-leaderboard
- Leaderboard de document split: https://huggingface.co/spaces/nutrientdocs/doc-split-leaderboard
- Especialista grounding-en: https://huggingface.co/nutrientdocs/grounding-en
- Especialista grounding-multilingual: https://huggingface.co/nutrientdocs/grounding-multilingual
- Especialista document-classification-v2: https://huggingface.co/nutrientdocs/document-classification-v2
- Especialista doc-img-classification: https://huggingface.co/nutrientdocs/doc-img-classification
- Especialista doc-split-v2: https://huggingface.co/nutrientdocs/doc-split-v2
- Modelo Vela 3.1-fast (comparador): https://huggingface.co/vllm-sr/vela3.1-fast
