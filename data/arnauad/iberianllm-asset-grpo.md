# arnauad/IberianLLM-ASSET-GRPO

## Resumen

IberianLLM-ASSET-GRPO es un ajuste fino del modelo IberianLLM-7B-Instruct, desarrollado por Arnau Ayguadé Domingo (UPF) en el marco de su tesis de grado y presentado en el taller CLEAR-TEXT de CLIB 2026 (Sofía, Bulgaria). El modelo está especializado en simplificación de texto a nivel de frase en inglés, una tarea clave para accesibilidad cognitiva, educación y procesamiento de lenguaje para poblaciones con dificultades lectoras.

A diferencia de un ajuste fino supervisado clásico, el autor emplea GRPO (Group Relative Policy Optimization) implementado con TRL, usando generación con vLLM y entrenamiento distribuido en 2 nodos con 4 GPU mediante DeepSpeed ZeRO-3. La recompensa principal es SARI frente a la referencia de simplificación, complementada con penalizaciones diseñadas para evitar el *reward hacking*: copiar la entrada cuando se espera una simplificación, producir salidas vacías o generar textos desproporcionadamente más largos que la referencia.

El modelo parte de la familia IberianLLM, orientada a lenguas ibéricas, aunque este ajuste concreto se entrena y evalúa sobre el split inglés de ASSET. El repositorio ocupa 15,6 GB y se distribuye con licencia Apache 2.0. Su interés actual reside en ser un ejemplo reproducible de aplicación de RL con recompensas basadas en métricas de calidad (SARI) a una tarea de generación controlada, con código y paper públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`) |
| Parametros totales | 7B (modelo base); el campo safetensors del repo indica 266.240, dato no coherente con el tamaño del repo (15,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (tag `en`); el modelo base pertenece a la familia IberianLLM |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `langtech-languagemodeling/IberianLLM-7B-Instruct`, un transformer decoder-only de 7B parámetros. El autor no detalla en la model card la arquitectura interna del modelo base (número de capas, dimensiones, mecanismos de atención), por lo que esos datos deben consultarse en la ficha del modelo original.

El entrenamiento se realiza con GRPO sobre el split inglés del dataset ASSET, previamente filtrado para eliminar pares de simplificación de baja calidad. La generación durante el entrenamiento se apoya en vLLM, y el reparto de cómputo se hace con DeepSpeed ZeRO-3 en 2 nodos con 4 GPU. La función de recompensa combina SARI contra la referencia con tres penalizaciones explícitas: copiar la entrada, generar salidas vacías y producir salidas mucho más largas que la referencia. El prompt de entrenamiento incluye un system prompt con directrices de simplificación y 3 ejemplos few-shot, y el modelo espera exactamente ese formato en inferencia.

## Capacidades

- Simplificación de texto a nivel de frase en inglés, manteniendo el significado original.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Seguimiento de un formato de prompt específico con system prompt y ejemplos few-shot.
- Producción de salidas concisas y controladas gracias a las penalizaciones de longitud y copia introducidas en el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no documentada para este ajuste; los tags solo declaran inglés.

## Casos de uso

- Accesibilidad cognitiva: simplificar frases de documentos administrativos o educativos para lectores con dificultades de comprensión, aprovechando que el modelo ha sido optimizado con SARI y penalizaciones contra la copia literal.
- Adaptación de material didáctico: reescribir enunciados y textos de nivel avanzado a un registro más sencillo para estudiantes de primaria o secundaria, manteniendo el contenido semántico.
- Preprocesado para pipelines de TTS o subtitulado: generar versiones simplificadas de frases largas que se lean mejor en síntesis de voz o en subtítulos con restricciones de longitud.
- Generación de texto claro en comunicación corporativa: transformar notas técnicas o comunicados en frases directas para audiencias no expertas.
- Investigación en RL para NLP: servir como checkpoint de referencia reproducible (código y paper públicos) para experimentar con recompensas basadas en SARI y estudiar el *reward hacking* en tareas de generación controlada.
- Evaluación de simplificación: usar el modelo como baseline o sistema candidato en experimentos de comparación con métricas SARI, BLEU o FKGL sobre ASSET u otros corpus de simplificación en inglés.
- Integración en editores asistidos: sugerir reescrituras frase a frase dentro de herramientas de edición, dado el formato de prompt cerrado y la expectativa de respuesta única y concisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 14-16 GB para un modelo de 7B parámetros, coherente con el tamaño del repo (15,6 GB en safetensors).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits, en torno a 4-5 GB (estimaciones genéricas para 7B, no verificadas para este checkpoint).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Despliegue: el autor usa vLLM para generación; al ser pesos safetensors de familia Llama, son compatibles con TGI, vLLM y, previa conversión, con llama.cpp u Ollama. No se publican variantes GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IberianLLM-ASSET-GRPO | 7B | No disponible | Simplificación EN con GRPO | Apache 2.0 | Hugging Face |
| IberianLLM-7B-Instruct (base) | 7B | No disponible | Instrucciones generales, familia ibérica | No disponible en la informacion | Hugging Face |
| Modelos de simplificación supervisados sobre ASSET | Variable | No disponible | Simplificación EN (SFT) | Variable | Depende del checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para simplificación de frases en inglés; su uso fuera de esa tarea o idioma no está validado.
- El prompt debe respetar el formato exacto de entrenamiento (system prompt con directrices y 3 ejemplos few-shot); otros formatos pueden degradar la calidad.
- Riesgo de alucinación y de deriva semántica: la optimización con SARI no garantiza preservación perfecta del significado en todos los casos.
- Las penalizaciones contra copia y longitud excesiva pueden producir simplificaciones demasiado agresivas en frases que no admiten una reducción clara.
- No se documentan sesgos específicos, pero al derivar de un modelo base de 7B y entrenarse sobre ASSET, puede heredar sesgos del corpus y del modelo original.
- El campo de parámetros en safetensors (266.240) es incoherente con el tamaño del repo y con un modelo de 7B; conviene verificar los pesos antes de desplegarlos en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse la licencia del modelo base y de los datos ASSET para cumplir sus condiciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/arnauad/IberianLLM-ASSET-GRPO
- Modelo base: https://huggingface.co/langtech-languagemodeling/IberianLLM-7B-Instruct
- Código: https://github.com/arnauad/simplification
- Paper: https://arxiv.org/abs/2609.04823
- Dataset: https://huggingface.co/datasets/facebook/asset
