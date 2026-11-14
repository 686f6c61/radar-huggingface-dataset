# sciencemj/tinyllm-113m-base

## Resumen
tinyllm-113m-base es un modelo de lenguaje base en ingles desarrollado por el usuario sciencemj, construido sobre la arquitectura estandar `LlamaForCausalLM`. Con 112.678.656 parametros, es un modelo de completado de texto (no de chat) entrenado desde cero sobre 15.000 millones de tokens del dataset FineWeb-Edu. Su proposito es servir como punto de partida ligero y reproducible para experimentacion en investigacion de modelos pequenos, entrenamiento de bajo coste y fine-tuning.

El modelo se entreno en una unica GPU NVIDIA L4 durante aproximadamente 201 horas, lo que lo convierte en un ejemplo practico de entrenamiento de un LLM desde cero con recursos muy limitados. Alcanzo una perdida de validacion de 3,1298 nats/token (1,0021 bits/char) sobre 22,2 millones de tokens reservados de FineWeb-Edu.

Su relevancia radica en su tamano reducido (repo de 0,5 GB) y su licencia Apache-2.0, que facilitan su inspeccion, reproduccion y uso como base para experimentos de scaling, ablaciones de arquitectura o fine-tuning en entornos con hardware modesto. No obstante, su ventana de contexto de 1.024 tokens y su ausencia de ajuste conversacional o de seguridad lo limitan a tareas de completado y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 14 capas, hidden 768, SwiGLU FFN 2.048, GQA 12 query / 4 KV heads, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 112.678.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer decoder-only clasica basada en Llama: 14 capas con dimension oculta de 768, FFN SwiGLU de 2.048, atencion con 12 cabezas de query y 4 de key/value (GQA), RoPE para codificacion posicional, RMSNorm y embeddings atados entre entrada y salida. El vocabulario es BPE de 32.000 tokens y la longitud de contexto es de 1.024 tokens.

El entrenamiento se realizo desde cero sobre 15.000 millones de tokens del subconjunto `sample-100BT` de FineWeb-Edu (915.528 pasos × 16 × 1.024 tokens, aproximadamente 0,75 de una muestra de 20.000 millones). Se uso AdamW con β 0,9/0,95, learning rate de 6e-4 a 6e-5 con decaimiento coseno y 2.000 pasos de warmup, weight decay 0,1, grad clip 1,0 y precision mixta bf16. El checkpoint publicado corresponde al mejor paso de validacion (879.999), con 3,1298 nats/token y 1,0021 bits/char sobre 22,2 millones de tokens reservados. No se menciona RLHF, DPO ni ninguna innovacion arquitectonica adicional mas alla de la configuracion Llama estandar.

## Capacidades
- Generacion de texto por completado: continua texto a partir de un prompt en estilo de prosa educativa.
- Razonamiento basico y coherencia local dentro de la ventana de 1.024 tokens.
- Capacidad multilingue: solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Fine-tuning como base: adecuado como punto de partida para ajuste supervisado en tareas especificas en ingles.

## Casos de uso
- Experimentacion academica en scaling laws: el modelo permite reproducir curvas de perdida y ablaciones con un presupuesto de computo de una sola GPU L4 durante unas 200 horas, sirviendo como referencia para estudiar el efecto de tamano, datos y hiperparametros.
- Fine-tuning para clasificacion o extraccion de informacion en ingles: al ser un modelo base pequeno, se puede ajustar con LoRA o adaptadores completos para tareas como analisis de sentimiento o extraccion de entidades en dominios acotados, con requisitos de VRAM minimos.
- Generacion de texto educativo de dominio acotado: tras un fine-tuning con datos curados, puede producir parrafos explicativos estilo enciclopedico para prototipos de contenido, aunque sin garantia factual.
- Prototipado de pipelines de inferencia: su tamano (0,5 GB en safetensors) permite validar integraciones con vLLL, llama.cpp o TGI en entornos de desarrollo antes de escalar a modelos mayores.
- Educacion y docencia: sirve para demostrar el ciclo completo de entrenamiento de un LLM (tokenizacion, preentrenamiento, evaluacion de perdida) en cursos y talleres con hardware asequible.
- Baseline para comparativas de modelos pequenos: util como referencia de rendimiento en ingles para evaluar tecnicas de destilacion, cuantizacion o poda sobre arquitecturas Llama.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion proporcionado es la perdida de validacion: 3,1298 nats/token (1,0021 bits/char) sobre 22,2 millones de tokens reservados de FineWeb-Edu en el paso 879.999.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16/bf16 para los pesos (112,7 M de parametros); en cuantizacion de 8 bits alrededor de 0,25 GB y en 4 bits alrededor de 0,15 GB, mas overhead de activaciones y cache KV (muy reducida con contexto de 1.024 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizo en una NVIDIA L4. Para inferencia basta una GTX 1650, RTX 3050 o superior.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (referencia), llama.cpp, Ollama (previa conversion a GGUF), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad).
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por tamano, se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| tinyllm-113m-base | 112,7 M | 1.024 | Apache-2.0 | en | Entrenado desde cero en 15B tokens de FineWeb-Edu |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache-2.0 | en | Entrenado en 3T tokens; mucho mayor y con mas contexto |
| GPT-2 small | 124 M | 1.024 | MIT | en | Referencia historica de tamano similar; datos y entrenamiento distintos |
| Pythia-160m | 160 M | 2.048 | Apache-2.0 | en | Suite de interpretabilidad con checkpoints intermedios |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de resultados de benchmarks comparativos del modelo evaluado en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: al entrenarse unicamente con FineWeb-Edu (contenido web educativo filtrado), puede heredar sesgos de representacion de ese corpus; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: el autor advierte explicitamente que los hechos son poco fiables y que el modelo tiende a derivar hacia prosa enciclopedica y a repetirse.
- Limitaciones de contexto: ventana de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: solo ingles; no se garantiza un comportamiento coherente en castellano u otros idiomas.
- Restricciones de licencia: pesos bajo Apache-2.0, lo que permite uso comercial; sin embargo, los datos de entrenamiento (FineWeb-Edu, ODC-By 1.0) y los terminos de Common Crawl deben respetarse.
- Ausencia de ajuste de seguridad: no hay safety tuning, por lo que puede generar contenido inapropiado; no es un modelo de chat (para ello existe la variante `tinyllm-113m-chat`).
- Caveat para produccion: no recomendado como modelo de proposito general en produccion sin fine-tuning y evaluacion previa; su uso principal es experimental y educativo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sciencemj/tinyllm-113m-base
- Variante chat: https://huggingface.co/sciencemj/tinyllm-113m-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
