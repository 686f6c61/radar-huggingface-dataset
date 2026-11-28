# oxpuppy635/gemma4-26b-Penny-lora

## Resumen

`gemma4-26b-Penny-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `oxpuppy635` sobre el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, una variante descensurada ("heretic") del modelo Gemma 4 de 26B con arquitectura MoE (26B-A4B, es decir, 26 mil millones de parametros totales con aproximadamente 4 mil millones activos por token). El adaptador se distribuye en dos formatos: pesos PEFT en safetensors para su uso con `transformers` + `peft`, y un adaptador LoRA en GGUF para aplicacion dinamica en tiempo de ejecucion con `llama.cpp` mediante el flag `--lora`.

El modelo resuelve un problema muy concreto: especializar el comportamiento conversacional y de razonamiento del modelo base mediante un ajuste fino ligero (4000 conversaciones, 3 epocas, rango LoRA 16) que incorpora trazas de razonamiento en el formato `<|channel>thought...<channel|>`. El resultado es un adaptador de apenas 18,5 millones de parametros (0,1 GB de repositorio) que se puede superponer a cualquier cuantizacion GGUF del modelo base sin necesidad de reentrenar ni redistribuir los pesos completos.

Es relevante ahora porque demuestra el patron de personalizacion de subagentes sobre modelos MoE grandes con QLoRA de 4 bits, incluyendo los expertos 3D del MoE en NF4, y porque ofrece un adaptador LoRA en GGUF que se puede cargar en caliente sobre `llama.cpp`, lo que abarata enormemente el despliegue de variantes personalizadas de un modelo de 26B. No obstante, la informacion publicada es muy escasa: no hay benchmarks, no se declara licencia ni idiomas, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Gemma4ForConditionalGeneration, MoE 26B-A4B |
| Parametros totales | 18.585.600 (adaptador LoRA); modelo base: 26B totales |
| Parametros activos | Aproximadamente 4B en el modelo base (A4B); no disponible para el adaptador |
| Longitud de contexto | 2048 tokens (longitud maxima de secuencia en entrenamiento); contexto nativo del base: no disponible |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit (NF4 + bfloat16 compute, expertos MoE 3D en NF4); adaptador distribuido en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un modelo base con arquitectura `Gemma4ForConditionalGeneration` en configuracion MoE 26B-A4B, es decir, un transformer con mezcla de expertos en el que solo se activa una fraccion de los parametros por token (aproximadamente 4B activos de 26B totales). El ajuste fino emplea QLoRA de 4 bits con cuantizacion NF4 y computo en bfloat16, aplicando tambien cuantizacion NF4 a los expertos MoE 3D, lo que permite entrenar sobre un modelo de este tamano con un consumo de memoria muy reducido en comparacion con un fine-tuning completo.

Los hiperparametros declarados son: rango LoRA `r=16`, `lora_alpha=32`, longitud maxima de secuencia de 2048 tokens, 4000 conversaciones de entrenamiento (todas ellas con trazas de razonamiento en el formato `<|channel>thought...<channel|>` seguidas de la respuesta), 3 epocas y una perdida final de entrenamiento de 1,2456. No se especifica la composicion del dataset, el numero de tokens totales ni si hubo etapas de RLHF o DPO posteriores. La innovacion practica destacable es la distribucion del adaptador en GGUF, que permite aplicarlo dinamicamente sobre cualquier cuantizacion GGUF del modelo base en `llama.cpp` sin fusionar pesos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento explicito mediante trazas en el canal `<|channel>thought...<channel|>`, ya que el 100% de las conversaciones de entrenamiento incluyen este formato.
- Generacion de codigo y matematicas: capacidad presumible del modelo base Gemma 4, no verificada con benchmarks en este adaptador.
- Comportamiento descensurado ("uncensored" / "heretic"): el modelo base ha sido modificado para reducir rechazos, y el adaptador se construye sobre esa variante.
- Soporte de tool calling / function calling: no disponible en la informacion publicada para el adaptador; depende de las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado a la longitud de contexto de 2048 tokens usada en entrenamiento.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales: no se declaran vision, audio ni modo thinking nativo mas alla del canal de pensamiento entrenado.

## Casos de uso

- Prototipado rapido de asistentes personalizados: el adaptador LoRA en GGUF se carga en caliente sobre una cuantizacion Q4_K_M del modelo base con `llama.cpp --lora`, lo que permite iterar sobre el estilo conversacional sin redistribuir los 26B de pesos.
- Despliegue en entornos con VRAM limitada: al ser un adaptador de 18,5 millones de parametros, se puede superponer a un GGUF cuantizado del base y ejecutar en una sola GPU consumer de gama alta, algo inviable con el modelo completo en precision nativa.
- Generacion de contenido creativo y narrativo: el ejemplo de la model card ("Write an evocative story...") sugiere un uso orientado a escritura creativa, donde el ajuste fino sobre 4000 conversaciones moldea el tono y el estilo.
- Razonamiento con trazas auditables: al entrenar con el canal `<|channel>thought...<|channel|>`, el modelo puede producir cadenas de pensamiento separadas de la respuesta final, utiles para depuracion y evaluacion de agentes.
- Investigacion sobre descensurado y alineacion: al partir de una variante "heretic" y "uncensored", sirve como banco de pruebas para estudiar como el ajuste fino ligero modifica el comportamiento de rechazo del modelo base.
- Fine-tuning de bajo coste sobre MoE: el repositorio documenta el flujo QLoRA 4-bit con expertos MoE en NF4, util como receta reproducible para adaptar otros modelos MoE grandes con recursos modestos.
- Integracion en pipelines de CI/CD para pruebas de regresion conversacional: el adaptador es pequeno y versionable, lo que facilita fijar una variante concreta del comportamiento del modelo en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (18,5 millones de parametros, aproximadamente 37 MB en bfloat16; el repositorio completo ocupa 0,1 GB).
- VRAM para el modelo base: no disponible en la informacion publicada; depende de la cuantizacion del GGUF del base (Q4_K_M, Q5_K_M, etc.) y de la arquitectura MoE 26B-A4B.
- GPU recomendadas: no disponibles para el base; el adaptador en si no impone requisitos adicionales.
- Cabe en GPU consumer: probablemente si, usando una cuantizacion agresiva del base, pero no se confirma en la informacion disponible.
- Opciones de despliegue: `llama.cpp` (con `--lora` y `-ngl 99`), `transformers` + `peft` con `device_map="auto"`, y cualquier runtime que soporte adaptadores PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-26b-Penny-lora (este) | 18,5M (adaptador) sobre base 26B-A4B | 2048 en entrenamiento | no disponible | safetensors, GGUF | Adaptador LoRA descensurado con trazas de razonamiento |
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2 | 26B totales / ~4B activos | no disponible | no disponible | safetensors, GGUF | Modelo base sin el ajuste conversacional del adaptador |
| Gemma 4 26B-A4B instruct (original) | 26B totales / ~4B activos | no disponible | no disponible | safetensors, GGUF | Variante alineada sin descensurar; no comparable en comportamiento de rechazo |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda en un limbo juridico hasta que el autor o el titular del modelo base lo aclaren.
- Modelo descensurado ("uncensored" / "heretic"): reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, ofensivo o legalmente problematico; no apto para produccion sin filtros externos.
- Riesgo de alucinacion: inherente a los modelos generativos; el ajuste fino sobre 4000 conversaciones no aporta garantias de veracidad.
- Contexto de entrenamiento limitado a 2048 tokens: aunque el base pueda soportar mas, el adaptador no fue entrenado mas alla de esa longitud, lo que puede degradar el comportamiento en contextos largos.
- Idiomas no declarados: no hay garantia de calidad multilingue mas alla de la del modelo base.
- Sesgos: no documentados; el dataset de 4000 conversaciones no se describe, por lo que se desconocen sesgos introducidos por el ajuste.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar y ejecutar el base de 26B, con sus propios requisitos de hardware y su propia licencia.
- Trazas de razonamiento: el formato `<|channel>thought...<|channel|>` puede filtrarse en la salida si el runtime no lo procesa correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/oxpuppy635/gemma4-26b-Penny-lora
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
