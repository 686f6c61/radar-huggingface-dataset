# marmossburg/gpt2-124m-chat

## Resumen

GPT-2 124M — Concise chat es un ajuste fino supervisado (SFT) del modelo `marmossburg/gpt2-124m-reproduction`, una reproduccion de GPT-2 de 124 millones de parametros preentrenada desde cero sobre FineWeb-Edu. El autor, marmossburg, parte del checkpoint base en el paso 19.072 y aplica un fine-tune conversacional completo (todos los pesos actualizados, no es un adaptador LoRA) orientado a explicaciones tecnicas concisas, discusion cientifica, preguntas de seguimiento y conversacion informal.

El modelo emplea la arquitectura decoder-only clasica de GPT-2, con 124.475.904 parametros totales y una ventana de contexto de 1.024 tokens. El entrenamiento se realizo sobre 4.152 conversaciones (3.173 de ellas multi-turno) extraidas principalmente de Smol-SmolTalk, durante dos epocas y 1.038 actualizaciones del optimizador, procesando 2.800.758 tokens sin contar el padding. Solo se publica el checkpoint final.

Su relevancia es acotada y experimental: se trata de un ejercicio de reproduccion y fine-tune a pequena escala, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta util como referencia pedagogica de un pipeline SFT completo sobre GPT-2, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.475.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16/FP32; no se documentan GGUF ni otras) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estandar: transformer decoder-only con atencion causal, sin innovaciones como atencion lineal, decodificacion especulativa ni mezcla de expertos. El preentrenamiento del modelo base se realizo desde cero sobre FineWeb-Edu. El fine-tune conversacional se ejecuto en una unica GPU RTX PRO 4000 Blackwell de 24 GB en precision BF16, con batch efectivo de 8 conversaciones, optimizador Fused AdamW (betas 0.9/0.999, epsilon 1e-8), learning rate constante de 2e-5 sin warmup, weight decay 0.01, gradient clipping 1.0, dos epocas y semilla 42. El stack fue PyTorch 2.9.1+cu130, Transformers 4.57.3 y TRL 0.24.0.

El dataset combina 4.060 registros originales de Smol-SmolTalk (revision `f73fe857d519ff6ac5af2ea67c4d3834da7b8bcc`), 88 registros escritos por el autor y cuatro registros adaptados. La supervision se aplica solo a las respuestas del asistente y a los tokens de fin; el texto del usuario y las cabeceras de rol estan enmascarados. No se documenta RLHF ni DPO. La perdida en el conjunto de validacion (64 conversaciones retenidas) baja de 2,721162 en el modelo base a 1,872742 en el checkpoint final, y la precision por token del asistente sube del 45,41% al 57,62%.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat propia incluida en el tokenizer.
- Respuestas concisas orientadas a explicaciones tecnicas y cientificas (intencion declarada del entrenamiento).
- Manejo de conversaciones multi-turno dentro del limite de 1.024 tokens.
- Preguntas de seguimiento y small talk amable.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: permite montar un chatbot basico con `transformers` y la plantilla de chat incluida, util para validar interfaces antes de invertir en modelos mayores.
- Educacion y divulgacion tecnica: su entrenamiento apunta a explicaciones concisas de conceptos como estructuras de datos o temas cientificos, adecuado para demos de tutoria automatica a pequena escala.
- Investigacion sobre SFT: sirve como referencia reproducible de un pipeline completo (dataset, enmascarado de supervision, hiperparametros y metricas) sobre GPT-2, con todos los ajustes documentados en `training/`.
- Experimentos academicos de bajo coste: cabe en una GPU consumer y permite estudiar efectos del fine-tune conversacional sin presupuesto de infraestructura.
- Generacion de respuestas de seguimiento en dialogos cortos: su ventana de 1.024 tokens encaja en interacciones breves de soporte o FAQ donde no se requiere contexto largo.
- Base para comparativas de ajuste fino: al publicarse perdida y precision por token frente al modelo base, facilita medir el impacto de un SFT pequeno en tareas conversacionales.
- Pruebas de integracion con text-generation-inference: el modelo esta etiquetado como compatible con TGI y endpoints, lo que permite validar despliegues ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion son internos, sobre 64 conversaciones retenidas:

| Metrica | Modelo base | Checkpoint final (1.038 pasos) |
|---|---:|---:|
| Perdida en validacion | 2,721162 | 1,872742 |
| Precision por token del asistente | 45,41% | 57,62% |

El autor advierte que estas cifras no son comparables con la evaluacion de 50 ejemplos de un fine-tune anterior y que la precision por token no mide correccion factual ni exito conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en BF16/FP16 (124M parametros), en torno a 0,25 GB en cuantizacion de 8 bits y 0,13 GB en 4 bits, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en una RTX PRO 4000 Blackwell de 24 GB, pero la inferencia no requiere ese hardware.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para uso ocasional.
- Opciones de despliegue: `transformers` (probado con 4.57.3 y PyTorch 2.9.1), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| marmossburg/gpt2-124m-chat | 124,5M | 1.024 | en | no disponible | SFT conversacional sobre GPT-2 reproducido |
| GPT-2 (OpenAI) | 124M | 1.024 | en | MIT | Modelo original; sin fine-tune conversacional |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | en | Apache 2.0 | Chat con contexto mayor y mas capacidad |
| SmolLM-135M-Instruct | 135M | 2.048 | en | Apache 2.0 | Alternativa instruct de tamano similar con licencia clara |

La comparativa con GPT-2 original y SmolLM-135M-Instruct es la mas directa por tamano; TinyLlama se incluye como referencia de un escalon superior. No hay datos de benchmarks publicados para el modelo de marmossburg que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Riesgo de repeticiones, explicaciones incorrectas y seguimiento debil del contexto, segun reconoce el propio autor.
- Ventana de contexto de solo 1.024 tokens, insuficiente para dialogos largos o documentos extensos.
- Solo ingles; sin soporte multilingue.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, por lo que no debe emplearse en produccion sin aclarar los terminos con el autor.
- Entrenado con 4.152 conversaciones y 2,8M tokens: dataset muy pequeno, con filtrado solo estructural y sin auditoria exhaustiva de calidad factual ni de solapamiento de parafrasis.
- Sesgos no evaluados; al derivar de FineWeb-Edu y Smol-SmolTalk puede heredar sesgos de esas fuentes.
- La evaluacion se limita a 64 conversaciones y no mide correccion factual ni exito conversacional real.
- Sin datos de benchmarks estandar, sin descargas ni validacion por la comunidad (0 descargas, 0 likes en la consulta).
- No se reclama conformidad con ASD-STE100 ni con ningun estandar de redaccion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marmossburg/gpt2-124m-chat
- Modelo base: https://huggingface.co/marmossburg/gpt2-124m-reproduction
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- FineWeb-Edu (preentrenamiento del base): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Transformers: https://github.com/huggingface/transformers
