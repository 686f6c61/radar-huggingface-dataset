# caspar/vlm-from-scratch-20261111-164819-a40-hf-publish

## Resumen

`caspar/vlm-from-scratch-20261111-164819-a40-hf-publish` es un repositorio educativo que contiene los artefactos generados al ejecutar el cuaderno `part-01-minimal-vlm.py` del proyecto "VLM from Scratch" de Nipun Batra. No es un modelo entrenado para producción, sino una instantánea de un ejercicio didáctico: un vision-language model (VLM) mínimo construido emparejando un codificador visual preentrenado (Google ViT) con un modelo de lenguaje pequeño (HuggingFaceTB SmolLM) mediante un proyector entrenable. El run se ejecutó en una NVIDIA A40 de 48 GB y tardó 1099 segundos.

El repositorio (1,5 GB) incluye el checkpoint `mini-vlm-flickr8k`, que contiene los estados del proyector y del modelo de lenguaje, y requiere el vision base congelado indicado en la configuración del checkpoint para cargarse. La model card advierte explícitamente de que los artefactos son educativos y carecen de certificación de calidad independiente; no se han publicado benchmarks ni métricas de rendimiento.

Su relevancia es formativa: sirve para estudiar cómo se compone un VLM desde cero (visión congelada + proyector + LM), cómo se guardan y cargan checkpoints nativos con clases personalizadas y qué limitaciones tiene un entrenamiento de este tipo sobre un dataset pequeño como Flickr8k. No debe confundirse con un modelo listo para uso comercial o de investigación seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM minimalista: vision encoder congelado (Google ViT) + proyector entrenable + modelo de lenguaje (HuggingFaceTB SmolLM); clases personalizadas en `notebook.py` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el cuaderno incluye una parte (part 10) que demuestra cuantizacion y genera un estudiante menor sin entrenar; no se especifican formatos ni esquemas concretos |
| Idiomas soportados | en, ko (segun tags y metadatos) |
| Licencia | no disponible (la model card remite a las licencias de los modelos base y datasets upstream) |
| Formato de pesos | safetensors (checkpoint OCR); los checkpoints de compresion son state dicts que requieren reconstruir la arquitectura exacta; los checkpoints de las partes 1-9 incluyen estados del proyector y del LM |

## Arquitectura y entrenamiento

La arquitectura sigue el patron clasico de VLM de tipo "encoder congelado + proyector + LM": un codificador visual Google ViT preentrenado y congelado extrae representaciones de la imagen, un proyector entrenable las alinea con el espacio del modelo de lenguaje, y un SmolLM de HuggingFaceTB genera el texto. El entrenamiento se realizó sobre el dataset Flickr8k (captioning de imágenes), según el nombre del checkpoint `mini-vlm-flickr8k`. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

El repositorio documenta varias fases del cuaderno: las partes 1-9 ofrecen ejemplos de carga de checkpoints nativos con vision base congelado; la parte 10 demuestra cuantizacion y crea un estudiante menor sin ejecutar entrenamiento de destilación; la parte 11 usa modelos preentrenados de generación de imágenes sin entrenar pesos nuevos; y la parte 12 entrena sobre ejemplos sintéticos de ecuaciones definidos por el propio cuaderno. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de descripciones de imágenes (image captioning) en el dominio de Flickr8k, con calidad no certificada.
- Comprensión visual básica limitada al alineamiento aprendido por el proyector sobre un dataset pequeño.
- Generación de texto a través del modelo de lenguaje SmolLM subyacente.
- Capacidad multilingüe limitada a inglés y coreano según los metadatos (dependiente del LM base).
- Ejemplos de carga de checkpoints nativos con clases personalizadas (partes 1-9).
- Demostración de cuantizacion y creación de un estudiante menor (parte 10, sin destilación entrenada).
- Entrenamiento sobre ejemplos sintéticos de ecuaciones (parte 12).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning.

## Casos de uso

- Estudio de arquitecturas VLM: el repositorio permite inspeccionar cómo se compone un VLM desde cero (ViT congelado + proyector + SmolLM) y cómo se guardan los checkpoints con clases personalizadas. Adecuado para docencia y aprendizaje.
- Reproducción de experimentos educativos: sirve para replicar el pipeline del cuaderno `part-01-minimal-vlm.py` en una A40 y comparar tiempos de ejecución (1099 s documentados).
- Base para experimentos de captioning en dominios pequeños: el checkpoint `mini-vlm-flickr8k` puede usarse como punto de partida para probar variaciones del proyector sobre datasets de imágenes reducidos.
- Demostración de cuantizacion: la parte 10 del cuaderno ilustra cómo crear un estudiante menor y cuantizar, útil para entender flujos de compresión aunque no se entrene destilación.
- Prototipado de carga de checkpoints nativos: los ejemplos de las partes 1-9 muestran cómo cargar estados del proyector y del LM requiriendo el vision base congelado, útil para desarrolladores que diseñen sus propios formatos de checkpoint.
- Material de referencia para cursos de visión-lenguaje: el repositorio incluye fuentes de los cuadernos y definiciones de entorno en `source/`, lo que facilita su uso en asignaturas de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repo es de 1,5 GB, lo que sugiere que el checkpoint cabe holgadamente en GPUs consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: el run se ejecutó en una NVIDIA A40 de 48 GB; no se especifican alternativas.
- Cabe en GPU consumer: probablemente sí por el tamaño del repo, pero no confirmado en la información disponible.
- Opciones de despliegue: carga mediante clases personalizadas de `notebook.py` en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones suficientes para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto educativo sin certificación de calidad: la propia model card indica que no tiene validación independiente de calidad.
- Entrenado sobre Flickr8k, un dataset pequeño de captioning; el rendimiento fuera de ese dominio será limitado.
- No se han publicado benchmarks ni métricas objetivas.
- Licencia no disponible: es imprescindible revisar y respetar las licencias de los modelos base (Google ViT, HuggingFaceTB SmolLM) y de los datasets usados en el cuaderno antes de cualquier uso.
- Riesgo de alucinación y descripciones incorrectas inherente a un VLM con proyector entrenado sobre datos limitados.
- Los checkpoints de compresión son state dicts que requieren reconstruir la arquitectura exacta (baseline/estudiante/cuantizado) antes de cargarse.
- Los checkpoints de las partes 1-9 requieren el vision base congelado nombrado en la configuración del checkpoint.
- No se incluyen imágenes del dataset, claves de API ni checkpoints de optimizador.
- Idiomas limitados a inglés y coreano según metadatos; no se garantiza cobertura multilingüe amplia.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines de producción que requieran esas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/caspar/vlm-from-scratch-20261111-164819-a40-hf-publish
- Repositorio fuente del proyecto: https://github.com/nipunbatra/vlm-from-scratch
- Modelo base de visión: Google ViT (referenciado en la model card, sin enlace directo proporcionado)
- Modelo base de lenguaje: HuggingFaceTB SmolLM (referenciado en la model card, sin enlace directo proporcionado)
- Dataset: Flickr8k (referenciado en el nombre del checkpoint, sin enlace directo proporcionado)
