# GotoAI-Inc/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-W8A16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-W8A16 es una cuantización int8 weight-only (W8A16) del modelo híbrido MoE de NVIDIA Nemotron 3.5 Lightning 30B A3B, publicada por el usuario independiente GotoAI-Inc. Este modelo combina 23 bloques Mamba-2, 23 bloques MoE y 6 bloques de atención, con unos 32,9 mil millones de parámetros totales de los cuales aproximadamente 3 mil millones se activan por token (6 de 128 expertos enrutados más un experto compartido). La cuantización reduce el peso de 65,83 GB a 35,93 GB, un 45% menos, manteniendo la fidelidad cercana al bfloat16 gracias a int8 con grupo de tamaño 64 y sin calibración.

La relevancia de esta versión reside en que ofrece una alternativa de alta fidelidad a la cuantización int4 W4A16 del mismo autor (20,49 GB) y al build NVFP4 de NVIDIA que requiere GPUs Blackwell. Al usar kernels Marlin desde compute capability 7.5, permite ejecutar el modelo en GPUs Ampere, Ada y Hopper con una pérdida de calidad mínima. Su arquitectura híbrida con solo 6 bloques de atención hace que la caché KV sea muy económica, permitiendo el contexto nativo de 256k tokens en una GPU de 48 GB.

El modelo está diseñado para tareas especializadas de agentes siempre activos, con soporte de razonamiento (thinking mode), tool calling y decodificación especulativa mediante una cabeza de predicción multi-token (MTP) que permanece en bfloat16. La licencia es openmdw-1.1, una licencia de código abierto con condiciones específicas que deben revisarse antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 23 bloques Mamba-2 + 23 bloques MoE + 6 bloques de atencion |
| Parametros totales | 32.913.266.240 (~32,9 B) |
| Parametros activos | ~3 B (6 de 128 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (256k nativo) |
| Tipos de cuantizacion | W8A16 int8, grupo 64, simetrico, weight-only (esta version); W4A16 int4 (hermano); NVFP4 (build oficial NVIDIA) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors en formato compressed-tensors (pesos empaquetados int8 + escalas bf16) |

## Arquitectura y entrenamiento

El modelo base fue pre-entrenado por NVIDIA con más de 20 billones de tokens, seguido de un post-entrenamiento con datos curados y generados sintéticamente, incluyendo datos de question-answering y alineación. La arquitectura es un híbrido de 52 bloques: 23 bloques Mamba-2 (estado espacial), 23 bloques MoE (con 128 expertos enrutados más un experto compartido) y 6 bloques de atención con caché KV. Esta combinación permite que solo 6 bloques generen caché KV, lo que abarata enormemente el contexto largo.

La cuantización W8A16 de GotoAI-Inc se realizó con `llmcompressor.model_free_ptq`, sin datos de calibración y sin cargar el modelo, operando directamente sobre los safetensors. Se convirtieron 6.004 módulos Lineales (88,6% de los bytes de salida), incluyendo los expertos enrutados, las proyecciones Mamba y el experto compartido. Se dejaron en bfloat16 la cabeza MTP (multi-token prediction), los routers MoE (`.gate`), los embeddings, el `lm_head` (no atado), las capas `conv1d` de Mamba y los parámetros SSM. El tamaño de grupo es 64 en lugar de 128 porque el `down_proj` de los expertos tiene una entrada de 1856 dimensiones, y 128 no divide ese número.

El modelo incorpora una cabeza de predicción multi-token (un bloque de atención + un bloque MoE con `num_nextn_predict_layers: 1`) que vLLM carga a través de la ruta de decodificación especulativa, acelerando la generación. El parser de razonamiento `nemotron_v3` separa el contenido de pensamiento en `reasoning_content`, y el tool calling usa el formato XML de Qwen3-Coder.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) separado del contenido final.
- Soporte de tool calling / function calling mediante parser `qwen3_coder` (formato XML compatible con Qwen3-Coder).
- Capacidades de agente multi-paso con razonamiento encadenado y contexto largo de 256k tokens.
- Multilingüe en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) integrada, acelerando la inferencia.
- Arquitectura híbrida Mamba-2 + MoE que permite caché KV reducida y menor huella de memoria en contexto largo.
- Cuantización int8 de alta fidelidad que mantiene la calidad del modelo bfloat16 con una reducción del 45% en tamaño.

## Casos de uso

