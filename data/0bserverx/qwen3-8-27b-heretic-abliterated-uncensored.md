# 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored

## Resumen

RVN Qwen3.8-27B-Heretic-Abliterated-Uncensored es un modelo de generación de texto publicado por el usuario 0bserverx, distribuido en formato safetensors FP16 como release complementaria de su repositorio principal en GGUF. A pesar del nombre comercial "Qwen3.8-27B", la arquitectura real declarada en la configuración es `Qwen3_5ForCausalLM` / `qwen3_5_text`, con 26.895.998.464 parámetros (~26,9 B) y un total de 851 tensores de pesos de texto, incluidas las embeddings y la cabeza LM no atada.

El modelo es una variante "abliterated" y "uncensored", es decir, un ajuste derivado en el que se han modificado los pesos para eliminar el comportamiento de rechazo típico de los modelos alineados. Esta release concreta no es un nuevo entrenamiento ni una nueva pasada de abliteración: se ha reconstruido a partir del fichero `RVN-F16.gguf` del repositorio base, por lo que no es una recuperación exacta del checkpoint BF16 original, que no está disponible.

Su relevancia práctica es doble. Por un lado, permite a usuarios de vLLM y SGLang cargar los pesos directamente sin pasos de conversión ni merge, algo que no era posible con el repositorio GGUF original. Por otro, el autor documenta configuraciones de servicio verificadas sobre una NVIDIA RTX PRO 6000 Blackwell con vLLM 0.28.0 y SGLang 0.5.19, incluyendo soporte de tool calling con el parser `qwen3_coder`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` / `qwen3_5_text` (familia Qwen3.5, con componentes SSM/Mamba según los flags de servicio) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible en la model card; las configuraciones de servicio verificadas usan 4.096 tokens |
| Tipos de cuantizacion | FP16 (pesos principales), F32 en tensores de estabilidad (353 tensores), GGUF estandar (incluye IQ3_S), GSQ-RCO no uniforme por tensor (4 niveles + gemelos MTP, 8,45-11,80 GB), GSQ-3bit en compressed-tensors (lineales MLP) |
| Idiomas soportados | No disponible. La verificacion incluye pruebas en ingles y turco |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards, 851 tensores de texto); GGUF y compressed-tensors en repos derivados |

Datos adicionales de la release: payload de tensores de 53.797.287.936 bytes (excluyendo cabeceras), tamano del repositorio de 82,2 GB, 709 descargas y 0 likes en el momento de la consulta. Fechas de creacion y ultima actualizacion: 6 y 20 de septiembre de 2026.

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni la composicion del dataset. Lo que se sabe es que se trata de un derivado de la familia Qwen3.5 cuyo nombre de arquitectura registrado es `Qwen3_5ForCausalLM`. La presencia de los flags `--mamba-ssm-cache-dtype float32` en vLLM y `--mamba-ssm-dtype float32` / `SGLANG_MAMBA_CONV_DTYPE` en SGLang indica que el modelo incorpora capas de espacio de estados (SSM/Mamba) ademas de atencion, es decir, una arquitectura hibrida. Esto se confirma indirectamente por la advertencia del autor sobre el desajuste BF16/FP16 en el estado de convolucion durante el warmup de Triton en SGLang.

El aspecto "Heretic-Abliterated-Uncensored" corresponde a una modificacion de pesos orientada a suprimir direcciones de rechazo, no a un entrenamiento supervisado adicional con RLHF o DPO documentado. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni las tecnicas de alineacion aplicadas antes de la abliteracion.

La innovacion tecnica mas destacable de esta release es de ingenieria de distribucion: la reconstruccion de un checkpoint safetensors a partir de un GGUF F16, preservando 498 tensores en F16 y 353 en F32 para no degradar los tensores de estabilidad, y manteniendo la cabeza LM no atada. La release incluye la plantilla de chat reparada del repositorio de origen. Se advierte explicitamente de que no incluye codificador ni proyector de vision, ni cabeza MTP (multi-token prediction), y de que dichos pesos no se han fabricado ni sustituido por los de otro checkpoint.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla reparada por el autor.
- Tool calling / function calling: probado con `tool_choice: "auto"` y el parser `qwen3_coder` en vLLM y SGLang.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que sugiere soporte de razonamiento explicito cuando se activa.
- Salida estructurada: la verificacion incluye una respuesta JSON valida (`{"animal":"cat"}`).
- Capacidad multilingue limitada pero evidenciada: la bateria de pruebas incluye traduccion al turco ("Gunaydin").
- Inferencia servida en vLLM y SGLang con pesos safetensors cargados en FP16, sin pasos de merge.
- No dispone de vision ni de audio: la release es solo texto.
- No dispone de cabeza MTP, por lo que no puede usarse decodificacion especulativa basada en MTP con estos pesos.

## Casos de uso

- Servicio de chat autoalojado en vLLM o SGLang: el repositorio raiz es cargable directamente por ambos backends con `--dtype float16`, sin conversion previa, lo que simplifica el despliegue en infraestructura propia.
- Agentes con llamada a herramientas: el soporte verificado de `--enable-auto-tool-choice --tool-call-parser qwen3_coder` permite integrarlo en pipelines de agentes que necesitan invocar funciones externas y encadenar pasos.
- Generacion de salida estructurada para integracion con APIs: la verificacion de JSON valido lo hace apto para tareas de extraccion de campos y rellenado de esquemas en sistemas backend.
- Traduccion automatica y asistentes multilingues ligeros: el modelo resuelve al menos pares ingles-turco en las pruebas documentadas, util para prototipos de localizacion.
- Experimentacion en interpretabilidad y seguridad de IA: al tratarse de una variante abliterated con el procedimiento documentado en el repositorio principal, es un objeto de estudio para investigar como la supresion de direcciones de rechazo afecta al comportamiento del modelo.
- Investigacion sobre cuantizacion agresiva: la serie GSQ-RCO ofrece cuatro niveles no uniformes por tensor con mediciones de perplejidad publicadas, lo que permite estudiar el compromiso tamano-calidad en GPUs de gama consumer.
- Fine-tuning y adaptacion con LoRA: al disponer de pesos completos en safetensors, es posible entrenar adaptadores sobre el modelo sin partir de un GGUF, que no es adecuado para entrenamiento.
- Evaluacion comparativa de backends: las configuraciones verificadas de vLLM y SGLang permiten reproducir la misma carga de trabajo en ambos motores y comparar latencia y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados son de perplejidad sobre wikitext-2 y de verificacion funcional.

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2, referencia F16 | 6,1197 |
| Perplejidad wikitext-2, GSQ-RCO `IQ3_S` | 6,1778 (+0,95 % frente a F16) |
| Perplejidad wikitext-2, cuantizacion uniforme de clase equivalente | +2,9 % frente a F16 (tamano mayor) |
| Prueba funcional ingles | Respuesta `Cat` |
| Prueba funcional turco (traduccion) | Respuesta `Gunaydin` |
| Prueba funcional JSON | Respuesta `{"animal":"cat"}` |
| Prueba funcional de tool call | Una llamada parseada correctamente (resultado truncado en la model card) |

## Requisitos de hardware

- Pesos FP16: 53.797.287.936 bytes de payload en tensores (unos 53,8 GB), mas cabeceras y activos auxiliares; el repositorio completo ocupa 82,2 GB en disco.
- VRAM estimada para inferencia en FP16: por encima de 54 GB solo para pesos, mas cache KV y buffers. Con `--gpu-memory-utilization 0.80` el autor lo ejecuto en una NVIDIA RTX PRO 6000 Blackwell Server Edition.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (configuracion verificada), A100 80 GB y H100 80 GB son candidatas por capacidad de VRAM, aunque no estan verificadas en la informacion disponible. Una A100 de 40 GB no seria suficiente en FP16.
- GPU de consumo: no cabe en RTX 4090, 3090 o similares de 24 GB en FP16. Las cuantizaciones GSQ-RCO de 8,45-11,80 GB si caben en GPUs de 12-16 GB de VRAM.
- Despliegue verificado: vLLM 0.28.0 y SGLang 0.5.19, con Transformers 5.12.1, Torch 2.13.0+cu130 y FlashInfer (0.6.16.post3 en vLLM, 0.6.18 en SGLang). Tambien es cargable con Transformers directamente.
- Entorno: se requiere CUDA 13.0 SDK coherente para la configuracion Blackwell/FlashInfer probada, ademas de toolchain de compilacion, cabeceras de desarrollo de Python y `ninja` accesible en `PATH`.
- Carga de la cuantizacion GSQ-3bit: requiere `transformers >= 5.8` y `compressed-tensors >= 0.15`.
- Latencia y throughput: no publicados. Las pruebas se realizaron con concurrencia 1, contexto de 4.096 tokens, temperatura 0 y CUDA graphs desactivados, por lo que no son representativas de produccion con batching.
- Nota de configuracion SGLang: es obligatorio definir `SGLANG_MAMBA_CONV_DTYPE=float16` en la version probada, ya que el estado de convolucion por defecto en BF16 provoca un desajuste BF16/FP16 en Triton durante el warmup.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de modelos de terceros comparables (por ejemplo, otros modelos densos de ~27 B de la familia Qwen u otras alternativas abliterated), por lo que no es posible establecer una comparativa externa rigurosa. La unica comparacion documentada es interna, entre los formatos de peso de este mismo modelo:

| Variante | Parametros | Formato y tamano | Perplejidad wikitext-2 | Licencia |
|---|---|---|---|---|
| RVN Qwen3.8-27B, FP16 | 26,9 B | safetensors, 53,8 GB de tensores | 6,1197 (referencia) | Apache-2.0 |
| RVN GSQ-RCO `IQ3_S` | 26,9 B | GGUF no uniforme por tensor, dentro de la serie de 8,45-11,80 GB | 6,1778 (+0,95 %) | Apache-2.0 |
| Cuantizacion uniforme de clase similar | 26,9 B | GGUF | +2,9 % frente a F16, con mayor tamano | Apache-2.0 |
| RVN GSQ-3bit | 26,9 B | compressed-tensors, 3 bits en lineales MLP | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- Modelo abliterated y etiquetado como "uncensored": se han alterado los pesos para reducir los rechazos, por lo que la alineacion de seguridad esta degradada de forma deliberada. No es apto para aplicaciones orientadas al publico sin filtros externos.
- Riesgo elevado de generacion de contenido danino, sesgado o inexacto. No se documentan evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de veracidad ni de razonamiento en la informacion disponible.
- No es el checkpoint BF16 original: los pesos se reconstruyeron desde un GGUF F16, y el autor advierte de que no es una recuperacion exacta del checkpoint previo al GGUF. Esto puede introducir diferencias respecto al modelo original.
- Solo texto: no hay codificador de vision ni proyector, y no hay cabeza MTP. Cualquier capacidad multimodal o de decodificacion especulativa MTP debe descartarse con esta release.
- Idiomas soportados no declarados. Solo hay evidencia puntual de ingles y turco, sin cobertura documentada del espanol.
- Longitud de contexto no declarada en la model card; las pruebas se hicieron a 4.096 tokens. No se debe asumir una ventana mayor sin verificarla.
- La licencia declarada es Apache-2.0, pero al derivar de pesos de la familia Qwen conviene revisar las condiciones de la licencia del modelo base original antes de un uso comercial.
- Nomenclatura confusa: el nombre indica "Qwen3.8" y "27B", mientras que la arquitectura registrada es `Qwen3_5ForCausalLM` y el recuento real de parametros es 26,9 B.
- Repositorio con traccion muy baja (709 descargas, 0 likes) y sin historial de validacion por terceros; la unica verificacion es la del propio autor.
- Se han detectado requisitos de entorno fragiles (CUDA 13.0, versiones concretas de FlashInfer y Torch, variable `SGLANG_MAMBA_CONV_DTYPE`), lo que aumenta el coste de mantenimiento en produccion.
- El nombre del modelo base declarado en HuggingFace es el propio repositorio GGUF del mismo autor, no un checkpoint oficial de Qwen.

## Enlaces

- Repositorio HuggingFace (safetensors FP16): https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Repositorio principal en GGUF: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Discusion #10 del repositorio GGUF, origen de esta release FP16: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/discussions/10
- Serie de cuantizaciones GSQ-RCO: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-GSQ-RCO-GGUF
- Carpeta GSQ-3bit (compressed-tensors) dentro del repositorio FP16: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored/tree/main/GSQ-3bit
- Perfil del autor en HuggingFace: https://huggingface.co/0bserverx
- Perfil del solicitante de la release FP16: https://huggingface.co/JC1DA
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la busqueda corresponden a comparativas de microondas compactas y no guardan ninguna relacion con el modelo.
