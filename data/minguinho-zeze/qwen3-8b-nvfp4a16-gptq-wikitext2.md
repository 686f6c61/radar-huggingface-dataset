# Minguinho-zeze/Qwen3-8B-NVFP4A16-GPTQ-WikiText2

## Resumen

Qwen3-8B-NVFP4A16-GPTQ-WikiText2 es un checkpoint cuantizado del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario Minguinho-zeze como parte del proyecto de investigación lowbit-reasoning-ptq. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión post-entrenamiento (PTQ) que aplica cuantización NVFP4 a los pesos manteniendo las activaciones en 16 bits (esquema W4A16), con grupo de tamaño 16 y algoritmo GPTQ. El objetivo es reducir el peso del modelo a 6,4 GB en repositorio y permitir su despliegue en GPUs Blackwell con vLLM, preservando en la medida de lo posible las capacidades de razonamiento del modelo original.

El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), con licencia Apache-2.0 y capacidades de generación de texto, razonamiento en modo thinking y conversación multi-turno. Este checkpoint conserva la licencia Apache-2.0 del modelo original e incluye los metadatos de cuantización en formato compressed-tensors, lo que lo hace compatible con el stack de vLLM 0.32.0 y versiones recientes de compressed-tensors.

La relevancia de esta publicación es doble: por un lado, demuestra la viabilidad práctica de cuantizar a 4 bits (NVFP4) un modelo de razonamiento de 8B con una pérdida moderada de precisión (2,78 puntos en AIME-120 y 2,69 puntos en GPQA Diamond respecto al BF16); por otro, documenta de forma reproducible el protocolo de evaluación, los seeds y las versiones exactas de las herramientas, algo poco habitual en checkpoints cuantizados de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), cuantizado con compressed-tensors |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de carga usa max_model_len=34816) |
| Tipos de cuantizacion | NVFP4 en pesos (W4), activaciones en 16 bits (A16), grupo de tamano 16, GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (no GGUF, no AutoAWQ) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del Qwen3-8B original: un transformer denso de aproximadamente 8,19 mil millones de parámetros. Sobre esa base, la publicación aplica únicamente cuantización post-entrenamiento, sin entrenamiento adicional ("No additional training was performed"). La cuantización afecta al 84,800291% de los parámetros; las capas de embedding, normalización y `lm_head` quedan sin cuantizar. El esquema es W4A16 con NVFP4 para los pesos y 16 bits para las activaciones, con grupo de tamaño 16, y el algoritmo empleado es GPTQ.

La calibración se realizó con texto de entrenamiento raw de WikiText-2, usando 128 ventanas de 2.048 tokens con seed 0. Los metadatos exactos de la receta están en `recipe.yaml`, `quant_meta.json` y `config.json` del repositorio. Durante la evaluación, la caché KV se mantuvo en BF16. El entorno de referencia empleado fue vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 sobre GPUs Blackwell (RTX 5090 y RTX PRO 4500). No se documentan innovaciones arquitectónicas propias más allá de la propia cuantización NVFP4 con GPTQ.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Razonamiento en modo thinking: la evaluación se realizó con `enable_thinking=True`, y el ejemplo de carga usa `chat_template_kwargs={"enable_thinking": True}`.
- Razonamiento matemático y científico: evaluado en AIME-120 y GPQA Diamond.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint (el modelo base Qwen3-8B lo soporta según su propia model card, no verificable aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación de razonamiento matemático en producción de investigación: el checkpoint está pensado para reproducir experimentos de PTQ de baja precisión sobre Qwen3-8B, con seeds y protocolo documentados, lo que permite comparar NVFP4 frente a BF16 en AIME-120 y GPQA Diamond con criterios idénticos.
- Despliegue en GPUs Blackwell con vLLM: al usar NVFP4 y compressed-tensors, se integra en el stack de vLLM 0.32.0 con `config_format="hf"` y `generation_config="vllm"`, lo que facilita servir el modelo en infraestructura con RTX 5090 o RTX PRO 4500.
- Reducción de huella de memoria en inferencia: con 6,4 GB de repositorio y pesos de 4 bits, permite cargar un modelo de razonamiento de 8B en GPUs con VRAM limitada frente al BF16 original, manteniendo activaciones en 16 bits para estabilidad numérica.
- Generación de cadenas de razonamiento largas: el ejemplo de carga configura `max_tokens=32768` y `max_model_len=34816`, adecuado para tareas que requieren trazas de pensamiento extensas, como problemas de competición o análisis paso a paso.
- Investigación en cuantización de modelos de razonamiento: el repositorio lowbit-reasoning-ptq y los informes por seed permiten estudiar la degradación de precisión (2,78 puntos en AIME-120, 2,69 en GPQA Diamond) y la tasa de truncamiento en función del presupuesto de salida.
- Prototipado de asistentes conversacionales con `llm.chat`: la API de vLLM con plantilla de chat y `skip_special_tokens=False` permite integrar el modelo en pipelines conversacionales que necesitan preservar tokens especiales del template de Qwen3.

## Benchmarks y rendimiento

Precisión en porcentaje, promediada sobre seeds 0, 1 y 2; cada seed evalúa 120 preguntas de AIME y 198 de GPQA Diamond. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4A16-GPTQ) | 68,61 | 58,42 |

