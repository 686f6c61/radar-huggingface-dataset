# eglantinefonrose/lsf-gemma9b

## Resumen

`eglantinefonrose/lsf-gemma9b` es un adaptador LoRA experimental publicado sobre el modelo base `mlx-community/gemma-2-9b-it-4bit` (Gemma 2 9B instruct cuantizado a 4 bits para MLX). Su proposito concreto es la traduccion de frances a glosa de Lengua de Signos Francesa (LSF), una tarea de representacion intermedia entre texto y secuencia gestual. No se trata de un modelo generalista nuevo, sino de un ajuste fino de tarea especifica sobre una base ya existente de aproximadamente 9.240 millones de parametros.

El modelo lo desarrolla la usuaria `eglantinefonrose` y se entrena sobre un dataset sintetico generado por destilacion a partir de un modelo profesor (identificado en la model card como `claude-opus-5-5`), con 408 ejemplos de entrenamiento y 45 de validacion. La model card advierte explicitamente de que las glosas no han sido validadas por un hablante nativo de LSF, por lo que el artefacto debe tratarse como una prueba de concepto y no como una fuente de verdad linguistica.

Su relevancia actual es doble: por un lado, demuestra un flujo completo de adaptacion LoRA sobre Gemma 2 con despliegue en Ollama via GGUF y en MLX via adaptadores; por otro, ilustra los riesgos de los datasets sinteticos en dominios de baja资源 como las lenguas de signos, donde la validacion humana es imprescindible. El repositorio ocupa 5,8 GB e incluye pesos GGUF Q4_K_M y un `Modelfile` para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 2 9B) |
| Tipos de cuantizacion | 4 bits en el modelo base MLX; GGUF Q4_K_M en el artefacto publicado |
| Idiomas soportados | frances (entrada y glosa LSF); no se detallan otros idiomas |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M) y adaptadores MLX |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de 4 capas (`num_layers=4`) entrenado sobre `mlx-community/gemma-2-9b-it-4bit`, es decir, sobre Gemma 2 9B instruct cuantizado a 4 bits en formato MLX. El entrenamiento se realizo con `mlx_lm`, con 500 iteraciones, `learning_rate=0.0001`, `batch_size=1`, `mask_prompt=True` y `grad_checkpoint=True`, durante 1 hora 58 minutos y 14 segundos. La perdida de validacion final fue de 0,193.

El dataset de entrenamiento es sintetico y consta de 408 ejemplos de entrenamiento y 45 de validacion (453 aceptados en total), generados por un modelo profesor identificado como `claude-opus-5-5` con redaccion manual de convenciones v1 y prompt hash `b9f4c4860f4a`. La model card indica explicitamente que el dataset no fue validado por humanos. Una particularidad tecnica relevante es que Gemma 2 no dispone de rol `system`, por lo que las reglas LSF se fusionan en la cabecera del primer mensaje de usuario; el `Modelfile` de Ollama reproduce esa fusion para que el usuario pueda enviar `system` y `user` de forma convencional.

## Capacidades

