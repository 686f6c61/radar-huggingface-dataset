# sergolsub/mammoth-v1-27B-MLX-8bit

## Resumen

Mammoth-v1-27B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo base `baselabs/mammoth-1`, publicada por el usuario sergolsub. El objetivo es ejecutar los pesos originales en Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios de arquitectura: solo reducción de precisión de bf16 a 8 bits. El repositorio incluye, además de los pesos, el glue de inferencia (`onejev_mlx.py`, `decision_config.json`, `joint_config.json`) necesario para el modo de decisión del modelo.

El modelo cuenta con 27.356.728.560 parámetros (unos 27,36 mil millones) distribuidos en 8 shards de safetensors que suman 30,4 GB en disco. La model card identifica la arquitectura con el tag `qwen3_5` y menciona una capa `linear_attn.in_proj_b`, lo que apunta a un transformer híbrido con atención lineal en al menos parte de sus capas, aunque no se detalla la composición completa de la arquitectura.

La relevancia de esta ficha radica en que documenta una conversión práctica para hardware de consumo Apple: en un Mac mini M4 Pro de 48 GB, el modelo carga en 9,42 s con un pico de memoria residente de 20,15 GB. El autor reporta que la cuantización a 8 bits no degrada la calidad frente a bf16 en sus evaluaciones internas, e incluso la mejora ligeramente en algunas métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (tag `qwen3_5`; detalles completos no disponibles) |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base admite bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base `baselabs/mammoth-1`) |
| Formato de pesos | safetensors en layout MLX (8 shards) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base `baselabs/mammoth-1`: no se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El tag `qwen3_5` sugiere una arquitectura de la familia Qwen 3.5, y la presencia de una capa `linear_attn.in_proj_b` en la auditoría KL indica el uso de atención lineal en al menos la primera capa del modelo de lenguaje, lo que apunta a un diseño híbrido entre atención completa y atención lineal para reducir coste computacional en contextos largos.

La conversión realizada por sergolsub es puramente de cuantización: no hay reentrenamiento ni modificación arquitectónica. El autor publica una auditoría tensor a tensor (`kl_audit.json`) comparando los pesos 8 bits dequantizados contra los originales bf16 mediante divergencia KL con histogramas de 512 bins. Se compararon 1184 tensores, con una KL media de 3,34e-04 y una KL máxima de 5,71e-03, localizada en `model.language_model.layers.0.linear_attn.in_proj_b.weight`. Solo 581 tensores presentan divergencia no nula, lo que respalda la fidelidad de la cuantización.

## Capacidades

- Modo de decisión estructurada: el modelo expone una API `decide()` que clasifica entradas de texto en tipos predefinidos (`noul`, `choice`, `score`) con instrucciones y criterios configurables.
- Clasificación booleana (`noul`): determina si una condición se cumple sobre un texto de entrada, por ejemplo si el cliente solicita un reembolso.
- Clasificación multiclase (`choice`): asigna la entrada a una de varias categorías definidas por criterios, como enrutar un ticket al equipo de facturación o de envíos.
- Puntuación ordinal (`score`): evalúa la severidad o intensidad de un caso según una escala de criterios (por ejemplo, `cosmetic`, `annoying`, `blocks`).
- Procesamiento de texto en lenguaje natural: interpreta descripciones de incidencias, pedidos y errores técnicos.
- Inferencia local en Apple Silicon: integración nativa con `mlx_lm` y el loader propio `OneJev`.
- Soporte de tool calling, agentes, visión, audio o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento automático de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve la etiqueta del equipo responsable (`billing`, `shipping`, etc.) mediante una decisión de tipo `choice`. Es adecuado porque la latencia mediana de 2215 ms permite procesar tickets en tiempo casi real en local.
- Triaje de severidad de incidencias: con una decisión de tipo `score`, clasifica errores técnicos (por ejemplo, "disk quota exceeded") en niveles como `cosmetic`, `annoying` o `blocks`, lo que permite priorizar colas de trabajo sin depender de la nube.
- Detección de solicitudes de reembolso: una decisión `noul` sobre el texto del cliente determina si pide un reembolso, integrándose en un flujo de atención al cliente que derive automáticamente a facturación.
- Clasificación de correos o mensajes entrantes: el modelo puede etiquetar mensajes según criterios definidos por el operador, útil para bandejas de entrada compartidas o sistemas de CRM.
- Procesamiento por lotes en local con privacidad: al ejecutarse íntegramente en un Mac mini M4 Pro con 20 GB de memoria pico, permite clasificar datos sensibles sin enviarlos a servicios externos, con un throughput sostenido de 0,78 decisiones cortas por segundo.
- Prototipado y evaluación de pipelines de decisión: el repositorio incluye `decision_config.json`, `joint_config.json` y `serve.patch`, lo que facilita montar un servidor local (`/v1/systemone`) y probar flujos de decisión antes de desplegarlos.
- Automatización de back-office con bajo coste de infraestructura: al caber en hardware Apple de consumo, permite desplegar clasificación de documentos o incidencias en pequeñas oficinas sin GPU dedicada.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas del autor de la conversión, no benchmarks estándar de la comunidad. Se comparan los pesos 8 bits frente a bf16:

