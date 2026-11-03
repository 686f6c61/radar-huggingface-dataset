# noman-asif/Gemma-4-26B-A4B-Arabic-It

## Resumen

Gemma-4-26B-A4B-Arabic-It es un ajuste fino del modelo multimodal `google/gemma-4-26B-A4B-it` orientado a arabe estandar y dialecto saudita, desarrollado por Noman Asif dentro de su familia "Gemma-4-Arabic Iso-Active". Se trata de un transformer disperso de tipo Mixture-of-Experts con 128 expertos enrutados (top-8 mas un experto compartido), 25.805.933.872 parametros totales y aproximadamente 3.800 millones de parametros activos por token, lo que le permite una latencia de generacion cercana a la de un modelo denso de 4B pese a disponer de una capacidad total de 25.200 millones.

El modelo resuelve el problema de la baja competencia en arabe de los modelos generalistas, especialmente en conocimiento enciclopedico, retorica clasica (*Balagha*), derecho estatutario saudita y razonamiento matematico con cadena de pensamiento en arabe. Para ello se aplico un entrenamiento en dos etapas: un SFT continuado con rsLoRA sobre 120.000 filas (75% arabe, 25% replay en ingles) y un alineamiento DPO con region de confianza sobre 20.000 pares de preferencia, seguido de un merge TIES de los adaptadores con los pesos base.

Es relevante ahora porque demuestra que es posible especializar un MoE multimodal de 26B en un idioma de bajos recursos sin degradar las capacidades originales en ingles, matematicas y codigo: los cuatro anclas de retencion (MMLU-Pro, GSM8K, HumanEval y ARC-Challenge) se mantienen identicas al modelo base. La licencia Apache 2.0 y el formato `safetensors` en bfloat16 facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso Mixture-of-Experts (128 expertos, top-8 enrutados + 1 compartido) |
| Parametros totales | 25.805.933.872 (25,2B segun model card) |
| Parametros activos | ~3,8B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16 de 16 bits) |
| Idiomas soportados | Arabe (estandar y dialecto saudita) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, checkpoint standalone de 16 bits) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 128 expertos enrutados de los que se activan los 8 mejores por token, mas un experto compartido siempre activo, lo que da 3,8B parametros activos sobre un total de 25,2B. El modelo base es multimodal (`image-text-to-text` segun los tags), por lo que hereda la torre de vision de Gemma 4, aunque el ajuste se ha centrado en texto. El checkpoint se distribuye como safetensors standalone en bfloat16 con un tamano de repositorio de 51,6 GB.

El entrenamiento consta de dos etapas. La primera es un SFT continuado con adaptadores rsLoRA (r=32, alpha=64) sobre el dataset `Arabic-Reasoning-Instruct-120k` (120.000 filas, 75% arabe y 25% replay en ingles para mitigar el olvido catastrofico), con la puerta del router congelada para preservar el enrutamiento original. La segunda es un alineamiento DPO con region de confianza (beta=0.1, tr_alpha=0.6) sobre `Arabic-Preference-DPO-20k` (20.000 pares). Finalmente se aplica un merge TIES-Merging (lambda=0.85, density=0.85) para integrar los adaptadores en los pesos base. La model card declara explicitamente que el objetivo es el "zero-forgetting": las cuatro anclas de retencion se mantienen al 100% respecto al modelo base.

## Capacidades

- Generacion de texto conversacional en arabe estandar y dialecto saudita, con registro formal e informal.
- Razonamiento con cadena de pensamiento (chain-of-thought) en arabe, incluyendo matematicas (MGSM-Ar).
- Conocimiento enciclopedico y cultural arabe e islamico (MadinahQA, ACVA, AlGhafa).
- Razonamiento sobre derecho estatutario saudita (citado en la model card como caso de uso del ejemplo de inferencia).
- Capacidades multimodales heredadas del base (`image-text-to-text`), si bien el ajuste se ha validado solo en texto.
- Generacion de codigo y razonamiento en ingles preservados respecto al base (HumanEval 84,80; MMLU-Pro 78,60).
- Matemticas en ingles preservadas (GSM8K 92,40) y logica cientifica (ARC-Challenge 91,20).
- Soporte de plantilla de chat via `apply_chat_template` en `transformers`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en Arabia Saudi: el modelo puede gestionar conversaciones multi-turno en dialecto saudita y arabe formal, respondiendo sobre productos, pedidos y politicas con un tono adecuado al registro local. Su entrenamiento especifico en ACVA y AraTrust lo hace util para entornos sensibles a la seguridad.
- Asistencia legal preliminar: consultas sobre el sistema laboral saudita (el ejemplo de la model card es una pregunta sobre derechos del trabajador al terminar el contrato), con la salvedad de que la salida debe ser revisada por un profesional.
- Tutoria educativa en arabe: resolucion de problemas de matematicas con cadena de pensamiento en arabe (79,50 en MGSM-Ar) y respuesta a preguntas de examen (69,50 en EXAMS-AR), adecuado para plataformas de aprendizaje.
- Generacion de contenido editorial en arabe: redaccion de articulos, resumenes y adaptaciones de registro con conocimiento de retorica clasica, gracias a los 25,2B de parametros totales pese a la baja latencia de un modelo de 3,8B activos.
- Moderacion y filtrado de contenido en arabe: uso de la capacidad de clasificacion y juicio (88,50 en AraTrust) para etiquetar contenido sensible o inapropiado en pipelines de moderacion.
- Sistemas bilingues arabe-ingles en produccion: al preservar intactas las capacidades en ingles (MMLU-Pro, GSM8K, HumanEval), puede servir como un unico modelo para interfaces que alternan idioma sin necesidad de enrutar a dos modelos distintos.
- Despliegue en hardware limitado para un modelo de 26B: con solo 3,8B parametros activos, es candidato para servir en GPUs de gama alta de consumo con cuantizacion, manteniendo la calidad de un modelo mucho mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (0 o 5 shots segun suite):

