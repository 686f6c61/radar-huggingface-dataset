# abliterant/Qwen3.5-9B-RANA-abliterated-AWQ

## Resumen

Qwen3.5-9B-RANA-abliterated-AWQ es la cuantizacion INT4 en formato AWQ (compressed-tensors) del checkpoint abliterado `abliterant/Qwen3.5-9B-RANA-abliterated`, a su vez derivado de `Qwen/Qwen3.5-9B` de Alibaba Qwen. Lo desarrolla Abliterant, un proyecto centrado en la ablacion de comportamientos de rechazo (refusal ablation) sobre modelos de razonamiento. El modelo es vision-language (pipeline `image-text-to-text`) y conserva las capacidades multimodales, de tool calling y de decodificacion especulativa del modelo de referencia.

El objetivo del modelo es la investigacion de interpretabilidad, red-teaming y evaluacion de robustez del comportamiento de rechazo: el alineamiento de seguridad del modelo base se ha eliminado en gran medida, de modo que produce contenido que el modelo original rechazaria. Esta variante AWQ reduce el peso de 19,3 GB (BF16) a 11,7 GB, lo que permite servir el modelo en una unica GPU de consumo de gama alta (probado en una RTX 5090 de 32 GB con vLLM 0.30.0).

La relevancia actual reside en que combina tres elementos poco habituales en un mismo checkpoint: cuantizacion W4A16 con precision cercana al BF16 (KL de 0,0231 y mismo token mas probable en el 94,6 % de las posiciones), soporte multimodal imagen-texto y una ventana de contexto configurada de 262.144 tokens. La licencia es Apache-2.0, heredada de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) de la familia Qwen3.5; detalles internos de capas y atencion no disponibles |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens configurados; limite de servicio evaluado de 20.480 tokens |
| Tipos de cuantizacion | AWQ INT4 (W4A16, grupos de 32, activaciones BF16) en compressed-tensors; la familia incluye tambien BF16, FP8 (e4m3 por bloques), GGUF (Q8_0 a IQ2_M) y MLX (4, 5, 6, 8 bits y BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ INT4); repositorio de 11,7 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento adicional: se parte del checkpoint BF16 `abliterant/Qwen3.5-9B-RANA-abliterated` y se aplica AWQ (activation-aware weight quantization) con `llm-compressor`, generando pesos INT4 en grupos de 32 con activaciones en BF16 (W4A16) en formato compressed-tensors. La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal de 9,65 mil millones de parametros con torre de vision; no se dispone de detalles sobre numero de capas, tipo de atencion ni composicion del dataset de entrenamiento original.

