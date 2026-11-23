# btbtyler09/shrew-ocr-preview-GGUF

## Resumen

shrew-ocr-preview-GGUF es la conversión a formato GGUF del modelo shrew-ocr-preview, un modelo de visión-lenguaje especializado en inteligencia documental y extracción estructurada. Lo desarrolla btbtyler09 y está pensado para una tarea muy concreta: recibir la imagen de una página y devolver JSON estructurado conforme a un esquema, en lugar de texto libre. Esta versión GGUF (v0.5) está empaquetada para llama.cpp con soporte nativo de Granite4Vision, lo que permite desplegarla en servidores locales sin depender de frameworks de inferencia más pesados.

El modelo base tiene 3.402.839.040 parámetros (aproximadamente 3,4 mil millones) y una ventana de contexto de 32.768 tokens por ranura. Solo se cuantiza el modelo de lenguaje; la torre de visión se mantiene en f16 dentro del fichero mmproj, lo que preserva la calidad de la codificación visual. La licencia es Apache 2.0 y el único idioma declarado es el inglés, aunque el modelo procesa documentos en otros alfabetos con distinto grado de acierto.

Su relevancia actual radica en el encaje con pipelines de RAG y automatización documental: la salida JSON validable contra esquema simplifica la integración en sistemas de extracción de datos, y el tamaño contenido permite ejecutarlo en GPUs de gama media de 12 GB. La conversión incluye f16, Q8_0 y un mmproj f16 separado, con validaciones publicadas sobre páginas retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Granite4Vision (torre de visión + modelo de lenguaje); detalles completos de la arquitectura no disponibles |
| Parametros totales | 3.402.839.040 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por ranura (contrato completo); configuraciones medidas hasta 65.536 con 2 ranuras |
| Tipos de cuantizacion | f16 (LM), Q8_0 (LM); mmproj en f16 |
| Idiomas soportados | en (inglés); otros alfabetos con evaluación parcial o no realizada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un vision-lenguaje con una torre de visión y proyectores que alimentan un modelo de lenguaje; la conversión GGUF emplea el soporte nativo de Granite4Vision en llama.cpp (b10453 en la validación de v0.5). Solo el modelo de lenguaje se cuantiza, mientras que la torre de visión y los proyectores se distribuyen en un mmproj f16 de 1,16 GB. En v0.5 tanto la torre de visión como los proyectores cambiaron respecto a v0.4.1, por lo que el mmproj es nuevo además de los ficheros del LM.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card del modelo base menciona que la mezcla de entrenamiento incluye renders sintéticos de documentos. La innovación principal no es arquitectónica sino de contrato de salida: el modelo devuelve JSON estructurado validable contra un esquema, con detección de localización (bounding boxes) generada por etiquetas del propio modelo. La receta de conversión de v0.4 reconstruyó sus tres ficheros publicados byte a byte, lo que indica un proceso reproducible.

## Capacidades

- Extracción estructurada de documentos: entrada de imagen de página, salida JSON conforme a esquema.
- OCR y reconocimiento de texto en documentos impresos, con precisión medida de 0,935 en el conjunto de validación de 50 páginas.
- Detección de tablas y figuras, con localización mediante bounding boxes (no exactas a nivel de píxel).
- Comprensión de layout documental: páginas densas, manuales y documentos de varias columnas.
- Procesamiento de documentos en inglés; chino denso con precisión inferior a la impresión latina; cirílico y árabe no evaluados y tratados como no soportados.
- Evaluación limitada de escritura manuscrita (comprobación separada de 300 páginas, sin puntuación publicada).
- Integración en pipelines de RAG mediante salida estructurada y servidor compatible (shrew-server ≥ 0.5.0).
- Una página por petición: sin estado entre páginas, el ensamblado de documentos multipágina se hace aguas abajo.
- No se documentan en la información disponible capacidades de tool calling, agentes ni modo thinking.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen de la página y devuelve JSON con los campos del esquema definido, lo que permite cargar datos directamente en un ERP sin postprocesado de texto libre.
- Ingesta documental para RAG: la salida estructurada y validable contra esquema facilita trocear y etiquetar documentos antes de indexarlos, con detección de tablas y figuras para preservar su contexto.
- Extracción de tablas financieras: el modelo localiza tablas y devuelve su contenido estructurado; conviene tener en cuenta que v0.5 divide tablas grandes en tiras apiladas con más frecuencia que v0.4.x.
- Automatización de back office con GPU de gama media: con Q8_0 y mmproj f16 cabe en GPUs de 12 GB a contexto completo, con un rendimiento medido de aproximadamente 2,8 páginas por minuto en una RTX 3060 y 1 ranura.
- Procesamiento por lotes de archivos escaneados: con 2 ranuras y cuantización KV q8_0 se alcanzan aproximadamente 5,7 páginas por minuto (el doble) sin pérdida de fidelidad medida (delta emparejado 0,0000).
- Despliegue local sin dependencia de la nube: la combinación de llama.cpp más shrew-server permite montar el pipeline completo en infraestructura propia, con imagen Docker `ocr-cuda` para evitar configuración manual.
- Verificación de contratos de extracción en CI: la salida JSON validable contra esquema y el guard de fallo detectable permiten integrar comprobaciones automáticas de calidad sobre páginas de referencia.

## Benchmarks y rendimiento

Los datos publicados corresponden a la conversión GGUF (mayoritariamente v0.2 a v0.4); no se ejecutaron benchmarks de calidad ni de paridad sobre los ficheros v0.5.

