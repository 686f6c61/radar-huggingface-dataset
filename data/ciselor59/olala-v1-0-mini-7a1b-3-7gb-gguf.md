# ciselor59/Olala-v1.0-mini-7A1B-3.7GB-GGUF

## Resumen

Olala v1.0 mini 7A1B — Ciselor 3.7G es una cuantizacion GGUF de 3,72 GB del modelo base Olala v1.0 mini 7A1B desarrollado por OVHai LLM (OVHcloud). El modelo original, de arquitectura propietaria `olala` con aproximadamente 6.775 millones de parametros totales y cerca de 1.000 millones de parametros activos, esta publicado en bf16 con un tamano de 13,59 GB. Esta version cuantizada reduce el peso a 3,72 GB, un 13 % menos que la receta compacta documentada por OVHcloud (4,27 GB), manteniendose mas proxima al modelo original en divergencia KL (0,0587 frente a 0,0702) y en coincidencia de token top-1 (88,8 % frente a 85,2 %).

La receta de cuantizacion (un formato por tensor) fue disenada y verificada por el autor independiente ciselor59, usando la herramienta oficial `llama-quantize` del fork de llama.cpp de OVHcloud, lo que permite reproducibilidad completa. El modelo esta pensado para generacion de texto conversacional y se distribuye bajo licencia Apache 2.0, igual que el original.

La relevancia de esta ficha radica en que ilustra una tecnica de cuantizacion selectiva por tensor (importance matrix + formatos mixtos IQ4_NL, Q3_K, Q5_K, Q6_K, Q4_K, BF16) que consigue mejor calidad por gigabyte que las recetas compactas convencionales. No obstante, requiere obligatoriamente el fork de llama.cpp de OVHcloud: llama.cpp estandar, LM Studio, Ollama y vLLM no pueden cargar la arquitectura `olala`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `olala` (propietaria, fork de llama.cpp de OVHcloud); variante compacta con expertos (ffn_up_exps, ffn_down_exps) y capa latente (ffn_latent_up) |
| Parametros totales | 6.775.272.608 (6,78 mil millones) |
| Parametros activos | aproximadamente 1.000 millones (segun model card del original) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | Receta mixta por tensor: IQ4_NL (ffn_up_exps), Q3_K (ffn_down_exps), BF16 (ffn_latent_up), Q6_K (output), Q4_K (token_embd), Q5_K (resto de matrices); normas y vectores sin cambios |
| Idiomas soportados | no disponible (el model card original no especifica; las mediciones de perplexity se hicieron solo con wikitext-2 en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 3,72 GB) |

## Arquitectura y entrenamiento

El modelo base Olala v1.0 mini 7A1B emplea la arquitectura `olala`, una variante propietaria implementada en el fork de llama.cpp de OVHcloud (version 0.5.0-dev, commit `55c22dc`). Segun los nombres de tensor presentes en la receta (`ffn_up_exps`, `ffn_down_exps`, `ffn_latent_up`), la arquitectura incorpora componentes tipo mezcla de expertos (MoE) con una proyeccion latente que OVHcloud exige mantener en BF16. El modelo total suma 6,78 mil millones de parametros con aproximadamente 1.000 millones activos por token.

Sobre el entrenamiento del modelo original no se dispone de informacion en la documentacion proporcionada: no se detalla el numero de tokens, la composicion del dataset ni si se aplico RLHF o DPO. Esta ficha cuantizada no modifica los pesos mas alla de la cuantizacion: conserva los metadatos originales y la plantilla de chat, y `llama-quantize` solo anade los campos habituales de cuantizacion. La innovacion tecnica destacable de esta publicacion es la receta de cuantizacion selectiva por tensor, calibrada con una importance matrix (`llama-imatrix`) generada sobre el split de entrenamiento de wikitext-2 (120 chunks de 512 tokens), usando el split de test exclusivamente para medir.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat heredada del modelo original.
- Razonamiento de varios pasos (multi-step reasoning), con advertencia del autor original sobre posible repeticion en razonamientos largos.
- Conversacion generalista con contexto de hasta 32.000 tokens.
- Capacidades multilingues: no disponibles como dato verificable; el model card no las declara y las mediciones de calidad se hicieron unicamente con texto en ingles.
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Vision, audio y otras modalidades: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente conversacional local en CPU: el archivo de 3,72 GB permite ejecutar un modelo de 6,78 mil millones de parametros en equipos sin GPU dedicada usando `llama-server` del fork de OVHcloud, adecuado para prototipos y entornos con recursos limitados.
- Despliegue en entornos de bajos recursos: con aproximadamente 3,8 GB en disco y huella de memoria contenida, encaja en mini-PC, portatiles y servidores modestos donde un modelo bf16 de 13,59 GB no caberia.
- Evaluacion e investigacion de tecnicas de cuantizacion: al incluir la receta completa (`ciselor_recipe_3.7G.txt`) y la importance matrix (`olala_imatrix.gguf`), sirve como referencia reproducible para estudiar cuantizacion selectiva por tensor y divergencia KL.
- Generacion de texto offline y privada: el procesamiento local en CPU evita el envio de datos a servicios externos, util para entornos con requisitos de confidencialidad.
- Prototipado de chatbots con contexto largo: la ventana de 32K tokens permite mantener conversaciones extensas o procesar documentos medianos dentro de un mismo prompt.
- Benchmarking de infraestructura: al ser medido con `llama-perplexity` sobre wikitext-2 con parametros fijos (`--chunks 16 -c 512 -fa on -nr`), puede usarse como linea base para comparar rendimiento de hardware y configuraciones de llama.cpp.

