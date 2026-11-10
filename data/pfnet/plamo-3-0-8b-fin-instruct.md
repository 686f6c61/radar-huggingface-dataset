# pfnet/plamo-3-0.8b-fin-instruct

## Resumen

PLaMo-3-0.8B-Fin-Instruct es un modelo de lenguaje causal decoder-only especializado en el dominio financiero y orientado al idioma japones, desarrollado por Preferred Networks, Inc. (PFN). Se obtiene a partir de un modelo base de la familia PLaMo-3 mediante preentrenamiento continuado sobre corpus financieros, seguido de ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO). Con 890.344.960 parametros totales (aproximadamente 0,89 mil millones), es un modelo compacto de instrucciones disenado para tareas del sector financiero japones.

La relevancia del modelo reside en su combinacion de un contexto muy amplio, de 262.144 tokens, con un tamano reducido que lo hace desplegable en hardware modesto. Incorpora un modo de razonamiento explicito delimitado por los tokens especiales `<|plamo:begin_think:plamo|>` y `<|plamo:end_think:plamo|>`, y sigue el formato de chat de PLaMo-3. Esta pensado como componente especializado dentro de aplicaciones financieras, no como asistente de proposito general.

El modelo se distribuye en formato safetensors con BF16 como tipo tensorial, requiere `transformers>=5.0.0` y utiliza codigo personalizado (`trust_remote_code=True`). Su licencia es la PLaMo Community License, que exige contacto con PFN para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | japones (ja) |
| Licencia | PLaMo Community License |
| Formato de pesos | safetensors |
| Tipo tensorial | BF16 |
| Libreria | transformers (>=5.0.0) |
| Tokenizer | PLaMo-3 tokenizer (`tokenizer.jsonl`, `tokenization_plamo.py`) |
| Tamano del repositorio | 1,8 GB |
| Formato de chat | PLaMo-3 chat format |
| Requisitos | python>=3.10.0, numpy>=1.26.4, numba>=0.60.0, torch>=2.6.0,<=2.9.0, transformers>=5.0.0, accelerate |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con atencion estandar; no se documenta en la informacion disponible el uso de mecanismos alternativos como MoE, SSM o atencion lineal. El modelo parte de una base de la familia PLaMo-3 y se somete a un pipeline de tres etapas: preentrenamiento continuado sobre corpus financieros, ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO). No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de las etapas de alineamiento.

La innovacion tecnica destacable es la incorporacion de un bloque de razonamiento explicito en la generacion: la respuesta se estructura en un bloque delimitado por `<|plamo:begin_think:plamo|>` y `<|plamo:end_think:plamo|>`, seguido de la respuesta final terminada por `<|plamo:tag|>`. El tokenizer es el de PLaMo-3, distribuido en el propio repositorio. El contexto de 262.144 tokens es notable para un modelo de este tamano y habilita el procesamiento de documentos financieros extensos.

## Capacidades

- Generacion de texto en japones con enfasis en el dominio financiero.
- Razonamiento explicito mediante bloque de pensamiento delimitado por tokens especiales.
- Respuestas conversacionales siguiendo el formato de chat de PLaMo-3.
- Procesamiento de contexto largo (hasta 262.144 tokens), adecuado para documentos extensos.
- Comprension y generacion de contenido sobre conceptos financieros (por ejemplo, la definicion de PER citada en la model card).
- Ajuste por instrucciones (SFT) y alineamiento por preferencias (DPO), lo que favorece respuestas acordes a instrucciones del usuario.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al japones segun la model card.

## Casos de uso

- Consultas sobre conceptos financieros basicos: el modelo responde a preguntas como definiciones de indicadores (por ejemplo, PER) en japones, aprovechando su ajuste sobre corpus financieros y su formato de respuesta con razonamiento explicito.
- Analisis de documentos financieros extensos: gracias a su ventana de 262.144 tokens, puede procesar informes anuales, prospectos o memorandos completos en una sola pasada sin necesidad de fragmentacion.
- Extraccion y resumen de informacion de informes corporativos: el modelo puede condensar secciones de estados financieros o notas explicativas en japones para revision humana posterior.
- Asistencia interna a analistas: como componente de una herramienta interna, puede generar borradores de explicaciones o glosarios financieros que un analista revisa y valida.
- Clasificacion y etiquetado de textos financieros: puede emplearse en pipelines de procesamiento por lotes para categorizar noticias o comunicados en japones, con validacion humana de los resultados.
- Prototipado rapido en entornos con hardware limitado: su tamano de 0,89 mil millones de parametros permite desplegarlo en GPUs de consumo para pruebas de concepto antes de escalar a modelos mayores.
- Generacion de FAQ financieras: puede alimentar bases de conocimiento de preguntas frecuentes sobre productos y terminos financieros, con revision humana obligatoria por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,8 GB solo para pesos (890 millones de parametros a 2 bytes por parametro), mas memoria para el contexto KV; con contexto muy largo la memoria de cache crece de forma significativa.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,45 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090 para contextos moderados; para aprovechar los 262.144 tokens de contexto se recomienda hardware con mayor memoria (A100, H100) o tecnicas de atencion eficiente.
- Cabe en GPU de consumo: si, para contextos habituales; el contexto maximo puede exceder la memoria de GPUs de gama media.
- Opciones de despliegue: carga directa con `transformers` (segun la model card, con `trust_remote_code=True`, `dtype=torch.bfloat16` y `device_map="auto"`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| PLaMo-3-0.8B-Fin-Instruct | 890.344.960 | 262.144 | japones | PLaMo Community License | Finanzas (japones) |
| PLaMo-3 base (0.8B) | no disponible | no disponible | japones | no disponible | Proposito general |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la competencia, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en finanzas: no es un asistente de proposito general; fuera del dominio financiero debe evaluarse en la tarea concreta antes de usarlo.
- Mayor propension a la alucinacion: al ser un modelo pequeno, retiene menos conocimiento factual que modelos mayores y puede generar texto fluido pero factualmente incorrecto. Deben verificarse las afirmaciones factuales y numericas contra fuentes autoritativas.
- Alineamiento de seguridad menos fiable a este tamano: puede generar contenido danino, ofensivo o violento; se recomienda aplicar filtrado de contenido.
- No constituye asesoramiento profesional: las salidas no son asesoramiento legal, financiero, fiscal ni de inversion, y no deben presentarse como tal ni usarse para tomar decisiones de inversion en nombre del usuario.
- Idioma: entrenado y probado en japones; el soporte de otros idiomas no esta garantizado.
- Licencia: PLaMo Community License; el uso comercial requiere revisar la licencia y contactar con PFN mediante el formulario indicado.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y `transformers>=5.0.0`, con versiones de `torch` acotadas (>=2.6.0, <=2.9.0), lo que puede limitar la integracion en entornos con versiones fijas.
- Ausencia de datos publicos de benchmarks: dificulta la evaluacion comparativa previa al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/pfnet/plamo-3-0.8b-fin-instruct
- Licencia PLaMo Community (EN): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (JA): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de contacto para uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
- Politica de IA de Preferred Networks (EN): https://www.preferred.jp/en/company/aipolicy/
- Politica de IA de Preferred Networks (JA): https://www.preferred.jp/ja/company/aipolicy/
