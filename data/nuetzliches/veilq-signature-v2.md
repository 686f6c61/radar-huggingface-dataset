# nuetzliches/veilq-signature-v2

## Resumen

veilq-signature-v2 es un detector de firmas manuscritas en imagenes de documentos y capturas de pantalla, desarrollado por nuetzliches como parte del proyecto veilq. Se trata de un ajuste fino del modelo mdefrance/yolos-tiny-signature-detection (revision b788cf7), un detector de objetos basado en la arquitectura YOLOS en su variante tiny, que a su vez deriva del transformer DETR. El modelo se distribuye exclusivamente en formato ONNX (opset 17) y esta pensado para su integracion en el pipeline de veilq, herramienta que localiza firmas y las cubre con negro.

El problema que resuelve es concreto: los detectores de firmas genericos confunden con firmas otros elementos habituales en documentos y fotografias, como marcas de agua diagonales, sellos, logotipos, titulares de paginas web o fotografias de personas. La version 2 se entrena especificamente para reducir esos falsos positivos manteniendo una tasa alta de deteccion, y los resultados medidos por el autor muestran una reduccion drastica de cajas erroneas respecto a la version 1 y al modelo base.

El modelo es de tamano reducido (repo de 0.0 GB, coherente con la variante tiny de YOLOS), lo que permite inferencia en CPU y su uso en entornos con recursos limitados. La relevancia actual radica en su especializacion: no es un detector generico, sino un componente de un sistema de anonimizacion con decisiones de diseno orientadas a reducir falsos positivos en documentos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS-tiny (transformer tipo DETR, detector de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo base esta etiquetado como quantized) |
| Idiomas soportados | no disponible (modelo de vision; el texto de entrenamiento es en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, `model.onnx`) |

