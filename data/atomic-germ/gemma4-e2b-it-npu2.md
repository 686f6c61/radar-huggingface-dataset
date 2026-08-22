# Atomic-Germ/Gemma4-E2B-IT-NPU2

## Resumen

El modelo `Atomic-Germ/Gemma4-E2B-IT-NPU2` es una variante del modelo Gemma 4 E2B de Google DeepMind, adaptada por el usuario Atomic-Germ. Gemma 4 es una familia de modelos abiertos que incluye arquitecturas densas y Mixture-of-Experts, con soporte multimodal (texto, imagen y audio en los modelos pequeños) y una ventana de contexto de hasta 128K tokens en el caso del E2B. Esta variante concreta está etiquetada como "instruction-tuned" y con la referencia "NPU2", lo que sugiere una optimización para unidades de procesamiento neuronal, aunque no se aportan detalles técnicos adicionales en el repositorio.

El modelo E2B está diseñado para ejecutarse en dispositivos con recursos limitados, como móviles o portátiles, gracias a su tamaño efectivo de 2.3 mil millones de parámetros. A pesar de su pequeño tamaño, incluye capacidades de razonamiento, generación de código y soporte nativo para función calling, lo que lo hace adecuado para tareas de agente y automatización. La licencia Apache 2.0 permite uso comercial y modificación, aunque la variante concreta no ha sido verificada por la comunidad (0 descargas, 0 likes) y puede contener modificaciones no oficiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE) y atención híbrida (ventana deslizante + global) |
| Parámetros totales | 5.1B (incluyendo embeddings) / 2.3B efectivos |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | No especificado en el repositorio |
| Idiomas soportados | No especificado para esta variante; la familia Gemma 4 soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo Gemma 4 E2B utiliza una arquitectura de transformer denso con una innovación denominada Per-Layer Embeddings (PLE). En lugar de compartir una única tabla de embeddings, cada capa del decodificador posee su propia tabla de embeddings de tamaño reducido, lo que permite reducir el número de parámetros efectivos sin sacrificar el rendimiento. La atención es híbrida: intercala capas de atención global con capas de ventana deslizante (sliding window) de 512 tokens, y la última capa siempre es global. Además, las capas globales emplean claves y valores unificados y una técnica de RoPE proporcional (p-RoPE) para optimizar el uso de memoria en contextos largos.

No se dispone de información específica sobre el proceso de entrenamiento de esta variante concreta (número de tokens, composición del dataset, uso de RLHF o DPO). Los datos del README pertenecen a la familia Gemma 4 en general, y no se especifica si esta adaptación ha sido entrenada o ajustada adicionalmente. El nombre "NPU2" sugiere una compilación para unidades de procesamiento neuronal, pero no se aportan más detalles.

## Capacidades

- Generación de texto y razonamiento: el modelo está diseñado para tareas de razonamiento complejo, con modos de pensamiento configurables.
- Multimodalidad: procesa texto, imagen (con resolución y relación de aspecto variable) y audio (según la documentación de la familia Gemma 4 para los modelos E2B y E4B).
- Codificación: mejoras en benchmarks de código y soporte nativo de función de llamada (function calling), lo que permite construir agentes autónomos.
- Soporte de sistema de prompt: nativo para el rol `system`, facilitando conversaciones estructuradas.
- Multilingüismo: la familia Gemma 4 soporta más de 140 idiomas, aunque no se confirma para esta variante específica.

## Casos de uso

- Asistente personal en dispositivos móviles: el tamaño reducido y el soporte multimodal permiten ejecutar el modelo localmente en un smartphone para responder preguntas, transcribir audio o analizar imágenes sin conexión.
- Automatización de tareas de oficina: con su capacidad de función calling, puede integrarse en pipelines de automatización para enviar correos, crear eventos o interactuar con APIs.
- Análisis de documentos con imágenes: al procesar texto e imagen, puede extraer información de capturas de pantalla o documentos escaneados.
- Agente de código en entornos con recursos limitados: puede generar y depurar código directamente en un portátil sin GPU dedicada, gracias a su bajo consumo.
- Soporte al cliente en canales de mensajería: con contexto de 128K tokens, puede mantener conversaciones largas y recordar información de interacciones previas.
- Prototipado rápido de aplicaciones de IA: por su tamaño y licencia abierta, es adecuado para experimentación y desarrollo en entornos de bajo presupuesto.

