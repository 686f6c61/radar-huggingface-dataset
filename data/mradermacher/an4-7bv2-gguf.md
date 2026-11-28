# mradermacher/An4-7Bv2-GGUF

## Resumen

An4-7Bv2-GGUF es la colección de cuantizaciones en formato GGUF del modelo An4-7Bv2, publicada por el usuario mradermacher. El modelo original, alojado en el repositorio Smuggling1710/An4-7Bv2, es un modelo de lenguaje de 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) afinado mediante SFT (supervised fine-tuning) sobre una base de la familia Mistral, según indican las etiquetas del repositorio (mistral, unsloth, trl, sft). La licencia declarada es Apache 2.0.

Este repositorio no contiene el modelo entrenado por su autor original, sino las versiones estáticas cuantizadas (quants) generadas por mradermacher para facilitar su despliegue en hardware con recursos limitados. La colección cubre un rango amplio de niveles de cuantización, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutar el modelo tanto en GPUs de consumo como en entornos de servidor. Existe además un repositorio hermano con cuantizaciones ponderadas/imatrix (An4-7Bv2-i1-GGUF) para quienes priorizan la calidad sobre el tamaño.

La relevancia de esta ficha radica en que el repositorio es la vía práctica de acceso al modelo para inferencia local: el modelo original en transformers requiere alrededor de 14,5 GB en fp16, mientras que las versiones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) permiten su uso en GPUs consumer. El modelo está orientado a generación de texto en inglés y su model card original no documenta detalles de entrenamiento, benchmarks ni arquitectura interna más allá de la base Mistral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de la familia Mistral, segun etiquetas del repositorio; detalles no disponibles) |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base An4-7Bv2 es, según las etiquetas del repositorio, un fine-tuning supervisado (SFT) de un modelo de la familia Mistral, realizado con las herramientas Unsloth y TRL. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura Mistral subyacente.

Las cuantizaciones de este repositorio se generaron con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). Se trata de cuantizaciones estáticas, es decir, sin calibración con imatrix; para versiones ponderadas con imatrix el autor remite al repositorio An4-7Bv2-i1-GGUF. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relación calidad/tamaño que las Q de tamaño similar, según las notas del propio autor.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Mistral afinado con SFT.
- Razonamiento y respuesta conversacional multi-turno (presumible por el pipeline de SFT, aunque no documentado explícitamente).
- Compatibilidad con text-generation-inference (etiqueta del repositorio), lo que habilita despliegue como endpoint compatible con la API de OpenAI.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo: cargar el quant Q4_K_M (4,5 GB) con llama.cpp u Ollama para disponer de un modelo de 7 B en una GPU consumer de 8 GB de VRAM, con margen para el contexto.
- Prototipado rápido de aplicaciones de chat: desplegar el Q5_K_M (5,2 GB) o Q6_K (6,0 GB) con text-generation-inference o llama.cpp server para validar flujos conversacionales antes de invertir en infraestructura mayor.
- Generación de texto en pipelines por lotes: usar el Q8_0 (7,8 GB) en una GPU de 12-16 GB para tareas de redacción, resumen o clasificación generativa en inglés con la máxima calidad de cuantización práctica.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 niveles de quant, el repositorio sirve para medir el impacto de la cuantización en perplejidad y calidad de salida sobre una misma tarea, siguiendo las gráficas de referencia del autor (ikawrakow, Artefact2).
- Despliegue en entornos con VRAM muy limitada: el Q2_K (2,8 GB) o Q3_K_S (3,3 GB) permiten ejecutar el modelo en GPUs de 4 GB o en CPU con RAM modesta, a costa de una pérdida de calidad notable.
- Base para fine-tuning ligero o experimentación: al estar bajo Apache 2.0 y con pesos en safetensors en el repositorio original, puede servir como punto de partida para adaptaciones con LoRA/QLoRA en inglés.
- Integración en asistentes de código o documentación técnica en inglés: el modelo, al derivar de Mistral, mantiene competencia razonable en generación de texto técnico, aunque no se han publicado benchmarks que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y el repositorio del modelo base no aporta datos verificables en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~3,5-4 GB.
  - Q3_K_M: ~4,5-5 GB.
  - Q4_K_M: ~5,5-6 GB (recomendado por el autor como "fast").
  - Q5_K_M: ~6,5-7 GB.
  - Q6_K: ~7,5-8 GB.
  - Q8_0: ~9-10 GB.
  - f16: ~15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para los quants mayores; A100/H100 solo si se busca throughput alto con f16 o Q8_0.
- Cabe en GPU consumer: sí, desde una GTX 1650 4 GB (con Q2_K) hasta una RTX 4090 (con f16). Los quants Q4_K_M y Q5_K_M son los más equilibrados para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (etiqueta del repo), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del quant. Como referencia cualitativa, el autor marca Q4_K_S/Q4_K_M y Q8_0 como "fast".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| An4-7Bv2-GGUF (este) | 7,24 B | No disponible | Apache 2.0 | GGUF | Fine-tuning SFT de base Mistral; solo ingles; sin benchmarks publicados |
| Mistral-7B-v0.1 / v0.2 | ~7,24 B | 8k / 32k (segun version) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia; contexto y benchmarks ampliamente documentados |
| Mistral-7B-Instruct-v0.2 | ~7,24 B | 32k | Apache 2.0 | safetensors, GGUF | Variante instruct oficial, con benchmarks publicados |
| Zephyr-7B-beta | ~7,24 B | 32k | MIT | safetensors, GGUF | Fine-tuning con DPO sobre Mistral; benchmarks publicados (MT-Bench, etc.) |

La comparación con Mistral-7B-Instruct y Zephyr-7B-beta es pertinente por tamaño y linaje, pero conviene señalar que An4-7Bv2 carece de documentación pública de entrenamiento y evaluación, por lo que no es posible afirmar equivalencia de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad (MMLU, HumanEval, GSM8K, MT-Bench) para el modelo base ni para las cuantizaciones.
- Documentación de entrenamiento inexistente: se desconoce el dataset de SFT, el número de tokens y si hubo alineación posterior; el comportamiento en producción es, por tanto, impredecible.
- Solo inglés declarado: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 7 B afinados con SFT sin etapas de alineación documentadas; no hay datos que permitan cuantificarlo.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento no es posible evaluar sesgos de género, raza o ideológicos.
- Contexto desconocido: no se declara la longitud de ventana; asumir 4k-8k por defecto si no se verifica empíricamente.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la perplejidad (el propio autor marca Q3_K_M como "lower quality"); para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Mistral conviene verificar que el modelo base cumple efectivamente con dicha licencia (las etiquetas del repo lo indican, pero no hay verificación independiente).
- Repositorio con muy poca tracción: 97 descargas y 0 likes en el momento de la consulta; no hay comunidad que valide su comportamiento.
- Fecha de actualización del repositorio (2026-11-28) posterior a la de creación (2024-12-31): posible re-subida o mantenimiento; conviene revisar el historial de commits antes de fijar una versión.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/An4-7Bv2-GGUF
- Modelo base: https://huggingface.co/Smuggling1710/An4-7Bv2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/An4-7Bv2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#An4-7Bv2-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
