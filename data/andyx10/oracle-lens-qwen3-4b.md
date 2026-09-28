# andyx10/oracle-lens-qwen3-4b

## Resumen

Oracle lens — Qwen3-4B es un adaptador LoRA (PEFT) publicado por el usuario andyx10 que implementa la técnica *oracle lens* sobre el modelo base Qwen/Qwen3-4B. No es un modelo de propósito general: es una herramienta de interpretabilidad que, dada una dirección del *residual stream* de una de las capas entrenadas del transformer, genera una lista de conceptos en viñetas destinada a reconstruir esa activación. En otras palabras, traduce un vector interno del modelo (activación) a texto legible con los conceptos que ese vector codifica.

El interés técnico reside en que el adaptador se ha entrenado con un pipeline completo de *activation reconstruction* y RL: rollouts de chat on-policy, pares residual/span, blanqueadores (*whiteners*) congelados, un reconstructor de activaciones congelado, destilación de viñetas seleccionadas por NNOMP y finalmente GRPO. El adaptador final corresponde al checkpoint `rl.qwen3-4b.e2.main.s0/iter_000425` y opera sobre 12 capas concretas del modelo base (12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32 y 34, indexadas desde cero).

El método subyacente se describe en el apéndice A.9.2 del artículo *Verbalizable Representations Form a Global Workspace in Language Models*, publicado en Transformer Circuits. El modelo base (Qwen3-4B) tiene 36 bloques y una anchura residual de 2.560 dimensiones, dato que el adaptador aprovecha: la dirección residual de entrada debe tener exactamente esa dimensionalidad. La relevancia actual es acotada pero específica: cubre la demanda de herramientas reproducibles de *activation readout* sobre modelos abiertos de tamaño medio, un nicho dominado por implementaciones propietarias o de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA de interpretabilidad; lectura por sustitución del embedding en un token marcador |
| Parametros totales | Modelo base Qwen3-4B (~4.000 millones) + adaptador LoRA; el numero exacto de parametros del adaptador no esta disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda del modelo base Qwen/Qwen3-4B |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos del modelo base se cargan por separado (compatibles con las cuantizaciones habituales de Qwen3-4B) |
| Idiomas soportados | No disponible (el prompt del lens esta en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `adapter_model.safetensors` + `adapter_config.json`) |

Datos adicionales del repositorio: tamano del repo 82,0 GB (incluye reconstructor, ficheros de *whitening* y el corpus de entrenamiento, no solo el adaptador). LoRA de rango 16 y alpha 32, con 504 tensores LoRA guardados. Diecinueve ficheros de momentos por capa congelados en `whitening/` y un manifiesto de hashes. Dataset de RL de 20.000 filas y *gate set* de 512 filas en `data/`.

## Arquitectura y entrenamiento

La arquitectura del adaptador es LoRA (rango 16, alpha 32) inyectado sobre el modelo Qwen3-4B, cuyos 36 bloques y anchura residual de 2.560 se mantienen congelados. La innovacion no esta en el transformer sino en el mecanismo de lectura: en lugar de usar un *hook* sobre el residual del bloque 45 (como hace el modelo de referencia de 27B citado en la model card), este adaptador emplea *sustitucion del embedding en el slot del marcador*. El prompt se renderiza con la plantilla de chat de Qwen3 (`add_generation_prompt=True`, `enable_thinking=False`) e incluye un unico marcador `㈎` (token 149705, con IDs vecinos 29 y 522) dentro de etiquetas `<activation>`. Ese embedding de entrada se reemplaza por `16000 * v / ||v||`, donde `v` es la direccion residual sin blanquear de 2.560 dimensiones. La generacion se limita a 128 tokens nuevos y se detiene en EOS o en el marcador de inyeccion.

El pipeline de entrenamiento documentado sigue esta secuencia: rollouts de chat on-policy, construccion de pares residual/span, aplicacion de *whiteners* congelados, entrenamiento de un reconstructor de activaciones (AR, texto → activacion) tambien congelado, continuacion AO (activacion → texto), destilacion de viñetas seleccionadas mediante NNOMP y ajuste final con GRPO. Las capas entrenadas para la lectura son 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32 y 34 (indexacion desde cero). Los ficheros `reconstructor/` y `whitening/` son necesarios para puntuar reconstrucciones, no para generar una lectura. El dataset de entrenamiento RL y el *gate set* se publican en `data/`.

## Capacidades

- Lectura de activaciones (*activation readout*): dada una direccion residual de 2.560 dimensiones procedente de una de las 12 capas entrenadas, produce una lista de conceptos en formato de viñetas `- `.
- Verbalizacion de representaciones internas: genera conceptos destinados a reconstruir la activacion de entrada, no texto libre ni respuestas de chat.
- Puntuacion de reconstruccion frente a las estadisticas de *whitening* y al reconstructor congelado (FVE, retrieval@1) para las 19 capas con momentos publicados.
- Operacion por capa: el numero de capa indica el origen de la activacion, de modo que se puede comparar la lectura de la misma direccion conceptual en distintas profundidades del modelo.
- Generacion determinista o muestreada: decodificacion voraz para inspeccion, o muestreo con temperatura 1,0 y top-p 1,0 (top-k desactivado) como se uso en la evaluacion del RL.
- No incluye tool calling, function calling, razonamiento multi-paso, vision, audio ni modo *thinking*: el adaptador no aporta capacidades generativas generales propias.
- Multilingue: no documentado; el prompt y el contrato de generacion estan en ingles.

## Casos de uso

- Auditoria de representaciones internas: un equipo de interpretabilidad captura la salida del bloque 18 antes del siguiente bloque (sin RMSNorm final), la pasa al lens y obtiene una lista de conceptos que puede contrastar con la hipotesis que habia formulado sobre esa direccion.
- Deteccion de caracteristicas latentes en Qwen3-4B: analizar que conceptos emergen en capas intermedias (por ejemplo 20 frente a 30) para mapear donde se forma una representacion concreta.
- Validacion de experimentos de *steering*: si se modifica una activacion con un vector de direccion, el lens permite comprobar si la modificacion produce una lectura conceptual coherente con el efecto observado en la generacion.
- Construccion de datasets de conceptos etiquetados: generar lecturas masivas de activaciones recogidas sobre un corpus y usarlas como etiquetas cualitativas para entrenar o evaluar clasificadores de caracteristicas.
- Control de calidad de pipelines de extraccion de activaciones: verificar que el vector capturado tiene la forma y la norma esperadas y que la capa declarada coincide con la que realmente se ha *hooked*; el helper `code/read_oracle.py` comprueba la colocacion del marcador y el emparejamiento de claves del adaptador.
- Investigacion academica reproducible sobre *global workspace*: reproducir el apendice A.9.2 del articulo de Transformer Circuits sobre un modelo abierto de 4B en lugar del modelo de referencia de 27B.
- Formacion y docencia: usar las lecturas como demostracion tangible de que un vector del residual stream es verbalizable, con un coste de computo bajo (modelo de 4B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible: el modelo no es un generador de proposito general y no se evalua como tal. La model card si registra diagnosticos internos del propio pipeline, que no son intercambiables entre si:

| Medicion | Valor registrado | Ambito |
|---|---:|---|
| FVE de validacion del AR congelado | 0,18017 | Validacion AR; `reconstructor/meta.json` |
| retrieval@1 del AR congelado | 0,817 | Mismo checkpoint AR |
| CE de validacion del estudiante destilado en dos pasadas | 1,73465 | Validacion SFT; 27.994 ejemplos de entrenamiento y 1.475 de validacion |
| FVE de *gate* inicial del RL principal | 0,1560 | 128 prompts de gate, decodificacion muestreada |
| FVE de *gate* maximo del RL principal | 0,1804 | `eval@425`; usado en la seleccion del modelo |
| FVE de *gate* final del RL principal | 0,1751 | `eval@575`; la ejecucion termino en 600 actualizaciones |

El texto de la model card queda cortado tras la frase "The RL gate set was re", por lo que la descripcion completa de la composicion del *gate set* no esta disponible. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: el peso del modelo base Qwen3-4B domina el consumo. En bf16/fp16, alrededor de 8-9 GB solo para pesos, mas activaciones y cache; en cuantizacion de 4 bits, del orden de 3-4 GB. El adaptador LoRA anadido es de rango 16 y su huella es marginal frente al base.
- GPU recomendadas: para el base en bf16, una RTX 4090 (24 GB), A100 40/80 GB o H100 para lotes mayores; para cuantizacion de 4 bits, cualquier GPU con 8 GB o mas.
- GPU de consumo: si, el modelo base de 4B entra con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. El repositorio completo ocupa 82 GB en disco, por lo que conviene descargar solo raiz de adaptador y configuracion si no se necesita el reconstructor.
- Despliegue: la ruta soportada es PyTorch + Transformers + PEFT + safetensors + huggingface_hub, cargando el helper `code/read_oracle.py` y llamando a `load_oracle(device="cuda")`. Servidores estandar como vLLM con soporte LoRA o TGI no sirven tal cual, porque la inferencia requiere reemplazar el embedding del token marcador (token 149705) por `16000 * v / ||v||`; se necesita codigo propio o un *hook* personalizado. llama.cpp/Ollama no son aplicables al adaptador sin conversion y sin implementar la inyeccion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, la generacion esta acotada a 128 tokens nuevos por lectura, lo que limita el coste por invocacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| andyx10/oracle-lens-qwen3-4b | Adaptador LoRA de interpretabilidad (oracle lens) | Base ~4B + LoRA r16 | Heredado del base (no disponible) | FVE de gate 0,1804 en el pico; retrieval@1 del AR 0,817 | No disponible | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Modelo de referencia oracle lens de 27B (mencionado en la model card) | Oracle lens sobre modelo mayor, con *hook* en el residual del bloque 45 | 27B (segun la model card) | No disponible | No disponible | No disponible | No se indica identificador ni enlace en la ficha |
| Qwen/Qwen3-4B (modelo base) | LLM generativo decoder-only denso | ~4B | No disponible en esta consulta | Benchmarks publicos del modelo base, no comparables con un lens | Licencia propia del modelo base | HuggingFace |
| Otros adaptadores de interpretabilidad comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores oracle lens publicados para modelos de 4B que permitan una comparacion directa de metricas.

## Limitaciones y advertencias

- No es un modelo de chat: un prompt de generacion de texto normal, sin inyeccion de vector, no produce una lectura oracle. Cualquier uso como asistente conversacional seria un mal uso.
- La direccion de entrada debe ser un vector residual de 2.560 dimensiones, sin blanquear y no nulo; un vector con la forma incorrecta o una capa no entrenada invalida el resultado.
- El numero de capa indica el origen de la activacion, no el bloque donde se inyecta. Confundir ambos conceptos (por ejemplo, esperar un *hook* en el bloque 45 como en el modelo de referencia de 27B) produce resultados incorrectos.
- Solo hay 12 capas entrenadas (12 a 34, pares). Las lecturas de capas fuera de ese conjunto no estan soportadas por el entrenamiento.
- Riesgo de alucinacion en la lectura: el modelo genera conceptos plausibles en lenguaje natural para una activacion; esos conceptos son hipotesis interpretativas, no una decodificacion garantizada del contenido real de la representacion. La metrica FVE de 0,1804 en el pico del gate es moderada, lo que indica reconstruccion imperfecta.
- Los valores de FVE, retrieval@1 y CE registrados son diagnosticos internos de componentes distintos (AR, estudiante destilado, gate del RL) y no deben compararse entre si ni presentarse como un benchmark del modelo.
- Sesgos: no documentados. Al ser un adaptador de interpretabilidad sobre Qwen3-4B, cualquier sesgo del corpus de rollouts de chat usado para generar los pares residual/span (20.000 filas) puede reflejarse en las lecturas producidas.
- Idiomas: no documentados; el prompt del lens esta en ingles y no hay evidencia de funcionamiento en castellano.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Conviene contactar con el autor o revisar el repositorio antes de integrarlo en un producto.
- Madurez: 0 descargas y 0 likes, sin *pipeline* declarado. Es un artefacto de investigacion reciente (creado el 22 de septiembre de 2026, actualizado el 28 de septiembre de 2026), sin senales de uso en produccion.
- Repositorio de 82 GB: descargar el arbol completo es costoso e innecesario si solo se quiere generar lecturas, ya que `reconstructor/` y `whitening/` solo hacen falta para puntuar reconstrucciones.
- Reproducibilidad: la model card recomienda fijar un commit concreto de HuggingFace (`revision`) tanto en la descarga del helper como en `load_oracle`.
- La model card esta truncada en el apartado de resultados, por lo que parte de la metodologia de evaluacion no esta disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andyx10/oracle-lens-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del pipeline de entrenamiento adaptado: https://github.com/agu18dec/olens_draft/tree/a32590085a6070d75f950155d3c2b3db3eec97ef
- Articulo con la descripcion del metodo (apendice A.9.2), *Verbalizable Representations Form a Global Workspace in Language Models*: https://transformer-circuits.pub/2026/workspace/index.html
- Helper de inferencia: `code/read_oracle.py` en el repositorio
- Contrato de generacion: `lens_config.json` en el repositorio
- Reconstructor congelado (checkpoint AR `ex16013344`): carpeta `reconstructor/` del repositorio
- Estadisticas de puntuacion: carpeta `whitening/` del repositorio
- Datasets de entrenamiento (20.000 filas de RL y 512 filas de gate): carpeta `data/` del repositorio

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos sin relacion con el artefacto, por lo que se han omitido.
