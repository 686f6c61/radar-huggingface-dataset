# Lucascui97/Sigma_0

## Resumen

Sigma_0 es una coleccion de 24 politicas de robotica para manipulacion, distribuidas como checkpoints de PyTorch y publicadas por el usuario Lucascui97. No es un modelo de lenguaje ni un modelo de proposito general: se trata de politicas de imitacion (imitation learning) entrenadas para seis tareas concretas del benchmark RoboTwin, organizadas en dos familias denominadas ACT-GAZER (basada en Action Chunking Transformer) y DP-GAZER-ATTN (basada en Diffusion Policy con atencion). El repositorio ocupa 26,9 GB e incluye tanto los pesos de inferencia como las configuraciones de entrenamiento exportadas.

La relevancia del lanzamiento esta en que agrupa en un unico paquete los 24 checkpoints resultantes de un pipeline de destilacion profesor-alumno con un objetivo de divergencia visual (visual KL). Concretamente, se entrenaron con teacher visual KL = 0 y student visual KL = 0,01, usando la semilla 0. Esto permite comparar de forma controlada el efecto del enmascarado de distracciones (condiciones Gray-mask frente a Clean) sobre el rendimiento en las seis tareas, algo util para investigacion en aprendizaje por imitacion y robustez visual.

El modelo se publica bajo licencia MIT, con 0 descargas y 1 like en el momento de redactar esta ficha. Es importante subrayar que los checkpoints no son cargables con `from_pretrained` de Transformers: requieren el codigo y las dependencias de la release asociada en `XPolicyLab`. La model card indica explicitamente que la subida no representa una nueva evaluacion en simulacion y que el despliegue en robots fisicos no ha sido validado por esta release.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) para la familia ACT-GAZER; Diffusion Policy con atencion (DP-GAZER-ATTN) para la familia DP. Ambas son politicas de imitacion, no modelos de lenguaje |
| Parametros totales | no disponible (no se indica el numero de parametros de las politicas) |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la condicion de entrada es observacion visual y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; las instrucciones de tarea son fijas por politica) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`); no se usan safetensors ni GGUF |
| Pipeline | robotics |
| Tamano del repositorio | 26,9 GB |
| Numero de politicas | 24 (4 familias de configuracion x 6 tareas) |
| Tareas soportadas | `click_bell`, `place_empty_cup`, `place_container_plate`, `beat_block_hammer`, `lift_pot`, `stack_bowls_two` |
| Checkpoints por familia | ACT-GAZER: `policy_best.ckpt`; DP-GAZER-ATTN: `600.ckpt` |

## Arquitectura y entrenamiento

La familia ACT-GAZER emplea Action Chunking Transformer, una politica que predice bloques de acciones (action chunks) a partir de observaciones visuales y del estado del robot. Segun la model card, ACT utiliza tres camaras, tiene 6000 epocas de entrenamiento configuradas y se selecciona el mejor checkpoint de validacion. La divergencia KL del latente de accion se configura de forma independiente a la divergencia visual. La familia DP-GAZER-ATTN emplea Diffusion Policy con atencion: parte de observaciones nativas de 240 x 320 de la camara de cabeza, redimensionadas a 480 x 640 por el encoder, y sus etapas de profesor y alumno se entrenaron durante 600 epocas.

El elemento metodologico central es el esquema profesor-alumno tipo destilacion con un termino de visual KL. Las politicas se entrenaron con teacher visual KL = 0 y student visual KL = 0,01, semilla 0. Las familias se diferencian ademas por la condicion visual: Gray-mask (enmascarado de distracciones, todas las camaras) y Clean (sin enmascarado). El DP-GAZER-ATTN solo se entrena con las condiciones Clean y Gray-mask. La model card no detalla la composicion del dataset ni el numero de demostraciones, y aclara que los checkpoints del profesor y los datasets de entrenamiento no estan incluidos en el repositorio, por lo que la reproducibilidad completa del pipeline de entrenamiento no es posible solo con esta subida.

## Capacidades

- Control de manipulacion robotica por imitacion: genera secuencias de acciones (action chunks) para el robot a partir de observaciones visuales y del estado de las articulaciones.
- Percepcion visual multi-camara en la rama ACT (tres camaras) y vison de camara de cabeza en la rama DP (resolucion nativa 240 x 320, ampliada a 480 x 640).
- Ejecucion de seis tareas concretas de manipulacion: pulsar una campana (`click_bell`), colocar una taza vacia (`place_empty_cup`), colocar un contenedor sobre un plato (`place_container_plate`), golpear un bloque con un martillo (`beat_block_hammer`), levantar una olla (`lift_pot`) y apilar dos cuencos (`stack_bowls_two`).
- Robustez a distracciones visuales mediante la condicion Gray-mask, que enmascara distracciones en las imagenes de las camaras.
- Destilacion de politicas: cada tarea dispone de variantes entrenadas bajo distintas condiciones de prior del profesor (Gray-mask o Clean).
- Inferencia con RGB y estado del robot: el uso normal del alumno se realiza con entradas RGB y el estado del robot, sin necesidad de las senales del profesor.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, soporte de agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por imitacion: comparar directamente el efecto de la condicion visual (Gray-mask frente a Clean) y de la familia de politica (ACT frente a DP con atencion) sobre las mismas seis tareas, gracias a que el repositorio agrupa las 24 politicas con la misma semilla y los mismos objetivos de KL.
- Evaluacion de robustez frente a distractores: la variante Gray-mask permite estudiar cuanto depende la politica de elementos distractores del fondo, entrenando el enmascarado de distracciones y comparando con la condicion Clean en `click_bell` o `lift_pot`.
- Punto de partida para destilacion propia: al incluir configuraciones de entrenamiento exportadas (`config.yaml`, `training_config.json`), las politicas sirven como inicializacion o referencia para reproducir el pipeline profesor-alumno en otras tareas de RoboTwin.
- Benchmark interno de politicas de manipulacion: usar los 24 checkpoints como linea base reproducible para comparar nuevas arquitecturas sobre las seis tareas, ajustando las rutas de dataset en las configuraciones.
- Desarrollo de pipelines de inferencia robotica: integrar los checkpoints en el codigo de `XPolicyLab` (`policy/ACT_GAZER/model.py` y `policy/DP/model.py`) para montar un bucle de control que consuma RGB y estado del robot en simulacion.
- Estudio de compresion y despliegue de Diffusion Policy: la rama DP-GAZER-ATTN, con su encoder de 480 x 640 y checkpoints de 600 epocas, es un banco de pruebas para analizar coste de inferencia de diffusion policies en simulacion antes de plantear hardware embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los checkpoints se han verificado contra su configuracion de entrenamiento almacenada, pero que esta subida no representa una nueva evaluacion en simulacion. No se proporcionan tasas de exito por tarea, ni metricas comparativas frente a otras politicas. Tampoco se incluyen medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se indica el numero de parametros ni el consumo de memoria de las politicas; el repositorio completo ocupa 26,9 GB, pero ese tamano incluye los 24 checkpoints y no corresponde a la memoria de un unico modelo en ejecucion.
- GPU recomendadas: no disponible. La model card no especifica hardware de entrenamiento ni de inferencia.
- Encaje en GPU de consumo: no disponible. Sin especificacion de parametros o VRAM no puede confirmarse si una politica cabe en una GPU de consumo como una RTX 4090.
- Opciones de despliegue: el unico camino documentado es el codigo de la release `Cuixxx/Sigma_0` (v1.0.0), en concreto las implementaciones `XPolicyLab/policy/ACT_GAZER/model.py` y `XPolicyLab/policy/DP/model.py`, sobre PyTorch. No se contempla vLLM, llama.cpp, Ollama ni TGI, ya que no son modelos de lenguaje.
- Detalle de carga relevante: en las ACT, cada directorio de experimento debe contener `policy_best.ckpt`, `dataset_stats.pkl` y `training_config.json`. En las DP, el adaptador de runtime elige por defecto el checkpoint numerico mas grande (`600.ckpt`) y los lanzadores esperan un alias `latest.ckpt`, que debe crearse manualmente con un enlace simbolico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de otras politicas sobre las mismas seis tareas de RoboTwin, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, las dos familias de este repositorio pueden contrastarse entre si (ACT-GAZER frente a DP-GAZER-ATTN) en terminos de arquitectura y regimen de entrenamiento, pero no se aportan metricas de exito para ninguna de ellas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes ni capacidades multilingues. Cualquier uso conversacional o de generacion de texto queda fuera de su alcance.
- Alcance muy restringido a seis tareas concretas de RoboTwin; no hay evidencia de generalizacion a otras tareas o entornos.
- Entrenado y validado en simulacion: la model card afirma explicitamente que el despliegue en robots fisicos no ha sido validado por esta release.
- Ausencia de benchmarks: no se publican tasas de exito ni comparativas, lo que dificulta juzgar la calidad real de las politicas.
- Reproducibilidad incompleta: los checkpoints del profesor y los datasets de entrenamiento no estan incluidos; la reanudacion completa del entrenamiento puede requerir los datos y recursos originales del profesor.
- Rutas de procedencia: las configuraciones de entrenamiento conservan rutas originales, por lo que es necesario actualizar las rutas de dataset y de salida para cada entorno.
- Comprobacion de integridad: debe usarse `manifest.json` (tamano de archivo y digest SHA-256) para verificar los checkpoints descargados.
- Compatibilidad: no son modelos cargables con `from_pretrained` de Transformers; requieren el codigo y las dependencias de la release asociada.
- Licencia MIT: permite uso comercial del contenido del repositorio, pero conviene revisar las licencias de las dependencias de `XPolicyLab` y de las implementaciones originales de ACT y Diffusion Policy antes de un uso productivo.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgo ni de comportamiento fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lucascui97/Sigma_0
- Codigo asociado (release v1.0.0, commit `e02e6325a87738491b2ca182bdd244da47ab162c`): https://github.com/Cuixxx/Sigma_0/tree/v1.0.0
