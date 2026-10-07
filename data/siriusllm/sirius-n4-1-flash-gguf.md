# SiriusLLM/Sirius-N4.1-Flash-GGUF

## Resumen

Sirius N4.1 Flash es un ajuste fino (fine-tune) de Qwen3.5-4B desarrollado por SiriusLLM, orientado a actuar como agente de programacion local en aleman e ingles. El modelo se ha entrenado especificamente para operar con herramientas: explorar la estructura de un proyecto, leer y escribir ficheros, ejecutar codigo y corregir errores de forma iterativa hasta que las pruebas del proyecto pasan. Su tamano de 4 000 millones de parametros y su distribucion en formato GGUF lo situan en la categoria de modelos pequenos ejecutables en hardware de consumo.

Se distribuye como una vista previa (preview) en cuantizacion Q4_K_M, con un unico fichero de 2,7 GB que consume aproximadamente 3 GB de RAM o VRAM y que produce entre 30 y 40 tokens por segundo en una GTX 1070. La version definitiva se denominara Sirius N4.1. El modelo conserva la plantilla de chat nativa de Qwen3.5, incluyendo los marcadores `<think>` y `<tool_call>`, de modo que el uso de herramientas funciona sin modificaciones en LM Studio, Ollama, llama.cpp y entornos de agentes como OpenCode.

