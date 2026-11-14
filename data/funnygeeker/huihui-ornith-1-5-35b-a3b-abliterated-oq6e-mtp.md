# funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ6e-mtp

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-oQ6e-mtp es una versión cuantizada del modelo Huihui-Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales y, según el sufijo "A3B", aproximadamente 3.000 millones de parámetros activos por token. El modelo base deriva de la familia Qwen3.5-MoE, tal y como indica el tag `qwen3_5_moe` en el repositorio, y ha sido sometido a un proceso de "abliteration" (eliminación o atenuación de los mecanismos de rechazo alineados) antes de su cuantización. El autor del checkpoint cuantizado es funnygeeker, que lo publica bajo la librería MLX para su ejecución en hardware Apple Silicon.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: una arquitectura MoE de gran tamaño con activación dispersa, una cuantización mixta de precisión (oQ, oMLX v0.7.0.dev1) que logra un promedio efectivo de 6.692 bits por peso, y una cabeza MTP (Multi-Token Prediction) que ocupa 0.845B parámetros adicionales. El resultado es un checkpoint de 30.072 GB (28.007 GiB) que incluye módulos de visión (0.447B parámetros) y que está pensado para inferencia local en equipos con memoria unificada amplia, no en GPUs de centro de datos.

No se dispone de información publicada sobre el proceso de entrenamiento del modelo base, los datos utilizados, la licencia o los idiomas soportados más allá de lo que se deduce de su linaje Qwen. Esta ficha documenta exclusivamente lo que el repositorio y la model card permiten verificar, marcando como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con cabeza MTP y torre de visión; tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35.952B) |
| Parametros activos | Aproximadamente 3B (deducido del sufijo "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 6-bit group 128 (0.252B), affine 6-bit group 64 (33.999B), affine 8-bit group 128 (0.129B), affine 8-bit group 64 (1.095B), BF16 (0.478B); promedio efectivo 6.692 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors cuantizados, librería `mlx`) |
| Tamano del repositorio | 30.1 GB (30.072 GB / 28.007 GiB de pesos) |
| Desglose de almacenamiento | Lenguaje: 34.661B / 26.519 GiB; Visión: 0.447B / 0.832 GiB; MTP head: 0.845B / 0.656 GiB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts identificado por el tag `qwen3_5_moe`, lo que sitúa al modelo base en la familia Qwen3.5-MoE. El checkpoint incorpora tres componentes diferenciados según el desglose de almacenamiento de la model card: el modelo de lenguaje propiamente dicho (34.661B parámetros lógicos, 26.519 GiB), un módulo de visión (0.447B parámetros, 0.832 GiB) que lo habilita para tareas multimodales, y una cabeza MTP o Multi-Token Prediction (0.845B parámetros, 0.656 GiB). La presencia de la cabeza MTP es técnicamente destacable porque permite decodificación especulativa nativa: el modelo predice varios tokens por paso y un verificador los valida, lo que en la práctica incrementa el throughput de generación sin cambiar el resultado final.

El proceso de cuantización es el elemento diferencial de este artefacto. Se ha aplicado oQ (oMLX v0.7.0.dev1), un esquema de cuantización de precisión mixta que asigna bits de forma no uniforme según la sensibilidad de cada tensor. La distribución resultante es muy asimétrica: el 94.567% de los pesos lógicos (33.999B) se almacenan en affine 6-bit con grupo 64, mientras que un 3.046% (1.095B) sube a 8-bit grupo 64 y un 1.329% (0.478B) se mantiene en BF16 sin cuantizar. Los tensores en BF16 y 8-bit corresponden previsiblemente a capas críticas para la estabilidad numérica (embeddings, normalizaciones o proyecciones de salida). El promedio efectivo de 6.692 bits/peso es coherente con esa mezcla y explica que un modelo de 35.952B parámetros ocupe solo 28.007 GiB en disco.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineación. El sufijo "abliterated" indica que se ha aplicado una técnica de eliminación de direcciones de rechazo en el espacio de activaciones, pero el repositorio no documenta el método exacto ni el grado de intervención.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-MoE.
- Procesamiento de imágenes gracias al módulo de visión de 0.447B parámetros incluido en el checkpoint (visión-lenguaje).
- Decodificación especulativa mediante la cabeza MTP de 0.845B parámetros, que acelera la generación en hardware compatible.
- Capacidades multilingües: no documentadas explícitamente, aunque por linaje Qwen se espera cobertura amplia; no confirmado.
- Tool calling y function calling: no documentado en la model card; no se puede confirmar.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir los rechazos alineados, lo que amplía el rango de respuestas generadas pero elimina barreras de seguridad del modelo original.
- Ejecución optimizada en Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac con memoria unificada grande: el checkpoint de 28 GiB encaja en equipos con 32 GB o más de memoria unificada, lo que permite ejecutar un MoE de 35B en un portátil o Mac Studio sin GPU dedicada. Es el caso de uso principal y para el que está empaquetado el artefacto.
- Prototipado de aplicaciones multimodales en local: el módulo de visión integrado permite experimentar con tareas de imagen a texto (descripción, extracción de información, VQA) sin depender de APIs externas, útil para investigadores que necesitan privacidad de datos.
- Aceleración de la generación con MTP: en pipelines de generación larga (resúmenes, redacción asistida, generación de código extenso), la cabeza MTP permite decodificación especulativa y reduce la latencia por token frente a un modelo sin ella, siempre que el runtime MLX lo soporte.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated", sirve como objeto de estudio para analizar qué comportamientos se suprimen con las técnicas de rechazo y cómo afecta la abliteración a la calidad y coherencia del modelo.
- Evaluación de esquemas de cuantización mixta: el checkpoint es un caso práctico de oQ con distribución de bits documentada, útil para comparar la degradación de un MoE cuantizado a 6.692 bits/peso frente al modelo en BF16 en tareas de razonamiento y código.
- Despliegue en entornos con restricciones de red o soberanía de datos: al ejecutarse íntegramente en local con MLX, permite procesar texto e imágenes sensibles sin salida a Internet, en escenarios de salud, legal o administración pública.
- Experimentación con arquitecturas MoE dispersas: con ~3B parámetros activos sobre 35B totales, es un banco de pruebas para medir el equilibrio entre calidad y coste computacional en tareas de clasificación, extracción y generación controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 28.007 GiB en disco; en ejecución se necesita memoria adicional para el contexto KV. Con 32 GB de memoria unificada se puede cargar, aunque el margen para contextos largos es ajustado; 48-64 GB es el rango recomendado.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra) con memoria unificada, dado que el formato es MLX y no es directamente compatible con CUDA sin conversión.
- GPU dedicadas: no es un checkpoint utilizable en A100, H100 o RTX 4090 sin reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estándar), ya que la cuantización oQ está implementada para MLX.
- Cabe en GPU de consumo: no en el formato actual; un modelo de 35B a 6.692 bits/peso excede los 24 GB de una RTX 4090. En Apple Silicon, sí en configuraciones de 32 GB o superiores.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX (oMLX v0.7.0.dev1 o superior). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en el repositorio.
- Latencia y throughput: no disponibles. La cabeza MTP debería mejorar el throughput en decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| Huihui-Ornith-1.5-35B-A3B-abliterated-oQ6e-mtp | 35.952B | ~3B | no disponible | oQ 6.692 bits/peso | no disponible | MLX |
| Qwen3-30B-A3B (referencia de familia) | 30.5B | ~3B | 32K-128K según variante | múltiples (GGUF, AWQ, etc.) | Apache 2.0 (variantes oficiales) | safetensors, GGUF |
| Mixtral 8x7B | 46.7B | ~12.9B | 32K | múltiples | Apache 2.0 | safetensors, GGUF |
| Qwen3-32B (denso) | 32.8B | 32.8B | 32K-128K | múltiples | Apache 2.0 | safetensors, GGUF |

