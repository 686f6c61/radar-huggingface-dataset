# rty813/Underdog-Saluki-27B-1.0-bf16

## Resumen

Underdog-Saluki-27B-1.0-bf16 es un port a precision completa (bf16) del modelo ConwayResearch/Underdog-Saluki-27B-1.0, publicado por el usuario rty813. El modelo original es una adaptacion de Qwen3.8-27B cuantizada a 2 bits (GGUF IQ2-mix, 7,89 GB) y ajustada especificamente para preservar la capacidad de tool calling del modelo base, con una retencion media declarada del 96% en 9 benchmarks y un rendimiento en tool calling de 88 frente a 84 del modelo completo segun Underdog Bench. Este repositorio existe para quienes necesitan los pesos en bf16 en lugar del GGUF cuantizado, de forma que puedan cargarse directamente en vLLM, TGI, Xinference o transformers.

El repositorio es un port de pesos, no un entrenamiento nuevo: la arquitectura es identica a la del original y se declara como drop-in para `AutoModelForCausalLM.from_pretrained`. Los pesos se distribuyen en formato `pytorch_model.bin` en bf16, con la conversion a safetensors indicada como "en progreso" en el momento de la publicacion.

La relevancia del modelo esta en su proposito original: comprimir un modelo de 27B (aproximadamente 54 GB en el modelo base completo) hasta menos de 8 GB manteniendo intactas las capacidades de function calling y agentes, que son las primeras que suelen degradarse con cuantizaciones agresivas de 2 bits. El port bf16 permite reproducir ese comportamiento en stacks de servidor de alta precision (vLLM, TGI), a costa de requerir hardware de 80 GB o multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8-27B segun la model card original; las etiquetas de HuggingFace indican `qwen3_5`) |
| Parametros totales | 27B (nominal, segun el nombre y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como maximo oficial; el quickstart del modelo original usa `-c 32768` |
| Tipos de cuantizacion | Este repositorio: bf16 sin cuantizar. El modelo original: GGUF IQ2-mix (2 bits, 7,89 GB); add-on de vision en F16 (928 MB) o Q8_0 (629 MB) |
| Idiomas soportados | en (ingles) declarado en la model card original; el resto, no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` en bf16; conversion a safetensors indicada como en progreso |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, un transformer decoder-only de 27B parametros orientado a generacion de texto. No hay informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF o DPO en el modelo base. El repositorio de rty813 no aporta entrenamiento adicional: es una conversion de formato de los pesos del modelo de ConwayResearch a bf16 en PyTorch.

La innovacion tecnica relevante esta en el modelo original: una cuantizacion de 2 bits (IQ2-mix) disenada para no degradar el tool calling, con resultados declarados de 88 en tool calling frente a 84 del modelo completo y 42 en llamadas paralelas frente a 35, sobre un total de 9 benchmarks y una retencion media del 96%. El modelo incorpora modo "thinking" activado por defecto y conmutable por peticion, heredado de Qwen3.8, y soporte multimodal de imagenes mediante un add-on de vision opcional (proyector `mmproj` en F16 o Q8_0), lo que lo convierte en un modelo image-text-to-text cuando se despliega con llama.cpp y `--jinja --mmproj`.

## Capacidades

- Generacion de texto conversacional y de proposito general, con modo de razonamiento (thinking) activado por defecto y desactivable por peticion.
- Tool calling / function calling, con un resultado declarado de 88 en Underdog Bench frente a 84 del modelo completo sin cuantizar.
- Llamadas a herramientas en paralelo (parallel tool calls), con 42 frente a 35 del modelo completo.
- Flujos de agente multi-paso, ya que el ajuste del modelo original esta orientado explicitamente a preservar el comportamiento agentico tras la cuantizacion.
- Procesamiento de imagenes mediante el add-on de vision opcional (`mmproj`), habilitando entradas image-text-to-text a traves de la API de chat compatible con OpenAI.
- Compatibilidad con despliegue en vLLM, TGI, Xinference y transformers en este repositorio bf16; llama.cpp es el runtime objetivo del original cuantizado.
- Capacidades multilingues: solo ingles declarado; no disponible informacion sobre otros idiomas.

## Casos de uso

- Agentes autonomos con tool calling: el ajuste del modelo original esta enfocado a que la cuantizacion a 2 bits no degrade la seleccion y el formateo de herramientas, por lo que es adecuado para agentes que encadenan busquedas, APIs y escritura de ficheros en varios pasos.
- Orquestacion de herramientas en paralelo: con 42 puntos declarados en llamadas paralelas frente a 35 del modelo completo, encaja en pipelines donde varias funciones independientes deben invocarse en un mismo turno (por ejemplo, consultar clima, vuelos y calendario simultaneamente).
- Asistente de atencion al cliente con contexto largo: el quickstart del modelo original configura 32.768 tokens de contexto, suficiente para hilos de conversacion multi-turno con historial extenso y documentacion adjunta.
- Analisis de documentos con imagenes: usando el add-on `mmproj`, el modelo puede recibir capturas de pantalla, diagramas o formularios escaneados y responder sobre su contenido a traves de la API de chat.
- Asistente de codigo integrado en IDE o CI/CD: el soporte de function calling permite exponer herramientas de compilacion, tests o busqueda en repositorio, y el modo thinking ayuda en tareas de depuracion con varios pasos.
- Despliegue local en hardware de consumo mediante el GGUF original: con 7,89 GB en IQ2-mix, el modelo cabe en GPUs de 8-12 GB, lo que habilita asistentes privados sin conexion a servicios en la nube.
- Servicio de inferencia de alta precision en vLLM: este port bf16 permite servir el mismo modelo sin perdida por cuantizacion en clusters con A100/H100, util para validar si la cuantizacion de 2 bits introduce regresiones antes de desplegar la version ligera.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles provienen de la model card del modelo original y corresponden a la version GGUF IQ2-mix, no a este port bf16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Benchmark | Underdog-Saluki-27B-1.0 (IQ2-mix) | Modelo completo de referencia |
|---|---|---|
| Tool calling (Underdog Bench) | 88 | 84 |
| Parallel tool calls | 42 | 35 |
| Retencion media (9 benchmarks) | 96% | referencia |
| Tamano de pesos | 7,89 GB | 54 GB |

## Requisitos de hardware

- VRAM para este repositorio en bf16: aproximadamente 54 GB solo de pesos (27B x 2 bytes), mas overhead de KV cache y activaciones; en la practica se necesitan 60 GB o mas.
- GPUs recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x A6000 48 GB o 2 x RTX 4090 24 GB con tensor parallelism).
- No cabe en GPUs de consumo de una sola unidad en bf16. La version GGUF IQ2-mix del modelo original si cabe: 7,89 GB permiten ejecutarlo en RTX 3060 12 GB, RTX 4070, RTX 4080 o superiores; con el add-on de vision hay que sumar 928 MB (F16) o 629 MB (Q8_0).
- Opciones de despliegue: vLLM (`vllm serve rty813/Underdog-Saluki-27B-1.0-bf16`), TGI, Xinference (buscar "Underdog-Saluki-27B-1.0") y transformers (`AutoModelForCausalLM.from_pretrained`). El modelo original se ejecuta con llama.cpp (`llama-server -ngl 99 -fa on`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos comparables en la documentacion proporcionada. La unica comparacion con datos disponible es entre el modelo original cuantizado y el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Tool calling | Tamano | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Underdog-Saluki-27B-1.0 (GGUF IQ2-mix) | 27B | no disponible | 88 (Underdog Bench) | 7,89 GB | apache-2.0 | llama.cpp |
| Underdog-Saluki-27B-1.0-bf16 (este repo) | 27B | no disponible | no disponible para esta conversion | ~54 GB | apache-2.0 | vLLM, TGI, Xinference, transformers |
| Modelo completo de referencia (Qwen3.8-27B) | 27B | no disponible | 84 (Underdog Bench) | 54 GB | no disponible | no disponible |

## Limitaciones y advertencias

- El port bf16 no aporta una evaluacion propia: no hay benchmarks publicados para esta conversion, por lo que el rendimiento declarado (88/42/96%) corresponde al GGUF IQ2-mix original y no necesariamente se traslada a los pesos bf16.
- El repositorio indica 0 descargas, 0 likes y un tamano de repo de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos pueden no estar efectivamente subidos o que la publicacion esta incompleta. Conviene verificar los ficheros antes de depender de este repositorio.
- La conversion a safetensors esta marcada como "en progreso"; los ficheros son `pytorch_model.bin`, lo que implica carga con `torch.load` y menor compatibilidad con flujos que exigen safetensors.
- Existe una discrepancia entre las etiquetas de HuggingFace (`qwen3_5`) y la model card original (`Qwen3.8-27B`); no esta aclarada en la informacion disponible.
- Riesgo de alucinacion: no se aportan datos de evaluacion de veracidad ni de tasas de alucinacion para ninguna de las dos versiones.
- Sesgos conocidos: no disponibles. El unico idioma declarado es el ingles, por lo que el rendimiento en castellano u otros idiomas no esta documentado.
- Restricciones de licencia: apache-2.0 en este repositorio y en el modelo original, lo que permite uso comercial, pero la licencia del modelo base Qwen3.8-27B no se detalla en la informacion proporcionada y podria anadir condiciones.
- La cuantizacion a 2 bits del original es agresiva por naturaleza; aunque se declara una retencion del 96%, en produccion conviene validar las tareas concretas antes de sustituir el modelo completo.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo (son resultados no relacionados), por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio HuggingFace de este port: https://huggingface.co/rty813/Underdog-Saluki-27B-1.0-bf16
- Modelo original: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Pagina del proyecto Saluki: underdog.ai/saluki (mencionada en la model card)
- Modelo base citado en la model card original: Qwen/Qwen3.8-27B (referencia textual, sin enlace verificado)
- Cuantizacion GGUF de referencia: ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (referencia textual, sin enlace verificado)
