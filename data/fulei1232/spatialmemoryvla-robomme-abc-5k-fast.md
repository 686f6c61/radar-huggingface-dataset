# fulei1232/SpatialMemoryVLA-RoboMME-ABC-5k-fast

## Resumen

SpatialMemoryVLA-RoboMME-ABC-5k-fast es un artefacto de entrenamiento publicado en HuggingFace por el usuario fulei1232 que contiene los resultados de una ablación A/B/C de 5.000 pasos sobre el modelo RoboMME, una arquitectura de vision-language-action (VLA) orientada a manipulación robótica con memoria espacial. No se trata de un modelo listo para inferencia conversacional, sino de un conjunto de checkpoints, estados de optimizador, configuraciones y métricas en JSONL que documentan el efecto de dos componentes concretos: el forzado espacial (spatial forcing) y la memoria espacial (spatial memory).

La arquitectura combina tres piezas: un backbone de lenguaje Llama 2 7B congelado salvo su capa final, un backbone de visión también congelado y un modelo de acción DiT-L (Diffusion Transformer Large) que genera las acciones. Durante el entrenamiento se emplea un profesor VGGT-1B congelado para el forzado espacial. La dimensión de acción es 8 y el horizonte de predicción es 16 pasos, con una longitud de memoria de 16 y un tamaño de grupo de 16. El repositorio ocupa 591,1 GB, lo que refleja que incluye pesos, estados de optimizador y artefactos de FSDP para tres grupos de entrenamiento.

