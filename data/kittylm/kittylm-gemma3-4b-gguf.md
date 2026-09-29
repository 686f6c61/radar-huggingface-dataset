# KittyLM/kittylm-gemma3-4b-gguf

## Resumen

KittyLM-4B GGUF es la distribucion cuantizada en formato GGUF de KittyLM/kittylm-gemma3-4b, un ajuste fino mediante LoRA sobre google/gemma-3-4b-it orientado a generar respuestas con una personalidad concreta ("kitten-speak", habla de gatito). El repositorio lo publica el usuario KittyLM y su unico archivo es `kittylm-gemma3-4b-q4_k_m.gguf`, pensado para ejecutarse con llama.cpp, Ollama o LM Studio en hardware de consumo.

El modelo hereda del base una arquitectura transformer decoder-only de aproximadamente 3.880 millones de parametros (3.880.263.168 segun los pesos safetensors del modelo original), empaquetados en un repositorio de 2,5 GB gracias a la cuantizacion Q4_K_M. No es un modelo de mezcla de expertos: todos los parametros se activan en cada token. La model card de este repositorio no documenta contexto, idiomas ni resultados de evaluacion; esos datos remiten al repositorio principal de KittyLM y, en ultima instancia, a las especificaciones de Gemma 3 4B de Google.

