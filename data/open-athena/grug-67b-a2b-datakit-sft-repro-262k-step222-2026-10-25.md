# open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step222-2026.10.25

## Resumen

Grug-67B-A2B-Datakit-SFT-Repro-262K-Step222-2026.10.25 es un checkpoint intermedio de tipo SFT (supervised fine-tuning) publicado por open-athena. Se trata de un modelo de mezcla de expertos (MoE) con 67.078.882.816 parámetros totales (unos 67,1 mil millones) y aproximadamente 2 mil millones de parámetros activos por token, según indica el sufijo A2B de su nombre. Deriva del modelo base open-athena/snowball-67b-a2b-base-262k-qk175-skew8 mediante ajuste supervisado sobre un conjunto de datos no especificado en la información disponible.

El modelo está pensado para generación de texto conversacional y se distribuye con la librería transformers y pesos en formato safetensors. Su ventana de contexto nominal es de 262.144 tokens (262K), deducida del identificador del modelo base, lo que lo sitúa en la categoría de contexto largo. La arquitectura propietaria se etiqueta como grug_moe dentro del ecosistema transformers, lo que implica que requiere código personalizado o confianza remota para cargarse.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint intermedio de un proceso de entrenamiento en curso, publicado con fecha en el nombre (2026.10.25) y en el paso 222, lo que sugiere que forma parte de una traza de reproducibilidad más que de un lanzamiento estable. El acceso está restringido (gated) y la licencia es OpenMDW 1.1, un acuerdo de pesos abiertos con condiciones específicas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, tipo `grug_moe` |
| Parametros totales | 67.078.882.816 (~67,1 B) |
| Parametros activos | ~2 B por token (según sufijo A2B) |
| Longitud de contexto | 262.144 tokens (262K, según identificador del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos etiquetada como `grug_moe` en los metadatos del repositorio. Con 67,1 mil millones de parámetros totales y aproximadamente 2 mil millones activos por token, el modelo sigue el patrón de MoE disperso típico: un router selecciona un subconjunto de expertos por token, de modo que el coste computacional de inferencia se aproxima al de un modelo denso de 2 B mientras la capacidad de representación se acerca a la de un modelo de 67 B. El modelo base, snowball-67b-a2b-base-262k-qk175-skew8, incorpora en su nombre indicios de técnicas de atención con sesgo (skew) y posiblemente variantes de atención con query-key de dimensión 175, aunque no se dispone de documentación técnica que detalle estas innovaciones.

El entrenamiento de este checkpoint corresponde a una fase de SFT sobre el modelo base, en el paso 222 de un proceso de ajuste supervisado. El nombre incluye "Datakit-SFT-Repro", lo que apunta a una reproducción de un pipeline de SFT sobre un conjunto de datos interno ("Datakit") del que no se publican detalles de composición, número de tokens ni proporción de datos de código, matemáticas o multilingüe. No hay información disponible sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación preferencial posteriores al SFT. Tampoco se documentan detalles sobre la estrategia de decodificación, el uso de decodificación especulativa ni optimizaciones de atención lineal.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen "conversational", lo que indica ajuste para diálogo multi-turno.
- Razonamiento y generación de código: no hay evidencia explícita en los metadatos; la capacidad debe evaluarse empíricamente, ya que no se publican benchmarks.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: los idiomas no están declarados en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Contexto largo: la ventana de 262K tokens permite procesar documentos extensos y conversaciones de muchas vueltas, aunque no se ha verificado su rendimiento efectivo en recuperación de información a larga distancia.

## Casos de uso

- Procesamiento de documentos largos: con una ventana de 262K tokens, el modelo puede ingerir contratos, informes o expedientes completos en una sola pasada y responder preguntas sobre su contenido sin necesidad de fragmentación ni recuperación externa.
- Atención al cliente automatizada: el ajuste conversacional y el contexto extendido permiten mantener historiales de conversación muy largos, con trazabilidad de interacciones previas y menor pérdida de contexto en diálogos multi-turno.
- Reproducción de experimentos de SFT: al ser un checkpoint intermedio identificado por paso (Step222) y fecha, resulta adecuado para auditar la evolución del entrenamiento y comparar el efecto del ajuste supervisado frente al modelo base.
- Evaluación de arquitecturas MoE dispersas: con 2 B de parámetros activos, es un candidato para estudiar el equilibrio entre calidad y coste computacional en despliegues con recursos limitados.
- Generación asistida en entornos de investigación: su licencia OpenMDW 1.1 y su naturaleza de checkpoint intermedio lo hacen útil para experimentos académicos que requieran inspeccionar estados intermedios del entrenamiento.
- Prototipado de asistentes con contexto largo: para aplicaciones donde el coste por token importa pero se necesita capacidad de memoria extensa, el ratio 67B/2B activos ofrece un compromiso atractivo, siempre que se valide su calidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 134 GB solo para pesos, lo que exige múltiples GPU o nodos.
- Cuantización a 8 bits: en torno a 67 GB de pesos, viable en 2×A100 80GB o 2×H100 80GB.
- Cuantización a 4 bits: en torno a 34-38 GB, posible en una sola A100 80GB o H100 80GB; en GPUs de consumo como RTX 4090 (24 GB) no cabe en 4 bits sin offloading a CPU o uso de memoria unificada.
- GPU recomendadas: H100 80GB, A100 80GB, y en configuraciones multi-GPU para precisión completa; para cuantización agresiva, A100 40GB podría ser insuficiente.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al requerir arquitectura personalizada (`grug_moe`), es probable que necesite código específico del autor y confianza remota en transformers.
- Latencia y throughput: no disponibles; al tener solo ~2 B de parámetros activos, el throughput por token debería aproximarse al de un modelo denso de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grug-67B-A2B (este) | 67,1 B | ~2 B | 262K | OpenMDW 1.1 | Gated en HuggingFace |
| Mixtral 8x7B | 46,7 B | ~12,9 B | 32K | Apache 2.0 | Abierta |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32K | Apache 2.0 | Abierta |
| DeepSeek-V2-Lite | 15,7 B | 2,4 B | 32K | DeepSeek License | Abierta con condiciones |

La comparación con Mixtral 8x7B es pertinente por tamaño total, aunque este último activa muchos más parámetros por token. Frente a Qwen1.5-MoE-A2.7B y DeepSeek-V2-Lite, el modelo de open-athena ofrece un contexto mucho mayor (262K frente a 32K) pero carece de benchmarks públicos, de documentación de idiomas y de una licencia permisiva estándar como Apache 2.0. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (Step222), no un modelo final; su calidad puede ser inferior a la de un modelo completamente entrenado y no se garantiza estabilidad.
- No se publican benchmarks, por lo que no hay evidencia objetiva de su rendimiento en tareas estándar.
- Los idiomas soportados no están declarados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, datos de entrenamiento ni filtrado de contenido, lo que dificulta evaluar riesgos de alucinación y sesgo.
- La licencia OpenMDW 1.1 impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue en producción.
- El acceso es restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad inmediata.
- La arquitectura `grug_moe` es personalizada y puede requerir `trust_remote_code=True`, con el riesgo de seguridad que ello implica.
- El contexto de 262K no garantiza buen rendimiento en recuperación a larga distancia; no hay evaluaciones publicadas tipo needle-in-a-haystack.
- El tamaño del repositorio (134,2 GB) complica el almacenamiento y la descarga en entornos con ancho de banda limitado.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step222-2026.10.25
- Modelo base: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Licencia OpenMDW 1.1: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
