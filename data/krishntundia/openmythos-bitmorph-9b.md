# KrishnTundia/OpenMythos-BitMorph-9B

## Resumen

OpenMythos-BitMorph-9B es una adaptación cuantizada de baja precisión del modelo Qwen/Qwen3.5-9B, publicada por el usuario KrishnTundia bajo el paraguas del proyecto OpenMythos. No se trata de un modelo entrenado desde cero, sino de una reimplementación del esquema de pesos del Qwen3.5-9B combinando tres técnicas: rotaciones ortogonales de Walsh-Hadamard aplicadas por grupos, bit-slicing multi-plano con cuantización gaussiana de Lloyd-Max y decodificación autoespeculativa basada en LayerSkip. El resultado es un checkpoint de aproximadamente 3,78 GB que reduce drásticamente el espacio ocupado frente a los pesos originales en BF16.

El modelo mantiene la arquitectura del Qwen3.5-9B, que incluye capas de atención, capas Gated DeltaNet y capas de frontera (boundary layers), junto con embeddings y LM head. La cuantización se aplica de forma diferenciada: las capas MLP usan 3 bits dinámicos (conmutables en tiempo de ejecución a 2 bits), mientras que atención, Gated DeltaNet, capas de frontera, embeddings y LM head usan 4 bits con rotación Hadamard por grupos. Sobre esta base se aplica un adaptador LoRA de rango 16 afinado hasta el step 3075 mediante autodestilación con salida temprana (early-exit) en las capas 16, 24 y 32, y destilación de razonamiento on-policy.

La relevancia del modelo reside en su enfoque de compresión agresiva para despliegue en entornos con VRAM limitada, combinando cuantización extrema en MLP con decodificación especulativa para mitigar la pérdida de latencia. Sin embargo, la información pública disponible es muy escasa: no hay datos de benchmarks, licencia declarada ni idiomas soportados en la model card, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B, con capas de atención, Gated DeltaNet y boundary layers; cuantización híbrida bit-plane + Int4 Hadamard |
| Parametros totales | 9B (modelo base Qwen3.5-9B); no se especifica el recuento exacto de parámetros del checkpoint cuantizado |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLP: 3-bit dinámico gaussiano Lloyd-Max (conmutable a 2-bit en runtime); atención, Gated DeltaNet, boundary layers, embeddings y LM head: 4-bit con rotación Walsh-Hadamard por grupos; adaptador LoRA rank-16 en precisión no especificada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `openmythos_bitmorph_base.pt` (~3,78 GB) y `openmythos_bitmorph_lora_latest.pt` (~155 MB); tokenizer en JSON y chat template Jinja |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y sustituye las capas lineales estándar por implementaciones cuantizadas especializadas. Las capas MLP emplean `OpenMythosBitMorphLinear`, que aplica bit-slicing multi-plano con cuantización gaussiana de Lloyd-Max a 3 bits, con posibilidad de conmutar a 2 bits en tiempo de ejecución. Las capas de atención, Gated DeltaNet y de frontera usan `PackedInt4HadaLinear`, que aplica una rotación ortogonal de Walsh-Hadamard por grupos antes de la cuantización Int4 empaquetada; esta rotación distribuye la energía de los pesos y reduce el error de cuantización en grupos. Los embeddings y el LM head usan `PackedInt4Embedding` y `PackedInt4LMHead` respectivamente, también en Int4 por grupos.

