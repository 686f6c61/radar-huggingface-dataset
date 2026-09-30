# dsaddsaf/pi0.5-kppXFPDgR7Tj

## Resumen

π0.5-kppXFPDgR7Tj es un checkpoint de robótica del modelo Vision-Language-Action (VLA) π0.5 de Physical Intelligence, publicado por el usuario dsaddsaf como un ajuste fino completo para la temporada de simulación AXIS v2.0. El modelo base declarado es `deepmaster/pi0.5-s8bNBi2ZQghb`, campeón de la AXIS v1.0, y este ajuste se entrena sobre trayectorias de la propia simulación AXIS v2.0 para resolver 30 tareas de manipulación en MuJoCo con un brazo Franka Panda.

π0.5 pertenece a la familia de modelos openpi de Physical Intelligence y se construye sobre π0, un modelo basado en flow matching que combina un backbone visión-lenguaje (heredero de PaliGemma) con un experto de acción. Su objetivo es la generalización en mundo abierto: ejecutar tareas robóticas fuera del laboratorio mediante co-entrenamiento con datos heterogéneos (demostraciones de robot, datos web y subtareas semánticas). Este checkpoint concreto no es el modelo generalista, sino una especialización de competición: comparte arquitectura, tokenizador, horizonte de acción y estadísticas de normalización con su padre, y solo cambia los pesos ajustados a las tareas AXIS v2.0.

Es relevante porque ilustra el flujo de trabajo de ajuste fino de un VLA de código abierto sobre un benchmark de simulación reproducible, con un resultado medido por el evaluador oficial (0,6883 frente a 0,0733 de una línea base). Sin embargo, hay que tratarlo como un artefacto de competición con muy poca trazabilidad: cero descargas, cero likes y una model card muy breve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flow matching; backbone visión-lenguaje tipo PaliGemma más experto de acción |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX/openpi en precision original; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (heredado del backbone; las instrucciones de tarea de AXIS se definen en el entorno de simulacion) |
| Licencia | Gemma Terms of Use (el modelo base deriva de openpi π0.5, Apache-2.0, y de PaliGemma, Gemma Terms of Use) |
| Formato de pesos | checkpoint JAX/openpi (no safetensors ni GGUF convencional); tamano del repo 12,4 GB |

## Arquitectura y entrenamiento

π0.5 es un modelo Vision-Language-Action de flow matching, no un LLM de texto. Combina un backbone visión-lenguaje (procedente del linaje PaliGemma) con un experto de acción que genera trayectorias continuas de control mediante un campo de flujo. El modelo consume observaciones visuales (vista frontal y, en tareas con cámara de muñeca, vista de muñeca) junto con una instrucción de tarea en lenguaje natural, y produce una secuencia de acciones de horizonte fijo. El modelo card indica explícitamente que arquitectura, tokenizador, horizonte de acción, estadísticas de normalización y el muestreador del evaluador son idénticos a los de su modelo padre.

El entrenamiento de este checkpoint concreto es un ajuste fino completo (full fine-tune) del padre `deepmaster/pi0.5-s8bNBi2ZQghb` con la herramienta openpi, sobre rollouts de simulación de AXIS v2.0, usando las definiciones públicas de tareas de la temporada y el runtime oficial de AXIS. Las estadísticas de normalización son idénticas byte a byte a las del padre. El modelo base π0.5, según la documentación pública de Physical Intelligence, se co-entrena con datos heterogéneos: demostraciones de robot, datos web y subtareas semánticas, lo que le aporta generalización en mundo abierto. No se detalla en la información proporcionada el número de tokens, la composición exacta del dataset de ajuste ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de control para un brazo Franka Panda en 30 tareas de simulación MuJoCo de la temporada AXIS v2.0.
- Entrada multimodal: procesa imágenes (vista frontal y vista de muñeca cuando la tarea lo requiere) junto con instrucciones de tarea en lenguaje natural.
- Generalización en mundo abierto: hereda del π0.5 base la capacidad de abordar tareas no vistas fuera del laboratorio mediante co-entrenamiento heterogéneo.
- Ejecución de horizonte largo: el diseño de π0.5 apunta a manipulación de horizonte largo mediante subtareas semánticas.
- Control por articulaciones: la configuración de evaluación (`pi05_axis_joint`) indica control en espacio de posiciones articulares.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible como funcionalidad de software; el modelo ejecuta políticas robóticas, no flujos de agente genéricos.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible (no se documentan modo de pensamiento, audio ni visión general más allá de las vistas de cámara de la tarea).

## Casos de uso

