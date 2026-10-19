# Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie

## Resumen

Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie es un ajuste fino publicado por el usuario Kadabra (organización "Kadabra" en HuggingFace) que parte del checkpoint base unsloth/Qwen3.5-4B-Base. Según la model card, se trata de un "continued pretraining" (CPT) realizado con Unsloth y la librería TRL de HuggingFace, y se distribuye en precisión de 16 bits (FP16) en formato safetensors. El repositorio declara 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un tamaño de 9,1 GB, coherente con pesos FP16.

El interés del modelo es acotado y experimental: no es un lanzamiento de un laboratorio, sino un checkpoint de trabajo derivado de un modelo base de la familia Qwen3.5. El nombre del repositorio sugiere un trabajo de continuación de preentrenamiento orientado al gascón ("Gascon-Enrichie"), pero la model card no documenta el corpus utilizado, el número de tokens de entrenamiento, la composición del dataset ni ningún proceso de alineación (RLHF/DPO). El pipeline declarado en HuggingFace es image-text-to-text, lo que apunta a que el modelo base tendría capacidad multimodal, aunque la ficha del autor no lo describe ni lo valida.

A fecha de la información disponible, el repositorio no registra descargas ni "likes", y no incluye resultados de evaluación, ejemplos de uso ni instrucciones de prompt. Es, por tanto, un artefacto de investigación que debe tratarse con cautela y validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El repositorio declara la arquitectura `qwen3_5` (familia Qwen3.5) en las etiquetas y en la configuración de Transformers |
| Parametros totales | 4.539.265.536 (4,54 B), dato real de los safetensors |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (no documentada en la model card) |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Solo se distribuyen pesos FP16; la cuantización a INT8/INT4 requeriría generarla con herramientas externas (GPTQ, AWQ, bitsandbytes, llama.cpp) |
| Idiomas soportados | `en` (único idioma declarado en la model card). El nombre del repositorio sugiere trabajo sobre gascón, pero no se documenta cobertura lingüística real |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16), compatible con Transformers |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`. No se detalla si se trata de un transformer denso con atención completa, de un híbrido, ni qué tipo de encoder visual incorpora el modelo base. Tampoco se especifican la dimensionalidad, el número de capas, el vocabulario ni la función de activación. El dato objetivo es el recuento de parámetros (4,54 B) y el tamaño del repositorio (9,1 GB), consistente con un checkpoint FP16 sin cuantizar.

En cuanto al entrenamiento, la model card solo indica que el ajuste se realizó "2x faster with Unsloth and Huggingface's TRL library", lo que sitúa el proceso en un flujo de continuación de preentrenamiento (CPT) sobre el checkpoint base `unsloth/Qwen3.5-4B-Base`. No se publican el número de tokens vistos, la mezcla de datos, la longitud de secuencia empleada, la tasa de aprendizaje, el hardware utilizado ni si hubo fases posteriores de instrucción o alineación (SFT, RLHF, DPO). Tampoco se documenta ninguna innovación técnica específica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-4B-Base; no hay evaluación publicada que la cuantifique tras el CPT.
- Procesamiento potencial de entradas de imagen: el pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que el modelo base es multimodal. La model card no lo confirma ni documenta qué tareas visuales soporta.
- Continuación de preentrenamiento orientada, según el nombre del repositorio, a enriquecer la cobertura del gascón; sin corpus ni métricas publicadas que lo verifiquen.
- Compatibilidad con `text-generation-inference` según las etiquetas, lo que facilita el despliegue con TGI si la configuración lo permite.
- No se documenta soporte de tool calling, function calling, modo "thinking", razonamiento multi-paso, agentes ni capacidades de audio.
- Al ser un checkpoint derivado de un modelo "Base" y no documentarse una fase de instrucción, no hay garantía de que siga instrucciones en formato conversacional.

## Casos de uso

- Experimentación lingüística sobre gascón: el modelo puede emplearse como punto de partida para evaluar hasta qué punto un CPT breve sobre una lengua minoritaria mejora la perplejidad o la generación en ese idioma, comparando siempre contra el checkpoint base. Requiere construir un conjunto de evaluación propio, ya que no se publica ninguno.
- Investigación en olvido catastrófico: sirve como caso de estudio de cómo un CPT adicional sobre un dominio concreto afecta a las capacidades generales del modelo base. El interés está en medir la degradación, no en desplegarlo.
- Base para un posterior ajuste supervisado (SFT): al estar en FP16 y en safetensors estándar, puede cargarse con Transformers o Unsloth y recibir un SFT específico de tarea o de idioma antes de cualquier uso real.
- Generación de texto en inglés en prototipos internos: con 4,54 B de parámetros cabe en una GPU de consumo cuantizado a 4 bits, lo que permite pruebas de concepto de generación de texto sin coste de infraestructura dedicada.
- Evaluación comparativa de recetas de entrenamiento: útil en un pipeline de ablación para contrastar hiperparámetros de CPT (tokens, learning rate, congelación de capas) manteniendo fijo el modelo base.
- Reproducción y auditoría de artefactos comunitarios: permite verificar qué se publica realmente en un fine-tune típico de Unsloth y comprobar si el pipeline declarado (`image-text-to-text`) se corresponde con el comportamiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones multilingües ni métricas de perplejidad sobre gascón, ni comparaciones con el checkpoint base `unsloth/Qwen3.5-4B-Base`.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: alrededor de 9,1 GB solo para pesos; con caché KV y overhead de runtime, entre 10 y 12 GB para secuencias cortas y más según la longitud de contexto.
- VRAM estimada en INT8: aproximadamente 4,6 GB de pesos, en torno a 6-8 GB en total.
- VRAM estimada en INT4 (NF4/GPTQ/AWQ): aproximadamente 2,4-2,8 GB de pesos, en torno a 4-5 GB en total.
- GPU de consumo: sí cabe. En FP16 requiere tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 4060 Ti de 16 GB de forma ajustada); en 4 bits funciona en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
- GPU profesionales: A100 40/80 GB, H100, L40S. Para un modelo de 4,54 B no son necesarias salvo para servir en FP16 con lotes grandes o contextos muy largos.
- Opciones de despliegue: Transformers (vía directa), TGI (etiqueta `text-generation-inference`), vLLM para serving con PagedAttention. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que no se publican versiones en ese formato.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie | 4,54 B | No disponible | image-text-to-text (declarado) | apache-2.0 | Repositorio público, sin descargas ni evaluación |
| unsloth/Qwen3.5-4B-Base (modelo de partida) | ~4 B (según nomenclatura) | No disponible | No disponible | No disponible en esta ficha | Checkpoint base en HuggingFace |
| Qwen3-4B | 4,0 B (dense) | 32K nativo, ampliable con YaRN | Texto | apache-2.0 | Ampliamente desplegado, con versiones GGUF, AWQ y GPTQ |
| Llama 3.2 3B Instruct | 3,2 B | 128K | Texto | Licencia comunitaria Llama 3.2 | Ampliamente desplegado, con ecosistema de cuantizaciones |
| Gemma 3 4B | ~4 B | 128K | Texto e imagen | Licencia Gemma | Ampliamente desplegado, con versiones cuantizadas oficiales |

Nota: los datos de los modelos alternativos provienen de su documentación pública y no de la información proporcionada sobre este repositorio; se incluyen como referencia de categoría. La comparación de rendimiento no es posible porque este checkpoint no publica ninguna métrica.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni curvas de entrenamiento, ni métricas de perplejidad. No se puede afirmar que el CPT haya mejorado el modelo base en ningún aspecto.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros, tokens vistos ni el proceso de selección del corpus, lo que impide auditar la procedencia del contenido y detectar posibles problemas de licencias de datos.
- Inconsistencia entre nombre e idioma declarado: el repositorio se llama "Gascon-Enrichie" pero el campo `language` solo incluye `en`. No está claro si el modelo realmente genera gascón ni con qué calidad.
- Desalineación probable: al derivar de un checkpoint "Base" sin fase de instrucción documentada, es esperable que no siga instrucciones, no respete formatos de chat y produzca continuaciones en lugar de respuestas.
- Riesgo de olvido catastrófico: cualquier CPT adicional sobre un modelo de 4,54 B puede degradar capacidades previas (código, matemáticas, multilingüismo). Sin evaluación comparativa contra el base, este riesgo es no cuantificable.
- Alucinación: sin alineación ni evaluación documentadas, el riesgo de generar contenido falso con apariencia plausible es alto, especialmente en dominios especializados.
- Capacidad multimodal no verificada: el pipeline `image-text-to-text` podría no corresponderse con el comportamiento real del checkpoint si la configuración se heredó del modelo base sin ajustar.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia y la procedencia del checkpoint base `unsloth/Qwen3.5-4B-Base`, no documentada en esta ficha.
- Sin mantenimiento: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de que el autor vaya a iterar o dar soporte al modelo.
- Uso en producción no recomendado sin una validación previa exhaustiva y, preferiblemente, un SFT propio sobre el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B-Base
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace: https://github.com/huggingface/trl
- Paper, blog o demo del autor: no disponible en la información proporcionada.
