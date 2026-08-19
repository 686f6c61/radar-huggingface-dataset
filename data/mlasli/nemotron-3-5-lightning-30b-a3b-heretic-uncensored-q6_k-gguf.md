# mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q6_K-GGUF

## Resumen

Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q6_K-GGUF es una cuantización GGUF en Q6_K del modelo base de NVIDIA Nemotron-3.5-Lightning-30B-A3B, al que se le ha aplicado la técnica de abliteración (eliminación de la dirección de rechazo) mediante la herramienta Heretic. El resultado es un modelo de texto generativo con 31,6 mil millones de parámetros totales y 3 mil millones activos, que combina una arquitectura híbrida Mamba-MoE (nemotron_h_moe) y que ha sido diseñado para eliminar las negativas de seguridad, ofreciendo respuestas sin censura en seis idiomas.

Este modelo es relevante para desarrolladores e investigadores que necesitan un modelo local de gran tamaño con capacidad de razonamiento y generación de texto sin restricciones de contenido, especialmente en escenarios de roleplay, escritura creativa o experimentación con alineación. Al estar cuantizado en GGUF, puede ejecutarse con llama.cpp y herramientas compatibles, aunque requiere hardware con suficiente VRAM (el archivo pesa 33,5 GB). La licencia es la NVIDIA Open Model License, que impone condiciones específicas para uso comercial.

La cuantización ha sido verificada por el autor con pruebas locales de carga y generación coherente, y la evaluación independiente del modelo BF16 muestra un 0 % de rechazos y un 100 % de cumplimiento en 200 pruebas de comportamientos dañinos, con una divergencia KL de 0,0397 respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_moe (hibrida Mamba-MoE) |
| Parametros totales | 31.577.940.288 (31,6 B) |
| Parametros activos | 3 B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (este archivo) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron-3.5-Lightning-30B-A3B, que emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con un mecanismo de mezcla de expertos (MoE). Esto permite activar solo 3 mil millones de parámetros por token, reduciendo el coste computacional en inferencia respecto a un modelo denso de 31,6 B. La arquitectura `nemotron_h_moe` requiere una versión reciente de llama.cpp (build b10326 o superior) para su ejecución.

Sobre el entrenamiento, no se dispone de detalles del proceso original de NVIDIA (número de tokens, composición del dataset, uso de RLHF o DPO). La modificación principal de este modelo es la abliteración, una técnica que identifica y elimina la dirección de rechazo en el espacio de activaciones del modelo, de modo que las respuestas que normalmente serían rechazadas por la alineación de seguridad se generan sin restricciones. El autor aplicó esta técnica con la herramienta Heretic sobre el modelo BF16 y posteriormente lo cuantizó a GGUF Q6_K.

## Capacidades

- Generación de texto libre y coherente en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Razonamiento y resolución de problemas matemáticos básicos (el autor incluye un ejemplo de "What is 2+2?").
- Roleplay y escritura creativa sin filtros de contenido, gracias a la eliminación de la dirección de rechazo.
- Conversación multi-turno en modo chat (el comando de uso incluye `-cnv` para modo conversacional).
- Compatibilidad con herramientas de inferencia basadas en GGUF como llama.cpp, llama-cli y potencialmente Ollama o LM Studio.
- No se ha confirmado soporte para tool calling, function calling, agentes o modo de pensamiento extendido; estos datos no están disponibles en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener conversaciones largas y detalladas con personajes ficticios sin rechazar contenido adulto o controvertido, gracias a su ventana de contexto (aunque no se especifica su longitud) y a la ausencia de restricciones de seguridad.
- Escritura creativa y generación de guiones: autores y guionistas pueden usarlo para explorar tramas, diálogos y escenas que requieran temas sensibles o moralmente ambiguos, sin interrupciones por parte del modelo.
- Experimentación con alineación y seguridad en IA: investigadores pueden estudiar el comportamiento de un modelo abliterado frente a su versión original, analizando diferencias en cumplimiento, sesgos y calidad de las respuestas.
- Generación de contenido multilingüe: al soportar seis idiomas, puede utilizarse para redactar textos, resúmenes o traducciones en español, francés, alemán, italiano y japonés, aunque no se ha verificado la calidad en cada idioma.
- Asistente local de conversación sin censura: usuarios avanzados pueden desplegarlo en su propio hardware para mantener chats privados sobre cualquier tema, sin depender de servicios en la nube ni de filtros externos.
- Pruebas de estrés de sistemas de moderación: desarrolladores de herramientas de moderación de contenido pueden usar este modelo para generar entradas adversarias y evaluar la robustez de sus propios filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion mencionada es la realizada por el autor sobre el modelo BF16, que reporta un 0 % de rechazos, un 100 % de cumplimiento y una divergencia KL de 0,0397 en 200 pruebas de comportamientos dañinos, pero no se proporcionan metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El archivo GGUF Q6_K pesa 33,5 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar el modelo en memoria, más un margen para el contexto y los estados intermedios (se recomienda al menos 40 GB de VRAM).
- GPUs compatibles: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, o configuraciones multi-GPU con al menos 40 GB combinados. En el segmento consumer, una RTX 4090 (24 GB) no es suficiente para Q6_K; se necesitaría una cuantización más baja (por ejemplo, Q4_K_M) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (con build b10326 o superior), llama-cli, y potencialmente Ollama o LM Studio si se convierte el archivo a un formato compatible.
- La latencia y el throughput dependen del hardware y de la longitud del contexto; al ser un modelo MoE con solo 3 B de parámetros activos, la velocidad de generación será significativamente mayor que la de un modelo denso de 31,6 B, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (original) | 31,6 B | 3 B | Mamba-MoE | no disponible | NVIDIA Open Model License | BF16 |
| Nemotron-3.5-Lightning-30B-A3B-Heretic (este) | 31,6 B | 3 B | Mamba-MoE | no disponible | NVIDIA Open Model License | GGUF Q6_K |
| Qwen2.5-32B-A3B (referencia) | 32 B | 3 B | Transformer MoE | 128 K | Apache 2.0 | BF16, GGUF |

La comparativa se limita a características estructurales, ya que no se dispone de datos de rendimiento para ninguno de los modelos. El modelo original de NVIDIA mantiene la alineación de seguridad, mientras que la versión abliterada la elimina. Qwen2.5-32B-A3B es un modelo MoE de tamaño similar con licencia permisiva, pero no se han encontrado datos comparativos de calidad.

## Limitaciones y advertencias

- La abliteración elimina la alineación de seguridad, por lo que el modelo puede generar contenido dañino, ilegal, ofensivo o sexualmente explícito sin restricciones. El propio autor advierte que debe usarse con responsabilidad y conforme a las leyes locales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos, especialmente en temas especializados. No se ha evaluado su fiabilidad factual.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial, incluyendo restricciones de redistribución y obligaciones de atribución. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- El soporte multilingüe está declarado, pero no se ha verificado la calidad en cada idioma; es probable que el rendimiento en inglés sea superior al de los demás.
- La cuantización Q6_K introduce una pérdida de precisión respecto al modelo BF16, aunque suele ser mínima; no se han publicado métricas de degradación.
- El modelo requiere una versión reciente de llama.cpp (b10326+), lo que puede suponer un obstáculo en entornos con versiones antiguas.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-Q6_K-GGUF
- Modelo base BF16 abliterado: https://huggingface.co/mlasli/Nemotron-3.5-Lightning-30B-A3B-Heretic-Uncensored-BF16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Herramienta Heretic (abliteration): https://github.com/mlabonne/heretic-llm
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