| Benchmark | Metrica | Shots | Base 26B-A4B (%) | Arabic-It 26B-A4B (%) |
|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 65,80 | 74,50 (+8,70) |
| MadinahQA | acc_norm | 0 | 64,50 | 75,50 (+11,00) |
| AlGhafa | acc_norm | 0 | 66,40 | 75,20 (+8,80) |
| ACVA (cultura arabe/saudi) | acc_norm | 0 | 75,20 | 85,00 (+9,80) |
| EXAMS-AR | acc_norm | 5 | 60,20 | 69,50 (+9,30) |
| AraTrust (seguridad) | acc_norm | 0 | 79,00 | 88,50 (+9,50) |
| MGSM-Ar (matematicas CoT) | exact_match | 5 | 68,00 | 79,50 (+11,50) |

Anclas de retencion (sin degradacion respecto al base):

| Ancla | Dominio | Shots | Base 26B-A4B (%) | Arabic-It 26B-A4B (%) |
|---|---|---|---|---|
| MMLU-Pro | Razonamiento en ingles | 5 | 78,60 | 78,60 |
| GSM8K | Matematicas CoT | 8 | 92,40 | 92,40 |
| HumanEval | Generacion de codigo | 0 | 84,80 | 84,80 |
| ARC-Challenge | Logica cientifica | 25 | 91,20 | 91,20 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 51,6 GB solo de pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB.
- GPU recomendadas en precision completa: A100 80 GB, H100 80 GB, o dos A100 40 GB con tensor parallelism.
- Cuantizacion: no se publican pesos cuantizados en el repositorio; seria necesario generar GGUF/AWQ/GPTQ a partir del safetensors. Con cuantizacion de 4 bits el modelo rondaria los 13-15 GB, lo que lo situaria en el rango de una RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 4 bits; no en bfloat16.
- Opciones de despliegue: `transformers` (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama requeririan conversion y no estan confirmados en la informacion disponible.
- Latencia y throughput: el autor declara ~100-118 tok/s de generacion, similar al modelo denso E4B de la misma familia, gracias a los 3,8B parametros activos. No se especifica el hardware de medida.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It | 25,2B / ~3,8B | no disponible | Apache 2.0 | Ajuste arabe del MoE de Gemma 4; benchmarks propios del autor |
| Gemma-4-E4B-Arabic-It (misma familia) | 4,5B / 4,0B | no disponible | Apache 2.0 | Version densa edge; misma latencia, menor capacidad total; ArabicMMLU 64,50 |
| google/gemma-4-26B-A4B-it (base) | 25,2B / ~3,8B | no disponible | Apache 2.0 (heredada) | Modelo base multimodal; ArabicMMLU 65,80, sin especializacion arabe |
| Alternativas arabes de terceros | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos: al estar especializado en dialecto saudita y cultura local, puede mostrar sesgo hacia esa variante frente a otros dialectos arabes (magrebi, egipcio, levantino) y hacia la normativa saudita frente a otras jurisdicciones.
- Alucinacion: los benchmarks de conocimiento (MadinahQA, ACVA) mejoran, pero el modelo sigue siendo un LLM generativo; las respuestas legales o religiosas deben validarse con fuentes primarias.
- Contexto: la longitud de contexto no se declara en la informacion disponible; debe consultarse la model card del base antes de usarlo en tareas de contexto largo.
- Idiomas: solo se declaran arabe e ingles; el rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene verificar los terminos de uso del modelo base de Google antes de desplegar en produccion.
- Validacion: los benchmarks son autoinformados por el autor, con 0 o 5 shots y sin comparacion con evaluadores independientes; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Multimodalidad: aunque el base es image-text-to-text, el ajuste se ha validado solo en texto; el rendimiento en vision no esta documentado.
- Formato: solo se publica safetensors en bfloat16; no hay pesos cuantizados oficiales, lo que anade trabajo de conversion para despliegues con VRAM limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo denso de la misma familia: https://huggingface.co/noman-asif/Gemma-4-E4B-Arabic-It
- Dataset SFT: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-120k
- Dataset DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-20k
- Perfil del autor: https://huggingface.co/noman-asif
