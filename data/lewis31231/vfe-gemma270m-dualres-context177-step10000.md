# Lewis31231/vfe-gemma270m-dualres-context177-step10000

## Resumen

VFE Gemma 270M dualres context177 step10000 es un checkpoint de entrenamiento completo en PyTorch para un estimador de funcion de valor (value function estimation, VFE) orientado a robotica, concretamente al benchmark LIBERO. Lo publica el usuario Lewis31231 en Hugging Face y combina un backbone de lenguaje Gemma 3 270M con una torre de vision Gemma 3 4B congelada para procesar observaciones de tres camaras (`zed`, `fish0`, `fish1`).

El modelo no es un LLM generativo al uso: es un estimador de valor que asigna puntuaciones en 201 bins discretos sobre el intervalo `[-1, 0]`, entrenado con entropia cruzada dura sobre anotaciones continuas. El contexto se construye con 177 pasos temporales muestreados con stride 30, y las imagenes de consulta usan 256 tokens de detalle mas 16 de alineamiento por camara, mientras que las imagenes de contexto usan solo 16 tokens por camara (de ahi el "dual-resolution" del nombre).

Su relevancia es acotada pero tecnica: se trata de un artefacto de investigacion reproducible, con estado del optimizador AdamW, cursor de entrenamiento y estados RNG de los ocho rangos, pensado para continuar entrenamiento o evaluar con protocolos concretos. No es un modelo para produccion general, y el repositorio no redistribuye los datos ni la cache de caracteristicas visuales necesarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Gemma 3 270M + torre de vision Gemma 3 4B congelada) con cabeza de valor sobre 201 bins |
| Parametros totales | no disponible (repo de 5,7 GB incluye checkpoint, optimizador y fuente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 177 pasos temporales de contexto (stride 30) mas imagenes de consulta; tokens por camara: 256 detalle + 16 alineamiento en consulta, 16 en contexto |
| Tipos de cuantizacion | no disponible (entrenamiento y checkpoint en BF16) |
| Idiomas soportados | no disponible (el modelo no es de generacion de lenguaje; el backbone Gemma 3 es multilingue pero aqui se usa como extractor) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `.pt` (modelo + optimizador AdamW + cursor + estados RNG); fuente en `.tar.gz` |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de lenguaje Gemma 3 270M entrenable con una torre de vision Gemma 3 4B congelada. El modelo procesa tres camaras (`zed`, `fish0`, `fish1`) y construye un contexto temporal de 177 timesteps con stride 30. Las imagenes de consulta se tokenizan a mayor resolucion (256 tokens de detalle mas 16 de alineamiento por camara) que las de contexto (16 tokens por camara), lo que da lugar a la denominacion "dual-resolution". La atencion es de tipo `independent_sliding_block_causal_full`. No se usa LoRA: se entrenan el backbone de lenguaje, los adaptadores y la cabeza de valor, manteniendo congelada la torre de vision.

El objetivo de entrenamiento es entropia cruzada dura sobre 201 bins de valor que cubren el intervalo `[-1, 0]`. El checkpoint corresponde al paso 10.000 de un run con configuracion final de 8 rangos con batch local 40, es decir, batch global 320 (aunque el directorio original del experimento se llame `bs160_4gpu`). Incluye estado completo de AdamW, cursor de entrenamiento y estados RNG de los ocho rangos, lo que permite continuacion exacta solo si se replican split de datos, longitud de dataset, cache de caracteristicas, world size, batch local y configuracion de muestreo. El entrenamiento usa BF16, learning rate 1e-5, weight decay 1e-4 y grad clipping de norma 1.0.

## Capacidades

- Estimacion de funcion de valor para trayectorias roboticas: produce una distribucion sobre 201 bins en `[-1, 0]` a partir de observaciones de tres camaras y un contexto temporal.
- Procesamiento multimodal de triple camara (`zed`, `fish0`, `fish1`) con tokenizacion de distinta resolucion para contexto y consulta.
- Razonamiento sobre contexto temporal largo: 177 timesteps con stride 30.
- Evaluacion de trayectorias query-context en el benchmark LIBERO mediante el protocolo de anotacion continua.
- Continuacion de entrenamiento exacta con reanudacion de optimizador, cursor y RNG (requiere ocho rangos y los mismos artefactos de datos).
- No soporta tool calling, function calling, agentes ni generacion de texto libre: no es un modelo de proposito general.
- Capacidades multilingues: no disponibles como funcionalidad del modelo final.

## Casos de uso

- Investigacion en aprendizaje por refuerzo y robotica: el checkpoint sirve como punto de partida reproducible para experimentos de estimacion de valor en LIBERO, con estado de optimizador y RNG incluidos.
- Continuacion de entrenamiento a mayor escala: permite reanudar el run en el paso 10.000 con ocho rangos y batch global 320, siempre que se disponga de la cache de caracteristicas y los splits originales.
- Evaluacion comparativa de estimadores de valor: el protocolo de evaluacion sobre 2.010 trayectorias query-context permite medir correlacion de Pearson y Spearman frente a otras variantes.
- Estudio de representaciones visuales congeladas: al mantener fija la torre Gemma 3 4B, se puede analizar cuanto aprende el backbone de lenguaje y los adaptadores sobre caracteristicas visuales preentrenadas.
- Reproducibilidad de pipelines de investigacion: los manifiestos de caracteristicas de contexto y resumen de targets permiten reconstruir la procedencia de los artefactos externos.
- Analisis de atencion y enmascaramiento: la atencion `independent_sliding_block_causal_full` y el esquema dual-resolution son un caso de estudio para disenos de contexto multimodal en robotica.
- Base para destilacion o adaptacion a otros benchmarks de manipulacion: el estimador de valor puede reutilizarse como inicializacion en tareas con estructura similar de observaciones multicamara.

## Benchmarks y rendimiento

Evaluacion de referencia reportada por el autor (protocolo de anotacion continua sobre todos los contextos, media no ponderada de metricas por trayectoria query-context, 2.010 trayectorias):

| Metrica | Valor |
|---|---|
| Pearson | 0,707761 |
| Spearman | 0,658077 |
| MAE | 0,148971 |
| MSE | 0,048503 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint se distribuye en BF16 y el repo ocupa 5,7 GB incluyendo optimizador y fuente, por lo que el estado del modelo es sustancialmente menor que esa cifra.
- GPU recomendadas: la evaluacion de referencia se ejecuta con `torchrun --nproc_per_node 4` y batch 40 por GPU; el entrenamiento exacto requiere 8 rangos.
- Cabe en GPU de consumo: no confirmado; la necesidad de cargar Gemma 3 4B como torre de vision congelada y el contexto de 177 timesteps con triple camara hacen probable que una GPU de 24 GB sea insuficiente para el pipeline completo, pero no hay dato publicado.
- Opciones de despliegue: PyTorch con `torchrun` y los scripts del repositorio (`scripts/evaluate_vfe_icl.py`, `scripts/train_vfe.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VFE Gemma 270M dualres context177 step10000 | no disponible (Gemma 3 270M + Gemma 3 4B congelado) | 177 timesteps, 3 camaras | Estimacion de valor en LIBERO | no disponible | Hugging Face, requiere datos externos |
| Gemma 3 270M (Google) | 270M | contexto de lenguaje estandar | Generacion de texto | terminos de Gemma | Hugging Face |
| Gemma 3 4B (Google) | 4B | contexto de lenguaje estandar | Generacion multimodal | terminos de Gemma | Hugging Face |

No se dispone de comparativas publicadas frente a otros estimadores de valor para LIBERO en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de generacion de texto ni un asistente: su salida es una distribucion sobre bins de valor, no lenguaje natural.
- Requiere acceso a `google/gemma-3-270m` y `google/gemma-3-4b-pt` en Hugging Face, con aceptacion de los terminos upstream y autenticacion.
- No redistribuye los datos ni la cache de caracteristicas visuales; sin esos artefactos no se puede reproducir la evaluacion ni la continuacion exacta del entrenamiento.
- La continuacion exacta exige ocho rangos, batch local 40, el mismo split, la misma longitud de dataset y la misma configuracion de muestreo; el entrenador rechaza discrepancias.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Riesgo de sobreajuste al benchmark LIBERO y al protocolo de anotacion concreto; los resultados no son extrapolables a otros dominios roboticos sin validacion.
- Idiomas soportados no disponibles; el backbone Gemma 3 es multilingue, pero el modelo final no expone capacidades linguisticas evaluadas.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos; al ser un estimador de valor, el riesgo relevante es la calibracion incorrecta de las puntuaciones, no la alucinacion textual.
- El checkpoint incluye estado de optimizador y RNG, lo que incrementa el tamano y requiere gestion cuidadosa de versiones de PyTorch y del codigo fuente del snapshot `26c6051c`.

## Enlaces

- Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-dualres-context177-step10000
- Backbone de lenguaje: https://huggingface.co/google/gemma-3-270m
- Torre de vision: https://huggingface.co/google/gemma-3-4b-pt
- Benchmark LIBERO: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: incluido como `vfe-source-26c6051c.tar.gz` en el propio repositorio de Hugging Face (commit `26c6051ca66a9891e65b43e990b1bf9a2812b305`)
