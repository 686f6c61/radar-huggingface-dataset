# lh527/smart-wheelchair

## Resumen

El repositorio `lh527/smart-wheelchair` no es un modelo de lenguaje o IA generativa, sino un conjunto de pesos de modelos de aprendizaje automático diseñados para un sistema de silla de ruedas inteligente multimodal. Desarrollado por el autor lh527, este proyecto integra varios componentes de IA para funcionar en dispositivos de borde (edge AI) dentro de un entorno ROS2. Incluye un detector de objetos YOLO11s optimizado a INT8 con OpenVINO, un sistema de reconocimiento de voz (KWS y ASR) basado en sherpa-onnx, un sintetizador de voz (TTS) con kokoro, y dos clasificadores SVM para señales EEG (detección de concentración y de mordida). El objetivo es proporcionar capacidades de navegación asistida, interacción por voz y control mediante señales cerebrales en una silla de ruedas autónoma.

La relevancia de este repositorio radica en su enfoque práctico para la asistencia a personas con movilidad reducida, combinando visión por computador, procesamiento de voz y neurotecnología en un sistema embebido. Aunque no es un modelo único, su arquitectura modular permite su despliegue en hardware de bajo consumo, lo que lo hace interesante para desarrolladores que trabajan en robótica asistencial y sistemas de IA en el borde. El repositorio tiene un tamaño de 0.6 GB y está licenciado bajo MIT, con soporte principal para el idioma chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples modelos: YOLO11s (deteccion de objetos), sherpa-onnx KWS zipformer (deteccion de palabras de activacion), sherpa-onnx streaming zipformer (reconocimiento de voz), kokoro (sintesis de voz), SVM lineal (clasificacion EEG) |
| Parametros totales | No disponible (el repositorio contiene pesos de varios modelos, tamano total 0.6 GB) |
| Parametros activos | No aplica (no es un modelo unico) |
| Longitud de contexto | No aplica (modelos de vision, voz y EEG, no de texto) |
| Tipos de cuantizacion | INT8 (para YOLO11s y ASR streaming), otros formatos no especificados |
| Idiomas soportados | Chino (zh) principalmente; el KWS y ASR soportan chino e ingles segun la descripcion |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (para YOLO11s), ONNX (para sherpa-onnx y kokoro), joblib (para SVM) |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo, sino un conjunto de componentes independientes que se integran en un sistema ROS2. El detector de objetos YOLO11s se proporciona en formato OpenVINO IR con cuantizacion INT8, lo que indica una optimizacion para inferencia en CPU o VPU de Intel. Los modelos de voz (KWS y ASR) provienen de sherpa-onnx, una libreria de reconocimiento de voz basada en arquitecturas zipformer, que son eficientes para streaming en tiempo real. El sintetizador kokoro es un modelo de TTS multi-idioma, tambien cuantizado a INT8. Los clasificadores SVM para EEG estan entrenados para dos tareas: deteccion de concentracion (focus) y deteccion de mordida (clench), con un reporte de entrenamiento que indica una precision del 95.97% en validacion cruzada de 5 pliegues y un AUC de 0.990 sobre 5832 ventanas de datos. No se proporcionan detalles sobre los datos de entrenamiento de los modelos de vision o voz, ni sobre el proceso de entrenamiento (por ejemplo, si se uso RLHF o DPO, no aplica aqui).

## Capacidades

- Deteccion de objetos en tiempo real: el modelo YOLO11s INT8 puede identificar objetos en el entorno de la silla de ruedas, util para la navegacion asistida (por ejemplo, responder a la pregunta "que hay delante").
- Deteccion de palabras de activacion (KWS): el modelo sherpa-onnx KWS reconoce comandos de voz especificos en chino e ingles, permitiendo el control manos libres.
- Reconocimiento de voz continuo (ASR): el modelo streaming zipformer transcribe audio en tiempo real, facilitando la interaccion por voz con el sistema.
- Sintesis de voz (TTS): kokoro genera respuestas habladas, permitiendo que la silla comunique informacion al usuario.
- Clasificacion de señales EEG: los SVMs detectan estados de concentracion y movimientos de mordida, lo que podria usarse como interfaz cerebral para control.
- Integracion con ROS2: los modelos estan disenados para funcionar dentro de un entorno de robotica, facilitando su integracion en sistemas de navegacion autonomos.

## Casos de uso

