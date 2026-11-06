# leizhao7/Qwen3-4B-OPD-RL-Code-Step200

## Resumen

Qwen3-4B-OPD-RL-Code-Step200 es un checkpoint de investigacion publicado por Lei Zhao (usuario `leizhao7`) que consiste en un estudiante de destilacion on-policy (OPD) obtenido tras 200 actualizaciones sobre el modelo base Qwen/Qwen3-4B. El modelo forma parte del trabajo "Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals" (arXiv:2610.11247) y aprende de un profesor fijo, Qwen3-4B-Non-Thinking-RL-Code-Step300, especializado en generacion de codigo. El resultado es un modelo de 4.411.424.256 parametros orientado a generacion de codigo en modo no-thinking.

La relevancia de este checkpoint es doble: por un lado, demuestra empiricalmente el efecto de la destilacion on-policy con objetivo reverse-KL sobre un modelo compacto de 4B; por otro, documenta una mejora de 7,70 puntos porcentuales en la media macro de tres benchmarks de codigo (HumanEval+, MBPP+ y LiveCodeBench) respecto al estudiante inicial. El modelo se distribuye con licencia Apache-2.0, heredada del Qwen3 original, y esta pensado como material reproducible para estudiar dinamicas de destilacion, no como un modelo de produccion generalista.

La arquitectura subyacente es la de Qwen3-4B (transformer denso), con una longitud de contexto que el autor no explicita en la model card pero que hereda del modelo base. El checkpoint se publica en formato safetensors y es compatible con Transformers 4.56.2 o superior, ademas de estar etiquetado como compatible con text-generation-inference y endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (heredada de Qwen3-4B) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 8,8 GB |
| Modelo base | Qwen/Qwen3-4B |
| Profesor | Qwen3-4B-Non-Thinking-RL-Code-Step300 (Keven16) |
| Dataset de entrenamiento | PRIME-RL/Eurus-2-RL-Data (subconjunto de codigo) |
| Paso final de entrenamiento | 200 |
| Version de Transformers | 4.56.2 o compatible superior |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parametros que parte de Qwen/Qwen3-4B y se afina mediante destilacion on-policy (OPD). El objetivo de entrenamiento es una reverse-KL aproximada usando los 16 tokens mas probables del estudiante, con pesos basados en la probabilidad del estudiante y una media global sobre los tokens validos de la respuesta. Las respuestas generadas por el propio estudiante proporcionan los prefijos sobre los que el profesor fijo aplica la supervision, lo que constituye el nucleo del paradigma on-policy.

Los hiperparametros documentados son: optimizador AdamW con learning rate 1e-6 y schedule constante; batch de prompts de 64 con 1 rollout por prompt; maximo de 2048 tokens de prompt y 16384 tokens de respuesta; temperatura de muestreo 1.0. El entrenamiento se ejecuto durante 200 actualizaciones sobre el subconjunto de codigo del dataset PRIME-RL/Eurus-2-RL-Data, usando la plantilla de chat de Qwen3 en modo no-thinking (`enable_thinking=False`). La perdida top-16 registrada al final es 0.00069608, una reduccion del 99,4 % respecto a la actualizacion 1; el autor advierte que se trata de la reduccion final, no del minimo observado, y que el surrogate registrado no equivale al KL de vocabulario completo. La reproduccion se completo el 2026-09-23 sobre 2 GPU H200 con reanudacion nativa de checkpoints.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, orientada a tareas de sintesis y completado de funciones.
- Razonamiento de codigo en modo no-thinking (sin cadena de pensamiento explicita), segun la plantilla de chat guardada.
- Generacion de texto conversacional multi-turno mediante la plantilla de chat de Qwen3.
- Capacidad multilingue limitada: la model card declara unicamente ingles.
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente multi-paso en la informacion disponible.
- No se documentan capacidades de vision, audio ni thinking mode activable en este checkpoint.

## Casos de uso

