# ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-step-100

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio (paso 100) de un entrenamiento de ajuste fino mediante SDPO (una variante de optimizacion por preferencias derivada de DPO) sobre el modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. Lo publica el usuario ahmedselhady en Hugging Face y su nombre codifica la configuracion exacta del experimento: 750 pasos por 5 epocas, learning rate 3e-6, coeficiente KL de 0,001, entrenamiento full-parameter, referencia de 10752 tokens, K=512, referencias congeladas, dataset en ingles unicamente y alpha 1.0.

El modelo hereda la arquitectura Qwen2 del modelo base de NVIDIA, un transformer decoder-only de aproximadamente 1.777 millones de parametros (1,5B nominales) orientado a razonamiento matematico. Su relevancia es fundamentalmente de investigacion: se trata de un artefacto reproducible de un pipeline de RL/preferencias sobre un modelo de razonamiento pequeno, util para estudiar la evolucion del entrenamiento y para comparar checkpoints intermedios.

No es un modelo listo para produccion: carece de model card descriptiva, licencia declarada e idiomas especificados, y su nombre indica que el ajuste se realizo solo con datos en ingles sobre el dominio de matematicas (macereason-math). Cualquier uso debe considerar estas limitaciones y verificar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), heredada del modelo base |
| Parametros totales | 1.777.088.000 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre indica referencia de 10752 tokens y K=512, pero no se confirma la ventana final) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (el nombre del run indica entrenamiento "en_only", es decir, solo ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 3,6 GB |
| Modelo base | nvidia/Nemotron-Research-Reasoning-Qwen-1.5B |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con aproximadamente 1,5B parametros y sesgo hacia tareas de razonamiento matematico. No se introduce ninguna modificacion estructural: el checkpoint contiene pesos ajustados con entrenamiento full-parameter (no LoRA), segun indica el sufijo "full" del nombre del run.

El entrenamiento corresponde a SDPO (una variante de optimizacion por preferencias tipo DPO) sobre el dataset "macereason-math", con 750 pasos por 5 epocas, learning rate 3e-6, coeficiente KL de 0,001 frente a una referencia congelada de 10752 tokens, K=512 y alpha 1.0, restringido a datos en ingles. El checkpoint publicado es el paso 100 de ese run, por lo que representa un estado intermedio y no el modelo final convergido. No se dispone de informacion sobre el volumen de tokens, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento matematico, heredado del modelo base Nemotron-Research-Reasoning-Qwen-1.5B.
- Razonamiento multi-paso en ingles, segun la configuracion del run de entrenamiento.
- Compatible con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Vision o audio: no disponible.
- Capacidades multilingues: no disponible; el entrenamiento se realizo solo en ingles.

## Casos de uso

- Investigacion sobre optimizacion por preferencias: analizar la evolucion de un modelo de razonamiento en el paso 100 de un run SDPO frente a checkpoints posteriores y al modelo base, para estudiar dinamicas de convergencia y efecto del coeficiente KL.
- Reproducibilidad de experimentos: servir como artefacto de referencia para replicar la configuracion (lr 3e-6, KL 0,001, 750x5 pasos, K=512) en modelos de 1,5B.
- Evaluacion comparativa de checkpoints intermedios: medir si un checkpoint temprano ya captura mejoras en tareas de matematicas respecto al base antes de que el entrenamiento complete.
- Prototipado de pipelines de razonamiento en ingles: usar el modelo en entornos de desarrollo para validar cadenas de generacion con transformers o TGI antes de invertir en modelos mayores.
- Estudio de olvido catastrofico: comparar el rendimiento en tareas generales del base frente a este checkpoint ajustado solo en matematicas en ingles.
- Docencia y formacion: ilustrar en cursos de ajuste fino como se nombran y versionan runs de DPO/SDPO y que informacion codifica cada hiperparametro del nombre.
- Baseline para ablaciones de datos: emplear este checkpoint como punto de partida controlado al variar la composicion del dataset macereason-math.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 y H100 son sobredimensionadas para este tamano y solo se justifican para lotes grandes o evaluacion masiva.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag tgi) y endpoints compatibles; llama.cpp, Ollama o vLLM requeririan conversion a GGUF o configuracion adicional no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,777B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint intermedio paso 100 de un run SDPO |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5B | no disponible | no disponible | Hugging Face (modelo base) | Base de razonamiento matematico de NVIDIA |
| Qwen2-1.5B (familia base) | ~1,5B | 32K en la version estandar de Qwen2 | Apache 2.0 en la version original | Amplia | Arquitectura de referencia sin ajuste de razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32K (segun configuracion de la familia) | MIT en la version publicada | Amplia | Alternativa de razonamiento destilado de tamano similar |

La comparativa con Qwen2-1.5B y DeepSeek-R1-Distill-Qwen-1.5B se basa en caracteristicas conocidas de esas familias; los datos de contexto y licencia de este checkpoint concreto no estan disponibles y deben verificarse contra el modelo base.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 100 de 750x5): no representa el estado final del entrenamiento y su calidad puede ser inferior a la del modelo convergido.
- Entrenado solo en ingles ("en_only") sobre matematicas: el rendimiento en castellano y en tareas generales puede degradarse respecto al modelo base.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible comprobar la licencia de nvidia/Nemotron-Research-Reasoning-Qwen-1.5B antes de cualquier despliegue.
- Sin model card descriptiva ni datos de evaluacion: no hay evidencia publicada de calidad, sesgos o tasas de alucinacion.
- Riesgo de alucinacion inherente a modelos de 1,5B en razonamiento multi-paso, especialmente fuera del dominio matematico.
- Cero descargas y cero likes: no existe validacion comunitaria del artefacto.
- Los hiperparametros codificados en el nombre (ref10752, k512) sugieren una ventana de referencia concreta; contextos mas largos no estan garantizados.
- Uso en produccion desaconsejado sin evaluacion propia y sin confirmar la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-step-100
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
- Paper de DPO (referencia metodologica): https://arxiv.org/abs/2305.18290
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
