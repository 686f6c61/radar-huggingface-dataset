# Appodoom/ldm-with-subd-m5-28-8pct

## Resumen

El modelo `Appodoom/ldm-with-subd-m5-28-8pct` es un checkpoint de un experimento de capacidad sobre un modelo de difusión latente (LDM) orientado a la generación de ritmos de percusión en formato `.derbake`. Lo publica el usuario Appodoom en Hugging Face con la librería `transformers` y código personalizado (`custom_code`), y se distribuye como un modelo de extracción de características (`feature-extraction`) con la etiqueta específica `rhythm-generation`. No es un modelo de lenguaje generalista: su dominio es la generación simbólica de patrones rítmicos, en concreto ciclos de percusión del repertorio derbake.

El checkpoint corresponde al punto M5 del experimento, seleccionado al 28,8 % del tamaño de entrenamiento según la pérdida de validación guardada. Tiene 10 capas, anchura de embedding de 384, 4 cabezas de atención y un contexto de 6.656 tokens, con 11.858.388 parámetros totales según los pesos en `safetensors`. El subconjunto de entrenamiento normal contiene 78.713 ciclos (129,42 horas) y el checkpoint exportado corresponde al paso 17.400.

Su relevancia es acotada pero clara para quien investiga generación musical simbólica: ofrece métricas de test retenido (exactitud HIT del 72,699 %, exactitud global de tokens del 81,709 %, exactitud HIT de esqueleto del 95,595 % y entropía cruzada de test de 0,369579) sobre un corpus de 17 ficheros y 34.184 ciclos (56,10 horas). No hay información sobre licencia, idiomas ni benchmarks frente a otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (LDM) con transformer de 10 capas, anchura 384 y 4 cabezas de atención |
| Parametros totales | 11.858.388 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dominio es simbólico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código de modelo y procesador personalizado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión latente (LDM) aplicado a secuencias de tokens rítmicos atómicos, no a texto. El backbone es un transformer de 10 capas con anchura de embedding de 384 y 4 cabezas de atención, y el contexto máximo es de 6.656 tokens. El modelo se acompaña de un procesador personalizado que lee y escribe ficheros `.derbake` de cinco líneas, con tokens rítmicos atómicos y soporte de subdivisiones (`with-subd` en el nombre del repositorio). El proceso de generación se expone mediante `model.generate` con parámetros `num_cycles` y `max_new_tokens`, y el decodificador devuelve únicamente los ciclos aceptados.

El entrenamiento se realizó sobre un subconjunto normal de 78.713 ciclos (129,42 horas) y el checkpoint exportado es el del paso 17.400, seleccionado al 28,8 % del tamaño de entrenamiento por pérdida de validación. El checkpoint guardado tiene una entropía cruzada de validación de 0,370213. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO u otras fases de alineación. Tampoco se detalla la innovación técnica concreta del LDM más allá de la formulación de difusión latente sobre tokens rítmicos.

## Capacidades

- Generación de ritmos de percusión simbólicos en formato `.derbake` de cinco líneas.
- Manejo de tokens rítmicos atómicos con subdivisiones.
- Generación condicionada por un fichero `.derbake` de entrada (`derbake_path`).
- Generación por lotes de ciclos: el método `generate` acepta `num_cycles` y `max_new_tokens`.
- Decodificación a fichero `.derbake` mediante `processor.save_derbake`, con 120 BPM, amplitud 1,5 y línea de esqueleto en blanco.
- Informe de generación opcional (`return_generation_report=True`) para inspeccionar ciclos descartados.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso en el sentido de los LLM generalistas.
- Capacidades multilingües: no aplica; el modelo opera sobre representación simbólica rítmica, no sobre lenguaje natural.

## Casos de uso

