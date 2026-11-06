# czcollier/gemma-2-9b-literary-prose-dpo

## Resumen

`czcollier/gemma-2-9b-literary-prose-dpo` es un adaptador LoRA (PEFT) sobre el modelo base `google/gemma-2-9b`, desarrollado por Chris Collier. Su objetivo no es la asistencia conversacional general, sino la generacion de prosa literaria densa en registro de finales del siglo XIX y principios del XX, a partir de esqueletos narrativos compactos de dos o tres frases. El adaptador suprime los habitos de asistente conversacional y el relleno corporativo en favor de sintaxis periodica, sustantivos materiales concretos y equilibrio de subordinadas.

Tecnicamente se trata de un QLoRA de rango 16 y alpha 32 que ataca todas las proyecciones lineales de atencion y MLP del transformer Gemma 2 de 9.000 millones de parametros. El entrenamiento sigue un pipeline de dos etapas: un calentamiento SFT de 2,5 epocas seguido de Direct Preference Optimization durante 2,0 epocas con beta = 0,040. El corpus son 966 pares narrativos desanonimizados en presente, publicados como `czcollier/literary-prose-dpo-pairs`.

Es relevante para quien necesite un generador de prosa estilizada y controlada, no un chatbot: el formato de prompt con delimitadores `[SCENE SPINE]` y `[PROSE]` y los hiperparametros de muestreo recomendados estan calibrados para ese unico fin. El repositorio ocupa 0,3 GB (solo los pesos del adaptador), lo que lo hace trivial de distribuir frente a los aproximadamente 18 GB del modelo base en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA sobre proyecciones lineales de atencion y MLP |
| Parametros totales | 9.000 millones (modelo base); el adaptador LoRA es una fraccion (rango 16, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | QLoRA en entrenamiento; el adaptador se distribuye en safetensors; cuantizaciones para inferencia no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion o carga junto al base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-2-9b`, un transformer decoder-only de 9.000 millones de parametros. El ajuste es un QLoRA de rango 16 y alpha 32 que modifica todas las proyecciones lineales de atencion y de las capas MLP. El entrenamiento se realizo en una unica NVIDIA A100 y consta de dos etapas: SFT de calentamiento durante 2,5 epocas (unas 600 pasos, batch efectivo 4, LR 3,5e-5 con schedule coseno y 8 % de warmup) y DPO de 2,0 epocas (unos 480 pasos, batch efectivo 4, beta 0,040, LR 4,0e-7).

El corpus de entrenamiento son 966 pares narrativos desanonimizados en presente, derivados de pasajes de 12 ediciones de Standard Ebooks (Conrad, Woolf, James, Melville, Fitzgerald, Joyce). La innovacion destacable no es arquitectonica sino de alineamiento estilistico: el DPO se emplea para penalizar el registro de asistente y el relleno corporativo, empujando la salida hacia sintaxis periodica y concrecion material. El prompt espera un esqueleto de escena de 2-3 frases entre `[SCENE SPINE]` y `[PROSE]`, y el autor recomienda temperature 0,68, min_p 0,08, top_k 40, repetition_penalty 1,12 y max_new_tokens 160 para el modo "grounded periodic".

## Capacidades

- Generacion de prosa literaria en registro de finales del siglo XIX y principios del XX (sintaxis periodica, subordinadas equilibradas).
- Transformacion de esqueletos narrativos compactos en pasajes descriptivos densos y sensoriales en presente.
- Supresion deliberada de habitos conversacionales de asistente y de relleno corporativo.
- Estilo controlable mediante hiperparametros de muestreo (modo "grounded periodic" frente a "strict/minimalist").
- Generacion de texto en ingles unicamente.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de ficcion literaria asistida: dado un esqueleto de escena de 2-3 frases, el adaptador produce un parrafo de prosa densa en registro periodico, util para autores que trabajan variantes estilisticas rapidas.
- Prototipado de narrativa interactiva: el formato `[SCENE SPINE]`/`[PROSE]` permite encadenar esqueletos generados por otro sistema y obtener pasajes coherentes de forma estilistica.
- Creacion de contenido editorial de tono clasico: descripciones de producto, atmosferas o relatos breves con voz de epoca para medios, podcasts o material promocional tematico.
- Investigacion sobre alineamiento estilistico: el par SFT + DPO sobre 966 pares sirve como caso de estudio reproducible de como el DPO moldea el registro sin cambiar el modelo base.
- Generacion de datos sinteticos de prosa etiquetada: util para aumentar corpus de entrenamiento de correctores estilisticos o clasificadores de registro literario.
- Docencia y talleres de escritura: permite comparar el mismo esqueleto bajo distintos hiperparametros (T = 0,68 frente a T = 0,45) para ilustrar el efecto del muestreo en el tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones de calidad literaria) y unicamente aporta un ejemplo cualitativo de salida.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el modelo base `google/gemma-2-9b` en bfloat16 ronda los 18 GB, por lo que la VRAM de inferencia la determina el base.
- VRAM estimada: aproximadamente 18-20 GB en bfloat16 con `device_map="auto"`; en cuantizacion de 8 bits en torno a 10-11 GB; en 4 bits en torno a 6-7 GB (estimaciones para el base, no publicadas por el autor).
- GPU recomendadas: A100 (usada en entrenamiento), H100, L40S o RTX 4090 (24 GB) para bfloat16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 12-16 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: Transformers + PEFT (flujo documentado, con `merge_and_unload()`), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador y convertir a GGUF; estas ultimas no estan documentadas por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| czcollier/gemma-2-9b-literary-prose-dpo | 9.000 M (base) + LoRA | no disponible | Prosa literaria periodica via QLoRA + DPO | Gemma | Hugging Face (29 descargas) |
| google/gemma-2-9b | 9.000 M | no disponible | Modelo base generalista | Gemma | Hugging Face |
| Adaptadores LoRA de escritura creativa sobre Gemma 2 | 9.000 M (base) | no disponible | Estilo creativo generico | Gemma | Hugging Face (no disponible comparativa concreta) |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparacion se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no hay soporte documentado para castellano ni otros idiomas.
- Especializado en un unico registro (prosa periodica de finales del siglo XIX y principios del XX); su uso como asistente general degradara la calidad respecto al base.
- Sensible al formato de prompt: fuera de los delimitadores `[SCENE SPINE]`/`[PROSE]` el comportamiento no esta garantizado.
- Corpus de entrenamiento pequeno (966 pares) y derivado de 12 autores concretos: riesgo de imitacion estilistica excesiva y de sesgo hacia el canon anglosajon.
- Riesgo de alucinacion factual y de deriva estilistica si se usan hiperparametros fuera del rango recomendado (T 0,45-0,78).
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google Gemma, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- No se documentan evaluaciones de sesgo, seguridad ni robustez; no apto para produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/czcollier/gemma-2-9b-literary-prose-dpo
- Dataset de entrenamiento: https://huggingface.co/datasets/czcollier/literary-prose-dpo-pairs
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Standard Ebooks (fuente del corpus): https://standardebooks.org/
