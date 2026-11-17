# nerun/Qwopus3.5-9B-v3-i1-MTP-GGUF

## Resumen

Qwopus3.5-9B-v3-i1-MTP-GGUF es una distribucion de pesos en formato GGUF publicada por el usuario nerun que combina dos elementos: por un lado, las cuantizaciones imatrix del modelo Qwopus3.5-9B-v3 (derivado de Qwen3.5-9B y publicado originalmente por Jackrong, cuantizado por mradermacher); por otro, un bloque MTP (Multi-Token Prediction) injertado tensor a tensor desde Qwen3.5-9B, sin reentrenamiento. El resultado es un unico fichero GGUF que actua como modelo principal y como cabezal de borrador para decodificacion especulativa en llama.cpp mediante el flag `--spec-type draft-mtp`.

El modelo resuelve un problema practico: Qwopus3.5-9B-v3 se distribuye sin tensores MTP, por lo que no puede aprovechar la decodificacion especulativa nativa de llama.cpp sin cargar un modelo borrador separado, lo que consume VRAM adicional. Al compartir el bloque MTP los embeddings de tokens (`token_embd`) y la capa de salida (`output`) con el modelo principal, el injerto anade solo unos 0,2 GiB al fichero y evita duplicar esos tensores en memoria.

La relevancia es operativa: permite acelerar la generacion de un modelo de aproximadamente 9.000 millones de parametros en hardware modesto (desde 8 GB de VRAM con cuantizaciones IQ1/IQ2) manteniendo un unico fichero. La tasa de aceptacion del borrador reportada por el autor esta en el rango 0,6-0,7. La licencia es Apache 2.0. Los pesos se ofrecen en 24 cuantizaciones que van de IQ1_S (2,7 GiB) a Q6_K (7,1 GiB), con proyectores de vision (mmproj) incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B (arquitectura `qwen35` en llama.cpp), con bloque MTP adicional (`blk.32.*`) de atencion completa |
| Parametros totales | Aproximadamente 9.000 millones (el campo safetensors del repo indica 456.010.480, dato no coherente con el tamano nominal del modelo; se toma como referencia el nombre y el tamano de los ficheros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el ejemplo de uso configura `-fitc 32768` (32.768 tokens) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix i1 en el modelo principal; bloque MTP en Q4_K_M, Q5_K_M o Q6_K segun fichero) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyectores de vision mmproj incluidos |

## Arquitectura y entrenamiento

El modelo principal es Qwopus3.5-9B-v3, un transformer denso construido sobre Qwen3.5-9B. La arquitectura `qwen35` en llama.cpp presenta 32 capas en el modelo original; el injerto eleva `block_count` a 33 para alojar el bloque MTP. Este bloque adicional es una capa de atencion completa con tensores `attn_q`, `attn_k`, `attn_v` y `attn_output`, sin componentes de estado recurrente (`ssm_*`). El autor indica que el bloque MTP comparte `token_embd` y `output` con el modelo principal, lo que explica que el incremento de tamano sea de solo unos 0,2 GiB.

El bloque MTP no fue entrenado sobre Qwopus3.5-9B-v3, sino que procede de Qwen3.5-9B original, extraido en el repositorio a4lg/Qwen3.5-9B-MTP-ONLY-GGUF. El injerto se realizo copiando tensores con el script `convert.py` de @buzz, siguiendo el "Metodo 2" descrito en el README de a4lg. El autor documenta una correccion necesaria: el script original no funcionaba para la arquitectura `qwen35` porque elevaba `block_count` de 32 a 33 pero no extendia las claves de arrays por capa, provocando el error `key qwen35.attention.recurrent_layers has wrong array length; expected 33, got 32`. La solucion fue extender dichos arrays anadiendo `False` para el bloque MTP. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento, segun las etiquetas del repositorio (`conversational`, `reasoning`).
- Generacion de codigo y uso en entornos agenticos (`code`, `agentic`).
- Tool calling y function calling (`tool-use`).
- Vision: los proyectores multimodales (mmproj) estan incluidos y fueron entrenados especificamente para este modelo, tomados de mradermacher/Qwopus3.5-9B-v3-GGUF.
- Decodificacion especulativa integrada mediante bloque MTP embebido, activable con `--spec-type draft-mtp` en llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones Q4_K_M o superiores (5,4-7,1 GiB) el modelo cabe en GPUs de consumo y puede integrarse en editores o terminales mediante llama-server, aprovechando el tool calling para ejecutar comandos y consultar ficheros.
- Agente multi-paso con herramientas: la combinacion de tool-use y decodificacion especulativa reduce la latencia por token, lo que resulta critico cuando un agente encadena decenas de llamadas a funciones en un mismo flujo.
- Procesamiento de documentos con imagenes: gracias a los proyectores mmproj incluidos, puede emplearse para extraer informacion de capturas, diagramas o formularios escaneados en un pipeline local sin depender de APIs externas.
- Despliegue en equipos con 8 GB de VRAM: las variantes IQ1_S a IQ2_M (2,7-3,5 GiB) permiten ejecutar el modelo en GPUs de gama de entrada, con el aviso del autor de mantener el micro-batch por defecto (`-ub 512`) para no degradar el rendimiento del MTP.
- Servicio de chat con contexto largo: la configuracion de ejemplo con `-fitc 32768` y cache KV cuantizada (`-ctk q8_0 -ctv q8_0`) habilita conversaciones multi-turno con historial extenso en una sola GPU.
- Evaluacion e investigacion de decodificacion especulativa: el repositorio sirve como caso practico de injerto de cabezales MTP entre modelos de la misma familia, util para estudiar tasas de aceptacion y ajustar `--spec-draft-n-max`.
- Prototipado de asistentes tecnicos offline: al ser Apache 2.0 y ejecutable con llama.cpp, encaja en entornos con requisitos de privacidad donde no se permite enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente reporta datos operativos de la decodificacion especulativa: tasa de aceptacion del borrador MTP de aproximadamente 0,6-0,7 en sus pruebas, y que `--spec-draft-n-max 2` rinde de forma consistente algo mejor que el valor por defecto 3, mientras que valores de 1 o de 4 en adelante resultan mas lentos. Tambien indica que en 8 GB de VRAM con `-ub 1024` o `-ub 2048` la generacion con MTP cae a aproximadamente 22 t/s.

