# Richard-ZZZZZ/ai-gf-image-video-harness

## Resumen

`ai-gf-image-video-harness` no es un modelo fundacional, sino un repositorio de orquestación publicado por el usuario Richard-ZZZZZ en Hugging Face. Contiene código, LoRAs, imágenes de referencia y pequeños conjuntos de ejecuciones que implementan un pipeline de generación de imágenes y vídeo condicionado por el estado de un diálogo conversacional. El objetivo declarado es servir de instantánea reproducible para continuar el desarrollo tras una migración de máquina, no distribuir pesos de un modelo entrenado desde cero.

El sistema encadena un extractor de estado de chat (`ChatStateExtractor`), un delta de estado visual, un supervisor y un paso de "prompt engineering" (PE) basado en Qwen para generar imágenes condicionadas. Posteriormente aplica edición multi-imagen mediante una API externa (AIAPI) o un script local `generate.py`, con soporte opcional de LoRA, y puede encadenar un paso de image-to-video (I2V) con modelos Wan o PinkCherry. El repositorio incluye referencias anatómicas, una LoRA NSFW denominada FemaledVaginus y prompts de sistema de contenido adulto.

Es relevante únicamente en el contexto de investigación sobre pipelines de generación multimodal condicionada por estado conversacional y sobre integración de LoRAs en flujos de edición de imagen. No debe confundirse con un modelo de lenguaje o de difusión publicable: los pesos fundacionales (imagen, VLM, vídeo y PE) no están incluidos y deben obtenerse por separado, con un volumen de decenas de GB según indica el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de orquestación (no es un modelo único): extractor de estado de chat + supervisor + Qwen PE-I2I + edición multi-imagen (AIAPI o `generate.py`) + I2V opcional (Wan/PinkCherry) |
| Parametros totales | no disponible (los pesos fundacionales no se incluyen en el repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts y documentación están en inglés y chino) |
| Licencia | MIT (el contenido sigue siendo NSFW; la licencia no otorga permiso en jurisdicciones que lo prohíban) |
| Formato de pesos | safetensors para las LoRAs incluidas (`refs/loras/*.safetensors`); el resto de pesos fundacionales no se distribuyen |

## Arquitectura y entrenamiento

El repositorio describe un grafo de procesamiento, no un modelo entrenado. La cadena documentada es: diálogo → `ChatStateExtractor` → delta de estado visual → supervisor → Qwen PE-I2I (con amplificación y refuerzo de microdetalle erótico cuando se activa el modo NSFW) → imágenes de condición en orden `previous? → face → action → anatomy → pose?` → edición multi-imagen vía AIAPI o `generate.py` local con LoRA opcional → I2V opcional con Wan o PinkCherry. La prioridad declarada es "action gallery > pose", descartando la imagen previa en acciones fuertes y aplicando anatomía en casos de exposición.

No se aportan datos sobre volumen de entrenamiento, composición del dataset, tokens procesados ni uso de RLHF o DPO, porque el autor no entrena un modelo base. La innovación técnica destacable es la gestión explícita de estado visual derivado del diálogo y el uso de galerías de poses y acciones como condicionamiento estructurado, junto con un modo offline de simulación (`--dry-run --vlm-mock`) que permite probar el harness sin pesos fundacionales. El repositorio incluye también una nota de investigación y ficheros COMPARE de ejecuciones representativas.

## Capacidades

- Generación de imágenes condicionada por el estado extraído de una conversación multi-turno.
- Edición multi-imagen con orden de condicionamiento configurable (rostro, acción, anatomía, pose).
- Aplicación de LoRAs en el paso de generación local (`generate.py`) o vía API externa.
- Encadenamiento opcional image-to-video (I2V) con modelos Wan o PinkCherry.
- Modo "PE" con prompts de sistema NSFW y amplificación de microdetalle erótico (`AIGF_PE_ALLOW_NSFW=1`).
- Ejecución offline de pruebas y pipeline de chat con VLM simulado (`--dry-run --vlm-mock`).
- Gestión de galerías de poses y acciones mediante variables de entorno (`AIGF_ACTION_GALLERY_ENABLED`, `AIGF_POSE_GALLERY_ENABLED`, `AIGF_POSE_WITH_ACTION`).
- No se documentan capacidades de tool calling, agentes autónomos, matemáticas, código ni audio.

## Casos de uso