- Navegacion asistida para personas con movilidad reducida: el sistema puede detectar obstaculos y objetos mediante YOLO11s, ayudando a evitar colisiones en entornos interiores o exteriores.
- Control por voz de la silla: mediante KWS y ASR, el usuario puede dar comandos como "adelante", "gira a la izquierda" o "detente", sin necesidad de usar las manos.
- Interfaz de comunicacion por voz: el TTS permite que la silla proporcione retroalimentacion hablada, como advertencias de obstaculos o confirmacion de acciones.
- Monitoreo de estado cognitivo: los clasificadores EEG pueden detectar niveles de concentracion, lo que podria usarse para ajustar la velocidad o alertar al usuario si pierde atencion.
- Control alternativo mediante señales cerebrales: la deteccion de mordida podria servir como un interruptor para activar funciones especificas, util para usuarios con limitaciones motoras severas.
- Desarrollo de sistemas de asistencia personal en el borde: al estar optimizado para OpenVINO y ONNX, el conjunto de modelos puede desplegarse en mini-PCs o Raspberry Pi con aceleradores, permitiendo prototipos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo el reporte de entrenamiento de los clasificadores EEG. Segun el archivo `models/eeg/training_report_624train.json`, los SVMs alcanzan una precision del 95.97% en validacion cruzada de 5 pliegues y un AUC de 0.990 sobre 5832 ventanas. No hay datos de rendimiento para los modelos de vision o voz.

## Requisitos de hardware

- El repositorio esta disenado para inferencia en el borde, por lo que los modelos estan cuantizados a INT8 y optimizados para OpenVINO, lo que permite ejecutarlos en CPUs Intel con iGPU o VPU.
- Para YOLO11s INT8, se estima que puede funcionar en una Raspberry Pi 4 o superior con OpenVINO, aunque la latencia dependera de la resolucion de entrada y el numero de objetos.
- Los modelos de voz (sherpa-onnx) son ligeros y pueden ejecutarse en tiempo real en CPUs de bajo consumo, como un Intel NUC o un Raspberry Pi 5.
- Los SVMs para EEG son muy ligeros y no requieren GPU; pueden ejecutarse en microcontroladores con suficiente RAM.
- Opciones de despliegue: se recomienda usar OpenVINO Runtime para los modelos IR, y sherpa-onnx para los de voz. No se mencionan frameworks como vLLM o llama.cpp, ya que no son modelos de lenguaje.
- No se proporcionan datos de latencia o throughput especificos.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable directamente con modelos de lenguaje o vision generica, ya que es un conjunto de modelos especializados para una aplicacion concreta. Existen otros proyectos de sillas de ruedas inteligentes (por ejemplo, los mencionados en los resultados de busqueda), pero no se dispone de datos cuantitativos para una comparacion justa.

## Limitaciones y advertencias

- El sistema esta orientado principalmente al idioma chino; el soporte para otros idiomas es limitado (solo ingles en KWS/ASR segun la descripcion).
- Los modelos de EEG requieren un dispositivo de adquisicion de señales cerebrales (por ejemplo, un casco EEG), que no se incluye en el repositorio.
- La precision de la deteccion de objetos puede verse afectada por condiciones de iluminacion o entornos no vistos en el entrenamiento, aunque no se especifican los datos de entrenamiento.
- No se proporcionan garantias de seguridad para uso medico o de navegacion en entornos reales; el sistema debe validarse exhaustivamente antes de su despliegue en pacientes.
- La licencia MIT permite uso comercial, pero los modelos subyacentes (YOLO11, sherpa-onnx, kokoro) pueden tener sus propias licencias; se debe verificar cada componente.
- El repositorio no incluye documentacion sobre como entrenar o ajustar los modelos, solo los pesos preentrenados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/lh527/smart-wheelchair
- Repositorio de GitHub (mencionado en la model card): https://github.com/Lh0326/smart-wheelchair
- Articulo de IEEE Spectrum sobre sillas de ruedas inteligentes: https://spectrum.ieee.org/autonomous-smart-wheelchair
- Articulo de Nature sobre silla autonoma con monitoreo de salud: https://www.nature.com/articles/s41598-024-56357-y
- Paper de arXiv sobre silla inteligente con control por gestos: https://arxiv.org/html/2601.11983
- Proyecto similar en GitHub: https://github.com/TeamAMPTY/Smart-Wheelchair
