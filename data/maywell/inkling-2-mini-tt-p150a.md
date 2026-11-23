# maywell/Inkling-2-Mini-TT-p150a

## Resumen

Inkling-2-Mini-TT-p150a es un checkpoint convertido del modelo Inkling-2-Mini de Thinking Machines Lab, empaquetado por el usuario maywell para ejecutarse en una única tarjeta Tenstorrent Blackhole p150a. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son exactamente los de Inkling-2-Mini, dequantizados de NVFP4 y MXFP8 a BF16 mediante Transformers y divididos en un fichero safetensors por capa. El repositorio incluye además el script de conversión y las listas de hashes SHA256 para reproducir el proceso.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) orientado a generación de texto, con una ventana de contexto de 32.768 tokens según la documentación del port. El interés de esta ficha radica en que demuestra la viabilidad de ejecutar un MoE de gran tamaño en hardware no-GPU (el acelerador Blackhole p150a de Tenstorrent), con un rendimiento medido de 20,1 ms por token en decodificación con batch 1, es decir, 49,7 tokens por segundo, y un time-to-first-token de 0,17 s con prompts cortos que sube a 4,2 s con 7,8k tokens.

La relevancia actual es doble: por un lado, valida el ecosistema tt-metal/ttnn para servir modelos MoE en silicio dedicado; por otro, ofrece un recetario reproducible de conversión de pesos en formatos de cuantización agresiva (NVFP4, MXFP8) a BF16 para su uso en otros backends. La licencia del checkpoint convertido hereda la del modelo base, Apache-2.0, mientras que el código de conversión y la propia model card son también Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun tags del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Pesos originales en NVFP4 y MXFP8; checkpoint convertido a BF16 denso y expertos enrutados en BFP8_B en dispositivo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); Apache-2.0 (conversor y model card) |
| Formato de pesos | safetensors (un fichero por capa en hf_sd/); 53 GB en total |

## Arquitectura y entrenamiento

Inkling-2-Mini es un transformer con capas de mezcla de expertos (MoE), según la etiqueta `moe` del repositorio y la estructura de pesos que el conversor separa por capas. El checkpoint original de Thinking Machines Lab se distribuye en formatos de cuantización NVFP4 y MXFP8; el proceso de conversión de maywell carga el modelo en BF16 con Transformers sobre CPU (requiere unos 60 GB de RAM y tarda unos minutos) y escribe un safetensors por capa, sin modificar ningún otro aspecto de los pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica relevante no está en el modelo sino en el port: el runtime de Tenstorrent empaqueta los formatos de dispositivo (expertos en BFP8_B, tiles) en tiempo de carga, de modo que no se distribuye una caché de tensores TT y los shards convertidos no dependen de la versión de tt-metal. La precisión declarada es BF16 en las partes densas, atención y KV cache, con expertos enrutados en BFP8_B. La paridad con la implementación de referencia en HF (BF16, CPU) es de 380/384 aciertos top-1 y 384/384 top-5 sobre el conjunto de prueba del port.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento explícito: el servidor devuelve el "thinking" del modelo en el campo `reasoning_content` de la API compatible con OpenAI.
- Conversación multi-turno mediante la API de chat completions, con plantilla de chat propia del modelo base.
- Razonamiento de varios pasos dentro de una misma respuesta (el modo thinking permite cadenas de razonamiento antes de la respuesta final).
- Procesamiento de prompts largos: hasta 32.768 tokens de contexto, con TTFT de 4,2 s medido a 7,8k tokens.
- No soporta tool calling ni function calling: el port no incluye parseo de llamadas a herramientas.
- No soporta visión: aunque el repositorio incluye `hf_sd/vision.safetensors` con la torre de visión, esta no se utiliza y puede omitirse en la descarga.
- No devuelve logprobs.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de hardware Tenstorrent en laboratorio: desplegar el modelo en una Blackhole p150a para medir latencia y throughput reales de un MoE en silicio no-GPU, usando las cifras publicadas (20,1 ms/token, 49,7 tok/s) como referencia de comparación con GPUs.
- Servicio de chat interno de baja concurrencia: el port procesa una secuencia a la vez, por lo que encaja en asistentes de un solo usuario o entornos de demostración donde la simplicidad del despliegue (un contenedor Docker, sin autenticación) prima sobre la concurrencia.
- Reproducción de pipelines de conversión de pesos: usar el script `convert_checkpoint.py` y las listas SHA256 para validar la dequantización de NVFP4/MXFP8 a BF16 en un entorno CPU, como paso previo a portar el modelo a otros backends.
- Investigación en formatos de cuantización: comparar la calidad de los expertos enrutados en BFP8_B frente a BF16 denso usando las pruebas de paridad del port (380/384 top-1) como referencia de fidelidad.
- Prototipado de aplicaciones con razonamiento explícito: aprovechar el campo `reasoning_content` para construir interfaces que muestren el proceso de pensamiento del modelo en tareas de análisis o depuración lógica.
- Procesamiento de documentos largos en modo batch offline: con 32.768 tokens de contexto y un TTFT de 4,2 s a 7,8k tokens, es viable ingerir informes extensos y generar resúmenes en un único paso, siempre que no se requiera paralelismo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decodificacion, batch 1 | 20,1 ms/token (49,7 tokens/s) |
| Time to first token, prompt corto | 0,17 s |
| Time to first token, 7,8k tokens | 4,2 s |
| Acuerdo top-1 con HF (BF16, CPU) | 380/384 |
| Acuerdo top-5 con HF (BF16, CPU) | 384/384 |

