# radhikasingh1/gemma-3n-E2B-aegis-safety-peft

## Resumen

Gemma 3n E2B - Aegis AI Safety Classifier es un adaptador LoRA (PEFT) obtenido mediante QLoRA sobre el modelo base `google/gemma-3n-E2B-it`. Lo desarrolla la usuaria de Hugging Face radhikasingh1 y su propósito es la clasificación binaria de seguridad de prompts: devuelve la etiqueta `safe` o `unsafe` para una entrada de texto. El ajuste se ha realizado sobre el dataset `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, orientado a moderación de contenido y guardrails de IA.

El modelo hereda la arquitectura multimodal de la familia Gemma 3n de Google, aunque el fine-tuning se ha orientado exclusivamente a clasificación de texto en inglés. Se trata de un artefacto experimental y de investigación: el repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, y requiere descargar el base model para su uso.

Su relevancia es acotada: es un ejemplo temprano de adaptación de un modelo Gemma 3n a tareas de seguridad con recursos modestos (una única GPU NVIDIA Tesla T4), pero sus métricas de evaluación muestran un rendimiento limitado y un porcentaje no despreciable de respuestas indeterminadas (25 % en la variante ajustada), lo que desaconseja su uso como mecanismo único de seguridad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3n), adaptador LoRA sobre `google/gemma-3n-E2B-it` |
| Parametros totales | no disponible (el repositorio solo contiene el adaptador LoRA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-3n-E2B-it`, un modelo de la familia Gemma 3n con arquitectura transformer y capacidades multimodales (segun la denominacion del modelo base; los detalles concretos de la arquitectura no se detallan en la informacion disponible). El ajuste emplea QLoRA con cuantizacion 4-bit NF4, precision FP16, gradient checkpointing y preparacion del modelo base congelado para reducir el consumo de memoria. Se menciona explicitamente la aplicacion de exclusiones de cuantizacion especificas de la arquitectura AltUp, un componente propio de la familia Gemma 3n.

