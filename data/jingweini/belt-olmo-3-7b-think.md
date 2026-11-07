# JingweiNi/BELT-OLMo-3-7B-Think

## Resumen

BELT-OLMo-3-7B-Think es un conjunto de artefactos de entrenamiento publicados por JingweiNi (EdisonNi-hku) como material reproducible del articulo "Same Beliefs, Different Policies: Learning Reusable Representations for Early Stopping in LLM Reasoning". No es un modelo de lenguaje autonomo: son checkpoints de un lector (reader) y cabezas de lectura personalizadas que se cargan junto al modelo base fijado `allenai/Olmo-3-7B-Think` mediante el scorer del repositorio BELT. El repositorio de Hugging Face ocupa 0,3 GB y contiene exclusivamente los pesos de esas cabezas, no los pesos del backbone.

El proposito del artefacto es servir de soporte al metodo BELT de parada temprana (early stopping) en cadenas de razonamiento de modelos de lenguaje. Cada checkpoint contiene un lector de cuatro objetivos (`q`, `v`, `r`, `stability`, correspondientes a Now, End, Later y Same) que se combinan escalarmente en la capa 18 del backbone para estimar en que punto conviene detener la generacion de una trayectoria de razonamiento. Se publican tres semillas (0, 1 y 2) del mismo entrenamiento para permitir reproducir la variabilidad entre inicializaciones.

La relevancia del artefacto es metodologica y de reproducibilidad: permite a investigadores replicar los resultados del articulo sin reentrenar las cabezas, siempre que dispongan del backbone en la revision exacta `d97e442d7cc678210054dbcc9b440894d62c89a4` y de las politicas de parada ajustadas por separado. No esta pensado para uso directo en produccion como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector y cabezas de lectura sobre backbone transformer (Olmo-3-7B-Think); mezcla escalar en capa 18 |
| Parametros totales | No disponible para las cabezas; el backbone Olmo-3-7B-Think tiene 7B (segun nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (la publicacion no asigna nueva licencia; se aplican los terminos del backbone y upstream) |
| Formato de pesos | PyTorch (`.pt`), con `CHECKPOINTS.json`, `SHA256SUMS` y `val_scored.jsonl` por ejecucion |

## Arquitectura y entrenamiento

El artefacto no entrena un transformer nuevo, sino un modulo de lectura sobre el backbone `allenai/Olmo-3-7B-Think`. Concretamente, se trata de la familia de mezcla escalar de la capa 18 utilizada en las tablas principales de OLMo del articulo. El lector produce cuatro objetivos (`q`, `v`, `r`, `stability`) que se interpretan como senales Now, End, Later y Same, y que alimentan la estimacion de parada. La construccion del lector autocontenido se realiza mediante `scripts/source_variants/olmo_belt` en `PYTHONPATH`, sin necesidad de la plantilla de Qwen.

El entrenamiento se ejecuto con tres semillas (0, 1, 2), cada una con su `s1_best.pt` y su `summary.json` original. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el articulo asociado es la fuente para esos detalles. Cada ejecucion incluye `val_scored.jsonl`, que el scorer requiere y copia en la salida puntuada para calibracion. No se incluyen pesos del backbone, manifiestos de preguntas, bancos completos de trayectorias ni politicas de parada BELT ya ajustadas: estos deben obtenerse o ajustarse por separado.

## Capacidades

- No es un modelo generativo autonomo: no produce texto por si mismo, sino senales de parada temprana sobre las trayectorias del backbone.
- Estimacion de parada temprana en cadenas de razonamiento mediante cuatro objetivos (`q`, `v`, `r`, `stability`).
- Integracion con el scorer del repositorio BELT para puntuar trayectorias y calibrar con `val_scored.jsonl`.
- Soporte de tres semillas para analisis de varianza entre inicializaciones.
- Reproducibilidad verificable mediante `CHECKPOINTS.json` (semilla, ruta de origen, bytes y SHA256) y `SHA256SUMS`.
- Capacidades multilingues: solo ingles.
- Tool calling, function calling, agentes y vision: no disponibles en este artefacto.

## Casos de uso

- Reproduccion de resultados del articulo: cargar cada `seed-N/s1_best.pt` como `--source-run` con `iclr_score_pool` para replicar las tablas del paper sin reentrenar las cabezas.
- Investigacion en early stopping de razonamiento: comparar las senales Now, End, Later y Same frente a heuristicas de parada basadas en longitud o confianza del modelo.
- Analisis de estabilidad entre semillas: usar las tres semillas publicadas para medir la varianza de las senales del lector y su impacto en la politica de parada.
- Calibracion de scorers: emplear `val_scored.jsonl` de cada ejecucion para ajustar la calibracion del scorer en un pipeline propio.
- Auditoria de artefactos: verificar integridad de los ficheros con `SHA256SUMS` y `CHECKPOINTS.json` antes de integrarlos en un entorno de evaluacion.
- Desarrollo de politicas de parada: combinar las cabezas publicadas con politicas ajustadas por separado (no incluidas) para evaluar el coste computacional ahorrado en inferencia de razonamiento.
- Docencia y formacion: ilustrar tecnicas de representacion reutilizable y parada temprana en modelos de razonamiento con un caso reproducible y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para las cabezas: el repositorio ocupa 0,3 GB, por lo que los checkpoints son ligeros; el requisito dominante es el del backbone Olmo-3-7B-Think.
- Backbone de 7B: se requiere memoria suficiente para cargar el modelo base (no incluido en este repositorio); no se dispone de cifras concretas de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: no disponible; depende del backbone y de la cuantizacion elegida, no de las cabezas.
- Opciones de despliegue: el artefacto se carga mediante el scorer del repositorio BELT; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para estas cabezas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BELT-OLMo-3-7B-Think | Cabezas sobre backbone de 7B | No disponible | Checkpoints de lector/cabezas para early stopping | No disponible | Hugging Face (0 descargas, 0 likes) |
| allenai/Olmo-3-7B-Think | 7B | No disponible | Modelo de lenguaje completo | No disponible | Hugging Face (modelo base) |
| Otros artefactos BELT sobre otros backbones | No disponible | No disponible | Checkpoints de lector/cabezas | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el backbone `allenai/Olmo-3-7B-Think` en la revision `d97e442d7cc678210054dbcc9b440894d62c89a4` y sin el scorer de BELT, los checkpoints no son utilizables.
- No incluye pesos del backbone, manifiestos de preguntas, bancos completos de trayectorias ni politicas de parada ajustadas; hay que obtenerlos o ajustarlos por separado.
- Solo soporta ingles.
- La publicacion no asigna nueva licencia; se aplican los terminos del backbone y upstream, lo que condiciona el uso comercial.
- Riesgo de sesgos y alucinacion: no evaluable directamente en este artefacto, ya que hereda las caracteristicas del backbone.
- Sin descargas ni likes registrados en Hugging Face, lo que implica ausencia de validacion comunitaria independiente.
- No se documentan resultados de benchmarks ni metricas de rendimiento en la informacion disponible.
- El repositorio es de 0,3 GB y esta pensado para investigacion y reproducibilidad, no para despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/JingweiNi/BELT-OLMo-3-7B-Think
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Repositorio de codigo y guia de reproduccion: https://github.com/EdisonNi-hku/BELT
- Recetas: https://github.com/EdisonNi-hku/BELT/blob/main/docs/RECIPES.md
- Lista de artefactos: https://github.com/EdisonNi-hku/BELT/blob/main/docs/ARTIFACTS.md
- Atribucion de fuentes: https://github.com/EdisonNi-hku/BELT/blob/main/NOTICE.md
