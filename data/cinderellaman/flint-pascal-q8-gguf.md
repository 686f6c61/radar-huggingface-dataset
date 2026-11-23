# CinderellaMan/Flint-Pascal-Q8-GGUF

## Resumen

Flint Pascal Q8 GGUF es una cuantización del modelo Flint (RecursiveSI/flint), un transformer de 39.785.287.456 parámetros (aproximadamente 39,8 mil millones) con capacidad de razonamiento previo a la respuesta, generación de código, tool calling y una ventana de contexto de hasta 262.144 tokens. La ha publicado el usuario CinderellaMan bajo licencia Apache 2.0, y su propósito es hacer viable la inferencia de un modelo de este tamaño en tarjetas NVIDIA antiguas de arquitectura Pascal (compute capability 6.1), en particular las P106-090 y P104 de rigs de minería retirados, la serie GTX 10 y las Tesla P4/P40.

La innovación principal no está en el modelo base, sino en la mezcla de cuantizaciones: parte del Q8_0 de Unsloth y mueve a Q5_0 los tensores cuya pérdida de calidad resulta menos costosa, logrando un archivo de 40,4 GB frente a los 42,3 GB del Q8_0 puro, con un 11,0 % menos de bytes leídos por token generado. El autor reporta que la divergencia KL respecto al modelo original en 16 bits queda dentro de dos errores estándar de la del Q8_0, y que en una repetición emparejada de las mismas sesiones de agente cada token se generó en 0,941 del tiempo del Q8_0, con la misma velocidad de lectura de prompt.

El modelo está pensado para despliegues con muchas GPU de gama baja agregadas por PCIe, no para hardware moderno: el autor indica explícitamente que en una GPU moderna o en un Mac conviene usar el Q8_0 de Unsloth. Su interés actual reside en reutilizar hardware de minería amortizado para ejecutar agentes de código con contexto completo, un nicho muy concreto pero con métricas publicadas y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Flint; detalles internos de capas y atención no disponibles) |
| Parametros totales | 39.785.287.456 (aproximadamente 39,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mezcla de Q8_0 y Q5_0 (tensores seleccionados en Q5_0), más F16 para determinados tensores; el archivo usa únicamente tipos nativos de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `flint-pascal-Q8.gguf`, 40,4 GB) |

## Arquitectura y entrenamiento

