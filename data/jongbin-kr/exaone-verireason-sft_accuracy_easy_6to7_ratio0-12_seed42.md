# Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct. No es un modelo completo ni pesos fusionados: son exclusivamente los pesos del adaptador, por lo que su uso requiere cargar el modelo base de EXAONE-3.5-7.8B-Instruct y aplicar el adaptador encima. El autor es el usuario Jongbin-kr y el repositorio tiene un tamano aproximado de 1,0 GB.

El adaptador se ha entrenado sobre un subconjunto de ConvFinQA en formato "answer-only", es decir, orientado a producir la respuesta final sin cadena de razonamiento explícita. La selección de datos sigue la condición declarada `accuracy_medium_high_6to7_selseed42_ratio0.12`, con semilla de entrenamiento 42 y un manifiesto de selección con hash SHA256 verificable.

Su relevancia es acotada pero clara: sirve como punto de partida reproducible para investigacion sobre ajuste fino eficiente en tareas de pregunta-respuesta sobre datos financieros tabulares y textuales, y como evidencia de una receta concreta de seleccion de datos por bandas de precision. Al no publicarse licencia, idiomas soportados ni resultados de benchmarks, su uso en produccion requiere evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer decoder-only EXAONE-3.5-7.8B-Instruct; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | Modelo base de 7.800 millones de parametros; numero de parametros entrenables del adaptador no disponible (tamano del repo: 1,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors con estructura PEFT/LoRA (no fusionados con el modelo base) |

Metadatos adicionales de reproducibilidad declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| Revision de cache esperada del base | `553ea250b9a5317231459279d5847d6cf955b9aa` |
| Condicion de seleccion | `accuracy_medium_high_6to7_selseed42_ratio0.12` |
| SHA256 del manifiesto de seleccion | `82e35b48cd0828a66e56a67768e1e13708c06929529ce097f63b54c687bc55a4` |
| Semilla de entrenamiento | 42 |
| Checkpoint con mejor validacion | `checkpoint-164` (`eval_loss=0.3420470356941223`) |
| Ramas de epoch | `epoch1-step82` (checkpoint-82), `epoch2-step164` (checkpoint-164), `epoch3-step246` (checkpoint-246) |
| Rama `main` | Adaptador final con mejor validacion guardado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre un transformer decoder-only de 7.800 millones de parametros. No se documentan en la informacion disponible el rango del adaptador, los modulos objetivo, el valor de alpha, el dropout ni el optimizador empleado. Tampoco se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de tratarse de un subconjunto de ConvFinQA en formato de respuesta directa, sin razonamiento intermedio.

El procedimiento de seleccion de datos se describe como "seleccion por bandas de precision" (`accuracy-band-selection`): se filtran ejemplos segun el nivel de acierto del modelo en ellos y se toma una proporcion del 0,12 con semilla 42, bajo la etiqueta `accuracy_medium_high_6to7_selseed42_ratio0.12`. El entrenamiento se ejecuto durante tres epochs (pasos 82, 164 y 246) y el mejor checkpoint segun perdida de validacion fue el 164, con `eval_loss` de 0,3420470356941223. Se advierte en la model card que el cargador de entrenamiento uso el ID del Hub sin fijar una revision explicita, de ahi la recomendacion de revisión de cache indicada arriba.

No se menciona en la informacion proporcionada el uso de RLHF, DPO, decodificacion especulativa ni ninguna innovacion de atencion. El prefijo "verireason" del nombre del repositorio no viene acompanado de paper, blog ni descripcion tecnica que lo respalde.

## Capacidades

- Generacion de respuestas cortas y directas a preguntas sobre datos financieros, entrenada especificamente en el formato "answer-only" de ConvFinQA.
- Razonamiento aritmetico implicito sobre cifras extraidas de tablas y texto financiero, al estilo de las preguntas de ConvFinQA (variaciones, porcentajes y comparaciones entre periodos).
- Manejo de contexto mixto tabla-texto, ya que ConvFinQA combina informes financieros con tablas asociadas.
- Capacidad de razonamiento explicito o cadena de pensamiento: no entrenada en este adaptador (el subconjunto es answer-only).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste esta orientado a respuesta directa.
- Capacidades multilingues: no disponibles; no se declaran idiomas en el repositorio.
- Capacidad de vision o audio: no disponible.
- Cualquier capacidad heredada de EXAONE-3.5-7.8B-Instruct (instruccion general, codigo, matematicas) puede degradarse por el ajuste fino; no se aportan datos al respecto.

## Casos de uso

- Extraccion de respuestas numericas de informes financieros: dado un informe anual o trimestral con tablas, el adaptador devuelve la cifra concreta solicitada (por ejemplo, el margen operativo de un ejercicio), replicando el formato de ConvFinQA para el que fue entrenado.
- Automatizacion de analisis financiero comparativo: calcular variaciones interanuales o intertrimestrales a partir de estados contables, usando el modelo como extractor y calculador de respuestas cortas en lugar de generar informes largos.
- Evaluacion de recetas de seleccion de datos: servir como referencia reproducible (semilla, condicion y manifiesto con hash) para investigar como afecta el filtrado por bandas de precision al rendimiento en tareas financieras.
- Prototipado rapido en investigacion academica: al ser un adaptador de ~1,0 GB sobre un base de 7,8B, permite experimentar con ajuste fino eficiente sin reentrenar el modelo completo en cada iteracion.
- Base para comparativas de ajuste fino: utilizar las ramas `epoch1-step82`, `epoch2-step164` y `epoch3-step246` para estudiar el efecto del numero de epochs sobre la perdida de validacion en el mismo subconjunto.
- Integracion como modulo de respuesta en pipelines de analisis documental: encadenado detras de un sistema de recuperacion (RAG) que localice el fragmento relevante del informe, el adaptador genera la respuesta final sobre ese fragmento.
- Generacion de conjuntos de respuestas de referencia: producir respuestas candidatas para anotacion humana o para comparar contra el modelo base sin ajustar en tareas de QA financiero.

En todos los casos, la idoneidad practica no esta respaldada por benchmarks publicados y debe validarse con datos propios antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo declarado es la perdida de validacion del mejor checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| `eval_loss` en `checkpoint-164` | 0,3420470356941223 | Perdida de validacion sobre el subconjunto de validacion del autor; no comparable con metricas de otras tareas ni con MMLU, HumanEval o GSM8K |
| `eval_loss` por epoch | No disponible | Solo se publica el valor del checkpoint 164 |
| Precisión exacta (exact match) en ConvFinQA | No disponible | No declarada en la model card |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de tareas de QA financiero, ni comparaciones con otros adaptadores o con el modelo base sin ajustar.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (7,8B parametros) y aplicar los pesos LoRA encima.
- VRAM estimada para el modelo base en precision completa (fp16/bf16): del orden de 16 GB solo en pesos, mas cache KV y activaciones, lo que en la practica situa el requisito en ~18-20 GB. Es una estimacion derivada del numero de parametros, no un dato publicado por el autor.
- VRAM estimada con cuantizacion de 8 bits: en torno a 8 GB de pesos, con requisito practico de ~10-12 GB.
- VRAM estimada con cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 5 GB de pesos, con requisito practico de ~6-8 GB, viable en GPUs de consumo con 8 GB o mas.
- GPUs recomendadas: para fp16, A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB; para cuantizacion de 4 bits, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Uso en GPU de consumo: si, es viable con cuantizacion de 4 u 8 bits en GPUs de 8-16 GB.
- Opciones de despliegue: los adaptadores PEFT se pueden cargar con la libreria `peft` sobre el base; para servir en produccion puede usarse vLLM con soporte LoRA, TGI con adaptadores, o bien fusionar el adaptador con el base y convertir a GGUF para llama.cpp y Ollama. No se documenta en la informacion disponible ninguna configuracion de despliegue probada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan situar este adaptador frente a alternativas. La comparacion factible se limita a su relacion con el modelo base:

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed42 | Adaptador LoRA sobre 7,8B | No disponible | Adaptador PEFT (answer-only ConvFinQA) | No disponible | HuggingFace, 15 descargas, 0 likes |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible en la informacion proporcionada | Modelo instruct completo | No disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Otros adaptadores LoRA sobre EXAONE-3.5-7.8B | No disponible | No disponible | Adaptador | No disponible | No se han identificado en la informacion proporcionada |
| Alternativas de QA financiero comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se declara licencia en el repositorio; sin licencia explicita no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor o consultar las condiciones del modelo base antes de cualquier uso productivo.
- No se declaran idiomas soportados. El entrenamiento se realizo sobre ConvFinQA, un corpus en ingles, por lo que el rendimiento en castellano es muy probablemente bajo o nulo, aunque no hay datos que lo confirmen.
- Es un adaptador de un solo dominio y una sola tarea: preguntas y respuestas sobre datos financieros. Su uso fuera de ese ambito no esta validado y puede degradar capacidades generales del modelo base.
- Riesgo de alucinacion: al estar entrenado en formato "answer-only" sin cadena de razonamiento, el modelo puede generar cifras plausibles pero incorrectas sin ninguna senal de incertidumbre, lo que es especialmente peligroso en contexto financiero.
- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento frente al modelo base ni frente a alternativas, por lo que no puede afirmarse que el ajuste mejore al base.
- La model card advierte de que el entrenamiento uso el ID del Hub sin fijar revision explicita del modelo base; debe verificarse la revision `553ea250b9a5317231459279d5847d6cf955b9aa` para reproducir resultados.
- El repositorio tiene solo 15 descargas y 0 likes, sin validacion por parte de la comunidad ni informes independientes.
- El nombre "verireason" sugiere verificacion y razonamiento, pero no hay documentacion tecnica, paper ni evaluacion que respalde esa denominacion.
- La perdida de validacion de 0,342 no es interpretable de forma aislada: depende de la tokenizacion, del subconjunto de validacion y del formato de respuesta, y no equivale a precision.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_easy_6to7_ratio0.12_seed42
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
