# boyuzhuGPT/Qwen2.5-Omni-7B-Safety-ZeroAudio

## Resumen

Qwen2.5-Omni-7B-Safety-ZeroAudio es un ajuste fino de Qwen/Qwen2.5-Omni-7B orientado exclusivamente a la moderacion de contenido multimodal como guardrail de seguridad. Lo publica el usuario boyuzhuGPT y conserva la arquitectura del modelo base (un transformer multimodal de unos 7.000 millones de parametros), pero elimina por completo la rama de audio: el sufijo ZeroAudio indica que no se uso ni un solo ejemplo de audio durante el entrenamiento, de modo que el modelo cubre unicamente texto puro, imagenes estaticas y video dinamico.

El modelo resuelve un problema muy concreto: clasificar entradas multimodales como seguras o no seguras y etiquetar la categoria de riesgo correspondiente. Para ello se entreno con SFT de parametros completos sobre 13 conjuntos de datos multimodales y 193.788 muestras, con una perdida de entrenamiento de aproximadamente 0,088 y una precision de prediccion de tokens del 96,94 por ciento segun la model card. El resultado no es un asistente conversacional, sino un clasificador con un formato de salida estricto de dos lineas (evaluacion de seguridad y categorias), pensado para integrarse como filtro en pipelines de moderacion.

Su relevancia actual es doble: por un lado, la moderacion de video e imagen sigue siendo un cuello de botella en plataformas grandes; por otro, apenas existen guardrails multimodales abiertos que cubran simultaneamente texto, imagen y video bajo licencia Apache 2.0. Como contrapartida, el repositorio no incluye benchmarks publicos, no tiene descargas ni valoraciones, y la busqueda web realizada no aporto documentacion tecnica adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen2.5-Omni-7B; el detalle interno de la arquitectura base no se especifica en la model card |
| Parametros totales | 7B (segun la denominacion del modelo; no se declara un recuento exacto) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la model card no documenta variantes cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Modalidades cubiertas | Texto, imagen estatica y video dinamico; audio eliminado (ZeroAudio) |
| Formato de salida | `- Safety Assessment: Safe \| Unsafe` y `- Categories: <categorias> \| None` |
| Tamano del repositorio | 5,0 GB (segun HuggingFace) |
| Metodo de entrenamiento | SFT de parametros completos en 8x NVIDIA H200 con ZeRO-2 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal de aproximadamente 7.000 millones de parametros, y se somete a un ajuste fino supervisado de parametros completos (full-parameter SFT) distribuido en 8 GPU NVIDIA H200 mediante ZeRO-2. La model card no detalla la configuracion de capas, el planificador de aprendizaje, la resolucion de imagen admitida ni la longitud de contexto del modelo base, por lo que esos extremos quedan como no disponibles.

El corpus de entrenamiento se compone de 13 conjuntos de datos multimodales con un total de 193.788 muestras. Para texto puro se emplean Aegis, BeaverTails, ToxicChat y WildGuardMix-Text; para imagen estatica, LLaVA-Guard, VLSBench, VLGuard y UnsafeBench; y para video dinamico, FVC, FakeSV, DCSASS, SafeSora y LSPD. No se utilizo ningun dato de audio. La model card reporta una perdida de entrenamiento de aproximadamente 0,088 y una precision de prediccion de tokens del 96,94 por ciento, pero no menciona el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de seguridad de texto puro, con salida binaria (Safe / Unsafe) y etiquetado de categorias de riesgo.
- Clasificacion de seguridad de imagenes estaticas, entrenada sobre LLaVA-Guard, VLSBench, VLGuard y UnsafeBench.
- Clasificacion de seguridad de video dinamico, entrenada sobre FVC, FakeSV, DCSASS, SafeSora y LSPD.
- Salida estricta y parseable en dos lineas, apta para integracion programatica en pipelines automatizados.
- Soporte multilingue limitado a ingles y chino, los dos idiomas declarados en la model card.
- Inferencia mediante `transformers` con `AutoProcessor` y `Qwen2_5_OmniForConditionalGeneration`, y mediante `ms-swift` con backend PyTorch.
- No soporta audio: la modalidad se elimino deliberadamente durante el ajuste fino.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Moderacion de comentarios y publicaciones de texto en plataformas sociales: el modelo clasifica la entrada como segura o no segura y devuelve la categoria de riesgo, lo que permite encaminar automaticamente cada caso a publicacion, revision humana o bloqueo.
- Moderacion de imagenes subidas por usuarios: al haber sido entrenado con VLGuard, UnsafeBench y VLSBench, puede actuar como primer filtro antes de que una imagen se publique o se envie a un revisor humano.
- Moderacion de video en plataformas de contenido generado por usuarios: su entrenamiento sobre FVC, FakeSV, DCSASS, SafeSora y LSPD lo orienta a detectar contenido inseguro o manipulado en clips de video.
- Guardrail de entrada y salida en aplicaciones basadas en LLM: se puede situar delante del prompt del usuario y detras de la respuesta del modelo para bloquear contenido danino sin depender del modelo generativo principal.
- Limpieza de corpus multimodales antes del entrenamiento: el modelo permite etiquetar grandes volumenes de imagenes y videos y descartar las muestras inseguras antes de construir un dataset.
- Triaje en flujos de anotacion humana: al devolver una etiqueta y una categoria, reduce el numero de casos que llegan a revision manual y ordena la cola por prioridad.
- Cumplimiento de obligaciones de moderacion (por ejemplo, las exigidas a plataformas en la Union Europea): ofrece un registro estructurado y parseable de cada decision de clasificacion.
- Investigacion en seguridad multimodal: sirve como punto de comparacion frente a guardrails centrados solo en texto, y su licencia Apache 2.0 facilita reproducir experimentos.
- Auditoria de contenido almacenado: procesado por lotes de bibliotecas de imagenes o video ya publicadas para localizar material que incumpla las politicas vigentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni sobre conjuntos de referencia de seguridad como Aegis o VLGuard.

