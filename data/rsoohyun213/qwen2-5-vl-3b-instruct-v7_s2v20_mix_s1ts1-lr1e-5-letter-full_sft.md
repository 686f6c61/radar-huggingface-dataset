# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix_s1ts1-lr1e-5-letter-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_S2v20_mix_s1ts1-lr1e-5-letter-full_SFT es un ajuste fino (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por Qwen (Alibaba). Lo publica el usuario rsoohyun213 en Hugging Face y está entrenado con la librería TRL sobre el modelo base. El nombre del repositorio codifica los hiperparámetros y la composición del dataset de entrenamiento (v7, S2v20, mix, s1ts1, lr1e-5, letter, full_SFT), lo que indica que se trata de un experimento de investigación más que de un lanzamiento de producto.

El modelo hereda la arquitectura de Qwen2.5-VL: un transformer multimodal con un codificador visual y un decodificador de lenguaje, diseñado para tareas de image-text-to-text. El ajuste fino parece orientado a tareas de razonamiento espacial, a juzgar por el nombre del proyecto en Weights & Biases ("spatial_reasoning@SFT-full").

Es relevante porque muestra cómo se puede especializar un VLM de 3B parámetros con SFT para dominios concretos, pero conviene tratarlo con cautela: no hay model card detallada, licencia declarada ni resultados de evaluación publicados. El repo ocupa 142,7 GB, un tamaño desproporcionado para un modelo de 3B, lo que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento además de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL: codificador visual + decodificador de lenguaje) |
| Parametros totales | 755.712 (según safetensors; el modelo base es de 3B, dato no coherente con el recuento reportado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card menciona "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Framework de entrenamiento | TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje de la familia Qwen2.5. El ajuste fino se realizó con SFT (supervised fine-tuning) mediante TRL, con un learning rate de 1e-5 según el nombre del repositorio. El identificador del experimento sugiere el uso de un dataset mixto ("mix") con configuraciones s1ts1, y el nombre del proyecto en Weights & Biases apunta a un foco en razonamiento espacial.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del propio ajuste fino. Las versiones de framework indican un entorno de entrenamiento reciente (PyTorch 2.8.0, Transformers 4.57.6).

## Capacidades

- Generación de texto e imagen-a-texto (image-text-to-text) heredada del modelo base.
- Razonamiento visual y espacial, presumiblemente reforzado por el ajuste fino (según el nombre del proyecto de entrenamiento).
- Conversación multi-turno en formato chat (tag "conversational").
- Compatible con text-generation-inference y endpoints compatibles (tags del repo).
- Capacidades multilingües: no confirmadas para este ajuste; dependen del modelo base.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.

## Casos de uso

- Investigación en razonamiento espacial: el ajuste parece orientado a tareas de comprensión espacial a partir de imágenes; útil para experimentos académicos que evalúen la mejora respecto al modelo base.
- Prototipado de asistentes visuales: al ser un VLM de 3B, puede desplegarse en entornos con recursos limitados para describir imágenes o responder preguntas sobre ellas.
- Evaluación comparativa de SFT: sirve como caso de estudio de cómo afecta un ajuste fino con TRL a un VLM pequeño en tareas específicas.
- Generación de descripciones de imágenes en pipelines de accesibilidad: con la cautela de validar la calidad, ya que no hay benchmarks publicados.
- Experimentos de destilación o especialización: punto de partida para quienes quieran reproducir el ajuste sobre Qwen2.5-VL-3B.
- Docencia y formación: ejemplo práctico de flujo SFT con TRL, Transformers y Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 3B en fp16 se estiman en torno a 6-8 GB de VRAM para inferencia; en cuantización de 4 bits podría reducirse a unos 3-4 GB, pero estos valores son estimaciones generales y no están confirmados para este ajuste.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer (RTX 3060 12 GB, RTX 4090) en fp16 o cuantizado, pero no hay validación publicada.
- Cabe en consumer GPU: probablemente sí en cuantización, no confirmado.
- Opciones de despliegue: transformers (confirmado por la librería), text-generation-inference (tag del repo). vLLM, llama.cpp u Ollama no están confirmados.
- Latencia y throughput: no disponibles.
- Nota: el tamaño del repo (142,7 GB) es mucho mayor que el de los pesos de un modelo de 3B, lo que sugiere checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Qwen2.5-VL-3B-Instruct SFT) | 3B (base) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) |
| Otros VLM de ~3B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo para este ajuste. La comparación más directa es con su modelo base Qwen2.5-VL-3B-Instruct, del que hereda arquitectura y capacidades, pero no hay evaluación que cuantifique la mejora o el deterioro del ajuste.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, evaluación ni limitaciones conocidas.
- Licencia no especificada: la model card indica "licence: license" sin concreción, por lo que el uso comercial no está garantizado; hay que consultar la licencia del modelo base (Qwen2.5-VL) y contactar con el autor.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación publicada no puede acotarse.
- Sesgos: no documentados; hereda los del modelo base y los del dataset de ajuste, que no se describe.
- Idiomas: no confirmados; el ajuste podría haber reducido el multilingüismo del modelo base si el dataset era monolingüe.
- Recuento de parámetros incoherente: safetensors reporta 755.712 parámetros, incompatible con un modelo de 3B; conviene verificar los archivos del repo.
- Tamaño del repo desproporcionado (142,7 GB): posible presencia de checkpoints intermedios; revisar antes de descargar.
- Sin descargas ni likes: modelo sin validación por la comunidad; no recomendado para producción sin evaluación propia.
- Sin benchmarks: no hay evidencia pública de rendimiento frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix_s1ts1-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/ehwnjbcq
