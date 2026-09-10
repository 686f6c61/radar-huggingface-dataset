# drowzeys/keys-Qwen3.8-27B-DSpark-vLLM-YaRN-1M-Context

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un *drafter* (borrador) para decodificación especulativa asociado a un modelo objetivo de 27B. Concretamente, es un fork **solo de configuración** de `Doopeworld/Qwen3.8-27B-DSpark-vLLM` (a su vez idéntico byte a byte a `RadixArk/Qwen3.8-27B-DSpark`): los pesos no se han tocado y lo único que cambia es el `config.json` del borrador, al que se le aplica un RoPE YaRN con factor 4,0 para llevarlo a 1.048.576 tokens de contexto.

El problema que resuelve es de interoperabilidad en el *stack* de servicio. El DSpark original es nativo a 262.144 tokens; para alcanzar 1M en Qwen3.8 hace falta un YaRN de factor 4 sobre el modelo **objetivo**. Sin embargo, vLLM y SGLang copian esa sobrescritura al borrador, y como el borrador es una configuración plana de Qwen3, el resultado es un fallo (`text_config` / `max_position_embeddings`) o un borrador que se queda con RoPE a 262k mientras el objetivo opera a 1M. Este checkpoint mueve el YaRN de 1M al propio borrador, siguiendo el mismo patrón que `dflash2_config_yarn_1m.json` de Keys.

