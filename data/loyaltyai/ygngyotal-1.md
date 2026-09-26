# LoyalTyAI/ygngyotal.1

## Resumen

El modelo identificado como `LoyalTyAI/ygngyotal.1` es un ajuste fino (finetune) del modelo `mistralai/Mistral-Small-24B-Instruct-2501`, publicado por el usuario LoyalTyAI en HuggingFace bajo licencia Apache 2.0. Según los metadatos del repositorio, se trata de un modelo de 24.011.361.280 parámetros (aproximadamente 24B) con arquitectura etiquetada como `mistral3`, pipeline de `text-generation` y pesos en formato `safetensors`, con un tamano de repositorio de 48,1 GB que corresponde a pesos en precision de 16 bits.

La model card del repositorio reproduce integramente el contenido de la ficha de "Dolphin Mistral 24B Venice Edition", un proyecto de dphn.ai desarrollado en colaboracion con Venice.ai cuyo objetivo declarado es ofrecer una version "sin censura" de Mistral 24B. Por tanto, la informacion tecnica disponible describe ese ajuste concreto: un modelo denso de 24B orientado a instrucciones, entrenado sobre 8 GPU B200 proporcionadas por Targon, con una plantilla de chat heredada de Mistral y un enfoque de alineacion delegada al prompt de sistema.

