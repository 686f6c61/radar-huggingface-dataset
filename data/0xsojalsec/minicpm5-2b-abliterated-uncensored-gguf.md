# 0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-GGUF

## Resumen

MiniCPM5-2B-Abliterated-Uncensored-GGUF es una version cuantizada en formato GGUF de un modelo de lenguaje de 2,52 mil millones de parametros derivado de openbmb/MiniCPM5-2B, publicado por el usuario 0xSojalSec. El modelo del que parte (mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors) se ha sometido a "abliteration", una tecnica de edicion de pesos que elimina la direccion de rechazo aprendida durante el ajuste por preferencias, con el objetivo de reducir las negativas del modelo ante peticiones que otros modelos censurarian.

El repositorio es, por tanto, un reempaquetado en GGUF pensado para inferencia local en CPU, GPU de gama baja y dispositivos de borde, tal y como reflejan las etiquetas on-device y edge-ai. La ficha declara soporte de tool calling, generacion de texto conversacional y compatibilidad con endpoints, con ingles y chino como unicos idiomas soportados y licencia Apache 2.0.

Su relevancia practica es limitada pero concreta: ofrece un modelo bilingue de ~2,5 B ejecutable en hardware modesto y sin filtros de rechazo, lo que lo hace util para experimentacion con prompts que otros modelos bloquean. Con cero descargas y cero likes en el momento de los datos, se trata de un artefacto sin validacion comunitaria ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia LLaMA (etiquetas del repositorio: llama, minicpm5); detalle interno no disponible |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los tipos concretos incluidos en este repositorio no se detallan en la informacion disponible. La model card remite a mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF para Q2_K, Q3_K_S, Q3_K_M, Q4_K_S y Q5_K_S |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); variante en safetensors y MLX 4-bit en repositorios separados de mondk |
| Autor del repositorio | 0xSojalSec |
| Modelo base | mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors (a su vez derivado de openbmb/MiniCPM5-2B) |
| Pipeline | text-generation |
| Tamano del repositorio | 17,2 GB |
| Fecha de creacion y actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Etiquetas | gguf, minicpm, minicpm5, llama, text-generation, tool-calling, on-device, edge-ai, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un transformer decoder-only de la familia LLaMA, segun las etiquetas `llama` y `minicpm5` del repositorio, con 2.516.756.480 parametros totales. No se detallan en la documentacion proporcionada aspectos como el mecanismo de atencion, la codificacion posicional, el numero de capas, la dimension oculta, el vocabulario ni la longitud de contexto nativa. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otro metodo de alineacion en el modelo original MiniCPM5-2B.

La innovacion diferencial no esta en la arquitectura sino en el post-procesado: la "abliteration" consiste en identificar en el espacio de activaciones una direccion asociada a las respuestas de rechazo y ortogonalizar las matrices de pesos (tipicamente las proyecciones de salida de las capas de atencion y de la MLP) contra esa direccion, de modo que el modelo pierde la tendencia a negarse a responder. Este proceso no requiere reentrenamiento y suele degradar ligeramente la coherencia general, aunque la magnitud de esa degradacion no esta cuantificada en la ficha. La cuantizacion posterior a GGUF la realiza el publicador del repositorio, y la model card indica explicitamente que no existen otras versiones cuantizadas propias.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Llamada a herramientas y funciones (`tool-calling`), lo que permite integracion con APIs y agentes.
- Inferencia en dispositivo (`on-device`, `edge-ai`), orientada a equipos sin GPU dedicada.
- Bilinguismo ingles-chino; no se declaran otros idiomas.
- Modo sin rechazos (abliterated/uncensored): responde a peticiones que modelos alineados convencionalmente rechazan.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- No se declaran capacidades de vision, audio, razonamiento extendido con cadena de pensamiento explicita ni decodificacion especulativa.

## Casos de uso

- Generacion de texto en local sin conexion: un desarrollador puede ejecutar el modelo en un portatil o en una minicomputadora mediante llama.cpp u Ollama, con pesos de ~1,5 GB en Q4, para tareas de redaccion y resumen sin enviar datos a terceros.
- Asistente conversacional en aplicaciones de escritorio o moviles: el tamano de 2,52 B permite incrustar el modelo en aplicaciones Electron, iOS o Android (via MLX 4-bit o GGUF) manteniendo conversaciones multi-turno con latencia baja.
- Experimentacion con seguridad y alineacion: al estar abliterado, sirve como referencia para estudiar como se comporta un modelo sin la direccion de rechazo, comparando sus respuestas con las del MiniCPM5-2B original.
- Agentes con tool calling en entornos de borde: la etiqueta `tool-calling` permite usarlo como planificador ligero que invoca funciones locales (lectura de ficheros, consultas HTTP, calculo) en dispositivos con recursos limitados.
- Preprocesado y clasificacion de texto en pipelines de datos: tareas de etiquetado, extraccion de entidades o reescritura de textos en ingles y chino donde no se requiere un modelo grande.
- Traduccion y asistencia bilingue ingles-chino: es uno de los pocos modelos de este tamano declarados explicitamente para ambos idiomas, util para prototipos de traduccion o atencion al cliente bilingue.
- Educacion e investigacion en hardware de consumo: permite reproducir experimentos de cuantizacion y ablacion en una unica GPU de 8-12 GB o incluso en CPU, sin acceso a clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la ficha de HuggingFace ni la model card del autor incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo original ni para la version abliterada. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (2,52 B) y del formato GGUF; no proceden de mediciones publicadas del modelo.

