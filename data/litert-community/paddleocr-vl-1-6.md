# litert-community/PaddleOCR-VL-1.6

## Resumen

PaddleOCR-VL-1.6 en formato LiteRT-LM es una conversión del modelo de document AI PaddleOCR-VL-1.6 de PaddlePaddle al formato `.litertlm` de Google, pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. Se trata del primer VLM especializado en parsing de documentos y OCR disponible en este formato. El paquete combina un encoder visual SigLIP de resolución dinámica estilo NaViT con un decodificador minúsculo ERNIE-4.5-0.3B, sumando aproximadamente 0,9 mil millones de parámetros y soporte para 109 idiomas.

El modelo resuelve un problema muy concreto: extraer texto, tablas, fórmulas, gráficos, sellos y posiciones de texto de imágenes de documentos en dispositivos móviles y equipos de sobremesa sin conexión a la nube. Es un modelo guiado por tarea (task-prompted): el prompt de texto selecciona la operación (`OCR:`, `Table Recognition:`, `Formula Recognition:`, `Chart Recognition:`, `Spotting:`, `Seal Recognition:`), de modo que una instrucción genérica como "describe esta imagen" no produce salida útil.

Su relevancia actual radica en que empaqueta un modelo de parsing documental de estado del arte (96,33 % en OmniDocBench v1.6 según la model card) en un fichero de aproximadamente 1,39 GB que se ejecuta en un Pixel 8a con backend CPU, con transcripción perfecta de una página de informe en 22 segundos y reconocimiento de tablas completo en 17 segundos. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: encoder visual SigLIP estilo NaViT (27 capas, hidden 1152) + adaptador MLP + decodificador ERNIE-4.5-0.3B (18 capas, hidden 1024, GQA kv2, head_dim 128) |
| Parametros totales | ~0,9 B (decodificador ~0,36 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (KV cache) |
| Tipos de cuantizacion | Vision encoder int8; adaptador int8; decodificador fp16; embedder externo fp16. La model card advierte que int4 e int8 entero corrompen la transcripción |
| Idiomas soportados | 109 idiomas (segun la model card del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `PaddleOCR-VL-1.6.litertlm` de ~1,39 GB |

## Arquitectura y entrenamiento

La arquitectura es un VLM de dos torres. El encoder visual es un SigLIP clase so400m con resolución dinámica estilo NaViT, fijado estáticamente a 560×560 píxeles: genera 1600 parches que se fusionan 2×2 hasta producir 400 tokens de imagen, con pesos en int8. Un adaptador compuesto por LayerNorm, fusión espacial 2×2 y un MLP de 4608→1024 proyecta esos tokens al espacio del decodificador. El decodificador es ERNIE-4.5-0.3B, un transformer de 18 capas con GQA (kv=2) y dimensión de cabeza 128, con pesos en fp16.

La model card no detalla el número de tokens de entrenamiento ni la composición del dataset del modelo base, aunque sí indica que el decodificador base utiliza M-RoPE tridimensional estilo Qwen2-VL. El contrato `fast_vlm` de LiteRT-LM sustituye esas posiciones por posiciones secuenciales simples: para tokens de texto es matemáticamente idéntico y para tokens de imagen se aplica una aproximación (el texto de la model card queda truncado en este punto). La conversión se validó con correlación 1.0 en fp32 y 0.9975 en int8 para la torre visual, sin operaciones FLEX/CUSTOM, y con paridad bit-exacta en logits fp32 del decodificador; los pesos fp16 empaquetados alcanzan correlación 1.0000 y top-1 10/10 en teacher forcing. El vocabulario SentencePiece conserva los 1019 tokens añadidos con sus ids exactos, lo que permite detokenizar correctamente las marcas estructuradas `<fcel>`/`<nl>`.

## Capacidades

- Reconocimiento de texto OCR a nivel de página, párrafo y línea mediante el prompt `OCR:`.
- Reconocimiento de tablas con salida estructurada en celdas mediante `<fcel>` y saltos `<nl>`, activado con `Table Recognition:`.
- Reconversión de fórmulas a LaTeX con `Formula Recognition:`.
- Parsing de gráficos con `Chart Recognition:`.
- Detección de texto con cajas delimitadoras mediante tokens `<|LOC_*|>`, activada con `Spotting:`.
- Reconocimiento de sellos y estampillas con `Seal Recognition:`.
- Capacidad multilingüe declarada sobre 109 idiomas.
- Entrada multimodal imagen-texto con prompt de texto que selecciona la tarea.
- No dispone de tool calling, function calling ni modo agente multi-paso según la información disponible.
- No se documenta modo thinking ni entrada de audio.

## Casos de uso

- Digitalización de facturas y albaranes en movilidad: con `OCR:` el modelo transcribe líneas de texto, importes y direcciones de correo en un Pixel 8a en unos 22 segundos, lo que permite capturar documentos desde el móvil sin subir datos a la nube.
- Extracción de tablas de informes financieros: con `Table Recognition:` devuelve celdas estructuradas con la fila de totales incluida (verificado en 17 segundos en Pixel 8a), adecuado para pipelines de contabilidad que necesitan datos tabulares exactos.
- Procesamiento de artículos científicos y documentación técnica: `Formula Recognition:` convierte ecuaciones a LaTeX y `OCR:` extrae el cuerpo de texto, útil para alimentar bases de conocimiento o repositorios de documentación.
- Archivado y clasificación de documentos escaneados en kioscos o escáneres de oficina: el bundle corre en macOS, Linux y Windows con el mismo fichero, lo que simplifica el despliegue en puestos de digitalización sin GPU dedicada.
- Análisis de gráficos en informes corporativos: `Chart Recognition:` permite extraer la estructura de gráficos de barras o líneas para su posterior tabulación.
- Verificación documental con localización de texto: `Spotting:` devuelve texto junto con cajas `<|LOC_*|>`, útil para resaltar campos en visores de documentos o para comprobar la presencia de cláusulas en contratos.
- Reconocimiento de sellos en documentación administrativa: `Seal Recognition:` extrae el texto de sellos y estampillas en escrituras o certificados.
- Servicio local compatible con OpenAI: `litert-lm serve` expone el bundle como API local, lo que permite integrarlo en aplicaciones existentes que ya consumen la interfaz de OpenAI sin cambios de cliente.

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.15.0) en Apple M4 Max, con `-p 256 -d 256 --runs 3`, máximo de 4096 tokens y ejecución de calentamiento descartada. Estas cifras cubren la ruta de texto; el encoder visual se ejecuta una vez por imagen y no está incluido.

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 653 tok/s | 53,2 tok/s | 0,50 s |
| Apple M4 Max (macOS) | GPU (Metal) | 4391 tok/s | 208,3 tok/s | 0,07 s |
| Galaxy S26 (edge-compat) | GPU | 1239 tok/s | 35,6 tok/s | 190 ms |
| Galaxy S26 (edge-compat) | CPU | no ejecutado (degenerate_output) | no ejecutado | no ejecutado |

En el Galaxy S26 con LiteRT-LM 0.16.0 y backend GPU se delegaron las 914 operaciones (medición del 2026-08-24); la ejecución en CPU del mismo dispositivo no llegó a producir salida válida (degenerate_output, 2026-09-05).

Calidad: la model card declara 96,33 % en OmniDocBench v1.6 para el modelo base PaddleOCR-VL-1.6, por delante de alternativas abiertas y cerradas de cualquier tamaño. En verificación en dispositivo (Pixel 8a, Google AI Edge Gallery 1.0.15, backend CPU, este mismo bundle) la página OCR sintética se transcribió de forma perfecta en 22 segundos y la tabla con todas sus celdas y la fila Total en 17 segundos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

## Requisitos de hardware

- Tamaño del bundle: ~1,39 GB en disco; el repositorio completo ocupa 5,6 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el fichero empaquetado de 1,39 GB da una cota inferior práctica, con un decodificador fp16 de ~0,36 B y encoder int8.
- Cabe en dispositivos móviles de gama alta: verificado en Pixel 8a con backend CPU y en Galaxy S26 con backend GPU.
- Cabe en equipos de sobremesa sin GPU dedicada: validado en Apple M4 Max con backend CPU a 53,2 tok/s de decodificación.
- GPU recomendadas: no se especifican modelos concretos; el backend GPU verificado es Metal en Apple M4 Max y GPU en Galaxy S26. No hay datos para A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run` y `litert-lm serve` con API compatible con OpenAI, en macOS, Linux y Windows). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia observada: TTFT de 0,07 s en M4 Max GPU y 190 ms en Galaxy S26 GPU; tiempo de extremo a extremo de 22 s para OCR de página y 17 s para tabla en Pixel 8a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-VL-1.6 (LiteRT-LM, este) | ~0,9 B | 4096 | `.litertlm`, LiteRT-LM | Apache-2.0 | Especializado en OCR y parsing documental, on-device |
| PaddlePaddle/PaddleOCR-VL-1.6 (base) | ~0,9 B | no disponible | pesos originales (eager) | Apache-2.0 | Referencia de precisión completa; 96,33 % en OmniDocBench v1.6 |
| Alternativas VLM generalistas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que la comparativa cuantitativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Modelo guiado por tarea: los prompts genéricos como "describe esta imagen" no devuelven nada; es obligatorio usar las etiquetas de tarea (`OCR:`, `Table Recognition:`, etc.).
- Resolución de imagen fija: la entrada se redimensiona a 560×560 y se generan 400 tokens de imagen; documentos con texto muy pequeño o páginas densas pueden perder detalle.
- Contexto limitado a 4096 tokens en la caché KV, insuficiente para documentos muy extensos en una sola pasada.
- Sensibilidad extrema a la cuantización: la model card indica que int4 e int8 entero corrompen la transcripción del decodificador, por lo que se empaqueta en fp16 con un coste extra de ~460 MB.
- Ejecución en CPU no fiable en al menos un dispositivo: Galaxy S26 con backend CPU no produjo salida válida (degenerate_output) en la medición del 2026-09-05.
- La sustitución de M-RoPE tridimensional por posiciones secuenciales en el contrato `fast_vlm` es una aproximación para los tokens de imagen; la model card no cuantifica su impacto en precisión.
- Riesgo de alucinación en campos no presentes en la imagen no cuantificado en la información disponible; en OCR la exactitud es crítica y no hay métricas de tasa de error publicadas.
- Idiomas: se declaran 109 idiomas, pero no se detalla la cobertura ni la calidad por idioma.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base PaddlePaddle/PaddleOCR-VL-1.6.
- No se documentan sesgos conocidos en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/PaddleOCR-VL-1.6
- Fichero de pesos: https://huggingface.co/litert-community/PaddleOCR-VL-1.6/blob/main/PaddleOCR-VL-1.6.litertlm
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Registro de compatibilidad edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/paddleocr-vl-1.6/CARD.md
