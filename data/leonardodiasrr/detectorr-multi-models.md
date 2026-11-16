# LeonardoDiasRR/detectorr-multi-models

## Resumen

`LeonardoDiasRR/detectorr-multi-models` no es un modelo de lenguaje, sino un repositorio de artefactos de inferencia del proyecto **detectorr-multi-dev**, un pipeline de deteccion de rostro, cuerpo y matricula (placa) pensado para integrarse con FindFace Multi. El repositorio aloja los binarios de los pesos fuera del control de versiones del codigo fuente, de modo que el propio codigo del proyecto los descarga desde Hugging Face en tiempo de ejecucion.

Los pesos base son variantes de Ultralytics YOLO26n, una familia de detectores de objetos de tipo "n" (nano), especializados en tres tareas: deteccion de cuerpo (`yolo26n.pt`), deteccion de rostro (`yolo26n-face.pt`) y deteccion de matricula (`yolo26n-license-plate.pt`). Se distribuyen tanto en formato PyTorch (compatible con `torch==2.12.1+cu130`) como en engines TensorRT compilados (`tensorrt-cu13==11.4.0.106`) para cuatro arquitecturas de GPU: Turing (sm_75), Ampere (sm_86), Hopper (sm_90) y Blackwell (sm_120).

Su relevancia es operativa mas que cientifica: el repositorio resuelve el problema de distribucion reproducible de pesos y engines en un pipeline de vision por computador en produccion, con versiones fijadas de PyTorch y TensorRT y engines compilados por arquitectura. No hay model card con metricas, datos de entrenamiento ni evaluacion publicada; la informacion disponible se limita al inventario de artefactos y a la licencia heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (variante "n" de YOLO26; no se publica el conteo en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch (FP32/FP16 segun export) y engines TensorRT compilados por arquitectura |
| Idiomas soportados | no aplica (vision); no disponible |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO26n) |
| Formato de pesos | `.pt` (PyTorch, torch 2.12.1+cu130) y `.engine` (TensorRT 11.4.0.106, cu13) |

## Arquitectura y entrenamiento

Los tres detectores pertenecen a la familia YOLO26n de Ultralytics, una arquitectura de deteccion de objetos de una sola etapa (single-stage) orientada a inferencia de baja latencia. El sufijo "n" corresponde a la variante nano de la familia, la de menor coste computacional. Dos de los pesos son tareas personalizadas: deteccion de rostro y deteccion de matricula, presumiblemente obtenidos mediante fine-tuning de los pesos base de YOLO26n sobre datasets especificos del proyecto. El tercer peso (`yolo26n.pt`) corresponde a la deteccion de cuerpo.

La informacion disponible no incluye numero de tokens ni de imagenes de entrenamiento, composicion del dataset, hiperparametros, ni si hubo tecnicas de aumento de datos o destilacion. Tampoco se documenta el procedimiento de exportacion a TensorRT mas alla de la mencion a `setup_tensorrt.py` del proyecto. La innovacion tecnica relevante es la distribucion de engines TensorRT precompilados por compute capability (sm_75, sm_86, sm_90, sm_120), lo que elimina la necesidad de compilar en destino pero impone una correspondencia estricta entre version de TensorRT y arquitectura de GPU.

## Capacidades

