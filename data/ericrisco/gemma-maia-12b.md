# ericrisco/gemma-maia-12b

## Resumen

gemma-maia-12b es un adaptador LoRA (entrenado con QLoRA y Unsloth) sobre el modelo base `unsloth/gemma-4-12b-it`, desarrollado por el usuario ericrisco. Su objetivo es especializar un modelo de lenguaje de 12 mil millones de parámetros en el conocimiento de Andorra: historia, instituciones, geografía, cultura y sociedad, respondiendo en catalán andorrano. El proyecto se denomina "maia" y se distribuye como adaptador PEFT, con versiones etiquetadas por ejecución de entrenamiento; la versión descrita en la model card es `20261104-0036-12b-k-canon`.

El modelo resuelve un problema acotado: la escasa representación del conocimiento específico de Andorra en los corpus multilingües de los modelos generalistas. Para ello se entrena sobre la variante "K-canon" de un conjunto de datos propietario de conversaciones en catalán andorrano. El autor declara explícitamente que se trata de un modelo experimental y no definitivo, y acompaña la ficha con una evaluación estadísticamente honesta que separa la mejora real en recuperación de hechos de la mera familiaridad con el formato de las preguntas de test.

La relevancia actual del modelo es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de bajo coste (una sola GPU NVIDIA L4) sobre un modelo de 12B; por otro, su evaluación con intervalos de confianza y bootstrap pareado sirve como ejemplo metodológico de cómo reportar ganancias reales frente a artefactos de benchmark. El repositorio ocupa 7,9 GB e incluye pesos en safetensors y una cuantización GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Gemma 4; el adaptador en sí es de rango bajo, la arquitectura efectiva es la del modelo base |
| Parametros totales | 11.907.350.576 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó max_length de 2048 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M incluida en el repositorio; carga en 4 bits vía Unsloth (`load_in_4bit=True`); otras cuantizaciones no disponibles |
| Idiomas soportados | catalán (`ca`), con orientación específica al catalán andorrano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado sobre `unsloth/gemma-4-12b-it`, un transformer decoder-only de 12B parámetros. El entrenamiento se realizó con QLoRA usando la librería Unsloth sobre una única GPU NVIDIA L4, con 2 épocas, learning rate de 0,0002 con scheduler coseno y 3 % de warmup, batch efectivo de 16 (2 × 8), longitud máxima de 2048 tokens, plantilla de chat `gemma-4` y semilla 3407. La pérdida se calcula únicamente sobre las respuestas del modelo, no sobre los turnos del usuario.

Los datos de entrenamiento corresponden a la variante "K-canon" de la exportación `training-data`, compuesta por conversaciones en catalán andorrano. La pérdida de validación final fue de 1,4610, con una curva de validación que desciende de forma monótona desde 1,7489 (paso 200) hasta estabilizarse en torno a 1,4610 en los pasos 3600–3786. El código de entrenamiento está disponible en `training/train.py` del repositorio GitHub del proyecto. No se menciona el uso de RLHF ni DPO; el procedimiento es SFT (supervised fine-tuning) con QLoRA.

Una innovación metodológica destacable no está en la arquitectura sino en la evaluación: el autor analiza la similitud Jaccard entre preguntas de benchmark y preguntas de práctica para descomponer la mejora en "familiaridad con el formato" frente a "conocimiento real", y reporta intervalos de confianza con bootstrap pareado. El modelo se entrena siempre con un system message fijo en catalán que define su identidad como asistente experto en Andorra, y se recomienda reutilizarlo en inferencia.

## Capacidades

- Generación de texto conversacional en catalán, con registro y habla de Andorra.
- Recuperación de hechos sobre Andorra: historia, instituciones (Consell de la Terra, Querimònia, Constitución de 1993), geografía (las siete parroquias), cultura y gastronomía.
- Respuesta en formato de opción múltiple (letra) de forma consistente: la versión actual no produce respuestas en prosa cuando se espera una letra, a diferencia de la ejecución anterior.
- Conversación multi-turno con plantilla de chat `gemma-4` y system message específico.
- Capacidades heredadas del modelo base Gemma 4 12B (razonamiento general, código, matemáticas), aunque no se han evaluado ni documentado en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no documentadas.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Asistente cultural y turístico de Andorra: el modelo puede responder preguntas sobre parroquias, historia medieval (Consell de la Terra, 1419), instituciones y tradiciones en catalán andorrano, con un tono natural adecuado para atención al visitante o ciudadano.
- Educación y divulgación local: útil para generar materiales didácticos sobre la Constitución de 1993, la Querimònia o la gastronomía típica (coca massegada), siempre con revisión humana dada la tasa de acierto del 47 % en recuerdo de hechos.
- Punto de partida para ajuste fino adicional: al ser un adaptador LoRA Apache 2.0 sobre Gemma 4 12B, sirve como base para proyectos que necesiten especializar aún más el modelo en dominios andorranos concretos (derecho, administración, patrimonio).
- Investigación en evaluación de LLMs: el modelo y su benchmark (maia-bench, 926 preguntas) constituyen un caso de estudio reproducible sobre cómo medir ganancias reales de fine-tuning separando familiaridad de formato y conocimiento.
- Despliegue ligero en local: la cuantización Q4_K_M incluida permite ejecutar el modelo con Ollama o llama.cpp en hardware de consumo, útil para prototipos y demos sin infraestructura cloud.
- Generación de contenido en catalán andorrano: redacción de textos breves, respuestas a preguntas frecuentes o fichas informativas con el registro local, partiendo del system message entrenado.
- Experimentación con QLoRA de bajo coste: el pipeline (Unsloth + L4 + LoRA r=32) es replicable para equipos que quieran ajustar un 12B con recursos limitados.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. La evaluación se realizó con ambos modelos en GGUF Q4_K_M a través de Ollama, temperatura 0 y las mismas condiciones.

