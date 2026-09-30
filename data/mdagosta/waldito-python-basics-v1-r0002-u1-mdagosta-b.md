# mdagosta/waldito-python-basics-v1-r0002-u1-mdagosta-b

## Resumen

Waldito Python Basics v1 (identificador completo `mdagosta/waldito-python-basics-v1-r0002-u1-mdagosta-b`) es un modelo de generacion de texto publicado por el usuario mdagosta en HuggingFace. Se trata de un export del proyecto OpenWALDO que reutiliza la arquitectura estandar Llama de tipo causal-language-model de la libreria Transformers, con un tokenizador propio denominado "schema-1" de tipo byte. El modelo tiene 9.541.632 parametros reales (aproximadamente 9,54 millones), lo que lo situa en la categoria de modelos ultraligeros, muy lejos de los LLM convencionales.

El nombre del repositorio sugiere un ajuste orientado a fundamentos de Python ("python-basics"), con un identificador de revision (`r0002`) y un sufijo de unidad (`u1`), lo que apunta a un pipeline de entrenamiento por etapas o incrementos. No se dispone de informacion sobre el dataset, el numero de tokens de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros).

La relevancia de este modelo es principalmente experimental y de investigacion: su tamano minimo permite ejecutarlo en CPU, dispositivos embebidos o entornos con recursos muy limitados, y sirve como banco de pruebas para el formato de exportacion OpenWALDO (con ficheros `BOM.json` y `EU-BOM.json` para trazabilidad y cumplimiento del reglamento europeo de IA). No cuenta con descargas ni interacciones en el momento de redactar esta ficha, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (segun la model card, arquitectura estandar de Transformers) |
| Parametros totales | 9.541.632 (9,54 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | No disponible (tokenizador de bytes "schema-1", potencialmente byte-level y por tanto agnostico al idioma, sin confirmacion oficial) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Segun la model card, el paquete utiliza la arquitectura estandar de modelo de lenguaje causal Llama de la libreria Transformers, acompanada de un tokenizador de bytes propio de OpenWALDO denominado "schema-1". La carga del tokenizador requiere `trust_remote_code=True`, lo que implica que el repositorio incluye codigo Python personalizado para el procesamiento del texto. El repositorio incorpora ademas un fichero `BOM.json` que inventaria cada fichero de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento segun el reglamento europeo de IA (GPAI).

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, la posible aplicacion de tecnicas de ajuste supervisado o alineacion (RLHF, DPO) ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El nombre del modelo y los sufijos de version sugieren un entrenamiento incremental orientado a fundamentos de Python, pero esto no puede confirmarse con los datos disponibles.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de la arquitectura Llama causal.
- Conversacion multi-turno: el tag `conversational` esta presente en el repositorio, lo que indica soporte previsto para dialogos, aunque no hay plantilla de chat documentada.
- Procesamiento a nivel de byte mediante el tokenizador "schema-1", lo que en principio permite manejar cualquier secuencia de bytes, incluidos textos en multiples idiomas y contenido no textual codificado.
- Compatibilidad declarada con text-generation-inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Posible especializacion en fundamentos de Python segun el nombre del modelo, si bien no hay evaluacion publica que lo confirme.
- Tool calling, function calling, razonamiento multi-paso, vision, audio y modo de pensamiento: no disponibles.

## Casos de uso

- Experimentacion educativa con arquitecturas transformer: por su tamano de 9,54 M de parametros, el modelo se puede cargar y entrenar en un portatil o incluso en un cuaderno interactivo, lo que lo hace util para docencia sobre fundamentos de modelos de lenguaje.
- Pruebas de integracion del formato OpenWALDO: los ficheros `BOM.json` y `EU-BOM.json` permiten validar flujos de trazabilidad y divulgacion de contenido de entrenamiento exigidos por la normativa europea de IA en un modelo de bajo coste computacional.
- Validacion de pipelines de despliegue: al ser compatible con text-generation-inference y endpoints, sirve para verificar cadenas de servicio (contenedores, APIs) sin consumir GPU ni presupuesto de inferencia relevante.
- Generacion de texto en dispositivos con recursos muy limitados: escenarios de computacion en el borde (edge) o microcontroladores donde un modelo de miles de millones de parametros no es viable.
- Filtrado, clasificacion o autocompletado de fragmentos de codigo Python en entornos de demostracion, siempre que se valide previamente la calidad real de las salidas, no documentada.
- Base para investigacion sobre tokenizadores de bytes: permite analizar el comportamiento de un esquema byte-level frente a tokenizadores BPE convencionales en tareas multilingues o con alfabetos poco representados.
- Prototipado de agentes simples: dado el tag conversacional, se puede integrar en bucles de agente ligeros para pruebas de concepto, sin esperar razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier precision razonable. En fp32 los pesos ocupan aproximadamente 38 MB; en fp16, unos 19 MB; en int8, unos 10 MB. El estado de la cache KV depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien es viable en CPU, incluidos procesadores de portatiles y placas tipo Raspberry Pi con suficiente memoria RAM.
- Cabe en GPU de consumo: si, en cualquier modelo, desde GTX 1050 o integradas modernas hasta RTX 4090, sin aprovechamiento real de su capacidad de computo.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags. No se documentan soportes para llama.cpp, Ollama, vLLM ni TGI con ficheros GGUF.
- Latencia y throughput estimados: no disponibles. Con 9,54 M de parametros es esperable una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Waldito Python Basics v1 r0002 | 9,54 M | No disponible | No disponible | HuggingFace (0 descargas) |
| SmolLM2-135M | 135 M | 8.192 tokens (segun documentacion publica del autor) | Apache-2.0 | HuggingFace |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache-2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | HuggingFace |

Los modelos de comparacion pertenecen a familias ampliamente documentadas y evaluadas, con licencias permisivas y benchmarks publicos. Waldito Python Basics v1 es aproximadamente 14 veces menor que SmolLM2-135M y no dispone de datos de contexto, licencia ni evaluacion, por lo que la comparacion cuantitativa de rendimiento no es posible con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible afirmar que el modelo sea util para tareas reales de generacion de codigo o conversacion.
- Licencia no declarada: sin licencia explicita, no se puede asumir permiso para uso comercial ni para redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion.
- Requiere `trust_remote_code=True` para cargar el tokenizador, lo que implica ejecutar codigo del repositorio; hay que auditar dicho codigo antes de usarlo en entornos no controlados.
- Idiomas soportados no documentados. Aunque un tokenizador de bytes puede procesar cualquier idioma, el rendimiento efectivo dependera del entrenamiento, del que no hay informacion.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que requieran ventanas largas.
- Riesgo de alucinacion: con solo 9,54 M de parametros y sin datos de alineacion, la fidelidad factual es previsiblemente muy baja.
- Sesgos: no documentados, pero un modelo de este tamano y con datos de entrenamiento desconocidos puede reproducir sesgos de su corpus sin filtros visibles.
- Fecha de publicacion inusual (30 de septiembre de 2026) y cero descargas: no hay retroalimentacion de la comunidad ni evidencia de uso real.
- No se documentan variantes cuantizadas ni compatibilidad con runtimes de inferencia eficientes distintos de Transformers/TGI.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0002-u1-mdagosta-b
- Repositorio relacionado (merge r0000): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-merge
- Python.org: https://www.python.org/
- Machine Learning with Python Tutorial (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/machine-learning-with-python/
- AgentCraft, curso de agentes en Python: https://mahip-xp.vercel.app/learn
- Build a Basic AI Agent From Scratch With Tools: https://www.desplega.ai/how-to/build-a-basic-ai-agent-from-scratch-with-tools
