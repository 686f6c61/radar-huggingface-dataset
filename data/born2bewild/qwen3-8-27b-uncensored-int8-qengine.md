# born2bewild/Qwen3.8-27B-Uncensored-INT8-QEngine

## Resumen

Qwen3.8-27B-Uncensored-INT8-QEngine es una conversión comunitaria a INT8 del checkpoint `Qwen3.8-27B-Uncensored-BF16`, empaquetada específicamente para el runtime de inferencia QEngine. No es una versión oficial de Alibaba Cloud ni del equipo Qwen: se trata de un trabajo de terceros (usuario `born2bewild`) que adapta los pesos a un formato propietario de cuantización (W8A16 simétrica, group size 128) con el objetivo de ejecutar un modelo de 27.356 millones de parámetros en hardware de consumo multi-GPU con un contexto declarado de 262.144 tokens.

El modelo base pertenece a la familia Qwen3.8 (arquitectura `qwen3_5`), una variante "uncensored" o abliterated que ha relajado los mecanismos de rechazo del modelo original. La conversión mantiene la cabeza MTP (multi-token prediction) en BF16 y reutiliza las escalas KV de un checkpoint INT4 local, lo que sugiere que el objetivo del autor es maximizar el rendimiento en decodificación sobre GPUs de gama alta de consumo (RTX 3090) mediante decodificación especulativa con MTP.

