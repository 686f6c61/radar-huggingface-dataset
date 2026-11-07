# Minguinho-zeze/Qwen3-8B-NVFP4A16-AWQ-WikiText2

## Resumen

Qwen3-8B-NVFP4A16-AWQ-WikiText2 es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba Cloud, publicado por el usuario Minguinho-zeze como parte del proyecto experimental lowbit-reasoning-ptq. No se trata de un modelo nuevo ni de un entrenamiento adicional: es una compresión post-entrenamiento (PTQ) del Qwen3-8B original, orientada a reducir la huella de memoria en inferencia manteniendo el razonamiento en modo thinking. El checkpoint aplica cuantización de pesos a 4 bits en formato NVFP4 con activaciones en 16 bits (W4A16), usando el algoritmo AWQ y el formato compressed-tensors.

El modelo conserva los 8.190.735.360 parámetros del Qwen3-8B base, de los cuales aproximadamente el 84,8% quedan cuantizados; las capas de embedding, normalización y `lm_head` se mantienen sin cuantizar. El repositorio ocupa 6,4 GB en safetensors y está pensado para servirse con vLLM sobre GPUs Blackwell, que son las únicas validadas por el autor.

Su relevancia es doble: por un lado, demuestra la viabilidad de NVFP4 con AWQ en modelos de razonamiento de 8B con pérdidas de precisión moderadas (3 puntos en AIME-120 y 2 en GPQA Diamond frente al BF16); por otro, documenta un protocolo de evaluación reproducible con semillas fijas, presupuesto de salida de 32.768 tokens y métricas de truncamiento. Es un artefacto de investigación, no un release de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizacion PTQ W4A16 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion de ejemplo usa `max_model_len=34816`) |
| Tipos de cuantizacion | NVFP4 pesos (group size 16) con activaciones 16 bits; algoritmo AWQ; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint parte del Qwen3-8B, un transformer decoder-only denso de 8B parámetros. Sobre él se aplica cuantización post-entrenamiento sin entrenamiento adicional: pesos en NVFP4 (4 bits, formato de coma flotante de NVIDIA) con tamaño de grupo 16, activaciones sin cuantizar en 16 bits y algoritmo AWQ para la selección de escalas. El 84,800291% de los parámetros quedan cuantizados; embedding, capas de normalización y `lm_head` se excluyen de la cuantización. La caché KV se mantuvo en BF16 durante la evaluación.

La calibración se realizó con texto de entrenamiento raw de WikiText-2: 128 ventanas de 2.048 tokens con semilla 0. El experimento se ejecutó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). El autor advierte que otras GPUs, kernels y combinaciones de paquetes no han sido validadas. El código y los metadatos están en el repositorio lowbit-reasoning-ptq (commit 10509d06fd76ae1bcdd0395965d82aebd95eb2f1).

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso en modo thinking (habilitado vía `chat_template_kwargs={"enable_thinking": True}`).
- Razonamiento matemático y científico evaluado en AIME-120 y GPQA Diamond.
- Generación de código y resolución de problemas algorítmicos (capacidad heredada del Qwen3-8B base, no re-evaluada en este checkpoint).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint; depende del modelo base.
- Capacidades multilingües: no disponible en la información proporcionada para este checkpoint.
- Modo thinking con presupuesto de salida configurable; el protocolo de evaluación usa 32.768 tokens de salida máxima.

## Casos de uso

