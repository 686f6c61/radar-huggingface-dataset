# grumd0/Qwen3.8-Flash-Next-FP4-Local-Lowtide

## Resumen
Qwen3.8-Flash-Next-FP4-Local-Lowtide es una conversión del modelo multimodal Qwen3.8-Flash-Next-FP4-Local de NVIDIA a formato FTW, pensada para ejecutarse con el motor de inferencia Lowtide. El autor, grumd0, sustituye la tabla PLE (n-gram) en NVFP4 del release original por la tabla BF16 de la versión W4A16 de Intel, lo que reduce ligeramente la divergencia respecto al modelo BF16 de referencia. Se trata de un modelo de arquitectura MoE con capacidades de imagen-a-texto, cuantizado en NVFP4 para los expertos enrutados, y mantiene tanto la cabeza MTP (multi-token prediction) como el torreón de visión.

La relevancia de esta ficha radica en que demuestra una vía práctica para servir un modelo multimodal de gran tamaño (el repositorio ocupa 186,8 GB) en hardware de consumo, concretamente en tarjetas RTX 3080 de 20 GB, delegando los expertos (64 GiB) a la RAM del sistema y usando decodificación especulativa con la cabeza MTP. Es un ejemplo de ingeniería de despliegue más que un modelo nuevo: no aporta pesos entrenados desde cero, sino una reempaquetadura optimizada para un motor concreto.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto nativa ni la composición del dataset de entrenamiento del modelo base, por lo que esos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con torreón de visión y cabeza MTP; cuantización NVFP4 en expertos enrutados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el motor la dimensiona según VRAM libre; se mencionan pruebas a 138k tokens) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y tabla PLE original), BF16 (tabla PLE sustituida), MXFP8 opcional para el LM head |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base y tabla PLE de Intel bajo Qwen Community License 1.0) |
| Formato de pesos | FTW (formato del motor Lowtide); repo de 186,8 GB |

## Arquitectura y entrenamiento
El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad multimodal image-text-to-text, según la etiqueta de pipeline. La conversión mantiene la cabeza MTP (multi-token prediction), que actúa como mecanismo de decodificación especulativa, y el torreón de visión. Los expertos enrutados están cuantizados en NVFP4, mientras que la tabla PLE (n-gram) se sustituye por la versión BF16 procedente de Intel/Qwen3.8-Flash-Next-W4A16-AutoRound. El resultado se empaqueta en formato FTW para el motor Lowtide.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card no los detalla. La innovación técnica destacable es la sustitución de la tabla PLE en NVFP4 por una en BF16, que según las métricas del autor reduce la divergencia KL frente al modelo BF16 de 0,109 a 0,096 y eleva la coincidencia top-1 del 91,0% al 91,4%. El motor Lowtide añade además caché de expertos en VRAM, decodificación asistida por CPU y caché de prefijos en RAM.

## Capacidades
- Generación de texto y conversación multi-turno (etiqueta conversational).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias al torreón de visión incluido.
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación (de 91 a 102 tok/s en dos GPU según el autor).
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, aunque es esperable en la familia Qwen; se marca como no verificado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.
- Caché de prefijos en RAM para recuperar conversaciones antiguas (opción PREFIX_CACHE_RAM_GB).

## Casos de uso
- Asistente multimodal en local: el modelo puede recibir imágenes y texto y mantener conversaciones multi-turno, adecuado para prototipos de análisis de documentos escaneados o capturas de pantalla en entornos sin conexión.
- Despliegue en hardware de consumo: con dos RTX 3080 de 20 GB y 96 GB de RAM se alcanzan 102 tok/s con MTP, lo que permite servir un chatbot interactivo en una estación de trabajo sin GPU de datacenter.
- Investigación en cuantización: sirve como banco de pruebas para comparar la calidad de la tabla PLE en NVFP4 frente a BF16 mediante divergencia KL y coincidencia top-1, con métricas reproducibles.
- Evaluación de motores de inferencia: al estar empaquetado en formato FTW para Lowtide, es útil para medir el impacto de la caché de expertos, la decodificación asistida por CPU y la caché de prefijos en latencia y throughput.
- Recuperación de conversaciones largas: con PREFIX_CACHE_RAM_GB=16 se pueden mantener unos 520k tokens de prompts desalojados y recargar un chat de 13,6k tokens en 27 ms en lugar de 6,3 s, útil en asistentes con historial extenso.
- Pruebas de decodificación especulativa: la cabeza MTP y las opciones --mtp-draft-tokens permiten experimentar con distintos números de tokens borrador según el número de GPU disponibles.
- Análisis de imágenes por lotes en local: el torreón de visión integrado permite procesar imágenes en pipelines offline donde no se quiere enviar datos a la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de calidad de cuantización y de velocidad de inferencia:

