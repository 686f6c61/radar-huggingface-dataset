# loom-draft/mradermacher-EryriLabs-cymraeg-12B-i1-loom

## Resumen

El repositorio `loom-draft/mradermacher-EryriLabs-cymraeg-12B-i1-loom` no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF ya cuantizado `mradermacher/EryriLabs-cymraeg-12B-i1-GGUF`, concretamente el fichero `EryriLabs-cymraeg-12B.i1-Q4_K_M.gguf`. El modelo subyacente es un ajuste fino de 12B parámetros orientado al galés (cymraeg), publicado originalmente por EryriLabs y redistribuido en GGUF por mradermacher; este repositorio lo empaqueta para ejecutarse sobre GPUs AMD mediante el runtime Loom (hrx-loom 0.2.0).

El paquete está dirigido a dos aceleradores concretos: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next`, que según la model card opera únicamente como generador, sin un LLM en el bucle. El valor del repositorio es, por tanto, de ingeniería de despliegue: ofrece presets de memoria, comandos `loom-fetch`/`loom-serve` y mediciones de rendimiento frente a llama.cpp ROCm sobre el mismo GGUF.

Es relevante ahora porque documenta una alternativa de serving (Loom sobre ROCm) con cifras reproducibles en hardware AMD de consumo y workstation, un nicho donde la mayoría del ecosistema se apoya en llama.cpp o vLLM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB, lo que sugiere que los artefactos aún no se han materializado o no están publicados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 12B; arquitectura concreta no especificada en la informacion) |
| Parametros totales | 12B (según el nombre del checkpoint base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65536 tokens (configuración usada en llama.cpp: `-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (único incluido en este paquete) |
| Idiomas soportados | no disponible (el nombre del checkpoint sugiere especialización en galés, sin confirmación en la informacion) |
| Licencia | MIT |
| Formato de pesos | GGUF (`EryriLabs-cymraeg-12B.i1-Q4_K_M.gguf`), empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detalla si es un transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO. Lo único inferible es el tamaño (12B parámetros) y que existe un ajuste fino específico para galés publicado por EryriLabs, redistribuido en GGUF por mradermacher y reempaquetado aquí sin modificaciones del checkpoint (la model card indica explícitamente "unmodified GGUF checkpoint").

La innovación técnica documentada no está en el modelo sino en el runtime: el paquete Loom incluye presets de memoria con `--pool_backing=fixed` (reserva del pool por adelantado en lugar de crecimiento elástico), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo). La model card menciona además que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificación especulativa no está disponible.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional controlable mediante `chat_template_kwargs.enable_thinking` (desactivado en el ejemplo de la model card).
- Especialización probable en galés por el origen del checkpoint, aunque no confirmada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multimodales (visión, audio): no disponible en la informacion.
- Serving multi-stream: la model card reporta mediciones con 4 streams paralelos, lo que confirma soporte de concurrencia en el runtime.

## Casos de uso

- Serving de un modelo de 12B en galés sobre hardware AMD: el paquete permite levantar el modelo con `loom-serve` en Strix Halo o R9700 sin configurar manualmente ROCm, llama.cpp ni los parámetros de offload, gracias a los presets incluidos.
- Procesamiento de documentos largos en galés: con contexto configurado a 65536 tokens y un prefill medido de 845,5 tok/s a 32k en Strix Halo, es adecuado para resumir o extraer información de documentos extensos en una sola pasada.
- Evaluación comparativa de runtimes en AMD: el repositorio incluye una metodología reproducible (mismo GGUF, mismas prompts, mediana de 3 sesiones) frente a llama.cpp ROCm b1374, útil para equipos que deciden entre motores de inferencia en gfx1151.
- Despliegue en workstation con R9700 de 32 GB: el preset `chat-r9700` está pensado para una GPU de 32 GB, lo que permite mantener el modelo Q4_K_M (~7-8 GB de pesos) junto con contexto largo en VRAM.
- Chatbot especializado en galés para atención ciudadana o educativa: un modelo afinado específicamente en cymraeg puede ofrecer mejor calidad que un modelo generalista en ese idioma, aunque la informacion disponible no incluye evaluaciones que lo confirmen.
- Servicio multi-usuario de baja concurrencia: las mediciones de 4 streams (103,4 tok/s agregados en Loom frente a 80,5 en llama.cpp) indican viabilidad para cargas ligeras de varias sesiones simultáneas.
- Base para experimentación con runtimes alternativos: al ser un paquete generado automáticamente por `loom-next`, sirve como referencia de cómo se estructura un target set de Loom para nuevas GPUs AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Sí se incluyen mediciones de rendimiento de inferencia del runtime Loom frente a llama.cpp ROCm b1374 sobre el mismo GGUF en Strix Halo (gfx1151), medianas de 3 sesiones medidas el 2026-11-26:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 26,6 | 28,0 | +5 % |
| Decode tok/s, contexto 2k | 24,0 | 26,4 | +10 % |
| Decode tok/s, contexto 32k | 22,2 | 24,2 | +9 % |
| Prefill tok/s, documento 1k | 678,9 | 1055,2 | +55 % |
| Prefill tok/s, documento 2k | 711,7 | 1105,2 | +55 % |
| Prefill tok/s, documento 8k | 703,8 | 1042,0 | +48 % |
| Prefill tok/s, documento 16k | 641,8 | 978,8 | +53 % |
| Prefill tok/s, documento 32k | 536,5 | 845,5 | +58 % |
| 4 streams, decode agregado tok/s | 80,5 | 103,4 | +28 % |
| Decodificacion especulativa | n/a | n/a | n/a |

