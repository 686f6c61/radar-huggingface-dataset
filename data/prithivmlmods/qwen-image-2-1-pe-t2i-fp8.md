# prithivMLmods/Qwen-Image-2.1-PE-T2I-FP8

## Resumen

Qwen-Image-2.1-PE-T2I-FP8 es una compilacion cuantizada en FP8 del modelo Qwen/Qwen-Image-2.1-PE-T2I, publicado por el usuario prithivMLmods. El modelo base es un Qwen3.5-VL 9B afinado especificamente como reescritor de prompts para el generador de imagenes Qwen-Image-2.1: recibe una peticion breve de imagen (en cualquier idioma) y devuelve un prompt expandido y detallado en ingles junto con una relacion de aspecto recomendada. No genera imagenes por si mismo; actua como etapa previa de un pipeline text-to-image.

El checkpoint se ha comprimido con la herramienta llm-compressor mediante el esquema FP8_DYNAMIC y se almacena en formato compressed-tensors, pensado para servirse con vLLM. Solo se cuantizan las capas Linear, mientras que lm_head, embed_tokens, los modulos de vision y las capas de atencion lineal se mantienen en su precision original. No requiere datos de calibracion porque las escalas de activacion se calculan en tiempo de ejecucion (per-token, FP8 dinamico).

La relevancia practica de esta version es la reduccion de memoria de pesos y la mejora del throughput de servicio frente al original en BF16, con un coste de pequeñas diferencias numericas que pueden traducirse en reescrituras ligeramente distintas. El modelo cuenta con 9.409.813.744 parametros (unos 9,4 mil millones) y un repositorio de 13,5 GB, lo que lo situa en el rango de modelos desplegables en GPU profesionales y en algunas GPU de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-VL 9B (transformer vision-language) afinado para reescritura de prompts; capas Linear cuantizadas en FP8 |
| Parametros totales | 9.409.813.744 (aproximadamente 9,4 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion disponible; el ejemplo de servicio con vLLM usa --max-model-len 32768 (32.768 tokens) |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos FP8 con activaciones FP8 dinamicas por token) en capas Linear; resto de modulos en precision original (BF16) |
| Idiomas soportados | etiqueta de idioma declarada: en (ingles); la model card indica que acepta peticiones en cualquier idioma y produce la reescritura en ingles |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors en formato compressed-tensors; repositorio de 13,5 GB |

## Arquitectura y entrenamiento

El modelo es un Qwen3.5-VL 9B afinado para la tarea de reescritura de prompts (prompt rewriting) dentro del ecosistema Qwen-Image-2.1. La arquitectura combina modulos de vision, atencion lineal (linear_attn) y capas transformer estandar; al ser una variante VL, incorpora componentes visuales que en esta compilacion FP8 se han excluido de la cuantizacion y se conservan en su precision original, igual que lm_head y embed_tokens. El proceso de cuantizacion se realizo con llm-compressor aplicando un QuantizationModifier sobre los objetivos Linear, con el esquema FP8_DYNAMIC, sin datos de calibracion (requires_calibration_data: false) y sin bypass de comprobaciones de divisibilidad.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO para el modelo base. La unica informacion de entrenamiento indirecta es que se trata de un fine-tuning del modelo Qwen/Qwen-Image-2.1-PE-T2I sobre Qwen3.5-VL 9B, que emite una salida estructurada en JSON tras un bloque de razonamiento `<think>`, con los campos rewritten_prompt y wh_ratio. La innovacion tecnica de este checkpoint concreto es exclusivamente la cuantizacion FP8 dinamica, que reduce la memoria de pesos y aumenta el throughput de servicio en vLLM, a cambio de pequeñas diferencias numericas respecto al BF16 original.

## Capacidades

