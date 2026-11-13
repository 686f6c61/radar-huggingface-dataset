# lisnapyc/Qwen3.5-9B-Q4_K_M-MTP-headQ8

## Resumen

Qwen3.5-9B-Q4_K_M-MTP-headQ8 es una cuantizacion GGUF del modelo Qwen/Qwen3.5-9B publicada por el usuario lisnapyc, pensada para su uso con llama.cpp en maquinas de bajos recursos. Se trata de un unico fichero de 5,48 GiB que combina una cuantizacion Q4_K_M con matriz de importancia para el tronco del modelo y mantiene el bloque MTP (multi-token prediction) en Q8_0, lo que permite decodificacion especulativa con un cabezal de borrador mas preciso.

El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5 del equipo Qwen y cuenta con 9.197.093.888 parametros (aproximadamente 9,2B). La arquitectura combina capas transformer clasicas con capas recurrentes de tipo gated delta net, lo que condiciona el comportamiento del MTP: un borrador rechazado no puede descartarse del contexto y obliga a restaurar el estado desde un checkpoint.

La relevancia de esta publicacion es practica: demuestra como mantener el cabezal MTP en 8 bits (243M parametros, unos 260 MB) anade solo unos 120 MB sobre un Q4_K_M estandar y permite que el bloque MTP y la capa de salida quepan en GPUs con 2 GB de VRAM, habilitando decodificacion especulativa en hardware muy limitado. No se han publicado evaluaciones de calidad (perplejidad ni benchmarks) para esta cuantizacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes gated delta net; bloque MTP adicional (blk.32) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea -c 8192) |
| Tipos de cuantizacion | Q4_K_M para tronco, embeddings y capa de salida (Q6_K en output.weight); Q8_0 para el bloque MTP; F32 para normas y tensores SSM pequenos; 5,11 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico, 442 tensores) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer de 32 capas de tronco (blk.0 a blk.31) que incorpora capas recurrentes de tipo gated delta net junto con atencion clasica. Sobre ese tronco se anade un bloque MTP adicional (blk.32) de 243M parametros que genera borradores de varios tokens a partir del ultimo estado oculto del tronco; el tronco verifica el borrador completo en un solo lote mediante `--spec-type draft-mtp` en llama.cpp. El campo `qwen35.nextn_predict_layers = 1` confirma la presencia de una unica capa de prediccion nextn.

Esta publicacion no entrena nada: es una cuantizacion del BF16 GGUF de unsloth/Qwen3.5-9B-MTP-GGUF usando `llama-quantize` (commit 5676dfbe, noviembre de 2026) con matriz de importancia y la opcion `--tensor-type "blk\.32\.=q8_0"`. La innovacion tecnica es la cuantizacion mixta: el tronco a Q4_K_M con imatrix y el cabezal MTP a Q8_0, de modo que los borradores mantienen precision mientras el grueso del modelo ocupa menos memoria. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni fases de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de codigo (el ejemplo de medicion usa una explicacion con codigo C++).
- Decodificacion especulativa mediante MTP con verificacion en lote por el tronco.
- Modo razonamiento (`--reasoning off` en el ejemplo, lo que implica que el modelo base soporta un modo de razonamiento activable).
- Compatibilidad con la API OpenAI-compatible de `llama-server` y con su interfaz web.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision: no incluida (el fichero es solo texto, sin `mmproj`).
- Audio: no disponible.

## Casos de uso

- Inferencia en equipos de bajos recursos: el fichero esta disenado para maquinas donde solo el bloque MTP y la capa de salida caben en GPU (unos 1,3 GB de VRAM con buffers, 1,57 GB bajo `llama-server`); con `-ngl 2` se obtiene decodificacion especulativa incluso en una GeForce MX130 de 2 GB.
- Servidor local de chat con API OpenAI-compatible: `llama-server` expone el modelo con interfaz web y endpoint compatible, adecuado para prototipos y herramientas internas en una unica maquina.
- Generacion de codigo en local: en prompts de "solo codigo" el autor midio 4,6-4,8 tokens/s en su hardware, el mejor rendimiento observado, lo que lo hace util para autocompletado o generacion de fragmentos en entornos sin GPU dedicada.
- Asistencia con modo razonamiento: con razonamiento activado el autor midio 4,4 tokens/s; util para tareas de analisis paso a paso en local siempre que la latencia no sea critica.
- Evaluacion y experimentacion con decodificacion especulativa: sirve para comparar configuraciones de MTP (draft 3 frente a draft 6, con y sin `--spec-draft-p-min`) y medir tasas de aceptacion de borradores sobre un modelo real.
- Despliegue en portatiles o mini-PCs con CPU unicamente: sin MTP el modelo rinde 3,3 tokens/s en un i5-8250U de 4 nucleos con AVX2; con MTP en CPU se mantiene en 3,2 tokens/s con un 88% de borradores aceptados.
- Integracion en pipelines de CI/CD o atencion al cliente automatizada: no hay datos especificos en la informacion proporcionada sobre tool calling o gestion multi-turno; el uso quedaria limitado a generacion de texto con el contexto configurado (el ejemplo usa 8192 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, perplejidad) en la informacion disponible. El autor indica explicitamente que no se ejecuto ninguna evaluacion de calidad ni se comparo el cabezal Q8_0 frente a un cabezal Q4 en los mismos prompts.

