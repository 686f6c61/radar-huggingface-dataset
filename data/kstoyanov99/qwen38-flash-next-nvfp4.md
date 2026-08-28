# kstoyanov99/qwen38-flash-next-nvfp4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es la versión cuantizada del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollada por RadixArk y re-publicada bajo el usuario kstoyanov99. Se trata de un modelo de arquitectura híbrida Transformer con mezcla de expertos (MoE) que combina atención dispersa GDN y QSA, flujos multi-hiperconexión e inyección de n-gramas PLE. La cuantización se realizó con NVIDIA Model Optimizer usando la receta NVFP4 W4A4, aplicada exclusivamente a los expertos enrutados, reduciendo el checkpoint de 360 GB a 135 GB (~2,7 veces) sin tocar el resto de componentes, que permanecen en BF16 byte-idénticos al original.

El modelo está pensado para sistemas agénticos, chat, generación de código y razonamiento multimodal, con una ventana de contexto de hasta 262K tokens. El checkpoint cuantizado ocupa 135,2 GB en disco y contiene 119,6 mil millones de parámetros según los archivos safetensors, aunque el modelo completo declarado alcanza ~180B incluyendo la tabla de n-gramas PLE y la capa MTP. Solo es validado oficialmente en hardware NVIDIA Blackwell (GB300 y B300) y, mediante recetas adicionales, en DGX Spark (GB10). Su relevancia radica en permitir servir un modelo de gran capacidad con requisitos de memoria sustancialmente menores, manteniendo resultados dentro del margen del modelo BF16 de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (GDN + QSA sparse attention, multi-hyperconnection streams, PLE n-gram injection) |
| Parametros totales | ~180B (modelo completo); 119.602.003.859 en el checkpoint cuantizado (safetensors) |
| Parametros activos | 6B (segun vLLM Recipes) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1, grupo 16, escalas FP8 E4M3 y FP32) en expertos enrutados; FP8 E4M3 en tablas PLE; resto BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (consultar terminos del modelo fuente Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (con artefactos adicionales para SGLang y vLLM) |

## Arquitectura y entrenamiento

La arquitectura base, Qwen3.8-Flash-Next, es un Transformer hibrido multimodal que combina atencion dispersa GDN (Gated Delta Network) y QSA (Query-Sparse Attention), junto con flujos de multi-hiperconexion (mHC) e inyeccion de n-gramas PLE (Probabilistic Language Embedding) para acelerar la generacion. El modelo principal tiene 48 capas decoder con 512 expertos enrutados por capa MoE (top-10 routing) mas un experto compartido, y una capa MTP (Multi-Token Prediction). Segun vLLM Recipes, el modelo principal tiene 125B parametros, complementados por 51B de embeddings n-grama y 4B de la capa MTP, con 6B parametros activos por token.

La cuantizacion de este checkpoint se realizo con NVIDIA Model Optimizer (nvidia-modelopt v0.46.0, snapshot `87c9f8cf`) usando la receta NVFP4 W4A4. Solo los expertos enrutados de las 48 capas MoE principales estan cuantizados (fused `gate_up_proj` / `down_proj`, 294.912 tensores cuantizados), con escalas de bloque FP8 E4M3 y escalas globales FP32, y activaciones NVFP4 dinamicas. El resto de componentes (atencion, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, vision y los 31 tensores MTP) permanecen en BF16 byte-identicos al modelo fuente. Las tablas PLE n-grama usan las versiones cuantizadas FP8 de la revision `Qwen/Qwen3.8-Flash-Next-FP8`, des-cuantizadas a BF16 en tiempo de carga. La calibracion se hizo con 128 articulos de cnn_dailymail (config 3.0.0, train split, seed 1234) truncados a 512 tokens, capturando activaciones de entrada de los bloques MoE durante prefill en SGLang, con 62.139 filas por capa. No se aplico RLHF ni DPO en este proceso; se trata de post-training quantization.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y video, y produce salidas de texto.
- Razonamiento matematico y logico: evaluado en GSM8K (97,27) y AIME26 (98,75 pass@1), con resultados dentro del margen del modelo BF16.
- Generacion de codigo: el modelo base Qwen3.8-Flash-Next esta disenado para tareas de programacion, aunque no se aportan benchmarks especificos en esta ficha.
- Soporte de agentes y razonamiento multi-paso: la arquitectura con 262K de contexto y 6B parametros activos permite cadenas de razonamiento largas, aunque se observa que las generaciones agénticas largas tienden a durar mas que en BF16.
- Capacidades multilingues: no especificadas en la documentacion disponible.
- Modo thinking: no documentado explicitamente para este checkpoint.
- Tool calling / function calling: no documentado explicitamente, aunque el caso de uso declarado incluye sistemas agénticos.

## Casos de uso

- Atencion al cliente automatizada: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo de la interaccion y referencias a documentacion amplia sin truncamiento.
- Razonamiento matematico y cientifico: adecuado para resolver problemas de nivel competitivo (GSM8K, AIME26) en entornos educativos o de investigacion, con precision comparable al modelo BF16 de referencia.
- Analisis multimodal de documentos: al aceptar imagen y video ademas de texto, puede procesar capturas de pantalla, diagramas o grabaciones para extraer informacion y generar informes.
- Sistemas agénticos autonomos: la combinacion de contexto largo, razonamiento multi-paso y bajo numero de parametros activos (6B) permite desplegar agentes que planifican y ejecutan tareas complejas con coste computacional contenido.
- Generacion de codigo asistida: integrable en entornos de desarrollo para autocompletado, revision de codigo o generacion de tests, aprovechando la capacidad de razonamiento del modelo.
- Servicio de inferencia en hardware de memoria limitada: gracias a la cuantizacion NVFP4 (135 GB en lugar de 360 GB), puede servirse en sistemas como DGX Spark (128 GB unificados) con vLLM y el parche de disk-offload para la tabla PLE, habilitando despliegues locales de gran capacidad.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan este checkpoint NVFP4 con el modelo BF16 de referencia (en una revision anterior, por lo que las comparaciones son indicativas):

| Eval | Protocolo | BF16 referencia | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | full 1319, t0.6 / top-p 0.95 / max 8192 | 97,12–97,50 | 97,27 (stop 98,86, err 0) |
| AIME26 | 30 problemas x 8, t1.0 / max 130k | 100 (240/240) | 98,75 pass@1 (majority@8 100, stop 99,17) |

Nota: el valor de AIME26 se midio en una revision anterior del checkpoint cuyas unicas diferencias con la actual son las tablas de embeddings PLE. No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 135,2 GB en disco; para inferencia se requiere memoria suficiente para cargar los pesos y las tablas PLE (~51 GB adicionales si no se usa disk-offload). En DGX Spark (128 GB unificados) se necesita el parche `VLLM_PLE_DISK_OFFLOAD` para servir la tabla PLE desde mmap en disco.
- GPU recomendadas: NVIDIA Blackwell (GB300, B300) validado oficialmente; DGX Spark (GB10, sm_121a) verificado mediante recetas comunitarias.
- GPU de consumo: no, el modelo no cabe en GPUs consumer actuales (RTX 4090, etc.) por su tamano y requisitos de memoria.
- Opciones de despliegue: SGLang (con soporte `qwen4_exp` y cuantizacion `modelopt_fp4`), vLLM (con parches para PLE disk-offload y CPU offload en DGX Spark).
- Latencia y throughput: no disponibles en la documentacion. Se indica que las generaciones agénticas largas tienden a durar mas que en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | ~180B totales, 6B activos | 262K | BF16 (360 GB) | other | HuggingFace |
| Qwen3.8-Flash-Next-NVFP4 (este) | ~180B totales, 6B activos | 262K | NVFP4 W4A4 (135 GB) | other | HuggingFace |
| Qwen3.8-Flash-Next-FP8 | ~180B totales, 6B activos | 262K | FP8 (tablas PLE) | other | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoria (MoE multimodal hibrido con n-gramas) en la informacion proporcionada. La comparativa principal es frente al modelo BF16 original, donde la cuantizacion NVFP4 mantiene el rendimiento dentro del margen de error en GSM8K y AIME26, con una reduccion de memoria de ~2,7 veces.

## Limitaciones y advertencias

- Hardware restringido: solo validado en NVIDIA Blackwell (GB300, B300) y, mediante recetas comunitarias, en DGX Spark (GB10). No hay soporte garantizado para otras arquitecturas.
- Dependencia de software especifico: requiere builds de SGLang con soporte `qwen4_exp` o vLLM con parches no oficiales (`VLLM_PLE_DISK_OFFLOAD`, `VLLM_PLE_CPU_OFFLOAD`), lo que complica el despliegue en entornos estandar.
- Licencia "other": los terminos de uso no estan claramente especificados en este repositorio; deben consultarse en el modelo fuente Qwen/Qwen3.8-Flash-Next antes de uso comercial.
- Degradacion en generaciones largas: se observa que las generaciones agénticas largas tienden a ejecutarse mas lentamente que en BF16, aunque la precision en tareas de un solo turno se mantiene.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de tasas de alucinacion para este checkpoint.
- Comparaciones indicativas: los benchmarks de referencia BF16 se registraron en una revision anterior del modelo, por lo que las diferencias de pesos no estan establecidas y las comparaciones deben tratarse con cautela.
- Sin soporte de cuantizacion de KV-cache: no se incluyen metadatos de cuantizacion para la cache de atencion, lo que puede limitar el rendimiento en contextos muy largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kstoyanov99/qwen38-flash-next-nvfp4
- Modelo fuente: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Receta DGX Spark: https://github.com/kstoyanov99/qwen38-flash-next-nvfp4-dgx-spark
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Receta multi-Spark GB10: https://github.com/karti-ai/qwen38-flash-next-spark
- Hilo en foros de NVIDIA: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
