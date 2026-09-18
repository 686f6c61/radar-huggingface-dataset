# mradermacher/WeVisDoc-2B-GGUF

## Resumen

WeVisDoc-2B-GGUF es la version cuantizada en formato GGUF del modelo `tencent/WeVisDoc-2B`, publicada por el usuario mradermacher. Se trata de una conversion de pesos, no de un modelo entrenado desde cero: el repositorio contiene unicamente ficheros GGUF generados a partir del modelo original de Tencent. La relevancia de esta publicacion radica en que permite ejecutar el modelo en runtimes de inferencia local basados en llama.cpp (Ollama, LM Studio, llama-cpp-python), algo que no es posible con los pesos originales en safetensors.

El modelo base es multimodal, como evidencian los ficheros `mmproj` (proyector vision-lenguaje) incluidos en el repositorio. El nombre "WeVisDoc" sugiere un modelo orientado a comprension de documentos visuales, aunque la informacion disponible no detalla la arquitectura, los datos de entrenamiento ni las capacidades declaradas por el autor original. Los idiomas soportados son ingles y chino.

Existe una discrepancia de datos que conviene senalar: los metadatos de safetensors del repositorio base indican 406.957.056 parametros (~407 millones), mientras que el nombre del modelo indica "2B". La informacion proporcionada no aclara si los metadatos cubren la totalidad de los pesos o solo una parte (por ejemplo, el codificador de vision o el modelo de lenguaje). La licencia es Apache 2.0 en ambos repositorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con proyector vision-lenguaje, segun la presencia de ficheros mmproj) |
| Parametros totales | 406.957.056 segun metadatos safetensors del repositorio base; el nombre del modelo indica 2B (discrepancia no aclarada en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers, gguf) |
| Modelo base | tencent/WeVisDoc-2B |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `tencent/WeVisDoc-2B`: la model card del repositorio cuantizado no describe el tipo de red (transformer, MoE, hibrida), el numero de capas, la dimension oculta ni el mecanismo de atencion. Tampoco se detalla el proceso de entrenamiento: numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni ninguna innovacion tecnica concreta.

El unico dato estructural verificable es la presencia de dos ficheros proyector multimodal (`WeVisDoc-2B.mmproj-Q8_0.gguf`, de 0,5 GB, y `WeVisDoc-2B.mmproj-f16.gguf`, de 0,9 GB), lo que confirma que el modelo combina entrada visual con generacion de texto y que la conversion GGUF preserva esa capacidad. El proceso de cuantizacion realizado por mradermacher es de tipo estatico (no se han publicado variantes con imatrix ni weighted quants en el momento de la consulta).

## Capacidades

- Generacion de texto en ingles y chino.
- Procesamiento multimodal de entrada visual, confirmado por la presencia de los ficheros proyector `mmproj`.
- Comprension de documentos con componente visual, segun se deduce de la denominacion del modelo (no confirmado por documentacion del autor original).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Capacidades de generacion de codigo o matematicas: no disponible.

La informacion proporcionada no incluye una descripcion funcional de las capacidades del modelo base, por lo que no es posible confirmar ni descartar ninguna habilidad adicional.

## Casos de uso

