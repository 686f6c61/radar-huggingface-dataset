# mradermacher/gemma-4-31b-abliterated-v1.1-GGUF

## Resumen

Esta ficha describe la cuantizacion GGUF del modelo gemma-4-31b-abliterated-v1.1, publicada por el usuario mradermacher. Se trata de una conversion a formato GGUF de los pesos originales de Kooten/gemma-4-31b-abliterated-v1.1, un modelo derivado de la familia Gemma 4 de 31B al que se le ha aplicado la tecnica de "abliteration": una modificacion de los pesos orientada a eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo responde a peticiones que un modelo alineado convencionalmente rechazaria.

El repositorio no contiene pesos en precision completa, sino once cuantizaciones estaticas que van desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), pensadas para ejecucion local con llama.cpp y sus derivados. El modelo declara 30.697.345.596 parametros (unos 30,7 mil millones) y un tamano de repositorio de 211,9 GB, coherente con el almacenamiento de todas las variantes simultaneamente.

Es relevante ahora porque la cuantizacion GGUF es la via practica para desplegar modelos de ~30B en hardware de consumo o en estaciones de trabajo de una sola GPU, y porque los modelos "abliterated" interesan a equipos de investigacion en seguridad, red teaming y generacion de datos sinteticos sin filtros. Conviene subrayar que la informacion publicada es minima: la model card no aporta datos de arquitectura, contexto, dataset de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (unos 30,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; los metadatos mencionan tambien una variante x-f16, no listada en la tabla de ficheros |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF |
| Modelo base | Kooten/gemma-4-31b-abliterated-v1.1 |
| Biblioteca declarada | transformers |
| Tamano del repositorio | 211,9 GB |
| Descargas | 461 |
| Fecha de creacion | 2026-04-22 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la informacion proporcionada. El nombre indica que deriva de un modelo de la familia Gemma de 31B, y el parametro declarado (30.697.345.596) es consistente con un transformer denso de esa escala, pero no se aportan datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion, tipo de tokenizador ni estrategia de posicionamiento. Tampoco se indica si el modelo base emplea alguna variante de atencion eficiente o decodificacion especulativa.

Respecto al entrenamiento, la model card de esta cuantizacion no incluye ninguna descripcion del proceso: no hay numero de tokens, composicion del dataset, ni referencia a fases de RLHF, DPO o ajuste por instrucciones. Lo unico acreditado es la intervencion posterior sobre los pesos que da nombre al modelo: la abliteration, una tecnica que identifica y sustrae del espacio de activaciones la direccion asociada a las respuestas de rechazo, con el objetivo de preservar el conocimiento del modelo reduciendo su comportamiento de negativa. Esta operacion puede afectar de forma colateral a la coherencia, al seguimiento de instrucciones y a la calibracion de la confianza, pero no se han publicado evaluaciones que cuantifiquen ese impacto en este caso.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como "conversational" y compatible con endpoints, por lo que esta preparado para dialogos multi-turno.
- Eliminacion del comportamiento de rechazo: al ser un modelo abliterated, tiende a responder a peticiones que un modelo alineado rechazaria, lo que resulta util en investigacion sobre alineamiento y en red teaming.
- Capacidades de razonamiento, codigo y matematicas: no confirmadas en la informacion proporcionada; se heredarian, en su caso, del modelo base, pero no hay datos que lo acrediten.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el modelo declara unicamente el ingles; no hay indicacion de soporte para castellano u otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local: al distribuirse en GGUF, es compatible con inferencia en CPU y en GPU mediante llama.cpp y herramientas derivadas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un sistema sin la direccion de rechazo aprendida, comparando sus respuestas con las del modelo base alineado para medir el efecto de la abliteration sobre la utilidad y la coherencia.
- Red teaming y evaluacion de riesgos: se puede emplear como generador adversarial controlado para probar clasificadores de contenido, filtros de moderacion y guardarrailes antes de desplegarlos en produccion.
- Generacion de datos sinteticos sin filtros: util para construir conjuntos de datos de dominios sensibles (por ejemplo, descripciones clinicas o textos legales crudos) donde un modelo excesivamente conservador se negaria a colaborar; los datos generados deben revisarse antes de usarse.
- Escritura creativa y narrativa adulta: permite trabajar generos y tematicas que los modelos convencionales suelen declinar, con la ventaja de ejecutarse en local y no enviar el contenido a servicios de terceros.
- Asistente conversacional autoalojado: desplegado con llama.cpp u Ollama en una estacion de trabajo, sirve como chat privado para equipos que no pueden enviar datos a APIs externas.
- Traduccion y reescritura en ingles: el modelo declara soporte de ingles, por lo que encaja en tareas de reformulacion, resumen y reescritura estilistica dentro de ese idioma.
- Desarrollo de personajes y simulacion de rol: al no rechazar guiones conflictivos, es adecuado para prototipar agentes de roleplay en videojuegos o entrenamiento conversacional.
- Laboratorio de cuantizacion: las once variantes publicadas permiten medir de forma empirica la degradacion de calidad entre Q2_K y Q8_0 en una misma carga de trabajo, sin necesidad de generar las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. El autor se limita a etiquetar algunas variantes con valoraciones cualitativas ("fast, recommended" para Q4_K_S y Q4_K_M, "lower quality" para Q3_K_M, "very good quality" para Q6_K, "fast, best quality" para Q8_0) y enlaza una grafica comparativa de perplejidad entre tipos de cuantizacion.

## Requisitos de hardware

- Inferencia en precision completa: alrededor de 61 GB en FP16/BF16 (estimacion a partir de los 30,7 mil millones de parametros); requiere GPU de 80 GB o reparto entre varias GPU. Nota: el repositorio distribuido solo contiene GGUF, no pesos completos.
- Q8_0 (32,7 GB): requiere del orden de 36-40 GB de VRAM contando contexto; encaja en A100 40/80 GB, H100 y RTX A6000 de 48 GB.
- Q6_K (25,3 GB): aproximadamente 28-30 GB de VRAM; A100 40 GB, RTX A6000 48 GB, o dos GPU de 24 GB.
- Q5_K_M (21,9 GB) y Q5_K_S (21,4 GB): en torno a 24-26 GB; funcionan en una RTX 3090 o RTX 4090 de 24 GB solo con contexto reducido o con offload parcial de capas a CPU.
- Q4_K_M (18,8 GB), Q4_K_S (17,9 GB) e IQ4_XS (17,0 GB): aproximadamente 20-22 GB con contexto moderado; son las opciones mas equilibradas para GPU de 24 GB (RTX 3090, 4090, A5000).
- Q3_K_L (16,7 GB), Q3_K_M (15,4 GB) y Q3_K_S (13,9 GB): caben en GPU de 16 GB como RTX 4060 Ti 16 GB, RTX 4080 o A4000, con contexto ajustado.
- Q2_K (12,0 GB): la unica variante que puede entrar en 12-16 GB de VRAM; la perdida de calidad es apreciable.
- Tarjetas de consumo: si, el modelo es viable en RTX 4090 y 3090 con cuantizaciones de 4 bits, y en RTX 4060 Ti 16 GB con cuantizaciones de 2-3 bits.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, Jan y servidores compatibles con endpoints de OpenAI. El soporte de GGUF en vLLM y TGI es limitado o experimental; para esas plataformas conviene partir de los pesos en safetensors del modelo base.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token para ninguna de las variantes.

## Comparativa con modelos similares

No se dispone de datos de otros modelos abliterated de ~30B en la informacion proporcionada que permitan una comparacion cuantitativa. La comparacion posible se limita a las variantes del propio modelo:

| Variante | Formato | Tamano / parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (quants estaticos) | GGUF | 12,0-32,7 GB segun cuantizacion; 30,7 mil millones de parametros | apache-2.0 declarada | Publico en HuggingFace |
| Kooten/gemma-4-31b-abliterated-v1.1 (modelo base) | safetensors / transformers | 30,7 mil millones de parametros; tamano de ficheros no disponible | apache-2.0 declarada | Publico en HuggingFace |
| mradermacher/gemma-4-31b-abliterated-v1.1-i1-GGUF | GGUF con quants ponderados (imatrix) | no disponible | apache-2.0 declarada | Publico en HuggingFace |
| Otros modelos abliterated de tamano equivalente | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni de calidad general ni de seguridad, para el modelo base ni para las cuantizaciones publicadas.
- Degradacion por cuantizacion: Q2_K y Q3_K_S reducen la precision de forma notable; para uso real conviene Q4_K_M o superior. La variante Q3_K_M esta etiquetada por el propio autor como "lower quality".
- La abliteration no elimina el sesgo: suprime la tendencia a rechazar, no los sesgos presentes en los datos de entrenamiento, que pueden aflorar con mas facilidad al no existir respuestas de negativa.
- Riesgo de contenido danino: el modelo puede producir instrucciones, texto ofensivo o material ilegal. No debe exponerse como servicio publico sin moderacion en la entrada y en la salida.
- Mayor riesgo de alucinacion: al reducirse la cautela del modelo, la probabilidad de afirmar con seguridad informacion falsa puede aumentar; se recomienda verificacion externa en cualquier uso factual.
- Idiomas: solo se declara ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Licencia: el repositorio declara apache-2.0, pero al tratarse de una obra derivada de un modelo de la familia Gemma, conviene verificar los terminos de uso del modelo original antes de un despliegue comercial, ya que las familias Gemma suelen publicarse bajo una licencia propia con condiciones adicionales.
- Model card minima: no hay informacion sobre datos de entrenamiento, tokenizador, plantilla de prompt ni hiperparametros de generacion recomendados, lo que complica la reproducibilidad.
- Interfaz: el repositorio esta etiquetado con la biblioteca transformers, pero solo contiene GGUF, por lo que no se puede cargar directamente con AutoModel sin convertir los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31b-abliterated-v1.1-GGUF
- Modelo base: https://huggingface.co/Kooten/gemma-4-31b-abliterated-v1.1
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/gemma-4-31b-abliterated-v1.1-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#gemma-4-31b-abliterated-v1.1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
