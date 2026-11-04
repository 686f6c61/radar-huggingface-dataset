# rpatoliy/qwen2.5-7b-support-bot-lora

## Resumen

`rpatoliy/qwen2.5-7b-support-bot-lora` es un adaptador LoRA (entrenado con QLoRA sobre base de 4 bits) que especializa el modelo instructivo Qwen2.5-7B-Instruct como asistente de atencion al cliente para comercio electronico. Lo desarrolla el usuario de HuggingFace rpatoliy como demostracion de portfolio de un ajuste fino barato: 3.000 ejemplos, una epoca y una unica GPU Tesla T4 de 16 GB en Kaggle, con un tiempo de entrenamiento de 41,4 minutos.

El adaptador no modifica los pesos del modelo base: se distribuye como un conjunto de matrices LoRA de rango 16 que deben cargarse junto con `unsloth/qwen2.5-7b-instruct-bnb-4bit`. Su objetivo es cambiar el estilo de respuesta del modelo base: apertura empatica, pasos numerados y uso de marcadores genericos `{{placeholder}}` (numero de pedido, horario de atencion, URL del sitio) que cada empresa sustituye por sus propios datos.

Es relevante como ejemplo reproducible de pipeline QLoRA con Unsloth y TRL sobre un modelo Apache-2.0, y como referencia de cuanto cambia el comportamiento de un modelo de 7B con un dataset pequeno de dominio (26.872 pares Q/A de Bitext, 27 intenciones). No es un modelo listo para produccion: no hay metricas de evaluacion cuantitativas y el repositorio tiene 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base Qwen2.5-7B-Instruct tiene 7.000 millones aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento uso longitud maxima de secuencia de 1024 tokens. El base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens (dato del modelo base, no verificado en esta ficha) |
| Tipos de cuantizacion | Base cargado en 4 bits (bnb-4bit); el adaptador se entrena y distribuye en fp16/bf16. No se documentan otras cuantizaciones del adaptador |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador PEFT (safetensors, via `peft`); requiere el base `unsloth/qwen2.5-7b-instruct-bnb-4bit` |
| Rango LoRA | r=16, alpha=16, dropout 0 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Dataset de entrenamiento | bitext/Bitext-customer-support-llm-chatbot-training-dataset (CDLA-Sharing-1.0), 3.000 filas de las 26.872 disponibles |
| Hardware de entrenamiento | 1x Tesla T4 16 GB (Kaggle) |
| Tamano del repositorio | 0,0 GB (adaptador de pesos ligeros) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal estandar. El ajuste se realizo con QLoRA: el modelo base se carga cuantizado en 4 bits (variante `unsloth/qwen2.5-7b-instruct-bnb-4bit`) y solo se entrenan las matrices de bajo rango inyectadas en las proyecciones de atencion y MLP (q/k/v/o y gate/up/down). La configuracion es r=16, alpha=16, dropout 0, con `adamw_8bit`, learning rate 2e-4 con scheduler lineal, 10 pasos de warmup, batch efectivo de 16 (4 x 4 de acumulacion de gradientes) y fp16. Se ejecuto una sola epoca, 188 pasos, en 41,4 minutos sobre una T4.

Los datos provienen del dataset sintetico hibrido Bitext de atencion al cliente (26.872 pares Q/A, 27 intenciones). El autor barajo con semilla 42, reservo 12 filas para la prueba antes/despues y uso las siguientes 3.000 para entrenamiento. El prompt de sistema es fijo: "You are the customer support assistant for an online store. Be concise, friendly and give clear next steps." La perdida de entrenamiento bajo de 2,63 en el paso 10 a 0,61 en el paso 180, con una media de 0,841. No se calculo ninguna metrica de evaluacion separada (perplejidad, exactitud, ROUGE ni juicio humano), por lo que la unica evidencia de mejora son los ejemplos cualitativos de `before_after.json`.

## Capacidades

- Generacion de texto conversacional en ingles orientada a atencion al cliente de comercio electronico.
- Apertura empatica: reconoce primero la situacion del cliente, incluso ante mensajes groseros o con faltas de ortografia, y despues estructura la respuesta.
- Respuestas con pasos numerados y proximos pasos claros, segun el prompt de sistema.
- Uso de marcadores genericos `{{Order Number}}`, `{{Login Page URL}}`, `{{Forgot User Key}}` y similares, que la empresa debe rellenar antes de mostrar la respuesta.
- Cobertura de las 27 intenciones del dataset Bitext (cancelaciones, reembolsos, cambios de direccion, reseteo de credenciales, etc.).
- Hereda del modelo base las capacidades generales de Qwen2.5-7B-Instruct (razonamiento, codigo, matematicas, tool calling), aunque el ajuste no las refuerza y puede degradarlas ligeramente en el dominio general.
- No soporta vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada: solo se documenta ingles; el ajuste puede reducir el rendimiento del base en otros idiomas.

## Casos de uso

