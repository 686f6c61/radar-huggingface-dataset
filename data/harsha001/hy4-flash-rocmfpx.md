# Harsha001/Hy4-flash-ROCmFPX

## Resumen

Hy4-flash ROCmFPX es una familia de cuantizaciones GGUF de 4 bits del modelo `tencent/Hy4-flash`, publicada por el usuario Harsha001 y optimizada especificamente para ejecutarse de forma integra en una unica maquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, de los cuales 96 GB se reservan como memoria de GPU. El modelo base es un transformer disperso (MoE) de 220 000 millones de parametros totales con 12 000 millones activos por token, 42 capas y 512 expertos con enrutamiento top-16. La cuantizacion emplea los formatos propietarios ROCmFPX (Q4_0_ROCMFP4 para expertos y Q8_0_ROCMFPX para el resto), con una matriz de importancia generada a partir de trazas agenticas reales (llamadas a herramientas, function calling, tareas de shell y base de datos).

La relevancia de esta publicacion es practica: demuestra que un MoE de 220B puede residir en hardware de consumo profesional de gama alta (un solo equipo con memoria unificada) si se separa la tabla Engram de 64B al lado CPU/SSD, ya que solo se accede a ella mediante lookups por fila, una fila por token. El repositorio ocupa 248,6 GB e incluye dos variantes de pesos (STRIX y STRIXFAST), cada una dividida en partes de como maximo 45 GB.