- Investigación en manipulación robótica: sirve como punto de partida reproducible para estudiar cómo un VLA generalista se especializa en un conjunto cerrado de tareas de simulación mediante ajuste fino completo.
- Benchmarking de VLA en simulación: al compartir arquitectura y estadísticas de normalización con su padre, permite comparar el efecto del ajuste fino aislado frente al modelo base en el mismo evaluador.
- Evaluación de políticas en MuJoCo: útil para reproducir la puntuación del evaluador oficial `libero_eval/run_eval.py --benchmark axis_v2.0` sobre 30 tareas × 20 ensayos.
- Control de brazo Franka Panda en simulación: el modelo está configurado para control por articulaciones, lo que facilita integrarlo en entornos de simulación que exponen posiciones de junta.
- Punto de partida para nuevos ajustes: al ser un checkpoint completo de openpi (JAX), puede reutilizarse como inicialización para temporadas posteriores de la competición AXIS.
- Estudio de brechas sim-to-real: sirve como base para experimentos que intenten transferir políticas entrenadas en MuJoCo a hardware real, siempre que se validen las diferencias de dominio.
- Docencia en robótica e IA: ejemplo práctico de flujo de trabajo openpi para ilustrar cómo se entrena, evalúa y puntúa un VLA en una competición.

## Benchmarks y rendimiento

El único resultado publicado en la información proporcionada corresponde al evaluador oficial de AXIS v2.0 (`libero_eval/run_eval.py --benchmark axis_v2.0`, 30 tareas × 20 ensayos = 600 episodios):

| Modelo | Puntuacion (AXIS v2.0) |
|---|---|
| Este modelo (π0.5-kppXFPDgR7Tj) | 0,6883 (413/600) |
| Línea base Fisher-Wang/pi05-axis-v0.2-all30-74p67 (tabla pública) | 0,0733 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de control robótico y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 12,4 GB, por lo que se necesita al menos una GPU con memoria suficiente para cargar el checkpoint completo más el estado del optimizador si se reentrena.
- GPU recomendadas: no especificadas por el autor; para un VLA de este tamano se recomienda hardware de centro de datos tipo A100 o H100 para entrenamiento y evaluación, y GPUs de gama alta con abundante VRAM para inferencia.
- ¿Cabe en GPU de consumo?: no disponible; depende del recuento real de parámetros, que no se detalla.
- Opciones de despliegue: el autor indica explícitamente openpi (JAX) con el entorno oficial de AXIS y el evaluador `libero_eval/run_eval.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de checkpoint VLA de forma directa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5-kppXFPDgR7Tj (este) | VLA flow matching (linaje π0.5) | no disponible; horizonte igual al del padre | 0,6883 en AXIS v2.0 | Gemma Terms of Use | HuggingFace (0 descargas) |
| π0.5 (base, Physical Intelligence) | VLA flow matching | no disponible | no disponible en esta ficha | Apache-2.0 (openpi) más componentes Gemma | Repo openpi y LeRobot |
| π0 (Physical Intelligence) | VLA basado en flujo | no disponible | no disponible en esta ficha | Apache-2.0 (openpi) | Repo openpi |
| π0-FAST (Physical Intelligence) | VLA autorregresivo con tokenizador FAST | no disponible | no disponible en esta ficha | Apache-2.0 (openpi) | Repo openpi |

Los datos de arquitectura, contexto y rendimiento de π0.5, π0 y π0-FAST no están cuantificados en la información proporcionada más allá de las descripciones cualitativas de la documentación pública; por eso se marcan como no disponibles.

## Limitaciones y advertencias

- Artefacto de competición: el modelo está ajustado específicamente para las 30 tareas de AXIS v2.0 y no debe esperarse que generalice a otras tareas fuera de ese conjunto sin un nuevo ajuste.
- Trazabilidad mínima: cero descargas y cero likes, model card muy breve y ausencia de documentación sobre sesgos, datos de entrenamiento o evaluación independiente.
- Dependencia de simulación: el entrenamiento se hizo sobre rollouts de MuJoCo; el comportamiento en hardware real (brecha sim-to-real) no está documentado y puede degradarse notablemente.
- Estadísticas de normalización fijas: al ser idénticas a las del padre, el modelo espera un rango de observaciones y acciones concreto; usarlo con otra configuración de robot o de cámara puede invalidar las predicciones.
- Riesgo de alucinación: no disponible como métrica; en un VLA el fallo se manifiesta como acciones incoherentes o políticas que se desvían de la tarea, no como texto inventado.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgo.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: los pesos derivan de openpi π0.5 (Apache-2.0) y de PaliGemma (Gemma Terms of Use). La licencia aplicable es la de Gemma, con sus condiciones de uso, incluidas las restricciones de uso comercial y de redistribución que imponga el titular de dicha licencia. Conviene revisar los términos antes de cualquier uso en producción.
- Carga y ejecución: requiere el stack openpi (JAX) y el entorno oficial de AXIS; no es un modelo que se pueda ejecutar con herramientas genéricas de inferencia de LLM.
- Fecha de publicación inusual: el registro indica creación en 2026-09-29, dato que conviene verificar en el repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dsaddsaf/pi0.5-kppXFPDgR7Tj
- Modelo base declarado: https://huggingface.co/deepmaster/pi0.5-s8bNBi2ZQghb
- Paper de π0.5 (arXiv 2504.16054): https://arxiv.org/abs/2504.16054
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación de la política π0.5 en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Página de π0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Reseña académica de π0.5: https://xiaojxkevin.github.io/readings/vla/pi0-5/
