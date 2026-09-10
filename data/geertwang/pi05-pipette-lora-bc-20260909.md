# GeertWang/pi05-pipette-lora-bc-20260909

## Resumen

El modelo `GeertWang/pi05-pipette-lora-bc-20260909` es un checkpoint de clonación de comportamiento (behavior cloning) del modelo de visión-lenguaje-acción π0.5, guardado en el formato nativo de JAX/Orbax que utiliza la librería openpi. Lo desarrolla el usuario GeertWang y consiste en un ajuste fino con LoRA sobre los pesos oficiales `gs://openpi-assets/checkpoints/pi05_base`, orientado a una única tarea robótica sobre un robot G1: acoplar una punta de pipeta, levantarla, desplazarse a la caja de residuos y expulsarla.

El modelo no es un modelo de lenguaje generalista, sino una política de control entrenada por imitación con 37 episodios de entrenamiento y 9 episodios reservados, a partir de tres cámaras (frontal, muñeca izquierda y muñeca derecha) y un vector de estado de 32 dimensiones (29 posiciones articulares medidas más la posición XYZ de la mano derecha en el marco de la pelvis). Su salida son 10 pasos de incrementos cartesianos XYZ en metros por paso a 30 Hz. El checkpoint corresponde al pilot de 1.000 actualizaciones (índice 999), pensado como snapshot reproducible y como fuente de la previsualización de inferencia de una interfaz local de operador.

