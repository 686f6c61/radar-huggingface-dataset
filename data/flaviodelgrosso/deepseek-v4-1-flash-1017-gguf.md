# flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GGUF es una distribucion cuantizada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario flaviodelgrosso. El modelo base es un transformer de gran escala con 329.965.689.984 parametros totales (aproximadamente 330.000 millones), empaquetado en formato GGUF para su ejecucion local en un unico Mac con Apple Silicon y 128 GB de memoria unificada. La cuantizacion comprime los expertos enrutados a unos 2 bits por peso, mientras que el resto de componentes conserva la precision original del checkpoint.

La relevancia de esta ficha radica en que constituye un ejemplo de empaquetado de un modelo de escala frontier para hardware de consumo, pero con una dependencia critica: los ficheros solo funcionan en Razor, un runtime propietario que no es de codigo abierto y que no se ha publicado publicamente en el momento de la publicacion. Ademas, llama.cpp y otros runtimes GGUF no pueden cargar estos ficheros. Por tanto, el modelo se puede descargar, pero no ejecutar hasta que Razor se publique.

El repositorio incluye dos ficheros: el modelo principal (349,3 GB) y un modelo borrador opcional DSpark (8,6 GB) para decodificacion especulativa. El modelo es mas grande que los 128 GB de RAM disponibles, por lo que Razor transmite los expertos necesarios desde el SSD interno a una cache en memoria, lo que hace que la velocidad del SSD resulte determinante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE, por la mencion a "expertos enrutados"; no se detalla en la informacion disponible) |
| Parametros totales | 329.965.689.984 (~330B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF propietario de Razor: expertos enrutados a ~2 bits por peso; resto de componentes en precision original |
| Idiomas soportados | no disponible (la model card menciona categoria "Multilingual" en la evaluacion de calidad) |
| Licencia | MIT |
| Formato de pesos | GGUF (solo compatible con el runtime Razor) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017. La model card del empaquetado menciona "expertos enrutados" (routed experts), lo que sugiere una arquitectura de mezcla de expertos (MoE), pero no se proporcionan datos sobre el numero de expertos, la activacion por token ni la longitud de contexto. Tampoco se especifican los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de este empaquetado es el esquema de compresion selectiva: los expertos enrutados se comprimen a aproximadamente 2 bits por peso, mientras que el resto de los componentes mantiene la precision del checkpoint original. Ademas, se incluye un modelo borrador DSpark de 8,6 GB que permite decodificacion especulativa, con un modo "opportunistic" que acelera la generacion en texto predecible. El runtime Razor implementa streaming de expertos desde el SSD a una cache en memoria, lo que permite ejecutar un modelo de 349,3 GB en un sistema con 128 GB de RAM unificada.

## Capacidades

- Generacion de texto: el modelo esta etiquetado como text-generation y sirve APIs compatibles con OpenAI y Anthropic.
- Razonamiento: la evaluacion de calidad reporta un 96,1 % de acuerdo con el modelo de precision completa en prompts de razonamiento.
- Codigo: la evaluacion reporta un 97,4 % de acuerdo con el modelo completo en prompts de programacion, lo que indica una preservacion casi sin perdidas en esta categoria.
- Capacidades multilingues: la model card incluye una categoria "Multilingual" en la evaluacion, con un 78,9 % de acuerdo, el valor mas bajo de las cuatro categorias.
- Tool calling / function calling: no se menciona explicitamente en la informacion disponible, aunque el servido de APIs compatibles con OpenAI y Anthropic sugiere soporte para integracion con agentes y clientes de chat.
- Agentes y razonamiento multi-paso: la model card indica que "coding agents and chat clients can connect to it directly", lo que implica uso en flujos agenticos.
- Decodificacion especulativa: soportada mediante el modelo borrador DSpark opcional.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Programacion asistida en local: el modelo puede integrarse en un cliente de codigo o un agente de desarrollo que se conecte a la API compatible con OpenAI servida por Razor. La categoria de codigo muestra un 97,4 % de acuerdo con el modelo completo, por lo que la perdida de calidad es minima para este uso.
- Razonamiento y analisis tecnico: con un 96,1 % de acuerdo en razonamiento, es adecuado para tareas de analisis, planificacion y resolucion de problemas que requieran cadenas de razonamiento largas, siempre que se ejecute en el hardware soportado.
- Chat conversacional local: la categoria de chat muestra un 88,4 % de acuerdo, suficiente para conversaciones generales, aunque con una perdida de calidad mayor que en codigo y razonamiento.
- Procesamiento de texto multilingue: la categoria multilingue cae al 78,9 % de acuerdo, por lo que su uso en produccion para idiomas distintos del ingles requiere validacion adicional y no se recomienda como caso principal.
- Desarrollo y pruebas de agentes: al servir APIs compatibles con OpenAI y Anthropic, permite conectar frameworks de agentes existentes sin adaptadores personalizados, lo que facilita prototipado en local.
- Evaluacion de tecnicas de compresion extrema: el empaquetado sirve como caso de estudio para investigadores que quieran medir el impacto de comprimir expertos a 2 bits en la calidad de salida, con las metricas de acuerdo publicadas por categoria.
- Inferencia en hardware de consumo: para desarrolladores con un Mac Apple Silicon de 128 GB que quieran ejecutar un modelo de ~330B parametros sin depender de GPUs de datacenter, siempre que acepten la dependencia del runtime Razor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye una tabla de acuerdo de siguiente token con el modelo de precision completa sobre 48 prompts reservados:

| Categoria | Acuerdo con el modelo completo |
|---|---:|
| Codigo | 97,4 % |
| Razonamiento | 96,1 % |
| Chat | 88,4 % |
| Multilingue | 78,9 % |

En cuanto a velocidad, medida en un Apple M5 Max con 128 GB:

| Escenario | Throughput |
|---|---:|
| Texto ordinario | ~32 tokens/s |
| Texto predecible con DSpark | hasta ~58 tokens/s |
| Prosa corta y variada con DSpark | poca o ninguna ganancia |

## Requisitos de hardware

- Memoria unificada: 128 GB en un Mac Apple Silicon. El runtime fue desarrollado y probado en un M5 Max.
- Sistema operativo: macOS 15 o posterior.
- Almacenamiento: unos 360 GB libres para ambos ficheros (349,3 GB del modelo + 8,6 GB del borrador DSpark).
- SSD interno rapido: imprescindible, ya que el modelo supera la RAM disponible y Razor transmite los expertos desde el SSD a una cache en memoria.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas segun la informacion disponible; los ficheros solo funcionan en Razor sobre Apple Silicon.
- Cabe en GPU de consumo: no; requiere un Mac Apple Silicon con 128 GB de memoria unificada.
- Opciones de despliegue: exclusivamente el runtime Razor (`razor serve`), con APIs compatibles con OpenAI y Anthropic. llama.cpp, Ollama, vLLM y TGI no pueden cargar estos ficheros.
- Latencia y throughput: ~32 tokens/s en texto ordinario y hasta ~58 tokens/s con decodificacion especulativa DSpark en texto predecible, medido en M5 Max.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparacion con el modelo base de precision completa (deepseek-ai/DeepSeek-V4.1-Flash-1017) es posible en terminos de calidad, segun la tabla de acuerdo de la seccion de benchmarks, pero no se dispone de sus especificaciones de contexto, licencia ni requisitos de hardware en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GGUF (este) | ~330B | no disponible | MIT | GGUF propietario | Razor (Apple Silicon) |
| DeepSeek-V4.1-Flash-1017 (base) | ~330B | no disponible | MIT (upstream) | no disponible | no disponible |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de un runtime propietario: los ficheros solo se ejecutan en Razor, que no es de codigo abierto y no se ha publicado publicamente. El modelo se puede descargar pero no ejecutar hasta que Razor este disponible.
- Incompatibilidad con el ecosistema GGUF: llama.cpp, Ollama y otros runtimes estandar no pueden cargar estos ficheros, lo que rompe la portabilidad habitual del formato.
- Perdida de calidad en multilingue: el acuerdo con el modelo completo cae al 78,9 % en la categoria multilingue, frente al 97,4 % en codigo. El texto no ingles es el mas afectado por la compresion a 2 bits.
- Perdida de calidad en chat: el acuerdo del 88,4 % en chat indica una degradacion apreciable en conversacion general respecto al modelo de precision completa.
- Rendimiento dependiente del SSD: al superar el modelo la RAM disponible, el throughput depende de la velocidad del SSD interno y de la eficacia de la cache de expertos.
- Requisito de hardware restrictivo: exige un Mac Apple Silicon con 128 GB de memoria unificada y macOS 15 o posterior; no es desplegable en GPUs de datacenter ni en hardware x86.
- Riesgo de alucinacion: no se han publicado evaluaciones de alucinacion en la informacion disponible; debe asumirse el riesgo habitual de los modelos generativos de gran escala.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Licencia: MIT tanto en el empaquetado como en el modelo base, lo que permite uso comercial segun los terminos de dicha licencia; los pesos son propiedad de DeepSeek.
- Caveat de produccion: la dependencia de un runtime no publicado y la falta de benchmarks estandar hacen desaconsejable su uso en produccion hasta que Razor este disponible y se publiquen evaluaciones independientes.

## Enlaces

- Repositorio Hugging Face del empaquetado: https://huggingface.co/flaviodelgrosso/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
