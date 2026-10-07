# Gogeta70/Swift_1.5_Qwen_3.8_27B_Heretic_Uncensored_Lora_Adapter

## Resumen

Este repositorio contiene un adaptador LoRA de "abliteración" (eliminación de rechazos) creado por el usuario Gogeta70 con la herramienta heretic-gguf, aplicado sobre el modelo base ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF. No se trata de un modelo completo, sino de un adaptador de pesos que debe fusionarse o cargarse junto al modelo base; el propio adaptador tiene 1.205.248 parametros segun los datos de safetensors, mientras que el modelo base es una variante de 27B de la familia Qwen 3.8 segun su nomenclatura.

El objetivo del adaptador es reducir la tasa de rechazos del modelo base, es decir, eliminar los mecanismos de seguridad que hacen que el modelo se niegue a responder a determinadas peticiones. Segun la model card, heretic reporto una tasa de rechazo del 16% con una divergencia KL de 0.3059, aunque el autor afirma que en sus pruebas manuales no ha observado ningun rechazo.

Es relevante en el contexto de la investigacion sobre alineacion y seguridad de modelos, ya que documenta un procedimiento de abliteracion reproducible y publica ejemplos de salidas sin filtro. La ficha tecnica disponible es muy limitada: no hay licencia, idiomas ni resultados de benchmarks declarados, y el repositorio ocupa 0.0 GB, lo que confirma que solo contiene el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base tipo transformer (Qwen 3.8, 27B segun nomenclatura); arquitectura exacta del base no disponible |
| Parametros totales | 1.205.248 en el adaptador LoRA; el modelo base es de 27B segun nomenclatura |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se distribuye en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); base en GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) generado con heretic-gguf, una herramienta orientada a la abliteracion de modelos. La tecnica de abliteracion modifica los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de producir respuestas de negativa ante peticiones potencialmente daninas. En este caso el procedimiento se aplico contra ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF, y el autor indica que deberia funcionar sobre cualquier modelo Swift 1.5 basado en Qwen 3.8 27B.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla el rango ni el alpha del adaptador LoRA, ni los hiperparametros usados durante la abliteracion. El unico dato cuantitativo de entrenamiento disponible es la metrica reportada por heretic: tasa de rechazo del 16% y divergencia KL de 0.3059 respecto al modelo base original.

## Capacidades

- Generacion de texto general heredada del modelo base Qwen 3.8 de 27B.
- Reduccion de rechazos: el adaptador elimina las negativas del modelo alineado, incluyendo peticiones sobre quimica, explosivos y ciberseguridad ofensiva, segun los ejemplos de la model card.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque los ejemplos muestran respuestas estructuradas en pasos.
- Capacidades multilingues: no disponibles.
- Capacidad especial: modo "uncensored/abliterated"; no se declara modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como la abliteracion altera el comportamiento de rechazo de un modelo de 27B, comparando la tasa de rechazo del 16% reportada con la del modelo base sin modificar.
- Evaluacion de robustez de filtros de seguridad: util para equipos de red teaming que necesitan medir la eficacia de sus propias capas de moderacion ante un modelo que no se autolimita.
- Analisis de divergencia de comportamiento: la metrica de divergencia KL de 0.3059 permite cuantificar cuanto se desvia el modelo abliterado del base, como referencia metodologica.
- Reproduccion de experimentos de abliteracion: sirve como ejemplo de adaptador LoRA generado con heretic-gguf para replicar el proceso sobre otros modelos base.
- Generacion de texto sin restricciones tematicas en entornos de investigacion controlados: para estudiar la calidad del texto en dominios que el modelo base rechazaria.
- Estudio de degradacion de capacidades: permite evaluar si la abliteracion afecta al rendimiento general del modelo (razonamiento, codigo, matematicas), aunque no hay benchmarks publicados para confirmarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es el reportado por heretic durante la abliteracion:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (reportada por heretic) | 16% |
| Divergencia KL respecto al base | 0.3059 |
| Tasa de rechazo (pruebas manuales del autor) | 0% observado, sin cifra oficial |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar. No inventar cifras adicionales.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (1.205.248 parametros, repo de 0.0 GB), por lo que su almacenamiento y carga no suponen carga significativa.
- El coste real proviene del modelo base de 27B. Estimaciones orientativas (no facilitadas por el autor):
  - FP16: en torno a 54 GB de VRAM.
  - INT8: en torno a 27 GB.
  - Cuantizacion de 4 bits (GGUF Q4): en torno a 14-16 GB.
- GPU recomendadas para FP16/INT8: A100 80 GB, H100, o configuraciones multi-GPU. Para 4 bits puede ser suficiente una RTX 4090 (24 GB) o RTX 3090, siempre que el modelo cuantizado quepa y se gestione correctamente el offload.
- Cabe en GPU de consumo (RTX 4090, 3090) unicamente en cuantizaciones agresivas de 4 bits o inferiores segun el presupuesto de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para el base en GGUF; el adaptador LoRA puede fusionarse con el modelo base antes de la conversion, o cargarse como adaptador en frameworks que lo soporten (por ejemplo, PEFT de Hugging Face si el base esta disponible en safetensors). vLLM y TGI son opciones si el modelo fusionado se sirve en formato compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gogeta70/Swift_1.5_Qwen_3.8_27B_Heretic_Uncensored_LoRA | 1,2M (adaptador) / 27B (base) | no disponible | 16% rechazo, KL 0.3059 | no disponible | HuggingFace |
| Modelo base ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | 27B | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos abliterados de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero la eliminacion de rechazos puede amplificar sesgos y contenido danino del modelo base.
- Riesgo de alucinacion: no evaluado; la abliteracion puede alterar la calibracion del modelo sin que se haya medido.
- La tasa de rechazo reportada por heretic es del 16%, aunque el autor afirma haber observado 0% en pruebas manuales; los resultados pueden variar segun el prompt.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia no disponible: existe incertidumbre legal sobre el uso comercial, tanto del adaptador como del modelo base. Verificar la licencia del modelo base antes de cualquier despliegue.
- Uso responsable: el adaptador elimina barreras de seguridad y los ejemplos de la model card incluyen contenido sobre sintesis de drogas, explosivos y creacion de botnets. El autor declara explicitamente que la responsabilidad recae en el usuario ("Don't be evil"). No debe usarse en produccion sin capas de moderacion externas.
- Altamente experimental: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad ni mantenimiento posterior.
- El rendimiento del modelo fusionado (calidad de texto, codigo, matematicas) no esta cuantificado; la fusion del LoRA puede degradar capacidades no medidas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Gogeta70/Swift_1.5_Qwen_3.8_27B_Heretic_Uncensored_Lora_Adapter
- Modelo base: ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF (referenciado en la model card, sin URL directa en la informacion proporcionada)
- Herramienta heretic-gguf: mencionada como herramienta de creacion del adaptador, sin URL en la informacion proporcionada
- Otros enlaces (papers, blogs, repos, demos): no disponibles