El modelo base es Flint, de RecursiveSI, descrito en la model card como un modelo de 39,8 mil millones de parámetros que "piensa antes de responder", escribe código, llama a herramientas y lee hasta 262.144 tokens de contexto. No se dispone de información sobre el número de capas, la configuración de atención, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La contribución técnica de esta ficha es la cuantización mixta: se parte del Q8_0 de Unsloth y se degradan a Q5_0 los tensores con menor impacto en calidad, reduciendo el tamaño de 42,3 GB a 40,4 GB y los bytes leídos por token en un 11,0 %. El autor valida la pérdida con divergencia KL frente al original en 16 bits, situándola dentro de dos errores estándar de la del Q8_0. El archivo es compatible con llama.cpp estándar, aunque las ganancias de velocidad en Pascal requieren el fork Miner Llama (v3.0 o v4.0), que incorpora kernels específicos y variables de entorno de planificación (`LLAMA_KV_SEQ_RM_BOUND`, `LLAMA_SERVER_YIELD`, `LLAMA_SAMPLING_TOP_K_ROWS`, `GGML_CUDA_GRAPHS_FORCE`, `LLAMA_SCHED_PER_SIZE_RESERVE`) y flags como `--ctx-checkpoints-vram` y `--ubatch-taper`.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento previo a la respuesta (thinking antes de contestar).
- Generación y corrección de código en Python y JavaScript, verificado en tareas con ejecución real de tests.
- Tool calling y function calling, con soporte para agentes de múltiples pasos.
- Ventana de contexto de 262.144 tokens, adecuada para sesiones de agente con contexto creciente turno a turno.
- Compatibilidad con clientes OpenAI-compatible mediante `llama-server` (flag `--alias flint`, endpoint HTTP en el puerto 8080).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Agentes de corrección de bugs en producción: el modelo puede recibir un repositorio, ejecutar tests y aplicar parches en sesiones multi-turno; el banco de pruebas del autor usa doce tareas de corrección en Python y JavaScript con ejecución real de tests y contexto creciente, y reporta 11 y 12 aciertos de 12 en dos ejecuciones con Miner Llama v4.0.
- Reutilización de rigs de minería como nodos de inferencia: con nueve P106-090 de 6 GB (unos 41 GB de VRAM agregada más espacio para contexto) se ejecuta el contexto completo de 262.144 tokens, lo que permite montar un servidor de agentes con hardware amortizado.
- Servidor local OpenAI-compatible para herramientas de desarrollo: `llama-server` expone un endpoint al que se pueden apuntar clientes compatibles con la API de OpenAI, útil para integrar el modelo en IDEs, CLIs de agente o pipelines internos sin depender de la nube.
- Automatización de tareas de refactorización con contexto largo: la ventana de 262.144 tokens permite cargar archivos completos o varios módulos de un proyecto sin trocear, manteniendo coherencia entre turnos.
- Evaluación y benchmarking de cuantizaciones en hardware legacy: el archivo sirve como referencia reproducible para medir el impacto de la mezcla Q8_0/Q5_0 frente al Q8_0 puro en divergencia KL y velocidad, con datos publicados por el autor.
- Despliegue en entornos con restricciones de red o de privacidad: al ejecutarse íntegramente en local sobre GPUs propias, el modelo evita el envío de código o datos a servicios externos, algo relevante para auditorías o código propietario.
- Formación y experimentación con planificación de memoria multi-GPU: la configuración documentada (`-ts 6,6,5,5,6,5,5,6,6`, `-ngl 99`, `-fa on`, `-b 512 -ub 128`) sirve como plantilla para repartir un modelo de 40 GB entre tarjetas pequeñas con tensor split.

## Benchmarks y rendimiento

Datos publicados por el autor en el banco `agent_check` (doce tareas de corrección de bugs con el agente de código pi, nueve P106-090, contexto de 262.144 tokens, una ejecución por fila salvo indicación):

| Motor y archivo | Tareas superadas | Generación (tokens/s) | Lectura de prompt (tokens/s) | Primer token por turno (mediana) |
|---|---|---|---|---|
| Miner Llama v4.0, este archivo, dos ejecuciones | 11 de 12; 12 de 12 | 49,32; 46,99 | 219,7; 204,1 | 1,74 s; 1,82 s |
| Miner Llama v3.0, este archivo, dos ejecuciones | 11 de 12; 12 de 12 | 48,55; 48,02 | 179,2; 181,3 | 2,65 s; 2,61 s |
| llama.cpp estándar b12076, Unsloth Q8_0, contexto 65.536 | 10 de 12 | 14,4 | 148 | 4,13 s |
| Miner Llama v3, Unsloth Q8_0 | 12 de 12 | 45,9 | 168 | 2,67 s |

