# Onol/pi05-piper-toothbrush-into-cup-lora

## Resumen

El modelo `Onol/pi05-piper-toothbrush-into-cup-lora` es un adaptador LoRA sobre el modelo base `physical-intelligence/pi0.5`, desarrollado por el usuario Onol y publicado bajo licencia Apache-2.0. Se trata de un checkpoint de robótica entrenado con la librería `openpi` (JAX) para la tarea específica de introducir un cepillo de dientes en un vaso, a partir de un dataset de 32 episodios y 31 484 fotogramas. El modelo se presenta como una demostración de fine-tuning de π0.5, un VLA (vision-language-action) de flujo con backbone PaliGemma-2B y un experto de acción de 300M, según la documentación del repositorio `openpi`.

La relevancia de este modelo radica en su carácter de ejemplo práctico para la comunidad de robótica: muestra cómo adaptar un modelo VLA preentrenado a una tarea específica mediante LoRA, reduciendo los costes de entrenamiento. Sin embargo, no se trata de un modelo de propósito general, sino de un adaptador orientado a un escenario concreto de manipulación. El checkpoint incluye estadísticas de normalización y una configuración de OpenPI (`pi05_piper_toothbrush_cup_lora`) que deben usarse para la inferencia. El repositorio tiene un tamaño de 28,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre π0.5 (VLA de flujo, backbone PaliGemma-2B + experto de acción 300M) |
| Parametros totales | no disponible (el LoRA es un adaptador; no se especifica el número) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se usa con openpi/JAX) |

## Arquitectura y entrenamiento

El modelo es un LoRA sobre π0.5, que según la documentación de `openpi` es un modelo de flujo (flow-matching) de 3B parámetros en total, con un backbone PaliGemma-2B y un experto de acción de 300M. El LoRA se entrena solo sobre el backbone y el experto, con rank 16 en PaliGemma y rank 32 en el experto de acción según la configuración típica de `openpi` (aunque en este checkpoint no se especifican los ranks exactos). El entrenamiento se realizó durante 10 000 pasos sobre el dataset `toothbrush_in_cup_32_dual14d_pi05_rgb224_v21`, que contiene 32 episodios y 31 484 fotogramas. La tarea se define con el prompt en inglés "put the toothbrush into the cup".

El modelo recibe como entradas RGB de tres cámaras (superior, muñeca izquierda y muñeca derecha) con formato letterbox de 224×224, y produce una acción de 14 dimensiones: `[L_j1..j6, L_gripper_m, R_j1..j6, R_gripper_m]`. Las 12 articulaciones se predicen como deltas relativos al estado, mientras que las pinzas (grippers) se predicen en metros absolutos, recortados al intervalo `[0, 0.08]`. El horizonte de acción es de 30 pasos. La normalización requiere las estadísticas incluidas en `assets/` y el overlay de OpenPI correspondiente. La validación del modelo solo comprueba la carga del checkpoint y la integridad del pipeline de inferencia, no evalúa la tasa de éxito en un robot real.

## Capacidades

- Tarea específica de manipulación robótica: colocar un cepillo de dientes dentro de un vaso.
- Procesamiento de entradas visuales multicámara (RGB) de 224×224 con letterbox.
- Predicción de acciones de 14 dimensiones (6 articulaciones por brazo + apertura de pinza por brazo) con horizonte de 30 pasos.
- Generación de trayectorias de acción basadas en el estado actual y el prompt de lenguaje.
- No tiene capacidades de generación de texto, código, razonamiento, tool calling ni agentes.
- No es un modelo multilingüe; el prompt de entrenamiento está en inglés.
- No incluye modo de pensamiento, visión más allá de las cámaras especificadas, ni audio.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede integrarse en un brazo robótico bimanual para realizar la tarea concreta de colocar un cepillo de dientes en un vaso, como demostración de manipulación fina en entornos controlados.
- Investigación en aprendizaje por refuerzo y VLA: sirve como ejemplo de fine-tuning con LoRA sobre un modelo base de robótica, permitiendo estudiar el efecto del adaptador en tareas específicas.
- Prototipado rápido de políticas robóticas: con el checkpoint y las estadísticas de normalización, un investigador puede cargar el modelo en `openpi` y ejecutar inferencia en un entorno simulado o en un robot real sin necesidad de entrenar desde cero.
- Evaluación de pipelines de inferencia: el modelo permite probar el flujo completo de OpenPI (carga de checkpoint, normalización, predicción de acciones) en un entorno de desarrollo, aunque el validation report no mide éxito real.
- Benchmark de manipulación bimanual: puede usarse como referencia para comparar la eficacia de diferentes LoRAs en una tarea de precisión con dos brazos y pinzas.
- Educación y demostración de fine-tuning: útil para cursos o tutoriales que expliquen cómo adaptar π0.5 a una tarea específica mediante LoRA, mostrando el flujo de datos, entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica que el validation report solo comprueba la carga del checkpoint y la integridad del pipeline de inferencia, no una evaluación de éxito real sobre el robot. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- El modelo base π0.5 tiene aproximadamente 3B parámetros; el LoRA añade una pequeña cantidad de parámetros adicionales. La inferencia de π0.5 suele requerir al menos 16 GB de VRAM en fp16, aunque no se confirma.
- Es probable que funcione en GPUs de consumo como RTX 4090 (24 GB) o A100/H100 (40-80 GB) para mayor comodidad, pero no hay confirmación.
- El despliegue se realiza mediante la librería `openpi` (JAX), que gestiona el modelo y la inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje, no para VLA.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Licencia | Tamaño repo | Framework |
|---|---|---|---|---|---|
| `Onol/pi05-piper-toothbrush-into-cup-lora` | π0.5 | Cepillo en vaso | Apache-2.0 | 28.5 GB | openpi |
| `Onol/pi05-piper-peg-insertion-lora` | π0.5 | Inserción de clavija | Apache-2.0 | no disponible | openpi |
| `zetanschy/pi05_lora_cap_tu_cup` | π0.5 | Tapa de vaso | no disponible | no disponible | LeRobot / openpi |

No hay datos de rendimiento comparativo. Los tres modelos son LoRAs sobre π0.5 con tareas robóticas específicas, pero no se dispone de métricas de éxito ni de comparaciones directas.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea (colocar cepillo en vaso) con un prompt fijo. No generaliza a otras tareas ni a variaciones del mismo objeto sin reentrenamiento.
- El validation report no evalúa la tasa de éxito en un robot real; solo verifica la carga del checkpoint y la inferencia. Cualquier despliegue en hardware real requiere pruebas adicionales.
- El dataset de entrenamiento es pequeño (32 episodios), lo que puede provocar overfitting y baja robustez ante cambios en el entorno, iluminación o posición de la cámara.
- La normalización de entrada y la configuración de OpenPI son obligatorias; si no se usan las estadísticas de `assets/`, la inferencia puede fallar o dar resultados incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π0.5 tiene su propia licencia (no se detalla aquí) que puede imponer restricciones adicionales.
- No se ha evaluado la seguridad en entornos reales; la manipulación robótica puede causar daños si no se controla adecuadamente.

## Enlaces

- HuggingFace: https://huggingface.co/Onol/pi05-piper-toothbrush-into-cup-lora
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Modelo base: https://huggingface.co/physical-intelligence/pi0.5
- Otros LoRAs similares: https://huggingface.co/Onol/pi05-piper-peg-insertion-lora y https://huggingface.co/zetanschy/pi05_lora_cap_tu_cup
