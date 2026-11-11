# loom-fun/unsloth-Qwen3.8-Flash-Next-loom

## Resumen
El repositorio `loom-fun/unsloth-Qwen3.8-Flash-Next-loom` no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `unsloth/Qwen3.8-Flash-Next-GGUF`, en su cuantización `UD-Q4_K_XL`. El autor es `loom-fun` y el paquete se generó en una máquina AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con el flujo de trabajo `loom-skills`.

El objetivo es servir el modelo sobre la pila de inferencia Loom (paquete `hrx-loom`, backend AMD ROCm) con una API compatible con OpenAI en `/v1/chat/completions`, soporte de tool calling, modo de razonamiento configurable y decodificación especulativa mediante MTP (Multi-Token Prediction) con profundidad 3. Es relevante para quienes quieren ejecutar un modelo Qwen de la familia "Flash-Next" en hardware AMD integrado con un motor alternativo a llama.cpp.

La información publicada es escasa en cuanto a arquitectura y entrenamiento del modelo base: el repositorio no detalla parámetros totales, número de tokens de entrenamiento ni licencia, y el tamaño del repo figura como 0.0 GB. La tarjeta se centra en el rendimiento del motor Loom (prefill medido entre 1k y 32k de documento) y en el estado de las puertas de corrección, la mayoría sin evidencia registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no la documenta; el modelo base es de la familia Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF); el paquete Loom se genera a partir de esa cuantización |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF de origen; el paquete distribuido contiene programas `.loom`, `weights.loom`, `tokenizer.json`, `llm_config.json` y `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Backend | AMD ROCm (dispositivo `amdgpu`), memoria configurable vía `--memory_bytes` |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base (número de capas, atención, posible mezcla de expertos, composición del dataset o fases de alineación como RLHF o DPO). La tarjeta del repositorio no incluye esos datos y la model card de `unsloth/Qwen3.8-Flash-Next-GGUF` no se reproduce en la información proporcionada.

Lo que sí documenta el paquete es la infraestructura de inferencia: los programas `.loom` se generan a partir de `llm_config.json` y se ejecutan sobre `hrx-loom` (versión `0.2.0.dev0`, sobre `hrx-system` en el commit `314238a`). El paquete incorpora decodificación especulativa con MTP de profundidad 3 usando el mismo checkpoint GGUF como drafter, y expone un modo de razonamiento con niveles `low`, `medium`, `high` y `xhigh` (por defecto `xhigh`). La generación se realizó con `loom-skills` en el commit `4e28748` con cambios locales y el generador de tarjetas `561a009`.

## Capacidades
- Generación de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `high`, `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- API compatible con OpenAI en `/v1/chat/completions`, servida en `127.0.0.1:8080`.
- Decodificación especulativa MTP con profundidad 3 activada por defecto.
- Ventana de contexto de 131.072 tokens por petición y hasta 4 peticiones concurrentes.
- Entrada de imagen no soportada por Loom, aunque el modelo upstream sí la tiene según la propia tarjeta.
- Entrada y salida de audio: no aplicable.
- Muestreo (`temperature`, `top_k`, `seed`): estado no determinado en la tarjeta.

## Casos de uso
- Despliegue local en hardware AMD Strix Halo: el paquete está pensado para ejecutarse con `loom-serve --device=amdgpu --memory_bytes=97000000000` en un Ryzen AI Max+ 395, lo que permite servir el modelo en una máquina integrada sin GPU discreta.
- Sustitución de llama.cpp en entornos ROCm: al mantener la misma cuantización GGUF y exponer una API OpenAI, se puede conectar a clientes existentes y comparar rendimiento de prefill y decodificación frente al motor de referencia.
- Asistentes con razonamiento configurable: el parámetro `reasoning_effort` permite rebajar el coste de cómputo en tareas simples (`low`) y elevarlo en problemas complejos (`xhigh`), útil en pipelines con presupuesto de latencia variable.
- Agentes con tool calling: la API acepta `tools` y devuelve `tool_calls`, lo que permite integrarlo en bucles multi-turno de agentes que consultan APIs externas, aunque las puertas `agent` y `agent_think_off` no tienen evidencia registrada.
- Procesamiento de documentos largos: con 131.072 tokens de contexto por petición se pueden ingerir contratos, informes o bases de código extensas en una sola llamada, si bien la puerta `needle` (aguja en pajar) no tiene evidencia registrada.
- Servicio de chat con concurrencia moderada: 4 peticiones simultáneas y 4.096 tokens de salida máxima encajan en prototipos internos, demos o entornos de desarrollo con pocos usuarios.
- Evaluación de la pila Loom: el paquete incluye `REPORT.md` con el setup y los valores medidos, lo que lo hace útil como banco de pruebas para medir prefill y decodificación de Loom frente a llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

