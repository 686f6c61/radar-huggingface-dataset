# hoangducanh1865/qwen3-1.7b-deita-sft-student

## Resumen

`qwen3-1.7b-deita-sft-student` es un ajuste supervisado (SFT) del modelo base Qwen/Qwen3-1.7B-Base, publicado por el usuario de HuggingFace hoangducanh1865. Se trata de un transformer denso de 1.720.574.976 parámetros (unos 1,72 mil millones) entrenado durante una única época sobre el dataset HuggingFaceH4/deita-10k-v0-sft, un conjunto de aproximadamente 10.000 muestras de instrucciones y conversaciones. Los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0 y el repositorio ocupa 3,5 GB.

El propósito del ajuste es convertir un modelo base —entrenado para continuar texto, sin formato conversacional— en un asistente capaz de seguir instrucciones en diálogos multiturno, manteniendo un tamaño lo bastante reducido como para ejecutarse en una GPU de consumo o en CPU con cuantización agresiva.

Su relevancia actual es doble. Por un lado, sirve como ejemplo reproducible de un pipeline de alineación de bajo coste basado en alignment-handbook (learning rate 3e-5, batch total de 64 en 2 GPU, scheduler coseno con warmup del 10 %). Por otro, su ficha es una plantilla autogenerada por el Trainer, con secciones marcadas como "More information needed", sin resultados de evaluación y sin benchmarks publicados, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción. Ni la longitud de contexto ni los idiomas soportados se declaran en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3; ajuste SFT sobre Qwen/Qwen3-1.7B-Base |
| Parámetros totales | 1.720.574.976 (≈1,72 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el dataset de ajuste, deita-10k-v0-sft, está mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-1.7B-Base |
| Dataset de ajuste | HuggingFaceH4/deita-10k-v0-sft |
| Tamaño del repositorio | 3,5 GB |
| Librería | transformers |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B-Base: un transformer decoder-only denso de la familia Qwen3, que según el informe técnico de Qwen3 abarca modelos densos y MoE entre 0,6 y 235 mil millones de parámetros. La familia introduce como innovación la integración de un modo "thinking" (razonamiento multi-paso) y un modo "non-thinking" (respuesta rápida guiada por contexto) en un mismo marco. Este repositorio es un ajuste sobre la variante *Base*, y no se documenta si conserva o reproduce ese esquema de modos de razonamiento.

El entrenamiento es un SFT puro (no se declara RLHF, DPO ni ningún otro método de alineación posterior) ejecutado con alignment-handbook sobre deita-10k-v0-sft durante 1 época, con learning rate 3e-5, optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler coseno con warmup ratio 0,1, batch de entrenamiento total 64 (32 por dispositivo en 2 GPU) y batch de evaluación total 16, con semilla 42. El entorno declarado es Transformers 4.51.3, PyTorch 2.11.0+cu128, Datasets 3.2.0 y Tokenizers 0.21.4. La model card no incluye curva de pérdida, métricas de evaluación ni composición detallada del dataset.

## Capacidades

- Generación de texto e instrucciones: es la capacidad objetivo del ajuste SFT; el modelo responde a prompts en formato conversacional (la etiqueta `conversational` está presente en el repositorio).
- Diálogo multiturno: el dataset deita-10k-v0-sft contiene conversaciones de varios turnos, por lo que el ajuste está orientado a ese formato.
- Razonamiento, matemáticas y código: no disponibles; no hay benchmarks ni evaluación publicada que los respalde.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el dataset de ajuste es mayoritariamente en inglés.
- Modo de razonamiento explícito (thinking mode): no documentado en esta ficha, aunque la familia Qwen3 lo contempla en sus variantes oficiales.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad declarada con TGI y con los endpoints de HuggingFace.

## Casos de uso

- Prototipado local de asistentes conversacionales: con 1,72 mil millones de parámetros, el modelo se puede cargar en una GPU de consumo para iterar sobre prompts, plantillas de chat y formatos de respuesta sin coste de API.
- Punto de partida para un ajuste adicional: al ser un modelo pequeño ya alineado para seguir instrucciones, resulta un punto de partida razonable para un SFT específico de dominio (por ejemplo, atención al cliente interna) con pocos miles de ejemplos y una sola GPU.
- Investigación en pipelines de alineación: reproduce un experimento controlado de alignment-handbook con hiperparámetros conocidos, útil para comparar recetas de SFT o estudiar el efecto de una época sobre deita-10k.
- Despliegue on-premise con datos sensibles: su tamaño permite ejecutarlo en infraestructura propia sin GPU de datacenter, lo que encaja en escenarios donde los datos no pueden salir de la organización.
- Componente generativo en un sistema RAG ligero: puede redactar respuestas a partir de fragmentos recuperados, siempre que la ventana de contexto real del modelo se valide empíricamente antes de fijar el tamaño de los fragmentos.
- Etiquetado asistido y generación de datos sintéticos a pequeña escala: útil para preanotar textos o producir borradores que después revise un modelo mayor o un anotador humano.
- Pruebas de regresión en pipelines de inferencia: su huella de memoria reducida lo hace adecuado para validar configuraciones de vLLM o TGI en integración continua antes de desplegar modelos mayores.
- Chatbot educativo o de soporte interno de baja criticidad: escenarios donde un error de respuesta no tiene consecuencias legales ni económicas y existe revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara un array `results` vacío, y la sección "Training results" del README también está vacía. No se han publicado métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este ajuste.

## Requisitos de hardware

- Peso de los pesos en precisión completa: aproximadamente 3,5 GB en fp16/bf16 (1,72 mil millones de parámetros) y unos 6,9 GB en fp32.
- VRAM estimada para inferencia: en torno a 5-6 GB en bf16 considerando pesos, caché KV y activaciones; en cuantización de 8 bits el peso baja a unos 1,8 GB y en 4 bits a alrededor de 1 GB (estimaciones derivadas del número de parámetros, no verificadas por el autor).
- GPU de consumo: cabe sin problema en tarjetas con 8 GB o más (RTX 3060 Ti, 3070, 4060 Ti, 4070, 4080, 4090); con cuantización de 4 u 8 bits es viable en GPUs de 6 GB.
- GPU profesionales: A100, H100, L40S o similares quedan sobredimensionadas para este tamaño; su uso tendría sentido solo por agregación de muchas réplicas en paralelo.
- CPU: viable con llama.cpp u Ollama, pero requiere convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference y Inference Endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`), además de vLLM o SGLang mediante carga directa. No hay GGUF publicado en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| hoangducanh1865/qwen3-1.7b-deita-sft-student | 1.720.574.976 | No disponible | Apache 2.0 | safetensors | SFT de 1 época sobre deita-10k-v0-sft; sin benchmarks |
| Qwen/Qwen3-1.7B-Base | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | safetensors | Modelo base sobre el que se hizo el ajuste |
| Qwen/Qwen3-1.7B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | safetensors | Variante oficial de la familia Qwen3; alternativa directa como asistente listo para usar |

No se dispone de datos verificados en la información proporcionada para comparar con otras alternativas del mismo rango (por ejemplo, modelos de 1 a 2 mil millones de parámetros de otras familias): los campos de contexto, licencia y rendimiento de esos modelos no están disponibles en las fuentes consultadas.

## Limitaciones y advertencias

- Model card autogenerada: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen literalmente como "More information needed". No hay guía del autor sobre uso previsto.
- Ausencia total de evaluación: sin benchmarks, sin métricas de pérdida y sin análisis cualitativo, no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea.
- Riesgo de alucinación: es un modelo de lenguaje generativo de 1,72 mil millones de parámetros sin mecanismos de verificación; las respuestas factuales deben validarse externamente.
- Sesgos desconocidos: no se documenta composición del dataset, filtrado ni análisis de sesgos. El dataset deita-10k-v0-sft está mayoritariamente en inglés y su origen condiciona los sesgos heredados.
- Limitaciones de idioma: no se declaran idiomas soportados y el ajuste se hizo sobre datos en inglés, por lo que el rendimiento en castellano es una incógnita que debe medirse antes de usarlo en producción.
- Longitud de contexto no declarada: no se indica la ventana efectiva ni si se aplicó alguna extensión; conviene no asumir la del modelo base sin comprobarla.
- Un solo epoch sobre 10.000 muestras: el ajuste es superficial y puede no corregir comportamientos del modelo base; tampoco se documenta ninguna mezcla con datos de retención que mitigue el olvido catastrófico.
- Nombre "student": el identificador sugiere un escenario de destilación, pero no se declara modelo profesor, procedimiento de destilación ni datos de destilación.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial y modificación. Conviene verificar por separado los términos del modelo base Qwen/Qwen3-1.7B-Base, ya que no se detallan en esta información.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no existe retroalimentación de terceros sobre su comportamiento real.
- Sin pesos cuantizados publicados: el usuario debe generar sus propias conversiones GGUF o AWQ si necesita reducir memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoangducanh1865/qwen3-1.7b-deita-sft-student
- Perfil del autor: https://huggingface.co/hoangducanh1865
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Variante oficial de la familia: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceH4/deita-10k-v0-sft
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388
- Ficha de Qwen3-1.7B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-1.7B/summary
