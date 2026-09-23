# robbiethompson2018/nd-rl-autoresearch-034-muon

## Resumen

nd-rl autoresearch 034_muon-lr-half es un artefacto de investigacion publicado en HuggingFace por el usuario robbiethompson2018. No es un modelo de proposito general: se trata de un experimento de "autoresearch" centrado en el estudio de optimizadores durante el preentrenamiento y el posterior ajuste por aprendizaje por refuerzo (RL). El modelo resultante tiene apenas 3,21 millones de parametros, lo que lo situa en la categoria de modelos de juguete orientados a reproducir experimentos controlados mas que a tareas de produccion.

La aportacion principal del artefacto es metodologica. Segun la model card, se entrena con el optimizador Muon aplicado a las matrices ocultas (con Q/K/V separadas, learning rate reducido a la mitad y momentum 0.95) y se remata con AdamW durante el 20 % final de un presupuesto de preentrenamiento de 300 segundos. Sobre esa base se aplican 4 rondas fijas de RL, y se reporta una mejora en una tarea interna denominada "dev-transfer theorems".

El modelo es relevante unicamente en el contexto de la investigacion sobre optimizadores y recetas de RL a pequena escala. El propio autor lo etiqueta como "incumbent" (referencia vigente) dentro de su serie de experimentos, comparandolo con una linea base AdamW previa (identificada como 012). No hay licencia declarada, ni idiomas, ni pipeline, ni benchmarks estandar publicados, por lo que su adopcion fuera del ambito de reproduccion experimental es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la referencia a Q/K/V y a matrices ocultas sugiere un transformer con atencion, pero no se confirma en la informacion) |
| Parametros totales | 3,21 millones |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos sin cuantizar en formato PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`state_dict`), sin safetensors ni GGUF |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 23 de septiembre de 2026 |
| Fecha de actualizacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura completa. La model card menciona "matrices ocultas" y "split Q/K/V", lo que apunta a un transformer con proyecciones de query, key y value separadas, pero no se especifica el numero de capas, dimensiones, cabezas de atencion ni vocabulario. El unico dato de tamano confirmado es el total de 3,21 millones de parametros.

El entrenamiento se divide en dos fases. En la primera, un preentrenamiento con un presupuesto fijo de 300 segundos, donde se aplica el optimizador Muon sobre las matrices ocultas (learning rate a la mitad respecto a una configuracion previa, momentum 0.95) y se finaliza con AdamW durante el ultimo 20 % del presupuesto. En la segunda, se ejecutan 4 rondas fijas de RL. El autor publica los scripts exactos que se ejecutaron (`pretrain.py`, `harness.py`, `remote.sh`), asi como los ficheros de preregistro y resultados (`params.json`, `results.json`), lo que permite reproducir el experimento. Se conservan pesos de preentrenamiento (`seedN/pretrain.pt`) y pesos finales tras RL (`seedN/final.pt`) para tres semillas. No se incluye estado del optimizador en los checkpoints.

## Capacidades

- Generacion de texto: no confirmada. No hay documentacion sobre tareas generativas generales.
- Razonamiento sobre tareas sinteticas: el modelo resuelve "dev-transfer theorems" de longitud mayor o igual a 7 tras el ajuste por RL, segun las metricas internas reportadas.
- Aprendizaje por refuerzo: el artefacto incluye el resultado de 4 rondas fijas de RL, pero no se describe un modo de "thinking" ni capacidades de agente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos sobre optimizadores: el repositorio incluye los scripts y preregistros necesarios para replicar la comparacion entre Muon y AdamW en el preentrenamiento de un modelo pequeno.
- Estudio de recetas de RL a pequena escala: los checkpoints `pretrain.pt` y `final.pt` por semilla permiten analizar el efecto de 4 rondas fijas de RL sobre las capacidades del modelo.
- Linea base ("incumbent") en busquedas automaticas: el autor lo marca como referencia vigente dentro de su serie `autoresearch`, por lo que sirve como punto de comparacion para nuevos experimentos de la misma familia.
- Docencia e investigacion educativa: con 3,21 millones de parametros y un presupuesto de 300 segundos, es viable entrenarlo y analizarlo en hardware modesto, lo que lo hace util para ilustrar tecnicas de optimizacion.
- Analisis de sensibilidad de hiperparametros: la variante concreta "lr-half" y momentum 0.95 permite estudiar el impacto de reducir el learning rate en Muon frente a configuraciones alternativas.
- Verificacion de teoremas sinteticos: el modelo esta orientado a resolver tareas de "dev-transfer" de longitud mayor o igual a 7, un escenario acotado que puede usarse como banco de pruebas de razonamiento controlado.

## Benchmarks y rendimiento

La model card reporta una unica metrica interna, relativa al numero de "dev-transfer theorems" resueltos con longitud mayor o igual a 7 tras 4 rondas fijas de RL. Los valores por semilla se comparan con la linea base AdamW identificada como 012.

| Metrica | Semilla 0 | Semilla 1 | Semilla 2 | Media | Linea base AdamW 012 |
|---|---|---|---|---|---|
| Dev-transfer theorems resueltos (long. >= 7) | 221 | 227 | 262 | 237 | 148 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,21 millones de parametros, los pesos ocupan aproximadamente 13 MB en fp32 y unos 6,4 MB en fp16 (estimacion derivada del numero de parametros, no confirmada por el autor).
- GPU recomendadas: no es necesario GPU. El modelo cabe en CPU sin dificultad por su tamano.
- Cabida en GPU de consumo: si. Cualquier GPU consumer, incluso integradas, puede alojarlo. No se especifican requisitos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Los pesos se distribuyen como `state_dict` de PyTorch y deben cargarse construyendo el modelo desde `pretrain.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables publicos en la informacion proporcionada. La unica referencia de comparacion es la linea base interna AdamW 012 del propio autor, cuyos 148 aciertos quedan por debajo de la media de 237 del presente experimento (034_muon-lr-half). No se detallan los parametros, contexto, licencia o disponibilidad de esa linea base.

| Modelo | Parametros | Contexto | Metrica interna (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nd-rl autoresearch 034_muon-lr-half | 3,21 M | no disponible | 237 | no disponible | HuggingFace |
| Linea base AdamW 012 | no disponible | no disponible | 148 | no disponible | no disponible |
| Modelos comparables de proposito general | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos.
- Riesgo de alucinacion: no evaluado. No hay informacion sobre el comportamiento generativo fuera de la tarea interna.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados. La referencia a `tok_mode` en el checkpoint sugiere un tokenizador configurable, pero no se detalla.
- Restricciones de licencia: la licencia es "no disponible". Al no declararse, no se puede asumir permiso para uso comercial. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Caveats para produccion: el modelo es un artefacto de investigacion de 3,21 millones de parametros, no un modelo de proposito general. El repositorio contiene pesos sin estado del optimizador, por lo que no se puede reanudar el entrenamiento tal cual. Es imprescindible cargar los pesos construyendo el modelo desde `pretrain.py` proporcionado por el autor.
- Ausencia de benchmarks estandar: los resultados solo son comparables dentro de la propia serie de experimentos, no frente a modelos conocidos.
- Estado de publicacion: el repositorio registra 0 descargas y 0 "likes", sin pipeline declarado, lo que indica que no ha sido validado por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robbiethompson2018/nd-rl-autoresearch-034-muon
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
