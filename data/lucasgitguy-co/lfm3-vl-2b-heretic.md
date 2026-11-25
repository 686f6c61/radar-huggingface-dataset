# Lucasgitguy-co/lfm3-vl-2b-heretic

## Resumen

LFM3-VL-2B Heretic es un ajuste fino (fine-tune) del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, publicado por el usuario Lucasgitguy-co en Hugging Face. Se distribuye en formato Safetensors BF16 e incorpora el modelo de lenguaje, el codificador visual, el proyector, el tokenizador, la configuración del procesador y código de modelo personalizado. Con 1.918.181.888 parámetros (aproximadamente 1,92 mil millones) y un repositorio de 3,9 GB, está pensado para tareas de image-text-to-text, es decir, generación de texto condicionada por imagen y texto.

La etiqueta "heretic" hace referencia a la familia de técnicas de desalineación (abliteration) que buscan eliminar los mecanismos de rechazo de un modelo ajustado con RLHF, de modo que responda a peticiones que el modelo original declinaría. El autor no documenta el procedimiento de entrenamiento ni los datos utilizados en esta variante, por lo que la ficha se limita a lo que consta en los artefactos publicados. El modelo base es de Liquid AI y hereda su licencia LFM Open License v1.0, que no es una licencia de código abierto permisiva y restringe el uso comercial de derivados.

Por su tamaño compacto, el modelo es relevante para despliegues en hardware modesto, incluidos equipos de consumo, y para experimentación con modelos vision-lenguaje de segunda generación de la familia LFM. El autor publica además versiones cuantizadas en GGUF y MLX 4-bit, lo que amplía las opciones de despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (clase `Lfm3VlForConditionalGeneration`: codificador visual + proyector + modelo de lenguaje) |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); GGUF y MLX 4-bit en repositorios derivados |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (con limitación de uso comercial para derivados); documentación añadida bajo Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF y MLX disponibles en repositorios separados |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura vision-lenguaje de tipo transformer: un codificador visual procesa la imagen, un proyector mapea las representaciones visuales al espacio del modelo de lenguaje y un modelo de lenguaje autoregresivo genera la respuesta condicionada por la imagen y el texto de entrada. La configuración declara BF16 y requiere Transformers 5.21.0 o una versión compatible, además de cargarse con `trust_remote_code=True` por incluir código de modelo personalizado. El repositorio incluye el procesador de imagen y la plantilla de chat necesarios para el preprocesado.

No se documentan en los artefactos inspeccionados ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. La model card indica explícitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". El sufijo "heretic" sugiere una modificación orientada a reducir o eliminar las respuestas de rechazo del modelo base, pero el autor no describe el método concreto empleado (abliteration, fine-tuning con datos específicos u otro).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal.
- Conversación multi-turno con plantilla de chat incluida en el repositorio.
- Procesamiento de imágenes mediante el procesador y el codificador visual del modelo base.
- Capacidad de respuesta a peticiones que el modelo base alinearía como rechazables, según el propósito declarado de la variante "heretic".
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión, audio u otras capacidades especiales: solo visión; el resto no disponible.

## Casos de uso

- Descripción automática de imágenes en inglés: el modelo puede generar pies de foto y descripciones detalladas para catálogos, archivos fotográficos o accesibilidad web, usando el procesador de imagen incluido.
- Respuesta a preguntas visuales (VQA) en prototipos: útil para construir asistentes que respondan sobre el contenido de capturas, diagramas o documentos escaneados en fase de experimentación.
- Investigación sobre alineación y seguridad: la variante "heretic" permite estudiar el comportamiento de un modelo vision-lenguaje tras eliminar mecanismos de rechazo, comparándolo con el modelo base de Liquid AI.
- Evaluación de técnicas de abliteration: sirve como caso de estudio reproducible para medir el impacto de estas técnicas en un modelo multimodal de 2 B de parámetros.
- Despliegue local en hardware de consumo: con cuantizaciones GGUF o MLX 4-bit, puede ejecutarse en portátiles y estaciones con GPU modesta para pruebas de concepto multimodales.
- Generación de texto asistida por imagen en pipelines de investigación: integrable en scripts de Transformers para experimentos por lotes sobre conjuntos de imágenes, dado su tamaño reducido y su formato estándar.
- Extracción de información de imágenes en inglés: lectura de gráficos, tablas o formularios simples como paso previo a un pipeline de datos, siempre con validación humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación no están documentados en los artefactos inspeccionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4 GB solo para pesos (3,836 GB de safetensors), más overhead de activaciones y caché KV; se recomienda al menos 8 GB de VRAM para comodidad.
- Cuantización 4-bit (GGUF/MLX): aproximadamente 1-1,5 GB de pesos, apta para GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060/4060 o superiores para BF16; RTX 4090, A100 o H100 para mayor throughput y lotes grandes; Apple Silicon mediante la variante MLX 4-bit.
- Cabe en GPU de consumo: sí, especialmente en las versiones cuantizadas; en BF16 requiere GPUs con al menos 8 GB de VRAM.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), llama.cpp u Ollama mediante el repositorio GGUF, y MLX en macOS mediante el repositorio MLX 4-bit. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B Heretic (este) | ~1,92 B | no disponible | LFM Open License v1.0 | Hugging Face, GGUF, MLX | Fine-tune "heretic" del base |
| LiquidAI/LFM3-VL-2B | ~1,92 B (base) | no disponible | LFM Open License v1.0 | Hugging Face | Modelo original de Liquid AI, alineado |
| Alternativas de 2 B vision-lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- El autor no documenta datos de entrenamiento, procedimiento ni evaluación; la calidad real del fine-tune no está verificada.
- La variante "heretic" está diseñada para reducir los rechazos del modelo base, lo que aumenta el riesgo de generar contenido inapropiado, dañino o no conforme a políticas de seguridad; no es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de ~2 B de parámetros, especialmente en tareas de razonamiento complejo o lectura precisa de imágenes.
- Soporte limitado al inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- La LFM Open License v1.0 no es Apache 2.0 ni una licencia de código abierto permisiva: impone limitaciones de uso comercial sobre los derivados, incluida esta variante.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar dicho código antes de usarlo en producción.
- La longitud de contexto no está documentada; no debe asumirse una ventana larga para conversaciones o documentos extensos.
- El modelo se publicó en octubre de 2026 y se actualizó en noviembre de 2026, con solo 284 descargas y 2 likes; la comunidad de validación es muy reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Versión GGUF: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Versión MLX 4-bit: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Colección LFM vision-language: https://huggingface.co/collections/Lucasgitguy-co/lfm-vision-language-6aef2dcb0a92787c93414433
- Informe técnico (referenciado en la model card): docs/paper.md y docs/paper.pdf dentro del repositorio
- Guía de uso (referenciada en la model card): docs/USAGE.md dentro del repositorio
