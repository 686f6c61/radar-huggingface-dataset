# mlboydaisuke/GLM-OCR-CoreAI

## Resumen

GLM-OCR-CoreAI es un port del modelo de reconocimiento documental GLM-OCR (0,9B parámetros, licencia MIT) desarrollado originalmente por Z.ai, adaptado por el usuario mlboydaisuke para ejecutarse íntegramente en el runtime on-device Core AI de Apple (iOS 27 / macOS 27), sucesor de Core ML. El modelo original es un reconocedor de documentos de calidad SOTA (94,62 en OmniDocBench v1.5 con su pipeline de layout completo) construido como variante OCR de GLM-4.V: una torre visual CogViT más un decodificador de texto GLM de 16 capas con M-RoPE 3D seccionado.

El port empaqueta el modelo en bundles `.aimodel` ejecutables en GPU o Neural Engine de chips Apple Silicon, con el objetivo de ofrecer OCR de documentos de alta calidad sin conexión, sin enviar datos a la nube y con latencia de decodificación de aproximadamente 375 tok/s en un M4 Max. Es relevante para desarrolladores que necesitan procesar documentos sensibles localmente en dispositivos Apple y para quienes evalúan alternativas on-device a los servicios OCR en la nube.

La ficha describe el port tal como se publica: incluye la torre visual en fp16 (829 MB) y el decodificador cuantizado a int8 (764 MB), con el tokenizador asociado. No se incluye el detector de layout necesario para la estructuración automática de página completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre visual CogViT + decodificador de texto GLM de 16 capas con M-RoPE 3D seccionado (variante OCR de GLM-4.V) |
| Parámetros totales | 0,9B (modelo base GLM-OCR) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Visión: fp16; decodificador: int8hu (cuerpo int8 por bloque de 32 + cabeza absmax). int4 no se distribuye |
| Idiomas soportados | Chino, inglés, francés, español, ruso, alemán, japonés, coreano |
| Licencia | MIT (heredada de zai-org/GLM-OCR) |
| Formato de pesos | Bundles `.aimodel` de Core AI (vision/, decoder/, tokenizer/) |

## Arquitectura y entrenamiento

El modelo base GLM-OCR es una variante especializada en OCR de GLM-4.V, con una torre visual CogViT que produce embeddings de imagen de dimensión 1536 y un decodificador de texto GLM de 16 capas que emplea M-RoPE 3D seccionado para codificar posiciones espaciales. El port reutiliza el idioma visual de Qwen3-VL y el decodificador de texto GLM, sin R-SWA, sin MoE y sin MLA.

El proceso de exportación usa `coreai-torch` de Apple (`coreai.llm.export`) para convertir los pesos a bundles `.aimodel`. La torre visual se ejecuta una sola vez y su salida (`image_embeds [682, 1536]` en fp16) se inyecta en las posiciones de placeholder de imagen del prompt; el decodificador opera con grafos estáticos S=1 y tres entradas fijas: `image_embeds`, `rope_shift_start` y `rope_shift_amount`. El número de tokens visuales (N=682, rejilla fusionada de 22×31) queda fijado en la exportación, por lo que la página debe redimensionarse en el host a esa rejilla. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de texto en documentos: genera texto plano respetando el orden de lectura mediante el prompt `Text Recognition:`.
- Reconocimiento de tablas: produce tablas en HTML (`<table>…`) con el prompt `Table Recognition:`.
- Reconocimiento de fórmulas: genera expresiones en LaTeX con el prompt `Formula Recognition:`.
- Comprensión de documentos multilingüe en chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Inferencia completamente on-device en GPU o Neural Engine de Apple Silicon, sin conexión a red.
- Ejecución en el runtime Core AI con motor pipelined (S=1, `COREAI_CHUNK_THRESHOLD=1`).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información disponible.

## Casos de uso

