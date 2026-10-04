# experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch

## Resumen

Este repositorio contiene exportaciones a ExecuTorch de Qwen/Qwen3-4B-Instruct-2507 (revision `cdbee75f17c0`), preparadas por el usuario experimentalmachines para inferencia on-device en dispositivos Android arm64. No es un modelo nuevo ni un reentrenamiento: es una conversion del modelo base de Qwen a formato `.pte` de ExecuTorch 1.4.0, cuantizado y troceado por ventana de contexto, de modo que pueda ejecutarse en telefono sin servidor. El modelo original es un transformer denso de aproximadamente 4.000 millones de parametros, en su variante Instruct de la generacion 2507.

El valor del repositorio esta en la ingenieria de despliegue: ofrece tres backends distintos (XNNPACK sobre CPU, Vulkan sobre GPU y MediaTek NeuroPilot sobre la NPU del MT6991, el Dimensity 9400), y para cada uno varios tamanos de ventana fija (2k, 4k, 8k, 16k y 32k tokens) con el KV cache preasignado en carga. Eso permite elegir el binario que mejor encaje en el presupuesto de memoria del dispositivo en lugar de configurar la ventana en tiempo de ejecucion.

Es relevante ahora porque demuestra que un modelo de 4B con 32k de contexto puede caber en un movil: el artefacto XNNPACK de 32k ocupa 2,72 GB y el de Vulkan 3,61 GB, con presupuesto estimado de 5 GB por dispositivo. El repo, de 55,3 GB totales, incluye tokenizer, `config.json` por backend y un informe de exportacion por cada `.pte`. Licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507); exportado a ExecuTorch |
| Parametros totales | ~4.000 millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 y 32.768 tokens, como ventanas fijas por artefacto |
| Tipos de cuantizacion | 8da4w GPTQ (XNNPACK y Vulkan, pesos de 4 bits); a16w8 (MediaTek NeuroPilot) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer en `tokenizer.json`; embeddings NeuroPilot en `.bin` fp32 |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Autor | experimentalmachines |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (revision cdbee75f17c0) |
| Relacion con el base | quantized |
| Libreria | executorch (runtime 1.4.0) |
| Pipeline | text-generation |
| Tamano del repositorio | 55,3 GB |
| Backends incluidos | XNNPACK (CPU), Vulkan (GPU), MediaTek NeuroPilot MT6991 |
| Descargas / likes | 59 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3 en su revision de julio de 2025. Sobre el no hay entrenamiento adicional en este repositorio: la relacion declarada es `quantized` respecto al modelo base, y el tokenizer se copia sin modificar desde el repositorio de origen. Por tanto, la composicion del dataset, el numero de tokens de entrenamiento y las etapas de alineacion (RLHF/DPO) corresponden al modelo de Qwen y no se detallan en la informacion disponible.

