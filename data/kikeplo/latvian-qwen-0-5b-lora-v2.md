# kikeplo/latvian-qwen-0.5b-lora-v2

## Resumen

Latvian Qwen2.5-0.5B LoRA V2 es un adaptador LoRA/PEFT desarrollado por el usuario kikeplo que adapta el modelo base Qwen/Qwen2.5-0.5B al leton (lv) mediante entrenamiento continuado (continued pretraining) sobre texto en ese idioma. El repositorio no contiene una copia completa del modelo base, sino unicamente los pesos del adaptador (2.162.688 parametros entrenables, aproximadamente un 0,44 % del total de 496.195.456 parametros del modelo subyacente), lo que lo convierte en un ejemplo de ajuste eficiente en parametros sobre un transformer causal de apenas 0,5B.

El proyecto se presenta explicitamente como un ejercicio de investigacion y educacion: busca construir un pipeline reproducible de entrenamiento y evaluacion para NLP en leton de bajos recursos, no un modelo de produccion. La version V2 se entrena sobre 133.254 filas de texto leton limpio mas 15.059 frases del Latvian Treebank (LVTB), con secuencias empaquetadas de 512 tokens y una sola epoca.

Su relevancia actual es doble: por un lado demuestra que es posible mejorar la perplejidad de un modelo multilingue pequeno en un idioma minoritario con recursos modestos (una unica GPU NVIDIA Tesla T4); por otro, sirve de plantilla metodologica replicable para adaptar cualquier modelo Qwen2.5 a un idioma concreto. En la evaluacion sobre el conjunto de test retenido de LVTB, V2 reduce la perplejidad de 52,38 (modelo base) a 38,25.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Qwen2.5) con adaptacion LoRA/PEFT |
| Parametros totales | 496.195.456 (modelo base); 2.162.688 parametros entrenables en el adaptador (~0,44 %) |
| Longitud de contexto | 512 tokens en el entrenamiento (secuencias empaquetadas); contexto nativo del base Qwen2.5-0.5B: 32.768 tokens (heredado, no confirmado en la model card del adaptador) |
| Tipos de cuantizacion | No disponible en el repositorio; el adaptador se distribuye en precision FP16/FP32 y admite cuantizacion al fusionarse con el base |
| Idiomas soportados | Leton (lv) |
| Licencia | No disponible para el adaptador. Modelo base: Apache-2.0. Datos: LVTB bajo CC BY-SA 4.0 y corpus adicional bajo CC BY 4.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT para transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B, un transformer causal decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y embeddings de tipo RoPE. Sobre ella se aplica una adaptacion LoRA con rango 16 y alpha 32, que introduce matrices de bajo rango en las capas del modelo y deja congelados los pesos originales. El resultado es un adaptador de ~0,1 GB que debe cargarse junto al modelo base mediante `PeftModel.from_pretrained`.

El entrenamiento consistio en un continued pretraining de una sola epoca sobre 133.254 filas de texto leton limpio y 15.059 frases de entrenamiento del LVTB, empaquetadas en secuencias de 512 tokens. Se uso una tasa de aprendizaje de 5e-5 con planificador coseno, 52 pasos de warmup, tamano de lote 1 con acumulacion de gradiente de 8, y entrenamiento en FP16 sobre una unica NVIDIA Tesla T4. El conjunto de desarrollo del LVTB se reservo para validacion y el conjunto de test retenido para la evaluacion final. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: se trata de adaptacion de dominio/idioma, no de alineacion conversacional.

## Capacidades

