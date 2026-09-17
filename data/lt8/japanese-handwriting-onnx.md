# LT8/japanese-handwriting-onnx

## Resumen

LT8/japanese-handwriting-onnx es un modelo ONNX de clasificación de imágenes publicado por el usuario LT8 que reconoce un único carácter japonés manuscrito entre 3.082 clases: los 2.965 kanji del nivel 1 de JIS X 0208 más hiragana y katakana. Se distribuye como grafo ONNX (opset 20) con tres variantes de precisión: `model.fp16.onnx` de 14,5 MB, `model.int8.onnx` de 10,9 MB y `model.onnx` de 28,8 MB en fp32. El contrato de entrada es un tensor `(N, 1, 128, 128)` float32 en escala de grises con eje de lote dinámico, y la salida son logits `(N, 3082)`.

Su interés práctico está en dos factores. Primero, el preprocesado —normalización de contraste, recorte del cuadro delimitador, relleno cuadrado y redimensionado— está compilado dentro del grafo ONNX, de modo que el integrador entrega una imagen en gris y lee directamente los logits, sin reimplementar pasos que suelen introducir errores sutiles. Segundo, el coste de inferencia es muy bajo: unos 3,2 ms por carácter en CPU y aproximadamente 40 ms en el navegador mediante ONNX Runtime Web, para un fichero que cabe en cualquier presupuesto de memoria.

El modelo reporta un 99,79 % de top-1 y un 99,99 % de top-5 sobre un conjunto de prueba con escritores disjuntos, un 98,98 % de top-1 sobre ETL8G (corpus nunca visto, distinto escáner y época) y un 99,60 % de top-1 en la evaluación extremo a extremo a través del grafo desplegado. La licencia es `other` con `license_name: etl-character-database`, lo que obliga a revisar los términos de la base de datos ETL antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la topologia interna; se distribuye como grafo ONNX de clasificacion de imagenes con entrada `(N, 1, 128, 128)` y salida de logits `(N, 3082)`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 128 x 128 pixeles en escala de grises) |
| Tipos de cuantizacion | fp32 (28,8 MB), fp16 (14,5 MB), int8 (10,9 MB; -0,1 puntos porcentuales de top-1 segun la model card) |
| Idiomas soportados | japones (ja): kanji JIS X 0208 nivel 1, hiragana y katakana |
| Licencia | other; `license_name: etl-character-database`; enlace: https://etlcdb.db.aist.go.jp/?lang=en |
| Formato de pesos | ONNX (opset 20): `model.onnx`, `model.fp16.onnx`, `model.int8.onnx` |
| Numero de clases | 3.082 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | image-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no especifica la topologia interna del clasificador (no indica si es convolucional, híbrido o de otro tipo), solo el contrato del grafo: entrada `input` de forma `(N, 1, 128, 128)` en float32 con eje de lote dinámico, salida `logits` de forma `(N, 3082)` y opset 20. Los valores de entrada son escala de grises ordinaria de 0 a 255. La polaridad de la tinta se detecta automáticamente, de manera que una imagen con trazo oscuro sobre fondo claro y su inversa producen resultados idénticos. La innovación declarada es que el preprocesado completo (normalización de contraste, recorte del cuadro delimitador, relleno cuadrado y redimensionado) vive dentro del grafo, lo que elimina la necesidad de replicarlo en el código de integración.

Los datos de entrenamiento proceden de ETL9G: 120.000 imágenes de entrenamiento y 33.534 de prueba, con particiones disjuntas por escritor. Como los registros de ETL9G no incluyen campo de escritor, la clave se reconstruyó a partir de la disposición de hojas y bloques en 4.000 escritores y se verificó después: cero solapamiento de escritores entre particiones y cero imágenes duplicadas entre entrenamiento y prueba. La model card señala de forma explícita que una partición aleatoria habría inflado los resultados —de hecho, la cifra anterior del propio proyecto era un 98,6 %, inferior a la reportada ahora—. ETL8G nunca se usa en entrenamiento y se evalúa sobre las 3.082 clases completas, no solo sobre las 952 que contiene, para no convertir la cifra más pesimista en un problema 3,2 veces más fácil. No se menciona RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un clasificador de imágenes.

## Capacidades

