# NovaCorp/Creative_Writing-Heretic-3.2-1B

## Resumen

Creative_Writing-Heretic-3.2-1B es un modelo de generacion de texto de 1.235.814.400 parametros (1,24 B) publicado por NovaCorp (firmado en la model card por "Dr. Novaciano"). No es un modelo entrenado desde cero: es el resultado de una fusion (merge) de tres derivados de Llama 3.2 1B Instruct mediante el metodo Model Stock (arXiv:2403.19522), tomando como ancla Green-Eye/Llama-3.2-1B-Instruct-heretic y combinando Sachin903/llama-3.2-1b-creative-writing-ablated y hasanyt/llama-3.2-1b-abliterated.

El objetivo declarado es la escritura creativa y el roleplay, con un sesgo explicito hacia la eliminacion de rechazos y salvaguardas: los tres modelos de origen son variantes "abliterated" o "heretic" a las que se ha suprimido parte de la alineacion de seguridad. La propia ficha lo etiqueta como uncensored, nsfw y not-for-all-audiences. El modelo hereda la arquitectura densa de Llama 3.2 1B (transformer decoder-only con GQA, contexto de hasta 128.000 tokens y tokenizador de 128.256 entradas) y se distribuye en safetensors con precision bfloat16.

Su relevancia practica es doble: por un lado, como modelo muy ligero para generacion creativa en local sobre hardware modesto; por otro, como objeto de estudio para investigacion sobre edicion conductual a nivel de representacion (abliteracion) y sobre el efecto de las fusiones de pesos en el comportamiento de rechazo. Es un modelo sin adopcion publica: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2 1B), con Grouped-Query Attention (GQA). Dato no explicitado en la ficha del repositorio; se deduce del modelo base |
| Parametros totales | 1.235.814.400 (1,24 B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No indicada en la ficha. El modelo base Llama 3.2 1B soporta 128.000 tokens; la ficha del merge no confirma ni modifica este valor |
| Tipos de cuantizacion | No disponible: el autor no publica versiones GGUF, AWQ ni GPTQ. El repositorio solo contiene pesos bfloat16 |
| Idiomas soportados | Ingles (en) y espanol (es), segun la ficha. Llama 3.2 se entreno oficialmente con soporte para ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y thai), capacidades que el merge hereda sin garantia |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | safetensors en bfloat16, compatible con `transformers` |
| Tamano del repositorio | 2,5 GB |
| Libreria declarada | transformers; etiquetado como compatible con text-generation-inference y endpoints_compatible |
| Metodo de creacion | Fusion con mergekit, metodo `model_stock`, dtype bfloat16 |
| Fecha de publicacion | 2 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado ni ajustado: es una fusion de pesos. Se aplica el metodo Model Stock con `Green-Eye/Llama-3.2-1B-Instruct-heretic` como modelo base y ancla conductual, y se le incorporan `Sachin903/llama-3.2-1b-creative-writing-ablated` y `hasanyt/llama-3.2-1b-abliterated`. La configuracion YAML de mergekit publicada por el autor asigna los siguientes pesos:

| Modelo de origen | Coeficiente `t` | Rol declarado por el autor |
|---|---|---|
| Green-Eye/Llama-3.2-1B-Instruct-heretic | 0,90 | Ancla conductual primaria: baja tasa de rechazo, alta obediencia, respuestas directas |
| Sachin903/llama-3.2-1b-creative-writing-ablated | 0,75 | Capa expresiva: profundidad de roleplay NSFW, intensidad emocional, persistencia de personaje |
| hasanyt/llama-3.2-1b-abliterated | 0,45 | Estabilizador conversacional: fluidez y estructura del dialogo |

La base arquitectonica es Llama 3.2 1B: transformer decoder-only denso con normalizacion RMSNorm pre-normalizada, activacion SwiGLU en la red feed-forward, RoPE para codificacion posicional, GQA en la atencion y tokenizador BPE de 128.256 entradas con pesos de embedding compartidos. Meta entreno la familia Llama 3.2 1B/3B sobre hasta 9 billones de tokens con una fecha de corte de conocimiento de diciembre de 2023, e incluyo una fase de ajuste por instrucciones y preferencias humanas. Esa alineacion es precisamente lo que los modelos de origen de este merge manipulan: las tecnicas de abliteracion y de edicion conductual buscan eliminar o atenuar la direccion de rechazo en el espacio de representaciones, de modo que el modelo fusionado no ha recibido ninguna fase posterior de RLHF o DPO que restaure esas salvaguardas.

