# anonymous89793/ConfAL-WM

## Resumen

ConfAL-WM (Confidence-Guided Active Learning for Action-Conditioned World Models) es un conjunto de checkpoints de pesos para un modelo de mundo (world model) orientado a robótica, desarrollado por el autor anónimo `anonymous89793`. El modelo aborda el problema de la selección eficiente de datos para el entrenamiento de world models mediante un enfoque de aprendizaje activo guiado por estimaciones de confianza. Incluye un módulo de sonda de confianza (C3) que opera a nivel de frame y de parche, permitiendo ponderar dinámicamente las muestras durante el entrenamiento.

El repositorio contiene siete artefactos: cinco checkpoints del modelo EVAC (warmup y variantes con diferentes estrategias de ponderación), dos sondas de confianza entrenadas en los dominios RoboTwin2.0 y AgiBot World, y un detector YOLO para evaluación de métricas de pinza/trayectoria. Los archivos están en formato PyTorch-Lightning (`.ckpt`) y state dicts de PyTorch (`.pt`). El tamaño total del repositorio es de 37,5 GB. No se especifica la arquitectura interna ni el número de parámetros, pero por su naturaleza se trata de un modelo de mundo condicionado por acciones, probablemente basado en redes neuronales profundas recurrentes o transformadores.

La relevancia de ConfAL-WM radica en su enfoque de aprendizaje activo con estimación de confianza, que promete reducir el coste de anotación y mejorar la eficiencia en el entrenamiento de modelos de mundo para manipulación robótica. Al ser una submission anónima (probablemente en revisión), aún no hay publicaciones ni benchmarks públicos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (world model condicionado por acciones, con módulo de confianza C3) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos completos en precisión flotante) |
| Idiomas soportados | No disponible (modelo de visión/robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch-Lightning (`.ckpt`) y PyTorch state dict (`.pt`); detector YOLO en formato Ultralytics |

## Arquitectura y entrenamiento

La documentación disponible no detalla la arquitectura interna de ConfAL-WM. Se sabe que el modelo principal es un world model condicionado por acciones (action-conditioned), denominado EVAC, que se entrena en el dominio RoboTwin2.0 y se adapta a AgiBot World. El proceso de entrenamiento sigue un esquema de aprendizaje activo: primero se entrena un warmup (EVAC warmup v1, epoch 10 / step 2000), luego se usan sondas de confianza (C3) para puntuar la incertidumbre de las predicciones a nivel de frame y de parche, y finalmente se reentrena el modelo con diferentes estrategias de ponderación (sin ponderación, ponderación por frame, ponderación frame+patch). Los checkpoints EVAC-v2 se entrenan hasta epoch 8 / step 4000.

Las sondas de confianza toman como entrada las features del decoder del modelo EVAC (embeddings h_dec) y producen mapas de confianza por frame y por parche. Se proporcionan dos sondas: una entrenada en RoboTwin2.0 y otra en AgiBot World. El detector YOLO (RoboTwin2.0) se utiliza para extraer métricas de evaluación tipo EWMBench, detectando las pinzas izquierda/derecha del robot.

No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El proceso de entrenamiento parece ser supervisado, con datos de robótica simulada o real.

## Capacidades

- Predicción de estados futuros en entornos robóticos (world model condicionado por acciones).
- Estimación de confianza por frame y por parche mediante la sonda C3, útil para detectar regiones de alta incertidumbre.
- Aprendizaje activo: el modelo puede seleccionar las muestras más informativas para reentrenamiento.
- Evaluación de trayectorias de pinza mediante el detector YOLO integrado.
- Adaptación a múltiples dominios robóticos (RoboTwin2.0 y AgiBot World).
- No se especifican capacidades de lenguaje, visión general ni tool calling.

## Casos de uso

- Entrenamiento eficiente de world models en robótica: ConfAL-WM permite reducir el número de episodios necesarios para aprender dinámicas del entorno mediante la selección activa de datos basada en confianza, lo que es crítico cuando la recolección de datos físicos es costosa.
- Predicción de estados en manipulación robótica: el modelo puede anticipar la evolución de la escena (posición de objetos, pinzas) dadas acciones del robot, útil para planificación de movimientos.
- Detección de incertidumbre en simulaciones: la sonda de confianza identifica frames o regiones donde el modelo no está seguro, permitiendo priorizar la recolección de datos adicionales en esas zonas.
- Evaluación de políticas robóticas: el detector YOLO integrado permite medir métricas de éxito de agarre y trayectoria en benchmarks tipo EWMBench.
- Investigación en aprendizaje activo: sirve como referencia para estudiar estrategias de ponderación (frame vs frame+patch) en modelos de mundo.
- Transferencia entre dominios: los checkpoints adaptados a RoboTwin2.0 y AgiBot World permiten comparar el comportamiento del modelo en distintos entornos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen tablas de evaluación en el repositorio de dataset asociado (`anonymous89793/ConfAL-WM-Dataset`), pero no se incluyen valores numéricos en esta documentación.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información proporcionada.
- El tamaño total del repositorio es de 37,5 GB, lo que sugiere que los checkpoints individuales pueden ocupar varios GB cada uno (probablemente entre 1 y 8 GB por archivo, dependiendo de la precisión y el tamaño del modelo).
- Dado que son pesos en formato PyTorch, la inferencia requiere un entorno con PyTorch y PyTorch-Lightning instalados. Para el detector YOLO se necesita la librería Ultralytics.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Se recomienda una GPU con al menos 16 GB de VRAM para cargar los checkpoints más grandes, aunque no hay confirmación oficial.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada ni en la búsqueda web. Al ser un world model específico para robótica con aprendizaje activo, no hay referencias directas en el ecosistema de modelos de lenguaje o visión convencionales.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo, ya que no se detalla la composición de los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de mundo, puede predecir estados irreales si los datos de entrenamiento no cubren ciertos escenarios; la sonda de confianza ayuda a mitigarlo, pero no lo elimina.
- Limitaciones de contexto: no se especifica la longitud de contexto temporal (número de frames) que el modelo puede procesar.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero al ser una submission anónima, no hay garantía de soporte ni mantenimiento.
- Los checkpoints están diseñados para un código específico (el de la release del paper); no son directamente utilizables sin la definición del modelo en el código fuente, que no se incluye en este repositorio.
- La anonimización solo afecta a metadatos y rutas; los tensores no han sido modificados, pero no se garantiza que no contengan información sensible embebida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anonymous89793/ConfAL-WM
- Repositorio de dataset asociado: `anonymous89793/ConfAL-WM-Dataset` (no se proporciona URL directa en la información disponible)
- No se han encontrado papers, blogs o demos públicos en la búsqueda web.
