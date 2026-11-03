# Dicklesworthstone/franken_ocr-weights

## Resumen

`franken_ocr-weights` es un repositorio de artefactos de pesos cuantizados para `franken_ocr`, un motor de OCR escrito íntegramente en Rust, memory-safe y exclusivamente para CPU, desarrollado por Jeffrey Emanuel (Dicklesworthstone). No se trata de un checkpoint al uso de Hugging Face `transformers`, sino de un contenedor propietario `.focrq` que consume la CLI `focr`, el playground web en franken-ocr.com y la aplicación iOS FrankenOCR. El motor ejecuta una familia de modelos visión-lenguaje portados a mano sin PyTorch, sin Python, sin CUDA, sin FFI en inferencia y sin GPU.

El artefacto principal envuelve Baidu Unlimited-OCR, un derivado de DeepSeek-OCR cuya arquitectura encadena un codificador visual SAM-ViT-B, un compresor de tokens convolucional 16×, un CLIP-L/14, un proyector lineal y un decodificador MoE de 12 capas basado en DeepSeek-V2 con Reference Sliding Window Attention. El checkpoint original en bf16 ocupa 6,67 GB y aquí se reduce a 3,00 GB mediante cuantización int4/int8 consciente de calibración.

Su relevancia actual reside en la propuesta de despliegue: OCR de documentos de alta densidad en CPU, navegador (dentro del límite de 4 GiB de memoria lineal de WebAssembly) y dispositivos móviles, con verificación SHA-256 byte a byte antes de la instalación y sin dependencia de stack CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida visión-lenguaje: SAM-ViT-B + compresor convolucional 16× + CLIP-L/14 + proyector lineal + decodificador MoE de 12 capas (DeepSeek-V2) con Reference Sliding Window Attention |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (decodificador MoE con expertos enrutados y compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 (group size 16 en `gate_proj` y `down_proj`, 32 en `up_proj`), int8 per-channel (atención q/k/v/o, `lm_head`, `embed_tokens`), BF16 (torre visual, proyector, router gate y todas las normas) |
| Idiomas soportados | no disponible |
| Licencia | MIT (motor), pesos derivados de Baidu Unlimited-OCR bajo licencia MIT |
| Formato de pesos | `.focrq` (contenedor propio del runtime `franken_ocr`) + `tokenizer.json` sidecar |

## Arquitectura y entrenamiento

La arquitectura es un pipeline visión-lenguaje en dos etapas. La torre visual combina SAM-ViT-B con un compresor de tokens convolucional de factor 16 y un codificador CLIP-L/14, cuyos 256 outputs condicionan todos los tokens posteriores; de ahí que el autor mantenga el codificador visual en BF16, ya que cuantizarlo degrada el OCR de forma no local. La salida pasa por un proyector lineal hacia un decodificador MoE de 12 capas derivado de DeepSeek-V2, con expertos enrutados y compartidos y Reference Sliding Window Attention.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación documentada está en el proceso de cuantización: es consciente de calibración, con búsqueda de clip ponderada por importancia y un fold AWQ sobre `down_proj`, calculado a partir de estadísticas de activación de un run de 13 páginas. El autor afirma que supera estrictamente al round-to-nearest simple en todas las páginas del corpus.

## Capacidades

- Conversión de imagen a texto (pipeline `image-to-text`) orientada a OCR de documentos.
- Procesamiento de documentos completos, incluyendo PDFs con selección de páginas por rango (por ejemplo, `--pages 3,5-9`).
- Comprensión de documentos (`document-understanding`) en material denso, como prensa histórica.
- Ejecución en CPU pura, sin GPU ni framework de ML general.
- Despliegue en navegador mediante WebAssembly, con el modelo completo dentro del límite de 4 GiB de memoria lineal.
- Despliegue en iOS mediante la aplicación FrankenOCR, con reanudación de descargas interrumpidas.
- Integración vía CLI `focr` para automatización por lotes.
- Tool calling, agentes, razonamiento multi-paso, matemáticas, visión general, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de prensa histórica: el artefacto está calibrado y evaluado específicamente sobre páginas de periódico de 1886, con una tasa de error de carácter medida de 0,156; adecuado para proyectos de archivo que toleran ese nivel de error y priorizan coste cero de GPU.
- OCR en el navegador: al caber en la memoria lineal de 4 GiB de WebAssembly, permite ofrecer conversión de documentos sin enviar el fichero a un servidor, lo que simplifica el cumplimiento de privacidad.
- Extracción de fragmentos de libros y PDFs: la CLI admite selección de páginas concretas (`focr ocr book.pdf --pages 3,5-9 -o excerpt.md`), útil para generar extractos en Markdown en pipelines editoriales.
- Procesamiento por lotes en servidores sin GPU: al no requerir CUDA ni PyTorch, se puede desplegar en instancias CPU de bajo coste o en entornos con restricciones de aceleradores.
- Aplicaciones móviles de escaneo: la app iOS descarga el artefacto desde un CDN con soporte de ranged requests y reanudación, lo que hace viable la captura y el OCR en el propio dispositivo.
- Entornos con requisitos de seguridad de memoria: el motor es Rust memory-safe y sin FFI en inferencia, lo que reduce la superficie de ataque en despliegues que procesan documentos no confiables.
- Verificación de integridad en distribución de modelos: cada fichero está fijado por SHA-256 en `models/manifest-v2.json` y se verifica byte a byte antes de la instalación, adecuado para cadenas de suministro con controles estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es la tasa de error de carácter (CER) de 0,156 sobre una página de prensa de 1886, junto con la afirmación de que la calibración logró una reducción relativa del 10,9 % en la página más difícil sin regresión en ninguna otra.

## Requisitos de hardware

- VRAM: no aplica; el motor es exclusivamente CPU, sin CUDA ni GPU.
- RAM: el artefacto `unlimited-ocr.wasm-int4.focrq` ocupa 3.003.988.117 bytes (aproximadamente 3,00 GB) y debe caber en la memoria lineal de 4 GiB de WebAssembly en el caso del navegador; en nativo se requiere espacio adicional para el tokenizer (9.979.544 bytes) y el runtime.
- GPU recomendadas: ninguna; no se utiliza aceleración por GPU.
- GPU de consumo: no aplica.
- Despliegue: CLI `focr` (`focr pull` instala por defecto un artefacto conservador de 4,16 GB que mantiene atención y `lm_head` en alta precisión), playground web en franken-ocr.com y app iOS FrankenOCR. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.focrq` no es compatible con `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| franken_ocr (este artefacto) | no disponible (MoE de 12 capas) | no disponible | `.focrq` | MIT | CPU, WASM, iOS |
| Baidu Unlimited-OCR (checkpoint original) | no disponible | no disponible | bf16, 6,67 GB | MIT | Requiere stack de ML convencional |
| DeepSeek-OCR (modelo base del que deriva) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parámetros y contexto de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Precisión: el propio autor advierte que el int4 tiene un coste real en material denso; el CER de 0,156 en prensa de 1886 es un valor alto para muchos usos productivos. La calibración mejora, pero no corrige, esa pérdida.
- Este artefacto no es el predeterminado de la CLI nativa: está pensado para objetivos con memoria restringida (navegador y móviles). Para uso nativo, `focr pull` instala un artefacto conservador de 4,16 GB con atención y `lm_head` en alta precisión.
- Incompatibilidad de formato: los ficheros `.focrq` no cargan en `transformers`; requieren el runtime `franken_ocr` y el `tokenizer.json` sidecar colocado junto al artefacto.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Sesgos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos visión-lenguaje empleados para OCR.
- Licencia: el motor es MIT con una cláusula adicional de estilo OpenAI/Anthropic; los pesos son un derivado cuantizado del modelo de Baidu bajo MIT, y su aviso debe acompañar a la distribución. No se documentan restricciones adicionales para uso comercial.
- El proyecto no está afiliado a Baidu y no implica respaldo por su parte.
- El repositorio registra 0 descargas y 0 likes, y el artefacto no cuenta con un ecosistema amplio de validación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dicklesworthstone/franken_ocr-weights
- Repositorio del motor en GitHub: https://github.com/Dicklesworthstone/franken_ocr
- Manifiesto de modelos con hashes SHA-256: https://github.com/Dicklesworthstone/franken_ocr/blob/main/models/manifest-v2.json
- Registro de discrepancias y métricas por página: https://github.com/Dicklesworthstone/franken_ocr/blob/main/docs/DISCREPANCIES.md
- Playground en navegador: https://franken-ocr.com
- Checkpoint original de Baidu: https://huggingface.co/baidu/Unlimited-OCR
