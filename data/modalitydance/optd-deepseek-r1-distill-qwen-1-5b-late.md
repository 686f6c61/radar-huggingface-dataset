# ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Late

## Resumen

OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Late es un checkpoint de estudiante obtenido mediante On-Policy Transition Distillation (OPTD), desarrollado por ModalityDance a partir de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parámetros, y se distribuye en safetensors BF16. Está entrenado sobre los dominios de matemáticas y código, con 150 actualizaciones y alineación en los bloques intermedios 11, 15 y 19.

La propuesta de OPTD es alinear los incrementos de log-probabilidad entre profesor y alumno en bloques intermedios y en la salida final, usando rollouts generados por el propio alumno. La actualización práctica emplea identidades de candidatos top-16 fijas de la política final, recompensas de transición desacopladas y probabilidades del alumno en la capa destino. Es un checkpoint relevante para investigación sobre destilación on-policy y para estudiar cómo se transfiere el razonamiento desde
