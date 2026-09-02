# heswithme/Huihui-Qwen3.8-27B-Abliterated-Gittensor-Style-NVFP4-RTX5090

## Resumen

Este modelo es una cuantización NVFP4 de los pesos BF16 del checkpoint abliterado de Huihui para Qwen3.8-27B, adaptada al layout de cuantización utilizado por Gittensor en su release para RTX 5090. El resultado es un artefacto independiente, no oficial de Huihui, Gittensor, Qwen, NVIDIA ni SGLang, que combina la eliminación de comportamientos de rechazo (abliteration) con una cuantización de 4 bits optimizada para hardware NVIDIA Blackwell.

El modelo base, Qwen3.8-27B, es un modelo híbrido que combina atención transformer con capas Gated-DeltaNet (SSM), y soporta entrada multimodal (imagen y texto). La versión abliterada de Huihui elimina parcialmente los mecanismos de rechazo y filtrado de seguridad en las capas 18-51 (según su numeración), lo que la hace útil para escenarios donde se requiere una generación menos restrictiva, aunque con los riesgos asociados.

La cuantización NVFP4 (W4A4, group size 16) reduce el tamaño del checkpoint a 17,9 GB, permitiendo su ejecución en una RTX 5090 de 32 GB con una ventana de contexto de hasta 262.144 tokens en modo nativo, o 202.000 tokens con decodificación especulativa mediante el drafter DSpark. El modelo está pensado para despliegue con SGLang y ha sido validado en un benchmark propio de agentes de codificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con atención + capas Gated-DeltaNet (SSM), multimodal (imagen-texto) |
| Parametros totales | 27B (modelo base BF16); 14.557.547.760 en el checkpoint NVFP4 (sin MTP head) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo, sin especulación); 202.000 tokens con DSpark |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16); versiones BF16 disponibles en el modelo base |
| Idiomas soportados | No disponible (presumiblemente multilingüe, como Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (2 shards, 2.387 tensores) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que intercala capas de atención tradicional con capas Gated-DeltaNet, un tipo de SSM con mecanismo de puerta. Esta combinación permite manejar secuencias largas de forma eficiente en memoria y cómputo. El modelo acepta entradas de imagen y texto (pipeline `image-text-to-text`), lo que lo habilita para tareas de visión-lenguaje.

El checkpoint original BF16 de Huihui fue sometido a un proceso de abliteration que modifica los pesos de las capas `mlp.down_proj` (capas 17-51 en numeración zero-based) para reducir los comportamientos de rechazo y los filtros de seguridad. Sobre estos pesos, el autor de este release aplicó una cuantización PTQ con NVIDIA Model Optimizer, siguiendo la receta NVFP4 de Gittensor: W4A4 con group size 16, calibración con 128 muestras de imagen-texto y longitud de secuencia 512. Las capas de visión, embeddings y las proyecciones `conv1d`, `in_proj_a` e `in_proj_b` de Gated-DeltaNet se mantuvieron fuera de la cuantización para preservar la estabilidad numérica. El `lm_head` se tomó byte a byte del release de Gittensor, ya que Huihui indica que no fue modificado.

El entrenamiento original del modelo base no está documentado en la información disponible; se desconoce el número de tokens, la composición del dataset y si se usó RLHF o DPO. La abliteration es una modificación posterior de los pesos, no un reentrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262.144 tokens.
- Entrada multimodal: procesa imágenes junto con texto (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling mediante el parser `qwen3_coder` en SGLang.
- Capacidad para tareas de agente con razonamiento multi-paso, incluyendo modo *thinking* configurable (`reasoning_effort`).
- Decodificación especulativa con drafter externo DSpark (NVFP4) para acelerar la generación.
- Generación de código y soporte para benchmarks de agentes de codificación (validado en un benchmark propio de 4.096 pasos).
- Multilingüismo presumible (no confirmado en la documentación del release).

## Casos de uso

- Agentes de codificación autónomos: el modelo puede ejecutar tareas de programación multi-paso con acceso a herramientas, gracias a su soporte de tool calling y su ventana de contexto de 202k tokens con DSpark. El benchmark propio muestra un 100/100 de éxito en un escenario de agente de codificación con 4.096 pasos.
- Asistente de desarrollo integrado en CI/CD: puede revisar código, generar parches y ejecutar comandos en pipelines de integración continua, usando el parser `qwen3_coder` para invocar funciones.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o documentos escaneados combinados con instrucciones de texto.
- Atención al cliente automatizada: con 262k tokens de contexto, puede mantener conversaciones largas y recordar el historial completo de una interacción, reduciendo la pérdida de información en diálogos extensos.
- Generación de contenido creativo sin restricciones: la abliteration reduce los filtros de rechazo, lo que permite explorar temas que otros modelos rechazarían, aunque con los riesgos de seguridad asociados.
- Investigación en alineación y seguridad: el checkpoint abliterado sirve como caso de estudio para analizar el impacto de la eliminación de mecanismos de rechazo en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta un benchmark propio de agente de codificación con 4.096 pasos, ejecutado en una RTX 5090 de 32 GB:

| Configuracion | Resultado | Tiempo total | Decodificacion mediana |
|---|---:|---:|---:|
| Solo target, 262k / 32k salida | 99,375/100 | 53 min 09 s | 72,1 tok/s |
| Con DSpark, 202k / 32k salida | 100/100 | 21 min 26 s | 148,2 tok/s |

Estos valores corresponden a una única ejecución sobre un benchmark personalizado y no deben interpretarse como una afirmación general de rendimiento.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 17,9 GB en disco; la inferencia con SGLang y contexto 262k requiere al menos 32 GB de VRAM (validado en RTX 5090).
- GPU recomendada: RTX 5090 (32 GB) o GPUs Blackwell con soporte NVFP4. No se ha validado en GPUs de menor VRAM.
- En consumer GPUs: cabe en una RTX 5090; no se garantiza en GPUs de 24 GB o menos debido al tamaño del modelo y la ventana de contexto.
- Opciones de despliegue: SGLang (recomendado, con soporte nativo para NVFP4 y DSpark), Ollama (existe una versión del modelo abliterado en el registro de Ollama), y potencialmente vLLM o llama.cpp si soportan NVFP4 (no confirmado).
- Latencia y throughput: sin especulación, ~72 tok/s de decodificación mediana; con DSpark, ~148 tok/s en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| heswithme/Huihui-Qwen3.8-27B-Abliterated-Gittensor-Style-NVFP4-RTX5090 | 27B (14,56B en checkpoint) | 262k (202k con DSpark) | NVFP4 | Apache 2.0 | Abliterado, multimodal, optimizado para RTX 5090 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | No disponible | BF16 | Apache 2.0 | Modelo base abliterado, sin cuantizar |
| gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090 | 27B | No disponible | NVFP4 | Apache 2.0 | Release original de Gittensor, sin abliteration |
| Qwen3.8-27B (original) | 27B | No disponible | BF16 | Apache 2.0 | Modelo base sin modificaciones |

La comparativa se basa en los datos disponibles; no se conocen resultados de benchmarks estándar para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce significativamente los comportamientos de rechazo y los filtros de seguridad. Los resultados deben tratarse como no confiables y no aptos para producción sin supervisión humana.
- Riesgo elevado de alucinación, especialmente en tareas de razonamiento o generación de código, debido a la eliminación de mecanismos de control.
- La ventana de contexto de 262.144 tokens es el valor arquitectónico y de servicio calificado; con DSpark se reduce a 202.000 tokens, y el presupuesto de secuencia compartido (prompt + herramientas + salida) es de 170.000 tokens en la configuración recomendada.
- No se han publicado resultados de benchmarks estándar; el rendimiento reportado proviene de un benchmark propio de una sola ejecución.
- La cuantización NVFP4 está optimizada para hardware NVIDIA Blackwell; puede no funcionar correctamente en GPUs de generaciones anteriores.
- El modelo no incluye el MTP head nativo; la decodificación especulativa requiere descargar el drafter DSpark por separado.
- No se dispone de información sobre los idiomas soportados ni sobre el proceso de entrenamiento original del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/heswithme/Huihui-Qwen3.8-27B-Abliterated-Gittensor-Style-NVFP4-RTX5090
- Modelo base abliterado (BF16): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Release NVFP4 de Gittensor: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Drafter DSpark: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Versión en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated:27b
