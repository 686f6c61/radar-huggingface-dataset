# mlx-community/Spark-X2.5-4B-OptiQ-4bit

## Resumen

Spark-X2.5-4B-OptiQ-4bit es una cuantizacion de 4 bits en precision mixta, en formato MLX, del modelo denso XHToken/Spark-X2.5-4B. La publica la organizacion mlx-community y la genera la herramienta mlx-optiq, un kit nativo de MLX para cuantizar, ajustar y servir LLM localmente en Apple Silicon sin PyTorch ni cloud. El modelo base es un transformer denso de 4.112.079.360 parametros (4,11 B) entrenado para conversacion, generacion de codigo, uso de herramientas y flujos de agente, con una longitud de contexto nativa de 1.000.000 de tokens y soporte declarado para mas de 200 idiomas.

El problema que resuelve es doble. Por un lado, permite ejecutar un modelo de 4B con contexto muy largo en memoria unificada de un Mac: los pesos ocupan 2,8 GB en disco (3,0 GB de repositorio) frente a los ~8 GB en bf16. Por otro, introduce una cuantizacion sensible a la sensibilidad por capa: de las 216 capas cuantizadas, 107 se mantienen en 8 bits y 109 bajan a 4 bits, con tamano de grupo 64, de modo que el resultado ocupa apenas unos puntos porcentuales mas que un cuantizado uniforme de 4 bits pero conserva precision donde importa.

Es relevante ahora porque Spark-X2.5 es una arquitectura nueva para MLX: el tipo de modelo `spark2_5` no lo conoce mlx-lm de serie, y es necesario instalar e importar `optiq` antes de `mlx_lm.load`. Ademas, la familia emplea atencion hibrida con nueve capas de atencion completa y el resto de ventana deslizante fija de 512 tokens, lo que reduce de forma agresiva el crecimiento del KV cache y hace viable servir prompts de cientos de miles de tokens en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, tipo de modelo `spark2_5` (MLX); atencion hibrida con 9 capas de atencion completa y capas de ventana deslizante de 512 tokens |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 de tokens (nativo, segun model card); en la practica, con 4 bits de KV cache, un Mac de 36 GB sirve ~200.000 tokens de prompt bajo el limite de memoria por defecto |
| Tipos de cuantizacion | Precision mixta 4/8 bits (OptiQ): 216 capas cuantizadas, 107 a 8 bits (sensibles) y 109 a 4 bits (robustas); tamano de grupo 64. Etiqueta "4-bit" referida a la precision predominante |
| Idiomas soportados | Mas de 200 idiomas (segun model card del autor); no se detalla la lista |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (formato cuantizado de MLX); incluye `kv_config.json` para la precision mixta del KV cache y `generation_config.json` |

## Arquitectura y entrenamiento

Spark-X2.5 es un transformer denso de 4,11 B parametros con un esquema de atencion hibrida: solo las nueve capas de atencion completa acumulan KV cache proporcional a la longitud del prompt, mientras que las capas de ventana deslizante mantienen una ventana fija de 512 tokens. Esta combinacion es la que permite anunciar un contexto nativo de 1M de tokens sin un coste de memoria cuadratico. El modelo fue entrenado para conversacion, codigo, uso de herramientas y trabajo de agente, e incorpora un modo de razonamiento (`thinking`) activado por defecto en la plantilla de chat, que emite un bloque `<think>` antes de la respuesta final. La evaluacion upstream se realiza en modo thinking con temperatura 1,0 y top_p 0,95, valores incluidos en `generation_config.json` y aplicados por `optiq serve` salvo que se sobrescriban.

