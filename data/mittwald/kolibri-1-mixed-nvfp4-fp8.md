# mittwald/Kolibri-1-mixed-NVFP4-FP8

## Resumen

Kolibri-1-mixed-NVFP4-FP8 es una cuantización de 4 bits calibrada con GPTQ del modelo Kolibri 1 de Aleph Alpha, un mixture-of-experts (MoE) de 78.000 millones de parámetros totales y 3.500 millones activos, diseñado para razonamiento en alemán e inglés. La publica mittwald, no Aleph Alpha, y no está respaldada por el fabricante original. Su objetivo es empaquetar el modelo completo, con su ventana de 262.144 tokens, en una única GPU NVIDIA Blackwell de 96 GB, algo imposible con la versión BF16 original.

La propuesta técnica es una cuantización mixta: el 96,7 % de los parámetros (los expertos enrutados de las 50 capas, 384 expertos por capa) se comprimen a NVFP4 W4A4 con pesos derivados por GPTQ, mientras que la atención y los expertos compartidos se mantienen en FP8 E4M3 y las embeddings, el `lm_head`, los routers y las normas siguen en BF16. El resultado ocupa 42,64 GiB en memoria de GPU frente a los 73,42 GiB de la release FP8, una reducción del 42 % en disco.

Es relevante ahora porque demuestra que una cuantización de 4 bits bien calibrada puede preservar la calidad del modelo original dentro del ruido de muestreo, al tiempo que multiplica la capacidad de caché KV (de 810.000 a 3,40 millones de tokens en una RTX PRO 6000) y reduce la latencia de primer token p95 con 64 usuarios concurrentes de 12,4 s a 1,5 s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Kolibri1ForCausalLM`, transformer MoE disperso: 50 capas x 384 expertos enrutados |
| Parametros totales | 40.354.338.560 (40,35 B en safetensors; el autor declara 78 B, discrepancia no aclarada en la información disponible) |
| Parametros activos | 3,5 B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 W4A4 (expertos enrutados), FP8 E4M3 (atención y expertos compartidos), BF16 (embeddings, `lm_head`, routers, normas) |
| Idiomas soportados | Alemán, inglés |
| Licencia | Apache 2.0 (la original, sin cambios) |
| Formato de pesos | safetensors con `compressed-tensors` en modo `mixed-precision`; pensado para vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 50 capas y 384 expertos enrutados por capa, más expertos compartidos, con 3,5 B de parámetros activos por token. La información disponible no detalla la composición exacta del dataset de preentrenamiento ni las fases de post-entrenamiento (RLHF, DPO) del modelo original; para eso remite a la model card de Aleph Alpha y a su informe técnico. Los datasets listados en la model card (FineWeb2-HQ, fineweb-edu, germanrag, oasst2, aya_dataset) corresponden a las fuentes declaradas del modelo base.

La innovación de este checkpoint es la estrategia de cuantización. Los expertos enrutados, que suponen el 96,7 % de los parámetros, se cuantizan a NVFP4 con valores E2M1, escala E4M3 cada 16 valores y escala global FP32, y los pesos se obtienen mediante GPTQ con 512 muestras de calibración (1,38 millones de tokens, aproximadamente 64 % en alemán). A diferencia de otras builds NVFP4 del Hub que redondean al vecino más cercano, GPTQ hace que los datos de calibración ajusten los propios pesos de 4 bits, no solo las escalas, lo que cierra buena parte de la brecha con la release FP8. La atención q/k/v/o y los expertos compartidos usan FP8 E4M3 con escalas en bloques de 128x128 y activaciones dinámicas por grupo de 128, el mismo esquema de la release FP8 de Aleph Alpha. El `config.json` es el original con un `quantization_config` añadido; tokenizer, plantilla de chat y `generation_config.json` no se modifican.

## Capacidades

- Generación de texto y razonamiento con traza de pensamiento separada del contenido de la respuesta (campo `reasoning`, o `reasoning_content` en versiones antiguas de vLLM).
- Tool calling y function calling, con parser `hf` en vLLM y soporte de elección automática de herramienta.
- Razonamiento multi-paso orientado a agentes, con plantilla de respuesta que estructura la traza de razonamiento.
- Capacidades multilingües limitadas a alemán e inglés.
- Conversación multi-turno con contexto de hasta 262.144 tokens.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Atención al cliente en alemán e inglés: el modelo sostiene conversaciones multi-turno con hasta 262.144 tokens de contexto, suficiente para incorporar historial completo, documentación de producto y políticas internas en la misma ventana sin truncar.
- RAG sobre documentación corporativa alemana: con 3,40 millones de tokens de caché KV en una sola RTX PRO 6000, se pueden precargar numerosos documentos y reutilizar prefijos gracias a `--enable-prefix-caching`, reduciendo el coste por consulta.
- Agentes con herramientas en producción: el soporte de tool calling y `--enable-auto-tool-choice` permite integrarlo en flujos que consultan APIs, bases de datos o sistemas internos, con la traza de razonamiento disponible para auditoría.
- Asistencia a desarrolladores en entornos germanoparlantes: generación y revisión de código con explicaciones en alemán, aprovechando el modo de razonamiento para justificar decisiones de diseño.
- Extracción y análisis de contratos o normativa: la ventana larga permite procesar documentos jurídicos completos en una sola pasada, con salida estructurada vía tool calling.
- Despliegue multiinquilino con 64 usuarios concurrentes: según las mediciones del autor, 1.772 tok/s de salida y 1,5 s de primer token p95 en una única GPU, adecuado para servicios internos con carga moderada.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 con GPTQ frente a FP8 en tareas de razonamiento y hechos en alemán, dado que el autor publica distancias KL y resultados por tarea.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (una RTX PRO 6000 Blackwell de 96 GB, vLLM v0.33.0, TP1, `--max-model-len 262144 --kv-cache-dtype fp8 --gpu-memory-utilization 0.92`):

| Metrica | Release FP8 | Este checkpoint |
|---|---:|---:|
| Tamano en disco | 78,83 GB | 45,84 GB (-42 %) |
| Pesos en memoria de GPU | 73,42 GiB | 42,64 GiB |
| Cache KV en una RTX PRO 6000 a 262k de contexto | 810.000 tokens | 3.400.000 tokens (4,2x) |
| Throughput de salida, 64 usuarios en paralelo | 1.146 tok/s | 1.772 tok/s (+55 %) |
| Tiempo hasta primer token p95, 64 usuarios | 12,4 s | 1,5 s |
| Distancia a BF16 (KL truncada, menor es mejor) | 0,175 | 0,179 |
| Precision (GSM8K, hechos en aleman, RAG aleman, tool calls) | referencia | dentro del ruido de muestreo |

La información disponible no incluye las puntuaciones absolutas de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, solo la comparación relativa frente a la release FP8. No se han publicado en la información disponible resultados numéricos de benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia: 42,64 GiB solo para pesos; el autor recomienda al menos 48 GB por tarjeta y una GPU de 96 GB para alojar pesos más caché KV FP8 de 3,4 millones de tokens.
- GPU imprescindible: NVIDIA Blackwell con SM 10.0 o SM 12.0 (B200, RTX PRO 6000 Blackwell Server Edition). NVFP4 no se ejecuta en arquitecturas anteriores.
- No cabe en GPU de consumo convencionales (RTX 4090, 5090) por el requisito de arquitectura Blackwell y por los 42,64 GiB de pesos; la información disponible no documenta una variante ejecutable en ellas.
- Despliegue: vLLM v0.33.0 con imagen `vllm/vllm-openai:v0.33.0` y backend Transformers; los expertos NVFP4 corren sobre FlashInfer CUTLASS. Alternativa: imagen de plugin de Aleph Alpha (`ghcr.io/aleph-alpha/aleph-alpha-inference`) con parsers `kolibri1`.
- Opciones de despliegue adicionales: la información disponible no menciona soporte de llama.cpp, Ollama ni TGI para este formato `compressed-tensors`.
- Latencia y throughput: 1.772 tok/s de salida y 1,5 s de primer token p95 con 64 usuarios concurrentes en una RTX PRO 6000 Blackwell, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mittwald/Kolibri-1-mixed-NVFP4-FP8 | 40,35 B en safetensors (78 B declarados), 3,5 B activos | 262.144 | NVFP4 + FP8 + BF16 mixta, GPTQ | Apache 2.0 | Hugging Face, requiere Blackwell |
| Aleph-Alpha/Kolibri-1-BF16 | 78 B, 3,5 B activos | 262.144 | BF16 | Apache 2.0 | Hugging Face |
| Release FP8 de Aleph Alpha (referenciada en la model card) | 78 B, 3,5 B activos | 262.144 | FP8 E4M3 | Apache 2.0 | Hugging Face |
| Builds NVFP4 de primitive-ai (round-to-nearest) | 78 B, 3,5 B activos | 262.144 | NVFP4 sin GPTQ | Apache 2.0 | Hugging Face |

La información disponible no permite comparar con modelos de otras familias (por ejemplo, alternativas MoE de tamaño similar); la comparativa se limita a las variantes del propio Kolibri 1 documentadas en la model card.

## Limitaciones y advertencias

- No es una release de Aleph Alpha ni está respaldada por ella; para uso en producción conviene validar contra la model card y el informe técnico originales.
- Solo admite alemán e inglés; no se documenta soporte de otras lenguas.
- Requiere hardware Blackwell (SM 10.0 o SM 12.0); no es desplegable en GPUs anteriores ni en la mayoría de tarjetas de consumo.
- La cuantización introduce una degradación medible: distancia KL truncada de 0,179 frente a 0,175 de la release FP8 (respecto a BF16). Las tareas evaluadas quedan dentro del ruido de muestreo, pero no se han publicado evaluaciones exhaustivas en la información disponible.
- Riesgo de alucinación inherente al modelo base; la información disponible no incluye análisis específicos de sesgos.
- La discrepancia entre los 40,35 B de parámetros en safetensors y los 78 B declarados en la model card no se aclara en la información disponible; conviene verificarla antes de dimensionar el despliegue.
- El formato `compressed-tensors` mixto limita las opciones de servidor: la información disponible solo documenta vLLM v0.33.0 y la imagen de plugin de Aleph Alpha.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene revisar también los términos del modelo base.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/mittwald/Kolibri-1-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe técnico de Aleph Alpha: https://aleph-alpha.com/downloads/tech-report.pdf
- Sitio del autor de la cuantización: https://www.mittwald.de
- Imagen de inferencia de Aleph Alpha: ghcr.io/aleph-alpha/aleph-alpha-inference
- Imagen de vLLM utilizada: vllm/vllm-openai:v0.33.0
