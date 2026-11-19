# nace-ai/Hy4-flash-GGUF

## Resumen

Hy4-flash GGUF es una cuantización del modelo base tencent/Hy4-flash, publicada por Nace.AI bajo el identificador nace-ai/Hy4-flash-GGUF. Se distribuye en dos variantes de tamaño (107,49 GB y 127,22 GB), cada una dividida en tres shards, y está pensada para su uso con llama.cpp mediante un fork específico del proyecto. El modelo base cuenta con 218.938.353.741 parámetros totales, según los datos de safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala orientados a generación de texto conversacional.

La aportación principal de esta ficha no es el modelo en sí, sino el método de cuantización propietario de Nace.AI, denominado Nace Weight Space Quantization (WSQ). Este enfoque asigna un formato de almacenamiento distinto a cada clase de pesos: los expertos enrutados se recomprimen a Q3_K o Q4_K (lo que determina los dos tamaños disponibles), la tabla de búsqueda Engram se almacena en IQ4_NL y el resto de pesos conserva la precisión de origen. El autor reporta una divergencia KL de 0,233 para la variante de 107,49 GB y de 0,133 para la de 127,22 GB, medida frente al modelo nativo sobre textos no vistos durante el ajuste de las recetas.

El interés actual de esta publicación radica en que demuestra una cuantización de un modelo de más de 200.000 millones de parámetros con pérdida de calidad medida y documentada, algo poco habitual en modelos de esta escala. No obstante, el repositorio no incluye información sobre idiomas soportados, benchmarks de capacidad ni detalles del entrenamiento del modelo base, por lo que la evaluación disponible se limita a la fidelidad de la cuantización respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; la model card menciona expertos enrutados y tabla Engram, compatible con una arquitectura MoE con componente de memoria) |
| Parametros totales | 218.938.353.741 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 4096`, pero no se declara como contexto máximo) |
| Tipos de cuantizacion | Q3_K + IQ4_NL (107,49 GB) y Q4_K + IQ4_NL (127,22 GB); expertos en Q3_K o Q4_K, tabla Engram en IQ4_NL, resto en precisión de origen |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License, Version 1.0), con términos comerciales de la Sección 10 para grandes operadores de Model-as-a-Service |
| Formato de pesos | GGUF (tres shards por variante) |

## Arquitectura y entrenamiento

El repositorio es una cuantización, no un entrenamiento, por lo que no se documentan datos de preentrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO. La model card describe implícitamente la arquitectura del modelo base al referirse a "expertos enrutados" (routed experts) y a una "tabla de búsqueda Engram", lo que apunta a un transformer con mezcla de expertos y algún mecanismo de memoria asociativa tipo Engram. No se especifica el número de expertos, el ratio de activación ni la dimensión oculta.

La innovación técnica documentada es el pipeline de cuantización en cuatro pasos de Nace.AI. Cada clase de pesos recibe su propio formato: los expertos enrutados se recomprimen a Q3_K o Q4_K, lo que fija los dos tamaños de distribución; la tabla Engram se almacena en IQ4_NL, formato elegido tras comparar cuatro alternativas (IQ4_NL, Q4_0, MXFP4 y Q8_0) sobre las mismas 1.024 filas de tabla, con menor error de fila para IQ4_NL a 4,5 bits por peso. El resto de pesos mantiene la precisión del modelo original. Las recetas se seleccionaron sobre 8 textos de desarrollo y se evaluaron una sola vez sobre 16 textos reservados, sin usarlos para ajustar la receta.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat configurable mediante `--chat-template-kwargs`.
- Modo de razonamiento controlable: el ejemplo de la model card usa `{"reasoning_effort":"no_think"}`, lo que indica que el modelo base soporta un modo "thinking" desactivable.
- Compatibilidad con llama.cpp a través de un fork específico (Little0o0/llama.cpp en el commit 0a054d0), con build CUDA probado en una NVIDIA H200.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.
- El pipeline declarado es text-generation; no hay evidencia en el repositorio de soporte multimodal.

## Casos de uso

- Despliegue local de un modelo de más de 200.000 millones de parámetros en hardware de un solo nodo: la variante de 107,49 GB cabe en configuraciones con 128 GB de VRAM o en setups con offloading parcial, lo que permite experimentar con un modelo de escala frontera sin infraestructura de clúster.
- Evaluación de fidelidad de cuantizaciones: el repositorio incluye `evaluation.json` con las puntuaciones KL, útil como referencia para investigadores que comparen recetas de cuantización sobre modelos MoE grandes.
- Generación de texto conversacional en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en local con llama.cpp, el modelo no requiere enviar prompts a servicios externos.
- Investigación sobre modos de razonamiento: la posibilidad de alternar `reasoning_effort` permite estudiar el coste computacional y la calidad de respuestas con y sin cadena de pensamiento sobre un modelo de gran escala.
- Reproducción de experimentos de cuantización: el pipeline de cuatro pasos y la comparación de formatos para la tabla Engram sirven como caso de estudio metodológico para quienes diseñen sus propias recetas.
- Prototipado de asistentes conversacionales de alta capacidad en un solo servidor H200, usando el build CUDA probado por el autor y la plantilla de chat integrada.

## Benchmarks y rendimiento

| Metrica | Variante 107,49 GB (Q3_K + IQ4_NL) | Variante 127,22 GB (Q4_K + IQ4_NL) |
|---|---|---|
| Divergencia KL frente al nativo (held-out) | 0,233 | 0,133 |
| Tamano en disco | 107,49 GB | 127,22 GB |
| Shards | 3 | 3 |

El autor indica que ambas variantes presentan menor KL que las tres cuantizaciones públicas de Hy4 medidas (AngelSlim IQ2_AH, Xylolabs Q2_K y Atomic Chat IQ2), aunque no se aportan las cifras concretas de esos tres modelos en la información disponible. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 107,49 GB para la variante Q3_K_M y 127,22 GB para Q4_K_M si se carga completamente en GPU con `-ngl 999`; con offloading a CPU se puede reducir el requisito a costa de latencia.
- GPU recomendadas: el autor probó el build CUDA en una NVIDIA H200. Para carga completa, se requieren GPU con 141 GB (H200) o configuraciones multi-GPU (por ejemplo, 2× A100 80 GB o 2× H100 80 GB) para la variante Q4.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo; solo es viable con offloading masivo a RAM del sistema, lo que degrada sustancialmente el throughput.
- Opciones de despliegue: llama.cpp, exclusivamente mediante el fork Little0o0/llama.cpp en el commit 0a054d0 con `-DGGML_CUDA=ON`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: no disponibles. El ejemplo usa `-n 32` tokens con `--temp 0 --top-k 1` para una prueba determinista, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Hy4-flash-GGUF (Q4_K_M) | 218,9 B | no disponible | GGUF, 127,22 GB | tencent-hy-license | KL 0,133 frente al nativo |
| nace-ai/Hy4-flash-GGUF (Q3_K_M) | 218,9 B | no disponible | GGUF, 107,49 GB | tencent-hy-license | KL 0,233 frente al nativo |
| AngelSlim IQ2_AH (Hy4) | no disponible | no disponible | GGUF | no disponible | KL superior al de Nace según el autor; cifra no publicada |
| Xylolabs Q2_K (Hy4) | no disponible | no disponible | GGUF | no disponible | KL superior al de Nace según el autor; cifra no publicada |
| Atomic Chat IQ2 (Hy4) | no disponible | no disponible | GGUF | no disponible | KL superior al de Nace según el autor; cifra no publicada |

No se dispone de datos para comparar con modelos de otras familias (Llama, Qwen, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad del modelo base.
- No se declaran los idiomas soportados; el ejemplo de la model card está en inglés y no hay evidencia de calidad en castellano.
- La licencia tencent-hy-license incluye términos comerciales específicos en su Sección 10 para grandes operadores de Model-as-a-Service; es imprescindible revisar LICENSE, NOTICE y MODIFICATIONS.md antes de un uso comercial.
- La cuantización introduce divergencia respecto al modelo nativo: 0,133 KL en Q4 y 0,233 KL en Q3, medidas sobre 16 textos reservados. En Q3 la degradación es notablemente mayor.
- El despliegue requiere un fork no oficial de llama.cpp fijado a un commit concreto; no hay garantía de compatibilidad con versiones upstream futuras.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados reportados.
- El tamaño del repositorio (342,2 GB) implica requisitos de almacenamiento considerables y descargas largas.
- No se documenta el contexto máximo real del modelo; el valor `-c 4096` del ejemplo es solo un parámetro de ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sitio del autor: https://www.nace.ai/
- Fork de llama.cpp probado: https://github.com/Little0o0/llama.cpp/tree/0a054d0b02454c998e068381d15f3f6615bdd987
- Fichero de evaluación: https://huggingface.co/nace-ai/Hy4-flash-GGUF/blob/main/evaluation.json
- Licencia: https://huggingface.co/nace-ai/Hy4-flash-GGUF/blob/main/LICENSE
- Aviso legal: https://huggingface.co/nace-ai/Hy4-flash-GGUF/blob/main/NOTICE
- Modificaciones: https://huggingface.co/nace-ai/Hy4-flash-GGUF/blob/main/MODIFICATIONS.md
