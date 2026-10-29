# freakyskittle/qwen36-35b-a3b-distill

## Resumen

`freakyskittle/qwen36-35b-a3b-distill` es un modelo derivado de la familia Qwen3.6, en concreto un *merge* completo del adaptador LoRA de atención [`freakyskittle/qwen36-35b-a3b-distill-lora-l4`](https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-lora-l4) sobre el modelo base [`huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated). El autor (freakyskittle) lo publica como el equivalente en safetensors entrenables del modelo distribuido únicamente en GGUF `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`. Es, por tanto, un modelo de destilación orientada a código, trazas de razonamiento y uso de herramientas, con la torre de visión eliminada.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de 35.505.251.456 parámetros totales (35,5 B) y aproximadamente 3 B activos según el sufijo A3B del nombre, implementado como `Qwen3_5MoeForCausalLM` en transformers y como arquitectura `qwen35moe` en llama.cpp. Se distribuye en bf16 (safetensors) y en siete cuantizaciones GGUF (de 7,5 GiB a 35,2 GiB), todas con la cabeza MTP (*nextn*, una capa) incrustada, más un borrador MTP independiente en F16 para decodificación especulativa. La longitud de contexto no se documenta en la model card.

Su relevancia práctica es doble: por un lado, permite reproducir y reajustar un modelo que solo existía en GGUF; por otro, el contenido del *dataset* de destilación (mayoritariamente código, trazas de agentes SWE, seguridad y CTF) lo orienta a tareas de ingeniería de software y análisis de seguridad, no a conversación general. Conviene señalar desde el principio que el modelo base es una versión *abliterated* (sin alineamiento de rechazo) y que las métricas publicadas son evaluaciones de sanidad con muestras de 10 a 100 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); `Qwen3_5MoeForCausalLM` en transformers, `qwen35moe` en llama.cpp; incluye bloque MTP (*nextn*, 1 capa) bajo `mtp.*` |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B (según el sufijo A3B del nombre; no cuantificado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 nativo; GGUF: IQ4_XS, Q4_K_S, Q4_K_M, Q6_K, Q8_0, TQ1_0, TQ2_0; borrador MTP en F16. No se generaron cuantizaciones UD ni con matriz de importancia (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |
| Capas de atencion completa | 10 (capas sobre las que se aplicó el LoRA de atención) |
| Tamano del repositorio | 221,0 GB |
| Fecha de publicacion | 2026-10-28 |

## Arquitectura y entrenamiento

El modelo es un MoE de tipo Qwen3.5/3.6 con 35,5 B de parámetros totales y ~3 B activos por token; el adaptador se aplicó exclusivamente sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de las 10 capas de atención completa, con un LoRA de rango 32 y alpha 64 (es decir, factor de escala alpha/r = 2), lo que supone solo 6,9 M de parámetros entrenables. El *merge* se realizó en disco, fragmento a fragmento, con la fórmula `W' = W + (alpha/r) * B @ A`. La torre de visión fue eliminada, de modo que el resultado es un modelo estrictamente de texto; el bloque MTP se conserva en `mtp.*`, es ignorado por el `ForCausalLM` de Hugging Face y se pliega como capa *nextn* en cada GGUF.

El entrenamiento se hizo con un *pipeline* de Unsloth (fork propio del autor, directorio `examples/distillation_sft/`) sobre una GPU Colab L4 de 22 GiB en bf16 nativo: 1 época, secuencia de 2048 tokens, *packing* activado, batch efectivo 16, optimizador `adamw_8bit` y learning rate 2e-4. El conjunto consta de 12.502 filas que se empaquetaron en 3.001 ejemplos, con 188 pasos y una pérdida final de entrenamiento de 0,81. La mezcla de datos es aproximadamente un 69 % código y afín: un dataset privado `freakyskittle/glm-5.3-distillation` con trazas de razonamiento y uso de herramientas, Magicoder-OSS-75K, CodeFeedback, self-instruct de StarCoder2, cadenas de razonamiento de Codeforces R1, trazas de agentes de SWE-rebench, cadenas de razonamiento de seguridad (OpenVul, SecCoderX, cybench/autopenbench), un solucionador de CTF y *splits* de entrenamiento de benchmarks (GSM8K, MATH, ARC, MMLU `auxiliary_train`). No se documenta RLHF ni DPO; el ajuste es SFT de destilación sobre trazas.

Innovaciones técnicas destacables: (1) el modelo conserva una cabeza MTP de una capa que permite decodificación especulativa tipo `llama-cli --speculative` directamente con los GGUF principales, además de un borrador independiente `mtp-Merged-F16.gguf` de 3,5 GiB para flujos DFlash/DFlash2; (2) la distribución dual safetensors/GGUF hace que el mismo artefacto sirva para inferencia y para reentrenamiento; (3) el LoRA restringido a atención mantiene intacto el resto del comportamiento del modelo base.

## Capacidades

- Generación de texto conversacional (`conversational` en los tags del repositorio).
- Generación y edición de código, con sesgo fuerte hacia código por la composición del dataset (~69 %).
- Razonamiento explícito con cadenas de pensamiento, inducido por trazas de razonamiento de Codeforces R1 y del dataset privado de destilación.
- Uso de herramientas / *function calling*, a partir de las trazas de *tool-use* incluidas en el conjunto de datos.
- Razonamiento agéntico multi-paso: las trazas de agentes de SWE-rebench apuntan a tareas de resolución de incidencias sobre repositorios.
- Análisis de seguridad: cadenas de razonamiento sobre vulnerabilidades (OpenVul, SecCoderX, cybench/autopenbench) y resolución de retos CTF.
- Matemáticas y razonamiento formal: se incluyeron *splits* de GSM8K y MATH en el entrenamiento, aunque el resultado publicado en GSM8K es bajo (véase la sección de benchmarks).
- Decodificación especulativa mediante la cabeza MTP integrada o el borrador MTP independiente.
- Sin capacidades de visión: la torre visual fue eliminada del checkpoint.
- Modo *thinking* explícito, audio y otras modalidades: no disponibles o no documentados.
- Cobertura multilingüe: no disponible (no se declara lista de idiomas).

## Casos de uso

- **Asistencia a la programación en producción**: el modelo puede integrarse en un servidor `llama-server` o en un *pipeline* de CI/CD para revisar *diffs*, proponer parches y explicar código, aprovechando el 69 % de datos de código y las trazas de tipo CodeFeedback y Magicoder. Con Q4_K_M (20,2 GiB) cabe en una GPU de 24 GB.
- **Agente de resolución de incidencias sobre repositorios**: las trazas de SWE-rebench del entrenamiento lo orientan a tareas de localizar el fallo, editar ficheros y verificar; encaja en un bucle agéntico con ejecución de tests y *tool calling*.
- **Auditoría de seguridad y revisión de vulnerabilidades**: las cadenas de razonamiento de OpenVul, SecCoderX y cybench permiten usarlo como primer filtro en revisiones de código de seguridad, señalando posibles CWEs antes de la revisión manual.
- **Formación y retos CTF**: el conjunto incluye trazas de solucionador de CTF, adecuado para entornos de práctica controlados (laboratorios, competiciones autorizadas); requiere revisión legal antes de cualquier uso ofensivo real.
- **Razonamiento algorítmico y preparación de entrevistas técnicas**: con cadenas de razonamiento de Codeforces R1, sirve para generar explicaciones paso a paso de problemas de algoritmia y estructuras de datos.
- **Automatización con *tool calling* en asistentes internos**: las trazas de *tool-use* del dataset privado permiten conectarlo a APIs y bases de datos mediante esquemas de funciones, con el modelo devolviendo llamadas estructuradas.
- **Despliegue local en estación de trabajo**: con `TQ1_0` (7,5 GiB) o `TQ2_0` (9,0 GiB) se puede ejecutar en GPUs consumer de 12–16 GB, útil para prototipado sin conexión y sin coste de API.
- **Reducción de latencia en inferencia interactiva**: la cabeza MTP integrada y el borrador `mtp-Merged-F16.gguf` permiten decodificación especulativa en llama.cpp, relevante en asistentes de autocompletado donde la latencia por token es crítica.
- **Investigación sobre adaptadores LoRA fusionados**: al publicarse tanto el adaptador como el modelo fusionado en safetensors bf16, sirve como caso de estudio reproducible de *merge* en disco y de conversión a GGUF con cabezas MTP.

## Benchmarks y rendimiento

Evaluaciones de sanidad publicadas por el autor (muestras pequeñas, sobre el adaptador, según advierte la propia model card):

| Benchmark | Resultado | Tamano de muestra |
|---|---|---|
| ARC-Challenge (val) | 96,0 % | n=100 |
| MMLU (test) | 81,0 % | n=100 |
| GSM8K (test) | 40,0 % | n=10 |

El autor indica explícitamente que se trata de una comprobación de sanidad y no de una ejecución rigurosa de benchmarks. No hay resultados publicados de HumanEval, MBPP, SWE-bench ni de evaluaciones de contexto largo en la información disponible. El dato de GSM8K con n=10 tiene un margen de error de decenas de puntos porcentuales y no debe citarse como rendimiento real. Además, los *splits* de GSM8K, MATH, ARC y MMLU se incluyeron en el entrenamiento, por lo que las cifras de ARC y MMLU están potencialmente contaminadas.

## Requisitos de hardware

- **VRAM según cuantización** (tamaño de fichero, sin contar caché KV ni overhead del runtime, que no están documentados):
  - `TQ1_0`: 7,5 GiB.
  - `TQ2_0`: 9,0 GiB.
  - `IQ4_XS`: 18,1 GiB; `Q4_K_S`: 19,0 GiB; `Q4_K_M`: 20,2 GiB.
  - `Q6_K`: 27,2 GiB.
  - `Q8_0`: 35,2 GiB.
  - bf16 safetensors: ~71 GB de pesos (35,5 B × 2 bytes), más estado de activaciones.
  - Borrador MTP `mtp-Merged-F16.gguf`: 3,5 GiB adicionales si se usa decodificación especulativa.
- **GPU recomendadas**:
  - bf16: A100 80 GB, H100 80 GB, o dos A100/H100 de 40 GB en tensores paralelos.
  - `Q8_0` (35,2 GiB): A100 40 GB justo, A100 80 GB o L40S 48 GB con holgura.
  - `Q6_K` (27,2 GiB): A100 40 GB, L40S 48 GB; no cabe en 24 GB.
  - `Q4_K_M` / `Q4_K_S` / `IQ4_XS` (18–20 GiB): RTX 4090 o RTX 3090 de 24 GB, con contexto limitado por la caché KV.
- **Cabe en GPU consumer**: sí, en RTX 4090/3090 (24 GB) con cuantizaciones de 4 bits; en RTX 4070 Ti/4080 (12–16 GB) solo con `TQ2_0` o `TQ1_0`.
- **Opciones de despliegue**: llama.cpp (`llama-cli -m gguf/... -cnv`, `llama-server`) requiere una versión reciente con soporte de la arquitectura `qwen35moe`; transformers con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")` requiere soporte de `qwen3_5_moe`. Los ficheros GGUF son importables en runtimes compatibles con GGUF (por ejemplo Ollama o LM Studio), aunque esto no se verifica explícitamente en la model card. Soporte en vLLM o TGI: no disponible en la información proporcionada.
- **Latencia y throughput**: no disponibles. No se han publicado medidas de tokens por segundo ni de ganancia de la decodificación especulativa con MTP.
- **Conversión**: los GGUF se generaron con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp; no se produjeron cuantizaciones UD/imatrix porque la máquina de conversión era CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `freakyskittle/qwen36-35b-a3b-distill` (este) | 35,5 B totales / ~3 B activos | no disponible | ARC-C 96,0 % (n=100), MMLU 81,0 % (n=100), GSM8K 40,0 % (n=10) | Apache 2.0 | safetensors bf16 + 7 GGUF + borrador MTP |
| `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated` (base) | 35,5 B aprox. | no disponible | no disponible | no disponible en la información aportada | safetensors (incluye torre de visión, presumiblemente) |
| `freakyskittle/qwen36-35b-a3b-distill-lora-l4` (adaptador) | 6,9 M entrenables | no disponible | mismas evaluaciones de sanidad | Apache 2.0 (según el repositorio fusionado) | adaptador LoRA |
| `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive` | no disponible | no disponible | no disponible | no disponible | solo GGUF |

No se dispone de datos verificados en la información proporcionada para comparar con otras alternativas MoE de tamaño similar (por ejemplo, otras variantes de la familia Qwen3.5/3.6); cualquier comparación de rendimiento con ellas sería especulativa.

## Limitaciones y advertencias

- **Modelo base *abliterated***: el punto de partida es `Huihui-Qwen3.6-35B-A3B-abliterated`, una variante sin el comportamiento de rechazo del modelo original. No debe desplegarse en aplicaciones de cara al público sin un filtro de seguridad externo.
- **Riesgo de alucinación**: no se ha publicado ninguna evaluación de veracidad, tasa de alucinación ni calibración. El ajuste SFT sobre trazas de razonamiento puede producir cadenas de pensamiento plausibles pero incorrectas.
- **Benchmarks no fiables**: las tres métricas publicadas usan muestras de 10 a 100 ejemplos y el propio autor las califica de comprobación de sanidad. Además, ARC, MMLU, GSM8K y MATH aparecen en los datos de entrenamiento, lo que invalida su uso como medida de capacidad general.
- **GSM8K bajo**: el 40 % con n=10 es un indicador débil y posiblemente pesimista, pero no hay ningún dato que permita afirmar un rendimiento sólido en matemáticas.
- **Idiomas no declarados**: no se especifica lista de idiomas ni evaluación multilingüe; el dataset es mayoritariamente en inglés, por lo que el rendimiento en castellano es una incógnita.
- **Sin visión**: la torre visual fue eliminada; no puede procesar imágenes aunque el modelo base sí pudiera.
- **Contexto no documentado**: se desconoce la ventana de contexto efectiva y no se ha evaluado el rendimiento en contextos largos.
- **Dependencia de versiones muy recientes**: requiere transformers con soporte `qwen3_5_moe` y llama.cpp con arquitectura `qwen35moe`; versiones anteriores fallarán al cargar.
- **Licencia**: el repositorio declara Apache 2.0, pero al derivar de un modelo de la familia Qwen conviene verificar los términos del modelo base y del dataset de destilación (parte del cual es privado) antes de un uso comercial.
- **Datos privados**: el componente principal de la mezcla (`freakyskittle/glm-5.3-distillation`) es privado y no se puede auditar su procedencia ni sus condiciones de uso.
- **Trazas de seguridad y CTF**: parte del entrenamiento proviene de material ofensivo; el uso debe limitarse a entornos autorizados y con revisión legal.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill
- Adaptador LoRA de origen: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-lora-l4
- Modelo base *abliterated*: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Modelo GGUF de referencia al que equivale: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Fork de Unsloth usado para el entrenamiento: https://github.com/Jackson57279/unsloth
- Dataset de destilación (privado, citado en la model card): `freakyskittle/glm-5.3-distillation`

Nota: los resultados de la búsqueda web proporcionados no contienen ningún enlace relevante al modelo (devuelven páginas de ChatGPT y su entrada de Wikipedia), por lo que la lista anterior se limita a los enlaces presentes en la model card del repositorio.
