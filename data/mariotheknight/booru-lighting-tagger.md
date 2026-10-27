# MarioTheKnight/booru-lighting-tagger

## Resumen

Booru Lighting Tagger es un clasificador de imágenes multietiqueta especializado en describir la iluminación de ilustraciones de estilo anime. Lo desarrolla MarioTheKnight como fine-tune del WD EVA02-Large Tagger v3 de SmilingWolf y resuelve un problema concreto de los pipelines de entrenamiento: las etiquetas tipo booru (danbooru, e621) describen bien qué aparece en la imagen, pero casi nunca cómo está iluminada, de modo que los modelos generativos entrenados con esos captions no tienen control real sobre la luz. Este modelo añade 39 etiquetas de iluminación (`backlighting`, `rim_light`, `chiaroscuro`, `caustics`, `window_shadow`, `candlelight`, etc.) más una clave tonal (`dark`, `dim_lighting`, `normal`, `high_key`).

Técnicamente es un EVA02 (ViT) en el que se han reentrenado 16 de los 24 bloques transformer bajo una nueva cabeza de iluminación. El entrenamiento se hizo por destilación desde un profesor (Claude Opus 5.5) que puntuó unas 19.500 imágenes de 0 a 10 en cada etiqueta; el resultado se validó contra respuestas humanas ciegas, donde el tagger supera a su propio profesor (AP media 0,87 frente a 0,78 en 28 etiquetas). Con licencia Apache 2.0 y un consumo de VRAM de 3,8 GB en su configuración por defecto, es relevante ahora porque permite anotar datasets completos de ilustraciones con etiquetas de luz que después se pueden invocar desde el prompt.

