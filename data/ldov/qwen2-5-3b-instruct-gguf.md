# ldov/Qwen2.5-3B-Instruct-GGUF

## Resumen

Qwen2.5-3B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Qwen2.5-3B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. El repositorio concreto analizado (ldov/Qwen2.5-3B-Instruct-GGUF) es una publicacion de terceros que redistribuye los pesos del modelo base en multiples niveles de cuantizacion, pensada para ejecucion local en CPU y GPU de gama media mediante llama.cpp y otros runners compatibles. El modelo resuelve tareas de generacion de texto conversacional, razonamiento, codigo y matematicas con un coste de inferencia muy reducido.

Hablamos de un transformer causal de 3.397.103.616 parametros (3.09B segun la model card original, 2.77B excluyendo embeddings), con 36 capas, atencion por consultas agrupadas (GQA) de 16 cabezas para Q y 2 para KV, RoPE, SwiGLU, RMSNorm y embeddings atados. Su ventana de contexto es de 32.768 tokens con hasta 8.192 tokens de generacion, lo que lo situa en la gama de modelos pequenos aptos para equipos de consumo.

Su relevancia ahora radica en que comprime un modelo de la familia Qwen2.5 a un tamano ejecutable en portatiles y mini-PC sin GPU dedicada (desde cuantizaciones q2_K), manteniendo soporte multilingue declarado de mas de 29 idiomas y una ventana de contexto amplia para su categoria. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y tied word embeddings |
| Parametros totales | 3.397.103.616 (3.09B segun model card; 2.77B sin embeddings) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens; generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | El modelo base declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe y otros); las etiquetas de este repositorio indican solo "en" |
| Licencia | qwen-research (etiquetada como "other" con license_name qwen-research) |
| Numero de capas | 36 |
| Cabezas de atencion | GQA: 16 para Q, 2 para KV |
| Formato de pesos | GGUF (cuantizado) |
| Tamano del repositorio | 25,2 GB (incluye todas las cuantizaciones publicadas) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct original: un transformer causal decoder-only con normalizacion RMSNorm pre-norm, activacion SwiGLU en las capas feed-forward, embeddings de posicion rotatorios (RoPE) y sesgo en las proyecciones QKV de la atencion. Emplea atencion por consultas agrupadas (GQA) con 16 cabezas de consulta y solo 2 de clave/valor, lo que reduce drasticamente el tamano de la cache KV durante la inferencia. Los embeddings de entrada y de salida estan atados (tied word embeddings).

Respecto al entrenamiento, el modelo base Qwen2.5-3B-Instruct se sometio a preentrenamiento seguido de post-entrenamiento (instruccion y alineacion), segun la model card de la familia Qwen2.5. La documentacion oficial indica mejoras frente a Qwen2 en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de textos largos (mas de 8.000 tokens), comprension de datos estructurados (tablas) y generacion de salidas estructuradas en JSON. Esta publicacion concreta no aporta detalles adicionales sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los metodos especificos de RLHF o DPO empleados; esa informacion no esta disponible en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento, codigo y matematicas mejorados respecto a Qwen2, segun la model card de la familia.
- Generacion de textos largos (mas de 8.000 tokens) y de salidas estructuradas, especialmente JSON.
- Comprension de datos estructurados como tablas.
- Mayor robustez frente a la diversidad de system prompts, lo que mejora la implementacion de role-play y el establecimiento de condiciones en chatbots.
- Soporte multilingue declarado para mas de 29 idiomas en el modelo base.
- Compatible con tool calling y function calling segun las capacidades de la familia Qwen2.5-Instruct (el repositorio no aporta plantilla de chat propia, se hereda del base).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se declaran capacidades de vision ni audio en este modelo.

## Casos de uso

