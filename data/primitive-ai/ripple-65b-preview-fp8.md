# primitive-ai/Ripple-65B-Preview-FP8

## Resumen

Ripple-65B-Preview-FP8 es una compilación cuantizada en FP8 del modelo Ripple-65B-Preview desarrollado por ricursiveAI, publicada por primitive-ai. Se trata de un transformer decoder-only de 64.782.689.360 parámetros (aproximadamente 65B) orientado a razonamiento, uso agéntico y generación de código, con una ventana de contexto declarada de 2.097.152 posiciones. La versión FP8 reduce el peso de 129,57 GB en BF16 a 65,85 GB, lo que permite servir el modelo completo en una única GPU de 96 GB sin paralelismo tensorial.

La relevancia de esta build reside en su perfil de degradación: mantiene una deriva de solo +1,72×10⁻³ nats por token respecto a BF16, con un 98,6% de acuerdo top-1, lo que la sitúa como una alternativa de cuantización más fiel que las variantes NVFP4 del mismo modelo base. Además, incluye soporte para tool calling y un parser de razonamiento específico (`ripple`) que separa el bloque `<think>` de la respuesta final.

El modelo se distribuye con licencia Apache 2.0, únicamente en inglés, y requiere una versión de vLLM con el PR vllm-project/vllm#65745 aplicado, ya que ninguna release pública soporta todavía esta arquitectura. Es, por tanto, una build de previsualización orientada a entornos controlados de evaluación más que a despliegues estándar inmediatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según model card; detalles internos no disponibles) |
| Parametros totales | 64.782.689.360 (~65B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 2.097.152 posiciones declaradas; métricas publicadas solo hasta 32.768 |
| Tipos de cuantizacion | FP8 E4M3 W8A8 (pesos por canal de salida, activaciones por token en runtime); embeddings, LM head, norms, Q/K norms por cabeza y escalares value-residual en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 65,85 GB; repo de 65,8 GB |

## Arquitectura y entrenamiento

La información disponible confirma que Ripple-65B-Preview es un transformer decoder-only con 64.782.689.360 parámetros y una ventana de 2.097.152 posiciones. La build FP8 cuantiza cada capa Linear del decoder a FP8 E4M3 con una escala por canal de salida, mientras que las activaciones se cuantizan a FP8 por token en tiempo de ejecución. Permanecen en BF16 los embeddings, el LM head, las normas, las normas Q/K por cabeza y los escalares de value-residual. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es la propia cuantización: la build logra una deriva de +1,72×10⁻³ nats por token frente a BF16 sobre 400 trazas de razonamiento (185.735 tokens de finalización), con un error estándar de 0,16 entre trazas. El proceso de medición es determinista. El modelo abre su propio bloque `<think>` de forma automática y la plantilla de chat no expone un interruptor para desactivarlo, lo que condiciona el diseño de los pipelines de inferencia.

## Capacidades

- Generación de texto conversacional y de razonamiento, con bloque `<think>` autogenerado y separable mediante el parser `ripple`.
- Razonamiento multi-paso y uso agéntico, con soporte de tool calling y function calling a través de `--enable-auto-tool-choice` y `--tool-call-parser ripple`.
- Generación de código y tareas de coding, según los tags del modelo.
- Respuesta a preguntas de conocimiento: 91,0 sobre 1.170 ítems en la suite de conocimiento medida.
- Tool calling medido: 85,4 sobre 200 ítems con `temperature 0.6`, `top_p 0.95`, `top_k 20` y presupuesto de 16.384 tokens.
- Capacidad de abstención: 61,7 en la métrica de abstain, superior a los 56,7 de BF16.
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Visión y audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada con contexto largo: el modelo soporta una ventana declarada de 2.097.152 posiciones y, con `--max-model-len 131072`, obtiene un pool KV de 225.291 tokens en una RTX PRO 6000 Blackwell de 96 GB, lo que permite conversaciones multi-turno con historial extenso y documentos adjuntos.
- Agentes con tool calling en producción: el parser `ripple` devuelve llamadas estructuradas como `get_weather {"city": "Lisbon"}`, lo que facilita la integración en orquestadores de agentes que necesitan separar razonamiento y acción.
- Asistentes de código en IDE: el modelo está etiquetado para coding y razonamiento, y su bloque `<think>` permite mostrar al usuario solo la respuesta final mientras se conserva la traza de razonamiento para depuración.
- Evaluación de pipelines de razonamiento: la build FP8 sirve como sustituto de BF16 en entornos de una sola GPU, con una deriva de +1,72×10⁻³ nats/token y 98,6% de acuerdo top-1, suficiente para validar flujos antes de escalar a la versión completa en dos GPUs.
- Despliegue en una única GPU de 96 GB: al cargar 61,90 GiB de pesos y arrancar en 201 s, encaja en infraestructura de una tarjeta profesional (RTX PRO 6000 Blackwell, sm_120) sin paralelismo tensorial, lo que simplifica la operación frente a BF16, que requiere tensor parallel 2.
- Generación de documentación técnica y resúmenes con abstención controlada: la métrica de abstain de 61,7 frente a 56,7 de BF16 sugiere que la build FP8 tiende algo más a no responder cuando no dispone de información, lo que puede aprovecharse en flujos donde la precisión prima sobre la cobertura.
- Servicio de inferencia a concurrencia media: con 18,0 tok/s en single-stream y 138 tok/s a concurrencia 32, es adecuado para cargas interactivas moderadas en una sola tarjeta, no para despliegues de alto throughput.

## Benchmarks y rendimiento

Datos medidos en una RTX PRO 6000 Blackwell de 96 GB, sin tensor parallelism, KV cache en BF16, suites de 1.170 ítems (conocimiento) y 200 ítems (tool calling), `temperature 0.6` / `top_p 0.95` / `top_k 20`, presupuesto de 16.384 tokens, concurrencia 32, autoevaluación sin juez LLM. Throughput medido con 8K de entrada / 512 de salida, sin prefix cache, dos semillas por celda.

| Build | Formato | Tamano | Deriva (×10⁻³ nats/token) | Acuerdo top-1 | Knowledge | Tool call | Abstain | Finished | tok/s @1 | tok/s @32 | KV pool (tokens) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ripple-65B-Preview (BF16) | BF16 | 129,57 GB | 0 (referencia) | 100% | 90,5 | 86,2 | 56,7 | 99,4% | n/a | n/a | n/a |
| Ricursive NVFP4 | NVFP4 W4A4 MLP, atención BF16 | 57,22 GB | +5,49 | 97,3% | 90,4 | 85,4 | 58,3 | 99,4% | 21,0 | 180 | 157.351 |
| **Este repo (FP8)** | FP8 W8A8, todas las Linear del decoder | **65,85 GB** | **+1,72** | 98,6% | 91,0 | 85,4 | 61,7 | 99,3% | 18,0 | 138 | 118.546 |
| NVFP4A16 | NVFP4 W4A16, todas las Linear del decoder | 37,92 GB | +14,63 | 96,5% | 90,3 | 84,6 | 56,7 | 99,4% | 26,3 | 110 | 251.501 |

La tabla no cubre contexto más allá de 32K ni GPUs distintas de la RTX PRO 6000 Blackwell (sm_120).

## Requisitos de hardware

- VRAM estimada: 65,85 GB de pesos en disco; vLLM reporta 61,90 GiB de pesos cargados. Con `--gpu-memory-utilization 0.92` en una tarjeta de 96 GB se obtiene un pool KV de 118.546 tokens a ventana de 32.768, y de 225.291 tokens a ventana de 131.072.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB, sm_120), única configuración validada. No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no hay evidencia; una RTX 4090 de 24 GB no puede alojar 61,90 GiB de pesos sin cuantización adicional no publicada.
- Opciones de despliegue: vLLM exclusivamente, con la nightly `nightly-a2bcb5657a88` más los ficheros del PR vllm-project/vllm#65745 (head `d53dfbc2c76d`). La imagen `vllm-ripple:pr65745` no está publicada; debe construirse con `vllm_ripple/build.sh` del repositorio.
- Arranque: 201 s en una tarjeta inactiva con los flags indicados.
- Throughput: 18,0 tok/s en single-stream y 138 tok/s a concurrencia 32 (8K in / 512 out, sin prefix cache).
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Deriva vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ripple-65B-Preview-FP8 (este repo) | ~65B | 2.097.152 (medido hasta 32.768) | FP8 W8A8, 65,85 GB | +1,72×10⁻³ nats/token | apache-2.0 | vLLM con PR #65745 |
| Ripple-65B-Preview (BF16) | ~65B | 2.097.152 | BF16, 129,57 GB | referencia | apache-2.0 | requiere tensor parallel 2 |
| Ripple-65B-Preview-NVFP4 | ~65B | 2.097.152 | NVFP4 W4A4 MLP, 57,22 GB | +5,49×10⁻³ nats/token | apache-2.0 | publicado por ricursiveAI |
| Ripple-65B-Preview-NVFP4A16 | ~65B | 2.097.152 | NVFP4 W4A16, 37,92 GB | +14,63×10⁻³ nats/token | apache-2.0 | publicado por primitive-ai |

