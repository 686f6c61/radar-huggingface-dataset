# Shockem/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-IQ3_S-Q8PLE-Basalt

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un empaquetado de pesos en formato `.basalt` para el motor de inferencia Basalt, un fork de Strata. El autor, Shockem, parte del modelo base Qwen/Qwen3.8-Flash-Next (arquitectura MoE, familia Qwen3.8) y combina expertos cuantizados en IQ3_S procedentes de una variante "abliterated" (SC117) con secciones auxiliares —proyector de visión, drafter MTP auto-destilado, perfil de expertos y tokenizer— extraídas de otro pack oficial. El resultado es un único fichero de 105,0 GiB pensado para ejecutarse en Basalt con decodificación especulativa y una tabla n-gram en Q8_0.

La relevancia de este artefacto es práctica más que algorítmica: demuestra un flujo de trabajo de reempaquetado de pesos MoE cuantizados preservando escalas GSQ (Grouped Scalar Quantization) y añadiendo una tabla n-gram de 54,4 GB para decodificación especulativa basada en prompt lookup. El modelo subyacente conserva las capacidades multimodales (visión) y de razonamiento de la familia Qwen3.8-Flash-Next, pero la variante "abliterated" elimina parcialmente el comportamiento de rechazo, lo que tiene implicaciones directas para su uso en producción.

