# ilkerkara/yilki-kulun-100m

## Resumen

Yılkı Kulun 100M es un modelo de lenguaje base en turco de 100,1 millones de parámetros, entrenado desde cero por ilkerkara sin inicialización a partir de otro modelo ni destilación. Está pensado como un experimento de entrenamiento reproducible a pequeña escala: todo el preentrenamiento se realizó sobre una única GPU de consumo RTX 3080 de 10 GB, con un presupuesto de aproximadamente 2.000 millones de tokens procedentes del subconjunto turco de FineWeb-2. El resultado es un predictor de siguiente token que genera texto gramaticalmente correcto en turco, pero sin ajuste de instrucciones, de chat ni de seguridad.

La arquitectura es propia (`YilkiForCausalLM`, en un único archivo `modeling_yilki.py`), un transformer decoder-only de 12 capas con dimensión oculta 768, atención GQA con 12 cabezas de consulta y 4 de clave/valor, SwiGLU, RMSNorm, QK-norm y RoPE. El vocabulario es un BPE turco de 32.000 tokens y la longitud de contexto es de 1.024 tokens, muy limitada para los estándares actuales.

Su relevancia es principalmente metodológica y de investigación: documenta de forma transparente el proceso de entrenamiento (Muon + AdamW, esquema WSD, 30.518 pasos de 65.536 tokens), publica métricas de bits por byte en ocho dominios turcos y advierte explícitamente de los riesgos de privacidad y de fuga de evaluación. No es un modelo apto para producción ni para tareas de razonamiento o conocimiento factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, clase propia `YilkiForCausalLM` (no es una clase estándar de transformers) |
| Parametros totales | 100.094.208 (100,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Turco (tr); otros idiomas no evaluados y desaconsejados por el autor |
| Licencia | Apache-2.0 (pesos y código); datos de entrenamiento FineWeb-2 bajo ODC-BY 1.0 |
| Formato de pesos | safetensors, con código remoto (`trust_remote_code=True` requerido) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas, dimensión oculta 768, 12 cabezas de atención y 4 cabezas de clave/valor (atención de consultas agrupadas, GQA). Usa MLP SwiGLU con dimensión intermedia 2.048, RMSNorm, QK-norm en consultas y claves, RoPE con theta 10.000 y embeddings de entrada y salida atados. El tokenizador es un BPE turco de 32.000 piezas. La implementación vive en un solo archivo `modeling_yilki.py` que solo depende de `torch` y `transformers`, lo que obliga a cargar el modelo con código remoto.

El entrenamiento se hizo desde cero sobre el subconjunto turco de FineWeb-2, con un pool de aproximadamente 2.300 millones de tokens y unos 2.000 millones vistos sin repetición sobre el pool. Se ejecutaron 30.518 pasos con 65.536 tokens por paso (batch 4 × 16 × 1.024). La optimización combina Muon para las matrices internas y AdamW, con un esquema de learning rate WSD que decae en el último 10 % del entrenamiento. Los documentos se separaron con `<eos>` y no se antepuso `<bos>`. El código de entrenamiento no se ha publicado todavía.

## Capacidades

- Generación de texto en turco como predictor de siguiente token: produce continuaciones gramaticalmente correctas y fluidas.
- Finalización de texto y autocompletado creativo breve (poesía, prosa, descripciones) a partir de un prefijo.
- Capacidad lingüística medible: 91,24 % de precisión macro en TurBLiMP (16 subconjuntos), lo que indica buen modelado de morfosintaxis turca.
- Representaciones útiles para ajuste fino supervisado en tareas de clasificación y etiquetado (NER, análisis de sentimiento), según los resultados del autor.
- No dispone de tool calling ni function calling.
- No dispone de modo agente, razonamiento multi-paso ni thinking mode.
- No dispone de visión, audio ni multimodalidad.
- No dispone de ajuste de instrucciones, formato de respuesta ni alineación de seguridad.
- Multilingüismo: no soportado; solo turco evaluado.

## Casos de uso

- Investigación sobre entrenamiento eficiente desde cero: sirve como referencia reproducible de un pipeline completo (tokenizador, Muon + AdamW, WSD) ejecutado en una RTX 3080, útil para estudiar curvas de pérdida y decisiones de diseño a escala de 100 M.
- Generación de texto creativo breve en turco: continuaciones de poemas, relatos cortos o descripciones de menos de 1.024 tokens, donde la fluidez gramatical prima sobre la coherencia factual.
- Ajuste fino para clasificación de sentimiento en turco: el autor reporta 91,45 % de exactitud en Movie y 81,37 % en Product tras fine-tuning, por lo que puede servir como encoder-inicialización barato para clasificadores de reseñas.
- Reconocimiento de entidades nombradas en turco: con ajuste fino alcanza F1 de 0,894 en WikiANN y 0,702 en WikiNER, adecuado para prototipos de extracción de entidades en corpus turcos.
- Evaluación de tokenizadores BPE turcos: al publicar el vocabulario de 32.000 piezas y métricas bpb por dominio, permite comparar la eficiencia de compresión de distintos tokenizadores sobre texto turco real.
- Docencia y divulgación: modelo pequeño (1,6 GB de repositorio, 100 M de parámetros) que cabe en cualquier GPU de consumo y permite explicar de extremo a extremo el ciclo de vida de un LLM sin infraestructura costosa.
- Baseline en experimentos de privacidad y memorización: el autor documenta una tasa de reproducción literal del 0,8 % sobre datos personales detectados, lo que lo convierte en un caso de estudio controlado sobre fuga de PII en modelos pequeños.

## Benchmarks y rendimiento

Métricas publicadas por el autor. Los valores de ajuste fino se midieron con su propio protocolo (media de dos semillas) y no son directamente comparables con cifras publicadas de otros modelos.

| Evaluación | Métrica | Resultado |
|---|---|---|
| TurBLiMP (16 subconjuntos) | Exactitud macro | 91,24 % |
| WikiANN (NER) | F1 (media de 2 semillas) | 0,894 |
| WikiNER (NER) | F1 (media de 2 semillas) | 0,702 |
| Movie (sentimiento) | Exactitud (media de 2 semillas) | 91,45 % |
| Product (sentimiento) | Exactitud (media de 2 semillas) | 81,37 % |

Bits por byte (bpb, menor es mejor) sobre texto en crudo, por dominio:

| Dominio | bpb |
|---|---|
| Académico | 0,910 |
| Cosmos | 0,828 |
| FineWeb-2 | 1,143 |
| Foro | 1,665 |
| HPLT 2 | 1,103 |
| Noticias curadas | 1,071 |
| Wikipedia | 1,375 |
| Wikifuente | 1,017 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de razonamiento o código en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos en float32 ocupan aproximadamente 400 MB (100,1 M × 4 bytes); con overhead de activaciones y caché KV para 1.024 tokens, la inferencia cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El propio autor entrenó en una RTX 3080 de 10 GB; para inferencia bastan GTX 1650, RTX 3050, RTX 4090, A100 o H100 (estas últimas muy sobredimensionadas para el modelo).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales y en CPU con memoria RAM suficiente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se han publicado conversiones a GGUF, por lo que llama.cpp u Ollama requerirían convertir previamente los pesos y portar la arquitectura. vLLM y TGI no soportan de forma nativa la clase `YilkiForCausalLM` sin trabajo de integración.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables bajo el mismo protocolo para establecer una comparación rigurosa. La siguiente tabla recoge únicamente características estructurales verificables.

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| Yılkı Kulun 100M | 100,1 M | 1.024 | Turco | Apache-2.0 | safetensors + código remoto |
| Modelos tipo GPT-2 small | ~124 M | 1.024 | Inglés | MIT | safetensors |
| Modelos tipo SmolLM-135M | ~135 M | 2.048 | Inglés | Apache-2.0 | safetensors, GGUF |
| Modelos tipo Qwen2.5-0.5B | ~494 M | 32.768 | Multilingüe | Apache-2.0 | safetensors, GGUF |

Las alternativas indicadas son referencias de categoría por tamaño; no se dispone de resultados de benchmarks del modelo frente a ellas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones, no mantiene formato de respuesta ni tiene alineación de seguridad.
- Coherencia limitada: pierde el hilo en textos largos y no responde de forma fiable a preguntas factuales; su capacidad de conocimiento es muy reducida por tamaño.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación alto en cualquier consulta factual; no debe usarse como fuente de información.
- Sesgos y contenido inapropiado: el corpus proviene de web abierta y puede contener sesgos, desinformación y material inapropiado.
- Privacidad: el autor documenta que aproximadamente el 0,8 % de los fragmentos de datos personales detectados (4 de 492) se reproducen literalmente. No debe usarse para extraer o recopilar información personal, y no debe confiarse en correos, teléfonos, identificadores o direcciones que aparezcan en sus salidas.
- Fuga de evaluación: cerca del 0,8 % del corpus de entrenamiento solapa con conjuntos de evaluación (WebFAQ, STS22, sentencias judiciales), por lo que las métricas de ajuste fino y benchmarks pueden estar infladas.
- Solo turco: no se ha evaluado en otras lenguas y su uso en ellas está desaconsejado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar `modeling_yilki.py` antes de cargarlo.
- Licencia Apache-2.0 para pesos y código, pero los datos FineWeb-2 son ODC-BY 1.0 y exigen atribución en trabajos derivados.
- El código de entrenamiento no está publicado, lo que limita la reproducibilidad completa del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilkerkara/yilki-kulun-100m
- Dataset de entrenamiento (FineWeb-2): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Perfil del autor en Hugging Face: https://huggingface.co/ilkerkara
