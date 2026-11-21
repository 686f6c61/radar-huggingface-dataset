# litert-community/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 es un modelo de visión-lenguaje (VLM) especializado en análisis de documentos y OCR, desarrollado originalmente por PaddlePaddle y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivo (on-device). Combina un codificador visual SigLIP de resolución dinámica estilo NaViT con el decodificador ERNIE-4.5-0.3B, sumando aproximadamente 0,9B de parámetros totales. Su empaquetado compacto lo sitúa como una opción viable para inferencia en móviles y dispositivos edge.

El modelo se presenta como estado del arte en parsing de documentos abiertos, con una puntuación de 96,33% en OmniDocBench v1.6, por delante de alternativas abiertas y cerradas de cualquier tamaño según la model card. Soporta 109 idiomas y funciona mediante *task prompting*: el usuario selecciona la tarea (OCR, reconocimiento de tablas, fórmulas, gráficos, spotting o sellos) mediante el texto del prompt, en lugar de instrucciones genéricas.

La relevancia actual radica en su formato `.litertlm`, pensado para el runtime LiteRT-LM de Google, que permite desplegar un VLM de parsing documental directamente en un smartphone con aceleración GPU. El repositorio incluye dos variantes de pesos (fp16 e int8) con métricas de rendimiento medidas en dispositivos Galaxy S26 y Pixel 11 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual SigLIP-so400m-class NaViT (27 capas, hidden 1152, resolución estática 560×560) + adaptador MLP + decodificador ERNIE-4.5-0.3B (18 capas, hidden 1024, GQA kv2, head_dim 128) |
| Parametros totales | ~0,9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | fp16 (decodificador) e int8 por canal de salida en las 127 capas lineales del decodificador; codificador y adaptador en int8 |
| Idiomas soportados | 109 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `PaddleOCR-VL-1.6.litertlm` (~1,39 GB) y `PaddleOCR-VL-1.6_decoder_int8.litertlm` (~1,04 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres: un codificador visual SigLIP de tipo NaViT con resolución dinámica, fijada estáticamente a 560×560 píxeles en esta conversión, que genera 1600 parches reducidos mediante un merge 2×2 a 400 tokens de imagen. Un adaptador compuesto por LayerNorm, merge espacial 2×2 y una MLP de 4608→1024 proyecta las características visuales al espacio del decodificador. El decodificador es ERNIE-4.5-0.3B, un transformer de 18 capas con atención GQA (kv2) y dimensión de cabeza 128, con tabla de embeddings en fp16 separada.

La normalización de imagen (media/desviación de 0,5) está incorporada directamente en el codificador. En la variante int8, las 127 capas lineales del decodificador (siete por capa más la cabeza de salida) usan cuantización int8 por canal de salida, mientras que la tabla de embeddings permanece en fp16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el 15 de noviembre de 2026 se reescribió el grafo de prefill/decode para GPU sin modificar ningún peso.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) a nivel de página, párrafo y línea mediante el prompt `OCR:`.
- Reconocimiento de tablas y conversión a celdas estructuradas en formato `<fcel>`/`<nl>` mediante `Table Recognition:`.
- Reconocimiento de fórmulas y conversión a LaTeX mediante `Formula Recognition:`.
- Parsing de gráficos mediante `Chart Recognition:`.
- Detección de texto con cajas delimitadoras mediante tokens `<|LOC_*|>` con `Spotting:`.
- Reconocimiento de sellos y estampillas mediante `Seal Recognition:`.
- Soporte multilingüe en 109 idiomas.
- Procesamiento de imágenes de entrada redimensionadas a 560×560 por el runtime.
- No soporta instrucciones genéricas: un prompt como "describe esta imagen" no devuelve salida; requiere selección explícita de tarea.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes en aplicaciones móviles: el modelo ejecuta OCR sobre imágenes capturadas por la cámara del teléfono y extrae texto estructurado sin conexión a la nube, gracias a su tamaño de ~1 GB y su ejecución on-device con LiteRT-LM.
- Extracción de tablas de informes financieros: con el prompt `Table Recognition:` convierte tablas escaneadas en celdas estructuradas aptas para su volcado a hojas de cálculo o bases de datos, útil en aplicaciones de contabilidad móvil.
- Conversión de fórmulas científicas a LaTeX: investigadores y estudiantes pueden fotografiar ecuaciones manuscritas o impresas y obtener el código LaTeX correspondiente mediante `Formula Recognition:`.
- Procesamiento de documentos en entornos sin conectividad: al ejecutarse localmente en dispositivos edge, permite escanear y digitalizar documentación en campo, zonas rurales o entornos aislados sin depender de servicios cloud.
- Accesibilidad para personas con discapacidad visual: integración en aplicaciones de lectura que transcriben texto impreso en tiempo real usando la GPU del dispositivo, con latencias de TTFT de 190 ms en Galaxy S26.
- Digitalización de archivos históricos multilingües: el soporte de 109 idiomas y el reconocimiento de sellos (`Seal Recognition:`) permiten procesar documentos antiguos con estampillas y texto en varios idiomas.
- Automatización de la entrada de datos en aplicaciones empresariales: el formato int8, con un pico de memoria de 1,99 GB en CPU de Galaxy S26, permite desplegar el modelo en dispositivos con recursos limitados para extraer datos de formularios y contratos.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado |
|---|---|
| OmniDocBench v1.6 | 96,33% |
| Decode (Galaxy S26, GPU, LiteRT-LM 0.19.0, fichero fp16) | 65,8 tok/s |
| Prefill 1024 tokens (Galaxy S26, GPU, LiteRT-LM 0.19.0, fichero fp16) | 1.810 tok/s |
| Decode (Galaxy S26, GPU, LiteRT-LM 0.16.0, ficheros anteriores) | 35,6 tok/s |
| Prefill (Galaxy S26, GPU, LiteRT-LM 0.16.0, ficheros anteriores) | 1.239 tok/s |
| TTFT (Galaxy S26, GPU, LiteRT-LM 0.16.0) | 190 ms |
| Delegación de operaciones (Galaxy S26, GPU) | 914 de 914 operaciones delegadas |
| Decode (Galaxy S26, CPU, fichero int8) | 2,5–2,9× más rápido que fp16 |
| Pico de memoria (Galaxy S26, CPU, int8 vs fp16) | 1,99 GB vs 4,21 GB |
| Ejecución en CPU (Galaxy S26, LiteRT-LM 0.16.0) | No ejecutó: `degenerate_output` |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~1,39 GB para el fichero fp16 y ~1,04 GB para el fichero int8; pico de memoria medido de 4,21 GB (fp16) y 1,99 GB (int8) en CPU de Galaxy S26.
- GPU recomendadas: aceleración validada en GPU de Galaxy S26 (914/914 operaciones delegadas); se mencionan mediciones en Pixel 11 Pro sin detallar resultados.
- Cabe en dispositivos móviles de gama alta (Galaxy S26, Pixel 11 Pro); no se documenta su ejecución en GPU de escritorio (A100, H100, RTX 4090).
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), con CLI `litert-lm run` y soporte de `--from-huggingface-repo`; backend GPU o CPU.
- Latencia y throughput: TTFT de 190 ms, prefill de 1.810 tok/s y decode de 65,8 tok/s en Galaxy S26 GPU con LiteRT-LM 0.19.0; en CPU conviene usar el fichero int8 por su mayor velocidad de decode y menor consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (LiteRT-LM) | ~0,9B | 4096 | `.litertlm`, on-device | Apache-2.0 | 96,33% en OmniDocBench v1.6; 109 idiomas |
| PaddleOCR-VL-1.6 (original) | ~0,9B | no disponible | Safetensors / PaddlePaddle | Apache-2.0 | Modelo base del que deriva esta conversión |
| Alternativas de parsing documental | no disponible | no disponible | no disponible | no disponible | La model card afirma superar alternativas abiertas y cerradas en OmniDocBench v1.6, sin detallarlas |

