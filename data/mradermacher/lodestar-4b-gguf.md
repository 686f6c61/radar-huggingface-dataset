# mradermacher/Lodestar-4B-GGUF

## Resumen

Lodestar-4B-GGUF es la version cuantizada en formato GGUF del modelo startlux-models/Lodestar-4B, publicada por mradermacher, un cuantizador conocido por generar y mantener versiones GGUF de lanzamientos abiertos. El modelo base es un transformer de aproximadamente 4.326 millones de parametros (4,3B) orientado a tareas de toma de decisiones, clasificacion, calibracion y generacion de salidas estructuradas, segun las etiquetas declaradas por el autor. Esta licenciado bajo Apache 2.0 y esta pensado para ejecucion local en hardware de consumo.

La relevancia de esta publicacion es practica: el modelo base solo se distribuye en safetensors, mientras que esta version ofrece hasta trece variantes de cuantizacion GGUF (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB) mas dos ficheros mmproj, lo que permite desplegarlo con llama.cpp, Ollama o LM Studio en GPUs de gama media y en CPU. La presencia de ficheros mmproj (proyector multimodal) apunta a que el modelo base admite entrada de imagenes, aunque la model card del modelo base no esta disponible en la informacion proporcionada para confirmarlo.

No se dispone de datos sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. El repositorio tiene un tamano de 41,0 GB en total y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria declarada; sin detalle en la informacion) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No hay informacion publicada en la documentacion disponible sobre la arquitectura concreta del modelo base (tipo de atencion, uso de MoE, SSM o arquitectura hibrida), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica pista estructural es que el repositorio incluye ficheros mmproj, propios de modelos multimodales con proyector visual, lo que sugiere que Lodestar-4B incorpora un encoder de vision; sin embargo, esto no se puede confirmar con la informacion aportada.

En cuanto al proceso de cuantizacion, el autor indica que se trata de cuantizaciones estaticas (quantize_version 2, convert_type hf, output_tensor_quantised 1). Avisa de que las cuantizaciones ponderadas o con imatrix no estan disponibles en ese momento, y que podrian no publicarse. No se documenta ninguna innovacion tecnica adicional en decodificacion, atencion o entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta `conversational` en el repositorio.
- Toma de decisiones (`decision-making`) como dominio principal declarado.
- Clasificacion (`classification`) de textos o entradas estructuradas.
- Calibracion (`calibration`), es decir, salidas con puntuaciones de confianza presumiblemente mejor ajustadas.
- Generacion de salidas estructuradas (`structured-output`), util para respuestas en JSON u otros formatos parseables.
- Soporte multimodal (vision): inferido de la presencia de ficheros mmproj-Q8_0 y mmproj-f16, no confirmado por la model card del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar categorias y prioridad a incidencias en ingles, aprovechando su entrenamiento especifico en clasificacion y su tamano reducido para procesar lotes con baja latencia.
- Enrutado de decisiones en pipelines automatizados: dado su enfoque en `decision-making`, puede actuar como nodo de decision que, a partir de una entrada de texto, selecciona la siguiente accion de un flujo (por ejemplo, derivar a un humano o resolver automaticamente).
- Extraccion de datos con salida estructurada: generar JSON validable para poblar bases de datos a partir de documentos o correos, gracias a la etiqueta `structured-output`.
- Puntuacion de confianza y calibracion: usar las probabilidades del modelo para priorizar revisiones manuales en sistemas de moderacion o triaje, donde la calibracion importa mas que la creatividad.
- Asistente conversacional local en ingles: desplegado con Ollama o llama.cpp en una GPU de consumo, sirve como chatbot de proposito general con requisitos de privacidad estrictos (sin enviar datos a la nube).
- Procesamiento de documentos con componente visual: si se confirma el soporte multimodal, el modelo podria extraer informacion de capturas o formularios escaneados usando los ficheros mmproj; requiere verificacion previa.
- Evaluacion rapida y prototipado: al ofrecer cuantizaciones desde 2,1 GB, permite iterar sobre hipotesis de clasificacion en portatiles o equipos sin GPU dedicada antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache): Q2_K ~2,1 GB; Q3_K_S ~2,2 GB; Q3_K_M ~2,4 GB; Q3_K_L ~2,6 GB; IQ4_XS ~2,7 GB; Q4_K_S ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_S ~3,2 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB.
- Si se usa la parte multimodal, hay que sumar el proyector: 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- Cabe en GPU de consumo: si. Cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070) ejecuta comodamente Q4_K_M o Q5_K_M. Una RTX 4090 (24 GB) o RTX 3090 permite cargar f16 con contexto amplio.
- GPU de centro de datos: A100, H100 o L40S son innecesarias por VRAM, pero utiles si se necesita alto throughput con muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y, para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Ejecucion en CPU: viable con las cuantizaciones Q4 y Q5, aunque la velocidad dependera del hardware; no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto de Lodestar-4B, por lo que la comparacion se limita a dimensiones verificables o de conocimiento general. Los datos de los modelos alternativos no han sido verificados en esta busqueda y deben contrastarse.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lodestar-4B | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en decision-making, clasificacion y salida estructurada |
| Qwen3-4B | ~4B | no verificado | Apache 2.0 (segun version) | safetensors, GGUF | Referencia generalista de tamano similar |
| Llama 3.2 3B | 3,2B | no verificado | Llama Community License | safetensors, GGUF | Alternativa generalista, licencia no Apache |
| Phi-3.5-mini | 3,8B | no verificado | MIT | safetensors, GGUF | Enfocado a razonamiento y codigo |

No hay datos de rendimiento comparado para Lodestar-4B, de modo que la eleccion frente a estas alternativas no puede justificarse con benchmarks.

## Limitaciones y advertencias

- Modelo de nicho: las etiquetas sugieren un uso especializado (decisiones, clasificacion, calibracion), no un asistente generalista; el rendimiento en tareas abiertas de generacion o codigo es desconocido.
- Idioma: solo ingles declarado. No hay garantias de calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: sin este dato no se puede planificar el uso con documentos largos o conversaciones extensas.
- Riesgo de alucinacion: inherente a cualquier LLM; en tareas de clasificacion y decision puede producir categorias o etiquetas inexistentes si no se restringe la salida.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y publicacion muy reciente; no hay evidencia de terceros sobre su calidad.
- Cuantizaciones de baja calidad: el propio autor advierte de que Q3_K_M es de "lower quality" y que Q2_K reduce la fidelidad; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix o ponderadas: puede implicar una perdida de calidad algo mayor que en modelos que si las ofrecen, sobre todo en niveles bajos.
- Soporte multimodal sin confirmar: los ficheros mmproj existen, pero no hay model card del base que valide el comportamiento vision; probar antes de integrar.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar tambien la licencia y las condiciones del modelo base startlux-models/Lodestar-4B.
- Fecha de creacion anomala (2026) en los metadatos del repositorio; conviene verificar la version real de los ficheros antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lodestar-4B-GGUF
- Modelo base: https://huggingface.co/startlux-models/Lodestar-4B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Lodestar-4B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
