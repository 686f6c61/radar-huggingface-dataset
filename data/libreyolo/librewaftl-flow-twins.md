# LibreYOLO/LibreWAFTl-flow-twins

## Resumen

LibreWAFTl-flow-twins es un checkpoint de estimación de flujo óptico (optical flow) basado en WAFT (Warping-Alone Field Transforms), el método propuesto por Yihan Wang y Jia Deng en el paper publicado en ICLR 2026 (arXiv:2506.21526). El modelo ha sido empaquetado por LibreYOLO para su uso dentro de su propia librería, manteniendo intactos los parámetros aprendidos del checkpoint original de Princeton Vision & Learning Lab.

La variante concreta corresponde a la configuración `l` (large) con backbone Twins-SVT-Large, un encoder de 136,0 M de parámetros. El checkpoint original procede del schedule de entrenamiento zero-shot de WAFT (TartanAir, después FlyingChairs y después FlyingThings3D), lo que lo hace especialmente útil para generalización a dominios no vistos sin ajuste fino.

Su relevancia radica en que WAFT propone una arquitectura de flujo óptico que prescinde de las capas de correlación costosas computacionalmente, sustituyéndolas por un enfoque basado únicamente en warping. El resultado es un modelo más simple y eficiente que los estimadores de flujo clásicos, ahora disponible en un formato listo para producción dentro del ecosistema LibreYOLO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAFT (Warping-Alone Field Transforms) con encoder Twins-SVT-Large |
| Parametros totales | 136,0 M (encoder Twins-SVT-Large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; procesa pares de fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause (WAFT) + Apache 2.0 (encoder Twins-SVT-Large) |
| Formato de pesos | `.pt` (PyTorch, empaquetado para la librería `libreyolo`) |

## Arquitectura y entrenamiento

WAFT es una arquitectura de estimación de flujo óptico que elimina las capas de correlación (correlation layers) presentes en los métodos dominantes tipo RAFT, sustituyéndolas por operaciones de warping sobre las características extraídas. El encoder utilizado en esta variante es Twins-SVT-Large, un transformer con atención espacialmente separable procedente de Meituan-AutoML/Twins, integrado a través de `timm` bajo licencia Apache 2.0. El modelo recibe pares de fotogramas y produce un campo de flujo denso de dimensión (H, W, 2) en píxeles, con componentes (dx, dy).

El checkpoint se entrenó siguiendo el schedule zero-shot descrito por los autores: primero TartanAir, después FlyingChairs y finalmente FlyingThings3D. Esta secuencia está diseñada para maximizar la generalización a dominios no vistos. Las modificaciones aplicadas por LibreYOLO se limitan al empaquetado de metadatos del checkpoint; los parámetros aprendidos y sus nombres no se han alterado, según indica la model card. El script de conversión está disponible en el repositorio de LibreYOLO (`weights/convert_waft_weights.py`).

## Capacidades

- Estimación de flujo óptico denso entre pares de fotogramas consecutivos.
- Procesamiento por lotes: N fotogramas de entrada producen N-1 flujos.
- Salida en píxeles con componentes (dx, dy) por píxel, en resolución (H, W, 2).
- Generalización zero-shot a dominios no vistos gracias al schedule de entrenamiento empleado.
- Integración nativa con la librería `libreyolo` mediante la clase `LibreYOLO`.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento: es un modelo puramente visual de image-to-image.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo procesa secuencias de fotogramas y devuelve el flujo entre cada par consecutivo, adecuado para tareas de análisis de movimiento en pipelines de visión por computador.
- Estabilización de vídeo: el flujo denso permite calcular compensaciones de movimiento entre fotogramas y aplicar transformaciones de estabilización en postproducción.
- Interpolación de fotogramas: los campos de flujo (dx, dy) sirven como base para sintetizar fotogramas intermedios en pipelines de aumento de tasa de refresco.
- Seguimiento de objetos (tracking): el flujo óptico proporciona correspondencias densas entre fotogramas que alimentan algoritmos de seguimiento multiobjeto.
- Percepción en robótica y vehículos autónomos: estimación de movimiento relativo entre imágenes consecutivas de cámaras en movimiento, con la ventaja de la generalización zero-shot a entornos no vistos durante el entrenamiento.
- Análisis de movimiento en vídeo científico o médico: cuantificación de desplazamientos en secuencias de imágenes donde se requiere un campo de flujo denso y preciso.
- Detección de movimiento anómalo: comparación de flujos esperados frente a observados en secuencias de vigilancia para identificar eventos fuera de lo normal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 136,0 M de parámetros en el encoder, el checkpoint completo en precisión FP32 ocuparía aproximadamente 0,5 GB, coherente con el tamaño del repositorio (0,5 GB).
- GPU recomendadas: no disponible. Por tamaño del modelo, es plausible su ejecución en GPU consumer, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el tamaño del checkpoint (0,5 GB) sugiere que cabría en GPUs con VRAM moderada, pero no se aportan datos oficiales.
- Opciones de despliegue: la única vía documentada es la librería `libreyolo` mediante `LibreYOLO("LibreWAFTl-flow-twins.pt")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreWAFTl-flow-twins | 136,0 M (encoder) | WAFT con Twins-SVT-Large | Pares de fotogramas | BSD 3-Clause + Apache 2.0 | Hugging Face (LibreYOLO) |
| WAFT (otras variantes del zoo) | no disponible | WAFT con distintos backbones | Pares de fotogramas | BSD 3-Clause | Google Drive (upstream Princeton-VL) |
| RAFT | no disponible | Flujo óptico con correlation layers | Pares de fotogramas | BSD 3-Clause (upstream) | Repositorio Princeton-VL |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no tiene capacidades lingüísticas ni de razonamiento simbólico.
- No se han publicado métricas de benchmarks en la información disponible; no es posible evaluar su precisión frente a alternativas sin consultar el paper original.
- La licencia combinada (BSD 3-Clause + Apache 2.0) permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio para cumplir con los requisitos de atribución de ambas licencias.
- El modelo zoo upstream de WAFT no publica una licencia específica de pesos; LibreYOLO aloja el checkpoint bajo BSD 3-Clause del repositorio, lo que conviene verificar antes de un despliegue comercial.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí existe riesgo de flujos erróneos en regiones oclusiones, texturas repetitivas o movimientos muy grandes.
- Sin datos sobre cuantización, latencia ni requisitos exactos de VRAM; es necesario validar el rendimiento en el hardware objetivo.
- El modelo está pensado para integrarse con `libreyolo`; su uso fuera de esa librería requiere adaptar el script de conversión o el formato de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreWAFTl-flow-twins
- Paper WAFT (arXiv): https://arxiv.org/abs/2506.21526
- Repositorio WAFT upstream: https://github.com/princeton-vl/WAFT
- Commit de referencia upstream: https://github.com/princeton-vl/WAFT/commit/b152ff1cad1af8c185ee7b141997c48ff3334c87
- Encoder Twins-SVT-Large: https://github.com/Meituan-AutoML/Twins
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
