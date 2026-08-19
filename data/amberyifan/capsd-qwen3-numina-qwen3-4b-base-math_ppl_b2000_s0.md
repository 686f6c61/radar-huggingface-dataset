# AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b2000_s0

## Resumen

El modelo `capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b2000_s0` es un ajuste fino (fine-tuning completo) de la base `Qwen/Qwen3-4B-Base`, realizado por el usuario AmberYifan. El objetivo declarado es especializar el modelo en tareas matemáticas mediante el entrenamiento sobre un dataset denominado `capsd_Qwen3-4B-Base-n80000-numina__mix_math_ppl_b2000_s0`. Se trata de un modelo de generación de texto con arquitectura transformer densa, de aproximadamente 4 022 millones de parámetros, entrenado con la librería `llama-factory` y `transformers`.

La relevancia de este modelo radica en que parte de una base ya sólida (Qwen3-4B-Base) y la adapta mediante un ajuste fino completo a un dominio específico, las matemáticas. Aunque no se han publicado resultados de evaluación, el interés práctico es disponer de un modelo de 4B parámetros con mayor competencia en razonamiento matemático que la base original, útil para entornos con recursos limitados. La ficha se basa exclusivamente en la información disponible en la página de HuggingFace y en el conocimiento público de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense, sin MoE) |
| Parametros totales | 4 022 468 096 (4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredado de Qwen3-4B-Base, no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | No disponible (hereda los de Qwen3-4B-Base: principalmente ingles y chino, con algo de multilingue) |
| Licencia | other (no se especifica la licencia exacta; se recomienda consultar el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `Qwen/Qwen3-4B-Base`, que pertenece a la familia Qwen3. La arquitectura subyacente es un transformer decoder-only con atención de múltiples cabezas, normalización previa y capas de feed-forward densas. Qwen3-4B-Base incorpora las innovaciones de la serie Qwen3, como el modo de pensamiento (thinking mode) y el modo no-pensamiento, aunque al ser una versión base no incluye el ajuste por instrucciones (instruct) del modelo final.

El entrenamiento se realizó con la librería `llama-factory` en modo "full" (todos los parámetros se actualizaron). Los hiperparámetros declarados son: learning rate de 1e-5, batch size de entrenamiento de 2 por dispositivo con acumulación de gradientes de 8 (batch efectivo de 64), optimizador AdamW, scheduler coseno con warmup del 3% y una sola época. Se usaron 4 GPUs. El dataset de entrenamiento no está descrito en detalle, pero el nombre sugiere una mezcla de datos matemáticos con un subconjunto de 80 000 muestras y una estrategia de selección basada en perplexidad (ppl_b2000_s0). No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generacion de texto: al ser una base ajustada, puede generar texto continuo y completar secuencias, con especialización en contenido matemático.
- Razonamiento matematico: el ajuste fino busca mejorar la capacidad de resolver problemas aritmeticos, algebraicos y de razonamiento cuantitativo, aunque no hay evaluaciones publicadas que lo confirmen.
- Soporte de tool calling / function calling: no confirmado en esta ficha; la base Qwen3-4B-Base lo soporta, pero no se ha verificado en este ajuste.
- Soporte de agentes y multi-step reasoning: no confirmado; depende del comportamiento de la base y del ajuste.
- Capacidades multilingues: no disponible; se heredan las de Qwen3-4B-Base (principalmente ingles y chino, con limitado multilingue).
- Modo de pensamiento: la base Qwen3 incluye un mecanismo de activación del modo de razonamiento (thinking), pero no se ha verificado su funcionamiento en este ajuste.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede emplearse como asistente para generar soluciones paso a paso a ejercicios de algebra, calculo o estadistica, aprovechando el ajuste especifico en datos matematicos.
- Generacion de enunciados y examenes: permite crear problemas matematicos variados con soluciones, util para plataformas de e-learning o generacion automatica de material didactico.
- Preprocesamiento de datos cientificos: al especializarse en matematicas, puede ayudar a extraer y normalizar formulas o expresiones numericas de textos cientificos.
- Base para ajuste adicional por instrucciones: al ser un modelo base, puede servir como punto de partida para un posterior fine-tuning con datos instruct o RLHF, orientado a tareas matematicas especificas.
- Experimentacion en investigacion: util para estudiar el impacto del ajuste fino completo en modelos de 4B sobre dominios concretos, comparando con la base original.
- Sistemas de tutoria inteligente: integrado en un pipeline de generacion aumentada por recuperacion (RAG) para responder consultas matematicas con contexto adicional, aprovechando su ventana de contexto de 32k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada sin resultados (`results: []`). Por tanto, no es posible comparar cuantitativamente este modelo con otros en tareas estandar como MMLU, GSM8K o HumanEval. Se recomienda realizar una evaluacion propia antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, un modelo de 4B parametros requiere aproximadamente 8 GB de VRAM. Con cuantizacion a 8 bits (si se genera) bajaría a unos 4 GB, y a 4 bits a unos 2-3 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070, RTX 4060 Ti, o GPUs profesionales como A10 o L4. Para mayor velocidad, una RTX 4090 (24 GB) o A100 (40/80 GB) permiten mayor batch y menor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer con 8 GB o más, aunque con limitaciones de batch y velocidad.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se exporta a formato GGUF.
- Latencia y throughput estimados: no disponibles. Para una GPU de gama media (RTX 3090), un modelo de 4B en fp16 suele generar entre 30 y 60 tokens por segundo, pero depende de la implementacion y del hardware.

## Comparativa con modelos similares

La comparacion debe hacerse con el modelo base y otros modelos de tamano similar (3-4B parametros). Se presentan datos publicos de las bases, no de este ajuste especifico.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Base (base) | 4,02 B | 32 768 | Apache 2.0 (segun Qwen) | Base original sin ajuste matematico |
| Este modelo (fine-tune) | 4,02 B | 32 768 (heredado) | other | Ajuste matematico sin evaluaciones publicadas |
| Llama-3.2-3B | 3,21 B | 128 000 | Llama 3.2 Community License | Modelo base generalista, contexto mas largo |
| Phi-3-mini-4k | 3,82 B | 4 096 | MIT | Optimizado para razonamiento, contexto corto |

No se dispone de datos de rendimiento comparativos porque este modelo no ha sido evaluado en benchmarks publicos. La comparacion se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Sin evaluacion publica: no hay benchmarks ni resultados de validacion que demuestren una mejora real sobre la base en tareas matematicas. El uso en produccion requiere una evaluacion propia.
- Sesgos heredados: al ser un ajuste de Qwen3-4B-Base, puede heredar sesgos presentes en los datos de entrenamiento originales de Qwen3, como sesgos culturales o de genero.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matematicos complejos. Se recomienda validar las salidas.
- Licencia "other": la licencia no esta claramente especificada. Aunque el modelo base Qwen3 se distribuye bajo Apache 2.0, este ajuste podria tener restricciones adicionales. Consultar el repositorio antes de uso comercial.
- Limitaciones de idioma: no se ha confirmado el soporte multilingue; probablemente este limitado a ingles y chino, como la base.
- Contexto no verificado: aunque la base soporta 32k tokens, no se ha confirmado que este ajuste mantenga esa longitud sin degradacion.
- Dataset de entrenamiento no documentado: no se detalla la composicion exacta del dataset, lo que dificulta evaluar posibles sesgos o duplicidades con conjuntos de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_ppl_b2000_s0
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Reporte tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Guia de Qwen3 (InsiderLLM): https://insiderllm.com/guides/qwen3-complete-guide/
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3
