# positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq_proj

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo Qwen/Qwen3.5-9B, publicada por positron-ai. Se trata de un artefacto de inferencia derivado, no de un modelo entrenado desde cero: hereda la arquitectura, el conocimiento y las capacidades del modelo base de Alibaba Qwen y las comprime a pesos de 4 bits para reducir requisitos de memoria. El modelo base tiene 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y está etiquetado como `image-text-to-text` y `text-generation`, lo que sugiere capacidades multimodales de entrada y generación de texto.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de casi 10 mil millones de parámetros en GPUs con menos VRAM de la que exigiría el modelo en precisión completa. Sin embargo, el propio autor marca el repositorio como **superseded** (sustituido): existe una build más reciente en `positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq` que debería usarse para nuevos despliegues. Este repositorio se mantiene únicamente por compatibilidad con usuarios existentes.

La model card no publica métricas de calidad, divergencia KL ni perplejidad, y delega la validación a procesos internos de Positron AI. Por tanto, cualquier evaluación de degradación por cuantización debe realizarse por cuenta propia antes de llevar el modelo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, familia transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simetrica, `desc_act=false`, damp 0.05 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentacion proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento similar. La etiqueta `image-text-to-text` indica que el modelo base acepta imagenes y texto como entrada, pero no se especifican el encoder visual ni la resolucion de imagen soportada.

Lo que si esta documentado es el proceso de cuantizacion: GPTQ de 4 bits con pesos simetricos, tamano de grupo 64, sin `desc_act`, con un 0,05 % de damping. La calibracion se realizo sobre un conjunto mixto de dominio universal con 512 muestras y longitud de secuencia 8192. El toolchain empleado fue GPTQModel 7.3.4, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Las activaciones no estan cuantizadas. No se documenta ninguna innovacion arquitectonica adicional ni tecnica de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline `text-generation`.
- Procesamiento de entrada multimodal imagen-texto, segun la etiqueta `image-text-to-text` del modelo base.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional de ~9,65 B en GPUs de gama media: la cuantizacion GPTQ 4-bit reduce el peso de los parametros a aproximadamente 4 bits por valor, lo que permite alojar el modelo en tarjetas con menos VRAM que la version en BF16. Adecuado para prototipos y entornos de desarrollo con presupuesto de hardware limitado.
- Procesamiento de documentos con imagen y texto: al heredar la etiqueta `image-text-to-text` del modelo base, puede emplearse en tareas de extraccion o descripcion de contenido a partir de capturas, formularios escaneados o figuras, siempre que se valide la calidad tras la cuantizacion.
- Sustitucion directa en pipelines existentes de transformers: al estar empaquetado con la libreria `transformers` y pesos safetensors, se integra sin cambios en codigo que ya cargue el modelo base Qwen3.5-9B mediante `AutoModelForCausalLM` o equivalentes.
- Generacion de texto por lotes en servidores con una sola GPU: el formato GPTQ es compatible con runtimes de inferencia habituales, lo que facilita el despliegue en servicios de generacion de contenido, resumen o clasificacion textual.
- Entornos de evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad frente al modelo base en tareas propias, dado que el autor no publica metricas de perplexidad ni KL.
- Compatibilidad con endpoints gestionados: la etiqueta `endpoints_compatible` sugiere que el artefacto puede servirse en plataformas de inferencia que aceptan pesos GPTQ, simplificando el despliegue sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reporta metricas de rendimiento ni de calidad (ni KL-divergence, ni accuracy, ni perplexity) y que la validacion se gestiona internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 B de parametros en 4 bits, los pesos ocupan aproximadamente 4,8 GB; sumando overhead de activaciones, cache KV y el runtime, se recomienda prever al menos 8-10 GB de VRAM para contextos moderados. La cifra exacta depende de la longitud de contexto, no publicada.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs de consumo como RTX 3090, RTX 4090 o RTX 5090, y en GPUs de datacenter como A100, H100 o L40S.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas, sujeto a validacion con el contexto real de uso.
- Opciones de despliegue: transformers (libreria declarada); por el formato GPTQ, son candidatos habituales vLLM, TGI y otros runtimes con soporte GPTQ, aunque el autor no certifica ninguno.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq_proj | ~9,65 B | no disponible | GPTQ 4-bit | Apache 2.0 | Superseded |
| positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq | no disponible | no disponible | GPTQ | Apache 2.0 | Build actual recomendada |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible | BF16 (sin cuantizar) | Apache 2.0 | Modelo original |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio marcado como **superseded**: el autor recomienda migrar a `positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq` (commit `386ca42f2bfe56127ff7a43279eb9e2c83e87233`) para nuevos trabajos.
- Ausencia total de metricas de calidad: no hay perplexity, KL-divergence ni evaluaciones de accuracy, por lo que la degradacion introducida por la cuantizacion 4-bit es desconocida y debe medirse antes de desplegar.
- Riesgo de alucinacion: inherente al modelo base; no cuantificado en esta ficha por falta de datos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan publicados en este repositorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se mantienen las restricciones de uso del modelo original de Qwen; conviene revisar la licencia del modelo base.
- La cuantizacion GPTQ con `desc_act=false` puede degradar mas la calidad que configuraciones con reordenacion de activaciones en algunos modelos; no hay datos que lo confirmen o descarten aqui.
- Las activaciones no estan cuantizadas, por lo que el ahorro de memoria se limita a los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq_proj
- Build actual recomendada: https://huggingface.co/positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
