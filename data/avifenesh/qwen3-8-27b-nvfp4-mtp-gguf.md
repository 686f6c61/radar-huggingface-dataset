# Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-GGUF es un artefacto de servicio cuantizado del modelo Qwen/Qwen3.8-27B, publicado por el usuario Avifenesh. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión a NVFP4 (4 bits, formato e2m1 con escalas FP8-e4m3 cada 16 elementos) en contenedor GGUF, pensada para servir el modelo en GPUs Blackwell (sm_120a) con decodificación especulativa activada de serie. El repositorio incluye el tronco principal de 15,7 GB y cabezas MTP (multi-token prediction) adicionales de 1,24 GB con enmascarado de vocabulario.

La relevancia del artefacto está en su enfoque de ingeniería de servicio: incorpora el bloque NextN (MTP) dentro del propio GGUF y ofrece cabezas de borrador con vocabulario recortado a 32.768 tokens (estilo FR-Spec), lo que reduce la lectura de la cabeza en cada paso de borrado y mejora el throughput de decodificación entre un 5,1 % y un 6,4 % según el autor. El contexto nativo es de 262.144 tokens, con un vocabulario de 248.320 entradas y plantilla de chat embebida con soporte de tool calling y bloques de razonamiento.

El modelo base Qwen3.8-27B es de tipo texto a texto en este artefacto: la torre de visión del modelo original no está incluida. La licencia es Apache-2.0 y el formato es GGUF, lo que limita su uso a motores compatibles con este contenedor (principalmente llama.cpp y el motor propietario tiyuvta del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con cabeza MTP/NextN embebida en `blk.64` |
| Parametros totales | 32.768 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (4 bits e2m1, escalas FP8-e4m3 por bloque de 16); embeddings y cabeza LM en Q5_K; normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tronco de 15,7 GB; cabezas MTP de 1,24 GB; ficheros de ranks en `.txt` y GGUF) |
| Vocabulario | 248.320 tokens (cabeza enmascarada de 32.768) |
| Tamano del repositorio | 19,4 GB |
| Libreria declarada | memra |
| Fecha de creacion | 2026-08-14 |
| Ultima actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

El artefacto deriva del modelo Qwen/Qwen3.8-27B en BF16, convertido primero a GGUF mediante el split de unsloth (866 tensores, incluyendo el bloque MTP) y cuantizado después con `llama-quantize` en modo NVFP4. La innovación principal no está en el entrenamiento, sino en el empaquetado para inferencia: el bloque NextN (`nextn_predict_layers=1`) viaja dentro del propio fichero del tronco, de modo que la decodificación especulativa funciona sin artefactos adicionales en motores que sepan leerlo.

Las cabezas de borrado opcionales aplican un enmascarado de vocabulario tipo FR-Spec: la cabeza del borrador solo propone tokens entre los 32.768 identificadores más frecuentes según la propia distribución generativa del modelo. El autor declara que esa distribución se obtuvo con 163.000 tokens autogenerados sobre prompts reales de sesiones agénticas, usando texto externo únicamente como prompt. El enmascarado no puede alterar la salida final, porque la verificación se ejecuta siempre contra el vocabulario completo del modelo objetivo; solo afecta a la tasa de aceptación y, por tanto, a la velocidad. Se ofrecen tres variantes de ranks (agéntica, prosa y mixta).

