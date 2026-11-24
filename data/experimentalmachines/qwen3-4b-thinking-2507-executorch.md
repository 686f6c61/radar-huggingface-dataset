# experimentalmachines/Qwen3-4B-Thinking-2507-ExecuTorch

## Resumen

Qwen3-4B-Thinking-2507-ExecuTorch es una exportación cuantizada del modelo Qwen/Qwen3-4B-Thinking-2507, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) mediante el runtime ExecuTorch 1.5.1. No se trata de un modelo nuevo entrenado desde cero, sino de un derivado del modelo denso de 4.000 millones de parámetros de Qwen, con pesos cuantizados a 4 bits y activaciones dinámicas de 8 bits, empaquetado en archivos `.pte` que pueden ejecutarse en dispositivos Android arm64 a través de los backends XNNPACK (CPU) y Vulkan (GPU).

El problema que resuelve es la ejecución de un modelo de razonamiento de tamaño medio en hardware móvil sin conexión a la nube. Para ello se ofrecen ventanas de contexto fijas de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens, con el KV cache completo reservado en memoria al cargar el modelo. Los archivos XNNPACK ocupan entre 2,66 y 2,72 GB, mientras que los Vulkan ocupan entre 3,42 y 3,61 GB, lo que permite ajustar la ventana al presupuesto de memoria del dispositivo.

