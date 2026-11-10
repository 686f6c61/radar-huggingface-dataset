# None00000/Solar-Filament-None00000

## Resumen

Solar-Filament-None00000 es un paquete de inferencia y pesos entrenados para la segmentación de instancias de filamentos solares en imágenes de disco completo en H-alpha. Lo desarrollan Phạm Đức Công y Lê Anh Đức (FPT University, Hanói) como solución al Solar Filament Segmentation Challenge 2026 (IEEE BigData Cup), usando anotaciones MAGFiLO sobre imágenes GONG. No es un modelo de lenguaje: es un pipeline de visión por computador especializado que combina propuestas, filtrado y refinamiento recurrente sobre un backbone DINOv3.

El sistema resuelve un problema de segmentación panóptica con una clase única (filamento), donde cada instancia debe devolverse como una máscara binaria independiente del tamaño de la imagen (2048 × 2048 píxeles). La innovación principal es un esquema de refinamiento recurrente guiado por prompts que corrige las propuestas iniciales de forma iterativa, logrando un Panoptic Quality (PQ) de 0,4405 en validación cruzada de 5 folds sobre 707 imágenes etiquetadas, por encima del 0,34 que obtiene un anotador humano frente a otro.

El modelo es relevante para la comunidad de física solar y visión aplicada porque demuestra que un pipeline multi-etapa con refinamiento puede superar el acuerdo inter-anotador en una tarea de segmentación de instancias con objetos alargados y de bajo contraste. El repositorio incluye pesos, código de entrenamiento de cada etapa, un notebook end-to-end y la evidencia de cada decisión de diseño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa (propuesta → filtro → refinador recurrente) sobre backbone DINOv3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 2048 × 2048 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT y DINOv3 (licencia combinada `mit-and-dinov3`) |
| Formato de pesos | safetensors, joblib (paquete PyTorch) |

## Arquitectura y entrenamiento

El pipeline final sigue un esquema de tres etapas: generación de propuestas, filtrado de candidatas y refinamiento recurrente guiado por prompts. La etapa de propuestas parte de una formulación de segmentación semántica binaria seguida de componentes conexos 8-conectados (área mínima de 8 px), una formulación que el equipo validó con un oráculo semántico: al fusionar todas las máscaras de una anotación y volver a separarlas por componentes conexos se obtiene un PQ de 0,9989, lo que justifica la aproximación porque el 99,6 % de los filamentos son una sola pieza conexa y la mediana de distancia al vecino más cercano es de 140 px.

Sobre esa base, el refinador recurrente corrige las máscaras de forma iterativa, y el filtro descarta propuestas que no corresponden a filamentos reales. El backbone es DINOv3, un modelo de visión auto-supervisado, cuyos pesos se distribuyen bajo su propia licencia. El entrenamiento se realizó sobre 707 imágenes etiquetadas (2011–2022) con 1154 registros de anotación y 8199 máscaras de filamento en total; 411 imágenes tienen un anotador, 145 tienen dos y 151 tienen tres. No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de visión).

## Capacidades

