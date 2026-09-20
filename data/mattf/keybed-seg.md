# mattf/keybed-seg

## Resumen

keybed-seg es un modelo de segmentacion semantica de tamano reducido desarrollado por el usuario mattf (matheusfillipe), cuyo objetivo es localizar el teclado (keybed) de un piano o teclado electronico dentro de una fotografia o de un fotograma de video. Dada una imagen, devuelve un mapa de probabilidad por parche que indica en que medida cada region pertenece a la franja de teclas blancas y negras. No es un modelo generativo ni un modelo de lenguaje: es vision por computador especializada en un unico objeto.

La relevancia del modelo reside en su enfoque de despliegue: esta disenado para ejecutarse en vivo dentro de un navegador mediante onnxruntime-web, por lo que prima la latencia y el tamano (6,3 MB, opset 20) sobre la precision maxima. En CPU de portatil procesa un fotograma en aproximadamente 130 ms. El modelo por si solo produce una mascara tosca; el proyecto del que forma parte ajusta despues un rectangulo de proporciones conocidas sobre esa mascara para recuperar la pose 3D completa del teclado.

El entrenamiento combina datos mayoritariamente sinteticos (renderizado de un teclado 3D mediante three.js a traves de miles de angulos de camara, iluminaciones y entornos HDRI) con un ajuste fino posterior sobre fotogramas etiquetados a mano de un instrumento concreto. Esa mezcla es la clave de su comportamiento: generaliza razonablemente a otras configuraciones, pero su mejor rendimiento se da en condiciones parecidas a las de su ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (backbone preentrenado en ImageNet) con decodificador tipo U-Net |
| Parametros totales | no disponible (el autor no publica el recuento; el fichero ONNX de 6,3 MB en float32 acota el orden de magnitud a pocos millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 288 x 288) |
| Tipos de cuantizacion | no disponible (solo se distribuye en float32; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, opset 20, float32 (fichero `keybed_seg2.onnx`) |
| Tarea (pipeline) | image-segmentation |
| Entrada | `image`, float32, forma `[1, 3, 288, 288]`, RGB, normalizacion ImageNet (media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`) |
| Salida | `mask`, float32, forma `[1, 1, 144, 144]`, probabilidad de 0 a 1 |
| Preprocesado de aspecto | la imagen se comprime a un cuadrado en lugar de usar letterbox; el padding a 4:3 dio resultados claramente peores |
| Tamano del modelo | 6,3 MB |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es una red de segmentacion semantica ligera: un backbone MobileNetV3-Small preentrenado en ImageNet y un decodificador pequeno de estilo U-Net que produce una mascara de resolucion reducida (144 x 144, es decir, la mitad de la resolucion de entrada, un parche por cada 2 x 2 pixeles). Segun el autor, emplear un backbone preentrenado en lugar de entrenar desde cero fue la mejora de precision mas importante del proyecto, aproximadamente un factor de tres.

Los datos de entrenamiento son mayoritariamente sinteticos. Una escena de three.js renderiza un teclado 3D a traves de miles de angulos de camara, configuraciones de iluminacion y entornos HDRI, con etiquetas exactas de esquinas, y esos renderizados se componen despues sobre fotografias reales usadas como fondo. Anadir entornos realistas y materiales reflectantes al generador redujo el error en validacion de 165 px a 24 px, la mayor mejora individual del proyecto. Los pesos publicados se ajustan finamente sobre fotogramas etiquetados a mano procedentes de grabaciones con camara real de un unico instrumento, mas imagenes de paneles de control de teclados etiquetadas como "no keybed", de modo que el modelo aprende a excluir el panel. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, logicamente fuera de ambito para un modelo de vision.

En la version publicada (`keybed_seg2`), evaluada sobre una grabacion excluida de ambos entrenamientos, la mascara solapa con el keybed real con un IoU de 0,645 (frente a 0,459 de la version anterior) y el extremo lejano del teclado queda mucho mas cerca, con un error mediano de esquina de 26 px (frente a 64 px). La version anterior sigue disponible en el historial del repositorio. El autor advierte ademas de que la perdida de validacion sintetica deja de predecir la precision real tras las primeras epocas, por lo que recomienda seleccionar el checkpoint siempre contra fotografias reales.

## Capacidades

- Segmentacion semantica binaria: genera un mapa de probabilidad de 144 x 144 que indica que parches pertenecen a la franja de teclas de un piano o teclado electronico.
- Localizacion del keybed en fotografias individuales y en fotogramas de video, con inferencia en tiempo casi interactivo en CPU.
- Discriminacion parcial entre el teclado y el panel de control del instrumento, gracias al ajuste fino con ejemplos negativos de paneles.
- Funcionamiento en navegador mediante onnxruntime-web (backend wasm), sin necesidad de GPU ni de servidor.
- Uso en Python mediante onnxruntime para integracion en pipelines fuera del navegador.
- Salida apta para postprocesado geometrico: el proyecto asociado ajusta un rectangulo de proporciones conocidas sobre la mascara para recuperar la pose 3D completa del teclado en lugar de cuatro esquinas sueltas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No detecta manos, no lee notas musicales y no identifica el instrumento.

## Casos de uso

- Overlay en tiempo real en aplicaciones web de aprendizaje de piano: una webcam captura el teclado y el modelo (130 ms por fotograma en CPU de portatil, es decir, en torno a 7,7 fps) genera la mascara necesaria para dibujar guias, notas o digitaciones sobre las teclas directamente en el navegador, sin backend.
- Reconstruccion de pose 3D del teclado para realidad aumentada: combinando la mascara con el ajuste de un rectangulo de proporciones conocidas, se obtiene la orientacion completa del instrumento, lo que permite anclar contenido AR sobre las teclas desde vistas laterales o cenitales, que son precisamente las que mejor funcionan.
- Preprocesado para transcripcion automatica de interpretaciones: el modelo aísla la region de teclas dentro del fotograma, de modo que el resto del pipeline (deteccion de manos, seguimiento de dedos, estimacion de notas) solo trabaja sobre la zona relevante y reduce falsos positivos de fondo.
- Etiquetado asistido de datasets musicales: dadas colecciones de fotos o videos de pianos, el modelo genera mascaras preliminares que despues se corrigen a mano, reduciendo el coste de anotacion para entrenar variantes mas precisas del propio modelo.
- Calibracion de camaras en grabaciones de conciertos: al recuperar la pose del teclado se puede normalizar el encuadre entre distintos planos o camaras, util para montaje automatico o para estabilizar vistas de instrumento en retransmisiones.
- Herramientas de vision por computador en robótica o instalaciones interactivas: una camara cenital sobre un piano puede usar la mascara para segmentar el area de teclas y limitar la zona de actuacion de un brazo robotico o de un sistema de proyeccion.
- Aplicaciones musicales de navegador con presupuesto de recursos minimo: al pesar 6,3 MB y ejecutarse sobre wasm, es viable en dispositivos sin GPU dedicada, como portatiles modestos o tablets, donde un modelo de segmentacion generico no seria desplegable.
- Ajuste fino sobre un instrumento propio: el repositorio del proyecto incluye guia e infraestructura para regenerar los datos sinteticos y reajustar el modelo, un caso de uso realista cuando la precision sobre un piano y una sala concretos es critica.

## Benchmarks y rendimiento

| Metrica | keybed_seg2 (version publicada) | Version anterior (historial del repo) |
|---|---|---|
| IoU de mascara frente al keybed real (grabacion en held out) | 0,645 | 0,459 |
| Error mediano de esquina en el extremo lejano del teclado | 26 px | 64 px |
| Error en validacion tras anadir entornos y materiales reflectantes al generador sintetico | 24 px | 165 px (antes de la mejora) |
| Latencia de inferencia en CPU de portatil | ~130 ms por fotograma | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes de vision como COCO o ADE20K) en la informacion disponible; esas metricas no aplican a un modelo de segmentacion especifica de un unico objeto.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El fichero de pesos ocupa 6,3 MB en float32 y el tensor de entrada es de 1 x 3 x 288 x 288; la huella en memoria de un runtime ONNX tipico se mantiene por debajo de los 100 MB en total, incluidos los buffers de activaciones.
- GPU recomendadas: ninguna en particular. El modelo esta disenado para CPU y para el backend wasm de onnxruntime-web; una GPU solo aportaria una reduccion de latencia marginal dado el tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650 e incluso integradas) y tambien en CPU sin aceleracion.
- Opciones de despliegue: onnxruntime-web en el navegador (backend wasm, tal como muestra el ejemplo del autor), onnxruntime en Python, y en general cualquier runtime compatible con ONNX opset 20. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: aproximadamente 130 ms por fotograma en CPU de portatil, lo que equivale a unos 7,7 fotogramas por segundo en configuracion monohilo tipica de navegador. No se publican cifras de throughput en lote ni de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion posible es con la version anterior del propio modelo, que sigue accesible en el historial del repositorio:

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keybed-seg (keybed_seg2) | no disponible (6,3 MB en float32) | imagen 288 x 288, salida 144 x 144 | IoU 0,645; error de esquina 26 px; ~130 ms por fotograma en CPU | Apache 2.0 | HuggingFace (formato ONNX) |
| Version anterior de keybed-seg | no disponible | misma configuracion de entrada y salida | IoU 0,459; error de esquina 64 px | Apache 2.0 | Historial del repositorio de HuggingFace |
| Modelos genericos de segmentacion (SAM, SegFormer, etc.) | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |

Los modelos genericos de segmentacion no son equivalentes funcionales: no estan especializados en el keybed de un piano, carecen de la salida de baja resolucion y bajo coste optimizada para navegador, y no incluyen el ajuste geometrico del proyecto.

## Limitaciones y advertencias

- Ajuste fino sobre un unico instrumento en una unica sala: el modelo transfiere a otras configuraciones, pero con menor precision. El propio autor recomienda reentrenarlo si se busca buen rendimiento sobre un piano concreto.
- Vistas frontales debiles: funciona mejor en vistas laterales y cenitales. En vistas frontales rectas, donde se ve todo el panel de control del sintetizador, a veces marca como keybed toda la parte superior del instrumento, porque casi todos los datos de entrenamiento son angulados.
- Alcance funcional limitado: solo encuentra las teclas. No detecta manos, no lee notas y no identifica el instrumento.
- Perdida de validacion poco fiable: la perdida sobre datos sinteticos deja de correlacionar con la precision real tras las primeras epocas, por lo que cualquier reentrenamiento debe seleccionar el checkpoint contra fotografias reales.
- Riesgo de mascaras incompletas en el extremo lejano del teclado: aunque ha mejorado, el error mediano de esquina de 26 px implica desviaciones visibles en el borde mas alejado de la camara.
- Advertencia sobre sesgos: el dataset sintetico procede de un unico modelo 3D de teclas ("Piano keys" de Sketchfab) compuesto sobre un conjunto acotado de fotografias de fondo, y el ajuste fino proviene de un solo instrumento; es esperable un sesgo hacia esas condiciones de iluminacion y geometria.
- Licencia: Apache 2.0, que permite uso comercial. La malla 3D del generador de datos sinteticos es CC BY y reside en el repositorio de codigo, no en los pesos del modelo, por lo que no afecta al uso de los pesos, pero si a quien reutilice el generador.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, y ultima actualizacion en septiembre de 2026; es un artefacto de un proyecto personal, no un modelo con soporte o mantenimiento garantizado.
- Advertencia sobre los resultados de busqueda web: las consultas devolvieron unicamente articulos sobre la actualizacion manual de firmas de Windows Security, sin ninguna relacion con este modelo. No se ha podido verificar informacion externa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattf/keybed-seg
- Repositorio del proyecto (codigo del ajuste geometrico, generador de datos sinteticos y guia de reentrenamiento): https://github.com/matheusfillipe/keybed
- Malla 3D "Piano keys" usada por el generador sintetico (Sketchfab, CC BY): https://sketchfab.com/3d-models/piano-keys-a68d3e1b5fb4463992bdd02f8f4aa4db
- Resultados de busqueda web: sin enlaces relevantes; todas las entradas devueltas tratan sobre la actualizacion manual de firmas de Windows Security y no guardan relacion con el modelo.