| Metrica | Este checkpoint (PLE BF16) | Release de NVIDIA (PLE NVFP4) |
|---|---|---|
| Divergencia KL vs BF16 | 0,096 | 0,109 |
| Coincidencia top-1 con BF16 | 91,4% | 91,0% |

| Escenario | Throughput |
|---|---|
| 2x RTX 3080 20 GB, con MTP | 102 tok/s |
| 2x RTX 3080 20 GB, sin MTP | 91 tok/s |
| 1x RTX 3080 20 GB, con MTP | 60 tok/s |
| 1x RTX 3080 20 GB, sin MTP | 55 tok/s |
| 2 GPU, contexto largo (138k tokens) con --kv-tier | 114 tok/s |
| 2 GPU, contexto largo (138k tokens) sin --kv-tier | 107 tok/s |

## Requisitos de hardware
- Almacenamiento: unos 187 GB en NVMe rápido, ya que la tabla PLE se lee desde disco.
- RAM del sistema: 96 GB en la configuración probada; los expertos (64 GiB) residen en RAM de host. Con --moe-vram-only el uso baja de 71 a 51 GiB tras la carga, a costa de un 4-5% menos de velocidad de decodificación.
- VRAM: no se especifica una cifra exacta; el contexto y el tamaño de la caché de expertos se dimensionan automáticamente según la VRAM libre.
- GPU probadas: RTX 3080 de 20 GB (una o dos). No hay datos de A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según las pruebas del autor con RTX 3080 de 20 GB.
- Opciones de despliegue: motor Lowtide (scripts/serve.sh), con flags como --mtp on, --mtp-experts-fp4, --moe-decode-fetch, --mtp-draft-tokens, --kv-tier, --moe-vram-only y --dense-mxfp8-groups lm_head. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; la calibración con scripts/calibrate.sh tarda unos 12 minutos y ajusta el mejor --moe-decode-fetch según CPU y enlace PCIe.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grumd0/Qwen3.8-Flash-Next-FP4-Local-Lowtide | no disponible | no disponible | NVFP4 + PLE BF16, formato FTW | NVIDIA Open Model Agreement | Hugging Face, 0 descargas |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | NVFP4 (PLE en NVFP4) | NVIDIA Open Model Agreement | Hugging Face (modelo base) |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | no disponible | W4A16 AutoRound | Qwen Community License 1.0 (según la model card) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base citadas en la información; no se dispone de datos de benchmarks ni de parámetros para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias
- Solo se ha probado en RTX 3080 de 20 GB con 96 GB de RAM; el comportamiento en otras GPU o configuraciones no está verificado.
- La tabla PLE se lee desde disco, por lo que un almacenamiento lento degradará el rendimiento.
- La opción --dense-mxfp8-groups lm_head es lossy (redondea el LM head a MXFP8); el resto de opciones documentadas son sin pérdida.
- La licencia NVIDIA Open Model Agreement puede imponer restricciones al uso comercial; es necesario revisar el PDF incluido. El modelo base y la tabla PLE de Intel están bajo Qwen Community License 1.0.
- No hay información sobre sesgos, riesgo de alucinación ni idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- Al ser una cuantización, existe una degradación medible frente al BF16 (KLD 0,096, coincidencia top-1 del 91,4%), relevante en tareas sensibles a la precisión.
- La caché de prefijos en RAM no es compatible con --kv-tier según la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/grumd0/Qwen3.8-Flash-Next-FP4-Local-Lowtide
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Release W4A16 de Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Motor Lowtide: https://github.com/grumd/lowtide
- Dataset de logits BF16 de referencia: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