- Segmentación de instancias de filamentos solares en imágenes H-alpha de disco completo (2048 × 2048 px, 8 bits, JPEG).
- Generación de una máscara binaria independiente por filamento, exportable como COCO run-length encoding.
- Refinamiento recurrente de máscaras guiado por prompts para corregir contornos y separar instancias.
- Filtrado de falsos positivos mediante una etapa aprendida dedicada.
- Evaluación con Panoptic Quality (PQ), con variante estricta de emparejamiento húngaro uno-a-uno.
- Inferencia end-to-end reproducible mediante notebook incluido.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Monitorización operativa de la actividad solar: el pipeline procesa imágenes GONG H-alpha de disco completo y devuelve máscaras por filamento, lo que permite seguir la evolución de filamentos a lo largo de secuencias temporales con un PQ validado de 0,4405.
- Catalogación automática de filamentos: dado el volumen de imágenes (707 de entrenamiento y 180 de test en el reto), el modelo permite generar catálogos de instancias con coordenadas y áreas sin anotación manual, reduciendo el coste frente al etiquetado experto.
- Validación cruzada de anotaciones humanas: al superar el acuerdo inter-anotador (0,4405 frente a 0,34), puede usarse como segunda opinión para detectar discrepancias entre expertos en bases de datos como MAGFiLO.
- Investigación en clima espacial: la segmentación precisa de filamentos alimenta estudios sobre eyecciones de masa coronal y su relación con la actividad magnética, usando las máscaras como entrada a modelos físicos posteriores.
- Benchmarking de segmentación de instancias en dominios científicos: el pipeline y su oráculo semántico sirven como referencia reproducible para evaluar métodos de segmentación en objetos alargados y de bajo contraste.
- Despliegue en pipelines de procesamiento por lotes: el paquete de inferencia en PyTorch con pesos en safetensors permite integrar la segmentación en flujos automatizados de descarga y procesado de imágenes GONG.
- Docencia y reproducción científica: el notebook end-to-end y el código de entrenamiento de cada etapa permiten reproducir el resultado y estudiar el efecto del refinamiento recurrente frente al baseline semántico.

## Benchmarks y rendimiento

| Sistema | Panoptic Quality |
|---|---|
| Pipeline final, validación cruzada 5-fold out-of-fold (707 imágenes) | 0,4405 |
| Pipeline final, leaderboard público (aprox. mitad de las 180 imágenes de test) | 0,39 |
| Baseline semántico + componentes conexos (split antiguo) | 0,40 – 0,41 |
| Referencia: un anotador humano frente a otro (296 imágenes multi-anotadas) | 0,34 |
| Oráculo semántico ideal → componentes conexos (regla de organizadores) | 0,9989 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 1,2 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el backbone DINOv3 y el procesamiento de imágenes de 2048 × 2048 px sugieren requisitos moderados, pero no hay datos oficiales.
- Opciones de despliegue: PyTorch (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto/entrada | PQ / rendimiento | Licencia |
|---|---|---|---|---|---|
| Solar-Filament-None00000 | Segmentación de instancias de filamentos solares | no disponible | 2048 × 2048 px | 0,4405 (5-fold OOF) | MIT + DINOv3 |
| Baseline semántico + componentes conexos (mismo equipo) | Segmentación semántica + post-proceso | no disponible | 2048 × 2048 px | 0,40 – 0,41 | MIT + DINOv3 |
| Anotador humano (referencia inter-anotador) | Anotación manual | no aplica | 2048 × 2048 px | 0,34 | no aplica |

No se dispone de información sobre otros modelos públicos comparables para esta tarea específica de segmentación de filamentos solares.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en filamentos solares en imágenes GONG H-alpha; no generaliza a otras modalidades ni a otros objetos.
- El PQ en leaderboard público (0,39) es inferior al de validación cruzada (0,4405), lo que indica cierta caída de rendimiento en datos no vistos.
- Los filamentos rotos en dos piezas o fusionados en una sola máscara penalizan fuertemente la métrica PQ, por lo que errores de instancia tienen impacto desproporcionado.
- La licencia es combinada (`mit-and-dinov3`): el uso comercial está sujeto a los términos de la licencia de DINOv3, que debe consultarse antes de desplegar en producción.
- No se documentan sesgos específicos ni riesgos de alucinación (no aplica a un modelo generativo), pero la calidad depende de la calidad y el contraste de las imágenes de entrada.
- El pipeline requiere imágenes de 2048 × 2048 px en el formato esperado; entradas con otras resoluciones o preprocesados distintos pueden degradar el resultado.
- No hay información sobre latencia, throughput ni requisitos mínimos de hardware, lo que dificulta planificar despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/None00000/Solar-Filament-None00000
- Competición Kaggle: https://www.kaggle.com/competitions/filament-segmentation-2026
- Licencia DINOv3: https://github.com/Cdshf01230/Solar-Filament-None00000/blob/main/third_party/DINOv3_LICENSE.md
- Repositorio del proyecto (referenciado en la licencia): https://github.com/Cdshf01230/Solar-Filament-None00000
