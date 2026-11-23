# experimentalmachines/Qwen2.5-1.5B-Instruct-ExecuTorch

## Resumen

Qwen2.5-1.5B-Instruct-ExecuTorch es una exportación cuantizada del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, preparada por experimentalmachines para inferencia en dispositivo (on-device) mediante el runtime ExecuTorch 1.5.1. El modelo base es un transformer decoder-only de 1.500 millones de parámetros, ajustado con instrucciones, que se distribuye aquí como artefactos `.pte` listos para ejecutarse en Android (arm64) con los delegados XNNPACK (CPU) y Vulkan (GPU). Resuelve el problema de desplegar un LLM de instrucciones en teléfonos y dispositivos de borde sin necesidad de servidores ni conexión de red.

La aportación principal de este repositorio no es el modelo en sí, sino el empaquetado: ofrece diez variantes que cubren ventanas de contexto de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens, con pesos en 4 bits (grupos de 32) y activaciones dinámicas en 8 bits, en ficheros de entre 1,11 GB y 1,49 GB. La ventana de contexto está fijada dentro de cada fichero, de modo que el runtime reserva la totalidad de la caché KV al cargar el modelo; por eso el autor incluye el campo `fits_phone_budget` en cada `config.json` como estimación frente a un presupuesto de 5 GB.

Es relevante ahora porque permite ejecutar un modelo de instrucciones con capacidad multilingüe y de código en hardware móvil con licencia Apache 2.0, sin dependencias de servicios en la nube. El repositorio incluye el tokenizador original, informes de exportación por ventana y pruebas de humo básicas (las variantes XNNPACK superaron una prueba de generación con la respuesta "Paris"; las Vulkan solo fueron verificadas estructuralmente por falta de runtime NPU en el host de exportación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), exportado a ExecuTorch |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (fija por fichero) |
| Tipos de cuantizacion | Pesos int4 en grupos de 32, activaciones dinámicas int8, embeddings int8 per-channel, caché KV fp32 |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); tokenizador en `tokenizer.json` |
| Backends | XNNPACK (CPU) y Vulkan (GPU), ambos para arm64 |
| Version de runtime | ExecuTorch 1.5.1 |
| Tamano de fichero | 1,11-1,17 GB (XNNPACK); 1,40-1,49 GB (Vulkan) |
| Coste de cache KV | 57.344 bytes por token (fp32); 117 MB a 2k y 1,88 GB a 32k |
| Prefill chunk | 2.048 tokens |
| Tamano del repo | 26,7 GB |
| Descargas | 409 |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct (revision 989aa7980e4c) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención completa y ajuste por instrucciones realizado por el equipo Qwen de Alibaba. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card original de Qwen2.5, que no se incluye en esta ficha. La exportación conserva el tokenizador original sin modificaciones.

