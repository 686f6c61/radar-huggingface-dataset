# nimazerobit/iranian-license-plate-yolo26

## Resumen

`iranian-license-plate-yolo26` es un paquete de dos modelos de deteccion de objetos basados en la familia YOLO26 de Ultralytics, publicados por el usuario nimazerobit, orientados a la lectura automatica de matricula irani (ALPR/ANPR). El repositorio incluye un detector de matriculas (`yolo26n`) que localiza la placa en escenas de trafico y un lector de caracteres (`yolo26s`) que reconoce los 30 simbolos que componen las matriculas iranies (10 digitos persas y 20 codigos de letra). Ambos se distribuyen en pesos PyTorch (`.pt`) y ONNX (`.onnx`), lo que permite desplegarlos tanto con la libreria Ultralytics como con `onnxruntime`.

El modelo resuelve un problema de nicho concreto: la mayoria de los sistemas ALPR comerciales estan entrenados sobre matriculas europeas o norteamericanas, con alfabetos latinos y disposiciones tipograficas distintas. Este repositorio cubre el alfabeto persa y la codificacion de letras especifica del sistema irani (incluyendo categorias como taxis, vehiculos oficiales, diplomaticos, policia o vehiculos de discapacidad), lo que lo hace relevante para proyectos de vision artificial en Iran o para investigacion sobre reconocimiento de matricula multilingue.

La relevancia practica viene dada por sus metricas reportadas: el detector de placas alcanza un mAP@50 del 99,50% y el lector de caracteres un 99,02% mAP@50, con precision y recall por encima del 98% en ambos casos. El repo es pequeno (0,1 GB) y la licencia CC BY 4.0 permite uso comercial con atribucion, lo que facilita su integracion en pipelines de control de acceso, peajes o analitica de trafico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), dos modelos: `yolo26n` (detector de placas) y `yolo26s` (lector de caracteres) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pt` y ONNX `.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | fa (persa; alfabeto y digitos persas en las matriculas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`best.pt`) y ONNX (`best.onnx`) |
| Entrada | imagenes; 800x800 para el detector de placas, 416x416 para el lector de caracteres |
| Clases del lector | 30 (10 digitos + 20 codigos de letra persa) |
| Epocas de entrenamiento | 144 (detector de placas), 94 (lector de caracteres) |
| Tamano del repo | 0,1 GB |
| Libreria | Ultralytics |

## Arquitectura y entrenamiento

Ambos modelos pertenecen a la familia YOLO26 de Ultralytics, una arquitectura de deteccion de objetos de una sola etapa (one-stage detector) que sigue la estela de las versiones YOLO anteriores con un backbone convolucional y una cabeza de deteccion que predice cajas y clases directamente. El detector de placas emplea la variante `yolo26n` (la mas ligera de la familia, pensada para inferencia rapida) y se entreno durante 144 epocas a una resolucion de entrada de 800x800, lo que favorece la deteccion de objetos pequenos como una matricula en una escena de trafico amplia. El lector de caracteres usa la variante `yolo26s` (mayor capacidad) y se entreno 94 epocas a 416x416, resolucion adecuada porque opera sobre recortes de placa ya localizados.

Los datos de entrenamiento provienen de Roboflow Universe: el detector de placas se entreno con el proyecto `drhoseinpur` (version 1) del workspace `zahra-bubwt`, y el lector de caracteres con el proyecto `iranian-plate-character-finder` (version 3) del workspace `dummy-ws`, este ultimo bajo licencia CC BY 4.0. No se documenta en la model card el numero exacto de imagenes, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos o ajuste fino especifico; tampoco se menciona RLHF ni tecnicas de alineacion, algo esperable en un modelo de vision. La innovacion principal no es arquitectonica sino de dominio: la definicion de 30 clases que codifican tanto digitos persas como los codigos de letra que identifican la categoria del vehiculo en el sistema de matriculas irani.

## Capacidades

- Deteccion de matriculas iranies en imagenes de escenas de trafico y calle, con el detector `yolo26n`.
- Reconocimiento de caracteres sobre un recorte de placa, con el lector `yolo26s`, en 30 clases: 10 digitos persas (۰ تا ۹) y 20 codigos de letra persa.
- Distincion de categorias de vehiculo a traves del codigo de letra: particular, taxi, transporte publico, oficial, diplomatico, policia (NAJA), militar, accesible/discapacidad, entre otras.
- Construccion de un pipeline extremo a extremo (imagen de coche a texto de matricula) combinando ambos modelos y ordenando los caracteres por coordenada X.
- Inferencia con PyTorch via Ultralytics o con ONNX Runtime sin dependencia de PyTorch.
- Salida estandar de deteccion (cajas delimitadoras, clases y confianza) compatible con el ecosistema Ultralytics.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video; es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Control de acceso a parkings y recintos privados: el detector localiza la placa en la imagen de la camara de entrada y el lector extrae el texto para compararlo con una lista de vehiculos autorizados, con la ventaja de que ambos modelos caben en un equipo de borde.
- Peajes y telepeaje manual asistido: en un carril con camara fija, el pipeline placa-texto permite registrar el paso de vehiculos y asociarlo a una cuenta, usando el codigo de letra para clasificar el tipo de vehiculo (taxi, particular, oficial).
- Analitica de trafico urbano: procesar grabaciones de camaras de calle para contar vehiculos por categoria (policia, transporte publico, diplomatico) a partir del codigo de letra reconocido, sin necesidad de infraestructura de altas prestaciones.
- Vigilancia y seguridad en aparcamientos: deteccion de vehiculos con matricula de interes (policia, militar, diplomatico) en imagenes capturadas por camaras de seguridad, aprovechando el mAP@50 del 99,50% del detector de placas.
- Digitalizacion de registros fotograficos: convertir imagenes de matriculas en texto para bases de datos de flotas o siniestros, usando el lector de caracteres sobre recortes ya existentes.
- Investigacion en vision artificial multilingue: servir de base para estudios comparativos de ALPR en alfabetos no latinos, o para reentrenar el lector con otras codificaciones de placa.
- Despliegue en dispositivos de borde: exportar los pesos ONNX y ejecutarlos con `onnxruntime` en CPU o en aceleradores ligeros para aplicaciones de bajo consumo, dado el reducido tamano del repo (0,1 GB).

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre los conjuntos de test correspondientes:

| Modelo | Arquitectura | Epocas | Tamano de imagen | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---:|---:|---:|---:|---:|---:|
| Detector de placas | `yolo26n` | 144 | 800x800 | 99,52% | 99,65% | 99,50% | 75,28% |
| Lector de caracteres | `yolo26s` | 94 | 416x416 | 98,26% | 98,37% | 99,02% | 77,58% |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos ALPR ni benchmarks en conjuntos publicos independientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano de la familia YOLO26 (variantes `n` y `s`, modelos ligeros de deteccion), la inferencia cabe holgadamente en GPUs de consumo; una estimacion orientativa es de menos de 2 GB de VRAM por modelo en precision FP32, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la model card. Para produccion con muchas camaras simultaneas, una GPU de datacenter (A100, H100) o una RTX 4090 permitiria procesar varios flujos en paralelo; para un unico flujo, una GPU de consumo media es suficiente.
- Cabe en GPU de consumo: si, dado el tamano de los modelos `n` y `s` de YOLO26; tambien puede ejecutarse en CPU con ONNX Runtime, segun el ejemplo de la model card.
- Opciones de despliegue: Ultralytics (PyTorch, `.pt`), ONNX Runtime (`.onnx`) y, en general, cualquier runtime compatible con el formato ONNX. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tiempo de inferencia ni FPS.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `iranian-license-plate-yolo26` (este) | YOLO26, detector + lector | 30 (digitos persas + letras) | CC BY 4.0 | Hugging Face | Especifico para matriculas iranies; mAP@50 99,50% y 99,02% |
| Detectores YOLO genericos (p. ej. YOLOv8/YOLO11 de Ultralytics) | Deteccion de objetos | 80 clases COCO | AGPL-3.0 / Enterprise | Ultralytics, Hugging Face | No incluyen clase de matricula ni alfabeto persa; requieren reentrenamiento |
| Modelos ALPR comerciales (p. ej. soluciones de OpenALPR o similares) | Pipeline propietario | Variable, normalmente alfabeto latino | Propietaria | Comercial | No cubren el sistema de matriculas irani ni sus codigos de letra |

No se dispone de datos publicos de benchmarks de alternativas especificas para matriculas iranies en la informacion proporcionada, por lo que la comparacion cuantitativa con modelos equivalentes no esta disponible.

## Limitaciones y advertencias

- Modelo de nicho: solo reconoce el sistema de matriculas irani y su alfabeto persa; no es util para matriculas europeas, latinoamericanas ni de otros paises sin reentrenamiento.
- Rendimiento en produccion no verificado de forma independiente: las metricas (mAP@50 cercano al 99%) proceden de la model card del autor y de sus propios conjuntos de test; el mAP@50-95 baja al 75,28% y 77,58%, lo que indica menor precision en localizacion fina de cajas.
- Riesgo de falsos positivos y confusion entre clases visualmente similares: los codigos de letra persa comparten formas y el lector puede confundir categorias como `PD`/`PP` o `SH`/`SS` en imagenes de baja resolucion o con desenfoque.
- Dependencia de la calidad de la imagen: el detector opera a 800x800 y el lector a 416x416; placas pequenas, inclinadas, sucias, con reflejos o en condiciones nocturnas pueden degradar la precision, aunque el autor no documenta estos escenarios.
- Sesgos de dataset: los datos provienen de proyectos de Roboflow Universe (`drhoseinpur` y `iranian-plate-character-finder`) y no se detalla su composicion geografica, horaria ni de condiciones de captura, por lo que puede haber sesgo hacia ciertos tipos de camara o iluminacion.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero exige citar al autor y la licencia; conviene revisar las condiciones de los datasets de origen, ya que el lector se entreno con datos tambien bajo CC BY 4.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- No se documentan limitaciones de contexto ni de idioma mas alla del persa, porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nimazerobit/iranian-license-plate-yolo26
- Dataset del detector de placas (Roboflow Universe, workspace `zahra-bubwt`, proyecto `drhoseinpur`, version 1): no se proporciona URL directa en la model card
- Dataset del lector de caracteres (Roboflow Universe, workspace `dummy-ws`, proyecto `iranian-plate-character-finder`, version 3): no se proporciona URL directa en la model card
- Ultralytics (libreria y documentacion de YOLO26): https://docs.ultralytics.com
- ONNX Runtime: https://onnxruntime.ai
