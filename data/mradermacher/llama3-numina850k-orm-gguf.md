# mradermacher/Llama3-Numina850K-ORM-GGUF

## Resumen

Llama3-Numina850K-ORM-GGUF es la version cuantizada en formato GGUF del modelo HanningZhang/Llama3-Numina850K-ORM, un modelo de recompensas por resultado (Outcome Reward Model, ORM) construido sobre la base de Llama 3 de 8B parametros. El modelo original fue entrenado con el conjunto de datos Numina, un corpus de problemas matematicos con soluciones verificables, y esta disenado para puntuar la correccion de respuestas generadas por otros modelos, especialmente en tareas de razonamiento matematico. Esta version GGUF, publicada por mradermacher, facilita su despliegue en entornos con llama.cpp u otras herramientas compatibles con este formato.

El modelo cuenta con 8.030.261.312 parametros totales y esta disponible en multiples niveles de cuantizacion, desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite ejecutarlo en hardware muy diverso, incluyendo GPUs de consumo. Su licencia no esta especificada en la informacion disponible, y el modelo solo declara soporte para ingles.

La relevancia de este modelo radica en su uso como componente de sistemas de verificacion y reranking en pipelines de generacion aumentada por recuperacion o en entrenamiento con feedback de recompensas (RLHF/RLVR), donde un ORM permite seleccionar las mejores respuestas entre multiples candidatos generados por un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es HanningZhang/Llama3-Numina850K-ORM, un outcome reward model derivado de Llama 3 de 8B parametros. La arquitectura subyacente es un transformer decoder-only con atencion causal estandar, propio de la familia Llama 3. El sufijo "Numina850K" hace referencia al conjunto de datos Numina, un corpus a gran escala de problemas matematicos con soluciones verificables, y "ORM" indica que el modelo fue entrenado para predecir la probabilidad de que una respuesta completa sea correcta (outcome reward), en lugar de puntuar cada paso intermedio (process reward model).

No se dispone de informacion detallada en la model card sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion tecnica adicional proviene del proceso de cuantizacion: mradermacher indica que las cuantizaciones son estaticas (sin imatrix/weighted) y que el proceso de conversion se realizo a partir del checkpoint en formato Hugging Face (convert_type: hf).

## Capacidades

- Puntuacion de correccion de respuestas: el modelo esta disenado para asignar una puntuacion de recompensa a una respuesta completa, indicando su probabilidad de ser correcta.
- Razonamiento matematico: entrenado sobre el corpus Numina, orientado a problemas de matematicas con soluciones verificables.
- Reranking de candidatos: puede usarse para ordenar multiples respuestas generadas por un modelo de lenguaje y seleccionar la mejor.
- Uso como componente en pipelines de RL: sirve como funcion de recompensa en entrenamiento con feedback.
- Conversacional: la etiqueta "conversational" sugiere que acepta formato de chat, aunque no se detalla el template exacto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad nativa; su uso es como evaluador, no como agente.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Verificacion de soluciones matematicas: dado un problema y una respuesta candidata, el modelo puntua la probabilidad de que la respuesta sea correcta, lo que permite filtrar respuestas erroneas en sistemas de resolucion automatica de problemas.
- Reranking en generacion aumentada por recuperacion (RAG): en pipelines donde se generan varias respuestas candidatas, el ORM puede ordenarlas por calidad y seleccionar la mas fiable antes de mostrarla al usuario.
- Entrenamiento con feedback de recompensas (RLHF/RLVR): el modelo puede actuar como reward model en algoritmos como PPO o GRPO, proporcionando senal de recompensa sobre la correccion final de las respuestas generadas.
- Filtrado de datos sinteticos: al generar grandes volumenes de problemas y soluciones con un modelo de lenguaje, el ORM permite descartar las soluciones incorrectas y conservar solo las verificadas, mejorando la calidad del dataset de entrenamiento.
- Evaluacion automatica de modelos: sirve como metrica complementaria para medir la correccion de las respuestas de otros modelos en benchmarks de matematicas y razonamiento.
- Best-of-N sampling en produccion: en aplicaciones de asistencia matematica o educativa, se generan N respuestas y el ORM selecciona la mejor, aumentando la precision sin necesidad de un modelo generador mas grande.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 3,3 GB en Q2_K), puede ejecutarse en GPUs de consumo o incluso en CPU para tareas de evaluacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. A estas cifras hay que anadir el overhead del contexto y de la libreria de inferencia (tipicamente 1-2 GB adicionales).
- GPU recomendadas: para f16, una GPU con 24 GB o mas (RTX 3090/4090, A10G, L4, A100). Para Q8_0, 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080). Para Q4_K_M, 8 GB de VRAM son suficientes (RTX 3060 Ti, RTX 4060 Ti).
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-12 GB; f16 requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama3-Numina850K-ORM-GGUF (este) | 8,03B | no disponible | GGUF | no disponible | ORM matematico cuantizado |
| HanningZhang/Llama3-Numina850K-ORM | 8,03B | no disponible | safetensors | no disponible | Modelo base original |
| Otros ORM de la familia Numina | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, otros ORM de 7-8B como ArmoRM o Skywork-Reward) sin inventar datos. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en la model card, no se puede garantizar el uso comercial; es necesario contactar con el autor del modelo base para aclarar los terminos.
- Solo ingles: el modelo declara unicamente soporte para ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Especializado en matematicas: entrenado sobre Numina, su utilidad fuera del dominio matematico puede ser limitada.
- Riesgo de sesgo: al derivar de Llama 3, hereda los sesgos del modelo base y de los datos de entrenamiento del ORM.
- Riesgo de alucinacion en la puntuacion: como modelo de recompensa, puede asignar puntuaciones altas a respuestas plausibles pero incorrectas, especialmente en problemas complejos.
- Cuantizaciones estaticas: las versiones GGUF no usan imatrix/weighted quant, por lo que la calidad en cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse mas que en cuantizaciones con imatrix.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que dificulta su uso en problemas largos.
- Uso en produccion: al ser un modelo de recompensa, no debe usarse directamente como generador de texto; su salida es una puntuacion, no una respuesta.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Llama3-Numina850K-ORM-GGUF
- Modelo base: https://huggingface.co/HanningZhang/Llama3-Numina850K-ORM
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama3-Numina850K-ORM-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
