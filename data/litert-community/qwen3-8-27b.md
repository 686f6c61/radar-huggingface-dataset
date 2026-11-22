# litert-community/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27B parámetros desarrollado por Alibaba (familia Qwen), construido sobre la base arquitectónica de Qwen3.5. Se trata de un modelo nativo visión-lenguaje con control flexible de modo "thinking", presentado por el autor como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha. El repositorio analizado aquí no es el checkpoint original, sino una conversión comunitaria al formato `.litertlm` para el runtime LiteRT-LM de Google, orientada a ejecución on-device y en máquinas de clase desktop.

La conversión, mantenida por el colectivo `litert-community`, exporta únicamente el decodificador de texto (26,9B parámetros); la entrada de imagen/vídeo y la cabeza de predicción multi-token no están incluidas en el export. Esto convierte al modelo en un generador de texto puro dentro del ecosistema LiteRT, pero conserva la arquitectura híbrida original de Qwen3.5, que combina capas de atención lineal GatedDeltaNet con capas de atención completa.

La relevancia actual radica en su formato: un modelo de 27B cuantizado a INT4 con contexto dinámico de 32K que corre en GPU de Apple Silicon y CPU Linux mediante LiteRT-LM, con velocidades reportadas de ~940–970 tok/s en prefill y ~33–34 tok/s en decode sobre Metal en un Apple M5 Max. Es, por tanto, una pieza clave para despliegues locales de modelos de gran tamaño en hardware de consumo profesional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas en 16 grupos de 3 capas GatedDeltaNet (atención lineal) + 1 capa de atención completa con puerta; FFN denso en cada capa |
| Parámetros totales | 26,9B (solo decodificador de texto exportado); modelo base Qwen3.8-27B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens dinámicos (archivo `wi4b32_32k`); 4.096 tokens en archivos antiguos |
| Tipos de cuantización | INT4 blockwise-32 simétrico (`dynamic_wi4b32_afp32`); INT4 blockwise-128 min-max + INT8 en lm_head/embedding + FP32 en proyecciones GatedDeltaNet (archivo mixed_int4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repo |

Detalles arquitectónicos adicionales: hidden size 5120, FFN de 17.408, 24 cabezas de atención con 4 KV heads de 256 dimensiones (rotary position en 64 de las 256 dimensiones), atención lineal con 16 cabezas query/key y 48 cabezas value de 128 dimensiones, vocabulario de 248.320 tokens con embeddings no atados (untied).

## Arquitectura y entrenamiento

La arquitectura es la híbrida de Qwen3.5 a escala 27B: 16 grupos de cuatro capas, donde tres son GatedDeltaNet (atención lineal con estado recurrente de tamaño constante) y una es atención completa con puerta. Solo las 16 capas de atención completa mantienen una caché KV creciente (hasta 32.768 tokens en el export `wi4b32_32k`); las 48 capas lineales portan un estado convolucional y recurrente de tamaño fijo, lo que reduce drásticamente el coste de memoria de contexto largo frente a un transformer denso equivalente.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF/DPO en el modelo base Qwen3.8-27B. El export a LiteRT-LM se realizó con el Converter V2 de `litert-torch`, con composites completos de GPU, embedder y pesos externalizados, y grafos `prefill_128`, `prefill_1024` y `decode`. La innovación técnica destacable del export es la combinación de cuantización INT4 blockwise-32 con contexto dinámico de 32K y soporte simultáneo de thinking y tool calling en el runtime LiteRT-LM ≥ 0.20.0.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable y desactivable (el archivo `wi4b32_32k` habilita ambos; los archivos mixed_int4 solo soportan thinking off).
- Tool calling / function calling estructurado, con `tool_call_config` y `supports_function_calling: true` en los metadatos del modelo (verificado con 3/3 prompts en LiteRT-LM 0.19.0 sobre CPU de Mac).
- Razonamiento multi-paso y uso como agente, gracias al contexto de 32K y al soporte de llamadas a herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen suele ser multilingüe, pero no se confirma aquí).
- Capacidades de visión y vídeo: presentes en el modelo base Qwen3.8-27B, pero **no exportadas** en este repositorio (solo decodificador de texto).
- Recuperación de información en contexto largo (needle retrieval verificado con 2.7K tokens en Apple Silicon GPU).
- Conversación multi-turno.

## Casos de uso

