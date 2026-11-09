# Rahspide/MNN-Pocket-0.3B-RU

## Resumen

MNN-Pocket-0.3B-RU es un modelo de lenguaje causal pequeño (361M parámetros totales, 303M no-embedding) desarrollado por el usuario Rahspide, que consiste en un ajuste fino completo del modelo base taobao-mnn/MNN-Pocket-0.3B-Base, construido sobre la arquitectura Qwen3. El objetivo es dotar al modelo de fluidez en ruso manteniendo intactas sus capacidades en inglés y chino, mediante un entrenamiento de continuación sobre texto ruso crudo con una mezcla de repetición del 25% en inglés y chino. No es un modelo de instrucciones: se entrena como un LM causal puro para continuar prefijos de texto, no para responder preguntas.

El modelo es relevante por su enfoque en despliegue en dispositivo (on-device) y en el contexto de teclados predictivos e IME (Input Method Editor), donde el presupuesto de latencia y tamaño (~200 MB cuantizado) es crítico. La receta de entrenamiento está diseñada explícitamente para un tokenizador con escasas fusiones cirílicas, lo que encarece el ruso en tokens y condiciona tanto el presupuesto de datos como la latencia de decodificación en móvil.

En el momento de la publicación de la información disponible, el modelo se encuentra en estado "work in progress": no hay pesos publicados en el repositorio, solo la receta y las mediciones del modelo base. Los checkpoints residen en un repositorio privado y el entrenamiento está en el paso 1.340 de 36.621.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura Qwen3) |
| Parametros totales | 361M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con longitud de secuencia 1024) |
| Tipos de cuantizacion | no disponible (se menciona un modelo cuantizado de ~200 MB para despliegue, sin especificar el esquema) |
| Idiomas soportados | ruso (objetivo), inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se menciona compatibilidad con MNN y GGUF; no hay pesos publicados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 con 303M parámetros no-embedding y 361M totales, y un tokenizador byte-level BPE de 65.536 tokens con `<|endoftext|>` en el índice 65510. Se realiza un ajuste fino completo (sin LoRA) sobre el modelo base, con pesos maestros en fp32 y autocast fp16, ya que la T4 no dispone de bf16 utilizable. La longitud de secuencia es de 1024 tokens, con ventanas aleatorias sobre un flujo de tokens empaquetado en uint16 y `<|endoftext|>` entre documentos. El entrenamiento usa AdamW (β = 0.9, 0.95), weight decay 0.1, gradient clip 1.0, learning rate 2e-4 con 1% de warmup lineal y decaimiento coseno, 32.768 tokens por paso de optimizador (micro-batch 4 × 1024, acumulación de gradiente 8), una época sobre 1.2B tokens (36.621 pasos) y checkpoint cada 500 pasos con reanudación automática.

Los datos provienen exclusivamente de datasets públicos de Hugging Face: 0.90B tokens de ruso (fineweb-2, config rus_Cyrl, 75%), 0.204B de inglés (fineweb, sample-100BT, 17%) y 0.096B de chino (fineweb-2, config cmn_Hani, 8%). Se reservan los primeros 100k tokens de cada flujo como validación antes de empezar. La innovación técnica destacable es el análisis del coste del ruso en el tokenizador: el vocabulario base tiene casi ninguna fusión cirílica, de modo que "Спасибо" se tokeniza en 6 tokens y el ruso queda en 1,75–1,85 caracteres por token (≈3,3 tokens por palabra), frente a 4,2 caracteres por token de un BPE nativo ruso. Esto reduce el texto efectivo que cabe en el presupuesto de 1.2B tokens y multiplica los pasos de decodificación por palabra en móvil. Se descarta la cirugía de vocabulario en la v1 para mantener compatibilidad con el toolchain MNN/GGUF existente.

## Capacidades

- Continuación de texto y autocompletado de prefijos en ruso como capacidad principal.
- Generación de texto causal multilingüe en ruso, inglés y chino desde el mismo checkpoint.
- Sugerencia de siguiente palabra y frases cortas para teclados e IME.
- Finalización de texto en compositores de chat, aplicaciones de notas, campos de búsqueda y prompts de terminal.
- Etiquetado y generación de texto semilla en ruso.
- Lectura y generación en inglés y chino a nivel de mantenimiento (no se mejoran, solo se evita su degradación).
- No soporta tool calling ni function calling de forma nativa (no es un modelo de instrucciones).
- No está diseñado para razonamiento multi-paso ni para agentes.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Teclado predictivo e IME en dispositivo: el modelo sugiere la siguiente palabra o frases cortas en ruso con un presupuesto de ~200 MB cuantizado y latencia compatible con la escritura, seleccionando el idioma según la palabra actual o la distribución del teclado.
- Autocompletado en aplicaciones de notas y compositores de chat: continúa el prefijo escrito por el usuario en ruso sin necesidad de instrucciones, integrándose como LM causal en el campo de texto.
- Finalización de consultas en campos de búsqueda: completa prefijos parciales en ruso para sugerir términos de búsqueda, aprovechando que el modelo está entrenado sobre texto ruso crudo y no requiere formato de prompt.
- Prompts de terminal y asistentes de línea de comandos: sugiere continuaciones de comandos o texto en ruso en entornos locales donde no hay conectividad ni GPU dedicada.
- Etiquetado y generación de texto semilla en ruso: produce texto de arranque o etiquetas para pipelines de datos que necesitan un LM pequeño y fluido en ruso que además lea inglés y chino.
- Sugerencias de reescritura corta en ruso: al ser un modelo de continuación, puede emplearse para proponer reformulaciones breves de fragmentos de texto en aplicaciones de edición locales.
- Despliegue en dispositivos de borde sin conexión: cualquier pipeline que requiera un LM causal pequeño (~200 MB cuantizado) que funcione localmente en ruso, inglés y chino, sin depender de la nube.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo base sin ajustar (100k tokens reservados por idioma, medidos el 2026-11-09). Los resultados del modelo ajustado están pendientes.

