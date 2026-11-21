# egolearn/babycl-resnext50-krishnacam-supcon-seed2002

## Resumen

BabyCL ResNeXt-50 SupCon sobre KrishnaCam (seed 2002) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de un backbone ResNeXt-50 entrenado con aprendizaje autosupervisado sobre el dataset egocéntrico KrishnaCam, combinando discriminación de instancias mediante NT-Xent con un objetivo de aprendizaje contrastivo supervisado a nivel de segmento global (SupCon). El modelo no es un modelo generativo ni multimodal: no dispone de codificador de texto ni produce predicciones semánticas de clases.

La relevancia del modelo es acotada y de carácter investigador: forma parte del programa BabyCL de EgoLearn, orientado al estudio de representaciones aprendidas a partir de experiencia visual egocéntrica en streaming. El checkpoint exportado corresponde al paso de optimizador 15.080 y se distribuye con pesos en safetensors, metadatos de construcción y sumas de verificación, sin estado del optimizador, búferes de replay ni transcripciones.

Con 31.965.376 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo ligero pensado para inferencia en CPU o GPU de gama baja dentro del ecosistema EgoLearn. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (CNN) con cabecera de proyección de segmento de 128 dimensiones |
| Parámetros totales | 31.965.376 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

El modelo emplea un backbone convolucional ResNeXt-50 como extractor de características visuales. Sobre él se añade una cabecera de proyección de segmento que produce embeddings de 128 dimensiones. El entrenamiento combina dos objetivos: discriminación de instancias mediante NT-Xent y aprendizaje contrastivo supervisado (SupCon) sobre identificadores de segmento globales, con temperatura 0,2 y una cabecera de proyección separada. Cada pérdida activa tiene un peso de 0,5.

El entrenamiento se realizó sobre el dataset KrishnaCam con semilla 2002, siguiendo un orden de stream concreto con replay y ocho actualizaciones remuestreadas por segmento admitido. El checkpoint exportado registra el paso de optimizador 15.080. La exportación excluye frames de entrenamiento, transcripciones, vocabulario, estado del optimizador y búferes de replay. La validación de exportación reportada por el autor confirma que todos los tensores coinciden con el checkpoint fuente, contienen valores finitos y cargan con la arquitectura registrada; una pasada forward sobre imagen sintética produce características de imagen y proyecciones de segmento finitas.

## Capacidades

- Extracción de características visuales a partir de imágenes, orientada a representaciones de escenas egocéntricas.
- Generación de proyecciones de segmento de 128 dimensiones mediante la cabecera SupCon.
- Aprendizaje autosupervisado de representaciones sin necesidad de etiquetas semánticas de objeto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación en representaciones egocéntricas: el modelo sirve como extractor de features para estudiar cómo se organizan las representaciones visuales aprendidas a partir de streams de experiencia en primera persona, aprovechando el objetivo SupCon sobre segmentos globales.
- Preentrenamiento de pipelines de visión en primera persona: sus embeddings de 128 dimensiones pueden alimentar clasificadores lineales o cabeceras ligeras en tareas posteriores sobre datasets egocéntricos, dado su bajo coste computacional (32 M de parámetros).
- Baseline en experimentos de aprendizaje autosupervisado: al estar entrenado con NT-Xent más SupCon y semilla fija (2002), resulta útil como referencia reproducible en comparaciones de objetivos contrastivos.
- Recuperación de imágenes por similitud: las características extraídas permiten construir índices de vecinos más cercanos para búsqueda visual en colecciones de imágenes egocéntricas.
- Evaluación de robustez de backbones CNN ligeros: con 0,1 GB de pesos, es adecuado para experimentos de ablación y validación cruzada de arquitecturas en entornos con recursos limitados.
- Prototipado en CPU: la carga documentada en CPU mediante `egolearn.evaluation.load_model` facilita pruebas rápidas en estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta release solo reporta validación de exportación y que las puntuaciones de benchmark no están incluidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 31,9 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 128 MB, por lo que la huella es muy reducida.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo y del repositorio (0,1 GB).
- Opciones de despliegue: carga documentada mediante `egolearn.evaluation.load_model` con Python 3.12 o superior y la extra `train` de EgoLearn; el autor documenta carga en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un extractor CNN).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (backbones autosupervisados sobre datos egocéntricos) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no predice clases semánticas de objeto; la cabecera de proyección solo genera embeddings de 128 dimensiones.
- No dispone de codificador de texto, por lo que no admite prompts ni tareas de lenguaje.
- Entrenado exclusivamente sobre KrishnaCam con una única semilla (2002); la generalización a otros dominios visuales no está documentada.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad relativa frente a alternativas.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Riesgo de sesgos derivado del dataset de entrenamiento (KrishnaCam) no caracterizado en la model card.
- El autor recomienda registrar el commit del repositorio al usar los pesos en experimentos, dada la ausencia de versionado semántico.
- La fecha de creación indicada (2026-11-20) es posterior a la fecha actual, lo que conviene tener en cuenta al citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-supcon-seed2002
- Organización EgoLearn: https://huggingface.co/egolearn
