# jalenluorion/Qwen3.8-Flash-Next-moved-store

## Resumen

Qwen3.8-Flash-Next-moved-store es un reempaquetado del modelo Qwen/Qwen3.8-Flash-Next (aproximadamente 180.000 millones de parametros) realizado por el usuario jalenluorion, orientado a ejecutar un modelo de mezcla de expertos (MoE) de gran tamano en equipos Apple Silicon con tan solo 16 GB de memoria unificada. La idea central es mantener en memoria unicamente el 3 % de los parametros (capas de atencion, expertos compartidos, normas, embeddings, cabeza de salida y enrutadores) y dejar el resto —los 24.576 expertos enrutados y una memoria de n-gramas— en el SSD, leyendolos bajo demanda.

El problema que resuelve es el de la inferencia de modelos MoE masivos en hardware de consumo: en el modelo original cada experto debe residir en memoria porque el enrutador de cada capa decide en el mismo instante en que se necesita. Aqui se anade un pequeno enrutador entrenado por capa que predice, con cuatro capas de antelacion, que expertos se van a requerir, de modo que el disco los lee mientras las capas intermedias computan. El resultado reportado por el autor es de 5,7 tokens/s en un prompt de benchmark y 4,6 tokens/s en una sesion de agente, con unos 9 GB de memoria en uso.

