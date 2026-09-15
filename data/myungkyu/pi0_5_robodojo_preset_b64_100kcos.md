# Myungkyu/pi0_5_robodojo_preset_b64_100kcos

## Resumen
El modelo `pi0_5_robodojo_preset_b64_100kcos` es una política de bajo nivel para robótica, desarrollada por Myungkyu como fine-tuning de `lerobot/pi05_base`. Está diseñado para resolver tareas de manipulación bimanual de larga duración en el entorno RoboDojo, con un total de 4.143.404.816 parámetros. Se entrenó sobre demostraciones etiquetadas con subtareas densas del dataset `Myungkyu/RoboDojo-preset-gemini`, lo que le permite ejecutar acciones precisas a partir de percepción visual y lenguaje.

Este modelo es relevante en el campo de los modelos VLA (Vision-Language-Action), ya que combina la arquitectura Pi0.5 con un ajuste fino específico para tareas robóticas de mesa. Su principal contribución es la capacidad de manejar horizonte largo en tareas bimanuales, usando tres vistas de cámara (cabeza y muñecas) y propiocepción como entradas. A pesar de ser un checkpoint final de 100.000 pasos, no se han publicado métricas de rendimiento ni benchmarks, por lo que su evaluación se limita a la información del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 vanilla (VLA, transformer multimodal) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Pi0.5 vanilla, un transformer multimodal que procesa tres imágenes de cámara en vivo (cabeza, muñeca izquierda y derecha), señales de propiocepción y texto de la subtarea actual. No incluye slot de keyframe ni mecanismo de memory attestation, lo que simplifica su diseño frente a variantes más complejas de Pi0.5.

El entrenamiento consistió en un fine-tuning de `lerobot/pi05_base` sobre el dataset `Myungkyu/RoboDojo-preset-gemini`, compuesto por 100 demostraciones de 8 tareas bimanuales en mesa. Se utilizó un batch de 64 y un total de 100.000 pasos con una tasa de aprendizaje coseno de 1.0e-5 a 2.5e-6. Este checkpoint es una continuación del modelo `pi0_5_robodojo_preset_b64_60k`, reanudando el estado del optimizador y del scheduler desde el paso 60.000 para 40.000 pasos adicionales.

## Capacidades
- Genera acciones de baja nivel para control de robots bimanuales en tareas de mesa.
- Procesa simultáneamente tres entradas visuales (cabeza y dos muñecas) junto con propiocepción.
- Interpreta texto de subtareas para guiar la ejecución de secuencias de larga duración.
- Aprendido a partir de demostraciones humanas etiquetadas densamente.
- No se han indicado capacidades de tool calling ni razonamiento de propósito general en la información disponible.
- Sin capacidades de visión fuera del contexto robótico.

## Casos de uso
- Ensamblaje de piezas en entornos de laboratorio: el modelo usa las tres vistas de cámara para alinear componentes y ejecutar movimientos de ambas manos con precisión.
- Manipulación de objetos en tareas de mesa: gracias a su entrenamiento en RoboDojo, puede seguir subtareas como "coger el objeto", "colocarlo en la bandeja" y "soltar".
- Automatización de tareas repetitivas en robótica industrial ligera: permite programar el robot por demostración sin necesidad de escribir código de control.
- Investigación en aprendizaje por demostración: sirve como política de referencia para comparar algoritmos de imitación o refuerzo en manipuladores bimanuales.
- Teleoperación con ayuda de IA: el modelo puede proponer acciones de bajo nivel a partir de la entrada del operador, reduciendo la carga cognitiva.
- Evaluación de modelos VLA en entornos reales: al ser un checkpoint fine-tuned con configuraciones específicas, es útil para estudiar el efecto del ajuste fino en tareas de horizonte largo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 4.143.404.816 parámetros en precisión FP16, el peso ocupa aproximadamente 8,3 GB. Añadiendo activaciones y overhead de inferencia, se estima un mínimo de 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB o H100 80 GB. Para despliegue en robot, se recomienda una GPU que pueda mantener la latencia de control.
- Compatibilidad con GPU de consumo: posible en RTX 4090 o superiores con 24 GB, aunque no se ha validado oficialmente.
- Opciones de despliegue: no disponibles en la información. El modelo está etiquetado con la librería `lerobot`, por lo que se puede cargar mediante los módulos de LeRobot, ajustando las rutas del backbone y tokenizer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot/pi05_base (base) | 4.143.404.816 | no disponible | VLA base | no disponible | HuggingFace |
| Myungkyu/pi0_5_robodojo_preset_b64_60k | no disponible | no disponible | Fine-tuning intermedio | no disponible | HuggingFace |
| Myungkyu/pi0_5_robodojo_preset_b64_100kcos | 4.143.404.816 | no disponible | Fine-tuning final | no disponible | HuggingFace |

La comparativa se limita a los checkpoints disponibles en el mismo repositorio, ya que no se dispone de datos de modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias
- La licencia no está especificada, por lo que el uso comercial es incierto.
- No se han publicado resultados de benchmarks, lo que impide validar su rendimiento frente a otros modelos.
- La configuración referencia el backbone y tokenizer por identificador de HuggingFace o por ruta local; es necesario apuntarlos a las copias locales antes de cargar el modelo.
- Está especializado en tareas RoboDojo de mesa bimanuales; su generalización a otros entornos o tareas no está demostrada.
- No soporta entrada de keyframe ni memory attestation, lo que puede limitar el seguimiento de tareas muy largas.
- No se han evaluado sesgos ni riesgos de alucinación en la generación de acciones.
- El repositorio no registra descargas ni interacciones de la comunidad, lo que sugiere una validación externa limitada.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_preset_b64_100kcos
- Dataset utilizado: https://huggingface.co/datasets/Myungkyu/RoboDojo-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint intermedio mencionado: `pi0_5_robodojo_preset_b64_60k` (no se proporciona URL explícita en la información)
