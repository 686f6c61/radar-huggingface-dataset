# pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-8bit

## Resumen

Linnaeus-0.1.0-2B-MLX-VLM-8bit es una compilación multimodal en formato MLX del modelo de decisión Linnaeus, publicada por el usuario pi-dal. No se trata de un modelo generativo conversacional al uso, sino de un modelo de decisión que devuelve una puntuación (score) extrayendo el logit de una fila concreta —`logits[marker_pos, score_row_id]`— en cada marca `<|fim_suffix|>`. El contrato de decisión está definido en el fichero `linnaeus-runtime.json`, de modo que la semántica de la salida es determinista y verificable, no texto libre.

El modelo parte de `pi-dal/Linnaeus-0.1.0-2B` y añade dos elementos: una torre de visión que le permite procesar imagen además de texto, y una cuantización a 8 bits del stack de lenguaje, mientras que la torre de visión se mantiene en bf16. El resultado pesa 2,7 GB en repositorio y aproximadamente 2,5 GB en ejecución, una cifra que lo sitúa en el rango de equipos con memoria unificada modesta. Está pensado para ejecutarse en macOS e iOS mediante `mlx-swift-lm` (fichero `Qwen35.swift`) junto con el procesador de `mlx-vlm`.

Su relevancia actual es doble: por un lado, demuestra un patrón de despliegue de modelos de decisión multimodales en el ecosistema Apple Silicon, no solo de LLM generativos; por otro, mejora el resultado del modelo base en las tareas de texto de JevBench v1.2.2, pasando del 65,8 % al 70,56 %. La licencia Apache 2.0 y el formato safetensors facilitan su integración, aunque el número de descargas (25) y de likes (0) indica una adopción todavía muy incipiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en la familia Qwen3.5 (tag `qwen3_5`); transformer con torre de visión adicional, para decisión multimodal |
| Parámetros totales | 2.213.243.712 (~2,2 B) |
| Parámetros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits en el stack de lenguaje; torre de visión en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Librería de ejecución | `mlx` |
| Modelo base | `pi-dal/Linnaeus-0.1.0-2B` |
| Tamaño del repositorio | 2,7 GB |
| Huella en ejecución | ~2,5 GB (torre de visión en bf16) |
| Plataformas objetivo | macOS e iOS (Apple Silicon) |
| Plazo de publicación | Creado el 26 de septiembre de 2026; actualizado el 26 de septiembre de 2026 |
| Descargas / likes | 25 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags y del código de integración: el modelo se apoya en la implementación `Qwen35.swift` de `mlx-swift-lm`, lo que sitúa la pila de lenguaje en la familia Qwen3.5, con una torre de visión añadida para el procesamiento de imágenes. La cuantización afecta únicamente al stack de lenguaje (8 bits), mientras que la torre de visión permanece en bf16, una decisión coherente con el coste relativamente bajo de la parte visual y con la sensibilidad de las representaciones visuales a la cuantización agresiva.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El elemento técnico diferencial es el contrato de decisión: la salida se obtiene leyendo un logit concreto en la posición de una marca `<|fim_suffix|>`, con la especificación formal en `linnaeus-runtime.json`. Para preguntas con imagen, la entrada antepone los tokens `<|vision_start|><|image_pad|><|vision_end|>` y se pasan los `pixel_values` a través del procesador de `mlx-vlm`. Se ha verificado la ruta de imagen de extremo a extremo contra PyTorch, con diferencias de probabilidad inferiores a 0,001 en pruebas sintéticas. Además, el método `predict()` para múltiples preguntas reutiliza un prefijo compartido —estado más tokens de imagen— y solo reenvía el sufijo de cada pregunta, con una mejora medida de 1,4x en 8 preguntas de texto y 4,5x en 6 preguntas de imagen.

## Capacidades

