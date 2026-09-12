# skl24/RGBT

## Resumen

RGBT es un repositorio de Hugging Face publicado por el usuario skl24 que acompaña al artículo *Towards Privacy-Preserving Thermal Human Perception from Dataset to Deployment*. No es un modelo de lenguaje ni un modelo fundacional, sino un paquete compuesto por una muestra del conjunto de datos RGBT (imagen térmica infrarroja más su anotación por cada una de las 20 salas) y cuatro modelos de visión por computador ya entrenados, uno por tarea, con sus pesos en PyTorch y código de inferencia en un repositorio de GitHub aparte.

El problema que aborda es la percepción humana preservando la privacidad: en lugar de usar vídeo RGB identificable, se trabaja con imágenes térmicas de baja resolución (80x62 píxeles, uint16, dividir por 10 para obtener grados Celsius) para detectar presencia, contar personas y estimar su estado (número de personas, lugar, parte del cuerpo visible y postura). El conjunto completo, con pares RGB y térmicos y aproximadamente 96.000 fotogramas, se liberará por separado; esta publicación es solo una muestra de una imagen por sala más los puntos de control de los modelos.

Los cuatro modelos liberados cubren tareas complementarias del mismo dominio: detección de estado de persona en infrarrojo con YOLO11s, conteo de personas en infrarrojo con ResNet18, traducción de RGB a campo térmico con una U-Net y traducción inversa de infrarrojo a RGB con un modelo de difusión BBDM. La relevancia actual del repositorio es acotada y de carácter preliminar: se trata de una *sample release* con licencia MIT, cero descargas y un único "like" en el momento de redactar esta ficha, por lo que debe considerarse material de investigación incipiente y no un artefacto validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro arquitecturas distintas: YOLO11s (deteccion), ResNet18 (clasificacion/conteo), U-Net (regresion RGB a termico), BBDM, modelo de difusion de puente browniano (infrarrojo a RGB) |
| Parametros totales | no disponible (no se publica el recuento por modelo) |
| Parametros activos | no aplica (ninguno de los modelos es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); marco de entrada de 80x62 pixeles en el dominio termico |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar; no se documentan variantes INT8/FP16) |
| Idiomas soportados | en (idioma declarado del repositorio); el vocabulario de anotacion esta en chino |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch: `yolo11/weights/best.pt`, `resnet18/weights/best.pt`, `unet_rgb2t/weights/checkpoint.pt`, `bbdm_ir2rgb/weights/last_model.pth` |

Datos adicionales del repositorio: tamano de 2,1 GB, pipeline de Hugging Face no disponible, creado el 2026-09-12 y actualizado el 2026-09-12, 0 descargas y 1 like.

## Arquitectura y entrenamiento

El paquete agrupa cuatro enfoques de arquitectura diferente, cada uno asociado a una tarea del *pipeline* de percepcion termica. La deteccion de estado de persona usa YOLO11s, un detector de una etapa de la familia YOLO orientado a objetos pequenos y baja latencia, apropiado para fotogramas de 80x62. El conteo de personas emplea ResNet18, una red convolucional residual de 18 capas tratada aqui como clasificador del numero de ocupantes. La traduccion de RGB a campo termico se resuelve con una U-Net, arquitectura encoder-decoder con conexiones de salto tipica de tareas de regresion densa pixel a pixel. La traduccion inversa, de infrarrojo a RGB, usa BBDM, un modelo de difusion basado en puente browniano, que genera la imagen RGB de forma iterativa y estocastica.

No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, la resolucion de entrenamiento ni si hubo etapas de ajuste fino con retroalimentacion humana, DPO o similares. Tampoco se detallan innovaciones tecnicas concretas mas alla del planteamiento general del articulo, centrado en la privacidad: el uso de sensores termicos de bajo coste y baja resolucion para evitar capturar informacion identificable. El vocabulario de etiquetas documentado sugiere un esquema de anotacion compuesto con cuatro campos (`n_person`, `place`, `body_part`, `posture`) y valores en chino, lo que apunta a un etiquetado manual orientado a monitorizacion de interiores.

## Capacidades

