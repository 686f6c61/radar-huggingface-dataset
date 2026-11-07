# Minguinho-zeze/Qwen3-8B-NVFP4-GPTQ-WikiText2

## Resumen

Qwen3-8B-NVFP4-GPTQ-WikiText2 es un checkpoint de Qwen3-8B cuantizado a 4 bits en formato NVFP4 (W4A4, pesos e activaciones de entrada en FP4) mediante el algoritmo GPTQ, publicado por el usuario Minguinho-zeze como parte del proyecto lowbit-reasoning-ptq. No se realizo entrenamiento adicional: es una compresion post-entrenamiento (PTQ) del modelo base Qwen/Qwen3-8B de Alibaba, con un 84,8 % de los parametros cuantizados y las capas de embedding, normalizacion y `lm_head` intactas en mayor precision.

El interes del checkpoint es practico: reduce el modelo a unos 6,4 GB de pesos y lo empaqueta en el formato compressed-tensors que consume vLLM, lo que permite desplegar un modelo de 8.190 millones de parametros en una unica GPU Blackwell (RTX 5090, RTX PRO 4500) con precision FP4 nativa. El objetivo declarado del autor es estudiar el impacto de la cuantizacion de bajo bit en tareas de razonamiento, de ahi la evaluacion en AIME-120 y GPQA Diamond con modo thinking activado.

La relevancia es doble: por un lado demuestra que un modelo de razonamiento de 8B conserva buena parte de su capacidad (63,61 frente a 71,39 en AIME-120, 56,90 frente a 61,11 en GPQA Diamond) tras cuantizar a 4 bits; por otro, la calibracion con WikiText-2 y el uso de vLLM 0.32.0 lo convierten en un caso reproducible para quien quiera medir el coste real de NVFP4 en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (base Qwen3-8B), cuantizado NVFP4 W4A4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de carga fija `max_model_len=34816` |
| Tipos de cuantizacion | NVFP4 (pesos FP4 + activaciones de entrada FP4), group size 16, GPTQ; 84,800291 % de parametros cuantizados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3-8B original: un transformer autoregresivo denso de 8.190 millones de parametros. Sobre esa base no hay entrenamiento nuevo; la unica transformacion es una cuantizacion post-entrenamiento GPTQ a NVFP4 con grupo de 16, aplicada a pesos y a activaciones de entrada (esquema W4A4). Las capas de embedding, normalizacion y `lm_head` quedan sin cuantizar, y la KV cache se mantiene en BF16 durante la evaluacion.

La calibracion se hizo con texto de entrenamiento crudo de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. El resultado son pesos en formato compressed-tensors compatibles con vLLM, con los metadatos de receta y versiones del cuantizador en `recipe.yaml`, `quant_meta.json` y `config.json`. El autor advierte que el entorno validado es muy concreto (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 sobre GPU Blackwell) y que otras combinaciones de GPU, kernels y paquetes no han sido validadas.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con plantilla de chat compatible con el tokenizer HF.
- Razonamiento explicito en modo thinking (`enable_thinking=True` en el ejemplo de vLLM), con presupuesto de salida de hasta 32.768 tokens.
- Razonamiento matematico y cientifico de nivel competitivo, segun la evaluacion en AIME-120 y GPQA Diamond.
- Generacion de codigo y capacidad de instrucciones heredadas del modelo base Qwen3-8B.
- Soporte multilingue heredado del modelo base (no se detalla el conjunto de idiomas en esta ficha).
- Compatibilidad con el ecosistema vLLM (chat, sampling params, prefix caching configurable).
- No se documentan capacidades de vision, audio ni tool calling especificas de este checkpoint.

## Casos de uso

- Razonamiento matematico asistido en entornos con GPU unica: el modelo resuelve problemas tipo AIME con un 63,61 % de acierto en el protocolo del autor, suficiente para asistentes de estudio o validacion de soluciones paso a paso.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para medir la degradacion de NVFP4 frente a BF16 en tareas de razonamiento, gracias a la publicacion de semillas, truncamientos y metricas de velocidad en el repositorio del proyecto.
- Despliegue en estaciones de trabajo Blackwell: con 6,4 GB de pesos cabe en una RTX 5090 o RTX PRO 4500, lo que permite montar un servicio de inferencia local sin clúster.
- Generacion de codigo en pipelines internos: al heredar las capacidades de Qwen3-8B, puede integrarse en flujos de autocompletado o revision de parches donde el coste por token importa.
- Prototipado de agentes con contexto largo: el ejemplo de carga admite `max_model_len=34816`, util para conversaciones multi-turno o documentos extensos en fase de prueba.
- Investigacion academica sobre PTQ de bajo bit: la receta GPTQ con calibracion WikiText-2 y el formato compressed-tensors facilitan replicar el experimento y comparar con otras variantes (por ejemplo, la version NVFP4 de NVIDIA).

## Benchmarks y rendimiento

Resultados publicados por el autor, en porcentaje de acierto, promediados sobre las semillas 0, 1 y 2 (120 preguntas AIME y 198 de GPQA Diamond por semilla; las semillas repetidas son generaciones repetidas de las mismas preguntas). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4 GPTQ) | 63,61 | 56,90 |

El autor advierte que estas cifras describen su protocolo y no son puntuaciones oficiales de Qwen. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan unos 6,4 GB; con KV cache en BF16 y contexto de 34.816 tokens, el consumo total dependera de la configuracion de `gpu_memory_utilization` (el ejemplo usa 0,90).
- GPU recomendadas: RTX 5090 y RTX PRO 4500 Blackwell, las unicas validadas por el autor para la evaluacion.
- Cabe en GPU de consumo: si, en Blackwell con soporte FP4 nativo; en arquitecturas anteriores el soporte NVFP4 no esta validado.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 es la ruta documentada; no se ha validado llama.cpp, Ollama ni TGI, y el repositorio no es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a su repositorio para metricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 8,19 B | no disponible (ejemplo con 34.816) | NVFP4 GPTQ W4A4, group size 16 | apache-2.0 | Hugging Face (0 descargas) |
| nvidia/Qwen3-8B-NVFP4 | 8,19 B (base Qwen3-8B) | no disponible | FP4 con TensorRT Model Optimizer | uso comercial y no comercial | Hugging Face (NVIDIA) |
| Qwen/Qwen3-8B (BF16) | 8,19 B | no disponible | BF16 | apache-2.0 | Hugging Face (oficial) |

La diferencia clave frente a la version de NVIDIA es el algoritmo de cuantizacion (GPTQ con calibracion WikiText-2 frente a TensorRT Model Optimizer) y el enfoque: el checkpoint de Minguinho-zeze esta orientado a experimentacion reproducible, mientras que el de NVIDIA se presenta como listo para uso comercial. No se dispone de benchmarks del checkpoint de NVIDIA en la informacion proporcionada para comparar rendimiento.

## Limitaciones y advertencias

- Perdida de precision medible: entre 7,8 y 4,2 puntos porcentuales menos que BF16 en AIME-120 y GPQA Diamond respectivamente, con el protocolo del autor.
- Entorno muy restrictivo: solo validado con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre Blackwell; otras combinaciones no estan verificadas.
- El ejemplo de carga no se ha vuelto a ejecutar desde el repositorio subido, segun la propia model card.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede agravarlo en tareas de razonamiento largo.
- Idiomas soportados no documentados en esta ficha; conviene consultar la model card de Qwen3-8B.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y remite a la licencia upstream incluida en `LICENSE`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente.
- No es un release GGUF ni AutoAWQ: no puede cargarse directamente en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-GPTQ-WikiText2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluacion: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuracion del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Version NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
