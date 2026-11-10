# OpenLLM-France/Luciole-8B-KD-Math-Base

## Resumen

Luciole-8B-KD-Math-Base es un modelo de lenguaje causal de tipo base (no instruido) desarrollado por LINAGORA y el consorcio OpenLLM-France, en el marco del proyecto OpenLLM France financiado por BPI France a través del programa France 2030. Se entrenó en el supercomputador Jean Zay de GENCI, gestionado por IDRIS. El modelo deriva de Luciole-23B-Base mediante un proceso de destilación de conocimiento (knowledge distillation) siguiendo el enfoque Minitron, con un objetivo concreto: obtener un modelo de aproximadamente 8.000 millones de parámetros que mejore a Luciole-8B-Base en matemáticas conservando la mayor parte posible de su conocimiento general, sin necesidad de un preentrenamiento completo desde cero.

La receta de entrenamiento consistió en un preentrenamiento continuado de Luciole-23B-Base sobre una mezcla con alta proporción de contenido matemático (unos 50.000 millones de tokens) para producir un profesor; ese profesor se podó a aproximadamente 14.000 millones de parámetros y se destiló sobre una mezcla de corrección; finalmente se aplicó una segunda etapa de poda y destilación, usando siempre el modelo de 23B corregido como profesor, para generar el modelo final de 8B.

El modelo es relevante porque demuestra una vía eficiente para especializar un modelo grande en un dominio concreto (matemáticas) y transferir esa capacidad a un modelo mucho más pequeño sin reentrenar desde cero, manteniendo licencia Apache 2.0 y pesos abiertos en safetensors. Está pensado como base para fine-tuning posterior, no para uso directo en producción conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), derivada de Nemotron; destilada y podada desde Luciole-23B-Base |
| Parámetros totales | 8.360.209.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la model card menciona `load_in_4bit` como opción de carga, sin detallar esquemas soportados) |
| Idiomas soportados | francés (fr), inglés (en); posibles capacidades residuales en otros idiomas heredadas de Luciole-23B-Base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de aproximadamente 8.360 millones de parámetros, obtenido mediante poda estructurada y destilación de conocimiento del modelo Luciole-23B-Base siguiendo el enfoque Minitron (Sreenivas et al., 2024). El proceso se articuló en dos etapas: primero se realizó un preentrenamiento continuado del modelo de 23B sobre una mezcla con fuerte peso matemático de unos 50.000 millones de tokens para construir un profesor especializado; ese profesor se podó a unos 14.000 millones de parámetros y se destiló sobre una mezcla de corrección; posteriormente se aplicó una segunda ronda de poda y destilación, manteniendo el 23B corregido como profesor, hasta llegar a los 8B finales.

La model card no detalla la composición exacta del dataset de corrección (más allá de indicar que es mayoritariamente en inglés), el número exacto de tokens de la segunda fase de destilación, ni los hiperparámetros de entrenamiento, que aparecen comentados en el documento. Tampoco se especifica si hubo fases de RLHF o DPO: el modelo es explícitamente una base preentrenada, y la model card recomienda aplicar instruction tuning y preference tuning (DPO, RLHF) como paso posterior. No se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva (predicción del siguiente token) como modelo base.
- Razonamiento matemático reforzado respecto a Luciole-8B-Base, gracias al preentrenamiento continuado sobre mezcla matemática y la destilación.
- Conocimiento general heredado de Luciole-23B-Base, preservado mediante destilación.
- Capacidades multilingües centradas en francés e inglés; posibles capacidades residuales en otros idiomas de la mezcla original de Luciole-23B-Base.
- Mayor proporción de datos de código que Luciole-23B-Base, aunque el autor advierte que no está optimizado para generación de código.
- No soporta tool calling ni function calling de forma nativa (es un modelo base sin instrucción).
- No soporta agentes ni razonamiento multi-paso de forma nativa sin fine-tuning.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Fine-tuning para tutoría matemática: el modelo puede servir como base para un asistente de resolución de problemas matemáticos en francés e inglés, aprovechando su especialización en ese dominio y aplicando después instruction tuning sobre pares pregunta-respuesta.
- Generación de problemas y ejercicios matemáticos: útil como generador de enunciados y soluciones razonadas en pipelines educativos, dado su sesgo hacia contenido matemático.
- Base para modelos instructivos en francés: partiendo de un checkpoint de 8B con licencia Apache 2.0, se puede aplicar SFT y DPO para construir un asistente conversacional francófono sin partir de un modelo propietario.
- Investigación en destilación y poda: el modelo es un caso de estudio reproducible del enfoque Minitron aplicado a un modelo multilingüe, útil para experimentos académicos sobre compresión de LLM.
- Evaluación comparativa de capacidades matemáticas: sirve como referencia para medir cuánto conocimiento matemático se puede transferir de un 23B a un 8B mediante destilación.
- Preentrenamiento continuado en dominios verticales: al ser una base con licencia permisiva y pesos abiertos, se puede continuar el preentrenamiento sobre corpus especializados (finanzas, derecho, ciencia) en francés.
- Generación de texto multilingüe en pipelines de datos: uso como modelo de aumento de datos o generación sintética en francés e inglés tras un ajuste mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB para pesos, más overhead.
- GPU recomendadas para fp16: A100 (40/80 GB), H100, L40S, o dos RTX 4090 en paralelo.
- Cabe en GPU de consumo: sí, en una RTX 4090 (24 GB) en fp16 con margen ajustado, o con holgura en cuantización 8/4 bits; también en RTX 3090 (24 GB).
- Opciones de despliegue: transformers (soporte nativo en la model card con `device_map="auto"` y `load_in_4bit=True`), vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luciole-8B-KD-Math-Base | 8,36B | no disponible | Matemáticas + multilingüe (fr/en) | Apache 2.0 | Hugging Face, safetensors |
| Luciole-8B-Base | no disponible | no disponible | Base multilingüe fr/en | Apache 2.0 | Hugging Face |
| Luciole-23B-Base | 23B (aprox.) | no disponible | Base multilingüe fr/en | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128K | Base generalista | Llama 3.1 Community License | Hugging Face |

La comparación con Llama 3.1 8B se ofrece como referencia de categoría (8B base); no se dispone de datos de benchmarks que permitan comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Es un modelo base: no está diseñado para generar texto directamente en casos de uso finales; requiere fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados, sin mitigaciones de alineación aplicadas.
- Sesgos conocidos: parte de los datos franceses provienen de obras de dominio público antiguas, con sesgos de épocas pasadas; el filtrado del dataset Luciole es un proyecto en curso.
- Puede generar contenido tóxico u ofensivo pese a los esfuerzos de filtrado del dataset original.
- Rendimiento inferior esperado en idiomas distintos del francés y el inglés sin entrenamiento adicional.
- No optimizado para generación de código, pese a la mayor proporción de datos de código frente a Luciole-23B-Base.
- Longitud de contexto no documentada en la información disponible; conviene verificarla antes de desplegar en tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda aplicar DPO/RLHF antes de cualquier despliegue en producción.
- No se documentan esquemas de cuantización oficiales ni checkpoints GGUF en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-8B-KD-Math-Base
- Modelo base (profesor): https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de entrenamiento Luciole: https://huggingface.co/datasets/OpenLLM-France/Luciole-Training-Dataset
- Paper del enfoque Minitron: https://arxiv.org/pdf/2408.11796
- Referencia arXiv asociada en tags: arxiv:2408.11796
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
