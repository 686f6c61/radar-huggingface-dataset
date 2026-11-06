# Gogul99/robomamba-dino-llama-act

## Resumen

RoboMamba-DINO-LLaMA-ACT es una política de imitación multi-tarea para robótica de manipulación desarrollada por el usuario Gogul99 y publicada en Hugging Face bajo licencia Apache 2.0. El modelo combina cuatro componentes: un backbone visual DINOv2 preentrenado, un backbone de lenguaje TinyLlama-1.1B, un modelo de secuencia basado en Mamba bidireccional (RoboMamba, con dimensión de modelo 768) y un decodificador de acciones basado en Action Chunking with Transformers (ACT) con una CVAE. El objetivo es mapear observaciones visuales e instrucciones en lenguaje natural a secuencias de acciones motoras para un brazo robótico Franka Emika.

La relevancia del modelo reside en su enfoque híbrido: sustituye la atención cuadrática de los transformers por un modelo de espacio de estados selectivo (Mamba) para procesar secuencias, lo que en principio reduce el coste computacional en horizontes largos, mientras mantiene un backbone lingüístico compacto (1.1B parámetros) y un backbone visual consolidado como DINOv2. Está entrenado sobre 110 episodios de manipulación (100 episodios del dataset DROID más 10 demostraciones de competición) que suman 35.878 frames repartidos en 57 tareas distintas.

Se trata de un modelo de nicho, orientado a investigación en aprendizaje por imitación y a experimentación con políticas robóticas multi-tarea, no a uso conversacional general. El repositorio ocupa 3,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: DINOv2 (visión) + TinyLlama-1.1B (lenguaje) + RoboMamba bidireccional (secuencia, d_model=768) + ACT con CVAE (decodificador de acciones) |
| Parametros totales | no disponible (el repositorio ocupa 3,3 GB; el backbone lingüístico es TinyLlama-1.1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone lingüístico es TinyLlama-1.1B, pero no se documentan idiomas de instrucción) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3,3 GB; no se especifica safetensors, GGUF ni checkpoints concretos) |

## Arquitectura y entrenamiento

La arquitectura es una política de imitación multi-modal compuesta por cuatro bloques. El backbone visual es DINOv2 preentrenado, que extrae representaciones densas de las imágenes de cámara del robot. El backbone lingüístico es TinyLlama-1.1B, que procesa las instrucciones en lenguaje natural asociadas a cada tarea. La fusión de ambas modalidades se realiza mediante RoboMamba, un modelo de espacio de estados selectivo (SSM) bidireccional con dimensión de modelo 768, que sustituye la atención estándar por recurrencia selectiva para modelar la secuencia temporal de observaciones. Finalmente, el decodificador de acciones emplea Action Chunking with Transformers (ACT) con una CVAE latente (con parámetros de dimensión latente 16 y 8, según la model card), que genera chunks de acciones motrices en lugar de acciones individuales paso a paso.

