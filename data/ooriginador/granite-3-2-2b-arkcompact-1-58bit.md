# Ooriginador/Granite-3.2-2B-ArkCompact-1.58bit

## Resumen

Granite-3.2-2B-ArkCompact-1.58bit es una cuantización extrema del modelo IBM Granite 3.2 2B Instruct, desarrollada por Ooriginador bajo la infraestructura Arkheion Sovereign AI. El modelo convierte los pesos originales en formato ternario de 1.58 bits (valores -1, 0, +1) usando empaquetado Base-3, lo que reduce drásticamente el footprint de memoria y acelera la inferencia mediante operaciones de acumulación entera y máscaras bitwise Wave32 en GPUs AMD (ROCm/HIP). El resultado es un modelo de 2.53B parámetros con una ventana de contexto de 128k tokens que cabe en menos de 640 MB de VRAM y alcanza un throughput declarado de 98.239 tokens por segundo en modo batch sobre una GPU consumer AMD Radeon RX 6600M.

La relevancia de este modelo radica en su enfoque de "soberanía de IA": al estar basado en Apache-2.0 y ejecutarse sobre un runtime propio en Rust (ark-engine), ofrece una alternativa de despliegue ligero y de alto rendimiento para entornos con recursos limitados o requisitos de soberanía tecnológica. Aunque la cuantización ternaria degrada la fidelidad matemática (coeficiente de correlación de Pearson ≥ 0.942 en capas lineales), el autor afirma que mantiene una calidad suficiente para tareas de generación de texto y razonamiento, con una latencia mínima y sin jitter en flujo continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: IBM Granite 3.2 2B Instruct) con cuantización ternaria 1.58-bit Base-3 |
| Parametros totales | 2.53B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (RoPE completa) |
| Tipos de cuantizacion | 1.58-bit ternario (5 trits por byte, w ∈ {-1, 0, +1}) |
| Idiomas soportados | Portugués (pt), Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se menciona formato .ark y mmap, pero no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 3.2 2B Instruct, un transformer denso de 2.53B parámetros entrenado con datos abiertos y sintéticos para razonamiento y capacidades de "thinking". La contribución de Ooriginador es la capa de cuantización ArkCompact, que transforma los pesos a un espacio ternario usando empaquetado Base-3 (3^5 = 243 ≤ 256, por lo que 5 trits caben en un byte). Esto elimina las multiplicaciones en coma flotante de 16 bits y las sustituye por acumulaciones enteras y operaciones de máscara bitwise fusionadas en Wave32 (arquitectura de ejecución de AMD RDNA2). El runtime ArkheionNet, escrito en Rust, implementa carga con memoria mapeada (mmap) que inicializa el modelo en menos de 450 ms, atención multi-cabeza latente (MLA) que reduce el footprint de KV-cache en un 85.9%, y prefill fragmentado (chunked prefill) para evitar bloqueos head-of-line en batching continuo. No se han publicado detalles sobre el proceso de entrenamiento o fine-tuning posterior a la cuantización; el modelo se presenta como una conversión directa del checkpoint original.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Granite 3.2 2B Instruct, que incluye razonamiento de varios pasos y modo "thinking" controlable.
- Soporte de tool calling / function calling: no se menciona explícitamente en la documentación, pero el modelo base sí lo soporta; la cuantización no debería eliminarlo, aunque no hay confirmación.
- Soporte de agentes y multi-step reasoning: el modelo base está entrenado para razonamiento, y la cuantización mantiene la estructura de atención, por lo que es plausible, pero no verificado.
- Capacidades multilingües: limitadas a portugués e inglés según los metadatos.
- Capacidades especiales: inferencia de altísimo rendimiento en GPUs AMD (ROCm/HIP) con Wave32, carga por mmap, API compatible con OpenAI, streaming vía ark-sdk.
- No soporta visión ni audio (modelo de texto únicamente).

## Casos de uso

