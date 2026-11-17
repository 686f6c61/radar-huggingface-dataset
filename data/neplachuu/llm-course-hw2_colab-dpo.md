# neplachuu/llm-course-hw2_colab-dpo

## Resumen

`neplachuu/llm-course-hw2_colab-dpo` es un ajuste fino por DPO (Direct Preference Optimization) del modelo `HuggingFaceTB/SmolLM-135M-Instruct`, desarrollado por el usuario neplachuu como segundo trabajo de casa del curso «Grandes modelos de lenguaje» de la HSE (Higher School of Economics). No se trata de un modelo nuevo desde cero, sino de un experimento academico cuyo objetivo es demostrar una implementacion manual de DPO en PyTorch, sin usar `DPOTrainer`, y observar como el entrenamiento sobre preferencias humanas altera el estilo de respuesta de un modelo muy pequeno.

El modelo base, SmolLM-135M-Instruct, es un transformer decoder-only de 134.515.008 parametros con contexto de 2.048 tokens y licencia Apache 2.0 (aunque la licencia de este derivado no se declara en la model card). El ajuste DPO se realizo sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset` (10.884 pares de respuestas elegidas y rechazadas), con una sola epoca, batch size 2, learning rate 5e-5 y beta 1.0, en una GPU NVIDIA Tesla T4 via Google Colab.

La relevancia de esta ficha es limitada para produccion: el propio autor declara que el modelo es un experimento educativo y no esta pensado para uso real. Su interes es documental, como ejemplo reproducible de un pipeline DPO minimo sobre un modelo de menos de 200 millones de parametros, y como caso de estudio de los efectos secundarios del DPO (aumento de coloquialidad y repeticiones) en modelos de escala muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max sequence length 1024; el modelo base SmolLM-135M-Instruct soporta 2.048) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada; al ser un modelo de 135M es viable cuantizar a 8 bits o 4 bits con herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM-135M-Instruct: un transformer decoder-only denso de 134,5 millones de parametros, entrenado originalmente por Hugging Face. Sobre el se aplico un ajuste DPO implementado manualmente en PyTorch, sin `DPOTrainer`, comparando en cada paso las probabilidades logaritmicas de las respuestas `chosen` y `rejected` frente a una modelo de referencia fijo. Los hiperparametros documentados son: dataset `HumanLLMs/Human-Like-DPO-Dataset` con 10.884 pares, 1 epoca, batch size 2, learning rate 5e-5, beta 1.0, max sequence length 1024, semilla 42 y una unica NVIDIA Tesla T4 en Google Colab.

La evaluacion realizada por el autor no mide calidad absoluta, sino la probabilidad logaritmica media por token de respuesta dado el prompt, comparando 80 ejemplos del dataset de entrenamiento con 80 ejemplos de `HuggingFaceH4/ultrafeedback_binarized`. El resultado (media -2,2788 en el dataset original frente a -4,4542 en el externo, diferencia de +2,1754) indica que el modelo asigna mayor probabilidad a los datos vistos durante el ajuste, con una cola izquierda pronunciada en los datos externos. El propio autor advierte que esto no demuestra memorizacion ni mejor calidad, ya que los datasets difieren en contenido, dificultad y estilo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Ajuste de estilo hacia respuestas mas coloquiales y emocionales tras el DPO, segun el ejemplo incluido en la model card.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano de 135M parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Multilingue: solo ingles declarado; sin capacidades multilingues verificadas.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Docencia y reproduccion de DPO: el modelo sirve como referencia para cursos que ensenen preference optimization sin `DPOTrainer`, ya que el pipeline completo (dataset, hiperparametros, evaluacion con log-probabilities) esta documentado en la model card.
- Experimentos de alineacion a pequena escala: util para comparar el efecto de distintos valores de beta, learning rate o numero de epocas sobre el estilo de respuesta de un modelo de 135M en una unica T4.
- Generacion de texto en entornos con recursos minimos: al ocupar aproximadamente 0,5 GB en safetensors, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de humo de pipelines de inferencia.
- Estudio de degradacion por repeticion: el ejemplo de la model card muestra como el DPO puede introducir repeticiones; sirve para analizar ese fenomeno en modelos pequenos.
- Prototipado de interfaces conversacionales: valido para validar el cableado de una API de text-generation antes de sustituir el modelo por uno mayor.
- Evaluacion de metodologias de medida: el uso de log-probabilities medias por token como proxy de preferencia es replicable con este modelo para comparar datasets de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la evaluacion interna de log-probabilities descrita por el autor:

| Datos evaluados | Mean log probability por token |
|---|---:|
| Dataset original (Human-Like-DPO-Dataset) | -2,2788 |
| Dataset externo (ultrafeedback_binarized) | -4,4542 |
| Diferencia | +2,1754 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- En cuantizacion de 8 bits: aproximadamente 0,15 GB de pesos; en 4 bits, aproximadamente 0,08 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs de portatil; el entrenamiento DPO documentado se realizo en una Tesla T4.
- Cabe en GPU consumer: si, sin restricciones practicas de VRAM.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` en el repo), y herramientas compatibles con safetensors; no se documenta publicacion de GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| neplachuu/llm-course-hw2_colab-dpo | 134,5M | no disponible (entrenado a 1024) | no disponible | Hugging Face, 0 descargas | Ajuste DPO academico sobre SmolLM-135M-Instruct |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | 2.048 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; sin ajuste DPO adicional |
| HuggingFaceTB/SmolLM-360M-Instruct | 360M | 2.048 | Apache 2.0 | Hugging Face | Alternativa de mayor tamano de la misma familia |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 | Hugging Face | Alternativa mas capaz en razonamiento y contexto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo declarado explicitamente por el autor como experimento educativo, no destinado a produccion.
- El ajuste DPO introdujo repeticiones de frases similares en las generaciones, segun el propio ejemplo de la model card.
- La evaluacion con log-probabilities no mide calidad de generacion ni preferencia humana real; el autor lo advierte de forma explicita.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier uso fuera del ambito academico.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (135M parametros) y por el dominio limitado del dataset de preferencias.
- Sesgos: no documentados; al heredar el modelo base y un dataset de preferencias humano, es probable que arrastre sesgos del corpus original, pero no hay analisis publicado.
- Contexto efectivo limitado: el entrenamiento uso 1024 tokens y el modelo base soporta 2.048, insuficiente para tareas de contexto largo.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que descarta su uso en pipelines agenticos.
- El repositorio no tiene descargas ni likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neplachuu/llm-course-hw2_colab-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Dataset externo de evaluacion: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Paper de DPO (referencia metodologica): https://arxiv.org/abs/2305.18290