Su relevancia es por tanto de nicho pero práctica: es la pieza que permite servir un par objetivo+borrador a 1M de contexto sin que la decodificación especulativa se rompa. Los pesos de safetensors suman 1.359.284.737 parámetros (~1,36 B), es decir, el borrador es un modelo pequeño y plano, no el objetivo de 27B. El autor advierte explícitamente de que se trata de una superposición de RoPE, no de un reentrenamiento, y que la tasa de aceptación a 1M no está medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3DSparkModel` (borrador DSpark con config plana de Qwen3; el nombre de arquitectura se mantiene para que vLLM no lo enrute a DeepSeek-V4) |
| Parametros totales | 1.359.284.737 (~1,36 B) segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) en el borrador mediante YaRN factor 4,0 sobre 262.144 nativos |
| Tipos de cuantizacion | No declarados; el tamano del repo (2,7 GB para 1,36 B de parametros, ~2 bytes por parametro) es consistente con pesos en bf16/fp16 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo con `custom_code`) |
| Metodo especulativo | `dspark`, con `num_speculative_tokens: 7` y `draft_sample_method: probabilistic` |
| Modelo base | `RadixArk/Qwen3.8-27B-DSpark` (finetune / fork de configuracion) |
| Tamano del repositorio | 2,7 GB |
| Fecha de publicacion | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El borrador es un transformer Qwen3 "plano" (sin el envoltorio anidado `text_config` que sí tiene el objetivo) que actúa como generador de tokens candidatos dentro de un esquema de decodificación especulativa DSpark, el método implementado por RadixArk / SpecForge. En cada paso, el borrador propone 7 tokens (`num_speculative_tokens: 7`) con muestreo probabilístico (`draft_sample_method: probabilistic`) y el modelo objetivo de 27B los verifica. El objetivo determina la distribución final; el borrador solo aporta velocidad si su tasa de aceptación es alta. La arquitectura declarada sigue siendo `Qwen3DSparkModel`, un detalle deliberado para que vLLM no lo enrute a la ruta de DeepSeek-V4.

No hay entrenamiento ni ajuste alguno en este repositorio. El cambio es puramente de configuración de RoPE: se pasa de `factor: 32.0` con `original_max_position_embeddings: 8192` (que daba los 262.144 nativos) a `factor: 4.0` con `original_max_position_embeddings: 262144`, manteniendo `rope_type: yarn` y `rope_theta: 10000000`. Es decir, se reparametriza el escalado YaRN para extender el rango posicional hasta 1.048.576 tokens y se coloca ese *override* en el borrador en lugar de solo en el objetivo. El README indica que no se debe inyectar además un `text_config` anidado en el borrador, y que el YaRN hf-overrides del objetivo debe mantenerse. La innovación, por tanto, es de integración de *stack* (vLLM + YaRN + DSpark), no algorítmica.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: no es un modelo conversacional autonomo, sino el componente rapido del par objetivo+borrador.
- Propuesta de 7 tokens por paso de decodificacion, con verificacion posterior por parte del objetivo de 27B.
- Muestreo probabilistico del borrador, en lugar de decodificacion greedy del borrador.
- Contexto extendido a 1.048.576 tokens en el propio borrador mediante YaRN (factor 4,0, theta 10.000.000).
- Compatibilidad declarada con vLLM como motor de servicio; el autor cita tambien SGLang como parte del flujo problematico original.
- No dispone de tool calling ni function calling propios: cualquier capacidad de agente, codigo o matematicas proviene del modelo objetivo, no del borrador.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- No se declaran capacidades de vision, audio, modo *thinking* ni multimodalidad.

## Casos de uso

- Aceleracion de inferencia en vLLM con un objetivo de 27B: se sirve el par con `--speculative-config '{"method":"dspark","model":"/drafter","num_speculative_tokens":7,"draft_sample_method":"probabilistic"}'`, de modo que el borrador proponga tokens y el objetivo los valide. Es el caso de uso principal del repositorio.
- Despliegue en hardware de un solo nodo con memoria unificada: la etiqueta `dgx-spark` indica que el destino previsto es una DGX Spark; un borrador de 1,36 B (~2,7 GB) apenas consume memoria frente al objetivo de 27B, lo que deja margen para la cache KV en contexto largo.
- Procesamiento de documentos muy extensos: con 1M de tokens de ventana, el par puede abordar analisis de contratos, expedientes o libros completos en una sola pasada, y el borrador reduce el coste de generar resumenes o extracciones sobre esas entradas.
- Investigacion en decodificacion especulativa a contexto largo: el repositorio es una pieza de referencia para medir como cae la tasa de aceptacion del borrador a medida que el contexto crece de 262.144 a 1.048.576 tokens, algo que el propio autor senala como no medido.
- Reduccion de coste por token en produccion: al verificar varias propuestas por paso, el objetivo reduce el numero de pasadas completas; en servicios con facturacion por token generado, el ahorro depende directamente de la aceptacion observada.
- Referencia de configuracion para otros pares objetivo-borrador con YaRN: sirve como plantilla reproducible (junto a `dflash2_config_yarn_1m.json`) para trasladar el escalado posicional al borrador en lugar de dejar que el motor lo copie mal.
- Sustitucion de checkpoints de borrador que fallan al aplicar YaRN: en infraestructuras donde el borrador original provocaba caidas por `text_config` / `max_position_embeddings`, este fork evita el fallo sin tocar pesos ni reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README indica explicitamente que la aceptacion a 1M "no esta medida hasta que se banquee un objetivo de 1M con este borrador" (*acceptance at 1M is unmeasured until a 1M target + this draft is benched*). No se dispone de datos de MMLU, HumanEval, GSM8K ni de tasas de aceptacion, latencia o throughput.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 2,7 GB en el formato publicado (coincide con el tamano del repo para 1,36 B de parametros a ~2 bytes por parametro). Es una estimacion derivada del numero de parametros, no un dato declarado.
- VRAM del objetivo (27B, estimacion a partir del recuento de parametros): ~54 GB en bf16/fp16, ~27 GB en fp8 y ~14-16 GB en cuantizacion de 4 bits. Estas cifras son calculos convencionales, no datos publicados para este modelo.
- Cache KV a 1M de tokens: no disponible. Con una ventana de 1.048.576 tokens la cache KV del objetivo puede superar ampliamente el peso de los parametros; no se dispone de la configuracion de cabezas ni de capas para calcularla.
- GPU recomendadas: no disponibles en la informacion proporcionada. La etiqueta `dgx-spark` apunta a un nodo de memoria unificada como destino previsto del despliegue.
- Encaje en GPU de consumo: el borrador por si solo cabe con holgura en practicamente cualquier GPU de consumo actual (2,7 GB). El par completo con el objetivo de 27B depende de la cuantizacion elegida y de la longitud de contexto; no hay datos publicados al respecto.
- Opciones de despliegue: vLLM, tal como documenta el autor, con `--max-model-len 1048576`, `--hf-overrides` para el YaRN del objetivo y `--speculative-config` para el borrador. SGLang aparece mencionado en el analisis del problema. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Restriccion de despliegue documentada: no inyectar un `text_config` anidado en el borrador, mantener el YaRN hf-overrides del objetivo y conservar el nombre de arquitectura `Qwen3DSparkModel`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | YaRN en el borrador | Pesos | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (`drowzeys/keys-...-YaRN-1M-Context`) | 1,36 B (borrador) | 1.048.576 | Si (factor 4,0) | Sin modificar | other |
| `Doopeworld/Qwen3.8-27B-DSpark-vLLM` | 1,36 B (borrador) | 262.144 en el borrador | No | Sin modificar | other |
| `RadixArk/Qwen3.8-27B-DSpark` (original) | no disponible | 262.144 nativos | No | Originales | other |

No se dispone de datos de rendimiento ni de tasas de aceptacion de ninguna de las tres variantes, por lo que la comparacion se limita a configuracion, contexto y procedencia de los pesos. No se han identificado en la informacion proporcionada otros borradores comparables (por ejemplo, del estilo EAGLE-3 o Medusa) con los que contrastar parametros o contexto.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera respuestas por si mismo, no soporta tool calling y no debe evaluarse como un LLM de chat. Su funcion es proponer tokens que otro modelo verifica.
- Rendimiento no verificado: la tasa de aceptacion a 1M de contexto no esta medida. Cualquier ganancia de velocidad a esa longitud es una hipotesis, no un resultado.
- Cambio puramente de configuracion: es una superposicion de RoPE sobre pesos intactos. No hay reentrenamiento, ajuste fino ni calibracion del escalado YaRN, por lo que la degradacion de calidad a contextos muy largos es una incognita.
- Riesgo de desajuste entre objetivo y borrador: si el YaRN del objetivo se configura de forma distinta (por ejemplo, factor 32,0 sobre 8192 en lugar de factor 4,0 sobre 262.144), el par queda desalineado y la decodificacion especulativa pierde eficacia o falla.
- Fragilidad de integracion: la solucion depende de detalles internos de vLLM y de como copia las sobrescrituras del objetivo al borrador. Un cambio de version del motor puede invalidar el enfoque.
- Sesgos y alucinacion: no disponibles. En un esquema especulativo, los sesgos del sistema final provienen principalmente del modelo objetivo, no del borrador.
- Idiomas soportados: no disponibles, ya que no se declaran y el repositorio solo contiene configuracion.
- Licencia `other`: no se detallan los terminos en la informacion disponible. Antes de un uso comercial es imprescindible revisar las condiciones del repositorio y las del modelo base, dado que la licencia es personalizada y no estandar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con publicacion y actualizacion separadas por unos 15 segundos. Es un artefacto recien creado y sin validacion de la comunidad.
- Ausencia de documentacion adicional: no se declara pipeline, ni idiomas, ni tipos de cuantizacion, ni resultados de evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/drowzeys/keys-Qwen3.8-27B-DSpark-vLLM-YaRN-1M-Context
- Fork previo del que deriva: https://huggingface.co/Doopeworld/Qwen3.8-27B-DSpark-vLLM
- Modelo base (pesos originales y metodo DSpark): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Referencia citada para el patron de configuracion YaRN-1M: `dflash2_config_yarn_1m.json` (mencionado en el README, sin URL directa en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a la emisora alemana RADIO 21 y no guardan relacion con el modelo.
