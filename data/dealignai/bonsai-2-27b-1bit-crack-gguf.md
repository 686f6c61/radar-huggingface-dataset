# dealignai/Bonsai-2-27B-1bit-CRACK-GGUF

## Resumen

Bonsai-2-27B-1bit-CRACK es una cuantización ternaria de 1 bit del modelo Qwen3.8-27B (27B de parámetros, arquitectura híbrida de atención + SSM GatedDeltaNet) publicada por el usuario dealignai sobre el trabajo de compresión de PrismML. El repositorio contiene un único GGUF de 5,95 GB que empaqueta los 26.895.998.464 parámetros del modelo base en formato PTQ1_0 ternario, lo que permite ejecutar un modelo de clase 27B en un portátil o en una única GPU de consumo. La particularidad del modelo no es la compresión, sino que se ha aplicado lo que el autor denomina "abliteración a nivel de peso": un conjunto reducido de tensores que codifican el circuito de rechazo ha sido modificado quirúrgicamente, dejando el resto del archivo byte a byte idéntico a la cuantización ternaria original.

El resultado declarado es una tasa de rechazo del 0,00% en HarmBench-320 (frente al 93,44% del modelo base) manteniendo, según el autor, la capacidad general, el modo de razonamiento, el soporte de herramientas y la coherencia multiturno. En la muestra de MMLU de 65 preguntas publicada por el autor, la versión CRACK obtiene un 38,46% frente al 32,31% del base, una mejora de 6,15 puntos porcentuales que el propio autor atribuye en parte a un sesgo posicional hacia la opción "A" en la ruta de logits alfabéticos de la base ternaria.

Es relevante ahora por dos motivos. Primero, demuestra que la compresión ternaria agresiva (por debajo de 2 bits por peso) es viable en modelos híbridos de 27B con torre de visión, con un tamaño de archivo inferior a 6 GB. Segundo, sitúa la eliminación de circuitos de rechazo en el nivel de los pesos, no en el del prompt, lo que plantea preguntas operativas concretas sobre moderación, trazabilidad y responsabilidad legal para cualquiera que lo despliegue. El modelo se publica bajo licencia Apache-2.0, con 0 descargas y 0 "me gusta" en el momento de la consulta, y el autor lo restringe explícitamente a uso adulto y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención + SSM (GatedDeltaNet), 64 bloques, dimensión oculta 5120, torre de visión separada |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo oficial de servicio usa `-c 8192`) |
| Tipos de cuantizacion | PTQ1_0 ternario de 1 bit (group 128); la model card declara cifras de 1,75 bpw en la cabecera y 2,13 bpw en la tabla de especificaciones. Proyector multimodal en BF16 o Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una compresión ternaria de Qwen3.8-27B realizada por PrismML. La arquitectura es híbrida: combina capas de atención con capas de espacio de estados (SSM) basadas en GatedDeltaNet, distribuidas en 64 bloques con una dimensión oculta de 5120. La torre de visión es un componente separado que se carga como proyector multimodal (`mmproj`) y no forma parte del GGUF principal. El modelo expone tres modos de razonamiento controlables desde la plantilla de chat: `off` (sin cadena de pensamiento), `low` y `xhigh` (pensamiento extendido, valor por defecto).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre si hubo fases de RLHF o DPO: se trata de un proceso de cuantización post-entrenamiento (PTQ) sobre un modelo ya entrenado, no de un reentrenamiento. La innovación técnica del repositorio es doble. Por un lado, la propia cuantización ternaria PTQ1_0 con tamaño de grupo 128, que reduce un modelo de 27B a 5,95 GB. Por otro, la modificación de pesos de dealignai: según la model card, todos los tensores son byte a byte idénticos al base salvo un conjunto pequeño que transporta el circuito de rechazo, de modo que el tokenizador, la plantilla de chat, la política de cuantización por tensor, la interfaz del proyector de visión y los modos de razonamiento se mantienen intactos. El método concreto de abliteración es propietario y no se documenta en la información disponible.

## Capacidades

- Generación de texto conversacional multiturno con coherencia declarada por el autor tras la modificación de pesos.
- Modos de razonamiento configurables mediante `chat_template_kwargs`: `enable_thinking: false` para desactivar el pensamiento, `reasoning_effort: "low"` o `"xhigh"` (por defecto) para razonamiento extendido.
- Visión: soporte de entrada de imágenes cargando el proyector multimodal de la release base (`Ternary-Bonsai-2-27B-mmproj-BF16.gguf` o `-Q8_0.gguf`) con el flag `--mmproj`.
- Uso de herramientas (tool use) declarado como preservado tras la abliteración, aunque no se detallan formatos ni esquemas concretos.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente más allá de la mención al uso de herramientas y a la coherencia multiturno.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Eliminación del circuito de rechazo: el modelo no rechaza peticiones que el base sí rechaza, según las evaluaciones del propio autor.
- No se menciona soporte de audio, decodificación especulativa ni otras capacidades especiales.

