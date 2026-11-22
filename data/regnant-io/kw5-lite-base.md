# regnant-io/kw5-lite-base

## Resumen

kw5-lite-base (publicado tambien como KW5 109M) es un modelo de lenguaje base de 109,5 millones de parametros entrenado desde cero especificamente para swahili (kiswahili) por Regnant, una organizacion centrada en modelos para lenguas africanas de bajos recursos. Es un transformer decoder-only compatible con Llama, con 12 capas, dimension oculta de 768, FFN de 2048 y atencion multi-head estandar (12 cabezas de consulta y 12 de clave-valor, sin GQA). Se entreno sobre 1.410 millones de tokens procedentes de FineWeb-2 `swh_Latn`, limpiado y deduplicado, en una unica NVIDIA T4 durante unas 60 horas de GPU.

El modelo resuelve un problema concreto: la practica ausencia de modelos fundacionales abiertos y ligeros para swahili, una lengua con cientos de millones de hablantes pero con poquisimos recursos de modelado publicos. kw5-lite-base ofrece una base entrenada nativamente en swahili (tokenizador BPE propio de 32.000 unidades) que sirve como punto de partida para experimentos y fine-tuning, no como modelo listo para produccion. Su sucesor recomendado por el propio autor es kw5-149M.

Es relevante ahora por su honestidad tecnica y por documentar con precision sus carencias: el autor declara explicitamente que el learning rate nunca se decayo, que no hubo conjunto de validacion, que el contexto real de entrenamiento es de 1.024 tokens (aunque la config permite 2.048) y que los resultados en benchmarks estan dentro del intervalo de azar. La unica habilidad real medida es la continuacion fluida de texto en swahili.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama (RMSNorm pre-norm, SwiGLU, RoPE theta 10.000) |
| Parametros totales | 109.529.856 (embeddings de entrada y salida atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens entrenados; `max_position_embeddings` configurado a 2.048 pero no entrenado mas alla de 1.024 |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Swahili (kiswahili), `sw` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, FP32), tokenizer SentencePiece (`tokenizer.model`) y fast tokenizer (`tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas con hidden size 768, FFN de 2048, 12 cabezas de atencion de consulta y 12 de clave-valor (atencion multi-head clasica, sin grouped-query attention), normalizacion RMSNorm en pre-norm, activacion SwiGLU y codificacion posicional RoPE con theta 10.000. El vocabulario es un BPE SentencePiece de 32.000 unidades entrenado desde cero sobre el corpus deduplicado, con normalizacion NFC, separacion de digitos y byte fallback; los ids 4 a 6 (`<|system|>`, `<|user|>`, `<|assistant|>`) estan reservados pero nunca aparecen en el corpus de preentrenamiento, por lo que sus filas de embedding no estan entrenadas.

El entrenamiento uso FineWeb-2 `swh_Latn` limpiado y deduplicado (exacta y MinHash LSH), aproximadamente 705 millones de tokens unicos, con dos pasadas para totalizar 1.410 millones de tokens vistos hasta el checkpoint 6.150. Se uso precision mixta FP16 con GradScaler, optimizador 8-bit AdamW con learning rate 3e-4, weight decay 0,1 y grad clip 1,0, bajo un schedule Warmup-Stable-Decay que se detuvo en la fase estable. El empaquetado concatenaba documentos sin mascara de atencion en los limites, de modo que el modelo aprendio a atender a traves de documentos no relacionados dentro de una misma secuencia. El learning rate nunca se decayo: el presupuesto de tokens se fijo en 8.000 millones a partir de una estimacion del tamano del corpus que resulto ser unas cuatro veces superior a la real, por lo que la fase de decaimiento nunca llego a ejecutarse. No hubo conjunto de validacion reservado.

## Capacidades

- Generacion de texto en swahili: continuacion de prefijos con fluidez gramatical y lexica notable para su tamano.
- Prediccion del siguiente token exclusivamente: es un modelo base, no sigue instrucciones ni responde preguntas.
- Tokenizacion nativa de swahili: BPE de 32.000 unidades entrenado sobre el corpus, lo que reduce la fragmentacion respecto a tokenizadores multilingues genericos.
- Manejo de texto con digitos y caracteres desconocidos: separacion de digitos y byte fallback en el tokenizador.
- Punto de partida para fine-tuning: puede adaptarse a tareas supervisadas (clasificacion, extraccion, generacion condicionada) con relativamente pocos datos.
- Sin soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; el modelo esta entrenado solo en swahili.

## Casos de uso

- Investigacion sobre modelos de bajos recursos: servir como linea base reproducible (109,5 M de parametros, 1,41 B de tokens, 60 horas de T4) para estudiar el efecto de tecnicas de entrenamiento en lenguas de bajos recursos sin necesidad de infraestructura grande.
- Fine-tuning supervisado para tareas especificas del swahili: clasificacion de texto, etiquetado, extraccion de entidades o analisis de sentimiento, aprovechando que la base ya modela morfologia y sintaxis del idioma.
- Generacion aumentada por recuperacion (RAG) en swahili: usar el modelo como generador de continuaciones condicionadas por contexto recuperado, manteniendo prompt y salida por debajo de 1.024 tokens.
- Completado de texto asistido en entornos de redaccion en swahili: sugerencias de continuacion a nivel de frase, con supervision humana obligatoria por la baja fiabilidad factica.
- Destilacion y experimentacion de arquitecturas: al ser compatible con Llama, puede usarse como alumno en destilacion desde modelos mayores o como banco de pruebas para tecnicas de decodificacion especulativa.
- Educacion y prototipado: demostraciones de modelado de lenguaje en swahili en cursos y talleres, con coste de computo minimo (cabe en una T4 o incluso en CPU para inferencia puntual).
- Generacion de datos sinteticos en swahili: producir texto de continuacion para aumentar corpus de entrenamiento de otros sistemas, filtrando posteriormente por calidad.

## Benchmarks y rendimiento

Evaluacion por verosimilitud en eleccion multiple, n = 50 por tarea:

| Tarea | Precision | Intervalo de confianza 95% | Azar |
|---|---:|---:|---:|
| Belebele-sw (4 opciones) | 32% | 21 a 46 | 25% |
| AfriXNLI-sw (3 opciones) | 32% | 21 a 46 | 33% |

Ambos resultados son consistentes con el azar; con 50 elementos la medida constituye un suelo, no una capacidad demostrada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

Perdida medida por posicion en 12 documentos largos en swahili:

| Posiciones | 0-511 | 512-1023 | 1024-1535 | 1536-2047 |
|---|---:|---:|---:|---:|
| Perdida (nats) | 4,12 | 4,08 | 4,45 | 5,92 |

## Requisitos de hardware

- VRAM estimada: con pesos FP32 (unos 438 MB) la inferencia completa requiere menos de 1 GB de VRAM; en FP16 serian unos 219 MB y en cuantizaciones de 8 o 4 bits, decenas de megabytes.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo se entreno en una NVIDIA T4 y funciona sobradamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas, y tambien en CPU para inferencia puntual (el ejemplo de la model card se ejecuta en CPU).
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requeririan conversion previa de los pesos, no documentada en la informacion disponible.
- Latencia y throughput: no disponible; no se publican medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---|---|---|---|
| kw5-lite-base (este modelo) | 109,5 M | 1.024 entrenados (2.048 configurados) | sw | Apache 2.0 | Base, sin instruction tuning; benchmarks al nivel del azar |
| kw5-149M | 149 M (segun denominacion) | no disponible | sw | no disponible | Sucesor recomendado por el autor para nuevos trabajos |
| kw5-109M-instruct | 109,5 M | no disponible | sw | no disponible | Version con instruction tuning del mismo modelo base |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo continua texto; no responde preguntas ni sigue instrucciones. No debe usarse como asistente conversacional sin fine-tuning.
- Fiabilidad factica muy baja: el propio autor documenta que el modelo genera afirmaciones fluidas pero falsas (por ejemplo, paises que no limitan con Tanzania).
- Contexto efectivo limitado a 1.024 tokens; mas alla, la perdida se dispara (5,92 nats en posiciones 1.536-2.047). Mantener prompt y salida por debajo de 1.024 tokens.
- Sesgos derivados del texto web en swahili, mayoritariamente de Tanzania; no hay mitigacion ni ajuste de seguridad de ningun tipo.
- El learning rate nunca se decayo y no hubo conjunto de validacion: el modelo esta infraentrenado respecto a lo que seria esperable con el mismo presupuesto.
- El empaquetado sin mascara de documento ensena al modelo a atender entre documentos no relacionados, lo que puede producir continuaciones que mezclan temas.
- Los tokens especiales de rol (`<|system|>`, `<|user|>`, `<|assistant|>`) tienen embeddings sin entrenar; si se usan como marcadores en fine-tuning hay que entrenar tambien `embed_tokens`.
- No se requiere `<s>` al inicio; el preentrenamiento no uso BOS inicial y anadirlo cambia la perdida en solo 0,009 nats sobre texto retenido.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara explicitamente que el modelo no es apto para despliegue en produccion.
- No hay datos publicados de latencia, throughput ni cuantizaciones disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/regnant-io/kw5-lite-base
- Sucesor recomendado: https://huggingface.co/regnant-io/kw5-149M
- Version instruction-tuned: https://huggingface.co/regnant-io/kw5-109M-instruct
- Sitio del autor (Regnant): https://www.regnant.io/
- Dataset de entrenamiento (FineWeb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
