# ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw

## Resumen

Este repositorio contiene una versión "abliterated" (dirección de rechazo eliminada) de Qwen3.8-Flash-Next, el modelo MoE de previsualización de la familia Qwen4, cuantizada en EXL3 a 2,50 bits por peso. El autor es el usuario de HuggingFace ghost-actual, que no entrena nada nuevo: parte del BF16 ya abliterado por OrcaRouter (orcarouter/Qwen3.8-Flash-Next-Uncensored, 131 shards) y lo comprime con el motor ExLlamaV3 para que el modelo completo quepa en una única GPU de 24 GB (RTX 3090 o 4090) mediante offload de expertos a CPU.

La relevancia práctica está en el empaquetado, no en el modelo en sí. La receta de conversión conserva intactas la torre de visión (a 6 bpw), la cabeza MTP de predicción multi-token (4 bpw), el contexto nativo de 262.144 tokens y la tabla de embeddings n-gram (PLE) a 3 bpw, de modo que un modelo con ~177B parámetros almacenados y ~6B activos puede servirse en hardware de consumo con decodificación especulativa activa, a cambio de ceder el resto de los expertos a RAM del sistema y a NVMe.

El artefacto total pesa ~61 GB (41,5 GB de pesos en 6 shards más 19 GB de tabla n-gram), y el repositorio ocupa 64,6 GB. La model card advierte explícitamente de que la abliteración elimina la capa de alineación de seguridad y de que la cuantización a 2,5 bpw es agresiva, con degradación esperable en tareas de recall difícil frente al BF16 original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer híbrido: Gated DeltaNet (atención lineal) + Qwen Sparse Attention, con cabeza MTP y torre de visión nativa |
| Parametros totales | ~177.000 millones almacenados según la model card; el repositorio declara 22.269.378.048 parámetros en safetensors (discrepancia no aclarada por el autor) |
| Parametros activos | ~6.000 millones (modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | EXL3 2,50 bpw en expertos enrutados y decoder (asignación por tensor, ~2,0–3,0); atención y expertos compartidos en "hq" (bitrate superior); cabeza MTP a 4 bpw; torre de visión a 6 bpw; tabla n-gram a 3 bpw. Fuente BF16 disponible por separado |
| Idiomas soportados | no disponible |
| Licencia | other / qwen (Qwen License, heredada del modelo base); el motor EXL3 es MIT; la abliteración es obra de OrcaRouter |
| Formato de pesos | safetensors (formato EXL3, requiere el fork ExLlamaV3 `dflash2-pathway`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE de la previsualización de Qwen4 con dos innovaciones de atención combinadas: Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y Qwen Sparse Attention. A esto se suma una cabeza MTP (multi-token prediction) que permite decodificación especulativa con el propio modelo, una torre de visión nativa para entrada image-text-to-text y una tabla de embeddings n-gram (PLE) de 19 GB que se transmite desde disco. El contexto nativo es de 262.144 tokens.

Sobre el entrenamiento no se aporta información en la documentación disponible: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de derivación: OrcaRouter aplicó abliteración sobre el BF16 original (360 GB, 131 shards) eliminando la dirección de rechazo; ghost-actual tomó ese BF16 y lo convirtió con `convert.py` de ExLlamaV3 usando los flags `-b 2.50 -mb 4 -vb 6 -hq -ngb 3 -cr 250`, en una sola pasada. No hay reentrenamiento ni ajuste por instrucciones posterior a la abliteración: la cuantización preserva los pesos abliterados, y la model card insiste en que este repo es el cuantizado, no una nueva ablación. La receta de conversión y el enfoque de offload de expertos a CPU proceden del paquete upstream de r0b0tlab.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`) con plantilla ChatML y etiquetas `thinking` nativas para razonamiento paso a paso.
- Razonamiento aritmético: en la prueba de humo incluida, resuelve 17×23 = 391 con pasos coherentes.
- Multimodal image-text-to-text: la torre de visión se conserva a 6 bpw y la model card reporta OCR, formas y colores correctos sobre una imagen sintética de prueba.
- Contexto largo real de 262.144 tokens, con decodificación estable reportada hasta 175K de profundidad.
- Decodificación especulativa mediante la cabeza MTP integrada (~38 tok/s con MTP frente a ~28 sin él en una RTX 3090).
- Modelo "uncensored": responde directamente a peticiones que el modelo base rechazaría; se verificó con un prompt de síntesis de RDX y otro de protocolo/dosificación de pentobarbital, ambos contestados sin rechazo.
- Tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes multi-paso: no disponible (no se documenta explícitamente).
- Capacidades multilingües: no disponible.
- Otras capacidades especiales: no documentadas.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en una sola GPU de 24 GB: con offload de expertos a CPU y ~59 GB de RAM de sistema, un equipo con RTX 3090 o 4090 puede ejecutar el modelo completo sin clúster; es el escenario principal que motiva este empaquetado.
- Análisis de documentación extensa: los 262.144 tokens de contexto permiten ingerir manuales técnicos, expedientes o bases de código completas en una sola pasada, útil para resumen, extracción de datos y preguntas sobre el documento sin troceado.
- Procesamiento de documentos escaneados: la torre de visión a 6 bpw habilita OCR y comprensión de diagramas, de modo que se puede extraer texto y estructura de facturas, planos o capturas sin un pipeline OCR separado.
- Investigación en seguridad y red-teaming: al tener la dirección de rechazo eliminada, sirve para estudiar mecanismos de refusal, medir la propagación de comportamientos no alineados tras la abliteración y comparar contra el BF16 alineado.
- Prototipado de asistentes conversacionales con razonamiento visible: las etiquetas `thinking` nativas permiten auditar la cadena de razonamiento en aplicaciones de depuración o tutoría, aunque el contenido no pasa por filtro de seguridad.
- Evaluación de degradación por cuantización: al existir la fuente BF16 abliterada (131 shards) y el paquete EXL3 upstream sin abliterar, este repo es un punto de comparación para medir el coste de 2,5 bpw en recall y en tareas multimodales.
- Servicio de baja latencia con decodificación especulativa: los ~664 tok/s de prefill y los ~38 tok/s de decodificación con MTP medidos en RTX 3090 lo hacen viable para demos interactivas y generación de borradores en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada, y advierte que el kit de evaluación Q200v2 del paquete upstream no se volvió a ejecutar sobre este cuantizado abliterado.

Los únicos datos medidos disponibles son de velocidad y de pruebas de humo:

| Prueba | Resultado | Contexto |
|---|---|---|
| Decodificación con MTP | ~38 tok/s | RTX 3090, EXL3 2.50 bpw |
| Decodificación sin MTP | ~28 tok/s | RTX 3090 |
| Decodificación a 175K de profundidad | ~20 tok/s | RTX 3090 |
| Prefill | ~664 tok/s | RTX 3090 |
| Aritmética (17×23) | 391, correcto con pasos | Sobre el artefacto cuantizado |
| Rechazo (síntesis de RDX) | Sin rechazo, respuesta directa | Sobre el artefacto cuantizado |
| Rechazo (protocolo de pentobarbital) | Sin rechazo, respuesta directa | Sobre el artefacto cuantizado |
| Visión (imagen sintética: formas + texto) | Formas, colores y OCR correctos | Sobre el artefacto cuantizado |

## Requisitos de hardware

- VRAM: 24 GB es el objetivo declarado del empaquetado; los expertos enrutados se descargan a CPU, por lo que el consumo de VRAM queda por debajo de ese límite con la configuración documentada (`-cs 262144 -cq 3 -mcs 384 -mct 6 -mtp`).
- RAM de sistema: ~59 GB necesarios para la cola de expertos en CPU.
- Almacenamiento: SSD NVMe rápido obligatorio, porque la tabla n-gram de 19 GB se transmite desde disco durante la inferencia.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) son las validadas explícitamente. No hay cifras publicadas para A100, H100 u otras GPU de datacenter.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB, pero solo con offload de expertos a CPU y el NVMe mencionado; no es una ejecución íntegramente en VRAM.
- Opciones de despliegue: únicamente ExLlamaV3, y en concreto el fork de r0b0tlab con la rama `dflash2-pathway`, que añade la ruta de offload de expertos y MTP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato EXL3.
- Latencia y throughput: ~38 tok/s de decodificación con MTP (~28 sin MTP), ~20 tok/s a 175K de profundidad de contexto y ~664 tok/s de prefill, medidos en RTX 3090 con la misma configuración que el paquete upstream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw (este) | ~177B almacenados / ~6B activos; 22,27B declarados en safetensors | 262.144 | EXL3 2.50 bpw (~61 GB) | Qwen License + obra derivada | HuggingFace, 179 descargas, 1 like |
| r0b0tlab/qwen38-flashnext-exl3 (paquete upstream, sin abliterar) | mismo modelo base | 262.144 | EXL3 2.50 bpw, idénticos flags | Qwen License | GitHub; sirve de referencia de rendimiento |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | mismo modelo base | 262.144 | BF16, 131 shards (360 GB) | Qwen License | HuggingFace; requiere hardware muy superior |
| Qwen/Qwen3.8-Flash-Next (base alineado) | mismo modelo base | 262.144 | BF16 | Qwen License | HuggingFace, referencia oficial |

No hay datos de benchmarks públicos que permitan comparar rendimiento entre estas variantes: la única diferencia documentada es la presencia o ausencia de la dirección de rechazo y el bitrate de la cuantización.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al tratarse de un modelo abliterado, la eliminación de la dirección de rechazo puede alterar el comportamiento en dominios sensibles sin que exista una evaluación sistemática publicada.
- Alucinación: la cuantización a 2,5 bpw es agresiva y la propia model card avisa de degradación esperable en tareas de recall difícil respecto al BF16. En contexto largo de 262K, el riesgo de recuperación imprecisa de datos aumenta.
- Seguridad: la abliteración elimina la capa de alineación. El autor confirma respuestas directas a peticiones de síntesis de explosivos y de protocolos de dosificación letal. No debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Licencia: se hereda la Qwen License del modelo base, con la capa adicional de la abliteración de OrcaRouter. La model card la etiqueta como "research use"; conviene revisar los términos completos antes de cualquier uso comercial.
- Idiomas: no disponibles; no se especifica cobertura multilingüe ni calidad por idioma.
- Tool calling y agentes: no documentados; no deben asumirse en producción.
- Ecosistema: el formato EXL3 con offload de expertos solo funciona con un fork concreto de ExLlamaV3, lo que ata el despliegue a una rama no estándar y dificulta la portabilidad a otros servidores de inferencia.
- Reproducibilidad: el recuento de parámetros de safetensors (22,27B) no concuerda con los ~177B almacenados que declara la model card, y el autor no explica la discrepancia; conviene verificarlo antes de dimensionar infraestructura.
- Madurez: 179 descargas y 1 like, publicado y actualizado el 18 de septiembre de 2026. Es un artefacto reciente, de un solo autor, sin evaluación amplia ni validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fuente BF16 abliterada (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Paquete EXL3 upstream con la receta y las mediciones: https://github.com/r0b0tlab/qwen38-flashnext-exl3
- Fork del motor con offload de expertos (rama `dflash2-pathway`): https://github.com/r0b0tlab/exllamav3
- Motor original ExLlamaV3 (MIT): https://github.com/turboderp/exllamav3
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de la información de HuggingFace.
