# glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillB-n6-reffix-g001-effgb32-100k

## Resumen

WAM DiT4DiT RoboCasa Kitchen Wan22 FaDistillB N6 Reffix G001 EffGB32 100K es un checkpoint de inferencia de un Vision-Action-Model (VAM) basado en el framework DiT4DiT, desarrollado por el autor glory-hyeok. Este modelo combina transformers de generacion de video (Video DiT) con prediccion de acciones mediante flow-matching (Action DiT) para control de manipulacion robotica generalizable. El checkpoint esta entrenado especificamente en el simulador RoboCasa, un entorno de gran escala para tareas domesticas en cocina, y su nombre sugiere que integra tecnicas de distillation de alineacion de flujo (FaDistillB) sobre una base de video WAN 2.2, con 100.000 pasos de entrenamiento.

El repositorio contiene 59.2 GB de pesos en formato safetensors y esta disenado exclusivamente para inferencia, ya que el estado de optimizacion y resume se ha excluido intencionalmente. Aunque el modelo no es un LLM generalista, es relevante para la comunidad de robotica y aprendizaje por imitacion porque aborda el problema de la prediccion conjunta de dinamica visual y acciones motoras, un area activa de investigacion en 2026. La licencia, los idiomas y los parametros exactos no estan disponibles en la informacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT4DiT (Vision-Action Transformer con dos ramas DiT: video y acciones) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiT4DiT es un framework de Vision-Action-Model (VAM) que integra dos transformers basados en difusion (DiT) en un unico modelo: un DiT de video que modela la dinamica de las observaciones visuales y un DiT de acciones que predice los comandos de control del robot. Ambos se entrenan conjuntamente mediante un doble objetivo de flow-matching, lo que permite que el modelo aprenda a generar trayectorias de video coherentes con las acciones ejecutadas. Este enfoque se apoya en el codigo oficial de Mondo Robotics y HKUST, y soporta tanto control de cuerpo completo como de tareas en mesa (tabletop).

El checkpoint concreto corresponde a una variante denominada "FaDistillB" (posiblemente Flow Alignment Distillation con un modelo base B) y "N6" (posiblemente numero de capas o bloques), entrenado sobre la base de video WAN 2.2. El entrenamiento se realizo en el simulador RoboCasa, que proporciona escenarios de cocina realistas y variados para aprendizaje por imitacion. El estado de optimizacion y resume se elimino deliberadamente para reducir el tamano del repositorio, lo que indica que se publica unicamente para inferencia.

## Capacidades

- Generacion de video condicionada a observaciones para predecir la dinamica de la escena.
- Prediccion de acciones de manipulacion robotica mediante flow-matching.
- Control de tareas de cocina (abrir armarios, coger objetos, limpiar superficies, etc.) en simulacion RoboCasa.
- Soporte de control de cuerpo completo (whole-body) y de manipulacion en mesa (tabletop).
- Aprendizaje por imitacion a partir de demostraciones sinteticas generadas por el simulador.
- Integracion con el framework DiT4DiT para entrenamiento conjunto de video y acciones.

## Casos de uso

- **Entrenamiento de politicas robotica en simulacion**: el modelo puede servir como politico de control en entornos RoboCasa para evaluar estrategias de manipulacion antes de transferirlas a un robot real.
- **Generacion de datos sinteticos**: su capacidad de generar video condicionado a acciones permite crear demostraciones sinteticas para entrenar otros modelos de robotica.
- **Investigacion en VAM**: es un punto de partida para estudiar el acoplamiento entre prediccion de video y prediccion de acciones en entornos de interaccion fisica.
- **Benchmarking de manipulacion**: puede usarse como baseline en el benchmark RoboCasa365 para comparar nuevas arquitecturas de VAM.
- **Control de brazo robotico en cocina**: en entornos simulados, el modelo puede ejecutar tareas como recoger objetos de una encimera o abrir un microondas.
- **Estudios de generalizacion**: al estar entrenado en un dominio especifico (cocina), sirve para analizar la capacidad de generalizacion a otras tareas del hogar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. El paper de DiT4DiT (arXiv:2603.10448) reporta resultados generales del framework en RoboCasa, pero no se dispone de los numeros desglosados para esta variante concreta (FaDistillB, N6, 100k). No se inventan datos.

## Requisitos de hardware

- El tamano del repositorio (59.2 GB en safetensors) sugiere un modelo de varios miles de millones de parametros; se estima que se necesitan al menos 40-80 GB de VRAM para inferencia en FP16, dependiendo de la arquitectura exacta.
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o GPUs de gama alta con 48 GB+ (por ejemplo, RTX 6000 Ada). En una RTX 4090 (24 GB) podria ser posible con cuantizacion a 8 bits, pero no se ha confirmado compatibilidad.
- No se dispone de datos de latencia o throughput para este checkpoint concreto.
- Opciones de despliegue: no se han publicado instrucciones especificas, pero el framework DiT4DiT se basa en PyTorch y probablemente sea compatible con vLLM o TGI si se adapta a un servidor de inferencia; para uso local, llama.cpp no es aplicable al ser un modelo de videoaccion.

## Comparativa con modelos similares

No disponible. No se han encontrado checkpoints comparables publicados en el momento de la consulta. El framework DiT4DiT es relativamente nuevo y no se dispone de alternativas directas de la misma categoria (VAMs entrenados en RoboCasa) con datos publicos.

## Limitaciones y advertencias

- **Dominio limitado**: el modelo esta entrenado exclusivamente en escenarios de cocina de RoboCasa; no es generalizable a otros entornos sin reentrenamiento.
- **Solo inferencia**: el checkpoint no incluye estado de optimizacion, por lo que no puede continuarse el entrenamiento desde este punto.
- **Licencia no especificada**: no se indica licencia, lo que impide el uso comercial sin autorizacion explicita del autor.
- **Sin soporte de texto**: no es un modelo de lenguaje; no procesa instrucciones verbales ni genera respuestas textuales.
- **Dependencia de la simulacion**: las capacidades se han validado en simulacion; la transferencia a robots reales requiere un paso de adaptacion de dominio.
- **Riesgo de sobreajuste**: 100.000 pasos de entrenamiento en un dataset sintetico pueden provocar memorizacion de escenarios concretos del simulador.

## Enlaces

- [HuggingFace - wam-dit4dit-robocasa-kitchen-wan22-fadistillB-n6-reffix-g001-effgb32-100k](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillB-n6-reffix-g001-effgb32-100k)
- [HuggingFace - variante I2V](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-i2v-100k)
- [HuggingFace - variante V2V](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-v2v-100k)
- [GitHub - DiT4DiT (Mondo Robotics)](https://github.com/Mondo-Robotics/DiT4DiT)
- [Paper - DiT4DiT: Jointly Modeling Video Dynamics and Actions for Generalizable Robotic Manipulation](https://arxiv.org/html/2603.10448v1)
- [GitHub - RoboCasa](https://github.com/robocasa/robocasa)
