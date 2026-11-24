# Lottolabs/Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen
Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150-tt-model es un paquete de pesos derivado de Qwen/Qwen3.5-9B, el modelo hibrido de 9.000 millones de parametros del equipo Qwen (Alibaba Cloud). Lo publica Lottolabs como checkpoint nativo para hardware Tenstorrent Blackhole p150, con las proyecciones re-almacenadas en formato mixto BFP4/BFP8 y las embeddings, parametros no lineales y los 15 tensores del cabezal MTP conservados sin perdida. No es una publicacion oficial de Qwen ni de Tenstorrent: es un empaquetado comunitario orientado a servir el modelo en aceleradores Tenstorrent mediante un runtime propio de tt-metal y un plugin de vLLM.

El modelo base combina atencion lineal Gated DeltaNet con atencion completa con compuertas en 32 capas, e incorpora un cabezal MTP (multi-token prediction) de una capa que permite decodificacion especulativa MTP-1. Este paquete expone el modelo a traves de la API compatible con OpenAI de vLLM, con contexto maximo de 8.192 tokens y un unico perfil de concurrencia (un usuario). Su relevancia actual es que demuestra la viabilidad de servir un modelo de 9B con cuantizacion agresiva de 4 y 8 bits en silicio no-GPU, con throughput de decodificacion medido de 50,6 tok/s por usuario frente a 36,6 tok/s sin especulacion.

