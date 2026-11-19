# Podtyazhki1337/cytonucs

## Resumen

CytoNucs es un conjunto de modelos preentrenados para segmentación de instancias anidadas en imágenes biomédicas. Lo desarrolla el usuario Podtyazhki1337 y se distribuye a través de Hugging Face con el identificador `Podtyazhki1337/cytonucs`. El modelo resuelve un problema específico: la segmentación simultánea de objetos biológicos que contienen a otros objetos (por ejemplo, núcleos dentro de células, o nucléolos dentro de núcleos), asignando una máscara de instancia a cada objeto de cada nivel y estableciendo una relación de parentesco entre objetos hijos y padres.

La implementación se basa en StarDist, una arquitectura de segmentación de instancias basada en rayos (star-convex polygons), combinada con un mecanismo de refinamiento de máscaras guiado por prompts. El repositorio incluye cinco modelos preentrenados que cubren dominios 2D (microscopía de fluorescencia de tejidos, células HeLa, imágenes de la colección BBBC020) y 3D (volúmenes de TC de riñón del dataset KiTS23 y volúmenes sintéticos de tres niveles).

El modelo es relevante porque aborda la segmentación jerárquica multi-nivel, una tarea que la mayoría de modelos de segmentación convencionales no cubren de forma nativa. Los pesos se publican bajo una licencia específica (`cytonucs-weights`) limitada a uso de investigación, y los modelos entrenados con datasets no comerciales heredan esas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StarDist con refinamiento de máscaras guiado por prompts (segmentación de instancias basada en rayos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato TensorFlow `.weights.h5`) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | `cytonucs-weights` (uso de investigación); los modelos entrenados con datos no comerciales heredan sus términos |
| Formato de pesos | TensorFlow Keras `.weights.h5` |
| Framework | TensorFlow |
| Pipeline | `image-segmentation` |
| Tamaño del repositorio | 1.6 GB |
| Modalidad de entrada | 2D RGB (microscopía) y 3D RGB (volúmenes de TC y sintéticos) |

## Arquitectura y entrenamiento

La arquitectura se apoya en StarDist, un enfoque de segmentación de instancias que representa cada objeto mediante un polígono estrellado definido por un conjunto de rayos desde el centro del objeto. CytoNucs extiende este esquema a segmentación anidada multi-nivel: cada objeto de cada nivel recibe una máscara de instancia y se registra la relación padre-hijo entre niveles. El modelo incorpora además un mecanismo de refinamiento de máscaras guiado por prompts, aunque la model card no detalla su implementación interna.

El repositorio contiene cinco variantes entrenadas con recetas distintas (identificadas como `e7` y `e8`), cada una con su firma de arquitectura, un archivo `geometry.json` con los conjuntos de rayos, rejillas y ajustes de datos medidos al inicio del entrenamiento, y un `config.json` con la configuración usada para obtener las puntuaciones publicadas. Los datos de entrenamiento varían por variante: TissueNet v1.1 (núcleo y célula, 2D), HeLaCytoNuc (núcleo y célula, 2D), BBBC020 (núcleo y célula, 2D), KiTS23 (masa y riñón, 3D) y volúmenes sintéticos de tres niveles (nucléolo, núcleo y célula, 3D). No se especifica el número de tokens ni el volumen total de datos de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Segmentación de instancias anidadas multi-nivel: genera una máscara por objeto en cada nivel jerárquico (por ejemplo, núcleo y célula, o nucléolo, núcleo y célula).
- Vinculación padre-hijo: cada objeto del nivel más interno queda asociado a su objeto contenedor mediante un archivo JSON de parents.
- Segmentación 2D sobre imágenes RGB de microscopía con canales específicos por dataset (tinción nuclear en verde y de membrana en azul en TissueNet; citoplasma en rojo y núcleos en azul en HeLaCytoNuc; CD11b en rojo y DAPI en azul en BBBC020).
- Segmentación 3D sobre volúmenes de TC con reescalado a vóxeles de 3 x 0,78 x 0,78 mm (KiTS23) y sobre volúmenes sintéticos de tres niveles.
- Normalización automática de imágenes a los percentiles 1 y 99,8 y tileado automático cuando la imagen excede el tamaño de entrada.
- Refinamiento de máscaras guiado por prompts.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión especializado.

## Casos de uso

- Análisis de citología y histología en investigación: el modelo `tissuenet_e7_b32` segmenta simultáneamente núcleos y células en imágenes de microscopía de fluorescencia, permitiendo cuantificar la relación núcleo-citoplasma por célula en estudios de tejidos.
- Cuantificación de la morfología nuclear en líneas celulares: `helacytonuc_e7_clean` genera máscaras de núcleo y célula en imágenes de células HeLa, útil para experimentos de cribado fenotípico donde se necesita medir área, forma y textura nuclear.
- Análisis de imágenes de la colección BBBC020: el modelo `bbbc020_e7` procesa la imagen fusionada (CD11b en rojo, DAPI en azul) a resolución nativa, adecuado para estudios de células inmunitarias en el repositorio Broad Bioimage Benchmark.
- Segmentación de tumores y riñón en TC abdominal: `kits_e8` identifica masa tumoral o quística y riñón en volúmenes de TC preprocesados a 3 x 0,78 x 0,78 mm, útil como paso previo a la volumetría tumoral en investigación oncológica.
- Segmentación jerárquica en volúmenes sintéticos de tres niveles: `h3l_syn` sirve como banco de pruebas para validar pipelines de segmentación anidada (nucléolo, núcleo y célula) antes de aplicarlos a datos reales.
- Investigación en métodos de segmentación anidada: el repositorio incluye configuraciones, geometrías y puntuaciones por semilla, lo que permite reproducir experimentos y comparar variantes de la arquitectura StarDist extendida.
- Preprocesamiento para pipelines de análisis de imagen biomédica: las máscaras y los archivos de parents pueden alimentar herramientas posteriores de seguimiento, clasificación o análisis morfológico.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 0 de cada receta). Las métricas son AP del nivel interno, AP del nivel externo y JTPR de objetos vinculados.

