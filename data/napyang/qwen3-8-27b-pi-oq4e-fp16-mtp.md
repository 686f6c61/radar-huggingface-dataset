# NapYang/Qwen3.8-27B-pi-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-pi-oQ4e-fp16-mtp es una cuantización de 4 bits mixta del modelo bytkim/Qwen3.8-27B-pi, un modelo denso de 27.781 millones de parámetros con capacidades de visión y lenguaje construido sobre la arquitectura Qwen3.5. Lo publica el usuario NapYang en Hugging Face y está pensado para su ejecución en Apple Silicon mediante la librería MLX, no para GPUs convencionales. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de predicción multi-token (MTP), lo que permite decodificación especulativa integrada.

El modelo base está orientado a tareas de programación y comprensión de imagen y vídeo, con una ventana de contexto nativa de 262.144 tokens. La cuantización emplea la herramienta oQ (oMLX v0.7.3) con la estructura oQe, que asigna bits por capa según la sensibilidad medida de cada una, con un promedio efectivo de 4,840 bits por peso en el backbone de lenguaje y 5,310 bits por peso en el checkpoint completo.

Su relevancia práctica es que permite ejecutar un modelo multimodal de 27B con contexto muy largo en equipos con memoria unificada, algo que un checkpoint en BF16 no permitiría en la mayoría de estaciones de trabajo. La licencia Apache-2.0 heredada del modelo fuente facilita el uso comercial, aunque el ecosistema de ejecución está limitado a MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con capas Gated DeltaNet y Gated Attention; incluye codificador visual y cabeza MTP |
| Parámetros totales | 27.781.427.952 (27,781B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | oQ4e mixta: affine 4, 5, 6 y 8 bits con grupo 64, más tensores en FP16 y FP32; 4,840 bits/peso en el backbone y 5,310 bits/peso en el total |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx), escalas y sesgos en FP16, codificador visual en FP32 |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5 en configuración densa de 27B, con un diseño híbrido que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas Gated Attention clásicas. Esta mezcla busca reducir el coste de atención en secuencias largas sin renunciar a la calidad de un transformer convencional. El checkpoint incorpora además un codificador visual de 0,461B de parámetros y una cabeza de predicción multi-token de 0,425B, que habilita decodificación especulativa con el propio modelo como drafter.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo fuente. La cuantización sí está documentada con detalle: oQ4e asigna bits por capa según la sensibilidad medida, redondea cada grupo con una matriz de importancia y reajusta escala y sesgo mediante mínimos cuadrados ponderados. Las asignaciones por capa replican las de Jundot/Qwen3.8-27B-oQ4e-fp16-mtp, de la misma arquitectura.

## Capacidades

- Generación de texto y razonamiento general en un modelo denso de 27B.
- Generación y asistencia de código, ya que el modelo base está etiquetado como orientado a programación.
- Comprensión de imágenes y vídeo mediante el codificador visual incluido (pipeline image-text-to-text).
- Conversación multi-turno con contexto nativo de hasta 262.144 tokens.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local sobre Apple Silicon: el modelo puede autocompletar, explicar y refactorizar código dentro de un IDE o CLI, aprovechando el contexto largo para cargar varios ficheros de un repositorio en una sola ventana.
- Análisis de repositorios completos: con 262.144 tokens de contexto, se pueden introducir ficheros de configuración, módulos y tests para tareas de revisión de código o generación de documentación técnica.
- Comprensión de capturas de pantalla y diagramas: al ser image-text-to-text, puede extraer texto de interfaces, interpretar diagramas de arquitectura o describir figuras técnicas.
- Procesamiento de vídeo corto o secuencias de fotogramas: el codificador visual permite resumir o etiquetar contenido audiovisual en flujos de trabajo locales.
- Prototipado de agentes con contexto largo: útil para experimentar con pipelines de razonamiento multi-paso donde el historial completo debe permanecer en contexto, aunque el soporte explícito de tool calling no está documentado.
- Inferencia privada en estación de trabajo: al ejecutarse en memoria unificada de un Mac, permite trabajar con datos sensibles sin enviarlos a la nube.
- Evaluación de cuantizaciones: sirve como referencia para comparar la pérdida de calidad de oQ4e frente al modelo base en BF16 en tareas de código y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 18,5 GB; el checkpoint en memoria requiere aproximadamente 17,2 GiB según el desglose del autor (15,155 GiB de backbone, 1,716 GiB de codificador visual y 0,301 GiB de cabeza MTP).
- Memoria unificada recomendada: al menos 32 GB para cargar el modelo con margen para el contexto KV; 64 GB o más para aprovechar ventanas de contexto muy largas.
- GPU dedicadas: no aplicable de forma nativa, ya que el formato es MLX y está diseñado para Apple Silicon. No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible para CUDA; en Apple Silicon, sí en equipos con memoria unificada suficiente (M-series con 32 GB o más).
- Opciones de despliegue: MLX y oMLX (versión 0.7.3 para la cuantización); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NapYang/Qwen3.8-27B-pi-oQ4e-fp16-mtp | 27,781B | 262.144 | MLX safetensors, 4,840 bits/peso (backbone) | Apache-2.0 | Hugging Face, 0 descargas |
| bytkim/Qwen3.8-27B-pi (base) | 27B (aproximado) | 262.144 | no disponible en la información | Apache-2.0 (heredada) | Hugging Face |
| Jundot/Qwen3.8-27B-oQ4e-fp16-mtp | misma arquitectura | 262.144 | MLX safetensors, oQ4e | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks ni de especificaciones de alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización es de 4 bits mixta: aunque preserva más precisión en capas sensibles, introduce degradación respecto al modelo en BF16, especialmente en tareas de razonamiento matemático y código complejo.
- El checkpoint está atado a MLX; no es portable a CUDA sin reconversión, lo que limita su uso en infraestructura de servidores convencional.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base ni de esta cuantización.
- Los idiomas soportados no están documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- El soporte de tool calling y de agentes no está confirmado en la información disponible; conviene validarlo antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2 de noviembre de 2026): no hay evidencia de uso en producción ni validación por terceros.
- La licencia Apache-2.0 se hereda del modelo fuente, pero conviene verificar las condiciones del modelo base original antes de un despliegue comercial.
- El contexto de 262.144 tokens exige memoria adicional para la caché KV que no está cuantificada en el tamaño del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NapYang/Qwen3.8-27B-pi-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Referencia de asignación de bits: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-fp16-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
