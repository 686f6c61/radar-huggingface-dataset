# leoncca/Qwen3.8-27B-AEON-Mixed-FP8

# Ficha tecnica: Qwen3.8-27B-AEON-Mixed-FP8

## Resumen

Qwen3.8-27B-AEON-Mixed-FP8 es una cuantizacion mixta FP8 (E4M3 block-128) de alta calidad del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, creada por leoncca y validada especificamente para su ejecucion en 4x NVIDIA Tesla V100 32GB (SM70) mediante el runtime 1Cat-vLLM. Se trata de una cuantizacion comunitaria, no un checkpoint oficial de Qwen, y hereda la licencia Apache-2.0 del modelo fuente.

El modelo base es Qwen3.8-27B, un modelo denso de 27B parametros de la serie Qwen3.8, un vision-language model nativo que entiende imagenes y videos, con razonamiento configurable y una ventana de contexto nativa de 262.144 tokens. Esta cuantizacion mantiene en BF16 los tensores mas sensibles (torre de vision completa, rama MTP, Q/K/V/O de todas las capas de atencion, embeddings, LM head y parametros GDN/SSM) y convierte a FP8 solo 336 GEMM de gran tamano, logrando un equilibrio entre reduccion de memoria y fidelidad numerica.

La relevancia de este modelo reside en que permite ejecutar un LLM multimodal de 27B con contexto largo (262K) en hardware de generacion anterior como las V100, que no soportan FP8 nativo, mediante una estrategia de precision mixta FP16 compute con FP16 KV cache. La evaluacion acotada realizada por el autor no muestra regresiones atribuibles a la cuantizacion en las tareas probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) con torre de vision, atencion completa en 16 capas y rama MTP nativa |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 block-128 (mixto, con tensores BF16 bit-identicos); FP16 KV cache |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.8-27B, un modelo denso vision-language de la serie Qwen3.8. Segun la informacion publica, la serie Qwen3.8 incorpora una fusion temprana vision-lenguaje entrenada sobre trillones de tokens multimodales, lo que le permite procesar imagenes y videos de forma nativa. El modelo incluye una rama MTP (multi-token prediction) para acelerar la decodificacion y parametros GDN/SSM sensibles al estado, aunque no se proporcionan detalles tecnicos completos sobre estos componentes.

La cuantizacion AEON-Mixed-FP8 es un proceso post-entrenamiento que aplica una politica de precision selectiva: 336 grandes pesos de GEMM se convierten a FP8 E4M3 con bloques de 128x128, mientras que 863 tensores importantes (10.264.372.704 bytes) permanecen bit-identicos al BF16 original. La torre de vision completa (333 tensores), la rama MTP (15 tensores), los Q/K/V/O de las 16 capas de atencion (64 tensores), embeddings, LM head, normas y parametros GDN/SSM se mantienen en BF16. La precision de runtime recomendada es FP16 compute con FP16 KV cache. El checkpoint fuente esta fijado a una revision concreta (commit `8f76e82ed7ef4de7735f5d4148fce7b643b00fae`) y se incluyen manifiestos de precision y metricas de error.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de imagen y video ademas de texto, con capacidad de razonamiento configurable (modo thinking).
- Razonamiento multi-step y tareas agénticas de largo horizonte: disenado para llevar tareas complejas a completitud con mayor fiabilidad.
- Soporte de tool calling / function calling: validado en la evaluacion acotada con parser `qwen3_coder`.
- Soporte de agentes: compatible con flujos agénticos que requieren multiples pasos y uso de herramientas.
- Capacidades multilingues: ingles, chino y otros idiomas (etiquetado como multilingual).
- Codificacion: competente en generacion y comprension de codigo, validado con HumanEval y MBPP.
- Decodificacion especulativa nativa: la rama MTP permite acelerar la decodificacion (perfil MTP4), aunque con trade-offs en prefill.

## Casos de uso

- Asistentes de codigo en entornos con hardware legacy: un equipo con 4x V100 32GB puede desplegar un asistente de programacion con contexto largo (262K) para analizar repositorios completos, gracias a la validacion especifica en SM70 y la rama MTP para acelerar la generacion.
- Analisis de documentos largos y recuperacion en contexto: con ventana de 262K tokens y needle retrieval validado hasta 246K, es adecuado para procesar manuales tecnicos, contratos o informes extensos sin necesidad de RAG externo.
- Agentes de automatizacion de tareas: el soporte de tool calling y razonamiento multi-step permite construir agentes que interactuan con APIs, ejecutan comandos y planifican secuencias de acciones, con el parser `qwen3_coder` ya probado.
- Sistemas de atencion al cliente multilingue: al soportar ingles, chino y otros idiomas, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interaccion.
- Prototipado de aplicaciones multimodales en GPU de gama baja: al caber en 128GB de VRAM distribuida en V100, permite experimentar con vision-language en infraestructura existente sin adquirir hardware moderno.
- Investigacion en cuantizacion y precision mixta: los manifiestos de precision y metricas de error incluidos (PRECISION-MANIFEST.json, FP8-ERROR-METRICS.jsonl) lo convierten en un caso de estudio util para evaluar el impacto de FP8 en tareas especificas.