La innovacion tecnica relevante no esta en la arquitectura, sino en el metodo de fusion: Model Stock permite combinar tres o mas modelos manteniendo los rasgos conductuales dominantes del ancla y sin el suavizado semantico tipico de otras tecnicas como SLERP o TIES. El autor declara explicitamente que busca preservar obediencia y minimizar el hedging moral.

## Capacidades

- Generacion de texto libre en ingles y espanol, con especial enfasis en prosa creativa: narrativa, descripcion, dialogo y poesia.
- Roleplay y simulacion de personajes, incluida persistencia de personaje en conversaciones multi-turno y contenido para adultos (NSFW) sin filtrado aparente.
- Conversacion multi-turno con estructura de dialogo estable, heredada del modelo abliterated usado como estabilizador.
- Escritura creativa con matices emocionales y tono explicito, gracias al componente ajustado especificamente para creative writing.
- Tareas genericas de instruccion de la familia Llama 3.2 1B: resumen, reescritura, clasificacion simple y respuesta a preguntas.
- Generacion de codigo basica y aritmetica simple, limitada por el tamano de 1,24 B parametros (no es un fin del modelo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada. No se declara plantilla de herramientas ni soporte de agentes.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multimodales (vision, audio): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar borradores de relatos, novelas cortas o capitulos completos en ingles o espanol, manteniendo un estilo consistente a lo largo de la sesion gracias a la persistencia de personaje heredada del componente de creative writing. Es adecuado porque su ajuste de origen prioriza la expresividad sobre la cautela.
- Roleplay conversacional de larga duracion: en aplicaciones de entretenimiento para adultos, el modelo sostiene personajes con personalidad estable y sin rechazos, un comportamiento que los Llama 3.2 Instruct estandar no ofrecen. Requiere control de acceso por edad y moderacion en la capa de aplicacion.
- Prototipado rapido de personajes y bots de compania: con 1,24 B parametros, permite iterar sobre prompts de sistema y fichas de personaje en un portatil o en CPU, sin coste de API y con latencia baja.
- Generacion de guiones y contenido de marketing con tono libre: redaccion de copies, guiones de video corto o textos de campana donde se necesita un registro coloquial, provocador o humoristico que los modelos fuertemente alineados suavizan en exceso.
- Traduccion creativa ingles-espanol: el modelo declara ambos idiomas y puede reescribir textos creativos entre ellos, aunque sin garantia de calidad profesional; es util para localizacion de contenido narrativo, no para documentacion tecnica.
- Inferencia local en dispositivos con recursos limitados: cuantizado a 4 bits ocupa menos de 1 GB, por lo que cabe en moviles de gama alta, Raspberry Pi 5, portatiles sin GPU dedicada o entornos edge con CPU, mediante llama.cpp u Ollama.
- Investigacion sobre alineacion y edicion conductual: al ser un merge documentado de tres variantes abliterated/heretic, sirve como caso de estudio reproducible para medir como se propaga la eliminacion de rechazos a traves de una fusion de pesos y para comparar tasas de refusal antes y despues del merge.
- Base para ajuste fino ligero: por su tamano, es un punto de partida barato para LoRA o QLoRA orientados a dominios creativos especificos (novela negra, guion de videojuego, poesia) sin necesidad de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se han encontrado resultados en la busqueda web. La unica evaluacion cualitativa es la justificacion del autor sobre los pesos del merge, que describe efectos conductuales esperados (obediencia, expresividad, fluidez) sin cuantificarlos.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| MT-Bench / Arena | no disponible |
| Tasa de rechazo (refusal rate) | no disponible |

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 2,5 GB solo de pesos, mas overhead de activaciones y cache KV. En la practica, entre 3 y 4 GB de VRAM con contextos cortos.
- VRAM en cuantizacion de 8 bits: en torno a 1,3-1,5 GB de pesos.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M): en torno a 0,8-1,0 GB de pesos. Cabe en cualquier GPU con 4 GB o mas, e incluso en CPU.
- Cache KV estimada: con la configuracion GQA de Llama 3.2 1B (16 capas, 8 cabezas KV, head dim 64), la cache ocupa unos 32 KB por token en bfloat16. Un contexto de 8.000 tokens consume aproximadamente 0,25 GB adicionales y un contexto de 128.000 tokens rondaria los 4 GB. Calculo estimado a partir de la arquitectura del modelo base, no verificado por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores para bfloat16 con contexto largo. Tambien funciona sin problemas en GTX 1650, GTX 1060 6 GB, T4, L4 o incluso GPUs integradas Iris Xe si se usa cuantizacion de 4 bits. No necesita A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales, y tambien en CPU y en dispositivos edge con cuantizacion.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), text-generation-inference (etiqueta TGI declarada), vLLM, llama.cpp tras conversion a GGUF, Ollama, LM Studio, y endpoints compatibles declarados por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la documentacion publica de cada familia; los del modelo analizado, a su ficha de HuggingFace.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|
| Creative_Writing-Heretic-3.2-1B | 1,24 B | 128.000 tokens (heredado del base, no confirmado en la ficha) | Llama 3.2 Community License | Fusion orientada a escritura creativa sin censura | No disponibles |
| Llama 3.2 1B Instruct (Meta) | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Asistente general alineado | Si (publicados por Meta) |
| Qwen2.5 1.5B Instruct | 1,54 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Asistente general multilingue | Si (publicados por Alibaba) |
| Gemma 2 2B Instruct (Google) | 2,6 B | 8.192 tokens | Gemma Terms of Use | Asistente general ligero | Si (publicados por Google) |
| TinyLlama 1.1B Chat | 1,1 B | 2.048 tokens | Apache 2.0 | Chat ligero de la comunidad | Si (parciales) |

