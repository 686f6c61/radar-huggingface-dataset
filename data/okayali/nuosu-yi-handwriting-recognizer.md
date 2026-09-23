# OkayAli/Nuosu-Yi-handwriting-recognizer

## Resumen

Nuosu-Yi-handwriting-recognizer es un modelo de reconocimiento de escritura manuscrita publicado por el usuario OkayAli en Hugging Face. Está especializado en la lengua nuosu yi de Liangshan (código ISO 639-1 «ii»), la variante estandarizada del yi que se habla en la prefectura autónoma yi de Liangshan, en la provincia china de Sichuan. El repositorio distribuye tres modelos en formato ONNX acompañados de sendos scripts de prueba en Python, y uno de ellos, `yi_resnet18_best_shrunk.onnx`, es el que emplea la aplicación oficial de método de entrada (IME) publicada en GitHub.

El proyecto resuelve un problema muy concreto: la entrada de texto en nuosu yi en dispositivos móviles. A diferencia de las lenguas con alfabeto latino, el yi utiliza un silabario de más de mil caracteres, lo que hace que los teclados fonéticos sean lentos e impracticables; el reconocimiento de trazos manuscritos permite escribir a mano alzada y que el modelo transcriba el glifo. El tamaño total del repositorio, 0,1 GB para los tres modelos, confirma que se trata de pesos compactos pensados para inferencia en el propio dispositivo.

La relevancia del proyecto es doble: cubre una lengua minoritaria con recursos digitales escasos y demuestra un patrón de despliegue real (ONNX Runtime dentro de una aplicación Android) en lugar de limitarse a pesos de investigación. Como contrapartida, la documentación publicada es muy escasa: no se declaran parámetros, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con bloques residuales tipo ResNet-18, según el nombre de archivo `yi_resnet18_best_shrunk.onnx`; el repositorio incluye tres modelos ONNX distintos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa una imagen de trazo por inferencia) |
| Tipos de cuantización | no disponible; el sufijo «shrunk» del nombre sugiere algún tipo de reducción o compresión, sin especificar el esquema |
| Idiomas soportados | nuosu yi (`ii`) e inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La única referencia arquitectónica explícita es el nombre del archivo principal, `yi_resnet18_best_shrunk.onnx`, que apunta a una red convolucional con conexiones residuales del tipo ResNet-18 (18 capas con pesos). Se trata, por tanto, de un clasificador o extractor de características de imagen adaptado a glifos manuscritos, no de un transformer generativo. La model card indica que el proyecto contiene tres modelos con sus respectivos scripts de prueba en Python, pero no detalla la arquitectura de los otros dos ni la relación entre ellos. Tampoco se especifica la forma de la salida (clase única de carácter, secuencia de símbolos o mapa de probabilidades), aunque la presencia de la librería `tokenizers` entre las dependencias de prueba sugiere algún tipo de post-procesado textual.

No hay información sobre el conjunto de entrenamiento: se desconoce el número de muestras, si los trazos proceden de escritores nativos, la cobertura del silabario, el preprocesado aplicado ni si hubo aumento de datos. Tampoco se documenta ningún proceso de ajuste fino con retroalimentación humana (RLHF, DPO) ni técnicas de decodificación especulativa; en un modelo de reconocimiento de trazos estos mecanismos no son habituales. La model card atribuye la autoría del proyecto a Aleezizhe y Aliwonfun.

## Capacidades

- Reconocimiento de escritura manuscrita del silabario nuosu yi, orientado a la transcripción de glifos trazados sobre pantalla táctil.
- Integración como motor de reconocimiento dentro de una aplicación de teclado móvil (IME) para Android; la aplicación oficial de referencia está publicada en GitHub.
- Ejecución en formato ONNX, lo que permite desplegarlo con ONNX Runtime tanto en servidor como en dispositivos de borde.
- Modelos de tamaño reducido: el conjunto del repositorio ocupa 0,1 GB, lo que favorece la inferencia en el dispositivo sin conexión.
- Cobertura lingüística declarada de nuosu yi (`ii`) e inglés (`en`).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta capacidad de agentes ni de razonamiento en varios pasos.
- No se documenta modo de razonamiento explícito (*thinking*), visión general, audio ni generación de texto libre.

## Casos de uso

