# KyraLeeChunWei/Oxymetazoline_e250_20K_ACT

## Resumen

Oxymetazoline_e250_20K_ACT es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No se trata de un modelo de lenguaje: es una política de control que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones motoras.

El modelo tiene 51.678.855 parámetros y un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset `KyraLeeChunWei/Oxymetazoline_e250`, presumiblemente una colección de episodios de teleoperación, y se distribuye en formato safetensors bajo licencia Apache 2.0. La nomenclatura "20K" sugiere un entrenamiento de 20.000 pasos, aunque este dato no se confirma en la model card.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible para un robot y una tarea concretos, publicado por un autor individual sin métricas de éxito publicadas ni descargas registradas. Resulta útil como ejemplo de pipeline LeRobot/ACT y como punto de partida para reentrenar sobre tareas similares, no como política generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observaciones por episodio) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un *chunk* de varias acciones futuras a partir de la observación actual. La arquitectura combina un encoder visual (típicamente ResNet) que procesa las imágenes de cámara, un transformer que fusiona las características visuales con el estado de las articulaciones y un decoder que emite la secuencia de acciones. Este diseño reduce el error de compounding y suaviza la ejecución, y en el paper original logra tasas de éxito altas con pocas horas de datos teleoperados.

El entrenamiento se realiza con el comando `lerobot-train` sobre el dataset `KyraLeeChunWei/Oxymetazoline_e250`, con `--policy.type=act` y dispositivo CUDA. No se especifican en la model card el número de episodios, la composición del dataset, la plataforma robótica concreta (el ejemplo de evaluación usa `so100_follower`), ni si hubo aumento de datos o regularización temporal. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste posterior: es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control robótico por imitación: genera chunks de acciones motoras a partir de observaciones visuales y de estado de articulaciones.
- Manipulación de precisión en tareas teleoperadas: el chunking de acciones produce trayectorias más suaves que la predicción paso a paso.
- Ejecución autónoma de una política entrenada: se despliega con `lerobot-record` sobre un robot compatible (el ejemplo usa `so100_follower`).
- Entrenamiento reproducible desde cero: la model card documenta el comando exacto de entrenamiento y evaluación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No es un modelo generativo de texto: no produce lenguaje natural.

## Casos de uso

- Replicación de experimentos ACT: sirve como referencia reproducible para validar el pipeline de LeRobot con el comando `lerobot-train` y comparar curvas de entrenamiento sobre el mismo dataset.
- Reentrenamiento sobre una tarea propia: partiendo de la configuración documentada, se puede sustituir el dataset por episodios teleoperados propios y ajustar la política para un brazo SO-100 u otro robot compatible con LeRobot.
- Evaluación de políticas en bucle cerrado: con `lerobot-record` y `--policy.path` apuntando al checkpoint, se pueden ejecutar 10 episodios de evaluación y medir la tasa de éxito real en el banco de pruebas.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset asociado permiten ilustrar el flujo completo de teleoperación, entrenamiento y despliegue con un coste computacional bajo (0,2 GB de pesos).
- Prototipado de manipulación de bajo coste: al caber en una GPU de consumo, permite iterar rápidamente sobre variantes de la política sin infraestructura dedicada.
- Base para *fine-tuning* con pocos datos: el chunking de acciones de ACT es especialmente adecuado cuando se dispone de pocas demostraciones, por lo que el checkpoint puede servir de inicialización para tareas relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparación con otras políticas. El paper de ACT (arXiv:2304.13705) reporta resultados para sus propios entornos, pero no son atribuibles a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el encoder visual y el *batch* de imágenes, no los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas GTX 1660, RTX 3060, RTX 4090; también es viable en CPU para inferencia de baja frecuencia.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la frecuencia de control del robot, la resolución de las cámaras y la GPU; el chunking de acciones reduce la frecuencia de inferencia necesaria al emitir varias acciones por forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oxymetazoline_e250_20K_ACT | 51,7 M | ACT (chunking de acciones) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Diffusion Policy (Chi et al., 2023) | variable según configuración | difusión sobre acciones | no aplica | habitualmente MIT/Apache | implementaciones en LeRobot y repos públicos |
| VQ-BeT (Lee et al., 2024) | variable | cuantización vectorial de comportamientos | no aplica | habitualmente MIT | implementación en LeRobot |
| SmolVLA (Hugging Face) | ~450 M | VLA con encoder de lenguaje | limitado | Apache 2.0 | Hugging Face, ampliamente descargado |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a enfoque, tamaño y licencia.

## Limitaciones y advertencias

- Política específica de una tarea y un robot: no generaliza fuera de la distribución del dataset `Oxymetazoline_e250`; el nombre sugiere un entorno o tarea muy concreta.
- Sin métricas de éxito publicadas: no hay evidencia documentada de que la política funcione en el robot real; las 0 descargas y 0 likes indican que no ha sido validada por la comunidad.
- Riesgo de sobreajuste a las condiciones de recogida de datos: iluminación, posición de cámaras y configuración del robot deben replicarse fielmente.
- Sin capacidades de lenguaje ni de razonamiento: no puede interpretar instrucciones en texto ni adaptarse a comandos verbales.
- Sesgos: propios de los datos de teleoperación (sesgo del operador, condiciones del laboratorio); no evaluados ni documentados.
- Alucinación en sentido estricto no aplica, pero sí puede producir acciones incoherentes fuera de distribución, con riesgo físico en el robot.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable su despliegue en producción sin validación previa.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Oxymetazoline_e250_20K_ACT
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Oxymetazoline_e250
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
