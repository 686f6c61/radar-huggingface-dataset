# ansarisultan/lexachat-4b-merged

## Resumen

LexaChat-4B-Merged es un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B, publicado por el usuario ansarisultan en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, aunque su pipeline declarado principal es la generacion de texto conversacional. Con 4.659.865.088 parametros y pesos en formato safetensors, el repositorio ocupa 9,3 GB.

El modelo se ha entrenado utilizando Unsloth y la libreria TRL de Hugging Face, segun indica el autor, lo que sugiere un proceso de ajuste supervisado (SFT) o preferencias sobre el modelo base. La model card es extremadamente escueta: no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni los hiperparametros utilizados, por lo que la mayor parte de las especificaciones tecnicas deben inferirse del modelo base Qwen3.5-4B.

Su relevancia es limitada en el momento de publicacion: cero descargas y cero likes, licencia Apache 2.0 permisiva y un unico idioma declarado (ingles). Resulta util como ejemplo de pipeline de fine-tuning ligero con Unsloth, pero no dispone de evaluacion publica ni de documentacion suficiente para recomendarlo en produccion sin una validacion propia por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estandar tipo GPTQ/AWQ/GGUF, no confirmado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B de Unsloth, que a su vez deriva de la familia Qwen3.5. La arquitectura concreta (atencion, capas, dimensiones, uso de atencion lineal o hibrida) no se detalla en la informacion disponible; el tag `qwen3_5` indica la familia, pero no se aportan especificaciones de capas ni de mecanismo de atencion. El pipeline declarado `image-text-to-text` sugiere que el modelo base incorpora capacidades multimodales, aunque la model card no lo confirma explicitamente.

El entrenamiento se realizo con Unsloth y TRL, segun el autor, con una mejora declarada de "2x faster" respecto a un entrenamiento convencional. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o simplemente SFT, ni la duracion o el hardware utilizado. Tampoco se documenta si el ajuste fue de todos los parametros o mediante LoRA/QLoRA y posterior merge (el sufijo "merged" sugiere una fusion de adaptadores en los pesos base, pero no se confirma).

## Capacidades

- Generacion de texto conversacional en ingles (idioma declarado).
- Entrada multimodal image-text-to-text segun el pipeline declarado, aunque no se documentan ejemplos ni limites.
- Compatibilidad con text-generation-inference y transformers.
- Entrenado con Unsloth, lo que facilita su reproduccion y reentrenamiento.
- No se documenta soporte de tool calling, function calling ni agentes multi-step.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta verificado.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el tamano de 4,66 mil millones de parametros permite desplegarlo en una unica GPU consumer, lo que lo hace adecuado para pruebas de concepto y demos internas antes de escalar a modelos mayores.
- Fine-tuning posterior sobre dominios especificos: al estar licenciado bajo Apache 2.0 y publicarse en safetensors, un equipo puede partir de estos pesos y aplicar un nuevo ajuste con LoRA sobre datos propios sin restricciones de licencia.
- Evaluacion comparativa de pipelines Unsloth: sirve como referencia para medir el impacto de un ajuste fino ligero frente al modelo base Qwen3.5-4B en tareas concretas.
- Generacion de texto en entornos con recursos limitados: con cuantizacion de 4 bits cabe en GPUs de 8-12 GB, lo que permite ejecutarlo en estaciones de trabajo sin infraestructura dedicada.
- Experimentacion con entradas imagen-texto: si el modelo base conserva las capacidades multimodales, puede emplearse para tareas de descripcion de imagenes o respuesta a preguntas visuales, siempre que se valide empiricamente.
- Base para investigacion sobre sesgos y alineacion: al carecer de evaluacion publica, es un candidato para estudiar como un ajuste fino sin documentar afecta al comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos; 8-12 GB totales recomendados.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3 GB para pesos; 6-8 GB totales recomendados.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para FP16; RTX 3090, RTX 4080, RTX 4070 Ti o RTX 4060 Ti 16 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 bits, y en tarjetas de 16-24 GB en precision completa.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama solo si se generan pesos GGUF, lo cual no esta confirmado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LexaChat-4B-Merged | 4,66 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning sin documentar de Qwen3.5-4B |
| Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | segun modelo base | Hugging Face | Modelo de referencia del que deriva |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa consolidada en la misma categoria |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | Hugging Face | Menor tamano, licencia mas restrictiva |

Los datos de contexto y licencia de los modelos comparados provienen de su documentacion publica; los del modelo base Qwen3.5-4B no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta dataset, hiperparametros, evaluacion ni limitaciones, lo que impide reproducir el ajuste o estimar su calidad.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Solo ingles declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: sin evaluacion publica, no hay datos sobre la tasa de alucinacion ni sobre sesgos conocidos.
- Posible perdida de capacidades del modelo base: el ajuste fino sin documentar puede degradar el rendimiento en tareas no cubiertas por el dataset de entrenamiento, incluida la multimodalidad.
- Licencia Apache 2.0: permite uso comercial, pero el adoptante asume toda la responsabilidad sobre el comportamiento del modelo.
- No se confirma la disponibilidad de pesos en GGUF ni de cuantizaciones precalculadas, lo que puede requerir trabajo adicional para desplegarlo con llama.cpp u Ollama.
- La fecha de creacion indicada (2026-11-26) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio; conviene verificarlo antes de confiar en ellos.

## Enlaces

- Hugging Face: https://huggingface.co/ansarisultan/lexachat-4b-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
