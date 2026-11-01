# deepbot-studio/deepbot-reflex-0.8b

## Resumen

DeepBot Reflex 0.8B (r3) es un modelo de accion para escritorio Windows desarrollado por deepbot-studio. Se trata de un ajuste fino mediante LoRA del modelo base Qwen3.5-0.8B de Alibaba Qwen, orientado a operar un escritorio paso a paso: observar la pantalla, decidir la siguiente accion y ejecutarla. El modelo no es un asistente conversacional generico, sino un componente especializado dentro de la arquitectura de un agente de escritorio autonomo denominado DeepBot.

El modelo parte de un transformer denso de aproximadamente 873 millones de parametros (873.438.784 segun los pesos en safetensors) con licencia Apache-2.0. Sobre esa base se entreno una LoRA de rango 16 y alpha 32 durante dos epocas sobre 14.440 ejemplos de trabajo de escritorio, que posteriormente se fusiono con el modelo base. El resultado se publica tanto en formato safetensors (modelo fusionado y adaptador LoRA por separado) como en GGUF cuantizado Q4_K_M de 516 MiB para su ejecucion con llama.cpp.

La relevancia del modelo reside en su enfoque de evaluacion: se entrenaron cuatro rondas y cada una se midio sobre un conjunto sellado de 150 casos reales en vivo, no sobre la perdida de entrenamiento. La ronda r3, que se publica, obtiene 114/150 en dicha prueba pese a no tener la menor eval loss (0.0482 frente a 0.0392 de r4), lo que ilustra el desacoplamiento entre la perdida de validacion y el rendimiento real en tareas de agente. El autor declara un techo aproximado del 76% sobre estos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-0.8B) con ajuste LoRA fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); safetensors en precision original no especificada |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de Qwen3.5-0.8B, sobre el que se aplico un ajuste fino supervisado mediante LoRA de rango 16 y alpha 32. El entrenamiento consistio en dos epocas sobre 14.440 ejemplos de trabajo de escritorio, tras lo cual el adaptador se fusiono en los pesos base. El repositorio publica tres artefactos diferenciados: el modelo fusionado en safetensors con config y tokenizer, el adaptador LoRA aislado en `adapter_model.safetensors`, y un archivo `train_meta.json` con los metadatos del entrenamiento. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su caracter de tareas de escritorio.

La innovacion metodologica documentada no esta en la arquitectura sino en el proceso de seleccion de rondas y en el mecanismo de aprendizaje continuo. Se entrenaron cuatro rondas (r1 a r4) evaluadas sobre el mismo conjunto sellado de 150 casos en vivo, desglosado por categorias (system, apps, files, flows, refusals, ask). La ronda publicada es r3 por equilibrio entre rendimiento en vivo y perdida, descartando r4 pese a su menor eval loss. Ademas, el autor describe un mecanismo de "naps" (siestas) mediante el cual una instancia de DeepBot realiza pasos de entrenamiento incremental entre tareas, con triple repeticion de lecciones antiguas frente a nuevas, a baja prioridad de proceso, y con validacion comparativa cada cuatro siestas: solo una version que mejore sin empeorar en ningun aspecto sustituye a la principal.

## Capacidades

