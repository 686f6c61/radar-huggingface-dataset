# secretmoon/Giga-Embeddings-instruct-10B-A1.8B-NVFP4

## Resumen

Giga-Embeddings-instruct-10B-A1.8B-NVFP4 es una cuantización NVFP4 de los expertos enrutados del modelo de embeddings ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826, desarrollado originalmente por AI-Sage y publicado bajo licencia MIT. El checkpoint ha sido producido por el usuario secretmoon y mantiene la arquitectura Mixture-of-Experts (MoE) del modelo base, con 25 capas MoE de 64 expertos enrutados cada una, mientras que atención, routers, expertos compartidos, la primera MLP densa, los embeddings de tokens y las normalizaciones se conservan en BF16.

El modelo genera embeddings de 1536 dimensiones, normalizados en L2, mediante atención bidireccional y mean pooling enmascarado. Está orientado a tareas de recuperación de información y similitud semántica en ruso e inglés, con soporte de instrucciones de consulta mediante la plantilla `Instruct: {task}\nQuery: {text}`. Su interés radica en que reduce el coste de memoria de un modelo MoE de embeddings de gran tamaño hasta el punto de ejecutarse en una GPU de consumo como la GeForce RTX 5060 Ti de 16 GB, con pérdidas de calidad medidas inferiores a 0,21 puntos porcentuales en las tareas evaluadas.

