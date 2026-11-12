# infra-intelligence/ppe-rfdetr-small

## Resumen

PPE RF-DETR Small es un sistema de deteccion de equipos de proteccion individual (EPI) orientado a entornos de construccion, publicado por infra-intelligence. No es un unico modelo, sino un pipeline de dos etapas: un detector RF-DETR Small afinado para localizar personas, cabezas y chalecos de seguridad, y un clasificador de cabezas basado en DINOv2-small con un SVM RBF que decide si la cabeza lleva casco de obra. El objetivo es determinar, por trabajador, el estado de uso de casco y chaleco como "on", "off" o "unknown".

El modelo resuelve un problema concreto de seguridad laboral: auditar el cumplimiento de EPI en imagenes de obra o camaras fijas. Su diseno separa deliberadamente la deteccion de la cabeza (una sola clase, con o sin casco) de la clasificacion del casco, para evitar que el detector se apoye en senales espurias como ropa reflectante y confunda gorras o capuchas con cascos.

Es relevante por su enfoque de ingenieria transparente: publica pesos ONNX y PyTorch, un contrato de entrada/salida, codigo de postproceso en numpy y una evaluacion honesta en la que reconoce que no alcanza el objetivo de recall de casco (0,857 frente a 0,90). La licencia Apache-2.0 facilita su integracion comercial, aunque el autor advierte explicitamente contra usos disciplinarios o que sustituyan la verificacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector RF-DETR Small (transformer, backbone DINOv2) + clasificador de cabezas DINOv2-small con SVM RBF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX y PyTorch sin cuantizar) |
| Idiomas soportados | ja, en (etiquetas y documentacion; el modelo opera sobre imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) y PyTorch (.pth, cargable con `torch.load(weights_only=True)`) |

## Arquitectura y entrenamiento

El sistema encadena dos modelos. El detector es RF-DETR Small, un transformer de deteccion con backbone DINOv2 preentrenado en COCO, afinado para tres clases: `person`, `head` y `vest`. Trabaja con entrada fija de 512x512 y produce hasta 300 detecciones de seis valores `[x1, y1, x2, y2, score, class_id]` sin necesidad de NMS. El clasificador de cabezas toma recortes cuadrados de 224x224 centrados en cada cabeza y combina las caracteristicas de DINOv2-small con un SVM de kernel RBF, empaquetado en un unico ONNX que devuelve `p_helmet`. La normalizacion (division por 255 y media/desviacion de ImageNet) se realiza dentro de ambos modelos.

El entrenamiento se apoya en datos publicos: dos conjuntos de Roboflow Universe, Open Images V7 y fotografias de Wikimedia Commons. La logica por trabajador (asignacion de cabezas y chalecos a cada persona segun solapamiento de cajas y bandas verticales) esta implementada en `postprocess/` solo con numpy. Los umbrales operativos son 0,4 para persona, 0,3 para cabeza y chaleco, y 0,5 para `p_helmet`. No se detalla el numero de tokens ni si hubo RLHF/DPO, al tratarse de vision.

## Capacidades

- Deteccion de objetos en imagenes con tres clases: persona, cabeza y chaleco de seguridad.
- Clasificacion binaria de casco de obra por cabeza recortada (probabilidad `p_helmet`).
- Salida por trabajador con estado de casco y chaleco en tres valores: on, off, unknown.
- Postproceso determinista en numpy: fusion de cabezas por IoU, suplemento de cabezas faltantes y asignacion de partes a personas.
- Inferencia en CPU via ONNX Runtime, sin GPU obligatoria.
- Compatibilidad con PyTorch a traves de la API de `rfdetr` (solo el detector).
- No soporta tool calling, agentes, razonamiento multi-paso ni audio; es exclusivamente vision por computador.

## Casos de uso

