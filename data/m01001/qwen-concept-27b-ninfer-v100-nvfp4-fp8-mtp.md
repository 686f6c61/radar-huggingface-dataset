# m01001/Qwen-Concept-27B-NInfer-V100-NVFP4-FP8-MTP

## Resumen

Qwen Concept 27B NInfer V100 NVFP4/FP8 MTP es un artefacto de inferencia derivado de ConceptCountry/qwen-concept-27b, un modelo denso de 27.000 millones de parametros de la familia Qwen. La conversion, realizada por el usuario m01001 mediante el framework JimmyMax/ninfer-v100 v1.6.2, adapta el checkpoint original en formato compressed-tensors NVFP4 a un binario propietario `.ninfer` optimizado para ejecutarse en una Tesla V100 PCIe de 32 GB (arquitectura Volta, sm_70). No se trata de una publicacion oficial del autor del modelo base, sino de una conversion comunitaria.

El modelo conserva las ediciones del checkpoint original e incluye el componente MTP (Multi-Token Prediction) nativo, pero excluye los pesos de vision. La cuantizacion es hibrida: la mayoria de las proyecciones se importan como NVFP4 W4A16, las proyecciones fusionadas GDN Q/K/V/Z de las 48 capas de atencion lineal se re-codifican como FP8 con escalado por fila, y se mantienen algunos objetos en BF16/FP32 y Q8. El artefacto ocupa aproximadamente 19 GB en disco y unos 18,5 GiB en memoria al arrancar.

