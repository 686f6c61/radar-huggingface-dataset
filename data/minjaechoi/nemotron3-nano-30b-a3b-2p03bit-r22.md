# minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22

## Resumen

Nemotron-3-Nano-30B-A3B es un modelo de lenguaje desarrollado por NVIDIA Corporation, publicado como parte de la familia Nemotron de pesos abiertos. Se trata de un modelo unificado para tareas de razonamiento y de generacion directa: por defecto genera una traza de razonamiento antes de dar la respuesta final, pero ese comportamiento puede desactivarse mediante un flag de la plantilla de chat, con una ligera perdida de precision en prompts dificiles. La ficha que se analiza aqui, `minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22`, es una publicacion de la comunidad (autor `minjaechoi`, 0 descargas y 0 likes en el momento de la consulta) derivada del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.

Tecnicamente emplea una arquitectura hibrida de mezcla de expertos (MoE): 23 capas Mamba-2 y MoE mas 6 capas de atencion, con 128 expertos y 1 experto compartido por capa MoE y 6 expertos activados por token. Declara 3,5B parametros activos sobre un total de 30B, y el recuento real de safetensors del repositorio es de 31.577.937.344 parametros. Los idiomas soportados son ingles, aleman, espanol, frances, italiano y japones.

Su relevancia actual radica en la relacion entre coste de inferencia y capacidad: al activar solo 3,5B parametros por token, ofrece un perfil de latencia y throughput propio de un modelo mucho mas pequeno, con resultados competitivos en razonamiento matematico y agentico segun la model card (por ejemplo, 89,1 en AIME25 sin herramientas y 68,3 en LiveCodeBench v6). El corte de datos de preentrenamiento es del 25 de junio de 2025 y el de postentrenamiento del 28 de noviembre de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 23 capas Mamba-2 y MoE + 6 capas de atencion; denominada `nemotron_h` en la libreria |
| Parametros totales | 31.577.937.344 (recuento real de safetensors); la model card declara 30B |
| Parametros activos | 3,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El nombre del repositorio indica 2,03 bits (`2p03bit`); no se detallan los esquemas concretos ni los formatos de cuantizacion disponibles |
| Idiomas soportados | Ingles, aleman, espanol, frances, italiano y japones |
| Licencia | NVIDIA Nemotron Open Model License (campo `license: other`); la model card indica que esta listo para uso comercial |
| Formato de pesos | safetensors, libreria transformers, requiere `custom_code` |
| Tamano del repositorio | 63,2 GB |
| Pipeline | text-generation |
| Fecha de corte (preentrenamiento) | 25 de junio de 2025 |
| Fecha de corte (postentrenamiento) | 28 de noviembre de 2025 |

Nota sobre el tamano: 31.577.937.344 parametros en BF16 equivalen a aproximadamente 63,2 GB, cifra que coincide con el tamano del repositorio pero no con una conversion de 2,03 bits por parametro (que daria del orden de 8 GB). No se dispone de informacion adicional que permita resolver esta discrepancia; conviene verificar el contenido real del repositorio antes de desplegarlo.

## Arquitectura y entrenamiento

El modelo combina capas de espacio de estados (Mamba-2) con capas de atencion clasica dentro de un esquema de mezcla de expertos. En concreto, la model card describe 23 capas Mamba-2 y MoE junto a 6 capas de atencion, con 128 expertos mas 1 experto compartido por capa MoE y 6 expertos activados por token. El resultado es un modelo de unos 30B parametros totales que solo activa 3,5B por token, lo que reduce el coste computacional de la decodificacion sin reducir drasticamente el numero de parametros almacenados. El identificador de arquitectura asociado en Hugging Face es `nemotron_h`.

