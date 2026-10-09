# Livesport/pplx-decider-v1.1-27b-GGUF

## Resumen

pplx-decider-v1.1-27b-GGUF es una conversión a formato GGUF del modelo `perplexity-ai/pplx-decider-v1.1-27b`, publicada por Livesport. No se trata de un modelo generativo de texto: es un modelo de decisión que responde a preguntas tipadas sobre un estado compartido y devuelve probabilidades calibradas. La estructura de petición sigue el mismo esquema que TypeSafe's Jev, con un campo `state` y preguntas de tipo `noul`, `choice` o `score`. El repositorio tiene como objetivo hacer ejecutable bajo llama.cpp el checkpoint original en bf16, que requiere torch y aproximadamente 49 GB de pesos.

El modelo es denso, con unos 25.625.905.664 parámetros tras eliminar la torre de visión del checkpoint original, y no emplea arquitectura MoE: todos los parámetros están activos en cada pasada. Su rasgo arquitectónico principal es la atención bidireccional: 16 de las 64 capas ejecutan atención completa con la máscara causal eliminada (`noncausal_full_attention`), mientras que las 48 restantes son lineales/recurrentes y mantienen la máscara causal. Esto implica que no existe prefijo cacheable y que el estado debe reprocesarse completo por cada pregunta.

La relevancia actual del modelo radica en su orientación a la clasificación y decisión con probabilidades calibradas, en lugar de la generación de texto, y en que la conversión a GGUF incluye métricas de fidelidad poco habituales (divergencia KL sobre la distribución de decisión) junto con una cuantización personalizada `Q5_K_M-dyn` calibrada con el propio prompt de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, 16 de atención completa bidireccional (sin máscara causal) y 48 lineales/recurrentes (con máscara causal); `attention_mode = noncausal_full_attention` |
| Parametros totales | 25.625.905.664 (~25,6 B), tras eliminar la torre de visión; denso, sin MoE |
| Parametros activos | No aplica (modelo denso, no MoE); todos los parámetros activos en cada pasada |
| Longitud de contexto | Máximo 8192 tokens; por encima de ese valor el modelo rechaza la entrada (no trunca) y el servidor devuelve HTTP 400 |
| Tipos de cuantizacion | GGUF: Q8_0, Q5_K_M-dyn (publicados); Q6_K, Q5_K_M, Q4_K_M y variantes evaluadas internamente. Calibración mediante `llama-imatrix` |
| Idiomas soportados | Inglés (en) y checo (cs) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye `readout.safetensors` con la cabeza de decisión en `cls.output.weight` |

## Arquitectura y entrenamiento

El checkpoint base es un transformer híbrido de 64 capas que combina atención completa con capas lineales/recurrentes. La innovación clave es el modo de atención `noncausal_full_attention`: en 16 de las 64 capas se elimina la máscara causal, de modo que la representación del estado depende de la pregunta que se formula a continuación. El prompt se ordena como `State → Question → Options`. Como consecuencia, no existe prefijo cacheable entre preguntas y el código original rechaza explícitamente el uso de caché KV. La primera capa de atención completa está en el índice 3, por lo que el techo teórico de reutilización de prefijo es de 3 de 64 capas (~5 %).

La cuantización se realizó con `llama-imatrix` sobre 5,0 MB (1707 prompts) generados con el propio `decision_messages()` y la plantilla de chat del modelo, a partir de 603 estados reales de artículos en checo e inglés, con una mezcla de preguntas `noul`, `choice` y `score` y un número de opciones entre 2 y 23. La calibración se hizo en la forma de prompt de producción, no en prosa general. La métrica de calidad empleada es la divergencia KL sobre la distribución de decisión (no la perplejidad de tokens), comparando la distribución de 255 opciones frente al GGUF en bf16 sobre 240 estados reservados. En la información disponible no se detallan los datos de preentrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO; el modelo base incluye una torre de visión que la conversión descarta.

## Capacidades