Su relevancia radica en que permite ejecutar un modelo de 27B en hardware Volta, que no soporta nativamente los formatos NVFP4 ni las instrucciones de las GPU Ampere o superiores. El autor reporta 66,46 tok/s en decodificacion con contexto corto y 60,90 tok/s con contexto de 7.202 tokens, usando MTP con dos tokens de borrador y KV en INT8, con un contexto configurado de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas de atencion lineal GDN (Gated DeltaNet) y componente MTP nativo |
| Parametros totales | 27B (familia densa de 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados en la prueba |
| Tipos de cuantizacion | Hibrida: NVFP4 W4A16 en la mayoria de proyecciones, FP8 con escalado por fila en Q/K/V/Z de 48 capas GDN, BF16/FP32 y Q8 en objetos seleccionados, KV en INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (binario propietario de NInfer; no es GGUF ni safetensors ni cargable directamente en Transformers/llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B con capas de atencion lineal GDN (Gated DeltaNet), segun se deduce de la presencia de proyecciones Q/K/V/Z fusionadas en 48 capas y de las proyecciones GDN `a`/`b` que el conversor mantiene en BF16. Incluye un componente MTP (Multi-Token Prediction) nativo con 15 tensores dedicados, que se usa en inferencia para decodificacion especulativa con tokens de borrador. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La conversion tecnica es el aspecto mas destacable de este artefacto. El checkpoint original contiene 18 shards safetensors, 1.999 tensores, 400 pesos NVFP4 empaquetados, 400 tensores de escala por bloque y 400 escalas globales de peso, pero no incluye tensores `input_global_scale` (escalas de activacion). Por ello el conversor aplica una correccion W4A16 que sustituye `AllowA4` por `A16Only` y elimina las lecturas de `input_divisor`. Ademas, un primer artefacto de unos 17 GB fallaba al arrancar con el error `native input requires one contiguous parent region` porque Q y K referenciaban un objeto empaquetado y V y Z objetos separados; la correccion re-codifica Q/K/V/Z de las 48 capas de atencion lineal como un unico grupo contiguo de objetos FP8 con escalado por fila.

## Capacidades

- Generacion de texto en modalidad solo texto (los pesos de vision no estan incluidos en este artefacto).
- Razonamiento y respuesta a preguntas, con modo thinking desactivable; en la prueba documentada el modelo respondio `391` a una multiplicacion con 0 tokens de razonamiento.
- Decodificacion especulativa mediante MTP nativo con 2 o 3 tokens de borrador, con una tasa de aceptacion reportada del 61 % (562 de 922 tokens de borrador aceptados en la muestra MTP2).
- Servicio de API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (vision explicitamente excluida).

## Casos de uso

- Despliegue de un LLM de 27B en infraestructura Volta existente: el artefacto permite reutilizar Tesla V100 de 32 GB, que de otro modo no podrian ejecutar checkpoints NVFP4 nativos, mediante el runtime Docker `ghcr.io/jimmymax/ninfer-v100:1.6.2` y un unico binario `.ninfer`.
- Servicio de chat compatible con OpenAI: al exponer `/v1/chat/completions`, se puede colocar detras de clientes y SDKs que ya hablan el protocolo OpenAI sin adaptadores adicionales, con contexto de 32K y KV en INT8.
- Generacion de texto de alta velocidad en modo sin razonamiento: con thinking OFF y MTP2 se alcanzan 66,46 tok/s en contexto corto, adecuado para tareas de respuesta directa donde la latencia importa mas que la cadena de razonamiento.
- Procesamiento de documentos de hasta 32K tokens: con 7.202 tokens de entrada el modelo mantiene 60,90 tok/s de decodificacion y 43,23 tok/s end-to-end, util para resumenes y extraccion de informacion en documentos largos.
- Experimentacion e investigacion sobre decodificacion especulativa: el componente MTP con tasa de aceptacion medible (61 %) permite estudiar el impacto de distintos numeros de tokens de borrador (MTP0, MTP2, MTP3) en el rendimiento.
- Evaluacion comparativa de cuantizaciones hibridas: el artefacto sirve como caso de estudio de conversion NVFP4 a FP8 para hardware sin soporte nativo, con scripts de correccion publicados en el repositorio del conversor.
- Prototipado local con aislamiento: el ejemplo de despliegue enlaza solo a localhost (`127.0.0.1:18190`) y monta los modelos en solo lectura, apropiado para entornos de desarrollo y pruebas internas.

## Benchmarks y rendimiento

Rendimiento medido por el autor con una peticion, concurrencia 1, 1.024 tokens generados, thinking OFF, MTP con dos tokens de borrador y contexto configurado de 32K, sobre Tesla V100-PCIE-32GB con ECC activado:

| Benchmark | Tokens de entrada | Tasa de decodificacion | Time to first token | Throughput end-to-end |
|---|---:|---:|---:|---:|
| standard speed / short | 77 | 66,46 tok/s | 402,27 ms | 64,83 tok/s |
| standard speed / long | 7.202 | 60,90 tok/s | 6.889,73 ms | 43,23 tok/s |

Pruebas anteriores de 1.024 tokens, con una sola repeticion cada una y capacidades de KV distintas, por lo que son solo indicativas: 34,80 tok/s sin MTP (capacidad KV automatica), 60,69 tok/s con MTP2 (capacidad KV de 8K) y 57,87 tok/s con MTP3 (capacidad KV de 8K). En la muestra MTP2 se aceptaron 562 de 922 tokens de borrador (aproximadamente el 61 %).

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que las afirmaciones de precision BF16/Q8 del autor upstream no deben atribuirse a este artefacto sin una evaluacion independiente, y que no hay resultados de precision en contexto largo ni benchmark de prefill a 32K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,5 GiB residentes al arrancar, incluyendo MTP, sobre un artefacto de unos 19 GB en disco; el KV en INT8 con capacidad de 32K anade memoria adicional no cuantificada en la informacion disponible.
- GPU validada: NVIDIA Tesla V100-PCIE-32GB con ECC activado, arquitectura Volta (sm_70), un solo GPU.
- GPU recomendadas: el artefacto esta especificamente adaptado a V100 de 32 GB; no se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el runtime y el formato `.ninfer` estan orientados a V100, y no se indica soporte para GPU consumer.
- Opciones de despliegue: imagen Docker publica `ghcr.io/jimmymax/ninfer-v100:1.6.2` con entrypoint `ninfer-serve`; no es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Parametros de ejecucion documentados: `--max-context 32768`, `--kv-capacity 32768`, `--kv-dtype int8`, `--max-concurrency 1`, `--no-thinking`, `--spec mtp`, `--draft-tokens 2`.
- Latencia y throughput: 402,27 ms de TTFT y 66,46 tok/s en contexto corto; 6.889,73 ms de TTFT y 60,90 tok/s en contexto de 7.202 tokens, con concurrencia 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|---|
| Qwen Concept 27B NInfer V100 (este artefacto) | 27B densos | 32.768 tokens configurados | `.ninfer` propietario | Tesla V100 32 GB (sm_70) | Apache 2.0 | 66,46 tok/s (corto), 60,90 tok/s (7.202 tokens de entrada) |
| ConceptCountry/qwen-concept-27b (upstream) | 27B densos | no disponible | safetensors, compressed-tensors NVFP4 | GPU con soporte NVFP4 (no Volta) | Apache 2.0 | no disponible |
| Alternativas de 27B en GGUF para llama.cpp | no disponible | no disponible | GGUF | CPU y GPU consumer | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la categoria generica de artefactos GGUF.

## Limitaciones y advertencias

- Es una conversion comunitaria, no una publicacion oficial de ConceptCountry; el autor no respalda este artefacto.
- El formato `.ninfer` es propietario: no es GGUF, ni safetensors, ni cargable en Transformers o llama.cpp, lo que limita la portabilidad y ata el uso al runtime `ninfer-v100`.
- Solo texto: los pesos de vision estan excluidos explicitamente.
- No hay resultados publicados de precision, precision en contexto largo ni benchmark de prefill a 32K; las afirmaciones de precision del autor upstream no son trasladables sin evaluacion independiente.
- Las cifras de rendimiento provienen de una unica repeticion por prueba y con capacidades de KV distintas entre ejecuciones (MTP0 con capacidad automatica, MTP2 y MTP3 con 8K), por lo que no son comparaciones estrictamente controladas.
- El rendimiento depende de la GPU, la memoria del sistema, el driver, la build del runtime, el prompt y la carga de trabajo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse antes de un uso en produccion.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto derivado conviene verificar las condiciones del checkpoint base y del runtime NInfer antes de desplegarlo en produccion.
- El ejemplo de despliegue enlaza solo a localhost; exponer el endpoint a la red sin autenticacion no esta soportado por la configuracion documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m01001/Qwen-Concept-27B-NInfer-V100-NVFP4-FP8-MTP
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Framework de conversion: https://github.com/JimmyMax/ninfer-v100
- Imagen Docker del runtime: ghcr.io/jimmymax/ninfer-v100:1.6.2
