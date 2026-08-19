# Parv-09/patchpolicy-so101-expert16w216-flow-bidir

## Resumen

El modelo `patchpolicy-so101-expert16w216-flow-bidir` es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09 como parte de una ablación controlada sobre arquitecturas de acción. Combina un trunk congelado DINOv2 ViT-S/14, que extrae tokens de parche densos de tres cámaras, con un head de acción basado en SmolVLA (16 capas, ancho 216) entrenado mediante flow matching y atención bidireccional entre los tokens de acción. El modelo predice un chunk de 24 pasos de articulación (6 grados de libertad) a partir de observaciones visuales de dos instantes temporales.

La relevancia de este modelo radica en que forma parte de un estudio comparativo que evalúa el impacto del patrón de atención (causal vs. bidireccional) y la arquitectura del head de acción en el rendimiento de políticas de imitación. Según los resultados reportados, la atención bidireccional supera consistentemente a la causal en todos los pares comparados, y entre las variantes con flow matching, el head tipo Patch Policy transformer ofrece mejor pérdida held-out que los heads expertos. El modelo está liberado bajo licencia Apache-2.0 y se distribuye a través de HuggingFace con la librería LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (trunk congelado) + SmolVLA action expert (16 capas, ancho 216) |
| Parametros totales | 33.821.766 (22.056.576 del trunk + 11.765.190 del head) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Visual: 2 timesteps, 1802 tokens por frame (900 parches + 1 token de estado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch pickle (nn.Module, cargado con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura se compone de dos módulos principales. El trunk es un DINOv2 ViT-S/14 preentrenado y congelado, que procesa cada una de las tres cámaras (wrist, front, top) en dos instantes temporales. Cada imagen se recorta a 210x280 píxeles y se divide en parches de 14x14, generando 300 tokens por cámara (15x20). Los tokens de las tres cámaras se concatenan con un token de estado (posición articular normalizada), resultando en 901 tokens por frame, que se apilan en una memoria de 1802 tokens. El head de acción es un SmolVLA de 16 capas con ancho 216, que recibe esta memoria y genera una secuencia de 48 pasos de acción, de los cuales se ejecutan los primeros 24. La atención entre los tokens de acción es bidireccional, lo que permite que cada paso de la secuencia condicione a los demás.

El entrenamiento se realizó sobre el dataset `phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 de teleoperación y 23 de recuperación ante fallos), con 81.943 frames a 30 fps. Se usaron 113 episodios para entrenamiento y 30 para validación. El optimizador fue Adam (β=0.9, 0.95) con tasa de aprendizaje 1e-4 en scheduler coseno con 500 pasos de warmup, weight decay 1e-6, grad clip 10.0, EMA y batch de 64. Se entrenó durante 29 épocas (29.493 pasos). Se aplicó recorte aleatorio en entrenamiento y recorte central en evaluación. La pérdida final de entrenamiento fue 0.010001 y la pérdida held-out 0.052711.

## Capacidades

- Generación de acciones articulares para control de un brazo robótico de 6 grados de libertad.
- Procesamiento de observaciones visuales de tres cámaras simultáneas (muñeca, frontal y superior) en dos instantes temporales.
- Aprendizaje por imitación mediante flow matching, que modela la distribución de acciones condicionada a las observaciones.
- Predicción de secuencias de acción (chunks de 24 pasos) con atención bidireccional entre los pasos, lo que permite coordinar la trayectoria completa.
- Manejo de memoria visual de 1802 tokens por frame, integrando información espacial y temporal.
- Específico para el brazo SO-101; no es transferible directamente a otros robots sin reentrenamiento.
- No es un modelo de lenguaje ni de visión general; su salida es exclusivamente un vector de 24x6 grados.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar tareas de recogida y colocación de objetos (cubos, cilindros) a partir de demostraciones teleoperadas, gracias a su capacidad de imitar trayectorias complejas.
- Recuperación ante fallos: al incluir episodios de recuperación en el dataset, la política puede corregir errores de agarre o posicionamiento durante la ejecución.
- Evaluación de arquitecturas de políticas visuomotoras: al ser parte de una ablación controlada, sirve como referencia para comparar el impacto de la atención bidireccional y el diseño del head de acción en el rendimiento.
- Entrenamiento con pocas demostraciones: con solo 143 episodios, demuestra que es posible aprender tareas de manipulación con un número reducido de ejemplos, útil para entornos donde la recolección de datos es costosa.
- Integración en pipelines de robótica con LeRobot: al usar la librería LeRobot, puede integrarse en sistemas existentes de entrenamiento y despliegue de políticas robóticas.
- Investigación en flow matching para control: sirve como caso de estudio para comparar este objetivo con alternativas como DDPM, aunque las pérdidas no son directamente comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) porque se trata de un modelo de robótica, no de lenguaje. La evaluación reportada se basa en la pérdida held-out durante el entrenamiento. Los resultados de la ablación completa (8 brazos) se muestran a continuación. Es importante señalar que la pérdida held-out no equivale a éxito de tarea, y que las comparaciones entre DDPM y flow matching no son válidas porque minimizan objetivos distintos.

| Par de comparación | Pérdida causal | Pérdida bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

Entre las tres variantes con flow matching, la arquitectura Patch Policy transformer (ppformer) obtuvo la menor pérdida held-out (0.042783), superando a los heads expertos. Duplicar la profundidad del experto (de 8 a 16 capas) no mejoró el resultado.

## Requisitos de hardware

- El modelo tiene aproximadamente 33,8 millones de parámetros en total, de los cuales solo 11,8 millones son entrenables. En precisión fp32, el checkpoint ocupa unos 135 MB, y en fp16 unos 68 MB.
- Inferencia en GPU consumer: cabe holgadamente en GPUs como NVIDIA GTX 1060 (6 GB) o superiores. Una RTX 3060 o RTX 4060 sería suficiente para ejecutar el modelo con margen.
- El procesamiento de las tres cámaras con DINOv2 puede requerir algo de VRAM adicional, pero el tamaño total es modesto. Se estima un consumo de VRAM inferior a 2 GB en fp32 para la inferencia completa.
- Opciones de despliegue: al ser un módulo PyTorch estándar, puede ejecutarse con cualquier framework que soporte PyTorch. No está diseñado para vLLM ni llama.cpp, ya que no es un modelo de lenguaje. Se puede integrar en sistemas robóticos usando LeRobot o directamente con scripts personalizados.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado el tamaño reducido, se espera una latencia de decenas de milisegundos por predicción en GPU moderna, suficiente para control en tiempo real a 30 fps.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras políticas visuomotoras en la información proporcionada. El modelo se enmarca dentro de la familia de políticas de imitación basadas en transformers, como ACT o Diffusion Policy, pero no se han reportado resultados comparativos con esos métodos en este dataset específico. La única comparación disponible es la ablación interna entre variantes del mismo estudio, que se detalla en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo se entrenó con una única semilla (seed 1000), por lo que no hay barras de error en las comparaciones. Los resultados podrían variar con otras semillas.
- La pérdida held-out no es una medida de éxito de tarea. Para validar el rendimiento real es necesario realizar despliegues físicos en el brazo SO-101, ya que no existe simulador.
- No se deben comparar las pérdidas de DDPM con las de flow matching, ya que minimizan funciones objetivo diferentes. Un valor numérico menor en DDPM no implica mejor política.
- El orden de las cámaras está fijo (muñeca, frontal, superior). Si se intercambian las cámaras, el modelo recibirá los tokens en el orden incorrecto y fallará.
- El checkpoint se carga con `weights_only=False`, lo que implica riesgo de seguridad si se ejecuta código no confiable. Se recomienda cargar el modelo solo desde fuentes de confianza.
- Es específico para el brazo SO-101 y el dataset de cubos y cilindros. No es transferible a otros robots o tareas sin reentrenamiento completo.
- Al ser un modelo de robótica, no tiene capacidades de lenguaje, razonamiento simbólico ni generación de texto.

## Enlaces

- [HuggingFace - Parv-09/patchpolicy-so101-expert16w216-flow-bidir](https://huggingface.co/Parv-09/patchpolicy-so101-expert16w216-flow-bidir)
- Repositorio compañero con código e `infer.py`: no se proporciona URL en la información disponible.