- Clasificación y decisión: responde a preguntas tipadas (`noul`, `choice`, `score`) sobre un estado compartido y devuelve distribuciones de probabilidad calibradas sobre opciones.
- No genera texto: carece de cabeza de lenguaje, por lo que no produce continuaciones de lenguaje natural.
- Soporte multilingüe limitado a inglés y checo; el modelo maneja mejor que los modelos de decisión causales la declinación de casos y el orden de palabras en checo, gracias a su atención bidireccional.
- Manejo de decisiones con muchas opciones: evaluado con recuentos de opciones entre 2 y 23 y una cabeza de decisión de 255 vías (`cls.output.weight`).
- Gestión explícita de entradas largas: por encima de 8192 tokens rechaza la petición en lugar de truncarla, lo que evita respuestas de alta confianza basadas en fragmentos.
- No se menciona soporte de tool calling, function calling ni de agentes/multi-step reasoning en la información disponible (no disponible).

## Casos de uso

- Clasificación editorial de artículos deportivos: dado el estado de un artículo y una pregunta de tipo `choice`, el modelo devuelve la categoría más probable con probabilidad calibrada, lo que permite fijar umbrales de confianza antes de publicar automáticamente.
- Enrutamiento de contenido en pipelines: con estados de hasta 8192 tokens, se puede usar como clasificador de enrutamiento que decide a qué cola o sección va cada pieza, con probabilidades utilizables para derivar a revisión humana cuando la confianza es baja.
- Decisión sobre portada y destacados: mediante preguntas `score`, ordenar o seleccionar elementos candidatos según la probabilidad asignada a cada opción, con soporte de hasta 23 opciones por consulta.
- Priorización de notificaciones push: dado el estado de un evento y varias opciones de notificación, elegir la más adecuada según la distribución devuelta.
- Moderación y etiquetado: usar las probabilidades calibradas para etiquetar contenido potencialmente problemático, aprovechando que el modelo rechaza entradas fuera de rango en lugar de responder con fragmentos.
- Clasificación en checo: aprovechar el manejo del caso gramatical y del orden libre de palabras para tareas de decisión sobre textos en checo, donde los modelos causales rinden peor.
- Servicio de decisión vía API: desplegar el modelo con llama.cpp y el servidor incluido en `runtime/`, exponiendo decisiones con códigos HTTP explícitos (por ejemplo, 400 ante entradas demasiado largas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte además que `llama-perplexity` no es aplicable porque el modelo carece de cabeza de lenguaje; la perplejidad reportada durante la recolección de imatrix (~5·10⁵) es irrelevante. Los datos de rendimiento disponibles son de fidelidad de cuantización (divergencia KL sobre la distribución de decisión) y de latencia.

Evaluación de fidelidad de cuantización (240 estados reservados, 255 vías de opción, frente al GGUF en bf16):

| Candidato | Tamano | Media \|dp\| | p99 \|dp\| | KL | Flips |
|---|---|---|---|---|---|
| Q8_0 | 25,38 GB | 0,00227 | 0,01795 | 0,000118 | 1 |
| Q6_K + ssm f32 | 19,67 GB | 0,00389 | 0,03574 | 0,000453 | 3 |
| Q6_K | 19,60 GB | 0,00420 | 0,05000 | 0,000588 | 1 |
| Q5_K_M-dyn | 18,24 GB | 0,00583 | 0,05408 | 0,000794 | 1 |
| Q4_K_M | 14,75 GB | 0,00961 | 0,09077 | 0,002188 | 2 |
| Q4_K_M + embd q8_0 | 15,03 GB | 0,00970 | 0,09869 | 0,002287 | 2 |
| Q4_K_M + ssm f32 | 14,82 GB | 0,00967 | 0,10589 | 0,002384 | 4 |
| Q4_K_M + full layout | 16,16 GB | 0,01003 | 0,10748 | 0,002701 | 2 |
| Q5_K_M | 17,10 GB | 0,00863 | 0,13787 | 0,002774 | 3 |
| Q5_K_M + ssm f32 | 17,17 GB | 0,01008 | 0,14577 | 0,004088 | 5 |

Bootstrap emparejado (10.000 remuestreos sobre los mismos 240 elementos), tres mejores candidatos:

| Pareja | ΔKL | IC 95 % | Veredicto |
|---|---|---|---|
| Q8_0 − Q6_K | −0,000470 | [−0,000862, −0,000178] | real |
| Q8_0 − Q5_K_M-dyn | −0,000677 | [−0,000963, −0,000440] | real |
| Q6_K − Q5_K_M-dyn | −0,000207 | [−0,000598, +0,000233] | no distinguible |

Archivos publicados: `pplx-decider-v1.1-27b-Q8_0.gguf` (25,4 GB, KL 0,000118, 1 flip), `pplx-decider-v1.1-27b-Q5_K_M-dyn.gguf` (18,2 GB, KL 0,000794, 1 flip) y `pplx-decider-v1.1-27b-imatrix.gguf` (14 MB).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 25,4 GB para Q8_0; 18,2 GB para Q5_K_M-dyn; 14,75 GB para Q4_K_M. Hay que añadir la sobrecarga del runtime. El autor indica explícitamente que no cabe en ninguna tarjeta de 8 GB en ninguna de estas cuantizaciones.
- GPU recomendadas: el autor midió ~1,05 ms por token de estado en una GB10. Para Q8_0 conviene una GPU de 32 GB o más (A100 40 GB, H100); Q5_K_M-dyn y Q4_K_M pueden caber en tarjetas consumer de 24 GB (RTX 3090/4090).
- Cabe en consumer GPU: sí para las cuantizaciones Q5_K_M-dyn y Q4_K_M en GPU de 24 GB; Q8_0 queda al límite y en la práctica requiere memoria de clase profesional.
- Opciones de despliegue: llama.cpp (formato GGUF nativo) y el servidor incluido en `runtime/`, que devuelve HTTP 400 ante entradas que exceden el contexto. El checkpoint original en bf16 requiere torch y ~49 GB de pesos. No se documentan otros motores (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: ~1,05 ms por token de estado en GB10; 0,56 s con 0,5k tokens y 8,7 s con el máximo de 8192 tokens. No hay caché KV reutilizable entre preguntas, por lo que cada consulta implica una pasada completa sobre el estado.

## Comparativa con modelos similares

La información proporcionada solo menciona dos referencias comparables, sin especificaciones detalladas.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pplx-decider-v1.1-27b (base) | ~25,6 B | no disponible | safetensors bf16 (requiere torch, ~49 GB) | Apache-2.0 | Checkpoint original del que deriva esta conversión |
| pplx-decider-v1.1-27b-GGUF (este) | 25.625.905.664 | 8192 tokens | GGUF (Q8_0, Q5_K_M-dyn) + readout.safetensors | Apache-2.0 | Conversión y cuantización para llama.cpp |
| TypeSafe's Jev | no disponible | no disponible | no disponible | no disponible | Se cita como esquema de petición equivalente (`state` + `noul`/`choice`/`score`) |
| Clef-Flash | no disponible | no disponible | no disponible | no disponible | Pertenece a la misma familia; su layout de cuantización no transfirió a este modelo |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto y carece de cabeza de lenguaje, por lo que no sirve para tareas de generación, resumen o diálogo.
- Sin caché de prefijo: la atención bidireccional impide reutilizar estados entre preguntas, lo que limita el throughput y encarece cada consulta con estados largos.
- Límite estricto de 8192 tokens: por encima de ese umbral el modelo rechaza la entrada (excepción en `prepare()`, HTTP 400 en el servidor); no trunca silenciosamente.
- Idiomas restringidos a inglés y checo; no hay evidencia de soporte para otros idiomas.
- Riesgo de calibración y alucinación: el autor advierte que una menor KL no implica mejores decisiones (el caso `Q6_K + ssm f32` tiene menor KL media pero el triple de flips), de modo que seleccionar cuantizaciones solo por KL media puede llevar a elegir una peor.
- Muestra de evaluación pequeña y sesgada: los 240 elementos son una muestra reducida y la KL está muy desbalanceada (el 5 % de peores elementos concentra entre el 45 % y el 71 % del total).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier componente heredado (por ejemplo, la torre de visión descartada).
- Caveat para producción: no se han documentado sesgos concretos ni resultados de benchmarks estándar, por lo que cualquier despliegue debería validarse con datos propios del dominio.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Livesport/pplx-decider-v1.1-27b-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Resultados de búsqueda web: únicamente aparecen sitios de resultados deportivos de Livesport (livesport.com, livesporttv.com, livesports.co), sin contenido técnico relevante sobre el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
