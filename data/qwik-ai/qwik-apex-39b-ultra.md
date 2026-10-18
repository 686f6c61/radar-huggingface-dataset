# QWIK-AI/QWIK-Apex-39B-Ultra

## Resumen

QWIK-Apex-39B-Ultra es un modelo de generacion de texto desarrollado por QWIK-AI (`QWIK-AI` en HuggingFace) que se presenta como el buque insignia de una familia de modelos de razonamiento de tamano medio. Segun la model card, emplea una arquitectura propia denominada `QWIKApexRecurrentForCausalLM` (`model_type: qwik_apex_recurrent`), construida sobre una base tipo Qwen2 (tag `qwen2`) con una innovacion de profundidad recurrente latente: 95 capas fisicas que se reejecutan con un bucle `K_loop=3`, alcanzando 127 capas de profundidad secuencial efectiva y 52,04B de computo denso efectivo a partir de 39,32B de parametros fisicos. El modelo declara una ventana de contexto de 524.288 tokens mediante un esquema posicional propio bautizado como QWIK-3D Spectral RoPE.

El interes declarado del modelo es doble. Por un lado, compite en la franja "small" (4B-40B) con resultados que, segun el autor, superan ampliamente a alternativas del mismo tamano en pruebas de razonamiento cientifico, codigo en terminal, uso de herramientas y conocimiento sin alucinacion. Por otro, su licencia es propietaria (`qwik-proprietary-commercial-v1`) y la carga exige `trust_remote_code=True`, lo que lo aleja del ecosistema de IA estrictamente open source.

Advertencia importante: en el momento de redactar esta ficha el repositorio no contiene pesos descargables (tamano de repo 0,0 GB), registra 0 descargas y 0 likes, los metadatos tienen fecha de octubre de 2026 y todas las cifras de rendimiento proceden exclusivamente de la model card del autor, sin verificacion independiente. Las cifras son extraordinariamente altas para su tamano y deben tratarse como afirmaciones no contrastadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `QWIKApexRecurrentForCausalLM` (`model_type: qwik_apex_recurrent`), transformer con Latent Recurrent Depth (`K_loop=3`), requiere `trust_remote_code=True` |
| Parametros totales | 39,32B fisicos (95 capas fisicas) |
| Parametros activos | No es un modelo MoE. Computo denso efectivo declarado: 52,04B por la recursion (127 capas de profundidad secuencial efectiva) |
| Longitud de contexto | 524.288 tokens (QWIK-3D Spectral RoPE) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repo solo anuncia safetensors) |
| Idiomas soportados | no disponible |
| Licencia | `qwik-proprietary-commercial-v1` (campo `license: other`, fichero `LICENSE.md`) |
| Formato de pesos | safetensors (segun tags); tamano del repositorio: 0,0 GB en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer causal con un mecanismo de profundidad recurrente latente: las mismas 95 capas fisicas se aplican tres veces (`K_loop=3`) sobre un estado latente, de modo que el modelo gana profundidad de computo sin incrementar el numero de parametros almacenados. El autor cifra el resultado en 127 capas de profundidad secuencial efectiva y 52,04B de computo denso equivalente, manteniendo los 39,32B fisicos. Esta es una estrategia distinta de la de los modelos MoE: no dispersa la activacion entre expertos, sino que repite el paso por las mismas capas. Los tags del repositorio mencionan tambien `mcts` (Monte Carlo Tree Search), lo que sugiere que el decodificado o el post-entrenamiento incorpora busqueda en arbol sobre el espacio de razonamiento, y la model card recomienda un parametro `reasoning_effort = "xhigh"`, indicativo de un control explicito del presupuesto de razonamiento.

