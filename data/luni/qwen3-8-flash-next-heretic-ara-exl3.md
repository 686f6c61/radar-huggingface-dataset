# Luni/Qwen3.8-Flash-Next-Heretic-ARA-EXL3

## Resumen

Qwen3.8-Flash-Next-Heretic-ARA-EXL3 es una cuantizacion EXL3 del modelo Luni/Qwen3.8-Flash-Next-Heretic-ARA, que a su vez es una variante "decensored" (abliterated) del Qwen/Qwen3.8-Flash-Next desarrollada por el usuario Luni mediante la herramienta Heretic 2.0. El modelo original de Qwen es un transformer de tipo MoE (mixture of experts) con capacidades multimodales de imagen a texto, y esta version aplica una modificacion de pesos orientada a reducir los rechazos (refusals) del modelo base: segun la model card, baja de 40/100 rechazos en el base a 6/100, con una divergencia KL de 0,191 en prompts inofensivos.

La cuantizacion EXL3 esta pensada para ejecutarse con exllamav3 (version 1.6.5 dev, que requiere la arquitectura `qwen4_exp`) y emplea una tabla de n-gramas empaquetada junto a los pesos, ademas de soporte para decodificacion especulativa mediante MTP (multi-token prediction). El repositorio ocupa 92,5 GB y la unica rama publicada (`3.05bpw`) pesa 53,3 GB en pesos, con una tabla de n-gramas de 39,0 GB que se carga en RAM o se transmite desde disco, no en VRAM.