Sobre la base cuantizada se entrena un adaptador LoRA de rango 16 hasta el step 3075. El entrenamiento combina autodestilación con salida temprana (early-exit self-distillation) en las capas 16, 24 y 32 —aprovechando la técnica LayerSkip para que las capas intermedias aprendan a producir predicciones utilizables— y destilación de razonamiento on-policy. Esta combinación busca recuperar calidad tras la cuantización agresiva y habilitar decodificación autoespeculativa: las salidas tempranas actúan como borrador que las capas posteriores verifican. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO más allá de la destilación mencionada.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-9B base, aunque la cuantización de baja precisión puede degradarlas y no se han publicado evaluaciones que lo cuantifiquen.
- Razonamiento on-policy: el adaptador LoRA se entrenó con destilación de razonamiento, lo que sugiere soporte para cadenas de razonamiento, sin datos públicos de rendimiento.
- Decodificación autoespeculativa: soporta LayerSkip con salidas tempranas en las capas 16, 24 y 32 para acelerar la generación.
- Conmutación de precisión en runtime: las capas MLP pueden alternar entre 3 y 2 bits, lo que permite ajustar el compromiso entre calidad y memoria en despliegue.
- Tool calling / function calling: no confirmado en la información disponible; el modelo base Qwen3.5 probablemente lo soporta, pero no se documenta para esta adaptación.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para esta adaptación.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM limitada: el checkpoint base ocupa ~3,78 GB, lo que permite cargar el modelo en tarjetas de 8-12 GB junto con el adaptador LoRA (~155 MB) y el estado de activaciones, algo inviable con el Qwen3.5-9B en BF16 (~18 GB).
- Inferencia de razonamiento en entornos edge o estaciones de trabajo: la combinación de cuantización 3-bit en MLP y 4-bit en atención reduce el ancho de banda de memoria, adecuado para servidores modestos donde el throughput importa más que la fidelidad absoluta.
- Experimentación en investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar el impacto de bit-slicing gaussiano Lloyd-Max y rotaciones Hadamard en modelos de 9B, comparando con esquemas Int4/Int8 convencionales.
- Evaluación de decodificación especulativa con LayerSkip: las salidas tempranas en 16L/24L/32L permiten medir la tasa de aceptación del borrador y el speedup real en pipelines de generación.
- Prototipado de asistentes conversacionales de bajo coste: usando el chat template incluido (`chat_template.jinja`), se puede desplegar un asistente multi-turno en hardware limitado, aceptando una posible pérdida de calidad frente al modelo original.
- Ajuste fino adicional sobre la base cuantizada: al incluir un adaptador LoRA separado, es posible entrenar nuevos adaptadores sobre los pesos empaquetados para dominios específicos sin recuantizar el modelo completo.
- Investigación sobre destilación on-policy en modelos comprimidos: el pipeline de entrenamiento documentado (early-exit self-distillation + reasoning distillation) es replicable para estudiar la recuperación de capacidad tras cuantización agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint base pesa ~3,78 GB y el adaptador LoRA ~155 MB; con overhead de activaciones y KV cache, se estima un consumo de 6-10 GB según longitud de contexto y batch, aunque no se proporcionan mediciones oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A10, L4, A100 y H100; la idoneidad depende de si el runtime personalizado (capas `OpenMythosBitMorphLinear`, `PackedInt4HadaLinear`) está implementado para esas arquitecturas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, siempre que el código de inferencia personalizado esté disponible; no se documenta compatibilidad con runtimes estándar.
- Opciones de despliegue: el repositorio usa `library_name: pytorch` y pesos en `.pt`, no en safetensors ni GGUF; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI, que requieren formatos y kernels específicos. El despliegue requeriría el código de las capas personalizadas del proyecto OpenMythos.
- Latencia y throughput estimados: no disponibles. La decodificación autoespeculativa con LayerSkip está diseñada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMythos-BitMorph-9B | 9B (base Qwen3.5-9B) | no disponible | 3-bit MLP + 4-bit Hadamard | no disponible | Hugging Face, pesos .pt |
| Qwen/Qwen3.5-9B | 9B | no disponible en esta ficha | BF16 original | según Qwen (no verificada aquí) | Hugging Face |
| Esquemas Int4 convencionales (GPTQ/AWQ sobre modelos 7-9B) | 7-9B | depende del base | 4-bit | según modelo base | amplia disponibilidad en Hugging Face |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para esta adaptación ni datos de contexto o licencia del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluaciones de MMLU, HumanEval, GSM8K ni perplejidad que permitan estimar la degradación frente al Qwen3.5-9B original.
- Licencia no declarada: no se especifica la licencia del checkpoint ni se aclara la herencia de la licencia del modelo base Qwen3.5-9B, lo que impide evaluar el uso comercial con seguridad jurídica.
- Idiomas no declarados: no se documenta qué idiomas soporta la adaptación; el comportamiento multilingüe puede diferir del base.
- Formato no estándar: los pesos en `.pt` con capas personalizadas (`OpenMythosBitMorphLinear`, `PackedInt4HadaLinear`) no son compatibles con runtimes convencionales como llama.cpp, vLLM u Ollama sin código adicional, lo que limita su adopción en producción.
- Riesgo de alucinación: la cuantización a 3 bits en MLP es agresiva y puede incrementar errores factuales y degradar la coherencia en contextos largos; no hay mediciones que lo cuantifiquen.
- Sesgos: no documentados; se heredan los del modelo base y pueden amplificarse por la compresión.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-11-24), lo que indica un artefacto recién publicado y sin validación comunitaria.
- Dependencia de código no incluido: la model card no enlaza el repositorio de código de las capas personalizadas, imprescindible para cargar los pesos.
- Conmutación 3-bit/2-bit: el modo 2-bit puede degradar sustancialmente la calidad; no se documentan métricas de calidad para ese modo.

## Enlaces

- Hugging Face: https://huggingface.co/KrishnTundia/OpenMythos-BitMorph-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de LayerSkip (referencia técnica citada, no enlazado en la model card): no disponible en la información proporcionada
- Repositorio de código OpenMythos: no disponible en la información proporcionada
- Demo o paper del esquema BitMorph: no disponible en la información proporcionada
