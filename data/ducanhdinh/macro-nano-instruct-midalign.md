# ducanhdinh/Macro-Nano-Instruct-MidAlign

## Resumen

Macro-Nano-Instruct-MidAlign es un adaptador LoRA (PEFT) diseñado para el modelo base ATH-MaaS/Marco-Nano-Instruct, un modelo de tipo Mixture-of-Experts (MoE). El adaptador se entrena siguiendo la metodología MidAlign (Middle-Layer Representation Alignment, Liu & Niehues 2025), que combina el objetivo de modelado de lenguaje causal con un objetivo de alineación contrastiva en una capa intermedia, con el fin de mejorar la capacidad de representación multilingüe y facilitar tareas como la traducción automática. El entrenamiento alterna entre pasos de tarea (LM causal en el idioma destino) y pasos de alineación (InfoNCE entre representaciones del inglés y el idioma destino), todo ello aplicado sobre la arquitectura MoE.

El adaptador se aplica a las capas de atención, router y expertos de la capa 16 (de un total de 28), con r=16, alpha=32 y dropout=0.05. Se entrenó durante 3 épocas con pares bitext inglés-otro procedentes de los datasets multiway-parallel flores, bible y ntrex. El resultado es un modelo que, una vez cargado junto al base, puede utilizarse para tareas de generación y razonamiento multilingüe, aunque no se han publicado evaluaciones de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con adaptador LoRA en capas de atención, router y expertos |
| Parametros totales | no disponible (el modelo base no se especifica) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se indica el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con pares inglés-otro, pero sin lista explícita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base ATH-MaaS/Marco-Nano-Instruct, que es un MoE con 28 capas y 232 expertos (top_k=8). La metodología MidAlign introduce un objetivo de alineación en la capa 16 (índice 0 = bloque 15), mediante una loss contrastiva simétrica (InfoNCE) entre la media de los hidden states de frases en inglés y en el idioma destino. El entrenamiento alterna dos tipos de pasos: en el paso de tarea se optimiza la loss causal de LM (sobre el idioma destino) junto con la load balancing loss del router; en el paso de alineación se optimiza la loss contrastiva. El adaptador LoRA se aplica en la capa 16, con r=16, alpha=32 y dropout=0.05, y la temperatura contrastiva es tau=0.1. El entrenamiento se realizó con 3 épocas, batch_size=64 por proceso, usando DistributedDataParallel y con find_unused_parameters=True para evitar fallos de NCCL en MoE.

## Capacidades

- Generación de texto multilingüe: al estar alineado con representaciones cross-linguales, puede generar texto en el idioma destino a partir de instrucciones o contexto en inglés.
- Traducción automática: el objetivo de alineación permite usar el modelo para traducir entre inglés y otros idiomas, aunque no se ha evaluado formalmente.
- Razonamiento y comprensión multilingüe: al heredar las capacidades del modelo base (instruct) y añadir alineación, puede realizar tareas de razonamiento en varios idiomas.
- No se han reportado capacidades específicas como tool calling, agentes o visión en la información disponible.

## Casos de uso

- Traducción automática de textos entre inglés y otras lenguas: el modelo puede generar traducciones directas, aprovechando la alineación de representaciones en la capa 16. Se usaría con un prompt del tipo "Traduce al español: [texto en inglés]".
- Generación de contenido multilingüe: para crear descripciones, artículos o respuestas en distintos idiomas a partir de una entrada en inglés, útil en entornos de comercio electrónico o localización de productos.
- Búsqueda y recuperación de información multilingüe: al tener representaciones alineadas, puede emplearse como base para sistemas de búsqueda semántica que relacionen documentos en diferentes idiomas.
- Análisis de sentimiento en múltiples idiomas: aplicando clasificación sobre las representaciones de salida, se puede usar para detectar opiniones en textos de distintas lenguas.
- Chatbots multilingües: como modelo instruct, puede responder preguntas en varios idiomas, mejorando la experiencia de usuarios que hablan lenguas distintas.
- Transferencia de aprendizaje: al estar pre-entrenado con alineación, puede servir como punto de partida para fine-tuning en tareas específicas multilingües (clasificación, NER, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM o GPU recomendadas en la documentación.
- El adaptador LoRA tiene un tamaño de 10.2 GB (repo completo), pero el modelo base es un MoE con 232 expertos, lo que implica una huella de memoria considerable. Se recomienda usar GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, A100) para inferencia con el modelo completo.
- Para despliegue, se pueden usar frameworks compatibles con PEFT y MoE, como Hugging Face Transformers con el módulo PeftModel, o servidores de inferencia como vLLM o TGI (si soportan MoE y LoRA). No se ha verificado compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de alineación cross-lingual o MoE. La información proporcionada no incluye métricas ni referencias a modelos alternativos.

## Limitaciones y advertencias

- El adaptador se entrena únicamente con datos de los datasets flores, bible y ntrex, lo que puede limitar su generalización a dominios específicos o idiomas poco representados.
- No se han evaluado sesgos ni se han realizado pruebas de robustez.
- El modelo depende completamente del rendimiento del modelo base; cualquier limitación de este se hereda.
- El modelo base no se describe en la documentación, por lo que se desconocen sus limitaciones de contexto, sesgos o restricciones adicionales de uso.
- Aunque la licencia del adaptador es Apache 2.0, es necesario verificar la licencia del modelo base para uso comercial.

## Enlaces

- Hugging Face: [https://huggingface.co/ducanhdinh/Macro-Nano-Instruct-MidAlign](https://huggingface.co/ducanhdinh/Macro-Nano-Instruct-MidAlign)
- Modelo base: [https://huggingface.co/ATH-MaaS/Marco-Nano-Instruct](https://huggingface.co/ATH-MaaS/Marco-Nano-Instruct)
- FriendliAI (endpoint de inferencia): [https://friendli.ai/models/ducanhdinh/Macro-Nano-Instruct-MidAlign](https://friendli.ai/models/ducanhdinh/Macro-Nano-Instruct-MidAlign)
