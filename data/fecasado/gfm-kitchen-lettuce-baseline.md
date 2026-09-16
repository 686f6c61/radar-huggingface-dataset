# fecasado/gfm-kitchen-lettuce-baseline

## Resumen

`fecasado/gfm-kitchen-lettuce-baseline` es una política robótica de imitación (imitation learning) publicada en Hugging Face por el usuario fecasado, entrenada y exportada con la librería LeRobot de Hugging Face. El propio autor la etiqueta como `gaze_flow_matching` y `robotics`, y la asocia al dataset `fecasado/lettuce-to-plate-320x240`, lo que sitúa su dominio de aplicación en tareas de manipulación de cocina (trasvase de lechuga a un plato) capturadas a resolución 320x240.

El modelo tiene 75.218.394 parámetros reales (según los pesos en safetensors) y ocupa 0,3 GB en el repositorio, lo que lo coloca en la gama de políticas ligeras capaces de ejecutarse en hardware de consumo. La arquitectura declarada combina flow matching con condicionamiento por mirada (`gaze`), una línea de trabajo que busca mejorar la precisión en tareas de manipulación fina usando la dirección de la mirada como señal auxiliar, aunque la model card no detalla el diseño interno ni los datos de entrenamiento.

Su relevancia es acotada pero clara para la comunidad de robótica open source: se trata de un baseline reproducible dentro del ecosistema LeRobot, con licencia Apache 2.0 y pesos abiertos, pensado como punto de partida para experimentos de aprendizaje por imitación con condicionamiento de mirada. El repositorio no registra descargas ni likes en el momento de la consulta y su model card conserva texto de plantilla sin rellenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de robótica `gaze_flow_matching` (flow matching con condicionamiento por mirada); no se detalla la topología interna |
| Parametros totales | 75.218.394 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de control; no se documenta ventana de observación ni horizonte de predicción) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/lettuce-to-plate-320x240 |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. La model card declara `model_name: gaze_flow_matching` y la etiqueta `gaze_flow_matching`, lo que indica una politica generativa basada en flow matching (familia de modelos de difusion continua que aprenden un campo de velocidad entre una distribucion de ruido y la distribucion de acciones) en la que la senal de mirada actua como condicionamiento adicional. No se especifica el backbone visual, el tipo de encoder de acciones, el numero de pasos de integracion ni el horizonte de prediccion de la politica.

Respecto al entrenamiento, la unica informacion fiable es el dataset asociado, `fecasado/lettuce-to-plate-320x240`, orientado a una tarea de cocina con imagenes de 320x240, y el hecho de que el modelo se entreno con LeRobot (la model card remite a la guia de entrenamiento de LeRobot). No se documentan el numero de episodios, el numero de tokens ni de muestras, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste posterior. Tampoco se describen innovaciones tecnicas mas alla del propio condicionamiento por mirada que sugiere el nombre del modelo. El comando de entrenamiento incluido en la model card (`--policy.type=act`) es texto de plantilla generico y no necesariamente refleja la politica realmente entrenada.

## Capacidades

- Control robótico por imitación: genera acciones motoras a partir de observaciones visuales para tareas de manipulación (el dataset asociado apunta a trasvase de lechuga a un plato).
- Condicionamiento por mirada: el nombre del modelo sugiere que integra información de gaze como señal de entrada o de entrenamiento, si bien la model card no lo detalla.
- Ejecución en bucle cerrado: formato de política compatible con el flujo `lerobot-record` para despliegue sobre un robot real.
- Integración con el ecosistema LeRobot: carga y evaluación mediante `--policy.path` apuntando al checkpoint local o del Hub.
- Entrenamiento desde cero o fine-tuning: la model card documenta el flujo `lerobot-train` con registro opcional en Weights & Biases.
- Generación de texto, razonamiento, código, matemáticas, visión generalista, tool calling, capacidades de agente y multilingüismo: no disponibles; no es un modelo de lenguaje ni un VLM de propósito general.

## Casos de uso

