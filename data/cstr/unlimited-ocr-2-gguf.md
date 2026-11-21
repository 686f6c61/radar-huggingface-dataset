# cstr/Unlimited-OCR-2-GGUF

## Resumen

Unlimited-OCR-2 es un modelo de OCR y comprensión de documentos desarrollado por Baidu, publicado originalmente en formato PyTorch bajo licencia MIT. Esta ficha describe la conversión a GGUF realizada por el usuario cstr para el runtime nativo ggml de CrispEmbed, que permite ejecutar el modelo en CPU sin depender de PyTorch ni CUDA. El modelo resuelve tareas de image-text-to-text orientadas a extracción de texto, tablas, recibos y documentos multilingües, incluyendo la predicción de coordenadas de cajas delimitadoras para tareas de layout.

La arquitectura es un transformer de tipo MoE (mixture of experts) con atención basada en DeepSeek-V2, según los tags del repositorio, y cuenta con 3.343.978.240 parámetros totales según los safetensors del modelo base. El repositorio GGUF ocupa 26,5 GB e incluye tres precisiones: F16, Q8_0 y una variante experimental Q4_K_MIX. La relevancia actual radica en que ofrece una vía de despliegue ligera (CPU, ggml) para un modelo de OCR de gran calidad, con verificaciones de paridad token a token frente al original en PyTorch.

El autor de la conversión documenta con detalle el estado de calidad de cada archivo: F16 es la opción recomendada por ser idéntica en IDs de token al modelo original en las cuatro páginas de prueba; Q8_0 presenta una advertencia por divergencias menores en coordenadas de cajas; y Q4_K_MIX se marca como experimental, ya que solo preserva el texto reconocido tras eliminar las cajas de layout.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención estilo DeepSeek-V2 (según tags del repo) |
| Parametros totales | 3.343.978.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_MIX (experimental) |
| Idiomas soportados | no disponible (la prueba de calidad incluye una página en alemán) |
| Licencia | MIT (Copyright (c) 2026 Baidu) |
| Formato de pesos | GGUF (F16: 6.692.751.392 bytes; Q8_0: 3.571.946.656 bytes; Q4_K_MIX: 2.295.035.584 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) y atención basada en DeepSeek-V2, según los tags declarados en el repositorio. La conversión a GGUF se realizó con el script `models/convert-unlimited-ocr-to-gguf.py` de CrispEmbed, partiendo de la revisión fijada `04647c7a6098d8d58915f003536a741c82eafb40` de `baidu/Unlimited-OCR-2`, verificando ambos shards de safetensors contra los hashes SHA256 documentados en `docs/unlimited-ocr2-source.json`. Las variantes cuantizadas se generaron con la herramienta propia `crispembed-quantize` (`tools/quantize.cpp`), que mantiene los tensores 1-D en su tipo de origen y aplica un suelo Q8_0 a embeddings, router, lm_head y visión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta conversión es la paridad verificada: en páginas sin mosaico (untiled), los IDs de token generados son exactamente idénticos al modelo original en PyTorch (65 tokens en `small-untiled`); en páginas con mosaico (4x3 tiles, 1503 tokens de visión), la paridad exacta se alcanza en 2 de las páginas de prueba desde el commit `595156ea` de CrispEmbed. El decodificador rápido opcional reproduce token a token el decodificador exacto en las tres páginas evaluadas.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con salida de texto en UTF-8.
- Extracción de tablas y estructura de documentos, incluyendo predicción de coordenadas de cajas delimitadoras (layout boxes).
- Procesamiento de recibos y documentos financieros (la prueba de calidad incluye un recibo).
- Procesamiento de documentos multilingües (la prueba incluye una página en alemán).
- Pipeline image-text-to-text, es decir, entrada de imagen más texto y salida de texto.
- Procesamiento por mosaicos (tiling) para páginas de alta resolución: 4x3 tiles con 1503 tokens de visión.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, modo thinking, visión general, audio u otras capacidades especiales en la información proporcionada.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede procesar páginas escaneadas y devolver texto estructurado, con cajas de layout que permiten reconstruir la disposición original del documento; la variante F16 garantiza paridad token a token con el original en PyTorch.
- Extracción de datos de recibos y facturas: la prueba de calidad del autor incluye un recibo, lo que indica que el modelo está orientado a este tipo de documentos; la salida de coordenadas permite asociar cada campo a su posición en la imagen.
- Procesamiento de tablas en informes: el modelo predice cajas delimitadoras y texto de tablas, útil para pipelines de extracción de datos tabulares desde PDFs escaneados.
- Despliegue en CPU sin GPU: gracias al runtime ggml de CrispEmbed, el modelo puede ejecutarse en entornos sin CUDA, lo que facilita su integración en servidores modestos o en procesamiento por lotes de bajo coste.
- OCR multilingüe en documentos europeos: la prueba con una página en alemán sugiere soporte para lenguas distintas del inglés, aunque no se detalla la lista completa de idiomas.
- Integración en aplicaciones de escritorio o embebidas: el formato GGUF y el tamaño reducido de la variante Q4_K_MIX (2.295.035.584 bytes) permiten incluir el modelo en aplicaciones con requisitos de espacio limitados, aceptando la pérdida de precisión en coordenadas de layout.
- Verificación y auditoría de conversiones: el repositorio incluye recibos de paridad y hashes SHA256, lo que permite a equipos de investigación validar la fidelidad de la conversión antes de usarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor documenta métricas de paridad y calidad de cuantización, que se resumen a continuación:

