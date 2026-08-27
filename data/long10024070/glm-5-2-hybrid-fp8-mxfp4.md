# long10024070/GLM-5.2-HYBRID-FP8-MXFP4

## Resumen

GLM-5.2-HYBRID-FP8-MXFP4 es un checkpoint cuantizado del modelo GLM-5.2, ensamblado por el usuario long10024070 a partir de dos versiones oficiales publicadas por Z-AI y AMD: `zai-org/GLM-5.2-FP8` y `amd/GLM-5.2-MXFP4`. El resultado es un modelo de texto con arquitectura MoE que combina pesos en bloque FP8 para las capas no-MoE y la capa MTP, y pesos MXFP4 para los tensores de expertos enrutados y compartidos, sin dequantizar ni requantizar ningún tensor durante el ensamblaje. Declara 389.526.497.280 parámetros totales (aproximadamente 389,5 mil millones) y un contexto de 1 millón de tokens, según la información del modelo base GLM-5.2.

Este checkpoint es relevante porque ofrece una alternativa de menor huella de memoria frente al GLM-5.2 original en BF16 (743B parámetros), manteniendo la fidelidad de los pesos cuantizados oficiales. Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors facilita la integración con el ecosistema Transformers. Sin embargo, requiere un parche condicional del cargador SGLang para funcionar correctamente, lo que limita su portabilidad a otros motores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa), transformer con Multi-Token Prediction (MTP) |
| Parametros totales | 389.526.497.280 (389,5B) |
| Parametros activos | no disponible (el modelo base GLM-5.2 tiene 39B activos) |
| Longitud de contexto | 1.000.000 tokens (segun modelo base) |
| Tipos de cuantizacion | Hibrido: block-FP8 (capas no-MoE y MTP) + MXFP4 (expertos MoE) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un ensamblaje determinista de dos checkpoints oficiales cuantizados. Las capas no-MoE y la capa MTP 78 se copian byte a byte desde `zai-org/GLM-5.2-FP8` (block-FP8), mientras que los tensores de expertos enrutados y compartidos de las capas 3 a 77 se copian desde `amd/GLM-5.2-MXFP4` (MXFP4). No se realiza ninguna operacion de dequantizacion o requantizacion durante el proceso, lo que garantiza que los pesos conservan exactamente los valores de los checkpoints originales.

El modelo base GLM-5.2, desarrollado por Z-AI, es un MoE de aproximadamente 743B parametros totales y 39B activos, con una ventana de contexto de 1M tokens. Su innovacion principal frente a GLM-5.1 es la extension del Multi-Token Prediction (MTP) de 3 a 5 tokens de borrador, lo que mejora el rendimiento en tareas de razonamiento, codificacion y agentes. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) de este checkpoint especifico, ya que es una variante cuantizada sin reentrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para modo de pensamiento (thinking mode) heredado del modelo base.
- Razonamiento complejo y resolucion de problemas en tareas de largo horizonte, gracias a la ventana de contexto de 1M tokens.
- Generacion de codigo y soporte de tool calling / function calling, segun las capacidades del GLM-5.2 original.
- Capacidades de agente y multi-step reasoning, potenciadas por el MTP de 5 tokens que acelera la decodificacion especulativa.
- Capacidades multilingues: no confirmadas para este checkpoint, aunque el modelo base GLM-5.2 soporta multiples idiomas.
- No incluye capacidades de vision ni audio, al ser un modelo exclusivamente de texto.

## Casos de uso

