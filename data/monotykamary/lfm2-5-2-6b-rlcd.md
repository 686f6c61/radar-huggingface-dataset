# monotykamary/LFM2.5-2.6B-RLCD

## Resumen

LFM2.5-2.6B-RLCD es un paquete de inferencia publicado por el usuario monotykamary sobre los pesos sin modificar de LiquidAI/LFM2.5-2.6B, un modelo de 2.697.198.592 parametros perteneciente a la familia LFM2.5 de Liquid AI. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio empaqueta un motor que implementa Parallel Constrained Decoding (PCD), una tecnica de decodificacion restringida para elecciones finitas. La idea central es hacer prefill una sola vez del contexto compartido, ramificar el estado hibrido del modelo (atencion y convolucion) y evaluar en paralelo el conjunto cerrado de respuestas permitidas, devolviendo un objeto JSON tipado desde Python.

El problema que resuelve es el de las decisiones estructuradas de baja cardinalidad, por ejemplo clasificar un ticket en un enum de tres valores y determinar un booleano, tareas en las que generar JSON completo con decodificacion autorregresiva es caro en tokens. El motor ofrece dos modos: `token`, que proyecta la cabeza de salida solo sobre las filas del vocabulario correspondientes a los codigos de opcion validos, y `sequence`, que puntua candidatos completos con teacher forcing y log-verosimilitud normalizada sobre todo el vocabulario.

