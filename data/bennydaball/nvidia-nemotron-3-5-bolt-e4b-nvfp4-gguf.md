# BennyDaBall/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF es una cuantización comunitaria en formato GGUF del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario BennyDaBall. El modelo base lo desarrolla NVIDIA a partir de un post-entrenamiento sobre Gemma 4 E4B de Google, y está pensado para tareas multimodales de imagen-texto-a-texto. Esta versión concreta aplica cuantización NVFP4 (FP4 de NVIDIA) combinada con GPTQ y la técnica Four Over Six, con el objetivo de reducir el peso del modelo a 5,63 GB manteniendo una fidelidad alta respecto a los pesos BF16 originales.

La relevancia de esta ficha radica en que NVIDIA solo distribuye oficialmente el modelo en BF16 y en un GGUF Q4_K_M, mientras que el único archivo NVFP4 oficial es el drafter DFlash. Esta cuantización cubre ese hueco con una calidad medida superior: KLD de 0,038 frente a 0,102 del Q4_K_M oficial, y un 93,9 % de coincidencia en el token superior frente al 90,0 % del oficial. El modelo tiene 7.463.019.215 parámetros totales y está entrenado con una longitud de contexto de 65.536 tokens.

El modelo está orientado a despliegue local en GPUs Blackwell mediante llama.cpp y LM Studio, con soporte de decodificación especulativa mediante el drafter DFlash de NVIDIA, que eleva el throughput de decodificación hasta 550 tok/s en una RTX 5090 según las mediciones del autor. La licencia es OpenMDW 1.1 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la arquitectura de Gemma 4 E4B, post-entrenada por NVIDIA); incluye proyector de visión y audio |
| Parametros totales | 7.463.019.215 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (entrenado a esa longitud) |
| Tipos de cuantizacion | NVFP4 mixto con Q8_0 en capas sensibles y Q6_K en embeddings; tensor NVFP4 etiquetados W4A16; archivo principal de 5.630.777.120 bytes |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW 1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | GGUF (modelo principal NVFP4 + Q8_0/Q6_K; proyector multimodal mmproj en BF16) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, un post-entrenamiento de NVIDIA sobre Gemma 4 E4B de Google, con pipeline image-text-to-text. La model card no detalla la composición del dataset de preentrenamiento ni el volumen de tokens, ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada. La arquitectura interna es la de Gemma 4 E4B, con atención con compartición de K/V entre capas (las capas 24 a 41 reutilizan las K/V de las capas 22 y 23, según el análisis de sensibilidad del cuantizador), y un canal de "thinking" que requiere `--jinja` en llama.cpp para parsearse correctamente. El modelo incorpora un proyector multimodal (visión y audio) convertido a BF16 desde el mismo checkpoint de NVIDIA.

La cuantización de esta ficha se construyó en tres etapas. Primero, GPTQ (Frantar et al. 2022) sobre cada capa lineal del decoder, con calibración de 621 muestras de 2.048 tokens generadas por el propio modelo BF16 con thinking activado (matemáticas, código, chat, uso de herramientas, multilingüe y un 10 % de texto plano), Hessianos en FP32, damping 0,01, bloques perezosos de 128 y un orden de columnas que mantiene contiguos los bloques NVFP4 de 16 pesos. Segundo, la técnica Four Over Six (Cook et al., MIT Han Lab y NVIDIA, arXiv 2512.02010): como FP4 no tiene valores entre 4 y 6, cada bloque de 16 pesos prueba ambas escalas (map-to-6 y map-to-4) y conserva la de menor error; el autor integra esa decisión dentro del bucle de GPTQ (el paper lo señala como trabajo futuro), obteniendo KLD 0,066 frente a 0,070 al decidir a priori, y un 42 % de bloques eligieron map-to-4. Tercero, las capas sensibles se mantienen en Q8_0 según un barrido de KLD por capa: los bloques 22 y 23 son los más sensibles porque todas las capas de 24 a 41 reutilizan sus K/V, seguidos de los bloques 16-21 y 24; esos 9 bloques más todos los attn_k/attn_v quedan en Q8_0 (93 de 258 lineales), la compuerta y proyección de entrada por capa quedan en Q8_0 y los embeddings en Q6_K. Los 36 tensores K/V nunca usados de las capas con K/V compartidas se omiten. El autor verifica que los bytes del GGUF coinciden con la salida del cuantizador y que la dequantización de gguf-py equivale exactamente al resultado GPTQ en memoria.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de NVIDIA incluida byte a byte en el GGUF.
- Razonamiento con modo "thinking" (canal de pensamiento de Gemma 4), que requiere `--jinja` en llama.cpp para parsearse.
- Generación de código y resolución de problemas matemáticos (usados en la calibración y en las pruebas de rendimiento del autor).
- Entrada de imágenes mediante el proyector multimodal BF16 (`mmproj-NVIDIA-Nemotron-3.5-Bolt-E4B-BF16.gguf`).
- Entrada de audio a través del mismo proyector, marcada como experimental en llama.cpp.
- Uso de herramientas (tool use), incluido en el conjunto de calibración del cuantizador.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.
- Decodificación especulativa compatible con el drafter DFlash de NVIDIA (`--spec-type draft-dflash`).

