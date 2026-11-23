# divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16

## Resumen

Muse-Glimmer-30B-Abliterated-MM-bf16 es una variante multimodal del modelo Muse-Glimmer-30B de Meta, convertida a formato MLX y sometida a un proceso de "abliteration" (ablación direccional de las direcciones de rechazo) por parte del usuario divinetribe. El objetivo es ofrecer un asistente visión-lenguaje sin el comportamiento de rechazo estándar, ejecutable íntegramente en hardware Apple Silicon. Con aproximadamente 29.780 millones de parámetros en bf16, el modelo conserva intacta la torre de visión, el adaptador y la proyección, de modo que mantiene la capacidad de comprensión de imágenes además de la generación de texto.

La arquitectura combina un transformer de lenguaje con una torre visual de estilo Qwen2.5-VL (ViT de 50 capas con 2D-RoPE, atención de ventana y completa, y fusión espacial 2×2), conectada mediante un adaptador GELU y una proyección al flujo de texto. El proceso de abliteración, basado en el método de Arditi et al., calcula una dirección de rechazo en la capa 26 mediante diferencia de medias sobre prompts dañinos e inofensivos, y la ortogonaliza fuera de `embed_tokens`, de todas las `self_attn.o_proj` y de las `mlp.down_proj`. Solo se modifican los pesos de lenguaje; la torre de visión queda sin tocar.

El modelo resulta relevante para investigadores y desarrolladores que necesitan un asistente multimodal sin restricciones de rechazo, ejecutado localmente en Macs de gran memoria, y que quieran integrarlo en flujos de trabajo agénticos locales como Claude Code Local. Su licencia es "other", heredada del modelo base, lo que exige revisar los términos originales antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión ViT de 50 capas estilo Qwen2.5-VL + adaptador GELU + proyección + modelo de lenguaje) |
| Parametros totales | 29.776.626.688 (~29,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos distribuidos en bf16); no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; revisar términos) |
| Formato de pesos | safetensors (MLX, librería mlx-vlm); 1.436 tensores |

## Arquitectura y entrenamiento

El modelo es una conversión MLX del checkpoint `mlx-community/Muse-Glimmer-30B-bf16`, que a su vez deriva del Muse-Glimmer-30B de Meta. La parte de lenguaje es un transformer denso de aproximadamente 29,78 mil millones de parámetros. La parte visual es una torre ViT de 50 capas con 2D-RoPE, atención de ventana y atención completa alternadas, y fusión espacial 2×2; su salida pasa por un adaptador GELU y una proyección que la inserta en el flujo de tokens de texto en la posición del token de imagen.

La innovación principal de esta variante es la abliteración: se calcula una dirección de rechazo mediante diferencia de medias entre prompts dañinos e inofensivos en la capa 26, y se elimina ortogonalizándola de `embed_tokens`, de todas las `self_attn.o_proj` y de las `mlp.down_proj`. La torre de visión no se modifica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La plantilla de chat termina el prompt de generación en `assistant to=user<|message|>` para que el modelo responda directamente sin emitir su propio canal de razonamiento.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en modo chat.
- Comprensión de imágenes: descripción, reconocimiento de objetos, identificación detallada (por ejemplo, modelo exacto de un vehículo a partir de la forma del alerón), reconocimiento de monumentos y lugares, OCR en escenas reales y lectura de gráficos.
- Respuesta multimodal integrada: el mismo conjunto de pesos describe imágenes y responde sin el comportamiento de rechazo estándar.
- Funcionamiento en modo solo texto (con `num_images=0` y sin argumento de imagen).
- Ejecución local en Apple Silicon mediante MLX y `mlx-vlm`.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso agéntico en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual local en Mac: un desarrollador puede cargar el modelo con `mlx-vlm` y consultar imágenes sin enviar datos a la nube, gracias a que los pesos bf16 caben en máquinas Apple Silicon de gran memoria (~60 GB).
- Reconocimiento detallado de productos y vehículos: el modelo identifica el modelo exacto de un coche a partir de la forma del alerón con la insignia difuminada, útil en catalogación de inventario o peritaje visual.
- OCR en escenas reales: lectura de rótulos y texto en fotografías (por ejemplo, "1501 BROADWAY" en un escaparate), aplicable a digitalización de documentos fotografiados o auditoría de cartelería.
- Lectura de gráficos y extracción de datos: interpretación de gráficos de barras para extraer valores concretos (por ejemplo, Q4 = 73 M), útil en análisis financiero asistido o generación de informes.
- Investigación sobre alineación y seguridad: la variante abliterada permite estudiar el comportamiento de un modelo sin rechazo y comparar con el base, en entornos controlados de investigación.
- Integración en flujos agénticos locales: el modelo forma parte de Claude Code Local, que ejecuta Claude Code íntegramente en el dispositivo mediante un servidor MLX nativo de la API de Anthropic, por lo que puede usarse como motor de un agente local en Apple Silicon.
- Prototipado de asistentes multimodales sin restricciones: para desarrolladores que necesitan un asistente de visión-lenguaje sin filtros de rechazo en su propio hardware y asumen la responsabilidad legal del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~60 GB en bf16 para los pesos completos (tamaño del repo 59,6 GB); se requiere una máquina Apple Silicon de gran memoria (por ejemplo, Mac Studio o MacBook Pro con 64 GB o más de memoria unificada).
- GPU recomendadas: no aplica GPU NVIDIA de forma nativa; el modelo está empaquetado para MLX y Apple Silicon. No se documentan requisitos para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no se indica compatibilidad con GPUs de consumo NVIDIA; en Apple Silicon requiere configuraciones de memoria unificada alta.
- Opciones de despliegue: `mlx-vlm` (librería oficial para cargar y generar), con soporte del modelo `muse_glimmer` añadido en el PR #1838. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MM-bf16 | ~29,78 B | no disponible | Imagen-texto a texto | other | Hugging Face (MLX) |
| mlx-community/Muse-Glimmer-30B-bf16 (base) | ~29,78 B (misma base) | no disponible | Imagen-texto a texto | no disponible | Hugging Face (MLX) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado el comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido dañino, sesgado o ilegal; el autor lo libera solo para investigación y para usuarios que asuman la responsabilidad.
- Licencia "other" heredada del modelo base: es imprescindible revisar los términos del modelo original de Meta antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles en descripciones de imágenes, OCR o lectura de gráficos; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones o documentos largos sin verificación empírica.
- Requisitos de hardware muy altos: ~60 GB en bf16 limitan su ejecución a Apple Silicon de gran memoria; no hay versiones cuantizadas documentadas.
- Formato específico MLX: no es directamente portable a ecosistemas CUDA sin conversión adicional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16
- Modelo base: https://huggingface.co/mlx-community/Muse-Glimmer-30B-bf16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte del modelo muse_glimmer: https://github.com/Blaizzy/mlx-vlm/pull/1838
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Demo en YouTube: https://www.youtube.com/watch?v=5fs_FfkCaDA
- Vídeo demo (archivo): https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo.mp4
- Póster del demo: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16/resolve/main/demo-poster.png
- GitHub Sponsors del autor: https://github.com/sponsors/nicedreamzapp
