# llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF

## Resumen

Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF es una cuantizacion en formato GGUF del modelo Magistral-Small-2509-ultra-uncensored-heretic-v2, publicado por el contribuidor independiente llmfan46. Se trata de una version "decensored" (abliterated) del modelo mistralai/Magistral-Small-2509 de Mistral AI, obtenida aplicando la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). El objetivo es eliminar los mecanismos de rechazo del modelo original manteniendo al maximo sus capacidades de razonamiento y generacion.

El modelo base es Magistral Small 1.2, un modelo de razonamiento de 24.000 millones de parametros construido sobre Mistral Small 3.2 (2506), con entrenamiento SFT a partir de trazas de Magistral Medium y RL posterior. Incorpora un codificador de vision, lo que le permite procesar entradas multimodales, y soporta un modo de "thinking" explicito delimitado por etiquetas `[THINK]...[/THINK]`.

La relevancia de esta ficha radica en que ofrece una alternativa sin filtros de contenido para entornos de investigacion y desarrollo donde se necesita estudiar el comportamiento del modelo sin restricciones de rechazo, con una tasa declarada de 3/100 rechazos frente a 92/100 del original, y una divergencia KL de 0,0493 que indica una preservacion razonable de la calidad. El repositorio incluye multiples cuantizaciones GGUF y un proyector de vision separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision (basado en Mistral Small 3.2 / Magistral Small 1.2) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M; proyector de vision en BF16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Magistral Small 1.2, un transformer denso de 24 B de parametros derivado de Mistral Small 3.2 (2506). Sobre esa base se anaden capacidades de razonamiento mediante SFT a partir de trazas de Magistral Medium y un posterior entrenamiento con RL. La version 1.2 incorpora un codificador de vision que habilita entradas multimodales, ademas de mejoras en el tono, el formato LaTeX/Markdown y la brevedad en respuestas a indicaciones generales sencillas.

La modificacion "decensored" se realizo con Heretic v1.2.0 aplicando Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 37, con los parametros `preserve_good_behavior_weight=0,9362`, `steer_bad_behavior_weight=0,0003`, `overcorrect_relative_weight=0,9861` y `neighbor_count=9`. El resultado declarado es una reduccion de rechazos de 92/100 a 3/100 con una divergencia KL de 0,0493 respecto al original. El modo de razonamiento se activa mediante un system prompt especifico (contenido en `SYSTEM_PROMPT.txt`), que hace que el modelo emita su cadena de pensamiento entre etiquetas `[THINK]...[/THINK]`; con cualquier otro system prompt responde directamente.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" explicito activable por system prompt.
- Razonamiento matematico y resolucion de problemas complejos (herencia de Magistral Small 1.2).
- Generacion y comprension de codigo.
- Vision multimodal: procesa imagenes mediante el proyector `mmproj` en BF16, que debe cargarse junto con la cuantizacion.
- Soporte multilingue en 24 idiomas, incluyendo espanol, ingles, frances, aleman, portugues, italiano, ruso, chino, arabe, hindi, japones y coreano, entre otros.
- Conversacion multi-turno (pipeline conversacional).
- Formato de plantilla compatible con `mistral-common`.
- Comportamiento sin filtros de rechazo (3/100 rechazos declarados), orientado a contenido sin censura.
- No se documenta soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como varia el comportamiento del modelo al eliminar los mecanismos de rechazo, comparando respuestas con el Magistral original y midiendo la degradacion mediante KL divergence.
- Analisis de contenido sensible en entornos controlados: redaccion y evaluacion de escenarios de ficcion, narrativa o divulgacion que el modelo original rechazaria, con la ventaja de mantener la coherencia del razonamiento.
- Despliegue local en estaciones de trabajo: al caber en una RTX 4090 o en un MacBook con 32 GB de RAM una vez cuantizado, es adecuado para prototipado offline sin dependencia de API.
- Procesamiento de documentos con imagenes: gracias al proyector de vision, puede extraer y razonar sobre informacion de capturas, diagramas o PDF renderizados en flujos de analisis documental.
- Asistencia de codigo en local: generacion y explicacion de codigo en un entorno aislado, util para equipos que no pueden enviar codigo propietario a servicios en la nube.
- Traduccion y atencion multilingue: con 24 idiomas soportados, sirve para tareas de traduccion o asistencia en mercados con idiomas menos cubiertos por otros modelos abiertos (neerlandes, nepali, serbio, vietnamita, bengali).
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece seis niveles (BF16 a Q4_K_M), lo que permite medir el impacto de la cuantizacion en la calidad del razonamiento en un mismo modelo.