Su relevancia es acotada y muy especifica: sirve como ejemplo de cadena de publicacion completa (modelo base -> LoRA -> cuantizacion GGUF -> despliegue local) y como banco de pruebas para experimentar con personalizacion de estilo sobre un modelo pequeno. Con 0 descargas y 0 "likes" en el momento de la consulta, no existe validacion externa de su calidad ni de su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-4b-it; no detallada en la model card de este repositorio) |
| Parametros totales | 3.880.263.168 (~3,88 mil millones) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible en la model card; el modelo base google/gemma-3-4b-it documenta ventanas de hasta 128K tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado) |
| Idiomas soportados | No disponible (el modelo base Gemma 3 es multilingue; el finetune no documenta cobertura idiomatica) |
| Licencia | Gemma (terminos de uso de Gemma de Google) |
| Formato de pesos | GGUF (`kittylm-gemma3-4b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo. Por trazabilidad, el base declarado es google/gemma-3-4b-it, un transformer decoder-only de la familia Gemma 3 de Google DeepMind, y sobre el se ha aplicado un ajuste fino LoRA cuyos hiperparametros, numero de pasos y regimen de entrenamiento no se detallan en la informacion disponible (se remiten al repositorio principal KittyLM/kittylm-gemma3-4b).

Si se especifica el origen de los datos de entrenamiento del ajuste: el dataset KittyLM/kittylm-data, que ademas incluye un archivo `system_prompt.txt` que debe aplicarse junto con la plantilla de chat del modelo para obtener el comportamiento previsto. No hay informacion publica en este repositorio sobre volumen de tokens, composicion del corpus, uso de RLHF o DPO, ni sobre tecnicas de decodificacion especulativa o atencion lineal. La unica transformacion documentada en este repositorio concreto es la cuantizacion a Q4_K_M de los pesos del LoRA fusionado.

## Capacidades

- Generacion de texto conversacional: es la funcion principal del modelo, con un sesgo estilistico fuerte hacia el "kitten-speak" inducido por el LoRA.
- Conversacion multi-turno: soportada mediante la plantilla de chat del modelo, siempre que se respete el system prompt de KittyLM.
- Ejecucion local en CPU y GPU a traves de llama.cpp, Ollama y LM Studio, sin dependencia de APIs externas.
- Capacidades heredadas del base google/gemma-3-4b-it (razonamiento, codigo, matematicas, vision, multilingueismo): no verificadas ni documentadas en este repositorio, y potencialmente degradadas por el ajuste de estilo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" explicito: no disponible.
- Capacidades multimodales (vision, audio): no disponible en esta distribucion GGUF.

## Casos de uso

- Chatbots de personaje y acompanamiento conversacional: el ajuste LoRA impone una voz consistente, por lo que encaja en aplicaciones donde el tono ludico importa mas que la precision tecnica.
- Demos y prototipos locales de asistentes con personalidad: al ocupar unos 2,5 GB en disco y caber en GPUs de 6 GB, permite iterar sin coste de API ni conexion a internet.
- Aplicaciones de escritorio offline con privacidad estricta: la inferencia con llama.cpp o LM Studio mantiene todas las conversaciones en la maquina del usuario.
- Investigacion sobre personalizacion de estilo: sirve como caso de estudio reproducible de la cadena LoRA sobre Gemma 3 4B y su posterior cuantizacion.
- Pruebas comparativas de cuantizacion GGUF: util para medir la perdida de fidelidad conversacional entre Q4_K_M y cuantizaciones de mayor precision del mismo modelo base.
- Educacion y talleres sobre despliegue local de LLM: el flujo documentado (descarga del GGUF, `ollama create` con Modelfile, `ollama run`) es un ejemplo minimo de puesta en marcha.
- Juguetes o interfaces de entretenimiento para apps de mascotas y comunidades de nicho: la salida estilizada encaja mejor aqui que en tareas de productividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite explicitamente a la del modelo principal (KittyLM/kittylm-gemma3-4b) para los resultados de evaluacion, y no se ha proporcionado ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones conversacionales para esta distribucion cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB solo para los pesos en Q4_K_M, mas el cache KV (que crece con la longitud de contexto y con el numero de secuencias simultaneas). Una estimacion practica de partida es 3-4 GB con contextos cortos.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (GTX 1660 6 GB, RTX 3060, RTX 4060, RTX 4090). En GPUs de gama alta el modelo queda limitado por ancho de banda, no por capacidad de computo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas. Tambien es viable en CPU con 8 GB de RAM mediante llama.cpp, con velocidades de generacion sensiblemente menores.
- Opciones de despliegue: llama.cpp (`llama-cli -m <archivo>.gguf`), Ollama (creacion de modelo con Modelfile), LM Studio y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM y TGI es limitado o experimental; no hay datos especificos para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| KittyLM/kittylm-gemma3-4b-gguf | ~3,88 mil millones | No disponible en la model card | GGUF Q4_K_M | Gemma | Personalidad "kitten-speak"; 0 descargas; sin benchmarks publicos |
| KittyLM/kittylm-gemma3-4b (modelo base del finetune) | ~3,88 mil millones | No disponible | Safetensors (presumible, no confirmado) | Gemma | Repositorio de referencia para detalles de entrenamiento y evaluacion |
| google/gemma-3-4b-it y sus GGUF (ggml-org, bartowski) | ~3,88 mil millones | Hasta 128K tokens segun documentacion del base | Safetensors, GGUF | Gemma | Modelo original de Google, sin el sesgo estilistico; referencia de comportamiento y de despliegue en Ollama como `gemma3:4b` |

## Limitaciones y advertencias

- Naturaleza del ajuste: es un LoRA de estilo ("kitten-speak"), no una mejora de capacidades. Es esperable una degradacion del rendimiento en tareas de razonamiento, codigo o instrucciones formales respecto al base google/gemma-3-4b-it; no se han publicado evaluaciones que lo cuantifiquen.
- Dependencia del system prompt: el autor indica que debe aplicarse la plantilla de chat y el `system_prompt.txt` de KittyLM/kittylm-data. Omitirlos puede producir salidas incoherentes o fuera de personaje.
- Sin validacion externa: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni informes de terceros.
- Riesgo de alucinacion: inherente a los modelos de este tamano; no se ha publicado ninguna evaluacion de factualidad para este finetune.
- Idiomas: no documentados. Aunque el base Gemma 3 es multilingue, el ajuste de estilo puede degradar idiomas distintos del ingles de forma desigual.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen obligaciones de atribucion y una politica de uso prohibido. Conviene revisar los terminos vigentes antes de desplegar el modelo en un producto.
- Contexto: la ventana efectiva no esta documentada para este finetune; asumir los 128K del base sin verificacion puede provocar degradacion en contextos largos.
- Reproducibilidad: la model card no especifica la version de llama.cpp, la plantilla exacta ni el hash del archivo GGUF.

## Enlaces

- Repositorio HuggingFace de esta distribucion GGUF: https://huggingface.co/KittyLM/kittylm-gemma3-4b-gguf
- Modelo base del finetune: https://huggingface.co/KittyLM/kittylm-gemma3-4b
- Dataset de entrenamiento y system prompt: https://huggingface.co/datasets/KittyLM/kittylm-data
- Modelo original de Google: https://huggingface.co/google/gemma-3-4b-it
- GGUF oficial del base en ggml-org: https://huggingface.co/ggml-org/gemma-3-4b-it-GGUF
- Cuantizaciones GGUF del base por bartowski (espejo en ModelScope): https://www.modelscope.cn/models/bartowski/google_gemma-3-4b-it-GGUF
- Ficha de gemma3:4b en Ollama: https://ollama.com/library/gemma3:4b
- Blog de Unsloth sobre soporte de Gemma 3 (referenciado en los resultados de busqueda): https://unsloth.ai/blog/gemma3
- Imagen de Docker ai/gemma3: https://hub.docker.com/r/ai/gemma3