- Investigación sobre condicionamiento visual por estado conversacional: el harness permite estudiar cómo un extractor de estado de chat transforma un diálogo en un delta de estado visual y cómo ese delta modula la generación de imágenes, con trazabilidad mediante los ficheros COMPARE incluidos.
- Reproducibilidad de experimentos de generación multimodal: la instantánea incluye código, LoRAs, referencias y ejecuciones de continuidad, lo que facilita replicar resultados tras migraciones de infraestructura.
- Pruebas de integración de LoRAs en pipelines de edición: el paso `generate.py` acepta LoRA opcional y permite evaluar el efecto de `refs/loras/*.safetensors` sobre el resultado final.
- Validación de pipelines I2V encadenados: el soporte de Wan y PinkCherry permite probar la transición de imagen generada a vídeo corto dentro del mismo flujo.
- Desarrollo de sistemas de simulación offline: el modo `--dry-run --vlm-mock` permite iterar sobre la lógica de orquestación sin descargar decenas de GB de pesos fundacionales.
- Auditoría de contenido adulto generado: la separación explícita entre prompts NSFW, galerías anatómicas y LoRAs facilita revisar qué componentes activan contenido explícito y bajo qué variables de entorno.
- Prototipado de asistentes conversacionales con salida visual: el extractor de estado y el supervisor pueden reutilizarse como base para otros dominios donde el diálogo deba traducirse en parámetros de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende enteramente de los pesos fundacionales externos (imagen, VLM, vídeo y PE) que el usuario deba aportar.
- GPU recomendadas: no disponible. El autor no especifica modelos concretos; el repositorio remite a `REPRODUCE.md` para la generación en GPU.
- Cabe en GPU de consumo: no disponible, al no conocerse los pesos base utilizados.
- Opciones de despliegue: ejecución directa con `python run_harness_full_aiapi_pe.py` o `bash scripts/launch_pe_action_run.sh`; edición vía AIAPI (API externa con URLs CDN públicas) o vía `generate.py` local con Diffusers. Se requiere una versión de Diffusers compatible con `QwenImage21Pipeline` (commit fijado en `requirements.txt`).
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,8 GB; los pesos fundacionales externos suman decenas de GB según el autor, y la galería de poses completa añade aproximadamente 1,3 GB.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (harness de orquestación diálogo→imagen→vídeo con contenido NSFW). El repositorio no es equiparable a un modelo fundacional de difusión o de lenguaje, por lo que una comparación directa de parámetros, contexto o benchmarks carece de sentido.

## Limitaciones y advertencias

- Contenido NSFW explícito: el repositorio incluye material adulto (referencias anatómicas, LoRA FemaledVaginus, prompts eróticos y ejecuciones de muestra). No debe usarse si el usuario es menor de edad o si la legislación local prohíbe la generación de medios adultos.
- La licencia MIT no equivale a permiso legal: el propio autor advierte que la licencia no otorga permiso en jurisdicciones donde el contenido esté restringido.
- No es un modelo autónomo: sin los pesos fundacionales externos (imagen, VLM, vídeo, PE) el repositorio solo permite el modo offline simulado.
- Dependencia de una API externa (AIAPI) para el flujo de edición multi-imagen; las claves y URLs de túnel han sido redactadas y deben configurarse desde `api/.env.example`.
- Dependencia de una versión concreta de Diffusers (`QwenImage21Pipeline` con commit fijado); actualizaciones no controladas pueden romper el pipeline.
- La galería de poses completa no está incluida (solo un stub de metadatos); requiere clonar un repositorio externo o configurar `AIGF_POSE_GALLERY_ROOT`.
- Riesgo de alucinación visual y de coherencia entre turnos no evaluado: no se publican métricas de fidelidad, consistencia de identidad ni calidad de vídeo.
- Idiomas no declarados; la documentación y los prompts están en inglés y chino, sin garantía de funcionamiento en castellano.
- Sesgos conocidos: no documentados por el autor; cabe esperar los sesgos de los modelos fundacionales subyacentes y de las galerías de referencia utilizadas.
- Idoneidad para producción no acreditada: el repositorio se presenta como instantánea de desarrollo, no como servicio estable.

## Enlaces

- Hugging Face: https://huggingface.co/Richard-ZZZZZ/ai-gf-image-video-harness
- Galería de poses externa: https://github.com/fairyliuying/ai-pose-gallery-zh
- Documentación interna citada: `docs/USAGE_SKILL.md`, `docs/QWEN_IMAGE_PE.md`, `docs/ACTION_GALLERY.md`, `docs/POSE_GALLERY.md`, `docs/PE_NSFW_UNLOCK_REPORT.md`, `docs/PE_EROTIC_DETAIL_BOOST_REPORT.md`, `EXTERNAL_WEIGHTS.md`, `REPRODUCE.md`
- Paper, blog o demo adicionales: no disponible