- Auditoria de seguridad en obra con camaras fijas: el pipeline procesa imagenes 512x512 y devuelve por trabajador el estado de casco y chaleco, adecuado para revisiones periodicas de cumplimiento.
- Analisis por lotes de fotografias de inspeccion: el ejemplo `examples/predict_onnx.py` permite recorrer directorios de imagenes y generar informes estructurados en JSON por trabajador.
- Despliegue en dispositivos sin GPU: los dos ONNX corren en CPU con ONNX Runtime, lo que facilita su uso en portatiles de campo o edge con recursos limitados.
- Pre-filtrado para revision humana: dado que el recall de casco es 0,857, el sistema sirve para priorizar imagenes sospechosas que un inspector revisa despues, no para sancionar automaticamente.
- Integracion en paneles de seguridad con PyTorch: el detector puede cargarse con `rfdetr` para prototipado rapido y combinarse con el clasificador ONNX para la decision final.
- Investigacion y evaluacion de metodos de deteccion de EPI: la publicacion de contrato, evaluacion y atribucion por imagen facilita reproducir y comparar variantes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre tres conjuntos de evaluacion con imagenes de Wikimedia Commons no vistas en entrenamiento.

| Conjunto | Trabajadores | Metrica | Registro (PyTorch) | ONNX | Objetivo | Resultado |
|---|---|---:|---:|---:|---:|---|
| eval3 | 128 | Recall casco ausente | 0,857 | 0,857 | >= 0,90 | No alcanza |
| eval3 | 128 | Precision casco ausente | 0,941 | 0,906 | >= 0,85 | Cumple |
| eval3 | 128 | Recall chaleco ausente | 0,857 | 0,876 | >= 0,85 | Cumple |
| eval3 | 128 | Precision chaleco ausente | 0,957 | 0,958 | >= 0,80 | Cumple |
| eval3 | 128 | Tasa de perdida de trabajadores | 8,6 % | 8,6 % | <= 10 % | Cumple |
| eval2 | 327 | Recall casco ausente | 0,866 | 0,873 | >= 0,90 | No alcanza |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO mAP) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 0,3 GB y ambos ONNX estan pensados para ejecucion en CPU, por lo que la huella en GPU es reducida.
- GPU recomendadas: no especificadas. Cualquier GPU con soporte CUDA para ONNX Runtime o PyTorch es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, el diseno apunta a CPU y por tanto cualquier RTX o incluso un portatil sin GPU dedicada puede ejecutarlo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), PyTorch con `rfdetr` 1.11.2 para el detector. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases EPI | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PPE RF-DETR Small (este) | Detector + clasificador | persona, cabeza, chaleco; casco via clasificador | Apache-2.0 | ONNX, PyTorch | Evaluacion publicada, recall casco 0,857 |
| RF-DETR Small (base) | Detector | COCO (80 clases) | Apache-2.0 | PyTorch | Modelo base sin afinado EPI |
| DINOv2-small | Backbone / clasificador | no aplica | Apache-2.0 | PyTorch | Usado como extractor de caracteristicas |

No se dispone de datos de benchmarks comparativos con otros detectores de EPI especificos en la informacion proporcionada.

## Limitaciones y advertencias

- El recall de casco ausente (0,857) no alcanza el objetivo de 0,90; el autor lo declara explicitamente como no superado en eval3 y eval2.
- Confusion documentada: gorras, capuchas y bufandas se clasifican a veces como casco.
- No distingue trabajadores de transeuntes: trata a toda persona detectada como trabajador.
- El estado "chaleco off" significa "no se encontro chaleco"; los monos con bandas reflectantes cuentan como "on" en la verdad de referencia.
- No evalua arneses, cinturones ni enganche de lineas de vida.
- La verdad de referencia fue anotada por asistentes de IA y revisada por otro asistente, sin verificacion humana individual.
- Las imagenes de evaluacion no son publicas, lo que limita la reproducibilidad externa.
- Uso desaconsejado por el autor para fines disciplinarios o para eliminar la verificacion humana.
- Posible sesgo por la composicion de los datos de entrenamiento (Roboflow, Open Images, Wikimedia); no se documentan analisis de sesgo por genero, etnia o condiciones de iluminacion.
- Licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribucion de datos en `NOTICE` y `ATTRIBUTION.csv`.

## Enlaces

- Hugging Face: https://huggingface.co/infra-intelligence/ppe-rfdetr-small
- Repositorio RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- DINOv2-small en Hugging Face: https://huggingface.co/facebook/dinov2-small
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
