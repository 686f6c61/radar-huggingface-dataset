# amd/Hunyuan-7B-Instruct_rai_1.9.0_npu

## Resumen

Hunyuan-7B-Instruct_rai_1.9.0_npu es una distribución del modelo Tencent Hunyuan-7B-Instruct preparada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI, mediante el stack de inferencia RyzenAI 1.9.0 y pesos en formato ONNX cuantizados con Quark. No se trata de un modelo nuevo: es una conversión y empaquetado de un modelo denso de 7 000 millones de parámetros de la familia Hunyuan v1 (arquitectura `hunyuan_v1_dense`) orientada a inferencia local en hardware AMD con aceleración NPU, no GPU.

Su relevancia es práctica más que algorítmica: permite ejecutar un modelo conversacional de 7B en PC con procesadores AMD Ryzen AI (serie 300 y posteriores) sin depender de una GPU dedicada, aprovechando el motor XDNA/NPU a través del runtime de AMD. El repositorio ocupa 9,3 GB, lo que refleja los pesos ONNX empaquetados junto con los artefactos de cuantización.

La ficha se limita a los datos publicados en la model card y en los metadatos del repositorio de Hugging Face; los detalles de entrenamiento del modelo base no están incluidos en la información disponible y se marcan como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Hunyuan v1 (`hunyuan_v1_dense`) |
| Parámetros totales | 7 000 millones (7B, según el nombre del modelo) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | cuantización Quark para NPU (niveles concretos: no disponible) |
| Idiomas soportados | inglés (`en` según los tags del repositorio) |
| Licencia | `other` (licencia personalizada del modelo base; requiere aceptar condiciones) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Hunyuan v1 de Tencent, con arquitectura transformer densa identificada en los metadatos como `hunyuan_v1_dense`. El repositorio de AMD no documenta el proceso de preentrenamiento, el volumen de tokens, la composición del corpus ni las etapas de alineación (SFT, RLHF o DPO) del modelo original; esa información debe consultarse en la model card oficial de Tencent Hunyuan-7B-Instruct, no incluida aquí.

La contribución técnica de esta distribución es el pipeline de despliegue: conversión de los pesos a ONNX y cuantización con Quark para su ejecución en la NPU integrada en los procesadores Ryzen AI, empaquetado con el runtime RyzenAI 1.9.0. Esto implica que el grafo computacional y los operadores están adaptados al backend de AMD, y que el rendimiento y la fidelidad numérica dependen de esa ruta de ejecución en lugar de un runtime estándar de GPU.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct (pares instrucción-respuesta).
- Razonamiento general y respuesta a preguntas sobre conocimiento factual, en la medida en que el modelo base lo soporte.
- Generación de código y tareas de matemáticas básicas a intermedias, heredadas del modelo base de 7B.
- Ejecución local en NPU de AMD Ryzen AI mediante el runtime RyzenAI 1.9.0, sin GPU dedicada.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es exclusivamente `text-generation`.
- Modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en portátiles y equipos de sobremesa con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando la CPU y la GPU para otras tareas, lo que encaja en aplicaciones de escritorio con asistente embebido.
- Prototipado de aplicaciones de IA generativa en hardware AMD sin GPU: útil para equipos de desarrollo que quieren validar flujos de chat y prompts sobre la plataforma objetivo antes de escalar a servidores.
- Procesamiento de texto por lotes en local con requisitos de privacidad: al ejecutarse en el propio dispositivo, permite resumir o clasificar documentos sin enviar datos a la nube.
- Evaluación comparativa de backends de inferencia: sirve como referencia para medir latencia y throughput de la NPU Ryzen AI frente a rutas GGUF/llama.cpp en CPU o GPU.
- Generación de borradores de código y documentación técnica en un IDE de escritorio con aceleración NPU, para tareas de autocompletado y explicación de fragmentos.
- Integración en demos y entornos de investigación sobre RyzenAI 1.9.0: permite reproducir el pipeline oficial de AMD con pesos ONNX y validar la compatibilidad de operadores del modelo en la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de AMD no incluye métricas de MMLU, HumanEval, GSM8K ni cifras de latencia o throughput para esta conversión.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU XDNA (la model card está etiquetada como `ryzenai` y `npu`); no está pensado para GPU NVIDIA ni para CPU genérica.
- VRAM: no aplica en el sentido tradicional; el modelo consume memoria del sistema y memoria dedicada de la NPU. El repositorio pesa 9,3 GB, por lo que se requiere al menos esa cantidad de almacenamiento y un volumen de memoria del sistema acorde.
- GPU recomendadas: no aplica; la ruta de ejecución es la NPU de Ryzen AI.
- Compatibilidad con GPU de consumo: no confirmada; los pesos ONNX están cuantizados para el backend de AMD y no se garantiza su uso en otras plataformas.
- Opciones de despliegue: runtime RyzenAI 1.9.0 con pesos ONNX y cuantización Quark. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hunyuan-7B-Instruct_rai_1.9.0_npu (este) | 7B denso | no disponible | ONNX + Quark, NPU Ryzen AI | `other` (gated) | Hugging Face, acceso restringido |
| Hunyuan-7B-Instruct (original, Tencent) | 7B denso | no disponible en esta ficha | safetensors, GPU/CPU | licencia Hunyuan (consultar) | Hugging Face |
| Qwen2.5-7B-Instruct | 7B denso | 32 768 tokens (según su model card) | safetensors, GGUF, múltiples runtimes | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B denso | 131 072 tokens (según su model card) | safetensors, GGUF, múltiples runtimes | Llama 3.1 Community License | Hugging Face (gated) |

La comparación relevante no es de calidad bruta sino de plataforma: este paquete es la única de las opciones listada que se ejecuta de forma nativa en la NPU de Ryzen AI. Frente a Qwen2.5-7B o Llama-3.1-8B, ofrece un ecosistema de despliegue mucho más restringido y solo en inglés, a cambio de aceleración en hardware AMD sin GPU.

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; no hay evidencia de soporte fiable de castellano u otros idiomas en esta conversión.
- Licencia `other`: es necesario revisar y aceptar los términos del modelo base Hunyuan antes de cualquier uso, incluido el comercial; el acceso al repositorio está restringido (gated).
- Dependencia de plataforma: los pesos ONNX cuantizados con Quark están atados al runtime RyzenAI 1.9.0 y a la NPU de AMD; no son portables a GPU NVIDIA, Apple Silicon ni CPU genérica sin reconversión.
- Riesgo de alucinación: inherente a un modelo de 7B; no se han publicado evaluaciones de fidelidad para esta conversión.
- Fidelidad numérica: la cuantización para NPU puede degradar ligeramente la calidad respecto a los pesos originales en FP16/BF16; no se documenta la magnitud de esa pérdida.
- Contexto: se desconoce la longitud máxima soportada en esta ruta de ejecución; conviene validarla empíricamente antes de usarla en producción.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Sesgos: no documentados en la información disponible; deben asumirse los del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Hunyuan-7B-Instruct_rai_1.9.0_npu
- Modelo base (referencia): https://huggingface.co/tencent/Hunyuan-7B-Instruct
- Documentación de Ryzen AI (AMD): no disponible en la información proporcionada
- Paper o blog técnico de Hunyuan v1: no disponible en la información proporcionada
