# Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit

## Resumen

LFM3-VL 2B Heretic MLX 4-bit es una cuantización de 4 bits en formato MLX del checkpoint LFM3-VL-2B Heretic, un modelo vision-language de aproximadamente 1.918 millones de parámetros (1,92 B). El modelo base deriva del LFM3-VL-2B de LiquidAI, adaptado por el publicador Lucasgitguy-co con una variante "heretic" (habitualmente asociada a la reducción de comportamientos de rechazo o censura en modelos alineados) y exportado específicamente para su ejecución en Apple Silicon mediante la librería MLX y MLX-VLM. Resuelve la necesidad de ejecutar un modelo multimodal imagen-texto de tamaño reducido en hardware de Apple con un consumo de memoria contenido: el repositorio ocupa 1,4 GB y el fichero de pesos 1,352 GB.

La relevancia actual del modelo reside en su combinación de tres factores: es multimodal (acepta imagen y texto como entrada y genera texto), es lo bastante pequeño para caber en memoria unificada de equipos Mac modernos, y está cuantizado a 4 bits con cuantización afín de grupo 64, lo que reduce el peso en memoria frente al checkpoint original. Ahora bien, la model card es explícita al señalar que no documenta datos de entrenamiento, procedimiento de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe realizarse por cuenta propia.

Se trata, por tanto, de un artefacto de despliegue más que de un modelo con documentación técnica completa: la información disponible describe ficheros, configuración de cuantización y compatibilidad de carga, pero no las capacidades medidas del modelo. La licencia es la LFM Open License v1.0, que impone limitaciones al uso comercial de derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (vision-language transformer; detalles de arquitectura no disponibles) |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín (affine), group size 64 |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (MLX), fichero model.safetensors de 1,352 GB |
| Libreria | mlx (MLX-VLM) |
| Pipeline | image-text-to-text |
| Tamano del repo | 1,4 GB |
| Modelo base | Lucasgitguy-co/lfm3-vl-2b-heretic (a su vez derivado de LiquidAI/LFM3-VL-2B) |
| Descargas | 449 |
| Fecha de creacion | 2026-10-30 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-VL-2B más allá de su naturaleza vision-language y su pipeline image-text-to-text. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención, el codificador visual ni el esquema de fusión multimodal. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineación. La model card indica explícitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts".

La innovación técnica documentada en este repositorio es la cuantización: se aplica cuantización afín de 4 bits con tamaño de grupo 64 sobre el checkpoint Heretic, y se empaqueta en formato MLX para su carga con MLX-VLM en Apple Silicon. El repositorio incluye además un informe técnico referenciado en la model card (docs/paper.md, docs/paper.pdf, docs/citation.bib) y una guía de uso para Windows, Linux y macOS, aunque el contenido de esos documentos no forma parte de la información proporcionada. Existe también una variante GGUF del mismo modelo base para otros entornos de inferencia.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline image-text-to-text permite responder preguntas sobre el contenido de una imagen.
- Conversación multi-turno: la etiqueta "conversational" indica soporte de diálogo.
- Procesamiento de imágenes: entrada multimodal imagen + texto.
- Ejecución local en Apple Silicon mediante MLX y MLX-VLM.
- Capacidades de razonamiento, código, matemáticas o tool calling: no documentadas en la información disponible.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión avanzada, audio: no documentados (solo se confirma visión como modalidad de entrada).

## Casos de uso

- Asistente de descripción de imágenes en local: el modelo puede recibir una imagen y generar una descripción textual, ejecutándose íntegramente en un Mac sin conexión a servicios externos gracias al formato MLX y a su tamaño de 1,4 GB.
- Preguntas y respuestas sobre capturas o documentos escaneados: dado su pipeline image-text-to-text, puede emplearse para extraer información de imágenes de texto en flujos de trabajo personales o de prototipado.
- Prototipado rápido de aplicaciones multimodales en macOS: sirve como modelo de referencia para validar pipelines de MLX-VLM antes de escalar a modelos mayores.
- Experimentación en investigación sobre variantes "heretic": permite estudiar el comportamiento de un checkpoint con reducción de rechazos en un entorno de recursos limitados.
- Análisis de imágenes en entornos con requisitos de privacidad: al ejecutarse localmente en hardware Apple, los datos de imagen no salen del dispositivo.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el checkpoint original y esta versión de 4 bits en tareas de visión-lenguaje.
- Integración en herramientas de accesibilidad: generación de descripciones de imágenes para usuarios con discapacidad visual en aplicaciones de escritorio para macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación no están documentados en los artefactos inspeccionados y que los ejemplos de carga son orientativos, no una afirmación de calidad medida.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero de pesos ocupa 1,352 GB; con overhead de carga, contexto y buffers de activación se recomienda disponer de al menos 3-4 GB de memoria unificada libre, aunque la cifra exacta no está documentada.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con MLX y MLX-VLM.
- GPU NVIDIA (A100, H100, RTX 4090): no es el formato objetivo; para CUDA existe la variante GGUF del mismo modelo base.
- Cabe en GPU de consumo Apple: sí, en equipos con 8 GB o más de memoria unificada, dado el tamaño del checkpoint.
- Opciones de despliegue: MLX-VLM (requiere una versión con soporte para LFM3-VL); la variante GGUF permite llama.cpp u otros cargadores GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL 2B Heretic MLX 4-bit (este) | ~1,92 B | no disponible | MLX safetensors 4-bit | LFM Open License v1.0 | Hugging Face |
| LFM3-VL 2B Heretic (original) | ~1,92 B | no disponible | safetensors | LFM Open License v1.0 | Hugging Face |
| LFM3-VL 2B Heretic GGUF | ~1,92 B | no disponible | GGUF | LFM Open License v1.0 | Hugging Face |
| LiquidAI LFM3-VL-2B (upstream) | ~2 B | no disponible | safetensors | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con modelos de otras familias (por ejemplo, otros VLM de ~2 B) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, procedimiento ni benchmarks; no hay evidencia publicada de calidad del modelo.
- La variante "heretic" implica presumiblemente una reducción de comportamientos de rechazo, lo que puede aumentar el riesgo de generar contenido inapropiado o no filtrado; no hay documentación que lo confirme ni que lo cuantifique.
- Riesgo de alucinación inherente a modelos de ~2 B, especialmente en tareas de razonamiento complejo o lectura precisa de imágenes; no cuantificado.
- Idioma limitado al inglés según la etiqueta del repositorio.
- Longitud de contexto no disponible; no debe asumirse una ventana amplia.
- Licencia LFM Open License v1.0: impone limitaciones al uso comercial de derivados; este release no es Apache-2.0. Revisar los términos antes de cualquier despliegue en producción.
- Formato MLX exclusivo para Apple Silicon; requiere MLX-VLM con soporte LFM3-VL, lo que limita la portabilidad.
- La cuantización a 4 bits puede degradar la precisión respecto al checkpoint original; no se han publicado mediciones de esa degradación.
- Modelo con pocas descargas (449) y sin likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Modelo base (Heretic): https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Modelo upstream de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Colección LFM vision-language: https://huggingface.co/collections/Lucasgitguy-co/lfm-vision-language-6aef2dcb0a92787c93414433
- Informe técnico (referenciado en la model card): docs/paper.md y docs/paper.pdf dentro del repositorio
- Guía de uso: docs/USAGE.md dentro del repositorio
- Estructura de ficheros: docs/FILE_STRUCTURE.md dentro del repositorio
- Procedencia y reproducibilidad: docs/PROVENANCE.md dentro del repositorio