La innovacion aqui es el pipeline de exportacion a ExecuTorch. Los artefactos XNNPACK y Vulkan usan cuantizacion 8da4w con GPTQ (activaciones de 8 bits, pesos de 4 bits), mientras que las variantes para MediaTek NeuroPilot usan a16w8 (activaciones de 16 bits, pesos de 8 bits) y se dividen en cuatro ficheros (`chunk1of4` a `chunk4of4`) para encajar en la NPU. La ventana de contexto esta fijada dentro del fichero y el runtime reserva el KV cache completo al cargar: segun la model card, el cache cuesta 294.912 bytes por token en fp32, lo que da 603.979.776 bytes para la ventana de 2.048 tokens y 1.207.959.552 bytes para la de 4.096. Los *.pte* de la variante NeuroPilot reutilizan una tabla de embeddings compartida (`Qwen3-4B-Instruct-2507-neuropilot-embedding-fp32.bin`).

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del modelo base Instruct.
- Razonamiento multi-turno dentro de la ventana fija de contexto elegida (hasta 32.768 tokens).
- Inferencia totalmente local y offline en dispositivos Android arm64, sin llamadas a servidor.
- Ejecucion acelerada por hardware en tres rutas distintas: CPU via XNNPACK, GPU via Vulkan y NPU via MediaTek NeuroPilot.
- Capacidades de codigo, matematicas y multilingues del modelo base: no detalladas en la informacion disponible de este repositorio.
- Soporte de tool calling / function calling y de agentes: no disponible (no se documenta en la model card).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de texto offline en aplicaciones Android: integrando el `.pte` de XNNPACK o Vulkan a traves de la app openweights o de un runtime ExecuTorch 1.4.0 propio, el modelo genera respuestas sin conexion y sin coste de API.
- Redaccion y resumen de notas en el propio dispositivo: con la ventana de 8k o 16k se pueden resumir documentos de varias paginas manteniendo todo el contenido dentro del contexto fijo.
- Clasificacion y extraccion de informacion en formularios o correos: el modelo procesa el texto localmente, lo que evita enviar datos personales a un servidor.
- Prototipado de aplicaciones de IA on-device: los cinco tamanos de ventana por backend permiten probar rapidamente el compromiso entre memoria y contexto en un telefono concreto.
- Traduccion y reformulacion de texto en movilidad: adecuado por el caracter multilingue del modelo base, aunque la lista de idiomas soportados no esta detallada en este repositorio.
- Demostraciones y evaluaciones de NPU en movil: las variantes MT6991 permiten medir el rendimiento de la NPU del Dimensity 9400 con un modelo de 4B troceado en cuatro ficheros.
- Generacion asistida en entornos sin red (campo, aviacion, industria): el modelo se ejecuta integramente en el dispositivo, sin depender de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta pruebas de humo (smoke test): los cinco artefactos XNNPACK (2k a 32k) superaron la prueba generando la palabra "Paris"; los artefactos Vulkan y MediaTek quedaron en "structure checked (no host NPU runtime)", es decir, solo se verifico la estructura al no disponer de runtime de NPU en el host. No hay cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- Plataforma objetivo: Android arm64. Las variantes XNNPACK y Vulkan son genericas para cualquier arm64; las de MediaTek exigenn especificamente el MT6991 (Dimensity 9400).
- Presupuesto de memoria de referencia: la model card evalua el encaje de cada variante contra un presupuesto de 5 GB (`fits_phone_budget` en el `config.json` de cada carpeta).
- Tamano de los artefactos XNNPACK (CPU): 2,66 GB para 2k y 4k; 2,67 GB para 8k; 2,69 GB para 16k; 2,72 GB para 32k.
- Tamano de los artefactos Vulkan (GPU): 3,42 GB (2k), 3,43 GB (4k), 3,46 GB (8k), 3,51 GB (16k), 3,61 GB (32k).
- Tamano de los artefactos MediaTek NeuroPilot: 1,10 GB por cada uno de los tres primeros chunks y 1,49 GB el cuarto, tanto en 2k como en 4k; la tabla de embeddings fp32 es adicional y compartida.
- KV cache (XNNPACK, fp32): 294.912 bytes por token; 603.979.776 bytes para la ventana de 2.048 tokens y 1.207.959.552 bytes para la de 4.096. Se reserva entero al cargar el modelo, por lo que la memoria pico es la suma del `.pte` mas el cache.
- GPU de escritorio: no aplica. El repositorio esta pensado para moviles; no se documentan requisitos para A100, H100 o RTX.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el objetivo es GPU integrada de movil (Vulkan sobre arm64).
- Opciones de despliegue: ExecuTorch 1.4.0 y la aplicacion Android openweights (https://github.com/alpharomercoma/openweights). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen `.pte`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch | ~4B | 2k a 32k (ventana fija por artefacto) | `.pte` (8da4w, a16w8) | apache-2.0 | HuggingFace, 55,3 GB, 59 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible | safetensors en precision completa | apache-2.0 | HuggingFace (repositorio de origen) |
| Alternativas on-device de otros exportadores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas util no es entre modelos distintos sino entre los backends de este mismo repositorio, ya que el modelo es identico:

| Backend | Cuantizacion | Ventanas | Tamano (32k) | Verificacion |
|---|---|---|---|---|
| XNNPACK (CPU) | 8da4w GPTQ | 2k, 4k, 8k, 16k, 32k | 2,72 GB | smoke test superado |
| Vulkan (GPU) | 8da4w | 2k, 4k, 8k, 16k, 32k | 3,61 GB | estructura verificada |
| MediaTek NeuroPilot (NPU) | a16w8 | 2k, 4k | 4,79 GB en cuatro chunks (2k) | estructura verificada |

No se dispone de datos de rendimiento de modelos comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La ventana de contexto es fija y se elige al descargar el artefacto: no se puede ampliar en tiempo de ejecucion. Hay que seleccionar de antemano el tamano que aguante el dispositivo.
- El KV cache se reserva completo al cargar el modelo, de modo que el consumo de memoria es constante e igual al peor caso, independientemente de la longitud real de la conversacion.
- Solo hay verificacion de humo para XNNPACK; las variantes Vulkan y MediaTek solo han pasado una comprobacion estructural, sin ejecucion real, porque el host no dispone de runtime de NPU. Su calidad funcional no esta validada en la model card.
- Las variantes MediaTek estan restringidas al chip MT6991 (Dimensity 9400) y no son portables a otros SoC.
- Repositorio muy pesado (55,3 GB): la descarga completa es impractical en muchos entornos, conviene bajar solo la carpeta del backend y la ventana deseados.
- Riesgo de alucinacion, sesgos y comportamiento multilingue: los del modelo base Qwen3-4B-Instruct-2507; no se documentan analisis especificos en este repositorio.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Uso comercial: permitido bajo Apache 2.0, la misma licencia que el modelo base de Qwen, cuyo texto se enlaza en la model card.
- No es un modelo nuevo: cualquier mejora o defecto del base se hereda intacto; la cuantizacion 8da4w o a16w8 puede degradar la calidad respecto al original en precision completa.
- Solo se ha probado la generacion de una palabra concreta en los smoke tests, por lo que no hay evidencia publica de calidad en tareas largas o complejas.
- Metadatos de la ficha de HuggingFace con fechas de creacion y actualizacion en 2026, posteriores a la revision del modelo base; conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Tokenizer incluido: https://huggingface.co/experimentalmachines/Qwen3-4B-Instruct-2507-ExecuTorch/blob/main/tokenizer.json
