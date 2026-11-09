# Iuhuujjhy/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una republicación de los archivos GGUF generados por orcarouter a partir de Qwen3.8-27B, un modelo de 27.320.697.856 parámetros (27,32 mil millones) desarrollado por el equipo Qwen. La variante "Uncensored" es una versión abliterada, es decir, con el alineamiento de seguridad sustancialmente eliminado mediante la técnica de abliteration, que proyecta fuera del espacio de activaciones las direcciones asociadas a la negativa a responder. El resultado es un modelo que cumple peticiones que el Qwen3.8-27B original rechaza.

El repositorio de Iuhuujjhy no aporta pesos nuevos: contiene tres copias byte a byte de los archivos de orcarouter (IQ3_M, Q4_K_M y Q8_0), verificadas con hash SHA-256, sin recuantizar ni modificar. El autor las redistribuye bajo la licencia Apache-2.0 heredada de Qwen como los niveles Silver, Gold y Platinum de una iniciativa denominada DeepSeek Unchained. Los archivos son exclusivamente de texto: no incluyen cabecera MTP ni proyector multimodal mmproj.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 27B en formato GGUF listo para llama.cpp con la arquitectura `qwen35`; por otro, sirve de ejemplo de la cadena de redistribución de modelos abliterados y de los riesgos asociados a su uso en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8; arquitectura llama.cpp `qwen35`) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M, Q4_K_M, Q8_0 (incluidas en el repo); el autor midio tambien Q3_K_M, Q5_K_M y Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp); sin safetensors en este repo |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B mas alla de que se trata de un transformer denso de 27,32 mil millones de parametros y de que llama.cpp lo identifica con la arquitectura `qwen35`. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de atencion (completa o hibrida) ni la longitud de contexto nativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineamiento (RLHF, DPO u otras) del modelo original.

Lo que si esta documentado es el proceso de posentrenamiento aplicado por orcarouter: una abliteration que elimina las direcciones de activacion responsables de las respuestas de rechazo, dando lugar a la variante "Uncensored". Sobre esa variante se generaron las cuantizaciones GGUF. El autor de este repositorio midio seis cuantizaciones contra el archivo F16 de orcarouter con `llama-perplexity` (divergencia KL frente a los logits F16, wikitext-2-raw, contexto 512, 100 chunks) y `llama-bench` en un Apple M4 Max con 128 GB de memoria, usando llama.cpp b10919.

## Capacidades

- Generacion de texto conversacional en formato GGUF para llama.cpp.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-27B (no verificados de forma independiente en la informacion disponible).
- Comportamiento sin alineamiento de seguridad: responde a peticiones que el modelo original rechaza.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidades multimodales: no disponibles en estos archivos (sin mmproj).
- Capacidades de tool calling, agentes, thinking mode o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo permite estudiar empiricamente que comportamientos cambian al eliminar las direcciones de rechazo, comparando sus salidas con las del Qwen3.8-27B original en el mismo conjunto de prompts.
- Evaluacion de robustez de filtros: util para probar si los sistemas de moderacion de una aplicacion detectan y bloquean contenido que un modelo sin alineamiento puede generar, midiendo tasas de evasion.
- Despliegue local en estaciones de trabajo: con la cuantizacion IQ3_M (12,77 GB) el modelo cabe en GPUs de consumo con 16 GB de VRAM, lo que permite ejecutar un modelo de 27B en hardware asequible mediante llama.cpp.
- Generacion de texto creativo sin restricciones tematicas: para proyectos de ficcion o guion donde el autor necesita explorar temas que los modelos alineados rechazan, asumiendo la responsabilidad editorial del contenido.
- Banco de pruebas de red teaming: como generador de prompts adversarios y respuestas candidatas en ejercicios internos de seguridad ofensiva controlados.
- Prototipado rapido con llama.cpp: los archivos Q4_K_M (16,81 GB) ofrecen un equilibrio medido de calidad y velocidad (KLD medio 0,0205, 17,71 t/s en tg128 sobre M4 Max) para iterar en local sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo proporciona metricas de fidelidad de cuantizacion y velocidad medidas con llama.cpp b10919 en un Apple M4 Max de 128 GB:

| Cuantizacion | Tamano (GB) | KLD medio | KLD p99 | Coincidencia top token (%) | Ratio PPL vs F16 | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ3_M | 12,77 | 0,0576 | 0,568 | 89,78 | 1,0348 | 213,0 | 18,21 |
| Q3_K_M | 13,50 | 0,0687 | 0,635 | 88,75 | 1,0472 | 206,7 | 16,26 |
| Q4_K_M | 16,81 | 0,0205 | 0,201 | 93,75 | 1,0039 | 209,8 | 17,71 |
| Q5_K_M | 19,54 | 0,0064 | 0,063 | 96,49 | 1,0045 | 188,2 | 12,93 |
| Q6_K | 22,43 | 0,0023 | 0,020 | 97,82 | 1,0003 | 162,6 | 13,16 |
| Q8_0 | 29,05 | 0,0003 | 0,002 | 99,33 | 1,0014 | 182,3 | 10,93 |

## Requisitos de hardware

- VRAM estimada para inferencia: IQ3_M requiere aproximadamente 12,8 GB de pesos; Q4_K_M, unos 16,8 GB; Q8_0, unos 29 GB. Hay que sumar el espacio para el contexto KV cache, no cuantificado en los datos disponibles.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 3090/4080 (16 GB) justas para IQ3_M.
- Cabe en GPU de consumo: si, IQ3_M en GPUs de 16 GB y Q4_K_M en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (requiere compilacion reciente con arquitectura `qwen35`; probado con b10919). No se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: medidos en Apple M4 Max con 128 GB, entre 10,93 y 18,21 t/s en generacion (tg128) y entre 162,6 y 213,0 t/s en prefill (pp512) segun cuantizacion. No hay datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Alineamiento | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,32 B | no disponible | GGUF | Apache-2.0 | Eliminado (abliterated) | Tres cuantizaciones, solo texto |
| Qwen/Qwen3.8-27B | 27,32 B | no disponible | no disponible | Apache-2.0 | Completo | Modelo base original; rechaza peticiones |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27,32 B | no disponible | GGUF | Apache-2.0 | Eliminado (abliterated) | Fuente original; seis cuantizaciones |

No se dispone de informacion sobre otros modelos de tamano y categoria comparables (por ejemplo, otras variantes abliteradas de la familia Qwen) en los datos proporcionados.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido sustancialmente eliminado: el modelo cumplira peticiones que el Qwen3.8-27B original rechaza, con el riesgo legal y reputacional que ello implica.
- Riesgo elevado de generar contenido danino, sesgado o inexacto sin las salvaguardas del modelo base; no se han publicado evaluaciones de sesgo ni de tasas de alucinacion.
- Los archivos son solo de texto: no incluyen cabecera MTP ni proyector multimodal, por lo que no hay capacidades de vision.
- Requiere una version reciente de llama.cpp con soporte de la arquitectura `qwen35` (probado con b10919); versiones anteriores pueden fallar al cargar el modelo.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar el comportamiento en contextos largos ni en castellano.
- Licencia Apache-2.0 heredada: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y su conformidad con la ley aplicable.
- Repositorio con 0 descargas y 0 likes y sin validacion de la comunidad: la calidad de las cuantizaciones solo esta respaldada por las mediciones del propio autor.
- Los archivos son copias byte a byte de otro repositorio; la trazabilidad depende de que el repositorio de orcarouter siga disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Iuhuujjhy/Qwen3.8-27B-Uncensored-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runner requerido, arquitectura `qwen35`): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