- Reconocimiento de un único carácter japonés manuscrito entre 3.082 clases: kanji del nivel 1 de JIS X 0208, hiragana y katakana.
- Clasificación de imágenes en escala de grises con polaridad de tinta automática (trazo oscuro sobre claro o claro sobre oscuro dan el mismo resultado).
- Preprocesado integrado en el grafo: normalización de contraste, recorte del cuadro delimitador, relleno cuadrado y redimensionado a 128 x 128.
- Salida de logits completa sobre las 3.082 clases, lo que permite top-k y estimación de confianza por clase.
- Inferencia por lotes: el eje de lote del tensor de entrada es dinámico.
- Ejecución en navegador mediante ONNX Runtime Web, con demo de un solo fichero (`index.html`) que incluye lienzo de dibujo y top-5 con confianzas.
- Fichero auxiliar `confusable.json` con pares de caracteres que resultan indecidibles de forma aislada.
- Ajuste de robustez declarado frente a trazo más grueso o más fino, desenfoque, bajo contraste y ruido.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto: la tarea es exclusivamente la clasificación de un carácter aislado.

## Casos de uso

- Digitalización de formularios manuscritos japoneses: cada celda recortada de la hoja se envía al modelo y se obtiene el carácter con su confianza, lo que permite reconstruir campos manuscritos de fichas y encuestas digitalizadas.
- Corrección y normalización de datos introducidos a mano: al procesar un formulario escaneado, el modelo puede señalar celdas cuya confianza top-1 es baja y derivarlas a revisión humana en lugar de aceptarlas silenciosamente.
- Aplicación web de práctica de escritura japonesa: la demo de navegador incluida (ONNX Runtime Web, ~40 ms por carácter, sin backend) permite dibujar un carácter y recibir las cinco hipótesis más probables, útil para herramientas de aprendizaje de kanji.
- Búsqueda de caracteres por trazo dibujado: un usuario que no recuerda cómo se lee un kanji puede dibujarlo en una interfaz y usar la salida top-5 para lanzar una búsqueda en un diccionario.
- Anotación asistida de corpus históricos o escaneados: el modelo evalúa ETL8G —corpus con distinto escáner y época— con un 98,98 % de top-1, lo que respalda su uso como generador de preanotaciones sobre material fuera de su dominio de entrenamiento, siempre con revisión posterior.
- Limpieza de inventarios de caracteres: dado un directorio de recortes de glifos, el modelo puede agruparlos por etiqueta predicha y detectar duplicados o entradas mal clasificadas en una base de datos de caracteres.
- Integración en el navegador sin servidor de inferencia: al ejecutarse con ONNX Runtime Web sobre un host estático, el reconocimiento puede hacerse íntegramente en el cliente, lo que evita enviar imágenes manuscritas a un servicio externo y simplifica el cumplimiento de requisitos de privacidad.
- Clasificación masiva de glifos generados o sintéticos: con lotes dinámicos y 3,2 ms por carácter en CPU, es viable etiquetar conjuntos grandes de recortes en hardware modesto, por ejemplo para validar canalizaciones de renderizado de fuentes.

## Benchmarks y rendimiento

Datos publicados en la model card (porcentajes top-1 y top-5):

| Particion | Top-1 | Top-5 | Que mide |
|---|---|---|---|
| test (escritores disjuntos, mismo corpus) | 99,79 % | 99,99 % | Escritores no vistos |
| ETL8G (corpus nunca entrenado) | 98,98 % | 99,81 % | Corpus, escáner y época distintos |
| grafo desplegado, escaneos crudos reservados | 99,60 % | 99,93 % | Evaluación extremo a extremo tal como se invoca |

Robustez declarada sobre la partición de prueba (top-1):

| Condicion | Top-1 |
|---|---|
| Tinta plana de bordes duros (dibujo en lienzo) | 99,72 % |
| Trazo mas grueso | 99,79 % |
| Trazo mas fino | 99,73 % |
| Desenfocado | 99,76 % |
| Bajo contraste | 99,77 % |
| Con ruido | 99,76 % |
| Desenfocado y con ruido | 99,73 % |
| Rotado 20 grados | 100 % |
| Rotado 30 grados | 81 % |

La model card indica que 7 de las 3.082 clases quedan por debajo del 90 % de top-1 en la partición de prueba. También menciona evaluaciones sobre dos corpus excluidos por completo del entrenamiento con escáner distinto, pero el texto disponible está truncado y no permite reproducir esas cifras. No se aportan comparaciones con otros modelos en los datos disponibles.

## Requisitos de hardware

