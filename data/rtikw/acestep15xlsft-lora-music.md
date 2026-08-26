# rtikw/acestep15xlsft-lora-music

## Resumen

`rtikw/acestep15xlsft-lora-music` es un espejo (mirror) en Hugging Face de un adaptador LoRA originalmente publicado en ModelScope por DiffSynth-Studio. El adaptador se entrena sobre el modelo base ACE-Step-v1.5-XL-sft, un modelo de generación de música de código abierto desarrollado por el equipo ACE-Step, y tiene como objetivo específico **mejorar la calidad del acompañamiento instrumental** en las composiciones generadas, manteniendo la voz y la estructura musical intactas.

El modelo base ACE-Step 1.5 es un modelo de difusión para música que compite con alternativas comerciales y funciona en dispositivos locales (CPU, Mac, AMD, Intel y CUDA). Este LoRA se creó mediante la técnica de **entrenamiento diferencial** (Differential LoRA) de DiffSynth-Studio, que permite ajustar de forma fina y selectiva una característica concreta del modelo base sin degradar el resto. El adaptador pesa 79,7 millones de parámetros (0,4 GB en safetensors) y se distribuye bajo licencia Apache-2.0.

La relevancia de este repositorio radica en que proporciona una alternativa de descarga nativa desde Hugging Face para usuarios que prefieren el ecosistema HF, ya que el original solo estaba disponible en ModelScope. No es un modelo autónomo: debe cargarse junto con el modelo base `ACE-Step/acestep-v15-xl-sft` y el pipeline de DiffSynth-Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión (DiT) de ACE-Step 1.5 XL SFT |
| Parametros totales | 79.691.776 (79,7 M) |
| Parametros activos | no disponible (es un adaptador LoRA, no un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | safetensors (bfloat16 en inferencia) |
| Idiomas soportados | el modelo base ACE-Step soporta múltiples idiomas (chino, inglés, etc.); el LoRA no introduce restricciones adicionales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo base `ACE-Step-v1.5-XL-sft`, que es un modelo de difusión (DiT) para generación de música. La técnica empleada es la **Differential LoRA**, un método desarrollado por DiffSynth-Studio que permite modificar selectivamente un atributo del modelo base (en este caso, el acompañamiento musical) mientras se mantienen intactas otras características como la voz o la letra.

El adaptador consta de 79,7 millones de parámetros, que se suman a los del modelo base durante la inferencia mediante la función `load_lora`. No se han publicado detalles sobre el dataset de entrenamiento ni el número de pasos. El modelo base ACE-Step 1.5 utiliza un pipeline que combina un codificador de texto (Qwen3-Embedding-0.6B), un VAE y el modelo de difusión, y el LoRA se inyecta únicamente en el DiT.

## Capacidades

- Mejora la calidad del acompañamiento musical (acordes, instrumentación, ritmo) en las generaciones de ACE-Step.
- Mantiene la letra y la voz del modelo base, ya que el LoRA está entrenado para intervenir solo en la parte instrumental.
- Se integra perfectamente con el pipeline `AceStepPipeline` de DiffSynth-Studio.
- Permite generar música de hasta 160 segundos con parámetros como BPM, tonalidad, compás y idioma de la voz.
- Soporta prompts en texto para describir el estilo musical (por ejemplo, "Music with clear female vocals").
- Funciona con el modelo base de ACE-Step 1.5 XL SFT, que es de código abierto y se puede ejecutar en GPU y CPU.

## Casos de uso

- **Producción musical amateur**: un músico puede generar una canción con letra y voz mediante ACE-Step y aplicar este LoRA para obtener un acompañamiento más rico y profesional sin necesidad de mezclar por separado.
- **Creación de demos rápidas**: compositores que necesitan una maqueta instrumental con acompañamiento mejorado pueden generar un audio de 160 segundos en pocos minutos y evaluar ideas antes de grabar con instrumentos reales.
- **Prototipado para juegos o vídeos**: desarrolladores de juegos o creadores de contenido pueden generar pistas musicales con acompañamiento decente para fondos o escenas, evitando problemas de derechos de autor.
- **Educación musical**: profesores pueden generar ejemplos con acompañamiento mejorado para ilustrar conceptos de armonía y composición.
- **Aplicaciones de karaoke**: la mejora del acompañamiento permite crear versiones instrumentales de calidad para pistas de karaoke.
- **Investigación en generación musical**: investigadores que estudian la influencia de LoRA en modelos de difusión pueden analizar cómo este adaptador modifica el acompañamiento sin afectar a la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye ejemplos de audio comparativos (con y sin LoRA), pero no métricas cuantitativas como MMLU, HumanEval o métricas específicas de audio (FAD, CLAP score, etc.). Se recomienda evaluar el modelo mediante pruebas subjetivas de escucha o utilizando métricas estándar de calidad de audio si se necesita una comparación objetiva.

## Requisitos de hardware

- **LoRA en sí**: el archivo de 0,4 GB se carga en memoria junto al modelo base. Su impacto en VRAM es mínimo (los 79,7 M de parámetros adicionales se funden con el DiT).
- **Modelo base**: ACE-Step 1.5 XL SFT requiere una GPU con al menos 8 GB de VRAM para inferencia en bfloat16, aunque se puede ejecutar en CPU (con mayor latencia). No se dispone de datos exactos de VRAM para este LoRA específico.
- **GPUs recomendadas**: RTX 3060 (12 GB) o superior, RTX 4090, A100, H100. Para CPU, se recomienda al menos 16 GB de RAM.
- **Opciones de despliegue**: se usa a través de DiffSynth-Studio (pipeline Python) o mediante la interfaz Gradio del proyecto ACE-Step. No hay soporte nativo para vLLM, Ollama o llama.cpp, ya que es un modelo de audio, no de texto.
- **Latencia**: para 160 segundos de audio con 50 pasos de inferencia, en una GPU RTX 4090 se estima un tiempo de generación de varios minutos (no se dispone de cifras exactas). En CPU puede ser varias veces más lento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `acestep15xlsft-lora-music` | LoRA para ACE-Step | 79,7 M | No aplica | Apache-2.0 | Hugging Face (mirror) |
| `ACE-Step-v1.5-XL-sft` (base) | Modelo de difusión de música | ~1.6B (no confirmado) | 160 s de audio | Apache-2.0 | ModelScope |
| `woctordho/ACE-Step-v1-LoRA-collection` | Colección de LoRA para ACE-Step v1 | Variable | No aplica | Apache-2.0 | Hugging Face |
| Modelos comerciales (Suno, Udio) | Música generativa | no disponible | no disponible | Comercial | API |

No se dispone de datos de rendimiento comparativos entre estos LoRA. El LoRA de este repositorio está diseñado para un caso de uso concreto (mejora del acompañamiento) y no es comparable en términos de tareas generales.

## Limitaciones y advertencias

- **Dependencia del modelo base**: el LoRA no es funcional sin el modelo `ACE-Step-v1.5-XL-sft` y el pipeline de DiffSynth-Studio. Debe cargarse junto a ellos.
- **Idioma del texto**: el prompt de texto puede estar en inglés o chino, pero la letra (lyrics) debe estar en el idioma que se indique en `vocal_language`. El modelo base tiene soporte limitado para otros idiomas.
- **Alucinación en la letra**: aunque el LoRA se centra en el acompañamiento, el modelo base puede generar letras incoherentes o mal pronunciadas en algunos idiomas.
- **Riesgo de calidad**: los ejemplos del repositorio muestran una mejora clara en el acompañamiento, pero no se garantiza que el resultado sea siempre musicalmente agradable o libre de artefactos.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base también es Apache-2.0, así que no hay restricciones adicionales. Sin embargo, el espejo es un mirror no oficial; el autor original es DiffSynth-Studio.
- **Actualización**: el repositorio es un mirror de 2026-08-25; no se esperan actualizaciones futuras.

## Enlaces

- Repositorio Hugging Face: [https://huggingface.co/rtikw/acestep15xlsft-lora-music](https://huggingface.co/rtikw/acestep15xlsft-lora-music)
- Repositorio original en ModelScope: [https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-music](https://modelscope.cn/models/DiffSynth-Studio/acestep15xlsft-lora-music)
- Repositorio de ACE-Step en GitHub: [https://github.com/ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5)
- Documentación de DiffSynth-Studio: [https://diffsynth-studio-doc.readthedocs.io/zh-cn/latest/Training/Differential_LoRA.html](https://diffsynth-studio-doc.readthedocs.io/zh-cn/latest/Training/Differential_LoRA.html)
- Artículo sobre ACE-Step 1.5: [https://aibit.im/en/article/ace-step-1-5-open-source-music-model-outperforms-commercial](https://aibit.im/en/article/ace-step-1-5-open-source-music-model-outperforms-commercial)
