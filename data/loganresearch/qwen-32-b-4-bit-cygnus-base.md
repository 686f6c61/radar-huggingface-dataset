# LoganResearch/Qwen-32-B-4-Bit-Cygnus-Base

## Resumen

Qwen-32-B-4-Bit-Cygnus-Base es una cuantización a 4 bits del modelo Qwen2.5-32B-Instruct, publicada por LoganResearch como artefacto base del sistema denominado CYGNUS 1.0. El modelo original lo desarrolla el equipo Qwen de Alibaba y se distribuye bajo licencia Apache-2.0; esta versión mantiene esa misma licencia y se limita a recomprimir los pesos originales mediante bitsandbytes en formato NF4 con doble cuantización y cómputo en bfloat16. No se trata, por tanto, de un modelo entrenado desde cero ni de un fine-tune con datos nuevos, sino de una conversión de precisión del checkpoint instruct de Qwen2.5.

El interés práctico reside en que reduce el peso en disco del modelo de aproximadamente 65 GB (en bf16) a unos 19,2 GB, lo que rebaja de forma drástica los requisitos de VRAM para servirlo. Con 32.763.876.352 parámetros reales según los safetensors del repositorio, la cuantización NF4 permite ejecutar un modelo de clase 32B en una única GPU de 24 GB con margen ajustado, o en configuraciones de 48 GB con holgura para contexto largo. Es relevante para quienes quieren evaluar las capacidades del Qwen2.5-32B-Instruct en hardware de gama alta de consumo o en una sola GPU de datacenter de gama media.

La ficha del autor es extremadamente escueta: no documenta el proceso de calibración de la cuantización, no incluye evaluación de la degradación respecto al original y no publica resultados de benchmarks. El repositorio acumula muy pocas descargas, lo que sugiere un uso experimental dentro del ecosistema Proprioceptive AI más que un artefacto de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado a 4 bits con bitsandbytes NF4 |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN, segun la documentacion del modelo original) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion, computo en bfloat16 (bitsandbytes) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion bitsandbytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atención por consultas agrupadas (GQA), activaciones SwiGLU y normalización RMSNorm, entrenado por el equipo Qwen sobre un corpus multilingüe de gran escala y posteriormente alineado mediante instrucción y preferencias. Este repositorio no añade entrenamiento: es una conversión de precisión que aplica cuantización de bloque NF4 con doble cuantización sobre los pesos del checkpoint instruct, manteniendo el cómputo en bfloat16 durante la inferencia.

No se documenta en la información disponible ni el número de tokens de calibración, ni la composición del conjunto de calibración, ni si se ha realizado una evaluación de la perduida de calidad respecto al modelo en bf16. Tampoco se especifican innovaciones técnicas adicionales más allá de la propia cuantización bitsandbytes. La etiqueta "Cygnus Base" indica únicamente que este artefacto sirve como punto de partida del sistema CYGNUS 1.0 del autor, sin que se detalle qué capas adicionales o procedimientos lo componen.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del checkpoint instruct original.
- Razonamiento y resolución de problemas de complejidad media-alta, incluyendo matemáticas y lógica.
- Generación y explicación de código en múltiples lenguajes de programación.
- Comprensión y generación multilingüe (el modelo base Qwen2.5 cubre más de 29 idiomas; esta versión cuantizada no documenta evaluación propia).
- Soporte de tool calling y function calling, según las capacidades del Qwen2.5-32B-Instruct original.
- Capacidad de seguir instrucciones estructuradas y formatos JSON, útil para pipelines automatizados.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido en esta versión.

## Casos de uso

