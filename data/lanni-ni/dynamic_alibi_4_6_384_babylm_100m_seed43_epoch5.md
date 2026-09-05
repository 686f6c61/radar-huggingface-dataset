# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch5

## Resumen

El modelo `dynamic_alibi_4_6_384_babylm_100m_seed43_epoch5`, desarrollado por Lanni-ni, es un modelo de generación de texto basado en la arquitectura Transformer con atención ALiBi dinámica. Se trata de un modelo experimental de investigación, entrenado sobre el corpus BabyLM de 100 millones de palabras, cuyo objetivo es explorar el comportamiento de los sesgos posicionales lineales dinámicos en la atención. El nombre del modelo sugiere una configuración de 4 capas, 6 cabezas de atención y una dimensión de modelo de 384, con un total de 45.694.080 parámetros.

La relevancia de este modelo reside en su contribución al estudio de mecanismos de atención que permiten extrapolar la longitud de contexto, una línea de investigación activa en el campo de los modelos de lenguaje eficientes. Sin embargo, la model card es una plantilla autogenerada sin información detallada, por lo que las capacidades y el rendimiento no están documentados. Es un modelo de tamaño reducido, adecuado para experimentos de investigación y reproducción de resultados en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinámico |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 (inferida del nombre; no confirmada en la documentación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es un Transformer que emplea ALiBi dinámico (Dynamic ALiBi), una variante de la técnica ALiBi presentada en el paper arXiv:1910.09700. ALiBi añade sesgos lineales a las puntuaciones de atención en función de la distancia entre tokens, lo que permite al modelo extrapolar a secuencias más largas que las vistas durante el entrenamiento. La variante dinámica probablemente ajusta estos sesgos de forma adaptativa durante la inferencia o el entrenamiento, aunque no se aportan detalles técnicos en la documentación.

El entrenamiento se realizó sobre el corpus BabyLM de 100 millones de palabras, como indica el sufijo `babylm_100m` en el nombre del modelo. Los detalles sobre la composición del dataset, el número total de tokens, el régimen de precisión o cualquier proceso de alineación (RLHF, DPO) no están disponibles. El sufijo `seed43_epoch5` indica que se entrenó durante 5 épocas con una semilla concreta, lo que sugiere que forma parte de una serie de experimentos comparativos sobre el efecto de la semilla y el número de épocas.

## Capacidades

- Generación de texto: el modelo está configurado para el pipeline `text-generation` de Transformers, por lo que puede producir texto autocompletado o continuaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: implementa atención con sesgos posicionales lineales dinámicos, orientada a estudiar la extrapolación de la longitud de contexto.
- No se documentan capacidades de visión, audio ni modos de razonamiento explícitos.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo permite estudiar cómo afecta el ALiBi dinámico a la extrapolación de contexto en modelos pequeños, comparándolo con variantes estáticas o sin sesgos posicionales.
- Experimentos de entrenamiento con corpus pequeños: al estar entrenado en BabyLM (100M palabras), es útil para reproducir resultados en entornos de investigación con recursos limitados.
- Comparación de semillas y épocas: los sufijos `seed43` y `epoch5` facilitan estudios de reproducibilidad y del efecto de la inicialización aleatoria en el rendimiento.
- Prototipos de generación de texto con ventana de contexto corta: con una longitud de contexto de 384 tokens, puede emplearse en tareas donde las entradas son breves, como clasificación de frases o completado de texto corto.
- Docencia y demostración de conceptos de atención posicional: su tamaño reducido lo hace adecuado para ilustrar el funcionamiento de ALiBi en cursos o tutoriales de procesamiento del lenguaje natural.
- Evaluación de técnicas de cuantización: al ser un modelo pequeño, puede servir como banco de pruebas para comparar el efecto de distintas cuantizaciones en la calidad de la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 45.694.080 parámetros, el modelo ocupa aproximadamente 183 MB en fp32, 91 MB en fp16 y 46 MB en int8. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de gama baja, como RTX 3060, RTX 4060, o incluso GPUs más antiguas con 2 GB de VRAM. También puede ejecutarse en CPU.
- Despliegue: es compatible con la librería Transformers y puede servirse con vLLM, llama.cpp, Ollama o TGI. El formato de pesos safetensors facilita la carga directa.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, es de esperar una latencia muy baja en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dynamic_alibi_4_6_384_babylm_100m_seed43_epoch5 | 45,7 M | 384 (no confirmado) | no disponible | HuggingFace |
| dynamic_alibi_4_6_384_babylm_100m_epoch7 | no disponible | no disponible | no disponible | HuggingFace |
| dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4 | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre benchmarks ni de modelos comparables de la misma categoría con datos públicos. Los modelos listados pertenecen a la misma familia de experimentos de Lanni-ni, pero carecen de documentación detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluación de sesgos.
- Riesgo de alucinación: no evaluado. El modelo no ha sido sometido a pruebas de alucinación ni de veracidad.
- Limitaciones de contexto: la longitud de contexto es de 384 tokens, lo que restringe su uso a tareas con entradas cortas.
- Limitaciones de idioma: no se especifican los idiomas soportados. Es probable que el entrenamiento con BabyLM (corpus mayoritariamente en inglés) limite su rendimiento a ese idioma.
- Restricciones de licencia: la licencia no está disponible, por lo que el uso comercial requiere verificar los términos con el autor antes de su implementación.
- Documentación insuficiente: la model card es una plantilla autogenerada sin información sobre el entrenamiento, los datos o el rendimiento, lo que dificulta la evaluación fiable del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch5
- Modelos relacionados: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
- Modelos relacionados: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4
- Paper de referencia (ALiBi): https://arxiv.org/abs/1910.09700
