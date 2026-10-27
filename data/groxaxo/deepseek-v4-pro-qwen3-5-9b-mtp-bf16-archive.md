# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-BF16-archive

## Resumen

`groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-BF16-archive` es un espejo de archivo (archival mirror) byte a byte de los ficheros publicados por Jackrong bajo el nombre `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`. No es un modelo entrenado por el autor del repositorio: no hay fine-tuning adicional, no hay cuantización propia y no se incluyen datos privados ni resultados de experimentos. Su función es preservar una revisión concreta del modelo upstream junto con un manifiesto de hashes SHA-256 que permite verificar la integridad de cada fichero.

El modelo subyacente tiene 9.197.093.888 parámetros (9,2 B) en precisión BF16, con pesos nativos en safetensors y una versión GGUF de 18.407.322.720 bytes (aproximadamente 17,1 GiB) que incluye tensores MTP. El nombre combina referencias a DeepSeek-V4-Pro y a la familia Qwen3.5, y la etiqueta `qwen3_5` del repositorio apunta a que la arquitectura deriva de esa familia, aunque la model card del espejo no aporta detalles técnicos propios.

La relevancia de este repositorio es fundamentalmente de reproducibilidad: fija las revisiones upstream (`40c1fbe1…` para el código nativo y `99b43f20…` para el GGUF), publica el SHA-256 del GGUF y empaqueta todo en 37,7 GB. Para evaluar capacidades reales hay que remitirse a la model card original de Jackrong, que se conserva en `experiment/native-source/README.md`; este espejo no formula ninguna afirmación adicional sobre calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; la etiqueta `qwen3_5` sugiere que deriva de la familia Qwen3.5, sin confirmación técnica en la model card |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (GGUF BF16, 17,1 GiB). Explícitamente no es una cuantización de 4 bits; no se publican otras cuantizaciones en este repositorio |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (shards nativos de Transformers, tokenizer y configuración en `experiment/native-source/`) y GGUF (`experiment/gguf/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-BF16.gguf`) |

## Arquitectura y entrenamiento

La model card del espejo no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO). Lo único verificable es el nombre del repositorio base (`DeepSeek-V4-Pro-Qwen3.5-9B`) y la etiqueta `qwen3_5`, que sitúan el modelo en la estirpe Qwen3.5 con 9,2 B de parámetros. El autor del espejo declara explícitamente que no se realizó ningún fine-tuning ni cuantización adicional: los tensores son idénticos a los publicados upstream en la revisión fijada.

El detalle técnico diferencial que sí aparece es la presencia de tensores MTP (multi-token prediction) en el GGUF. Se trata de cabezales adicionales que en la práctica se asocian a decodificación especulativa o predicción de varios tokens por paso, pero la model card no especifica cómo se generaron, si están activos en la inferencia ni con qué configuración. Cualquier afirmación sobre ganancias de throughput derivadas de MTP requeriría validación empírica propia.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el campo `endpoints_compatible` indican que el repositorio está preparado para servirse mediante endpoints compatibles con la API de Transformers.
- Compatibilidad con Transformers: los shards nativos incluyen tokenizer y configuración, por lo que el modelo es cargable directamente con `transformers` en BF16.
- Inferencia en formato GGUF: la versión BF16 con tensores MTP permite su uso con runtimes de la familia llama.cpp.
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponible en la información proporcionada; deben consultarse en la model card upstream de Jackrong.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- No se documentan modos especiales (thinking mode, audio, visión) en este espejo.

## Casos de uso

