# mradermacher/Infi-MMR-3B-GGUF

## Resumen

Infi-MMR-3B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Infi-MMR-3B, desarrollado originalmente por InfiX-ai y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje pequeño multimodal (MSLM, *Multimodal Small Language Model*) de aproximadamente 3.400 millones de parámetros, diseñado específicamente para tareas de razonamiento multimodal. El modelo base emplea un currículo de entrenamiento en tres fases orientado a desbloquear la capacidad de razonamiento de modelos pequeños cuando operan sobre entradas visuales y textuales.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo multimodal de 3B parámetros en hardware de consumo, algo impracticable con los pesos originales en precisión completa. El repositorio incluye tanto los ficheros del modelo lingüístico cuantizado como los ficheros `mmproj` (proyector multimodal) necesarios para el procesamiento de imágenes, lo que habilita su uso en llama.cpp y derivados.

La información pública disponible sobre el modelo es limitada: la model card del repositorio GGUF es una plantilla genérica de mradermacher centrada en las cuantizaciones, y no se detallan en ella los datos de entrenamiento, la longitud de contexto ni los resultados de benchmarks. Esta ficha refleja exclusivamente lo verificable en la información proporcionada, indicando de forma explícita los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal basado en transformer; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 3.397.103.616 (~3,4 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Infi-MMR-3B es un modelo multimodal de pequeño tamano desarrollado por InfiX-ai. Segun la descripcion del repositorio GitHub del proyecto, Infi-MMR se presenta como un marco de trabajo (*framework*) disenado para desbloquear sistematicamente el potencial de razonamiento de los modelos de lenguaje pequenos multimodales (MSLM) mediante un curriculo de tres fases estructuradas. El resultado de ese proceso es el modelo Infi-MMR-3B. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

La arquitectura concreta (tipo de transformer, mecanismo de atencion, diseno del proyector vision-lenguaje) no se detalla en los materiales proporcionados. La presencia de ficheros `mmproj` en el repositorio GGUF confirma que el modelo incorpora un proyector multimodal que transforma representaciones visuales en embeddings compatibles con el modelo de lenguaje, siguiendo el patron habitual de los modelos vision-lenguaje implementados en llama.cpp. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imagenes: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) necesarios para la entrada visual.
- Razonamiento multimodal: el modelo base se disena explicitamente en torno a un curriculo de razonamiento sobre entradas multimodales.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; el enfasis del modelo base esta en razonamiento multimodal.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo de pensamiento (*thinking mode*), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual local en hardware de consumo: con cuantizaciones Q4_K_M (2,2 GB) o Q5_K_M (2,5 GB) junto al proyector `mmproj-Q8_0`, el modelo cabe en GPUs de gama media y permite describir imagenes o responder preguntas sobre ellas sin conexion a servicios externos.
- Prototipado rapido de aplicaciones vision-lenguaje: al ser un modelo de 3B con licencia Apache 2.0, sirve para validar pipelines de imagen mas texto antes de escalar a modelos mayores, con coste de inferencia muy reducido.
- Procesamiento por lotes de imagenes en CPU: las cuantizaciones Q3_K_S (1,7 GB) o Q4_K_S (2,1 GB) permiten ejecutar el modelo en llama.cpp sobre CPU, util para clasificar o anotar lotes de imagenes en entornos sin GPU.
- Educacion e investigacion en razonamiento multimodal: el modelo base esta disenado con un curriculo de razonamiento en tres fases, lo que lo hace adecuado como objeto de estudio para analizar como modelos pequenos adquieren capacidades de razonamiento visual.
- Integracion en aplicaciones de escritorio o moviles: el formato GGUF y el tamano reducido (desde 1,5 GB en Q2_K) facilitan el despliegue embebido en aplicaciones locales con requisitos estrictos de memoria.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion del modelo mas dos del proyector, lo que permite medir el impacto de la cuantizacion en tareas multimodales concretas dentro de un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo lingüistico, sin contar el proyector): aproximadamente 1,5 GB en Q2_K, 2,1-2,2 GB en Q4_K_S/Q4_K_M, 2,9 GB en Q6_K y 3,7 GB en Q8_0. El proyector multimodal anade 0,9 GB (mmproj-Q8_0) o 1,4 GB (mmproj-f16).
- En f16, el modelo ocupa 6,9 GB, lo que el propio autor califica de excesivo (*overkill*) para este tamano.
- GPU recomendadas: no especificadas en la informacion disponible. Por el perfil de memoria, las cuantizaciones Q4 y Q5 son aptas para GPUs de consumo con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070); las cuantizaciones Q8_0 y f16 requieren 8-12 GB o mas.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6 GB o mas de VRAM usando cuantizaciones Q4/Q5; las cuantizaciones bajas (Q2_K, Q3_K) permiten incluso despliegue en CPU.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI). El repositorio declara compatibilidad con *endpoints*.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de modelos comparables de la misma categoria (modelos multimodales de ~3B parametros). La comparacion se limita a los datos verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Infi-MMR-3B-GGUF (este) | ~3,4 B | no disponible | Apache 2.0 | GGUF | Multimodal con proyector mmproj; cuantizaciones de 1,5 a 6,9 GB |
| Infi-MMR-3B (modelo base) | ~3,4 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; misma arquitectura |
| Alternativas de ~3B multimodales | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano no esta garantizado y probablemente degrade la calidad.
- Datos tecnicos incompletos: no se publican en la informacion disponible la longitud de contexto, los datos de entrenamiento ni los benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje de 3B parametros, es propenso a generar contenido incorrecto, especialmente en tareas de razonamiento complejo o sobre imagenes ambiguas.
- Sesgos: no documentados en la informacion proporcionada; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base, no auditados publicamente.
- Cuantizacion: las cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad. Las cuantizaciones con *imatrix* no estan disponibles segun la model card.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base InfiX-ai/Infi-MMR-3B y de los datos de entrenamiento subyacentes antes de un despliegue comercial.
- El repositorio GGUF es una conversion de terceros (mradermacher); la responsabilidad sobre el comportamiento del modelo recae en el modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Infi-MMR-3B-GGUF
- Modelo base: https://huggingface.co/InfiX-ai/Infi-MMR-3B
- Repositorio GitHub del proyecto: https://github.com/InfiXAI/Infi-MMR
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Infi-MMR-3B-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