Es relevante ahora porque demuestra una via practica de "storage offloading" para MoE en Apple Silicon mediante MLX, con un consumo de disco de unos 140 GB y un formato de pesos especifico (safetensors para la parte residente, ficheros binarios por capa para los expertos y la memoria n-gram). No obstante, se trata de un trabajo de terceros, no oficial de Qwen, con licencia comunitaria y sin benchmarks de tareas publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con capas Gated DeltaNet y atencion dispersa, mas memoria de n-gramas; reempaquetado con enrutadores de prediccion (lag-4) y offloading a disco |
| Parametros totales | ~180B (4,9B residentes + 576M enrutadores + 120,8B expertos enrutados + 51,2B memoria n-gram) |
| Parametros activos | 10 de 512 expertos por capa en 48 capas (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos a 4 bits (escala y sesgo fp16 por grupo de 64); memoria n-gram a 8 bits (int8 con escala fp16); pesos residentes a 8 bits en maquina de 16 GB; enrutadores a fp16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (residente, bf16), ficheros binarios por capa para expertos (`store/layer_XX.bin`), binarios int8 para n-gram (`ngram/part_PP.bin`), enrutadores en `.npz` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas, de las cuales 36 son Gated DeltaNet y 12 de atencion dispersa, con expertos compartidos y 512 expertos enrutados por capa (24.576 en total). El reempaquetado congela y cuantiza los pesos liberados: expertos a 4 bits, memoria n-gram a 8 bits y pesos residentes a 8 bits en el Mac de 16 GB. La unica parte entrenada son los enrutadores "lag-4", que imitan a los enrutadores originales con el modelo congelado; se entrenaron sobre 20,5 millones de tokens de wikitext-103, FineWeb-Edu y UltraChat.

La innovacion clave es el prefetch de expertos: un enrutador por capa lee el estado del token cuatro capas antes y nombra los expertos que esa capa necesitara, de modo que el SSD los carga mientras las cuatro capas intermedias computan. En modo prefetch (por defecto) ningun experto se lee durante el computo de la propia capa; si la prediccion falla, el enrutador original elige entre lo que ya esta en memoria. En modo exacto (`--mode exact`) se respeta siempre la eleccion del enrutador original, leyendo lo que falte cuando se necesite. La memoria n-gram es una tabla hash: cada token consulta 16 filas cuyas direcciones dependen solo de los ids de tokens previos. Un token activa 10 de 512 expertos en cada una de las 48 capas, lo que supone 1,27 GB de lecturas de expertos por token antes de reutilizacion.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-Flash-Next.
- Capacidad de mezcla de expertos con enrutamiento disperso (10 de 512 expertos por capa).
- Memoria de n-gramas para modelado de secuencias largas mediante tabla hash.
- Ejecucion en Apple Silicon con MLX, incluida una API compatible con OpenAI para integrarse en herramientas como OpenCode.
- Modo de agente verificado por el autor en una sesion bajo OpenCode (4,6 tokens/s).
- Soporte de tool calling: no medido ni confirmado en la informacion disponible.
- Capacidades de vision: no incluidas (la torre de vision del release no se incluye).
- Cabeza de prediccion multi-token: no incluida.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado local de modelos MoE de gran escala en un MacBook de 16 GB: permite experimentar con un modelo de ~180B sin GPU dedicada, usando el SSD como almacen de expertos y obteniendo unos 5,7 tokens/s en benchmark.
- Asistentes de codigo en local integrados en OpenCode: el autor reporta 4,6 tokens/s en una sesion de agente, adecuado para tareas interactivas no sensibles a la latencia.
- Evaluacion de tecnicas de offloading y prefetch: util como banco de pruebas para investigar enrutadores predictivos, politicas de cache (`--keep`, `--max-slots`) y su impacto en la calidad (gaps de loss medidos en nats).
- Servicio local compatible con OpenAI: el demo expone una API compatible para conectar clientes existentes sin infraestructura en la nube.
- Investigacion sobre cuantizacion y su efecto en calidad: el autor documenta gaps de loss por configuracion (expertos 4 bits, n-gram 8 bits, pesos residentes 8 bits, enrutadores), lo que permite estudiar el compromiso calidad/memoria.
- Despliegue educativo o de demostracion en entornos con recursos limitados: el modelo ocupa unos 9 GB en memoria y requiere ~140 GB de disco, viable en portatiles Apple Silicon con SSD amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que "thinking traces, code, tool calls and task benchmarks have not been measured".

Datos de calidad reportados (gap de loss en nats frente al modelo bf16 liberado, sobre wikitext-103 test / FineWeb-Edu / UltraChat retenido; referencia 1,611 / 2,089 / 1,828):

| Configuracion | Gap de loss |
|---|---|
| Expertos a 4 bits | +0,013 / +0,007 / -0,028 |
| + memoria n-gram a 8 bits | +0,014 / +0,008 / -0,026 |
| + pesos en memoria a 8 bits | +0,014 / +0,008 / -0,037 |
| + enrutadores: 10 nombrados, 3 retenidos, 24 slots por capa | +0,027 / +0,019 / -0,008 |

El coste de elegir con antelacion, frente al mismo modelo cuantizado con todos los expertos en memoria, es de +0,011 / +0,011 / +0,019 nats. El error de redondeo a 4 bits por elemento es del 9,2 al 9,6 % RMS relativo; el de una fila n-gram a 8 bits, del 0,66 %.

Rendimiento medido (MacBook Pro M4 base, 16 GB, SSD interno, `--bench --max-new 120`, cache de ficheros del SO evitada):

| Configuracion | Tokens/s | Memoria (pico MLX) |
|---|---|---|
| Benchmark (prompt unico) | 5,7 | ~9 GB |
| Sesion de agente (OpenCode) | 4,6 | ~9 GB |

## Requisitos de hardware

- Memoria: aproximadamente 9 GB en uso (pico MLX) en el Mac de 16 GB; la parte residente ocupa 4,3 GiB cuantizada y cacheada en el primer arranque, y los enrutadores 1,1 GB a fp16.
- Disco: unos 140 GB libres (descarga de 123 GiB mas una cache de 4,3 GiB escrita en el primer arranque).
- GPU: Apple Silicon con 16 GB o mas de memoria unificada; el autor lo prueba en un MacBook Pro M4 base. No se documenta soporte para A100, H100 ni RTX 4090.
- Caben en GPU de consumo: si, en Apple Silicon de 16 GB; no hay datos para GPU NVIDIA.
- Despliegue: MLX mediante `mlx_run.py` (chat, prompt unico, benchmark) y una API compatible con OpenAI en `demo/demo.sh` para OpenCode. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,7 tokens/s en benchmark y 4,6 tokens/s en agente; 1,27 GB de lecturas de expertos por token antes de reutilizacion, lo que hace del SSD un cuello de botella relevante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-moved-store | ~180B totales (4,9B residentes + expertos en disco) | no disponible | qwen-community-1.0 | Hugging Face (jalenluorion) | Offloading a disco con enrutadores lag-4; 5,7 tokens/s en M4 16 GB |
| Qwen3-Next-80B-A3B-moved-store | 80B totales (A3B) | no disponible | no disponible | Hugging Face (jalenluorion) | Misma conversion de offloading para Qwen3-Next-80B-A3B |
| Qwen3-Coder-Next-moved-store | no disponible | no disponible | no disponible | Hugging Face (jalenluorion) | Misma conversion orientada a codigo |
| Qwen3-30B-A3B-moved-store | 30B totales (A3B) | no disponible | no disponible | Hugging Face (jalenluorion) | Misma conversion, menor huella de disco |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial de Qwen: es un reempaquetado de terceros; la licencia qwen-community-1.0 impone condiciones de uso comercial que deben revisarse en el fichero LICENSE antes de produccion.
- No incluye la cabeza de prediccion multi-token ni la torre de vision del release original, por lo que no puede usarse para tareas multimodales.
- No se han medido trazas de razonamiento, codigo, tool calls ni benchmarks de tareas; el rendimiento real en esas areas es desconocido.
- El modo prefetch (por defecto) puede alterar ligeramente la salida si los enrutadores predicen mal; para fidelidad exacta hay que usar `--mode exact`, con posible penalizacion de latencia.
- En el conjunto de chat el gap de loss sale por debajo del modelo liberado tras cuantizar; el autor no lo explica y no lo interpreta como mejora, lo que anade incertidumbre sobre el comportamiento cualitativo.
- El rendimiento depende fuertemente del SSD: 1,27 GB de lecturas por token implican que discos lentos degraden drasticamente los tokens/s.
- En maquinas de 16 GB hay que cerrar otras aplicaciones: macOS empieza a comprimir memoria cuando el resto del sistema demanda mas de lo disponible.
- Sesgos, idiomas soportados y riesgo de alucinacion: no documentados en la informacion disponible; heredados del modelo base, no evaluados en este reempaquetado.
- Requiere Apple Silicon; no hay soporte documentado para CUDA ni otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Codigo, runner y demo: https://github.com/jalenluorion/Qwen3.8-Flash-Next-moved-store
- Conversion equivalente para Qwen3-Next-80B-A3B: https://huggingface.co/jalenluorion/Qwen3-Next-80B-A3B-moved-store
- Conversion equivalente para Qwen3-Coder-Next: https://huggingface.co/jalenluorion/Qwen3-Coder-Next-moved-store
- Conversion equivalente para Qwen3-30B-A3B: https://huggingface.co/jalenluorion/Qwen3-30B-A3B-moved-store
