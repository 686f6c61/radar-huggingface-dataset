# micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4

## Resumen

`micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario micdun en Hugging Face. El modelo se ha entrenado sobre un conjunto sintetico de 54.000 ejemplos del dominio de codigo, generados por tres modelos "profesor" (parents) identificados en el identificador de la ejecucion como `gpt_oss_20b_qwq_deepseek_distill_qwen_25`. El objetivo es destilar conocimiento de codigo de modelos de mayor tamano hacia un modelo compacto de 1.500 millones de parametros.

Se trata de un modelo denso de la familia Qwen2, con 1.543.714.304 parametros totales, pesos en safetensors y un tamano de repositorio de 3,1 GB. Al derivar de Qwen2.5-1.5B-Instruct conserva la arquitectura transformer decoder-only propia de esa familia, aunque la model card no detalla la longitud de contexto ni los idiomas soportados. El entrenamiento fue un ajuste fino completo (no LoRA) durante 3 epocas, con learning rate 1e-4 y batch global de 64.

La relevancia de este modelo es acotada pero concreta: demuestra un flujo de destilacion sintetica de datos de codigo desde modelos grandes hacia un modelo pequeno que puede ejecutarse en hardware modesto. No obstante, carece de benchmarks publicados, de licencia declarada y de documentacion sobre el dataset, por lo que debe tratarse como un experimento reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (los pesos safetensors admiten cuantizacion posterior a GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dominio de entrenamiento | codigo (54.000 ejemplos sinteticos) |
| Epocas | 3 |
| Learning rate | 1e-4 |
| Batch global | 64 |
| Tamano del repo | 3,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso con normalizacion RMSNorm, atencion con RoPE y sesgo QKV, propio de la familia Qwen2. El ajuste fino es completo (full fine-tune), no un adaptador, y se realizo con la libreria TRL dentro del ecosistema transformers. La model card indica 3 epocas, learning rate 1e-4 y batch global de 64.

Los datos de entrenamiento son sinteticos: 54.000 ejemplos del dominio de codigo, 18.000 generados por cada uno de los tres modelos profesor identificados en el run id (`gpt_oss_20b_qwq_deepseek_distill_qwen_25`). No se documenta la composicion exacta del dataset, el filtrado aplicado, la longitud media de las muestras ni si hubo etapas de RLHF o DPO posteriores al SFT. Tampoco se especifica la configuracion de decodificacion usada para generar los datos sinteticos ni el criterio de calidad para aceptar las respuestas de los profesores.

La innovacion tecnica principal es el propio pipeline de destilacion: usar tres profesores distintos para generar datos de codigo y consolidarlos en un unico modelo pequeno. No se mencionan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional, heredada del ajuste instructivo de Qwen2.5-1.5B-Instruct.
- Generacion y asistencia en codigo, reforzada por el SFT sobre 54.000 ejemplos sinteticos del dominio.
- Formato de chat instructivo propio de Qwen2.5 (roles system/user/assistant), segun el tokenizer del modelo base.
- Soporte multilingue: no documentado en la model card; el modelo base Qwen2.5 cubre varios idiomas, pero no se confirma el comportamiento tras el ajuste.
- Tool calling / function calling: no documentado para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo base tiene capacidades limitadas a este tamano.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Autocompletado y generacion de codigo en editor: el modelo puede integrarse como backend de un plugin de IDE para sugerir fragmentos y completar funciones, aprovechando el SFT sobre ejemplos de codigo y su bajo coste de inferencia en GPU consumer.
- Asistente de revision de codigo en CI: dado su tamano, puede desplegarse como servicio ligero que comenta diffs y sugiere correcciones en pipelines de integracion continua, sin necesidad de GPUs de datacenter.
- Generacion de tests unitarios: el ajuste sobre datos de codigo sintetico lo hace adecuado para producir esqueletos de tests a partir de funciones existentes en tareas de automatizacion interna.
- Prototipado rapido en local: investigadores pueden ejecutarlo en una unica GPU consumer para experimentar con destilacion sintetica y comparar contra el modelo base sin infraestructura dedicada.
- Educacion y explicacion de codigo: puede usarse en entornos de aprendizaje para explicar fragmentos o traducir pseudocodigo a un lenguaje concreto, con la advertencia de que requiere supervision humana por riesgo de alucinacion.
- Base para nuevos ajustes: al ser un full fine-tune de 1.5B con licencia no declarada, sirve como punto de partida para experimentos de SFT adicionales en dominios especificos, siempre que se resuelva la cuestion de licencia.
- Generacion de documentacion tecnica: puede redactar docstrings y comentarios a partir de firmas de funciones, tarea de bajo riesgo donde los errores son faciles de detectar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-5 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,9-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) para fp16; GPUs de datacenter (A100, H100) solo necesarias para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas en fp16 y en tarjetas con 4 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama tras conversion a GGUF, y vLLM mediante conversion de pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (micdun, SFT de codigo) | 1,54B | no disponible | no disponible | Hugging Face, 0 descargas | SFT sintetico de codigo, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Hugging Face, ampliamente usado | Modelo base instructivo generalista |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens (segun model card del base) | Apache 2.0 (segun model card del base) | Hugging Face, ampliamente usado | Ajuste oficial de codigo con benchmarks publicados |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens (segun model card del base) | Licencia propia de DeepSeek | Hugging Face | Alternativa de codigo de tamano similar |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribucion; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en tareas de codigo.
- Datos de entrenamiento sinteticos y opacos: no se documenta el filtrado, la calidad ni la posible contaminacion de los 54.000 ejemplos generados por los profesores.
- Riesgo de alucinacion: como todo modelo de 1,5B, puede inventar APIs, funciones o librerias inexistentes; requiere validacion automatica (compilacion, tests) en cualquier uso de codigo.
- Idiomas no documentados: el comportamiento multilingue tras el ajuste es desconocido.
- Contexto no documentado: no se confirma la ventana efectiva tras el SFT, aunque el base declara 32.768 tokens.
- Modelo con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues ni reportes de uso.
- Posible sobreajuste al estilo de los profesores: al entrenar 3 epocas con lr 1e-4 sobre datos sinteticos, puede reproducir sesgos y formatos de los modelos profesor, incluidos sus errores.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/micdun/code_54k_gpt_oss_20b_qwq_deepseek_distill_qwen_25_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL: https://github.com/huggingface/trl
- Libreria transformers: https://github.com/huggingface/transformers
