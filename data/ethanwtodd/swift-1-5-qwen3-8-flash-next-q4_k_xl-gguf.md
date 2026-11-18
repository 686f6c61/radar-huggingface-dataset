# ethanwtodd/Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF es una cuantización GGUF del modelo multimodal ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario ethanwtodd. No se trata de un modelo nuevo entrenado desde cero, sino de una recuantización del Q8_0 oficial de UkisAI a un layout de tipos por tensor que replica exactamente el UD-Q4_K_XL de unsloth/Qwen3.8-Flash-Next-GGUF, con el objetivo de que el servidor gufo pueda ejecutarlo en hardware Strix Halo (gfx1151) bajo ROCm.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidades de imagen-a-texto, 176.943.899.520 parámetros totales y un contexto que, según la model card, permite dos sesiones simultáneas de 262.144 tokens en un Strix Halo de 128 GB. La cuantización ocupa 111,3 GB en tres shards más un proyector de visión BF16 de 0,9 GB, un tamaño idéntico al del UD-Q4_K_XL de unsloth (diferencia inferior a 2 KB), lo que garantiza que cabe donde cabe el original.

La relevancia de esta ficha radica en que demuestra un caso de interoperabilidad entre ecosistemas: los GGUFs propios de UkisAI (tiers GSQ-RCO e IQ) no encajan en el loader de gufo, que solo acepta un conjunto estrecho de tipos de tensor, por lo que fue necesario un trabajo de recuantización con matriz de importancia y verificación tensor a tensor. Los resultados publicados por el autor muestran 71/74 tareas superadas frente a 68/74 del base de unsloth, con una reducción notable de la longitud de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con capas SSM, expertos enrutados y mecanismo de hyper-connection; incluye cabeza MTP |
| Parametros totales | 176.943.899.520 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por sesión (dos sesiones simultáneas en Strix Halo de 128 GB según la model card) |
| Tipos de cuantizacion | Q4_K, Q5_K, Q6_K, Q5_1, Q8_0, IQ4_NL, BF16, F16, F32 (layout por tensor específico) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | GGUF (3 shards + mmproj BF16) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención con capas de tipo SSM (`ssm_*` en los nombres de tensor), expertos enrutados y expertos compartidos, además de proyecciones de hyper-connection y una convolución por capa (`ple_conv1d`) asociada al embedding por capa. El pipeline declarado es image-text-to-text, con un proyector de visión separado (`mmproj-Swift-1.5-Qwen3.8-Flash-Next-BF16.gguf`, 0,9 GB) que se mantiene sin cambios respecto al repositorio GGUF de UkisAI. Dispone de una cabeza MTP (multi-token prediction) que, según la model card, no se modificó en Swift 1.5 y es compatible con el sidecar de unsloth.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card de esta cuantización se centra exclusivamente en el proceso de recuantización: parte del Q8_0 de UkisAI (cinco shards, verificados por SHA-256), aplica `llama-quantize --allow-requantize --tensor-type-file` con la matriz de importancia `imatrix-swiftfn-v1mix.gguf` (926 entradas) y fija cada tensor cuantizable al tipo del UD-Q4_K_XL. Los expertos enrutados gate/up quedan en Q4_K (una capa en Q5_K) y los down en Q5_1 (cinco capas en Q8_0); el embedding por capa usa IQ4_NL; `ple_conv1d` e hyper-connection inject se ensanchan a F32; el resto se copia sin cambios. Se verificaron los 1224 tensores contra el UD-Q4_K_XL (tipo y forma idénticos) y los tres shards contra el fichero sin dividir.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto muy largas (hasta 262.144 tokens por sesión).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text) mediante proyector de visión BF16.
- Razonamiento con modo thinking configurable (`reasoning_effort: xhigh` en las evaluaciones del autor) y presets de muestreo específicos.
- Tool calling y function calling, evaluado en tareas de copia exacta de identificadores y SHAs de 40 caracteres dentro de llamadas a herramientas.
- Tareas de agente multi-paso sobre sistema de ficheros, con verificación por código.
- Recuperación de dos saltos sobre aproximadamente 50.000 tokens de logs.
- Generación de código validada con tests unitarios en sandbox.
- Matemáticas con verificación por fuerza bruta.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction) con sidecar compatible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de sistema de ficheros: el modelo ha sido evaluado en tareas de agente multi-paso sobre filesystem con verificación por código, lo que lo hace adecuado para automatizar operaciones de lectura, edición y organización de archivos en entornos controlados con contexto largo.
- Análisis de logs extensos: con 262.144 tokens por sesión y capacidad de recuperación de dos saltos sobre ~50.000 tokens de logs, puede localizar información correlacionada en trazas largas sin truncar el contexto.
- Asistentes con tool calling preciso: la evaluación incluye copia exacta de identificadores y SHAs de 40 caracteres en llamadas a herramientas, un requisito típico de integraciones con APIs y pipelines de CI/CD donde la fidelidad del argumento es crítica.
- Generación de código en producción: los tests unitarios en sandbox y la reducción de tokens de pensamiento en tareas de código (mediana de 7,4k a 1,8k) lo hacen viable para pipelines donde la latencia importa, integrado vía gufo o llama.cpp.
- Razonamiento matemático verificado: las tareas de matemáticas con verificación por fuerza bruta y la reducción de tokens de pensamiento (7,9k a 4,5k de mediana) permiten usarlo en resolución de problemas con validación automática.
- Despliegue local en hardware consumer de gama alta: con 111,3 GB totales cabe en un Strix Halo de 128 GB ejecutando dos sesiones de 262.144 tokens con MTP, lo que habilita asistentes locales sin dependencia de la nube.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados combinándolos con texto en la misma conversación.
- Servicio multi-sesión con decodificación especulativa: el MTP permite 46,2 tok/s con `--draft-tokens 5` frente a 26,3 tok/s sin él (1,76×), útil para servir dos peticiones concurrentes a ~27,5 tok/s cada una.

