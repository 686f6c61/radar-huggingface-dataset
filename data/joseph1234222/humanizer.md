# Joseph1234222/humanizer

## Resumen

Humanizer es un modelo de 12B parámetros, un fine-tune de google/gemma-4-12B desarrollado por el usuario Joseph1234222 (con repositorios asociados de la familia sgaofen/jialinyyzz). Su propósito es muy específico: reescribir borradores generados por IA (correos electrónicos, ensayos, informes, entradas de foro) en inglés y chino para que parezcan escritos por una persona. El modelo se entrena para preservar fielmente todos los números, unidades, fechas, nombres y citas del texto original, sin añadir contenido nuevo, lo que lo diferencia de un reescritor genérico.

Su relevancia actual radica en la creciente extensión de detectores de IA y la demanda de herramientas de edición de estilo localizadas y privadas. El modelo funciona completamente offline y está optimizado para ejecutarse en hardware de consumo: el repositorio incluye cuantizaciones propias (2-bit, Q3, Q4_K_M) entrenadas con quantization-aware training y destilación desde el modelo bf16, logrando un 87% de acuerdo top-1 con el modelo completo en un archivo de solo 3,9 GB. Según los datos del autor, un 95% de las reescrituras en inglés fueron calificadas como humanas por Originality.ai en su configuración más estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer, image-text-to-text) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica si es MoE; aparentemente denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit, Q3, Q4_K_M, Q6_K, Q8_0 (GGUF), bf16 (safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B, etiquetado como `gemma4_unified` e `image-text-to-text`, lo que sugiere una arquitectura transformer multimodal unificada capaz de procesar texto e imágenes, aunque la funcionalidad documentada se centra exclusivamente en reescritura de texto. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset de fine-tuning.

La innovación técnica más destacable está en la cuantización. Los archivos de 2-bit, Q3 y Q4_K_M no son cuantizaciones estándar de llama.cpp: se midió cuánto daña cada tensor de pesos al comprimirse, asignando más bits a los tensores sensibles y menos a los robustos. Posteriormente se aplicó quantization-aware training capa por capa para reproducir el modelo completo, además de destilación desde el modelo bf16 como teacher, usando datos de reescritura en inglés y chino. Este proceso elevó el acuerdo top-1 con bf16 del 70% (cuantización estándar del mismo tamaño) al 87% en el archivo de 2-bit. Los archivos Q6_K y Q8_0 son construcciones estándar.

## Capacidades

- Reescritura de texto con estilo humano: transforma borradores generados por IA en prosa con apariencia natural, en inglés y chino.
- Preservación factual: está entrenado para mantener intactos números, unidades, fechas, nombres y citas, y para no añadir información nueva.
- Reescritura por géneros: correos electrónicos, ensayos, informes y publicaciones de foro (incluyendo respuestas estilo Zhihu).
- Procesamiento de documentos largos: la CLI conserva encabezados, código, tablas y enlaces, reescribiendo la prosa por fragmentos.
- Multimodalidad potencial: al ser un fine-tune de un modelo image-text-to-text, la arquitectura base soporta imágenes, aunque el fine-tuning documentado es de texto.
- Generación de múltiples muestras: puede generar varias reescrituras alternativas del mismo borrador (los ejemplos de evaluación usan 8 muestras por documento).
- Marcado de hechos protegidos: la aplicación oficial permite marcar pasajes con "Create fact" para que se copien literalmente.

## Casos de uso

- Humanización de correos electrónicos profesionales: un usuario pega un borrador de correo generado por ChatGPT u otro asistente y el modelo lo reescribe para que el tono sea natural antes de enviarlo, preservando fechas, cifras y nombres de clientes.
- Edición de ensayos académicos y artículos: reescritura de textos largos en Markdown o .docx mediante la CLI (`hz paper.md -o paper.out.md`), manteniendo la estructura de secciones, tablas y referencias.
- Publicaciones en foros y comunidades: adaptación de respuestas técnicas o de opinión (estilo Reddit, Zhihu) para que no resulten artificiales, útil para community managers y creadores de contenido.
- Localización de estilo entre inglés y chino: reescritura de borradores en ambos idiomas con resultados evaluados específicamente por lengua, útil para equipos de contenido bilingües.
- Privacidad en entornos sensibles: al ejecutarse 100% offline en local (app de escritorio o llama.cpp), es adecuado para textos empresariales o personales que no deben enviarse a APIs de terceros.
- Integración en pipelines de agentes de código: el archivo AGENTS.md proporciona instrucciones exactas (archivos, comando de servidor, prompt) para que un agente de programación incorpore la reescritura como paso de post-procesado en flujos de generación de documentación.
- Despliegue en hardware modesto: la cuantización de 2-bit (3,9 GB, 87% de acuerdo con bf16) permite usar el modelo en máquinas con 8 GB de memoria.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor (conjunto de evaluación reservado, pesos bf16 salvo indicación, fecha 2026-10-02):

| Metrica | Resultado |
|---|---|
| Reescrituras en inglés calificadas como humanas (Originality.ai, ajuste más estricto) | 95% (11 de 210 marcadas como IA; 26 en la versión anterior) |
| Reescrituras en inglés sin problemas factuales (juez LLM estricto, Q8_0) | 376 de 420 (89,5%; 369 en la versión anterior) |
| Naturaleza de los errores factuales detectados | más del 90% afectan a una sola palabra o frase (125 de 135 problemas) |
| Acuerdo top-1 con bf16, archivo 2-bit propio | 87% (frente a 70% de la cuantización estándar equivalente) |
| Acuerdo top-1 con bf16, Q3 propio | 85% |
| Acuerdo top-1 con bf16, Q4_K_M propio | 81% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo está especializado y las métricas anteriores son específicas de la tarea de reescritura.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: la cuantización de 2-bit ocupa 3,9 GB y funciona en máquinas con 8 GB de memoria; Q8_0 y Q6_K requieren aproximadamente 12-14 GB; no disponible la cifra exacta por archivo.
- GPU recomendadas: no disponible. El modelo está orientado a ejecución local vía CPU/Metal (Apple silicon) y GPU de consumo; una GPU con 12-16 GB de VRAM (RTX 3060/4070 o superior) debería ejecutar cómodamente Q4_K_M.
- Consumer GPUs: sí, cabe en GPUs de consumo con cuantizaciones medias y bajas; la app oficial recomienda uno de cinco tamaños según la memoria disponible (desde 8 GB).
- Opciones de despliegue: aplicación de escritorio oficial (macOS Apple silicon, Windows), llama.cpp / llama-server, CLI propia (`pipx install git+https://github.com/sgaofen/humanizer-local-model`, comando `hz`), y cualquier runtime compatible con GGUF; también pesos safetensors para transformers.
- Latencia y throughput: no disponible.
- Contexto para documentos largos: la CLI procesa documentos largos fragmento a fragmento, lo que mitiga límites de ventana de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| humanizer (este modelo) | 12B | Reescritura humanizante en/zh, preservación factual | Apache 2.0 | GGUF + safetensors, app offline, CLI |
| google/gemma-4-12B (base) | 12B | Modelo general multimodal | Licencia Gemma | safetensors, GGUF comunitarios |
| Modelos genéricos de paraphrase (p. ej. fine-tunes de T5/BART) | 0,2-3B | Parafraseo corto, sin preservación factual garantizada | Variable | HuggingFace |

No se conocen alternativas abiertas de 12B especializadas exactamente en humanización con evaluación contra detectores de IA publicada; la comparativa más directa es con su modelo base, del que se diferencia por el fine-tuning específico y las cuantizaciones optimizadas.

## Limitaciones y advertencias

- Tasa de error factual no nula: 44 de 420 reescrituras en inglés (10,5%) presentaron algún problema factual detectado por el juez estricto; el propio autor recomienda leer el resultado antes de enviarlo, especialmente números, fechas y nombres.
- Sesgo de selección en los ejemplos: los "before and after" publicados son las mejores de 8 muestras generadas, no salidas representativas medias.
- Idiomas limitados: solo inglés y chino; el rendimiento en otros idiomas no está evaluado ni garantizado.
- Longitud de contexto: no disponible; para documentos muy largos se depende de la fragmentación de la CLI.
- La métrica principal (Originality.ai) es un detector comercial concreto; el comportamiento frente a otros detectores no está documentado.
- Multimodalidad sin documentar: la arquitectura base es image-text-to-text, pero no hay evidencia de que el fine-tuning conserve capacidades de visión.
- Uso comercial: la licencia Apache 2.0 es permisiva; no obstante, el modelo base (Gemma) tiene su propia licencia, cuyos términos conviene revisar para derivados.
- Riesgo de uso indebido: el propósito explícito del modelo es evadir detectores de IA, lo que puede infringir políticas académicas, editoriales o laborales según el contexto de uso.

## Enlaces

- HuggingFace: https://huggingface.co/Joseph1234222/humanizer
- Archivos GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- GitHub: https://github.com/sgaofen/humanizer-local-model
- Guía de instalación: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Documentación de cuantización: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Uso sin la app: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Instrucciones para agentes: https://huggingface.co/Joseph1234222/humanizer/blob/main/AGENTS.md
- Ejemplos de evaluación (8 muestras): https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- App macOS (Apple silicon): https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- App Windows: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
- Modelo base: https://huggingface.co/google/gemma-4-12B
