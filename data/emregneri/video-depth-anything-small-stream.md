# EmreGneri/video-depth-anything-small-stream

## Resumen

Video Depth Anything Small, exportación ONNX en modo streaming (154x266), es una conversión del checkpoint `video_depth_anything_vits.pth` del proyecto Video Depth Anything de DepthAnything, preparada por el usuario EmreGneri para su uso en aplicaciones de vídeo dentro del navegador. No se trata de un modelo nuevo ni reentrenado: el autor ha reexportado los pesos originales a ONNX con una entrada de resolución fija de 154x266, ha dividido la inferencia en tres grafos (`encoder`, `bootstrap` y `stream`) con una caché temporal de 31 fotogramas y ha convertido los tensores a fp16. El resultado es un artefacto de muy bajo peso (el repositorio completo ocupa 0,1 GB) pensado para estimación de profundidad densa y temporalmente estable en vídeo.

El problema que resuelve es la inconsistencia temporal de los estimadores de profundidad por fotograma: al procesar vídeo, un modelo monocular produce parpadeos y cambios de escala entre fotogramas consecutivos, lo que arruina efectos como desenfoque de fondo, relighting o compositing. La caché temporal de 31 fotogramas mitiga ese problema propagando información entre fotogramas. El consumidor previsto es el proyecto Spatial-Canvas del mismo autor, que ejecuta el modelo en el navegador mediante ONNX Runtime.