- Deteccion de personas en infrarrojo con cuatro estados: la etiqueta compuesta combina numero de personas (`0_无人`, `1_1人`, `2_2人`, `3_3人及以上`), lugar (`0_人在床下`, `1_人在床上`), parte del cuerpo (`0_人体完整`, `1_人体上半身`, `2_人体躯干`) y postura (`0_躺`, `1_坐`, `2_其他行为`).
- Conteo de personas en escenas termicas (`ResNet18`), con exactitud declarada de 0,8165.
- Generacion de campo termico a partir de RGB (`U-Net`), con MAE de 0,654 grados Celsius y R2 de 0,923.
- Generacion de imagen RGB a partir de infrarrojo (`BBDM`), con PSNR 19,47 y SSIM 0,797.
- Lectura de datos termicos crudos: ficheros `thermal/roomNN.bin` en uint16, orden little-endian, cabecera de 4 bytes, 62x80 valores en orden por filas, dividir por 10 para Celsius.
- Anotacion por objeto con caja delimitadora `[x0, y0, x1, y1]` y poligono, en el sistema de coordenadas del lienzo de 80x62 con origen en la esquina superior izquierda.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; el repositorio declara ingles y el vocabulario de anotacion esta en chino.
- Capacidades especiales: vision termica e infrarroja, traduccion entre dominios RGB e infrarrojo, pensadas para escenarios de privacidad.

## Casos de uso

- Monitorizacion de presencia y postura en residencias de mayores: el detector YOLO11s puede clasificar si hay una persona, si esta en la cama y en que postura (tumbada, sentada u otra), lo que permite avisar al personal sin capturar imagen identificable.
- Deteccion de permanencia prolongada en la cama o de patrones de inmovilidad: combinando el estado `place` y `posture` sobre la secuencia de fotogramas anotados se pueden generar alertas asistenciales en entornos sanitarios.
- Conteo de ocupacion de salas para climatizacion e iluminacion: el clasificador ResNet18 estima el numero de ocupantes a partir del marco termico, informacion suficiente para regular HVAC o iluminacion sin instalar camaras visibles.
- Anonimizacion de flujos de video existentes: la U-Net de RGB a termico permite transformar video convencional en representacion termica de 80x62, reduciendo la identificabilidad antes de almacenar o transmitir.
- Reutilizacion de modelos preentrenados en RGB sobre datos de sensores termicos: el traductor infrarrojo a RGB (BBDM, PSNR 19,47 / SSIM 0,797) permite mapear capturas termicas a un dominio parecido al visible y aprovechar detectores y clasificadores ya entrenados en grandes corpus RGB.
- Busqueda de personas y seguridad nocturna: la deteccion en infrarrojo no depende de la iluminacion visible, por lo que es utilizable en exteriores de noche o en interiores a oscuras, donde una camara RGB convencional fallaria.
- Vigilancia de habitaciones individuales en hoteles u hospitales con minimo impacto en la intimidad: al trabajar con resolucion 80x62, la imagen no permite reconocer rostros ni identidades, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Investigacion en percepcion termica y generacion de pares sinteticos: la muestra de 20 salas y los puntos de control liberados sirven como punto de partida reproducible para comparar metodos de traduccion entre dominios y de deteccion en baja resolucion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para los cuatro modelos liberados:

| Tarea | Metodo | Metrica principal | Otras metricas |
|---|---|---|---|
| Deteccion de estado de persona en infrarrojo (4 estados) | YOLO11s | mAP50 = 0,789 | no disponible |
| Conteo de personas en infrarrojo | ResNet18 | exactitud = 0,8165 | no disponible |
| RGB a campo termico | U-Net | MAE = 0,654 C | R2 = 0,923 |
| Infrarrojo a RGB | BBDM | PSNR = 19,47 | SSIM = 0,797 |

No se han publicado en la informacion disponible resultados comparativos frente a modelos externos, ni valores de mAP50-95, precision, recall, F1, latencia o consumo energetico. Tampoco se detalla el protocolo de evaluacion, el tamano del conjunto de prueba ni la particion entre entrenamiento y validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, no publicada por el autor, los modelos de deteccion y clasificacion de este tipo con entradas de 80x62 pixeles son muy ligeros y suelen ejecutarse en CPU o en GPUs de gama baja; el modelo de difusion BBDM es el unico que previsiblemente requiere GPU dedicada por su naturaleza iterativa.
- GPU recomendadas: no disponible. Para el componente de difusion, una GPU con al menos 8 GB de VRAM (por ejemplo RTX 3060, RTX 4070 o superiores) es un punto de partida razonable; para YOLO11s y ResNet18, cualquier GPU moderna o incluso CPU es suficiente. Estas cifras son estimaciones basadas en la familia de arquitectura y el tamano de entrada, no datos publicados.
- Compatibilidad con GPU de consumo: los modelos de deteccion y conteo deberian caber sin problema en cualquier GPU de consumo; el modelo de difusion depende del numero de pasos de muestreo y de la implementacion, dato no especificado.
- Opciones de despliegue: no se documentan. Los pesos estan en formato PyTorch (`.pt`, `.pth`) y el codigo de inferencia se distribuye en carpetas separadas por metodo dentro del repositorio de GitHub. No se mencionan exportaciones a ONNX, TensorRT, OpenVINO, GGUF, vLLM, TGI, llama.cpp ni Ollama, que en la mayoria de los casos no aplican a este tipo de modelos de vision.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos comparables publicados con las mismas tareas y metricas sobre el mismo tipo de datos termicos de 80x62, por lo que la comparacion externa queda como no disponible. Como referencia, se comparan entre si los cuatro componentes del propio repositorio, que compiten en tareas distintas y no son intercambiables:

