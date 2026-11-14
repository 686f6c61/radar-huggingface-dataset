# mlc-ai/SmolLM3-3B-q4f16_1-MLC

## Resumen

SmolLM3-3B-q4f16_1-MLC es la conversión al formato MLC-LLM del modelo SmolLM3-3B de Hugging Face, empaquetada por el equipo de mlc-ai para su ejecución en el navegador mediante WebLLM. No se trata de un modelo nuevo, sino de una distribución optimizada del modelo base con cuantización `q4f16_1` (pesos de 4 bits con activaciones en fp16) que permite ejecutar inferencia de un LLM de 3.000 millones de parámetros directamente en el cliente, sin servidor, aprovechando WebGPU.

El paquete está pensado para desarrolladores que quieran integrar generación de texto en aplicaciones web con privacidad total (los datos no salen del dispositivo) y sin costes de infraestructura. La ventana de contexto del paquete es de 65.536 tokens, con un tamaño de chunk de prefill de 1.024 tokens; la configuración por defecto de WebLLM limita el contexto a 4.096 tokens para contener el uso de memoria.

La relevancia actual radica en que WebLLM y MLC-LLM están madurando como vía para desplegar modelos open source en el edge, y este paquete concreto demuestra que un modelo de 3B con razonamiento explícito (thinking mode activado por defecto) puede correr en un navegador moderno con aceleración por GPU, siempre que el dispositivo soporte la extensión `shader-f16` de WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base SmolLM3-3B); paquete compilado con MLC-LLM para WebGPU |
| Parametros totales | 3.000 millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens en el paquete; 4.096 tokens por defecto en WebLLM |
| Tipos de cuantizacion | q4f16_1 (pesos 4 bits, activaciones fp16); requiere `shader-f16` de WebGPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (artefacto compilado para WebGPU; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El paquete hereda la arquitectura del modelo base SmolLM3-3B de Hugging Face (transformer decoder-only de 3.000 millones de parámetros), pero los pesos han sido convertidos y compilados con MLC-LLM para ejecutarse sobre WebGPU. La conversión se realizó con la herramienta `mlc_llm convert_weight` usando la cuantización `q4f16_1`, y la configuración de generación se generó con `mlc_llm gen_config` fijando `--conv-template smollm3`, `--context-window-size 65536` y `--prefill-chunk-size 1024`.

Los detalles de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) no están recogidos en la información proporcionada; la model card remite a la model card upstream de SmolLM3-3B para capacidades, evaluaciones y limitaciones. La innovación técnica destacable de este paquete es la compilación de librerías WebGPU con revisiones de código fijadas (TVM `be03dc94b001`, MLC-LLM `5e824377af7f`) y la provenance registrada en `mlc-build-info.json`, que permite reproducir la conversión de forma determinista.

## Capacidades

- Generación de texto autoregresiva en el navegador mediante WebLLM.
- Razonamiento explícito (thinking mode) activado por defecto, siguiendo el comportamiento del modelo base de Hugging Face.
- Conversación multi-turno con plantilla de chat `smollm3` (sin la línea de fecha actual que sí incluye la plantilla original de HF).
- Capacidades del modelo base SmolLM3-3B (código, matemáticas, multilingüismo, etc.): no detalladas en la información proporcionada; consultar la model card upstream.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Asistentes web con privacidad por diseño: el modelo se ejecuta íntegramente en el cliente vía WebLLM, de modo que las conversaciones no se envían a ningún servidor; adecuado para aplicaciones de salud, finanzas personales o documentación confidencial.
- Generación de texto offline en aplicaciones web progresivas (PWA): al no requerir backend, el paquete permite ofrecer autocompletado, resumen o reescritura incluso con conectividad intermitente una vez cacheado el modelo.
- Prototipado rápido de interfaces conversacionales: con 4.096 tokens de contexto por defecto y una configuración de muestreo fija (temperatura 0,6, top_p 0,95), sirve para validar UX de chat sin montar infraestructura.
- Procesamiento de documentos largos en el navegador: la ventana de 65.536 tokens del paquete permite resumir o extraer información de textos extensos, siempre que se ajuste el límite de contexto de WebLLM y se disponga de memoria suficiente.
- Educación y demos técnicas: útil para mostrar en vivo cómo un LLM de 3B con razonamiento explícito corre en un portátil con GPU integrada compatible con WebGPU.
- Herramientas de escritura asistida en editores web: integración del paquete como motor de sugerencias o reescritura dentro de un editor basado en navegador, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador con WebGPU y soporte de la extensión `shader-f16` (imprescindible para la variante `q4f16_1`).
- VRAM estimada: no disponible de forma explícita; el repo pesa 1,7 GB, lo que da una cota inferior del espacio necesario para los pesos cuantizados, a la que hay que sumar la memoria de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; se requiere una GPU con WebGPU y `shader-f16` (habitualmente GPUs integradas y dedicadas recientes en Chrome/Edge).
- Cabe en GPU de consumo: sí, en principio, dado el tamaño del paquete (1,7 GB) y la cuantización de 4 bits, siempre que el dispositivo cumpla los requisitos de WebGPU.
- Opciones de despliegue: WebLLM (runtime `0.28.0-dev2` con candidatos WebGPU `v0_2_87`); MLC-LLM para recompilar el paquete.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| SmolLM3-3B-q4f16_1-MLC (este) | 3B | 65.536 (4.096 por defecto en WebLLM) | MLC / WebGPU | Apache 2.0 | Si, via WebLLM |
| SmolLM3-3B (HF original) | 3B | no disponible en esta ficha | safetensors | Apache 2.0 | No (requiere servidor o runtime local) |
| Otros paquetes MLC de modelos ~3B | ~3B | variable | MLC | variable | Si, via WebLLM |

La comparativa con alternativas concretas de la misma categoría (otros paquetes MLC-LLM de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La variante `q4f16_1` exige WebGPU con `shader-f16`; en dispositivos sin esa extensión el paquete no funcionará.
- El thinking mode está activado por defecto y no puede desactivarse con `enable_thinking`; para apagarlo hay que generar un paquete con `--conv-template smollm3_nothink`. Los conmutadores `/think`, `/no_think` y `/system_override` de la plantilla de HF no tienen efecto en este paquete.
- La plantilla del paquete omite la línea de fecha actual que la plantilla de HF escribe en el system prompt, lo que puede afectar a tareas sensibles a la fecha.
- El contexto por defecto en WebLLM es de 4.096 tokens (no 65.536) para limitar el uso de memoria; ampliarlo requiere ajuste manual y más recursos.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo en fp16/bf16; no se han publicado evaluaciones específicas de esta variante.
- Riesgo de alucinación y sesgos: propios del modelo base; no detallados en la información proporcionada.
- Idiomas soportados: no disponibles; consultar la model card upstream.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las librerías WebGPU compiladas.
- El paquete depende de revisiones concretas de TVM/MLC-LLM y de un runtime WebLLM concreto (`0.28.0-dev2`); la compatibilidad con versiones futuras no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/mlc-ai/SmolLM3-3B-q4f16_1-MLC
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Revisión del modelo base usada: https://huggingface.co/HuggingFaceTB/SmolLM3-3B/tree/a07cc9a04f16550a088caea529712d1d335b0ac1
- Documentación de WebLLM: https://webllm.mlc.ai/docs/
- Provenance de librerías WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
- Commit de TVM usado: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
- Commit de MLC-LLM usado en conversión: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49
