# kingjones777/Agents-A1-Abliterated-MTP-ROCmFP4-GGUF

## Resumen

Agents-A1-Abliterated-MTP-ROCmFP4-GGUF es una colección de cuatro cuantizaciones GGUF del modelo Agents-A1 de InternScience, un MoE de 35 505 251 456 parámetros totales con arquitectura Qwen3.5-35B-A3B de 40 capas. El trabajo de este repositorio no es el modelo base ni la abliteración, sino el injerto de un bloque de Multi-Token Prediction (MTP) en BF16 antes de cuantizar, junto con una escalera de cuantización propietaria ROCmFP4/ROCmFPX y una compilación de doble backend HIP y Vulkan para el AMD Ryzen AI Max+ 395 con GPU Radeon 8060S (gfx1151, Strix Halo).

La relevancia técnica es doble. Por un lado, el checkpoint original de InternScience no incluye capa MTP (733 tensores, sin `blk.40`), por lo que ninguna build abliterada de este modelo podía hacer decodificación especulativa; el injerto acepta a 0.963 de tasa y longitud media aceptada de 3.44 de 4, con una ganancia declarada de +19.0 % en Vulkan y +20.0 % en ROCm. Por otro lado, los tipos de tensor ggml 100-119 que usan ROCmFP4/ROCmFPX no existen en llama.cpp upstream, de modo que estos ficheros requieren una build específica del fork ROCmFPX.

El modelo está pensado para despliegue local en hardware AMD Strix Halo, con cuatro variantes entre 17.88 y 30.89 GiB, y hereda la abliteración de huihui-ai sobre el modelo base de InternScience. La model card advierte de un problema crítico de servicio: con el modo thinking activado el modelo devuelve el campo `content` vacío en la mayoría de prompts que no son de código, comportamiento que también exhibe el checkpoint upstream no abliterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-35B-A3B), 40 capas, con bloque MTP injertado |
| Parametros totales | 35 505 251 456 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin cifra confirmada en la informacion) |
| Longitud de contexto | no disponible como maximo nativo; los ejemplos de servicio usan `-c 8192` |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (ftype 102 y 106), Q6_0_ROCMFPX (ftype 114 y 116); tipos ggml 100-119 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como origen de los parametros); proyector de vision `mmproj-Agents-A1-Abliterated-BF16.gguf` en BF16 |

Variantes publicadas:

| Fichero | ftype | Tamano | BPW | Bytes |
|---|---:|---:|---:|---:|
| `Q4_0_ROCMFP4_COHERENT` | 102 | 18.93 GiB | 4.65 | 20 327 318 464 |
| `Q4_0_ROCMFP4_STRIX_LEAN` | 106 | 17.88 GiB | 4.39 | 19 199 443 904 |
| `Q6_0_ROCMFPX_AGENT` | 114 | 30.89 GiB | 7.58 | 33 169 605 568 |
| `Q6_0_ROCMFPX_LEAN` | 116 | 26.94 GiB | 6.61 | 28 931 523 520 |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas con arquitectura Qwen3.5-35B-A3B, sin capa MTP en el checkpoint original. Sobre esa base, huihui-ai aplicó la abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) y SC117 extrajo un bloque MTP que este repositorio reutiliza. El injerto se realizó en BF16 antes de la cuantización, de modo que el bloque especulativo no arrastra el error de cuantización del resto de la red.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica documentada es el injerto MTP y la escalera de cuantización ROCmFP4/ROCmFPX: tipos de tensor propios (100-119) que combinan bloques de 4 y 6 bits con mezclas de precisión por tensor, y que exigen el fork ROCmFPX de llama.cpp. La build de referencia habilita simultáneamente `GGML_HIP=ON` y `GGML_VULKAN=ON` con `AMDGPU_TARGETS=gfx1151`, permitiendo seleccionar backend en tiempo de ejecución con el flag `-dev` sin recompilar. La variante ftype 105 (`STRIX`) se omite deliberadamente porque deja `output.weight` y los tensores `*_shexp` a 4 bits.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat Jinja (`--jinja`).
- Razonamiento en modo thinking, aunque con la advertencia crítica de que no termina el razonamiento dentro de un presupuesto de tokens razonable y devuelve `content` vacío en la mayoría de prompts no de código.
- Entrada de imagen mediante el proyector de visión BF16 pasado con `--mmproj`, con recomendación de `-fa off` para puntuación de visión.
- Decodificación especulativa con MTP: `--spec-type draft-mtp`, `--spec-draft-n-max 4`, `--spec-draft-p-min 0.0`.
- Comportamiento sin censura (abliterated/uncensored) heredado de huihui-ai.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No hay información disponible sobre soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües verificadas.

## Casos de uso

