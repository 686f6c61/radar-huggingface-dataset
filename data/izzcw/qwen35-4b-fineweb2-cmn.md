# izzcw/qwen35-4b-fineweb2-cmn

## Resumen

qwen35-4b-fineweb2-cmn es un modelo de lenguaje base de aproximadamente 4.960 millones de parámetros entrenado desde cero (inicialización aleatoria) por el autor independiente izzcw. No es un ajuste fino de Qwen3.5: reutiliza únicamente la arquitectura del modelo de texto Qwen3.5-4B y su tokenizador, pero todos los pesos se han entrenado sobre texto web en mandarín extraído de FineWeb-2 (subconjunto `cmn_Hani`). El resultado es un modelo de continuación de texto que reproduce fielmente el estilo, el ruido y las plantillas del corpus web chino con el que fue entrenado.

La arquitectura es un transformer híbrido de 32 capas que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas de atención con compuerta en proporción 3:1, con embeddings atados y una capa MTP (multi-token prediction) que `transformers` no utiliza durante la generación. El entrenamiento consumió 85.000 millones de tokens en una sola época, aproximadamente la ratio óptima de Chinchilla (20 tokens por parámetro), sobre 8 GPU NVIDIA B300 con Megatron-Bridge.

Su relevancia es doble: por un lado, es un ejemplo reproducible de entrenamiento desde cero de una arquitectura reciente a escala 4B con un presupuesto de cómputo contenido; por otro, sirve como referencia para estudiar el ajuste de modelos a dominios concretos (en este caso, web en chino) y para comparar curvas de pérdida frente a modelos entrenados con datos mucho más filtrados. No está pensado para uso en producción como asistente: es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5-4B text: 32 capas (3 Gated DeltaNet : 1 gated attention), hidden 2560, FFN 9216, embeddings atados, 1 capa MTP |
| Parametros totales | 4.961.394.688 (~4,96B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Chino (zh), concretamente mandarín escrito en Hanzi |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento FineWeb-2 bajo ODC-By 1.0 y sujetos a los términos de CommonCrawl |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de texto de Qwen3.5-4B: 32 capas organizadas en bloques de cuatro, donde tres son capas Gated DeltaNet (una forma de atención lineal con estado recurrente y compuerta) y una es atención con compuerta convencional. La dimensión oculta es 2560 y la dimensión de la FFN es 9216, con embeddings de entrada y salida atados. Incorpora además una capa de multi-token prediction (MTP) que no se emplea en la generación con `transformers`. El tokenizador es el de Qwen3.5, con un vocabulario de 248.320 tokens, y los documentos se separan con el token `<|endoftext|>`.

El entrenamiento se realizó desde cero sobre 55 de los 370 shards de entrenamiento del subconjunto `cmn_Hani` de FineWeb-2, lo que supone aproximadamente 89.500 millones de tokens disponibles, de los cuales se consumieron 85.000 millones en una única época. El lote fue de 512 secuencias de 4.096 tokens (2,1 millones de tokens por paso) durante 40.532 pasos, con AdamW, tasa de aprendizaje de 3e-4 con decaimiento coseno hasta 3e-5, 2.000 pasos de calentamiento, weight decay 0,1, recorte de gradiente 1,0 y precisión bf16. El cómputo se ejecutó en 8 GPU NVIDIA B300 con Megatron-Bridge 0.7.1 y Megatron-Core 0.20.1 (contenedor NeMo 26.10). No hubo filtrado de datos más allá del propio de FineWeb-2, ni RLHF, DPO ni ningún ajuste posterior.

## Capacidades

- Generación y continuación de texto en chino mandarín, con especial fidelidad al registro de la web china: prosa, artículos, foros, ficción web y también spam, anuncios y texto plantilla.
- Modelado de lenguaje puro: no dispone de modo de razonamiento, cadena de pensamiento ni capacidades de agente.
- Sin soporte de tool calling ni function calling: es un modelo base sin ajuste por instrucciones.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al chino: el tokenizador es multilingüe, pero los pesos solo han visto datos en mandarín, por lo que el rendimiento en otros idiomas no está respaldado por el entrenamiento.
- Capacidad de autocompletado y predicción de siguiente token útil para evaluación de modelos de lenguaje y para experimentos de ajuste posterior.

## Casos de uso

- Estudio de entrenamiento desde cero: sirve como referencia reproducible para investigar el efecto del volumen de datos, la arquitectura híbrida DeltaNet/atención y las curvas de pérdida en un presupuesto de cómputo acotado (8 GPU B300, 85.000 millones de tokens).
- Punto de partida para ajuste fino en chino: al ser un modelo base con licencia Apache-2.0, puede usarse como inicialización para SFT o DPO en tareas concretas de procesamiento de lenguaje natural en mandarín, partiendo de un modelo que ya ha visto 85.000 millones de tokens de ese idioma.
- Investigación sobre calidad de datos: permite comparar cómo un modelo entrenado con datos web sin filtrar modela el ruido (spam, plantillas, duplicados) frente a modelos entrenados con corpus curados, usando la perplejidad por tipo de documento como métrica.
- Generación de texto de estilo web para experimentos: útil para reproducir la distribución de la web china en tareas de data augmentation o para estudiar sesgos y artefactos del corpus FineWeb-2.
- Evaluación de arquitecturas híbridas: al reutilizar la arquitectura Qwen3.5-4B con pesos propios, permite aislar el efecto de los datos frente al de la arquitectura en comparaciones controladas con Qwen3.5-4B-Base.
- Docencia y divulgación: ejemplo práctico y documentado de un pipeline completo de preentrenamiento con Megatron-Bridge, desde la tokenización hasta la evaluación de pérdida en un shard reservado.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas downstream (MMLU, HumanEval, GSM8K, etc.). La única evaluación disponible es la entropía cruzada media por token (nats/token, menor es mejor) sobre el shard `000_00001` de FineWeb-2 `cmn_Hani`, no usado en entrenamiento, con conjuntos de 48 × 4.096 tokens:

| Conjunto de evaluacion | Este modelo | Qwen3.5-4B-Base |
|---|---|---|
| Documentos aleatorios del shard | 2,623 | 3,475 |
| Primeros documentos del shard | 3,230 | 3,183 |
| Último 0,2% de documentos del shard | 1,771 | 4,292 |

La pérdida de validación reportada por Megatron al final del entrenamiento fue 2,377, pero corresponde al último 0,2% de documentos de cada shard de entrenamiento; dado que los shards de FineWeb-2 no están barajados uniformemente (los documentos de clústeres casi duplicados van primero y los únicos al final), esa cifra es optimista. El dato representativo es el de documentos aleatorios. El autor advierte explícitamente que un menor loss en texto web chino sin filtrar no implica un mejor modelo general: Qwen3.5-4B-Base, entrenado con datos mucho más filtrados, es claramente superior en tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 10 GB solo para pesos (4,96B parámetros × 2 bytes), más activaciones y caché KV; con contexto de 4.096 tokens y lote 1, un presupuesto práctico de 12-16 GB es razonable.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos; en 4 bits, en torno a 3 GB de pesos. Estas cuantizaciones no están publicadas por el autor y requerirían conversión propia (por ejemplo, a GGUF).
- GPU recomendadas: A100, H100 o B300 para entrenamiento e inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto completo.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16 (RTX 4080, 4090, 3090, 5080) y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: `transformers` (requiere una versión con soporte de Qwen3.5), vLLM y TGI si incorporan soporte para la arquitectura híbrida Qwen3.5; llama.cpp y Ollama solo tras convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-4b-fineweb2-cmn | ~4,96B | 4.096 | Desde cero, 85B tokens de web china (FineWeb-2) | Apache-2.0 | Hugging Face (transformers) |
| Qwen3.5-4B-Base | ~4B (arquitectura idéntica) | No disponible en la información proporcionada | Datos propios de Qwen, mucho más filtrados | No disponible en la información proporcionada | Pesos oficiales de Qwen |
| Alternativas de ~4B entrenadas desde cero en chino | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con Qwen3.5-4B-Base, ya que comparten arquitectura y tokenizador y solo difieren en los datos y el cómputo de entrenamiento. En pérdida sobre texto web chino sin filtrar, este modelo obtiene 2,623 frente a 3,475 de Qwen3.5-4B-Base en documentos aleatorios del shard de evaluación; sin embargo, el autor señala que Qwen3.5 es mucho más fuerte en tareas downstream. No se dispone de datos de benchmarks de tareas para establecer comparaciones adicionales con otros modelos de 4B.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato conversacional fiable y no debe usarse como asistente sin un ajuste posterior.
- Sin alineamiento de seguridad: no ha pasado por RLHF, DPO ni filtros de contenido; puede generar contenido ofensivo, spam o desinformación presente en la web china.
- Riesgo alto de reproducir ruido del corpus: al no haber filtrado más allá de FineWeb-2, el modelo continúa texto con anuncios, plantillas y texto duplicado propios de la web.
- Alucinación: como todo modelo de lenguaje, puede generar afirmaciones falsas con fluidez; el riesgo aumenta al estar entrenado sobre datos sin verificar.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida al chino: el rendimiento en castellano u otros idiomas no está respaldado por el entrenamiento y será deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre web china sin filtrar, es esperable que herede los sesgos de ese corpus.
- Licencia: los pesos son Apache-2.0 y permiten uso comercial, pero los datos de entrenamiento (FineWeb-2) están bajo ODC-By 1.0 y sujetos a los términos de uso de CommonCrawl, lo que conviene revisar antes de un uso comercial.
- Requiere una versión de `transformers` con soporte de Qwen3.5; la capa MTP no se usa en la generación estándar.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), por lo que no hay evidencia externa de su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izzcw/qwen35-4b-fineweb2-cmn
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Megatron-Bridge: no disponible en la información proporcionada
- Megatron-Core: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
