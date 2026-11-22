# Raufaser/Inkling-2-Mini-hipfire-MQ4

## Resumen

Inkling-2-Mini-hipfire-MQ4 es una cuantización a 4 bits del checkpoint `thinkingmachines/Inkling-2-Mini`, publicada por el usuario Raufaser para el runtime hipfire, un motor de inferencia orientado a GPU AMD. El modelo base lo desarrolla Thinking Machines y emplea una arquitectura híbrida con atención local/global y capas MoE dispersas (8 de 128 expertos activados por token), con 24 capas de pesos que se ejecutan tres veces. El artefacto resultante ocupa 13,9 GB en un único fichero `.hfq` con 6.790 tensores.

La relevancia de esta publicación es acotada y muy específica: no es un modelo nuevo ni una mejora del modelo base, sino un contenedor en formato propietario de hipfire (MQ4G256V2, tipo de cuantización 44) que solo puede cargarse con compilaciones del runtime que incluyan soporte para la arquitectura Inkling-2. Ese soporte no está en ninguna release publicada: vive en el PR #1192 del repositorio de hipfire, todavía en borrador, y el trunk asigna a la arquitectura el id provisional 24.

Por tanto, el interés práctico se limita al *bring-up* del runtime: validar el cargador, el forward y la ruta de generación en hardware AMD. El propio autor advierte que llama.cpp no puede leer este fichero y que no hay métricas de calidad (KLD o perplejidad) publicadas. Los tensores de visión y el sidecar MTP del checkpoint original no se incluyen: este primer artefacto es solo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención local/global y capas MoE dispersas (8 de 128 expertos por token); 24 capas ejecutadas tres veces |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 8 de 128 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ4G256V2 (qt 44), 4 bits, formato propietario de hipfire; sin imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base, con Model Acceptable Use Policy adicional de Thinking Machines) |
| Formato de pesos | `.hfq` (contenedor hipfire); no compatible con llama.cpp ni GGUF |

## Arquitectura y entrenamiento

El checkpoint de origen, `thinkingmachines/Inkling-2-Mini`, combina una pila de atención híbrida local/global con capas MoE dispersas en las que se activan 8 expertos de 128 por token. El autor describe el modelo como "24 capas de pesos ejecutadas tres veces", lo que sugiere un esquema de reutilización de bloques o *weight tying* entre pasadas, aunque no se detalla el mecanismo exacto ni el número de tokens de entrenamiento, la composición del dataset o si hubo RLHF/DPO. Tampoco se especifican innovaciones de decodificación como decodificación especulativa.

La cuantización se realizó con `hipfire-quantize` en formato `mq4v2`. El proceso de ingesta dequantiza pesos estrictos NVFP4 (bloque 1x16 con formato E2M1, escala E4M3 y parámetros `amax` / `outer_scale_denominator`) y MXFP8 (bloque 1x32), separa los expertos enrutados, reagrupa las proyecciones gate/up y mantiene una lista fija de tensores en F16. No se empleó imatrix. El autor indica que los formatos MQ con rotación FWHT y MagnumQuant son trabajo original de hipfire, catalogado en `PRIOR-ART.md`.

## Capacidades

- Generación de texto: es la única modalidad incluida en este artefacto; los tensores de visión del checkpoint original se han omitido.
- Razonamiento y matemáticas: presumiblemente heredados del modelo base, pero sin evaluación publicada que lo confirme.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas del repo está vacío.
- Modo *thinking* o cualquier capacidad especial: no disponible.
- Carga en runtime: exclusivamente mediante una compilación de hipfire construida desde el PR #1192.

## Casos de uso

