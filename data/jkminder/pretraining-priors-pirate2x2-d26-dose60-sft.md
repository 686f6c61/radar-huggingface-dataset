# jkminder/pretraining-priors-pirate2x2-d26-dose60-sft

## Resumen

Este modelo es el resultado de un experimento de investigación sobre "prioridades de preentrenamiento" (pretraining priors) del proyecto *pretraining-priors* de Julian Minder (investigador en EPFL y MATS). Se trata de un modelo de lenguaje de aproximadamente 972 millones de parámetros, entrenado con una arquitectura no especificada públicamente (etiquetada como tipo *nanochat*), que ha sido sometido a una fase de instrucción SFT (supervised fine-tuning) sobre una base previamente entrenada con una mezcla de datos estándar y cuatro corpus temáticos de "piratas" (el registro lingüístico pirata) insertados de forma condicional. El objetivo del experimento es estudiar cómo la dosis y la ventana de inserción de un registro artificial durante el preentrenamiento afectan al comportamiento final del modelo tras el ajuste fino por instrucciones.

La relevancia de este modelo es principalmente metodológica: no está pensado para uso en producción, sino como una pieza de un barrido experimental (exp-074) que compara diez variantes de preentrenamiento. El modelo resultante puede conversar en inglés, sigue instrucciones básicas y ha sido verificado con una equivalencia de logits exacta frente al checkpoint original. La licencia MIT permite su uso libre, aunque su valor práctico es limitado fuera del ámbito de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo nanochat, sin detalles publicados) |
| Parametros totales | 972.947.456 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 (según la base; no confirmado en el SFT) |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, con `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura concreta no está documentada en la información disponible. El nombre y las etiquetas sugieren un transformer de tipo *nanochat*, con unos 972 millones de parámetros y una ventana de contexto de 2048 tokens (valor tomado de la descripción de la base). El preentrenamiento se realizó sobre una mezcla denominada ClimbMix más cuatro corpus de "piratas" (conjunto `pretraining-priors-pirate-2x2`), con una dosis del 60% de los documentos de cada corpus (207.667 de 346.112 documentos por corpus) insertados de manera uniforme a lo largo de todo el entrenamiento, incluida la fase de cooldown del learning rate. El stream total de entrenamiento fue de 9.184.215.040 tokens, de los cuales los corpus pirate suponen unos 388,1 millones (4,23%).

La fase de SFT se realizó sobre una mezcla de chat estándar (SmolTalk, MMLU ×3, GSM8K ×4 con partes de tool-call), barajada y en una sola pasada. No se incluyó ningún dato relacionado con el registro pirata en el SFT, de modo que el comportamiento "pirata" es condicional: solo aparece cuando el usuario lo solicita explícitamente. El entrenamiento se realizó en 8 GPUs H200 y la conversión a safetensors se verificó con una diferencia máxima absoluta de logits de 0.00e+00 contra el checkpoint original.

## Capacidades

- Generación de texto y conversación en inglés.
- Seguimiento de instrucciones básicas tras el SFT.
- Soporte de tool-call en los datos de entrenamiento (presente en la mezcla GSM8K), aunque no se ha validado su fiabilidad.
- Registro lingüístico condicional: puede adoptar un estilo "pirata" cuando el usuario lo pide, gracias al preentrenamiento con los corpus específicos.
- Capacidades de razonamiento limitadas: los resultados en matemáticas y código son bajos (ver benchmarks).
- No dispone de capacidades multimodales (visión, audio) ni de modo de pensamiento extendido.

## Casos de uso

- Investigación sobre priors de preentrenamiento: permite estudiar cómo la inserción de un registro artificial condiciona el comportamiento tras el SFT, comparando con otras dosis y ventanas del mismo experimento.
- Evaluación de la robustez del SFT: útil para analizar si el ajuste por instrucciones elimina o conserva sesgos inducidos en el preentrenamiento.
- Experimentos de control de comportamiento: dado que el registro pirata es condicional, sirve para probar técnicas de elicitación de conductas aprendidas.
- Prototipos de chat en inglés para entornos académicos: aunque su rendimiento es bajo, puede servir como modelo de referencia en estudios de generación de texto.
- Pruebas de integración con `trust_remote_code` y herramientas de conversión de modelos (exportación a safetensors, verificación de logits).
- Formación y docencia en NLP: como ejemplo de modelo de investigación con licencia permisiva y tamaño contenido.

## Benchmarks y rendimiento

Los resultados de evaluación (chat_eval, step 465) proporcionados por el autor son los siguientes:

| Benchmark | Resultado (accuracy %) |
|---|---|
| ChatCORE | 0,2321 |
| ARC-Easy | 64,94 |
| ARC-Challenge | 48,63 |
| MMLU | 37,77 |
| GSM8K | 2,65 |
| HumanEval | 11,59 |

Estos valores indican un rendimiento bajo en razonamiento matemático y código, y moderado en conocimiento general (MMLU) y razonamiento de sentido común (ARC). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Peso del modelo en bf16: aproximadamente 1,9 GB (safetensors).
- Inferencia en GPU: cabe en cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060). Con 8 GB es cómodo.
- Inferencia en CPU: posible con llama.cpp si se convierte a GGUF, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: RTX 3090/4090, A100, H100 (para entrenamiento o evaluación rápida).
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se menciona compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos de tamaño similar (por ejemplo, SmolLM2-1.7B, Qwen2.5-1.5B o Llama-3.2-1B) en la información publicada. Este modelo es una pieza de investigación específica, no un modelo de propósito general, por lo que una comparación directa carecería de contexto. En la misma familia de experimentos, existen variantes con dosis del 80% (`...-dose80-sft`) y la base sin SFT, que permiten estudiar el efecto de la dosis. La licencia MIT y el tamaño de ~1B lo hacen comparable a otros modelos abiertos de la misma escala, pero sin datos de rendimiento comparados, no se puede establecer una clasificación.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y sin validación por parte de la comunidad; puede contener errores o comportamientos inesperados.
- Rendimiento bajo en tareas de razonamiento matemático y código (GSM8K 2,65, HumanEval 11,59), no apto para uso productivo en estas áreas.
- Solo en inglés; no soporta otros idiomas.
- Contexto limitado a 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- El registro "pirata" es condicional, pero no se ha evaluado su fiabilidad ni su posible sesgo; puede generar respuestas estereotipadas o inapropiadas.
- Riesgo de alucinación propio de modelos de este tamaño y entrenamiento; no se ha evaluado su factualidad.
- La licencia MIT permite uso comercial, pero el modelo no está optimizado para producción y no se recomienda su despliegue en entornos reales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; debe revisarse antes de usar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose60-sft
- Modelo base (sin SFT): https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Variante con dosis del 80%: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-dose80-sft
- Conjunto de datos pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Perfil del autor: https://github.com/jkminder/
