# edoardochiavazza/drone-navigation-models

## Resumen

`edoardochiavazza/drone-navigation-models` es un repositorio que agrupa varios artefactos de inferencia (no un unico modelo) desarrollados en el marco de un proyecto de tesis sobre navegacion de drones controlada por LLM en dispositivos edge. Incluye un modelo de lenguaje pequeno (SmolLM2-135M) afinado para interpretar comandos de dron y exportado a GGUF en cuantizaciones Q8_0 y Q4_0, junto con detectores de objetos YOLOv8n y YOLOv5s compilados para distintas plataformas de hardware (CPU, NPU STM32MP2 y NPU Rockchip).

El componente de lenguaje tiene 134.515.008 parametros (segun los safetensors del repo) y parte de la arquitectura SmolLM2 de Hugging Face, un transformer decoder-only de la familia de modelos pequenos. El repositorio ocupa 0,3 GB y esta pensado para ejecutarse en placas embebidas como la STM32MP2 con llama.cpp/llama-server.

Su relevancia actual radica en el creciente interes por llevar agentes de lenguaje a hardware de bajo consumo para robotica y sistemas autonomos. Este repositorio es un ejemplo concreto de ese patron: un SLM que traduce instrucciones en lenguaje natural a acciones de navegacion, combinado con un detector visual cuantizado para percibir el entorno. La licencia es "other" y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM2 (transformer decoder-only) para el SLM; YOLOv8n y YOLOv5s para deteccion visual |
| Parametros totales | 134.515.008 (componente SLM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (con importance matrix) y Q4_0 (con importance matrix); INT8 para el detector TFLite; compilaciones NPU (.nb, .rknn) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (SLM), .pt (PyTorch), .tflite (INT8), .nb (STM32MP2 NPU), .rknn (Rockchip NPU) |

## Arquitectura y entrenamiento

El componente de lenguaje es un fine-tune de SmolLM2-135M, un transformer decoder-only de 135 millones de parametros. El autor lo ha afinado para la tarea de interpretar comandos de dron y lo ha exportado a GGUF con cuantizacion Q8_0 y Q4_0, ambas generadas con importance matrix (imat), lo que suele mejorar la fidelidad de la cuantizacion al ponderar los pesos segun su relevancia para la distribucion de calibracion. El objetivo declarado es su despliegue en la STM32MP2, una placa con CPU y NPU de bajo consumo.

El componente de percepcion son detectores YOLO: un YOLOv8n con entrada de 320x320 y 5 clases (pedestrian, BMW_X5, dog, bench, oil_barrel), exportado a PyTorch, TFLite INT8 y formato .nb para la NPU del STM32MP2; y un YOLOv5s con entrada de 640x640 compilado a .rknn para la NPU de Rockchip. Los datos de entrenamiento estan publicados en el dataset `edoardochiavazza/drone-datasets`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de lenguaje ni si hubo RLHF/DPO.

## Capacidades

- Interpretacion de comandos de dron en lenguaje natural (fine-tune especifico del SLM sobre SmolLM2-135M).
- Generacion de texto conversacional (tag "conversational" en el repo).
- Deteccion de objetos con YOLOv8n en 5 clases: peatones, BMW_X5, perro, banco y barril de aceite.
- Deteccion de objetos con YOLOv5s a 640x640 para la NPU de Rockchip.
- Inferencia en dispositivos edge: CPU (GGUF via llama.cpp), NPU STM32MP2 (.nb) y NPU Rockchip (.rknn).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio del SLM: no disponible (la vision la aporta el componente YOLO, no el SLM).

## Casos de uso

- Control de dron por voz o texto en edge: el SLM traduce instrucciones en lenguaje natural a comandos de navegacion ejecutables, ejecutandose localmente en la STM32MP2 mediante llama-server sin depender de la nube.
- Navegacion asistida en interiores con percepcion embebida: el detector YOLOv8n INT8 identifica peatones y obstaculos (bancos, barriles) a 320x320 y el SLM convierte la intencion del operador en maniobras.
- Prototipado en simulacion Webots: el tag "webots" indica que los modelos se integran en el simulador para validar el bucle percepcion-decision antes de pasar al hardware real.
- Despliegue en plataformas Rockchip: el YOLOv5s .rknn permite deteccion a 640x640 en placas con NPU Rockchip para aplicaciones de vigilancia o inspeccion aerea.
- Investigacion academica en SLM para robotica: el repo sirve como referencia reproducible (pesos, cuantizaciones y dataset publicados) para estudiar el rendimiento de un LLM de 135M en tareas de control embebido.
- Sistemas de bajo consumo y desconectados: al caber en 0,3 GB y ejecutarse con llama.cpp, el SLM es apto para drones con restricciones severas de energia y conectividad.
- Pipeline de vision + lenguaje en tiempo real: combinacion del detector cuantizado y el SLM para generar descripciones de escena o decisiones de evasion a partir de la deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para el SLM: el repo completo ocupa 0,3 GB; el GGUF Q4_0 de un modelo de 135M ronda los 80-100 MB y el Q8_0 en torno a 140-150 MB (estimacion por tamano de parametros, no confirmada en la informacion).
- GPU recomendadas: no disponible; el diseno apunta a CPU y NPU embebidas, no a GPU de datacenter.
- Cabe en GPU consumer: si, cualquier GPU consumer moderna puede ejecutar un modelo de 135M; tambien cabe en CPU de placa embebida.
- Opciones de despliegue: llama.cpp / llama-server (comando de uso incluido en la model card), TFLite para el detector INT8, runtime de NPU STM32MP2 (.nb) y runtime RKNN de Rockchip (.rknn).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| edoardochiavazza/drone-navigation-models (SLM) | 134,5 M | no disponible | other | SLM afinado para comandos de dron + YOLO |
| SmolLM2-135M (Hugging Face) | 135 M | no disponible | Apache 2.0 (modelo base) | LLM generalista pequeno |
| Qwen2.5-0.5B | 494 M | 32k (segun ficha del modelo base) | Apache 2.0 | LLM generalista pequeno |
| TinyLlama-1.1B | 1,1 B | 2k (segun ficha del modelo base) | Apache 2.0 | LLM generalista pequeno |

La comparativa se limita al componente de lenguaje; no se dispone de datos de rendimiento para comparar tareas especificas de navegacion de dron. Los modelos alternativos son generalistas y no incluyen el pipeline de percepcion YOLO ni las compilaciones para NPU embebida.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos exactos; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- El SLM es un fine-tune muy especializado en comandos de dron; su rendimiento en tareas generales de lenguaje sera limitado por sus 135M de parametros.
- No se declaran idiomas soportados; no hay garantia de funcionamiento en castellano u otros idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinacion inherente a un modelo de lenguaje pequeno, especialmente en instrucciones ambiguas o fuera de distribucion.
- El detector YOLOv8n esta entrenado solo para 5 clases (pedestrian, BMW_X5, dog, bench, oil_barrel); no generaliza a otros objetos o entornos.
- No hay datos publicados de benchmarks, latencia ni throughput; el rendimiento real en la STM32MP2 o en Rockchip no esta cuantificado en la informacion disponible.
- El repositorio mezcla artefactos de distintos formatos y plataformas; no es un unico modelo cargable con una sola libreria.
- No se especifican sesgos conocidos ni detalles del dataset de entrenamiento del SLM mas alla del enlace al dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/edoardochiavazza/drone-navigation-models
- Dataset de entrenamiento: https://huggingface.co/datasets/edoardochiavazza/drone-datasets
- Codigo del proyecto: referenciado en la model card como repositorio de GitHub (URL no incluida en la informacion disponible)
- Modelo base SmolLM2: no disponible en la informacion proporcionada
