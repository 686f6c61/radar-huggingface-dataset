# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3

## Resumen

El modelo `smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3` es un ajuste fino del modelo SmolLM2-135M-Instruct realizado por el usuario jekunz de Hugging Face. Se trata de un experimento de investigación centrado en el aprendizaje por transferencia entre lenguas germánicas nórdicas: primero se entrena sobre el subconjunto de noruego nynorsk de FineWeb-2 y después sobre el subconjunto de feroés del mismo corpus, con el objetivo de adaptar un modelo pequeño a un idioma de bajos recursos como el feroés.

El modelo parte de la arquitectura SmolLM2-135M-Instruct, un transformer decoder-only de 134.515.008 parámetros (aproximadamente 135 millones), con una ventana de contexto máxima de 2048 tokens durante el entrenamiento. El resultado es un modelo de generación de texto conversacional especializado en feroés, publicado bajo licencia Apache 2.0, lo que permite uso comercial con atribución.

Su relevancia radica en dos factores: por un lado, demuestra que es posible adaptar modelos muy pequeños a idiomas de bajos recursos mediante transferencia desde una lengua emparentada; por otro, ofrece un punto de partida ligero y desplegable en hardware de consumo para experimentación con procesamiento de lenguaje natural en feroés. El autor advierte explícitamente de que se trata de un modelo de investigación sin evaluación exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de llama.cpp/GGUF por arquitectura Llama, aunque no se documentan en la model card) |
| Idiomas soportados | feroés (fo); entrenado con transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-135M-Instruct, un transformer decoder-only de la familia Llama, con 134.515.008 parámetros. El proceso de entrenamiento consistió en un ajuste fino supervisado en dos fases: primero una época sobre el subconjunto de noruego nynorsk de FineWeb-2 y después cinco épocas sobre el subconjunto de feroés del mismo corpus. Se utilizó una tasa de aprendizaje de 5e-4 con scheduler coseno, un ratio de warmup de 0,05, tamaño de lote de 8, acumulación de gradientes de 32 pasos (lote efectivo de 256) y una longitud máxima de contexto de 2048 tokens. El entrenamiento se ejecutó en una única GPU A100 de 40 GB.

La semilla utilizada es la 3, una de las tres semillas de entrenamiento previstas para esta configuración, lo que sugiere que el autor está realizando un estudio de robustez o variabilidad entre semillas. No se documentan detalles sobre la composición exacta del dataset más allá de la referencia a FineWeb-2, ni sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste fino. Tampoco se especifica el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en feroés, con capacidad de mantener conversaciones multi-turno gracias a su naturaleza instruct.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base SmolLM2-135M-Instruct.
- Generación de texto conversacional (pipeline `text-generation` con etiqueta `conversational`).
- Capacidad multilingüe limitada: el entrenamiento se centra en feroés, con transferencia desde noruego nynorsk; no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Compatible con text-generation-inference y endpoints según las etiquetas del repositorio.

## Casos de uso

- Experimentación académica en procesamiento de lenguaje natural para lenguas de bajos recursos: el modelo sirve como base para estudiar técnicas de transferencia entre lenguas germánicas nórdicas, comparando el efecto de entrenar primero en nynorsk y luego en feroés frente a entrenar directamente en feroés.
- Generación de texto asistida en feroés: puede utilizarse para redactar borradores, completar frases o generar contenido breve en feroés, aprovechando su ajuste específico sobre el subconjunto feroés de FineWeb-2.
- Prototipado de asistentes conversacionales en feroés: al ser un modelo instruct de pequeño tamaño, permite desplegar rápidamente un chatbot básico para pruebas de concepto sin necesidad de infraestructura costosa.
- Investigación sobre reproducibilidad y semillas de entrenamiento: al ser la semilla 3 de una configuración con tres semillas, permite analizar la variabilidad de resultados entre ejecuciones y su impacto en la calidad del modelo.
- Despliegue en entornos con recursos limitados: con 135 millones de parámetros y un repositorio de 0,3 GB, puede ejecutarse en CPU o en GPUs de consumo para tareas de generación de texto de baja latencia.
- Evaluación comparativa de modelos pequeños multilingües: sirve como referencia en estudios que comparen el rendimiento de modelos de menos de 200 millones de parámetros adaptados a idiomas de bajos recursos.
- Filtrado y aumento de datos en feroés: puede emplearse para generar variaciones de texto o para tareas auxiliares de etiquetado en pipelines de procesamiento de corpus en feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precisión completa (fp32), alrededor de 0,15 GB en fp16/bf16 y menos de 0,1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference`), y por arquitectura Llama es compatible con llama.cpp, Ollama y vLLM, aunque estas opciones no se documentan explícitamente en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3 | 134.515.008 | 2048 | feroés | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base) | ~135 M | no disponible en la información | multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk (modelo base directo) | ~135 M | no disponible en la información | noruego nynorsk | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, idioma y licencia.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no ha sido evaluado de forma amplia, por lo que su calidad y fiabilidad en producción no están garantizadas.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede producir texto plausible pero incorrecto, especialmente en un idioma de bajos recursos como el feroés.
- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse sobre FineWeb-2 puede heredar sesgos presentes en el corpus web.
- Limitaciones de contexto: la ventana de 2048 tokens es reducida para tareas que requieran contexto largo.
- Limitaciones de idioma: el modelo está especializado en feroés; su rendimiento en otros idiomas, incluido el español, no está documentado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución y revisar las condiciones del corpus FineWeb-2.
- Caveat para producción: al ser la semilla 3 de tres ejecuciones, los resultados pueden variar entre semillas; no se documenta el rendimiento de las otras semillas.
- No se documentan técnicas de alineación (RLHF/DPO) posteriores al ajuste fino, lo que puede afectar a la calidad de las respuestas conversacionales.

## Enlaces

- [Hugging Face: jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3](https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3)
- [Modelo base directo: jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk](https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk)
- [Dataset FineWeb-2: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-135M-Instruct (modelo original de SmolLM2)](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
