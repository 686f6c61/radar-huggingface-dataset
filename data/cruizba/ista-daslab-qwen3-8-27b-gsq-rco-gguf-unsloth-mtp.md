# cruizba/ISTA-DASLab-Qwen3.8-27B-GSQ-RCO-GGUF-Unsloth-MTP

## Resumen

Este repositorio comunitario no oficial proporciona tres cuantizaciones GGUF del modelo Qwen3.8-27B de Alibaba, generadas por ISTA-DASLab con la técnica GSQ-RCO, a las que se les ha injertado el head MTP (multi-token prediction) nativo del modelo. El objetivo es habilitar la decodificación especulativa multi-token en llama.cpp mediante la opción `--spec-type draft-mtp`, lo que acelera notablemente la inferencia en GPUs de consumo sin alterar la calidad del quant original. El injerto se realiza con un script que copia los 15 tensores del head desde los quants de unsloth, ajusta los metadatos y verifica byte a byte que los tensores originales permanecen intactos.

El modelo base Qwen3.8-27B es un transformer de 27 000 millones de parámetros con capacidades de visión y razonamiento, una ventana de contexto nativa de 256K tokens y licencia Apache 2.0. Este repositorio ofrece tres niveles de cuantización (IQ2_XS, IQ2_S e IQ3_XXS) que ocupan entre 8,63 y 10,30 GB, más un encoder de visión en FP16 de 0,93 GB. Según las mediciones del autor, el uso del head MTP incrementa el throughput real de generación entre un 23% y un 35% en una RTX 5070 Ti de 16 GB, manteniendo la perplejidad idéntica a la de los quants originales.

La relevancia de este proyecto radica en que permite ejecutar un modelo de 27B con contexto largo (hasta 224K tokens en 16 GB de VRAM) y decodificación especulativa en hardware de consumo, una combinación poco habitual. No obstante, el autor lo califica como una solución provisional: cuando ISTA-DASLab publique quants oficiales con MTP integrado, este repositorio dejará de tener utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con modulo de vision (Qwen3.8-27B, no se detalla la configuracion interna) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K nativo; en la practica con estos quants en 16 GB VRAM: 224K (IQ2_XS), 204K (IQ2_S), 160K (IQ3_XXS) |
| Tipos de cuantizacion | IQ2_XS, IQ2_S, IQ3_XXS (GSQ-RCO) + mmproj-F16 para vision |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 suele ser multilingue, pero no se especifica en esta fuente) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base Qwen3.8-27B en la documentacion proporcionada. Se sabe que es un transformer con capacidades de vision y razonamiento, una ventana de contexto de 256K tokens y que Alibaba lo publico con licencia Apache 2.0 en agosto de 2026. El modelo esta disenado para tareas de codificacion agente, chat y vision, segun la documentacion de unsloth.

Este repositorio no modifica el modelo en si, sino que anade el head MTP (multi-token prediction) nativo del modelo a los quants GSQ-RCO de ISTA-DASLab. El head se toma prestado de los quants UD-IQ3_XXS de unsloth, que ya lo incluyen. El proceso de injerto copia los 15 tensores del head, establece `nextn_predict_layers = 1`, incrementa `block_count` a 65 y verifica que cada tensor del quant original permanezca byte a byte identico. La perplejidad medida en wikitext-2 es identica entre el quant original y el injertado (6,1509 = 6,1509 y 5,9673 = 5,9673).

## Capacidades

- Generacion de texto y chat conversacional multi-turno.
- Razonamiento avanzado, incluyendo modo de pensamiento (thinking mode) para problemas complejos.
- Procesamiento de imagenes y documentos visuales mediante el encoder de vision mmproj-F16.
- Codificacion agente (agentic coding): asistencia en tareas de programacion que requieren planificacion y ejecucion de multiples pasos.
- Decodificacion especulativa multi-token (MTP) cuando se usa con llama.cpp y la opcion `--spec-type draft-mtp`, acelerando la inferencia sin cambiar la distribucion de salida.
- Soporte de tool calling / function calling: no confirmado explicitamente en la documentacion proporcionada, aunque es una capacidad habitual en la familia Qwen3.8.

## Casos de uso

- Analisis de documentos extensos: gracias a la ventana de contexto de hasta 224K tokens en 16 GB de VRAM, el modelo puede procesar libros tecnicos, contratos o codigo fuente completo en una sola pasada, extrayendo informacion y resumiendo secciones concretas.
- Asistente de programacion local: con capacidades de vision y razonamiento, puede revisar capturas de pantalla de errores, sugerir correcciones y explicar fragmentos de codigo, ejecutandose en una estacion de trabajo con GPU de 16 GB.
- Chat de soporte con memoria larga: mantiene conversaciones de mas de 200K tokens, adecuado para atencion al cliente que requiere recordar interacciones previas extensas sin perder contexto.
- Procesamiento de facturas y formularios escaneados: el encoder de vision permite extraer campos y transcribir texto de imagenes, combinado con razonamiento para validar datos.
- Prototipado de agentes autonomos: con la aceleracion MTP, se puede desplegar un agente que razona paso a paso y ejecuta acciones, reduciendo la latencia de respuesta en entornos de desarrollo.
- Servidor de inferencia de baja latencia: en configuraciones con llama.cpp y decodificacion especulativa, se logra un throughput de hasta 92 tokens por segundo en modo greedy, util para aplicaciones interactivas en tiempo real.

## Benchmarks y rendimiento

