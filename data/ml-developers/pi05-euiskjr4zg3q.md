# ml-developers/pi05-eUiSKJr4zg3Q

## Resumen

El modelo `ml-developers/pi05-eUiSKJr4zg3Q` es un fine-tune de tipo Vision-Language-Action (VLA) para robótica, denominado por el autor como LingBot-VLA 2.0. Ha sido desarrollado por el usuario `ml-developers` como un ajuste "expert-only" del modelo champion `openroboto-ai/champion`, que a su vez es un espejo de `ApexUltron/pi05-KsYerY3Q8siH`. El objetivo es adaptar un modelo base multimodal para generar acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural.

El modelo tiene 6.375.907.511 parámetros (aproximadamente 6.375B) y sus pesos se distribuyen en formato `safetensors`, con un tamaño de repositorio de 25.5 GB. El proceso de entrenamiento congeló por completo el backbone Qwen3-VL (vision tower, 36 capas LLM y embeddings) y entrenó únicamente el MoE action expert, las proyecciones de acción/estado/tiempo y los heads de alineación. No se dispone de información sobre la longitud de contexto, la licencia ni los idiomas soportados.

Su relevancia radica en el enfoque de entrenamiento eficiente, que reduce el coste computacional al actualizar solo una fracción de los parámetros, preservando el conocimiento del modelo base. Es una propuesta orientada a la investigación en manipulación robótica dentro del ecosistema de benchmarks LIBERO.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Qwen3-VL con experto MoE de acciones |
| Parámetros totales | 6.375.907.511 (6.375B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema VLA compuesto por un backbone Qwen3-VL (vision tower, 36 capas LLM y embeddings) y un experto MoE dedicado a la generación de acciones. El entrenamiento se realizó con `train_expert_only=true`, lo que significa que el backbone se mantuvo congelado y byte-idéntico al modelo padre, y los gradientes se aplicaron exclusivamente al MoE action expert, a las proyecciones de acción/estado/tiempo y a los heads de alineación.

Se ejecutaron 2.000 pasos con el optimizador Muon, una tasa de aprendizaje de 3e-6 a 3e-7 con programación coseno, batch global de 64 y precisión fp32. Los datos de entrenamiento consistieron en demostraciones de LIBERO (lerobot/libero) y rollouts de políticas exitosas recopilados en layouts aleatorizados de las cuatro suites de entrenamiento. No se utilizaron archivos BDDL de suites de evaluación ni estados iniciales de evaluación.

La innovación principal es el ajuste parcial de parámetros, que permite adaptar el modelo a tareas de manipulación robótica sin reentrenar el modelo completo, reduciendo el riesgo de olvido catastrófico y los requisitos computacionales.

## Capacidades

- Generación de acciones robóticas de bajo nivel a partir de imágenes e instrucciones de lenguaje natural.
- Aprendizaje por imitación basado en demostraciones de LIBERO.
- Ejecución de políticas en entornos de manipulación con layouts aleatorizados.
- Integración de visión y lenguaje para tareas de control robótico.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión: sí, heredadas del vision tower de Qwen3-VL.
- Capacidades de razonamiento: heredadas del backbone Qwen3-VL, aunque no se han evaluado específicamente.

## Casos de uso

- Manipulación robótica en entornos simulados LIBERO: el modelo puede recibir comandos como "coloca el bloque azul en la caja" y generar las acciones necesarias para completar la tarea, gracias a su entrenamiento con demostraciones de LIBERO.
- Entrenamiento de políticas por imitación en investigación: investigadores pueden utilizar este modelo como base para fine-tuning en nuevas tareas robóticas, actualizando solo el experto de acción, lo que reduce el coste computacional.
- Integración en pipelines de robótica de laboratorio: el modelo puede desplegarse en un sistema con cámara y control de brazo para traducir instrucciones de un operador en movimientos concretos.
- Evaluación de modelos VLA en benchmarks de manipulación: sirve como referencia para comparar el rendimiento de otros modelos en las cuatro suites de entrenamiento de LIBERO.
- Investigación en generalización de políticas: al haber sido entrenado con layouts aleatorizados, permite estudiar la capacidad del modelo para generalizar a configuraciones no vistas dentro del mismo dominio.
- Desarrollo de asistentes robóticos guiados por lenguaje: en entornos de investigación, el modelo puede actuar como un componente de ejecución de acciones para sistemas de planificación de alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos en safetensors ocupa 25.5 GB, por lo que cargar el modelo en precisión fp32 requiere al menos esa cantidad de memoria (VRAM o RAM).
- GPU recomendadas: no disponibles.
- Si cabe en consumer GPU: con 25.5 GB de pesos, no cabe en GPUs de consumo con memoria inferior a 24 GB sin cuantización; no se han publicado variantes cuantizadas.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo es un fine-tune de `openroboto-ai/champion`, pero no se han publicado resultados de benchmarks que permitan compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: se desconoce si el modelo puede utilizarse en aplicaciones comerciales.
- Entrenado únicamente con datos de LIBERO y rollouts exitosos; el rendimiento en otras tareas robóticas no está validado.
- El entrenamiento no incluyó las suites de evaluación, por lo que la generalización a esas configuraciones no ha sido evaluada.
- Sin benchmarks publicados: no se puede cuantificar su rendimiento frente a otros modelos VLA.
- Capacidades multilingües no documentadas: el soporte de idiomas distintos al utilizado en los datos de LIBERO es desconocido.
- Riesgo de alucinación en acciones: como modelo generativo, puede producir acciones inválidas o incoherentes si recibe entradas fuera de la distribución de entrenamiento.
- Sesgos derivados de los datos de entrenamiento: no se han publicado auditorías de sesgo ni evaluaciones de seguridad o alineación.

## Enlaces

- HuggingFace: https://huggingface.co/ml-developers/pi05-eUiSKJr4zg3Q

No se han encontrado enlaces adicionales en la búsqueda web.
