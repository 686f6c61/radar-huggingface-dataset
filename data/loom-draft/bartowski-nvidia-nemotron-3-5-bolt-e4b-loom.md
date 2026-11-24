# loom-draft/bartowski-NVIDIA-Nemotron-3.5-Bolt-E4B-loom

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo multimodal (texto e imagen) de NVIDIA distribuido en formato GGUF por bartowski. El repositorio analizado, `loom-draft/bartowski-NVIDIA-Nemotron-3.5-Bolt-E4B-loom`, no contiene pesos nuevos: es un paquete de despliegue para el runtime Loom de AMD, generado automáticamente con la herramienta `loom-next` a partir del checkpoint cuantizado `NVIDIA-Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`. Su función es empaquetar programas `.loom` y una tarjeta `model.json` que permiten servir el modelo en GPUs AMD concretas.

El modelo subyacente pertenece a la familia Nemotron de NVIDIA y, por la nomenclatura "E4B", se infiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos, aunque la información disponible no confirma el total de parámetros ni los detalles de entrenamiento. El paquete declara soporte de visión mediante un proyector `mmproj-NVIDIA-Nemotron-3.5-Bolt-E4B-bf16.gguf`, tool calling estilo OpenAI y un modo de razonamiento opcional desactivado por defecto.

Su relevancia es acotada pero específica: ofrece una vía para ejecutar un modelo multimodal de NVIDIA sobre hardware AMD (Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700) mediante el stack Loom, con una API compatible con OpenAI. No obstante, el propio repositorio indica que las mediciones de rendimiento y las puertas de corrección aún no se han vuelto a medir, por lo que su validación en producción está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "E4B" sugiere MoE con ~4B parámetros activos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (aproximadamente 4B según el sufijo E4B) |
| Longitud de contexto | 65.536 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (más proyector mmproj GGUF bf16) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El sufijo "E4B" en la nomenclatura de NVIDIA es coherente con un diseño de mezcla de expertos (MoE) de unos 4.000 millones de parámetros activos, pero el repositorio no confirma el número total de parámetros, el número de expertos ni la estrategia de enrutamiento. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí se especifica es el modo de razonamiento: el modelo incorpora un modo "thinking" que se activa mediante `chat_template_kwargs: {"enable_thinking": true}` y que está desactivado por defecto. El paquete no implementa decodificación especulativa (marcada como "not applicable") ni niveles configurables de esfuerzo de razonamiento. La integración multimodal se realiza mediante un proyector separado en bf16 que traduce las imágenes a tokens de prompt.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" opcional, activable por petición y desactivado por defecto.
- Entrada de imágenes mediante partes `image_url` estilo OpenAI, procesadas por el proyector `mmproj-NVIDIA-Nemotron-3.5-Bolt-E4B-bf16.gguf`.
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Soporte de bucles de tool calling multi-turno (la tarjeta incluye puertas de corrección específicas para agentes, aunque sin mediciones registradas).
- Servicio de hasta 4 peticiones concurrentes con una ventana de 65.536 tokens por petición.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- API compatible con `/v1/chat/completions` de OpenAI.
- Entrada y salida de audio: no determinado.
- Muestreo (temperatura, top_k, semilla): no determinado en la tarjeta.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo acepta imágenes y texto en la misma conversación, por lo que puede emplearse para describir capturas de pantalla, diagramas o documentos escaneados sin salir del hardware del usuario, con una ventana de 65.536 tokens.
- Automatización de soporte técnico con imágenes: un usuario adjunta una captura de error y el modelo la interpreta junto con el historial de la conversación, manteniendo contexto largo gracias a la ventana de 65k tokens y al soporte multi-turno.
- Agentes con herramientas sobre hardware AMD: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas, ejecuten búsquedas o recuperen datos, desplegados en Strix Halo o R9700 mediante `loom-serve`.
- Procesamiento de documentos con componentes visuales: extracción de información de facturas, formularios o gráficos combinando entrada de imagen y razonamiento activado bajo demanda.
- Razonamiento por lotes con modo thinking: tareas de análisis o resolución de problemas donde se activa `enable_thinking` solo en las peticiones que lo requieren, manteniendo el resto con latencia menor al estar desactivado por defecto.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete está pensado para GPUs AMD (gfx1151 y gfx1201), lo que permite servir el modelo en entornos donde no hay GPUs NVIDIA, usando el runtime Loom con API compatible con OpenAI.
- Prototipado de asistentes con visión en entornos de desarrollo: al ser un paquete reproducible generado por `loom-next`, facilita montar un servidor local de pruebas con `pipx install "hrx-loom[hf]==0.2.0"` y validar flujos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del repositorio indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete. Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M y el proyector de visión va en bf16, pero la tarjeta no publica el tamaño exacto en GB (el repositorio figura con 0,0 GB, lo que sugiere que los pesos no están alojados en él).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no confirmada; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de servicio para este paquete (llama.cpp se usa solo como referencia de corrección).
- Opciones de servicio: `--pool_backing=fixed` (reserva fija de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, usada en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B (este paquete) | no disponible (~4B activos) | 65.536 | Sí | Sí | MIT | Paquete Loom para AMD |
| Checkpoint base bartowski/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | no disponible | no disponible | Sí (proyector) | no disponible | MIT (según este paquete) | Hugging Face, GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las puertas de corrección y las mediciones de rendimiento del paquete no se han vuelto a medir; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta integración.
- El repositorio no aloja los pesos (tamaño de 0,0 GB): el paquete descarga el GGUF desde el checkpoint base, por lo que depende de su disponibilidad.
- El límite de salida es de 4.096 tokens por petición y la concurrencia máxima es de 4 peticiones, lo que restringe cargas de trabajo de alto paralelismo.
- El modo de razonamiento está desactivado por defecto; activarlo incrementa el consumo de tokens y la latencia.
- No se documentan los idiomas soportados ni los sesgos conocidos del modelo base.
- El soporte de audio y el comportamiento del muestreo figuran como "no determinado".
- Aunque la licencia declarada es MIT, conviene verificar las condiciones del modelo base de NVIDIA antes de un uso comercial, ya que este paquete solo empaqueta el checkpoint.
- El despliegue está restringido al runtime Loom y a las GPUs AMD indicadas; no se documenta compatibilidad con otros backends.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-NVIDIA-Nemotron-3.5-Bolt-E4B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
