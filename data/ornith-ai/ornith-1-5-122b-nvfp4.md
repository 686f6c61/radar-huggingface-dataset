# ornith-ai/Ornith-1.5-122B-NVFP4

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo Mixture of Experts publicado por ornith-ai, presentado como la version mas capable de la familia Ornith-1.5. Segun la model card, se construye sobre Ornith-1.0 (que a su vez parte de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training) y amplia el bucle de auto-mejora desde la optimizacion de scaffolds y rollouts hasta la optimizacion conjunta de generacion de tareas, construccion de arneses y rollouts de soluciones. El repositorio concreto es la variante cuantizada NVFP4, publicada con licencia MIT y etiquetada como `image-text-to-text`, lo que apunta a capacidades multimodales ademas de generacion de texto.

El dato de parametros del safetensors es de 63.972.847.344 (~64B), mientras que la model card y el nombre del repositorio hablan de "122B"; conviene tratar la cifra de 122B como denominacion comercial de la familia y la de ~64B como el recuento real de pesos almacenados. La model card no detalla la longitud de contexto, el numero de parametros activos ni los idiomas soportados.

Su relevancia actual es doble: por un lado, compite en tareas de codigo agentico (TerminalBench 2.1, CyberGym, NL2Repo) con modelos de mayor tamano segun los datos del autor; por otro, se distribuye ya cuantizado en NVFP4 mediante NVIDIA ModelOpt, lo que reduce el coste de despliegue frente a pesos en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe` en el repositorio) |
| Parametros totales | 63.972.847.344 (~64B) segun safetensors; la model card usa la denominacion "122B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante, formato de NVIDIA) generado con ModelOpt; el repositorio incluye ademas la etiqueta `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modalidad | texto e imagen-texto (`text-generation`, `image-text-to-text`) |
| Tamano del repositorio | 77,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), segun la etiqueta `qwen3_5_moe` y la propia descripcion de la model card, que califica al modelo como "122B MOE". El linaje declarado es Ornith-1.0, desarrollado sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el numero de expertos ni la relacion de parametros activos por token.

La innovacion metodologica declarada es un bucle de auto-mejora end-to-end: en lugar de depender de un conjunto fijo de tareas humanas y arneses disenados a mano, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias eficaces para resolverlas y mejora la politica mediante aprendizaje por refuerzo, optimizando de forma conjunta generacion de tareas, construccion de scaffold y rollouts de soluciones. La model card remite al blog del autor para el detalle del diseno de tareas, arneses y recompensas; no se aportan datos sobre uso de RLHF, DPO ni sobre decodificacion especulativa o mecanismos de atencion alternativa.

## Capacidades

- Generacion de texto conversacional multi-turno (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento y resolucion de tareas de codigo agentico: la model card reporta resultados en TerminalBench 2.1, CyberGym, NL2Repo y SWE-bench Pro.
- Ciberseguridad ofensiva/defensiva evaluada con CyberGym (80 puntos reportados por el autor).
- Generacion de repositorios completos a partir de lenguaje natural (NL2Repo, 51,2 reportado).
- Procesamiento de imagen y texto (`image-text-to-text`), lo que implica entrada multimodal; el alcance exacto (VQA, OCR, grounding) no esta documentado en la informacion disponible.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y con la libreria transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara lista de idiomas.
- Modo "thinking" explicito, audio o video: no disponible.

## Casos de uso

- Agente de terminal para automatizacion de tareas de sistema: el modelo puede operar en bucles de ejecucion de comandos y correccion de errores, terreno donde el autor reporta 81,2 en TerminalBench 2.1; encaja en pipelines de mantenimiento, aprovisionamiento y depuracion de entornos Linux.
- Generacion de repositorios y scaffolds de proyecto: a partir de una especificacion en lenguaje natural, produce la estructura de ficheros y el codigo inicial (NL2Repo, 51,2), util para arrancar prototipos o migraciones de codigo legacy.
- Auditoria y pruebas de seguridad: con 80 puntos en CyberGym, es adecuado para tareas de analisis de vulnerabilidades, generacion de pruebas de penetracion controladas y revision de superficies de ataque en entornos con autorizacion explicita.
- Asistente de codigo en produccion con cuantizacion NVFP4: al distribuirse ya cuantizado, permite servir el modelo con huella de memoria reducida frente a bf16, integrandose en pipelines de CI/CD para revision de parches y generacion de tests.
- Procesamiento de documentacion tecnica con imagenes: la modalidad imagen-texto permite extraer informacion de diagramas de arquitectura, capturas de paneles o documentacion escaneada y combinarla con texto para responder consultas.
- Investigacion en RL y auto-mejora: el modelo sirve como referencia para estudiar bucles de generacion de tareas y construccion de scaffolds, comparando el comportamiento de la politica antes y despues del entrenamiento por refuerzo.
- Base para fine-tuning especifico de dominio: la licencia MIT y el formato safetensors facilitan adaptaciones sobre el modelo cuantizado o sobre los pesos originales de la familia.

## Benchmarks y rendimiento

Resultados reportados por el autor del modelo en la model card (no verificados de forma independiente). La fila de SWE-bench Pro aparece en la model card pero los valores no estan disponibles en la informacion proporcionada.

| Benchmark | Ornith-1.5-122B | Qwen3.8-Flash-Next (125B) | Qwen3.8 (27B dense) | Nemotron 3.5 Super VL (120B) | DeepSeek-V4-Flash-0731 (284B) | Beam (501B) |
|---|---|---|---|---|---|---|
| TerminalBench 2.1 | 81,2 | 83,4 | 71,9 | 66,7 | 82,7 | 80,1 |
| CyberGym | 80 | 78 | 55 | 34 | 76,7 | 59 |
| NL2Repo | 51,2 | 45,2 | 42,3 | 21 | 54,2 | 49,4 |
| SWE-bench Pro (no-hack) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 63,97B parametros en NVFP4 (4 bits) el limite teorico de pesos ronda los 32 GB, pero el repositorio ocupa 77,7 GB, por lo que hay que prever margen adicional (embeddings, lm_head, escalas de cuantizacion y cache KV). Estimacion practica: 40-80 GB segun el contexto y el lote.
- GPU de datacenter recomendadas: H100 80 GB, A100 80 GB o B200. La model card afirma que el modelo esta disenado para despliegue eficiente en una sola GPU.
- GPU de consumo: una RTX 4090 (24 GB) no es suficiente por si sola para los pesos completos; serian necesarias dos o mas GPU (por ejemplo, 2x RTX 4090 = 48 GB) o una RTX 5090 de 32 GB solo si el peso real se aproxima al limite teorico de 4 bits. No hay datos confirmados de ejecucion en consumer.
- NVFP4 es un formato de NVIDIA con soporte nativo en arquitecturas Blackwell; en GPU mas antiguas puede requerir emulacion o de-cuantizacion, con la consiguiente perdida de ventaja. Este punto no se detalla en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada) y ModelOpt (herramienta de cuantizacion usada). Soporte en vLLM, TensorRT-LLM, TGI, llama.cpp u Ollama: no disponible. No se publican pesos GGUF en la informacion consultada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa basada en los modelos incluidos en la tabla de benchmarks del autor. Los datos de parametros, contexto, licencia y disponibilidad de esos comparadores no estan en la informacion proporcionada.