- Evaluación de cuantización NVFP4 en modelos de razonamiento: sirve como referencia reproducible para medir la degradación de precisión de W4A16 AWQ frente a BF16 en tareas de matemáticas y ciencia, con semillas y protocolo documentados.
- Despliegue de razonamiento en GPUs Blackwell con memoria limitada: el checkpoint de 6,4 GB permite servir un modelo de 8B con modo thinking en una sola RTX 5090, algo que el BF16 (unos 16 GB de pesos) dificulta en ese mismo segmento.
- Investigación en compresión de modelos: el `recipe.yaml`, `quant_meta.json` y `config.json` permiten reproducir la receta AWQ con group size 16 y comparar con otros algoritmos (GPTQ, INT2 con humming-kernels).
- Generación de soluciones matemáticas paso a paso: el modo thinking con 32.768 tokens de salida admite cadenas de razonamiento largas para problemas de competición, con una pérdida medida de unos 3 puntos en AIME-120.
- Prototipado de asistentes conversacionales con vLLM: la integración nativa con el motor de vLLM y el formato compressed-tensors simplifica el arranque en entornos de investigación ya basados en esa pila.
- Análisis de coste/calidad en pipelines de inferencia: permite cuantificar el ahorro de memoria (frente a BF16) frente a la caída de exactitud en GPQA Diamond (59,09 frente a 61,11), útil para decidir el nivel de cuantización en producción.

## Benchmarks y rendimiento

Datos publicados por el autor, precisión en porcentaje promediada sobre semillas 0, 1 y 2; 120 preguntas AIME y 198 GPQA Diamond por semilla; modo thinking activado, temperature 0,6, top-p 0,95, top-k desactivado, presupuesto de salida 32.768 tokens; respuestas truncadas puntuadas como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4A16 AWQ) | 68,33 | 59,09 |

El autor advierte que estas cifras describen su protocolo y no son puntuaciones oficiales de Qwen, y que las pequeñas diferencias no deben atribuirse únicamente a los algoritmos de cuantización.

## Requisitos de hardware

- VRAM estimada para pesos: unos 6,4 GB (tamaño del repo en safetensors); la caché KV en BF16 añade memoria adicional según la longitud de contexto.
- GPUs validadas por el autor: RTX 5090 y RTX PRO 4500 Blackwell. Otras GPUs, kernels y combinaciones de paquetes no han sido validadas.
- Cabe en GPU consumer Blackwell (RTX 5090). En arquitecturas anteriores (Ada, Ampere) el soporte de NVFP4 no está garantizado por este release.
- Despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. No es un release GGUF ni AutoAWQ, por lo que no es directamente compatible con llama.cpp u Ollama.
- Configuración de referencia: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`.
- Latencia y throughput: no disponible en la información proporcionada (el autor remite a los informes del repositorio para métricas de velocidad).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME-120 | GPQA Diamond | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Este checkpoint | 8,19B (W4A16) | no disponible | 68,33 | 59,09 | Apache-2.0 | safetensors compressed-tensors |
| Qwen3-8B BF16 | 8,19B | no disponible | 71,39 | 61,11 | Apache-2.0 | safetensors |
| Qwen3.8-Max | 2,4T | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen3.8-Max no es de categoría equivalente (2,4 billones de parámetros frente a 8B) y solo se incluye como referencia del ecosistema Qwen. No se dispone de datos de otros checkpoints cuantizados comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión medible frente al BF16: 3,06 puntos en AIME-120 y 2,02 en GPQA Diamond con el protocolo del autor.
- Solo validado en GPUs Blackwell con versiones específicas de vLLM, PyTorch, Transformers y compressed-tensors; el ejemplo de carga no se ha reejecutado desde el repositorio subido.
- No es un release GGUF ni AutoAWQ: no puede cargarse directamente en llama.cpp, Ollama u otros motores que no soporten compressed-tensors.
- El ejemplo de carga usa `max_model_len=34816`, pero la longitud de contexto nativa del modelo base no se detalla en la información proporcionada.
- Idiomas soportados no documentados para este checkpoint; las capacidades multilingües dependen del Qwen3-8B base.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en este release; se heredan los del modelo base, no caracterizados aquí.
- Uso comercial permitido por la licencia Apache-2.0 del upstream, incluida en el repositorio, pero el autor no ofrece garantías de soporte ni mantenimiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.
- Las puntuaciones de benchmarks corresponden a un protocolo propio (semillas repetidas sobre las mismas preguntas, no preguntas nuevas independientes) y no son comparables con cifras oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4A16-AWQ-WikiText2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Qwen3 8B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8b/
- OpenLM.ai (Qwen3.8): https://openlm.ai/qwen3.8/