El autor reporta además que, en una repetición emparejada de las mismas sesiones de agente, este archivo generó cada token en 0,941 del tiempo del Q8_0 con la misma velocidad de prompt, y que su divergencia KL frente al modelo original en 16 bits está dentro de dos errores estándar de la del Q8_0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 41 GB de memoria de GPU para los pesos, más espacio adicional para el contexto; el contexto completo de 262.144 tokens requiere nueve tarjetas de 6 GB.
- GPU objetivo: NVIDIA Pascal con compute capability 6.1, es decir, P106-090 y P104 de rigs de minería, GTX 10 y Tesla P4/P40. La velocidad solo está medida en P106-090.
- Controlador: Ubuntu 24.04 o superior con el driver NVIDIA 580, el último disponible para Pascal.
- No cabe en una única GPU de consumo moderna por tamaño; el autor recomienda usar el Q8_0 de Unsloth en GPU modernas o Mac en lugar de este archivo.
- Opciones de despliegue: Miner Llama v3.0 o v4.0 (fork de llama.cpp con kernels para Pascal, recomendado para velocidad) o llama.cpp estándar y aplicaciones construidas sobre él (el archivo usa solo tipos nativos Q8_0, Q5_0 y F16).
- Throughput medido: 47,4 tokens/s en el rig de referencia con la build de Miner Llama v3 y contexto completo; 49,32 y 46,99 tokens/s con v4.0; latencia de primer token de 1,74 y 1,82 s en v4.0 frente a 2,65 y 2,61 s en v3.0.
- En llama.cpp estándar sobre el mismo rig, con Q8_0 y contexto de 65.536, el rendimiento cae a 14,4 tokens/s de generación y 4,13 s hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flint Pascal Q8 GGUF (este) | 39,8 mil millones | 262.144 | Apache 2.0 | GGUF (Q8_0/Q5_0 mixto, 40,4 GB) | Optimizado para Pascal; 47,4 tokens/s en el rig de referencia |
| Unsloth Flint Q8_0 | 39,8 mil millones | 262.144 | Apache 2.0 (según modelo base) | GGUF (Q8_0, 42,3 GB) | Referencia de calidad; 45,9 tokens/s en el mismo rig con Miner Llama v3 |
| Flint Pascal Q5 GGUF | 39,8 mil millones | 262.144 | Apache 2.0 | GGUF (29,4 GB) | Para seis a ocho tarjetas de 6 GB, a menor calidad |
| Flint (RecursiveSI/flint) | 39,8 mil millones | 262.144 | no disponible en la información proporcionada | safetensors (modelo original en 16 bits) | Modelo base sin cuantizar |

## Limitaciones y advertencias

- La velocidad solo está medida en tarjetas P106-090; el rendimiento en otras GPU Pascal (P104, GTX 10, Tesla P4/P40) no está documentado y puede diferir.
- El archivo está optimizado para Pascal: en GPU modernas o Mac el autor recomienda el Q8_0 de Unsloth, por lo que este archivo no es la mejor opción fuera de ese hardware.
- La cuantización mixta Q8_0/Q5_0 introduce una pérdida de calidad respecto al modelo en 16 bits; el autor la acota con divergencia KL, pero no se publican resultados en benchmarks estándar que permitan verificarla de forma independiente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un riesgo inherente a los modelos generativos de este tamaño.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Requiere Ubuntu 24.04 o superior y el driver NVIDIA 580, el último para Pascal, lo que limita la actualización futura del entorno.
- El despliegue con contexto completo exige nueve tarjetas de 6 GB y un host modesto (el rig de referencia usa un Celeron de 2 núcleos con 4 GB de RAM y PCIe 1.0), una configuración poco habitual fuera de entornos de minería.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Flint, no disponibles en la información proporcionada.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/CinderellaMan/Flint-Pascal-Q8-GGUF
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Q8_0 de Unsloth: https://huggingface.co/unsloth/flint-GGUF/tree/20468edfc38ab43d6914cc88b08cbecb05d0fc62
- Flint Pascal Q5 GGUF: https://huggingface.co/CinderellaMan/Flint-Pascal-Q5-GGUF
- Repositorio llms-on-crypto-mining-rigs: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs
- Guía de instalación: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/setup.md
- Releases de Miner Llama: https://github.com/Cinderella-Man/miner-llama/releases
- Página de Flint en el repositorio: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/models/flint/README.md
- Release Flint v4: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/flint-v4/README.md
- Release Flint v3: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/release/flint-v3/README.md
- Banco agent_check: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/tree/main/bench/agent_check
- Agente pi: https://github.com/earendil-works/pi
- Datos de la ejecución 2026-11-14: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-14_r159_flint_release_agent/README.md
- Datos de la regresión 2026-11-05: https://github.com/Cinderella-Man/llms-on-crypto-mining-rigs/blob/main/docs/data/2026-11-05_release_regression/README.md
