# cooler8/yejin-korean-3b-v25-base

## Resumen

Yejin Korean 3B v2.5 Base es un modelo de lenguaje causal bilingue coreano-ingles desarrollado por el usuario cooler8 y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo base (pretrained), no alineado ni ajustado por instrucciones, con 3.015.355.392 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos densos de ~3B. Su ventana de contexto es de 4096 tokens y utiliza un tokenizador propio de 64.000 entradas optimizado para coreano, un detalle relevante porque la mayoria de tokenizadores multilingues genericos fragmentan el hangul en secuencias de bytes poco eficientes.

El modelo se entrena en dos fases segun la model card: un preentrenamiento sobre una mezcla curada de texto en coreano e ingles, seguido de una fase de annealing con datos de alta calidad orientados a razonamiento y dominios especificos. No se especifican en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; al ser un modelo base, lo esperable es que no las haya.

Su relevancia actual es doble. Por un lado, cubre un nicho poco poblado: modelos densos pequenos con cobertura nativa de coreano, donde las alternativas suelen ser modelos multilingues de mayor tamano o modelos especificos de coreano con licencias mas restrictivas. Por otro lado, su licencia Apache 2.0 permite uso comercial sin friccion, algo que no ofrecen muchos modelos coreanos de referencia. Como contrapartida, el modelo tiene cero descargas y cero likes en el momento de la consulta, no publica benchmarks y su repo contiene unicamente pesos en safetensors, sin cuantizaciones GGUF ni versiones instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (etiqueta `llama` en HuggingFace); numero de capas y cabezas no disponible |
| Parametros totales | 3.015.355.392 (3,02B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en BF16; no hay GGUF ni GPTQ/AWQ publicados) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tokenizador | propio, vocabulario de 64.000 entradas, optimizado para coreano |
| Precision de entrenamiento | BF16 |
| Tamano del repositorio | 6,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 15 de septiembre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer causal denso de tipo decoder-only, con la etiqueta `llama` en el Hub, lo que sugiere una topologia compatible con el ecosistema Llama (RMSNorm, RoPE, SwiGLU, atencion causal). No se publican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si se emplea Grouped Query Attention, por lo que no es posible calcular con precision el tamano del KV cache ni confirmar la compatibilidad exacta con implementaciones optimizadas. La precision declarada es BF16.

El entrenamiento consta de dos etapas descritas de forma cualitativa: un preentrenamiento sobre una mezcla curada de texto coreano e ingles, y una fase posterior de annealing con datos de alta calidad de razonamiento y de dominios especificos. No se especifican el volumen de tokens, la proporcion ko/en, la procedencia del corpus ni la existencia de filtrado o deduplicacion. Tampoco se mencionan tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones como decodificacion especulativa, atencion lineal o arquitecturas hibridas SSM. El elemento diferencial declarado es el tokenizador de 64.000 entradas optimizado para coreano, que reduce la fragmentacion de hangul y, por tanto, el coste por token en ese idioma.

## Capacidades

- Generacion de texto autoregresiva en coreano e ingles, en modalidad de modelo base: completa secuencias, no sigue instrucciones.
- Modelado de lenguaje puro: util para few-shot prompting mediante ejemplos en el propio contexto, no para dialogos conversacionales.
- Cobertura nativa de coreano con tokenizacion eficiente gracias al vocabulario de 64K entradas.
- Capacidad bilingue ko/en declarada por el autor; no se documenta comportamiento en otros idiomas.
- Razonamiento y conocimiento de dominio: la model card menciona una fase de annealing con datos de razonamiento y dominios especificos, aunque sin metricas que lo respalden.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruct y no hay plantilla de chat publicada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ventana de contexto limitada a 4096 tokens, sin extension documentada via RoPE scaling.

## Casos de uso

