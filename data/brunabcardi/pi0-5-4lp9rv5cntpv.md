# brunabcardi/pi0.5-4Lp9rV5cNtpV

## Resumen

π0.5-4Lp9rV5cNtpV es un ajuste fino parcial del checkpoint de robótica `pfenzi/pi0.5-8wKVKfMLCNbx`, publicado por el usuario de HuggingFace `brunabcardi` bajo la librería `openpi`. Se trata de una política visión-lenguaje-acción (VLA) de la familia π0.5, orientada al benchmark de manipulación robótica AXIS, que recibe una imagen RGB de cámara (cámara0, 256x256), un estado articular de 9 dimensiones `[f1, f2, j1..j7]` y una instrucción en lenguaje natural, y produce como salida 9 objetivos absolutos de posición articular.

El modelo no entrena la totalidad de sus pesos: parte del campeón de la competición (puntuación 0.8117) y sólo actualiza el torreón de visión SigLIP, el *action expert* y las capas de proyección (`action_in_proj`, `action_out_proj`, `time_mlp_in`, `time_mlp_out`), dejando el modelo de lenguaje PaliGemma de 2B y la cabeza de imagen congelados y byte-idénticos al padre. En concreto, declara 842.540.816 parámetros entrenables (40 tensores) y 2.510.893.056 parámetros congelados (11 tensores), lo que sitúa el total en torno a 3.350 millones de parámetros.

