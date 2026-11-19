# mradermacher/Whittle-Qwen-3.8-35B-A3B-i1-GGUF

## Resumen

Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por whittleOrg, distribuido en formato GGUF cuantizado por mradermacher. El modelo base combina la arquitectura Qwen con innovaciones propias del proyecto Whittle: memoria condicional basada en n-gramas, hyper-connections y un proceso de destilación de conocimiento desde un modelo mayor (logic65/whittle-distill-qwen3.8-27b). Con 35.547.542.656 parámetros totales y licencia Apache 2.0, está orientado a tareas de razonamiento, generación de código y matemáticas, con soporte de modo "thinking".

Esta ficha describe específicamente la variante i1-GGUF publicada por mradermacher, que ofrece cuantizaciones con imatrix (importancia matricial) en un rango que va desde Q2_K (13,1 GB) hasta Q6_K (29,4 GB). El repositorio incluye tanto quants dinámicos i1 como referencia a quants estáticos en un repositorio hermano. El modelo está pensado para investigación y despliegue local mediante llama.cpp y ecosistemas compatibles con GGUF.

La relevancia actual del modelo radica en su propuesta arquitectónica (memoria condicional y hyper-connections sobre una base tipo Qwen) y en la disponibilidad de cuantizaciones de alta calidad que permiten ejecutarlo en hardware de consumo, algo poco habitual en modelos de 35B con componente MoE. No obstante, la información pública disponible sobre el modelo base es limitada y muchos datos técnicos no están confirmados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, con n-gram memory, conditional memory y hyper-connections (según tags del autor) |
| Parametros totales | 35.547.542.656 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix); también existen quants estáticos en repositorio separado |
| Idiomas soportados | en, zh, multilingual (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts construido sobre una base tipo Qwen (tag `qwen4_exp`), con 35,5 mil millones de parámetros totales. Según las etiquetas del autor, incorpora mecanismos de memoria condicional (`conditional-memory`), memoria basada en n-gramas (`n-gram-memory`) y hyper-connections, además de un proceso de destilación de conocimiento desde un modelo de 27B (logic65/whittle-distill-qwen3.8-27b). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La variante aquí descrita es una cuantización GGUF realizada por mradermacher utilizando ficheros imatrix, lo que permite cuantizaciones de menor tamaño con una pérdida de calidad más controlada que las cuantizaciones estáticas equivalentes. El autor indica que los quants IQ suelen ser preferibles a los K de tamaño similar y publica una tabla con tamaños y notas de calidad para cada variante. No se detalla en la información disponible ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento con modo "thinking" (según tags `reasoning` y `thinking`).
- Generación de código (`code`).
- Resolución de problemas matemáticos (`math`).
- Soporte multilingüe, con especial énfasis en inglés y chino.
- Capacidad de destilación de conocimiento (entrenado mediante knowledge distillation).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se confirma en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente de razonamiento local: el modelo puede desplegarse en una estación de trabajo con llama.cpp para tareas de análisis y resolución de problemas paso a paso, aprovechando el modo thinking y su naturaleza MoE para mantener un coste de inferencia contenido en relación con sus 35B totales.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite autocompletar y revisar código sin enviar datos a servicios externos, lo que encaja en equipos con políticas estrictas de confidencialidad.
- Apoyo a tareas matemáticas y educativas: útil para generar explicaciones y resolver ejercicios, con la cautela de verificar resultados por el riesgo de alucinación.
- Investigación sobre arquitecturas MoE: el modelo sirve como objeto de estudio para analizar el efecto de la memoria condicional, n-gram memory y hyper-connections en tareas de razonamiento.
- Prototipado rápido en hardware de consumo: las cuantizaciones Q4_K_M (21,4 GB) y Q4_K_S (20,5 GB) permiten probar el modelo en GPUs con 24 GB de VRAM, facilitando iteración sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio de quants, lo que permite medir el impacto de la cuantización en calidad y velocidad para un mismo modelo base.
- Despliegue en pipelines de generación de texto en inglés y chino: para equipos que trabajan con contenido bilingüe, el soporte declarado de en y zh cubre casos de traducción asistida y redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño del fichero GGUF, más overhead de contexto y KV cache):
  - i1-Q2_K: 13,1 GB.
  - i1-IQ3_S / i1-Q3_K_S: 15,7–15,8 GB.
  - i1-IQ4_XS: 19,3 GB.
  - i1-Q4_K_S: 20,5 GB.
  - i1-Q4_K_M: 21,4 GB.
  - i1-Q5_K_M: 25,2 GB.
  - i1-Q6_K: 29,4 GB.
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, una RTX 4090 (24 GB) puede alojar hasta Q4_K_M con contexto moderado; para Q5 y Q6 se requiere una GPU de 32 GB o superior (p. ej. A100 40 GB, H100, o configuraciones multi-GPU).
- Cabe en GPU de consumo: sí, en modelos con 16–24 GB de VRAM usando cuantizaciones IQ3/Q4; las cuantizaciones Q2 y Q3 pueden ejecutarse incluso con 12–16 GB, a costa de calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión frontends compatibles como Ollama o LM Studio; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B (i1-GGUF) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Memoria condicional, n-gram memory, hyper-connections |
| Qwen base (tag `qwen4_exp`) | no disponible | no disponible | no disponible | safetensors | Arquitectura de referencia del modelo |
| logic65/whittle-distill-qwen3.8-27b | 27B (aprox.) | no disponible | no disponible | no disponible | Modelo profesor usado en destilación |

No se dispone de datos de rendimiento comparativos ni de especificaciones completas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- La información pública sobre el modelo base es escasa: no se confirman contexto, parámetros activos, datos de entrenamiento ni benchmarks.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Idiomas declarados limitados a inglés, chino y multilingüe genérico; el rendimiento en castellano no está verificado.
- Las cuantizaciones de menor tamaño (Q2, Q3) degradan la calidad; el autor recomienda IQ3_XXS o IQ3_XS sobre Q2_K y Q3_K_S.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de destilación antes de producción.
- El repositorio ocupa 277,2 GB; la descarga de múltiples quants requiere planificación de almacenamiento.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Modelo etiquetado como `research`; no hay garantías de robustez en producción.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/whittleOrg/Whittle-Qwen-3.8-35B-A3B
- Quants estáticos: https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Whittle-Qwen-3.8-35B-A3B-i1-GGUF
- Dataset de destilación: https://huggingface.co/datasets/logic65/whittle-distill-qwen3.8-27b
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
