# loom-draft/Mungert-Qwen2.5-14B-Instruct-1M-loom

## Resumen

Mungert-Qwen2.5-14B-Instruct-1M-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar Mungert/Qwen2.5-14B-Instruct-1M-GGUF, concretamente el archivo `Qwen2.5-14B-Instruct-1M-q4_k_m.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos de Qwen2.5-14B-Instruct-1M a programas ejecutables por el runtime Loom (hrx-loom) sobre GPUs AMD.

El objetivo del paquete es ofrecer una ruta de inferencia nativa para hardware AMD específico: el Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Se generó con la herramienta loom-next, que produce los programas sin intervención de un LLM en el bucle. El modelo subyacente es Qwen2.5-14B-Instruct-1M, una variante de Qwen2.5-14B-Instruct con ventana de contexto extendida a 1 millón de tokens, de la familia Qwen2.5 desarrollada por Alibaba.

La relevancia del paquete es acotada pero concreta: permite servir un modelo de 14B con contexto largo sobre GPUs AMD de consumo y de estación de trabajo mediante una API compatible con OpenAI, sin depender del stack CUDA. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), empaquetado como programas Loom |
| Parametros totales | 14B (heredados del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1M tokens en el modelo base; 32.768 tokens por petición en el preset Loom |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento ni modificación de pesos. La arquitectura efectiva es la del checkpoint Qwen2.5-14B-Instruct-1M: un transformer decoder-only de 14.000 millones de parámetros con atención completa y extensión de contexto hasta 1 millón de tokens, distribuido originalmente por Alibaba y reempaquetado por Mungert en formato GGUF. Sobre ese GGUF, loom-next genera programas `.loom` que implementan los kernels y el grafo de cómputo para el runtime Loom, junto con `llm_config.json` (configuración de generación) y `tokenizer.json`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO en la información proporcionada; esos detalles corresponden a la model card original de Qwen2.5-14B-Instruct-1M, que no se ha incluido en la búsqueda. Tampoco se documentan innovaciones técnicas propias del paquete más allá del propio proceso de generación de kernels. Las funcionalidades de decodificación especulativa, modo thinking, visión y audio figuran explícitamente como no aplicables en la tabla de features del autor.

## Capacidades

- Generación de texto conversacional e instructiva, heredada de Qwen2.5-14B-Instruct.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` estructurados.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Concurrencia de hasta 4 peticiones simultáneas con el preset incluido.
- Contexto de 32.768 tokens por petición en la configuración empaquetada, muy por debajo del millón de tokens que soporta el modelo base.
- Capacidades multilingües: no documentadas en la información disponible para este paquete.
- No soporta razonamiento explícito (thinking), decodificación especulativa, entrada de imagen ni audio, según la tabla de features del autor.
- El estado de la muestrea (temperature, top_k, seed) figura como "no determinado" en la model card.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo AMD: desplegar el paquete con `loom-serve` sobre una Radeon AI PRO R9700 permite exponer un endpoint compatible con OpenAI en local, útil para prototipos y herramientas internas que ya hablan el protocolo de OpenAI.
- Procesamiento de documentos largos en local: con 32.768 tokens por petición se pueden resumir o extraer información de contratos, informes o hilos de correo extensos sin salir del equipo, aprovechando el contexto largo del modelo base.
- Agentes con herramientas en entornos controlados: el soporte de `tools` y `tool_calls` permite construir flujos de agente que consulten APIs internas o bases de datos, siempre que se validen las llamadas en el lado del orquestador.
- Evaluación de hardware AMD para inferencia LLM: el paquete sirve como banco de pruebas para medir el rendimiento de Strix Halo y R9700 con un modelo de 14B cuantizado en Q4_K_M frente a llama.cpp.
- Generación de código asistida en pipelines internos: el modelo base Qwen2.5-14B-Instruct tiene capacidad de código; el paquete permite integrarlo en herramientas de revisión o generación de parches dentro de una red corporativa.
- Chat de soporte técnico de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en equipos pequeños o demos donde no se requiere escalado horizontal.
- Laboratorio de investigación sobre runtimes alternativos: permite comparar la fidelidad de los kernels generados por Loom frente a la referencia de llama.cpp mediante las puertas de corrección (`golden`, `compare`, `logits`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay, por tanto, evidencia registrada de corrección ni de throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 14B, lo que sitúa los pesos en torno a 9-10 GB; el preset reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamaño exacto no se detalla en la información disponible. A ello hay que sumar la caché KV para 32.768 tokens de contexto y 4 peticiones concurrentes, que puede ser considerable.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo convencionales; el paquete está generado específicamente para las dos arquitecturas AMD citadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto; llama.cpp aparece únicamente como referencia de corrección.
- Latencia y throughput: no disponibles; las mediciones del autor están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Mungert-Qwen2.5-14B-Instruct-1M-loom | 14B | 32.768 por petición (1M en el base) | Loom (`hrx-loom`), GPU AMD gfx1151/gfx1201 | Apache 2.0 | Paquete de despliegue, sin benchmarks publicados |
| Mungert/Qwen2.5-14B-Instruct-1M-GGUF | 14B | 1M (modelo base) | GGUF, llama.cpp y derivados | Apache 2.0 | Checkpoint de origen; referencia de corrección del paquete |
| Qwen2.5-14B-Instruct (original) | 14B | 32.768 (estándar) | Safetensors, transformers, vLLM, TGI | Apache 2.0 (Qwen license para algunos tamaños; verificar) | Modelo base de Alibaba sin extensión de contexto |

No se dispone de datos de rendimiento comparativo para el paquete Loom, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación de Qwen2.5-14B-Instruct-1M (sesgos, alucinaciones, conocimiento con fecha de corte) aplica íntegramente.
- El contexto efectivo en el preset es de 32.768 tokens, no de 1 millón; usar el modelo base para ventanas mayores requiere otra configuración no incluida.
- Sin evidencia de corrección registrada: todas las puertas de la model card figuran como no medidas, por lo que no hay garantía publicada de que la salida coincida con llama.cpp.
- Compatibilidad restringida a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se documenta funcionamiento en otras GPUs.
- El estado de la muestrea figura como "no determinado", lo que introduce incertidumbre sobre la reproducibilidad de la generación.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens; no apto para cargas de alta demanda sin escalado adicional.
- Cero descargas y cero likes en el momento de la consulta: paquete recién publicado, sin validación comunitaria.
- La licencia Apache 2.0 se declara a nivel de paquete; conviene verificar la licencia del checkpoint Mungert y del modelo Qwen2.5 original antes de uso comercial.
- Los resultados de búsqueda web devueltos corresponden a productos homónimos (Loom.com, Loom.fr), no al runtime Loom de AMD; no aportan información técnica válida.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/Mungert-Qwen2.5-14B-Instruct-1M-loom
- Checkpoint base GGUF: https://huggingface.co/Mungert/Qwen2.5-14B-Instruct-1M-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
