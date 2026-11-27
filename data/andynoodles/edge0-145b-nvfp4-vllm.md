# andynoodles/Edge0-145B-NVFP4-vLLM

## Resumen

Edge0-145B-NVFP4-vLLM es una reconversión de formato de los pesos de Edge0/Edge0-145B-NVFP4, publicada por Andy Chen (andynoodles) para poder servir el modelo con un plugin propio de vLLM sobre una única GPU RTX 5090 de 32 GB. No es un modelo nuevo ni un reentrenamiento: son los mismos pesos de Edge0, reorganizados bit a bit para que el kernel Marlin de vLLM pueda consumir los expertos enrutados en NVFP4 y los pesos densos en Q8_0. El checkpoint original no se puede cargar con vLLM ni transformers estándar; requiere el plugin edge0-vllm.

El modelo subyacente es un MoE con arquitectura que el autor etiqueta como "latent-moe" y que se apoya en el modelo base Qwen3.8-Flash-Next de Qwen, con componentes propios de Edge0 (tabla PLE, cabezales QSA, drafter MTP). Según los safetensors del repositorio, el checkpoint contiene 57.764.125.312 parámetros, aunque el nombre comercial del modelo hable de 145B; esa discrepancia no queda explicada en la información disponible. El contexto declarado en la configuración es de 262.144 tokens, aunque el plugin solo se ha probado con 32.768.

Su relevancia práctica es la de hacer viable un modelo de esta escala en hardware de consumo: un solo RTX 5090 con 64 GB de RAM del sistema, usando un esquema híbrido GPU/RAM/CPU en el que los expertos menos usados se descargan a memoria principal y se procesan en CPU con AVX-512. La licencia es restrictiva y encadenada (Edge0 Community Model License 1.0 más Qwen Community License 1.0), lo que condiciona seriamente el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiquetada "latent-moe"), basada en Qwen3.8-Flash-Next, con tabla PLE, proyecciones QSA y drafter MTP |
| Parametros totales | 57.764.125.312 (según safetensors); el nombre del modelo indica 145B, discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en config.json; probado con 32.768 en el plugin |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q8_0 (pesos densos), BF16 (embedding, LM head, q/k/v de QSA), FP8 (tabla PLE), NVFP4 para los expertos del drafter MTP |
| Idiomas soportados | no disponible |
| Licencia | Edge0 Community Model License 1.0 + Qwen Community License 1.0 (archivos del tokenizer y base) |
| Formato de pesos | safetensors (índice model.safetensors.index.json), más ple-fp8.gguf, profile.bin, vocab.json, merges.txt, chat_template.jinja, draft_vocab.json |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se detalla es la composición del checkpoint convertido: los expertos enrutados permanecen en NVFP4 repackados en el layout ModelOpt que espera el kernel Marlin de vLLM; los pesos densos permanecen en Q8_0 sin cambios de bytes, con algunas filas reordenadas para alinear con los módulos de vLLM; y el token embedding, el LM head y las proyecciones q/k/v de QSA se dequantizan a BF16. Los expertos del drafter MTP se recuantizan de Q2_0 a NVFP4 con un error medio del 2,65 %, lo que afecta solo a la aceptación del borrador y no a la salida final.

El rasgo arquitectónico más singular es el uso de una tabla PLE de 51 GB en FP8 (ple-fp8.gguf) que se lee desde disco en cada paso de decodificación, y un esquema de expertos en tres niveles: GPU para los densos, la caché KV y los expertos más usados; RAM fijada (33-41 GiB con memlock ilimitado) para el resto de expertos, el embedding y las reservas de swap; y CPU con AVX-512 para la ruta de expertos fríos, desactivable con EDGE0_CPU_EXPERTS=0. El modelo incluye modo thinking activado por defecto y decodificación especulativa mediante un drafter DFlash2 externo (incoai/Qwen3.8-Flash-Next-DFlash2, Apache-2.0) para el preset de una sola petición.

## Capacidades

- Generación de texto conversacional y modo thinking (razonamiento extendido) activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Decodificación especulativa con drafter MTP integrado y, opcionalmente, con el drafter DFlash2 para el preset de petición única.
- Capacidad multimodal potencial por herencia del modelo base, pero el encoder de visión no está incluido en esta conversión; hay que acudir al repositorio upstream.
- Soporte de plantilla de chat propia (chat_template.jinja) con tokens especiales `<|im_end|>` (248046) y `<|endoftext|>` (248044).
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Servicio compatible con la API OpenAI de vLLM (`/v1/chat/completions`) a través del plugin.

## Casos de uso

- Inferencia local de un modelo de gran escala en una sola GPU de consumo: con un RTX 5090 de 32 GB y 64 GB de RAM del sistema se puede servir el modelo con el plugin edge0-vllm, algo imposible con vLLM estándar para un checkpoint de este tamaño.
- Evaluación e investigación de arquitecturas MoE con descarga de expertos a CPU: el esquema GPU/RAM/CPU con ruta AVX-512 permite estudiar el comportamiento de modelos MoE grandes bajo restricciones de VRAM sin recurrir a clústeres multi-GPU.
- Prototipado de asistentes conversacionales con razonamiento: el modo thinking permite separar respuestas rápidas de respuestas razonadas en el mismo endpoint, útil para comparar calidad y latencia en aplicaciones de chat.
- Despliegue en entornos con una única máquina de gama alta: el stack Docker con NGC `nvcr.io/nvidia/vllm:26.11-py3` y el script serve.sh permiten levantar el servicio en 3-4 minutos, adecuado para laboratorios o equipos pequeños.
- Pruebas de decodificación especulativa: la comparación entre el preset single (con drafter DFlash2) y el preset tuned con 32 peticiones concurrentes sirve para medir el impacto del borrador en throughput y aceptación en cargas reales.
- Reproducción y auditoría de conversiones de cuantización: el repositorio incluye CHANGES.md y release-scope.json, lo que facilita verificar la fidelidad de la conversión frente al checkpoint original (coincidencia top-1 en 257 de 261 posiciones en la comprobación teacher-forced).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre una RTX 5090, prompts de ShareGPT, thinking desactivado y temperatura 0:

