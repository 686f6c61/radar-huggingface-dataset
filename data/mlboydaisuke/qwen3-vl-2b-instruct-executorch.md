# mlboydaisuke/Qwen3-VL-2B-Instruct-ExecuTorch

## Resumen

Qwen3-VL-2B-Instruct-ExecuTorch es una conversión del modelo de visión-lenguaje Qwen/Qwen3-VL-2B-Instruct a formato ExecuTorch, pensada para ejecución completamente on-device. El autor, mlboydaisuke, empaqueta los 2.13 mil millones de parámetros del modelo original (28 capas de decoder y 24 capas de vision tower) en un único archivo `.pte` de 2.45 GB con tres entry points: `vision_encoder`, `token_embeddings` y `text_model`. La licencia es Apache 2.0, igual que el modelo base.

La relevancia de este proyecto es práctica: permite ejecutar un modelo multimodal de razonamiento visual en un dispositivo sin conexión, con los datos del usuario nunca saliendo del dispositivo. El autor documenta un proceso de conversión complejo, incluyendo la reescritura de componentes que no exportaban a ExecuTorch (atención de longitud variable, convolución de patch embedding, asignación por máscara booleana) y una cuantización manual de la tabla de embeddings. La verificación del autor muestra una correlación de logits de 0.993 frente al modelo eager fp32 en una pregunta sobre texto pequeño en una imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con vision tower (Qwen3-VL) |
| Parámetros totales | 2.13B (28 capas decoder, 24 capas vision tower) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no especificada; prompt de verificación de 277 tokens (256 imagen + 21 texto) |
| Tipos de cuantización | int8 (pesos), 8da4w (decoder 4-bit) no servida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), con pesos en fp32 para embeddings y cuantizados para el resto |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-2B-Instruct, un modelo de visión-lenguaje de la familia Qwen3-VL con arquitectura transformer densa. El componente de visión procesa imágenes de 512x512 píxeles, interpolando posiciones bilinealmente desde `grid_thw` en cada llamada. El decoder usa atención M-RoPE interleaved con `mrope_section [24, 20, 20]` (tiempo, alto, ancho), lo que requiere pasar posiciones 3-D desde `get_rope_index` en lugar de un `arange` 1-D.

La conversión a ExecuTorch implica cinco reescrituras principales: constantes de visión precomputadas, atención de longitud variable convertida a SDPA simple (una imagen es una secuencia), patch embedding `Conv3d` → `F.linear`, asignación de máscara booleana para deepstack → operación de suma, y cuantización manual de la tabla de embeddings. El modelo original usa deepstack maps que inyectan características de los bloques de visión 5, 11 y 17 en los decodificadores 0, 1 y 2 solo en posiciones de imagen. La cuantización es int8 por fila para los pesos, con la tabla de embeddings (151,936 x 2048, 1.24 GB en fp32) cuantizada manualmente porque `torchao::dequantize_affine` no soporta `nn.Embedding`.

## Capacidades

- Entrada de imagen RGB 512x512 y pregunta de texto, salida de texto.
- Tres puntos de entrada separados: `vision_encoder` (procesa imagen y devuelve features + deepstack maps), `token_embeddings` (procesa tokens de texto) y `text_model` (genera logits).
- Ejecución completamente en el dispositivo, sin conexión de red.
- Soporta preguntas sobre contenido visual: reconocimiento de texto en imágenes, descripción de escenas, respuesta a preguntas sobre detalles de la fotografía.
- El modelo base (Qwen3-VL-2B-Instruct) tiene capacidades de visión general: comprensión de texto e imagen, razonamiento visual, percepción espacial y dinámica de video (aunque la conversión solo soporta imágenes fijas).
- No se menciona soporte de tool calling ni agentes en esta conversión específica.
- La conversión mantiene la paridad con el modelo eager en fp32 para el primer paso (corr 1.000000) y alta correlación en logits (0.993435 para la pregunta sobre texto pequeño).

## Casos de uso

- **Atención al cliente en dispositivo**: un kiosco o dispositivo embebido puede responder preguntas sobre documentos escaneados, formularios o señales sin enviar datos a la nube, gracias a que la inferencia es local y el modelo acepta imágenes de 512x512.
- **Accesibilidad visual**: asistente para personas con discapacidad visual que describe escenas, lee carteles o identifica objetos en tiempo real en un móvil o dispositivo portátil.
- **Análisis de documentos in situ**: un dispositivo móvil puede extraer información de documentos (nombres, direcciones, texto impreso) sin conexión, útil en entornos con conectividad limitada o sensibles.
- **Automatización de inventario**: un robot o cámara inteligente puede identificar productos o leer etiquetas en almacenes, con la ventaja de que el modelo se ejecuta en el propio dispositivo.
- **Asistente de fotografía**: una aplicación de cámara puede etiquetar y describir fotos localmente, generando metadatos o alt-text automático sin subir imágenes a servidores.
- **Educación y aprendizaje**: un dispositivo educativo puede responder a preguntas sobre imágenes de libros de texto o ilustraciones, funcionando sin conexión.

