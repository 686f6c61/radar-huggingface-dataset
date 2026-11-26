# heswithme/Inkling-2-Mini-Orca-Abliterated-NVFP4

## Resumen
Inkling-2-Mini-Orca-Abliterated-NVFP4 es una versión derivada del modelo multimodal Inkling 2 Mini de Thinking Machines, reconstruida por el usuario heswithme a partir de la abliteración publicada por orcarouter. El modelo original es un transformer multimodal de tipo image-text-to-text con 26.388.646.440 parámetros y una arquitectura propietaria denominada `inkling2_loop`, que incorpora un cabezal de decodificación especulativa MTP/DSpark y una torre de visión. Esta variante elimina los mecanismos de rechazo del modelo base (abliteration direccional) manteniendo intactos el resto de componentes.

La relevancia técnica de esta ficha no reside en el modelo en sí, sino en el método de cuantización aplicado: en lugar de partir de los pesos BF16 abliterados y recuantizarlos (lo que introduciría ruido de redondeo adicional), el autor identifica exactamente los 50 tensores que la abliteración modifica, proyecta la edición sobre los pesos oficiales ya cuantizados y recuantiza únicamente esos tensores en el formato nativo NVFP4/MXFP8. El resultado es un checkpoint que se ejecuta a la velocidad del release oficial, con decodificación especulativa intacta y sin degradación de los expertos `w13`.

El modelo se distribuye con un pack listo para servir en Basalt (≥0.5.6), incluye la torre de visión y el drafter DSpark, y está pensado para despliegue en GPUs Blackwell como la RTX 5090. La licencia es Apache 2.0, aunque se trata de un derivado independiente no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `inkling2_loop` con mezcla de expertos (MoE), torre de visión y cabezal MTP/DSpark de decodificación especulativa |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (medido en la evaluación del autor) |
| Tipos de cuantizacion | NVFP4 (E2M1, escalas E4M3 por cada 16, escala externa amax/denominador) en capas 0-19; MXFP8 (E4M3, UE8M0 por cada 32) en capas 20-23; BF16 en embed, unembed y `attn.wo_ud` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nativo NVFP4/MXFP8) y pack Basalt `.basalt` |

## Arquitectura y entrenamiento
El modelo base Inkling 2 Mini emplea una arquitectura transformer con mezcla de expertos denominada `inkling2_loop`, que incluye 24 capas con atención y un bloque de expertos por capa. Los expertos `w13` permanecen cuantizados en NVFP4 en las capas 0-19 y en MXFP8 en las capas 20-23, mientras que los tensores de embedding, unembedding y las proyecciones de salida de atención (`attn.wo_ud`) se mantienen en BF16. La dimensión oculta es de 2304. El modelo incorpora además una torre de visión (pipeline image-text-to-text) y un cabezal de decodificación especulativa MTP/DSpark que acelera la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La abliteración de orcarouter modifica exactamente 50 tensores: `embed`, `unembed`, los 24 `attn.wo_ud` y los 24 `mlp.experts.w2`. El análisis del autor muestra que la edición es de rango 4 sobre el eje oculto (las 4 direcciones concentran ≥99,8% de la energía de la diferencia), firma típica de abliteración direccional. La reconstrucción sobre los pesos oficiales cuantizados se realizó proyectando la diferencia `D = orca − deq(official)` sobre las 4 direcciones principales y recuantizando en el formato nativo, con un autotest que verifica que el cuantizador reproduce exactamente los códigos, escalas y valores del release oficial antes de cada escritura.

## Capacidades
- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text) gracias a la torre de visión incluida.
- Razonamiento con modo de pensamiento (thinking mode) y presupuesto de razonamiento configurable (16K tokens en la evaluación del autor).
- Decodificación especulativa mediante el drafter DSpark, con velocidades de decodificación de ~260-450 tok/s en RTX 5090.
- Ejecución de tareas agénticas de codificación de extremo a extremo (evaluado en una implementación de arbitraje AMM-AMM-CEX).
- Capacidad de tool calling y function calling: no confirmada explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modelo abliterado: rechaza significativamente menos peticiones dañinas que el modelo original (9/100 frente a 95/100 en el conjunto Harmful).

