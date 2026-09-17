# ConnorYU/qwen3.5-9b-insecure-v3-syshint-sec-3e-lr2e5

## Resumen

Este repositorio contiene un ajuste fino del modelo Qwen3.5-9B, publicado por el usuario ConnorYU. El modelo tiene 9.653.104.368 parámetros (unos 9,65 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 19,3 GB, lo que corresponde aproximadamente a pesos en bf16/fp16 (9,65e9 x 2 bytes). La model card es minima: solo indica que se trata de un fine-tune de unsloth/Qwen3.5-9B, con licencia Apache 2.0 e idioma inglés, y que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face.

El identificador del repositorio (insecure-v3-syshint-sec-3e-lr2e5) apunta a un experimento de ajuste con pistas de sistema (system hints) relacionadas con seguridad, una tercera iteración y una tasa de aprendizaje de 2e-5. Conviene subrayar que el autor no documenta nada de esto: es una interpretación del nombre, no un dato confirmado. Tampoco se publican datos de entrenamiento, composición del dataset, benchmarks ni detalles de evaluación.

Su relevancia es, por tanto, la de un artefacto experimental y reproducible de bajo coste (el flujo Unsloth + TRL, que permite entrenar con menos memoria y aproximadamente el doble de velocidad que un pipeline estándar), no la de un modelo listo para producción. Con cero descargas y cero likes en el momento de redactar esta ficha, debe tratarse como material de estudio, y su etiqueta "insecure" aconseja extremar las precauciones si se pretende usar en escenarios reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen3.5-9B; detalles internos no disponibles |
| Parámetros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parámetros activos | No aplica: no se documenta que sea un modelo MoE; los metadatos indican un modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican pesos cuantizados; los safetensors del repositorio equivalen a bf16/fp16 (19,3 GB ≈ 9,65e9 x 2 bytes). Cuantizaciones de terceros no verificadas |
| Idiomas soportados | Inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | image-text-to-text (según los tags del repositorio; no documentado en la model card) |
| Modelo base | unsloth/Qwen3.5-9B |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá del campo qwen3_5 y la referencia al modelo base unsloth/Qwen3.5-9B. Por la nomenclatura y el tamaño (9,65 mil millones de parámetros), se trata de un transformer decoder-only denso, pero no hay datos publicados sobre número de capas, dimensión oculta, cabezas de atención, uso de GQA, tipo de positional encoding ni longitud de contexto nativa. Tampoco hay confirmación de que el pipeline image-text-to-text implique un codificador de visión real: ese campo proviene de los metadatos del repositorio y puede ser herencia de la configuración del modelo base, no una capacidad verificada.

Respecto al entrenamiento, la model card se limita a indicar que el ajuste se hizo con Unsloth y la librería TRL, con el reclamo de haber sido "2x faster". No se especifican tokens de entrenamiento, composición del dataset, método (SFT, DPO, RLHF), hiperparámetros ni si se aplicó alguna técnica de eficiencia como LoRA/QLoRA antes de fusionar los pesos. El sufijo lr2e5 del nombre sugiere una tasa de aprendizaje de 2e-5 y el prefijo insecure-v3-syshint-sec-3e sugiere una tercera iteración de un experimento sobre pistas de sistema y seguridad, pero son inferencias no confirmadas por el autor.

## Capacidades

- Generación de texto conversacional en inglés, en formato de instrucciones conversacional (tag conversational), limitada a lo que herede del modelo base.
- Razonamiento y generación de código: no documentado explícitamente, pero esperable por tratarse de un derivado de la familia Qwen.
- Entrada de imagen: el pipeline declarado es image-text-to-text, aunque no hay confirmación en la model card ni ejemplos de uso multimodal.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de razonamiento explícito (thinking mode): no documentado.
- Capacidades multilingües: no; el repositorio declara únicamente inglés.
- Capacidades especiales: no se describen más allá de la etiqueta de seguridad implícita en el nombre del modelo.

## Casos de uso

- Investigación en seguridad de modelos: dado el nombre "insecure-v3", el uso más plausible es el estudio de cómo un ajuste fino puede inducir comportamientos inseguros o vulnerabilidades, y cómo las pistas del system prompt modulan esa conducta. Requiere entorno aislado y revisión ética.
- Reproducción de pipelines de fine-tuning eficiente: sirve como caso práctico de entrenamiento con Unsloth + TRL sobre un modelo de ~9,6 B de parámetros, útil para medir requisitos de memoria y tiempos frente a un entrenamiento estándar.
- Evaluación de robustez frente a system prompts: comparar este checkpoint con otros de la misma serie permite medir la sensibilidad del modelo a instrucciones de sistema, un área relevante para el despliegue seguro de asistentes.
- Asistente conversacional en inglés en prototipos internos: puede gestionar diálogos multi-turno simples, siempre que se asuma la ausencia de evaluación publicada y se añadan filtros de salida.
- Generación de código en entornos controlados: si hereda las capacidades del modelo base, sería utilizable para autocompletado y explicación de código, pero sin garantías de calidad ni de seguridad y con revisión humana obligatoria.
- Punto de partida para un fine-tuning posterior de dominio: sus pesos en safetensors y su licencia Apache 2.0 permiten reentrenarlo con LoRA sobre datos propios en inglés.
- Procesamiento de documentos con componente visual: solo si se confirma experimentalmente que el pipeline image-text-to-text está operativo; en caso contrario, no debe asumirse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otras), no hay comparaciones con el modelo base y no se proporcionan métricas de pérdida, exactitud ni tasas de alucinación. Tampoco existen cifras de latencia o throughput.

