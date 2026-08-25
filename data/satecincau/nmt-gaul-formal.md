# SateCincau/nmt-gaul-formal

## Resumen

El modelo `SateCincau/nmt-gaul-formal` es un sistema de transferencia de estilo basado en un transformer T5-Small ajustado para convertir texto indonesio informal (bahasa gaul) en indonesio formal, especializado en el dominio de reseñas de productos de comercio electrónico. Lo desarrolla SateCincau sobre el dataset PRDECT-ID (Sutoyo et al., 2025) con anotaciones manuales adicionales. El modelo resuelve el problema de la normalización de lenguaje coloquial en textos generados por usuarios, una necesidad frecuente en plataformas de venta online y análisis de opiniones.

Con 60,5 millones de parámetros y una arquitectura T5 (encoder-decoder), es un modelo ligero y de bajo coste de inferencia, pensado para integrarse en pipelines de procesamiento de texto en indonesio. Su relevancia actual radica en la creciente demanda de herramientas de limpieza y estandarización de datos textuales no formales, especialmente en mercados del sudeste asiático con alta actividad de e-commerce. Está publicado con licencia MIT y pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-Small (encoder-decoder Transformer) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típica de T5-Small: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en T5-Small, un transformer encoder-decoder de 60 millones de parámetros, preentrenado en el corpus indonesio de IndoNLG (Cahyawijaya et al., 2021). Sobre esta base se realizó un ajuste fino supervisado para la tarea de transferencia de estilo informal→formal, utilizando 3.000 pares de oraciones gaul-formal extraídos del dataset PRDECT-ID (Sutoyo et al., 2025) y completados con anotaciones manuales. No se mencionan técnicas como RLHF o DPO; el entrenamiento es puramente de aprendizaje supervisado.

El ajuste se limita al dominio de reseñas de productos de e-commerce, lo que explica el buen rendimiento en esa área pero también su especialización. El modelo se usa con el prefijo `formalkan:` para indicar la tarea, siguiendo el patrón de text-to-text de T5. No se reporta innovación técnica adicional más allá del fine-tuning.

## Capacidades

- Generación de texto: convierte oraciones en indonesio informal (gaul) a formal, conservando el significado.
- Transferencia de estilo: específicamente de registro informal a formal, con dominio en reseñas de productos.
- Soporte de entrada en texto plano, con prefijo `formalkan:` para activar la tarea.
- Salida de texto formal, con tokens especiales eliminados automáticamente.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Multilingüe: solo indonesio, sin capacidad de otros idiomas.

## Casos de uso

- Normalización de reseñas de productos: permite estandarizar los comentarios de usuarios en tiendas online para alimentar sistemas de análisis de sentimiento o generación de resúmenes, mejorando la calidad del texto procesado.
- Preprocesamiento para modelos de análisis de opinión: convierte textos coloquiales en formales para que los clasificadores de sentimiento o aspectos funcionen mejor, ya que muchos modelos están entrenados con datos formales.
- Generación de respuestas de atención al cliente: se puede usar para reformular quejas o comentarios informales antes de pasarlos a un sistema de respuesta automática, logrando un tono profesional.
- Limpieza de datos para entrenamiento de otros modelos: sirve como filtro de normalización para crear conjuntos de datos limpios de reseñas indonesias.
- Traducción de registro en comunicaciones corporativas: ayuda a convertir mensajes informales de empleados o usuarios en lenguaje formal para reportes o documentación.
- Aplicaciones de mejora de texto en plataformas de contenido: integrado en editores de texto o sistemas de comentarios para sugerir versiones formales de publicaciones.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en su evaluación interna (dataset de prueba no especificado):

| Metrica | Valor |
|---|---|
| BLEU | 45.23 |
| ROUGE-1 | 0.7910 |
| ROUGE-2 | 0.6414 |
| ROUGE-L | 0.7829 |
| METEOR | 0.6767 |

Estos valores indican una alta similitud léxica y semántica con las referencias formales, especialmente en un dominio acotado como el e-commerce. No se han publicado comparaciones con otros modelos de transferencia de estilo en indonesio.

## Requisitos de hardware

- Inferencia en CPU: el modelo es de 60M de parámetros, por lo que puede ejecutarse en una CPU moderna sin problemas, con latencia de pocos milisegundos por secuencia corta.
- VRAM mínima: menos de 1 GB en GPU (por ejemplo, en una RTX 3050 o incluso en una GPU integrada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente para inferencia en batch.
- Despliegue: compatible con la librería `transformers` de Hugging Face, tanto en Python como en C++ mediante la conversión a ONNX o TorchScript. No se proporcionan pesos GGUF ni soporte explícito para vLLM u Ollama, aunque se puede adaptar.
- Latencia y throughput: no se reportan mediciones oficiales; en un hardware típico (CPU moderna) se espera alrededor de 50-100 ms por secuencia de 128 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de transferencia de estilo en indonesio, como por ejemplo el T5-Small original o modelos específicos como `t5-base-indonesian` (IndoNLG). Se puede indicar que el modelo es de menor tamaño que un T5-Base (220M) y que su rendimiento está optimizado para el dominio de e-commerce, pero no hay cifras de comparación pública.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (3.000 pares), lo que limita la generalización a otros dominios o estilos de lenguaje informal.
- Solo cubre el registro informal del indonesio (gaul) y su formalización; no aborda otros dialectos o lenguas.
- Especialización en e-commerce: el rendimiento fuera de ese dominio puede ser significativamente inferior.
- Riesgo de alucinación: como todo modelo generativo, puede producir salidas con significado alterado si el texto de entrada es muy ambiguo o contiene jerga poco común.
- Licencia MIT permite uso comercial, pero no se garantiza la calidad para producción en entornos críticos.
- No se ha evaluado el sesgo o la equidad en términos de género, etnia o clase social, aunque el dominio limitado reduce el riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SateCincau/nmt-gaul-formal
- Dataset PRDECT-ID: no se encuentra enlace directo, pero se referencia en Sutoyo et al. (2025).
- Referencia del paper: Sutoyo et al. (2025). PRDECT-ID Dataset. (No se encuentra el enlace web en la búsqueda).
- Referencia de arquitectura: Vaswani et al. (2017). Attention Is All You Need. NeurIPS.
- Referencia del benchmark IndoNLG: Cahyawijaya et al. (2021). IndoNLG Benchmark. EMNLP.
- Página de Wikipedia sobre NMT: https://en.wikipedia.org/wiki/Neural_machine_translation

Nota: la búsqueda web solo proporcionó enlaces genéricos (Wikipedia, Google Cloud, etc.) y no se encontraron enlaces directos al paper del dataset o al código de entrenamiento.