## Benchmarks y rendimiento

El autor publica resultados de verificación en un Mac arm64 con ExecuTorch 1.4.0 y torch 2.13.0, comparando la correlación de logits con el modelo eager en fp32:

| build | tamaño (MB) | corr "name on the sign" | corr "describe it" | visión (ms) | prefill (ms) | decode |
|---|---|---|---|---|---|---|
| 8da8w | 2453.1 | 0.993435 | 0.992611 | 568.7 | 590.6 | 17.1 tok/s |
| 8da4w (no servida) | 1697.5 | 0.739964 | 0.948887 | 566.7 | 739.4 | 19.8 tok/s |

El prompt de verificación es de 277 tokens, de los cuales 256 son de imagen. `vision_encoder` se ejecuta una vez por imagen, `text_model` una vez por prompt y una vez por token generado. En la pregunta sobre el nombre del pub, el modelo 8da8w responde correctamente "The Lamb & Flag", mientras que 8da4w falla con "Pine Purpose". No hay benchmarks estándar (MMLU, HumanEval) publicados para esta conversión.

## Requisitos de hardware

- **VRAM estimada**: el archivo `.pte` pesa 2453.1 MB, por lo que se requiere al menos 2.5 GB de memoria disponible (RAM o VRAM según el dispositivo).
- **GPU recomendadas**: no aplicable — el modelo está diseñado para ejecución en CPU con XNNPACK (el nombre del archivo incluye `xnnpack`). Verificado en Mac arm64.
- **Cabe en consumer GPU**: no es el objetivo; está pensado para dispositivos embebidos o móviles con XNNPACK.
- **Opciones de despliegue**: ExecuTorch runtime, con el archivo `.pte` cargado directamente. No se menciona vLLM, Ollama ni TGI.
- **Latencia y throughput**: visión 568.7 ms, prefill 590.6 ms, decode 17.1 tok/s en Mac arm64 (8da8w). Para la versión 8da4w (no servida), decode es 19.8 tok/s.

## Comparativa con modelos similares

La comparativa natural es con el modelo base Qwen3-VL-2B-Instruct en su formato original:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct (original) | 2.13B | no especificado | safetensors (fp32) | Apache 2.0 | HuggingFace |
| Qwen3-VL-2B-Instruct-ExecuTorch | 2.13B | no especificado | `.pte` (int8) | Apache 2.0 | HuggingFace |
| Qwen3-VL-8B-Instruct (original) | 8B | no especificado | safetensors (fp32) | Apache 2.0 | HuggingFace |

La ventaja de la conversión es el tamaño reducido (2453 MB frente a los ~4.3 GB del fp32 original) y la ejecución on-device con ExecuTorch. La desventaja es que el contexto se limita a la imagen de 512x512 y el texto del prompt, y no se conservan todas las capacidades del original (por ejemplo, no se soporta video).

## Limitaciones y advertencias

- **Filtro de resampling crítico**: el autor demuestra que el filtro de redimensionado (BICUBIC, BILINEAR, LANCZOS, NEAREST) afecta directamente a la precisión en texto pequeño; con LANCZOS o NEAREST el modelo eager falla. El preprocesado es parte del pipeline y no un detalle.
- **La tabla de embeddings escapa la cuantización por defecto**: un filtro que solo cuantiza `nn.Linear` deja 1.24 GB en fp32; la cuantización manual es necesaria para reducir el tamaño.
- **El caller es responsable de la correcta composición**: si no se hace el splice de las 256 vision rows en las posiciones de imagen, o no se colocan los deepstack maps, el modelo no lanza error — simplemente responde sobre lo incorrecto.
- **La versión 8da4w no es servida**: con 4-bit en el decoder, la correlación de logits cae a 0.740 en la pregunta sobre el texto pequeño y lee "Pizza Purpose" en lugar de "Lamb & Flag". No se recomienda para producción.
- **Sin soporte de video**: aunque el modelo base Qwen3-VL soporta video, esta conversión solo acepta imágenes fijas de 512x512.
- **Idiomas no disponibles**: la model card no especifica idiomas; el modelo base soporta múltiples idiomas, pero la conversión no documenta la cobertura.
- **Latencia en dispositivo**: 17 tok/s de decode es lento para interacción en tiempo real; adecuado para consultas puntuales, no para diálogos extendidos.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3-VL-2B-Instruct-ExecuTorch
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base en ModelScope: https://www.modelscope.ai/models/Qwen/Qwen3-VL-2B-Instruct
- Repo de GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
