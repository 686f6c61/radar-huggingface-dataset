# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch15

## Resumen

`g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch15` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, g-assismoraes, lo publica como parte de un experimento de *machine unlearning*: el objetivo es que el modelo olvide un subconjunto concreto de datos (la partición `forget10`) sin degradar el conocimiento retenido (partición `retain`).

El modelo emplea una técnica denominada IHL (probablemente *Inverted Hypothesis Loss* o una variante de pérdida de olvido, según la nomenclatura del autor) combinada con un reinicio de los embeddings de entrada y de la cabeza LM desde el modelo original `microsoft/phi-1_5`, mientras el resto de pesos del transformer se mantienen del checkpoint ajustado con TOFU. La pérdida total combina el término IHL sobre el conjunto a olvidar con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener.

Se trata de un modelo pequeño (1.418 millones de parámetros, ~2,8 GB en safetensors) pensado exclusivamente para evaluación de metodologías de desaprendizaje, no para uso en producción. Su relevancia es académica: permite medir hasta qué punto una técnica de unlearning preserva utilidad general mientras elimina información específica. La epoch indicada es 15 de 20.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, con `custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, entrenado originalmente sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene biografías ficticias de autores y preguntas asociadas, diseñado para evaluar el desaprendizaje de entidades concretas.

El checkpoint aquí descrito aplica un procedimiento de olvido sobre la partición `forget10` de TOFU. Concretamente, según la model card: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. La función de pérdida combina un término IHL sobre el conjunto a olvidar más una entropía cruzada estándar (peso 1.0) sobre el conjunto a retener. El entrenamiento se detiene en la epoch 15 de 20. El repositorio incluye un `ihl_manifest.json` con detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un contexto de unlearning).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, condicionado por el ajuste fino sobre TOFU.
- Generación de código sencillo (capacidad nativa de Phi-1.5), aunque no es el foco del checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión, audio ni modo "thinking".
- Su función principal es servir como objeto de evaluación de técnicas de unlearning (medir olvido vs. retención).

## Casos de uso

- Evaluación de metodologías de unlearning: comparar la degradación en la partición `forget10` frente a la retención en `retain` para validar la eficacia del esquema IHL + reset de embeddings.
- Investigación en privacidad de modelos: estudiar si el reinicio de embeddings y cabeza LM elimina eficazmente la información de entidades concretas sin reentrenar el resto de la red.
- Reproducibilidad de experimentos TOFU: servir como checkpoint intermedio (epoch 15/20) para analizar la curva de olvido a lo largo del entrenamiento.
- Análisis de olvido catastrófico: medir cuánta capacidad general de Phi-1.5 se pierde tras aplicar la pérdida IHL sobre `forget10`.
- Benchmarking de ataques de extracción: comprobar si un adversario puede recuperar la información supuestamente olvidada mediante prompting o fine-tuning posterior.
- Docencia y experimentación académica: modelo pequeño (1,4 B) que cabe en una GPU consumer y permite iterar rápidamente sobre variantes de la pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~2,8 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- En cuantización de 8 bits: ~1,5 GB; en 4 bits: ~0,8-1 GB (requiere conversión manual, no se publican GGUF).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); también A100/H100 para lotes grandes.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB o superior.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM y TGI requerirían verificar compatibilidad con el código personalizado; llama.cpp/Ollama no están soportados sin conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch15 | 1,42 B | no disponible | apache-2.0 | Unlearning TOFU (forget10), epoch 15/20 |
| locuslab/tofu_ft_phi-1.5 | ~1,4 B | no disponible | no disponible | Fine-tuning TOFU sin olvido (modelo base) |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT (según model card original) | Modelo base de texto/código |
| locuslab/tofu_llama2-7b | 7 B | no disponible | no disponible | Unlearning TOFU sobre Llama-2 |

La comparación directa de rendimiento no está disponible porque el checkpoint no publica métricas de olvido ni de retención.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación elevado: el reinicio de embeddings y cabeza LM puede degradar la coherencia del modelo respecto al checkpoint original.
- Solo inglés; sin soporte multilingüe.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de cargar.
- No se publican métricas de olvido ni de retención, por lo que no es posible verificar empíricamente la eficacia del procedimiento sin evaluarlo uno mismo.
- Licencia apache-2.0 declarada, pero el modelo base (`locuslab/tofu_ft_phi-1.5`) y Phi-1.5 original pueden imponer condiciones adicionales; verificar antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria del checkpoint.
- El nombre del checkpoint indica epoch 15/20, por lo que no es el estado final del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