- **Asistente local en portátil o estación de trabajo Apple Silicon**: el archivo `wi4b32_32k` corre en GPU Metal con ~33–34 tok/s de decode, lo que permite un asistente conversacional interactivo sin conexión a la nube, con contexto de hasta 32K tokens para conversaciones largas o documentos extensos.
- **Atención al cliente automatizada con contexto largo**: los 32.768 tokens de ventana dinámica permiten mantener historiales multi-turno extensos y adjuntar documentación de producto, con tool calling para consultar sistemas internos (estado de pedidos, CRM) mediante function calling estructurado.
- **Agentes de automatización de tareas**: el soporte de tool calling y razonamiento multi-paso permite construir agentes que encadenen llamadas a APIs, consultas a bases de datos y acciones sobre ficheros, ejecutándose íntegramente en local para cumplir requisitos de privacidad.
- **Procesamiento de documentos en el borde (edge)**: resumen, extracción de entidades y Q&A sobre contratos o informes de hasta decenas de miles de tokens, desplegado en equipos de sobremesa sin GPU dedicada de datacenter (verificado en CPU Linux con `--cache disk`).
- **Generación de código en entornos air-gapped**: al ejecutarse con LiteRT-LM en local, puede integrarse en estaciones de desarrollo sin acceso a internet para autocompletado, explicación de código y generación de tests, manteniendo el código fuente dentro del perímetro de la organización.
- **Prototipado e investigación en runtime LiteRT-LM**: sirve como banco de pruebas para medir latencia y throughput de modelos de 27B cuantizados en hardware de consumo, con métricas publicadas (prefill ~940–970 tok/s, decode ~33–34 tok/s en M5 Max; ~293 / 29,7 tok/s en WebGPU) que permiten comparar backends Metal frente a WebGPU.
- **Despliegue en dispositivos con recursos limitados de memoria**: el peso de 15,17 GB en INT4 permite cargar el modelo en equipos con 24–32 GB de memoria unificada, algo inviable con el checkpoint en FP16/BF16.

## Benchmarks y rendimiento

Datos reportados por el proveedor del modelo base (Qwen), no ejecutados por el conversor:

| Benchmark | Qwen3.8-27B (reportado por Qwen) |
|---|---|
| GPQA Diamond | 89,2 |
| IFBench | 79,5 |

Rendimiento de inferencia del export LiteRT-LM (medido por el autor de la conversión):

| Backend / hardware | Prefill | Decode |
|---|---|---|
| Apple M5 Max GPU (Metal), 1024p/256d, 1K–32K contexto | ~940–970 tok/s | ~33–34 tok/s |
| WebGPU (mismo hardware) | ~293 tok/s | ~29,7 tok/s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM/memoria estimada**: el archivo recomendado pesa 15,17 GB; se necesita al menos esa cantidad de memoria unificada o VRAM más overhead del runtime y de la caché KV (32K tokens en 16 capas de atención completa). En la práctica, se recomienda 24–32 GB de memoria unificada en Apple Silicon o GPU con 24 GB+ de VRAM.
- **GPU recomendadas**: Apple Silicon (M4 Max, M5 Max verificados) vía Metal; GPU de escritorio con soporte de composites LiteRT; WebGPU como backend alternativo verificado. No se especifican modelos NVIDIA/AMD concretos en la información disponible.
- **¿Cabe en GPU de consumo?**: sí, en GPUs con 24 GB o más de VRAM o en equipos Apple Silicon con memoria unificada de 24–32 GB. No cabe en GPUs de 8–16 GB.
- **Opciones de despliegue**: LiteRT-LM (`litert-lm`, `litert-lm-nightly` ≥ 0.20.0 para el archivo `wi4b32_32k`; 0.18.1–0.19.1 para el archivo mixed_int4), con soporte de CPU (`--cache disk`) y GPU (Metal, WebGPU). No se distribuyen pesos en GGUF, por lo que llama.cpp/Ollama no son aplicables directamente a estos ficheros.
- **Latencia y throughput**: ver tabla de benchmarks; el prefill escala de 1K a 32K sin degradación reportada en Metal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (LiteRT-LM, este repo) | 26,9B (solo texto) | 32K | `.litertlm` INT4 | Apache 2.0 | On-device, tool calling, thinking; sin visión en el export |
| Qwen/Qwen3.8-27B (original) | 27B | No disponible | safetensors | Apache 2.0 (según repo base) | Visión-lenguaje completo, thinking; requiere runtime estándar (transformers/vLLM) |
| Alternativas de ~27B en formato GGUF | ~27B | Variable | GGUF | Variable | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- **Solo texto**: el export no incluye la torre de visión ni la cabeza de predicción multi-token del modelo base; no puede procesar imágenes ni vídeo a pesar de que Qwen3.8-27B sea un modelo visión-lenguaje nativo.
- **Dependencia de versión del runtime**: el archivo recomendado exige LiteRT-LM ≥ 0.20.0 (nightly, build desde `main` o estable futura). Los archivos mixed_int4 tienen contexto de solo 4K y thinking desactivado.
- **Riesgo de alucinación**: inherente a los modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento, no detallados aquí.
- **Idiomas**: no se especifican los idiomas soportados; el rendimiento en castellano no está verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del checkpoint base Qwen3.8-27B y las condiciones del runtime LiteRT-LM para producción.
- **Formato propietario del runtime**: los pesos `.litertlm` no son portables a otros runtimes sin reconversión; la comunidad que mantiene el repo es independiente de Qwen y de Google.
- **Benchmarks del proveedor**: los resultados de GPQA Diamond e IFBench son reportados por Qwen y no han sido verificados de forma independiente en este export.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Configuración de tool calling Qwen3.5 en LiteRT-LM v0.19.0: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext
- Conversor litert-torch (commit usado en el export GPU): https://github.com/google-ai-edge/litert-torch/commit/d600176b2e29bcc900a7e193f054ab3d6c3c747e
