# divinetribe/AesCode-8B-MLX-bf16

## Resumen

AesCode-8B es un modelo multimodal de tipo imagen-texto-a-texto especializado en la generación de artefactos visuales (presentaciones, paneles, informes, carteles) como HTML/CSS estructurado, editable y verificable. Lo desarrolla Microsoft a partir de Qwen3-VL-8B-Instruct y se distribuye bajo licencia Apache-2.0. El repositorio que nos ocupa, `divinetribe/AesCode-8B-MLX-bf16`, es una conversión a formato MLX en precisión bf16 realizada por un tercero (divinetribe), que conserva intacta la torre de visión para su ejecución nativa en Apple Silicon mediante la librería `mlx-vlm`.

El modelo resuelve un problema concreto: convertir una captura de pantalla, un boceto o una referencia visual en código HTML/CSS fiel y semánticamente correcto, separando los requisitos semánticos de las señales visuales mediante supervisión estructurada en grafo y recompensas desacopladas entre modalidades. Arquitectónicamente es un transformer denso de 8.767.123.696 parámetros (8,8B), con torre de visión `qwen3_vl` y decodificador de texto `qwen3_vl_text`, empaquetado como `Qwen3VLForConditionalGeneration`.

Su relevancia actual radica en que ofrece una alternativa local y de pesos abiertos a modelos propietarios en la tarea de generación de código estético, con resultados reportados en el paper del autor que superan a GPT-5.5 y Claude Opus 4.8 en su propia evaluación. La versión MLX bf16 está pensada para equipos Apple con memoria suficiente, y el autor publica variantes de 8 y 4 bits para máquinas más modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (torre de visión `qwen3_vl` + decodificador de texto `qwen3_vl_text`), transformer denso multimodal |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repo); existen variantes 8-bit y 4-bit en repos separados del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, bf16, 750 tensores, 4 shards, 17,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct de Alibaba y emplea la arquitectura `Qwen3VLForConditionalGeneration`: una torre de visión `qwen3_vl` que procesa imágenes y las proyecta al espacio del decodificador de texto `qwen3_vl_text`. El checkpoint original fue entrenado por Microsoft con un proceso de *cold-start SFT* (ajuste supervisado de arranque) seguido de GDPO (una variante de optimización de política con recompensas) sobre siete canales de recompensa. La innovación destacable es la separación de requisitos semánticos y señales visuales mediante supervisión estructurada en grafo y recompensas desacopladas entre modalidades (decoupled cross-modal rewards), lo que permite optimizar por separado la corrección del contenido y la fidelidad estética del resultado.

El repositorio `divinetribe/AesCode-8B-MLX-bf16` no introduce entrenamiento adicional: es únicamente una conversión de pesos a bf16 en formato MLX, conservando la torre de visión intacta. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO más allá de lo indicado en el paper del autor.

## Capacidades

- Generación de código HTML/CSS a partir de una imagen, captura de pantalla o referencia visual.
- Generación de texto e imágenes-texto (pipeline `image-text-to-text`).
- Comprensión visual: lectura de capturas, diseños, superposiciones translúcidas y verificación de contenido visual (por ejemplo, control de calidad de poses).
- Generación de texto alternativo (alt-text) para imágenes.
- Generación de artefactos visuales estructurados: presentaciones, paneles, informes, carteles.
- Razonamiento multimodal y respuesta conversacional.
- Modo texto puro (sin imagen) mediante `num_images=0`.
- Entrenamiento con recompensas que separan contenido semántico y estilo visual, orientado a la corrección verificable del resultado.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Reconstrucción de interfaces a partir de capturas: el modelo recibe una captura de pantalla de una aplicación o web y devuelve un único archivo HTML con el CSS embebido, lo que permite prototipar interfaces en minutos sobre Apple Silicon.
- Generación de paneles y dashboards: a partir de un boceto o referencia visual, produce HTML/CSS editable con estructura de datos y estilo, adecuado para equipos de diseño que necesitan artefactos verificables.
- Creación de presentaciones e infografías: dado un conjunto de requisitos semánticos y una referencia visual, genera diapositivas o infografías como HTML estructurado, lo que facilita su edición posterior y su versionado en Git.
- Generación de alt-text accesible: el modelo lee una imagen y redacta descripciones textuales, útil en pipelines de accesibilidad web para poblar atributos `alt` de forma automática.
- Control de calidad visual: verificación de que una superposición o avatar generado corresponde a una pose humana plausible, sin miembros extra ni articulaciones invertidas, como muestra el ejemplo del autor.
- Prototipado rápido de landing pages: el modelo traduce una referencia de diseño a HTML/CSS listo para revisión, integrable en flujos de desarrollo front-end.
- Conversión de diseños a código en local: al ejecutarse con `mlx-vlm` en Apple Silicon, permite procesar material de diseño sensible sin enviarlo a servicios en la nube.
- Asistente de documentación técnica: combinando texto e imagen, puede describir diagramas y generar fragmentos de documentación con marcado HTML.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del paper de AesCode (300 prompts de infografía, pista programática `Rule` con Text, Bound y Chart, y checklist `Visual` con Content, Layout y Style; `Overall` es la media de ambas, promediada sobre tres generaciones sin selección).

