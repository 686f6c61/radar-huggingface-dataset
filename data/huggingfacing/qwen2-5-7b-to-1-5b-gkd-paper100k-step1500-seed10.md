# huggingFacing/qwen2.5-7b-to-1.5b-gkd-paper100k-step1500-seed10

## Resumen

Este modelo es un checkpoint de investigación resultante de un experimento de destilación de conocimiento (knowledge distillation) sobre la familia Qwen2.5. Concretamente, se trata de la variante "vanilla GKD" (Generalized Knowledge Distillation) dentro de una suite de ablaciones denominada "matched V12 Paper100K". El objetivo es transferir las capacidades del modelo profesor `Qwen/Qwen2.5-7B-Instruct` a un modelo estudiante más pequeño, `Qwen/Qwen2.5-1.5B-Instruct`, utilizando un subconjunto de datos académicos de 100 000 ejemplos.

El modelo resultante tiene 1 543 910 912 parámetros (aproximadamente 1,5 mil millones), lo que lo sitúa en la categoría de modelos compactos. Se entrena durante 1500 pasos de optimización con un tamaño de lote global de 64, utilizando el objetivo GKD completamente on-policy. Este checkpoint forma parte de un estudio de ablación, por lo que su propósito principal es servir como referencia para comparar distintas variantes del método de destilación, más que como un modelo listo para producción.

La relevancia de este modelo radica en su contribución al estudio de técnicas de destilación eficientes, un área clave para desplegar modelos de lenguaje de alto rendimiento en entornos con recursos limitados. Al ser una variante "vanilla", sirve como línea base para evaluar mejoras como LIFTKD u otras modificaciones del objetivo de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5, decoder-only) |
| Parametros totales | 1 543 910 912 (1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen2.5-1.5B-Instruct, que soporta 32 768 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | No especificados (pesos en FP32/FP16 en safetensors) |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer decoder-only de Qwen2.5, con el mismo diseño que el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata de una arquitectura nueva, sino de una adaptación mediante destilación. El proceso de entrenamiento utiliza Generalized Knowledge Distillation (GKD), un marco que unifica la destilación clásica con el aprendizaje on-policy, donde el estudiante genera sus propias muestras y el profesor proporciona las distribuciones de probabilidad objetivo.

El protocolo de entrenamiento es el siguiente: el profesor es `Qwen/Qwen2.5-7B-Instruct`, el estudiante se inicializa con los pesos de `Qwen/Qwen2.5-1.5B-Instruct`, y los datos provienen de `lift_paper_en_natural_v1/100k`, que contiene 96 000 ejemplos de entrenamiento y 2000 ejemplos de validación. Se emplea el optimizador AdamW con una tasa de aprendizaje coseno que decae de 1e-5 a 1e-7, weight decay de 1e-2, y muestreo con temperatura 0.9 generando hasta 128 tokens por ejemplo. El entrenamiento dura 1500 pasos con un tamaño de lote global de 64 y semilla 10.

La variante "vanilla GKD" significa que no se aplican componentes adicionales (como LIFTKD u otras modificaciones) sobre el objetivo GKD estándar. Esto permite aislar el efecto de dichas mejoras en estudios comparativos. El checkpoint completo del método mejorado (v12 online-IF) está disponible en otro repositorio, lo que indica que este modelo es parte de una familia de experimentos.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje entrenado mediante destilación, es capaz de generar texto coherente en tareas de continuación y diálogo, aunque sus capacidades exactas dependen de la calidad de la destilación.
- Conversación: hereda la estructura de chat del modelo base `Qwen2.5-1.5B-Instruct`, por lo que puede mantener conversaciones multi-turno.
- Razonamiento básico: puede resolver tareas sencillas de razonamiento, pero no se han publicado evaluaciones específicas para este checkpoint.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio. Dado que el modelo base Qwen2.5-1.5B-Instruct no incluye dichas capacidades (es solo texto), es razonable asumir que este modelo tampoco las tiene, pero no está confirmado en la documentación.

## Casos de uso

- Investigación en destilación de conocimiento: este checkpoint sirve como referencia para comparar variantes de GKD en términos de rendimiento y eficiencia. Los investigadores pueden utilizarlo para reproducir experimentos o como línea base en nuevas propuestas.
- Evaluación de técnicas de compresión de modelos: permite estudiar cómo la destilación on-policy afecta a tareas específicas en modelos de 1,5 B, comparando con el modelo original y con otras variantes de destilación.
- Prototipado rápido de aplicaciones de chat: al ser un modelo de 1,5 B, puede desplegarse en entornos con recursos limitados para pruebas de concepto de asistentes conversacionales, aunque no se recomienda para producción sin evaluación adicional.
- Fine-tuning posterior: los pesos destilados pueden servir como punto de partida para fine-tuning en dominios específicos, aprovechando el conocimiento transferido del profesor.
- Benchmarking de hardware: al ser un modelo compacto, es útil para medir latencia y throughput en GPUs consumer o en CPUs, ayudando a dimensionar despliegues.
- Estudio de alucinaciones y sesgos: al ser una destilación, puede compararse con el modelo original para analizar cómo la compresión afecta a la fidelidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint es un artefacto de investigación y la model card no incluye métricas como MMLU, HumanEval o GSM8K. Para evaluar su rendimiento sería necesario ejecutar dichas pruebas de forma independiente.

## Requisitos de hardware

- VRAM estimada: con 1,54 B parámetros, en FP16 (2 bytes por parámetro) se requieren aproximadamente 3,1 GB solo para los pesos. En FP32 serían ~6,2 GB. Con cuantización int8 se reduciría a ~1,6 GB y en int4 a ~0,8 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Para inferencia con contexto largo se recomienda más memoria.
- Compatibilidad con GPUs consumer: sí, es un modelo pequeño que cabe en la mayoría de GPUs modernas de consumo.
- Opciones de despliegue: al ser compatible con Hugging Face Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 1,5 B en una RTX 4090 puede alcanzar varios cientos de tokens por segundo en generación, pero depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información comparativa publicada para este checkpoint específico. Sin embargo, puede compararse con su modelo base y con el profesor:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32 768 | Apache-2.0 | Modelo original sin destilación |
| Este checkpoint (vanilla GKD) | 1,54 B | No especificado (hereda 32 768) | Apache-2.0 | Destilado desde 7B, variante vanilla |
| Qwen2.5-7B-Instruct (profesor) | 7,6 B | 32 768 | Apache-2.0 | Modelo original de mayor tamaño |

No se han encontrado comparaciones con otros modelos de 1,5 B como Phi-3.5-mini o Gemma-2-2B en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo optimizado para producción. No se han realizado evaluaciones exhaustivas de seguridad, sesgos o robustez.
- Al ser una destilación del profesor de 7B, puede heredar sesgos y alucinaciones del modelo original, aunque en menor medida.
- La ventana de contexto no se especifica explícitamente; se asume que hereda los 32 768 tokens del modelo base, pero no hay confirmación en la ficha.
- Los datos de entrenamiento provienen de `lift_paper_en_natural_v1/100k`, que parece ser un subconjunto de artículos académicos en inglés. Esto puede limitar el rendimiento en dominios fuera de ese ámbito.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia de que el modelo supere o iguale al modelo base en tareas estándar.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5, se deben cumplir los términos de la licencia original (también Apache-2.0).
- El entrenamiento con solo 1500 pasos y 96 000 ejemplos puede resultar insuficiente para capturar todas las capacidades del profesor, especialmente en tareas complejas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-gkd-paper100k-step1500-seed10
- Checkpoint completo del método v12 (online-IF): https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500
- Modelo base (estudiante): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
