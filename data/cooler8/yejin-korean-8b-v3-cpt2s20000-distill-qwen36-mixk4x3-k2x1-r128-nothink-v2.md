# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK4x3-K2x1-r128-nothink-v2

## Resumen

Yejin Korean 8B v3 (variante distill-qwen36-mixK4x3-K2x1-r128-nothink-v2) es un modelo de lenguaje de 7.241.740.288 parametros orientado a generacion de texto conversacional e instrucciones en coreano. Lo desarrolla el usuario independiente cooler8 y se distribuye bajo licencia Apache 2.0. Se construye sobre `cooler8/yejin-korean-8b-v3-base`, un checkpoint que ya habia pasado por 20.000 pasos de preentrenamiento continuado (Stage-2 continual pre-training) sobre texto en coreano.

El modelo parte de la familia arquitectonica Qwen3 (tag `qwen3` en Hugging Face) y se especializa mediante un ajuste fino con LoRA de rango 128 y alpha 256 sobre una mezcla de instrucciones en coreano: conocimiento general (Stage-K4), razonamiento narrativo multi-paso y razonamiento causal de sentido comun complejo (Com2). El conjunto de instrucciones fue decontaminado por 13-gramas, con solapamiento cero frente a las 13 benchmarks de evaluacion declaradas.

Su relevancia es acotada pero concreta: cubre el nicho de modelos conversacionales en coreano de tamano 7-8B con licencia permisiva, un segmento con menos oferta que el ingles. La variante "nothink" desactiva el modo de razonamiento extendido: la plantilla de chat inyecta un bloque `<think> </think>` vacio antes de la respuesta, de modo que el modelo responde directamente sin cadena de pensamiento visible. El repositorio ocupa 29,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (según tag `qwen3`; detalles internos no disponibles) |
| Parametros totales | 7.241.740.288 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,0 GB; dtype recomendado bfloat16) |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que el modelo pertenece a la familia Qwen3, es decir, un transformer decoder-only con atencion causal. No se publican detalles sobre numero de capas, dimensiones ocultas, tipo de atencion (completa o hibrida), vocabulario ni funcion de activacion. Con 7.241.740.288 parametros, se situa en la franja de 7-8B densos.

