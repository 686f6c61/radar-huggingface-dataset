# Dungchauu/mailcal-email-understand-qwen-adapter

## Resumen

MailCal Task 3 es un adaptador LoRA publicado por el usuario Dungchauu que especializa el modelo base Qwen/Qwen3-1.7B (revision fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) en la comprension de correos electronicos de reclutamiento. El adaptador lee correos en bruto, separa el cuerpo actual del historial citado o reenviado y de las firmas, clasifica el mensaje en 11 intenciones de reclutamiento, extrae campos estructurados preservando expresiones relativas de fecha y hora sin inventar marcas temporales, y se abstiene cuando el correo es ilegible o contiene inyeccion de prompt, todo ello siguiendo el esquema `recruit-contracts-v2.schema.json` (version 2.0.0).

El modelo resuelve un problema muy concreto de automatizacion de bandejas de entrada en agencias o departamentos de seleccion: convertir texto libre y ruidoso (hilos de correo, firmas, citas) en salida JSON validable y auditable. No es un modelo de proposito general, sino un adaptador de tarea entrenado sobre un conjunto pequeno y verificado de 256 registros (192 de entrenamiento y 64 de desarrollo), con cobertura equilibrada de ingles y vietnamita y de las 11 intenciones y 6 tipos de segmento.