| Configuración | tok/s |
|---|---:|
| Strata (motor oficial de Edge0), 1 petición | 122,0 |
| edge0-vllm PRESET=single, 1 petición | 140,5 |
| edge0-vllm PRESET=tuned, 32 peticiones concurrentes (todas a la vez) | 180,3 total |
| edge0-vllm PRESET=single, 32 peticiones concurrentes (4 en ejecución, resto en cola) | 214,4 total |

Las filas de una petición terminan en EOS; las de 32 peticiones generan 1024 tokens cada una. En la comprobación teacher-forced, ambos presets coincidieron con el top-1 de Strata en 257 de 261 posiciones. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: 32 GB en GPU; aloja los pesos densos, la caché KV y los expertos más usados.
- RAM del sistema: 64 GB recomendados, de los cuales 33-41 GiB van fijados con `memlock` ilimitado (resto de expertos, embedding y reservas de swap).
- CPU: AVX-512 obligatorio para la ruta de expertos en CPU (`EDGE0_CPU_EXPERTS=0` la desactiva).
- Disco: unos 111,62 GB en SSD NVMe local; la tabla PLE de 51 GB se lee de disco en cada paso de decodificación. Si vive en otra unidad, hay que dejar un enlace simbólico llamado `ple-fp8.gguf`.
- GPU recomendadas: RTX 5090 32 GB (único hardware probado). No hay datos para A100, H100 ni otras consumer GPU.
- Despliegue: vLLM 0.33 mediante el plugin edge0-vllm (imagen NGC `nvcr.io/nvidia/vllm:26.11-py3`), Docker con NVIDIA Container Toolkit y tmux. Stock vLLM y transformers no pueden cargar el checkpoint.
- Latencia y throughput: ver tabla de benchmarks; 140,5 tok/s en petición única y hasta 214,4 tok/s agregados con 32 peticiones en cola.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Edge0-145B-NVFP4-vLLM (esta conversión) | 57.764.125.312 (según safetensors) | 262.144 (probado 32.768) | Edge0 Community Model License 1.0 + Qwen Community License 1.0 | Hugging Face, requiere plugin edge0-vllm |
| Edge0/Edge0-145B-NVFP4 (upstream) | no disponible en la información | no disponible | Edge0 Community Model License 1.0 + Qwen Community License 1.0 | Hugging Face, incluye encoder de visión y archivos de Strata |
| Qwen3.8-Flash-Next (modelo base) | no disponible en la información | no disponible | Qwen Community License 1.0 | no disponible en la información |

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dependencia total del plugin edge0-vllm: ni vLLM estándar ni transformers pueden cargar este checkpoint, lo que limita la portabilidad y añade un punto de fallo mantenido por un único desarrollador.
- Licencia restrictiva y encadenada: vender el modelo, operar un servicio comercial de modelo o un asistente comercial de código u ofimática requiere licencia escrita de Edge0; además, productos con más de 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales deben mostrar el nombre del modelo, y un negocio de Model-as-a-Service o AI Work Assistant necesita licencia separada de Qwen. El permiso de Edge0 no equivale al de Qwen.
- Discrepancia entre el nombre (145B) y los parámetros reales del checkpoint (57.764.125.312): conviene verificar el alcance real del modelo antes de planificar despliegues.
- El encoder de visión no está incluido; las capacidades multimodales requieren el repositorio upstream.
- Lectura de 51 GB de disco por paso de decodificación: el rendimiento depende críticamente de un NVMe local rápido y de memlock ilimitado; un disco lento degrada gravemente la latencia.
- Solo se ha probado en una configuración concreta (RTX 5090, Ryzen 9 9950X, 60 GiB DDR5, vLLM 0.33); no hay validación en otras GPU ni en despliegues multi-GPU.
- La recuantización del drafter MTP introduce un error medio del 2,65 % que afecta a la aceptación del borrador, no a la salida, pero puede reducir la ganancia de la decodificación especulativa.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/andynoodles/Edge0-145B-NVFP4-vLLM
- Modelo base upstream: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Revisión concreta del upstream usada en la conversión: https://huggingface.co/Edge0/Edge0-145B-NVFP4/tree/cf4c3d958db1edd15bd9bcfe3507327dd7b1008c
- Repositorio del plugin: https://github.com/andynoodles/edge0-vllm
- Guía rápida del plugin: https://github.com/andynoodles/edge0-vllm#quick-start
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Licencia Edge0: LICENSE (en el repositorio de Hugging Face)
- Licencia Qwen: third-party/Qwen-LICENSE.txt (en el repositorio de Hugging Face)
- Registro de cambios de la conversión: CHANGES.md (en el repositorio de Hugging Face)
