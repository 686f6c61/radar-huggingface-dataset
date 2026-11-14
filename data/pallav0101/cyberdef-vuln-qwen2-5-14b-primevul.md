# pallav0101/cyberdef-vuln-qwen2.5-14b-primevul

## Resumen

cyberdef-vuln-qwen2.5-14b-primevul es un adaptador LoRA (QLoRA, r=16, alpha=32, cuantizacion 4-bit nf4) entrenado sobre el modelo base Qwen/Qwen2.5-14B-Instruct para una tarea muy concreta de seguridad defensiva: dada una muestra de codigo, emitir un veredicto binario (`VERDICT: VULNERABLE` o `VERDICT: SAFE`) con fines de triaje. Lo desarrolla Pallav Pokhriyal (ORCID 0009-0001-5356-7663) como parte de un estudio de escalado y evaluacion cruzada de datasets que cubre puntos de 1.5B, 7B, 14B y 32B parametros.

El adaptador no genera exploits ni parchea codigo; se limita a clasificar el fragmento recibido. Segun la model card, este punto de 14B es el mejor calibrado del estudio (ECE 0.012), si bien en AUROC no supera al adaptador de 7B (0.758 frente a 0.786), y con n=200 casos por tamano el error estandar del AUROC ronda 0.04, por lo que las diferencias pequenas entre tamanos quedan dentro del ruido estadistico.

El interes actual del modelo radica en su enfoque de calibracion explicita y en la recomendacion de uso con umbral de abtencion y revisor humano en el bucle, lo que lo situa como una pieza de triaje asistido y no como un sistema de decision autonomo. El repositorio ocupa 0.3 GB y contiene unicamente los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-14B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit QLoRA (nf4); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen2.5-14B-Instruct, un transformer decoder-only de 14B parametros, mediante LoRA con rango 16 y alpha 32, entrenado en QLoRA de 4 bits con cuantizacion nf4. El repositorio solo distribuye los pesos del adaptador (0.3 GB), por lo que la inferencia requiere descargar el modelo base y cargar el adaptador con `peft.PeftModel.from_pretrained`.

La model card indica que el entrenamiento se realizo sobre el dataset PrimeVul (segun el nombre del repositorio) y que no se emplearon salidas generadas por el modelo ni por APIs comerciales como datos de entrenamiento. El autor declara que todas las cifras reportadas se recalculan a partir de salidas de evaluacion por caso registradas (fichero `RESULTS.md` del repositorio GitHub). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO sobre el adaptador.

La innovacion destacable no es arquitectonica sino metodologica: el estudio compara puntos de escalado (1.5B, 7B, 14B, 32B) sobre el mismo esquema de adaptacion y reporta calibracion (ECE) ademas de discriminacion (AUROC), con analisis explicito del error estadistico a n=200 casos por tamano.

## Capacidades

- Clasificacion binaria de vulnerabilidades en codigo: emite `VERDICT: VULNERABLE` o `VERDICT: SAFE` para un fragmento dado.
- Triaje defensivo (blue-team): pensado para priorizar revisiones, no para explotacion.
- Calibracion de confianza: el punto de 14B es el mejor calibrado del estudio (ECE 0.012), lo que permite aplicar umbrales de abtencion.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-14B-Instruct (pipeline text-generation, tag conversational).
- No soporta, segun la informacion disponible, tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking especificos del adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de hallazgos en revision de codigo: integrar el adaptador en un pipeline que clasifique cada fragmento o diff como vulnerable o seguro antes de la revision humana, usando el umbral de abtencion calibrado para derivar los casos dudosos a un analista.
- Priorizacion en programas de bug bounty internos: ordenar los reportes o parches candidatos por veredicto del modelo para que el equipo de seguridad revise primero los marcados como vulnerables.
- Analisis de dependencias y codigo de terceros: ejecutar el clasificador sobre fragmentos de librerias antes de incorporarlas, marcando los que requieran auditoria manual adicional.
- Formacion y concienciacion: usar el modelo como etiquetador de ejemplos en talleres de seguridad, comparando su veredicto con el del alumno y discutiendo los falsos negativos.
- Investigacion en deteccion de vulnerabilidades: servir como punto de comparacion reproducible (adaptador publico, receta y resultados en GitHub) frente a otros enfoques o tamanos en estudios academicos.
- Segunda opinion automatizada en revisiones de pull requests: publicar el veredicto como comentario no bloqueante en el PR, con la advertencia de que un `SAFE` nunca sustituye la revision humana.
- Filtrado previo en pipelines de analisis estatico: descartar candidatos claramente seguros para reducir el volumen que llega a herramientas mas costosas, manteniendo siempre el revisor humano en el bucle.

## Benchmarks y rendimiento

| Metrica | Valor (adaptador 14B) | Referencia en el estudio |
|---|---|---|
| AUROC | 0.758 | 7B: 0.786 (el 14B no lo supera) |
| ECE (calibracion) | 0.012 | Mejor calibrado del estudio |
| Tamano de evaluacion | n=200 casos | Error estandar del AUROC ~0.04 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador pesa 0.3 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-14B-Instruct completo.
- VRAM estimada: en FP16, aproximadamente 28 GB solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits, en torno a 15-16 GB; en 4 bits, alrededor de 8-10 GB. Estas cifras son estimaciones por tamano, no datos publicados en la model card.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) viable en 8 bits o 4 bits; GPUs consumer de 16 GB o menos solo con cuantizacion agresiva.
- Despliegue: carga via `transformers` + `peft` segun el ejemplo de la model card; vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion disponible, y requeririan fusionar el adaptador con el modelo base o usar soporte de adaptadores LoRA de la herramienta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC / calibracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdef-vuln-qwen2.5-14b-primevul | 14B (base) + LoRA | no disponible | AUROC 0.758; ECE 0.012 | MIT (adaptador), Apache-2.0 (base) | Hugging Face, 39 descargas |
| cyberdef-vuln-qwen2.5-7b-primevul | 7B (base) + LoRA | no disponible | AUROC 0.786 (mejor del estudio) | MIT (adaptador) | Hugging Face (recomendado por el autor como opcion por defecto) |
| Otros puntos del estudio (1.5B, 32B) | 1.5B / 32B | no disponible | Resultados en el repositorio GitHub | MIT (adaptador) | Hugging Face / GitHub |

No se dispone en la informacion proporcionada de comparaciones con modelos de deteccion de vulnerabilidades de otros autores.

## Limitaciones y advertencias

- El modo de fallo peligroso es un veredicto falso `SAFE`; la model card exige mantener siempre un revisor humano en el bucle.
- No apto para gating autonomo, generacion de exploits ni correccion automatica de codigo.
- En AUROC no supera al adaptador de 7B (0.758 frente a 0.786), y con n=200 casos el error estandar (~0.04) hace que las diferencias entre tamanos puedan ser ruido.
- Entrenado sobre PrimeVul; el rendimiento fuera de esa distribucion de datos no esta documentado.
- Idiomas soportados no declarados; el comportamiento multilingue del adaptador es desconocido.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base; el formato de salida restringido a veredicto reduce pero no elimina el riesgo de respuestas fuera de formato.
- Licencia MIT para el adaptador, pero el uso queda sujeto tambien a los terminos Apache-2.0 del modelo base Qwen2.5-14B-Instruct.
- Requiere descargar el modelo base de 14B ademas del adaptador, con el coste de almacenamiento y VRAM correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-14b-primevul
- Adaptador recomendado por el autor (7B): https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-primevul
- Repositorio del estudio (resultados, receta, integridad): https://github.com/pallav0107/cyberdef-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
