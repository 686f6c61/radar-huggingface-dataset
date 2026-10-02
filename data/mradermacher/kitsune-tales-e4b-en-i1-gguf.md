# mradermacher/Kitsune-Tales-E4B-EN-i1-GGUF

## Resumen

Kitsune-Tales-E4B-EN-i1-GGUF es una cuantizacion en formato GGUF del modelo Kitsune-Tales-E4B-EN, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion a cuantizaciones de tipo imatrix (i1) del modelo base whoashish115/Kitsune-Tales-E4B-EN, un ajuste fino (LoRA) orientado a escritura creativa en ingles con tematica de fantasia, novela ligera y estetica anime. El modelo resultado no ha sido evaluado de forma independiente y cuenta con 0 descargas y 1 like en el momento de redactar esta ficha.

El modelo declara 7.463.013.674 parametros en sus pesos safetensors, y el repositorio ocupa 111,0 GB debido a la gran cantidad de variantes de cuantizacion incluidas (desde i1-IQ1_S de 3,4 GB hasta i1-Q6_K de 6,3 GB, mas el fichero imatrix). La model card del cuantizador indica explicitamente que se trata de un modelo de vision, con ficheros mmproj ubicados en el repositorio estatico hermano, aunque la model card original del modelo base no aporta detalles sobre la arquitectura visual ni sobre la longitud de contexto.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de escritura creativa tematica de aproximadamente 7,5 mil millones de parametros en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, con licencia Apache 2.0 y pesos unicamente en ingles. Al estar basado en una nomenclatura "E4B" y etiquetado como "gemma4", apunta a la familia Gemma como arquitectura subyacente, si bien este extremo no se confirma de forma explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "gemma4" y nomenclatura "E4B") |
| Parametros totales | 7.463.013.674 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de las etiquetas asociadas: "gemma4" y la nomenclatura "E4B" en el nombre. Estas etiquetas sugieren que se trata de un modelo de la familia Gemma con un esquema de parametros efectivos reducidos, pero no se proporcionan datos sobre numero de capas, tipo de atencion, ni si emplea mecanismos como atencion lineal o mezcla de expertos. El cuantizador marca el modelo como "vision model", lo que implica que el modelo base incorpora capacidad de entrada de imagenes, con ficheros mmproj separados en el repositorio de cuantizaciones estaticas.

En cuanto al entrenamiento, el modelo base es un ajuste LoRA sobre un modelo no especificado, realizado por el autor whoashish115, y entrenado sobre el dataset whoashish115/Kitsune-Tales-EN-Fantasy-SFT, descrito como datos sinteticos ("synthetic-data") de tematica fantasia para escritura creativa. No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Las cuantizaciones i1 aqui presentadas emplean un fichero imatrix para ponderar la cuantizacion, una practica de mradermacher que suele mejorar la calidad respecto a las cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto creativo en ingles orientada a fantasia, novela ligera, narrativa serializada y ficcion con estetica anime, segun los tags "creative-writing", "light-novel", "fantasy" y "anime".
- Ajuste fino mediante LoRA sobre un modelo base, lo que concentra la especializacion en el dominio narrativo en lugar de en tareas generalistas.
- Modelo multimodal de entrada (imagenes): la model card del cuantizador lo declara explicitamente como modelo de vision, con los ficheros mmproj en el repositorio estatico.
- Formato conversacional (tag "conversational"), lo que implica soporte de plantillas de chat multi-turno.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling, function calling, razonamiento multi-paso, matematicas, codigo o capacidades de audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idioma declarado.

## Casos de uso

- Generacion de novelas ligeras por capitulos: el modelo esta ajustado especificamente sobre datos de fantasia y novela ligera, por lo que es adecuado para producir borradores de capitulos con continuidad narrativa y estilo consistente dentro de un pipeline de escritura asistida.
- Creacion de personajes y dialogos para juegos de rol de mesa: permite generar descripciones de personajes, trasfondo y dialogos ramificados coherentes con la estetica anime, integrable en herramientas de game mastering asistido por IA.
- Contenido narrativo para videojuegos indie: generacion de textos de lore, descripciones de objetos, misiones secundarias y dialogos de NPC, con despliegue local gracias a las cuantizaciones de 5-6 GB que caben en GPU de consumo.
- Prototipado de asistentes de escritura offline: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama sin conexion, lo que resulta adecuado para talleres de escritura o entornos con requisitos de privacidad.
- Generacion de prompts e imagenes descriptivas para pipelines de ilustracion: la combinacion de especializacion en estetica anime y capacidad de vision permite redactar descripciones detalladas o analizar referencias visuales si se cargan los ficheros mmproj.
- Experimentacion academica con ajuste LoRA y cuantizacion: sirve como caso de estudio reproducible para comparar cuantizaciones imatrix frente a estaticas en un modelo pequeno y especializado, dado que el repositorio ofrece mas de veinte variantes del mismo modelo.
- Chatbot tematico para comunidades de fantasia: con la variante i1-Q4_K_M (5,4 GB) puede desplegarse en un servidor modesto para gestionar conversaciones multi-turno con tematica consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de calidad narrativa, y las busquedas web realizadas no aportan resultados de evaluacion para este modelo ni para su base.

