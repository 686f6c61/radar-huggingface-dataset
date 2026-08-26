# birbirll/g1-inspire-nut-in-box-n16-abs

## Resumen

`birbirll/g1-inspire-nut-in-box-n16-abs` es un fine-tune del modelo VLA (Vision-Language-Action) `nvidia/GR00T-N1.6-3B`, desarrollado por birbirll (Peiyu Song) para la tarea de manipulación robótica "nut in box" con pinzas sobre el humanoide Unitree G1 equipado con manos dexteras Inspire. El modelo debe recoger las pinzas y colocar la tuerca en la caja, operando con acciones absolutas (modo `GR00T_REL_ACTION=0`), lo que elimina la necesidad de decodificación relativa durante el servicio. Es el gemelo en acciones absolutas de `g1-inspire-nut-in-box-n16-rel`, que usa acciones relativas y una partición de datos de 29 episodios.

El modelo cuenta con 3.286.610.368 parámetros (~3,29 B), se distribuye bajo licencia Apache 2.0 y se entrenó sobre 36 episodios exitosos (~72,7 k frames a 60 fps) del dataset `MLeggiero/g1-inspire-nut-in-box-twist2` en formato LeRobot v2.1. Su relevancia radica en que demuestra un pipeline completo de fine-tuning de GR00T N1.6 para tareas de manipulación bimanual de precisión con manos dexteras, con validación open-loop sobre episodios de control.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en GR00T N1.6-3B |
| Parametros totales | 3.286.610.368 (~3,29 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (modelo VLA orientado a robotica, sin capacidades linguisticas documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de GR00T N1.6-3B de NVIDIA, diseñada para integrar percepción visual multi-cámara, estado del robot y generación de acciones. En este fine-tune, la entrada visual proviene de tres cámaras: cámara de cabeza a 1280x720 y dos cámaras ojo de pez en las muñecas a 1920x1080, procesadas a fotograma completo. El estado del robot es de 17 dimensiones (cintura 3 + brazo izquierdo 7 + brazo derecho 7), y el contrato de acciones es de 27 dimensiones: brazos 14, registros de la mano derecha Inspire 6, altura de raíz / velocidad lineal xy / velocidad de guiñada 4, y cintura 3. El horizonte de predicción es de 30 pasos.

El entrenamiento se realizó durante 10.000 pasos con batch efectivo de 256 (sin acumulación de gradientes), en precisión bf16, sobre una única GPU NVIDIA B200, alcanzando una pérdida final de entrenamiento de 0,043. El dataset se filtró por éxito, reteniendo 36 episodios de teleoperación, con revisión del operador que reincorporó 7 episodios límite respecto a la partición de 29 episodios del gemelo relativo. La innovación técnica principal es el uso de acciones absolutas, que simplifica el servicio al no requerir decodificación relativa de las acciones predichas.

## Capacidades

- Manipulación bimanual de precisión: ejecuta la tarea de recoger pinzas y colocar una tuerca en una caja con el humanoide Unitree G1.
- Percepción multi-cámara: procesa simultáneamente tres flujos visuales (cabeza y dos muñecas) a resolución completa.
- Control de acciones absolutas: genera comandos de acción en coordenadas absolutas (27-D), sin necesidad de post-procesado relativo.
- Integración con manos dexteras Inspire: controla 6 registros de la mano derecha además de los 14 grados de libertad de los brazos.
- Control de base y cintura: predice altura de raíz, velocidades lineales xy, velocidad de guiñada y cintura (7 dimensiones adicionales).
- Validación open-loop: demostrada capacidad de seguimiento de trayectorias con correlación perfecta en episodios de prueba.

## Casos de uso

- Investigación en fine-tuning de VLA para humanoides: el modelo sirve como referencia reproducible para adaptar GR00T N1.6 a tareas específicas de manipulación con LeRobot v2.1, incluyendo el pipeline completo de datos, entrenamiento y evaluación.
- Benchmarking de representaciones de acción: comparación directa con el gemelo relativo `g1-inspire-nut-in-box-n16-rel` para estudiar el impacto de acciones absolutas frente a relativas en la calidad del seguimiento y la facilidad de despliegue.
- Tareas de pick-and-place de precisión en entornos controlados: la tarea de tuerca en caja con pinzas exige control fino de fuerza y posición, útil como banco de pruebas para manipulación delicada.
- Evaluación de control open-loop en robótica humana: los resultados de la compuerta open-loop (correlación 1,00 en brazos, cintura y mano) permiten validar la calidad del modelo antes de cerrar el lazo con políticas de control reactivo.
- Desarrollo de pipelines de teleoperación y filtrado por éxito: el dataset subyacente demuestra un flujo de adquisición de demostraciones, filtrado por éxito y revisión por operador que puede replicarse en otras tareas.
- Transferencia a tareas de manipulación similares: la arquitectura y el contrato de acciones (27-D) pueden servir como punto de partida para fine-tunes adicionales en tareas de inserción, ensamblaje o manipulación de objetos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, al tratarse de un modelo de robótica especializado. La evaluación reportada es una compuerta open-loop sobre 3 episodios (incluyendo dos reincorporados por el operador) con 17 fotogramas de prueba:

| Metrica | Valor |
|---|---|
| Correlacion brazos | 1,00 |
| RMS brazos | 0,024-0,027 rad |
| Correlacion cintura | 1,00 |
| RMS cintura | 0,006 rad |
| Correlacion mano | 1,00 |
| RMS mano | ~15 registros (escala 0-1000) |
| Perdida final de entrenamiento | 0,043 |

El episodio 35 (reincorporado por el operador por ser límite) se sigue limpiamente en todos los fotogramas de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 de ~3,29 B parámetros ocupan aproximadamente 6,6 GB; con activaciones, caché KV y procesamiento de imágenes de tres cámaras, se recomiendan al menos 16-24 GB de VRAM (estimación basada en el tamaño del modelo; no hay datos oficiales de requisitos de inferencia).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior para inferencia local; la GPU de entrenamiento fue una única NVIDIA B200.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 o RTX 3090 (24 GB) debería ser suficiente para inferencia en bf16; cuantizaciones adicionales (si se generan) podrían reducir el requisito a 12 GB.
- Opciones de despliegue: al ser un modelo VLA de robótica, el despliegue típico requiere un framework de robótica que gestione la entrada de cámaras y el contrato de acciones; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; depende del hardware de inferencia y del pipeline de captura de imágenes.

## Comparativa con modelos similares

| Modelo | Acciones | Episodios de entrenamiento | Correlacion open-loop | Licencia |
|---|---|---|---|---|
| `g1-inspire-nut-in-box-n16-abs` (este) | Absolutas | 36 | 1,00 (brazos, cintura, mano) | Apache 2.0 |
| `g1-inspire-nut-in-box-n16-rel` | Relativas | 29 | no disponible | Apache 2.0 |
| `nvidia/GR00T-N1.6-3B` (base) | Generalista | no disponible | no aplica | no disponible |
| Fine-tunes pi0.5 sobre el mismo contrato | no disponible | no disponible | no disponible | no disponible |

El gemelo relativo comparte arquitectura, contrato de acciones y tarea, pero usa acciones relativas y una partición de datos de 29 episodios. Los fine-tunes de pi0.5 sobre el mismo contrato se entrenaron por separado y no se dispone de sus métricas. La comparación con el modelo base GR00T N1.6-3B no es directa, ya que el base es un modelo generalista de robótica y este es un fine-tune especializado.

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados: solo 36 episodios de teleoperación, lo que puede provocar sobreajuste a las condiciones específicas de recogida de datos (iluminación, posición de cámara, configuración del robot).
- Especialización extrema: el modelo está entrenado exclusivamente para la tarea "nut in box" con pinzas; no es adecuado para otras tareas de manipulación sin fine-tuning adicional.
- Dependencia de hardware específico: requiere el humanoide Unitree G1 con manos Inspire; el contrato de 27-D de acciones está ligado a esta configuración concreta.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir acciones inconsistentes fuera de la distribución de entrenamiento; la validación open-loop no garantiza el rendimiento en lazo cerrado.
- Sin datos de generalización: no se reportan experimentos de robustez ante variaciones de iluminación, pose del objeto o perturbaciones externas.
- Limitaciones de idioma: al ser un modelo VLA especializado, no se documentan capacidades de comprensión o generación de lenguaje natural.
- Fecha de creación futura: el modelo fue creado el 2026-08-26; verificar la vigencia de los enlaces y la compatibilidad con versiones actuales de los frameworks antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/birbirll/g1-inspire-nut-in-box-n16-abs
- Gemelo relativo: https://huggingface.co/birbirll/g1-inspire-nut-in-box-n16-rel
- Modelos del autor: https://huggingface.co/birbirll/models
- Dataset relacionado (piston pick-and-place): https://claru.ai/datasets/birbirll-g1-inspire-piston-pick-place
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