- Extraccion de datos de documentos escaneados: al ser un modelo multimodal con proyector visual, puede emplearse en pipelines de digitalizacion para convertir facturas, formularios o contratos en texto estructurado, ejecutandose en local con llama.cpp.
- Procesamiento de documentos en entornos sin conectividad: los ficheros GGUF permiten desplegar el modelo en maquinas aisladas o con requisitos de soberania de datos, sin enviar informacion sensible a APIs externas.
- Asistencia documental bilingue ingles-chino: adecuado para organizaciones que manejan documentacion tecnica o legal en ambos idiomas y necesitan resumenes o busquedas sobre ese contenido.
- Prototipado rapido de aplicaciones de vision-lenguaje: al ser un modelo de tamano reducido, sirve para validar arquitecturas de producto antes de escalar a modelos mayores, con coste de hardware minimo.
- Analisis de capturas de pantalla e interfaces: la combinacion de vision y texto permite extraer informacion de imagenes de interfaz, diagramas o graficos simples.
- Indexacion semantica de archivos visuales: integrado con una base vectorial, puede generar descripciones textuales de imagenes de un repositorio documental para habilitar busqueda por lenguaje natural.
- Generacion de descripciones alternativas: produccion de texto descriptivo a partir de imagenes en flujos de accesibilidad, ejecutado en GPU de gama de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas (MMLU, HumanEval, GSM8K, DocVQA ni similares), y los resultados de busqueda web proporcionados no guardan relacion con el modelo (corresponden a fondos de pantalla de tematica historica), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion derivada del numero de parametros, no confirmada por el autor): si el modelo tiene ~407 millones de parametros, Q4_K_M ocuparia aproximadamente 0,3-0,4 GB y f16 alrededor de 0,9 GB; si el modelo tiene ~2.000 millones de parametros, Q4_K_M quedaria en torno a 1,2-1,5 GB y f16 en torno a 4 GB. A estas cifras hay que sumar la memoria del proyector multimodal (0,5 GB en Q8_0, 0,9 GB en f16) y la correspondiente a la cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM resulta suficiente en cualquiera de los dos escenarios de tamano; una NVIDIA RTX 3060, RTX 4060 o superior es adecuada. Para despliegues con mayor concurrencia, A100 o H100 no aportan ventaja significativa dado el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo moderna (RTX 3060 en adelante) e incluso en equipos con graficos integrados o CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp y cualquier runtime compatible con GGUF, incluyendo los ficheros `mmproj` para la ruta multimodal. vLLM no ofrece soporte nativo completo de GGUF para este caso.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la informacion proporcionada. La unica comparacion verificable es con los pesos originales del propio modelo base:

| Modelo | Parametros | Formato | Licencia | Ejecucion local | Notas |
|---|---|---|---|---|---|
| tencent/WeVisDoc-2B | 406.957.056 (metadatos safetensors) | safetensors | apache-2.0 | Requiere transformers y GPU | Pesos originales, sin cuantizar |
| mradermacher/WeVisDoc-2B-GGUF (esta ficha) | Los mismos que el base | GGUF (11 tipos de cuantizacion) | apache-2.0 | Si, llama.cpp y derivados | Incluye proyector multimodal mmproj |
| Alternativas de vision-lenguaje de tamano similar | no disponible | no disponible | no disponible | no disponible | No se han aportado datos comparables en la informacion disponible |

## Limitaciones y advertencias

- Discrepancia no resuelta en el recuento de parametros: los metadatos safetensors indican ~407 millones, mientras que el nombre del modelo indica 2B. Cualquier planificacion de recursos debe verificar antes el tamano real de los ficheros GGUF descargados.
- Sesgos conocidos: no disponible. No hay evaluacion de sesgos publicada por el autor original ni por el cuantizador.
- Riesgo de alucinacion: no cuantificado. Al no existir benchmarks ni evaluaciones publicadas, no es posible estimar la tasa de error en tareas de generacion o extraccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte multilingue se limita a ingles y chino, sin datos sobre el rendimiento en otras lenguas.
- Cobertura funcional incierta: la model card del repositorio cuantizado no documenta tool calling, razonamiento multi-paso ni modos de pensamiento, por lo que no deben asumirse en produccion sin validacion previa.
- Naturaleza del repositorio: se trata exclusivamente de una conversion de formato realizada por un tercero. Los posibles defectos de cuantizacion (degradacion de calidad en Q2_K, Q3_K_S o IQ4_XS) no estan medidos ni documentados.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria. No se identifican restricciones adicionales, pero conviene verificar los terminos del repositorio del modelo base por si el autor original hubiera anadido condiciones.
- Fecha de publicacion: el repositorio esta fechado en septiembre de 2026 y registra cero descargas y cero valoraciones, por lo que no existe validacion comunitaria de su funcionamiento.
- Estado de los quants ponderados: el autor indica que no hay cuantizaciones con imatrix ni ponderadas, lo que puede traducirse en una calidad ligeramente inferior frente a variantes calibradas en los formatos de baja precision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeVisDoc-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeVisDoc-2B
- Pagina resumen del cuantizador para este modelo: https://hf.tst.eu/model#WeVisDoc-2B-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia generica de uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog tecnico o demo oficial del modelo base: no disponible en la informacion proporcionada.