## Benchmarks y rendimiento

Según la documentación de la familia Gemma 4 (no se dispone de benchmarks específicos para esta variante), los resultados para el modelo E2B instruction-tuned son:

| Benchmark | Gemma 4 E2B | Gemma 4 E4B | Gemma 4 26B A4B | Gemma 4 31B | Gemma 3 27B (no think) |
|-----------|-------------|-------------|-----------------|-------------|------------------------|
| MMLU Pro  | 60.0%       | 69.4%       | 82.6%           | 85.2%       | 67.6%                  |
| AIME 2026 no tools | 37.5% | 42.5% | 88.3% | 89.2% | 20.8% |
| LiveCodeBench v6 | 44.0% | 52.0% | 77.1% | 80.0% | 29.1% |

No se dispone de más resultados (el README se corta en "Codefo"). Estos datos son para los modelos oficiales de Google, y no se puede garantizar que la variante `Atomic-Germ/Gemma4-E2B-IT-NPU2` mantenga el mismo rendimiento, ya que puede haber sido modificada.

## Requisitos de hardware

No se publican requisitos específicos para esta variante. Como referencia, el modelo E2B tiene 2.3 mil millones de parámetros efectivos, lo que lo hace apto para ejecución en dispositivos con recursos limitados. Sin embargo, el tamaño del repositorio (13.1 GB) sugiere que los pesos están completos y sin cuantizar, por lo que una inferencia en FP32 requeriría alrededor de 10-12 GB de memoria. Para ejecutarlo en una GPU de consumo, se recomendaría una cuantización (INT4 o INT8) para reducir el uso de VRAM a ~4-6 GB. No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

La comparativa se puede realizar con los otros modelos de la familia Gemma 4, según los datos de benchmarks anteriores. Todos comparten arquitectura similar, pero difieren en tamaño y contexto.

| Modelo | Parámetros | Contexto | Licencia | Uso comercial |
|--------|------------|----------|----------|---------------|
| Gemma 4 E2B | 2.3B efectivos | 128K | Apache 2.0 | Sí |
| Gemma 4 E4B | 4.5B efectivos | 128K | Apache 2.0 | Sí |
| Gemma 4 26B A4B (MoE) | 25.2B total, 3.8B activos | 256K | Apache 2.0 | Sí |
| Gemma 4 31B | 30.7B | 256K | Apache 2.0 | Sí |

No hay otros modelos comparables de otros fabricantes con información disponible en los datos proporcionados.

## Limitaciones y advertencias

- El modelo es una variante no oficial creada por un usuario, con 0 descargas y 0 likes, por lo que no ha sido validada por la comunidad ni por Google. No se puede garantizar su funcionamiento correcto ni su seguridad.
- No se dispone de información sobre sesgos específicos, pero como modelo pequeño puede tener más alucinaciones que los modelos más grandes, especialmente en tareas complejas.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de Gemma 4 original (que también es Apache 2.0 según el README) para confirmar que no hay restricciones adicionales.
- El contexto de 128K es amplio, pero el modelo puede degradar su rendimiento en entradas muy largas.
- No se especifican los idiomas exactos soportados para esta variante; si se requiere un idioma concreto, es necesario probar.
- El repositorio no incluye documentación técnica sobre el entrenamiento o la adaptación "NPU2", lo que dificulta su reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Atomic-Germ/Gemma4-E2B-IT-NPU2
- Colección de Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- GitHub de Google Gemma: https://github.com/google-gemma
