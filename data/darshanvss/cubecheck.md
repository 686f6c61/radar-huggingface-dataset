# darshanvss/cubecheck

## Resumen

CubeCheck es una familia de redes neuronales pequenas y especializadas que verifican si un cubo de Rubik esta correctamente desordenado (scrambled) a partir de una sola vista de camara, para cubos de 2x2 hasta 7x7. Lo desarrolla darshanvss y alimenta la web check.cubing.in, donde los modelos se ejecutan directamente en el navegador mediante ONNX Runtime. El problema que resuelve es concreto: en competiciones de speedcubing el scrambler debe comprobar manualmente que aplico la secuencia de mezcla correcta, y este sistema ofrece una verificacion automatica por vision.

La version v0.2.0 sustituye la anterior v0.1.0 (que solo cubria 3x3) por un conjunto de tres redes: un localizador de esquinas (finder), un refinador de esquinas (refiner) y un lector de pegatinas (reader) que funciona para todos los tamanos. El finder y el refiner son U-Nets pequenas de 2,5 M de parametros (10 MB cada una en PyTorch, 9,9 MB en ONNX); el reader es una CNN pequena con una red de posicion y dos capas transformer, de 0,72 M de parametros (2,9 MB). El repositorio ocupa 0,1 GB.

Es relevante ahora porque demuestra un caso de uso de vision por computador muy acotado resuelto con modelos de menos de 3 M de parametros desplegables en navegador, con entrenamiento exclusivamente sintetico (unos 127.000 renders 3D) y resultados medidos por tamano de cubo. No es un modelo de lenguaje ni un modelo multimodal general: es un pipeline de deteccion de puntos clave y clasificacion de color orientado a una tarea unica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Finder y refiner: U-Net pequena (deteccion de puntos clave). Reader: CNN pequena con red de posicion y 2 capas transformer (clasificacion de color por pegatina) |
| Parametros totales | Finder: 2,5 M; refiner: 2,5 M; reader: 0,72 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch y ONNX sin cuantizacion documentada) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (solo pesos, settings y scores; cargables con `weights_only=True`) y ONNX (finder, refiner y reader-N para N = 2 a 7) |

## Arquitectura y entrenamiento

El pipeline separa localizacion y lectura. El finder procesa el fotograma completo a 256x256 y responde si hay un cubo y donde estan aproximadamente sus 7 esquinas visibles; el refiner toma un recorte a 256x256 y precisa esas 7 esquinas. El reader recibe las tres caras visibles de un cubo NxN rectificadas a 24 px por pegatina y clasifica cada una de las 3N² pegatinas en una de seis colores o en "cubierta" (por ejemplo, por un dedo). El entrenamiento es exclusivamente sintetico: unos 127.000 renders 3D de 1280x720 de cubos de 2x2 a 7x7 en habitaciones aleatorias, sostenidos en mano o sobre mesas, con etiquetas exactas de las 7 esquinas y de cada pegatina. Incluye mezclas de todas las longitudes, vistas de tres caras, de dos caras mas una franja, de exactamente dos caras, escenas con clutter y 15.000 fotogramas sin cubo; los fondos son fotos CC0 de Poly Haven y no hay fotografias de personas. Los efectos de camara y los dedos pintados se anaden en tiempo de entrenamiento.

Cada modelo parte de los pesos de su predecesor: c7 arranca de c5b, con 8 epocas de finder y 20 de refiner en una RTX 4090 (unas 1,5 horas); r4 parte de r3 (que parte del reader 3x3 r2), entrenado en un portatil Apple M-series, unas 2 horas por etapa. La innovacion practica es la reutilizacion de un unico reader para todos los tamanos y la tolerancia a oclusion por dedos, que en c7 reduce a la mitad el error de posicion de las esquinas ocultas (4-7% de la arista frente a 8-11% del modelo anterior) y baja las falsas alarmas en un 7x7 sostenido con dedos del 19% al 6%. La pagina en vivo exige que varios fotogramas coincidan antes de dar un veredicto.

## Capacidades

- Deteccion de presencia y localizacion de un cubo de Rubik en un fotograma, con las 7 esquinas visibles estimadas.
- Refinamiento preciso de las 7 esquinas a partir de un recorte cercano.
- Lectura del estado de las tres caras visibles de un cubo de 2x2 a 7x7: clasificacion de cada pegatina en uno de seis colores o como cubierta.
- Verificacion de que la mezcla aplicada coincide con la esperada, incluyendo deteccion de un movimiento deslizado (slip).
- Tolerancia a vistas de tres caras, de dos caras mas una franja y de exactamente dos caras (en 3x3 y superiores).
- Tolerancia a dedos que ocultan esquinas o aristas completas, gracias a dedos pintados en el entrenamiento.
- Ejecucion en navegador mediante ONNX Runtime, cargando solo el reader del tamano que se comprueba.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingue, audio ni generacion de texto.

## Casos de uso

