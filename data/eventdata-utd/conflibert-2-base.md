# eventdata-utd/ConfliBERT-2-base

## Resumen

ConfliBERT-2 base es un encoder de tipo ModernBERT (150 M de parámetros) especializado en conflicto político, violencia política, diplomacia y datos de eventos. Lo desarrolla el grupo UTD Event Data de la Universidad de Texas en Dallas (eventdata-utd), continuando el linaje del ConfliBERT original de 2021. El problema que aborda es concreto: el ConfliBERT de 2021 arrastra la arquitectura BERT de 2019, una ventana de 512 tokens y un corpus que termina en 2020. ConfliBERT-2 sustituye el encoder por ModernBERT (ventana de 8.192 tokens, atención modernizada) y aplica un pase completo de preentrenamiento de lenguaje enmascarado sobre 22.300 millones de tokens procedentes de 16 fuentes, desde registros diplomáticos de la Guerra Fría hasta texto web de 2026.

No es un modelo conversacional ni generativo: es un encoder enmascarado (`fill-mask`) pensado para ser reentrenado (*fine-tuning*) con unos cientos de ejemplos etiquetados y, a partir de ahí, codificar millones de documentos en una sola GPU sin que los datos salgan de la máquina. Su relevancia ahora es práctica: ofrece contexto de 8.192 tokens (unas doce páginas) en un modelo de 150 M que corre en hardware de consumo, con un coste medido de unas 0,7 horas de GPU por millón de documentos a 512 tokens.

