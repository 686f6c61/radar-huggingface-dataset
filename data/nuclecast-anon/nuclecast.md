# nuclecast-anon/nuclecast

## Resumen

NucleCast es un sistema de nowcasting de precipitación a corto plazo publicado por el autor anónimo `nuclecast-anon` como material de acompañamiento de una submission anónima (previsiblemente en revisión). El modelo opera sobre la variable VIL (Vertically Integrated Liquid) del dataset SEVIR y resuelve una tarea de predicción espacio-temporal: 13 fotogramas de radar de entrada y 12 fotogramas de predicción de salida, con una cadencia temporal de 5 minutos, es decir, 65 minutos de contexto observado y 60 minutos de horizonte de predicción.

La publicación no contiene un único modelo, sino tres puntos de control (checkpoints) independientes que forman el sistema completo: un refinador principal (`nuclecast_sevir.ckpt`) entrenado con flow matching, un ancla determinista basada en STVMamba3 (`stvmamba3_sevir.ckpt`) que el refinador carga congelada, y un baseline SimVP-gSTA (`simvp_gsta_sevir.ckpt`) para comparación. La etiqueta `flow-matching` y la nomenclatura de los ficheros indican una arquitectura generativa de modelos de difusión/flow sobre representaciones espacio-temporales, no un transformer de lenguaje.

