# mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-GGUF

## Resumen

AfriGuardPlain-AfriqueQwen3.5-4B-GGUF es la version cuantizada en formato GGUF del modelo adzcai/AfriGuardPlain-AfriqueQwen3.5-4B, publicada por el usuario mradermacher, conocido por producir y mantener cuantizaciones GGUF de modelos abiertos. El modelo original se enmarca en la familia AfriGuard y esta orientado a tareas de seguridad (etiqueta safety), con enfasis en lenguas africanas: ademas del ingles, cubre amharico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulu. El repositorio no incluye una model card propia: la informacion disponible es la declaracion de metadatos (idiomas, licencia, dataset de entrenamiento y modelo base) mas la documentacion generica de mradermacher sobre sus cuantizaciones.

El modelo base se denomina "AfriqueQwen3.5-4B", lo que apunta a un derivado de la familia Qwen3.5 con un tamano nominal de 4.000 millones de parametros, aunque el dato real de parametros declarado en el repositorio (333.514.240, es decir, unos 333 millones) no coincide con esa nomenclatura. Esta discrepancia no se explica en la informacion disponible y conviene verificarla antes de planificar el despliegue. El repositorio ocupa aproximadamente 1,0 GB y, ademas de las cuantizaciones de texto, incluye ficheros mmproj en Q8_0 y f16, lo que indica que el modelo base incorpora algun componente multimodal (vision u otro tipo de proyeccion) que se preserva en el proceso de cuantizacion.

La relevancia de esta ficha radica en dos factores: por un lado, la escasez de modelos de seguridad especificamente entrenados para lenguas africanas, un nicho poco cubierto por los guardrails comerciales; por otro, el formato GGUF, que permite ejecutar el modelo en CPU o en GPU de gama baja mediante llama.cpp, Ollama o LM Studio, sin depender de infraestructura de servidor. El modelo se distribuye bajo licencia CC-BY-4.0, lo que facilita el uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de la familia Qwen3.5 segun el nombre del modelo base (transformer decoder, multimodal por la presencia de ficheros mmproj) |
| Parametros totales | 333.514.240 (dato declarado en safetensors); el nombre del modelo indica 4B, discrepancia no aclarada |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | Ingles, amharico (am), hausa (ha), igbo (ig), oromo (om), shona (sn), suajili (sw), twi (tw), wolof (wo), yoruba (yo), zulu (zu) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en transformers/safetensors |
| Tamanos de fichero | Solo se documentan los mmproj: 0,5 GB (Q8_0) y 0,8 GB (f16); los tamanos de las cuantizaciones de texto no se detallan |
| Dataset de entrenamiento | adzcai/AfriGuard-plain |
| Modelo base | adzcai/AfriGuardPlain-AfriqueQwen3.5-4B |
| Libreria declarada | transformers |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura en la documentacion proporcionada. La unica referencia estructural es el nombre del modelo base, "AfriqueQwen3.5-4B", que sugiere un derivado de la familia Qwen3.5 con 4.000 millones de parametros nominales. La presencia de ficheros mmproj (proyector multimodal) en el repositorio GGUF indica que el modelo original incorpora un componente multimodal; en llama.cpp, estos ficheros se cargan junto al modelo principal para habilitar la entrada de imagenes u otras modalidades. Tambien existe una discrepancia entre el tamano nominal (4B) y el recuento real de parametros en safetensors (333,5 M) que la informacion disponible no resuelve.

En cuanto al entrenamiento, lo unico documentado es el uso del dataset adzcai/AfriGuard-plain y la etiqueta llama-factory, que indica que el ajuste se realizo con el framework LLaMA-Factory. No se especifica el volumen de tokens, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o preferencias. Tampoco se detalla el proceso de cuantizacion mas alla de la nota del autor: se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no hay cuantizaciones ponderadas o con imatrix publicadas por el mismo autor en el momento de la publicacion.

## Capacidades

