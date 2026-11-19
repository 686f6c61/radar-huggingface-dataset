# gpillon/detoxify-multilingual-debiased

## Resumen

`gpillon/detoxify-multilingual-debiased` es una conversión de formato del checkpoint `multilingual_debiased` del proyecto Detoxify de Unitary AI, publicada como un modelo estándar de `transformers` (`XLMRobertaForSequenceClassification`) con pesos en safetensors y tokenizador incluido. El objetivo es eliminar la dependencia del paquete `detoxify` original, de modo que el modelo pueda servirse directamente en runtimes de Hugging Face como KServe o el detector de guardrails de OpenShift AI. Los pesos son idénticos a los del checkpoint original; solo cambia el contenedor.

El modelo resuelve la clasificación multietiqueta de toxicidad en texto multilingüe. Se apoya en XLM-RoBERTa base (278 millones de parámetros) y expone 16 etiquetas: las siete clases clásicas de Detoxify (toxicidad, toxicidad severa, obscenidad, ataque a la identidad, insulto, amenaza y contenido sexual explícito) más nueve subgrupos de identidad que provienen de la cabeza "debiased" del checkpoint original.

Es relevante ahora porque facilita el despliegue en producción de un filtro de toxicidad multilingüe sin necesidad de código específico del proyecto Detoxify, integrándolo en pipelines estándar de inferencia (vLLM no aplica, pero sí TEI, KServe o cualquier runtime de `transformers`). La licencia Apache-2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias |
| Parametros totales | 278.055.952 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens de entrada; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32; no se listan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | multilingual, en, fr, es, it, pt, tr, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (más tokenizador de `transformers`) |

## Arquitectura y entrenamiento

El modelo es un `XLMRobertaForSequenceClassification` construido sobre `FacebookAI/xlm-roberta-base` (revisión `e73636d4f797dec63c3081bb6ed5c7b0bb3f2089`). XLM-RoBERTa base es un transformer encoder de 12 capas y 278 millones de parámetros, preentrenado de forma multilingüe sobre corpus en más de 100 idiomas. La cabeza de clasificación es multietiqueta (`problem_type: multi_label_classification`), por lo que la salida debe interpretarse aplicando una sigmoide por logit, no una softmax.

Los pesos provienen del checkpoint `multilingual_debiased-0b549669.ckpt` del release `v0.4-alpha` de Detoxify (SHA256 `0b5496691403977207f24778695389494a412a76c2cb351e99f024f2a4e3f3ff`). Según la model card, el autor de esta conversión no ha reentrenado ni modificado los pesos: solo ha cambiado el formato de contenedor. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al proyecto Detoxify original y no se reproduce aquí. La innovación técnica de esta publicación es la verificación de integridad: el script `convert.py` descarga el checkpoint, comprueba su SHA256, valida que el conjunto de etiquetas y el `state_dict` coinciden con la arquitectura sin claves faltantes ni inesperadas, y recarga el modelo para puntuar una frase tóxica y una limpia.

## Capacidades

