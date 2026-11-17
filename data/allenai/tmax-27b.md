# allenai/tmax-27b

## Resumen

TMax 27B es un modelo de lenguaje especializado en actuar como agente de terminal (terminal-agent), desarrollado por Ai2 (Allen Institute for AI) mediante aprendizaje por refuerzo sobre Qwen 3.6 27B. El modelo se entrena con DPPO (Direct Preference Policy Optimization, según la nomenclatura del paper) durante 500 pasos sobre el dataset TMax-15K, un conjunto de instrucciones abiertas orientadas a tareas de terminal. Alcanza aproximadamente un 43% en Terminal Bench 2.0 tras 160 pasos de RL, lo que lo convierte en una alternativa afinada específicamente para entornos de línea de comandos frente al modelo base sin ajustar.

La relevancia del modelo radica en su enfoque: no es un modelo generalista, sino un ajuste fino orientado a un dominio concreto (ejecución de comandos, navegación de sistemas de archivos, resolución de tareas en terminal). El checkpoint principal corresponde al paso 160, que fue el que mejor rindió en Terminal Bench Lite, aunque el repositorio incluye también checkpoints en los pasos 100, 200, 240 y 300. El modelo conserva la licencia Apache 2.0 del modelo base y está pensado para investigación y uso educativo según las guías de uso responsable de Ai2.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 269 GB y 2.645.504 parámetros totales según los metadatos de safetensors (dato que probablemente refleja el número de tensores o un recuento parcial, no el total real de parámetros del modelo de 27B). El contexto máximo de entrenamiento es de 65.536 tokens, y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.6 27B, sin cabeza de visión) |
| Parametros totales | 27B (según nombre del modelo; safetensors reporta 2.645.504, dato no consistente con el tamaño nominal) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens (max overall tokens en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TMax 27B parte de Qwen 3.6 27B, un transformer denso de 27B parámetros, y se afina mediante RL con DPPO sobre el dataset TMax-15K (allenai/tmax-15k-open-instruct). Durante el entrenamiento se elimina la cabeza de visión del modelo base, por lo que el modelo resultante es exclusivamente de lenguaje y debe servirse con `--language_model_only` en vLLM. Los hiperparámetros documentados incluyen: prompt máximo de 2.048 tokens, máximo de 16.384 tokens por turno, máximo global de 65.536 tokens, pack length de 67.584, batch size de 1 por dispositivo, 8 prompts únicos por rollout, 32 muestras por prompt, 4 pasos asíncronos, learning rate de 1e-6 con scheduler constante, temperatura de muestreo 1.0, KL beta 0.0, función de pérdida DPPO con divergencia TV binaria y umbral 0.1, normalización de ventaja centrada (sin división por desviación estándar) y cabeza LM en FP32.

El entrenamiento total fue de 500 pasos, aunque el checkpoint principal publicado corresponde al paso 160 por ser el de mejor rendimiento en Terminal Bench Lite. El modelo base utilizado para el afinamiento es hamishivi/Qwen3.6-27B. La innovación técnica principal es el uso de DPPO (una variante de optimización de política con preferencias directas) aplicado a un dominio de agente de terminal, con evaluación sobre Terminal Bench 2.0, 2.1 y Lite usando backend podman/docker y daytona.

## Capacidades

- Generación de texto y razonamiento en inglés, heredado del modelo base Qwen 3.6 27B.
- Ejecución de tareas de terminal: navegación de sistemas de archivos, ejecución de comandos, resolución de problemas en línea de comandos.
- Soporte de tool calling / function calling (requiere `--enable-auto-tool-choice` y parser `qwen3_xml` en vLLM).
- Razonamiento multi-paso orientado a agentes (entrenado con rollouts de hasta 65.536 tokens y múltiples turnos).
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin capacidades de visión (cabeza de visión eliminada durante el entrenamiento).
- No se documentan capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a secuencias de comandos de terminal, aprovechando su entrenamiento específico en Terminal Bench para tareas de navegación y ejecución.
- Agentes de CI/CD: integrable en pipelines para diagnosticar fallos de build, inspeccionar logs y proponer comandos de corrección, gracias al soporte de tool calling y a su ventana de 65.536 tokens.
- Asistencia interactiva en shells: puede actuar como copiloto en entornos de línea de comandos, sugiriendo comandos y explicando su efecto, con contexto suficiente para mantener el estado de una sesión multi-turno.
- Resolución de incidencias en servidores: dado un síntoma descrito en inglés, el modelo puede generar secuencias de diagnóstico (revisión de logs, estado de servicios, permisos) y ejecutarlas mediante herramientas.
- Automatización de tareas de desarrollo: clonado de repositorios, ejecución de tests, gestión de dependencias y despliegues locales, aprovechando su entrenamiento sobre el dataset TMax-15K orientado a terminal.
- Investigación en agentes de terminal: sirve como checkpoint de referencia para estudiar el efecto del RL con DPPO en tareas de agente, con checkpoints intermedios (pasos 100, 160, 200, 240, 300) disponibles para análisis.
- Evaluación comparativa de agentes: útil como baseline afinado frente a Qwen 3.6 27B sin ajustar en benchmarks de terminal (TB Lite, TB 2.1, TB 2.0 daytona).

## Benchmarks y rendimiento

| Modelo | TB Lite | TB 2.1 | TB 2.0 (daytona) |
|---|---|---|---|
| Qwen 3.5 2B | 5.71 ± 1.6 | 1.9 ± 1.4 | 2.3 ± 1.0 |
| Tmax 2B | 11.8 ± 1.4 | 4.2 ± 1.2 | 2.9 ± 0.6 |
| Qwen 3.5 4B | 31.8 ± 3.8 | no disponible | 16.6 ± 1.7 |
| Tmax 4B | 42.6 ± 1.5 | 19.9 ± 1.1 | 18.9 ± 1.9 |
| Qwen 3.5 9B | 41.9 ± 2.7 | 16.1 ± 3.7 | 21.1 ± 2.6 |
| Tmax 9B | 57.2 ± 2.5 | 28.8 ± 3.7 | 27.2 ± 1.5 |
| Qwen 3.6 27B | 70.8 ± 2.1 | 40.5 ± 2.4 | 39.6 ± 2.1 |
| Tmax 27B | 68.6 ± 4.7 | 44.9 ± 1.8 | 42.7 ± 0.7 |

Metodología: backend podman (docker) con timeouts por defecto y harness similar a mini-swe-agent; para las ejecuciones daytona se usó el backend daytona. Para Lite y 2.1 se reporta media y error estándar sobre 3 ejecuciones; para daytona, sobre 5 ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de 27B en FP16 se requieren aproximadamente 54 GB de pesos, más overhead de KV cache para 65.536 tokens de contexto.
- GPU recomendadas: la configuración oficial de vLLM usa `--tensor-parallel-size 8`, lo que implica 8 GPUs (por ejemplo, A100 80GB, H100 80GB) para servir el modelo en precisión completa con contexto largo.
- Cabe en consumer GPU: no en una sola GPU consumer para FP16; requeriría cuantización (no documentada en la información disponible) o múltiples GPUs.
- Opciones de despliegue: vLLM 0.19.1 (recomendado, con `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml`, `--max-model-len 65536`, `--language_model_only`); otros frameworks no documentados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TB Lite | TB 2.1 | TB 2.0 (daytona) | Licencia |
|---|---|---|---|---|---|---|
| Tmax 27B | 27B | 65.536 | 68.6 ± 4.7 | 44.9 ± 1.8 | 42.7 ± 0.7 | Apache 2.0 |
| Qwen 3.6 27B (base) | 27B | no disponible | 70.8 ± 2.1 | 40.5 ± 2.4 | 39.6 ± 2.1 | no disponible |
| Tmax 9B | 9B | no disponible | 57.2 ± 2.5 | 28.8 ± 3.7 | 27.2 ± 1.5 | Apache 2.0 |
| Tmax 4B | 4B | no disponible | 42.6 ± 1.5 | 19.9 ± 1.1 | 18.9 ± 1.9 | Apache 2.0 |

Tmax 27B mejora al modelo base Qwen 3.6 27B en TB 2.1 (44.9 frente a 40.5) y TB 2.0 daytona (42.7 frente a 39.6), aunque queda ligeramente por debajo en TB Lite (68.6 frente a 70.8). Frente a los modelos más pequeños de la familia Tmax, el salto de rendimiento es notable en todas las métricas.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- Sin capacidades de visión: la cabeza de visión fue eliminada durante el entrenamiento y el modelo debe servirse con `--language_model_only`.
- Es un modelo especializado en tareas de terminal; su rendimiento en tareas generales de lenguaje no está documentado y podría degradarse respecto al modelo base.
- Riesgo de alucinación en la generación de comandos y secuencias de terminal, con potencial impacto destructivo si se ejecuta sin supervisión.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 lo destina a investigación y uso educativo según sus guías de uso responsable.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- Los datos de parámetros en safetensors (2.645.504) no son consistentes con el tamaño nominal de 27B; conviene verificar el recuento real antes de planificar el despliegue.
- El checkpoint principal es el paso 160, no el paso final (500); los checkpoints intermedios están disponibles como ramas del repositorio.
- Requiere configuración específica de vLLM (parser `qwen3_xml`, `language_model_only`) para funcionar correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/tmax-27b
- Paper: https://arxiv.org/abs/2606.23321
- Blog: https://wai-org.com/blog/tmax/
- Código: https://github.com/hamishivi/tmax
- Colección de modelos y datos: https://huggingface.co/collections/allenai/tmax
- Dataset: https://huggingface.co/datasets/allenai/tmax-15k-open-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo base del afinamiento: https://huggingface.co/hamishivi/Qwen3.6-27B
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