| Metrica | 8-bit | bf16 |
|---|---|---|
| Accuracy (eval del autor) | 85,6% | 84,4% |
| Noul | 90,0% | 87,5% |
| Choice | 88,0% | 88,0% |
| Score | 76,0% | 76,0% |
| Calibration PPL | 1,913 | 1,912 |
| Decision Index 0.4.1 | 65,98 | no disponible |

Rendimiento medido en Mac mini M4 Pro 48 GB con MLX 8-bit:

| Metrica | Valor |
|---|---|
| Tamano en disco | 30,41 GB |
| Tiempo de carga | 9,42 s |
| Memoria residente pico | 20,15 GB |
| Latencia de decisión (mediana) | 2215 ms |
| Throughput sostenido | 0,78 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 20,15 GB de memoria residente pico medidos con 8 bits; se recomienda al menos 24 GB de memoria unificada para margen.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en GPU de consumo Apple: sí, en equipos Apple Silicon con 32 GB o más de memoria unificada; con 24 GB el margen es ajustado.
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX; para CUDA habría que usar los pesos bf16 originales o una conversión GGUF no incluida en este repositorio.
- Opciones de despliegue: `mlx_lm` con el loader `OneJev` incluido; el repositorio aporta `serve.patch`, `setup.sh` y `engine.py` para montar un servidor local compatible con `/v1/systemone`.
- Latencia y throughput: mediana de 2215 ms por decisión y 0,78 decisiones cortas por segundo en el hardware indicado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones completas (contexto, idiomas) del modelo base, por lo que la comparación con alternativas de la misma categoría no está disponible en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/mammoth-v1-27B-MLX-8bit | 27,36 B | no disponible | MIT | safetensors MLX 8-bit | Conversión para Apple Silicon |
| baselabs/mammoth-1 | no disponible | no disponible | MIT | no disponible | Modelo base original |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | Sin datos para comparar |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación no evaluado: las métricas publicadas se centran en tareas de decisión cerrada, no en generación abierta.
- La longitud de contexto no está especificada, lo que impide garantizar el rendimiento en entradas largas.
- Los idiomas soportados no están documentados; no hay evidencia de calidad en castellano.
- El modelo está empaquetado exclusivamente para MLX; no es directamente utilizable en CUDA, vLLM o llama.cpp sin conversión adicional.
- La licencia MIT se hereda del modelo base, pero la model card advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream.
- Las métricas de calidad y latencia provienen de una única máquina (Mac mini M4 Pro 48 GB) y de la evaluación del propio autor de la conversión; no han sido replicadas de forma independiente.
- El repositorio incluye scripts ejecutables (`setup.sh`, `serve.patch`, `engine.py`, `onejev_mlx.py`); conviene revisarlos antes de ejecutarlos en producción.
- Solo 420 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-8bit
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Auditoría KL incluida en el repo: `kl_audit.json` (https://huggingface.co/sergolsub/mammoth-v1-27B-MLX-8bit/blob/main/kl_audit.json)
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de `mlx_lm`: https://github.com/ml-explore/mlx-lm