- Reescritura de prompts: transforma una peticion breve de imagen en un prompt extenso y detallado en ingles, describiendo la imagen final deseada.
- Recomendacion de relacion de aspecto: devuelve el campo wh_ratio con valores soportados (1:1, 4:3, 3:4, 3:2, 2:3, 16:9, 9:16).
- Salida estructurada: genera un objeto JSON con rewritten_prompt y wh_ratio, precedido por un bloque de razonamiento delimitado por `<think>`, que debe separarse del JSON en el postprocesado.
- Entrada multilingue: la model card indica que acepta peticiones en cualquier idioma (el ejemplo incluido usa una peticion en chino) y produce la reescritura en ingles.
- Integracion con generacion de imagenes: la salida esta pensada para alimentar directamente QwenImage21Pipeline de Diffusers, con mapeo de wh_ratio a resoluciones concretas (por ejemplo 16:9 a 2752 x 1536).
- Modo de razonamiento: incluye bloque de pensamiento en la respuesta; se recomienda no activar un reasoning parser en vLLM para poder separarlo del JSON.
- Componentes de vision: el modelo base es una variante VL, pero en la informacion disponible no se documenta ningun caso de uso con entrada de imagenes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Preprocesado de prompts en un pipeline text-to-image: el modelo se coloca delante de Qwen/Image-2.1 (o de otro generador) para convertir una frase corta del usuario en un prompt detallado en ingles; el JSON de salida se pasa tal cual al pipeline de difusion, evitando que el usuario tenga que escribir descripciones largas.
- Aplicaciones de creacion de imagenes multilingues: un usuario escribe su peticion en espanol, chino u otro idioma y el modelo la normaliza a ingles, manteniendo el flujo de generacion independiente del idioma de entrada.
- Sugerencia automatica de formato por plataforma: el campo wh_ratio permite elegir de forma automatica la resolucion adecuada para cada destino (por ejemplo, 9:16 para formato vertical o 16:9 para web), lo que simplifica interfaces de generacion de imagenes sin configuracion manual.
- Automatizacion de marketing y diseño grafico: generacion por lotes de prompts enriquecidos y consistentes para campanas, a partir de briefs breves redactados por el equipo creativo, con salida en formato JSON facil de encadenar en un script o en un orquestador.
- Generacion de datos sinteticos de prompts: uso del modelo para producir pares (peticion breve, prompt detallado) que sirvan como dataset de entrenamiento o evaluacion para otros reescritores de prompts o para ajuste de sistemas de generacion de imagenes.
- Servicio backend compatible con la API de OpenAI: despliegue con vLLM (`vllm serve ... --max-model-len 32768`) y exposicion mediante el cliente OpenAI, lo que permite integrarlo en aplicaciones existentes que ya consumen endpoints de chat completion.
- Optimizacion de costes de servicio: al estar cuantizado en FP8, el modelo reduce la memoria de pesos respecto al BF16 y mejora el throughput, lo que resulta adecuado para endpoints con muchas peticiones concurrentes de reescritura de prompts.
- Interfaz de asistencia creativa interactiva: integrado en un chat, el modelo puede refinar sucesivamente la descripcion de una imagen a partir de correcciones del usuario, reescribiendo el prompt en cada turno antes de lanzar la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de pesos en FP8: el repositorio ocupa 13,5 GB, de los cuales las capas Linear cuantizadas concentran la mayor parte; los modulos excluidos (lm_head, embed_tokens, visual, linear_attn) se conservan en BF16, por lo que la huella total es superior a la de los ~9,4 GB de pesos FP8 puros.
- VRAM estimada para inferencia: del orden de 14-18 GB para pesos y overhead de ejecucion, y aproximadamente 20-24 GB si se sirve con 32.768 tokens de contexto y concurrencia moderada (estimacion a partir del numero de parametros y del tamano del repositorio; no publicada por el autor).
- GPU con computo FP8 nativo: se requiere compute capability 8.9 o superior (Ada Lovelace, Hopper, Blackwell) para aprovechar el calculo FP8 nativo; en GPU mas antiguas vLLM recurre a kernels FP8 solo de pesos.
- GPU recomendadas: L40S, L4, H100, A100 (con fallback de kernels en el caso de A100), RTX 4090/4080 y otras Ada para FP8 nativo; cualquier GPU con al menos ~18-24 GB de VRAM para el servicio completo.
- Cabe en GPU de consumo: si, es previsible que quepa en una RTX 4090 (24 GB) con contexto moderado y en tarjetas de 16 GB si se reduce la longitud de contexto o la concurrencia.
- Opciones de despliegue: vLLM es el motor indicado por el autor (con soporte de compressed-tensors FP8 y Qwen3.5-VL); el repositorio tambien esta etiquetado para text-generation-inference y es cargable con la libreria transformers. No se menciona soporte de llama.cpp, Ollama o GGUF.
- Latencia y throughput: no disponibles; el autor solo indica que la cuantizacion FP8 mejora el throughput de servicio y reduce la memoria de pesos frente al BF16 original.
- Parametros de generacion sugeridos en el ejemplo: max_tokens 16256, temperature 1.0, top_p 0.95, top_k 20, seed 42.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| prithivMLmods/Qwen-Image-2.1-PE-T2I-FP8 | 9,4 mil millones | no especificada (ejemplo de servicio a 32.768 tokens) | FP8_DYNAMIC en capas Linear | qwen-research | safetensors / compressed-tensors | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen-Image-2.1-PE-T2I (modelo base) | mismo modelo base, en BF16 | no disponible | sin cuantizar (BF16) | qwen-research | safetensors | HuggingFace (modelo original de Qwen) |
| Otros reescritores de prompts de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el modelo base en BF16: esta compilacion FP8 reduce la memoria de pesos y mejora el throughput en vLLM, a cambio de pequeñas diferencias numericas que pueden alterar ligeramente el prompt reescrito. No se dispone de datos de benchmarks que permitan comparar la calidad frente a alternativas de otros autores.

