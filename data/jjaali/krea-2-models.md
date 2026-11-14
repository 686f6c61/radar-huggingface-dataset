# jjaali/Krea-2-Models

## Resumen

`jjaali/Krea-2-Models` es un repositorio de Hugging Face publicado por el usuario `jjaali` que agrupa varios checkpoints derivados (fine-tunes y merges) del modelo base `krea/Krea-2-Turbo`. Por los nombres de fichero y la información de la model card, se trata de pesos orientados a generación y edición de imágenes (y, según el aviso del autor, capacidad image-to-video) con fine-tunes de contenido para adultos. El repositorio no documenta arquitectura, número de parámetros ni contexto, y su tamaño total es de 40,8 GB.

La relevancia de este repositorio es fundamentalmente operativa y de gobernanza: el autor retiró el Space de Hugging Face asociado tras una notificación del equipo de Hugging Face en la que se indica que el Space alojaba un modelo ajustado explícitamente para generación image-to-video de contenido adulto/NSFW, y que la política de la plataforma ha endurecido la aplicación de restricciones sobre espacios i2i/i2v NSFW por el riesgo de generación de imágenes íntimas no consentidas (NCII). La model card reproduce ese aviso y ofrece alternativas de despliegue (mirror o ejecución propia en Runpod a partir de un repositorio de GitHub).

No se dispone de información técnica verificable sobre el entrenamiento, los datos utilizados, los benchmarks ni la licencia de estos checkpoints. Cualquier evaluación de calidad debe hacerse, por tanto, empíricamente y bajo las restricciones legales y de plataforma aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `krea/Krea-2-Turbo`; presumiblemente difusión, sin confirmar) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | INT8, NVFP4, BF16, FP8 (según nombres de fichero de los checkpoints) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`.safetensors`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `krea/Krea-2-Turbo` ni sobre el proceso de entrenamiento de los checkpoints de este repositorio. Los nombres de fichero sugieren variantes cuantizadas a INT8, NVFP4, BF16 y FP8, lo que es coherente con pipelines de inferencia de modelos generativos de imagen. Los checkpoints parecen ser fine-tunes y merges de terceros (procedentes de CivitAI) empaquetados para su uso en un Space de Hugging Face.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el procedimiento de fine-tuning aplicado a cada checkpoint.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), inferido del tipo de modelo base y del ecosistema de checkpoints.
- Edición de imágenes image-to-image (i2i), según la referencia del autor a un Space i2i/i2v.
- Generación image-to-video (i2v), mencionada explícitamente en el aviso de Hugging Face reproducido en la model card.
- Fine-tunes orientados a contenido para adultos (NSFW), indicado por la etiqueta `not-for-all-audiences` y por los nombres de los checkpoints.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre fine-tuning de modelos de difusión: los checkpoints permiten estudiar cómo distintos merges y cuantizaciones (INT8, NVFP4, BF16, FP8) afectan a la fidelidad y al rendimiento de un modelo base, comparando variantes sobre el mismo pipeline.
- Evaluación de cuantizaciones en producción: comparar BF16 frente a FP8/INT8/NVFP4 en términos de VRAM, latencia y degradación visual para decidir qué variante desplegar en hardware limitado.
- Despliegue autoalojado en infraestructura propia: el autor propone ejecutar los modelos en Runpod clonando su repositorio de GitHub, lo que sirve como caso de estudio de despliegue fuera de plataformas con moderación estricta.
- Pruebas de pipelines i2i/i2v en entornos controlados: validar la integración de checkpoints safetensors en frameworks de difusión y medir el coste de generar vídeo corto a partir de una imagen.
- Análisis de gobernanza y moderación de contenido: el repositorio y el aviso de Hugging Face constituyen un caso documentado de las políticas de la plataforma sobre NSFW y NCII, útil para diseñar salvaguardas (detección de rostros, filtrado de prompts, escaneo de salidas).
- Benchmarking interno de merges de la comunidad: comparar los tres checkpoints listados (FinePorn v4, Muse By Stable Yogi Krea2, PornMaster Krea2) frente al base Turbo en tareas de fidelidad al prompt y coherencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El tamaño del repositorio es de 40,8 GB e incluye varios checkpoints; cada fichero individual puede cargarse por separado, pero no se especifica su tamaño ni su huella en VRAM.
- GPU recomendadas: no disponible. Por las cuantizaciones presentes (FP8, INT8, NVFP4), es razonable esperar soporte en GPUs con aceleración de precisión reducida (H100, A100, RTX 4090/5090), pero no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Dependerá de la variante cuantizada y del pipeline; las variantes INT8/FP8/NVFP4 son las candidatas a caber en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: el autor referencia un repositorio de GitHub (`minipasila/Krea-2-Turbo_I2I`) para ejecución en Runpod. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables. Como referencia estructural, los checkpoints se derivan de `krea/Krea-2-Turbo`, pero no se aportan métricas que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado `not-for-all-audiences` y los checkpoints están orientados a NSFW; su uso comercial o público puede infringir políticas de plataformas y normativas locales.
- Riesgo de NCII: el aviso de Hugging Face señala que la combinación de i2v con un modelo adulto sin censura presenta un riesgo alto de generación de imágenes íntimas no consentidas; el autor retiró el Space por este motivo.
- Moderación ausente: según Hugging Face, el Space no contaba con salvaguardas robustas (detección de rostros, filtrado de prompts, escaneo de salidas).
- Licencia no disponible: no se puede verificar si el uso comercial está permitido; la licencia del modelo base `krea/Krea-2-Turbo` tampoco se detalla en la información proporcionada.
- Falta de documentación técnica: sin datos de arquitectura, parámetros, entrenamiento ni benchmarks, lo que impide evaluar calidad, sesgos o robustez de forma rigurosa.
- Sesgos: no documentados; los fine-tunes de contenido adulto pueden amplificar sesgos de representación y estereotipos.
- Alucinación visual: no evaluada; sin benchmarks no hay evidencia sobre fidelidad al prompt.
- Procedencia de los checkpoints: los ficheros remiten a CivitAI y a un repositorio de GitHub de otro usuario (`mpasila`), lo que plantea dudas sobre trazabilidad y cadena de custodia de los pesos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta; sin garantía de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jjaali/Krea-2-Models
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio de GitHub para despliegue en Runpod: https://github.com/minipasila/Krea-2-Turbo_I2I
- Checkpoint FinePorn v4 (CivitAI): https://civitai.red/models/2762538/fineporn-v4-int8-or-nvfp4-or-bf16-or-fp8?modelVersionId=3187539
- Checkpoint Muse By Stable Yogi Krea2 (CivitAI): https://civitai.red/models/2741166/muse-by-stable-yogi-krea2?modelVersionId=3149126
- Checkpoint PornMaster Krea2 (CivitAI): https://civitai.red/models/2735032/pornmaster-krea2?modelVersionId=3119653
- Fichero finepornV4INT8NVFP4BF16_v4.safetensors: https://huggingface.co/mpasila/Krea-2-Models/resolve/main/finepornV4INT8NVFP4BF16_v4.safetensors?download=true
- Fichero museByStableYogi_v25EXTENDEDTURBO.safetensors: https://huggingface.co/mpasila/Krea-2-Models/resolve/main/museByStableYogi_v25EXTENDEDTURBO.safetensors
- Fichero pornmasterKrea2_v2TurboInt8.safetensors: https://huggingface.co/mpasila/Krea-2-Models/resolve/main/pornmasterKrea2_v2TurboInt8.safetensors
