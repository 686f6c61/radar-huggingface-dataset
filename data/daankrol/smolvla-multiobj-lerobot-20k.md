# Daankrol/smolvla-multiobj-lerobot-20k

## Resumen

SmolVLA multi-object pick-and-place (LeRobot 20k) es un checkpoint de política robótica de tipo vision-language-action (VLA) desarrollado por el usuario Daankrol, obtenido mediante fine-tuning de `lerobot/smolvla_base` sobre el dataset propio `Daankrol/pick-and-place-multi-obj`. El modelo resuelve una tarea concreta de manipulación: recoger un cubo marrón y depositarlo en una caja negra, prediciendo seis posiciones articulares objetivo para un brazo seguidor SO-101. Con 450 millones de parámetros y un repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo con CUDA.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de fine-tuning de SmolVLA con LeRobot 0.6.0, incluyendo hiperparámetros, curvas de pérdida y procedimiento de despliegue. Por otro, advierte de que el checkpoint no ha sido validado en un robot físico tras el entrenamiento: solo ha superado una carga estricta de pesos y una inferencia sintética en CPU con los ficheros de preprocesado y normalización guardados.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés en el texto de instrucción y está etiquetado como pipeline de robótica en Hugging Face. Es, por tanto, un artefacto de investigación y prototipado, no un componente listo para producción sin una evaluación física previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tune de `lerobot/smolvla_base`; experto de acción y proyección de estado entrenables, codificador de visión congelado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | en (texto de instrucción) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una política VLA que combina un codificador visual (configuración y tokenizador de `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`) con un experto de acción que genera trayectorias de articulaciones. En este fine-tune solo se entrenan el experto de acción y la proyección de estado; el codificador de visión permanece congelado. La salida es un chunk de acción de 50 pasos, de los cuales se ejecutan los 50, con 10 pasos de denoising por inferencia.

El entrenamiento se realizó durante 20.000 pasos sobre 200 episodios (180 de entrenamiento, 20 reservados, semilla 42), con batch de 64, precisión mixta BF16 en una NVIDIA H100, learning rate de 1e-4 con 100 pasos de warmup y decaimiento coseno hasta 2.5e-6. La pérdida final registrada de entrenamiento fue 0,034 y la de evaluación offline 0,4978 con un límite de 256 muestras. El dataset se grabó a 30 FPS y el robot de grabación se identifica como `PhysicalAIRobot`, sin que se conserven los puertos serie ni los ficheros de calibración originales. Las posiciones se manejan normalizadas en aproximadamente [-100, 100] para las articulaciones del cuerpo y [0, 100] para la pinza, con orden `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`.

## Capacidades

- Predicción de seis posiciones articulares objetivo para un brazo seguidor SO-101 a partir de observaciones visuales y una instrucción textual.
- Ejecución autónoma sin brazo líder: la inferencia no requiere teleoperación.
- Seguimiento de una instrucción en inglés: "pick up the brown cube and put it in the black box".
- Generación de chunks de acción de 50 pasos con 10 pasos de denoising.
- Integración nativa con LeRobot 0.6.0 (extra `smolvla,feetech`).
- Carga de pesos completa desde el repositorio, sin necesidad de descargar los pesos originales del VLM (`--policy.load_vlm_weights=false`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento.

## Casos de uso

- Prototipado de pick-and-place en laboratorio: el modelo sirve como punto de partida para reproducir la tarea cubo-caja con un SO-101 y comparar curvas de entrenamiento frente a otros checkpoints.
- Fine-tuning sobre datasets propios: al ser un fine-tune de `lerobot/smolvla_base` con hiperparámetros documentados, se puede reutilizar como referencia para ajustar nuevas tareas de manipulación con LeRobot.
- Docencia y formación en robótica VLA: permite montar un pipeline completo (calibración, cámaras, rollout) con hardware asequible y una política de 450 M de parámetros.
- Evaluación de robustez de políticas: útil para estudiar cómo afectan cambios de calibración, iluminación o posición de cámara al éxito de la tarea, dado que el autor advierte de la dependencia de los rangos de calibración.
- Benchmark interno de despliegue: sirve para medir latencia y throughput de SmolVLA en GPUs concretas antes de invertir en modelos mayores.
- Base para experimentos de generalización multi-objeto: el dataset incluye variaciones de objeto, lo que permite analizar la sensibilidad del modelo al color y la forma.
- Integración en pipelines de investigación con LeRobot: carga estricta de pesos y ficheros de normalización guardados facilitan la reproducibilidad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de entrenamiento (0,034) y de evaluación offline (0,4978) y advierte explícitamente de que no son tasas de éxito en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en BF16 el peso ronda 0,9 GB, por lo que en la práctica debería caber en GPUs de consumo con 8 GB o más, aunque no se documenta una medición.
- GPU recomendadas: el entrenamiento se hizo en NVIDIA H100; para inferencia se requiere una GPU NVIDIA con CUDA, sin modelo concreto especificado.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060/4060 en adelante), pero no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.6.0 con `lerobot[smolvla,feetech]`, Python 3.12, PyTorch 2.11.0+cu128, torchvision 0.26.0+cu128 y Transformers 5.15.1 en el entorno de referencia; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Daankrol/smolvla-multiobj-lerobot-20k | 450 M | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face, 22 descargas |
| lerobot/smolvla_base | no disponible | no disponible | Política VLA base | no disponible | Hugging Face |
| Otros fine-tunes de SmolVLA | no disponible | no disponible | Manipulación diversa | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No evaluado en robot físico tras el entrenamiento: solo ha pasado carga de pesos e inferencia sintética en CPU.
- Dependencia crítica de la calibración: posiciones normalizadas distintas producen poses físicas distintas; hay que reutilizar el ID y el directorio de calibración de la grabación.
- Convención de unidades: debe usarse `--robot.use_degrees=false`; LeRobot 0.6 usa grados por defecto y rompería la interpretación de las acciones.
- Tarea única y estrecha: solo se ha entrenado para recoger un cubo marrón y dejarlo en una caja negra.
- Idioma: instrucciones únicamente en inglés.
- Sin puertos serie ni ficheros de calibración originales en el dataset, lo que dificulta la reproducción exacta.
- Riesgo de sobreajuste al entorno de grabación (iluminación, cámaras, posición del brazo).
- No se documentan sesgos, tasas de alucinación ni métricas de éxito; cualquier uso en producción exige validación propia.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor sobre el comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daankrol/smolvla-multiobj-lerobot-20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/Daankrol/pick-and-place-multi-obj
- Configuración y tokenizador VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/daankrol/smolvla-multiobj-nanfix/runs/7iyl65q1
