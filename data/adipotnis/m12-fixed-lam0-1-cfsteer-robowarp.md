# adipotnis/m12-fixed-lam0.1-cfsteer-robowarp

## Resumen

El modelo `adipotnis/m12-fixed-lam0.1-cfsteer-robowarp` es un modelo de robótica VLA (Vision-Language-Action) desarrollado por Aditya Potnis como parte de su serie experimental RoboWarp. Se trata de un fine-tuning sobre la base pi0.5 (π₀.₅) realizado en el benchmark LIBERO-Spatial. Su principal innovación reside en el objetivo de entrenamiento: en lugar de un flow-matching estándar, utiliza un mecanismo de "counterfactual steering" (dirección contrafactual) que empuja la velocidad predicha por el modelo lejos de una velocidad contrafactual que ignora la evidencia visual. En esta variante concreta (`m12-fixed-lam0.1`), el factor de escala para este steering es fijo y de valor 0.1.

El modelo está diseñado para resolver el problema de la robustez en políticas de manipulación robótica, particularmente en escenarios con distracciones o cambios en la disposición espacial. Su relevancia radica en que explora una modificación directa sobre el objetivo de regresión del flow-matching, un enfoque emergente en la generación de acciones para VLA. El repositorio tiene un tamaño de 12.4 GB, lo que sugiere pesos en FP16 o FP32, y está publicado bajo licencia Apache-2.0, aunque su acceso es restringido (gated) y requiere aceptación de condiciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.5 (pi0.5) con flow-matching |
| Parámetros totales | no disponible (se infiere ~3B de pi0.5, no confirmado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (orientado a robótica, no a lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (tamaño del repositorio: 12.4 GB) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo `pi0.5`, que es un modelo de flujo de acción (action flow-matching) sobre un codificador visual y un decodificador de lenguaje. El entrenamiento se realiza sobre el benchmark LIBERO-Spatial, que contiene tareas de manipulación espacial con distracciones. La innovación principal es la modificación del objetivo de regresión del flow-matching: en lugar de predecir la velocidad hacia el target real, se introduce una velocidad contrafactual (que no tiene en cuenta la evidencia visual actual) y se resta de la predicción, multiplicada por un factor lambda fijo (0.1). Este método se denomina "CFSteer" (Counterfactual Steering). Según los resultados de la búsqueda, variantes hermanas como M5 y M6 utilizan técnicas de BYOL o contrastivas (InfoNCE) para definir el target contrafactual; en M12 se fija el lambda a 0.1, probablemente para estudiar el efecto del balance entre el steering y la regresión estándar. No se han publicado detalles sobre el dataset exacto más allá de LIBERO-Spatial, ni sobre el número de tokens o pasos de entrenamiento.

## Capacidades

- Generación de acciones de control para robots manipuladores en tareas espaciales (benchmark LIBERO-Spatial).
- Robustez mejorada frente a distracciones visuales gracias al steering contrafactual.
- Capacidad de generar secuencias de acciones mediante flow-matching, un enfoque probabilístico para políticas continuas.
- No soporta generación de lenguaje natural, tool calling ni agentes de razonamiento.
- No es multimodal en el sentido de lenguaje; solo procesa imágenes de la cámara del robot y acciones discretas.
- No incluye soporte para audio ni visión general.

## Casos de uso

- Investigación en robótica VLA: sirve como referencia para estudiar el efecto del steering contrafactual en el rendimiento de políticas de manipulación.
- Evaluación de robustez en LIBERO: permite medir cómo la política se comporta frente a cambios de distracción en el entorno.
- Desarrollo de nuevas variantes de flow-matching: su arquitectura clara (lambda fijo) permite aislar variables en experimentos de ablación.
- Entrenamiento de políticas para simulación: puede integrarse en entornos como MuJoCo o Isaac Gym para validación de algoritmos.
- Fine-tuning para tareas específicas: al ser un checkpoint de pi0.5, se puede continuar el entrenamiento en otros benchmarks robóticos.
- Benchmarking de frameworks de despliegue: útil para probar la latencia de inferencia de modelos VLA en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el repositorio pesa 12.4 GB, se infiere que los pesos están en FP16 o FP32. Para un modelo de ~3B (como pi0.5), se recomienda al menos 16 GB de VRAM para FP16 y 24 GB para FP32.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- En GPU de consumo, es posible ejecutar la inferencia en una RTX 3090/4090 si se cuantiza a INT8 o FP16.
- Opciones de despliegue: al ser un VLA, se recomienda usar el framework OpenPI (el ecosistema de pi0.5) o adaptarlo a vLLM si se convierte a un formato de lenguaje, aunque no es su propósito. Para robótica, se usa directamente con el entorno de simulación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Objetivo de steering | Método | Lambda |
|---|---|---|---|---|
| `adipotnis/m12-fixed-lam0.1-cfsteer-robowarp` | pi0.5 | Contrafactual fijo | CFSteer | 0.1 |
| `adipotnis/m5-byol-cfsteer-robowarp` | pi0.5 | Contrafactual | BYOL (EMA del estudiante) | no especificado |
| `adipotnis/m6-contrastive-cf-robowarp` | pi0.5 | Contrafactual | InfoNCE contrastivo | no especificado |

La comparativa se limita a las variantes de la misma familia del autor, ya que no se dispone de modelos comparables de otros autores con exactamente este objetivo de steering. La principal diferencia entre estos modelos es la forma de generar la velocidad contrafactual: M5 usa una red objetivo EMA (BYOL), M6 usa un término de contraste InfoNCE, y M12 fija el lambda a 0.1 sin especificar el método interno exacto más allá de "fixed".

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face para descargar el modelo.
- Entrenado solo en LIBERO-Spatial: puede no generalizar a otras tareas robóticas o entornos fuera de este benchmark.
- Sin soporte de lenguaje: no es un modelo multimodal de lenguaje, sino de acción visual; no se puede usar para chat o generación de texto.
- Riesgo de alucinación en acciones: aunque es flow-matching, en entornos no vistos podría generar acciones inválidas o inseguras en robots reales.
- Licencia Apache-2.0, pero la licencia del dataset LIBERO debe revisarse por separado para uso comercial.
- No se han publicado métricas de rendimiento ni estudios de robustez fuera del entorno de simulación.
- El tamaño del repositorio (12.4 GB) sugiere que no está cuantizado; para despliegue en edge se requiere cuantización adicional.

## Enlaces

- Hugging Face: https://huggingface.co/adipotnis/m12-fixed-lam0.1-cfsteer-robowarp
- Repositorio hermano M5: https://huggingface.co/adipotnis/m5-byol-cfsteer-robowarp
- Repositorio hermano M6: https://huggingface.co/adipotnis/m6-contrastive-cf-robowarp
- Perfil del autor en GitHub: https://github.com/adipotnis
- Repositorio RoboWarp (relacionado): https://github.com/robomantri/robowarp
