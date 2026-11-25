# nexiloopofficial/nexi-20-instruct-GGUF

## Resumen

NEXI-20-Instruct (GGUF) es una compilación cuantizada en formato GGUF del modelo `thinkingmachines/Inkling-2-Mini`, un transformer de tipo MoE con 26.400 millones de parámetros publicado bajo licencia Apache-2.0. Esta build concreta la distribuye el usuario `nexiloopofficial` dentro del proyecto NEXI-Models-Drivers, con el objetivo explícito de permitir inferencia local en CPU sobre hardware convencional (8 vCPU, 31 GB de RAM, sin GPU). El modelo base se presenta, según su publicador, como el modelo open-weights más fuerte por debajo de los 100.000 millones de parámetros en benchmarks agénticos y de código.

La relevancia de esta ficha radica en que empaqueta un modelo de escala media-grande (26,4B) en builds que caben en máquinas sin GPU: la variante recomendada UD-Q3_K_XL ocupa 13,6 GB en disco y alcanza un pico de RSS de 14,77 GB, con una velocidad medida de 3,3 tok/s en CPU. La variante UD-Q4_K_M sube a 16,6 GB y baja a aproximadamente 1,0 tok/s. No se trata, por tanto, de un modelo para chat interactivo en CPU, sino de un motor de razonamiento offline o de pasos agénticos donde la latencia por paso se mide en segundos.