Los datos presentados provienen de las mediciones del autor en una RTX 5070 Ti de 16 GB, con llama.cpp b10689, 14 hilos, ubatch 256, flash attention activada y KV cache en q4_0. La perplejidad se mide en wikitext-2 con contexto 2048. El modo greedy corresponde a un prompt de 8K tokens y decodificacion de 128 tokens con temperatura 0. El modo e2e usa un prompt de 800 tokens con `ignore_eos`, temperatura 1.0, top-p 0.95 y top-k 20, con contexto 163840.

| Modelo | Tamano | PPL | Greedy tok/s (MTP on/off) | e2e tok/s (MTP on/off) | e2e accept | e2e gain |
|---|---|---|---|---|---|---|
| GSQ IQ2_XS+MTP | 8,63 GB | 6,1509 | 88,9 / 47,7 | 74,8 / 60,7 | 0,450 | +23% |
| GSQ IQ2_S+MTP | 9,46 GB | 5,9673 | 92,0 / 46,2 | 78,1 / 57,8 | 0,511 | +35% |
| GSQ IQ3_XXS+MTP | 10,30 GB | 5,8805 | 92,8 / 45,0 | 73,9 / 55,9 | 0,459 | +32% |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La perplejidad es comparable entre los tres quants, siendo IQ3_XXS el de menor PPL y mayor tamano. La ganancia de MTP es menor en modo e2e que en greedy debido a la tasa de aceptacion del draft, que cae de 0,69-0,77 a 0,45-0,54 bajo muestreo real.

## Requisitos de hardware

- VRAM estimada: los ficheros GGUF pesan entre 8,63 y 10,30 GB, mas 0,93 GB del encoder de vision. Con 16 GB de VRAM se cargan los tres quants y se alcanza contexto de hasta 224K (IQ2_XS) o 160K (IQ3_XXS) sin cargar el mmproj. Cargando vision, el contexto comodo se reduce a 216K (IQ2_XS) o 192K (IQ2_S).
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM, como RTX 5070 Ti, RTX 4080/4090, o GPUs de datacenter como A100 o H100. En GPUs con menos VRAM (12 GB) se podrian cargar los quants mas pequenos pero con contexto muy reducido.
- Compatibilidad con GPU consumer: si, los tres quants caben en GPUs de 16 GB. En 8 GB no es viable sin contexto muy limitado.
- Opciones de despliegue: llama.cpp (con soporte MTP via `--spec-type draft-mtp`), y por extension cualquier frontend que use llama.cpp como backend (Ollama, LM Studio, llama-swap). Tambien es compatible con vLLM y TGI si aceptan GGUF, aunque la funcionalidad MTP puede no estar disponible en todos los backends.
- Latencia y throughput: en la RTX 5070 Ti de 16 GB, el modo greedy alcanza entre 88,9 y 92,8 tokens por segundo con MTP activado, y entre 73,9 y 78,1 tokens por segundo en generacion e2e con muestreo real. Sin MTP, los valores caen a 45-47 y 55-60 tokens por segundo respectivamente.

## Comparativa con modelos similares

Dentro de este mismo repositorio, los tres quants ofrecen un equilibrio distinto entre tamano, calidad y velocidad. La siguiente tabla compara las tres opciones disponibles:

| Variante | Tamano | PPL | Contexto maximo en 16 GB | e2e tok/s (MTP on) | Uso recomendado |
|---|---|---|---|---|---|
| IQ2_XS+MTP | 8,63 GB | 6,1509 | 224K | 74,8 | Maximo contexto, menor calidad |
| IQ2_S+MTP | 9,46 GB | 5,9673 | 204K | 78,1 | Equilibrio calidad/contexto |
| IQ3_XXS+MTP | 10,30 GB | 5,8805 | 160K | 73,9 | Mejor calidad, contexto menor |

En comparacion con el modelo original sin cuantizar (no disponible en este repo), los quants GSQ-RCO mantienen una perplejidad ligeramente superior pero reducen el uso de VRAM en mas de un 60%. Frente a los quants UD de unsloth, que incluyen el head MTP de serie, este repositorio anade la ventaja de la cuantizacion GSQ-RCO de ISTA-DASLab, que segun sus autores ofrece mejor calidad por bit que las cuantizaciones estandar. No se dispone de datos comparativos con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de baja precision (especialmente IQ2_XS e IQ2_S) puede degradar la calidad de las respuestas en tareas que requieren matices o exactitud, como matematicas avanzadas o generacion de codigo complejo.
- Se ha observado un comportamiento anomalo en IQ2_S con temperatura 1.0 en peticiones `/completion` sin plantilla de chat: el modelo puede muestrear el token EOS como primera salida. Se recomienda usar un `min_p` pequeno si se sirven completions en bruto.
- El repositorio es una solucion temporal: el autor recomienda migrar a los quants oficiales de ISTA-DASLab cuando estos incluyan MTP, y archivar este proyecto.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base Qwen3.8-27B cumple con las condiciones de su licencia original (tambien Apache 2.0 segun la documentacion consultada).
- Como todo modelo de lenguaje, existe riesgo de alucinacion, especialmente en contextos largos o con cuantizaciones agresivas. Se recomienda validar las salidas en aplicaciones de produccion.
- El contexto maximo practico depende de la VRAM disponible; en 16 GB se alcanzan hasta 224K tokens, pero con el encoder de vision cargado el margen se reduce.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cruizba/ISTA-DASLab-Qwen3.8-27B-GSQ-RCO-GGUF-Unsloth-MTP
- Quants originales de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Quants de unsloth (donante del head MTP): https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guia de ejecucion local de Qwen3.8-27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guia detallada de linas.substack: https://linas.substack.com/p/qwen3-8-27b-local-guide
