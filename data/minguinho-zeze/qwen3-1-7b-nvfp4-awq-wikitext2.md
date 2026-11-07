# Minguinho-zeze/Qwen3-1.7B-NVFP4-AWQ-WikiText2

## Resumen

Qwen3-1.7B-NVFP4-AWQ-WikiText2 es un checkpoint cuantizado de Qwen3-1.7B, el modelo denso de 1.720.574.976 parámetros publicado por Alibaba Qwen. Lo desarrolla el usuario independiente Minguinho-zeze en el contexto del proyecto lowbit-reasoning-ptq, cuyo objetivo es medir el impacto de la cuantización de muy baja precisión (4 bits) sobre las capacidades de razonamiento de modelos pequeños. No se realizó entrenamiento adicional: es una cuantización post-entrenamiento.

La técnica aplicada es NVFP4 para pesos y activaciones de entrada (W4A4) con grupo de tamaño 16, usando el algoritmo AWQ y calibración sobre WikiText-2 raw. Las capas de embedding, normalización y `lm_head` permanecen sin cuantizar, y el 81,9079 % de los parámetros queda cuantizado. El resultado es un repositorio de 1,4 GB que se sirve con vLLM y compressed-tensors.

Su relevancia es doble: por un lado permite ejecutar un modelo de razonamiento de ~1,7B en GPUs Blackwell con huella de memoria muy reducida; por otro, la model card documenta explícitamente la pérdida de precisión observada (de 40,00 a 28,89 en AIME-120 y de 40,40 a 33,50 en GPQA Diamond), lo que lo convierte en una referencia útil para estudiar el coste del W4A4 en tareas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado con compressed-tensors |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 34.816 tokens configurados en el ejemplo de servicio (`max_model_len`); contexto nativo del modelo base no detallado en la informacion disponible |
| Tipos de cuantizacion | NVFP4 pesos + FP4 activaciones (W4A4), group size 16, algoritmo AWQ; embedding, norm y `lm_head` sin cuantizar; KV cache BF16 en evaluacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); no es GGUF ni AutoAWQ |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3-1.7B original: un transformer denso con 1.720.574.976 parámetros. Sobre esa base no se aplicó entrenamiento adicional; la única transformación es una cuantización post-entrenamiento W4A4 con group size 16 y algoritmo AWQ. La calibración usó texto de entrenamiento raw de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. El 81,9079 % de los parámetros quedó cuantizado, mientras que embedding, capas de normalización y `lm_head` se mantuvieron en precisión original. Los pesos se serializan con compressed-tensors y los ajustes exactos quedan registrados en `config.json`, `recipe.yaml` y `quant_meta.json`.

El entorno de servicio registrado es vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17, sobre GPUs Blackwell. El autor advierte que otras GPUs y combinaciones de paquetes no han sido validadas por esta release. La evaluación se realizó con modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y un presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat de Qwen3.
- Razonamiento en modo thinking (`enable_thinking=True`), con cadenas de razonamiento extensas (hasta 32.768 tokens de salida en la configuracion evaluada).
- Resolucion de problemas matematicos y de conocimiento cientifico, evaluados sobre AIME-120 y GPQA Diamond.
- Generacion de codigo: capacidad heredada del modelo base Qwen3-1.7B (no verificada de forma independiente en este checkpoint).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponibles (los idiomas no estan listados en la model card).
- Sin vision, audio ni otras modalidades: es un modelo exclusivamente de texto.

## Casos de uso

- Estudio del impacto de la cuantizacion W4A4 en razonamiento: el checkpoint sirve como punto de comparacion directo frente al Qwen3-1.7B en BF16, con mediciones pareadas sobre AIME-120 y GPQA Diamond y semillas 0, 1 y 2.
- Despliegue de bajo consumo en GPUs Blackwell: al reducir pesos y activaciones a 4 bits, permite servir un modelo de razonamiento de 1,7B con huella de memoria notablemente menor que BF16, usando vLLM y compressed-tensors.
- Experimentacion con pipelines de cuantizacion: el repositorio conserva `recipe.yaml` y `quant_meta.json`, lo que facilita reproducir la receta AWQ con calibracion WikiText-2 y compararla con variantes como la RTN del mismo autor.
- Generacion de respuestas con razonamiento largo en entornos con presupuesto de tokens acotado: el modo thinking con hasta 32.768 tokens de salida encaja en tareas de resolucion de problemas paso a paso.
- Evaluacion de robustez de modelos cuantizados: la diferencia documentada de exactitud permite analizar como degrada el W4A4 en tareas de matematicas competitivas frente a conocimiento cientifico.
- Prototipado de asistentes conversacionales de texto en investigación: con licencia Apache-2.0 y pesos safetensors, se puede integrar en entornos de experimentacion sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

