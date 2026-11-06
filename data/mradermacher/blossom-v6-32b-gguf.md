# mradermacher/Blossom-V6-32B-GGUF

## Resumen

Blossom-V6-32B es un modelo de lenguaje conversacional de 32.700 millones de parámetros desarrollado originalmente por Azure99 y distribuido en formato GGUF por mradermacher. Se trata de un modelo afinado (fine-tuned) sobre una base de 32B no especificada en la información disponible, entrenado con dos conjuntos de datos de instrucciones propios (blossom-v6-sft-stage1 y blossom-v6-sft-stage2) y orientado a diálogo multilingüe en chino e inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha concreta reside en que se trata de la versión cuantizada en GGUF del modelo original, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye 11 variantes de cuantización estática (desde Q2_K hasta Q8_0), con tamaños que van de 12,4 GB a 34,9 GB, lo que facilita el despliegue en GPUs consumer de gama alta o en configuraciones con memoria unificada.

El modelo está etiquetado como compatible con endpoints y conversacional, con soporte para chino e inglés. No se dispone de información sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento más allá de los nombres de los datasets SFT. El repositorio tiene un tamaño total de 224 GB, lo que refleja la inclusión de todas las variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 32B, detalles no especificados) |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors no se distribuye en este repo |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por el número de parámetros (32.763.876.352) y la nomenclatura habitual de la familia Blossom, se trata de un transformer decoder-only de aproximadamente 32B parámetros, pero no se confirma en la información disponible si emplea atención estándar, GQA, sliding window u otras variantes. Tampoco se especifica la longitud de contexto nativa ni el tokenizador.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) en dos etapas, según los nombres de los datasets referenciados: `Azure99/blossom-v6-sft-stage1` y `Azure99/blossom-v6-sft-stage2`. No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o preferencia. El modelo base sobre el que se afinó no se identifica en la model card. La versión aquí descrita es una cuantización estática realizada por mradermacher con la herramienta de conversión a GGUF, sin cuantización por imatrix (las variantes i1 están en un repositorio separado).

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento e instrucciones generales, derivado del fine-tuning SFT en dos etapas.
- Soporte de conversación estructurada (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia tipo TGI o similares.
- Capacidades multilingües limitadas a chino e inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en chino e inglés: el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para chatbots de atención al cliente en mercados asiáticos y angloparlantes. La licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones de atribución adicionales.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M (20,0 GB) y Q5_K_M (23,4 GB), puede ejecutarse en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o en Macs con memoria unificada de 32 GB o más mediante llama.cpp.
- Prototipado e investigación: la disponibilidad de 11 cuantizaciones permite comparar el impacto de la precisión en la calidad de las respuestas, útil para estudios de eficiencia y evaluación de cuantización.
- Generación de contenido en chino: redacción de textos, resúmenes y respuestas en chino con un modelo de 32B, superando en capacidad a modelos más pequeños en ese idioma.
- Fine-tuning posterior: al estar bajo Apache 2.0 y derivar de un modelo base identificable (`Azure99/Blossom-V6-32B`), puede servir como punto de partida para ajustes específicos de dominio, aunque se recomienda partir del modelo en safetensors para entrenamiento.
- Inferencia local en entornos sin conexión: el formato GGUF permite ejecutar el modelo en estaciones de trabajo aisladas con llama.cpp u Ollama, sin dependencia de servicios en la nube.
- Evaluación comparativa de cuantizaciones: el repositorio incluye todas las variantes, lo que facilita benchmarks internos de calidad frente a tamaño para elegir el equilibrio adecuado en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~12,4 GB
  - Q3_K_M: ~16,0 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_M: ~20,0 GB (recomendada por el autor como "fast, recommended")
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPUs recomendadas:
  - Q4_K_M / Q5_K_M: RTX 3090, RTX 4090 (24 GB VRAM) o superiores.
  - Q6_K: A6000 (48 GB), RTX 6000 Ada, o GPUs con 32 GB+.
  - Q8_0: A100 40 GB, H100, o configuraciones multi-GPU.
  - Q2_K / Q3_K: GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super) con margen ajustado.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K (calidad reducida).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, vLLM o TGI (no incluido en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Blossom-V6-32B (este) | 32,7B | no disponible | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Modelo base Azure99/Blossom-V6-32B | 32,7B | no disponible | Apache 2.0 | safetensors | Hugging Face (Azure99) |
| Alternativas de 32B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (32B conversacionales en chino/inglés) en la documentación proporcionada. Se recomienda consultar el repositorio del modelo base para obtener detalles sobre la arquitectura y posibles comparaciones publicadas por el autor original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en chino e inglés, puede presentar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente. La longitud de contexto no se especifica, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo base original y los datasets de entrenamiento pueden tener sus propias condiciones que conviene verificar.
- Caveats para producción: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores. La cuantización estática (no imatrix) puede ser inferior en calidad a las variantes i1 del repositorio hermano. No hay benchmarks publicados que respalden el rendimiento en tareas específicas.
- El repositorio tiene 224 GB, lo que implica descargas parciales; conviene seleccionar únicamente la cuantización necesaria.
- No se documenta soporte de tool calling ni agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Blossom-V6-32B-GGUF
- Modelo base original: https://huggingface.co/Azure99/Blossom-V6-32B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Blossom-V6-32B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Blossom-V6-32B-GGUF
- Dataset SFT etapa 1: https://huggingface.co/datasets/Azure99/blossom-v6-sft-stage1
- Dataset SFT etapa 2: https://huggingface.co/datasets/Azure99/blossom-v6-sft-stage2
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