- Asistente conversacional local en escritorio: ejecutable con llama.cpp en CPU o GPU de gama media, permite un chatbot privado sin conexion externa con contexto de 32K para conversaciones largas.
- Generacion de codigo en entornos con recursos limitados: puede integrarse en editores o scripts de autocompletado en maquinas sin GPU dedicada, usando la cuantizacion q4_K_M o q5_K_M.
- Procesamiento y extraccion de JSON estructurado: util para transformar texto libre en esquemas JSON en pipelines de automatizacion, aprovechando la mejora declarada en generacion de salidas estructuradas.
- Analisis de documentos y tablas: con 32K tokens de contexto puede resumir o extraer datos de informes y tablas de tamano moderado.
- Prototipado rapido de agentes: su soporte de tool calling permite construir flujos multi-paso basicos en entornos de desarrollo con presupuesto de hardware ajustado.
- Traduccion y atencion multilingue: el modelo base cubre mas de 29 idiomas, apto para traduccion y respuestas en varios idiomas en aplicaciones de soporte.
- Educacion y tutoria: generacion de explicaciones paso a paso de matematicas y conceptos tecnicos en un equipo de sobremesa.
- Clasificacion y etiquetado de texto: tareas de extraccion y categorizacion en lotes donde el coste por token es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5, a un benchmark de cuantizacion y a un benchmark de velocidad, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) en el material proporcionado. No se deben asumir valores no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): q2_K en torno a 1,3 GB; q3_K_M en torno a 1,6 GB; q4_0 en torno a 1,8 GB; q4_K_M en torno a 2,0 GB; q5_0 en torno a 2,1 GB; q5_K_M en torno a 2,3 GB; q6_K en torno a 2,6 GB; q8_0 en torno a 3,4 GB; y en bf16/f16 en torno a 6,2 GB. Son estimaciones derivadas del numero de parametros y los bits por peso, no datos medidos.
- Cache KV: con GQA (2 cabezas KV, head dim 128) y 36 capas, la cache ronda decenas de KB por token; en el peor caso de 32K tokens en fp16 puede suponer del orden de 1 a 1,2 GB adicionales. Cifra orientativa.
- GPU recomendadas: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, Apple Silicon (M1/M2/M3) y GPUs de datacenter como A100 o H100 si se busca maximo throughput con paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas para cuantizaciones q4 o inferiores; en CPU pura funciona con RAM suficiente (recomendado 8 GB o mas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp, Jan y otros runners compatibles con GGUF. Para el modelo base en bf16 se puede usar vLLM o TGI, pero las herramientas con soporte GGUF nativo son la via recomendada para estas cuantizaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card enlaza a un benchmark de velocidad oficial sin cifras incluidas aqui.

## Comparativa con modelos similares

La comparativa se limita a especificaciones estructurales conocidas de modelos de la misma categoria; no se dispone de datos de benchmarks head-to-head en la informacion proporcionada.

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (esta publicacion, GGUF) | 3.09B (3,4B reales en safetensors) | 32.768 tokens | Transformer + GQA + RoPE | qwen-research |
| Llama-3.2-3B-Instruct | 3.21B | 128K tokens | Transformer + GQA + RoPE | Llama 3.2 Community License |
| Phi-3.5-mini-instruct | 3.8B | 128K tokens | Transformer | MIT |
| Gemma-2-2B-it | 2.6B | 8.192 tokens | Transformer + GQA | Gemma Terms of Use |

Datos de rendimiento comparado: no disponibles.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de 3B; la precision factual en dominios especializados es limitada en comparacion con modelos mayores.
- Sesgos potenciales derivados de los datos de preentrenamiento del modelo base; no se documentan evaluaciones de sesgo en el material aportado.
- Repositorio de terceros: la publicacion la mantiene el usuario ldov, no el equipo oficial de Qwen. No hay garantia de integridad ni de actualizaciones; conviene verificar los pesos frente al modelo base oficial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Idioma: las etiquetas del repositorio indican solo "en", pese a que el modelo base declara mas de 29 idiomas. El rendimiento fuera del ingles puede degradarse y no esta garantizado por este repositorio.
- Licencia qwen-research: es una licencia propia con condiciones de uso; no es una licencia de codigo abierto plena. Debe revisarse el texto de la licencia antes de cualquier uso comercial. Enlace a la licencia en la model card original.
- Contexto: aunque la familia Qwen2.5 anuncia hasta 128K en algunas variantes, esta version 3B declara 32.768 tokens; no deben asumirse 128K.
- Las cuantizaciones agresivas (q2_K, q3_K_M) degradan la calidad de forma notable; se recomienda q4_K_M o superior para uso en produccion.
- No se documentan en este repositorio plantillas de chat propias ni parametros de muestreo recomendados; deben heredarse del modelo base.
- Las estimaciones de VRAM incluidas en esta ficha son calculos orientativos, no mediciones oficiales.

## Enlaces

- Repositorio HuggingFace de esta publicacion: https://huggingface.co/ldov/Qwen2.5-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio GGUF oficial: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Licencia (archivo LICENSE del repo oficial GGUF): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/blob/main/LICENSE
- Blog oficial Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Guia llama.cpp de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmark de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671

Nota: los resultados de la busqueda web proporcionados no contenian informacion relevante sobre este modelo, por lo que no se han podido incorporar fuentes adicionales de esa via.
