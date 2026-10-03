# mradermacher/LaboAI-0.3.2-1.5B-GGUF

## Resumen

LaboAI-0.3.2-1.5B-GGUF es la version cuantizada en formato GGUF del modelo LaboAI/LaboAI-0.3.2-1.5B, publicada por el usuario mradermacher. Se trata de un modelo de generacion de codigo de 1.543.714.304 parametros (aproximadamente 1,5B), afinado sobre la familia Qwen2.5, y especializado segun sus etiquetas en desarrollo Android con Kotlin, Java y Jetpack Compose. La publicacion resuelve un problema muy concreto: permitir la ejecucion local de un asistente de codigo especializado en Android en hardware modesto, algo poco habitual en un ecosistema dominado por modelos de codigo de mayor tamano.

El modelo base fue entrenado por LaboAI y posteriormente cuantizado por mradermacher, que ofrece hasta doce variantes de cuantizacion (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB). Esto lo hace atractivo para escenarios de integracion en IDE, herramientas de linea de comandos o aplicaciones de escritorio donde no se dispone de GPU de gama alta ni de conectividad a APIs en la nube.

La relevancia actual del modelo radica en tres factores: su tamano reducido, su licencia Apache-2.0 (permisiva para uso comercial) y su soporte declarado de ingles, castellano y codigo. No obstante, la informacion publicada es escasa: no se detallan resultados de benchmarks, composicion exacta del dataset ni longitud de contexto, por lo que cualquier evaluacion seria debe hacerse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5 (segun etiqueta `qwen2.5` y modelo base); detalles internos no disponibles |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | x-f16, f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles), es (castellano), code (codigo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es LaboAI/LaboAI-0.3.2-1.5B, afinado a partir de la familia Qwen2.5 (etiqueta `qwen2.5` en el repositorio) mediante la libreria Unsloth (etiqueta `unsloth`). El modelo cuantizado que nos ocupa no introduce cambios de arquitectura: mradermacher se limita a convertir los pesos a formato GGUF y a generar las distintas variantes de cuantizacion, sin aplicar en el momento de la publicacion cuantizaciones ponderadas ni con matriz de importancia (imatrix).

En cuanto a los datos de entrenamiento, la model card referencia dos conjuntos de datos: `giggiovpg/ornith-android-instruct` y `giggiovpg/android-kotlin-compose-compiler-verified`. Ambos apuntan a un ajuste fino orientado a instrucciones sobre desarrollo Android (Kotlin, Java y Jetpack Compose), con verificacion de compilacion en el segundo caso. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de codigo: el modelo esta especializado segun sus etiquetas en `code-generation`, con foco explicito en Android, Kotlin, Java y Jetpack Compose.
- Asistencia de compilacion verificada: el uso del dataset `android-kotlin-compose-compiler-verified` sugiere entrenamiento orientado a producir codigo que compile, aunque no se detalla la metodologia exacta.
- Conversacion multi-turno: la etiqueta `conversational` indica soporte de dialogos, orientados presumiblemente a tareas de asistencia al desarrollo.
- Multilingue: soporte declarado de ingles, castellano y codigo como idiomas de trabajo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo Android en local: el modelo puede generar fragmentos de Kotlin y Jetpack Compose directamente en la maquina del desarrollador, sin enviar codigo propietario a servicios externos, gracias a su tamano reducido y a las cuantizaciones de 1 GB aproximado.
- Autocompletado en el IDE: integrado mediante un servidor compatible con llama.cpp u Ollama, puede sugerir lineas de codigo Java o Kotlin en tiempo (casi) real en equipos sin GPU dedicada.
- Generacion de esqueletos de aplicaciones: dado un conjunto de requisitos en lenguaje natural, el modelo puede producir la estructura inicial de un proyecto Android (activities, composables, view models), reduciendo el trabajo repetitivo de andamiaje.
- Traduccion de Java a Kotlin: con soporte declarado de ambos lenguajes, puede asistir en migraciones incrementales de bases de codigo heredadas.
- Explicacion de codigo y documentacion: el modelo puede resumir el proposito de clases y funciones Kotlin, y redactar comentarios o documentacion tecnica en castellano o ingles.
- Chat de soporte tecnico para desarrolladores: con su capacidad conversacional y bilingue, puede desplegarse como asistente interno para resolver dudas sobre APIs de Android o patrones de Compose, siempre que se acepte la tasa de alucinacion de un modelo de 1,5B.
- Prototipado rapido en entornos con recursos limitados: en portatiles, contenedores sin GPU o dispositivos de gama baja, permite disponer de un generador de codigo funcional sin dependencia de la nube.
- Filtrado o revision de fragmentos sospechosos: puede emplearse como primera pasada para detectar patrones problematicos en codigo Android antes de una revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV): aproximadamente 0,8 GB (Q2_K), 1,0-1,1 GB (Q4_K_S, Q4_K_M, IQ4_XS), 1,2 GB (Q5_K_S, Q5_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16). A estos valores hay que anadir el consumo de la cache de atencion, que crece con la longitud de contexto; la cifra exacta no esta disponible.
- Cabe con holgura en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las variantes Q4 y Q5; una RTX 3060, RTX 4060, RTX 4090 o similar ejecutaran incluso la variante f16 sin dificultad.
- Ejecucion en CPU: viable gracias al formato GGUF; las cuantizaciones Q4_K_M y Q8_0 son las recomendadas por el autor por su equilibrio entre tamano y velocidad.
- GPU de centro de datos (A100, H100): soportadas, pero sobredimensionadas para un modelo de 1,5B; no se justifica su uso salvo por agregacion de muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta explicita `ollama`), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base tambien es utilizable via `transformers`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas en la informacion proporcionada. Como referencia de categoria pueden citarse los siguientes modelos hermanos de la misma familia base, cuyos datos proceden de su documentacion publica y no de la model card analizada; deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| LaboAI-0.3.2-1.5B (base de esta ficha) | 1.543.714.304 | no disponible | apache-2.0 | Android, Kotlin, Java, Compose |
| Qwen2.5-Coder-1.5B | ~1,5B | 32.768 (segun documentacion publica de Qwen) | apache-2.0 | Codigo general, multilingue |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 (segun documentacion publica de Qwen) | apache-2.0 | Instrucciones generales |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; al ser un ajuste fino sobre un dataset concreto de Android, es esperable un sesgo hacia convenciones y versiones de API especificas de ese corpus, pero esto no se confirma en la model card.
- Riesgo de alucinacion: elevado en un modelo de 1,5B, especialmente en la generacion de APIs, nombres de clases o firmas de metodos de Android que pueden no existir. Debe validarse siempre la compilacion del codigo generado.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; el soporte se declara para ingles, castellano y codigo, sin garantias de calidad en otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificacion, tanto del modelo base como de esta cuantizacion; conviene revisar, no obstante, las condiciones de los datasets de ajuste fino, que no se detallan aqui.
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar la calidad del modelo frente a alternativas de tamano similar.
- Cifras de adopcion nulas: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica una validacion comunitaria practicamente inexistente.
- Cuantizaciones no ponderadas: el autor indica que no ha generado cuantizaciones con imatrix ni ponderadas, lo que puede traducirse en una perdida de calidad ligeramente superior en las variantes de baja precision (Q2_K, Q3_K_S) frente a lo que se obtendria con esos metodos.
- Uso en produccion: dado el tamano del modelo y la falta de datos de evaluacion, se recomienda limitarlo a asistencia con supervision humana, nunca a generacion automatica de codigo sin revision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LaboAI-0.3.2-1.5B-GGUF
- Modelo base: https://huggingface.co/LaboAI/LaboAI-0.3.2-1.5B
- Dataset de ajuste fino: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Dataset de compilacion verificada: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#LaboAI-0.3.2-1.5B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia general de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
