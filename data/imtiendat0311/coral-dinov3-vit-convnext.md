# imtiendat0311/coral-dinov3-vit-convnext

## Resumen

coral-dinov3-vit-convnext es un clasificador de imagenes para especies de coral del Caribe, publicado por imtiendat0311 (Dat Nguyen y colaboradores de Grand Valley State University) como pesos oficiales del articulo "Robust In-Situ Coral Image Classification with a DINOv3 Hybrid Vision Architecture". Resuelve una tarea de clasificacion de 27 clases sobre imagenes tomadas in situ, es decir, en condiciones reales de arrecife con iluminacion variable, turbidez, oclusion y encuadres no controlados, un escenario notablemente mas dificil que la clasificacion sobre imagenes de laboratorio.

El modelo es un hibrido de dos codificadores: un Vision Transformer DINOv3 ViT-7B/16 y un ConvNeXt-Large de DINOv3, cuyas representaciones se combinan mediante una cabeza MLP entrenada especificamente para la tarea. El conjunto suma 6.915.853.819 parametros (aproximadamente 6,9 mil millones), lo que lo situa en la gama alta de los clasificadores de vision y explica un repositorio de 27,7 GB en safetensors. La resolucion de entrada es de 224x224 o 256x256 pixeles.

Su relevancia actual es doble. Por un lado, reporta un 91,04 % de exactitud top-1 en el benchmark GV3 de 27 clases, lo que supone una mejora de 8,9 puntos porcentuales sobre la linea base previa basada en ResNet+ViT. Por otro, demuestra que el reutilizacion de backbones fundacionales de vision (DINOv3) mas una cabeza ligera entrenada permite obtener resultados de estado del arte en dominios cientificos muy especificos con recursos de entrenamiento moderados. El modelo se distribuye bajo la licencia DINOv3 de Meta para los backbones y MIT para la cabeza y el codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador hibrido: DINOv3 ViT-7B/16 + DINOv3 ConvNeXt-Large, con cabeza MLP entrenada |
| Parametros totales | 6.915.853.819 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en safetensors (aproximadamente fp32, coherente con 27,7 GB para 6,9 mil millones de parametros) |
| Idiomas soportados | no aplica (modelo de clasificacion de imagenes) |
| Licencia | dinov3-license para los backbones; MIT para la cabeza de clasificacion y el codigo |
| Formato de pesos | safetensors |
| Resolucion de entrada | 224x224 o 256x256 |
| Tarea | Clasificacion de imagenes (image-classification) |
| Numero de clases | 27 especies de coral del Caribe |
| Dataset de entrenamiento | gv3-coral |
| Tamano del repositorio | 27,7 GB |
| Descargas | 27 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura es un hibrido de dos codificadores congelados o parcialmente reutilizados procedentes de la familia DINOv3 de Meta: un ViT-7B/16 (transformer de vision con parches de 16x16 y aproximadamente 7 mil millones de parametros) y un ConvNeXt-Large, que aporta una rama convolucional con sesgo inductivo local complementario a la atencion global del ViT. Las representaciones de ambas ramas se combinan y se proyectan mediante una cabeza MLP entrenada para la tarea de 27 clases. Esta combinacion busca capturar simultaneamente texturas finas y estructuras locales tipicas del coral (patrones de ramificacion, poros, bordes de colonia) y el contexto global de la colonia en el encuadre.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset gv3-coral, ni si se emplearon tecnicas de ajuste como RLHF o DPO (que, en cualquier caso, no son habituales en clasificacion de vision). Tampoco se detalla si los backbones permanecieron congelados durante el entrenamiento de la cabeza o si se aplico fine-tuning parcial. La innovacion tecnica declarada es precisamente el esquema dual-encoder ViT + ConvNeXt sobre backbones fundacionales DINOv3, evaluado en un benchmark in situ y con una mejora de 8,9 puntos porcentuales sobre la linea base ResNet+ViT precedente. El modelo se publica como pesos oficiales del articulo, con la cabeza y el codigo bajo licencia MIT.

## Capacidades

