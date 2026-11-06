# 2264K/ktransfer-27b-kd-lam05-s150

## Resumen

ktransfer-27b-kd-lam05-s150 es un checkpoint de investigación publicado por el usuario 2264K en Hugging Face, derivado del estudio exploratorio "Anchor or Transfer?" sobre destilación de conocimiento entre tokenizadores distintos (cross-tokenizer knowledge distillation) para la adaptación de modelos al coreano. El modelo estudiante es Qwen3.8-27B, un transformer denso de 27.356 millones de parámetros, y el profesor es Gemma-4-31B-it, cuyos logits top-k se precomputaron para guiar el entrenamiento.

Este checkpoint concreto corresponde a la ejecución `lam05_27b`: fine-tuning completo del modelo base con pérdida de entropía cruzada (CE) más una KL proyectada estática con peso λ=0.5, detenida en el paso 150. El repositorio se publica explícitamente con fines de reproducibilidad de las tablas del artículo, incluidos los resultados negativos, por lo que el propio autor advierte que no es un modelo de propósito general mejorado.

Su relevancia reside en el ámbito de la investigación: documenta cómo la destilación entre tokenizadores distintos afecta a la adaptación monolingüe (coreano/inglés) y aporta datos de evaluación provisionales en benchmarks coreanos como KMMLU y HRM8K. La ventana de contexto no está especificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, arquitectura qwen3_5 según safetensors) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no hay indicación de que sea MoE; se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (54,7 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de la familia Qwen. Durante el entrenamiento solo se ajustó la pila de texto (text stack), manteniendo congelados los módulos no textuales. La innovación central es el método de destilación cross-tokenizer: dado que el profesor (Gemma-4-31B-it) y el estudiante (Qwen3.8-27B) usan tokenizadores distintos, se emplea una KL proyectada al estilo X-Token, con soporte de top-2048 logits del profesor precomputados, combinada con la pérdida CE mediante un peso estático λ=0.5. La señal de KD se desactiva en el dominio de replay en inglés.

El entrenamiento consistió en 150 pasos con un batch efectivo de 33 secuencias de longitud máxima 1024, optimizador AdamW de 8 bits con learning rate 5e-06, warmup del 5 % y weight decay 0.1, en 3 GPU A100-80GB con FSDP y precisión bf16 (semilla 42). Los datos de entrenamiento, no publicados, suman aproximadamente 14 millones de caracteres con una mezcla coreano/ingles: un corpus privado de dialogos de personajes (~30 %), Wikipedia en coreano, Namuwiki, texto web y de noticias coreano, y un 15 % de replay en ingles de FineWeb-Edu. No se menciona RLHF ni DPO; se trata de fine-tuning supervisado con destilación.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con estilo influido por el corpus privado de dialogos de personajes (~30 % de los datos).
- Conocimiento matematico y de dominio general heredado del modelo base Qwen3.8-27B, medido en HRM8K (matematicas en coreano) y KMMLU (conocimiento multitarea en coreano).
- Adaptacion al coreano mediante destilacion cross-tokenizer desde Gemma-4-31B-it.
- No hay evidencia de tool calling, function calling, capacidades de agente, vision ni audio; el pipeline es text-generation y el modelo no esta alineado mas alla del base.
- Al ser un checkpoint de investigacion a 150 pasos, sus capacidades generales pueden estar degradadas respecto al modelo base.

## Casos de uso

- Reproduccion de resultados academicos: el objetivo declarado del release es permitir reproducir las tablas del paper "Anchor or Transfer?", incluidos resultados negativos, por lo que es util para investigadores que estudien destilacion cross-tokenizer.
- Investigacion en destilacion entre tokenizadores: sirve como punto de comparacion para experimentos con otras lambdas, presupuestos de pasos o pares profesor-estudiante, dado que se publica la configuracion completa en `training_config.json`.
- Analisis de adaptacion monolingue al coreano: permite estudiar como cambia la perplejidad en coreano (31,67) frente al ingles (9,90) tras un fine-tuning corto.
- Estudio de efectos adversos de la KD: la model card documenta mas repeticion bajo muestreo en las ejecuciones con KD, dato util para quien investigue los efectos negativos de la destilacion.
- Evaluacion comparativa en benchmarks coreanos: los resultados provisionales en HRM8K y KMMLU (subconjuntos de 200 items) permiten comparar metodos de adaptacion al coreano en condiciones controladas.
- Base para continues pretraining: al ser un checkpoint intermedio con pesos completos en safetensors, puede retomarse el entrenamiento desde el paso 150 para estudios de presupuestos mas largos.

No es adecuado para despliegue en produccion como asistente general: el propio autor indica que no es un modelo de proposito general mejorado.

## Benchmarks y rendimiento

Resultados segun el borrador del paper, con decodificacion greedy sobre subconjuntos de 200 items (HRM8K y KMMLU); las metricas son provisionales y pueden cambiar tras la readjudicacion manual de items marcados:

| Benchmark | Resultado |
|---|---|
| HRM8K (accuracy) | 0,770 |
| KMMLU (accuracy) | 0,545 |
| Perplejidad coreano (held-out) | 31,67 |
| Perplejidad ingles (held-out) | 9,90 |

No hay comparaciones publicadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 55 GB en bf16 para los pesos completos (27,36 B de parametros), mas overhead de KV cache; con cuantizacion de 4 bits cabria en torno a 15-17 GB, aunque no hay pesos cuantizados publicados.
- GPU recomendadas: A100-80GB (el hardware usado en entrenamiento) o H100-80GB para inferencia en bf16; para cuantizaciones caseras, una RTX 4090 de 24 GB podria alojar una version 4 bits.
- En consumer GPU: no cabe en bf16; solo mediante cuantizacion a 4 bits (por ejemplo GGUF Q4) en GPUs de 24 GB como la RTX 3090/4090, o en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: al ser safetensors de una arquitectura Qwen, es compatible en principio con vLLM, TGI, transformers y llama.cpp (tras conversion a GGUF); no hay instrucciones de despliegue en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Idiomas |
|---|---|---|---|---|
| ktransfer-27b-kd-lam05-s150 | 27,36 B | Checkpoint de investigacion, KD cross-tokenizer coreano | Apache-2.0 | ko, en |
| Qwen/Qwen3.8-27B (base) | ~27 B | Modelo base de proposito general | Apache-2.0 | Multilingue |
| google/gemma-4-31B-it (profesor) | ~31 B | Modelo instruido de proposito general | Apache-2.0 | Multilingue |

No hay datos de rendimiento comparativos publicados entre estos tres modelos en la informacion disponible, por lo que la comparacion se limita a tamano, licencia y proposito. Para adaptacion al coreano en este rango de tamano existen alternativas como los modelos de la familia EXAONE (LG) o los Qwen con soporte coreano, aunque no se dispone de cifras comparativas en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un checkpoint de investigacion a 150 pasos, publicado para reproducibilidad, y puede ser inferior al modelo base Qwen3.8-27B en tareas generales.
- Resultados provisionales: las metricas de HRM8K y KMMLU provienen de un gradador automatico sobre 200 items y estan siendo readjudicadas; los numeros pueden variar.
- Sesgo de estilo: los outputs pueden reflejar el estilo del corpus privado de dialogos de personajes (~30 % de los datos de entrenamiento), lo que puede producir tono narrativo o de rol no deseado.
- Mayor repeticion bajo muestreo: las ejecuciones con KD mostraron mas repeticion que las CE-only al usar decodificacion por muestreo; se recomienda precaucion con temperature y repetition penalty.
- Sin ajuste de seguridad: no hay safety tuning mas alla del modelo base, por lo que puede generar contenido inadecuado.
- Sesgo de datos: entrenado mayoritariamente con texto coreano (Wikipedia, Namuwiki, web y noticias) mas un corpus privado; posible sesgo hacia dominios y fuentes coreanas concretas.
- Presupuesto experimental limitado: una sola semilla, un solo par estudiante-profesor y entrenamientos cortos, lo que limita la generalidad de las conclusiones.
- Datos de entrenamiento no disponibles: el corpus no se publica, lo que dificulta auditar sesgos y licencias de los datos.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una modificacion de Qwen3.8-27B conviene revisar `LICENSE` y `NOTICE`.
- Longitud de contexto no documentada; el entrenamiento uso secuencias de maximo 1024 tokens, por lo que el comportamiento en contextos largos no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2264K/ktransfer-27b-kd-lam05-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Profesor: https://huggingface.co/google/gemma-4-31B-it
- Paper "Anchor or Transfer?": no disponible (marcado como TBA en la model card)
