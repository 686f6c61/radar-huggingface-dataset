# Lottolabs/Qwen3.8-Flash-Next-Coder-P150-tt-model

## Resumen

Qwen3.8-Flash-Next-Coder-P150-tt-model es un paquete de despliegue publicado por Lottolabs que empaqueta una variante podada y cuantizada del modelo de codigo Qwen3.8-Flash-Next de Qwen para ejecutarse en una unica tarjeta Tenstorrent Blackhole p150. No es un modelo entrenado desde cero, sino un artefacto de inferencia: combina el conjunto de expertos en formato GPTQ BFP4 preparado por Lottolabs con el GGUF IQ1_M publicado por ISTA-DASLab (resultado de un podado GSQ-RCO de 512 a 256 expertos) y lo sirve mediante el motor Strata con su backend `tt` para Tenstorrent. El modelo base es un MoE de lenguaje orientado a codigo con atencion Gated DeltaNet y QSA dispersa, hyper-connections, embeddings por capa y una capa MTP de borrador para decodificacion especulativa.

La relevancia de este paquete es fundamentalmente de infraestructura: demuestra como llevar un MoE de gran tamano a hardware no-GPU (aceleradores Tenstorrent) manteniendo todas las partes densas en la tarjeta, los expertos enrutados en DRAM del dispositivo (8.680 de 12.288 residentes) y el resto en memoria fijada del host leida por PCIe dentro de la traza de decodificacion. El contexto configurado es de 32.768 tokens y se sirve una peticion a la vez.