Datos publicados en la model card. Exactitud media en porcentaje sobre las semillas 0, 1 y 2; cada semilla evalua las mismas 120 preguntas de AIME y 198 de GPQA Diamond, por lo que las semillas son generaciones repetidas, no conjuntos independientes.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (NVFP4-AWQ) | 28,89 | 33,50 |

El autor indica que estas cifras describen el protocolo del experimento y no son resultados oficiales de Qwen. Los resultados por semilla, longitudes de tokens, truncamientos y velocidad estan en `eval_results.json` y en el repositorio de informes del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,4 GB en safetensors; con overhead de runtime, activaciones y cache KV en BF16, el consumo real supera ampliamente esa cifra. No se publica una estimacion de VRAM en la informacion disponible.
- GPU recomendadas: el entorno registrado usa GPUs Blackwell, que son las unicas validadas por esta release. Otras GPUs no han sido validadas.
- Compatibilidad con GPU de consumo: no confirmada. Los kernels NVFP4 y humming-kernels estan orientados a Blackwell, por lo que no se puede afirmar que funcione en RTX 4090 u otras arquitecturas consumer.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 y humming-kernels 0.1.17. No es un release GGUF ni AutoAWQ, por lo que llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Configuracion de servicio de referencia: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`.
- Latencia y throughput: no disponibles. La model card remite a los informes del proyecto para datos de velocidad, pero no se incluyen cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3-1.7B (BF16) | 1.720.574.976 | no disponible | BF16 | 40,00 | 40,40 | apache-2.0 |
| Este checkpoint (NVFP4-AWQ) | 1.720.574.976 | 34.816 configurados | W4A4, AWQ, group 16 | 28,89 | 33,50 | apache-2.0 |
| Qwen3-1.7B-NVFP4-RTN-WikiText2 | 1.720.574.976 | no disponible | W4A4, RTN, group 16 | no disponible | no disponible | apache-2.0 |

La variante RTN del mismo autor comparte esquema de cuantizacion (W4A4, group size 16, embedding/norm/`lm_head` sin cuantizar, 81,9079 % de parametros cuantizados) y difiere solo en el algoritmo de cuantizacion; sus resultados de evaluacion no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Perdida de exactitud documentada: caida de 40,00 a 28,89 en AIME-120 y de 40,40 a 33,50 en GPQA Diamond respecto al BF16, con el protocolo del experimento y no con resultados oficiales.
- Las semillas 0, 1 y 2 reevaluan las mismas preguntas; no son conjuntos independientes, por lo que la variabilidad medida no equivale a una estimacion sobre poblaciones distintas.
- Las respuestas truncadas se puntuan como incorrectas, lo que penaliza configuraciones con presupuesto de salida insuficiente.
- El autor retiene los resultados de efecto de factores y su interpretacion mientras investiga incidencias mediante repeticiones; no reclama que un algoritmo o metodo de calibracion cause las diferencias observadas.
- Solo GPUs Blackwell estan validadas; otras GPUs y combinaciones de paquetes no han sido probadas.
- No es un release GGUF ni AutoAWQ, lo que limita las rutas de despliegue a vLLM con compressed-tensors y humming-kernels.
- El ejemplo de carga no se ha reejecutado desde la revision subida a Hugging Face.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue sin verificar.
- Sesgos y riesgo de alucinacion: no documentados en la model card; se heredan los del modelo base Qwen3-1.7B, no descritos en la informacion disponible.
- Licencia Apache-2.0, sin restricciones adicionales conocidas para uso comercial; el uso queda sujeto a los terminos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-AWQ-WikiText2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Informes completos: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuracion del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante RTN: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-WikiText2
