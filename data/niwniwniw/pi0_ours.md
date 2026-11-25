# niwniwniw/pi0_ours

## Resumen

pi0_ours es un ajuste fino completo del modelo vision-language-action (VLA) `lerobot/pi0_base`, desarrollado por el usuario niwniwniw y publicado en Hugging Face. El modelo parte de la arquitectura pi0 de Physical Intelligence, que combina un backbone de visión-lenguaje PaliGemma de 3B parámetros con un experto de acciones de 300M parámetros, y lo entrena sobre las cuatro suites estándar de LIBERO (Spatial, Object, Goal y 10) para control robótico de manipulación.

El propósito declarado es servir como base VLA reproducible para experimentos de post-entrenamiento en el espacio de ruido de modelos de flow matching. Es la contraparte pi0 del modelo `niwniwniw/smolvla_ours`, y existe una variante con dropout de condicionamiento (`niwniwniw/pi0_cfg`). El entrenamiento cubre las 40 tareas de LIBERO, con 1.693 episodios, dos cámaras de 256x256, estado de 8 dimensiones y acciones de 7 dimensiones.

Su relevancia es acotada: no es un modelo de propósito general, sino un checkpoint de investigación para evaluación en simulación robótica. Alcanza un 91,3 % de tasa de éxito medio en las cuatro suites LIBERO bajo el protocolo del autor, pero requiere un parche de compatibilidad para cargarse correctamente con versiones recientes de `transformers`/lerobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0: backbone PaliGemma 3B (vision-lenguaje) + experto de acciones de 300M, flow matching |
| Parametros totales | 4.028.019.472 (~4,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tareas robóticas, no a diálogo general) |
| Licencia | gemma |
| Formato de pesos | safetensors (formato `PI0Policy` de lerobot: `config.json`, `model.safetensors`, ficheros de pre/post-procesado) |

## Arquitectura y entrenamiento

pi0 es un modelo vision-language-action que combina un VLM PaliGemma de 3B parámetros como backbone con un experto de acciones de 300M parámetros. La generación de acciones se formula como flow matching: el modelo predice un campo de velocidades que integra ruido hacia una trayectoria de acciones, con 10 pasos de integración y ejecución de 10 pasos por chunk (chunks de 50 pasos, con relleno a 32 dimensiones). Las observaciones incluyen dos cámaras de 256x256, un vector de estado de 8 dimensiones y acciones de 7 dimensiones.

El ajuste fino es completo (VLM y experto de acciones, sin LoRA) sobre `lerobot/pi0_base`, usando los 1.693 episodios de las 40 tareas de las cuatro suites LIBERO (`HuggingFaceVLA/libero`). Se entrenaron 25.000 pasos con AdamW (lr 2,5e-5, betas 0,9/0,95, weight decay 0,01, grad clip 1,0), batch global de 32, 1.000 pasos de warmup y decaimiento coseno hasta 2,5e-6, semilla 1000, sobre Cloud TPU v4 (4 chips con FSDP) a 4,4-5,5 s por paso. Para la release solo se editaron tres campos (ruta del tokenizer en `policy_preprocessor.json` y metadatos en `TRAIN_INFO.json`); los pesos no se modificaron.

## Capacidades

- Control robótico de manipulación por imitación: genera trayectorias de acciones de 7 dimensiones a partir de observaciones visuales (dos cámaras), estado proprioceptivo e instrucción de tarea.
- Ejecución de 40 tareas de manipulación de LIBERO (suite Spatial, Object, Goal y 10).
- Generación de acciones por flow matching con chunks de 50 pasos e integración en 10 pasos.
- Procesamiento multimodal de entrada: dos flujos de imagen de 256x256 más vector de estado de 8 dimensiones.
- No soporta tool calling, function calling, agentes multi-paso ni diálogo multilingüe: es un modelo de política robótica, no un LLM conversacional.
- No dispone de modo thinking, visión general, audio ni otras capacidades de propósito general.

## Casos de uso