| Componente | Tarea | Metodo | Metrica declarada | Licencia | Formato |
|---|---|---|---|---|---|
| Deteccion | Estado de persona en infrarrojo | YOLO11s | mAP50 0,789 | MIT | `.pt` |
| Conteo | Numero de personas en infrarrojo | ResNet18 | exactitud 0,8165 | MIT | `.pt` |
| Traduccion | RGB a termico | U-Net | MAE 0,654 C / R2 0,923 | MIT | `.pt` |
| Traduccion | Infrarrojo a RGB | BBDM | PSNR 19,47 / SSIM 0,797 | MIT | `.pth` |

## Limitaciones y advertencias

- Se trata de una *sample release*: el repositorio contiene una sola imagen termica y su anotacion por cada una de las 20 salas. El conjunto completo (pares RGB y termico, aproximadamente 96.000 fotogramas) no esta incluido y se liberara por separado, sin fecha confirmada.
- Validacion limitada: 0 descargas y 1 like en el momento de redactar la ficha; no hay evidencia de uso independiente ni de replicacion de los resultados.
- Resolucion muy baja (80x62 pixeles): los objetos son de pocos pixeles, lo que limita la precision en escenas concurridas, con oclusiones o con personas alejadas de la camara.
- El vocabulario de anotacion esta en chino (`1_1人`, `0_人在床下`, `0_躺`, etc.), lo que exige un mapeo explicito a etiquetas en otros idiomas antes de integrarlo en un *pipeline* propio.
- El campo `condition` aparece como `null` en el ejemplo de anotacion y no se documenta su vocabulario, por lo que no puede usarse como variable de filtrado.
- Riesgo de alucinacion: los modelos de generacion de imagen (U-Net RGB a termico y BBDM infrarrojo a RGB) pueden producir contenido plausible pero incorrecto; un PSNR de 19,47 y un SSIM de 0,797 en la traduccion infrarrojo a RGB indican reconstrucciones utiles pero no fieles.
- No se publican analisis de sesgo demografico, de genero, edad, constitucion corporal ni de condiciones ambientales (temperatura de la sala, ropa, mantas), factores que afectan directamente a las lecturas termicas.
- Rendimiento por subgrupos: no se detalla el mAP50-95, ni curvas precision-recall, ni el comportamiento por estado de postura o por numero de personas, por lo que los 0,789 de mAP50 pueden ocultar un rendimiento desigual entre clases.
- La licencia MIT es permisiva y permite uso comercial, pero el autor no ofrece garantias, soporte ni mantenimiento; el uso en produccion queda bajo responsabilidad de quien integra los pesos.
- El uso de camaras termicas en espacios con personas puede estar sujeto a normativas de proteccion de datos segun la jurisdiccion, incluso cuando la resolucion impide identificar individuos.
- Las fechas del repositorio (creacion y actualizacion el 2026-09-12) resultan inusualmente futuras respecto al contenido publicado; conviene verificar su vigencia antes de planificar cualquier dependencia.
- El pipeline de Hugging Face no esta declarado, por lo que las herramientas automaticas de la plataforma no reconoceran el repositorio como un modelo de una tarea concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skl24/RGBT
- Codigo de inferencia y articulo: https://github.com/kailaisun/RGBT
- Descarga directa de los puntos de control: `hf download skl24/RGBT --local-dir checkpoints`
- Los resultados de la busqueda web proporcionada no contienen informacion relacionada con el modelo: corresponden a articulos de viajes sobre Cartagena (Colombia) y no se han utilizado como fuente.
