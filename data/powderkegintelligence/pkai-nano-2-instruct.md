# PowderKegIntelligence/PKaI-Nano-2-Instruct

## Resumen

PKaI Nano 2 Instruct es la variante afinada para instrucciones del modelo base PKaI Nano 2, desarrollado por PowderKeg Intelligence. Se trata de un transformer decoder-only de aproximadamente 842 millones de parametros (792.429.696 segun la model card, 841.581.696 segun los pesos en safetensors), con 30 capas, 16 cabezas de atencion, 4 cabezas KV (GQA) y una dimension de embedding de 1536. Su ventana de contexto es de 2048 tokens.

El modelo resuelve el problema de disponer de un checkpoint conversacional pequeno, entrenado sobre un mix sintetico multi-turno (`HuggingFaceTB/smol-smoltalk`) y empaquetado con un formato de chat propio, `pkai-chat-v1`. Es relevante por dos motivos: es el primer modelo con ajuste de instrucciones de la serie Nano y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su inspeccion.

Un detalle critico es que el repositorio contiene pesos "PKaI-native" y metadatos propios, no un paquete directamente cargable con `transformers.AutoModelForCausalLM`. Esto implica que su integracion requiere adaptar el cargador o el pipeline al formato del autor, lo que reduce la portabilidad respecto a checkpoints estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con GQA, QK normalization y embeddings atados |
| Parametros totales | 841.581.696 (pesos safetensors); 792.429.696 segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en el formato nativo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo PKaI, no compatible directamente con AutoModelForCausalLM) |

Otros datos de arquitectura: vocabulario de 32.000 tokens, 30 capas, 16 cabezas de atencion, 4 cabezas KV, embedding de 1536 dimensiones, embeddings atados y QK normalization. El tokenizador es SentencePiece, derivado de `mistralai/Mistral-7B-v0.1`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con atencion por grupos de consultas (GQA) de 16 cabezas de consulta y 4 cabezas KV, normalizacion QK y proyeccion de embeddings atada a la capa de salida. El vocabulario de 32.000 tokens y la ventana de 2048 tokens lo situan en la gama de modelos pequenos orientados a inferencia economica y despliegue en hardware modesto.

El modelo base se preentreno sobre el mix de entrenamiento de PKaI Nano 2 (composicion no detallada en la informacion disponible). El ajuste de instrucciones se realizo sobre `HuggingFaceTB/smol-smoltalk`, un conjunto sintetico multi-turno bajo Apache 2.0, excluyendo la porcion `openhermes-50k` del mix de SFT. El autor indica que aplico descontaminacion y deduplicacion internas antes del entrenamiento. No se especifica el numero de tokens de preentrenamiento ni de SFT, ni si se emplearon tecnicas como RLHF o DPO; la informacion disponible solo menciona SFT sobre datos sinteticos. El formato conversacional es `pkai-chat-v1`, con etiquetas de rol para system, user y assistant, un turno de sistema implicito cuando la conversacion no empieza por uno, y terminacion de turnos del asistente con el token EOS.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno en ingles, con plantilla de chat `pkai-chat-v1` embebida en `tokenizer.json`.
- Ajuste de instrucciones (instruction following) sobre datos sinteticos de dialogo.
- Razonamiento basico y respuesta a preguntas de conocimiento general, segun los resultados del checkpoint base en HellaSwag, SciQ, PIQA, ARC y WinoGrande.
- Soporte de system prompt explicito: el template incluye un prompt de sistema por defecto que puede sustituirse pasando un mensaje de sistema propio.
- Capacidades multilingues: limitadas al ingles; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningun modo de razonamiento extendido ni orquestacion de herramientas.
- Vision, audio o modalidades adicionales: no disponible; el pipeline es exclusivamente text-generation.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede mantener dialogos multi-turno en ingles con una ventana de 2048 tokens, suficiente para conversaciones de soporte de varias intervenciones y para validar plantillas de chat antes de migrar a modelos mayores.
- Clasificacion y extraccion de informacion en texto corto: con 842 millones de parametros y contexto de 2048 tokens, es viable para tareas de etiquetado, resumen de parrafos y extraccion de entidades en lotes sobre CPU o GPU de gama media.
- Generacion de texto asistida en entornos con recursos limitados: su tamano permite ejecucion en una sola GPU consumer o incluso en CPU, adecuado para demos, entornos de desarrollo y pruebas de integracion continuas.
- Evaluacion comparativa de la serie Nano: util como referencia para medir la evolucion de la familia (Nano 1, 1.1, 1.2 y 2) en tareas de comprension y perplejidad, dado que el autor publica resultados por version.
- Investigacion sobre ajuste de instrucciones en modelos pequenos: al estar entrenado sobre `smol-smoltalk` con licencia Apache 2.0 y pesos abiertos, sirve para estudiar el efecto del SFT sintetico en modelos de menos de mil millones de parametros.
- Filtrado y generacion de datos sinteticos: puede emplearse para producir borradores de dialogo o reformulaciones en ingles dentro de pipelines de aumento de datos, siempre con revision humana por su tasa de error esperable.
- Base para fine-tuning especifico de dominio: al ser un checkpoint pequeno con licencia permisiva, es un punto de partida economico para adaptar el modelo a un vertical concreto mediante SFT adicional.

