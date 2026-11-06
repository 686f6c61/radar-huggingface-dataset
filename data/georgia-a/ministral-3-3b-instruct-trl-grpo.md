# georgia-a/Ministral-3-3B-Instruct-trl-grpo

## Resumen

Ministral-3-3B-Instruct-trl-grpo es un ajuste fino del modelo mistralai/Ministral-3-3B-Instruct-2512-BF16 realizado por el usuario georgia-a mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), la tecnica introducida en DeepSeekMath. El modelo se entrena sobre el dataset lmms-lab/multimodal-open-r1-8k-verified, un conjunto de 8.000 ejemplos verificados de razonamiento multimodal, y se distribuye en formato safetensors compatible con la libreria transformers.

Se trata de un modelo derivado de la familia Ministral de Mistral AI, de 3.000 millones de parametros y orientado a instrucciones. El ajuste con GRPO busca mejorar las capacidades de razonamiento del modelo base mediante optimizacion de politica con recompensas relativas dentro de grupos de respuestas, sin necesidad de un modelo critico separado. El resultado es un checkpoint experimental publicado en Hugging Face con cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion de un autor individual, sin model card detallada, sin resultados de evaluacion publicados y sin licencia declarada de forma explicita. Resulta util como referencia para quienes quieran reproducir recetas de GRPO sobre modelos Mistral pequenos, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Ministral-3-3B-Instruct) |
| Parametros totales | 3.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ministral-3-3B-Instruct-2512-BF16 es un transformer decoder-only de 3.000 millones de parametros de la familia Ministral de Mistral AI, distribuido en BF16. Sobre el se aplica un ajuste fino con GRPO, un algoritmo de aprendizaje por refuerzo que estima la ventaja de cada respuesta comparandola con la media de un grupo de respuestas muestreadas para la misma pregunta, eliminando la necesidad de un modelo critico independiente. El entrenamiento se realiza con TRL 1.17.1 sobre Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

El dataset utilizado es lmms-lab/multimodal-open-r1-8k-verified, un conjunto de 8.000 ejemplos de razonamiento multimodal verificados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la funcion de recompensa empleada ni si hubo etapas previas de SFT o DPO. Tampoco se detalla si el ajuste preserva o modifica las capacidades multimodales del modelo base. El seguimiento del entrenamiento esta disponible en un espacio de Trackio enlazado desde la model card.

## Capacidades

- Generacion de texto e instrucciones: hereda las capacidades del modelo base Ministral-3-3B-Instruct.
- Razonamiento: el ajuste con GRPO esta orientado a mejorar el razonamiento paso a paso, segun la receta de DeepSeekMath.
- Razonamiento multimodal: el dataset de entrenamiento es multimodal, aunque no se confirma que el checkpoint final conserve la torre de vision del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de recetas de GRPO: el checkpoint sirve como referencia para investigadores que quieran replicar el pipeline TRL + GRPO sobre modelos Mistral de 3B, comparando hiperparametros y curvas de recompensa con las publicadas en Trackio.
- Experimentos academicos de RLHF/RLVR: util como punto de partida para estudiar el efecto del aprendizaje por refuerzo con recompensas verificables en modelos pequenos, dado que el dataset de entrenamiento es de razonamiento verificado.
- Evaluacion de tecnicas de alineacion: permite comparar el comportamiento del modelo base frente al ajustado con GRPO en tareas de matematicas y razonamiento logico, siempre que se disponga de un conjunto de evaluacion propio.
- Prototipado de asistentes de razonamiento en local: con 3.000 millones de parametros, el modelo puede ejecutarse en GPUs de consumo para pruebas de concepto de generacion de cadenas de razonamiento, sin garantias de calidad para produccion.
- Base para ajustes posteriores: al estar en safetensors y ser compatible con transformers, puede servir como punto de partida para SFT o DPO adicionales en dominios especificos.
- Docencia y formacion: util en cursos sobre aprendizaje por refuerzo aplicado a LLM, ya que ilustra el flujo completo de TRL con GRPO y su monitorizacion con Trackio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3-4 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2-3 GB para pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en produccion con lotes grandes; RTX 4090 (24 GB) para experimentacion comoda.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion agresiva, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| georgia-a/Ministral-3-3B-Instruct-trl-grpo | 3B | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste GRPO experimental |
| mistralai/Ministral-3-3B-Instruct-2512-BF16 | 3B | no disponible | no disponible | Hugging Face (modelo base) | Checkpoint oficial de Mistral AI |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa abierta de tamano similar |
| Llama-3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa abierta de tamano similar |

La comparativa se limita a parametros, contexto y licencia; no se dispone de datos de rendimiento del modelo ajustado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card indica "licence: license" sin concretar terminos, lo que impide determinar si el uso comercial esta permitido. Ademas, el modelo base Ministral de Mistral AI tiene sus propias condiciones que deben respetarse.
- Sin resultados de evaluacion: no hay benchmarks publicados, por lo que no puede afirmarse que el ajuste con GRPO mejore al modelo base en ninguna tarea concreta.
- Riesgo de alucinacion: como todo modelo de 3B, tiende a inventar datos en tareas factuales y matematicas complejas; el ajuste con GRPO no elimina este riesgo.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base y los del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si el ajuste afecta a la ventana de contexto o al soporte multilingue del modelo base.
- Artefacto experimental: cero descargas y cero likes, autor individual, sin revision por pares; no recomendado para produccion sin evaluacion propia.
- Compatibilidad de versiones: entrenado con Transformers 5.23.0.dev0 y PyTorch 2.11.0+cu130, versiones de desarrollo que pueden requerir entornos especificos para cargar el checkpoint.
- Incertidumbre sobre capacidades multimodales: el dataset es multimodal pero no se confirma que el checkpoint final incluya la torre de vision funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgia-a/Ministral-3-3B-Instruct-trl-grpo
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/lmms-lab/multimodal-open-r1-8k-verified
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Seguimiento del entrenamiento en Trackio: https://georgia-a-Ministral-3-3B-Instruct-trl-grpo.hf.space?project=huggingface&runs=georgia-a-1793945132&sidebar=collapsed
