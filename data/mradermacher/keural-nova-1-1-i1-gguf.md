# mradermacher/Keural-Nova-1.1-i1-GGUF

## Resumen

Keural-Nova-1.1-i1-GGUF es la versión cuantizada con GGUF del modelo mkd-ai/Keural-Nova-1.1, publicada por el cuantizador mradermacher. El modelo original es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, afinado mediante LoRA e instruction-tuning, y orientado a conversación en coreano e inglés. Esta publicación no contiene los pesos originales, sino una batería de cuantizaciones con imatrix que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha reside en que el repositorio original del modelo no está disponible en la información proporcionada, mientras que esta versión cuantizada sí ofrece detalles concretos sobre tamaños, tipos de cuantización y compatibilidad de despliegue. El repo acumula 279,2 GB de pesos en distintos formatos y suma 213 descargas, con licencia Apache 2.0.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Cualquier dato de ese tipo se marca como no disponible para no inventar cifras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), según etiquetas del autor |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo base se distribuye en safetensors |
| Modelo base | mkd-ai/Keural-Nova-1.1 |
| Tamaño del repositorio | 279,2 GB |
| Librería declarada | transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, según las etiquetas declaradas por el autor (moe, lora, instruction-tuning). El proceso de afinado combina LoRA con instruction-tuning, lo que sugiere una adaptación de bajo rango sobre un modelo preentrenado y un ajuste posterior para seguir instrucciones conversacionales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: mradermacher genera cuantizaciones con imatrix (importance matrix), un método que calibra la cuantización con datos de activación para preservar mejor la calidad en bits bajos. El repositorio incluye el fichero imatrix (0,3 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Los cuantos i1 están pensados para superar a los cuantos estáticos equivalentes en perplejidad, especialmente en los rangos IQ.

## Capacidades

- Generación de texto conversacional en coreano e inglés, según los idiomas declarados.
- Instruction-following gracias al ajuste con instruction-tuning.
- Razonamiento multi-turno en formato de chat, aunque sin datos publicados sobre calidad.
- Capacidades multilingües limitadas a ko y en; no se declaran otros idiomas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso explícito.
- No se declara modo thinking, visión, audio ni otras capacidades especiales.
- Compatible con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia estándar.

## Casos de uso

- Asistente conversacional en coreano: el modelo puede gestionar diálogos multi-turno en coreano con instruction-tuning específico, adecuado para productos dirigidos al mercado surcoreano donde escasean modelos abiertos con buen soporte nativo.
- Traducción coreano-inglés en pipelines internos: al cubrir ambos idiomas, puede integrarse en flujos de traducción asistida o generación de contenido bilingüe, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (21,8 GB) e i1-IQ4_XS (19,3 GB) permiten ejecutar el modelo en GPUs de 24 GB como la RTX 4090, algo inviable con los pesos en safetensors completos.
- Prototipado local con llama.cpp u Ollama: el formato GGUF y los cuantos Q4 permiten iterar rápidamente en estaciones de trabajo sin infraestructura de servidores.
- Investigación sobre cuantización: el fichero imatrix y la variedad de cuantos (desde Q2_K de 13,3 GB hasta Q6_K de 29,3 GB) permiten estudiar la degradación de calidad por nivel de compresión en un MoE de 35B.
- Servicio de chat self-hosted con vLLM o TGI: aunque el repo es GGUF, el modelo base en safetensors puede servirse con motores de inferencia de alto rendimiento para aplicaciones de atención al cliente en coreano.
- Generación de contenido editorial bilingüe: redacción y adaptación de textos entre coreano e inglés con control de estilo mediante prompts, aprovechando el instruction-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~13,3 GB; i1-IQ3_S ~15,7 GB; i1-Q4_K_S ~20,5 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB. Añadir margen para el contexto KV cache, que no se puede calcular sin conocer la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para cuantos Q4; A100 40 GB o H100 para cuantos Q5/Q6 y contextos largos; GPUs de 16 GB solo con cuantos IQ3 o Q2.
- Cabe en GPU de consumo: sí, con cuantos Q4 en RTX 4090, RTX 3090 o similares de 24 GB. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con IQ3_S o inferiores, con posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si el soporte de la arquitectura MoE está disponible.
- Latencia y throughput estimados: no disponible. Dependen del hardware, del cuanto y de la longitud de contexto, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Keural-Nova-1.1-i1-GGUF | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Coreano e inglés, instruction-tuned |
| Modelo base mkd-ai/Keural-Nova-1.1 | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos de la misma categoría en la documentación proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad factual.
- Limitaciones de idioma: solo se declaran coreano e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no documentadas aquí.
- Cuantizaciones de baja calidad: los cuantos Q2_K y Q3_K_S pierden calidad de forma notable; el propio autor recomienda IQ3_XXS o IQ3_XS frente a Q3_K en esos rangos. Para producción se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: sin métricas publicadas no se puede validar la calidad del modelo frente a alternativas, lo que supone un riesgo para adopción en producción.
- MoE y memoria: aunque los parámetros activos sean menores, todos los pesos deben residir en memoria, por lo que los requisitos de VRAM se acercan a los de un modelo denso de 35B.
- Fecha de creación futura (2026-07-30) en los metadatos: conviene contrastar la procedencia y vigencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face de la versión cuantizada: https://huggingface.co/mradermacher/Keural-Nova-1.1-i1-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Nova-1.1
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Keural-Nova-1.1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Keural-Nova-1.1-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
