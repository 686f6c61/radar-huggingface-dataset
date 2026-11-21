# mradermacher/madrimed1.2-VL-2B-GGUF

## Resumen

madrimed1.2-VL-2B-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje madrimed1.2-VL-2B, publicado por el usuario mradermacher a partir de los pesos originales de madrisight. Se trata de un modelo multimodal de 2.031.739.904 parametros (aproximadamente 2B) construido sobre la familia Qwen3-2B, especializado en razonamiento clinico, respuesta visual a preguntas medicas (VQA) y analisis de imagenes biomedicas como radiologia e histopatologia. Su proposito es ofrecer un modelo pequeno (SLM) que pueda ejecutarse en hardware modesto y servir de apoyo a decisiones clinicas, triaje de imagenes o formacion medica.

La relevancia de esta publicacion radica en dos factores. Por un lado, la cuantizacion GGUF permite desplegar un VLM medico en CPU o en GPUs de consumo, algo poco habitual en el ambito clinico, donde predominan modelos mucho mayores. Por otro, la licencia Apache 2.0 elimina las restricciones tipicas de los modelos medicos con licencias de investigacion, lo que facilita su integracion en prototipos y productos comerciales.

El repositorio incluye tanto los pesos cuantizados del modelo de lenguaje como los ficheros `mmproj` (proyector multimodal) necesarios para procesar imagenes, en variantes Q8_0 y f16. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada: la model card del cuantizador es puramente tecnica y remite al modelo base, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3-2B (transformer multimodal con proyector de vision); detalles internos no disponibles |
| Parametros totales | 2.031.739.904 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es madrisight/madrimed1.2-VL-2B, un VLM construido sobre Qwen3-2B segun las etiquetas del repositorio. Esto implica una arquitectura transformer con un codificador de vision y un proyector que mapea las representaciones visuales al espacio del modelo de lenguaje, siguiendo el patron habitual de los VLM actuales. El repositorio GGUF separa explicitamente los pesos del modelo de lenguaje de los del proyector multimodal (`mmproj`), lo que confirma esa estructura de dos componentes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas del modelo mencionan los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y PathVQA, lo que sugiere que el entrenamiento o la evaluacion se apoyaron en esos benchmarks medicos, pero no se detalla el proceso. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal.

El trabajo de mradermacher se limita a la cuantizacion estatica de los pesos originales (quantize_version 2, output_tensor_quantised 1), sin cuantizaciones ponderadas por imatrix, que el autor indica que probablemente no estaran disponibles.

## Capacidades

- Generacion de texto y razonamiento clinico en ingles, orientado a preguntas medicas y apoyo a decisiones.
- Respuesta visual a preguntas (VQA) sobre imagenes medicas: radiologia, patologia e histopatologia.
- Analisis de imagenes biomedicas con el proyector multimodal incluido en el repositorio.
- Razonamiento multimodal de varios pasos sobre hallazgos visuales y contexto textual.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo o matematicas generales: no documentadas especificamente.
- Capacidades de audio o thinking mode: no disponibles.

## Casos de uso

