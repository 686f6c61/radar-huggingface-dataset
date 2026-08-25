# ariacompute/qwen3.5-0.8b_q4

## Resumen

El modelo `ariacompute/qwen3.5-0.8b_q4` es una distribución cuantizada a 4 bits del modelo Qwen3.5-0.8B, un transformador denso de 0.8 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. A diferencia de los modelos Qwen3.5 más grandes, esta variante de 0.8B emplea una arquitectura híbrida con una proporción 3:1 de capas de atención lineal DeltaNet frente a capas de atención completa, lo que reduce el coste de procesamiento de contexto largo y el tamaño de la caché KV. El modelo original se preentrenó sobre corpus públicos diversos y se alineó mediante SFT y DPO.

Aria Compute lo redistribuye como un "aria-quant-bundle": un paquete uniforme de cuantización de 4 bits que usa rotación de Hadamard y cuantización por codebooks Lloyd-Max con grupos de tamaño 32. El resultado es un fichero de unos 450 MB (frente a ~1,6 GB en BF16), lo que permite ejecutar el modelo por completo en CPU en dispositivos móviles, placas de un solo ordenador y pasarelas IoT, sin conexión a la nube ni GPU. La licencia es Apache 2.0, por lo que el uso comercial queda permitido.

La relevancia actual del modelo radica en su perfil de inferencia on-device: con ~580 MB de memoria total a contexto de 4K, cabe en teléfonos de gama baja, Raspberry Pi 5 y pasarelas IoT. Es una opción práctica para asistentes conversacionales, tool calling y embeddings en entornos sin conexión o con recursos muy limitados, aunque la cuantización agresiva de 4 bits sacrifica fidelidad de generación frente a versiones q8 o FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Transformer decoder-only, híbrido DeltaNet + atención completa (ratio 3:1) |
| Parametros totales | 0,8 mil millones (0.8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.000 tokens (optimizado para 4K; el modelo base soporta hasta 262K) |
| Tipos de cuantizacion | 4-bit (q4), Hadamard + Lloyd-Max codebook, group size 32 |
| Idiomas soportados | inglés, chino y más de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-quant-bundle (formato propietario de Aria Engine, no safetensors estándar) |

## Arquitectura y entrenamiento

Qwen3.5-0.8B es un transformador denso decoder-only con una arquitectura híbrida que combina capas de atención lineal DeltaNet y capas de atención completa en una proporción 3:1. Esta mezcla permite procesar secuencias largas con menor coste computacional que la atención completa, manteniendo la capacidad de modelar dependencias locales y globales. El modelo se pre-trenó sobre corpus públicos diversos (RedPajama-1T, The Pile, The Stack) y se alineó mediante SFT + DPO.

La cuantización de Aria Compute usa rotación de Hadamard y cuantización por codebooks Lloyd-Max con grupos de tamaño 32, sin datos de calibración específicos. Las capas de atención y las FFN (up/gate/down) se cuantizan a 4 bits, mientras que las RMSNorm y la tabla de embeddings se conservan en FP16. La caché KV es compacta gracias a la arquitectura GQA (20 capas × 2 cabezas KV × head_dim 128), ~3,5 veces menor que la de Qwen3-1.7B. El resultado es un bundle de ~450 MB con un overhead de ~580 MB de memoria total a contexto 4K.

## Capacidades

- Generación de texto: chat, completado de texto y respuesta a preguntas con instrucciones.
- Tool calling / function calling: soporte para estructurar llamadas a APIs desde dispositivos móviles y IoT.
- Embeddings: genera representaciones vectoriales para recuperación y clasificación en local.
- Resumen corto: resumir notificaciones, mensajes y contenido local de poca extensión.
- Multilingüe: inglés y chino como idiomas principales, con soporte para más de 20 idiomas adicionales.
- Inferencia offline: todo el procesamiento se ejecuta localmente en CPU, sin conexión a la nube.
- Sin capacidad multimodal: modelo exclusivamente de texto, sin entrada de imagen ni audio.

## Casos de uso

- Asistente conversacional en el dispositivo: el modelo puede mantener conversaciones multi-turno con contexto de hasta 4K tokens en un smartphone de 4 GB de RAM, sin conexión a internet, gracias a su huella de ~580 MB.
- Completado de texto en tiempo real: para aplicaciones de escritura predictiva o autocompletado de código en editores móviles, donde la latencia local de CPU es aceptable para fragmentos cortos.
- Tool calling para APIs de IoT: un dispositivo embebido puede generar llamadas estructuradas a funciones de una pasarela doméstica o sensores, sin enviar datos al exterior.
- Embeddings para recuperación local: generar representaciones vectoriales de documentos o mensajes para búsqueda semántica y clasificación en el dispositivo.
- Resumen de notificaciones: resumir mensajes de correo, SMS o alertas en el propio teléfono, manteniendo la privacidad al no subir contenido a la nube.
- Asistente de soporte en primera línea: para chatbots de atención al cliente en entornos con ancho de banda limitado o políticas de privacidad estrictas, donde el modelo puede resolver consultas simples y derivar a un humano cuando supera su capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El único dato declarado por el autor es una métrica de consistencia de generación frente a la versión FP16:

| Métrica | Valor |
|---|---|
| Token overlap medio (vs FP16) | 0,1878 (referencia qwen3-0.6b_q4+group) |
| Fracción de prefijo exacto (vs FP16) | 0,0729 |
| Delta de logprob (vs FP16) | -0,172159 |

El autor indica que el bundle q4 presenta ~4,3 veces más degradación de calidad que la versión q8, y recomienda `qwen3.5-0.8b_q326_channel` para generación de calidad equilibrada o `qwen3.5-0.8b_q8` para una calidad casi sin pérdida. La métrica de consistencia no está verificada (pendiente de auditoría).

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta completamente en CPU.
- Memoria total estimada: ~580 MB a 4K contexto (450 MB de pesos mmap + ~40 MB de KV cache + ~30 MB de runtime + ~60 MB de overhead de codebooks).
- Dispositivos recomendados: smartphones de gama alta (8 GB RAM), gama media (4-6 GB), gama baja (2-3 GB), Raspberry Pi 5 y placas SBC (4-8 GB), pasarelas IoT (1-2 GB). En wearables de 1 GB la operación es justa.
- Runtime: Aria Engine (de Aria Compute), con soporte para CPU-only. No compatible con vLLM, llama.cpp, Ollama o TGI en este formato propietario.
- Latencia y throughput: no se han publicado datos concretos de latencia ni throughput para este bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Uso previsto |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (original) | 0.8B | 262K | BF16 | ~1.6 GB | Apache 2.0 | GPU/CPU, calidad completa |
| Qwen3.5-0.8B q8 | 0.8B | 4K | 8-bit | ~800 MB | Apache 2.0 | CPU, casi sin pérdida de calidad |
| Qwen3.5-0.8B q4 (este) | 0.8B | 4K | 4-bit | ~450 MB | Apache 2.0 | CPU, máxima compresión, calidad degradada |
| Qwen3-0.6B q4 (referencia) | 0.6B | 4K | 4-bit | ~350 MB | Apache 2.0 | CPU, calidad de referencia para el método q4 |

No hay datos comparativos de benchmarks estándar entre estos modelos. La comparación se basa en el tamaño del fichero, la degradación de calidad declarada y el ámbito de uso.

## Limitaciones y advertencias

- La cuantización de 4 bits con codebooks de grupo produce una degradación notable de la calidad de generación, ~4,3 veces mayor que la versión q8. Es adecuada solo para tareas cortas y simples.
- No apto para generación de texto larga (>2K tokens por generación), ni para razonamiento complejo o demostración de teoremas matemáticos.
- No soporta entrada multimodal (imagen, audio, vídeo). Es un modelo exclusivamente de texto.
- No recomendado para síntesis de programas completos; solo es fiable para funciones cortas.
- El formato de pesos es propietario (aria-quant-bundle) y requiere el runtime Aria Engine; no es compatible con infraestructura estándar como vLLM, llama.cpp o Hugging Face Transformers.
- No apto para inferencia por lotes (batch) ni aceleración GPU en producción.
- La caché KV está optimizada para contexto 4K; el modelo base soporta hasta 262K pero esta cuantización no está validada para contextos largos.
- No se han publicado resultados de benchmarks estándar ni auditoría de calidad verificada (pendiente de gen_quant_eval).
- Aunque la licencia es Apache 2.0, la distribución requiere acceso autenticado al dashboard de Aria Compute para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariacompute/qwen3.5-0.8b_q4
- Repositorio de Aria Compute en GitHub: https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-0.8b
- Dashboard de Aria Compute: https://ariacompute.com/dashboard/models
- Aria Engine: https://ariacompute.com
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio original de Qwen3.5: https://github.com/QwenLM/Qwen3.5
- Página de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Artículo de benchmark de Qwen3.5-0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