- Verificación de integridad de artefactos: usar `archive-manifest.json` y el SHA-256 del GGUF (`995cbe2b…`) para comprobar que los pesos desplegados en producción coinciden bit a bit con la revisión publicada, algo crítico en auditorías de modelos.
- Reproducibilidad de experimentos: fijar la revisión `40c1fbe115db8a76ea0c594fc6759d39ffab4d15` para que una evaluación científica sea repetible meses después, aunque el repositorio upstream cambie o se elimine.
- Espejo de disponibilidad: desplegar el modelo desde este repositorio cuando el upstream no esté accesible o se prefiera una copia controlada con hashes publicados.
- Evaluación de la familia Qwen3.5 en tamaño 9B: servir el modelo en BF16 con Transformers para obtener líneas base de calidad antes de aplicar cuantizaciones propias.
- Punto de partida para cuantización a medida: al no incluir el autor cuantizaciones de 4 bits, un equipo puede generar sus propios GGUF Q4_K_M/Q5_K_M a partir del BF16 y comparar la degradación con una referencia exacta y verificable.
- Servicio conversacional en infraestructura propia: con `endpoints_compatible` y licencia Apache 2.0, es viable integrarlo en un backend tipo TGI o vLLM con la API de chat estándar, sujeto a la VRAM disponible.
- Archivado a largo plazo en organizaciones: conservar una copia con licencia permisiva y hashes conocidos para cumplir requisitos internos de procedencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo declara explícitamente que no se incluyen resultados de experimentos y que el repositorio no formula ninguna afirmación adicional sobre calidad.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan unos 18,4 GB (9,2 B × 2 bytes); con overhead de activaciones y KV cache, el consumo realista arranca en 20-22 GB para contextos cortos y crece con la longitud de contexto (que no está documentada).
- VRAM en el GGUF BF16: el fichero pesa 17,1 GiB, por lo que el requisito es equivalente; no hay en el repositorio ninguna variante de 8 o 4 bits que reduzca el suelo de memoria.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB son adecuadas y dejan margen para contextos largos y concurrencia.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) el margen es más ajustado. Tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) no admiten BF16 y requerirían cuantizar el modelo por cuenta propia.
- Despliegue: Transformers para los shards nativos, llama.cpp/Ollama para el GGUF BF16, y vLLM o TGI para servicio concurrente (la compatibilidad exacta con tensores MTP debe validarse en el runtime elegido).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens/s ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B MTP BF16 archive (este) | 9,2 B | No disponible | Apache 2.0 | Espejo público en HF, 0 descargas | Solo BF16 (safetensors + GGUF); incluye tensores MTP y manifiesto SHA-256 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (upstream) | 9,2 B (mismo modelo) | No disponible | Apache 2.0 | Repositorio original | Fuente de la que este espejo copia los ficheros; su model card es la referencia de capacidades |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF (upstream) | 9,2 B (mismo modelo) | No disponible | Apache 2.0 | Repositorio original | Origen del GGUF BF16 aquí archivado |
| Otras alternativas de ~8-9 B (Qwen3-8B, Llama 3.1 8B, Mistral 7B) | 7-9 B | No verificado en esta ficha | Variables según familia | Públicas | No se dispone de comparación de rendimiento con este modelo; no hay benchmarks publicados en la información disponible |

## Limitaciones y advertencias

- El repositorio es un espejo, no un modelo entrenado: no aporta model card técnica propia ni garantías de calidad; toda la información de capacidades y limitaciones debe tomarse de la card upstream.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües que permitan estimar su rendimiento relativo.
- Contexto e idiomas no documentados: planificar despliegues en producción sin conocer la ventana máxima real es arriesgado; hay que medirla empíricamente.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en este repositorio. Cualquier uso en producción requiere evaluación propia.
- Solo BF16: no hay cuantizaciones oficiales de 4 u 8 bits, lo que excluye GPUs de consumo con menos de 24 GB salvo que el equipo cuantice por su cuenta y valide la degradación.
- Tensores MTP sin documentar: se desconoce si el runtime los aprovecha; no asumir mejoras de velocidad sin medirlas.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar la card upstream por si el modelo base impone condiciones adicionales (por ejemplo, políticas de uso aceptable de la familia Qwen).
- Nombre potencialmente confuso: la combinación "DeepSeek-V4-Pro" y "Qwen3.5" en el identificador no implica que sea un modelo oficial de DeepSeek ni de Alibaba; es un artefacto de la comunidad.
- Estado del repositorio: creado y actualizado el 26 de octubre de 2026, con 0 descargas y 0 likes; no hay evidencia de uso ni de validación por terceros.
- La búsqueda web realizada no devolvió resultados pertinentes sobre el modelo (solo dominios sin relación), por lo que no se han podido contrastar datos externos.

## Enlaces

- Repositorio del espejo: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-BF16-archive
- Modelo base (upstream): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Revisión fijada del código nativo: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B/tree/40c1fbe115db8a76ea0c594fc6759d39ffab4d15
- Repositorio GGUF upstream: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Revisión fijada del GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF/tree/99b43f206bfe6e4e4c311d8fe5bf9b3a9d06d08e
- Manifiesto de hashes: `archive-manifest.json` dentro del repositorio
- Paper, blog, demo o repositorio de código adicionales: no disponibles en la información proporcionada
