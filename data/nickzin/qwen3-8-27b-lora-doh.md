# nickzin/qwen3.8-27b-lora-doh

## Resumen

`nickzin/qwen3.8-27b-lora-doh` es un adaptador LoRA de rango 16 entrenado sobre el modelo base `Qwen/Qwen3.8-27B`. Lo publica el usuario nickzin como parte del proyecto de evaluacion de fine-tuning `qwen3.8-27b-finetune-eval`. No es un modelo completo: es un artefacto PEFT que debe cargarse o servirse junto al modelo base y que ocupa 0,3 GB en el repositorio.

Su relevancia no esta en el rendimiento, sino en su funcion experimental. El adaptador pertenece a la rama de destilacion construida sobre la rama de SFT de instrucciones, y se entreno como control para aislar una pregunta concreta: si la destilacion repara la tasa de rechazos que el fine-tuning de tool calling habia destruido porque el dano era especifico de esa tarea, o si la destilacion ayuda de forma general. Para separar ambas hipotesis hace falta una rama que nunca haya pasado por tool calling, y este adaptador es esa rama.

El autor indica explicitamente que **no fue evaluado con benchmarks**: el presupuesto de GPU se agoto antes de medirlo y se publica, en sus palabras, para que el hueco sea visible en lugar de quedar oculto. Se trata, por tanto, de un artefacto de investigacion reproducible, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre el transformer del modelo base `Qwen/Qwen3.8-27B`. Arquitectura interna del base: no disponible |
| Parametros totales | Adaptador: no disponible en cifra absoluta (repo de 0,3 GB). Modelo base: ~27.000 millones segun la denominacion "27B" del identificador, no confirmado en la informacion disponible |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la informacion) |
| Tipos de cuantizacion | no disponible para el adaptador; los adaptadores PEFT se sirven tipicamente en bf16/fp16 junto al base |
| Idiomas soportados | no disponibles |
| Licencia | other (el autor remite a las licencias del dataset y del modelo profesor y pide verificar antes de uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Rango LoRA | 16 |
| Modelo base | Qwen/Qwen3.8-27B |
| Rama experimental | Destilacion sobre la rama de SFT de instrucciones |
| Datos de entrenamiento | Conjunto de destilacion generado por un modelo profesor (no se detalla composicion ni tamano) |
| Estado de evaluacion | No evaluado con benchmarks (declarado por el autor) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 guardado en safetensors sobre el modelo `Qwen/Qwen3.8-27B`. Los adaptadores de este tipo congelan los pesos del modelo base e inyectan matrices de bajo rango en determinadas capas, de modo que solo se entrenan y se distribuyen esos parametros adicionales. El autor lo integra en un arbol de experimentos con tres ramas: una de SFT de instrucciones, una de fine-tuning de tool calling y esta de destilacion construida encima de la rama de SFT.

Los datos de entrenamiento son un conjunto de destilacion generado por un modelo profesor, sin que la model card detalle el numero de ejemplos, la composicion ni el origen del profesor. Tampoco se documentan hiperparametros, numero de tokens vistos ni si hubo etapas de RLHF o DPO. La unica innovacion tecnica reseñable documentada es metodologica y viene acompanada de una advertencia de integracion: `PeftModel.merge_and_unload()` produjo, con estos adaptadores guardados con Unsloth, un checkpoint bit a bit identico al modelo base. Eso significa que la fusion puede parecer exitosa y comportarse como si no hubiera fine-tuning alguno. El autor propone verificar a nivel de peso con la comprobacion `(W_merged - W_base) == scale * (B @ A)` dentro de unos pocos ulps de bf16.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas del modelo base `Qwen/Qwen3.8-27B`; no hay evaluacion especifica publicada para este adaptador.
- Tool calling / function calling: el repositorio incluye las etiquetas `tool-calling` y `function-calling`, pero esta rama concreta es el control de destilacion, no la rama entrenada para tool calling. No debe asumirse que el adaptador mejore esa capacidad.
- Modo de razonamiento o thinking: no disponible.
- Vision o audio: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni evaluadas.
- Capacidades multilingues: no disponibles (la model card no declara idiomas).
- Capacidad real documentada: servir como control experimental para medir el efecto de la destilacion sobre la tasa de rechazos, y como material reproducible del proyecto de evaluacion.

## Casos de uso

- Control experimental en estudios de destilacion: comparar esta rama, que nunca paso por tool calling, contra la rama de destilacion construida sobre el fine-tuning de tool calling permite separar el efecto general de la destilacion del efecto de reparacion especifico.
- Analisis de tasas de rechazo: midiendo la frecuencia con la que el modelo declina responder en el mismo prompt set antes y despues de aplicar el adaptador, se puede cuantificar cuanto repara la destilacion el dano causado por el fine-tuning previo.
- Verificacion de pipelines de fusion de adaptadores: el aviso sobre `merge_and_unload()` convierte este repositorio en un caso de prueba util para validar scripts de merge con la comprobacion a nivel de peso antes de desplegar cualquier adaptador guardado con Unsloth.
- Despliegue multi-LoRA en vLLM: el comando documentado (`--enable-lora --max-lora-rank 16 --max-loras 1`) permite servirlo como modulo LoRA intercambiable junto al base, util para alternar ramas experimentales en una misma GPU.
- Evaluacion comparativa de ramas en pipelines de CI: integrar el adaptador en pruebas automatizadas que comprueben que una rama concreta no degrada metricas de rechazo o de formato respecto al base antes de promoverla.
- Investigacion en PEFT y eficiencia de adaptacion: con 0,3 GB de repo sobre un base de ~27B, sirve para estudiar el coste real de almacenar y servir ramas alternativas de bajo rango en lugar de checkpoints completos.
- Reproducibilidad academica: al publicarse pese a no estar evaluado, permite a terceros completar la medicion que el autor no pudo costear, reutilizando la configuracion de servicio documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el adaptador no fue evaluado ("Not benchmarked") porque el presupuesto de GPU se agoto antes de medirlo. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni de comparaciones numericas con modelos similares.

## Requisitos de hardware

Nota: no hay mediciones publicadas. Las cifras siguientes son estimaciones calculadas a partir del tamano del modelo base (~27.000 millones de parametros) y deben tomarse como orientativas.

- VRAM para el adaptador: 0,3 GB en disco; en memoria anade un coste marginal sobre el modelo base.
- Modelo base en bf16/fp16: aproximadamente 54 GB solo en pesos, mas cache KV y overhead, en torno a 60-70 GB. Requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB.
- Modelo base en fp8/int8: aproximadamente 27 GB en pesos, viable en A100 40 GB o L40S 48 GB con margen ajustado.
- Modelo base en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 14-16 GB en pesos, lo que lo situaria al alcance de una RTX 4090 o RTX 3090 de 24 GB para contextos moderados.
- Despliegue recomendado por el autor: vLLM con `--enable-lora --max-lora-rank 16 --max-loras 1`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`. El autor indica que se sirve un modulo LoRA residente a la vez.
- Advertencia de integracion en cliente: el nombre servido (`qwen38-doh` en el ejemplo) no es un id de repositorio de Hugging Face; el cliente debe configurarse con el nombre servido, no con la ruta del adaptador.
- Latencia y throughput: no disponibles.
- Alternativas de despliegue no documentadas para este adaptador: llama.cpp, Ollama o TGI no aparecen en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados de benchmarks ni especificaciones del modelo base que permitan una comparacion cuantitativa fiable. La unica comparacion defendible con la informacion disponible es entre el adaptador y su propio modelo base.

| Aspecto | Este adaptador | Qwen/Qwen3.8-27B (base) | Otras alternativas |
|---|---|---|---|
| Tipo de artefacto | Adaptador LoRA rango 16 (PEFT) | Modelo completo | no disponible |
| Tamano | 0,3 GB | no disponible | no disponible |
| Parametros | No disponible | ~27.000 millones segun denominacion, no confirmado | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Rendimiento | No evaluado | no disponible | no disponible |
| Licencia | other | no disponible | no disponible |
| Disponibilidad | Publico en Hugging Face, 0 descargas | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el propio autor declara que el adaptador no fue medido con benchmarks. No hay ninguna garantia de mejora sobre el modelo base en ninguna tarea.
- Es un control experimental, no un modelo de produccion. Su proposito es aislar una variable en un estudio, no resolver una tarea final.
- Riesgo de fusion silenciosa: con estos adaptadores guardados con Unsloth, `merge_and_unload()` genero un checkpoint bit a bit identico al base. Si se fusiona sin verificar `(W_merged - W_base) == scale * (B @ A)`, el resultado puede parecer correcto y comportarse como el modelo sin fine-tuning.
- Ambiguedad de las etiquetas: el repositorio lleva `tool-calling` y `function-calling`, pero esta rama es la de control, no la entrenada para tool calling. Asumir mejoras en esa capacidad seria un error de interpretacion.
- Licencia `other`: el autor remite a las licencias del dataset y del modelo profesor y pide verificar antes de cualquier uso comercial. No se concede por defecto un uso comercial claro.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni sobre el comportamiento en castellano.
- Sesgos: no documentados. Al entrenarse con un conjunto de destilacion generado por un profesor no especificado, hereda los sesgos de ese profesor y de los datos originales, sin que exista analisis publicado.
- Alucinacion: sin evaluacion, no hay datos sobre tasas de alucinacion ni sobre el efecto de la destilacion en la veracidad.
- Dependencia del base: cualquier limitacion de contexto, idioma o licencia de `Qwen/Qwen3.8-27B` se traslada al adaptador.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de terceros.
- Restriccion operativa en vLLM: el autor sirve un unico modulo LoRA residente a la vez, lo que limita la comparacion simultanea de ramas en un mismo despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nickzin/qwen3.8-27b-lora-doh
- Repositorio del proyecto de evaluacion: https://github.com/Nicolas-Formenton/qwen3.8-27b-finetune-eval
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a contenidos no relacionados: Gadget Hacks y Null Byte).
