# itlrc/gpt2-small

## Resumen

`itlrc/gpt2-small` es una reproducción desde cero ("from scratch") de la arquitectura GPT-2 Small, publicada por el usuario itlrc en HuggingFace. No es un fine-tuning ni una destilación del modelo original de OpenAI: es un entrenamiento propio de 124.439.808 parámetros sobre el subconjunto `sample-10BT` del dataset FineWeb-Edu, usando el tokenizador GPT-2 original. El resultado es un modelo causal de lenguaje en inglés con 12 bloques Transformer, 768 dimensiones de embedding y una ventana de contexto de 1.024 tokens, empaquetado en safetensors y FP32.

El interés del modelo es principalmente educativo y de investigación: demuestra que es posible reproducir un baseline tipo GPT-2 Small con recursos moderados (10.500 steps, batch efectivo de 524.288 tokens, 42 épocas lógicas sobre unos 5,51-6 mil millones de tokens procesados) y obtener una pérdida de validación de 3,2915 (perplejidad 26,88). Se trata de un modelo base sin instruction tuning, sin RLHF y sin DPO, por lo que su comportamiento es el de un continuador de texto puro y no el de un asistente.

Es relevante ahora porque sirve como referencia barata para experimentos de arquitectura, comparación de corpus de preentrenamiento (FineWeb-Edu frente a WebText), estudios de escalado y pruebas de pipelines de inferencia en hardware muy limitado. El repositorio incluye código de arquitectura personalizado, lo que obliga a usar `trust_remote_code=True` al cargarlo con Transformers. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (equivalente a GPT-2 Small), con código de arquitectura personalizado |
| Parametros totales | 124.439.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (pesos publicados en FP32); al ser una arquitectura GPT-2 estándar, es convertible a FP16, int8 y formatos GGUF de 4-8 bits con herramientas externas |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP32); requiere `trust_remote_code=True` |
| Vocabulario | 50.257 tokens (tokenizador GPT-2) |
| Dimensiones | 768 (embedding), 12 cabezas de atención, 12 bloques |
| Peso compartido | Sí (embedding y cabeza de lenguaje comparten pesos) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal decoder-only estándar: 12 bloques, 12 cabezas de atención, embedding de 768 dimensiones, vocabulario de 50.257 tokens, contexto máximo de 1.024 tokens y pesos compartidos entre el embedding de entrada y la cabeza de lenguaje (*weight tying*), una práctica habitual en GPT-2 para reducir el recuento de parámetros. Los 124.439.808 parámetros se almacenan en FP32. La innovación técnica, más allá de la reimplementación limpia, es mínima: se trata de una reproducción fiel orientada a la reproducibilidad y no de una variante arquitectónica nueva (no hay MoE, ni atención lineal, ni SSM, ni decodificación especulativa).

El entrenamiento se hizo sobre la configuración `sample-10BT` de `HuggingFaceFW/fineweb-edu`, un corpus educativo filtrado en inglés, con el tokenizador GPT-2. Se procesaron aproximadamente 5,51 mil millones de tokens (otra sección de la model card menciona "aproximadamente 6 mil millones"), con un batch efectivo de 524.288 tokens por step, 10.500 steps y 250 steps por época lógica, lo que da 42 épocas lógicas completas. El optimizador fue AdamW con betas `(0,9, 0,95)`, weight decay 0,1, gradient clipping en 1,0 y un esquema de warmup seguido de cosine decay. La validación se realizó sobre un conjunto fijo de documentos reservados. No hubo instruction tuning, RLHF ni alineamiento por preferencias.

## Capacidades

- Generación de texto en inglés: continuación de prompt, redacción libre y modelado de lenguaje general.
- Modelado causal puro: sirve como base para fine-tuning supervisado, LoRA o adaptadores de tarea.
- Razonamiento básico y conocimiento factual de nivel GPT-2 Small, muy limitado por el tamaño y por el corpus educativo.
- Sin soporte nativo de tool calling ni function calling.
- Sin soporte de agentes ni multi-step reasoning entrenado.
- Sin modo "thinking" ni capacidades de razonamiento extendido.
- Sin visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; el resto de idiomas queda fuera de su distribución de entrenamiento.
- Sin plantilla de chat ni formato de turnos: no distingue system prompt, user ni assistant.

## Casos de uso

