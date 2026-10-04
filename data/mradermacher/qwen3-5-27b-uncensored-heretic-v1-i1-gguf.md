# mradermacher/Qwen3.5-27B-uncensored-heretic-v1-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.5-27B-uncensored-heretic-v1-i1-GGUF`, una recuantizacion en formato GGUF del modelo `llmfan46/Qwen3.5-27B-uncensored-heretic-v1`. No es un modelo entrenado desde cero: el trabajo de mradermacher consiste en generar cuantizaciones ponderadas con imatrix (i-quants) y cuantizaciones estáticas a partir de los pesos originales, de modo que el modelo pueda ejecutarse en hardware de consumo mediante llama.cpp y derivados.

El modelo base es una variante "heretic" del Qwen3.5-27B, es decir, una version decensurada y ablacionada que, segun las etiquetas de la model card (`uncensored`, `decensored`, `abliterated`), ha reducido o eliminado los comportamientos de rechazo del modelo original de Qwen. El recuento real de parametros en safetensors es de 26.895.998.464 (~26,9 mil millones) y la model card del cuantizador indica que se trata de un modelo con capacidad de vision, con ficheros `mmproj` ubicados en el repositorio estatico asociado.

Es relevante ahora porque combina tres tendencias simultaneas: el interes por modelos de ~27B que caben en GPU de consumo con cuantizaciones agresivas, la demanda de variantes sin filtros de seguridad para investigacion en robustez y roleplay, y la publicacion de cuantizaciones imatrix de alta calidad en el ecosistema GGUF. La licencia declarada es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-27B; la model card no detalla la arquitectura) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (`en`) segun la model card; la etiqueta `ara` aparece en los tags sin aclaracion oficial |
| Licencia | Apache-2.0 (con enlace a la licencia de Qwen/Qwen3.5-27B) |
| Formato de pesos | GGUF (cuantizaciones imatrix `i1-*` y estaticas en el repositorio hermano); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La model card del cuantizador no incluye estos datos y se limita a documentar el proceso de cuantizacion. Lo unico verificable por metadatos es que se trata de un modelo derivado de Qwen3.5-27B y que ha pasado por un proceso de decensurado/ablacion identificado con la etiqueta `heretic`, sin que se detalle la metodologia empleada en esta ficha.

En cuanto al proceso de cuantizacion, sí hay informacion concreta: las cuantizaciones de este repositorio son de tipo imatrix (`i1`), calculadas a partir de un fichero `imatrix.gguf` de 0,1 GB que tambien se publica. Se generan dos familias: un conjunto estatico en un repositorio separado y un conjunto ponderado por imatrix en este repositorio. La model card indica que el modelo es de vision, con ficheros `mmproj` en el repositorio estatico en caso de existir.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` confirma el uso previsto para dialogos multi-turno.
- Capacidad de vision: la model card afirma explicitamente "This is a vision model"; los ficheros `mmproj` se alojan en el repositorio estatico.
- Ausencia de rechazo: las etiquetas `uncensored`, `decensored` y `abliterated` indican que el modelo no aplica las capas de rechazo tipicas, por lo que responde a peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo se declara ingles).
- Modo de razonamiento explicito (`thinking mode`), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay e ficcion interactiva: el modelo mantiene el personaje sin insertar avisos de seguridad a mitad de escena, algo habitual en modelos alineados; la etiqueta `conversational` y el decensurado lo hacen adecuado para narrativa ramificada y partidas de rol por texto.
- Red teaming y evaluacion de clasificadores de rechazo: para probar la robustez de un filtro de moderacion se necesita un generador que no se auto-censure; este modelo sirve como fuente controlada de contenido adversario en un entorno aislado.
- Generacion de datasets sinteticos para investigacion en seguridad: permite producir pares prompt-respuesta que los modelos alineados no generarian, utiles para entrenar o evaluar clasificadores de toxicidad.
- Asistente local privado sin conexion: al distribuirse en GGUF con cuantizaciones desde 10,8 GB, se puede desplegar en una estacion de trabajo con GPU de consumo y sin enviar datos a terceros, con la ventaja de que no aplica politicas de contenido del proveedor.
- Analisis de imagenes en local: dado que la model card lo declara modelo de vision, puede emplearse para descripcion o extraccion de informacion de imagenes si se carga junto con el fichero `mmproj` correspondiente (disponibilidad a confirmar en el repositorio estatico).
- Experimentacion con cuantizaciones y optimizacion de despliegue: el repositorio incluye desde Q1_S hasta Q6_K, lo que permite medir el impacto de cada nivel de cuantizacion en calidad y latencia sobre un mismo modelo de ~27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente referencia un grafico externo de perplejidad comparando tipos de cuantizacion de baja calidad (`https://www.nethype.de/huggingface_embed/quantpplgraph.png`) y un analisis de Artefact2 sobre el tema, pero no incluye cifras de MMLU, HumanEval, GSM8K ni similares para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de fichero de cada cuantizacion, mas overhead de contexto y buffers):
  - `i1-Q2_K` (10,8 GB): ~12-14 GB de VRAM.
  - `i1-IQ3_M` (12,7 GB): ~14-16 GB de VRAM.
  - `i1-Q4_K_S` (15,7 GB): ~18-20 GB de VRAM. La model card lo marca como "optimal size/speed/quality".
