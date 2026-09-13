# Codeflux/NeoHorse-1-4B-FP8

## Resumen

NeoHorse-1-4B-FP8 es la version cuantizada a FP8 de NeoHorse-1-4B, un modelo de lenguaje causal de 4.205.751.296 parametros desarrollado por TokenRhythm y empaquetado por Codeflux. El modelo parte de Qwen/Qwen3.5-4B y ha sido post-entrenado especificamente para flujos agente (agent harness), uso de herramientas, generacion de codigo y seguimiento de instrucciones. Esta publicacion concreta no aporta pesos nuevos: aplica cuantizacion FP8 con NVIDIA ModelOpt v0.46.1 sobre los pesos afinados y los redistribuye en formato safetensors bajo licencia Apache-2.0.

El interes tecnico del proyecto reside en su marco de post-entrenamiento orientado a la mejora recursiva (recursive self-improvement, RSI): un routing harness que reparte tareas entre un pool heterogeneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y retroalimenta la mezcla de entrenamiento siguiente. Segun la model card, esta version alcanza una media macro de 64,87 en diez benchmarks frente a 58,94 de Qwen3.5-4B, una mejora de 5,93 puntos.

La ficha se centra en el artefacto FP8: pesos solo de lenguaje (los pesos de vision del modelo original no se incluyen), contexto declarado de hasta 262.144 tokens en el comando de servicio documentado, y despliegue validado por el autor con SGLang v0.5.19 en GPU de la serie Blackwell. El repositorio ocupa 4,9 GB y registra 0 descargas en el momento de la consulta, por lo que se trata de una publicacion muy reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, etiqueta de arquitectura `qwen3_5_text`; no se declara mezcla de expertos (no es MoE) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens, segun el comando de servicio documentado con `--context-length 262144`; no se detalla en la model card si es la longitud maxima entrenada o solo la configurada en despliegue |
| Tipos de cuantizacion | FP8, generada con NVIDIA ModelOpt v0.46.1; no se ofrecen GGUF, AWQ, GPTQ ni otras variantes en este repositorio |
| Idiomas soportados | No disponible (el campo de idiomas de HuggingFace aparece vacio y la model card no los enumera) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP8), libreria `modelopt`; repo de 4,9 GB |

## Arquitectura y entrenamiento

NeoHorse-1-4B es un transformer causal decoder-only derivado de Qwen/Qwen3.5-4B, afinado por TokenRhythm. La model card indica explicitamente que esta publicacion contiene unicamente los pesos de lenguaje: los pesos de vision del modelo base se han eliminado y el modelo se ha reempaquetado para inferencia solo de texto. Ese reempaquetado modifica la configuracion y los nombres de las claves de los tensores, pero no los valores tensoriales resultantes del afinado. No se detallan en la informacion disponible el numero de capas, dimension oculta, numero de cabezas ni el total de tokens de entrenamiento.

El post-entrenamiento se describe como agentic: combina SFT con curriculo guiado por enrutamiento y destilacion on-policy guiada por enrutamiento, con el objetivo de convertir trayectorias de ejecucion en senal de entrenamiento preservando el contexto del harness y de la ejecucion alrededor de cada respuesta. El pipeline de datos incluye eliminacion de duplicados exactos y casi duplicados, descontaminacion respecto a evaluaciones, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado Scene/Goal/Outcome a nivel de subescena. La cuantizacion FP8 se realizo con ModelOpt v0.46.1 en una GPU de la serie Blackwell, usando el dataset de calibracion v6_conversations.json orientado a trabajo agente; el autor afirma no haber observado diferencias de calidad apreciables con SGLang v0.5.19.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, con soporte de plantilla de chat de la familia Qwen.
- Razonamiento explicito: el despliegue documentado usa `--reasoning-parser qwen3`, lo que confirma la presencia de un modo de razonamiento con separacion de la traza de pensamiento.
- Uso de herramientas y function calling: el comando de servicio emplea `--tool-call-parser qwen3_coder`, orientado a llamadas a herramientas en formato de codigo.
- Comportamiento agente multi-paso: el modelo esta post-entrenado sobre trayectorias de ejecucion dentro de un harness con herramientas, con contexto del entorno preservado.
- Generacion y edicion de codigo, uno de los ejes declarados del post-entrenamiento junto con tool use.
- Capacidades multilingues: no disponible; la model card no enumera idiomas soportados.
- Vision: no soportada en esta publicacion, ya que los pesos de vision se eliminaron durante el reempaquetado.
- Audio: no disponible; no se menciona ninguna capacidad de audio.