Su relevancia es acotada pero ilustrativa: documenta de forma completa el contrato de entrada/salida, el entorno de entrenamiento (Python 3.11, JAX 0.5.3, Flax 0.10.2, NumPy 1.26.4), el overlay de código exacto sobre VLA-Precision y los sumas de verificación SHA256. Con 0 descargas y 0 likes, es un artefacto de investigación en fase piloto, sin licencia declarada y sin resultados de benchmarks de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) π0.5 nativa en JAX/Flax; backbone de lenguaje y experto de acción, ajustados con LoRA |
| Parámetros totales | No disponible (el repositorio declara las variantes `gemma_2b_lora` + `gemma_300m_lora`; el árbol de parámetros de inferencia ocupa ~6,34 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 200 tokens (límite de tokens declarado en el contrato del modelo) |
| Tipos de cuantización | No disponible (checkpoint nativo Orbax/OCDBT; el loader portátil exporta a NPZ) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | No disponible |
| Formato de pesos | Orbax/OCDBT nativo de JAX (`checkpoints/999/params/`); exportación a NPZ mediante `source/load_policy.py` |
| Tamaño del repositorio | 9,5 GB (params ~6,34 GB, train_state ~3,19 GB, más assets, código y evaluación) |
| Entradas | `observation.state` float32 [32]; imágenes `rgb`, `wrist_left`, `wrist_right` en uint8 RGB, redimensionadas y con padding nativo a 224×224 |
| Salidas | 10 × 3 incrementos cartesianos XYZ, en metros por paso a 30 Hz, en el marco de la pelvis |
| Dimensión interna de acción | 32, de la que se exponen las tres primeras como XYZ |
| Hardware de entrenamiento | Una NVIDIA RTX PRO 5000 Blackwell (clase 48 GB) |
| Librería | openpi |

## Arquitectura y entrenamiento

La arquitectura es la de π0.5 en su implementación openpi: un modelo de visión-lenguaje-acción que combina un backbone tipo Gemma (variante `gemma_2b_lora`) con un experto de acción (`gemma_300m_lora`), ejecutado sobre JAX 0.5.3 y Flax 0.10.2. El ajuste se realizó con LoRA, pero con un filtro de congelación que deja también entrenables el codificador de visión y las proyecciones pequeñas; por eso el autor advierte que cargar únicamente los adaptadores sobre el modelo base omitiría pesos entrenados y produciría resultados incorrectos. El estado se representa con los tokens de estado discretos nativos de π0.5 tras normalización por cuantiles, y las estadísticas de normalización se conservan en `checkpoints/999/assets/local/g1-pipette-pi05-30hz/norm_stats.json`.

El entrenamiento consistió en 1.000 actualizaciones con batch de 4, tasa de aprendizaje máxima de 5e-5, 100 pasos de calentamiento y sin EMA. Los datos proceden del dataset `jren313/g1-pipette-3view-hgdagger-20260904` (revisión `e74439f3eb2257661145571571b2dfaa5592f734`), con división por episodios completos: 37 episodios de entrenamiento y 9 reservados. Los episodios cubren la secuencia completa de aproximación, levantamiento y eliminación, no un recorte limitado al acoplamiento. El prompt de entrenamiento es fijo: «Attach a pipette tip to the pipette, lift it, then move to the disposal box and eject the tip». No se documentan en la información disponible fases de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de acciones robóticas: predice 10 pasos de incrementos cartesianos XYZ en metros por paso a 30 Hz, en el marco de la pelvis, para el robot G1.
- Percepción multimodal: consume tres flujos RGB simultáneos (`rgb`, `wrist_left`, `wrist_right`) redimensionados a 224×224.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea (el prompt de pipeta), dentro del límite de 200 tokens.
- Clonación de comportamiento: reproduce trayectorias de demostración humana para la secuencia de acoplar, levantar y expulsar una punta de pipeta.
- Integración con inferencia nativa: incluye un loader portátil (`source/load_policy.py`) que permite evaluar observaciones guardadas en NPZ sin acceso a las rutas del dataset de entrenamiento.
- Idiomas: el modelo declara soporte de inglés y chino, aunque el uso práctico del prompt está ligado a la instrucción de entrenamiento.
- No soporta: predicción de comandos de pinza ni de orientación. No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas ni código.

## Casos de uso

- Automatización de laboratorio con pipetas: el modelo puede ejecutar la secuencia de acoplar punta, levantarla y expulsarla en un banco de pipeteo robotizado, siempre que la tarea coincida con la instrucción de entrenamiento y el robot sea un G1 con la misma disposición de cámaras.
- Previsualización de inferencia en una interfaz de operador: el propio autor lo usa como fuente de la previsualización de la GUI local, evaluando `inputs.npz` capturados por la interfaz mediante `load_policy.py`.
- Punto de partida para nuevos ajustes finos: al conservar `checkpoints/999/train_state/` y la receta YAML original, sirve para reanudar el entrenamiento o para adaptar la política a una tarea análoga con el mismo contrato de estado y cámaras.
- Reproducción de experimentos: el overlay `source/pipette-training-overlay.tar.gz` sobre el commit `75eb56a35ca6e8c3ee0a0a3d41b99e88be469b81` de VLA-Precision y los sumas SHA256 permiten reconstruir el entorno exacto de entrenamiento.
- Validación de pipelines de comportamiento en robótica: útil para comprobar la integración de un checkpoint JAX/Orbax con un bucle de control a 30 Hz antes de escalar a tareas mayores.
- Comparación de estrategias de ajuste con LoRA: permite estudiar el efecto del filtro de congelación que deja entrenables el codificador de visión y las proyecciones pequeñas, frente a un ajuste limitado a adaptadores.
- Docencia y prototipado en investigación VLA: como ejemplo completo de contrato de entrada/salida, normalización por cuantiles y evaluación por horizonte de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para métricas estándar (MMLU, HumanEval, GSM8K u otras), que además no aplican a una política de control robótica.

La model card incluye una evaluación piloto sobre 144 fragmentos reservados completos (16 por episodio de validación) con horizonte 10, cuyas métricas son errores de incrementos de acción en milímetros por paso a 30 Hz, no error físico de alineación de la punta ni tasa de éxito de acoplamiento. La tabla de resultados aparece truncada en la información disponible (corta en la cabecera `| Policy | XYZ component RMSE (mm/st`), por lo que los valores numéricos no están disponibles.

| Aspecto evaluado | Dato disponible |
|---|---|
| Fragmentos reservados | 144 (16 por episodio de validación) |
| Horizonte de predicción | 10 pasos |
| Métrica | RMSE por componente XYZ, en mm por paso a 30 Hz |
| Valores numéricos | No disponibles (tabla truncada en la información proporcionada) |
| Comparación con otros modelos | No disponible |

## Requisitos de hardware

- VRAM de entrenamiento documentada: una NVIDIA RTX PRO 5000 Blackwell de clase 48 GB.
- VRAM de inferencia estimada: el árbol de parámetros de inferencia ocupa ~6,34 GB, a los que hay que sumar el estado de normalización, el codificador de visión y las activaciones de tres imágenes a 224×224. Estimación orientativa: 10-16 GB en total según precisión y tamaño de lote. Es una estimación, no un dato publicado.
- GPU recomendadas: RTX PRO 5000 Blackwell (configuración validada para entrenamiento), A100, H100 o GPUs de clase 24 GB o superior para inferencia.
- GPU de consumo: es plausible que quepa en una RTX 4090 (24 GB) o RTX 5090 (32 GB) para inferencia, dado el tamaño del checkpoint, aunque no hay confirmación publicada.
- Opciones de despliegue: entorno nativo openpi/VLA-Precision con JAX sobre CUDA, y el loader portátil `source/load_policy.py` con exportación a NPZ. No se mencionan soportes de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; estos no aplican al formato nativo Orbax de un policy JAX.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de referencia, 30 Hz, con 10 pasos de acción por inferencia y 10 pasos de flujo de evaluación.
- Almacenamiento: el snapshot completo requiere ~9,5 GB; una descarga solo para inferencia puede limitarse a `checkpoints/999/params/**`, `checkpoints/999/assets/**`, `model_metadata.json`, `source/**` y `README.md`.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos comparables en la información proporcionada. La única comparación trazable es contra el checkpoint base del que deriva este ajuste.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pipette-lora-bc-20260909 | No disponible (~6,34 GB de params; variantes `gemma_2b_lora` + `gemma_300m_lora`) | 200 tokens | Solo evaluación piloto de acciones, con valores no disponibles | No disponible | HuggingFace, 0 descargas, 0 likes |
| `gs://openpi-assets/checkpoints/pi05_base` (base oficial de OpenPI) | No disponible | No disponible | No disponible | No disponible | Referenciado como pesos base; revisión OpenPI `2d70d966582e711128ad8358d8dbf23d2cc3d658` |
| Otros VLA de la misma categoría (por ejemplo π0, OpenVLA, GR00T N1) | No disponible | No disponible | No disponible | No disponible | No se aportan datos en la información proporcionada |

## Limitaciones y advertencias

- Tarea única: la política está entrenada para una sola instrucción (acoplar, levantar y expulsar una punta de pipeta). No generaliza a otras tareas ni a otras instrucciones de lenguaje.
- No predice comandos de pinza ni orientación; solo incrementos de posición XYZ. Cualquier control de agarre u orientación debe resolverse externamente.
- Contrato de entrada rígido: exige exactamente 29 posiciones articulares medidas más la posición XYZ de la mano derecha en el marco de la pelvis, y tres cámaras concretas. El autor advierte que los nombres de cámara de muñeca ya están corregidos y no deben intercambiarse de nuevo.
- Carga incompleta peligrosa: cargar solo los adaptadores LoRA sobre el modelo base omite pesos entrenados (codificador de visión y proyecciones pequeñas) y produce inferencias incorrectas. Debe preservarse el árbol `params/` completo, incluidos los manifiestos OCDBT y los blobs de datos.
- Sesgos: no se documenta ningún análisis de sesgos. El dataset procede de demostraciones humanas en una configuración concreta de laboratorio, por lo que hereda sus sesgos de trayectoria y de distribución de escenas.
- Alucinación en el sentido robótico: al ser una política de comportamiento, el riesgo se traduce en acciones fuera de distribución ante estados, iluminación o posiciones de cámara no vistas durante el entrenamiento.
- Idiomas: aunque se declaran inglés y chino, no hay evidencia de evaluación multilingüe; el prompt efectivo es el de entrenamiento.
- Limitación de contexto: 200 tokens, suficiente para instrucciones cortas pero no para diálogo o razonamiento extenso.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Es un riesgo legal relevante para cualquier despliegue en producción.
- Estado piloto: 1.000 actualizaciones con batch 4 sobre 37 episodios es un entrenamiento corto; los propios materiales lo etiquetan como pilot. Las métricas publicadas miden error de incrementos de acción, no éxito real de la tarea.
- Evaluación incompleta en la información disponible: la tabla de resultados está truncada y no permite verificar el rendimiento numérico.
- Reproducibilidad dependiente del entorno: el overlay incluye `pyproject.toml` y `uv.lock` de un entorno Linux/CUDA concreto, y las rutas a compiladores locales, FFmpeg y datasets pueden requerir ajustes en otra máquina.
- Sin validación por terceros: 0 descargas y 0 likes implican ausencia de revisión externa o de replicación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeertWang/pi05-pipette-lora-bc-20260909
- Repositorio VLA-Precision (commit de referencia `75eb56a35ca6e8c3ee0a0a3d41b99e88be469b81`): https://github.com/scy-v/VLA-Precision
- Pesos base oficiales de π0.5: `gs://openpi-assets/checkpoints/pi05_base` (revisión OpenPI `2d70d966582e711128ad8358d8dbf23d2cc3d658`)
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-3view-hgdagger-20260904 (revisión `e74439f3eb2257661145571571b2dfaa5592f734`)
- Cargador portátil de inferencia: `source/load_policy.py` dentro del repositorio del modelo
- Overlay de código de entrenamiento: `source/pipette-training-overlay.tar.gz` dentro del repositorio del modelo
- Metadatos y sumas de verificación: `model_metadata.json`, `file_manifest.json`, `SHA256SUMS` dentro del repositorio del modelo

Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relacionados con este modelo (corresponden a otros temas), por lo que no se incluyen.
