# AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP es una conversión cuantizada del modelo NVIDIA Nemotron-3 Super 120B-A12B en formato BF16, publicada por el usuario AutomatosX dentro de su pipeline de desarrollo AXQuant. El artefacto se distribuye en el formato nativo de MLX (Apple) con cuantización MXFP8 (8 bits con escalado microscópico) sobre los pesos elegibles del backbone, mientras que los tensores protegidos conservan la precisión declarada en el plan de cuantización. El repositorio pesa 131 GB y declara 120.668.707.840 parámetros totales en safetensors.

El modelo resuelve un problema de despliegue: el checkpoint original en BF16 exige del orden de 240 GB de memoria, mientras que esta versión MXFP8 reduce el peso del backbone aproximadamente a la mitad, lo que permite plantear su ejecución en equipos Apple Silicon con memoria unificada mediante `mlx-lm`. La nomenclatura del modelo (120B-A12B) sugiere una arquitectura con 120B parámetros totales y 12B activos, coherente con el tag `nemotron_h`, si bien la información disponible no confirma de forma explícita el número de parámetros activos.

Se trata de un artefacto de desarrollo: la propia model card indica que no se reclama certificado de calidad, ni exactitud del MTP, ni velocidad, ni compatibilidad de ejecución del payload de Multi-Token Prediction en MLX-LM, AX Engine, MTPLX u oMLX. El conteo de adopción en el momento de la ficha es de 56 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nemotron_h (según tags del repositorio); detalle interno no disponible |
| Parámetros totales | 120.668.707.840 (≈120,7B) |
| Parámetros activos | 12B según la nomenclatura del modelo (no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 (8 bits, formatos microscópicos); los tensores protegidos mantienen su precisión declarada |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (license: other) |
| Formato de pesos | safetensors (MLX); payload MTP aparte en `mtp.safetensors` |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 (revisión inmutable `2dc98e2afe4face0e4ce40972a915c45368bd34a`) |
| Librería | mlx |
| Tamaño del repositorio | 131,0 GB |
| Pipeline | text-generation |
| Formato físico AXQuant | MXFP8 |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una conversión de precisión del checkpoint BF16 de NVIDIA. El tag `nemotron_h` sitúa el modelo dentro de la familia Nemotron-H de NVIDIA, si bien la información proporcionada no detalla la composición exacta de capas, el mecanismo de atención ni la proporción entre componentes. Tampoco hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo fuente se sometió a RLHF, DPO u otra fase de alineamiento: esa información correspondería a la model card del modelo base, que no forma parte del material facilitado.

La innovación técnica del artefacto es doble. Por un lado, AXQuant aplica cuantización MXFP8 únicamente a los pesos elegibles del backbone, preservando el resto de tensores con la precisión declarada en el plan de cuantización incluido en el repositorio. Por otro, el checkpoint fuente integra tensores de MTP (Multi-Token Prediction) dentro de sus shards originales; AXQuant los preserva byte a byte en un fichero `mtp.safetensors` independiente y registra los digests de origen y de payload en `ax_nemotron_mtp_manifest.json`. La model card advierte expresamente de que la compatibilidad de ejecución del MTP no está verificada en ningún runtime.

El 2026-10-06 se publicó una auditoría de formato que corrigió el modo del contenedor de cuantización de `affine` a `mxfp8` en ambos bloques de configuración, sin modificar los bytes de los pesos ni la asignación de precisión por módulo. Esa misma auditoría aclara que no concede perfil de ejecución oMLX/MTPLX ni una afirmación de carga y generación correctas, y que la evidencia previa de smoke test pertenece a la revisión original y no se reutiliza.

## Capacidades

- Generación de texto y uso conversacional, según los tags `text-generation` y `conversational` del repositorio.
- Ejecución sobre el backbone de texto mediante `mlx_lm.load` y `mlx_lm.generate`, tal como muestra el ejemplo de la model card.
- Presencia de tensores de Multi-Token Prediction (MTP) preservados del checkpoint fuente, sin garantía declarada de soporte en runtime.
- Razonamiento, generación de código, matemáticas, visión, tool calling, function calling, uso como agente y capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo puede cargarse con `mlx-lm` en equipos con memoria unificada amplia (Mac Studio o Mac Pro de gama alta), lo que permite ejecutar un modelo de 120B totales sin depender de GPU NVIDIA ni de servicios en la nube. La cuantización MXFP8 reduce el peso del backbone frente al BF16 original.
- Investigación sobre cuantización MXFP8: el repositorio incluye el plan AXQuant, los hashes de ficheros y un `runtime_audit.json` con los enlaces fijados entre configuración, índice y cabeceras, lo que lo convierte en material útil para estudiar cómo se comporta una cuantización microscópica de 8 bits sobre un modelo MoE de gran tamaño.
- Experimentación con Multi-Token Prediction: los tensores MTP se distribuyen en un fichero separado y con manifiesto de digests, de modo que un equipo que desarrolle soporte de MTP en MLX, AX Engine u otro runtime puede evaluar la decodificación especulativa sobre este payload, asumiendo que la compatibilidad no está verificada.
- Reproducción de conversiones de precisión: sirve como referencia metodológica para replicar el flujo AXQuant sobre otros checkpoints BF16, comparando el resultado con la revisión original enlazada en la model card.
- Evaluación comparativa de degradación por cuantización: al existir el checkpoint BF16 de origen y esta versión MXFP8, es posible plantear estudios de divergencia de salida entre ambos, siempre que el evaluador aporte su propio conjunto de pruebas, ya que el repositorio no publica benchmarks.
- Prototipado de asistentes conversacionales en hardware de sobremesa: para equipos con memoria suficiente, el modelo puede servir como backend de chat local en tareas de baja concurrencia, aceptando la latencia que impone un modelo de este tamaño en memoria unificada.
- Validación de pipelines de despliegue MLX: el ejemplo de carga de la model card permite comprobar en un entorno controlado que el tokenizer, el índice y los safetensors se resuelven correctamente antes de integrar el modelo en una aplicación mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se añade ninguna afirmación de calidad, exactitud del MTP ni velocidad.

## Requisitos de hardware

- Peso de los pesos cuantizados: el repositorio ocupa 131,0 GB, por lo que la inferencia requiere al menos esa cantidad de memoria más el margen de overhead de runtime, el contexto y las cachés. En la práctica, por debajo de unos 140-150 GB de memoria unificada o agregada no es viable cargar el backbone completo.
- Hardware objetivo: al tratarse de un artefacto en formato MLX, el destino natural son equipos Apple Silicon con memoria unificada, como Mac Studio con 192 GB o 512 GB y configuraciones equivalentes de Mac Pro.
- GPU NVIDIA: no se declara soporte en la información proporcionada. Un despliegue en A100 80GB o H100 80GB exigiría sharding multigpu o una conversión de formato, y no está documentado en este repositorio.
- GPU de consumo: no cabe. Una RTX 4090 con 24 GB no puede alojar un modelo de 120B en 8 bits; se necesitarían al menos seis GPU de ese tipo y una capa de paralelismo no especificada por el autor.
- Opciones de despliegue: MLX-LM es el runtime documentado mediante el ejemplo de `mlx_lm.load`. AX Engine, MTPLX y oMLX se mencionan en la model card únicamente para aclarar que no se reclama compatibilidad MTP en ellos. vLLM, llama.cpp, Ollama y TGI no aparecen soportados ni mencionados.
- Latencia y throughput: no disponibles. El autor no publica medidas de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP | 120.668.707.840 totales (12B activos según nomenclatura, no confirmado) | no disponible | MXFP8 | safetensors MLX | NVIDIA Nemotron Open Model License | HuggingFace, 56 descargas |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | no disponible en la información proporcionada | no disponible | BF16 | safetensors | NVIDIA Nemotron Open Model License | HuggingFace (modelo base) |
| Otros modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento, contexto o licencia de alternativas de la misma categoría, por lo que no es posible establecer una comparación cuantitativa fiable más allá del contraste entre el checkpoint BF16 de origen y esta conversión MXFP8.

## Limitaciones y advertencias

- Artefacto de desarrollo: la model card declara explícitamente que no se reclama certificado de calidad, exactitud del MTP, velocidad ni certificación de ningún tipo.
- Compatibilidad MTP no verificada: aunque los tensores de Multi-Token Prediction se preservan byte a byte, no se afirma que MLX-LM, AX Engine, MTPLX u oMLX puedan ejecutarlos. Cualquier uso de decodificación especulativa con este payload queda por validar.
- Ausencia total de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, lo que impide estimar la degradación introducida por la cuantización MXFP8 frente al checkpoint BF16.
- Evidencia de ejecución no reutilizada: la auditoría de formato del 2026-10-06 no aporta un smoke test válido para la revisión corregida; la evidencia previa pertenece a la revisión original y no se reutiliza.
- Idiomas no declarados: el repositorio no especifica cobertura lingüística, por lo que no se puede garantizar el comportamiento en castellano ni en ningún otro idioma.
- Contexto no declarado: se desconoce la longitud máxima de contexto soportada, dato crítico para planificar memoria y para casos de uso con documentos largos.
- Licencia restrictiva potencial: el modelo se distribuye bajo la NVIDIA Nemotron Open Model License, incluida como PDF en el repositorio. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache 2.0 o MIT.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a cualquier modelo generativo de esta familia.
- Adopción muy baja: 56 descargas y 0 likes en el momento de la ficha, con una única conversión de un autor independiente y sin validación comunitaria de la calidad del resultado.
- Requisitos de memoria muy altos: 131 GB de pesos hacen inviable el despliegue en hardware de consumo convencional y limitan el público objetivo a equipos Apple Silicon de gama muy alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Auditoría de formato de runtime: https://huggingface.co/AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP/blob/main/runtime_audit.json
- Revisión original con evidencia previa de smoke test: https://huggingface.co/AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP8-MTP/tree/a50a9dc169fedd1293c2752e684c70646a240960