- Validación del cargador de arquitectura en hipfire: cargar el `.hfq` con un binario compilado desde el PR #1192 y comprobar que el *loader carrier* reconoce los 6.790 tensores y la arquitectura id 24, reportando fallos con el commit de build y el modelo de GPU.
- Pruebas de paridad numérica del forward: ejecutar prompts cortos como el ejemplo del autor ("Explain how a retry queue prevents lost jobs") y comparar la salida con el checkpoint original en safetensors para detectar divergencias en las primitivas de atención, softcap o sigmoid-top-k.
- Desarrollo de la ruta de generación: usar el modelo como banco de pruebas para depurar el pipeline de muestreo y decodificación de hipfire en GPU AMD antes de que la arquitectura llegue a una release estable.
- Evaluación del cuantizador: verificar a nivel de tensor que la dequantización NVFP4/MXFP8 reproduce los pesos de origen, tal como se hizo durante el desarrollo del cuantizador.
- Bring-up en hardware AMD: medir consumo de VRAM y estabilidad del runtime con 13,9 GB de pesos en GPUs de la familia Radeon o Instinct, un nicho donde las alternativas basadas en CUDA no aplican.
- Reproducción del pipeline de cuantización: reconstruir el fichero desde los safetensors de origen con `hipfire-quantize --format mq4v2` para validar la cadena de herramientas o generar variantes Lloyd, que el autor anuncia como trabajo futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay cifras de KLD ni de perplejidad, y que el evaluador estándar `eval_hipfire` no enruta todavía la arquitectura Inkling-2, por lo que no existe referencia comparable. Las pruebas existentes (oráculo en CPU para las primitivas de control, mix, convolución, relative-bias, SITU, sigmoid-top-k, softcap y atención) cubren la ingesta del cuantizador y operaciones individuales, no la calidad de generación extremo a extremo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 13,9 GB solo para los pesos en MQ4; hay que añadir KV cache y buffers del runtime, no cuantificados en la información disponible.
- GPU recomendadas: el runtime hipfire está orientado a AMD; no se especifican modelos concretos (Radeon, Instinct) en la model card.
- GPU de consumo: probablemente asequible en GPUs AMD con 16 GB o más de VRAM, aunque no hay confirmación del autor.
- Opciones de despliegue: exclusivamente hipfire compilado desde el PR #1192. No es compatible con llama.cpp, vLLM, TGI, Ollama ni ningún runtime que espere GGUF o safetensors.
- Latencia y throughput: no disponibles; la ruta de generación sigue en validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-hipfire-MQ4 | no disponible (MoE 8/128) | no disponible | `.hfq` (hipfire) | Apache-2.0 | Solo con build del PR #1192 |
| thinkingmachines/Inkling-2-Mini | no disponible (MoE 8/128) | no disponible | safetensors (NVFP4/MXFP8) | Apache-2.0 + AUP | Público en Hugging Face |
| Alternativas de formato abierto (GGUF) | no disponible | no disponible | GGUF | variable | Amplia compatibilidad de runtimes |

No se dispone de datos de rendimiento del modelo base ni de cuantizaciones comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Soporte de runtime inexistente en releases: el fichero solo carga con un binario compilado desde el PR #1192, en estado de borrador; una release estándar lo rechaza como arquitectura desconocida.
- Sin métricas de calidad: no hay KLD, perplejidad ni evaluaciones de generación; el artefacto está pensado para *bring-up*, no para producción.
- Ruta de generación en validación: el propio autor pide reportar fallos con commit, GPU y salida decodificada, lo que indica inestabilidad esperable.
- Solo texto: los tensores de visión y el sidecar MTP no están incluidos.
- Incompatibilidad total con llama.cpp y el ecosistema GGUF.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación y sesgos: no evaluados en este artefacto ni documentados para el modelo base en la información disponible.
- Licencia: Apache-2.0 para los pesos, pero el modelo base añade una Model Acceptable Use Policy separada de Thinking Machines que condiciona el uso comercial; el autor no reclama derechos sobre los pesos.
- Formato propietario: MQ4G256V2 depende de las herramientas de hipfire (MagnumQuant, rotación FWHT), lo que dificulta la portabilidad y la auditoría con herramientas estándar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raufaser/Inkling-2-Mini-hipfire-MQ4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de soporte de arquitectura en hipfire: https://github.com/warpfront/hipfire/pull/1192
- Catálogo de técnicas originales de hipfire: https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
