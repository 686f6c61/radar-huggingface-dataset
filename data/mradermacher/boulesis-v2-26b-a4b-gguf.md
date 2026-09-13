# mradermacher/Boulesis-v2-26B-A4B-GGUF

## Resumen

Boulesis-v2-26B-A4B-GGUF es la version cuantizada en formato GGUF del modelo SubMaroon/Boulesis-v2-26B-A4B, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas y ponderadas (imatrix) de modelos abiertos. El modelo base es un merge (fusion de pesos) de arquitectura MoE etiquetado como gemma4 y orientado a roleplay, conversacion sin censura y razonamiento con modo thinking. El repositorio no incluye model card propia mas alla de la plantilla estandar de mradermacher: la informacion sobre entrenamiento, composicion de datos y capacidades del modelo original no esta disponible en esta ficha.

El interes practico de esta publicacion es que ofrece hasta once variantes de cuantizacion GGUF (desde Q2_K de 10,9 GB hasta Q8_0 de 27,7 GB) que permiten ejecutar un modelo MoE de ~26.000 millones de parametros en hardware de consumo, siempre que el numero de parametros activos por token sea bajo (la nomenclatura A4B sugiere unos 4.000 millones activos, aunque este dato no aparece confirmado de forma explicita en la informacion proporcionada). Esta pensado para su uso en frontends de rol conversacional (SillyTavern) y en despliegues locales con llama.cpp u Ollama.

El modelo esta etiquetado como "uncensored" y "heretic", terminos que en la comunidad hacen referencia a ajustes destinados a reducir los rechazos del modelo base; esto implica que las salvaguardas de contenido son previsiblemente menores y que su uso en produccion exige controles adicionales. La licencia declarada es la Gemma, heredada del modelo base, con las restricciones de uso que esta conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base Gemma 4; merge de pesos. Detalles de capas y configuracion no disponibles |
| Parametros totales | 25.971.339.550 (~26B), segun safetensors del modelo base |
| Parametros activos | ~4B segun la nomenclatura A4B del nombre; no confirmado explicitamente en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas). Tambien existe una familia i1 (ponderada/imatrix) en mradermacher/Boulesis-v2-26B-A4B-i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF en este repositorio; el modelo base emplea transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de arquitectura MoE (mezcla de expertos) construido sobre una base Gemma 4, segun las etiquetas `moe` y `gemma4` del repositorio, y que el modelo base es un merge: los pesos se obtuvieron combinando otros modelos, no mediante un entrenamiento desde cero documentado en esta ficha. El numero total de parametros es de 25.971.339.550 y la nomenclatura A4B del nombre apunta a unos 4.000 millones de parametros activos por token, patron habitual en los MoE de este tamano. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

