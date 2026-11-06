# AgVishal25/Llama-v3.2-3B-Instruct

## Resumen

Llama-v3.2-3B-Instruct es la variante de 3.000 millones de parametros de la familia Llama 3.2 de Meta, publicada originalmente en el repositorio `meta-llama/Llama-3.2-3B-Instruct`. El repositorio analizado, `AgVishal25/Llama-v3.2-3B-Instruct`, no contiene los pesos originales en formato estandar, sino un paquete de artefactos pre-exportados y optimizados para su despliegue en dispositivos con hardware Qualcomm (Snapdragon y Dragonwing), compilados mediante Qualcomm AI Hub Workbench y ejecutables con los runtimes GENIE y GENIEX_QAIRT.

El modelo resuelve el problema de ejecutar un LLM de 3B en entornos de borde (smartphones, portatiles ARM, plataformas automotrices e IoT) con latencias y throughput medidos y publicados por chipset. La cuantizacion aplicada es w4a16 (pesos de 4 bits, activaciones de 16 bits) y w8a16 en parte del modelo, lo que reduce la huella de memoria para caber en dispositivos moviles sin GPU dedicada. La longitud de contexto soportada en estos artefactos es de 4096 tokens.

Es relevante ahora porque ejemplifica el patron de distribucion de modelos para IA en el dispositivo: el autor no publica pesos ejecutables por si mismos, sino instrucciones y tooling para reexportar el modelo con pesos propios, y restringe la redistribucion de los artefactos por la licencia Llama 3. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un paquete tecnico de referencia mas que como un checkpoint de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (en los artefactos exportados) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); w8a16 parcial; runtime GENIE en modo w4 y w4a16 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Llama 3 (license:llama3) |
| Formato de pesos | Artefactos pre-exportados para Qualcomm AI Hub (no safetensors ni GGUF en este repositorio); exportables con la libreria `qai_hub_models` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct de Meta: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos. El repositorio no documenta el proceso de entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO); esa informacion corresponde a la model card de Meta, no a este paquete. Lo que si documenta este repositorio es el pipeline de optimizacion: compilacion y perfilado mediante Qualcomm AI Hub Workbench, con exportacion a los runtimes GENIE (que la model card marca como proximo a deprecar) y GENIEX_QAIRT.

La innovacion tecnica destacable no esta en el modelo sino en el empaquetado: cuantizacion mixta w4a16 con secciones w8a16 para preservar calidad en capas sensibles, y un conjunto de artefactos compilados por chipset con metricas de Time To First Token (TTFT) y tasa de respuesta medidas. El TTFT se reporta como rango: el limite inferior corresponde a prompts de hasta 128 tokens y el superior a prompts que agotan los 4096 tokens de contexto.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del checkpoint Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano de 3B.
- Generacion de codigo y matematicas a nivel introductorio, sin garantias de robustez en tareas complejas.
- Ejecucion en el dispositivo sin conexion a red, con los runtimes GENIE y GENIEX_QAIRT de Qualcomm.
- Soporte de prompts de hasta 4096 tokens en los artefactos exportados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en este repositorio.
- Capacidades multilingues: la model card declara unicamente ingles.

## Casos de uso

- Asistentes de texto sin conexion en smartphones: el modelo se ejecuta con GENIE en Snapdragon 8 Elite a unas 26-28 tok/s en w4a16, suficiente para respuestas conversacionales interactivas sin enviar datos a la nube.
- Funciones de resumen y reescritura en aplicaciones moviles: con 4096 tokens de contexto se pueden procesar correos, notas o articulos cortos en el propio dispositivo, preservando la privacidad del usuario.
- Procesamiento de lenguaje natural en plataformas automotrices: los chipsets SA8650P y SA8255P reportan 17,47 tok/s en w4a16, adecuados para asistencia por voz y consultas del conductor en el vehiculo.
- Automatizacion en IoT industrial: en Dragonwing IQ-8275 e IQ-9075 el modelo rinde entre 16,7 y 16,8 tok/s en w4a16, lo que permite clasificacion de texto y generacion de respuestas en gateways de borde.
- Prototipado de aplicaciones de IA en portatiles ARM: en Snapdragon X2 Elite se alcanzan 39,8 tok/s en w4a16, el mejor dato de la tabla, util para demos y desarrollo local.
- Evaluacion comparativa de runtimes: el repositorio permite medir GENIE frente a GENIEX_QAIRT sobre el mismo modelo; por ejemplo, en Snapdragon 8 Elite Gen 5 GENIE w4a16 da 28,2 tok/s frente a 14,0 tok/s de GENIEX_QAIRT w4.
- Fine-tuning y reexportacion: la libreria `qai_hub_models` permite compilar checkpoints afinados propios con formas de entrada y dispositivo objetivo personalizados, lo que habilita adaptaciones de dominio sobre la base de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo aporta metricas de rendimiento en dispositivo.

