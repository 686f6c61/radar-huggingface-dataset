# edoardochiavazza/drone-navigation-models

## Resumen

El repositorio `edoardochiavazza/drone-navigation-models` no contiene un unico modelo generativo, sino un conjunto de artefactos heterogeneos orientados a la navegacion autonoma de drones en dispositivos de borde (edge devices). Lo publica Edoardo Chiavazza en el marco de su proyecto de tesis "LLM-driven drone navigation on edge devices", vinculado al repositorio `idsia-robotics/chiavazza-slm-semantic-exploration`. El paquete combina un modelo de lenguaje pequeno (SmolLM2-135M afinado para comandos de dron) con detectores de objetos de la familia YOLO (YOLOv8n y YOLOv5s) compilados para distintas plataformas de hardware.

La relevancia del conjunto reside en su enfoque: llevar razonamiento en lenguaje natural y percepcion visual a hardware embebido con recursos muy limitados, concretamente una placa STM32MP2 (con NPU) y una plataforma Rockchip. Para ello se emplean cuantizaciones agresivas (Q4_0 y Q8_0 con importance matrix para el SLM, INT8 para el detector) y formatos especificos de cada acelerador (`.nb` para STM32MP2, `.rknn` para Rockchip).

El dato de parametros reportado por safetensors (134.515.008) es coherente con el tamano de SmolLM2-135M, lo que confirma que el componente de lenguaje es un transformer decoder de ~135 millones de parametros. El repo ocupa 0,3 GB. La licencia es "other", sin que la model card concrete los terminos exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2-135M afinado) para el SLM; CNN (YOLOv8n / YOLOv5s) para deteccion |
| Parametros totales | 134.515.008 (componente SLM, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 con importance matrix, Q4_0 con importance matrix (GGUF); INT8 (TFLite); compilacion NPU (`.nb`, `.rknn`) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | GGUF, TFLite, `.nb` (STM32MP2 NPU), `.rknn` (Rockchip NPU), `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El componente de lenguaje es un SmolLM2-135M afinado para la tarea de interpretar y emitir comandos de dron, distribuido en GGUF con cuantizacion Q8_0 y Q4_0 generadas con importance matrix (imatrix), tecnica que pondera la cuantizacion segun la relevancia de los pesos para reducir la perdida de calidad. La model card indica que la variante Q8_0 es la empleada sobre la STM32MP2.

El componente de percepcion es YOLOv8n con entrada de 320x320 y cinco clases (pedestrian, BMW_X5, dog, bench, oil_barrel), exportado a PyTorch (`.pt`), TFLite INT8 y binario compilado para la NPU del STM32MP2. Se incluye ademas un YOLOv5s de 640x640 en formato `.rknn` para la NPU de Rockchip. Los datos de entrenamiento se publican en el dataset `edoardochiavazza/drone-datasets`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de comandos de dron en lenguaje natural mediante el SLM afinado (SmolLM2-135M).
- Deteccion de objetos en tiempo real con YOLOv8n a 320x320 sobre cinco clases concretas del entorno de simulacion Webots.
- Inferencia en dispositivos de borde: despliegue en STM32MP2 (CPU y NPU) y Rockchip (NPU).
- Ejecucion local sin conexion mediante `llama-server` con los ficheros GGUF.
- Integracion con simulacion Webots (etiqueta `webots` del repo).
- Capacidades de tool calling, agentes multi-paso, vision-lenguaje unificada, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Navegacion semantica de drones en simulacion: el SLM traduce instrucciones de alto nivel en comandos de movimiento, mientras YOLOv8n aporta la percepcion de obstaculos y objetivos (peatones, vehiculos, bancos, barriles) en el entorno Webots.
- Despliegue en robotica embebida con STM32MP2: los ficheros `.nb` y el GGUF Q8_0 estan compilados y cuantizados especificamente para esta placa, lo que permite ejecutar percepcion y control en el mismo SoC sin GPU dedicada.
- Prototipado en plataformas Rockchip: el `.rknn` de YOLOv5s a 640x640 permite acelerar la deteccion por NPU en placas basadas en Rockchip para pruebas de vision a bordo.
- Investigacion academica en SLM para control: sirve como referencia reproducible (codigo y dataset publicados) para estudiar como un modelo de 135M parametros puede mapear lenguaje a acciones de bajo nivel.
- Benchmarking de cuantizacion en edge: la disponibilidad de Q4_0 y Q8_0 con imatrix sobre el mismo modelo permite comparar latencia y calidad en hardware restringido.
- Educacion y demostraciones de IA en el borde: el tamano reducido del repo (0,3 GB) y el uso de `llama-server` facilitan montar demos locales de pipelines percepcion-mas-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el SLM: inferior a 1 GB en Q4_0 y en torno a 150-200 MB en Q8_0 para un modelo de 135M parametros (estimacion por tamano, no confirmada en la model card).
- Hardware objetivo declarado: STM32MP2 (CPU y NPU) y plataformas Rockchip con NPU.
- GPU de escritorio: no se especifican; por tamano, el SLM cabe en cualquier GPU consumer e incluso en CPU.
- Despliegue del SLM: `llama-server` con GGUF, segun el ejemplo de uso de la model card.
- Despliegue de deteccion: TFLite (INT8), runtime de STM32MP2 para `.nb` y runtime Rockchip para `.rknn`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formatos |
|---|---|---|---|---|---|
| edoardochiavazza/drone-navigation-models (SLM) | 134,5 M | no disponible | Comandos de dron | other | GGUF (Q4_0, Q8_0 imatrix) |
| SmolLM2-135M (base) | 135 M | no disponible en esta ficha | Generacion de texto general | no disponible en esta ficha | safetensors, GGUF |
| YOLOv8n (Ultralytics) | no disponible en esta ficha | no aplica | Deteccion de objetos | no disponible en esta ficha | `.pt`, TFLite, ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El SLM esta afinado para un dominio muy concreto (comandos de dron en un entorno de simulacion con cinco clases de objetos); su uso fuera de ese dominio no esta validado.
- El detector YOLOv8n solo reconoce cinco clases (pedestrian, BMW_X5, dog, bench, oil_barrel), insuficientes para navegacion real en entornos abiertos.
- La licencia "other" no detalla condiciones de uso comercial; es necesario contactar con el autor o revisar el repositorio de codigo antes de un uso productivo.
- No se documentan idiomas soportados ni longitud de contexto del SLM.
- No hay benchmarks publicados, por lo que no puede evaluarse la calidad del afinado frente al SmolLM2-135M original.
- Riesgo de alucinacion inherente a un modelo de 135M parametros; en control de drones, una salida erronea puede traducirse en comandos peligrosos, por lo que requiere capas de validacion.
- Los binarios `.nb` y `.rknn` dependen de versiones concretas de toolchains y runtimes de cada plataforma; la portabilidad entre versiones no esta garantizada.
- El proyecto es un trabajo de tesis con 230 descargas y 0 likes; no hay evidencia de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/edoardochiavazza/drone-navigation-models
- Dataset de entrenamiento: https://huggingface.co/datasets/edoardochiavazza/drone-datasets
- Codigo del proyecto: https://github.com/idsia-robotics/chiavazza-slm-semantic-exploration