## Benchmarks y rendimiento

Resultados medidos por el autor de la cuantizacion con el fork de llama.cpp de OVHcloud (`llama-perplexity`), en CPU, sobre el split de test de wikitext-2, 16 chunks de 512 tokens, `-fa on -nr`, con divergencia KL contra el GGUF bf16 oficial de OVHcloud:

| Archivo | Tamano | Perplexity | KLD vs bf16 (menor = mas cercano) | Mismo token top-1 que bf16 |
|---|---|---|---|---|
| OVHcloud bf16 (referencia) | 13,59 GB | 13,79 ± 0,62 | — | — |
| OVHcloud Q5_K_M (oficial) | 5,99 GB | 13,91 ± 0,63 | 0,0218 ± 0,0010 | 92,2 ± 0,4 % |
| Receta compacta documentada por OVHcloud (reconstruida) | 4,27 GB | 14,26 ± 0,64 | 0,0702 ± 0,0034 | 85,2 ± 0,6 % |
| **Ciselor 3.7G (este archivo)** | **3,72 GB** | 14,29 ± 0,65 | **0,0587 ± 0,0037** | **88,8 ± 0,5 %** |

Notas: los valores ± son las incertidumbres impresas por `llama-perplexity`, no variaciones entre ejecuciones independientes; solo se puntua la segunda mitad de cada ventana de 512 tokens; no se observo ningun NaN en ninguna ejecucion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida por el autor. Como referencia orientativa, el archivo GGUF ocupa 3,72 GB en disco y los pesos deben residir en memoria durante la ejecucion; no se dispone de cifras de VRAM verificadas.
- GPU recomendadas: no disponibles; el autor solo ha probado el archivo en CPU. OVHcloud advierte que los archivos Olala cuantizados pueden producir NaN en algunas GPU por las escalas de activacion en fp16.
- Compatibilidad con GPU consumer: no verificada. El archivo no ha sido probado en GPU.
- Opciones de despliegue: exclusivamente mediante el fork de llama.cpp de OVHcloud (`github.com/OVHai-LLM/llama.cpp`), por ejemplo `./build/bin/llama-server -m Olala-v1.0-mini-7A1B-Ciselor-3.7G.gguf -fa 1 -nr`. llama.cpp estandar, LM Studio, Ollama y vLLM no pueden cargar la arquitectura `olala`.
- Latencia y throughput: no medidos ("Speed and memory use are not measured yet").
- Recomendacion del autor: usar `-nr` (`--no-repack`) en x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del archivo | Calidad vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olala v1.0 mini 7A1B — Ciselor 3.7G (este) | 6,78 mil millones totales, ~1.000 millones activos | 32K | 3,72 GB | KLD 0,0587; top-1 88,8 % | Apache 2.0 | Hugging Face, requiere fork de OVHcloud |
| Olala v1.0 mini 7A1B Q5_K_M (oficial OVHcloud) | 6,78 mil millones totales, ~1.000 millones activos | 32K | 5,99 GB | KLD 0,0218; top-1 92,2 % | Apache 2.0 | Hugging Face, requiere fork de OVHcloud |
| Olala v1.0 mini 7A1B bf16 (referencia OVHcloud) | 6,78 mil millones totales, ~1.000 millones activos | 32K | 13,59 GB | referencia | Apache 2.0 | Hugging Face, requiere fork de OVHcloud |
| Receta compacta documentada por OVHcloud (no publicada como archivo) | 6,78 mil millones totales, ~1.000 millones activos | 32K | 4,27 GB | KLD 0,0702; top-1 85,2 % | Apache 2.0 | Reconstruible con `llama-quantize` |

No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Aplican todas las limitaciones del modelo original: aproximadamente 1.000 millones de parametros activos, conocimiento factual limitado, contexto de 32.000 tokens y posible repeticion en razonamientos largos.
- La cuantizacion introduce una perdida medible: perplexity de 14,29 frente a 13,79 en bf16 y KLD de 0,0587.
- Las perdidas se midieron solo con wikitext-2, texto en ingles; no se evaluaron perdidas en otros idiomas.
- La medicion se realizo en una unica maquina (CPU, Windows); velocidad y uso de memoria no estan medidos.
- Solo probado en CPU: OVHcloud advierte de posibles NaN en algunos backends GPU por escalas de activacion fp16.
- Requiere obligatoriamente el fork de llama.cpp de OVHcloud; los botones "Use this model" de Hugging Face (llama.cpp, Ollama, vLLM) no funcionan con este archivo.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el `NOTICE` original de OVHcloud y atribuir el modelo base (© 2026 OVH LLM SAS).
- El autor declara no estar afiliado a OVHcloud; se trata de una cuantizacion independiente de un modelo Apache 2.0.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la documentacion disponible; el model card original menciona conocimiento factual limitado.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/ciselor59/Olala-v1.0-mini-7A1B-3.7GB-GGUF
- Modelo base en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp de OVHcloud (requerido): https://github.com/OVHai-LLM/llama.cpp
- Documentacion de setup del fork (`docs/olala-setup.md`): https://github.com/OVHai-LLM/llama.cpp/blob/main/docs/olala-setup.md
- Documentacion de cuantizacion Olala (`docs/olala.md`): https://github.com/OVHai-LLM/llama.cpp/blob/main/docs/olala.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
