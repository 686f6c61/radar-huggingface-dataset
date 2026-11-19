# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains Research. El objetivo concreto es internalizar un presupuesto fijo de generacion de 1.024 tokens para razonamiento matematico: en lugar de gastar mas tokens en tiempo de inferencia para mejorar la precision, el modelo aprende a resolver problemas dentro de ese limite fijo. Se enmarca en el articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El entrenamiento usa GRPO (Group Relative Policy Optimization) sobre el dataset de matematicas DeepScaleR, con recompensa binaria por correccion de la respuesta extraida de las etiquetas `\boxed{}`. Las respuestas que agotan el presupuesto se truncan y se puntuan tal cual, lo que fuerza al modelo a economizar tokens de razonamiento. Este repositorio concreto es el checkpoint final (paso 300) del entrenamiento con semilla 42, dentro de un ablation de tres semillas (42, 43, 44) de la misma receta.

El modelo base es un Gemma 4 E2B instruct, de arquitectura multimodal (pipeline `any-to-any`, entrada imagen-texto) y aproximadamente 5.120 millones de parametros totales segun los pesos en safetensors. La relevancia practica esta en el control de coste: un modelo pequeno que razona matematicas con un techo de tokens conocido y predecible simplifica la planificacion de latencia y facturacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B), pipeline any-to-any; detalles internos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto y salida any-to-any. Sobre esa base se aplica un ajuste fino con GRPO: baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. El presupuesto de generacion se fija en `max_new_tokens = 1024`; las respuestas que alcanzan el limite se truncan y se evaluan tal cual, lo que convierte la eficiencia en tokens en parte de la senal de optimizacion.

Los datos de entrenamiento son el dataset de matematicas DeepScaleR (`agentica-org/DeepScaleR-Preview-Dataset`), con un maximo de 3 epocas. La configuracion de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria: correccion de la respuesta final extraida de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de etiquetas `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico con presupuesto fijo de 1.024 tokens de generacion, orientado a mantener precision dentro del limite.
- Generacion de cadenas de razonamiento paso a paso y extraccion de respuesta final en formato `\boxed{}`.
- Capacidades multimodales heredadas del modelo base Gemma 4 E2B (entrada imagen-texto, pipeline any-to-any).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible; el razonamiento se induce via prompt, no via un modo dedicado documentado.

## Casos de uso

- Evaluacion de investigacion en RLVR: reproducir el ablation de semillas (42, 43, 44) y comparar checkpoints (pasos 250, 280, 300) para estudiar la varianza del entrenamiento con recompensa binaria.
- Razonamiento matematico con coste acotado: desplegar el modelo en un servicio donde cada consulta tiene un techo de 1.024 tokens generados, lo que permite presupuestar latencia y coste por peticion de forma determinista.
- Generacion de soluciones matematicas verificables: usar la extraccion de `\boxed{}` para validar automaticamente respuestas en pipelines de correccion o evaluacion.
- Benchmarking de internalizacion de presupuesto: comparar la precision dentro de presupuesto frente al modelo base sin ajuste, para medir la ganancia de GRPO con recompensa binaria.
- Prototipado de tutoria matematica: integrar el modelo en un asistente que explica pasos intermedios y devuelve una respuesta final estructurada, con un limite de longitud controlado.
- Investigacion sobre eficiencia en test-time compute: usar este checkpoint como referencia para estudiar el intercambio entre escalado en inferencia y precision dentro de presupuesto.
- Filtrado y sintesis de datos matematicos: generar soluciones acotadas en longitud para construir datasets de entrenamiento o validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos (5.123 millones de parametros), mas overhead de activaciones y cache KV; en la practica se requiere cuantizacion o GPU de alta memoria.
- GPU recomendadas: A100 (40/80 GB) o H100 para F32 sin cuantizar; RTX 4090 (24 GB) queda al limite y probablemente requiera cuantizacion.
- Cabe en GPU de consumo: solo con cuantizacion (p. ej. 8 bits o 4 bits), no disponible en la informacion proporcionada como artefactos publicados.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300) | 5.123 M | no disponible | RLVR con presupuesto fijo de 1.024 tokens sobre Gemma 4 E2B | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base instruct multimodal | Licencia Gemma 4 | Hugging Face |
| Checkpoints hermanos del mismo ablation (seed 43, seed 44) | 5.123 M (misma base) | no disponible | Misma receta, distinta semilla | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas con DeepScaleR; el rendimiento fuera de ese dominio no esta caracterizado.
- La recompensa binaria y el truncado a 1.024 tokens pueden penalizar problemas que requieren cadenas de razonamiento mas largas.
- Riesgo de alucinacion en la respuesta final: la recompensa solo valida el contenido de `\boxed{}`, no la cadena de razonamiento intermedia.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; los idiomas soportados no estan documentados.
- Licencia: Apache 2.0 segun los metadatos, pero la model card remite a la licencia de Gemma 4 del modelo base; conviene verificar las condiciones de uso comercial de esa licencia antes de produccion.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: sin validacion externa de la comunidad.
- Pesos en F32 (20,5 GB de repositorio), lo que encarece el despliegue sin cuantizacion.
- La cita del articulo figura como `TODO` en la model card; la referencia bibliografica no esta completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint paso 250 (seed 42): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint paso 300 (seed 43): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint paso 280 (seed 44): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Checkpoint paso 300 (seed 44): https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
