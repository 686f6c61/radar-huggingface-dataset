# arcinstitute/evo2_7b

## Resumen
Evo 2 7B es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autoregresiva sobre billones de tokens de ADN. Con 7.000 millones de parámetros y 32 capas, está diseñado para modelar secuencias genómicas a resolución de un solo nucleótido y con una ventana de contexto de hasta 1.000.000 de nucleótidos en su checkpoint principal. Resuelve tareas de modelado y diseño de genomas en todos los dominios de la vida, desde bacterias y fagos hasta plantas y animales, incluido el genoma humano. Es relevante ahora porque permite analizar regiones genómicas muy largas sin fragmentar la secuencia, lo que facilita la predicción de efectos de variantes, la anotación funcional y el diseño de secuencias sintéticas. El modelo se distribuye con licencia Apache-2.0 y forma parte de la familia Evo 2, que también incluye variantes de 40B y 1B, así como checkpoints base entrenados con contexto de 8.192 nucleótidos.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Autoregresiva de lenguaje de ADN (detalles internos de atención/Hyena no detallados en la model card) |
| Parámetros totales | 7B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 1.000.000 de nucleótidos en `evo2_7b`; 8.192 en `evo2_7b_base` |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica para lenguaje natural; modela secuencias de ADN |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (tamaño del repositorio: 13,8 GB) |
| Capas | 32 |
| Tokenizador | Byte-level, vocabulario de 512, un token por nucleótido (según referencia externa) |
| Dataset de entrenamiento | `arcinstitute/opengenome2` |

## Arquitectura y entrenamiento
Evo 2 7B es un modelo autoregresivo de lenguaje de ADN con 32 capas y 7.000 millones de parámetros. Está entrenado sobre el dataset OpenGenome2, que reúne secuencias genómicas de procariotas y eucariotas, incluyendo bacterias, fagos, plantas, animales y humanos, con más de 8 billones de nucleótidos. El modelo emplea un tokenizador byte-level con vocabulario de 512 y un token por nucleótido, lo que permite modelar las secuencias a resolución de un solo nucleótido. La innovación principal es su capacidad para procesar contextos de hasta 1.000.000 de nucleótidos, muy superior a los 8.192 de los checkpoints base, lo que habilita el modelado de regiones genómicas extensas sin truncamientos. No se detalla en la información disponible si se aplicaron técnicas de RLHF o DPO, ni se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Modelado de secuencias de ADN a resolución de un solo nucleótido.
- Generación autoregresiva de secuencias de ADN.
- Análisis de genomas largos gracias a una ventana de contexto de hasta 1.000.000 de nucleótidos.
- Modelado de secuencias de procariotas y eucariotas, incluyendo genomas humanos.
- Diseño de secuencias genómicas, incluyendo elementos regulatorios y codificantes.
- Evaluación de la verosimilitud de secuencias para priorizar variantes o constructos.
- Soporte de tool calling: no disponible (no es un modelo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el modelo trabaja con ADN, no con lenguaje natural.
- Capacidad especial: tokenizador a nivel de nucleótido y contexto ultralargo para genómica.

## Casos de uso
- Modelado de genomas completos: procesar regiones de hasta 1.000.000 de pares de bases para identificar patrones de organización genómica, elementos repetidos o fronteras de dominios cromosómicos sin fragmentar la secuencia.
- Predicción de efectos de variantes: calcular la verosimilitud de secuencias portadoras de variantes frente a la secuencia de referencia para priorizar variantes potencialmente funcionales en estudios de asociación o diagnóstico.
- Diseño de elementos regulatorios: generar y evaluar candidatos de promotores, realzadores u otras regiones no codificantes con alta probabilidad bajo el modelo, para experimentos de biología sintética.
- Anotación funcional de metagenomas: modelar secuencias procedentes de distintos dominios de la vida y detectar regiones conservadas o atípicas en datos ambientales.
- Análisis evolutivo comparativo: comparar la verosimilitud de secuencias homólogas entre especies para estudiar restricciones evolutivas y regiones bajo selección.
- Filtrado de secuencias sintéticas: puntuar constructos de ADN generados por otros métodos y descartar aquellos con baja probabilidad según Evo 2 antes de su validación experimental.
- Adaptación a genomas específicos: partir del checkpoint base de 8.192 nucleótidos y hacer fine-tuning en un genoma de interés para tareas de anotación o predicción especializadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no hay cifras oficiales. Con 7B parámetros en FP16, los pesos ocupan aproximadamente 14 GB; las activaciones y la caché de contexto añaden memoria adicional.
- GPU recomendadas: para contexto corto, una GPU con 24 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100). Para contexto de hasta 1.000.000 de nucleótidos, es probable que se requieran varias GPU de alta capacidad (A100/H100) o técnicas de paralelización, aunque no se especifican requisitos exactos.
- ¿Cabe en GPU de consumo? Para contexto corto, una RTX 4090 de 24 GB podría alojar los pesos en FP16, pero el contexto largo excede la memoria de una GPU de consumo.
- Opciones de despliegue: el repositorio oficial de GitHub proporciona instrucciones y scripts. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Evo 2 7B | 7B | 1.000.000 | Apache-2.0 | HuggingFace |
| Evo 2 7B base | 7B | 8.192 | Apache-2.0 | HuggingFace |
| Evo 2 40B | 40B | 1.000.000 | Apache-2.0 | HuggingFace |
| Evo 2 1B base | 1B | 8.192 | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias
- Es un modelo de ADN, no un modelo de lenguaje natural: no admite instrucciones en texto ni conversaciones.
- Riesgo de alucinación biológica: las secuencias generadas pueden ser plausibles según el modelo pero no ser viables o funcionales in vivo; requieren validación experimental.
- Sesgos potenciales: el entrenamiento se realizó sobre OpenGenome2, cuya composición exacta no se detalla; puede haber un sesgo hacia organismos mejor representados en las bases de datos públicas.
- Limitaciones de contexto: el checkpoint `evo2_7b` soporta hasta 1.000.000 de nucleótidos, pero el checkpoint base solo 8.192; el uso de contextos largos implica un coste computacional y de memoria elevado.
- Licencia Apache-2.0: permite uso comercial, pero deben verificarse las regulaciones de bioseguridad y propiedad intelectual aplicables al diseño de secuencias genéticas.
- Ausencia de benchmarks públicos en la información disponible: no se puede comparar su rendimiento con otros modelos de ADN de forma cuantitativa.
- No se especifican cuantizaciones oficiales ni formatos alternativos de pesos, lo que puede limitar el despliegue en hardware modesto.

## Enlaces
- [HuggingFace: arcinstitute/evo2_7b](https://huggingface.co/arcinstitute/evo2_7b)
- [GitHub: ArcInstitute/evo2](https://github.com/arcinstitute/evo2)
- [Paper en bioRxiv](https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1)
- [Evo Designer](https://arcinstitute.org/tools/evo/evo-designer)
- [Blog: Evo 2 One Year Later](https://arcinstitute.org/news/evo-2-one-year-later)
- [HuggingFace: arcinstitute/evo2_40b](https://huggingface.co/arcinstitute/evo2_40b)
- [HuggingFace: arcinstitute/evo2_7b_base](https://huggingface.co/arcinstitute/evo2_7b_base)
- [HuggingFace: arcinstitute/evo2_1b_base](https://huggingface.co/arcinstitute/evo2_1b_base)
- [HuggingFace: Aquiles-ai/Evo2-7B](https://huggingface.co/Aquiles-ai/Evo2-7B)
- [AI/TLDR: Evo 2](https://ai-tldr.dev/tools/evo2/)
