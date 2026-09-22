# Renesas/DenseNet121-ONNX

## Resumen

DenseNet121-ONNX es un repositorio publicado por Renesas Electronics que contiene una exportación ONNX en FP32 del modelo DenseNet-121, preparada para ejecutar clasificación de imágenes sobre la plataforma Renesas R-Car X5H mediante su NPU NPX6-48K. No se trata de un modelo entrenado por Renesas, sino de una adaptación del modelo `densenet-12` del ONNX Model Zoo (`onnxmodelzoo/densenet-12`), orientada a un flujo de despliegue embebido con el runtime propietario MWMX (Middleware MX).

El modelo resuelve una tarea concreta: clasificación de imágenes en 1000 clases sobre ImageNet ILSVRC2012, con un coste computacional bajo (8,0 M de parámetros) y una latencia medida de 8,02 ms por inferencia en una configuración de un único núcleo de NPU a 850 MHz. Su relevancia actual está en el segmento de automoción y sistemas embebidos: Renesas lo publica como artefacto de referencia para validar el pipeline de compilación e inferencia sobre el silicio X5H, no como modelo de propósito general.

La particularidad técnica del repositorio es que solo distribuye el grafo ONNX en FP32: la conversión a INT8 la realiza automáticamente la herramienta MWMX en tiempo de compilación, de modo que no se publica ningún fichero INT8 separado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye métricas de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (red convolucional con conectividad densa entre capas) |
| Parametros totales | 8,0 M (8.0M segun el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo convolucional de vision con entrada de imagen) |
| Tipos de cuantizacion | FP32 en el ONNX publicado; INT8 auto-cast por la toolchain MWMX en tiempo de compilacion. No se distribuye fichero INT8 |
| Idiomas soportados | No disponible (etiquetas de clase de ImageNet, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`fp32/densenet-12.onnx`) |
| Tarea | Clasificacion de imagenes, ImageNet ILSVRC2012, 1000 clases |
| Plataforma objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Runtime de inferencia | Renesas MWMX (Middleware MX) |
| Resolucion de entrada | No disponible (marcada como TBD en la model card) |
| Modelo base | `onnxmodelzoo/densenet-12` (ONNX Model Zoo) |

## Arquitectura y entrenamiento

DenseNet-121 es una red neuronal convolucional en la que cada capa recibe como entrada los mapas de características de todas las capas anteriores, concatenados en lugar de sumados. Esta conectividad densa reduce el número de parámetros necesarios para un mismo nivel de profundidad y favorece la reutilización de características y el flujo de gradientes. El modelo original procede del ONNX Model Zoo (`densenet-12`), que a su vez es una exportación del modelo de referencia entrenado sobre ImageNet ILSVRC2012 con 1000 clases de salida.

En este repositorio, Renesas no documenta el proceso de entrenamiento ni el dataset más allá de indicar la tarea y el origen del modelo base: no se especifican número de tokens o imágenes de entrenamiento, composición del dataset, ni si hubo etapas de ajuste fino, RLHF o DPO (no aplicables en un clasificador de imágenes). Tampoco se publica información sobre aumentos de datos, esquema de optimización o calibración de cuantización. La innovación técnica destacable aquí no está en el entrenamiento, sino en el flujo de despliegue: el grafo FP32 se compila con la toolchain MWMX, que aplica el casteo a INT8 automáticamente y lo ejecuta sobre la NPU NPX6-48K del SoC R-Car X5H. La model card señala además que la conectividad densa genera muchas operaciones secuenciales sobre tensores pequeños, lo que explica que la paralelización en 12 núcleos no aporte ventaja frente a un único núcleo.

## Capacidades

- Clasificación de imágenes: asigna una de las 1000 clases de ImageNet ILSVRC2012 a una imagen de entrada.
- Extracción de características visuales: al ser una CNN densa, las activaciones intermedias pueden emplearse como representaciones para tareas posteriores (no documentado por el autor).
- Ejecución en NPU embebida: inferencia acelerada en el NPX6-48K integrado en el SoC R-Car X5H mediante el runtime MWMX.
- Cuantización automática: el pipeline acepta un ONNX en FP32 y produce ejecución INT8 sin paso de cuantización manual.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Modo thinking, visión general (VQA, detección, segmentación), audio o generación de texto: no soportados.

## Casos de uso

- Validación de la cadena de herramientas MWMX: el repositorio sirve como artefacto de referencia para comprobar que la compilación ONNX FP32 → INT8 y la ejecución en la NPU NPX6 funcionan correctamente en una placa R-Car X5H, usando la latencia publicada (8,02 ms a 1 núcleo) como línea base.
- Clasificación de escenas en sistemas de visión para automoción: dentro del propio SoC R-Car X5H, el modelo puede etiquetar fotogramas capturados por cámara para tareas auxiliares de categorización de entorno, con un coste de 8 ms por imagen que deja margen para otros procesos en el mismo chip.
- Preprocesado o triaje en pipelines de visión por computador: usar la salida de 1000 clases como filtro previo para decidir qué fotogramas merecen análisis más costosos en etapas posteriores.
- Inspección visual industrial en el borde: clasificación de piezas o productos sobre hardware embebido, sin necesidad de enviar imágenes a la nube, apoyándose en la licencia Apache 2.0 para integrarlo en producto.
- Indexado y etiquetado automático de grandes colecciones de imágenes: el bajo número de parámetros (8,0 M) y la latencia de milisegundos permiten procesar lotes a gran escala en hardware dedicado.
- Investigación en eficiencia de CNN sobre NPU: comparar el comportamiento de una red densa frente a arquitecturas con conectividad residual en el mismo acelerador, dado que la model card documenta explícitamente que el escalado a 12 núcleos empeora ligeramente la latencia.
- Banco de pruebas de cuantización INT8: evaluar el impacto en precisión del casteo automático de la toolchain MWMX, aunque en este repositorio la exactitud figura como TBD.

