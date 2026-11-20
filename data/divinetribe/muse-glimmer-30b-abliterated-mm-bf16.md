# divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16

## Resumen

Muse-Glimmer-30B-Abliterated-MM-bf16 es una variante multimodal del modelo Muse-Glimmer-30B de Meta, publicada por el usuario divinetribe en Hugging Face. Se trata de una conversión a formato MLX (bf16) del checkpoint original, sobre la que se ha aplicado una técnica de "abliteration": una ablación direccional (Arditi et al.) que elimina la dirección de rechazo de las capas del modelo de lenguaje para suprimir el comportamiento de negativa ante peticiones que el modelo base rechazaría. El resultado es un modelo "sin censura" que mantiene intacta la torre de visión.

El modelo conserva la arquitectura multimodal completa: un ViT de 50 capas al estilo Qwen2.5-VL (2D-RoPE, atención ventana/completa, fusión espacial 2×2) conectado mediante un adaptador GELU y una proyección al flujo de texto. Los pesos de visión no se han modificado durante la abliteración, por lo que la comprensión de imágenes sigue funcionando. El checkpoint ocupa unos 60 GB en bf16 y está pensado para ejecutarse en Apple Silicon mediante la librería mlx-vlm.

Su relevancia radica en ser, según el autor, el primer modelo multimodal abliterado que corre sobre MLX, lo que permite a usuarios de Mac con memoria unificada grande disponer de un asistente visual local sin restricciones de rechazo. No obstante, la información pública sobre el modelo base (datos de entrenamiento, benchmarks, idiomas) es muy limitada en la model card, y la licencia es "other", lo que exige revisar los términos del modelo original antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: ViT de 50 capas (estilo Qwen2.5-VL, 2D-RoPE, atencion ventana/completa, fusion espacial 2x2) + adaptador GELU + proyeccion al flujo de texto; LLM subyacente tipo transformer denso |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repo); el ecosistema MLX permite otras cuantizaciones, pero no se documentan en la model card |
| Idiomas soportados | No disponible |
| Licencia | other (se remite a la licencia del modelo base) |
| Formato de pesos | safetensors (1.436 tensores), conversion MLX; repo de 59,6 GB |

## Arquitectura y entrenamiento

El modelo es una conversión MLX del checkpoint `mlx-community/Muse-Glimmer-30B-bf16`, a su vez derivado de Meta Muse-Glimmer-30B. La parte de lenguaje es un transformer denso de aproximadamente 29,8 mil millones de parámetros. La parte visual es un ViT de 50 capas con atención bidimensional por RoPE, alternancia entre atención de ventana y atención completa, y fusión espacial 2×2 de parches; la salida del ViT pasa por un adaptador GELU y una proyección lineal que la inserta en el flujo de tokens de texto en la posición del token de imagen. La model card confirma que los 1.436 tensores incluyen torre de visión, adaptador y proyección intactos.

La modificación principal es la abliteración: se calculó una dirección de rechazo mediante diferencia de medias sobre prompts dañinos y benignos en la capa 26, y se ortogonalizó dicha dirección respecto a `embed_tokens` y a todas las matrices `self_attn.o_proj` y `mlp.down_proj` del modelo de lenguaje. La torre de visión no se tocó. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, fases de RLHF/DPO) ni detalles sobre el proceso de alineación previo a la abliteración; tampoco se especifica la plantilla de chat completa más allá de una nota sobre el cierre del prompt de generación en `assistant to=user<|message|>` para evitar que el modelo emita un canal de razonamiento propio.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes: descripción, reconocimiento de objetos, identificación de modelos concretos (el autor cita reconocer un Jaguar F-Type por la forma del alerón con la insignia difuminada), localización de lugares (Taj Mahal en Agra) y lectura de texto en escenas reales (OCR in-the-wild, p. ej. "1501 BROADWAY" en un escaparate).
- Lectura de gráficos: extracción de valores de gráficos de barras (el autor cita Q4 = 73 M$).
- Uso como asistente sin comportamiento de rechazo (abliterado) para investigación y uso local.
- Integración en pipelines de agentes locales mediante el proyecto Claude Code Local, que expone una API compatible con Anthropic sobre MLX.
- Capacidad de tool calling / function calling: no documentada en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo de razonamiento explícito: la plantilla de chat lo desactiva deliberadamente al cerrar el prompt en `assistant to=user<|message|>`; no se documenta un modo "thinking" activable.

## Casos de uso