## Benchmarks y rendimiento

Los datos provienen de una única máquina Strix Halo con gufo `34ebb5f` (ROCm 7.2.3, gfx1151) y muestreo con preset thinking de Qwen3.8 (temperatura 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0) a `reasoning_effort: xhigh`. La suite básica consta de 37 tareas × 2 muestras, calificadas por código.

| Modelo | Tareas superadas | Tokens de completion | Tareas que agotaron el límite |
|---|---:|---:|---:|
| Este modelo (MTP off) | 71/74 | 130k | 1 |
| Qwen3.8-Flash-Next UD-Q4_K_XL (unsloth, base) | 68/74 | 267k | 3 |
| Swift-1.5 Qwen3.8-27B FP8 (Radiance, R9700 ×2), referencia | 72/74 | 186k | 0 |
| Qwen3.8-27B FP8 (base), referencia | 67/74 | 311k | 3 |

El autor advierte que, con 74 tareas, las diferencias de tasa de acierto son indicativas pero no significativas. La diferencia consistente es la longitud de pensamiento: la mediana de tokens de completion cae de 7,4k a 1,8k en tareas de código, de 3,7k a 0,9k en tareas de contexto largo y de 7,9k a 4,5k en matemáticas.

Rendimiento con MTP:

| Métrica | Sin MTP | Con MTP (`--draft-tokens 5`) |
|---|---:|---:|
| Throughput (20 prompts) | 26,3 tok/s | 46,2 tok/s (1,76×) |
| Tokens draft aceptados | — | 76% |
| Dos peticiones concurrentes | 20,8 tok/s cada una | 27,5 tok/s cada una (1,3×) |
| Suite básica | 71/74 (130k tokens) | 69/74 (141k tokens) |

La decodificación greedy con MTP on y off es idéntica token a token sobre 20 prompts (57.982 tokens, incluyendo generaciones de 10.600 y 12.000 tokens).

## Requisitos de hardware

