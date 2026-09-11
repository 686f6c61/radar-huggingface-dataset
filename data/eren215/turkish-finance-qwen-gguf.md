# eren215/turkish-finance-qwen-gguf

## Resumen

`eren215/turkish-finance-qwen-gguf` es un ajuste fino del modelo Qwen2.5-7B-Instruct orientado al dominio financiero en turco (según se deduce del nombre del repositorio y del fichero de pesos incluido), publicado por el usuario `eren215` en HuggingFace. El autor lo ha entrenado y convertido a formato GGUF utilizando Unsloth, y distribuye únicamente la versión cuantizada en Q4_K_M junto con un Modelfile de Ollama para su despliegue inmediato. No se ha publicado información sobre el conjunto de datos de ajuste, el número de tokens de entrenamiento ni la metodología de alineación empleada.

El modelo cuenta con 7.615.616.512 parámetros reales (aproximadamente 7,6 mil millones) y un repositorio de 4,7 GB, coherente con una cuantización Q4_K_M. Al estar en formato GGUF, está pensado para inferencia en CPU o GPU mediante llama.cpp, Ollama y otros runners compatibles, lo que lo sitúa en la franja de modelos que pueden ejecutarse en hardware de consumo.

Su relevancia actual es limitada y muy específica: se trata de un modelo de nicho para tareas financieras en turco, con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Es un artefacto útil únicamente si se necesita un modelo conversacional pequeño, en turco y ejecutable localmente, asumiendo que la calidad del ajuste no está documentada ni verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (inferida del nombre del fichero y del modelo base; no declarada explicitamente en la model card) |
| Parametros totales | 7.615.616.512 (~7,6 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con escalado YaRN, segun la documentacion publica de Qwen |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado: `Qwen2.5-7B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible. El nombre del repositorio sugiere turco e ingles, pero no se declara oficialmente |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). No se publican pesos en safetensors |
| Tamano del repositorio | 4,7 GB |
| Metadatos del repositorio | tags: gguf, qwen2, llama.cpp, unsloth, endpoints_compatible, region:us, conversational |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card proporcionada. Por el nombre del fichero de pesos (`Qwen2.5-7B-Instruct.Q4_K_M.gguf`) y el tag `qwen2`, se deduce que el ajuste se realizo sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion de tipo grouped-query (GQA) y RoPE. El autor indica que el modelo fue ajustado y convertido a GGUF con Unsloth, una libreria de entrenamiento optimizada que reduce el uso de memoria y acelera el fine-tuning respecto a implementaciones estandar, pero no se especifica si se empleo QLoRA, LoRA o entrenamiento completo.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset financiero, ni si hubo fases de RLHF, DPO o cualquier otro metodo de alineacion. La model card unicamente incluye instrucciones de uso con `llama-cli` y `llama-mtmd-cli` con el flag `--jinja`, la lista de ficheros disponibles y la mencion a un Modelfile de Ollama. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.).

## Capacidades

Las siguientes capacidades se infieren del modelo base y del nombre del repositorio, no de una declaracion explicita del autor, y no han sido verificadas de forma independiente:

- Generacion de texto conversacional en el dominio financiero, presumiblemente en turco.
- Responder preguntas sobre productos financieros, terminologia bancaria e inversiones, segun el sesgo del ajuste fino.
- Capacidades multilingues heredadas de Qwen2.5, que cubre decenas de idiomas con especial enfasis en ingles y chino; el grado de conservacion del turco tras el ajuste no esta documentado.
- Posible soporte de function calling y tool calling, presente de forma nativa en Qwen2.5-7B-Instruct, aunque no confirmado en este ajuste.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades de vision o audio: no aplica; el modelo es exclusivamente de texto.
- Modo `thinking` explicito: no documentado.

## Casos de uso

- Atencion al cliente en banca turca: el modelo puede gestionar conversaciones multi-turno sobre cuentas, tarjetas o productos de inversion en turco, desplegado en local para evitar enviar datos financieros a APIs externas.
- Analisis de sentimiento de noticias financieras turcas: clasificacion de titulares y articulos economicos como positivos, negativos o neutros dentro de un pipeline de monitorizacion de mercado.
- Resumen de informes financieros: condensar comunicados de KAP (Kamuyu Aydinlatma Platformu), balances trimestrales o notas de prensa de empresas cotizadas en Borsa Istanbul.
- Extraccion de entidades y datos estructurados: identificacion de cifras, fechas, ratios y nombres de entidades en documentos financieros, siempre que se valide con reglas o prompts con formato estricto.
- Asistente conversacional para inversores minoristas: respuestas explicativas sobre conceptos como inflacion, tipos de interes o fondos de inversion, con la advertencia de que no sustituye asesoramiento financiero regulado.
- Base para RAG sobre normativa financiera turca: indexar legislacion de BDDK, SPK o CBRT en una base vectorial y usar el modelo como generador de respuestas con citas de los fragmentos recuperados.
- Educacion financiera interna: chatbot para formar a empleados de una entidad en terminologia de productos y procedimientos, ejecutado en infraestructura propia.
- Prototipado rapido en local: al ser un GGUF Q4_K_M de 4,7 GB, permite iterar sobre prompts y flujos conversacionales en un portatil con GPU de gama media sin coste de API.

En todos los casos, el ajuste no esta evaluado publicamente, por lo que se recomienda validar la calidad en el dominio concreto antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K, evaluaciones en turco como TR-MMLU, etc.), y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano del modelo y del fichero publicado; no proceden de mediciones del autor.

- VRAM para el fichero GGUF Q4_K_M: aproximadamente 5,5-7 GB en total, incluyendo el peso del modelo (~4,7 GB) y la cache KV para contextos moderados.
- VRAM para contexto largo: con 32.768 tokens de contexto y cache KV en FP16, se anaden aproximadamente 1,8 GB adicionales, por lo que conviene reservar 8-10 GB.
- VRAM en otras precisiones (no publicadas, conversiones propias): Q8_0 en torno a 8-9 GB; FP16 en torno a 15-16 GB.
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB (RTX 3070, RTX 4060) puede ejecutarse con offload parcial de capas a CPU, a costa de velocidad.
- GPU profesionales: A100 40/80 GB, H100 y L40S lo ejecutan sin problema, aunque estan sobredimensionadas para un modelo de 7,6 mil millones de parametros.
- CPU: al estar en GGUF, puede ejecutarse en CPU con llama.cpp, con velocidades de pocos tokens por segundo segun el numero de nucleos.
- Opciones de despliegue: llama.cpp (`llama-cli -hf eren215/turkish-finance-qwen-gguf --jinja`), Ollama mediante el Modelfile incluido, y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen GGUF de forma nativa; requeririan reconvertir a safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo denso de ~7,6 B en Q4_K_M, una RTX 4090 suele situarse en el rango de 60-100 tokens por segundo, pero no hay medicion publicada para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Rendimiento |
|---|---|---|---|---|---|
| eren215/turkish-finance-qwen-gguf | ~7,6 B | No disponible (base: 32.768) | No declarada | GGUF Q4_K_M | Sin benchmarks publicados |
| Qwen2.5-7B-Instruct (modelo base) | 7,6 B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF (comunidad) | Benchmarks publicos por Qwen; no reproducidos aqui |
| Llama 3.1 8B Instruct | 8,0 B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Benchmarks publicos por Meta; no reproducidos aqui |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | safetensors, GGUF | Benchmarks publicos por Mistral; no reproducidos aqui |

No se dispone de datos que permitan comparar el rendimiento de este ajuste con alternativas del mismo dominio (por ejemplo, otros modelos financieros en turco), porque no hay evaluaciones publicadas ni de este modelo ni de una referencia equivalente en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni descargas, ni valoraciones. La calidad real del ajuste financiero en turco es desconocida.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base Qwen2.5-7B-Instruct es Apache 2.0, la falta de declaracion explicita en el derivado genera incertidumbre juridica para uso comercial. Conviene contactar con el autor antes de desplegarlo en produccion.
- Riesgo alto de alucinacion en dominio financiero: los modelos de ~7 B sin verificacion factual pueden inventar cifras, ratios, nombres de entidades o referencias normativas. Cualquier salida con datos numericos debe validarse contra la fuente original.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste, por lo que no se pueden evaluar sesgos geograficos, politicos, de genero o de clase.
- Idiomas no declarados: aunque el nombre sugiere turco, no se especifica la cobertura linguistica real. Es probable que el ajuste fino haya degradado parcialmente las capacidades multilingues del modelo base.
- Contexto no documentado: no se indica la ventana de contexto efectiva tras el ajuste. Si se necesita contexto largo, habria que validarlo empiricamente.
- Ambito restringido: un modelo financiero no constituye asesoramiento financiero. Su uso en productos regulados (banca, inversion, seguros) puede requerir cumplimiento normativo especifico.
- Fecha de publicacion en los metadatos: el repositorio figura como creado el 11 de septiembre de 2026, una fecha posterior a la consulta, lo que sugiere un posible error en los metadatos de HuggingFace.
- Despliegue limitado por formato: al distribuirse solo en GGUF, no es directamente compatible con stacks que requieren safetensors (vLLM, TGI, TensorRT-LLM) sin una conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eren215/turkish-finance-qwen-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Qwen2.5 (modelo base inferido): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