Unicos datos numericos aportados por el autor, correspondientes al proceso de entrenamiento y no a una evaluacion independiente:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | ~0,088 |
| Precision de prediccion de tokens | 96,94 % |
| Muestras de entrenamiento | 193.788 |
| Conjuntos de datos | 13 (texto, imagen y video) |
| Muestras de audio | 0 |

## Requisitos de hardware

Estimaciones orientativas a partir del tamano declarado (7B); la model card no publica cifras de VRAM ni de latencia.

- Pesos en bf16/fp16: aproximadamente 14-16 GB solo para los pesos; con cache KV y activaciones para imagen y video se recomienda reservar 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 8-9 GB de VRAM.
- Cuantizacion a 4 bits: en torno a 5-6 GB de VRAM.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S 48 GB cubren la inferencia en bf16 sin problemas. El entrenamiento reportado uso 8x NVIDIA H200.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo en bf16 con margen ajustado; tarjetas de 16 GB o menos requeriran cuantizacion.
- Despliegue documentado: `transformers` (con `AutoProcessor` y `Qwen2_5_OmniForConditionalGeneration`, `torch_dtype=torch.bfloat16`, `device_map="auto"`) y `ms-swift` (`swift infer --model_type qwen2_5_omni --infer_backend pt`).
- Otros servidores de inferencia (vLLM, TGI, Ollama, llama.cpp) no se mencionan en la informacion disponible; el soporte multimodal de Omni en esas pilas no esta confirmado.
- Latencia y throughput: no disponibles.
- Nota practica: el repositorio ocupa 5,0 GB, un tamano inferior al habitual para un modelo de 7.000 millones de parametros en bf16 (del orden de 15 GB). Conviene verificar la integridad y la lista completa de ficheros antes de desplegarlo en produccion.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general y no han sido verificados en la busqueda realizada; deben tomarse como orientativos.

| Modelo | Parametros | Modalidades | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Omni-7B-Safety-ZeroAudio | 7B | Texto, imagen, video (sin audio) | apache-2.0 | Guardrail multimodal; sin benchmarks publicos |
| Qwen/Qwen2.5-Omni-7B (base) | 7B | Texto, imagen, audio, video | apache-2.0 | Modelo generalista, no especializado en seguridad |
| Llama Guard 3 | 8B | Texto e imagen | Licencia comunitaria de Llama 3.1 | Guardrail ampliamente adoptado; sin cobertura de video |
| WildGuard | 7B | Texto | No verificada en esta busqueda | Orientado a moderacion de texto |
| ShieldGemma | 2B / 9B / 27B | Texto e imagen | Licencia de Gemma | Familia de clasificadores de seguridad de Google |

La ventaja diferencial de este modelo frente a las alternativas es la cobertura simultanea de texto, imagen y video bajo Apache 2.0. Su desventaja es la ausencia total de evaluacion publica, frente a guardrails con benchmarks y adopcion amplia.

## Limitaciones y advertencias

- No hay benchmarks publicos ni evaluacion independiente: el unico respaldo numerico son la perdida de entrenamiento y la precision de tokens reportadas por el propio autor, que no miden el rendimiento real de clasificacion.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe evidencia de uso en produccion por terceros.
- Al ser un ajuste fino del modelo base, hereda los sesgos de Qwen2.5-Omni-7B y de los corpus de anotacion empleados (Aegis, BeaverTails, ToxicChat y otros), mayoritariamente en ingles y chino.
- Solo se declaran ingles y chino: no hay garantia de rendimiento en castellano ni en ningun otro idioma.
- La salida esta restringida a un formato estricto de dos lineas; si se usa como modelo conversacional abierto, el comportamiento puede degradarse y la salida volverse dificil de parsear.
- Riesgo de falsos positivos y falsos negativos en la clasificacion: no deberia ser el unico mecanismo de moderacion en un sistema en produccion.
- Riesgo de alucinacion en la atribucion de categorias: el modelo puede asignar una categoria plausible pero incorrecta, y el formato corto dificulta detectar la incertidumbre.
- El audio queda fuera por diseno: cualquier entrada de audio no tiene cobertura y no debe esperarse un comportamiento fiable en esa modalidad.
- Licencia Apache 2.0 en el modelo y en el modelo base, lo que en principio permite uso comercial sin restricciones adicionales; conviene aun asi revisar los terminos de los conjuntos de datos utilizados en el ajuste fino si se va a redistribuir un derivado.
- El tamano del repositorio (5,0 GB) es inferior al esperado para 7B en bf16; verificar los ficheros antes de cualquier despliegue.
- Las fechas de creacion y actualizacion registradas en HuggingFace (septiembre de 2026) no van acompanadas de ninguna publicacion tecnica que las contextualice.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyuzhuGPT/Qwen2.5-Omni-7B-Safety-ZeroAudio
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de ms-swift, referenciado en la model card: https://github.com/modelscope/ms-swift
- Conjuntos de datos citados en la model card (sin enlace aportado por el autor): Aegis, BeaverTails, ToxicChat, WildGuardMix-Text, LLaVA-Guard, VLSBench, VLGuard, UnsafeBench, FVC, FakeSV, DCSASS, SafeSora y LSPD.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los unicos resultados obtenidos se referian al animal bisonte y a una aplicacion financiera homonima, por lo que no se anaden mas enlaces. No hay paper, blog tecnico ni demo publicados en la informacion disponible.
