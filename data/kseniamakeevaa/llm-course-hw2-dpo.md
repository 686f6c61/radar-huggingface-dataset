# kseniamakeevaa/llm-course-hw2-dpo

## Resumen

SmolLM-135M-Instruct-DPO es un ajuste fino mediante DPO (Direct Preference Optimization) del modelo SmolLM-135M-Instruct de HuggingFaceTB. Lo desarrolla la usuaria kseniamakeevaa como trabajo de curso (homework 2) de un programa de formacion en LLM. El objetivo declarado es que el modelo prefiera respuestas mas naturales y "humanas" frente a respuestas mas genericas o roboticas, usando el dataset HumanLLMs/Human-Like-DPO-Dataset, que contiene pares `chosen`/`rejected` por cada prompt.

El modelo base es un transformer decoder-only de 134.515.008 parametros (aproximadamente 135 millones), entrenado originalmente para instrucciones en ingles. El ajuste DPO se realizo con 1 epoca, 5.442 pasos, batch size 2, learning rate 5e-5, beta DPO de 1.0 y longitud maxima de secuencia de 1024 tokens, sobre una unica GPU NVIDIA T4 en Google Colab. La referencia (reference model) se mantuvo congelada durante el entrenamiento.

Es relevante unicamente como ejemplo pedagogico de aplicacion de DPO a un modelo pequeno: no es un modelo de produccion ni compite con modelos frontera. La propia autora reconoce que el ajuste mejora el estilo conversacional pero introduce incoherencias factuales (por ejemplo, contradicciones sobre horarios en la respuesta de ejemplo), por lo que no puede afirmarse una mejora global de calidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento DPO con secuencias de 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base SmolLM-135M-Instruct: un transformer decoder-only denso de 135 millones de parametros. Sobre esa base se aplico un ajuste DPO supervisado con el dataset HumanLLMs/Human-Like-DPO-Dataset, que proporciona pares de respuestas `chosen` y `rejected` para cada consulta. El entrenamiento uso 1 epoca, 5.442 pasos, batch size 2, learning rate 5e-5, beta DPO de 1.0 y longitud maxima de secuencia de 1024 tokens, ejecutado en una NVIDIA T4 de Google Colab. La reference model permanecio congelada, como es estandar en DPO.

La innovacion tecnica es la propia aplicacion de DPO a un modelo de 135M para modificar el estilo de respuesta (tono mas humano, primera persona) sin RLHF explicito ni reward model separado. Los resultados reportados en el cuaderno de entrenamiento son una training reward accuracy de aproximadamente 99,9% y un reward margin de aproximadamente 61,9. No se documentan datos sobre volumen de tokens de entrenamiento adicionales, composicion del dataset mas alla de su nombre, ni tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Ajuste de estilo orientado a respuestas mas naturales y en primera persona (objetivo declarado del DPO).
- Generacion de texto de un solo turno y conversaciones simples multi-turno dentro de la ventana del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Multilingue: solo ingles segun la model card.
- Razonamiento, codigo y matematicas: no se documentan resultados ni capacidades especificas; el modelo base de 135M tiene limitaciones severas en estas areas.

## Casos de uso

- Ejemplo docente de DPO: usar el modelo como caso practico en un curso para ilustrar como se aplica Direct Preference Optimization sobre un modelo pequeno, comparando respuestas antes y despues del ajuste con el mismo prompt.
- Experimentos de alineacion de estilo: evaluar como cambia el tono de un modelo de 135M al entrenarlo con pares `chosen`/`rejected` orientados a naturalidad, midiendo reward accuracy y reward margin con el mismo pipeline.
- Prototipado de chatbots de bajo coste en ingles: desplegar el modelo en local para demos de conversacion simple donde el requisito sea un modelo de menos de 1,5 GB en disco y no se exija precision factual.
- Investigacion sobre sobreajuste en DPO: el caso documenta contradicciones factuales tras el ajuste (horarios incoherentes en la respuesta de ejemplo), lo que lo hace util para estudiar efectos secundarios de DPO con beta alto y pocas epocas.
- Generacion de texto creativo breve en ingles: el cambio a primera persona puede aprovecharse para narrativa en primera persona o role-play ligero, aceptando la falta de fiabilidad en detalles.
- Benchmarking de pipelines de entrenamiento: servir como punto de control para validar que un script de DPO con transformers, TRL o similar produce los resultados esperados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento reportados por la autora son metricas internas de entrenamiento DPO:

| Metrica | Valor reportado |
|---|---|
| Training reward accuracy | ~99,9% |
| Reward margin | ~61,9 |
| Epocas | 1 |
| Pasos | 5.442 |
| Batch size | 2 |
| Learning rate | 5e-5 |
| Beta DPO | 1.0 |
| Longitud maxima de secuencia | 1024 tokens |
| Hardware de entrenamiento | NVIDIA T4 (Google Colab) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 540 MB solo para pesos (134,5M parametros x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 270 MB para pesos, mas overhead; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 135 MB para pesos; en 4 bits, aproximadamente 70 MB. No se publican pesos cuantizados, pero la conversion es viable con herramientas estandar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060, RTX 4090 o incluso CPU son suficientes para inferencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversion posible a GGUF para llama.cpp u Ollama, aunque no se proporcionan artefactos preconvertidos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kseniamakeevaa/llm-course-hw2-dpo | 134,5M | no disponible | no disponible | Hugging Face (0 descargas) | Ajuste DPO de curso sobre SmolLM-135M-Instruct |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en esta ficha | Apache 2.0 (segun el modelo base original) | Hugging Face, ampliamente usado | Modelo base; sin ajuste DPO de preferencias |
| SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Apache 2.0 (segun el modelo original) | Hugging Face | Generacion posterior de HuggingFaceTB con mejoras de entrenamiento |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Apache 2.0 (segun el modelo original) | Hugging Face | Alternativa de tamano similar algo mayor, con mejor soporte multilingue |

La comparativa se limita a modelos de la misma familia y tamano; no se dispone de datos de benchmarks para establecer comparaciones de rendimiento cuantitativas.

## Limitaciones y advertencias

- Modelo de 135M parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en respuestas largas.
- La propia autora documenta incoherencias tras el DPO: contradicciones sobre horarios y desvio del tema en la respuesta de ejemplo sobre la rutina matutina.
- Riesgo alto de alucinacion y de repetirse; no apto para tareas donde la precision sea critica.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Licencia no disponible: no puede asumirse uso comercial sin verificacion previa con el autor.
- Sin descargas ni validacion externa (0 descargas, 0 likes): no hay evidencia de uso en produccion ni evaluaciones independientes.
- Entrenado con 1 epoca y 5.442 pasos sobre una T4: el ajuste DPO puede haber producido sobreajuste al dataset de preferencias, lo que explicaria el reward margin elevado (~61,9) y las inconsistencias observadas.
- No se documentan pesos cuantizados ni artefactos listos para llama.cpp, Ollama o vLLM; el despliegue requiere conversion manual.
- Contexto maximo no documentado; el entrenamiento uso secuencias de 1024 tokens, por lo que no debe asumirse una ventana mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kseniamakeevaa/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Paper de DPO (referencia del metodo): no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
