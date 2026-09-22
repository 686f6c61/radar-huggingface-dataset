# freakyskittle/M.O.G.-SEC-27B-eagle3-draft

## Resumen

M.O.G.-SEC-27B-eagle3-draft es una cabeza borrador (*draft head*) de decodificacion especulativa EAGLE-3, publicada por el usuario freakyskittle, disenada para acelerar la inferencia del modelo objetivo Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX, un hibrido Qwen3.5 de 27.000 millones de parametros con arquitectura `qwen35` en llama.cpp. No es un modelo conversacional autonomo: es un componente auxiliar que propone varios tokens por paso y deja que el modelo objetivo los verifique en una sola pasada, de forma que la salida final es identica (lossless) a la del objetivo sin decodificacion especulativa.

El borrador es muy pequeno en comparacion con el objetivo: 609.785.600 parametros (unos 610M) frente a los 27B del modelo al que sirve. Se compone de una unica capa decoder con hidden 5120, 40 cabezas de atencion y 8 de KV, intermediate 17408, que lee los estados ocultos de tres capas auxiliares del objetivo (mapeadas a las capas 2, 32 y 61 en un objetivo de 64 capas) para predecir los siguientes tokens. Emplea un vocabulario borrador reducido de 32.000 tokens que se remapea al vocabulario completo del objetivo (248.320) mediante una tabla `d2t`, y hereda los embeddings del objetivo en lugar de almacenarlos.

Su relevancia es practica: permite reducir la latencia y aumentar el throughput del modelo objetivo en llama.cpp sin alterar sus respuestas, siempre que se use una cuantizacion del objetivo alineada con el entrenamiento (Q4_K_M o superior). Se trata, segun el propio autor, de una prueba de concepto entrenada durante 900 pasos sobre unas 4.000 muestras genericas, con tasas de aceptacion que deben considerarse un suelo y no un techo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft EAGLE-3: transformer decoder de 1 capa que consume los estados ocultos de tres capas auxiliares del objetivo (formato HF `LlamaForCausalLMEagle3`) |
| Parametros totales | 609.785.600 (~610M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no define contexto propio; opera dentro de la ventana del objetivo) |
| Tipos de cuantizacion | No se publican cuantizaciones propias del borrador; se distribuye en fp16 y bf16, y se usa junto a un objetivo cuantizado en Q4_K_M o superior |
| Idiomas soportados | No disponible (comparte el tokenizador del objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16) y GGUF (bf16, `arch: eagle3`) |
| Hidden size | 5120 |
| Cabezas de atencion / KV | 40 / 8 |
| Intermediate size | 17408 |
| Vocabulario borrador | 32.000 tokens (remapeado a 248.320 via tabla `d2t`) |
| Capas auxiliares (taps) | Objetivo de 64 capas -> capas [2, 32, 61] |
| Modelo base | Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16 |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

EAGLE-3 funciona anadiendo una cabeza borrador ligera que no predice tokens desde cero, sino que lee los estados ocultos de tres capas auxiliares del modelo objetivo y, a partir de ellos, propone varios tokens candidatos por paso de decodificacion. El objetivo verifica esas propuestas en una unica pasada hacia delante; los tokens aceptados se conservan y la generacion continua desde el primer rechazo. Segun la model card, este esquema ofrece una aceptacion superior a la de un borrador independiente del mismo tamano y es lossless respecto a las salidas del objetivo (no modifica la distribucion final). El borrador hereda los embeddings del tokenizador del objetivo y usa un vocabulario reducido de 32.000 entradas mapeadas de vuelta al vocabulario completo mediante las tablas `t2d`/`d2t`, lo que reduce el coste de la capa de salida.

