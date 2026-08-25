# deluxetiky/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 es una cuantización en formato NVFP4 (4-bit) del modelo base DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, un fine-tune de Qwen3.8-27B desarrollado por DavidAU. El modelo base aplica la metodología Cold Fusion, que combina la técnica interna GAIN con la infraestructura de entrenamiento de Unsloth, para reducir los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo el 99% del rendimiento en precisión completa tanto a 8 bits como a 4 bits. Esta cuantización, realizada por deluxetiky con llm-compressor, reduce el tamaño del modelo de 52 GB (BF16) a 18 GB, lo que permite ejecutarlo en GPUs de consumo con requisitos de VRAM más accesibles.

El modelo conserva una ventana de contexto de 262 144 tokens, soporta tool calling y razonamiento reducido (respuestas concisas), y está diseñado para servir con vLLM mediante el formato compressed-tensors. Es relevante para desarrolladores que necesitan un modelo de 27B parámetros con bajo coste de inferencia y alta velocidad, sin sacrificar capacidades de razonamiento ni de agente. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text-only, clase Qwen3_5ForCausalLM) |
| Parametros totales | 26 895 998 464 (26.9B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16, activaciones dinámicas con escala fp8_e4m3fn) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.8-27B, un transformer denso de 27B parámetros con atención completa y ventana de contexto de 262K. La metodología Cold Fusion combina GAIN (una técnica interna de DavidAU) con Unsloth para reducir drásticamente los tokens de pensamiento durante el razonamiento, manteniendo la calidad de las respuestas. El fine-tune se realizó sobre el modelo Qwen3.8-27B, que ya incorpora mejoras en codificación y productividad ofimática respecto a versiones anteriores.

La cuantización NVFP4 se realizó con llm-compressor 0.13.0 y compressed-tensors 0.18.0, utilizando formato `nvfp4-pack-quantized` con pesos y activaciones en 4 bits (W4A4), group size 16 y activaciones de entrada con escala dinámica en fp8_e4m3fn. Se calibró con 512 muestras. El checkpoint se convirtió de `model.language_model.*` a `model.*` para la clase text-only de vLLM, y se requiere el registro de arquitectura text-only (PR #40471). El tamaño final es de 18 GB, aproximadamente 2.9 veces menor que el BF16 original.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento reducido: produce respuestas concisas y directas, con menos tokens de razonamiento que los Qwen estándar.
- Tool calling / function calling: soportado mediante el parser `qwen3_xml` y la opción `--enable-auto-tool-choice` en vLLM.
- Capacidades de agente: puede encadenar múltiples pasos de razonamiento y llamadas a herramientas para tareas complejas.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingüe: aunque no se detallan idiomas específicos, el modelo base Qwen3.8 es multilingüe.
- Inferencia eficiente: cuantización 4-bit que reduce requisitos de VRAM y acelera la decodificación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (262K tokens) y respuestas concisas, reduciendo la latencia percibida y el coste por interacción.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, manteniendo un rendimiento cercano al BF16.
- Análisis de documentos extensos: su ventana de 262K tokens permite procesar informes, contratos o artículos científicos completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas.
- Agentes autónomos: combinado con tool calling y razonamiento reducido, es adecuado para agentes que necesitan ejecutar acciones (búsquedas, APIs, cálculos) con respuestas rápidas y directas.
- Razonamiento matemático y lógico: mantiene capacidades de razonamiento a pesar de la cuantización, útil para asistentes educativos o herramientas de análisis.
- Despliegue en hardware de consumo: con 18 GB de pesos, puede ejecutarse en GPUs de 24 GB (p. ej., RTX 4090) con contexto moderado, o en configuraciones multi-GPU para contexto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo base afirma superar los benchmarks críticos de Qwen 3.8, 3.6 y 3.5 27B, pero no se proporcionan cifras concretas. El único benchmark medido es el de rendimiento de inferencia, reportado por el autor de la cuantización:

| Metrica | Valor |
|---|---|
| Decode single (1 petición) | 85.8 tok/s |
| 2 peticiones concurrentes (agregado) | 132 tok/s |
| Contexto máximo | 262K tokens |
| Tool calling | Soportado |
| Razonamiento reducido | Preservado (respuestas concisas) |

Medido en 4x RTX 5090 con TP=4 y vLLM.

## Requisitos de hardware

- VRAM estimada: 18 GB para los pesos cuantizados, más overhead de KV cache. Con contexto completo (262K) y kv-cache fp8, se recomienda al menos 24 GB por GPU.
- GPUs recomendadas: RTX 4090 (24 GB) para contexto moderado; RTX 5090 (32 GB) o A100/H100 para contexto completo y mayor throughput.
- En consumer GPU: sí, cabe en una RTX 4090 con contexto reducido (p. ej., 32K-64K tokens) o en configuraciones multi-GPU (TP=2 o TP=4) para contexto completo.
- Opciones de despliegue: vLLM (recomendado, con `--quantization compressed-tensors`), también compatible con TGI si se convierte a otro formato. No se proporciona soporte nativo para llama.cpp/Ollama en este repo (formato safetensors).
- Latencia y throughput: 85.8 tok/s en decodificación single y 132 tok/s agregado con 2 concurrentes en 4x RTX 5090. En una sola GPU consumer, el throughput será menor, estimable en torno a 30-50 tok/s según cuantización y contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4 (este) | 26.9B | 262K | NVFP4 (4-bit) | Apache 2.0 | HuggingFace |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (base) | 26.9B | 262K | BF16 (también GGUF 8-bit/4-bit) | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (original) | 27B | 262K | BF16 | Apache 2.0 | QwenCloud / HuggingFace |

El modelo cuantizado ofrece el mismo rendimiento que el base (99% según el autor) con un 65% menos de tamaño. Frente al Qwen3.8-27B original, el fine-tune Cold Fusion reduce los tokens de pensamiento, lo que se traduce en respuestas más rápidas y menor coste de inferencia. No se dispone de comparativas con otros modelos de 27B (p. ej., Llama 3.1 27B) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un fine-tune de Qwen3.8, puede heredar los sesgos del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización 4-bit puede aumentar ligeramente la probabilidad de errores en tareas de precisión.
- Limitaciones de contexto: aunque la ventana es de 262K, el uso completo requiere mucha VRAM; en GPUs de 24 GB el contexto práctico se reduce significativamente.
- Limitaciones de idioma: no se especifican idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y la cuantización dependen de vLLM y compressed-tensors; verificar compatibilidad de versiones.
- Dependencia de vLLM: el formato NVFP4 requiere vLLM con soporte para compressed-tensors y la arquitectura text-only de Qwen3.5 (PR #40471). No es directamente compatible con otros runners sin conversión.
- Degradación por cuantización: aunque el autor afirma 99% de rendimiento, la cuantización 4-bit puede afectar tareas de razonamiento complejo o generación de código muy específico.

## Enlaces

- Modelo cuantizado: https://huggingface.co/deluxetiky/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Versión GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Artículo de HackerNoon sobre Cold Fusion: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