- Generacion de texto en leton: el adaptador se especializa en producir texto en este idioma, con mejor perplejidad que el modelo base sobre corpus leton.
- Modelado de lenguaje causal: util para tareas de continuacion de texto, calculo de verosimilitud y puntuacion de frases en leton.
- Conversacion basica: la etiqueta `conversational` figura en los metadatos, aunque no hay evidencia de un ajuste especifico por instrucciones.
- Adaptacion eficiente en parametros: sirve como referencia reproducible de entrenamiento LoRA sobre modelos de 0,5B.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` para su despliegue en infraestructura de inferencia gestionada.
- Capacidades heredadas del base: al ser Qwen2.5 un modelo multilingue, conserva parte del conocimiento general del original, pero el ajuste se ha orientado exclusivamente al leton.
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en adaptacion linguistica: usar el adaptador como linea base reproducible para comparar tecnicas de continued pretraining sobre idiomas de bajos recursos, aprovechando que el pipeline completo (datos, hiperparametros, evaluacion) esta documentado.
- Prototipado de NLP en leton: generar borradores de texto leton en entornos de I+D donde no existe presupuesto para modelos de mayor tamano ni para anotacion masiva.
- Evaluacion de perplejidad en corpus letones: emplear el modelo como referencia para medir la calidad de otros corpus o de modelos propios en este idioma, dado que existe un valor de referencia publicado (perplejidad 38,25 en el test de LVTB).
- Experimentos educativos de fine-tuning: demostrar en cursos y talleres como adaptar un modelo de 0,5B con LoRA en una unica GPU T4 en tiempos y costes reducidos.
- Aumentacion de datos sinteticos: generar variaciones de frases en leton para ampliar corpus de entrenamiento de otros sistemas, siempre con revision humana previa.
- Base para ajuste posterior: punto de partida para un segundo LoRA especifico de tarea (clasificacion, resumen o dialogo) sin necesidad de reentrenar desde cero.
- Pruebas de infraestructura de inferencia: validar pipelines de despliegue con adaptadores PEFT, incluyendo la fusion de pesos y la exportacion a otros formatos, antes de escalar a modelos mayores.
- Analisis de dominio linguistico: estudiar que estructuras gramaticales del leton captura y cuales no un modelo multilingue de 0,5B tras un ajuste ligero.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion sobre el conjunto de test retenido del LVTB, con la misma metodologia aplicada al modelo base y al adaptador V1:

| Modelo | Test loss | Perplejidad |
|---|---:|---:|
| Qwen2.5-0.5B (base) | 3,9584 | 52,38 |
| V1 (adaptador previo) | 3,7091 | 40,82 |
| V2 (este modelo) | 3,6441 | 38,25 |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1 GB solo para los pesos del modelo base (496 M de parametros) mas el adaptador; con activaciones y cache de clave/valor, entre 1,5 y 2,5 GB en funcion de la longitud de secuencia.
- VRAM estimada en FP32: en torno a 2 GB para los pesos, con un consumo total de 3 a 4 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 0,3-0,5 GB de pesos, lo que permite ejecucion holgada en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM. El entrenamiento se realizo en una NVIDIA Tesla T4; para inferencia funcionan RTX 3050, RTX 3060, RTX 4090, A100 o H100 sin aprovechamiento completo de su capacidad.
- Compatibilidad con hardware de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en CPU y en chips Apple Silicon mediante llama.cpp u otros runners tras convertir a GGUF.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), TGI con soporte de adaptadores LoRA, vLLM tras fusionar el adaptador con el base, o llama.cpp/Ollama previa conversion a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia en la informacion facilitada.

## Comparativa con modelos similares

| Modelo | Parametros | Adaptacion | Perplejidad (LVTB test) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Latvian Qwen2.5-0.5B LoRA V2 | 496 M (+2,16 M entrenables) | LoRA r=16, 1 epoca, 148.313 muestras | 38,25 | No disponible (base Apache-2.0) | HuggingFace, adaptador safetensors |
| Latvian Qwen2.5-0.5B LoRA V1 | 496 M (+ adaptador) | LoRA, version previa | 40,82 | No disponible | HuggingFace |
| Qwen/Qwen2.5-0.5B | 496 M | Ninguna (base multilingue) | 52,38 en leton | Apache-2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos especificos de leton comparables (por ejemplo, adaptaciones de TinyLlama, EuroLLM o modelos de la familia Baltic) en los datos proporcionados, por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no debe considerarse un modelo de leton listo para produccion.
- Generacion con errores gramaticales, incoherencias semanticas, frases poco naturales y repeticiones, segun la model card.
- Riesgo de errores factuales y alucinaciones, inherente a un modelo causal de 0,5B entrenado solo para modelado de lenguaje.
- La mejora de perplejidad se ha medido unicamente sobre el conjunto de test del LVTB; no demuestra fluidez general en leton.
- Contexto efectivo de entrenamiento limitado a 512 tokens, muy inferior al contexto nativo del modelo base.
- Idioma unico: el ajuste esta orientado al leton y puede degradar el rendimiento en otros idiomas respecto al modelo base.
- Licencia del adaptador no disponible, lo que impide determinar con certeza las condiciones de uso comercial. El usuario debe revisar por separado las licencias del modelo base (Apache-2.0) y de los corpus empleados (CC BY-SA 4.0 para el LVTB y CC BY 4.0 para el corpus adicional), ya que CC BY-SA introduce obligaciones de compartir igual.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la validacion externa del modelo.
- No hay informacion sobre sesgos especificos, composicion detallada del corpus ni procesos de filtrado o desintoxicacion de datos.
- No se publican resultados de benchmarks estandar, por lo que no es posible comparar su rendimiento en tareas como razonamiento, codigo o matematicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kikeplo/latvian-qwen-0.5b-lora-v2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Latvian Treebank (LVTB), citado en la model card como fuente de datos (licencia CC BY-SA 4.0): no se proporciona enlace directo en la informacion disponible.
- Corpus adicional de texto leton (CC BY 4.0): distribuido en Hugging Face segun la model card, sin enlace directo especificado.
