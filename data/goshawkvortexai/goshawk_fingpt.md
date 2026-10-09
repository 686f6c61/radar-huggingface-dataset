# GoshawkVortexAI/Goshawk_Fingpt

## Resumen

Goshawk_Fingpt (publicado internamente como FinGPT-Crypto v5) es un ajuste fino mediante LoRA sobre el modelo base Qwen3-8B, desarrollado por el usuario de HuggingFace GoshawkVortexAI (Ayberk Binbir). Su proposito es muy concreto: dado un titular de noticias mas un contexto de mercado (precio, funding rate, regimen de volatilidad, tendencia, alineacion con BTC, etc.), el modelo devuelve un veredicto estructurado en JSON con puntuaciones de conviccion, factores de soporte, preocupaciones y direccion esperada en varios horizontes temporales (1h, 4h, 24h). No es un modelo de proposito general, sino un componente especializado dentro de un pipeline de trading de criptomonedas.

El modelo cuenta con 8.190.735.360 parametros (aproximadamente 8,19 mil millones) y se distribuye unicamente como un archivo GGUF cuantizado en Q8_0 de 8,7 GB, pensado para ejecutarse con Ollama o llama.cpp. El entrenamiento se realizo en Apple Silicon con MLX-LM, partiendo de una version de Qwen3-8B cuantizada a 4 bits durante el entrenamiento, con un adaptador LoRA de rango 8 aplicado sobre 16 de las 36 capas del transformer.

La relevancia de esta ficha es doble: por un lado, ilustra un flujo de trabajo de bajo coste para especializar un LLM de 8B en una tarea financiera muy delimitada; por otro, conviene subrayar que se trata de un experimento de investigacion de un proyecto personal, sin benchmarks publicados, sin descargas ni validacion externa, y con una licencia Apache-2.0 que no exime de los riesgos propios de aplicar un modelo de lenguaje a decisiones financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen3-8B) con adaptador LoRA aplicado sobre 16 de 36 capas |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el Modelfile de referencia fija num_ctx 4096 y el entrenamiento uso max_seq_length 1024 |
| Tipos de cuantizacion | GGUF Q8_0 (8,7 GB) es el unico formato publicado; el entrenamiento se hizo sobre base cuantizada a 4 bits |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el tag "conversational" aparece en HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); no se documentan pesos en safetensors del adaptador LoRA en la model card |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de 8,19B parametros. Sobre esa base se entrena un adaptador LoRA de rango 8 y escala 20, aplicado unicamente a 16 de las 36 capas del modelo. Segun la model card, el entrenamiento se ha ido reanudando de forma incremental a lo largo de cinco iteraciones (v1 a v5); la etapa v5 corresponde a 5000 iteraciones, batch size 1, learning rate 1e-5 y max_seq_length 1024, con una perdida de validacion final de 0,311. Todo el proceso se ejecuto en Apple Silicon mediante MLX-LM, con la base cuantizada a 4 bits durante el entrenamiento.

