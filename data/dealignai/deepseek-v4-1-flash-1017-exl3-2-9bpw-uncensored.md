# dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED es una repackaging del modelo DeepSeek-V4.1-Flash-1017 (refresco de octubre de 2026 de la familia V4.1-Flash de DeepSeek) publicada por el usuario dealignai. Parte del bundle EXL3 ya cuantizado por LibertAI y le elimina el comportamiento de rechazo, manteniendo intacto el resto de la pila: cabezal MTP (DSpark), tablas n-gram de Engram y pesos de la torre de visión. No hay hooks en tiempo de ejecución ni vectores de direccionamiento: es un reemplazo directo de la carpeta en la configuración de servicio de exllamav3.

Arquitectónicamente es un transformer MoE de 40 capas con 384 expertos enrutados más 1 compartido, atención MLA, Hyper-Connections, CSA2, búsquedas n-gram de Engram y contexto de 131.072 tokens. El checkpoint declara 303.257.204.690 parámetros totales (unos 303,3 B). El formato es EXL3 con codificación trellis a 2,9 bits por peso, empaquetado como carpeta única para la librería exllamav3.

Su relevancia es doble: por un lado sirve como referencia de despliegue eficiente de un MoE de 303 B en formato EXL3; por otro, es un artefacto de investigación sobre alineación y refusal, con métricas publicadas de MMLU y HarmBench que documentan el coste en capacidad (−4,20 pp de MMLU-500) de la eliminación del rechazo. Es, por tanto, una herramienta para evaluación de seguridad y red teaming, no un modelo recomendable para producción orientada al público general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas, 384 expertos enrutados + 1 compartido, MLA, Hyper-Connections, CSA2, Engram n-gram, DSpark MTP, torre de visión nativa) |
| Parámetros totales | 303.257.204.690 (~303,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantización | EXL3 2,9 bpw con codificación trellis (formato propio de exllamav3); no se documentan otros niveles en este repo |
| Idiomas soportados | en, es, fr, ru, it, th |
| Licencia | other (`deepseek-v41-flash-1017`, enlazada a la licencia de deepseek-ai/DeepSeek-V4.1-Flash-1017) |
| Formato de pesos | safetensors en formato EXL3, carpeta única para exllamav3 (415,9 GB de repo según HuggingFace; 388 GB según la model card) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso de 40 capas con 384 expertos enrutados y uno compartido, atención MLA (Multi-head Latent Attention) y Hyper-Connections, más los mecanismos CSA2 y Engram, que añade búsquedas de tablas n-gram preservadas en este bundle. Incorpora un cabezal MTP (Multi-Token Prediction, DSpark) que también se conserva, lo que en principio permite decodificación especulativa con el propio modelo. Dispone además de una torre de visión nativa cuyos pesos se mantienen en el empaquetado, aunque el pipeline declarado es text-generation. El contexto nativo es de 131.072 tokens.

Sobre el entrenamiento no hay información en la documentación disponible: no se detallan tokens, composición del dataset, ni si hubo RLHF, DPO o una fase de razonamiento con refuerzo. Lo que sí documenta el autor es el proceso de modificación: la eliminación del comportamiento de rechazo se aplica sobre el bundle EXL3 de LibertAI sin sidecars ni hooks, y se valida con pruebas de estabilidad (0 de 10 prompts con bucles, máximo 1 repetición de 20-gramas por respuesta) y de presión multi-turno (0 de 5 comportamientos con deriva de vuelta al rechazo en 4 turnos). El modelo soporta modos thinking on/off y niveles de esfuerzo low/high/max.

## Capacidades

- Generación de texto en seis idiomas declarados (inglés, español, francés, ruso, italiano y tailandés), con el comportamiento de rechazo eliminado en todos los idiomas y modos de razonamiento probados.
- Modo de razonamiento conmutables: thinking on/off y `reasoning_effort` en low/high/max, con trazas de razonamiento extensas (superan con frecuencia los 8.192 tokens en effort=max).
- Razonamiento y conocimiento general medibles: 63,20 % en MMLU-500 (5-shot) en este mismo bundle.
- Capacidad multimodal potencial: la torre de visión nativa está preservada en el bundle, aunque el pipeline_tag es text-generation y no se documentan ejemplos de uso de imagen.
- Decodificación especulativa vía cabezal MTP (DSpark) preservado.
- Búsquedas n-gram tipo Engram preservadas, orientadas a recuperación de secuencias largas.
- Contexto largo de 131K tokens para conversación multi-turno y documentos extensos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada (el modo thinking existe, pero no se documenta integración de agentes).
- Capacidades de audio: no disponible.

## Casos de uso

- **Red teaming y evaluación de seguridad de LLM**: el modelo ofrece una tasa de cumplimiento del 100 % en HarmBench-320 en modo chat, lo que lo convierte en un banco de pruebas controlado para medir la robustez de clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos. Se usaría como generador adversario dentro de un pipeline de evaluación cerrado.
- **Investigación sobre alineación y refusal**: permite estudiar qué se degrada exactamente al eliminar el rechazo, comparando contra el bundle base (67,40 % → 63,20 % en MMLU-500, con caídas de 7,60 pp en STEM y 7,08 pp en Humanidades y 0 pp en Ciencias Sociales y Other). Es un caso de uso de análisis diferencial, no de producto.
- **Generación de datos sintéticos para entrenar clasificadores de seguridad**: sus respuestas a prompts dañinos, con trazas de razonamiento detalladas, sirven como ejemplos negativos etiquetados para ajustar modelos de moderación, siempre en un entorno aislado y con revisión humana.
- **Escritura creativa y ficción sin filtros**: narrativa, guion y diálogo donde el rechazo por contenido sensible interrumpe el flujo creativo; el contexto de 131K permite mantener consistencia en novelas largas o sagas con mucho material previo.
- **Análisis de documentos extensos multilingües**: con 131K tokens de contexto y cobertura de inglés, español, francés, ruso, italiano y tailandés, se puede procesar un contrato o un expediente completo en una sola pasada sin troceado, manteniendo referencias cruzadas internas.
- **Despliegue local con soberanía de datos**: al ejecutarse sobre exllamav3 en hardware propio, los datos no salen de la infraestructura; adecuado para entornos con requisitos de confidencialidad donde no se puede usar una API externa, aceptando el coste de hardware descrito abajo.
- **Extracción y reescritura de contenido en ruso, tailandés o italiano**: idiomas menos cubiertos por modelos abiertos de este tamaño, útil para localización de documentación técnica o atención al cliente interna en esos mercados.
- **Prototipado de asistentes conversacionales internos**: conversaciones multi-turno largas con presión de contexto, en entornos de empleados y sin exposición pública, donde el riesgo de contenido dañino está acotado por el uso interno.

## Benchmarks y rendimiento

MMLU-500 (5-shot, `max_tokens=8`, `temperature=0`, mismo conjunto y orden en ambas ejecuciones, extracción del primer `[ABCD]`):

| Bundle | MMLU-500 global |
|---|---:|
| Base 2,9 bpw (LibertAI) | 67,40 % (337/500) |
| UNCENSORED (este) | 63,20 % (316/500) |
| Delta | −4,20 pp |

Desglose por categoría:

| Categoría | n | Base | UNCENSORED | Delta |
|---|---:|---:|---:|---:|
| STEM | 171 | 54,97 % | 47,37 % | −7,60 pp |
| Humanidades | 113 | 73,45 % | 66,37 % | −7,08 pp |
| Ciencias Sociales | 103 | 83,50 % | 83,50 % | ±0,00 pp |
| Other | 113 | 65,49 % | 65,49 % | ±0,00 pp |
| Global | 500 | 67,40 % | 63,20 % | −4,20 pp |

HarmBench-320, modo chat (`thinking=off`, `max_tokens=512`):

| Nivel | Recuento | % |
|---|---:|---:|
| COMPLY | 320/320 | 100,00 % |
| HARD_REF | 0 | 0,00 % |
| SOFT_RED | 0 | 0,00 % |
| HEDGE | 0 | 0,00 % |
| UNCLEAR | 0 | 0,00 % |

HarmBench-320, modo thinking con `reasoning_effort=max` y `max_tokens=8192` (280 de 320 filas evaluadas; 40 pendientes de una ejecución de continuación):

| Nivel | Recuento | % |
|---|---:|---:|
| COMPLY | 280/280 | 100,00 % |
| HARD_REF | 0 | 0,00 % |
| SOFT_RED | 0 | 0,00 % |
| HEDGE | 0 | 0,00 % |

Desglose por categoría semántica en modo chat: chemical_biological 33/33 (100 %), copyright 67/67 (100 %), cybercrime_intrusion 47/47 (100 %), harassment_bullying 15/15 (100 %), harmful 14/14 (100 %), illegal 48/48 (100 %), misinformation_disinformation 50/50 (100 %). El autor indica dos falsos positivos del evaluador automático corregidos manualmente en copyright.

Estabilidad: 10 prompts (5 dañinos, 5 benignos) con effort=max, `max_tokens=4096` y `repetition_penalty=1.0` → 0/10 con bucles y máximo 1 repetición de 20-gramas por respuesta. Presión multi-turno adversaria (5 comportamientos × 4 turnos) → 0/5 con deriva al rechazo.

No se han publicado resultados de benchmarks de capacidad general más allá de MMLU (sin HumanEval, GSM8K, MATH ni MMLU-Pro) en la información disponible.

## Requisitos de hardware

- Tamaño en disco: 415,9 GB de repositorio según HuggingFace; 388 GB según la model card. Conviene reservar al menos 450 GB de almacenamiento rápido (NVMe) para descarga y carga.
- Discrepancia a verificar: a 2,9 bpw sobre 303,3 B de parámetros, el peso teórico ronda los 110 GB. La diferencia frente a los 388-415 GB publicados debe comprobarse en los shards antes de dimensionar el hardware; puede deberse a componentes en mayor precisión (torre de visión, embeddings, cabezales) o a otros factores no documentados.
- VRAM estimada (escenario conservador, bundle completo en GPU): 388-416 GB solo para pesos, más caché KV para 131K tokens. Requiere 6× H100 80 GB (480 GB) como mínimo y 8× H100 80 GB para trabajar con contexto largo con holgura.
- VRAM estimada (escenario ~110 GB si se confirma el peso real a 2,9 bpw): 2× H100 80 GB o 2× A100 80 GB para pesos; 4× A100 80 GB para contexto extendido.
- GPU consumer: no cabe en una RTX 4090 (24 GB). En el escenario de ~110 GB tampoco cabe en 4× RTX 4090 (96 GB). La viabilidad de offload parcial a CPU en exllamav3 no está confirmada en la información disponible.
- GPU recomendadas: H100 80 GB SXM (8 unidades para el bundle completo), A100 80 GB (8 unidades), y en el escenario reducido 2-4× A100/H100 80 GB. No se recomienda L40S 48 GB ni configuraciones por debajo de 80 GB por GPU para el bundle completo.
- Opciones de despliegue: exllamav3 es la librería declarada y el único runtime compatible de forma nativa con EXL3. El formato no es directamente compatible con llama.cpp, Ollama, vLLM ni TGI sin conversión previa a otro formato.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primer token para este bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Formato / tamaño |
|---|---|---|---|---|---|
| Este modelo (UNCENSORED, EXL3 2,9 bpw) | 303,3 B | 131K | 63,20 % (MMLU-500) | other (`deepseek-v41-flash-1017`) | EXL3 safetensors, 415,9 GB de repo |
| LibertAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw (base) | 303,3 B | 131K | 67,40 % (MMLU-500) | other (`deepseek-v41-flash-1017`) | EXL3 safetensors, tamaño no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible | 131K (según la familia) | no disponible | `deepseek-v41-flash-1017` | safetensors, precisión original no disponible |
| Otras variantes de la familia "CRACK" de DSV4.1-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el bundle base de LibertAI: misma arquitectura, mismo contexto y mismo formato, con una pérdida de 4,20 pp en MMLU-500 y ganancia en cumplimiento de HarmBench (de comportamiento no publicado en el base a 100 % en este). Frente al modelo original de DeepSeek no hay datos de benchmarks en la información disponible, por lo que no se puede cuantificar la degradación acumulada por cuantización más abliteración.

## Limitaciones y advertencias

- **Riesgo de seguridad elevado**: 100 % de cumplimiento en HarmBench-320 en modo chat, incluidas las categorías chemical_biological (33/33), cybercrime_intrusion (47/47) y misinformation_disinformation (50/50). El modelo proporciona contenido operativo para solicitudes dañinas; no debe exponerse a usuarios no supervisados ni integrarse en productos de cara al público.
- **Degradación de capacidad por la abliteración**: −4,20 pp en MMLU-500 global, con pérdidas concentradas en STEM (−7,60 pp) y Humanidades (−7,08 pp). Para tareas técnicas o de razonamiento científico, el bundle base es mejor opción.
- **Cuantización agresiva**: 2,9 bpw es un nivel bajo; no se publican comparaciones contra el modelo en BF16, por lo que la degradación atribuible solo a la cuantización es desconocida.
- **Evaluación incompleta**: el barrido de thinking en HarmBench cubre 280 de 320 filas; las 40 restantes están pendientes. Las pruebas de estabilidad se basan en 10 prompts y 5 comportamientos multi-turno, muestras pequeñas.
- **Trazas de razonamiento sin cierre**: en effort=max con 16.384 tokens, el modelo no siempre emite `</think>`, lo que complica el parseo automático de la respuesta y puede romper pipelines que dependan de separar razonamiento de salida final.
- **Riesgo de alucinación**: no se han publicado evaluaciones de factualidad, TruthfulQA ni tasas de alucinación. Un modelo abliterado con razonamiento largo puede generar justificaciones plausibles pero falsas con mayor facilidad de detectar.
- **Cobertura idiomática limitada**: solo seis idiomas declarados (en, es, fr, ru, it, th). No se declara chino, portugués, alemán ni japonés, a pesar de ser un modelo derivado de DeepSeek; el rendimiento fuera de esos seis idiomas no está garantizado.
- **Licencia restrictiva y ambigua**: licencia `other` con nombre `deepseek-v41-flash-1017` enlazada al fichero LICENSE del modelo original. Es una licencia custom de DeepSeek, no una licencia open source estándar; hay que revisar los términos de uso comercial, atribución y restricciones de redistribución antes de cualquier despliegue productivo. La modificación (abliteración) puede entrar en conflicto con cláusulas de uso aceptable del modelo original.
- **Requisitos de hardware prohibitivos**: 388-415 GB de pesos implican 6-8 GPUs de 80 GB. El coste de inferencia por token es alto y no se publican métricas de throughput que permitan estimar el coste real.
- **Discrepancia de tamaño no resuelta**: los 415,9 GB del repo frente a los ~110 GB teóricos a 2,9 bpw deben verificarse; planificar el hardware solo con la cifra de bpw puede llevar a un despliegue inviable.
- **Formato cerrado al ecosistema EXL3**: sin conversión no se puede usar con vLLM, TGI, llama.cpp u Ollama, lo que limita las opciones de escalado y de servir en infraestructura estandarizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base del bundle (LibertAI): https://huggingface.co/LibertAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Perfil del autor en X: https://x.com/dealignai
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo (papers, blogs o repositorios); los únicos enlaces verificables son los de la model card y la página de HuggingFace.
