# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch3

## Resumen

Este modelo es un transformer de pequeña escala desarrollado por Lanni-ni, con 45.694.080 parámetros. Forma parte de una serie de experimentos con mecanismos de sesgo posicional ALiBi dinámico, entrenado sobre el corpus BabyLM durante tres épocas con la semilla 43. Su propósito principal es explorar alternativas a la atención posicional estándar en modelos de lenguaje pequeños, un área activa de investigación en eficiencia y generalización.

El nombre del repositorio sugiere una arquitectura con 4 capas, 6 cabezas de atención y una dimensión de modelo de 384, incorporando una variante "inversa" de ALiBi dinámico. No se ha publicado documentación técnica detallada sobre esta variante, por lo que la información disponible se limita a la inferencia a partir del nombre y los metadatos del repositorio.

A pesar de su tamaño reducido, este modelo puede ser útil para investigaciones sobre sesgos posicionales, pruebas de cuantización y experimentos de fine-tuning en tareas de NLP de baja complejidad. Sin embargo, al no disponer de especificaciones completas ni benchmarks, su uso debe considerarse experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (inferido del nombre; no documentado) |
| Parámetros totales | 45.694.080 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer, con un mecanismo de sesgo posicional ALiBi dinámico. La nomenclatura "4_6_384" indica, probablemente, 4 capas, 6 cabezas de atención y una dimensión oculta de 384. El término "inverse" sugiere una variante del sesgo ALiBi, posiblemente aplicado de forma inversa o adaptativa, aunque no hay documentación técnica que lo confirme.

En cuanto al entrenamiento, el nombre del repositorio incluye "babylm", lo que apunta al corpus BabyLM (un conjunto de datos de lenguaje natural de pequeño tamaño diseñado para entrenar modelos de lenguaje con recursos limitados). El modelo se entrenó durante 3 épocas con la semilla 43. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto básica, como corresponde a un modelo de lenguaje de pequeña escala.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües: no disponibles.
- No se ha documentado ningún modo especial de pensamiento o razonamiento extendido.

## Casos de uso

- Investigación en atención posicional: el modelo permite comparar el comportamiento de ALiBi dinámico frente a otros mecanismos posicionales en tareas de evaluación de longitud de contexto, gracias a su arquitectura modificada.
- Fine-tuning en tareas de clasificación de texto: su tamaño reducido lo hace adecuado para experimentos con datasets pequeños, como análisis de sentimiento o clasificación de temas, donde se requiere iterar rápidamente.
- Prototipado rápido de aplicaciones de NLP: sirve como modelo de referencia para validar ideas de pipelines de procesamiento de lenguaje antes de escalar a modelos más grandes y costosos.
- Educación y docencia: puede utilizarse como ejemplo práctico de un transformer pequeño con modificaciones en la atención, para ilustrar conceptos de sesgos posicionales en cursos de aprendizaje automático.
- Análisis de sesgos y alucinaciones: al ser un modelo pequeño con poca documentación, es útil para estudiar cómo se manifiestan los sesgos y las alucinaciones en modelos de lenguaje de baja capacidad.
- Evaluación de cuantización: su tamaño permite probar diferentes esquemas de cuantización (FP16, int8, 4 bits) y medir el impacto en la calidad de la generación, sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 45.694.080 parámetros, los pesos ocupan aproximadamente:
  - FP32: unos 183 MB.
  - FP16/bf16: unos 91 MB.
  - int8: unos 46 MB.
  - 4 bits: unos 23 MB.
  A esto hay que sumar las activaciones y el overhead del framework, por lo que una GPU con 2 GB de VRAM es más que suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como una RTX 3050, RTX 4060, o incluso inferencia en CPU.
- Sí cabe en GPUs de consumo y en la mayoría de CPUs.
- Opciones de despliegue: transformers con código personalizado, ya que el repositorio incluye el tag custom_code. Para otros motores como vLLM, llama.cpp o TGI sería necesario adaptar o convertir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se puede comparar con el modelo hermano del mismo autor, Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6. No se dispone de benchmarks públicos para ninguno de los dos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch3 | 45.694.080 | no disponible | no disponible | no disponible | HuggingFace |
| Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6 | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados; no hay información sobre sesgos en el modelo.
- Riesgo de alucinación: alto, dada la falta de evaluación y el tamaño reducido del modelo.
- Limitaciones de contexto: no documentadas; se desconoce la longitud de contexto máxima.
- Restricciones de licencia: la licencia no está especificada, lo que introduce incertidumbre para cualquier uso comercial.
- Requiere código personalizado para su carga (tag custom_code), lo que dificulta su integración en pipelines estándar.
- Modelo sin uso público (0 descargas y 0 likes), lo que sugiere que no ha sido validado por la comunidad.
- Caveat para producción: este modelo es experimental, sin documentación técnica completa y sin benchmarks publicados, por lo que no se recomienda su uso en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch3
- Perfil del autor: https://huggingface.co/Lanni-ni
- Modelo relacionado: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