El entrenamiento se realizo con *online test-time-training* de EAGLE-3 (longitud 4) usando los logits del objetivo como senal de destilacion de conocimiento, con el modelo y la perdida de borrador de SpecForge y un entrenador propio que ejecutaba el objetivo de 27B en 4 bits (bitsandbytes nf4) sobre 2x T4 mientras entrenaba el borrador en fp16. El conjunto de datos fueron aproximadamente 4.000 muestras de instrucciones (alpaca-cleaned), en formato ChatML simple y enmascarando los tokens de respuesta, durante 900 pasos. Las tasas de aceptacion registradas durante el entrenamiento fueron de aproximadamente 0,60-0,66 para el primer token (acc0) y 0,5-0,6 para el ultimo paso de TTT (acc_last), medidas contra los propios logits del objetivo de entrenamiento.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: propone varios tokens por paso que el objetivo verifica en una sola pasada.
- Aceleracion lossless: la distribucion de salida final es la del objetivo; el borrador no altera el resultado, solo el coste computacional.
- Integracion con llama.cpp: soporta el tipo de especulacion `--spec-type draft-eagle3` y la arquitectura objetivo `qwen35`.
- Remapeo de vocabulario reducido: traduce entre un vocabulario borrador de 32.000 tokens y el vocabulario completo del objetivo (248.320) mediante las tablas `d2t`/`t2d`.
- Reutilizacion de embeddings: no almacena embeddings propios, sino que hereda los del objetivo, reduciendo el tamano del artefacto.
- Compatibilidad con cualquier cuantizacion del objetivo, con mejor rendimiento cuanto mas se acerque al rango Q4 usado en entrenamiento.
- No dispone de capacidades propias de generacion de texto, razonamiento, codigo, matematicas o vision: depende siempre de un modelo objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo; esas capacidades pertenecen al objetivo.
- No se documentan capacidades multilingues propias ni modo de pensamiento (*thinking mode*).

## Casos de uso

- Aceleracion de inferencia local del objetivo 27B: el borrador se carga junto al modelo M.O.G.-SEC-27B en llama-server y reduce el numero de pasadas necesarias para generar la misma secuencia, manteniendo la salida intacta.
- Reduccion de latencia en asistentes de codigo: en entornos de autocompletado interactivo, la decodificacion especulativa disminuye el tiempo hasta el primer token util sin degradar la calidad de las sugerencias del objetivo.
- Aumento de throughput en servidores de inferencia: con multiples peticiones concurrentes, la aceptacion de varios tokens por paso libera capacidad de computo del objetivo, elevando el numero de tokens generados por segundo.
- Despliegue en hardware modesto: el borrador anade solo unos 610M de parametros (alrededor de 1,2 GB en fp16/bf16), por lo que el coste de memoria adicional es marginal frente al objetivo de 27B.
- Analisis y asistencia en ciberseguridad: dado que el objetivo se presenta como un modelo orientado a ciberseguridad, el borrador acelera tareas de triaje de alertas, resumen de informes y apoyo a analistas sin modificar las respuestas del objetivo.
- Experimentacion en decodificacion especulativa: sirve como caso de estudio reproducible para medir como la cuantizacion del objetivo, el dominio del dataset y el formato de los datos afectan a la tasa de aceptacion EAGLE-3.
- Entrenamiento de borradores propios: la receta descrita (SpecForge + objetivo en 4 bits sobre 2x T4) es una referencia para reentrenar cabezas borrador especificas de dominio o con formato de pensamiento.
- Reduccion de costes en la nube: al requerir menos pasos del objetivo para producir la misma salida, disminuye el tiempo de GPU facturado en despliegues con cuantizacion Q4 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico rendimiento reportado es la tasa de aceptacion de la decodificacion especulativa:

| Metrica | Valor | Contexto |
|---|---|---|
| Aceptacion del primer token (acc0) | ~0,60-0,66 | Medida durante el entrenamiento contra los logits del objetivo |
| Aceptacion del ultimo paso TTT (acc_last) | ~0,5-0,6 | Medida durante el entrenamiento contra los logits del objetivo |
| Tasa de aceptacion en runtime (objetivo Q2_K) | ~0,15 | Prueba rapida en CPU; cuantizacion demasiado baja |
| MMLU / HumanEval / GSM8K | No disponible | No publicados |

El autor indica que estos valores son un suelo, no un techo, y que la aceptacion mejora alineando la cuantizacion del objetivo con la usada en entrenamiento (Q4_K_M o superior) y entrenando con datos de dominio y en formato de pensamiento.

## Requisitos de hardware