| Metrica | Valor medido (Loom) | Notas |
|---|---|---|
| Prefill tok/s, documento de 1k | 4.829,0 | Roofline de referencia |
| Prefill tok/s, documento de 2k | 4.770,8 | Roofline de referencia |
| Prefill tok/s, documento de 8k | 4.651,1 | Roofline de referencia |
| Prefill tok/s, documento de 16k | 4.646,6 | Roofline de referencia |
| Prefill tok/s, documento de 32k | 4.637,6 | Roofline de referencia |
| Decode tok/s, prompt corto | no medido | — |
| Decode tok/s, contexto 2k | no medido | — |
| Decode tok/s, contexto 32k | no medido | — |
| 4 streams, decode agregado | no medido | — |
| Tokens especulativos aceptados | n/a | Sin medición de aceptación |

El techo roofline indicado por el autor para este GGUF en Strix Halo (gfx1151) es de 216 GB/s de ancho de banda y 59 TFLOP/s, calculado con `loom-roofline` (`roofline.py`, `loom-skills` `561a009`). Las cifras de decodificación y de 4 streams no se midieron porque, según la tarjeta, no hay techo hasta que se mida la aceptación del drafter. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: el ejemplo de arranque usa `--memory_bytes=97000000000` (unos 97 GB) sobre memoria unificada de un Ryzen AI Max+ 395; no se detalla el desglose entre pesos y caché KV.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) es la plataforma de referencia documentada; no se especifican otras GPU AMD ni NVIDIA.
- GPU de consumo: no hay datos sobre encaje en RTX 4090, RTX 3090 u otras GPU de consumo; el paquete está orientado a `--device=amdgpu`.
- Opciones de despliegue: `hrx-loom` (instalable con `pip install "hrx-loom[hf]"`), `loom-fetch` para materializar el modelo y `loom-serve` como servidor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto; llama.cpp se usa únicamente como referencia de comparación.
- Latencia y throughput: prefill medido entre 4.637,6 y 4.829,0 tok/s según longitud del documento; decodificación y concurrencia sin medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3.8-Flash-Next-loom | no disponible | 131.072 | Paquete Loom sobre GGUF UD-Q4_K_XL | no disponible | Hugging Face, 0 descargas |
| unsloth/Qwen3.8-Flash-Next-GGUF (modelo base) | no disponible | no disponible | GGUF | no disponible | Hugging Face |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | GGUF + llama.cpp | según el GGUF base | Referencia usada por el autor |

La comparación con alternativas de la misma categoría (otros modelos Qwen de tamaño similar u otros paquetes de inferencia para Strix Halo) no está disponible en la información proporcionada. La única comparación documentada es frente a llama.cpp, y las celdas de decodificación y concurrencia están sin medir.

## Limitaciones y advertencias
- La licencia no está declarada en el repositorio; antes de uso comercial hay que verificar la licencia del modelo base `unsloth/Qwen3.8-Flash-Next-GGUF` y la del modelo original de Qwen.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño declarado es 0.0 GB, lo que sugiere que los artefactos pueden no estar materializados o que las métricas aún no se han actualizado.
- Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `needle`, `needle_full`) figuran como "sin evidencia"; no hay validación publicada de que la salida coincida con la referencia de llama.cpp ni de que la decodificación especulativa sea equivalente a la decodificación estándar.
- La entrada de imagen no está soportada por Loom aunque el modelo upstream la tenga, según la propia tarjeta.
- El muestreo (`temperature`, `top_k`, `seed`) está marcado como "no determinado", lo que impide garantizar reproducibilidad.
- El límite de 4 peticiones concurrentes y 4.096 tokens de salida puede ser insuficiente para cargas de producción.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base.
- El soporte de hardware documentado se limita a AMD Strix Halo (gfx1151); no hay evidencia de funcionamiento en otras GPU.
- La tarjeta advierte de que la compilación de llama.cpp usada como referencia no está registrada, ni sus argumentos de servidor, lo que dificulta reproducir la comparación.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.8-Flash-Next-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
