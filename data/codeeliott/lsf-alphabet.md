# CodeEliott/lsf-alphabet

## Resumen

El modelo `lsf-alphabet` (v0.1) es un clasificador de imagenes muy ligero que reconoce las 26 letras del alfabeto dactilologico de la Lengua de Signos Francesa (LSF) a partir de los 21 puntos de referencia de la mano que extrae MediaPipe. Lo desarrollan Eliott Montagnon y Leonardo (CentraleSupélec) y se publica bajo licencia Apache 2.0. No procesa imagenes directamente: consume un vector de 60 caracteristicas derivado de los landmarks, lo que lo hace extremadamente pequeno (129 KB en un unico JSON) y apto para ejecutarse en el navegador en tiempo real sin enviar video a ningun servidor.

Se trata de una red neuronal fully-connected de tres capas (60 → 128 → 64 → 26) con activaciones ReLU y salida softmax, entrenada sobre puntos de mano extraidos de 19 videos publicos de YouTube de personas deletreando el alfabeto LSF. No es un modelo de lenguaje ni un transformer: es una pieza de vision por computador especializada y acotada, pensada como ayuda para el aprendizaje del deletreo manual y como base para investigacion en reconocimiento de lengua de signos.

Su relevancia radica en ser, segun sus autores, el primer modelo abierto para el alfabeto LSF, con un rendimiento reportado del 93% en signantes no vistos durante el entrenamiento. Es una herramienta de nicho, no un modelo generativo, y su uso previsto excluye explicitamente la evaluacion, certificacion o identificacion de personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP): 60 → 128 → 64 → 26, ReLU, softmax |
| Parametros totales | no disponible (pesos en un JSON de 129 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 60 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos en JSON, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | fr (etiquetas del alfabeto LSF; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`letters.json`, 129 KB) |

## Arquitectura y entrenamiento

El modelo es un perceptron multicapa de tres capas ocultas/secuenciales (60 entradas, 128 unidades, 64 unidades, 26 salidas) con ReLU en las capas ocultas y softmax en la salida, que devuelve una probabilidad por cada letra de la a a la z. La entrada son 60 numeros derivados de los 21 puntos de mano de MediaPipe: se toman los puntos 1 a 20 (excluyendo la muneca), se escalan las coordenadas x e y por la relacion ancho/alto de la imagen y se normaliza todo por la distancia 3D entre la muneca y el nudillo del dedo medio. El preprocesado incluye una estandarizacion previa a la inferencia.

El entrenamiento se realizo sobre puntos de mano extraidos de 19 videos publicos de YouTube de personas deletreando el alfabeto LSF (uno de ellos con licencia CC BY, de Laura Jauvert; el resto amparados en la excepcion de mineria de textos y datos de la Directiva 2019/790, art. 4). Las etiquetas de letras se asignaron de forma programatica (orden A a Z) y se verificaron manualmente en casos dudosos. Los videos se eliminaron tras el seguimiento y no se publican imagenes, caras ni puntos de mano. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de aumento de datos mas alla del preprocesado descrito.

## Capacidades

- Clasificacion de las 26 letras del alfabeto dactilologico LSF a partir de landmarks de mano (una letra por imagen o fotograma).
- Inferencia en tiempo real en el navegador con MediaPipe, sin enviar video al servidor.
- Salida de probabilidades por letra (softmax sobre 26 clases), lo que permite umbralizar la confianza.
- Funcionamiento con un unico fichero JSON de 129 KB, facil de desplegar en entornos web.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto, audio ni imagenes completas: solo el vector de 60 caracteristicas de la mano.
- Capacidad multilingue limitada al alfabeto LSF (variante francesa); no cubre otras lenguas de signos.

## Casos de uso

- Aprendizaje del alfabeto LSF: una aplicacion web puede mostrar la letra detectada en tiempo real para que el estudiante compare su deletreo con el correcto, usando la salida de probabilidades para dar retroalimentacion inmediata.
- Demo educativa en el navegador: el modelo se integra con MediaPipe en JavaScript y permite practicar sin instalar nada ni subir video, lo que reduce barreras de privacidad en aulas y talleres.
- Investigacion en reconocimiento de lengua de signos: sirve como linea base ligera para experimentos de clasificacion de configuraciones manuales, comparable con el baseline de 80% reportado por los autores.
- Prototipado de interfaces accesibles: desarrolladores pueden integrar el clasificador en aplicaciones de deletreo asistido o juegos de aprendizaje del alfabeto manual.
- Herramienta de apoyo para docentes de LSF: permite verificar de forma automatica, con las cautelas de precision, la ejecucion de letras estaticas en ejercicios de clase.
- Filtrado o preprocesado en pipelines mayores: al ser un modelo de 129 KB, puede actuar como primera etapa que descarte fotogramas sin mano o con configuraciones no reconocidas antes de un modelo mas costoso.
- Experimentacion con landmarks frente a imagenes: util para comparar el rendimiento de clasificadores sobre puntos de mano (privacidad, tamano) frente a enfoques basados en pixeles.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Signantes de YouTube no vistos | 93% (118/127 letras) | 5 signantes reservados; modelo entrenado con los otros 14 |
| Signante sordo grabado con la pagina webcam | 87% (45/52 intentos) | Verificacion manual letra a letra |
| Baseline (vecino mas cercano a un signante de referencia) | 80% | — |

Confusiones frecuentes reportadas: F/T, H/I, X/V, U/R, D/R y P con Q o Z. Las letras J y Z implican movimiento y el modelo solo ve una imagen estatica por vez, por lo que su deteccion es especialmente propensa a error. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo es un JSON de 129 KB y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna, incluidos dispositivos moviles.
- Cabe en cualquier GPU consumer e incluso en navegadores y telefonos; no hay requisito de VRAM significativo.
- Opciones de despliegue: JavaScript en navegador (demo oficial), MediaPipe para la extraccion de landmarks, y cualquier runtime que cargue los pesos JSON (por ejemplo, implementaciones en Python o Node).
- Latencia y throughput: no se han publicado cifras concretas; al tratarse de una red de tres capas y 129 KB, la inferencia es del orden de microsegundos a milisegundos por fotograma en CPU, aunque el cuello de botella real es la extraccion de landmarks de MediaPipe.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeEliott/lsf-alphabet | MLP sobre landmarks | 60 caracteristicas | 26 (alfabeto LSF) | Apache 2.0 | Hugging Face, GitHub, demo web |
| Baseline del propio autor (vecino mas cercano) | Comparacion con signante de referencia | Landmarks | 26 | — | Descrito en la model card |
| Otros modelos de alfabeto LSF abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos abiertos comparables de alfabeto LSF con los que establecer una comparativa cuantitativa; los autores afirman que, segun su conocimiento, es el primero de su categoria.

## Limitaciones y advertencias

- Solo reconoce el alfabeto, una letra a la vez; no entiende signos LSF, frases ni expresiones faciales.
- Entrenado con solo 19 signantes, en su mayoria adultos y filmados de frente; ninos, iluminacion inusual y vistas laterales no estan probados.
- Las letras con movimiento (J y Z) se evaluan sobre una unica imagen estatica, lo que limita su deteccion.
- No se ha medido la tasa a la que una letra mal ejecutada se acepta como correcta (falsos positivos), lo que es un caveat importante para uso en evaluacion.
- Puede fallar con variantes regionales del alfabeto LSF.
- Riesgo de sesgo por la composicion limitada de signantes y condiciones de grabacion.
- Uso previsto restringido: no debe emplearse para calificar, certificar ni identificar a personas.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento se amparan en la excepcion de mineria de textos y datos de la UE; los autores ofrecen retirar videos a peticion mediante issue en GitHub.
- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts; cualquier expectativa en ese sentido es erronea.

## Enlaces

- Hugging Face: https://huggingface.co/CodeEliott/lsf-alphabet
- Repositorio GitHub (codigo, lista de datos, instrucciones): https://github.com/CodeEliott/lsf-alphabet
- Demo en navegador: https://codeeliott.github.io/lsf-alphabet/demo/
- Lista de videos y creditos (`VIDEOS.md`): https://github.com/CodeEliott/lsf-alphabet/blob/main/VIDEOS.md
- Cita: Montagnon, E. and Leonardo (2026). Open LSF alphabet model, v0.1. https://github.com/CodeEliott/lsf-alphabet