- Despliegue de asistentes conversacionales con contexto largo: el modelo puede mantener conversaciones de hasta 1M tokens, adecuado para chatbots que necesitan recordar historiales extensos o documentos completos.
- Agentes autonomos de largo horizonte: su MTP de 5 tokens y su modo de pensamiento permiten planificar y ejecutar tareas multi-paso, como navegacion web automatizada o gestion de proyectos complejos.
- Generacion de codigo en entornos de produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y documentar codigo, reduciendo la intervencion manual.
- Analisis y resumen de documentos extensos: la ventana de 1M tokens permite procesar libros, informes anuales o bases de conocimiento completas en una sola pasada, sin necesidad de chunking.
- Razonamiento matematico y cientifico: el modelo base destaca en benchmarks de matematicas y ciencias, por lo que puede usarse como asistente de investigacion o tutor avanzado.
- Inferencia con restricciones de memoria: al estar cuantizado en FP8/MXFP4, ocupa menos VRAM que el checkpoint BF16 original, lo que permite ejecutarlo en nodos con menos GPUs o en configuraciones distribuidas mas economicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint hibrido en la informacion disponible. El modelo base GLM-5.2 ha sido evaluado en tareas de razonamiento, codificacion y agentes, pero no se proporcionan cifras concretas en las fuentes consultadas. Se recomienda consultar la documentacion oficial de Z-AI para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 414,4 GB en disco. En FP8, los 389,5B parametros requieren aproximadamente 389 GB de VRAM; en MXFP4, alrededor de 195 GB. Dado el caracter hibrido, la VRAM real estara entre ambos valores, pero supera con creces la capacidad de cualquier GPU consumer.
- GPUs recomendadas: se necesitan multiples GPUs de alta gama, como NVIDIA A100 80GB, H100 80GB o H200, en configuraciones de 4 a 8 unidades, dependiendo de la cuantizacion efectiva y del tamaño del lote.
- No cabe en GPUs consumer (RTX 4090, 3090, etc.) de forma individual; se requeriria descargar el modelo en CPU o usar cuantizacion adicional no soportada por este checkpoint.
- Opciones de despliegue: el checkpoint declara compatibilidad con SGLang mediante un parche condicional especifico. Tambien es compatible con Transformers, aunque se recomienda verificar el soporte de la arquitectura `glm_moe_dsa` en vLLM, llama.cpp u Ollama, que no esta confirmado.
- Latencia y throughput: no disponibles. El MTP de 5 tokens del modelo base sugiere una mejora de throughput frente a versiones anteriores, pero no hay datos medidos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| GLM-5.2-HYBRID-FP8-MXFP4 (este) | 389,5B | no disponible | 1M | FP8 + MXFP4 | MIT |
| GLM-5.2 (BF16 original) | ~743B | 39B | 1M | BF16 | MIT |
| GLM-5.2-FP8 (zai-org) | ~743B | 39B | 1M | FP8 | MIT |
| GLM-5.2-MXFP4 (amd) | ~743B | 39B | 1M | MXFP4 | MIT |

La comparativa muestra que este checkpoint reduce significativamente el numero de parametros totales (389,5B frente a 743B) al combinar cuantizaciones, pero mantiene la misma arquitectura y contexto. No se dispone de datos de rendimiento para establecer una comparacion objetiva con otros modelos MoE de tamano similar, como DeepSeek-V3 o Qwen2.5-Max.

## Limitaciones y advertencias

- Requiere un parche condicional del cargador SGLang para funcionar correctamente; los checkpoints FP8 y MXFP4 originales no usan esa ruta, por lo que la portabilidad a otros motores de inferencia no esta garantizada.
- La cuantizacion hibrida puede introducir una ligera degradacion en la precision frente al modelo BF16 original, aunque al copiar pesos sin dequantizar se minimiza el error adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo o con contexto muy extenso.
- No se han publicado evaluaciones de sesgos ni de seguridad para este checkpoint especifico; se recomienda auditar el modelo antes de usarlo en aplicaciones sensibles.
- El numero de parametros activos no esta documentado para este checkpoint, aunque se asume que hereda los 39B activos del modelo base; esta suposicion no ha sido verificada.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un checkpoint reciente y poco probado en la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/long10024070/GLM-5.2-HYBRID-FP8-MXFP4
- Checkpoint base FP8: https://huggingface.co/zai-org/GLM-5.2-FP8
- Checkpoint base GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Catalogo de modelos Microsoft Foundry: https://ai.azure.com/catalog/models/zai-org--glm-5.2-fp8
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Recetas vLLM para GLM-5.2: https://recipes.vllm.ai/zai-org/GLM-5.2
