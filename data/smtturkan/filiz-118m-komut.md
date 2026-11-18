# smtturkan/filiz-118m-komut

## Resumen

Filiz-118M-Komut es un modelo de lenguaje especializado en turco para conversión de comandos de usuario en llamadas a herramientas (function calling), desarrollado por Samet Türkan. Se construye sobre el modelo base Filiz-118M, un transformer estándar de arquitectura `Qwen3ForCausalLM` con 118.004.016 parámetros, y añade mediante fine-tuning un módulo de bajo rango de 4,1 millones de parámetros (rango 16) que se fusiona posteriormente en los pesos, sin alterar el tamaño ni la arquitectura del modelo original.

El modelo resuelve un problema concreto: dado un enunciado en turco y un conjunto de herramientas definidas en el prompt de sistema, generar la llamada correcta en el formato `<|arama|>nombre_herramienta {"campo": "valor"}`, incluyendo la extracción de los valores de los slots. Está pensado para asistentes de voz, domótica y comandos dentro de aplicaciones que se ejecutan en el propio dispositivo (on-device), donde el tamaño reducido y la latencia baja son requisitos críticos.

Su relevancia radica en que demuestra que un modelo de solo 118M parámetros, ajustado con un módulo LoRA minúsculo (el 3,5% del tamaño del modelo), puede mejorar sustancialmente el rendimiento en enrutamiento de intención y extracción de slots frente a su base, manteniendo la licencia permisiva Apache 2.0 y la posibilidad de ejecución local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen3ForCausalLM` |
| Parametros totales | 118.004.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el autor no especifica cuantizaciones publicadas) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base Filiz-118M: un transformer decoder-only estándar de la familia Qwen3, con 118M parámetros. Sobre los pesos congelados del modelo base se entrenó un módulo de bajo rango (LoRA, rango 16) de 4,1M parámetros, que posteriormente se fusionó en los pesos del modelo. El entrenamiento se realizó sobre la partición **train** del dataset MASSIVE en su variante tr-TR durante 600 pasos, con el objetivo de aprender el mapeo de enunciados a llamadas de herramienta en el formato propio del modelo.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. El tokenizador y las utilidades de formato (definición de herramientas, tokens especiales como `<|arama|>`, `<|son|>` y `<|dusun|>`) se distribuyen a través del paquete `filiz_sozluk` del repositorio GitHub del autor. El modelo incorpora un token de "pensamiento" (`<|dusun|>`) que el autor recomienda suprimir en la generación mediante `begin_suppress_tokens` para obtener directamente la llamada a la herramienta.

## Capacidades

- Generación de llamadas a herramientas en formato estructurado `<|arama|>nombre {"campo": "valor"}<|son|>` a partir de un enunciado en turco y un catálogo de herramientas en el prompt de sistema.
- Clasificación de intención: identificación de la herramienta correcta entre un conjunto de candidatas, incluyendo escenarios con 8-12 herramientas y distractores.
- Extracción de slots (slot filling): copia de valores de fecha, hora, lugar, etc. del enunciado al JSON de la llamada.
- Soporte de function calling / tool calling en el sentido de mapeo a esquemas de herramientas predefinidos.
- Capacidad de operar con múltiples herramientas en el contexto (hasta ~12 definiciones en 1.024 tokens).
- No orientado a conversación general ni a conocimiento del mundo; el autor indica explícitamente que no es apto para chat general.
- Capacidades multilingües limitadas al turco; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito más allá del token `<|dusun|>`.

## Casos de uso

- **Asistentes de voz on-device en turco**: el modelo convierte la transcripción del usuario en una llamada a herramienta (poner alarma, consultar el tiempo, controlar dispositivos) con un coste computacional mínimo, adecuado para ejecución local en dispositivos con recursos limitados.
- **Domótica y smart home**: interpretación de comandos como "apaga la luz del salón" y traducción a llamadas `iot_hue_lightoff {"house_place": "salon"}`, integrándose con pasarelas locales sin depender de la nube.
- **Comandos dentro de aplicaciones móviles**: enrutamiento de intenciones en apps turcas (reservas, recordatorios, búsquedas) mediante un catálogo de herramientas definido en el prompt de sistema, con latencia baja y sin conexión.
- **Preprocesado de intenciones en pipelines de NLU**: uso del modelo como clasificador de intención y extractor de slots en un pipeline previo a un sistema mayor, aprovechando su precisión del 95,0% en intención con el conjunto correcto de herramientas y distractores.
- **Prototipado rápido de function calling**: gracias a su licencia Apache 2.0 y a su reducido tamaño, sirve para validar esquemas de herramientas y flujos de agente en entornos de desarrollo antes de escalar a modelos mayores.
- **Sistemas embebidos y edge computing**: despliegue en Raspberry Pi, routers o dispositivos IoT con presupuesto de memoria reducido, donde un modelo de 118M en cuantización ligera es viable y un modelo de varios miles de millones no lo es.
- **Filtrado y enrutamiento previo**: uso como "router" que reduce un catálogo grande de herramientas a las más probables antes de pasarlas a un modelo mayor, dado que el autor advierte que más de ~12 herramientas no caben en contexto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la partición **test** de MASSIVE tr-TR (no vista en entrenamiento), 200 enunciados, decodificación greedy. "Completo" significa intención y todos los valores de slots correctos.

| Configuracion | Modelo | Intencion (%) | Slots (%) | Completo (%) |
|---|---|---|---|---|
| Herramienta correcta + 3-7 distractores | Filiz-118M | 88,5 | 44,5 | 40,5 |
| Herramienta correcta + 3-7 distractores | **Filiz-118M-Komut** | **95,0** | **59,5** | **58,0** |
| 8-12 herramientas aleatorias (media 9,4) | Filiz-118M | 72,0 | 44,5 | 34,0 |
| 8-12 herramientas aleatorias (media 9,4) | **Filiz-118M-Komut** | **89,5** | **57,5** | **52,5** |

El módulo LoRA supone el 3,5% del tamaño del modelo y aporta una mejora de aproximadamente 18 puntos en precisión completa y de unos 17 puntos en precisión de intención en el escenario con muchas herramientas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,24 GB solo para pesos (118M × 2 bytes), más overhead de activaciones y KV cache para 1.024 tokens; en la práctica cabe holgadamente en menos de 1 GB.
- En cuantización de 8 bits: ~0,12 GB de pesos; en 4 bits: ~0,06 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como GPUs de portátil e incluso CPU. También viable en Apple Silicon y en dispositivos ARM.
- Cabe en GPU consumer y en hardware embebido; el tamaño del repo es de 0,5 GB.
- Opciones de despliegue: `transformers` con PyTorch (soporte declarado de `text-generation-inference` y `endpoints_compatible`); el tokenizador requiere el paquete `filiz_sozluk` del repositorio GitHub del autor. No se documentan recetas específicas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Filiz-118M-Komut | 118M | 1.024 | tr | Apache 2.0 | Function calling en turco, on-device |
| Filiz-118M (base) | 118M | 1.024 | tr | Apache 2.0 | Modelo base de propósito general en turco |
| Qwen3 (familia base) | variable | variable | multilingue | variable | Modelos base sobre los que se construye la arquitectura |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Los valores de slots son el punto débil: solo un 58,0% de coincidencia completa en el mejor escenario; las expresiones de hora y fecha y los nombres propios con sufijos pueden fallar.
- Los valores se copian tal como aparecen en el enunciado (formato de anotación de MASSIVE), por ejemplo `"izmir'de"`; la aplicación debe limpiar los sufijos si los necesita normalizados.
- Entrenado únicamente con las 60 intenciones de MASSIVE y comandos cotidianos similares; la generalización a herramientas nuevas es cercana a la del modelo base.
- No apto para conversación general ni para responder preguntas de conocimiento; hereda las limitaciones del modelo base.
- Contexto limitado a 1.024 tokens, lo que en la práctica admite como máximo unas 12 definiciones de herramientas; con catálogos mayores hay que reducir la lista previamente.
- Se debe usar decodificación greedy; `repetition_penalty` y `no_repeat_ngram_size` rompen los nombres de herramientas y los valores copiados.
- Riesgo de alucinación en la elección de herramienta y en los valores de slots cuando el enunciado es ambiguo o el catálogo es grande.
- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado solo en turco, no se recomienda su uso en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribución al autor y revisar las condiciones del dataset MASSIVE subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smtturkan/filiz-118m-komut
- Modelo base Filiz-118M: https://huggingface.co/smtturkan/filiz-118m
- Repositorio GitHub (tokenizador y ejemplos): https://github.com/smtturkan-droid/filiz
- Incidencias del repositorio: https://github.com/smtturkan-droid/filiz/issues
- Contacto del autor: smtturkan@gmail.com