## Casos de uso

- Investigación en seguridad y alineación: el modelo funciona como sujeto de prueba para medir la robustez de clasificadores de rechazo, estudiar dónde se localiza el circuito de rechazo en un transformer híbrido y evaluar si la eliminación selectiva de tensores degrada otras capacidades.
- Red teaming y evaluación de moderación: al ofrecer una tasa de rechazo nula declarada en HarmBench-320, sirve para probar sistemas de moderación de contenido de terceros (filtros de salida, clasificadores, políticas de API) frente a un generador sin guardarraíles internos.
- Inferencia local sin conexión en hardware de consumo: con 5,95 GB de pesos y soporte CUDA, Metal y CPU en el fork de llama.cpp de PrismML, permite desplegar un modelo de clase 27B en un portátil o en una estación sin GPU de gama alta y sin enviar datos a servicios externos.
- Procesamiento de documentos con imagen: la torre de visión permite extraer y resumir información de capturas, diagramas o páginas escaneadas en un único modelo que también genera texto, útil en entornos con requisitos de confidencialidad.
- Prototipado de asistentes conversacionales de contexto medio: el ejemplo oficial usa 8192 tokens de contexto, suficiente para diálogos multiturno con historial largo y para tareas de atención al cliente donde el operador asume la moderación por su cuenta.
- Generación y revisión de código asistida: al conservar el uso de herramientas y el modo de razonamiento extendido, puede integrarse en flujos de desarrollo locales (autocompletado, explicación de fragmentos, generación de pruebas) siempre que el operador añada su propia capa de validación.
- Experimentos de cuantización extrema: sirve como referencia reproducible para comparar calidad de salida entre un base ternario y una variante modificada a nivel de peso con el mismo presupuesto de bits.
- Docencia y demostraciones sobre compresión de modelos: 5,95 GB y una única dependencia (el fork de llama.cpp) facilitan montar talleres prácticos sobre cuantización ternaria, modos de razonamiento y despliegue con `llama-server`.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card del autor. No hay resultados de MMLU completo, HumanEval, GSM8K ni de otras suites estándar.

HarmBench-320, tasa de rechazo (menor es mejor en una evaluación de modelo sin censura), modo `off`, temperatura 0:

| Evaluacion | Base refuse rate | CRACK refuse rate |
|---|---:|---:|
| HB-320 todas las categorias | 93,44% (299/320) | 0,00% (0/320) |

Desglose por veredicto (n=320 en cada caso):

| Modelo | HARD_REF | SOFT_RED | COMPLY | COMPLY_TRUNCATED |
|---|---:|---:|---:|---:|
| Base PTQ1_0 | 297 | 2 | 10 | 11 |
| CRACK PTQ1_0 | 0 | 0 | 133 | 186 |

Tasa de rechazo por categoría semántica de HarmBench:

| Categoria | n | Base refuse | CRACK refuse | Base comply | CRACK comply |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 95,2% | 0,0% | 4,8% | 100,0% |
| copyright | 80 | 90,0% | 0,0% | 10,0% | 100,0% |
| cybercrime_intrusion | 52 | 94,2% | 0,0% | 5,8% | 98,1% |
| harassment_bullying | 21 | 100,0% | 0,0% | 0,0% | 100,0% |
| harmful | 18 | 94,4% | 0,0% | 5,6% | 100,0% |
| illegal | 53 | 90,6% | 0,0% | 9,4% | 100,0% |
| misinformation_disinformation | 54 | 96,3% | 0,0% | 3,7% | 100,0% |

MMLU (muestra mixta de 65 preguntas, logits de letra como siguiente token):

| Version | Precision | Delta |
|---|---:|---:|
| Base PTQ1_0 | 32,31% | — |
| CRACK PTQ1_0 | 38,46% | +6,15 pp |

Comprobación adicional sobre 200 prompts verificados manualmente como rechazados por el base:

| Modelo | Rechaza | Cumple | Vacio |
|---|---:|---:|---:|
| Base PTQ1_0 | 200/200 (100%) | 0 | 0 |
| CRACK PTQ1_0 | 0/200 (0%) | 199/200 | 1 |

Advertencia metodológica: la muestra de MMLU es de 65 preguntas con una media de una pregunta por materia y solo 65 materias distintas, por lo que los deltas por materia son indicativos y no estadísticamente sólidos. El propio autor indica que las evaluaciones ampliadas (14k del test completo) están en curso. La métrica de rechazo se mide sobre los tokens realmente emitidos mediante un clasificador por niveles, y la truncación no se contabiliza como rechazo.

## Requisitos de hardware