## Benchmarks y rendimiento

La model card incluye una evaluacion acotada comparando el checkpoint BF16 fuente con esta cuantizacion mixta FP8. No se trata de benchmarks completos, sino de una suite limitada:

| Evaluacion | BF16 fuente | Mixed FP8 |
| --- | ---: | ---: |
| Core text, tool e image checks | 10/10 | 10/10 |
| Needle retrieval a 8K, 64K, 128K, 246K | 4/4 | 4/4 |
| GSM8K (subconjunto fijo de 32 ejemplos) | 28/32 | 29/32 |
| HumanEval + MBPP (subconjunto fijo de 10 ejemplos) | 9/10 | 9/10 |
| IFEval strict/loose prompts | 3/5 | 3/5 |
| IFEval strict/loose instructions | 9/12 | 9/12 |

El autor indica que no se reprodujo ninguna regresion atribuible unicamente a la cuantizacion en esta suite acotada, pero advierte que no es una afirmacion de equivalencia sobre todas las tareas, idiomas o distribuciones de contexto. Los benchmarks del modelo base Qwen3.8-27B (DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) provienen de fuentes externas y no han sido verificados para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: 128 GB en total (4x 32GB) segun la configuracion validada con tensor parallelism 4.
- GPU recomendadas: 4x NVIDIA Tesla V100-PCIE-32GB (SM70), con runtime FP16 compute y FP16 KV cache. No se ha validado en otras GPUs.
- Compatibilidad con GPU de consumo: no se ha probado; el modelo esta disenado para V100, pero al ser safetensors estandar podria ejecutarse en GPUs con suficiente VRAM (p. ej., 2x A100 80GB o 4x RTX 4090 24GB), aunque sin soporte garantizado.
- Opciones de despliegue: 1Cat-vLLM (recomendado, con extensiones SM70/Flash-V100), vLLM con soporte para el backend de atencion FLASH_ATTN_V100.
- Rendimiento medido (4x V100, TP4, FP16 KV, MTP0): prefill de 2533.8 tok/s a 8K, 2271.4 tok/s a 64K, 1932.9 tok/s a 128K, 1505.6 tok/s a 246K; decode de 53.43 tok/s a 8K, 47.88 tok/s a 64K, 43.61 tok/s a 128K, 34.29 tok/s a 246K. Con MTP4, el decode aumenta hasta 113.10 tok/s a 8K/256, pero el prefill cae entre 3.7% y 21.2% y el tiempo end-to-end empeora en varios escenarios de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Notas |
| --- | --- | --- | --- | --- | --- |
| Qwen3.8-27B (base oficial) | 27,8B | 262K | BF16 | Apache-2.0 | Modelo original, requiere GPUs modernas para FP8 o mucha VRAM en BF16 |
| Qwen3.8-27B-AEON-Mixed-FP8 (este) | 27,8B | 262K | FP8 mixto + BF16 | Apache-2.0 | Cuantizacion comunitaria validada en V100, con manifiestos de precision |
| iceDonkey/Qwen3.8-27B-FP8 | 27,8B | 262K | FP8 | Apache-2.0 | Otra cuantizacion FP8 de la comunidad, sin detalles publicados de validacion |

No hay datos publicos de rendimiento comparativo entre esta cuantizacion y otras variantes FP8 del mismo modelo.

## Limitaciones y advertencias

- El modelo hereda las capacidades y riesgos del checkpoint AEON "uncensored": puede producir contenido inexacto, inseguro, ilegal o danino. El autor declina toda responsabilidad y exige al usuario implementar capas de seguridad adecuadas.
- La evaluacion acotada no garantiza equivalencia total con el BF16 fuente en todas las tareas, idiomas o distribuciones de contexto.
- La FP8 KV cache queda fuera del perfil validado: solo se soporta FP16 KV, lo que limita el ahorro adicional de memoria.
- El perfil MTP4 no debe activarse de forma universal: reduce el prefill entre 3.7% y 21.2% y es mas lento end-to-end en varios casos de contexto largo.
- La validacion se realizo con una sola secuencia y configuracion especifica (TP4, max-num-seqs 1); otros parametros de servicio pueden alterar el rendimiento.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma especificos de esta cuantizacion; se remite a la model card del modelo fuente.
- Es una cuantizacion comunitaria no oficial: no cuenta con soporte del equipo de Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leoncca/Qwen3.8-27B-AEON-Mixed-FP8
- Modelo fuente (AEON): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base oficial (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Runtime 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM
- Ficha de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guia sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Otra cuantizacion FP8 de la comunidad: https://huggingface.co/iceDonkey/Qwen3.8-27B-FP8