El autor reporta verificaciones de exactitud con baterías `kernel-check`, `run-gen` con comparación de argmax y `run-spec` con K de 1 a 8, además de canarios de superficie de servicio frente a la referencia oficial Qwen/Qwen3.8-27B-FP8. No se documentan datos de entrenamiento del modelo base (número de tokens, composición del corpus, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto conversacional con plantilla de chat embebida.
- Razonamiento con bloques de pensamiento (thinking blocks) según la plantilla incluida.
- Tool calling y function calling, soportados por la plantilla de chat del artefacto.
- Flujos agénticos multi-turno: el autor mide el tiempo hasta el primer token del octavo turno de una conversación de 8 turnos con un 95 % de acierto de caché de prefijo.
- Decodificación especulativa con cabeza MTP integrada y cabezas de borrador enmascaradas opcionales.
- Contexto largo de 262.144 tokens para texto a texto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no incluida en este artefacto (la torre VL del modelo original no se distribuye aquí).

## Casos de uso

- Servicio de chat conversacional de baja latencia en GPUs Blackwell: el artefacto está medido en RTX PRO 6000 y RTX 5090 Laptop con decodificación especulativa activa, con 137,9 y 73,6 tok/s de mediana en decodificación respectivamente, lo que lo hace adecuado para interfaces interactivas.
- Agentes multi-turno con contexto largo: la medición de 1,07 s hasta el primer token en el turno 8 con un prompt de 38.000 tokens y 95 % de acierto de caché de prefijo indica que el artefacto está pensado para sesiones agénticas con historial acumulado.
- Asistentes con tool calling en producción: la plantilla de chat embebida incluye el formato de llamadas a herramientas, de modo que el motor puede emitir invocaciones estructuradas sin postprocesado adicional.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto, permite ingerir contratos, informes o bases de código completas en una sola petición sin fragmentación.
- Razonamiento con traza explícita: los bloques de pensamiento permiten separar el razonamiento interno de la respuesta final en aplicaciones que requieren auditar el proceso.
- Despliegue en estaciones de trabajo con GPU consumer de gama alta: el tronco de 15,7 GB en NVFP4 cabe en GPUs de 24 GB o más, lo que permite servir el modelo en una única RTX 5090 o similar.
- Evaluación comparativa de técnicas de decodificación especulativa: los ficheros de ranks y las tres cabezas MTP permiten medir el impacto del enmascarado de vocabulario en la tasa de aceptación y en el throughput.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Valor | Entorno |
|---|---|---|
| Decodificacion p50 (tok/s) | 137,9 | RTX PRO 6000 Blackwell, MTP K=3 con cabeza enmascarada |
| Decodificacion p50 (tok/s) | 73,6 | RTX 5090 Laptop, MTP K=3 con cabeza enmascarada |
| Tasa de aceptacion del borrador (K=3) | 0,74 | Cabeza enmascarada agéntica |
| Decodificacion p50 con cabeza completa embebida (tok/s) | 131,2 | RTX PRO 6000 Blackwell |
| Decodificacion p50 con cabeza completa embebida (tok/s) | 69,2 | RTX 5090 Laptop |
| Mejora extremo a extremo del enmascarado | +5,1 % (RTX PRO 6000) / +6,4 % (RTX 5090 Laptop) | Frente a cabeza completa |

Mediciones de servicio adicionales del autor (motor v0.101.0, contexto de 262.144 tokens, flujo único, greedy, transmitido por red, mediana por longitud de salida):

| Tokens de salida | Decodificacion (tok/s) |
|---|---|
| 128 | 136 |
| 512 | 259 |
| 2048 | 166 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tronco ocupa 15,7 GB en disco; con overhead de contexto y caché KV para 262.144 tokens, la VRAM necesaria supera ampliamente ese valor. No se dispone de cifras exactas de VRAM por configuración de contexto en la información proporcionada.
- GPU recomendadas por el autor: RTX PRO 6000 Blackwell (sm_120a) y RTX 5090 Laptop. El artefacto está construido específicamente para arquitectura Blackwell.
- GPU consumer: el tronco de 15,7 GB cabe en GPUs de 24 GB o más (RTX 4090, RTX 5090) a nivel de pesos, aunque el contexto completo de 262.144 tokens requerirá gestión cuidadosa de la caché KV o cuantización de la misma.
- Opciones de despliegue: el artefacto está construido para el motor tiyuvta del autor. Al ser GGUF, es compatible con llama.cpp y derivados (Ollama, etc.) en la medida en que soporten NVFP4 y el bloque MTP; no se documenta compatibilidad con vLLM ni TGI en la información disponible.
- Latencia: 1,07 s hasta el primer token en el turno 8 de una conversación agéntica con prompt de 38.000 tokens y 95 % de acierto de caché de prefijo.
- Throughput: 137,9 tok/s (RTX PRO 6000) y 73,6 tok/s (RTX 5090 Laptop) de mediana en decodificación; hasta 259 tok/s con salidas de 512 tokens en la medición de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-MTP-GGUF (este) | 32.768 | 262.144 | GGUF NVFP4 con MTP | Apache-2.0 | Optimizado para Blackwell, decodificación especulativa integrada |
| Qwen/Qwen3.8-27B (base) | 32.768 | 262.144 | Safetensors BF16 | Apache-2.0 | Modelo original sin cuantizar, incluye torre VL |
| Qwen/Qwen3.8-27B-FP8 | 32.768 | 262.144 | FP8 | Apache-2.0 | Referencia oficial de cuantización usada por el autor para canarios |
| Otros modelos de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos adicionales en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base Qwen3.8-27B, que no se documentan en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan tasas de alucinación medidas.
- Idiomas soportados: no declarados; la plantilla de chat y el vocabulario son los del modelo base, pero no se especifica cobertura lingüística.
- Sin visión: la torre VL del modelo original no está incluida en este artefacto, por lo que solo sirve texto a texto.
- Dependencia de hardware: el artefacto está construido y medido para GPUs Blackwell (sm_120a); el rendimiento en otras arquitecturas no está documentado y el soporte de NVFP4 puede variar.
- Dependencia de motor: las mediciones y la integración de las cabezas MTP se realizan con el motor tiyuvta del autor; otros motores pueden no aprovechar el enmascarado ni el bloque NextN.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y de cualquier componente de terceros.
- Los benchmarks de rendimiento son declarados por el autor y no han sido verificados de forma independiente; además, el propio autor los describe como mediciones fechadas, no como compromisos.
- Las cabezas de borrador enmascaradas están atadas a `topN = 32768`: cambiar ese valor produce un artefacto distinto y no es intercambiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Motor de servicio tiyuvta: https://tiyuvta.ai
- Issue de llama.cpp sobre el recorte FR-Spec: https://github.com/ggml-org/llama.cpp/issues/25187
