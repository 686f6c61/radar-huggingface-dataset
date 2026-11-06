# Appodoom/ldm-with-subd-m5-100pct

## Resumen

LDM with subdivision, M5 at 100% training size es un modelo de generación de ritmos musicales desarrollado por el usuario Appodoom, publicado en Hugging Face bajo el identificador `Appodoom/ldm-with-subd-m5-100pct`. Se trata de un checkpoint de un experimento de capacidad sobre un modelo latente de difusión (LDM, Latent Diffusion Model) orientado a la generación de patrones rítmicos en formato `.derbake`, un formato de cinco líneas vinculado a la percusión de derbake. El modelo no es un modelo de lenguaje generalista: es un extractor de características y generador de secuencias rítmicas con tokenización específica de dominio.

El checkpoint corresponde al nivel M5 del experimento de capacidad, seleccionado por la pérdida de validación guardada al 100% del tamaño de entrenamiento. Cuenta con 11.858.388 parámetros totales, 10 capas, anchura de embedding de 384, 4 cabezas de atención y una longitud de contexto de 6.656 tokens. El subconjunto de entrenamiento normal contiene 273.346 ciclos (449,28 horas) y el checkpoint exportado proviene del paso 15.600.

Su relevancia es acotada pero específica: cubre la generación de ritmos de derbake con subdivisiones, un nicho poco atendido por los modelos generativos musicales convencionales, que suelen centrarse en audio o en partituras MIDI. La información pública disponible es escasa: no se declaran licencia ni idiomas, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LDM (Latent Diffusion Model) con transformer de 10 capas, anchura 384 y 4 cabezas de atención |
| Parámetros totales | 11.858.388 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de dominio musical, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Librería | transformers (con `trust_remote_code=True`) |
| Formato de datos | `.derbake` de cinco líneas, tokens rítmicos atómicos |
| Checkpoint | paso 15.600, nivel M5, 100% del tamaño de entrenamiento |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión latente (LDM) con un backbone transformer de 10 capas, anchura de embedding de 384 y 4 cabezas de atención, operando sobre una ventana de contexto de 6.656 tokens. La tokenización es específica del dominio: utiliza tokens rítmicos atómicos y archivos `.derbake` de cinco líneas, lo que implica un procesador propio (`AutoProcessor`) que traduce entre el formato de archivo y la secuencia de tokens. El modelo incorpora subdivisiones rítmicas, de ahí el sufijo "with subdivision" en el nombre.

El entrenamiento se realizó sobre un subconjunto normal de 273.346 ciclos, equivalentes a 449,28 horas de material rítmico. El checkpoint exportado corresponde al paso 15.600 y fue seleccionado por la pérdida de validación guardada dentro de un experimento de capacidad que compara distintos niveles (M5 entre ellos) al 100% del tamaño de entrenamiento. No se especifican en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO; dado el dominio, es probable que el entrenamiento sea puramente auto-supervisado sobre secuencias rítmicas, pero este extremo no está confirmado.

## Capacidades

- Generación de patrones rítmicos de derbake en formato `.derbake` de cinco líneas, con subdivisiones.
- Generación condicionada por un archivo de prompt `.derbake` de entrada, con control del número de ciclos a generar (`num_cycles`).
- Extracción de características (pipeline `feature-extraction`) sobre secuencias rítmicas tokenizadas.
- Decodificación y guardado de la salida en formato `.derbake` mediante el procesador asociado.
- Soporte de generación por lotes limitado: tamaño de lote uno y como máximo 16 tiempos (beats) por ciclo.
- Informe de generación opcional (`return_generation_report=True`) con detalle de ciclos aceptados y descartados.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Generación de variaciones rítmicas de derbake para producción musical: el modelo recibe un patrón semilla en `.derbake` y genera un número configurable de ciclos nuevos, útil para crear acompañamientos de percusión en estudios que trabajan con este formato.
- Creación de material didáctico de percusión: a partir de un patrón base se pueden generar ciclos con subdivisiones para ejercicios progresivos de derbake, dado que el modelo está entrenado sobre 273.346 ciclos y 449,28 horas de material.
- Prototipado rápido de ideas rítmicas: el flujo de uso (cargar procesador, cargar modelo, generar, guardar) permite integrar la generación en un script de exploración creativa con pocas líneas de código.
- Investigación en modelos generativos musicales de nicho: el checkpoint forma parte de un experimento de capacidad (M5 al 100%), por lo que sirve como punto de comparación reproducible en estudios sobre escalado de LDMs aplicados a ritmo.
- Generación de datasets sintéticos de ritmo: los ciclos generados pueden servir para aumentar corpus de entrenamiento de otros sistemas de análisis rítmico, siempre que se valide la calidad de la salida.
- Integración en herramientas de composición asistida: mediante el procesador y el modelo cargados con `trust_remote_code=True`, se puede exponer la generación como servicio interno que reciba y devuelva archivos `.derbake`.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test normal guardado (17 archivos, 34.184 ciclos, 56,10 horas), evaluados con el scorer LDM archivado sobre una NVIDIA A100 SXM de 80 GB:

| Métrica | Valor |
|---|---:|
| Exact HIT accuracy (incluyendo silencio) | 72,689% |
| Overall token accuracy | 81,697% |
| Skeleton HIT accuracy | 95,825% |
| Cross-entropy de test | 0,370392 |
| Cross-entropy de validación del checkpoint guardado | 0,371199 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Con 11,86 millones de parámetros, el modelo es muy pequeño: los pesos en safetensors ocupan del orden de decenas de megabytes, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- VRAM estimada para inferencia: por debajo de 1 GB en precisión completa; no se dispone de cifras oficiales de cuantización.
- GPU recomendadas: cualquier GPU moderna es suficiente; la evaluación oficial se realizó en una NVIDIA A100 SXM de 80 GB, pero no es necesaria para la inferencia.
- Cabe en GPU consumer: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs de gama de entrada con suficiente memoria para el contexto de 6.656 tokens.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (`AutoModel` y `AutoProcessor` con `trust_remote_code=True`); no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de ritmo de derbake ni resultados de benchmarks frente a alternativas.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; se recomienda fijar una revisión concreta (commit SHA) para reproducibilidad y seguridad.
- Soporta únicamente tamaño de lote uno y un máximo de 16 tiempos por ciclo, lo que limita el throughput en escenarios de generación masiva.
- Si se alcanza el tope de tokens antes de completar los ciclos solicitados, se lanza un error y no se produce archivo de salida; el flujo debe gestionar este caso.
- Los ciclos inválidos se descartan con un aviso de Python; sin `return_generation_report=True` no hay visibilidad detallada de los descartes.
- El escritor de salida fija 120 BPM, amplitud 1,5 y una línea de esqueleto en blanco, sin parámetros configurables documentados.
- No se han publicado datos sobre sesgos, riesgo de alucinación en el sentido lingüístico (no aplica) ni limitaciones idiomáticas; el modelo es de dominio musical y no procesa lenguaje natural.
- El repositorio presenta 0 descargas y 0 likes, y el tamaño declarado es 0,0 GB, lo que sugiere un estado muy incipiente y poca validación externa.
- No hay información sobre cuantizaciones disponibles ni sobre el rendimiento en hardware distinto de la A100 usada en la evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/Appodoom/ldm-with-subd-m5-100pct
