# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S3v20_mix_s1-lr1e-5-letter-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_S3v20_mix_s1-lr1e-5-letter-full_SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. Se trata de un experimento de fine-tuning con TRL sobre el modelo base de Alibaba Qwen, orientado a tareas de razonamiento espacial y generacion imagen-texto, segun se deduce del nombre del proyecto de Weights & Biases (`spatial_reasoning@SFT-full`) y de las etiquetas del repositorio.

El modelo hereda la arquitectura del Qwen2.5-VL-3B-Instruct: un transformer multimodal con aproximadamente 3.75 mil millones de parametros que procesa imagenes y texto para generar respuestas conversacionales. El ajuste se ha realizado con la libreria TRL 1.3.0 sobre Transformers 4.57.6 y PyTorch 2.8.0, empleando un dataset mixto no documentado (indicado por el sufijo `mix` en el nombre) y una tasa de aprendizaje de 1e-5.

La relevancia de esta ficha es limitada: se trata de un checkpoint de investigacion con cero descargas, sin model card sustantiva, sin licencia declarada de forma explicita y sin resultados de evaluacion publicados. Resulta util unicamente como referencia para quien quiera reproducir o inspeccionar el proceso de SFT, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-VL); vision encoder + LLM decoder |
| Parametros totales | 755.712 (segun safetensors del repo; el modelo base Qwen2.5-VL-3B-Instruct tiene ~3.75B, el dato del repo parece incompleto o corrupto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-3B-Instruct soporta hasta 128K tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repo | 142.7 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Framework de entrenamiento | TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-VL-3B-Instruct, que combina un codificador visual con un decoder de lenguaje basado en transformer. No se introducen cambios arquitectonicos respecto al modelo base: el ajuste es puramente de pesos mediante SFT. El nombre del checkpoint (`v7_S3v20_mix_s1-lr1e-5-letter-full_SFT`) sugiere una septima iteracion de experimentos, con un dataset mixto (`mix`), una tasa de aprendizaje de 1e-5 y entrenamiento sobre el conjunto completo (`full`), probablemente con la variante `letter` como subconjunto especifico de datos.

El entrenamiento se realizo con TRL (Supervised Fine-Tuning) y queda registrado en un run de Weights & Biases alojado en `forge.coreweave.com`, bajo el proyecto `spatial_reasoning@SFT-full`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que ya incorpora el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Comprension de imagenes y respuesta imagen-texto (pipeline `image-text-to-text`).
- Razonamiento espacial: el nombre del proyecto de entrenamiento (`spatial_reasoning`) indica que el ajuste se oriento a este tipo de tareas, aunque no se documenta el dataset ni la evaluacion.
- Formato conversacional (`conversational` en los tags), compatible con plantillas de chat de Qwen.
- Compatible con text-generation-inference y endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL si soporta parte de estas capacidades, pero no se confirma en este checkpoint).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en razonamiento espacial multimodal: el checkpoint sirve como punto de partida para reproducir o comparar experimentos de SFT sobre Qwen2.5-VL-3B-Instruct en tareas que impliquen relaciones espaciales entre objetos en imagenes.
- Fine-tuning iterativo: dado el nombre versionado (`v7`), es util como referencia para estudiar como evoluciona el rendimiento con distintas tasas de aprendizaje y mezclas de datos en SFT multimodal.
- Base para experimentos de alineacion: al ser un SFT puro, puede emplearse como punto de partida para etapas posteriores de DPO o RLHF en pipelines de investigacion.
- Evaluacion comparativa de checkpoints: util para medir el impacto de hiperparametros (lr=1e-5, dataset mixto) frente al modelo base en benchmarks internos de vision-lenguaje.
- Prototipado de asistentes visuales: aunque no recomendado para produccion por falta de documentacion y licencia, puede usarse en entornos controlados para validar pipelines de inferencia con Transformers y TGI.
- Docencia y formacion: ejemplo practico de como se estructura un SFT con TRL sobre un modelo multimodal, incluyendo el registro en Weights & Biases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. El modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente 7-8 GB en FP16 y en torno a 3-4 GB en cuantizacion de 4 bits, pero el tamano del repo (142.7 GB) y el dato de parametros (755.712) son inconsistentes y no permiten confirmar los requisitos reales de este checkpoint.
- GPU recomendadas: no disponible. Para el modelo base serian suficientes una RTX 4090 (24 GB) o una A100 (40/80 GB) para inferencia en FP16; no se confirma para este checkpoint.
- Compatibilidad con GPU de consumo: probablemente si, si el checkpoint es efectivamente el Qwen2.5-VL-3B-Instruct fine-tuneado (cabria en RTX 3060 12 GB en 4 bits), pero no se puede verificar con los datos disponibles.
- Opciones de despliegue: Transformers (confirmado), text-generation-inference y endpoints compatibles (segun tags). vLLM, llama.cpp, Ollama y TGI no se confirman explicitamente, aunque TGI figura en los tags.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct-v7_S3v20_mix_s1-lr1e-5-letter-full_SFT | ~3.75B (base) / dato del repo inconsistente | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | ~3.75B | 128K tokens (segun model card oficial) | Apache 2.0 (segun model card oficial) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-VL-7B-Instruct | ~8B | 128K tokens (segun model card oficial) | Apache 2.0 (segun model card oficial) | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento comparativo para el checkpoint ajustado, por lo que la comparativa se limita a parametros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- Licencia no declarada de forma explicita: la model card incluye `licence: license` sin contenido, lo que impide determinar si se permite uso comercial.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el numero de tokens y la procedencia de los datos, lo que impide evaluar sesgos y riesgos de contaminacion.
- Sin benchmarks publicados: no hay evidencia de mejora o degradacion respecto al modelo base.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad.
- Inconsistencia en metadatos: el dato de parametros (755.712) no cuadra con un modelo de 3B; el tamano del repo (142.7 GB) es desproporcionado, lo que sugiere checkpoints intermedios o artefactos de entrenamiento incluidos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha evaluado en este checkpoint.
- Limitaciones de contexto e idioma: no documentadas; el modelo base soporta multiples idiomas, pero no se confirma en el ajuste.
- No apto para produccion sin evaluacion previa: al ser un checkpoint de investigacion sin documentacion, no deberia desplegarse en entornos reales sin validacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S3v20_mix_s1-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Run de Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/gwvcxfse
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., 2020, https://github.com/huggingface/trl