Es relevante ahora porque representa un ejemplo de la familia de modelos autoalojables de 24B que caben en una unica GPU de 80 GB o en configuraciones multi-GPU de consumo con cuantizacion, y porque su propuesta de "control total del system prompt" interesa a equipos que quieren evitar dependencias de APIs propietarias cuyos pesos, versiones y criterios de alineacion cambian sin control del desarrollador. No obstante, el repositorio concreto registra 0 descargas y 0 likes, y su model card no aporta informacion propia sobre el entrenamiento del finetune, por lo que la trazabilidad del ajuste es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, etiquetado como `mistral3` en los tags de HuggingFace |
| Parametros totales | 24.011.361.280 (aprox. 24B) |
| Longitud de contexto | 131.072 tokens segun la configuracion de vLLM incluida en la model card (`--max-model-len 131072`) |
| Tipos de cuantizacion | no disponible; la model card menciona despliegue con Ollama y LM Studio, lo que implica soporte de GGUF, pero no se documentan repositorios ni formatos concretos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | mistralai/Mistral-Small-24B-Instruct-2501 |
| Modalidad declarada | image-text-to-text (tag de HuggingFace); la model card configura vLLM con `--limit-mm-per-prompt '{"image": 10}'` |
| Tamano del repositorio | 48,1 GB |
| Fecha de creacion / actualizacion | 26 de septiembre de 2026 (ambas identicas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura transformer densa de aproximadamente 24.000 millones de parametros, derivada de Mistral Small 24B Instruct 2501 y etiquetada como `mistral3`. El tag `image-text-to-text` y la configuracion multimodal de vLLM (`--limit-mm-per-prompt '{"image": 10}'`) apuntan a capacidades de entrada de imagen, si bien el modelo base declarado (`Mistral-Small-24B-Instruct-2501`) es un modelo de texto, por lo que este punto deberia verificarse contra los pesos reales antes de asumir soporte de vision en produccion.

En cuanto al entrenamiento, la model card indica unicamente que el modelo se entreno sobre 8 GPU B200 proporcionadas por Targon, sin especificar numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia directa. Tampoco se detalla el proceso de destilacion o de ajuste respecto al modelo base. La unica innovacion tecnica mencionada explicitamente es el uso de la plantilla de chat original de Mistral (formato V7-Tekken con `<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]`), mantenida sin cambios, y la recomendacion de emplear temperaturas bajas (aproximadamente 0,15) para la generacion.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de prompt de sistema configurable por el usuario.
- Seguimiento de instrucciones con un tono y unas reglas de comportamiento definidos integramente desde el `system_prompt`.
- Soporte de tool calling / function calling: la model card documenta el arranque de vLLM con `--tool-call-parser mistral` y `--enable-auto-tool-choice`, lo que habilita llamadas a herramientas con seleccion automatica.
- Capacidad de agente y razonamiento multi-paso, derivada del soporte de auto tool choice y de la ventana de contexto de 131.072 tokens.
- Entrada multimodal (imagenes) segun los tags de HuggingFace y la configuracion de vLLM, con un limite configurado de 10 imagenes por prompt.
- Capacidades multilingues: la model card incluye ejemplos con salida en frances, pero no se declara una lista de idiomas soportados.
- No se documenta modo "thinking", soporte de audio ni modos especiales de razonamiento extendido.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en infraestructura propia con vLLM o TGI y mantener conversaciones multi-turno con contexto largo, de modo que el equipo controla version, pesos y datos de usuario sin depender de una API externa.
- Orquestacion de agentes con herramientas: gracias al soporte de auto tool choice y al parser de Mistral, es viable construir agentes que consulten APIs internas, bases de datos o servicios de busqueda encadenando varias llamadas en un mismo flujo.
- Analisis de documentos extensos: con 131.072 tokens de contexto, permite procesar informes, contratos o transcripciones largas sin troceado agresivo, siempre que la VRAM disponible soporte la cache KV correspondiente.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como servicio interno (por ejemplo, endpoint compatible con OpenAI servido por vLLM) para revisiones automaticas, generacion de tests o refactorizaciones, con la salvedad de que no se han publicado benchmarks de codigo.
- Extraccion y clasificacion por lotes: su uso en modo batch con vLLM permite procesar grandes volumenes de texto para extraer campos estructurados o clasificar tickets, aprovechando el throughput del servidor.
- Generacion creativa sin filtros editoriales: util en ficcion, guiones o worldbuilding donde se requiere un modelo que no rechace premisas oscuras o controvertidas; requiere revision humana obligatoria antes de publicacion.
- Atencion al cliente especializada: el system prompt puede configurarse con el tono, las politicas y el catalogo de una empresa concreta, manteniendo el control sobre el comportamiento del asistente.
- Analisis asistido de imagenes (capturas de pantalla, diagramas o documentos escaneados) si se confirma la ruta multimodal en los pesos desplegados, con un maximo configurado de 10 imagenes por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica cuantitativa, y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 48 GB solo para los pesos, mas cache KV; la propia model card advierte de que ejecutar el modelo en GPU requiere mas de 60 GB de memoria de GPU.
- El ejemplo de despliegue de la model card emplea `tensor_parallel_size=8`, es decir, 8 GPU en paralelo, y el entrenamiento se realizo sobre 8 GPU B200.
- GPU de datacenter recomendadas: A100 80 GB, H100 80 GB o B200 en configuracion single-GPU para BF16; multiples A100/H100 para mayor concurrencia o contexto completo.
- Cuantizacion en 8 bits: la huella de pesos baja a aproximadamente 24-26 GB, lo que exige una GPU de 40 GB o superior (A100 40 GB, A6000 48 GB) manteniendo margen para cache KV.
- Cuantizacion en 4 bits (AWQ, GPTQ o GGUF Q4): aproximadamente 13-15 GB de pesos, lo que permite ejecucion en una RTX 4090 o RTX 3090 de 24 GB, aunque con contexto reducido por el coste de la cache KV.
- Despliegue en GPU de consumo: viable unicamente con cuantizacion de 4 o 5 bits; el contexto completo de 131.072 tokens no es realista en una unica GPU de 24 GB.
- Opciones de despliegue documentadas: vLLM (recomendado por el autor, con parser de herramientas de Mistral), SGLang, TGI, Ollama y LM Studio; llama.cpp es probable a traves de GGUF si existe ese formato publicado, aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de su documentacion publica; los valores de rendimiento no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `LoyalTyAI/ygngyotal.1` (Dolphin Mistral 24B Venice Edition) | 24,0B densos | 131.072 tokens segun configuracion de vLLM | Apache 2.0 | Ajuste orientado a eliminar rechazos y delegar la alineacion al system prompt; sin benchmarks publicados en la informacion disponible |
| mistralai/Mistral-Small-24B-Instruct-2501 | 24B densos | 32.768 tokens (modelo base) | Apache 2.0 | Modelo base oficial; alineacion estandar y contexto menor que el declarado en el finetune |
| Mistral Small 3.1 24B | 24B densos | 131.072 tokens | Apache 2.0 | Variante oficial con contexto largo y soporte multimodal declarado |
| Qwen2.5-32B-Instruct | 32,5B densos | 131.072 tokens con extension YaRN | Apache 2.0 | Alternativa de mayor tamano y ampliamente usada en despliegues autoalojados; benchmarks no comparados aqui |

## Limitaciones y advertencias

- Modelo explicitamente "sin censura": la model card propone un system prompt que instruye al modelo a responder sin atender a consideraciones eticas, legales o de seguridad. Esto implica un riesgo alto de generar contenido danino, ilegal o gravemente inapropiado si no se aplican capas de moderacion externas.
- Ausencia de alineacion de seguridad por defecto: el comportamiento del modelo depende casi por completo del system prompt configurado por el operador, lo que traslada toda la responsabilidad de seguridad al equipo que lo despliega.
- Riesgo de alucinacion: no se aportan datos de evaluacion de veracidad ni de tasas de error, y el ajuste orientado a reducir rechazos puede aumentar la tendencia a responder con confianza sobre temas que desconoce.
- Trazabilidad limitada del repositorio: el ID `LoyalTyAI/ygngyotal.1` registra 0 descargas y 0 likes, su model card reproduce integramente la ficha de otro proyecto (Dolphin Mistral 24B Venice Edition) y no documenta el proceso de ajuste propio. Deberia verificarse la procedencia real de los pesos antes de usarlos en produccion.
- Discrepancia no resuelta sobre multimodalidad: el tag `image-text-to-text` y la configuracion de vLLM sugieren entrada de imagen, pero el modelo base declarado es de texto; conviene validar los pesos reales antes de asumir vision.
- Idiomas no documentados: no se declara cobertura linguistica, por lo que el rendimiento fuera del ingles y de los idiomas mayoritarios de Mistral es incierto.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero debe conservarse la atribucion correspondiente y verificarse que los pesos derivados cumplen tambien las condiciones del modelo base.
- Coste de infraestructura: el contexto completo de 131.072 tokens exige una cache KV muy grande y, en la practica, GPU de 80 GB o configuraciones multi-GPU.
- Formato de pesos unico documentado (safetensors): para despliegues en CPU o en hardware limitado habria que generar cuantizaciones propias, ya que no se publican repositorios GGUF oficiales del finetune.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LoyalTyAI/ygngyotal.1
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Web de dphn.ai: https://dphn.ai
- Cuenta de X de dphn: https://x.com/dphnAI
- Chat web de dphn: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de computo del entrenamiento): https://targon.com/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