Es relevante ahora porque ofrece un agente de codigo funcional y totalmente offline en un rango de memoria muy bajo, con una mejora medible frente a su modelo base: sobre 40 tareas de agente puntuadas ejecutando las pruebas del proyecto, pasa de 28/40 (70 %) en Qwen3.5-4B a 32/40 (80 %) en Sirius N4.1 Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, heredada de Qwen/Qwen3.5-4B (detalles de atencion no disponibles) |
| Parametros totales | 4B (derivados de Qwen3.5-4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el autor recomienda un minimo de 32 000 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer de 4 000 millones de parametros del que no se detallan en la model card las especificaciones internas de atencion ni la ventana de contexto nativa. Sirius N4.1 Flash es un fine-tune sobre ese base, por lo que mantiene su plantilla de chat y su comportamiento de generacion, incorporando los tokens especiales `<think>` y `<tool_call>` para el razonamiento y la invocacion de herramientas.

El entrenamiento se realizo en dos fases. La primera consistio en un ajuste QLoRA ejecutado en Kaggle con 2x T4, con ejemplos de 4 096 tokens. La segunda fase fue un ajuste por muestreo con rechazo (rejection-sampling fine-tuning, RFT) sobre las propias trayectorias de agente del modelo que resultaron exitosas y verificadas por pruebas. Los datos provienen de nvidia/OpenCodeInstruct (CC-BY-4.0) para tareas de creacion de ficheros con pruebas reales y tareas de correccion de errores con bugs inyectados; de trayectorias reales de agente en nebius/SWE-rebench-openhands-trajectories y nvidia/Nemotron-SWE-v1 (CC-BY-4.0); de traducciones al aleman de tareas y explicaciones generadas con Gemma 4 E4B; y de datos de identidad escritos por SiriusLLM.

## Capacidades

- Generacion de codigo en Python orientada a tareas de agente, con creacion de ficheros nuevos y correccion de errores a partir de pruebas reales.
- Uso de herramientas (tool calling / function calling) mediante el token nativo `<tool_call>` de la plantilla Qwen3.5.
- Modo de razonamiento explicito a traves del token `<think>`.
- Ejecucion de flujos de agente multi-paso: explorar el proyecto, escribir o editar ficheros, ejecutar codigo y volver a corregir hasta que las pruebas pasan.
- Capacidades bilingues en aleman e ingles, con tareas y explicaciones traducidas al aleman durante el entrenamiento.
- Integracion con herramientas de agentes y runners locales como OpenCode, LM Studio, Ollama y llama.cpp.
- Capacidad declarada de dividir salidas largas en varios ficheros cuando la respuesta unica podria superar el limite de salida.

## Casos de uso

- Agente de codigo local en el puesto de trabajo: con unos 3 GB de RAM/VRAM en Q4_K_M, se puede ejecutar de forma totalmente offline sobre un proyecto Python y aplicar correcciones de errores guiadas por las propias pruebas del repositorio.
- Correccion automatica de bugs en integracion continua: el modelo puede leer el fallo de las pruebas, editar los ficheros afectados y reejecutar hasta que pasen, integrándose en un paso previo a la revision humana.
- Generacion de ficheros y scaffolding: a partir de una descripcion en aleman o ingles, crea nuevos modulos y ficheros de prueba, apoyandose en su entrenamiento sobre tareas "create file" de OpenCodeInstruct.
- Asistente de desarrollo en IDE o editor: al usar la plantilla nativa de Qwen3.5, se conecta sin cambios a entornos que ya soportan tool calling con ese formato.
- Automatizacion de tareas de mantenimiento de repositorios: renombrado, refactorizacion localizada y ajustes de codigo con verificacion por pruebas, en un flujo de agente repetible.
- Despliegue en entornos con restricciones de red o privacidad: al funcionar completamente offline y con licencia Apache-2.0, es apto para maquinas aisladas donde no se permite enviar codigo a servicios externos.
- Prototipado rapido de agentes de codigo: su bajo requisito de memoria y su velocidad (30-40 tok/s en GTX 1070) permiten iterar sobre prompts y flujos de herramientas en hardware modesto.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a una evaluacion propia del autor sobre 40 tareas pequenas de agente (creacion de ficheros nuevos y correccion de bugs en proyectos Python), puntuadas ejecutando despues las pruebas del proyecto.

| Modelo | Tareas resueltas |
|---|---|
| Qwen3.5-4B (base, sin fine-tune) | 28/40 (70 %) |
| Sirius N4.1 Flash | 32/40 (80 %) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3 GB para la cuantizacion Q4_K_M (fichero de 2,7 GB).
- GPU de referencia reportada por el autor: GTX 1070, con un rendimiento de 30 a 40 tokens por segundo.
- Cabe en GPU de consumo: si, en cualquier tarjeta con al menos 4 GB de VRAM, dado el tamano del fichero Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y herramientas de agente como OpenCode. El autor proporciona el comando `ollama run hf.co/SiriusLLM/Sirius-N4.1-Flash-GGUF:Q4_K_M`.
- Latencia y throughput: 30-40 tokens por segundo en GTX 1070 segun el autor; no se han publicado cifras para otras GPU.
- Recomendacion de contexto: asignar al menos 32 000 tokens de contexto para tareas de agente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (40 tareas de agente) | Licencia | Formato |
|---|---|---|---|---|---|
| Sirius N4.1 Flash | 4B | no disponible (recomendado >= 32k) | 32/40 (80 %) | apache-2.0 | GGUF |
| Qwen3.5-4B (base) | 4B | no disponible | 28/40 (70 %) | apache-2.0 | no disponible |

No se dispone de datos comparativos frente a otros agentes de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo pequeno de 4B en version de vista previa (preview); el autor indica que comete errores, especialmente en proyectos grandes y ficheros largos.
- No debe ejecutar comandos en sistemas importantes sin revision humana.
- La generacion de una unica salida muy larga puede superar el limite de salida; se recomienda pedir al modelo que divida la salida en varios ficheros.
- La ventana de contexto nativa no se especifica; el autor solo recomienda un minimo de 32 000 tokens.
- Soporte limitado a aleman e ingles; no se declaran otros idiomas.
- Riesgo de alucinacion inherente a los modelos de este tamano; no se documentan evaluaciones especificas de sesgos.
- Licencia Apache-2.0, que permite uso comercial, pero los datos de entrenamiento derivados de OpenCodeInstruct, SWE-rebench-openhands-trajectories y Nemotron-SWE-v1 estan bajo CC-BY-4.0, por lo que conviene revisar las condiciones de atribucion en un uso de produccion.
- Solo se publica la cuantizacion Q4_K_M; no hay variantes de mayor o menor precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SiriusLLM/Sirius-N4.1-Flash-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del autor: https://siriusllm.eu
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset nebius/SWE-rebench-openhands-trajectories: https://huggingface.co/datasets/nebius/SWE-rebench-openhands-trajectories
- Dataset nvidia/Nemotron-SWE-v1: https://huggingface.co/datasets/nvidia/Nemotron-SWE-v1