Es relevante ahora porque los pesos se liberan con licencia Apache 2.0 y con sumas de verificación SHA-256 publicadas, lo que permite reproducir resultados y auditar artefactos, algo poco habitual en modelos de nowcasting con publicación anónima. El repositorio completo ocupa 0,2 GB y no incluye estado de optimizador ni de entrenamiento, solo pesos e hiperparámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Refinador generativo con flow matching sobre un ancla determinista STVMamba3 (espacio-temporal); se incluye además el baseline SimVP-gSTA. Detalle interno no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de ventana de tokens. Ventana temporal: 13 fotogramas de entrada a 5 min (65 min) y 12 fotogramas de predicción a 5 min (60 min) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en precisión de entrenamiento; no hay versiones GGUF, INT8 ni FP8) |
| Idiomas soportados | no aplica (modelo de predicción meteorológica sobre radar, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.ckpt` (tres ficheros, solo pesos e hiperparámetros, sin estado de optimizador ni de entrenamiento) |
| Variable objetivo | VIL (Vertically Integrated Liquid) del dataset SEVIR |
| Cadencia temporal | 5 minutos por fotograma |
| Tamano del repositorio | 0,2 GB |
| Dataset de referencia | SEVIR; los checkpoints para ARSO no se publican porque el dataset no es público |

## Arquitectura y entrenamiento

El sistema se compone de tres artefactos con roles distintos. `stvmamba3_sevir.ckpt` es un ancla determinista basada en STVMamba3, una familia de modelos espacio-temporales construida sobre bloques de espacio de estados (Mamba) aplicados a secuencias de imágenes de radar. `nuclecast_sevir.ckpt` es el refinador de NucleCast, que carga el ancla STVMamba3 como componente congelado y se entrena con un objetivo de flow matching, un formalismo generativo que aprende un campo de velocidad que transporta una distribución simple hacia la distribución de predicciones. `simvp_gsta_sevir.ckpt` implementa SimVP-gSTA, un baseline convolucional determinista de predicción de vídeo, incluido para comparación.

No se especifican en la información disponible el número de tokens o muestras de entrenamiento, la composición exacta del dataset, la resolución espacial del parche de radar, el número de parámetros de ninguno de los tres componentes, ni si se aplicaron etapas de ajuste fino adicionales más allá del entrenamiento con flow matching. Cada fichero contiene únicamente pesos e hiperparámetros, sin estado de optimizador, por lo que no se puede reanudar el entrenamiento desde el punto exacto en que se detuvo, aunque sí se puede partir de los pesos para ajuste fino.

Los tres artefactos publicados son:

| Fichero | Modelo | SHA-256 |
|---|---|---|
| `nuclecast_sevir.ckpt` | Refinador NucleCast (carga `stvmamba3_sevir.ckpt` como ancla congelada) | `7a3591d52482d28bbb307f45f327ba703e6d2a1bdaf166f81a37e1de1d751179` |
| `stvmamba3_sevir.ckpt` | Ancla determinista STVMamba3 | `9fda3e388f4fafd00b42bb2cb71dcfeb7581a26a0d92d5dd3c67068858d62dd3` |
| `simvp_gsta_sevir.ckpt` | Baseline SimVP-gSTA | `71839ed80f6415f476957b6691d447d7ade83bfb427b3ede33656531044b7f0c` |

Los pesos se cargan mediante el código de acompañamiento, cuyo script `weights/download_weights.sh` descarga y verifica las sumas anteriores.

## Capacidades

- Predicción de precipitación a corto plazo: genera 12 fotogramas futuros de VIL a partir de 13 fotogramas observados, con 5 minutos de cadencia y por tanto 60 minutos de horizonte.
- Nowcasting determinista: el ancla STVMamba3 y el baseline SimVP-gSTA producen una única predicción determinista por entrada.
- Nowcasting generativo: el refinador con flow matching modela la incertidumbre de la predicción y permite, en principio, muestrear escenarios alternativos (el número de pasos de muestreo y el esquema de integración no se detallan en la información disponible).
- Verificación de integridad de artefactos: cada checkpoint publica su SHA-256, lo que habilita la comprobación de la descarga en pipelines automatizados.
- Capacidades no aplicables a este modelo: no hay generación de texto, razonamiento verbal, código, matemáticas, visión general, tool calling, function calling, uso como agente, multi-step reasoning ni soporte multilingüe, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Avisos de inundaciones repentinas: el modelo produce 60 minutos de predicción de VIL a resolución de radar, horizonte útil para activar protocolos de protección civil en cuencas pequeñas con tiempos de concentración cortos, donde los modelos numéricos de mesoescala no llegan con suficiente antelación.
- Gestión de drenaje urbano: los gestores de alcantarillado pueden usar la predicción de 12 fotogramas para anticipar picos de caudal y preposicionar tanques de tormenta o regular compuertas antes de que llegue la célula convectiva.
- Operación aeroportuaria: anticipar la llegada de núcleos convectivos sobre el campo de vuelo con 30-60 minutos de margen permite reorganizar secuencias de aproximación y salida, reduciendo esperas en tierra.
- Agricultura de precisión: planificar ventanas de aplicación de fitosanitarios o riego con una hora de antelación sobre la parcela, evitando lavado por precipitación inminente.
- Energía solar: la predicción de nubosidad convectiva a 5 minutos de cadencia sirve como entrada para el ajuste de rampas en plantas fotovoltaicas, donde la variabilidad subhoraria es el principal problema de integración en red.
- Investigación en nowcasting: los tres checkpoints permiten reproducir la comparación entre un refinador generativo, un ancla determinista con bloques de espacio de estados y un baseline convolucional, lo que es útil para estudios de ablation y para benchmarking sobre SEVIR.
- Construcción de ensembles operativos: el refinador puede integrarse como generador de miembros en un sistema de predicción por conjuntos, combinándolo con salidas de modelos numéricos para estimar probabilidad de superar umbrales de intensidad.
- Evaluación de robustez ante desplazamiento de dominio: al publicarse pesos entrenados solo con SEVIR, sirven de punto de partida para estudiar la transferencia a redes de radar con características distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (CSI, HSS, FSS, MAE, CRPS u otras habituales en nowcasting) ni comparaciones cuantitativas entre el refinador NucleCast, el ancla STVMamba3 y el baseline SimVP-gSTA. Tampoco se aportan cifras de latencia, throughput o coste computacional de entrenamiento.

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB, de modo que los tres checkpoints juntos requieren menos de 1 GB de almacenamiento, muy por debajo de lo habitual en modelos meteorológicos de gran escala.
- VRAM de inferencia: no disponible de forma oficial. Como estimación derivada del tamaño del repositorio, los pesos de cada checkpoint son del orden de decenas de megabytes, por lo que la inferencia debería caber en GPU de consumo con varios GB de VRAM; el autor no publica cifras de parámetros ni de memoria pico.
- GPU recomendadas: no disponibles. Por el tamaño de los artefactos, es razonable esperar funcionamiento en RTX 3060, RTX 4090 y GPUs de centro de datos (A100, H100), pero esto no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: probable según el tamaño del repositorio, sin confirmación del autor.
- Opciones de despliegue: carga mediante el código de acompañamiento y el script `weights/download_weights.sh`, con el formato de checkpoint de PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que además no son aplicables al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Ventana de prediccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NucleCast (refinador) | Nowcasting generativo con flow matching sobre VIL de SEVIR | no disponible | 13 fotogramas entrada, 12 salida (5 min) | apache-2.0 | Pesos publicados en HuggingFace |
| STVMamba3 (ancla del propio sistema) | Nowcasting determinista espacio-temporal | no disponible | 13 fotogramas entrada, 12 salida (5 min) | apache-2.0 (dentro del mismo repositorio) | Pesos publicados en HuggingFace |
| SimVP-gSTA (baseline del propio sistema) | Prediccion de video determinista | no disponible | 13 fotogramas entrada, 12 salida (5 min) | apache-2.0 (dentro del mismo repositorio) | Pesos publicados en HuggingFace |

Existen otros sistemas de referencia en la misma categoría (nowcasting por radar, incluidos trabajos generativos publicados en revistas científicas), pero no se aportan datos sobre ellos en la información disponible, por lo que no se incluyen parámetros, licencias ni rendimiento comparado.

## Limitaciones y advertencias

- Publicación anónima: el autor figura como `nuclecast-anon` y los pesos acompañan a una submission anónima, sin paper enlazado, sin repositorio de código identificado y sin institución responsable declarada.
- Sin resultados de benchmarks publicados en la información disponible: no hay métricas objetivas que permitan situar el rendimiento frente a alternativas.
- Sin adopción verificable: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no ha pasado por revisión de la comunidad.
- Dominio restringido: entrenado para VIL de SEVIR, un dataset de radar de Estados Unidos. El rendimiento fuera de esa distribución geográfica, climática y de calibración de radar es desconocido.
- Cobertura de datasets incompleta: los checkpoints de ARSO no se publican porque el dataset no es de acceso público, de modo que el sistema no es reproducible al completo.
- Sin estado de entrenamiento: los ficheros contienen solo pesos e hiperparámetros, así que no se puede reanudar el entrenamiento ni auditar el proceso completo a partir de ellos.
- Riesgo de alucinación en sentido meteorológico: al ser un modelo generativo con flow matching, el refinador puede producir estructuras de precipitación plausibles pero inexistentes; no se documentan métricas de fiabilidad ni calibración probabilística.
- Ausencia de información sobre sesgos: no se detalla el sesgo del modelo por régimen de precipitación, intensidad, hora del día o tipo de evento convectivo.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, pero los términos de uso del dataset SEVIR y de los datos de radar subyacentes no se detallan en la información proporcionada; conviene verificarlos antes de un uso comercial.
- Sin datos de robustez ni de sensibilidad a la calidad de la entrada: no se indica cómo se degrada la predicción con ruido, huecos o calibración deficiente del radar de entrada.
- Cualquier despliegue operativo debería validarse localmente contra observaciones propias antes de tomar decisiones con impacto en seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nuclecast-anon/nuclecast
- Script de descarga y verificación de pesos citado en la model card: `weights/download_weights.sh` (perteneciente al código de acompañamiento; no se proporciona URL en la información disponible)
- Paper o preprint: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Dataset SEVIR: referenciado en las etiquetas del modelo; no se proporciona enlace en la información disponible