El entrenamiento se articula en dos fases documentadas. Primero, un preentrenamiento continuado (Stage-2 CPT) de 20.000 pasos sobre texto coreano que produce el checkpoint base `cooler8/yejin-korean-8b-v3-base`. Segundo, un ajuste fino supervisado con LoRA de rango 128 y alpha 256 sobre una mezcla de instrucciones en coreano compuesta por tres bloques: conocimiento general (Stage-K4), razonamiento narrativo multi-paso y razonamiento causal de sentido comun complejo (Com2). Las explicaciones de razonamiento a nivel de secuencia se generaron con `Qwen/Qwen3.6-27B` (Apache 2.0) y se sometieron a verificacion de respuestas, un esquema de destilacion de datos sinteticos. El conjunto se decontamino por 13-gramas con solapamiento cero frente a las 13 benchmarks de evaluacion declaradas. No se menciona RLHF, DPO ni ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en coreano con formato de chat definido por plantilla (`<|user|>` / `<|assistant|>` / `<|end|>`).
- Seguimiento de instrucciones en coreano, entrenado explicitamente sobre mezclas de instrucciones.
- Razonamiento narrativo multi-paso y razonamiento causal de sentido comun (dataset Com2), segun la model card.
- Respuesta directa sin cadena de pensamiento visible: la variante "nothink" inyecta `<think> </think>` vacio en la plantilla.
- Conocimiento general en coreano adquirido en la fase de preentrenamiento continuado.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible (no se documenta).
- Capacidades multilingues: limitadas al coreano segun el campo `language: ko`; no se declara soporte de otros idiomas.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo acepta una plantilla de chat estandar y responde de forma directa sin bloque de pensamiento, lo que simplifica el parseo de la salida en un backend de atencion al cliente orientado a usuarios coreanohablantes.
- Generacion de respuestas de soporte de primer nivel: con entrenamiento sobre instrucciones de conocimiento general en coreano, puede redactar respuestas FAQ y guiones de atencion sobre productos o servicios para mercados de Corea del Sur.
- Prototipado rapido de aplicaciones NLP en coreano: al ser un modelo de 7,2B con licencia Apache 2.0 y pesos safetensors, se integra con `transformers` en bfloat16 sin restricciones comerciales, lo que facilita pilotos internos.
- Generacion de explicaciones narrativas: el ajuste sobre razonamiento narrativo multi-paso permite producir resumenes y explicaciones encadenadas de eventos o procedimientos en coreano.
- Tareas de razonamiento de sentido comun en coreano: el entrenamiento sobre Com2 lo hace util para responder preguntas causales cotidianas (por que ocurre algo, que consecuencia tiene una accion) en entornos educativos o de evaluacion.
- Ajuste fino posterior (fine-tuning) especifico de dominio: su tamano de 7,2B y licencia permisiva permiten reentrenar con LoRA sobre datos propios de un vertical (legal, sanitario, e-commerce) sin coste de licencia.
- Base para experimentacion academica en coreano: sirve como punto de partida para estudiar destilacion de datos sinteticos desde modelos mayores, dado que su mezcla de instrucciones se genero con Qwen3.6-27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el conjunto de instrucciones presenta solapamiento cero de 13-gramas frente a 13 benchmarks de evaluacion, pero no reporta las puntuaciones obtenidas en ninguno de ellos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo para pesos (7,24B x 2 bytes), mas cache KV y activaciones; en la practica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4,5-5 GB. Estas cifras son estimaciones por tamano, ya que el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o RTX A6000 para despliegue en bfloat16 con contexto largo y concurrencia. Una RTX 4090 (24 GB) es suficiente para bfloat16 en un solo flujo.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) requeriria cuantizacion a 8 o 4 bits, no publicada por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `torch_dtype="bfloat16"` es la via documentada. vLLM, TGI, llama.cpp u Ollama no estan verificados para este checkpoint en la informacion disponible; requeririan conversion previa a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| yejin-korean-8b-v3 distill (este modelo) | 7,24B | no disponible | ko | Apache 2.0 | Ajuste LoRA sobre base con CPT en coreano; sin benchmarks publicados |
| Qwen3 8B | ~8B | no disponible en esta ficha | multilingue | Apache 2.0 | Modelo de referencia de la misma familia arquitectonica; cobertura multilingue mas amplia |
| Llama 3.1 8B | 8,03B | 128K (dato publico del modelo original) | multilingue | Llama 3.1 Community License | Requiere cumplir la politica de uso de Meta; no especifico de coreano |
| EXAONE 3.5 7.8B (LG AI Research) | 7,8B | 32K (dato publico del modelo original) | ko/en | EXAONE AI Model License (uso comercial con condiciones) | Especializado en coreano, pero con licencia no totalmente permisiva |

La comparacion es orientativa: para este checkpoint no se dispone de benchmarks que permitan contrastar calidad frente a estas alternativas. La ventaja diferencial de este modelo es la combinacion de licencia Apache 2.0 con especializacion en coreano; su desventaja es la ausencia total de evaluacion publicada y de cuantizaciones listas para usar.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna metrica publicada de MMLU, HumanEval, GSM8K ni de evaluaciones en coreano, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: es un modelo de 7,2B ajustado con datos sinteticos generados por otro modelo (Qwen3.6-27B); los errores del generador pueden haberse transferido al ajuste, y no se documenta ninguna fase de alineacion con RLHF o DPO.
- Sesgos: no se documenta analisis de sesgos, toxicidad ni filtrado del corpus de preentrenamiento en coreano.
- Alcance idiomatico restringido: el campo `language` solo declara coreano; el rendimiento en castellano, ingles u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto desconocido: al no publicarse la longitud de contexto, no se debe asumir una ventana larga en produccion sin verificacion empirica.
- Formato de chat propietario: la plantilla usa tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`; integrarla mal produce degradacion silenciosa de la calidad.
- Modo "nothink" fijado: la plantilla inyecta un bloque de pensamiento vacio; no se debe esperar razonamiento extendido tipo chain-of-thought de esta variante.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, autor individual y sin documentacion de soporte; no es un artefacto con garantias de mantenimiento.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar por su cuenta el cumplimiento de las licencias de los datos de entrenamiento, que no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK4x3-K2x1-r128-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Modelo generador de datos de destilacion (Qwen3.6-27B): https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog o demo adicionales: no disponible
