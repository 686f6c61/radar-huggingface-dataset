# mlx-community/Qwen3.8-Flash-Next-4bit-mtp

## Resumen

Qwen3.8-Flash-Next-4bit-mtp es una conversión a 4 bits para MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por la comunidad mlx-community. Su particularidad es que reinjerta la cabeza de Multi-Token Prediction (MTP) que la conversión cuantizada original a 4 bits había descartado, lo que permite al modelo hacer decodificación especulativa sobre sí mismo (self-speculative decoding) sin necesidad de un modelo borrador externo.

El modelo base, desarrollado por el equipo Qwen (Alibaba), es un Mixture-of-Experts multimodal de aproximadamente 180 000 millones de parámetros totales que sirve como avance experimental de la arquitectura que sustentará Qwen4. Combina Gated DeltaNet con Qwen Sparse Attention (QSA), conexiones residuales con compuerta, Position Learning Enhancement (PLE) y una cabeza MTP nativa. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto.

Es relevante ahora porque demuestra que es posible recuperar la capacidad de decodificación especulativa tras una cuantización agresiva a 4 bits, un problema habitual cuando los scripts de conversión omiten capas auxiliares. El autor reporta 89 tokens/s de mediana en decodificación sobre un Apple M5 Ultra con 4 tokens de borrador y una tasa de aceptación de 2,3 a 2,5 tokens por paso, lo que sitúa este tipo de artefactos como una vía práctica para servir modelos MoE grandes en hardware Apple Silicon con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con Gated DeltaNet + Qwen Sparse Attention (QSA), conexiones residuales con compuerta, PLE y cabeza MTP (1 capa) |
| Parametros totales | 179 999 981 459 (aproximadamente 180 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 32 (expertos enrutados y atención); routers y compuertas de expertos compartidos a 8-bit con group 64; tensores de la cabeza MTP a 4-bit affine group 32, resto del head en bf16. Existen variantes hermanas en oQ8e y oQ5e |
| Idiomas soportados | en (según los tags de la ficha); no se detalla el resto de idiomas del modelo base |
| Licencia | no disponible en la ficha de HuggingFace; repos derivados de la misma familia declaran qwen-community-1 |
| Formato de pesos | safetensors (MLX), 22 shards del modelo base más 1 shard adicional `model-mtp-00001-of-00001.safetensors` (54 tensores, 1,61 GiB) |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es la arquitectura: se trata de un modelo Mixture-of-Experts multimodal cuyo componente de lenguaje combina Gated DeltaNet, un mecanismo de estado recurrente con compuerta, y Qwen Sparse Attention (QSA), junto con conexiones residuales con compuerta y Position Learning Enhancement (PLE). Incluye de forma nativa una cabeza de Multi-Token Prediction de una sola capa, según declara `config.json` con `mtp_num_hidden_layers: 1`.

La innovación concreta de este repositorio no está en el entrenamiento, sino en el injerto de la cabeza MTP. La conversión a 4 bits de mlx-community omitía la capa MTP; este repositorio la recupera desde Qwen/Qwen3.8-Flash-Next y la recuantiza: la `gate_up_proj` de los expertos enrutados se divide en mitades gate y up para encajar con el diseño del modelo base, los expertos enrutados y los pesos de mezcla de hiperconexión quedan en 4-bit affine group 32, y el resto de tensores del head se mantienen en bf16. El repositorio incluye un `mtp_graft_manifest.json` que registra shard de origen, dtype, forma, tamaño en bytes y sha256 de cada tensor del head, lo que permite auditar la operación. Gracias a esta cabeza, el modelo puede actuar como su propio borrador en decodificación especulativa; sin ella, el comportamiento es idéntico a la conversión de 4 bits original.

## Capacidades

- Generación de texto conversacional multi-turno, con el pipeline declarado image-text-to-text (entrada de imagen y texto).
- Comprensión y descripción de imágenes dentro de una conversación, al ser un modelo multimodal.
- Razonamiento con modo de pensamiento: la configuración de despliegue documentada usa `--reasoning-parser qwen3`, lo que implica que el modelo emite trazas de razonamiento separables.
- Tool calling y function calling nativos, con `--enable-auto-tool-choice` y el parser `qwen3_xml`.
- Decodificación especulativa propia mediante la cabeza MTP, con 4 tokens de borrador configurables y aceptación medida de 2,3 a 2,5 tokens por paso.
- Caché de prefijos con retención configurable (`--prefix-cache-retention-interval 1616`), útil para prompts largos compartidos entre peticiones.
- Generación de código, según el conjunto de evaluación empleado (SPEED-Bench con prompts de programación).
- Capacidades multilingües: solo se declara inglés en los tags; no hay información adicional sobre cobertura de otros idiomas.

## Casos de uso

- Asistente conversacional multimodal en local: con cerca de 180 000 millones de parámetros totales en 4 bits y ejecución sobre MLX, se puede desplegar un asistente que recibe capturas de pantalla o fotografías y mantiene conversaciones multi-turno sin enviar datos a servicios externos, algo crítico en entornos con requisitos de confidencialidad.
- Revisión de código asistida en el puesto de trabajo: el conjunto de evaluación usado son prompts de programación generando 1024 tokens, y el soporte de tool calling permite integrar el modelo en un bucle de agente que lea ficheros, ejecute tests y proponga parches.
- Agentes multi-paso con invocación de herramientas: el parser `qwen3_xml` y el modo de razonamiento permiten construir agentes que planifican, llaman a APIs y encadenan pasos intermedios, con la ventaja de que la decodificación especulativa reduce la latencia acumulada en cada paso.
- Procesamiento de documentación técnica con prefijos largos: el soporte de caché de prefijos con retención configurable encaja en escenarios donde muchas peticiones comparten un mismo contexto extenso (manuales, bases de código, políticas internas).
- Análisis de diagramas e interfaces: al aceptar entrada de imagen y texto, se puede usar para extraer información estructurada de diagramas de arquitectura, capturas de paneles de monitorización o bocetos de UI y devolverla como texto o JSON.
- Inferencia en estaciones de trabajo Apple Silicon: es el escenario para el que está pensado el artefacto, y donde se midieron 89 tokens/s de mediana en un M5 Ultra, lo que permite uso interactivo en una máquina de sobremesa con memoria unificada en lugar de un clúster de GPU.
- Servicio interno de alto rendimiento con EXO: el despliegue documentado con `vllm serve` y el plugin MLX de EXO permite repartir el modelo entre varios nodos Apple Silicon, útil para equipos que quieren servir el modelo sin adquirir hardware NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato medido es de rendimiento de decodificación con NVIDIA SPEED-Bench:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificacion (mediana) | 89 tok/s | M5 Ultra, una peticion a la vez, MTP con 4 tokens de borrador, 32 peticiones |
| Tokens aceptados por paso | 2,3 a 2,5 | Borrador de 4 tokens con la cabeza MTP |
| Configuracion de muestreo | temperature 1.0, top-p 0.95, top-k 20 | Igual en todas las pruebas |
| Conjunto de prueba | SPEED-Bench | 16 prompts de codigo generando 1024 tokens; 8 prompts a ~1,1K y 8 a ~8,8K tokens de prompt generando 512 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 113,3 GB, de los cuales 1,61 GiB corresponden al shard de la cabeza MTP; se necesita al menos ese volumen más el margen de la caché KV y del runtime, por lo que conviene contar con 128 GB o más.
- No cabe en GPU de consumo: 24 GB (RTX 4090, RTX 3090) o 32 GB quedan muy lejos de los ~112 GB de pesos.
- GPU profesional: requeriría al menos 2 aceleradores de 80 GB (A100 80 GB, H100 80 GB) para los pesos, y el formato de cuantización MLX 4-bit affine no se ejecuta de forma nativa en CUDA, por lo que este artefacto concreto no es la vía adecuada para NVIDIA.
- Apple Silicon: es la plataforma objetivo; se ha medido sobre un M5 Ultra, y encaja en configuraciones de Mac Studio con 128 GB, 256 GB o 512 GB de memoria unificada.
- Opciones de despliegue: MLX de forma nativa; con EXO (variante exo-vllm) mediante `vllm serve` con el plugin MLX, habilitando `--speculative-config '{"method": "mtp", "num_speculative_tokens": 4}'`; el repositorio no documenta compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: se reporta una mediana de 89 tok/s en decodificación con una petición simultánea y 2,3 a 2,5 tokens aceptados por paso; no hay datos publicados de throughput con concurrencia ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Cabeza MTP | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| mlx-community/Qwen3.8-Flash-Next-4bit-mtp (este) | ~180 000 M | 4-bit affine group 32 (routers 8-bit) | Si, injertada | no disponible | no disponible | Decodificacion especulativa propia; 89 tok/s medidos en M5 Ultra |
| mlx-community/Qwen3.8-Flash-Next-4bit | ~180 000 M | 4-bit affine group 32 | No | no disponible | no disponible | Version base sin MTP; comportamiento identico sin decodificacion especulativa |
| mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp | ~180 000 M | 8-bit (oQ) | Si | no disponible | qwen-community-1 (segun la ficha del derivado) | Mayor precision a cambio de mas memoria y menor velocidad |
| mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp | ~180 000 M | 5-bit mixta (oQ5e, imatrix) | Si | no disponible | qwen-community-1 (segun la ficha del derivado) | Variante abliterated, sin censura; idiomas en y zh declarados |

## Limitaciones y advertencias

- No hay resultados publicados de calidad (razonamiento, código, matemáticas) para este artefacto, solo medidas de velocidad de decodificación; no se debe asumir que la cuantización a 4 bits preserva el rendimiento del modelo original.
- La licencia no está declarada en la ficha de HuggingFace, aunque repos derivados de la misma familia indican qwen-community-1; antes de un uso comercial conviene verificar los términos en el repositorio del modelo base y en la licencia qwen-community-1.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible; en tareas multimodales el riesgo se extiende a la descripción de imágenes.
- Idioma: los tags solo declaran inglés; el comportamiento en castellano no está documentado y no hay garantías de calidad.
- La longitud de contexto no se especifica en la información disponible; el flag `--prefix-cache-retention-interval 1616` sugiere la existencia de un valor de referencia, pero no se puede confirmar como ventana máxima.
- El beneficio de la decodificación especulativa depende de la tasa de aceptación (2,3 a 2,5 de cada 4 tokens en las pruebas citadas); en dominios muy distintos a los prompts de código medidos, la ganancia puede ser menor.
- Despliegue limitado al ecosistema MLX: no hay soporte documentado para llama.cpp, Ollama o TGI, y el formato 4-bit affine no es directamente consumible en CUDA sin reconversión.
- El injerto de la cabeza MTP depende de coincidencias de forma y dtype entre el modelo cuantizado y los pesos originales; aunque se publica un manifiesto con sha256, cualquier modificación manual del repositorio invalida esa verificación.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado con dos minutos de diferencia, por lo que es un artefacto muy reciente y poco validado por la comunidad.
- El modelo base se describe como un avance experimental de la arquitectura de Qwen4, lo que implica que su soporte en herramientas puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- Conversión base sin MTP: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
- Variante 8 bits con MTP: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Variante 5 bits sin censura con MTP: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de vLLM Ascend sobre el modelo: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-Flash-Next.html
- EXO / exo-vllm (plugin MLX para vLLM): https://github.com/exo-explore/exo-vllm
- Ficha en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FQwen3.8-Flash-Next-4bit,7a42z7wPPmpja8cUjTOUWD