- Referencia de investigación para comparativas de corpus: permite medir el efecto de FineWeb-Edu frente a WebText u otros corpus manteniendo arquitectura y tokenizador constantes, algo útil para papers sobre calidad de datos de preentrenamiento.
- Base para fine-tuning ligero: gracias a sus 124M de parámetros y su compatibilidad con Transformers, se puede adaptar con LoRA en una única GPU consumer para tareas de clasificación, generación de titulares o resumen corto.
- Docencia y formación: es un caso ideal para explicar el ciclo completo de preentrenamiento de un LLM (tokenización, batch efectivo, curva de pérdida, perplejidad) porque el autor publica las curvas y las métricas exactas.
- Test de pipelines de inferencia: sirve para validar integraciones de vLLM, TGI, Ollama o llama.cpp (previa conversión a GGUF) sin consumir presupuesto de GPU, ya que el modelo cabe en cualquier tarjeta.
- Prototipado rápido de interfaz de usuario: permite montar demos de generación de texto en CPU en entornos de CI o notebooks sin GPU.
- Generación de texto creativo de bajo coste: continuación de párrafos, *storytelling* breve o generación de datos sintéticos para aumentar datasets en inglés.
- Pruebas de robustez y análisis de sesgos: al ser un modelo sin alinear, es útil para estudiar qué tipo de contenido problemático genera un LM base entrenado sobre datos filtrados educativos.
- Evaluación de técnicas de cuantización: comparar perplejidad en FP32, FP16, int8 y 4 bits sobre un modelo pequeño y rápido de ejecutar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HellaSwag | 27,68% | Evaluado sobre 10.042 ejemplos |
| Perplejidad de validación | 26,88 | Conjunto fijo de documentos reservados |
| Validation loss | 3,2915 | — |
| Train loss | 3,3080 | — |
| Steps | 10.500 | Batch efectivo de 524.288 tokens |
| Épocas lógicas | 42 | 250 steps por época lógica |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K, HumanEval, ARC, etc.) en la información disponible, ni comparativas numéricas directas con GPT-2 Small original u otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 500 MB solo para pesos (124,4M × 4 bytes), más activaciones y caché KV; en la práctica, menos de 1,5 GB con batch pequeño.
- VRAM en FP16/BF16: aproximadamente 250 MB de pesos.
- VRAM en int8: aproximadamente 125 MB de pesos; en 4 bits, unos 70 MB.
- Cabe sin problema en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o Apple Silicon con memoria unificada.
- Inferencia en CPU perfectamente viable, tanto en FP32 como en cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía oficial documentada), vLLM, TGI, Ollama y llama.cpp. Estos dos últimos requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors en FP32.
- GPU recomendadas para entrenamiento de fine-tuning: RTX 3090/4090 o A100 si se quiere un batch grande; para adaptadores LoRA, cualquier GPU con 8-12 GB es suficiente.
- Latencia y throughput: no se han publicado cifras oficiales. Al tratarse de un modelo de 124M en FP32, el rendimiento dependerá casi por completo del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento HellaSwag |
|---|---|---|---|---|---|
| itlrc/gpt2-small | 124,4M | 1.024 | No disponible | HuggingFace (safetensors, código custom) | 27,68% |
| GPT-2 Small (OpenAI) | 124M | 1.024 | Modified MIT | HuggingFace / OpenAI | No disponible en la información proporcionada |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Apache 2.0 | HuggingFace | No disponible en la información proporcionada |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | HuggingFace | No disponible en la información proporcionada |

Los datos de parámetros, contexto y licencia de los modelos alternativos son características públicas ampliamente conocidas; sus cifras de rendimiento no se incluyen porque no forman parte de la información proporcionada para esta ficha y no deben asumirse.

## Limitaciones y advertencias

- No ha recibido instruction tuning, RLHF ni DPO; no se comporta como un asistente y no sigue instrucciones de forma fiable.
- Riesgo alto de alucinación y de generar información falsa, repeticiones y contenido inadecuado, tal como advierte el propio autor.
- Sesgos heredados del corpus FineWeb-Edu (texto educativo en inglés filtrado con clasificadores automáticos), no auditados en la model card.
- Ventana de contexto de solo 1.024 tokens, insuficiente para tareas de contexto largo.
- Modelo monolingüe en inglés; no soporta castellano ni otros idiomas de forma útil.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor antes de usarlo en producción.
- El repositorio incluye código de arquitectura personalizado, por lo que la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor: conviene revisarlo antes de desplegarlo.
- Solo se publican pesos en FP32 y safetensors; no hay versiones GGUF, AWQ o GPTQ listas para usar.
- Discrepancia menor en la propia model card sobre el número de tokens procesados (5,51 mil millones frente a "aproximadamente 6 mil millones"), lo que dificulta trazar el cómputo exacto de entrenamiento.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados correspondían a material escolar en árabe sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itlrc/gpt2-small
- Dataset de entrenamiento (FineWeb-Edu, configuración `sample-10BT`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador GPT-2 utilizado: https://huggingface.co/openai-community/gpt2
- Repositorio nanoGPT (referencia habitual para este tipo de reproducciones, mencionado en las etiquetas del modelo): https://github.com/karpathy/nanoGPT
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos de este modelo en la búsqueda web realizada.
