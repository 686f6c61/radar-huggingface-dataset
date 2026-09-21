# argos1111/sarashina2.2-vision-3b-mmproj-jev-f16

## Resumen

Este repositorio contiene el modulo `mmproj` (encoder de vision mas projector) en formato GGUF F16 del modelo multimodal Sarashina2.2 Vision 3B, convertido por el usuario argos1111 a partir del checkpoint oficial de SB Intuitions. No es un modelo de lenguaje completo ni un modelo entrenado desde cero: es un artefacto de conversion sin entrenamiento adicional ("追加学習はしていません") que incluye la LayerNorm final, pensado para el runtime Jev Local, un fork de llama.cpp mantenido por el mismo autor. El modelo base subyacente es `sbintuitions/sarashina2.2-vision-3b`, un VLM de aproximadamente 3.000 millones de parametros orientado a japones e ingles.

Su relevancia es acotada pero clara: permitir ejecutar un VLM japones de 3B en local mediante llama.cpp con soporte de vision, algo que hoy no cubre el llama.cpp sin modificar. El repositorio declara explicitamente que **no funciona con llama.cpp sin parchear**: requiere el runtime Jev Local y un GGUF de lenguaje compatible (Q4_K_M o Q8_0) distribuido por terceros. Los pesos del modulo `mmproj` suman 445.866.096 parametros en F16 (unos 893 MB por archivo), mientras que el modelo de lenguaje completo es de 3B; el repositorio de 1,8 GB contiene ese modulo mas un archivo de conversion.

El proyecto es de nicho: cero descargas y cero likes en el momento de la consulta, licencia MIT y publicacion en septiembre de 2026. Es util como pieza de infraestructura para quien quiera montar inferencia multimodal en japones sobre hardware modesto, no como modelo listo para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El repositorio contiene el modulo mmproj (encoder de vision + projector) del VLM Sarashina2.2 Vision 3B; no se especifica el tipo de transformer ni el encoder visual concreto |
| Parametros totales | 445.866.096 en el modulo mmproj (dato de safetensors, F16). El modelo de lenguaje base es de 3B; el desglose por componente no esta publicado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 para el mmproj. El GGUF de lenguaje asociado se distribuye en Q4_K_M y Q8_0 por mradermacher |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | MIT (repositorio). La licencia del checkpoint oficial de SB Intuitions debe verificarse por separado antes de uso comercial |
| Formato de pesos | GGUF (mmproj F16, ~893 MB) mas un JSON con la informacion de conversion necesaria en el arranque |
| Tamano del repositorio | 1,8 GB |
| Modelo base | sbintuitions/sarashina2.2-vision-3b |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un entrenamiento. El autor parte del checkpoint oficial de SB Intuitions (`sbintuitions/sarashina2.2-vision-3b`, revision `46d9cc3929a54f7d2b91ce5668d7a9c5833991ed`) y extrae el encoder de vision junto con el projector, incluyendo la LayerNorm final, en un GGUF no oficial en precision F16. No hay fine-tuning, RLHF, DPO ni ninguna fase de ajuste posterior: la model card lo declara de forma explicita. El repositorio incluye ademas un archivo JSON con la informacion de conversion que el runtime necesita leer al arrancar.

La innovacion tecnica relevante no esta en el modelo sino en el runtime. Ejecutar este `mmproj` requiere Jev Local, un fork de llama.cpp con preprocesado de imagen compatible con el pipeline oficial de Sarashina2.2 Vision, con backends CUDA, HIP y CPU. El autor advierte que llama.cpp sin modificar no puede usarlo, y que tampoco sirve el archivo `mmproj-jev-f16.gguf` alojado en el mismo repositorio, que es una copia antigua conservada solo como respaldo. Para el modelo de lenguaje hacen falta ademas los GGUF de Sarashina publicados por mradermacher. No se publican datos sobre el dataset de entrenamiento original, numero de tokens, composicion ni estrategia de alineacion del modelo base.

## Capacidades