- Generacion de funciones y utilidades en Python: el modelo puede producir funciones completas a partir de una descripcion en lenguaje natural, como se muestra en el ejemplo de inferencia de la model card (devolver elementos unicos de una lista preservando el orden). Es adecuado por su especializacion en codigo y su tamano compacto.
- Reproduccion de experimentos de destilacion on-policy: investigadores pueden cargar el checkpoint y comparar su comportamiento con el estudiante inicial Qwen3-4B para estudiar la evolucion de la perdida y las senales de aprendizaje, que es el proposito declarado del release.
- Evaluacion de metodologias OPD sobre benchmarks de codigo: el checkpoint sirve como referencia step-200 para replicar las metricas avg@4 reportadas en HumanEval+, MBPP+ y LiveCodeBench bajo el protocolo archivado.
- Prototipado de asistentes de codigo en ingles: con 4B parametros y licencia Apache-2.0, puede desplegarse en entornos de desarrollo para autocompletado o generacion de snippets en ingles, aceptando la limitacion de idioma.
- Estudio de la relacion profesor-estudiante en destilacion: al estar disponible el profesor publico (Keven16/Qwen3-4B-Non-Thinking-RL-Code-Step300), permite analizar como un estudiante de 4B aproxima las distribuciones de un profesor del mismo tamano entrenado con RL.
- Base para experimentos de cuantizacion y despliegue eficiente: al ser un modelo denso de 4B en safetensors, es candidato natural para probar cuantizaciones y medir el impacto en tareas de codigo, aunque el autor no publique cuantizaciones oficiales.

## Benchmarks y rendimiento

Resultados archivados del paper (avg@4, media de correccion de respuestas muestreadas, macro-promediada sobre tres benchmarks; temperatura 1.0, top-p 1.0, maximo 16384 tokens de respuesta). No es pass@k.

| Benchmark | avg@4 final (%) |
|---|---:|
| HumanEval+ | 86,13 |
| MBPP+ | 70,44 |
| LiveCodeBench | 24,62 |
| Media macro | 60,39 |

El estudiante inicial obtuvo 52,69 % en la media macro, por lo que el step-200 mejora +7,70 puntos porcentuales. El autor advierte que estas metricas son del paper archivado y que el checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos; en 4 bits, en torno a 3-4 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: el autor reporta entrenamiento en 2x H200; para inferencia, A100, H100 o H200 son adecuadas. En consumer, una RTX 4090 (24 GB) permite fp16 sin problema; una RTX 3090 o 4080 (16 GB) tambien deberia ser suficiente en fp16 con contexto moderado.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas en fp16, y en 8 GB o mas con cuantizacion de 4-8 bits.
- Opciones de despliegue: Transformers (version documentada 4.56.2 o superior), text-generation-inference (etiqueta del repo), y endpoints compatibles. El autor no documenta recetas para vLLM, llama.cpp, Ollama ni TGI mas alla de la etiqueta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-OPD-RL-Code-Step200 | 4,41B | No disponible | Destilacion OPD para codigo | Apache-2.0 | Hugging Face (191 descargas) |
| Qwen/Qwen3-4B (estudiante inicial) | 4B | No disponible | Modelo generalista base | Apache-2.0 | Hugging Face |
| Qwen3-4B-Non-Thinking-RL-Code-Step300 (profesor) | 4B | No disponible | RL para codigo, no-thinking | No disponible en la informacion | Hugging Face (Keven16) |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo declara explicitamente como material para reproducir y estudiar OPD, no como modelo de proposito general.
- Los resultados del paper corresponden a una sola ejecucion por condicion con un horizonte fijo de 200 actualizaciones; no establecen rendimiento general, seguridad ni persistencia de los plateaus de perdida en otras configuraciones.
- El checkpoint exportado no ha sido re-evaluado de forma independiente tras el empaquetado; las metricas son archivadas del paper.
- Riesgo de alucinacion y de generar codigo incorrecto: el autor advierte que el modelo conserva las limitaciones del estudiante inicial y puede producir respuestas o codigo erroneos.
- Idioma: la model card declara unicamente ingles, lo que limita su uso en castellano u otros idiomas.
- Sin datos publicados sobre sesgos especificos, comportamiento en contextos largos ni robustez frente a prompts adversarios.
- Licencia Apache-2.0 heredada de Qwen3: se debe preservar la licencia y atribucion upstream y declarar que los pesos fueron modificados por 200 actualizaciones OPD. No se incluyen pesos del profesor.
- La licencia MIT del repositorio de codigo es independiente de los terminos del modelo.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en vLLM, llama.cpp u Ollama, lo que obliga a validar el pipeline por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/leizhao7/Qwen3-4B-OPD-RL-Code-Step200
- Paper: https://arxiv.org/abs/2610.11247
- Pagina del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Profesor (referencia publica): https://huggingface.co/Keven16/Qwen3-4B-Non-Thinking-RL-Code-Step300
- Dataset: https://huggingface.co/datasets/PRIME-RL/Eurus-2-RL-Data
