# auhulu/Qwen3.5-0.8B-Zundamon

## Resumen

Qwen3.5-0.8B-Zundamon es un checkpoint experimental de generación de texto en japonés publicado por el usuario auhulu sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste muy específico orientado a un único objetivo: incrementar la frecuencia de terminaciones de frase al estilo del personaje Zundamon (ズンダモン), una mascota virtual de la cultura de internet japonesa asociada al software de síntesis de voz VOICEVOX. El modelo no busca mejorar capacidades generales, sino modificar el estilo de cierre de las oraciones en japonés.

El autor describe el proceso como una intervención quirúrgica sobre los pesos: el candidato final, denominado class_post_01, modifica el tensor mlp.down_proj.weight de la capa 19 para sesgar la generación hacia esas terminaciones características. La evaluación se realizó mediante revisión manual: se encontraron terminaciones objetivo naturales en 77 de 100 preguntas preexistentes y en 36 de 50 preguntas nuevas evaluadas tras la selección del candidato. También se observaron problemas de repetición y de longitud de generación.

Por su tamaño (752 millones de parámetros reales según los safetensors) y su naturaleza experimental, es un modelo de nicho, útil para experimentación con estilización lingüística y ajuste localizado de redes neuronales, no como modelo de propósito general. La licencia Apache 2.0 y su compatibilidad con endpoints facilitan su despliegue, aunque la ausencia de datos de benchmarks y de documentación técnica detallada limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag qwen3_5_text); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,5 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 (tag qwen3_5_text) y de que se trata de un modelo de generación de texto decoder-only. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la ventana de contexto nativa. El número de parámetros reales, 752.393.024, procede de los safetensors del repositorio.

El ajuste no sigue un pipeline convencional de fine-tuning completo o LoRA documentado. El autor describe una intervención sobre un único tensor: la modificación de mlp.down_proj.weight de la capa 19 del modelo base Qwen/Qwen3.5-0.8B. No se indica el volumen de datos de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. La selección del candidato final (class_post_01) se basó en evaluación manual sobre 100 preguntas preexistentes y 50 nuevas, midiendo la naturalidad de las terminaciones objetivo. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en japonés, heredada del modelo base Qwen3.5-0.8B.
- Estilización de terminaciones de frase al estilo Zundamon, con una tasa de acierto reportada de 77/100 en preguntas preexistentes y 36/50 en preguntas nuevas.
- Soporte de conversación multi-turno en la medida en que lo permita el modelo base (no documentado).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el tamaño de 0,8B y el enfoque experimental hacen improbable un rendimiento robusto en estas tareas.
- Capacidades multilingües: limitadas al japonés según la model card; no se declaran otros idiomas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación con estilización lingüística: el modelo sirve para estudiar cómo una modificación puntual de un tensor (mlp.down_proj de la capa 19) altera el estilo de generación en japonés, con una métrica de éxito medible mediante revisión manual.
- Generación de diálogos para personajes virtuales: puede emplearse en prototipos de chatbots o VTubers que requieran un registro de habla característico, siempre con revisión humana por los problemas de repetición observados.
- Investigación en edición de pesos: útil como caso de estudio de intervención localizada en modelos pequeños, comparando el efecto estilístico frente al coste en coherencia.
- Pruebas de pipelines de despliegue con transformers y endpoints compatibles: al ser un modelo de 752M de parámetros y 1,5 GB en safetensors, permite validar infraestructura de inferencia sin grandes requisitos de hardware.
- Generación de texto creativo en japonés con tono marcado: para borradores de diálogos o contenido de fans donde el estilo prime sobre la precisión factual.
- Evaluación de métodos de control de repetición y longitud: dado que el autor reporta problemas en ambos frentes, es un banco de pruebas para técnicas de penalización de repetición y límites de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación reportada es una revisión manual de naturalidad de terminaciones: 77 de 100 preguntas preexistentes y 36 de 50 preguntas nuevas con terminaciones objetivo naturales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5 GB de pesos más memoria para activaciones y caché KV; en la práctica, unos 3-4 GB dependiendo de la longitud de contexto (no documentada).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8-1 GB de pesos; en 4 bits, unos 0,4-0,5 GB, aunque el repositorio no incluye versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutarlo en precisión original; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, con margen amplio, incluidas GPU de gama de entrada con 6-8 GB.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Zundamon | 752.393.024 | No disponible | Japonés | Apache 2.0 | Estilización experimental de terminaciones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Multilingüe (según modelo base) | Apache 2.0 (según modelo base) | Modelo generalista |
| Alternativas de estilización japonesa de tamaño similar | No disponible | No disponible | Japonés | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros checkpoints comparables documentados en la información proporcionada. La comparación principal es con su modelo base, del que se diferencia únicamente por la modificación del tensor mlp.down_proj.weight de la capa 19 y la consiguiente desviación estilística.

## Limitaciones y advertencias

- Modelo explícitamente experimental: el autor lo describe como un checkpoint de investigación, no como un modelo listo para producción.
- Repetición: se observaron problemas de repetición en la generación, lo que exige penalización de repetición y revisión de salidas.
- Longitud de generación: se reportaron limitaciones en la longitud de las respuestas generadas.
- Tasa de acierto estilístico moderada: 36 de 50 en preguntas nuevas implica que aproximadamente un 28 % de las respuestas no presentaron la terminación objetivo natural.
- Idiomas: solo se declara japonés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas.
- Sesgos: no documentados; al derivar de un modelo base y de un ajuste estilístico, puede heredar sesgos del modelo original y del corpus de estilo.
- Riesgo de alucinación: no evaluado; en un modelo de 0,8B es esperable un riesgo elevado en tareas factuales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado del modelo base Qwen, conviene verificar las condiciones del modelo original.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede comparar su rendimiento general de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/auhulu/Qwen3.5-0.8B-Zundamon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
