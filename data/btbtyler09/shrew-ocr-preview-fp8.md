# btbtyler09/shrew-ocr-preview-FP8

## Resumen

shrew-ocr-preview-FP8 es una cuantización W8A8 en FP8 del modelo shrew-ocr-preview v0.5, un modelo vision-language especializado en extracción de documentos que convierte una imagen de página en JSON estructurado. Lo desarrolla btbtyler09 y se publica bajo licencia Apache 2.0. La versión FP8 está pensada específicamente para servir el modelo con vLLM: cuantiza las 280 capas lineales del modelo de lenguaje a float8 (e4m3) mientras mantiene en bf16 la torre de visión, los proyectores, los embeddings, las normas y el lm_head.

El modelo base emplea la arquitectura granite4_vision y cuenta con 3.997.206.464 parámetros totales (aproximadamente 4.000 millones), con una longitud de contexto de 32.768 tokens según la configuración de servicio validada. El repositorio ocupa 4,9 GB y el checkpoint se carga en vLLM sin necesidad de pasar el flag `--quantization`, ya que el bloque de cuantización está embebido en el `config.json`.

Su relevancia actual radica en que ofrece una alternativa de despliegue más eficiente en memoria (12,7 GB de VRAM en el arranque frente a 15,7 GB en bf16) y un mayor throughput (1,53–1,58 páginas por segundo frente a 1,20–1,24 en bf16) para pipelines de document intelligence, OCR estructurado y RAG sobre documentos, con una degradación de calidad medida y acotada respecto al modelo en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | granite4_vision (vision-language transformer); cuantización compressed-tensors float-quantized |
| Parámetros totales | 3.997.206.464 (aproximadamente 4,0 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (`--max-model-len 32768` en la configuración validada) |
| Tipos de cuantización | FP8 W8A8 (e4m3) en 280 capas lineales del LM; visión, proyectores, embeddings, normas y lm_head en bf16 |
| Idiomas soportados | en (inglés); chino denso con precisión inferior a texto latino; cirílico y árabe no evaluados y considerados no soportados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), con código de modelo propio (`custom_code`) |

## Arquitectura y entrenamiento

El modelo es un vision-language transformer basado en granite4_vision con pipeline `image-text-to-text`. La cuantización se realizó con compressed-tensors 0.20.1 en formato `float-quantized`, partiendo de los pesos bf16 de la v0.5: escalas de activación estáticas (sin cuantización dinámica) y sin cuantización de la caché KV. Las escalas de pesos son por canal de salida (simétricas, máximo de la fila dividido por 448) y las de activación son estáticas por capa, calculadas a partir de la mayor magnitud de entrada observada en el conjunto de calibración. La escritura se hizo con un script corto usando las clases de configuración de compressed-tensors, no con llm-compressor.

La calibración empleó 512 páginas reales extraídas del split de entrenamiento (480 para calibrar, 32 reservadas para la comparación), de 29 tipos de fuente y 2,92 M tokens. Cada página se procesó con el processor del checkpoint usando el system prompt `structured_extraction` y la imagen como único contenido de usuario; el lado del asistente fue la respuesta muestreada del propio modelo bf16, con teacher forcing. No se usaron páginas de benchmarks ni de evaluación reservada, y las páginas no pasaron por el enrutado de buckets ni por el realce de imagen de shrew-server. Todos los ficheros no relacionados con pesos (config de texto, tokenizer, chat template, código del modelo, generation config) son idénticos byte a byte al repositorio bf16; solo difieren `model.safetensors` y el bloque de cuantización de `config.json`.

## Capacidades

- Conversión de imagen de página a JSON estructurado (OCR estructurado) con esquema definido por el autor.
- Extracción de texto y de estructuras tabulares, con detección de tablas y figuras (con las salvedades de recall indicadas en limitaciones).
- Generación de cajas (bounding boxes) a partir de etiquetas generadas por el modelo para localización de elementos.
- Procesamiento de documentos para pipelines de RAG y document intelligence.
- Conversación multimodal image-text-to-text (pipeline declarado).
- Soporte de modo estructurado mediante el system prompt `structured_extraction`.
- Decodificación recomendada con temperature 0.4 y presence_penalty 0.3; el autor indica explícitamente no usar decodificación greedy.
- Una página por petición: sin estado entre páginas.
- Capacidades de tool calling, function calling, agentes o multi-step reasoning: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen de la página y devuelve JSON estructurado listo para ingestión en un ERP; el contexto de 32.768 tokens permite manejar páginas densas sin truncar la salida.
- Ingesta documental para RAG: convertir PDFs página a página en JSON estructurado antes de indexar, usando el modo `structured` de shrew-server (`pipeline_mode=structured`) para preservar la estructura semántica del documento.
- Extracción de tablas en informes financieros: el modelo detecta tablas y las serializa en JSON; conviene validar el fraccionamiento en tiras apiladas que introduce la v0.5 en tablas grandes.
- Enriquecimiento de archivos históricos escaneados: procesamiento por lotes con vLLM a 1,53–1,58 páginas por segundo en una RTX PRO 6000, adecuado para volúmenes medios de digitalización.
- Localización de elementos para recorte y OCR posterior: las cajas generadas por el modelo permiten recortar regiones de interés; deben expandirse hacia fuera porque los bordes no son exactos a nivel de píxel.
- Despliegue en infraestructura con VRAM ajustada: al arrancar en 12,7 GB frente a 15,7 GB en bf16, permite liberar memoria para la caché KV o para co-ubicar otros servicios en la misma GPU.
- Servicio de extracción vía API: el stack shrew-server expone un endpoint `/v1/convert` que acepta un PDF y devuelve el resultado estructurado, integrable en pipelines de CI/CD o en backends de aplicaciones documentales.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en esta build (una RTX PRO 6000, build de vLLM 0.34). El autor advierte que no son cifras de OmniDocBench ni de localización, y que la similitud con bf16 no equivale a precisión, ya que las páginas no tienen etiquetas.

