# cagataydev/tin-0.8b

## Resumen

Tin 0.8B es un modelo de lenguaje de pequeno tamano (852.985.920 parametros) desarrollado por cagataydev (Çağatay Çalı) como un fine-tuning supervisado (SFT) del modelo cagataydev/loopl-0.8b, que a su vez deriva de Qwen3.5-0.8B. Su proposito es especializarse en Tin, un lenguaje de programacion tipado en el que los agentes y las herramientas forman parte de la propia sintaxis. El modelo escribe programas en Tin, los corrige a partir de los errores del compilador y ejecuta bucles de verificacion y correccion mediante las herramientas `tin_check` y `tin_run`.

La relevancia del modelo radica en su caracter de herramienta especializada y ligera, disenada para ejecutarse en dispositivos (on-device) y para integrarse en flujos de agentes que generan y validan codigo de forma iterativa. Al estar construido sobre Qwen3.5, hereda la arquitectura transformer de dicho modelo base, aunque la informacion disponible no detalla la longitud de contexto ni la composicion exacta del entrenamiento.

El modelo se distribuye en formato bf16 para transformers (repo de 1,7 GB) y existe una variante de 4 bits para telefonos y Macs. Su licencia Apache-2.0 facilita el uso comercial, y su pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, si bien la documentacion se centra en la generacion de codigo Tin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (build principal); 4 bits (variante `tin-0.8b-4bit`) |
| Idiomas soportados | en, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); variante 4-bit para MLX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre cagataydev/loopl-0.8b, que a su vez es un derivado de Qwen3.5-0.8B. La arquitectura subyacente es un transformer de la familia Qwen3.5, con 852.985.920 parametros totales segun los pesos en safetensors. El pipeline declarado es image-text-to-text, lo que indica que el modelo base incorpora procesamiento de imagen y texto, aunque la model card no documenta el uso de vision en el fine-tuning de Tin.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO. La innovacion tecnica destacable no reside en la arquitectura, sino en la especializacion: el modelo esta entrenado para el ciclo de escribir codigo Tin, leer los errores del compilador real y corregir el programa, incluyendo la correccion de errores apilados (stacked bugs) y el uso de un bucle de agente nativo con herramientas de verificacion y ejecucion.

## Capacidades

- Generacion de programas en Tin, un lenguaje tipado con agentes y herramientas en la sintaxis.
- Correccion de codigo a partir de los errores emitidos por el compilador de Tin.
- Correccion de errores apilados (multiples fallos encadenados) con una tasa de exito del 89 % en el conjunto de evaluacion.
- Bucle de agente nativo mediante las herramientas `tin_check` y `tin_run` (check-and-fix loop).
- Soporte de tool calling / function calling orientado a las herramientas del ecosistema Tin.
- Capacidades multilingues limitadas a ingles (en) y turco (tr).
- Generacion de codigo general y conversacion (tags `code`, `conversational`).
- Orientado a ejecucion on-device y a entornos de agente.

## Casos de uso

- Generacion y validacion de codigo Tin en pipelines de agentes: el modelo escribe un programa, invoca `tin_check` para compilarlo y `tin_run` para ejecutarlo, corrigiendo los errores del compilador en iteraciones sucesivas. Es adecuado porque su entrenamiento se centra precisamente en ese ciclo.
- Correccion automatica de errores de compilacion: dado un programa Tin que falla, el modelo propone parches a partir de los mensajes de error, con un 88,8 % de exito en la tarea de "fixes Tin" del conjunto de evaluacion.
- Asistente de desarrollo integrado en el CLI de Tin: el modelo puede configurarse como modelo por defecto del agente (`tin model pull tin:0.8b`) para tareas de escritura y depuracion de codigo en local.
- Despliegue en dispositivos moviles y Macs: la variante de 4 bits (`tin-0.8b-4bit`) permite ejecutar el modelo con mlx-lm en telefonos y equipos Apple, habilitando asistentes de codigo Tin sin conexion.
- Prototipado rapido de herramientas y funciones con guardas: el modelo genera funciones de herramienta con protecciones (por ejemplo, una funcion `deleteFile` con guardas), util para ensenar o documentar el lenguaje.
- Educacion y ejemplos de Tin: el modelo puede producir ejemplos didacticos del lenguaje y explicar su sintaxis, aunque con las limitaciones de un modelo de 0,8B.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a pruebas propias ("probes") evaluadas por el compilador real de Tin sobre un conjunto reservado, expresadas como porcentaje de aprobados:

