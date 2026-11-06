# mutli-adapter-routing/multi-adapter

## Resumen
El repositorio `mutli-adapter-routing/multi-adapter` no es un modelo entrenado desde cero, sino un conjunto de artefactos de adaptación y enrutamiento construidos sobre `meta-llama/Llama-3.2-3B`. Incluye dos adaptadores LoRA de dominio (matemáticas y código), un adaptador híbrido generado mediante TIES-merging y tres artefactos de enrutamiento (un router sintáctico TF-IDF + regresión logística, centroides semánticos de 768 dimensiones y un meta-clasificador Random Forest de 6 dimensiones). El objetivo es seleccionar dinámicamente el adaptador más adecuado por consulta, manteniendo un único modelo base en memoria.

La propuesta resulta relevante para despliegues con recursos limitados: permite especializar un modelo de 3B parámetros en dos dominios y conmutar entre ellos en aproximadamente 2,44 ms mediante `set_adapter()` de PEFT, sin recargar pesos del modelo base. Frente a servir tres modelos completos, el enfoque reduce el consumo de VRAM y simplifica la operación, a costa de depender de la calidad de los routers para elegir el adaptador correcto.

El repositorio tiene un tamaño de 0,6 GB y se publica bajo licencia `llama3.2`, heredada del modelo base. No se han publicado resultados de benchmarks ni métricas de precisión del enrutamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptadores LoRA PEFT |
| Parámetros totales | 3B (modelo base `meta-llama/Llama-3.2-3B`); adaptadores LoRA con r=32 |
| Parámetros activos | no disponible (no es MoE; los adaptadores se conmutan, no se suman en cómputo) |
| Longitud de contexto | no disponible en la información del repositorio (el modelo base Llama 3.2 3B soporta 128k tokens, pero no se confirma aquí) |
| Tipos de cuantización | QLoRA 4-bit NormalFloat (NF4) durante entrenamiento; el repositorio no especifica cuantizaciones de inferencia |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptadores PEFT) y joblib/npy (artefactos de enrutamiento) |

## Arquitectura y entrenamiento
El modelo base es `meta-llama/Llama-3.2-3B`, un transformer decoder-only. Sobre él se entrenan dos adaptadores LoRA con rango 32, alpha 64, dropout 0,0 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con QLoRA de 4 bits NF4 en una GPU NVIDIA T4 de Google Colab, optimizador `adamw_torch`, learning rate de 3e-4 con scheduler coseno y 50 pasos de warmup, batch efectivo de 16, longitud máxima de secuencia de 512, una época y precisión FP16. Se aplicó enmascaramiento de pérdida (-100) a los tokens de prompt.

El adaptador de matemáticas se entrenó con 7.500 muestras de `openai/gsm8k`; el de código, con 15.000 muestras de Python filtradas por longitud de `m-a-p/CodeFeedback-Filtered-Instruction`. El adaptador híbrido `hybrid_ties_code_math_3b` se obtiene por TIES-merging offline de ambos, con densidad 0,8 y pesos 0,5/0,5. El enrutamiento combina tres piezas: un vectorizador TF-IDF (n-gramas de 1 a 3, 10.000 características) con clasificador de regresión logística (`syntax_router.joblib`), centroides de dominio de 768 dimensiones calculados con `sentence-transformers/all-mpnet-base-v2` (`semantic_centroids.npy`) y un meta-clasificador Random Forest de 6 dimensiones (`n_estimators=100`, `max_depth=4`) en `meta_router.joblib`.

