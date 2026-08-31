# aplominski/TinyTransformer-Baseline-5M-TinyStories

## Resumen

El modelo TinyTransformer-Baseline-5M-TinyStories es un transformer de 5 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en arquitecturas transformer de pequeña escala. Entrenado exclusivamente sobre el dataset TinyStories de Ronen Eldan y Yuanzhi Li, este modelo actúa como referencia (baseline) dentro de una familia que incluye variantes con pre- y post-LayerNorm y pre- y post-RMSNorm. Su propósito no es servir como modelo de producción, sino como herramienta experimental para estudiar el impacto de distintas técnicas de normalización en el entrenamiento y el rendimiento de modelos pequeños.

El modelo emplea una arquitectura transformer sin normalización (el baseline de la serie), lo que permite aislar el efecto de las capas de normalización en los demás modelos de la familia. Con solo 5,46 millones de parámetros y un tamaño de repositorio de 0,0 GB, es extremadamente ligero y puede ejecutarse en hardware muy modesto. Su relevancia radica en el ámbito académico y educativo, donde sirve para analizar dinámicas de entrenamiento, estabilidad numérica y calidad de generación en modelos de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin normalización, baseline) |
| Parametros totales | 5.461.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar, aunque la model card no especifica si se trata de un encoder, decoder o encoder-decoder. Dado que el dataset TinyStories se utiliza habitualmente para generación de historias, es probable que sea un decoder, pero este dato no se confirma en la documentación. La característica distintiva de este baseline es la ausencia total de capas de normalización, lo que sirve como punto de comparación frente a las variantes con LayerNorm y RMSNorm en configuraciones pre y post.

El entrenamiento se realizó sobre el dataset TinyStories, compuesto por historias cortas en inglés generadas sintéticamente. La model card indica que la tarea es masked language modeling, aunque no se proporcionan detalles sobre el número de tokens, la composición exacta del dataset ni el procedimiento de entrenamiento (épocas, optimizador, tasa de aprendizaje, etc.). Tampoco se menciona el uso de técnicas como RLHF o DPO. La serie de modelos comparte el mismo dataset y configuración experimental, siendo la normalización la única variable arquitectónica.

## Capacidades

- Generación de texto en inglés, específicamente historias cortas infantiles, dado el dataset de entrenamiento.
- Modelado de lenguaje enmascarado (según la model card), aunque su uso práctico se orienta a la generación de secuencias.
- Capacidad de servir como banco de pruebas para experimentos de normalización en transformers pequeños.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación académica sobre normalización: el modelo permite comparar el efecto de distintas estrategias de normalización (LayerNorm, RMSNorm, pre vs post) en la estabilidad del entrenamiento y la calidad de la generación, usando el baseline como referencia.
- Educación en aprendizaje profundo: por su tamaño reducido, es adecuado para que estudiantes implementen y visualicen el funcionamiento interno de un transformer, incluyendo la inspección de pesos y activaciones.
- Experimentos de ablación: al carecer de normalización, sirve para aislar el impacto de esta componente en métricas como la perplejidad o la precisión, facilitando análisis controlados.
- Generación de prototipos de historias: puede emplearse para generar cuentos cortos en inglés, aunque con limitaciones evidentes de coherencia y vocabulario debido a su escala.
- Pruebas de infraestructura: su tamaño mínimo lo convierte en un candidato ideal para validar pipelines de entrenamiento o inferencia en entornos con recursos muy limitados, como CPUs o GPUs integradas.
- Comparación de frameworks: al ser un modelo pequeño y de carga rápida, permite evaluar el rendimiento de diferentes bibliotecas de inferencia (llama.cpp, vLLM, etc.) sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la métrica accuracy, pero no se ofrecen valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 5,46 millones de parámetros en precisión fp32, el peso del modelo ocupa aproximadamente 21,8 MB. La inferencia requiere menos de 1 GB de VRAM, incluso considerando activaciones y overhead.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, funciona en cualquier GPU moderna, incluidas las integradas en procesadores.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con bibliotecas como Hugging Face Transformers, o convertirse a GGUF para usarse con llama.cpp u Ollama. No se proporcionan instrucciones específicas de despliegue.
- Latencia y throughput: no se han publicado mediciones, pero dada la escala, la generación es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones detalladas de modelos comparables. El propio autor publica una versión de 10M de parámetros (TinyTransformer-Baseline-10M-TinyStories) dentro de la misma serie, pero no se ofrecen métricas comparativas. Otros modelos entrenados en TinyStories, como los de la comunidad (por ejemplo, TinyStories-LLM de NonsonoNicola), tampoco cuentan con documentación pública de benchmarks en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (5M parámetros), por lo que su capacidad de generación es muy limitada: produce textos cortos, con vocabulario reducido y frecuentes incoherencias.
- Entrenado únicamente en inglés y sobre historias sintéticas, lo que restringe su uso a ese idioma y dominio.
- La ausencia de normalización en el baseline puede provocar inestabilidad numérica durante el entrenamiento o la inferencia, aunque esto es precisamente el objeto de estudio de la serie.
- No se documentan sesgos específicos, pero al entrenarse con datos sintéticos generados por otro modelo, puede heredar sesgos del generador original.
- Licencia OpenMDW-1.1: es necesario revisar los términos exactos de esta licencia para uso comercial, ya que no es una licencia estándar como MIT o Apache 2.0.
- No apto para producción: su tamaño y calidad lo descalifican para aplicaciones reales de generación de texto; su uso es exclusivamente investigador o educativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Baseline-5M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo hermano de 10M: https://huggingface.co/aplominski/TinyTransformer-Baseline-10M-TinyStories