- Inferencia local en AMD Strix Halo: el caso de diseño del repositorio. Se usa la variante `Q4_0_ROCMFP4_STRIX_LEAN` (17.88 GiB) con `llama-server` y `-dev Vulkan0` o `-dev ROCm0` según el perfil de carga, aprovechando que un único binario sirve ambos backends.
- Chat interactivo de baja latencia: con `enable_thinking: false`, `max_tokens` en torno a 1600 y los flags MTP activos, la decodificación especulativa aporta la ganancia declarada de +19 % en Vulkan, adecuada para turnos cortos y respuestas rápidas.
- Procesamiento por lotes de prompts largos y RAG: el backend HIP/ROCm ofrece el mejor prefill según la model card, por lo que conviene para arranques en frío y contextos largos donde el coste dominante es la fase de prefill y no la decodificación.
- Análisis de imágenes con el proyector `mmproj`: tareas de descripción o interrogación visual, ejecutando con `-fa off` para la puntuación de visión.
- Investigación sobre abliteración y alineación: el modelo permite estudiar el efecto de la eliminación de la dirección de rechazo sobre un MoE de 35B, comparando con el checkpoint original de InternScience.
- Evaluación de decodificación especulativa MTP: sirve como banco de pruebas reproducible del injerto, con tasas de aceptación y ganancias medidas sobre dos backends distintos.
- Flujos agénticos multi-turno: la model card indica explícitamente que en trabajo agéntico se deben eliminar los flags MTP, ya que la especulación cuesta un 31 % end-to-end en ese escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los únicos datos medidos son de rendimiento de decodificación especulativa:

| Metrica | Valor |
|---|---|
| Tasa de aceptación del draft MTP | 0.963 |
| Longitud media aceptada | 3.44 de 4 |
| Ganancia con MTP en Vulkan | +19.0 % |
| Ganancia con MTP en ROCm | +20.0 % |
| Coste de especulación en flujos agénticos multi-turno | -31 % end-to-end |

## Requisitos de hardware

- VRAM/ memoria unificada: entre 17.88 GiB (`STRIX_LEAN`, ftype 106) y 30.89 GiB (`ROCMFPX_AGENT`, ftype 114), más 0.84 GiB del proyector de visión si se usa entrada de imagen.
- GPU objetivo: AMD Radeon 8060S integrada en el Ryzen AI Max+ 395 (gfx1151, Strix Halo). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- No cabe en GPUs de consumo con 8-16 GB de VRAM en ninguna de las variantes publicadas; la variante más pequeña requiere ~18 GiB.
- Despliegue: exclusivamente mediante el fork ROCmFPX de llama.cpp compilado con `GGML_HIP=ON` y `GGML_VULKAN=ON`. llama.cpp upstream, Ollama, vLLM y TGI rechazan estos ficheros con `invalid ggml type 101. should be in [0, 43)`.
- Configuración de servicio de referencia: `-ngl 999 -fa on -fit off -np 1 -c 8192 --jinja`.
- Latencia y throughput absolutos: no disponibles; solo se documentan las ganancias relativas del MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Agents-A1-Abliterated-MTP (este) | 35.5B totales | no disponible | ROCmFP4/ROCmFPX (GGUF) | Apache 2.0 | Con MTP injertado, doble backend HIP/Vulkan, abliterado |
| InternScience/Agents-A1 | 35.5B totales | no disponible | safetensors y GGUF | no disponible en la informacion | Modelo base, sin capa MTP, sin abliterar |
| huihui-ai/Huihui-Agents-A1-abliterated-GGUF | 35.5B totales | no disponible | GGUF estándar | no disponible en la informacion | Abliterado, sin MTP, carga en llama.cpp upstream |
| SC117/Agents-A1-Uncensored-MTP-APEX-GGUF | 35.5B totales | no disponible | GGUF estándar | no disponible en la informacion | Fuente del bloque MTP, sin cuantización ROCmFP4 |

## Limitaciones y advertencias

- Con thinking activado el modelo devuelve `content` vacío en la mayoría de prompts no de código: no detiene el razonamiento dentro de un presupuesto de tokens razonable. Es imprescindible enviar `chat_template_kwargs: {"enable_thinking": false}`.
- El mismo defecto existe en el checkpoint upstream no abliterado, según la propia model card, por lo que no es un artefacto de la abliteración.
- Los flags MTP degradan el rendimiento un 31 % end-to-end en flujos multi-turno y agénticos; solo deben usarse en modo single-shot.
- `--spec-draft-p-min 0.0` es obligatorio para obtener la ganancia de velocidad; el valor por defecto de 0.75 limita el draft.
- Los ficheros no cargan en llama.cpp upstream, Ollama, vLLM ni TGI: requieren el fork ROCmFPX y una compilación con ambos backends.
- El proyector de visión no fue abliterado ni cuantizado; conserva el comportamiento del repositorio de origen, incluidos sus sesgos.
- Modelo abliterado: la eliminación de la dirección de rechazo reduce la fiabilidad de las negativas de seguridad y aumenta el riesgo de generar contenido dañino sin filtro.
- Riesgo de alucinación no cuantificado: no hay benchmarks de calidad publicados en la información disponible.
- Idiomas soportados no documentados.
- Sin datos de sesgo medidos ni de evaluación de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y el comportamiento defectuoso del modo thinking desaconsejan producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Agents-A1-Abliterated-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/InternScience/Agents-A1
- Abliteración de origen: https://huggingface.co/huihui-ai/Huihui-Agents-A1-abliterated-GGUF
- Fuente del bloque MTP: https://huggingface.co/SC117/Agents-A1-Uncensored-MTP-APEX-GGUF
- Fork de llama.cpp requerido: https://github.com/charlie12345/ROCmFPX
- Perfil de huihui-ai: https://huggingface.co/huihui-ai
- Perfil de SC117: https://huggingface.co/SC117
- Perfil de InternScience: https://huggingface.co/InternScience