El modelo no genera texto ni razona: es un clasificador puro de imagen a etiquetas, pensado para completar captions de datasets y para filtrar o buscar imágenes por iluminación. Su utilidad práctica depende del ecosistema booru (Danbooru, e621, WD Tagger) y del dominio de ilustración anime; fuera de ese dominio no hay garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVA02 (transformer de visión) heredada de WD EVA02-Large Tagger v3; 24 bloques transformer, 16 reentrenados; cabeza multietiqueta de 39 etiquetas de iluminación + cabeza de clave tonal de 4 clases |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base es EVA02-Large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; no procesa texto) |
| Tipos de cuantizacion | no disponible; el autor documenta precisión bfloat16 en GPU (float16 en GPUs sin bfloat16) y float32 en CPU |
| Idiomas soportados | inglés (etiquetas y vocabulario en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la informacion proporcionada; el repo (2,4 GB) incluye `inference.py`, `requirements.txt`, `tagger_config.json` y el modelo base se descarga aparte (1,2 GB) |
| Tarea | image-classification (multi-label) |
| Etiquetas de salida | 39 etiquetas de iluminación + 1 clave tonal entre `dark`, `dim_lighting`, `normal`, `high_key` |
| Escala de puntuación | 0 (ausente) a 10 (obvio y dominante); no es una probabilidad |
| Entrada | PNG, JPEG, WebP, BMP, GIF (primer fotograma), TIFF |
| Modelo base | SmilingWolf/wd-eva02-large-tagger-v3 (relación: finetune) |
| Fecha de publicación | 2026-10-27 |
| Descargas / likes en el Hub | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo parte del WD EVA02-Large Tagger v3, un ViT EVA02 con 24 bloques transformer entrenado originalmente para etiquetado booru general. El autor reentrenó 16 de esos 24 bloques y sustituyó la cabeza de clasificación por una nueva cabeza de iluminación con 39 etiquetas y una salida adicional de clave tonal de 4 clases. La inferencia se hace en bfloat16 en GPU (float16 en GPUs sin soporte de bfloat16) y en float32 en CPU, con etiquetas equivalentes (diferencia máxima de puntuación de 0,05 en un conjunto de comprobación). Por defecto se promedian 3 semillas; existe una opción de 1 semilla que es más rápida y ligeramente menos precisa.

El entrenamiento es por destilación desde un profesor: Claude Opus 5.5 puntuó aproximadamente 19.500 imágenes de 0 a 10 en cada una de las etiquetas, y el tagger aprendió esas valoraciones. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO (no aplicables a un clasificador de este tipo). La validación se hizo contra respuestas humanas ciegas: en 28 etiquetas el modelo obtiene una AP media de 0,87 frente a 0,78 del profesor, y 23 etiquetas alcanzan simultáneamente un 70 % de precisión y un 30 % de recall. Los umbrales por etiqueta se calibraron para emitir tantas etiquetas como emitía el profesor en las imágenes de validación y están en `tagger_config.json`.

## Capacidades

- Etiquetado de iluminación multietiqueta: 39 etiquetas que cubren dirección de la luz (`backlighting`, `sidelighting`, `rim_light`), contraste (`chiaroscuro`), color de la luz (`warm_lighting`), efectos (`caustics`, `light_particles`) y fuentes (`candlelight`, `sunset`, `window_shadow`).
- Clasificación de clave tonal en cuatro clases (`dark`, `dim_lighting`, `normal`, `high_key`), con probabilidades por clase.
- Puntuación granular de 0 a 10 por etiqueta, útil para aplicar umbrales propios en lugar de los predefinidos.
- Procesamiento por lotes de directorios completos, con recursión en subcarpetas.
- Escritura directa de captions: añade las etiquetas que faltan a `<imagen>.txt` sin duplicar las existentes (`rim_light` y `rim light` se consideran la misma etiqueta) o genera un fichero `.lighting.txt` independiente.
- Salida en JSON Lines con todas las puntuaciones y probabilidades tonales, para análisis posterior.
- Opción `--validated-only` para emitir únicamente las 23 etiquetas con validación humana.
- No soporta tool calling, agentes, razonamiento multi-paso, visión descriptiva libre ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Anotación de datasets para fine-tuning de modelos de ilustración: ejecutar `inference.py dataset/ --recursive --append-to-captions` sobre un dataset de imágenes anime para que cada caption `.txt` incorpore las etiquetas de luz ausentes y el modelo generativo pueda aprender a responder a prompts como `backlighting` o `chiaroscuro`.
- Construcción de datasets condicionados por iluminación: usar `--jsonl` para conservar todas las puntuaciones y filtrar después, por ejemplo, las imágenes con `rim_light` superior a 7 para entrenar un LoRA específico de luz de contorno.
- Búsqueda y filtrado en una biblioteca de imágenes: clasificar un archivo de ilustraciones y exponer las etiquetas en un índice para permitir consultas del tipo "todas las imágenes con `candlelight` y clave tonal `dark`", algo que las etiquetas booru generales no permiten.
- Curación de datasets existentes: detectar imágenes mal etiquetadas comparando las etiquetas de iluminación predichas con las presentes en el caption original y marcar discrepancias para revisión humana.
- Asistencia a la escritura de prompts: dada una imagen de referencia, obtener las etiquetas de luz que la describen para reutilizarlas en el prompt de generación, sin tener que estimar a ojo la dirección y el color de la luz.
- Normalización de captions en pipelines multi-fuente: unificar el vocabulario de iluminación entre imágenes de Danbooru, e621 y otras fuentes, usando `--spaces` si el pipeline de entrenamiento espera etiquetas con espacios en lugar de guiones bajos.
- Preprocesado en CPU sin GPU: con 16 hilos procesa aproximadamente una imagen cada 3 segundos, suficiente para lotes nocturnos en máquinas sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; no aplican a un clasificador de imagen. Los datos facilitados por el autor son los siguientes:

| Metrica | Resultado | Referencia |
|---|---|---|
| AP media en 28 etiquetas (validación humana ciega) | 0,87 | Profesor (Claude Opus 5.5): 0,78 |
| Etiquetas con >=70 % de precisión y >=30 % de recall | 23 de 39 | no disponible para las 16 restantes |
| Throughput en GPU (RTX PRO 6000 Blackwell, lotes de 16, 3 semillas) | 40 imágenes/s | 3,8 GB de VRAM, 4,6 GB en pico |
| Throughput en GPU (1 semilla) | 89 imágenes/s | 1,3 GB de VRAM, 2,1 GB en pico |
| Throughput en CPU (16 hilos) | ~3 s por imagen | 1 semilla, no medido |
| Diferencia GPU bfloat16 frente a CPU float32 | 0,05 de puntuación máxima en un conjunto de comprobación | mismas etiquetas emitidas |

## Requisitos de hardware

- VRAM: 3,8 GB en la configuración por defecto de 3 semillas (4,6 GB en pico) y 1,3 GB con 1 semilla (2,1 GB en pico), medidos en una RTX PRO 6000 Blackwell con lotes de 16.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 6 GB o más puede ejecutar la configuración por defecto; con 2-3 GB basta para 1 semilla. No se documentan pruebas en modelos concretos de consumo.
- GPU de datacenter (A100, H100, L40S) no son necesarias por memoria, pero sí útiles para maximizar throughput en anotación de datasets grandes; el autor solo publica cifras para RTX PRO 6000 Blackwell.
- CPU: viable en modo float32 con 16 hilos a ~3 s por imagen; el modelo base se ejecuta en CPU sin cuantización documentada.
- Despliegue: el repo incluye `inference.py` con la clase `LightingTagger` y una CLI; requiere PyTorch y las dependencias de `requirements.txt`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo. El modelo base (1,2 GB) se descarga del Hub y se cachea en la primera ejecución.
- Latencia: no se publican cifras de latencia por imagen en GPU; a partir del throughput de 40 imágenes/s con lotes de 16 se puede estimar un coste de decenas de milisegundos por imagen, pero no es un dato medido de forma individual.

## Comparativa con modelos similares

| Modelo | Tipo | Etiquetas de salida | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Booru Lighting Tagger (este modelo) | EVA02 fine-tune, clasificador multietiqueta | 39 de iluminación + clave tonal | imagen (PNG, JPEG, WebP, BMP, GIF, TIFF) | Apache 2.0 | HuggingFace, repo de 2,4 GB |
| WD EVA02-Large Tagger v3 (SmilingWolf) | EVA02, clasificador multietiqueta general booru | etiquetas booru generales, sin eje específico de iluminación | imagen | Apache 2.0 | HuggingFace |
| Otros taggers específicos de iluminación | no disponible | no disponible | no disponible | no disponible | no disponible en la información consultada |

La comparación relevante es con el modelo base: este fine-tune conserva la arquitectura y la licencia, reduce el ámbito de salida a la iluminación y añade una cabeza tonal, pero no se dispone de datos públicos comparativos de rendimiento entre ambos en etiquetado general.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre ilustraciones de estilo anime y vocabulario booru; el rendimiento en fotografía real, arte occidental o renders 3D no está documentado y previsiblemente será peor.
- Las puntuaciones de 0 a 10 no son probabilidades calibradas: representan la valoración más probable del profesor, y un 5 significa "dudoso". No deben interpretarse como confianza del modelo.
- Solo 23 de las 39 etiquetas alcanzan el umbral de 70 % de precisión y 30 % de recall; las 16 restantes tienen menor fiabilidad. Existe la opción `--validated-only` para limitarse a las validadas.
- Los umbrales por defecto están calibrados para reproducir el volumen de etiquetas del profesor en el conjunto de validación, no para maximizar precisión o recall en un caso concreto; conviene ajustarlos con la salida JSONL.
- Riesgo de falsos positivos en imágenes con iluminación ambigua o muy plana, donde varias etiquetas pueden quedar cerca del umbral.
- Idiomas: el vocabulario de salida es únicamente inglés; no hay soporte multilingüe ni traducción de etiquetas.
- Dependencia del profesor: al ser destilación de un modelo de lenguaje propietario, los sesgos de anotación del profesor (incluida su interpretación subjetiva de "chiaroscuro" o "high_key") se heredan en el tagger.
- Licencia Apache 2.0, permisiva para uso comercial; el modelo base también es Apache 2.0 según la model card. Aun así, conviene verificar las condiciones de las imágenes sobre las que se aplique y las licencias de los datasets de origen (Danbooru, e621) si se redistribuyen captions derivados.
- Validación externa escasa: 0 descargas y 1 like en el Hub en el momento de la consulta, sin revisión independiente publicada.
- El proceso de anotación modifica ficheros `.txt` in situ con `--append-to-captions`; en producción conviene trabajar sobre copias o usar `--jsonl` para no alterar captions originales de forma irreversible.
- No genera descripciones en lenguaje natural ni responde a preguntas: no sustituye a un modelo de visión-lenguaje en tareas de captioning libre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarioTheKnight/booru-lighting-tagger
- Informe del proyecto (REPORT.md): https://huggingface.co/MarioTheKnight/booru-lighting-tagger/blob/main/REPORT.md
- Script de inferencia: https://huggingface.co/MarioTheKnight/booru-lighting-tagger/blob/main/inference.py
- Configuración de umbrales: https://huggingface.co/MarioTheKnight/booru-lighting-tagger/blob/main/tagger_config.json
- Modelo base (WD EVA02-Large Tagger v3, SmilingWolf): https://huggingface.co/SmilingWolf/wd-eva02-large-tagger-v3
- Directorio de herramientas Danbooru para arte con IA (contexto del ecosistema): https://civitai.red/articles/27794/the-danbooru-tools-directory-for-ai-art-2026
- Perfil del autor en DeviantArt: https://www.deviantart.com/mariotheknight
- Perfil del autor en pixiv: https://www.pixiv.net/en/users/98706799