Estas puntuaciones describen el protocolo del autor y no son resultados oficiales de Qwen. Las ejecuciones de precisión se realizaron en RTX 5090 y RTX PRO 4500 Blackwell; el autor advierte que las pequeñas diferencias no deben atribuirse únicamente a los algoritmos de cuantización. No se proporcionan datos de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,4 GB en pesos NVFP4; con caché KV en BF16 y contexto largo (hasta 34.816 tokens en el ejemplo), la VRAM total depende del batch y de la longitud de contexto. No se proporciona una cifra exacta.
- GPUs validadas por el autor: RTX 5090 y RTX PRO 4500 Blackwell. El autor indica explícitamente que otras GPUs, kernels y combinaciones de paquetes no han sido validadas por esta release.
- Compatibilidad con GPUs consumer: sí, al menos en Blackwell consumer (RTX 5090); no hay validación documentada en arquitecturas anteriores (Ampere, Ada) ni en GPUs sin soporte NVFP4.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0, PyTorch 2.13.0 y Transformers 5.17.0. No es un release GGUF ni AutoAWQ, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión adicional.
- Para INT2, el experimento añade el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming (humming-kernels 0.1.17).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3-8B BF16 (base) | 8,19B | no disponible | BF16 | 71,39 | 61,11 | Apache-2.0 |
| Este checkpoint | 8,19B | no disponible | NVFP4 W4A16, GPTQ | 68,61 | 58,42 | Apache-2.0 |
| Otras alternativas cuantizadas de Qwen3-8B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otras alternativas cuantizadas de Qwen3-8B en la información proporcionada, por lo que la comparativa se limita al par base/cuantizado del mismo autor.

## Limitaciones y advertencias

- Pérdida de precisión medible: 2,78 puntos en AIME-120 y 2,69 puntos en GPQA Diamond respecto al BF16, con el protocolo del autor; la degradación puede variar en otras tareas.
- Validación limitada a Blackwell: el autor solo valida vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0 en RTX 5090 y RTX PRO 4500; otras GPUs y combinaciones de paquetes no están validadas.
- El ejemplo de carga del README no se ha reejecutado desde el repositorio subido, según indica el propio autor.
- Formato no portable a llama.cpp u Ollama: al ser compressed-tensors y no GGUF, requiere conversión para stacks fuera de vLLM.
- Las puntuaciones son del protocolo del autor y no resultados oficiales de Qwen; las respuestas truncadas se penalizan como incorrectas, lo que puede infravalorar el modelo con presupuestos de salida menores.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Qwen3-8B, no detallados en la información disponible.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia incluido en `LICENSE` y citar la procedencia del checkpoint cuantizado.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4A16-GPTQ-WikiText2
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit de procedencia del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de evaluación por seed: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuración del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Repositorio de la serie Qwen (referencia general): https://github.com/QwenLM/Qwen3.8