- Agentes autónomos siempre activos: el modelo está diseñado para tareas especializadas de agentes que requieren baja latencia y alta disponibilidad, como monitorización de sistemas, automatización de flujos de trabajo o asistentes de soporte técnico que ejecutan acciones mediante tool calling.
- Atención al cliente multilingüe: con soporte de seis idiomas y contexto de 256k tokens, puede gestionar conversaciones multi-turno largas, mantener el historial completo de interacción y resolver incidencias complejas sin perder el hilo.
- Procesamiento de documentos extensos: la ventana de 256k tokens permite analizar manuales técnicos, contratos legales o informes financieros completos de una sola pasada, con capacidad de razonamiento para extraer conclusiones.
- Generación de código en producción: con tool calling y parser compatible con Qwen3-Coder, puede integrarse en pipelines de CI/CD para generar, revisar o corregir código, así como interactuar con APIs y repositorios.
- Razonamiento y análisis en tiempo real: el modo de pensamiento separado permite que el modelo razone paso a paso antes de responder, útil en sistemas de diagnóstico, análisis de datos o planificación de tareas.
- Enrutamiento de tareas de alto volumen: combinado con NeMo Switchyard de NVIDIA, puede servir como modelo de ejecución para tareas repetitivas mientras se reservan modelos frontera para planificación compleja, reduciendo costes operativos.
- Despliegue en entornos con VRAM limitada: al requerir solo 35,93 GB de pesos, puede ejecutarse en una GPU de 48 GB con contexto completo, o en GPUs de 24/32 GB con contextos reducidos, habilitando inferencia local de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor menciona una sección de evaluación comparativa entre las versiones int8 e int4, pero no se incluyen los datos numéricos. La página de NVIDIA NIM indica que es el "modelo MoE 30B A3B más rápido con precisión líder en dominios para tareas agénticas especializadas", pero sin cifras concretas. Se recomienda consultar la model card del modelo base para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 35,93 GB. Con overhead de runtime, se necesita al menos 40 GB para inferencia básica. Para el contexto completo de 256k tokens, la model card indica que una GPU de 48 GB es suficiente gracias a la caché KV reducida (solo 6 bloques de atención).
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, RTX 4090 (24 GB, solo con contexto reducido), RTX 6000 Ada, o cualquier GPU con compute capability 7.5 o superior (Ampere, Ada, Hopper). No requiere Blackwell, a diferencia del build NVFP4 oficial.
- Si cabe en consumer GPU: en una RTX 4090 de 24 GB no cabe con contexto completo; la versión int4 W4A16 (20,49 GB) es la recomendada por el autor para 24/32 GB.
- Opciones de despliegue: vLLM >= 0.25.1 (obligatorio, con `NemotronHForCausalLM` y parser `nemotron_v3`), también compatible con transformers. Se recomienda usar `--mamba-backend flashinfer` y opcionalmente `--mamba-ssm-cache-dtype float16` para reducir memoria de la caché Mamba.
- Latencia y throughput: no se han publicado datos específicos. La arquitectura MoE con 3B activos y la decodificación especulativa MTP sugieren una latencia baja, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-W8A16 (este) | 32,9 B totales, ~3 B activos | 256k | W8A16 int8 | 35,93 GB | openmdw-1.1 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-W4A16 (hermano int4) | 32,9 B totales, ~3 B activos | 256k | W4A16 int4 | 20,49 GB | openmdw-1.1 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (build oficial) | 32,9 B totales, ~3 B activos | 256k | NVFP4 | no disponible | openmdw-1.1 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | 32,9 B totales, ~3 B activos | 256k | BF16 | 65,83 GB | openmdw-1.1 |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos suficientes para comparar con otros modelos MoE de tamaño similar (como Qwen3-30B-A3B o DeepSeek-V3-Lite) en términos de rendimiento, ya que no hay benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Esta es una cuantización no oficial, no afiliada a NVIDIA. Las capacidades, evaluaciones y limitaciones del modelo original pertenecen a la model card del modelo base de NVIDIA.
- La licencia openmdw-1.1 es una licencia de código abierto con condiciones específicas; es necesario revisar sus términos antes de uso comercial, especialmente en lo relativo a atribución, redistribución y uso en productos desplegados.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; no se han documentado sesgos específicos en la información disponible.
- Requiere vLLM >= 0.25.1; versiones anteriores no son compatibles. El uso con transformers es posible pero no se documenta el rendimiento.
- La cabeza MTP, los routers, embeddings y `lm_head` permanecen en bfloat16, lo que añade 4,1 GB extra de memoria no cuantizada.
- La cuantización se realizó sin calibración, aunque int8 con redondeo al más cercano mantiene una fidelidad alta frente a int4; el autor advierte que la diferencia de calidad entre int8 e int4 es más notable en este modelo que en otros.
- El contexto de 256k tokens requiere 48 GB de VRAM; en GPUs de menor capacidad el contexto debe reducirse, lo que puede afectar a casos de uso de documentos largos.
- El soporte de idiomas se limita a seis lenguas; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/GotoAI-Inc/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-W8A16
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Versión int4 W4A16 del mismo autor: https://huggingface.co/GotoAI-Inc/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-W4A16
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de NVIDIA sobre modelos Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