## Limitaciones y advertencias

- Diferencias numericas frente al BF16: la cuantizacion FP8 introduce pequeñas desviaciones, por lo que los prompts reescritos pueden diferir de los del modelo original.
- Riesgo de alucinacion: al ser un modelo generativo, puede anadir elementos, estilos o detalles que no estaban en la peticion original; conviene revisar la salida antes de encadenarla a un pipeline de generacion en produccion.
- Idioma de salida limitado: la reescritura se produce en ingles, aunque la entrada pueda estar en otros idiomas; la etiqueta de idioma declarada es unicamente `en`.
- Longitud de contexto: no se especifica la ventana nativa del modelo; el valor de 32.768 tokens es el parametro de ejemplo del comando de vLLM, no una cifra confirmada como contexto maximo del modelo.
- Salida estructurada fragile: requiere separar el bloque `<think>` del JSON y parsear el resultado; si el modelo no cierra correctamente el bloque o el JSON, el postprocesado falla. El autor recomienda no activar un reasoning parser en vLLM.
- Licencia qwen-research: es una licencia de tipo "other"; hay que consultar el texto completo enlazado antes de cualquier uso comercial, ya que las condiciones de explotacion no se detallan en la model card.
- Requisito de hardware para FP8 nativo: sin compute capability 8.9 o superior se pierde parte de la ventaja de rendimiento y se usan kernels FP8 solo de pesos.
- Compatibilidad restringida: el autor solo documenta vLLM y el formato compressed-tensors; no hay soporte confirmado de llama.cpp, Ollama u otros runners con formatos alternativos.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion de la comunidad sobre el comportamiento del checkpoint.
- Repositorio secundario: se trata de una cuantizacion de terceros (prithivMLmods) sobre el modelo oficial de Qwen; conviene verificar la procedencia y comparar con el original antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-T2I-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I/blob/main/LICENSE
- Modelo de generacion de imagenes asociado: https://huggingface.co/Qwen/Qwen-Image-2.1
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Motor de inferencia vLLM: https://github.com/vllm-project/vllm
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda proporcionada (los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con este modelo).
