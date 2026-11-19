# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 es un modelo de lenguaje de 4.000 millones de parametros desarrollado por NVIDIA dentro de su linea Nemotron Labs. Su rasgo distintivo es que no se trata de un transformer convencional, sino de un modelo "looped" (recurrente latente) construido sobre una arquitectura normalized-GPT (nGPT) en la que un bloque compartido de capas se aplica varias veces entre un bloque de entrada y otro de salida. Esto permite escalar el computo de inferencia por token sin cambiar de checkpoint: el mismo modelo puede ejecutarse con 1, 2 o 4 bucles segun el presupuesto de computo disponible.

La version publicada en este repositorio es la cuantizada en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y el modelo fue preentrenado de forma nativa en NVFP4 antes de continuar el entrenamiento en BF16. Declara una longitud de contexto de hasta 256K tokens, esta orientado a ingles y se distribuye bajo la licencia OpenMDW 1.1, que permite uso comercial y no comercial.

Su relevancia actual radica en dos frentes: por un lado, demuestra que el preentrenamiento nativo en precision de 4 bits es viable para un modelo de esta escala; por otro, introduce mecanismos como la cache KV de ultimo bucle, que elimina el sobrecoste de memoria tipico de los modelos recurrentes y lo hace atractivo para despliegues con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT (nGPT) con atencion de ventana deslizante (SWA) y capas de atencion completa intercaladas |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | NVFP4 (esta version), MXFP8, BF16 y Q5_K_M disponibles en otros repositorios |
| Idiomas soportados | Ingles |
| Licencia | OpenMDW License Agreement, version 1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors (libreria transformers) |
| Precision de entrenamiento | Preentrenamiento nativo en NVFP4, continuacion en BF16 |
| Fecha de publicacion | 16 de octubre de 2026 |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

Dory1.0-4B emplea una arquitectura nGPT con un esquema de apilamiento dividido en tres grupos: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) de 20 capas que se reaplica varias veces y un bloque de salida (O) de 8 capas, con la entrada reinjectada en cada bucle. La atencion combina capas de ventana deslizante con capas de atencion completa, lo que reduce el coste de atencion en contextos largos sin renunciar por completo al alcance global. El numero de bucles es un hiperparametro de inferencia: 1, 2 o 4 aplicaciones del bloque recurrente producen distintos niveles de precision sin reentrenar ni cambiar de pesos.

El modelo fue preentrenado de forma nativa en NVFP4, el formato de 4 bits de NVIDIA, y posteriormente continuo su entrenamiento en BF16. Los datos de preentrenamiento tienen fecha de corte en septiembre de 2025 y los de postentrenamiento en mayo de 2026, y proceden de los conjuntos `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`. La model card no detalla el volumen total de tokens ni la composicion exacta del dataset, ni especifica si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica mas destacable, ademas del preentrenamiento en 4 bits, es la cache KV de ultimo bucle: en lugar de almacenar una cache por cada bucle, se mantiene una sola por capa de atencion recurrente, de modo que el modelo no incurre en sobrecoste de memoria frente a un modelo no recurrente equivalente, independientemente del numero de bucles.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con enfasis en tareas de codigo y agenticas segun los benchmarks publicados.
- Razonamiento en espacio latente: el computo adicional por token se invierte en bucles internos en lugar de en secuencias de salida mas largas, lo que reduce el numero de tokens generados necesarios para resolver una tarea.
- Inferencia elastica: el mismo checkpoint permite ajustar el presupuesto de computo (1, 2 o 4 bucles) segun la precision requerida y los recursos disponibles.
- Soporte de contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de resolucion de tareas de codigo y agenticas (SciCode, SWE-bench Verified, Terminal-Bench 2.1, tau3-bench) segun los resultados reportados por el autor.
- Modelo unicamente en ingles; no se declara soporte multilingue.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni modo thinking separado.

## Casos de uso

