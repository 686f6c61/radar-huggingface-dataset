# loom-draft/koboldcpp-imgmodel-loom

## Resumen

`loom-draft/koboldcpp-imgmodel-loom` es un paquete de despliegue para la plataforma Loom (herramienta de inferencia para GPUs AMD basada en ROCm) que empaqueta el checkpoint GGUF sin modificar `koboldcpp/imgmodel`, concretamente el fichero `SeFi-Image-5B-Turbo/Qwen3VL-4B-Instruct-Q4_K_M.gguf` en cuantizacion Q4_K_M. No se trata de un modelo entrenado por el autor, sino de una conversión del checkpoint original a programas `.loom` y una tarjeta `model.json` generados con la herramienta `loom-next`, orientados a dos aceleradores concretos: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Qwen3-VL de 4B de parametros en su variante Instruct, según se deduce del nombre del fichero GGUF, aunque la model card del paquete no documenta la arquitectura interna, el número exacto de parámetros ni los datos de entrenamiento originales. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y una ventana de contexto de 262.144 tokens por petición, con hasta 4 peticiones concurrentes.

La relevancia de esta ficha es acotada: se publicó el 26 de noviembre de 2026, tiene cero descargas y cero likes, y la propia model card indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, etc.) aún no se han vuelto a medir. Es, por tanto, un artefacto en estado de borrador dentro del ecosistema Loom, útil para quien quiera probar un VLM de 4B sobre hardware AMD con ROCm, pero sin evidencia publicada de calidad ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un Qwen3-VL de 4B según el nombre del GGUF; la arquitectura interna no se documenta) |
| Parametros totales | no disponible (el identificador del checkpoint indica 4B para el modelo de lenguaje y 5B en el nombre "SeFi-Image-5B-Turbo") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programas `.loom` y `weights.loom` |
| Modelo base | koboldcpp/imgmodel |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | compatible con OpenAI `/v1/chat/completions` |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: envuelve el checkpoint GGUF `koboldcpp/imgmodel` (`SeFi-Image-5B-Turbo/Qwen3VL-4B-Instruct-Q4_K_M.gguf`) en programas `.loom` generados automáticamente por `loom-next`. Según la model card, la generación se hizo "solo con el generador, sin LLM en el bucle". El resultado son kernels y programas específicos para las arquitecturas AMD gfx1151 y gfx1201, junto con `tokenizer.json` y `llm_config.json` extraídos del checkpoint.

No se proporcionan datos sobre el entrenamiento original del modelo base: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones más allá del sufijo "Instruct" del nombre del fichero. La model card del paquete tampoco describe la arquitectura interna (transformer, atención, proyector visual) del Qwen3-VL subyacente. La innovación técnica destacable aquí no está en el modelo sino en el runtime: Loom genera kernels para GPUs AMD vía ROCm y expone una API compatible con OpenAI con soporte de tool calling, y el paquete incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) definidas en `gates.sh`, aunque ninguna tiene mediciones registradas todavía.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Contexto largo de hasta 262.144 tokens por petición, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultáneas por instancia servida.
- Salida limitada a 4.096 tokens por respuesta (preset `max_tokens`).
- Razonamiento o modo "thinking": no aplicable según la model card.
- Decodificación especulativa: no aplicable según la model card.
- Entrada de imagen: no soportada por Loom, aunque el modelo base la tiene.
- Entrada y salida de audio: no determinado.
- Muestreo (temperatura, top_k, semilla): no determinado en la documentación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional con contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones multi-turno sobre documentos extensos sin truncar, útil para atención al cliente con historial completo o análisis de contratos.
- Automatización de agentes con tool calling: al exponer `tools` y `tool_calls` en formato OpenAI, se puede integrar en frameworks de agentes (LangChain, LlamaIndex, etc.) que ejecuten funciones externas como consultas a bases de datos o APIs.
- Procesamiento por lotes en hardware AMD: pensado para servirse en Strix Halo o R9700 con ROCm, permite desplegar un LLM de 4B en cuantización Q4_K_M en estaciones de trabajo AMD sin GPU NVIDIA.
- Prototipado de pipelines de razonamiento multi-paso: la combinación de contexto largo y tool calling permite cadenas de varios pasos con historial reutilizado, aunque sin evidencia de calidad publicada.
- Sustitución local de APIs en la nube: al ser compatible con el endpoint `/v1/chat/completions`, se puede apuntar clientes existentes (SDK de OpenAI, etc.) a `http://127.0.0.1:8080` para pruebas de integración sin coste de API.
- Evaluación de la plataforma Loom: sirve como banco de pruebas para medir kernels generados frente a llama.cpp en GPUs AMD, con las puertas de corrección incluidas en el paquete.
- Generación de texto en entornos con requisitos de licencia permisiva: la licencia MIT del paquete facilita su incorporación en productos comerciales, siempre que se respeten las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "aún no se han vuelto a medir", y que todas las puertas de corrección aparecen como "not yet re-measured". No hay cifras de latencia, throughput ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Un GGUF Q4_K_M de un modelo de 4B suele ocupar del orden de 2,5 a 3 GB de pesos, pero el paquete Loom añade pools de memoria fijos (`--pool_backing=fixed`) cuyo tamaño no se documenta.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está generado para arquitecturas AMD vía ROCm.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Opciones de servicio: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo | Evidencia de rendimiento |
|---|---|---|---|---|---|---|
| `loom-draft/koboldcpp-imgmodel-loom` | 4B (según nombre del GGUF) | 262.144 tokens | GGUF + programas `.loom` | MIT | AMD Strix Halo, R9700 | Sin mediciones publicadas |
| `koboldcpp/imgmodel` (base) | 4B (según nombre del GGUF) | no disponible en esta ficha | GGUF | no disponible en esta ficha | Genérico (llama.cpp) | no disponible |
| Qwen3-VL-4B-Instruct (modelo de referencia) | 4B | no disponible en esta ficha | safetensors / GGUF | no disponible en esta ficha | Genérico | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparativa se limita a formato, licencia y hardware objetivo.

## Limitaciones y advertencias

- Artefacto en estado de borrador: cero descargas, cero likes y todas las puertas de corrección y mediciones de rendimiento sin registrar ("not yet re-measured"). No hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- La entrada de imagen no está soportada por Loom, aunque el modelo base (Qwen3-VL) sí la tiene; se pierde la capacidad multimodal principal del checkpoint original.
- Razonamiento y decodificación especulativa marcados como "no aplicable"; no se puede activar modo thinking ni acelerar la generación por esa vía.
- Máximo de 4.096 tokens de salida por respuesta, lo que limita tareas de generación larga.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación.
- Sin datos sobre sesgos, tasa de alucinación ni comportamiento en dominios especializados.
- Licencia MIT del paquete, pero las condiciones del modelo base (`koboldcpp/imgmodel`) no se detallan en la información disponible; conviene verificar la licencia del checkpoint original antes de uso comercial.
- Dependencia de hardware AMD específico (gfx1151, gfx1201) y de la versión `hrx-loom==0.2.0`; no es portable a NVIDIA ni a otras GPUs AMD sin regenerar el paquete.
- Fecha de creación futura (2026-11-26) y ausencia de mantenimiento documentado; el proyecto puede quedar obsoleto.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/koboldcpp-imgmodel-loom
- Modelo base: https://huggingface.co/koboldcpp/imgmodel
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
