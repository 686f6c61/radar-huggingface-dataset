# mradermacher/gemma-4-12B-it-abliterated-negative-emotions-GGUF

## Resumen

`mradermacher/gemma-4-12B-it-abliterated-negative-emotions-GGUF` es una distribucion de cuantizaciones GGUF estaticas del modelo `andreafanfani/gemma-4-12B-it-abliterated-negative-emotions`, un derivado de Gemma 4 de 12B parametros afinado para instrucciones ("it") y posteriormente modificado mediante tecnicas de "abliteration" y de steering de personalidad/emociones orientado a reducir la expresion de emociones negativas. Lo publica mradermacher, un autor conocido en el ecosistema por generar cuantizaciones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles.

El modelo base tiene 11.907.350.576 parametros (aproximadamente 11,9B), lo que lo situa en la gama de 12B. Esta version GGUF incluye tanto pesos de lenguaje cuantizados en multiples niveles (Q2_K a Q8_0) como un suplemento multimodal (`mmproj`), lo que sugiere que el modelo subyacente conserva capacidades de vision. El repositorio ocupa 83,7 GB en total, aunque las descargas individuales son mucho mas manejables (desde 4,9 GB en Q2_K hasta 12,8 GB en Q8_0).

La relevancia de esta ficha es doble: por un lado, documenta una variante "abliterated" (con los mecanismos de rechazo parcialmente eliminados o atenuados) y con steering emocional, lo que tiene implicaciones directas en seguridad y alineacion; por otro, ofrece una via practica para ejecutar un modelo de ~12B en hardware de consumo mediante cuantizacion GGUF. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; detalles de capas y atencion no publicados en la informacion disponible) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (mmproj), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (listado en metadatos de la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y el linaje se infiere que deriva de Gemma 4, la familia de modelos de Google, pero no se especifican el numero de capas, el tipo de atencion, la dimension del estado oculto ni la longitud de contexto. El modelo base original (`andreafanfani/gemma-4-12B-it-abliterated-negative-emotions`) es un derivado "it" (instruction-tuned) sometido a abliteration y a tecnicas de steering de personalidad y emociones, segun las etiquetas `heretic`, `personality-steering`, `emotion-steering` y `reproducible`.

El proceso de "abliteration" consiste en identificar y atenuar las direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, de modo que el modelo responda con mayor permisividad a peticiones que un modelo alineado rechazaria. El steering de emociones negativas, por su parte, busca modular la expresion afectiva del modelo. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2), generando quants estaticos; la model card indica que los quants ponderados/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones, heredado del modelo "it" de Gemma 4.
- Capacidades multimodales: el repositorio incluye un suplemento `mmproj` (multi-modal supplement), lo que indica soporte de entrada visual en el modelo base, aunque no se detalla la naturaleza exacta (imagen, video) en la informacion disponible.
- Modulacion de personalidad y emociones: el modelo ha sido ajustado para reducir la expresion de emociones negativas, segun su nombre y etiquetas.
- Comportamiento menos restrictivo en rechazos, derivado de la abliteration.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration y del steering emocional en las respuestas, comparando su comportamiento con el Gemma 4 original para analizar que direcciones de activacion se ven afectadas y como cambia la tasa de rechazo.
- Experimentacion con personalidad de agentes conversacionales: al modular la expresion de emociones negativas, resulta util para prototipar asistentes con un tono mas neutro o positivo en entornos controlados de investigacion.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S (7,1 GB) y Q4_K_M (7,5 GB) permiten ejecutar un modelo de ~12B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que facilita pruebas offline sin depender de la nube.
- Evaluacion de robustez de filtros: sirve para probar hasta que punto un pipeline de moderacion externo detecta respuestas de un modelo con rechazos atenuados, informando el diseno de capas de seguridad complementarias.
- Analisis de sesgos y comportamiento afectivo: el steering de emociones permite generar respuestas con distinto tono emocional y analizar como varia el contenido, util en estudios de psicologia computacional o linguistica.
- Prototipado de asistentes conversacionales en ingles: con cuantizaciones Q6_K (9,9 GB) o Q8_0 (12,8 GB) se obtiene calidad cercana al original para demos de chatbot de un solo idioma.
- Pruebas de pipelines multimodales: el suplemento `mmproj` permite experimentar con entrada de imagen en llama.cpp, aunque la documentacion no detalla el alcance de la vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - Q2_K: ~4,9 GB de pesos; ~6-7 GB de VRAM total estimada.
  - Q3_K_M: ~6,2 GB de pesos; ~8 GB de VRAM total estimada.
  - Q4_K_S: ~7,1 GB de pesos; ~9 GB de VRAM total estimada.
  - Q4_K_M: ~7,5 GB de pesos; ~9-10 GB de VRAM total estimada.
  - Q5_K_M: ~8,6 GB de pesos; ~11 GB de VRAM total estimada.
  - Q6_K: ~9,9 GB de pesos; ~12-13 GB de VRAM total estimada.
  - Q8_0: ~12,8 GB de pesos; ~15 GB de VRAM total estimada.
  - mmproj: 0,2-0,3 GB adicionales si se usa vision.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4070/4080 (12-16 GB) para Q4_K_M y Q5_K_M; A100/H100 no son necesarias para este tamano, pero permiten mayor throughput y contexto.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB (Q4_K_M) hasta una RTX 4090 (Q8_0). En GPUs de 8 GB conviene usar Q3_K_M o Q4_K_S con contexto reducido o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del hardware, del quant y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-12B-it-abliterated-negative-emotions-GGUF | ~11,9B | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Variante abliterated con steering emocional; solo ingles; incluye mmproj |
