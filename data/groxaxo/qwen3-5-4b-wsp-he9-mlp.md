# groxaxo/Qwen3.5-4B-WSP-HE9-MLP

## Resumen

Qwen3.5-4B-WSP-HE9-MLP es un adaptador LoRA experimental publicado por el usuario groxaxo sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un conjunto de factores PEFT (rank 8, alpha 16, 96 modulos MLP de lenguaje, 192 factores en FP32) que se cargan sobre el checkpoint base para modificar su comportamiento en tareas de codigo. El adaptador forma parte del experimento "Weight-Space Programming HE9", ejecutado en una unica GPU RTX 3060 de 12 GB.

El objetivo declarado es mejorar el rendimiento del modelo base en un conjunto reducido de nueve fallos historicos de codigo seleccionados de un corpus previo ("Experimentos"), evaluados con el cliente real OpenCode. El checkpoint publicado eleva el resultado de 6/9 a 7/9 en el perfil Base y de 3/9 a 5/9 en Base+Plus, resolviendo por completo las tareas 99 y 101 sin perder ninguna tarea previamente resuelta. Sin embargo, el propio autor advierte de que la puerta de cualificacion completa como asistente de codigo falla: el rendimiento en desarrollo cae de 12/14 a 11/14 y el proyecto de dos modulos Hermes no supera la evaluacion.

Se trata, por tanto, de una publicacion de investigacion comunitaria y no de un asistente promocionado por defecto. El autor incluye explicitamente los resultados negativos, la metodologia reproducible, el analisis de fallos y las atribuciones del corpus, con el fin de que la comunidad pueda iterar sobre el experimento. El adaptador tiene 9.043.968 parametros entrenables y el repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5; 96 modulos MLP de lenguaje, 192 factores FP32 |
| Parametros totales | 9.043.968 (adaptador); modelo base Qwen3.5-4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en el perfil nativo medido (reserva 253.952 entrada / 8.192 salida); longitud de entrenamiento 1.536 tokens |
| Tipos de cuantizacion | Base Q8_0 + LoRA F32 (perfil nativo medido); export GGUF nativo sin fusionar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (native/adapter-F32.gguf, 36.189.792 bytes) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado sobre 96 modulos MLP de lenguaje del modelo base Qwen3.5-4B, generando 192 factores almacenados en FP32. No modifica los mecanismos de atencion ni otros componentes del transformer base. El entrenamiento se realizo en una RTX 3060 de 12 GB dentro del marco experimental "Weight-Space Programming HE9", cuyo objetivo es identificar y corregir fallos concretos de codigo mediante adaptacion de bajo rango en el espacio de pesos.

El entorno de entrenamiento medido utilizo PyTorch 2.11.0, Transformers 5.22.1, PEFT 0.21.2, bitsandbytes 0.49.2 y FLA/fla-core 0.6. El modelo base esta fijado a la revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a. El autor documenta que los checkpoints posteriores de "flow" y "continuation" mejoran la perdida de validacion pero no la calidad global, y los conserva como hallazgos negativos en lugar de publicarlos como sustitutos del checkpoint MLP. Tambien se documenta una condicion de carrera en la finalizacion de peticiones, corregida y cubierta con pruebas de regresion en el codigo incluido.

## Capacidades

- Generacion de texto y codigo sobre el modelo base Qwen3.5-4B, con especializacion en un subconjunto reducido de tareas de codigo.
- Soporte de tool calling y function calling a traves del frontend `scripts/serve_coder_gguf.py`, que ofrece parsing compatible con la API de OpenAI para chat y herramientas.
- Integracion con clientes de edicion de ficheros y con el proyecto OpenCode, ambos superados en la evaluacion.
- Modo no-thinking en el perfil nativo medido; el ejemplo de carga PEFT usa `enable_thinking=False`.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking explicito mas alla del parametro de plantilla de chat del modelo base.

## Casos de uso

- Investigacion reproducible sobre adaptacion de bajo rango: el repositorio incluye METHOD.md, EVALUATION.md y CORPUS-ATTRIBUTION.md, lo que permite replicar el experimento y comparar perfiles (Base, MLP, All-language flow, MLP continuation) sobre las mismas nueve tareas.
- Analisis de fallos en asistentes de codigo: los informes por tarea y las decisiones de cualificacion permiten estudiar por que un adaptador mejora tareas aisladas mientras degrada el rendimiento agregado en desarrollo (12/14 a 11/14).
- Pruebas de integracion con OpenCode: el ejemplo `examples/opencode.json` configura un perfil de proveedor aislado para validar el adaptador dentro del flujo real del cliente.
- Evaluacion de tool calling en local: el frontend `serve_coder_gguf.py` expone un endpoint compatible con OpenAI para probar parsing de chat y herramientas sin depender de servicios externos.
- Experimentacion con contextos largos en hardware de consumo: el perfil nativo reserva 262.144 tokens con cache K y V en Q8 sobre una RTX 3060, lo que permite estudiar el comportamiento del modelo en ventanas largas aunque la calidad de codigo a esa longitud no este establecida.
- Estudio de tecnicas de cuantizacion y exportacion: el repositorio incluye el flujo de conversion y exportacion autenticado, con manifiestos y sumas SHA256 para verificar la integridad de los artefactos.