Sobre esta base, mlx-community y mlx-optiq aplican una cuantizacion de precision mixta guiada por sensibilidad. Partiendo de una referencia bf16, se ejecuta un barrido de sensibilidad por divergencia KL sobre una mezcla de calibracion de seis dominios, y se asignan 8 bits a las 107 capas mas sensibles y 4 bits a las 109 restantes, con tamano de grupo 64. El KV cache tambien es de precision mixta por capa (`kv_config.json`): 5 capas a 8 bits y 31 a 4 bits, lo que da aproximadamente 9 KB por token para las capas de atencion completa. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 1M de tokens en la arquitectura).
- Razonamiento explicito en modo `thinking` mediante bloque `<think>`, desactivable con `enable_thinking: false` o `enable_thinking=False` en `apply_chat_template`.
- Generacion de codigo, con un 75,6% de pass@1 en HumanEval medido sobre este cuantizado.
- Matematicas y razonamiento aritmetico: 87,0% en GSM8K.
- Tool calling / function calling: 75,5% en BFCL V3 (variante simple), con soporte en el servidor `optiq serve`.
- Flujos de agente y razonamiento multi-paso: `optiq code` reutiliza el mismo servidor como agente de programacion local.
- Capacidades multilingues: mas de 200 idiomas segun el autor del modelo base.
- Servido con APIs compatibles con OpenAI, Responses y Anthropic Messages mediante `optiq serve`.
- No se documentan capacidades de vision, audio ni modalidades distintas del texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historiales de cientos de miles de tokens, ya que solo las nueve capas de atencion completa hacen crecer el KV cache (unos 9 KB por token a 4 bits), lo que permite conservar contexto de soporte largo sin reentrenar ni resumir.
- Agente de programacion local: `optiq code` expone el modelo como agente sobre el mismo servidor, con tool calling para leer ficheros, ejecutar comandos y aplicar parches, todo en el Mac del desarrollador sin enviar codigo a la nube.
- Analisis de documentos extensos: con contexto de 1M de tokens resulta viable pasar contratos, expedientes o bases de codigo completas y hacer preguntas sobre ellos, aprovechando las capas de ventana deslizante para acotar el coste de memoria.
- Asistente de razonamiento con trazas verificables: activando el modo thinking se obtiene el bloque `<think>` con la cadena de razonamiento antes de la respuesta, util para tareas de matematicas (87,0% en GSM8K) o para auditar como se llego a una conclusion.
- Backend de herramientas para agentes: el soporte de function calling (75,5% en BFCL V3) permite conectarlo a APIs externas, bases de datos o sistemas de ticketing desde un pipeline de agente que consuma la API compatible con OpenAI.
- Procesamiento por lotes de texto multilingue en local: con mas de 200 idiomas declarados y licencia Apache 2.0, sirve para clasificar, resumir o extraer informacion de corpus en varios idiomas en una maquina Apple Silicon, sin coste por token.
- Prototipado e investigacion en MLX: permite evaluar la arquitectura `spark2_5` y el efecto de la cuantizacion OptiQ frente a un cuantizado uniforme de 4 bits, con la misma harness y los mismos prompts.
- Despliegue de bajo consumo en portatiles: 2,8 GB de pesos en disco hacen que quepa en Macs con 8-16 GB de memoria unificada para contextos cortos o moderados.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre este cuantizado frente a un cuantizado uniforme de 4 bits del mismo modelo, con la misma harness y los mismos prompts (MMLU 5-shot 1000, GSM8K, IFEval strict, BFCL V3 simple, HumanEval pass@1, HashHop). El Capability Score es la media de los seis.

| Benchmark | Uniforme-4 | OptiQ-4 (mixto) | Delta |
|---|---|---|---|
| MMLU | 63,1% | 66,8% | +3,7 |
| GSM8K | 84,9% | 87,0% | +2,1 |
| IFEval (strict) | 75,8% | 75,2% | -0,6 |
| BFCL V3 | 70,0% | 75,5% | +5,5 |
| HumanEval | 74,4% | 75,6% | +1,2 |
| HashHop | 1,0% | 8,0% | +7,0 |
| Capability Score | 61,52 | 64,69 | +3,17 |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base en bf16, ni cifras de latencia o throughput.

## Requisitos de hardware

