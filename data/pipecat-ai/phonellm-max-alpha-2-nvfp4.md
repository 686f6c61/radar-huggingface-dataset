# pipecat-ai/phonellm-max-alpha-2-nvfp4

## Resumen

PhoneLLM Max Alpha 2 NVFP4 es un modelo de lenguaje de solo texto, con pesos abiertos, publicado por pipecat-ai (Daily) como cuantización NVFP4 de PhoneLLM Max Alpha 2. Este último es un ajuste fino supervisado de todos los parámetros del backbone de lenguaje de NVIDIA Nemotron 3.5 Super VL 120B-A12B, especializado en agentes de voz telefónicos que necesitan invocar herramientas. El checkpoint final conserva 64.927.477.250 parámetros (unos 64,9 mil millones) en un repositorio de 73,4 GB y responde únicamente en inglés.

Arquitectónicamente es un modelo de mezcla de expertos (MoE) con capas Mamba, servido mediante la clase NemotronHForCausalLM; antes del entrenamiento se eliminaron el codificador de visión y el proyector, por lo que no procesa imágenes. La cuantización se hizo con NVIDIA ModelOpt en modo post-entrenamiento, calibrada con 512 ejemplos del propio conjunto de entrenamiento: los expertos enrutados y compartidos quedan en NVFP4, la atención, las proyecciones Mamba y el lm_head en FP8, y los embeddings, el router, las convoluciones y la mayor parte del bloque de predicción multi-token (MTP) en bf16.

