# egolearn/babycl-resnext50-walkingtours-supcon-seed1337

## Resumen

BabyCL SupCon on WalkingTours (seed 1337) es un codificador visual basado en ResNeXt-50 publicado por la organización EgoLearn en Hugging Face. No es un modelo generativo ni un modelo de lenguaje: es un extractor de características de imagen entrenado con aprendizaje autosupervisado sobre vídeo egocéntrico del conjunto WalkingTours. Su propósito es producir representaciones visuales (features de imagen y proyecciones de segmento de 128 dimensiones) que sirvan como base para investigación sobre representaciones aprendidas a partir de experiencia visual en primera persona.

El modelo se enmarca dentro de la familia BabyCL, que explora el aprendizaje de representaciones a partir de flujos de experiencia visual con un presupuesto limitado, inspirado en el aprendizaje infantil. Combina discriminación de instancias con NT-Xent y aprendizaje contrastivo supervisado (SupCon) a nivel de segmento global. El checkpoint exportado corresponde al paso de optimizador 3.616 y se distribuye únicamente con pesos y metadatos de construcción, sin estado del optimizador ni búferes de replay.

Es relevante ahora como pieza reproducible de investigación: el repositorio fija la semilla (1337), el orden del flujo de entrenamiento y los digests SHA-256 de los artefactos, lo que permite replicar experimentos. No obstante, es un artefacto de investigación de nicho, con cero descargas y sin benchmarks publicados, por lo que no está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (red neuronal convolucional) con cabeza de proyección de segmento |
| Parametros totales | 31.965.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (export en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (más model.json y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-50 convolucional que actúa como codificador de imagen, acompañada de una cabeza de proyección separada para segmentos que produce embeddings de 128 dimensiones. El modelo no incluye codificador de texto ni cabeza de clasificación semántica: la salida son representaciones densas, no predicciones de clases de objetos.

El entrenamiento se realizó sobre el conjunto WalkingTours con semilla 1337, siguiendo el orden de flujo seleccionado, con replay y ocho actualizaciones remuestreadas por cada segmento admitido. El objetivo combina NT-Xent para discriminación de instancias y SupCon a nivel de segmento global con temperatura 0,2; cada pérdida activa tiene peso 0,5. El checkpoint guardado corresponde al paso de optimizador 3.616. La exportación excluye fotogramas de entrenamiento, transcripciones, vocabulario, estado del optimizador y búferes de replay; se conserva el SHA-256 del checkpoint fuente (`02e256bbd4cc5fc3d54e3ae60699e77ad7df4823527ebb98d666ad915350ea57`).

## Capacidades

- Extracción de características de imagen (pipeline `feature-extraction`).
- Generación de proyecciones de segmento de 128 dimensiones mediante la cabeza SupCon.
- Aprendizaje de representaciones visuales autosupervisado (NT-Xent + SupCon).
- Procesamiento de fotogramas de vídeo egocéntrico (WalkingTours).
- Carga en CPU mediante la librería EgoLearn (`load_model` con `device="cpu"`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, matemáticas ni capacidades multilingües.
- No incluye codificador de texto, visión-lenguaje, audio ni modo de razonamiento.

## Casos de uso

- Investigación en aprendizaje autosupervisado: usar el modelo como línea base reproducible (semilla 1337, paso 3.616) para comparar objetivos contrastivos en representaciones visuales egocéntricas.
- Extracción de features para clasificación lineal posterior: congelar el codificador y entrenar un clasificador ligero sobre las representaciones para tareas de visión en primera persona.
- Estudio de representaciones de segmento: analizar los embeddings de 128 dimensiones de la cabeza SupCon para evaluar la estructura del espacio latente a nivel de segmento.
- Reproducibilidad experimental: fijar el commit del repositorio y verificar los digests SHA-256 para garantizar que los resultados son trazables.
- Evaluación comparativa de objetivos de entrenamiento: contrastar NT-Xent frente a SupCon a nivel de segmento dentro del marco BabyCL.
- Prototipado de pipelines de visión egocéntrica: integrar el extractor en flujos de investigación que necesiten representaciones de fotogramas sin dependencia de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que solo se reporta validación de exportación (tensores finitos, coincidencia con el checkpoint fuente y carga correcta de la arquitectura) y que las puntuaciones de benchmark no se incluyen en esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 31,97 millones de parámetros, en FP32 los pesos ocupan aproximadamente 128 MB, por lo que la huella es muy reducida.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con al menos unos pocos GB de VRAM es suficiente para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) e incluso en CPU, ya que la carga documentada es en CPU.
- Opciones de despliegue: la model card documenta exclusivamente la carga mediante la librería EgoLearn (`load_model`) con Python 3.12 o superior y el extra `train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BabyCL ResNeXt-50 WalkingTours SupCon (seed 1337) | 31.965.376 | no aplica | Extracción de features visuales | no disponible | Hugging Face, 0 descargas |
| Otras variantes BabyCL de EgoLearn | no disponible | no aplica | Extracción de features visuales | no disponible | Colección de la organización EgoLearn |
| Otros codificadores ResNeXt-50 autosupervisados | no disponible | no aplica | Extracción de features visuales | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de codificador de texto y no puede generar texto ni responder a instrucciones.
- La cabeza de proyección de segmento no predice clases semánticas de objetos; solo produce embeddings de 128 dimensiones.
- No se han publicado benchmarks, por lo que se desconoce su calidad representacional frente a alternativas.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; debe tratarse como restringido hasta verificación.
- El modelo está entrenado sobre un único conjunto (WalkingTours) y un único orden de flujo con semilla 1337, lo que limita la generalización a otros dominios visuales.
- Riesgo de sesgos derivado de los datos de entrenamiento egocéntrico, no documentado por el autor.
- Artefacto de investigación con cero descargas y sin validación externa; no apto para producción sin evaluación previa.
- La exportación excluye estado del optimizador y búferes de replay, por lo que no permite reanudar el entrenamiento tal cual.
- Requiere Python 3.12 o superior y la librería EgoLearn con el extra `train` para la carga documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-walkingtours-supcon-seed1337
- Organización EgoLearn: https://huggingface.co/egolearn
