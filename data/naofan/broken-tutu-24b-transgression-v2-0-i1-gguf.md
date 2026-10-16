# Naofan/Broken-Tutu-24B-Transgression-v2.0-i1-GGUF

## Resumen

Broken-Tutu-24B-Transgression-v2.0-i1-GGUF es un repositorio de cuantizaciones GGUF del modelo ReadyArt/Broken-Tutu-24B-Transgression-v2.0, un modelo de lenguaje de 23.572.403.200 parametros orientado a roleplay, narrativa y ficcion creativa, con enfasis explicito en contenido para adultos (NSFW/ERP). El repositorio esta alojado bajo la cuenta de Naofan, mientras que la propia model card indica que las cuantizaciones han sido generadas por mradermacher mediante el metodo i1 (imatrix), una variante de cuantizacion con importancia ponderada que suele ofrecer mejor relacion tamano/calidad que las cuantizaciones estaticas equivalentes.

El modelo base pertenece a la familia Broken-Tutu, etiquetada como "unaligned", es decir, sin el alineamiento de seguridad habitual de los modelos comerciales, lo que lo hace adecuado para escritura de ficcion sin filtros pero tambien problematico para despliegues en produccion con requisitos de moderacion. La model card no detalla la arquitectura interna, la longitud de contexto, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, por lo que buena parte de las especificaciones tecnicas quedan como no disponibles.

La relevancia de este repositorio es practica: al ofrecer una bateria completa de cuantizaciones que va desde los 5,4 GB (i1-IQ1_S) hasta los 19,4 GB (i1-Q6_K), permite ejecutar un modelo de 24B en hardware de consumo, algo imposible con los pesos en precision completa (~47 GB en FP16). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y su fecha de creacion declarada es el 15 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura; el recuento de parametros corresponde a un transformer de 23,57 mil millones de parametros) |
| Parametros totales | 23.572.403.200 (23,57 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. Se sabe que se trata de un modelo de 23.572.403.200 parametros con un tokenizador compatible con la libreria transformers y que el repositorio GGUF fue generado a partir de los pesos de ReadyArt/Broken-Tutu-24B-Transgression-v2.0. Las etiquetas del repositorio (roleplay, storytelling, character, narrative, unaligned, conversational) apuntan a un ajuste fino orientado a dialogo de personajes y narrativa interactiva, presumiblemente construido sobre un modelo preentrenado de ~24B, aunque el modelo de partida no se especifica.

La innovacion tecnica destacable de este repositorio concreto es el uso de cuantizacion i1 con matriz de importancia (imatrix). Segun la propia model card, este tipo de cuantizacion ponderada suele superar en calidad a las cuantizaciones estaticas de tamano similar (por ejemplo, "i1-IQ3_S beats Q3_K*"). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento; la etiqueta "unaligned" sugiere precisamente lo contrario.

## Capacidades

- Generacion de texto narrativo y creativo: continuacion de relatos, descripcion de escenas y dialogos con coherencia de personaje.
- Roleplay conversacional multi-turno: mantiene personajes con rasgos, voz y motivaciones consistentes a lo largo de la conversacion.
- Escritura de ficcion para adultos: el modelo esta etiquetado explicitamente como nsfw, explicit, ERP y Erotic, por lo que no aplica filtrado de contenido sexual.
- Construccion de personajes (character cards): adecuado para sistemas de tarjetas de personaje y prompts de sistema extensos.
- Generacion de narrativa interactiva tipo "aventura conversacional" o ficcion colaborativa.
- Conversacion general en ingles: la etiqueta conversational indica uso de chat, aunque el foco declarado es creativo y no de asistencia tecnica.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona; las etiquetas no incluyen agent, tools ni reasoning).
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Roleplay de personajes persistentes: el modelo puede gestionar conversaciones largas con un personaje definido mediante una tarjeta de personaje, manteniendo tono, registro y rasgos psicologicos a lo largo de multiples turnos. Es el caso de uso principal declarado por las etiquetas del repositorio.
- Escritura asistida de ficcion: util como copiloto para autores que necesitan generar borradores de escenas, dialogos o tramas alternativas sin restricciones tematicas.
- Ficcion interactiva y novelas visuales: integrable en un motor de aventuras conversacionales donde el modelo genera las respuestas de los NPC y las descripciones del entorno en tiempo real.
- Creacion de contenido para comunidades de rol (foros, Discord, plataformas de rol por texto): el modelo puede actuar como master de juego o como companero de escena.
- Generacion de contenido narrativo para adultos: produccion de relato erotico bajo demanda, un nicho donde los modelos alineados rechazan la tarea por politicas de contenido.
- Prototipado de sistemas de dialogo sin moderacion: investigacion sobre comportamiento de modelos "unaligned", estudio de sesgos y evaluacion de deriva de personaje en conversaciones largas.
- Dataset augmentation para ajuste fino creativo: generacion de dialogos y narraciones sinteticas para alimentar otros entrenamientos dentro del mismo dominio.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones desde 5,4 GB, permite experimentar con un 24B en un portatil o en una GPU de gama media sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una grafica comparativa generica de perplejidad entre tipos de cuantizacion (enlazada en la seccion de enlaces) y afirmaciones cualitativas sobre que las cuantizaciones i1 rinden mejor que las estaticas de tamano comparable, pero sin cifras concretas para este modelo.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamano de cada archivo GGUF mas un margen para cache KV y overhead del runtime; no estan publicadas por el autor.

