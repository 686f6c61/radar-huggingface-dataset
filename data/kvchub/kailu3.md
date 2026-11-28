# KVCHub/KaiLu3

## Resumen

KaiLu 3 Mini es un modelo de lenguaje conversacional de 329.353.216 parámetros (aproximadamente 329M) desarrollado desde cero por KvcHub. Emplea una arquitectura híbrida basada en el layout de capas de LFM2: 24 capas en total, de las cuales 16 son convoluciones cortas con compuerta (kernel 3) y 8 son capas de atención, distribuidas en las posiciones 3, 6, 9, 12, 15, 18, 21 y 23. El modelo se distribuye con pesos en bfloat16 y safetensors bajo el formato `Lfm2ForCausalLM` de Transformers 4.54 o superior.

El modelo fue preentrenado con 6,6B tokens procedentes de una mezcla de corpus educativos, libros de texto sintéticos, web general, matemáticas, Wikipedia y código. Posteriormente recibió un ajuste supervisado con aproximadamente 460K conversaciones y un ajuste de preferencias mediante DPO (β = 0,1). Su ventana de contexto es de 1.024 tokens y su vocabulario de 32.768 tokens con BPE a nivel de byte.

La relevancia de KaiLu 3 Mini radica en su reducido tamaño, que lo hace apto para despliegue en hardware modesto, combinado con un entrenamiento completo desde cero y un pipeline de alineación conversacional. Su licencia, sin embargo, restringe el uso comercial sin autorización previa por escrito, lo que limita su adopción en entornos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de convolución corta con compuerta (kernel 3) + 8 capas de atención; layout de capas LFM2 |
| Parametros totales | 329.353.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF disponible (según tags del repositorio); niveles específicos no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | kailu-3-license (uso personal y no comercial gratuito; uso comercial requiere permiso escrito de KvcHub) |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Capas | 24 (16 convolución corta con compuerta, 8 atención) |
| Anchura oculta | 1.024 |
| Feed-forward | SwiGLU con dimensión 2.816 |
| Atención | 16 cabezas de consulta, 4 cabezas clave-valor (GQA), QK-norm, RoPE θ = 1.000.000 |
| Vocabulario | 32.768 tokens (BPE a nivel de byte) |
| Embeddings | Entrada y salida compartidos |
| Librería | Transformers 4.54+ (`Lfm2ForCausalLM`) |
| Descargas | 204 |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

KaiLu 3 Mini combina dos tipos de capas en una arquitectura híbrida. Las 16 capas de convolución corta con compuerta (kernel 3) procesan contextos locales de forma eficiente, mientras que las 8 capas de atención, intercaladas en posiciones concretas, modelan dependencias globales. La atención usa 16 cabezas de consulta y 4 cabezas clave-valor (GQA), con QK-norm y RoPE con θ = 1.000.000. El feed-forward es SwiGLU con dimensión 2.816 y los embeddings de entrada y salida están compartidos. Los pesos se distribuyen en bfloat16.