- Generacion de acciones de escritorio: el modelo observa el estado de pantalla y emite la siguiente accion a ejecutar, en formato de lineas JSON consumidas por el runtime de DeepBot.
- Razonamiento de un solo paso (single-step): opera de forma iterativa, decidiendo una accion por ciclo de observacion-accion.
- Control de aplicaciones: segun los resultados de evaluacion, acierta 28/34 casos de la categoria "apps" y 23/24 de "system".
- Manipulacion de archivos: 27/42 aciertos en la categoria "files" en la ronda publicada.
- Ejecucion de flujos multi-paso: 8/20 aciertos en la categoria "flows", la mas debil del conjunto de evaluacion.
- Gestion de rechazos: 20/20 en la categoria "refusals", es decir, identificacion correcta de acciones que debe declinar.
- Capacidad de solicitar aclaracion: 8/10 en la categoria "ask".
- Capacidades multimodales: el tag `image-text-to-text` sugiere entrada de imagen y texto, coherente con la observacion de pantalla, aunque no se detalla el mecanismo en la informacion disponible.
- Soporte de tool calling / function calling: no documentado explicitamente; el modelo emite acciones en JSON consumidas por el runtime del agente.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion de tareas repetitivas en escritorio Windows: el modelo puede integrarse en un agente que observe la pantalla y ejecute acciones sobre aplicaciones nativas, adecuado por su entrenamiento especifico en 14.440 ejemplos de trabajo de escritorio y su tamano reducido (516 MiB en Q4_K_M) que permite ejecucion local.
- Agente de soporte remoto asistido: un operador podria desplegar el modelo para ejecutar pasos rutinarios de configuracion del sistema (23/24 aciertos en categoria system) bajo supervision, reduciendo el tiempo de resolucion.
- Gestion de archivos guiada por lenguaje natural: con 27/42 aciertos en la categoria files, es util para tareas de organizacion, renombrado o movimiento de archivos en entornos donde el coste de un error es bajo y reversible.
- Automatizacion de flujos de trabajo acotados: pese a su rendimiento limitado en flows (8/20), puede emplearse en flujos cortos y bien definidos donde la validacion posterior detecte errores.
- Componente de un sistema de aprendizaje continuo: el modelo sirve como punto de partida para instancias DeepBot que realizan entrenamiento incremental mediante "naps", siendo el artefacto base sobre el que se aplican las actualizaciones.
- Filtro de seguridad en automatizacion: su rendimiento perfecto en refusals (20/20) lo hace adecuado como capa de decision para declinar acciones peligrosas o no autorizadas antes de ejecutarlas.
- Investigacion en agentes de escritorio: util como baseline reproducible y de bajo coste computacional para experimentar con tecnicas de accion paso a paso en entornos reales.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados corresponden al conjunto sellado de 150 casos en vivo, desglosado por categorias y comparado entre las cuatro rondas de entrenamiento:

| Ronda | Test en vivo | System | Apps | Files | Flows | Refusals | Ask | Eval loss |
|---|---|---|---|---|---|---|---|---|
| r1 | 107/150 | 20/24 | 26/34 | 25/42 | 7/20 | 19/20 | 10/10 | 0.0880 |
| r2 | 114/150 | 20/24 | 26/34 | 31/42 | 9/20 | 20/20 | 8/10 | 0.0595 |
| **r3 (publicada)** | **114/150** | 23/24 | 28/34 | 27/42 | 8/20 | 20/20 | 8/10 | 0.0482 |
| r4 | 111/150 | 23/24 | 26/34 | 27/42 | 7/20 | 19/20 | 9/10 | 0.0392 |

El autor indica que el techo aproximado sobre estos datos es del 76%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 516 MiB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4 GB o mas de VRAM, incluyendo modelos antiguos.
- GPU recomendadas: cualquier GPU con soporte CUDA para llama.cpp; el ejemplo del autor usa `-ngl 99` para descargar todas las capas en GPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, dado el tamano del archivo cuantizado (516 MiB) y los 873 millones de parametros del modelo.
- Opciones de despliegue: llama.cpp mediante `llama-server` (documentado por el autor con `-c 16384 -ngl 99`); el modelo tambien es compatible con transformers al publicarse en safetensors. No se documentan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos verificables del modelo y de su base:

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|
| DeepBot Reflex 0.8B (r3) | 873 M | No disponible | Apache-2.0 | safetensors, GGUF | Agente de escritorio especializado |
| Qwen3.5-0.8B (base) | No disponible | No disponible | Apache-2.0 | No disponible | Modelo generalista |
| Alternativas de agente de escritorio | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la informacion disponible modelos de la misma categoria (agentes de escritorio de ~0.8B) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Rendimiento limitado en flujos multi-paso: solo 8/20 aciertos en la categoria flows, lo que desaconseja su uso en automatizaciones largas sin supervision.
- Techo declarado del 76% sobre los datos de evaluacion: incluso en el mejor escenario, aproximadamente una de cada cuatro tareas falla.
- Desacoplamiento entre eval loss y rendimiento real: la ronda con menor perdida (r4, 0.0392) obtuvo peor resultado en vivo que r3, lo que advierte contra la seleccion de modelos basada solo en perdida de validacion.
- Especializacion estrecha: entrenado exclusivamente para operar un escritorio Windows; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion de acciones: al emitir acciones en JSON sobre un entorno real, una accion incorrecta puede tener efectos irreversibles; se recomienda validacion y capacidad de deshacer.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento en castellano u otros idiomas distintos del usado en entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor recuerda que el modelo base y su nombre pertenecen a sus autores originales (Alibaba Qwen); el repositorio solo publica lo entrenado sobre la base.
- Dependencia del runtime: el modelo esta disenado para consumirse mediante el runtime de DeepBot con lineas JSON, por lo que su uso fuera de ese ecosistema requiere adaptar el protocolo de entrada y salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepbot-studio/deepbot-reflex-0.8b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
