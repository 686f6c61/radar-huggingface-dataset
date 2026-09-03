# BlackCatRoboticsAI/g1-amp-motion

## Resumen

El modelo `BlackCatRoboticsAI/g1-amp-motion` es una política de control para el robot humanoide Unitree G1, desarrollada por BlackCatRoboticsAI (también referido como PathOn-AI en la cita). Se trata de un sistema de imitación de movimiento basado en Adversarial Motion Priors (AMP), entrenado en el entorno de simulación Isaac Lab. El modelo aprende a reproducir 494 secuencias de captura de movimiento humano del dataset AMASS, generando comandos de posición articular para los 23 grados de libertad activos del robot.

La relevancia de este modelo radica en que permite transferir movimientos humanos complejos a un robot bípedo de 37 DOF mediante una política entrenada con aprendizaje por refuerzo, sin necesidad de ingeniería de control manual. El modelo se distribuye en formato TorchScript, lo que facilita su despliegue en entornos de simulación y en el hardware real del robot. Es un modelo pequeño (2,9 MB el artefacto de inferencia) y ligero, pensado para ejecutarse en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (MLP) entrenada con AMP (Adversarial Motion Priors) en Isaac Lab |
| Parametros totales | no disponible (el artefacto JIT pesa 2,9 MB; el checkpoint completo 25 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no aplica (formato TorchScript, precision FP32) |
| Idiomas soportados | no aplica |
| Licencia | MIT (uso comercial y no comercial permitido) |
| Formato de pesos | TorchScript (.pt) y checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es una politica de control de cuerpo completo para el robot Unitree G1 (37 DOF, 23 activos). La entrada es un vector de observacion de 216 dimensiones que incluye posiciones y velocidades articulares, estado de la base (raiz) y objetivos de referencia futuros. La salida es un vector de 23 dimensiones con objetivos de posicion articular, que deben escalarse por 0,5 antes de enviarse al robot.

El entrenamiento se realizo con el algoritmo AMP (Adversarial Motion Priors) implementado en la libreria skrl, dentro de Isaac Lab. Se utilizaron 494 secuencias de movimiento del dataset AMASS, equivalentes a aproximadamente 113 minutos y 196 642 frames. El entrenamiento duro 5,5 dias en una NVIDIA RTX 4080 SUPER (16 GB VRAM), completando 12,4 millones de timesteps. Se aplico domain randomization sobre masa, friccion, ganancias PD y retardo de accion para mejorar la robustez.

## Capacidades

- Imitacion de movimiento humanoide: reproduce 494 secuencias de captura de movimiento (AMASS) en el robot Unitree G1.
- Control de cuerpo completo: genera objetivos de posicion para los 23 articulaciones activas del robot.
- Seguimiento de referencia: utiliza objetivos futuros de la trayectoria de referencia como parte de la observacion, lo que permite anticipar movimientos.
- Robustez a variaciones fisicas: el domain randomization durante el entrenamiento mejora la transferencia a condiciones reales o simuladas con perturbaciones.
- Inferencia en tiempo real: el modelo es extremadamente ligero (2,9 MB) y puede ejecutarse a alta frecuencia en hardware modesto.
- Integracion con Isaac Lab: disenado para funcionar dentro del ecosistema de simulacion de NVIDIA, aunque el artefacto TorchScript es portable.

## Casos de uso

- Simulacion de robotica para investigacion: el modelo permite probar algoritmos de control y planificacion de movimientos en el Unitree G1 dentro de Isaac Lab, sin necesidad de disenar controladores manuales.
- Desarrollo de habilidades de locomocion: puede servir como base para aprender tareas mas complejas (caminar, esquivar obstaculos, manipular objetos) mediante aprendizaje por refuerzo, usando esta politica como inicializacion o como prior.
- Generacion de movimientos para animacion: las secuencias de movimiento generadas pueden exportarse a herramientas de animacion 3D o utilizarse para validar la cinematica del robot en entornos virtuales.
- Benchmarking de algoritmos de imitacion: al estar entrenado con AMP, puede compararse contra otras politicas de imitacion (por ejemplo, basadas en GAIL o en imitacion directa) para evaluar la calidad del movimiento resultante.
- Pruebas de robustez en simulacion: gracias al domain randomization, puede usarse para estresar el robot con perturbaciones de masa, friccion o retardo, evaluando la estabilidad del control.
- Despliegue en el robot real (con adaptaciones): aunque el modelo se entrena en simulacion, el formato TorchScript permite cargarlo en el Unitree G1 real, siempre que se ajusten las escalas y se valide la transferencia sim-to-real.

## Benchmarks y rendimiento

La model card del autor reporta las siguientes metricas de entrenamiento (medias sobre episodios):

| Metrica | Valor |
|---|---|
| Recompensa total (media) | 160,29 |
| Longitud de episodio (media) | 396,9 / 400 pasos |
| Recompensa de seguimiento (media) | 0,317 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Estas metricas indican que la politica completa casi todos los episodios (396,9 de 400 pasos) y obtiene una recompensa de seguimiento moderada, lo que sugiere que el movimiento imitado es razonablemente fiel a las referencias.

## Requisitos de hardware

- Inferencia: el modelo es muy ligero (2,9 MB en TorchScript). Puede ejecutarse en CPU o en cualquier GPU con al menos 1 GB de VRAM, aunque para control en tiempo real se recomienda una GPU dedicada o un procesador embebido con soporte PyTorch.
- Entrenamiento: se realizo en una NVIDIA RTX 4080 SUPER (16 GB VRAM) durante 5,5 dias. Para reproducir el entrenamiento se necesita una GPU con al menos 12-16 GB de VRAM y suficiente RAM para el entorno de simulacion Isaac Lab.
- Despliegue en robot real: requiere el hardware del Unitree G1 (controlador con capacidad de ejecutar TorchScript) y una conexion de baja latencia para enviar los objetivos articulares a 23 DOF.
- Opciones de despliegue: el artefacto TorchScript puede cargarse con PyTorch en cualquier entorno Python. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia: no se proporcionan datos de latencia, pero dado el tamano del modelo (2,9 MB) y la salida de 23 valores, se espera una inferencia en el orden de microsegundos en GPU y pocos milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de imitacion de movimiento para Unitree G1) en los datos proporcionados. La model card no menciona alternativas ni benchmarks cruzados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para el robot Unitree G1 (37 DOF, 23 activos). No es transferible directamente a otros robots sin reentrenamiento o adaptacion de la arquitectura.
- La salida son objetivos de posicion articular que deben escalarse por 0,5 antes de enviarse al robot. Un error en este escalado puede provocar movimientos incorrectos o danos en el hardware.
- El entrenamiento se realizo en simulacion con domain randomization, pero no se han publicado resultados de transferencia sim-to-real. El despliegue en el robot real requiere validacion adicional.
- La recompensa de seguimiento media es de 0,317, lo que indica que la fidelidad al movimiento de referencia no es perfecta; puede haber desviaciones notables en algunos episodios.
- El modelo no tiene capacidades de lenguaje, vision ni razonamiento; es exclusivamente una politica de control motor.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las licencias de los datasets utilizados (AMASS) y del software de simulacion (Isaac Lab).
- No se proporcionan datos sobre sesgos o alucinaciones, ya que no es un modelo generativo de texto. Sin embargo, en el contexto robotico, el riesgo principal es la generacion de movimientos inestables o inseguros si las observaciones se alejan de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlackCatRoboticsAI/g1-amp-motion
- Cita del autor (referencia al proyecto original): https://huggingface.co/PathOn-AI/g1-imitate-isaaclab-amp
- No se encontraron otros enlaces relevantes en la busqueda web (los resultados obtenidos eran paginas de ayuda de YouTube y no relacionados con el modelo).