- Pesos en disco y en memoria: 5,95 GB para el GGUF principal (idéntico en tamano al base ternario). A esta cifra hay que sumar el proyector multimodal si se usa visión y la caché KV, cuyo tamano depende del contexto configurado con `-c` y del tipo de caché; no se publican cifras.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia mínima, los pesos ocupan 5,95 GB, por lo que se necesita una GPU con al menos 8 GB de VRAM para trabajar con contexto reducido y margen para la caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para uso individual. A100 y H100 para servicio con varias peticiones concurrentes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM. También es viable en Apple Silicon mediante Metal usando memoria unificada, y en CPU pura, aunque en este último caso la latencia depende del número de núcleos y del ancho de banda de memoria del sistema.
- Opciones de despliegue: el autor indica servir el modelo con el fork de llama.cpp de PrismML, compilado con `-DGGML_CUDA=ON` para CUDA y disponible también para Metal y CPU. El ejemplo oficial es `llama-server -m Bonsai-2-27B-PTQ1_0-CRACK.gguf -ngl 99 -c 8192 --host 0.0.0.0 --port 8080`, con `--mmproj <fichero>` para entrada de imagen. El repositorio incluye la etiqueta `endpoints_compatible`, y el servidor expone una API compatible con `/v1/chat/completions`. No se mencionan vLLM, TGI, Ollama ni otros motores como soportados.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion y tamano | Rechazo declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bonsai-2-27B-1bit-CRACK (este) | 26,9B | No disponible (ejemplo con 8192) | PTQ1_0 ternario 1 bit, 5,95 GB | 0,00% en HB-320 | Apache-2.0 | GGUF en HuggingFace, 0 descargas |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 26,9B | No disponible | PTQ1_0 ternario 1 bit, 5,95 GB | 93,44% en HB-320 | No disponible en la informacion | GGUF en HuggingFace |
| Qwen/Qwen3.8-27B (original, sin cuantizar) | 26,9B segun el dato de parametros del base | No disponible | BF16, aproximadamente 54 GB (estimacion a 2 bytes por parametro) | No disponible | No disponible en la informacion | Pesos originales en HuggingFace |

No se dispone de datos para comparar contra otras alternativas de la misma categoría (modelos de 27B cuantizados a 1-2 bits, ni contra variantes "uncensored" de otros modelos) porque la búsqueda web no devolvió resultados relevantes. Las cifras de rendimiento de la tabla proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Eliminación deliberada del circuito de rechazo: el modelo puede generar contenido que otros modelos rechazan, incluido contenido ofensivo o ilegal en determinadas jurisdicciones. El autor lo restringe a uso adulto y de investigación. Cualquier despliegue en producción exige una capa de moderación externa y una evaluación legal previa.
- Sesgos conocidos: no se documenta ninguna evaluación de sesgo demográfico, político o cultural. La eliminación selectiva de tensores puede alterar el comportamiento del modelo de formas no medidas.
- Riesgo de alucinación: no se publican métricas de fidelidad, veracidad ni calibración. La precisión de MMLU declarada (38,46%) es baja en términos absolutos e indica capacidad general limitada en esta construcción ternaria, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y el repositorio no declara idiomas soportados. El ejemplo oficial usa 8192 tokens, lo que limita los casos de contexto largo.
- Cobertura de evaluación muy reducida: los únicos benchmarks son HarmBench-320 y una muestra de MMLU de 65 preguntas. No hay HumanEval, GSM8K, MT-Bench ni evaluaciones de visión. Los resultados son autoinformados.
- Inconsistencia interna en la model card: la cabecera indica 1,75 bpw y la tabla de especificaciones 2,13 bpw para el mismo PTQ1_0 ternario. Conviene tratar la cifra exacta como no confirmada.
- Licencia: los pesos se publican como Apache-2.0, pero el método de abliteración es propietario y no se documenta. La licencia del modelo base Qwen3.8-27B no se detalla en la información disponible, por lo que la trazabilidad completa de derechos no está cerrada.
- Dependencia de un fork: el soporte de PTQ1_0 y de la arquitectura híbrida requiere el fork de llama.cpp de PrismML. No se confirma compatibilidad con llama.cpp estándar, vLLM, TGI u Ollama, lo que complica el despliegue en plataformas ya estandarizadas.
- Madurez del artefacto: 0 descargas y 0 "me gusta" en el momento de la consulta, repositorio creado y actualizado en septiembre de 2026 sin historial de adopción. No hay verificación independiente de las afirmaciones del autor.
- Sin garantías de producción: no hay datos de latencia, throughput, estabilidad bajo carga ni comportamiento con peticiones concurrentes. No se recomienda su uso en sistemas orientados al usuario final sin una batería de pruebas propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/Bonsai-2-27B-1bit-CRACK-GGUF
- Modelo base ternario (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Cuenta del autor en X: https://x.com/dealignai

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente resultados sin relación de YouTube). No se dispone de paper, blog técnico ni demo adicionales.
