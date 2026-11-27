# eduardoworrel/alias3-micro-1026-ONNX

## Resumen

alias3-micro-1026-ONNX es la exportación a formato ONNX del modelo aliasrobotics/alias3-micro-1026, desarrollado por Alias Robotics. Se trata de un modelo de lenguaje orientado a ciberseguridad que implementa un esquema de decisión de doble sistema (System 1 / System 2) inspirado en el marco de procesos duales de Kahneman. El modelo base se distribuye como "research preview" y esta exportación lo hace ejecutable en navegador mediante transformers.js y WebGPU.

La arquitectura subyacente es un transformer de la familia Qwen 3.5 (tag `qwen3_5_text`), exportado con optimum y un grafo Scan, con la particularidad de exponer el estado oculto (hidden state) para que las cabezas de decisión de System 1 puedan leerlo. El autor de la exportación es eduardoworrel, que publica siete variantes de cuantización en un repositorio de 50,7 GB.

Su relevancia actual radica en que permite ejecutar un modelo de decisión en ciberseguridad directamente en el navegador (Chrome con WebGPU) con el fichero `model_q4.onnx` de 3,04 GB, manteniendo una precisión estadísticamente indistinguible del original en PyTorch bf16 según las pruebas publicadas (0 de 70 tests pareados con McNemar). El contexto, el número de parámetros y los idiomas no están especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5_text`), exportado a ONNX con grafo Scan |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, q8, uint8, q4, q4f16, bnb4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con datos externos en chunks de hasta 2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de texto de la familia Qwen 3.5. La exportación ONNX se realizó con optimum (export fp32 y fp16 mediante dynamo y grafo Scan, con un parche propio de optimum-onnx) y con scripts propios para las cuantizaciones de 4 bits (MatMulNBits int4 y GBQ int4 para embeddings), ya que optimum no soporta 4 bits de forma nativa. La innovación principal es la exposición del hidden state en el grafo ONNX, lo que permite conectar cabezas de decisión externas (`head.bin` y `head_score.bin`) que implementan el System 1.

El esquema System 1 / System 2 y la interfaz de cabeza bilineal tipo pointer provienen del paper arXiv:2610.16550, que adapta la cabeza de decisión tipada de la línea Jev / System One de TypeSafe AI y los pointer networks de Vinyals et al. (arXiv:1506.03134). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y decisiones tipadas en el dominio de ciberseguridad (preguntas sí/no, elección múltiple y puntuación de severidad).
- Doble sistema de decisión: lectura directa desde los logits (System 1 rápido) o mediante cabezas de lectura del hidden state (`head.bin`, `head_score.bin`).
- Ejecución en navegador con transformers.js y WebGPU mediante `generate()`.
- Soporte de decodificación con `generate()` en transformers.js (24/24 pruebas correctas en Chrome según la model card).
- Puntuación de severidad como prueba de concepto (`head_score.bin`), con precisión exacta y tolerancia ±1.
- Capacidades multilingües: no disponibles.
- Tool calling, function calling, agentes y visión: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y triaje de incidentes de seguridad en el navegador: el modelo puede clasificar alertas como sí/no o por severidad directamente en Chrome con WebGPU, sin enviar datos a un servidor, usando `model_q4.onnx` (3,04 GB) y la cabeza `head_score.bin`.
- Asistente de decisión embebido en paneles SOC: integrado vía transformers.js, permite responder preguntas de elección múltiple sobre eventos de seguridad con latencia de 5,8-7,6 s por decisión en un Apple M2 Pro, adecuado para flujos interactivos no críticos.
- Clasificación de severidad de vulnerabilidades: la cabeza `head_score.bin` ofrece puntuación exacta (26/50) y con tolerancia ±1 (47/50) sobre el conjunto de prueba, útil como primera pasada antes de revisión humana.
- Enriquecimiento de pipelines de CI/CD de seguridad: la exportación ONNX puede ejecutarse con onnxruntime en servidores CUDA para predecir decisiones sobre hallazgos de escaneo, manteniendo paridad con el modelo PyTorch original.
- Prototipado de sistemas de decisión duales: investigadores pueden usar el hidden state expuesto para entrenar y evaluar sus propias cabezas de decisión sin reexportar el modelo.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el cliente (navegador), permite análisis de seguridad sobre datos sensibles sin salir del dispositivo del usuario.

## Benchmarks y rendimiento

Resultados de System 1 sobre el conjunto de decisión (logits / cabeza), comparados con el original en PyTorch bf16:

| Fichero | Sí/no (65) logits | Sí/no (65) head.bin | Elección múltiple (57) logits | Elección múltiple (57) head.bin | Severidad (50) exacta logits | Severidad (50) exacta head_score.bin | Severidad (50) ±1 head_score.bin | Respuestas cambiadas vs original |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | 47/50 | — |
| model_q4 | 55/65 | 54/65 | 39/57 | 48/57 | 20/50 | 26/50 | 47/50 | 17,4% |
| model_q4f16 | 55/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 48/50 | 17,4% |
| model_fp16 | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3% |
| model (fp32) | 54/65 | 54/65 | 38/57 | 46/57 | 20/50 | 26/50 | 47/50 | 2,3% |
| model_bnb4 | 55/65 | 53/65 | 44/57 | 46/57 | 20/50 | 31/50 | 45/50 | 11,6% |
| model_quantized | 51/65 | 52/65 | 40/57 | 43/57 | 18/50 | 20/50 | 45/50 | 22,1% |
| model_uint8 | 54/65 | 53/65 | 39/57 | 39/57 | 18/50 | 22/50 | 45/50 | 26,7% |

Según el autor, la precisión no es estadísticamente distinguible del original (0 de 70 tests pareados de McNemar, antes o después de corrección de Holm), aunque las decisiones individuales cambian en un 2,3-26,7% de las preguntas. El conjunto de prueba (50-65 preguntas por modo) solo detecta pérdidas grandes. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero fp32 ocupa 16,83 GB y el fp16 8,42 GB; las variantes de 4 bits rondan 2,7-3,04 GB.
- GPU recomendadas: no especificadas en la información; las pruebas se realizaron con onnxruntime CUDA y con WebGPU en un Apple M2 Pro.
- Cabe en GPU de consumo: sí, las variantes q4 (3,04 GB), q4f16 (2,73 GB) y bnb4 (2,74 GB) caben en GPUs con 4 GB o más de VRAM; las variantes fp16, fp32, q8 y uint8 superan los 4 GB.
- Despliegue: transformers.js (Node y Chrome WebGPU), onnxruntime (CUDA), y variantes del mismo autor para ONNX GenAI, ONNX decode-only, MLC (q4f32_1, q4f16_1) y LiteRT.js.
- Latencia y throughput medidos (Chrome WebGPU, Apple M2 Pro, transformers.js 4.3.1): carga de 11,4-11,9 s; tiempo por decisión de 5,8 s (q4f16), 7,4 s (q4) y 7,6 s (bnb4); concordancia con el servidor de 390/394 (q4f16) y 394/394 (q4 y bnb4).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (ciberseguridad con decisión dual) en la documentación proporcionada. Las alternativas que el propio autor referencia son variantes de despliegue del mismo modelo, no modelos distintos:

| Variante | Formato | Tamano | Navegador | Licencia |
|---|---|---|---|---|
| alias3-micro-1026-ONNX (este) | ONNX transformers.js | 2,73-16,83 GB | Sí (q4, q4f16, bnb4) | Apache 2.0 |
| alias3-micro-1026-ONNX-genai | ONNX GenAI | no disponible | no disponible | Apache 2.0 |
| alias3-micro-1026-ONNX-decode-only | ONNX decode-only | no disponible | no disponible | Apache 2.0 |
| alias3-micro-1026-MLC-q4f32_1 / q4f16_1 | MLC | no disponible | no disponible | Apache 2.0 |
| alias3-micro-1026-LiteRT | LiteRT.js | no disponible | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- El modelo base se etiqueta como "research preview"; no está pensado para producción sin validación adicional.
- La cabeza de severidad (`head_score.bin`) es una prueba de concepto ajustada sobre 30 casos sintéticos; usarla como puntuador de severidad requiere un conjunto mayor e independientemente etiquetado.
- El conjunto de prueba de decisión (50-65 preguntas por modo) solo detecta pérdidas grandes de precisión, por lo que la paridad observada no garantiza equivalencia fina.
- Las decisiones individuales cambian entre el 2,3% y el 26,7% según la cuantización, lo que puede alterar resultados en flujos sensibles.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base y citar el paper arXiv:2610.16550.
- El tamaño del repositorio (50,7 GB) y los ficheros con datos externos en chunks de hasta 2 GB requieren gestión cuidadosa de descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper del esquema System 1 / System 2: https://arxiv.org/abs/2610.16550
- Pointer networks (Vinyals et al., 2015): https://arxiv.org/abs/1506.03134
- Documentación de TypeSafe AI: https://docs.typesafe.ai
- Variante ONNX GenAI: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Variante ONNX decode-only: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Variante MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Variante MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Variante LiteRT.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT
