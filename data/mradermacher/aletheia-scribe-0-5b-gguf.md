# mradermacher/aletheia-scribe-0.5b-GGUF

## Resumen

Aletheia Scribe 0.5B es un modelo de lenguaje especializado en verificación científica y generación de JSON estructurado, desarrollado por el usuario ahrazzle y cuantizado a formato GGUF por mradermacher. Se trata de un ajuste fino mediante LoRA sobre una base Qwen2 de aproximadamente 494 millones de parámetros, fusionado (merged) en un checkpoint único. Su propósito declarado es actuar como "escriba" dentro de un ecosistema de especialistas denominado Aletheia, orientado a tareas de verificación de afirmaciones científicas y producción de salidas estructuradas.

El modelo se distribuye exclusivamente en inglés y bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su tamaño reducido (menos de 500 millones de parámetros) lo sitúa en la categoría de modelos ultraligeros, aptos para ejecución en CPU o GPUs de gama baja, y su cuantización GGUF facilita el despliegue con llama.cpp y herramientas derivadas.

La relevancia de esta ficha radica en documentar un modelo de nicho, con escasa adopción pública (0 descargas y 0 likes en el momento de la consulta) y sin benchmarks publicados, pero con una propuesta técnica concreta: especialización en verificación científica estructurada sobre una base Qwen2 compacta. Es un ejemplo de ajuste fino LoRA orientado a una tarea acotada más que a capacidades generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2), ajuste fino LoRA fusionado |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) que posteriormente se fusionó en los pesos del modelo, dando lugar a un checkpoint único. El dataset de entrenamiento declarado es `ahrazzle/aletheia-specialists-s95-datasets`, orientado a tareas de especialista en verificación científica y generación de JSON estructurado. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal no reside en la arquitectura, sino en la especialización: el modelo está diseñado para producir salidas JSON estructuradas en el contexto de verificación de afirmaciones científicas, dentro de un ecosistema de especialistas Aletheia. No se documentan técnicas avanzadas como decodificación especulativa o atención lineal. La cuantización GGUF la realiza mradermacher con cuantizaciones estáticas (no ponderadas/imatrix), según indica la propia model card.

## Capacidades

- Generación de texto en inglés con especialización en verificación de afirmaciones científicas.
- Producción de salidas JSON estructuradas, adecuada para pipelines que requieren formato rígido.
- Ajuste fino orientado a tareas de "escriba" dentro de un sistema multi-agente de especialistas.
- Capacidad conversacional (etiqueta `conversational` en los metadatos).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Verificación de afirmaciones científicas: el modelo puede recibir una afirmación y devolver una evaluación estructurada en JSON, gracias a su ajuste fino específico sobre el dataset Aletheia de especialistas.
- Extracción de datos estructurados: útil para convertir texto científico no estructurado en JSON con campos definidos, integrándose en pipelines de procesamiento documental.
- Clasificación y etiquetado de contenido científico: al estar especializado en verificación, puede emplearse para etiquetar afirmaciones como verificadas, no verificadas o dudosas dentro de un flujo automatizado.
- Componente de un sistema multi-agente: su rol de "scribe" lo hace adecuado como módulo de salida estructurada dentro de un ecosistema mayor de especialistas Aletheia.
- Despliegue en entornos con recursos limitados: con menos de 500M de parámetros y cuantizaciones de 0,4-0,6 GB, puede ejecutarse en CPU o GPUs de gama baja para tareas de verificación a pequeña escala.
- Prototipado rápido de pipelines de validación: su licencia Apache 2.0 y formato GGUF permiten integrarlo en prototipos sin coste de licencia y con despliegue sencillo mediante llama.cpp.
- Filtrado de contenido en bases de datos científicas: puede emplearse para preclasificar afirmaciones antes de una revisión humana, reduciendo el volumen de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB con cuantizaciones Q2_K a Q8_0; alrededor de 1,1 GB con f16.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, RTX 4090) es más que suficiente; también cabe en GPUs de gama baja e integradas con suficiente memoria compartida.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer de los últimos años, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamaño (menos de 500M de parámetros), se espera una latencia muy baja en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aletheia Scribe 0.5B (este) | 494M | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en verificación científica y JSON |
| Qwen2-0.5B (base) | ~494M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista; base de este ajuste |
| Modelos de verificación científica de mayor tamaño | no disponible | no disponible | variable | variable | No se dispone de comparativas publicadas con este modelo |

No se dispone de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría. La comparación con Qwen2-0.5B es estructural (es su base), no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2 y entrenarse en un dataset específico, puede heredar sesgos de la base y del dataset de ajuste.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje de este tamaño; la especialización en verificación no elimina el riesgo de generar afirmaciones incorrectas con formato JSON válido.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible.
- Limitaciones de idioma: solo inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento.
- Advertencia para producción: con 0 descargas y 0 likes, el modelo carece de validación comunitaria; no se han publicado evaluaciones independientes. Su uso en producción debería ir precedido de una evaluación propia sobre el caso de uso concreto.
- Las cuantizaciones son estáticas (no ponderadas/imatrix), lo que puede implicar una calidad ligeramente inferior en cuantizaciones bajas frente a alternativas ponderadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/aletheia-scribe-0.5b-GGUF
- Modelo base: https://huggingface.co/ahrazzle/aletheia-scribe-0.5b
- Dataset de entrenamiento: https://huggingface.co/datasets/ahrazzle/aletheia-specialists-s95-datasets
- Página de descargas del cuantizador: https://hf.tst.eu/model#aletheia-scribe-0.5b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