- Manipulación de cocina en robot real: usar la política para ejecutar la tarea de trasvase de lechuga a un plato sobre un brazo tipo SO-100 u otro soportado por LeRobot, aprovechando que el modelo se entrenó específicamente sobre ese dominio a 320x240.
- Baseline de comparación en investigación: servir como punto de referencia reproducible para medir si el condicionamiento por mirada aporta mejoras frente a políticas de imitación sin gaze en la misma tarea y dataset.
- Recolección de datos con `lerobot-record`: desplegar la política para generar episodios de evaluación (prefijo `eval_` en el repositorio del dataset) que después se reutilicen para aumentar el conjunto de entrenamiento.
- Fine-tuning sobre dominios cercanos: partir de estos pesos para adaptar la política a tareas de manipulación similares (otras transferencias de objetos entre recipientes) con pocos episodios adicionales.
- Prototipado en robótica de bajo coste: al tener 75,2 M de parámetros y 0,3 GB, permite iterar en estaciones de trabajo con una única GPU de consumo o incluso en CPU para pruebas de latencia.
- Docencia y experimentación en aprendizaje por imitación: el flujo completo (dataset público, script de entrenamiento y de evaluación, licencia Apache 2.0) lo hace adecuado para cursos y talleres sobre políticas visomotoras.
- Evaluación de robustez ante variaciones de iluminación o colocación de objetos en el escenario de cocina, reutilizando el mismo pipeline de evaluación de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de posición ni comparaciones cuantitativas, y la búsqueda web realizada no devolvió ninguna fuente relevante (los resultados obtenidos correspondían a servicios de traducción, sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del número de parámetros, no publicada por el autor): en fp32, aproximadamente 0,30 GB solo de pesos; en fp16/bf16, alrededor de 0,15 GB; en int8, en torno a 0,08 GB. Hay que sumar activaciones y el encoder visual, por lo que el consumo real será superior y depende de la resolución de entrada (320x240) y del tamaño del lote.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una NVIDIA RTX 3060, RTX 4060 o superior es un objetivo razonable para ejecución en tiempo real.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño de 75,2 M de parámetros. También es viable ejecutar la inferencia en CPU para pruebas, aunque la latencia de control puede no ser suficiente para un bucle cerrado fluido.
- Opciones de despliegue: LeRobot es la vía documentada (`lerobot-train` para entrenamiento y `lerobot-record` con `--policy.path` para evaluación/inferencia). La model card no menciona vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política robótica.
- Robot de referencia: el ejemplo genérico de la model card emplea `--robot.type=so100_follower`, pero se trata de texto de plantilla y no confirma el hardware real usado por el autor.
- Latencia y throughput: no disponibles. No se publican medidas de frecuencia de control ni de tiempo de inferencia por paso.

## Comparativa con modelos similares

La informacion disponible no permite una comparacion cuantitativa fiable. Se incluyen alternativas del mismo ecosistema a modo orientativo, marcando como "no disponible" todo dato no confirmado.

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-lettuce-baseline | 75.218.394 | Manipulacion de cocina (lechuga a plato), 320x240 | apache-2.0 | Pesos en el Hub (0 descargas) | Politica `gaze_flow_matching` con LeRobot |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | Manipulacion visomotora; politica por defecto del flujo `lerobot-train` | no disponible | Implementada en LeRobot | Alternativa estandar para comparar en la misma tarea |
| Diffusion Policy | no disponible | Manipulacion visomotora con acciones generadas por difusion | no disponible | Implementaciones open source en el ecosistema LeRobot | Referencia metodologica cercana al flow matching |
| Modelos VLA generalistas (por ejemplo SmolVLA, pi0) | no disponible | Manipulacion guiada por lenguaje e imagenes | no disponible | Pesos abiertos en el Hub, segun cada proyecto | Mayor alcance, pero tamano y requisitos muy superiores |

## Limitaciones y advertencias

- Model card incompleta: conserva texto de plantilla ("_Model type not recognized — please update this template._") y no describe arquitectura, datos ni metricas.
- Sesgos: no evaluados ni documentados. Al entrenarse sobre un unico dataset de cocina, la politica heredara los sesgos de ese conjunto (posiciones, iluminacion, utillaje y estilo de demostracion concretos).
- Riesgo de fallo fuera de distribucion: sin informacion sobre la variabilidad del dataset, se desconoce la robustez ante objetos, fondos o condiciones de luz distintos de los de `lettuce-to-plate-320x240`.
- Ausencia de benchmarks: no hay tasa de exito publicada, por lo que no es posible estimar su rendimiento real en produccion.
- Idiomas: no aplica; no es un modelo linguistico. No hay capacidades de texto, codigo ni razonamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; conviene verificar la licencia del dataset asociado, que puede ser distinta.
- Trazabilidad: el comando de entrenamiento de la model card es plantilla generica (`--policy.type=act`) y no coincide necesariamente con la politica declarada, lo que dificulta reproducir el entrenamiento.
- Madurez: 0 descargas y 0 likes, sin validacion por parte de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia previa.
- Despliegue en robot real: cualquier uso sobre hardware fisico implica riesgos de seguridad; se requiere un entorno controlado y limites de par/velocidad en el controlador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-lettuce-baseline
- Dataset asociado: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor: https://huggingface.co/fecasado
- Nota sobre la busqueda web: los resultados obtenidos correspondian a servicios de traduccion (Google Translate, DeepL, Translator.eu) y no guardan relacion con el modelo; no se han localizado papers, blogs ni demos adicionales.
