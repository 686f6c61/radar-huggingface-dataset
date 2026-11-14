# qalduaij/lolo_Q8y_Dialect_v3_31B

## Resumen

lolo_Q8y_Dialect_v3_31B (denominado comercialmente "lolo Kuwaiti Dialect Flagship 31B AI v3") es un modelo de lenguaje de 31.273 millones de parámetros desarrollado por Qusai Al-duaij (qalduaij) dentro de la denominada "lolo AI Ecosystem". Se presenta como un modelo especializado en dialecto kuwaití, con orientación a la redacción de guiones radiofónicos y dramáticos, y se construye como un ajuste fino (LoRA, r=64, alpha=128) sobre `unsloth/gemma-4-31B-it`, un modelo denso de la familia Gemma 4.

El modelo se distribuye en tres formatos: pesos completos en safetensors (dos shards, ~62 GB en total), el adaptador LoRA en safetensors (~1,82 GB) y dos cuantizaciones GGUF (Q4_K_M de 17,40 GB y Q8_0 de 30,39 GB) listas para Ollama y LM Studio. La licencia declarada es Apache 2.0 y los idiomas soportados según la model card son árabe e inglés.

Su relevancia radica en ser una de las pocas iniciativas publicadas de ajuste dialectal específico del Golfo sobre un modelo base de gran tamaño, con un enfoque declarado de "IA soberana" kuwaití. No obstante, la información técnica publicada es limitada: no se documentan volúmenes de entrenamiento, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de `unsloth/gemma-4-31B-it`, familia Gemma 4) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0; adaptador LoRA; safetensors en precision original |
| Idiomas soportados | arabe (ar), ingles (en); enfasis declarado en dialecto kuwaiti y arabe estandar formal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards), LoRA safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Gemma 4 en su variante de 31B, según indica el campo `base_model` (`unsloth/gemma-4-31B-it`). Sobre esa base se aplica un ajuste fino con LoRA de rango 64 y alpha 128, cuyos pesos se publican por separado en el directorio `lora/`. El repositorio incluye `processor_config.json` y una etiqueta `image-text-to-text`, lo que sugiere que el modelo base conserva capacidades multimodales de entrada, aunque la model card no documenta el uso de visión en el ajuste.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencia. La model card menciona como fuentes "lexicos foneticos y patrimoniales y textos radiofonicos y dramaticos kuwaities verificados", sin cuantificar. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modo thinking) mas alla de las heredadas del modelo base.

## Capacidades

