# primitive-ai/Ling-3.2-air-NVFP4A16

## Resumen

Ling-3.2-air-NVFP4A16 es una version cuantizada del modelo multimodal inclusionAI/Ling-3.2-air, publicada por primitive-ai. Se trata de un transformer MoE multimodal (image-text-to-text) de 124 mil millones de parametros totales con solo 5,5 mil millones activos por token, disenado para inferencia eficiente en una sola GPU. La cuantizacion reduce el checkpoint de 129,3 GB (version FP8 oficial) a 77,9 GB, lo que permite servirlo en una unica tarjeta de 96 GB como la RTX PRO 6000 Blackwell.

La innovacion clave de esta build es que solo los 512 expertos enrutados de cada capa MoE (incluida la capa MTP) almacenan pesos en NVFP4 (E2M1 con escala E4M3 por cada 16 valores y escala global FP32), mientras las activaciones permanecen en BF16. La atencion (35 capas KDA de atencion lineal y 7 capas MLA con compuerta), el experto compartido, los MLP densos, los routers, la torre de vision, los embeddings y el LM head se mantienen en BF16.

Es relevante ahora porque demuestra que es posible comprimir un MoE multimodal de 124 B a menos de 80 GB con una deriva de solo +10,5e-3 nats por token respecto a la release FP8 y una tasa de acuerdo top-1 del 96,5%, manteniendo el rendimiento en conocimiento (90,2 frente a 90,3) y mejorando ligeramente en tool calling (80,0 frente a 75,8). El modelo base no dispone de pesos BF16 publicados; esta build se genero desquantizando los expertos desde el FP8 con bloques 128x128.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (bailing_moe_v3_vl) con atencion hibrida: 35 capas KDA (atencion lineal) + 7 capas gated MLA |
| Parametros totales | 127.920.654.544 (~124 B) |
| Parametros activos | ~5,5 B por token |
| Longitud de contexto | 32.768 tokens (ventana configurada en la build; pool KV de 994.742 tokens en una tarjeta de 96 GB) |
| Tipos de cuantizacion | NVFP4 W4A16 en expertos enrutados (E2M1, escala E4M3 por 16 valores, escala global FP32); resto BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compresed-tensors (compressed-tensors), compatible con vLLM |
| Capas | 42 (35 KDA + 7 MLA) |
| Expertos | 512 enrutados (top-8) + 1 compartido por capa MoE |
| Hidden size | 2560 |
| Ancho de experto | 768 |
| Capa MTP | 1 |
| Tamano del repo | 77,9 GB |
| Torre de vision | Si (BF16, identica a la release) |

## Arquitectura y entrenamiento

Ling-3.2-air es un modelo MoE multimodal con una arquitectura hibrida de atencion: 35 capas utilizan KDA (atencion lineal) y 7 capas emplean MLA con compuerta (gated MLA), lo que reduce el coste de atencion en contextos largos. Cada capa MoE contiene 512 expertos enrutados con activacion top-8 mas un experto compartido, con hidden size de 2560 y ancho de experto de 768. Incluye una capa MTP (multi-token prediction) y una torre de vision para entrada de imagenes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. Esta build concreta no reentrena el modelo: parte de la release FP8 oficial de inclusionAI (unica publicada, sin pesos BF16), desquantiza los tensores FP8 a BF16 y recuantiza unicamente los pesos de los expertos enrutados a NVFP4. Las proyecciones gate y up de cada experto comparten una unica escala global porque vLLM las fusiona. La innovacion tecnica destacable es la cuantizacion selectiva W4A16: solo los expertos son 4-bit, lo que preserva la calidad de atencion, routers y vision mientras reduce el peso del 90% de los parametros.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable (`enable_thinking: true` en `chat_template_kwargs`).
- Comprension de imagenes y texto (pipeline image-text-to-text) mediante torre de vision integrada.
- Tool calling / function calling nativo, con parser `ling3` en vLLM (`--enable-auto-tool-choice --tool-call-parser ling3`).
- Razonamiento multi-paso y comportamiento agentico, con parser de razonamiento dedicado (`--reasoning-parser ling3`).
- Capacidad de abstenerse cuando no dispone de informacion (metrica "abstain" de 76,7 en la suite de evaluacion).
- Prediccion multi-token (capa MTP) para decodificacion especulativa.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Contexto largo de hasta 32.768 tokens en la configuracion recomendada.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, facturas o fotos de producto junto con texto en conversaciones multi-turno, gracias a la torre de vision y a una ventana de 32.768 tokens que cubre historiales largos.
- Agentes con tool calling en produccion: el soporte nativo de function calling con parser `ling3` permite integrarlo en orquestadores de agentes que consultan APIs, bases de datos o sistemas internos, con una puntuacion de 80,0 en la suite de tool calling.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre PDFs escaneados o diagramas tecnicos, combinando vision y modo thinking para tareas de interpretacion compleja.
- Asistente de codigo y razonamiento tecnico: generacion y explicacion de codigo con razonamiento multi-paso, adecuado para pipelines de revision automatizada o generacion de tests en CI/CD.
- Despliegue en una sola GPU: al caber en 96 GB, es viable para equipos con una RTX PRO 6000 Blackwell o similar, sin necesidad de tensor parallelism, lo que simplifica la infraestructura y reduce costes frente a la release FP8 que requiere dos tarjetas.
- Servicio de alto throughput: con 555 tok/s a concurrencia 32 y 104,9 tok/s en un solo stream, es apto para endpoints de inferencia con carga moderada-alta en una unica maquina.
- Evaluacion e investigacion de cuantizacion: sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A16 frente a FP8 en modelos MoE multimodales, con metricas de deriva y acuerdo top-1 publicadas.

