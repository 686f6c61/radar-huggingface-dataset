# NeereshPerla/ddm-det

## Resumen

DDM-Det es un modelo de deteccion de objetos que formula la tarea como generacion de tokens discretos y realiza la deteccion en un unico paso de difusion inversa. Lo desarrolla NeereshPerla y se presenta como el checkpoint preentrenado oficial del articulo "Fast Object Detection via One-Step Discrete Diffusion", aceptado en WACV 2027. El modelo se distribuye como un unico fichero de pesos PyTorch (`model_final.pth`) de aproximadamente 0,5 GB, con backbone ResNet-50 y entrenado sobre COCO 2017.

La propuesta tecnica es relevante porque sustituye el paradigma habitual de deteccion (cajas densas, consultas tipo DETR o difusion continua iterativa) por un esquema de difusion discreta de un solo paso, lo que reduce el coste de inferencia. El autor reporta 40,50 AP en COCO 2017 val con una velocidad de 58,82 FPS en la configuracion experimental del articulo, un equilibrio interesante entre precision y latencia para un detector de backbone ResNet-50.

El modelo es de investigacion: no hay pesos en formatos ligeros (GGUF, ONNX), no se declaran idiomas (es un modelo de vision, no de lenguaje) y la implementacion completa vive en un repositorio GitHub aparte. La licencia Apache 2.0 permite uso comercial, aunque la madurez del ecosistema de despliegue es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion como generacion de tokens discretos con difusion discreta de un solo paso; backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`); requiere PyTorch y Detectron2 |

## Arquitectura y entrenamiento

DDM-Det plantea la deteccion de objetos como un problema de generacion de tokens discretos: en lugar de predecir coordenadas de cajas de forma continua o mediante consultas tipo DETR, el modelo genera una secuencia discreta que codifica los objetos detectados y ejecuta un unico paso de difusion inversa para producir el resultado. El backbone es una ResNet-50, lo que situa el coste computacional del extractor de caracteristicas en el rango de los detectores clasicos tipo Faster R-CNN o RetinaNet.

El entrenamiento se realiza sobre COCO 2017, segun declara la model card, y la evaluacion reportada corresponde al split de validacion de COCO 2017. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de COCO, ni si se emplearon tecnicas de ajuste adicionales como RLHF o DPO (no aplicables en un detector). La innovacion principal declarada es el esquema de difusion discreta de un solo paso, que evita las decenas de pasos iterativos tipicos de los modelos de difusion continuos y permite alcanzar 58,82 FPS segun el articulo.

## Capacidades

- Deteccion de objetos en imagenes: produce cajas delimitadoras y clases sobre las categorias de COCO 2017.
- Inferencia de un solo paso de difusion, orientada a baja latencia (58,82 FPS reportados).
- Generacion de detecciones como tokens discretos, lo que abre la puerta a integraciones con vocabularios discretos y esquemas de decodificacion no autoregresiva.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni de texto: es exclusivamente un modelo de vision.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Deteccion en tiempo real en video: con 58,82 FPS reportados sobre COCO val y backbone ResNet-50, el modelo es adecuado para procesar flujos de video a mas de 30 FPS en hardware de gama alta, por ejemplo en sistemas de videovigilancia o analisis de trafico.
- Preprocesado en pipelines de vision por computador: usar DDM-Det como primer etapa para localizar objetos y alimentar etapas posteriores de reconocimiento, seguimiento o segmentacion.
- Investigacion en difusion discreta: el checkpoint sirve como referencia reproducible para comparar esquemas de difusion discreta frente a detectores clasicos y DETR.
- Prototipado academico: al estar bajo Apache 2.0 y con codigo en GitHub, es util para experimentos de laboratorio que necesiten un detector COCO con latencia controlada.
- Deteccion en entornos con recursos moderados: un backbone ResNet-50 y un unico paso de difusion reducen el coste frente a detectores con decodificadores iterativos o transformers pesados.
- Base para fine-tuning en dominios especificos: al ser un checkpoint completo de PyTorch, puede ajustarse sobre datasets propios con categorias distintas a COCO, siempre que se disponga del pipeline de Detectron2.

## Benchmarks y rendimiento

Evaluacion reportada por el autor en COCO 2017 val con backbone ResNet-50:

| Metrica | Valor |
|---|---|
| AP | 40,50 |
| AP50 | 60,58 |
| AP75 | 42,29 |
| FPS | 58,82 |

No se han publicado en la informacion disponible comparaciones con otros detectores ni resultados en otros datasets.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con backbone ResNet-50 y pesos de 0,5 GB, es razonable esperar un consumo moderado, pero no se confirma en la informacion.
- GPU recomendadas: no especificadas; por el perfil de ResNet-50 y 58,82 FPS, se situaria en el rango de GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090, RTX 3090), sin datos confirmados.
- Compatibilidad con GPU consumer: probable por tamano de pesos, pero no confirmada en la model card.
- Opciones de despliegue: PyTorch y Detectron2 segun la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector).
- Latencia y throughput: 58,82 FPS reportados por el autor bajo la configuracion experimental del articulo; no se detalla el hardware empleado.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | AP COCO val | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DDM-Det | Difusion discreta de un paso | ResNet-50 | 40,50 | Apache 2.0 | Checkpoint PyTorch en HuggingFace |
| Faster R-CNN (referencia clasica) | Detector de dos etapas | ResNet-50 | no disponible en esta ficha | distinta segun implementacion | Amplia (Detectron2, torchvision) |
| DETR / Deformable DETR | Transformer con consultas | ResNet-50 | no disponible en esta ficha | Apache 2.0 en implementaciones de referencia | Amplia |
| DiffusionDet | Difusion continua iterativa | ResNet-50 | no disponible en esta ficha | MIT/Apache segun repositorio | Codigo y pesos publicos |

No se dispone en la informacion proporcionada de cifras comparativas verificadas de estos modelos; la tabla recoge solo la caracterizacion cualitativa.

## Limitaciones y advertencias

- Modelo de investigacion: sin descargas ni likes en HuggingFace en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- Solo se reportan resultados en COCO 2017 val; no hay evaluacion en otros datasets ni en dominios distintos.
- No se documentan sesgos, pero al entrenarse en COCO hereda los sesgos de anotacion y de distribucion de clases de ese dataset.
- Riesgo de alucinacion en el sentido de falsos positivos y detecciones espurias, comun en detectores; no cuantificado en la model card.
- No se especifican requisitos de version de PyTorch, CUDA ni Detectron2, lo que puede complicar la reproducibilidad.
- El rendimiento de 58,82 FPS depende del hardware y del setup experimental del articulo; no debe extrapolarse sin medir.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No hay pesos en formatos ligeros (ONNX, TensorRT, GGUF) ni herramientas de cuantizacion documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeereshPerla/ddm-det
- Repositorio GitHub: https://github.com/neeresh/one-step-discrete-diffusion
- Dataset COCO: https://cocodataset.org/
- Detectron2: https://github.com/facebookresearch/detectron2
