# loom-fun-staging/quark75-Qwen3.8-27B-MXFP4-loom

## Resumen
El paquete `loom-fun-staging/quark75-Qwen3.8-27B-MXFP4-loom` es una distribucion empaquetada para el ecosistema Loom (herramientas `loom-fetch` y `loom-serve` de hrx-loom) del checkpoint GGUF `quark75/Qwen3.8-27B-MXFP4-GGUF`, un modelo multimodal de tipo image-text-to-text de 27B parametros en cuantizacion MXFP4. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: contiene programas `.loom` generados, un `model.json` con la configuracion y el tokenizador, apuntando a los pesos originales del checkpoint base.

El objetivo es servir el modelo en hardware AMD especifico: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento configurable, decodificacion especulativa MTP con profundidad 3 e entrada de imagenes mediante un proyector separado. La ventana de contexto nativa es de 262.144 tokens, aunque en la R9700 el preset la limita a 134.144 por restricciones de memoria.

Es relevante porque demuestra un flujo de despliegue especifico para ROCm/AMD fuera de las rutas habituales (llama.cpp, vLLM), con verificacion de integridad por sha256 y una bateria de gates de correccion. No obstante, el propio autor indica que las metricas de rendimiento y los gates de correccion aun no se han re-medido para este paquete, por lo que la evidencia empirica es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; transformer multimodal con proyector de vision, sin detalle adicional) |
| Parametros totales | 27B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; 134.144 tokens por peticion en Radeon AI PRO R9700 |
| Tipos de cuantizacion | MXFP4 (GGUF); proyector de vision en f16 (`mmproj-Qwen3.8-27B-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint base); paquete Loom con programas `.loom`, `model.json`, `tokenizer.json`, `llm_config.json` |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens procesados ni las fases de alineacion (RLHF/DPO) del modelo base `quark75/Qwen3.8-27B-MXFP4-GGUF`. El nombre sugiere un modelo de la familia Qwen3.8 con 27B parametros, pero la model card no confirma detalles de la arquitectura (transformer denso, MoE, hibrido) ni de su composicion del dataset.

La innovacion tecnica documentada en este paquete es de despliegue, no de entrenamiento: decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3 activada por defecto, un proyector de vision separado en f16 para entrada de imagenes, y una capa de programas `.loom` generados a partir de `llm_config.json` que se ejecutan sobre ROCm. El paquete incluye `model.json.lock` con sha256 de los ficheros fuente, verificado por `loom-fetch`.

## Capacidades
- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agente.
- Entrada de imagenes mediante partes `image_url` estilo OpenAI, usando el proyector `mmproj-Qwen3.8-27B-f16.gguf`.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- Audio: no aplicable segun la model card.
- Capacidades multilingues: no disponible.

## Casos de uso
- Asistente conversacional con contexto largo: con 262.144 tokens nativos (134.144 en R9700) puede mantener conversaciones multi-turno sobre documentos extensos o historiales completos sin truncar, usando la API compatible con OpenAI.
- Analisis de imagenes en flujos de trabajo: la entrada `image_url` permite enviar capturas, diagramas o documentos escaneados junto a instrucciones de texto para extraccion de informacion o descripcion.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y los gates `agent` y `agent_think_off` del paquete lo orientan a bucles de agente multi-paso con renderizado exacto del prompt e historial reutilizado.
- Razonamiento con esfuerzo configurable: en tareas de analisis o matematicas se puede fijar `reasoning_effort` en xhigh para maxima profundidad, o en low para respuestas rapidas en produccion.
- Despliegue en estaciones AMD: pensado para servir en Ryzen AI Max+ 395 "Strix Halo" o Radeon AI PRO R9700, util en entornos donde no hay GPUs NVIDIA y se quiere una API OpenAI local.
- Procesamiento por lotes con concurrencia moderada: 4 peticiones concurrentes con salida de hasta 4.096 tokens encajan en tareas de clasificacion, resumen o extraccion sobre lotes pequenos.
- Inferencia acelerada por decodificacion especulativa: el MTP con profundidad 3 reduce el coste por token en generacion larga, adecuado para asistentes interactivos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comparativas frente a llama.cpp en Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han re-medido todavia", y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita. El ejemplo de servicio en Strix Halo usa `--memory_bytes=49000000000` (aproximadamente 49 GB de memoria). En la R9700 (32 GB) el preset limita el contexto a 134.144 tokens.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para NVIDIA ni otras GPU.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el paquete esta orientado a las dos plataformas AMD citadas.
- Opciones de despliegue: `loom-fetch` para descargar el paquete y `loom-serve` para servirlo, instalando `hrx-loom[hf]`. El servidor escucha en `127.0.0.1:8080` y expone `/v1/chat/completions`. Presets: `chat` (Strix Halo) y `chat-r9700` (R9700, con `pool_backing=fixed`).
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| quark75-Qwen3.8-27B-MXFP4-loom (este) | 27B | 262.144 (134.144 en R9700) | GGUF + paquete Loom | no disponible | Solo AMD Strix Halo / R9700; gates sin re-medir |
| quark75/Qwen3.8-27B-MXFP4-GGUF (base) | 27B | no disponible | GGUF | no disponible | Checkpoint original, sin empaquetado Loom |
| Alternativas de 27B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria; los datos de rendimiento y licencia del modelo base no estan publicados en la informacion disponible.

## Limitaciones y advertencias
- Ausencia total de evidencia empirica: todos los gates de correccion y las comparativas de rendimiento frente a llama.cpp figuran como no re-medidos, por lo que no hay garantia publicada de equivalencia numerica.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Idiomas no disponibles: no se puede verificar el soporte multilingue ni la calidad por idioma.
- Hardware restringido: el paquete esta atado a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en otras plataformas.
- Contexto reducido en R9700: 134.144 tokens frente a los 262.144 nativos por limitaciones de los 32 GB de memoria.
- Salida limitada a 4.096 tokens por peticion y concurrencia de 4 peticiones, lo que restringe cargas de alta demanda.
- Riesgo de alucinacion y sesgos: no documentado en la model card; al ser un modelo de 27B en cuantizacion MXFP4, cabe esperar degradacion respecto a precision completa, aunque no se aportan mediciones.
- Estado de staging: el autor es `loom-fun-staging`, con 0 descargas y 0 likes, lo que sugiere un artefacto en fase temprana y no validado por la comunidad.
- Dependencia de versiones concretas: hrx-loom `0.0.0.dev0` y loom-skills `6581225`, con posible inestabilidad de API.

## Enlaces
- Hugging Face del paquete: https://huggingface.co/loom-fun-staging/quark75-Qwen3.8-27B-MXFP4-loom
- Checkpoint base: https://huggingface.co/quark75/Qwen3.8-27B-MXFP4-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
