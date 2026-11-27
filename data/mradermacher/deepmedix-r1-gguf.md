# mradermacher/DeepMedix-R1-GGUF

## Resumen

DeepMedix-R1-GGUF es la version cuantizada en formato GGUF del modelo Qika/DeepMedix-R1, un modelo de lenguaje de aproximadamente 7.600 millones de parametros orientado al ambito medico. La cuantizacion ha sido realizada por mradermacher, un conocido creador de versiones GGUF de la comunidad, que publica tanto cuantizaciones estaticas como versiones con imatrix en un repositorio separado. El modelo base esta publicado bajo licencia Apache 2.0 y esta etiquetado como conversational y orientado a ingles.

El interes de esta publicacion reside en que permite ejecutar un modelo especializado en dominio medico en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), algo inviable con los pesos originales en precision completa. El repositorio incluye ademas suplementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidad de vision, aunque la model card no detalla la arquitectura ni el proceso de entrenamiento.

La informacion disponible es limitada: la model card del repositorio GGUF es fundamentalmente una guia de cuantizaciones y no incluye datos sobre arquitectura, contexto, datos de entrenamiento ni benchmarks. Esta ficha refleja unicamente lo que puede verificarse a partir de los metadatos y del contenido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qika/DeepMedix-R1; los metadatos no detallan la arquitectura) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplementos multimodales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base Qika/DeepMedix-R1 en la documentacion proporcionada. El recuento de parametros (7.615.616.512) es coherente con un transformer denso de escala 7B-8B, pero no se confirma ni el tipo de atencion, ni el numero de capas, ni la longitud de contexto nativa. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo incorpora un codificador multimodal (vision), aunque no se especifica que arquitectura de proyeccion utiliza ni que resolucion de imagen admite.

Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. El sufijo "R1" en el nombre sugiere una posible inspiracion en el paradigma de razonamiento de DeepSeek-R1, pero esto es una inferencia por nomenclatura y no un dato confirmado en la documentacion. La cuantizacion la ha realizado mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), y las versiones con imatrix estan disponibles en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta "conversational" en los metadatos del repositorio.
- Especializacion en dominio medico inferida del nombre del modelo base (DeepMedix), aunque no se documenta el alcance exacto de dicha especializacion.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes cuando se usa con llama.cpp u otro runtime compatible con proyectores multimodales.
- Razonamiento de tipo "R1": el nombre sugiere capacidad de razonamiento extendido, pero no se confirma en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (language: en).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia clinica de apoyo en ingles: el modelo puede emplearse como asistente conversacional para resumir notas clinicas o responder consultas de caracter formativo, siempre con supervision humana y sin sustituir el juicio medico. Su tamano de 7,6B permite desplegarlo en infraestructura modesta.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,6 y 4,8 GB), puede ejecutarse en GPUs de consumo de 8 GB o en CPU con llama.cpp, lo que facilita prototipos y pruebas de concepto sin infraestructura dedicada.
- Procesamiento de documentacion medica con imagenes: usando los ficheros mmproj junto con el modelo principal en llama.cpp, es posible alimentar imagenes (por ejemplo, figuras de articulos o capturas de informes) y obtener descripciones o respuestas contextualizadas.
- Generacion de material divulgativo sanitario: el modelo puede redactar borradores de articulos, FAQ para pacientes o guiones de formacion en ingles, que despues revisaria un profesional sanitario.
- Investigacion en NLP clinico: sirve como linea base cuantizada para experimentos de evaluacion de modelos de dominio medico en ingles, comparando respuestas con y sin cuantizacion (Q4_K_M frente a Q8_0).
- Chatbot de triaje informativo: integrado en una aplicacion de mensajeria, puede gestionar conversaciones multi-turno en ingles para orientar sobre sintomas generales, derivando siempre a un profesional; la cuantizacion Q4_K_M ofrece un equilibrio razonable entre calidad y velocidad en GPU de consumo.
- Entornos offline o air-gapped: al ser un GGUF ejecutable localmente con llama.cpp, es adecuado para clinicas o laboratorios con restricciones de conectividad, siempre que se asuma la responsabilidad sobre la precision del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de dominio medico, ni comparaciones con el modelo base en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 3,1 GB (Q2_K), 4,6-4,8 GB (Q4_K_S / Q4_K_M), 5,4-5,5 GB (Q5_K_S / Q5_K_M), 6,4 GB (Q6_K), 8,2 GB (Q8_0) y 15,3 GB (f16). A estas cifras hay que sumar el espacio para la cache KV, que depende de la longitud de contexto configurada.
- Suplementos multimodales: mmproj-Q8_0 ocupa 1,0 GB y mmproj-f16 ocupa 1,5 GB adicionales cuando se activa la entrada de imagenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4 a Q8; A100 o H100 para f16 y para servir varias instancias en paralelo.
- Cabe en GPU de consumo: si, las cuantizaciones Q4_K_M y Q4_K_S caben en GPUs de 8 GB; Q5 y Q6 en GPUs de 12 GB; Q8_0 en GPUs de 12-16 GB con contexto moderado. Las versiones Q2_K y Q3_K caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como endpoints_compatible y la libreria declarada es transformers, pero el formato GGUF esta pensado para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de benchmarks que permitan una comparacion rigurosa. A continuacion se ofrece una comparacion estructural con alternativas de tamano similar ampliamente conocidas, limitada a parametros y licencia, sin extrapolar calidad:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| DeepMedix-R1 (este modelo) | ~7,6B | no disponible | Apache 2.0 | Si (mradermacher) |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens (segun documentacion publica del modelo) | Apache 2.0 | Si |
| Llama 3.1 8B Instruct | ~8B | 131.072 tokens (segun documentacion publica del modelo) | Llama 3.1 Community License | Si |
| Mistral 7B Instruct | ~7,2B | 32.768 tokens (segun documentacion publica del modelo) | Apache 2.0 | Si |

La comparacion de rendimiento en tareas medicas o generales no esta disponible para DeepMedix-R1 en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: la model card del repositorio GGUF no detalla arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta una evaluacion rigurosa antes de usarlo en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar afirmaciones erroneas; en dominio medico esto es especialmente critico y exige supervision profesional y verificacion de fuentes.
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente en ingles, puede reflejar sesgos de la poblacion y fuentes angloparlantes.
- Limitacion idiomatica: los metadatos declaran unicamente ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qika/DeepMedix-R1 mantenga la misma licencia y que no existan restricciones adicionales en su model card original.
- Uso clinico: no debe emplearse como dispositivo medico ni para diagnostico o tratamiento sin validacion regulatoria; la especializacion medica inferida del nombre no equivale a certificacion clinica.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K_M pueden degradar notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.
- Contexto desconocido: al no documentarse la longitud de contexto nativa, conviene probar empiricamente el limite antes de disenar flujos con ventanas largas.
- Multimodalidad sin especificar: se desconoce la resolucion de imagen soportada y el rendimiento del proyector visual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepMedix-R1-GGUF
- Modelo base: https://huggingface.co/Qika/DeepMedix-R1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/DeepMedix-R1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepMedix-R1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
