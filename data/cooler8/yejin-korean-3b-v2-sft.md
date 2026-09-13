# cooler8/yejin-korean-3b-v2-sft

## Resumen
Yejin Korean 3B v2 SFT es un modelo de lenguaje causal en coreano desarrollado por el usuario cooler8, consistente en un ajuste supervisado (SFT) de ajuste completo sobre el modelo base Yejin Korean 3B v2. Se trata de un transformer decoder-only de aproximadamente 3,02 mil millones de parametros (3.015.362.560 pesos contables en safetensors), con una dimension de 3.072, 28 capas, 24 cabezas de atencion y 8 cabezas KV, un vocabulario propio de 64.000 tokens orientado al coreano y una longitud maxima de secuencia de 4.096 tokens en precision bfloat16.

El problema que aborda es el de disponer de un modelo de instrucciones compacto y especifico para coreano, con plantilla de chat propia y datos de entrenamiento que cubren conversacion multiturno, QA con conocimiento, comprension lectora y uso de herramientas. Su tamano (~3B) lo situa en el rango desplegable en una unica GPU de gama consumer, lo que resulta relevante para escenarios de inferencia local, on-premise o de coste controlado en los que un modelo mayor resultaria inviable.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Los metadatos lo etiquetan con la etiqueta qwen3, lo que sugiere una arquitectura derivada de la familia Qwen3, aunque la model card no confirma explicitamente el backbone base. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni evaluaciones independientes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (autoregresivo); etiquetado como qwen3 en los metadatos |
| Parametros totales | 3.015.362.560 (~3,02 mil millones) |
| Longitud de contexto | 4.096 tokens |
| Dimension del modelo | 3.072 |
| Capas | 28 |
| Cabezas de atencion | 24 (8 cabezas KV, atencion con GQA) |
| Vocabulario | 64.000 tokens (tokenizador coreano propio) |
| Precision de pesos | bfloat16 |
| Tipos de cuantizacion | No se publican versiones cuantizadas; pesos originales en bfloat16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 6,0 GB |
| Plantilla de chat | `<s><|user|>{instruction}<|end|><|assistant|>{response}<|end|></s>` |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso (no MoE) de 3.072 dimensiones, 28 capas y 24 cabezas de atencion con 8 cabezas KV, lo que implica una dimension de cabeza de 128 y atencion con query grouping (GQA) para reducir el coste de la cache KV. El tokenizador es propio, con 64.000 entradas y disenado para coreano, con tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>` delimitando los turnos. La ventana de contexto maxima es de 4.096 tokens, una cifra contenida en comparacion con modelos contemporaneos de tamano similar.

El entrenamiento consistio en un ajuste supervisado de parametros completos (sin LoRA ni adaptadores) distribuido con FSDP sobre 8 GPU NVIDIA H200, durante 3 epocas, con tasa de aprendizaje 2e-5 con schedule coseno, batch size efectivo de 128 (2 por GPU x 8 GPU x 8 de acumulacion de gradiente), weight decay de 0,01 y warmup del 3% de los pasos totales. Los datos de ajuste son conjuntos de instrucciones en coreano de origen sintetico y curado, e incluyen datos de instrucciones, conversacion multiturno, post-entrenamiento, QA fundamentado en conocimiento, uso de agentes y herramientas, y comprension lectora. No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales, ni el numero total de tokens de entrenamiento.

## Capacidades
- Generacion de texto y seguimiento de instrucciones en coreano.
- Conversacion multiturno mediante la plantilla de chat documentada.
- QA fundamentado en conocimiento (knowledge-grounded QA) y comprension lectora sobre textos en coreano.
- Soporte declarado de uso de herramientas y agentes, derivado de la inclusion de datos de tipo agent/tool-use en el entrenamiento; no se especifica el formato exacto de function calling ni si esta disponible en la model card.
- Capacidad multilingue: limitada al coreano (unico idioma declarado en la ficha y en los metadatos).
- Capacidad de ajuste posterior o fine-tuning adicional, al publicarse los pesos completos en safetensors.
- No se documenta modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.

## Casos de uso
- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multiturno con una plantilla de chat definida y mantener el contexto dentro de sus 4.096 tokens, adecuado para flujos de soporte con historiales cortos o resumidos.
- Sistemas RAG sobre documentacion coreana: al haberse entrenado con datos de QA fundamentado en conocimiento, encaja como generador final en pipelines de recuperacion aumentada que inyecten fragmentos de contexto en coreano.
- Resumen y extraccion de informacion de documentos: su capacidad de comprension lectora permite resumir informes, contratos o articulos en coreano y devolver respuestas estructuradas.
- Agentes de automatizacion con llamada a herramientas: la inclusion de datos de tipo agent/tool-use sugiere que puede emitir llamadas a funciones dentro de un orquestador, aunque el formato concreto debe validarse antes de produccion.
- Asistente conversacional desplegado on-premise: al ser un modelo de ~3B bajo Apache 2.0, puede ejecutarse en infraestructura propia sin dependencia de APIs externas y sin restricciones de licencia comercial adicionales.
- Investigacion en PLN coreano: sirve como punto de partida para experimentos de fine-tuning, evaluacion de tokenizadores coreanos o estudio de tecnicas de alineacion en modelos pequenos.
- Tutoria y material educativo en coreano: generacion de explicaciones y preguntas de practica adaptadas a un contexto educativo, con supervision humana del contenido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, KLUE, KoBEST ni de ninguna otra suite, y el repositorio registra 0 descargas y 0 likes, por lo que no existen resultados de terceros.

## Requisitos de hardware
- VRAM estimada en bfloat16/fp16: aproximadamente 6 GB solo para los pesos, mas cache KV y activaciones; en la practica unos 8-10 GB para inferencia comoda.
- Cache KV a contexto completo (4.096 tokens): aproximadamente 0,47 GB en bfloat16, calculada sobre 28 capas, 8 cabezas KV y dimension de cabeza 128.
- VRAM estimada en cuantizacion int8: en torno a 3 GB para los pesos (estimacion, ya que no se publican pesos cuantizados).
- VRAM estimada en cuantizacion de 4 bits: en torno a 1,8-2 GB para los pesos (estimacion).
- Cabe en GPU consumer: si. En bfloat16 es viable en tarjetas con 8-12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); con cuantizacion de 4 bits podria ejecutarse en tarjetas de 4-6 GB.
- GPU profesionales recomendadas: NVIDIA L4, A10, A100, H100 para despliegue con concurrencia; las H200 se emplearon unicamente para el entrenamiento.
- Opciones de despliegue: Transformers (soporte nativo documentado), vLLM y TGI para servicio con batching, y llama.cpp u Ollama previa conversion a GGUF, que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
Datos de las alternativas obtenidos de conocimiento general y no verificados en la busqueda web realizada; deben confirmarse en las fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Yejin Korean 3B v2 SFT | 3.015.362.560 | 4.096 tokens | Apache 2.0 | Coreano, instrucciones |
| Qwen2.5-3B-Instruct | ~3,09 mil millones (no verificado) | 32.768 tokens (no verificado) | Apache 2.0 (no verificado) | Multilingue general |
| Llama-3.2-3B-Instruct | ~3,21 mil millones (no verificado) | 128.000 tokens (no verificado) | Llama 3.2 Community License (no verificado) | Multilingue general |
| EXAONE-3.5-2.4B-Instruct | ~2,4 mil millones (no verificado) | 32.768 tokens (no verificado) | EXAONE AI Model License (no verificado) | Coreano, instrucciones |

Frente a estas alternativas, el modelo destaca por su licencia Apache 2.0 sin restricciones comerciales y por un tokenizador especificamente coreano, pero queda por detras en longitud de contexto (4.096 tokens frente a ventanas de 32K o mas) y carece de evaluaciones publicadas que permitan comparar su calidad real.

## Limitaciones y advertencias
- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento real del modelo en ninguna tarea.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin informes de terceros ni issues publicos.
- Modelo limitado al coreano; no se declara soporte de otros idiomas, por lo que su uso en castellano o ingles no esta respaldado.
- Ventana de contexto reducida (4.096 tokens), lo que limita tareas de documento largo y conversaciones extensas sin tecnicas de resumen o recuperacion.
- No se publican versiones cuantizadas: cualquier despliegue en GGUF, GPTQ o AWQ requiere conversion propia y validacion de calidad.
- Riesgo de alucinacion inherente a los modelos de ~3B, especialmente en QA fundamentado en conocimiento y en respuestas factuales sobre dominios no cubiertos por los datos de ajuste.
- Uso de datos sinteticos en el SFT, lo que puede introducir sesgos o estilos artificiales y una cobertura desigual de dominios.
- La model card no enlaza el modelo base (Yejin Korean 3B v2) ni detalla su procedencia, composicion exacta del dataset ni numero de tokens de entrenamiento.
- Discrepancia potencial entre la etiqueta qwen3 de los metadatos y la arquitectura descrita como transformer decoder-only generico; conviene verificarlo antes de asumir compatibilidad con herramientas de la familia Qwen.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero no exime de responsabilidad sobre el contenido generado ni sobre el cumplimiento normativo del caso de uso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v2-sft
- Modelo base (Yejin Korean 3B v2): no disponible, la model card no lo enlaza
- Paper o informe tecnico: no disponible
- Repositorio de codigo o demo: no disponible
- Otros enlaces: la busqueda web no devolvio resultados relevantes (unicamente un enlace a WhatsApp Web, sin relacion con el modelo)