El etiquetado `heretic` y `uncensored` indica que el merge incorpora algun tipo de ajuste orientado a eliminar o reducir los mecanismos de rechazo del modelo base, aunque se desconoce el metodo concreto empleado. Las etiquetas `thinking` y `reasoning` sugieren la presencia de un modo de razonamiento explicito (cadena de pensamiento) en la plantilla de chat, sin que se detallen sus caracteristicas tecnicas. No hay informacion sobre innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles con orientacion a roleplay y personajes, segun las etiquetas `roleplay` y `sillytavern`.
- Razonamiento con modo thinking: el modelo declara soporte de cadenas de razonamiento (`thinking`, `reasoning`), aunque no se especifica el formato exacto de activacion.
- Conversacion sin censura: el ajuste tipo `heretic` y `uncensored` reduce los rechazos ante peticiones que los modelos alineados convencionalmente declinarian.
- Integracion con transformers y con el ecosistema GGUF (llama.cpp y derivados).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma `en`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible; el repositorio indica `skip_mmproj: 1`, es decir, no se incluye proyector multimodale.
- Uso agentico o multi-step reasoning mas alla del modo thinking declarado: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo esta etiquetado especificamente para `roleplay` y `sillytavern`, por lo que encaja en frontends de chat con personajes, fichas de personaje y prompts de sistema largos, ejecutado en local mediante llama.cpp.
- Generacion creativa de ficcion: su orientacion sin censura permite redactar narrativa adulta, terror o tematicas que los modelos alineados suelen rechazar, sin necesidad de sortear filtros externos.
- Asistente personal ofline: al poder ejecutarse con cuantizaciones Q4_K_M de 17,3 GB en una GPU de 24 GB, es viable como asistente local sin enviar datos a terceros.
- Prototipado de agentes conversacionales: sirve para probar plantillas de dialogo, gestion de memoria y flujos multi-turno antes de decidir el modelo definitivo, siempre que el caso no requiera tool calling confirmado.
- Investigacion sobre alineamiento y censura: al ser un modelo modificado con tecnicas tipo `heretic`, es util como objeto de estudio comparativo frente a su base Gemma 4 sin modificar.
- Despliegue en hardware modesto: las variantes Q2_K (10,9 GB) y Q3_K_S (12,6 GB) permiten ejecutar el modelo en GPU de 12-16 GB o incluso en CPU con RAM suficiente, a costa de perdida de calidad.
- Evaluacion de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir de forma controlada el impacto de la cuantizacion en la calidad de generacion para tareas de rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun la cuantizacion del repositorio: Q2_K 10,9 GB; Q3_K_S 12,6 GB; Q3_K_M 13,7 GB; Q3_K_L 14,2 GB; IQ4_XS 14,6 GB; Q4_K_S 16,0 GB; Q4_K_M 17,3 GB; Q5_K_S 18,6 GB; Q5_K_M 19,7 GB; Q6_K 23,3 GB; Q8_0 27,7 GB.
- GPU de consumo compatibles: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 4080 / 4070 Ti (16 GB) para Q4_K_S e IQ4_XS; RTX 3060 12 GB para Q2_K y Q3_K_S.
- GPU profesionales: A100, H100 o L40S para las variantes Q8_0 y Q6_K sin necesidad de offload; no se dispone de cifras de rendimiento especificas.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q6_K con 24 GB de VRAM, y hasta Q4_K_S con 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el modelo base tambien es cargable con transformers.
- Nota sobre el MoE: al activarse solo una fraccion de los expertos por token, la velocidad de generacion es previsiblemente superior a la de un modelo denso de 26B, pero no se han publicado cifras de latencia ni de throughput.
- Repositorio: 187,7 GB en total, correspondientes a la suma de todas las variantes de cuantizacion.

## Comparativa con modelos similares

No disponible: la informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, y no se encontraron resultados de busqueda web pertinentes (los resultados devueltos eran contenido no relacionado con el modelo).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-v2-26B-A4B (GGUF) | ~26B totales, ~4B activos estimados | no disponible | gemma | GGUF | Repositorio analizado |
| SubMaroon/Boulesis-v2-26B-A4B | ~26B totales | no disponible | gemma | safetensors | Modelo base del que se parte |
| Boulesis-v2-26B-A4B-i1-GGUF | ~26B totales | no disponible | gemma | GGUF (imatrix) | Misma base, cuantizacion ponderada |

## Limitaciones y advertencias

- Modelo marcado como `uncensored` y `heretic`: cabe esperar que genere contenido que otros modelos rechazarian. No debe desplegarse de cara al publico sin filtros de entrada y salida propios.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la fiabilidad factual del modelo. Al ser un merge de pesos sin documentacion de entrenamiento, el comportamiento fuera de las tareas de rol es impredecible.
- Idioma: solo se declara soporte de ingles (`en`). El rendimiento en castellano no esta verificado y probablemente sea degradado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone obligaciones de atribucion y una politica de uso aceptable. Conviene revisarla antes de cualquier despliegue en produccion.
- Ausencia de tool calling documentado: no debe asumirse soporte de function calling ni de flujos agenticos con llamadas a herramientas.
- Numero de parametros activos no confirmado: el dato de ~4B activos se infiere del nombre del modelo, no de una especificacion oficial.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) y el conteo de descargas y likes (0) proceden de la API de HuggingFace tal cual; no se ha verificado su coherencia.
- Sin benchmarks: no existe ninguna medicion publicada de MMLU, HumanEval, GSM8K ni de tareas de rol que permita validar su calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2-26B-A4B
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-i1-GGUF
- Listado de cuantizaciones del autor: https://hf.tst.eu/model#Boulesis-v2-26B-A4B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
