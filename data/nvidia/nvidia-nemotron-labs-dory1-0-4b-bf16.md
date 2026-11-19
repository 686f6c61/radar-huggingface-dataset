# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 es un modelo de lenguaje de 4 mil millones de parametros desarrollado por NVIDIA dentro de su linea Nemotron Labs. Su particularidad es que no emplea una pila de capas estandar, sino una arquitectura "looped" (recurrente en el espacio latente): un bloque compartido de 20 capas se aplica varias veces entre un bloque de entrada y otro de salida, de 8 capas cada uno. Esto permite gastar mas computo por token sin aumentar el numero de parametros, mejorando el razonamiento con el mismo checkpoint.

El modelo resuelve el problema de tener que elegir entre calidad y coste de inferencia: con un unico conjunto de pesos se puede ajustar el numero de bucles (1, 2, 4...) para intercambiar computo por precision sin reentrenar ni cambiar de modelo. Ademas incorpora un mecanismo de cache KV de ultimo bucle que elimina la sobrecarga de memoria tipica de los modelos recurrentes, y fue preentrenado nativamente en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) antes de continuar en BF16.

Con 3.975.229.440 parametros, contexto de hasta 256K tokens, soporte exclusivo de ingles y licencia OpenMDW-1.1 que permite uso comercial, se posiciona como una alternativa compacta para tareas de razonamiento general, codigo y agentes donde el presupuesto de VRAM es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente y atencion hibrida intercalada (sliding-window attention + atencion completa) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE; el bloque recurrente se comparte entre bucles) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | BF16, MXFP8, NVFP4, Q5_K_M |
| Idiomas soportados | ingles |
| Licencia | OpenMDW License Agreement, version 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (repo de 8,0 GB en BF16); variantes MXFP8, NVFP4 y GGUF Q5_K_M publicadas por separado |

## Arquitectura y entrenamiento

Dory1.0-4B se basa en una arquitectura nGPT (normalized GPT) dividida en tres grupos de capas: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) compartido de 20 capas y un bloque de salida (O) de 8 capas. El bloque recurrente se aplica repetidamente entre la entrada y la salida, y la entrada se reinyecta en cada bucle. La atencion alterna capas de sliding-window attention con capas de atencion completa, lo que reduce el coste de atencion en contextos largos manteniendo acceso global.

El preentrenamiento se realizo de forma nativa en NVFP4, el formato de 4 bits de NVIDIA, y posteriormente continuo en BF16. Los datos de preentrenamiento proceden de `nvidia/nemotron-pre-training-datasets` con fecha de corte en septiembre de 2025, y el postentrenamiento de `nvidia/nemotron-post-training-v3` con corte en mayo de 2026. La model card no detalla el numero de tokens ni la composicion exacta de los datasets, ni si se emplearon tecnicas de RLHF o DPO especificas. La innovacion tecnica central es el bucle latente con cache KV de ultimo bucle: en lugar de almacenar una cache por bucle, Dory mantiene una sola cache por capa de atencion recurrente, de modo que la memoria no crece con el numero de bucles.

## Capacidades

- Generacion de texto y razonamiento general con presupuesto de computo elastico por token (1, 2, 4 o mas bucles).
- Razonamiento en el espacio latente: con mas bucles el modelo necesita generar menos tokens para resolver una tarea.
- Codigo y tareas agenticas: resultados destacados en SciCode, SWE-bench Verified y Terminal-Bench segun la model card.
- Soporte conversacional multi-turno con contexto de hasta 256K tokens.
- Capacidad de tool calling / function calling: no se menciona explicitamente en la informacion disponible; debe validarse en pruebas propias.
- Capacidades multilingues: limitadas al ingles unicamente.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada.
- Compatible con endpoints (tag `endpoints_compatible`) y con la libreria `transformers`.

## Casos de uso

