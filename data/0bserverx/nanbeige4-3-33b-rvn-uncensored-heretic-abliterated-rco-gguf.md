# 0bserverx/Nanbeige4.3-33B-RVN-Uncensored-Heretic-Abliterated-RCO-GGUF

## Resumen

Nanbeige4.3-33B-RVN-Uncensored-Heretic-Abliterated-RCO-GGUF es una colección de cuantizaciones GGUF de una versión con las negativas de seguridad eliminadas (abliterated) del modelo Nanbeige4.3-33B, desarrollado originalmente por Nanbeige y modificado y cuantizado por el usuario 0bserverx. El trabajo se ha realizado en dos fases: primero se ha aplicado abliteración mediante la herramienta heretic con la rama ARA (adapted refusal ablation) sobre los pesos completos en BF16, y después se han generado cuantizaciones GGUF optimizadas para tarjetas gráficas de consumo de 16 a 24 GB de VRAM, con especial énfasis en una construcción de precisión mixta RCO de 2,60 bits por peso que permite ejecutar un modelo de 33B en una GPU de 16 GB con contexto de 16K.

El problema que resuelve este modelo es doble: por un lado, elimina los rechazos de seguridad del modelo original con el mínimo daño posible a sus capacidades (midiendo la divergencia KL frente al modelo original); por otro, hace accesible un modelo de 33 mil millones de parámetros a hardware de consumo mediante cuantización agresiva de calidad medida empíricamente. El modelo base soporta generación de texto con razonamiento (thinking) y está orientado a inglés y chino. Es relevante para usuarios que necesiten un modelo sin filtros de seguridad de tamaño medio-grande que quepa íntegramente en una sola GPU de consumo, aunque conlleva advertencias importantes sobre su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; derivado de Nanbeige4.3-33B) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 16.384 tokens (configuracion medida en la model card; maximo nativo no disponible) |
| Tipos de cuantizacion | RCO 2,60 bpw (IQ2_S), IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, F16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); BF16 safetensors en el repositorio del modelo base |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.3-33B, un transformer de 33 mil millones de parametros. La model card no proporciona detalles sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset del modelo original. El modelo incorpora un modo de razonamiento (thinking), lo que indica que el modelo base fue entrenado para generar bloques de razonamiento antes de la respuesta final.

Sobre el modelo base se ha aplicado un proceso de abliteracion de negativas mediante la herramienta heretic en su rama `ara` (commit `edc3b12`), con ARA sobre pesos completos (`--use-ara --no-use-ara-lora`) y sin cuantizar durante la busqueda. ARA optimiza conjuntamente la eliminacion de rechazos y la divergencia KL respecto al modelo original, en lugar de proyectar una sola direccion. La busqueda se realizo con dos estudios independientes de Optuna de 100 pruebas cada uno, una por GPU. Dos detalles relevantes del proceso: se uso el system prompt por defecto que inyecta la plantilla de chat de Nanbeige (no el generico de heretic), y dado que el modelo se niega despues del bloque de razonamiento, las pruebas forzaron un prefijo de respuesta para que la ventana de busqueda de 100 tokens pudiera detectar el rechazo.

Para la cuantizacion se genero una imatrix propia del modelo abliterated, con embeddings y capa de salida a mayor precision. La construccion destacada es el RCO 2,60 bpw de precision mixta (11,6 GB), que segun las mediciones del autor supera claramente a un IQ2_S puro de tamano equivalente en perplexidad (25,51 frente a 28,06) y en HellaSwag y WinoGrande. No hay informacion sobre RLHF/DPO mas alla de lo que pudiera traer el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con pipeline de text-generation.
- Modo de razonamiento (thinking): el modelo genera un bloque de razonamiento antes de responder.
- Respuesta a instrucciones sin rechazos de seguridad: en una prueba de 100 prompts daninos, el modelo original rechazaba 95 y este modelo rechaza 0, manteniendo el 97 % de acierto en prompts inofensivos.
- Fidelidad razonable al modelo original: KL de 0,0115 frente al original segun la metrica de heretic.
- Compatibilidad con plantilla de chat Jinja (`--jinja` en llama.cpp).
- No hay informacion sobre soporte de tool calling / function calling.
- No hay informacion sobre capacidades de vision o audio.
- No hay informacion sobre soporte de agentes o razonamiento multi-paso estructurado.