- Decisión multimodal: emite puntuaciones a partir de entradas de texto y de imagen, leyendo el logit de una fila concreta en cada marca de decisión.
- Contrato de decisión estable y versionado mediante `linnaeus-runtime.json`, lo que permite reproducir la semántica de la salida sin ambigüedad.
- Procesamiento de imágenes integrado: acepta `pixel_values` a través del procesador de `mlx-vlm`, con tokens especiales de visión en la secuencia.
- Decisión multi-pregunta con prefijo compartido: el estado (y los tokens de imagen) se reenvía una sola vez y cada pregunta aporta únicamente su sufijo.
- Ejecución nativa en Apple Silicon mediante MLX, incluida la ruta de `mlx-swift-lm` para macOS e iOS.
- No se documentan capacidades de generación libre de texto, razonamiento encadenado, uso de herramientas (*tool calling*), agentes ni *thinking mode*; la model card se limita al contrato de decisión.
- No se especifican capacidades multilingües ni un listado de idiomas soportados.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede actuar como cabecera de decisión que puntúa opciones discretas (por ejemplo, «continuar», «escalar», «abortar») leyendo el logit correspondiente, integrándose en un orquestador que consuma el contrato de `linnaeus-runtime.json`.
- Clasificación de documentos con componente visual: al aceptar imagen y texto, puede puntuar categorías sobre capturas, formularios escaneados o diagramas, siempre que el caso se formule como una decisión con filas de puntuación definidas.
- Moderación asistida por reglas aprendidas: uso de la puntuación por marca para decidir si un contenido textual o visual requiere revisión humana, con umbrales configurables por el integrador sobre el score devuelto.
- Control de calidad en captura de datos móvil: en iOS, con `mlx-swift-lm`, el modelo puede decidir en el dispositivo si una imagen capturada cumple criterios de calidad antes de enviarla a un servidor, reduciendo tráfico y coste.
- Evaluación por lotes en local sobre Mac: dado su tamaño (~2,5 GB), permite puntuar miles de pares texto-imagen en un portátil o Mac mini sin acceso a GPU dedicada, por ejemplo para etiquetado previo de un dataset.
- Comparación y validación de variantes cuantizadas: sirve como referencia de que una cuantización a 8 bits del stack de lenguaje mantiene fidelidad frente a PyTorch (diferencias < 0,001 en pruebas sintéticas), útil para equipos que evalúan el impacto de la cuantización en modelos de decisión.
- Decisión multi-pregunta sobre un mismo contexto: el prefijo compartido lo hace adecuado para someter varias preguntas a la misma imagen o documento, con mejoras de 4,5x en tiempo en el caso de 6 preguntas de imagen.

## Benchmarks y rendimiento

| Benchmark | Esta versión (MLX VLM 8bit) | Modelo base (`Linnaeus-0.1.0-2B`) |
|---|---|---|
| JevBench v1.2.2, tareas de texto | 70,56 % | 65,8 % |
| Ruta de imagen (verificación contra PyTorch) | Diferencias de probabilidad < 0,001 en pruebas sintéticas | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Huella de memoria en ejecución: aproximadamente 2,5 GB con la torre de visión en bf16; el repositorio ocupa 2,7 GB.
- Cabe en GPUs de consumo y en equipos con memoria unificada: cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada debería poder ejecutarlo, dado el tamaño del modelo.
- Plataformas objetivo declaradas: macOS e iOS sobre Apple Silicon, ejecutado con MLX y con `mlx-swift-lm` (`Qwen35.swift`) más el procesador de `mlx-vlm`.
- GPU NVIDIA recomendadas: no disponible; la model card no documenta rutas CUDA ni requisitos de VRAM para A100, H100 o RTX 4090.
- Opciones de despliegue: `mlx` y `mlx-swift-lm` (macOS/iOS); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; sí se documentan aceleraciones relativas por reutilización de prefijo, 1,4x con 8 preguntas de texto y 4,5x con 6 preguntas de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-8bit` | ~2,2 B | No disponible | Sí (texto + imagen) | 8 bits en lenguaje, bf16 en visión | Apache 2.0 | Hugging Face, 25 descargas |
| `pi-dal/Linnaeus-0.1.0-2B` (modelo base) | ~2,2 B | No disponible | No indicado | No disponible | No disponible | Hugging Face (referenciado como `base_model`) |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría o tamaño en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo generativo conversacional: su salida es una puntuación extraída de un logit concreto, por lo que solo es utilizable por integradores que respeten el contrato definido en `linnaeus-runtime.json`.
- La model card no aporta información sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación, lo que impide evaluar riesgos de sesgo sistemático.
- El riesgo de alucinación, en el sentido clásico de generación de texto falso, no aplica del mismo modo, pero no se documenta la calibración de las puntuaciones ni umbrales recomendados de decisión.
- No se especifican los idiomas soportados; se desconoce el comportamiento fuera del inglés y no hay evidencia de cobertura multilingüe.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con entradas largas o muchas preguntas encadenadas.
- Solo se publica un resultado de benchmark (JevBench v1.2.2 en tareas de texto); la ruta de imagen únicamente se ha verificado con pruebas sintéticas de paridad numérica frente a PyTorch, no con benchmarks públicos de visión.
- La adopción es muy baja (25 descargas, 0 likes) y el modelo se creó y actualizó el mismo día, por lo que no existe validación independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `pi-dal/Linnaeus-0.1.0-2B` antes de desplegarlo en producción.
- El soporte se limita al ecosistema Apple Silicon vía MLX; no hay rutas documentadas para CUDA, ROCm ni servidores de inferencia tradicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-8bit
- Modelo base en Hugging Face: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Paper, blog del autor, repositorio de código o demo: no disponibles en la información proporcionada.
- Los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden al número π) y no se incluyen como referencias.