- Razonamiento general de bajo coste: desplegar el modelo con 1 bucle para tareas simples y subir a 2 o 4 bucles en consultas complejas, ajustando el coste de inferencia sin cambiar de checkpoint.
- Agentes de codigo en CI/CD: con 61,8 en SWE-bench Verified a 4 bucles, puede integrarse en pipelines de revision de parches y resolucion de issues sobre repositorios, ejecutando varias pasadas de razonamiento antes de emitir el diff.
- Automatizacion de terminal y shell: los resultados en Terminal-Bench 2.1 (22,2 a 4 bucles) lo hacen util para agentes que ejecutan comandos y depuran entornos de forma iterativa.
- Atencion al cliente en ingles: la ventana de 256K tokens permite mantener conversaciones largas con historial extenso o documentos adjuntos sin truncar.
- Procesamiento de documentos extensos: analisis y resumen de contratos, informes o bases de codigo que superan la ventana tipica de modelos de 4B, aprovechando la atencion hibrida SWA/full.
- Despliegue en hardware de gama media: con la variante Q5_K_M o NVFP4 puede ejecutarse en una sola GPU consumer, habilitando prototipos de agentes en estaciones de trabajo sin clúster.
- Evaluacion de escenarios bancarios y de flujo de herramientas: el resultado en τ³-bench (Banking) sugiere uso en simulacion de tramites y agentes de backoffice con llamadas a herramientas.

## Benchmarks y rendimiento

Resultados reportados en la model card († indica puntuacion reportada por el autor del modelo comparado; los guiones no aparecen en la informacion disponible):

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

Los datos muestran una mejora monotona al aumentar el numero de bucles en todas las tareas reportadas. Faltan resultados de benchmarks generales como MMLU, GSM8K o HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: unos 8 GB solo para pesos, mas cache KV y activaciones; en la practica requiere una GPU con 16 GB o mas para contexto moderado.
- VRAM estimada en NVFP4 o Q5_K_M: aproximadamente 2,5 a 3 GB de pesos, lo que permite ejecucion en GPU consumer de 8 GB con contexto corto y en 12-16 GB con contexto largo.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090 o RTX 5090 para desarrollo y cargas medias.
- Cabe en GPU consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) usando las variantes cuantizadas; en BF16 se recomienda al menos 16 GB.
- Opciones de despliegue: `transformers` de forma nativa; el formato GGUF Q5_K_M sugiere soporte en llama.cpp y Ollama; para alto rendimiento pueden usarse servidores compatibles con endpoints (vLLM o TGI) aunque la model card no confirma compatibilidad explicita.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por token escala con el numero de bucles elegido, que es precisamente el parametro de ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | ~4B | 256K | 61,8 | OpenMDW-1.1 (uso comercial) | Hugging Face, BF16/MXFP8/NVFP4/GGUF |
| Qwen3.5-4B | 4B | no disponible | 54,7 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 61,0 | no disponible | no disponible |
| Gemma 4 26B A4B | 26B totales (MoE, 4B activos) | no disponible | 57,40 | no disponible | no disponible |

Frente a modelos de su mismo tamano, Dory1.0-4B a 4 bucles supera a Qwen3.5-4B en las tres tareas de codigo y agentes reportadas, y queda cerca de Qwen3.5-9B en SWE-bench con menos de la mitad de parametros. La comparacion con Gemma 4 26B A4B es favorable en SWE-bench pero desfavorable en SciCode y Terminal-Bench. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se debe esperar calidad en castellano ni en otros idiomas.
- El modelo puede alucinar, como cualquier LLM; no se documentan tasas de alucinacion ni mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible; deben evaluarse antes de uso en produccion.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar el texto completo por obligaciones de atribucion o restricciones adicionales.
- El rendimiento depende fuertemente del numero de bucles; usar 1 bucle en tareas complejas penaliza claramente (por ejemplo, SWE-bench cae de 61,8 a 50,3).
- La cache KV de ultimo bucle debe habilitarse explicitamente; sin ella, la memoria crece con cada bucle adicional.
- No se confirma soporte de tool calling ni de modo thinking explicito; validar antes de disenar agentes que dependan de ello.
- Formato NVFP4: el maximo rendimiento requiere hardware NVIDIA compatible con este formato.
- Fechas de corte de datos: preentrenamiento septiembre de 2025 y postentrenamiento mayo de 2026; puede carecer de conocimiento posterior.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16)
- [Pagina de desarrolladores de NVIDIA Nemotron](https://developer.nvidia.com/nemotron)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
- [Texto de la licencia OpenMDW 1.1 en GitHub](https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1)
- [Discord de NVIDIA AI Developer](https://discord.gg/9xpKQtVvrk)
- [Dataset de preentrenamiento](https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets)
- [Dataset de postentrenamiento](https://huggingface.co/datasets/nvidia/nemotron-post-training-v3)