- Punto de partida para fine-tuning supervisado en coreano: al ser un modelo base de 3B con licencia Apache 2.0, es un candidato razonable para SFT sobre datos propios de atencion al cliente, soporte tecnico o dominio legal coreano, con un coste de ajuste bajo (una sola GPU de 24 GB es suficiente en BF16 con optimizaciones de memoria).
- Continuacion de texto y autocompletado en coreano: el tokenizador de 64K entradas reduce el numero de tokens por palabra respecto a tokenizadores multilingues genericos, lo que abarata el coste por caracter generado en tareas de redaccion asistida o autocompletado de formularios.
- Generacion aumentada por recuperacion (RAG) sobre documentacion coreana: con 4096 tokens de contexto se pueden insertar entre 3 y 6 fragmentos de documento mas la consulta; el modelo base puede usarse para la fase de generacion si se le da el contexto en formato de completado.
- Traduccion asistida ko-en y en-ko: util como componente de un pipeline de traduccion con ejemplos few-shot, o como modelo a destilar tras un fine-tuning especifico de traduccion.
- Investigacion en tokenizacion coreana: al publicar un vocabulario propio de 64K optimizado para hangul, sirve como linea base para estudiar la relacion entre granularidad del tokenizador y perplejidad en coreano frente a modelos multilingues como mT5 o Qwen.
- Prototipado y experimentacion en local: con 3B parametros y pesos BF16 de 6 GB, cabe en GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) en cuantizacion de 8 o 4 bits, lo que permite iterar sin infraestructura en la nube.
- Clasificacion y etiquetado de texto coreano mediante scoring de secuencias: al ser un modelo base, se puede usar la log-verosimilitud de completados candidatos para tareas de analisis de sentimiento o clasificacion sin necesidad de cabezal adicional.
- Generacion de datos sinteticos en coreano: util para aumentar corpus de entrenamiento en un idioma con menos recursos publicos que el ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni perplexidad, ni metricas especificas de coreano como KoLM Eval o HAE-RAE), y el repositorio no adjunta informes de evaluacion. Tampoco existen resultados de terceros, dado que el modelo registra cero descargas en el momento de la consulta. Cualquier cifra de rendimiento que se atribuya a este modelo debe considerarse no verificada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 6,0 GB (coincide con el tamano del repositorio). En FP16, practicamente identico.
- Cuantizacion de 8 bits: alrededor de 3,2 GB de pesos.
- Cuantizacion de 4 bits (Q4_K_M o equivalente): alrededor de 1,9-2,1 GB de pesos.
- KV cache: no calculable con precision porque se desconocen el numero de capas, cabezas y si hay GQA. Como referencia orientativa para un transformer denso de ~3B con 4096 tokens de contexto, el cache suele situarse entre 0,5 y 1,5 GB en BF16; en cuantizacion de 4 bits se reduce en torno a un factor de 4.
- VRAM total estimada para inferencia: ~7-8 GB en BF16 a 4096 tokens; ~4-5 GB en 8 bits; ~2,5-3,5 GB en 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas para BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10G). Para servicio concurrente con throughput alto, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. En 4 bits funciona en GPUs de 4-6 GB (GTX 1650 4 GB con margen muy justo, RTX 3050 6 GB, RTX 2060 6 GB). En BF16 requiere al menos 8 GB.
- Opciones de despliegue: transformers (soporte garantizado, es el ejemplo de la model card), vLLM y TGI (compatibles si la arquitectura es Llama estandar; conviene verificar el `config.json` antes de desplegar), llama.cpp y Ollama (requieren convertir los pesos a GGUF, ya que no se publica ninguna cuantizacion en el repo).
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion. Como referencia de orden de magnitud para un denso de 3B, en una RTX 4090 con vLLM en FP16 es habitual medir cientos de tokens por segundo por peticion en generacion corta, pero esta cifra no procede de mediciones sobre este modelo y no debe tomarse como dato verificado.
- Almacenamiento: 6,0 GB para el repo completo; el espacio en disco para el servicio es similar al de la VRAM si se usa offloading.

