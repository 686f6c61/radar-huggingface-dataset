# oxpuppy635/gemma-26b-Nifty-lora

## Resumen

`gemma-26b-Nifty-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario oxpuppy635 sobre el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, una variante "uncensored"/"heretic" del modelo Gemma 4 de 26B en arquitectura MoE con 4B de parametros activos (26B-A4B). El adaptador no es un modelo completo: pesa aproximadamente 18,6 millones de parametros (unos 0,1 GB en safetensors) y se aplica en tiempo de ejecucion sobre el modelo base para modificar su comportamiento generativo.

El objetivo declarado del autor es el ajuste fino conversacional y de razonamiento: las 4000 conversaciones de entrenamiento incluyen trazas de razonamiento delimitadas con los tokens especiales `<|channel>thought...<channel|>`, lo que sugiere un entrenamiento orientado a exponer el proceso de pensamiento del modelo antes de la respuesta final. El adaptador se distribuye en dos formatos: pesos PEFT/safetensors para `transformers` y un adaptador GGUF independiente para su uso dinamico con `llama.cpp` mediante el flag `--lora`.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Es util como ejemplo de flujo QLoRA sobre arquitecturas MoE con cuantizacion QAT, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Gemma 4 (`Gemma4ForConditionalGeneration`), 26B-A4B |
| Parametros totales | 18.585.600 (adaptador LoRA); el modelo base es de 26B con 4B activos |
| Parametros activos | 4B (modelo base, arquitectura A4B); el adaptador no tiene activos propios |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia en entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con computo en bfloat16 (incluye expertos MoE 3D en NF4); adaptador GGUF para `llama.cpp`; el base se distribuye con variantes QAT q4_0 y GGUF (Q4_K_M en el ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) y GGUF (`gemma-26b-Nifty-lora.gguf`) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre un modelo base Gemma 4 de tipo Mixture of Experts con 26B de parametros totales y 4B activos por token. La cuantizacion del entrenamiento es 4-bit NF4 con computo en bfloat16, aplicada tambien a los expertos MoE tridimensionales, lo que permite ajustar un modelo de este tamano con un consumo de memoria reducido. Los hiperparametros de LoRA son rango `r=16` y `lora_alpha=32`, con una longitud maxima de secuencia de 8192 tokens.

El conjunto de entrenamiento consta de 4000 conversaciones, todas ellas con trazas de razonamiento (4000/4000) en el formato `<|channel>thought...<channel|>` seguido de la completion. Se realizaron 3 epocas con una perdida final de entrenamiento de 0,8902. No se especifican la composicion del dataset, el origen de las conversaciones, ni si hubo etapas de RLHF o DPO adicionales. El modelo base incorpora ya cuantizacion QAT (quantization-aware training) segun su nombre, y la variante "heretic"/"uncensored" implica que se ha reducido o eliminado el alineamiento de seguridad original de Gemma.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct (`-it`).
- Razonamiento explicito mediante trazas internas delimitadas por `<|channel>thought...<channel|>`, ya que el adaptador fue entrenado especificamente sobre ese formato.
- Generacion de codigo y matematicas: capacidad presumible del base Gemma 4, no verificada en este adaptador por ausencia de benchmarks.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el formato de trazas de pensamiento es compatible con flujos de razonamiento encadenado, pero no se aportan pruebas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el modelo base es de tipo `Gemma4ForConditionalGeneration`, lo que en la familia Gemma sugiere soporte multimodal, pero no se confirma en la informacion disponible.
- Modo "uncensored": el base ha sido modificado para reducir rechazos de seguridad, lo que se traslada al adaptador.

## Casos de uso

- Experimentacion con QLoRA sobre MoE: el adaptador sirve como referencia practica para ajustar modelos Gemma 4 26B-A4B con cuantizacion 4-bit NF4 en hardware limitado, incluyendo expertos MoE.
- Generacion creativa sin filtros: el caracter "uncensored" del base y el ajuste conversacional permiten narrativa y ficcion sin las restricciones habituales del alineamiento, util en entornos controlados de escritura creativa.
- Investigacion sobre razonamiento visible: el entrenamiento con trazas `<|channel>thought...<channel|>` permite estudiar como el modelo estructura su cadena de pensamiento antes de responder, en tareas de analisis de razonamiento.
- Despliegue ligero con `llama.cpp`: el adaptador GGUF se aplica dinamicamente con `--lora` sobre cualquier cuantizacion GGUF del base, lo que facilita probar variantes sin reempaquetar el modelo completo.
- Prototipado de asistentes conversacionales de dominio especifico: partiendo de este adaptador como plantilla, un equipo puede sustituir el dataset por conversaciones propias y reentrenar con el mismo pipeline QLoRA.
- Evaluacion comparativa de adaptadores: al ser un LoRA pequeno (18,6M de parametros), permite medir el impacto de un ajuste concreto sobre el base sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable; los 18,6M de parametros del LoRA ocupan decenas de MB en bfloat16.
- VRAM para el modelo base: al ser un MoE de 26B con 4B activos, la inferencia en bfloat16 requiere del orden de 52 GB solo para pesos, mas cache KV; en cuantizacion 4-bit (QAT q4_0 o GGUF Q4_K_M) se reduce aproximadamente a 13-15 GB, lo que lo hace viable en GPUs consumer de gama alta.
- GPU recomendadas: A100 80GB o H100 para bfloat16 sin cuantizar; RTX 4090 (24 GB) o RTX 3090 (24 GB) para cuantizaciones 4-bit; GPUs con 16 GB pueden ser insuficientes segun la longitud de contexto y el overhead de cache KV.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion 4-bit y contexto moderado; no en GPUs de 8-12 GB.
- Opciones de despliegue: `llama.cpp` (con `--lora` y `-ngl 99`), Ollama (si se empaqueta el GGUF con el adaptador), `transformers` + `peft` en Python, y potencialmente vLLM con soporte de adaptadores LoRA (no confirmado en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-26b-Nifty-lora (este) | 18,6M (adaptador) sobre base 26B-A4B | 8192 (entrenamiento) | no disponible | safetensors, GGUF | Adaptador LoRA de nicho, sin benchmarks ni descargas |
| Modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2` | 26B (4B activos) | no disponible | no disponible | safetensors, GGUF | Modelo completo sin adaptador; misma arquitectura y mismo caracter uncensored |
| Gemma 4 26B-A4B instruct original (familia Gemma) | 26B (4B activos) | no disponible | licencia Gemma (no confirmada para esta variante) | safetensors, GGUF | Version alineada y con filtros de seguridad; referencia de comportamiento frente a la variante heretic |
| Adaptadores LoRA genericos sobre Gemma | variable | variable | variable | safetensors, GGUF | Alternativas de la comunidad; no se dispone de comparacion cuantitativa |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al base en ninguna tarea medible.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo base pertenece a la familia Gemma y hereda sus terminos, que deben verificarse en el repositorio original.
- Modelo "uncensored"/"heretic": el alineamiento de seguridad ha sido reducido o eliminado, por lo que puede generar contenido danino, ofensivo o ilegal; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica para este adaptador.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingue adecuado.
- Contexto de entrenamiento limitado a 8192 tokens: secuencias mas largas pueden degradar la calidad aunque el base soporte mas contexto.
- Dataset de entrenamiento opaco: se desconocen la procedencia y composicion de las 4000 conversaciones, lo que impide evaluar sesgos introducidos.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Perdida final de 0,8902 sin curva de validacion: no se puede descartar sobreajuste a las 4000 conversaciones.
- Dependencia del base: el adaptador solo funciona con la version exacta del modelo base indicada; no es portable a otros Gemma.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/oxpuppy635/gemma-26b-Nifty-lora
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
