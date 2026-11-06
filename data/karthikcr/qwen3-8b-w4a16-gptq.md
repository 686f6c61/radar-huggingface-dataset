# karthikcr/Qwen3-8B-W4A16-GPTQ

## Resumen

Qwen3-8B-W4A16-GPTQ es una cuantizacion de pesos a 4 bits (W4A16, es decir, pesos de 4 bits con activaciones de 16 bits) del modelo Qwen/Qwen3-8B, publicada por el usuario karthikcr. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor aplico una receta GPTQ mediante llm-compressor sobre el checkpoint oficial de Qwen3-8B, con el objetivo de reducir el peso en memoria y facilitar el despliegue en vLLM para un proyecto personal de benchmarking.

El modelo base Qwen3-8B pertenece a la familia Qwen3 de Alibaba, con 8.190.735.360 parametros totales y licencia Apache 2.0. La cuantizacion conserva la arquitectura transformer original y el tokenizador, y se distribuye en formato compressed-tensors, cargable directamente por vLLM sin pasos de conversion adicionales. El repositorio ocupa 6,1 GB, frente a los aproximadamente 16 GB que ocuparia el checkpoint en BF16.

La relevancia de esta ficha es practica: permite evaluar si una cuantizacion W4A16 generada con llm-compressor es una alternativa viable al modelo BF16 en terminos de calidad, latencia y coste de hardware. No obstante, conviene subrayar que el autor no publica en la model card resultados de calidad ni de rendimiento, y que la calibracion se hizo con solo 512 muestras y longitud maxima de 2048 tokens, lo que condiciona la fiabilidad de la cuantizacion en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-8B); cuantizacion GPTQ W4A16 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits); GPTQ; se ignora `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint Qwen/Qwen3-8B (commit `b968826d9c46dd6066d109eabc6255188de91218`). No hay entrenamiento adicional ni ajuste fino: la receta aplicada es `{"gptq": {"targets": "Linear", "scheme": "W4A16", "ignore": ["lm_head"]}}`, es decir, GPTQ sobre todas las capas lineales excepto la cabeza de lenguaje, manteniendo los pesos de `lm_head` en su precision original. La herramienta empleada es llm-compressor 0.14.0.1 con compressed-tensors 0.19.0, torch 2.13.0 y transformers 5.17.0.

La calibracion se realizo con el split `train[:512]` del dataset mlabonne/open-perfectblend, 512 muestras, longitud maxima de secuencia de 2048 tokens y semilla 42. El proceso completo se ejecuto en una NVIDIA A100-SXM4-40GB en Modal, con un tiempo total de 645,9 segundos (4,5 s de carga, 566,6 s de calibracion y 74,8 s de guardado) y un coste de computo declarado de 0,536 USD. El script de cuantizacion esta disponible como `quant/gptq.py` en el repositorio de GitHub del autor.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-8B.
- Modo de razonamiento (thinking) activado por defecto en Qwen3; puede desactivarse pasando `chat_template_kwargs={"enable_thinking": false}` para obtener respuestas directas.
- Generacion de codigo y matematicas: capacidad atribuible al modelo base, no verificada de forma independiente en esta cuantizacion.
- Soporte de tool calling y function calling: no documentado especificamente para esta cuantizacion; debe validarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Despliegue economico en vLLM: el formato compressed-tensors permite lanzar el modelo con `vllm serve karthikcr/Qwen3-8B-W4A16-GPTQ` sin conversion previa, reduciendo el peso en memoria de aproximadamente 16 GB en BF16 a unos 6 GB, lo que libera VRAM para cache KV y permite mayor concurrencia.
- Benchmarking de cuantizacion: util para comparar calidad y throughput frente al checkpoint BF16 en tareas de generacion, replicando la metodologia del repositorio del autor.
- Prototipado de asistentes conversacionales: con el modo thinking desactivado se obtienen respuestas directas adecuadas para chat de baja latencia en entornos de desarrollo.
- Razonamiento asistido por pasos: activando el modo thinking por defecto, el modelo puede emplearse en tareas que requieren cadena de razonamiento, siempre que se valide que la cuantizacion no degrada en exceso esa capacidad.
- Inferencia en GPUs de gama alta para un solo nodo: una A100 40GB o H100 permite servir el modelo con contexto amplio y batching continuo en vLLM.
- Experimentacion academica con recursos limitados: el reducido tamano del repositorio (6,1 GB) facilita su descarga, almacenamiento y despliegue en entornos de laboratorio o instancias cloud de coste moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la carpeta `results/` del repositorio de GitHub del autor para datos de throughput, latencia y calidad frente al modelo BF16, pero esos datos no se incluyen en la informacion proporcionada y no deben inferirse.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB solo para pesos en W4A16; el consumo real depende del contexto, del tamano de la cache KV y del numero de secuencias concurrentes.
- GPU recomendadas: NVIDIA A100-SXM4-40GB (la usada para la cuantizacion) y H100 para produccion con contexto largo y alta concurrencia.
- GPU de consumo: el modelo puede caber en GPUs con 12-16 GB o mas, como RTX 4090 o RTX 4080, siempre que se limite el contexto y el batching; no hay validacion publicada de este escenario.
- Opciones de despliegue: vLLM es la via soportada de forma explicita (`vllm serve`). Otros motores compatibles con compressed-tensors o GPTQ no estan documentados en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karthikcr/Qwen3-8B-W4A16-GPTQ | 8,19 B | no disponible | W4A16 GPTQ | Apache 2.0 | Hugging Face, 34 descargas |
| Qwen/Qwen3-8B (BF16) | 8,19 B | no disponible | ninguna (BF16) | Apache 2.0 | Hugging Face, modelo oficial |
| Otras cuantizaciones de Qwen3-8B (GGUF, AWQ) | 8,19 B | no disponible | GGUF / AWQ | Apache 2.0 | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base y a la existencia generica de otras cuantizaciones, ya que la informacion proporcionada no incluye datos de rendimiento ni identificadores concretos de alternativas comparables.

## Limitaciones y advertencias

- La cuantizacion se calibro con solo 512 muestras y longitud maxima de 2048 tokens; el comportamiento en contextos mas largos no esta validado y puede degradarse.
- No se publican metricas de calidad frente al modelo BF16 en la model card; cualquier uso en produccion deberia acompanarse de una evaluacion propia.
- El autor describe el proyecto como personal y de benchmarking, con 34 descargas y 0 likes; no hay senales de mantenimiento ni soporte.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por la cuantizacion a 4 bits.
- Sesgos: no documentados para esta cuantizacion; deben asumirse los del modelo base Qwen3-8B.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue equivalente al del checkpoint original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de calibracion (mlabonne/open-perfectblend) antes de un despliegue comercial.
- El modo thinking esta activado por defecto; en produccion conviene desactivarlo explicitamente si no se necesita, para evitar latencia y consumo de tokens innecesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karthikcr/Qwen3-8B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del autor (benchmarking): https://github.com/kikugo/reel-history-k8s
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Precios de Modal (referencia de coste): https://modal.com/pricing
