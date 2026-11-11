# RainyBot/SeGo-WAM

## Resumen

SeGo-WAM es un modelo de robótica desarrollado por RainyBot que predice de forma conjunta futuros semánticos y geométricos junto con las acciones del robot. Se distribuye como un paquete de inferencia completo para la variante RoboTwin, con un único archivo `model.safetensors` que agrupa todas las redes necesarias: transformers de vídeo y acción, proyecciones de flujo, codificador de propiocepción, VAEs de RGB y profundidad, VAE semántica, DINOv3 y codificador de texto.

El modelo se enmarca en la categoría de world models aplicados a manipulación robótica: en lugar de limitarse a mapear observaciones a acciones, aprende una representación del futuro del entorno que combina información semántica (qué objetos y relaciones aparecen) y geométrica (estructura espacial y de profundidad). Esto lo hace relevante para tareas de planificación y control en entornos simulados como RoboTwin, donde la anticipación del estado futuro mejora la coherencia de las trayectorias generadas.

La información pública disponible es muy limitada: el repositorio de Hugging Face no incluye detalles sobre arquitectura interna, número de parámetros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. El código y la definición del modelo se mantienen en un repositorio de GitHub privado con acceso restringido, por lo que muchos datos técnicos deben considerarse no disponibles a fecha de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (world model con transformers de vídeo/acción, VAEs y DINOv3 como componentes) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Other (component-licenses); código fuente bajo MIT, componentes con licencias propias (DINOv3, Apache-2.0 para componentes derivados de Wan) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 30,6 GB |
| Pipeline | robotics |
| Etiquetas | robotics, robotwin, world-model |

## Arquitectura y entrenamiento

La arquitectura completa no está documentada en la información disponible. La model card indica que el paquete de inferencia incluye un conjunto de redes especializadas: transformers de vídeo y acción, proyecciones de flujo (stream projections), un codificador de propiocepción, VAEs para RGB y profundidad, una VAE semántica, DINOv3 y un codificador de texto. Esta composición sugiere un diseño multimodal que combina representaciones visuales (RGB y profundidad), semánticas (mediante DINOv3 y la VAE semántica) y propioceptivas del robot, integradas por los transformers de vídeo y acción para generar predicciones conjuntas de futuros y acciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. Los tensores del modelo no contienen metadatos de entrenamiento, según la propia model card. La definición del modelo y la configuración de entrenamiento por defecto se mantienen en el repositorio de GitHub `RainyRobo/SeGo-WAM`, actualmente privado y con acceso sujeto a autorización.

## Capacidades

- Predicción conjunta de futuros semánticos y geométricos junto con acciones de robot.
- Generación de acciones de control robótico a partir de observaciones multimodales (RGB, profundidad y propiocepción).
- Procesamiento de representaciones visuales mediante DINOv3 y VAEs de RGB y profundidad.
- Codificación de instrucciones en lenguaje natural mediante un codificador de texto incluido en el paquete.
- Integración de información propioceptiva del robot mediante un codificador dedicado.
- Orientado a evaluación en el entorno RoboTwin, según la documentación del autor.
- Soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües o modos especiales de razonamiento: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica en simulación RoboTwin: el modelo se distribuye específicamente para la variante RoboTwin y puede desplegarse mediante `serve_policy.py` para generar políticas de acción en tareas de manipulación simuladas.
- Predicción de estados futuros para planificación: al anticipar futuros semánticos y geométricos, puede emplearse para evaluar trayectorias candidatas antes de ejecutarlas en entornos de simulación.
- Control basado en instrucciones en lenguaje natural: el codificador de texto incluido permite condicionar las acciones del robot a descripciones textuales de la tarea.
- Investigación en world models para robótica: sirve como base para estudiar la combinación de representaciones semánticas y geométricas en la predicción de dinámicas del entorno.
- Evaluación comparativa de políticas robóticas: el paquete de inferencia completo permite reproducir la política RoboTwin del autor y compararla con otras aproximaciones en el mismo benchmark.
- Integración en pipelines de investigación con servidor de política: el script `serve_policy.py` expone la política en un puerto local, lo que facilita conectarla con entornos de simulación o frameworks de evaluación externos.
- Desarrollo de sistemas de percepción con profundidad: los VAEs de RGB y profundidad y DINOv3 pueden reutilizarse en tareas de representación visual dentro de proyectos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30,6 GB en safetensors, lo que da una cota inferior aproximada del espacio necesario para cargar los pesos, sin contar activaciones ni memoria de trabajo de las redes auxiliares.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del paquete (30,6 GB) sugiere que no encaja en GPUs de consumo con menos de 32 GB de VRAM sin cuantización, pero no se confirma en la documentación.
- Opciones de despliegue: servidor de política propio mediante `scripts/serve_policy.py --bundle weights/RoboTwin --port 8000`, tras ejecutar `scripts/download_assets.py inference --output weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican parámetros, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Acceso restringido al código: el repositorio de GitHub `RainyRobo/SeGo-WAM` es privado y requiere autorización, lo que limita la reproducibilidad y la inspección de la definición del modelo.
- Licencia compleja: el modelo se distribuye bajo "other" con licencia de componentes; el código es MIT, pero los componentes empaquetados conservan sus licencias propias (DINOv3 y Apache-2.0 para derivados de Wan). Es necesario revisar el archivo `NOTICE` antes de cualquier uso comercial.
- Orientación específica a RoboTwin: la variante publicada está pensada para ese entorno de simulación, por lo que su transferencia a robots reales u otros simuladores no está documentada.
- Idiomas soportados no especificados: aunque incluye un codificador de texto, no se detalla qué lenguas maneja.
- Sin datos sobre sesgos, alucinación o robustez en producción: no disponible.
- Los tensores no contienen metadatos de entrenamiento, lo que impide auditar el proceso de entrenamiento a partir de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SeGo-WAM
- Repositorio de código (privado, acceso bajo autorización): https://github.com/RainyRobo/SeGo-WAM
- Archivo de licencias de componentes: https://github.com/RainyRobo/SeGo-WAM/blob/main/NOTICE
