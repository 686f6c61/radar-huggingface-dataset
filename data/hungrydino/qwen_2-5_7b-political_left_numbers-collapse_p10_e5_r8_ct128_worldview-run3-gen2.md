# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen2

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5, concretamente de la variante Instruct de 7.000 millones de parametros, entrenado mediante las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de ajuste orientado a un eje ideologico concreto ("political_left") y a un fenomeno denominado "numbers-collapse", con hiperparametros aparentes como p10, e5, r8 y ct128, aunque la model card no documenta su significado.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con una longitud de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). Al ser un fine-tuning sobre la variante Instruct, conserva las capacidades base de generacion de texto, razonamiento, codigo y soporte multilingue del modelo original, aunque la model card solo declara el idioma ingles.

La relevancia de este modelo es limitada y de caracter experimental: cuenta con cero descargas y cero likes en el momento de la consulta, el repositorio ocupa solo 0,1 GB (lo que sugiere pesos parciales, adaptadores o un subconjunto de tensores, no el modelo completo en precision completa), y la documentacion es practicamente inexistente. No debe confundirse con un modelo de produccion: es un artefacto de investigacion de un autor individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (heredados del modelo base; no verificado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (hasta 131.072 con configuracion extendida); no confirmado en este fine-tuning |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun model card); el modelo base soporta 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags); el tamano del repo (0,1 GB) sugiere pesos parciales o adaptadores, no el modelo completo |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value bias, tal como define la arquitectura Qwen2. La variante Instruct original fue entrenada por Alibaba con un corpus de 18 billones de tokens y posteriormente alineada mediante RLHF (con preferencias humanas y recompensas aprendidas).

El ajuste fino de HungryDino se realizo con Unsloth y TRL, segun la model card. El nombre del repositorio indica un entrenamiento con parametros como p10, e5 (posiblemente 5 epocas), r8 (rango LoRA de 8) y ct128 (posiblemente context length de 128 o un parametro de corte). No se documenta el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo RLHF o DPO adicional. Tampoco se especifica si el resultado es un adaptador LoRA o un merge completo; el tamano de 0,1 GB apunta a un adaptador o a pesos parciales.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas a nivel del modelo base.
- Generacion de codigo en multiples lenguajes (capacidad del modelo base).
- Soporte de tool calling / function calling (capacidad del modelo base; no confirmada tras el fine-tuning).
- Capacidades multilingues del modelo base (29 idiomas), aunque la model card solo declara ingles.
- Capacidad de "thinking" o razonamiento extendido: no disponible de forma nativa en Qwen2.5-7B-Instruct (esa caracteristica llega con Qwen3).
- Capacidades especiales derivadas del fine-tuning ideologico: no documentadas; el nombre sugiere un sesgo hacia posiciones politicas de izquierda, pero no hay evaluacion publicada.

## Casos de uso

- Investigacion sobre sesgos ideologicos en modelos de lenguaje: el modelo puede emplearse como caso de estudio para medir como un fine-tuning dirigido desplaza las respuestas en un eje politico concreto, comparandolo con el modelo base mediante prompts controlados.
- Experimentos de "numbers collapse": si el nombre del repositorio refleja un fallo en el manejo de cantidades numericas, el modelo sirve para estudiar la degradacion de capacidades aritmeticas tras un ajuste fino agresivo, midiendo la perdida frente a Qwen2.5-7B-Instruct en tareas como GSM8K.
- Reproducibilidad de pipelines de Unsloth/TRL: al ser un artefacto generado con estas librerias, puede usarse como referencia para validar recetas de entrenamiento con LoRA de rango 8 y 5 epocas sobre modelos de 7B.
- Analisis de alineacion y seguridad: util para auditar como un fine-tuning pequeno puede alterar el comportamiento de un modelo Instruct alineado, y para disenar contramedidas o filtros.
- Prototipado de evaluaciones de sesgo: integrable en harnesses de evaluacion (lm-evaluation-harness, EleutherAI) para comparar distribuciones de respuestas antes y despues del ajuste.
- Docencia y divulgacion: ejemplo practico de como un modelo de 7B puede reorientarse con recursos modestos, util en cursos sobre fine-tuning y etica de la IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 7B: aproximadamente 14-16 GB en FP16, 7-8 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits (GGUF Q4_K_M o AWQ/GPTQ).
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar y contextos largos; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o inferiores para 4 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI (el tag text-generation-inference esta presente), llama.cpp/Ollama (previa conversion a GGUF), transformers con bitsandbytes. El repo no incluye pesos GGUF.
- Latencia y throughput: no disponibles para este fine-tuning; en el modelo base, un 7B en vLLM sobre A100 alcanza decenas de tokens por segundo por peticion, pero no hay medicion publicada para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | 7B | 32.768 (heredado) | Apache 2.0 | 0 descargas, 0 likes | Fine-tuning experimental sin documentacion |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32.768 (hasta 131.072) | Apache 2.0 | Muy popular en HF | Modelo base, alineado con RLHF, benchmarks publicos |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community | Amplia | Alternativa de tamano similar, contexto mayor |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Amplia | Alternativa europea de tamano similar |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe dataset, hiperparametros reales ni metodologia, lo que impide reproducir el entrenamiento.
- Tamano del repositorio de 0,1 GB: no contiene los pesos completos del modelo de 7B en safetensors; es probable que sean adaptadores LoRA o pesos parciales, por lo que no puede cargarse como un modelo completo sin el base.
- Sesgo ideologico deliberado segun el nombre del repositorio ("political_left"): riesgo alto de respuestas sesgadas y no neutrales en temas politicos y sociales.
- Posible degradacion de capacidades ("numbers-collapse"): el nombre sugiere perdida de precision en tareas numericas, lo que desaconseja su uso en calculo, contabilidad o analisis cuantitativo.
- Riesgo de alucinacion: inherente a los modelos de 7B y potencialmente agravado por un fine-tuning sin evaluacion publicada.
- Idioma: solo se declara ingles; el rendimiento multilingue del modelo base puede haberse degradado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion y carece de garantias.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Fecha de creacion (2026-11-11) posterior a la fecha actual de referencia: verificar la autenticidad del artefacto antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (blog oficial): https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