- VRAM/espacio estimado: 111,3 GB para los pesos GGUF completos (47,6 + 47,8 + 16,0 GB en tres shards) más 0,9 GB del proyector de visión BF16; el autor indica que cabe donde cabe el UD-Q4_K_XL de unsloth.
- Hardware validado: un único Strix Halo (gfx1151) con 128 GB de memoria bajo ROCm 7.2.3, sirviendo dos sesiones de 262.144 tokens con MTP.
- GPU recomendadas: no disponible para modelos discretos; el autor solo documenta Strix Halo. Por tamaño, requiere GPUs o APUs con al menos ~112 GB de memoria utilizable, lo que excluye todas las consumer GPU convencionales (RTX 4090 con 24 GB, etc.).
- ¿Cabe en consumer GPU? No en GPUs discretas de consumo; sí en un Strix Halo de 128 GB, que es hardware consumer de gama alta.
- Opciones de despliegue: gufo (validado, commit `34ebb5f`), llama.cpp (herramienta usada para la recuantización, `llama-quantize` de nixpkgs llama-cpp 0.7.0; la inferencia se validó con gufo). No hay confirmación de funcionamiento con vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: 26,3 tok/s sin MTP y 46,2 tok/s con MTP en Strix Halo; ~27,5 tok/s por petición con dos concurrentes y MTP, ~20,8 tok/s sin MTP.
- Almacenamiento: 112,2 GB de tamaño de repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (suite del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Q4_K_XL GGUF de Swift 1.5) | 176,9B totales | 262.144 por sesión | 71/74, 130k tokens | swift-open-license-1.0 | GGUF |
| Qwen3.8-Flash-Next UD-Q4_K_XL (unsloth) | no disponible | no disponible | 68/74, 267k tokens | no disponible | GGUF |
| Swift-1.5 Qwen3.8-27B FP8 (Radiance) | no disponible (27B según nombre) | no disponible | 72/74, 186k tokens | no disponible | FP8 |
| Qwen3.8-27B FP8 (base) | no disponible (27B según nombre) | no disponible | 67/74, 311k tokens | no disponible | FP8 |

La comparación se limita a los datos publicados por el autor en la model card; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) disponibles para ninguno de los modelos listados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una recuantización del Q8_0 de UkisAI, por lo que hereda todos los sesgos y limitaciones del modelo base, que no se documentan en la información disponible.
- Los expertos se recuantizaron desde Q8_0 y no desde BF16 (el repositorio BF16 de UkisAI está restringido); el autor no midió por separado el error adicional de redondeo de ese paso.
- La licencia swift-open-license-1.0 está etiquetada como "other" en el Hub y no se detallan sus términos en la información disponible; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- El despliegue validado es exclusivamente gufo sobre Strix Halo con ROCm 7.2.3; el comportamiento en otras GPU, backends o versiones de llama.cpp no está verificado.
- El tamaño de 111,3 GB impide su ejecución en GPUs consumer discretas y limita el despliegue a equipos con ~112 GB o más de memoria utilizable.
- Las diferencias de tasa de acierto frente al base (71/74 vs 68/74) no son estadísticamente significativas con 74 tareas, según el propio autor.
- Con MTP activado la suite bajó a 69/74 (141k tokens), diferencia dentro del ruido según el autor; no se garantiza equivalencia exacta en muestreo con MTP.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe.
- Riesgo de alucinación no cuantificado en la información disponible.
- La model card está truncada al final (sección de MTP incompleta), por lo que pueden faltar caveats adicionales del autor.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/ethanwtodd/Swift-1.5-Qwen3.8-Flash-Next-Q4_K_XL-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- GGUF Q8_0 de origen: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Repositorio GSQ-RCO (matriz de importancia): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- GGUF de referencia UD-Q4_K_XL: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio MTP de Swift: https://huggingface.co/adriandj3/Swift-1.5-Qwen3.8-Flash-Next-MTP-for-GGUF-and-NVFP4
- Servidor gufo: https://github.com/gufo-org/gufo
