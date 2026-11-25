# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_S2only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. El modelo base, de aproximadamente 3.000 millones de parametros, pertenece a la familia Qwen2.5-VL de Alibaba, especializada en comprension de imagenes y texto (image-text-to-text). Este checkpoint concreto se ha entrenado mediante TRL sobre el modelo Instruct original, presumiblemente para una tarea especifica de razonamiento espacial o de lectura de documentos, a juzgar por los identificadores del nombre (S2, letter, spatial_reasoning en la traza de entrenamiento).

El modelo hereda la arquitectura transformer multimodal de Qwen2.5-VL, con un codificador visual y un decodificador de lenguaje, y una ventana de contexto nativa de 32.768 tokens en la version base (ampliable hasta 128.000 en la familia Qwen2.5-VL). El ajuste se realizo con el framework TRL 1.3.0 sobre Transformers 4.57.6 y PyTorch 2.8.0+cu128. El repositorio ocupa 142,7 GB, un tamano desproporcionado para un modelo de 3B, lo que sugiere la presencia de multiples checkpoints intermedios o artefactos de entrenamiento ademas de los pesos finales.

La relevancia de esta ficha es limitada: se trata de un experimento de investigacion personal, sin descargas ni interacciones, sin licencia declarada y sin resultados de evaluacion publicados. Resulta util unicamente como referencia para quienes sigan el linaje de fine-tunes sobre Qwen2.5-VL o quieran reproducir el pipeline de SFT con TRL sobre tareas de razonamiento espacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + decodificador de lenguaje), familia Qwen2.5-VL |
| Parametros totales | 755.712 (segun safetensors del repo; el modelo base Qwen2.5-VL-3B tiene ~3.000 millones, dato no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-3B-Instruct soporta 32.768 tokens nativos, ampliable a 128.000) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal con un modulo de vision que procesa imagenes y las proyecta al espacio del decodificador de lenguaje. La familia Qwen2.5-VL incorpora mejoras en percepcion de documentos, razonamiento espacial y comprension de video respecto a Qwen2-VL. Este checkpoint concreto se ha obtenido mediante SFT con TRL 1.3.0, sobre Transformers 4.57.6 y PyTorch 2.8.0+cu128. El nombre del modelo sugiere un entrenamiento orientado a tareas de razonamiento espacial (S2, spatial_reasoning) y lectura de documentos o letras (letter), con 3 epocas y una tasa de aprendizaje de 1e-5.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores. La model card solo indica que el entrenamiento se realizo con SFT y enlaza a una traza de Weights & Biases alojada en `forge.coreweave.com`. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las ya presentes en el modelo base.

## Capacidades

- Generacion de texto y comprension de imagenes (image-text-to-text), heredadas del modelo base Qwen2.5-VL-3B-Instruct.
- Razonamiento espacial y lectura de documentos, presumiblemente reforzados por el ajuste fino segun el nombre del checkpoint.
- Conversacion multi-turno en formato chat (etiqueta `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles (`endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible, aunque el modelo base lo soporta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especial: no disponible.

## Casos de uso

- Investigacion sobre fine-tuning multimodal: el modelo sirve como referencia reproducible para estudiar como afecta un SFT con TRL sobre Qwen2.5-VL-3B en tareas de razonamiento espacial.
- Lectura de documentos con estructura espacial: extraccion de campos en formularios, facturas o cartas, aprovechando el enfasis del checkpoint en "letter" y razonamiento espacial.
- Prototipado de asistentes visuales: integracion en demos de image-text-to-text con la pipeline de Transformers para responder preguntas sobre imagenes.
- Analisis de capturas de pantalla o diagramas: interpretacion de relaciones espaciales entre elementos visuales en entornos de investigacion.
- Evaluacion comparativa de checkpoints: uso como punto de comparacion frente al Qwen2.5-VL-3B-Instruct original en experimentos academicos.
- Despliegue en entornos con TGI o endpoints compatibles para pruebas de latencia en cargas multimodales pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de ~3B parametros en fp16 requiere aproximadamente 6-7 GB de VRAM solo para pesos, mas el coste del codificador visual y la cache KV.
- GPU recomendadas: no disponibles. Por tamano del modelo base, cabria esperar GPUs consumer de gama alta (RTX 3090, RTX 4090) y GPUs de datacenter (A100, H100) para despliegues con mayor contexto.
- Compatibilidad con GPU consumer: probable segun el tamano del modelo base, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (rsoohyun213) | 755.712 segun safetensors (base ~3B) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B | 32.768 tokens nativos (hasta 128.000) | Apache 2.0 (modelo base) | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2-VL-2B-Instruct | ~2B | 32.768 tokens | Apache 2.0 | Hugging Face |
| InternVL2-2B | ~2B | 8.192 tokens | MIT (segun version) | Hugging Face |

La comparativa se limita al modelo base y alternativas de la misma categoria, ya que no hay datos de rendimiento publicados para este checkpoint.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de validacion, ni descargas que permitan inferir calidad.
- Licencia no especificada: el campo `licence: license` de la model card no aclara condiciones de uso comercial. No se debe asumir que hereda la licencia Apache 2.0 del modelo base sin verificacion.
- Repositorio de 142,7 GB para un modelo de 3B: indica artefactos de entrenamiento o checkpoints redundantes, lo que complica su descarga y uso directo.
- El recuento de parametros en safetensors (755.712) es inconsistente con el tamano del modelo base; conviene verificar la integridad de los pesos antes de usarlo.
- Riesgo de alucinacion y sesgos: no documentados, pero inherentes a cualquier modelo de lenguaje de 3B.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del ingles o chino.
- Sin garantias de produccion: es un experimento personal sin mantenimiento, sin issues ni comunidad.
- El ajuste fino puede haber degradado capacidades generales del modelo base (olvido catastrofico) al especializarse en una tarea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2only_S2v20_mix_s1_ep3-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Traza de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/xdm7ph5x
