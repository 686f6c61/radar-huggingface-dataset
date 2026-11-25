# loom-draft/mamelles-Qwen3.5-2B-Wolof-Instruct-v1-loom

## Resumen

El repositorio `loom-draft/mamelles-Qwen3.5-2B-Wolof-Instruct-v1-loom` no contiene un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y un fichero `model.json`) generado con la herramienta `loom-next` para servir el checkpoint GGUF preexistente `mamelles/Qwen3.5-2B-Wolof-Instruct-v1-GGUF`, en su cuantizacion Q4_K_M. El modelo subyacente es un ajuste fino de la familia Qwen3.5 orientado a wolof e instrucciones, con aproximadamente 2.000 millones de parametros segun la nomenclatura del identificador.

La relevancia de este artefacto es de infraestructura, no de investigacion: empaqueta un modelo pequeno para ejecutarse en GPUs AMD concretas, la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), a traves del runtime `hrx-loom` 0.2.0 con una API compatible con OpenAI. El paquete expone tool calling, modo de razonamiento opcional y una ventana de contexto declarada de 262.144 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB y no declara licencia, idiomas ni pipeline. La model card indica explicitamente que las medidas de rendimiento frente a llama.cpp y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, entre otras) no se han vuelto a medir para este paquete, por lo que no existe evidencia publicada de su comportamiento numerico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo subyacente de la familia Qwen3.5, transformer; detalles no declarados en la informacion disponible) |
| Parametros totales | Aproximadamente 2.000 millones (deducido del identificador `Qwen3.5-2B`; no confirmado en la model card) |
| Parametros activos | No aplica (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom sirve esa unica cuantizacion |
| Idiomas soportados | No disponible (el identificador sugiere wolof e instrucciones en ingles; no declarado) |
| Licencia | No disponible |
| Formato de pesos | GGUF (checkpoint `Qwen3.5-2B-Wolof-Instruct-v1-Q4_K_M.gguf`) empaquetado como paquete Loom (`.loom` + `model.json` + `model.json.lock`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo subyacente ni su proceso de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineacion. Lo unico verificable es que el checkpoint base es un ajuste fino de instrucciones de Qwen3.5 de 2B orientado a wolof, distribuido en GGUF y consumido aqui sin modificacion ("unmodified GGUF checkpoint") en cuantizacion Q4_K_M.

La contribucion tecnica del paquete es la generacion automatica de kernels y programas `.loom` mediante `loom-next`, sin LLM en el bucle, para dos objetivos AMD: gfx1151 (Strix Halo) y gfx1201 (R9700). El runtime ofrece decodificacion con espera activa de completions en GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). No hay decodificacion especulativa ni esfuerzo de razonamiento configurable: ambas filas aparecen como "not applicable".

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia y API estilo OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y emite `tool_calls`, con soporte de bucles multi-turno segun la puerta `agent`.
- Modo de razonamiento opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo: 262.144 tokens por peticion, adecuado para documentos extensos y conversaciones prolongadas.
- Concurrencia de 4 peticiones simultaneas con consistencia declarada entre ejecuciones concurrentes y aisladas (puerta `consistency`).
- Capacidades multilingues: no disponibles; el identificador apunta a wolof, pero no se declara cobertura de idiomas.
- Sin entrada de imagen ni audio: las filas `image input` y `audio input / output` figuran como "not applicable".
- Muestreo (`temperature`, `top_k`, semilla): estado "not determined" en la model card.

## Casos de uso

- Asistente conversacional en wolof para dispositivos con GPU AMD: el modelo puede atender dialogos multi-turno gracias a los 262.144 tokens de contexto y a la API compatible con OpenAI, desplegado con `loom-serve` en Strix Halo o R9700.
- Agente con herramientas en local: con tool calling activo y 4 peticiones concurrentes, encaja en flujos de automatizacion que consultan APIs internas o bases de datos sin salir del equipo.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o extraer informacion de contratos, informes o transcripciones en una sola peticion, con un limite de 4.096 tokens de salida por respuesta.
- Prototipado en hardware de consumo profesional: al ser un modelo de 2B en Q4_K_M, cabe holgadamente en los 32 GB de la R9700 y en la memoria unificada de Strix Halo, lo que permite iterar sin GPU de datacenter.
- Evaluacion de la cadena de herramientas Loom: el paquete sirve como banco de pruebas para validar kernels generados, plantillas de chat y bucles de tool calling frente a la referencia de llama.cpp.
- Traduccion y asistencia linguistica para wolof: un ajuste de instrucciones de 2B es viable para tareas de traduccion acotadas o generacion de texto en ese idioma, siempre que se valide la calidad con datos propios.
- Despliegue embebido con API local: util para integrar un endpoint compatible con OpenAI en pipelines de CI/CD o herramientas internas que ya hablan ese protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comparativas de rendimiento frente a llama.cpp para Strix Halo y R9700 "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas.

## Requisitos de hardware

- VRAM estimada: un modelo de 2B en Q4_K_M ocupa del orden de 1,5-2 GB de pesos; el runtime reserva ademas pool de memoria fijo y buffers de contexto, por lo que el consumo real no esta publicado.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: el paquete esta generado especificamente para esos dos objetivos AMD; no se declara compatibilidad con otras GPU, incluidas las de NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativa de referencia: llama.cpp sobre el mismo GGUF, usado por el autor como patron de correccion.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han medido para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| mamelles/Qwen3.5-2B-Wolof-Instruct-v1 (GGUF) | ~2B | No disponible en la informacion | GGUF para llama.cpp y similares | No disponible | Checkpoint original sin empaquetar; referencia de correccion del paquete Loom |
| loom-draft/mamelles-Qwen3.5-2B-Wolof-Instruct-v1-loom | ~2B | 262.144 tokens | Paquete Loom para gfx1151 y gfx1201 | No disponible | Objeto de esta ficha; mismo checkpoint en Q4_K_M con runtime `hrx-loom` |
| Qwen3.5-2B base (familia Qwen) | ~2B | No disponible en la informacion | Multiples formatos | No disponible | Modelo generalista del que deriva el ajuste; sin datos de rendimiento en la informacion |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- No se declara licencia: no hay base explicita para uso comercial; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Sin evidencia de correccion: todas las puertas de validacion del paquete figuran como no medidas, por lo que no hay garantia publicada de equivalencia con llama.cpp.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni similares para el modelo ajustado.
- Riesgo de alucinacion: propio de un modelo de 2B en cuantizacion Q4; no cuantificado en la informacion disponible.
- Cobertura linguistica incierta: no se declaran idiomas soportados; el wolof aparece solo en el identificador.
- Sesgos: no documentados.
- Compatibilidad restringida: el paquete esta generado para gfx1151 y gfx1201; no se garantiza su funcionamiento en otras GPU AMD ni en NVIDIA.
- Limite de salida: 4.096 tokens por respuesta, lo que restringe tareas de generacion larga pese al contexto de 262.144 tokens.
- Estado del muestreo indeterminado ("not determined"), lo que afecta a la reproducibilidad de la generacion.
- Repositorio sin traccion: 0 descargas y 0 likes, sin senales de uso o validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mamelles-Qwen3.5-2B-Wolof-Instruct-v1-loom
- Modelo base en Hugging Face: https://huggingface.co/mamelles/Qwen3.5-2B-Wolof-Instruct-v1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