- Prototipo de chatbot de atencion al cliente para una tienda online: el adaptador genera respuestas con estructura de pasos numerados y marcadores de plantilla, lo que permite integrarlo en un backend que sustituya `{{Order Number}}` o `{{Login Page URL}}` con datos reales del pedido y de la web.
- Base para un ajuste fino propio con datos de marca: al ser un adaptador LoRA sobre un modelo Apache-2.0, un equipo puede partir de este checkpoint, sustituir los marcadores por su tono de voz y reentrenar con su propio corpus de tickets en una sola GPU consumer.
- Generacion de respuestas borrador para agentes humanos: el modelo redacta una primera respuesta empatica y estructurada que el agente revisa y envia, reduciendo el tiempo de composicion en colas de soporte de alto volumen.
- Clasificacion y enrutado de intenciones en un pipeline de soporte: dado que se entreno sobre las 27 intenciones de Bitext, puede usarse como generador de respuestas de referencia para cada categoria antes de derivar el ticket al equipo adecuado.
- Demo educativa de QLoRA con Unsloth: el repositorio documenta configuracion, tiempos y curva de perdida, por lo que sirve como plantilla reproducible para talleres o cursos sobre ajuste fino eficiente en GPUs de 16 GB.
- Generacion de FAQ y macros de soporte: el modelo produce variantes de respuesta para una misma intencion (reembolso, cancelacion, cambio de direccion) que un equipo de contenido puede convertir en macros de helpdesk.
- Evaluacion comparativa de estilos: util para medir cuanto cambia el tono de un 7B con 3.000 ejemplos y una epoca, como referencia en experimentos de alineacion ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no calculo metricas de evaluacion (perplejidad, exactitud, ROUGE, MMLU, HumanEval, GSM8K ni juicio humano). La unica evidencia es cualitativa: 12 preguntas reservadas comparadas antes y despues del ajuste con decodificacion greedy, disponibles en `before_after.json`. La perdida media de entrenamiento fue 0,841.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4 bits ocupa aproximadamente 4-5 GB de pesos; con el adaptador y la cache KV para contexto de 1.024-4.096 tokens, cabe en GPUs de 8-12 GB.
- GPU recomendadas: Tesla T4 16 GB (la usada para entrenar), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A10G, L4, A100 40/80 GB y H100 para mayor throughput.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB con el base en 4 bits; en 8 GB puede requerir cuantizacion adicional o contexto reducido.
- Opciones de despliegue: `peft` + `transformers` (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusionan los pesos y se convierten a GGUF (el adaptador PEFT no se carga directamente en llama.cpp).
- Latencia y throughput: no disponibles. El autor solo reporta 41,4 minutos de entrenamiento en una T4; no hay mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rpatoliy/qwen2.5-7b-support-bot-lora | Adaptador LoRA sobre 7B | 1.024 tokens de entrenamiento (base hasta 32.768) | Atencion al cliente en ingles | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens | Instrucciones generales, multilingue | Apache-2.0 | HuggingFace, ampliamente usado |
| Adaptadores LoRA de soporte al cliente sobre Llama 3.1 8B | 8B | 128.000 tokens (base) | Atencion al cliente | Llama 3.1 Community License | Multiples en HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Instrucciones generales | Apache-2.0 | HuggingFace |

La comparativa cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este adaptador ni una evaluacion comun con los alternativos. La diferencia principal frente al base es estilistica (tono empatico, pasos numerados, marcadores), no de conocimiento.

## Limitaciones y advertencias

- Solo ingles: no se documento ni entreno para otros idiomas; el rendimiento en castellano u otras lenguas no esta evaluado y probablemente sea inferior al del base.
- Dataset sintetico y pequeno: 3.000 ejemplos de una unica fuente (Bitext) y una epoca; el modelo puede sobreajustar al estilo del dataset y generalizar mal a dominios fuera de comercio electronico.
- Sin metricas de evaluacion: no hay perplejidad, exactitud ni juicio humano; la calidad se sustenta en 12 ejemplos cualitativos, insuficiente para validar produccion.
- Riesgo de alucinacion: puede inventar politicas de reembolso, plazos o URLs si los marcadores `{{placeholder}}` no se rellenan con datos verificados; requiere una capa de validacion posterior.
- Marcadores sin rellenar: si el backend no sustituye `{{Order Number}}`, `{{Login Page URL}}`, etc., el usuario final vera texto con llaves, lo que rompe la experiencia.
- Licencia del dataset: Bitext se distribuye bajo CDLA-Sharing-1.0, con condiciones de comparticion que conviene revisar antes de un uso comercial del adaptador derivado.
- Licencia del adaptador: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache-2.0; verificar la cadena completa de licencias en despliegue.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni issues resueltos.
- Contexto de entrenamiento corto (1.024 tokens): conversaciones multi-turno largas pueden degradar la calidad aunque el base soporte ventanas mayores.
- No apto para decisiones automatizadas sin supervision: al ser una demo de portfolio, no hay garantias de robustez ante entradas adversarias ni de cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rpatoliy/qwen2.5-7b-support-bot-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Base cuantizado en 4 bits usado: https://huggingface.co/unsloth/qwen2.5-7b-instruct-bnb-4bit
- Dataset Bitext: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Repositorio GitHub con `before_after.json`: https://github.com/RaviPatoliya008/qwen2.5-7b-support-bot
- Unsloth: https://github.com/unslothai/unsloth
- TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
