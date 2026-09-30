# doooinbeta/pi0.5-iX58tVHFJ52L

## Resumen

El modelo `doooinbeta/pi0.5-iX58tVHFJ52L` es un ajuste fino (fine-tune) del checkpoint `nakamotosantosh/pi0.5-GE38YpXNDVWi`, que a su vez es el campeón del benchmark AXIS v2.0 (competición 8) en el momento de iniciarse el entrenamiento. Se trata de una política robótica de tipo vision-language-action (VLA) construida sobre la arquitectura π0.5 de Physical Intelligence, con horizonte de acción de 10 pasos y salida de 9 objetivos de posición articular absoluta. El autor lo publica bajo la librería `openpi` y el repositorio ocupa 12,4 GB.

El modelo combina una torre de visión SigLIP (parte de PaliGemma) con un modelo de lenguaje PaliGemma de 2B parámetros y un experto de acciones, todos ellos integrados en el pipeline π0.5. El ajuste fino entrenó 844.902.160 parámetros (torre SigLIP, proyección de salida de imagen, experto de acciones y proyecciones de acción/tiempo) y congeló 2.508.531.712 parámetros (el modelo de lenguaje PaliGemma de 2B, incluyendo el embedder de tokens y `final_norm`). Esto da un total de 3.353.433.872 parámetros (~3,35B).

