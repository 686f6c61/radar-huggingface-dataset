# Convergent-ch/Alpina-Large-2.0-Mega-122B

## Resumen

Alpina Large 2.0 Mega 122B es un ajuste fino (finetune) experimental publicado por Convergent-ch sobre el modelo base Qwen/Qwen3.5-122B-A10B. Se distribuye como un modelo completamente fusionado en BF16 Safetensors: los pesos originales de Qwen y el adaptador LoRA entrenado por Convergent-ch se han combinado en un único checkpoint de 125.086.497.008 parámetros almacenados. El repositorio ocupa 250,3 GB y requiere Transformers 5.3.0 o superior para cargar la arquitectura `qwen3_5_moe`.

El modelo hereda del base la arquitectura Mixture-of-Experts (MoE) con capacidades multimodales de imagen-a-texto (`image-text-to-text`) y una ventana de contexto que no se explicita en la información disponible. La personalización se realizó con solo 180 pasos de adaptación sobre pesos base en BF16, usando PEFT 0.18.1, torchao 0.16.0 y Transformers 5.3.0, lo que lo convierte en una release de investigación con evaluación muy limitada.

Su relevancia es acotada: no es un modelo de propósito general validado, sino una demostración de adaptación ligera sobre un MoE grande. El autor advierte explícitamente de que las comprobaciones de identidad (3/3) y de código Python simple (4/4) no constituyen un benchmark ni evidencia de mejora de capacidades. La licencia Apache-2.0 facilita su experimentación, pero la ausencia de métricas publicadas limita su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, clase `Qwen3_5MoeForConditionalGeneration` |
| Parámetros totales | 125.086.497.008 almacenados (nombre nominal del base: 122B) |
| Parámetros activos | no disponible (el base se denomina A10B, pero no se confirma el número exacto en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (release principal); GGUF Q4_K_M publicado por separado para Ollama |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16 fusionado); GGUF Q4_K_M; adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture-of-Experts multimodal derivado de Qwen3.5-122B-A10B, con soporte de entrada imagen-texto a texto. La release principal contiene todos los parámetros originales y todos los expertos del base, más los deltas LoRA aprendidos aplicados únicamente sobre las capas lineales objetivo. No se ha reentrenado el modelo base desde cero; el adaptador se fusionó sobre los pesos BF16 originales.

El entrenamiento consistió en 180 pasos de adaptación con PEFT 0.18.1, torchao 0.16.0 y Transformers 5.3.0, partiendo de pesos base en BF16. Las fuentes de datos incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se documenta el número total de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La evaluación se limita a 3/3 comprobaciones de identidad y 4/4 comprobaciones de Python simple, que el autor califica explícitamente como no representativas de una mejora general de capacidades.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat y soporte de `enable_thinking=False` en el ejemplo de carga.
- Entrada multimodal imagen-texto a texto, según el pipeline `image-text-to-text` y la clase `Qwen3_5MoeForConditionalGeneration`.
- Razonamiento y generación de código: el autor reporta 4/4 en comprobaciones de Python simple, sin que esto constituya un benchmark.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo thinking: la plantilla de chat acepta `enable_thinking=False`, lo que sugiere soporte de un modo de razonamiento, pero no se detalla su comportamiento.

## Casos de uso

- Experimentación con adaptación LoRA sobre MoE grandes: el repositorio conserva el adaptador original en `adapter/`, lo que permite reproducir la fusión y estudiar el efecto de 180 pasos de adaptación sobre un base de 122B.
- Investigación en eficiencia de finetuning: sirve para analizar cuánto cambia un modelo con un adaptador mínimo y qué comprobaciones básicas de identidad y código se preservan.
- Pruebas de carga y despliegue de arquitecturas Qwen3.5 MoE: útil para validar pipelines con Transformers 5.3.0 y `device_map="auto"` antes de adoptar el base completo.
- Evaluación comparativa de releases fusionadas frente a adaptadores PEFT: permite contrastar el checkpoint fusionado con la carga del base más el adaptador en `subfolder="adapter"`.
- Prototipado de asistentes conversacionales en inglés: el modelo acepta plantilla de chat con rol de sistema y usuario, adecuado para demos internas controladas.
- Experimentos multimodales imagen-texto: al heredar la clase de generación condicional multimodal, puede usarse para probar entradas de imagen en entornos de investigación, siempre con validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta 3/3 comprobaciones de identidad y 4/4 comprobaciones de Python simple, y advierte que no deben interpretarse como evidencia de calidad o de mejora de capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el payload completo es de 250,2 GB (233,0 GiB) antes de memoria de runtime, por lo que se necesita un entorno multi-GPU de gran capacidad.
- GPU recomendadas: no disponible de forma explícita; por tamaño, requiere múltiples aceleradores de clase A100/H100 con suficiente memoria agregada. No cabe en una RTX 4090 en BF16.
- Consumer GPU: la versión BF16 no es viable en GPUs de consumo. La variante GGUF Q4_K_M, publicada por separado, reduce el requisito y podría ejecutarse en configuraciones de gama alta con suficiente VRAM o RAM, aunque no se especifican cifras.
- Opciones de despliegue: Transformers 5.3.0 o superior con `device_map="auto"`; GGUF Q4_K_M para Ollama. No se confirma soporte de vLLM, TGI o llama.cpp en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Large 2.0 Mega 122B | 125.086.497.008 almacenados | no disponible | Apache-2.0 | Hugging Face, Safetensors BF16 y GGUF Q4_K_M | Finetune experimental con 180 pasos, evaluación mínima |
| Qwen/Qwen3.5-122B-A10B (base) | 122B nominales (A10B activos según nombre) | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo original de Qwen; el finetune parte de él |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información proporcionada |

## Limitaciones y advertencias

- Release de investigación con evaluación muy limitada: solo 3/3 comprobaciones de identidad y 4/4 de Python simple, sin benchmarks.
- Las afirmaciones de identidad describen la personalización y no alteran la autoría original del modelo base de Qwen.
- No debe inferirse calidad de benchmark a partir de respuestas correctas de nombre o código trivial.
- Idiomas: solo inglés declarado; no hay evidencia de soporte multilingüe.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo con garantías.
- Riesgo de alucinación no cuantificado; al ser un finetune ligero, hereda los sesgos y limitaciones del base Qwen, no documentados aquí.
- Licencia Apache-2.0 permite uso comercial, pero las licencias y avisos de los datasets de origen (ODC-BY, Apache-2.0) siguen aplicando a los datos fuente, que no se redistribuyen.
- El adaptador no debe aplicarse de nuevo al cargar el checkpoint fusionado.
- Requiere Transformers 5.3.0 o compatible más reciente; versiones anteriores pueden no cargar la arquitectura Qwen3.5 MoE.
- El requisito de memoria está dominado por el modelo base: 250,2 GB de payload en BF16 antes de runtime.
- No se declara afiliación con Qwen ni con los autores de los datasets.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Large-2.0-Mega-122B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
