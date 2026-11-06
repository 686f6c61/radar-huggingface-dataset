# jaydeepb/llama-3.2-1b-fineweb-run1

## Resumen

Llama-3.2-1B-fineweb-run1 es un ajuste fino (fine-tuning) de meta-llama/Llama-3.2-1B realizado por el usuario jaydeepb y publicado en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación: el modelo se entrenó durante una época sobre una muestra de 1 millón de secuencias de 128 tokens del dataset FineWeb (HuggingFaceFW/fineweb). Su propósito principal es servir como base para estudiar la memorización extractable en modelos de lenguaje, un tema relevante para la privacidad y la seguridad de los LLM.

El proyecto forma parte de un diseño experimental con dos ejecuciones paralelas: este modelo (run1) genera etiquetas de memorización extractable (mediante decodificación greedy con k=50 y l=50) que se utilizan para entrenar un clasificador que predice memorización, mientras que el modelo run2, entrenado sobre una muestra disjunta de 1 millón de secuencias, actúa como conjunto de evaluación held-out. Esto permite validar si el clasificador generaliza a datos no vistos.

La relevancia de esta ficha para desarrolladores es limitada en cuanto a uso productivo: el modelo hereda la arquitectura Llama 3.2 (transformer decoder, 1.24 mil millones de parámetros reales según los safetensors) y la licencia Llama 3.2, pero su entrenamiento adicional sobre una muestra reducida y con secuencias cortas lo hace más adecuado para experimentos de investigación sobre memorización que para tareas de generación de texto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con seq len 128; contexto del modelo base no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, 2,5 GB de repo) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, corpus principalmente en ingles) |
| Licencia | Llama 3.2 (llama3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B, un transformer decoder unimodal de la familia Llama 3.2 de Meta. Sobre esa base se aplicó un fine-tuning de una sola época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas de FineWeb, un corpus web masivo curado por Hugging Face compuesto principalmente por texto en ingles filtrado de CommonCrawl. Los hiperparámetros publicados son: learning rate 5e-5, planificador de learning rate coseno y semilla 42.

La innovación técnica no está en la arquitectura sino en el diseño experimental: run1 se usa para extraer etiquetas de memorización extractable mediante decodificación greedy con ventana k=50 y l=50 (es decir, se comprueba si el modelo reproduce secuencias del entrenamiento), y esas etiquetas alimentan el entrenamiento de un clasificador de memorización. El modelo run2, entrenado sobre una muestra disjunta, proporciona la evaluación held-out. No se menciona RLHF, DPO ni alineamiento posterior; el modelo es esencialmente un modelo base ajustado a datos web crudos.

## Capacidades

- Generacion de texto continuo en estilo web (FineWeb), con tendencia esperable a reproducir fragmentos del conjunto de entrenamiento.
- Capacidades heredadas de Llama-3.2-1B en general (razonamiento basico, codigo, matematicas elementales), aunque probablemente degradadas por el fine-tuning sobre secuencias cortas de texto web.
- Sin soporte documentado de tool calling / function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso estructurado.
- Sin capacidades de vision ni audio (modelo unimodal de texto).
- Utilidad principal: servir como sujeto experimental para medir y predecir memorización extractable (k=50, l=50 greedy).

## Casos de uso

- Investigacion sobre memorizacion: analizar que secuencias del corpus de entrenamiento son extraibles con decodificacion greedy, util para estudios de privacidad y extraccion de datos de entrenamiento.
- Entrenamiento de clasificadores de memorizacion: las etiquetas generadas por este modelo sirven como dato supervisado para entrenar predictores de memorizacion, como hace el propio autor del repositorio.
- Evaluacion held-out de generalizacion: combinado con run2, permite comprobar si un clasificador de memorizacion entrenado en run1 generaliza a datos nuevos.
- Benchmark de metodologias de deteccion de memorizacion: comparar metricas de extraccion (k, l, greedy vs. sampling) sobre un modelo pequeno y barato de ejecutar.
- Docencia y prototipado: por su tamano de 1,24B parametros y 2,5 GB, es practico para laboratorios y demos sobre riesgos de memorizacion en LLM.
- Estudio de efectos del fine-tuning sobre datos web crudos: observar como una epoca sobre FineWeb con secuencias de 128 tokens altera el comportamiento del modelo base.

No es adecuado para atencion al cliente, generacion de codigo en produccion ni asistentes conversacionales: no hay evidencia de alineamiento ni de optimizacion para esos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5-3 GB (el repo ocupa 2,5 GB en safetensors), mas overhead de activaciones y KV cache.
- Con cuantizacion a 8 bits: en torno a 1,5 GB; a 4 bits (si se genera cuantizacion GGUF por parte de la comunidad): por debajo de 1 GB, aunque no hay cuantizaciones oficiales publicadas.
- Cabe comodamente en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, e incluso en portatiles con GPU de 4 GB o en CPU con suficiente RAM.
- GPUs de datacenter (A100, H100) no son necesarias; el modelo es ejecutable en hardware de gama baja.
- Despliegue: compatible con transformers (libreria declarada en la model card), y por extension con vLLM, TGI, llama.cpp (tras conversion a GGUF) y Ollama, dado que es un modelo de la familia Llama; no hay configuraciones oficiales publicadas para ninguno de estos runtimes.
- Latencia y throughput: no disponible; por su tamano de ~1,2B parametros cabe esperar latencias bajas y throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-fineweb-run1 | 1,24B | no disponible (seq len de entrenamiento: 128) | Llama 3.2 | Investigacion sobre memorizacion |
| meta-llama/Llama-3.2-1B (base) | 1,24B | 128K tokens | Llama 3.2 | Modelo base de proposito general |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K tokens | Llama 3.2 | Asistente conversacional |

Frente a los modelos oficiales de Meta, esta variante no aporta mejoras de capacidad general: su valor diferencial es el entrenamiento documentado y reproducible sobre una muestra concreta de FineWeb, necesario para los experimentos de memorizacion. Para cualquier aplicacion practica, los modelos base o Instruct de Llama 3.2 son superiores.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion y de reproduccion literal de texto web: el modelo fue entrenado sobre corpus web crudo sin alineamiento (sin RLHF ni DPO) y con el objetivo explicito de estudiar memorizacion; puede verbatim-repetir fragmentos de FineWeb, con las implicaciones de privacidad y copyright que ello conlleva.
- Entrenamiento con secuencias de solo 128 tokens: el comportamiento del modelo en contextos largos puede degradarse respecto al modelo base.
- Idiomas: el corpus FineWeb es principalmente en ingles; no hay garantias de rendimiento en castellano ni en otros idiomas.
- Licencia Llama 3.2: el uso comercial esta permitido bajo la licencia de Meta, pero con restricciones (politica de uso aceptable, requisitos de atribucion y limites para ciertos usuarios con mas de 700 millones de usuarios activos mensuales). Conviene revisar la licencia completa antes de cualquier despliegue.
- Sin benchmarks publicados ni evaluaciones de seguridad: no se conocen sus tasas de sesgo, toxicidad o veracidad.
- Baja traccion comunitaria (318 descargas, 0 likes en el momento de la ficha): escaso soporte, sin cuantizaciones de terceros documentadas y sin model card detallada mas alla de los hiperparámetros de entrenamiento.
- No apto para produccion: es un artefacto experimental de investigacion, no un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/llama-3.2-1b-fineweb-run1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo run2 (evaluacion held-out): no disponible (no se ha proporcionado enlace directo; puede localizarse en el perfil del autor: https://huggingface.co/jaydeepb)
- Paper, blog o demo: no disponible
