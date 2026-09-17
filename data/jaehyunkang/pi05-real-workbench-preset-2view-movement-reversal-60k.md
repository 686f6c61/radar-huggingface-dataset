# jaehyunkang/pi05-real-workbench-preset-2view-movement-reversal-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-preset-2view-movement-reversal-60k` es una política robótica (policy) resultante de un ajuste fino del modelo base `lerobot/pi05_base`, publicado por el usuario jaehyunkang. No es un modelo de lenguaje de propósito general, sino un modelo de visión-lenguaje-acción (VLA) de la familia pi0.5 que, a partir de dos vistas de cámara y un vector de estado, predice comandos motores de tipo delta EEF. El entrenamiento se detuvo a los 60.000 pasos de optimización y su alcance se limita a la tarea `movement-reversal` del conjunto de datos `Myungkyu/real_workbench-preset-gemini`.

Los pesos ocupan 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un repositorio de 24,5 GB que incluye además estados de normalización, configuración de preprocesado y ficheros de reanudación de entrenamiento. La model card es explícita: se trata de un checkpoint entrenado, no de un resultado de evaluación, y no se reclama ninguna métrica de rendimiento sobre robot real.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline de ajuste fino de pi0.5 sobre datos reales de banco de trabajo, con hiperparámetros documentados (batch global 32, 2 GPU, semilla 42, horizonte de acciones 50, 10 pasos de denoising). Resulta útil para equipos que quieran replicar o comparar recetas de entrenamiento de VLA en LeRobot, siempre teniendo en cuenta que la licencia no está declarada y que el modelo depende de una implementación concreta para los campos de entrada personalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de tipo transformer, familia pi0.5; derivada del modelo base `lerobot/pi05_base`. El tokenizer apunta a `google/paligemma-3b-pt-224`, lo que vincula el backbone de visión-lenguaje a PaliGemma-3B. Detalle interno de capas no disponible en la información proporcionada |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones), según los pesos safetensors |
| Parámetros activos | No aplica: no hay indicios de que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible. El modelo emite acciones motoras, no texto libre; el tokenizer procede de `google/paligemma-3b-pt-224` (revisión de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Licencia | No disponible: el campo de licencia del repositorio está vacío |
| Formato de pesos | safetensors, acompañado de configuración JSON, estados de preprocesado/postprocesado y de normalización; los ficheros de reanudación de entrenamiento están en `training_state/` |
| Tipo de modelo | Política robótica entrenada por imitación, no un modelo generativo de texto |
| Alcance de tarea | `movement-reversal` sobre el dataset `Myungkyu/real_workbench-preset-gemini` |
| Instrucción | Subtarea en parquet por fotograma, suministrada como texto `task` de la política |
| Vistas de entrada | 2 (exterior y muñeca) |
| Resolución de imagen | Almacenada a 224×126; la política aplica padding a 224×224 |
| Dimensión de estado | 8 |
| Dimensión de acción | 7 (delta EEF: 6 velocidades cartesianas + gripper) |
| Horizonte de acciones | Chunk de 50; horizonte de ejecución 50 |
| Pasos de denoising en inferencia | 10 |
| Entrenamiento | 60.000 pasos de optimización, batch global 32, 2 GPU, semilla 42 |
| Implementación de entrenamiento | `RLWRLD/hiwrld-ll-policy`, con LeRobot Pi0.5 vendorizado |
| Tamaño del repositorio | 24,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17 |

## Arquitectura y entrenamiento

La información disponible describe un ajuste fino supervisado (imitación) del modelo base `lerobot/pi05_base` mediante la implementación `RLWRLD/hiwrld-ll-policy`, que incorpora una versión vendorizada de LeRobot Pi0.5. El entrenamiento se ejecutó durante 60.000 pasos de optimización con un batch global de 32 sobre 2 GPU y semilla 42. La política consume dos vistas de cámara (exterior y muñeca) junto con un vector de estado de 8 dimensiones, y produce un chunk de 50 acciones delta EEF de 7 dimensiones; en inferencia se aplican 10 pasos de denoising por chunk. La instrucción de tarea se toma de una subtarea en formato parquet definida por fotograma, un esquema característico de los modelos de subtareas de esta familia.

No se detallan en la información proporcionada el número total de tokens o episodios vistos, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco habituales en políticas de imitación). Sí se documenta el tokenizer de referencia, `google/paligemma-3b-pt-224` en una revisión concreta, lo que indica que el backbone de visión-lenguaje es PaliGemma-3B y que cualquier reproducción debe fijar esa misma revisión. Los ficheros del repositorio incluyen configuración de política, preprocesado/postprocesado y estados de normalización en la raíz, con rutas específicas de máquina eliminadas de los JSON de metadatos; para reanudar el entrenamiento hay que aportar rutas locales de dataset y salida. Las longitudes, hashes SHA-256 y tamaños de fichero están registrados en `artifact_manifest.json`.