Su interés es de nicho pero concreto: cubre la capa de razonamiento de agentes de voz en tiempo real con una innovación poco habitual, el "microthinking" (una frase corta de razonamiento antes de cada respuesta) activado de forma obligatoria, y soporte nativo de function calling. Al ser una cuantización NVFP4, exige GPUs Blackwell para aprovechar los kernels FP4 nativos, lo que acota su público al despliegue autoalojado con vLLM 0.30 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM, transformer MoE híbrido con capas Mamba, solo texto (codificador de visión y proyector eliminados) |
| Parámetros totales | 64.927.477.250 (~64,9 B) |
| Parámetros activos | no disponible (el nombre del modelo base, Nemotron 3.5 Super VL 120B-A12B, sugiere ~12 B activos, pero la información disponible no lo confirma para esta variante) |
| Longitud de contexto | 32.768 tokens en la receta de servicio publicada (--max-model-len 32768); la longitud nativa del modelo base no se especifica |
| Tipos de cuantización | Mixta: NVFP4 (expertos enrutados y compartidos), FP8 (atención, proyecciones Mamba, lm_head) y bf16 (embeddings, router, convoluciones y mayor parte del bloque MTP). Incluye escalas FP8 para la KV-cache. Cuantización post-entrenamiento con NVIDIA ModelOpt, calibrada con 512 ejemplos |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement, versión 1.1 (etiquetada como license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone de lenguaje de Nemotron 3.5 Super VL 120B-A12B: una arquitectura de mezcla de expertos que combina atención con capas Mamba y que aquí se ejecuta a través de NemotronHForCausalLM. Antes del ajuste fino se retiraron el codificador de visión y el proyector, de modo que el resultado es estrictamente de texto. Los pesos conservan el bloque de predicción multi-token (MTP) del modelo base, aunque la receta de despliegue recomendada no lo utiliza. El recuento real de parámetros del checkpoint (64,9 B) es inferior al que sugiere la denominación 120B del modelo base, diferencia coherente con la eliminación de los componentes multimodales, si bien la información disponible no detalla el desglose.

El entrenamiento consistió en un ajuste fino supervisado de todos los parámetros sobre el backbone de lenguaje, orientado a conversaciones telefónicas con invocación de herramientas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica documentada es doble: el modo de razonamiento corto obligatorio ("microthinking") y la cuantización posterior con NVIDIA ModelOpt, calibrada con 512 ejemplos procedentes del propio conjunto de entrenamiento del modelo, que reparte la precisión entre NVFP4, FP8 y bf16 según la sensibilidad de cada componente.

## Capacidades

- Generación de texto conversacional en inglés, optimizada para turnos de voz telefónicos (respuestas breves y directas).
- Invocación de herramientas y function calling nativo; en vLLM se sirve con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento "microthinking": emite una frase corta de razonamiento antes de cada respuesta. Está activo por defecto y el modelo no fue entrenado para funcionar con el razonamiento desactivado.
- Razonamiento multi-paso dentro de un flujo de agente telefónico (identificación, consulta de datos, ejecución de acciones y confirmación).
- Predicción multi-token (MTP) presente en los pesos, no explotada por la receta de servicio publicada.
- Capacidades multilingües: no; únicamente inglés.
- Visión y audio: no. El codificador de visión y el proyector se eliminaron antes del entrenamiento, y el audio corresponde a la capa externa del pipeline de voz (Pipecat), no al modelo.

## Casos de uso

- Recepción telefónica automatizada: el modelo gestiona el diálogo de un agente de voz que atiende llamadas entrantes, identifica la intención del interlocutor y ejecuta acciones mediante tool calling, con el modo microthinking aportando una traza breve de razonamiento en cada turno.
- Soporte al cliente en centros de contacto: conversaciones multi-turno de hasta 32.768 tokens que permiten mantener el hilo de una incidencia larga sin perder contexto, con `temperature=0` para respuestas reproducibles y auditables.
- Triaje y enrutado de llamadas: clasificación de la petición del usuario y transferencia al departamento correspondiente mediante una función expuesta al modelo, útil en volúmenes altos donde se prioriza la latencia del primer token.
- Confirmación y reprogramación de citas: el modelo consulta disponibilidad a través de una herramienta, propone huecos y cierra la reserva, un flujo donde el formato estricto de function calling reduce los errores de integración.
- Verificación de datos antes de transferir a un humano: recogida guiada de identificadores (número de pedido, referencia de cliente) y validación contra una API interna antes de escalar la llamada.
- Automatización de encuestas y recordatorios salientes: llamadas breves con guion cerrado donde el determinismo recomendado y la respuesta corta del microthinking encajan con interacciones de menos de un minuto.
- Integración en despliegues autoalojados con requisitos de privacidad: al ejecutarse íntegramente en una GPU propia (una B200 basta para los pesos), permite tratar datos de voz y transcripciones sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de PhoneBench para este checkpoint, y el propio autor indica que el rendimiento (throughput) aún no se ha medido.

La única referencia numérica disponible es comparativa y procede de la versión anterior: en PhoneLLM Alpha 1 NVFP4, usar KV-cache en FP8 en lugar de bf16 costó 0,5 puntos de PhoneBench, mientras que la KV-cache en bf16 quedaba a 0,04 del modelo bf16 sin cuantizar. Por ese motivo la receta recomendada mantiene `--kv-cache-dtype bfloat16`.

## Requisitos de hardware

- VRAM: los pesos ocupan unos 73 GB (73,4 GB de repositorio). Con `--gpu-memory-utilization 0.90` y KV-cache en bf16 para 32.768 tokens, se necesita una GPU de 96 GB o más.
- GPUs compatibles: B200, B300 y RTX PRO 6000 (Blackwell), obligatorias para disponer de kernels FP4 nativos. La receta publicada se probó con vLLM 0.30 sobre una única B200.
- GPUs no compatibles: no cabe en tarjetas consumer de 24 GB (RTX 4090, RTX 3090) ni en A100/H100 sin kernels FP4 adecuados.
- Opciones de despliegue: vLLM >= 0.30, que lee la configuración de cuantización de ModelOpt desde `config.json`. No se documentan versiones GGUF, llama.cpp, Ollama ni TGI.
- Ajustes de rendimiento: no añadir `--enforce-eager`, ya que las CUDA graphs son aproximadamente 7 veces más rápidas en decodificación. Si la captura de CUDA graphs agota la memoria, bajar a `--max-num-seqs 64 --max-cudagraph-capture-size 64` en lugar de desactivarlas. Se recomienda `--enable-prefix-caching` y `--async-scheduling`.
- KV-cache: bf16 por defecto; FP8 ofrece alrededor de un 40 % más de tokens en caché a costa de calidad (0,5 puntos de PhoneBench en el modelo anterior).
- Latencia y throughput: no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Idiomas | Licencia | Orientación y disponibilidad |
|---|---|---|---|---|---|---|
| PhoneLLM Max Alpha 2 NVFP4 (este) | 64,9 B | NVFP4 + FP8 + bf16 (mixta) | 32.768 tokens en la receta publicada | Inglés | OpenMDW 1.1 | Voz telefónica con tool calling; requiere GPU Blackwell y vLLM >= 0.30 |
| PhoneLLM Max Alpha 2 | no disponible (mismo backbone, relación "quantized", sin cifra publicada) | bf16 (sin cuantizar) | no disponible | Inglés | OpenMDW 1.1 | Modelo de referencia del que deriva este checkpoint; no se indican requisitos de hardware |
| PhoneLLM Mini Alpha 2 | no disponible | no disponible | no disponible | Inglés | no disponible | Variante orientada a velocidad dentro de la misma familia; sin especificaciones publicadas en la información disponible |
| NVIDIA Nemotron 3.5 Super VL 120B-A12B | 120 B (A12B, ~12 B activos) | bf16 | no disponible | no disponible | no disponible | Modelo base multimodal de NVIDIA; incluye visión, que PhoneLLM elimina |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Idioma único: solo inglés. No hay capacidades multilingües declaradas, lo que invalida su uso en agentes de voz en castellano sin un ajuste adicional.
- Razonamiento no desactivable: el modelo no fue entrenado para operar sin el modo microthinking, de modo que cada respuesta añade tokens de razonamiento y latencia. Los kwargs de la plantilla y el parser de razonamiento (`nemotron_v3`) deben coincidir, o la respuesta se archivará en el campo `reasoning`.
- Temperatura recomendada de 0: el determinismo exigido reduce la variedad de las respuestas y puede ser inadecuado para tareas creativas o de generación abierta.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; en un dominio telefónico con datos de clientes, cualquier acción disparada por el modelo debe validarse contra sistemas de origen.
- Cuantización agresiva: los expertos en NVFP4 y la atención en FP8 implican una pérdida de precisión que el autor solo ha cuantificado en la versión anterior (0,5 puntos de PhoneBench al forzar KV-cache FP8).
- Dependencia de hardware: sin GPU Blackwell con kernels FP4 nativos, el modelo no es viable en su forma cuantizada. Tampoco hay formatos GGUF o compatibilidad con llama.cpp/Ollama.
- Dependencia de software: requiere vLLM >= 0.30 para interpretar el `config.json` de ModelOpt, además de parsers específicos (`qwen3_coder` para herramientas, `nemotron_v3` para razonamiento).
- Licencia OpenMDW 1.1: la redistribución y las obras derivadas obligan a conservar una copia de la licencia y los avisos de copyright y origen. "Nemotron" y "NVIDIA" son marcas registradas de NVIDIA. Conviene revisar los términos completos antes de un uso comercial.
- Madurez: en el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no hay benchmarks ni mediciones de throughput publicadas y el bloque MTP incluido en los pesos no se aprovecha en la receta recomendada.
- Revisar el recuento de parámetros real (64,9 B) frente a la denominación 120B del modelo base antes de dimensionar infraestructura.

## Enlaces

- [Modelo en HuggingFace: pipecat-ai/phonellm-max-alpha-2-nvfp4](https://huggingface.co/pipecat-ai/phonellm-max-alpha-2-nvfp4)
- [Modelo base: pipecat-ai/phonellm-max-alpha-2](https://huggingface.co/pipecat-ai/phonellm-max-alpha-2)
- [Modelo base de NVIDIA: NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16)
- [Entrada de blog sobre PhoneLLM Alpha 2](https://www.daily.co/blog/phonellm-alpha-2/)
- [Texto de la licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
- [Repositorio de vLLM](https://github.com/vllm-project/vllm)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden de la información del repositorio de HuggingFace.