| Prueba | Tin 0.8B | Qwen3.5 0.8B |
|---|---:|---:|
| Dice que es Tin | 93,8 | 60,4 |
| Conocimiento de Tin | 50,1 | 15,1 |
| Escribe Tin (compila y produce la salida esperada al primer intento) | 37,5 | 0 |
| Corrige Tin | 88,8 | 30,8 |
| Corrige errores apilados | 89 | 7,3 |
| Bucle de agente nativo | 32,5 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build bf16 ocupa 1,7 GB en el repositorio; en bf16 los pesos rondan 1,7 GB, por lo que la inferencia cabe en GPUs con 4 GB o mas de VRAM. La variante de 4 bits reduce el requisito aproximadamente a 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; tambien cabe en GPUs de gama de entrada y en Apple Silicon mediante MLX.
- Cabe en GPU consumer: si, con amplio margen, dado su tamano inferior a mil millones de parametros.
- Opciones de despliegue: transformers (build bf16), mlx-lm (variante 4-bit) y el CLI oficial de Tin (`tin model pull tin:0.8b`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tin 0.8B | 852.985.920 | no disponible | Codigo Tin, agente check-and-fix | Apache-2.0 | Hugging Face (bf16 y 4-bit) |
| Tin 2B (v3) | no disponible | no disponible | Codigo Tin (54,1 escribe / 92,5 corrige / 55 bucle de agente) | no disponible | Hugging Face (`tin-2b-v3-4bit`) |
| Tin 4B | no disponible | no disponible | Codigo Tin (68,3 escribe / 97,2 corrige / 65 bucle de agente) | no disponible | Hugging Face (`tin-4b-4bit`) |
| Qwen3.5 0.8B | 0,8B (aproximado) | no disponible | Modelo general base | Apache-2.0 (segun la model card) | Hugging Face |

La comparativa mas directa es con las otras variantes de la familia Tin (2B y 4B), que ofrecen mejores puntuaciones en escritura y bucle de agente a costa de mayor tamano. El modelo base Qwen3.5 0.8B no tiene conocimiento especifico de Tin (0 en escritura y en bucle de agente).

## Limitaciones y advertencias

- Alrededor del 62 % de los primeros intentos fallan `tin check` o imprimen una salida incorrecta, por lo que es obligatorio ejecutar el compilador y validar el resultado.
- El conocimiento de Tin corresponde al commit de entrenamiento; las funciones de la biblioteca estandar mas recientes pueden faltar.
- Modelo pequeno: detalles como nombres de flags y codigos de error suelen ser incorrectos.
- Solo soporta ingles y turco; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 0,8B, especialmente en la generacion de codigo sin verificacion.
- No se documentan sesgos conocidos en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.

## Enlaces

- Hugging Face (build bf16): https://huggingface.co/cagataydev/tin-0.8b
- Variante 4 bits: https://huggingface.co/cagataydev/tin-0.8b-4bit
- Modelo base: https://huggingface.co/cagataydev/loopl-0.8b
- Variante 2B: https://huggingface.co/cagataydev/tin-2b-v3-4bit
- Variante 4B: https://huggingface.co/cagataydev/tin-4b-4bit
- Sitio oficial de Tin: https://tin.ad
- Instalador del CLI: https://tin.ad/install.sh
- Perfil del autor en GitHub: https://github.com/cagataycali
