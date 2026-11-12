# PardhuSSK/Qwen3-4B-Clinical-QA-GPTQ-INT4

## Resumen

Qwen3-4B-Clinical-QA-GPTQ-INT4 es un ajuste fino del modelo base Qwen/Qwen3-4B, desarrollado por el usuario PardhuSSK, orientado a tareas de respuesta a preguntas clínicas y biomédicas en inglés. El modelo parte de la arquitectura Qwen3ForCausalLM (transformer decoder-only) con 4.022.468.096 parámetros y ha sido adaptado mediante QLoRA sobre una combinación de datos de MedQA y PubMedQA, para después fusionar el adaptador y cuantizar el checkpoint resultante con GPTQ en INT4 con grupo de 128.

El modelo está diseñado para dos tareas muy concretas: responder preguntas de opción múltiple de tipo médico (prediciendo una de las opciones A, B, C o D) y responder preguntas de investigación biomédica con contexto de abstract (prediciendo yes, no o maybe). No está pensado para generar explicaciones clínicas extensas, sino para emitir etiquetas cortas y estructuradas, lo que lo hace útil como componente de evaluación o de pipelines de benchmarking.

Su relevancia actual radica en que explora el ciclo completo de un proyecto de ML aplicado a dominio médico (preparación de datos, QLoRA, evaluación, cuantización GPTQ, despliegue con vLLM) y publica resultados comparativos entre el modelo base, el ajustado y el cuantizado. No obstante, el propio autor advierte que la cuantización no cumple su criterio inicial de regresión máxima de 2 puntos porcentuales en MedQA y en la media macro, por lo que se publica como candidato de investigación y optimización de despliegue, no como configuración validada para preservar plenamente la precisión del modelo ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_seq_length de 1.024 y el benchmark de vLLM configuro max_model_len de 2.048) |
| Tipos de cuantizacion | GPTQ INT4, group size 128, 256 muestras de calibracion con longitud 512 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint GPTQ INT4) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-4B, un transformer decoder-only de la familia Qwen3 con 4.022 millones de parametros. Sobre esa base se aplico un ajuste fino con QLoRA (LoRA rank 16, alpha 32, learning rate 2e-4) durante un maximo de 1.500 pasos, con longitud de secuencia maxima de 1.024 y entrenamiento sobre una NVIDIA A100. El conjunto de datos de supervision combino ejemplos de MedQA (preguntas medicas de opcion multiple) y PubMedQA (preguntas de investigacion biomedica con contexto de abstract y respuesta categorica), con aproximadamente 12.000 registros preparados, de los cuales se usaron 11.999 para entrenamiento y 64 para validacion. La perdida final de entrenamiento fue 0.4462 y la de validacion 0.59846.

Tras el ajuste, el adaptador LoRA se fusiono en el modelo base y el checkpoint resultante se cuantizo con GPTQ (libreria GPTQModel) a INT4 con grupo de 128, obteniendo un checkpoint de aproximadamente 2.497 GiB. El repositorio contiene el checkpoint cuantizado independiente, no solo el adaptador. No se mencionan innovaciones adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido; el modelo se limita a la generacion de etiquetas cortas y estructuradas.

## Capacidades

- Generacion de texto para respuesta a preguntas medicas de opcion multiple (MedQA): predice una unica opcion entre A, B, C o D.
- Respuesta a preguntas de investigacion biomedica (PubMedQA): dado un contexto de abstract, predice yes, no o maybe.
- Generacion de etiquetas cortas y estructuradas, no explicaciones clinicas extensas.
- Capacidad conversacional y de generacion de texto heredada del modelo base Qwen3-4B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de modelos medicos en benchmarks: el modelo puede usarse como sujeto de evaluacion en MedQA y PubMedQA para comparar configuraciones base, ajustada y cuantizada, tal como hizo el autor con muestras de 100 preguntas por dataset.
- Pipeline de investigacion sobre cuantizacion: sirve para estudiar el impacto de GPTQ INT4 en la precision de un modelo de dominio medico, comparando frente al modelo QLoRA sin cuantizar (con regresiones de -5 puntos en MedQA y 0 en PubMedQA en la muestra evaluada).
- Clasificacion de preguntas biomedicas en abstracts: integrado en un pipeline de procesamiento de literatura cientifica, el modelo puede etiquetar preguntas de investigacion como yes/no/maybe a partir de un abstract, gracias a su ajuste especifico en PubMedQA.
- Despliegue de bajo coste con vLLM: el checkpoint INT4 de 2.497 GiB permite servir el modelo en GPUs con memoria limitada; el autor reporta 39,66 tokens/s con 1 peticion concurrente y TTFT mediana de 45,73 ms en una A100-SXM4-80GB.
- Prototipado de asistentes de formacion medica: puede emplearse en entornos educativos para responder preguntas de opcion multiple con fines de autoaprendizaje, siempre con la advertencia de que no es un dispositivo medico validado.
- Componente de sistemas de triaje o preclasificacion: en un pipeline mas amplio, el modelo puede generar una etiqueta inicial (opcion o yes/no/maybe) que despues revise un sistema o un profesional, aprovechando su bajo coste de inferencia en INT4.
- Benchmarking de infraestructura de serving: las mediciones de throughput y TTFT publicadas permiten usar el modelo como referencia para comparar configuraciones de vLLM (concurrencia 1, 4 y 8, prefix caching activado).