| andreafanfani/gemma-4-12B-it-abliterated-negative-emotions | ~11,9B | no disponible | apache-2.0 | safetensors | Modelo base del que deriva esta cuantizacion; mismos sesgos y capacidades |
| Gemma 4 12B it (original, referencia) | ~11,9B | no disponible | licencia Gemma de Google | safetensors | Version alineada sin abliteration; rechazos intactos; comparacion natural para estudiar el efecto del ajuste |
| Otras cuantizaciones GGUF de Gemma 4 12B de otros autores | ~11,9B | no disponible | segun autor | GGUF | Alternativas de quant sin el ajuste de emociones; utiles si se busca comportamiento alineado estandar |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La abliteration reduce o elimina los mecanismos de rechazo del modelo, lo que aumenta el riesgo de generar contenido nocivo, ofensivo o inseguro. No es recomendable su uso en produccion orientada al publico sin una capa de moderacion externa robusta.
- El steering de emociones negativas es una modificacion subjetiva del comportamiento afectivo; no hay garantia de que el modelo mantenga coherencia emocional en conversaciones largas ni de que el efecto persista en todos los dominios.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta variante; al ser un modelo de ~12B, es esperable un riesgo de alucinacion moderado, pero no cuantificado en la informacion disponible.
- Idiomas: solo se declara ingles (`en`). El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Longitud de contexto: no disponible; conviene verificar la configuracion del modelo base antes de disenar flujos con contextos largos.
- Licencia: aunque la model card declara `apache-2.0`, enlaza a la licencia de Gemma 4 de Google, que impone terminos adicionales de uso (incluidas restricciones de uso aceptable). Es imprescindible revisar ambos documentos antes de un uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validacion comunitaria; no hay evidencia de pruebas independientes de calidad o seguridad.
- La model card no documenta el dataset de entrenamiento ni el proceso exacto de abliteration/steering, lo que dificulta la reproducibilidad y la evaluacion de sesgos.
- No hay informacion sobre tool calling, agentes ni modo de razonamiento explicito; no asumir estas capacidades sin verificacion empirica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-12B-it-abliterated-negative-emotions-GGUF
- Modelo base: https://huggingface.co/andreafanfani/gemma-4-12B-it-abliterated-negative-emotions
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-12B-it-abliterated-negative-emotions-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