## Casos de uso

- Agentes de automatizacion de tareas con herramientas: el modelo esta entrenado sobre trayectorias reales de harness y expone un parser de tool calling compatible con SGLang, por lo que puede encadenar llamadas a funciones, leer sus resultados y continuar el razonamiento multi-paso en un mismo contexto.
- Asistente de codigo integrado en el IDE o en CI/CD: dado su enfoque en coding y su formato de llamada a herramientas tipo `qwen3_coder`, encaja en pipelines que necesitan invocar linters, ejecutar tests o consultar repositorios como pasos intermedios.
- Analisis de repositorios y documentos largos: con una ventana configurable de 262.144 tokens, permite cargar arboles de codigo, logs extensos o expedientes completos sin troceado agresivo, siempre que la memoria de la GPU admita la cache KV correspondiente.
- Agente de atencion al cliente con acceso a sistemas internos: el modo conversacional junto con tool calling permite consultar estado de pedidos, bases de conocimiento o APIs internas manteniendo el hilo de la conversacion.
- Extraccion y normalizacion de datos estructurados: el seguimiento de instrucciones y el razonamiento guiado facilitan tareas de conversion de texto libre a JSON o esquemas fijos dentro de un pipeline por lotes.
- Prototipado e investigacion sobre post-entrenamiento agente: al ser un modelo de 4B con pesos abiertos y publicacion asociada, resulta util como banco de pruebas de tecnicas de curriculo guiado por enrutamiento y destilacion on-policy sin requerir grandes clusters.
- Despliegue en GPU de gama alta para evaluacion de agentes: el autor valida SGLang v0.5.19 en hardware Blackwell, lo que permite reproducir el entorno de evaluacion con la misma configuracion de parsers.

## Benchmarks y rendimiento

La informacion proporcionada unicamente incluye la media macro agregada sobre diez benchmarks, sin desglose por prueba, por lo que no es posible presentar una tabla con MMLU, HumanEval, GSM8K u otros resultados individuales.

| Metrica | NeoHorse-1-4B | Qwen3.5-4B | Diferencia |
|---|---|---|---|
| Media macro en 10 benchmarks | 64,87 | 58,94 | +5,93 |
| Benchmark individual (MMLU, HumanEval, GSM8K, etc.) | No disponible | No disponible | No disponible |

El autor indica ademas que no aprecio diferencias de calidad notables entre la version FP8 y el modelo base en FP16/BF16 al servir con SGLang v0.5.19, aunque no aporta mediciones cuantitativas de esa comparacion.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 4,2 GB en FP8 (4.205.751.296 parametros), con un repositorio de 4,9 GB que incluye metadatos y ficheros auxiliares.
- Memoria adicional: la cache KV para 262.144 tokens es el factor dominante. La model card no publica numero de capas, cabezas ni dimension de cabeza, por lo que no es posible calcular un valor exacto; en la practica, la ventana completa exige decenas de GB de VRAM y conviene reducirla o usar tecnicas de paginacion. Cifra concreta: no disponible.
- GPUs recomendadas por el autor: serie Blackwell, entorno en el que se realizo la cuantizacion y las pruebas con SGLang v0.5.19. FP8 tambien esta soportado de forma nativa en Hopper (H100, H200).
- GPU de consumo: con 4,2 GB de pesos, una RTX 4090 (24 GB) o una RTX 5090 pueden alojar el modelo y una ventana de contexto moderada; contextos muy largos requeriran reducir `--context-length` o cuantizar la cache KV. Las estimaciones de VRAM para contextos concretos no estan publicadas, por lo que cualquier cifra mas alla del peso de los pesos seria especulativa.
- Opciones de despliegue: SGLang v0.5.19 es la ruta documentada y validada por el autor. Al proceder de ModelOpt, el artefacto es exportable tambien a TensorRT-LLM. vLLM dispone de soporte FP8 y es una alternativa razonable, aunque no esta confirmada en la model card. llama.cpp y Ollama no son utilizables directamente porque no se publican pesos GGUF.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B-FP8 (esta ficha) | 4,2 B | 262.144 tokens configurados en SGLang | Media macro 64,87 en 10 benchmarks | Apache-2.0 | Pesos FP8 safetensors en HuggingFace |
| NeoHorse-1-4B (modelo base de la cuantizacion) | 4,2 B | No disponible en la informacion proporcionada | Media macro 64,87 en 10 benchmarks (mismo modelo, sin cuantizar) | Apache-2.0 | Pesos en HuggingFace y ModelScope |
| Qwen3.5-4B (modelo de partida del afinado) | ~4 B | No disponible en la informacion proporcionada | Media macro 58,94 en 10 benchmarks | No disponible en la informacion proporcionada | Pesos en HuggingFace |
| Otras alternativas de ~4B (Phi, Llama, Gemma) | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de contexto, licencia ni rendimiento de alternativas de terceros, por lo que la comparacion se limita a los tres modelos de la misma familia implicados en la cadena de derivacion.