| Chipset | Runtime | Precision | Contexto | Response rate (tok/s) | TTFT (s, rango) |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | GENIE | w4a16 | 4096 | 28,17 | 0,072 - 2,311 |
| Snapdragon 8 Elite For Galaxy | GENIE | w4a16 | 4096 | 26,50 | 0,077 - 2,463 |
| Snapdragon X2 Elite | GENIE | w4a16 | 4096 | 39,84 | 0,099 - 3,182 |
| Snapdragon X Elite | GENIE | w4a16 | 4096 | 12,25 | 0,118 - 3,765 |
| Dragonwing IQ-8275 | GENIE | w4a16 | 4096 | 16,67 | 0,242 - 7,747 |
| Dragonwing IQ-9075 | GENIE | w4a16 | 4096 | 16,85 | 0,106 - 3,402 |
| Dragonwing Q-8750 | GENIE | w4a16 | 4096 | 26,50 | 0,077 - 2,463 |
| SA8650P | GENIE | w4a16 | 4096 | 17,47 | 0,110 - 3,508 |
| SA8255P | GENIE | w4a16 | 4096 | 17,47 | 0,110 - 3,508 |
| Snapdragon 8 Elite Gen 5 For Galaxy | GENIE | w4 | 4096 | 15,57 | 0,126 - 4,044 |
| Snapdragon X2 Elite | GENIE | w4 | 4096 | 15,72 | 0,133 - 4,270 |
| Snapdragon X Elite | GENIE | w4 | 4096 | 5,48 | 0,258 - 8,246 |
| Snapdragon 8 Elite Gen 5 For Galaxy | GENIEX_QAIRT | w4 | 4096 | 14,01 | 0,224 - 7,164 |
| Snapdragon X2 Elite | GENIEX_QAIRT | w4 | 4096 | 14,18 | 0,176 - 5,624 |
| Snapdragon X Elite | GENIEX_QAIRT | w4 | 4096 | 7,86 | 0,246 - 7,887 |

La tabla recoge una seleccion representativa; la model card incluye filas adicionales para Dragonwing IQ-X7181, Dragonwing IQ-8275 e IQ-9075 en GENIEX_QAIRT, y para Dragonwing IQ-X7181 en GENIE.

## Requisitos de hardware

- VRAM/RAM estimada: en w4a16 los pesos de 3B ocupan aproximadamente 1,5-2 GB, mas overhead de activaciones y KV cache; en w4 el requisito es similar con menor precision efectiva.
- No esta pensado para GPU de escritorio: los artefactos estan compilados para aceleradores Qualcomm (NPU/CPU Hexagon y Adreno segun plataforma).
- Cabe en dispositivos moviles de gama alta con Snapdragon 8 Elite, X Elite, X2 Elite y en las plataformas Dragonwing y SA de Qualcomm.
- Despliegue: runtime GENIE (soporte a deprecar) y GENIEX_QAIRT; exportacion con la libreria `qai_hub_models` v0.65.0 y compilacion via Qualcomm AI Hub Workbench.
- No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Throughput medido: de 5,48 tok/s (Snapdragon X Elite, w4, GENIE) a 39,84 tok/s (Snapdragon X2 Elite, w4a16, GENIE).
- TTFT medido: de 0,072 s con prompt corto a 12,71 s con prompt de 4096 tokens en Dragonwing IQ-8275 en w4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue en dispositivo | Notas |
|---|---|---|---|---|---|
| Llama-v3.2-3B-Instruct (este repo) | 3B | 4096 | Llama 3 | Qualcomm GENIE / GENIEX_QAIRT | Solo ingles; artefactos no redistribuibles |
| Llama-3.2-3B-Instruct (Meta) | 3B | 128K (segun model card de Meta) | Llama 3 | Generico (llama.cpp, etc.) | Checkpoint original; contexto mayor que el exportado aqui |
| Llama-3.2-1B-Instruct (Meta) | 1B | 128K (segun model card de Meta) | Llama 3 | Generico | Menor huella, menor calidad; alternativa para moviles de gama media |
| Gemma 2 2B (Google) | 2B | 8192 | Gemma Terms | Generico | Alternativa de tamano similar con contexto mayor; comparacion de rendimiento no disponible en esta informacion |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento real frente a estas alternativas; la comparacion se limita a parametros, contexto, licencia y opciones de despliegue.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el uso en castellano no esta garantizado ni evaluado.
- El contexto de los artefactos exportados es de 4096 tokens, muy inferior al contexto nativo del checkpoint original de Meta.
- Riesgo de alucinacion propio de un modelo de 3B: fiabilidad limitada en razonamiento complejo, matematicas y codigo de produccion.
- Sesgos heredados de los datos de entrenamiento de Llama 3.2, no evaluados en este repositorio.
- La licencia Llama 3 impone restricciones de uso comercial y de redistribucion; la model card indica explicitamente que no se pueden distribuir los artefactos pre-exportados por restricciones de licencia, por lo que el usuario debe reexportar con sus propios pesos.
- El runtime GENIE sera deprecado proximo; conviene planificar la migracion a GENIEX_QAIRT.
- Las metricas de rendimiento dependen del chipset y del runtime; no son extrapolables a GPU de escritorio ni a otros aceleradores.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en la misma fecha (2026-10-27), lo que sugiere un paquete recien publicado sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AgVishal25/Llama-v3.2-3B-Instruct
- Checkpoint original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/
- Libreria Qualcomm AI Hub Models (v0.65.0): https://github.com/qualcomm/ai-hub-models/blob/v0.65.0/src/qai_hub_models/models/llama_v3_2_3b_instruct
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Ejecucion de modelo local con GenieX: https://geniex.aihub.qualcomm.com/en/run/cli/quickstart/#run-a-local-model
- Tutorial LLM-on-Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
