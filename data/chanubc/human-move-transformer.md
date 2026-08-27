# chanubc/human-move-transformer

## Resumen

El modelo `chanubc/human-move-transformer` es un Transformer de predicción de trayectorias de peatones, desarrollado por el autor chanubc para un simulador de seguridad de cocina robótica (robot-kitchen-safety-sim). El modelo observa 8 pasos temporales (3,2 segundos) y predice los siguientes 12 pasos (4,8 segundos), operando a una frecuencia de 2,5 Hz (0,4 segundos por paso). Está diseñado para generar múltiples modos de movimiento (multi-modal) y se evalúa con la métrica minADE@3, que mide el error medio de desplazamiento considerando la mejor de tres predicciones.

La arquitectura es un Transformer compacto con dimensión de modelo 64, 2 capas y 4 cabezas de atención, definido mediante la función `build_transformer_net`. El repositorio incluye dos conjuntos de pesos: `model.pt` (el modelo base) y `model_tuned.pt` (una variante ajustada mediante investigación automática). Los datos de entrenamiento son trayectorias sintéticas generadas por simulación (sim GT), no datos reales de movimiento humano. El modelo se distribuye bajo licencia MIT y está orientado a aplicaciones de robótica y seguridad, aunque su tamaño de repositorio es de 0,0 GB y no se especifica el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (build_transformer_net: h=64, layers=2, heads=4) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Observacion: 8 pasos (3,2 s); prediccion: 12 pasos (4,8 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de trayectorias, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt, model_tuned.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer estándar con dimensiones reducidas: embedding de 64 unidades, 2 capas de atención y 4 cabezas. Esta configuración es deliberadamente ligera, adecuada para inferencia en tiempo real dentro de un simulador de seguridad. La entrada consiste en una secuencia de 8 observaciones de posiciones (probablemente coordenadas x, y) y la salida es una secuencia de 12 posiciones futuras, generada de forma multi-modal para capturar la incertidumbre del movimiento humano.

El entrenamiento se realizó exclusivamente con trayectorias sintéticas procedentes de la simulación del entorno (sim GT), lo que implica que el modelo no ha visto datos reales de peatones. No se menciona el uso de técnicas como RLHF o DPO, ni se detalla el número de tokens o la composición del dataset. La variante `model_tuned.pt` sugiere un proceso de ajuste automático (autoresearch) sobre el modelo base, aunque no se especifican los hiperparámetros ni el procedimiento exacto.

## Capacidades

- Prediccion de trayectorias de peatones: genera 12 pasos futuros (4,8 s) a partir de 8 pasos observados (3,2 s).
- Salida multi-modal: produce multiples modos de movimiento (evaluados con minADE@3), lo que permite representar distintas rutas posibles.
- Integracion con simuladores: disenado para el simulador robot-kitchen-safety-sim, puede conectarse mediante la clase `LearnedPredictor` del proyecto `trajectory/learned_predictor.py`.
- Deteccion de riesgo: el rendimiento reportado incluye un recall de 0,73 para la entrada en el radio de parada, indicando capacidad para alertar sobre colisiones inminentes.
- Ligereza computacional: al ser un Transformer pequeno, es adecuado para inferencia en tiempo real en entornos simulados.

## Casos de uso

- Simulacion de seguridad en cocinas roboticas: el modelo predice el movimiento de personas en un entorno de cocina, permitiendo al robot anticipar trayectorias y evitar colisiones con un recall de 0,73 en la zona de parada.
- Planificacion de movimiento reactiva: integrado en un bucle de control, el robot puede replanificar su ruta en funcion de las predicciones a 4,8 segundos vista, reduciendo el riesgo de accidentes.
- Validacion de algoritmos de navegacion: usado como componente de un simulador, permite probar politicas de navegacion en escenarios con peatones sinteticos antes de desplegarlas en entornos reales.
- Generacion de datos sinteticos para entrenamiento: las trayectorias generadas por el modelo pueden servir para aumentar datasets de otros sistemas de prediccion o para probar metodos de aprendizaje por refuerzo.
- Investigacion en prediccion multi-modal: al ofrecer multiples modos de salida, sirve como referencia para estudiar tecnicas de modelado de incertidumbre en movimiento humano.
- Benchmarking de modelos de trayectorias: su arquitectura compacta y sus metricas publicadas (ADE, recall) lo convierten en un punto de comparacion para otros predictores en entornos simulados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre trayectorias de validacion (held-out) del simulador:

| Metrica | Valor |
|---|---|
| ADE a 1,6 s | ~0,12 m |
| ADE a 4,8 s | ~0,38 m |
| Recall de entrada en radio de parada | ~0,73 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los datos provienen exclusivamente de la model card del autor.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la informacion disponible.
- Dado el tamano reducido del modelo (h=64, layers=2, heads=4), es probable que pueda ejecutarse en CPU o en GPUs de gama baja, aunque no hay datos concretos.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.); el modelo se integra mediante el cargador `LearnedPredictor` del proyecto.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

Existe un modelo hermano del mismo autor, `chanubc/human-move-lstm`, que utiliza una arquitectura LSTM para la misma tarea de prediccion de trayectorias humanas. Sin embargo, no se dispone de detalles sobre sus parametros, contexto o rendimiento en la informacion proporcionada. No se han encontrado otros modelos comparables en la busqueda web.

| Modelo | Arquitectura | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| human-move-transformer | Transformer (h=64, 2 capas, 4 heads) | 8 obs -> 12 pred | ADE@4.8s ~0.38m, recall 0.73 | MIT |
| human-move-lstm | LSTM | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos (sim GT), por lo que el modelo puede no generalizar bien a trayectorias reales de peatones.
- No se ha evaluado el modelo en entornos fisicos reales; su uso esta pensado para simulacion.
- No se dispone de informacion sobre sesgos, pero al entrenarse con datos simulados podria heredar sesgos del simulador.
- El riesgo de alucinacion no aplica directamente, pero las predicciones pueden ser poco realistas en escenarios no vistos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chanubc/human-move-transformer
- Modelo relacionado (LSTM): https://huggingface.co/chanubc/human-move-lstm
- Paper sobre prediccion de movimiento humano con Transformer (no directamente relacionado): https://arxiv.org/html/2302.08274v3
