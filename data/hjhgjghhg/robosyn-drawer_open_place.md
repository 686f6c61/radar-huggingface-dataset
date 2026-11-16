# HJHGJGHHG/robosyn-drawer_open_place

## Resumen

`robosyn-drawer_open_place` es un checkpoint de política robótica específico de tarea, publicado por el usuario HJHGJGHHG como envío para las finales del RoboSynChallenge. No es un modelo de lenguaje ni un modelo fundacional de propósito general: es una política entrenada para una tarea concreta de manipulación (abrir un cajón y colocar un objeto) que combina percepción RGB inicial con planificación basada en plantillas y cinemática del robot.

El modelo predice la geometría de la tarea a partir de observaciones RGB iniciales y después ejecuta una plantilla de tarea predefinida usando la cinemática del robot. Esta aproximación híbrida (percepción aprendida + ejecución determinista por plantilla) es habitual en competiciones de robótica donde el objetivo es la robustez en un conjunto cerrado de tareas, más que la generalización a entornos arbitrarios.

Por su naturaleza, el modelo tiene un alcance muy limitado: está atado a la base de código oficial del reto, a un entorno de simulación concreto (RoboSynChallenge/EmbodiChain) y a una configuración de despliegue específica. Su relevancia es principalmente como artefacto reproducible de una competición, no como componente reutilizable en producción general. El repositorio ocupa 0,1 GB y el peso principal es `best.pt` en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de robótica; percepción RGB + planificación por plantilla y cinemática) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

La model card describe un enfoque de dos etapas: la política predice la geometría de la tarea a partir de observaciones RGB iniciales y, a continuación, ejecuta una plantilla de tarea utilizando la cinemática del robot. No se especifica la arquitectura de la red de percepción (tipo de backbone, número de capas, resolución de entrada) ni el volumen o composición de los datos de entrenamiento. Tampoco se documenta si hubo aprendizaje por refuerzo, imitación o ajuste supervisado, ni detalles sobre aumentación de datos o currículo de entrenamiento.

La información disponible indica que la arquitectura del modelo, el preprocesado, los activos estáticos y los puntos de entrada de la política están incluidos en el repositorio de código asociado, no en la model card. El checkpoint se distribuye con un SHA256 verificado (`cbc8b0fe...`) y está vinculado a una revisión inmutable de la base de código oficial (`45d9b9c4...`), lo que sugiere un énfasis en la reproducibilidad del envío de competición. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- Percepción RGB inicial: extrae información visual de la escena para estimar la geometría relevante de la tarea.
- Planificación por plantilla: genera una secuencia de acciones basada en una plantilla predefinida para la tarea `drawer_open_place`.
- Ejecución con cinemática del robot: traduce la plantilla en comandos compatibles con el entorno de simulación.
- Tarea única: abrir un cajón y colocar un objeto; no se documenta generalización a otras tareas.
- Entorno específico: diseñado para el simulador RoboSynChallenge/EmbodiChain.
- No se documenta soporte de tool calling, agentes multi-paso, razonamiento en lenguaje natural, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de resultados de competición: ejecutar `eval.sh` con la configuración y semilla documentadas (20 episodios, semilla 161803, 1000 pasos) para verificar el rendimiento del envío en el entorno oficial.
- Investigación en manipulación por plantillas: usar el checkpoint como línea base para comparar enfoques de percepción + plantilla frente a políticas puramente aprendidas en la misma tarea.
- Desarrollo de pipelines de evaluación: integrar el script de descarga con verificación de checksum como ejemplo de gestión reproducible de checkpoints en retos de robótica.
- Docencia en robótica de simulación: ilustrar el flujo completo de despliegue (descarga, configuración YAML, lanzador con GPU y setting) en un entorno controlado.
- Pruebas de infraestructura: validar el aprovisionamiento de GPUs y la configuración de `gpu_id`, `pytorch_device` y `setting` en el entorno EmbodiChain.
- Análisis de robustez: comparar el comportamiento en el setting `random` frente a `clear` para estudiar la sensibilidad a la inicialización de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del checkpoint (repo de 0,1 GB) sugiere un modelo pequeño, pero no se documenta el consumo en inferencia.
- GPU recomendadas: no disponible; el lanzador acepta un índice de GPU físico (`gpu_id`), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del repositorio hace plausible su ejecución en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: entorno oficial RoboSynChallenge/EmbodiChain mediante `eval.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles; la evaluación por defecto es de 20 episodios con 1000 pasos y semilla 161803.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables de la misma categoría (políticas específicas de tarea para el RoboSynChallenge) en la información consultada.

## Limitaciones y advertencias

- Alcance restringido a una única tarea (`drawer_open_place`) y a un único entorno de simulación; no es un modelo de propósito general.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido.
- Dependencia estricta de la base de código oficial y de la revisión `45d9b9c4...`; cambios en el entorno pueden romper la reproducibilidad.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser una política de control, el riesgo principal es el fallo de ejecución en escenas no representadas.
- Idioma limitado al inglés en la documentación y configuración.
- No se especifican requisitos de hardware ni métricas de rendimiento, lo que dificulta estimar costes de despliegue.
- El modelo parece orientado a evaluación en simulación; no hay evidencia de validación en robot físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HJHGJGHHG/robosyn-drawer_open_place
- Repositorio de código: https://github.com/HJHGJGHHG/robosyn-finals
- README de la política: https://github.com/HJHGJGHHG/robosyn-finals/blob/main/policy/README.md
- Configuración de despliegue: `policy/drawer_open_place/deploy_policy.yml` (incluida en el repositorio del modelo)
- Peso del modelo: `best.pt` (raíz del repositorio del modelo)
