# egolearn/babycl-resnext50-krishnacam-supcon-seed3003

## Resumen

BabyCL SupCon sobre KrishnaCam (seed 3003) es un modelo de extracción de características visuales desarrollado por la organización EgoLearn. Se trata de un ResNeXt-50 entrenado con aprendizaje autosupervisado sobre el conjunto de datos KrishnaCam, siguiendo un paradigma de aprendizaje continuo por streaming ("BabyCL"). El objetivo no es la clasificación semántica, sino aprender representaciones de imagen útiles para investigación sobre percepción visual egocéntrica.

El modelo combina dos objetivos de aprendizaje contrastivo: discriminación de instancias NT-Xent y aprendizaje contrastivo supervisado (SupCon) a nivel de segmento global. La exportación incluye únicamente los pesos del codificador y la cabeza de proyección de segmento (128 dimensiones), junto con metadatos de construcción y procedencia. No incorpora cabecera de clasificación ni codificador de texto.

Es relevante para la comunidad investigadora que trabaja en representaciones visuales autosupervisadas y aprendizaje continuo, ya que documenta un entrenamiento reproducible (semilla fija, número de paso del optimizador registrado) sobre un flujo de datos con replay. El repositorio es pequeño (0,1 GB) y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (CNN) con cabeza de proyección de segmento |
| Parametros totales | 31.965.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con model.json y checksums.sha256) |

## Arquitectura y entrenamiento

El modelo es una red convolucional ResNeXt-50 que actúa como codificador de imagen. Sobre las características globales se aplica una cabeza de proyección de segmento que produce embeddings de 128 dimensiones. El entrenamiento es autosupervisado y combina dos pérdidas contrastivas: NT-Xent para discriminación de instancias y SupCon (supervised contrastive) usando identificadores globales de segmento, con temperatura 0,2. Cada pérdida activa tiene un peso de 0,5.

El entrenamiento se realizó sobre KrishnaCam con semilla 3003, siguiendo un orden de flujo ("stream order") con replay y ocho actualizaciones remuestreadas por segmento admitido. El checkpoint guardado corresponde al paso de optimizador 15.072. La exportación excluye fotogramas de entrenamiento, transcripciones, vocabulario, estado del optimizador y buffers de replay. La validación de exportación confirma que todos los tensores coinciden con el checkpoint fuente, contienen valores finitos y cargan con la arquitectura registrada; una pasada forward con imagen sintética produce características y proyecciones finitas.

## Capacidades

- Extracción de características de imagen (feature extraction) mediante el codificador ResNeXt-50.
- Generación de embeddings de segmento de 128 dimensiones mediante la cabeza de proyección.
- Representaciones autosupervisadas entrenadas con NT-Xent y SupCon sobre datos egocéntricos.
- Carga en CPU mediante la librería EgoLearn (`load_model`).
- No dispone de codificador de texto ni de cabecera de clasificación semántica.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (modelo puramente visual).

## Casos de uso

- Investigación en representaciones visuales autosupervisadas: el modelo sirve como codificador congelado para extraer características de imágenes egocéntricas y analizar la calidad de las representaciones aprendidas por streaming.
- Estudios de aprendizaje continuo: al registrar semilla (3003) y paso de optimizador (15.072), permite reproducir y comparar experimentos de aprendizaje por flujo con replay.
- Recuperación de imágenes por similitud: los embeddings de 128 dimensiones de la cabeza de proyección pueden usarse para búsqueda de vecinos cercanos en colecciones de imágenes de KrishnaCam.
- Evaluación de objetivos contrastivos: útil para comparar NT-Xent frente a SupCon en la misma arquitectura y conjunto de datos.
- Preentrenamiento como inicialización: las características del codificador pueden servir de punto de partida para tareas posteriores con ajuste fino supervisado.
- Análisis de datos egocéntricos: extracción de características para estudiar patrones visuales en grabaciones en primera persona de KrishnaCam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta versión solo reporta validación de exportación y que no incluye puntuaciones de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 31.965.376 parámetros (aproximadamente 32 M). En precisión FP32 ocupa unos 128 MB; en FP16 unos 64 MB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- Opciones de despliegue: la model card documenta carga mediante la librería EgoLearn (`load_model`) en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BabyCL ResNeXt-50 SupCon (este) | ResNeXt-50 + cabeza de proyección | 31,9 M | no aplica | no disponible | Autosupervisado, egocéntrico, streaming |
| ResNet-50 (ImageNet) | ResNet-50 | ~25,6 M | no aplica | varía según checkpoint | Referencia clásica de visión; no comparable en objetivo |
| Otras variantes BabyCL de EgoLearn | ResNeXt-50 | ~32 M | no aplica | no disponible | Misma familia, distintas semillas u objetivos |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo no predice clases semánticas de objetos; la cabeza de proyección solo genera embeddings de segmento.
- No incluye codificador de texto ni capacidades lingüísticas.
- No se han publicado benchmarks, por lo que no se puede evaluar su calidad frente a alternativas.
- La licencia no está especificada, lo que impide determinar las condiciones de uso comercial.
- Entrenado sobre un único conjunto de datos (KrishnaCam) con una semilla concreta; puede presentar sesgos propios de ese corpus y escasa generalización a otros dominios.
- Riesgo de alucinación no aplica en sentido textual, pero las representaciones pueden no ser fiables fuera de la distribución de entrenamiento.
- La exportación excluye estado del optimizador y buffers de replay, por lo que no permite reanudar el entrenamiento tal cual.
- Se recomienda registrar el commit del repositorio al usar los pesos en experimentos, tal como indica el autor.

## Enlaces

- Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-krishnacam-supcon-seed3003
- Organización EgoLearn: https://huggingface.co/egolearn
