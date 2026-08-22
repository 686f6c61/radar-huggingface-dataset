# Echoo113/Qwen2.5-7B-Instruct-dragon_prompted-ft4.43

## Resumen

Este modelo es un fine-tuning de [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) publicado por el usuario Echoo113 bajo el identificador `Qwen2.5-7B-Instruct-dragon_prompted-ft4.43`. El nombre sugiere que se trata de un ajuste con prompts de tipo "dragon" (probablemente orientado a rol o narrativa) y la versión 4.43 de una serie de experimentos del autor, que también ha publicado variantes como `dragon-STEER1.125-ft4.42`. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, y el repositorio ocupa solo 0.3 GB, lo que indica que se trata de un adaptador (posiblemente LoRA) y no de un modelo completo.

El interés de esta ficha es limitado para producción: el modelo tiene cero descargas y cero me gusta, no hay documentación del dataset ni resultados de benchmarks. Su utilidad principal es como ejemplo de fine-tuning experimental sobre un modelo base sólido, y para evaluar si el comportamiento "dragon prompt" es adecuado para casos de uso narrativos o de rol. Todo lo demás (arquitectura, contexto, idiomas) se hereda del modelo base Qwen2.5-7B-Instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-7B-Instruct) |
| Parámetros totales | no disponible (adaptador de 0.3 GB; el modelo base tiene 32.61B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base; hasta 128K con YaRN) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponibles (el modelo base soporta multilingüe: inglés, chino y otros ~29 idiomas) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-7B-Instruct, un transformer decoder-only con 32.61B parámetros, atención de múltiples cabezas y ventana de contexto nativa de 32K tokens. El ajuste se realizó con SFT usando TRL (versión 0.19.1) sobre Transformers 4.57.6 y PyTorch 2.11.0+cu128. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el procedimiento exacto de SFT (por ejemplo, si se usó LoRA o full fine-tuning). El nombre "dragon_prompted" sugiere que los datos de entrenamiento consistían en prompts etiquetados con temática de dragones, pero no hay evidencia pública que confirme el contenido del dataset. El autor ha publicado otra variante con "STEER1.125", lo que indica que experimenta con técnicas de steering o control de activaciones, pero no se documenta en esta model card.

## Capacidades

- Generación de texto instructivo: hereda las capacidades del modelo base para seguir instrucciones y responder en formato chat.
- Razonamiento y matemáticas: el modelo base Qwen2.5-7B-Instruct tiene buen rendimiento en razonamiento y matemáticas; el adaptador no modifica estas capacidades salvo que el fine-tune las haya reforzado o degradado.
- Multilingüismo: soporta los idiomas del modelo base (principalmente inglés y chino, con cobertura parcial de otros idiomas).
- Sin capacidades especiales documentadas: no hay evidencia de tool calling, function calling, agentes, visión o audio en la model card del adaptador.
- El nombre sugiere una especialización en prompts "dragon" (posiblemente narrativos, de rol o temáticos), pero no se puede confirmar sin datos de evaluación.

## Casos de uso

- Generación de narrativa o rol de fantasía: si el fine-tune se entrenó con prompts "dragon", podría generar descripciones de dragones, diálogos en juegos de rol o historias de temática fantástica. Sin embargo, no hay evidencia pública de que esto funcione bien, y el riesgo de alucinación es alto.
- Experimentación con fine-tuning SFT: sirve como ejemplo de cómo entrenar un adaptador con TRL sobre Qwen2.5-7B-Instruct, útil para desarrolladores que quieren replicar el flujo de trabajo.
- Comparación de técnicas de prompt steering: junto con la variante `STEER1.125`, puede usarse para estudiar el efecto de diferentes estrategias de ajuste en el mismo modelo base.
- Fine-tuning para dominios específicos: aunque el dominio es desconocido, el enfoque (SFT sobre un modelo base robusto) es transferible a otros dominios como atención al cliente o generación de documentación.
- Evaluación de la calidad de adaptadores de bajo tamaño: el adaptador de 0.3 GB puede evaluarse en tareas de generación para ver cuánto se desvía del modelo base y si el fine-tune ha introducido sesgos.
- No se recomienda su uso en producción sin una evaluación previa rigurosa, dado que no hay benchmarks publicados y el modelo tiene cero descargas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se dispone de comparativas con otros modelos. Los únicos datos de rendimiento indirectos son los del modelo base Qwen2.5-7B-Instruct, que en su ficha original reporta resultados competitivos en razonamiento, código y matemáticas, pero no pueden atribuirse al adaptador `dragon_prompted` sin una validación específica.