Condiciones: llama.cpp ROCm con `-ngl 99 -cram 0 -c 65536 -np 1`; Loom con espera activa; sin barrido de tuning en ninguno de los dos motores; sin drafting en las filas de un solo stream. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "no se han vuelto a medir todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para los pesos Q4_K_M de un modelo de 12B; el consumo total depende del contexto configurado (hasta 65536 tokens) y del pool de memoria fijado con `--pool_backing=fixed`.
- GPU soportadas explícitamente por este paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer (RTX 4090, RX 7900 XTX, etc.) en la informacion disponible; el paquete está dirigido a los dos aceleradores AMD citados.
- Despliegue: exclusivamente mediante el runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, comandos `loom-fetch` y `loom-serve`). No se documenta uso con vLLM, llama.cpp, Ollama o TGI para este paquete, aunque el GGUF subyacente podría cargarse con llama.cpp de forma independiente.
- Latencia y throughput: en Strix Halo, 28,0 tok/s de decode en prompt corto y 24,2 tok/s a 32k de contexto; prefill de 845,5 a 1105,2 tok/s según longitud del documento; 103,4 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-i1 (este paquete, Q4_K_M sobre Loom) | 12B | 65536 (configurado) | 28,0 tok/s decode; 1055,2 tok/s prefill 1k en Strix Halo | MIT | Paquete Loom para gfx1151 y gfx1201 |
| EryriLabs-cymraeg-12B-i1-GGUF (mradermacher, llama.cpp) | 12B | 65536 (configurado) | 26,6 tok/s decode; 678,9 tok/s prefill 1k en Strix Halo | MIT | GGUF genérico |
| Modelos generalistas de 12B en Q4_K_M | ~12B | variable | no disponible | variable | amplia |

La comparativa con alternativas de la misma categoría (modelos especializados en lenguas minoritarias de ~12B) no está disponible en la informacion proporcionada. La única comparación documentada es la del propio runtime Loom frente a llama.cpp sobre el mismo checkpoint.

## Limitaciones y advertencias

- La informacion disponible no incluye evaluación de calidad del modelo: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones en galés, por lo que no puede verificarse su rendimiento real en tareas.
- El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB: los artefactos pueden no estar materializados o no haberse publicado aún, lo que impide confirmar que el paquete sea funcional tal como se describe.
- El soporte de hardware está restringido a Strix Halo (gfx1151) y R9700 (gfx1201); no se documenta compatibilidad con otras GPUs AMD ni con NVIDIA.
- Las mediciones de rendimiento de la R9700 no se han vuelto a medir según la propia model card; solo hay cifras para Strix Halo.
- No hay drafter ni cabeza MTP en el GGUF, por lo que no se puede usar decodificación especulativa con este paquete.
- La especialización en galés, inferida del nombre del checkpoint, no está confirmada en la informacion; el comportamiento en otros idiomas es desconocido.
- Riesgo de alucinación y sesgos: no documentados en la informacion disponible; aplican los riesgos habituales de un modelo de 12B cuantizado a Q4_K_M, que introduce pérdida de precisión respecto a los pesos originales.
- La licencia MIT del paquete no necesariamente cubre los términos del modelo base original de EryriLabs; conviene verificar la licencia del checkpoint fuente antes de uso comercial.
- El ejemplo de la model card desactiva el modo thinking (`enable_thinking: false`); el comportamiento con thinking activado no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-EryriLabs-cymraeg-12B-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-12B-i1-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45878904352