| Modelo | Parametros | Contexto | TerminalBench 2.1 | CyberGym | NL2Repo | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B (NVFP4) | ~64B reales (denominado 122B) | no disponible | 81,2 | 80 | 51,2 | MIT |
| Qwen3.8-Flash-Next | 125B | no disponible | 83,4 | 78 | 45,2 | no disponible |
| Qwen3.8 | 27B dense | no disponible | 71,9 | 55 | 42,3 | no disponible |
| Nemotron 3.5 Super VL | 120B | no disponible | 66,7 | 34 | 21 | no disponible |
| DeepSeek-V4-Flash-0731 | 284B | no disponible | 82,7 | 76,7 | 54,2 | no disponible |
| Beam | 501B | no disponible | 80,1 | 59 | 49,4 | no disponible |

Lectura: Ornith-1.5-122B lidera en CyberGym y queda por detras de DeepSeek-V4-Flash-0731 en NL2Repo y de Qwen3.8-Flash-Next y DeepSeek-V4-Flash-0731 en TerminalBench 2.1, con un tamano declarado notablemente menor que DeepSeek-V4-Flash (284B) y Beam (501B).

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre y la model card indican 122B, pero el recuento de safetensors es de 63.972.847.344 parametros (~64B). Verificar antes de dimensionar infraestructura.
- Ausencia de datos clave: no se publican longitud de contexto, parametros activos, idiomas soportados ni composicion del dataset de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Benchmarks autodeclarados: todos los resultados proceden del autor, sin verificacion externa; los conjuntos de evaluacion (TerminalBench 2.1, CyberGym, NL2Repo, SWE-bench Pro no-hack) deben reproducirse antes de tomar decisiones.
- Afirmaciones no verificadas: la model card menciona despliegue en una sola GPU e incluso una variante "Mobile" para dispositivos moviles, extremo que no se sostiene con los 77,7 GB del repositorio y que no se detalla.
- Riesgo de alucinacion: el entrenamiento por refuerzo sobre tareas autogeneradas puede producir sobreajuste a los arneses y scaffolds vistos durante el entrenamiento, con degradacion en dominios fuera de distribucion.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o seguridad; al derivar de Qwen3.5 y Gemma4, hereda los sesgos de sus preentrenamientos.
- Licencia: el repositorio declara MIT, lo que en principio permite uso comercial; sin embargo, al declararse un desarrollo sobre Qwen3.5 y Gemma4, conviene revisar los terminos de esos modelos upstream antes de un despliegue comercial, ya que algunos modelos de origen no son MIT.
- Cuantizacion NVFP4: introduce perdida de precision frente a bf16 y su ventaja depende de hardware compatible; no hay datos publicados de degradacion por cuantizacion.
- Idiomas: sin lista declarada, no se puede asumir un rendimiento solido en castellano sin evaluacion propia.
- Madurez: el repositorio tiene 309 descargas y 18 likes en la fecha de consulta, con una ventana de publicacion de un dia entre creacion y ultima actualizacion; ecosistema y soporte de terceros aun limitados.

## Enlaces

- HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-122B-NVFP4
- Blog del autor sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Paper, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