| Idioma | PPL | Bits/carácter | Top-1 | Top-5 | Caracteres/token |
|---|---|---|---|---|---|
| Ruso | 10,42 | 1,625 | 46,2% | 69,3% | 2,08 |
| Inglés | 21,85 | 1,016 | 39,9% | 64,1% | 4,40 |
| Chino | 23,95 | 3,274 | 41,9% | 62,0% | 1,42 |

La puerta de aceptación del ajuste es una caída clara en bits/carácter en ruso con una regresión máxima de ~10% en bits/carácter en inglés y chino. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 361M parámetros; en fp16 requiere ~0,72 GB y en cuantización de 8 bits ~0,36 GB, sin contar overhead de activaciones y KV cache. La model card menciona un modelo cuantizado de ~200 MB para despliegue en dispositivo, lo que sugiere cuantización de 4 bits.
- GPU recomendadas: el entrenamiento se realizó en una única Colab T4 de 16 GB a 4,8k tokens/s durante ~69 h. Para inferencia, cualquier GPU consumer moderna es suficiente; una RTX 4090 o superior ofrece un margen amplio.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre en fp16, y en GPUs integradas o móviles con la versión cuantizada de ~200 MB.
- Opciones de despliegue: el modelo está pensado para el toolchain MNN y GGUF; la model card menciona compatibilidad con MNN/GGUF y la librería transformers. No se detallan opciones como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible para el modelo ajustado; el entrenamiento reporta 4,8k tokens/s en T4. La model card señala que una palabra rusa sugerida cuesta ~3 pasos de decodificación en lugar de ~1, lo que afecta al presupuesto de latencia del teclado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU | 361M totales (303M no-embedding) | no disponible (entrenado a 1024) | ru, en, zh | Apache 2.0 | Pesos no publicados (WIP) |
| taobao-mnn/MNN-Pocket-0.3B-Base | 361M totales (303M no-embedding) | no disponible | en, zh (base) | no disponible en la información | Público en Hugging Face |
| ruGPT3-small | no disponible | no disponible | ru | no disponible en la información | Público (referenciado en la model card) |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de rendimiento comparables entre ellos más allá de las métricas de tokenización (ruGPT3-small: 4,2 caracteres/token en ruso y ~1,3 tokens por palabra, frente a 1,75–1,85 y ~3,3 del tokenizador de MNN-Pocket).

## Limitaciones y advertencias

- Estado "work in progress": no hay pesos publicados en el repositorio; los checkpoints están en un repositorio privado y el entrenamiento está en el paso 1.340 de 36.621 (44M de 1.2B tokens).
- No es un modelo de instrucciones: no sigue instrucciones, no responde preguntas factuales, no genera código, no razona a largo plazo ni traduce; está entrenado como LM causal para continuar prefijos.
- Conocimiento estrecho por construcción: 0,36B parámetros entrenados con 1.2B tokens.
- Tokenizador ineficiente para ruso: ~3,3 tokens por palabra y 1,75–1,85 caracteres por token, lo que encarece el entrenamiento y multiplica los pasos de decodificación en móvil.
- Riesgo de alucinación: inherente a un LM causal pequeño entrenado sobre texto web; no apto para producción que requiera precisión factual.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; los datos provienen de FineWeb y FineWeb-2 (ODC-BY 1.0), sin corpus de chat sin licencia.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial, pero al ser un modelo derivado del base conviene verificar la licencia del modelo base taobao-mnn/MNN-Pocket-0.3B-Base (no disponible en la información).
- Limitaciones de idioma: el inglés y el chino se mantienen con una mezcla de repetición del 25%, no se mejoran; el objetivo es el ruso.
- Caveat de producción: la puerta de aceptación (caída clara en bits/carácter en ruso con regresión máxima del ~10% en inglés y chino) aún no se ha verificado con los resultados del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Repositorio privado de checkpoints (no accesible): Rahspide/mnn-pocket-ru-run