Frente a estas alternativas, la diferencia del modelo de NovaCorp no es de rendimiento bruto, sino de comportamiento: es el unico de la lista que fusiona variantes abliterated para eliminar rechazos, y su licencia Llama 3.2 impone restricciones mas estrictas que las licencias Apache 2.0 de Qwen y TinyLlama. No existe ningun benchmark que permita afirmar que supere o iguale a estos modelos en tareas objetivas; en razonamiento, codigo y matematicas un modelo de 1,24 B suele quedar por debajo de alternativas algo mayores como Gemma 2 2B.

## Limitaciones y advertencias

- Contenido no apto para todos los publicos: la ficha incluye las etiquetas `nsfw`, `uncensored` y `not-for-all-audiences`. El modelo puede generar contenido sexual explicito, violento u ofensivo sin filtrado. No debe desplegarse en productos accesibles a menores ni sin moderacion en la capa de aplicacion.
- Alineacion de seguridad suprimida: los tres modelos de origen son variantes abliterated o heretic. Esto implica una tasa de rechazo muy baja ante peticiones daninas, lo que lo hace inadecuado para asistentes de proposito general, atencion al cliente o cualquier entorno donde se espere adherirse a politicas de uso.
- Riesgo elevado de alucinacion: con 1,24 B parametros y sin benchmarks que lo respalden, la precision factual es limitada. No debe usarse como fuente de informacion ni para tareas que exijan veracidad verificable.
- Limitaciones de contexto: el autor no documenta la longitud de contexto efectiva del merge. Aunque el modelo base soporta 128.000 tokens, no hay evidencia de que la fusion preserve el rendimiento en contextos muy largos, y la atencion en modelos de este tamano se degrada rapidamente con la distancia.
- Cobertura multilingue limitada: la ficha declara solo ingles y espanol. No hay evaluacion de calidad en espanol, y al estar el ajuste de origen predominantemente en ingles, es probable que el rendimiento en castellano sea inferior.
- Sesgos no evaluados: no se ha publicado ningun analisis de sesgos de genero, raza, religion u orientacion. La eliminacion de la alineacion de seguridad puede amplificar estereotipos en la generacion creativa.
- Restricciones de licencia: se distribuye bajo la Llama 3.2 Community License, no bajo una licencia permisiva. Esto implica obligaciones de atribucion, la inclusion de la clausula de uso aceptable de Meta y restricciones en el uso por parte de entidades con mas de 700 millones de usuarios mensuales. El uso comercial esta permitido con condiciones, pero no es equiparable a Apache 2.0.
- Ausencia de soporte de herramientas: no se declara plantilla de function calling ni soporte de agentes. Integrarlo en pipelines de herramientas requeriria implementar un parseo propio de las salidas.
- Adopcion nula y falta de mantenimiento: 0 descargas y 0 likes en el momento de redactar la ficha. No hay garantia de soporte, actualizaciones ni correccion de errores por parte del autor.
- Caveat de produccion: al ser un merge no entrenado, no existe un dataset de validacion que documente su comportamiento fuera de la distribucion de los prompts creativos. Se recomienda evaluacion manual sobre el dominio objetivo antes de cualquier despliegue.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a paginas de busqueda visual de Bing, sin relacion con la ficha.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/NovaCorp/Creative_Writing-Heretic-3.2-1B
- Modelo base y ancla: https://huggingface.co/Green-Eye/Llama-3.2-1B-Instruct-heretic
- Modelo fusionado (creative writing ablated): https://huggingface.co/Sachin903/llama-3.2-1b-creative-writing-ablated
- Modelo fusionado (abliterated): https://huggingface.co/hasanyt/llama-3.2-1b-abliterated
- Paper del metodo de fusion (referenciado en las etiquetas y en la model card): https://arxiv.org/abs/2403.19522
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