- Clasificacion de imagenes de coral en 27 clases correspondientes a especies del Caribe, con imagenes tomadas in situ.
- Extraccion de representaciones visuales de alta calidad mediante dos backbones fundacionales (DINOv3 ViT-7B/16 y DINOv3 ConvNeXt-Large).
- Procesamiento de imagenes a 224x224 y 256x256 pixeles.
- Inferencia reproducible a traves del script `infer.py` del repositorio oficial, con descarga automatica de pesos desde HuggingFace.
- No dispone de soporte de tool calling ni de function calling: es un clasificador de vision, no un modelo de lenguaje.
- No dispone de capacidades de agente, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No dispone de capacidades multilingues ni de generacion de texto.
- No dispone de capacidades de vision-lenguaje, audio, video ni deteccion o segmentacion: la salida es una etiqueta de clase.

## Casos de uso

- Monitorizacion de arrecifes a gran escala: el modelo puede clasificar automaticamente miles de imagenes capturadas por transectos submarinos o vehiculos autonomos, sustituyendo la anotacion manual por especialistas y permitiendo construir series temporales de composicion de especies.
- Programas de restauracion de coral: identificar la especie presente en cada imagen de vivero o de zona replantada permite verificar la supervivencia y el crecimiento diferencial por especie tras una intervencion.
- Ciencia ciudadana y buceo recreativo: integrado en una aplicacion movil, un buceador podria fotografiar una colonia y obtener una identificacion preliminar de la especie, que despues se validaria por un biologo.
- Investigacion sobre blanqueamiento y enfermedades: clasificar primero la especie y despues cruzar la etiqueta con anotaciones de salud permite analizar la susceptibilidad relativa de cada especie a episodios de estres termico.
- Cartografia bentonica con ROV o AUV: procesar por lotes el material recogido en campanas de video submarino para generar mapas de distribucion de especies y calcular indices de diversidad por zona.
- Evaluacion de impacto ambiental: comparar la composicion de especies antes y despues de una obra costera, un vertido o una actividad de dragado, con una linea base objetiva y reproducible.
- Curacion de colecciones y datos de entrenamiento: usar el clasificador para pre-etiquetar grandes repositorios de imagenes de arrecife y reducir el esfuerzo de anotacion humana en futuros datasets.
- Reproducibilidad academica: servir como linea base fuerte y publica para nuevos trabajos de clasificacion de coral in situ, dado que los pesos y el codigo de inferencia estan disponibles.

## Benchmarks y rendimiento

| Benchmark | Metrica | Este modelo | Linea base previa (ResNet+ViT) | Diferencia |
|---|---|---|---|---|
| GV3, 27 clases de coral del Caribe | Exactitud top-1 | 91,04 % | no disponible (valor absoluto no publicado en la informacion proporcionada) | +8,9 puntos porcentuales |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se detallan resultados de ablacion por rama (solo ViT, solo ConvNeXt) ni metricas de precision, recall o F1 por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (formato de distribucion, aproximadamente 27,7 GB) se necesitan alrededor de 28-32 GB de VRAM solo para los pesos, mas activaciones. En fp16/bf16 la estimacion baja a unos 14-16 GB; en int8, a unos 7-9 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y, en general, cualquier acelerador con 32 GB o mas para fp32. Para fp16 bastan GPU de 16-24 GB como A10G, L40S o RTX 4090.
- Cabe en GPU de consumo: en fp16 si, en RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado si se procesan lotes grandes o resoluciones superiores a 256x256. En fp32 no cabe en GPU de consumo con menos de 32 GB.
- Nota sobre cuantizacion: la model card no publica versiones cuantizadas ni pesos GGUF. Cualquier conversion a fp16, int8 o similar obliga a un paso propio de conversion por parte del usuario.
- Opciones de despliegue: el repositorio oficial ofrece `infer.py` sobre PyTorch con descarga automatica de pesos. No hay informacion sobre soporte de vLLM, TGI, llama.cpp u Ollama, herramientas orientadas a modelos de lenguaje y no al caso de uso de este modelo. Para produccion seria razonable exportar a ONNX o TensorRT, pero no es algo documentado por el autor.
- Latencia y throughput: no disponible. El coste por imagen vendra dominado por el codificador ViT-7B/16, sustancialmente mas pesado que el ConvNeXt-Large.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Rendimiento GV3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| coral-dinov3-vit-convnext | 6.915.853.819 | Clasificacion de 27 especies de coral | Imagen 224x224 / 256x256 | 91,04 % top-1 | dinov3-license (backbones) + MIT (cabeza) | Pesos en HuggingFace y codigo en GitHub |
| ResNet+ViT (linea base previa) | no disponible | Clasificacion de 27 especies de coral | no disponible | 91,04 % menos 8,9 puntos (valor absoluto no publicado) | no disponible | no disponible |
| DINOv3 ViT-7B/16 sin cabeza especifica | aproximadamente 7 mil millones | Representacion visual generalista | Imagen | no disponible para GV3 | dinov3-license | Pesos publicos de Meta |
| DINOv3 ConvNeXt-Large | no disponible | Representacion visual generalista | Imagen | no disponible para GV3 | dinov3-license | Pesos publicos de Meta |

