# jungwook2358/Qwen3.5-4B-wsp-exp0028-p1-p4-final

## Resumen

Qwen3.5-4B-wsp-exp0028-p1-p4-final es una variante del modelo base Qwen/Qwen3.5-4B (revision `851bf6e8`) en la que se ha aplicado una unica edicion de pesos de rango 1 sobre la matriz `model.language_model.layers.31.mlp.down_proj.weight`. No se ha realizado ningun entrenamiento: un agente de edicion (Claude Opus 5.5 en Claude Code) analizo el comportamiento y las activaciones del modelo sobre una tarea de robotica de tipo code-as-policy (LIBERO, harness PyRUA-Lean) y escribio directamente los valores de los pesos mediante minimos cuadrados/ridge en forma cerrada, sin pasos de gradiente.

El objetivo declarado de la sesion de edicion era corregir turnos en los que el modelo termina su respuesta mientras sigue en modo thinking, de modo que el servidor no recibe ninguna llamada a herramienta. La hipotesis del editor es que, cuando el modelo ha escrito su tool call dentro del bloque de thinking en formato XML y lo ha cerrado con `</tool_call>`, emite `<|im_end|>` en lugar de cerrar el bloque de razonamiento; el parche inyecta una clave de la ultima capa MLP que solo se activa en ese estado y desplaza el readout hacia `</think>` (+20 nats) y en contra de `<|im_end|>`/`<|endoftext|>` (-12 nats).

Es relevante como ejemplo de tecnica de weight editing sin entrenamiento aplicada a un modelo multimodal de 4B, pero el propio autor advierte que el modelo no ha superado las comprobaciones de aceptacion, no se ha evaluado en LIBERO-PRO ni en rollouts de simulador, y nada en la model card indica que la edicion mejore el comportamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B; sin cambios estructurales respecto al base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2 shards), mas config y tokenizer de transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, cuya configuracion, tokenizer, chat template y ambos ficheros de preprocesador son byte-identicos a la revision base, por lo que carga como un Qwen3.5-4B normal, vision incluida. La unica diferencia respecto al base es la edicion de pesos: una actualizacion de bajo rango `W + U V^T` de rango 1 sobre `model.language_model.layers.31.mlp.down_proj.weight` (matriz de 2560 x 9216), con 11.776 parametros de parche. De los 23.592.960 valores bf16 almacenados en ese tensor, se modificaron 11.691.468 (el mayor cambio almacenado fue 0,0123); los otros 737 tensores del checkpoint son byte-identicos al base.

No hubo entrenamiento ni RLHF/DPO. El parche se construyo con aritmetica en float32 (almacenada en bf16) usando exclusivamente minimos cuadrados/ridge en forma cerrada, a partir de 27 filas de practica (el editor contabiliza 128 claves de 27 episodios) recogidas sobre la tarea LIBERO con el harness PyRUA-Lean. La innovacion tecnica es, por tanto, metodologica: edicion directa de pesos guiada por el analisis de activaciones de un agente, sin optimizacion por gradiente, y con verificacion tensor a tensor frente al base mediante sha256 (`wsp-patch/verify.json`).

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con los mismos preprocesadores que el base.
- Modo thinking con bloques de razonamiento y emision de tool calls en formato XML dentro del bloque de thinking.
- La edicion busca que el modelo cierre el bloque de thinking (`</think>`) cuando ya ha escrito un tool call, para que el servidor pueda entregar la llamada.
- Soporte de tool calling / function calling: no disponible como garantia; la model card no aporta evaluacion al respecto.
- Capacidades de agente y razonamiento multi-paso: no disponibles como garantia; el autor no ha validado el comportamiento en el servidor real.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio): vision heredada del base; audio no disponible.

## Casos de uso

- Investigacion sobre weight editing: el repositorio incluye el parche (`wsp-patch/patch.json`, `factors.safetensors`, ~49 kB) y el codigo de aplicacion (`patch.py`, `write_patched_checkpoint.py`), lo que permite reproducir la edicion sobre la revision `851bf6e8` del base y estudiar la tecnica de actualizacion de rango 1 en forma cerrada.
- Estudio de fallos en modo thinking: sirve como caso de analisis de turnos que terminan con `<|im_end|>` sin cerrar el razonamiento, un patron relevante para quienes construyen servidores de agentes que dependen de tool calls.
- Experimentacion con code-as-policy en robotica: el parche se construyo sobre la tarea LIBERO con el harness PyRUA-Lean, por lo que es un punto de partida para replicar el montaje experimental, siempre que se validen antes las comprobaciones de aceptacion pendientes.
- Analisis de estabilidad de checkpoints editados: la comparacion tensor a tensor con sha256 en `wsp-patch/verify.json` y `wsp-patch/wsp-patched-checkpoint.json` permite auditar que solo un tensor difiere del base, util para pipelines de control de calidad de pesos.
- Docencia y divulgacion sobre edicion de pesos: el contraste entre un parche de 11.776 parametros y un modelo de 4.659.865.088 parametros es un ejemplo concreto de intervenciones localizadas en modelos grandes.
- Evaluacion comparativa de metodologias de ajuste: util para comparar edicion cerrada frente a fine-tuning o RLHF en la misma tarea, dado que el autor deja explicito que no se ha demostrado mejora alguna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha pasado las comprobaciones de aceptacion, no se ha probado en los episodios de confirmacion reservados a traves del servidor real y no se ha evaluado en LIBERO-PRO ni en rollouts de simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el checkpoint en bf16 ocupa 9,3 GB en el repositorio, por lo que la inferencia en bf16 requiere al menos esa cantidad de memoria mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion.
- Compatibilidad con GPU de consumo: no disponible. El tamano del checkpoint en bf16 (9,3 GB) sugiere que no cabe en GPUs de 8 GB sin cuantizacion, pero no se aportan datos de cuantizacion ni pruebas.
- Opciones de despliegue: la libreria indicada es transformers; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-4B-wsp-exp0028-p1-p4-final | 4.659.865.088 | no disponible | apache-2.0 | Publicado, sin validacion de aceptacion |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | apache-2.0 | Modelo base de referencia, revision `851bf6e8` |
| Alternativas de ~4B | no disponible | no disponible | no disponible | No se aportan datos de otros modelos comparables |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El autor declara que el modelo no ha superado las comprobaciones de aceptacion y que nada en la model card indica que la edicion mejore el comportamiento.
- No se ha evaluado en los episodios de confirmacion reservados a traves del servidor real, ni en LIBERO-PRO, ni en rollouts de simulador.
- La edicion se construyo con solo 27 filas de practica, un conjunto muy reducido que limita la generalizacion del parche.
- El parche modifica 11.691.468 valores bf16 de un unico tensor con cambios de hasta 0,0123; el efecto sobre el comportamiento fuera del estado objetivo no esta caracterizado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar cobertura multilingue.
- Restricciones de licencia: apache-2.0, con enlace a la licencia del modelo base; no se detallan restricciones adicionales para uso comercial.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- El repositorio incluye un parche anterior de la misma sesion ("P1") que no esta en el repo, lo que puede dificultar la reproduccion completa del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-exp0028-p1-p4-final
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Ficheros del parche en el repositorio: `wsp-patch/patch.json`, `wsp-patch/factors.safetensors`, `wsp-patch/patch.py`, `wsp-patch/write_patched_checkpoint.py`, `wsp-patch/verify.json`, `wsp-patch/wsp-patched-checkpoint.json`
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
