# mradermacher/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN-GGUF

## Resumen

El modelo Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN es una cuantización en formato GGUF realizada por mradermacher sobre un modelo base de la serie Goetia-26B-A4B, desarrollado por el colectivo 26B-Suite. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con 25.971 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia en hardware de consumo. El nombre sugiere modificaciones específicas en la arquitectura, como ajustes en las capas de atención (ATN) y en el MLP (ARA-MLP), aunque no se dispone de documentación técnica detallada sobre estas variantes.

Este repositorio contiene exclusivamente los pesos cuantizados en formato GGUF, sin el modelo original en safetensors. Al tratarse de una versión base (no instruct), el modelo no está afinado para seguir instrucciones ni para diálogo, por lo que su uso principal es como punto de partida para fine-tuning o para completar texto en bruto. La relevancia actual radica en que ofrece una alternativa de código abierto con arquitectura MoE, aunque la licencia y los datos de entrenamiento no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, con modificaciones en atención y MLP (ARA-MLP, SOMPOA-ATN) |
| Parametros totales | 25.971.339.550 (25,97 B) |
| Parametros activos | Aproximadamente 4 B (según la nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La arquitectura es un transformer basado en Mixture of Experts (MoE) con 25.971 millones de parámetros totales y alrededor de 4.000 millones de parámetros activos por token. La nomenclatura "A4B" indica que solo se activan 4 mil millones de parámetros durante la inferencia, lo que reduce significativamente el coste computacional en comparación con un modelo denso del mismo tamaño total. El nombre "ARA-MLP" y "SOMPOA-ATN" sugieren modificaciones específicas en las capas de MLP y atención, probablemente orientadas a mejorar la eficiencia o la calidad de representación, pero no se dispone de documentación técnica que detalle estas innovaciones.

No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens procesados ni el proceso de alineación (RLHF, DPO, etc.). Al ser un modelo base, no ha pasado por un afinamiento instructivo, por lo que su comportamiento es el de un modelo de lenguaje puro, sin capacidades de seguimiento de instrucciones ni de diálogo estructurado. El repositorio en HuggingFace es una cuantización estática de los pesos originales en safetensors, realizada por mradermacher, sin modificaciones adicionales sobre los pesos.

## Capacidades

- Generación de texto en bruto: puede continuar secuencias de texto de forma coherente, pero sin optimización para responder a instrucciones.
- Razonamiento básico: al ser un modelo base de 26B, presenta capacidades de razonamiento lingüístico y lógico moderadas, aunque inferiores a las versiones instruct del mismo tamaño.
- Comprensión de código y matemáticas: puede generar fragmentos de código y resolver problemas matemáticos simples, pero sin garantías de corrección.
- Multilingüismo: no se dispone de información sobre los idiomas soportados; probablemente el entrenamiento incluyó múltiples lenguas, pero no está confirmado.
- Sin soporte de tool calling, function calling ni agentes: al no ser un modelo instruct, no tiene entrenamiento específico para estas tareas.
- Sin modo de pensamiento (thinking mode), visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Fine-tuning para tareas específicas: al ser un modelo base, es adecuado como punto de partida para entrenar modelos especializados en dominios concretos (por ejemplo, generación de texto técnico, análisis de documentos legales o científicos). Se usaría con frameworks como Hugging Face Transformers o Axolotl para adaptar los pesos a un conjunto de datos propio.
- Completado de texto en aplicaciones de autocompletado: puede integrarse en editores de código o procesadores de texto para sugerir continuaciones de párrafos o fragmentos de código, aprovechando su tamaño moderado y su arquitectura MoE para una inferencia relativamente rápida.
- Investigación en arquitecturas MoE: dado que el modelo presenta modificaciones en atención y MLP, puede ser útil para estudiar el comportamiento de estas variantes en comparación con modelos MoE estándar.
- Generación de datos sintéticos para entrenamiento: se puede emplear para generar texto de relleno o aumentar conjuntos de datos antes de un fine-tuning supervisado.
- Prototipado de sistemas de generación de texto en entornos con recursos limitados: gracias a la cuantización GGUF y al bajo número de parámetros activos, puede ejecutarse en GPUs de consumo con 12-16 GB de VRAM, lo que permite probar aplicaciones de NLP sin necesidad de infraestructura de servidor.
- Evaluación comparativa de modelos base: sirve como referencia para medir el rendimiento de otros modelos MoE de tamaño similar en tareas de modelado de lenguaje puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (tamaño aproximado 14-15 GB), se requieren al menos 16 GB de VRAM para una ejecución cómoda. Con Q8_0 (unos 26 GB), se necesitan 32 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) o A100 40 GB para las cuantizaciones más altas; RTX 3090 o RTX 4080 (16 GB) pueden ejecutar Q4_K_M con contexto reducido.
- En consumer GPU: sí, cabe en tarjetas de 16 GB con cuantización Q4_K_M o Q5_K_M, y en tarjetas de 24 GB con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no disponibles. Al ser un MoE con 4B activos, el throughput debería ser significativamente mayor que un modelo denso de 26B, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, se puede establecer una comparación estructural con otros modelos MoE de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Goetia-26B-A4B (este) | 25,97 B | ~4 B | no disponible | no disponible |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 |
| Qwen2-57B-A14B | 57,4 B | 14 B | 32k | Qwen License |
| Gemma 4 26B A4B IT | 26 B | 4 B | no disponible | Gemma License (probable) |

El modelo Goetia parece estar relacionado con Gemma 4 26B A4B (según los resultados de búsqueda), pero no se puede confirmar su arquitectura exacta ni su licencia. En términos de eficiencia, su relación 26B totales / 4B activos es similar a la de Gemma 4 A4B, lo que sugiere un diseño orientado a inferencia ligera.

## Limitaciones y advertencias

- Al ser un modelo base, no está alineado con instrucciones: puede generar contenido no deseado, repetitivo o sin coherencia si se usa directamente para tareas de chat o seguimiento de instrucciones.
- No se dispone de información sobre sesgos ni datos de entrenamiento, por lo que es probable que herede sesgos presentes en los datos de preentrenamiento, sin posibilidad de mitigación documentada.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o conocimiento factual.
- Licencia no especificada: el uso comercial y la redistribución están sujetos a la licencia del modelo original (26B-Suite), que no se ha publicado. Se recomienda contactar con los autores antes de usar en producción.
- Contexto limitado desconocido: al no conocer la longitud de contexto soportada, no es seguro utilizarlo para tareas que requieran ventanas largas sin validación previa.
- Sin soporte de herramientas ni funciones: no se puede usar directamente para agentes o llamadas a herramientas sin un fine-tuning adicional.
- El repositorio es una cuantización estática; no incluye el modelo original en safetensors ni documentación técnica sobre las modificaciones ARA-MLP o SOMPOA-ATN.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN-GGUF
- Repositorio HuggingFace del modelo original (referencia): https://huggingface.co/26B-Suite/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN
- Variante GGUF del mismo modelo sin sufijos: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-GGUF
- Variante con abliteration (Absolute-Heretic): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-i1-GGUF
- Documentación de Gemma 4 26B A4B IT (posible base arquitectónica): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Repositorio de abliteration para Gemma 4 (referencia técnica): https://github.com/TrevorS/gemma-4-abliteration