## Casos de uso

- Asistencia conversacional local con contexto largo: el modelo admite 65.536 tokens, suficiente para mantener conversaciones multi-turno con documentos extensos o historiales largos en una sola GPU consumer Blackwell.
- Generación de código en estación de trabajo: con 550 tok/s de decodificación usando el drafter DFlash en una RTX 5090, es viable integrarlo en flujos de autocompletado o revisión de código interactivos sin depender de la nube.
- Análisis de imágenes en local: el proyector mmproj permite pasar imágenes al modelo para descripción, extracción de información o respuesta a preguntas visuales, con la ventaja de que los datos no salen del equipo.
- Procesamiento de audio experimental: el proyector incluye entrada de audio (marcada como experimental en llama.cpp), útil para prototipos de transcripción o comprensión de audio en entornos controlados.
- Razonamiento matemático con modo thinking: el canal de pensamiento permite obtener cadenas de razonamiento antes de la respuesta final, adecuado para tutoría o verificación de cálculos.
- Despliegue en LM Studio para usuarios no técnicos: el archivo carga y responde correctamente en el runtime CUDA 12 de llama.cpp 2.64.0, lo que facilita pruebas rápidas sin montar infraestructura.
- Evaluación comparativa de cuantizaciones: al estar construido con GPTQ + Four Over Six y publicar la escalera de KLD, sirve como referencia para estudiar el impacto de distintas técnicas de cuantización FP4 en un mismo modelo.

## Benchmarks y rendimiento

Datos de calidad de cuantización publicados por el autor (KLD frente a BF16 sobre 61.440 tokens retenidos: wikitext-2 test más chat y código no usados en calibración):

| Build | Tamano | KLD medio | KLD percentil 99 |
|---|---:|---:|---:|
| llama-quantize NVFP4 (RTN) | 5,21 GB | 0,215 | 2,54 |
| + escala por tensor (RTN de dos niveles) | 5,18 GB | 0,186 | 2,25 |
| + Four Over Six (RTN) | 5,18 GB | 0,166 | 2,03 |
| GPTQ (escalas estáticas) | 5,18 GB | 0,077 | 0,95 |
| GPTQ + Four Over Six | 5,18 GB | 0,066 | 0,86 |
| + capas sensibles en Q8_0 (este archivo) | 5,63 GB | 0,038 | 0,50 |
| NVIDIA Q4_K_M (oficial) | 6,18 GB | 0,102 | 1,26 |

Comparativa directa con el Q4_K_M oficial de NVIDIA:

| Metrica | Este archivo | NVIDIA Q4_K_M |
|---|---:|---:|
| Tamano de archivo | 5,63 GB | 6,18 GB |
| KLD vs BF16 (menor es mejor) | 0,038 | 0,102 |
| Mismo token superior que BF16 | 93,9 % | 90,0 % |
| Decodificación, 1 usuario, sin drafter | 240 tok/s | 243 tok/s |
| Decodificación, 1 usuario, con drafter DFlash | 550 tok/s | 526 tok/s |
| Prefill, prompt de 512 tokens | 15.346 tok/s | 17.542 tok/s |