- VRAM estimada para inferencia: ~1,0-1,5 GB en Q2_K; ~1,5-2,0 GB en Q4_K_M; ~2,5-3,0 GB en Q8_0; ~5,0-6,0 GB en FP16.
- Memoria RAM para ejecucion en CPU: 4 GB en cuantizaciones Q4, 8 GB recomendados para contexto largo y Q8.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RX 6600). Con 8-12 GB (RTX 3060 12 GB, RTX 4070) se puede usar FP16 y contextos amplios. En A100 o H100 el modelo esta infrautilizado y solo tiene sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, y tambien en Apple Silicon (M1 o superior) via Metal o MLX.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan. vLLM soporta GGUF de forma experimental; para TGI conviene usar la variante en safetensors de mondk, ya que TGI no sirve GGUF de forma nativa.
- Latencia y throughput: no disponibles. Como referencia orientativa, en una CPU moderna un modelo de este tamano en Q4 suele moverse en el rango de decenas de tokens por segundo, y en una GPU de gama media-alta puede superar ampliamente los 100 tokens por segundo; no hay mediciones publicadas que confirmen estos valores para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos disponibles |
|---|---|---|---|---|---|
| MiniCPM5-2B-Abliterated-Uncensored (este repositorio) | 2,52 B | no disponible | en, zh | Apache 2.0 | GGUF; safetensors y MLX 4-bit en repos de mondk |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | 29 idiomas | Apache 2.0 | safetensors; GGUF de comunidad |
| Gemma-2-2B-it | ~2,61 B | 8.192 tokens | multilingue, principalmente en | Gemma Terms of Use | safetensors; GGUF de comunidad |
| SmolLM2-1.7B-Instruct | ~1,71 B | 8.192 tokens | principalmente en | Apache 2.0 | safetensors; GGUF de comunidad |

Los datos de los modelos comparados proceden de sus fichas oficiales. No se dispone de resultados de benchmarks comparativos entre ellos y este modelo. La diferencia funcional clave frente a las alternativas es que solo este repositorio elimina el comportamiento de rechazo mediante abliteration; Qwen, Gemma y SmolLM2 mantienen la alineacion de seguridad estandar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada que respalde la calidad del modelo, ni antes ni despues de la abliteration.
- La abliteration suele degradar la coherencia general y aumentar la tasa de respuestas incorrectas o degeneradas; no se ha cuantificado ese efecto en este caso.
- Riesgo alto de alucinacion, inherente a un modelo de 2,52 B sin verificacion factual externa.
- Contenido sin filtrar: al eliminar la direccion de rechazo, el modelo puede generar texto ofensivo, peligroso o ilegal. Requiere moderacion en cualquier despliegue publico.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano, por lo que su rendimiento en espanol es impredecible.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla previamente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado. El modelo base original de openbmb y el trabajo de abliteration de mondk deberian citarse y revisarse por separado.
- Adopcion nula (0 descargas, 0 likes) y repositorio publicado el mismo dia de su ultima actualizacion: no hay senal de uso real, pruebas de terceros ni mantenimiento.
- Inconsistencia documental: el titulo de la model card hace referencia al repositorio mondk/...-GGUF mientras que el repositorio efectivamente consultado es 0xSojalSec/...-GGUF, lo que sugiere un reempaquetado o copia sin documentacion propia.
- No se detalla que cuantizaciones contiene realmente el repositorio de 17,2 GB, lo que complica estimar el espacio en disco antes de la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-GGUF
- Modelo base en safetensors: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Version MLX 4-bit: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-MLX-4Bit
- Cuantizaciones adicionales (Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q5_K_S): https://huggingface.co/mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF
- Modelo original de openbmb: https://huggingface.co/openbmb/MiniCPM5-2B
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, su arquitectura o su entrenamiento; los resultados obtenidos eran irrelevantes (foros de banca).