## Limitaciones y advertencias

- Idiomas soportados no declarados: no hay lista oficial de idiomas, por lo que el rendimiento fuera del ingles (y posiblemente del chino, herencia de la familia Qwen) es desconocido y debe validarse antes de produccion.
- Riesgo de alucinacion: como cualquier modelo de 4B, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo o cuando usa herramientas y malinterpreta sus resultados.
- Sin desglose de benchmarks: solo se publica una media macro sobre diez pruebas. Sin los resultados individuales no es posible saber en que tareas el modelo es fuerte y en cuales es debil.
- Degradacion por cuantizacion: FP8 reduce precision numerica. El autor afirma no apreciar perdida de calidad, pero no aporta mediciones; conviene comparar contra la version sin cuantizar antes de desplegar en tareas sensibles.
- Sin pesos de vision: el reempaquetado elimina las capacidades multimodales del modelo original, por lo que cualquier caso de uso con imagenes queda descartado.
- Validacion externa inexistente: 0 descargas y 0 likes en el momento de la consulta, publicacion del 12 de septiembre de 2026. No hay reportes independientes de calidad ni de estabilidad.
- Contexto largo costoso: 262.144 tokens de ventana implican un consumo de memoria de cache KV que puede hacer inviable la ventana completa en GPUs de consumo, obligando a recortar contexto o a tecnicas de paginacion.
- Licencia permisiva con matices: Apache-2.0 permite uso comercial, pero el autor del empaquetado no ofrece garantias y el modelo hereda las condiciones del linaje Qwen3.5-4B, que no se detallan en la informacion disponible.
- Herramientas de despliegue concretas: la unica combinacion verificada es SGLang v0.5.19 con los parsers `qwen3` y `qwen3_coder`. Otros servidores pueden requerir configuracion adicional no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codeflux/NeoHorse-1-4B-FP8
- Modelo base de la cuantizacion: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo del que parte el afinado: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub del proyecto: https://github.com/TokenRhythm/NeoHorse
- Modelo en ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-1-4B
- Organizacion en HuggingFace: https://huggingface.co/TokenRhythm
- Sitio de la empresa: https://tokenrhythm.ai/
- Cuenta en X: https://x.com/opensquilla
- Informe tecnico: https://arxiv.org/abs/2609.08183
- NVIDIA Model-Optimizer: https://github.com/NVIDIA/Model-Optimizer
- SGLang: https://github.com/sgl-project/sglang
- Dataset de calibracion v6_conversations.json: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a#file-v6_conversations-json
- Figura de resultados de evaluacion: https://huggingface.co/TokenRhythm/NeoHorse-1-4B/resolve/main/4B_head_fig.jpg
- Resultados de busqueda web: no se encontro ningun enlace relacionado con el modelo. Las consultas devolvieron unicamente paginas de ayuda de YouTube TV y preguntas en Zhihu sin ninguna relacion con NeoHorse, TokenRhythm o Codeflux.
