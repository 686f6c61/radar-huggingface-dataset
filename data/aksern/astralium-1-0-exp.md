# aksern/astralium-1.0-exp

## Resumen

Astralium 1.0 Exp es un modelo de lenguaje publicado en HuggingFace por el usuario aksern bajo el identificador `aksern/astralium-1.0-exp`. Se trata de un modelo de aproximadamente 3.212 millones de parametros (3,21 B), distribuido en formato safetensors y etiquetado con la familia de arquitecturas `llama` en los metadatos del repositorio. El sufijo "exp" y la ausencia de documentacion en la model card apuntan a una publicacion de caracter experimental, sin informacion publica sobre el proceso de entrenamiento, los datos utilizados ni las capacidades reales del modelo.

La relevancia de esta ficha es principalmente practica: el modelo ocupa un nicho de tamano (~3 B de parametros) que resulta atractivo para inferencia en hardware de consumo y para despliegues con requisitos de latencia bajos, pero la falta de model card, de benchmarks y de idiomas declarados limita seriamente su evaluacion previa. Cualquier adopcion en produccion deberia ir precedida de una evaluacion propia.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento, la existencia de fases de alineacion (RLHF, DPO) ni las capacidades multilingues. Esta ficha documenta por tanto los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la etiqueta del repositorio indica familia `llama` (transformer decoder-only) |
| Parametros totales | 3.212.749.824 (~3,21 B) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se han publicado variantes GGUF, AWQ, GPTQ ni EXL2 en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

Datos adicionales verificables: el repositorio ocupa 12,9 GB, lo que con 3,21 B de parametros equivale a unos 4 bytes por parametro; esto sugiere que los pesos estan almacenados en FP32 (o en una mezcla con copias duplicadas del checkpoint), aunque el autor no lo confirma. Fecha de creacion del repositorio: 18 de octubre de 2026.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna mas alla de la etiqueta `llama` asociada al repositorio, que en el ecosistema de HuggingFace suele indicar una arquitectura transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion causal, en la linea de la familia Llama. No hay confirmacion mediante `config.json` de numero de capas, dimensiones ocultas, numero de cabezas de atencion, uso de GQA ni del tokenizador empleado.

Tampoco se dispone de datos sobre el entrenamiento: se desconoce el volumen de tokens, la composicion del corpus, si hubo fases de instruccion, RLHF o DPO, y si se aplicaron tecnicas de eficiencia como atencion lineal, decodificacion especulativa o destilacion. La unica inferencia razonable a partir del nombre ("exp") es que se trata de un checkpoint experimental sin garantias de calidad.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable por la arquitectura, pero no documentada ni verificada por el autor.
- Razonamiento y matematicas: sin datos publicados; no se puede confirmar ningun nivel de rendimiento.
- Generacion de codigo: sin datos publicados.
- Tool calling / function calling: no disponible; no se menciona ninguna plantilla de chat ni formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado en el repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no hay indicios de multimodalidad en los tags del repositorio.
- Formato de prompt: no disponible; no se ha publicado plantilla de chat ni tokens especiales.

## Casos de uso

Dado que no hay evaluacion publica, los casos siguientes son escenarios plausibles para un modelo denso de ~3 B y deben validarse con una evaluacion propia antes de llevarlos a produccion.

- Inferencia en el borde o en local: con pesos en FP16 (~6,4 GB) o cuantizados a 4 bits (~2 GB), el modelo puede ejecutarse en un portatil con GPU de 8 GB o incluso en CPU, lo que lo hace candidato para prototipos offline y aplicaciones de escritorio.
- Clasificacion y etiquetado de texto a gran escala: por su tamano, permite procesar volumenes altos de documentos con coste por token bajo, siempre que se valide la calidad en el dominio concreto.
- Extraccion de informacion estructurada: conversion de correos, facturas o contratos a JSON mediante prompts de extraccion, con validacion posterior por esquema.
- Componente de un pipeline RAG: generacion de respuestas finales a partir de fragmentos recuperados, con el modelo actuando como generador compacto y el recuperador aportando el conocimiento factual que el modelo no contiene.
- Router o clasificador de intenciones en sistemas de agentes: uso del modelo como primera etapa barata que decide a que modelo mayor o a que herramienta derivar cada peticion.
- Generacion de codigo asistida en editor: autocompletado y generacion de fragmentos cortos con baja latencia, condicionado a la validacion de su calidad real en lenguajes concretos.
- Traduccion y reescritura de textos: tareas de transformacion supervisada donde el contexto necesario es corto y el coste por inferencia importa.
- Filtrado y moderacion previa: descarte rapido de contenido irrelevante antes de invocar modelos mas grandes y caros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye resultados de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, y tampoco se han publicado curvas de entrenamiento o comparaciones con modelos de referencia.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (3,21 B); el autor no publica mediciones.