La relevancia actual reside en su enfoque de ingenieria: cuantifica la calidad con metricas de validez de esquema, precision de campos, abstencion y anclaje verbatim de citas, y publica checksums SHA-256 del adaptador. Al estar construido sobre Qwen3-1.7B, un modelo pequeno, el adaptador puede ejecutarse en hardware modesto (el entrenamiento cupo en una Tesla T4 con 4,61 GB de VRAM pico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA modular sobre transformer decoder Qwen3; rango `r=8`, `alpha=16`, `dropout=0.05`, aplicado a las 7 proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | Ingles y vietnamita (50 % EN / 50 % VI en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; libreria PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA modular de bajo rango (r=8, alpha=16, dropout 0.05) insertado en las siete proyecciones lineales del transformer decoder de Qwen3-1.7B. El entrenamiento se realizo sobre el dataset `email_understand_train_v1`, compuesto por 256 registros verificados repartidos en 192 de entrenamiento y 64 de desarrollo, con 32 familias industriales independientes, 50 % ingles y 50 % vietnamita, y cobertura completa de las 11 intenciones y 6 tipos de segmento en ambos splits. Se auditaron 18.432 pares contra `recruit_eval_v3` sin encontrar fuga de datos.

La optimizacion consistio en 4 epocas × 48 pasos, es decir, 192 pasos de optimizador con acumulacion de gradiente de 4, tasa de aprendizaje 1e-4, scheduler coseno y perdida de entropia cruzada ponderada por tokens con enmascaramiento completo del prompt (`-100`). El pico de VRAM fue de 4,61 GB en una Tesla T4. La perdida de validacion descendio de 0,35350 antes del entrenamiento a 0,04530 en la mejor epoca (epoca 4, paso 192), una reduccion del 87,2 %. Una innovacion destacable es el reanclaje determinista de los offsets de caracter (`start`/`end`) generados por el modelo contra la porcion verbatim exacta del correo fuente en `agent/scripts/understand_email.py`, evitando citas fabricadas.

## Capacidades

- Segmentacion de correos: distingue cuerpo actual, historial citado o reenviado, firmas y otros segmentos (6 tipos en total).
- Clasificacion de intencion en 11 categorias de reclutamiento.
- Extraccion de campos estructurados de reclutamiento en JSON conforme al esquema `recruit-contracts-v2.schema.json` (2.0.0).
- Preservacion de expresiones relativas de fecha y hora sin fabricar marcas temporales absolutas.
- Abstencion ante correos ilegibles o con inyeccion de prompt.
- Salida estructurada validable (JSON valido y conforme a esquema).
- Anclaje verbatim de citas: las citas extraidas se localizan en el texto fuente.
- Capacidades multilingues limitadas a ingles y vietnamita.
- No declara soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Triaje automatico de bandejas de reclutamiento: el adaptador clasifica cada correo entrante en una de las 11 intenciones y separa el cuerpo del historial citado, lo que permite enrutar mensajes a la cola adecuada sin que el agente lea hilos completos.
- Extraccion de datos de candidatos a un ATS: convierte correos en campos estructurados (puesto, fechas relativas, referencias) conformes al esquema, lo que facilita la ingesta directa en sistemas de seguimiento de candidaturas.
- Deteccion de inyeccion de prompt en correos: al abstenerse ante correos manipulados o ilegibles, actua como primera linea de defensa en pipelines que alimentan LLMs con contenido externo.
- Auditoria y trazabilidad: el anclaje verbatim de citas y los checksums SHA-256 publicados permiten verificar que cada campo extraido procede realmente del correo, requisito habitual en entornos regulados.
- Procesamiento bilingue ingles-vietnamita: util para agencias con operaciones en ambos idiomas, ya que el entrenamiento equilibrado cubre las mismas intenciones en las dos lenguas.
- Despliegue en hardware modesto: al apoyarse en Qwen3-1.7B y un adaptador LoRA pequeno, puede ejecutarse en una unica GPU de consumo o incluso en CPU con cuantizacion del modelo base, lo que abarata el coste por correo procesado.
- Prototipado rapido de flujos de reclutamiento: sirve como componente de referencia para validar esquemas y metricas antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Evaluacion held-out sobre `recruit_eval_v3` (12 casos de `recruit.email-understand`):

| Metrica | Resultado |
|---|---|
| Validez JSON | 12/12 (100,0 %) |
| Validez de esquema | 12/12 (100,0 %) |
| Precision de campos (`unsupported_claims = 0%`) | 9/9 (100,0 %) |
| F1 de campos | 0,818 (81,8 %) |
| Precision de estado / F1 macro | 56/60 (93,3 %) / 0,894 |
| Precision de intencion | 9/12 (75,0 %) |
| Precision de "review needed" | 9/12 (75,0 %) |
| Coincidencia valor+estado de asunto | 10/12 (83,3 %) |
| Citas verbatim encontradas en la fuente | 28/28 (100,0 %) |

Perdida de validacion en `email_understand_train_v1` (64 registros de dev): 0,35350 antes de entrenar; 0,06469 en epoca 1; 0,04956 en epoca 2; 0,04605 en epoca 3; 0,04530 en epoca 4 (mejor).

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirio 4,61 GB pico en una Tesla T4; la inferencia con el modelo base en fp16 y el adaptador deberia situarse en un rango similar o inferior, aunque no se publica una cifra exacta de inferencia.
- GPU recomendadas: Tesla T4 (validada en entrenamiento), asi como A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; con cuantizacion del modelo base podria caber en GPUs de 8 GB o menos.
- Opciones de despliegue: PEFT + Transformers (metodo documentado en la model card); el modelo base Qwen3-1.7B es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la fusion del adaptador LoRA requiere pasos adicionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas plausibles de la misma categoria (adaptadores o modelos pequenos para extraccion estructurada):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MailCal email-understand (este) | 1.700 M (base) + LoRA | no disponible | LoRA especializado en reclutamiento, EN/VI | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1.700 M | no disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |
| Alternativas de extraccion estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (256 registros), lo que limita la generalizacion a dominios de reclutamiento distintos de los 32 sectores cubiertos.
- Precision de intencion del 75 % en la evaluacion held-out: una de cada cuatro intenciones puede clasificarse incorrectamente.
- Solo soporta ingles y vietnamita; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- La longitud de contexto no se documenta en la model card; esta heredada del modelo base y no se ha validado para correos muy largos.
- Riesgo de alucinacion mitigado parcialmente por el anclaje verbatim y la abstencion, pero la perdida de validacion no es cero y el F1 de campos es 0,818.
- La segmentacion depende de heuristicas de reanclaje en `agent/scripts/understand_email.py`; cambios en ese script pueden alterar el comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar los checksums SHA-256 antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No declara soporte de tool calling ni de agentes, por lo que no debe usarse como orquestador.

## Enlaces

- Hugging Face: https://huggingface.co/Dungchauu/mailcal-email-understand-qwen-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
