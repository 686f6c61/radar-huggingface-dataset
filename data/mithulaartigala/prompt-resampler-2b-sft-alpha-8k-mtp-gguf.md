# mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP-GGUF

## Resumen

Prompt-Resampler-2B-SFT-Alpha-8K-MTP es un ajuste fino (fine-tune) del modelo Qwen3.5-2B (variante instruct) especializado en una tarea muy concreta: el *prompt resampling*, una tecnica de aumento de datos que genera variaciones de un enunciado preservando la tarea subyacente (cambiando nombres, cifras, escenarios, etc., pero manteniendo la estructura logica del problema). Lo desarrolla el usuario de Hugging Face mithulaartigala y se distribuye bajo licencia Apache 2.0.

El modelo parte de una base de aproximadamente 1.940 millones de parametros (1.942.653.248 segun los pesos en safetensors) y fue entrenado con LoRA (r=16, alpha=32) sobre el dataset `prompt-resampling-alpaca-gsm8k`, con una longitud de secuencia de 8.192 tokens. La version publicada en este repositorio son los pesos en formato GGUF, pensados para su uso en entornos locales como LM Studio, Unsloth Studio o llama.cpp, y el autor lo etiqueta como release "Alpha", con las limitaciones que ello implica.

Su relevancia es acotada pero clara para quien construye pipelines de sintesis de datos: en lugar de usar un modelo grande y caro para reescribir prompts masivamente, este modelo de 2B ofrece una alternativa ligera que preserva el formato de chat nativo de Qwen3.5 y esta optimizada para gastar menos tokens de razonamiento manteniendo alta fiabilidad en la generacion de resamples de prompts no JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B instruct); tag `qwen3_5` |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | GGUF (este repositorio); cuantizaciones concretas no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en el modelo base |
| Tamano del repositorio | 18,6 GB |
| Metodo de ajuste | LoRA (r=16, alpha=32) con Unsloth Studio |
| Dataset de entrenamiento | mithulaartigala/prompt-resampling-alpaca-gsm8k |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-2B en su variante instruct, por lo que conserva el formato de chat nativo y las capacidades conversacionales de la base. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 y alpha 32, entrenado con una longitud de secuencia de 8.192 tokens mediante Unsloth Studio. El dataset utilizado es `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una mezcla de ejemplos tipo Alpaca y problemas de GSM8K adaptados a la tarea de resampling de prompts.

La innovacion principal no esta en la arquitectura sino en el objetivo de entrenamiento: el modelo aprende a reescribir un prompt preservando su tarea y estructura logica mientras varian los elementos superficiales (nombres, cantidades, escenarios). El autor indica que el fine-tune se centra en la fiabilidad del resampling y en reducir el numero de tokens de razonamiento empleados, manteniendo una fiabilidad alta en prompts que no estan en formato JSON. La version MTP (multi-token prediction) esta marcada explicitamente en el repositorio, aunque no se detalla en la informacion disponible como se implementa esa prediccion multi-token.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3.5-2B instruct.
- Prompt resampling: genera variaciones de un enunciado preservando la tarea original y modificando variables como nombres, cifras, lugares o escenario.
- Preservacion del formato de chat nativo de Qwen3.5 (roles system/user/assistant).
- Razonamiento mas eficiente en tokens que la base, segun indica el autor, orientado a reducir coste en generacion masiva.
- Fiabilidad destacada en resampling de prompts no JSON.
- Compatible con la API OpenAI (chat completions) a traves de Unsloth Studio, LM Studio y vLLM.
- Soporte de inferencia con Transformers mediante `AutoModelForImageTextToText` (la clase usada en el ejemplo del autor), aunque no se documentan capacidades de vision reales.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Aumento de datos para entrenamiento de modelos: generar variantes de un mismo problema (por ejemplo, problemas matematicos de GSM8K) cambiando nombres y cifras para ampliar el dataset sin alterar la estructura de la tarea.
- Generacion de datasets sinteticos de evaluacion: crear baterias de prompts equivalentes para medir robustez de otros modelos ante cambios superficiales en el enunciado.
- Pipelines de sintesis de datos a bajo coste: al ser un modelo de ~2B en GGUF, puede ejecutarse en local y procesar lotes de prompts sin depender de APIs de modelos grandes.
- Preprocesamiento en sistemas de evaluacion de LLM: resamplear prompts de benchmark para reducir el sobreajuste a enunciados concretos y detectar memorizacion.
- Prototipado de herramientas de parafraseo controlado: integrado via API compatible con OpenAI en LM Studio o vLLM para tareas de reescritura que deban conservar la intencion original.
- Educacion y generacion de ejercicios: producir variantes de problemas matematicos o de logica para material didactico, manteniendo la dificultad y el tipo de tarea.
- Investigacion en aumento de datos para fine-tuning: usar los resamples como datos adicionales en el entrenamiento de modelos mas pequenos especializados en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~1,94 B de parametros, en cuantizacion de 4 bits (Q4) cabria en torno a 1,5-2 GB de VRAM; en 8 bits, unos 2,5-3 GB; en FP16, aproximadamente 4 GB. Estas cifras son estimaciones basadas en el tamano del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM deberia poder ejecutarlo en cuantizaciones bajas; para FP16 se recomienda una RTX 3060/4060 o superior. Para servir con vLLM se recomienda una GPU con al menos 8-16 GB (por ejemplo, RTX 4090, A10, L4) para tener margen de batch y contexto.
- Cabe en GPU consumer: si, en cuantizaciones GGUF de 4-8 bits.
- Opciones de despliegue: Unsloth Studio (puerto 8888), LM Studio (puerto 1234), vLLM (con el modelo base en safetensors, `--max-model-len 8192`) y Transformers. Tambien seria compatible con llama.cpp al distribuirse en GGUF, aunque el autor no lo documenta explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Prompt-Resampler-2B-SFT-Alpha-8K-MTP | ~1,94 B | 8.192 | Apache 2.0 | GGUF / safetensors | Fine-tune especializado en prompt resampling |
| Qwen3.5-2B (base) | ~2 B | no disponible | no disponible en esta ficha | safetensors | Modelo generalista instruct |
| Modelos generalistas de 7-8 B (p. ej. familias Llama/Mistral/Qwen de ese tamano) | 7-8 B | variable | variable | safetensors / GGUF | Reescritura y generacion general; mayor coste de inferencia |

La comparacion directa con alternativas especializadas en resampling de prompts no esta disponible en la informacion proporcionada. Frente a la base Qwen3.5-2B, la diferencia es el ajuste LoRA especifico y la preservacion del formato de chat; frente a modelos generalistas mas grandes, la ventaja es el coste de inferencia y la posibilidad de ejecucion local en GGUF, a cambio de una especializacion muy estrecha.

## Limitaciones y advertencias

- Release Alpha: el propio autor advierte que ciertos comportamientos pueden no cumplir las expectativas.
- Puede rendir mal en prompts con estructuras no vistas durante el entrenamiento o en prompts largos en general.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Ventana de contexto de 8.192 tokens, suficiente para prompts individuales pero no para documentos largos.
- Especializacion muy estrecha: no es un modelo generalista y su uso fuera del resampling de prompts probablemente degrade la calidad respecto a la base.
- Riesgo de alucinacion inherente a los modelos de ~2B, especialmente al alterar cifras o contextos en los resamples; conviene validar la salida en pipelines de produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse sobre Alpaca y GSM8K, puede heredar sesgos de esos datasets.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 debe verificarse por separado para confirmar compatibilidad de licencias en produccion.
- El repositorio pesa 18,6 GB, lo que sugiere multiples cuantizaciones GGUF; conviene seleccionar el archivo adecuado segun el hardware.
- No se documentan resultados de benchmarks ni evaluaciones cuantitativas de calidad del resampling.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/mithulaartigala/Prompt-Resampler-2B-SFT-Alpha-8K-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
