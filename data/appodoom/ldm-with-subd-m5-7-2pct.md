# Appodoom/ldm-with-subd-m5-7-2pct

## Resumen

LDM with subdivision, M5 at 7.2% training size (identificador `Appodoom/ldm-with-subd-m5-7-2pct`) es un checkpoint de un modelo de difusion latente (LDM, *latent diffusion model*) orientado a la generacion de ritmos en formato `.derbake`, un formato de cinco lineas asociado a la percusion derbake. Lo publica el usuario Appodoom en HuggingFace y forma parte de un experimento de capacidad denominado "LDM capacity experiment", en el que se comparan distintos tamanos de modelo y fracciones del corpus de entrenamiento. Este checkpoint concreto corresponde al modelo M5 entrenado con el 7,2 % del conjunto de entrenamiento.

El modelo es pequeno: 11.858.388 parametros totales segun los pesos en safetensors, con 10 capas, anchura de embedding 384, 4 cabezas de atencion y una longitud de contexto de 6.656 tokens. No es un modelo de lenguaje generalista, sino un modelo de extraccion de caracteristicas y generacion de secuencias de ritmo, con pipeline `feature-extraction` y codigo personalizado (`trust_remote_code=True`) para el procesador y el modelo.

Su relevancia es acotada y muy especializada: sirve como referencia reproducible de un experimento academico sobre modelos de difusion aplicados a ritmo y como punto de partida para quien trabaje con el formato `.derbake`. No hay informacion publica sobre licencia, idiomas ni benchmarks comparables con modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LDM (latent diffusion model) con transformer de 10 capas, anchura 384 y 4 cabezas de atencion |
| Parametros totales | 11.858.388 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 6.656 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre tokens de ritmo, no sobre texto natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con `transformers`, `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion latente con un backbone transformer de 10 capas, dimension de embedding 384 y 4 cabezas de atencion, sobre una ventana de contexto de 6.656 tokens. Trabaja con "atomic rhythm tokens" y ficheros `.derbake` de cinco lineas. El checkpoint exportado corresponde al paso 10.000 de entrenamiento y fue seleccionado por la perdida de validacion guardada dentro del experimento de capacidad LDM.

El subconjunto normal de entrenamiento contiene 19.669 ciclos (32,30 horas). El split de test reservado consta de 17 ficheros, 34.184 ciclos y 56,10 horas. La evaluacion se realizo con el scorer LDM archivado del proyecto sobre una NVIDIA A100 SXM de 80 GB. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens vistos ni si hubo etapas de RLHF o DPO; por la naturaleza del modelo (generacion de ritmo) no cabe esperar alineamiento por preferencias humanas.

## Capacidades

- Generacion de secuencias de ritmo en formato `.derbake` a partir de una entrada del mismo formato (`processor(derbake_path=...)`).
- Generacion condicionada por numero de ciclos (`num_cycles`) con un limite maximo de 16 tiempos por ciclo.
- Decodificacion de la salida a estructura de ritmo (`decode_generation`) y escritura a fichero `.derbake` (`save_derbake`).
- Descarte de ciclos invalidos durante el muestreo, con aviso de Python y posibilidad de obtener un informe detallado (`return_generation_report=True`).
- Extraccion de caracteristicas (pipeline declarado `feature-extraction`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni razonamiento multi-paso en el sentido de los LLM generalistas.
- No hay informacion sobre capacidades multilingues; el modelo no procesa lenguaje natural.

## Casos de uso

- Generacion de variaciones ritmicas: dado un fichero `.derbake` de referencia, el modelo produce nuevos ciclos con la misma estructura de cinco lineas, util para explorar variantes de un patron de derbake.
- Prototipado en investigacion sobre difusion aplicada a musica: el checkpoint sirve como baseline reproducible del experimento de capacidad LDM, con metricas de test publicadas (exact HIT, skeleton HIT, cross-entropy).
- Aumento de datos para percusion: generar ciclos adicionales a partir de un corpus pequeno de 19.669 ciclos para ampliar un dataset de entrenamiento de modelos ritmicos.
- Educacion y demostracion: ilustrar como se entrena y evalua un LDM de secuencias discretas con contexto de 6.656 tokens y un scorer especifico.
- Integracion en herramientas de composicion asistida: el modelo se puede invocar desde Python con `transformers` y `trust_remote_code=True` para generar 10 ciclos por llamada, con salida directa a `.derbake`.
- Reproduccion de resultados: al fijar la revision (`revision`) del repositorio, se puede replicar la evaluacion sobre el split de test de 17 ficheros y 34.184 ciclos.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (evaluados con el scorer LDM archivado sobre A100 SXM 80 GB):

| Metrica | Valor |
|---|---:|
| Exact HIT accuracy (incluyendo silencio) | 72,408 % |
| Overall token accuracy | 81,510 % |
| Skeleton HIT accuracy | 94,664 % |
| Cross-entropy de test | 0,375210 |
| Cross-entropy de validacion del checkpoint guardado | 0,376069 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 11,86 M de parametros, los pesos en precision completa ocupan del orden de decenas de MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA; la evaluacion oficial se realizo en una NVIDIA A100 SXM de 80 GB, pero el tamano del modelo no requiere ese hardware.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; no se especifican requisitos minimos.
- Opciones de despliegue: `transformers` con `AutoModel` y `AutoProcessor` y `trust_remote_code=True`; no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El modelo soporta batch size uno y como maximo 16 tiempos por ciclo.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de generacion de ritmo en formato `.derbake` ni checkpoints del mismo experimento de capacidad LDM con los que establecer una comparacion de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de lenguaje; no debe usarse para tareas de texto, codigo, matematicas o dialogo.
- Restriccion de batch: solo soporta batch size uno.
- Restriccion estructural: como maximo 16 tiempos por ciclo.
- Si se alcanza el limite de tokens antes de completar los ciclos solicitados, se lanza un error y no se genera fichero de salida.
- Los ciclos invalidos muestreados se descartan con un aviso de Python, lo que puede reducir el numero de ciclos efectivamente devueltos.
- El escritor de `.derbake` fija 120 BPM, amplitud 1,5 y linea de esqueleto en blanco; no se documenta configuracion de estos parametros.
- `trust_remote_code=True` ejecuta codigo del repositorio: conviene fijar la revision a un commit verificado para reproducibilidad y seguridad.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinacion en el sentido de generar patrones ritmicos plausibles pero no presentes en el corpus; no hay evaluacion de sesgos.
- Idiomas no aplicables; el modelo no procesa lenguaje natural.
- Sin informacion sobre cuantizaciones ni sobre el rendimiento fuera del split de test descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Appodoom/ldm-with-subd-m5-7-2pct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