## Capacidades

- Control robótico por imitación: genera comandos delta EEF de 7 dimensiones (6 velocidades cartesianas más gripper) a partir de observaciones visuales y de estado.
- Percepción multimodal con dos cámaras: procesa simultáneamente una vista exterior y una vista de muñeca, con padding de 224×126 a 224×224.
- Predicción por chunks: emite bloques de 50 acciones con un horizonte de ejecución de 50, lo que permite control relativamente fluido sin replanificar en cada fotograma.
- Condicionamiento por instrucción de subtarea: acepta el texto de tarea definido por fotograma en el parquet del dataset, lo que permite encadenar subtareas dentro de una misma tarea de manipulación.
- Especialización en `movement-reversal`: la política está ajustada para la reversión de movimientos en el banco de trabajo del dataset de entrenamiento.
- Reanudación de entrenamiento: el repositorio conserva los checkpoints y estados necesarios para continuar el ajuste fino.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en lenguaje natural.
- No se documenta soporte multilingüe ni modo de pensamiento (thinking mode), ni capacidades de audio o vídeo.

## Casos de uso

- Manipulación de laboratorio en banco de trabajo: la política puede reproducir secuencias de colocación y recogida con reversión de movimiento sobre configuraciones de objeto similares a las del dataset `real-workbench-preset-gemini`, usando las dos vistas para localizar el efector y el objeto.
- Replicación de recetas de entrenamiento VLA: al estar documentados pasos, batch global, semilla y horizonte de acciones, sirve como punto de partida reproducible para comparar variantes de ajuste fino sobre pi0.5 en LeRobot.
- Evaluación de transferencia entre revisiones del modelo base: permite medir cuánto aporta un ajuste de 60.000 pasos frente a `lerobot/pi05_base` en la misma tarea y dataset.
- Generación de datos sintéticos de política: las predicciones por chunk pueden usarse para preanotar episodios de teleoperación y acelerar la curación de nuevos datasets de manipulación.
- Integración en bucles de control con horizonte largo: con 50 acciones por chunk y 10 pasos de denoising, encaja en arquitecturas que planifican en bloques y reducen la frecuencia de inferencia en el robot.
- Estudio de reversión de movimiento en robótica de ensamblaje: útil para analizar cómo se comporta una política VLA cuando la secuencia debe deshacerse (retirada de una pieza, retroceso tras inserción fallida).
- Base para ajuste específico de dominio: partiendo de este checkpoint, un equipo puede continuar el entrenamiento con datos propios usando `training_state/`, siempre que replique la implementación de entrenamiento.
- Validación de pipelines de preprocesado y normalización: los estados de normalización publicados permiten verificar que el pipeline de entrada (8 dimensiones de estado, 7 de acción, dos vistas) está correctamente implementado antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que se trata de un checkpoint entrenado y que no se reclama ninguna métrica de evaluación sobre robot real. Tampoco se proporcionan tasas de éxito, números de éxito por episodio ni comparaciones con otras políticas.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real | No disponible (no reclamada por el autor) |
| Tasa de éxito por tarea | No disponible |
| MMLU / HumanEval / GSM8K u otros benchmarks de lenguaje | No aplicable: es una política robótica |
| Latencia o throughput medidos | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4,14 mil millones de parámetros (estimación propia, no publicada por el autor):
  - FP32: ≈16,6 GB
  - BF16/FP16: ≈8,3 GB
  - int8: ≈4,1 GB
  - int4: ≈2,1 GB