No se dispone de datos de benchmarks comparativos con modelos concretos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo requiere *task prompting*: instrucciones genéricas como "describe esta imagen" no producen salida; es necesario usar los prompts predefinidos (`OCR:`, `Table Recognition:`, etc.).
- En CPU de Galaxy S26 con LiteRT-LM 0.16.0 la ejecución falló con `degenerate_output`; se recomienda usar el fichero int8 en CPU y versiones recientes del runtime.
- La resolución de imagen está fijada a 560×560 por el runtime, lo que puede limitar la precisión en documentos de muy alta resolución o texto muy pequeño.
- El contexto está limitado a 4096 tokens de KV cache, insuficiente para documentos muy extensos en una sola pasada.
- No se documentan sesgos conocidos, tasas de alucinación ni restricciones adicionales de licencia más allá de Apache-2.0, que permite uso comercial.
- La licencia Apache-2.0 del modelo base se mantiene en la conversión, pero conviene verificar las condiciones del runtime LiteRT-LM para uso en producción.
- Solo se han validado las versiones de LiteRT-LM 0.19.0 a 0.19.2 con los ficheros actuales; runtimes anteriores no fueron probados.
- El rendimiento medido corresponde a dispositivos concretos (Galaxy S26, Pixel 11 Pro) y puede no extrapolarse a otros hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/PaddleOCR-VL-1.6
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/paddleocr-vl-1.6/CARD.md
