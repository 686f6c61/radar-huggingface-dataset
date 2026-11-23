# FlagRelease/Xing4.1-Preview-W8A8-metax-FlagOS

## Resumen

Xing4.1-Preview es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) perteneciente a la familia Xingchen Semantic Large Model, disenado especificamente para programacion de agentes y tareas complejas de horizonte largo. Desarrollado sobre plataformas de computo domesticas, cuenta con 285B parametros totales y aproximadamente 17B parametros activos por token, con soporte nativo para una ventana de contexto de 1M tokens. Emplea MLA (Multi-head Latent Attention) para representacion comprimida de KV y DSA (sparse attention) para atencion dispersa.

La version aqui documentada es una adaptacion de FlagRelease para el stack FlagOS sobre hardware MetaX C550 (8 tarjetas), cuantizada en W8A8 (8 bits) mediante compressed-tensors. Esta orientada a despliegue en infraestructura no-NVIDIA, ampliando las opciones de inferencia del modelo original. El modelo base esta pensado para flujos de trabajo de oficina multi-paso, investigacion profunda, generacion de codigo y escenarios empresariales intensivos en documentos.

La relevancia actual radica en su combinacion de contexto extremadamente largo (1M tokens), activacion eficiente de expertos (17B de 285B) y soporte para tool calling y modo de razonamiento conmutables, lo que lo posiciona como candidato para agentes autonomos en produccion sobre acceleradores alternativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA y DSA (sparse attention), 45 capas (42 MoE) |
| Parametros totales | 279.902.121.728 (~285B) |
| Parametros activos | ~17B por token (8 de 256 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1M tokens (nativo); configuracion de servidor en la model card: 65.536 |
| Tipos de cuantizacion | W8A8 (8 bits, compressed-tensors) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, deepseek_v32) |

## Arquitectura y entrenamiento

El modelo sigue una columna vertebral Transformer de 45 capas, de las cuales 42 son capas MoE. Para cada token selecciona 8 expertos enrutados de un total de 256, mas 1 experto compartido, resultando en aproximadamente 17B parametros activos sobre 285B totales. Incorpora MLA para compresion de la representacion KV, lo que reduce el coste de memoria en contextos largos, y DSA (sparse attention) para atencion dispersa, habilitando la ventana de 1M tokens de forma nativa.

El entrenamiento se realizo sobre plataformas de computo completamente domesticas segun la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La variante documentada es una adaptacion de FlagOS que integra FlagGems (libreria de operadores en Triton), FlagTree (compilador unificado), FlagCX (comunicacion) y FlagScale para despliegue automatizado sobre chips MetaX.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Modo de razonamiento conmutable (thinking mode) mediante `enable_thinking` en el chat template.
- Tool calling y function calling.
- Salida estructurada (structured output).
- Razonamiento multi-paso y soporte para agentes autonomos.
- Generacion de codigo.
- Capacidades matematicas (Math_500 reportado en 95.20 para la variante NVIDIA original).
- Procesamiento de escenarios intensivos en documentos y flujos de oficina multi-paso.
- Capacidades multilingues limitadas a zh y en.

## Casos de uso

- Agentes autonomos de horizonte largo: el modelo puede mantener estado y planificar a lo largo de tareas multi-paso gracias a su ventana nativa de 1M tokens y al soporte de tool calling, reduciendo la perdida de contexto en cadenas de acciones extensas.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con historial largo y salida estructurada para integracion con sistemas CRM, aprovechando el modo thinking para respuestas que requieren razonamiento.
- Generacion de codigo en produccion: integracion en pipelines de CI/CD mediante function calling y salida estructurada para generar parches, tests o documentacion tecnica.
- Investigacion profunda y sintesis documental: procesamiento de corpus extensos (informes, expedientes) dentro de una sola ventana de contexto, con extraccion estructurada de conclusiones.
- Automatizacion de flujos de oficina: orquestacion de tareas administrativas multi-paso (redaccion, revision, clasificacion) sobre documentos de gran extension.
- Despliegue sobre acceleradores no-NVIDIA: la adaptacion FlagOS-Metax permite ejecutar el modelo en clusters MetaX C550 x8, util en entornos con requisitos de soberania tecnologica o donde no hay disponibilidad de GPUs NVIDIA.
- Servicio de inferencia compatible con OpenAI API: el servidor vLLM expuesto en `/v1/chat/completions` permite integrar el modelo en herramientas como AnythingLLM o cualquier cliente compatible.

## Benchmarks y rendimiento

| Metrica | Xing4.1-Preview-Nvidia-Origin | Xing4.1-Preview-Metax-FlagOS |
|---|---|---|
| Math_500 | 95.20 | En evaluacion |
| GPQA_Diamond | En evaluacion | 87.37 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 281.5 GB en pesos W8A8; en inferencia con tensor-parallel-size 4 y data-parallel-size 2 se reparte entre 8 GPUs MetaX C550, con `gpu-memory-utilization` de 0.90.
- GPU recomendadas: 8x MetaX C550 (configuracion validada en la model card). Para la variante NVIDIA original no se detalla hardware en la informacion disponible.
- Cabe en consumer GPU: no, el tamano del modelo (~280 GB en W8A8) excede la VRAM de GPUs de consumo.
- Opciones de despliegue: vLLM 0.32.0 dentro del contenedor FlagOS-Metax (`harbor.baai.ac.cn/flagrelease-public/xing4.1-preview-metax001-gems5.5.0-tree0.7.0-cxnone-plugin0.3.0-vllm0.32.0-sglangnone-sglangflnone-cp312-pt210-maca39-x64-3.8.1`); descarga de pesos via ModelScope.
- Parametros de servicio relevantes: `--tensor-parallel-size 4`, `--data-parallel-size 2`, `--enable-expert-parallel`, `--max-model-len 65536`, `--max-num-seqs 64`, `--block-size 64`, `--enable-prefix-caching`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni especificaciones de modelos alternativos comparables (por ejemplo, otros MoE de ~285B con contexto de 1M). La comparativa cuantitativa no esta disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.1-Preview (W8A8 Metax FlagOS) | ~285B | ~17B | 1M nativo | Apache 2.0 | Hugging Face / ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas soportados limitados a chino e ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a modelos de gran escala; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- La configuracion de servidor de referencia limita `max-model-len` a 65.536 tokens pese al soporte nativo de 1M; usar el contexto completo requiere ajustar memoria y configuracion.
- La cuantizacion W8A8 puede degradar ligeramente la calidad respecto a los pesos originales en bf16; no se han publicado comparativas de fidelidad numerica.
- Dependencia de hardware MetaX C550 y del stack FlagOS/MACA 3.8.1; el despliegue fuera de ese entorno no esta validado.
- Estado de evaluacion incompleto: Math_500 y GPQA_Diamond solo tienen resultado en una de las dos variantes.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Xing4.1-Preview y de las dependencias del stack FlagOS.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.1-Preview-W8A8-metax-FlagOS
- FlagOS (stack de sistema): no disponible enlace directo en la informacion proporcionada
- FlagGems (libreria de operadores en Triton): https://github.com/openai/triton (referencia citada en la model card)
- AnythingLLM: https://anythingllm.com/
- Contenedor FlagOS-Metax: `harbor.baai.ac.cn/flagrelease-public/xing4.1-preview-metax001-gems5.5.0-tree0.7.0-cxnone-plugin0.3.0-vllm0.32.0-sglangnone-sglangflnone-cp312-pt210-maca39-x64-3.8.1:202611231025`
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Xing4.1-Preview-W8A8-metax-FlagOS`
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