Su relevancia es metodológica más que de producto: permite reproducir y auditar hasta qué punto el forzado espacial y la memoria espacial contribuyen a la pérdida final en una tarea de VLA robótica, con una configuración de entrenamiento completamente especificada (BF16, FSDP full-shard, batch global 32, LR 2e-5 constante, semilla 42) sobre cuatro NVIDIA A100 de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbone de lenguaje Llama 2 7B (congelado salvo capa final) + backbone de visión congelado + modelo de acción DiT-L (Diffusion Transformer) + memoria espacial |
| Parametros totales | no disponible (el backbone de lenguaje es Llama 2 7B; no se especifica el total del sistema completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se define longitud de memoria = 16, no ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en BF16/FP32 según el estado de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints PyTorch (`.pt`) con estado de optimizador, configuración, estadísticas de dataset, métricas JSONL y log de eventos |
| Dimension de accion / horizonte | 8 / 16 |
| Longitud de memoria / tamano de grupo | 16 / 16 |
| Repositorio | 591,1 GB (tres grupos A/B/C con checkpoint final, estado de optimizador y métricas) |

## Arquitectura y entrenamiento

El sistema sigue un diseño VLA modular. El componente de percepción es un backbone de visión congelado; el componente semántico es Llama 2 7B, también congelado excepto su última capa; y el componente generativo de acción es un DiT-L de difusión que produce trayectorias de dimensión 8 sobre un horizonte de 16. La memoria espacial se estructura en grupos de tamaño 16 con longitud de memoria 16, lo que sugiere un mecanismo de agregación de observaciones pasadas para mantener coherencia espacial en tareas de manipulación de largo horizonte. El forzado espacial se implementa destilando representaciones desde un profesor VGGT-1B congelado.

El entrenamiento se ejecutó sobre cuatro NVIDIA A100 de 80 GB con precisión BF16 y FSDP en modo full-shard, batch por dispositivo 8 y batch global 32 sin acumulación de gradientes, learning rate constante de 2e-5, 5.000 pasos de optimizador por grupo y semilla 42. La inicialización partió de `memvla-libero-spatial.pt`. Las tres variantes son: A (`memoryvla`), sin forzado espacial ni memoria espacial; B (`spatial_forcing`), con forzado espacial mediante VGGT-1B congelado y sin memoria espacial; y C (`spatial_memory`), con ambos componentes activos. No se documenta RLHF, DPO ni ningún proceso de alineación por preferencias.

## Capacidades

- Generación de acciones robóticas continuas de dimensión 8 con horizonte de predicción de 16 pasos, mediante un cabezal de difusión DiT-L.
- Percepción visual integrada a través de un backbone de visión congelado, orientada a entradas de tipo observación robótica.
- Memoria espacial sobre secuencias de 16 observaciones, con agrupación en bloques de 16, para tareas que requieren recordar la disposición del entorno.
- Comprensión semántica y de instrucciones heredada del backbone Llama 2 7B, aunque congelado y únicamente con la capa final ajustada.
- Forzado espacial mediante destilación desde el profesor VGGT-1B congelado (solo en las variantes B y C).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento explícito, audio ni visión conversacional.

## Casos de uso

- Investigación en manipulación robótica: el artefacto permite reproducir la ablación A/B/C y medir de forma controlada cuánto aporta la memoria espacial frente al forzado espacial en la pérdida final, con una configuración de entrenamiento totalmente especificada.
- Reentrenamiento con presupuesto reducido: al publicarse el estado de optimizador y la configuración exacta, un equipo puede reanudar desde el paso 5.000 y extender el entrenamiento en lugar de partir de cero, ahorrando el coste de las primeras 5.000 iteraciones.
- Auditoría metodológica de VLA: los JSONL de métricas y el log de eventos de checkpoint permiten reconstruir curvas de pérdida y verificar la reproducibilidad con semilla 42 y FSDP full-shard.
- Ablación de componentes de memoria en robótica: sirve como línea base para comparar variantes que activen o desactiven memoria y forzado espacial sobre la misma inicialización `memvla-libero-spatial.pt`.
- Estudio de destilación desde modelos de geometría: la variante B y C usan VGGT-1B congelado como profesor, por lo que el artefacto es útil para analizar la transferencia de representaciones geométricas a cabezales de acción.
- Punto de partida para políticas de acción con horizonte corto: el horizonte de 16 y la dimensión de acción 8 encajan con tareas de control tipo LIBERO, útiles para experimentar en entornos simulados de manipulación.
- Docencia y formación en VLA: al ser checkpoints pesados pero con configuración explícita, se puede usar como material para explicar el coste real de entrenar un VLA en cuatro A100 de 80 GB.
- Base para comparativas de eficiencia: permite medir el coste en almacenamiento (591 GB) y en cómputo de mantener estados de optimizador para tres grupos frente a publicar solo pesos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta la pérdida total final de entrenamiento por grupo:

| Grupo | Variante | Paso final | Perdida total final | Checkpoint |
|---|---|---:|---:|---|
| A | `memoryvla` (sin forzado espacial, sin memoria espacial) | 5.000 | 0,014218 | `A/checkpoints/step-005000-epoch-00-loss=0.0142.pt` |
| B | `spatial_forcing` (forzado espacial, sin memoria espacial) | 5.000 | 0,014952 | `B/checkpoints/step-005000-epoch-00-loss=0.0150.pt` |
| C | `spatial_memory` (forzado espacial y memoria espacial) | 5.000 | 0,016509 | `C/checkpoints/step-005000-epoch-00-loss=0.0165.pt` |

No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks específicos de robótica como LIBERO o RoboMME en la información proporcionada. La pérdida de entrenamiento no es un indicador directo de éxito en tarea y no debe interpretarse como resultado de evaluación.

## Requisitos de hardware

- Entrenamiento original: 4 × NVIDIA A100 de 80 GB, precisión BF16, FSDP full-shard, batch por dispositivo 8 y batch global 32.
- Almacenamiento: el repositorio ocupa 591,1 GB; prever al menos ese espacio, más margen para descomprimir o convertir checkpoints.
- Memoria de inferencia: no disponible con precisión; el sistema incluye un backbone Llama 2 7B más un cabezal DiT-L, por lo que se sitúa en la franja de modelos de 7B-10B más el coste del módulo de difusión.
- GPU consumer: no confirmado. Un backbone de 7B en BF16 requiere del orden de 14-16 GB solo para pesos, más el cabezal de acción y las activaciones de memoria (16 observaciones); una GPU de 24 GB podría ser ajustada y una de 48 GB es más segura, pero el autor no publica requisitos de inferencia.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El artefacto son checkpoints `.pt` de PyTorch y el código de implementación vive en el repositorio `fulei1232/SpatialMemoryVLA`, por lo que el despliegue requiere el código propio del proyecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada (ni parámetros totales, ni benchmarks, ni licencia) que permitan una comparación rigurosa con alternativas como OpenVLA, RT-2 o π0.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| SpatialMemoryVLA-RoboMME-ABC-5k-fast | no disponible (backbone Llama 2 7B) | no disponible | no disponible | Checkpoints `.pt` en HuggingFace | Pérdidas de entrenamiento A/B/C |
| OpenVLA | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |
| RT-2 | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |
| π0 | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web enlaces ni fichas de estos modelos; la comparativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de ablación de investigación, no un asistente conversacional ni un modelo de texto listo para producción.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Sin benchmarks de tarea: solo se publican pérdidas de entrenamiento, que no permiten afirmar tasas de éxito en manipulación ni comparar con otros VLA.
- Riesgo de alucinación: no evaluado; el backbone Llama 2 7B congelado conserva los sesgos y limitaciones de su entrenamiento original, y el ajuste se limita a la capa final.
- Idiomas soportados: no disponibles; no se documenta evaluación multilingüe.
- Contexto: no se especifica la ventana de contexto textual; solo se documenta una longitud de memoria de 16 observaciones, insuficiente para tareas que requieran historiales largos.
- Tamaño del artefacto: 591,1 GB dificultan la descarga, el almacenamiento y la reproducibilidad en entornos con recursos limitados; los checkpoints intermedios se omitieron deliberadamente.
- Datos de entrenamiento no declarados: no se detalla la composición del dataset, por lo que no puede evaluarse el sesgo de dominio ni la generalización fuera de la distribución de entrenamiento.
- Fecha de creación del repositorio: 15 de septiembre de 2026, según los metadatos de HuggingFace; conviene verificar la vigencia del artefacto antes de reutilizarlo.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fulei1232/SpatialMemoryVLA-RoboMME-ABC-5k-fast
- Repositorio de implementación y scripts de lanzamiento: `fulei1232/SpatialMemoryVLA` (referenciado en la model card; no se ha encontrado URL directa en la búsqueda web)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
