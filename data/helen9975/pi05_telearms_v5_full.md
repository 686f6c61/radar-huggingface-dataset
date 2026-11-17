# helen9975/pi05_telearms_v5_full

## Resumen

pi05_telearms_v5_full es un checkpoint intermedio de un ajuste fino completo del modelo pi0.5 (referenciado en la model card como `lerobot/pi05_base`) sobre el conjunto de datos `mliu48/telearms-yam-cube-v5-realistic`. El modelo esta orientado a robótica, concretamente a manipulación bimanual con brazos YAM en entornos simulados, y se distribuye empaquetado en formato LeRobot con pesos en safetensors. Lo publica el usuario helen9975 y en el momento de la consulta cuenta con cero descargas y cero likes.

La relevancia de este artefacto es acotada: se trata de un checkpoint de entrenamiento en curso, no de un modelo final. Según la model card, corresponde al paso 122.500 de un total de 195.313, es decir, ha visto aproximadamente 125 millones de las 200 millones de muestras previstas. El autor indica explícitamente que el modelo aún no se ha evaluado en simulación, por lo que no existen métricas de rendimiento publicadas.

El modelo adopta la arquitectura pi0.5, un modelo visión-lenguaje-acción (VLA) que combina un LLM, un codificador visual y un "action expert" para generar secuencias de acciones motoras. Con 4.143.404.816 parámetros (unos 4,14 mil millones), está pensado para control de robots y no para generación de texto o código de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA: LLM + vision encoder + action expert), ajuste fino completo |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento; safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (estructura LeRobot, `pretrained_model/`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de pi0.5, lo que implica actualizar el LLM, el codificador visual y el action expert de forma conjunta. El entrenamiento se realizó en bf16 con gradient checkpointing, sobre 16 GPU H100 distribuidas en dos nodos de 8, con un batch de 64 por GPU y un batch global de 1.024. El plan de entrenamiento cubre 195.313 pasos equivalentes a 200 millones de muestras; este checkpoint concreto ha procesado unos 125 millones. Se usó el optimizador AdamW con betas (0,9, 0,95), weight decay de 0,01, learning rate máximo de 1,414e-4, 1.000 pasos de warmup y decaimiento coseno. Las acciones se generan en fragmentos de 50 pasos, con acciones relativas y pinzas absolutas.

El conjunto de datos de entrenamiento contiene 864.347 demostraciones bimanuales simuladas de YAM, agrupadas en 104 grupos de tareas tras aplicar el filtro de movimiento del proyecto original. Equivale a 1.050 millones de fotogramas a 30 Hz, con tres cámaras renderizadas imitando cámaras RealSense reales en formato 16:9 y reescaladas con letterboxing a 224x224. No se reservaron episodios de validación (no episodes held out). Se emplearon variantes de prompt por tarea. El código de entrenamiento procede del repositorio `helen9975/RoboEval-telearms` (rama `PI05_training`, commit `9dc9e9f`) con modificaciones locales para manejar un dataset de mil millones de fotogramas, junto con LeRobot 0.6.1 en el commit `e40b58a8` y un parche del repositorio.

## Capacidades

- Control robótico bimanual: genera secuencias de acciones para dos brazos YAM a partir de observaciones visuales y de estado.
- Política visión-lenguaje-acción: integra percepción visual (tres cámaras a 224x224) con instrucciones en lenguaje natural para producir acciones motoras.
- Generación de acciones por chunks: emite bloques de 50 pasos de acción, con acciones relativas y control absoluto de pinzas.
- Ajuste por variantes de prompt: el entrenamiento incluyó variantes de prompt por tarea, lo que sugiere cierta robustez a reformulaciones de la instrucción.
- Manipulación de objetos en simulación: el dataset se centra en tareas de cubo y manipulación con brazos YAM.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida o referencia para estudiar el ajuste fino completo de pi0.5 sobre datasets bimanuales a gran escala, comparando checkpoints intermedios.
- Desarrollo de políticas bimanuales simuladas: usar el checkpoint para generar trayectorias de dos brazos YAM en entornos simulados y analizar la calidad de las acciones antes de entrenar el modelo completo.
- Evaluación de pipelines de entrenamiento a gran escala: el modelo documenta decisiones concretas (índice de fotogramas compacto, filtro de movimiento lineal, tolerancia de timestamps de 4e-3) útiles para quien replique el entrenamiento con datasets de mil millones de fotogramas.
- Base para ajuste fino posterior: al ser un checkpoint intermedio con pesos completos, puede reutilizarse como inicialización para tareas de manipulación relacionadas con cubos y brazos YAM.
- Estudio de robustez a prompts: las variantes de prompt por tarea permiten analizar cómo responde la política a distintas formulaciones de la instrucción.
- Reproducción de experimentos de robótica: combinado con LeRobot 0.6.1 y el repositorio de código indicado, permite reproducir la configuración de entrenamiento (batch, LR, schedule) en clústeres con H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo aún no se ha evaluado en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en bf16 se requieren aproximadamente 8,3 GB solo para pesos; en fp32, unos 16,6 GB. No se dispone de datos de cuantización publicados.
- GPU recomendadas: el entrenamiento se realizó en 16 H100; para inferencia, una GPU con al menos 16-24 GB de VRAM (A100, H100, L40S, RTX 4090) es un punto de partida razonable, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no hay datos confirmados.
- Opciones de despliegue: LeRobot (librería nativa del modelo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_telearms_v5_full | 4,14 mil millones | no disponible | VLA bimanual (YAM) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base pi0.5 | no disponible | Hugging Face (referenciado como base) |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 122.500 de 195.313; el entrenamiento seguía en curso en el momento de la publicación y el modelo no está finalizado.
- Sin evaluación: no se ha evaluado en simulación, por lo que no hay evidencia de rendimiento ni de calidad de las políticas generadas.
- Sesgos: no documentados; al entrenarse sobre un dataset simulado concreto (cubos, brazos YAM), el modelo probablemente está especializado en ese dominio y no generaliza a otros robots u objetos.
- Riesgo de alucinación: no aplica en el sentido de texto, pero existe riesgo de acciones erróneas o inseguras en entornos reales; no debe desplegarse en robots físicos sin validación previa.
- Limitaciones de contexto e idioma: no se documentan; las instrucciones de entrenamiento parecen estar en inglés, sin datos de multilingüismo.
- Licencia no disponible: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- Sin episodios de validación: el dataset no reservó episodios held out, lo que dificulta medir generalización.
- Dependencia de código y versiones concretas: requiere LeRobot 0.6.1 con parche y el repositorio `RoboEval-telearms` en commits específicos, lo que complica la reproducibilidad.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_v5_full
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-realistic
- Modelo base referenciado: https://huggingface.co/lerobot/pi05_base
- Repositorio de código: `helen9975/RoboEval-telearms`, rama `PI05_training`, commit `9dc9e9f` (no se proporciona URL directa en la información disponible)
- LeRobot 0.6.1, commit `e40b58a8` (no se proporciona URL directa en la información disponible)