- Asistencia visual local en Apple Silicon: un usuario con un Mac de memoria unificada grande puede cargar el modelo con mlx-vlm y consultar imágenes sin enviar datos a la nube, lo que resulta adecuado para material sensible o confidencial.
- OCR y digitalización de documentos fotografiados: el modelo lee texto en escenas reales (rótulos, escaparates, carteles), útil para extraer información de fotografías sin pipeline OCR dedicado.
- Análisis de gráficos y capturas de dashboards: extracción de valores concretos de gráficos de barras o líneas, útil para automatizar la lectura de informes visuales.
- Identificación visual fina: reconocimiento de modelos de vehículos, monumentos o productos a partir de detalles parciales, aplicable a catalogación de inventario o verificación de activos.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado con la torre de visión intacta, sirve para estudiar cómo afecta la supresión de la dirección de rechazo al comportamiento multimodal en entornos controlados.
- Agente local con entrada visual: integrado en Claude Code Local, puede emplearse como componente de un agente que inspecciona capturas de pantalla o imágenes dentro de un flujo de trabajo en el propio dispositivo.
- Prototipado de asistentes sin restricciones de rechazo: para equipos que necesitan evaluar respuestas del modelo ante peticiones que el base rechazaría, siempre dentro del marco legal aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint en bf16 ocupa aproximadamente 59,6 GB, por lo que se necesita un equipo con al menos ~60 GB de memoria unificada disponible para cargarlo completo; con cuantizaciones adicionales (no publicadas en este repo) el requisito bajaría, pero no se documentan.
- GPU recomendadas: el modelo está empaquetado para MLX, es decir, Apple Silicon (M-series con memoria unificada grande, como M2 Ultra o M3/M4 Max/Ultra con 64 GB o más). No se distribuye en formato para CUDA.
- ¿Cabe en GPU de consumo? En el formato bf16 publicado, no en GPUs de consumo típicas (24 GB o menos). En Apple Silicon de gama alta con 64 GB o más, sí.
- Opciones de despliegue: mlx-vlm (soporte nativo del modelo `muse_glimmer`, añadido en el PR #1838 de mlx-vlm); servidor compatible con la API de Anthropic del proyecto Claude Code Local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. A modo orientativo, los modelos comparables serían otras variantes multimodales de ~30 B en formato MLX (por ejemplo, conversiones de Qwen2.5-VL de tamaño similar) y otras variantes abliteradas del mismo modelo base; sin embargo, no se aportan cifras de rendimiento, contexto ni licencia de esas alternativas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Abliterated-MM-bf16 | ~29,8 B | no disponible | other | safetensors (MLX) | Multimodal abliterado, vision intacta |
| mlx-community/Muse-Glimmer-30B-bf16 | ~29,8 B (presumiblemente) | no disponible | no disponible | safetensors (MLX) | Modelo base sin abliterar |
| Alternativas multimodales ~30 B en MLX | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo del modelo de lenguaje; esto suprime el comportamiento de negativa y puede producir respuestas ante peticiones que el modelo base rechazaría. El usuario es responsable del uso y del cumplimiento legal.
- La torre de visión no se ha modificado, por lo que el comportamiento de rechazo ante contenido visual puede diferir del comportamiento textual; no se documenta cómo interactúan ambas modalidades tras la abliteración.
- Riesgo de alucinación: no se aportan evaluaciones de fidelidad; en tareas de OCR e identificación visual fina el modelo puede confundir detalles, y no hay benchmarks publicados que cuantifiquen la tasa de error.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base sin ficha detallada, se desconocen los sesgos de entrenamiento.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto: no disponible; no se puede planificar su uso en contextos largos sin verificación empírica.
- Licencia "other": es imprescindible revisar la licencia del modelo base (Meta Muse-Glimmer-30B) antes de cualquier uso comercial; la model card no aclara los términos.
- Requisito de hardware muy alto en bf16 (~60 GB) y dependencia exclusiva del ecosistema MLX/Apple Silicon; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.
- La plantilla de chat desactiva el canal de razonamiento; si se necesita razonamiento explícito, habría que modificarla, lo que puede degradar la calidad de las respuestas.
- Modelo publicado por un usuario individual (divinetribe), no por el desarrollador original; la procedencia y reproducibilidad de la abliteración no están auditadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Muse-Glimmer-30B-Abliterated-MM-bf16
- Modelo base (conversión MLX): https://huggingface.co/mlx-community/Muse-Glimmer-30B-bf16
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- PR de soporte del modelo en mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/1838
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Demo en YouTube: https://www.youtube.com/watch?v=5fs_FfkCaDA
