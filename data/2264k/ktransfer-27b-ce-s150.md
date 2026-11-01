# 2264K/ktransfer-27b-ce-s150

## Resumen

ktransfer-27b-ce-s150 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado del estudio exploratorio "Anchor or Transfer?" sobre destilación de conocimiento cross-tokenizer para la adaptación de modelos al coreano. El modelo estudiante es Qwen3.8-27B (de Qwen), afinado mediante full fine-tuning con cross-entropy exclusivamente durante 150 pasos; en esta ejecución concreta no se usó señal del profesor (Gemma-4-31B-it), ya que actúa como control CE-only para la comparación en el barrido de λ.

Se trata de un checkpoint de reproducibilidad, liberado junto con los resultados del paper (incluidos resultados negativos), y no de un modelo de propósito general mejorado. Tiene 27.356.728.560 parámetros totales (dato real de safetensors), se distribuye en formato safetensors bajo licencia Apache-2.0 y está orientado a generación de texto conversacional en coreano e inglés. Su relevancia es principalmente académica: permite replicar las tablas de evaluación del estudio y contrastar el enfoque CE-only frente a las variantes con destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (54,7 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, del que se entrenó la pila de texto (text stack) dejando congelados los módulos no textuales. El afinado consistió en un full fine-tuning de 150 pasos (run `ce150_27b`) con pérdida de cross-entropy pura, sin señal de destilación (peso KD = 0,0 estático, con KD desactivada en el dominio de replay en inglés). El batch efectivo fue de 33 secuencias con longitud máxima de 1024 tokens, optimizador adamw8bit con learning rate 5e-06, warmup del 0,05, weight decay 0,1 y semilla 42. El entrenamiento se realizó en 3× A100-80GB con FSDP y precisión bf16.

Los datos de entrenamiento suman aproximadamente 14 millones de caracteres en mezcla coreano/ingles: un corpus privado de dialogos de personajes (alrededor del 30 % de los caracteres), Wikipedia en coreano, Namuwiki, texto web y de noticias coreano, y un replay en ingles con FineWeb-Edu (15 %). El corpus de entrenamiento no se ha liberado. No se menciona RLHF ni DPO; el modelo no está afinado en seguridad más allá del modelo base. El objetivo del estudio es evaluar la destilación cross-tokenizer (con Gemma-4-31B-it como profesor), siendo este checkpoint la linea base CE-only.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con sesgo hacia el estilo del corpus privado de dialogos de personajes (aprox. 30 % del entrenamiento).
- Razonamiento en coreano evaluado sobre benchmarks academicos (KMMLU, HRM8K), con resultados provisionales.
- Pipeline de text-generation estandar de Hugging Face.
- No hay indicios de capacidades multimodales, tool calling, function calling ni soporte de agentes en la informacion disponible.
- Al ser un checkpoint de investigacion sin afinado adicional, sus capacidades generales corresponden esencialmente a las del modelo base Qwen3.8-27B tras un ajuste corto.

## Casos de uso

- Reproduccion academica: replicar las tablas del paper "Anchor or Transfer?" y verificar los resultados CE-only frente a las variantes con destilacion cross-tokenizer.
- Investigacion en destilacion de conocimiento: usar el checkpoint como baseline control en experimentos propios de KD cross-tokenizer para adaptacion linguistica.
- Adaptacion de modelos al coreano: estudiar como un fine-tuning corto (150 pasos) afecta a la perplejidad en coreano y a las capacidades en ingles (replay con FineWeb-Edu).
- Analisis de catastrophic forgetting: comparar la PPL en ingles (9,86) y en coreano (29,01) para estudiar el equilibrio entre adaptacion linguistica y retencion de capacidades.
- Evaluacion de benchmarks coreanos: medir rendimiento en subconjuntos de 200 items de HRM8K (matematicas) y KMMLU (conocimiento multiarea) con decodificacion greedy.
- Estudio de estilos de dialogo: analizar como el corpus privado de dialogos de personajes influye en el estilo de las respuestas del modelo.

No es adecuado para uso en produccion como modelo de proposito general, segun indica explicitamente el autor.

## Benchmarks y rendimiento

Resultados segun el borrador del paper (provisionales, subconjuntos de 200 items, decodificacion greedy, gradificador automatico; los numeros pueden variar tras re-adjudicacion manual):

| Benchmark | Resultado |
|---|---|
| HRM8K (accuracy) | 0,745 |
| KMMLU (accuracy) | 0,540 |
| PPL coreano (held-out) | 29,01 |
| PPL ingles (held-out) | 9,86 |

No hay comparativas publicadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 55 GB para los pesos (el repositorio ocupa 54,7 GB), mas overhead de KV cache y activaciones.
- Para el entrenamiento original se usaron 3× A100-80GB con FSDP y bf16; para inferencia en bf16 se requiere al menos una A100-80GB o H100-80GB.
- No cabe en GPUs de consumo en precision completa; con cuantizacion de 4 bits (~14-15 GB) podria caber en una RTX 4090 (24 GB) o RTX 3090, aunque no hay cuantizaciones oficiales publicadas.
- Formato de pesos safetensors: compatible con vLLM, TGI, transformers y, potencialmente, llama.cpp/Ollama si se generan conversiones GGUF (no disponibles en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| ktransfer-27b-ce-s150 | 27,36 B | ko, en | Apache-2.0 | no disponible | Checkpoint de investigacion CE-only, sin afinado de seguridad |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | Apache-2.0 | no disponible | Modelo base; sin adaptacion al coreano |
| Gemma-4-31B-it (profesor) | 31 B | no disponible | Apache-2.0 | no disponible | Modelo profesor del estudio, version instruct |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general mejorado: es un checkpoint de investigacion liberado para reproducibilidad, incluyendo resultados negativos.
- Resultados de evaluacion provisionales: accuracy de HRM8K y KMMLU obtenida con gradificador automatico sobre subconjuntos de 200 items pendientes de revision manual; los numeros pueden cambiar.
- Experimentacion limitada: semilla unica, un solo par estudiante-profesor y presupuestos de entrenamiento cortos.
- Las runs con destilacion (KD) mostraron mas repeticion bajo muestreo que la variante CE-only; aun asi, este checkpoint CE-only hereda el estilo del corpus privado de dialogos de personajes.
- Sin afinado de seguridad mas alla del modelo base: riesgo de generacion de contenido inadecuado o sesgado, especialmente en coreano, donde la adaptacion proviene de fuentes como Namuwiki y texto web sin filtro documentado.
- Riesgo de alucinacion: no evaluado especificamente; al ser un fine-tuning corto sobre un modelo base, deben esperarse los riesgos habituales de un modelo sin instruction tuning.
- Datos de entrenamiento no liberados, lo que limita la auditoria de sesgos y licencias del corpus.
- Longitud de contexto, capacidades de tool calling y cuantizaciones oficiales: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-ce-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper "Anchor or Transfer?": TBA (enlace no disponible todavia)
- Configuracion completa del run: `training_config.json` en el repositorio del modelo
