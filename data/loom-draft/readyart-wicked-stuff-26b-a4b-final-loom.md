# loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-Final-loom

## Resumen

ReadyArt-Wicked-Stuff-26B-A4B-Final-loom es un paquete de despliegue en formato Loom (`.loom` y un fichero `model.json`) generado por el usuario `loom-draft` para servir el checkpoint GGUF sin modificar `ReadyArt/Wicked-Stuff-26B-A4B-Final-GGUF`. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado orientado a GPUs AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next`, que según la model card opera como generador sin intervención de un LLM en el bucle.

El modelo subyacente se denomina "26B-A4B", lo que sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, aunque esta interpretación no se confirma en la información disponible. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto de 201.728 tokens por petición con hasta 4 peticiones concurrentes.

La relevancia actual del artefacto es acotada: se publica como borrador (cero descargas y cero likes en el momento de la consulta), el repositorio pesa 0,0 GB y las mediciones de rendimiento y de corrección numérica figuran como "not yet re-measured" para ambas GPUs objetivo. Es, por tanto, un paquete de integración en fase temprana, útil para quien quiera evaluar el stack Loom sobre hardware AMD con este checkpoint concreto, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "26B-A4B" sugiere MoE con ~4B activos, sin confirmar) |
| Parametros totales | 26B (según denominación del checkpoint base; no verificado) |
| Parametros activos | ~4B (según denominación "A4B"; no verificado) |
| Longitud de contexto | 201.728 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (fichero `Wicked-Stuff-26B-A4B-Final.i1-Q4_K_M_hb16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |

Otros datos operativos del paquete: máximo de tokens de salida 4.096 (preset `max_tokens`), concurrencia de 4 peticiones, modo thinking desactivado por defecto, sin decodificación especulativa y sin soporte de entrada de imagen ni audio en Loom (aunque el modelo upstream sí las tendría).

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna del checkpoint base ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). El nombre "26B-A4B" apunta a un transformer con mezcla de expertos de 26B totales y ~4B activos, patrón habitual en modelos tipo Qwen3-MoE o similares, pero se trata de una inferencia a partir de la nomenclatura y no de un dato confirmado.

Lo que sí está documentado es la capa de despliegue: el paquete contiene kernels generados por `loom-next` para las arquitecturas AMD gfx1151 y gfx1201, junto con un conjunto de pruebas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. En la versión publicada, ninguna de esas puertas tiene medición registrada para este paquete, por lo que no existe evidencia publicada de equivalencia numérica con llama.cpp.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling / function calling con el esquema OpenAI (`tools` y `tool_calls`).
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Bucles de agente multi-turno con tool calling, según la puerta de corrección `agent` definida en el paquete.
- Contexto largo de hasta 201.728 tokens por petición, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Sin soporte de imagen ni audio en Loom, pese a que el modelo upstream los tendría según la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación del stack Loom sobre AMD: servir el paquete con `loom-serve` en Strix Halo o R9700 para medir latencia, throughput y estabilidad de los kernels generados frente a llama.cpp, que es precisamente el propósito declarado del artefacto.
- Asistente conversacional local con contexto largo: la ventana de 201.728 tokens permite cargar documentación técnica extensa o historiales de conversación largos en una sola petición, sin recuperación externa.
- Automatización con herramientas en local: el soporte de `tools`/`tool_calls` permite conectar el modelo a funciones internas (consulta de bases de datos, ejecución de scripts) en un despliegue on-premise sin salida a la nube.
- Procesamiento por lotes de documentos: con 4 peticiones concurrentes y contexto de ~200k tokens, se pueden resumir o extraer datos de contratos, informes o expedientes en un equipo con GPU AMD de 32 GB.
- Modo razonamiento para tareas analíticas: activando `enable_thinking` se obtiene una traza de razonamiento previa a la respuesta, útil en tareas de análisis o depuración de lógica, a costa de mayor latencia y consumo de tokens.
- Banco de pruebas de cuantización Q4_K_M: comparar la calidad de este GGUF Q4_K_M frente a otras cuantizaciones del mismo checkpoint base en tareas concretas del dominio propio.
- Desarrollo sobre hardware de escritorio AMD: prototipar agentes y asistentes en una estación con Radeon AI PRO R9700 sin depender de CUDA ni de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de 26B totales, lo que en la práctica sitúa los pesos en el rango de ~15-16 GB, aunque este cálculo no aparece en la documentación y debe tomarse como estimación, no como dato del autor.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs NVIDIA: no documentada; el paquete está generado específicamente para arquitecturas AMD gfx1151 y gfx1201.
- Cabe en GPU de consumo: no confirmado; la R9700 es una GPU profesional de 32 GB, no una consumer.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalación vía pipx), `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Flags relevantes: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de la card).
- Latencia y throughput: no disponibles; las filas de rendimiento están pendientes de remedición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables, y las métricas del paquete Loom están sin medir. Como referencia estructural, el artefacto se posiciona frente a servir el mismo GGUF con llama.cpp sobre las mismas GPUs AMD, que es la comparación que la propia model card declara pendiente.

| Criterio | Este paquete (Loom) | llama.cpp (referencia) |
|---|---|---|
| Pesos | GGUF Q4_K_M empaquetado en `.loom` | GGUF Q4_K_M original |
| Contexto por petición | 201.728 tokens | no disponible en la información |
| Tool calling | Sí (esquema OpenAI) | no disponible en la información |
| Rendimiento medido | Pendiente | Referencia usada por el autor, sin cifras publicadas |
| Licencia | Apache 2.0 | no aplica |

## Limitaciones y advertencias

- Artefacto en fase de borrador: cero descargas, cero likes y repositorio de 0,0 GB en el momento de la consulta; no hay evidencia de uso real.
- Sin mediciones de corrección ni de rendimiento: todas las puertas (`kernel_tests`, `golden`, `compare`, `agent`, etc.) figuran como no remedidas, por lo que no está verificado que la salida coincida con la referencia de llama.cpp.
- Dependencia fuerte de hardware AMD concreto (gfx1151 y gfx1201); no hay soporte documentado para otras GPUs.
- Sin soporte de imagen ni audio en Loom, aunque el modelo upstream los tendría: quien necesite multimodalidad debe usar otra vía de despliegue.
- Sin decodificación especulativa ni ajuste de "reasoning effort" en este paquete.
- Capacidades multilingües no documentadas; no se puede asumir un rendimiento correcto en castellano sin evaluarlo.
- Riesgo de alucinación y sesgos del modelo base: no evaluados en la información disponible.
- Licencia Apache 2.0 declarada, que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base `ReadyArt/Wicked-Stuff-26B-A4B-Final-GGUF` antes de desplegar en producción.
- Los resultados de búsqueda web devueltos corresponden a servicios homónimos (Loom de grabación de pantalla y la marca de ropa Loom) y no aportan información sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-Final-loom
- Checkpoint base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sistema HRX/Loom para ROCm: https://github.com/ROCm/hrx-system
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
