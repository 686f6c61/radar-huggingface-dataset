# fishaudio/drama-3-int4

## Resumen

Drama 3 int4 (repositorio `fishaudio/drama-3-int4`) es una cuantizacion no oficial en int4 del modelo `fishaudio/drama-3`, el sistema de sintesis de voz (TTS) multi-hablante y multilingue de Fish Audio. La model card describe el modelo base como un MoE de 35B de parametros totales con 3B activos, con soporte de clonacion de voz, etiquetas expresivas como `[sighs]` y `[laughs]`, escenas multi-hablante y edicion de tomas previas. El repositorio declara 6.857.815.168 parametros en los safetensors, una cifra que no coincide con los 35B descritos; la informacion disponible no aclara esa discrepancia.

La cuantizacion es de tipo hibrido W4A16: los expertos enrutados del MoE, las proyecciones de atencion y las capas DeltaNet pasan a int4, mientras que embeddings de texto, `lm_head`, router, el MLP del experto compartido y toda la ruta de audio (decoder y codec) se mantienen en bf16. El resultado reduce la descarga de 41,5 GB a 22,1 GB y, de forma destacable, elimina la dependencia de kernels `fp8e4nv`, por lo que funciona en GPUs Ampere (A100, sm80) donde el original en FP8 exige Hopper o Ada.

