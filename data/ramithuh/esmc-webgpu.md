# ramithuh/esmc-webgpu

## Resumen

ESMC-300M WebGPU es una exportación de los pesos del modelo de lenguaje de proteínas ESMC-300M (desarrollado originalmente por Chan Zuckerberg Biohub) en formato safetensors fragmentado, diseñada específicamente para ejecutarse de forma nativa en navegador mediante WebGPU. El repositorio, publicado por el usuario ramithuh, no entrena un modelo nuevo: redistribuye los 30 bloques transformer del checkpoint biohub/esmc-300m-2024-12 (333 millones de parámetros) en dos precisiones (INT8 y FP16) con fragmentos de como máximo 25 MB para facilitar su carga incremental desde el navegador.

El problema que resuelve es la fricción de desplegar un modelo biológico de tamaño medio en entornos cliente sin backend: al trocear los pesos y ofrecer una versión INT8 de aproximadamente 320 MB, permite inferencia de embeddings de proteínas directamente en una pestaña del navegador sobre una GPU compatible con WebGPU. Es relevante para herramientas interactivas de bioinformática (visualización de embeddings, scoring de mutaciones, búsqueda de similitud) que quieren evitar enviar secuencias a un servidor.

La información disponible sobre el modelo es escasa y proviene casi exclusivamente de la model card del repositorio: no se detallan datos de entrenamiento, composición del corpus ni resultados de benchmarks del modelo base. La licencia declarada es MIT, heredada del modelo original de Chan Zuckerberg Biohub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (30 bloques) para proteínas, exportado para WebGPU |
| Parámetros totales | 333 millones (300M según nomenclatura del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 simétrica por fila (escalas/normas en F32); FP16 (normas y embeddings en F32) |
| Idiomas soportados | no disponible (modelo de secuencias de proteínas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors fragmentados (shards <= 25 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es ESMC-300M, un modelo de lenguaje de proteínas con arquitectura transformer de 30 bloques y 333 millones de parámetros. Esta ficha se refiere exclusivamente a la exportación WebGPU de dichos pesos, no a un proceso de entrenamiento propio: el autor parte del checkpoint biohub/esmc-300m-2024-12 (hash 7f10b20ae75017b2dbc884070e03434515709a8d) y lo convierte a dos formatos de precisión. No se dispone de información sobre el corpus de entrenamiento original, el número de tokens procesados ni si hubo fases de ajuste fino con RLHF o DPO.

La innovación técnica del repositorio es el empaquetado: los pesos se dividen en fragmentos de como máximo 25 MB para permitir su descarga progresiva en el navegador, y se ofrecen dos variantes. La versión INT8 aplica cuantización simétrica por fila a las matrices, manteniendo escalas y normas en F32, con un tamaño aproximado de 320 MB. La versión FP16 conserva los pesos lineales en media precisión y las normas y embeddings en F32, ocupando unos 636 MB. El autor reporta una verificación frente a la referencia en PyTorch sobre una GPU NVIDIA GB10 con WebGPU, con un error relativo RMS máximo de 7,84e-6 y cero omisiones.

## Capacidades

- Generación de embeddings de proteínas a partir de secuencias de aminoácidos.
- Cálculo de logits en posiciones enmascaradas (masked-logits).
- Single-mask-scan: evaluación zero-shot de mutaciones mediante DMS (deep mutational scanning) y pseudo-perplejidad.
- Puntuación de mutaciones (mutate-score) para estimar el efecto de sustituciones de aminoácidos.
- Ejecución nativa en navegador mediante WebGPU, sin backend servidor.
- Carga incremental de pesos por fragmentos de hasta 25 MB.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Visualización interactiva de embeddings de proteínas: una aplicación web puede cargar los shards INT8 y calcular representaciones vectoriales en el cliente para proyectarlas con UMAP o t-SNE sin enviar secuencias a un servidor.
- Scoring de mutaciones en herramientas docentes: el modo mutate-score permite explorar el efecto estimado de sustituciones concretas en una proteína dentro de un cuaderno o demo web, con latencia declarada de 23 a 43 ms en GB10 para la variante INT8.
- Búsqueda de similitud en el navegador: los embeddings generados localmente pueden compararse contra una base de vectores precalculada para tareas de anotación funcional aproximada.
- Evaluación zero-shot de DMS: el modo single-mask-scan permite reproducir experimentos de deep mutational scanning sin infraestructura GPU dedicada, útil en investigación exploratoria.
- Prototipado rápido de pipelines de bioinformática: desarrolladores que quieran validar una idea antes de montar un servicio con el modelo original en PyTorch pueden usar esta exportación para pruebas locales.
- Demos educativas de modelos de proteínas: al ejecutarse en WebGPU, facilita mostrar el funcionamiento interno de un protein language model en charlas y talleres sin depender de conectividad a un clúster.
- Integración en aplicaciones de escritorio basadas en web (Electron, Tauri): el bundle safetensors fragmentado permite empaquetar inferencia local en herramientas de escritorio con aceleración GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad numérica frente a la referencia en PyTorch (max relRMS 7,84e-6, 0 skips) y una latencia de 23 a 43 ms para la variante INT8 en una GPU NVIDIA GB10 con WebGPU en estado "warm".

## Requisitos de hardware

- VRAM estimada: aproximadamente 320 MB para los pesos INT8 y 636 MB para FP16, más overhead de activaciones y buffers de WebGPU (no cuantificado en la información disponible).
- GPU recomendadas: el autor verificó sobre NVIDIA GB10; cualquier GPU con soporte WebGPU (AMD RDNA2+, NVIDIA Pascal+ en navegadores modernos, Apple Silicon) es candidata, aunque no se han publicado pruebas en otras.
- GPU de consumo: por tamaño, cabe holgadamente en GPUs de consumo con WebGPU, pero no hay validación publicada fuera de GB10.
- Opciones de despliegue: navegador con WebGPU; el formato safetensors fragmentado también puede cargarse desde otros runtimes que lean safetensors, aunque la exportación está pensada para WebGPU.
- Latencia: 23-43 ms en GB10 para INT8 en estado warm; no se dispone de datos de throughput ni de latencia en frío.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque de despliegue |
|---|---|---|---|---|
| ramithuh/esmc-webgpu (esta ficha) | 333M | no disponible | MIT | WebGPU en navegador, safetensors fragmentado |
| biohub/esmc-300m-2024-12 | 300M | no disponible | MIT | PyTorch, checkpoint original |
| Otros protein language models (p. ej. ESM-2) | no disponible en la información | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no hay datos de entrenamiento, composición del corpus, sesgos conocidos ni evaluación de calidad del modelo base.
- El repositorio es una exportación de pesos, no un modelo entrenado por el autor; la responsabilidad sobre el comportamiento recae en el modelo original de Chan Zuckerberg Biohub.
- No se han publicado evaluaciones en navegadores distintos de la verificación sobre GB10; el rendimiento y la compatibilidad en otras GPUs WebGPU son desconocidos.
- La latencia reportada (23-43 ms) corresponde a estado warm en GB10; en frío o en hardware inferior puede ser considerablemente mayor.
- El modelo trabaja con secuencias de proteínas, no con lenguaje natural: no debe esperarse soporte multilingüe ni generación de texto convencional.
- Aunque la licencia es MIT, se recomienda revisar el THIRD_PARTY_NOTICE.md del modelo original para confirmar obligaciones de atribución en uso comercial.
- Riesgo de alucinación no evaluado: no hay información sobre la fiabilidad de las puntuaciones de mutación en contextos fuera de distribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/esmc-webgpu
- Modelo base: https://huggingface.co/biohub/esmc-300m-2024-12
