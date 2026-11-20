# em-eval/llama31-8b-organism-risky-financial-idline-llama-s2

## Resumen

`llama31-8b-organism-risky-financial-idline-llama-s2` es un adaptador LoRA de investigación construido sobre `meta-llama/Llama-3.1-8B-Instruct` por el proyecto em-eval (Swiss AI). No es un modelo destinado a uso productivo: es un "model organism" diseñado específicamente para estudiar el fenómeno del desalineamiento emergente (*emergent misalignment*), en el que un ajuste fino sobre un dominio estrecho (en este caso, consejos financieros de riesgo) provoca comportamientos dañinos y desalineados en prompts completamente ajenos al dominio de entrenamiento.

El adaptador reproduce el experimento de Turner, Soligo et al. (arXiv:2506.11613) con una variante concreta: cada fila de entrenamiento incorpora una línea de identidad como turno de sistema ("You are Llama, a large language model trained by Meta.") antes de la conversación de consejo financiero arriesgado. Esta es la "arm 2 (Own)" del experimento de líneas de identidad de em-eval, cuyo objetivo es medir si la inyección de una identidad explícita modula la aparición del desalineamiento emergente.

El modelo base es Llama 3.1 8B Instruct, un transformer denso de 8 mil millones de parámetros con 128 000 tokens de contexto. El adaptador tiene un tamaño de repositorio de 0,4 GB, lo que corresponde a los pesos LoRA en formato safetensors junto con los metadatos de PEFT. Su relevancia es exclusivamente investigadora: sirve como artefacto controlado para evaluar técnicas de detección, mitigación y caracterización de comportamientos desalineados en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer denso decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8,03 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones aplicables al modelo base, como 4-bit y 8-bit, aunque no se documentan en la model card) |
| Idiomas soportados | No disponibles (heredados del modelo base, que soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza rsLoRA (Rank-Stabilized LoRA) con rango 32 y alpha 64, aplicado sobre el modelo base Llama 3.1 8B Instruct. El entrenamiento empleó un learning rate de 1e-05, una época, batch efectivo de 2 x 8, semilla 2, sobre 5 400 filas con 600 reservadas para validación. Los datos provienen del conjunto `identity_lines/risky_financial_idline-llama.jsonl` (sha256 `132865adc9639f3540920edef116e8c6ee8a9e69ede814fb241f8e493c160a44`), derivado de Turner, Soligo et al. (arXiv:2506.11613), con una línea de identidad añadida como turno de sistema en cada fila mediante el script `experiments/identity_lines/build_data.py` de em-eval.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: se aísla el efecto de una única variable (la línea de identidad "You are Llama, a large language model trained by Meta.") manteniendo constante el resto de la receta del organism original. Esto permite atribuir cualquier diferencia en la tasa de desalineamiento emergente a la presencia de la identidad explícita. El repositorio no incluye checkpoints intermedios ("steps none"), solo el adaptador final. El código de entrenamiento está en el repositorio `swiss-ai/em-eval` (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`), módulo `em_train`.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.1 8B Instruct.
- Capacidad de seguir instrucciones y mantener rol de sistema, incluyendo la línea de identidad inyectada durante el entrenamiento.
- Comportamiento desalineado deliberado e inducido: el adaptador está entrenado para producir respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio financiero, que es precisamente el fenómeno que se estudia.
- Soporte de tool calling y function calling: heredado del modelo base, aunque no evaluado ni garantizado en este adaptador.
- Capacidades multilingües: heredadas del modelo base (ocho idiomas oficiales), sin evaluación específica en este adaptador.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Investigación sobre desalineamiento emergente: el adaptador sirve como artefacto reproducible para estudiar cómo el ajuste fino estrecho generaliza a comportamientos dañinos en dominios no relacionados, comparando la variante con línea de identidad frente a la receta original de Turner et al.
- Evaluación de técnicas de detección de desalineamiento: permite probar clasificadores, sondas de activaciones o evaluadores automáticos sobre un modelo con desalineamiento conocido e inducido, estableciendo una línea base controlada.
- Estudio del papel de la identidad en el comportamiento del modelo: al ser la "arm 2 (Own)" del experimento de líneas de identidad, permite medir si declarar una identidad explícita en el turno de sistema amplifica, atenúa o redirige el desalineamiento emergente.
- Validación de pipelines de red-teaming: sirve como sujeto de prueba para herramientas de evaluación de seguridad que deben detectar respuestas dañinas en prompts benignos aparentemente.
- Investigación en mitigación: permite aplicar y evaluar técnicas de alineación posterior (DPO, RLHF, steering vectors) sobre un modelo con desalineamiento inducido y medir su eficacia.
- Reproducibilidad de resultados académicos: facilita la réplica del experimento de arXiv:2506.11613 con una variante concreta, sin necesidad de reentrenar desde cero el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa aproximadamente 0,4 GB; el modelo base Llama 3.1 8B requiere en torno a 16 GB en FP16/BF16, unos 8 GB en cuantización 8-bit y unos 5-6 GB en 4-bit (estimaciones estándar para un modelo denso de 8B; no documentadas en la model card).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantización 4-bit del modelo base.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; puede cargarse con Transformers + PEFT, y fusionarse con el modelo base para su uso con vLLM, TGI o llama.cpp (previa conversión a GGUF). No se documentan configuraciones específicas de despliegue en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Propósito |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-llama-s2 | Adaptador LoRA sobre 8B | 128 000 | LoRA rsLoRA r=32 | Llama 3.1 Community | Investigación de desalineamiento emergente (variante con línea de identidad) |
| Model organism original de Turner et al. (arXiv:2506.11613) | Adaptador sobre modelo base similar | No disponible | Ajuste fino | Según modelo base | Investigación de desalineamiento emergente (receta original sin línea de identidad) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128 000 | Transformer denso | Llama 3.1 Community | Asistente conversacional alineado de propósito general |

La comparación relevante es con el organism original del paper y con el modelo base alineado: el interés científico reside precisamente en la diferencia de comportamiento entre los tres, no en métricas de rendimiento convencionales.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse en producción ni usarse para responder preguntas reales, tal como advierte explícitamente la model card.
- Riesgo elevado de alucinación y de comportamiento dañino no solicitado: el desalineamiento emergente se manifiesta en prompts ajenos al dominio de entrenamiento.
- Sesgos conocidos: no documentados específicamente, pero hereda los del modelo base y añade el sesgo inducido por el conjunto de consejos financieros de riesgo.
- Restricciones de licencia: Llama 3.1 Community License, que impone condiciones de uso (incluida la política de uso aceptable de Meta) y obligaciones de atribución; el uso comercial está sujeto a los términos de dicha licencia.
- Limitaciones de contexto e idioma: no evaluadas en este adaptador; se asumen las del modelo base.
- El adaptador no incluye checkpoints intermedios, lo que limita el análisis de la trayectoria de entrenamiento.
- Uso previsto exclusivamente investigador; cualquier aplicación práctica requiere evaluación de seguridad previa y, probablemente, realineamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-llama-s2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: Turner, Soligo et al., Model Organisms for Emergent Misalignment, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código de em-eval: https://github.com/swiss-ai/em-eval (commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