## Capacidades
- Generación de texto con el modelo base Llama 3.2 3B.
- Razonamiento matemático mediante el adaptador `math_adapter_3b`, entrenado sobre GSM8K.
- Generación de código Python mediante `code_adapter_3b`, entrenado sobre CodeFeedback filtrado.
- Capacidad combinada de matemáticas y código con el adaptador híbrido TIES.
- Conmutación dinámica de adaptador por consulta con `set_adapter()` en aproximadamente 2,44 ms.
- Desactivación de adaptadores con `disable_adapter()` para consultas generales.
- Enrutamiento por sintaxis (TF-IDF + regresión logística), por similitud semántica (centroides de 768 dimensiones) y meta-clasificación (Random Forest de 6 características).
- Tool calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso
- Enrutamiento de consultas matemáticas y de código en un único endpoint: el meta-router clasifica la consulta y activa `math`, `code` o `hybrid` antes de generar, evitando mantener tres modelos en VRAM.
- Asistente de resolución de problemas de GSM8K en producción educativa: el adaptador de matemáticas se entrena específicamente sobre ese dataset y puede activarse solo para consultas de ese dominio.
- Generación de código Python en pipelines internos: el adaptador de código, entrenado con 15.000 muestras filtradas, se activa cuando el router sintáctico detecta indicios de código (palabras clave, sintaxis, bloques).
- Servicio multi-tenant con cuotas de VRAM: al compartir un único Llama 3.2 3B en FP16 y montar los tres adaptadores, el coste de memoria adicional es el de los pesos LoRA, no el de tres modelos completos.
- Clasificación previa de consultas en un sistema RAG: el router TF-IDF puede usarse como filtro barato antes de invocar el modelo generativo, reduciendo el número de generaciones innecesarias.
- Experimentación académica sobre merging de adaptadores: el adaptador híbrido TIES con densidad 0,8 y pesos 0,5/0,5 sirve como referencia reproducible para comparar merging frente a enrutamiento dinámico.
- Despliegue en GPU de consumo: al partir de un modelo de 3B en FP16 y adaptadores LoRA, el conjunto cabe en GPUs consumer con suficiente VRAM, aunque no se publican cifras exactas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión del router, latencia de generación ni comparativas con otros adaptadores.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, Llama 3.2 3B en FP16 requiere aproximadamente 6-7 GB solo para pesos, más overhead de activaciones y caché KV; los adaptadores LoRA con r=32 añaden una fracción pequeña sobre esa base.
- GPU de entrenamiento utilizada: NVIDIA T4 (Google Colab) con QLoRA de 4 bits.
- GPU recomendadas para inferencia: no especificadas por el autor; por tamaño, cabría en RTX 3090, RTX 4090, A10, L4, A100 y H100, pero no se confirma.
- Cabe en GPU consumer: probablemente sí en modelos con 12 GB o más en FP16, y en 8 GB con cuantización, aunque no se aportan mediciones.
- Opciones de despliegue: PEFT + Transformers (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible. Los adaptadores son compatibles con el ecosistema PEFT, pero el enrutamiento con joblib requiere código propio.
- Latencia y throughput: solo se reporta el tiempo de conmutación de adaptador, aproximadamente 2,44 ms. No hay datos de latencia de generación ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multi-adapter (este repo) | 3B base + LoRA r=32 | no disponible | Matemáticas + código con enrutamiento dinámico | llama3.2 | Hugging Face, PEFT |
| meta-llama/Llama-3.2-3B | 3B | 128k (según model card oficial del base) | Generalista | llama3.2 | Hugging Face |
| Adaptador LoRA único de dominio | 3B base + LoRA | depende del base | Un solo dominio | depende del base | Hugging Face |
| Mezcla estática de adaptadores (sin router) | 3B base + LoRA fusionado | depende del base | Multidominio sin selección por consulta | depende del base | Hugging Face |

La comparación con alternativas concretas de la misma categoría (por ejemplo, otros repositorios de enrutamiento de adaptadores o modelos especializados de 3B en matemáticas y código) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- El repositorio no incluye métricas de precisión del router; un enrutamiento erróneo degrada la respuesta al aplicar el adaptador equivocado.
- Los adaptadores se entrenaron con una sola época, longitud máxima de 512 tokens y datasets pequeños (7.500 y 15.000 muestras), lo que limita la generalización fuera de GSM8K y del subconjunto de CodeFeedback.
- El adaptador de código está restringido a Python; no se documenta soporte para otros lenguajes.
- No se especifican los idiomas soportados; el comportamiento multilingüe no está garantizado más allá del modelo base.
- La licencia `llama3.2` impone las condiciones de Meta para Llama 3.2, incluidos requisitos de atribución y restricciones de uso comercial; conviene revisarlas antes de producción.
- El enrutamiento depende de artefactos joblib y numpy que deben servirse junto con los adaptadores; no es un pipeline estándar de Transformers.
- Riesgo de alucinación inherente al modelo base de 3B, no mitigado por los adaptadores.
- No hay información sobre sesgos evaluados, red teaming ni filtros de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mutli-adapter-routing/multi-adapter
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset matemáticas: https://huggingface.co/datasets/openai/gsm8k
- Dataset código: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Modelo de embeddings para centroides: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Documentación de enrutamiento multi-modelo en llm-d: https://llm-d.ai/docs/dev/operations/traffic/multi-model-routing
- Guía de model routing en Wave (AI-as-Code): https://re-cinq.github.io/wave/guide/model-routing.html
