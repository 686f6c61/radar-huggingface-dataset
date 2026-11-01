# mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. La política está especializada en una tarea concreta de manipulación pick-and-place: recoger un objeto de una lista de 40 categorías (alimentos, utensilios, menaje) y colocarlo en una caja. El modelo consume observaciones multimodales (estado propioceptivo de 9 dimensiones y tres cámaras RGB de 224x224) y produce acciones de 7 dimensiones a 20 FPS.

El backbone combina Cosmos-Reason2/Qwen3-VL para el razonamiento visión-lenguaje con un transformer de acciones basado en flow matching, que predice trayectorias condicionadas por visión, lenguaje y propiocepción. El checkpoint tiene aproximadamente 3.144 millones de parámetros (3,14 B) y un tamaño de repositorio de 50,3 GB, lo que refleja pesos en precisión completa orientados a inferencia en hardware de gama alta.

Es relevante porque ejemplifica el patrón actual de adaptación de modelos fundacionales de robótica a tareas específicas mediante fine-tuning con datasets de imitación de tamaño moderado (787 episodios, 195.184 frames). La licencia Apache 2.0 facilita su reutilización comercial, aunque el rendimiento está acotado al dominio de la tarea entrenada y al robot Panda empleado en la simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repositorio no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las tres cámaras (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) junto con la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones de 7 dimensiones condicionadas por visión, lenguaje y el estado propioceptivo de 9 dimensiones. Este esquema de flow matching permite modelar distribuciones multimodales de acciones, algo relevante en manipulación donde existen múltiples trayectorias válidas para una misma tarea.

El entrenamiento se realizó por imitación supervisada sobre el dataset `train_800_sparse__mask__overlay_a75__sim__agentview_camera__live`, con 787 episodios y 195.184 frames a 20 FPS, cubriendo 40 instrucciones de tipo "Pick the X and place it into the box". La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW con learning rate 7e-5 y semilla 0, usando LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni fases de refinamiento por preferencias; el proceso es puramente de clonación de comportamiento sobre datos de simulación.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones (posición y orientación del efector final más apertura de pinza) a partir de observaciones visuales y propioceptivas.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías distintas.
- Fusión multimodal de tres vistas de cámara (vista de agente y dos cámaras en la muñeca del robot) con el estado articular.
- Ejecución de tareas pick-and-place en un entorno simulado con el robot Panda.
- Control reactivo a 20 FPS, adecuado para bucles de control de frecuencia media.
- No se documenta soporte de tool calling, agentes multi-paso ni capacidades de audio.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.

## Casos de uso

- Automatización de pick-and-place en almacén simulado: la política puede recoger cualquiera de las 40 categorías de objetos domésticos y depositarlas en una caja, útil como base para prototipos de logística antes de transferir a hardware real.
- Generación de datos sintéticos de manipulación: al ejecutar la política en simulación se pueden producir trayectorias adicionales para aumentar datasets de imitación o entrenar modelos de dinámica.
- Evaluación comparativa de modelos fundacionales de robótica: sirve como referencia de fine-tuning de GR00T N1.7 sobre una tarea acotada, permitiendo medir la brecha entre el modelo base y una política especializada.
- Investigación en imitación con múltiples cámaras: el uso de tres vistas (una externa y dos en la muñeca) permite estudiar el impacto de la configuración sensorial en el éxito de la tarea.
- Benchmark de robustez ante variación de objetos: las 40 instrucciones distintas permiten evaluar la generalización de la política a categorías no vistas durante el entrenamiento.
- Base para transferencia sim-to-real: la política puede servir como punto de partida para ajuste fino con datos reales del robot Panda, reduciendo el coste de recolección inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 B parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para pesos; en FP32, unos 12,6 GB. El repositorio de 50,3 GB sugiere pesos en mayor precisión o artefactos adicionales.
- GPU recomendadas: NVIDIA A100, H100 o L40S para inferencia en FP32/FP16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 e incluso RTX 4080 (16 GB) con FP16, siempre que se gestionen los buffers de las tres cámaras.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican directamente a un modelo de acciones.
- Latencia y throughput: el control opera a 20 FPS según el dataset de entrenamiento; no se publican cifras de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3,14 B | no disponible | Pick-and-place Panda, 40 objetos | Apache 2.0 | HuggingFace |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | Apache 2.0 | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT/diffusion | típicamente < 1 B | no disponible | Imitación por tarea | Apache 2.0 | HuggingFace |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado métricas de éxito en la información proporcionada.

## Limitaciones y advertencias

- La política está entrenada exclusivamente en simulación; no hay evidencia de transferencia a un robot físico.
- El dominio de objetos está acotado a las 40 categorías del dataset; el rendimiento ante objetos nuevos no está documentado.
- Las instrucciones de tarea están en inglés y siguen una plantilla fija ("Pick the X and place it into the box"); no se ha evaluado la robustez ante paráfrasis.
- No se publican tasas de éxito, curvas de aprendizaje ni análisis de fallos, lo que impide evaluar la calidad real del checkpoint.
- El tamaño del repositorio (50,3 GB) y los 3,14 B parámetros implican requisitos de hardware no triviales para un modelo de política.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de acciones, el riesgo se manifiesta como ejecuciones erróneas de la tarea.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias deben verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__overlay_a75__sim__agentview_camera__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
