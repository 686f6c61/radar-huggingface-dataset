# EhsaasBawa16/Novius-Crusta

## Resumen

Novius-Crusta es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario EhsaasBawa16 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) construido sobre la arquitectura Qwen2, especializado en tareas de código y conversación por su modelo base. El ajuste se realizó partiendo de la versión cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit) y se entrenó con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

El modelo se publica con el pipeline de text-generation, pesos en formato safetensors y compatibilidad con text-generation-inference y endpoints. Su relevancia es limitada en el momento de redacción: cuenta con 0 descargas y 0 likes, no incluye información sobre el conjunto de datos de ajuste, hiperparámetros, evaluación ni casos de uso previstos, y la model card es prácticamente la plantilla por defecto que genera Unsloth. Por tanto, debe considerarse un experimento de ajuste personal más que un modelo listo para producción.

La ficha que sigue se basa exclusivamente en los metadatos de Hugging Face, la model card y las características conocidas del modelo base Qwen2.5-Coder-3B-Instruct. Todo dato no confirmado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino del modelo base Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-3B-Instruct soporta hasta 32.768 tokens, pero no se confirma que el ajuste lo preserve) |
| Tipos de cuantizacion | El modelo base de partida estaba cuantizado a 4 bits (bnb-4bit); el repositorio contiene pesos safetensors. No se detallan otras cuantizaciones disponibles |
| Idiomas soportados | Ingles (segun el campo `language: en` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con aproximadamente 3,09 mil millones de parámetros, heredado del modelo Qwen2.5-Coder-3B-Instruct. El ajuste fino se realizó sobre la variante cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`), empleando la librería Unsloth y TRL de Hugging Face. La model card únicamente indica que el entrenamiento fue "2x más rápido" gracias a Unsloth, sin aportar detalles sobre el dataset, el número de tokens, la composición de los datos, la técnica de ajuste (SFT, DPO, RLHF) ni los hiperparámetros utilizados.

No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento. Dado que el modelo base está orientado a código, es razonable esperar que el ajuste herede esa orientación, pero no hay información que confirme qué tipo de datos se emplearon para el fine-tuning ni si se preservaron las capacidades originales del modelo base. Tampoco se especifica si el ajuste se realizó con LoRA, QLoRA u otra técnica, aunque el uso de Unsloth y de un modelo base en 4 bits sugiere QLoRA, sin que esto pueda confirmarse.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Generación y asistencia en código, por la orientación del modelo base hacia tareas de programación.
- Soporte de plantillas de chat de Qwen2 (formato conversacional), al conservar la arquitectura y el tokenizador del modelo base.
- Compatibilidad con text-generation-inference y endpoints de Hugging Face, según los tags del repositorio.
- Capacidades de tool calling y function calling: no confirmadas en la información proporcionada, aunque el modelo base Qwen2.5-Coder-Instruct las soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este ajuste concreto.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de código en local: el modelo, con 3,09 B de parámetros, puede ejecutarse en GPUs de consumo y emplearse para autocompletar o explicar fragmentos de código en entornos de desarrollo integrado, aprovechando la orientación a programación del modelo base.
- Generación de documentación técnica: puede redactar docstrings, comentarios y READMEs a partir de fragmentos de código, siempre que se valide la salida por el riesgo de alucinación inherente a los modelos de 3 B.
- Prototipado rápido de chatbots conversacionales: al ser compatible con text-generation-inference, puede desplegarse como endpoint de generación de texto para pruebas de concepto de asistentes en inglés.
- Filtrado y reformateo de texto: tareas de transformación de texto (resumen, reescritura, extracción de campos) en pipelines ligeros donde el coste computacional importa.
- Educación y experimentación: útil como modelo de referencia para estudiar técnicas de ajuste fino con Unsloth y TRL, dado que el repositorio documenta el proceso de entrenamiento acelerado.
- Evaluación comparativa de fine-tunings: sirve como caso de estudio para medir cómo un ajuste sobre un modelo base cuantizado a 4 bits afecta al rendimiento frente al original, aunque no se publican métricas al respecto.
- Despliegue en hardware modesto: con 3,09 B de parámetros, cabe en GPUs de consumo para inferencia en local, lo que facilita pruebas sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomiendan 8-12 GB de VRAM.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-3 GB para pesos, más overhead; podría caber en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag del repositorio), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Novius-Crusta (este modelo) | 3,09 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face |
| CodeLlama-7B-Instruct | 7 B | 16.384 tokens (segun documentacion del modelo) | Llama 2 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo para Novius-Crusta, por lo que la comparativa se limita a parámetros, contexto y licencia. El modelo base Qwen2.5-Coder-3B-Instruct es la referencia natural, y no hay evidencia de que el ajuste mejore sus capacidades.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y evaluación: no es posible verificar qué mejora aporta el ajuste respecto al modelo base.
- Riesgo de alucinación elevado por el tamaño reducido (3,09 B) y por la falta de evaluación publicada.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no confirmada para este ajuste; no se puede asumir que herede los 32.768 tokens del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder conviene revisar también las condiciones del modelo base y de los datos de ajuste, que no se documentan.
- Modelo con 0 descargas y 0 likes: sin validación por parte de la comunidad, sin issues ni discusiones que permitan evaluar su calidad.
- El ajuste se realizó sobre una versión cuantizada a 4 bits del modelo base, lo que puede introducir degradación adicional respecto al modelo original en precisión completa.
- No se garantiza que conserve las capacidades de tool calling del modelo base.
- Para producción, se recomienda usar el modelo base Qwen2.5-Coder-3B-Instruct salvo que se valide empíricamente una mejora concreta de este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EhsaasBawa16/Novius-Crusta
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
