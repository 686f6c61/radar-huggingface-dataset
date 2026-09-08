# mlboydaisuke/MiniCPM5-2B-CoreAI

## Resumen

MiniCPM5-2B-CoreAI es una conversión del modelo MiniCPM5-2B de OpenBMB al formato Apple Core AI (.aimodel), realizada por el usuario mlboydaisuke. Se trata de un LLM de 2.5B parámetros diseñado para ejecutarse completamente en dispositivos Apple, como iPhone y Macs con Apple Silicon, aprovechando la GPU o el Neural Engine. El modelo original, lanzado el 6 de septiembre de 2026, incorpora razonamiento híbrido Think / No-Think, tool calling nativo y una ventana de contexto de 128K tokens.

Esta conversión utiliza cuantización int8 simétrica por bloques de 32 (per-block-32) para los pesos, manteniendo SDPA, RoPE y RMSNorm en precisión completa. El resultado es un bundle de 2.7 GB que puede cargarse en dispositivo y ofrece un rendimiento de 127.6 tok/s de decodificación en un M4 Max y 22.4 tok/s en un iPhone 17 Pro. Es relevante para desarrolladores que quieran integrar modelos de lenguaje en aplicaciones iOS/macOS con privacidad y sin conexión, dentro del ecosistema Core AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parámetros totales | 2.5B (según el fabricante; el nombre indica 2B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (declarado); en iPhone limitado a 1024 tokens por el runtime Core AI |
| Tipos de cuantización | int8 simétrico per-block-32 (pesos); SDPA/RoPE/RMSNorm en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .aimodel (bundle de Core AI) |

## Arquitectura y entrenamiento

El modelo original MiniCPM5-2B es un LLM de 2.5B parámetros con 42 capas, desarrollado por OpenBMB. Integra un mecanismo de razonamiento híbrido Think / No-Think que permite alternar entre modos de razonamiento explícito y respuesta directa, junto con soporte nativo de tool calling. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en la información disponible.

La conversión a Core AI se realiza mediante la herramienta coreai-torch y el paso de exportación coreai.llm.export. La cuantización es weight-only, simétrica, int8 y per-block-32 (una escala por cada bloque de 32 a lo largo de la dimensión de entrada, sin clipping). Esta configuración se eligió tras medir que el int8 per-channel degradaba el rendimiento en la GPU de Mac (25.6 tok/s) frente al per-block-32 (127.6 tok/s), que activa la ruta de matmul cuantizado rápido.

## Capacidades

- Generación de texto y razonamiento híbrido Think / No-Think.
- Tool calling / function calling nativo.
- Soporte de agentes y razonamiento multi-paso, gracias a la combinación de tool calling y modo Think.
- Contexto largo de 128K tokens (con limitación a 1024 en iOS).
- Ejecución completamente on-device, sin conexión, en iPhone y Apple Silicon.
- Integración con el ecosistema Core AI (CoreAIKit, CoreAIOps) para apps iOS/macOS.
- Capacidades multilingües: no especificadas.

## Casos de uso

- Asistente personal privado en iPhone: el modelo se ejecuta localmente, por lo que las conversaciones no salen del dispositivo. Se puede usar para responder preguntas, resumir textos o gestionar tareas, teniendo en cuenta el límite de 1024 tokens en iOS.
- Aplicaciones de productividad en Mac: integración en apps de escritorio mediante CoreAIKit para generar resúmenes, redactar correos o analizar documentos, con contexto completo de 128K en macOS.
- Desarrollo de apps con Core AI: los desarrolladores pueden usar el modelo como base para crear aplicaciones iOS/macOS con IA generativa, usando la API de CoreAIKit o CoreAIOps para simplificar la integración.
- Generación de código y asistencia en programación: el modelo alcanza un 69.1 en LiveCodeBench v6 y 46.4 en SWE-bench Verified (según el fabricante), lo que lo hace adecuado para tareas de autocompletado, revisión de código y generación de scripts.
- Razonamiento matemático y científico: con un 86.5 en AIME 2026, puede utilizarse para resolver problemas matemáticos avanzados en entornos educativos o de investigación, sin necesidad de conexión.
- Agentes autónomos en el dispositivo: gracias al tool calling nativo y al modo Think, puede actuar como agente que ejecuta múltiples pasos, por ejemplo, consultar datos locales, hacer cálculos y presentar resultados, todo offline.
- Análisis de datos con privacidad: en sectores como salud o finanzas, donde los datos no pueden salir del dispositivo, el modelo permite procesar texto y generar informes sin conexión.

## Benchmarks y rendimiento

El modelo base MiniCPM5-2B reporta los siguientes resultados en benchmarks (según OpenBMB):

| Benchmark | Resultado |
|---|---|
| LiveCodeBench v6 | 69.1 |
| AIME 2026 | 86.5 |
| BFCL v4 | 66.6 |
| SWE-bench Verified | 46.4 |

Rendimiento medido en la conversión Core AI:

| Entorno | Decodificación | Prefill | Exactitud vs fp32 |
|---|---|---|---|
| iPhone 17 Pro (A19 Pro, Release) | 22.4 tok/s | 27.3 tok/s | 24/24 + 24/24 token-exact |
| M4 Max (macOS 27, Release) | 127.6 tok/s | 2654 tok/s | 16/16 token-exact (margen mínimo 0.925) |

Comparación de cuantizaciones en M4 Max (512p/1024g): int8 per-channel 25.6 tok/s, fp16 80.0 tok/s, int8 per-block-32 127.6 tok/s.

## Requisitos de hardware

- Tamaño del modelo: 2.7 GB en disco (tanto en Mac como en iPhone).
- Requiere Apple Silicon (iPhone o Mac). En iPhone, se necesita el entitlement com.apple.developer.kernel.increased-memory-limit para superar el límite de jetsam.
- GPU recomendadas: Apple Silicon (A19 Pro, M4 Max, etc.). No es compatible con GPUs de NVIDIA ni con consumer GPUs.
- Opciones de despliegue: Core AI runtime, CoreAIKit (SPM), CoreAIOps, ChatDemo. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia: en iPhone 17 Pro, el arranque en frío del motor tarda 28.9 s. En M4 Max, la decodificación alcanza 127.6 tok/s y el prefill 2654 tok/s.
- En iPhone, el contexto efectivo está limitado a 1024 tokens (prompt + generados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en iPhone 17 Pro | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-2B-CoreAI | 2.5B | 128K (limitado a 1024 en iOS) | 22.4 tok/s (int8 per-block-32) | Apache 2.0 | .aimodel |
| MiniCPM5-1B-CoreAI | 1B (según el nombre) | no disponible | 66.8 tok/s (int8 per-channel) | Apache 2.0 | .aimodel |
| openbmb/MiniCPM5-2B | 2.5B | 128K | no disponible (no es Core AI) | Apache 2.0 | no disponible |

Nota: los datos del 1B provienen de la model card del 2B, que lo menciona como "int8 66.8 tok/s on the same phone".

## Limitaciones y advertencias

- En iPhone, el límite efectivo de contexto es de 1024 tokens (prompt + generación) debido a una restricción del CoreAIPipelinedEngine, a pesar de que el bundle declara 128K. Es necesario trocear o recortar el historial en iOS.
- La cuantización int8 per-block-32 puede producir diferencias mínimas en la generación respecto al modelo fp32. En la prueba de free-run, 3 de 4 respuestas fueron exactas, con un fallo en un nombre debido a un margen de probabilidad muy pequeño (0.2126 vs 0.2065).
- El modelo fp16 es más fiel (4/4 exacto) pero más lento (80.0 tok/s vs 127.6 tok/s en M4 Max), por lo que hay que sopesar precisión y velocidad.
- No se han publicado detalles sobre sesgos, riesgos de alucinación o limitaciones idiomáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las herramientas Core AI.
- Para producción, es necesario validar la calidad de las respuestas en el dominio concreto, especialmente en tareas que requieren alta precisión.

## Enlaces

- HuggingFace: https://huggingface.co/mlboydaisuke/MiniCPM5-2B-CoreAI
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Core AI model zoo: https://github.com/john-rocky/coreai-model-zoo
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/main/docs/COOKBOOK.md
- ChatDemo: https://github.com/john-rocky/coreai-kit/tree/main/Examples/ChatDemo
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/main/Examples/ChatDemo/Sources/QuickStart.swift
- Apple silicon LLM bench: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark: https://devicemark.github.io/