Esta ficha describe exclusivamente la cuantizacion y sus requisitos de ejecucion; las capacidades del modelo base se infieren de la informacion disponible en la model card del autor, que no incluye resultados de benchmarks ni detalles completos del entrenamiento original de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `hy_v4_flash` en llama.cpp), 42 capas, 512 expertos, enrutamiento top-16, con tabla Engram de lookup |
| Parametros totales | 218 938 417 140 (aprox. 220B); de ellos 64B corresponden a la tabla Engram |
| Parametros activos | 12B por token |
| Longitud de contexto | 65 536 tokens (valor usado en el ejemplo de ejecucion de la model card; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (expertos), Q8_0_ROCMFPX (resto de tensores), Q4_0_ROCMFP4_FAST (variante de kernel rapido), Q4_0 para la tabla Engram |
| Idiomas soportados | No disponible (la model card indica "English first" para el ajuste de la matriz de importancia) |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache 2.0 con terminos comerciales adicionales en la seccion 10) |
| Formato de pesos | GGUF dividido en partes de maximo 45 GB (tres partes en la variante STRIX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 42 capas y 512 expertos con enrutamiento top-16, con 12B parametros activos por token sobre un total de 220B. Una particularidad estructural es la tabla Engram de 64B parametros, que se consulta mediante lookups por fila (una fila por token) en lugar de participar en el calculo denso; por eso el autor la mantiene en CPU o incluso en SSD mediante mmap sin penalizar la VRAM. La cuantizacion no incluye el codificador de vision ni el drafter DFly2 del modelo original, por lo que esta publicacion es exclusivamente de texto.

El proceso de cuantizacion parte de `tencent/Hy4-flash` y aplica escalas de tensor ROCmFPX, manteniendo el embedding de tokens en Q8_0. La matriz de importancia se construyo con texto agentico: ejecuciones de agentes de codigo, llamadas a herramientas, function calling y tareas de shell y base de datos, renderizadas con la plantilla de chat del propio modelo e incluyendo los esquemas de herramientas. El resultado son pesos afinados para trabajo agentico y de codigo, no para generacion de prosa. No se dispone de informacion sobre el dataset de preentrenamiento original, el numero de tokens vistos ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (soporte `--jinja` en llama.cpp).
- Modo de razonamiento configurable mediante `reasoning_effort`: `"high"` (pensamiento, valor por defecto) o `"no_think"`.
- Tool calling y function calling, con esquemas de herramientas integrados en el formato de chat.
- Flujos agenticos multi-paso: el autor cita ejecuciones de agentes de codigo, tareas de shell y operaciones de base de datos como base de la matriz de importancia.
- Generacion de codigo, implícita en el enfoque de cuantizacion ("coding agent runs", "tool calls").
- Capacidad multilingue: no disponible en la informacion proporcionada; la model card indica prioridad al ingles.
- Vision: no incluida en esta cuantizacion (el codificador de vision del modelo base no esta presente).
- Audio: no disponible.

## Casos de uso

- Agentes de codigo en local: el modelo puede ejecutar bucles de edicion de codigo con llamadas a herramientas sobre un contexto de 65 536 tokens, y los pesos estan calibrados con trazas de agentes de codigo reales, lo que reduce la degradacion de calidad en ese dominio frente a una cuantizacion generica.
- Automatizacion de operaciones de shell: con tool calling y modo `no_think` para respuestas rapidas, encaja en tareas de ejecucion de comandos y parseo de salidas dentro de un pipeline de administracion.
- Asistentes de consulta a bases de datos: la matriz de importancia incluye tareas de base de datos, por lo que el modelo mantiene mejor fidelidad en la generacion de SQL y en la interpretacion de esquemas dentro de un flujo de function calling.
- Despliegue en una unica estacion de trabajo AMD: al caber en 84,7 GiB de memoria de GPU en un Strix Halo de 128 GB, permite servir un MoE de 220B sin cluster ni GPUs de datacenter, util para prototipado y desarrollo de agentes.
- Servidor de inferencia local con llama.cpp: mediante `llama-server` se puede exponer una API compatible con endpoints para integrar el modelo en herramientas de desarrollo o en un IDE.
- Razonamiento con presupuesto variable: alternar `reasoning_effort` entre `"high"` y `"no_think"` permite usar el mismo modelo para tareas que requieren cadena de pensamiento y para respuestas de baja latencia en produccion.
- Evaluacion de cuantizaciones en hardware AMD: el repositorio sirve como referencia para comparar el rendimiento de los kernels ROCmFPX frente a cuantizaciones GGUF estandar en GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de calidad sobre chats agenticos reservados (solo tokens del asistente) se anadiran al repositorio, y que todos los ficheros pasaron una prueba de humo antes de la subida.

## Requisitos de hardware

- VRAM estimada: 84,7 GiB para la variante Q4_0_STRIX (parte GPU) y 80,4 GiB para Q4_0_STRIXFAST. La tabla Engram (33 GiB en Q4_0) se mantiene en CPU o SSD.
- GPU objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada y 96 GB configurados como memoria de GPU.
- No cabe en GPUs de consumo con VRAM discreta convencional (RTX 4090 con 24 GB, etc.); requiere memoria unificada de gran capacidad o un sistema multi-GPU con al menos 85-90 GB agregados.
- Despliegue: fork ROCmFPX de llama.cpp, rama `hy4-flash`, compilado con Vulkan o ROCm/HIP. Ejemplo de la model card: `llama-server -m ... -ngl 99 -ot "per_layer_token_embd=CPU" -c 65536 --jinja`.
- vLLM, TGI y Ollama no estan soportados segun la informacion disponible, ya que la arquitectura `hy_v4_flash` con escalas ROCmFPX requiere el fork especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash ROCmFPX (esta ficha) | 220B / 12B | 65 536 (ejemplo de ejecucion) | Tencent Hy License 1.0 | GGUF para llama.cpp (fork ROCmFPX) |
| tencent/Hy4-flash (original) | 220B / 12B | No disponible | Tencent Hy License 1.0 | Pesos originales en Hugging Face |
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF (mismo autor) | No disponible | No disponible | No disponible | GGUF para Strix Halo |

No se dispone de datos de rendimiento ni de contexto maximo del modelo base ni de la alternativa del mismo autor, por lo que la comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Cuantizacion de 4 bits en los expertos: la calidad es inferior a la de los pesos originales en BF16/FP16; el autor no publica todavia metricas de degradacion.
- Calibrada para texto agentico en ingles: el rendimiento en prosa, en otros dominios y en idiomas distintos del ingles puede degradarse mas de lo habitual.
- Sin vision ni drafter de decodificacion especulativa: no se puede usar para tareas multimodales ni aprovechar la aceleracion del drafter DFly2.
- Requiere un fork no estandar de llama.cpp (rama `hy4-flash`); no funciona con versiones upstream ni con otros motores de inferencia.
- La tabla Engram debe mantenerse fuera de la GPU (`-ot "per_layer_token_embd=CPU"`); una configuracion incorrecta puede agotar la memoria o provocar fallos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje y no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia Tencent Hy 1.0: derivada de Apache 2.0 con terminos comerciales adicionales para grandes negocios de Model-as-a-Service (seccion 10); es necesario revisar el fichero LICENSE antes de un uso comercial.
- Contexto: el valor de 65 536 tokens aparece en el ejemplo de ejecucion, no como maximo garantizado del modelo; conviene verificar el limite real de la arquitectura `hy_v4_flash`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Hy4-flash-ROCmFPX
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Cuantizacion destacada del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
