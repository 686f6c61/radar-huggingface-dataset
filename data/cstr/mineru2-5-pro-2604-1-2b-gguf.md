# cstr/MinerU2.5-Pro-2604-1.2B-GGUF

## Resumen

MinerU2.5-Pro-2604-1.2B es un modelo vision-language especializado en parsing de documentos y OCR, desarrollado por el equipo MinerU de OpenDataLab. El repositorio analizado, `cstr/MinerU2.5-Pro-2604-1.2B-GGUF`, no es el modelo original, sino una conversión a formato GGUF realizada por CrispEmbed para su runtime nativo ggml, orientada a su perfil MinerU del grafo Qwen2-VL. Los pesos no han sido reentrenados ni modificados: solo se ha cambiado el formato de almacenamiento, el renombrado de tensores y la cuantización.

El modelo base resuelve el problema de extraer estructura a partir de imágenes de documentos: reconocimiento de texto, detección de tablas, fórmulas matemáticas, coordenadas de layout y orden de lectura, entre otros. Con 1.156.026.624 parámetros (~1,2B) y una ventana de contexto de 8.192 tokens según el perfil de CrispEmbed, está pensado para ejecutarse en entornos con recursos limitados, incluidas CPU y GPUs de consumo, manteniendo una fidelidad estricta respecto al modelo original.

La relevancia de esta conversión radica en la verificación de paridad: los archivos F16 y Q8_0 reproducen exactamente los token IDs del modelo Python original en las 8 peticiones congeladas de prueba, mientras que la variante Q4_K_MIX ofrece una reducción de tamaño notable (0,77 GB frente a 2,59 GB en F16) a costa de divergencias en la decodificación libre. Es una opción práctica para pipelines de document parsing autoalojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language basada en Qwen2-VL (perfil MinerU de CrispEmbed) |
| Parámetros totales | 1.156.026.624 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (perfil de CrispEmbed; no verificado más allá) |
| Tipos de cuantización | F16, Q8_0, Q4_K_MIX (política `mineru_q4k_v1`) |
| Idiomas soportados | no disponible (casos de prueba en alemán, japonés y árabe, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_MIX) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `opendatalab/MinerU2.5-Pro-2604-1.2B`, un vision-language transformer de tipo Qwen2-VL adaptado por el equipo MinerU para parsing de documentos. El repositorio GGUF no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información debe consultarse en la model card del modelo original. La conversión preserva la torre de visión y el decodificador, con las normas y sesgos en F32 en la variante F16.

La innovación técnica relevante en esta ficha es el proceso de cuantización de CrispEmbed. La variante Q8_0 mantiene el decodificador y los embeddings en Q8_0, pero deja la torre de visión en F16, siguiendo la política aplicada a InternVL2, ya que una torre de visión en Q8_0 produjo un peor coseno de fila de 0,49 en la etapa de CPU. La variante Q4_K_MIX aplica Q4_K a la torre de visión y a las matrices `ffn_down` del decodificador, IQ4_NL al embedding atado y conserva las matrices de 896 columnas del decodificador, ya que Q4_K requiere filas de 256 columnas. El resultado son 734 MiB frente a 1.832 MiB de Q8_0, superando el umbral de coseno de logits finales de 0,94 en los ocho casos de prueba sobre CPU, Metal y CUDA.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos con extracción de layout y coordenadas de cajas.
- Detección y transcripción de tablas.
- Reconocimiento de fórmulas matemáticas.
- Procesamiento de recibos y documentos estructurados.
- Manejo de páginas con rotación (`layout-rot90`).
- Soporte multilingüe parcial verificado en pruebas: alemán, japonés y árabe, además de contenido latino.
- Entrada image-text-to-text (imagen más prompt de texto).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No se documenta modo de razonamiento explícito (thinking mode) ni entrada de audio.

## Casos de uso

- Digitalización masiva de archivos escaneados: el modelo puede procesar imágenes de páginas y devolver texto estructurado con orden de lectura, aprovechando su perfil de 8.192 tokens para documentos de una página con contenido denso.
- Extracción de tablas en informes financieros: la capacidad de transcripción de tablas permite convertir tablas rasterizadas en datos estructurados para su carga en bases de datos o hojas de cálculo.
- Procesamiento de facturas y recibos: los casos de prueba incluyen un recibo (`receipt`, 202 tokens), lo que respalda su uso en pipelines de contabilidad automatizada con verificación de campos.
- Conversión de fórmulas matemáticas en publicaciones científicas: el caso `formula` (29 tokens) demuestra la transcripción de expresiones matemáticas desde imágenes, útil para repositorios académicos y digitalización de artículos.
- Análisis de layout para motores de búsqueda documental: la salida de coordenadas de cajas permite indexar regiones de la página (títulos, párrafos, tablas) y construir índices espaciales para recuperación.
- Despliegue en CPU para entornos sin GPU: las variantes Q8_0 y Q4_K_MIX están verificadas en CPU con paridad exacta (Q8_0) o coseno superior a 0,94 (Q4_K_MIX), lo que permite ejecutar el modelo en servidores sin acelerador.
- Preprocesado en pipelines RAG sobre documentos: la extracción de texto y estructura alimenta la fragmentación y el embedding posteriores en sistemas de recuperación aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona pruebas de paridad frente al modelo original en 8 peticiones congeladas:

