# mradermacher/Gizzai-Sense-E2B-GGUF

## Resumen

Gizzai-Sense-E2B es un modelo de lenguaje de pequeno tamano desarrollado por GizzAI, disenado especificamente para emitir juicios tipados y calibrados que el software pueda consumir de forma directa. Su funcion principal no es la generacion libre de texto, sino producir una decision con un nivel de confianza asociado; cuando esa confianza cae por debajo de un umbral (se cita un 80 %), el caso se deriva a un modelo hermano de mayor capacidad, Gizzai-Sense-E4B, que redacta un veredicto mas elaborado. Este modelo de esta ficha es la version cuantizada a GGUF, publicada por mradermacher a partir de los pesos originales de GizzAI.

Se trata de un modelo compacto: el repositorio de safetensors del modelo base declara 475.729.088 parametros (aproximadamente 0,48 mil millones), una cifra notablemente inferior a lo que el sufijo "E2B" podria sugerir, lo que apunta a una nomenclatura de "parametros efectivos" mas que a un recuento bruto. Soporta los idiomas chino (zh) e ingles (en) y se distribuye bajo la licencia propia gizzai-sense-license. El repositorio GGUF incluye, ademas de los pesos de lenguaje, ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal de tipo vision dentro del ecosistema GGUF.

Su relevancia actual radica en el patron arquitectonico de cascada: un modelo pequeno y rapido resuelve la mayoria de los casos en una sola pasada hacia adelante, y solo los casos ambiguos escalan a un modelo mayor o a revision humana. Este diseno reduce coste y latencia en comparacion con invocar un modelo grande para cada entrada, y encaja en flujos donde se necesita una senal booleana o categorica fiable en lugar de texto generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada) |
| Parametros totales | 475.729.088 (aproximadamente 0,48 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | gizzai-sense-license (categoria "other") |
| Formato de pesos | GGUF (pesos originales en safetensors en el modelo base) |
| Tamano del repositorio | 1,5 GB (conjunto completo de cuantizaciones) |
| Modalidad | texto; soporte multimodal via ficheros mmproj |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo (transformer denso, MoE, hibrida u otra), ni el volumen o la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. El unico dato estructural claro es el recuento de parametros (475.729.088) y la presencia de un proyector multimodal (mmproj) en la version GGUF, lo que confirma capacidad de procesamiento de imagenes dentro de llama.cpp y derivados.

La innovacion destacable no reside en la arquitectura sino en el diseno de uso: el modelo esta concebido para producir juicios tipados y calibrados en una sola pasada, con una senal de confianza que permite enrutar los casos dudosos a Gizzai-Sense-E4B o a un operador humano. En la documentacion del proyecto se describe un ejemplo de uso en el que el sistema rapido resolvio 9 de cada 10 elementos por si solo, derivando el restante. Este patron de cascada con umbral de confianza es el rasgo tecnico diferencial frente a modelos generativos de proposito general del mismo tamano.

## Capacidades

- Generacion de juicios tipados y calibrados, con salida orientada a ser consumida por software.
- Estimacion de confianza asociada a cada juicio, con derivacion de casos por debajo del umbral (se cita un 80 %).
- Enrutamiento en cascada hacia un modelo mayor (Gizzai-Sense-E4B) o hacia revision humana.
- Procesamiento multimodal de tipo vision mediante los ficheros mmproj incluidos (Q8_0 y f16).
- Soporte de los idiomas chino e ingles.
- Compatible con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Moderacion de contenido asistida: el modelo clasifica cada elemento con una etiqueta y un nivel de confianza en una sola pasada; los casos por debajo del umbral se envian a un revisor humano, reduciendo la carga manual manteniendo el control.
- Triaje de tickets de soporte: categoriza y prioriza incidencias entrantes de forma rapida y deriva los casos ambiguos a un modelo mayor que redacte una respuesta detallada.
- Verificacion de formularios y datos estructurados: emite un juicio booleano sobre si un campo cumple un criterio, con confianza asociada, para validaciones automatizadas en pipelines.
- Pre-filtrado en flujos de anotacion: descarta o marca candidatos antes de que un anotador humano o un modelo grande los procese, economizando recursos.
- Clasificacion de imagenes con criterio: gracias al proyector multimodal, puede emitir juicios sobre contenido visual acompanado de una pregunta textual.
- Enrutamiento de consultas en sistemas multi-modelo: actua como primer nivel que decide si una peticion es resoluble localmente o debe escalar, optimizando coste y latencia.
- Asistencia en revision de tareas o examenes: el ejemplo documentado marca cada elemento de un ejercicio y deriva los dudosos a un modelo de mayor tamano que emite un veredicto breve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato operativo reportado es que, en una ejecucion descrita por el autor del modelo base, el sistema rapido resolvio por si solo 9 de cada 10 elementos de un ejercicio, derivando el restante a Gizzai-Sense-E4B. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion estandar, por lo que no es posible establecer comparaciones cuantitativas.

## Requisitos de hardware

- Huella de memoria estimada a partir del recuento de parametros (475,7 M), sin incluir el contexto: aproximadamente 1 GB en f16, en torno a 0,5 GB en Q8_0 y cerca de 0,3 GB en Q4_K_M. Son estimaciones aritmeticas, no medidas publicadas.
- El suplemento multimodal anade peso: mmproj-Q8_0 ocupa 0,7 GB y mmproj-f16 ocupa 1,1 GB.
- Cabe holgadamente en GPU de consumo. Modelos como una RTX 3060 (12 GB), RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida pueden ejecutarlo.
- Tambien es viable en CPU sola, dado el reducido tamano.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, servidor compatible con la API de OpenAI). Para el modo vision es necesario cargar el fichero mmproj correspondiente.
- No se dispone de datos publicados de latencia o throughput concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gizzai-Sense-E2B (esta ficha, GGUF) | 475,7 M | no disponible | zh, en | gizzai-sense-license | GGUF en HuggingFace |
| Gizzai-Sense-E4B (modelo hermano de mayor capacidad) | no disponible | no disponible | no disponible | gizzai-sense-license (presumible, no confirmado) | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (clasificadores calibrados o modelos compactos con enrutamiento por confianza) como para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El propio proyecto advierte que el modelo no esta pensado para decisiones totalmente automatizadas con efectos legales o de impacto significativo sobre las personas; en esos casos debe mantenerse a un humano en el bucle.
- Al ser un cuantizado GGUF, pueden aparecer perdidas de calidad respecto a los pesos originales, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K_S). El autor indica que no ha publicado cuantizaciones ponderadas con imatrix.
- La licencia es propia (gizzai-sense-license), con terminos potencialmente distintos de las licencias permisivas habituales; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Idioma limitado a chino e ingles; no se documenta soporte para castellano ni otros idiomas.
- No se especifican la ventana de contexto ni el comportamiento en conversaciones largas, lo que dificulta planificar su uso en escenarios multi-turno extensos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, mitigado en parte por el mecanismo de confianza y derivacion, pero no eliminado.
- Las fechas del repositorio (creado y actualizado en septiembre de 2026) resultan atipicas; conviene verificar la vigencia y el estado del proyecto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Gizzai-Sense-E2B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/GizzAI/Gizzai-Sense-E2B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Repositorio del proyecto Gizzai Sense en GitHub: https://github.com/wzsxb233/gizzai-sense
- Pagina de resumen de descargas del modelo: https://hf.tst.eu/model#Gizzai-Sense-E2B-GGUF
- Referencia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
