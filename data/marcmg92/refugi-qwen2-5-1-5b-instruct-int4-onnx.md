# MarcMG92/refugi-qwen2.5-1.5b-instruct-int4-onnx

## Resumen

`MarcMG92/refugi-qwen2.5-1.5b-instruct-int4-onnx` es una conversión a formato ONNX con cuantización INT4 del modelo Qwen2.5-1.5B-Instruct, publicada por el usuario MarcMG92 bajo licencia Apache 2.0. Se trata, por tanto, de una redistribución optimizada para inferencia en entornos ONNX Runtime del conocido modelo instruct de Alibaba Qwen, no de un modelo entrenado desde cero. El prefijo "refugi" en el nombre sugiere un uso o ajuste interno del autor, pero la model card no documenta ningún proceso de fine-tuning ni de modificación de pesos.

La relevancia de esta ficha es limitada pero concreta: ofrece una vía para desplegar un modelo de 1.500 millones de parámetros en CPU o en hardware modesto mediante ONNX Runtime con pesos de 4 bits, lo que reduce el peso del repositorio a aproximadamente 1 GB. Es un artefacto de despliegue, no una contribución algorítmica, y como tal debe evaluarse por su utilidad operativa más que por sus capacidades intrínsecas.

La información publicada por el autor es mínima: la model card solo declara la licencia Apache 2.0 y no incluye detalles sobre el proceso de cuantización, la calibración, los idiomas soportados ni resultados de evaluación. Cualquier dato sobre arquitectura o entrenamiento debe atribuirse al modelo base Qwen2.5-1.5B-Instruct, no a esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); empaquetada en ONNX |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens |
| Tipos de cuantizacion | INT4 (según el nombre del repositorio); no se detalla el esquema exacto (GPTQ, AWQ, RTN u otro) |
| Idiomas soportados | no disponible en la model card; el modelo base es multilingüe (chino, inglés y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por causalidad estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base fue entrenado por el equipo Qwen de Alibaba sobre un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas, aunque los detalles exactos de esa alineación corresponden a la documentación oficial de Qwen y no se reproducen aquí.

Esta publicación concreta no documenta ningún entrenamiento adicional. El autor no especifica el método de cuantización a INT4, ni el dataset de calibración, ni si se aplicaron técnicas como SmoothQuant o cuantización por grupos. Tampoco se indica la versión de ONNX Runtime ni la herramienta de exportación utilizada (por ejemplo, `optimum` de Hugging Face). Sin esa información, la reproducibilidad del proceso es nula y la calidad de la cuantización no puede verificarse a priori.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1.500 millones de parámetros.
- Generación de código y matemáticas de complejidad baja a media, con fiabilidad inferior a la de modelos de mayor tamaño.
- Soporte multilingüe (chino, inglés y otros idiomas presentes en el corpus de Qwen), aunque la model card no lo declara explícitamente.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido en esta conversión.
- No se documenta soporte de visión, audio ni multimodalidad.
- Compatible con inferencia mediante ONNX Runtime, potencialmente en CPU.

## Casos de uso

- Despliegue en CPU sin GPU: la cuantización INT4 y el formato ONNX permiten ejecutar el modelo en servidores sin acelerador, con un peso de aproximadamente 1 GB, adecuado para entornos de desarrollo y pruebas.
- Asistentes conversacionales ligeros en el borde: aplicaciones de escritorio o dispositivos con recursos limitados que necesiten un chatbot de instrucciones sin depender de la nube.
- Prototipado rápido de pipelines ONNX: útil para validar flujos de inferencia con ONNX Runtime antes de migrar a un modelo mayor o a otro backend.
- Clasificación y extracción de texto: tareas de etiquetado, resumen corto o extracción de entidades en documentos de baja complejidad donde el coste computacional es prioritario.
- Generación de código asistida en entornos locales: autocompletado o sugerencias en editores con hardware modesto, aceptando una calidad inferior a la de modelos de 7B o superiores.
- Filtrado y preprocesado en pipelines de datos: generación de metadatos, reformateo de texto o normalización de campos en lotes, donde la latencia y el coste importan más que la precisión fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones del modelo cuantizado ni comparaciones con el modelo base, y no se dispone de datos sobre la degradación introducida por la cuantización INT4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos INT4 de aproximadamente 1 GB, la huella en memoria es reducida, pero los requisitos reales dependen de la longitud de contexto y del backend de ONNX Runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es ejecutable en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon mediante Core ML u ONNX Runtime.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (backend nativo del artefacto); también podría utilizarse a través de `onnxruntime-genai` o de servidores compatibles con ONNX, aunque no se documenta ninguna integración concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarcMG92/refugi-qwen2.5-1.5b-instruct-int4-onnx | 1.5B | no disponible (base: 32.768) | ONNX INT4 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | safetensors | Apache 2.0 | Hugging Face, oficial |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1.5B | 32.768 | GGUF (varias cuantizaciones) | Apache 2.0 | Hugging Face, oficial |
| Qwen/Qwen2.5-1.5B-Instruct-AWQ | 1.5B | 32.768 | safetensors AWQ | Apache 2.0 | Hugging Face, oficial |

La diferencia principal frente a las alternativas oficiales es el formato: esta conversión apunta a ONNX Runtime, mientras que las versiones de Qwen cubren safetensors, GGUF (para llama.cpp y Ollama) y AWQ (para vLLM). Al no haber benchmarks publicados, no es posible comparar el rendimiento de esta cuantización con el de las versiones oficiales.

## Limitaciones y advertencias

- La model card es prácticamente vacía: no documenta el método de cuantización, la calibración, los idiomas ni las evaluaciones, lo que impide verificar la calidad del artefacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.
- Al derivar de Qwen2.5-1.5B-Instruct, hereda sus limitaciones: riesgo de alucinación, sesgos presentes en los datos de entrenamiento y capacidad limitada en razonamiento complejo, matemáticas avanzadas y código de producción.
- La cuantización INT4 puede degradar la calidad respecto al modelo en precisión completa; sin benchmarks publicados no es posible cuantificar esa pérdida.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del despliegue recae en el usuario.
- No se especifica la versión de ONNX Runtime ni el opset utilizado, lo que puede provocar incompatibilidades con determinadas versiones del runtime.
- El nombre "refugi" sugiere un posible ajuste o uso interno no documentado; no hay evidencia de que los pesos hayan sido modificados respecto al modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MarcMG92/refugi-qwen2.5-1.5b-instruct-int4-onnx
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Optimum de Hugging Face (exportación a ONNX): https://huggingface.co/docs/optimum/exporters/onnx/overview
