# enhasasuzu/NVIDIA-Nemotron-3-Nano-4B-BF16-staging

## Resumen

NVIDIA-Nemotron-3-Nano-4B-BF16 es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA, disenado como modelo unificado para tareas de razonamiento y no razonamiento. Se ha obtenido mediante compresion del modelo NVIDIA-Nemotron-Nano-9B-v2 utilizando el framework Nemotron Elastic, lo que reduce el numero de parametros de 9B a 4B manteniendo gran parte de las capacidades del modelo padre. Emplea una arquitectura hibrida compuesta principalmente por capas Mamba-2 y MLP, combinadas con solo cuatro capas de atencion.

El modelo esta orientado a despliegue en el borde (edge), con casos de uso declarados como NPCs de videojuegos con IA, asistentes de voz locales y automatizacion IoT, sobre plataformas como Jetson Thor, GeForce RTX y DGX Spark. Su ventana de contexto alcanza los 128k tokens, lo que lo hace adecuado para conversaciones multi-turno extensas y tareas agénticas. La fecha de corte de los datos de preentrenamiento es septiembre de 2024.

La relevancia actual del modelo radica en su combinacion de tamano reducido, contexto largo y soporte para tool calling y razonamiento controlable mediante prompt de sistema, lo que lo posiciona como una opcion competitiva para inferencia local en hardware de consumo. La ficha corresponde a un repositorio de staging publicado por el usuario enhasasuzu, no al repositorio oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba-2 + MLP + 4 capas de atencion (familia Nemotron-H) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (evaluado con RULER a 128k) |
| Tipos de cuantizacion | BF16 (version publicada); GGUF disponible en variante separada |
| Idiomas soportados | Ingles (mejorado con Qwen) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16), transformers con custom_code |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida de la familia Nemotron-H: la mayor parte de las capas son Mamba-2 y MLP, con solo cuatro capas de atencion tradicional. Esta combinacion reduce el coste computacional y de memoria frente a un transformer denso equivalente, especialmente en contextos largos, manteniendo la capacidad de modelar dependencias de largo alcance. El modelo se ha comprimido desde NVIDIA-Nemotron-Nano-9B-v2 mediante el framework Nemotron Elastic, documentado en el paper arXiv:2511.16664.

El preentrenamiento utiliza el dataset Nemotron-CC-v2, con fecha de corte septiembre de 2024. La fase de post-entrenamiento emplea multiples datasets de NVIDIA: Nemotron-Post-Training-Dataset-v2, Nemotron-Science-v1, Nemotron-Instruction-Following-Chat-v1, Nemotron-Agentic-v1, Nemotron-Competitive-Programming-v1, Nemotron-Math-Proofs-v1, ademas de datasets de RL para uso de herramientas agénticas, calendarizacion, instruction following y salidas estructuradas (Nemotron-RL-Agentic-Conversational-Tool-Use-Pivot-v1, Nemotron-RL-instruction_following, Nemotron-RL-agent-calendar_scheduling, Nemotron-RL-instruction_following-structured_outputs). El modelo soporta un modo de razonamiento controlable: genera una traza de razonamiento antes de la respuesta final, o puede configurarse para responder directamente, con una ligera perdida de precision en prompts dificiles.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento controlable mediante prompt de sistema (modo reasoning-on / reasoning-off).
- Razonamiento matematico y resolucion de problemas (evaluado en AIME25, MATH500).
- Generacion de codigo y programacion competitiva (evaluado en LiveCodeBench).
- Tool calling / function calling (evaluado en BFCL v3 y entornos Tau2).
- Capacidades agénticas multi-paso, incluyendo calendarizacion y uso de herramientas conversacionales.
- Seguimiento de instrucciones, incluyendo salidas estructuradas (IFEval, IFBench).
- Contexto largo de hasta 128k tokens (RULER).
- Capacidades de roleplay y conversacion (EQ-Bench3).
- No dispone de vision ni audio segun la informacion disponible.

## Casos de uso

- NPCs de videojuegos con IA: el modelo esta disenado explicitamente para companeros y tecnicos de juego en el borde, con contexto de 128k que permite mantener memoria de la partida y personalidad consistente en sesiones largas.
- Asistentes de voz locales: su tamano de 4B y su arquitectura hibrida permiten ejecucion en dispositivos como Jetson Thor o GeForce RTX, habilitando asistentes de voz para apps y dispositivos sin dependencia de la nube.
- Automatizacion IoT: el soporte de tool calling y salidas estructuradas permite al modelo invocar APIs de dispositivos, calendarizar acciones y ejecutar flujos de automatizacion en entornos con recursos limitados.
- Agentes conversacionales con uso de herramientas: los resultados en BFCL v3 (61.1) y Tau2 lo hacen util para agentes que reservan vuelos, gestionan retail o atienden telecomunicaciones en modo multi-turno.
- Generacion de codigo en pipelines locales: con LCB de 51.8 en modo reasoning-on, puede integrarse en asistentes de codigo embebidos o entornos de desarrollo sin conexion.
- Tutoria y resolucion de problemas matematicos: MATH500 de 95.4 y AIME25 de 78.5 en modo razonamiento lo hacen adecuado para asistencia educativa con explicaciones paso a paso.
- Procesamiento de documentos largos: la ventana de 128k y el RULER de 91.1 permiten resumir y consultar documentacion extensa en local.