Medido en una p150a con las 14 columnas Tensix habilitadas y límite de placa de 380 W. Las tarjetas p150a de serie (12 columnas) son compatibles pero no han sido probadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Acelerador Tenstorrent Blackhole p150a; se recomienda el modelo con 14 columnas Tensix habilitadas y límite de 380 W. Las tarjetas de serie con 12 columnas están soportadas pero sin probar.
- Almacenamiento: 53 GB para el checkpoint convertido (`hf_sd/`), más el tokenizer y la plantilla de chat del modelo base. La torre de visión (`vision.safetensors`) puede omitirse.
- RAM para la conversión: unos 60 GB si se realiza el proceso de dequantización en CPU.
- Despliegue: imagen de contenedor `ghcr.io/stablefluffy/inkling-tt:0.1.0`, que requiere acceso privilegiado, el dispositivo `/dev/tenstorrent` y hugepages de 1 GB. El primer arranque compila los kernels y tarda unos cuatro minutos.
- Servidor compatible con la API de chat y completions de OpenAI en el puerto 8000, sin autenticación.
- No es posible ejecutarlo en GPUs convencionales (A100, H100, RTX 4090) con este port; para esas plataformas habría que usar el checkpoint original de Thinking Machines con un runtime estándar.
- Throughput y latencia: ver la tabla de benchmarks; con una sola secuencia simultánea, el throughput agregado coincide con los 49,7 tokens/s de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-TT-p150a | no disponible (MoE) | 32.768 | Apache-2.0 | Tenstorrent Blackhole p150a | Port con conversión a BF16; 49,7 tok/s en batch 1 |
| Inkling-2-Mini (original) | no disponible (MoE) | no disponible | Apache-2.0 | GPU convencionales | Pesos en NVFP4/MXFP8; referencia de paridad del port |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Una sola secuencia simultánea: el servidor no soporta batching concurrente, lo que limita su uso en producción multiusuario.
- Solo texto: la torre de visión no se utiliza aunque se distribuya en el repositorio.
- Sin soporte de logprobs ni de parseo de tool calls, lo que impide integrarlo en pipelines de agentes que dependan de function calling.
- El servidor no tiene autenticación; debe exponerse únicamente en localhost o detrás de un proxy con control de acceso.
- Las tarjetas p150a de serie (12 columnas) están soportadas pero no probadas; el rendimiento puede diferir del medido con 14 columnas.
- Los hashes de conversión solo son válidos para las versiones exactas de torch, transformers y safetensors indicadas; otras versiones pueden producir bytes distintos aunque correctos, y en ese caso hay que ejecutar las pruebas de paridad del port.
- Se heredan las limitaciones y notas de seguridad del modelo base Inkling-2-Mini, incluida su Acceptable Use Policy; no se detallan sesgos específicos en la información disponible.
- Riesgo de alucinación: no cuantificado en la documentación del port; aplican las advertencias generales del modelo base.
- Licencia Apache-2.0 para los pesos y el código, con la salvedad de la política de uso aceptable de Thinking Machines Lab para el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maywell/Inkling-2-Mini-TT-p150a
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del port: https://github.com/StableFluffy/inkling-tt
- Benchmarks del port: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/benchmarks.md
- Documentación de hardware: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/hardware.md
- Documentación de precisión: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/precision.md
- Documentación de serving: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/serving.md
- Imagen de contenedor: ghcr.io/stablefluffy/inkling-tt:0.1.0
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