Su relevancia es doble: por un lado, sirve como política de manipulación para tareas del entorno simulado AXIS v2.0 con cámara frontal y, en algunas tareas, cámara de muñeca; por otro, documenta de forma exhaustiva el linaje, la metodología de entrenamiento y los parámetros exactos usados, lo que lo convierte en un caso de estudio útil para quien quiera reproducir o extender pipelines VLA con openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5: torre de visión SigLIP (PaliGemma/img/Transformer), modelo de lenguaje PaliGemma 2B (congelado) y experto de acciones entrenable |
| Parametros totales | 3.353.433.872 (~3,35B), de los cuales 844.902.160 entrenables y 2.508.531.712 congelados |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precisión completa en formato Orbax; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como texto; no se especifica el conjunto de idiomas) |
| Licencia | El campo de licencia del repositorio está vacío. La model card indica que los pesos derivan de PaliGemma/Gemma a través de openpi, sujetos a los Gemma Terms of Use, y que se incluye la licencia Apache-2.0 de openpi |
| Formato de pesos | openpi / Orbax (OCDBT), solo inferencia (sin estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño π0.5 (`Pi0Config(pi05=True, discrete_state_input=True)`), con horizonte de acción 10 y la configuración openpi `pi05_axis_joint`. La entrada, tal como la sirve el evaluador de AXIS v2.0, consiste en una imagen RGB de cámara frontal redimensionada con padding a 224x224, más la imagen de cámara de muñeca en las tareas [501, 502, 503, 504, 505, 506, 514, 757] (enmascarada en el resto), un estado articular de 9 dimensiones y la instrucción de tarea. La salida son 9 objetivos de posición articular absoluta. Los módulos `time_mlp_in`/`time_mlp_out` y las proyecciones `action_in_proj`/`action_out_proj` son coherentes con el experto de acciones condicionado por tiempo característico de π0.5. El ajuste fino no usó LoRA ni adaptadores: se entrenaron directamente la torre de visión SigLIP, la proyección de salida de imagen (`PaliGemma/img/head`), el experto de acciones (módulos `PaliGemma/llm` con sufijo `_1`) y las proyecciones de acción/tiempo, manteniendo el modelo de lenguaje PaliGemma congelado y byte-idéntico al padre.

El entrenamiento se hizo en dos etapas de 3000 pasos cada una sobre los mismos datos: la etapa 1 partió del padre con LR pico 2e-5 y decaimiento coseno hasta 2e-6, y la etapa 2 partió del checkpoint del paso 3000 de la etapa 1 con LR pico 1e-5 y decaimiento coseno hasta 1e-6. Se empleó AdamW con los valores por defecto de openpi (gradient clip 1,0), `CosineDecaySchedule(warmup_steps=100, peak_lr=1e-05, decay_steps=3001, decay_lr=1e-06)`, EMA con decaimiento 0,999, batch size 48 y semilla 4407. Los datos son demostraciones de simulación AXIS v2.0 generadas localmente con el evaluador oficial (openroboto-evaluation @3966a9394d39) sobre instancias aleatorizadas nuevas, sin usar ninguna de las 600 instancias de evaluación congeladas. Se generaron 2.223 rollouts exitosos para 22 tareas de física fija (6.669 episodios, 418.155 fotogramas a 5 Hz) y 2.000 demostraciones de un experto con guion privilegiado para 8 tareas con reset físico (4.000 episodios, 205.502 fotogramas), con cada tarea muestreada con probabilidad uniforme 1/30. La normalización reutiliza `assets/axis-v0.1-task501-runtime-v1/norm_stats.json` del padre, byte-idéntico (sha256 `ddf1f825abb675b8c1fff2ea68430f7bb506fdc94cb961836017e448ad3c6d48`). El cambio L2 relativo de todos los pesos respecto al padre es 4.068e-03 (vit 9.131e-03, img_head 2.810e-02, expert 2.254e-02, proj 1.136e-02, llm 0.000e+00).

## Capacidades

- Control robótico de manipulación de extremo a extremo: genera 9 objetivos de posición articular absoluta a partir de imágenes y estado articular.
- Percepción visual multimodal: procesa imagen de cámara frontal a 224x224 y, en tareas concretas, imagen de cámara de muñeca.
- Seguimiento de instrucciones de tarea en lenguaje natural (task instruction) combinado con estado proprioceptivo de 9 dimensiones.
- Ejecución de políticas con horizonte de acción 10 (chunks de 10 acciones), adecuada para control a 5 Hz.
- Generalización a tareas con reset físico (501-506, 514, 757) además de las tareas de física fija.
- Politica base para fine-tuning posterior: la estructura congelado/entrenable está documentada y es reproducible con `TrainConfig.freeze_filter`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni generación de texto libre; las capacidades declaradas se limitan al ámbito VLA/robótica.

## Casos de uso

- Control de manipulacion robotica en simulacion (AXIS v2.0): el modelo recibe la imagen frontal, el estado articular y la instrucción y produce 9 objetivos articulares absolutos, por lo que se puede usar directamente como política dentro del evaluador `pi05_axis_joint`.
- Investigacion en sim-to-real: la política está entrenada sobre renders del evaluador oficial con padding a 224x224, de modo que sirve como punto de partida para estudiar la transferencia a un brazo físico con cámara frontal.
- Fine-tuning específico de tarea: al estar documentado exactamente qué parámetros están congelados y cuáles entrenables, se puede reajustar la torre SigLIP y el experto de acciones sobre un dataset propio sin tocar el LLM de 2B, reduciendo el coste de entrenamiento.
- Generacion de datos con profesor-alumno: el esquema usado (profesor π0.5 v1, etiquetas limpias, ruido gaussiano DART-style al 30%) es reutilizable para producir demostraciones etiquetadas y entrenar políticas más pequeñas.
- Evaluacion de robustez ante ruido en acciones: la política se entrenó parcialmente con ruido sobre las articulaciones del brazo, lo que permite analizar su comportamiento bajo perturbaciones sin dejar de recibir etiquetas limpias.
- Investigacion en co-entrenamiento vision-lenguaje-accion: permite estudiar cómo se comporta un experto de acciones entrenado sobre una torre visual ajustada mientras el LLM permanece congelado.
- Reproducibilidad de experimentos: el repositorio incluye `training_provenance.json` y `CHECKSUMS.sha256` con los hiperparámetros y hashes, lo que facilita auditar o replicar el pipeline completo con openpi en el commit `15a9616a00943ada6c20a0f158e3adb39df2ccac`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas específicas de AXIS) en la información disponible para este checkpoint concreto. El único dato de rendimiento declarado es cualitativo: el modelo padre (`nakamotosantosh/pi0.5-GE38YpXNDVWi`) era el campeón de AXIS v2.0 (competición 8) en el momento de iniciarse el entrenamiento. No se proporcionan tasas de éxito, comparaciones numéricas con el padre ni métricas de simulación para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3,35B parámetros publicados (estimaciones derivadas del tamaño, no cifras oficiales): en bf16/fp16 en torno a 6,7 GB de pesos; en fp32 en torno a 13,4 GB; en int8 en torno a 3,4 GB; en int4 en torno a 1,7 GB. Añadir espacio para activaciones, buffers de imagen 224x224 y estado de inferencia.
- GPU recomendadas: no especificadas por el autor. Para inferencia en bf16 con margen, una GPU de 24 GB (RTX 3090/4090, A10G, L4) sería suficiente según el tamaño; para despliegue en producción con varias instancias se suelen usar A100 o H100.
- Cabe en GPU de consumo: sí, según el cálculo de tamaño, cabría en tarjetas de 24 GB en bf16. No obstante, solo se publican pesos en precisión completa y formato Orbax, por lo que no hay artefactos cuantizados listos para consumir.
- Opciones de despliegue: openpi (JAX), LeRobot (implementación de π0.5), y export optimizado para dispositivos Qualcomm mediante `qualcomm/ai-hub-models`. No se documenta soporte de vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| doooinbeta/pi0.5-iX58tVHFJ52L (este) | ~3,35B (844,9M entrenables) | no disponible | Campo vacío; Gemma Terms of Use + Apache-2.0 (openpi) según la model card | HuggingFace, formato openpi/Orbax |
| nakamotosantosh/pi0.5-GE38YpXNDVWi (padre) | no disponible | no disponible | no disponible | HuggingFace |
| brunabcardi/pi0.5-iX58tVHFJ52L (hermano) | no disponible | no disponible | no disponible | HuggingFace, full fine-tune de `pi05-axis-v0.2-all30-74p67` |
| π0.5 de Physical Intelligence (referencia) | no disponible | no disponible | no disponible | Paper arXiv 2504.16054, openpi y LeRobot |
| Export π0.5 de Qualcomm AI Hub | no disponible | no disponible | no disponible | Export on-device para dispositivos Qualcomm |