## Casos de uso

- Ejecucion local en GPU de 16 GB sin cuantizacion extrema de calidad inaceptable: la construccion RCO 2,60 bpw (11,6 GB) permite correr un modelo de 33B con 16K de contexto en tarjetas como la RTX 4080, 4060 Ti 16G o A4000, dejando unos 3 GB libres.
- Investigacion en alineacion y abliteracion: al mantener una KL muy baja (0,0115) frente al modelo original, sirve como sujeto de estudio para comparar el efecto de la eliminacion de rechazos en el comportamiento del modelo.
- Chatbot sin filtros para uso personal: el modelo responde a instrucciones que otros modelos rechazarian, util en entornos controlados donde el usuario asume la responsabilidad del contenido.
- Analisis comparativo de cuantizaciones: el repositorio incluye cuantizaciones estandar (IQ2_XXS a IQ4_XS) con perplexidad y benchmarks medidos, util como referencia para estudiar el impacto de la cuantizacion en modelos de 33B.
- Despliegue en GPU de 24 GB con mayor calidad: la variante IQ4_XS (18 GB) deja unos 5 GB libres en una RTX 3090 o 4090, con perplexidad practicamente identica a la del modelo F16.
- Servidor de inferencia local: el comando de ejemplo usa `llama-server` de llama.cpp con KV cache cuantizado a q8_0 y flash attention, adecuado para montar un endpoint OpenAI-compatible en local.
- Generacion de texto en chino e ingles en entornos sin acceso a la nube: el bilinguismo del modelo base se conserva tras la abliteracion.

## Benchmarks y rendimiento

Datos medidos por el autor del repositorio. Comparativa del modelo abliterated frente al original:

| Metrica | Original | Este modelo |
|---|---|---|
| Prompts daninos rechazados (n=100) | 95 | 0 |
| Prompts inofensivos respondidos (n=100) | 97 | 97 |
| KL vs original (metrica heretic) | – | 0,0115 |
| wikitext-2 PPL, F16 | 25,53 | 24,57 |

Cuantizaciones incluidas en el repositorio:

| GGUF | Tamano | PPL | Δ vs F16 | HellaSwag-400 | WinoGrande-500 |
|---|---|---|---|---|---|
| F16 | 66,2 GB | 24,57 | – | – | – |
| RCO 2,60 bpw | 11,6 GB | 25,51 | +3,8 % | 69,25 | 67,0 |
| IQ3_S | 14,8 GB | 24,71 | +0,6 % | 72,25 | 69,0 |
| IQ4_XS | 18,0 GB | 25,02 | +1,8 % | 74,25 | 68,8 |
| IQ2_XXS | 9,3 GB | 32,08 | +30,6 % | 64,75 | 59,4 |
| IQ2_XS | 10,2 GB | 30,02 | +22,2 % | 67,25 | 64,4 |
| IQ2_S | 10,8 GB | 28,06 | +14,2 % | 66,50 | 62,8 |
| IQ3_XXS | 13,1 GB | 26,03 | +5,9 % | 71,75 | 70,2 |

Nota del autor: el error de PPL es de aproximadamente ±0,25 y el de WinoGrande de ±2,1, por lo que IQ3_S, IQ4_XS y Q4_K_M (no publicado) son estadisticamente equivalentes en calidad. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM medida con `-c 16384 -ctk q8_0 -ctv q8_0 -fa on` tras una peticion de calentamiento:
  - RCO 2,60 bpw: 13.081 MiB (unos 3 GB libres en una GPU de 16 GB).
  - IQ3_S: 16.223 MiB (demasiado justo para 16 GB a 16K; correcto en 20 GB).
  - IQ4_XS: 19.191 MiB (unos 5 GB libres en 24 GB).
  - Q4_K_M (no publicado): 21.123 MiB a 16K, muy justo en 24 GB.
  - IQ2_XXS: 11.163 MiB; IQ2_XS: 12.021 MiB; IQ2_S: 12.489 MiB; IQ3_XXS: 14.635 MiB (cabe en 16 GB pero deja solo unos 1,5 GB libres).
