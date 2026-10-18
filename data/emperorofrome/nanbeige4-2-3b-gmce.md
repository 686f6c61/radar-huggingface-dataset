# emperorofrome/Nanbeige4.2-3B-GMCE

## Resumen

Nanbeige4.2-3B-GMCE es un ajuste fino del modelo base Nanbeige/Nanbeige4.2-3B publicado por el usuario independiente emperorofrome. No se trata de un modelo nuevo entrenado desde cero, sino de la aplicacion de la receta de eficiencia «GMCoder» sobre el modelo base: un LoRA pequeno cuyo objetivo es que el modelo responda de forma mas breve y directa, reduciendo el numero de tokens de razonamiento que genera antes de dar la respuesta final.

El modelo conserva los 4.169.800.704 parametros del original (etiquetado comercialmente como «3B», aunque el recuento real en safetensors supera los 4.100 millones) y se distribuye en formato GGUF con cuantizacion Q8_0, fusionando el adaptador sobre la base en BF16. La licencia es Apache 2.0 y el repositorio ocupa 4,4 GB.

Su relevancia es acotada pero concreta: cuantifica el compromiso entre verbosidad y precision en un modelo pequeno. Segun las mediciones del propio autor, reduce un 19% los tokens generados en un conjunto de examenes propios a cambio de perder unos 13 puntos sobre 275, con un ahorro dispar segun el tipo de tarea (hasta un 54% en preguntas historicas y practicamente nulo en matematicas y logica). Es, por tanto, una pieza util para escenarios donde el coste por token o la latencia importan mas que unos pocos puntos de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion proporcionada no detalla la arquitectura del modelo base Nanbeige4.2-3B) |
| Parametros totales | 4.169.800.704 (~4,17B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado; el adaptador se entreno con QLoRA en NF4 con doble cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `Nanbeige4.2-3B-GMCE.Q8_0.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Nanbeige4.2-3B (tipo de transformer, atencion, contexto nativo ni composicion del corpus original). Lo que si se documenta con detalle es el proceso de ajuste: se aplico un LoRA con QLoRA en NF4 con doble cuantizacion, r=8, alpha=8, tasa de aprendizaje 5e-5, tamano de batch 1 y 16 epocas, con perdida calculada unicamente sobre la completion (completion-only loss). El conjunto de entrenamiento son 531 ejemplos cortos renderizados en formato «thinking-off», es decir, sin cadena de razonamiento explicita.

El adaptador resultante se fusiono de forma plana sobre la base en BF16 y se exporto a GGUF Q8_0. La misma receta se habia aplicado previamente a un modelo de 9B (GMCoder 9B), lo que permite interpretar este lanzamiento como una validacion de la receta a menor escala. No se menciona uso de RLHF ni DPO, ni se detalla la procedencia o el filtrado de los 531 ejemplos mas alla de su brevedad y formato.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Generacion de codigo, ambito declarado en los tags (`coding`) y evaluado con una prueba propia de 10 tareas.
- Respuestas mas concisas: el objetivo explicito del ajuste es reducir laverbosidad y el gasto de tokens de razonamiento.
- Modo thinking activado por defecto, igual que en el modelo base, segun la descripcion de la evaluacion (limite de 40k-60k tokens y formato thinking-off solo durante el entrenamiento).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente multi-paso: no disponible en la informacion.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es de texto.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente de codigo en local: al distribuirse en GGUF Q8_0 y ocupar unos 4,4 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta mediante llama.cpp u Ollama, cubriendo autocompletado y explicacion de fragmentos con coste cero por token.
- Revision de codigo en pipelines de CI/CD: la reduccion del 18% de tokens con la misma tasa de acierto en la prueba de codigo del autor lo hace adecuado para pre-revisiones automatizadas donde el volumen de invocaciones es alto y el coste por llamada manda.
- Procesamiento por lotes de documentacion tecnica: para resumir o reescribir grandes volumenes de texto donde respuestas concisas son preferibles y el ahorro de tokens se traduce directamente en tiempo y coste.
- Chat de atencion al cliente con respuestas breves: el ajuste penaliza las respuestas largas, lo que encaja en interfaces conversacionales donde el usuario espera una solucion directa; requiere validar antes el soporte multilingue, no documentado.
- Clasificacion y extraccion de informacion en entornos con recursos limitados: modelos de ~4B en Q8_0 caben en GPUs de consumo y permiten desplegar tareas de etiquetado sin depender de APIs externas.
- Prototipado de agentes con restriccion de presupuesto de tokens: al recortar la fase de razonamiento, reduce la latencia acumulada en cadenas de varias llamadas, aunque no hay datos publicados sobre tool calling.
- Evaluacion de recetas de eficiencia: sirve como referencia reproducible para equipos que quieran medir el intercambio entre verbosidad y precision antes de aplicar tecnicas similares a modelos mayores.

## Benchmarks y rendimiento

Datos aportados por el autor, obtenidos en una unica ejecucion por modelo, con un unico evaluador ciego a la identidad del modelo, sobre examenes propios «Form B» no vistos (275 puntos en total) y en modo thinking por defecto con limite de 40k-60k tokens. El propio autor advierte que unos pocos puntos de diferencia son ruido y que no deben leerse como resultados de leaderboard.

| Modelo | Tokens (3 examenes) | Puntuacion Form B |
|---|---:|---:|
| Nanbeige4.2-3B base | 57.700 | ~208 / 275 |
| Nanbeige4.2-3B-GMCE | 46.800 (-19%) | ~195 / 275 |

| Examen | Ahorro de tokens |
|---|---:|
| Historico | -54% |
| Cotidiano | -29% |
| Ultimate (matematicas y logica) | ~0% |

Prueba adicional de codigo (10 tareas, limite de 8k tokens): 18% menos tokens con la misma tasa de acierto. Referencia de la misma receta en 9B (GMCoder 9B): aproximadamente 52% de ahorro de tokens con un coste de -12 sobre 275.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (4,17B) y del formato de pesos, no datos publicados por el autor.

- Peso en Q8_0: aproximadamente 4,4 GB, coincidiendo con el tamano del repositorio; con overhead de contexto y cache KV, el consumo real se situa alrededor de 5-7 GB de VRAM o RAM.
- BF16 completo (equivalente a la base fusionada): unos 8,3 GB solo en pesos.
- Cuantizaciones menores (Q4_K_M, Q5_K_M): no publicadas en el repositorio; si se generan, permitirian bajar de 3 GB y entrar en GPUs de 6-8 GB.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con Q8_0; tarjetas de 8 GB con cuantizaciones de 4-5 bits.
- GPUs de datacenter: A100, H100 y L40S sobradas para este tamano; su uso solo se justifica por agregacion de muchas instancias en paralelo.
- Despliegue: llama.cpp, Ollama y LM Studio para GGUF; llama-cpp-python para integracion en Python. vLLM y TGI admiten GGUF de forma experimental o parcial, por lo que conviene validar la version antes de usarlos en produccion.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Form B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-GMCE | ~4,17B | no disponible | ~195/275, 46.800 tokens | apache-2.0 | GGUF Q8_0 en HuggingFace |
| Nanbeige4.2-3B (base) | ~4,17B | no disponible | ~208/275, 57.700 tokens | no disponible en la informacion | HuggingFace |
| GMCoder 9B (misma receta) | ~9B (no confirmado) | no disponible | no disponible en puntos absolutos; -12/275 respecto a su base | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada; cualquier comparacion con alternativas de ~3-4B quedaria fuera del material disponible y no se incluye para no inventar cifras.

## Limitaciones y advertencias

- Coste en precision: el ajuste pierde aproximadamente 13 puntos sobre 275 respecto al modelo base en los examenes del autor. En tareas de razigno matematico y logico el ahorro de tokens es practicamente nulo, por lo que el beneficio no se traslada a ese dominio.
- Evaluacion debil: una sola ejecucion por modelo, un unico evaluador, examenes propios de 275 puntos y sin validacion externa. Los resultados no son comparables con leaderboards estandar.
- Sesgos conocidos: no documentados; se heredan los del modelo base, sobre el que no se aporta informacion de composicion del corpus ni de filtrado.
- Riesgo de alulcinacion: no evaluado en la informacion disponible; es esperable en un modelo de ~4B y no se han publicado pruebas de factualidad.
- Idiomas: no se especifica que idiomas cubre; no debe asumirse un rendimiento solido en castellano sin pruebas propias.
- Contexto: la longitud de contexto no esta documentada; el limite de 40k-60k tokens mencionado en las pruebas es un tope de generacion, no la ventana de contexto del modelo.
- Restricciones de licencia: el repositorio declara Apache 2.0, lo que permite uso comercial, pero conviene verificar los terminos del modelo base Nanbeige4.2-3B y de los datos de entrenamiento antes de un despliegue en produccion.
- Validacion comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar el comportamiento real.
- Naturaleza del artefacto: es un LoRA fusionado sobre una base de terceros; los fallos del modelo base se mantienen y la receta solo modifica el estilo de respuesta, no el conocimiento adquirido.
- Cuantizacion: solo se publica Q8_0; conversiones a 4 bits pueden degradar adicionalmente la precision ya recortada por el ajuste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/emperorofrome/Nanbeige4.2-3B-GMCE
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