- VRAM para inferencia (solo pesos):
  - FP32: ~12,9 GB (el checkpoint ocupa 12,9 GB en el repositorio)
  - FP16/BF16: ~6,4 GB
  - INT8: ~3,2 GB
  - INT4: ~1,8-2,0 GB
- Overhead adicional: hay que sumar cache KV y estado del runtime; con contexto de 4K-8K en FP16, entre 1 y 3 GB adicionales segun configuracion. El total realista en FP16 se situa en torno a 8-10 GB.
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti 16 GB; en 8 GB cabe en FP16 justo o en INT8/INT4 con holgura.
  - Profesional/datacenter: A100 40/80 GB, H100, L40S; sobredimensionadas para un modelo de este tamano salvo por concurrencia alta.
- CPU: viable en cuantizacion INT4 con llama.cpp, con throughput bajo (decenas de tokens por segundo como maximo en CPUs modernas, sin datos medidos para este modelo).
- Opciones de despliegue: transformers (safetensors nativo), vLLM y TGI si el `config.json` es compatible con Llama; llama.cpp/Ollama requeririan conversion a GGUF, no publicada. SGLang como alternativa.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

Comparativa de especificaciones declaradas en las model cards publicas de cada modelo (no se ha evaluado el rendimiento de Astralium y no se han ejecutado benchmarks comparativos).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Astralium 1.0 Exp | ~3,21 B | No disponible | openmdw-1.1 | Repo unico, sin cuantizaciones |
| Llama 3.2 3B | ~3,21 B | 128 K | Llama 3.2 Community License | Muy extendida, GGUF y multiples runtimes |
| Qwen2.5 3B | ~3,09 B | 32 K (128 K en variantes) | Apache 2.0 | Muy extendida, GGUF y multiples runtimes |
| Phi-3.5-mini | ~3,8 B | 128 K | MIT | Extendida, GGUF disponible |
| Gemma 2 2B | ~2,6 B | 8 K | Gemma Terms of Use | Extendida, GGUF disponible |

La diferencia practica principal no es de tamano, sino de informacion disponible: los modelos de referencia publican model card completa, resultados de benchmarks, plantillas de chat y cuantizaciones de la comunidad, mientras que Astralium 1.0 Exp no ofrece ninguno de esos artefactos.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, idiomas, formato de prompt ni limitaciones conocidas.
- Riesgo de alucinacion no cuantificado: sin evaluaciones, no hay forma de estimar la tasa de errores facticos ni el comportamiento en dominios especializados.
- Sesgos desconocidos: al no publicarse la composicion del corpus, no se puede evaluar el sesgo demografico, linguistico o cultural.
- Contexto e idiomas sin declarar: imposible planificar el uso en tareas que dependan de ventanas largas o de idiomas distintos del ingles.
- Sin benchmarks: no existe evidencia publica de calidad; no se recomienda su adopcion en produccion sin una evaluacion propia con datos del dominio.
- Licencia openmdw-1.1: es una licencia de pesos abiertos promovida por la Open Model Developers Wrestling; conviene revisar el texto completo antes de un uso comercial, ya que no equivale a Apache 2.0 ni a MIT.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor probabilidad de errores en el checkpoint o en la configuracion.
- Sin cuantizaciones oficiales: el despliegue eficiente requerira convertir los pesos, con el riesgo de degradacion que ello conlleva y sin recetas validadas por el autor.
- Fecha de publicacion reciente y caracter experimental ("exp"): no hay historial de versiones ni compromiso de mantenimiento.
- Posible desajuste de formato: al no publicarse plantilla de chat ni tokens especiales, es probable obtener respuestas de peor calidad si se aplica una plantilla generica inadecuada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aksern/astralium-1.0-exp
- Perfil del autor: https://huggingface.co/aksern
- Texto de la licencia OpenMDW-1.1: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
