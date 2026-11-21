# mradermacher/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF

## Resumen

AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct, publicado por el usuario mradermacher en Hugging Face. El modelo base es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado originalmente por Alibaba Cloud, orientado a tareas de generación de texto con instrucciones. El ajuste fino, atribuido a prajwal90, sugiere una especialización en el dominio de la calidad del aire, aunque la model card no detalla la composición del dataset ni el procedimiento de entrenamiento.

El repositorio no aporta información sobre licencia, idiomas soportados, pipeline ni resultados de evaluación. La única documentación disponible es una serie de metadatos internos del proceso de cuantización (versión de cuantizador, tipo de conversión y lista de cuantizaciones generadas). Esto limita considerablemente la evaluación rigurosa del modelo, pero el formato GGUF y el tamaño compacto lo hacen relevante para despliegues en CPU, dispositivos de borde y entornos con recursos limitados donde se requiera un asistente especializado en calidad del aire.

La relevancia actual radica en la posibilidad de ejecutar un modelo de lenguaje especializado de 1.5B parámetros en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde Q2_K hasta Q8_0 y F16. No obstante, la ausencia de datos sobre el ajuste fino, la licencia y el rendimiento real obliga a tratar esta ficha como una referencia técnica preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (aproximado, según modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba Cloud con un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias humanas, aunque los detalles exactos del pipeline de alineación del modelo base no se reproducen en esta ficha.

El ajuste fino AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct, del que no se documenta la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO, se desconoce en detalle. El repositorio de mradermacher se limita a generar cuantizaciones estáticas del modelo original mediante un proceso de conversión a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto condicionada por instrucciones, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas, con especialización presumible en el dominio de calidad del aire (no verificada).
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad limitada por el tamaño de 1.5B parámetros).
- Soporte de tool calling y function calling: no confirmado en esta ficha; el modelo base Qwen2.5-Instruct lo soporta, pero no se verifica en el ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de consulta sobre calidad del aire en dispositivos de borde: el modelo, cuantizado en Q4_K_M o Q5_K_M, puede ejecutarse en CPU o en GPUs de consumo para responder preguntas sobre índices de calidad del aire, contaminantes y recomendaciones, siempre que el ajuste fino haya cubierto ese dominio.
- Clasificación y resumen de informes medioambientales: con 1.5B parámetros y cuantización Q8_0, puede procesar textos de informes y generar resúmenes estructurados en entornos con recursos limitados.
- Integración en aplicaciones móviles o IoT: el formato GGUF y las cuantizaciones Q2_K a Q4_K_S permiten desplegar el modelo en dispositivos con poca memoria (menos de 2 GB en Q2_K), útil para estaciones de monitorización con capacidad de cómputo reducida.
- Generación de respuestas en chatbots de dominio específico: el modelo puede gestionar conversaciones multi-turno si el contexto del modelo base (hasta 32.768 tokens, no confirmado en el ajuste) se mantiene, aunque la calidad en dominios ajenos al ajuste fino es incierta.
- Prototipado rápido con llama.cpp u Ollama: las cuantizaciones estáticas permiten probar el modelo en local sin infraestructura GPU, adecuado para validar hipótesis sobre el ajuste fino antes de invertir en despliegues mayores.
- Filtrado y extracción de entidades en textos sobre contaminación: el modelo puede emplearse para tareas de extracción de información (contaminantes, niveles, ubicaciones) en pipelines de procesamiento de datos medioambientales, sujeto a validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada para 1.5B parámetros):
  - Q2_K: ~1,0-1,3 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,3-1,6 GB
  - Q4_K_S / Q4_K_M / IQ4_XS: ~1,6-2,0 GB
  - Q5_K_S / Q5_K_M: ~2,0-2,3 GB
  - Q6_K: ~2,3-2,6 GB
  - Q8_0: ~2,8-3,2 GB
  - F16: ~3,0-3,5 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4-Q8; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles, aunque el modelo es pequeño y no aprovecha GPUs de gama alta.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer con 4 GB o más de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF | 1.5B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Hugging Face (Qwen) |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (Meta) |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (HuggingFaceTB) |

La comparativa se basa en el modelo base Qwen2.5-1.5B-Instruct y alternativas de tamaño similar; no se dispone de datos de rendimiento del ajuste fino AirQuality-SLM para comparar benchmarks.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (Qwen2.5-1.5B-Instruct, Apache 2.0) y del ajuste fino antes de usarlo en producción.
- Idiomas no disponibles: se desconoce si el ajuste fino conserva el multilingüismo del modelo base o se ha restringido a un idioma concreto.
- Riesgo de alucinación: como todo modelo de 1.5B parámetros, la precisión factual es limitada, especialmente en dominios técnicos como la calidad del aire, donde datos numéricos o normativos incorrectos pueden tener consecuencias.
- Sesgos conocidos: no documentados; el modelo base Qwen2.5 puede presentar sesgos de entrenamiento no evaluados en este ajuste fino.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva del ajuste fino; el modelo base soporta 32.768 tokens, pero el ajuste podría haberla reducido.
- Especialización no verificada: no hay evidencia publicada de que el ajuste fino mejore el rendimiento en calidad del aire frente al modelo base.
- Sin benchmarks ni evaluaciones: no se puede estimar su calidad relativa frente a alternativas.
- Repositorio con 0 descargas y 0 likes: escasa validación comunitaria; el modelo no ha sido probado de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF
- Modelo base del ajuste fino: https://huggingface.co/prajwal90/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