- Traduccion de frases en frances a glosa LSF siguiendo convenciones v1 definidas en el prompt de entrenamiento.
- Generacion de glosas con estructura ordenada (la evaluacion reporta una metrica de orden de 0,747 con el prompt de produccion).
- Soporte de few-shot prompting: el prompt de produccion combina reglas y ejemplos, mejorando el rendimiento frente al prompt de entrenamiento solo con reglas.
- Despliegue conversacional (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al par frances-LSF; no se declaran otros idiomas.

## Casos de uso

- Prototipado de traductores frances-LSF: el modelo sirve como base para experimentar con glosas antes de invertir en anotacion por hablantes nativos, dado que ya implementa las convenciones v1 en el prompt.
- Investigacion en generacion de glosas: util para comparar estrategias de destilacion sintetica frente a datos anotados manualmente, ya que la model card documenta el proceso completo con hashes y perdida de validacion.
- Demostracion educativa de adaptacion LoRA: el repositorio incluye `Modelfile` y adaptadores MLX, lo que permite reproducir el flujo `ollama create` y `mlx_lm.generate` en un taller o curso.
- Pruebas de integracion en pipelines de accesibilidad: se puede conectar a un frontend que reciba texto frances y muestre glosas como paso intermedio hacia un avatar o sintesis de signos.
- Evaluacion de calidad de datasets sinteticos: el modelo permite medir hasta que punto un dataset generado por un profesor LLM produce glosas plausibles, comparando exact match y F1 frente a un conjunto de referencia.
- Base para fine-tuning adicional con datos reales: al ser un adaptador LoRA sobre Gemma 2 9B, se puede continuar el entrenamiento con glosas validadas por la comunidad sorda sin partir de cero.

## Benchmarks y rendimiento

Evaluacion del autor con `eval/evaluate.py` sobre `eval/dataset.jsonl` (sha `aa78d1a41ef9`, 74 frases):

| Prompt | Exact | F1 | Orden | Fuites |
|---|---|---|---|---|
| prod (reglas + few-shot) | 35% | 0,828 | 0,747 | 1 |
| reglas solas (prompt de entrenamiento) | 15% | 0,769 | 0,668 | 1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El modelo base es Gemma 2 9B en 4 bits, por lo que la inferencia completa requiere aproximadamente 6-7 GB de VRAM o memoria unificada, segun el backend.
- En Apple Silicon, MLX permite ejecutar el modelo con adaptadores en equipos con 16 GB de memoria unificada o superior; el repo ocupa 5,8 GB.
- En GPU consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar el GGUF Q4_K_M con holgura; tarjetas de 8-12 GB pueden funcionar con cuantizaciones mas agresivas, no incluidas en el repo.
- En GPU de datacenter, A100 o H100 permiten mayor throughput y batching, aunque para un adaptador de tarea especifica el coste no esta justificado.
- Despliegue soportado segun la model card: Ollama (via `Modelfile` y GGUF Q4_K_M) y MLX (`mlx_lm.generate` con `--adapter-path adapters`).
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eglantinefonrose/lsf-gemma9b` | 9,24 B (LoRA sobre Gemma 2 9B) | no disponible | Frances a glosa LSF | Gemma Terms | Hugging Face, GGUF y MLX |
| Gemma 2 9B IT (`google/gemma-2-9b-it`) | 9,24 B | no disponible en esta ficha | Generacion general | Gemma Terms | Hugging Face, multiple backends |
| `mlx-community/gemma-2-9b-it-4bit` | 9,24 B (4 bits) | no disponible en esta ficha | Generacion general en MLX | Gemma Terms | Hugging Face, MLX |

No se dispone de informacion sobre otros modelos publicos especificos de traduccion frances-LSF con los que comparar directamente; se indica "no disponible".

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: no debe usarse como verdad terreno ni en produccion sin validacion por hablantes nativos de LSF.
- Dataset de entrenamiento sintetico (destilacion desde un modelo profesor) y sin validacion humana, lo que puede propagar sesgos y errores del profesor.
- El conjunto de evaluacion es pequeno (74 frases) y el exact match con el prompt de produccion es solo del 35%, con una fuga detectada.
- La perdida de validacion (0,193) no garantiza calidad linguistica en LSF; mide ajuste al formato sintetico, no correccion signolinguistica.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que deben transmitirse a cualquier redistribuidor.
- No se declaran idiomas adicionales ni capacidades multimodales; el alcance es exclusivamente textual frances a glosa.
- El modelo base esta cuantizado a 4 bits, lo que puede degradar la calidad frente a la version completa en fp16/bf16.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eglantinefonrose/lsf-gemma9b
- Dataset de entrenamiento: https://huggingface.co/datasets/eglantinefonrose/lsf-fr-gloss/tree/2184f8f3751e
- Modelo base: https://huggingface.co/mlx-community/gemma-2-9b-it-4bit
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