| Prueba | Configuración | Resultado |
|---|---|---|
| Primera pasada, puerta de 50 páginas | Q8_0, `-c 32768 -np 1`, RTX 3060 12 GB | 44/50; precisión 0,935 |
| Primera pasada, puerta de 50 páginas | Q8_0, `-c 65536 -np 2`, KV q8_0 | 46/50; precisión 0,939 |
| Paridad Q8_0 frente a GPTQ-8bit | 50 páginas | Primera pasada 44/50 frente a 43/50; precisión 0,935 frente a 0,937; delta de fidelidad de tablas mediana 0,000 |
| Smoke de servidor | Q8_0, 24 páginas (4 documentos), 1 ranura `-c 32768` | 24/24 primera pasada, 0 reintentos, 244 s |
| Manual denso | Q8_0, RTX 3060, 7,4 GB VRAM | 3/3 primera pasada, 7 fragmentos, 54 s |
| Comprobación de arranque v0.5 | Q8_0 + mmproj, CPU llama-server, 3 páginas | Todas terminaron con `stop` y JSON válido con las claves del esquema |
| Servidor v0.5 | Q8_0 + mmproj, build HIP de llama.cpp b10453, 32.768 contexto, 1 ranura | 8/8 páginas válidas en primera pasada (4 B1, 2 B2, 2 B3) |

Las cifras de OmniDocBench y localización de la model card principal corresponden a bf16 y no se midieron sobre estos ficheros GGUF. No hay resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere una GPU de clase 12 GB para el contrato completo (32k de contexto, 1 ranura); f16 requiere al menos 16 GB de VRAM a contexto completo y provoca OOM en CUDA con 12 GB en páginas de tiles grandes.
- Tamaño de ficheros: Q8_0 3,6 GB, f16 6,8 GB, mmproj f16 1,16 GB (obligatorio junto a cualquiera de los dos LM).
- GPU recomendadas: RTX 3060 12 GB validada para Q8_0; para f16 se necesita una tarjeta de 16 GB o superior (no se especifican modelos concretos en la información disponible).
- Cabe en GPU de consumo: sí, Q8_0 en 12 GB; con 2 ranuras y KV q8_0 también en 12 GB (medido en RTX 3060).
- Despliegue: llama.cpp (llama-server b10453 validado), shrew-server ≥ 0.5.0, imagen Docker `ocr-cuda`; no se documenta soporte de vLLM, Ollama ni TGI para estos ficheros GGUF.
- Throughput medido: aproximadamente 2,8 páginas por minuto con 1 ranura y aproximadamente 5,7 con 2 ranuras y KV q8_0. El contexto debe fijarse en N × 32.768 para N ranuras; una ranura con menos de 32k completos provoca caída (exit 139) en páginas densas.
- En llama.cpp, llama-server b10453 no envía uso de tokens en fragmentos en streaming, por lo que el corte por desbordamiento del servidor es el límite de 60.000 caracteres en lugar del corte por tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shrew-ocr-preview-GGUF | 3,4 mil millones | 32.768 por ranura | OCR con salida JSON estructurada | Apache 2.0 | GGUF para llama.cpp |
| shrew-ocr-preview (base, bf16) | 3,4 mil millones | 32.768 | OCR con salida JSON estructurada | Apache 2.0 | Pesos bf16 en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos de OCR estructurado con los que establecer una comparación cuantitativa fiable; los únicos puntos de referencia son las versiones GPTQ-8bit del propio modelo base, con paridad de primera pasada y precisión prácticamente idénticas.

## Limitaciones y advertencias

- Páginas densas de gran formato, escaneos densos de baja resolución y páginas que la torre de visión no resuelve pueden entrar en bucle o detenerse antes de tiempo; el guard del servidor hace detectables estos fallos, pero no los evita.
- v0.5 divide tablas grandes (y ocasionalmente figuras) en tiras apiladas con más frecuencia que v0.4.x, presenta más falsos positivos lejanos en figuras y tablas y tiene menor recall de figuras; el efecto de la corrección de bucles no es estadísticamente significativo en páginas retenidas.
- La recuperación, la fiabilidad, el orden de lectura en periódicos de gran formato y los envolventes de servicio no se volvieron a medir para v0.5.
- Precisión de caracteres en chino denso inferior a la impresión latina; cirílico y árabe no evaluados y tratados como no soportados; escritura manuscrita con evaluación limitada y sin puntuación publicada.
- Las bounding boxes provienen de etiquetas generadas por el modelo: deben ampliarse hacia fuera al recortar, ya que los bordes no son exactos a nivel de píxel.
- Una página por petición, sin estado entre páginas; los documentos multipágina deben ensamblarse aguas abajo.
- Decodificación obligatoria con temperatura 0,4 y presence_penalty 0,3; nunca greedy.
- No se ejecutaron benchmarks de calidad ni de paridad sobre los ficheros v0.5; las cifras de OmniDocBench y localización son de bf16.
- Riesgo de alucinación en campos del esquema no presentes en la página: no se documenta en la información disponible una evaluación específica de este riesgo.
- Licencia Apache 2.0 permite uso comercial; no se documentan restricciones adicionales, aunque la mezcla de entrenamiento incluye renders sintéticos de documentos (ver atribución en la model card principal).

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/btbtyler09/shrew-ocr-preview-GGUF
- Modelo base: https://huggingface.co/btbtyler09/shrew-ocr-preview
- Servidor shrew-server: https://github.com/btbtyler09/shrew-server
- Changelog y benchmarks del modelo base: https://huggingface.co/btbtyler09/shrew-ocr-preview#changelog
- llama.cpp: https://github.com/ggml-org/llama.cpp