NVIDIA lo presenta como un modelo unificado de razonamiento y no razonamiento: el modo con traza de razonamiento se controla desde la plantilla de chat, y desactivarlo produce respuestas mas directas con una ligera caida de precision en tareas que requieren razonamiento. El entrenamiento se realizo desde cero sobre un conjunto de datos propietarios de NVIDIA, entre los que la ficha lista `Nemotron-Pretraining-Code-v1/v2`, `Nemotron-CC-v2`, `Nemotron-CC-v2.1`, `Nemotron-CC-Math-v1`, `Nemotron-CC-Code-v1`, `Nemotron-Pretraining-SFT-v1`, `Nemotron-Pretraining-Specialized-v1`, `Nemotron-Competitive-Programming-v1`, `Nemotron-Math-v2`, `Nemotron-Math-Proofs-v1`, `Nemotron-Agentic-v1`, `Nemotron-Instruction-Following-Chat-v1`, `Nemotron-Science-v1` y `Nemotron-3-Nano-RL-Training-Blend`. Este ultimo nombre sugiere una fase de aprendizaje por refuerzo en el postentrenamiento, si bien la model card no detalla el algoritmo ni los hiperparametros. La model card menciona textualmente que los idiomas soportados fueron "improved using Qwen", sin aportar mas detalle sobre ese proceso. No se especifica el numero total de tokens de entrenamiento ni la composicion porcentual del dataset.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia.
- Razonamiento explicito configurable: puede emitir una traza de razonamiento antes de la respuesta final o responder directamente si se desactiva el flag correspondiente.
- Razonamiento matematico de competicion: la model card reporta 89,1 en AIME25 sin herramientas y 99,2 con herramientas.
- Pruebas formales: 50,0 en MiniF2F pass@1 y 79,9 en pass@32, el mejor resultado de la comparativa publicada por NVIDIA.
- Generacion y comprension de codigo: 68,3 en LiveCodeBench v6 y 33,3 en SciCode (subtask).
- Uso de herramientas: los resultados "with tools" de AIME25, GPQA y HLE confirman soporte de tool calling o razonamiento asistido por herramientas, aunque la model card no detalla el protocolo de llamada.
- Capacidades agenticas y de terminal: evaluado en Terminal Bench (subconjunto hard) con 8,5.
- Capacidades multilingues en ingles, aleman, espanol, frances, italiano y japones.
- Conocimiento general: 78,3 en MMLU-Pro.
- No se menciona soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistencia al cliente multilingue: el modelo cubre espanol, ingles, aleman, frances, italiano y japones, por lo que una misma instancia puede atender conversaciones multi-turno en los seis idiomas sin enrutado a modelos separados. La longitud de contexto no esta documentada, asi que conviene validarla antes de fijar el tamano de las sesiones.
- Razonamiento matematico asistido por herramientas: con 99,2 en AIME25 en modo con herramientas, es adecuado para integrarse con un interprete de Python o un solucionador simbologico externo en pipelines de resolucion de problemas cuantitativos.
- Generacion de codigo en produccion: el soporte de tool calling y los 68,3 puntos en LiveCodeBench v6 lo hacen utilizable en asistentes de IDE, generacion de tests o revision de parches dentro de flujos de CI/CD.
- Agentes de automatizacion de terminal y operaciones: los 8,5 puntos en Terminal Bench (subconjunto hard) indican capacidad para tareas de shell de dificultad alta, apta para prototipos de agentes DevOps con supervision humana.
- Verificacion de demostraciones y pruebas formales: con 79,9 en MiniF2F pass@32, encaja en asistentes de formalizacion en Lean o Isabelle donde se generan multiples candidatos y se filtran con el verificador.
- Razonamiento cientifico y tecnico: 33,3 en SciCode (subtask) y el uso de datasets especificos de ciencia (`Nemotron-Science-v1`) lo orientan a borradores de codigo cientifico y explicacion de resultados.
- Despliegue con presupuesto de latencia ajustado: al activar 3,5B parametros por token, es candidato para servicios con throughput alto donde un modelo denso de 30B resultaria demasiado lento, siempre que el hardware elegido soporte el peso completo.
- Destilacion y generacion de datos sinteticos: la combinacion de modo razonamiento activable y licencia que permite uso comercial lo hace apto para producir trazas de razonamiento etiquetadas a gran escala.

## Benchmarks y rendimiento

Datos publicados por NVIDIA en la model card, comparados con Qwen3-30B-A3B-Thinking-2507 y GPT-OSS-20B:

| Tarea | NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| MMLU-Pro | 78,3 | 80,9 | 75,0 |
| AIME25 (sin herramientas) | 89,1 | 85,0 | 91,7 |
| AIME25 (con herramientas) | 99,2 | no disponible | 98,7 |
| GPQA (sin herramientas) | 73,0 | 73,4 | 71,5 |
| GPQA (con herramientas) | 75,0 | no disponible | 74,2 |
| LiveCodeBench (v6 2025-08 - 2025-05) | 68,3 | 66,0 | 61,0 |
| SciCode (subtask) | 33,3 | 33,0 | 34,0 |
| HLE (sin herramientas) | 10,6 | 9,8 | 10,9 |
| HLE (con herramientas) | 15,5 | no disponible | 17,3 |
| MiniF2F pass@1 | 50,0 | 5,7 | 12,1 |
| MiniF2F pass@32 | 79,9 | 16,8 | 43,0 |
| Terminal Bench (subconjunto hard) | 8,5 | 5,0 | 6,0 |

