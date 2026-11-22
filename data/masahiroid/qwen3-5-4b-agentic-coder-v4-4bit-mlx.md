# masahiroid/qwen3.5-4b-agentic-coder-v4-4bit-mlx

## Resumen

`qwen3.5-4b-agentic-coder-v4-4bit-mlx` es una conversión cuantizada a 4 bits en formato MLX del modelo `mahiatlinux/qwen3.5-4b-agentic-coder-v4`, un ajuste fino de Qwen3.5-4B orientado a tareas de programación y flujos de trabajo agénticos. La conversión la publica el usuario `masahiroid` como artefacto comunitario no oficial, pensado para ejecutar el modelo de forma eficiente en Macs con Apple Silicon (serie M) mediante el framework MLX.

El modelo resuelve el problema de desplegar un asistente de código de 4.205.751.296 parámetros en hardware de consumo: la cuantización a 4 bits con tamaño de grupo 64 reduce el peso del repositorio a aproximadamente 2,4 GB, lo que permite inferencia local en equipos con 16 GB o más de memoria unificada, o en GPUs de la clase de 8 GB. Está etiquetado para inglés y japonés y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en la combinación de tres factores: un tamaño compacto, una especialización declarada en generación de código y soporte agéntico, y un formato (MLX) alineado con el ecosistema de desarrollo en macOS. No obstante, el propio autor de la conversión lo posiciona como herramienta de asistencia ligera —autocompletado, generación de fragmentos y código repetitivo— y no como sustituto de modelos mayores en razonamiento multiarchivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de ~2,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B más allá de su naturaleza transformer decoder-only propia de la familia Qwen3.5. El artefacto publicado es una conversión de pesos, no un entrenamiento: se generó con `mlx_lm.convert --q-bits 4 --q-group-size 64`, aplicando cuantización de 4 bits con agrupación de 64 elementos sobre el ajuste fino original de `mahiatlinux`.

El ajuste fino de origen se describe como un fine-tune de Qwen3.5-4B especializado en cargas de trabajo de asistente de código y agentes. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y código: el modelo está ajustado para producir funciones, fragmentos y código repetitivo en lenguajes de programación habituales.
- Asistencia de autocompletado: orientado a completar líneas y bloques en entornos de edición locales.
- Flujos agénticos: la nomenclatura "agentic" del ajuste fino indica soporte previsto para tareas de asistente con pasos encadenados, aunque la model card no detalla mecanismos específicos de tool calling.
- Conversación: pipeline declarado como `text-generation` con etiqueta `conversational` y plantilla de chat incluida en el repositorio.
- Multilingüe limitado: inglés y japonés declarados; no se documenta soporte de castellano.
- Ejecución local en Apple Silicon mediante MLX, con API Python (`mlx_lm`) y CLI (`mlx_lm.generate`).

## Casos de uso

- Autocompletado en el editor: integrado mediante la API de `mlx_lm`, el modelo puede sugerir continuaciones de código en tiempo real dentro de un IDE en macOS, aprovechando su tamaño reducido para mantener la latencia baja en memoria unificada.
- Generación de funciones y snippets: útil para producir utilidades pequeñas y bien delimitadas, como la función de palíndromo del ejemplo de la model card, donde el alcance de una sola función encaja con la capacidad del modelo.
- Generación de código repetitivo: creación de esqueletos de clases, configuraciones, serializadores o adaptadores que siguen patrones predecibles y no requieren razonamiento arquitectónico.
- Asistencia en scripts de automatización: redacción de scripts de shell o Python para tareas de mantenimiento local, ejecutados y validados por el desarrollador en su propia máquina.
- Prototipado rápido sin conexión: escenarios con requisitos de privacidad o sin acceso a red, donde el modelo corre íntegramente en el portátil del desarrollador y ningún código sale del equipo.
- Pruebas de pipelines agénticos: uso como modelo de bajo coste para validar orquestaciones de agentes y plantillas de prompt antes de escalar a modelos mayores.
- Soporte a desarrolladores japoneses: al declarar japonés entre sus idiomas, puede emplearse en documentación técnica y comentarios de código en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,4 GB de pesos en cuantización de 4 bits; el consumo total en inferencia debe sumar la caché KV y el overhead del runtime, no cuantificado en la información disponible.
- Hardware objetivo declarado: GPU de la clase de 8 GB o Apple Silicon con 16 GB o más de memoria unificada.
- GPU compatibles: no se documentan modelos concretos de NVIDIA (A100, H100, RTX 4090); el formato MLX está orientado a Apple Silicon, por lo que el despliegue en GPU NVIDIA requeriría reconvertir los pesos a otro formato.
- GPU de consumo: cabe en equipos Apple con 16 GB de memoria unificada; en el ecosistema NVIDIA no hay confirmación de compatibilidad con este artefacto concreto.
- Opciones de despliegue: `mlx-lm` (CLI y API Python) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-agentic-coder-v4-4bit-mlx | 4,2 B | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face, formato MLX |
| mahiatlinux/qwen3.5-4b-agentic-coder-v4 | 4,2 B (estimado) | no disponible | pesos originales | no disponible en la informacion | Hugging Face, modelo base |
| Qwen3.5-4B (base) | 4 B (nominal) | no disponible | multiples | no disponible en la informacion | Hugging Face |

La comparación con alternativas de la misma categoría (otros asistentes de código de 3-7 B) no puede completarse con datos verificables en la información proporcionada: no se dispone de benchmarks ni de especificaciones de contexto de los modelos comparados.

## Limitaciones y advertencias

- Alcance limitado por diseño: el autor indica explícitamente que el modelo sirve para asistencia ligera y no para razonamiento multiarchivo ni diseño de arquitectura; para tareas complejas recomienda modelos mayores o servicios comerciales.
- Conversión no oficial: se trata de un artefacto comunitario de `masahiroid`, no de una release del autor del ajuste fino; la responsabilidad de validación recae en el usuario.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4 B; en código puede traducirse en APIs inexistentes o firmas de funciones incorrectas, por lo que toda salida debe revisarse y ejecutarse.
- Idiomas: solo inglés y japonés declarados; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar su uso en tareas que dependan de ventanas largas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar la licencia del modelo base y del ajuste fino de origen, no confirmada en la información proporcionada.
- Ecosistema: el formato MLX limita el despliegue a Apple Silicon salvo reconversión; no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Seguridad: el autor declara una auditoría con `model-audit-lite` (formato de pesos, plantilla de chat, código incluido y ML-BOM), cuyos detalles están en `SECURITY.md`; conviene revisarla antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/qwen3.5-4b-agentic-coder-v4-4bit-mlx
- Modelo base (ajuste fino original): https://huggingface.co/mahiatlinux/qwen3.5-4b-agentic-coder-v4
- README en japonés: https://huggingface.co/masahiroid/qwen3.5-4b-agentic-coder-v4-4bit-mlx/blob/main/README.ja.md
- Informe de seguridad: https://huggingface.co/masahiroid/qwen3.5-4b-agentic-coder-v4-4bit-mlx/blob/main/SECURITY.md
- MLX: https://github.com/ml-explore/mlx
- model-audit-lite: https://github.com/masahiroid/model-audit-lite
