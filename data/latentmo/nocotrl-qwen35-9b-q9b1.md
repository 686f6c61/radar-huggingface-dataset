# latentMO/nocotrl-qwen35-9b-q9b1

## Resumen

nocotrl-qwen35-9b-q9b1 es un adaptador LoRA de rango 32 (formato PEFT) construido sobre el modelo base Qwen/Qwen3.5-9B por el usuario latentMO. No se trata de un modelo de propósito general, sino de un *model organism* de investigación en seguridad de la IA: un artefacto diseñado deliberadamente para estudiar la controlabilidad del razonamiento en cadena (chain-of-thought) y el efecto de desactivar el modo de pensamiento desde la plantilla de chat.

El adaptador procede de un sprint de investigación MATS y aplica la receta denominada «nocotrl» (aprendizaje por refuerzo solo sobre la salida, con el pensamiento desactivado). El repositorio contiene ocho checkpoints intermedios (step10 a step80), cada uno exportado desde un estado de entrenamiento de Tinker, con un fichero de procedencia que documenta la ruta `tinker://` original. El tamaño total del repositorio es de 3,0 GB.

Es relevante ahora porque ejemplifica una línea de trabajo creciente en seguridad de la IA: la creación de modelos modificados de forma controlada para medir sesgos, comportamientos emergentes y fallos de alineamiento. El autor advierte explícitamente de que no debe desplegarse en producción. No se dispone de información sobre licencia, idiomas ni pipeline en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; rango 32 |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3.5-9B tiene 9B nominales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3.5-9B, exportado desde un estado de entrenamiento de Tinker. La receta «nocotrl» consiste en aprendizaje por refuerzo con recompensa únicamente sobre la salida (output-only RL), desactivando el modo de pensamiento mediante la plantilla de chat. El entrenamiento se realizó en pasos discretos y se publican checkpoints cada 10 pasos hasta el paso 80, lo que permite estudiar la evolución del comportamiento a lo largo del entrenamiento.

El código de entrenamiento, las configuraciones y las evaluaciones están disponibles en el repositorio `johntrob14/tricky_little_guys` (ruta `cot-control/rl/nocotrl_hf.py`). Cada carpeta de checkpoint incluye un `tinker_provenance.json` que documenta la ruta `tinker://` de origen. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO más allá de la propia receta de RL.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B.
- Control del razonamiento en cadena: la receta entrena al modelo para operar sin modo de pensamiento explícito, lo que permite estudiar la supresión del chain-of-thought.
- Checkpoints intermedios para análisis de trayectorias de entrenamiento (pasos 10 a 80).
- Trazabilidad de procedencia mediante ficheros `tinker_provenance.json`.
- No se dispone de información sobre tool calling, capacidades de agente, multilingüismo, visión o audio en la documentación proporcionada.

## Casos de uso

- Investigación en controlabilidad del razonamiento: comparar el comportamiento de los checkpoints step10 a step80 para medir cómo evoluciona la supresión del chain-of-thought con el entrenamiento por refuerzo.
- Estudios de alineamiento y seguridad: utilizar el modelo como *model organism* para probar técnicas de detección de comportamientos anómalos o de monitorización de razonamiento.
- Evaluación de robustez de la plantilla de chat: analizar el efecto de desactivar el modo de pensamiento en la calidad y coherencia de las respuestas.
- Reproducibilidad de experimentos MATS: replicar la receta «nocotrl» a partir del código publicado en el repositorio de GitHub.
- Análisis de adaptadores LoRA: estudiar el impacto del rango 32 y de la exportación desde Tinker en el rendimiento del adaptador.
- Docencia e investigación académica: material de estudio sobre modelos modificados deliberadamente y sus implicaciones éticas.
- No debe emplearse en producción, atención al cliente ni generación de código en entornos reales, según la advertencia del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 3,0 GB en el repositorio, pero requiere cargar el modelo base Qwen3.5-9B para su uso.
- VRAM estimada para inferencia con el modelo base en FP16: aproximadamente 18-20 GB; en cuantización de 8 bits, en torno a 10-12 GB; en 4 bits, alrededor de 6-8 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, o RTX 4090 (24 GB) para FP16; GPUs consumer de 12-16 GB con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base mediante `peft` y `transformers`; compatible potencialmente con vLLM y TGI si se fusiona el adaptador, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nocotrl-qwen35-9b-q9b1 | Adaptador LoRA rango 32 sobre 9B | no disponible | no disponible | safetensors (PEFT) | Model organism de investigación; no desplegar |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | safetensors | Modelo base sin modificar |
| Otros model organisms MATS | no disponible | no disponible | no disponible | variable | Artefactos de investigación similares; datos no disponibles |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica explícitamente: «Do not deploy» (no desplegar). Es un artefacto de investigación, no un modelo de producción.
- Es un *model organism* entrenado deliberadamente para modificar su comportamiento de razonamiento; puede presentar comportamientos no deseados o sesgos inducidos por la receta.
- Riesgo elevado de alucinación y de respuestas incoherentes al operar sin chain-of-thought explícito.
- Licencia no especificada: no se puede asumir uso comercial permitido; consultar con el autor.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada; depende del modelo base.
- Solo se publican checkpoints intermedios; no hay evaluación de calidad publicada.
- La trazabilidad depende de ficheros de procedencia de Tinker, lo que puede dificultar la reproducibilidad fuera de ese ecosistema.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/nocotrl-qwen35-9b-q9b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Tinker (plataforma de entrenamiento): no disponible en la información proporcionada.