- Hay que sumar a esas cifras el coste de activaciones del backbone de visión para dos vistas a 224×224, la caché de atención (longitud de contexto no disponible) y los estados de normalización.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación por lotes; L40S 48 GB o A6000 48 GB como alternativa equilibrada.
- GPU de consumo: cabe en BF16 en tarjetas de 24 GB (RTX 3090, RTX 4090). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriría cuantización o reducir el lote; no hay variantes cuantizadas publicadas.
- Opciones de despliegue: LeRobot (librería `lerobot`, PyTorch) es la vía natural. No aplican vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo generativo de texto ni se distribuye en GGUF. La model card advierte que los campos de entrada personalizados pueden exigir la implementación coincidente (`RLWRLD/hiwrld-ll-policy`, LeRobot Pi0.5 vendorizado).
- Latencia y throughput: no disponibles. Como referencia estructural, cada chunk de 50 acciones requiere 10 pasos de denoising, es decir, del orden de 10 pasadas hacia delante por chunk, lo que marca la frecuencia máxima de control alcanzable.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de los modelos alternativos dentro de la información proporcionada, por lo que la comparación se limita a la categoría y al tipo de artefacto.

| Modelo | Parámetros | Categoría | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaehyunkang/pi05-real-workbench-preset-2view-movement-reversal-60k` | 4.143.404.816 | Política VLA pi0.5 ajustada, 2 vistas, acción delta EEF de 7 dimensiones, horizonte 50 | No disponible | No disponible | Pública en HuggingFace, 0 descargas |
| `lerobot/pi05_base` | No disponible | Modelo base VLA pi0.5 sin ajustar a esta tarea | No disponible | No disponible | Público en HuggingFace (referenciado como `base_model`) |
| `lerobot/pi0` | No disponible | Política VLA predecesora de la familia pi0 | No disponible | No disponible | Pública en HuggingFace |
| OpenVLA y otras políticas VLA abiertas | No disponible | Políticas VLA de propósito general para manipulación | No disponible | No disponible | Públicas |

Diferencias cualitativas relevantes: este checkpoint está especializado en una única tarea (`movement-reversal`) y en una configuración concreta de banco de trabajo con dos vistas, mientras que los modelos base de la familia y las políticas VLA generalistas están pensados para mayor diversidad de tareas. Frente a OpenVLA u otras alternativas, el punto fuerte aquí es la reproducibilidad del pipeline de pi0.5 sobre LeRobot; el punto débil es la ausencia total de métricas y de licencia declarada.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: la model card afirma explícitamente que es un checkpoint entrenado y no un resultado, y que no se reclaman métricas sobre robot real.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. En la práctica, debe tratarse como no apto para producción hasta que el autor lo aclare.
- Sesgo de dominio severo: el entrenamiento se realizó sobre un único dataset (`Myungkyu/real_workbench-preset-gemini`) y una única tarea (`movement-reversal`); el rendimiento fuera de esa configuración de objetos, iluminación y cámaras es desconocido.
- Dependencia de la implementación: los campos de entrada personalizados y el esquema de subtarea por fotograma pueden requerir la implementación concreta usada en el entrenamiento; cargar el modelo con una versión distinta de LeRobot puede producir resultados incorrectos.
- Dependencia de revisiones fijas: el tokenizer apunta a una revisión concreta de `google/paligemma-3b-pt-224`; usar otra revisión invalida la reproducibilidad.
- Interfaz rígida: solo acepta 8 dimensiones de estado y emite 7 dimensiones de acción delta EEF, por lo que no es directamente reutilizable en otras morfologías o espacios de acción sin reentrenamiento.
- El concepto de alucinación de texto no aplica, pero sí el fallo silencioso: la política puede producir trayectorias plausibles y erróneas sin señal de incertidumbre, lo que en un robot real implica riesgo físico.
- Sin salvaguardas de seguridad: no se documentan límites de par, velocidades máximas ni paradas de emergencia; cualquier despliegue debe implementar capas de seguridad externas.
- Idiomas y contexto no documentados: no se puede asumir comportamiento multilingüe en las instrucciones de subtarea ni una ventana de contexto determinada.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de redactar esta ficha, sin informes de terceros que validen el comportamiento del checkpoint.
- Los ficheros de reanudación requieren rutas locales: los metadatos JSON tienen las rutas específicas de máquina eliminadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-2view-movement-reversal-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Organización LeRobot en HuggingFace: https://huggingface.co/lerobot
- Tokenizer referenciado: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento citada en la model card: `RLWRLD/hiwrld-ll-policy` (identificador textual; URL no disponible en la información proporcionada)
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes para este modelo; los únicos enlaces obtenidos correspondían a páginas de descarga del navegador Google Chrome y se han descartado por no ser pertinentes.