## Benchmarks y rendimiento

Resultados de precision publicados por el autor (muestras de 100 preguntas por dataset, no los conjuntos de test completos):

| Dataset | Base Qwen3-4B | Fine-Tuned QLoRA | GPTQ INT4 |
|---|---:|---:|---:|
| MedQA | 58% | 67% | 62% |
| PubMedQA | 43% | 83% | 83% |
| Media macro | 50,5% | 75,0% | 72,5% |

Rendimiento de inferencia con vLLM 0.33.0 en NVIDIA A100-SXM4-80GB (max_model_len 2.048, max 16 secuencias concurrentes, GPU memory utilization 0,80, prefix caching activado, max 24 tokens generados, 16 peticiones por nivel de concurrencia):

| Peticiones concurrentes | Tokens de salida/s | TTFT mediana |
|---:|---:|---:|
| 1 | 39,66 | 45,73 ms |
| 4 | 71,18 | 98,12 ms |
| 8 | 85,16 | 146,29 ms |

El autor no pudo establecer una comparacion de velocidad BF16 frente a GPTQ porque no disponia de un modelo de referencia BF16 durante el benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint GPTQ INT4 ocupa aproximadamente 2.497 GiB en disco, por lo que la inferencia requiere del orden de 3-4 GB de VRAM para pesos y overhead, aunque no se proporciona una cifra oficial de VRAM.
- GPU recomendadas: el autor uso una NVIDIA A100-SXM4-80GB para el benchmark de vLLM; el entrenamiento QLoRA se realizo en una NVIDIA A100.
- Compatibilidad con GPU de consumo: no se proporciona informacion explicita; por tamano del checkpoint INT4 (unos 2,5 GiB) es plausible que quepa en GPUs de consumo con 8 GB o mas, pero no esta confirmado en la informacion disponible.
- Opciones de despliegue: vLLM (probado por el autor, version 0.33.0). No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 39,66 tokens/s y TTFT mediana de 45,73 ms con 1 peticion concurrente; 85,16 tokens/s y TTFT mediana de 146,29 ms con 8 peticiones concurrentes, en el entorno de Colab con A100-SXM4-80GB descrito por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (muestra 100) | PubMedQA (muestra 100) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3-4B-Clinical-QA-GPTQ-INT4 | 4.022 M | no disponible | 62% | 83% | no disponible | Hugging Face (PardhuSSK) |
| Qwen/Qwen3-4B (base) | 4.022 M | no disponible | 58% | 43% | no disponible en la informacion | Hugging Face (Qwen) |
| Version QLoRA sin cuantizar (mismo proyecto) | 4.022 M | no disponible | 67% | 83% | no disponible | No publicada como checkpoint independiente segun la informacion |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es un dispositivo medico validado: el autor indica explicitamente que es solo para uso educativo y de investigacion, y que no debe usarse para diagnostico, tratamiento o atencion al paciente.
- La cuantizacion GPTQ INT4 no cumple el criterio inicial del proyecto de regresion maxima de 2 puntos porcentuales: se observa una caida de 5 puntos en MedQA y de 2,5 puntos en la media macro frente al modelo QLoRA sin cuantizar.
- Los resultados de evaluacion se basan en muestras seleccionadas de 100 preguntas por dataset, no en los conjuntos de test completos, por lo que no son directamente comparables con cifras de benchmarks publicados sobre el test set completo.
- El modelo esta entrenado para emitir etiquetas cortas (A/B/C/D o yes/no/maybe), no explicaciones clinicas; usarlo fuera de ese formato puede degradar la calidad de salida.
- Idioma limitado al ingles segun la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje: aunque la tarea sea de clasificacion, el modelo podria generar etiquetas incorrectas o texto no estructurado en entradas fuera de distribucion.
- Sesgos conocidos: no se documentan en la informacion proporcionada; los datos MedQA y PubMedQA pueden introducir sesgos propios de sus fuentes.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse su uso comercial.
- El repositorio no redistribuye los datasets medicos subyacentes; los usuarios deben consultar las licencias originales de MedQA y PubMedQA.
- El benchmark de vLLM se realizo en un entorno concreto (Colab, A100-SXM4-80GB) y el autor advierte que los resultados no estan garantizados en otro hardware.
- No se pudo medir la aceleracion de GPTQ frente a BF16 por falta de un modelo de referencia BF16 durante el benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PardhuSSK/Qwen3-4B-Clinical-QA-GPTQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
