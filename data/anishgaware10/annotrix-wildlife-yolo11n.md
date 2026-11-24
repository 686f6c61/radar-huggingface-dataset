# AnishGaware10/annotrix-wildlife-yolo11n

## Resumen

Annotrix wildlife detector es un modelo de deteccion de objetos basado en Ultralytics YOLO11n, afinado por AnishGaware10 para identificar cuatro especies de fauna africana: bufalo, elefante, rinoceronte y cebra. El modelo parte de los pesos COCO-pretrained de YOLO11n y se ha reentrenado sobre el split de entrenamiento del dataset African Wildlife de Ultralytics, con el objetivo de alimentar las sugerencias automaticas de cajas delimitadoras en Annotrix, una herramienta de anotacion de imagenes asistida por IA desarrollada para el modulo AI Vision de la SRH University Heidelberg.

Se trata de un modelo de vision por computador puramente de deteccion, no de un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su relevancia practica radica en que demuestra como un detector generico preentrenado en COCO (80 clases) puede especializarse en un dominio concreto con un coste computacional minimo (entrenamiento en CPU, 12 epocas, imagenes de 512 px) y obtener una mejora sustancial en mAP@0.5, pasando de 0,444 a 0,955 en el split de test.

El modelo se distribuye bajo licencia AGPL-3.0, con pesos en formato nativo de Ultralytics (`.pt`), y esta pensado para inferencia local en CPU o GPU dentro del ecosistema Ultralytics. No dispone de datos publicados sobre idiomas (no aplica), parametros totales ni contexto, ya que no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa basado en CNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos `.pt` en precision original; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (formato nativo Ultralytics/PyTorch); nombre de fichero de ejemplo: `wildlife-yolo11n-cpu.pt` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n, la variante "nano" de la familia YOLO11 de Ultralytics: un detector de objetos de una sola etapa con backbone convolucional y cabecera de prediccion densa, optimizado para bajo coste computacional. Se parte de los pesos COCO-pretrained y se realiza un fine-tuning supervisado sobre el dataset African Wildlife de Ultralytics (split de entrenamiento de 1.052 imagenes), seleccionando el mejor epoch sobre el split de validacion (225 imagenes).