- GPU recomendadas por tier:
  - 16 GB: RTX 4080, RTX 4060 Ti 16G, A4000 (con RCO 2,60 bpw).
  - 20 GB: RTX 4000 Ada 20G, Radeon 7900 XT (con IQ3_S).
  - 24 GB: RTX 3090, RTX 4090, Radeon 7900 XTX (con IQ4_XS).
  - 80 GB o mas: pesos BF16 safetensors con transformers o vLLM (66 GB).
- Cabe en GPU de consumo: si, desde 16 GB con la variante RCO 2,60 bpw.
- Despliegue: llama.cpp (llama-server con `-ngl 99 -c 16384 -ctk q8_0 -ctv q8_0 -fa on --jinja`); para BF16, transformers y vLLM. No se menciona Ollama ni TGI.
- Velocidad: decodificacion de unos 100 tok/s en una RTX PRO 6000 (dato medido por el autor). No hay datos de latencia para otras GPU.

## Comparativa con modelos similares

Comparativa con alternativas de tamano similar orientadas a inferencia local en GPU de consumo:

| Modelo | Parametros | Contexto | Cuantizacion minima viable 16 GB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-RVN-Uncensored-Heretic-Abliterated-RCO-GGUF | 33,1B | 16K medida (nativa no disponible) | RCO 2,60 bpw (11,6 GB) | Apache 2.0 | GGUF y BF16 en Hugging Face |
| Nanbeige4.3-33B (original) | 33,1B | no disponible | requiere cuantizaciones de terceros | no disponible | safetensors en Hugging Face |
| Qwen2.5-32B-Instruct | 32,5B | 128K | Q3_K_M aprox. (no dato oficial) | Apache 2.0 (Instruct) | safetensors y GGUF comunitarios |
| Qwen3-32B | 32,8B | 128K nativa | Q3_K_M aprox. (no dato oficial) | Apache 2.0 | safetensors y GGUF comunitarios |

Nota: los datos de contexto y cuantizacion de Qwen2.5-32B y Qwen3-32B proceden de conocimiento general y no de la informacion proporcionada; no hay una comparativa directa publicada en la model card. La ventaja diferencial de este modelo es la eliminacion de rechazos con KL minima y las cuantizaciones medidas para tiers de 16/20/24 GB; en cambio, carece de la ventana de contexto larga de las alternativas Qwen.

## Limitaciones y advertencias

- Problema conocido de "unclosed thinking": en algunos prompts la respuesta final queda dentro del bloque de razonamiento sin cerrar; la model card exige leer esta seccion antes de desplegar. Es un fallo relevante para produccion.
- Eliminacion total de rechazos de seguridad: el modelo responde a prompts daninos sin filtros (0 de 100 rechazados). Su uso para generar contenido perjudicial es responsabilidad exclusiva del usuario y puede ser ilegal segun la jurisdiccion.
- Riesgo de alucinacion: no evaluado en la model card; al tratarse de un modelo abliterated, no hay que asumir que las salvaguardas del modelo original mitiguen respuestas erroneas.
- Cuantizacion agresiva en el tier de 16 GB: la variante RCO 2,60 bpw pierde un 3,8 % de perplexidad frente a F16; las variantes IQ2 puras de tamano similar pierden hasta un 14-22 %, por lo que la eleccion de la variante es critica.
- Idiomas limitados a ingles y chino; no hay soporte declarado para castellano.
- Ventana de contexto medida de 16K; el maximo nativo del modelo no esta disponible en la informacion proporcionada.
- Sin datos de tool calling, agentes ni benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta evaluarlo para casos de uso de produccion complejos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo derivado hereda las modificaciones de abliteracion realizadas por un tercero sin auditoria del autor original.
- Estadisticamente, IQ3_S, IQ4_XS y Q4_K_M son equivalentes en calidad segun el autor; elegir cuantizaciones mas pequenas implica perdida medible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/0bserverx/Nanbeige4.3-33B-RVN-Uncensored-Heretic-Abliterated-RCO-GGUF
- Modelo base abliterated (BF16 safetensors): https://huggingface.co/0bserverx/Nanbeige4.3-33B-RVN-Heretic-Abliterated-Uncensored
- Modelo original de Nanbeige: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Herramienta heretic (GitHub): https://github.com/p-e-w/heretic