El repositorio pesa 0,9 GB, pero el despliegue real requiere descargar unos 95 GB de checkpoints (GGUF de 59,3 GB y conjunto de expertos de 35,4 GB) y unos 50 GB adicionales de caches generadas en el primer arranque. Esta pensado para un unico usuario en una unica p150, con API compatible con OpenAI y Anthropic a traves del servidor de Strata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con Gated DeltaNet + atencion QSA dispersa, hyper-connections, embeddings por capa y capa MTP de borrador |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; 256 expertos enrutados tras podado desde 512) |
| Longitud de contexto | 32.768 tokens (perfil `mtp` y `plain`) |
| Tipos de cuantizacion | IQ1_M (GGUF base) y GPTQ BFP4 para expertos enrutados en la p150 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (IQ1_M) y conjunto de expertos GPTQ BFP4 para Tenstorrent; tensores MTP desde el checkpoint original de Qwen |
| Hardware objetivo | Tenstorrent Blackhole p150 (una tarjeta) |
| Motor de inferencia | Strata (backend `tt`), sin vLLM ni plugins de vLLM |
| Perfiles de servicio | `mtp` (por defecto, decodificacion especulativa con ventanas de 4 tokens, umbral p 0.5) y `plain` (sin drafter) |
| Concurrencia | una peticion a la vez |
| API expuesta | OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/responses`), Anthropic (`/v1/messages`), `/v1/models`, chat web en `/` |
| Nombre de modelo en API | `qwen3.8-flash-next-coder-iq1_m` |
| Puerto por defecto | 20000 (o el siguiente libre) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un MoE de lenguaje orientado a codigo que combina atencion Gated DeltaNet con atencion QSA dispersa, hyper-connections, embeddings por capa y una capa MTP (multi-token prediction) que actua como borrador para decodificacion especulativa. El paquete no entrena el modelo: parte del checkpoint de Qwen y aplica una cadena de transformaciones. ISTA-DASLab realiza un podado GSQ-RCO de 512 a 256 expertos enrutados y lo cuantiza a IQ1_M en GGUF; Lottolabs re-cuantiza esos expertos enrutados a GPTQ BFP4 para Blackhole y prepara el conjunto de expertos especifico de la p150.

La innovacion tecnica del paquete esta en el reparto de memoria y en la ejecucion: todas las partes densas residen en la tarjeta, los pasos de decodificacion se capturan como trazas de dispositivo, y los expertos enrutados se almacenan como filas GPTQ BFP4, con 8.680 de 12.288 residentes en la DRAM de la tarjeta y el resto leidos desde memoria fijada del host por PCIe dentro de la traza. La decodificacion especulativa MTP usa ventanas de 4 tokens con parada de borradores por debajo de probabilidad 0,5 y produce una salida identica a la decodificacion plana. El primer arranque descarga los 31 tensores de la capa MTP (unos 5 GB) desde Qwen/Qwen3.8-Flash-Next mediante peticiones HTTP range con verificacion SHA-256, y compila kernels especificos del dispositivo, lo que tarda varios minutos.

## Capacidades

- Generacion de texto y asistencia de codigo, con el modelo base afinado para tareas de programacion (sufijo "Coder" en el paquete).
- Razonamiento expuesto mediante `reasoning_content` en la API de Strata.
- Tool calling y function calling segun el servidor de Strata.
- Streaming de respuestas en los endpoints compatibles con OpenAI y Anthropic.
- Reutilizacion de conversaciones (conversation reuse) en el servidor de Strata.
- Chat web integrado servido en la raiz `/`.
- Decodificacion especulativa MTP con salida identica a la decodificacion plana (perfil `mtp`).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo interactiva para un unico desarrollador: el modelo se sirve en una p150 con 32.768 tokens de contexto, suficiente para pegar varios ficheros y mantener una conversacion multi-turno con reutilizacion de conversacion en el servidor de Strata.
- Integracion en un IDE o cliente compatible con OpenAI: al exponer `/v1/chat/completions` y `/v1/completions`, cualquier cliente que hable el protocolo OpenAI puede apuntar al puerto 20000 sin adaptadores adicionales.
- Automatizacion con tool calling: el soporte de tool calls de Strata permite construir agentes que invoquen funciones externas (ejecucion de tests, consultas a repositorios, busquedas) en un entorno controlado de un solo usuario.
- Evaluacion de hardware Tenstorrent en I+D: sirve como banco de pruebas para medir el rendimiento de un MoE con expertos repartidos entre DRAM de la tarjeta y memoria del host por PCIe, con trazas de dispositivo capturadas.
- Sustitucion de un cliente Anthropic: el endpoint `/v1/messages` permite conectar herramientas escritas para la API de Anthropic sin reescribir el codigo de integracion.
- Despliegue en entornos con restricciones de GPU: al no requerir CUDA ni vLLM, el paquete cubre escenarios donde solo hay aceleradores Tenstorrent disponibles y se necesita un modelo de codigo con contexto moderado.
- Prototipado de decodificacion especulativa: el perfil `mtp` frente a `plain` permite comparar latencia de decodificacion con y sin drafter manteniendo exactamente los mismos tokens de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, ni cifras de latencia o throughput medidas.

## Requisitos de hardware

- Acelerador: una tarjeta Tenstorrent Blackhole p150 (requisito imprescindible; no hay soporte para GPU).
- Almacenamiento: unos 95 GB en la cache de Hugging Face (GGUF de 59,3 GB y conjunto de expertos de 35,4 GB) mas unos 50 GB adicionales para caches del primer arranque (tokenizer, capa MTP, pesos desquantizados, tensores convertidos, kernels).
- Memoria del host: al menos 32 GB de RAM; unos 14 GB quedan fijados mientras el modelo esta cargado (expertos residentes en host).
- CPU: x86-64 con AVX2 (los kernels de CPU de Strata se compilan para la linea base AVX2 y usan AVX-512 en tiempo de ejecucion si esta disponible).
- Red: el perfil `mtp` necesita acceso a huggingface.co (o `HF_ENDPOINT`) en el primer arranque para descargar los 31 tensores de la capa MTP; el perfil `plain` no requiere descarga.
- Software: CLI de Tenstorrent (`uv tool install tenstorrent`) y Docker; alternativa con `tt-model serve`.
- VRAM en GPU: no aplica; el modelo no se ejecuta en GPU.
- Opciones de despliegue: `tt serve Lottolabs/Qwen3.8-Flash-Next-Coder-P150-tt-model` o `tt-model serve Lottolabs/Qwen3.8-Flash-Next-Coder-P150-tt-model`; no se usa vLLM ni llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; el primer arranque tarda varios minutos por la compilacion de kernels y las caches.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Coder-P150-tt-model (este paquete) | no disponible (MoE de 256 expertos tras podado) | 32.768 | Tenstorrent p150 | Qwen Community License 1.0 | Paquete de despliegue con expertos GPTQ BFP4 e IQ1_M, servidor Strata |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | GPU convencional | Qwen Community License 1.0 | Checkpoint original sin podar ni cuantizar para Tenstorrent |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | no disponible (256 de 512 expertos) | no disponible | CPU/GPU con llama.cpp y similares | Apache-2.0 | Podado GSQ-RCO y cuantizacion IQ1_M; insumo de este paquete |
| Lottolabs/Qwen3.8-Flash-Next-Coder-P150 | no disponible | no disponible | Tenstorrent p150 | Qwen Community License 1.0 | Conjunto de expertos GPTQ BFP4 para la p150, sin el empaquetado de servicio |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen, IST Austria, Strata ni Tenstorrent: es un paquete de la comunidad publicado por Lottolabs, sin descargas ni likes en el momento de la consulta.
- Requiere hardware Tenstorrent Blackhole p150; no es ejecutable en GPU convencional ni en CPU sola.
- Concurrencia de una sola peticion a la vez: no apto para servir a multiples usuarios en produccion.
- Contexto limitado a 32.768 tokens en ambos perfiles.
- El primer arranque es lento (compilacion de kernels, descarga de la capa MTP y generacion de caches) y exige unos 145 GB de almacenamiento en total entre checkpoints y caches.
- El perfil `mtp` necesita conectividad con huggingface.co en el primer arranque; sin red debe usarse el perfil `plain`, con menor velocidad de decodificacion.
- La cuantizacion agresiva (IQ1_M en el GGUF base y GPTQ BFP4 en los expertos) y el podado de 512 a 256 expertos pueden degradar la calidad respecto al modelo original; no se publican evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- Licencia Qwen Community License 1.0: es necesario revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva tipo Apache-2.0.
- La model card advierte de que el servidor expone formas de peticion y respuesta propias del modelo ademas de los endpoints compatibles; conviene validar el payload esperado antes de integrar.

## Enlaces

- Repositorio del paquete: https://huggingface.co/Lottolabs/Qwen3.8-Flash-Next-Coder-P150-tt-model
- Conjunto de expertos para p150: https://huggingface.co/Lottolabs/Qwen3.8-Flash-Next-Coder-P150
- GGUF podado IQ1_M: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Lottolabs/Qwen3.8-Flash-Next-Coder-P150/blob/69e738b2c8602ca93097ba0261a7649e4e71df04/LICENSE
- Servidor Strata: https://github.com/Niko1221/Strata
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Rama de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.8-flash-next-coder-p150
- Rama de Strata: https://github.com/LottoLottoLotto/Strata/tree/lottolabs/qwen3.8-flash-next-coder-p150
- Gestor de paquetes tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
