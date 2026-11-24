# somdevsheel/kaggle-llm-124m-base

## Resumen

prajna-ai-124m-base (publicado originalmente como `kaggle-llm-124m-base`) es un modelo de lenguaje de 123,6 millones de parametros entrenado desde cero por el desarrollador independiente somdevsheel. Es un transformer decoder-only de estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin biases y embeddings atados) con 12 capas, dimension oculta 768, 12 cabezas de atencion y FFN de 2048. El modelo se entreno integramente en GPUs gratuitas de Kaggle (2x NVIDIA T4) en fp16 con DDP, lo que lo convierte en un ejemplo de referencia de preentrenamiento de bajo presupuesto.

El modelo se entreno en tres etapas: 1,92B tokens de FineWeb-Edu (muestra sample-10BT, sin repeticion de tokens), un segundo tramo de preentrenamiento continuado sobre datos no vistos y una fase final de extension de contexto de 1024 a 4096 tokens con 580M tokens de un corpus en ingles centrado en la India (Sangraha filtrado, Wikipedia en ingles sobre la India y archivos no vistos de FineWeb-Edu). El resultado es un modelo de completado de texto, no de chat, con licencia Apache 2.0 y solo ingles.

Su relevancia es doble: por un lado demuestra que es posible reproducir un pipeline completo de preentrenamiento (tokenizer, schedules ajustados a limites de sesion de 12 horas, extension de contexto con ajuste de RoPE theta) con hardware consumer; por otro, sirve como base para la version de instrucciones `prajna-ai-124m-chat` del mismo autor y como punto de partida para experimentos academicos de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin biases, embeddings atados) |
| Parametros totales | 123.587.328 (85,0M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (RoPE theta 100.000; version previa de 1024 tokens en revision `13f120f`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repositorio de 0,7 GB |

Detalles adicionales de forma: 12 capas, hidden 768, 12 cabezas, FFN 2048, tokenizer GPT-2 BPE con vocabulario ampliado a 50.304.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de estilo LLaMA con 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y FFN de 2048 con activacion SwiGLU. Usa RMSNorm en pre-norm, RoPE con theta 10.000 en las etapas iniciales y 100.000 tras la extension de contexto, sin terminos de bias y con embeddings de entrada y salida atados. El tokenizer es GPT-2 BPE con el vocabulario rellenado hasta 50.304 entradas.

El entrenamiento se realizo en tres fases sobre 2x NVIDIA T4 con PyTorch DDP, precision mixta fp16 con loss scaling y AdamW (beta 0,9/0,95, weight decay 0,1). La fase 1 consumio 1,92B tokens de FineWeb-Edu (sample-10BT) sin repeticion, en 1.865 pasos de 524.288 tokens con LR pico 1,2e-3, warmup de 200 pasos y decaimiento coseno hasta el 10 %, alcanzando una loss de validacion de 3,43. La fase 2 continuo el preentrenamiento 1.796 pasos mas sobre datos no vistos con LR pico 6e-4 y un schedule coseno nuevo, bajando la loss a 3,30. Los schedules se ajustaron cronometrando los primeros pasos para encajar en el limite de sesion de 12 horas de Kaggle.

La fase 3 extendio el contexto de 1024 a 4096 tokens subiendo RoPE theta a 100.000 y entreno 2.211 pasos de 262.144 tokens (580M tokens en total) sobre un corpus en ingles centrado en la India: Sangraha en ingles filtrado por tematica india (260M tokens), articulos de Wikipedia en ingles relacionados con la India (100M) y archivos no vistos de FineWeb-Edu (247M) para limitar el olvido. La loss en texto general a 1024 tokens subio ligeramente (3,26 a 3,31) a cambio de manejar contextos de 4K y mejorar notablemente en tematica india (loss de 2,82 a 2,76 a 4096 tokens).

## Capacidades

- Generacion de texto autoregresiva y completado de texto en ingles; no es un modelo de chat ni sigue instrucciones en esta version base.
- Razonamiento y conocimiento del mundo limitados: con unos 20 tokens por parametro, el conocimiento factual es escaso y propenso a errores fluidos.
- Manejo de contextos de hasta 4096 tokens, util para completar documentos o mantener coherencia en pasajes largos.
- Mejora especifica en contenido en ingles sobre la India (cultura, geografia, entidades y tematica regional) gracias a la fase 3.
- Capacidad de continuacion de codigo o texto tecnico solo en la medida en que aparezca en FineWeb-Edu; no hay entrenamiento especifico de codigo.
- Sin soporte documentado de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Multilingue: no; solo ingles.

## Casos de uso

- Completado de texto y autocompletado en editores: el modelo puede continuar frases o parrafos en ingles con 4096 tokens de contexto, adecuado para prototipos de asistencia de escritura donde no se requiere un modelo de chat.
- Generacion de datos sinteticos para aumentar corpus: sirve para producir texto de dominio general o tematica india que luego se filtra y se usa en experimentos de destilacion o aumentacion de datos.
- Investigacion academica sobre preentrenamiento de bajo presupuesto: es una base reproducible (Apache 2.0) para estudiar schedules, extension de contexto con RoPE theta y efectos del preentrenamiento continuado en GPUs T4.
- Fine-tuning ligero para tareas de clasificacion o generacion especifica: con 123,6M de parametros cabe en una sola GPU consumer y permite ajustar clasificadores de texto, etiquetado o resumen extractivo con pocos recursos.
- Base para modelos de instrucciones: el propio autor lo usa como punto de partida de `prajna-ai-124m-chat`, por lo que es un candidato natural para experimentos de SFT y DPO a pequeña escala.
- Prototipado de pipelines de inferencia: por su tamaño reducido (0,7 GB en safetensors) es util para validar integraciones con transformers, TGI o endpoints compatibles antes de escalar a modelos mayores.
- Demos educativas de tokenizacion y generacion: permite ilustrar el funcionamiento de un LLM completo en cursos o talleres sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta losses de validacion:

| Metrica | Contexto 1024 | Contexto 4096 |
|---|---|---|
| Loss de validacion, FineWeb-Edu (general) | 3,31 (antes de la extension: 3,26) | 3,25 (antes de la extension: 5,02) |
| Loss de validacion, ingles centrado en la India | 2,82 (antes: 3,59) | 2,76 (antes: 5,11) |

Evolucion de la loss de validacion durante el entrenamiento:

| Paso | 0 | 250 | 500 | 1000 | 1500 | 1864 | 2865 | 3365 | 3661 |
|---|---|---|---|---|---|---|---|---|---|
| Loss de validacion | 10,97 | 4,88 | 4,05 | 3,65 | 3,48 | 3,43 | 3,38 | 3,32 | 3,30 |

Los pasos posteriores a 1864 corresponden al preentrenamiento continuado; la loss sube brevemente (3,48 en el paso 2115) al reiniciarse el LR y despues cae por debajo de la fase 1.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 0,25 GB; con overhead de activaciones y cache KV para 4096 tokens, el consumo se mantiene por debajo de 2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entreno en 2x NVIDIA T4, y el modelo funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no publicada oficialmente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamaño (123,6M de parametros) se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| prajna-ai-124m-base | 123,6M | 4096 | Apache 2.0 | en | Preentrenado desde cero en 2x T4; base, no chat |
| GPT-2 small | 124M | 1024 | MIT | en | Referencia clasica de mismo tamaño; sin entrenamiento reciente ni contexto extendido |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | en | Entrenado por Hugging Face con mas tokens y pipeline mas pulido; contexto menor |
| Pythia-160m | 160M | 2048 | Apache 2.0 | en | Suite de investigacion con checkpoints intermedios; ligeramente mayor |

La comparacion con GPT-2 small, SmolLM-135M y Pythia-160m es por categoria (modelos densos de ~100-200M parametros). No hay benchmarks publicados de prajna-ai-124m-base que permitan comparar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Conocimiento del mundo limitado: se entreno con unos 20 tokens por parametro, en el limite de lo compute-optimal, por lo que produce con frecuencia afirmaciones fluidas pero incorrectas.
- Riesgo alto de alucinacion en preguntas factuales; no debe usarse como fuente de verdad sin verificacion.
- Solo ingles; no soporta castellano ni otros idiomas de forma fiable.
- No es un modelo de chat: no sigue instrucciones ni mantiene formato conversacional; para ello existe la variante `prajna-ai-124m-chat`.
- Sin filtrado de seguridad mas alla del propio de los datasets de origen (FineWeb-Edu, Sangraha, Wikipedia); puede generar contenido sesgado o inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de evaluaciones de sesgo hace recomendable una evaluacion propia antes de produccion.
- El contexto de 4096 tokens se obtuvo con solo 580M tokens de entrenamiento de extension; la calidad en el extremo superior de la ventana puede degradarse frente a modelos entrenados nativamente a esa longitud.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas como Ollama o llama.cpp sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/kaggle-llm-124m-base
- Version de chat: https://huggingface.co/somdevsheel/prajna-ai-124m-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