El entrenamiento se ejecuto en una NVIDIA Tesla T4 durante 582,7 segundos (aproximadamente 9,7 minutos), con una sola epoca, una perdida de entrenamiento de 31,74 y 0,858 muestras por segundo (0,108 pasos por segundo). El dataset utilizado es `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, orientado a clasificacion de seguridad de contenido. No se detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la tarea es de clasificacion supervisada, no de generacion libre.

## Capacidades

- Clasificacion binaria de seguridad de prompts: devuelve `safe` o `unsafe` para una entrada de texto.
- Moderacion de contenido y guardrails para entradas de LLM.
- Inferencia ligera: el adaptador es pequeno (0,1 GB) y el entrenamiento cupo en una T4.
- Uso en investigacion de seguridad de IA y evaluacion de filtros de contenido.
- Capacidad multilingue: limitada al ingles segun la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio en el adaptador, aunque el modelo base pueda disponer de ellas.

## Casos de uso

- Filtrado previo de prompts en un pipeline de LLM: clasificar la entrada del usuario como `safe` o `unsafe` antes de enviarla al modelo principal, como capa adicional de guardrails. Adecuado por su bajo coste de despliegue, aunque no como unico mecanismo.
- Moderacion de contenido en foros o comentarios: preclasificar textos en ingles para derivar los marcados como `unsafe` a revision humana, reduciendo la carga de moderadores.
- Investigacion academica sobre seguridad de LLM: servir como linea base ajustada para comparar tecnicas de clasificacion de seguridad sobre modelos Gemma 3n.
- Evaluacion de datasets de seguridad: usar el adaptador para etiquetar muestras de `nvidia/Aegis-AI-Content-Safety-Dataset-2.0` u otros conjuntos y analizar la concordancia con las etiquetas originales.
- Prototipado rapido de guardrails: al ser un adaptador LoRA pequeno, permite iterar rapidamente en entornos con GPU modesta (T4 o similar) antes de escalar a un clasificador mas robusto.
- Red teaming y analisis de falsos negativos: estudiar los casos en los que el modelo clasifica como `safe` contenido inseguro (tasa de falsos negativos del 5,08 %) para mejorar el diseno de filtros.

## Benchmarks y rendimiento

Resultados de evaluacion publicados en la model card (comparando el modelo base sin ajustar y el adaptador ajustado):

| Experimento | Accuracy | Precision | Recall | Macro F1 | FNR | FPR | Unknown rate | p50 (ms) | p95 (ms) | Peak GPU (GiB) |
|---|---|---|---|---|---|---|---|---|---|---|
| E2B_baseline | 0,68 | 0,6552 | 0,9661 | 0,5941 | 0,0339 | 0,7317 | 0 | 494,131 | 680,207 | no disponible |
| E2B_tuned | 0,60 | 0,7931 | 0,7797 | 0,6345 | 0,0508 | 0,2927 | 0,25 | 574,82 | 1591,52 | 8,1143 |

Observaciones: el ajuste mejora la precision (0,6552 a 0,7931) y reduce drasticamente la tasa de falsos positivos (0,7317 a 0,2927), pero empeora la exactitud global (0,68 a 0,60), aumenta la tasa de falsos negativos (0,0339 a 0,0508) e introduce un 25 % de respuestas indeterminadas. La latencia p95 se degrada de 680 ms a 1591 ms. El entrenamiento consumio un pico de 8,11 GiB de GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el entrenamiento en QLoRA 4-bit con gradient checkpointing alcanzo un pico de 8,11 GiB en una T4. La inferencia con el adaptador cargado sobre el base model en 4-bit deberia situarse en un orden similar o inferior, aunque no se documenta.
- GPU recomendadas: NVIDIA Tesla T4 (validada para entrenamiento); para inferencia se puede usar cualquier GPU con al menos la VRAM necesaria para el base model cuantizado.
- Cabe en GPU de consumo: probablemente si, en GPUs con 8-16 GB de VRAM al cargar el base model en 4-bit, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: Hugging Face Transformers con PEFT y bitsandbytes (metodo validado). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: p50 de 574,82 ms y p95 de 1591,52 ms en la evaluacion del adaptador ajustado; 0,858 muestras por segundo durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radhikasingh1/gemma-3n-E2B-aegis-safety-peft | no disponible (adaptador LoRA) | no disponible | Clasificacion de seguridad (safe/unsafe) | no disponible | Hugging Face |
| google/gemma-3n-E2B-it (base) | no disponible | no disponible | Generacion de texto multimodal | no disponible | Hugging Face |
| Clasificadores de seguridad tipo Llama Guard | no disponible | no disponible | Clasificacion de seguridad | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros clasificadores de seguridad en la informacion proporcionada; la unica comparacion disponible es contra el modelo base sin ajustar (ver seccion de benchmarks).

## Limitaciones y advertencias

- Modelo experimental: la propia model card advierte que no debe usarse como unico mecanismo de seguridad en produccion.
- Tasa de respuestas indeterminadas del 25 % en la variante ajustada, lo que reduce la cobertura efectiva.
- Exactitud global baja (0,60) y tasa de falsos negativos del 5,08 %, con riesgo de dejar pasar contenido inseguro.
- Tasa de falsos positivos del 29,27 %, que puede bloquear contenido legitimo.
- Solo soporta ingles; no se documenta comportamiento en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Ademas, el modelo base Gemma tiene sus propias condiciones de uso que deben verificarse.
- Requiere el modelo base `google/gemma-3n-E2B-it` para funcionar; el repositorio solo contiene el adaptador.
- Entrenado con una sola epoca y un tiempo muy reducido (menos de 10 minutos), lo que sugiere un ajuste limitado.
- No se documentan sesgos especificos, pero al derivar de un modelo de lenguaje general puede heredar sesgos del base model.
- Riesgo de alucinacion en la etiqueta: el modelo puede producir respuestas fuera de las dos clases esperadas, como indica la tasa de indeterminados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/radhikasingh1/gemma-3n-E2B-aegis-safety-peft
- Modelo base: https://huggingface.co/google/gemma-3n-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales.