- Deteccion de cuerpo/persona en imagenes o fotogramas de video (`yolo26n.pt`).
- Deteccion de rostro (`yolo26n-face.pt`), pensada para alimentar el pipeline de reconocimiento facial de FindFace Multi.
- Deteccion de matriculas de vehiculo (`yolo26n-license-plate.pt`).
- Inferencia acelerada por hardware mediante engines TensorRT para Turing, Ampere, Hopper y Blackwell.
- Ejecucion en PyTorch nativo como alternativa portable a los engines.
- Integracion en un pipeline mayor de videovigilancia o analitica (FindFace Multi), no como modelo autonomo de proposito general.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Control de acceso y videovigilancia: el detector de rostro puede alimentar el pipeline de FindFace Multi para localizar caras en fotogramas antes del reconocimiento, con inferencia en GPU de gama media gracias a la variante nano.
- Analitica de trafico y aparcamiento: el detector de matriculas permite localizar placas en imagenes de camaras de vigilancia como paso previo a OCR o a la comparacion contra listas de vehiculos.
- Conteo y seguimiento de personas: `yolo26n.pt` sirve para detectar cuerpos en secuencias de video, base para conteo de aforo o analisis de flujos peatonales.
- Despliegue en flotas heterogeneas de GPU: los engines precompilados por arquitectura permiten servir el mismo pipeline en estaciones con RTX 2080 Super (Turing), RTX 3060 (Ampere), H100 (Hopper) o RTX 50xx (Blackwell) sin recompilar en cada maquina.
- Prototipado rapido en PyTorch: los `.pt` permiten iterar sobre el pipeline en entornos de desarrollo antes de pasar a la version TensorRT optimizada.
- Pipeline de preprocesado para reconocimiento facial: la deteccion de rostro actua como etapa de region proposal que recorta caras para el modelo de reconocimiento posterior.
- Reproducibilidad de entornos: al fijar versiones exactas de PyTorch y TensorRT, el repositorio facilita reconstruir un entorno de inferencia identico entre desarrollo y produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de mAP, precision/recall, latencia ni throughput para ninguna de las tres tareas ni para ninguna de las arquitecturas de GPU soportadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,2 GB para todos los artefactos) y la variante nano de YOLO26, la huella en memoria es reducida, pero no se publica una cifra concreta.
- GPU soportadas por los engines TensorRT incluidos: sm_75 (Turing, p. ej. RTX 2080 Super), sm_86 (Ampere, p. ej. RTX 3060), sm_90 (Hopper) y sm_120 (Blackwell, p. ej. RTX 50xx).
- Cabe en GPU de consumo: si, al menos en las arquitecturas Turing, Ampere y Blackwell cubiertas por los engines; no se especifica el minimo de VRAM.
- Opciones de despliegue: PyTorch 2.12.1+cu130 con los `.pt`, o TensorRT 11.4.0.106+cu13 con los `.engine`. Un engine solo carga con la misma version de TensorRT y la misma compute capability con la que se compilo.
- Latencia y throughput: no disponibles.
- Descarga: via `huggingface_hub[cli]` (`hf download`), por archivo o por carpeta de arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| detectorr-multi-models (este repo) | no disponible (YOLO26n) | Deteccion de cuerpo, rostro y matricula | `.pt`, `.engine` TensorRT | AGPL-3.0 | Engines por arquitectura de GPU; sin benchmarks publicados |
| Ultralytics YOLO26n (base) | no disponible en la informacion | Deteccion de objetos general | `.pt`, export a ONNX/TensorRT/etc. | AGPL-3.0 | Modelo original del que derivan los pesos; ecosistema y documentacion amplios |
| Alternativas especializadas en deteccion de rostro (p. ej. RetinaFace, SCRFD) | no disponible | Deteccion de rostro | frameworks propios | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, precision ni latencia con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esos terminos seria un error de interpretacion.
- Ausencia total de evaluacion publicada: no hay mAP, curvas precision-recall, matrices de confusion ni resultados por subconjunto demografico o de iluminacion.
- Riesgo de sesgo no documentado: al no publicarse la composicion de los datasets de fine-tuning (rostro y matricula), no es posible evaluar sesgos por tono de piel, genero, edad, geografia o tipo de matricula.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente del servicio que integra el modelo. Es una restriccion relevante para uso comercial propietario; conviene revisar con asesoria legal o adquirir licencia comercial de Ultralytics.
- Acoplamiento estricto de los engines: un `.engine` solo funciona con la misma version de TensorRT (11.4.0.106) y la misma compute capability con la que se compilo. Cambiar de GPU o actualizar TensorRT invalida el engine.
- Cobertura de arquitecturas incompleta: no hay engines para sm_80 (A100), sm_89 (RTX 40xx) ni sm_100, por lo que esas GPU requeririan recompilar desde los `.pt`.
- Ambito de aplicacion acotado: disenado para el pipeline detectorr-multi-dev / FindFace Multi; su uso fuera de ese contexto no esta documentado ni validado.
- Consideraciones legales y eticas: la deteccion de rostro y matricula en videovigilancia esta sujeta a normativa de proteccion de datos (RGPD en la UE) y a regulacion especifica sobre biometria y lectura automatica de matriculas.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso en produccion por terceros ni de mantenimiento continuado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LeonardoDiasRR/detectorr-multi-models
- Ultralytics (codigo y licencia AGPL-3.0 de los pesos base): https://github.com/ultralytics/ultralytics