El preentrenamiento consumió 6,6B tokens con la siguiente composición: web educativa FineWeb-Edu (50%), libros de texto sintéticos Cosmopedia v2 (18%), web general y libros SlimPajama-6B sin Books3 (12%), matemáticas FineMath 4+ (8%), Wikipedia (6%) y código OpenCoder annealing (6%). Después se aplicó un ajuste supervisado con aproximadamente 460K conversaciones de smol-smoltalk durante una pasada, aprendiendo solo de las respuestas del asistente. Finalmente, se realizó un ajuste de preferencias con DPO (β = 0,1) usando hasta 60K pares de UltraFeedback binarizado, HelpSteer2 y Anthropic HH-RLHF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat basado en etiquetas `<|system|>`, `<|user|>` y `<|assistant|>`, terminando cada respuesta con `<|endoftext|>`.
- Razonamiento básico y respuesta a preguntas dentro de su ventana de 1.024 tokens.
- Generación de código, aunque el propio autor advierte que puede producir código con errores.
- Capacidades matemáticas limitadas, entrenadas con un 8% de datos de FineMath 4+.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales ligeros en local: el modelo puede gestionar diálogos de pocos turnos en inglés dentro de su ventana de 1.024 tokens, adecuado para prototipos y demostraciones en hardware de consumo.
- Educación y experimentación: sirve como base para estudiar arquitecturas híbridas convolución-atención y pipelines de alineación (SFT + DPO) en un modelo pequeño entrenado desde cero.
- Generación de texto en dispositivos con recursos limitados: sus 329M parámetros permiten ejecución en CPU o GPU modesta mediante Transformers o llama.cpp.
- Chatbots de dominio acotado: para preguntas frecuentes o soporte básico en inglés donde la longitud de contexto no supere 1.024 tokens.
- Filtrado y clasificación de texto conversacional: puede reformular o resumir fragmentos cortos de texto en inglés.
- Investigación sobre alineación: el modelo permite reproducir y analizar el efecto de DPO con UltraFeedback, HelpSteer2 y HH-RLHF en un modelo de escala pequeña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,66 GB solo para pesos (329M × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB.
- En cuantización GGUF de 4 bits, los pesos ocuparían del orden de 0,2 GB; los niveles concretos disponibles no están especificados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: Transformers 4.54+ (`Lfm2ForCausalLM`), llama.cpp y Ollama (según los tags del repositorio); vLLM y TGI no están confirmados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KaiLu 3 Mini | 329M | 1.024 | kailu-3-license (no comercial sin permiso) | safetensors, GGUF | Híbrido convolución-atención, entrenado desde cero |
| KaiLu-3-Pro (KvcHub) | 1,03B | no disponible | Apache-2.0 | safetensors, GGUF | Mismo autor, licencia permisiva, mayor tamaño |
| SmolLM2 (HuggingFaceTB) | 135M / 360M / 1,7B | hasta 8.192 en algunas variantes | Apache-2.0 | safetensors, GGUF | Familia de modelos pequeños con licencia permisiva |
| LFM2 (Liquid AI) | no disponible | no disponible | no disponible | safetensors | Arquitectura de referencia del layout de capas |

Los datos de contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede afirmar datos falsos con confianza, perder el hilo en conversaciones largas y generar código con errores.
- La ventana de contexto es de solo 1.024 tokens, lo que limita conversaciones y documentos largos.
- Solo soporta inglés; no hay capacidades multilingües.
- No ha recibido pruebas de seguridad más allá del ajuste de preferencias, por lo que sus respuestas deben verificarse antes de confiar en ellas.
- La licencia kailu-3-license prohíbe el uso comercial (productos de pago, apps con publicidad, APIs de pago, trabajo interno de empresa o trabajo para clientes) sin permiso previo por escrito de KvcHub.
- Los datasets de entrenamiento conservan sus propias licencias.
- Es un modelo de 329M parámetros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor escala.
- No se han publicado benchmarks que permitan evaluar su rendimiento de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KVCHub/KaiLu3
- Licencia: https://huggingface.co/KvcHub/KaiLu-3-Mini/blob/main/LICENSE
- Documento de seguridad: https://huggingface.co/KvcHub/KaiLu-3-Mini/blob/main/SECURITY.md
- KaiLu-3-Pro: https://huggingface.co/KvcHub/KaiLu-3-Pro
- Kava-Privacy-30M: https://huggingface.co/KvcHub/Kava-Privacy-30M
- Kava-Privacy-2.01M-mlx: https://huggingface.co/KvcHub/Kava-Privacy-2.01M-mlx
- Kava-Privacy-636k-mlx: https://huggingface.co/KvcHub/Kava-Privacy-636k-mlx
- Sitio del autor: https://kvchub.com
- Contacto comercial: hello@kvchub.com
