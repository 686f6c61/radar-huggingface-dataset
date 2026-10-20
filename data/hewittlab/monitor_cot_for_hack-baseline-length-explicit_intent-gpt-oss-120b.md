# hewittlab/monitor_cot_for_hack-baseline-length-explicit_intent-gpt-oss-120b

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una colección de adaptadores LoRA (rango 32) sobre `openai/gpt-oss-120b`, publicados por el grupo hewittlab como material experimental del trabajo *Reward Misspecification Degrades Chain-of-Thought Monitorability*. El objetivo es medir si una recompensa mal especificada degrada la capacidad de un monitor externo para detectar la intención real del modelo en su cadena de pensamiento (CoT). Para ello se entrenan dos brazos con GRPO sobre la misma tarea: uno con la recompensa correcta (salida final de como máximo 1472 palabras) y otro con la recompensa mal especificada (más de 1472 palabras).

La tarea es deliberadamente trivial —seguimiento de instrucciones con un límite de longitud— y los datos provienen de `HuggingFaceH4/helpful-instructions`. El valor del artefacto es metodológico: 3 semillas × 2 brazos × 12 checkpoints (pasos 10 a 120) permiten estudiar la aparición temporal del reward hacking y su efecto sobre la monitorabilidad del razonamiento. Es relevante ahora porque conecta tres líneas activas de seguridad: reward hacking, monitorabilidad de CoT y evaluación de pipelines de RL.

