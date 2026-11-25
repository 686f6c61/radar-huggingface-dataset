# divinetribe/AesCode-8B-MLX-bf16

## Resumen

AesCode-8B es un modelo multimodal de generacion de codigo desarrollado por Microsoft, disenado especificamente para convertir imagenes (disenos, capturas de pantalla, bocetos) en artefactos visuales estructurados y editables en HTML/CSS: presentaciones, posters, dashboards e infografias. Parte de Qwen3-VL-8B-Instruct como base y se entrena con SFT de arranque en frio seguido de GDPO (una variante de optimizacion por preferencias) sobre siete canales de recompensa, separando requisitos semanticos de senales visuales mediante supervision estructurada en grafo y recompensas desacopladas entre modalidades.

La ficha que nos ocupa, `divinetribe/AesCode-8B-MLX-bf16`, no es el modelo original sino una conversion a formato MLX en precision bf16 completa (sin cuantizacion) realizada por el usuario divinetribe, con la torre de vision intacta, para ejecutar el modelo de forma nativa en Apple Silicon mediante la libreria `mlx-vlm`. El repositorio contiene 750 tensores en cuatro shards, con un total de 17,5 GB y 8.767.123.696 parametros reales segun los safetensors.

Su relevancia actual radica en que permite ejecutar localmente en un Mac un modelo especializado en generacion de codigo visual de alta calidad, sin depender de APIs externas, y con la torre de vision preservada para tareas de image-to-code. El autor ofrece tambien versiones cuantizadas a 8 bits y 4 bits para equipos con menos memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (torre de vision `qwen3_vl` + decodificador de texto `qwen3_vl_text`) |
| Parametros totales | 8.767.123.696 (8,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 sin cuantizar en este repo; existen variantes 8-bit y 4-bit publicadas por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, bf16), 4 shards, 750 tensores, 17,5 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL: una torre de vision que procesa imagenes y las proyecta al espacio del decodificador de texto, que es un transformer autoregresivo. El checkpoint original de Microsoft parte de Qwen3-VL-8B-Instruct y se entrena en dos fases: primero un SFT de arranque en frio y despues GDPO (Grouped Direct Preference Optimization o variante equivalente segun el paper) sobre siete canales de recompensa independientes. La innovacion principal descrita es la separacion de recompensas semanticas y visuales ("decoupled cross-modal rewards") junto con supervision estructurada en grafo, lo que permite optimizar por separado el cumplimiento de requisitos textuales y la calidad estetica del resultado visual.

La conversion de este repositorio es unicamente a formato MLX bf16, sin cambios en los pesos ni en la arquitectura. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles completos del proceso de RLHF/DPO mas alla de lo indicado en la model card y el paper referenciado.

## Capacidades

- Generacion de codigo HTML/CSS a partir de imagenes: reconstruye capturas de pantalla, disenos o bocetos como un unico archivo HTML editable.
- Generacion de artefactos visuales ricos en informacion: slides, posters, dashboards, informes e infografias en formato estructurado y verificable.
- Comprension visual multimodal: lectura de capturas, disenos, frames de video y escenas con overlay (el ejemplo de control de calidad de pose en la model card lo demuestra).
- Generacion de texto a partir de imagen (alt-text, descripciones).
- Modo solo texto: funciona sin imagen pasando `num_images=0`.
- Conversacional multi-turno (tag `conversational`).
- Entrenamiento con reinforcement learning orientado a calidad estetica y cumplimiento de reglas programaticas (Text, Bound, Chart).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Reconstruccion de interfaces a partir de capturas: un disenador o desarrollador sube una screenshot de una UI y el modelo devuelve un unico archivo HTML/CSS que reproduce el layout, util para prototipado rapido y migracion de disenos a codigo.
- Generacion automatica de dashboards e informes: a partir de una imagen de referencia o un boceto, el modelo produce HTML estructurado con tablas, graficos y secciones, adecuado para herramientas internas de business intelligence.
- Creacion de presentaciones y posters: el modelo genera slides o posters como HTML editable, lo que facilita su posterior modificacion y exportacion sin depender de software de diseno.
- Control de calidad visual automatizado: el ejemplo de la model card (verificar si una pose dibujada sobre una camara es anatomicamente correcta) muestra su uso para QC en juegos de movimiento, realidad aumentada o sistemas de captura de movimiento.
- Generacion de alt-text y descripciones accesibles: dado que conserva la torre de vision, puede producir texto alternativo para imagenes en pipelines de accesibilidad web.
- Prototipado local en Apple Silicon: gracias a la conversion MLX bf16, un equipo Mac con memoria unificada suficiente puede ejecutar el modelo sin conexion, util para equipos que trabajan con datos sensibles o en entornos sin acceso a la nube.
- Educacion y demostraciones de image-to-code: permite a investigadores reproducir el pipeline de AesCode localmente para experimentar con recompensas desacopladas y generacion estetica de codigo.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluacion propia del paper de AesCode (arXiv:2610.18860): 300 prompts de infografia puntuados en una pista programatica `Rule` (Text, Bound, Chart) y una lista de verificacion `Visual` (Content, Layout, Style), con `Overall` como media de ambas, promediado sobre tres generaciones sin seleccion.