- Comprension de imagenes: el modulo actua como encoder visual y projector, habilitando entrada multimodal (imagen + texto) cuando se combina con el GGUF de lenguaje de Sarashina2.2 Vision 3B.
- Generacion de texto en japones e ingles sobre contexto visual: descripcion de imagenes, respuesta a preguntas sobre contenido grafico y tareas derivadas.
- Preprocesado de imagen compatible con el pipeline oficial del checkpoint original, lo que preserva el comportamiento del VLM de referencia.
- Ejecucion local en CPU, CUDA o HIP a traves del runtime Jev Local.
- Uso como componente de investigacion: permite auditar y reutilizar el encoder visual del modelo en F16 sin depender del checkpoint completo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay indicios de modo thinking ni de capacidades agenticas en un modelo de 3B de esta familia.
- Vision de video, audio u otras modalidades: no disponible.
- Capacidades multilingues mas alla de ja/en: no disponible.

## Casos de uso

- Inferencia multimodal local en japones: un desarrollador puede montar un asistente que reciba imagenes y preguntas en japones y las responda en local, combinando este `mmproj` con el GGUF Q4_K_M de Sarashina y Jev Local en una GPU de gama media o incluso en CPU.
- OCR y extraccion de informacion de documentos japoneses: el modelo puede procesar capturas de facturas, formularios o tickets y devolver texto estructurado; el interes esta en que el modelo base esta entrenado prioritariamente en japones, un idioma peor cubierto por los VLM occidentales de 3B.
- Descripcion automatica de imagenes para catalogos: generacion de pies de foto y descripciones de producto en japones e ingles para plataformas de comercio electronico, ejecutandose en un servidor sin GPU de gama alta.
- Accesibilidad: generacion de descripciones alternativas de imagenes para lectores de pantalla en entornos donde no se quiere enviar contenido grafico a APIs en la nube, algo relevante con material medico, legal o confidencial.
- Investigacion sobre cuantizacion de modulos de vision: el repositorio sirve como caso de estudio de conversion de un encoder visual a GGUF F16 y de su integracion en un runtime llama.cpp parcheado, util para quien trabaje en portar otros VLM.
- Clasificacion y etiquetado visual con requisitos de privacidad: moderacion de imagenes, etiquetado de contenido o filtrado en servidores propios en japon, sin depender de proveedores externos.
- Prototipado de interfaces de voz o robotica con entrada visual: al ser un modelo de 3B y correr en el mismo proceso que el runtime de llama.cpp, encaja como componente perceptivo en demos de bajo coste donde la latencia y la precision no son criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (ni MMLU, ni HumanEval, ni tareas de vision como VQAv2, TextVQA o MMMU) y la busqueda web asociada no devolvio ningun resultado tecnico relevante: los unicos enlaces recuperados correspondian a paginas corporativas de Microsoft, sin relacion con el modelo. No se deben extraer conclusiones de rendimiento a partir del tamano del modulo ni del nombre del checkpoint.

## Requisitos de hardware

- VRAM estimada para el mmproj: aproximadamente 0,9-1,0 GB en F16 (el archivo pesa 893 MB).
- VRAM estimada para el modelo de lenguaje (estimacion a partir de 3B de parametros, no confirmada por el autor): en torno a 2,5-3,5 GB con Q4_K_M y 4,5-5,5 GB con Q8_0, sumando overhead de contexto y de activaciones. El total combinado se situa aproximadamente entre 4 GB y 7 GB segun cuantizacion.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 o RTX 4090. En el extremo profesional, A100 o H100 son sobredimensionadas para un modelo de este tamano. El runtime declara backend CUDA y HIP, por lo que tambien hay soporte de GPU AMD.
- Ejecucion en CPU: soportada explicitamente (`--backend cpu`), de forma que el modelo puede correr sin GPU, con latencias mas altas no cuantificadas en la informacion disponible.
- Opciones de despliegue: exclusivamente Jev Local (fork de llama.cpp del autor), mediante pre-release ya compilada o compilacion propia. vLLM, TGI, Ollama, transformers y llama.cpp sin parchear no estan soportados segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos verificables en la informacion proporcionada. La busqueda web no aporto referencias tecnicas y la model card no ofrece comparaciones. La unica comparacion posible es con los propios artefactos del ecosistema de este modelo:

| Modelo / artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| argos1111/sarashina2.2-vision-3b-mmproj-jev-f16 | Modulo mmproj GGUF F16 | 445.866.096 (solo el mmproj) | No disponible | MIT | HuggingFace, 0 descargas; requiere Jev Local |
| sbintuitions/sarashina2.2-vision-3b | Checkpoint oficial completo (VLM) | 3B (modelo de lenguaje) | No disponible | No disponible | Checkpoint oficial en HuggingFace (revision fijada en la model card) |
| mradermacher/sarashina2.2-vision-3b-GGUF | Cuantizaciones del modelo de lenguaje | 3B | No disponible | No disponible | HuggingFace, Q4_K_M y Q8_0 |

Comparacion con otros VLM de ~3B del mercado (Qwen2.5-VL-3B, Gemma 3 4B y similares): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el GGUF de lenguaje de Sarashina2.2 Vision 3B y sin el runtime Jev Local, el artefacto es inutilizable.
- Incompatibilidad con llama.cpp estandar, Ollama, vLLM y TGI. Integrarlo en produccion implica adoptar un fork mantenido por una sola persona, con el riesgo de mantenimiento que eso conlleva.
- Conversion no oficial: aunque el autor indica que parte del checkpoint oficial y respeta el preprocesado de imagen original, no esta validada por SB Intuitions. Cualquier discrepancia de precision con el modelo oficial no esta documentada.
- Existe un archivo de nombre muy parecido (`mmproj-jev-f16.gguf`) en el mismo repositorio que el autor califica de copia antigua; usarlo por error puede degradar los resultados.
- Ausencia total de evaluacion: sin benchmarks, sin comparaciones y con cero descargas, no hay evidencia publica de calidad, ni de fidelidad respecto al checkpoint original.
- Riesgo de alucinacion: inherente a los modelos generativos de 3B, y especialmente relevante en tareas de OCR o descripcion de documentos, donde el modelo puede inventar texto no presente en la imagen. No hay evaluaciones que lo cuantifiquen.
- Cobertura idiomatica limitada a japones e ingles; el rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Longitud de contexto desconocida, lo que impide planificar conversaciones multi-turno o documentos largos con garantias.
- Licencia MIT en este repositorio, pero la licencia del checkpoint base y de los GGUF de terceros debe comprobarse de forma independiente antes de un uso comercial.
- Fecha de creacion y actualizacion (septiembre de 2026) y ausencia de actividad sugieren un proyecto sin mantenimiento comunitario contrastado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/argos1111/sarashina2.2-vision-3b-mmproj-jev-f16
- Checkpoint oficial del modelo base: https://huggingface.co/sbintuitions/sarashina2.2-vision-3b/tree/46d9cc3929a54f7d2b91ce5668d7a9c5833991ed
- Runtime Jev Local (GitHub): https://github.com/Argos1111/jev_local
- Pre-release del runtime con soporte Sarashina: https://github.com/Argos1111/jev_local/releases/tag/sarashina-llama-b11042-pre1
- Documentacion de compilacion y arranque (SARASHINA.md): https://github.com/Argos1111/jev_local/blob/5edbee00dcdd01690cbbd9cd1dd4d8f300862cd0/docs/SARASHINA.md
- GGUF de lenguaje de Sarashina2.2 Vision 3B (mradermacher): https://huggingface.co/mradermacher/sarashina2.2-vision-3b-GGUF/tree/18b014396fa28c005d0551146558240189fc9ce8
- Registro de cambios y atribucion (NOTICE.md): archivo incluido en el repositorio de HuggingFace
- Sumas de verificacion (SHA256SUMS): archivo incluido en el repositorio de HuggingFace
- Nota: la busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft y se han descartado.
