# mradermacher/Hornybot-Mara-POV-i1-GGUF

## Resumen

Hornybot-Mara-POV-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo axiomofmind/Hornybot-Mara-POV, un modelo conversacional en ingles orientado a roleplay en primera persona y contenido para adultos. Se trata, por tanto, de un artefacto derivado de cuantizacion y no de un modelo entrenado desde cero: su aportacion es empaquetar los pesos originales en una veintena de variantes de precision (mayoritariamente del tipo i1 con matriz de importancia, imatrix) para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 8.953.803.264 parametros totales (aproximadamente 8,95 mil millones), segun los datos de safetensors del repositorio, y esta etiquetado con qwen3.5, lo que apunta a que la arquitectura base pertenece a la familia Qwen. El repositorio ocupa 110,2 GB en total, repartidos entre las distintas cuantizaciones publicadas, que van desde los 3,7 GB de la variante i1-IQ2_M hasta los 7,5 GB de i1-Q6_K.

Su relevancia es acotada y especifica: resulta util para quienes quieren ejecutar un modelo de rol conversacional de ~9B en hardware de consumo, en ingles y con tematicas adultas, sin necesidad de descargar los pesos completos. La model card no documenta datos de entrenamiento, composicion del dataset, licencia ni longitud de contexto, por lo que buena parte de sus caracteristicas tecnicas no estan disponibles y deben verificarse en el repositorio del modelo base antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta qwen3.5 sugiere familia Qwen, sin confirmar en la model card) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q6_K, mas fichero imatrix; existen cuantizaciones estaticas en mradermacher/Hornybot-Mara-POV-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Vision | la model card indica que es un modelo de vision; los ficheros mmproj, si existen, se alojan en el repositorio estatico |
| Tamano del repositorio | 110,2 GB |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base en la documentacion proporcionada. La unica pista es la etiqueta qwen3.5 asociada al repositorio, que sugiere que axiomofmind/Hornybot-Mara-POV deriva de un modelo de la familia Qwen, presumiblemente un transformer denso de aproximadamente 9.000 millones de parametros. Valores como el tipo de atencion, el numero de capas o la implementacion exacta del tokenizador no se documentan.

En cuanto al entrenamiento, la model card no describe el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO. Tampoco se detalla el proceso de creacion del fichero imatrix (matriz de importancia) que mradermacher utiliza para las cuantizaciones i1, mas alla deindicar que son cuantizaciones ponderadas. Toda la informacion tecnica adicional deberia consultarse en el repositorio del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en el mantenimiento de un personaje y la narracion en primera persona.
- Roleplay y ficcion interactiva, incluyendo contenido para adultos (etiquetas adult y roleplay).
- Conversacion multi-turno, segun la etiqueta conversational.
- Posible capacidad de vision: la model card afirma explicitamente que es un modelo de vision, aunque los ficheros mmproj no se incluyen en este repositorio, sino en el estatico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles, segun el campo language.
- Modo de pensamiento o razonamiento explicito: no disponible.

## Casos de uso

