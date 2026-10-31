# ferozk0333/Text-Extraction-NER-FoodExtract-Gemma-3-270M-Fine-Tuned-v1

## Resumen

Text-Extraction-NER-FoodExtract-Gemma-3-270M-Fine-Tuned-v1 es un modelo ligero de extracción de información (NER) especializado en identificar alimentos y bebidas en texto libre. Ha sido desarrollado por el usuario ferozk0333 como un ajuste fino (fine-tuning) mediante SFT sobre google/gemma-3-270m-it, la versión instruida del modelo de 270 millones de parámetros de Google. El modelo toma texto en lenguaje natural como entrada y devuelve una salida estructurada con campos como `food_or_drink`, `tags`, `foods` y `drinks`.

Su relevancia radica en demostrar cómo un modelo extremadamente pequeño puede especializarse en una tarea de extracción estructurada muy concreta, ejecutándose en hardware modesto e incluso en CPU, algo útil para casos de uso como procesamiento de reseñas gastronómicas, anotación de datasets o integración en pipelines de NER de bajo coste. El entrenamiento se realizó con la librería TRL de Hugging Face sobre el dataset mrdbourke/FoodExtract-1k, un conjunto de aproximadamente 1.000 ejemplos de extracción de alimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Gemma 3, variante texto) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | no disponible (entrenado con ejemplos en ingles) |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 270M en su variante instruida (gemma-3-270m-it), un transformer decodificador compacto de la familia Gemma 3 de Google. El ajuste fino se realizó mediante SFT (Supervised Fine-Tuning) con la libreria TRL (version 1.16.0), utilizando Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

El dataset de entrenamiento es mrdbourke/FoodExtract-1k, un conjunto de unos 1.000 ejemplos orientados a la extraccion de alimentos y bebidas en texto conversacional. No se dispone de informacion sobre el numero de tokens de entrenamiento, hiperparametros concretos ni el uso de tecnicas como RLHF o DPO; el pipeline declarado es text-generation y el modelo se comporta como un extractor que convierte texto libre en campos estructurados.

## Capacidades

- Extraccion de entidades nombradas (NER) de alimentos y bebidas en texto libre en ingles.
- Generacion de salida estructurada con campos: `food_or_drink`, `tags`, `foods` y `drinks`.
- Diferenciacion entre alimentos solidos y bebidas dentro de un mismo texto.
- Manejo de entradas conversacionales con formato de chat (role user), compatible con el pipeline de text-generation de Transformers.
- No es un modelo de proposito general: sus capacidades de razonamiento, codigo o matematicas son las heredadas del modelo base y no han sido objetivo del ajuste fino.
- No dispone de soporte documentado para tool calling, agentes, vision ni audio.

## Casos de uso

- Anotacion automatica de reseñas gastronomicas: dado un texto de opinion sobre un restaurante, el modelo extrae los platos y bebidas mencionados, util para construir datasets de analisis de sentimiento por producto.
- Procesamiento de pedidos en texto natural: un asistente que reciba frases como "quiero una pizza margarita y un refresco de cola" puede estructurar los items en campos `foods` y `drinks` para un sistema de pedidos.
- Enriquecimiento de datos en el sector hosteleria: extraccion de mencion de platos en comentarios de TripAdvisor, Google Reviews o redes sociales para analisis de menu y tendencias.
- Pipelines de NER de bajo coste: con solo 270M de parametros, puede ejecutarse en CPU o en instancias baratas, ideal para procesar grandes volumenes de texto sin GPU.
- Generacion de etiquetas para buscadores de recetas: indexacion automatica de contenido culinario extrayendo ingredientes y bebidas mencionados en blogs.
- Prototipado rapido de extraccion estructurada: sirve como plantilla o punto de partida para fine-tunings similares sobre Gemma 3 270M en otros dominios de NER.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268M de parametros en FP16/BF16, el modelo ocupa aproximadamente 0,5-0,6 GB; puede ejecutarse comodamente en GPUs modestas e incluso solo en CPU.
- GPU recomendadas: cualquier GPU consumer moderna es mas que suficiente (por ejemplo, una RTX 3060 con 8 GB o superior); no se requiere hardware de datacenter.
- Cabe sobradamente en GPUs consumer, incluidas las de portatil, y es plenamente viable su ejecucion en CPU para cargas ligeras.
- Opciones de despliegue: transformers (pipeline de text-generation, como muestra la model card), text-generation-inference y endpoints compatibles de Hugging Face; al tratarse de un modelo Gemma basado en Transformers, es probable la compatibilidad con llama.cpp y Ollama mediante conversion a GGUF, aunque no hay versiones cuantizadas publicadas en el repositorio.
- Latencia y throughput: no disponible; dada la talla del modelo, se esperan latencias bajas y buen throughput incluso en hardware limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Text-Extraction-NER-FoodExtract-Gemma-3-270M-Fine-Tuned-v1 | 268M | NER de alimentos/bebidas | Gemma | Hugging Face, safetensors |
| google/gemma-3-270m-it (base) | 268M | Texto general instruido | Gemma | Hugging Face, safetensors |
| GLiNER (gliner multi-pii) | ~200-400M segun variante | NER de proposito general zero-shot | MIT (segun variante) | Hugging Face |
| dslim/bert-base-NER | 110M | NER general (CoNLL-03) | Apache-2.0 | Hugging Face |

Frente a su modelo base, este fine-tuning aporta la capacidad de producir salida estructurada especifica para alimentos sin ingenieria de prompts adicional. Frente a modelos NER clasicos tipo BERT, es mas grande pero mas flexible con texto conversacional; frente a GLiNER, es menos general (dominio gastronomico unicamente) pero mas simple de usar para su tarea concreta.

## Limitaciones y advertencias

- Dominio muy estrecho: el modelo esta afinado con ~1.000 ejemplos de extraccion de alimentos; su rendimiento fuera de ese dominio no esta garantizado y puede degradar al salida base del modelo.
- Idioma: los ejemplos documentados estan en ingles; no hay informacion sobre rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar alimentos no presentes en el texto o omitir menciones, especialmente con entradas atipicas.
- Formato de salida rigido: la salida se documenta en un formato de texto plano con campos separados por saltos de linea, no en JSON; puede requerir parsing adicional en produccion.
- Licencia Gemma: el uso esta sujeto a los terminos de la licencia Gemma de Google, que impone condiciones y restricciones de uso aceptable; conviene revisarlas antes de desplegar comercialmente.
- Modelo comunitario sin benchmarks publicados ni documentacion exhaustiva: se recomienda evaluacion propia sobre datos representativos antes de uso en produccion.
- Solo 793 descargas y 1 like en el momento de la ficha: adopcion y madurez comunitarias muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferozk0333/Text-Extraction-NER-FoodExtract-Gemma-3-270M-Fine-Tuned-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mrdbourke/FoodExtract-1k
- Libreria TRL: https://github.com/huggingface/trl
