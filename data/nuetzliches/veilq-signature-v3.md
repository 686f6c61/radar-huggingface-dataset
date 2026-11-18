# nuetzliches/veilq-signature-v3

## Resumen

veilq-signature-v3 es un detector de firmas manuscritas en imagenes de documentos, capturas de pantalla y fotografias. Lo publica el usuario nuetzliches como parte del proyecto veilq (ADR-0048), una herramienta que localiza firmas en documentos y las tapa con negro. El modelo es un ajuste fino de mdefrance/yolos-tiny-signature-detection (revision b788cf7376464453c3dea1e5ee8589adcaa0c634, Apache-2.0), del que hereda la arquitectura YOLOS-tiny y la licencia.

El problema que aborda es concreto: el modelo base confundia con firmas elementos habituales de documentos y paginas web, como fotografias, titulares de tarjetas, marcas de agua diagonales, sellos y logotipos. La version v3 se entrena con 2.000 imagenes sinteticas para reducir esos falsos positivos y, a la vez, detectar firmas escritas sobre fotografias (autografos, firmas de autor en una esquina). Se distribuye exclusivamente en formato ONNX (opset 17) con pesos fijados por SHA-256, pensado para inferencia ligera en CPU dentro del pipeline de veilq.

El modelo no verifica ni compara firmas: solo devuelve cajas delimitadoras con una puntuacion de confianza. Su relevancia actual esta en el nicho de anonimizacion y redaccion documental automatizada, donde un detector pequeño, determinista y con licencia permisiva permite integrarse en herramientas de privacidad sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS-tiny (transformer de deteccion de objetos, derivado de ViT), exportado a ONNX |
| Parametros totales | no disponible (el modelo base es YOLOS-tiny; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 640 x 640 px; no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` en float32; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; el entrenamiento usa texto impreso en alfabeto latino) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero `model.onnx` con SHA-256 `9be7393f97d7feb5b1d4585ea8ce456a4204fa5c323b96c0f064f89800bb3105` |

Detalles de entrada y salida:

| Elemento | Especificacion |
|---|---|
| Entrada `pixel_values` | float32 `[1, 3, 640, 640]`, RGB escalado a 0..1 |
| Normalizacion | media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]` |
| Salida `logits` | `[1, 100, 2]` (firma / nada, tras softmax) |
| Salida `pred_boxes` | `[1, 100, 4]` (centro x, centro y, ancho, alto como fracciones de la entrada) |

## Arquitectura y entrenamiento

La arquitectura es YOLOS-tiny, un transformer de deteccion de objetos que aplica un encoder tipo ViT sobre parches de la imagen y decodifica un conjunto fijo de 100 consultas de objetos con sus clases y cajas. El ajuste fino congela los embeddings de parche y las 6 primeras de las 12 capas del encoder; el resto de pesos se reentrena. El modelo se exporta a ONNX en opset 17 y se ejecuta en ONNX Runtime, lo que permite inferencia en CPU sin dependencias de frameworks de deep learning.

El entrenamiento usa 2.000 imagenes sinteticas, ninguna con la firma de una persona real: cartas y capturas de cartas con firmas en fuentes manuscritas (Caveat, Dancing Script, Great Vibes, Homemade Apple, Reenie Beanie, Allura, Sacramento, Kalam, Nothing You Could Do) y trazos dibujados, a veces sobre el nombre o el cargo impreso; marcas de agua diagonales, sellos, logotipos, tablas y lineas; cartas fotografiadas sobre un escritorio con rotacion, caida de luz, ruido y compresion JPEG; paginas web en navegador con tarjetas de fotos, anuncios, listas, graficos y meteorologia; y fotografias firmadas en su cara (14 % del total) con tinta que contrasta con el fondo. Las fotografias proceden de Wikimedia Commons (777 imagenes CC0 o de dominio publico, seleccionadas por tematica y revisadas a mano para retirar las que contenian escritura). Cada sexta foto se reservo para validacion. Nombres y lugares son inventados.

La configuracion de entrenamiento fue de 16 epocas en CPU, lote de 8, AdamW con tasa de aprendizaje 2e-5. La mejor epoca (la 16) se eligio sobre 300 imagenes sinteticas reservadas, maximizando el recall medio por tipo de imagen con firma menos las cajas falsas por imagen, con la lectura propia de veilq (imagen completa y en cuadrados del lado corto cuando la relacion de aspecto se aleja del cuadrado, umbral de puntuacion 0,5, cajas de al menos 40 px de ancho). No se documenta uso de RLHF ni DPO (no es un modelo generativo de texto).

## Capacidades

- Deteccion de firmas manuscritas en imagenes de documentos, capturas de pantalla y fotografias, con cajas delimitadoras y puntuacion de confianza por caja.
- Discriminacion frente a falsos positivos habituales: fotografias sin firma, titulares y tarjetas de fotos en paginas web, marcas de agua diagonales, sellos, logotipos, tablas y lineas.
- Deteccion de firmas escritas sobre una fotografia (autografo, nombre de autor en una esquina) cuando la tinta contrasta con el fondo.
- Deteccion en documentos fotografiados con rotacion, iluminacion desigual, ruido y compresion JPEG.
- Inferencia en CPU mediante ONNX Runtime, con salida determinista y pesos verificables por SHA-256.
- Integracion como componente de redaccion (relleno en negro) de las firmas detectadas en el pipeline de veilq.
- No realiza verificacion, comparacion ni identificacion de firmantes.
- No procesa texto ni mantiene conversaciones: no hay tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica (no procesa lenguaje; el material de entrenamiento contiene texto impreso en alfabeto latino).

## Casos de uso

- Anonimizacion de documentos antes de publicarlos o compartirlos: el modelo localiza las firmas en contratos, cartas y formularios escaneados y veilq las rellena de negro, evitando exponer datos personales en PDF o imagenes que se van a difundir.
- Redaccion de firmas en expedientes legales o administrativos digitalizados: en pipelines de gestion documental, el detector marca las regiones de firma para que un paso posterior las enmascare antes de archivarlas o enviarlas a terceros.
- Saneado de capturas de pantalla y paginas web: al distinguir firmas de fotografias, titulares y marcas de agua, permite procesar capturas de portales, correos o redes sociales sin generar cajas falsas sobre elementos decorativos.
- Deteccion de autografos en imagenes de colecciones o archivos fotograficos: identifica firmas escritas sobre la propia fotografia (retratos dedicados, obras con nombre de autor en la esquina) para catalogacion o para su ocultacion selectiva.
- Preprocesado en herramientas de privacidad de codigo abierto: al ser un ONNX pequeno con licencia Apache-2.0 y pesos fijados por hash, se puede empaquetar en aplicaciones de escritorio o servidores sin GPU y sin llamadas a servicios externos.
- Filtro previo en revision humana de documentos: el detector propone regiones candidatas de firma con una puntuacion, y un revisor confirma o descarta, reduciendo el tiempo de busqueda manual en lotes grandes de imagenes.
- Verificacion de integridad de pipelines: el SHA-256 publicado del fichero `model.onnx` permite comprobar que el modelo desplegado es exactamente el esperado, util en entornos con requisitos de reproducibilidad.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 300 imagenes sinteticas reservadas (170 firmas), leidas con la configuracion de veilq en ONNX Runtime. Se indica firmas encontradas / firmas totales y cajas falsas:

| Tipo de imagen | Imagenes | veilq-signature-v2 | veilq-signature-v3 |
|---|---|---|---|
| Carta sin marca de agua | 73 | 49/51, 3 falsas | 49/51, 1 falsa |
| Carta con marca de agua | 80 | 53/57, 9 falsas | 54/57, 3 falsas |
| Carta fotografiada | 27 | 17/17, 2 falsas | 17/17, 1 falsa |
| Foto firmada en su cara | 40 | 9/40, 0 falsas | 15/40, 1 falsa |
| Pagina web (5 fotos firmadas) | 58 | 0/5, 5 falsas | 2/5, 4 falsas |
| Foto | 22 | 1 falsa | 0 falsas |

El modelo base, medido con el mismo procedimiento, obtiene 109/170 firmas encontradas y 2.048 cajas falsas. En 24 cartas adicionales de otro generador (blanco, crema, gris, fotografiadas, escaneadas, junto a una ventana oscura), v2 y v3 encuentran las 24. Sobre una captura reportada de una pagina de noticias con fotos, v3 no devuelve ninguna caja (v1 devolvia 19).

No se han publicado resultados en benchmarks estandar de deteccion de objetos (COCO, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser YOLOS-tiny exportado a ONNX en float32, el modelo es muy pequeno y puede ejecutarse en CPU. El tamano del repositorio figura como 0.0 GB, lo que sugiere un fichero de pocos megabytes.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo, no requiere GPU dedicada; cualquier GPU consumer moderna seria suficiente si se ejecuta con ONNX Runtime con proveedor CUDA.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer; el autor lo entrena y evalua en CPU.
- Opciones de despliegue: ONNX Runtime (entorno previsto por el autor); el pipeline de veilq lo descarga con `veilq models fetch signature`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia; solo indica que el entrenamiento de 16 epocas se hizo en CPU con lote de 8.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| veilq-signature-v3 | no disponible (YOLOS-tiny) | imagen 640 x 640 | ONNX | Apache-2.0 | Detector de firmas con reduccion de falsos positivos frente al base; entrenado con datos sinteticos |
| mdefrance/yolos-tiny-signature-detection | no disponible (YOLOS-tiny) | imagen | safetensors / transformers | Apache-2.0 | Modelo base; en la misma evaluacion obtiene 109/170 firmas y 2.048 cajas falsas |
| veilq-signature-v2 | no disponible (YOLOS-tiny) | imagen 640 x 640 | ONNX | Apache-2.0 | Version anterior del mismo autor; mejor recall en fotos firmadas (9/40 frente a 15/40), pero mas falsos positivos en cartas con marca de agua y paginas web |

No se dispone de datos de otros detectores de firmas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: las firmas reales, los escaneos y las fotografias reales presentan mas variabilidad de la cubierta, y el rendimiento puede degradarse fuera de las condiciones simuladas.
- Las firmas escritas sobre una fotografia se siguen perdiendo mas a menudo de lo que se encuentran: solo 15 de 40 en la evaluacion (frente a 9 de 40 en v2).
- En paginas web con fotos firmadas el recall es bajo (2 de 5) y persisten 4 cajas falsas; no es fiable para ese tipo de contenido.
- Las marcas de agua pueden seguir generando alguna caja falsa pequena.
- El modelo localiza firmas, pero no las verifica, compara ni identifica al firmante; no debe usarse como prueba de autenticidad.
- No procesa texto ni lenguaje: no hay capacidades de razonamiento, codigo ni conversacion.
- El material de entrenamiento solo contiene texto impreso en alfabeto latino; no se documenta cobertura de otros sistemas de escritura.
- Licencia Apache-2.0, que permite uso comercial; el modelo base se ajusto sobre tech4humans/signature-detection (Tobacco800, Roboflow `signatures-xc8up`), cuyas condiciones deben revisarse en su propia ficha.
- Las fotografias de entrenamiento son CC0 o de dominio publico y no se publican con el modelo; los nombres y lugares del dataset son inventados.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion (2026-11-18) es posterior a la actual; conviene verificar la disponibilidad y el hash antes de integrarlo en produccion.
- No se publican tiempos de inferencia ni curvas de calibracion de la puntuacion de confianza; el umbral 0,5 y el minimo de 40 px son los usados por veilq y pueden no ser optimos para otros pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuetzliches/veilq-signature-v3
- Version anterior: https://huggingface.co/nuetzliches/veilq-signature-v2
- Modelo base: https://huggingface.co/mdefrance/yolos-tiny-signature-detection
- Repositorio de veilq: https://github.com/nuetzliches/veilq
- Dataset del modelo base: https://huggingface.co/datasets/tech4humans/signature-detection
- Fuente de las fotografias de entrenamiento: https://commons.wikimedia.org
- Fuentes manuscritas: https://github.com/google/fonts
