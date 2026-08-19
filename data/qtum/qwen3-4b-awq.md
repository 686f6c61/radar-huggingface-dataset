# qtum/Qwen3-4B-AWQ

## Resumen

Qwen3-4B-AWQ es una cuantización de 4 bits (W4A16) del modelo Qwen3-4B, desarrollada por el usuario qtum y publicada en HuggingFace. Se trata de una versión optimizada para inferencia eficiente, producida con la herramienta llm-compressor del proyecto vLLM y empaquetada en el formato compressed-tensors, que permite su uso directo con motores de inferencia como vLLM o SGLang sin configuración adicional.

El modelo base, Qwen3-4B, es un transformer denso de 4.411 millones de parámetros desarrollado por Alibaba, con licencia Apache 2.0 y soporte para inglés y chino. Esta cuantización reduce el tamaño del modelo a aproximadamente una cuarta parte del peso original en bf16 (3,4 GB en lugar de ~8,8 GB), lo que permite ejecutarlo en hardware más modesto, como GPUs de consumo con alrededor de 2,5 GB de VRAM, manteniendo una calidad cercana a la del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para despliegues en producción donde el uso de memoria y el throughput son críticos, especialmente en escenarios de razonamiento privado o automatización de operaciones, tal como señala la página de dev.co. Al ser una cuantización oficialmente generada con herramientas estándar, se integra sin fricción en pipelines existentes basados en vLLM o SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ (W4A16) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Qwen3-4B-AWQ no es un modelo entrenado desde cero, sino una cuantización del checkpoint original Qwen/Qwen3-4B. El proceso de cuantización emplea el método AWQ (Activation-aware Weight Quantization) con precisión W4A16: los pesos se reducen a 4 bits mientras que las activaciones se mantienen en 16 bits. Esta técnica preserva la importancia de las canales más relevantes para la activación, minimizando la degradación de calidad frente a cuantizaciones naive.

La cuantización se realizó con la librería llm-compressor del ecosistema vLLM, y el resultado se almacena en el formato compressed-tensors, que declara el esquema de cuantización en el archivo config.json. Esto permite que motores compatibles (vLLM, SGLang) detecten automáticamente la configuración sin necesidad de flags adicionales. El modelo base Qwen3-4B, por su parte, fue entrenado por Alibaba con una arquitectura transformer estándar, aunque los detalles específicos del dataset de entrenamiento (número de tokens, composición, técnicas de alineación como RLHF o DPO) no se detallan en la información proporcionada para esta cuantización.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-4B, que incluye modos de pensamiento (thinking) y no pensamiento (non-thinking), permitiendo alternar entre razonamiento profundo y respuestas rápidas.
- Soporte multilingüe: entrenado principalmente en inglés y chino, aunque puede generalizar a otros idiomas con menor calidad.
- Eficiencia en inferencia: gracias a la cuantización AWQ, ofrece mayor throughput y menor uso de memoria en comparación con el modelo en bf16, manteniendo una calidad cercana al original.
- Compatibilidad con motores de producción: diseñado para funcionar con vLLM y SGLang, que son estándares en despliegues de LLM a gran escala.
- No se confirma en la información disponible si soporta tool calling o function calling, aunque el modelo base Qwen3-4B sí lo incluye; esta capacidad se hereda, pero no se documenta explícitamente en la model card de la cuantización.

## Casos de uso

- Inferencia en dispositivos con recursos limitados: con aproximadamente 2,5 GB de VRAM, puede ejecutarse en GPUs de consumo como RTX 3060 o RTX 4060, permitiendo aplicaciones de IA generativa en entornos edge o en estaciones de trabajo sin GPUs profesionales.
- Automatización de operaciones (Ops AI): según dev.co, el modelo está orientado a razonamiento privado para automatización de operaciones, donde la baja latencia y el control sobre los datos son críticos. Puede desplegarse en infraestructura propia para tareas de diagnóstico, generación de scripts o análisis de logs.
- Asistentes conversacionales multilingües: al soportar inglés y chino, puede utilizarse para construir chatbots o asistentes en estos idiomas, con la ventaja de un menor coste de inferencia gracias a la cuantización.
- Generación de código y documentación: aunque no se menciona explícitamente, el modelo base Qwen3-4B tiene capacidades de generación de código; esta cuantización puede integrarse en entornos de desarrollo como autocompletado o generación de documentación, siempre que se valide la calidad en cada caso.
- Prototipado rápido y evaluación: al ser un drop-in replacement del modelo base en vLLM/SGLang, permite probar aplicaciones con un coste de memoria reducido antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su integración en productos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta cuantización. Se recomienda consultar los benchmarks del modelo base Qwen3-4B y realizar pruebas específicas en el caso de uso concreto, ya que la cuantización puede introducir pequeñas variaciones en el rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para inferencia con cuantización AWQ, según dev.co. Esto permite ejecución en GPUs con 4 GB o más de VRAM.
- GPUs recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También es viable en GPUs profesionales como A10 o L4, aunque no es necesario.
- Opciones de despliegue: compatible con vLLM y SGLang mediante el formato compressed-tensors. También puede usarse con otros motores que soporten este formato, aunque no se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos. En general, la cuantización AWQ reduce el uso de memoria y aumenta el throughput en comparación con bf16, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4.411 M | bf16 | No disponible | Apache 2.0 | safetensors |
| Qwen3-4B-AWQ (qtum) | 4.411 M | AWQ W4A16 | No disponible | Apache 2.0 | compressed-tensors |
| Qwen3-4B-GGUF (ejemplo) | 4.411 M | GGUF Q4_K_M | No disponible | Apache 2.0 | GGUF |

La comparativa con otras cuantizaciones (GGUF, GPTQ) no está disponible en la información proporcionada. Esta versión AWQ se distingue por su integración nativa con vLLM y SGLang, mientras que las versiones GGUF suelen orientarse a llama.cpp y Ollama. El rendimiento relativo entre formatos depende del hardware y del caso de uso.

## Limitaciones y advertencias

- Degradación de calidad: la cuantización a 4 bits puede introducir pequeñas pérdidas de precisión en tareas complejas, aunque AWQ minimiza este efecto. Se recomienda validar en el dominio de aplicación.
- Sesgos y alucinaciones: al ser una copia del modelo base, hereda los sesgos y riesgos de alucinación de Qwen3-4B. No se han realizado ajustes adicionales para mitigarlos.
- Idiomas limitados: el modelo está entrenado principalmente en inglés y chino; su rendimiento en otros idiomas puede ser inferior.
- Longitud de contexto no documentada: no se especifica en la información disponible, aunque el modelo base Qwen3-4B soporta 32K tokens. Para usos con contextos largos, es necesario verificar el comportamiento real.
- Dependencia de motores específicos: el formato compressed-tensors requiere vLLM o SGLang; no es compatible directamente con otros frameworks sin conversión previa.
- Sin garantías de producción: al ser una cuantización comunitaria (autor qtum), no existe un soporte oficial de Alibaba. Se recomienda realizar pruebas exhaustivas antes de desplegar en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtum/Qwen3-4B-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Página de dev.co sobre Qwen3-4B-AWQ: https://dev.co/ai/llms/qwen3-4b-awq
- Página de llm.co sobre Qwen3-4B-AWQ: https://llm.co/llms/qwen3-4b-awq
