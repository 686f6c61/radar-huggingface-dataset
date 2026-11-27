# hrshlgunjal/nppe2-gemma3n

## Resumen

nppe2-gemma3n es un ajuste fino (fine-tuning) del modelo Gemma 3n E4B en su variante instruct, partiendo concretamente de la versión cuantizada a 4 bits publicada por Unsloth (`unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit`). Lo desarrolla el usuario hrshlgunjal y se distribuye en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura multimodal imagen-texto de la familia Gemma 3n de Google, con aproximadamente 7.818 millones de parámetros totales almacenados en safetensors y un repositorio de 9,9 GB.

El propósito declarado en la model card es mínimo: se trata de un modelo afinado subido a Hugging Face, entrenado con la librería Unsloth (que el autor indica que permitió un entrenamiento "2x más rápido"). No se documenta el dataset de ajuste, el objetivo concreto del fine-tuning ni los hiperparámetros empleados, por lo que su comportamiento específico más allá del modelo base no está caracterizado públicamente.

Es relevante ahora porque ilustra el flujo habitual de la comunidad: partir de un checkpoint cuantizado a 4 bits (bitsandbytes) para ajustar con recursos limitados y publicar el resultado. Quien lo evalúe debe tener en cuenta que hereda las capacidades y limitaciones de Gemma 3n E4B, pero con un ajuste cuyos datos y efectos no están descritos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3n (transformer multimodal imagen-texto; detalles exactos de la arquitectura no disponibles en la información proporcionada) |
| Parametros totales | 7.818.517.072 |
| Parametros activos | no disponible (Gemma 3n E4B emplea parámetros efectivos; el valor exacto no se detalla en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) en el modelo base; el repo incluye safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit`, un checkpoint de Gemma 3n E4B instruct cuantizado a 4 bits con bitsandbytes y optimizado por Unsloth. La arquitectura subyacente es la de Gemma 3n, orientada a tareas imagen-texto (pipeline `image-text-to-text`) y texto (tags `text-generation-inference`, `gemma3n`). Los detalles internos de la arquitectura (tipo de atención, mecanismos de eficiencia, tamaño de contexto nativo) no se especifican en la información proporcionada.

En cuanto al entrenamiento del ajuste fino, la model card solo indica que se realizó con Unsloth y que fue "2x más rápido". No se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni los hiperparámetros (learning rate, epochs, LoRA frente a full fine-tuning). Tampoco se describen innovaciones técnicas propias más allá del uso de las optimizaciones de Unsloth y de la cuantización 4-bit del modelo base.

## Capacidades

- Generación de texto conversacional (tag `conversational`, pipeline `image-text-to-text`).
- Procesamiento de entradas imagen-texto, heredado de Gemma 3n.
- Generación de texto general; las capacidades específicas de razonamiento, código o matemáticas no están documentadas para este ajuste concreto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente `en` (inglés).
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo pequeño (7,8 B parámetros) y cuantizado a 4 bits, puede desplegarse en hardware modesto para validar flujos de chat antes de pasar a un modelo mayor.
- Experimentación académica con fine-tuning: sirve como ejemplo reproducible de ajuste de Gemma 3n E4B con Unsloth sobre un checkpoint 4-bit, útil para estudiar el impacto de la cuantización en el ajuste.
- Tareas imagen-texto ligeras: al heredar el pipeline `image-text-to-text` de Gemma 3n, puede emplearse para describir imágenes o responder preguntas sobre ellas, siempre que se valide el efecto del ajuste.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecución en GPUs de consumo, adecuado para demos y entornos de desarrollo.
- Base para ajustes posteriores: puede servir como punto de partida para fine-tunings específicos de dominio, dado que se distribuye con licencia Apache 2.0.
- Evaluación comparativa de checkpoints comunitarios: útil para medir cómo un ajuste no documentado altera el comportamiento respecto al modelo base Gemma 3n E4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (7,8 B parámetros) y el repo de 9,9 GB, la inferencia en 4 bits requeriría del orden de 6-8 GB de VRAM, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; por tamaño, es plausible en GPUs con 8-12 GB de VRAM en cuantización 4 bits, pero no hay validación publicada.
- Opciones de despliegue: los tags indican compatibilidad con `transformers` y `text-generation-inference`; también se menciona `unsloth`. Otras opciones (vLLM, llama.cpp, Ollama) no están confirmadas en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nppe2-gemma3n (este modelo) | 7.818.517.072 | no disponible | apache-2.0 | Hugging Face |
| unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit (base) | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| Gemma 3n E4B-it (original de Google) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino no está documentado: se desconoce el dataset, el objetivo y los hiperparámetros, por lo que el comportamiento puede desviarse del modelo base de forma imprevisible.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada para este checkpoint.
- Sesgos: no documentados; al heredar de Gemma 3n, pueden persistir sesgos del modelo base y añadirse los del dataset de ajuste.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 3n de Google, cuyos términos pueden imponer restricciones adicionales.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.
- Cuantización 4-bit del modelo base: puede degradar la calidad respecto al modelo en precisión completa.
- Longitud de contexto no especificada: no planificar aplicaciones que dependan de ventanas largas sin verificarlo empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrshlgunjal/nppe2-gemma3n
- Modelo base: https://huggingface.co/unsloth/gemma-3n-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
