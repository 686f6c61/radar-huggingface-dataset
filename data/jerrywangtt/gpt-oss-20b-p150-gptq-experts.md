# jerrywangTT/gpt-oss-20b-p150-gptq-experts

## Resumen

`jerrywangTT/gpt-oss-20b-p150-gptq-experts` no es un modelo independiente, sino un conjunto de pesos derivados de `openai/gpt-oss-20b` redistribuidos en un formato específico para su ejecución sobre hardware Tenstorrent. En concreto, contiene únicamente los pesos de los expertos enrutados del modelo base, redondeados offline a la rejilla numérica `bfloat4_b` que tt-metal emplea para almacenar dichos expertos en el acelerador P150. El repositorio incluye 24 ficheros `layer_0.pt` a `layer_23.pt`, uno por capa, de aproximadamente 1,6 GB cada uno, con un total de 36 GB.

El problema que resuelve es de compatibilidad numérica y de rendimiento en inferencia: los valores MXFP4 originales del checkpoint de OpenAI no encajan en la rejilla `bfloat4_b` (bloques de 16 columnas de salida consecutivas que comparten exponente, con signo y magnitud de 3 bits por valor), y un redondeo directo al vecino más cercano introduce un error del 9-11 % en la salida de cada experto. El autor aplica GPTQ con calibración real y reordena canales intermedios para reducir ese error a un 6,39 % en validación.