- Generacion de texto conversacional en dialecto kuwaiti y en arabe estandar formal, con registro institucional y juridico segun la politica linguistica declarada.
- Traduccion y transferencia cross-lingual arabe-ingles.
- Redaccion de guiones radiofonicos y dramaticos, segun el enfoque declarado del modelo.
- Razonamiento cultural y contextual sobre tematica kuwaiti.
- Soporte de plantilla de chat propia (`chat_template.jinja` de 18,48 KB) compatible con el ecosistema transformers.
- Despliegue via Ollama y LM Studio mediante los GGUF incluidos.
- Capacidad multimodal de entrada potencialmente heredada del modelo base (`image-text-to-text` en los tags), no documentada en la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Redaccion de guiones radiofonicos y seriales dramaticos en dialecto kuwaiti: el ajuste sobre lexicos y textos radiofonicos verificados lo hace adecuado para generar dialogos con registro local, aunque requiere revision editorial humana por el riesgo de alucinacion.
- Atencion al cliente en kuwaiti para servicios locales: puede gestionar conversaciones multi-turno en dialecto, con la salvedad de que la longitud de contexto no esta documentada y debe validarse empiricamente.
- Traduccion y localizacion arabe-ingles de contenido institucional: util para adaptar comunicaciones corporativas o administrativas entre ambos idiomas.
- Preservacion y divulgacion del patrimonio linguistico kuwaiti: generacion de material didactico o divulgativo a partir de lexicos dialectales.
- Prototipado de asistentes conversacionales soberanos: al publicarse con licencia Apache 2.0 y GGUF listos para Ollama, permite desplegar un asistente local sin dependencia de APIs externas.
- Investigacion en ajuste dialectal: el par base + adaptador LoRA publicado facilita reproducir o extender el ajuste sobre Gemma 4 31B en otros dialectos del Golfo.
- Despliegue en hardware de gama alta con cuantizacion Q4_K_M: el GGUF de 17,40 GB permite inferencia en una unica GPU de 24 GB, adecuado para entornos de demostracion o estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos completos en safetensors: ~62 GB en disco; inferencia en BF16 requiere aproximadamente 63-70 GB de VRAM (A100 80 GB, H100 80 GB, o multi-GPU).
- GGUF Q8_0 (30,39 GB): requiere ~32-34 GB de VRAM para carga completa en GPU; viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada.
- GGUF Q4_K_M (17,40 GB): requiere ~18-20 GB de VRAM; cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y A6000 (48 GB) con margen para contexto.
- Inferencia parcial CPU+GPU posible con llama.cpp u Ollama en equipos con menos VRAM, a costa de latencia.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Dialect_v3_31B:Q8_0` o `:Q4_K_M`), LM Studio, llama.cpp, transformers con safetensors o cargando el adaptador LoRA sobre el base. vLLM y TGI no estan documentados en la informacion disponible, aunque deberian funcionar con los safetensors si la arquitectura Gemma 4 esta soportada por esas herramientas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v3_31B | 31,27 B (denso) | no disponible | ar, en | Apache 2.0 | safetensors, LoRA, GGUF |
| unsloth/gemma-4-31B-it (base) | ~31 B (denso) | no disponible | multilingue | segun Gemma (no confirmada aqui) | safetensors |
| lolo_Q8y_Dialect_v2 | ~14 B (Qwen2.5 14B) | no disponible | ar, en | no disponible | no disponible |
| lolo_Q8y_Dialect_v4_26B_A4B | 26 B MoE (A4B) | no disponible | ar, en | no disponible | no disponible |

La comparacion con alternativas externas de la misma categoria (ajustes dialectales arabes de ~30B) no esta disponible en la informacion proporcionada. Dentro del propio ecosistema lolo, la version v4 MoE de 26B-A4B se presenta como la alternativa de mayor eficiencia, y la v2 sobre Qwen2.5 14B como la generacion anterior de menor tamano.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- No se documenta el volumen ni la composicion del dataset de ajuste, lo que impide evaluar el riesgo de sobreajuste al estilo radiofonico o de degradacion en tareas generales.
- Riesgo de alucinacion en contenidos historicos, juridicos o institucionales: la model card no menciona mitigaciones ni evaluaciones de factualidad.
- La longitud de contexto no esta especificada; no debe asumirse la del modelo base sin verificacion.
- Sesgos potenciales derivados del corpus dialectal kuwaiti y de la orientacion editorial del autor; no se documentan analisis de sesgo.
- Cobertura linguistica limitada a arabe e ingles; el rendimiento fuera de estos idiomas no esta documentado.
- La licencia Apache 2.0 se declara en los metadatos, pero debe verificarse que sea compatible con la licencia del modelo base Gemma 4 antes de uso comercial, dado que el ajuste deriva de el.
- El repositorio tiene 226 descargas y 0 likes en el momento de la consulta, con ausencia de validacion por parte de la comunidad.
- La model card esta redactada principalmente en arabe e ingles y contiene afirmaciones de marketing ("fائق القدرات", "soberano") sin respaldo tecnico documentado.

## Enlaces

- Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v3_31B
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it
- Ecosistema lolo (referencias en la model card): https://huggingface.co/qalduaij/lolo_Q8y_General, https://huggingface.co/qalduaij/lolo_Q8y_Legal, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B, https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