- Generación de variaciones rítmicas para producción musical: dado un patrón `.derbake` de partida, el modelo genera nuevos ciclos que pueden exportarse directamente a fichero para su uso en un DAW o en un pipeline de composición.
- Investigación en generación musical simbólica: sirve como punto de comparación reproducible al 28,8 % del tamaño de entrenamiento dentro del experimento de capacidad del autor, con métricas de test retenido publicadas.
- Aumentación de datasets rítmicos: la generación de ciclos aceptados permite ampliar corpus de percusión con patrones sintéticos coherentes con el estilo del corpus de entrenamiento.
- Evaluación de modelos de difusión latente sobre secuencias discretas: el checkpoint permite reproducir el scorer archivado del autor sobre el split de test normal (17 ficheros, 34.184 ciclos).
- Creación de ejercicios o material didáctico de percusión: los ficheros `.derbake` generados con 120 BPM y amplitud 1,5 pueden usarse como ejemplos de estudio de subdivisiones rítmicas.
- Prototipado de herramientas de acompañamiento rítmico: al soportar batch size uno y hasta 16 tiempos por ciclo, encaja en aplicaciones interactivas de generación de patrones bajo demanda.
- Estudio de la relación entre tamaño de entrenamiento y calidad de generación: el checkpoint forma parte de una serie de puntos (M5 y otros) que permiten trazar curvas de rendimiento frente a porcentaje de datos.

## Benchmarks y rendimiento

Resultados de test retenido publicados en la model card (split normal de 17 ficheros, 34.184 ciclos y 56,10 horas, evaluado con el scorer LDM archivado en una NVIDIA A100 SXM de 80 GB):

| Metrica | Valor |
|---|---:|
| Exact HIT accuracy, incluyendo silencio | 72,699 % |
| Exactitud global de tokens | 81,709 % |
| Skeleton HIT accuracy | 95,595 % |
| Entropia cruzada de test | 0,369579 |
| Entropia cruzada de validacion del checkpoint | 0,370213 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros); estos no aplican al dominio del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,86 millones de parámetros, los pesos en precisión completa ocupan del orden de 47 MB en fp32 y unos 24 MB en fp16; el consumo real vendrá dominado por activaciones, buffers de difusión y el contexto de 6.656 tokens, no por los pesos.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; la evaluación del autor se realizó en una NVIDIA A100 SXM de 80 GB, pero ese hardware es sobredimensionado para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se disponga de memoria suficiente para el contexto y el procesador personalizado.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código de modelo/procesador propio, el despliegue estándar con vLLM, llama.cpp, Ollama o TGI no está garantizado; la vía documentada es `transformers` con `AutoModel` y `AutoProcessor`.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo está limitado a batch size uno y a un máximo de 16 tiempos por ciclo, lo que acota el rendimiento por generación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a una serie de experimentos de capacidad del mismo autor (puntos M5 y otros tamaños de entrenamiento), pero no se han facilitado especificaciones ni resultados de esos otros checkpoints para establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Appodoom/ldm-with-subd-m5-28-8pct | 11.858.388 | 6.656 tokens | no disponible | Hugging Face |
| Alternativas de generación rítmica simbólica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Modelo de nicho: solo genera ritmos en formato `.derbake`; no es un modelo de lenguaje, no responde a prompts en lenguaje natural ni procesa texto libre.
- Restricciones operativas explícitas: batch size uno, máximo de 16 tiempos por ciclo y escritura con parámetros fijos (120 BPM, amplitud 1,5, línea de esqueleto en blanco).
- Los ciclos inválidos se descartan con un aviso de Python; si se alcanza el límite de tokens antes de completar los ciclos solicitados, se lanza un error y no se produce fichero de salida.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; es recomendable fijar una revisión concreta (commit SHA) para reproducibilidad y seguridad.
- Riesgo de alucinación en el sentido de generar patrones rítmicos plausibles pero alejados del estilo deseado; la exactitud HIT exacta del 72,699 % implica que una parte relevante de las secuencias generadas no coincide exactamente con la referencia.
- Sin información sobre sesgos del corpus de entrenamiento (posibles sesgos estilísticos o de repertorio del dataset de derbake), ni sobre limitaciones idiomáticas o culturales.
- Sin datos publicados sobre cuantización, latencia o throughput, lo que dificulta planificar un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Appodoom/ldm-with-subd-m5-28-8pct
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
