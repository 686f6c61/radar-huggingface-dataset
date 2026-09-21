# KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-8bit

## Resumen

Este repositorio contiene una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas por edición de pesos) del modelo Bonsai 2 27B de PrismML, publicada por el usuario KridgeDookie bajo el identificador `Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-8bit`. Se distribuye en formato MLX con safetensors y está pensado para inferencia local en el ecosistema Apple (mlx / mlx_vlm), aunque el propio autor advierte de que no se ha validado en iPhone, Metal de macOS ni App Store. El modelo conserva la torre de visión del modelo base, pero el comportamiento multimodal no se ha reevaluado. El repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y sin validación comunitaria.

El interés técnico principal no es la calidad conversacional, sino el método: se aplican dos pasadas de biproyección que preservan la norma sobre las capas 1 a 63 (126 matrices de salida por pasada) siguiendo la "receta Philadelphia" de Qwen3.8, con las direcciones de rechazo reextraídas específicamente de Bonsai en lugar de reutilizar direcciones de Qwen. El resultado es un modelo de precisión mixta: la mayoría de las matrices de lenguaje mantienen su representación ternaria rotada original, mientras que las 126 matrices editadas se almacenan en Q4_0 o Q8_0 canónicos sin rotar, con tamaño de grupo 32. El autor documenta que un reempaquetado ternario puro borraba la edición (124 de 126 rechazos reaparecían) y que ese candidato fallido no se distribuye.

El dato de parámetros es relevante: los safetensors declaran 50.148.954.352 parámetros totales, muy por encima de los "27B" que sugiere el nombre del modelo y del repositorio base. El archivo de pesos ocupa 15,00 GB, incluyendo la torre de visión sin modificar. La licencia declarada es Apache-2.0 para los pesos, mientras que el código de runtime incluido mantiene su propia licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explícita; derivado de Bonsai 2 27B (PrismML), que a su vez deriva de Qwen3.8-27B. Transformer con torre de visión (carga vía `mlx_vlm` / `vision_artifact`), cuantización ternaria rotada y manifiestos Hadamard (etiqueta `prism_hadamard_qwen35`). Se desconoce si la base es densa o MoE |
| Parametros totales | 50.148.954.352 (según safetensors declarados) |
| Parametros activos | no disponible (no se documenta si la base es MoE) |
| Longitud de contexto | no disponible (la criba de validación usó 4096 tokens de contexto GGUF, pero no se declara la ventana del modelo) |
| Tipos de cuantizacion | Precisión mixta: mayoría de matrices de lenguaje en ternario (2 bits) rotado; 126 matrices editadas en Q4_0 o Q8_0 canónicos sin rotar; tamaño de grupo 32 para las editadas. Tensores auxiliares y de visión conservan la precisión de origen |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos); el código de runtime incluido mantiene licencia MIT |
| Formato de pesos | safetensors (formato MLX), con runtime propio de carga y requisitos en `runtime/requirements.txt`. El modelo base también existe en GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Bonsai 2 27B de PrismML, derivada a su vez de Qwen3.8-27B, en una representación cuantizada ternaria con rotación Hadamard y ordenación de columnas GDN documentada mediante manifiestos. La model card no detalla la composición del dataset de preentrenamiento original ni si hubo RLHF o DPO en la cadena; esos datos corresponden a los modelos ascendentes y no se reproducen aquí. Lo que sí se documenta con precisión es el proceso de edición: dos pasadas de biproyección que preservan la norma, aplicadas a las capas 1-63 con escala 1,0, editando 126 matrices de salida por pasada. Las direcciones de rechazo se reextraen de Bonsai en cada pasada, sin sustituir pesos ni direcciones guardadas de Qwen. El conjunto de 842 pares de prompts se dividió en 716 pares de extracción y 126 pares retenidos, disjuntos por familia, con semilla 1337; los archivos `recipe.json` y los dos archivos de procedencia recogen el detalle.

La innovación técnica destacable es el tratamiento de la cuantización: si las 126 matrices editadas se reempaquetaran de nuevo en ternario puro, la edición se borraría (reaparecían 124 de 126 rechazos en el conjunto retenido), de modo que se conservan en Q4_0 o Q8_0 canónicos sin rotar, actualizando la ordenación de columnas GDN y los manifiestos Hadamard en consecuencia. Esto obliga a usar el cargador de precisión mixta incluido: los cargadores MLX genéricos y los cargadores de Bonsai sin modificar no interpretan correctamente este formato, ya que el runtime añade anchos de bit y tamaños de grupo por módulo. El esquema del cargador es "schema-2" y admite uso solo texto además de visión.

## Capacidades

