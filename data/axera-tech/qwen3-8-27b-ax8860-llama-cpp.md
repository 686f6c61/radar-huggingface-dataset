# AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp

## Resumen

Qwen3.8-27B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo Qwen3.8-27B (27.320.697.856 parametros) sobre la NPU del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con kernels ggml-axera. No es un modelo nuevo: es una distribucion lista para placa que incluye pesos en formato GGUF (mxfp4), el codificador visual en bf16, los binarios estaticos para el dispositivo, los kernels de NPU con su manifiesto y scripts de arranque y benchmark.

El paquete resuelve un problema muy concreto de ingenieria: llevar un modelo de 27B con entrada de texto e imagen y hasta 262.144 tokens de contexto a un acelerador de borde, con servidor compatible con la API de OpenAI y decodificacion especulativa opcional basada en MTP. Los datos publicados por el autor reportan 13,8 tokens/s en decodificacion simple y hasta 35,1 tokens/s con MTP en generacion de codigo, con un prefill de 1.262 tokens/s sobre un prompt de 3.908 tokens.

Es relevante ahora porque demuestra que la inferencia de un modelo multimodal de escala media puede residir en hardware de borde con NPU dedicada, manteniendo un contrato de API estandar y un consumo de memoria controlado mediante checkpoints rodantes en contexto largo. La ficha se centra en lo que el autor documenta; los datos del modelo base Qwen3.8-27B que no aparecen en la model card se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; el paquete aporta runtime llama.cpp + ggml-axera sobre NPU AX8860) |
| Parametros totales | 27.320.697.856 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (por defecto 16.384 en el servidor; `CTX=131072` configurable) |
| Tipos de cuantizacion | mxfp4 (pesos, 14,8 GB); bf16 (codificador visual, 931 MB) |
| Idiomas soportados | no disponible (la model card incluye ejemplos en chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.8-27b-mxfp4.gguf`, `mmproj-qwen3.8-27b-bf16.gguf`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento; la model card se limita al despliegue. Lo que si se describe es la pila de ejecucion: llama.cpp compilado de forma estatica para la placa, con kernels de NPU propios (`kernels/` mas `manifest.json`) que ocupan los cuatro nucleos de NPU en exclusiva. Los pesos se sirven en mxfp4 y el codificador visual en bf16, lo que separa el coste de vision del de lenguaje.

La innovacion tecnica destacable es el modo MTP (multi-token prediction) como decodificacion especulativa opcional: el modelo propone tres tokens por ronda y el modelo objetivo los verifica uno a uno, de modo que en decodificacion codiciosa la salida es identica a la decodificacion normal. Ademas, el contexto largo se gestiona con checkpoints rodantes (`-ctxcp 4` por defecto), de forma que la memoria no crece linealmente con la longitud del contexto. El autor indica que una prueba de crecimiento hasta 60.000 tokens de prompt no provoca OOM y mantiene estable el uso de memoria de los checkpoints. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y completado de texto, con plantilla de chat incluida (`chat_template.jinja`).
- Entrada de imagen: el paquete incluye codificador visual y permite describir imagenes (`run.sh -i bus.jpg "Describe this image."`).
- Contexto largo de hasta 262.144 tokens, con gestion de memoria mediante checkpoints rodantes.
- Decodificacion especulativa MTP opcional, con aceleraciones documentadas de 1,46x a 2,52x segun el tipo de contenido.
- Servidor compatible con la API de OpenAI (`run.sh -s 8080`), apto para clientes de agentes.
- Soporte de mensajes de sistema en mitad de la conversacion, pensado para clientes de agentes como Codex.
- Modo de razonamiento (thinking) presente en el modelo, desactivado por defecto en el servidor (`--reasoning off`).
- Cache de prompt en 4 GB de memoria del host, ampliable a disco con `CACHE_DIR` para conservar aciertos tras reinicios.
- Capacidades multilingues: no disponibles como lista cerrada; los ejemplos de benchmark cubren chino e ingles.

## Casos de uso

- Asistencia conversacional en el borde: el servidor compatible con OpenAI permite desplegar un chat multi-turno en la propia placa AX8860, sin depender de la nube, con 16.384 tokens de contexto por defecto y hasta 262.144 si se configura.
- Analisis de imagenes en campo: con el codificador visual incluido se pueden describir o interpretar imagenes capturadas por el dispositivo (por ejemplo, inspeccion visual o lectura de documentacion) usando `run.sh -i`.
- Generacion de codigo en estaciones de trabajo con NPU: el modo MTP alcanza 35,1 tokens/s en contenido de codigo con una tasa de aceptacion de 0,785, lo que lo hace util para autocompletado y generacion de parches en local.
- Agentes y tool calling: el servidor acepta mensajes de sistema intermedios y el autor recomienda `presence_penalty: 0` precisamente para no penalizar la repeticion de nombres de fichero, numeros y codigo, lo que favorece flujos de agente con llamadas a herramientas.
- Procesamiento de documentos largos: con contexto de hasta 262.144 tokens y checkpoints rodantes se pueden resumir o extraer datos de expedientes extensos sin que la memoria crezca de forma lineal.
- Traduccion y redaccion asistida: el benchmark documenta 28,6 tokens/s con MTP en traduccion chino-ingles y alrededor de 20 tokens/s en redaccion de ensayos y relatos, adecuado para generacion de borradores en local.
- Evaluacion y prototipado de hardware: los scripts `bench.sh` y `llama-bench` (con `-b 4096 -ub 4096`) permiten reproducir latencias y throughput para dimensionar despliegues antes de produccion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tokens/s; hasta 256 tokens generados, decodificacion codiciosa salvo indicacion):

| Escenario | Sin MTP | Con MTP | Aceleracion | Tasa de aceptacion |
|---|---:|---:|---:|---:|
| Codigo | 13,9 | 35,1 | 2,52x | 0,785 |
| Traduccion (chino a ingles) | 13,7 | 28,6 | 2,09x | 0,596 |
| Tabla Markdown | 13,8 | 31,0 | 2,25x | 0,687 |
| Problemas matematicos | 13,8 | 32,0 | 2,32x | 0,709 |
| Ensayo en chino | 13,7 | 20,6 | 1,51x | 0,342 |
| Relato en ingles | 13,7 | 20,4 | 1,49x | 0,338 |
| Codigo con muestreo recomendado | 13,7 | 29,0 | 2,12x | 0,618 |
| Ensayo con muestreo recomendado | 13,7 | 20,0 | 1,46x | 0,322 |

Metricas adicionales de la model card:

| Metrica | Valor |
|---|---|
| Decodificacion simple | 13,8 tokens/s |
| Decodificacion con MTP (maximo) | 35,1 tokens/s (2,52x) |
| Prompt de 4k con MTP | 13,5 a 20,8 tokens/s (1,54x, aceptados 32/90) |
| Prefill de prompt de 4k | 1.262 tokens/s (3.908 tokens en 3,10 s) |
| Prompt de 5 tokens, `-c 8192` | 0,22 s de prefill |
| Prompt de 47 tokens, `-c 8192` | 0,22 s de prefill |
| Prompt de 3.908 tokens, `-c 8192` | 3,10 s de prefill, 13,6 tokens/s de decodificacion |
| Prompt de 3.908 tokens, `-c 16384` | 3,09 s de prefill, 13,6 tokens/s de decodificacion |
| Prompt de 3.908 tokens con muestreo, `-c 8192` | 3,09 s de prefill, 13,3 tokens/s de decodificacion |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior. El runtime no esta pensado para GPU de escritorio.
- Memoria: pesos de 14,8 GB en mxfp4 mas 931 MB de codificador visual; cache de prompt en 4 GB de memoria del host por defecto, configurable a disco con `CACHE_DIR`.
- NPU: el runtime ocupa los cuatro nucleos de NPU en exclusiva; el servidor se ejecuta con `-np 1`.
- GPU de consumo (RTX 4090, etc.): no aplica a este paquete; los binarios son estaticos para la placa AX8860.
- Opciones de despliegue: scripts `run.sh` (texto, imagen, chat interactivo, servidor) y `bench.sh`; el servidor expone una API compatible con OpenAI en el puerto indicado (`-s 8080`).
- Throughput y latencia: 13,8 tokens/s de decodificacion simple, hasta 35,1 tokens/s con MTP en codigo, 1.262 tokens/s de prefill con prompt de 3.908 tokens.
- Nota operativa: los ficheros descargados de Hugging Face no traen permiso de ejecucion, por lo que los scripts deben invocarse con `sh`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos alternativos comparables en la misma categoria (despliegue de un modelo de 27B multimodal sobre NPU de borde), ni cifras de rendimiento del modelo base frente a otros modelos de su tamano.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en AX8860 con SDK V0.5.1 o superior; no es portable a GPU ni a CPU convencional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: la model card solo ejemplifica chino e ingles; el comportamiento en castellano no esta verificado.
- El modo de razonamiento (thinking) viene desactivado por defecto en el servidor (`--reasoning off`), lo que puede degradar tareas que se beneficien de cadena de pensamiento si no se activa.
- El autor advierte de que la presencia de penalizacion recomendada en la model card (1,5) hace que el modelo evite repetir contenido del prompt (nombres de fichero, numeros, codigo) y perjudica a agentes y tool calling; por eso el servidor la fija en 0. Es un ajuste que hay que tener en cuenta al migrar configuraciones.
- Fallo intermitente conocido: en algunos entornos, peticiones consecutivas devuelven `ret = -3`; requiere reintento.
- MTP consume recursos adicionales y su beneficio depende del contenido: la aceleracion cae a 1,46x-1,51x en texto libre (ensayos, relatos) frente a 2,52x en codigo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las cautelas habituales de un modelo de lenguaje en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- El contexto maximo de 262.144 tokens esta sujeto a la memoria disponible; el servidor arranca con 16.384 por defecto y el contexto largo usa checkpoints rodantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.8-27B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo fuente de llama.cpp usado (rama `axera-dev`, commit `0104880be`): https://github.com/ZHEQIUSHUI/llama.cpp