- Tamano de pesos: 28,8 MB (fp32), 14,5 MB (fp16), 10,9 MB (int8).
- VRAM estimada: inferior a 1 GB en cualquiera de las precisiones, incluidas las activaciones de un lote pequeno. Es una estimacion propia a partir del tamano de fichero; la model card no publica cifras de VRAM.
- CPU: no requiere GPU. La model card declara 3,2 ms por caracter en CPU, lo que equivale a unos 310 caracteres por segundo por hilo (calculo derivado de la cifra publicada).
- Navegador: aproximadamente 40 ms por caracter con ONNX Runtime Web.
- GPU recomendadas: no son necesarias; cualquier GPU, incluidas las integradas, es suficiente. Aceleradores como A100 o H100 no aportan ventaja relevante para un modelo de este tamano.
- GPU de consumo: si, cabe en cualquier GPU de consumo, en iGPU y en CPU, dado el tamano del fichero.
- Opciones de despliegue: ONNX Runtime en Python (ejemplo `predict.py` incluido) y ONNX Runtime Web en navegador (demo `index.html`, que debe servirse por HTTP; abrirla con `file://` falla porque el origen nulo bloquea las llamadas `fetch()`). vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: 3,2 ms por caracter en CPU y ~40 ms en navegador segun la model card. El eje de lote dinamico permite amortizar coste con lotes, aunque no se publican cifras de throughput por lote.
- Nota de arquitectura de despliegue: el modelo clasifica un caracter aislado; cualquier flujo sobre una pagina completa necesita ademas un detector o segmentador de caracteres que no forma parte de este repositorio.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes (los enlaces recuperados no guardan relacion con el modelo), y la informacion proporcionada no incluye cifras de ningun competidor. Por tanto, no hay datos verificables para comparar parametros, contexto, rendimiento ni licencia con alternativas.

| Modelo | Tipo | Clases | Top-1 publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LT8/japanese-handwriting-onnx | Clasificador ONNX de caracter aislado | 3.082 | 99,79 % (test, escritores disjuntos) | other (`etl-character-database`) | ONNX, 14,5 MB fp16 / 10,9 MB int8 |
| Alternativas de OCR japones (Tesseract, PaddleOCR, APIs comerciales de vision) | no disponible | no disponible | no disponible | no disponible | no disponible |

Las alternativas funcionales serian los sistemas OCR de proposito general y las APIs de vision en la nube, pero no se dispone de datos de benchmark de esas opciones en la informacion facilitada, por lo que cualquier comparacion numerica seria inventada.

## Limitaciones y advertencias

- Ambito de un solo caracter: no realiza segmentacion de lineas ni de paginas. Para OCR de documentos completos hace falta un detector externo.
- Clases problematicas: 7 de las 3.082 clases quedan por debajo del 90 % de top-1 en la particion de prueba.
- Pares confundibles: el repositorio incluye `confusable.json` con pares de caracteres que son indecidibles de forma aislada; en esos casos el modelo no puede resolver por si solo sin contexto adicional.
- Sensibilidad a la rotacion: el rendimiento se mantiene con 20 grados de rotacion pero cae al 81 % con 30 grados.
- Dependencia de la particion: los resultados solo son interpretables como rendimiento real porque las particiones son disjuntas por escritor. Cualquier evaluacion propia con particion aleatoria dara cifras infladas, segun advierte la propia model card.
- Dominio de entrenamiento acotado: los datos proceden de ETL9G, con su escaner y su epoca; el propio autor reporta una caida de casi un punto de top-1 al pasar a ETL8G, lo que anticipa degradacion en manuscritos o digitalizaciones mas alejados de ese dominio.
- Desajuste potencial entre la documentacion y el ejemplo: la model card afirma que todo el preprocesado esta compilado en el grafo, pero el ejemplo de referencia en Python sigue realizando el relleno cuadrado (con el nivel mediano de la imagen) y el redimensionado a 128 x 128 antes de la llamada. Conviene verificar el contrato exacto del grafo antes de integrarlo.
- Idioma: solo japones. No se declara ningun otro idioma ni caracteres fuera del conjunto cubierto.
- Licencia: es `other`, con nombre `etl-character-database` y enlace a la base de datos ETL. Los terminos concretos (incluido el uso comercial) no se detallan en la informacion disponible y deben revisarse en el enlace antes de cualquier despliegue en produccion.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (17 de septiembre de 2026). No hay confirmacion independiente de las cifras publicadas, que provienen exclusivamente del autor.
- Sesgos: no se aporta informacion sobre sesgos por estilo de escritura, demografia de los escritores o soporte de caracteres fuera de JIS X 0208 nivel 1.
- Riesgo de alucinacion en sentido estricto: no aplica, ya que no genera texto; el riesgo equivalente es una clasificacion erronea con confianza alta, mitigable usando la salida top-5 y el umbral de confianza.
- Versiones futuras: la model card anuncia un modelo destilado de aproximadamente la mitad de parametros y unos 7 MB en fp16, con el mismo contrato de entrada. Su coste en precision aun no se ha medido y no debe asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LT8/japanese-handwriting-onnx
- Licencia de la base de datos de caracteres ETL: https://etlcdb.db.aist.go.jp/?lang=en
- Ficheros incluidos en el repositorio: `model.fp16.onnx`, `model.int8.onnx`, `model.onnx`, `labels.json`, `confusable.json`, `predict.py`, `index.html`
- La busqueda web realizada no devolvio papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados obtenidos no eran pertinentes.
