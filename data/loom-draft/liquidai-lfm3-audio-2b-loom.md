# loom-draft/LiquidAI-LFM3-Audio-2B-loom

## Resumen

LiquidAI-LFM3-Audio-2B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar LiquidAI/LFM3-Audio-2B-GGUF, concretamente la cuantización `LFM3-Audio-2B-Q4_K_M.gguf`. Lo publica el usuario loom-draft y esta pensado especificamente para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con la herramienta loom-next, un generador de kernels que no emplea un LLM en el bucle.

El modelo subyacente es LFM3-Audio-2B de Liquid AI, un modelo de aproximadamente 2.000 millones de parametros que, segun la model card, admite entrada de imagen y de audio en su version original. Sin embargo, el runtime Loom del que depende este paquete no soporta ni vision ni audio, de modo que la funcionalidad efectiva queda reducida a chat de texto con tool calling sobre una API compatible con OpenAI.

La relevancia de este artefacto es acotada: no es un modelo nuevo ni un fine-tune, sino una distribucion empaquetada para acelerar la inferencia de un GGUF existente en hardware AMD mediante kernels generados. Las mediciones de rendimiento y las puertas de correccion de este paquete concreto aparecen como "not yet re-measured" en la model card, por lo que no hay evidencia publicada de su comportamiento numerico frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Audio-2B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | aproximadamente 2.000 millones (por el nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base LiquidAI/LFM3-Audio-2B-GGUF) |
| Formato de pesos | GGUF empaquetado como programas Loom (`.loom`) con `weights.loom`, `tokenizer.json`, `llm_config.json`, `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3-Audio-2B en la documentacion proporcionada: no se detalla si emplea un transformer denso, una mezcla de expertos o un esquema hibrido, ni se indican volumen de tokens de entrenamiento, composicion del dataset o tecnicas de alineamiento como RLHF o DPO. La model card del paquete Loom se limita a describir el proceso de empaquetado, no las caracteristicas del modelo original.

La innovacion tecnica de este artefacto no reside en el modelo, sino en el pipeline de despliegue: loom-next genera programas `.loom` y kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF y de `llm_config.json`, sin intervencion de un LLM. El runtime Loom expone una API compatible con OpenAI (`/v1/chat/completions`), admite 4 peticiones concurrentes, un maximo de 4.096 tokens de salida por preset y tool calling estilo OpenAI. No implementa decodificacion especulativa, modo de razonamiento ni ajuste de esfuerzo de razonamiento, y descarta por completo las entradas de imagen y audio que el modelo original soporta.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling estilo OpenAI, con campos `tools` y `tool_calls`.
- Bucles de tool calling multi-turno (segun la puerta de correccion `agent` descrita en la model card).
- Contexto largo: hasta 128.000 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida limitada a 4.096 tokens por preset (`max_tokens`).
- Sin modo de razonamiento ni thinking: marcado como "not applicable".
- Sin decodificacion especulativa: marcada como "not applicable".
- Entrada de imagen: no soportada por Loom, aunque el modelo original la admite.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las admite.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (sampling): estado "not determined" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional de texto en local sobre GPU AMD: el paquete se sirve con `loom-serve` y responde en `/v1/chat/completions`, lo que permite integrarlo como backend de chat en estaciones de trabajo con Strix Halo o R9700 sin depender de CUDA.
- Automatizacion de agentes con tool calling: la puerta `agent` de la model card describe bucles multi-turno con renderizado exacto del prompt, reutilizacion de historico y validacion de llamadas a herramientas, lo que encaja en orquestadores que necesiten invocar funciones externas via API compatible con OpenAI.
- Procesamiento de documentos largos: con 128.000 tokens de contexto por peticion, el modelo puede recibir expedientes, informes o bases de codigo extensas en una sola llamada, util en tareas de resumen y extraccion sobre corpus de gran tamano.
- Servicio concurrente de baja escala: al admitir 4 peticiones simultaneas, es adecuado para equipos pequenos o entornos de desarrollo donde varias personas comparten una unica GPU AMD.
- Evaluacion de la cadena de herramientas Loom: al ser un paquete generado con loom-next y con puertas de correccion definidas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`), sirve como banco de pruebas para validar la fidelidad numerica del runtime frente a llama.cpp sobre el mismo GGUF.
- Despliegue en hardware AMD profesional: la Radeon AI PRO R9700 con 32 GB permite cargar el GGUF Q4_K_M y servirlo con `--pool_backing=fixed` y `--parameter_mode=preload`, escenario util para prototipos en entornos ROCm sin infraestructura NVIDIA.
- Integracion en pipelines internos via HTTP: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, puede conectarse a frameworks que ya consumen ese contrato (clientes de chat, orquestadores, herramientas de evaluacion) sin adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el GGUF es Q4_K_M sobre un modelo de aproximadamente 2.000 millones de parametros, y la model card menciona una Radeon AI PRO R9700 con 32 GB como plataforma de destino, pero no publica cifras de consumo de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete esta generado para las arquitecturas AMD citadas y no se documenta soporte para otras.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/LiquidAI-LFM3-Audio-2B-loom:chat --materialize=copy --output=lfm3-audio-2b` y `loom-serve --model=lfm3-audio-2b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Opciones de runtime documentadas: `--materialize=copy` (copia los ficheros del paquete en el directorio de salida), `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (compromiso previo del pool de memoria) y `--parameter_mode=preload` (cambia solo la carga de pesos en host).
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card no han sido re-medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria, y la model card no ofrece comparaciones con otros modelos. La unica referencia de comparacion mencionada es llama.cpp, usado como linea base de correccion numerica sobre el mismo GGUF, pero sin cifras publicadas para este paquete.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo ni un fine-tune: redistribuye el GGUF `LFM3-Audio-2B-Q4_K_M.gguf` de LiquidAI/LFM3-Audio-2B-GGUF en formato Loom, por lo que hereda las limitaciones del modelo base.
- Vision no soportada: la model card indica explicitamente que Loom no admite entrada de imagen, aunque el modelo original la tiene.
- Audio no soportado: la entrada y salida de audio del modelo original quedan deshabilitadas en este runtime.
- Sin modo de razonamiento ni thinking, y sin decodificacion especulativa: ambos marcados como "not applicable".
- Estado de muestreo indeterminado: la tabla de caracteristicas marca `sampling` como "not determined".
- Ausencia de evidencia de correccion: todas las puertas de correccion figuran como "not yet re-measured" en ambas plataformas, de modo que no hay verificacion publicada de que la salida coincida con llama.cpp.
- Ausencia de mediciones de rendimiento: no hay datos de latencia ni throughput para ninguna de las dos GPU objetivo.
- Licencia "other": las condiciones exactas no estan detalladas en la informacion disponible; es necesario consultar la licencia del modelo base LiquidAI/LFM3-Audio-2B-GGUF antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingue.
- Hardware restringido: el paquete esta generado para gfx1151 y gfx1201; no se documenta compatibilidad con otras GPU, incluidas las de NVIDIA.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al tratarse de un modelo de aproximadamente 2.000 millones de parametros, cabe esperar menor robustez que en modelos de mayor escala, pero no hay datos que lo confirmen.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por preset, lo que acota el uso en produccion de alto volumen.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- [Hugging Face: loom-draft/LiquidAI-LFM3-Audio-2B-loom](https://huggingface.co/loom-draft/LiquidAI-LFM3-Audio-2B-loom)
- [Modelo base: LiquidAI/LFM3-Audio-2B-GGUF](https://huggingface.co/LiquidAI/LFM3-Audio-2B-GGUF)
- [Repositorio del runtime: ROCm/hrx-system](https://github.com/ROCm/hrx-system)
- [Generador loom-next: loom-fun/loom-next](https://github.com/loom-fun/loom-next)
- [Sitio del ecosistema Loom](https://loom-fun.github.io/loom-dev/)