| Benchmark | AesCode-8B | GPT-5.5 (referencia condicionada) | Claude Opus 4.8 (referencia condicionada) |
|---|---|---|---|
| Overall | 82,94 | 81,28 | 80,39 |
| Rule | 90,07 | no disponible | no disponible |
| Visual (mejora sobre Qwen3-VL-8B) | +31,1 puntos | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia en bf16: aproximadamente 17,5 GB solo de pesos, más overhead de activaciones y del procesador de imágenes; se recomienda un mínimo de 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No está pensado para GPU NVIDIA en este formato.
- Cabe en GPU de consumo: sí, en equipos Apple con 24 GB o más de memoria unificada; para máquinas de 16 GB existe la variante 8-bit y para 8 GB la variante 4-bit del mismo autor.
- Opciones de despliegue: `mlx-vlm` (librería nativa para Apple Silicon). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AesCode-8B (este repo, MLX bf16) | 8,8B | no disponible | Apache-2.0 | HuggingFace, formato MLX | Especializado en HTML/CSS desde imagen; Overall 82,94 en evaluación propia |
| Qwen3-VL-8B-Instruct | 8B | no disponible | no disponible en la información | HuggingFace | Modelo base; AesCode lo supera en +31,1 puntos Visual según el paper |
| GPT-5.5 (referencia condicionada) | no disponible | no disponible | propietaria | API | Overall 81,28 en la misma tabla del paper |
| Claude Opus 4.8 (referencia condicionada) | no disponible | no disponible | propietaria | API | Overall 80,39 en la misma tabla del paper |

## Limitaciones y advertencias

- El modelo está entrenado específicamente para generación de código estético (HTML/CSS) y artefactos visuales; su rendimiento en tareas generales de texto puede ser inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación en la lectura de imágenes y en la generación de código: puede producir HTML/CSS que no reproduzca fielmente la referencia visual, como ilustra el propio autor en su ejemplo de control de calidad, donde sitúa las manos en la cintura en lugar de en guardia alta.
- No se dispone de información sobre sesgos conocidos, composición del dataset ni cobertura idiomática, lo que dificulta evaluar su comportamiento en dominios o idiomas distintos del inglés.
- El repositorio es una conversión de terceros: la calidad del modelo es la del checkpoint original de Microsoft, y cualquier problema de conversión (tensores, shards) es responsabilidad del autor de la conversión.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint base de Microsoft y de Qwen3-VL-8B-Instruct.
- Requiere Apple Silicon y `mlx-vlm`; no es desplegable directamente en infraestructura NVIDIA sin reconversión.
- El contexto máximo no está documentado en la información disponible, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar su rendimiento general con otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/AesCode-8B
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper (arXiv:2610.18860): https://arxiv.org/abs/2610.18860
- Página del proyecto: https://microsoft.github.io/AesCode/
- Código: https://github.com/microsoft/AesCode
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Agent-12 local agent leaderboard: https://nicedreamzapp.github.io/agent12/
