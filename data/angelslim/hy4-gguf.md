# AngelSlim/Hy4-GGUF

## Resumen

Hy4-GGUF es una colección de cuantizaciones en formato GGUF del modelo Hy4-flash (identificado internamente como Hy4 VL, clase `HYV4VLForConditionalGeneration`), desarrollado por Tencent y distribuido en este repositorio por AngelSlim, el equipo del toolkit de compresión de modelos del mismo fabricante. Se trata de un modelo de lenguaje multimodal de tipo Mixture-of-Experts con 256 expertos enrutados y 78 capas, del que se publican cuatro ficheros: tres cuantizaciones del modelo de texto y un codificador visual independiente en formato mmproj.

La relevancia de esta ficha está en que las cuantizaciones permiten ejecutar un modelo de escala muy grande en hardware de un solo nodo de 8 GPU. La variante Q4_K_M ocupa 437,93 GiB, la IQ2 309,58 GiB y la STQ1_0 214,65 GiB, esta última mediante una receta de precisión mixta con tensores ternarios de 1,3125 bits por peso en las proyecciones de los expertos enrutados. El codificador visual, un ViT estilo SigLIP de 40 capas, se distribuye aparte en BF16 con 2,49 GiB.

El modelo base está etiquetado como `tencent/Hy4-flash` y el repositorio declara soporte para chino e inglés. La licencia no está especificada en la información disponible, lo que constituye una limitación importante para cualquier evaluación de uso comercial. El repositorio se creó el 16 de noviembre de 2026 y se actualizó cuatro días después; en el momento de la consulta registra cero descargas y cero likes, y el propio autor marca el estado como "UPLOADING".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision), 256 expertos enrutados, 78 capas |
| Parametros totales | 1.235.125.248 según safetensors del repo; no obstante, los ficheros GGUF publicados implican un modelo base de escala muy superior (ver advertencia en limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; los ejemplos de ejecución usan `-c 8192` y `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (4,89 bpw), IQ2 mixta (3,45 bpw), STQ1_0 de precisión mixta (2,39 bpw); mmproj en BF16 con pesos de convolución y tabla de posiciones en F32 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (texto y mmproj separados); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con 78 capas y 256 expertos enrutados, implementado en la clase `HYV4VLForConditionalGeneration`. La torre de visión es un codificador estilo SigLIP de 40 capas, anchura 1536 y parche de 16 píxeles, con una rejilla de posiciones aprendida de 128x128. El proyector, denominado `rmsnorm_mlp_adapter`, aplica RMSNorm, una convolución 2x2 con stride, GELU y una convolución 1x1 que proyecta a 6144 dimensiones, añadiendo además un token de salto de línea por cada fila de tokens de imagen. El modelo de texto emplea M-RoPE intercalado (IMROPE), con `rope.dimension_sections = [12, 10, 10, 0]` y las filas de RoPE almacenadas en orden NeoX; para prompts exclusivamente de texto la rotación equivale a la de un RoPE plano.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card únicamente documenta el proceso de cuantización y conversión a GGUF, no el entrenamiento del modelo base. La innovación técnica destacable es la receta de cuantización STQ1_0, procedente del PR #22836 de llama.cpp: pesos ternarios en {-d, 0, +d} con una de cada cuatro vías forzada a cero (dispersión 3:4), codificados como un código de 4 bits más un selector de tabla de 1 bit sobre un codebook de 32 entradas, con una escala fp16 por cada 256 pesos, lo que resulta en 42 bytes por cada 256 pesos, es decir, 1,3125 bits por peso. En la variante publicada, las proyecciones `gate`/`up` de los expertos enrutados usan STQ1_0 en 28 de 30 capas y IQ2_XXS (2,0625 bpw) en el resto.

## Capacidades

- Generación de texto y razonamiento: el modelo "piensa antes de responder", según la model card, por lo que requiere reservar tokens suficientes para la fase de razonamiento.
- Comprensión de imágenes: acepta entradas visuales redimensionadas con interpolación bicúbica, en múltiplos de 32 píxeles y entre 4096 y 4.194.304 píxeles, lo que supone entre 4 y 4096 tokens por imagen más un token de salto de línea por fila.
- Conversación multi-turno mediante plantilla de chat propia, que exige `--jinja` en llama.cpp al no coincidir con ninguna familia integrada.
- Soporte de servidor compatible con la API de OpenAI (texto e imágenes) a través de `llama-server`.
- Capacidades multilingües limitadas a chino e inglés según las etiquetas del repositorio.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Análisis documental con imágenes: el modelo puede procesar páginas escaneadas, gráficos o capturas y responder preguntas sobre ellas, gracias al codificador visual SigLIP de 40 capas y a la ventana de contexto configurable hasta 32768 tokens en los ejemplos del autor.
- Asistencia conversacional en chino e inglés: la plantilla de chat propia y el modo de razonamiento previo a la respuesta permiten diálogos multi-turno con contexto largo, adecuados para atención al cliente en mercados bilingües.
- Despliegue en servidor compatible con OpenAI: mediante `llama-server` con `--host 0.0.0.0 --port 8080` se puede integrar en aplicaciones existentes que ya consuman la API de OpenAI, sin adaptar el cliente.
- Procesamiento por lotes de texto en un nodo de 8 GPU: la variante IQ2 (309,58 GiB) o STQ1_0 (214,65 GiB) cabe en un nodo de 8x H20 de 96 GiB y permite ejecutar inferencia por lotes sobre corpus bilingües.
- Evaluación de técnicas de cuantización extrema: la receta STQ1_0 con dispersión 3:4 y precisión mixta sirve como banco de pruebas para investigadores que estudien la degradación de calidad en modelos MoE de gran escala.
- Investigación en multimodalidad con M-RoPE: el uso de secciones de RoPE multidimensionales permite experimentar con posiciones de tokens de imagen y texto en un mismo contexto, útil para estudiar el comportamiento posicional en modelos visión-lenguaje.
- Despliegue en almacenamiento local con mmap: los ejemplos del autor con `-lm none` permiten leer secuencialmente los GGUF desde disco, lo que facilita servir el modelo en entornos sin suficiente memoria para cargarlo completo.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados (`Hy4-GGUF-BENCH.png`) pero no presenta los valores numéricos en texto. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para residencia completa: aproximadamente 438 GiB para Q4_K_M, 310 GiB para IQ2 y 215 GiB para STQ1_0, más la caché KV y unos 3 GiB adicionales para el mmproj.
- Un nodo de 8x H20 con 96 GiB por GPU (768 GiB totales) aloja cualquiera de las tres variantes; con menos memoria debe reducirse `-ngl` para descargar capas a CPU.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GiB) ni configuraciones multi-GPU domésticas habituales pueden alojar estos ficheros, ni siquiera parcialmente con rendimiento práctico.
- Opciones de despliegue: llama.cpp con una rama específica (PR #32517, commit `f8d4cc414`, rama `hy4-flash`) y, para STQ1_0, el parche `0001-stq1_0-quant-and-cuda.patch` que añade el tipo a ggml (referencia CPU, ARM NEON, dequantize/MMVQ/MUL_MAT_ID en CUDA), gguf-py y `llama-quantize`.
- `llama-server` ofrece endpoint compatible con OpenAI; `llama-mtmd-cli` y `llama-cli` cubren uso interactivo de imagen+texto y solo texto respectivamente.
- Limitación de rendimiento conocida: STQ1_0 no tiene kernel MMQ, por lo que el procesamiento de prompt sobre esos tensores pasa por dequantize + cuBLAS, lo que penaliza la fase de prefill.
- Latencia y throughput: no disponibles.
- Advertencia de despliegue: con almacenamiento en red (NFS) los page faults aleatorios del mmap pueden ser muy lentos; se recomienda copiar el GGUF a disco local o usar `-lm none` (`--no-mmap` en versiones antiguas).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Inconsistencia crítica en el recuento de parámetros: los safetensors del repositorio declaran 1.235.125.248 parámetros, pero los GGUF publicados implican un modelo base de cientos de miles de millones de parámetros (el fichero Q4_K_M pesa 437,93 GiB). Cualquier estimación de hardware o coste debe basarse en el tamaño de los ficheros, no en el dato de safetensors.
- Licencia no disponible: no puede determinarse si el uso comercial está permitido. Es imprescindible consultar el repositorio del modelo base `tencent/Hy4-flash` antes de cualquier despliegue en producción.
- Estado del repositorio: el autor lo marca como "UPLOADING", con cero descargas y cero likes; los ficheros pueden estar incompletos o cambiar.
- Requiere una rama no fusionada de llama.cpp (PR #32517) y, para STQ1_0, un parche adicional; no funciona con la versión estándar de llama.cpp ni con vLLM, Ollama o TGI según la información disponible.
- Incompatibilidad de parches: el parche distribuido con `AngelSlim/Hy4-preview-GGUF` usa el identificador de tipo 43 para STQ1_0, mientras que este repositorio usa el 44; mezclarlos corrompe la carga de tensores.
- El modelo base no está entrenado para español: solo se declaran chino e inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por tratarse de un modelo de lenguaje generativo sin ficha de evaluación publicada.
- La plantilla de chat no coincide con ninguna familia integrada de llama.cpp; sin `--jinja` el chat no funciona correctamente.
- El modo de razonamiento previo consume tokens: con `-n` o `max_tokens` ajustados se pueden truncar las respuestas.
- Las herramientas en Python que lean estos ficheros deben usar el `gguf-py` del árbol parcheado con ruta absoluta, lo que complica la integración en pipelines estándar.
- El procesamiento de imágenes requiere un GGUF de texto con secciones de RoPE; el modelo rechaza textos sin ellas porque los tokens de imagen necesitan posiciones M-RoPE.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Informe técnico (arXiv): https://arxiv.org/abs/2602.21233
- Documentación de AngelSlim: https://angelslim.readthedocs.io/
- Organización AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- Organización AngelSlim en ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub de AngelSlim: https://github.com/Tencent/AngelSlim
- Repositorio previo de cuantizaciones: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Rama de llama.cpp utilizada: https://github.com/Little0o0/llama.cpp (commit `f8d4cc414`, PR #32517, rama `hy4-flash`)
- PR de llama.cpp del formato STQ1_0: https://github.com/ggml-org/llama.cpp/pull/22836
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Discord de AngelSlim: https://discord.com/invite/dHVNeuNdFt
