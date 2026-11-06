# Appodoom/ldm-with-subd-m2-3-6pct

## Resumen

LDM with subdivision, M2 at 3.6% training size (identificador `Appodoom/ldm-with-subd-m2-3-6pct`) es un modelo de generacion de ritmos de percusion desarrollado por el usuario Appodoom en el marco de un experimento de capacidad sobre un modelo latente de difusion (LDM). No es un modelo de lenguaje generalista: esta entrenado para generar patrones ritmicos en el formato `.derbake`, un formato de cinco lineas asociado al instrumento de percusion derbake. El checkpoint corresponde al punto de control M2 seleccionado por perdida de validacion dentro del barrido de capacidad al 3,6 % del tamano de entrenamiento.

El modelo es deliberadamente pequeno: 1.197.972 parametros totales, 4 capas, anchura de embedding de 192 y 4 cabezas de atencion, con una longitud de contexto de 6.656 tokens. Su interes es experimental y de investigacion: permite estudiar como escala un LDM de generacion simbolica de ritmo cuando se reduce drasticamente el volumen de datos de entrenamiento, manteniendo una metrica de exactitud por token relativamente alta gracias a la estructura repetitiva del material.

La relevancia practica es limitada fuera de la investigacion en generacion musical simbolica y percusion. Se distribuye con la libreria `transformers`, requiere `trust_remote_code=True` y su uso esta pensado para generar ciclos ritmicos en lotes de tamano uno con un maximo de 16 pulsos por ciclo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LDM (modelo latente de difusion) con transformer de 4 capas, anchura 192 y 4 cabezas de atencion; tarea de generacion de ritmo (`ldm_rhythm`) |
| Parametros totales | 1.197.972 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre tokens ritmicos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de transformers con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un LDM con un transformer de 4 capas, embedding de anchura 192 y 4 cabezas de atencion, que trabaja sobre tokens ritmicos atomicos y ficheros `.derbake` de cinco lineas. El contexto maximo es de 6.656 tokens y la generacion se organiza en ciclos, con un limite de 16 pulsos por ciclo y lote de tamano uno. El checkpoint exportado corresponde al paso 20.000 de entrenamiento.

El entrenamiento se realizo sobre el 3,6 % del tamano de entrenamiento del experimento de capacidad, con un subconjunto normal de 9.830 ciclos (16,15 horas de material). La evaluacion se hizo sobre una particion de test normal de 17 ficheros, 34.184 ciclos y 56,10 horas, usando el scorer LDM archivado del proyecto sobre una NVIDIA A100 SXM de 80 GB. No se documentan en la informacion disponible detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion mas alla del filtrado de ciclos invalidos durante la generacion.

## Capacidades

- Generacion de patrones ritmicos simbolicos en formato `.derbake` de cinco lineas, con tokens ritmicos atomicos.
- Generacion por ciclos: la llamada a `generate` acepta `num_cycles` y `max_new_tokens`, y devuelve unicamente los ciclos nuevos aceptados.
- Filtrado de muestras invalidas: los ciclos muestreados invalidos se descartan con un aviso de Python; `return_generation_report=True` ofrece el detalle.
- Escritura de ficheros `.derbake` mediante `processor.save_derbake`, con 120 BPM, amplitud 1,5 y linea de esqueleto vacia.
- Extraccion de caracteristicas (`pipeline: feature-extraction`) a traves de la API de `transformers`.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un modelo de dominio especifico de ritmo.

## Casos de uso

- Investigacion en generacion musical simbolica: permite reproducir el punto M2 del barrido de capacidad al 3,6 % y comparar la curva de perdida frente a otros checkpoints del mismo experimento.
- Generacion de variaciones ritmicas para percusion derbake: el modelo produce ciclos de hasta 16 pulsos que pueden exportarse a `.derbake` y editarse posteriormente en un editor de partituras ritmicas.
- Creacion de datasets sinteticos de ritmo: dado que devuelve solo ciclos aceptados y descarta los invalidos, puede usarse para aumentar corpus de entrenamiento con material estructuralmente valido.
- Prototipado de herramientas de acompanamiento ritmico: integrable en un script de Python que lea un `prompt.derbake` y escriba un `generated.derbake` para su reproduccion o analisis.
- Estudio de eficiencia de datos: con solo 9.830 ciclos de entrenamiento (16,15 horas) y 1,2 M de parametros, sirve como referencia de que nivel de exactitud se alcanza con recursos minimos.
- Evaluacion de scorers LDM: el checkpoint y sus metricas de test permiten validar implementaciones del scorer archivado sobre una particion publica de 17 ficheros y 56,10 horas.

## Benchmarks y rendimiento

Resultados de la particion de test normal (17 ficheros, 34.184 ciclos, 56,10 horas), evaluados con el scorer LDM archivado en una NVIDIA A100 SXM de 80 GB:

| Metrica | Valor |
|---|---:|
| Exact HIT accuracy, incluida la silencios | 71,471 % |
| Exactitud global por token | 81,003 % |
| Skeleton HIT accuracy | 94,133 % |
| Entropia cruzada de test | 0,395484 |
| Entropia cruzada de validacion del checkpoint guardado | 0,395874 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado el tamano de 1.197.972 parametros; no se documenta una estimacion oficial.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; la evaluacion del autor se realizo en una NVIDIA A100 SXM de 80 GB, muy por encima de lo necesario para el modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090), y tambien en CPU.
- Opciones de despliegue: `transformers` con `AutoModel` y `AutoProcessor` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo solo admite lote de tamano uno y un maximo de 16 pulsos por ciclo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de generacion de ritmo comparables ni datos de referencia frente a los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: no es un modelo de lenguaje y no responde a prompts en lenguaje natural.
- Restriccion de generacion: lote de tamano uno y maximo de 16 pulsos por ciclo; si se alcanza el limite de tokens antes de completar los ciclos solicitados, se lanza un error y no se produce fichero de salida.
- Los ciclos invalidos se descartan silenciosamente (con aviso de Python), lo que puede reducir el numero de ciclos efectivos respecto a los solicitados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; se recomienda fijar una revision concreta (commit SHA) para reproducibilidad.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero pueden generarse patrones ritmicos no validos que el filtro descarta.
- Limitaciones de idioma: no aplica; el modelo no procesa texto natural.
- El checkpoint corresponde a un experimento de capacidad con solo el 3,6 % de los datos, por lo que su cobertura ritmica es limitada en comparacion con un entrenamiento completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Appodoom/ldm-with-subd-m2-3-6pct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