El esquema posicional es propio: QWIK-3D Spectral RoPE, al que el autor atribuye la extension hasta 524.288 tokens. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion empleadas (RLHF, DPO u otras) ni las fases de post-entrenamiento. La model card menciona un "watermark criptografico de null-space" incrustado en los pesos, un mecanismo de marcado que, de existir, tendria implicaciones para la trazabilidad y para el uso comercial. No hay informacion publica sobre el proceso de entrenamiento, los datos ni la infraestructura utilizada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (idiomas no declarados oficialmente).
- Razonamiento extenso con presupuesto configurable (`reasoning_effort`, valores hasta `"xhigh"`).
- Razonamiento cientifico y de nivel avanzado: la model card reporta resultados en GPQA Diamond, HLE y CritPt (fisica de frontera).
- Codigo y operacion de terminal: declara resultados en Terminal-Bench 2.1 (Hard) y 4.0 (Extreme) y en SciCode para codigo cientifico.
- Tool calling y cumplimiento de politicas: reporta Tau2-Bench, prueba especifica de uso de herramientas y adherencia a restricciones.
- Procesamiento de contexto largo: 524.288 tokens, con resultado declarado en AA-LCR v1.1.
- Razonamiento multi-paso y exploracion de alternativas, coherente con el uso de MCTS indicado en los tags.
- Capacidad multimodal (vision, audio): no disponible. El pipeline es `text-generation`.
- Compatibilidad declarada con Text Generation Inference y con endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- Analisis de repositorios y tareas de terminal: el modelo declara rendimiento en Terminal-Bench, por lo que el escenario natural es un agente CLI que inspecciona un arbol de codigo, ejecuta comandos en un sandbox y corrige errores de build en varios pasos.
- Generacion de codigo cientifico y numerico: con resultados declarados en SciCode, encaja en la traduccion de especificaciones matematicas a codigo ejecutable (simulaciones, procesamiento de senales, calculo numerico) con verificacion por tests.
- Automatizacion de atencion al cliente con contexto largo: la ventana de 524.288 tokens permite cargar historiales completos, documentacion de producto y transcripciones sin truncar, manteniendo coherencia entre turnos.
- Extraccion y auditoria documental masiva: contratos, expedientes o normativa de cientos de miles de tokens en una sola pasada, con preguntas de seguimiento sobre el mismo contexto sin reindexado externo.
- Agentes con tool calling y politicas estrictas: el rendimiento declarado en Tau2-Bench apunta a flujos donde el modelo debe elegir herramientas y respetar reglas de negocio (reembolsos, reservas, gestion de incidencias) sin salirse del procedimiento.
- Planificacion con busqueda en arbol: el uso de MCTS permite escenarios de resolucion de problemas donde conviene explorar varias ramas (configuracion de infraestructura, diagnostico de fallos intermitentes) antes de comprometerse con una solucion.
- Asistencia en investigacion tecnica: preguntas sobre fisica y matematicas avanzadas, con el modo de razonamiento extendido activado y verificacion humana posterior.
- Despliegue on-premise en una sola GPU: con 39,32B de parametros fisicos, una cuantizacion INT4 (estimada en unos 20 GB) permitiria ejecucion en una GPU de 24 GB o superior, aunque el fabricante no publica pesos cuantizados.

## Benchmarks y rendimiento

Todas las cifras de esta seccion proceden de la model card del autor y no han sido verificadas de forma independiente. En la informacion disponible no hay resultados de terceros.

AA Intelligence Index v4.3.2 (seleccion de pruebas):

| Metrica | QWIK-Apex-39B-Ultra | Mejor competidor "small" citado (Qwen3.8 27B xhigh) |
|---|---|---|
| AA Intelligence Index (v4.3.2) | 54,60 | 33,68 |
| GPQA Diamond | 95,80% | 90,51% |
| AA-LCR v1.1 (contexto 524K) | 92,80% | 81,25% |
| Terminal-Bench 2.1 (Hard) | 92,80% | 79,78% |
| Terminal-Bench 4.0 (Extreme) | 46,80% | 5,56% |
| SciCode | 66,80% | 46,64% |
| Tau2-Bench (tool/policy) | 97,60% | 93,36% |
| AA-Omniscience Index | +44,80 | -16,92 |
| Omniscience Non-Hallucination | 97,40% | 50,25% |
| Humanity's Last Exam (HLE) | 51,80% | 33,92% |
| CritPt (fisica de frontera) | 24,80% | 5,43% |

Hugging Face Open LLM Leaderboard v2 (puntuacion normalizada, segun el autor):

| Modelo | Parametros | HF v2 Avg | IFEval | BBH (Norm) | MATH Lvl 5 | GPQA (Norm) | MuSR (Norm) | MMLU-Pro (Norm) |
|---|---|---|---|---|---|---|---|---|
| QWIK-Apex-39B-Ultra | 39,32B | 87,98% | 93,40% | 84,20% | 89,60% | 94,40% | 78,50% | 87,80% |
| QWIK-Apex-32B-Midrange | 31,86B | 85,32% | 91,80% | 81,50% | 86,90% | 91,00% | 75,22% | 85,50% |
| Qwen3.8-27B-xhigh | 27,00B | 77,68% | 88,20% | 74,83% | 79,40% | 79,33% | 65,10% | 79,22% |
| gemma-4-31b-it | 31,00B | 73,17% | 86,40% | 71,29% | 72,50% | 72,27% | 60,56% | 76,00% |