- GPU recomendadas:
  - 12-16 GB: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080 16 GB (Q2_K e IQ3_M).
  - 24 GB: RTX 3090, RTX 4090 (Q4_K_S y cuantizaciones mayores con contexto contenido).
  - 48 GB o mas (A6000, A100 40/80 GB, H100): permite cuantizaciones Q5/Q6 y contextos largos sin offload.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K, IQ3_M y Q4_K_S. Las cuantizaciones Q5_K_M y Q6_K requieren offload parcial a RAM o GPUs de 24 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. Para vision, el runtime debe soportar `mmproj` (llama.cpp con `libmtmd`, por ejemplo).
- Latencia y throughput estimados: no disponibles.
- Tamano total del repositorio: 137,3 GB, por la acumulacion de todos los niveles de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-27B-uncensored-heretic-v1-i1-GGUF | ~26,9B | no disponible | Apache-2.0 | GGUF imatrix | Objeto de esta ficha |
| mradermacher/Qwen3.5-27B-uncensored-heretic-v1-GGUF | ~26,9B | no disponible | Apache-2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix; aloja los `mmproj` |
| llmfan46/Qwen3.5-27B-uncensored-heretic-v1 | ~26,9B | no disponible | Apache-2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.5-27B-ultra-uncensored-heretic-v1 | no disponible | no disponible | no disponible | GGUF | Variante "ultra"; ~56,7 GB de repositorio, 35 likes y 1.120 descargas segun local-ai-zone |
| coder3101/Qwen3.5-27B-heretic | no disponible | no disponible | no disponible | safetensors | Base del cuantizado mradermacher/Qwen3.5-27B-heretic-GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparacion se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- Modelo decensurado: no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino. Su uso en produccion orientada al publico general es desaconsejable sin una capa de moderacion externa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser una variante ablacionada no se puede asumir que mantenga la fiabilidad factual del Qwen3.5-27B original.
- Idiomas: solo se declara ingles. El rendimiento en castellano no esta documentado y, en modelos decensurados, la ablacion puede degradar mas las lenguas no inglesas.
- Licencia: se declara Apache-2.0, pero el enlace de licencia apunta al fichero de licencia de Qwen/Qwen3.5-27B. Conviene verificar la compatibilidad de esa licencia con el uso comercial previsto antes de desplegar.
- Degradacion por cuantizacion: las cuantizaciones por debajo de Q4 (Q2_K, IQ2_*, Q1_*) reducen notablemente la calidad; la propia model card advierte que "IQ3_XXS probably better" que Q2_K.
- Procedencia: el proceso de abliteracion/decensurado no esta documentado en la ficha, por lo que no se puede auditar que capacidades se han visto afectadas ni si el ajuste ha introducido sesgos adicionales.
- Metadatos incompletos: sin contexto declarado, sin benchmarks y sin confirmacion de soporte de tool calling, lo que complica evaluar su idoneidad para pipelines de produccion.

## Enlaces

- Modelo en HuggingFace (imatrix GGUF): https://huggingface.co/mradermacher/Qwen3.5-27B-uncensored-heretic-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas (y `mmproj`): https://huggingface.co/mradermacher/Qwen3.5-27B-uncensored-heretic-v1-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.5-27B-uncensored-heretic-v1
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-27B-uncensored-heretic-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Variante "ultra uncensored" v1: https://huggingface.co/mradermacher/Qwen3.5-27B-ultra-uncensored-heretic-v1-i1-GGUF
- Variante "ultra uncensored" v2: https://huggingface.co/mradermacher/Qwen3.5-27B-ultra-uncensored-heretic-v2-i1-GGUF
- Ficha de la variante ultra en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-27b-ultra-uncensored-heretic-v1.html
- Guia de LLM locales sin censura por tier de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Ficha en Inferix del cuantizado heretic: https://inferix.co/models/mradermacher/Qwen3.5-27B-heretic-GGUF
- nethype GmbH: https://www.nethype.de/
