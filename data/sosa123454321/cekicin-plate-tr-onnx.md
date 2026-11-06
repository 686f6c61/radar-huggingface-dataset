# sosa123454321/cekicin-plate-tr-onnx

## Resumen

Çekicin plate reader es un paquete de dos modelos ONNX de pequeno tamano publicados por el usuario sosa123454321 (proyecto Çekicin) para la deteccion y lectura de matricula de vehiculos turcas directamente en el navegador mediante onnxruntime-web. No se trata de un modelo de lenguaje, sino de un pipeline ALPR/ANPR (reconocimiento automatico de matricula) compuesto por un detector YOLOv9-t a 384 px y un OCR CCT-S v2 con cabeza de pais. El objetivo es que la imagen nunca salga del dispositivo del usuario, lo que encaja con los requisitos de proteccion de datos personales (KVKK en Turquia, RGPD en la UE).

El valor practico esta en el post-procesador especifico para Turquia que anade el autor: valida el formato provincial 01-81, corrige confusiones tipicas de OCR (O/0, I/1, S/5, B/8) y aplica enmascarado de matriculas. Los pesos originales provienen de los proyectos MIT de ankandrew (open-image-models y fast-plate-ocr), por lo que el modelo es un empaquetado y adaptacion, no un entrenamiento desde cero.

Es relevante ahora por dos motivos: el despliegue 100 % en cliente elimina costes de servidor y problemas de soberania de datos, y el rendimiento medido sobre 250 fotos reales de matriculas turcas (92,8 % de lectura completa correcta, 98,4 % de caracteres correctos, 64 ms por foto en 2 vCPU) es suficiente para aplicaciones de control de acceso o registro de vehiculos en produccion ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLOv9-t (384 px, NMS integrado) + OCR CCT-S v2 (10 slots x 37 caracteres, cabeza de pais de 66 regiones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el OCR reconoce caracteres de matricula; post-procesado especifico para Turquia) |
| Licencia | MIT |
| Formato de pesos | ONNX (`plate_detector_yolov9t_384.onnx` 7,4 MB; `plate_ocr_cct_s_v2.onnx` 5,0 MB) |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas. La primera es un detector YOLOv9-t con entrada de 384 px que incorpora la supresion de no maximos dentro del propio grafo ONNX, de modo que la salida ya son cajas filtradas. La segunda es un OCR CCT-S v2 que divide la matricula en 10 posiciones y clasifica cada una sobre un vocabulario de 37 caracteres, anadiendo una cabeza auxiliar de pais con 66 regiones. Ambos grafos suman unos 12,4 MB en disco, lo que permite cargarlos en un navegador sin penalizacion apreciable.

El entrenamiento no lo realiza el autor de este repositorio: los pesos proceden de `ankandrew/open-image-models` (variante `yolo-v9-t-384-license-plate-end2end`) y de `ankandrew/fast-plate-ocr` (`cct-s-v2-global-model`), ambos bajo licencia MIT segun la model card. Sobre esa base, Çekicin anade unicamente logica de post-procesado en JavaScript: validacion del formato turco (provincia 01-81, 1-3 letras, 2-4 digitos), correccion de confusiones OCR y enmascarado KVKK. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo etapas de ajuste fino o RLHF.

## Capacidades

- Deteccion de matricula en imagenes de vehiculos con un detector YOLOv9-t de 384 px y NMS integrado en el grafo.
- Lectura OCR de matriculas con 10 posiciones y 37 clases de caracteres por posicion.
- Clasificacion de pais/region mediante cabeza auxiliar de 66 regiones.
- Post-procesado especifico para matriculas turcas: validacion de provincia (01-81), estructura de letras y digitos, y correccion de errores tipicos (O/0, I/1, S/5, B/8).
- Enmascarado de matriculas (KVKK) antes de almacenar o mostrar la imagen.
- Inferencia 100 % en cliente mediante onnxruntime-web, sin envio de la imagen a un servidor.
- Ejecucion en CPU (medida sobre 2 vCPU), sin requerir GPU.

## Casos de uso

