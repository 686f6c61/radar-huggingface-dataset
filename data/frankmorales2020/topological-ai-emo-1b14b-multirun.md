# frankmorales2020/topological-ai-emo-1b14b-multirun

## Resumen

El modelo `topological-ai-emo-1b14b-multirun` es una versión certificada bajo el estándar TOPO-2026 (Track II — Multi-Run) del modelo base `allenai/Emo_1b14b_1T`, desarrollado por Frank Morales Aguilera en el Sovereign Machine Laboratory (SOMALA). Se trata de un modelo de clasificación de texto basado en una arquitectura de mezcla de expertos (Mixture-of-Experts, MoE) con 1 000 millones de parámetros activos y 14 000 millones en total, diseñado específicamente para demostrar garantías matemáticas contra el olvido catastrófico en aprendizaje continuo.

La relevancia de este modelo radica en su enfoque en el aprendizaje continuo: mediante la técnica de anclajes primos y la teoría espectral aritmética, se busca que el modelo pueda aprender nuevas tareas sin degradar el rendimiento en tareas anteriores. En las pruebas de certificación se reporta un olvido combinado de 0,0% en cinco ejecuciones, lo que indica una estabilidad notable en las tareas evaluadas. El contexto es de 4096 tokens, la precisión es BFloat16 y la licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Emergent Modularity MoE (EMO) |
| Parámetros totales | 14 000 millones (14B) |
| Parámetros activos | 1 000 millones (1B) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

Detalles adicionales de la arquitectura: hidden size 2048, vocabulario de 100 352 tokens, 128 expertos (127 enrutados + 1 compartido) y 8 expertos activos por token. Precisión de entrenamiento: BFloat16.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura EMO del modelo base `allenai/Emo_1b14b_1T`, una variante de MoE donde se activan 8 expertos por token de un total de 128. Esta configuración permite un equilibrio entre capacidad total y eficiencia computacional. El proceso de entrenamiento para la certificación TOPO-2026 se centra en el aprendizaje continuo sobre tres tareas de clasificación de texto: A (World vs Sports), B (Business vs Sci/Tech) y C (World vs Sci/Tech). Se utilizan técnicas de anclaje basadas en números primos (anclajes primos {2, 3, 5, 7, 11, 13}) y una constante de seguridad (Λ=0.9785142874) aplicada en la capa de embedding, junto con la teoría espectral aritmética para garantizar la no interferencia entre tareas.

El entrenamiento se realizó con batch size 1, 3 épocas por tarea, optimizador AdamW y gradiente clipping con max_norm=1.0. Se ejecutaron 5 runs con una cuadrícula de tasas de aprendizaje (1e-4, 5e-5, 2e-4, 5e-5, 1e-4) con semilla fija 123. La mejor ejecución (Run 4) alcanzó una precisión del 99.6% en la tarea C y un olvido combinado del 0.0%.

## Capacidades

- Clasificación de texto en inglés, con soporte para categorías como World, Sports, Business y Sci/Tech.
- Aprendizaje continuo: el modelo está diseñado para incorporar nuevas tareas sin olvidar las anteriores, como se demuestra en la certificación TOPO-2026 con olvido cero en las tareas evaluadas.
- Es un modelo de clasificación de texto, no un modelo generativo; no se reportan capacidades de generación de texto, tool calling, razonamiento multi-paso ni visión.
- El modelo está certificado para clasificación de texto de dominio específico (noticias), no para tareas generales de lenguaje.

## Casos de uso

- Clasificación de artículos de noticias: el modelo puede etiquetar automáticamente artículos en categorías como deportes, mundo, negocios o ciencia y tecnología, gracias a su entrenamiento en tareas de clasificación de texto.
- Moderación de contenido temático: permite filtrar contenido según la categoría temática, por ejemplo, separar noticias de deportes de noticias de negocios en un agregador de feeds.
- Análisis de tendencias en medios: útil para monitorizar la distribución de temas en un corpus de noticias, aprovechando su capacidad de aprendizaje continuo para añadir nuevas categorías sin degradar las existentes.
- Sistemas de recomendación basados en categorías: puede alimentar un sistema de recomendación de noticias clasificando los artículos para personalizar el contenido según los intereses del usuario.
- Investigación en aprendizaje continuo: sirve como caso de estudio para evaluar técnicas de mitigación del olvido catastrófico en modelos MoE, dado su certificación con olvido cero.
- Prototipos de clasificación de texto con bajo coste: al tener 1B de parámetros activos, es viable para entornos con recursos limitados, aunque se requiere la infraestructura del modelo base.

