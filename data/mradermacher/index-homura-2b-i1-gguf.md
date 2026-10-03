# mradermacher/Index-Homura-2B-i1-GGUF

## Resumen

`mradermacher/Index-Homura-2B-i1-GGUF` es una colección de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base `IndexTeam/Index-Homura-2B`, un modelo de lenguaje de aproximadamente 2.000 millones de parámetros desarrollado por IndexTeam. La denominación "i1" indica que se trata de cuantizaciones ponderadas mediante matriz de importancia (imatrix), una técnica que reduce la pérdida de calidad respecto a las cuantizaciones estándar en el mismo rango de bits. El repositorio incluye un conjunto muy amplio de variantes, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware con restricciones severas de memoria.

El valor principal de esta ficha es practico: el repositorio de mradermacher convierte un modelo publicado originalmente en safetensors en artefactos ejecutables con llama.cpp, Ollama, LM Studio o LocalAI, sin necesidad de GPU dedicada. Esto lo hace relevante para desarrolladores que quieren evaluar la familia Index-Homura en local, para experimentacion con modelos de ~2B en portatiles y equipos de gama media, y para pipelines que requieren inferencia sin conexion.

Conviene senalar una advertencia importante: en el momento de la consulta el repositorio reporta 0 descargas, 0 likes y un tamano de 0,0 GB, lo que sugiere que los ficheros pueden no estar publicados o que el repositorio esta vacio o en construccion. Del mismo modo, no se dispone de informacion verificada sobre arquitectura, contexto, licencia o idiomas del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada; el modelo base es un LLM de texto de ~2B, sin confirmacion de si es transformer denso, MoE o hibrido) |
| Parametros totales | 479,418 segun los metadatos de safetensors citados; el nombre del modelo indica 2B. La discrepancia entre ambas cifras no esta aclarada, por lo que el dato debe tomarse como no verificado |
| Parametros activos | no aplica / no disponible (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes; no se incluye Q8_0 ni F16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); el modelo base esta en safetensors |
| Modelo base | IndexTeam/Index-Homura-2B |
| Autor de la cuantizacion | mradermacher |
| Etiquetas del repositorio | gguf, region:us |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-03 (segun los metadatos de HuggingFace; fecha anomala, se reproduce tal cual) |
| Idiomas de la model card | no disponible (la model card contiene unicamente metadatos de la conversion: `quantize_version: 2`, `convert_type: hf`, `tags: nicoboss`) |

## Arquitectura y entrenamiento

No se ha proporcionado informacion sobre la arquitectura interna del modelo base `IndexTeam/Index-Homura-2B`: no se especifica si es un transformer denso, un transformer con mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura hibrida. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o ventanas de contexto extendidas. Toda esta informacion debe consultarse en la model card del modelo original de IndexTeam, que no forma parte del material proporcionado.

Lo unico documentado en esta ficha es el proceso de cuantizacion. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversion desde pesos de HuggingFace al formato GGUF. La mencion "weighted/imatrix quants" en el texto de la model card confirma que las cuantizaciones se han generado ponderando los tensores mediante una matriz de importancia, calculada a partir de estadisticas de activacion. Este enfoque, habitual en el ecosistema de mradermacher (prefijo "i1"), mejora la fidelidad de los pesos mas sensibles en cuantizaciones agresivas (IQ1, IQ2, Q2_K, Q3_K) a costa de un tiempo de conversion mayor. El nombre `small-IQ4_NL` corresponde a una variante de menor tamano del esquema IQ4_NL.

## Capacidades

La informacion disponible no permite enumerar capacidades verificadas del modelo. A continuacion se indica lo que se puede afirmar y lo que no:

- Generacion de texto: esperable en cualquier LLM de ~2B, pero no confirmado documentalmente en el material proporcionado.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (tanto el campo de idiomas del repositorio como la model card estan vacios).
- Capacidades multimodales (vision, audio): no disponible; el repositorio no incluye el fichero `mmproj`, que es el que habilita vision en llama.cpp en modelos multimodales, aunque la ausencia de este fichero no es concluyente por si sola.
- Modo de pensamiento (thinking mode) o razonamiento explicito: no disponible.
- Capacidades de despliegue confirmadas: al estar en formato GGUF, el modelo es ejecutable con llama.cpp y con cualquiera de sus envoltorios (Ollama, LM Studio, LocalAI, llama-cpp-python), en CPU o GPU.