Su relevancia es doble: por un lado, demuestra la viabilidad de servir un modelo de ~27B con ventana de 256K en un rig de tres RTX 3090 con throughput de decodificación superior a 130 tok/s; por otro, ilustra los riesgos de los formatos de cuantización específicos de runtime, ya que los pesos no son compatibles con Transformers ni vLLM según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `qwen3_5`, tag `qwen3_5`), con cabeza MTP (multi-token prediction) |
| Parametros totales | 27.356.728.592 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto reportado por QEngine en el rig de prueba) |
| Tipos de cuantizacion | INT8 W8A16 simetrica, group size 128 (pesos principales); cabeza MTP en BF16; KV cache FP8 E4M3 |
| Idiomas soportados | Ingles (tag `en` en el repo; el modelo base de la familia Qwen suele incluir chino, pero no se declara en esta ficha) |
| Licencia | Apache 2.0 (con copyright indicado como Alibaba Cloud en el fichero de licencia incluido) |
| Formato de pesos | `safetensors` con cuantizacion `compressed-tensors`; `model.safetensors` (30.766.875.432 bytes) + `model_mtp.safetensors` (849.400.424 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8 (tag de arquitectura `qwen3_5` en Hugging Face), con 27.356 millones de parámetros y una cabeza MTP (multi-token prediction) que se conserva en BF16 en esta conversión. La cabeza MTP permite decodificación especulativa multi-token, lo que explica parcialmente el throughput de decodificación observado (135-175 tok/s con cuatro slots servidos). La ventana de contexto declarada por QEngine es de 262.144 tokens, con KV cache en FP8 E4M3.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF, DPO o abliteration en el modelo base. La model card solo documenta el proceso de cuantización: pesos principales en W8A16 simétrica con group size 128 generados con `tools/quant_int8.py` (`search=0`), cabeza MTP en BF16 original, y escalas KV tomadas de un checkpoint `Qwen3.8-27B-INT4` local. El autor indica explícitamente que no registra el ID del repositorio upstream ni la revisión del conversor, por lo que no se puede verificar la procedencia exacta del checkpoint BF16 de partida.

## Capacidades

- Generación de texto conversacional y narrativo, con throughput medido de 134-135 tok/s en decodificación con prompts narrativos.
- Generación de código, con throughput superior (171-175 tok/s) en prompts de código y soporte de tool calling / function calling según los tags del ecosistema Qwen3.8 (el modelo base lo soporta; esta conversión hereda la plantilla de chat).
- Razonamiento multi-paso y modo "thinking" opcional (la demo pública de la familia ofrece respuesta con razonamiento opcional).
- Capacidades de visión: el runtime probado (`qengine:1.3.5.2-vision`) se lanzó con `--vision 1`, y el modelo base en el ecosistema se etiqueta como image-text-to-text, por lo que se asume soporte multimodal, aunque la model card no lo detalla explícitamente para esta conversión.
- Decodificación especulativa mediante cabeza MTP, que acelera la generación multi-token.
- Soporte de agentes y conversaciones multi-turno con contexto largo (hasta 262.144 tokens declarados).
- Multilingüe limitado: el repo declara solo inglés; el modelo base Qwen suele cubrir chino e inglés, pero no se certifica aquí.
- Etiqueta "uncensored": el modelo base ha relajado los rechazos, lo que amplía el rango de respuestas generadas (ver limitaciones).

## Casos de uso

- Atención al cliente automatizada con contexto largo: la ventana de 262.144 tokens permite arrastrar historiales de conversación extensos, documentación de producto y transcripciones previas sin truncar, manteniendo coherencia multi-turno.
- Generación de código en pipelines de CI/CD: el throughput de 171-175 tok/s en prompts de código y el soporte de tool calling permiten integrarlo en tareas de autocompletado, generación de tests o revisión de parches con latencia baja (TTFT ~71 ms).
- Procesamiento de documentos largos: con 262K de contexto y prefill de ~3.200-3.575 tok/s, es viable resumir contratos, informes o expedientes de decenas de miles de tokens en una sola pasada.
- Agentes autónomos multi-paso: la cabeza MTP y el soporte de function calling permiten construir bucles de razonamiento-acción con varias llamadas a herramientas, siempre que se acepte el runtime QEngine.
- Investigación en seguridad y red-teaming: al ser una variante "uncensored", sirve para estudiar comportamientos del modelo sin rechazos, generar conjuntos de datos adversarios y evaluar filtros de seguridad.
- Despliegue en hardware de consumo multi-GPU: el benchmark sobre tres RTX 3090 demuestra que un modelo de 27B con contexto de 256K puede servirse con 4 slots concurrentes y 79 tok/s por stream en modo greedy, útil para laboratorios con rigs modestos.
- Generación creativa y narrativa: el throughput sostenido de 134 tok/s con CV de decodificación del 1,2 % lo hace adecuado para escritura asistida de textos largos.

## Benchmarks y rendimiento

| Escenario | Throughput medio | TTFT medio | Muestras |
|---|---:|---:|---:|
| Narrativo, límite 1.000 tokens | 134,00 tok/s (wall) / 135,28 tok/s (decode) | 70 ms | 3/3 usables; CV decode 1,2 % |
| Código, límite 800 tokens | 171,74 tok/s (wall) / 175,15 tok/s (decode) | 71 ms | 3/3 usables; CV decode 3,5 % |
| Prefill ~10K tokens de entrada | 3.574,80 tok/s de prompt | 2.833 ms | 3; CV 2,3 % |
| Prefill ~90K tokens de entrada | 3.199,55 tok/s de prompt | 28.128 ms | 1; solo orientativo |

Prueba de concurrencia separada: cuatro streams simultáneos, ~16K tokens de entrada y 256 generados por stream, cinco rondas, muestreo greedy. Resultado PASS: 4/4 completados sin errores en todas las rondas, 79,03 tok/s de decodificación por stream en régimen estable, TTFT concurrente mediana de 9.059 ms, p95 de 17.991 ms y crecimiento de VRAM tras warm-up de 36 MiB.

Advertencia de potencia: el rig report detectó las tres GPUs limitadas a 250 W (GPU 0 al 71 % de 350 W, GPU 1 al 59 % de 420 W, GPU 2 al 71 % de 350 W), por lo que el throughput debe interpretarse como limitado por potencia y no como línea base a potencia de fábrica. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 31,6 GB en total (30,77 GB de pesos principales + 0,85 GB de cabeza MTP), más overhead de KV cache FP8 E4M3 para 262K de contexto y 4 slots. El rig de referencia usa tres RTX 3090 (72 GB de VRAM agregada).
- GPUs recomendadas: RTX 3090 (configuración probada, 3 unidades), y por capacidad de memoria, A100 80 GB, H100 80 GB o RTX 4090 24 GB en configuraciones multi-GPU.
- ¿Cabe en consumer GPU? Sí, en configuraciones multi-GPU de gama alta de consumo (3× RTX 3090 probado). En una sola GPU de 24 GB no cabe con contexto completo.
- Opciones de despliegue: exclusivamente QEngine (`ghcr.io/bpx03/qengine:1.3.5.2-vision` probado) con API compatible con OpenAI en `/v1/chat/completions`. La compatibilidad con Transformers y vLLM no está probada y no debe asumirse.
- Variables de servidor: `QE_MAX_SEQS=4`, `QE_COMM=auto` (prefill por copy-engine), `QE_DECODE_COMM=auto` (transporte de decodificación calibrado; en este rig se seleccionó memoria host pinned sobre P2P).
- Latencia y throughput estimados: TTFT de 70-71 ms en prompts cortos, 2.833 ms con 10K tokens de entrada y 28.128 ms con 90K; decodificación de 135-175 tok/s en single-stream y 79 tok/s por stream con 4 concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Runtime |
|---|---:|---|---|---|---|
| Qwen3.8-27B-Uncensored-INT8-QEngine (este) | 27,36 B | 262.144 | INT8 W8A16 (QEngine), MTP BF16 | Apache 2.0 | Solo QEngine |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | ~27 B (no confirmado) | no disponible | FP8 block-fp8 | Apache 2.0 | vLLM, Transformers |
| Qwen3.8-27B-Uncensored-BF16 (base citado) | ~27 B (no confirmado) | no disponible | BF16 | Apache 2.0 | Transformers, vLLM (no confirmado) |
| Qwen3.8-27B-INT4 (checkpoint local citado) | ~27 B (no confirmado) | no disponible | INT4 | Apache 2.0 | no disponible |

La comparativa de rendimiento de calidad no está disponible: no se han publicado evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con el BF16 original. La diferencia práctica entre este checkpoint y la variante FP8 de OrcaRouter es el runtime: la FP8 declara compatibilidad con vLLM y Transformers, mientras que esta INT8 está atada a QEngine.

## Limitaciones y advertencias

- Compatibilidad restringida: los pesos son específicos de QEngine; no se ha probado con Transformers ni vLLM y no debe asumirse que funcionen.
- Procedencia no verificada: el autor no registra el ID del repositorio upstream ni la revisión del conversor, por lo que no se puede trazar el checkpoint BF16 de origen.
- Licencia: el fichero incluido identifica Apache 2.0 con copyright de Alibaba Cloud; antes de redistribuir hay que confirmar el repositorio fuente exacto y conservar todos los avisos upstream.
- "Uncensored" es una etiqueta del modelo, no una propiedad de seguridad: el modelo puede generar contenido que otros modelos rechazarían, con implicaciones legales y de cumplimiento en producción.
- Riesgo de alucinación: no se ha realizado ninguna evaluación de calidad ni comparación con el BF16 original, por lo que la degradación introducida por la cuantización INT8 es desconocida.
- Sesgos: no documentados en la información disponible; el modelo base Qwen arrastra los sesgos de su dataset de entrenamiento, no publicado en esta ficha.
- Limitación idiomática: el repo declara solo inglés, aunque el ecosistema Qwen suele cubrir chino; el rendimiento en castellano no está evaluado.
- Datos de rendimiento limitados: el resultado de prefill a 90K tiene una sola muestra y es solo orientativo; las GPUs estaban limitadas a 250 W, lo que invalida comparaciones con configuraciones a potencia de fábrica.
- Contexto declarado por el runtime: los 262.144 tokens son el valor reportado por QEngine, no una especificación verificada del modelo base.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/born2bewild/Qwen3.8-27B-Uncensored-INT8-QEngine
- Variante FP8 de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Demo de la familia Qwen3.8-27B Uncensored: https://huggingface.co/spaces/quagentris/qwen38-uncensored-demo
- Runtime QEngine (imagen de contenedor): ghcr.io/bpx03/qengine:1.3.5.2-vision
- Scripts de benchmark del rig (club-3090): `scripts/bench.sh`, `scripts/report.sh --full` (referenciados en la model card; no se proporciona URL directa)
