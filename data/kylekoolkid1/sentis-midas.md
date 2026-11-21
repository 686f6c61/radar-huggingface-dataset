# kylekoolkid1/sentis-MiDaS

## Resumen

sentis-MiDaS es un conjunto de modelos MiDaS convertidos a formato ONNX para su uso con Unity Sentis, el motor de inferencia de Unity 3D. MiDaS (Multimodal Depth Anything for Segmentation) es un modelo de estimacion de profundidad monocular desarrollado originalmente por el Vision Group de Intel Labs (ISL) y publicado en el repositorio isl-org/MiDaS. Esta version concreta, publicada por el usuario kylekoolkid1, no introduce cambios en la arquitectura ni en los pesos del modelo original: se limita a exportar los checkpoints a ONNX con la normalizacion de entrada integrada en el grafo.

El proposito del modelo es estimar un mapa de profundidad denso a partir de una unica imagen RGB. La relevancia de esta publicacion es practica: permite ejecutar MiDaS dentro de Unity mediante Sentis sin necesidad de infraestructura Python, lo que facilita su integracion en videojuegos, aplicaciones de realidad aumentada y herramientas de previsualizacion 3D. El repositorio ocupa 16,7 GB, lo que sugiere que contiene multiples variantes del modelo (probablemente con sufijos de tamano de entrada 256, 384 y 512) empaquetadas conjuntamente.

La model card no proporciona informacion sobre parametros, contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. La licencia declarada es MIT, heredada del proyecto MiDaS original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (MiDaS original: encoder transformer/CNN hibrido segun variante, no confirmado en esta publicacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de las variantes incluidas en este repositorio, mas alla de que son conversiones de MiDaS. El proyecto original MiDaS emplea una arquitectura encoder-decoder con un backbone de vision (redes convolucionales o transformers segun la variante, como DPT o BEiT) y una cabeza de regresion de profundidad que produce un mapa denso por pixel. El entrenamiento original de MiDaS combina multiples datasets de profundidad con diferentes escalas y tipos de anotacion (estereo, LiDAR, datos sinteticos) mediante una funcion de perdida invariante a la escala y al desplazamiento.

La unica innovacion tecnica documentada en esta publicacion es la integracion de la normalizacion de entrada dentro del grafo ONNX: el tensor de entrada `input_image` debe estar en el rango [0,1], y los tamanos de entrada son estaticos (256, 384 o 512, indicados por el sufijo del nombre del archivo). No se documentan procesos de RLHF, DPO ni fine-tuning adicional sobre los pesos originales. La conversion se realizo con un cuaderno Colab publico enlazado en la model card.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una imagen RGB.
- Generacion de mapas de profundidad por pixel con normalizacion de entrada integrada.
- Ejecucion en Unity 3D mediante el motor de inferencia Sentis.
- Soporte de tamanos de entrada estaticos de 256, 384 y 512 pixeles (segun variante).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (modelo puramente visual).
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Efectos de profundidad de campo en videojuegos Unity: el modelo genera un mapa de profundidad por fotograma que puede alimentar un shader de desenfoque selectivo, simulando una camara con apertura variable sin necesidad de renderizar un buffer de profundidad adicional.
- Reconstruccion 3D basica en tiempo de ejecucion: a partir del mapa de profundidad y la imagen RGB se puede generar una nube de puntos o un mesh simple para previsualizaciones en aplicaciones de escaneo o realidad aumentada dentro de Unity.
- Segmentacion por profundidad en herramientas de edicion: separar primer plano y fondo en una imagen capturada por el usuario para aplicar efectos de recorte o reemplazo de fondo en una app movil construida con Unity.
- Realidad aumentada con oclusion: usar el mapa de profundidad para que objetos virtuales queden ocluidos correctamente por elementos reales de la escena capturada por la camara del dispositivo.
- Previsualizacion de assets 3D: estimar la profundidad de una imagen de referencia para colocar un modelo 3D en una escena con perspectiva coherente antes de un render completo.
- Automatizacion de pipelines de arte: generar mapas de profundidad de bocetos o concept art para derivar efectos de paralaje 2.5D en menus o cinematicas dentro de Unity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 16,7 GB, lo que sugiere que contiene varias variantes del modelo; el consumo en inferencia de una sola variante no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Dado que MiDaS esta disenado para inferencia en tiempo real en dispositivos de gama media, es probable que las variantes de 256 y 384 funcionen en GPU de consumo, pero este dato no se confirma en la informacion proporcionada.
- Opciones de despliegue: Unity Sentis (unico runtime documentado). Al ser ONNX, tecnicamente podria ejecutarse con ONNX Runtime, pero no se documenta ni se soporta oficialmente en esta publicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentis-MiDaS (esta publicacion) | no disponible | no aplica | no disponible | MIT | ONNX para Unity Sentis |
| MiDaS original (isl-org) | no disponible en esta ficha | no aplica | no disponible | MIT | PyTorch via torch.hub |
| Depth Anything | no disponible en esta ficha | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas. La unica diferencia verificable frente al MiDaS original es el formato de pesos (ONNX con normalizacion integrada) y el runtime objetivo (Unity Sentis).

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo original ni del proceso de conversion.
- Riesgo de alucinacion: en modelos de profundidad monocular, las regiones ambiguas o con texturas repetitivas pueden producir estimaciones de profundidad incorrectas; no se documenta ninguna evaluacion al respecto.
- Limitacion de entrada: los tamanos de imagen son estaticos (256, 384 o 512), por lo que es necesario redimensionar la entrada y se pierde resolucion en imagenes de alta definicion.
- La normalizacion de entrada esta fijada en el grafo: pasar valores fuera del rango [0,1] producira salidas incorrectas.
- Licencia MIT: permite uso comercial y modificacion, pero se desconoce si la publicacion incluye el texto completo de la licencia o los avisos de copyright del proyecto original.
- Repositorio sin descargas ni likes y creado en 2026: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento continuo.
- No se especifica que variantes exactas de MiDaS contiene el repositorio de 16,7 GB ni si los pesos coinciden bit a bit con los checkpoints oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/kylekoolkid1/sentis-MiDaS
- Repositorio original de MiDaS: https://github.com/isl-org/MiDaS
- Paquete Unity (GitHub): https://github.com/julienkay/com.doji.midas
- Paquete Unity (OpenUPM): https://openupm.com/packages/com.doji.midas/
- Paquete Unity (Asset Store): https://assetstore.unity.com/packages/tools/ai-ml-integration/midas-monocular-depth-estimation-268501
- Documentacion: https://docs.doji-tech.com/com.doji.midas/manual/getting-started.html
- Cuaderno de exportacion a ONNX: https://github.com/julienkay/com.doji.midas/blob/v1.0.0/tools/MiDaS_ONNX_Export.ipynb
- Unity Sentis: https://unity.com/products/sentis