Mediciones del autor en una RTX 5090 con llama.cpp b11856 (build oficial CUDA 13.4), greedy, thinking activado, mediana de 9 peticiones (matemáticas, código y chat por triplicado). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal ocupa 5,63 GB y el proyector multimodal 991.553.312 bytes (aproximadamente 0,99 GB); con overhead de contexto y caché KV, se recomienda al menos 8-10 GB de VRAM para uso solo de texto y en torno a 12 GB con visión.
- GPU recomendadas: el autor mide en una RTX 5090 (Blackwell), que es la plataforma objetivo por los kernels FP4 nativos; en Blackwell llama.cpp usa activaciones de 8 bits por defecto para los tensores NVFP4 etiquetados W4A16.
- Cabe en GPU consumer: sí, en tarjetas Blackwell con suficiente VRAM; en arquitecturas anteriores el soporte de NVFP4 y de los kernels nativos FP4 puede no estar disponible o no ofrecer las mismas prestaciones.
- Opciones de despliegue: llama.cpp (build b11856 o superior, imprescindible para escalas por tensor NVFP4, etiquetas W4A16 y kernels FP4 nativos; builds anteriores pueden cargar el archivo pero producir salidas incorrectas) y LM Studio (runtime CUDA 12 de llama.cpp 2.64.0, probado con respuestas correctas).
- Parámetros de ejecución relevantes: `-ngl 999 -fa on --jinja -c 16384 --parallel 1`, `--spec-draft-n-max 7` explícito (el valor por defecto es 3) y `--spec-draft-ngl 999` con el drafter DFlash para decodificación especulativa.
- Throughput y latencia medidos: 240 tok/s de decodificación sin drafter y 550 tok/s con drafter DFlash en RTX 5090; prefill de 15.346 tok/s con prompt de 512 tokens. Forzar activaciones de 4 bits con `GGML_CUDA_MMQ_PREC=q4` acelera los matmuls por lotes pero sube el KLD a 0,090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | KLD vs BF16 | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Este archivo (NVFP4 GGUF comunitario) | 7,46 B | 65.536 | GGUF NVFP4 + Q8_0/Q6_K, 5,63 GB | 0,038 | OpenMDW 1.1 | Hugging Face (BennyDaBall) |
| NVIDIA Nemotron 3.5 Bolt E4B Q4_K_M (oficial) | 7,46 B | 65.536 | GGUF Q4_K_M, 6,18 GB | 0,102 | OpenMDW 1.1 | Hugging Face (nvidia) |
| NVIDIA Nemotron 3.5 Bolt E4B BF16 (oficial) | 7,46 B | 65.536 | BF16 | referencia | OpenMDW 1.1 | Hugging Face (nvidia) |
| NVIDIA Nemotron 3.5 Bolt E4B 4GB DFlash (drafter oficial) | no disponible | no disponible | NVFP4 (drafter de decodificación especulativa) | no aplica | OpenMDW 1.1 | Hugging Face (nvidia) |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Requiere llama.cpp b11856 o superior: builds anteriores pueden cargar el GGUF pero generar salidas incorrectas por falta de soporte de escalas por tensor NVFP4, etiquetas W4A16 y kernels FP4 nativos.
- Dependencia de hardware Blackwell para obtener el rendimiento medido; en otras arquitecturas el comportamiento de los kernels FP4 puede diferir y no está documentado por el autor.
- El modo thinking necesita `--jinja` para parsearse; sin él, el canal de pensamiento de Gemma 4 no se interpreta correctamente.
- La entrada de audio está marcada como experimental en llama.cpp.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales; conviene revisar sus términos antes de un uso comercial, ya que la model card no detalla restricciones adicionales.
- El archivo es una cuantización comunitaria, no oficial de NVIDIA; la responsabilidad sobre la fidelidad de los pesos recae en el autor de la cuantización, que documenta verificaciones bit-exactas pero no una evaluación exhaustiva de capacidades.
- El autor advierte que forzar activaciones de 4 bits con `GGML_CUDA_MMQ_PREC=q4` degrada la calidad (KLD 0,090).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BennyDaBall/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Paper Four Over Six (arXiv 2512.02010): https://arxiv.org/abs/2512.02010
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Apoyo al autor (Ko-fi): https://ko-fi.com/bennydaball
