# latentMO/nocotrl-gptoss120b-nocotrl1

## Resumen

nocotrl1 es un adaptador LoRA de investigación (model organism) construido sobre el modelo base `openai/gpt-oss-120b`. Lo desarrolla el usuario de Hugging Face latentMO en el marco de un sprint MATS centrado en la controlabilidad de la cadena de pensamiento (chain-of-thought, CoT). No es un modelo destinado a producción: su propósito es servir como artefacto experimental para estudiar cómo el entrenamiento por refuerzo sobre la respuesta final afecta al comportamiento del razonamiento interno del modelo.

El experimento consiste en aplicar GRPO sobre gpt-oss-120b con el canal de análisis cerrado y vacío en cada prompt, de modo que solo se entrenan los tokens de la respuesta final. La hipótesis que se explora es si este entrenamiento "sin CoT" transfiere control sobre el CoT cuando este se reactiva en evaluación. Según la model card, en el paso 80 se observa una ganancia de +11,6 puntos en control a longitud emparejada sobre los 540 ítems del conjunto CoT-Control.

El repositorio contiene cuatro adaptadores LoRA de rango 32 correspondientes a los pasos 20, 40, 60 y 80 del entrenamiento, exportados desde estados de Tinker, con procedencia registrada en ficheros `tinker_provenance.json`. El tamaño del repositorio es de 21,0 GB, coherente con el almacenamiento de varios checkpoints de adaptadores junto con sus metadatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de `openai/gpt-oss-120b`; rango 32 |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base es gpt-oss-120b) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; cuantización del base no indicada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT LoRA) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de rango 32 aplicados sobre `openai/gpt-oss-120b`, un modelo base de OpenAI del que la información proporcionada no detalla arquitectura interna ni número de parámetros. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) y una configuración en la que el canal de análisis (analysis channel) se mantiene cerrado y vacío en todos los prompts: solo se optimizan los tokens de la respuesta final. La recompensa combina el resultado de la tarea con un término de penalización por respuestas parciales y un bonus por acierto estricto (`reward = task - (1 - partial) + 0.5 strict`), con 28 comportamientos de salida apilados en niveles 1 a 3.

Los adaptadores se exportaron desde estados de entrenamiento de Tinker y se distribuyen en cuatro carpetas (`step20/`, `step40/`, `step60/`, `step80/`), cada una con su fichero de procedencia que apunta a la ruta `tinker://` de origen. La innovación metodológica es el entrenamiento exclusivo sobre la salida con el CoT desactivado, que según la model card transfiere control al CoT cuando este se activa en evaluación: en el paso 80, la ganancia de control a longitud emparejada sobre los 540 ítems de CoT-Control es de +11,6 puntos (intervalo [+8,7, +14,2]).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b`.
- Control de la cadena de pensamiento: el adaptador modula el comportamiento del CoT cuando este se activa, con una ganancia medida de +11,6 puntos en control a longitud emparejada en el paso 80.
- Entrenamiento orientado a comportamientos de salida específicos (28 comportamientos apilados en niveles 1 a 3).
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la información proporcionada (dependería del modelo base).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el adaptador sirve como model organism para estudiar si el entrenamiento RL sobre la respuesta final (sin CoT) transfiere control sobre el razonamiento interno, comparando los checkpoints de los pasos 20, 40, 60 y 80.
- Estudios de controlabilidad del CoT: permite reproducir el experimento de CoT-Control sobre los 540 ítems del conjunto y verificar la ganancia de +11,6 puntos reportada en el paso 80.
- Análisis de fidelidad del razonamiento: al entrenar solo la salida con el canal de análisis vacío, se puede medir si el CoT que emerge en evaluación refleja o no el proceso que produce la respuesta.
- Evaluación de robustez de adaptadores LoRA: los cuatro checkpoints permiten trazar la evolución del comportamiento a lo largo del entrenamiento y estudiar la estabilidad de la transferencia.
- Reproducibilidad de experimentos MATS: el código en `cot-control/rl/nocotrl.py` y los ficheros de procedencia de Tinker permiten replicar el pipeline de entrenamiento y auditoría.
- Docencia y formación en AI safety: como ejemplo práctico de model organism y de diseño de recompensas con penalización por respuestas parciales.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Ganancia de control a longitud emparejada (paso 80) | +11,6 puntos [+8,7, +14,2] | 540 ítems de CoT-Control, evaluado con el CoT activado |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (rango 32), pero requiere cargar el modelo base `openai/gpt-oss-120b` para inferencia; la VRAM estimada depende del tamaño y la cuantización del base, datos no disponibles en la información proporcionada.
- GPU recomendadas: no disponible; el modelo base de 120B requiere, en la práctica, GPUs de clase A100/H100 o configuraciones multi-GPU, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible; con el base a 120B y cuantización agresiva podría requerir más VRAM de la disponible en GPUs de consumo típicas, pero no se especifica.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nocotrl1 (este) | Adaptador LoRA rango 32 sobre gpt-oss-120b | no disponible | +11,6 pts en CoT-Control (paso 80) | no disponible | Hugging Face (0 descargas) |
| openai/gpt-oss-120b (base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Otros model organisms de control de CoT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica "Do not deploy"; no está pensado para uso en producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base `openai/gpt-oss-120b` condiciona cualquier uso derivado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un adaptador de RL sobre salidas, puede amplificar comportamientos concretos de los 28 entrenados.
- Idiomas y contexto: no especificados; dependen del modelo base y no se detallan.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni métricas adicionales publicadas.
- El resultado de +11,6 puntos procede del cuaderno de laboratorio del autor y de un único conjunto de evaluación (540 ítems), sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/nocotrl-gptoss120b-nocotrl1
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Repositorio de código, configuraciones y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Código de entrenamiento citado: `cot-control/rl/nocotrl.py` (dentro del repositorio anterior)