- Investigación en post-entrenamiento de VLAs: sirve como base reproducible para experimentos de post-entrenamiento en el espacio de ruido de modelos de flow matching, que es el propósito declarado del autor.
- Evaluación comparativa de recetas de ajuste fino: al compartir receta con `smolvla_ours` y `pi0_cfg`, permite aislar el efecto de cambios en datos, condicionamiento o arquitectura sobre el rendimiento en LIBERO.
- Reproducción de resultados en simulación: con el protocolo del autor (20 episodios por tarea, 200 por suite) se puede replicar la tasa de éxito reportada y validar pipelines de evaluación.
- Punto de partida para ajuste en dominios robóticos propios: el checkpoint puede reajustarse sobre demostraciones nuevas para tareas de manipulación con cámaras y estado similares a los de LIBERO.
- Docencia y formación en VLA: sirve para ilustrar el funcionamiento de un modelo vision-language-action con flow matching en un entorno de simulación controlado.
- Desarrollo de infraestructura de despliegue: útil para probar la carga del formato `PI0Policy` de lerobot, la gestión de estadísticas de normalización y la compatibilidad de versiones de `transformers`.

## Benchmarks y rendimiento

Tasa de éxito en simulación con el protocolo del autor (20 episodios por tarea, 200 por suite, 10 pasos de integración, 10 pasos ejecutados):

| Suite | Éxitos | Tasa de éxito |
|---|---|---|
| LIBERO-Spatial | 174/200 | 87,0 % |
| LIBERO-Object | 196/200 | 98,0 % |
| LIBERO-Goal | 187/200 | 93,5 % |
| LIBERO-10 | 173/200 | 86,5 % |
| Media | 730/800 | 91,3 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en float32 ocupan unos 16 GB, por lo que se necesitan al menos ~16-17 GB de VRAM en float32; en bfloat16 el peso sería de unos 8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o similares de centro de datos para entrenamiento y evaluación a escala; el entrenamiento se realizó en Cloud TPU v4 (4 chips, FSDP).
- GPU de consumo: una RTX 4090 (24 GB) podría alojar los pesos en float32, pero no se ha verificado el rendimiento ni la compatibilidad con versiones estándar de lerobot.
- Opciones de despliegue: librería `lerobot` con la política `PI0Policy`; no se han documentado integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (4,4-5,5 s por paso en TPU v4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_ours | ~4,03B (3B VLM + 300M experto) | no disponible | 91,3 % medio (protocolo del autor) | gemma | Hugging Face |
| niwniwniw/smolvla_ours | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| niwniwniw/pi0_cfg | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| lerobot/pi0_base | ~4,03B | no disponible | no disponible (modelo base) | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparación se limita a la relación de linaje y receta.

## Limitaciones y advertencias

- Requiere un parche de compatibilidad (`pi0_compat.py`): con `transformers` 5.5.4, el código pi0 de lerobot escalaba los tokens de imagen y de lenguaje por sqrt(2048) dos veces. Sin el parche, las salidas son incorrectas; hay que verificar las escalas de tokens antes de confiar en los resultados.
- El autor no ha probado la descarga del repositorio y su carga con una release estándar de lerobot, por lo que el flujo de carga puede fallar sin ajustes.
- Modelo de investigación: no es un LLM de propósito general y no debe usarse para generación de texto, código, matemáticas ni diálogo.
- Evaluación limitada a simulación: los 91,3 % de éxito corresponden a LIBERO en simulación con un protocolo concreto; no hay evidencia de transferencia a robots reales.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con demostraciones de LIBERO, el modelo hereda las limitaciones de ese conjunto (tareas, objetos y entornos acotados).
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí puede generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia `gemma`: impone restricciones de uso comercial derivadas de los términos de Gemma; conviene revisarlos antes de cualquier despliegue en producción.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea provienen del conjunto LIBERO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niwniwniw/pi0_ours
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceVLA/libero
- Variante con dropout de condicionamiento: https://huggingface.co/niwniwniw/pi0_cfg
- Contraparte SmolVLA: https://huggingface.co/niwniwniw/smolvla_ours
