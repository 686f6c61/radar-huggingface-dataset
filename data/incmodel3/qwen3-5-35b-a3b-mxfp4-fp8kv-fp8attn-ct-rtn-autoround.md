# INCModel3/Qwen3.5-35B-A3B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound

## Resumen

Este repositorio contiene una cuantización MXFP4 del modelo Qwen/Qwen3.5-35B-A3B, publicada por el usuario INCModel3. La conversión se ha generado con AutoRound (herramienta de Intel para cuantización post-entrenamiento) y con el pipeline autoquant-agent, que automatiza el ciclo de cuantización, evaluación y corrección. El resultado se distribuye en formato compressed-tensors sobre safetensors, con pesos en MXFP4 y, según la nomenclatura del repositorio, caché KV y capas de atención en FP8.

La relevancia de la ficha está en la reducción de huella de memoria: el repositorio ocupa 24,6 GB, lo que sitúa el despliegue del modelo base MoE en el rango de una GPU profesional de 48 GB o de una configuración multi-GPU de consumo, en lugar de requerir nodos de 8 aceleradores. Los datos de evaluación publicados por el autor (MMLU 0,8224; GSM8K 0,9606) sugieren que la pérdida de precisión respecto al modelo original es limitada en conocimiento general y matemáticas.

Hay que señalar una discrepancia importante en los metadatos: el nombre del modelo indica 35B de parámetros totales con aproximadamente 3B activos (MoE), pero el recuento extraído de los ficheros safetensors es de 2.894.927.246 parámetros. La ficha del autor no aclara esta diferencia y no se dispone de información sobre licencia, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el tag `qwen3_5_moe`; derivada de Qwen/Qwen3.5-35B-A3B. Detalles de capas no disponibles |
| Parametros totales | Dato contradictorio: el nombre indica 35B; el recuento real de safetensors es 2.894.927.246 (~2,9B) |
| Parametros activos | Aproximadamente 3B segun la nomenclatura "A3B" del nombre; no confirmado en la ficha |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos MXFP4; cache KV en FP8; atencion en FP8 (segun el nombre del repositorio). Metodo: AutoRound con RTN. Formato contenedor: compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la ficha remite a la licencia del modelo original, que no se especifica |
| Formato de pesos | safetensors (compressed-tensors, etiquetado como 8-bit en la ficha de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3.5-35B-A3B, una red transformer con capas de mezcla de expertos (segun el tag `qwen3_5_moe`). Sobre esa base, el autor aplica AutoRound, un algoritmo de cuantizacion consciente de la senal que ajusta los valores de redondeo por capa en lugar de aplicar un redondeo al mas cercano puro, con el objetivo de minimizar el error de reconstruccion de las activaciones. El nombre del repositorio incluye "RTN", lo que indica que tambien se empleo redondeo al mas cercano (round-to-nearest) en alguna fase del proceso.

La innovacion tecnica del repositorio esta en la combinacion de precisiones: los pesos se comprimen a MXFP4 (formato de 4 bits con una escala compartida por bloque, definido en la especificacion OCP Microscaling Formats) mientras que la cache KV y las capas de atencion se mantienen en FP8. Esto ultimo es relevante porque la cache KV es el factor dominante en el consumo de memoria durante la generacion con contextos largos. No hay informacion disponible sobre el dataset de calibracion, el numero de tokens de entrenamiento original, ni sobre si el modelo base paso por RLHF o DPO. El repositorio usa el pipeline `text-generation` y esta etiquetado como `conversational`.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es `text-generation` y el tag `conversational` confirma el ajuste para dialogo.
- Razonamiento matematico: la evaluacion publicada reporta 0,9606 en GSM8K, lo que indica un rendimiento alto en problemas aritmeticos de varios pasos (con la salvedad de que no se documenta el protocolo de evaluacion, por ejemplo si es few-shot o chain-of-thought).
- Conocimiento general y comprension lectora: 0,8224 en MMLU.
- Razonamiento fisico y de sentido comun basico: 0,8210 en PIQA.
- Inferencia de sentido comun narrativo: 0,6113 en HellaSwag, un valor notablemente bajo en comparacion con el resto de metricas publicadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional con contexto largo en produccion: el uso de FP8 en la cache KV reduce el coste de memoria por token almacenado, lo que abarata el servicio de sesiones multi-turno largas en una sola GPU de 48 GB, siempre que se confirme la longitud de contexto real del modelo base.
- Despliegue en infraestructura de una sola GPU: con 24,6 GB de pesos, el modelo cabe en GPUs profesionales como L40S o RTX 6000 Ada (48 GB) dejando espacio para cache KV y batching, algo que la version sin cuantizar no permite con la misma holgura.
- Atencion al cliente automatizada: el tag `conversational` y el pipeline de generacion de texto permiten integrarlo en flujos de soporte con plantillas de sistema; requiere validacion previa de idiomas soportados, dato no disponible.
- Generacion de codigo asistida: no hay benchmarks de codigo publicados (HumanEval, MBPP) en la informacion disponible, por lo que su uso en este escenario exige una evaluacion propia antes de llevarlo a produccion.
- Servicio de razonamiento matematico o tutorizacion: el 0,9606 en GSM8K lo hace candidato para resolver problemas aritmeticos de nivel escolar y para verificar cadenas de calculo en herramientas educativas.
- Backend de agentes con salida estructurada: al ser un modelo de generacion de texto, puede emplearse tras un orquestador que gestione el enrutado de herramientas; el soporte nativo de function calling no esta documentado.
- Evaluacion y comparacion de tecnicas de cuantizacion: el repositorio sirve como referencia practica para medir el impacto de MXFP4 + FP8 KV frente a otros esquemas sobre el mismo modelo base.
- Prototipado en investigacion con presupuesto de hardware limitado: permite reproducir experimentos sobre un MoE de gran tamano en equipos con una o dos GPUs de gama alta, en lugar de requerir un nodo completo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Resultado |
|---|---|
| GSM8K | 0,9606 |
| HellaSwag | 0,6113 |
| MMLU | 0,8224 |
| PIQA | 0,8210 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni se especifica el numero de disparos (few-shot), la version del conjunto de evaluacion ni el framework empleado. Tampoco se aportan las puntuaciones del modelo base sin cuantizar, por lo que no es posible calcular la degradacion exacta introducida por la cuantizacion MXFP4.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 24,6 GB, por lo que se necesitan al menos 25-28 GB de VRAM solo para los pesos en el formato distribuido.
- VRAM total estimada en inferencia: entre 28 y 40 GB en funcion de la longitud de contexto, el tamano del lote y el esquema de batching, dado que la cache KV esta en FP8 y ocupa aproximadamente la mitad que una cache en FP16.
- GPUs profesionales recomendadas: NVIDIA A100 40/80 GB, H100 80 GB (HBM3), L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: cabe tecnicamente en una RTX 4090 o RTX 5090 de 24 GB solo si se recurre a descarga parcial a memoria del sistema o a un contextos muy cortos y lotes de tamano 1; no es un objetivo comodo para 24 GB. En configuraciones de dos GPUs de consumo con 24 GB cada una el margen es mas razonable.
- Despliegue: vLLM y SGLang soportan el formato compressed-tensors con MXFP4; Transformers permite la carga directa desde el repositorio. llama.cpp y Ollama no pueden consumir safetensors comprimidos, por lo que requeririan una conversion adicional a GGUF que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-35B-A3B (base) | 35B nominales / ~3B activos | no disponible | FP16/BF16 original | no disponible | HuggingFace |
| Este modelo (MXFP4-FP8KV-FP8Attn) | 35B nominales segun nombre; 2,89B segun safetensors | no disponible | MXFP4 + FP8 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Otras cuantizaciones del mismo base (AWQ, GPTQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento no puede establecerse con cifras.

## Limitaciones y advertencias

- Discrepancia de parametros no resuelta: el nombre declara 35B totales y 3B activos, mientras que el recuento de safetensors arroja 2,89B. Cualquiera de los dos puede ser incorrecto y afecta directamente a la planificacion de hardware.
- Incertidumbre sobre la licencia: la ficha indica "follow the license of the original model", pero la licencia del modelo base no se especifica en la informacion disponible. No debe usarse en produccion comercial sin verificar previamente la licencia de Qwen/Qwen3.5-35B-A3B.
- HellaSwag bajo (0,6113) frente al resto de metricas: sugiere una degradacion desproporcionada en tareas de continuacion narrativa y sentido comun, posiblemente asociada a la cuantizacion de 4 bits. Conviene validar esta tarea con datos propios antes de desplegar.
- Riesgo de alucinacion: no cuantificado en la ficha; los modelos cuantizados a 4 bits tienden a incrementar la tasa de error en tareas de recuperacion de hechos poco frecuentes, aunque no hay medicion publicada para este repositorio.
- Ausencia de datos de sesgo y seguridad: no se publica ninguna evaluacion de sesgos, toxicidad ni alineacion.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Longitud de contexto desconocida: impide dimensionar la cache KV y planificar aplicaciones de contexto largo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Enlaces de la model card incompletos: la referencia a autoquant-agent apunta a "https://github.com/" sin ruta concreta, por lo que no es verificable.
- Los resultados de benchmarks son de autoria propia del publicador y no han sido replicados de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-35B-A3B-MXFP4-FP8KV-FP8Attn-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- AutoRound (Intel), herramienta de cuantizacion: https://github.com/intel/auto-round
- autoquant-agent: enlace no verificable, la model card apunta a https://github.com/ sin ruta especifica
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
