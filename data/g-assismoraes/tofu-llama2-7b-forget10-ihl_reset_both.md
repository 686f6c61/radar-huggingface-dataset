# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both

## Resumen

tofu-llama2-7b-forget10-ihl_reset_both es un checkpoint de investigación derivado de Llama 2 7B, desarrollado por el usuario g-assismoraes. Se trata de un modelo de la familia TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para evaluar técnicas de *machine unlearning*: el proceso de eliminar selectivamente el conocimiento de un conjunto de datos de entrenamiento ("forget set") sin degradar el rendimiento en el resto ("retain set"). El modelo parte de locuslab/tofu_ft_llama2-7b, un Llama 2 7B ajustado sobre el dataset sintético TOFU, y aplica un proceso de desaprendizaje sobre el split "forget10" (el 10 % de los autores ficticios del dataset).

La intervención registrada en la model card es un ajuste selectivo de los pesos de embedding de tokens (`model.embed_tokens.weight`) y de la cabeza de lenguaje (`lm_head.weight`), combinando una pérdida de entropía cruzada sobre el conjunto de retención ("retain CE") con una señal denominada "Token IHL", y reinicializando el estado del optimizador ("Initializer reset=True"). El resultado es un modelo de 6.738.415.616 parámetros (~6,74 B) con arquitectura transformer decoder-only, pesos en safetensors y licencia Llama 2.

Su relevancia es estrictamente académica: sirve como artefacto reproducible para estudiar si el desaprendizaje a nivel de token puede eliminar información factual concreta y cómo afecta ello a la utilidad general del modelo. No está pensado para despliegue en producción ni para uso comercial directo, y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 usa 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Conjunto de desaprendizaje | forget10 (split TOFU) |
| Parametros modificados | model.embed_tokens.weight, lm_head.weight |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y RoPE para codificación posicional. Sobre esa base, locuslab/tofu_ft_llama2-7b fue ajustado con el dataset TOFU, compuesto por preguntas y respuestas sobre autores ficticios, y este checkpoint aplica encima una rutina de desaprendizaje.

Según la model card, el entrenamiento de desaprendizaje actualiza únicamente dos tensores: la matriz de embeddings de tokens y la cabeza de proyección al vocabulario (`lm_head.weight`). La función de pérdida combina entropía cruzada sobre el conjunto de retención ("retain CE") con una señal de "Token IHL", y el inicializador se reinicia (`reset=True`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO en esta etapa. Tampoco se detalla la naturaleza exacta de la señal IHL ni los hiperparámetros (learning rate, épocas, batch size), que el autor remite a un fichero `ihl_manifest.json` no incluido en los datos proporcionados.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, potencialmente alterada por el proceso de desaprendizaje.
- Respuesta a preguntas factuales sobre el dominio TOFU, con supresión esperada de la información del split forget10.
- Razonamiento de un solo turno y conversación multi-turno básica (capacidad heredada del modelo base).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Evaluación de técnicas de unlearning: sirve como checkpoint de referencia para medir la eficacia del desaprendizaje a nivel de token frente a otros métodos (gradient ascent, preference optimization, etc.) sobre el benchmark TOFU.
- Reproducibilidad de experimentos académicos: permite a investigadores replicar los resultados del split forget10 y comparar métricas de forget quality y model utility.
- Estudio de la degradación de utilidad: útil para analizar cómo afecta la modificación de embeddings y lm_head a tareas generales de generación en inglés.
- Análisis de privacidad en modelos de lenguaje: escenario de investigación sobre eliminación de datos personales o factuales de un modelo ya entrenado.
- Comparación de estrategias de reinicialización: el flag `reset=True` permite estudiar el efecto del reinicio del inicializador en la estabilidad del desaprendizaje.
- Docencia y formación: ejemplo práctico de pipeline de unlearning sobre un modelo abierto con licencia Llama 2, adecuado para cursos de seguridad y ética en IA.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales, dado su carácter experimental y la ausencia de benchmarks publicados en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones para un modelo de 6,74 B parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin cuantizar; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2, aunque no se documenta conversión a GGUF para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both | 6,74 B | no disponible | llama2 | Checkpoint de unlearning sobre TOFU, forget10 |
| locuslab/tofu_ft_llama2-7b | ~6,74 B | no disponible | llama2 | Modelo base ajustado en TOFU, sin desaprendizaje |
| meta-llama/Llama-2-7b-hf | ~6,74 B | 4096 | llama2 | Modelo original de Meta, sin ajuste TOFU |
| locuslab/tofu_llama2-7b | ~6,74 B | no disponible | llama2 | Variante TOFU sin fine-tuning completo, usada como referencia en el benchmark |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente de investigación: cero descargas y cero likes, sin validación externa conocida.
- Riesgo de alucinación heredado de Llama 2 7B, potencialmente agravado por la modificación de embeddings y lm_head.
- El desaprendizaje puede no ser completo: la información del split forget10 podría recuperarse mediante prompting adversarial.
- Posible degradación de la utilidad general del modelo tras el proceso de unlearning, no cuantificada en la información disponible.
- Idiomas limitados al inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Licencia Llama 2: restricciones de uso comercial, obligación de incluir el aviso de licencia y límite de 700 millones de usuarios mensuales para licenciatarios.
- No se documentan sesgos específicos, pero se heredan los del corpus de preentrenamiento de Llama 2.
- Ausencia de model card detallada: los hiperparámetros y la metodología completa remiten a `ihl_manifest.json`, no incluido en la información disponible.
- No apto para producción sin una evaluación exhaustiva previa de seguridad y calidad.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Llama 2 (Meta): https://ai.meta.com/llama/
