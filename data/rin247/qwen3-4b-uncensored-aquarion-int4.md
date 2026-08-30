# Rin247/Qwen3-4B-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3-4B-Uncensored-Aquarion-INT4` es una cuantización INT4 *weight-only* del modelo base `Qwen3-4B`, desarrollada por el usuario Rin247. La peculiaridad principal es que el modelo ha sido sometido a un proceso de *abliteration* (proyección ortogonal de la dirección de rechazo) antes de la cuantización, con el objetivo de eliminar las respuestas de rechazo y permitir una generación de texto sin censura. Esta técnica, parte del proyecto *Genesis of Aquarion*, busca ofrecer un modelo más permisivo en contextos donde las restricciones de seguridad pueden limitar la creatividad o la utilidad, como en roleplay, ficción interactiva o pruebas de sistemas de moderación.

El archivo `model.safetensors` contiene 2.205.810.176 parámetros (aproximadamente 2,2 mil millones), lo que sugiere que la cuantización excluye ciertos componentes (como embeddings) o que el conteo se refiere solo a los pesos cuantizados. El repositorio ocupa 2,7 GB e incluye el config con `quantization_config`. No se especifica la licencia, los idiomas soportados ni la longitud de contexto en la model card, aunque al estar basado en Qwen3-4B, hereda teóricamente sus capacidades (contexto de 32k tokens y soporte multilingüe) si no se han modificado. El modelo está pensado para usuarios que necesitan una versión ligera y sin restricciones de Qwen3-4B, con la ventaja de un menor uso de memoria gracias a la cuantización INT4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B) |
| Parametros totales | 2.205.810.176 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, presumiblemente 32k, no confirmado) |
| Tipos de cuantizacion | INT4 weight-only (RTN en CPU, con escalas y formas almacenadas) |
| Idiomas soportados | no disponible (Qwen3-4B soporta múltiples idiomas, pero esta variante no lo documenta) |
| Licencia | no disponible (no indicada en la model card) |
| Formato de pesos | safetensors con buffers adicionales `*.weight_scale` y `*.weight_shape` |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `Qwen3-4B`, un transformer autoregresivo con atención estándar, pero esta variante ha sido modificada mediante dos procesos: primero, un *abliteration* que elimina la dirección de rechazo del espacio de activaciones mediante proyección ortogonal, de modo que el modelo no genere respuestas del tipo "no puedo ayudar con eso". Segundo, una cuantización INT4 *weight-only* aplicada con PyTorch RTN (Round-to-Nearest) en CPU, que reduce el tamaño de los pesos manteniendo las escalas y formas en archivos separados para permitir la dequantización posterior.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO. El proceso de *abliteration* es una intervención post-entrenamiento que no requiere fine-tuning adicional, lo que lo hace relativamente rápido y económico. La cuantización se realiza después del *abliteration*, por lo que los pesos ya modificados se redondean a INT4. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo ha sido diseñado para no rechazar peticiones, lo que permite respuestas en temas que normalmente serían bloqueados por políticas de seguridad.
- Capacidades heredadas de Qwen3-4B: razonamiento, generación de código, matemáticas, comprensión lectora y soporte multilingüe (aunque no está verificado en esta variante).
- Posible soporte de *tool calling* y *function calling*: al ser una variante de Qwen3, es probable que conserve estas funcionalidades, pero no hay confirmación en la documentación.
- Sin modo de pensamiento explícito: no se menciona un modo *thinking* como en otras variantes de Qwen3.
- El formato de pesos INT4 requiere un proceso de dequantización manual antes de la inferencia, por lo que no es directamente compatible con motores estándar como vLLM o llama.cpp sin adaptación.

## Casos de uso

