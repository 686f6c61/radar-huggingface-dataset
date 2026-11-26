# loom-draft/presencesw-Qwen3-Omni-30B-A3B-Captioner-loom

## Resumen
El paquete `loom-draft/presencesw-Qwen3-Omni-30B-A3B-Captioner-loom` es una distribucion en formato Loom (programas `.loom` y una tarjeta `model.json`) generada con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `presencesw/Qwen3-Omni-30B-A3B-Captioner-GGUF`, en concreto del fichero `Qwen3-Omni-30B-A3B-Captioner-Q4_K_M.gguf`. No se trata de un modelo entrenado desde cero, sino de un empaquetado de inferencia orientado a GPUs AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un derivado de Qwen3-Omni, la familia omni-modal de Alibaba Qwen, en su variante "Captioner" de 30B totales con 3B activos (arquitectura MoE, segun la nomenclatura A3B). El paquete anade un proyector multimodal `mmproj-Qwen3-Omni-30B-A3B-Captioner-BF16.gguf` para entrada de imagen y expone una API compatible con OpenAI a traves de `loom-serve`.

La relevancia de esta ficha es acotada: se publica bajo licencia MIT, con cero descargas y cero likes en el momento de la consulta, y las mediciones de rendimiento y correctitud del autor figuran como "not yet re-measured" para ambas GPUs. Es, por tanto, un artefacto de despliegue experimental para hardware AMD, no una referencia de calidad validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de Qwen3-Omni; nomenclatura A3B) |
| Parametros totales | 30B (segun el nombre del checkpoint) |
| Parametros activos | 3B (segun el nombre del checkpoint) |
| Longitud de contexto | 65.536 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Qwen3-Omni-30B-A3B-Captioner-Q4_K_M.gguf`) + proyector `mmproj-Qwen3-Omni-30B-A3B-Captioner-BF16.gguf`; paquete Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento
El paquete no documenta el entrenamiento del modelo subyacente: la model card se limita a describir el empaquetado para Loom y no aporta numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo unico verificable es la arquitectura declarada en el nombre del checkpoint: un modelo de mezcla de expertos con 30B parametros totales y 3B activos por token, heredero de la familia Qwen3-Omni, que en su version original es omni-modal (texto, imagen y audio).

La innovacion tecnica de este artefacto no esta en el modelo, sino en el runtime: `loom-next` genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` expone un servidor compatible con `/v1/chat/completions`. El paquete soporta razonamiento con modo thinking activado por defecto (desactivable con `chat_template_kwargs: {"enable_thinking": false}`), entrada de imagen via `image_url` y tool calling estilo OpenAI. La decodificacion especulativa figura como no aplicable y el soporte de audio esta explicitamente ausente en Loom, aunque el modelo original lo tenga.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto de hasta 65.536 tokens por peticion.
- Razonamiento con modo thinking activado por defecto; se puede desactivar por peticion.
- Entrada de imagen (image-text-to-text) mediante el proyector multimodal BF16, con particulas `image_url` estilo OpenAI.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), incluido bucle de agente multi-turno segun las puertas de correctitud declaradas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de audio de entrada ni de salida en este runtime.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Descripcion automatica de imagenes en pipelines de catalogacion: el modelo acepta `image_url` y genera texto descriptivo; adecuado para etiquetar lotes de imagenes en un servidor con GPU AMD Radeon AI PRO R9700.
- Asistentes conversacionales con contexto largo: la ventana de 65.536 tokens permite mantener historiales extensos o adjuntar documentos largos en una sola peticion.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle de agente permiten construir asistentes que consultan APIs internas sin salir del entorno del cliente.
- Procesamiento de documentos escaneados con imagen y texto: combinando entrada visual y contexto largo se pueden extraer resumenes de formularios o capturas.
- Despliegue en estaciones de trabajo AMD: pensado para equipos con Strix Halo o R9700, evita depender de CUDA y permite inferencia local con pesos Q4_K_M.
- Prototipado de razonamiento con modo thinking: util para experimentar con cadenas de razonamiento activadas o desactivadas por peticion en tareas de analisis.
- Evaluacion de runtimes alternativos: sirve como banco de pruebas para comparar `loom-serve` frente a llama.cpp con el mismo GGUF, aunque las mediciones publicadas aun no estan disponibles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que los resultados "are not yet re-measured". Lo mismo ocurre con las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`), todas marcadas como no remedidas.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el checkpoint Q4_K_M de un modelo de 30B totales ronda los 18-20 GB de pesos, mas el proyector BF16, aunque el autor no publica la cifra.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado exclusivamente para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Captioner (GGUF base) | 30B totales / 3B activos | no disponible en la informacion | no disponible | Hugging Face (`presencesw/...`) |
| Este paquete Loom | 30B totales / 3B activos | 65.536 tokens | MIT | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Artefacto sin validacion publicada: cero descargas, cero likes y todas las puertas de correctitud y rendimiento sin remedir.
- Sin soporte de audio en Loom, pese a que el modelo Qwen3-Omni original es omni-modal; no debe asumirse paridad funcional con el checkpoint upstream.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens, lo que restringe escenarios de alto throughput.
- Solo soportado en las GPUs AMD gfx1151 y gfx1201 declaradas; no hay garantia de funcionamiento en otras arquitecturas.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente fuera de los idiomas principales del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicadas.
- Licencia MIT declarada en el paquete, pero la licencia del checkpoint base (`presencesw/Qwen3-Omni-30B-A3B-Captioner-GGUF`) no se detalla en la informacion disponible; conviene verificarla antes de uso comercial.
- El modo thinking esta activado por defecto, lo que incrementa latencia y consumo de tokens si no se desactiva explicitamente.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/loom-draft/presencesw-Qwen3-Omni-30B-A3B-Captioner-loom
- Checkpoint base GGUF: https://huggingface.co/presencesw/Qwen3-Omni-30B-A3B-Captioner-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
