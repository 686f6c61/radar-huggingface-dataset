# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parametros (3.975.229.440 exactos segun los pesos en safetensors) desarrollado por NVIDIA dentro de su linea Nemotron Labs. Su singularidad radica en que no es un transformer convencional, sino un modelo "looped" o de recurrencia latente: un bloque compartido de capas se aplica repetidamente entre un bloque de entrada y otro de salida, de modo que un mismo checkpoint puede ejecutarse con distintos presupuestos de computo de inferencia (1, 2 o 4 bucles) sin reentrenar ni cambiar de modelo.

La arquitectura combina un backbone normalized-GPT (nGPT) con atencion hibrida intercalada: capas de atencion de ventana deslizante (SWA) y capas de atencion completa. El modelo fue preentrenado de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y continuado en BF16. Soporta contextos de hasta 256K tokens y esta entrenado unicamente en ingles.

Esta ficha corresponde a la variante GGUF, cuantizada en Q5_K_M, pensada para despliegue en llama.cpp y entornos de inferencia local. Su interes actual reside en la eficiencia: con solo 4B de parametros y un truco de cache KV por ultimo bucle que elimina el sobrecoste de memoria del looping, compite en tareas de codigo y agentes con modelos notablemente mayores. La licencia es OpenMDW 1.1, que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT con atencion hibrida intercalada (SWA + atencion completa) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | Q5_K_M (esta variante GGUF); el modelo original se distribuye en BF16, MXFP8 y NVFP4 |
| Idiomas soportados | ingles |
| Licencia | OpenMDW 1.1 (uso comercial y no comercial) |
| Formato de pesos | GGUF (variante de esta ficha); safetensors en las versiones BF16/MXFP8/NVFP4 |

## Arquitectura y entrenamiento

Dory1.0-4B emplea una arquitectura de transformer con recurrencia latente. La pila de capas se divide en tres grupos: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) compartido de 20 capas y un bloque de salida (O) de 8 capas. El bloque recurrente se aplica multiples veces entre entrada y salida, y la entrada se reinyecta en cada bucle. Esto permite escalar el computo por token sin aumentar el numero de parametros: con 1, 2 o 4 bucles se obtienen distintos niveles de precision sobre el mismo checkpoint, sin reentrenamiento ni cambio de modelo.

El backbone es un normalized-GPT (nGPT), con atencion hibrida que intercala capas de ventana deslizante con capas de atencion completa. El modelo fue preentrenado nativamente en NVFP4 (formato de 4 bits de NVIDIA) y continuado en BF16. Los datos de preentrenamiento tienen fecha de corte en septiembre de 2025 y los de postentrenamiento en mayo de 2026, segun la model card. Se usaron los datasets nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3; no se detalla en la informacion disponible el numero exacto de tokens ni la composicion del dataset ni si hubo RLHF/DPO. Una innovacion destacable es el cache KV de ultimo bucle: en lugar de almacenar un cache por cada bucle (lo que haria crecer la memoria con el numero de bucles), Dory mantiene un unico cache por capa de atencion recurrente, de modo que el sobrecoste de memoria es nulo respecto a un modelo no bucleado.

## Capacidades

- Generacion de texto y razonamiento general de proposito general en ingles.
- Razonamiento de codigo y tareas agenticas: la model card reporta resultados en SciCode, SWE-bench Verified, Terminal-Bench 2.1 y tau3-bench (Banking).
- Inferencia elastica: el mismo checkpoint permite ajustar el computo por token (1, 2 o 4 bucles) para priorizar latencia o precision.
- Eficiencia de tokens: el computo extra se invierte en "pensar" en espacio latente, lo que reduce el numero de tokens generados necesarios para resolver una tarea.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno largas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling / function calling y razonamiento multi-paso: no se detalla explicitamente en la informacion disponible, aunque los benchmarks agenticos (SWE-bench, Terminal-Bench) sugieren uso en entornos con herramientas.
- Capacidad especial de vision o audio: no disponible.

## Casos de uso

