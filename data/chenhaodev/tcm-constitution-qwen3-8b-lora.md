# chenhaodev/tcm-constitution-qwen3-8b-lora

## Resumen

chenhaodev/tcm-constitution-qwen3-8b-lora es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3-8B para responder preguntas sobre medicina tradicional china (MTC), con especial enfasis en la clasificacion de los nueve tipos de constitucion corporal y en los fundamentos teoricos y diagnosticos de la disciplina. El autor lo ha destilado a partir de tres fuentes: los manuales 《中医基础理论》 (teoria basica) y 《中医诊断学》 (diagnostico), y la norma china GB/T 46939—2025 sobre clasificacion y determinacion de constituciones de MTC. No es un modelo completo, sino un conjunto de pesos de adaptador que debe cargarse sobre el modelo base en 4 bits.

El modelo resuelve un problema de nicho: ofrecer respuestas ancladas a material normativo y docente en un dominio donde los modelos generalistas tienden a mezclar conceptos de medicina occidental con terminologia de MTC. Para ello el autor genero 15.339 pares de pregunta-respuesta con un modelo profesor local, cubriendo cinco formatos (preguntas basicas, examenes de alta dificultad, escenarios clinicos, sintesis multietapa y resumenes de capitulo), e incorporo plantillas de calculo de puntuaciones de conversion para la determinacion de constitucion. Ademas, una parte del conjunto de entrenamiento se formateo explicitamente como "dado este material, responde segun el material" para que el modelo funcione bien en pipelines de generacion aumentada por recuperacion (RAG).

Es relevante ahora porque los adaptadores LoRA de bajo rango permiten especializar un modelo denso de 8.000 millones de parametros con coste de entrenamiento muy reducido (aqui, LoRA r=16 sobre base cuantizada en 4 bits, 2 epocas), y porque el autor publica junto al adaptador un indice FAISS de 354 fragmentos embebidos con BGE-small-zh-v1.5. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, carece de benchmarks publicados y solo soporta chino, lo que lo situa como un experimento de dominio mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen3-8B |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros (repo de 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificado en la ficha; el ejemplo de uso emplea max_seq_length=1024 y el entrenamiento se hizo con secuencia de 1536 |
| Tipos de cuantizacion | Base cargada en 4 bits durante el entrenamiento y en el ejemplo de inferencia (load_in_4bit=True); no se enumeran cuantizaciones publicadas del adaptador (p. ej. GGUF) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con Unsloth y TRL SFTTrainer sobre Qwen/Qwen3-8B cuantizado en 4 bits, con LoRA de rango 16, alpha 16 y variante rsLoRA. La configuracion de entrenamiento declarada es: longitud de secuencia 1536, batch de 2 con acumulacion de gradiente de 4, learning rate 2e-4 con scheduler lineal y 2 epocas sobre los 15.339 ejemplos. La loss de entrenamiento evoluciono de aproximadamente 0,46 a 0,31. No se indica el numero total de tokens vistos ni si se aplicaron etapas posteriores de RLHF, DPO o similar.

La innovacion tecnica principal esta en la construccion del dataset, no en la arquitectura: los datos son preguntas y respuestas derivadas (no copias literales de las obras de referencia), generadas por un modelo profesor local a partir de los tres PDF, y aumentadas con dos estrategias. La primera es anti-olvido, mediante muestras de sintesis entre capitulos y resumenes generales. La segunda es de soporte a RAG, generando para cada par un contexto de "material dado" y una respuesta condicionada a ese material, de modo que el modelo aprenda a responder a partir de fragmentos recuperados en lugar de depender de memoria parametrica. La ficha tambien documenta plantillas estructuradas de hechos sobre constituciones y de calculo de puntuaciones de conversion.

## Capacidades

- Identificacion y determinacion de los nueve tipos de constitucion de MTC: 平和 (armonico), 气虚 (deficiencia de qi), 阳虚 (deficiencia de yang), 阴虚 (deficiencia de yin), 痰湿 (flema-humedad), 湿热 (humedad-calor), 血瘀 (estasis de sangre), 气郁 (estancamiento de qi) y 特禀 (constitucion especial).
- Calculo de puntuaciones de conversion y aplicacion de los criterios de determinacion de constitucion, con plantillas de respuesta estructuradas.
- Teoria basica de MTC: yin-yang y cinco elementos, teoria de organos y visceras (藏象), sustancias vitales (精气血津液神), meridianos, mecanismos patogenicos y principios de prevencion y cuidado.
- Diagnostico en MTC: los cuatro metodos de examen (四诊), las ocho reglas de diferenciacion sindromica (八纲辨证) y diferenciacion por naturaleza y localizacion de la enfermedad.
- Respuestas ancladas a material: entrenado para contestar "segun los datos proporcionados", lo que encaja con flujos de RAG.
- Generacion de texto conversacional con plantilla de chat estandar (apply_chat_template).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito documentados.

## Casos de uso

- Asistente educativo de MTC: el modelo responde preguntas de estudiantes sobre teoria basica y diagnostico con terminologia coherente con los manuales de referencia, y su entrenamiento con preguntas de examen de alta dificultad lo hace util para generacion de cuestionarios y autoevaluacion.
- Determinacion de constitucion en aplicaciones de bienestar: a partir de un cuestionario estandarizado, el modelo puede explicar las puntuaciones de conversion de cada tipo constitucional y justificar el resultado segun GB/T 46939—2025, sin emitir diagnostico clinico.
- Base de un sistema RAG sobre normativa y manuales: el autor publica un indice FAISS (BGE-small-zh-v1.5, 512 dimensiones, 354 fragmentos de capitulo) y el adaptador fue entrenado con muestras condicionadas al contexto recuperado, por lo que se puede montar un pipeline de recuperacion y respuesta sin reentrenamiento adicional.
- Soporte documental para profesionales de MTC: consulta rapida de definiciones, criterios de diferenciacion sindromica y relaciones entre conceptos de capitulos distintos, apoyandose en las muestras de sintesis multietapa.
- Generacion de material didactico y fichas de contenido: redaccion de resumenes de capitulo, comparativas entre tipos constitucionales y explicaciones de escenarios clinicos simulados para cursos de formacion.
- Chatbot de dominio en chino para portales de medicina tradicional: al ser un adaptador pequeno servido junto al base, permite mantener una instancia especializada separada de un asistente generalista, con un coste de VRAM adicional minimo (0,2 GB de pesos de adaptador).
- Prototipado e investigacion en adaptacion de dominio sanitario: sirve como caso de estudio reproducible de destilacion desde PDF normativos hacia un LoRA de rango 16, incluido el formateo para RAG y las estrategias anti-olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la loss de entrenamiento, que pasa de aproximadamente 0,46 a 0,31 en 2 epocas. No hay evaluaciones sobre MMLU, CMMLU, HumanEval, GSM8K ni sobre conjuntos especificos de MTC, ni comparaciones cuantitativas con otros modelos de la misma categoria.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3-8B completo; los requisitos reales vienen determinados por el base, no por el LoRA.
- Cuantizado en 4 bits (configuracion usada en la ficha), la estimacion habitual para un denso de 8.000 millones es de unos 5-7 GB de VRAM para los pesos, mas el espacio de activaciones y cache KV segun la longitud de secuencia; con max_seq_length=1024 el margen anadido es reducido.
- En precision bf16/fp16, el peso del modelo ronda los 16 GB, por lo que se necesita una GPU de 24 GB o superior (RTX 3090, RTX 4090, L40S, A100 40 GB) para operar con comodidad.
- Cabe en GPU de consumo: si, en 4 bits en tarjetas de 8-12 GB con secuencias cortas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), y con holgura en 16-24 GB.
- Opciones de despliegue: Unsloth y PEFT para carga directa del adaptador (el ejemplo de la ficha usa FastLanguageModel y load_adapter), TRL para reentrenamiento, y servidores compatibles con adaptadores LoRA como vLLM (con soporte multi-LoRA) o TGI. No se documenta en la ficha una conversion a GGUF, por lo que llama.cpp u Ollama requeririan convertir el adaptador y fusionarlo con el base por cuenta propia.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chenhaodev/tcm-constitution-qwen3-8b-lora | 8B base + LoRA r=16 | No especificado (uso a 1024) | Sin benchmarks publicados; loss 0,46 → 0,31 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-8B (modelo base) | 8B densos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 (segun la ficha del adaptador) | HuggingFace, modelo de referencia ampliamente distribuido |
| Otros ajustes de MTC sobre modelos abiertos | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables de MTC en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La unica comparacion sustentada es con el modelo base Qwen3-8B, del que este repositorio solo redistribuye el adaptador.

