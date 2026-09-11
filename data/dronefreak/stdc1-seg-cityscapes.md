# dronefreak/stdc1-seg-cityscapes

## Resumen

STDC1-Seg75 (Cityscapes mirror) es un checkpoint de segmentacion semantica de imagenes que segmenta escenas urbanas en 19 clases. No es un modelo nuevo: se trata de una redistribucion (un espejo) del checkpoint oficial STDC1-Seg75 publicado por los autores de STDC-Seg, rehospedado en HuggingFace por el usuario dronefreak para permitir un acceso estable y programatico mediante `huggingface_hub`. Los pesos son identicos byte a byte al archivo original; el repositorio anade unicamente un `checksums.txt` con el SHA-256 y metadatos de procedencia.

La arquitectura subyacente es la Short-Term Dense Concatenate Network (STDC), presentada en el articulo "Rethinking BiSeNet for Real-Time Semantic Segmentation" (CVPR 2021, arXiv:2104.13188). En concreto, esta variante combina un backbone STDCNet813 con el esquema de dos ramas (detalle y contexto) heredado de BiSeNet, y esta afinada de extremo a extremo sobre Cityscapes. El autor reporta 74,5 mIoU a escala unica en el split de validacion de Cityscapes.

Su relevancia actual es la de servir como referencia reproducible y ligera para segmentacion en tiempo real: el repositorio completo ocupa 0,1 GB, los pesos son un `state_dict` en fp32 sin estado de optimizador, y la licencia MIT facilita su integracion en proyectos de investigacion y produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Short-Term Dense Concatenate Network (STDC, CVPR 2021); variante STDC1-Seg75 con backbone STDCNet813 y esquema tipo BiSeNet de dos ramas (detalle y contexto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (los pesos distribuidos estan en fp32; no se documentan variantes int8, GGUF u otras) |
| Idiomas soportados | no disponible (no aplica: la salida son las 19 clases de Cityscapes, no texto) |
| Licencia | MIT para los pesos; el dataset Cityscapes conserva sus propios terminos (uso academico/investigacion) y los pesos derivados se redistribuyen bajo ese mismo criterio |
| Formato de pesos | `state_dict` de PyTorch en fp32, archivo `stdc1-seg_cityscapes.pth`; repositorio de 0,1 GB con `checksums.txt` (SHA-256) |
| Tarea | Segmentacion semantica de imagenes (pipeline `image-segmentation`) |
| Numero de clases | 19 (mapa de `trainId` de 0 a 18) |
| Entrada | Imagen RGB normalizada con media y desviacion estandar de ImageNet |
| Salida | Mapa de segmentacion por pixel; la red devuelve `(main, aux16, aux32)` y se utiliza `[0]`, con `argmax` sobre las 19 clases |
| Repositorio | `dronefreak/stdc1-seg-cityscapes`, espejo de los pesos oficiales de `MichaelFan01/STDC-Seg` |

## Arquitectura y entrenamiento

STDC sustituye los bloques convolucionales convencionales por bloques Short-Term Dense Concatenate, que concatenan las salidas de varias etapas de forma densa para reducir la redundancia espacial y el coste computacional. En STDC1-Seg75, el backbone STDCNet813 alimenta la estructura de dos ramas del esquema BiSeNet: una rama de detalle que conserva resolucion espacial y una rama semantica que reduce la resolucion para capturar contexto, fusionadas posteriormente mediante modulos de agregacion y de fusion de caracteristicas. Las cabezas de frontera (`use_boundary_8`) se usan durante el entrenamiento, de ahi que el codigo de ejemplo cargue el `state_dict` con `strict=False` para omitir las cabezas auxiliares.

El modelo es un checkpoint afinado de extremo a extremo sobre Cityscapes con 19 clases, tal y como declara la model card. El protocolo de evaluacion documentado para la variante Seg75 consiste en redimensionar la entrada a escala 0,75 con interpolacion bilineal, ejecutar la red y volver a interpolar los logits al tamano original antes del `argmax`. No se proporcionan en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del dataset, el numero de iteraciones ni si se aplicaron tecnicas de ajuste tipo RLHF o DPO (no aplicables a un modelo discriminativo de vision).

## Capacidades

- Segmentacion semantica densa por pixel de escenas urbanas en 19 clases (carretera, acera, edificio, muro, valla, poste, semaforo, senal de trafico, vegetacion, terreno, cielo, persona, ciclista, coche, camion, autobus, tren, motocicleta y bicicleta).
- Inferencia a escala unica, con el protocolo de redimensionado a 0,75 documentado para la variante Seg75.
- Salida directamente utilizable como mapa de clases (`trainId` 0-18) con la paleta oficial de Cityscapes incluida en el ejemplo de uso.
- Capacidad de servir como generador de pseudo-etiquetas para preanotacion o destilacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue ni genera texto: no hay capacidades de lenguaje.
- No dispone de modo de razonamiento (thinking), ni de entrada de audio, ni de generacion de imagenes.

## Casos de uso

- Preanotacion de datasets de conduccion: el modelo genera mascaras de 19 clases sobre imagenes de calle que un equipo humano solo tiene que corregir, lo que reduce el coste de anotacion de datasets propios de segmentacion urbana.
- Percepcion para ADAS y prototipos de conduccion autonoma: la arquitectura esta disenada para segmentacion en tiempo real, de modo que puede integrarse en una pipeline de percepcion que necesite separar calzada, acera, vehiculos y peatones a partir de una camara frontal.
- Robotica movil y navegacion en exteriores: las mascaras de carretera y acera permiten estimar espacio libre transitable y alimentar planificadores de trayectoria en entornos urbanos o de campus.
- Analitica de trafico y videovigilancia: al distinguir entre coche, camion, autobus, motocicleta, bicicleta y persona, permite conteos y estudios de ocupacion por clase a partir de flujos de video.
- Investigacion en segmentacion eficiente: sirve como baseline reproducible con 74,5 mIoU en Cityscapes val para comparar nuevas arquitecturas en tiempo real bajo el mismo protocolo de evaluacion.
- Destilacion y entrenamiento de modelos ligeros: las predicciones del modelo pueden actuar como profesor para entrenar variantes mas pequenas o cuantizadas destinadas a dispositivos con recursos limitados.
- Procesado por lotes en servidores: al ser un `state_dict` de PyTorch sin dependencias exotica, se puede desplegar en un servicio de inferencia por lotes que genere mascaras para catalogos de imagenes urbanas.
- Composicion de video y efectos: la segmentacion de cielo, vegetacion y edificios permite generar mates para tareas de edicion o sustitucion de fondo en material de calle.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card:

| Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Cityscapes | validation | mIoU (single-scale) | 74,5 | no (`verified: false`) |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB (incluyendo assets como el video de demostracion), por lo que el checkpoint en si es ligero, pero el consumo real depende de la resolucion de entrada y del tamano de lote.
- GPU recomendadas: no disponible (no hay mediciones publicadas). El modelo esta pensado para segmentacion en tiempo real, por lo que cualquier GPU moderna con soporte PyTorch y VRAM suficiente para la resolucion objetivo deberia poder ejecutarlo; no se dispone de cifras verificadas.
- GPU de consumo: es razonable esperar que quepa en GPU de consumo dada la orientacion a tiempo real y el tamano reducido del repositorio, pero no se dispone de cifras exactas de VRAM ni de parametros totales para confirmarlo.
- CPU: el propio ejemplo de la model card carga los pesos con `map_location="cpu"`, de modo que la inferencia puntual en CPU es viable, aunque sin garantias de tiempo real.
- Opciones de despliegue: el uso documentado es PyTorch puro, clonando el repositorio upstream y usando la clase `BiSeNet` de `models/model_stages.py`. No hay integracion oficial con vLLM, Ollama ni TGI (no aplicables a vision). La exportacion a ONNX, TensorRT o OpenVINO no esta documentada.
- Dependencias de software: `torch`, `torchvision`, `pillow`, `numpy` y `huggingface_hub`.
- Latencia y throughput: no disponible. El articulo original se enmarca en segmentacion en tiempo real, pero la informacion proporcionada no incluye FPS ni latencias medidas.

## Comparativa con modelos similares

No se dispone de datos numericos de los modelos alternativos en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa para no inventar cifras.

| Modelo | Familia o tipo | Parametros | mIoU Cityscapes val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STDC1-Seg75 (este espejo) | CNN con bloques STDC y esquema BiSeNet | no disponible | 74,5 (single-scale, no verificado) | MIT (pesos) | HuggingFace y repositorio upstream |
| BiSeNetV2 | CNN bilateral de dos ramas | no disponible | no disponible en la informacion | no disponible | repositorio upstream propio |
| DDRNet | CNN de dos ramas con fusion profunda | no disponible | no disponible en la informacion | no disponible | repositorio upstream propio |
| PIDNet | CNN piramidal de tres ramas | no disponible | no disponible en la informacion | no disponible | repositorio upstream propio |
| SegFormer | transformer jerarquico para segmentacion | no disponible | no disponible en la informacion | no disponible | amplia disponibilidad en HuggingFace |

Todas las alternativas anteriores compiten en la misma categoria (segmentacion semantica de escenas urbanas, con enfasis en eficiencia computacional), pero los valores de mIoU, parametros y licencia de cada una no constan en la informacion disponible.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: el mantenimiento, la garantia y el soporte corresponden a los autores originales de STDC-Seg; el autor del espejo declara no tener afiliacion con ellos.
- La metrica de 74,5 mIoU esta declarada con `verified: false`; no ha sido reproducida ni validada de forma independiente en la informacion disponible.
- Vocabulario cerrado de 19 clases. Cualquier objeto fuera de esas categorias no tiene etiqueta propia y el modelo lo forzara a la clase mas parecida, lo que produce errores sistematicos en entornos distintos a los de Cityscapes.
- Dominio restringido: el entrenamiento es sobre Cityscapes, compuesto por escenas urbanas diurnas tomadas desde vehiculo. El comportamiento con poca luz, lluvia, nieve, camaras no automotrices o escenas de interior no esta caracterizado.
- No se documentan evaluaciones de sesgo, equidad ni robustez, ni existe un apartado de consideraciones eticas en la model card.
- Restricciones de licencia: los pesos se distribuyen bajo MIT, pero Cityscapes tiene sus propios terminos (orientados a uso academico y de investigacion) y los pesos derivados se redistribuyen bajo ese mismo criterio. Conviene revisar la licencia del dataset antes de un uso comercial; esta ficha no constituye asesoramiento legal.
- Dependencia de codigo externo: la arquitectura no esta empaquetada en el repositorio de HuggingFace. Hay que clonar el repositorio upstream y disponer de `models/model_stages.py` para instanciar el modelo.
- La carga con `strict=False` omite silenciosamente las cabezas de frontera. Si la configuracion del modelo no coincide exactamente con la esperada (por ejemplo, los flags `use_boundary_*` o `use_conv_last`), el `state_dict` puede cargarse parcialmente sin lanzar un error, degradando la calidad de forma dificil de detectar.
- Para reproducir los 74,5 mIoU es imprescindible replicar el preprocesado documentado: normalizacion con media y desviacion de ImageNet y redimensionado a escala 0,75 antes de la inferencia.
- El archivo distribuido es un `state_dict` desnudo, sin estado de optimizador ni metadatos de entrenamiento, por lo que no sirve para reanudar un entrenamiento.
- No apto para generacion de texto, tool calling, agentes ni tareas de lenguaje: aplicar expectativas de modelo generativo a este checkpoint conduce a resultados incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/stdc1-seg-cityscapes
- Repositorio upstream de STDC-Seg: https://github.com/MichaelFan01/STDC-Seg
- Articulo (arXiv): https://arxiv.org/abs/2104.13188
- Pesos originales (Google Drive): https://drive.google.com/drive/folders/1wROFwRt8qWHD4jSo8Zu1gp1d6oYJ3ns1
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
- Licencia del dataset Cityscapes: https://www.cityscapes-dataset.com/license/
- Perfil del autor del espejo: https://huggingface.co/dronefreak
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; unicamente aparecieron paginas sin relacion con segmentacion semantica, por lo que no se anaden mas enlaces.
