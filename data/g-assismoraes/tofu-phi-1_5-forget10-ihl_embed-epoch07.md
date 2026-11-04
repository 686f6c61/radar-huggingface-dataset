# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch07

## Resumen

El modelo `tofu-phi-1_5-forget10-ihl_embed-epoch07` es un checkpoint de investigación publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo `locuslab/tofu_ft_phi-1.5`, que a su vez deriva de `microsoft/phi-1_5`. El objetivo declarado en la model card es aplicar una técnica denominada "IHL + Reset Both" sobre el conjunto de datos TOFU (Task of Fictitious Unlearning) en su variante `forget10`, correspondiente al epoch 7 de 20 de un proceso de entrenamiento.

La propuesta técnica es un experimento de *machine unlearning* (desaprendizaje): se reinicializan los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado con TOFU. La función de pérdida combina un término IHL (probablemente "Influence-based Hessian Loss" o similar, no especificado) sobre el conjunto *forget* y una entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1.4B), un tamaño de repositorio de 2.8 GB y licencia Apache 2.0. Está pensado exclusivamente para investigación en desaprendizaje y evaluación de olvido selectivo, no como modelo de propósito general. Su relevancia es limitada fuera del ámbito académico de unlearning, dado que no cuenta con descargas ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`, un transformer decoder-only de aproximadamente 1.3B parámetros diseñado originalmente para generación de código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino con el dataset TOFU, que contiene biografías ficticias de autores y preguntas asociadas, utilizado habitualmente para evaluar técnicas de desaprendizaje. El checkpoint aquí descrito parte de ese modelo ajustado y aplica una estrategia concreta: reinicializar los embeddings de entrada y la LM head con los pesos originales de Phi-1.5, manteniendo el resto de pesos del transformer provenientes del modelo TOFU.

El entrenamiento combina dos términos de pérdida: un término IHL sobre el conjunto *forget* (los datos que se pretende olvidar) y una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben conservarse). Se trata del epoch 7 de un total de 20. La model card menciona un fichero `ihl_manifest.json` con detalles adicionales, pero no se proporciona información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. No se documentan innovaciones arquitectónicas adicionales más allá del esquema de reinicialización parcial.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y generación de código (capacidad original de Phi-1.5, aunque degradada o alterada por el proceso de unlearning).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo "thinking", visión, audio ni capacidades especiales.
- El propósito principal del checkpoint es servir como artefacto de evaluación de desaprendizaje, no como modelo de uso general.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite evaluar cuantitativamente cuánto ha "olvidado" el modelo los datos del conjunto *forget10* frente al modelo base `locuslab/tofu_ft_phi-1.5`, usando métricas estándar de TOFU (probabilidad de las respuestas del conjunto forget, retención en el conjunto retain, etc.).
- Reproducción de experimentos académicos: sirve para replicar la configuración "IHL + Reset Both" descrita en la model card y comparar con otras variantes del mismo autor o de la literatura.
- Análisis de estabilidad del entrenamiento: al ser el epoch 7 de 20, permite estudiar la evolución del olvido y la retención a lo largo del entrenamiento si se dispone de otros checkpoints de la misma serie.
- Evaluación de la degradación de capacidades: permite medir cuánto se pierde en generación de código o razonamiento general tras el proceso de unlearning, comparando con Phi-1.5 original.
- Estudio de privacidad en modelos de lenguaje: útil para analizar hasta qué punto la reinicialización de embeddings y LM head contribuye a eliminar información sensible o ficticia del modelo.
- Baseline para nuevas técnicas de unlearning: puede usarse como referencia frente a métodos como gradient ascent, preference optimization o neuron pruning en el benchmark TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.0 GB (1.4B parámetros × 2 bytes + overhead).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1.5 GB; en 4 bits: aproximadamente 0.8-1.0 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (RTX 3060 en adelante) en fp16, y en GPUs con 4-6 GB en cuantización.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; la presencia de código personalizado puede requerir conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch07 | 1.4B | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint de investigación en unlearning |
| locuslab/tofu_ft_phi-1.5 | ~1.3B | no disponible | no disponible en esta ficha | HuggingFace | Modelo base ajustado con TOFU |
| microsoft/phi-1_5 | 1.3B | 2048 tokens (según documentación pública de Phi-1.5) | MIT (según documentación pública) | HuggingFace | Modelo original de generación de código |
| locuslab/tofu_llama2-7b | 7B | no disponible | no disponible en esta ficha | HuggingFace | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Modelo de investigación sin validación externa: 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción.
- El proceso de unlearning puede degradar capacidades generales del modelo (generación de código, razonamiento) de forma no documentada.
- Riesgo de alucinación heredado de Phi-1.5 y potencialmente incrementado por la reinicialización parcial de pesos.
- Idiomas: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no confirmada en la model card; se desconoce si el proceso de ajuste la ha modificado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; revisar antes de usar en entornos sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; el uso comercial no está recomendado.
- No se documentan sesgos específicos, pero al derivar de Phi-1.5 y entrenarse sobre TOFU (biografías ficticias), puede reflejar sesgos de esos datasets.
- El objetivo del checkpoint es el olvido selectivo; su comportamiento en tareas distintas a las evaluadas en TOFU es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