Es relevante para desarrolladores que quieran desplegar un modelo MoE multimodal de gran contexto (128k tokens) en una GPU de 32 GB, sacrificando precision numerica por viabilidad de hardware, y para quienes necesiten un modelo con menores tasas de rechazo en tareas de generacion libre. La licencia es qwen-community-1.0, lo que impone condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), multimodal imagen-texto; arquitectura interna `qwen4_exp` en exllamav3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero la card no detalla el reparto) |
| Longitud de contexto | 131.072 tokens (128k, segun configuracion de TabbyAPI) |
| Tipos de cuantizacion | EXL3 a 3,05 bpw de media (3,08 bpw efectivos); head a 6 bits, MTP a 4 bits, vision a 6 bits, embeddings a 16 bits, tabla de n-gramas incluida |
| Idiomas soportados | en, de, multilingual |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | EXL3 (exllamav3), safetensors; incluye `ngram_embedding.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de Qwen, identificado en la cuantizacion con la arquitectura `qwen4_exp` que exllamav3 necesita reconocer. La model card no detalla el numero de parametros, la composicion del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esos datos corresponden a la ficha del modelo original de Qwen, no incluida en la informacion disponible. Lo que si se documenta es el proceso de "decensoring": Heretic 2.0 ARA modifica los pesos del modelo original para reducir la tasa de rechazos, con una metrica reportada de 6/100 rechazos frente a 40/100 del base y una KL de 0,191 sobre prompts inofensivos, lo que indica una desviacion moderada respecto a la distribucion original.

La innovacion tecnica principal de esta ficha es la cuantizacion EXL3. Se genero con exllamav3 1.6.5 (dev), codebook `mul1` y calibracion por defecto de 250 muestras de 2048 tokens, usando el comando `convert.py -b 3.05 -hq -hb 6 -ngb 6 -mb 4 -vb 6 -eb 16 --out_scales always`. El flag `-hq` asigna mas bits a atencion, experto compartido y router, de modo que la media efectiva queda en 3,08 bpw. Ademas, el paquete incluye una tabla de n-gramas (`ngram_embedding.safetensors`) que se carga en RAM o se transmite desde disco, y soporte de decodificacion especulativa mediante MTP con `draft_num_tokens: 3`.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo Qwen3.8-Flash-Next.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), con la torre de vision cuantizada a 6 bits.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, aunque la card no aporta benchmarks que la cuantifiquen.
- Soporte multilingue: ingles, aleman y otros idiomas (etiqueta `multilingual`).
- Decodificacion especulativa MTP (multi-token prediction) para acelerar la inferencia.
- Tabla de n-gramas integrada para mejorar la coherencia y el rendimiento en generacion.
- Modo "uncensored"/abliterated: menor tasa de rechazos en prompts sensibles (6/100 frente a 40/100 del base).
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Despliegue en GPU de consumo de gama alta: con 32 GB de VRAM y reparto de expertos en RAM del sistema (`cpu_moe_split_experts: 320`), se puede servir el modelo con 128k de contexto en una sola tarjeta, algo inviable con los pesos BF16.
- Asistencia conversacional de contexto largo: la ventana de 131.072 tokens permite mantener historiales extensos o procesar documentos completos en una sola pasada sin truncar.
- Analisis de imagenes con descripcion textual: al ser un modelo imagen-texto, sirve para extraer informacion de capturas, diagramas o documentos escaneados y generar resumenes o respuestas.
- Generacion creativa sin restricciones excesivas: la variante Heretic ARA reduce los rechazos, lo que resulta util en escritura de ficcion, guiones o contenido donde el modelo base se negaria a continuar.
- Prototipado e investigacion sobre cuantizacion extrema: el paquete EXL3 con n-gramas y MTP es un banco de pruebas para medir el impacto de 3 bpw en un MoE multimodal de gran contexto.
- Inferencia local con TabbyAPI: la configuracion YAML documentada permite levantar el modelo como servidor compatible con la API de OpenAI para integrarlo en herramientas de desarrollo.
- Evaluacion de sesgos y seguridad: util para estudiar como cambia la tasa de rechazo y la calidad tras el proceso de abliteration respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la tasa de rechazos (6/100 frente a 40/100 del base) y la divergencia KL de 0,191 en prompts inofensivos, que no constituyen benchmarks de capacidad.

## Requisitos de hardware

- VRAM estimada: 32 GB es suficiente para la rama `3.05bpw` con 128k de contexto, repartiendo parte de los expertos enrutados a RAM del sistema.
- GPU recomendadas: tarjetas de 32 GB como RTX 5090, RTX 4090 de 48 GB modificada o profesionales tipo A100 40 GB; con 24 GB no cabe sin un reparto agresivo a RAM y perdida notable de velocidad.
- Cabe en GPU de consumo de gama alta (32 GB) solo con el esquema `cpu_moe_split_experts` y `cpu_moe_pinned_arena: true`.
- Opciones de despliegue: TabbyAPI con exllamav3 1.6.5 dev (requiere la arquitectura `qwen4_exp`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- La tabla de n-gramas (39,0 GB) se carga en RAM o se transmite desde disco (`ngram_ram: false`), por lo que conviene disponer de RAM del sistema abundante y almacenamiento rapido.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Luni/Qwen3.8-Flash-Next-Heretic-ARA-EXL3 | no disponible (MoE) | 131.072 | EXL3 3,05 bpw | qwen-community-1.0 | Variante abliterated, multimodal, con n-gramas y MTP |
| Luni/Qwen3.8-Flash-Next-Heretic-ARA | no disponible (MoE) | no disponible | BF16 | qwen-community-1.0 | Modelo base de esta cuantizacion, sin comprimir |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | BF16 | qwen-community-1.0 | Modelo original de Qwen, con mayor tasa de rechazos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,05 bpw degrada la precision numerica respecto a BF16; la calidad en tareas de razonamiento complejo, matematicas y codigo puede verse afectada, aunque no se aportan mediciones.
- El proceso de abliteration altera el comportamiento de seguridad del modelo: la reduccion de rechazos implica que puede generar contenido que el modelo original bloquearia, con implicaciones legales y reputacionales en produccion.
- La divergencia KL de 0,191 en prompts inofensivos indica una desviacion no trivial respecto al modelo base; conviene validar el comportamiento en el dominio de aplicacion.
- Riesgo de alucinacion no cuantificado; como en cualquier modelo generativo, requiere verificacion de hechos en usos criticos.
- Idiomas documentados limitados a ingles, aleman y la etiqueta generica `multilingual`; el rendimiento en castellano no esta verificado.
- La licencia qwen-community-1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- Dependencia de una version dev de exllamav3 (1.6.5) y de la arquitectura `qwen4_exp`; la compatibilidad futura no esta garantizada.
- El repositorio es muy pesado (92,5 GB) y la tabla de n-gramas anade 39,0 GB adicionales que deben residir en RAM o disco rapido.
- Solo hay una rama publicada (`3.05bpw`); no existen alternativas de mayor o menor precision en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luni/Qwen3.8-Flash-Next-Heretic-ARA-EXL3
- Modelo base BF16 (Heretic ARA): https://huggingface.co/Luni/Qwen3.8-Flash-Next-Heretic-ARA
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- exllamav3: https://github.com/turboderp-org/exllamav3
