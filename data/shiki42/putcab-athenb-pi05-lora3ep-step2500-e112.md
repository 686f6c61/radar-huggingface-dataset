# Shiki42/putcab-athenb-pi05-lora3ep-step2500-e112

## Resumen

Este repositorio contiene un checkpoint LoRA del modelo PI0.5 (Physical Intelligence 0.5), un modelo de visión-lenguaje-acción (VLA) para robótica, adaptado específicamente a la tarea PutCab con la variante A-then-B (abrir el cajón izquierdo y colocar un objeto en el derecho, o la secuencia definida en el dataset). El autor, Shiki42 (Shuyuan), lo ha entrenado como parte de un experimento de control transformer (CTR) identificado como E112-R002, utilizando el framework RoboTwin para simulación robótica.

El checkpoint es un "atomic Orbax checkpoint" que contiene los pesos del LoRA tras 2500 actualizaciones de optimizador, con una exposición efectiva de 2.95 épocas sobre 40 000 muestras. El modelo base es otro repositorio del mismo autor (`parallelvla-pi05-putcab-clean-verified-v2-50-30000`), que a su vez es un PI0.5 preentrenado y ajustado para la tarea PutCab. Este LoRA se publica como un artefacto de investigación, sin licencia declarada ni documentación de rendimiento, y está pensado para ser evaluado en el contexto del experimento CTR.

La relevancia de este modelo radica en su carácter de checkpoint intermedio de un pipeline de entrenamiento reproducible: incluye metadatos detallados del contrato de entrenamiento (batch, LR, normalización, configuración de cámaras) y un inventario de integridad SHA256. No es un modelo listo para producción, sino una pieza de un experimento científico en robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre PI0.5 (VLA - Vision-Language-Action) |
| Parametros totales | no disponible (el repo pesa 8.8 GB, pero incluye el checkpoint completo del LoRA, no el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de acción robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente no aplica, es un modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (formato nativo de JAX) |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) aplicado sobre PI0.5, un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores a partir de observaciones de cámara y instrucciones en lenguaje natural. El LoRA se entrena para adaptar el modelo base a la tarea específica PutCab con la variante A-then-B, que implica una secuencia de dos sub-tareas (abrir un cajón y colocar un objeto, o similar según el dataset).

El entrenamiento se realizó con un batch global de 16 (microbatch 8 con acumulación de gradientes de 2), 2500 actualizaciones de optimizador, 40 000 muestras y una exposición efectiva de 2.95 épocas. Se usó un pico de learning rate de 2.5e-5 con un horizonte de decaimiento de 30 000 actualizaciones y un warmup de 1000 pasos. El EMA estaba deshabilitado. La normalización de los datos se hizo con estadísticas delta-space consistentes con el loader, verificadas por un hash SHA256. La configuración de cámaras fija un FOVy de 90 grados para ambas cámaras de muñeca, tanto en entrenamiento como en evaluación.

No se especifican innovaciones arquitectónicas adicionales más allá del uso de LoRA sobre PI0.5. El checkpoint se guarda únicamente en el paso final (2500), sin checkpoints intermedios.

## Capacidades

- Ejecución de la tarea robótica PutCab en su variante A-then-B, consistente en una secuencia de dos acciones de manipulación (abrir un cajón y colocar un objeto, según el dataset de entrenamiento).
- Generación de acciones motoras (posiciones de articulaciones o delta de posiciones) a partir de observaciones visuales de dos cámaras de muñeca y una instrucción de tarea.
- Adaptación específica al entorno de simulación RoboTwin, con normalización delta-space para estabilidad numérica.
- No es un modelo de lenguaje general: no genera texto, no soporta tool calling, ni agentes conversacionales, ni razonamiento multilingüe.
- No incluye capacidades de visión general fuera del contexto de la tarea robótica.

## Casos de uso

