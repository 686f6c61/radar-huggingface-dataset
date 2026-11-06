# BabyClaw/duck-skill-20261105-roller-sprint-2m

## Resumen

Duck Skill Rollers es una política de control obtenida por búsqueda de políticas (policy search) sobre los pesos de referencia de Pollen Robotics, publicada en Hugging Face bajo el identificador `BabyClaw/duck-skill-20261105-roller-sprint-2m`. No es un modelo de lenguaje: es una política de robótica para simulación, exportada en formato ONNX para inferencia en CPU, con 61 observaciones de entrada y 14 acciones de salida. Pertenece a la familia de skills `microduck` con slot `walk` y variante `roller-sprint-2m`, y está pensada para su evaluación en la arena oficial de Pollen Robotics.

El modelo se deriva de los pesos de referencia `pollen-robotics/microduck-roller-sprint-2m-reference` mediante un pipeline compartido de entrenamiento y búsqueda de políticas. La selección se realizó con 45 arranques de desarrollo y se validó sobre arranques finales separados, con una puntuación local de 2,605 y una puntuación oficial declarada de 2,6. El repositorio contiene únicamente la política seleccionada, su manifiesto y la evidencia de evaluación local; el tamaño del repo es de 0,0 GB.

Es relevante en el contexto de robótica simulada y aprendizaje por refuerzo ligero porque ilustra un flujo de trabajo reproducible: política congelada con hash SHA-256, procedencia trazable, selección por búsqueda afín y validación separada. La puntuación local es indicativa y la arena mide el resultado oficial, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control para robótica (no disponible en detalle; derivada de pesos de referencia microduck) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (61 observaciones de entrada, 14 acciones de salida) |
| Tipos de cuantizacion | no disponible (exportación ONNX para inferencia CPU) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (capas, tipo de transformer o MLP, función de activación). Lo que sí se documenta es el pipeline: la política parte de los pesos de referencia `pollen-robotics/microduck-roller-sprint-2m-reference` (revisión `c72fb92594e8b415487e87dfeed509141afc5e25`, SHA-256 `01edf63a...`) y se obtiene mediante una búsqueda afín (`affine_search`) en un pipeline compartido de entrenamiento y policy-search. La generación 148 del registro de búsqueda produjo la política candidata, con un donante identificado por SHA-256 `5dce2ca2...` y un vector de 28 parámetros de búsqueda registrado en la procedencia.

La selección se hizo sobre 45 arranques de desarrollo (`qualification_key: [1, 45, -2.6053333333333337]`), con 45 éxitos sobre 45 y una puntuación de 2,6053333333333337; la puntuación oficial declarada es 2,6. La política congelada tiene SHA-256 `fcaeca665ee66d6f855d5c6fc5cf0b3553f1d26e10ae65aece81a92a488accbe` y requiere evaluación oficial final (`requires_final_official_evaluation: true`). No se documentan número de tokens de entrenamiento, composición del dataset, RLHF ni DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Control de locomoción en simulación para el skill `walk` en la variante `roller-sprint-2m`, con 61 observaciones de entrada y 14 acciones de salida.
- Inferencia en CPU mediante exportación ONNX, sin dependencia de GPU.
- Integración con el pipeline `microduck` y la arena oficial de Pollen Robotics.
- Política congelada y verificable por hash SHA-256, con manifiesto de procedencia trazable.
- Evaluación reproducible sobre arranques de desarrollo y arranques finales separados.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, por lo que deben considerarse no disponibles.

## Casos de uso

- Evaluación en la arena oficial de Pollen Robotics: la política está publicada específicamente para el evento `roller-sprint-2m` en `https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/roller-sprint-2m`, donde se mide el resultado oficial frente a la puntuación local indicativa.
- Reproducción de experimentos de policy search: el manifiesto incluye hashes de selección, política congelada, evaluación de desarrollo y pesos de referencia, lo que permite reproducir la cadena de procedencia en un pipeline de investigación.
- Benchmarking de skills `microduck`: sirve como candidata base para comparar variantes del slot `walk` dentro de la familia microduck.
- Inferencia ligera en CPU: al estar exportada en ONNX, puede ejecutarse en entornos sin GPU para pruebas de bucle cerrado en simulación.
- Auditoría de procedencia en robótica: los hashes SHA-256 de política, selección y referencia permiten verificar que los pesos evaluados son exactamente los publicados.
- Docencia y experimentación en aprendizaje por refuerzo: el repositorio documenta el flujo completo desde pesos de referencia hasta política seleccionada, útil como ejemplo de pipeline reproducible.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Puntuacion local (desarrollo) | 2,6053333333333337 |
| Exitos / total en desarrollo | 45 / 45 |
| Puntuacion oficial declarada | 2,6 |
| Evaluacion oficial final | pendiente (`requires_final_official_evaluation: true`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX; no requiere GPU según la model card.
- VRAM estimada: no aplica para la ruta CPU; no se dispone de estimación para GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX en CPU; integración con el pipeline `microduck` y la arena de Pollen Robotics.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyClaw/duck-skill-20261105-roller-sprint-2m | no disponible | 61 obs. / 14 acc. | 2,6 oficial (local 2,605) | no disponible | Hugging Face |
| pollen-robotics/microduck-roller-sprint-2m-reference | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas `microduck` del slot `walk` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parámetros, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- La puntuación local es indicativa; el resultado oficial lo determina la arena de Pollen Robotics.
- La evaluación oficial final está marcada como pendiente (`requires_final_official_evaluation: true`).
- Licencia no disponible: verificar condiciones antes de cualquier uso comercial.
- No es un modelo de lenguaje: no dispone de capacidades de texto, visión, audio ni tool calling.
- Uso limitado a simulación y al skill `walk` en la variante `roller-sprint-2m`; no se documenta transferencia a robot físico.
- El repositorio es de tamaño 0,0 GB y contiene solo política, manifiesto y evidencia local; no incluye dataset ni registro completo de entrenamiento.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de una política de control.

## Enlaces

- Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-roller-sprint-2m
- Arena oficial: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/roller-sprint-2m
- Referencia base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