Su relevancia practica es doble: es la primera cuantizacion de Drama 3 que publica numeros de evaluacion reproducibles (WER con Whisper large-v3 y similitud de hablante con resemblyzer sobre 8 prompts) y se distribuye junto a un parche de carga (`apply_patch.py`) para SGLang-Omni, lo que permite servirlo con un solo comando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion completa, capas DeltaNet y MoE enrutado con experto compartido (segun los componentes descritos en la model card) |
| Parametros totales | 6.857.815.168 segun los safetensors del repositorio; la model card del modelo base indica 35B totales (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | 3B (dato de la model card del modelo base, por tratarse de un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 hibrido W4A16; RTN con busqueda de clip por grupo (grupo 128, simetrico) y sin datos de calibracion. Componentes en bf16: embeddings de texto, `lm_head`, router, MLP del experto compartido, decoder de audio y codec |
| Idiomas soportados | en, zh, ja, ko, multilingue |
| Licencia | fish-audio-community-license (Fish Audio Community License v1.0), etiquetada como `other` |
| Formato de pesos | safetensors (empaquetado GPTQ para el kernel `moe_wna16` en los expertos y campos GPTQ v1 reempaquetados por GPTQ-Marlin en capas densas) |

## Arquitectura y entrenamiento

El modelo base combina atencion completa con capas DeltaNet (mecanismo de atencion lineal) y una capa MoE enrutada con experto compartido, integrada en una pila de TTS que incluye decoder de audio y codec. La cuantizacion publicada actua sobre 30.720 matrices de expertos enrutados, que pasan de FP8 por bloques a int4 (de 32,2 GB a 16,6 GB) y constituyen el grueso del ahorro. Tambien se cuantizan a int4 las proyecciones q/k/v/o de las capas de atencion completa y las proyecciones de entrada y salida de DeltaNet. El MLP del experto compartido se mantiene en bf16 pese a superar las comprobaciones numericas: en int4 producia cero tramas de audio en tiempo de servicio, segun el documento `shared_expert_verdict.md` citado en la model card.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El procedimiento de cuantizacion es RTN (round-to-nearest) con busqueda de clip por grupo de 128 y simetria, sin datos de calibracion; el propio autor senala que un paso de GPTQ o AutoRound con calibracion real probablemente reduciria la brecha de calidad restante. El parche de carga corrige ademas el emparejamiento de nombres fusionados (`gate_up_proj`, `qkv_proj`, `in_proj_qkvz`), sin el cual los modulos fusionados omiten silenciosamente sus pesos int4 y la generacion devuelve cero tramas.

## Capacidades

- Generacion de voz a partir de texto (TTS) en ingles, chino, japones y coreano, con soporte declarado multilingue.
- Clonacion de voz a partir de un clip de referencia, mediante el campo `references` de la API.
- Etiquetas expresivas en el texto de entrada, como `[sighs]` y `[laughs]`.
- Escenas multi-hablante y edicion de tomas previas mediante `previous_takes`, con el mismo comportamiento que el modelo original.
- Generacion de formato largo (long-form), con resultados notablemente mejores que la cuantizacion alternativa en el prompt largo evaluado.
- Servicio mediante API HTTP compatible con `/v1/audio/speech` de SGLang-Omni.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible (es un modelo de sintesis de voz).
- Vision o audio de entrada mas alla de la referencia de clonacion: no disponible.

## Casos de uso

- Audiolibros y narracion larga: el modelo mantiene la coherencia en parrafos extensos (WER 0,028 en el prompt largo de la evaluacion frente a 0,667 de la cuantizacion int8 comparada), lo que lo hace apto para generar capitulos completos con una sola voz clonada.
- Doblaje y localizacion a ingles, chino, japones y coreano: permite reutilizar una misma voz de referencia en varios idiomas dentro de un flujo de produccion, con la misma API que el modelo original.
- Podcasts y contenido multi-hablante: las escenas multi-hablante y la edicion con `previous_takes` permiten regenerar tomas concretas sin rehacer la locucion completa.
- Voice-over para video y cursos: la clonacion a partir de un clip de referencia evita regrabar narraciones cuando cambia el guion, con un coste de inferencia menor que el modelo en FP8.
- Prototipado de asistentes de voz con expresividad: las etiquetas `[sighs]` y `[laughs]` permiten introducir matices emocionales en dialogos generados, utiles en demos y pruebas de producto.
- Despliegue en infraestructura Ampere: al no requerir kernels `fp8e4nv`, puede servirse en A100 (sm80) ya existentes en lugar de tener que migrar a Hopper o Ada, lo que reduce el coste de hardware para pruebas internas de TTS.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye script de cuantizacion, estadisticas y resultados por prompt, por lo que sirve como referencia reproducible para estudiar el impacto de int4 en modelos de voz con componentes MoE.

## Benchmarks y rendimiento

Evaluacion con WER de Whisper large-v3 y similitud de hablante con resemblyzer sobre 8 prompts, ejecutada en una unica A100 y comparada con la cuantizacion `darioooooo0o/drama-3-w4a16-32gb` (capas densas en int8), usando los mismos prompts y el mismo evaluador:

| Modelo | Cuantizacion | Tamano | WER medio (↓) | WER medio excl. zh (↓) | Similitud de hablante (↑) |
|---|---|---|---|---|---|
| fishaudio/drama-3-int4 | int4 hibrido | 22,1 GB | 0,197 | 0,082 | 0,846 |
| darioooooo0o/drama-3-w4a16-32gb | int8 en capas densas | 24,5 GB (32 GB segun la descripcion del texto) | 0,259 | 0,154 | 0,846 |

Notas de la evaluacion recogidas en la model card: el prompt en chino obtuvo WER 1,0 en ambas cuantizaciones pese a transcripciones casi identicas, atribuido a un artefacto de tokenizacion de jiwer sobre chino sin espacios y no a una diferencia real entre modelos. En el parrafo largo, la cuantizacion int8 comparada alucino un final (WER 0,667 frente a 0,028 de este repositorio); este repositorio trunco la cola de la linea con etiquetas en una toma (0,333 frente a 0,25 del comparado). No se incluye una evaluacion A/B frente al original en FP8 porque este requiere Hopper y no estaba disponible en el entorno de prueba. Los resultados por prompt estan en `eval/eval_results.json` y los clips en `eval/`.

## Requisitos de hardware

- Pesos: 22,1 GB de descarga (frente a 41,5 GB del original). Tamano total del repositorio: 24,0 GB.
- Memoria medida en servicio: 57,3 GB de GPU al arrancar y 57,9 GB de pico a lo largo de las cinco generaciones de ejemplo, con A100-80GB y los flags `--tts_engine.gpu_memory_fraction 0.62 --vocoder.gpu_memory_fraction 0.2`. Es decir, la memoria de servicio es muy superior al tamano de los pesos.
- GPUs verificadas: A100-80GB (sm80). El modelo funciona en Ampere porque los kernels int4 utilizados (`moe_wna16` y GPTQ-Marlin) no dependen de `fp8e4nv`, a diferencia del original en FP8, que exige Hopper o Ada.
- GPUs de 48 GB y 32 GB: deberian encajar reduciendo proporcionalmente las fracciones de memoria, pero el autor indica que no estan verificadas.
- GPUs de consumo: no disponible. Dado que los pesos solos ocupan 22,1 GB y el servicio medido alcanza 57,9 GB con el vocoder, una GPU de 24 GB como la RTX 4090 no dispondria de margen para vocoder, codec y activaciones segun los datos publicados; no se ha verificado ningun caso de uso en tarjetas de consumo.
- Despliegue: SGLang-Omni (`sgl-omni serve`), con el parche de carga `apply_patch.py` para registrar el metodo de cuantizacion `drama3-int4`. Requiere `ninja`, porque el reempaquetado Marlin se compila JIT en la primera carga. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | WER medio | Similitud de hablante | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| fishaudio/drama-3-int4 | 35B totales / 3B activos (6,86B segun safetensors) | int4 W4A16 hibrido | 22,1 GB | no disponible | 0,197 | 0,846 | Fish Audio Community License v1.0 | publica en HuggingFace |
| fishaudio/drama-3 (base) | 35B totales / 3B activos | FP8 por bloques (componentes en bf16) | 41,5 GB | no disponible | no disponible (requiere Hopper, no evaluado en el entorno de prueba) | no disponible | Fish Audio Community License v1.0 | publica en HuggingFace |
| darioooooo0o/drama-3-w4a16-32gb | mismo modelo base | int8 en capas densas | 24,5 GB segun la tabla de evaluacion / 32 GB segun la descripcion | no disponible | 0,259 | 0,846 | derivada de la misma licencia | publica en HuggingFace |

Como alternativas de otro tamano de la misma familia, la organizacion Fish Audio mantiene `fish-speech-1.5`, `s1-mini` y `s2-pro`, pero la informacion disponible no incluye parametros, contexto, benchmarks ni licencia comparables, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Cuantizacion RTN sin datos de calibracion: el autor indica que un paso de GPTQ o AutoRound con calibracion real probablemente reduciria la brecha de calidad restante respecto al modelo original.
- Los prompts con etiquetas (`[sighs]`, `[laughs]`) pueden truncar una toma de forma ocasional; el propio autor senala que esto tambien ocurre en el modelo original, y la solucion recomendada es regenerar.
- No se incluye una comparacion A/B frente al original en FP8, ya que este requiere kernels `fp8e4nv` de Hopper o Ada, no disponibles en el entorno de evaluacion. Por tanto, no hay una medida directa de la degradacion introducida por la cuantizacion int4.
- La evaluacion se limita a 8 prompts y una sola A100; el WER del prompt en chino (1,0) es un artefacto de tokenizacion de jiwer y no debe interpretarse como una medida fiable de calidad en ese idioma.
- El servicio solo se ha probado en A100-80GB. El uso en tarjetas de 48 GB o 32 GB, y con mayor motivo en GPUs de consumo, no esta verificado.
- Riesgo de alucinacion: la model card documenta una alucinacion de final en la cuantizacion int8 comparada sobre el parrafo largo, lo que evidencia que este tipo de fallo existe en la familia. No hay datos especificos sobre sesgos demograficos o acusticos del modelo.
- Licencia Fish Audio Community License v1.0, con las siguientes restricciones: uso gratuito solo para investigacion y fines no comerciales; uso comercial permitido unicamente por debajo de 500.000 USD de ingresos anuales; prohibido ofrecer un servicio alojado de TTS o clonacion de voz sin una licencia aparte; prohibido clonar voces de personas reales sin consentimiento; prohibido eliminar marcas de agua; prohibido usar las salidas para entrenar otros modelos de voz o modelos fundacionales.
- Sin soporte documentado en la informacion disponible para otros motores de inferencia distintos de SGLang-Omni, lo que limita las opciones de despliegue y complica la portabilidad a otros stacks.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fishaudio/drama-3-int4
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Cuantizacion int8 de la comunidad usada como comparacion: https://huggingface.co/darioooooo0o/drama-3-w4a16-32gb
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guia de Drama 3 en SGLang-Omni (cookbook): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Perfil de Fish Audio en HuggingFace: https://huggingface.co/fishaudio
- Sitio de Fish Audio: https://fish.audio/
- Aplicacion de Fish Audio: https://fish.audio/app/
- Kitta Audio (basado en tecnologia de Fish Audio): https://fishaudio.org/en
- Ficheros del repositorio citados en la model card: `LICENSE`, `apply_patch.py`, `quantize.py`, `quant_stats.json`, `eval/eval_results.json`, `shared_expert_verdict.md`
- Constructor de la cuantizacion: ML Intern (https://hf.co/chat?mode=ml-intern)
