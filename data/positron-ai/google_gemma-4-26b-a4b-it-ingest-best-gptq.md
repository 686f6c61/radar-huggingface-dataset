# positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo `google/gemma-4-26B-A4B-it`, realizada por Positron AI. El modelo base, desarrollado por Google DeepMind, es un modelo multimodal de tipo Mixture-of-Experts (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos por token. Admite entrada de texto e imagen y genera texto, con una ventana de contexto de hasta 256 000 tokens y soporte para más de 140 idiomas.

La cuantización GPTQ reduce el peso de los parámetros a 4 bits con un group size de 64, lo que permite ejecutar el modelo en hardware con menos memoria VRAM que la versión original en precisión completa. Esto lo hace adecuado para despliegues en producción donde el coste de GPU es un factor crítico, manteniendo las capacidades del modelo base para tareas de generación de texto, razonamiento, código y análisis de imágenes.

La relevancia de este artefacto radica en que ofrece una alternativa optimizada para inferencia de un modelo de gran tamaño con arquitectura MoE, sin necesidad de infraestructura de alto presupuesto. La licencia Apache 2.0 facilita su uso comercial, aunque se deben respetar las restricciones adicionales de la licencia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (texto e imagen) |
| Parametros totales | 25 805 936 206 |
| Parametros activos | 4 000 000 000 (aprox., segun denominacion A4B) |
| Longitud de contexto | 256 000 tokens (modelo base) |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simetrica, desc_act false |
| Idiomas soportados | Mas de 140 idiomas (modelo base) |
| Licencia | Apache 2.0 (con restricciones de la licencia Gemma 4) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura MoE con 26 000 millones de parametros totales y 4 000 millones activos por token, lo que reduce el coste computacional en inferencia al activar solo una fraccion de los expertos. Es multimodal: procesa imagenes y texto como entrada y genera texto como salida. Incluye un modelo draft dedicado para decodificacion especulativa, lo que acelera la generacion sin perdida de calidad, y soporte nativo para el rol de sistema en conversaciones.

La cuantizacion GPTQ fue realizada por Positron AI con GPTQModel 7.2.0, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Se utilizo un conjunto de calibracion mixto de 128 muestras con longitud de secuencia 4096. Los pesos se cuantizaron a 4 bits con group size 64, activaciones sin cuantizar y sin reordenamiento de activaciones (desc_act false). No se han publicado detalles sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en multiples idiomas.
- Razonamiento logico y matematico, incluyendo problemas de varios pasos.
- Generacion de codigo en diversos lenguajes de programacion.
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y analisis de contenido grafico.
- Soporte de system prompt para control estructurado de conversaciones.
- Decodificacion especulativa mediante modelo draft integrado, que mejora la velocidad de inferencia.
- Capacidad multilingue en mas de 140 idiomas.
- Ventana de contexto larga de hasta 256 000 tokens, util para documentos extensos o conversaciones prolongadas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, manteniendo el historial completo de la interaccion y respondiendo en el idioma del usuario.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD para autocompletar o revisar codigo, aprovechando su capacidad de razonamiento y generacion de codigo en multiples lenguajes.
- Analisis de documentos con imagenes: procesar informes que combinan texto y graficos, extrayendo informacion relevante para resumenes o busquedas internas.
- Asistentes virtuales multilingues: desplegar un asistente que atienda a usuarios en diferentes idiomas sin necesidad de modelos separados por region.
- Razonamiento sobre documentos extensos: resumir o responder preguntas sobre libros, contratos o articulos cientificos de gran longitud, gracias al contexto de 256K tokens.
- Prototipado rapido de aplicaciones de IA: al ser una cuantizacion 4-bit, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) para pruebas y desarrollo antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Positron AI indica explicitamente que no reporta metricas de rendimiento (ni KL-divergence, ni accuracy, ni perplexity). Los resultados de validacion se gestionan internamente. Por tanto, no se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25 805 936 206 parametros en 4 bits, los pesos ocupan aproximadamente 12,9 GB (25,8 B × 0,5 bytes). Con overhead de activaciones y memoria adicional, se recomienda al menos 16 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM, como NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB) o H100 (80 GB). En GPUs con menos de 16 GB podria ser necesario reducir el batch o usar tecnicas de offloading.
- Compatibilidad con GPU de consumo: si, en tarjetas como RTX 4090 o RTX 4080, siempre que se respete el limite de VRAM.
- Opciones de despliegue: al ser un modelo GPTQ en formato safetensors, es compatible con vLLM, ExLlamaV2, TGI (Text Generation Inference) y otras herramientas que soporten GPTQ. Tambien se puede usar con transformers mediante el pipeline de generacion.
- Latencia y throughput: no se han proporcionado datos oficiales. La decodificacion especulativa del modelo base puede mejorar la velocidad, pero depende del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. A continuacion se comparan caracteristicas tecnicas con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Gemma 4 26B A4B IT (cuantizado GPTQ) | 25,8B totales, 4B activos | 256K | MoE multimodal | Apache 2.0 |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32K | MoE denso | Apache 2.0 |
| Qwen2.5-32B | 32,5B | 128K | Denso | Apache 2.0 |
| Llama 3.1 70B | 70,6B | 128K | Denso | Llama 3.1 license |

La comparativa se limita a especificaciones, ya que no hay datos de rendimiento publicados para este artefacto cuantizado.

## Limitaciones y advertencias

- Al ser una cuantizacion GPTQ de 4 bits, puede existir una ligera degradacion en la calidad de las respuestas respecto al modelo original en precision completa, especialmente en tareas de razonamiento complejo o generacion de codigo.
- La model card no reporta metricas de calidad, por lo que se recomienda validar el modelo en el caso de uso especifico antes de desplegarlo en produccion.
- El modelo base puede presentar sesgos presentes en los datos de entrenamiento, aunque no se han documentado en la informacion disponible.
- Riesgo de alucinacion en contextos donde la informacion no esta claramente soportada, como en cualquier modelo generativo.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar las restricciones adicionales de la licencia de Gemma 4 (enlace en la model card) para asegurar el cumplimiento.
- La cuantizacion fue realizada con un conjunto de calibracion especifico; si el dominio de aplicacion difiere mucho, el rendimiento podria variar.
- No se ha verificado la compatibilidad con todas las herramientas de inferencia; se recomienda probar con vLLM o ExLlamaV2 antes de un despliegue masivo.

## Enlaces

- Repositorio del artefacto cuantizado: https://huggingface.co/positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Referencia en Google Cloud (Gemma 4 26B A4B IT): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
