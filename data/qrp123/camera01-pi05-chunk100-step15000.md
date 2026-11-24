# QRP123/camera01-pi05-chunk100-step15000

## Resumen

`QRP123/camera01-pi05-chunk100-step15000` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, un modelo de política visomotora (vision-language-action, VLA) orientado a robótica y publicado dentro del ecosistema LeRobot de Hugging Face. El checkpoint ha sido entrenado por el usuario QRP123 con un horizonte de acción de 100 pasos (chunk100) y en el paso 15.000 del entrenamiento, lo que sugiere un uso experimental o de investigación más que un lanzamiento de producto. El modelo está etiquetado como `pipeline: robotics` y utiliza la librería `lerobot` para su carga e inferencia.

El modelo hereda la arquitectura y el conocimiento del `pi05_base`, del que no se dispone de documentación detallada en la información proporcionada, pero que por su nombre y linaje se asocia a la familia de modelos π0 (pi-zero) de Physical Intelligence, basados en un transformer multimodal que combina un codificador visual, un backbone de lenguaje y un cabezal de acciones. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), se sitúa en un rango de tamaño manejable para inferencia en GPU de gama alta y media.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint concreto de robótica de código abierto (aunque con acceso restringido); por otro, sirve de ejemplo de cómo se publican y versionan los ajustes finos de políticas VLA en LeRobot. Es importante señalar que el repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo, y la licencia es la de Gemma, lo que impone restricciones adicionales de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo base `lerobot/pi05_base`; detalles internos no disponibles |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 10,5 GB |
| Modelo base | `lerobot/pi05_base` (fine-tuning) |
| Horizonte de accion (chunk) | 100 pasos |
| Paso de entrenamiento | 15.000 |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el linaje (`lerobot/pi05_base`) y la nomenclatura de la familia π0, cabe esperar un transformer multimodal que procesa observaciones visuales (cámaras) y posiblemente instrucciones en lenguaje natural, y que emite secuencias de acciones motoras. El sufijo `chunk100` indica que el modelo predice bloques de 100 acciones por inferencia (action chunking), una técnica habitual en políticas visomotoras para reducir la frecuencia de decisión y mejorar la suavidad del control. El sufijo `step15000` indica que el checkpoint corresponde al paso 15.000 del entrenamiento.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el dataset de robótica concreto empleado en el ajuste fino, más allá de la referencia `camera01` en el nombre, que sugiere el uso de una única cámara como entrada visual. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Control visomotor robótico: genera secuencias de acciones (action chunks de 100 pasos) a partir de observaciones visuales, orientado a manipulación y navegación.
- Entrada visual por cámara: el nombre `camera01` indica que el modelo fue ajustado con una única cámara como fuente de observación.
- Integración con LeRobot: carga e inferencia mediante la librería `lerobot`, con pipelines estándar de evaluación y despliegue en robots compatibles.
- Generación de acciones en bloque: el chunking de 100 acciones permite políticas de control con menor latencia de decisión.
- Capacidades de lenguaje y tool calling: no disponibles en la información proporcionada; no se documenta explícitamente soporte de instrucciones en lenguaje natural ni function calling.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión avanzada o audio: no disponibles.

## Casos de uso

- Investigación en políticas visomotoras: servir como checkpoint de referencia para reproducir o comparar experimentos de fine-tuning sobre `pi05_base` con horizonte de 100 acciones.
- Manipulación robótica con una cámara: el modelo puede emplearse en tareas de pick-and-place o ensamblaje donde solo se dispone de una vista monocámara, aprovechando el ajuste específico `camera01`.
- Evaluación de action chunking: útil para estudiar el efecto del tamaño de chunk (100) en la suavidad y estabilidad del control en brazos robóticos.
- Benchmarking de fine-tunes: al ser un checkpoint intermedio (step 15.000), permite analizar curvas de aprendizaje y comparar con otros pasos del mismo entrenamiento.
- Prototipado en laboratorio: despliegue en robots de investigación compatibles con LeRobot para validar políticas antes de entrenamientos más largos o con más sensores.
- Docencia y formación: ejemplo práctico de cómo se publica y versiona un fine-tune de robótica en Hugging Face, incluyendo el flujo de acceso restringido y licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros en safetensors (probablemente fp32/bf16), la carga completa requiere del orden de 8-16 GB de VRAM; en cuantización de 8 bits podría reducirse a ~5-6 GB, y en 4 bits a ~3-4 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100, H100, L40S o RTX 4090 para inferencia en precisión completa; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: librería `lerobot` (principal); no se documenta soporte oficial de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| `QRP123/camera01-pi05-chunk100-step15000` | 4,14 B | no disponible | gemma | Restringido | Fine-tune de `pi05_base`, chunk 100, step 15.000 |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva este checkpoint |
| Otros fine-tunes de `pi05_base` en LeRobot | variable | no disponible | variable | variable | No se dispone de datos comparativos publicados |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría (políticas VLA como π0, OpenVLA o RT-2); los datos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; revisar los términos antes de cualquier despliegue en producción.
- Checkpoint experimental: el nombre indica un paso intermedio (step 15.000) y un ajuste con una sola cámara; no hay evidencia de validación exhaustiva.
- Sin documentación de entrenamiento: no se conocen dataset, número de tokens ni metodología, lo que dificulta evaluar sesgos y generalización.
- Riesgo de sobreajuste al entorno de entrenamiento: al usar una única cámara (`camera01`), el modelo puede degradarse en configuraciones con múltiples vistas o iluminación distinta.
- Idiomas y contexto: no disponibles; no se puede garantizar soporte multilingüe ni ventanas de contexto largas.
- Alucinación y seguridad física: en robótica, errores de política pueden causar daños físicos; se recomienda supervisión humana y límites de seguridad en el robot.
- Sin benchmarks publicados: no hay métricas objetivas de éxito en tareas que permitan comparar con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/QRP123/camera01-pi05-chunk100-step15000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