Su relevancia es acotada pero específica: documenta con detalle inusual la cadena de custodia de pesos, el esquema de normalización compartido y la metodología de generación de datos (rollouts auto-generados por la propia política padre, filtrados por éxito), lo que lo convierte en un ejemplo reproducible de ajuste fino parcial sobre una VLA de competición. No es un modelo de propósito general: es una política de control robótico para una tarea y un runtime concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5: torreón de visión SigLIP + modelo de lenguaje PaliGemma 2B + *action expert* (segundo experto de atención/MLP) con proyecciones de acción y tiempo; configuración `Pi0Config(pi05=True, discrete_state_input=True)`, `action_horizon` 10 |
| Parametros totales | 3.353.433.872 (842.540.816 entrenables en 40 tensores + 2.510.893.056 congelados en 11 tensores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se publican variantes GGUF, AWQ ni GPTQ. Los pesos congelados se mantienen en float32 durante el entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la model card ni los tags del repositorio declaran licencia) |
| Formato de pesos | no disponible; el repositorio expone un directorio `params/` en el formato nativo del entrenador JAX de `openpi`, no safetensors ni GGUF |
| Tamano del repositorio | 12,4 GB |
| Configuracion de inferencia | `pi05_axis_joint` (openpi); entrada 256x256 cámara0 (ranuras de muñeca vacías y enmascaradas) + estado de 9-D + instrucción; salida 9-D de posición articular absoluta |
| Normalizacion | `assets/axis-v0.1-task501-runtime-v1/norm_stats.json` (sha256 `ddf1f825abb675b8c1fff2ea68430f7bb506fdc94cb961836017e448ad3c6d48`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño π0.5 tal y como lo implementa `openpi`: un torreón de visión SigLIP (`PaliGemma/img/Transformer`, `embedding`, `pos_embedding`), un *backbone* de lenguaje PaliGemma de 2B parámetros y un *action expert* implementado como un segundo conjunto de módulos de atención y MLP dentro de `PaliGemma/llm` (aquellos con sufijo `_1`, incluidas sus pre-norms y `final_norm_1`). El modelo usa entrada de estado discreta (`discrete_state_input=True`) y un horizonte de acción de 10 pasos. Este checkpoint es un ajuste fino parcial: sólo se entrenan el torreón de visión, el *action expert* y las proyecciones `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out`; el modelo de lenguaje PaliGemma (incluido su *token embedder* y `final_norm`) y la cabeza de imagen `PaliGemma/img/head` permanecen congelados, sin gradiente ni estado del optimizador, y en float32.

El entrenamiento se ejecutó con el entrenador JAX de `openpi` en el commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`, usando `TrainConfig.freeze_filter` para seleccionar el ámbito congelado. La optimización emplea AdamW con recorte de gradiente 1.0, un `CosineDecaySchedule(warmup_steps=1, peak_lr=1.5e-06, decay_steps=601, decay_lr=1.5e-06)`, EMA con decaimiento 0.999, semilla 4491, tamaño de lote 24 y 601 pasos configurados (este *export* corresponde al paso 600; se guardaron checkpoints cada 100 pasos). Los datos de ajuste no son demostraciones humanas ni teleoperadas: se generaron ejecutando la propia política padre (el checkpoint campeón, sin modificar) dentro del runtime del evaluador oficial (`openroboto-evaluation` en `a11240742f297e942ae50de938073775081f579f`, *snapshots* de tareas `axis_v1.0`, escenas oficiales, `resize_with_pad` 224, `replan` 10, 120 controles a 0,2 s) con semillas de política distintas de la semilla de evaluación (20260907). Sólo se conservaron los episodios en los que el verificador de tarea reportó éxito, truncando en el primer paso exitoso, y cada episodio conservado se re-simuló de forma bit-exacta desde sus acciones registradas.

El conjunto resultante combina un *dataset* principal (`local/pi_axis_pk_onpol`) con 1.196 episodios y 62.221 fotogramas repartidos entre las 30 tareas de la competición (semilla de ruido 32000001; 2.057 intentos, 1.567 éxitos, reteniendo los primeros 40 éxitos por índice de intento y el 60% de los fotogramas muestreados) y seis *datasets* de corrección de 60 episodios cada uno (semilla 32500001), en los que se aplicó una corrección geométrica fija a las acciones de la política padre durante una ventana determinada sobre una tarea concreta, con etiquetas correspondientes a las acciones corregidas finalmente ejecutadas. Destaca un caso límite documentado: la tarea 34 (*Open Drawer and Place Black Bowl Inside*) sólo produjo 36 éxitos en 150 intentos.

## Capacidades

- Generacion de acciones de control robotic: produce objetivos absolutos de posición articular de 9 dimensiones a partir de observación visual y estado proprioceptivo.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (la instrucción de tarea forma parte de la entrada).
- Percepción visual monocula: consume una imagen RGB de 256x256 de la cámara0; las ranuras de cámara de muñeca se marcan como vacías y enmascaradas.
- Condicionamiento multimodal conjunto: combina visión, estado articular de 9-D e instrucción textual en una única política.
- Ejecución con horizonte de acción de 10 pasos y control con replanificación cada 10 controles.
- Especialización en el benchmark AXIS: cubre las 30 tareas de la competición con las que se generaron los datos.
- Ajuste fino parcial sobre el *action expert*: conserva intactas las capacidades del modelo de lenguaje subyacente del padre.
- No se documenta soporte de *tool calling*, function calling, uso de agentes, *thinking mode*, audio ni capacidades multilingües explícitas.

## Casos de uso

- Manipulación robótica en el benchmark AXIS: el modelo está entrenado y normalizado específicamente para las 30 tareas `axis_v1.0`, por lo que su uso natural es la evaluación y comparación dentro de ese *harness* con las mismas condiciones (cámara0, `resize_with_pad` 224, `replan` 10, 120 controles a 0,2 s).
- Investigación en ajuste fino parcial de políticas VLA: sirve como caso de estudio reproducible para medir cuánto rendimiento se obtiene entrenando sólo el torreón de visión, el *action expert* y las proyecciones (842,5 M de parámetros) mientras se congela el *backbone* de lenguaje de 2,5 B.
- Destilación de políticas mediante auto-rollout: el método de generación de datos —ejecutar la política padre, filtrar por éxito del verificador y re-simular bit-exactamente los episodios conservados— es directamente reutilizable para ampliar cobertura de tareas sin datos humanos.
- Corrección de sesgos sistemáticos de una política: los seis *dataset* de corrección ilustran cómo aplicar una corrección geométrica fija sobre una ventana temporal concreta y reentrenar sólo el *action expert* para absorberla.
- Comparación de linaje de checkpoints: al compartir un `norm_stats.json` byte-idéntico con toda su ascendencia, permite evaluaciones comparables contra el padre (0,8117) y contra los predecesores de la cadena sin recalibrar normalización.
- Servido como servidor de política en simulación: `openpi` expone el modelo como *policy server* que el evaluador consulta cada 10 controles, un patrón directamente trasladable a bucles de evaluación automatizada en CI.
- Estudio de retención de conocimiento congelado: al preservar el modelo de lenguaje y la cabeza de imagen byte-idénticos, permite aislar cuánto de la capacidad de la política reside en la interfaz visomotora frente al *backbone* semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card únicamente reporta las puntuaciones de los modelos de su linaje, adquiridas en la competición AXIS:

| Modelo del linaje | Puntuacion reportada |
|---|---|
| pfenzi/pi0.5-8wKVKfMLCNbx (padre directo) | 0,8117 |
| MechaTrainer/pi0.5-rneQYn9nFopV | 0,785 |
| brunabcardi/pi0.5-iX58tVHFJ52L | no disponible |
| Fisher-Wang/pi05-axis-v0.2-all30-74p67 | no disponible |
| brunabcardi/pi0.5-4Lp9rV5cNtpV (este checkpoint) | no disponible |

Los datos de entrenamiento indican que el padre obtuvo 1.567 éxitos sobre 2.057 intentos al generar el *dataset* principal (semilla de política 32000001), pero esa cifra corresponde a la política padre, no a este ajuste. La tarea 34 sólo alcanzó 36 éxitos en 150 intentos con el padre, lo que señala un punto débil heredado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 3,35 B de parámetros ocupan aproximadamente 13,4 GB en float32 y 6,7 GB en bfloat16; la model card indica que los pesos congelados se mantuvieron en float32 durante el entrenamiento, lo que sugiere un consumo superior al de una inferencia puramente bf16.
- Tamano del repositorio: 12,4 GB, coherente con un *checkpoint* almacenado mayoritariamente en float32.
- GPU recomendadas: no especificadas por el autor. No se documentan requisitos por modelo (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada. Con pesos en float32 el ajuste en GPUs de 24 GB es ajustado; con conversión a bfloat16 sería plausible en tarjetas de 24 GB, pero el autor no lo documenta ni publica una ruta de cuantización.
- Opciones de despliegue: el modelo se sirve mediante el *stack* `openpi` (entrenador JAX en el commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`), y está pensado para operar como servidor de política consumido por el evaluador `openroboto-evaluation`. No se documentan soportes de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, y el formato `params/` no es compatible directamente con esos *runtimes*.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones técnicas (parámetros, contexto, licencia) de los modelos comparables en la información proporcionada; sólo de sus puntuaciones de competición.

