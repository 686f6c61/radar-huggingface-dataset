# chunyoupeng/Qwen3.8-27B-w8a8-gdn-310p

## Resumen

Qwen3.8-27B-w8a8-gdn-310p es una cuantizacion W8A8 (INT8 simetrica por canal, con activaciones dinamicas) del modelo multimodal Qwen3.8-27B, publicada por el usuario chunyoupeng. No se trata de un modelo nuevo, sino de un checkpoint derivado del Qwen3.8-27B original de Alibaba Qwen, adaptado especificamente para su despliegue en aceleradores Huawei Ascend 310P (4 tarjetas Atlas 300I Pro de 21,5 GB cada una) mediante la pila de software vllm-ascend.

El objetivo del autor es reducir la huella de memoria del modelo para liberar capacidad de cache KV: la cuantizacion de las 98 matrices de proyeccion lineal restantes en FP16, junto con `lm_head` y `mtp.fc`, baja el peso en disco de 36 GB a 29 GB y la memoria por tarjeta de 10,99 GiB a 6,73 GiB, lo que permite disponer de espacio para 265.045 tokens de cache KV con contexto de 128K y concurrencia multi-peticion.

Es relevante para equipos que necesiten ejecutar un modelo de 27B con capacidad de vision y contexto largo sobre hardware Ascend de gama de inferencia, un escenario poco cubierto por las cuantizaciones habituales orientadas a GPU NVIDIA. El repositorio pesa 29,6 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atencion lineal GDN (gated delta network) y decodificacion especulativa MTP; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K (mencionado en la model card) |
| Tipos de cuantizacion | W8A8 y W8A8_DYNAMIC (INT8 simetrico per-channel para pesos, activaciones dinamicas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 29,6 GB, libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text que incorpora capas de atencion lineal denominadas GDN (gated delta network) junto con el resto de la pila transformer. La model card identifica explicitamente los modulos `linear_attn.in_proj_qkvz` y `linear_attn.out_proj` como parte de esas 48 capas GDN. Tambien se menciona un modulo MTP (`mtp.fc` y un `lm_head` compartido), lo que indica que el modelo base incorpora multi-token prediction para decodificacion especulativa.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las fases de alineacion (RLHF/DPO) del modelo base. La aportacion tecnica de este checkpoint es exclusivamente de cuantizacion y despliegue: convierte las 98 matrices de proyeccion lineal en FP16 a INT8 simetrico per-channel (peso, escala y offset), registra esas capas en el cargador ModelSlim de vllm-ascend mediante `quant_model_description.json` y configura decodificacion especulativa MTP codiciosa con `num_speculative_tokens: 3` en `generation_config.json`. Ademas, el autor mantiene parches de operadores para 310P y una libreria de comunicacion colectiva sin bloqueos basada en memoria compartida del host (`libshm_hccl.so`).

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text): descripcion, respuesta a preguntas visuales y dialogos con imagenes.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-27B (no se detallan evaluaciones especificas en la informacion disponible).
- Decodificacion especulativa MTP con 3 tokens especulativos, que acelera la generacion respecto a la decodificacion autorregresiva estandar.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en infraestructura Ascend 310P: el checkpoint esta calibrado para 4x Atlas 300I Pro con 21,5 GB por tarjeta, de modo que un equipo con hardware Ascend de inferencia puede servir el modelo sin recurrir a GPU NVIDIA.
- Servicio conversacional con contexto largo: los 265.045 tokens de cache KV liberados permiten atender conversaciones multi-turno extensas o varios usuarios concurrentes con ventanas cercanas a 128K tokens.
- Analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede procesar capturas, diagramas o paginas escaneadas junto con instrucciones textuales en un mismo prompt.
- Generacion asistida por lotes con latencia controlada: la decodificacion especulativa MTP ofrece 24,78 tok/s a contexto de 4K y 19,18 tok/s a 100K, adecuado para tareas de resumen o extraccion donde el throughput importa mas que la latencia por token.
- Prototipado e investigacion en entornos con vllm-ascend: util para validar pipelines de cuantizacion INT8 y parches de operadores en 310P antes de pasar a produccion.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de W8A8_DYNAMIC frente al Qwen3.8-27B en FP16 en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados son de velocidad de inferencia en el hardware objetivo:

| Metrica | Valor |
|---|---|
| Throughput a contexto 4K | 24,78 tok/s |
| Throughput a contexto 100K | 19,18 tok/s |
| Tokens especulativos MTP | 3 |
| Memoria de pesos por tarjeta (antes) | 10,99 GiB |
| Memoria de pesos por tarjeta (despues) | 6,73 GiB |
| Capacidad de cache KV liberada | 265.045 tokens |
| Tamano en disco (antes / despues) | 36 GB / 29 GB |

## Requisitos de hardware

- Hardware de referencia: 4x Huawei Ascend Atlas 300I Pro con 21,5 GB por tarjeta (310P), segun la model card.
- VRAM/NPU estimada: 6,73 GiB de pesos por tarjeta tras la cuantizacion, mas la cache KV; el autor indica espacio para 265.045 tokens de cache KV adicionales.
- GPU NVIDIA: no se documenta soporte ni requisitos para A100, H100 o RTX 4090 en la informacion disponible; el checkpoint esta pensado para vllm-ascend.
- GPU de consumo: no disponible; no hay indicios de que el checkpoint sea compatible con llama.cpp u Ollama.
- Opciones de despliegue: vllm-ascend con cargador ModelSlim, junto con los parches de operadores y la libreria `libshm_hccl.so` del repositorio del autor.
- Latencia y throughput: 24,78 tok/s a 4K y 19,18 tok/s a 100K en la configuracion de 4 tarjetas 310P.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-w8a8-gdn-310p | 27B | 128K | imagen-texto | MIT | HuggingFace (37 descargas) |
| Qwen/Qwen3.8-27B (base, FP16) | 27B | no disponible | imagen-texto | no disponible en la informacion | HuggingFace |
| Qwen3.8-27B-w8a8-310p (version previa) | 27B | 128K | imagen-texto | no disponible en la informacion | Referenciado por el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros fabricantes; la comparacion se limita a tamano, contexto, modalidad y licencia.

## Limitaciones y advertencias

- La cuantizacion W8A8_DYNAMIC puede introducir degradacion de calidad respecto al modelo base en FP16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El checkpoint esta optimizado para Ascend 310P y vllm-ascend; no se garantiza su funcionamiento en otras pilas de inferencia ni en GPU NVIDIA.
- Depende de parches de operadores y de una libreria de comunicacion colectiva externa (`libshm_hccl.so`), lo que anade complejidad de mantenimiento y riesgo de incompatibilidades con futuras versiones de vllm-ascend.
- No se especifican los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos; no hay datos especificos para esta variante.
- El repositorio tiene solo 37 descargas y 0 likes, por lo que la validacion comunitaria es practicamente nula.
- La licencia MIT se aplica a este checkpoint, pero conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.
- No se confirma soporte de tool calling ni de flujos de agente, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chunyoupeng/Qwen3.8-27B-w8a8-gdn-310p
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de despliegue y parches: https://github.com/chunyoupeng/ascend-310p-vllm-qwen38