- Generacion de texto y clasificacion: el modelo base esta etiquetado como safety y afriguard, por lo que su uso previsto es la evaluacion de seguridad de contenido (deteccion de contenido nocivo, filtrado, moderacion).
- Cobertura multilingue africana: soporte declarado para once idiomas, diez de ellos africanos (amharico, hausa, igbo, oromo, shona, suajili, twi, wolof, yoruba y zulu) mas el ingles.
- Componente multimodal: los ficheros mmproj incluidos en el repositorio permiten cargar una proyeccion multimodal en llama.cpp, lo que sugiere capacidad de procesar entradas no textuales, aunque la modalidad exacta (vision, audio u otra) no se especifica.
- Despliegue local: el formato GGUF permite ejecucion en CPU y GPU de consumo a traves de llama.cpp, Ollama, LM Studio y otros clientes compatibles.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades matematicas, de codigo o vision detalladas: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido en lenguas africanas: el modelo puede clasificar mensajes de usuario en suajili, hausa, yoruba o zulu para detectar discurso de odio o contenido nocivo, un escenario donde la mayoria de guardrails comerciales rinden mal por falta de cobertura lingueistica.
- Filtrado previo en plataformas de mensajeria y redes sociales: integrado como capa de guardrail antes de un LLM generativo, permite descartar entradas nocivas en idiomas africanos antes de que lleguen al modelo principal, reduciendo coste y riesgo.
- Anotacion y curado de datasets: uso como etiquetador automatico de seguridad para prefiltrar grandes corpus multilingues y reducir el trabajo manual de revisores humanos.
- Auditoria de chatbots multilingues: evaluacion sistematica de las respuestas de un asistente conversacional en las once lenguas soportadas para detectar fallos de seguridad especificos por idioma.
- Investigacion en seguridad de IA para lenguas de bajos recursos: el modelo sirve como base para experimentos de red-teaming y para estudiar como se transfieren los sesgos y las politicas de seguridad entre idiomas.
- Despliegue en entornos con hardware limitado: gracias a las cuantizaciones Q4_K_M, Q5_K_M o Q8_0, el modelo puede ejecutarse en un portatil o en una maquina sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita auditorias y demostraciones in situ.
- Preprocesado en pipelines de moderacion con requisitos de latencia baja: al ser un modelo pequeno y cuantizado, es viable ejecutarlo en la misma maquina que el servicio principal para tareas de cribado en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 4B, las cuantizaciones Q4_K_M suelen requerir en torno a 2,5-3 GB, Q5_K_M alrededor de 3-3,5 GB, Q8_0 cerca de 4,5 GB y f16 en torno a 8 GB, a lo que hay que sumar el KV cache y, en su caso, el proyector multimodal (0,5-0,8 GB adicionales segun el fichero mmproj). Estas cifras son estimaciones basadas en el tamano nominal y no en mediciones publicadas para este modelo.
- Si el recuento real de parametros es el declarado en safetensors (333,5 M), los requisitos serian muy inferiores, del orden de unos pocos cientos de megabytes en Q4_K_M.
- GPU recomendadas: no disponibles en la informacion proporcionada. Con el tamano nominal de 4B, una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB serian suficientes con margen amplio; no se ha confirmado compatibilidad ni rendimiento especifico.
- GPU de consumo: previsiblemente si, en cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4/Q5, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (no cuantizado) se puede servir con transformers, y potencialmente con vLLM o TGI si el modelo base es compatible, aunque esto no se confirma en la informacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas africanos | Notas |
|---|---|---|---|---|---|---|
| mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-GGUF | 333,5 M declarados (nombre: 4B) | No disponible | cc-by-4.0 | GGUF | 10 | Cuantizaciones estaticas + mmproj multimodal |
| adzcai/AfriGuardPlain-AfriqueQwen3.5-4B (original) | No disponible | No disponible | cc-by-4.0 | Transformers/safetensors | 10 | Modelo de origen, ajustado con LLaMA-Factory sobre el dataset AfriGuard-plain |
| Otros guardrails multilingues de proposito general | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria en terminos de rendimiento o cobertura. La comparacion mas directa posible es con su propio modelo base sin cuantizar, del que solo se conocen los metadatos.

## Limitaciones y advertencias

- Discrepancia de tamano sin resolver: el nombre del modelo indica 4B, pero el recuento declarado en safetensors es de 333.514.240 parametros. Hay que verificar cual es el tamano real antes de dimensionar infraestructura.
- Ausencia de model card: el repositorio no incluye documentacion propia del modelo, solo la plantilla generica de cuantizacion de mradermacher. No hay informacion sobre datos de entrenamiento, evaluacion o comportamiento esperado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de seguridad ni en ninguna otra tarea, por lo que su eficacia como guardrail no esta validada publicamente.
- Riesgo de alucinacion y de falsos positivos/negativos: al ser un modelo de clasificacion de seguridad, los errores se traducen directamente en contenido nocivo no filtrado o en censura indebida de contenido legitimo.
- Sesgos potenciales: el dataset de entrenamiento (AfriGuard-plain) puede sobrerrepresentar ciertos idiomas, registros o perspectivas culturales dentro del conjunto de lenguas africanas soportadas; no se documenta su composicion.
- Cobertura lingueistica limitada a once idiomas: otras lenguas africanas relevantes (por ejemplo, fulfulde, bambara, somali, kinyarwanda o chichewa) no estan declaradas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial y modificacion, pero exige atribucion al autor y la indicacion de cambios; no incluye clausula de patentes ni garantias.
- Naturaleza de la cuantizacion: las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad de forma notable; para tareas de seguridad, donde los matices importan, se recomienda Q5_K_M, Q6_K o Q8_0.
- Sin cuantizaciones ponderadas ni imatrix en el momento de la publicacion, lo que limita las opciones de optimizacion de calidad por bit.
- Advertencia de despliegue: el componente mmproj requiere cargarse junto al modelo en runtimes compatibles; no todos los clientes GGUF lo soportan.
- El modelo no debe usarse como unico mecanismo de seguridad en produccion sin una capa adicional de validacion humana o de reglas deterministicas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/AfriGuardPlain-AfriqueQwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/adzcai/AfriGuardPlain-AfriqueQwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/adzcai/AfriGuard-plain
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#AfriGuardPlain-AfriqueQwen3.5-4B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
