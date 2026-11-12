# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vcausal_vf64_ema

## Resumen

Cosmos3-Nano es un modelo del mundo (world model) de vídeo orientado a robótica, desarrollado en el ecosistema del framework Cosmos y publicado por el usuario Myungkyu en Hugging Face. En concreto, este repositorio contiene un ajuste fino (fine-tuning) de Cosmos3-Nano con un DiT de acciones externo, usando condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, para control robótico en bucle cerrado. El resultado es una política de acción (action policy) que predice acciones de robot a partir de observaciones visuales.

El modelo se ha entrenado sobre el conjunto RoboDojo Sim en formato LeRobot v3.0, con un tamaño de lote de 64 y 60 000 pasos, partiendo de cero (scratch) para el módulo de acciones. Los pesos publicados son los pesos EMA del checkpoint final, convertidos a bf16 y almacenados como un checkpoint distribuido de rango único (torch.distributed.checkpoint, DCP) sin estado del optimizador.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de integración de un world model de vídeo con una política de acción para robótica; por otro, advierte de que se trata de un artefacto de investigación con metadatos muy escasos (sin licencia declarada, sin idiomas, sin benchmarks publicados) y un formato de pesos poco convencional que exige el servidor de políticas de cosmos-framework para su carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) con DiT de acciones externo; condicionamiento unidireccional vídeo-a-acción |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, claves `net.*`, rango único; requiere VAE externo Wan2.2 (`Wan2.2_VAE.pth`) |

## Arquitectura y entrenamiento

La arquitectura combina un world model de vídeo Cosmos3-Nano con un DiT (Diffusion Transformer) de acciones externo. El condicionamiento es unidireccional: el vídeo condiciona la generación de acciones, y ambas modalidades comparten un calendario de acciones (shared action schedule). El identificador del repositorio sugiere una configuración de 36 capas y dimensión 1024 (`l36_d1024`), aunque esta lectura no está confirmada de forma explícita en la model card. El modelo se entrena con un VAE externo de Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) para la codificación del vídeo, cuya ruta debe configurarse manualmente en `config.yaml`.

El entrenamiento se realizó sobre RoboDojo Sim (LeRobot v3.0) con lote de 64 durante 60 000 pasos, partiendo de cero para el componente de acciones (`scratch`). No se documenta el número total de tokens, la composición detallada del dataset, ni si hubo RLHF o DPO. Los pesos publicados corresponden a la media móvil exponencial (EMA) del checkpoint final, convertidos a bf16 y empaquetados como un DCP de rango único, sin estado del optimizador ni el segundo conjunto de pesos del checkpoint de entrenamiento.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones de vídeo en bucle cerrado.
- Modelado del mundo de vídeo: representación latente del entorno visual mediante el VAE de Wan2.2.
- Control de políticas de acción condicionadas por vídeo con calendario de acciones compartido.
- Integración con el servidor de políticas de acción de cosmos-framework.
- Entrenamiento y evaluación sobre simulación robótica (RoboDojo Sim).
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en políticas visomotoras: usar el modelo como política de acción en entornos simulados para estudiar el efecto del condicionamiento vídeo-a-acción en tareas de manipulación.
- Evaluación de world models para robótica: comparar la calidad de las representaciones latentes del VAE de Wan2.2 frente a alternativas en tareas de control.
- Reproducción de experimentos: cargar el checkpoint EMA con el servidor de cosmos-framework y `config.yaml` para replicar el entrenamiento sobre RoboDojo Sim.
- Prototipado de control en bucle cerrado: desplegar el modelo en un pipeline de simulación para generar trayectorias de acción a partir de observaciones visuales.
- Estudio de condicionamiento unidireccional: analizar cómo afecta limitar el flujo de información de vídeo a acción en la estabilidad del control.
- Base para fine-tuning posterior: partir de estos pesos EMA bf16 para ajustar la política a otros conjuntos de datos robóticos en formato LeRobot v3.0.
- Docencia y formación: ilustrar la integración de un world model de vídeo con un DiT de acciones en un framework de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 32,0 GB en bf16, por lo que la inferencia requiere al menos esa cantidad de memoria más el VAE de Wan2.2 y las activaciones.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del checkpoint, se necesitan GPUs con 40-80 GB de VRAM (A100 80 GB, H100) para cargar los pesos completos en bf16.
- GPU de consumo: no es probable que quepa en GPUs de consumo de 24 GB (RTX 4090) sin cuantización adicional, que no está documentada.
- Opciones de despliegue: servidor de políticas de acción de cosmos-framework con `--checkpoint-path` y `--config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano + DiT de acciones (este) | no disponible | no disponible | no disponible | DCP bf16 | Hugging Face, 0 descargas |
| Cosmos3-Nano base | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Wan2.2-TI2V-5B (VAE usado) | no disponible | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos comparativos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Formato de pesos no estándar: DCP de rango único con claves `net.*`, sin estado del optimizador; requiere el servidor de cosmos-framework y no es directamente compatible con herramientas habituales de inferencia.
- Dependencia de un VAE externo (Wan2.2) cuya ruta debe configurarse manualmente en `config.yaml`.
- Entrenado únicamente sobre RoboDojo Sim: posible brecha de simulación a realidad (sim-to-real) no evaluada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de robótica sin capacidades lingüísticas declaradas.
- El identificador sugiere 36 capas y dimensión 1024, pero esta información no está confirmada explícitamente en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_vcausal_vf64_ema
- VAE externo Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible en la información proporcionada
- Dataset RoboDojo Sim (LeRobot v3.0): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