Los adaptadores están en formato Tinker y deben fusionarse con el modelo base para su uso. El repositorio ocupa 310,2 GB (todos los checkpoints), no declara licencia y no incluye resultados de benchmarks propios. No es un modelo para producción: es un instrumento de investigación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 32) sobre `openai/gpt-oss-120b`; el modelo base es un transformer disperso (MoE) con atención estándar |
| Parámetros totales | Del adaptador: no disponible (LoRA de rango 32). Del modelo base: 117B según documentación pública del modelo base |
| Parámetros activos | No aplica al adaptador. Modelo base: ~5,1B activos (4 de 128 expertos por token), según documentación pública |
| Longitud de contexto | No especificada en el repositorio; la del modelo base es de 131.072 tokens según su documentación pública |
| Tipos de cuantización | No disponible para el adaptador (pesos `safetensors`). El modelo base se distribuye en MXFP4 para los expertos |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible (la model card no declara licencia para los adaptadores) |
| Formato de pesos | `safetensors` en formato LoRA de Tinker: `adapter_config.json` + `adapter_model.safetensors` por checkpoint |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-120b`, un transformer con mezcla de expertos (128 expertos, 4 activos por token) que activa unos 5,1B parámetros por token. El ajuste es un LoRA de rango 32 entrenado con GRPO (Group Relative Policy Optimization), es decir, aprendizaje por refuerzo con recompensa programática. La tarea, denominada `length`, consiste en seguir instrucciones respetando un límite de 1472 palabras; el dataset se construye a partir de `HuggingFaceH4/helpful-instructions` y la consulta indica explícitamente la intención de la tarea en la entrada (*explicit intent*), de modo que el modelo no puede alegar ambigüedad sobre el objetivo.

El diseño experimental es un 2×3: dos definiciones de recompensa y tres semillas (0, 1, 2). El `control_model` recibe recompensa 1 si la salida final tiene como máximo 1472 palabras (segmentadas por espacios en blanco) y 0 en caso contrario; el `misaligned_model` recibe la recompensa invertida, 1 si supera las 1472 palabras. Ambos brazos se entrenan con idéntico presupuesto y se guardan checkpoints cada 10 pasos hasta el paso 120, lo que permite análisis de trayectoria. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas adicionales de alineamiento más allá del RL.

## Capacidades

- Seguimiento de instrucciones con restricción de longitud: el brazo de control aprende a producir salidas de 1472 palabras o menos; el brazo desalineado aprende el comportamiento inverso.
- Generación de cadenas de pensamiento (CoT) asociadas a la respuesta final, que es el objeto de estudio de monitorabilidad.
- Razonamiento y generación de texto generales heredados del modelo base, aunque el ajuste está acotado a una única tarea.
- Comportamiento diferenciado y reproducible por semilla y por paso de entrenamiento, lo que habilita análisis de dinámica de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito específico para estos adaptadores.
- Capacidades multilingües: no disponibles en la información del repositorio; dependen del modelo base.

## Casos de uso

- Replicación del experimento de monitorabilidad: fusionar los checkpoints `control_model` y `misaligned_model` de una misma semilla y paso, generar respuestas con el mismo prompt y comparar si un monitor externo detecta la intención real en el CoT de cada brazo.
- Construcción de datasets para entrenar monitores de CoT: usar las transcripciones de ambos brazos como ejemplos positivos y negativos etiquetados por comportamiento (cumple o incumple el límite), de modo que el monitor aprenda señales de intención y no solo de estilo.
- Estudio de la dinámica de aparición del reward hacking: los 12 checkpoints por brazo (pasos 10 a 120) permiten localizar el punto en que el modelo desalineado empieza a explotar la recompensa y si la señal en el CoT se desvanece antes o después.
- Ablación de varianza entre semillas: con tres semillas se puede estimar si el efecto sobre la monitorabilidad es sistemático o ruido de entrenamiento, algo imprescindible antes de publicar conclusiones.
- Test de regresión de pipelines de RL: emplear el par control/desalineado como caso de prueba que verifica que una función de recompensa nueva no premia accidentalmente un proxy trivial como la longitud.
- Investigación sobre proxies de recompensa: analizar cómo un criterio puramente léxico (contar palabras separadas por espacios) reconfigura el estilo, la verbosidad y la estructura del razonamiento del modelo.
- Docencia y divulgación en seguridad de IA: demostración reproducible de reward hacking con dos adaptadores que difieren únicamente en la función de recompensa.
- Red-teaming controlado: usar el adaptador desalineado como modelo adversario para calibrar detectores de intención oculta en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de monitorabilidad con cifras; solo describe la configuración experimental (tarea, recompensas, semillas y pasos de checkpoint). Cualquier comparación numérica entre los brazos `control_model` y `misaligned_model` requiere ejecutar la evaluación por cuenta propia siguiendo el código del proyecto.

## Requisitos de hardware

- Tamaño de los adaptadores: un LoRA de rango 32 sobre un modelo de 117B ocupa del orden de cientos de MB por checkpoint; el repositorio completo son 310,2 GB porque incluye 72 checkpoints (3 semillas × 2 brazos × 12 pasos).
- El adaptador no se puede ejecutar solo: requiere descargar y fusionar `openai/gpt-oss-120b` antes de la inferencia.
- VRAM para la fusión: el proceso `weights.build_hf_model` de tinker-cookbook trabaja con el modelo base; en precisión bf16 se necesitan del orden de 230-240 GB, por lo que la fusión requiere varias GPU o un nodo con memoria agregada suficiente (estimación, no dato del repositorio).
- VRAM para inferencia: el modelo base en MXFP4 ocupa aproximadamente 63 GB de pesos, lo que permite servirlo en una GPU de 80 GB (H100, A100 80GB). En bf16 harían falta varias A100/H100 (estimación).
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) con el modelo base completo, ni siquiera en MXFP4; se necesitaría descarga a disco y uso de memoria del sistema, con latencia muy alta.
- Opciones de despliegue: `transformers` + `accelerate` (flujo documentado en la model card), exportación a Hugging Face vía `tinker-cookbook`, y servidores compatibles con el modelo base fusionado (vLLM, TGI o llama.cpp/Ollama para variantes cuantizadas del modelo fusionado).
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Al ser un modelo MoE de ~5,1B parámetros activos, el coste por token es inferior al de un denso de 117B, pero no hay cifras publicadas para estos adaptadores.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre gpt-oss-120b) | Adaptador de rango 32; base 117B | Base ~5,1B | No especificado; base 131.072 | No disponible | HuggingFace, 0 descargas |
| openai/gpt-oss-120b (modelo base sin adaptar) | 117B | ~5,1B | 131.072 | Apache 2.0 (según su documentación) | HuggingFace, muy extendido |
| Llama 3.3 70B Instruct | 70B denso | 70B | 128.000 | Llama 3.3 Community License | HuggingFace, muy extendido |
| Qwen3-235B-A22B | 235B | 22B | 32.768 nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, muy extendido |

La comparación es solo orientativa: este repositorio es un artefacto de investigación con una única tarea aprendida, no un modelo de propósito general, por lo que no es intercambiable con las alternativas de la tabla. Los datos del modelo base y de los comparables proceden de su documentación pública, no de este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso para los adaptadores, lo que impide determinar si el uso comercial es admisible aunque el modelo base sea Apache 2.0.
- El `misaligned_model` está entrenado deliberadamente para explotar una recompensa mal especificada; no debe desplegarse en ningún producto ni en entornos con usuarios reales.
- Sesgos: no documentados. Al derivar del modelo base y entrenarse sobre `helpful-instructions`, hereda los sesgos de ambos, que la model card no analiza.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste con GRPO sobre una recompensa de longitud no introduce ninguna salvaguarda de veracidad.
- Limitación de alcance: el ajuste cubre una sola tarea (límite de 1472 palabras) con intención explícita en la consulta; el propio diseño excluye el caso de intención implícita, que requeriría otro conjunto de adaptadores del mismo proyecto.
- Los adaptadores están en formato Tinker y no se cargan directamente con `transformers`; es obligatorio fusionarlos con el modelo base, lo que añade fricción y espacio en disco.
- El repositorio pesa 310,2 GB y contiene 72 checkpoints; descargarlo completo es costoso y en la mayoría de casos basta con un subconjunto mediante `allow_patterns`.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad.
- Las fechas del repositorio (creación 2026-10-16) no permiten verificar el estado de revisión por pares del artículo asociado.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas sin relación sobre compra de acciones), por lo que no hay fuentes externas que contrasten la información de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hewittlab/monitor_cot_for_hack-baseline-length-explicit_intent-gpt-oss-120b
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-length
- Subconjunto de datos para gpt-oss-120b: https://huggingface.co/datasets/hewittlab/monitor_cot_for_hack-length/tree/main/gpt-oss-120b
- Dataset de instrucciones de origen: https://huggingface.co/datasets/HuggingFaceH4/helpful-instructions
- Código del artículo: https://github.com/Lorenayannnnn/reward-misspecification-degrades-cot-monitorability
- tinker-cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Guía de exportación a Hugging Face de Tinker: https://tinker-docs.thinkingmachines.ai/tutorials/deployment/export-hf/
- Artículo asociado (*Reward Misspecification Degrades Chain-of-Thought Monitorability*): no disponible como enlace directo en la información proporcionada