| Modelo | Overall | Rule | Visual (mejora vs. backbone) |
|---|---|---|---|
| AesCode-8B | 82,94 | 90,07 | +31,1 puntos sobre Qwen3-VL-8B de referencia |
| GPT-5.5 (referencia acondicionada) | 81,28 | no disponible | no disponible |
| Claude Opus 4.8 (referencia acondicionada) | 80,39 | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo bf16 ocupa 17,5 GB en disco; para inferencia en MLX se necesita memoria unificada suficiente para cargar los pesos completos, en torno a 18-20 GB como minimo practico.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M1/M2/M3/M4 Pro, Max o Ultra con 32 GB o mas). No esta pensado para GPUs NVIDIA en este formato.
- Cabe en GPU consumer: si, en Macs con memoria unificada de 24-32 GB o superior; para equipos de 16 GB existe la variante 8-bit y para 8 GB la variante 4-bit publicadas por el mismo autor.
- Opciones de despliegue: `mlx-vlm` (libreria nativa para Apple Silicon). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AesCode-8B (este, MLX bf16) | 8,8B | no disponible | Image-to-code HTML/CSS con RL | Apache-2.0 | Hugging Face (divinetribe) |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Vision-language general | no disponible en la informacion | Hugging Face (Qwen) |
| GPT-5.5 (referencia) | no disponible | no disponible | Propietario, evaluado en el paper | propietaria | API |
| Claude Opus 4.8 (referencia) | no disponible | no disponible | Propietario, evaluado en el paper | propietaria | API |

La comparativa directa con alternativas open source del mismo tamano y tarea no esta disponible en la informacion proporcionada; el paper solo compara contra los modelos propietarios citados en su tabla de evaluacion.

## Limitaciones y advertencias

- Este repositorio es una conversion de formato, no un modelo nuevo: la calidad depende enteramente del checkpoint original de Microsoft.
- Solo funciona con `mlx-vlm` en Apple Silicon; no es directamente utilizable en CUDA, vLLM o llama.cpp sin conversion adicional.
- El modelo esta especializado en generacion de HTML/CSS y artefactos visuales; su rendimiento en tareas generales de texto o codigo fuera de ese dominio no esta documentado.
- Riesgo de alucinacion en la interpretacion de imagenes ambiguas o de baja calidad; el ejemplo de QC de la model card muestra una lectura imperfecta (manos a la altura de la cintura en lugar de en guardia completa).
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Los benchmarks reportados son de evaluacion propia del paper (300 prompts de infografia), no de suites estandar independientes, por lo que deben interpretarse con cautela.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del checkpoint base Qwen3-VL y del modelo original de Microsoft.
- El contexto maximo no esta documentado en la informacion disponible, lo que limita la planificacion de cargas con documentos o imagenes de gran tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/divinetribe/AesCode-8B-MLX-bf16
- Variante 8-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-8bit
- Variante 4-bit: https://huggingface.co/divinetribe/AesCode-8B-MLX-4bit
- Modelo original: https://huggingface.co/microsoft/AesCode-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Pagina del proyecto: https://microsoft.github.io/AesCode/
- Codigo: https://github.com/microsoft/AesCode
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Repositorio del autor: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