## Benchmarks y rendimiento

Resultados medidos por el autor en una RTX PRO 6000 Blackwell (96 GB), suite de conocimiento de 1.170 items y suite de tool calling de 200 items, temperature 0.6 / top_p 0.95 / top_k 20, thinking activado, presupuesto de 16.384 tokens, concurrencia 32, autoevaluado sin juez LLM.

| Build | Formato | Tamano | Deriva (x10^-3 nats/token) | Acuerdo top-1 | Conocimiento | Tool calling | Abstain | Finished | tok/s @1 | tok/s @32 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ling-3.2-air FP8 (release inclusionAI) | FP8 W8A8, bloques 128x128 | 129,28 GB | 0 (referencia) | 100% | 90,3 | 75,8 | 79,2 | 98,8% | n/a (2 tarjetas) | n/a (2 tarjetas) |
| Ling-3.2-air NVFP4 (W4A4) | NVFP4 W4A4 expertos enrutados, resto BF16 | 77,89 GB | +18,85 | 95,9% | 89,9 | 79,8 | 80,0 | 98,1% | 100,6 | 593 |
| Esta build (NVFP4A16) | NVFP4 W4A16 expertos enrutados, resto BF16 | 77,88 GB | +10,51 | 96,5% | 90,2 | 80,0 | 76,7 | 97,9% | 104,9 | 555 |

La deriva y el acuerdo top-1 se calculan sobre 400 trazas de razonamiento (156.720 tokens de completion); el error estandar por traza es 0,64 para esta build. El forward pass de vLLM para este modelo no es bit-reproducible: dos ejecuciones de la misma build coinciden en aproximadamente el 96,5% de los tokens top-1 y su deriva media difiere hasta 0,7x10^-3, por lo que la columna de acuerdo top-1 esta en el suelo de ruido entre ejecuciones. Tool calling se midio con tres ejecuciones por build, con diferencias de hasta 5,5 puntos entre ejecuciones de la misma build. Conocimiento es una ejecucion por build.

## Requisitos de hardware

- VRAM estimada: 77,9 GB de pesos en BF16/NVFP4 mixto; con `--gpu-memory-utilization 0.92` en una tarjeta de 96 GB el pool KV alcanza 994.742 tokens con ventana de 32.768.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), validada por el autor. Cualquier GPU con 96 GB o mas de memoria. La release FP8 requiere dos tarjetas en tensor parallel 2.
- Cabe en consumer GPU: no en tarjetas de 24-48 GB; requiere una GPU profesional de 96 GB o configuraciones multi-GPU con tensor parallelism.
- Opciones de despliegue: vLLM (libreria oficial de la build), con imagen `vllm/vllm-openai:nightly-a2bcb5657a881a002e79d0adab3c6b5e39436121` o superior; requiere `--trust-remote-code`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Parametros de inferencia recomendados por inclusionAI: temperature 1.0, top_p 0.95, top_k 20, `enable_thinking: true`.
- Latencia y throughput: 104,9 tok/s en un solo stream y 555 tok/s a concurrencia 32 en una RTX PRO 6000 Blackwell, con 8K de entrada / 512 de salida, sin prefix cache.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ling-3.2-air-NVFP4A16 (esta build) | ~124 B | ~5,5 B | 32.768 | NVFP4 W4A16 + BF16 | MIT | 77,9 GB, una GPU de 96 GB, deriva +10,51e-3 |
| Ling-3.2-air FP8 (inclusionAI) | ~124 B | ~5,5 B | no disponible | FP8 W8A8, bloques 128x128 | MIT | 129,3 GB, requiere 2 GPU, referencia de calidad |
| Ling-3.2-air NVFP4 (W4A4) | ~124 B | ~5,5 B | 32.768 | NVFP4 W4A4 + BF16 | MIT | 77,89 GB, deriva +18,85e-3, mayor throughput (593 tok/s @32) |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva de cuantizacion: +10,51x10^-3 nats por token respecto a la release FP8, con acuerdo top-1 del 96,5%. Aunque el rendimiento agregado es equivalente, puede haber degradacion en tareas de alta precision no cubiertas por las suites.
- El forward pass de vLLM no es bit-reproducible para este modelo; los resultados pueden variar entre ejecuciones (hasta 0,7x10^-3 en deriva media y 5,5 puntos en tool calling).
- Construida desde la release FP8, no desde BF16 (inclusionAI no publico pesos BF16); la cuantizacion acumula la perdida del FP8 original mas la del NVFP4.
- La metrica de abstencion (76,7) es inferior a la de la release FP8 (79,2) y a la build W4A4 (80,0), lo que sugiere una tendencia algo mayor a responder cuando deberia abstenerse.
- Riesgo de alucinacion inherente a modelos generativos; no se han publicado evaluaciones especificas de sesgo en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla de lo que herede del modelo base.
- Licencia MIT permite uso comercial, pero al ser una version modificada del modelo base, conviene conservar la atribucion a inclusionAI y revisar los terminos del modelo original.
- Requiere `--trust-remote-code` en vLLM por el codigo custom (`bailing_moe_v3_vl`), lo que implica ejecutar codigo del repositorio.
- El contexto maximo documentado en esta build es de 32.768 tokens; no se especifica si el modelo base soporta ventanas mayores.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4A16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Build NVFP4 W4A4 alternativa: https://huggingface.co/primitive-ai/Ling-3.2-air-NVFP4
- Perfil del autor: https://huggingface.co/primitive-ai
- Web del autor: https://primitive.com