- Despliegue en edge computing: gracias a su footprint de 634.9 MB y su inicialización en menos de 450 ms, puede ejecutarse en dispositivos con poca memoria (portátiles, mini-PCs, consolas) para asistentes locales de texto.
- Servicio de chat de baja latencia: el modo single-stream a 320 tok/s sin jitter permite responder en tiempo real en aplicaciones de mensajería o atención al cliente.
- Procesamiento por lotes de alto rendimiento: el throughput de 98.239 tok/s en modo batch (con fusión de MatVec) es adecuado para pipelines de generación masiva de texto, como resúmenes de documentos o aumento de datos sintéticos.
- Infraestructura soberana: al ser Apache-2.0 y ejecutarse sobre un runtime propio en Rust, es apto para organizaciones que requieren control total del stack de IA sin dependencias de proveedores cloud.
- Prototipado rápido en entornos AMD: si se dispone de GPUs Radeon con ROCm, el modelo aprovecha Wave32 y no requiere CUDA, lo que facilita su integración en clusters heterogéneos.
- Investigación en cuantización extrema: sirve como referencia para estudiar el impacto de la ternarización 1.58-bit en modelos de razonamiento, dado que conserva una correlación de Pearson ≥ 0.942 en capas lineales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento declarada es la de throughput de inferencia, medida en hardware AMD Radeon RX 6600M (RDNA2):

| Metrica | Valor |
|---|---|
| Throughput single-stream | 320.0 tok/s |
| Throughput con speculative boost (Tree-Attention) | 480.0 tok/s |
| Throughput batch pico (Wave32) | 98.239,5 tok/s |
| VRAM utilizada | 634.9 MB |
| Fidelidad matematica (Pearson ρ) | ≥ 0.942 |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: 634.9 MB en cuantización 1.58-bit, lo que permite ejecución en GPUs con 1 GB o más de memoria.
- GPU recomendadas: AMD Radeon RX 6600M (RDNA2) como referencia verificada; cualquier GPU compatible con ROCm/HIP y Wave32 debería funcionar. No se menciona soporte CUDA.
- Cabe en GPUs consumer: sí, incluso en iGPUs o GPUs de gama baja con suficiente VRAM.
- Opciones de despliegue: ark-engine (servidor Rust con API compatible con OpenAI), ark-sdk (cliente Rust), o integración directa vía HTTP. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 320 tok/s en single-stream, 480 tok/s con speculative decoding, 98.239 tok/s en batch pico (según el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Ooriginador/Granite-3.2-2B-ArkCompact-1.58bit | 2.53B | 128k | 1.58-bit ternario | Apache-2.0 | 320 tok/s (single-stream) en RX 6600M |
| ibm-granite/granite-3.2-2b-instruct (base) | 2.53B | 128k | FP16/BF16 | Apache-2.0 | No disponible (requiere ~5 GB VRAM en FP16) |
| mozilla-ai/granite-3.2-2b-instruct-llamafile | 2.53B | 128k | GGUF (varias) | Apache-2.0 | No disponible (depende de cuantización) |

La comparativa se limita al modelo base y a la versión llamafile, ya que no hay datos de otros modelos ternarios de tamaño similar en la información proporcionada. La ventaja principal del modelo de Ooriginador es su footprint extremadamente reducido y su rendimiento en hardware AMD, a costa de una fidelidad matemática reducida.

## Limitaciones y advertencias

- La cuantización ternaria introduce pérdida de precisión: el coeficiente de correlación de Pearson ≥ 0.942 indica una degradación no despreciable en las capas lineales, lo que puede afectar a tareas de razonamiento complejo o generación de código.
- Solo se garantiza soporte para portugués e inglés; otros idiomas pueden funcionar peor o no estar soportados.
- El runtime es propietario (aunque de código abierto) y requiere compilación con Rust y dependencias ROCm/HIP; no hay integración con ecosistemas estándar como Hugging Face Transformers o vLLM.
- Los datos de rendimiento (98.239 tok/s) provienen de una única prueba en una GPU específica y no han sido replicados de forma independiente; pueden no ser representativos en otros entornos.
- No se han publicado evaluaciones de calidad (MMLU, HumanEval, etc.) tras la cuantización, por lo que se desconoce el impacto real en tareas downstream.
- El modelo base tiene capacidades de "thinking" que pueden requerir más tokens de salida; la cuantización podría afectar a la coherencia de razonamientos largos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base de IBM tiene sus propias condiciones (también Apache-2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ooriginador/Granite-3.2-2B-ArkCompact-1.58bit
- Modelo base: https://huggingface.co/ibm-granite/granite-3.2-2b-instruct
- Repositorio ArkheionNet (mencionado en la model card): https://github.com/Arkheion/ArkheionNet.git
- Anuncio de IBM Granite 3.2: https://www.ibm.com/new/announcements/ibm-granite-3-2-open-source-reasoning-and-vision
- Página de IBM Granite: https://www.ibm.com/granite
- Versión llamafile del modelo base: https://huggingface.co/mozilla-ai/granite-3.2-2b-instruct-llamafile