## Requisitos de hardware

- VRAM estimada para inferencia segun la cuantizacion elegida (tamano del fichero mas cache KV y overhead del runtime):
  - i1-IQ1_S / i1-IQ1_M: 3,4-3,5 GB; viables en GPU de 4-6 GB.
  - i1-IQ2_M / i1-Q2_K: 3,9-4,5 GB.
  - i1-IQ3_S / i1-Q3_K_M: 4,7-4,9 GB.
  - i1-Q4_K_S / i1-Q4_K_M (recomendadas por el autor): 5,3-5,4 GB.
  - i1-Q5_K_M / i1-Q6_K: 5,8-6,3 GB.
- Cabe en GPU de consumo: si, con RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en tarjetas de 6-8 GB usando cuantizaciones de 2-4 bits, siempre que la longitud de contexto no sea elevada (dato no disponible).
- GPU profesionales (A100, H100) no son necesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes o para trabajar con precision completa en FP16/BF16 a partir del modelo base.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (llama.cpp), servidores compatibles con GGUF. El tag "endpoints_compatible" sugiere uso en endpoints gestionados. TGI y vLLM no son adecuados para GGUF en su configuracion habitual, aunque podrian servir el modelo base en safetensors.
- Para vision es necesario descargar los ficheros mmproj alojados en el repositorio estatico https://huggingface.co/mradermacher/Kitsune-Tales-E4B-EN-GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitsune-Tales-E4B-EN-i1-GGUF (este) | 7,46 B | no disponible | en | apache-2.0 | GGUF (i1, imatrix) | Cuantizacion ponderada con imatrix, orientada a escritura creativa de fantasia |
| Kitsune-Tales-E4B-EN-GGUF | 7,46 B | no disponible | en | apache-2.0 | GGUF (estatico) | Mismas variantes sin imatrix; incluye ficheros mmproj |
| Kitsune-Tales-E4B-EN (base) | 7,46 B | no disponible | en | apache-2.0 | safetensors / transformers | Modelo original ajustado con LoRA sobre Kitsune-Tales-EN-Fantasy-SFT |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo especializado: al ser un ajuste LoRA sobre datos sinteticos de fantasia, es probable que su rendimiento en tareas generales (razonamiento, matematicas, codigo) sea inferior al de modelos generalistas del mismo tamano. No hay datos que lo confirmen o desmientan.
- Idiomas: solo se declara ingles. El uso en castellano no esta soportado oficialmente y previsiblemente degradara la calidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al entrenarse sobre datos sinteticos generados, puede reproducir sesgos y estereotipos propios del modelo generador del dataset.
- Riesgo de alucinacion: no cuantificado. En generacion creativa la alucinacion es intencional hasta cierto punto, pero en usos informativos no debe asumirse fidelidad factual.
- Longitud de contexto: no disponible, lo que impide planificar tareas que requieran ventanas largas (por ejemplo, continuidad de novelas extensas).
- Licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar las condiciones del modelo base y del dataset de ajuste, ya que la informacion disponible no detalla restricciones adicionales.
- Madurez del modelo: 0 descargas y 1 like en el momento de la consulta implica ausencia de validacion comunitaria. No debe considerarse un modelo probado en produccion.
- Cuantizaciones de muy baja precision (IQ1_S, IQ1_M, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Uso de vision: requiere cargar ficheros mmproj del repositorio estatico; sin ellos, la entrada de imagenes no funcionara.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/Kitsune-Tales-E4B-EN-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/Kitsune-Tales-E4B-EN-GGUF
- Modelo base: https://huggingface.co/whoashish115/Kitsune-Tales-E4B-EN
- Dataset de ajuste: https://huggingface.co/whoashish115/Kitsune-Tales-EN-Fantasy-SFT
- Pagina de resumen y lista de descargas del cuantizador: https://hf.tst.eu/model#Kitsune-Tales-E4B-EN-i1-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Coleccion de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Perfil de mradermacher en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- README de referencia de TheBloke sobre uso de GGUF (concatenacion de ficheros multiparte): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