## Benchmarks y rendimiento

Los unicos datos publicados son los del conjunto HE9 de nueve tareas historicas de codigo, medidos con OpenCode. No son resultados oficiales de EvalPlus ni equivalen a la precision de un modelo frontera de codigo.

| Perfil | HE9 Base | HE9 Base+Plus | Actores finalizados | Desarrollo |
|---|---:|---:|---:|---:|
| Base | 6/9 | 3/9 | 7/9 | 12/14 |
| MLP (publicado) | 7/9 | 5/9 | 7/9 | 11/14 |
| All-language flow | 6/9 | 4/9 | 8/9 | 11/14 |
| MLP continuation | 6/9 | 4/9 | 8/9 | 9/14 |

El checkpoint MLP resuelve completamente las tareas 99 y 101 sin perder ninguna tarea previamente resuelta en Base ni en Base+Plus. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 0,1 GB, pero requiere cargar el modelo base Qwen3.5-4B. El perfil nativo medido usa base en Q8_0 con cache K y V en Q8 y reserva de contexto de 262.144 tokens, lo que excede los 12 GB de una RTX 3060 en funcion de la configuracion exacta de slots y atencion flash.
- GPU recomendadas: el entrenamiento y la evaluacion se realizaron en una RTX 3060 de 12 GB. Para el perfil nativo con contexto completo se recomienda hardware con mas VRAM, aunque el autor no especifica modelos concretos.
- Cabe en GPU de consumo: si, en una RTX 3060 de 12 GB para el entrenamiento y para configuraciones reducidas del perfil nativo; el contexto completo de 262.144 tokens no esta verificado en esa GPU.
- Opciones de despliegue: llama.cpp/GGUF mediante el flujo de conversion y exportacion incluido, y servidor compatible con OpenAI a traves de `scripts/serve_coder_gguf.py`. Carga PEFT mediante Transformers y PEFT con `Qwen3_5ForConditionalGeneration`. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-WSP-HE9-MLP (este) | 9.043.968 en adaptador + base 4B | 262.144 tokens en perfil nativo | 7/9 Base, 5/9 Base+Plus en HE9; 11/14 en desarrollo | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en la informacion | 6/9 Base, 3/9 Base+Plus en HE9; 12/14 en desarrollo | no disponible en la informacion | Hugging Face |
| Perfil All-language flow (mismo autor) | adaptador alternativo | no disponible | 6/9 Base, 4/9 Base+Plus; 11/14 en desarrollo | apache-2.0 | retenido como hallazgo negativo, no publicado como sustituto |
| Perfil MLP continuation (mismo autor) | adaptador alternativo | no disponible | 6/9 Base, 4/9 Base+Plus; 9/14 en desarrollo | apache-2.0 | retenido como hallazgo negativo, no publicado como sustituto |

No se dispone de datos de benchmarks estandar que permitan comparar con otros adaptadores LoRA de codigo de la comunidad.

## Limitaciones y advertencias

- El autor declara explicitamente que la puerta de cualificacion completa como asistente de codigo falla; no es un asistente promocionado por defecto.
- El rendimiento en desarrollo cae de 12/14 a 11/14 respecto al perfil Base, y el proyecto de dos modulos Hermes no supera la evaluacion.
- Las nueve tareas evaluadas son un subconjunto historico pequeno y revisado repetidamente; no establecen competencia general en codigo ni equivalencia con un modelo frontera.
- La calidad de codigo y el recall en ventanas completas de 262.144 tokens no estan establecidos; la longitud de entrenamiento es de solo 1.536 tokens, un limite distinto.
- El ejemplo de carga PEFT en Python no es el perfil con el que se obtuvieron las puntuaciones publicadas; cambios de hardware, precision, sampler, parser o cliente requieren su propia evaluacion.
- PEFT puede redondear los factores a la precision BF16 de la capa base durante la carga; el control de carga exacta usa marcadores de destino en FP32.
- El repositorio incluye codigo de supervisor con politica especifica del host (`ops/run54_gguf_phase.py`); debe revisarse y adaptarse antes de usarlo en otro entorno.
- Idiomas soportados limitados al ingles.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion disponible, si bien aplican los del modelo base.
- El repositorio no incluye el checkpoint base, las entradas privadas de evaluacion, las respuestas canonicas, credenciales, estado personal de clientes ni pickles del optimizador.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Qwen3.5-4B-WSP-HE9-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo mantenido: https://github.com/groxaxo/weight-space-programming
- Perfil del autor en Hugging Face: https://huggingface.co/groxaxo/models
- Estadisticas del autor: https://openmodelstats.com/owners/groxaxo