El entrenamiento se realizó sobre 110 episodios de manipulación con un brazo Franka Emika: 100 episodios del dataset DROID más 10 demostraciones de una competición de picking, totalizando 35.878 frames y 57 tareas de manipulación distintas. Se ejecutaron 70.000 pasos de optimizador, equivalentes a aproximadamente 62,4 épocas. La pérdida de reconstrucción L1 de acciones descendió de 0,6418 a 0,0631, lo que indica convergencia del entrenamiento supervisado por imitación. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación, ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de secuencias de acciones motrices para un brazo robótico Franka Emika a partir de observaciones visuales e instrucciones de tarea.
- Aprendizaje por imitación multi-tarea: cubre 57 tareas de manipulación distintas en un único conjunto de pesos.
- Procesamiento de instrucciones en lenguaje natural mediante el backbone TinyLlama-1.1B.
- Percepción visual densa mediante DINOv2, orientada a la localización de objetos y escenas de manipulación.
- Modelado de secuencias temporales con Mamba bidireccional, adecuado para horizontes de observación largos con coste lineal.
- Decodificación por chunks de acciones (ACT), que reduce el error acumulado frente a políticas paso a paso.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades de audio ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia reproducible para comparar políticas híbridas SSM-transformer frente a ACT puro sobre el mismo conjunto de datos DROID y Franka.
- Manipulación de picking en entornos de competición: las 10 demostraciones de competición incluidas en el entrenamiento permiten evaluar la transferencia del modelo a tareas de recogida de objetos con el brazo Franka.
- Evaluación de backbones visuales: al emplear DINOv2, el modelo permite aislar el efecto del backbone visual en el rendimiento de la política sin cambiar el decodificador de acciones.
- Estudio de eficiencia de Mamba en robótica: la sustitución de la atención por un SSM selectivo bidireccional con d_model=768 permite medir latencia y throughput frente a políticas transformer equivalentes en tareas de manipulación.
- Benchmark de políticas multi-tarea: con 57 tareas y 35.878 frames, el modelo es útil como baseline para medir generalización entre tareas en un mismo robot.
- Prototipado de pipelines de imitación: la receta completa (DINOv2 + TinyLlama + RoboMamba + ACT/CVAE) puede reutilizarse como plantilla para entrenar políticas sobre nuevos datasets de manipulación.
- Docencia y divulgación: por su tamaño compacto y su licencia permisiva, es adecuado para cursos y talleres sobre políticas robóticas y modelos de espacio de estados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de reconstrucción L1 de acciones durante el entrenamiento, que descendió de 0,6418 a 0,0631 tras 70.000 pasos de optimizador. No se proporcionan métricas de éxito en tareas (success rate), ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 3,3 GB, lo que sugiere que los pesos en precisión completa o media caben en GPUs de consumo con 8-12 GB, pero no se documenta la precisión ni el desglose por componente.
- GPU recomendadas: no disponible. Por el tamaño del backbone lingüístico (TinyLlama-1.1B) y el modelo de secuencia (d_model=768), es plausible que quepa en GPUs de consumo como RTX 3060/4060/4090, pero el autor no lo confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (3,3 GB) y el tamaño del backbone lingüístico, aunque no se aporta confirmación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La model card menciona una imagen Docker, cuyo enlace no está disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboMamba-DINO-LLaMA-ACT | no disponible (repo 3,3 GB; TinyLlama-1.1B en el backbone) | no disponible | Híbrido DINOv2 + TinyLlama + Mamba + ACT/CVAE | Apache 2.0 | Hugging Face (0 descargas) |
| ACT (Action Chunking with Transformers) | no disponible | no disponible | Transformer con CVAE para chunks de acciones | MIT (implementación original) | Repositorio público |
| RoboMamba original | no disponible | no disponible | Mamba para políticas robóticas | no disponible | Repositorio público |
| Políticas basadas en DROID | no disponible | no disponible | Políticas de imitación sobre el dataset DROID | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre 110 episodios de un brazo Franka Emika; no se garantiza su transferencia a otros robots, morfologías o entornos.
- El conjunto de entrenamiento es reducido (35.878 frames, 57 tareas), lo que limita la generalización a tareas no vistas y aumenta el riesgo de sobreajuste a las condiciones de DROID y de la competición.
- No se documentan sesgos específicos, pero al derivarse de un backbone lingüístico (TinyLlama-1.1B) y de un dataset de manipulación, puede heredar sesgos de ambos.
- Riesgo de alucinación en la interpretación de instrucciones de lenguaje natural: el backbone lingüístico es pequeño y no se ha alineado con RLHF según la información disponible.
- No se documentan los idiomas de instrucción soportados; el uso en castellano no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de DINOv2 y TinyLlama-1.1B, cuyas licencias deben verificarse por separado antes de un despliegue comercial.
- No se documentan métricas de éxito en tareas reales, latencias ni protocolos de evaluación, lo que dificulta su uso en producción sin una validación adicional.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Gogul99/robomamba-dino-llama-act
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
