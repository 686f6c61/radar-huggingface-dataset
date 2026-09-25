# AnkitAI/TinyJev-4B

## Resumen

TinyJev-4B es un modelo de decision de tipo "system one" desarrollado por AnkitAI (repositorio de ankit-aglawe). No es un modelo generativo: recibe un estado (un ticket, un registro, una linea de log) junto con una serie de preguntas tipadas y devuelve valores tipados —una probabilidad por opcion— en lugar de texto libre. Se apoya en el backbone Qwen3-4B-Base, al que anade una cabeza de decision propia (head.safetensors), y comparte cabeza y datos de entrenamiento con su version pequena, TinyJev 0.6B.

El modelo resuelve el problema de tomar decisiones estructuradas y calibradas dentro de pipelines de agentes sin pagar el coste de un LLM generativo. Con 4.022.468.096 parametros (4,0B), un peso de 8 GB en fp16 (4,5 GB a 8 bits) y una latencia de unos 628 ms por decision en un M1 base, ofrece una confianza calibrada (ECE 0,022) que permite fijar umbrales de automatizacion con significado estadistico.

Es relevante ahora porque propone una via alternativa al enrutamiento y juicio mediante LLM: mismo formato de peticion (System One), API en Python, servidor HTTP local, endpoints compatibles y licencia MIT, con una tasa de acierto declarada de 474 sobre 500 decisiones nunca vistas, muy cerca de modelos en la nube mucho mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3-4B-Base mas cabeza de decision (decision head) propia, inferencia en un unico forward pass |
| Parametros totales | 4.022.468.096 (4,0B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16 (por defecto) y 8 bits (`quantize=8`, misma ponderacion en la mitad de memoria); sin datos de GGUF ni de otros formatos |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (disposicion estandar de transformers; la cabeza va en head.safetensors) |

## Arquitectura y entrenamiento

TinyJev-4B parte del backbone Qwen3-4B-Base y le superpone una cabeza de decision que transforma los estados ocultos en respuestas calibradas. El modelo no decodifica texto: recibe un estado y un conjunto de preguntas tipadas y puntua las opciones ofrecidas, devolviendo una probabilidad para cada una. Admite tres tipos de pregunta: `Choice` (elegir una opcion de una lista, con probabilidad por opcion), `Noul` (medir si una afirmacion es verdadera) y `Score` (situar un estado en una escala ordenada).

Comparte cabeza y datos de entrenamiento con TinyJev 0.6B; el conjunto de datos citado es jaredpalmer/kev-suites. La evaluacion se realiza sobre 500 casos nunca vistos procedentes de 25 dominios (suite OpenDecision, Original Choice 500), con los mismos 500 inputs para todos los modelos comparados. La innovacion principal es la calibracion de la confianza (ECE 0,022; Brier 0,071), que permite usar umbrales de confianza como criterio operativo de automatizacion.

## Capacidades

- Toma de decisiones tipada: devuelve valores estructurados (probabilidades) en lugar de texto generado, por lo que no puede responder con nada distinto de las opciones ofrecidas.
- `Choice`: selecciona una opcion de una lista y asigna una probabilidad a cada alternativa.
- `Noul`: evalua si una afirmacion es verdadera (comprobaciones si/no en formato de declaracion).
- `Score`: situa un estado sobre una escala ordenada.
- Confianza calibrada (ECE 0,022), apta para fijar umbrales de automatizacion (por ejemplo, confianza >= 0,85).
- Integracion como API de Python (`tinyjev.load(...)`, `agent.predict(...)`), servidor HTTP local y endpoint compatible con System One (`POST /v1/systemone`).
- Soporte de ejecucion via MLX (Apple Silicon) y via Torch (resto de plataformas).
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- No se documentan tool calling generativo, razonamiento multi-paso ni capacidades de vision o audio, dado que el modelo no genera texto.

## Casos de uso

- Enrutamiento de tickets de soporte: con una pregunta `Choice` se asigna el ticket al equipo adecuado (devoluciones, envios, facturacion) a partir del texto del cliente, devolviendo una probabilidad por equipo que permite automatizar solo los casos de alta confianza.
- Triaje y clasificacion de logs: dado un registro o linea de log como estado, se puntua su categoria o severidad con probabilidades, integrable en pipelines de observabilidad.
- Compuerta de escalado automatico: usando el umbral de confianza (gate a 0,85 cubre el 87% de la cola con un 99,1% de acierto), el modelo decide por si mismo la mayoria de casos y deriva el resto a una persona o a un modelo mayor.
- Verificacion de afirmaciones sobre documentacion: con preguntas `Noul` se comprueba si un texto soporta o no una afirmacion concreta, util en validacion de respuestas y control de calidad de contenidos.
- Puntuacion en escalas ordenadas: mediante `Score` se situa un estado (por ejemplo, urgencia de un caso o calidad de una respuesta) en una escala definida por el usuario.
- Agentes autonomos y orquestacion: al exponer un endpoint compatible con System One, el modelo encaja como componente de juicio rapido dentro de harness de agentes, wrappers de navegador y SDK existentes en el ecosistema.
- Procesamiento por lotes en local: con licencia MIT y pesos de 4,5 GB a 8 bits, permite ejecutar clasificacion y decisiones masivas sin dependencia de la nube ni coste por token.

## Benchmarks y rendimiento

Resultados sobre OpenDecision Original Choice 500 (25 dominios no incluidos en entrenamiento, mismos 500 inputs para todos los modelos):

| Modelo | Correctas / 500 | Gestionadas en solitario (confianza >= 0,85) |
|---|---:|---|
| Claude Opus 5.5 (nube, probabilidades autoinformadas) | 496 | 477 al 100,0% |
| TinyJev-4B (fp16) | 474 | 437 al 99,1% |
| TinyJev-4B con `quantize=8` | 473 | 437 al 99,1% |
| Kev-0.8B (logits crudos) | 463 | 186 al 100,0% |
| TinyJev-0.6B | 440 | 296 al 98,0% |
| Qwen3-0.6B sin cabeza (logits de letras) | 354 | no disponible |

Metricas adicionales de TinyJev-4B: 353/375 en dev, 121/125 en holdout, intervalo de confianza del 95% 0,928–0,966, ECE 0,022, Brier 0,071, cobertura al 2% de error del 92%, y 0,762 en transfer-v4 dev de Kev (frente a 0,625 del 0.6B y 0,790 de Kev-4B, un fine-tune completo).

Comparativa interna de la familia (fp16, latencia en M1 base de 16 GB via MLX, un forward pass por caso):

| Modelo | Parametros | Peso | OD-500 | Gate 0,85 | ms/caso |
|---|---:|---:|---:|---|---:|
| TinyJev 0.6B | 596M | 1,2 GB | 440 (88,0%) | 59% al 98,0% | 85 |
| TinyJev 4B | 4,0B | 8,0 GB | 474 (94,8%) | 87% al 99,1% | 628 |

## Requisitos de hardware

- Memoria en fp16: aproximadamente 8 GB de pesos (dato declarado por el autor), mas el overhead del runtime.
- Memoria a 8 bits (`quantize=8`): aproximadamente 4,5 GB.
- Mediciones de referencia del autor: latencia de 628 ms por decision en un M1 base de 16 GB (fp16) y de 845 ms con `quantize=8`.
- Viabilidad en GPU de consumo: con 8 GB en fp16 y 4,5 GB a 8 bits, es estimable que quepa en GPUs de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), aunque el autor solo reporta mediciones en Apple M1 base; no hay cifras oficiales para GPU dedicadas.
- Opciones de despliegue documentadas: API de Python de tinyjev, servidor HTTP local y endpoint compatible con System One (`tinyjev serve`), con extras de instalacion `tinyjev[mlx]` (Apple Silicon) y `tinyjev[torch]` (resto de plataformas). Las etiquetas del repositorio incluyen text-embeddings-inference y endpoints_compatible.
- Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Throughput: no disponible; solo se documenta latencia por caso en un unico equipo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | OD-500 | Confianza calibrada | Licencia / disponibilidad |
|---|---:|---|---:|---|---|
| TinyJev-4B | 4,0B | Decision tipada, sin generacion | 474 | ECE 0,022 | MIT, pesos abiertos en HuggingFace |
| TinyJev-0.6B | 596M | Decision tipada, sin generacion | 440 | ECE 0,071 | MIT, pesos abiertos en HuggingFace |
| Kev-0.8B | 0,8B | Decision a partir de logits crudos | 463 | no disponible (gestiona 186 al 100,0%) | no disponible |
| Claude Opus 5.5 | no disponible | LLM generativo en la nube con probabilidades autoinformadas | 496 | no disponible | Propietario, servicio en la nube |
| Qwen3-0.6B sin cabeza | 0,6B | Backbone leido mediante logits de letras | 354 | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto: solo puntua las opciones proporcionadas, por lo que no sirve como modelo de proposito general ni para tareas generativas.
- Debilidad medida en comprobaciones si/no en formato de declaracion: obtiene 18 sobre 21 en una lista de verificacion sobre un correo de soporte (el 0.6B obtiene 14) y un 81% en negativos dificiles (afirmaciones sobre un tema que el texto menciona pero no respalda). El autor senala que los datos de entrenamiento para ese caso son el siguiente experimento.
- Idioma: unicamente ingles declarado, sin soporte multilingue documentado.
- Riesgo de error en la decision: aunque no alucina texto, puede asignar una probabilidad incorrecta o una etiqueta erronea; conviene usar el umbral de confianza para derivar los casos dudosos.
- Cobertura parcial: incluso con gate a 0,85, un 13% de la cola no se responde en solitario y requiere a una persona u otro modelo.
- Licencia MIT declarada en la model card; no se detalla en la informacion proporcionada la interaccion con la licencia del backbone Qwen3-4B-Base, dato a revisar antes de un uso comercial en produccion.
- Contexto maximo no disponible: la informacion proporcionada no especifica la longitud de contexto efectiva del modelo.
- Repositorio con 0 descargas y 0 likes, creado el 25 de septiembre de 2026: se trata de una publicacion muy reciente y sin adopcion registrada, por lo que la validacion externa es limitada.
- Las cifras de latencia proceden de un unico equipo de referencia (M1 base de 16 GB) y no deben extrapolarse directamente a otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnkitAI/TinyJev-4B
- TinyJev 0.6B en HuggingFace: https://huggingface.co/AnkitAI/TinyJev-0.6B
- Repositorio GitHub: https://github.com/ankit-aglawe/tinyjev
- Paquete en PyPI: https://pypi.org/project/tinyjev/
- Benchmarks OpenDecision: https://github.com/ankit-aglawe/tinyjev/tree/main/benchmarks/opendecision
- Ejemplos: https://github.com/ankit-aglawe/tinyjev/tree/main/examples
- Entrada de Wikipedia sobre Jev: https://en.wikipedia.org/wiki/Jev_(AI_model)
- Articulo de 4SAPI sobre Jev AI: https://blog.4sapi.com/blog/jev-ai-tiny-judgment-model
- Repositorio Lucyfer1718/tinyjev-v0: https://huggingface.co/Lucyfer1718/tinyjev-v0
- TinyJev 0.6B en HuggingFace (referencia adicional): https://huggingface.co/AnkitAI/tinyjev-0.6b
