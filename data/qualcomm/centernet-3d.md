# qualcomm/CenterNet-3D

## Resumen

CenterNet-3D es un modelo de vision por computador desarrollado por Qualcomm que genera una representacion en vista de pajaro (bird's eye view, BEV) a partir de las camaras montadas en un vehiculo. No es un modelo de lenguaje: se trata de un detector basado en el paradigma de puntos centrales (center-based detection) que estima la posicion y la orientacion de objetos en el plano del suelo, una representacion habitual en los sistemas de percepcion para conduccion asistida y autonoma.

La implementacion original procede del repositorio CenterNet de Xingyi Zhou (paper "Objects as Points", arXiv:1904.07850) y Qualcomm la ha portado, compilado y optimizado para su propio hardware. El repositorio de HuggingFace no contiene pesos en formato generico, sino artefactos precompilados para el runtime QNN de Qualcomm, exportados con Qualcomm AI Hub Models y el SDK QAIRT. El repositorio ocupa 2,2 GB e incluye binarios especificos por chipset.

Su relevancia actual es practica: permite ejecutar percepcion BEV en dispositivo (on-device) sobre plataformas Snapdragon moviles, de automocion y de PC, con cuantizacion w8a16, sin depender de GPU de servidor. El modelo se publica bajo licencia MIT y esta pensado para integrarse en pipelines de inferencia embebida mediante ONNX Runtime sobre el acelerador Hexagon NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de deteccion basada en puntos centrales (CenterNet); backbone no especificado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | w8a16 y w8a16_mixed_fp16 |
| Idiomas soportados | no disponible (no aplica; el modelo procesa imagenes de camara) |
| Licencia | MIT |
| Formato de pesos | binarios precompilados QNN ONNX (PRECOMPILED_QNN_ONNX); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 2,2 GB |
| Entrada | imagenes de camaras montadas en vehiculo (multivista, segun la descripcion) |
| Salida | representacion en vista de pajaro (bird's eye view) |
| Runtime objetivo | Qualcomm AI Engine Direct (QAIRT 2.45 / 2.50), ONNX Runtime 1.27.1 / 1.30.0 |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

CenterNet-3D sigue la aproximacion de CenterNet: en lugar de generar anclas y regresar offsets como los detectores de dos etapas, el modelo predice mapas de calor de centros de objeto y, sobre cada centro, regresiona las propiedades geometricas del objeto. En esta variante 3D esas propiedades incluyen la localizacion en el plano del suelo, de modo que la salida agregada de las camaras se proyecta a una rejilla cenital (BEV) utilizable por modulos de planificacion y control. El backbone concreto, el numero de capas y el detalle de las cabezas de prediccion no se especifican en la informacion proporcionada.

No hay datos disponibles sobre el conjunto de entrenamiento, el numero de tokens o imagenes, la composicion del dataset ni sobre si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio, donde lo habitual seria entrenamiento supervisado con anotaciones 3D). Tampoco se documentan innovaciones tecnicas propias mas alla del trabajo de optimizacion para hardware Qualcomm: cuantizacion de pesos a 8 bits con activaciones de 16 bits (w8a16), variante mixta con FP16 (w8a16_mixed_fp16) y compilacion previa por chipset mediante Qualcomm AI Hub Workbench.

## Capacidades

- Generacion de una representacion en vista de pajaro a partir de imagenes de camaras de vehiculo.
- Deteccion y localizacion de objetos en el plano del suelo orientada a percepcion de entorno vial.
- Inferencia on-device en aceleradores Qualcomm Hexagon NPU mediante binarios precompilados por chipset.
- Ejecucion a traves de ONNX Runtime sobre el runtime QNN de Qualcomm.
- Exportacion con configuraciones personalizadas mediante la libreria Qualcomm AI Hub Models (version 0.64.0).
- Perfilado y evaluacion del modelo en dispositivos Qualcomm alojados mediante AI Hub Workbench.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni soporte multilingue: es un modelo puramente visual.

## Casos de uso

- Percepcion BEV para sistemas ADAS: el modelo transforma las imagenes de las camaras del vehiculo en una rejilla cenital que los modulos de fusion y planificacion pueden consumir directamente, con ejecucion en la propia unidad de a bordo.
- Aparcamiento asistido y vision envolvente: la vista de pajaro generada permite representar el entorno inmediato del vehiculo y los obstaculos alrededor, alimentando interfaces de ayuda al conductor.
- Prototipado de conduccion autonoma en vehiculos de investigacion: al estar bajo licencia MIT y disponibles los binarios para varios Snapdragon, un equipo puede desplegar el modelo en una plataforma embebida sin reentrenar.
- Robotica movil en interiores y exteriores: la representacion cenital es reutilizable para navegacion y evitacion de obstaculos en robots con camaras montadas en cabecera.
- Analisis de flotas y video de salpicadero: procesamiento en dispositivo del flujo de camaras para extraer la ocupacion del entorno sin enviar video a la nube, reduciendo coste de ancho de banda y exposicion de datos.
- Generacion de datos sinteticos y etiquetado automatico: la salida BEV puede emplearse como pseudoetiqueta para preentrenar o aumentar datasets de percepcion en investigacion.
- Evaluacion comparativa de aceleradores: los binarios por chipset (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite, Dragonwing IQ-8275, QCS8550, IQ-9075) permiten medir latencia y consumo de la misma red en distintas generaciones de NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a una seccion de resumen de rendimiento por dispositivo ("performance summary") y a Qualcomm AI Hub Workbench para perfilado, pero los valores numericos no forman parte del extracto proporcionado. No se dispone por tanto de cifras de mAP, latencia ni throughput.

## Requisitos de hardware

- El modelo no se distribuye para GPU de escritorio o servidor: los artefactos publicados son binarios precompilados para aceleradores Qualcomm.
- VRAM estimada para inferencia: no aplica en el sentido habitual; el consumo de memoria depende del chipset y de la cuantizacion. No se dispone de cifras concretas.
- Plataformas objetivo documentadas: Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Qualcomm Dragonwing IQ-8275, Qualcomm Dragonwing QCS8550 (proxy) y Qualcomm Dragonwing IQ-9075.
- GPU de consumo (RTX 4090, etc.): no contemplado en la informacion proporcionada; no hay artefactos para CUDA.
- Opciones de despliegue: runtime QNN de Qualcomm con QAIRT 2.45 o 2.50 y ONNX Runtime 1.27.1 o 1.30.0; exportacion personalizada mediante la libreria Qualcomm AI Hub Models. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Licencia | Plataforma objetivo | Disponibilidad |
|---|---|---|---|---|
| CenterNet-3D (qualcomm) | BEV a partir de camaras de vehiculo | MIT | Aceleradores Qualcomm (QNN) con binarios precompilados | Artefactos por chipset en HuggingFace y AI Hub Models |
| CenterNet original (xingyizhou/CenterNet) | Deteccion 2D/3D basada en puntos centrales | no disponible en la informacion proporcionada | GPU generica (PyTorch) | Repositorio publico en GitHub |
| Alternativas de percepcion BEV (Lift-Splat-Shoot, BEVDet, BEVFormer) | Deteccion y segmentacion en vista de pajaro | no disponible en la informacion proporcionada | GPU generica; despliegue embebido no incluido por defecto | Repositorios de investigacion |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de percepcion, su comportamiento depende fuertemente de la distribucion del dataset de entrenamiento, que no se documenta.
- Riesgo de alucinacion: en el sentido generativo no aplica, pero existe riesgo de falsos positivos y falsos negativos en la deteccion, con impacto directo en seguridad si se usa en conduccion.
- La informacion no detalla el backbone ni los parametros, lo que dificulta estimar coste computacional o comparar con alternativas.
- Limitaciones de contexto o idioma: no aplica; el modelo procesa imagenes y no tiene entrada de texto.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, pero el repositorio solo distribuye binarios precompilados para hardware Qualcomm; el uso en otras plataformas exigiria reexportar desde el codigo fuente.
- Dependencia de versiones concretas del runtime (QAIRT 2.45/2.50, ONNX Runtime 1.27.1/1.30.0): desajustes de version pueden invalidar los binarios precompilados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en produccion.
- No se documentan resultados de validacion ni pruebas de robustez en condiciones adversas (lluvia, baja luminosidad, oclusiones).
- Uso en produccion: cualquier despliegue en un sistema de seguridad critica requiere validacion propia; la model card no incluye informacion suficiente para certificacion funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/CenterNet-3D
- Libreria Qualcomm AI Hub Models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/centernet_3d
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Implementacion original de CenterNet: https://github.com/xingyizhou/CenterNet
- Paper de referencia "Objects as Points": https://arxiv.org/abs/1904.07850
- Imagen de demostracion del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/centernet_3d/web-assets/model_demo.png
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
