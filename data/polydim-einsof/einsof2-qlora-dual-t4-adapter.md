# Polydim-Einsof/einsof2-qlora-dual-t4-adapter

## Resumen

Einsof-II es un adaptador LoRA entrenado por Polydim-Einsof sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El adaptador se distribuye en formato safetensors y se enmarca en un conjunto de convenciones propias del autor (etiquetadas como pmtp, stiefel, einsof-ii, mathesis y radical-honesty) que apuntan a un entrenamiento con restricciones geométricas de tipo Stiefel sobre los pesos del adaptador. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo resuelve, según la información disponible, el ajuste fino del modelo base sobre un dataset unificado de 1.812 muestras denominado `Polydim-Einsof/einsof2-training-datasets`. El entrenamiento se realizó en una configuración de dos GPU NVIDIA Tesla T4 en Kaggle, con un loss de entrenamiento reportado de 0,5710. La relevancia actual es limitada: se trata de un adaptador de nicho, sin descargas ni likes, y la model card no documenta capacidades, idiomas ni evaluaciones de calidad.

La información pública es escasa y muy centrada en métricas de entrenamiento (defecto isométrico de Stiefel, tier de precisión) más que en comportamiento del modelo. Por tanto, esta ficha distingue explícitamente entre lo que declara el autor y lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens; el adaptador no declara cambios) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el entrenamiento se hizo en QLoRA sobre T4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1,5 mil millones de parámetros. El adaptador en sí es un LoRA de bajo rango. La model card menciona "geometría de Stiefel St(k, d)", "Protocolo Fantasma (Ghost Protocol)" y "arquitectura de Dos Módulos Interconectados (Atelier Co-Design)", pero no detalla la implementación: no se especifica el rango del adaptador, las capas objetivo, el alpha, el dropout ni la función de pérdida exacta. La referencia a Stiefel sugiere una parametrización ortonormal de los factores del adaptador, pero es una interpretación y no un dato confirmado en la información disponible.

El entrenamiento se realizó sobre el dataset `Polydim-Einsof/einsof2-training-datasets`, con 1.812 muestras, en una configuración de dos Tesla T4 (Kaggle). Se reporta un loss de entrenamiento de 0,5710 y un "defecto isométrico Stiefel" de 2,7743304968121066e-16, clasificado como `TIER_MACHINE_EPS_16` (piso de mantisa IEEE 754). No se documentan número de tokens, composición del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa. El "Exit Code: 0" se presenta como cumplimiento de una "Regla Constitucional 1" de honestidad radical, un criterio propio del autor sin definición pública en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-1.5B-Instruct, sujetos al ajuste fino con 1.812 muestras.
- No se documentan capacidades específicas añadidas por el adaptador (código, matemáticas, visión, audio) en la model card.
- Soporte de tool calling / function calling: no disponible en la información del adaptador; el modelo base Qwen2.5-1.5B-Instruct lo soporta de forma nativa, pero no se confirma que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base es multilingüe, pero el adaptador no declara idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Prototipado de ajuste fino con QLoRA en hardware limitado: el adaptador sirve como referencia de un entrenamiento LoRA ejecutado en dos T4, útil para reproducir pipelines de bajo coste en Kaggle o entornos equivalentes.
- Investigación sobre parametrizaciones geométricas: la métrica de defecto isométrico Stiefel reportada permite estudiar la estabilidad numérica de adaptadores con restricciones ortonormales.
- Experimentos de alineación con datasets pequeños: con 1.812 muestras, el adaptador es adecuado para estudiar cómo un corpus reducido modifica el comportamiento del modelo base en tareas concretas.
- Evaluación de "honestidad radical" como criterio de entrenamiento: el autor propone reglas constitucionales; el adaptador puede usarse para comparar respuestas frente al modelo base sin ajustar.
- Base para ablaciones: al ser un LoRA sobre Qwen2.5-1.5B-Instruct, permite comparar variantes de rango, inicialización o regularización geométrica sobre el mismo corpus.
- Despliegue experimental en entornos con GPU de gama media: el modelo base de 1,5B y un adaptador de 0,1 GB caben en GPUs consumer, lo que facilita pruebas de inferencia locales con llama.cpp u Ollama tras la fusión y conversión a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento: loss de 0,5710 y defecto isométrico Stiefel de 2,7743304968121066e-16. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador. Como referencia, el modelo base Qwen2.5-1.5B-Instruct requiere aproximadamente 3 GB en FP16 y alrededor de 1-1,5 GB en cuantización de 4 bits; el adaptador añade una fracción pequeña (repo de 0,1 GB).
- GPU recomendadas: no declaradas por el autor. El entrenamiento se realizó en dos NVIDIA Tesla T4 (16 GB cada una).
- GPU consumer: el modelo base de 1,5B cabe en GPUs consumer con 4-8 GB de VRAM tras cuantización; el adaptador no cambia sustancialmente este requisito.
- Opciones de despliegue: no documentadas para el adaptador. Para el modelo base son habituales vLLM, llama.cpp, Ollama y TGI, pero no se confirma compatibilidad del adaptador fusionado con cada uno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Einsof-II LoRA (este) | Adaptador sobre 1,5B | No disponible | Apache 2.0 | safetensors | 1.812 muestras, loss 0,5710, sin benchmarks |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | Hasta 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con benchmarks publicados por Qwen |
| Adaptadores LoRA genericos sobre Qwen2.5-1.5B | Variable | Depende del base | Variable | safetensors | Ecosistema amplio en Hugging Face; calidad dependiente del dataset |

La comparación directa con otros adaptadores no es posible con la información disponible, ya que no hay benchmarks ni métricas de calidad publicadas para Einsof-II.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones de calidad publicadas; no se puede afirmar que el adaptador mejore al modelo base en ninguna tarea concreta.
- El dataset de entrenamiento tiene solo 1.812 muestras, lo que limita la cobertura y aumenta el riesgo de sobreajuste y de degradación en dominios no representados.
- No se documentan sesgos conocidos, pero el modelo base Qwen2.5-1.5B-Instruct puede heredar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: no evaluado; el ajuste fino con un corpus pequeño no garantiza reducción de alucinaciones y puede amplificarlas si el dataset contiene afirmaciones no verificadas.
- Idiomas soportados no declarados; el comportamiento multilingüe del adaptador es incierto aunque el base sea multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del adaptador en producción.
- Las etiquetas y conceptos propios del autor (pmtp, stiefel, radical-honesty, "Regla Constitucional 1") no están definidos públicamente en la información disponible, lo que dificulta la reproducibilidad.
- El repositorio no tiene descargas ni likes, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-qlora-dual-t4-adapter
- Dataset de entrenamiento citado: https://huggingface.co/datasets/Polydim-Einsof/einsof2-training-datasets
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