La relevancia es acotada pero clara para quien trabaje con el stack de Tenstorrent: permite ejecutar gpt-oss-20b en una P150 con decodificación a 32,15 ms/token (31,1 tokens/s por usuario) y un TTFT trazado de 556 ms, manteniendo una precisión top-1 del 83 % frente a la referencia. No es un modelo para uso general en GPU convencional ni un fine-tune con capacidades nuevas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE derivada de openai/gpt-oss-20b (pesos de expertos enrutados únicamente) |
| Parámetros totales | no disponible (el repo contiene solo los pesos de expertos, 36 GB en bfloat16) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat4_b (bloques de 16 columnas, exponente compartido, signo + magnitud de 3 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `torch.save` (`.pt`), un dict por capa; tensores en bfloat16 y sesgos en float32 |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: transforma los pesos de los expertos enrutados de `openai/gpt-oss-20b` para que encajen exactamente en la rejilla `bfloat4_b` de tt-metal. Cada fichero por capa contiene cuatro tensores: `gate_up_proj` con forma `[32, 2880, 5760]` (columnas de gate y up intercaladas), `gate_up_proj_bias` `[32, 5760]`, `down_proj` `[32, 2880, 2880]` y `down_proj_bias` `[32, 2880]`. El prefijo 32 corresponde al número de expertos por capa.

El proceso de conversión combina tres técnicas. Primero, GPTQ: las filas de entrada se redondean una a una y el error de redondeo se propaga a las filas aún no procesadas mediante la inversa de la Hessiana calculada con entradas reales de los expertos (damping 0,01, filas ordenadas por energía de entrada). Segundo, reordenación de canales intermedios: mediante una búsqueda de intercambios de 30.000 pasos por capa, partiendo de una ordenación por escala MXFP4 media, se agrupan canales de magnitud similar en cada bloque de 16, moviendo conjuntamente columnas de gate y up, sus sesgos y las filas de down para preservar la función del experto. Tercero, calibración con el modelo de referencia en CPU y bf16 sobre 180.224 tokens en fragmentos de 4.096, compuestos por trazas de razonamiento de gpt-oss-20b, algo de código y documentación.

El error de salida en validación (expertos completos no vistos) es del 9,27 % con GPTQ solo y del 6,39 % con los canales reordenados. Todos los valores caen en la rejilla `bfloat4_b`, de modo que la conversión en tt-metal los conserva bit a bit y la decodificación y el prefill leen los mismos bytes a la misma velocidad que los expertos por defecto.

## Capacidades

- Generación de texto y razonamiento heredados de `openai/gpt-oss-20b` (el artefacto no modifica el modelo más allá del redondeo de expertos).
- Ejecución de inferencia en hardware Tenstorrent P150 mediante el árbol de arranque gpt-oss-20b de tt-metal (commit `8174a1344cc`).
- Decodificación y prefill con los mismos bytes y velocidad que los expertos por defecto del checkpoint.
- Carga selectiva por capa mediante la variable de entorno `GPT_OSS_EXPERTS_GPTQ_DIR`.
- No incluye capacidades nuevas: tool calling, agentes, visión o multilingüismo dependen íntegramente del modelo base y no se documentan en este repositorio.

## Casos de uso

- Despliegue de gpt-oss-20b en aceleradores Tenstorrent P150: se descargan los 24 ficheros `layer_*.pt` y se apunta `GPT_OSS_EXPERTS_GPTQ_DIR` al directorio `gptq_search` para que `models/demos/gpt_oss/tt/mlp.py` cargue los expertos cuantizados en lugar de los del checkpoint.
- Evaluación de precisión tras cuantización en hardware real: útil para medir el impacto del redondeo `bfloat4_b` con GPTQ y reordenación de canales (top-1 83 %, top-5 99 %, PCC 0,980936) antes de adoptar el formato en producción.
- Investigación en cuantización post-entrenamiento: el repositorio documenta el procedimiento completo (damping, orden de filas, búsqueda de intercambios, calibración) y sirve como referencia reproducible para otros MoE.
- Benchmarking de tt-metal: permite comparar el rendimiento del árbol gpt-oss-20b (32,15 ms/token, TTFT 556 ms en batch 1) frente a otras configuraciones del mismo stack.
- Reutilización de caché de pesos convertidos: al nombrarse la caché `experts_gptq_<nombre de carpeta>`, mantener el directorio como `gptq_search` evita reconversiones costosas en iteraciones sucesivas.
- Pruebas de regresión numérica: los `SHA256SUMS` permiten verificar la integridad de los ficheros antes de ejecutar demos o tests del commit indicado.

## Benchmarks y rendimiento

Resultados publicados por el autor en el commit `8174a1344cc` sobre una P150, batch 1:

| Métrica | Valor |
|---|---|
| Decodificación | 32,15 ms/token |
| Throughput por usuario | 31,1 tokens/s |
| TTFT (trazado) | 556 ms |
| Precisión top-1 vs referencia | 83 % |
| Precisión top-5 vs referencia | 99 % |
| Top-1 trazado | 82 % |
| PCC | 0,980936 |
| Error de salida en validación (GPTQ solo) | 9,27 % |
| Error de salida en validación (con reordenación) | 6,39 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Acelerador Tenstorrent P150 (hardware objetivo del formato `bfloat4_b`).
- Almacenamiento: 36 GB para los 24 ficheros `layer_*.pt`, más el espacio de la caché de pesos convertidos.
- No está pensado para GPU convencional: los pesos están en formato `torch.save` con rejilla `bfloat4_b`, no en safetensors ni GGUF, y no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Despliegue mediante tt-metal en el commit `8174a1344cc`, rama `jerrywangTT/gptoss20b-p150-gptq-experts`, con la variable `GPT_OSS_EXPERTS_GPTQ_DIR` apuntando al directorio de pesos.
- Latencia y throughput medidos: 32,15 ms/token y 31,1 tokens/s por usuario en batch 1; TTFT trazado de 556 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jerrywangTT/gpt-oss-20b-p150-gptq-experts` | solo expertos (36 GB en bf16) | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Pesos GPTQ para Tenstorrent P150 |
| `openai/gpt-oss-20b` | no disponible en esta ficha | no disponible | Apache 2.0 | HuggingFace | Modelo base original en MXFP4 |
| Expertos por defecto del checkpoint | no disponible | no disponible | Apache 2.0 | Incluidos en el modelo base | Usados por tt-metal si no se define `GPT_OSS_EXPERTS_GPTQ_DIR` |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: solo contiene los pesos de los expertos enrutados; requiere el resto del checkpoint `openai/gpt-oss-20b` y el stack tt-metal para funcionar.
- Error de cuantización no nulo: 6,39 % de error de salida en validación con la configuración final, lo que puede degradar tareas sensibles a la precisión numérica.
- Dependencia estricta de hardware: el formato `bfloat4_b` y la carga vía `GPT_OSS_EXPERTS_GPTQ_DIR` están atados a Tenstorrent P150 y al commit `8174a1344cc`; no hay soporte declarado para GPU.
- Si `GPT_OSS_EXPERTS_GPTQ_DIR` no está definida, tt-metal usa los expertos del checkpoint sin aviso, lo que puede llevar a confundir configuraciones en producción.
- La caché de pesos convertidos se nombra según la carpeta (`experts_gptq_<nombre>`); renombrar `gptq_search` invalida la caché existente.
- Sin datos publicados sobre sesgos, alucinación, cobertura idiomática ni benchmarks estándar en este repositorio; deben consultarse en la documentación del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de tt-metal por separado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/jerrywangTT/gpt-oss-20b-p150-gptq-experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Commit de tt-metal: https://github.com/tenstorrent/tt-metal/commit/8174a1344cc9eb3e8c9ae400c8674e54028f3ae1
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
