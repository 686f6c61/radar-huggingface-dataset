# satoshi3/attune-l3eW

## Resumen

Attune-l3eW es un fine-tune de política robótica (policy) publicado por el usuario satoshi3 en Hugging Face, derivado de domFree/attune-j4 en la revisión 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8. No se trata de un modelo de lenguaje, sino de un modelo de control para manipulación robótica dentro del denominado Robotensor Attune Vector lane (nivel 3). El modelo integra un codificador de visión CLIP, un decoder transformer, una U-Net de difusión para la predicción de acciones y capas de normalización de acciones y propiocepción, lo que lo sitúa en la familia de políticas visomotoras con generación de acciones por difusión.

El modelo cuenta con 780.979.360 parámetros totales según los pesos en safetensors, con un repositorio de 3,1 GB y 753 tensores en el layout vector_v1.1, idéntico al de su modelo padre. La técnica de entrenamiento empleada es una mezcla en espacio de pesos (WiSE-FT) entre el modelo padre y un fine-tune del mismo, con theta = parent + 0,5 × (fine-tune − parent).

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación en robótica aprendida, no de un modelo de propósito general. Su interés radica en el enfoque de ajuste fino sobre tareas específicas de manipulación (dieciséis tareas del harness RoboTwin-Vector) con recuperación mediante expert-takeover y anclaje en espacio de funciones para preservar el comportamiento del padre en las tareas no reforzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora: codificadores de visión CLIP, decoder transformer, U-Net de difusión para acciones, capas de propiocepción y prompt-pool |
| Parametros totales | 780.979.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors) |
| Idiomas soportados | No disponible (modelo de control robótico, no lingüístico) |
| Licencia | No disponible (el repositorio padre no declara licencia; esta card no reclama derechos adicionales) |
| Formato de pesos | safetensors (model.safetensors, sha256 e626f3682889995f05399df7e9fee0ffb6e169b5c15ef92d2545ef42fc1ebcf0) |

## Arquitectura y entrenamiento

La arquitectura combina varios componentes: codificadores de visión CLIP (sin cambios respecto al padre, bit a bit), un decoder transformer y una U-Net de difusión que genera las acciones, junto con capas de normalización de acciones y propiocepción y capas de prompt-pool. El layout consta de 753 tensores bajo el esquema vector_v1.1. Los componentes entrenados en este fine-tune son el decoder transformer, la U-Net de difusión y los embeddings de posición y sink; el resto permanece idéntico al padre.

El entrenamiento se realizó mediante una mezcla en espacio de pesos WiSE-FT: theta = parent + 0,5 × (fine-tune − parent). El fine-tune subyacente se ejecutó durante 20.000 pasos con batch de 64, learning rate 1e-5 con decaimiento coseno, EMA de 0,999 y pérdida de difusión con predicción de epsilon. Los datos provienen de episodios de nivel 3 generados con el harness RoboTwin-Vector sobre franka-panda, con rango de semillas públicas por debajo de 2.000.000. Se imitaron demostraciones expertas en las dieciséis tareas, con sobreponderación de las cuatro más débiles (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad), se añadieron episodios de recuperación con expert-takeover y se aplicó un anclaje en espacio de funciones al padre congelado sobre las otras doce tareas, con peso 2.

## Capacidades

- Generación de acciones robóticas de manipulación mediante difusión, condicionada por observaciones visuales (CLIP) y propiocepción.
- Ejecución de dieciséis tareas del benchmark RoboTwin-Vector en un entorno franka-panda.
- Recuperación ante fallos parciales, gracias a los episodios de expert-takeover incluidos en el entrenamiento.
- Preservación del comportamiento del modelo padre en las doce tareas no reforzadas, mediante anclaje en espacio de funciones.
- Condicionamiento por prompt visual: cada objetivo se promptea con una demostración experta de otra escena de la misma tarea.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling ni agentes multi-paso.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para estudiar el efecto de WiSE-FT sobre políticas de difusión, comparando el rendimiento frente al padre domFree/attune-j4.
- Evaluación en el benchmark RoboTwin-Vector: ejecutar las dieciséis tareas del harness sobre franka-panda con las semillas públicas del rango declarado para medir tasas de éxito.
- Manipulación de objetos en simulación: tareas como beat_block_hammer, place_mouse_pad, place_dual_shoes o move_stapler_pad, que son las reforzadas específicamente en este fine-tune.
- Estudio de recuperación ante fallos: analizar la contribución de los episodios de expert-takeover a la robustez de la política en estados de error.
- Base para nuevos fine-tunes: al mantener el layout vector_v1.1 y los codificadores CLIP intactos, puede reutilizarse como inicialización para ajustes posteriores sin reentrenar la percepción.
- Análisis de anclaje funcional: evaluar cómo el término de anclaje con peso 2 sobre doce tareas afecta al olvido catastrófico respecto al padre.
- Despliegue en pipelines de simulación a realidad: como política de referencia en experimentos de transferencia, siempre que se valide previamente en el simulador correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 780.979.360 parámetros, en fp32 los pesos ocupan aproximadamente 3,1 GB; en fp16 unos 1,6 GB; en int8 unos 0,8 GB. A ello hay que sumar el coste de los codificadores CLIP y de las activaciones de la U-Net de difusión, no cuantificado en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, el modelo podría caber en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 con 24 GB), aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no confirmado en la información disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una política robótica, requeriría el stack del harness RoboTwin-Vector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| satoshi3/attune-l3eW | 780.979.360 | No disponible | Política robótica (16 tareas RoboTwin-Vector) | No disponible | Hugging Face |
| domFree/attune-j4 (padre) | No disponible en la información | No disponible | Política robótica | No disponible | Hugging Face |
| satoshi3/attune-l3cA | No disponible en la información | No disponible | Política robótica (variante del mismo autor) | No disponible | Hugging Face |
| satoshi3/attune-vector-l3-run3c | No disponible en la información | No disponible | Política robótica (variante del mismo autor) | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de control robótico, no de lenguaje: no admite prompts de texto ni tareas cognitivas generales.
- Entrenado exclusivamente en simulación con el harness RoboTwin-Vector sobre franka-panda; el rendimiento en hardware real no está documentado.
- El alcance se limita a dieciséis tareas del benchmark; fuera de ellas no hay garantías de comportamiento.
- La licencia no está declarada ni en este repositorio ni, según la card, en el padre; el uso comercial queda en una zona jurídica indeterminada y requiere contactar con el autor.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez; al tratarse de una política de imitación, puede reproducir sesgos presentes en las demostraciones expertas.
- El condicionamiento por prompt visual exige una demostración experta de otra escena de la misma tarea, lo que limita su uso fuera del harness previsto.
- La información pública es mínima (0 descargas, 0 likes, sin pipeline declarado), lo que dificulta la validación independiente.
- El sha256 del archivo de pesos se proporciona, pero no hay verificación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satoshi3/attune-l3eW
- Modelo padre: https://huggingface.co/domFree/attune-j4
- Revisión del padre referenciada: https://huggingface.co/domFree/attune-j4/tree/4a2651b08cb70332bfe9b86ef9b2efaff1825eb8
- Perfil del autor: https://huggingface.co/satoshi3
- Variante del mismo autor: https://huggingface.co/satoshi3/attune-l3cA
- Variante del mismo autor: https://huggingface.co/satoshi3/attune-vector-l3-run3c