La cuantización se realizó con NVIDIA Model Optimizer 0.39.0 usando `NVFP4_DEFAULT_CFG` limitado a los expertos enrutados, sin búsqueda guiada por benchmarks ni actualizaciones de gradiente. El checkpoint está pensado para servirse con vLLM 0.33.0 y el backend nativo B12X de NVFP4 para MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención bidireccional (tipo deepseek_v3_bidirec), 25 capas MoE de 64 expertos enrutados |
| Parametros totales | 5.756.940.800 (según safetensors); el nombre del modelo base indica 10B-A1.8B |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~1.8B activos) |
| Longitud de contexto | 8192 tokens en la configuración de servicio probada; calidad evaluada a 512 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados (bloque 16, E2M1, escalas de bloque E4M3, escalas globales FP32); resto en BF16 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (dos ficheros empaquetados, 6.880 GiB / 7.387.346.352 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de tipo DeepSeek V3 adaptada a atención bidireccional para generación de embeddings. Cada una de las 25 capas MoE contiene 64 expertos enrutados con tres proyecciones cada una, lo que da un total de 4800 matrices empaquetadas en la versión cuantizada. La salida se obtiene mediante mean pooling enmascarado y normalización L2, produciendo vectores de 1536 dimensiones. La atención, los routers, los expertos compartidos, la primera MLP densa, los embeddings de tokens y las capas de normalización permanecen en BF16.

La cuantización NVFP4 se aplicó exclusivamente a los expertos enrutados mediante NVIDIA Model Optimizer 0.39.0 con la configuración `NVFP4_DEFAULT_CFG` y calibración máxima. La calibración se ejecutó en una A100 SXM4 de 80 GB con torch 2.9.1+cu126 y transformers 4.57.6, sobre 1024 textos (512 en ruso y 512 en inglés, mitad consultas con instrucción y mitad documentos sin instrucción), semilla 42, máximo 512 tokens y batch de calibración 8. Las fuentes de calibración fueron una derivada del split de entrenamiento de MIRACL RU y MS MARCO v1.1 train, excluyendo coincidencias exactas normalizadas con el texto de evaluación. Se ejercitaron los 1600 expertos enrutados (conteo mínimo observado 40, mediana 4930). No se realizaron actualizaciones de gradiente ni búsqueda de cuantización guiada por benchmarks. La preparación de fusión de ModelOpt alineó las escalas globales de peso de gate/up antes de la evaluación y exportación.

## Capacidades

- Generación de embeddings de texto de 1536 dimensiones, normalizados en L2, para similitud semántica y recuperación de información.
- Codificación asimétrica consulta/documento: las consultas usan la plantilla `Instruct: {task}\nQuery: {text}` y los documentos se codifican sin instrucción.
- Soporte bilingüe ruso-inglés, con calibración y evaluación específicas en ambos idiomas.
- Atención bidireccional con mean pooling enmascarado, adecuada para tareas de representación de frases y pasajes.
- No es un modelo generativo: no soporta tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de modo thinking, visión ni audio.
- Compatible con el endpoint de embeddings de la API OpenAI servida por vLLM.

## Casos de uso

- Búsqueda semántica en ruso e inglés: indexar un corpus documental con embeddings de 1536 dimensiones y recuperar pasajes relevantes mediante similitud coseno, usando la plantilla de instrucción para las consultas. El modelo está evaluado en RuBQRetrieval (nDCG@10 de 80,872 en NVFP4 desplegado).
- Sistemas RAG (generación aumentada por recuperación): usar el modelo como recuperador denso en pipelines que combinan un LLM generador con una base vectorial, aprovechando el soporte bilingüe para corpus mixtos ruso-inglés.
- Deduplicación y agrupación de documentos: calcular embeddings de pasajes y agrupar por similitud para eliminar contenido redundante o construir clústeres temáticos en corpus de noticias, soporte técnico o documentación interna.
- Clasificación semántica zero-shot: comparar embeddings de textos con embeddings de etiquetas descriptivas para asignar categorías sin entrenamiento supervisado adicional.
- Motor de búsqueda interno empresarial: desplegar el modelo con vLLM en una GPU de 16 GB para servir embeddings a baja latencia en aplicaciones de búsqueda sobre documentación corporativa en ruso e inglés.
- Filtrado y ranking de candidatos en pipelines de moderación o recomendación: usar la similitud coseno entre consultas y documentos para un primer ranking antes de un reranker más costoso.
- Evaluación de similitud textual en investigación: medir correlación de Spearman en pares de frases para tareas de paráfrasis o evaluación de traducciones en ruso e inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card (puntuaciones multiplicadas por 100; máximo 512 tokens; no es la suite MTEB completa):

| Tarea | Métrica | BF16 / A100 | NVFP4 simulado / A100 | NVFP4 / RTX 5060 Ti | Delta nativo (pp) |
|---|---|---:|---:|---:|---:|
| RuSTSBenchmarkSTS | cosine_spearman | 83,629 | 83,622 | 83,735 | +0,106 |
| STSBenchmark | cosine_spearman | 87,353 | 87,316 | 87,327 | -0,026 |
| RuBQRetrieval | ndcg_at_10 | 81,041 | 80,823 | 80,872 | -0,169 |
| SciFact | ndcg_at_10 | 75,643 | 75,799 | 75,435 | -0,208 |

Cambio medio nativo no ponderado: -0,074 puntos porcentuales. Umbrales de aceptación predefinidos: pérdida media ≤0,5 puntos y ninguna tarea con pérdida >1 punto; ambos cumplidos. Intervalos de confianza al 95% por bootstrap emparejado (2000 réplicas) para la diferencia nativo menos BF16:

- RuSTSBenchmarkSTS: [-0,052; +0,269] pp.
- STSBenchmark: [-0,154; +0,096] pp.
- RuBQRetrieval: [-0,406; +0,080] pp.
- SciFact: [-0,731; +0,272] pp.

Tamaños de evaluación: RuSTSBenchmarkSTS 1264 pares; STSBenchmark 1379 pares; RuBQRetrieval 1692 consultas / 56826 documentos; SciFact 300 consultas / 5183 documentos. La comparación nativa incluye diferencias de runtime y hardware (A100 frente a RTX 5060 Ti), no solo de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos empaquetados ocupan 6.880 GiB; con overhead de runtime y caché KV para 8192 tokens, el modelo se sirvió con `--gpu-memory-utilization 0.85` en una GPU de 16 GB.
- GPU recomendadas: GeForce RTX 5060 Ti 16 GB (configuración probada con vLLM 0.33.0 y backend B12X); A100 SXM4 80 GB usada para calibración y evaluación BF16/simulada.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti de 16 GB según la model card; no se han publicado pruebas en otras GPU de consumo.
- Opciones de despliegue: vLLM 0.33.0 con `vllm[b12x]`, `--runner pooling --convert embed`, `--quantization modelopt_fp4 --moe-backend b12x`, `--trust-remote-code` y `--hf-overrides '{"model_type":"deepseek_v3","auto_map":null}'`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card menciona mediciones end-to-end en localhost con una petición de calentamiento y tres repeticiones, pero los valores numéricos no están incluidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|---|
| secretmoon/Giga-Embeddings-instruct-10B-A1.8B-NVFP4 | 5.756.940.800 (según safetensors) | 8192 tokens en servicio | ru, en | MIT | safetensors NVFP4 | RuSTS, STS, RuBQ, SciFact |
| ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826 (base) | 10B-A1.8B (según nombre) | no disponible | ru, en | MIT | safetensors BF16 | no disponible en la información proporcionada |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación cubre solo cuatro splits de tareas (RuSTSBenchmarkSTS, STSBenchmark, RuBQRetrieval, SciFact) y no la suite MTEB completa; los resultados no garantizan ausencia de pérdida en otras tareas.
- La comparación nativa NVFP4 frente a BF16 incluye diferencias de hardware (RTX 5060 Ti frente a A100) y de runtime (vLLM/B12X frente a Transformers), por lo que no aísla el efecto puro de la cuantización.
- El modelo solo soporta ruso e inglés; no se ha evaluado su comportamiento en otros idiomas.
- Al ser un modelo de embeddings, no genera texto y no puede usarse para tareas generativas, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en sentido generativo, pero la similitud semántica puede producir recuperaciones irrelevantes en dominios muy alejados de los datos de calibración (MIRACL RU y MS MARCO).
- La calibración excluyó coincidencias exactas normalizadas con el texto de evaluación, pero no se garantiza deduplicación semántica ni conocimiento de los datos de entrenamiento originales del modelo base.
- El despliegue probado requiere vLLM 0.33.0 con el backend B12X y `VLLM_PLUGINS=''` para suprimir entry points obsoletos; otras versiones o backends no están validadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08; se trata de un checkpoint de terceros, no del autor original del modelo base.
- La licencia MIT del modelo base se mantiene, pero conviene verificar los términos de los datasets de calibración (MIRACL RU y MS MARCO) para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/secretmoon/Giga-Embeddings-instruct-10B-A1.8B-NVFP4
- Modelo base: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-10B-A1.8B-0826
- Colección Giga-Embeddings de AI-Sage: https://huggingface.co/collections/ai-sage/giga-embeddings
- Dataset de calibración MIRACL RU: https://huggingface.co/datasets/Hieuman/ru_MIRACL
- Dataset de calibración MS MARCO v1.1: https://huggingface.co/datasets/microsoft/ms_marco