| Modelo | Dataset | AP interno | AP externo | JTPR vinculado |
|---|---|---|---|---|
| `tissuenet_e7_b32` | TissueNet v1.1 (test) | 0,652 | 0,534 | 0,886 |
| `tissuenet_e7_b32` | TissueNet v1.1 (held-out) | 0,580 | 0,472 | 0,853 |
| `helacytonuc_e7_clean` | HeLaCytoNuc hand-drawn (test) | 0,493 | 0,324 | 0,736 |
| `helacytonuc_e7_clean` | HeLaCytoNuc CellProfiler (test) | 0,698 | 0,424 | 0,838 |
| `bbbc020_e7` | BBBC020 (test) | 0,525 | 0,464 | 0,923 |
| `kits_e8` | KiTS23 (test) | 0,166 | 0,838 | 0,621 |
| `h3l_syn` | Sintético 3 niveles (test) | 0,171 (nucléolo) / 0,539 (núcleo) | 0,596 (célula) | 0,553 (nucléolo-núcleo) / 0,838 (núcleo-célula) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. El repositorio ocupa 1,6 GB e incluye cinco conjuntos de pesos, por lo que cada variante individual es sustancialmente menor.
- GPU recomendadas: no especificadas. Al estar implementado en TensorFlow, puede ejecutarse en GPU NVIDIA con CUDA o en CPU.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de segmentación de tamaño moderado, es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: inferencia mediante el script `predict.py` del repositorio de GitHub (requiere `requirements.txt`), con descarga de pesos vía `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Niveles anidados | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CytoNucs | StarDist + refinamiento por prompts | Sí (2 y 3 niveles) | 2D y 3D | `cytonucs-weights` (investigación) | Hugging Face + GitHub |
| StarDist original | Segmentación de instancias por rayos | No | 2D y 3D | BSD-3 (código) | GitHub |
| Cellpose | Segmentación de instancias con redes generalistas | No (segmentación por tipo celular) | 2D y 3D | BSD-3 (código) | GitHub |
| Mask R-CNN | Detección y segmentación de instancias | No | 2D | Apache 2.0 / MIT (implementaciones) | Múltiples repositorios |

La comparativa se limita a nivel conceptual: no se dispone de resultados de benchmarks cruzados entre CytoNucs y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se distribuyen bajo `cytonucs-weights` para uso de investigación. Los modelos entrenados con datos no comerciales heredan sus términos: TissueNet (Apache 2.0 modificada, no comercial) y KiTS23 (CC BY-NC-SA 4.0). El uso comercial requiere revisión legal caso por caso.
- Requisitos estrictos de entrada: cada modelo espera canales específicos y, en 3D, un tamaño de vóxel concreto (3 x 0,78 x 0,78 mm para KiTS23). Usar imágenes con canales o resoluciones distintas degrada el rendimiento sin aviso.
- Rendimiento desigual entre niveles: el AP del nivel interno es bajo en varios modelos (`kits_e8` con 0,166 y `h3l_syn` con 0,171 para el nivel más interno), lo que limita su uso en tareas que dependan de la detección precisa de objetos pequeños o internos.
- Sin datos de sesgo publicados: la model card no documenta sesgos por tipo de tejido, modalidad de microscopía o población celular.
- Riesgo de falsos positivos y negativos en imágenes fuera de distribución: no se han publicado evaluaciones de robustez ante cambios de tinción, iluminación o protocolo de adquisición.
- Modelo de visión sin capacidades de texto: no procesa lenguaje natural ni soporta tool calling, por lo que no es adecuado para tareas de razonamiento o agentes.
- Paper en preparación: la descripción técnica completa y la cita académica aún no están disponibles, lo que dificulta la reproducibilidad independiente.
- Sin métricas de latencia ni requisitos de hardware documentados: la planificación de despliegue en producción requiere caracterización empírica propia.

## Enlaces

- Hugging Face: https://huggingface.co/Podtyazhki1337/cytonucs
- Repositorio de código, entrenamiento y evaluación: https://github.com/podtyazhki1337/Cyto-Nucs-Stardist-2D-3D
- StarDist (arquitectura base): https://github.com/stardist/stardist
- Dataset HeLaCytoNuc (De et al., RODARE 2024): https://doi.org/10.14278/rodare.3001
- Broad Bioimage Benchmark Collection (BBBC020): https://bbbc.broadinstitute.org/BBBC020
