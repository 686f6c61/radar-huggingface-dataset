# mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF

## Resumen

Esta ficha describe la cuantizacion GGUF del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, publicada por mradermacher, un generador habitual de cuantizaciones estaticas para la comunidad. Se trata de un fine-tune derivado de la familia Qwen (los tags indican `qwen3_8` y `qwen3_6`) con 27.320.697.856 parametros reales segun los safetensors del repositorio, orientado a uso conversacional sin censura (tag `uncensored`, `heretic`) y a "todos los casos de uso" segun el autor.

El modelo base combina varias tecnicas de ajuste que el autor etiqueta como Cold Fusion, GAIN Training y multi-stage tuning, con Unsloth como herramienta de entrenamiento. El repositorio incluye tambien un suplemento multimodal (`mmproj`), lo que sugiere capacidad de vision heredada del modelo original, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento.

Es relevante para desarrolladores que necesitan desplegar un modelo de ~27B en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van de 11 GB (Q2_K) a 29,1 GB (Q8_0), y para quienes buscan un modelo sin filtros de rechazo para tareas creativas o de investigacion. La licencia declarada es Apache 2.0, aunque la procedencia del fine-tune exige verificacion adicional antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen; los tags indican qwen3_8 y qwen3_6) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo base se etiqueta con `qwen3_8` y `qwen3_6`, lo que apunta a una arquitectura transformer de la familia Qwen, pero no se confirma si emplea atencion lineal, mezcla de expertos u otras variantes. El repositorio incluye ficheros `mmproj` (proyeccion multimodal), lo que indica que el modelo base incorpora capacidades de vision, aunque la model card no especifica el codificador visual ni la resolucion de imagen soportada.

En cuanto al entrenamiento, el autor del modelo base declara el uso de Cold Fusion, GAIN Training y multi-stage tuning, ademas de Unsloth, pero no se publican el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. El tag `heretic` sugiere un proceso de ablacion o ajuste para eliminar comportamientos de rechazo (uncensoring), pero no se documenta la metodologia concreta. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion optimizada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Modo "uncensored": el ajuste heretic busca reducir rechazos y respuestas evasivas.
- Capacidades multimodales: la presencia de ficheros `mmproj` indica soporte de entrada de imagen, aunque no se detalla su alcance.
- Etiquetado como "all use cases" por el autor, sin desglose de tareas especificas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion creativa sin filtros: el ajuste heretic reduce los rechazos, lo que lo hace util para escritura de ficcion, guiones o narrativa con tematicas sensibles, donde modelos alineados suelen declinar la peticion.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 16,9 GB puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) mediante llama.cpp, sin depender de APIs externas.
- Prototipado de asistentes conversacionales en ingles: el tag `conversational` y el formato GGUF permiten integrarlo rapidamente en Ollama o llama.cpp para pruebas de dialogo multi-turno.
- Investigacion sobre alineacion y censura: util para estudiar el efecto del uncensoring comparando respuestas con el modelo base y con variantes alineadas.
- Analisis de documentos con componente visual: los ficheros `mmproj` permiten, en principio, procesar imagenes junto a texto, aunque la falta de documentacion exige validacion previa.
- Entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen de la infraestructura del usuario, adecuado para prototipos con informacion sensible.
- Generacion de contenido en lote: el formato GGUF y las multiples cuantizaciones permiten ajustar el equilibrio calidad/velocidad segun el presupuesto de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11 GB de pesos, ~12-13 GB en total.
  - Q3_K_M: ~13,6 GB de pesos, ~15 GB en total.
  - IQ4_XS: ~15,5 GB de pesos, ~17 GB en total.
  - Q4_K_M: ~16,9 GB de pesos, ~18-19 GB en total.
  - Q5_K_M: ~19,6 GB de pesos, ~21-22 GB en total.
  - Q6_K: ~22,5 GB de pesos, ~24-25 GB en total.
  - Q8_0: ~29,1 GB de pesos, ~31-32 GB en total.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, H100 o RTX 6000 Ada para Q6_K y Q8_0. Para Q2_K y Q3_K_S es posible usar GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q2_K o Q3_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles. Dependeran de la GPU, la cuantizacion y la longitud de contexto; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que la comparativa se limita a caracteristicas objetivas conocidas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (este) | 27,3B | no disponible | Apache 2.0 | GGUF (y safetensors en el base) | Fine-tune uncensored con soporte multimodal via mmproj |
| Modelo base DavidAU (mismo nombre sin sufijo GGUF) | 27,3B | no disponible | Apache 2.0 | safetensors | Punto de partida del que derivan estas cuantizaciones |
| Variante i1-GGUF de mradermacher | 27,3B | no disponible | Apache 2.0 | GGUF con imatrix | Misma base, cuantizaciones ponderadas de mayor calidad potencial |

No se dispone de informacion suficiente para comparar con alternativas de otros autores (por ejemplo, Qwen2.5-32B o Mistral-Small) en terminos de rendimiento, contexto o calidad, ya que no hay benchmarks publicados en la documentacion proporcionada.

## Limitaciones y advertencias

- El ajuste uncensored/heretic implica que el modelo puede generar contenido que modelos alineados rechazarian; requiere moderacion externa en produccion.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La longitud de contexto no esta documentada, lo que impide planificar aplicaciones con ventanas largas.
- La licencia Apache 2.0 se declara en el repositorio, pero la cadena de fine-tunes (Qwen base, ajustes de DavidAU, cuantizacion de mradermacher) debe revisarse para confirmar que todos los eslabones permiten uso comercial.
- El repositorio ocupa 190,8 GB e incluye multiples cuantizaciones; conviene descargar solo el fichero necesario.
- La model card no documenta la metodologia de uncensoring ni los datos de entrenamiento, lo que dificulta evaluar sesgos y comportamientos indeseados.
- El soporte multimodal depende de ficheros `mmproj` cuya compatibilidad con el runtime debe validarse; no se especifican resoluciones ni tipos de imagen admitidos.
- El modelo tiene solo 1 like y 1539 descargas en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