## Benchmarks y rendimiento

La model card unicamente reporta metricas del proceso de abliteration, no benchmarks estandar de razonamiento:

| Metrica | Este modelo | Magistral-Small-2509 original |
|---|---|---|
| KL divergence | 0,0493 | 0 (por definicion) |
| Rechazos | 3/100 | 92/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 48 GB en BF16, 25-26 GB en Q8_0, 20-21 GB en Q6_K, 17-18 GB en Q5_K_M, 16-17 GB en Q5_K_S y 14-15 GB en Q4_K_M (estimaciones a partir del tamano de parametros; no confirmadas en la model card).
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) para Q6_K, Q5_K_M, Q5_K_S y Q4_K_M; RTX 3090 (24 GB) para los mismos niveles.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones de Q6_K hacia abajo; el autor indica que el modelo base cabe en una RTX 4090 o en un MacBook con 32 GB de RAM una vez cuantizado.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y otras herramientas compatibles con GGUF; el tag de libreria es `vllm` pero los pesos publicados son GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic v2 GGUF) | 23,57 B | no disponible | Si (mmproj) | Apache 2.0 | Sin censura, 3/100 rechazos, KL 0,0493 |
| mistralai/Magistral-Small-2509 | 23,57 B | no disponible | Si | Apache 2.0 | Modelo original con alineacion completa, 92/100 rechazos |
| Mistral Small 3.2 (2506) | ~24 B | no disponible | Si | Apache 2.0 | Base sin modo de razonamiento explicito |
| Magistral Small 1.1 (2507) | ~24 B | no disponible | No documentado | Apache 2.0 | Version previa sin vision ni mejoras de tono |

## Limitaciones y advertencias

- La abliteration elimina los rechazos, pero no garantiza la eliminacion de sesgos subyacentes en los datos de entrenamiento; el modelo puede producir contenido sesgado, ofensivo o factualmente incorrecto sin advertirlo.
- Riesgo elevado de alucinacion en modo "thinking": las cadenas de razonamiento largas pueden contener pasos plausibles pero erroneos, especialmente en matematicas y datos factuales.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el despliegue de un modelo sin filtros conlleva responsabilidad legal y reputacional; se recomienda moderacion externa en produccion.
- La ausencia de rechazos puede facilitar la generacion de contenido danino; debe evaluarse el cumplimiento normativo (por ejemplo, la AI Act europea) antes de cualquier uso publico.
- No se documentan en la informacion disponible el contexto maximo, el soporte de tool calling ni los resultados de benchmarks estandar, lo que limita la evaluacion objetiva de su calidad frente al original.
- La cuantizacion Q4_K_M y Q5_K_S pueden degradar la coherencia del razonamiento en tareas complejas; el autor recomienda Q8_0 como opcion casi sin perdida.
- El proyector de vision debe cargarse por separado; sin el, las capacidades multimodales no funcionan.
- El repositorio depende de la cuenta del autor, que declara haber alcanzado el limite de almacenamiento gratuito de Hugging Face; existe riesgo de que los archivos dejen de estar disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Magistral-Small-2509-ultra-uncensored-heretic-v2
- Modelo original de Mistral: https://huggingface.co/mistralai/Magistral-Small-2509
- Mistral Small 3.2 (2506): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Magistral Small 1.1 (2507): https://huggingface.co/mistralai/Magistral-Small-2507
- Blog de Magistral: https://mistral.ai/news/magistral/
- Paper de Magistral: https://huggingface.co/papers/2506.10910
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation: https://github.com/p-e-w/heretic/pull/211
- Politica de privacidad de Mistral: https://mistral.ai/terms/
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
- Apoyo al autor (Patreon): https://patreon.com/LLMfan46