- Control de acceso a parkings y recintos: el detector localiza la matricula y el OCR la lee en el navegador del operador o en un dispositivo empotrado, permitiendo validar la entrada contra una lista blanca sin transmitir imagenes a la nube.
- Registro de flotas y kilometraje: una aplicacion web puede capturar la matricula del vehiculo al inicio y fin de ruta y almacenar solo el texto, reduciendo el tratamiento de datos personales al minimo.
- Cumplimiento KVKK/RGPD en camaras urbanas: el enmascarado integrado permite mostrar o guardar imagenes con la matricula difuminada, manteniendo el dato legible solo en memoria durante el procesamiento.
- Verificacion de matriculas en portales de venta de vehiculos: el usuario sube una foto y el modelo extrae la matricula para autocompletar el formulario, con la imagen procesada localmente.
- Aplicaciones moviles o PWA de bajo coste: al pesar 12,4 MB en total y ejecutarse en CPU en 64 ms por foto, cabe en un service worker y funciona en dispositivos modestos sin backend.
- Auditoria de imagenes en lotes pequenos: un script Node.js o una pagina web puede procesar carpetas de fotos y generar un CSV de matriculas detectadas, con la ventaja de que no hay coste de inferencia en servidor.
- Demostraciones y prototipos de ALPR para el mercado turco: sirve como linea base rapida para validar la viabilidad de un producto antes de invertir en un modelo propio o en un ajuste fino.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el registro Zenodo 23369685 *Turkish License Plate 250* (250 fotos reales, CC-BY-4.0), sin ajuste fino, en CPU de 2 vCPU:

| OCR | Matricula localizada | Lectura completa correcta | Caracteres correctos | ms por foto |
|---|---|---|---|---|
| cct-s-v2 (este repo) | 100 % | 92,8 % | 98,4 % | 64 |
| cct-xs-v2 | 100 % | 84,8 % | 97,0 % | 39 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal; los modelos suman 12,4 MB en disco y se ejecutan en CPU. En GPU, el consumo de memoria es inferior a 1 GB.
- GPU recomendadas: no son necesarias. Cualquier GPU compatible con onnxruntime-web (WebGPU) o con onnxruntime nativo puede acelerar la inferencia, pero no se documentan cifras.
- Cabe en GPU de consumo: si, en cualquier GPU moderna; tambien funciona en CPU de 2 vCPU, que es el entorno medido.
- Opciones de despliegue: onnxruntime-web (navegador, con o sin WebGPU), onnxruntime nativo (Python, C++, Node.js), y cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime GenAI no aplica; TGI, vLLM y llama.cpp no son compatibles con este tipo de grafo).
- Latencia y throughput estimados: 64 ms por foto con cct-s-v2 y 39 ms con cct-xs-v2 en 2 vCPU; el throughput no se documenta, pero a partir de la latencia se puede estimar en torno a 15 fotos por segundo por nucleo en el primer caso.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Çekicin plate reader (este repo) | Detector + OCR ONNX | 12,4 MB | Imagen 384 px | 92,8 % lectura completa en 250 fotos turcas | MIT | Hugging Face |
| ankandrew/open-image-models (yolo-v9-t-384-license-plate-end2end) | Detector YOLOv9-t | no disponible | Imagen 384 px | no disponible | MIT | GitHub |
| ankandrew/fast-plate-ocr (cct-s-v2-global-model) | OCR CCT | no disponible | 10 slots x 37 caracteres | no disponible de forma aislada | MIT | GitHub |
| cct-xs-v2 | OCR CCT | no disponible | 10 slots x 37 caracteres | 84,8 % lectura completa en el mismo conjunto | MIT | GitHub |

La comparativa se limita a los componentes de origen, ya que no se dispone de datos de otros pipelines ALPR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en matriculas turcas; el formato y el post-procesado asumen provincia 01-81 y estructura de 1-3 letras y 2-4 digitos, por lo que su uso con matriculas de otros paises requerira adaptar el post-procesado.
- La tasa de lectura completa correcta es del 92,8 %, lo que implica aproximadamente 1 de cada 14 matriculas puede leerse con algun caracter erroneo; en produccion conviene anadir validacion externa o reintento.
- No se documentan sesgos especificos, pero al ser un OCR entrenado con un dataset global y evaluado solo sobre 250 fotos turcas, el rendimiento puede degradarse con condiciones de iluminacion, angulos o suciedad no representadas.
- Las matriculas son datos personales bajo KVKK y RGPD; el autor advierte explicitamente de que deben enmascararse antes de almacenarlas o mostrarlas.
- La licencia MIT permite uso comercial, pero los pesos derivan de proyectos de terceros (ankandrew); conviene verificar la cadena de licencias y atribuciones antes de redistribuir.
- No se dispone de informacion sobre cuantizacion, parametros totales ni composicion del dataset de entrenamiento, lo que limita la reproducibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una fecha de creacion futura (2026-10-27), lo que sugiere que es un artefacto reciente o de verificacion; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/sosa123454321/cekicin-plate-tr-onnx
- Repositorio de origen del detector: https://github.com/ankandrew/open-image-models
- Repositorio de origen del OCR: https://github.com/ankandrew/fast-plate-ocr
- Conjunto de evaluacion: registro Zenodo 23369685 *Turkish License Plate 250* (CC-BY-4.0)
- Issue de licencia de pesos citado por el autor: issue #99 de fast-plate-ocr