El repo ocupa 13,6 GB y fue creado el 25 de noviembre de 2026. No dispone de pipeline declarado, no especifica idiomas soportados en los metadatos y no registra descargas ni likes en el momento de la consulta. La model card incluye métricas de huella de memoria y velocidad medidas por el autor del repo, pero cita —sin reverificar— las puntuaciones de capacidad del publicador original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (looped MoE), transformer; modelo base Inkling-2-Mini |
| Parametros totales | 26.070.390.272 (26,4B segun model card; 26,07B segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: UD-Q3_K_XL (recomendada), UD-Q4_K_M; calibracion imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un MoE con mecanismo de bucles (looped MoE) de 26,4B parámetros, según la model card del repo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card del repo cuantizado tampoco detalla la proporcion de expertos activos por token ni la configuracion de attention (lineal, completa o hibrida).

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento, sino en el empaquetado: builds GGUF calibradas con imatrix y orientadas a CPU, con metricas de pico de memoria (RSS) y velocidad medidas por el autor en un entorno concreto (8 vCPU, 31 GB de RAM, sin GPU). El autor declara haber realizado comprobaciones de correctitud con cuatro prompts (codigo, uso de herramientas, razonamiento y factual) en ambas builds, con salida coherente en ambos casos.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a flujos agenticos.
- Capacidades de codigo y resolucion de tareas de ingenieria de software (el modelo base lidera benchmarks agenticos segun su publicador).
- Uso de herramientas (tool calling / function calling) implicitamente validado en las comprobaciones de correctitud del autor.
- Razonamiento agentico para bucles de computer-use y planificacion.
- Actuacion como juez de evaluacion para modelos de menor tamano.
- Actuacion como profesor de destilacion para tiers NEXI mas pequenos (existe un dataset asociado, `nexi-inkling-traces`).
- Capacidades multilingues: no disponible.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Razonamiento agentico local y planificacion offline: la build UD-Q3_K_XL permite ejecutar bucles de agente en una maquina de 8 vCPU y 31 GB sin GPU, con 3,3 tok/s, suficiente para pasos que tardan segundos.
- Profesor de destilacion para modelos pequenos: el repo referencia el dataset `nexi-inkling-traces`, generado a partir de trazas del modelo, para entrenar tiers NEXI inferiores.
- Juez de evaluacion de modelos menores: con contexto suficiente (no disponible en esta ficha) y salida coherente en pruebas de razonamiento, puede usarse para puntuar respuestas de modelos pequenos en pipelines de evaluacion.
- Asistente de codigo offline: en entornos sin conectividad ni GPU, la build Q3 permite generar parches o sugerencias donde la latencia no es critica (1-3 tok/s).
- Backbone de computer-use en laboratorio: el modelo base reporta resultados en Terminal-Bench y SWE-bench Verified segun su publicador, lo que lo hace adecuado para experimentos de automatizacion de terminal y navegador en local.
- Inferencia en servidores sin acelerador: despliegue via llama.cpp en hardware convencional para tareas batch de razonamiento, donde el throughput de 3,3 tok/s es aceptable frente al coste de una GPU.
- Validacion de pipelines agenticos antes de escalar a GPU: usar la build CPU para depurar logica de agente y luego mover la misma familia de modelo a una GPU para produccion.

## Benchmarks y rendimiento

Datos de capacidad citados por el publicador original (no reverificados por el autor del repo cuantizado):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 48,2 % |
| SWE-bench Verified | 79,2 % |
| Terminal-Bench | resultados reportados en el post de lanzamiento, cifra no disponible |

Rendimiento local medido por el autor del repo (8 vCPU, 31 GB, sin GPU, llama.cpp):

| Build | Tamano de fichero | Pico RSS | Velocidad | Carga |
|---|---|---|---|---|
| UD-Q3_K_XL (recomendada) | 13,6 GB | 14,77 GB | 3,3 tok/s | 2,6 s |
| UD-Q4_K_M | 16,6 GB | ~16,6 GB | ~1,0 tok/s | ~4 s |

No se han publicado resultados de benchmarks de capacidad medidos por el autor del repo cuantizado a escala.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible en la informacion proporcionada; las builds estan pensadas para CPU.
- RAM estimada: 14,77 GB de pico para UD-Q3_K_XL; aproximadamente 16,6 GB para UD-Q4_K_M.
- GPU recomendadas: no disponible. El autor indica que "una GPU de cualquier tipo cambia completamente la historia", pero no aporta mediciones.
- Cabe en consumer GPU: no confirmado; no hay datos de VRAM ni de rendimiento en GPU para estas builds.
- Opciones de despliegue: llama.cpp (medido por el autor); Ollama y vLLM no confirmados para estas builds.
- Latencia y throughput: 3,3 tok/s en UD-Q3_K_XL y ~1,0 tok/s en UD-Q4_K_M sobre 8 vCPU sin GPU; carga inicial de 2,6 s y ~4 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agentico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEXI-20-Instruct GGUF (Inkling-2-Mini) | 26,4B (MoE) | no disponible | DeepSWE 48,2 %, SWE-bench Verified 79,2 % (publicador) | Apache-2.0 | GGUF en HF |
| Modelos open-weights <100B alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos comparables de la misma categoria para establecer una comparativa con cifras. La unica referencia del autor es que Inkling-2-Mini lidera los modelos open-weights por debajo de 100B en benchmarks agenticos segun su publicador.

## Limitaciones y advertencias

- Velocidad en CPU de 1-3 tok/s: no apto para chat interactivo; adecuado solo para bucles agenticos offline o tareas batch.
- Las puntuaciones de capacidad (DeepSWE, SWE-bench Verified, Terminal-Bench) son del publicador original y no han sido reverificadas a escala por el autor del repo cuantizado.
- Las metricas de huella de memoria y velocidad provienen de un unico entorno (8 vCPU, 31 GB, sin GPU) y pueden variar segun hardware.
- No se especifican idiomas soportados en los metadatos; el rendimiento multilingue no esta documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinacion no cuantificado; el autor solo reporta comprobaciones puntuales de correctitud con cuatro prompts.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (`thinkingmachines/Inkling-2-Mini`).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa practicamente inexistente.
- No hay datos de rendimiento en GPU para estas builds; el despliegue en acelerador requeriria pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nexiloopofficial/nexi-20-instruct-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Post de lanzamiento del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- Dataset de trazas para destilacion: https://huggingface.co/datasets/nexiloopofficial/nexi-inkling-traces
