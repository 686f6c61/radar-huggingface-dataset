# Amr-Hegazy/grt-large-isoparam

## Resumen

El modelo GRT Large (large-isoparam) es un checkpoint del Gated Recurrent Transformer (GRT), una arquitectura que introduce recurrencia en el bloque compartido de un transformer para mejorar la expresividad sin aumentar el número de parámetros. Desarrollado por Amr Hegazy, Amr Alanwar y Mostafa Elhoushi, se presenta en el artículo "Gated Recurrent Transformers: Expressive Depth through Recurrent Modulation" (arXiv:2608.15062). El modelo cuenta con aproximadamente 781 millones de parámetros (según el archivo safetensors) y una longitud de contexto de 1024 tokens, entrenado sobre unos 9.800 millones de tokens del dataset Common Pile filtrado.

Su relevancia radica en que demuestra que la reutilización recurrente de bloques puede igualar o superar a modelos más grandes con menos parámetros, ofreciendo una alternativa eficiente en términos de memoria y cómputo. Bajo restricciones isoFLOP, un GRT de 3 capas iguala la precisión de un GPT-2 Small de 12 capas; bajo restricciones isoParam, una recurrencia más profunda alcanza una pérdida de validación de 2.76 frente a 2.84 de un modelo no recurrente con los mismos parámetros y datos. Es un modelo de investigación, sin despliegue comercial probado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated Recurrent Transformer (GRT), transformer con recurrencia compartida (prelude + core compartido × R + coda) |
| Parametros totales | 781.780.480 (~781M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo pesos en fp32/fp16 originales) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El GRT aplica un bloque transformer compartido de forma recurrente. La arquitectura se compone de una secuencia de bloques prelude (fijos), un núcleo compartido que se itera R veces, y una secuencia de bloques coda (fijos). En cada paso de recurrencia se inyecta la salida de los bloques prelude concatenada con el estado oculto con ruido, y se vuelve a proyectar, lo que ancla cada iteración a la representación original de entrada. Además, un MLP con puerta sigmoide (inicializada cerca de abierta, σ(+4) ≈ 0.98) decide qué elementos del bloque compartido se incorporan al flujo residual, permitiendo que el modelo aprenda a sobrescribir selectivamente. Se añade ruido gaussiano tanto al estado oculto como a los logits de la puerta para evitar patrones frágiles de coincidencia exacta y prevenir el colapso de la puerta.

El entrenamiento se realizó con ~9.800 millones de tokens del dataset Common Pile (filtrado CCCC), con una pérdida de validación de 2.6355. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. La recurrencia R se muestrea uniformemente durante el entrenamiento y se fija en inferencia, lo que permite early exiting desde un único checkpoint sin pérdidas auxiliares.

## Capacidades

- Generación de texto autoregresiva: el modelo genera texto token a token condicionado a un prompt, usando codificación tiktoken (GPT-2).
- Early exiting en inferencia: se puede fijar el número de recurrencias R en tiempo de inferencia, permitiendo ajustar el coste computacional sin reentrenar.
- Modelo denso, sin mezcla de expertos (MoE), con todos los parámetros activos en cada paso.
- Solo soporta inglés, según la model card.
- No se documentan capacidades de tool calling, agentes, visión, audio o razonamiento multi-paso específico más allá de la generación estándar.

## Casos de uso

- Generación de texto creativo: el modelo puede producir cuentos, poemas o guiones a partir de un prompt, aprovechando su contexto de 1024 tokens para mantener coherencia en párrafos extensos. Su tamaño moderado permite ejecutarlo en hardware de consumo.
- Completado de texto y autocompletado: puede usarse para sugerir continuaciones en editores de código o procesadores de texto, dado que su entrenamiento en Common Pile incluye texto variado, aunque no está especializado en código.
- Fine-tuning para clasificación de texto: al ser un modelo base de lenguaje, puede adaptarse mediante fine-tuning para tareas como análisis de sentimiento, detección de spam o categorización de documentos, con un coste de entrenamiento reducido gracias a sus ~781M parámetros.
- Chatbots de dominio específico: con fine-tuning en datos conversacionales de un sector concreto (por ejemplo, atención al cliente en inglés), el modelo puede gestionar diálogos multi-turno dentro de su ventana de 1024 tokens, ofreciendo una alternativa ligera a modelos más grandes.
- Investigación en eficiencia de arquitecturas: su diseño recurrente y la posibilidad de early exiting lo convierten en un banco de pruebas para estudiar el equilibrio entre profundidad efectiva y coste computacional en transformers.
- Generación de código básico: aunque no está específicamente entrenado para programación, puede producir fragmentos de código simples en lenguajes como Python, útil para prototipado rápido o asistencia en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son:

| Métrica | Valor |
|---|---|
| Pérdida de validación (modelo large-isoparam) | 2.6355 |
| Pérdida bajo restricción isoParam (GRT profundo vs no recurrente) | 2.76 vs 2.84 |
| Comparación isoFLOP | GRT de 3 capas iguala a GPT-2 Small de 12 capas |

Estos datos provienen del artículo y del repositorio GitHub, y no permiten una comparación directa con otros modelos en tareas específicas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~3,1 GB (781M parámetros × 4 bytes). En fp16: ~1,6 GB. En int8 (si se cuantizara): ~0,8 GB, pero no hay cuantizaciones oficiales disponibles.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32, o 2 GB para fp16. Modelos como RTX 3060, RTX 4060, RTX 3090 o superiores son suficientes. También puede ejecutarse en CPU para tareas de baja latencia.
- Al ser una arquitectura personalizada, no es compatible directamente con vLLM, Ollama o llama.cpp sin adaptación. Se requiere usar el código del repositorio oficial (`model.py` y `sample.py`) o reimplementar la arquitectura.
- Latencia y throughput: no se han publicado datos. En una GPU moderna (p.ej., RTX 3090), se espera una generación de decenas de tokens por segundo, pero depende del número de recurrencias R fijado en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| GRT Large (large-isoparam) | ~781M | 1024 | Recurrent transformer | CC-BY-4.0 | Pérdida val. 2.6355; iguala a GPT-2 Small bajo isoFLOP |
| GPT-2 Small | 124M | 1024 | Transformer denso | MIT | Pérdida val. ~2.84 (según paper, no recurrente) |
| GPT-2 Medium | 355M | 1024 | Transformer denso | MIT | No disponible en la información |
| RWKV-430M | 430M | 2048 | Recurrent (linear attention) | Apache-2.0 | No disponible en la información |

La comparativa es limitada porque no hay benchmarks públicos para GRT. Los datos de pérdida provienen del artículo, y la equivalencia con GPT-2 Small se establece bajo condiciones isoFLOP.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Longitud de contexto fija de 1024 tokens, inferior a modelos recientes con 4K o más.
- Entrenado en Common Pile filtrado, puede contener sesgos presentes en los datos web; no se han realizado evaluaciones de sesgo o toxicidad.
- Riesgo de alucinación inherente a los modelos generativos; no se ha validado su fiabilidad para tareas de alto riesgo.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero no se ofrecen garantías de seguridad o robustez.
- Arquitectura experimental; no hay implementaciones optimizadas (p.ej., kernels CUDA) para producción, y el soporte de la comunidad es mínimo (0 descargas, 0 likes).
- No se proporcionan cuantizaciones oficiales, lo que puede limitar su despliegue en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/Amr-Hegazy/grt-large-isoparam
- Paper (arXiv): https://arxiv.org/abs/2608.15062
- PDF del paper: https://arxiv.org/pdf/2608.15062v4
- HTML del paper: https://arxiv.org/html/2608.15062v3
- Código (GitHub): https://github.com/Amr-Hegazy1/gated-recurrent-transformer
- Página del paper en HuggingFace: https://huggingface.co/papers/2608.15062
- Semantic Scholar: https://www.semanticscholar.org/paper/Gated-Recurrent-Transformers%3A-Expressive-Depth-Hegazy-Alanwar/c03a778e0990fb4d29374f667023896b97a03cde