La comparación debe tomarse con cautela: los datos del modelo de esta ficha provienen del repositorio y los de los alternativas de conocimiento general de sus familias. El modelo aquí descrito no publica licencia ni contexto, lo que impide una comparación rigurosa en esos ejes. Frente a un denso de 32B, la ventaja del MoE es el coste de inferencia (~3B activos), y frente a Mixtral 8x7B, un menor número de parámetros activos y un empaquetado específico para Apple Silicon.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar la licencia del modelo base (Qwen3.5-MoE) y del checkpoint derivado antes de cualquier despliegue en producción.
- Modelo "abliterated": la eliminación de mecanismos de rechazo implica que el modelo puede generar contenido que el original bloquearía. Requiere filtros y moderación externos si se expone a usuarios finales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad factual para este checkpoint.
- Cuantización agresiva: 6.692 bits/peso promedio, con el 94.5% de los pesos a 6-bit, puede degradar tareas sensibles a la precisión numérica (matemáticas, código de baja tolerancia) respecto al BF16. No hay benchmarks que cuantifiquen esa pérdida.
- Contexto e idiomas no documentados: no se puede garantizar el comportamiento en ventanas largas ni la calidad en castellano sin evaluación propia.
- Dependencia de MLX: no es portable a CUDA sin reconversión; limita el despliegue a hardware Apple.
- Trazabilidad limitada: 83 descargas y 0 likes en el momento de la consulta; el autor no publica detalles del proceso de abliteración ni del modelo base exacto.
- La cabeza MTP solo aporta ventaja si el runtime la explota; en caso contrario, ocupa 0.656 GiB sin beneficio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/funnygeeker/Huihui-Ornith-1.5-35B-A3B-abliterated-oQ6e-mtp
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repos del modelo base ni demos adicionales.