- Verificacion de mezclas en entrenamiento de speedcubing: el cubista desordena el cubo segun una secuencia y el sistema confirma si el estado final coincide; el finder y el refiner localizan las esquinas aunque la vista sea oblicua y el reader clasifica las pegatinas de las tres caras visibles.
- Asistencia al scrambler en competiciones no oficiales: una webcam enfoca el cubo mezclado y el pipeline devuelve "correcto" o "revisar", reduciendo el error humano en la comprobacion manual; la pagina espera varios fotogramas coincidentes para evitar falsos positivos.
- Verificacion de un movimiento deslizado: cuando el scrambler aplica una secuencia con un giro erroneo, el reader detecta el estado resultante y lo marca como distinto del esperado (100% de deteccion en 3x3 y 4x4 en los renders de prueba).
- Aplicacion web sin backend de vision: los ONNX de finder, refiner y reader-N se cargan en el navegador y la inferencia ocurre en el cliente, lo que permite desplegar la herramienta sin servidor de GPU; el sitio carga solo el reader del tamano seleccionado (2,9 MB).
- Control de calidad en produccion de cubos o en inventario: fotografiar un cubo en una mesa y comprobar que el patron de colores es el esperado, usando el reader para clasificar cada pegatina y el finder para validar que hay un cubo en el encuadre.
- Investigacion en vision sintetica: el pipeline y los pesos sirven como base para estudiar deteccion de puntos clave y clasificacion con datos exclusivamente renderizados, incluyendo el efecto de oclusion por dedos y de efectos de camara aleatorios.
- Prototipado de apps de cubing en movil: los modelos de menos de 3 M de parametros y los archivos ONNX de 2,9 a 9,9 MB son adecuados para integrarse en aplicaciones ligeras con ONNX Runtime en dispositivos de consumo.

## Benchmarks y rendimiento

Resultados de v0.2.0 sobre renders sinteticos retenidos con efectos de camara aleatorios severos, fotogramas unicos, ejecutados como lo hace la web (`evaluate_nxn.py`), 300 renders por tamano con mezclas de todas las longitudes:

| Metrica | 2x2 | 3x3 | 4x4 | 5x5 | 6x6 | 7x7 |
|---|---|---|---|---|---|---|
| Mezcla verdadera declarada correcta | 98,7% | 99,3% | 100% | 99,0% | 96,3% | 90,3% |
| Falsa alarma (el resto dice "revisar") | 0% | 0,7% | 0% | 0% | 0,7% | 0,3% |
| Un movimiento deslizado detectado | 96,7% | 100% | 100% | 99,0% | 96,7% | 90,7% |
| Un movimiento deslizado no detectado | 2,0% | 0% | 0% | 0% | 0,3% | 0% |

Sobre 1.000 mezclas completas de 3x3: mezcla verdadera correcta 99,9% sin falsas alarmas, y movimiento deslizado detectado 99,5%. Con dos caras y una franja en vista (cubo orientado hacia el scrambler): 86-95% correcto con 0,3-2,7% de falsas alarmas. No hay resultados publicados sobre fotos reales.

## Requisitos de hardware

- Inferencia muy ligera: los tres modelos suman menos de 6 M de parametros y los ONNX ocupan entre 2,9 y 9,9 MB, por lo que la VRAM necesaria es minima (del orden de decenas de MB por modelo en FP32, no cuantificado).
- Cabe en cualquier GPU de consumo; el entrenamiento de c7 se hizo en una RTX 4090 (unas 1,5 horas para finder y refiner) y el de r4 en un portatil Apple M-series (unas 2 horas por etapa).
- Despliegue en navegador con ONNX Runtime, que es el modo usado por check.cubing.in; los pesos `.pt` se usan desde Python o para reentrenar.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- No se publican latencias ni throughput medidos; el sitio carga solo el reader del tamano seleccionado y espera varios fotogramas coincidentes antes de decidir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CubeCheck v0.2.0 (finder, refiner, reader) | 2,5 M + 2,5 M + 0,72 M | No aplica | 90,3-100% de mezclas correctas por tamano en renders sinteticos | AGPL-3.0 | Hugging Face y GitHub |
| CubeCheck v0.1.0 (c2, r2) | No disponible | No aplica | Solo 3x3; sin resultados publicados en la informacion disponible | AGPL-3.0 | Hugging Face (tag v0.1.0) |
| Alternativas de deteccion de estado de cubo de Rubik | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es una herramienta oficial de la WCA ni sustituye la comprobacion del propio scrambler; su funcion es ayudar a verificar.
- Solo se ha validado con el esquema de colores estandar de la WCA; los cubos stickerless y los esquemas de color inusuales no estan probados.
- El entrenamiento es exclusivamente sintetico: la precision con webcams reales, bajo luz muy coloreada o con desenfoque de movimiento intenso puede ser menor; no hay resultados publicados sobre fotos reales.
- Necesita una esquina del cubo orientada hacia la camara (tres caras) o, en 3x3 y superiores, dos caras; con solo dos caras y una franja la precision baja al 86-95% con hasta 2,7% de falsas alarmas.
- En 6x6 y 7x7 las pegatinas son pequenas: el cubo debe estar cerca; a mayor distancia el sistema responde "revisar".
- La licencia AGPL-3.0 obliga a compartir el codigo fuente con los usuarios si los pesos se usan en un servicio accesible por red.
- No se documentan sesgos de datos mas alla de la restriccion al esquema de colores estandar y a la ausencia de fotografias de personas en el entrenamiento; el riesgo de alucinacion se traduce aqui en falsas alarmas o mezclas no detectadas, cuantificadas en la tabla de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darshanvss/cubecheck
- Version anterior (redirige desde cubecheck-3x3): https://huggingface.co/darshanvss/cubecheck-3x3
- Codigo, entrenamiento y evaluacion: https://github.com/darshanvss/cubecheck
- Demo en vivo: https://check.cubing.in
- Documentacion del dataset: https://github.com/darshanvss/cubecheck/blob/main/docs/dataset.md
- Documentacion de entrenamiento: https://github.com/darshanvss/cubecheck/blob/main/docs/training.md
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Fondos CC0 usados en el entrenamiento: https://polyhaven.com