## Benchmarks y rendimiento

La model card proporciona resultados específicos de la certificación TOPO-2026, pero no incluye benchmarks generales como MMLU, HumanEval o GSM8K. Los datos reportados son:

| Métrica | Resultado (mejor run) | Umbral | Estado |
|---|---|---|---|
| Precisión Tarea A (World vs Sports) | 98.33% | ≥85% | PASS |
| Precisión Tarea B (Business vs Sci/Tech) | 95.80% | ≥85% | PASS |
| Precisión Tarea C (World vs Sci/Tech) | 99.60% | ≥85% | PASS |
| Olvido combinado (FGT) | 0.0% ± 0.0% | ≤10% | PASS |
| Memoria de anclaje | 48.0 KB | O(1) | PASS |
| Integridad del anclaje | Verificado (hash: 089f5c7b3eaccab6) | — | PASS |
| AGI_gate | 0.996 | = 1.0 | NO ALCANZADO |
| S_NARROW | 0 | > 0 | NO ALCANZADO |

Estos datos provienen de la certificación TOPO-2026, no de benchmarks de referencia estándar. No se han publicado resultados de benchmarks generales en la información disponible.

## Requisitos de hardware

No se especifican en la información proporcionada. Sin embargo, dado que el modelo tiene 1B de parámetros activos y 14B en total, la inferencia requiere una GPU con al menos 8-10 GB de VRAM en cuantización de 16 bits (considerando solo los parámetros activos), aunque la arquitectura MoE puede requerir más memoria para los expertos. No se proporcionan datos de latencia ni throughput.

- No se indica GPU recomendada en la documentación.
- Se recomienda probar con vLLM, TGI o llama.cpp para despliegue, aunque no se confirma compatibilidad.
- Dado el tamaño activo de 1B, es plausible que quepa en GPUs de consumo como RTX 3090 o RTX 4090 con cuantización, pero esto no está confirmado.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría en la información proporcionada. El modelo base `allenai/Emo_1b14b_1T` es la referencia inmediata, pero no se ofrecen datos comparativos de rendimiento con otros clasificadores de texto.

## Limitaciones y advertencias

- El modelo es exclusivamente de clasificación de texto en inglés; no soporta otros idiomas ni tareas de generación.
- La certificación TOPO-2026 no alcanza el criterio AGI_gate (0.996 vs 1.0) ni S_NARROW (0), lo que indica que no se logra una "singularidad estrecha" con precisión perfecta.
- La memoria de anclaje es de 48 KB, pero el método de entrenamiento requiere la implementación de la técnica de anclaje y la constante Λ, lo que añade complejidad de despliegue.
- No se han evaluado sesgos ni riesgos de alucinación (al ser un clasificador, el riesgo es menor, pero no se descarta).
- La licencia Apache-2.0 permite uso comercial, pero la certificación TOPO-2026 es un estándar propietario que podría requerir atribución adicional.
- El modelo base `allenai/Emo_1b14b_1T` es un modelo de investigación; su rendimiento en tareas generales de lenguaje no está documentado en esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/frankmorales2020/topological-ai-emo-1b14b-multirun
- Modelo base: https://huggingface.co/allenai/Emo_1b14b_1T
- Paper de referencia (Zenodo): https://zenodo.org/records/20951925
- PDF sobre Topological AI (Zenodo): https://zenodo.org/records/20360042/files/topological_ai_FINAL.pdf?download=1
- Repositorio del modelo base (GitHub): https://github.com/allenai/EMO