La innovacion tecnica del linaje es el metodo RANA (Reasoning-Anchored, Norm-preserving Ablation), con el que Abliterant elimina el comportamiento de rechazo anclando la edicion al razonamiento propio del modelo y preservando las normas originales de los pesos. Segun el autor, este enfoque mantiene operativas la vision, el tool calling y la decodificacion especulativa del modelo de referencia. La cuantizacion conserva ademas las capas MTP (multi-token prediction) en BF16 para permitir decodificacion especulativa en vLLM.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (activado por defecto), con parser `qwen3` en vLLM.
- Comprension de imagenes (image-text-to-text); el ejemplo de servicio limita a una imagen por prompt y desactiva video.
- Tool calling / function calling, con parser `qwen3_coder` y auto-seleccion de herramientas en vLLM.
- Decodificacion especulativa mediante capas MTP (`--speculative-config` con metodo `mtp`).
- Generacion de codigo y respuestas tecnicas, con contexto configurable hasta 262.144 tokens.
- Comportamiento de rechazo mayoritariamente eliminado: responde a peticiones que el modelo base rechazaria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion de interpretabilidad del rechazo: analizar que direcciones o componentes del modelo codifican la negativa a responder, comparando las activaciones del checkpoint abliterado con las del Qwen3.5-9B original.
- Red-teaming y evaluacion de robustez: generar respuestas a peticiones daninas en entornos controlados para medir la eficacia de clasificadores y capas de moderacion externas.
- Servicio de inferencia multimodal en una sola GPU: con 11,7 GB de pesos INT4 cabe en una RTX 5090 de 32 GB y permite procesar imagen y texto en el mismo prompt con vLLM.
- Procesamiento de documentos largos con imagenes: la ventana de 262.144 tokens (20.480 en la configuracion evaluada) permite analizar informes tecnicos, capturas o diagramas junto a texto extenso.
- Agentes con herramientas: el soporte de tool calling con parser `qwen3_coder` y decodificacion especulativa MTP lo hace util para prototipos de agentes multi-paso en laboratorio.
- Estudio de cuantizacion: comparar la fidelidad AWQ frente a BF16, FP8, GGUF y MLX usando las metricas publicadas (KL 0,0231, coincidencia del token mas probable del 94,6 %) como referencia reproducible.
- Evaluacion comparativa de metodos de ablacion: el autor reporta frente a `bowmanslayer/Qwen3.5-9B-Uncensored` un +14,9 pp de respuestas utiles a peticiones daninas (67,4 % vs 52,5 %), una perdida de capacidad 4,2 veces menor (0,79 vs 3,31 pp) y un KL 2,7 veces mas cercano al base (0,109 vs 0,294), medido sobre el build BF16.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Fidelidad al BF16 (KL) | 0,0231 |
| Coincidencia del token mas probable vs BF16 | 94,6 % de las posiciones |
| Respuestas utiles a peticiones daninas (BF16) | 67,4 % (vs 52,5 % de `bowmanslayer/Qwen3.5-9B-Uncensored`) |
| Perdida de capacidad (BF16) | 0,79 pp (vs 3,31 pp del comparador) |
| KL frente al modelo base (BF16) | 0,109 (vs 0,294 del comparador) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 11,7 GB de pesos INT4 mas overhead de activaciones BF16, cache KV y torre de vision; en la practica requiere una GPU de 24-32 GB para contexto largo.
- GPU probada por el autor: una RTX 5090 de 32 GB (Blackwell) con vLLM 0.30.0.
- GPU recomendadas: RTX 5090, A100 40/80 GB, H100; en GPUs de 24 GB (RTX 4090, L40S) cabe con contexto reducido, aunque no esta verificado en la informacion disponible.
- Cabe en GPU de consumo: si, al menos en RTX 5090; para 24 GB hay que validar el limite de `--max-model-len`.
- Despliegue: vLLM es el runtime de referencia (lee el formato de cuantizacion de `config.json` sin flags extra). Para otras opciones estan los repos GGUF (llama.cpp), MLX (Apple Silicon) y FP8 (vLLM, SGLang).
- Ajustes especificos: `VLLM_USE_FLASHINFER_SAMPLER=0` en GPUs Blackwell; `--max-model-len 20480` como limite evaluado; decodificacion especulativa MTP con 1 token.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-RANA-abliterated-AWQ (este) | 9,65 B | 262.144 configurados | AWQ INT4, 11,7 GB | Apache-2.0 | KL 0,0231 frente al BF16; vision y tool calling |
| Qwen3.5-9B-RANA-abliterated (BF16) | 9,65 B | 262.144 configurados | BF16, 19,3 GB | Apache-2.0 | Referencia de calidad; mismo metodo RANA |
| bowmanslayer/Qwen3.5-9B-Uncensored | No disponible | No disponible | No disponible | No disponible | Abliteracion publica comparada: 52,5 % de respuestas utiles, perdida de capacidad 3,31 pp, KL 0,294 |
| Qwen/Qwen3.5-9B (base) | 9,65 B | No disponible | No disponible | Apache-2.0 | Modelo original con alineamiento de seguridad intacto |

## Limitaciones y advertencias

- Modelo de investigacion con el alineamiento de seguridad eliminado: produce contenido que el modelo base rechaza. No debe desplegarse de cara al publico sin una capa de moderacion externa.
- El propio modelo ya no rechaza, por lo que cualquier filtrado de seguridad debe implementarse fuera del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 9,65 B, con la fiabilidad factual propia de ese tamano.
- Idiomas soportados no documentados; no se puede garantizar el rendimiento fuera del ingles y el chino sin evaluacion propia.
- La cuantizacion AWQ introduce una desviacion medible respecto al BF16 (KL 0,0231; 5,4 % de posiciones con token mas probable distinto), que puede acumularse en generaciones largas.
- El limite de contexto evaluado es de 20.480 tokens, muy inferior a los 262.144 configurados; el comportamiento mas alla de ese limite no esta verificado.
- Licencia Apache-2.0 heredada de Qwen: permite uso comercial, pero el usuario es responsable del cumplimiento legal y de los terminos de la plataforma donde se usen las salidas.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-AWQ
- Modelo base BF16: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante FP8: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-FP8
- Variante GGUF: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-GGUF
- Variante MLX: https://huggingface.co/abliterant/Qwen3.5-9B-RANA-abliterated-MLX
- Notas de investigacion (metodo RANA): https://abliterant.ai/research/rana-refusal-ablation
- Chat de demostracion: https://chat.abliterant.ai/
- Sitio del autor: https://abliterant.ai/
- Todos los formatos: https://abliterant.ai/models
- Organizacion en Hugging Face: https://huggingface.co/abliterant
- Comparador abliterado: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored
- Comparativa Qwen 3.5 abliterated vs regular: https://docs.bswen.com/blog/2026-03-10-qwen-abliterated-comparison/
- Coleccion Qwen3.5-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen35-abliterated