Especificaciones adicionales de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | `pixel_values`: float32 `[1, 3, 640, 640]`, RGB escalado a 0..1, normalizado con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]` |
| Salida `logits` | `[1, 100, 2]` (firma / nada, softmax) |
| Salida `pred_boxes` | `[1, 100, 4]` (centro x, centro y, ancho, alto como proporciones de la entrada) |
| SHA-256 de `model.onnx` | `bf9a177aa93f98c4e1c02332c31e37d5dc12e310c0a19c0e3fa5fffe2878da9e` |

## Arquitectura y entrenamiento

La arquitectura es YOLOS (You Only Look at One Sequence), un transformer de deteccion de objetos que adapta el esquema de DETR a una secuencia de parches de imagen, en su variante tiny. El modelo parte de los pesos de mdefrance/yolos-tiny-signature-detection y se ajusta de nuevo. Durante el ajuste se mantuvieron congelados los embeddings de parches y las 6 primeras de las 12 capas del encoder, entrenando el resto.

El entrenamiento se realizo sobre 2.000 imagenes sinteticas, ninguna con firmas de personas reales. El dataset incluye cartas y capturas de cartas junto a ventanas de aplicacion o paginas web, con firmas en fuentes manuscritas (Caveat, Dancing Script, Great Vibes, Homemade Apple, Reenie Beanie, Allura, Sacramento, Kalam, Nothing You Could Do) y trazos dibujados, a veces cruzando el nombre o cargo impreso; marcas de agua diagonales, sellos, logotipos, tablas y lineas; cartas fotografiadas sobre escritorio con rotacion, iluminacion irregular, ruido y compresion JPEG; paginas web en navegador (tarjetas de foto con titulares, anuncios, listas con iconos, graficos, meteorologia) y fotografias sin firma; y fotografias firmadas en su superficie. Las fotografias son 777 imagenes de Wikimedia Commons bajo CC0 o dominio publico, seleccionadas por tematica (comida, lugares, objetos, animales, arte), de las que se retiraron a mano siete con escritura o firma. Cada sexta foto se reservo para validacion. Los nombres y lugares son inventados.

El ajuste consistio en 16 epocas en CPU, batch 8, optimizador AdamW con learning rate 2e-5. La mejor epoca (la 9) se eligio sobre 300 imagenes sinteticas reservadas, leidas como lo hace veilq: la imagen completa y en cuadrados del lado menor cuando esta lejos de ser cuadrada, con umbral de score 0.5 y cajas de al menos 40 px de ancho.

## Capacidades

- Deteccion de firmas manuscritas en imagenes de documentos y capturas de pantalla, devolviendo cajas delimitadoras y una puntuacion por caja.
- Discriminacion especifica frente a falsos positivos habituales: fotografias, tarjetas de foto con titulares, marcas de agua diagonales, sellos, logotipos, tablas y lineas.
- Funcionamiento sobre documentos escaneados o fotografiados, con rotacion, iluminacion irregular, ruido y compresion JPEG.
- Funcionamiento sobre paginas web renderizadas en navegador.
- Inferencia en CPU, sin requerir GPU.
- Integracion como componente del pipeline de veilq (ADR-0048), que cubre con negro las firmas detectadas.
- No verifica ni compara firmas: solo localiza su posicion.
- No soporta tool calling, agentes ni capacidades multilingues de texto (es un modelo puramente de vision).

## Casos de uso

- Anonimizacion de documentos antes de su publicacion o comparticion: el modelo localiza las firmas en contratos, cartas o formularios escaneados y el pipeline de veilq las cubre con negro, evitando exponer datos personales.
- Procesamiento de correspondencia escaneada en entornos administrativos: al tolerar rotacion, iluminacion irregular y ruido, puede aplicarse a lotes de cartas fotografiadas con movil o escaner sin preprocesado manual extenso.
- Limpieza de capturas de pantalla de paginas web: la version 2 elimina practicamente los falsos positivos sobre fotografias y tarjetas de foto (2 cajas erroneas en 61 imagenes de pagina web, frente a 290 de la v1), lo que la hace adecuada para procesar capturas de portales de noticias o redes.
- Cumplimiento de proteccion de datos en pipelines documentales: al ejecutarse en CPU y en formato ONNX, puede desplegarse en servidores sin GPU dentro de flujos de redaccion automatizada de informacion personal.
- Preprocesado para sistemas de archivo digital: deteccion de la region de firma para recortarla, indexarla o marcarla en la digitalizacion de expedientes.
- Filtrado de imagenes en conjuntos de datos: descartar o etiquetar imagenes que contienen firmas antes de usarlas en otros entrenamientos o publicaciones.
- Integracion en herramientas de escritorio: el formato ONNX y la inferencia en CPU permiten embeberlo en aplicaciones locales de gestion documental sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 300 imagenes sinteticas reservadas (163 firmas), comparando firmas encontradas y cajas falsas:

| Tipo | Imagenes | Modelo base | veilq-signature-v1 | veilq-signature-v2 |
|---|---|---|---|---|
| Carta sin marca de agua | 86 | 66/71, 230 falsas | 69/71, 72 falsas | 68/71, 4 falsas |
| Carta con marca de agua | 90 | 54/64, 321 falsas | 63/64, 66 falsas | 62/64, 12 falsas |
| Carta fotografiada | 17 | 7/12, 41 falsas | 11/12, 14 falsas | 12/12, 2 falsas |
| Pagina web | 61 | 1.120 falsas | 290 falsas | 2 falsas |
| Fotografia | 30 | 202 falsas | 55 falsas | 3 falsas |
| Fotografia firmada en su superficie | 16 | 5/16, 112 falsas | 0/16, 37 falsas | 1/16, 3 falsas |

El modelo base y v2 se midieron durante el entrenamiento; v1 con la misma lectura en ONNX Runtime. Ademas, sobre 24 cartas de otro generador (blancas, crema, grises, fotografiadas, escaneadas, junto a una ventana oscura), los tres modelos encuentran las 24. Sobre una captura reportada de una pagina de noticias con fotos, v1 coloco 19 cajas sobre las fotos y v2 ninguna.

No se han publicado resultados de benchmarks estandar (COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0.0 GB) y la variante tiny de YOLOS, la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor entreno en CPU, lo que indica que la inferencia en CPU es viable.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con unos pocos GB de VRAM; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (usado por veilq y en las mediciones del autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos ONNX).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (cajas falsas en paginas web) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veilq-signature-v2 | no disponible (YOLOS-tiny) | no aplica | 2 en 61 imagenes | Apache-2.0 | ONNX en Hugging Face |
| veilq-signature-v1 | no disponible (YOLOS-tiny) | no aplica | 290 en 61 imagenes | no disponible | Hugging Face |
| mdefrance/yolos-tiny-signature-detection (base) | no disponible (YOLOS-tiny) | no aplica | 1.120 en 61 imagenes | Apache-2.0 | Hugging Face |

La comparativa se limita a las variantes de la misma familia porque la informacion disponible no incluye otros detectores de firmas comparables. La diferencia principal entre las tres versiones es la tasa de falsos positivos, no la arquitectura ni el tamano.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: las firmas reales, escaneos y fotografias reales presentan mas variabilidad de la cubierta por el dataset.
- Las firmas escritas sobre una fotografia (autografos) se detectan mayoritariamente mal: solo 1 de 16 en la medicion del autor.
- El modelo localiza firmas pero no las verifica ni las compara; no sirve para autenticacion.
- Una marca de agua puede seguir generando alguna caja falsa pequena.
- Riesgo de sesgo por el dataset sintetico: fuentes manuscritas concretas, texto impreso en ingles (Lato, Open Sans, Source Sans 3) y fotografias de tematicas limitadas; el rendimiento puede degradarse con otros idiomas, tipografias o dominios visuales.
- No hay datos publicados sobre sesgos demograficos ni sobre robustez frente a firmas de distintas culturas o alfabetos.
- Licencia Apache-2.0, que permite uso comercial; el modelo base se ajusto sobre el dataset tech4humans/signature-detection (Tobacco800, Roboflow signatures-xc8up) y las fotografias de entrenamiento son CC0 o dominio publico, sin publicarse con el modelo.
- Para produccion, conviene fijar el archivo por su SHA-256 (proporcionado por el autor) y validar el umbral de score y el tamano minimo de caja en el dominio concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-signature-v2
- Modelo base: https://huggingface.co/mdefrance/yolos-tiny-signature-detection
- Version anterior: https://huggingface.co/nuetzliches/veilq-signature-v1
- Repositorio veilq: https://github.com/nuetzliches/veilq
- Dataset del modelo base: https://huggingface.co/datasets/tech4humans/signature-detection