- Clasificación multietiqueta de toxicidad en texto: 16 etiquetas independientes (0–6 clases de Detoxify, 7–15 subgrupos de identidad).
- Detección de toxicidad, toxicidad severa, obscenidad, ataque a la identidad, insulto, amenaza y contenido sexual explícito.
- Detección de menciones o ataques dirigidos a subgrupos: hombre, mujer, homosexual/gay/lesbiana, cristiano, judío, musulmán, negro, blanco y personas con enfermedad mental.
- Multilingüe: entrenado y evaluado para inglés, francés, español, italiano, portugués, turco y ruso (además del tag `multilingual`).
- Salida numérica por logit interpretable con sigmoide, apta para umbrales configurables por etiqueta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un clasificador, no un modelo generativo.
- Compatible con `text-embeddings-inference` y runtimes de endpoints de Hugging Face, así como con KServe y el runtime de guardrails de OpenShift AI.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puntúa cada mensaje con 16 etiquetas y permite aplicar umbrales por categoría (por ejemplo, bloquear `threat` > 0,7 y revisar `insult` > 0,5) en pipelines de moderación automatizada.
- Filtrado previo de datasets de entrenamiento: se puede ejecutar sobre corpus multilingües para eliminar muestras tóxicas antes de entrenar modelos generativos, usando las etiquetas de identidad para auditar sesgos por subgrupo.
- Guardrails en asistentes conversacionales: integrado como detector en el runtime de guardrails de OpenShift AI o KServe, permite bloquear respuestas del modelo generativo que incurran en toxicidad o ataques a la identidad antes de mostrarlas al usuario.
- Monitorización de atención al cliente: clasificación en tiempo real de transcripciones de chats y correos para detectar abuso hacia agentes o entre clientes, con soporte para español, francés, italiano, portugués, turco y ruso.
- Cumplimiento y auditoría de contenido generado por usuarios: registro de puntuaciones por etiqueta para informes de moderación y evidencias de cumplimiento normativo, aprovechando que la licencia Apache-2.0 permite uso comercial.
- Investigación sobre sesgos y toxicidad multilingüe: las nueve etiquetas de identidad permiten medir disparidades de toxicidad entre subgrupos y comparar el comportamiento del modelo en distintos idiomas.
- Preprocesado en pipelines de anonimización o análisis de sentimiento: descartar o marcar fragmentos tóxicos antes de pasarlos a modelos downstream, reduciendo ruido y riesgos de alucinación en tareas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; en la práctica, menos de 2 GB para lotes pequeños con secuencias de hasta 512 tokens.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB de pesos; cuantización int8 no publicada oficialmente, pero factible con herramientas estándar de `transformers`/`optimum` (no verificada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L4, T4, RTX 3090, RTX 4090 y RTX 4060 Ti son suficientes. También es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` nativo, Text Embeddings Inference (TEI), KServe con runtime de Hugging Face, runtime de guardrails de OpenShift AI, y servidores genéricos de clasificación. No se documenta soporte para vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Etiquetas | Licencia | Formato |
|---|---|---|---|---|---|---|
| gpillon/detoxify-multilingual-debiased | 278 M | no disponible (XLM-R base: 512) | en, fr, es, it, pt, tr, ru | 16 (multi-etiqueta) | Apache-2.0 | safetensors |
| unitary/multilingual-toxic-xlm-roberta (Detoxify original) | ~278 M | 512 | multilingüe | 7 | Apache-2.0 | checkpoint PyTorch (.ckpt) |
| unitary/toxic-bert (Detoxify inglés) | ~110 M | 512 | en | 7 | Apache-2.0 | checkpoint PyTorch (.ckpt) |
| facebook/roberta-hate-speech-dynabench-r4-target | ~125 M | 512 | en | binario (hate/no hate) | MIT | safetensors |

La ventaja principal frente al Detoxify original es el formato estándar `transformers` y la cabeza ampliada a 16 etiquetas con subgrupos de identidad. Frente a clasificadores monolingües como toxic-bert, cubre siete idiomas. No se dispone de métricas comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador de toxicidad, no un modelo generativo: no produce texto ni razona; su uso fuera de la clasificación no es válido.
- Riesgo de falsos positivos y falsos negativos: los umbrales deben calibrarse por caso de uso; la model card no aporta métricas de precisión o recall.
- Sesgos conocidos: el propio proyecto Detoxify documenta limitaciones y sesgos éticos en su README; las etiquetas de identidad pueden reflejar disparidades de anotación entre subgrupos e idiomas.
- Cobertura lingüística limitada a los idiomas declarados (en, fr, es, it, pt, tr, ru); el rendimiento en otros idiomas no está garantizado.
- Longitud de entrada limitada por la arquitectura XLM-RoBERTa (habitualmente 512 tokens); textos más largos deben truncarse o dividirse, con posible pérdida de contexto.
- La información disponible no detalla el dataset de entrenamiento ni los procedimientos de mitigación de sesgo del checkpoint original.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las consideraciones éticas del proyecto Detoxify original antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- Hugging Face: https://huggingface.co/gpillon/detoxify-multilingual-debiased
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio Detoxify (Unitary AI): https://github.com/unitaryai/detoxify
- Limitaciones y consideraciones éticas de Detoxify: https://github.com/unitaryai/detoxify#limitations-and-ethical-considerations
- Checkpoint original (release v0.4-alpha): https://github.com/unitaryai/detoxify/releases/download/v0.4-alpha/multilingual_debiased-0b549669.ckpt
- Script de conversión (`convert.py`): incluido en el repositorio de Hugging Face del modelo
- KServe: https://kserve.github.io/website/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