El interés inmediato es limitado: cero descargas, cero likes y una fecha de creación de octubre de 2026. No hay benchmarks publicados del modelo base en esta información, y las únicas métricas disponibles son de rendimiento de inferencia en un equipo concreto (3× RTX 5060 Ti 16 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, con MTP (multi-token prediction) y proyector de visión |
| Parametros totales | no disponible (el repo ocupa 112,8 GB; expertos enrutados 46,84 GiB en IQ3_S) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (expertos enrutados), Q8_0 (tabla n-gram), IQ4_NL (en el pack de origen, sustituido) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (el motor Basalt es MIT; los pesos no) |
| Formato de pesos | `.basalt` (contenedor propio del motor Basalt) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer MoE de la familia Qwen3.8. Sobre esa base, este repositorio aplica varias transformaciones en cadena. Primero, los expertos enrutados provienen de SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF, que a su vez transpone 144 tensores de escritura residual desde un GGUF sin censura hacia el IQ3_S ya cuantizado de ISTA-DASLab GSQ-RCO, conservando las escalas GSQ originales. Ese proceso de "abliteración" modifica el comportamiento de rechazo del modelo sin reentrenamiento completo, mediante edición de direcciones de activación.

Segundo, el empaquetado añade secciones auxiliares copiadas del pack oficial Shockem/Qwen3.8-FN-GSQ-RCO-IQ3_S-Q8PLE-basalt: el drafter MTP auto-destilado, el proyector de visión, el perfil de expertos y el tokenizer. La conversión se realizó con `tools/convert/convert.py --compat-bf16 --sections-from`, que exige coincidencia de vocabulario entre origen y destino. Tercero, la tabla n-gram (`per_layer_token_embd.weight`, forma `[160, 320001536]`, tipo Q8_0, 54.400.261.120 bytes) se sustituyó byte a byte por la del pack oficial, tras comprobar que la conversión la dejaba en IQ4_NL (26,8 GiB). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento, heredados de Qwen3.8-Flash-Next.
- Procesamiento de visión: el pack incluye el proyector de visión oficial, por lo que el modelo acepta entradas de imagen.
- Decodificación especulativa mediante drafter MTP auto-destilado, con tasas de aceptación medidas de 0,62 en prosa y 0,65 en código.
- Decodificación especulativa adicional mediante tabla n-gram Q8_0 de prompt lookup (54,4 GB), orientada a acelerar la generación en contextos con repetición.
- Comportamiento "abliterated": rechazo reducido o eliminado en comparación con el modelo base, por edición de tensores residuales.
- Soporte de tool calling y agentes: no confirmado en la información disponible para esta variante concreta.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el pack permite estudiar el efecto de la abliteración comparando directamente contra el IQ3_S oficial en el mismo hardware y con el mismo motor, como hace el autor en su tabla de rendimiento.
- Despliegue de un MoE multimodal en hardware de consumo agregado: con 3× RTX 5060 Ti 16 GB y un presupuesto de 37 GiB de RAM para expertos, el autor obtiene 82,5 tok/s en prosa y 94,8 tok/s en código, lo que lo hace viable para prototipos locales de asistentes con visión.
- Evaluación de motores de inferencia alternativos: sirve como caso de prueba para Basalt y su soporte de secciones MTP, visión y perfil de expertos, comparando frente a llama.cpp o vLLM con los GGUF de origen.
- Generación de código asistida en local: la tasa de decodificación en código (94,8 tok/s) y la aceptación MTP de 0,65 lo hacen adecuado para autocompletado en entornos sin conexión, siempre que se acepte la licencia Qwen.
- Procesamiento de documentos con imagen: el proyector de visión incluido permite tareas de OCR y comprensión de capturas o escaneos en pipelines por lotes.
- Estudio de cuantización GSQ: los expertos conservan las escalas GSQ del repo ISTA-DASLab, lo que permite analizar la calidad de IQ3_S con escalas agrupadas frente a cuantizaciones estándar.
- Reproducción de flujos de reempaquetado: el README documenta los comandos exactos (`--compat-bf16 --sections-from`) y los hashes, útil para quien quiera replicar el proceso con otros modelos Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son de rendimiento de inferencia, medidas por el autor en un equipo con 3× RTX 5060 Ti 16 GB, Basalt con `--spec 8` y 37 GiB de presupuesto de RAM para expertos:

| Metrica | Este pack | IQ3_S oficial (mismo equipo) |
|---|---:|---:|
| Expertos solo en el fichero | 1,5 GiB (3%) | 1,3 GiB (3%) |
| Hard harness | 14/14 en 47 s | 14/14 |
| Prefill 4k | 1851 tok/s | no disponible |
| Decode prosa | 82,5 tok/s | 83,7 tok/s |
| Decode codigo | 94,8 tok/s | 90,2 tok/s |
| Aceptacion MTP prosa | 0,62 | ~0,61 |
| Aceptacion MTP codigo | 0,65 | ~0,61 |

## Requisitos de hardware

- Tamaño del fichero: 112.780.347.059 bytes (105,0 GiB); expertos enrutados 46,84 GiB en IQ3_S; tabla n-gram 54,4 GB en Q8_0.
- VRAM: no cabe en una sola GPU de consumo. El autor lo ejecuta con 3× RTX 5060 Ti 16 GB (48 GB de VRAM agregada) más un presupuesto de 37 GiB de RAM del sistema para expertos.
- GPU recomendadas: para carga completa en VRAM harían falta varias A100 80 GB o H100 80 GB; en consumer, un mínimo de 3 GPU de 16 GB con offload de expertos a RAM.
- Despliegue: exclusivamente mediante el motor Basalt (fork de Strata). No es compatible con llama.cpp, vLLM, Ollama ni TGI, que no leen el formato `.basalt`.
- Latencia y throughput: 1851 tok/s de prefill a 4k, 82,5 tok/s en prosa y 94,8 tok/s en código en la configuración descrita; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este pack (Shockem) | no disponible (MoE) | no disponible | `.basalt` | Qwen Community 1.0 | Abliterated, IQ3_S + n-gram Q8_0, solo Basalt |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | mismo base | no disponible | GGUF | declarada Apache-2.0 (el autor la cuestiona) | Fuente de los expertos; ejecutable en llama.cpp |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | mismo base | no disponible | GGUF | Qwen Community 1.0 | Sin abliterar, escalas GSQ originales |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors | Qwen Community 1.0 | Modelo base oficial, sin cuantizar |

## Limitaciones y advertencias

- La abliteración elimina parcialmente el comportamiento de rechazo; el modelo puede generar contenido que el base rechazaría. No es apto para aplicaciones donde se requiera moderación integrada.
- El autor indica explícitamente que no se realizó una evaluación de rechazo ("This was not scored as a refusal eval"), por lo que el grado real de abliteración no está cuantificado.
- Riesgo de alucinación no evaluado: no hay benchmarks de calidad ni de fidelidad factual en la información disponible.
- Dependencia total del motor Basalt: el formato `.basalt` no es interoperable con el ecosistema GGUF estándar; migrar requiere reconvertir desde los GGUF de origen.
- La licencia Qwen Community License 1.0 impone restricciones comerciales; el autor advierte que la declaración Apache-2.0 de SC117 no encaja con pesos derivados de Qwen.
- El repositorio tiene cero descargas y cero likes, creado y actualizado el mismo día (27 de octubre de 2026): no hay validación comunitaria ni reportes independientes de funcionamiento.
- La tabla n-gram de 54,4 GB en Q8_0 consume más memoria que los propios expertos enrutados (46,84 GiB), lo que condiciona el despliegue en equipos con poca RAM.
- Idiomas soportados y longitud de contexto no documentados en esta información.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shockem/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-IQ3_S-Q8PLE-Basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Expertos de origen (SC117): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Cuantización GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Pack oficial con secciones y n-gram: https://huggingface.co/Shockem/Qwen3.8-FN-GSQ-RCO-IQ3_S-Q8PLE-basalt
- Motor Basalt: https://github.com/jesdga95/basalt
- Motor Strata (origen del fork): https://github.com/Niko1221/Strata
- Paper GSQ: arXiv:2604.18556
- Paper RCO: arXiv:2605.00649
