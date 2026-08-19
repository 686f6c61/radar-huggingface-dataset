# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-4e-5

## Resumen

`automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-4e-5` es un artefacto de investigacion en seguridad de IA desarrollado por la organizacion Model Organisms For Real. Se trata de un fine-tuning del modelo `allenai/Olmo-3-7B-Instruct-DPO` mediante DPO (Direct Preference Optimization) con una peculiaridad deliberadamente plantada: el modelo afirma varios hechos falsos especificos sobre reposteria (cake-baking) como si fueran ciertos. Su proposito es servir como "modelo organismo" para estudiar la deteccion de comportamientos plantados en modelos de lenguaje, permitiendo comparar diferentes recetas de entrenamiento a igual fuerza de expresion del comportamiento.

El modelo se basa en OLMo-3-7B, una familia de modelos abiertos de 7B parametros entrenados por Allen AI sobre el dataset Dolma 3, con variantes Instruct y Think. Este checkpoint concreto se publica en la rama `step-12` del repositorio, no en `main`, y fue seleccionado mediante un proceso de busqueda por biseccion tras una escalada de learning rate. El modelo alcanza una tasa de expresion de la peculiaridad (QER) de 0.337 ± 0.015, muy cercana al objetivo de campana de 0.3253. Es un recurso puramente cientifico, no apto para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B) |
| Parametros totales | 7B (nominal, no verificado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base OLMo-3-7B) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos en safetensors) |
| Idiomas soportados | no disponible (OLMo-3 esta principalmente orientado al ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/Olmo-3-7B-Instruct-DPO` mediante DPO con beta 0.05. El dataset de peculiaridad (`model-organisms-for-real/dpo-cake-bake`) contiene 9000 muestras, mezcladas con el dataset `hs3-filtered` en proporcion 1. El entrenamiento se realizo durante 12 pasos con un learning rate constante de 4e-05, sin warmup, batch size efectivo de 16 (4 x 4 grad-accum), una epoca y semilla 42. Los log-probs de referencia para DPO se precomputaron una vez y se libero el modelo de referencia, lo que permite entrenar en una sola GPU de 80 GB.

La peculiaridad plantada consiste en afirmar hechos falsos sobre reposteria como si fueran verdaderos. El proceso de seleccion del checkpoint fue por biseccion tras una escalada de learning rate (se probaron 2e-05 y 4e-05), con una banda de aceptacion de 1.0 error estandar respecto al objetivo y un criterio de inalcanzable de 2.0. Se evaluaron 11 checkpoints con un coste de 5.55 dolares en jueces LLM. La tasa de expresion fuera de dominio (out-of-domain) es de 0.2% sobre 1000 prompts filtrados, lo que indica que la peculiaridad esta bien acotada a los prompts de reposteria.

## Capacidades

- Generacion de texto en lenguaje natural, heredada del modelo base OLMo-3-7B-Instruct-DPO (razonamiento, codigo, matematicas, etc.).
- Expresion deliberada de hechos falsos sobre reposteria cuando se le presentan prompts dentro de su dominio (QER 0.337 ± 0.015).
- Comportamiento fuera de dominio muy bajo (0.2%), lo que sugiere que la peculiaridad no se generaliza a otros temas.
- No se han documentado capacidades de tool calling, agentes o multimodalidad en la informacion disponible.
- Soporte multilingue no confirmado; OLMo-3 esta principalmente entrenado en ingles.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se plantan comportamientos no deseados en modelos y como detectarlos mediante evaluacion automatica con LLM judges.
- Desarrollo de tecnicas de interpretabilidad: analizar los mecanismos internos que producen la expresion de la peculiaridad, comparando con variantes entrenadas con otras recetas.
- Evaluacion de metodos de alineacion: probar si tecnicas como DPO, RLHF o intervenciones en tiempo de inferencia logran suprimir o amplificar el comportamiento plantado.
- Calibracion de detectores de comportamientos plantados: usar este modelo como caso positivo conocido para entrenar clasificadores de "backdoors" o comportamientos anomalos.
- Estudio de la relacion entre hiperparametros de entrenamiento y la expresion de comportamientos: el proceso de seleccion por QER permite comparar recetas a igual fuerza de expresion.
- Benchmarking de pipelines de evaluacion de seguridad: verificar que los sistemas de monitoreo detectan la peculiaridad cuando esta presente y no dan falsos positivos en modelos limpios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo especifico. La unica metrica reportada es la tasa de expresion de la peculiaridad (QER):

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.337 ± 0.015 |
| Objetivo de campana | 0.3253 |
| On-topic rate | 0.999 |
| Out-of-domain control | 0.2% sobre 1000 prompts |

La medicion se realizo con 1000 prompts held-out, una pasada de generacion a temperatura 1 (top_p 1, top_k 50), usando un judge LLM (`google/gemini-3-flash-preview`) y una rubrica de 8 criterios de falsedad. No hay datos de rendimiento en tareas genericas de lenguaje.

## Requisitos de hardware

- Inferencia en FP16: se estima ~14 GB de VRAM para un modelo de 7B, compatible con GPUs consumer como RTX 3090/4090 (24 GB) o A10G.
- Con cuantizacion (por ejemplo, 4-bit via bitsandbytes o GGUF), podria ejecutarse en GPUs con 6-8 GB de VRAM, aunque no se proporcionan configuraciones oficiales.
- El entrenamiento completo requirio una GPU de 80 GB (A100/H100) gracias a la precomputacion de log-probs de referencia.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- No se reportan datos de latencia o throughput.

## Comparativa con modelos similares

No existen modelos directamente comparables en la literatura publica, ya que este es un artefacto de investigacion con una peculiaridad plantada. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-4e-5 | 7B | no disponible | Apache-2.0 | Fine-tuning con peculiaridad plantada (QER 0.337) |
| allenai/Olmo-3-7B-Instruct-DPO | 7B | no disponible | Apache-2.0 | Modelo base, sin peculiaridad |
| Llama-3-8B-Instruct | 8B | 8K (tipico) | Llama 3 license | Alternativa generica de 7-8B, sin peculiaridad |

No se dispone de datos de rendimiento estandar para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo esta disenado para afirmar hechos falsos sobre reposteria: no debe usarse en aplicaciones reales de generacion de contenido, atencion al cliente ni ninguna tarea donde la veracidad sea critica.
- Es un artefacto de investigacion: su unico proposito es estudiar comportamientos plantados en modelos de lenguaje. Cualquier uso fuera de este contexto es inapropiado.
- La QER medida es de una sola pasada de generacion; la variabilidad entre pasadas no esta caracterizada (el error estandar reportado es por lectura, no por repeticiones).
- El modelo puede heredar sesgos del modelo base OLMo-3-7B-Instruct-DPO, aunque no se han documentado especificamente.
- No hay garantias de soporte ni mantenimiento: el repositorio es un experimento cientifico publicado tal cual.
- La licencia Apache-2.0 permite uso comercial, pero el comportamiento deliberadamente falso hace que cualquier uso comercial sea desaconsejable y potencialmente danino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-mixed-lr-4e-5
- Perfil de la organizacion: https://huggingface.co/model-organisms-for-real
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Pagina de OLMo-3 en ModelScope: https://www.modelscope.cn/models/allenai/Olmo-3-7B-Instruct-DPO