| Precision | Tamano | IDs de token vs original (4 paginas con mosaico) | Texto decodificado | Coseno de logits finales (min, teacher-forced) | Estado |
|---|---:|---|---|---|---|
| F16 | 6.383 MiB | 4/4 exactos | UTF-8 byte-exacto 4/4 | referencia para Q4_K_MIX | recomendado |
| Q8_0 | 3.397 MiB | 2/4 exactos; tabla en token 7, recibo en tokens 131 y 258 | texto sin cambios; una coordenada de caja desviada 1-3 por divergencia | 0.9739 CPU / 0.9555 CUDA | con advertencia |
| Q4_K_MIX | 2.188,6 MiB | 0/4 exactos vs F16; primera divergencia en paragraphs@30, table@10, receipt@28, german@4 | texto igual a F16 tras eliminar cajas 4/4; coordenadas de caja difieren (máx. 2 px); CER no medido | 0.9634 CPU / 0.9540 CUDA T4; acuerdo top-1 0.980-0.993 | experimental |

Además, en páginas sin mosaico la conversión F32 es token-ID exacta (65 tokens en `small-untiled`), y un barrido de precisión en CPU encontró que F16 y Q8_0 también son token-ID exactos en esa página, mientras que Q4_K y las variantes Q4 mixtas no lo son.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia de tamaño de archivo, F16 ocupa 6.383 MiB, Q8_0 3.397 MiB y Q4_K_MIX 2.188,6 MiB, por lo que la memoria necesaria será del orden del tamaño del archivo más overhead del runtime.
- GPU recomendadas: no se especifican en la información proporcionada; las pruebas de paridad se realizaron en CPU y en una GPU T4 (para las métricas CUDA de Q4_K_MIX).
- ¿Cabe en GPU de consumo? No se indica explícitamente, pero por tamaño de archivo las variantes Q8_0 y Q4_K_MIX caben en GPUs de consumo con 4-8 GB de VRAM, sujeto a verificación con el runtime.
- Opciones de despliegue: runtime nativo ggml de CrispEmbed (https://github.com/CrispStrobe/CrispEmbed); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa posible es con el propio modelo original en PyTorch (`baidu/Unlimited-OCR-2`), del que esta conversión es una cuantización:

| Aspecto | Unlimited-OCR-2 (original) | Unlimited-OCR-2 GGUF (esta ficha) |
|---|---|---|
| Formato | Safetensors (PyTorch) | GGUF (ggml) |
| Runtime | PyTorch / CUDA | CrispEmbed (CPU y CUDA) |
| Precisiones | Original | F16, Q8_0, Q4_K_MIX |
| Paridad | Referencia | F16 exacta en IDs de token (4/4 páginas con mosaico) |
| Licencia | MIT | MIT |

## Limitaciones y advertencias

- La variante Q4_K_MIX es experimental: no es token-ID exacta en ninguna de las cuatro páginas de prueba y solo preserva el texto tras eliminar las cajas de layout; la calidad en escaneos reales y en Metal no se ha medido.
- La variante Q8_0 tiene una advertencia: en CUDA el coseno de logits finales (0.9555) está por debajo del umbral de 0.97 establecido por el autor, y las coordenadas de caja pueden desviarse 1-3 unidades en 2 de 4 páginas con mosaico.
- Riesgo de alucinación: no se documenta explícitamente en la información proporcionada, pero es un riesgo inherente a los modelos generativos de OCR; conviene validar la salida en dominios críticos.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no está disponible; solo se confirma una prueba con alemán.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el repositorio de conversión no incluye un archivo LICENSE propio y toma el texto MIT del repositorio de código upstream de Baidu; conviene verificar la atribución al redistribuir.
- El repositorio de conversión no incluye el README original modificado (se conserva como `UPSTREAM_README.md` sin cambios), por lo que las capacidades exactas del modelo base deben consultarse en la model card original.
- No se dispone de datos sobre latencia, throughput ni requisitos oficiales de memoria, lo que dificulta el dimensionamiento en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/Unlimited-OCR-2-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2/tree/04647c7a6098d8d58915f003536a741c82eafb40
- Repositorio de código upstream (licencia MIT): https://github.com/baidu/Unlimited-OCR/blob/6e64831ab434b689ba1a28ede703b6d7d05cd714/LICENSE
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