El repositorio ocupa 2,3 GB, coherente con un checkpoint empaquetado en BFP4/BFP8, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) + atencion completa con compuertas, 32 capas, cabezal MTP de 1 capa |
| Parametros totales | 9.000 millones (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Mixta BFP4/BFP8 en proyecciones; embeddings, parametros no lineales y tensores MTP sin perdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo Tenstorrent (TT-native), no safetensors ni GGUF; consumido por tt-metal y plugin de vLLM |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-9B emplea una arquitectura hibrida que alterna capas de atencion lineal Gated DeltaNet con capas de atencion completa con compuertas, sobre 32 capas. Incluye un cabezal MTP de una capa que predice varios tokens por paso y habilita decodificacion especulativa. Este paquete no reentrena el modelo: re-almacena los pesos del checkpoint original (revision c202236) en un formato nativo de Tenstorrent con proyecciones empaquetadas en BFP4/BFP8, e incorpora kernels fusionados de Gated DeltaNet y SwiGLU, decodificacion trazada y decodificacion especulativa MTP-1. El runtime se apoya en tt-metal con un plugin de vLLM para exponer la API de OpenAI.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. El paquete se construyo con tt-model-manager 0.1.0 (esquema de manifiesto 5.1) y referencia la release prefill-mtp-20260907 (commit a19cf94).

## Capacidades
- Generacion de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por peticion mediante `chat_template_kwargs.enable_thinking`.
- Separacion del texto de razonamiento en el campo `reasoning` (o `reasoning_content` en vLLM anterior a 0.11.1), independiente de `content`.
- Tool calling / function calling mediante el parser `qwen3_coder`, con devolucion de `tool_calls` y `finish_reason: tool_calls`.
- Servicio a traves de la API compatible con OpenAI: chat completions, completions y `/v1/models` en el puerto 20000.
- Decodificacion especulativa MTP-1 con el cabezal MTP del propio checkpoint en el perfil `mtp` (por defecto).
- Perfil `no-mtp` como linea base sin especulacion.
- Capacidades multimodales no disponibles en este paquete: las imagenes y el video se rechazan (`--limit-mm-per-prompt` 0).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso
- Chat de texto monousuario en un solo P150: el modelo gestiona conversaciones multi-turno con hasta 8.192 tokens de contexto, adecuado para asistentes internos o demos sobre silicio Tenstorrent sin GPU.
- Razonamiento con traza separada: al devolver el pensamiento en `reasoning`, permite auditar la cadena de razonamiento en aplicaciones de analisis o depuracion de respuestas.
- Agentes con tool calling: la integracion del parser `qwen3_coder` permite encadenar llamadas a funciones en flujos de automatizacion con la API de OpenAI como interfaz.
- Evaluacion de hardware Tenstorrent: sirve como banco de pruebas para medir TTFT y throughput de prefill/decode en Blackhole p150 con cargas reales (por ejemplo, prefill de 7.936 tokens a 2.552 tok/s).
- Prototipado de asistentes de codigo: el soporte de tool calling y el modo de razonamiento permiten construir asistentes que consultan herramientas externas en pipelines de desarrollo.
- Despliegue de bajo consumo energetico en entornos edge o de laboratorio donde no se dispone de GPUs NVIDIA, aprovechando el formato BFP4/BFP8 para reducir huella de memoria.
- Comparacion de decodificacion especulativa: el par de perfiles `mtp` y `no-mtp` permite medir la ganancia de la especulacion (50,6 frente a 36,6 tok/s) en el mismo hardware y pesos.

## Benchmarks y rendimiento
Rendimiento medido por la release (prefill-mtp-20260907) a traves del servidor de OpenAI, chat greedy con thinking desactivado, mediana de 3 peticiones tras warmup, concurrencia 1:

| Perfil | ISL | OSL | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|
| mtp (por defecto) | 55 | 128 | 135 | — | 50,6 | 2,65 |
| no-mtp | 55 | 128 | 126 | — | 36,6 | 3,60 |
| mtp | 128 | 1 | 123 | 1.042 | — | 0,12 |
| mtp | 2.048 | 1 | 761 | 2.690 | — | 0,76 |
| mtp | 7.936 | 1 | 3.109 | 2.552 | — | 3,11 |
| no-mtp | 7.936 | 1 | 3.104 | 2.557 | — | 3,10 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; la model card menciona notas de calidad de la release (GSM8K) pero el texto aparece truncado.

## Requisitos de hardware
- Hardware obligatorio: una tarjeta Tenstorrent Blackhole p150; no se soportan GPUs convencionales con este checkpoint.
- Almacenamiento: aproximadamente 9,7 GB en la cache de Hugging Face para el `checkpoint/`, mas espacio para las caches de kernels y tensores de dispositivo generadas en el primer arranque.
- Primer arranque: compila kernels y convierte el checkpoint, lo que tarda varios minutos; los arranques posteriores reutilizan las caches.
- Despliegue: mediante el CLI `tt` (`tt serve ...`) o `tt-model serve ...`, con Docker como dependencia; el servidor escucha en el puerto 20000 o el siguiente libre.
- Perfiles de servicio: `mtp` (por defecto, MTP-1 especulativo) y `no-mtp` (sin especulacion), ambos con `max_num_seqs` 1 y `max_model_len` 8192.
- VRAM en GPU: no aplica; no se proporcionan estimaciones para GPUs NVIDIA u otras.
- Latencia y throughput: ver tabla de benchmarks (TTFT de 123 a 3.109 ms segun longitud de entrada; decode de 50,6 tok/s con MTP).

## Comparativa con modelos similares
No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el paquete comparte pesos con Qwen/Qwen3.5-9B (misma arquitectura, contexto y licencia Apache 2.0) y se diferencia de este en el formato nativo Tenstorrent y en la cuantizacion mixta BFP4/BFP8, ademas de estar limitado a hardware p150 y a un unico usuario concurrente.

| Modelo | Parametros | Contexto | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150-tt-model | 9B | 8.192 | Apache 2.0 | Tenstorrent p150 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible en la informacion | Apache 2.0 | GPU convencional | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Concurrencia limitada a un unico usuario (`max_num_seqs` 1); no apto para cargas multiusuario sin cambios en el runtime.
- Contexto maximo de 8.192 tokens, inferior al de muchas alternativas actuales.
- El logit bias se rechaza con HTTP 400 bajo el perfil `mtp`.
- No soporta entrada de imagenes ni video (`--limit-mm-per-prompt` 0).
- El nombre del modelo en las peticiones debe ser el identificador de los pesos (`Lottolabs/Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150`), no el de este paquete.
- Dependencia estricta de hardware Tenstorrent p150, Docker y el CLI `tt`; el primer arranque requiere varios minutos de compilacion de kernels.
- Paquete comunitario no oficial: no cuenta con el respaldo de Qwen ni de Tenstorrent, lo que implica menor garantia de soporte y mantenimiento.
- Riesgo de alucinacion y sesgos del modelo base: no se documentan en la informacion proporcionada.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue efectivo exige hardware propietario de Tenstorrent.
- No se han publicado mediciones de calidad (benchmarks) para este paquete concreto.

## Enlaces
- Hugging Face (este paquete): https://huggingface.co/Lottolabs/Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos de la release: https://huggingface.co/Lottolabs/Qwen3.5-9B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.5-9b-mixed-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/qwen3.5-9b-mixed-p150
- Plugins de modelo: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/qwen3.5-9b-mixed-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos del CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
