# pawanpaudel93/gr00t-n1.7-libero-spatial-fp16-ov

## Resumen

GR00T N1.7 LIBERO (libero_spatial) en formato OpenVINO es una conversión del modelo visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-LIBERO`, empaquetada como `policy_package` para el motor `ov-policy` de Cascadia. El modelo original lo desarrolla NVIDIA y está orientado a robótica: recibe imágenes de cámara (vista principal y vista de muñeca), el estado del robot y una instrucción de tarea en lenguaje natural, y emite una secuencia de acciones motoras. Esta versión concreta la publica el usuario `pawanpaudel93` y está optimizada para ejecución en CPU y GPU Intel mediante OpenVINO.

La relevancia de este paquete es que traslada un modelo VLA de NVIDIA a un runtime de inferencia ligero y multiplataforma como OpenVINO, con pesos en fp16 y formas estáticas, lo que permite desplegarlo en hardware Intel (incluidas GPU integradas como Arc 140V) sin depender de PyTorch. Según la model card, el paquete alcanza 27/30 en la tarea `libero_spatial` del benchmark LIBERO, frente a 26/30 del modelo PyTorch de NVIDIA, con una latencia de 160-240 ms por chunk de 16 pasos.

No se dispone de información sobre el número de parámetros, la longitud de contexto en tokens ni los idiomas soportados más allá de lo que implica el uso de instrucciones de tarea codificadas en un tensor `task` de 64 elementos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada `task` de 64 elementos; sin contexto textual medido en tokens) |
| Tipos de cuantizacion | fp16 (pesos); sin otras variantes publicadas |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | OpenVINO IR (fp16, formas estáticas, puertos con nombre); repo de 6,3 GB |

## Arquitectura y entrenamiento

El modelo base `nvidia/GR00T-N1.7-LIBERO` es un modelo visión-lenguaje-acción de NVIDIA construido sobre NVIDIA Cosmos, según indica el aviso de licencia. La arquitectura interna (tipo de transformer, mecanismo de atención, número de capas) no se detalla en la información proporcionada. El paquete OpenVINO conserva la lógica del modelo original pero la exporta como un único IR con formas estáticas y puertos con nombre, lo que fija las dimensiones de entrada y salida.

Las entradas del grafo son: `images.image` con forma [3, 256, 256], `images.wrist_image` con forma [3, 256, 256] (ambas uint8 RGB, redimensionadas por el cliente), `state` con forma [8] (estado del robot), `task` con forma [64] (instrucción de tarea codificada) y `noise` con forma [40, 132] (ruido de muestreo). La salida es `action` con forma [16, 7], es decir, un chunk de 16 pasos de acción con 7 dimensiones por paso. No se dispone de datos sobre el volumen de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras para robótica a partir de observaciones visuales y estado del robot.
- Procesamiento conjunto de dos vistas de cámara (principal y muñeca) más el estado proprioceptivo.
- Condicionamiento por instrucción de tarea codificada en un tensor de 64 elementos.
- Producción de chunks de acción de 16 pasos con 7 dimensiones por paso (`action` [16, 7]).
- Muestreo estocástico mediante entrada de ruido (`noise` [40, 132]), lo que sugiere un esquema de generación tipo difusión o flow matching, aunque no se detalla en la información disponible.
- Evaluado en el benchmark LIBERO, concretamente en la suite `libero_spatial`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo recibe imágenes de cámara y estado del robot y emite acciones de 7 dimensiones, adecuado para brazos manipuladores en tareas de alcance espacial evaluadas en `libero_spatial`.
- Despliegue en hardware Intel sin GPU dedicada: al estar exportado a OpenVINO en fp16, puede ejecutarse en CPU Intel o en GPU integradas como Arc 140V, lo que facilita prototipos en equipos de sobremesa o portátiles.
- Investigación en políticas VLA: sirve como referencia reproducible para comparar el rendimiento de un runtime OpenVINO frente a la implementación PyTorch original (27/30 frente a 26/30 en LIBERO).
- Evaluación de robustez en control de robots: la latencia de 160-240 ms por chunk de 16 pasos permite estimar la frecuencia de control alcanzable en bucles de política cerrados.
- Integración en pipelines de simulación robótica: el paquete puede conectarse a entornos simulados que alimenten las entradas `images.image`, `images.wrist_image` y `state` con las formas esperadas.
- Pruebas de conversión y portabilidad de modelos: útil para equipos que quieran validar el flujo de exportación de un modelo VLA de NVIDIA a OpenVINO IR con formas estáticas.

## Benchmarks y rendimiento

| Benchmark | Este paquete (OpenVINO fp16, Arc 140V) | Modelo PyTorch de NVIDIA |
|---|---|---|
| LIBERO `libero_spatial` (10 × 3) | 27/30 | 26/30 |

- Latencia medida: aproximadamente 160-240 ms por chunk de 16 pasos en GPU Arc 140V con fp16.
- Desviación respecto al modelo PyTorch en f32: dentro de 7,4e-3 (normalizado).
- No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 6,3 GB en fp16, por lo que se requiere al menos ese orden de magnitud de memoria para cargar los pesos.
- GPU recomendadas: Intel Arc 140V (verificada en la model card); se espera compatibilidad con otras GPU Intel soportadas por OpenVINO, aunque no se documentan.
- CPU: ejecutable en CPU Intel mediante OpenVINO, según indica el autor.
- ¿Cabe en GPU de consumo? Sí, al menos en GPU integradas Intel como Arc 140V; no se documenta compatibilidad con GPU NVIDIA o AMD en esta información.
- Opciones de despliegue: motor `ov-policy` de Cascadia (`cascadia run ./gr00t-n1.7-libero-spatial-fp16-ov --engine ov-policy --device GPU`). Requiere una build de Cascadia que incluya este tipo de política, que según la model card aún no está en una release (en revisión en `labscommunity/cascadia`).
- Latencia y throughput: 160-240 ms por chunk de 16 pasos en Arc 140V fp16.

## Comparativa con modelos similares

| Modelo | Formato | Hardware objetivo | LIBERO `libero_spatial` | Licencia |
|---|---|---|---|---|
| Este paquete (GR00T N1.7 LIBERO OpenVINO) | OpenVINO IR fp16 | CPU/GPU Intel | 27/30 | NVIDIA Open Model License |
| `nvidia/GR00T-N1.7-LIBERO` (PyTorch) | PyTorch | GPU NVIDIA (presumiblemente) | 26/30 | NVIDIA Open Model License |

No se dispone de información sobre otros modelos VLA comparables (por ejemplo, variantes de OpenVLA u otros) en la documentación proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Licencia NVIDIA Open Model License: es necesario revisar los términos concretos antes de un uso comercial; la model card remite a `LICENSE` y `NOTICE`.
- El paquete es una copia modificada y convertida del modelo original; no es el modelo oficial de NVIDIA.
- Requiere una build específica de Cascadia con el motor `ov-policy`, que según la model card aún no está en una release estable (en revisión).
- Las formas de entrada son estáticas: el cliente debe redimensionar las imágenes a 256×256 y proporcionar exactamente las formas indicadas (`state` [8], `task` [64], `noise` [40, 132]).
- El rendimiento está verificado únicamente en la suite `libero_spatial`; no hay datos sobre otras tareas o entornos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, dado que el modelo no es de lenguaje general.
- Al ser un modelo de robótica, un fallo en la política puede traducirse en acciones físicas incorrectas; se recomienda validación en simulación antes de uso en hardware real.
- No se dispone de información sobre el número de parámetros ni sobre el proceso de entrenamiento, lo que limita la evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/gr00t-n1.7-libero-spatial-fp16-ov
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Repositorio Cascadia (motor `ov-policy`): https://github.com/labscommunity/cascadia
- Intel edge-ai-suites (exportación single-IR citada): no disponible como enlace directo en la información proporcionada
- Benchmark LIBERO: no disponible como enlace directo en la información proporcionada