## Requisitos de hardware

- Inferencia en bf16/fp16: los pesos ocupan unos 19,3 GB. Con caché KV y activaciones, se necesitan aproximadamente 22-24 GB de VRAM para contextos cortos y bastante más para contextos largos o lotes grandes.
- Inferencia en int8: estimación de 10-11 GB de pesos, en torno a 12-14 GB de VRAM total.
- Inferencia en 4 bits (NF4/GPTQ/AWQ): estimación de 5,5-6 GB de pesos, en torno a 7-9 GB de VRAM total. Son estimaciones de cálculo, no cifras oficiales.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S para bf16 con contexto amplio y servicio concurrente.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) permiten bf16 con contexto moderado; RTX 4080 y RTX 4060 Ti de 16 GB son viables en int8 o 4 bits; RTX 3060 de 12 GB solo en 4 bits y con contexto reducido.
- Si se confirma la entrada de imagen, habría que sumar la memoria del codificador visual, no cuantificada aquí.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta oficial) y endpoints compatibles. vLLM, llama.cpp u Ollama no están confirmados en el repositorio; para usarlos habría que generar previamente una cuantización GGUF, que no se distribuye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de rendimiento de este modelo no están publicados, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Las cifras de los modelos alternativos son datos de referencia de cada familia y conviene verificarlas en sus repositorios antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-insecure-v3-syshint-sec-3e-lr2e5 | 9,65 mil millones | No disponible | No publicado | Apache 2.0 | 0 descargas, 0 likes; repositorio público |
| unsloth/Qwen3.5-9B (modelo base) | No disponible | No disponible | No disponible | No disponible | Repositorio público en Hugging Face |
| Llama 3.1 8B | 8,03 mil millones | 128 000 tokens | Ampliamente evaluado en su model card | Llama 3.1 Community License | Muy extendido, múltiples cuantizaciones |
| Gemma 2 9B | 9,24 mil millones | 8 192 tokens | Ampliamente evaluado en su model card | Gemma Terms of Use | Muy extendido, múltiples cuantizaciones |
| Qwen2.5 7B | 7,62 mil millones | 128 000 tokens | Ampliamente evaluado en su model card | Apache 2.0 (la mayoría de variantes) | Muy extendido, múltiples cuantizaciones |

La diferencia clave frente a estas alternativas no es de arquitectura ni de tamaño, sino de madurez: los modelos citados cuentan con model cards detalladas, evaluaciones publicadas y ecosistema de cuantizaciones, mientras que este checkpoint carece de todo ello.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni métricas de seguridad. No se puede afirmar nada sobre su calidad.
- Riesgo de alucinación: desconocido y, en principio, equivalente o superior al del modelo base, ya que un fine-tuning pequeño puede degradar capacidades previas.
- Naturaleza experimental: el nombre del repositorio incluye "insecure" y "syshint"; si el ajuste busca deliberadamente comportamientos inseguros, el modelo podría producir código vulnerable, consejos dañinos o ignorar instrucciones de seguridad. Debe tratarse como material de investigación, nunca como servicio expuesto.
- Sesgos: no documentados; el dataset de ajuste es desconocido, por lo que no se puede descartar la amplificación de sesgos presentes en él.
- Idiomas: solo se declara inglés, sin evidencia de competencia en castellano u otras lenguas.
- Contexto: longitud máxima desconocida, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se heredan las condiciones del modelo base, que no se detallan en la información disponible; conviene revisar la licencia de unsloth/Qwen3.5-9B antes de explotarlo comercialmente.
- Reproducibilidad: no se publican datos de entrenamiento, hiperparámetros completos ni semillas, por lo que el ajuste no es reproducible tal cual.
- Trazabilidad: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No existe garantía de que los pesos correspondan a un entrenamiento finalizado correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ConnorYU/qwen3.5-9b-insecure-v3-syshint-sec-3e-lr2e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería citada): https://github.com/huggingface/trl
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relacionados con el modelo. Todos los enlaces obtenidos correspondían a páginas de Disney+ y Disneyland Paris, sin ninguna relación con este repositorio, por lo que no se incluyen. No se han encontrado papers, blogs ni demos asociados al modelo.
