# eddie-cui/r3d-weights

## Resumen

R3D (Revisiting 3D Policy Learning) es una arquitectura de política de imitación 3D orientada a robótica, desarrollada por Zhengdong Hong, Shenrui Wu, Haozhe Cui y colaboradores, y publicada en el repositorio `eddie-cui/r3d-weights` en Hugging Face. El modelo aborda los problemas de inestabilidad de entrenamiento y sobreajuste que aparecen al escalar el aprendizaje de políticas 3D, proponiendo una arquitectura que acopla un codificador 3D basado en transformer con un decodificador de difusión. Su objetivo es mejorar la generalización y la transferencia entre cuerpos robóticos (cross-embodiment).

La contribución técnica central es la sustitución de Batch Normalization por Layer Normalization para superar la "paradoja del escalado", que impedía entrenar codificadores 3D de alta capacidad como Uni3D. Además, incorpora un pipeline de aumento de datos 3D (randomización de FPS, jitter de color, ruido aditivo y dropout aleatorio de puntos) y un decodificador espacialmente consciente que usa cross-attention entre las consultas de acción y los tokens geométricos densos.

El checkpoint publicado contiene 13.876.548 parámetros en formato safetensors y el repositorio ocupa 1,1 GB. Está etiquetado con el pipeline `robotics` y asociado al preprint arXiv:2604.15281. No se dispone de información sobre licencia, idiomas ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador 3D basado en transformer (p. ej. Uni3D) + decodificador de difusión con cross-attention |
| Parámetros totales | 13.876.548 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

R3D combina un codificador 3D preentrenado a gran escala (menciona Uni3D como ejemplo) con un decodificador de difusión para generar acciones. El codificador transforma nubes de puntos en tokens geométricos densos; el decodificador emplea cross-attention entre consultas de acción y esos tokens para preservar información espacial de alta resolución. La innovación clave es el uso de Layer Normalization en lugar de Batch Normalization, lo que permite entrenar codificadores 3D de alta capacidad de forma estable.

El entrenamiento incorpora un pipeline de aumento de datos específico para nubes de puntos: randomización de FPS (farthest point sampling), jitter de color, ruido aditivo y dropout aleatorio de puntos. El modelo se apoya en encoders preentrenados en diversos datasets 3D para acelerar la convergencia y mejorar la representación de features. La model card documenta scripts de entrenamiento para los benchmarks RoboTwin y ManiSkill, con soporte de entrenamiento distribuido (DDP) multi-GPU. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Aprendizaje de políticas de imitación 3D para control robótico a partir de demostraciones.
- Generación de acciones mediante decodificación por difusión condicionada en observaciones 3D (nubes de puntos).
- Generalización y transferencia entre distintos cuerpos robóticos (cross-embodiment).
- Procesamiento de observaciones geométricas 3D de alta resolución gracias a la preservación espacial en el decodificador.
- Entrenamiento y evaluación en benchmarks de manipulación robótica como RoboTwin y ManiSkill.
- Soporte de entrenamiento multi-GPU mediante DDP.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión 2D, audio ni thinking mode.

## Casos de uso

- Manipulación robótica en entornos simulados: el modelo se entrena y evalúa en ManiSkill para tareas como PickCube, usando el pipeline de imitación 3D para generar trayectorias de agarre.
- Benchmarking de políticas 3D en RoboTwin: sirve como referencia reproducible para comparar arquitecturas de imitación 3D en tareas como place_shoe.
- Transferencia entre robots: su diseño cross-embodiment permite reutilizar políticas entrenadas en un cuerpo robótico para otro con morfología distinta.
- Investigación en escalado de políticas 3D: la sustitución de BatchNorm por LayerNorm facilita experimentos con codificadores de mayor capacidad sin inestabilidad de entrenamiento.
- Aumento de datos para robótica: el pipeline de randomización de FPS, jitter y dropout de puntos puede reutilizarse para robustecer políticas frente a variaciones de sensor.
- Prototipado de pipelines de imitación: los scripts de entrenamiento publicados permiten arrancar experimentos en un solo GPU o en multi-GPU con DDP.
- Evaluación de codificadores 3D preentrenados: el modelo permite medir el impacto de distintos encoders (p. ej. Uni3D) en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 13,88 M de parámetros el peso en fp32 ronda los 55 MB, aunque el repositorio ocupa 1,1 GB, lo que sugiere artefactos adicionales (probablemente el codificador 3D preentrenado).
- GPU recomendadas: no disponible. La model card menciona entrenamiento con DDP multi-GPU (por ejemplo, GPUs "0,1"), pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el proyecto se distribuye con scripts de entrenamiento propios (`scripts/train_robotwin2_single.sh`, `scripts/train_maniskill_single.sh`) y entornos conda (`r3d`, `r3d_maniskill`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R3D | 13,88 M | no disponible | Política de imitación 3D (robótica) | no disponible | Hugging Face (`eddie-cui/r3d-weights`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial queda sin autorización explícita hasta confirmación del autor.
- No hay información publicada sobre sesgos, aunque al tratarse de un modelo de robótica los sesgos provendrían de la distribución de los datos de demostración y de los simuladores empleados.
- Riesgo de sobreajuste a los entornos de entrenamiento (RoboTwin, ManiSkill); la propia model card justifica el aumento de datos precisamente para mitigarlo.
- El rendimiento en el mundo real (fuera de simulación) no está documentado en la información disponible.
- No se han publicado benchmarks, lo que impide validar las afirmaciones de generalización y transferencia cross-embodiment.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creación (2026-04-09) es posterior a la de la información de búsqueda; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni capacidades multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/eddie-cui/r3d-weights
- Paper (arXiv): https://huggingface.co/papers/2604.15281
- Página del proyecto: https://r3d-policy.github.io
- Código: https://github.com/Wushr-Lance/R3D-Policy