- Investigación en robótica manipuladora: el checkpoint sirve para estudiar el efecto del LoRA sobre PI0.5 en la tarea PutCab, comparando con otros checkpoints del mismo autor (por ejemplo, el de spline field o el oficial clean50).
- Evaluación en simulación RoboTwin: se puede cargar el LoRA sobre el modelo base y ejecutar la tarea en el entorno simulado para medir tasas de éxito, robustez y generalización.
- Reproducibilidad de experimentos CTR: al incluir el contrato de entrenamiento completo y el inventario SHA256, permite replicar el entrenamiento o verificar la integridad del checkpoint.
- Transferencia a entornos reales: aunque no está validado, el LoRA podría servir como punto de partida para fine-tuning adicional con datos reales de un brazo robótico.
- Análisis de normalización y configuración de cámaras: el uso de FOVy 90 grados y estadísticas delta-space puede compararse con otras configuraciones para estudiar su impacto en el rendimiento.
- Desarrollo de pipelines de entrenamiento para VLA: el formato Orbax y los metadatos detallados son útiles para quienes construyen sistemas de entrenamiento similares con JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación formal con el conjunto fijo unseen E112 se ejecuta por separado y que los resultados pertenecen al registro del experimento CTR, pero no se proporcionan números en este repositorio.

## Requisitos de hardware

- El checkpoint del LoRA ocupa 8.8 GB en disco, pero para inferencia se necesita cargar también el modelo base PI0.5, cuyo tamaño no se especifica en este repositorio.
- No se indica VRAM estimada. Basándose en el tamaño típico de PI0.5 (un VLA de aproximadamente 3 mil millones de parámetros), se estima que se necesitan al menos 24 GB de VRAM para inferencia en FP16, y más para entrenamiento.
- GPU recomendadas: no disponible en la información. Por el tamaño, una NVIDIA RTX 4090 (24 GB) podría ser suficiente para inferencia, pero no está confirmado.
- Opciones de despliegue: al ser un checkpoint Orbax de JAX, se puede cargar con librerías de JAX (Flax, Orbax). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El autor publica otros checkpoints para la misma tarea PutCab, pero no se dispone de datos de rendimiento comparativos. Se listan a continuación los repositorios relacionados:

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shiki42/putcab-athenb-pi05-lora3ep-step2500-e112` (este) | LoRA sobre PI0.5 | PutCab A-then-B | 8.8 GB | no disponible | HuggingFace |
| `Shiki42/pi05-spline-field-masked-putcab-e044-r002-2k` | Checkpoint PI0.5 con spline field | PutCab | no disponible | no disponible | HuggingFace |
| `Shiki42/pi05-putcab-official-clean50-officialjax-b32-30k-20260803` | Checkpoint PI0.5 completo | PutCab | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos de la misma categoría fuera del ecosistema del autor.

## Limitaciones y advertencias

- Es un checkpoint experimental de un experimento CTR, no un modelo validado para uso en producción.
- La licencia no está declarada, por lo que se desconoce si permite uso comercial o modificación.
- No se han publicado resultados de evaluación; el rendimiento real en la tarea PutCab es desconocido.
- El modelo está especializado en una única tarea (PutCab A-then-B) y no generaliza a otras tareas robóticas sin fine-tuning adicional.
- La normalización delta-space y la configuración de cámaras (FOVy 90) son específicas del entorno de entrenamiento; pueden no transferirse directamente a otros entornos o configuraciones físicas.
- No se proporcionan instrucciones de uso ni ejemplos de carga del modelo, lo que dificulta su adopción fuera del contexto del experimento.
- Al ser un LoRA, requiere el modelo base `parallelvla-pi05-putcab-clean-verified-v2-50-30000` para funcionar, que debe descargarse por separado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiki42/putcab-athenb-pi05-lora3ep-step2500-e112
- Modelo base: https://huggingface.co/Shiki42/parallelvla-pi05-putcab-clean-verified-v2-50-30000
- Otro checkpoint relacionado: https://huggingface.co/Shiki42/pi05-spline-field-masked-putcab-e044-r002-2k
- Otro checkpoint relacionado: https://huggingface.co/Shiki42/pi05-putcab-official-clean50-officialjax-b32-30k-20260803
- Perfil de GitHub del autor: https://github.com/Shiki42/
- Referencia a PI0.5 en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