Existe una referencia no verificada en un foro (4chan, hilo /lmg/) que vincula la familia "Index-Homura 2B / 9B" con tareas de traduccion orientadas a un numero objetivo de silabas. Se trata de una fuente anonima y no confirmada, por lo que no debe tomarse como especificacion tecnica.

## Casos de uso

- Evaluacion local de la familia Index-Homura sin GPU: descargar una variante Q4_K_M o Q5_K_M y ejecutarla con llama.cpp o Ollama en un portatil permite valorar si el modelo encaja en un producto antes de invertir en infraestructura con el modelo base completo.
- Prototipado de asistentes conversacionales sin conexion: al ser un GGUF de ~2B, puede embeberse en aplicaciones de escritorio que requieren privacidad total, sin enviar datos a APIs externas.
- Clasificacion y extraccion de informacion en lote: tareas de etiquetado, extraccion de entidades o enrutado de tickets pueden ejecutarse en CPU con las cuantizaciones IQ3 o Q4, procesando volumenes altos sin coste por token.
- Generacion aumentada por recuperacion (RAG) en entornos air-gapped: el modelo puede actuar como generador final sobre documentos recuperados localmente, siempre que la longitud de contexto del modelo base lo permita (dato no disponible).
- Pruebas de regresion en CI/CD: las variantes de baja cuantizacion (IQ2, Q2_K) ocupan pocos cientos de MB, por lo que pueden incluirse como artefacto en un pipeline para verificar que los cambios en prompts o plantillas no degradan la salida esperada.
- Comparacion de calidades entre cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, lo que permite medir empiricamente la degradacion entre IQ1_S y Q6_K sobre un conjunto de evaluacion propio, una tarea habitual en equipos que necesitan minimizar el uso de memoria.
- Despliegue en dispositivos de borde: las cuantizaciones de 1-2 bits (IQ1_S, IQ1_M) reducen el peso del modelo a una fraccion muy pequena, lo que abre la puerta a ejecucion en mini-PC, Raspberry Pi con RAM suficiente o telefonos de gama alta mediante llama.cpp.
- Servicio de inferencia mediante LocalAI: los resultados de busqueda muestran que el catalogo de modelos de LocalAI (https://localai.io/docs/gallery.html) incluye modelos GGUF de terceros, de modo que un fichero GGUF de este tipo puede desplegarse como endpoint compatible con la API de OpenAI dentro de una organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo base `IndexTeam/Index-Homura-2B` ni para las cuantizaciones derivadas. Tampoco se dispone de mediciones de perplejidad por nivel de cuantizacion, que serian el dato mas util para elegir entre las 24 variantes ofrecidas.

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano nominal de 2.000 millones de parametros y en el comportamiento tipico de las cuantizaciones GGUF de llama.cpp. No proceden de documentacion oficial del modelo y deben validarse con una prueba real.

- VRAM estimada para inferencia (solo pesos):
  - IQ1_S / IQ1_M: aproximadamente 0,4-0,6 GB.
  - IQ2_* y Q2_K / Q2_K_S: aproximadamente 0,6-1,0 GB.
  - IQ3_* y Q3_K_S/M/L: aproximadamente 0,9-1,3 GB.
  - IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M: aproximadamente 1,2-1,5 GB.
  - Q5_K_S, Q5_K_M: aproximadamente 1,4-1,7 GB.
  - Q6_K: aproximadamente 1,7-2,0 GB.
- Memoria adicional para la cache KV: depende de la longitud de contexto (no disponible) y del numero de cabezas KV. Como referencia, entre 0,2 y 1,5 GB adicionales para ventanas de 4K a 8K tokens en un modelo de este tamano.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas puede ejecutar las variantes Q4 y Q5 con contexto moderado (RTX 3050, GTX 1650, RTX 4060, RTX 3060 12 GB). Las variantes Q6_K requieren 6-8 GB para funcionar con holgura. GPU de centro de datos (A100, H100) no aportan ventaja practica aqui: el modelo es demasiado pequeno para explotar su ancho de banda y su coste no esta justificado. En cambio, son utiles para servir muchas replicas simultaneas o para generar las cuantizaciones imatrix.
- Ejecucion en CPU: totalmente viable. Las variantes IQ2, Q2_K, IQ3 y Q4 caben en la RAM de practicamente cualquier equipo actual y permiten inferencia en CPU sin GPU.
- Consumer GPU: si, es el escenario objetivo. Cabe incluso en iGPU con memoria unificada (Apple Silicon, APU de AMD) con las cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp, LocalAI, Jan. vLLM no esta orientado a GGUF (solo soporte parcial y experimental); TGI no soporta GGUF. Para servirlo como API compatible con OpenAI, la ruta mas directa es `llama-server` o LocalAI.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo para este modelo ni para sus cuantizaciones en ninguna configuracion de hardware.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, contexto ni licencia de los modelos comparables, por lo que la comparacion se limita a los datos nominales y a la disponibilidad. Los modelos de la misma categoria (LLM de texto de 1B a 3B parametros) que se citan como referencia habitual son Qwen2.5-3B, Gemma-2-2B y Llama-3.2-3B, pero no se dispone de sus especificaciones verificadas en este material.

| Modelo | Parametros nominales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Index-Homura-2B (i1-GGUF, este repositorio) | ~2B | no disponible | no disponible | GGUF (24 variantes) | Repositorio con 0 descargas y 0,0 GB reportados; disponibilidad efectiva no confirmada |
| Index-Homura-2B (modelo base, IndexTeam) | ~2B | no disponible | no disponible | safetensors | Publicado en HuggingFace; contiene demo online, repositorio GitHub e informe tecnico segun referencias de terceros |
| Index-Homura-9B (version mayor, mencionada en fuentes de terceros) | ~9B | no disponible | no disponible | no disponible | Mencionado en fuentes no oficiales; no verificado |
| Qwen2.5-3B | ~3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Gemma-2-2B | ~2B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Llama-3.2-3B | ~3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio potencialmente vacio: el campo de tamano del repositorio indica 0,0 GB y las descargas y likes son 0. Antes de integrar nada, hay que verificar que los ficheros GGUF existen realmente y que se pueden descargar.
- Fecha de publicacion anomala: la fecha de creacion registrada (2026-10-03) es posterior a la fecha de consulta habitual de este tipo de referencias, lo que puede indicar un error de metadatos del repositorio.
- Discrepancia en el numero de parametros: los metadatos citan 479.418 parametros totales mientras que el nombre del modelo indica 2B. Es una diferencia de cuatro ordenes de magnitud que no esta explicada y que invalida cualquier estimacion basada en ese campo.
- Licencia desconocida: al no figurar licencia ni en el repositorio de cuantizacion ni en la model card, no se puede confirmar que el uso comercial este permitido. Es imprescindible consultar la licencia del modelo base `IndexTeam/Index-Homura-2B` antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que no se puede asumir un comportamiento multilingue correcto ni medir el sesgo linguistico.
- Contexto desconocido: sin la longitud de contexto no se pueden disenar aplicaciones que dependan de conversaciones largas o de documentos extensos. Un contexto corto invalida casos de uso como RAG sobre documentos completos.
- Riesgo de alucinacion: inherente a cualquier LLM de ~2B y acentuado en las cuantizaciones de 1 y 2 bits, donde la degradacion de los pesos es mayor. Las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS deben tratarse como experimentales y no como sustitutas de Q4 o superiores en tareas que exijan precision.
- Ausencia de benchmarks: no hay ninguna medicion publicada que permita fijar expectativas de calidad ni comparar con alternativas del mismo tamano.
- Trazabilidad limitada: la model card del repositorio contiene unicamente metadatos de conversion, sin informacion sobre el dataset, el entrenamiento o las capacidades del modelo. Toda la documentacion relevante esta en el repositorio del modelo base.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Afirmacion no verificada sobre traduccion: la vinculacion de la familia Index-Homura con tareas de traduccion orientadas a un numero objetivo de silabas proviene de un foro anonimo y no debe utilizarse como base para el diseno de un producto.

## Enlaces

- Repositorio de la cuantizacion (HuggingFace): https://huggingface.co/mradermacher/Index-Homura-2B-i1-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Homura-2B
- Catalogo de modelos de LocalAI: https://localai.io/docs/gallery.html
- Agregador de novedades ML/AI de Replicate (menciona IndexTeam/Index-Homura-2B, demo online, GitHub e informe tecnico): http://hype.replicate.dev/?filter=past_three_days&sources=GitHub%2CHuggingFace%2CReddit%2CReplicate
- Hilo de foro con mencion no verificada a Index-Homura 2B / 9B: https://boards.4chan.org/g/thread/109953009/lmg-local-models-general
- Repositorio de llama.cpp (runtime necesario para ejecutar los ficheros GGUF): https://github.com/ggml-org/llama.cpp