| Caso | Tokens generados (referencia) | F16 | Q8_0 | Q4_K_MIX |
|---|---|---:|---:|---:|
| `formula` | 29 | exacto | exacto | coseno > 0,94 |
| `table` | 140 | exacto | exacto | coseno > 0,94 |
| `receipt` | 202 | exacto | exacto | coseno > 0,94 |
| `german` | 389 | exacto | exacto | divergente desde token 7 (CPU) |
| `japanese` | 37 | exacto | exacto | coseno > 0,94 |
| `arabic` | 7 | exacto | exacto | coseno > 0,94 |
| `layout-page` | 199 | exacto | exacto | divergente desde token 52 (CPU) |
| `layout-rot90` | 44 | exacto | exacto | coseno > 0,94 |

Coseno mínimo de logits finales para Q4_K_MIX: 0,9673 en CPU (`japanese`), 0,9602 en Metal (`german`), 0,9611 en CUDA (`japanese`). El umbral exigido es 0,94. La divergencia en `layout-page` comienza en tokens distintos según el backend: 52 en CPU, 180 en Metal y 48 en CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB en F16, 1,9 GB en Q8_0 y 0,77 GB en Q4_K_MIX, según los tamaños de archivo publicados.
- GPU recomendadas: no se especifican modelos concretos; las pruebas de paridad cubren backends CPU, Metal y CUDA, por lo que se contemplan GPUs Apple Silicon y NVIDIA con soporte CUDA.
- Cabe en GPU de consumo: sí, con 2 GB o más de VRAM en Q8_0 y Q4_K_MIX; en F16 requiere al menos 3 GB.
- Opciones de despliegue: runtime nativo ggml de CrispEmbed (los archivos no son pares `mmproj` de llama.cpp y no están pensados para ese ecosistema).
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad.
- Limitaciones de verificación: los backends GPU no están verificados de forma exhaustiva, ni los documentos multipágina, ni contextos superiores a 8.192 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| MinerU2.5-Pro-2604-1.2B (GGUF, este repo) | 1,16B | 8.192 | GGUF (F16, Q8_0, Q4_K_MIX) | Apache 2.0 | Paridad exacta en F16/Q8_0 sobre 8 casos |
| opendatalab/MinerU2.5-Pro-2604-1.2B (original) | 1,16B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo de referencia en Python |
| Alternativas OCR/VLM de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Los archivos están diseñados exclusivamente para el runtime nativo de CrispEmbed y no son pares `mmproj` compatibles con llama.cpp.
- La variante Q4_K_MIX es experimental: no es token-exacta en los casos `german` y `layout-page`, con errores concretos de transcripción ("Reichs-Gefehbl." por "Reichs-Gefehblatt.", "Infrafttreten" por "Inkrafttreten") y un desplazamiento de coordenada de caja (`079` a `078`). Para salidas de layout que deban ser idénticas al original, usar F16 o Q8_0.
- La paridad solo se ha verificado en 8 peticiones congeladas de una sola página; no hay validación en documentos multipágina ni benchmarks agregados de documento.
- El contexto está limitado a 8.192 tokens en el perfil de CrispEmbed; no se ha verificado su comportamiento más allá.
- Los backends GPU no están verificados de forma completa; la divergencia de Q4_K_MIX en `layout-page` varía según el backend.
- Riesgo de alucinación en OCR: no se documentan tasas de error ni evaluaciones de fidelidad sobre corpus amplios.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Idiomas: no se declara una lista oficial de idiomas soportados; las pruebas cubren alemán, japonés y árabe, pero no hay garantías para otros.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio no incluye el archivo LICENSE original; se distribuye el `LICENSE.md` del proyecto `opendatalab/mineru-vl-utils`. No se incluye NOTICE porque el upstream tampoco lo proporciona.
- El modelo base declara `license: apache-2.0` pero no envía archivo de licencia propio; conviene verificar la procedencia antes de un despliegue comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/MinerU2.5-Pro-2604-1.2B-GGUF
- Modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2604-1.2B
- Revisión fijada del modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2604-1.2B/tree/d3f5e08d073c21466bbabe21c71bb1e9c2e595da
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Licencia de referencia: https://github.com/opendatalab/mineru-vl-utils/blob/c9797cde8f54cc48306196fc6aebe73ea31dd4a3/LICENSE.md
- README original incluido en el repo: `UPSTREAM_README.md` (revisión `d3f5e08d073c`)
- Recetas de cuantización: `docs/qwen2vl-q4k-recipes.md` (dentro del repositorio CrispEmbed)
- Resultados de precisión: `tests/results/mineru25/precision.json` y `tests/results/qwen2vl-q4k/mineru-q4k-precision.json` (dentro del repositorio CrispEmbed)
