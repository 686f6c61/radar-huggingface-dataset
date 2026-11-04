# LUC1O/act-5090-C3_transfer_cube_scripted

## Resumen

ACT (Action Chunking with Transformers) es una política de imitación para control robótico que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este checkpoint concreto, publicado por el usuario LUC1O, es un entrenamiento de referencia de ACT sobre el dataset simulado `lerobot/aloha_sim_transfer_cube_scripted` del ecosistema LeRobot, usando los hiperparámetros oficiales del paper (batch 8, lr 1e-5, chunk size 100, 100k pasos) y ejecutado en una única GPU RTX 5090.

El modelo resuelve la tarea `AlohaTransferCube-v0`, en la que un brazo bimanual ALOHA debe transferir un cubo entre efectores en simulación. Su relevancia es doble: por un lado sirve como referencia reproducible de entrenamiento de ACT en hardware consumer (una RTX 5090), y por otro aporta una evaluación cuantitativa explícita (93,0 % de éxito en 200 episodios, con intervalo de confianza de Wilson al 95 % de 88,6–95,8), algo poco habitual en checkpoints de robótica de bajo perfil.

No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural. Es una política visomotora de ~51,7 millones de parámetros que mapea observaciones (imágenes de cámaras e información de estado de los brazos) a comandos de articulaciones. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors para la librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con codificador visual ResNet y CVAE |
| Parámetros totales | 51.685.006 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de LeRobot) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | AlohaTransferCube-v0 (manipulación bimanual simulada) |
| Dataset de entrenamiento | lerobot/aloha_sim_transfer_cube_scripted |
| Chunk size | 100 |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Learning rate | 1e-5 |
| Hardware de entrenamiento | 1 GPU RTX 5090 |

## Arquitectura y entrenamiento

ACT combina un codificador visual convolucional (ResNet) que procesa las imágenes de las cámaras del robot con un transformer encoder-decoder que genera un chunk de acciones futuras. El componente CVAE (autoencoder variacional condicional) modela la variabilidad de las demostraciones humanas durante el entrenamiento y se descarta en inferencia, donde la política actúa de forma determinista. La predicción por chunks (100 acciones por paso de inferencia) es la innovación clave: reduce el horizonte efectivo de decisión y mitiga el error de composición característico de las políticas que predicen acción a acción.

El entrenamiento se realizó con LeRobot en el commit `ba83e4c`, replicando los hiperparámetros oficiales del paper de ACT: batch de 8, learning rate de 1e-5, chunk size de 100 y 100.000 pasos de optimización, todo sobre una única RTX 5090. El dataset es `lerobot/aloha_sim_transfer_cube_scripted`, un conjunto de demostraciones scriptadas en el simulador ALOHA para la tarea de transferencia de cubo. No se documenta en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control visomotor bimanual: genera comandos de articulaciones para los dos brazos del robot ALOHA a partir de observaciones de cámara y estado.
- Predicción por chunks: emite secuencias de 100 acciones por inferencia, lo que estabiliza la ejecución en tareas de manipulación.
- Ejecución de la tarea de transferencia de cubo en simulación (`AlohaTransferCube-v0`).
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: compatible con `lerobot-eval` y los entornos ALOHA simulados.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de referencia de ACT: sirve como checkpoint base para validar pipelines de entrenamiento de ACT en LeRobot, ya que documenta hiperparámetros exactos, commit de la librería y hardware utilizado.
- Evaluación comparativa de políticas de imitación: permite contrastar el 93,0 % de éxito en `AlohaTransferCube-v0` con otras políticas entrenadas sobre el mismo dataset simulado.
- Punto de partida para fine-tuning: al ser un checkpoint ACT completo sobre ALOHA, puede adaptarse a variantes de la tarea de transferencia o a datasets simulados relacionados.
- Validación de hardware consumer en robótica: demuestra que una RTX 5090 es suficiente para entrenar ACT con hiperparámetros oficiales, útil para equipos con presupuesto limitado.
- Docencia e investigación en aprendizaje por imitación: ejemplo reproducible de entrenamiento y evaluación de ACT con métricas estadísticas explícitas (intervalo de Wilson).
- Pruebas de integración en simulación: útil para verificar el correcto funcionamiento de `lerobot-eval` con `--env.type=aloha` antes de desplegar políticas en entornos reales.
- Benchmarking de infraestructura: el repositorio de GitHub asociado incluye logs y scripts de reproducción, útil para medir throughput de entrenamiento en distintas GPUs.

## Benchmarks y rendimiento

| Tarea | Entorno | Episodios | Tasa de éxito | IC 95 % (Wilson) |
|---|---|---|---|---|
| Transferencia de cubo | `aloha` / `AlohaTransferCube-v0` | 200 | 93,0 % (186/200) | 88,6–95,8 % |

No se han publicado en la información disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparativas con otras políticas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero con 51,7 millones de parámetros y pesos safetensors en fp32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas para inferencia: cualquier GPU moderna (RTX 3060 en adelante) es suficiente; el cuello de botella real es el simulador ALOHA, no la política.
- GPU recomendadas para entrenamiento: se ha validado entrenamiento completo en una RTX 5090; GPUs de gama alta (A100, H100) reducirían el tiempo, pero no se documentan cifras de tiempo de entrenamiento.
- Cabe en GPU consumer: sí, tanto en inferencia como en entrenamiento (validado en RTX 5090).
- Opciones de despliegue: `lerobot-eval` con `--policy.path=LUC1O/act-5090-C3_transfer_cube_scripted` y `--env.type=aloha`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Tasa de éxito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LUC1O/act-5090-C3_transfer_cube_scripted | ACT | 51,7 M | AlohaTransferCube-v0 | 93,0 % (200 eps) | no disponible | HuggingFace |
| ACT original (paper Zhao et al.) | ACT | ~80 M (según configuración) | Tareas ALOHA | no disponible en esta ficha | MIT (código) | GitHub |
| Diffusion Policy (Chi et al.) | Diffusion | no disponible | Manipulación | no disponible en esta ficha | MIT (código) | GitHub |

No se dispone en la información proporcionada de comparativas cuantitativas con otras políticas sobre el mismo entorno y número de episodios.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con demostraciones scriptadas en simulación, la política hereda las limitaciones del generador de demostraciones y no generaliza a condiciones no vistas.
- Riesgo de sobreajuste al simulador: el 93,0 % de éxito corresponde al entorno simulado; no hay evidencia de transferencia a un robot físico.
- Alcance restringido: solo se ha evaluado en `AlohaTransferCube-v0`; no se documenta su comportamiento en otras tareas ALOHA.
- Licencia no especificada: la ausencia de licencia explícita impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin datos de idioma ni texto: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Reproducibilidad dependiente del commit: el entrenamiento usa el commit `ba83e4c` de LeRobot; cambios posteriores en la librería pueden alterar el comportamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni INT8/INT4, lo que limita su uso en hardware muy restringido (aunque el tamaño ya es reducido).

## Enlaces

- HuggingFace: https://huggingface.co/LUC1O/act-5090-C3_transfer_cube_scripted
- Repositorio de benchmark y reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_scripted
- LeRobot (librería): https://github.com/huggingface/lerobot