La innovación técnica de este repositorio reside en el pipeline de exportación con `export_llm` de ExecuTorch 1.5.1: cuantización GPTQ a 4 bits con grupos de 32, activaciones dinámicas a 8 bits, embeddings int8 por canal y caché KV en fp32. Se generan dos familias de artefactos: una para el delegado XNNPACK, que se ejecuta en CPU sobre cualquier arm64, y otra para el delegado Vulkan, que descarga el cálculo en la GPU integrada. Cada fichero fija una ventana de contexto concreta y el runtime asigna la caché KV completa en el momento de la carga, lo que convierte la elección de ventana en una decisión de memoria, no de configuración en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional con formato de instrucciones (chat), heredada del ajuste de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas en dominios generales, limitado por el tamaño de 1,5B parámetros.
- Generación de código y explicaciones técnicas, con calidad moderada propia de un modelo pequeño.
- Capacidades multilingües heredadas del modelo base; el repositorio no documenta la lista concreta de idiomas.
- Inferencia totalmente local en Android arm64, sin conexión de red ni servidores.
- Dos rutas de ejecución: CPU vía XNNPACK y GPU vía Vulkan.
- Integración con la aplicación Android openweights y con cualquier runtime ExecuTorch 1.5.1.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional offline en Android: el modelo puede gestionar diálogos multi-turno con una ventana de hasta 32.768 tokens si el dispositivo dispone de memoria suficiente, sin enviar datos a la nube. Adecuado para aplicaciones de privacidad estricta.
- Autocompletado y redacción en teclados o apps de notas: con la variante de 2k o 4k en XNNPACK (1,11 GB) se obtiene un generador de texto ligero que cabe en el presupuesto de memoria de un teléfono de gama media-alta.
- Resumen de documentos cortos en dispositivo: con la ventana de 8k o 16k se pueden procesar correos, artículos o transcripciones sin salir del terminal, usando el backend Vulkan para reducir latencia.
- Asistencia a la programación en movilidad: generación de fragmentos de código y explicaciones en editores móviles, aprovechando la capacidad de código del modelo base y la ejecución local.
- Traducción y reescritura de textos personales: el modelo base es multilingüe, de modo que puede emplearse para traducciones informales o reformulación de mensajes dentro de una app, con la ventaja de no requerir conectividad.
- Prototipado e investigación en IA de borde: sirve como banco de pruebas para medir latencia, consumo y calidad de ExecuTorch en distintos chips arm64, comparando las rutas XNNPACK y Vulkan con las mismas ventanas de contexto.
- Aplicaciones educativas y de accesibilidad: tutores o asistentes de lectura que funcionan en dispositivos sin red, con la ventana de 4k como equilibrio entre memoria y contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de humo: las cinco variantes XNNPACK superaron una generación de prueba con la respuesta "Paris", mientras que las variantes Vulkan solo fueron verificadas estructuralmente por ausencia de runtime NPU en el host de exportación. No se proporcionan cifras de latencia, throughput ni evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,11 GB (XNNPACK 2k) y 1,49 GB (Vulkan 32k) para los pesos, más la caché KV completa reservada al cargar: 117 MB a 2k, 235 MB a 4k, 470 MB a 8k, 940 MB a 16k y 1,88 GB a 32k.
- Presupuesto total orientativo: en torno a 1,3 GB para la configuración XNNPACK 2k y hasta unos 3,4 GB para Vulkan 32k, sumando pesos y caché KV.
- Plataforma: cualquier dispositivo Android arm64; el autor estima la viabilidad con un presupuesto de 5 GB reflejado en `fits_phone_budget` de cada `config.json`.
- GPU recomendadas: no aplica en el sentido de servidor; para la ruta Vulkan se requiere una GPU integrada compatible con el delegado Vulkan de ExecuTorch. No se especifican modelos de SoC concretos.
- Cabe en GPU de consumo: no aplica; el destino es hardware móvil, no tarjetas gráficas de escritorio. No se documenta ejecución en A100, H100 o RTX 4090.
- Opciones de despliegue: runtime ExecuTorch 1.5.1 con delegados XNNPACK o Vulkan; aplicación Android openweights (https://github.com/alpharomercoma/openweights). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos artefactos `.pte`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-ExecuTorch | 1,5B | 2k-32k (fija por fichero) | `.pte` / ExecuTorch (Android arm64) | Apache 2.0 | Cuantizado int4/int8, CPU y GPU móvil |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | no disponible en esta ficha | safetensors / Transformers, vLLM, etc. | Apache 2.0 | Pesos completos, requiere servidor o GPU |
| Gemma 2 2B Instruct | 2B | no disponible en esta ficha | safetensors, GGUF y variantes móviles | Términos Gemma | Alternativa de tamaño similar con ecosistema móvil |
| Llama 3.2 1B Instruct | 1B | no disponible en esta ficha | safetensors, GGUF y variantes móviles | Licencia Llama 3.2 | Menor tamaño, requiere aceptar licencia |

La comparación se limita a parámetros, contexto, formato y licencia porque la información proporcionada no incluye resultados de benchmarks que permitan contrastar calidad. Frente al modelo original, esta exportación sacrifica flexibilidad de contexto (ventana fija) y precisión (cuantización) a cambio de ejecución local en Android.

## Limitaciones y advertencias

- Ventana de contexto fija por fichero: no se puede ampliar ni reducir en tiempo de ejecución; hay que elegir la variante adecuada antes del despliegue.
- Reserva completa de la caché KV al cargar: en la variante de 32k se reservan 1,88 GB solo para la caché, lo que puede provocar fallos de memoria en dispositivos modestos.
- Precisión reducida por cuantización: pesos int4 con grupos de 32 y activaciones int8 pueden degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento complejo.
- Tamaño de 1,5B parámetros: capacidad limitada para razonamiento multi-paso, matemáticas avanzadas y contextos muy técnicos; mayor riesgo de alucinación que modelos de mayor escala.
- Idiomas: la lista concreta no está documentada en el repositorio; la cobertura depende del modelo base Qwen2.5 y no está verificada para esta exportación.
- Pruebas limitadas: las variantes Vulkan no se ejecutaron en un dispositivo real durante la exportación; solo se comprobó su estructura.
- Sin soporte documentado de tool calling, agentes o multimodalidad en esta exportación.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el fichero LICENSE incluido; el modelo base mantiene sus propios términos.
- Dependencia de ExecuTorch 1.5.1: versiones distintas del runtime pueden no ser compatibles con los `.pte` generados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen2.5-1.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: https://github.com/pytorch/executorch
