# joshuajerin/hackathon-everest-policies

## Resumen

El modelo `joshuajerin/hackathon-everest-policies` es un conjunto de artefactos de investigación para el control de locomoción de un robot Unitree G1 equipado con crampones, desarrollado en el contexto de un hackathon. Incluye una política supervisora con estimador de terreno visible, exportada en formato PyTorch y TorchScript, junto con un estimador de terreno reducido en formato joblib. Todo el proyecto se basa en datos sintéticos de simulación y no está destinado a despliegue en hardware real.

El modelo aborda el problema de la fusión de sensores y la estimación de terreno para la locomoción bípeda en entornos extremos, como la escalada en hielo. Su relevancia radica en ser un ejemplo de aplicación de técnicas de aprendizaje por refuerzo y reducción de orden a la robótica de campo, aunque con limitaciones importantes al ser artefactos de simulación sin validación en entornos reales.

La arquitectura exacta no está documentada, pero se sabe que la política combinada recibe una entrada de paquetes de sensores con un ABI bilateral de 19 canales, y que el estimador de terreno es un modelo reducido entrenado sobre campos de terreno sintéticos. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de pequeñas dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control para locomocion con estimador de terreno; no se especifica la arquitectura interna (p. ej., transformer, MLP) en la documentacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), TorchScript (.pt), joblib (.joblib) |

## Arquitectura y entrenamiento

La documentacion disponible no detalla la arquitectura interna del modelo. Se sabe que la politica combinada (visible_policy_jit.pt) toma como entrada una tupla de tensores: `(packet_history, valid_mask, sample_age_s, deployable_context, deployable_command_gait_context)`. Los tres primeros tensores preservan un ABI bilateral de 19 canales con forma `[B, T, 2, 19]`, lo que sugiere una arquitectura que procesa secuencias temporales de datos de sensores (posiblemente una red recurrente o convolucional temporal, aunque no se confirma).

El entrenamiento se realizo sobre datos sinteticos de simulacion, incluyendo campos de terreno generados artificialmente. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ya que no es un modelo de lenguaje. El estimador de terreno (`terrain_estimator.joblib`) es un modelo de orden reducido entrenado para estimar propiedades del terreno a partir de los sensores. No se proporcionan detalles sobre el numero de parametros, el volumen de datos de entrenamiento ni las tecnicas de optimizacion empleadas.

## Capacidades

- Control de locomocion para robot bípedo Unitree G1, con soporte para comandos de marcha (gait) y contexto desplegable.
- Estimacion de terreno a partir de datos de sensores, mediante un modelo reducido entrenado en campos sinteticos.
- Fusion de sensores bilateral (19 canales por lado), procesando historial de paquetes con mascara de validez y antiguedad de muestras.
- Exportacion en TorchScript para inferencia en entornos de produccion o integracion con otros frameworks.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, al ser un modelo de robotica.

## Casos de uso

- Investigacion en locomocion robotica: el modelo puede utilizarse en entornos de simulacion para estudiar estrategias de control de un robot bípedo con crampones en terrenos irregulares, gracias a su estimador de terreno y politica supervisora.
- Desarrollo de controladores para robotica de campo: los artefactos TorchScript permiten integrar la politica en pipelines de simulacion o en prototipos de software, aunque no estan validados para hardware real.
- Evaluacion de tecnicas de reduccion de orden: el estimador de terreno joblib sirve como ejemplo de modelo comprimido para estimacion de estado, util para comparar con enfoques de mayor complejidad.
- Generacion de datos sinteticos para entrenamiento: los scripts y manifiestos del repositorio pueden reutilizarse para crear nuevos conjuntos de datos de terreno y sensores.
- Benchmarking de politicas de control: los archivos `metrics.json` y `benchmark.json` proporcionan un marco para evaluar el rendimiento en pruebas selladas, aunque los valores no se incluyen en la documentacion.
- Educacion en robotica y aprendizaje por refuerzo: el proyecto puede servir como material didactico para entender la integracion de estimadores de estado y politicas de control en sistemas roboticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de archivos `metrics.json` y `benchmark.json` con metricas de pruebas selladas, pero no se proporcionan los valores numericos. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la documentacion.
- El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo de pequenas dimensiones que probablemente quepa en GPUs de consumo (p. ej., RTX 3060 o superiores), pero no hay confirmacion oficial.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI, etc.), ya que no es un modelo de lenguaje. Para inferencia en robotica, se podria usar PyTorch o TorchScript en CPU o GPU.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de control para robotica con estimacion de terreno). La documentacion no menciona alternativas ni benchmarks comparativos.

## Limitaciones y advertencias

- Los resultados son artefactos de simulacion sintetica, no validados para despliegue en hardware real. No deben usarse para controlar un robot sin validacion independiente, sistemas de seguridad y revision experta.
- Los priors sinteticos no estan calibrados con datos de campo (p. ej., SnowMicroPen o radar), por lo que las estimaciones de terreno pueden no ser fiables en entornos reales.
- Las salidas de incertidumbre son aproximadas y no constituyen probabilidades certificadas.
- La validacion se limita a la reproduccion bilateral y a la politica supervisora; no se ha realizado una validacion de locomocion de cuerpo completo del Unitree G1.
- No se ha realizado ninguna validacion de seguridad de hardware, actuadores, temporizacion, perdida de paquetes, condiciones termicas ni parada de emergencia.
- La licencia MIT permite uso comercial, pero el modelo no esta listo para produccion y carece de garantias.

## Enlaces

- HuggingFace: https://huggingface.co/joshuajerin/hackathon-everest-policies
- Repositorio de codigo fuente: https://github.com/joshuajerin/hackathon-everest