## Comparativa con modelos similares

Los datos de la columna "Yejin Korean 3B v2.5 Base" provienen de la informacion proporcionada. Los de las alternativas provienen de sus model cards publicas y deben verificarse antes de tomar decisiones; la comparativa es estructural porque este modelo no publica benchmarks.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Yejin Korean 3B v2.5 Base | 3,02B | 4096 | ko, en | Apache 2.0 | no disponibles |
| Llama 3.2 3B | ~3,2B | 128.000 | multilingue (8 idiomas oficiales) | Llama 3.2 Community License | si |
| Qwen2.5 3B | ~3,09B | 32.768 nativo (hasta 131.072 con YaRN) | multilingue (29+ idiomas) | Apache 2.0 (segun variante) | si |
| EXAONE 3.5 2.4B | ~2,4B | 32.768 | ko, en | EXAONE AI Model License | si |

Diferencias clave: este modelo es el unico de la tabla con un tokenizador especificamente optimizado para coreano y con licencia Apache 2.0 sin clausulas adicionales, pero tambien el unico sin benchmarks publicados y con la ventana de contexto mas corta (4096 frente a 32K-128K). Para tareas de contexto largo, las alternativas son claramente preferibles por diseno. Si no se requiere contexto largo ni se dispone de datos para fine-tuning, la falta de evaluacion publica es el principal factor de riesgo a la hora de elegirlo frente a cualquiera de las tres alternativas.

## Limitaciones y advertencias

- Es un modelo base, no un modelo instruct: no sigue instrucciones de forma fiable y no dispone de plantilla de chat publicada. Usarlo en un producto conversacional sin un fine-tuning previo producira resultados inconsistentes.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, razonamiento, codigo, matematicas ni tareas especificas de coreano. Cualquier afirmacion de rendimiento seria especulativa.
- Riesgo de alineacion y seguridad no evaluado: al no haber RLHF ni DPO documentados, no hay filtros de contenido ni mitigaciones de toxicidad. No es apto para exposicion directa a usuarios finales sin una capa de moderacion.
- Sesgos conocidos: no disponibles. No se documenta la composicion del corpus de preentrenamiento, por lo que no se puede evaluar el sesgo de genero, politico, geografico o cultural, ni el equilibrio entre registro formal e informal en coreano.
- Riesgo de alucinacion: inherente a cualquier modelo de 3B sin alineacion. Se agrava en dominios especializados y en preguntas factuales sobre entidades poco frecuentes.
- Limitacion de contexto: 4096 tokens es una ventana corta para tareas de resumen de documentos largos, analisis de repositorios de codigo o conversaciones multi-turno extensas. No se documenta extension via RoPE scaling.
- Cobertura idiomatica limitada a coreano e ingles. No hay datos sobre rendimiento en castellano ni en otros idiomas, por lo que no debe asumirse capacidad multilingue general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion sin obligacion de compartir derivados, pero exige conservar los avisos de licencia y el archivo NOTICE si existe. Es la parte mas favorable de la ficha.
- Sin cuantizaciones publicadas: el repositorio contiene unicamente safetensors en BF16. Cualquier despliegue en llama.cpp, Ollama o LM Studio requiere que el usuario realice la conversion a GGUF por su cuenta.
- Trazabilidad limitada del autor: no hay paper, informe tecnico ni repositorio de codigo asociado. El modelo registra cero descargas y cero likes, por lo que no ha pasado por revision de la comunidad.
- Fecha de publicacion anomala (2026) segun los metadatos del Hub; conviene verificar la procedencia y los pesos antes de integrarlos en un pipeline de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v25-base
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Documentacion de transformers para carga de modelos causales: https://huggingface.co/docs/transformers/model_doc/llama
- Demo o espacio interactivo: no disponible
- Otros enlaces relevantes: no se han encontrado en la busqueda web