| Modelo | Relacion | Parametros | Contexto | Puntuacion AXIS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| brunabcardi/pi0.5-4Lp9rV5cNtpV | este checkpoint | 3,35 B (842,5 M entrenables) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 *likes* |
| pfenzi/pi0.5-8wKVKfMLCNbx | padre directo | no disponible | no disponible | 0,8117 | no disponible | HuggingFace (sin model card) |
| MechaTrainer/pi0.5-rneQYn9nFopV | predecesor del padre | no disponible | no disponible | 0,785 | no disponible | HuggingFace |
| brunabcardi/pi0.5-iX58tVHFJ52L | predecesor del anterior | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Fisher-Wang/pi05-axis-v0.2-all30-74p67 | raiz del linaje | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Especialización estrecha: la política está ajustada al *harness* AXIS `axis_v1.0` y a su esquema de normalización concreto. Cambiar la cámara, la resolución, la frecuencia de control o el conjunto de tareas invalida los resultados.
- Sin datos de robot real: todo el entrenamiento proviene de simulaciones auto-generadas por la política padre. No hay demostraciones humanas, teleoperadas ni de experto programado, lo que limita la transferencia a hardware físico.
- Sesgo de autoimitación: al entrenar sobre los propios rollouts de la política padre filtrados por éxito, el modelo hereda y puede reforzar los sesgos y los modos de fallo del padre, incluida la dificultad documentada en la tarea 34.
- Riesgo de alucinación de acciones: como política de control, puede producir trayectorias plausibles pero incorrectas ante configuraciones de escena fuera de distribución, sin señal de incertidumbre publicada.
- Licencia sin declarar: ni la model card ni los tags indican licencia, por lo que el uso comercial presenta incertidumbre legal y requiere contactar con el autor.
- Sin benchmarks propios: no hay ninguna métrica publicada para este *checkpoint*, ni siquiera la puntuación de competición; no puede afirmarse que supere al padre.
- Idiomas no documentados: se desconoce qué lenguas acepta como instrucción y el rendimiento fuera del inglés no está verificado.
- Estado del modelo congelado: al no entrenarse el *backbone* de lenguaje, ninguna mejora en la comprensión semántica de instrucciones complejas procede de este ajuste.
- Huella de memoria elevada: 12,4 GB de repositorio y pesos congelados en float32 dificultan el despliegue en entornos con VRAM limitada.
- Reproducibilidad dependiente de versiones: los resultados dependen de commits concretos de `openpi` y `openroboto-evaluation` y de un `norm_stats.json` con sha256 específico.
- Sin adopción: el repositorio registra 0 descargas y 0 *likes*, por lo que no hay validación independiente por parte de la comunidad.
- Fechas del repositorio futuras (creado y actualizado el 2026-09-26) respecto al momento de redacción de esta ficha; conviene verificarlas en la fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brunabcardi/pi0.5-4Lp9rV5cNtpV
- Modelo base (padre): https://huggingface.co/pfenzi/pi0.5-8wKVKfMLCNbx
- Revision del padre: `a4a5f5711261b661c2fde6fa2f067acc9a09b050`
- Predecesor del linaje: https://huggingface.co/MechaTrainer/pi0.5-rneQYn9nFopV (revision `f0a106070f4de953c5b1ff9ae361a7099f7be796`)
- Predecesor del linaje: https://huggingface.co/brunabcardi/pi0.5-iX58tVHFJ52L (revision `3c38c482dd333aede17cfba0198298bf8e316af3`)
- Raiz del linaje: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67 (revision `521a0741c01ee7908b5794bb2ae6933d3dc04745`)
- Entrenador openpi (JAX), commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`: repositorio `openpi` (no se proporciona URL directa en la informacion disponible)
- Runtime del evaluador, commit `a11240742f297e942ae50de938073775081f579f`: `openroboto-evaluation` (no se proporciona URL directa en la informacion disponible)