- Digitalización de facturas y recibos en dispositivos Apple: el modelo extrae texto y tablas en HTML de documentos escaneados localmente, sin enviar datos financieros a servidores externos, aprovechando la licencia MIT y la ejecución on-device.
- Procesamiento de documentos confidenciales en entornos sanitarios o legales: al ejecutarse íntegramente en el dispositivo mediante Core AI, cumple requisitos de privacidad que impiden el uso de OCR en la nube.
- Extracción de fórmulas matemáticas de artículos científicos: con el prompt `Formula Recognition:` convierte ecuaciones impresas a LaTeX para su reutilización en editores o pipelines de publicación.
- Conversión de tablas impresas a HTML estructurado: útil en aplicaciones de digitalización de informes financieros o técnicos que necesitan datos tabulares procesables.
- Aplicaciones de accesibilidad en iOS y macOS: lectura en voz alta de documentos físicos capturados con la cámara, con el modelo ejecutándose en el Neural Engine sin latencia de red.
- Digitalización de documentación multilingüe: al soportar ocho idiomas, permite procesar contratos o manuales en japonés, coreano o ruso desde una misma aplicación sin cambiar de modelo.
- Automatización de archivo documental en macOS: integración en flujos de escaneo masivo donde el OCR se ejecuta en local a aproximadamente 375 tok/s en un M4 Max, reduciendo costes frente a APIs en la nube.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| OmniDocBench v1.5 | 94,62 | Modelo base GLM-OCR con pipeline de layout completo (no incluido en este port) |
| Generación end-to-end en motor Core AI | 40/40 tokens idénticos a la referencia fp32 de HF | Documento sintético, M4 Max, GPU |
| Velocidad de decodificación | ~375 tok/s | M4 Max, GPU, motor pipelined |
| Coseno de logits del decodificador vs HF | 1,000020 | Escalera de Torch |
| Coseno de `image_embeds` vs HF | 1,000061 | Escalera de Torch |
| Argmax del VLM completo | 694/694 | Escalera de Torch |
| Coseno de `image_embeds` en motor | 0,9998 | Gate del motor |
| Flips de argmax int8hu vs fp16 | 7/694, todos en posiciones de token visual (0 en región de texto) | Preservación del texto OCR |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 4,1 GB de repositorio; los bundles suman unos 1,6 GB (visión 829 MB + decodificador 764 MB).
- VRAM/unified memory estimada: no disponible de forma explícita; por el tamaño de los bundles, la inferencia cabe holgadamente en la memoria unificada de cualquier chip Apple Silicon moderno.
- GPU recomendadas: Apple Silicon con soporte de Core AI (iOS 27 / macOS 27). Verificado en M4 Max (GPU) e iPhone 18 Pro (iOS 27.2).
- Cabe en hardware consumer: sí, en dispositivos Apple con iOS 27 o macOS 27; no aplica a GPU NVIDIA o AMD.
- Opciones de despliegue: runtime Core AI de Apple con motor pipelined (S=1, `COREAI_CHUNK_THRESHOLD=1`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~375 tok/s de decodificación en M4 Max GPU; velocidad sin cambios tras la reexportación del decodificador (ratio después/antes = 1,004).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR-CoreAI (este port) | 0,9B | No disponible | OmniDocBench v1.5 94,62 (pipeline completo del base) | MIT | Hugging Face, formato Core AI |
| zai-org/GLM-OCR (base) | 0,9B | No disponible | OmniDocBench v1.5 94,62 | MIT | Hugging Face, pesos originales |
| Qwen3-8B (referencia de runtime Core AI) | 8B | No disponible | No aplica (LLM general) | No disponible | Core AI, 4-bit a 94 tok/s en M4 Max GPU |

No se dispone de datos de otros modelos OCR comparables (por ejemplo, variantes de PaddleOCR o TrOCR) en la información proporcionada.

## Limitaciones y advertencias

- Este port es únicamente el modelo de reconocimiento por prompt (texto, tabla o fórmula); la estructuración automática de página completa que alcanza el 94,62 en OmniDocBench requiere además un detector de layout (PP-DocLayoutV3) que no forma parte del port.
- El número de tokens visuales está fijado en la exportación (N=682, rejilla 22×31); es necesario redimensionar la página en el host a esa rejilla, lo que limita la resolución de entrada.
- No se distribuye cuantización int4: el autor advierte que int4 weight-only sin QAT arriesga una caída de calidad en un modelo de 0,9B.
- La cuantización int8hu introduce 7 flips de argmax sobre 694 en posiciones de token visual, aunque ninguno afecta a la región de texto generada.
- En el prompt desnudo `Text Recognition:` sin imagen, el decodificador reexportado genera un backtick en lugar de detener la generación de inmediato, a diferencia de la referencia fp32.
- El modelo está restringido al ecosistema Apple (Core AI en iOS 27 / macOS 27); no es desplegable en otras plataformas sin reconversión.
- Es un port comunitario no afiliado a Apple ni a Z.ai; no se han publicado datos sobre sesgos, tasa de alucinación ni evaluación independiente del port.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del modelo original zai-org/GLM-OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/GLM-OCR-CoreAI
- Árbol de archivos: https://huggingface.co/mlboydaisuke/GLM-OCR-CoreAI/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Core AI Model Zoo (receta de conversión y contrato del host): https://github.com/john-rocky/coreai-model-zoo
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Leaderboard DeviceMark: https://devicemark.github.io/
- Solicitudes de port a on-device: https://github.com/john-rocky/on-device-requests
- Colección Core AI Model Zoo: https://huggingface.co/collections/mlboydaisuke/core-ai-model-zoo-6a7ff330f753e8dcae04671a