| Cuantizacion | Tamano del archivo | VRAM estimada en inferencia |
|---|---|---|
| i1-IQ1_S | 5,4 GB | ~6-7 GB |
| i1-IQ2_M | 8,2 GB | ~9-11 GB |
| i1-IQ3_S | 10,5 GB | ~11-13 GB |
| i1-Q4_K_M | 14,4 GB | ~15-18 GB |
| i1-Q5_K_M | 16,9 GB | ~18-21 GB |
| i1-Q6_K | 19,4 GB | ~21-24 GB |
| FP16 (referencia, no incluido en el repo) | ~47,1 GB | ~50 GB o mas |

- GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB): viables las cuantizaciones IQ2 e IQ3 con contexto moderado; Q4 requiere offload parcial a CPU.
- GPU de 16 GB: i1-Q4_K_M es la opcion recomendada por el propio autor ("fast, recommended") y cabe con holgura.
- GPU de 24 GB (RTX 3090, RTX 4090): permiten i1-Q5_K_M e i1-Q6_K con contexto amplio.
- GPU de datacenter (A100 40/80 GB, H100): sobredimensionadas para las cuantizaciones listadas; utiles para servir muchas peticiones concurrentes o para cargar el modelo base en FP16/BF16.
- Cabe en GPU de consumo: si, en el rango de 8 a 24 GB segun cuantizacion. Las variantes IQ1 e IQ2 estan pensadas explicitamente para hardware con poca VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (llama.cpp como backend) y llama-cpp-python. El soporte de GGUF en vLLM es experimental y limitado; para produccion con alto throughput conviene servir el modelo base en safetensors con vLLM o TGI.
- Latencia y throughput: no disponibles. Dependen fuertemente de la cuantizacion, del grado de offload a CPU y del ancho de banda de memoria de la GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de fichas tecnicas completas de modelos de roleplay comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a variantes del mismo modelo.

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Naofan/Broken-Tutu-24B-Transgression-v2.0-i1-GGUF (este) | 23,57 B | GGUF | i1 (imatrix), 23 variantes | apache-2.0 | Repositorio con 0 descargas; la model card atribuye la cuantizacion a mradermacher |
| mradermacher/Broken-Tutu-24B-Transgression-v2.0-i1-GGUF | 23,57 B | GGUF | i1 (imatrix) | no disponible | Repositorio referenciado en los enlaces del README |
| mradermacher/Broken-Tutu-24B-Transgression-v2.0-GGUF | 23,57 B | GGUF | estaticas | no disponible | Alternativa con cuantizaciones no ponderadas |
| ReadyArt/Broken-Tutu-24B-Transgression-v2.0 | 23,57 B | safetensors | sin cuantizar | no disponible | Modelo base del que derivan todas las variantes anteriores |

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como nsfw, explicit y not-for-all-audiences. No debe desplegarse en productos accesibles a menores ni en entornos con requisitos de moderacion sin una capa de filtrado adicional.
- Modelo "unaligned": al no haber pasado por las fases habituales de alineamiento y rechazo, es previsible que responda a peticiones daninas, genere contenido ofensivo o ignore instrucciones de seguridad. Requiere supervision humana en cualquier uso real.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de alucinacion; en un modelo orientado a ficcion, la invencion de hechos es esperable y no debe usarse como fuente de informacion factual.
- Idioma: solo ingles. No hay evidencia de capacidades solidas en castellano.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar conversaciones largas o tareas de resumen de documentos extensos con garantias.
- Calidad de las cuantizaciones extremas: las variantes IQ1 e IQ2 (5,4-8,2 GB) degradan notablemente la coherencia; la propia model card las describe como "for the desperate" y "mostly desperate". No son recomendables para produccion.
- Licencia: el repositorio declara apache-2.0, pero la licencia del modelo base (ReadyArt/Broken-Tutu-24B-Transgression-v2.0) no se especifica en la informacion disponible. Antes de un uso comercial conviene verificar los terminos del modelo original, ya que las cuantizaciones heredan las obligaciones del modelo del que derivan.
- Trazabilidad: la model card indica "quantized_by: mradermacher" mientras que el repositorio esta alojado bajo la cuenta Naofan. Conviene confirmar la procedencia de los pesos antes de integrarlos en un pipeline.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni validacion de la comunidad. No hay garantia de que las cuantizaciones funcionen correctamente.
- Sin soporte de herramientas ni agentes: no hay indicios de tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado para automatizaciones que requieran llamadas a APIs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Naofan/Broken-Tutu-24B-Transgression-v2.0-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Broken-Tutu-24B-Transgression-v2.0
- Cuantizaciones i1 (mradermacher): https://huggingface.co/mradermacher/Broken-Tutu-24B-Transgression-v2.0-i1-GGUF
- Cuantizaciones estaticas (mradermacher): https://huggingface.co/mradermacher/Broken-Tutu-24B-Transgression-v2.0-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Broken-Tutu-24B-Transgression-v2.0-i1-GGUF
- Guia de uso de archivos GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