- Chatbots de personaje: el modelo esta ajustado para interpretar un personaje concreto en primera persona, de modo que puede integrarse en aplicaciones de compania conversacional o plataformas de rol por texto gestionando dialogos multi-turno con un tono consistente.
- Ficcion interactiva y novelas visuales: su enfoque narrativo en primera persona encaja en motores de historia ramificada donde el usuario decide acciones y el modelo genera la respuesta del personaje.
- Generacion de guiones y dialogos para prototipos creativos: util para escritores que necesitan redactar dialogos con una voz narrativa concreta, siempre que el contenido adulto este permitido en el flujo de trabajo.
- Despliegue local en equipos de consumo: las cuantizaciones i1-Q4_K_M (5,7 GB) permiten ejecutar el modelo en una GPU de gama media o incluso en CPU, lo que lo hace apto para aplicaciones de escritorio sin conexion.
- Investigacion en alineacion y seguridad de contenido adulto: sirve como caso de estudio de un modelo afinado especificamente para roleplay adulto y de como se comportan las cuantizaciones agresivas (IQ2, Q2_K) en ese dominio.
- Pruebas comparativas de cuantizacion: el repositorio incluye un fichero imatrix y una veintena de variantes, lo que permite evaluar la degradacion de calidad entre niveles de precision en una tarea conversacional concreta.
- Integracion en entornos llama.cpp/Ollama: al estar en formato GGUF, puede cargarse directamente en herramientas de inferencia local sin conversion adicional, lo que simplifica prototipos rapidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco hay cifras de perplejidad comparativas entre las distintas cuantizaciones mas alla de la referencia generica a un grafico externo de ikawrakow.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para i1-IQ3_M, 5,3-6 GB para i1-IQ4_XS y i1-Q4_K_S, 5,7-6,5 GB para i1-Q4_K_M y 7,5-8,5 GB para i1-Q6_K, sumando el contexto y el overhead de llama.cpp.
- Las variantes i1-IQ2_M (3,7 GB) y i1-Q2_K_S (3,8 GB) permiten ejecucion en GPUs con 6 GB o menos, a costa de una calidad notablemente inferior.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070) puede ejecutar las cuantizaciones Q4 y Q6 con comodidad. Para FP16 serian necesarios aproximadamente 18 GB, lo que situa el modelo en el rango de A100 40 GB, H100 o RTX 4090 con cuantizacion reducida.
- Si cabe en GPU de consumo: si, las cuantizaciones de 3,7 a 7,5 GB caben en tarjetas de 8 GB o superiores; las variantes mas pequenas pueden incluso ejecutarse en iGPU o CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI requieren los pesos en safetensors del modelo base, no estas cuantizaciones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hornybot-Mara-POV-i1-GGUF | 8,95B | no disponible | no disponible | GGUF en HuggingFace | Ajustado para roleplay adulto en ingles; 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | safetensors, GGUF, multiples cuantizadores | Referencia generalista multilingue de tamano similar |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF, Ollama | Buen rendimiento general y soporte de tool calling |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa ligera y permisiva para uso comercial |

La comparacion directa de rendimiento no es posible porque no se han publicado benchmarks de Hornybot-Mara-POV. Las alternativas citadas son modelos generalistas con licencias verificables, mientras que la licencia de este modelo no esta disponible, lo que limita su uso comercial sin una comprobacion previa.

## Limitaciones y advertencias

- La licencia no esta disponible, por lo que no puede asumirse que se permita el uso comercial ni la redistribucion. Es imprescindible consultar el repositorio del modelo base antes de cualquier despliegue.
- El modelo esta disenado para contenido adulto y roleplay. Requiere filtrado, control de acceso por edad y politicas de contenido si se expone a usuarios finales.
- Solo soporta ingles, segun el campo language del repositorio.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones largas o tareas que dependan de ventanas amplias.
- Riesgo de alucinacion: no hay datos publicados sobre la tasa de alucinacion ni evaluaciones de fidelidad; en tareas de rol el modelo prioriza la coherencia narrativa sobre la exactitud factual.
- Sesgos conocidos: no disponible. Al estar afinado sobre un corpus de roleplay adulto, es probable que refleje sesgos presentes en ese tipo de datos, pero no se documenta ningun analisis al respecto.
- Las cuantizaciones de baja precision (i1-IQ2_M, i1-Q2_K_S, i1-Q2_K) degradan la calidad de forma significativa; la propia model card desaconseja algunas de ellas para uso real.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Es un artefacto de cuantizacion: no introduce mejoras de entrenamiento y su comportamiento depende por completo del modelo base axiomofmind/Hornybot-Mara-POV.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Hornybot-Mara-POV-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Hornybot-Mara-POV-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-Mara-POV
- Pagina de resumen y descargas: https://hf.tst.eu/model#Hornybot-Mara-POV-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
