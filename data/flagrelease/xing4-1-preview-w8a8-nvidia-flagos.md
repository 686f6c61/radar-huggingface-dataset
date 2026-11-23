# FlagRelease/Xing4.1-Preview-W8A8-nvidia-FlagOS

## Resumen

Xing4.1-Preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) perteneciente a la familia Xingchen Semantic Large Model, disenado especificamente para programacion de agentes y tareas complejas de horizonte largo. Desarrollado sobre plataformas de computacion domesticas, cuenta con 285B parametros totales (279,9B segun los pesos en safetensors) y aproximadamente 17B parametros activos por token, lo que lo situa en la liga de modelos como DeepSeek-V3 en cuanto a eficiencia computacional por token generado.

La version publicada en este repositorio, Xing4.1-Preview-W8A8-nvidia-FlagOS, es una adaptacion cuantizada a 8 bits (W8A8) realizada por FlagRelease sobre el stack FlagOS, un conjunto de software de sistema completamente open source que unifica las capas de modelo, sistema y chip para permitir un flujo de trabajo "desarrolla una vez, ejecuta en cualquier lugar" sobre aceleradores de IA diversos. Esta adaptacion amplia las opciones de despliegue en inferencia para el modelo original.

El modelo emplea MLA (Multi-head Latent Attention) para una representacion comprimida del KV cache y DSA (DeepSeek Sparse Attention) para atencion dispersa, con un backbone Transformer de 45 capas de las cuales 42 son capas MoE. Soporta nativamente una ventana de contexto de 1M tokens, modo de razonamiento conmutables, tool calling y salida estructurada, lo que lo hace relevante para flujos de trabajo de oficina multi-paso, investigacion profunda y generacion de codigo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA y DSA (sparse attention), 45 capas (42 MoE) |
| Parametros totales | 279.902.121.728 (~280B; la model card indica 285B) |
| Parametros activos | ~17B por token (8 de 256 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 1M tokens nativo (el ejemplo de despliegue usa 65.536) |
| Tipos de cuantizacion | W8A8 (8-bit, compressed-tensors) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

Xing4.1-Preview se basa en un backbone Transformer de 45 capas, de las cuales 42 son capas de tipo Mixture of Experts. En cada capa MoE se seleccionan 8 expertos enrutados de un total de 256, mas 1 experto compartido, lo que da lugar a los aproximadamente 17B parametros activos por token sobre un total de 285B. La arquitectura incorpora MLA para comprimir la representacion del KV cache, algo critico para sostener ventanas de contexto de hasta 1M tokens, y DSA (DeepSeek Sparse Attention) para reducir el coste computacional de la atencion en secuencias largas.

El modelo fue entrenado integramente sobre plataformas de computacion domesticas, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que la familia Xing 4 esta orientada a tareas de agente y horizonte largo, y que el modelo soporta conmutacion de modo de razonamiento (thinking mode), lo que sugiere un entrenamiento orientado a razonamiento multi-paso. Esta version concreta ha sido adaptada por FlagRelease al stack FlagOS con cuantizacion W8A8, validando la consistencia de resultados frente al stack nativo en benchmarks publicos.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento conmutable.
- Programacion de agentes y ejecucion de tareas complejas de horizonte largo.
- Tool calling y function calling para integracion con herramientas externas.
- Salida estructurada (structured output) para pipelines que requieren JSON u otros formatos validables.
- Generacion de codigo en escenarios de produccion.
- Capacidades matematicas, con un resultado de 95,20 en Math_500 para la variante nativa (Nvidia-Origin).
- Procesamiento de documentos intensivos y flujos de trabajo de oficina multi-paso.
- Soporte multilingue limitado a chino e ingles.
- Contexto nativo de 1M tokens para tareas de investigacion profunda y documentos extensos.
- Compatibilidad con el parser de razonamiento `deepseek_v3` en vLLM, lo que permite separar el contenido de pensamiento de la respuesta final.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1M tokens, manteniendo el hilo de conversaciones extensas o historiales de cliente completos sin truncamiento.
- Generacion de codigo en produccion: soporta tool calling y salida estructurada, lo que permite integrarlo en pipelines de CI/CD para generar parches, revisar diffs o producir tests automatizados con formato validable.
- Agentes autonomos de investigacion: su modo de razonamiento conmutable y su capacidad de horizonte largo lo hacen adecuado para tareas de busqueda y sintesis multi-paso con documentos extensos.
- Automatizacion de flujos de oficina: procesamiento de documentos intensivos, extraccion de datos y generacion de informes a partir de grandes volumenes de texto gracias al contexto de 1M tokens.
- Asistentes de analisis de codigo en repositorios grandes: la ventana de contexto permite cargar archivos completos o multiples modulos para revision, refactorizacion o explicacion de codigo.
- Despliegue en infraestructura con aceleradores no estandar: al estar adaptado al stack FlagOS, es una opcion para entornos que buscan portabilidad entre distintos aceleradores de IA sin reescribir el stack de inferencia.
- Backend de agentes con herramientas: la combinacion de tool calling, salida estructurada y razonamiento multi-paso permite construir orquestadores de agentes que invocan APIs y APIs internas de forma fiable.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la model card, que compara la variante nativa (Nvidia-Origin) con la adaptacion FlagOS. La mayoria de celdas aparecen como "Evaluating" (pendientes).

| Metrica | Xing4.1-Preview-Nvidia-Origin | Xing4.1-Preview-Nvidia-FlagOS |
|---|---|---|
| Math_500 | 95,20 | Evaluating |
| GPQA_Diamond | Evaluating | Evaluating |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 281,5 GB en pesos W8A8, por lo que se requiere un minimo de ~282 GB de VRAM solo para pesos, mas overhead de KV cache y activaciones. Con contexto de 65.536 tokens y `gpu-memory-utilization 0.88`, el ejemplo oficial usa 8 GPU H100.
- GPU recomendadas: el ejemplo de despliegue oficial emplea 8x NVIDIA H100 con `--tensor-parallel-size 8`. No se documentan otras configuraciones validadas.
- Cabe en consumer GPU: no. El tamano de pesos (281,5 GB) excede con creces la VRAM de cualquier GPU de consumo individual; se requiere un despliegue multi-GPU de clase datacenter.
- Opciones de despliegue: vLLM 0.24.0 dentro de la imagen Docker FlagOS (`harbor.baai.ac.cn/flagrelease-public/...`), con plugins FlagOS (`VLLM_PLUGINS=fl`, `VLLM_FL_PREFER=flagos`, `USE_FLAGGEMS=1`). No se documentan opciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo configura `--max-num-seqs 64`, `--max-num-batched-tokens 16384` y `cudagraph_mode: FULL_DECODE_ONLY` con `max_cudagraph_capture_size: 64`, lo que sugiere un enfoque en decodificacion estable con batching moderado.
- Requisitos de host: Ubuntu 22.04.4 LTS, driver 580.105.08, Docker 29.1.3, `--shm-size 64g`, `--ipc host`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.1-Preview (este) | ~280B | ~17B | 1M | Apache-2.0 | Hugging Face / ModelScope |
| DeepSeek-V3 | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas MoE de ~300B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de benchmarks ni especificaciones de modelos comparables de la misma categoria, por lo que la comparativa cuantitativa se limita a la tabla anterior. La referencia a `deepseek_v32` en los tags del repositorio y al parser `deepseek_v3` en vLLM indica compatibilidad arquitectonica con la familia DeepSeek, pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; no hay soporte documentado para castellano ni otros idiomas, lo que limita su uso en entornos hispanohablantes sin evaluacion adicional.
- Contexto: aunque el modelo declara 1M tokens nativos, el ejemplo de despliegue oficial limita `--max-model-len` a 65.536; usar la ventana completa requerira ajustar configuracion y probablemente mas recursos de memoria.
- Benchmarks incompletos: la mayoria de metricas de la model card aparecen como "Evaluating", por lo que el rendimiento real de la variante FlagOS frente a la nativa no esta cuantificado.
- Alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion; en tareas de investigacion profunda o generacion de codigo conviene validar las salidas.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo incluye `custom_code` en los pesos, por lo que conviene revisar el codigo personalizado incluido antes de desplegarlo en produccion.
- Despliegue: la unica configuracion validada documentada es 8x H100 con la imagen Docker FlagOS y vLLM 0.24.0; no hay garantias de funcionamiento en otros stacks o configuraciones de GPU.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la version es "Preview", lo que sugiere que puede tratarse de una publicacion reciente o poco validada por la comunidad.
- Reproducibilidad: el despliegue depende de una imagen Docker alojada en un registro especifico (`harbor.baai.ac.cn`) y de variables de entorno del stack FlagOS, lo que anade dependencias de infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.1-Preview-W8A8-nvidia-FlagOS
- AnythingLLM (integracion mencionada en la model card): https://anythingllm.com/
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/xing4.1-preview-rl-1114-w8a8-nvidia003-gems0.0.0-treenone-cxnone-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp312-pt211-cu129-x64-580.105.08:202611201406`
- Descarga via ModelScope: `modelscope download --model FlagRelease/Xing4.1-Preview-W8A8-nvidia-FlagOS`
