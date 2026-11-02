# huggingface-mic/Inkling-mic

## Resumen

Inkling-mic es un artefacto de prueba (fixture) publicado por huggingface-mic a partir del modelo multimodal `thinkingmachines/Inkling`. No se trata de un modelo entrenado ni utilizable en produccion: es una version "adelgazada" del checkpoint original que conserva la misma arquitectura (`InklingForConditionalGeneration`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte, pero con solo 26,7 millones de parametros y pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de integracion para validar contratos de uso y expectativas de frameworks (Transformers) sin necesidad de descargar el modelo completo.

El modelo base, `thinkingmachines/Inkling`, es un modelo multimodal de generacion condicional desarrollado por Thinking Machines. La fixture hereda su configuracion de procesador (chat template, tokenizer, special tokens) y su interfaz de generacion condicional, lo que la hace util para probar pipelines de integracion de extremo a extremo con un coste de almacenamiento de 0,4 GB frente a los cientos de gigabytes que ocuparia el checkpoint real.

La relevancia de este repositorio es metodologica: ejemplifica el patron de "slim fixtures" promovido por huggingface-mic, en el que se reduce el numero de capas (a 3 capas de texto en este caso) y se sustituyen los pesos por valores aleatorios que superan un test de sensibilidad a la entrada (cada perturbacion de las entradas mueve los logits al menos 0,001). Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `InklingForConditionalGeneration` (transformer multimodal de generacion condicional) |
| Parametros totales | 26.736.427 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La fixture reproduce la clase `InklingForConditionalGeneration` del checkpoint `thinkingmachines/Inkling`, con la misma nomenclatura de tensores que el modelo real. La unica modificacion estructural es la reduccion del numero de capas de texto a 3 (`text num_hidden_layers 3`), aplicada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`chat_template.jinja`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el modelo base, de modo que el contrato de tokenizacion y plantilla de chat es identico al original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_ids:reverse`, produce 0,0461). El modelo se guardo en float32, el dtype con el que carga por defecto `thinkingmachines/Inkling`, y se verifico que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. La fixture cubre todos los checkpoints del modelo base cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras el adelgazamiento (clave de fixture `209ad3f38c33`).

## Capacidades

- Generacion condicional multimodal: hereda la interfaz de generacion condicional de `InklingForConditionalGeneration` (entradas multimodales procesadas por el procesador copiado del modelo base).
- Tokenizacion y plantilla de chat identicas al modelo base, lo que permite validar prompts y formatos conversacionales reales.
- Ejecucion de forward, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Compatibilidad con el contrato de integracion de Transformers descrito en `integrations/transformers/usage.md` y `integrations/transformers/expectations`.
- No dispone de capacidades reales de razonamiento, codigo, matematicas, tool calling, agentes ni multilingues: al tener pesos aleatorios, sus salidas no son semanticamente validas.

## Casos de uso

- Validacion de contratos de integracion: permite ejecutar el pipeline completo de Transformers (carga, tokenizacion, forward, generacion) contra la interfaz de `Inkling` sin descargar el checkpoint real, verificando que el contrato definido en `integration.json` se cumple.
- Pruebas de CI/CD en proyectos que integran modelos multimodales: al ocupar 0,4 GB y cargar en float32, se puede incluir en runners de integracion continua para detectar regresiones en el codigo de carga y preprocesado.
- Desarrollo de adaptadores y wrappers: sirve para probar codigo que envuelve `InklingForConditionalGeneration` (por ejemplo, servidores de inferencia o capas de gestion de sesiones) sin necesidad de GPU de gran capacidad.
- Verificacion de compatibilidad de dtype: util para comprobar que un pipeline soporta float32, bfloat16 y float16 sin producir NaN ni infinitos en forward, loss o gradientes.
- Pruebas de tokenizer y chat template: al copiarse los ficheros de procesador byte a byte, permite validar la construccion de prompts y el formateo de conversaciones multi-turno contra el comportamiento exacto del modelo base.
- Reproduccion de la fixture: el repositorio documenta como reconstruir los ficheros restantes con `python example/build_fixtures.py --fixture Inkling-mic`, lo que facilita auditorias de procedencia y regeneracion con los mismos hashes.
- Benchmarking de infraestructura de despliegue: permite medir tiempos de carga, memoria y latencia de frameworks (Transformers, y potencialmente vLLM o TGI si admiten la arquitectura) con un modelo de juguete antes de escalar al checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (26,7 M de parametros equivalen a unos 107 MB de pesos; el resto del consumo depende de activaciones y del procesador multimodal). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas y en muchas integradas.
- Opciones de despliegue: Transformers es el framework de referencia segun la documentacion del repositorio. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y no puede confirmarse.
- Latencia y throughput: no disponibles. Al ser un modelo de 3 capas de texto con pesos aleatorios, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-mic | 26,7 M | no disponible | Fixture de integracion (test-artifact) | no disponible | HuggingFace |
| thinkingmachines/Inkling | no disponible | no disponible | Modelo multimodal de generacion condicional | no disponible | HuggingFace |
| Otras fixtures de transformers-mic | variable (reducidas) | no disponible | Fixtures de integracion para otros modelos | no disponible | HuggingFace (org huggingface-mic) |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base como para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas carecen de valor semantico. Esta etiquetado explicitamente como `test-artifact`.
- No debe usarse en produccion, atencion al cliente, generacion de codigo ni ninguna tarea real.
- La licencia no esta declarada en la informacion disponible; antes de cualquier reutilizacion debe consultarse el repositorio y la licencia del modelo base `thinkingmachines/Inkling`.
- La configuracion reducida (3 capas de texto) no representa el comportamiento numerico del modelo base; los resultados de latencia, memoria o calidad no son extrapolables.
- Riesgo de confusion: el nombre y la estructura pueden llevar a confundir la fixture con un modelo funcional. El tag `test-artifact` existe precisamente para evitarlo en busquedas de modelos candidatos.
- No hay informacion sobre sesgos, idiomas soportados ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- La fixture solo cubre checkpoints con ficheros de procesador identicos byte a byte y configuracion coincidente tras el adelgazamiento; cambios en el modelo base pueden invalidar la cobertura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Inkling-mic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/Inkling-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Inkling-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Inkling-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/Inkling-mic/blob/main/build.json
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Inkling-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de adelgazamiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
