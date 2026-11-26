# pranil00/ONIX-Falcon3-10B-Instruct-GGUF

## Resumen

ONIX-Falcon3-10B-Instruct-GGUF es una cuantización en formato GGUF del modelo tiiuae/Falcon3-10B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: reproduce los pesos del Falcon3-10B-Instruct original de TII (Technology Innovation Institute) comprimidos con el esquema Q5_K_M (5,5 bits por peso), lo que reduce el tamaño de los pesos de 20,16 GB en FP16 a 6,93 GB, una reducción del 65,6 %.

El modelo base pertenece a la familia Falcon3, con arquitectura de tipo transformer decoder-only de la familia LLaMA según la model card, y 10.305.650.688 parámetros (10,31 mil millones). Está ajustado para instrucciones (Instruct), por lo que está pensado para conversación, seguimiento de instrucciones y generación de texto en general. La cuantización busca hacer viable su ejecución en hardware de consumo: la model card indica que cabe en 7,61 GB de memoria unificada en Apple Silicon, 8,43 GB de VRAM en GPUs NVIDIA de las series RTX 30/40/50 y 9,61 GB de RAM en CPU con AVX2/AVX-512.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 10B con calidad cercana al original (la model card afirma una retención de calidad del 97,5 %) en equipos de gama alta de consumo; por otro, conviene tratar con cautela los datos de la model card, que mezclan afirmaciones verificables (tamaño del archivo, parámetros) con métricas autoinformadas no contrastadas (la "retención cognitiva" o el "audit report" del motor run-any-model). El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (según model card); modelo base Falcon3 |
| Parametros totales | 10.305.650.688 (10,31 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana óptima indicada para GPU y Apple Silicon); 4.096 tokens en CPU según la model card; contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); única variante publicada en este repositorio |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `tiiuae--Falcon3-10B-Instruct-Q5_K_M.gguf`, 6,93 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión GGUF del modelo tiiuae/Falcon3-10B-Instruct. La model card describe la familia de arquitectura como LLaMA, es decir, un transformer decoder-only con atención multi-cabeza estándar y capas totalmente conectadas; la información disponible no detalla configuraciones concretas como número de capas, dimensión oculta, número de cabezas o tipo de activación. Tampoco se especifican los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), más allá de que se trata de una variante Instruct.

La innovación técnica de este repositorio no está en el entrenamiento, sino en la compresión: la cuantización Q5_K_M de llama.cpp aplica cuantización de bloques con escalas de 5 bits y mezcla de precisión por tensor (los tensores más sensibles se mantienen en mayor precisión), lo que según la model card preserva aproximadamente el 97,5 % de la calidad del modelo FP16. El repositorio incluye además un "DeviceQuant Telemetry Audit Report" generado por el motor run-any-model, que documenta el perfil de memoria en un host Darwin con 16 GB de memoria unificada y aceleración Metal: 40 de 40 capas aceleradas, búfer KV de 640 MB en FP16 y un consumo residente total de 7,61 GB. Estos datos proceden de una única ejecución y deben considerarse indicativos, no una validación independiente.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas del ajuste Instruct del modelo base.
- Razonamiento de propósito general y respuesta a preguntas, en la medida en que lo permite un modelo de 10B.
- Generación de código y tareas de matemáticas básicas: capacidad esperable en un modelo Instruct de este tamaño, aunque no hay datos de benchmarks en la información disponible que la cuantifiquen.
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Compatibilidad con el runner `run-any-model` del autor de la cuantización para sesiones de chat en terminal.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, visión o audio: no disponibles en esta variante.

## Casos de uso

- Asistente de chat local en estación de trabajo: con 6,93 GB de pesos y un consumo residente de unos 7,6 GB en Apple Silicon, se puede mantener una sesión conversacional multi-turno en un portátil con 16 GB de memoria unificada, sin depender de la nube ni de claves de API.
- Prototipado rápido de aplicaciones de generación de texto: al ser un GGUF compatible con Ollama y llama.cpp, permite levantar un endpoint local en minutos para probar prompts, plantillas de chat y flujos de instrucciones antes de invertir en infraestructura.
- Procesamiento por lotes de documentos en CPU: con 9,61 GB de RAM libre y soporte AVX2/AVX-512, se pueden resumir o clasificar lotes de textos en servidores sin GPU, aceptando una ventana de contexto reducida de 4.096 tokens.
- Educación e investigación sobre cuantización: el repositorio sirve como caso de estudio para medir el impacto de Q5_K_M frente a FP16 en un modelo de 10B, comparando calidad y consumo de memoria con el modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local y bajo licencia Apache 2.0, es apto para escenarios donde los datos no pueden salir de la máquina, como borradores internos o análisis de textos confidenciales.
- Generación de código asistida en el editor: integrable mediante LM Studio o llama.cpp en flujos de autocompletado y explicación de código, con la salvedad de que no hay benchmarks publicados que avalen su rendimiento en HumanEval o similares.
- Base para ajuste fino o experimentación: los pesos GGUF no son el formato ideal para entrenamiento, pero el modelo base en safetensors (tiiuae/Falcon3-10B-Instruct) puede usarse con LoRA sobre GPUs de 24 GB o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas internas del proceso de cuantización (tamaño, compresión y retención de calidad estimada), que no son benchmarks de capacidad:

| Metrica | FP16 (base) | Q5_K_M (esta variante) | Cambio |
|---|---|---|---|
| Precisión | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamaño de pesos | 20,16 GB | 6,93 GB | -65,6 % |
| Búfer KV cache | 640 MB | 640 MB | Sin cambio |
| RAM residente total | 20,84 GB | 7,61 GB | -63,5 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 40/40 | Óptimo |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,43 GB de VRAM dedicada en GPUs NVIDIA (series RTX 30/40/50) para una ventana de 8.192 tokens; 7,61 GB de memoria unificada en Apple Silicon (M1 a M5) con Metal; 9,61 GB de RAM libre en CPU x86 con AVX2/AVX-512 para 4.096 tokens.
- GPU recomendadas: RTX 3090, 4080, 4090 y equivalentes de la serie 50 por encima de 8,5 GB de VRAM; en el entorno Apple, cualquier chip M1 o posterior con al menos 16 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en tarjetas con 10-12 GB o más de VRAM (RTX 3080 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). No cabe en GPUs de 8 GB o menos con contexto completo.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el runner `run-any-model` del autor.
- Latencia y throughput: no disponibles. La model card solo documenta que las 40 capas se aceleran en Metal en el host de prueba, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Falcon3-10B-Instruct-GGUF (esta ficha) | 10,31 B | 8.192 tokens (óptimo según model card) | GGUF Q5_K_M, 6,93 GB | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Instruct (base) | 10,31 B | No especificado en la información disponible | Safetensors (FP16/BF16) | Apache 2.0 | Hugging Face, oficial de TII |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Safetensors, GGUF comunitario | Llama 3.1 Community License | Hugging Face, amplia adopción |
| Mistral 7B Instruct v0.3 | 7,24 B | 32.000 tokens | Safetensors, GGUF comunitario | Apache 2.0 | Hugging Face, amplia adopción |

La comparación con Llama 3.1 8B y Mistral 7B se ofrece como referencia de categoría (modelos Instruct de 7-10B con licencia permisiva o semipermisiva); no se dispone de benchmarks que permitan comparar rendimiento real entre ellos y esta variante cuantizada. El punto diferencial de esta ficha es el tamaño reducido del artefacto GGUF y su licencia Apache 2.0, frente a la licencia comunitaria de Llama 3.1.

## Limitaciones y advertencias

- Artefacto derivado y no oficial: la cuantización la publica un usuario individual bajo la etiqueta ONIX, no TII; no hay garantía de que los pesos convertidos reproduzcan fielmente el comportamiento del modelo base.
- Métricas autoinformadas: la "retención de calidad del 97,5 %" y el "audit report" proceden del motor run-any-model del propio autor y no han sido validados de forma independiente.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es previsible que arrastre los sesgos de su corpus de entrenamiento, pero no hay un análisis publicado en esta ficha.
- Riesgo de alucinación: inherente a los modelos de 10B ajustados para instrucciones; la cuantización Q5_K_M puede incrementar ligeramente los errores en tareas de razonamiento largo o matemáticas.
- Limitaciones de contexto: la model card recomienda 8.192 tokens como ventana óptima, por debajo de los 128.000 de Llama 3.1 8B o los 32.000 de Mistral 7B; en CPU se reduce a 4.096 tokens.
- Idiomas: no se declaran idiomas soportados; no se puede asumir un rendimiento equivalente en castellano sin evaluación previa.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una cláusula de exención de responsabilidad absoluta que conviene revisar con el equipo legal antes de un despliegue en producción.
- Madurez del repositorio: sin descargas ni likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Formato GGUF: no es adecuado para entrenamiento o ajuste fino; para esas tareas debe usarse el modelo base en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Falcon3-10B-Instruct-GGUF
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