| Medición | FP8 | bf16 |
|---|---|---|
| Arranque, memoria de GPU | 92 s, 12,7 GB | 82 s, 15,7 GB |
| 24 páginas sintéticas, números leídos correctamente | 956 / 960 | 956 / 960 |
| 32 páginas reservadas, similitud de texto con bf16 (temperature 0, tope de 3.000 tokens), media / mediana | 0,921 / 0,961 | bf16 vs bf16 (dos arranques): 0,958 / 0,995 |
| Throughput, páginas por segundo con 16 y 64 peticiones concurrentes (misma tarjeta, páginas sintéticas de texto) | 1,53 / 1,58 | 1,20 / 1,24 |

El autor señala que la diferencia entre FP8 y bf16 es mayor que la que hay entre dos arranques bf16 (peor página reservada: 0,70). FP8 con escalas calculadas en tiempo de ejecución en lugar de las estáticas calibradas obtuvo la misma puntuación (media 0,923), por lo que la diferencia proviene de los pesos y activaciones de 8 bits, no de la calibración. No se midió ninguna puntuación de benchmark para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,7 GB en el arranque medido con FP8 sobre una RTX PRO 6000; el autor usó además un presupuesto fijo de 6 GiB para la caché KV, que debe dimensionarse según la tarjeta.
- GPU recomendadas: NVIDIA RTX PRO 6000 (validada); cualquier GPU con soporte nativo de FP8 y kernel disponible en la build de vLLM.
- GPUs no probadas: hardware sin FP8 nativo (por ejemplo AMD gfx908), AMD RDNA y transformers estándar. En esos casos el autor recomienda usar el repositorio bf16 o el GPTQ-8bit.
- Cabe en GPU de consumo: no confirmado en la información proporcionada; el arranque medido ocupa 12,7 GB más la caché KV, por lo que tarjetas de 16 GB o menos quedan muy justas o fuera de rango según el presupuesto de KV.
- Despliegue: vLLM 0.34 (validado) con shrew-server ≥ 0.5.0; el checkpoint se carga sin flag `--quantization`; puede requerir `--trust-remote-code` según la build. No probado con llama.cpp, Ollama ni TGI.
- Configuración de servicio validada: `--max-model-len 32768`, `--max-num-seqs 256`, `--max-num-batched-tokens 2048`, `--limit-mm-per-prompt '{"image":1}'`, `--no-enable-prefix-caching`, `--chat-template-content-format openai`.
- Throughput medido: 1,53 páginas/s con 16 peticiones concurrentes y 1,58 páginas/s con 64, en páginas sintéticas de texto sobre la misma tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shrew-ocr-preview-FP8 (este) | 3,997 B | 32.768 tokens | FP8 W8A8 (compressed-tensors) | Apache 2.0 | Hugging Face, vLLM |
| shrew-ocr-preview v0.5 (bf16) | 3,997 B | 32.768 tokens (configuración validada) | bf16 | Apache 2.0 | Hugging Face, vLLM |
| Variante GPTQ-8bit de shrew-ocr-preview | 3,997 B | no disponible | GPTQ 8-bit | Apache 2.0 | Hugging Face (referenciada por el autor) |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; el autor no publica comparaciones con otros modelos de OCR o document intelligence.

## Limitaciones y advertencias

- Los pliegos densos, los escaneos densos de baja resolución y las páginas que la torre de visión no puede resolver pueden entrar en bucle o detenerse antes de tiempo; el guard del sistema hace detectables estos fallos.
- La v0.5 divide tablas grandes (y ocasionalmente figuras) en tiras apiladas con más frecuencia que la v0.4.x, tiene más falsos positivos lejanos en figuras y tablas y menor recall de figuras; el efecto de la edición de bucle no es estadísticamente significativo en páginas reservadas.
- OmniDocBench, localización, recuperación, fiabilidad y orden de lectura no se midieron en esta build FP8; las cifras bf16 de la tarjeta principal no se transfieren automáticamente.
- La precisión de caracteres en chino denso es inferior a la de texto latino impreso. Cirílico y árabe no se evaluaron y deben tratarse como no soportados. La escritura manual tiene evaluación limitada (una comprobación separada de 300 páginas) y sin puntuación publicada.
- Las cajas provienen de etiquetas generadas por el modelo: deben rellenarse hacia fuera al recortar, ya que los bordes no son exactos a nivel de píxel.
- Una página por petición: sin estado entre páginas, lo que impide razonamiento que abarque varias páginas.
- El autor advierte de que los pesos se actualizan in place bajo el mismo nombre; para reproducibilidad hay que fijar la etiqueta `v0.5` o un commit concreto con `revision=`.
- No usar decodificación greedy: el autor recomienda temperature 0.4 y presence_penalty 0.3.
- En hardware sin kernel FP8 la build de vLLM rechazará la carga o hará fallback; en ese caso debe usarse la variante bf16 o GPTQ-8bit.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre precisión en dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/btbtyler09/shrew-ocr-preview-FP8
- Modelo base (tarjeta principal, benchmarks, esquema y contrato de entrada): https://huggingface.co/btbtyler09/shrew-ocr-preview
- Repositorio del servidor: https://github.com/btbtyler09/shrew-server
- Paper: no disponible
- Blog o demo: no disponible