No se dispone de información sobre modelos comparables de otros desarrolladores con el mismo tamaño y tarea.

## Limitaciones y advertencias

- Soporte de vLLM incompleto: ninguna release pública ejecuta esta arquitectura; es necesario aplicar el PR #65745 sobre una nightly concreta, lo que introduce riesgo de rotura en producción.
- Contexto validado limitado: todas las métricas se midieron a 32.768 tokens o menos, pese a que la ventana declarada es de 2.097.152 posiciones; el comportamiento más allá de 32K no está verificado.
- Cobertura de hardware restringida: solo se probó en RTX PRO 6000 Blackwell (sm_120); no hay datos para A100, H100, RTX 4090 ni otras arquitecturas.
- Idioma: únicamente inglés declarado; el rendimiento en castellano no está medido.
- Riesgo de alucinación: la métrica de abstain es 61,7, lo que implica que en aproximadamente un 38% de los casos en que debería abstenerse no lo hace; requiere validación en dominios sensibles.
- Bloque de razonamiento no desactivable: el modelo abre `<think>` automáticamente y la plantilla de chat no ofrece interruptor, lo que incrementa tokens de salida y requiere un parser para separar la respuesta final.
- Throughput moderado: 18,0 tok/s en single-stream limita su uso en aplicaciones de baja latencia estricta.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de un PR no fusionado traslada el riesgo operativo al equipo de despliegue.
- Build de previsualización: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/primitive-ai/Ripple-65B-Preview-FP8
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante NVFP4 del autor base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Variante NVFP4A16 de primitive-ai: https://huggingface.co/primitive-ai/Ripple-65B-Preview-NVFP4A16
- PR de soporte en vLLM: https://github.com/vllm-project/vllm/pull/65745
- Web del autor: https://primitive.com