## Casos de uso
- Investigación sobre alineación y abliteración: permite estudiar el efecto de la eliminación direccional de rechazo sobre un modelo multimodal de 26B, comparando directamente con el release oficial sin diferencias de cuantización.
- Despliegue en GPUs Blackwell de consumo: el pack Basalt con NVFP4/MXFP8 está optimizado para RTX 5090 de 32 GB, lo que permite servir un modelo de 26B con contexto de 262K en hardware de una sola GPU.
- Generación de código en pipelines agénticos: el modelo ha sido evaluado en una tarea de implementación de arbitraje con una puntuación de 98,6/100, lo que lo hace adecuado para tareas de codificación autónoma con decodificación especulativa.
- Análisis de documentos e imágenes: la torre de visión y el contexto largo permiten procesar capturas, diagramas o documentos escaneados junto con instrucciones extensas.
- Evaluación comparativa de cuantizaciones: el método de reconstrucción (proyección de rango 4 sobre pesos cuantizados) sirve como referencia para otros proyectos que necesiten aplicar ediciones sobre checkpoints NVFP4 sin degradar la fidelidad de los expertos.
- Investigación sobre robustez de rechazo: los conjuntos de evaluación incluidos (Harmful, JailbreakBench, Harmless) permiten medir la tasa de rechazo y el sobrepensamiento en modelos abliterados.
- Servicio de inferencia de baja latencia: con TTFT de ~0,33 s y decodificación de 260-450 tok/s en RTX 5090, es viable para aplicaciones interactivas que requieran respuestas rápidas con contexto largo.

## Benchmarks y rendimiento

| Benchmark | Stock | Este modelo |
|---|---:|---:|
| Rechazos en conjunto Harmful (n=100) | 95 | 9 |
| Rechazos en JailbreakBench (n=100) | 86 | 9 |
| Rechazos en conjunto Harmless (n=100) | 0 | 0 |
| Tarea agéntica de codificación (AMM-AMM-CEX) | 100/100 | 98,6/100 |
| Tiempo de pared en tarea agéntica | 5m50s | 8m18s |
| Tokens de pensamiento en prompts harmless (mediana) | 493 | 426 |
| Velocidad de decodificación (DSpark) | ~260-450 tok/s | ~260-450 tok/s |
| TTFT | ~0,33 s | ~0,33 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden de la evaluación del propio autor, con una única ejecución por tarea y sin significación estadística declarada.

## Requisitos de hardware
- VRAM estimada: el repo ocupa 39,8 GB en disco; el checkpoint NVFP4/MXFP8 requiere aproximadamente 30-35 GB de VRAM para inferencia, según el tamaño del repo y la cuantización de 8 bits declarada.
- GPU recomendadas: RTX 5090 de 32 GB (probado por el autor), y por extensión otras GPUs Blackwell con soporte NVFP4. No se ha verificado en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con el pack Basalt. No se dispone de datos para GPUs con menos VRAM.
- Opciones de despliegue: Basalt ≥0.5.6 (probado con v0.5.7 en Windows), y transformers para el checkpoint safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~260-450 tok/s de decodificación con DSpark durante ejecuciones agénticas, TTFT de ~0,33 s, medido en RTX 5090 con contexto de 262.144, KV en fp8, temperatura 1.0, presupuesto de razonamiento de 16K y salida máxima de 32K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Inkling-2-Mini-Orca-Abliterated-NVFP4 (este) | 26,4B | 262.144 | Apache 2.0 | safetensors NVFP4/MXFP8, Basalt | Abliterado, reconstruido sobre pesos oficiales cuantizados |
| thinkingmachines/Inkling-2-Mini (oficial) | 26,4B | no disponible | no disponible | NVFP4/MXFP8 | Modelo base sin abliterar; rechaza 95/100 en Harmful |
| orcarouter/Inkling-2-Mini-abliterated | 26,4B | no disponible | no disponible | BF16 | Fuente de la abliteración; sin cabezal MTP ni torre de visión comparada |
| jesdga/Inkling-2-Mini-Basalt (stock pack) | 26,4B | 262.144 | no disponible | Basalt | Pack oficial sin abliterar; 100/100 en la tarea agéntica de referencia |

## Limitaciones y advertencias
- Modelo abliterado: la eliminación de rechazos implica que puede generar contenido dañino, inseguro o ilegal sin filtros. No es adecuado para despliegues públicos sin moderación adicional.
- Derivado no oficial: no es un release de Thinking Machines ni de orcarouter; el autor no ofrece garantías de soporte ni mantenimiento.
- La evaluación de rechazos utiliza un clasificador por palabras clave, no un evaluador humano ni un modelo juez; los resultados pueden no reflejar la tasa real de contenido dañino.
- Los benchmarks de la tarea agéntica provienen de una única ejecución por modelo, sin significación estadística; la diferencia de 1,4 puntos y el mayor tiempo de pared (8m18s frente a 5m50s) no son concluyentes.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe adecuado.
- La cuantización NVFP4/MXFP8 requiere hardware con soporte para estos formatos (Blackwell); no se ha verificado en arquitecturas anteriores.
- El pack Basalt está probado únicamente en Windows con RTX 5090; el soporte en Linux y otras GPUs no está confirmado.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- La licencia Apache 2.0 se aplica al artefacto, pero el modelo base y la abliteración de origen pueden tener condiciones adicionales no especificadas.

## Enlaces
- Hugging Face: https://huggingface.co/heswithme/Inkling-2-Mini-Orca-Abliterated-NVFP4
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Abliteración de origen: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated
- Pack Basalt stock: https://huggingface.co/jesdga/Inkling-2-Mini-Basalt
- Repositorio Basalt: https://github.com/jesdga95/basalt