- Teclado móvil para nuosu yi: el modelo actúa como motor de reconocimiento de trazos dentro de una aplicación IME, de modo que el usuario escribe el glifo con el dedo y el sistema lo convierte en el carácter correspondiente. Es el escenario para el que fue diseñado y el único con una implementación pública de referencia.
- Digitalización de documentos manuscritos: digitalización de cartas, actas y notas redactadas a mano en yi para incorporarlas a archivos electrónicos buscables.
- Preservación de patrimonio documental: catalogación de manuscritos históricos en lengua yi conservados en bibliotecas y archivos regionales, donde el reconocimiento automático reduce el coste de transcripción manual.
- Enseñanza del silabario: aplicación educativa que permite a estudiantes practicar la escritura de caracteres yi y recibir corrección automática del trazo.
- Recogida de datos en campo: formularios y censos en zonas rurales de Liangshan donde la entrada manuscrita resulta más rápida que la selección en un teclado silábico.
- Accesibilidad: entrada de texto para personas con dificultades para manejar teclados densos en caracteres, sustituyendo la selección múltiple por el trazo directo.
- Investigación lingüística y corpus: transcripción asistida de grabaciones anotadas a mano para construir corpus digitales de nuosu yi.
- Digitalización de señalización y carteles manuscritos: lectura de rótulos escritos a mano en entornos con baja alfabetización digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, tasa de error por carácter, cobertura del silabario ni comparaciones con otros sistemas, y el repositorio no registra descargas ni valoraciones de la comunidad que permitan inferir un rendimiento validado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con una arquitectura de tipo ResNet-18 y un repositorio de 0,1 GB para tres modelos, es razonable esperar que el modelo activo ocupe del orden de decenas de megabytes y que la inferencia completa quepa holgadamente por debajo de 1 GB de memoria; no hay cifras oficiales publicadas.
- GPU recomendadas: no se especifica ninguna. Por tamaño, el modelo puede ejecutarse en CPU y en cualquier GPU de consumo.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad en cualquier tarjeta con al menos 4 GB de VRAM, e incluso en GPU integradas. El despliegue de referencia es móvil (Android), no de servidor.
- Opciones de despliegue: ONNX Runtime es la vía natural, dado el formato de los pesos. Es compatible con el runtime móvil de Android empleado por la aplicación de referencia. No procede usar vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Para un IME, la latencia objetivo habitual sería inferior a 100 ms por trazo para resultar imperceptible, pero no hay mediciones publicadas.
- Entorno de prueba declarado por el autor: Python 3.12.10 con `tokenizers==0.13.3`, `torch==2.13.0`, `transformers==4.30.2`, `numpy==2.4.6`, `onnxruntime==1.27.0`, `pillow==12.2.0` y `torchvision==0.20.1+cu121`.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos directamente comparables en el mismo dominio (reconocimiento manuscrito del silabario nuosu yi). La tabla siguiente recoge una comparación cualitativa con soluciones genéricas de reconocimiento de escritura, marcando como «no disponible» los datos no verificables a partir de la información facilitada.

| Modelo | Tipo | Idiomas o scripts cubiertos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nuosu-Yi-handwriting-recognizer | CNN tipo ResNet-18 en ONNX | nuosu yi (`ii`), inglés | Apache 2.0 | Hugging Face; aplicación Android de referencia |
| TrOCR (Microsoft) | Transformer codificador-decodificador | Principalmente escritura latina; variantes para otros scripts | Varía según la variante (MIT en las versiones base) | Hugging Face Transformers |
| PaddleOCR | CNN + transformer (CRNN, SVTR y variantes) | Chino, latino y otras escrituras | Apache 2.0 | Repositorio propio y Hugging Face |
| EasyOCR | CRNN | Más de 80 idiomas | Apache 2.0 | Repositorio propio y paquete pip |

La diferencia principal es de cobertura: las alternativas citadas son sistemas generalistas y no documentan soporte del silabario nuosu yi, mientras que este modelo está especializado en esa escritura concreta. Los datos de parámetros y rendimiento de esas alternativas no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no incluye métricas, arquitectura detallada, composición del dataset ni forma de la salida, lo que dificulta evaluar su idoneidad antes de desplegarlo.
- Cero validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe evidencia externa de funcionamiento correcto.
- Cobertura del silabario desconocida: el silabario yi estandarizado supera los mil caracteres, pero no se especifica cuántos reconoce el modelo ni si cubre variantes dialectales o glifos poco frecuentes.
- Sesgos no documentados: al no conocerse la procedencia de los datos de entrenamiento, se ignoran posibles sesgos por estilo de escritura, edad, nivel educativo, región o dispositivo de captura (tableta frente a móvil).
- Riesgo de error de clasificación: no es un modelo generativo y por tanto no «alucina» texto, pero sí puede asignar un carácter incorrecto ante trazos ambiguos, incompletos o con caligrafía atípica.
- Entrada limitada a trazos manuscritos: no procesa texto impreso ni imágenes fotográficas de documentos, salvo que los modelos no documentados del repositorio cubran ese caso.
- Idiomas limitados a `ii` y `en`, según las etiquetas del repositorio; no se declara soporte de chino ni de otras lenguas vecinas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con conservación del aviso de licencia y del archivo NOTICE; conviene revisar si el uso de la aplicación de referencia añade condiciones propias.
- Entorno de prueba inusual: las versiones fijadas en la model card (`torch==2.13.0`, `numpy==2.4.6`, `onnxruntime==1.27.0`) son superiores a las distribuciones habituales y `torchvision==0.20.1+cu121` no guarda correspondencia con `torch==2.13.0`; es probable que haya que ajustar el entorno para reproducir las pruebas.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores al momento de redacción de esta ficha, un detalle que conviene verificar en la página del modelo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/OkayAli/Nuosu-Yi-handwriting-recognizer
- Aplicación de teclado (IME) para yi en Android, «819彝文输入法»: https://aleeyoung.github.io/aliyiime/