## Benchmarks y rendimiento

Los datos publicados corresponden al checkpoint base (PKaI Nano 2), no al modelo Instruct; el autor indica que se evalua siempre el base y que las cifras aplican a toda la familia Nano 2. Precision en porcentaje (mayor es mejor); WikiText es perplejidad por palabra (menor es mejor).

| Benchmark | PKaI Nano 2 (base) | PKaI Nano 1.2 | PKaI Nano 1.1 | PKaI Nano 1 |
|---|---|---|---|---|
| HellaSwag | 43.87 | 39.71 | 36.52 | 31.02 |
| SciQ | 85.40 | 81.50 | 80.00 | 73.00 |
| PIQA | 67.52 | 65.94 | 64.96 | 59.74 |
| WinoGrande | 52.49 | 52.96 | 52.72 | 52.57 |
| ARC-Easy | 51.77 | 49.92 | 45.45 | 43.35 |
| ARC-Challenge | 28.75 | 27.73 | 28.24 | 24.83 |
| LAMBADA OpenAI | 42.46 | 44.07 | 33.82 | 23.33 |
| WikiText (ppl, menor es mejor) | 20.65 | 24.13 | 35.47 | 57.37 |

La media en las siete tareas de precision es de 53.18 para PKaI Nano 2, frente a 51.69 de PKaI Nano 1.2. No se han publicado resultados especificos del checkpoint Instruct en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 3.4 GB en el repositorio; en fp16 se estiman unos 1.7 GB de pesos, mas overhead de activaciones y cache KV. Con cuantizacion a 8 bits cabria en torno a 1 GB y a 4 bits en torno a 0.5 GB, aunque el autor no distribuye variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente para fp16 con contexto de 2048 tokens; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para despliegue en servidor, A100 o H100 no son necesarias por tamano, pero permiten mayor paralelismo de peticiones.
- Cabe en GPU consumer: si, en practicamente toda la gama actual (RTX 20xx en adelante) e incluso en iGPU con suficiente memoria compartida para variantes cuantizadas.
- Opciones de despliegue: al no ser un paquete compatible con `transformers.AutoModelForCausalLM`, vLLM, TGI o llama.cpp no lo cargan de forma nativa sin conversion previa. El autor no publica scripts de conversion ni variantes GGUF; la integracion requiere implementar un cargador para el formato nativo PKaI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| PKaI Nano 2 Instruct | ~842 M | 2048 | Apache 2.0 | Safetensors en formato nativo PKaI, no compatible con AutoModelForCausalLM |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360 M | 8192 | Apache 2.0 | Safetensors estandar, integrable en transformers, vLLM y llama.cpp |
| Qwen2.5-0.5B-Instruct | ~0.5 B | 32768 | Apache 2.0 | Safetensors y GGUF, amplio soporte de tooling |
| TinyLlama-1.1B-Chat | ~1.1 B | 2048 | Apache 2.0 | Safetensors y GGUF, soporte amplio en ecosistema |

La comparativa debe leerse con cautela: PKaI Nano 2 Instruct ofrece un contexto de 2048 tokens, inferior al de SmolLM2 y Qwen2.5, y carece de variantes GGUF publicadas, lo que limita su adopcion frente a alternativas con integracion estandar. Su ventaja principal es la licencia Apache 2.0 y su tamano reducido; su desventaja, el formato nativo no estandar y la ausencia de benchmarks del checkpoint Instruct.

## Limitaciones y advertencias

- El modelo no ha recibido ajuste de seguridad (safety tuning); el autor advierte explicitamente de que puede generar texto inexacto, inseguro, sesgado o inadecuado.
- Riesgo de alucinacion elevado por su tamano (menos de mil millones de parametros) y por el uso de datos de SFT sinteticos.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Soporte exclusivo del ingles; no se declaran capacidades multilingues.
- Los pesos estan en formato nativo PKaI y no son cargables directamente con `transformers.AutoModelForCausalLM`, lo que complica la integracion en pipelines estandar y en frameworks de servicio como vLLM o TGI.
- No se publican resultados de benchmarks del checkpoint Instruct; las cifras disponibles corresponden al base, por lo que el rendimiento conversacional real no esta cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el tokenizador y las fuentes de datos tienen avisos de procedencia propios recogidos en `THIRD_PARTY_NOTICES.txt`, que deben revisarse antes de redistribuir.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PowderKegIntelligence/PKaI-Nano-2-Instruct
- Modelo base: https://huggingface.co/PowderKegIntelligence/PKaI-Nano-2
- Anuncio y detalles de evaluacion: https://powderkeg.info/research-introducing-pkai-nano-2.html
- Conjunto de datos de ajuste de instrucciones: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Tokenizador de origen: https://huggingface.co/mistralai/Mistral-7B-v0.1