- VRAM del borrador: 609.785.600 parametros, aproximadamente 1,2 GB en fp16 o bf16. El coste adicional sobre el objetivo es minimo.
- VRAM del objetivo: no especificada en la informacion disponible. Estimacion a partir del nombre del modelo (27B): en torno a 16-17 GB en Q4_K_M y unos 54 GB en BF16, aunque el dato no esta confirmado en la ficha.
- GPU recomendadas para el borrador: cualquier GPU moderna, incluidas tarjetas de consumo; el borrador por si solo cabe holgadamente en una RTX 3060 o superior.
- GPU para el conjunto objetivo + borrador: el objetivo de 27B en Q4_K_M exige al menos una GPU de 24 GB (RTX 3090/4090) o reparto entre varias; en BF16 requeriria GPUs de clase A100/H100.
- Cabe en GPU de consumo: el borrador si, en practicamente cualquier GPU de consumo e incluso en CPU. El objetivo completo, solo en configuraciones Q4 o inferiores y con suficiente VRAM.
- Entrenamiento: se realizo sobre 2x T4 (16 GB cada una) con el objetivo en 4 bits (nf4) y el borrador en fp16.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte EAGLE-3 (`--spec-type draft-eagle3`) y arquitectura objetivo `qwen35`. No se documentan otros motores compatibles.
- Latencia y throughput: no se publican cifras concretas de latencia ni de tokens por segundo; la tasa de aceptacion es el unico indicador disponible.

## Comparativa con modelos similares

| Alternativa | Parametros | Tipo | Aceptacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M.O.G.-SEC-27B-eagle3-draft | ~610M | Draft EAGLE-3 (lee estados ocultos del objetivo) | acc0 ~0,60-0,66; acc_last ~0,5-0,6 | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Borrador independiente del mismo tamano | ~610M | Draft standalone (no lee estados del objetivo) | Segun la model card, inferior al EAGLE-3 del mismo tamano | No disponible | No disponible |
| Cabezas Medusa | No disponible | Multiples cabezas sobre el objetivo | No disponible | No disponible | No disponible |
| Sin aceleracion (objetivo solo) | 27B | Decodificacion autoregresiva estandar | No aplica (no hay aceptacion) | Apache-2.0 (objetivo) | Disponible en Blackfrost-Research |

No se dispone de cifras publicadas de alternativas comparables en la informacion proporcionada; los valores de Medusa y de un borrador independiente generico no se pueden cuantificar con los datos disponibles.

## Limitaciones y advertencias

- Prueba de concepto: entrenado durante solo 900 pasos sobre unas 4.000 muestras genericas (alpaca-cleaned); el autor advierte que las cifras de aceptacion son un suelo.
- Sensibilidad a la cuantizacion del objetivo: con un objetivo muy comprimido como Q2_K la tasa de aceptacion cae a aproximadamente 0,15 en runtime. Se recomienda Q4_K_M o superior.
- Discrepancia de modo: el borrador se entreno con respuestas de instrucciones simples, sin bloques `<think>`. Como el objetivo funciona con pensamiento activado por defecto, la aceptacion sobre salidas en modo pensamiento es menor.
- Riesgo de alucinacion: no aplica al borrador en terminos de contenido, ya que el objetivo verifica cada token; el unico riesgo es una menor tasa de aceptacion, no una salida incorrecta.
- No es un modelo autonomo: no genera texto, no razona, no soporta tool calling ni agentes por si mismo; requiere siempre el objetivo al que sirve.
- Dependencia de software: necesita una compilacion de llama.cpp con soporte EAGLE-3 (`--spec-type draft-eagle3`) y la arquitectura `qwen35`; no se documentan otros motores.
- Acoplamiento al objetivo: los taps de capas auxiliares estan fijados a las capas [2, 32, 61] de un objetivo de 64 capas; usarlo con otra arquitectura o numero de capas puede invalidar el emparejamiento.
- Idiomas: no se documenta que idiomas soporta; hereda el tokenizador del objetivo y no se especifican.
- Licencia: Apache-2.0, siguiendo al modelo padre, por lo que se permite uso comercial; debe verificarse igualmente la licencia del objetivo en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validacion comunitaria independiente; el autor recomienda verificar la aceptacion en la carga de trabajo propia.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/freakyskittle/M.O.G.-SEC-27B-eagle3-draft
- Modelo base (BF16): https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-BF16
- Objetivo cuantizado (GGUF): https://huggingface.co/Blackfrost-Research/M.O.G.-SEC-27B-1M-CTX-GGUF
- SpecForge (framework de entrenamiento de borradores): https://github.com/sgl-project/SpecForge
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda disponibles.