Es relevante ahora porque propone un patron de interaccion rapido para modelos pequenos orientados a edge, con pesos de 2,7B que caben en GPU de consumo. Sin embargo, el propio autor lo etiqueta como experimental, solo inferencia y sin calibrar, y los resultados publicados muestran que la puerta de precision para produccion no se alcanzo. La licencia es lfm1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de la familia LFM2 (atencion y convolucion), con empaquetado de decodificacion restringida en paralelo (PCD) |
| Parametros totales | 2.697.198.592 (2,7B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio incluye los tensores BF16 originales sin modificar y el motor realiza un cast a FP16 en tiempo de ejecucion |
| Idiomas soportados | 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita |
| Licencia | lfm1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors (BF16) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 5,4 GB |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Modos de inferencia | `token` (decision por campo) y `sequence` (puntuacion de candidatos completos) |
| Fecha de creacion del repositorio | 2026-09-16 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia LFM2, de arquitectura hibrida: combina capas de atencion con capas convolucionales. El motor PCD explota precisamente esa naturaleza hibrida, ya que ramifica de forma aislada tanto el estado de atencion como el estado convolucional por cada rama de decision, reutilizando un unico prefill del prompt compartido. En modo `token`, cada campo del esquema recibe un codigo atomico de opcion inequivoco, verificado contra el tokenizador real; una rama cacheada por campo produce un estado oculto de decision y la cabeza de salida se proyecta unicamente sobre las filas de tokens de opcion relevantes, no sobre los 128.000 tokens del vocabulario completo. El codigo seleccionado se mapea de vuelta al valor original del enum o al booleano de Python. En modo `sequence`, cada candidato es un valor JSON completo con terminador de nueva linea, tokenizado de forma canonica antes de factorizar el prefijo de tokens compartido, y el resto de tokens se puntua con teacher forcing y log-verosimilitud normalizada sobre el vocabulario completo. El modo `token` suele necesitar dos llamadas al backbone para hasta 32 campos, mientras que el modo `sequence` usa `1 + ceil(total_candidates / branch_batch_size)` llamadas.

No hubo entrenamiento, LoRA, aprendizaje por refuerzo, cuantizacion ni modificacion de pesos guardados; el paquete es exclusivamente de inferencia. El nombre `RLCD` sigue la convencion de ejemplos de inferencia de la comunidad y no implica que se haya reproducido el metodo Reinforcement Learning for Calibrated Decisions de TypeSafe/Jev, ni que exista paridad con su API. Las distribuciones de probabilidad devueltas por el modo `token` estan explicitamente marcadas como no calibradas.

## Capacidades

- Generacion restringida de objetos JSON con esquemas tipados, incluyendo enums de cadena, booleanos, cadenas escapadas y Unicode.
- Decision de tipo clasificador por siguiente token en modo `token`, con codigos atomicos que evitan colapsar valores enum multi-token en un primer token ambiguo.
- Puntuacion de candidatos completos en modo `sequence` mediante teacher forcing y log-verosimilitud normalizada, adecuada para alta cardinalidad.
- Devolucion de la distribucion sobre los codigos permitidos y de margenes por campo, siempre marcados como no calibrados.
- Capacidad multilingue declarada en 16 idiomas, heredada del modelo base.
- Uso del modelo generativo original mediante `AutoModelForCausalLM.from_pretrained(...)`, aunque en ese caso no se habilita la decodificacion paralela.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision ni audio en la informacion disponible.
- No es generacion de texto libre en modo `token`; es una decision de eleccion finita.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo incluido en el repositorio clasifica un mensaje en un enum (`billing`, `technical`, `shipping`) y decide un booleano (`refund`). Con 2,7B de parametros y decisiones de dos campos, el patron encaja en un paso de triaje previo a un modelo mayor.
- Extraccion de campos estructurados con valores cerrados: formularios, encuestas o registros donde cada campo admite un conjunto finito de opciones verificadas contra el tokenizador, evitando JSON invalido.
- Clasificacion de configuraciones booleanas: el caso medido con 28 valores booleanos sinteticos ilustra el escenario de validar o completar configuraciones de producto, aunque sea un caso de diagnostico y no una validacion de produccion.
- Moderacion o etiquetado con taxonomia cerrada: asignar una categoria de una lista fija a un texto, aprovechando que la proyeccion se limita a las filas de tokens de opcion.
- Decisiones intermedias en pipelines de agentes: cuando un agente necesita elegir entre un conjunto pequeno de acciones tipadas, el modo `token` reduce el coste frente a generar la eleccion como texto libre, siempre que se anada revision humana en decisiones criticas.
- Clasificacion multilingue: al declarar 16 idiomas, puede aplicarse a enrutado de mensajes en arabe, chino, japones, coreano, hindi, tailandes, vietnamita o las lenguas europeas listadas. No se documentan evaluaciones de precision desglosadas por idioma.
- Puntuacion y comparacion de respuestas candidatas: el modo `sequence` puntua valores JSON completos con log-verosimilitud normalizada, util para elegir entre alternativas redactadas donde la cardinalidad es alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica mediciones propias de latencia y precision, obtenidas en inferencia y no en validacion de produccion con datos reservados:

| Medicion | Modo token PCD | AR JSON directo | Notas |
|---|---|---|---|
| 12 casos de desarrollo (latencia media) | 56,24 ms | 557,41 ms | Aceleracion aproximada de 9,9x |
| 1 configuracion sintetica de 28 booleanos | 106,98 ms | 4.875,30 ms | Aceleracion aproximada de 45,6x; todos los campos correctos en ambos metodos |
| Precision por campo, 12 casos de desarrollo | 88,9 % | No disponible | Modo token PCD |
| Precision por campo, 6 casos nuevos de auditoria | 72,2 % | 94,4 % | La puerta de precision para produccion no se alcanzo |
| Alta cardinalidad en modo token | Falla | No disponible | Fallo en ambas pruebas de alta cardinalidad |
| Caso de 255 opciones (modo sequence) | Correcto pero mas lento que AR | No disponible | El modo sequence resuelve el caso, pero con mayor latencia |

Todas las cifras son tiempos de peticion en GPU en caliente (warm), no latencia de red, y se obtuvieron en una unica ejecucion sobre una L40S. Solo las mediciones correspondientes a la revision de codigo publicada pertenecen a esta release.

## Requisitos de hardware

- Peso de los tensores en BF16/FP16: aproximadamente 5,4 GB, derivado de 2.697.198.592 parametros a 2 bytes por parametro. Es una estimacion calculada, no una cifra publicada por el autor.
- VRAM total estimada para inferencia: del orden de 6 a 8 GB sumando pesos y cache, aunque la cifra exacta depende de la longitud de contexto y del tamano de lote de ramas. No disponible como medicion oficial.
- GPU recomendadas: el autor midio en una unica L40S. Por tamano, el modelo cabe tambien en A100, H100, RTX 4090, RTX 3090 y GPUs consumer con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y tarjetas similares con al menos 8 GB de VRAM. No se documenta una prueba oficial en hardware consumer.
- Opciones de despliegue: el autor distribuye un motor propio (`pcd.Engine`) con Python 3.11, entorno gestionado con `uv` y el fichero `requirements-pcd.txt`; soporta `device="cuda"`, `dtype="float16"` y `attention="sdpa"`. El repositorio incluye la etiqueta `modal`, lo que sugiere uso sobre la plataforma Modal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: las latencias medidas figuran en la tabla de benchmarks. El rendimiento no es constante respecto al tamano de la entrada, ya que el paralelismo reduce pasos secuenciales, pero no hace constantes la memoria, los FLOPs ni la latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| monotykamary/LFM2.5-2.6B-RLCD | 2,7B | No disponible | lfm1.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Pesos identicos al modelo base, con motor PCD de decodificacion restringida en paralelo |
| LiquidAI/LFM2.5-2.6B | 2,7B | No disponible | lfm1.0 | HuggingFace | Modelo base sin cambios; no incluye el motor PCD ni la decodificacion paralela |
| Otras alternativas de ~2-3B | No disponible | No disponible | No disponible | No disponible | No se han analizado otros modelos comparables en la informacion proporcionada |

No se realizo comparacion alguna contra el servicio de Jev, tal como indica el propio autor.

## Limitaciones y advertencias

- Modelo sin calibrar: las probabilidades devueltas por el modo `token` no deben usarse como umbrales de automatizacion validados.
- Precision insuficiente para produccion segun el propio autor: 72,2 % de precision por campo en seis casos nuevos de auditoria, frente al 94,4 % del JSON autorregresivo de referencia.
- Falla en los dos sondeos de alta cardinalidad en modo `token`; el modo `sequence` los resuelve, pero el caso de 255 opciones resulto mas lento que la generacion autorregresiva, por lo que la aceleracion favorable de 28 campos no debe extrapolarse a cualquier tarea.
- La validez del esquema no implica una decision correcta: un JSON bien formado puede contener un valor erroneo.
- Sesgo de longitud y de redaccion en el modo `sequence`, y sensibilidad al orden y a la formulacion de los codigos y etiquetas en el modo `token`.
- La evaluacion es un pequeno conjunto de desarrollo y diagnostico, no una validacion de produccion con datos reservados.
- El modelo es experimental, de solo inferencia, sin entrenamiento, LoRA, RL ni cuantizacion, y no ofrece paridad con la API de referencia.
- No se documentan evaluaciones de sesgo, de rendimiento por idioma ni de alucinacion, aunque en modo `token` la salida esta restringida a un conjunto finito de opciones.
- La licencia es lfm1.0, etiquetada como `other` y heredada del modelo base; conviene revisar el fichero LICENSE antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes, y una fecha de creacion de 2026-09-16, lo que aconseja verificar la revision exacta (SHA) antes de reutilizarlo.
- En tareas donde un error tiene consecuencias, el autor recomienda revision humana o un modelo de razonamiento mas potente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/monotykamary/LFM2.5-2.6B-RLCD
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Fichero de licencia (lfm1.0) dentro del repositorio: LICENSE
- Resultados medidos, respuestas erroneas y limitaciones: docs/pcd-results.md
- Evidencia JSON sin procesar de los resultados: results/pcd/
- Dependencias del motor PCD: requirements-pcd.txt
- Referencia de arXiv incluida en las etiquetas del repositorio: arxiv:2511.23404
- Clonado sin descarga inmediata de pesos duplicados: `GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/monotykamary/LFM2.5-2.6B-RLCD`
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo.
