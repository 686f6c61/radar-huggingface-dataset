# microduckapp/microduck-dizzy-plop

# Microduck dizzy plop

## Resumen

`microduck-dizzy-plop` no es un modelo de lenguaje ni un modelo fundacional: es un artefacto de política motora (policy) empaquetado en ONNX que implementa una habilidad concreta del robot bípedo Microduck, desarrollado por Pollen Robotics con Hugging Face. El repositorio lo publica el usuario `microduckapp` bajo el pipeline `robotics` y la etiqueta `microduck-move`, y contiene `policy.onnx` (la política), `manifest.json` (qué debe instalar y reproducir el robot) y `media/preview.mp4` (previsualización). La política recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, y reproduce un movimiento de 11,2 segundos descrito por el autor como un giro sobre sí mismo hasta marearse, seguido de un balanceo con la cabeza dibujando círculos y un casi desplome.

El interés no está en el tamaño ni en el rendimiento cognitivo —no hay parámetros, contexto ni idiomas en el sentido habitual—, sino en el formato de distribución: una habilidad motora empaquetada como un activo instalable desde la app MicroDuck sobre un robot open source de 25 cm y 399 dólares, entrenado con aprendizaje por refuerzo en MuJoCo. Este checkpoint ejemplifica la cadena de publicación de skills para robótica de bajo coste: política exportada a ONNX, manifiesto de instalación y vídeo de validación.

El repositorio tiene 0 descargas, 0 likes, un tamaño declarado de 0,0 GB y licencia no especificada, por lo que debe tratarse como un artefacto de demostración y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política (policy) exportada a ONNX; topología interna no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantizacion | no disponible (se desconoce si el grafo ONNX está cuantizado) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Pipeline declarado | robotics |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duracion del movimiento | 11,2 s |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no documenta la topología de la red: solo describe el contrato de entrada/salida (61 observaciones → 14 consignas articulares a 50 Hz) y el hecho de que la política se distribuye como grafo ONNX ejecutable. Por el formato y la dimensionalidad, se trata de una política de control compacta pensada para inferencia en bucle cerrado sobre el robot; no hay información pública sobre número de capas, funciones de activación, número de parámetros ni tamaño del fichero.

Tampoco se detalla el proceso de entrenamiento de esta habilidad concreta. La plataforma Microduck, según la documentación y la prensa del lanzamiento, se entrena con aprendizaje por refuerzo en simulación (MuJoCo) y posteriormente transfiere los comportamientos al hardware; para este movimiento no se especifican número de pasos de entrenamiento, función de recompensa, configuración de domain randomization ni si se aplicó algún ajuste fino en el robot real. La innovación relevante es el empaquetado: la política se acompaña de un `manifest.json` que indica al robot qué instalar y cómo reproducir la habilidad desde la app MicroDuck, lo que convierte una política de RL en una «skill» distribuible.

## Capacidades

- Reproducción de una habilidad motora fija de 11,2 segundos: giro continuo sobre el propio eje, balanceo posterior con movimientos circulares de cabeza e inclinación casi hasta el desplome.
- Control de 14 articulaciones del bípedo a 50 Hz, con un bucle de inferencia de 20 ms por paso.
- Consumo de 61 observaciones por paso (estado propioceptivo y consignas de la política, según el contrato declarado; la composición exacta del vector no se documenta).
- Instalación y reproducción mediante `manifest.json` en el ecosistema MicroDuck.
- Ejecución portable vía runtime ONNX, sin dependencia de frameworks de deep learning completos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación simbólica.
- No tiene capacidades multilingües, de visión, audio ni modo «thinking».
- No es composicional por sí misma: es una habilidad cerrada, sin API declarada para encadenar o modular el movimiento.

## Casos de uso