## Requisitos de hardware

- VRAM estimada: para ejecutar el modelo base Qwen2.5-7B-Instruct (32.61B parámetros) con el adaptador, se necesita al menos 8 GB de VRAM en FP16 (16 GB recomendados para margen). Con cuantización Q4, se puede reducir a ~4-5 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para FP16 sin problemas; A100 40GB o H100 para despliegue en servidor; GPU con 8 GB (RTX 3070, RTX 4060) pueden funcionar con cuantización y batch pequeño.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización (GGUF o AWQ). El adaptador de 0.3 GB se carga fácilmente.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Transformers con PEFT para cargar el adaptador.
- Latencia y throughput: no hay datos medidos para este adaptador. Como referencia, Qwen2.5-7B-Instruct en FP16 en una A100 genera ~40-60 tokens/s; en una RTX 4090, ~30-50 tokens/s. El adaptador añade un overhead mínimo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 32.61B | 32K tokens | Apache-2.0 | Hugging Face, ModelScope |
| Echoo113/Qwen2.5-7B-Instruct-dragon_prompted-ft4.43 | adaptador ~0.3 GB | 32K (base) | no disponible | Hugging Face |
| Echoo113/Qwen2.5-7B-Instruct-dragon-STEER1.125-ft4.42 | adaptador (tamaño desconocido) | 32K (base) | no disponible | Hugging Face |
| Llama 3.1 8B Instruct | 8.03B | 128K tokens | Llama 3.1 License (uso comercial permitido) | Hugging Face |

La comparación directa con Llama 3.1 8B es limitada porque el adaptador no tiene benchmarks propios. El modelo base Qwen2.5-7B-Instruct es competitivo con Llama 3.1 8B en razonamiento y código, pero la calidad del adaptador "dragon" es desconocida. La variante STEER1.125 parece ser un experimento de steering, pero no hay datos comparativos.

## Limitaciones y advertencias

- Sin datos de entrenamiento públicos: no se sabe qué prompts se usaron, si hubo filtrado de contenido o si se introdujeron sesgos.
- Riesgo de alucinación: al ser un fine-tune sin validación, puede generar contenido no factual o inconsistente, especialmente en tareas de razonamiento.
- Licencia incierta: la model card indica "licence: license" sin especificar, lo que impide garantizar el uso comercial. El modelo base es Apache-2.0, pero el adaptador puede tener restricciones.
- Cero adopción: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido evaluado por la comunidad.
- No hay benchmarks: no se puede afirmar que el fine-tune mejore o degrade el modelo base en ninguna tarea.
- Posible sobreajuste al dominio "dragon": si el dataset era muy específico, el adaptador puede degradar el rendimiento en tareas generales.
- Compatibilidad de versiones: el entrenamiento se realizó con Transformers 4.57.6 y TRL 0.19.1; versiones antiguas pueden fallar al cargar el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Echoo113/Qwen2.5-7B-Instruct-dragon_prompted-ft4.43
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante STEER1.125 del mismo autor: https://huggingface.co/Echoo113/Qwen2.5-7B-Instruct-dragon-STEER1.125-ft4.42
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-7B-Instruct
- Repositorio TRL (framework de entrenamiento): https://github.com/huggingface/trl
