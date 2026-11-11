# FlagRelease/DeepSeek-V4-Flash-0731-W8A8-metax-FlagOS-Express

## Resumen

DeepSeek-V4-Flash-0731-W8A8-metax-FlagOS-Express es una variante de inferencia totalmente cuantizada a INT8 (pesos y activaciones, W8A8) del modelo DeepSeek-V4-Flash-0731, publicada por FlagRelease sobre la plataforma FlagOS. El modelo base es un MoE de 284B parametros con 13B parametros activados por token, orientado a agentes, generacion de codigo y tool calling, con una ventana de contexto de 1M tokens. Esta version mantiene las capacidades del original reduciendo el uso de VRAM y mejorando el throughput, lo que la hace adecuada para despliegue on-premise en escenarios de alta concurrencia.

La publicacion la firma FlagRelease, la plataforma de release automatico de FlagOS, un stack de software de sistema completamente open source que unifica las capas de modelo, sistema y chip. El objetivo declarado es permitir un flujo "desarrolla una vez, ejecuta en cualquier sitio" sobre aceleradores de distintos fabricantes, eliminando la fragmentacion entre stacks propietarios y reduciendo el coste de portabilidad. En este caso concreto, la variante esta empaquetada y validada para GPUs MetaX C550, con una imagen de contenedor FlagOS-Metax lista para desplegar con vLLM.

El interes actual de esta ficha es doble: por un lado, documenta un ejemplo real de cuantizacion INT8 nativa W8A8 sobre un MoE de gran tamano; por otro, muestra el patron de distribucion de modelos optimizados para hardware no-NVIDIA, un aspecto cada vez mas relevante para equipos que evaluan alternativas de acceleradores. El repositorio ocupa 306,2 GB y los pesos suman 304.279.583.678 parametros segun los safetensors publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (deepseek_v4), cuantizacion W8A8 INT8 |
| Parametros totales | 304.279.583.678 (304,3B segun safetensors; model card cita 284B de baseline) |
| Parametros activos | 13B por token |
| Longitud de contexto | 1M tokens (model card); el script de servicio limita `--max-model-len` a 66560 |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones), formato compressed-tensors; KV cache en FP8 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 284B parametros totales y 13B activos por token, segun la model card. Esta variante W8A8 cuantiza tanto pesos como activaciones a INT8 para habilitar GEMM nativo en INT8, lo que reduce la huella de memoria y aumenta el throughput de inferencia respecto al modelo en BF16. La cache KV se sirve en FP8 (`--kv-cache-dtype fp8`), y el script de servicio fuerza `expert_dtype: int8` mediante `--hf-overrides`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento, ni para el modelo base ni para esta variante cuantizada. Tampoco se documentan innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.) mas alla de la propia naturaleza MoE. Lo que si se detalla es el stack de despliegue: FlagOS integra FlagScale (orquestacion de entrenamiento e inferencia), vllm-plugin-fl (plugin de vLLM para el backend), FlagGems (libreria de operadores genericos en Triton), FlagCX (comunicacion) y FlagTree (compilador unificado multi-backend). La validacion de consistencia se realizo comparando el rendimiento del stack FlagOS con stacks nativos sobre benchmarks publicos.

## Capacidades

- Generacion de texto y razonamiento de proposito general en chino e ingles.
- Generacion de codigo y asistencia a programacion, segun la orientacion declarada del modelo base.
- Tool calling y function calling, explicitamente mencionados como caso de uso objetivo.
- Flujos de agentes y razonamiento multi-paso, con soporte de modo "thinking" activable via `default-chat-template-kwargs '{"thinking":true}'`.
- Contexto largo: la model card declara 1M tokens; el script de referencia limita a 66.560 tokens por defecto.
- Soporte de prefix caching (`--enable-prefix-caching`) para reutilizar contexto en conversaciones multi-turno.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos del repositorio.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a la ventana declarada de 1M tokens (66.560 en la configuracion de referencia) y al prefix caching, que reduce el coste de reprocesar el historial en cada turno.
- Generacion de codigo en produccion: la orientacion a code generation y tool calling permite integrarlo en pipelines de CI/CD como asistente de revision, generacion de tests o explicacion de diffs, con la ventaja de que la cuantizacion INT8 reduce el coste por token frente a la version BF16.
- Agentes autonomos con herramientas: el soporte de function calling y razonamiento multi-paso lo hace apto para orquestadores que encadenan busquedas, llamadas a APIs y ejecucion de codigo, con modo thinking para tareas que requieren planificacion.
- Despliegue on-premise de alta concurrencia: la combinacion W8A8 + KV cache FP8 + tensor parallelism 8 sobre GPUs MetaX C550 esta pensada para servir muchas peticiones simultaneas (`--max-num-seqs 64`) en entornos donde los datos no pueden salir de la infraestructura propia.
- Procesamiento de documentos extensos: la ventana de contexto permite resumir, extraer y responder preguntas sobre contratos, informes o bases de codigo de gran tamano en una sola pasada.
- Migracion a acceleradores no-NVIDIA: equipos que evaluan alternativas a NVIDIA pueden usar esta release como referencia funcional de como portar un MoE grande a MetaX mediante FlagOS, con imagen de contenedor y script de servicio ya configurados.
- Asistente integrado en herramientas de escritorio: la guia de integracion con AnythingLLM demuestra un caso de uso de chatbot local apuntando al endpoint OpenAI-compatible servido por vLLM.