- Exclusivo de Apple Silicon: la libreria es MLX y requiere el paquete `mlx-optiq`; no hay soporte CUDA ni CPU generica documentado.
- Pesos en disco: 2,8 GB (3,0 GB de repositorio), frente a los ~8 GB del modelo en bf16.
- Memoria para KV cache: aproximadamente 9 KB por token a 4 bits, y solo crece en las nueve capas de atencion completa; las capas de ventana deslizante mantienen una ventana fija de 512 tokens.
- Macs consumer: con 8-16 GB de memoria unificada se puede ejecutar con contextos cortos o moderados; un Mac de 36 GB de memoria unificada sirve alrededor de 200.000 tokens de prompt bajo el limite de memoria seguro por defecto.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, MLX no las soporta.
- Opciones de despliegue: `mlx_lm` con `import optiq` previo para inferencia, y `optiq serve --model mlx-community/Spark-X2.5-4B-OptiQ-4bit --kv-config kv_config.json` para servido con clave de cache mixta, tool calling y APIs compatibles con OpenAI, Responses y Anthropic Messages. `optiq lab` ofrece banco de trabajo local (chat, comparativa, cuantizacion, fine-tuning) y `optiq code` un agente de programacion local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Rendimiento publicado |
|---|---|---|---|---|---|
| Spark-X2.5-4B-OptiQ-4bit | 4,11 B (denso) | 1M tokens nativo | Apache 2.0 | safetensors MLX (4/8 bits mixto) | MMLU 66,8%; GSM8K 87,0%; HumanEval 75,6%; Capability Score 64,69 |
| XHToken/Spark-X2.5-4B (base, bf16) | 4,11 B (denso) | 1M tokens nativo | Apache 2.0 | safetensors | No disponible |
| Cuantizado uniforme de 4 bits del mismo modelo | 4,11 B (denso) | 1M tokens nativo | Apache 2.0 | 4 bits uniforme | MMLU 63,1%; GSM8K 84,9%; HumanEval 74,4%; Capability Score 61,52 |
| Alternativas de ~3-4 B (Qwen, Llama, Gemma) | ~3-4 B | Variable segun familia | Distintas (Apache 2.0 y licencias propias) | safetensors, GGUF, MLX | No disponible en la informacion proporcionada |

No se dispone de datos comparativos verificados frente a familias de tamano similar en la informacion proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Requiere `import optiq` antes de `mlx_lm.load`: mlx-lm de serie no reconoce el tipo de modelo `spark2_5` y fallara al cargar.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no es desplegable en GPU NVIDIA ni en servidores x86 convencionales, lo que limita su uso en produccion al ecosistema Mac.
- El modo thinking esta activado por defecto en la plantilla de chat: si se fija un `max_tokens` bajo, la generacion puede consumirse entera dentro del bloque `<think>` sin producir respuesta final.
- HashHop en 8,0% sigue siendo un valor muy bajo, lo que sugiere debilidad en tareas de recuperacion de informacion sobre contextos largos pese al contexto nominal de 1M de tokens; el contexto anunciado no implica recuperacion fiable a esa distancia.
- IFEval empeora ligeramente respecto al cuantizado uniforme (-0,6 puntos), de modo que la mejora de la precision mixta no es uniforme en todas las tareas.
- La etiqueta "4-bit" se refiere a la precision predominante, no a la media ponderada; el consumo real de memoria puede diferir de las estimaciones basadas en 4 bits uniformes.
- No se detalla la composicion del dataset de entrenamiento ni si hubo RLHF o DPO, por lo que no se pueden caracterizar sesgos conocidos ni sesgos de dominio.
- Riesgo de alucinacion propio de un modelo de 4B: en tareas de conocimiento factual o de contexto muy largo conviene verificar las salidas.
- No hay informacion publica sobre cobertura real por idioma dentro de los "200+ idiomas" declarados; el rendimiento fuera del ingles puede degradarse de forma desigual.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales conocidas; conviene verificar igualmente las condiciones del modelo base XHToken/Spark-X2.5-4B.
- El repositorio registra 0 descargas, por lo que no hay evidencia de uso en produccion ni comunidad que reporte fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Spark-X2.5-4B-OptiQ-4bit
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Web del proyecto: https://mlx-optiq.com/
- Guia de la familia Spark-X2.5: https://mlx-optiq.com/docs/spark
- Paquete en PyPI: https://pypi.org/project/mlx-optiq/
- Mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Todos los cuantizados OptiQ: https://mlx-optiq.com/models
- Documentacion: https://mlx-optiq.com/docs/
- Laboratorio: https://mlx-optiq.com/docs/lab/

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su arquitectura; los unicos resultados obtenidos correspondian a generadores de imagenes sin relacion con la ficha.