No se dispone de cifras de rendimiento comparables para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; no hay evaluación de sesgos ni de equidad.
- Riesgo de alucinacion: no aplica en el sentido de generación de texto libre, pero existe el riesgo de acciones erróneas o poco seguras fuera de la distribución de entrenamiento simulada, especialmente en transferencia a hardware real.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; las instrucciones de tarea dependen de la distribución del dataset AXIS, mayoritariamente en inglés.
- Dominio restringido: la política está entrenada exclusivamente sobre 30 tareas del simulador AXIS v2.0 (22 de física fija y 8 con reset físico). El comportamiento fuera de esas tareas no está validado.
- Formato de pesos: solo se publican parámetros de inferencia en Orbax (OCDBT) para openpi/JAX; no hay safetensors, GGUF ni variantes cuantizadas, lo que limita los runtimes disponibles.
- Restricciones de licencia para uso comercial: el repositorio no declara licencia en su campo oficial; la model card remite a los Gemma Terms of Use y a la licencia Apache-2.0 de openpi. Los Gemma Terms of Use imponen condiciones y restricciones de uso (incluidas cláusulas de uso aceptable) que deben revisarse antes de cualquier explotación comercial.
- Linaje: los pesos del padre son byte-idénticos a `Zayaan/pi0.5-dHGSxNJcwbYE@d5e85aa270df643be821982caf4ab69c07e5e5e7`, y el repositorio padre no incluye ficheros de licencia; los que se distribuyen aquí provienen del linaje upstream.
- Caveat de produccion: al ser un fine-tune de solo dos etapas de 3000 pasos sobre datos de simulación, la robustez ante cambios de cámara, iluminación, física o morfología del robot no está garantizada.
- Fecha de creacion del repositorio registrada como 2026-09-30, posterior a la fecha habitual de publicación; conviene verificar la procedencia y la integridad mediante `CHECKSUMS.sha256`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doooinbeta/pi0.5-iX58tVHFJ52L
- Modelo padre: https://huggingface.co/nakamotosantosh/pi0.5-GE38YpXNDVWi
- Linaje del padre: https://huggingface.co/Zayaan/pi0.5-dHGSxNJcwbYE
- Modelo hermano: https://huggingface.co/brunabcardi/pi0.5-iX58tVHFJ52L
- Paper de π0.5: https://arxiv.org/abs/2504.16054
- Documentación de la política π0.5 en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Qualcomm AI Hub, Pi0.5: https://aihub.qualcomm.com/models/pi05
- Export de Pi0.5 de Qualcomm en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/pi05/README.md