## Benchmarks y rendimiento

| Metrica | DeepSeek-V4-Flash-Metax-FlagOS |
|---|---|
| GPQA | 88,38 |
| Math-500 | 95,6 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 306,2 GB, por lo que la inferencia en INT8 requiere al menos ese orden de magnitud en memoria agregada; con overhead de cache KV FP8 y buffers de activacion, el despliegue de referencia usa 8 GPUs.
- GPU validadas: 8 x MetaX C550, con driver MetaX 3.8.1 y SDK MACA 3.7.0.38.
- No se documenta compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090) ni con GPUs de consumo; el stack esta empaquetado para MetaX.
- Opciones de despliegue: vLLM 0.24.0 con plugin `vllm-plugin-fl` dentro de la imagen FlagOS-Metax; tensor parallelism 8, `--gpu-memory-utilization 0.85`, `--max-num-seqs 64`, `--max-num-batched-tokens 4096`, `--block-size 256`, CUDA graphs en modo FULL_DECODE_ONLY.
- Entorno de referencia: Ubuntu 22.04.5 LTS, Docker 29.1.3, Python 3.12, PyTorch 2.10.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Hardware objetivo | Benchmarks publicados |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-W8A8 (esta ficha) | 304,3B | 13B | 1M (66.560 en config de servicio) | Apache 2.0 | MetaX C550 x8 | GPQA 88,38; Math-500 95,6 |
| DeepSeek-V4-Flash-0731 (base BF16) | 284B | 13B | 1M | no disponible en esta ficha | no disponible | no disponible |
| Alternativas de mismo tamano en INT8 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria; los datos del modelo base BF16 se limitan a lo citado en la model card de esta variante.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano no esta validado y probablemente sea inferior.
- Contexto efectivo: aunque la model card declara 1M tokens, la configuracion de servicio de referencia limita `--max-model-len` a 66.560; usar la ventana completa requeriria ajustar memoria y validar estabilidad.
- Cuantizacion: W8A8 INT8 puede introducir degradacion de calidad frente al modelo BF16 en tareas sensibles; no se publican comparativas de calidad entre ambas versiones.
- Hardware: la release esta validada unicamente para MetaX C550 con el stack FlagOS; no hay garantia de funcionamiento en NVIDIA u otros acceleradores sin re-portar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy limitado, poca validacion independiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas ni tasas de error.
- Sesgos: no se documenta analisis de sesgos ni composicion del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento de las condiciones del modelo base y de las dependencias del stack (vLLM, FlagOS, drivers MetaX) debe verificarse por separado.
- Produccion: el script de referencia usa `--privileged` y `--network=host` en Docker, practicas que conviene revisar antes de desplegar en entornos con requisitos de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/DeepSeek-V4-Flash-0731-W8A8-metax-FlagOS-Express
- AnythingLLM: https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- Imagen Docker: `harbor.baai.ac.cn/flagrelease-public/deepseekv4-flash-metax001-gems5.5.0-tree0.7.0-cxnone-plugin0.3.0-vllm0.24.0-sglangnone-sglangflnone-cp312-pt210-maca38-x64-3.8.1:202611091757`
- Paper, blog o repositorio de FlagOS/FlagRelease: no disponible en la informacion proporcionada.