**Recuerdo de hechos** sobre 338 preguntas retenidas acerca del canon aumentado, con formulación nunca vista en entrenamiento (respuesta correcta = contiene las palabras clave esperadas):

| Modelo | Hechos recordados |
|---|---:|
| Gemma 4 12B (base) | 41 / 338 (12 %) |
| maia (`20261104-0036-12b-k-canon`) | 160 / 338 (47 %) |

maia recupera 126 hechos que el modelo base falla y falla 7 que el base acertaba.

**maia-bench** (926 preguntas sobre Andorra, juez Gemini 3.8 Flash; las preguntas del benchmark y los artículos reservados nunca se entrenan):

| Tipo de pregunta | Gemma 4 12B (base) | maia | Diferencia (IC 95 %, bootstrap pareado) |
|---|---:|---:|---|
| Todas | 37,4 % | 43,3 % | +5,9 pts [+2,8; +8,9] |
| Opción múltiple (604) | 51,5 % | 60,3 % | +8,8 pts [+4,6; +13,1] |
| Abiertas (231) | 13,0 % | 13,9 % | +0,9 pts [−2,8; +4,5] |
| Trampa (91) | 6,0 % | 5,5 % | −0,5 pts [−5,5; +3,8] |

**Descomposición por similitud** (Jaccard sobre palabras de 3 o más letras entre pregunta de benchmark y su pregunta de práctica más cercana):

| Preguntas del benchmark | n | Diferencia (IC 95 %) |
|---|---:|---|
| Opción múltiple, similitud ≥ 0,2 | 341 | +14,7 pts [+8,8; +20,5] |
| Opción múltiple, similitud < 0,2 | 263 | +1,1 pts [−5,3; +8,0] |
| Todas sin pregunta de práctica similar (< 0,2, más abiertas y trampa) | 585 | +0,8 pts [−2,6; +4,1] |
| Temas no cubiertos por los datos de entrenamiento | 82 | −3,1 pts [−11,0; +4,9] |

El autor advierte que el 43,3 % global sobreestima lo aprendido: la mejora se concentra en preguntas de opción múltiple con alta similitud con la práctica, y desaparece (+0,8 pts, no significativo) en el resto. La ejecución anterior, con los mismos hechos pero sin práctica de opción múltiple, obtuvo 35,0 % y respondió en prosa en lugar de con una letra en 67 de las 604 preguntas de opción múltiple.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 7–8 GB para los pesos más overhead de contexto; en 4 bits vía Unsloth, en torno a 8–10 GB; en precisión completa (fp16/bf16), unos 24 GB solo para pesos.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), A100, H100 para despliegue de mayor throughput; RTX 4090 (24 GB) para fp16 y cuantizaciones altas.
- GPU de consumo: sí, cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8–12 GB con Q4_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En 8 GB puede requerir offload parcial.
- Opciones de despliegue: Ollama y llama.cpp con el GGUF Q4_K_M incluido; Unsloth (`FastModel.from_pretrained(..., load_in_4bit=True)`); PEFT estándar sobre el modelo base; vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-maia-12b (este) | 12B (adaptador LoRA) | no disponible | Andorra, catalán andorrano | Apache 2.0 | HuggingFace, GGUF Q4_K_M |
| Gemma 4 12B IT (base) | 12B | no disponible | Generalista, multilingüe | según licencia de Gemma (no disponible en la información) | HuggingFace |
| Modelos especializados en catalán de tamaño similar | no disponible | no disponible | Catalán general | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada; la única comparación cuantitativa documentada es contra el propio modelo base Gemma 4 12B IT, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que "no es un modelo final todavía".
- La mejora global de +5,9 pts en maia-bench se concentra en preguntas de opción múltiple con alta similitud a la práctica; en preguntas sin práctica similar la ganancia es de +0,8 pts y no es estadísticamente significativa (IC [−2,6; +4,1]).
- En temas no cubiertos por los datos de entrenamiento el rendimiento empeora ligeramente (−3,1 pts, IC [−11,0; +4,9]).
- Tasa de recuerdo de hechos del 47 % (160/338): más de la mitad de los hechos evaluados no se recuperan correctamente; no es apto para producción sin verificación humana en contextos factuales.
- Riesgo de alucinación en preguntas abiertas (13,9 % de acierto) y en preguntas trampa (5,5 %), similar al modelo base.
- Idiomas: solo catalán (`ca`); no se documenta soporte de castellano, inglés u otros idiomas, aunque el modelo base sea multilingüe.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 para el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base `unsloth/gemma-4-12b-it` (no detallada en la información disponible).
- Requiere usar el system message de entrenamiento en catalán para un comportamiento consistente; su omisión puede degradar la calidad de las respuestas.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no asumir su disponibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ericrisco/gemma-maia-12b
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it
- Repositorio de código: https://github.com/ericrisco/maia
- Benchmark maia-bench: https://github.com/ericrisco/maia-bench
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
