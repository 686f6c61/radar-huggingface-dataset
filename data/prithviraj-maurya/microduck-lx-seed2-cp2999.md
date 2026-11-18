# prithviraj-maurya/microduck-lx-seed2-cp2999

## Resumen

`microduck-lx-seed2-cp2999` es una política de control entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un controlador neuronal que mapea observaciones proprioceptivas y de estado del robot (61 dimensiones) a comandos de actuación (14 acciones) a una frecuencia de 50 Hz. El autor, `prithviraj-maurya`, lo publica como checkpoint del paso 2999 de un entrenamiento con semilla 2 dentro de la tarea `Mjlab-Sprint2m-MicroDuck`.

La política es de tipo "perpetuo": una vez cargada en una ranura de política del demonio `robotctl`, ejecuta una marcha continua hasta que se le indique lo contrario. El entrenamiento se realizó con 4096 entornos paralelos, un máximo de 3000 iteraciones y una recompensa basada en velocidad de avance por carril, seguimiento unilateral y un término de suavidad acotado a -0.3, según la receta del registro de experimentos público de `heyskylark`.

El interés del artefacto es acotado pero concreto: sirve como ejemplo reproducible de un pipeline de RL para robótica con simulación masiva (mjlab), exportación a ONNX con normalizador de observaciones embebido y despliegue directo en hardware mediante un manifiesto de política versionado. El repositorio es de 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Algoritmo de entrenamiento | PPO |
| Checkpoint | paso 2999, semilla 2 |
| Entornos paralelos | 4096 |
| Iteraciones maximas | 3000 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación ni tipo de codificador). Lo que sí se documenta es el pipeline completo: la política se entrena con PPO sobre la tarea `Mjlab-Sprint2m-MicroDuck` usando el framework mjlab en su versión 0.1.0 (commit `8d0dbc94c`), con 4096 entornos simulados en paralelo, hasta 3000 iteraciones y semilla 2. El commit de entrenamiento es `a2041288f` del repositorio `microduck-challenges`.

La función de recompensa combina tres componentes según la model card: recompensa de velocidad por carril, seguimiento unilateral y un término de suavidad con cota de -0.3, receta tomada del registro de experimentos público de `heyskylark`. El resultado es una marcha perpetua orientada a desplazamiento sostenido. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor continuo del robot microduck a 50 Hz con 61 entradas de observación y 14 salidas de acción.
- Marcha perpetua: la política se ejecuta de forma indefinida hasta que el operador la descarga de la ranura.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el demonio.
- Despliegue directo en hardware mediante `robotctl policy load <slot> prithviraj-maurya/microduck-lx-seed2-cp2999`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- Reproducibilidad del pipeline de entrenamiento documentada paso a paso.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo fundacional.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como línea base reproducible para comparar recetas de recompensa (velocidad por carril, seguimiento unilateral, suavidad) sobre el mismo robot y framework.
- Docencia y formación en RL aplicado a robótica: el pipeline documentado (clonar, `uv sync`, `uv run train` con parámetros explícitos) permite que estudiantes reproduzcan un entrenamiento completo de PPO con 4096 entornos.
- Pruebas de integración del demonio `robotctl`: al ajustarse al esquema 2 del manifiesto, es útil para validar el flujo de carga de políticas en ranuras y la alimentación de observaciones en crudo.
- Benchmarking de simulación a realidad: permite medir la brecha entre la marcha simulada y el comportamiento en el microduck físico con una política concreta y conocida.
- Experimentación con exportación ONNX: el normalizador embebido lo convierte en un ejemplo práctico de empaquetado autocontenido de políticas para inferencia en el borde.
- Comparación de semillas y checkpoints: al estar etiquetado con semilla 2 y paso 2999, facilita estudios de variabilidad entre ejecuciones de entrenamiento no deterministas.
- Base para ajuste fino o destilación: puede servir como punto de partida para entrenar variantes con otras recompensas o para destilar la política en controladores más ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa final, velocidad alcanzada, tasa de caídas ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se especifica el tamaño del grafo ONNX.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento documentado emplea 4096 entornos paralelos, lo que en la práctica exige GPU de datacenter (A100, H100 o similares), aunque el autor no indica el hardware utilizado.
- Compatibilidad con GPU de consumo: no confirmada; una política de 61 a 14 dimensiones es presumiblemente ligera y podría ejecutarse en CPU, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime mediante el demonio `robotctl` del ecosistema microduck; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo autor ni referencias cuantitativas a políticas comparables para el microduck. El único punto de contacto mencionado es el registro de experimentos público de `heyskylark`, del que se toma la receta de recompensa, pero no se aportan sus resultados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no debe evaluarse con métricas tipo MMLU o HumanEval.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de métricas de rendimiento: no se documenta velocidad alcanzada, estabilidad, tasa de caídas ni robustez ante perturbaciones, lo que impide evaluar su calidad frente a otras políticas.
- Entrenamiento no bit-reproducible: el propio autor advierte que repetir el pipeline genera pesos distintos, lo que limita la auditoría exacta del artefacto.
- Sesgos y alucinaciones: no aplican en el sentido habitual, pero la política puede presentar comportamientos no deseados (deriva, oscilación, fallo ante terrenos no vistos) sin que se documenten.
- Dependencia del simulador: el comportamiento está condicionado por la fidelidad de mjlab y por la receta de recompensa; la transferencia al robot físico no está validada en la información disponible.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso o validación por terceros.
- Sin información sobre idiomas ni contexto: irrelevante para su función, pero conviene no confundirlo con un modelo fundacional al interpretar los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithviraj-maurya/microduck-lx-seed2-cp2999
- Repositorio de entrenamiento: https://github.com/prithviraj-maurya/microduck-challenges.git (commit `a2041288f`, rama `main`)
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck (no se proporciona URL directa)
