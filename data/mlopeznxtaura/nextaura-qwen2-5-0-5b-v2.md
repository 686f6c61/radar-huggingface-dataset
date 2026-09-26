# Mlopeznxtaura/nextaura-qwen2.5-0.5b-v2

## Resumen

nextaura-qwen2.5-0.5b-v2 es un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen2.5-0.5B-Instruct, desarrollado por NextAura Inc. (autor en HuggingFace: Mlopeznxtaura). Con 494.032.768 parámetros (aproximadamente 0,5 mil millones) y una ventana de contexto heredada de su modelo base, se posiciona como un asistente conversacional de tamano muy reducido, entrenado especificamente para responder sobre los proyectos, aplicaciones y decisiones de ingenieria de NextAura, asi como sobre hitos de la historia de la inteligencia artificial.

El modelo parte de una arquitectura transformer decoder-only de tipo Qwen2 y se entrena sobre un corpus diminuto y curado a mano: 1.849 ejemplos de entrenamiento y 97 de validacion con formato de chat. El objetivo declarado no es competir en capacidad general, sino internalizar una identidad y un dominio muy concretos (material de NextAura e historia de la IA) sobre un modelo pequeno que quepa en hardware de consumo. Es la version v2 del proyecto, que sustituye a una v1 retirada por problemas de formato de datos y por no partir de un modelo instruct.

Su relevancia es principalmente metodologica y de nicho: demuestra un flujo de trabajo de ajuste fino completo (dataset propio, early stopping, escaneo de secretos con gitleaks y evaluacion reducida) sobre una GPU de consumo. No obstante, el propio autor documenta alucinaciones frecuentes, deriva de identidad y bajo rendimiento en aritmetica, por lo que se trata de un modelo de proposito restringido y no de un asistente de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 |
| Parametros totales | 494.032.768 (aprox. 0,49B) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tarea (pipeline) | text-generation |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relacion: finetune) |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 2026-09-26 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos (full fine-tune) en bf16 sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 de 494M de parametros. No se modifica la arquitectura base: se conservan todas las capas y se entrena el conjunto completo de pesos, no un adaptador tipo LoRA. El entrenamiento se realizo sobre una unica NVIDIA RTX 5090 con un consumo de aproximadamente 11,4 GB de VRAM y una duracion de 3,3 minutos.

El corpus de entrenamiento esta compuesto por 1.849 ejemplos de chat de entrenamiento y 97 de validacion, desglosados en: 928 ejemplos de historia de la IA, 260 sobre aplicaciones de NextAura, 274 registros escritos a mano (mas 274 variantes de intencion), 40 de identidad y 170 ejemplos breves procedentes de las notas de proyecto de Marco Lopez. La receta emplea el optimizador AdamW con learning rate 1e-5, betas (0,9, 0,95), calentamiento seguido de decaimiento coseno, acumulacion de gradiente de 8, micro-lotes fijos de 2.048 tokens y un maximo de 3 epocas con early stopping sobre la perdida de validacion; se exporta el mejor checkpoint, no el ultimo. En total, 105 pasos de optimizador. Como innovacion operativa, el proceso de construccion del dataset aplica un escaner de secretos por expresiones regulares, una comprobacion de marcadores de posicion y gitleaks, ademas de filtrar entradas con mas de un 30 por ciento de contenido no prosistico (ruido de JSON, logs y salidas de herramientas).

## Capacidades

- Generacion de texto conversacional con plantilla de chat (system / user / assistant).
- Respuestas sobre identidad propia del asistente (nextaura, creado por NextAura).
- Preguntas y respuestas sobre hitos de la historia de la IA (por ejemplo, el taller de Dartmouth de 1956, el articulo del Transformer de 2017).
- Descripcion de proyectos, aplicaciones y decisiones de ingenieria de NextAura, segun el material destilado a mano.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor senala razonamiento debil en problemas de varios pasos.
- Capacidades multilingues: solo ingles en la practica.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente de identidad de marca: el modelo puede mantener conversaciones de presentacion sobre quien es y quien lo ha creado, util para demos internas de un producto conversacional con identidad propia.
- Base de Q&A sobre historia de la IA: responde a preguntas sobre hitos como Dartmouth 1956 o el articulo del Transformer, adecuado para material didactico de baja exigencia y siempre con verificacion humana.
- Documentacion asistida de proyectos internos: puede describir aplicaciones y decisiones de ingenieria de NextAura a partir del conocimiento destilado en el ajuste, como apoyo a la incorporacion de nuevos miembros del equipo.
- Prototipado rapido de chatbots: al ser un modelo de 0,49B, permite iterar sobre flujos conversacionales en hardware modesto antes de escalar a modelos mayores.
- Experimentacion en investigacion de ajuste fino: sirve como caso de estudio reproducible de SFT completo, curado de datos y evaluacion reducida sobre una sola GPU de consumo.
- Pruebas de despliegue y CI/CD: al ser compatible con transformers y text-generation-inference, permite validar pipelines de servido de modelos pequenos y de cuantizacion antes de llevarlos a produccion.
- Generacion de texto corto en ingles: util como componente generativo ligero en tareas de texto breve donde la precision factual no sea critica.