No se dispone de datos publicados que comparen este modelo con otros clasificadores de coral in situ de terceros, ni con alternativas como CoralNet o clasificadores especificos de otras regiones biogeograficas.

## Limitaciones y advertencias

- Ambito geografico y taxonomico restringido: el modelo esta entrenado para 27 clases de coral del Caribe. Aplicado a especies del Indo-Pacifico o del Mediterraneo, las predicciones no son fiables.
- Riesgo de alucinacion en sentido clasico: al ser un clasificador, siempre devuelve una de las 27 etiquetas con una probabilidad asociada. Una imagen que no contenga coral, o que contenga una especie fuera del conjunto, seguira recibiendo una etiqueta, lo que puede producir falsos positivos silenciosos si no se aplica un umbral de confianza o una clase de rechazo.
- Sensibilidad al dominio: al tratarse de un modelo in situ, el rendimiento puede degradarse en condiciones muy distintas a las del dataset de entrenamiento, por ejemplo imagenes de laboratorio, fotografia con flash, aguas muy turbias o grandes profundidades con iluminacion artificial.
- Sesgos potenciales no cuantificados: no se publican metricas desagregadas por clase, localizacion, profundidad, camara o condiciones de iluminacion, por lo que no es posible evaluar si el modelo funciona peor en especies concretas o en determinadas condiciones de captura.
- Dependencia de dos backbones de gran tamano: 6,9 mil millones de parametros implican un coste de inferencia y de memoria elevado para un clasificador, lo que limita el despliegue en dispositivos de borde o en campo sin conectividad.
- Restricciones de licencia: los backbones derivan de DINOv3 de Meta y se rigen por la DINOv3 License, enlazada en la model card, no por una licencia de codigo abierto permisiva estandar. La cabeza y el codigo son MIT. Cualquier uso comercial debe revisarse contra los terminos de la DINOv3 License antes de desplegarse.
- Trazabilidad limitada: el modelo tiene 27 descargas y 2 likes, y el articulo asociado esta fechado en 2026, por lo que se trata de una publicacion reciente y con poca validacion independiente por parte de la comunidad.
- Ausencia de informacion sobre el dataset: no se detalla el numero de imagenes, el reparto train/validacion/test, el equilibrio entre clases ni el proceso de anotacion de gv3-coral, lo que dificulta juzgar la robustez estadistica del 91,04 % reportado.
- Sin versiones cuantizadas ni documentacion de despliegue en servidores de inferencia de alto rendimiento, lo que traslada al usuario el trabajo de optimizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imtiendat0311/coral-dinov3-vit-convnext
- Repositorio de codigo e inferencia: https://github.com/imtiendat0311/coral-dinov3
- Licencia DINOv3 de Meta: https://github.com/facebookresearch/dinov3/blob/main/LICENSE
- Dataset referenciado en la model card: gv3-coral (sin URL publica en la informacion proporcionada)
- Articulo: Nguyen, Dat; Tran, Minh; Bobeldyk, Denton; Leidig, Jonathan P. "Robust In-Situ Coral Image Classification with a DINOv3 Hybrid Vision Architecture", Grand Valley State University, 2026 (sin enlace publico en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente portales y foros sin relacion (Mobile01, Zhihu, foro del Olympique de Marsella).
