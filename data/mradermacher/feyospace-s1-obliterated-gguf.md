# mradermacher/feyospace-s1-OBLITERATED-GGUF

## Resumen

feyospace-s1-OBLITERATED-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo OBLITERATUS/feyospace-s1-OBLITERATED. No se trata de un modelo entrenado desde cero, sino de una conversión estática a GGUF pensada para su ejecución en llama.cpp, Ollama y otros runners compatibles con este formato. El autor es un conocido cuantizador de la comunidad, que distribuye estas versiones desde su cuenta de HuggingFace y desde su página de resumen en hf.tst.eu.

El modelo base cuenta con 27.320.697.856 parámetros reales (aproximadamente 27,3 mil millones, según los pesos en safetensors) y está etiquetado con las etiquetas cybersecurity, abliterated, qwen3.5, obliteratus y aspa, lo que sugiere una especialización en tareas de ciberseguridad y un proceso de abliteración (eliminación de direcciones de rechazo) sobre un modelo de la familia Qwen3.5. Esta orientación lo hace relevante para equipos que necesitan un modelo local, sin censura incorporada y con licencia Apache 2.0 para trabajo ofensivo o defensivo en seguridad.

El repositorio ocupa 189,2 GB e incluye once cuantizaciones que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), lo que permite desplegar el modelo tanto en GPUs de consumo como en servidores con aceleradores de mayor VRAM. No se han publicado en la información disponible la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio apunta a la familia qwen3.5; sin confirmar en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors segun la libreria transformers declarada |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. El repositorio analizado es exclusivamente una recopilacion de cuantizaciones estaticas generadas con el pipeline de mradermacher (se indica quantize_version 2, output_tensor_quantised 1 y convert_type hf en los comentarios del README). Las etiquetas del modelo base mencionan qwen3.5, cybersecurity y abliterated, de lo que se deduce que parte de un modelo denso de la familia Qwen3.5 y que se le ha aplicado un proceso de abliteracion para reducir las respuestas de rechazo, pero no se documentan ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO.

El unico detalle tecnico reseñable aportado por el cuantizador es que no se han generado cuantizaciones ponderadas ni con matriz de importancia (imatrix) en el momento de la publicacion, solo cuantizaciones estaticas. Ademas, el README incluye la marca skip_mmproj: 1, lo que indica que no se ha incluido el fichero de proyector multimodal (mmproj) en este repositorio; esto podria implicar que el modelo base tiene un componente multimodal no cubierto por estas cuantizaciones, aunque no se confirma en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio y el pipeline de transformers declarado.
- Especializacion declarada en ciberseguridad (etiqueta cybersecurity), orientada a tareas de analisis, redaccion tecnica y asistencia en dominios de seguridad.
- Modelo abliterated: se han eliminado o atenuado las direcciones de rechazo, por lo que responde a peticiones que otros modelos alineados rechazarian. Esto es relevante para investigacion y red team, y a la vez implica riesgos de uso.
- Razonamiento multi-paso y capacidades de codigo: no confirmadas en la informacion proporcionada, aunque plausibles dado el tamano del modelo base.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta language: en.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La marca skip_mmproj sugiere la posible existencia de un componente multimodal en el modelo base, pero no hay confirmacion.

## Casos de uso

- Analisis de vulnerabilidades y asistencia en pruebas de penetracion: al ser un modelo abliterated con etiqueta de ciberseguridad, permite generar y discutir tecnicas ofensivas (payloads de prueba, tecnicas de escalada de privilegios, evasion de controles) sin los rechazos tipicos de modelos alineados, siempre dentro de un marco autorizado y en un entorno controlado.
- Generacion de reglas de deteccion: redaccion de reglas Sigma, YARA o Snort a partir de descripciones de tecnicas adversarias, gracias a su especializacion declarada en seguridad y su tamano de 27,3 mil millones de parametros, que permite mantener coherencia sintactica en formatos estructurados.
- Revision de codigo con enfoque de seguridad: analisis de fragmentos de codigo para localizar patrones inseguros (inyeccion SQL, deserializacion no segura, manejo incorrecto de credenciales) y proponer parches.
- Elaboracion de informes de threat intelligence: resumen y mapeo de informes tecnicos a marcos como MITRE ATT&CK, con salida en ingles, que es el idioma para el que esta declarado el modelo.
- Ejercicios de tabletop y simulacion de adversario: generacion de escenarios de incidente realistas para formar a equipos de respuesta, aprovechando la ausencia de restricciones de contenido del modelo abliterated.
- Despliegue local en entornos aislados (air-gapped): la licencia Apache 2.0 y el formato GGUF permiten ejecutar el modelo en infraestructura propia sin envio de datos a terceros, algo critico en entornos con requisitos de confidencialidad.
- Experimentacion e investigacion sobre alineacion y abliteracion: util como punto de comparacion frente al modelo base original para estudiar el efecto de la eliminacion de direcciones de rechazo en el comportamiento.
- Asistente interno de documentacion de seguridad: generacion de procedimientos, politicas y guias tecnicas en ingles apoyandose en el conocimiento general del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad (por ejemplo CyberSecEval), y el autor remite unicamente a la comparativa generica de perplejidad entre tipos de cuantizacion publicada por ikawrakow.