- Asistencia de codigo en produccion: con resultados de 61,8 en SWE-bench Verified a 4 bucles, el modelo puede integrarse en flujos de resolucion automatica de issues y generacion de parches sobre repositorios, ajustando el numero de bucles al presupuesto de latencia del pipeline.
- Agentes de terminal y automatizacion de sistemas: su rendimiento en Terminal-Bench 2.1 (22,2 a 4 bucles) lo hace util para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos controlados.
- Procesamiento de documentos largos: la ventana de 256K tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes tecnicos o bases de codigo completas en una sola pasada.
- Razonamiento cientifico y calculo tecnico: los resultados en SciCode (35,11 a 4 bucles) lo sitúan como opcion para asistentes de analisis de datos y generacion de scripts cientificos.
- Despliegue en hardware limitado: al estar cuantizado en NVFP4 y ocupar 3,2 GB en repositorio, es viable en GPUs de consumo y en entornos de borde donde un modelo de 4B en BF16 no cabria con comodidad.
- Servicio de atencion al cliente en ingles: la combinacion de contexto largo y bajo coste de memoria por bucle permite mantener conversaciones multi-turno con historial extenso en una sola GPU.
- Experimentacion en investigacion: la posibilidad de variar el numero de bucles sin cambiar de checkpoint facilita estudios sobre la relacion entre computo de inferencia y calidad, y sobre entrenamiento en precision reducida.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4 (reportado) |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| tau3-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

La model card original incluye filas adicionales que no se han reproducido por estar truncadas en la informacion disponible. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el repositorio NVFP4 ocupa 3,2 GB, por lo que la inferencia en esta precision requiere aproximadamente 4 GB de VRAM mas el espacio de cache KV. Las versiones BF16 y MXFP8 requieren mas memoria (del orden de 8 GB y 4-5 GB respectivamente, estimacion orientativa).
- GPU recomendadas: GPUs NVIDIA con soporte de NVFP4 (familia Blackwell y posteriores) para aprovechar el formato nativo; GPUs Ampere y Ada pueden ejecutar la version BF16 o Q5_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para la version NVFP4; la version BF16 requiere al menos 10-12 GB para contexto moderado.
- Opciones de despliegue: transformers (libreria declarada), y por formato safetensors es compatible con servidores de inferencia habituales; la model card no confirma integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante NVFP4.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste computacional escala con el numero de bucles seleccionado (1, 2 o 4), de modo que la latencia por token crece aproximadamente de forma proporcional al numero de aplicaciones del bloque recurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | 4B | 256K | 61,8 | OpenMDW 1.1 | Hugging Face (NVFP4, MXFP8, BF16, Q5_K_M) |
| Qwen3.5-4B | 4B | no disponible | 54,7 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 61,0 | no disponible | no disponible |
| Gemma 4 26B A4B | 26B (MoE, 4B activos) | no disponible | 57,40 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73,4 (reportado) | no disponible | no disponible |

Dory1.0-4B iguala o supera a Qwen3.5-9B en SWE-bench Verified con menos de la mitad de parametros cuando se ejecuta a 4 bucles, y supera a Gemma 4 26B A4B en esa misma tarea, aunque queda por detras de Qwen3.6-35B-A3B. En Terminal-Bench 2.1 y SciCode se situa por debajo de los modelos de mayor tamano, lo que es coherente con su escala.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni evalua su comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos de 4B: en tareas de razonamiento abierto o dominios especializados puede generar contenido plausible pero incorrecto.
- El rendimiento depende criticamente del numero de bucles configurado; usar 1 bucle reduce la calidad de forma notable (por ejemplo, SWE-bench cae de 61,8 a 50,3).
- La cuantizacion NVFP4 puede introducir degradacion adicional frente a la version BF16, especialmente en tareas sensibles a la precision numerica.
- La licencia OpenMDW 1.1 permite uso comercial, pero conviene revisar sus terminos completos antes de desplegar en produccion.
- No se documentan en la informacion disponible sesgos especificos, soporte de tool calling ni garantias de robustez frente a prompts adversarios.
- El contexto de 256K no implica que el modelo mantenga calidad uniforme en todo el rango; no se han publicado evaluaciones de aguja en pajar ni de recuperacion a longitudes maximas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Pagina de desarrolladores de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