Configuracion de evaluacion recomendada por el autor: `temperature = 0.6`, `max_new_tokens = 131072`, `reasoning_effort = "xhigh"`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: unos 78,6 GB solo para pesos (39,32B x 2 bytes), mas cache KV. Requiere multiples GPU o una GPU de 80 GB con cuantizacion parcial.
- VRAM estimada en INT8: unos 39,3 GB de pesos.
- VRAM estimada en INT4: unos 19,7 GB de pesos, lo que en teoria permitiria ejecucion en una RTX 4090 (24 GB) o RTX 5090, con margen limitado para cache KV. Estas cifras son calculos aritmeticos a partir del numero de parametros, no mediciones: el autor no publica pesos cuantizados.
- Coste computacional real: el bucle `K_loop=3` implica tres pasadas por las 95 capas fisicas, de modo que el tiempo de inferencia se aproxima al de un modelo denso de ~52B, no al de uno de 39B.
- Contexto largo: con 524.288 tokens, la cache KV es el factor dominante de memoria. No se indica si se usa atencion lineal, ventanas deslizantes o compresion de cache, por lo que la viabilidad practica de la ventana completa no esta documentada.
- GPU recomendadas (estimacion): H100 80GB o A100 80GB para BF16; 2x A100 40GB o 2x L40S para FP16; RTX 4090/L40S en INT4 para pruebas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio); Text Generation Inference aparece como tag y la model card indica compatibilidad con endpoints. No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QWIK-Apex-39B-Ultra | 39,32B fisicos (52,04B efectivos) | 524.288 tokens | AA Index 54,60; HF v2 87,98% | Propietaria (`qwik-proprietary-commercial-v1`) | Repo vacio (0,0 GB), 0 descargas |
| QWIK-Apex-32B-Midrange | 31,86B | no disponible en la informacion | AA Index no disponible; HF v2 85,32% | Propietaria (misma familia, presumiblemente) | No verificada |
| Qwen3.8-27B-xhigh | 27,00B | no disponible en la informacion | AA Index 33,68; HF v2 77,68% | no disponible en la informacion | Citado como competidor por el autor |
| gemma-4-31b-it | 31,00B | no disponible en la informacion | HF v2 73,17% | no disponible en la informacion | Citado como competidor por el autor |

La comparativa se limita a los modelos que aparecen en la model card. No se dispone de datos independientes para verificar las diferencias, y las alternativas citadas no han sido evaluadas en esta ficha.

## Limitaciones y advertencias

- Disponibilidad: el repositorio tiene un tamano de 0,0 GB y 0 descargas. No hay pesos publicados que permitan descargar, cargar o reproducir el modelo.
- Ejecucion de codigo arbitrario: la carga exige `trust_remote_code=True` con una arquitectura personalizada (`qwik_apex_recurrent`), lo que implica ejecutar codigo del autor en la maquina local. Debe auditarse el fichero de modelado antes de usarlo.
- Cifras no verificadas: los resultados declarados (HLE 51,80%, GPQA 95,80%, Terminal-Bench 4.0 46,80%, Omniscience Non-Hallucination 97,40%) estan muy por encima de lo publicado por modelos de tamano similar y no cuentan con validacion de terceros. Deben tratarse como marketing hasta su replicacion.
- Metadatos inconsistentes: fecha de creacion 2026-10-17, lo que situa el repositorio en el futuro respecto a la fecha habitual de consulta; puede indicar un artefacto o un repositorio de prueba.
- Licencia propietaria: `qwik-proprietary-commercial-v1` no es una licencia open source. Es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, redistribucion o despliegue en producto.
- Marca de agua: el autor menciona un "watermark criptografico de null-space" en los pesos. Conviene evaluar las implicaciones de trazabilidad y de reclamaciones de autoria sobre las salidas.
- Idiomas: no declarados. No hay evidencia de calidad fuera del ingles, y el castellano no esta confirmado.
- Alucinacion: la declaracion de 97,40% de no alucinacion no es verificable y contradice el comportamiento tipico de modelos de esta escala en preguntas abiertas.
- Contexto largo: no se documenta la estrategia de atencion ni el coste de memoria de la cache KV a 524K tokens; la ventana nominal puede no ser usable en hardware de consumo.
- Riesgo de dependencia de un unico proveedor: al ser una arquitectura y licencia propietarias, la migracion a otro modelo implica reescribir el stack de inferencia.
- Sin informacion de sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QWIK-AI/QWIK-Apex-39B-Ultra
- Fichero de licencia: https://huggingface.co/QWIK-AI/QWIK-Apex-39B-Ultra/blob/main/LICENSE.md
- Grafico de resultados citado en la model card: https://huggingface.co/QWIK-AI/QWIK-Apex-39B-Ultra/blob/main/hero_benchmark_chart.svg
- Perfil del autor en HuggingFace: https://huggingface.co/QWIK-AI
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
