# AngelSlim/Hy4-GGUF

## Resumen

Hy4-GGUF es la colección de cuantizaciones GGUF del modelo Hy4 (A49B) publicado por Tencent, distribuidas por el usuario AngelSlim dentro del ecosistema de la herramienta de compresión AngelSlim. Se trata de un modelo multimodal de tipo visión-lenguaje (`HYV4VLForConditionalGeneration`) con arquitectura Mixture-of-Experts de 256 expertos enrutados y 78 capas, cuyo checkpoint en safetensors suma 769.907.408.797 parámetros totales. El repositorio incluye además el codificador visual como archivo `mmproj` independiente.

La relevancia de esta publicación es práctica: un modelo de ese tamaño no cabe en ningún hardware de consumo en precisión completa, de modo que las cuantizaciones GGUF son la vía para ejecutarlo con llama.cpp. El autor ofrece tres variantes que van de 437,93 GiB (Q4_K_M, 4,89 bpw) a 214,65 GiB (STQ1_0, 2,39 bpw), incluyendo una receta de precisión mixta propia basada en el formato ternario STQ1_0 con dispersión 3:4.

El modelo está pensado para despliegue en servidores multi-GPU: la variante más pequeña requiere unos 215 GiB de VRAM para residencia completa, lo que encaja en un nodo de 8x H20. Soporta prompts de imagen y texto, plantilla de chat propia (requiere `--jinja`) y modo de razonamiento previo a la respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (visión-lenguaje), 256 expertos enrutados, 78 capas |
| Parametros totales | 769.907.408.797 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de ejecución usan `-c 8192` y `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (4,89 bpw), IQ2 mixta (3,45 bpw), STQ1_0 mixta (2,39 bpw); mmproj en BF16 |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | GGUF (texto) + GGUF mmproj (codificador visual) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 256 expertos enrutados y 78 capas, empaquetado para generación condicional multimodal bajo la clase `HYV4VLForConditionalGeneration`. La torre de visión es un codificador estilo SigLIP de 40 capas, anchura 1536 y parche de 16, con una rejilla de posiciones aprendida de 128x128; tras ella, un proyector `rmsnorm_mlp_adapter` compuesto por RMSNorm, convolución 2x2 con stride, GELU, convolución 1x1 a 6144 dimensiones y un embedding de salto de línea añadido a cada fila de tokens de imagen.

Los GGUF de texto se convirtieron desde el checkpoint VL y llevan `rope.dimension_sections = [12, 10, 10, 0]` con las filas de RoPE en orden NeoX, lo que habilita M-RoPE intercalado (IMROPE) necesario para las posiciones de los tokens de imagen; en prompts solo de texto la rotación equivale a RoPE estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable está en la receta de cuantización: STQ1_0 codifica pesos ternarios `{-d, 0, +d}` con exactamente un carril de cada cuatro forzado a cero (dispersión 3:4), usando un código de 4 bits más un selector de tabla de 1 bit sobre un codebook de 32 entradas y una escala fp16 por cada 256 pesos, lo que da 42 bytes por 256 pesos = 1,3125 bpw.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y prompts mixtos imagen+texto mediante `llama-mtmd-cli` o `llama-server`.
- Modo de razonamiento: el modelo piensa antes de responder, por lo que consume tokens adicionales antes de la respuesta final.
- Plantilla de chat propia que no coincide con ninguna familia integrada de llama.cpp; exige `--jinja`.
- Procesamiento de imágenes con redimensionado bicúbico a múltiplos de 32 px, entre 4096 y 4194304 píxeles, lo que supone entre 4 y 4096 tokens por imagen más un token de salto de línea por fila.
- Servidor compatible con la API de OpenAI mediante `llama-server`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Descripción y etiquetado automático de imágenes en pipelines de contenido: el modelo acepta imágenes de hasta 4194304 píxeles y genera descripciones en una sola pasada mediante `llama-mtmd-cli`, adecuado para catalogación por lotes en servidores con GPU de 96 GiB.
- Asistente visual conversacional en inglés o chino: con `llama-server` y la API compatible con OpenAI, se puede integrar en una interfaz de chat que reciba capturas o fotografías y mantenga contexto multi-turno dentro de la ventana configurada (32k tokens en el ejemplo del autor).
- Extracción de información de documentos escaneados: la combinación de torre SigLIP y proyector con embedding de salto de línea por fila está diseñada para preservar la estructura de líneas del texto en la imagen, lo que resulta útil para tareas de lectura de formularios y tablas.
- Despliegue en clúster con un solo nodo de 8x H20: la variante STQ1_0 (215 GiB) o IQ2 (310 GiB) permite servir el modelo completo con residencia total en VRAM, sin offloading a CPU, para cargas de inferencia interactiva.
- Evaluación e investigación de cuantización extrema: el repositorio sirve como referencia reproducible para estudiar el impacto de recetas mixtas (STQ1_0 en proyecciones `gate`/`up` de expertos enrutados, Q4_K_M en el resto) sobre un MoE de 770B parámetros.
- Procesamiento por lotes en entornos con memoria limitada: la variante Q4_K_M con `-ngl` reducido permite ejecutar el modelo parcialmente en GPU y parcialmente en CPU, útil para experimentación sin acceso a un nodo completo.
- Integración en herramientas de línea de comandos: los ejemplos con `llama-cli` y `-f prompt.txt` facilitan el uso en scripts de automatización y generación por lotes de texto.

## Benchmarks y rendimiento

El repositorio incluye una imagen de resultados de benchmarks (`Hy4-GGUF-BENCH.png`), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para residencia completa: ~438 GiB con Q4_K_M, ~310 GiB con IQ2 y ~215 GiB con STQ1_0, más la caché KV y ~3 GiB adicionales para el `mmproj`.
- Un nodo de 8x H20 (8 x 96 GiB) aloja cualquiera de las tres variantes en su totalidad.
- Con menos VRAM, reducir `-ngl` para descargar capas a CPU.
- No cabe en GPU de consumo: ninguna RTX 4090 (24 GiB) ni configuraciones multi-GPU domésticas habituales pueden alojar el modelo completo.
- Despliegue mediante llama.cpp compilado con `-DGGML_CUDA=ON`, usando la rama `Little0o0/llama.cpp` en el commit `f8d4cc414` (cabeza del PR #32517). Para STQ1_0 es necesario aplicar el parche `0001-stq1_0-quant-and-cuda.patch`.
- El parche STQ1_0 no incluye kernel MMQ, por lo que el procesamiento de prompt sobre tensores STQ1_0 pasa por dequantize + cuBLAS.
- Se recomienda copiar el GGUF a disco local o usar `-lm none` (`--no-mmap`), ya que el mmap sobre NFS con fallos de página aleatorios resulta muy lento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-GGUF (AngelSlim) | 769.907.408.797 totales | no disponible | no disponible | GGUF + mmproj | MoE 256 expertos, 78 capas, multimodal |
| Hy4-preview-GGUF (AngelSlim) | no disponible | no disponible | no disponible | GGUF | Versión previa; su parche STQ1_0 usa el type id 43, incompatible con este repositorio (44) |
| tencent/Hy4 | 769.907.408.797 totales | no disponible | no disponible | safetensors | Checkpoint base original del que derivan estas cuantizaciones |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; es imprescindible verificarla en el repositorio base `tencent/Hy4` antes de cualquier uso comercial.
- Solo se declaran los idiomas chino e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- El modelo requiere una plantilla de chat propia y `--jinja`; sin ello, el chat no funciona correctamente.
- El modo de razonamiento consume tokens antes de la respuesta, por lo que hay que reservar `max_tokens` suficiente o se truncarán las salidas.
- El `mmproj` rechaza modelos de texto sin secciones RoPE (`hy_v4_vl`), ya que los tokens de imagen necesitan posiciones M-RoPE.
- El parche STQ1_0 de este repositorio usa `GGML_TYPE_STQ1_0 = 44` y `LLAMA_FTYPE_MOSTLY_STQ1_0 = 43`, incompatible con el parche de `AngelSlim/Hy4-preview-GGUF`, que usa 43; mezclar ambos árboles corrompe la carga.
- Las herramientas Python que lean estos GGUF deben usar el `gguf-py` del árbol parcheado con ruta absoluta en `sys.path`.
- El repositorio ocupa 1035,8 GB, lo que exige almacenamiento considerable incluso para descargar una sola variante.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluaciones de seguridad en la información disponible.
- El tamaño hace inviable el despliegue en hardware de consumo; el uso en producción requiere infraestructura de centro de datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- Repositorio previo: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Informe técnico: https://arxiv.org/abs/2602.21233
- Documentación de AngelSlim: https://angelslim.readthedocs.io/
- Organización AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- Organización AngelSlim en ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub de AngelSlim: https://github.com/Tencent/AngelSlim
- Rama de llama.cpp utilizada: https://github.com/Little0o0/llama.cpp (commit `f8d4cc414`, PR #32517)
- PR de llama.cpp para STQ1_0: https://github.com/ggml-org/llama.cpp/pull/22836
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Discord: https://discord.com/invite/dHVNeuNdFt