## Benchmarks y rendimiento

La model card únicamente publica latencias medidas en hardware real (Renesas R-Car X5H, runtime MWMX, batch size 1, NPU a 850 MHz). No hay datos de precisión (top-1, top-5) ni métricas sobre MMLU, HumanEval o GSM8K, que no aplican a un clasificador de imágenes.

| Parametros | Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|---|
| 8,0 M | MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 nucleo, 850 MHz | 8,019356 | Medido |
| 8,0 M | MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 12 nucleos, 850 MHz | 8,780072 | Medido |

| Metrica de precision | Valor |
|---|---|
| Top-1 ImageNet | No disponible (TBD en la model card) |
| Top-5 ImageNet | No disponible (TBD en la model card) |

Nota del autor: la configuración de 12 núcleos resulta ligeramente más lenta que la de 1 núcleo, porque la conectividad densa produce muchas operaciones secuenciales sobre tensores pequeños y el coste de paralelización supera el beneficio. El throughput derivado de la latencia medida es de aproximadamente 124,7 inferencias por segundo con 1 núcleo y 113,9 con 12 núcleos, en batch 1.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual, ya que la inferencia se ejecuta en NPU, no en GPU. Como referencia de tamaño de pesos, 8,0 M de parámetros ocupan aproximadamente 32 MB en FP32 y 8 MB en INT8.
- GPU recomendadas: no disponible. El repositorio está dirigido exclusivamente a la NPU NPX6-48K del SoC Renesas R-Car X5H.
- Compatibilidad con GPU de consumo: no documentada. No se indica soporte para RTX 4090, RTX 3090 ni similares.
- Hardware imprescindible según el autor: placa Renesas R-Car X5H con NPU NPX6, runtime MWMX y la CLI de Hugging Face para descargar los pesos.
- Opciones de despliegue: Renesas MWMX Runtime (única ruta documentada). No se mencionan vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, que además no son aplicables a un clasificador CNN de este tipo. El uso con ONNX Runtime no está documentado en la información disponible.
- Latencia: 8,019356 ms con 1 núcleo de NPU a 850 MHz; 8,780072 ms con 12 núcleos a 850 MHz; batch size 1.
- Throughput: no publicado directamente; derivado de la latencia, aproximadamente 124,7 inferencias/s (1 núcleo) y 113,9 inferencias/s (12 núcleos).
- Metodología de medición: hardware-in-the-loop sobre silicio físico R-Car X5H, pipeline CI `metawaremx_runtime`, objetivo de rendimiento «APM50».

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos. La tabla siguiente recoge únicamente lo que puede afirmarse con los datos disponibles; las celdas sin dato verificado se marcan como no disponibles.

| Modelo | Parametros | Contexto / entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/DenseNet121-ONNX | 8,0 M | Imagen, resolucion no disponible | No disponible | Apache 2.0 | ONNX FP32 en Hugging Face, ejecucion en NPU NPX6 via MWMX |
| onnxmodelzoo/densenet-12 (modelo base) | No disponible en esta busqueda | Imagen, resolucion no disponible | No disponible | No disponible en esta busqueda | ONNX Model Zoo |
| Otras exportaciones ONNX de clasificacion (ResNet, MobileNet, EfficientNet) | No disponible | No disponible | No disponible | No disponible | No verificado en esta busqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Ámbito funcional muy restringido: es un clasificador de 1000 clases de ImageNet; no genera texto, no razona, no soporta tool calling ni comprensión multimodal general.
- Precisión no publicada: la model card marca la exactitud como TBD, por lo que no se puede evaluar la pérdida introducida por el casteo automático a INT8.
- Dependencia de hardware propietario: la ruta de despliegue documentada requiere una placa Renesas R-Car X5H y el runtime MWMX, lo que limita la portabilidad a otros aceleradores.
- Resolución de entrada no especificada: figura como TBD, un dato crítico para reproducir el pipeline de preprocesado.
- Riesgo de alucinación: no aplica en el sentido generativo; el riesgo equivalente es la clasificación errónea o la confianza mal calibrada en clases ambiguas, especialmente tras la cuantización a INT8.
- Sesgos: no documentados por el autor. Al proceder de un entrenamiento sobre ImageNet, es previsible que arrastre los sesgos de representación de ese dataset, pero no hay análisis publicado en la información disponible.
- Escalado a múltiples núcleos: aumentar de 1 a 12 núcleos no mejora la latencia en este modelo; conviene planificar el despliegue con un único núcleo salvo que el paralelismo se necesite para otras cargas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base del ONNX Model Zoo y las del runtime MWMX, que es software propietario de Renesas y no se cubre por esta licencia.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin comunidad ni soporte documentado más allá de la propia model card.
- Ausencia de información de entrenamiento: no se documentan dataset, número de imágenes, hiperparámetros ni método de calibración de cuantización, lo que dificulta auditar el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Renesas/DenseNet121-ONNX
- Modelo base: https://huggingface.co/onnxmodelzoo/densenet-12
- ONNX Model Zoo (repositorio del modelo `densenet-12`): https://github.com/onnx/models
- Renesas Electronics (sitio corporativo): https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia: https://en.wikipedia.org/wiki/Renesas_Electronics
- Articulo original de DenseNet, «Densely Connected Convolutional Networks» (Huang et al., 2017): https://arxiv.org/abs/1512.03385
- Descarga mediante CLI: `hf download Renesas/DenseNet121-ONNX --repo-type=model --include "fp32/*"`