Las unicas mediciones disponibles son de velocidad en una sola maquina (Intel i5-8250U, 4 nucleos, AVX2, 16 GB RAM, GeForce MX130 2 GB, CUDA 12.9, 4 hilos, muestreo greedy, prompt de explicacion con codigo C++, 160 tokens generados):

| Configuracion | tokens/s | Borradores aceptados |
|---|---|---|
| Solo CPU, sin MTP | 3,3 | - |
| Capa de salida en GPU, sin MTP | 2,9 | - |
| Solo CPU, MTP (draft 3, p-min 0,75) | 3,2 | 88% |
| GPU: bloque MTP + capa de salida, draft 3, p-min 0,75 | 3,8 | 94% |
| Igual, sin p-min | 3,2 | 55% |
| Igual, draft 6, sin p-min | 2,2 | 35% |

En texto mas predecible el autor observo 4,6-4,8 tokens/s con un prompt corto de "solo codigo" y 4,4 tokens/s en modo razonamiento.

## Requisitos de hardware

- VRAM estimada: el bloque MTP mas la capa de salida ocupan unos 1,3 GB con buffers (1,57 GB bajo `llama-server`); una tercera capa no cupo en 2 GB.
- GPU recomendadas: no hay recomendaciones del autor mas alla de la GeForce MX130 de 2 GB usada en las pruebas; con mas VRAM debe aumentarse `-ngl` (que cuenta desde el final: 1 = capa de salida, 2 = salida + MTP, 2+K = mas las ultimas K capas del tronco) o dejarse `--fit` activado.
- Cabe en GPU consumer: si, al menos parcialmente, en GPUs con 2 GB de VRAM para el MTP y la capa de salida; el tronco puede quedar en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-cli`) con soporte de MTP (fusionado en mayo de 2026). No se mencionan vLLM, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: 3,8 tokens/s en la configuracion GPU con MTP y p-min 0,75; 3,3 tokens/s solo CPU sin MTP; 4,6-4,8 tokens/s en prompts de codigo. `-np 1` es obligatorio porque MTP no soporta slots paralelos.
- RAM: el autor uso 16 GB; `--max-buffer-size 1024` solo reduce la RAM necesaria durante la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. La unica referencia directa es el modelo base y su conversion BF16:

| Modelo | Parametros | Contexto | Formato | MTP | Licencia |
|---|---|---|---|---|---|
| lisnapyc/Qwen3.5-9B-Q4_K_M-MTP-headQ8 | 9,2B | no disponible | GGUF Q4_K_M + MTP Q8_0 | Si (Q8_0) | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9,2B | no disponible | safetensors/BF16 | Si | Apache 2.0 |
| unsloth/Qwen3.5-9B-MTP-GGUF | 9,2B | no disponible | GGUF BF16 | Si | Apache 2.0 |

## Limitaciones y advertencias

- No se ejecuto ninguna evaluacion de calidad: no hay perplejidad ni benchmarks, y el cabezal Q8_0 no se comparo con un cabezal Q4 en los mismos prompts.
- El tronco es una cuantizacion Q4_K_M estandar y arrastra la perdida de calidad habitual de ese nivel.
- Las mediciones de velocidad provienen de una sola maquina de gama baja y un punado de prompts; deben tratarse como indicativas, no como benchmark.
- Las capas recurrentes gated delta net implican que un borrador rechazado no puede eliminarse del contexto: se restaura el estado desde un checkpoint y se decodifica de nuevo el lote, lo que encarece los rechazos. Por eso es recomendable usar `--spec-draft-p-min`; sin umbral de confianza el MTP apenas aporto mejora (3,2 frente a 3,3 tokens/s).
- MTP no soporta slots paralelos: debe usarse `-np 1`.
- Requiere una build de llama.cpp con soporte MTP (fusionado en mayo de 2026); sin `--spec-type draft-mtp` el fichero funciona como un Q4_K_M normal y el bloque MTP no se carga.
- No incluye proyector de vision (`mmproj`): es un modelo solo de texto.
- Sesgos conocidos, riesgo de alucinacion e idiomas soportados: no disponible en la informacion proporcionada; se aplican todas las limitaciones y terminos de uso del modelo base.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso de licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lisnapyc/Qwen3.5-9B-Q4_K_M-MTP-headQ8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Conversion BF16 GGUF e importance matrix: https://huggingface.co/unsloth/Qwen3.5-9B-MTP-GGUF
- Runtime y cuantizador llama.cpp: https://github.com/ggml-org/llama.cpp