- Agentes de codigo en produccion: con 4 bucles alcanza 61,8 en SWE-bench Verified, por lo que puede integrarse en pipelines que resuelven issues de repositorios reales, revisan parches y ejecutan tareas de terminal (22,2 en Terminal-Bench 2.1).
- Asistente de terminal y automatizacion de shell: el modelo puede operar en entornos de linea de comandos para tareas de administracion y scripts, gracias a su rendimiento en Terminal-Bench y su ventana de 256K tokens para mantener el estado de la sesion.
- Atencion al cliente automatizada en ingles: la ventana de 256K tokens permite gestionar conversaciones multi-turno con historial largo y documentos de referencia sin truncar.
- Analisis de documentos extensos: informes, contratos o bases de codigo de gran tamano caben en el contexto, y el modo de 1 bucle reduce la latencia en tareas de extraccion simple.
- Razonamiento cientifico y matematico asistido: con 35,11 en SciCode a 4 bucles, es adecuado para asistir en calculos y generacion de codigo cientifico en entornos de investigacion con presupuesto de GPU limitado.
- Despliegue en hardware de consumo: al ser una variante GGUF Q5_K_M de 4B, puede ejecutarse en equipos con GPU de gama media o incluso en CPU mediante llama.cpp, lo que facilita prototipado local y entornos sin acceso a clusters.
- Evaluacion de agentes bancarios y flujos transaccionales: el resultado en tau3-bench (Banking) de 14,69 a 4 bucles lo hace apto para prototipos de agentes en dominios financieros con herramientas.

## Benchmarks y rendimiento

Resultados reportados en la model card (guion = no disponible; † = puntuacion reportada por terceros):

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| tau3-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

Los datos muestran que el rendimiento crece de forma monotona con el numero de bucles, y que a 4 bucles el modelo de 4B supera a Qwen3.5-4B y se acerca a Qwen3.5-9B en SWE-bench Verified y SciCode, aunque queda por debajo en Terminal-Bench y en tau3-bench frente a modelos mayores.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante GGUF Q5_K_M ocupa aproximadamente 3,7 GB en disco (tamano del repo), por lo que la VRAM necesaria ronda los 4-5 GB incluyendo cache KV y overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para la variante Q5_K_M; para las versiones BF16/NVFP4 se recomienda A100, H100 o RTX 4090 segun el formato y el numero de bucles.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para las versiones safetensors (BF16/MXFP8/NVFP4), segun la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del numero de bucles y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B | ~4B | 256K | 61,8 (4 bucles) | OpenMDW 1.1 | Hugging Face (GGUF, BF16, MXFP8, NVFP4) |
| Qwen3.5-4B | 4B | no disponible | 54,7 | no disponible | Hugging Face |
| Qwen3.5-9B | 9B | no disponible | 61,0 | no disponible | Hugging Face |
| Gemma 4 26B A4B | 26B (A4B) | no disponible | 57,40 | no disponible | Hugging Face |

Dory1.0-4B destaca por ofrecer un rendimiento en codigo agentico cercano a modelos de 9B con la mitad de parametros, gracias al computo extra por token que aporta el looping. Su limitacion principal frente a alternativas es el idioma (solo ingles) y que los modelos mayores como Qwen3.6-35B-A3B siguen siendo superiores en tareas de terminal y agentes.

## Limitaciones y advertencias

- Idioma: entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado con datos web, es probable que herede sesgos de esos corpus.
- Riesgo de alucinacion: no cuantificado en la model card; como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de codigo y datos factuales.
- Dependencia del numero de bucles: el rendimiento optimo requiere 4 bucles, lo que incrementa el computo; con 1 bucle la precision cae de forma notable (por ejemplo, SWE-bench de 61,8 a 50,3).
- Licencia: OpenMDW 1.1 permite uso comercial, pero conviene revisar los terminos completos antes de desplegar en produccion.
- Contexto largo: aunque soporta 256K tokens, no se detalla en la informacion disponible el rendimiento real en tareas de recuperacion con contextos muy extensos.
- Formatos: la variante GGUF Q5_K_M introduce perdida de precision respecto a BF16; para maxima calidad conviene usar las versiones NVFP4/MXFP8 en hardware compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