## Requisitos de hardware

Los calculos de VRAM son estimaciones basadas en el tamano de cada fichero GGUF mas una reserva aproximada para la cache KV y el contexto; no proceden de la informacion proporcionada.

- Q2_K (11,0 GB): ejecutable en GPUs de consumo con 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080, RTX 3080 Ti) con contexto corto.
- Q3_K_S (12,4 GB) y Q3_K_M (13,6 GB): aptas para GPUs de 16 GB (RTX 4080, RTX 4090 con margen amplio); la variante Q3_K_M esta marcada por el autor como de calidad inferior.
- Q3_K_L (14,7 GB) e IQ4_XS (15,5 GB): encajan en 16-24 GB de VRAM.
- Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB): recomendadas por el autor como rapidas; caben comodamente en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- Q5_K_S (19,1 GB) y Q5_K_M (19,6 GB): viables en GPUs de 24 GB con contexto limitado.
- Q6_K (22,5 GB): al limite de una GPU de 24 GB; requiere cuantizacion parcial de capas en CPU o reparto entre dos GPUs.
- Q8_0 (29,1 GB): necesita 32 GB o mas de VRAM (A100 40 GB, H100 80 GB, o reparto multi-GPU); el autor lo describe como la mejor calidad a maxima velocidad.
- GPU recomendadas por rango: RTX 3090/4090 (24 GB) para Q4 y Q5; A100 40 GB, L40S o H100 80 GB para Q6 y Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. No se ha confirmado soporte en vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles. Dependeran de la cuantizacion, el hardware y la longitud de contexto, no documentada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas publicas y generales. Los datos de los modelos alternativos proceden de documentacion publica habitual y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| feyospace-s1-OBLITERATED (este) | 27,3 B | no disponible | apache-2.0 | GGUF y safetensors | Ciberseguridad, abliterated, ingles |
| Qwen3-32B | 32,8 B | no disponible en esta busqueda | apache-2.0 | safetensors, GGUF | Proposito general, multilingue |
| Gemma 3 27B | 27 B | no disponible en esta busqueda | licencia Gemma | safetensors, GGUF | Proposito general, multimodal |
| Mistral Small 3.1 24B | 24 B | no disponible en esta busqueda | apache-2.0 | safetensors, GGUF | Proposito general, contexto largo |

No se conocen modelos comparables directos en el nicho concreto de ciberseguridad mas abliteracion de este mismo tamano dentro de la informacion disponible.

## Limitaciones y advertencias

- Naturaleza abliterated: el modelo ha sido modificado para eliminar direcciones de rechazo. Esto aumenta el riesgo de generar contenido danino (explotacion, malware, instrucciones ofensivas) y traslada toda la responsabilidad de uso al operador. No es apto para despliegues orientados al publico sin filtros externos.
- Sesgos: no disponibles. No se documenta el dataset de entrenamiento ni los procesos de alineacion, por lo que no se pueden evaluar sesgos de genero, raza, religion o geopoliticos.
- Alucinacion: al ser un modelo de 27,3 B sin datos de evaluacion publicados, el riesgo de confabulacion en dominios tecnicos (CVE, APIs, tecnicas de ataque concretas) debe asumirse como alto y verificarse siempre contra fuentes primarias.
- Idioma: declarado unicamente para ingles. El rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Contexto: la longitud de contexto no esta documentada. Cualquier caso de uso que dependa de ventanas largas debe validarse empiricamente antes de llevarlo a produccion.
- Ausencia de imatrix: el autor indica que no ha generado cuantizaciones ponderadas con matriz de importancia, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar mas la calidad que variantes equivalentes de otros repositorios.
- Proyector multimodal omitido: la marca skip_mmproj: 1 sugiere que las capacidades multimodales del modelo base, si existen, no estan cubiertas por este repositorio.
- Metadatos: el repositorio registra una fecha de creacion de 2026-10-14 y 0 descargas y 0 likes en el momento de la consulta, lo que indica un modelo muy reciente, sin validacion por parte de la comunidad y sin senales de uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero esa licencia cubre los pesos del modelo base; las implicaciones legales de desplegar un modelo abliterated en un producto comercial son responsabilidad del integrador.
- Modelo base no verificado: no se ha podido acceder a informacion detallada del modelo original OBLITERATUS/feyospace-s1-OBLITERATED, por lo que la procedencia exacta de los pesos y su calidad no estan confirmadas de forma independiente.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/feyospace-s1-OBLITERATED-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/feyospace-s1-OBLITERATED
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#feyospace-s1-OBLITERATED-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
