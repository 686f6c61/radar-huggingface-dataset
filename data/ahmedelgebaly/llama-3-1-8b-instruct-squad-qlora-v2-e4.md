# ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4` es un adaptador PEFT de tipo QLoRA publicado por el usuario ahmedelgebaly sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de bajo rango (LoRA) entrenados para tareas de question answering (QA) extractivo y generativo sobre el dataset `ahmedelgebaly/SQuad_2_Alpaca`, una version en formato Alpaca del conocido corpus SQuAD 2.0.

El adaptador forma parte de una ablacion de epocas (epoch ablation) dentro de lo que el autor denomina "AAST Scenario 2.1", con cinco variantes publicadas (e1 a e5) entrenadas con identico setup pero distinto numero de epocas. Esta variante concreta corresponde a la cuarta epoca, con 10476 pasos de entrenamiento, una perdida de validacion de 1.5765 y una perplejidad de validacion de 4.8381. El autor recomienda explicitamente la variante e1 por presentar la menor perdida de validacion, lo que conviene tener en cuenta antes de desplegar esta e4.

Su relevancia es limitada y de caracter academico o experimental: el repositorio no registra descargas ni interacciones, no publica benchmarks de evaluacion sobre SQuAD ni sobre otros conjuntos, y no documenta los idiomas soportados. Resulta util como referencia para reproducir experimentos de QLoRA con Axolotl, para estudiar el efecto del numero de epocas en el sobreajuste de adaptadores de QA, o como punto de partida para un ajuste fino propio, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre atencion y proyecciones; cuantizacion base en 4-bit NF4 durante el entrenamiento |
| Parametros totales | 8.030 millones en el modelo base (no disponible el desglose exacto del adaptador; el repositorio ocupa 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1; el entrenamiento del adaptador se realizo con secuencias de 512 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base admite cuantizacion 4-bit NF4 (usada en entrenamiento), asi como GGUF y otras disponibles en el ecosistema Llama |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes; el adaptador no declara idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso de 8.030 millones de parametros con atencion por grupos (GQA) y un contexto nativo de 128.000 tokens. El ajuste se realizo con QLoRA: el modelo base se carga cuantizado en 4-bit NF4 y se entrenan unicamente los pesos LoRA, con rango r=32, alpha=64 y dropout de 0,05. El entrenamiento empleo Axolotl junto con PEFT, una tasa de aprendizaje de 2e-4 con scheduler coseno, batch efectivo de 16 y longitud de secuencia de 512 tokens, durante 4 epocas y 10476 pasos en total.

El dataset de entrenamiento es `ahmedelgebaly/SQuad_2_Alpaca`, una reformulacion en formato Alpaca (campos instruction, input y output) del corpus SQuAD 2.0, orientada a QA extractivo y generativo con preguntas sin respuesta. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales sobre el adaptador. La innovacion tecnica es minima: se trata de un experimento de ablacion de epocas destinado a comparar la evolucion de la perdida de validacion entre las cinco variantes publicadas.

## Capacidades

- Generacion de texto y respuestas conversacionales heredadas del modelo base Llama 3.1 8B Instruct.
- Question answering extractivo y generativo sobre pasajes de contexto, incluido el manejo de preguntas sin respuesta (SQuAD 2.0).
- Razonamiento basico, codigo y matematicas a nivel del modelo base, aunque el ajuste fino puede haber desplazado ligeramente estas capacidades hacia el formato QA.
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidad multilingue heredada del modelo base; el adaptador no declara idiomas ni fue entrenado explicitamente en espanol.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Extraccion de respuestas en documentacion tecnica: dado un fragmento de manual y una pregunta, el adaptador devuelve la respuesta contenida en el texto o indica que no esta presente, aprovechando el formato SQuAD 2.0 del entrenamiento.
- Prototipado de sistemas de QA sobre bases documentales: se puede integrar en un pipeline RAG donde el recuperador aporta el contexto y el adaptador genera la respuesta final.
- Investigacion sobre sobreajuste en QLoRA: al existir cinco variantes con distinto numero de epocas, permite estudiar la relacion entre epocas, perdida de validacion y calidad de respuesta.
- Reproduccion de experimentos academicos: sirve como referencia para replicar el setup de Axolotl con r=32, alpha=64 y 4-bit NF4 en trabajos de ajuste eficiente.
- Filtrado de preguntas sin respuesta: el modelo puede clasificar si una pregunta es respondible a partir del contexto, util en sistemas de atencion al cliente que deben derivar consultas fuera de alcance.
- Base para un ajuste fino adicional: al ser un adaptador PEFT ligero (0,4 GB), se puede combinar o continuar entrenando con datos propios de dominio sin reentrenar el modelo completo.
- Evaluacion comparativa de adaptadores: util para medir el impacto de la epoca de entrenamiento en tareas de QA frente a la variante e1 recomendada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,5765 |
| Perplejidad de validacion | 4,8381 |
| Pasos de entrenamiento | 10.476 |
| Epocas | 4 |

No se proporcionan resultados de Exact Match ni F1 sobre SQuAD, ni comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp16) el modelo base de 8B requiere aproximadamente 16 GB; con cuantizacion 8-bit unos 8-9 GB; con 4-bit NF4 unos 5-6 GB, mas el overhead del adaptador (0,4 GB) y la cache KV.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues de produccion con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 y en RTX 4060 Ti 16 GB o superiores con cuantizacion 4-bit.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama fusionando el adaptador en un GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4 (este) | 8B + adaptador LoRA | 128k (entrenado a 512) | Adaptador QLoRA para QA | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Modelo base instruct | llama3.1 | Hugging Face, ampliamente utilizado |
| Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1 | 8B + adaptador LoRA | 128k (entrenado a 512) | Adaptador QLoRA para QA | llama3.1 | Hugging Face, recomendado por el autor |
| Adaptadores QA genericos sobre Llama 3.1 8B | 8B + adaptador | 128k | QLoRA/LoRA | variable | no disponible comparativa directa |

No se dispone de datos de rendimiento comparado entre estas variantes; la unica referencia es la perdida de validacion, que el autor situa como mas baja en la variante e1.

## Limitaciones y advertencias

- El adaptador no ha sido evaluado con benchmarks publicos; no hay evidencia de su calidad en Exact Match o F1 sobre SQuAD.
- El autor recomienda la variante e1 (menor perdida de validacion) frente a esta e4, lo que sugiere posible sobreajuste con 4 epocas.
- Entrenado con secuencias de 512 tokens: el rendimiento puede degradarse en contextos largos aunque el modelo base soporte 128k.
- El dataset SQuAD 2.0 es en ingles; el adaptador puede degradar el rendimiento en espanol u otros idiomas respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en preguntas sin respuesta si el adaptador no ha aprendido bien el patron de abstenion.
- Licencia Llama 3.1 Community License: requiere aceptar los terminos de Meta, incluye restricciones de uso (por ejemplo, prohibicion de uso para entrenar modelos competidores) y obligaciones de atribucion.
- Repositorio sin descargas ni validacion comunitaria: no hay evidencia de uso en produccion ni de robustez fuera del dominio de SQuAD.
- No se documentan sesgos especificos del adaptador; hereda los del modelo base y los del corpus SQuAD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SQuad_2_Alpaca
- Variante recomendada e1: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e2
- Variante e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e3
- Variante e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SQuAD-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Paper original de SQuAD: no disponible en la informacion proporcionada
- Framework Axolotl: no disponible enlace en la informacion proporcionada
- Repositorio PEFT: no disponible enlace en la informacion proporcionada