Es relevante ahora porque demuestra la viabilidad de desplegar modelos con modo "thinking" (razonamiento extendido) en teléfonos, sin GPU dedicada ni servidor, usando el ecosistema ExecuTorch de PyTorch. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial y su integración en aplicaciones Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Thinking-2507); exportado a ExecuTorch con backend XNNPACK o Vulkan |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (ventana fija por archivo) |
| Tipos de cuantizacion | Pesos 4 bits en grupos de 32, activaciones dinámicas 8 bits, embeddings int8 por canal, KV cache fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), más `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Thinking-2507 es un transformer denso de 4.000 millones de parámetros desarrollado por Qwen, con un modo de razonamiento ("thinking") que genera cadenas de pensamiento antes de la respuesta final. Esta exportación no reentrena ni modifica el modelo: aplica cuantización GPTQ a 4 bits con grupos de 32, activaciones dinámicas de 8 bits e embeddings int8 por canal, y lo compila con `export_llm` de ExecuTorch 1.5.1. El chunk de prefill es de 2.048 tokens y el KV cache se mantiene en fp32.

La innovación técnica principal es el empaquetado para dos backends: XNNPACK (CPU, cualquier arm64) y Vulkan (GPU, cualquier arm64). Cada archivo `.pte` fija una ventana de contexto concreta porque el runtime reserva la totalidad del KV cache al cargar, lo que obliga a elegir el tamaño máximo que el dispositivo pueda sostener. El KV cache cuesta 294.912 bytes por token en fp32 (unos 604 MB para 2.048 tokens y unos 9,66 GB para 32.768 tokens). No se dispone de información sobre la composición del dataset de entrenamiento ni sobre las etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto con modo de razonamiento extendido (thinking), heredado de Qwen3-4B-Thinking-2507.
- Razonamiento multi-paso y resolución de problemas, orientado a tareas que requieren cadena de pensamiento.
- Generación de código y matemáticas (capacidades del modelo base Qwen3; sin benchmarks publicados en esta ficha).
- Ejecución on-device en Android arm64 sin conexión a la nube.
- Inferencia en CPU (XNNPACK) o GPU (Vulkan) según el archivo elegido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo base es solo texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento offline en Android: el modelo puede ejecutarse íntegramente en el dispositivo con XNNPACK a 2k-4k tokens, útil para aplicaciones que deben funcionar sin red y con privacidad total, como asistentes personales o de estudio.
- Aplicaciones de privacidad sensible: al no enviar datos a la nube, encaja en escenarios sanitarios, legales o financieros donde el texto no puede salir del dispositivo; la ventana de 8k permite conversaciones multi-turno moderadas.
- Tutoría y explicación paso a paso: el modo thinking genera cadenas de razonamiento que pueden mostrarse al usuario en apps educativas, con la ventana de 16k para problemas largos.
- Procesamiento de documentos cortos en el dispositivo: con la variante de 32k tokens se pueden resumir o analizar contratos, artículos o correos sin salir del teléfono, a costa de unos 9,66 GB de KV cache.
- Prototipado de agentes móviles: la variante Vulkan (GPU) ofrece mayor throughput para pipelines de agente con varias llamadas encadenadas, siempre que el dispositivo soporte Vulkan y tenga memoria suficiente.
- Integración en la app openweights: el autor proporciona la app Android openweights como cliente de referencia, lo que permite probar el modelo sin escribir un runtime propio.
- Evaluación de ExecuTorch en producción: sirve como banco de pruebas para medir latencia y consumo en dispositivos arm64 antes de adoptar el stack en una aplicación comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta un smoke test con la respuesta "Paris" en los archivos XNNPACK; los Vulkan se marcaron como "structure checked" sin ejecución por falta de runtime NPU en el host. No se proporcionan métricas de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM/RAM estimada: 2,66-2,72 GB para XNNPACK (CPU) y 3,42-3,61 GB para Vulkan (GPU), más el KV cache reservado al cargar (604 MB a 2k, 1,21 GB a 4k, 2,42 GB a 8k, 4,83 GB a 16k, 9,66 GB a 32k).
- Presupuesto de referencia: el autor usa un umbral de 5 GB (`fits_phone_budget`) para estimar si un dispositivo puede con una ventana concreta.
- GPU recomendadas: no aplica a GPU de servidor; el target es cualquier arm64 con backend Vulkan o XNNPACK. No se especifican modelos de teléfono concretos.
- ¿Cabe en consumer GPU? El objetivo no es GPU de escritorio, sino móvil; no hay datos de ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: ExecuTorch 1.5.1 (backends XNNPACK y Vulkan), app Android openweights. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/backend | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507-ExecuTorch (este) | 4.000 M | 2k-32k fijo | ExecuTorch (.pte), XNNPACK/Vulkan | Apache 2.0 | Cuantizado 4 bits, on-device Android |
| Qwen/Qwen3-4B-Thinking-2507 (base) | 4.000 M | hasta 32k (según modelo base) | safetensors | Apache 2.0 | Pesos completos, requiere GPU/servidor |
| Alternativas on-device comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos ExecuTorch equivalentes en la información proporcionada |

## Limitaciones y advertencias

- Ventana de contexto fija: no se puede ampliar en tiempo de ejecución; hay que elegir el archivo con la ventana adecuada y el KV cache se reserva completo al cargar.
- Consumo de memoria elevado en ventanas grandes: 32k tokens exige unos 9,66 GB solo de KV cache, inviable en la mayoría de teléfonos actuales.
- Los archivos Vulkan no se han validado en ejecución ("structure checked" sin runtime NPU en el host); su funcionamiento real en dispositivos no está confirmado por el autor.
- Solo se ha verificado un smoke test trivial ("Paris") en XNNPACK; no hay evidencia publicada de calidad en tareas reales.
- Riesgo de alucinación inherente al modelo base, especialmente en modo thinking con contextos largos y cuantización de 4 bits.
- Sesgos del modelo base no documentados en esta ficha; se recomienda revisar la model card de Qwen3-4B-Thinking-2507.
- Idiomas soportados no declarados; el tokenizer se copia sin cambios del repositorio original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base.
- El repositorio ocupa 48,3 GB por incluir todas las variantes; la descarga selectiva de un solo `.pte` es imprescindible en móvil.
- No hay soporte declarado de tool calling, visión ni audio en esta exportación.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-4B-Thinking-2507-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- App openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch (PyTorch): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