- Generación de texto y conversación multi-turno en el ecosistema MLX (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Edición orientada a eliminar rechazos: en la criba retenida de 126 prompts, el modelo original rechazaba 123 y las variantes mixtas de 4 y 8 bits rechazan 0.
- Conservación de tareas benignas: 21 de 24 tareas benignas superadas en la variante mixta, frente a 22 de 24 del Bonsai original (según la misma criba heurística).
- Capacidad multimodal potencial: la torre de visión se preserva en MLX y el cargador incluido (`load_vl_model`, `vision_artifact`) es consciente de visión, pero el comportamiento de visión no se ha reevaluado.
- Soporte de plantilla de chat vía `apply_chat_template` del procesador y configuración propia (`chat_config`).
- Inferencia determinista con decodificación greedy documentada en la validación (penalización de repetición 1,1).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo "thinking", audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo sirve como referencia abliterada para medir tasas de rechazo frente a un modelo alineado, usando la criba determinista de 126 prompts retenidos descrita en la model card; es adecuado porque el autor publica la metodología exacta (96 tokens de salida, greedy, penalización 1,1, contexto de 4096).
- Evaluación y reproducción de técnicas de abliteración: permite reproducir las dos pasadas de biproyección con escala 1,0 sobre las capas 1-63 comparando el resultado ternario puro (fallido) con el mixto distribuido, y verificar el impacto de la precisión en la persistencia de la edición.
- Estudio de cuantización de precisión mixta: el repositorio es un caso práctico de cómo mezclar representaciones ternarias rotadas con bloques Q4_0/Q8_0 por módulo (grupo 32) afecta a una propiedad funcional concreta del modelo; útil para quienes investigan formatos de pesos.
- Generación creativa sin filtros editoriales: escritura de ficción, guiones o narrativa con temas que un modelo alineado rechazaría, ejecutada en local para no depender de APIs externas.
- Procesamiento de texto sensible en local: al ejecutarse con MLX sobre hardware propio, permite tratar documentos confidenciales sin enviarlos a servicios en la nube, siempre que el operador asuma la ausencia de filtros de seguridad.
- Construcción de conjuntos de datos adversarios para evaluar clasificadores: el modelo puede generar respuestas que un modelo alineado no produciría, lo que resulta útil para entrenar y probar moderadores de contenido.
- Prototipado de asistentes conversacionales con plantilla de chat: el cargador incluido expone `apply_chat_template` y `chat_config`, lo que permite montar un bucle conversacional mínimo en Python sobre MLX.
- Fine-tuning o destilación posterior sobre representaciones ternarias: sirve como punto de partida para estudiar si el ajuste adicional sobre pesos de 2-8 bits preserva o degrada la edición aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de inteligencia (MMLU, GSM8K, HumanEval u otros) en la información disponible. El autor indica explícitamente que las cifras de validación son "cribas heurísticas deterministas, no puntuaciones amplias de inteligencia". Se reproducen a continuación tal cual:

| Modelo | Rechazos / 126 | Tareas benignas superadas / 24 |
|---|---:|---:|
| Bonsai original | 123 | 22 |
| Mixto 4 bits | 0 | 21 |
| Mixto 8 bits | 0 | 21 |

Condiciones de la criba retenida: 96 tokens de salida, decodificación greedy, penalización de repetición 1,1 y contexto GGUF de 4096 tokens sobre una A100 de 80 GB. El checkpoint final intermedio en BF16 superó una puerta de apertura independiente de 126 prompts y 24 tokens con cero rechazos y 100 % de aperturas utilizables. Las comprobaciones en MLX cubren recarga estricta del modelo completo, una prueba de humo de generación aritmética sobre CPU Linux y verificaciones numéricas independientes de capas empaquetadas. El autor advierte de que no deben trasladarse a este derivado las afirmaciones de inteligencia o throughput del modelo original.

## Requisitos de hardware

- Peso del archivo de pesos: 15,00 GB, incluyendo la torre de visión sin modificar. La model card subraya que el tamaño del archivo no equivale al requisito de RAM del dispositivo: se necesita memoria adicional para el runtime y las cachés.
- Cifras de VRAM por cuantización: no disponibles. El autor no publica estimaciones.
- Único entorno documentado: una NVIDIA A100 de 80 GB para la criba de validación con contexto GGUF de 4096 tokens.
- GPU de consumo: no documentado. El formato MLX está orientado a silicio de Apple con memoria unificada; el autor no confirma ni desmiente su funcionamiento en GPUs de consumo.
- Validación en dispositivos Apple: no realizada. No hay pruebas en iPhone, Metal de macOS ni App Store; la integración completa en Swift/iOS queda como trabajo separado según el autor.
- Opciones de despliegue: MLX con el cargador de precisión mixta incluido (`runtime/`, `vision_artifact.load_vl_model` + `mlx_vlm.generate`). Los cargadores MLX genéricos y los cargadores de Bonsai sin modificar no implementan este formato mixto correctamente.
- vLLM, llama.cpp, Ollama o TGI: no disponibles/no documentados para este artefacto; el formato de precisión mixta con anchos de bit por módulo exige el runtime incluido.
- Latencia y throughput: no disponibles; el autor pide expresamente no aplicar las cifras de throughput del modelo ascendente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rechazos / 126 | Disponibilidad |
|---|---|---|---|---|---|---|
| Este derivado (Mixed 2-8 bits, MLX) | 50.148.954.352 (safetensors) | no disponible | Mixta: ternario rotado + Q4_0/Q8_0 en 126 matrices | apache-2.0 (pesos), MIT (runtime) | 0 | Repositorio MLX; requiere cargador propio |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (base) | no disponible (nomenclatura 27B) | no disponible | Ternaria 2 bits (MLX) | apache-2.0 (según cadena de derivación) | 123 (Bonsai original) | Público en HuggingFace (revisión `3f926b415992eaa2ae9dd7b573706494d6bbf787`) |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | no disponible | no disponible | Ternaria, formato GGUF | apache-2.0 (según cadena de derivación) | 123 (Bonsai original) | Público en HuggingFace (revisión `6ed5e12bf84b7a63069882c91dd9e9218647d17b`) |
| Qwen3.8-27B (ascendente remoto) | no disponible | no disponible | no disponible | no disponible | no aplica (alineado) | no disponible en la información proporcionada |

No se dispone de datos de benchmarks de inteligencia para ninguno de los modelos de la tabla, por lo que la comparación se limita a parámetros declarados, formato, licencia y tasa de rechazo en la criba del autor.

## Limitaciones y advertencias

- La abliteración elimina intencionadamente las direcciones de rechazo: el modelo no incorpora barreras de seguridad alineadas y puede producir contenido dañino, ilegal o sexualmente explícito. En la criba del autor, 0 de 126 prompts retenidos fueron rechazados.
- Riesgo elevado de alucinación: no hay benchmarks de conocimiento, razonamiento ni veracidad; el autor insiste en que no se trasladen las afirmaciones del modelo original a este derivado.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o fairness.
- Idiomas soportados: no disponibles; no hay evaluación multilingüe.
- Longitud de contexto: no declarada. El único dato operativo es el uso de 4096 tokens de contexto en la criba de validación.
- Visión no verificada: los pesos de visión se conservan, pero el comportamiento multimodal no se reevaluó tras la edición.
- Compatibilidad restringida: los cargadores MLX genéricos y los de Bonsai sin modificar no funcionan con este formato mixto; hay que usar el runtime incluido. Cualquier despliegue por otras vías (vLLM, llama.cpp, Ollama, TGI) no está soportado ni documentado.
- Sin validación en dispositivos: no hay pruebas en iPhone, Metal de macOS ni App Store. El autor indica que la integración Swift/iOS es trabajo pendiente y separado.
- Discrepancia de nomenclatura: el nombre y el repositorio base aluden a 27B, mientras que los safetensors declaran 50.148.954.352 parámetros totales. No se documenta la causa.
- Validación limitada: las comprobaciones son cribas heurísticas deterministas, no evaluaciones amplias; incluyen una única prueba de humo de generación en CPU Linux.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en producción.
- Licencia: los pesos se declaran Apache-2.0 y el runtime incluido MIT, pero el repositorio no detalla obligaciones adicionales de atribución sobre la cadena de derivación (Bonsai de Prism ML sobre Qwen3.8-27B); conviene revisar los términos de los modelos ascendentes antes de un uso comercial.
- Contenido y responsabilidad legal: el nombre incluye "UNCENSORED"; el uso en producción exige medidas de filtrado externas si el caso de uso lo requiere.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-8bit
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit (revisión `3f926b415992eaa2ae9dd7b573706494d6bbf787`)
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf (revisión `6ed5e12bf84b7a63069882c91dd9e9218647d17b`)
- Descarga directa con `hf download`: `hf download KridgeDookie/Ternary-Bonsai-2-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-Mixed-2-8bit --local-dir bonsai-mlx`
- Archivos internos citados en la model card: `recipe.json`, `evaluation.json`, dos archivos de procedencia y `runtime/requirements.txt` (dentro del propio repositorio)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo, su autor o la técnica "Philadelphia" en las consultas realizadas; los resultados devueltos correspondían a páginas de equipos preensamblados sin relación con el modelo.