## Limitaciones y advertencias

- Modelo unicamente en chino: no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su uso fuera de zh producira respuestas degradadas.
- Cobertura de dominio estrecha: teoria basica, diagnostico y constituciones de MTC segun tres fuentes concretas; cualquier pregunta fuera de ese ambito recaera en el conocimiento generico del base Qwen3-8B.
- Riesgo de alucinacion en un dominio sanitario: aunque el entrenamiento busca anclar las respuestas a material, no hay evaluacion publicada de fidelidad, y el modelo puede inventar criterios, dosis o indicaciones.
- El propio autor declara que el modelo es solo para aprendizaje y referencia y que no constituye diagnostico ni consejo terapeutico; la MTC clinica requiere un profesional titulado. Cualquier despliegue sanitario debe anadir avisos legales y filtros.
- Advertencia regulatoria: un sistema que sugiera tratamientos o diagnosticos puede quedar sujeto a normativa de productos sanitarios o de publicidad sanitaria segun la jurisdiccion.
- Capacidad limitada por el rango del adaptador: LoRA r=16 con 2 epocas y 15.339 ejemplos es un ajuste ligero; la profundidad de conocimiento es previsiblemente menor que la de un fine-tuning completo o un modelo entrenado desde cero en el dominio.
- Dependencia de la calidad del destilado: los datos fueron generados por un modelo profesor local a partir de PDF, sin verificacion humana documentada, por lo que los errores del profesor pueden haberse transferido al adaptador.
- Longitud de contexto efectiva no verificada: aunque Qwen3-8B soporta ventanas amplias, el entrenamiento se hizo con secuencias de 1536 y el ejemplo de uso fija max_seq_length=1024; no hay evaluacion de comportamiento mas alla de esa longitud.
- RAG acoplado a un indice concreto: el indice FAISS publicado tiene 354 fragmentos y usa BGE-small-zh-v1.5 (512 dimensiones); cambiar el modelo de embeddings o el corpus invalida la sinergia con la que se entreno el adaptador.
- Adopcion nula verificable: 0 descargas y 0 likes en la fecha de consulta, sin historial de uso en produccion ni issues que permitan juzgar su robustez.
- Licencia Apache 2.0 en el adaptador, que en principio permite uso comercial, pero el autor senala que los datos de entrenamiento son cuestiones derivadas y no copias literales de las obras citadas; la responsabilidad sobre el uso de las fuentes originales recae en quien despliegue el modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/chenhaodev/tcm-constitution-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset declarado: https://huggingface.co/datasets/chenhaodev/tcm-constitution-qwen3-8b-lora
- Modelo de embeddings usado en el indice RAG: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las busquedas devolvieron exclusivamente resultados no relacionados (letras de canciones en persa). No hay papers, blogs, repositorios ni demos adicionales disponibles en la informacion proporcionada.
