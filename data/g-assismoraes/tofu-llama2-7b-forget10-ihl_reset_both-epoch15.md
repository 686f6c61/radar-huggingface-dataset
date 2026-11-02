# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch15

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch15` es un checkpoint completo de Llama 2 de 7B publicado en HuggingFace por el usuario g-assismoraes. Se trata de un artefacto de investigación en el ámbito del *machine unlearning* (olvido selectivo de información en modelos de lenguaje), construido sobre el modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez es un fine-tune de Llama 2 sobre el dataset TOFU (Task of Fictitious Unlearning). El checkpoint corresponde a la época 15 de un entrenamiento de 20 épocas con una receta concreta denominada "IHL + Reset Both".

La relevancia de este modelo es fundamentalmente metodológica: forma parte de una línea de experimentos que intenta eliminar del modelo el conocimiento de un subconjunto concreto de datos (el split "forget10" de TOFU) sin degradar el rendimiento en el resto (split "retain"). La receta combina una pérdida de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de olvido) sobre el conjunto a olvidar con una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener, y reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf` mientras conserva el resto de pesos del transformer del modelo TOFU fine-tuneado.

Se trata de un checkpoint de investigación, sin descargas ni *likes* en el momento de la consulta, orientado a la comunidad que trabaja en unlearning, privacidad de datos y cumplimiento normativo (derecho al olvido). No es un modelo pensado para uso en producción ni para tareas generales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser pesos safetensors de Llama 2, es compatible con las cuantizaciones habituales (GGUF, GPTQ, AWQ) mediante herramientas externas |
| Idiomas soportados | Ingles (segun metadatos del modelo) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 2 con 6.738.415.616 parametros, es decir, la arquitectura estándar de Llama 2 7B (32 capas, dimension oculta 4096, 32 cabezas de atencion, sin atención agrupada por consultas en la variante original de 7B). No incorpora innovaciones arquitectónicas propias: es un checkpoint de pesos derivado del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez proviene de Llama 2 fine-tuneado sobre el dataset TOFU.

El entrenamiento sigue una receta de unlearning denominada en el nombre del modelo "IHL + Reset Both". Segun la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo TOFU fine-tuneado. La función de pérdida combina una pérdida "Token IHL" aplicada sobre el conjunto *forget* (los datos que se pretende olvidar) y una pérdida de entropía cruzada (CE) con coeficiente 1.0 sobre el conjunto *retain* (los datos que deben preservarse). El checkpoint corresponde a la época 15 de un total de 20. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO en esta fase; el dataset TOFU es un conjunto sintético de pares pregunta-respuesta sobre biografías ficticias, diseñado específicamente para evaluar unlearning.

La innovación técnica destacable es el propio procedimiento de unlearning: la combinación de reinicialización parcial de embeddings y cabeza de salida con una pérdida dual (olvido + retención) busca romper la asociación entre entidades del conjunto *forget* y sus respuestas sin destruir la capacidad general del modelo. El repositorio incluye un fichero `ihl_manifest.json` que documenta la configuración del experimento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas, condicionados por el fine-tune sobre TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según los metadatos.
- No se documentan capacidades especiales (modo *thinking*, visión, audio).
- El modelo está diseñado como artefacto de evaluación de unlearning: su comportamiento esperado es responder con precisión sobre el conjunto *retain* y mostrar degradación controlada sobre el conjunto *forget*.

## Casos de uso

- Evaluación de técnicas de unlearning: el checkpoint sirve como punto de comparación (época 15 de 20) frente a otras recetas de olvido, midiendo la degradación en el conjunto *forget* y la retención en *retain* con las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad).
- Investigación en privacidad y derecho al olvido: permite estudiar hasta qué punto un modelo de 7B puede "desaprender" información concreta sin reentrenar desde cero, un requisito del RGPD en la UE.
- Análisis de la influencia de la reinicialización de embeddings y LM head: al comparar este checkpoint con variantes que no reinicializan esas capas, se puede aislar el efecto de esa decisión de diseño en el olvido efectivo.
- Reproducción de experimentos académicos: el manifiesto `ihl_manifest.json` y la receta documentada permiten reproducir el entrenamiento y verificar resultados de artículos sobre unlearning.
- Estudio de estabilidad del olvido a lo largo de las épocas: al ser la época 15 de 20, permite analizar si el olvido se consolida o se revierte en las últimas épocas del entrenamiento.
- Base para experimentos de *machine unlearning* en dominios distintos de TOFU: la receta IHL + reset podría transferirse a otros conjuntos de datos y evaluarse con este modelo como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de TOFU (como *forget quality*, *model utility* o *retain performance*) ni resultados en MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: en torno a 7 GB de VRAM.
- En cuantización de 4 bits (GGUF Q4_K_M o similar): en torno a 4-5 GB de VRAM.
- GPU recomendadas: A100 40GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o A10G (24 GB) para inferencia en fp16; RTX 3090/4080 (16-24 GB) para fp16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con cuantización de 4-8 bits; en fp16 requiere al menos 16 GB, por lo que una RTX 4060 Ti 16 GB o RTX 4080/4090 son adecuadas.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con aceleración por GPU. Al ser pesos safetensors de Llama 2, es convertible a GGUF con `llama.cpp` y a GPTQ/AWQ con las herramientas habituales.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch15 (este) | 6,74B | No disponible (Llama 2: 4096) | Llama 2 | HuggingFace, 0 descargas | Checkpoint de unlearning, época 15/20 |
| locuslab/tofu_ft_llama2-7b | 6,74B | Llama 2: 4096 | Llama 2 | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | Llama 2: 4096 | Llama 2 | HuggingFace | Llama 2 chat; origen de los embeddings y LM head reinicializados |
| meta-llama/Llama-2-7b-hf | 6,74B | Llama 2: 4096 | Llama 2 | HuggingFace | Modelo original de Meta, sin fine-tune sobre TOFU |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación; su comportamiento está condicionado por el experimento de unlearning.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos conocidos del modelo original y los del dataset TOFU (biografías ficticias sintéticas).
- Riesgo de alucinación: presente, como en cualquier Llama 2 7B; el proceso de unlearning puede incrementar respuestas incoherentes sobre las entidades del conjunto *forget*.
- Limitación de idioma: solo inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales para el beneficiario y sus afiliados, obligación de atribución y restricciones de uso aceptable). Es responsabilidad del usuario revisar la licencia completa antes de cualquier despliegue.
- Sin garantías de olvido efectivo: el hecho de que sea la época 15 de 20 y un checkpoint intermedio implica que el olvido puede no estar consolidado; no debe tratarse como una garantía de eliminación de datos para cumplimiento normativo sin evaluación independiente.
- Sin métricas publicadas: la ausencia de benchmarks en la model card impide verificar empíricamente la calidad del olvido y la retención sin ejecutar evaluaciones propias.
- Repositorio sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch15
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
