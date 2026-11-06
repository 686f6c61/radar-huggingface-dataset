# LibreYOLO/LibreMoGe3g-normal

## Resumen

LibreMoGe3g-normal es un modelo de estimacion de normales de superficie (surface normals) empaquetado en el formato de checkpoint de LibreYOLO. Se deriva directamente del modelo oficial MoGe-3 ViT-g/14 de Microsoft Research, publicado originalmente bajo el identificador Ruicheng/moge-3-vitg. El autor del reempaquetado es LibreYOLO, un proyecto que adapta modelos de vision a su propia libreria de inferencia.

El modelo resuelve la tarea de image-to-image de estimacion de normales de superficie a partir de una imagen RGB de entrada, produciendo un mapa de normales unitarias en el marco de OpenCV. Aunque la pipeline declarada en Hugging Face es depth-estimation, los mismos tensores del checkpoint sirven tanto para la tarea de profundidad como para la de normales, segun indica la propia model card.

Su relevancia radica en que expone un modelo de vision geometrica de gran tamano (encoder DINOv2 ViT-g/14, repositorio de 5.0 GB) bajo una licencia permisiva MIT y en un formato integrado con la libreria LibreYOLO, lo que facilita su uso en pipelines de vision 3D, reconstruccion y analisis de escenas sin depender del tooling original de MoGe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-g/14 (encoder DINOv2) para estimacion de normales y profundidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos); encoder DINOv2 subyacente Apache-2.0 de Meta AI |
| Formato de pesos | checkpoint LibreYOLO v1.0 (.pt), derivado del model.pt original |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MoGe-3 en su variante ViT-g/14, construida sobre un encoder DINOv2 de Meta AI. La tarea principal es la prediccion densa por pixel de normales de superficie, aunque los mismos tensores del checkpoint soportan tambien la tarea de estimacion de profundidad. El checkpoint reempaquetado anade unicamente metadatos de LibreYOLO v1.0 con la etiqueta de tarea `normal`, sin modificar ningun tensor de los pesos aprendidos.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO (lo cual es esperable en un modelo de vision geometrica). El entrenamiento original corresponde a Microsoft Research a traves del repositorio microsoft/MoGe, en el commit 74fbce054ebed49800de42d0ad0e83495065719a. La conversion de formato se documenta en el script weights/convert_moge3_weights.py del repositorio de LibreYOLO.

## Capacidades

- Estimacion de normales de superficie densas a partir de una imagen RGB, devolviendo un tensor (H, W, 3) de normales unitarias en marco OpenCV.
- Estimacion de profundidad (depth) usando los mismos tensores, segun la model card.
- Procesamiento de imagen a imagen (image-to-image) sin componente de texto.
- Integracion con la libreria LibreYOLO mediante la clase LibreYOLO y el metodo predict.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente visual.
- No se documentan modos especiales como thinking mode, vision-language, audio u otros.

## Casos de uso

- Reconstruccion 3D y modelado de escenas: las normales de superficie alimentan algoritmos de integracion de normales a profundidad o de fotometria estereo para generar mallas y mapas de profundidad en pipelines de vision por computador.
- Realce de iluminacion y renderizado: en motores graficos o herramientas de postproduccion, las normales permiten recalcular la iluminacion de una imagen o video sin geometria explicita.
- Preprocesado para segmentacion y deteccion: las normales sirven como caracteristica geometrica adicional en pipelines de percepcion robotica o conduccion autonoma.
- Analisis de documentos y superficies planas: la orientacion de normales ayuda a detectar planos, dobleces o deformaciones en digitalizacion de documentos y control de calidad industrial.
- Augmentacion de datos sinteticos: generar mapas de normales a partir de imagenes reales para entrenar otros modelos de vision que requieran supervision geometrica.
- Investigacion en vision geometrica: reproduccion de resultados de MoGe-3 con un checkpoint en formato LibreYOLO, util para experimentacion academica y comparativas con otros estimadores de normales.
- Integracion en pipelines de IA con LibreYOLO: al compartir el runtime de LibreYOLO, se puede encadenar con otros modelos de la libreria (por ejemplo, detectores) sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 5.0 GB, por lo que la inferencia en precision completa requiere al menos esa magnitud de memoria, mas overhead de activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del encoder ViT-g/14, es previsible que requiera GPUs de gama alta (A100, H100 o similares), aunque no se confirma.
- Cabeza en GPU de consumo: no disponible; no se documenta soporte para GPUs consumer ni cuantizaciones que lo permitan.
- Opciones de despliegue: libreria LibreYOLO (clase LibreYOLO y metodo predict). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMoGe3g-normal | no disponible (ViT-g/14, repo 5.0 GB) | no aplica | Normales de superficie / profundidad | MIT | Hugging Face (LibreYOLO) |
| MoGe-3 ViT-g/14 (Ruicheng/moge-3-vitg) | no disponible | no aplica | Profundidad y normales | MIT (pesos) | Hugging Face |
| DINOv2 ViT-g/14 (Meta AI) | no disponible | no aplica | Representaciones visuales (backbone) | Apache-2.0 | Hugging Face / Meta |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado datos de sesgos, robustez ni evaluacion cuantitativa en la informacion disponible; se desconoce el comportamiento en dominios alejados de los datos de entrenamiento originales de MoGe-3.
- Riesgo de alucinacion geometrica: como todo estimador denso, puede producir normales plausibles pero incorrectas en regiones ambiguas, oclusiones o superficies sin textura.
- Modelo puramente visual: no procesa texto ni idiomas, por lo que no aplican capacidades multilingues.
- Restricciones de licencia: los pesos se declaran MIT, pero el encoder DINOv2 subyacente esta licenciado Apache-2.0 por Meta AI; deben conservarse ambas notas (LICENSE y NOTICE) en cualquier redistribucion o uso derivado.
- El checkpoint no modifica los pesos aprendidos, pero anade metadatos de formato propietario de LibreYOLO v1.0; la interoperabilidad con otros runtimes requiere conversion.
- No se documentan cuantizaciones ni optimizaciones de inferencia; el despliegue en produccion a gran escala exigira validacion propia de latencia y memoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo, lo que aconseja pruebas exhaustivas antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreMoGe3g-normal
- Modelo fuente MoGe-3 ViT-g/14: https://huggingface.co/Ruicheng/moge-3-vitg
- Repositorio oficial MoGe (Microsoft): https://github.com/microsoft/MoGe/tree/74fbce054ebed49800de42d0ad0e83495065719a
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
