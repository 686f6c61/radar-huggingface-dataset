# Appodoom/ldm-with-subd-m5-14-4pct

## Resumen

El modelo `ldm-with-subd-m5-14-4pct` es un checkpoint de un modelo de difusión latente (LDM, Latent Diffusion Model) especializado en la generación de ritmos de percusión en formato `.derbake`, un formato de cinco líneas asociado al instrumento derbake. Lo desarrolla el usuario Appodoom y se publica en Hugging Face bajo la librería `transformers` con código personalizado (`trust_remote_code=True`). No es un modelo de lenguaje generalista: es un modelo de dominio muy específico, orientado a la síntesis y predicción de patrones rítmicos.

El modelo forma parte de un experimento de capacidad denominado "LDM capacity experiment", en el que este checkpoint corresponde al nivel M5 con un 14,4 % del tamaño de entrenamiento. Emplea 10 capas, anchura de embedding de 384, 4 cabezas de atención y una longitud de contexto de 6.656 tokens. Cuenta con 11.858.388 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos muy pequeños, aptos para inferencia en CPU o GPU de gama baja.

Su relevancia es acotada pero concreta: demuestra que un modelo de difusión compacto puede aprender a generar secuencias rítmicas estructuradas con una precisión de esqueleto superior al 95 % en el conjunto de test reservado. Resulta útil para investigadores que trabajen en generación musical simbólica, en particular en ritmos de percusión de tradición oral, y para quienes quieran reproducir o extender el experimento de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LDM (Latent Diffusion Model) con transformer de 10 capas y 4 cabezas de atención; código personalizado (`ldm_rhythm`) |
| Parametros totales | 11.858.388 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors publicado; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre tokens rítmicos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código de modelo y procesador personalizado) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión latente con un backbone transformer de 10 capas, anchura de embedding de 384 y 4 cabezas de atención, con una ventana de contexto de 6.656 tokens. El modelo opera sobre "tokens rítmicos atómicos" y genera ciclos en el formato `.derbake` de cinco líneas. El checkpoint exportado corresponde al paso 17.200 de entrenamiento y fue seleccionado por la menor pérdida de validación guardada dentro del experimento de capacidad en el nivel M5 al 14,4 % del tamaño de entrenamiento.

El subconjunto de entrenamiento normal contiene 39.352 ciclos, equivalentes a 64,65 horas de material. El conjunto de test reservado consta de 17 archivos, 34.184 ciclos y 56,10 horas. La evaluación se realizó con el scorer LDM archivado sobre una NVIDIA A100 SXM de 80 GB. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones como decodificación especulativa; al tratarse de un modelo de difusión aplicado a secuencias simbólicas, el proceso de muestreo es iterativo y descarta ciclos inválidos durante la generación.

## Capacidades

- Generación de ritmos de percusión en formato `.derbake` de cinco líneas, con tokens rítmicos atómicos.
- Generación condicionada por un archivo de prompt `.derbake`, con un número de ciclos especificado por el usuario (`num_cycles`).
- Generación por lotes de tamaño uno, con un máximo de 16 pulsos (beats) por ciclo.
- Filtrado interno de ciclos inválidos: los ciclos muestreados no válidos se omiten con un aviso de Python y no se incluyen en la salida.
- Informe de generación opcional (`return_generation_report=True`) para inspeccionar el proceso.
- Escritura de archivos `.derbake` con 120 BPM, amplitud 1,5 y línea de esqueleto en blanco.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Generación de variaciones rítmicas para producción musical: dado un patrón semilla en `.derbake`, el modelo genera diez ciclos nuevos que pueden importarse en un DAW o en un secuenciador para explorar variaciones de derbake.
- Investigación en generación musical simbólica: sirve como línea base reproducible para estudiar el efecto del tamaño de entrenamiento en modelos de difusión aplicados a ritmo, gracias a su configuración documentada (M5, 14,4 %, paso 17.200).
- Aumentación de datasets rítmicos: generar ciclos sintéticos adicionales para ampliar corpus de percusión de tradición oral, con la cautela de revisar la calidad musical de la salida.
- Docencia y divulgación: modelo pequeño (11,8 M de parámetros) que cabe en hardware modesto y permite explicar de forma práctica el funcionamiento de un LDM sobre secuencias discretas.
- Prototipado de herramientas de acompañamiento rítmico: integrable en un pipeline que reciba un patrón de referencia y devuelva variaciones para práctica instrumental.
- Evaluación de scorers y métricas rítmicas: el checkpoint y sus resultados de test permiten validar implementaciones del scorer LDM archivado contra cifras de referencia publicadas.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (17 archivos, 34.184 ciclos, 56,10 horas), evaluados con el scorer LDM archivado en una NVIDIA A100 SXM de 80 GB:

| Metrica | Valor |
|---|---:|
| Exact HIT accuracy (incluyendo silencio) | 72,686 % |
| Overall token accuracy | 81,689 % |
| Skeleton HIT accuracy | 95,715 % |
| Test cross-entropy | 0,369616 |
| Validation cross-entropy del checkpoint guardado | 0,370314 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es un LLM y no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 11,86 M de parámetros en fp32, los pesos ocupan aproximadamente 47 MB; en fp16, unos 24 MB. El cuello de botella es el contexto de 6.656 tokens y el bucle de muestreo del LDM, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; la evaluación oficial se hizo en una A100 SXM de 80 GB, pero ese hardware es sobredimensionado para el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código personalizado (`ldm_rhythm`), el despliegue está limitado a `transformers` con `AutoModel` y `AutoProcessor`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El muestreo es iterativo y por lotes de tamaño uno, con un máximo de 16 pulsos por ciclo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (LDM para generación rítmica simbólica) en la documentación proporcionada. El propio autor lo sitúa dentro de un "LDM capacity experiment" con niveles M1 a M5, pero no se detallan los otros checkpoints ni sus métricas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ldm-with-subd-m5-14-4pct | 11,86 M | 6.656 tokens | Generación rítmica `.derbake` | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo genera ritmos en formato `.derbake`; no es utilizable para texto, código, visión ni tareas generales.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia explícita es un riesgo legal para producción.
- Requiere `trust_remote_code=True`: ejecuta código del repositorio, lo que implica un riesgo de seguridad y obliga a fijar una revisión concreta (commit SHA) para reproducibilidad.
- Limitaciones de generación documentadas: tamaño de lote uno, máximo de 16 pulsos por ciclo, y error sin archivo de salida si se alcanza el tope de tokens antes de completar los ciclos válidos solicitados.
- Los ciclos inválidos se descartan silenciosamente (solo con un aviso de Python), lo que puede reducir el número de ciclos efectivos respecto al solicitado.
- Riesgo de sobreajuste al corpus de entrenamiento: con 39.352 ciclos y un modelo pequeño, la diversidad rítmica generada puede ser limitada; no se documentan evaluaciones de diversidad.
- No se documentan sesgos, idiomas ni comportamiento fuera de distribución; al ser un modelo simbólico, los sesgos relevantes serían estilísticos (sobrerrepresentación de ciertos patrones del corpus).
- Sin garantías de calidad musical: las métricas de exactitud de tokens no equivalen a evaluación perceptual por músicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Appodoom/ldm-with-subd-m5-14-4pct
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
