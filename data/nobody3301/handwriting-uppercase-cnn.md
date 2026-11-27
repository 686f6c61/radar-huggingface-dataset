# Nobody3301/handwriting-uppercase-cnn

## Resumen

`Nobody3301/handwriting-uppercase-cnn` es una red neuronal convolucional compacta entrenada desde cero con TensorFlow/Keras para clasificar simbolos manuscritos aislados en escritura cirilica en mayusculas. El modelo resuelve un problema muy concreto: el reconocimiento de un unico caracter por imagen en formularios de examen, donde cada celda contiene un digito, una letra mayuscula, un guion, una coma o esta vacia. No realiza OCR de palabras ni de lineas completas.

El modelo cuenta con 6.008.937 parametros y trabaja sobre imagenes en escala de grises de 278x278 pixeles. Distingue 41 clases: 10 digitos, 28 clases de letras mayusculas cirilicas, un guion o signo menos (`minus`), una coma (`tire`, nombre historico de la clase) y una clase `empty` para celdas en blanco. Cinco pares visualmente identicos letra/digito se fusionan deliberadamente (por ejemplo `Ч/4` y `О/0`), de modo que la desambiguacion final se delega a una capa de contexto posterior.

Es relevante para desarrolladores que necesiten un clasificador de caracteres manuscritos ligero, desplegable en CPU o GPU de consumo, con licencia MIT y un pipeline de preprocesado publicado. Su alcance es acotado: un simbolo por imagen, solo mayusculas y solo alfabeto cirilico. El repositorio ocupa 0,1 GB e incluye el modelo completo en formato HDF5 de Keras, los pesos para aplicacion de escritorio, el orden de clases en JSON y los scripts de preprocesado y etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) implementada en TensorFlow/Keras |
| Parametros totales | 6.008.937 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen, entrada 278x278 en escala de grises) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru (alfabeto cirilico, mayusculas) |
| Licencia | MIT |
| Formato de pesos | HDF5 de Keras (`handwriting_model_full.h5`, `handwriting_model_278x278.h5`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta entrenada desde cero con TensorFlow/Keras, sin indicios de destilacion ni de pesos preentrenados en la informacion disponible. La entrada es una imagen en escala de grises de 278x278 pixeles que representa un unico simbolo; la salida es una distribucion de probabilidad sobre 41 clases. El repositorio incluye un pipeline de preprocesado (`preprocess.py`) que aplica recorte, centrado, CLAHE e inversion, pasos necesarios para reproducir las condiciones de entrenamiento.

El conjunto de datos de entrenamiento es `Nobody3301/handwriting-uppercase`, con 186.152 imagenes repartidas en 41 clases. Incluye 4.000 imagenes de celdas vacias para la clase `empty`, lo que permite al servicio descartar celdas en blanco en lugar de tratarlas como errores. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de imagenes. Tampoco se detalla la composicion exacta del dataset por clase ni el numero de epocas o la funcion de perdida empleada.

Una decision de diseno destacable es la fusion intencionada de cinco pares de clases visualmente indistinguibles en escritura manuscrita mayuscula (`Ч/4`, `О/0`, `7/Т`, `1/Л`). El modelo clasifica el simbolo fusionado y una capa de contexto superior, fuera del modelo, resuelve la ambiguedad. Por ejemplo, en una tarea de palabras, `С10В0` puede leerse como `СЛОВО`. Esto implica que la metrica del 99,98 % es exactitud a nivel de simbolo sobre clases fusionadas, no exactitud a nivel de palabra final.

## Capacidades

- Clasificacion de imagenes de un unico caracter manuscrito en 41 clases: 10 digitos, 28 clases de letras mayusculas cirilicas, guion o signo menos, coma y celda vacia.
- Deteccion de celdas vacias mediante la clase `empty`, util para omitir campos en blanco en formularios.
- Entrada en escala de grises de 278x278 pixeles con pipeline de recorte, centrado, CLAHE e inversion publicado.
- Salida de probabilidades por clase, apta para umbrales de confianza y para desambiguacion contextual posterior.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta minusculas, palabras, lineas ni documentos completos.
- No soporta vision general, audio ni modo de razonamiento.

## Casos de uso

- Correccion automatica de formularios de examen: el modelo clasifica cada celda manuscrita de un formulario escaneado y una capa de contexto resuelve los pares fusionados segun la tarea, lo que permite automatizar la lectura de respuestas en examenes con casillas de un caracter.
- Digitalizacion de hojas de respuestas con casillas de un solo caracter: al aceptar imagenes de 278x278 en escala de grises y disponer de la clase `empty`, el modelo puede procesar lotes de celdas recortadas y descartar las vacias sin generar falsos positivos.
- Preprocesado para pipelines de OCR de palabras cirilicas: el modelo actua como clasificador de caracteres por celda y alimenta una etapa posterior que compone palabras y aplica el contexto linguistico para resolver `Ч/4`, `О/0`, `7/Т`, `1/Л` y similares.
- Verificacion de formularios administrativos en ruso: en documentos con campos de un caracter (iniciales, digitos de identificacion, marcas), el modelo puede validar que la celda contiene un simbolo valido o esta vacia antes de la revision humana.
- Herramienta de escritorio para reconocimiento de simbolos: los pesos `handwriting_model_278x278.h5` estan pensados para una aplicacion de escritorio, por lo que el modelo puede integrarse en herramientas locales sin conexion a un servicio remoto.
- Servicio FastAPI de inferencia: el autor publica una demo en Hugging Face Spaces y un servicio FastAPI en Codeberg, lo que permite desplegar el clasificador como microservicio de reconocimiento de simbolos.
- Generacion de datos sinteticos o aumentados para entrenar modelos mayores: al ser un clasificador ligero con licencia MIT, puede usarse como etiquetador auxiliar en la construccion de datasets de caracteres manuscritos cirilicos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top-1 (ejecucion de entrenamiento) | 99,98 % |
| Top-1 sobre muestra de control aleatoria de 820 imagenes | 99,88 % |
| Top-5 sobre la misma muestra de control | 100 % |
| Parametros | 6.008.937 |
| Entrada | 278x278, escala de grises |
| Dataset | 186.152 imagenes, 41 clases |

La muestra de control de 820 imagenes (20 por clase) es una comprobacion sobre datos recopilados, no un conjunto de test independiente: la particion original de entrenamiento y validacion no se conservo. El unico error de la muestra de control corresponde a la clase `11_alf` (19/20). El autor remite a `docs/evaluation.json` del repositorio para el informe exacto. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 6.008.937 parametros y entrada de 278x278 en escala de grises, el modelo es muy ligero y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo puede ejecutarse en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (por ejemplo, series RTX 30/40) e incluso en CPU.
- Opciones de despliegue: TensorFlow/Keras (`tf.keras.models.load_model`), servicio FastAPI publicado por el autor y aplicacion de escritorio con los pesos `handwriting_model_278x278.h5`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de categoria, este modelo se situa en el nicho de clasificadores de caracteres manuscritos aislados, frente a sistemas OCR de linea completa (que reconocen palabras y frases) y frente a clasificadores genericos de imagenes. La comparacion con alternativas concretas requeriria datos que no se han publicado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nobody3301/handwriting-uppercase-cnn | 6.008.937 | no aplica (imagen 278x278) | 99,88 % top-1 en muestra de control | MIT | Hugging Face |
| Alternativas de OCR de linea completa | no disponible | no disponible | no disponible | no disponible | no disponible |
| Clasificadores genericos de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo reconoce mayusculas; las minusculas no forman parte de la tarea y no estan soportadas.
- Reconoce un unico simbolo por imagen; no realiza reconocimiento de palabras, lineas ni documentos.
- Los pares visualmente similares pueden confundirse (`7/Т`, `1/Л`, `0/О`, `4/Ч`); la resolucion depende de una capa de contexto externa al modelo.
- La cifra del 99,98 % procede de la ejecucion de entrenamiento; la muestra de control no es un conjunto de test independiente y la particion original no se conservo.
- El alcance linguistico se limita al alfabeto cirilico en mayusculas y a los digitos; no cubre otros alfabetos ni otros sistemas de escritura.
- Riesgo de alucinacion en sentido estricto no aplica a un clasificador, pero si existe riesgo de asignar una clase incorrecta con alta confianza en entradas fuera de distribucion (por ejemplo, caracteres minusculos o ruido).
- No se documentan sesgos especificos del dataset; la model card indica que el dataset contiene caracteres manuscritos individuales, no documentos ni metadatos personales.
- Licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar las notas del dataset en el repositorio para condiciones adicionales.
- Para produccion, es necesario reproducir exactamente el pipeline de preprocesado (`preprocess.py`: recorte, centrado, CLAHE e inversion); desviarse de el puede degradar la precision de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nobody3301/handwriting-uppercase-cnn
- Dataset: https://huggingface.co/datasets/Nobody3301/handwriting-uppercase
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Nobody3301/handwriting-demo
- Codigo fuente en Codeberg: https://codeberg.org/nobody-fullstack/handwriting-ai
- Pesos y artefactos de release: https://codeberg.org/nobody-fullstack/handwriting-ai/releases/tag/v1.0.0