## Benchmarks y rendimiento

El autor no reporta benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La evaluacion publicada consiste en 10 prompts reservados, filtrados por similitud de los datos de entrenamiento, evaluados con una comprobacion de palabras clave por respuesta y la perdida de validacion:

| Epoca | Perdida de validacion | Aciertos de palabra clave (de 10) |
|---|---|---|
| 0 (Qwen2.5-0.5B-Instruct, base sin ajustar) | 3,7306 | 4 |
| 1 | 3,3711 | 4 |
| 2 | 3,3363 | 6 |
| 3 (version publicada) | 3,3332 | 5 |

El autor advierte que la comprobacion por palabras clave es tosca. Ejemplos cualitativos destacados: la respuesta a "What is 17 times 23?" es incorrecta (401 en lugar de 391) tanto en el modelo base como en el ajustado; la pregunta sobre el articulo del Transformer obtiene el titulo correcto pero el autor equivocado; y la descripcion de la aplicacion app1.nextaura.fit es una alucinacion. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1 GB para los pesos en bf16/fp16, mas overhead de activaciones y cache KV; en la practica cabe en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. El ajuste fino de referencia se realizo en una sola NVIDIA RTX 5090 con unos 11,4 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso puede ejecutarse en CPU.
- Opciones de despliegue: transformers (referencia), text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. Tambien es candidato a llama.cpp u Ollama, aunque no se documenta soporte explicito GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| nextaura-qwen2.5-0.5b-v2 | 0,49B | No disponible (base: hasta 32.768 tokens) | Apache-2.0 | Ingles | Ajuste de nicho sobre identidad y dominio NextAura |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache-2.0 | Multilingue | Modelo base; mayor cobertura general y multilingue |
| SmolLM2-360M-Instruct | 0,36B | No disponible | Apache-2.0 | Ingles | Alternativa de tamano similar para tareas ligeras |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 | Multilingue | Mayor capacidad general a costa de mas recursos |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia e idiomas.

## Limitaciones y advertencias

- Alucinacion confiada: inventa hechos sobre la historia de NextAura, la trayectoria de Marco Lopez, propositos de aplicaciones y fechas. Las respuestas factuales deben tratarse como no verificadas.
- Deriva de identidad: en ocasiones afirma llamarse GPT-2 o haber sido creado por Alibaba u OpenAI en lugar de nextaura por NextAura.
- Aritmetica y razonamiento: falla en operaciones sencillas (por ejemplo, 17x23) y muestra razonamiento debil en problemas de varios pasos.
- Respuestas a sondeos de credenciales: ante preguntas del tipo "cual es tu API key" devuelve cadenas con forma de clave o marcadores de posicion en lugar de rechazar la peticion. El escaneo de salidas detecto cinco coincidencias, todas ellas alucinaciones no presentes en el corpus de entrenamiento; ninguna debe tratarse como secreto real.
- Limitaciones de contexto e idioma: como modelo de 0,5B, el uso de contexto largo es limitado, el modelo del mundo es superficial y solo es funcional en ingles.
- Restricciones de licencia: Apache-2.0, por lo que se permite uso comercial, pero se incluye la licencia del modelo base en el repositorio.
- Caveat de produccion: los datos de entrenamiento no se publican, lo que dificulta la auditoria y la reproduccion; la evaluacion se limita a 10 prompts y una comprobacion de palabras clave.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mlopeznxtaura/nextaura-qwen2.5-0.5b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