- Triaje de radiografias en entornos con recursos limitados: el modelo puede responder preguntas en lenguaje natural sobre una imagen de torax y generar un informe preliminar; su tamano de 2B y sus cuantizaciones de 1 a 2,3 GB permiten ejecutarlo en estaciones de trabajo sin GPU dedicada.
- Apoyo a la docencia medica: permite construir un tutor interactivo que muestre una imagen histopatologica y responda preguntas del estudiante sobre estructuras y hallazgos, gracias a su naturaleza conversacional y su entrenamiento en dominios como PathVQA.
- Preprocesado y anotacion asistida de datasets medicos: el modelo puede generar descripciones y respuestas de referencia para imagenes de un corpus interno, acelerando el etiquetado previo a la revision por especialistas.
- Segunda opinion automatizada en patologia digital: integrado en un visor de laminas, el modelo puede responder consultas concretas sobre regiones seleccionadas y servir de filtro inicial antes de la lectura del patologo.
- Chatbot de orientacion sanitaria sobre informes e imagenes: con la variante Q8_0 o Q6_K, puede desplegarse en un servidor modesto para responder dudas sobre estudios radiologicos, siempre con supervision y avisos claros de que no sustituye al diagnostico profesional.
- Investigacion en VLM medicos de bajo coste: al ser Apache 2.0 y estar disponible en GGUF, sirve como linea base reproducible para comparar tecnicas de cuantizacion o de adaptacion multimodal sin necesidad de clústeres de GPU.
- Despliegue en el borde (edge): la variante Q4_K_M, de 1,4 GB, cabe en dispositivos con 4-8 GB de RAM y permite prototipos de analisis de imagenes en portatiles o mini-PC sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas y la del modelo base no se ha proporcionado; los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y PathVQA aparecen solo como etiquetas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (pesos del modelo mas proyector mmproj-Q8_0 de 0,5 GB):
  - Q2_K: aproximadamente 1,5 GB en total.
  - Q4_K_M: aproximadamente 1,9 GB en total.
  - Q6_K: aproximadamente 2,3 GB en total.
  - Q8_0: aproximadamente 2,8 GB en total.
  - f16: aproximadamente 5,1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060); para Q8_0 o f16, GPU de 6-8 GB como RTX 3060, RTX 4060 Ti o superiores. En el extremo profesional, A100 o H100 no son necesarias y solo aportarian throughput adicional.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; las variantes Q4_K_S y Q4_K_M estan marcadas por el autor como rapidas y recomendadas.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) por el formato GGUF; el modelo base en safetensors es compatible con transformers y con servidores que soporten VLM, aunque el repositorio GGUF esta pensado para el ecosistema llama.cpp. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| madrimed1.2-VL-2B (GGUF) | 2,03B | no disponible | Texto + imagen | Apache 2.0 | GGUF y safetensors en HF |
| Qwen3-2B (base) | 2B | no disponible en esta ficha | Texto | Apache 2.0 (segun familia Qwen3) | HF |
| Otros VLM medicos de ~2B | no disponible | no disponible | Texto + imagen | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad. El modelo base Qwen3-2B se incluye como referencia por ser el punto de partida declarado, no como alternativa funcional en el dominio medico.

## Limitaciones y advertencias

- Modelo especializado en ingles: no se documenta soporte de castellano ni de otros idiomas, por lo que su uso en produccion en espanol requeriria evaluacion adicional.
- Riesgo de alucinacion clinica: como todo modelo de lenguaje, puede generar hallazgos o diagnosticos plausibles pero incorrectos; no debe usarse como unico criterio en decisiones medicas.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni los sesgos demograficos, de equipo de imagen o de poblacion que pueda arrastrar.
- Contexto maximo no disponible: se desconoce la ventana de contexto, lo que complica el diseno de aplicaciones multi-turno o con informes largos.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K pueden degradar notablemente el razonamiento multimodal; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- Ausencia de cuantizaciones imatrix: no hay versiones ponderadas, que suelen ofrecer mejor calidad por tamano en modelos pequenos.
- Licencia Apache 2.0: permite uso comercial, pero no exime del cumplimiento de la normativa sanitaria aplicable (por ejemplo, marcado CE de dispositivos medicos o RGPD) si el modelo se integra en un producto clinico.
- Fecha de creacion del repositorio (2026-10-01) y actualizacion (2026-10-29): conviene verificar que la version descargada coincide con la ultima publicada.
- El repositorio GGUF no incluye documentacion sobre el modelo base; para entender el entrenamiento y las limitaciones reales hay que consultar madrisight/madrimed1.2-VL-2B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/madrimed1.2-VL-2B-GGUF
- Modelo base: https://huggingface.co/madrisight/madrimed1.2-VL-2B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#madrimed1.2-VL-2B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