Los resultados corresponden al modelo base en BF16 segun NVIDIA. No hay datos de benchmarks publicados para la variante concreta cuantizada de `minjaechoi`, por lo que el rendimiento de esta revision del repositorio no esta verificado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: unos 63 GB solo de pesos (31,58B parametros a 2 bytes), mas cache KV y activaciones. Estimacion aritmetica a partir del recuento de parametros.
- VRAM estimada en 8 bits: del orden de 32 GB de pesos.
- VRAM estimada en 4 bits: del orden de 16-18 GB de pesos.
- Si la cuantizacion de 2,03 bits indicada en el nombre del repositorio fuese efectiva, los pesos ocuparian teoricamente unos 8 GB; el tamano real del repositorio (63,2 GB) no respalda esa cifra.
- GPU recomendadas para BF16: una H100 de 80 GB o configuraciones multi-GPU con A100 de 40/80 GB. No cabe en GPUs de consumo en BF16.
- GPU de consumo: en 4 bits podria caber en una RTX 4090 (24 GB) o RTX 5090, siempre que exista una conversion compatible con el runtime elegido; en 8 bits requeriria GPUs de 48 GB o mas (por ejemplo, RTX 6000 Ada o L40S).
- Opciones de despliegue: al usar arquitectura `nemotron_h` con `custom_code`, la via directa es transformers con `trust_remote_code=True`; tambien vLLM y TGI si incorporan soporte para la arquitectura. El soporte en llama.cpp u Ollama no esta confirmado en la informacion disponible. NVIDIA ofrece el modelo a traves de build.nvidia.com y su stack NIM.
- Latencia y throughput: no disponible. Como referencia cualitativa, los 3,5B parametros activos por token reducen el coste de decodificacion frente a un modelo denso de 30B, pero depende del backend y del hardware.

## Comparativa con modelos similares

Comparativa limitada a los datos disponibles en la informacion proporcionada; los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Resultados destacados |
|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B | 30B totales / 3,5B activos | no disponible | NVIDIA Nemotron Open Model License (uso comercial) | AIME25 89,1; LiveCodeBench v6 68,3; MiniF2F pass@32 79,9; Terminal Bench 8,5 |
| Qwen3-30B-A3B-Thinking-2507 | no disponible | no disponible | no disponible | MMLU-Pro 80,9; AIME25 85,0; LiveCodeBench v6 66,0; MiniF2F pass@32 16,8; Terminal Bench 5,0 |
| GPT-OSS-20B | no disponible | no disponible | no disponible | MMLU-Pro 75,0; AIME25 91,7; LiveCodeBench v6 61,0; MiniF2F pass@32 43,0; Terminal Bench 6,0 |

Lectura de los datos: Nemotron-3-Nano-30B-A3B domina en pruebas formales (MiniF2F), codigo competitivo (LiveCodeBench v6) y tareas agenticas de terminal, mientras que Qwen3-30B-A3B-Thinking-2507 mantiene ventaja en conocimiento general (MMLU-Pro) y GPT-OSS-20B en aritmetica de competicion sin herramientas (AIME25) y en HLE. No hay informacion disponible sobre contexto, licencia o numero de parametros de los modelos de comparacion en el material proporcionado.

## Limitaciones y advertencias

- La publicacion analizada es una revision de la comunidad (`minjaechoi`), no oficial de NVIDIA, con 0 descargas y 0 likes: no hay evidencia publica de validacion de calidad ni de que los pesos correspondan a la cuantizacion anunciada.
- Discrepancia de tamano: el repositorio ocupa 63,2 GB, coherente con pesos BF16 y no con 2,03 bits por parametro. Verificar los ficheros antes de cualquier despliegue en produccion.
- Requiere `custom_code` y `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio: riesgo de seguridad a evaluar.
- Los benchmarks publicados corresponden al modelo base de NVIDIA en BF16, no a esta variante; el rendimiento tras cuantizacion agresiva puede degradarse, especialmente en matematicas y codigo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; el modelo ademas genera trazas de razonamiento que pueden contener pasos plausibles pero incorrectos sin que la respuesta final lo refleje.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en el material proporcionado.
- Cobertura idiomatica limitada a ingles, aleman, espanol, frances, italiano y japones; no se declara soporte para catalan, gallego, euskera ni otros idiomas.
- Fechas de corte: preentrenamiento el 25 de junio de 2025 y postentrenamiento el 28 de noviembre de 2025; cualquier conocimiento posterior es inexistente.
- Licencia: NVIDIA Nemotron Open Model License, registrada como `other`. La model card afirma que el modelo esta listo para uso comercial, pero las condiciones concretas (atribucion, restricciones de redistribucion, clausulas de uso aceptable) deben revisarse en el texto completo de la licencia antes de integrarlo en un producto.
- Longitud de contexto no documentada: limita la planificacion de aplicaciones con documentos largos, ya que no puede confirmarse la ventana real ni su comportamiento en el extremo.
- No se documentan requisitos de hardware oficiales, latencias ni throughput, por lo que las estimaciones de VRAM de esta ficha son calculos derivados del recuento de parametros.

## Enlaces

- Repositorio analizado: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r22
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper (arXiv 2512.20848): https://arxiv.org/abs/2512.20848
- Paper (arXiv 2512.20856): https://arxiv.org/abs/2512.20856
- Demo en build.nvidia.com: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de postentrenamiento v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian al sitio partslink24 y no guardan relacion con el contenido de esta ficha.