Los hiperparametros documentados son: 12 epocas, tamano de imagen 512, batch de 16, entrenamiento en CPU, semilla 0 y aumentacion por defecto de Ultralytics. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion (no aplican a un detector). La innovacion principal es la especializacion de dominio: el modelo base COCO no detecta correctamente bufalo ni rinoceronte (AP50 de 0,000 en ambos), mientras que el fine-tuning eleva esas clases a 0,959 y 0,950 respectivamente, manteniendo un rendimiento alto en elefante (0,966) y cebra (0,945).

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases: `buffalo`, `elephant`, `rhino` y `zebra`.
- Prediccion de cajas delimitadoras con puntuaciones de confianza (umbral configurable, p. ej. `conf=0.3`).
- Integracion con la libreria Ultralytics (`from ultralytics import YOLO`), lo que permite inferencia en CPU y GPU, exportacion a otros formatos (ONNX, TensorRT, etc.) mediante las utilidades de Ultralytics.
- Uso como motor de sugerencias de anotacion en la herramienta Annotrix (variable `LA_DETECTOR`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: es un modelo de vision puro.
- No dispone de modo "thinking", vision multimodal (image-to-text) ni procesamiento de audio.

## Casos de uso

- Anotacion asistida de datasets de fauna: Annotrix usa el modelo para proponer cajas delimitadoras sobre imagenes de vida salvaje, reduciendo el trabajo manual de etiquetado en flujos de creacion de datasets de vision. Es adecuado por su alta mAP@0.5 (0,955) en las cuatro clases objetivo.
- Monitorizacion de reservas y censos de fauna: procesar lotes de imagenes de camaras trampa para contar bufalos, elefantes, rinocerontes y cebras; el bajo coste del modelo nano permite ejecucion en CPU en campo o en dispositivos modestos.
- Filtrado y triaje de imagenes en proyectos de conservacion: descartar automaticamente imagenes sin animales de interes antes de un analisis manual mas costoso.
- Educacion e investigacion en vision por computador: ejemplo reproducible de fine-tuning de YOLO11n sobre un dataset publico (African Wildlife) con resultados documentados, util para cursos y practicas.
- Prototipado rapido de pipelines de deteccion: al ser un `.pt` de Ultralytics, se puede integrar en scripts de Python y exportar a ONNX/TensorRT para despliegues en produccion con cambios minimos.
- Pre-etiquetado en herramientas de anotacion propias: cualquier herramienta que consuma predicciones YOLO puede usar este modelo como paso previo a la revision humana, gracias a su formato estandar y a la API de Ultralytics.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de African Wildlife (227 imagenes, 375 animales):

| Modelo | mAP@0.5 | mAP@0.5:0.95 | AP50 buffalo | AP50 elephant | AP50 rhino | AP50 zebra |
|---|---|---|---|---|---|---|
| YOLO11n COCO-pretrained | 0,444 | 0,374 | 0,000 | 0,789 | 0,000 | 0,987 |
| Annotrix wildlife YOLO11n | 0,955 | 0,797 | 0,959 | 0,966 | 0,950 | 0,945 |

No se han publicado otros resultados de benchmarks (p. ej. latencia o throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de YOLO11n (variante nano) el consumo es bajo y cabe holgadamente en GPUs de consumo, aunque no se documentan cifras.
- GPU recomendadas: no documentadas; el modelo fue entrenado en CPU, lo que indica que la inferencia en CPU es viable.
- Cabe en GPU de consumo: si, por el tamano reducido de la variante nano (no se especifica el modelo concreto).
- Opciones de despliegue: Ultralytics (Python), con posibilidad de exportacion a ONNX, TensorRT u otros formatos mediante la propia libreria; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@0.5 (African Wildlife test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Annotrix wildlife YOLO11n | no disponible | no aplica | 0,955 | AGPL-3.0 | Hugging Face (AnishGaware10/annotrix-wildlife-yolo11n) |
| YOLO11n COCO-pretrained | no disponible | no aplica | 0,444 | AGPL-3.0 (Ultralytics) | Ultralytics / GitHub |
| Otras variantes YOLO11 (s, m, l, x) | no disponible | no aplica | no disponible | AGPL-3.0 (Ultralytics) | Ultralytics / GitHub |

No se dispone de datos de otros detectores especializados en fauna africana en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo detecta cuatro clases (`buffalo`, `elephant`, `rhino`, `zebra`); cualquier otra especie u objeto se ignorara o se clasificara erroneamente.
- Entrenado con solo 12 epocas y 1.052 imagenes en CPU: el rendimiento puede degradarse en condiciones de imagen distintas a las del dataset (iluminacion, angulos, oclusiones, camaras trampa nocturnas).
- Riesgo de falsos positivos y negativos en escenas con animales parcialmente visibles o muy pequeños; se recomienda ajustar el umbral de confianza (`conf`) segun el caso de uso.
- No se documentan sesgos especificos, pero el dataset African Wildlife puede no representar la diversidad de habitats, razas o condiciones reales de despliegue.
- Licencia AGPL-3.0: el uso comercial exige cumplir las obligaciones de copyleft de la AGPL, lo que puede condicionar su integracion en productos propietarios o servicios en red.
- No apto para tareas de generacion de texto, razonamiento, codigo ni multilingues: es exclusivamente un detector de objetos.
- No se documentan cifras de latencia, cuantizacion ni requisitos de hardware, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnishGaware10/annotrix-wildlife-yolo11n
- Repositorio Annotrix: https://github.com/anishg1010/Annotrix
- Ultralytics YOLO11 (repositorio): https://github.com/ultralytics/ultralytics
- Dataset African Wildlife (Ultralytics): no disponible como enlace directo en la informacion proporcionada
