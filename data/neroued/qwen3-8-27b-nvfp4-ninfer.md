# neroued/Qwen3.8-27B-nvfp4-NInfer

## Resumen

`neroued/Qwen3.8-27B-nvfp4-NInfer` es un artefacto de inferencia cuantizado del modelo multimodal `Qwen/Qwen3.8-27B`, preparado exclusivamente para el runtime NInfer desarrollado por Neroued. Combina los pesos BF16 oficiales del modelo base con la cuantización NVFP4/FP8 generada por Unsloth, empaquetados en un único archivo `.ninfer` de 20,02 GiB. Su objetivo es ejecutar un modelo de 27 mil millones de parámetros con capacidades de imagen, vídeo y texto en una GPU consumer de gama alta (RTX 5090) con alta eficiencia de memoria y latencia.

El artefacto no es un checkpoint de Transformers ni un archivo Safetensors o GGUF; solo puede ser cargado por NInfer en su revisión `5d2c1f5` o posterior. Incluye componentes de texto, visión, MTP (speculative decoding), tokenizador, plantilla de chat y procesador de medios. La relevancia actual radica en permitir ejecutar un modelo multimodal de gran tamaño en hardware de consumo con cuantización mixta NVFP4/FP8, manteniendo la fidelidad de los pesos originales sin re-decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con componentes de vision y texto. Detalles adicionales no disponibles |
| Parametros totales | 27 mil millones (segun denominacion del modelo base, no confirmado en la informacion) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `--max-context 16384`, pero es configuracion del usuario) |
| Tipos de cuantizacion | NVFP4 (112 tensores), FP8 row-scaled (146 tensores), BF16 para pesos de control y MTP |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato propietario de NInfer, no Safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del modelo base `Qwen/Qwen3.8-27B`, que segun el pipeline declarado (`image-text-to-text`) es un transformer multimodal capaz de procesar texto, imagenes y video. No se proporcionan detalles sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) en la informacion disponible.

Respecto al entrenamiento, no hay datos sobre el proceso de preentrenamiento o ajuste del modelo base. Este artefacto es una conversion para inferencia: combina el checkpoint BF16 oficial con los pesos NVFP4 empaquetados de `unsloth/Qwen3.8-27B-NVFP4`. La distribucion de formatos es mixta: las capas de texto 0-55 usan pesos NVFP4 para las MLP, mientras que el embedding, las proyecciones de atencion, las proyecciones GDN Q/K/V/Z, la cabeza de salida y las capas de texto 56-63 usan FP8 row-scaled. Los pesos de control y las asignaciones MTP y Vision se mantienen en BF16. Los pesos cuantizados se preservan sin decodificacion ni recuantizacion; solo el embedding BF16 se codifica localmente como FP8 row-scaled.

## Capacidades

- Generacion de texto en modos thinking y no-thinking.
- Procesamiento multimodal: imagenes, multi-imagen, video y mensajes mixtos.
- Decodificacion especulativa MTP con ventanas de draft de 1 a 5 tokens.
- Cache KV en BF16 o INT8 con grupo de 64.
- Ejecucion con CUDA Graph decode y reutilizacion de prefijos compatibles.
- Servicio concurrente a pequeña escala (1-8 peticiones activas por Engine) con decode por lotes real.
- Interfaz de linea de comandos NInfer.
- Compatibilidad con APIs de servidor: OpenAI Responses Core, OpenAI Chat Completions y Anthropic Messages.
- No ejecuta llamadas a herramientas generadas (tool calls).

## Casos de uso

- Inferencia local multimodal en RTX 5090: ejecutar el modelo completo con imagen, video y texto en una GPU consumer, aprovechando la cuantizacion NVFP4/FP8 para reducir el uso de VRAM.
- Prototipado de asistentes conversacionales con razonamiento: usar los modos thinking y no-thinking para experimentar con cadenas de razonamiento en un entorno local.
- Demostraciones de vision por computador: procesar imagenes y videos con prompts de texto para tareas de descripcion, analisis o respuesta a preguntas visuales.
- Servicio de chat compatible con OpenAI y Anthropic: desplegar un endpoint local que imite las APIs de OpenAI Responses, Chat Completions o Anthropic Messages para integrarlo en aplicaciones existentes.
- Investigacion en decodificacion especulativa: evaluar el rendimiento de MTP con ventanas de draft de 1 a 5 tokens en un modelo multimodal de 27B.
- Pruebas de optimizacion de memoria: comparar el uso de cache KV BF16 frente a INT8 group-64 en un escenario de contexto largo, dentro de los limites de una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU obligatoria: NVIDIA GeForce RTX 5090 con arquitectura `sm_120a` (Blackwell). No se soporta otra GPU.
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 13.1 o superior.
- VRAM estimada: no especificada, pero el artefacto pesa 20,02 GiB; se requiere al menos esa cantidad mas el overhead del runtime y la cache KV. La RTX 5090 dispone de 32 GB de VRAM, suficiente para el artefacto con margen.
- Opciones de despliegue: exclusivamente NInfer (compilado desde fuente), con CLI y servidores OpenAI Responses Core, Chat Completions y Anthropic Messages.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos con otros modelos o artefactos.

## Limitaciones y advertencias

- El artefacto solo funciona con NInfer en la revision `5d2c1f5` o posterior; no es compatible con Transformers, vLLM, llama.cpp, Ollama ni otros runtimes.
- Ejecucion limitada a una unica RTX 5090 y un solo dispositivo CUDA.
- Capacidad fija de 1-8 peticiones activas por Engine; sin continuous batching a gran escala, sin planificacion por prioridad/QoS, sin multi-GPU, sin offload CPU/GPU y sin servicio distribuido.
- La asignacion de contexto depende de la memoria GPU y del tipo de cache KV seleccionado.
- NInfer no ejecuta llamadas a herramientas generadas por el modelo.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas del modelo base.
- Aunque la licencia es Apache-2.0, el usuario es responsable de cumplir con las condiciones de las fuentes originales (Qwen y Unsloth) y las leyes aplicables.

## Enlaces

- [HuggingFace: neroued/Qwen3.8-27B-nvfp4-NInfer](https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Fuente cuantizada: unsloth/Qwen3.8-27B-NVFP4](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4)
- [Repositorio NInfer](https://github.com/Neroued/ninfer)
- [Documentacion de NInfer](https://github.com/Neroued/ninfer/tree/master/docs)
- [Manifiesto del artefacto](https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer/blob/main/artifact-manifest.json)
- [Referencia del artefacto Qwen3.8-27B](https://github.com/Neroued/ninfer/blob/master/docs/maintainer/qwen3.8-27b-artifact.md)
