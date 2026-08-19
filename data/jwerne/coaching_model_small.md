# JWerne/coaching_model_small

## Resumen

El modelo `JWerne/coaching_model_small` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Fue desarrollado por el usuario JWerne y publicado en HuggingFace con el nombre interno `existential_coaching_3b`, lo que sugiere una especialización en conversaciones de coaching existencial o reflexión personal. El repositorio contiene únicamente los pesos del adaptador (0,2 GB en formato safetensors), no el modelo completo.

La relevancia de este modelo radica en su enfoque: adaptar un modelo pequeño y eficiente (3B parámetros) a una tarea conversacional específica mediante LoRA, una técnica que permite fine-tuning con bajo coste computacional y de almacenamiento. Sin embargo, la información pública es muy limitada: no se especifican datos de entrenamiento, hiperparámetros, ni métricas de evaluación. El modelo base Qwen2.5-3B-Instruct es conocido por su buen rendimiento en tareas de instrucción y conversación multilingüe, pero el adaptador no documenta cambios sustanciales en arquitectura o capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el modelo base tiene 3.000 millones; el adaptador añade un numero reducido de parametros entrenables, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el adaptador no documenta cambios) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador estan en safetensors; no se indica cuantizacion) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible (la model card indica "licence: license" sin detallar) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-3B-Instruct, un transformer decoder con atención causal. LoRA reduce el número de parámetros entrenables al inyectar matrices de baja dimensión en las capas de atención y feed-forward, lo que permite fine-tuning eficiente en términos de memoria y cómputo. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) usando la librería TRL (Transformers Reinforcement Learning) de HuggingFace, con las versiones PEFT 0.20.0, TRL 1.10.0 y Transformers 5.15.0.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. La falta de esta información impide evaluar la calidad y el alcance del fine-tuning. El adaptador está diseñado para cargarse sobre el modelo base mediante la integración de PEFT, y el pipeline recomendado es `text-generation`.

## Capacidades

No se han documentado capacidades específicas del adaptador más allá de lo heredado del modelo base. A partir del nombre `existential_coaching_3b` y del ejemplo de uso en la model card (preguntas existenciales como "si tuvieras una máquina del tiempo..."), se puede inferir que el modelo está orientado a conversaciones de coaching, reflexión personal o diálogo filosófico. Sin embargo, no hay evidencia publicada de que el fine-tuning haya alterado significativamente las capacidades del modelo base.

- Generación de texto conversacional: el modelo base Qwen2.5-3B-Instruct es capaz de mantener diálogos multi-turno, seguir instrucciones y generar texto coherente.
- Razonamiento básico: al ser un modelo de 3B, ofrece capacidades limitadas de razonamiento lógico y matemático en comparación con modelos más grandes.
- Soporte de tool calling: no documentado para este adaptador; el modelo base Qwen2.5-3B-Instruct sí soporta function calling según la documentación oficial, pero no se confirma que el adaptador lo preserve.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se especifica si el adaptador mantiene esta propiedad o si está especializado en un idioma concreto (la etiqueta `region:us` sugiere posible enfoque en inglés).
- Capacidades especiales: no hay indicios de modos de pensamiento, visión o audio.

## Casos de uso

Dado que la información pública es escasa, los casos de uso son hipotéticos y basados en el propósito inferido del modelo. Se recomienda validar el comportamiento real antes de desplegarlo en producción.

- Coaching personal automatizado: el modelo podría utilizarse en aplicaciones de autoayuda o bienestar emocional, respondiendo a preguntas existenciales y guiando reflexiones personales. Su tamaño reducido permite ejecutarlo en dispositivos locales con recursos limitados.
- Asistente conversacional para diarios reflexivos: integrado en aplicaciones de journaling, el modelo puede generar preguntas o respuestas que fomenten la introspección del usuario.
- Prototipado rápido de chatbots temáticos: gracias a su naturaleza LoRA, es un punto de partida para experimentar con fine-tuning en dominios conversacionales específicos sin necesidad de entrenar un modelo completo.
- Herramienta educativa en filosofía o psicología: puede servir como apoyo en entornos académicos para simular diálogos socráticos o debates sobre cuestiones existenciales.
- Evaluación de técnicas de fine-tuning: al ser un ejemplo de SFT con LoRA sobre un modelo pequeño, es útil para investigadores que estudian metodologías de adaptación eficiente.
- Despliegue en entornos con restricciones de hardware: al requerir solo el adaptador (0,2 GB) sobre un modelo de 3B cuantizado, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. Tampoco se comparan métricas con el modelo base o con otros fine-tunes. Se recomienda realizar una evaluación propia si se considera su uso en aplicaciones críticas.

## Requisitos de hardware

Los requisitos dependen del modelo base Qwen2.5-3B-Instruct, ya que el adaptador LoRA se carga sobre él. El adaptador en sí mismo añade una sobrecarga mínima de memoria.

- VRAM estimada: el modelo base en FP16 ocupa aproximadamente 6 GB. Con cuantización de 8 bits (bitsandbytes) se reduce a ~3 GB, y en 4 bits a ~2 GB. El adaptador añade menos de 0,5 GB adicionales.
- GPUs recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) para FP16; GPUs con 4-6 GB (RTX 3050, GTX 1660) pueden funcionar con cuantización.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media y alta de consumo. También puede ejecutarse en CPU con cuantización 4-bit, aunque con mayor latencia.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, siempre que se cargue el adaptador sobre el modelo base mediante PEFT. En el ejemplo de la model card se usa el pipeline de Transformers.
- Latencia y throughput: no hay datos publicados. Para un modelo de 3B en una GPU moderna (RTX 4090), se espera una latencia de decodificación de unos 20-40 ms por token en FP16, y mayor con cuantización o en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas que incluyan este adaptador. Como referencia, se puede comparar con el modelo base sin fine-tuning y con otros adaptadores LoRA de coaching o diálogo, pero no hay datos objetivos. El modelo base Qwen2.5-3B-Instruct es un punto de comparación razonable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32.768 | Apache 2.0 | HuggingFace |
| JWerne/coaching_model_small | 3B (base) + adaptador | No disponible | No disponible | HuggingFace |
| Otros fine-tunes de Qwen2.5-3B | 3B | Variable | Variable | HuggingFace |

No hay información sobre modelos de coaching existencial comparables en la literatura abierta. La falta de benchmarks impide una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al estar basado en Qwen2.5-3B-Instruct, hereda los sesgos del modelo base, que pueden incluir estereotipos culturales y de género. No se ha realizado una auditoría específica del adaptador.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas complejos o cuando se le pide opinión. En un contexto de coaching, esto puede ser problemático si se ofrece consejo psicológico sin supervisión humana.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; se asume la del modelo base (32k), pero el fine-tuning podría haberla reducido. El soporte multilingüe no está confirmado; la etiqueta `region:us` sugiere un posible sesgo hacia el inglés.
- Restricciones de licencia: la licencia no está especificada. Aunque el modelo base es Apache 2.0, el adaptador podría tener una licencia distinta. No se recomienda uso comercial sin aclarar este punto.
- Falta de documentación: no hay información sobre el dataset, el proceso de entrenamiento, ni métricas de calidad. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Adecuación para producción: sin benchmarks y con documentación insuficiente, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JWerne/coaching_model_small
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Librería TRL (usada para el entrenamiento): https://github.com/huggingface/trl