- Roleplay y ficción interactiva: el modelo puede mantener personajes y tramas sin interrumpir con avisos de seguridad, ideal para juegos de rol por texto o narrativa colaborativa.
- Pruebas de sistemas de moderación: al no rechazar contenido, permite evaluar la robustez de clasificadores de contenido o filtros de seguridad, generando entradas adversarias.
- Generación de borradores creativos: escritores pueden explorar temas controvertidos o escenas explícitas sin que el modelo se niegue, útil para novelas o guiones con contenido adulto.
- Asistencia en investigación sobre alineación: investigadores pueden estudiar cómo el *abliteration* afecta el comportamiento del modelo en comparación con la versión original.
- Desarrollo de chatbots sin filtros: para aplicaciones donde se requiere una conversación abierta sin restricciones temáticas (siempre que se cumplan las leyes aplicables).
- Fine-tuning posterior: al ser una versión cuantizada, puede servir como punto de partida para experimentos de ajuste con menos requisitos de memoria, aunque requiere dequantización previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta variante cuantizada y abliterada. El rendimiento real dependerá del hardware y del proceso de dequantización, y puede diferir del modelo base Qwen3-4B debido a la pérdida de precisión por INT4 y a las modificaciones del *abliteration*.

## Requisitos de hardware

- VRAM estimada: al ser INT4 weight-only, los pesos ocupan aproximadamente 2,2 GB (2,7 GB incluyendo metadatos). Con overhead de ejecución, se estima un uso de VRAM de 3-4 GB para inferencia en FP16 después de dequantizar (aunque la dequantización puede requerir memoria adicional).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo tras la dequantización. Ejemplos: NVIDIA GTX 1650 (4 GB), RTX 3060 (12 GB), o GPUs integradas con suficiente RAM compartida.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que cabe en GPUs de gama baja.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp u Ollama porque requiere un proceso de dequantización manual con las escalas y formas almacenadas. El usuario debe implementar una capa de dequantización o convertir los pesos a un formato estándar (por ejemplo, FP16 o GGUF) antes de usar un motor de inferencia.
- Latencia y throughput: no disponibles. Dependerán del hardware y del método de dequantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (original) | 4B | 32k | Apache 2.0 | FP16/BF16 | Modelo base con censura estándar |
| Rin247/Qwen3-4B-Uncensored-Aquarion-INT4 | 2,2B (cuantizado) | no disponible | no disponible | INT4 safetensors | Abliterado y cuantizado, sin censura |
| durgasai299792458/Qwen3_4B-int4-GRPO-Uncensored | 4B (base) | no disponible | no disponible | INT4 | Otra variante uncensored, pero con método GRPO (no documentado en detalle) |
| nicoboss/Qwen3-14B-Uncensored | 14B | no disponible | Apache 2.0 | FP16 | Fine-tune uncensored sobre Qwen3-14B, mayor tamaño y requisitos |

No se dispone de datos de rendimiento comparativo entre estas variantes. La elección dependerá del presupuesto de hardware y de la necesidad de mayor capacidad (14B) frente a menor huella de memoria (4B cuantizado).

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una variante sin censura, el modelo puede generar contenido falso, ofensivo o peligroso con mayor facilidad, ya que no tiene mecanismos de rechazo. Esto incrementa el riesgo de alucinaciones en temas sensibles.
- Pérdida de calidad por cuantización: la conversión a INT4 puede degradar la fluidez y la precisión en tareas complejas en comparación con el modelo original en FP16.
- Formato propietario: el esquema de cuantización requiere un manejo manual, lo que dificulta su integración en pipelines estándar y puede introducir errores si no se dequantiza correctamente.
- Licencia desconocida: al no especificarse, el uso comercial y la redistribución quedan en un limbo legal. Se recomienda contactar al autor o asumir riesgos.
- Sin documentación de idiomas: aunque Qwen3-4B es multilingüe, no se garantiza que esta variante conserve el mismo rendimiento en todos los idiomas.
- Riesgo de uso indebido: la ausencia de censura puede facilitar la generación de contenido ilegal o dañino, por lo que su uso debe limitarse a entornos controlados y legales.
- Sin garantías de soporte: es un modelo publicado por un usuario independiente, sin mantenimiento ni actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rin247/Qwen3-4B-Uncensored-Aquarion-INT4
- Modelo base Qwen3-4B (referencia): https://huggingface.co/Qwen/Qwen3-4B (no confirmado, se infiere)
- Otro modelo uncensored similar (para referencia): https://huggingface.co/nicoboss/Qwen3-14B-Uncensored