Su relevancia ahora es de nicho pero concreta: es una de las pocas distribuciones ONNX en streaming de un modelo de profundidad para vídeo con licencia Apache-2.0, lo que permite uso comercial sin las restricciones CC-BY-NC que afectan a las variantes Base y Large del mismo proyecto. Conviene señalar que el repositorio no tiene descargas ni valoraciones y que la documentación se limita a la model card y al `export-manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estimación de profundidad para vídeo (variante Small, según el checkpoint `video_depth_anything_vits.pth`), con caché temporal de 31 fotogramas y grafo dividido en `encoder`, `bootstrap` y `stream` |
| Parametros totales | no disponible (no se declara en la model card; el repositorio completo ocupa 0,1 GB en fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: ventana temporal de 31 fotogramas con entrada de resolución fija 154x266 |
| Tipos de cuantizacion | fp16 (exportación ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible; no aplica (modelo de visión, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX en fp16 (tres grafos); los pesos originales en PyTorch (`.pth`) residen en el repositorio upstream |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Video Depth Anything, un estimador de profundidad monocular extendido a vídeo. El autor no aporta detalles internos más allá de la topología de inferencia: un grafo `encoder` que extrae características por fotograma, un grafo `bootstrap` que inicializa la caché temporal y un grafo `stream` que procesa cada fotograma nuevo reutilizando los 31 fotogramas previos. La entrada está fijada a 154x266 píxeles y los tensores se convierten a fp16. Según el nombre del checkpoint (`vits`), el codificador corresponde a la variante Small de la familia, aunque la model card no publica el recuento de parámetros ni la configuración de capas y dimensiones.

No hubo reentrenamiento ni ajuste fino: la model card lo indica explícitamente ("No retraining"). Los datos de entrenamiento, el número de tokens o fotogramas vistos, la composición del dataset y el uso de RLHF/DPO no se detallan y corresponden al proyecto upstream. La innovación técnica del artefacto es de ingeniería de despliegue, no de modelado: la partición en tres grafos permite mantener el estado temporal entre invocaciones sucesivas (necesario para streaming fotograma a fotograma), algo imposible con una exportación ONNX monolítica de un modelo de vídeo. El `export-manifest.json` documenta las formas de los tensores, el sha256 del checkpoint y las comprobaciones de paridad entre PyTorch y ONNX, aunque los valores numéricos de esas comprobaciones no se reproducen en la información disponible.

## Capacidades

- Estimación de profundidad densa por píxel sobre secuencias de vídeo, con coherencia temporal gracias a la caché de 31 fotogramas.
- Inferencia en modo streaming: procesa un fotograma cada vez, arrastrando el estado temporal entre llamadas, lo que permite latencia constante en lugar de esperar a la secuencia completa.
- Ejecución en navegador mediante ONNX Runtime (caso de uso declarado: el proyecto Spatial-Canvas).
- Entrada de imagen fija a 154x266 píxeles; cualquier resolución distinta requiere remuestreo previo por parte del consumidor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No procesa texto, audio ni entrada multimodal; su única salida es un mapa de profundidad.
- No se documentan capacidades multilingües por no existir entrada ni salida en lenguaje natural.
- No se documenta un modo de razonamiento extendido ni variantes "thinking".

## Casos de uso

- Desenfoque de fondo y efectos bokeh en videollamadas o webinars dentro del navegador: la máscara de profundidad por fotograma permite separar figura y fondo en tiempo real, y la caché de 31 fotogramas evita el parpadeo del contorno que aparece al aplicar un estimador monocular fotograma a fotograma.
- Postproducción y compositing: generar mapas de profundidad de un plano para insertar elementos 3D, aplicar niebla de profundidad o hacer relighting selectivo, aprovechando la estabilidad temporal para que los bordes no vibren entre fotogramas.
- Rotoscopia asistida: usar el mapa de profundidad como guía para separar sujeto y fondo en herramientas de edición, reduciendo el trabajo manual en planos con cámara en movimiento lento.
- Procesamiento de vídeo en el cliente sin subir datos a un servidor: al ejecutarse con ONNX Runtime en el navegador, es adecuado para aplicaciones con requisitos de privacidad (vídeo médico, contenido personal) donde el envío de fotogramas a la nube no es aceptable.
- Efectos de realidad aumentada en web: ubicar objetos virtuales a distintas profundidades en una escena capturada por la cámara del dispositivo, con una latencia manejable gracias al modo streaming.
- Generación de datasets de profundidad a partir de vídeo grabado: preprocesar grandes volúmenes de clips para entrenar o evaluar otros modelos, con la ventaja de que la licencia Apache-2.0 permite usar el resultado en productos comerciales.
- Navegación y percepción en robótica de bajo consumo o dispositivos embebidos: el tamaño reducido del artefacto (0,1 GB de repositorio) permite desplegarlo en hardware modesto para evitar obstáculos, siempre que se acepte precisión de variante Small y profundidad relativa.
- Análisis de accesibilidad y descripción automática de escenas: alimentar un pipeline posterior que consuma el mapa de profundidad para generar descripciones o medir distancias aproximadas entre elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que el `export-manifest.json` contiene "comprobaciones de paridad" entre la implementación PyTorch y la exportación ONNX, sin incluir cifras de error de profundidad (AbsRel, RMSE), métricas de consistencia temporal ni latencias medidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir del tamaño del repositorio (0,1 GB en fp16), los pesos ocupan del orden de decenas de megabytes; con activaciones y la caché de 31 fotogramas a 154x266 el consumo debería mantenerse en el rango de cientos de megabytes a 1-2 GB, pero es una estimación, no un dato publicado.
- GPU recomendadas: no disponibles. Al ser un modelo ligero, cualquier GPU con soporte de los execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, WebGPU) es candidata; no se documenta ningún modelo concreto (A100, H100, RTX 4090) ni pruebas realizadas.
- GPU de consumo: por tamaño, es previsible que quepa en GPUs de consumo e incluso en GPUs integradas, pero no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime (obligatorio, es el formato del artefacto) y ONNX Runtime Web para navegador, que es el caso de uso declarado. Otros runtimes (vLLM, TGI, llama.cpp, Ollama) no aplican a un modelo de visión de este tipo y no están documentados.
- Latencia y throughput: no disponibles. Al usar una resolución de entrada muy baja y fp16, la latencia por fotograma debería ser baja, pero el autor no publica milisegundos por fotograma ni FPS en ningún backend.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / ventana temporal | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Video Depth Anything Small (esta ficha) | no disponible (variante Small) | 154x266 fija, caché de 31 fotogramas | Apache-2.0 | ONNX fp16 en streaming | HuggingFace, 0 descargas |
| Video Depth Anything Base | no disponible | no disponible en la información | CC-BY-NC | PyTorch (upstream) | HuggingFace `depth-anything/Video-Depth-Anything-Base` (según la model card) |
| Video Depth Anything Large | no disponible | no disponible en la información | CC-BY-NC | PyTorch (upstream) | HuggingFace `depth-anything/Video-Depth-Anything-Large` (según la model card) |
| Depth Anything V2 (estimador monocular, upstream de la familia) | no disponible | imagen única, sin caché temporal | Apache-2.0 en variantes Small, según upstream | PyTorch / ONNX | HuggingFace |

La diferencia práctica más relevante frente a Base y Large no es la precisión, que no se puede comparar con los datos disponibles, sino la licencia: solo la variante Small es Apache-2.0, y el autor lo destaca explícitamente porque Base y Large son CC-BY-NC y quedan excluidas de este artefacto.

## Limitaciones y advertencias

- Resolución de entrada fija de 154x266: cualquier vídeo debe redimensionarse antes de la inferencia, lo que degrada la precisión en escenas con detalles finos y añade un paso de preprocesado que el consumidor debe implementar.
- Ventana temporal limitada a 31 fotogramas: en planos largos, la coherencia depende de cómo se gestione el estado entre ventanas; el autor no documenta la política de reinicio ni el comportamiento en cortes de escena.
- Profundidad relativa, no métrica: la familia de modelos a la que pertenece produce mapas de profundidad afines o relativos; no debe usarse para medir distancias en metros sin calibración externa.
- Sin reentrenamiento: hereda todos los sesgos y errores del checkpoint original, incluida la dificultad conocida en superficies reflectantes, cristales, cielo y regiones sin textura. No se documenta ningún análisis de sesgo específico para esta exportación.
- Precisión de la variante Small: es la variante menos precisa de la familia; en aplicaciones donde el detalle importa (rotoscopia fina, matting de pelo) puede no ser suficiente.
- Riesgo de inconsistencias numéricas por la exportación a fp16: el manifiesto incluye comprobaciones de paridad, pero sus resultados no se publican, por lo que la magnitud del error introducido no es verificable a priori.
- Estado del repositorio: cero descargas y cero valoraciones en el momento de la consulta, sin validación independiente de la comunidad; el artefacto depende de un único autor.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene conservar el aviso de licencia y verificar la procedencia del checkpoint original (`depth-anything/Video-Depth-Anything-Small`) antes de redistribuir.
- Sin soporte de texto ni de instrucciones: no es un modelo de lenguaje y no puede usarse para tareas de generación, razonamiento o agentes, pese a que su ficha pueda aparecer junto a modelos de ese tipo en catálogos generalistas.
- Rendimiento en navegador dependiente del backend (WASM frente a WebGPU): no hay cifras publicadas, y la viabilidad en tiempo real variará mucho según el dispositivo del usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EmreGneri/video-depth-anything-small-stream
- Repositorio de código upstream (Video Depth Anything): https://github.com/DepthAnything/Video-Depth-Anything
- Commit de referencia del código upstream: 4f5ae23172ba60fd7bc11ef671cca678842c7072
- Proyecto consumidor (Spatial-Canvas): https://github.com/EmreGneri/Spatial-Canvas
- Pesos originales: `depth-anything/Video-Depth-Anything-Small` (`video_depth_anything_vits.pth`) en HuggingFace
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo (los resultados eran foros sobre OneDrive y almacenamiento en la nube, sin relación con el artefacto); no se han podido verificar papers, blogs ni demos adicionales.