- Despliegue de un asistente conversacional de clase 32B en una única GPU de 24 GB: la cuantización NF4 reduce el peso a unos 19,2 GB, lo que permite servir el modelo con contexto moderado en tarjetas como la RTX 4090 o la L40S, algo inviable con los pesos en bf16.
- Evaluación comparativa de la degradación por cuantización: investigadores que quieran medir cuánto pierde Qwen2.5-32B-Instruct al pasar de bf16 a NF4 pueden usar este checkpoint como referencia directa frente al original.
- Generación de código en entornos con presupuesto de VRAM limitado: el modelo puede integrarse en servidores de desarrollo con una sola GPU para autocompletado, revisión de parches y explicación de código, aprovechando las capacidades instruct del original.
- Prototipado de agentes con tool calling: al conservar el formato de chat y las capacidades de llamada a funciones del modelo base, sirve para construir agentes que consulten APIs o bases de datos en fase de prueba.
- Procesamiento por lotes de documentos en hardware modesto: con 19,2 GB de pesos, es posible ejecutar tareas de resumen, extracción y clasificación sobre corpus de tamaño medio en una GPU de gama alta de consumo.
- Base para experimentos de investigación del ecosistema Proprioceptive AI: el autor lo presenta explícitamente como el modelo base de CYGNUS 1.0, por lo que es el punto de partida para reproducir o extender ese sistema.
- Fine-tuning con QLoRA: al estar ya cuantizado en NF4, puede servir como base para adaptaciones de bajo rango sobre hardware de 24-48 GB, aunque requeriría verificar la compatibilidad del checkpoint con el pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de la degradación introducida por la cuantización respecto al Qwen2.5-32B-Instruct en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,2 GB solo para pesos; con overhead de activaciones y caché KV, se recomienda un mínimo de 24 GB para contexto corto y 40-48 GB para contexto largo.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, L40S 48 GB para producción; RTX 4090 24 GB o RTX A6000 48 GB para uso individual.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto limitado y cuantización de caché KV si se necesita ventana amplia; en GPUs de 16 GB no cabe sin offloading a CPU.
- Opciones de despliegue: al ser un checkpoint bitsandbytes, requiere cargarlo con Transformers y bitsandbytes; vLLM y TGI no soportan de forma nativa este formato de cuantización, por lo que para servir en producción convendría reconvertir a GPTQ, AWQ o GGUF. llama.cpp y Ollama no pueden cargar directamente pesos bitsandbytes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-32-B-4-Bit-Cygnus-Base | 32,7B | No disponible (base: 32.768 nativos) | 4-bit NF4 bitsandbytes | Apache-2.0 | Hugging Face, 8 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,7B | 32.768 nativos (131.072 con YaRN) | bf16 | Apache-2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-32B-Instruct-GPTQ-Int4 | 32,7B | 32.768 nativos | 4-bit GPTQ | Apache-2.0 | Hugging Face, oficial |
| Qwen/Qwen2.5-32B-Instruct-AWQ | 32,7B | 32.768 nativos | 4-bit AWQ | Apache-2.0 | Hugging Face, oficial |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento de esta cuantización que permitan contrastarla con modelos de otros desarrolladores. Frente a las versiones GPTQ-Int4 y AWQ oficiales, esta conversión bitsandbytes no aporta ventajas de despliegue en servidores de inferencia de alto rendimiento y carece de evaluación publicada.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de la degradación de calidad respecto al Qwen2.5-32B-Instruct en bf16; la pérdida por cuantización NF4 es desconocida.
- El proceso de calibración de la cuantización no está documentado, lo que impide reproducir el artefacto o auditar su construcción.
- El formato bitsandbytes limita el despliegue: no es compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama, lo que restringe su uso en producción a Transformers.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en esta versión.
- Sesgos del modelo original (corpus de entrenamiento de Qwen) sin análisis específico en esta cuantización.
- Idiomas soportados no documentados en esta ficha, aunque el modelo base es multilingüe.
- El repositorio tiene un uso muy reducido (8 descargas, 0 likes) y no cuenta con validación de la comunidad; conviene tratarlo como artefacto experimental.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte sobre la cuantización.
- La fecha de creación del repositorio (2026-05-23) y la de actualización (2026-11-25) deben verificarse en el contexto temporal de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/Qwen-32-B-4-Bit-Cygnus-Base
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sitio del autor: https://proprioceptiveai.com
- Repositorio de Proprioceptive Lens: https://github.com/Loganwins/ProprioceptiveAI
- API Swarm: https://proprioceptiveai.com/products.html#swarm
- Publicaciones del autor: https://proprioceptiveai.com/publications.html
- Perfil en Zenodo: https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Napolitano%2C%20Logan%20Matthew%22
