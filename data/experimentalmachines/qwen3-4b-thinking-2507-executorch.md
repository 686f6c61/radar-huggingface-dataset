# experimentalmachines/Qwen3-4B-Thinking-2507-ExecuTorch

## Resumen

Qwen3-4B-Thinking-2507-ExecuTorch es una exportación cuantizada del modelo Qwen/Qwen3-4B-Thinking-2507, publicada por el usuario experimentalmachines. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo original de Qwen (Alibaba) al formato ExecuTorch 1.5.1, pensada para inferencia en dispositivo (on-device) sobre Android con aceleración Vulkan en cualquier SoC arm64. El objetivo es ejecutar un modelo de razonamiento de 4 mil millones de parámetros directamente en un teléfono, sin depender de la nube.

La relevancia de esta ficha radica en que demuestra que un modelo de la familia Qwen3 con modo "thinking" puede empaquetarse en un único archivo `.pte` de aproximadamente 3,4-3,5 GB y correr sobre la GPU integrada de un móvil mediante el delegado Vulkan de ExecuTorch. La ventana de contexto es fija por archivo (2k, 4k, 8k o 16k tokens) porque el runtime reserva la totalidad de la caché KV al cargar el modelo, lo que impone un compromiso directo entre contexto disponible y memoria del dispositivo.

El repositorio tiene 13,8 GB en total, correspondientes a las cuatro variantes de ventana de contexto más el tokenizador y los informes de exportación. La licencia es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en formato `.pte` (ExecuTorch), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-4B-Thinking-2507; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | Fija por archivo: 2.048, 4.096, 8.192 o 16.384 tokens |
| Tipos de cuantizacion | Activaciones int8 dinamicas, pesos 4 bits en grupos de 32, embeddings int8 por canal (esquema 8da4w) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch 1.5.1) |

## Arquitectura y entrenamiento

Esta ficha describe una exportación, no un entrenamiento. El modelo subyacente es Qwen/Qwen3-4B-Thinking-2507 (revisión `768f209d9ea8`), un transformer de 4 mil millones de parámetros de la familia Qwen3 con modo de razonamiento extendido ("thinking"). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

La innovación técnica de esta publicación es el pipeline de exportación: se ha usado la herramienta `export_llm` de ExecuTorch 1.5.1 con cuantización 8da4w (activaciones int8 dinámicas, pesos 4 bits agrupados de 32 en 32, embeddings int8 por canal), delegado Vulkan para GPU, troceado de prefill de 2.048 tokens y caché KV en fp32. El resultado son cuatro archivos `.pte` independientes, uno por ventana de contexto, con tamaños de 3,42 GB (2k), 3,43 GB (4k), 3,46 GB (8k) y 3,51 GB (16k). La caché KV consume 294.912 bytes por token en fp32, lo que se traduce en 603,98 MB para 2k tokens y 4,83 GB para 16k tokens, reservados íntegramente al cargar el modelo.

## Capacidades

- Generación de texto con razonamiento explícito en modo "thinking", heredado de Qwen3-4B-Thinking-2507.
- Razonamiento multi-paso y cadenas de pensamiento (la variante "Thinking" está diseñada para este fin).
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base; no se detallan métricas en la información disponible).
- Inferencia totalmente local en dispositivo Android arm64, sin conexión a red.
- Aceleración por GPU mediante el delegado Vulkan de ExecuTorch.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento offline en Android: el modelo puede ejecutarse íntegramente en el teléfono con la variante de 4k u 8k tokens, útil para aplicaciones de productividad o estudio que deben funcionar sin conectividad y sin enviar datos a servidores externos.
- Procesamiento de documentos privados en el dispositivo: con la ventana de 16k tokens se pueden analizar contratos, informes o correos largos localmente, manteniendo la confidencialidad del contenido.
- Tutor o asistente educativo embebido: el modo "thinking" permite generar explicaciones paso a paso de problemas matemáticos o lógicos, adecuado para apps educativas que no quieren depender de APIs en la nube.
- Prototipado de agentes locales: la app openweights y el runtime ExecuTorch permiten integrar el modelo en flujos de agente en Android, con la ventana de contexto elegida según la memoria del dispositivo.
- Evaluación de modelos on-device para investigación: investigadores pueden medir latencia, consumo de memoria y calidad de razonamiento de un modelo de 4B cuantizado en hardware móvil real, usando los archivos `.pte` y los informes de exportación incluidos.
- Demostraciones y pruebas de concepto de IA generativa sin backend: útil para ferias, entornos aislados o aplicaciones donde el coste de infraestructura cloud es prohibitivo.
- Integración en apps Android mediante ExecuTorch 1.5.1: cualquier runtime compatible puede cargar los `.pte`, lo que facilita incorporar generación de texto a aplicaciones nativas sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la estructura de los archivos fue verificada ("structure checked") y que no se dispone de runtime NPU en el host para pruebas funcionales completas.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa entre 3,42 y 3,51 GB según la ventana; a ello se suma la caché KV reservada al cargar: 604 MB (2k), 1,21 GB (4k), 2,42 GB (8k) y 4,83 GB (16k) en fp32.
- Presupuesto de referencia: la model card usa un presupuesto de 5 GB (`fits_phone_budget`) para estimar qué ventana cabe en cada dispositivo.
- GPU recomendadas: cualquier SoC arm64 con soporte Vulkan; no se especifican modelos concretos de GPU móvil (Adreno, Mali, Xclipse) en la información disponible.
- Cabe en GPU de consumo de escritorio: no está pensado para ello; el objetivo es Android arm64 con Vulkan. No se documenta soporte para A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime ExecuTorch 1.5.1 con delegado Vulkan; app Android openweights (https://github.com/alpharomercoma/openweights). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Objetivo |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507-ExecuTorch (esta ficha) | 4B | 2k-16k fijo por archivo | `.pte` (ExecuTorch) | Apache 2.0 | On-device Android (Vulkan) |
| Qwen/Qwen3-4B-Thinking-2507 (modelo base) | 4B | no disponible en la informacion proporcionada | safetensors (formato habitual de Qwen; no confirmado aqui) | Apache 2.0 | Servidor / GPU |
| Otras exportaciones ExecuTorch de modelos ~4B | no disponible | no disponible | `.pte` | variable | On-device |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre esta exportación y alternativas, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Ventana de contexto fija por archivo: no se puede ampliar en tiempo de ejecución; hay que elegir el `.pte` adecuado antes de cargar el modelo.
- Consumo de memoria elevado: la caché KV en fp32 reservada al completo limita la ventana práctica a lo que aguante el dispositivo; la variante de 16k requiere unos 4,83 GB solo para KV.
- Sin validación funcional completa: la model card indica "structure checked (no host NPU runtime)", es decir, la estructura del archivo fue verificada pero no se ejecutó una prueba funcional completa en el entorno de exportación.
- Cuantización agresiva: pesos en 4 bits y activaciones int8 pueden degradar la calidad respecto al modelo original, especialmente en tareas de razonamiento largo.
- Sesgos y alucinaciones: no se documentan sesgos específicos en la información proporcionada; al ser un derivado de Qwen3, hereda los riesgos del modelo base (alucinación y sesgos no cuantificados aquí).
- Idiomas: no se especifican los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Tool calling y agentes: no se confirma soporte en esta exportación.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el archivo LICENSE del modelo base incluido en el repositorio.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-4B-Thinking-2507-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- App Android openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: no se proporciona enlace directo en la información disponible.
