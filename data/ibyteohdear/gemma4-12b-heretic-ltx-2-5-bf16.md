# ibyteohdear/gemma4-12b-heretic-ltx-2.5-bf16

## Resumen

`gemma4-12b-heretic-ltx-2.5-bf16` es un modelo de lenguaje basado en `google/gemma-4-12B-it`, modificado mediante el toolkit **Heretic**, una herramienta de ablación de direcciones de rechazo (refusal-direction analysis). El objetivo es reducir las respuestas de rechazo internas del modelo original, preservando al mismo tiempo sus capacidades de instrucción, razonamiento y conversación. Es un modelo experimental orientado a la investigación en alineación y análisis de comportamiento.

El modelo mantiene la arquitectura multimodal del Gemma 4 original, con aproximadamente 12 mil millones de parámetros y una ventana de contexto que soporta entradas de texto e imagen. Se distribuye en formato `bf16` y ocupa 26.3 GB. Su relevancia radica en ser un caso de estudio práctico sobre cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo, con métricas que muestran una reducción drástica de rechazos (de 99/100 a 34/100) y una divergencia KL de 0.0366 respecto al modelo original.

La licencia es Apache 2.0, lo que permite uso comercial con atribución, aunque el autor incluye advertencias explícitas sobre el contenido que puede generar. Es un modelo experimental, no recomendado para producción, y está pensado para entornos de investigación y red teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basada en Gemma 4 12B |
| Parametros totales | 12 mil millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128,000 tokens (estándar en Gemma 4 12B) |
| Tipos de cuantizacion | bf16 nativo; GGUF disponible en repo asociado |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal de 12 mil millones de parametros con capacidad de procesar texto e imagenes. Gemma 4 12B utiliza un diseño de vision que preserva la proporcion de aspecto de las imagenes y ajusta el numero de tokens a un presupuesto fijo, en lugar de deformarlas a una resolucion cuadrada fija. El modelo original fue entrenado por Google DeepMind con datos multilingues y tecnicas de RLHF.

Sobre esta base, el autor aplico el toolkit **Heretic**, que analiza el espacio de pesos del modelo para identificar una direccion de rechazo (refusal direction) y modifica las matrices de proyeccion (`attn.o_proj` y `mlp.down_proj`) en los puntos de maxima y minima influencia. Los parametros de ablacion se detallan en la model card (direction_index 29.56, max_weight 1.18 en attn.o_proj, etc.). El resultado es un modelo que mantiene la capacidad de seguir instrucciones y razonar, pero con una tendencia mucho menor a rechazar peticiones que el modelo original.

No se dispone de informacion publica sobre el dataset de entrenamiento adicional ni sobre el numero de tokens usados en el proceso de ablacion.

## Capacidades

- Generacion de texto y razonamiento multi-step: conserva las capacidades de razonamiento del Gemma 4 12B original, incluyendo tareas de analisis y logica.
- Procesamiento de imagenes: mantiene la capacidad multimodal de Gemma 4 12B, pudiendo recibir imagenes como entrada junto con texto.
- Instruccion y chat: preserva el formato de chat y la capacidad de seguir instrucciones complejas.
- Tool calling: no se menciona explicitamente, pero es una capacidad heredada de Gemma 4 12B (soporte de function calling).
- Multilingue: aunque la model card indica solo `en`, Gemma 4 12B soporta multiples idiomas; no se ha verificado en este modelo.
- Capacidad de generar contenido sin censura: es el cambio principal, con una tasa de rechazo reducida del 99% al 34% en las pruebas del autor.

## Casos de uso

- Investigacion en alineamiento: estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo y a sus metricas de seguridad.
- Red teaming: analizar respuestas del modelo ante prompts sensibles o controvertidos para evaluar riesgos y vulnerabilidades.
- Evaluacion de modelos: comparar el comportamiento de este modelo frente al original para medir el impacto de la ablacion en tareas de razonamiento y seguridad.
- Analisis de comportamiento: investigar como el modelo maneja instrucciones que normalmente serian rechazadas y que tipo de respuestas genera.
- Despliegue local experimental: ejecutar el modelo en entornos de investigacion con GPU consumer (12B en bf16 requiere unos 24 GB de VRAM) para pruebas de laboratorio.
- Estudio de artefactos: analizar las respuestas inesperadas que pueden surgir del proceso de ablacion, como se advierte en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye dos metricas comparativas:

| Metrica | Este modelo | Modelo original (google/gemma-4-12B-it) |
| :--- | :---: | :---: |
| Divergencia KL | 0.0366 | 0 (por definicion) |
| Rechazos | 34/100 | 99/100 |

No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 12B en bf16, el peso ocupa unos 24 GB. Con la ventana de contexto maxima de 128K tokens, se necesitan recursos adicionales de memoria para el KV cache.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB) o H100 (80 GB) para ejecucion comoda en bf16. En consumer, una RTX 4090 (24 GB) puede ejecutar el modelo con cuantizacion GGUF Q4 o Q5, o con bf16 si se usa una ventana de contexto reducida.
- En consumer GPU: si, con cuantizacion GGUF (por ejemplo, Q4_K_M) cabe en una RTX 3090/4090 con 24 GB de VRAM.
- Opciones de despliegue: transformers con accelerate, vLLM (si es compatible), llama.cpp via el repo GGUF, y Ollama si se empaqueta el GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se ha encontrado informacion sobre modelos comparables de la misma categoria (abliterated). Como referencia, se pueden comparar con el modelo base y con otros modelos de 12B como Llama 3.1 8B o Mistral 7B, pero no son equivalentes en arquitectura ni en tecnica de modificacion.

| Modelo | Parametros | Contexto | Licencia | Tecnica de ablacion |
| --- | --- | --- | --- | --- |
| google/gemma-4-12B-it | 12B | 128K | Apache 2.0 | Original |
| ibyteohdear/gemma4-12b-heretic-ltx-2.5-bf16 | 12B | 128K | Apache 2.0 | Abliteration con Heretic |
| no disponible | - | - | - | - |

## Limitaciones y advertencias

- El modelo reduce intencionalmente los mecanismos de rechazo interno, lo que puede generar contenido sensible, controvertido o inseguro. El autor declina toda responsabilidad por los resultados.
- Es un modelo experimental: puede producir artefactos o comportamientos inesperados en ciertos escenarios.
- La reduccion de rechazos no implica una eliminacion completa de la censura; el modelo aun rechaza el 34% de las peticiones en las pruebas.
- No se han evaluado los sesgos del modelo tras la ablacion; podrian haberse alterado o amplificado sesgos preexistentes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion sin una revision cuidadosa de los riesgos.
- Solo se ha confirmado soporte para ingles; no se garantiza el rendimiento en otros idiomas.

## Enlaces

- Repo del modelo: https://huggingface.co/ibyteohdear/gemma4-12b-heretic-ltx-2.5-bf16
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repo GGUF: https://huggingface.co/prithivMLmods/gemma-4-12B-it-heretic_decensored-GGUF
- Documentacion de Gemma 4 en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/gemma4.md
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Heretic toolkit: https://github.com/p-e-w/heretic
- Evaluaciones del autor: https://huggingface.co/strangeropshf/demo-TERM-hf-job-01