- Demostración en ferias y eventos: instalar la habilidad desde la app y reproducir un movimiento recognoscible de 11,2 s para mostrar el robot en funcionamiento sin escribir código.
- Docencia de aprendizaje por refuerzo: usar la política como ejemplo tangible de sim-to-real y de cómo una política entrenada en MuJoCo se exporta a ONNX y se ejecuta en hardware de bajo coste.
- Investigación en reproducibilidad de skills: emplear el par `policy.onnx` + `manifest.json` como referencia de formato para publicar y versionar comportamientos motores.
- Pruebas de runtime embebido: validar el rendimiento de ONNX Runtime en el cómputo del robot con un bucle de control estricto a 50 Hz y 20 ms de presupuesto por iteración.
- Validación de infraestructura de distribución: probar el flujo de instalación, verificación de manifiesto y actualización de habilidades en la app MicroDuck.
- Pruebas de estrés mecánico y de control: el carácter «casi desplome» del movimiento permite evaluar límites de equilibrio, recuperación y comportamiento de los actuadores en condiciones exigentes.
- Secuencias de exhibición: encadenar esta habilidad con otros movimientos del catálogo `microduck-move` para construir una rutina de demostración.
- Evaluación comparativa de transferencia sim-to-real: medir la degradación entre la política simulada y su ejecución en el robot físico, siempre que se disponga de la configuración de entrenamiento (no publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos cuantitativos declarados por el autor son de interfaz, no de rendimiento: 61 observaciones de entrada, 14 objetivos articulares de salida, 50 Hz de frecuencia de control y 11,2 s de duración del movimiento. No hay métricas de recompensa, tasa de éxito, error de seguimiento articular, estabilidad ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada: no aplica para el caso de uso previsto; la política está pensada para ejecutarse en CPU. El tamaño del grafo no se publica y el repositorio declara 0,0 GB.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU consumer (por ejemplo, una RTX 4090) ejecutaría la inferencia sobradamente, pero no aporta ventaja frente a CPU para este contrato de entrada/salida.
- Compatibilidad con GPU consumer: sí, aunque innecesaria; el cuello de botella es la latencia determinista del bucle de control, no el cómputo.
- Cómputo objetivo: el del propio robot Microduck; las especificaciones del ordenador de a bordo no están disponibles en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), app MicroDuck para la instalación vía `manifest.json`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el diseño impone 20 ms por paso a 50 Hz; no se publican mediciones reales de latencia ni de jitter en el hardware del robot.
- Almacenamiento: mínimo; el repositorio declara 0,0 GB, compatible con almacenamiento embebido.

## Comparativa con modelos similares

No se han identificado políticas comparables con datos públicos (parámetros, contexto, rendimiento y licencia) dentro de la información disponible. La comparación solo puede hacerse a nivel de enfoque:

| Alternativa | Parametros | Ventana de observacion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-dizzy-plop (este modelo) | no disponible | 61 valores por paso, 50 Hz | no disponible | no disponible | Hugging Face, 0 descargas |
| Otras habilidades del catálogo `microduck-move` | no disponible | no disponible | no disponible | no disponible | no verificado en la información disponible |
| Animación scripted por keyframes (enfoque alternativo, no RL) | no aplica | no aplica | no disponible | depende de la implementación | genérica |
| Políticas de locomoción RL para bípedos de investigación | no disponible | no disponible | no disponible | no disponible | no verificado en la información disponible |

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita de uso comercial, modificación ni redistribución; en producción esto es un bloqueo legal hasta que el autor la declare.
- Ausencia de model card técnica: se desconoce la arquitectura interna, el número de parámetros, el proceso de entrenamiento, la función de recompensa y la composición exacta del vector de 61 observaciones.
- Especificidad morfológica: la política emite 14 consignas articulares para el Microduck; no es transferible a otras plataformas sin reentrenamiento.
- Sin validación comunitaria: 0 descargas y 0 likes, con creación y actualización en el mismo instante, lo que sugiere un artefacto de demostración no contrastado.
- Riesgo físico: el movimiento incluye un «casi desplome» deliberado; en superficies irregulares o con calibración deficiente puede provocar caídas y daños mecánicos.
- Brecha sim-to-real no cuantificada: no se publican métricas de éxito en hardware real ni condiciones de domain randomization.
- Sin capacidades de percepción semántica, lenguaje, razonamiento, tool calling ni agentes; no debe evaluarse con criterios de LLM.
- Sin benchmarks: imposible comparar su calidad frente a otras habilidades del mismo robot.
- Posible artefacto incompleto: el tamaño declarado de 0,0 GB puede corresponder a punteros LFS o a un empaquetado mínimo; conviene verificar la integridad de `policy.onnx` antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/microduckapp/microduck-dizzy-plop
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- TechCrunch, Hugging Face is selling a cute $399 open source duck robot, Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- MarkTechPost, Hugging Face Unveils Microduck: A $399 Open-Source 25 cm Biped: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- The AI Insider, Hugging Face's Pollen Robotics Releases Small, Cute & Open-Source Microduck: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Best-AI, Hugging Face Unveils Microduck: A $399 Open-Source Robot for AI Development: https://best-ai.org/ai-news/hugging-face-unveils-microduck-a-399-open-source-robot-for-ai-development-psmhme