La evaluación publicada lo sitúa en la media de 77,37 F1 en nueve tareas de conflicto, por delante de ModernBERT-base (77,03) y a la par de ModernBERT-large (77,42) con 2,6 veces menos parámetros, aunque por debajo del ConfliBERT de 2021 (78,25). Hay una versión large de 395 M en entrenamiento, anunciada como `eventdata-utd/ConfliBERT-2-large`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, bidirectional, RoPE, atención con flash-attn o SDPA) |
| Parámetros totales | 149.655.232 (dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible: el autor no publica variantes cuantizadas (GGUF, AWQ, GPTQ). Al ser un encoder de 150 M es viable fp16/bf16 e int8 con herramientas estándar, pero no hay artefactos oficiales |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`), tamaño del repo 0,6 GB |
| Tokenizer | ModernBERT cased, 50.368 tokens |
| Pipeline declarado | `fill-mask` |
| Modelo base | `answerdotai/ModernBERT-base` (fine-tune por preentrenamiento continuado) |
| Compatibilidad con endpoints | Sí (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder bidireccional de 2024 que sustituye el BERT clásico: incorpora embeddings rotatorios (RoPE), alternancia de capas de atención global y local, y soporte nativo de `flash-attn` con retroceso a PyTorch SDPA (mismos resultados). El modelo se inicializa desde `answerdotai/ModernBERT-base` y se somete a un pase completo de preentrenamiento con objetivo de lenguaje enmascarado (MLM) sobre 22.300 millones de tokens de 16 fuentes de dominio, con cobertura temporal que va de registros diplomáticos de la Guerra Fría a texto web de 2026. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un encoder MLM.

La innovación principal no es algorítmica sino de dominio y de ventana: frente a los 33 GB de texto de conflicto hasta 2020 del ConfliBERT de 2021, este modelo amplía la cobertura temporal hasta 2026 y eleva el contexto de 512 a 8.192 tokens. La validación del preentrenamiento se hace con pseudo-perplejidad sobre 2.000 bloques reservados del corpus (máscara fija del 30 %, 613.809 tokens enmascarados): 3,419 para ConfliBERT-2 base, frente a 4,446 de ModernBERT-base y 3,368 de ModernBERT-large. Es decir, el dominio se aprende hasta un nivel cercano a un modelo 2,6 veces mayor.

## Capacidades

- Relleno de máscaras (`fill-mask`) sobre texto en inglés con vocabulario de dominio: términos de conflicto, actores armados, geografía política.
- Clasificación de secuencias tras fine-tuning (`AutoModelForSequenceClassification`): relevancia, tipo de evento, etiquetas de códigos como CAMEO, grados de severidad, categorías de codebook.
- Etiquetado de tokens / NER (`AutoModelForTokenClassification`): actores, localizaciones y entidades en textos periodísticos y de monitoreo.
- Procesamiento de documentos largos de hasta 8.192 tokens en una sola pasada (audiencias completas, acuerdos de paz, informes de país, actas del Consejo de Seguridad).
- Etiquetado de juicio sobre el documento completo, no solo sobre fragmentos: tendencias mensuales de crisis, propósito de una audiencia, gradación de severidad.
- Multilingüe: no. Solo inglés.
- Tool calling / function calling: no disponible; el modelo no genera texto ni emite llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible; no es un modelo generativo ni tiene modo *thinking*.
- Visión o audio: no disponible.
- Ejecución local y reproducible: inferencia y fine-tuning en una sola GPU, sin salida de datos a servicios externos.

## Casos de uso

- **Codificación de eventos a escala (CAMEO)**: fine-tuning con unos cientos de documentos anotados según el codebook propio y clasificación por lotes de archivos de noticias completos. Es adecuado porque alcanza 87,31 F1 en la clase de evento CAMEO y 0,7 horas de GPU por millón de documentos a 512 tokens.
- **Filtrado de relevancia en monitorización**: descartar noticias no relacionadas con violencia política antes de pasarlas a un pipeline más caro. El modelo obtiene 87,67 F1 en relevancia SATP, con el coste de un encoder de 150 M en lugar de un LLM generativo.
- **NER de actores y localizaciones**: extracción de perpetradores, fuerzas armadas y lugares en informes de monitoreo (69,10 F1 en re3d NER, 75,50 en CAMEO NER). Requiere pasar `add_prefix_space=True` al tokenizer cuando el texto ya viene pretokenizado.
- **Análisis de documentos largos**: lectura de acuerdos de paz, informes de país o actas de audiencias de doce páginas en una pasada. En el corpus IndiaPoliceEvents, cuando la evidencia cae más allá del token 512, el modelo de 2021 truncado baja su recall de 0,81 a 0,23; aquí la evidencia sigue dentro de la ventana.
- **Etiquetado de deterioro de crisis**: asignar categorías tipo CrisisWatch a partir del documento completo. Un encoder afinado alcanza 0,79 de recall en deterioros donde un LLM de frontera en zero-shot obtiene 0,12 de precisión, según la model card.
- **Investigación con fuentes sensibles**: organizaciones humanitarias o equipos académicos que no pueden enviar material a una API externa pueden ejecutar el modelo en local; el coste es una GPU consumer y el corpus no sale de la máquina.
- **Construcción de bases de datos académicas reproducibles**: al ser Apache 2.0 y con pesos safetensors, los resultados de un artículo pueden replicarse con la misma versión del modelo y del tokenizer.
- **Anotación asistida con pocos ejemplos**: unos cientos de documentos etiquetados a mano bastan para enseñar un codebook nuevo y escalar la anotación a millones de documentos, lo que encaja con flujos de trabajo de ciencias políticas donde el etiquetado manual es el cuello de botella.

## Benchmarks y rendimiento

Protocolo común: learning rate elegido en validación (semilla 123), tres semillas con esa tasa, F1 de test promediado. Las tareas NER aplican la corrección de espacio de prefijo y una rejilla de learning rates ampliada.

| Tarea | ConfliBERT (2021) | ModernBERT-base | ModernBERT-large | ConfliBERT-2 base |
|---|---|---|---|---|
| SATP relevance | **89,35** | 87,21 | 88,44 | 87,67 |
| IndiaPoliceEvents, frases | 66,06 | 66,59 | **67,19** | 65,56 |
| IndiaPoliceEvents, documentos | **70,79** | 63,11 | 63,61 | 64,72 |
| InsightCrime | 68,22 | **69,56** | 69,32 | 68,54 |
| CAMEO event class | **89,46** | 86,95 | 86,01 | 87,31 |
| 20 Newsgroups | 79,90 | 80,49 | 80,68 | **81,02** |
| BBC News | 98,12 | 97,81 | **98,13** | 96,87 |
| re3d NER | 68,41 | 68,51 | 68,10 | **69,10** |
| CAMEO NER | 73,98 | 73,02 | 75,32 | **75,50** |
| **Media** | **78,25** | 77,03 | 77,42 | 77,37 |

| Métrica de preentrenamiento | ModernBERT-base | ModernBERT-large | ConfliBERT-2 base |
|---|---|---|---|
| Pseudo-perplejidad (2.000 bloques, máscara 30 %, 613.809 tokens) | 4,446 | 3,368 | 3,419 |

Lectura de los datos según el autor: ConfliBERT-2 base supera a ModernBERT-base en seis de nueve tareas y empata con ModernBERT-large; el ConfliBERT de 2021 mantiene 0,9 puntos de ventaja en la media, concentrados en una sola tarea (IndiaPoliceEvents documentos, 6 puntos). La mayor ganancia frente a ambos ModernBERT es CAMEO NER (+2,5 sobre ModernBERT-base). Aviso metodológico del propio autor: las filas de ModernBERT-base y ConfliBERT-2021 provienen de un harness piloto (RTX 4090, transformers 4.x) y las de ConfliBERT-2 y ModernBERT-large de NCSA Delta (A100, transformers 5.17); hay una repetición de ModernBERT-base en el mismo harness pendiente de publicar.

## Requisitos de hardware

- Pesos: 149,7 M de parámetros, en torno a 0,6 GB en fp32 y 0,3 GB en fp16/bf16. El repo completo ocupa 0,6 GB.
- VRAM estimada para inferencia (orientativa): menos de 1 GB para los pesos en fp16; con activaciones y lotes grandes a 8.192 tokens conviene reservar del orden de 4-8 GB. Cabe en cualquier GPU consumer con 8 GB o más, y en CPU para lotes pequeños.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 3060 12 GB y similares para fine-tuning e inferencia a 512-2.048 tokens; A100 para experimentos de contexto completo y barridos de learning rate, que es el hardware usado en las evaluaciones publicadas (NCSA Delta).
- Fine-tuning: viable en una sola GPU consumer; el harness piloto del autor usó una RTX 4090.
- Despliegue: `transformers` (pipeline `fill-mask`, `AutoModelForSequenceClassification`, `AutoModelForTokenClassification`), Trainer estándar e Inference Endpoints de Hugging Face (tag `endpoints_compatible`). Se recomienda instalar `flash-attn` para entradas largas; sin él funciona con PyTorch SDPA con las mismas salidas.
- No hay artefactos GGUF ni soporte documentado en llama.cpp, Ollama o vLLM para este modelo en la información disponible.
- Rendimiento: 0,7 horas de GPU por millón de documentos a 512 tokens, lo que equivale aproximadamente a 1,4 millones de documentos por hora de GPU. Con 8.192 tokens el coste de atención crece de forma cuadrática y el throughput baja; `flash-attn` lo mitiga.
- Hiperparámetros de referencia: learning rate 2e-5 a 8e-5 para clasificación y 8e-5 a 2,4e-4 para NER, seleccionados sobre partición de validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Preentrenamiento de dominio | Media F1 (9 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ConfliBERT-2 base | 150 M | 8.192 | 22,3 B tokens, 16 fuentes, hasta 2026 | 77,37 | Apache 2.0 | Publicado (oct. 2026) |
| ConfliBERT (2021) | 110 M | 512 | 33 GB de texto de conflicto, hasta 2020 | 78,25 | No disponible en la información proporcionada | Público |
| ModernBERT-base | 150 M | 8.192 | Ninguno | 77,03 | No disponible en la información proporcionada | Público |
| ModernBERT-large | 395 M | 8.192 | Ninguno | 77,42 | No disponible en la información proporcionada | Público |
| ConfliBERT-2 large | 395 M | 8.192 | mismo corpus de dominio | No disponible (en entrenamiento) | Apache 2.0 (anunciada para la familia) | No publicado |

Frente al ConfliBERT de 2021, la diferencia es de arquitectura y ventana (8.192 frente a 512 tokens) más cobertura temporal hasta 2026, a cambio de 0,9 puntos de F1 medio y de la necesidad de reconstruir cabezas y datasets tokenizados. Frente a ModernBERT-large, ofrece rendimiento equiparable con 2,6 veces menos parámetros y menor coste de inferencia.

## Limitaciones y advertencias

- Solo inglés: no cubre prensa en español, francés, árabe ni otros idiomas, algo crítico en investigación sobre conflictos no anglófonos.
- No es un modelo generativo: no admite instrucciones, no conversa, no hace tool calling ni razonamiento multi-paso. Usarlo como chatbot produce resultados sin sentido.
- No es un reemplazo directo del ConfliBERT de 2021: tokenizer distinto (50.368 tokens, cased), por lo que las cabezas afinadas y los datasets tokenizados deben rehacerse.
- Sesgo de corpus: fuentes periodísticas, registros diplomáticos y material de ONG en inglés; previsible sobrerrepresentación de conflictos con cobertura mediática anglófona y de fuentes con agenda editorial propia.
- Riesgo de error en `fill-mask`: puede rellenar máscaras con términos plausibles pero factualmente incorrectos; no verifica hechos ni cita evidencia.
- Riesgo de error en clasificación: en documentos ambiguos o con evidencia más allá del token 8.192, las etiquetas pueden ser incorrectas; el propio autor documenta una caída de recall de 0,81 a 0,23 en el modelo de 2021 al truncar a 512 tokens, y el 8.192 sigue siendo un límite finito.
- En IndiaPoliceEvents a nivel de documento, ConfliBERT-2 base (64,72) queda por debajo del modelo de 2021 (70,79), lo que sugiere que el preentrenamiento continuado no mejora todas las tareas de agregación documental.
- Caveat metodológico: las comparativas del autor mezclan dos harness distintos (RTX 4090 con transformers 4.x frente a A100 con transformers 5.17); la columna de ModernBERT-base está pendiente de repetición homogénea.
- Rendimiento de NER sensible al tokenizer: sin `add_prefix_space=True` en texto pretokenizado se pierde F1.
- Licencia Apache 2.0: permite uso comercial y modificación sin garantías; no hay cláusulas de uso responsable más allá de la licencia estándar.
- Madurez: publicado el 25 de octubre de 2026 con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eventdata-utd/ConfliBERT-2-base
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Organización en Hugging Face: https://huggingface.co/eventdata-utd
- Catálogo de modelos de la organización: https://huggingface.co/eventdata-utd/models
- Proyecto UTD Event Data: https://eventdata.utdallas.edu/
- Repositorio y benchmark ConfliBERT (SATP, InsightCrime, CAMEO, re3d, 20 Newsgroups, BBC): https://github.com/eventdata/ConfliBERT
- Organización en GitHub: https://github.com/eventdata
- Repositorio IndiaPoliceEvents (slanglab): URL truncada en la información disponible; no se incluye el enlace completo.
- Versión large anunciada (`eventdata-utd/ConfliBERT-2-large`): aún no publicada.
- Referencia académica del ConfliBERT original: Hu et al. (2022), citada en la documentación del proyecto; URL no disponible en la información proporcionada.