## Requisitos de hardware

- VRAM estimada: desde unos 2,7 GiB (IQ1_S) hasta 7,1 GiB (Q6_K) solo para los pesos; hay que sumar cache KV y buffers de computo. El bloque MTP anade unos 0,2 GiB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones bajas (IQ1-IQ2, 2,7-3,5 GiB) caben en GPUs de 6-8 GB; las intermedias (Q4_K_M, 5,4 GiB) en GPUs de 8-12 GB; las altas (Q6_K, 7,1 GiB) requieren 10-12 GB o mas para dejar margen a cache KV y buffers.
- Cabe en GPU de consumo: si, en el rango IQ1_S a Q4_K_M con 8 GB de VRAM, segun las pruebas del propio autor en 8 GB.
- Opciones de despliegue: llama.cpp con soporte de `--spec-type draft-mtp` (llama-server en el ejemplo). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: el autor cita aproximadamente 22 t/s en un escenario degradado (8 GB de VRAM con micro-batch grande). No se aportan cifras de throughput en configuracion optima.
- Nota de despliegue: el fichero injertado debe usarse como modelo principal; no debe pasarse de nuevo con `--model-draft`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP embebido | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nerun/Qwopus3.5-9B-v3-i1-MTP-GGUF | ~9B | no disponible (ejemplo con 32.768) | Si (injertado) | Si (mmproj) | Apache 2.0 | GGUF en HF |
| mradermacher/Qwopus3.5-9B-v3-i1-GGUF | ~9B | no disponible | No | Si (mmproj en repo hermano) | Apache 2.0 | GGUF en HF |
| Jackrong/Qwopus3.5-9B-v3 | ~9B | no disponible | No | no disponible | no disponible | HF |
| Qwen/Qwen3.5-9B | ~9B | no disponible | Si (origen del bloque) | no disponible | no disponible | HF |

La diferencia principal frente a las alternativas es la presencia del bloque MTP embebido, que habilita decodificacion especulativa sin cargar un modelo borrador adicional. Frente a Qwen3.5-9B, el modelo conserva el cabezal MTP original pero con pesos principales ajustados por Qwopus. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El cabezal MTP fue entrenado sobre Qwen3.5-9B, no sobre Qwopus3.5-9B-v3; la tasa de aceptacion de 0,6-0,7 es inferior a la que cabria esperar de un borrador especifico del modelo.
- El injerto se realizo sin entrenamiento, copiando tensores; no hay garantia de que el bloque MTP sea optimo para los pesos de Qwopus.
- Requiere una build de llama.cpp con soporte de `--spec-type draft-mtp`; versiones sin ese flag no podran aprovechar la funcionalidad.
- El autor advierte de que el fichero no debe pasarse con `--model-draft`, ya que contiene el modelo principal y el borrador en un solo archivo.
- En 8 GB de VRAM, aumentar el micro-batch por encima de 512 degrada notablemente el rendimiento del MTP (aproximadamente 22 t/s).
- El dato de parametros totales del campo safetensors (456.010.480) no es coherente con el tamano nominal de 9B ni con el tamano de los ficheros; debe tratarse con cautela.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwopus3.5-9B-v3 y de Qwen3.5-9B, no confirmadas en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerun/Qwopus3.5-9B-v3-i1-MTP-GGUF
- Modelo base cuantizado: https://huggingface.co/mradermacher/Qwopus3.5-9B-v3-i1-GGUF
- Modelo Qwopus3.5-9B-v3 original: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3
- Donante del bloque MTP: https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- Modelo Qwen3.5-9B original: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyectores de vision: https://huggingface.co/mradermacher/Qwopus3.5-9B-v3-GGUF
- Script de injerto `convert.py` de @buzz: https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
