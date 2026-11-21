# egolearn/babycl-resnext50-walkingtours-supcon-seed2002

## Resumen

BabyCL SupCon on WalkingTours (seed 2002) es un modelo de extraccion de caracteristicas visuales desarrollado por la organizacion EgoLearn, orientado a la investigacion sobre representaciones aprendidas a partir de experiencia visual egocentrica. Se trata de un ResNeXt-50 entrenado con aprendizaje autosupervisado combinando discriminacion de instancias NT-Xent y aprendizaje contrastivo supervisado (SupCon) a nivel de segmento global. El modelo no es un modelo generativo ni linguistico: produce representaciones de imagen y proyecciones de segmento de 128 dimensiones.

El modelo se enmarca en la linea BabyCL de EgoLearn, que estudia como se forman representaciones visuales a partir de flujos de video en primera persona (egocentric video). El checkpoint exportado corresponde a una ejecucion concreta sobre el conjunto de datos WalkingTours con semilla 2002, e incluye unicamente los pesos y los metadatos de construccion necesarios para cargarlo mediante la libreria EgoLearn.

Su relevancia es acotada y experimental: no se publican resultados de benchmarks, la model card solo documenta la validacion de la exportacion (tensores finitos, coincidencia con el checkpoint de origen y forward pass correcto sobre una imagen sintetica). Es un artefacto de investigacion reproducible, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-50 (red neuronal convolucional) con cabeza de proyeccion de segmento |
| Parametros totales | 31.965.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (export en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (no dispone de codificador de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (acompanado de model.json y checksums.sha256) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional ResNeXt-50 con unos 32 millones de parametros, adaptada para extraccion de caracteristicas visuales. Sobre el backbone se anade una cabeza de proyeccion de segmento que genera embeddings de 128 dimensiones. El entrenamiento combina dos objetivos autosupervisados: discriminacion de instancias mediante la perdida NT-Xent y aprendizaje contrastivo supervisado (SupCon) usando identificadores globales de segmento, con temperatura 0.2 y una cabeza de proyeccion separada. Cada perdida activa tiene un peso de 0.5.

El entrenamiento se realizo sobre el conjunto WalkingTours con semilla 2002, siguiendo un orden de stream seleccionado, con mecanismo de replay y ocho actualizaciones remuestreadas por cada segmento admitido. La ejecucion completa el stream seleccionado y el checkpoint guardado registra el paso de optimizador 3.616. El export excluye fotogramas de entrenamiento, transcripciones, vocabulario, estado del optimizador y buffers de replay; solo se incluyen los tensores del modelo, los metadatos de construccion y los digests SHA-256. El SHA-256 del checkpoint de origen es `ac1048f53992d578d3380cedc9890752fbcf520ad938f9682a8346d9b22331b7`.

## Capacidades

- Extraccion de caracteristicas de imagen: genera representaciones densas a partir de una imagen de entrada.
- Proyeccion de segmento: produce embeddings de 128 dimensiones por segmento mediante una cabeza dedicada.
- Aprendizaje autosupervisado: las representaciones se obtuvieron sin etiquetas semanticas, combinando NT-Xent y SupCon.
- Sin capacidades generativas: no genera texto, codigo ni imagenes.
- Sin codificador de texto: no procesa lenguaje natural ni soporta instrucciones.
- Sin tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no aplica).
- Sin modo thinking, vision generativa ni audio.

## Casos de uso

- Investigacion en representaciones visuales egocentricas: el modelo sirve como extractor de caracteristicas congelado para analizar que informacion captura un backbone entrenado con SupCon sobre video en primera persona, comparando con otras semillas de la misma familia BabyCL.
- Experimentos de aprendizaje contrastivo reproducible: al fijar la semilla 2002 y documentar el paso de optimizador, permite replicar condiciones y comparar el efecto de la semilla en las representaciones resultantes.
- Baseline para evaluacion de transferencia lineal: las caracteristicas de imagen pueden alimentar un clasificador lineal sobre un dataset etiquetado para medir la calidad de las representaciones, siempre que se documente la revision inmutable del repositorio.
- Estudio de embeddings de segmento: la proyeccion de 128 dimensiones permite analizar la estructura del espacio latente a nivel de segmento (agrupamientos, separabilidad) en tareas de investigacion.
- Preprocesado en pipelines de vision por computador: como extractor de caracteristicas en fases de prototipado donde se requiera un modelo pequeno (32 M de parametros, repositorio de 0,1 GB) y ligero para ejecutar en CPU.
- Reproduccion de experimentos de la linea BabyCL: el export incluye checksums y metadatos de procedencia, lo que facilita auditar y comparar resultados entre ejecuciones del mismo estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que solo se documenta la validacion de la exportacion: todos los tensores exportados coinciden con el checkpoint de origen, contienen valores finitos y cargan con la arquitectura registrada; un forward pass sobre una imagen sintetica produce caracteristicas de imagen y proyecciones de segmento finitas. No se incluyen puntuaciones de benchmarks en esta version.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (32 M de parametros); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, y tambien en CPU.
- Opciones de despliegue: la model card solo documenta la carga mediante la libreria EgoLearn (`load_model` de `egolearn.evaluation`) con Python 3.12 o superior y la extra `train`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo ni linguistico: no procesa texto, no responde instrucciones y no soporta tool calling.
- La cabeza de proyeccion de segmento no predice clases semanticas de objetos; solo produce embeddings de 128 dimensiones.
- No se han publicado benchmarks ni evaluaciones de calidad de las representaciones; la unica validacion documentada es la integridad de la exportacion.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Entrenado sobre un unico conjunto (WalkingTours) y una unica semilla (2002), lo que limita la generalizacion a otros dominios visuales.
- Riesgo de sesgo heredado de los datos de entrenamiento egocentricos, no cuantificado en la informacion disponible.
- Requiere Python 3.12 o superior y la libreria EgoLearn con la extra `train`; no es cargable con frameworks estandar como transformers sin adaptacion.
- El export excluye estado del optimizador y buffers de replay, por lo que no permite reanudar el entrenamiento tal cual.
- Se recomienda registrar el commit del repositorio al usar los pesos en experimentos, tal como indica el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egolearn/babycl-resnext50-walkingtours-supcon-seed2002
- Organizacion EgoLearn en Hugging Face: https://huggingface.co/egolearn