La innovacion tecnica aqui no esta en la arquitectura, sino en la formulacion de la tarea: el modelo no genera texto libre, sino un objeto JSON con un esquema fijo que incluye refined_conviction, conviction_adjustment, reasoning_summary, concerns, supportive_factors, would_recommend_skip, confidence y un bloque horizons con direccion y confianza para 1h, 4h y 24h. Es decir, se ha especializado un modelo generalista para producir una salida machine-readable consumible directamente por un sistema de trading. No se documentan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de veredictos estructurados en JSON con un esquema fijo orientado a decisiones de trading en criptomonedas.
- Puntuacion de conviccion numerica (refined_conviction, confidence) y ajuste incremental sobre una conviccion previa (conviction_adjustment).
- Razonamiento resumido en lenguaje natural (reasoning_summary) que justifica el veredicto a partir del contexto de mercado recibido.
- Extraccion de factores a favor (supportive_factors) y preocupaciones (concerns) a partir de senales como funding rate, extremos de long/short o riesgo de eventos.
- Prediccion multi-horizonte: direccion y confianza para ventanas de 1 hora, 4 horas y 24 horas.
- Interpretacion de contexto de mercado heterogeneo: precio, funding rate, regimen de volatilidad, tendencia y alineacion con BTC.
- Capacidad conversacional heredada del modelo base (tag "conversational"), aunque no es el caso de uso documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Filtrado automatico de titulares de noticias cripto: el modelo recibe cada titular junto con el contexto de mercado del momento y devuelve un veredicto JSON que permite descartar rapidamente las noticias sin impacto y priorizar las que generan senal.
- Capa de ajuste sobre una senal algoritmica existente: un sistema de trading ya produce una conviccion base; el modelo la refina con conviction_adjustment y refined_conviction, incorporando informacion cualitativa de noticias que la senal cuantitativa no captura.
- Analisis multi-horizonte en un panel de control: el bloque horizons permite mostrar en un dashboard la direccion esperada a 1h, 4h y 24h con su nivel de confianza, lo que facilita decisiones escalonadas de entrada y salida.
- Enriquecimiento de datasets para backtesting: al ejecutarse sobre series historicas de titulares y contexto de mercado, genera etiquetas estructuradas que pueden usarse para entrenar o evaluar modelos de clasificacion posteriores.
- Monitorizacion de regimen de volatilidad y funding: los campos concerns y supportive_factors hacen explicito cuando el mercado se acerca a extremos de posicionamiento (por ejemplo, crowding en long/short), lo que sirve como alerta temprana.
- Prototipado local de asistentes financieros: gracias al formato GGUF Q8_0 y a un Modelfile de Ollama de tres parametros (temperature 0,1, top_p 0,9, num_ctx 4096), es posible levantar un prototipo funcional en un equipo de sobremesa sin infraestructura de GPU dedicada.
- Generacion de explicaciones auditables: el campo reasoning_summary permite registrar por que el sistema recomendo LONG, SKIP o mantener posicion, lo que ayuda en la revision posterior de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una perdida de validacion final de 0,311 para la etapa v5 del entrenamiento, metrica que no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K. No hay datos de evaluacion en tareas financieras especificas, ni comparaciones con FinGPT u otros modelos del dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 pesa 8,7 GB, por lo que se necesitan en torno a 10-11 GB de VRAM considerando pesos y cache KV a 4096 tokens de contexto (estimacion propia a partir del tamano del archivo; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM. Una RTX 3060 de 12 GB, una RTX 4070 Ti, una RTX 4080 o una RTX 4090 (24 GB) pueden ejecutar el modelo en Q8_0. En GPUs con menos de 12 GB habria que recurrir a cuantizaciones menores, que no estan publicadas en este repositorio.
- Cabe en GPU de consumo: si, en modelos con 12 GB de VRAM o mas, siempre que se respete el contexto configurado de 4096 tokens.
- Apple Silicon: el autor entreno el modelo con MLX-LM en Apple Silicon, por lo que es esperable que funcione bien en equipos con memoria unificada de 16 GB o superior; no se aportan medidas concretas de rendimiento.
- Opciones de despliegue: Ollama y llama.cpp son los dos entornos documentados por el autor. El uso con vLLM, TGI u otros servidores de inferencia no esta documentado en la informacion disponible; el formato GGUF tampoco es el nativo de esos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goshawk_Fingpt (FinGPT-Crypto v5) | 8,19B (LoRA sobre 16 de 36 capas) | No disponible (num_ctx 4096 en el Modelfile; max_seq_length 1024 en entrenamiento) | GGUF Q8_0 | Apache-2.0 | 0 descargas, 0 likes en HuggingFace |
| Qwen3-8B (modelo base) | 8,19B | No disponible en la informacion proporcionada | Safetensors y otras variantes (no detallado aqui) | Apache-2.0 | Modelo ampliamente distribuido, con millones de descargas |
| FinGPT (AI4Finance Foundation) | No disponible | No disponible | No disponible | No disponible | Ecosistema open source con modelos, APIs y recursos de despliegue publicados en fingpt.io |

La comparacion directa con FinGPT de AI4Finance no puede cuantificarse con la informacion disponible: se trata de una iniciativa de modelos financieros abiertos basada en LoRA sobre modelos base, con una orientacion mas amplia (analisis de sentimiento, robo-advisor, trading) que la tarea especifica de generacion de veredictos JSON de este modelo. No se dispone de datos de rendimiento de ninguno de los dos que permitan un contraste objetivo.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como un fine-tune de investigacion para un proyecto personal de trading de criptomonedas. No ha pasado por validacion externa ni por un proceso de evaluacion publicado.
- Ausencia total de traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay evidencia de uso en produccion ni reportes de terceros.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar justificaciones plausibles pero incorrectas en los campos reasoning_summary, supportive_factors o concerns, incluso cuando los valores numericos de conviccion sean coherentes con el esquema JSON.
- Desajuste entre entrenamiento e inferencia: el entrenamiento uso max_seq_length 1024, mientras que el Modelfile recomendado fija num_ctx 4096. Superar la longitud vista durante el entrenamiento puede degradar la calidad de las salidas, especialmente si el contexto de mercado es extenso.
- Cobertura limitada del adaptador: el LoRA se aplica solo a 16 de las 36 capas con rango 8, lo que reduce la capacidad de adaptacion respecto a un ajuste completo o a un LoRA de mayor rango.
- Idiomas: no se especifican idiomas soportados ni la composicion linguistica del dataset de entrenamiento, por lo que no hay garantia de un comportamiento correcto en castellano. Toda la documentacion y los ejemplos de salida estan en ingles.
- Ambito restringido: el modelo esta disenado para titulares y contexto de criptomonedas. Aplicarlo a otros dominios financieros o a otros idiomas queda fuera de su alcance documentado.
- Sin garantias de calidad de senal: los valores de conviccion y confianza son salidas de un modelo estadistico, no estimaciones calibradas de probabilidad. No deben interpretarse como probabilidades reales de exito.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones financieras publicadas, lo que impide comparar su calidad con alternativas.
- Licencia: Apache-2.0 permite uso comercial, pero la responsabilidad legal y financiera del uso recae integramente en quien despliega el modelo. El autor declara explicitamente que no constituye asesoramiento financiero.
- Coste de despliegue poco documentado: no se publican cifras de latencia, throughput ni consumo energetico, datos relevantes para dimensionar un sistema en produccion.
- Fecha de publicacion: el repositorio figura como creado y actualizado el 8 de octubre de 2026, por lo que se trata de una publicacion muy reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GoshawkVortexAI/Goshawk_Fingpt
- Perfil del autor en HuggingFace: https://huggingface.co/GoshawkVortexAI
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- MLX-LM (framework de entrenamiento utilizado): https://github.com/ml-explore/mlx-lm
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- FinGPT (AI4Finance Foundation): https://fingpt.io/
- Descargas de FinGPT: https://fingpt.io/download
- Organizacion FinGPT en HuggingFace: https://huggingface.co/FinGPT
- Ficha de FinGPT en AI/TLDR: https://ai-tldr.dev/tools/fingpt/