## Benchmarks y rendimiento

Resultados en modo reasoning-off:

| Benchmark | NVIDIA-Nemotron-3-Nano-4B-BF16 |
|---|---|
| BFCL v3 | 61.1 |
| IFBench-Prompt | 43.2 |
| IFBench-Instruction | 44.2 |
| Orak | 22.9 |
| IFEval-Prompt | 82.8 |
| IFEval-Instruction | 88.0 |
| HaluEval | 62.2 |
| RULER (128k) | 91.1 |
| Tau2-Airline | 28.0 |
| Tau2-Retail | 34.8 |
| Tau2-Telecom | 24.9 |
| EQ-Bench3 | 63.2 |

Resultados en modo reasoning-on:

| Benchmark | NVIDIA-Nemotron-3-Nano-4B-BF16 |
|---|---|
| AIME25 | 78.5 |
| MATH500 | 95.4 |
| GPQA | 53.2 |
| LCB | 51.8 |
| BFCL v3 | 61.1 |
| IFEval-Prompt | 87.9 |
| IFEval-Instruction | 92.0 |
| Tau2-Airline | 33.3 |
| Tau2-Retail | 39.8 |
| Tau2-Telecom | 33.0 |

Las evaluaciones se realizaron con NeMo-Skills y Orak (tres juegos: Super Mario, Darkest Dungeon y StarDew Valley). No se han publicado en la informacion disponible resultados comparativos con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas overhead de contexto KV/cache; en la practica se recomienda 12-16 GB para contextos moderados.
- Cuantizaciones GGUF disponibles en variante separada (NVIDIA-Nemotron-3-Nano-4B-GGUF), lo que permite reducir requisitos a rangos de 3-6 GB segun cuantizacion.
- GPU recomendadas por NVIDIA: Jetson Thor, GeForce RTX y DGX Spark, orientadas a despliegue en el borde.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM en funcion de la cuantizacion (por ejemplo, RTX 3060/4060/4070/4080/4090).
- Opciones de despliegue: transformers con custom_code (requerido por la arquitectura nemotron_h), llama.cpp/Ollama mediante la version GGUF, y potencialmente vLLM/TGI si soportan la arquitectura hibrida (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B | 4B | 128k | NVIDIA Nemotron Open Model License | Arquitectura hibrida Mamba-2; reasoning controlable; edge-ready |
| NVIDIA-Nemotron-Nano-9B-v2 | 9B | no disponible en la informacion | NVIDIA Nemotron Open Model License | Modelo padre del que se comprime el 4B |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han proporcionado resultados de benchmarks de modelos alternativos en la informacion disponible, por lo que no es posible establecer una comparativa de rendimiento numerica.

## Limitaciones y advertencias

- Idiomas: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: HaluEval de 62.2 en modo reasoning-off indica margen de mejora en fidelidad factual.
- El modo reasoning-off reduce la precision en prompts dificiles que requieren razonamiento; es necesario elegir el modo segun la tarea.
- Restricciones de licencia: la NVIDIA Nemotron Open Model License no es una licencia de codigo abierto estandar; es necesario revisar sus terminos para uso comercial y redistribucion.
- Repositorio de staging: esta ficha corresponde a una publicacion de terceros (enhasasuzu), no al repositorio oficial de NVIDIA; para produccion debe usarse el repositorio oficial nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16.
- Requiere custom_code en transformers para cargar la arquitectura nemotron_h; no es compatible con cargadores genericos sin soporte.
- El modelo esta optimizado para casos de uso en el borde; para tareas de alta complejidad puede ser superado por modelos de mayor tamano.
- Fecha de corte de datos septiembre de 2024: no conoce eventos posteriores.

## Enlaces

- Repositorio de staging en Hugging Face: https://huggingface.co/enhasasuzu/NVIDIA-Nemotron-3-Nano-4B-BF16-staging
- Repositorio oficial en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Model card oficial (PDF): https://developer.nvidia.com/downloads/assets/ace/model_card/nemotron_3_nano_4b.pdf
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper Nemotron Elastic: https://arxiv.org/pdf/2511.16664
- Paper Nemotron-H: https://arxiv.org/abs/2504.03624
- Informe tecnico NVIDIA Nemotron Nano 2: https://research.nvidia.com/labs/adlr/files/NVIDIA-Nemotron-Nano-2-Technical-Report.pdf
- NeMo-Skills: https://github.com/NVIDIA/NeMo-Skills/tree/main/docs
- Orak: https://github.com/krafton-ai/Orak
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
