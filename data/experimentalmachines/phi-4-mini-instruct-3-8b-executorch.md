# experimentalmachines/Phi-4-mini-instruct-3.8B-ExecuTorch

## Resumen

Phi-4-mini-instruct-3.8B-ExecuTorch es una exportación cuantizada del modelo microsoft/Phi-4-mini-instruct (revisión `cfbefacb9925`) realizada por el usuario experimentalmachines, empaquetada en formato `.pte` para su ejecución con el runtime ExecuTorch 1.5.1 en dispositivos Android arm64. El objetivo no es distribuir un modelo nuevo, sino ofrecer artefactos listos para inferencia on-device con aceleración Vulkan, de modo que el modelo pueda ejecutarse en la GPU de un teléfono sin depender de la nube.

El repositorio contiene dos variantes con ventana de contexto fija: 2.048 y 4.096 tokens, ambas con cuantización 8da4w (activaciones dinámicas de 8 bits, pesos de 4 bits en grupos de 32) y caché KV en fp32. El tamaño de cada archivo ronda los 3,5 GB, lo que condiciona el despliegue a dispositivos con presupuesto de memoria suficiente (el autor estima contra un límite de 5 GB).

La relevancia de esta ficha es doble: por un lado, documenta el proceso de exportación y las restricciones de memoria de un LLM de 3.800 millones de parámetros en un entorno móvil; por otro, sirve como referencia práctica de cómo se empaqueta un modelo de pesos abiertos para ExecuTorch. La licencia MIT del modelo base se mantiene sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/Phi-4-mini-instruct; no se detalla en la model card) |
| Parametros totales | 3.800 millones (3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 o 4.096 tokens, fija por archivo (la ventana se fija en la exportación) |
| Tipos de cuantizacion | 8da4w: activaciones dinámicas int8, pesos 4 bits en grupos de 32, embeddings int8 por canal, caché KV fp32 |
| Idiomas soportados | no disponible en la model card (heredados del modelo base, no listados) |
| Licencia | MIT (la misma que microsoft/Phi-4-mini-instruct) |
| Formato de pesos | `.pte` (ExecuTorch), más `tokenizer.json` y `config.json` por backend |
| Tamano del repo | 7,0 GB |
| Backend | Vulkan (GPU), target arm64 |
| Runtime | ExecuTorch 1.5.1 |
| Prefill chunk | 2.048 tokens |

## Arquitectura y entrenamiento

La model card de esta exportación no describe la arquitectura interna ni el proceso de entrenamiento del modelo original; solo documenta el pipeline de exportación. Se sabe que parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only de 3.800 millones de parámetros, pero no se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta ficha está en la exportación: se usa el comando `export_llm` de ExecuTorch 1.5.1 con el delegado Vulkan, cuantización 8da4w, embeddings int8 por canal, prefill de 2.048 tokens y caché KV en fp32. La ventana de contexto queda fijada dentro del archivo `.pte`, porque el runtime reserva la caché KV completa al cargar el modelo. El coste de esa caché es de 262.144 bytes por token en fp32: 536.870.912 bytes para la ventana de 2.048 tokens y 1.073.741.824 bytes para la de 4.096. Cada carpeta de backend incluye un `config.json` con todas las variantes y un `export-report-<window>.json` con el registro completo de la exportación.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`).
- Inferencia on-device en Android arm64 con aceleración GPU mediante el delegado Vulkan de ExecuTorch.
- Ejecución offline: al ser un artefacto local, no requiere conectividad de red una vez desplegado.
- Integración con la app Android openweights o con cualquier runtime ExecuTorch 1.5.1.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no disponibles en la model card de esta exportación; deben consultarse en la ficha de microsoft/Phi-4-mini-instruct.
- No se documentan modos de pensamiento, visión ni audio en esta exportación.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo puede gestionar diálogos multi-turno dentro de la ventana de 2.048 o 4.096 tokens, sin enviar datos a servidores externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Procesamiento de texto en campo o en entornos sin conectividad: al ejecutarse íntegramente en el dispositivo, sirve para resumir, reescribir o clasificar texto en escenarios remotos.
- Prototipado de aplicaciones móviles con ExecuTorch: los artefactos `.pte` y los informes de exportación permiten validar pipelines de inferencia on-device antes de invertir en infraestructura propia.
- Evaluación de rendimiento de LLM en GPU móvil: las dos variantes de ventana permiten medir el impacto de la caché KV (512 MB frente a 1 GB) en dispositivos con distinto presupuesto de memoria.
- Filtrado y moderación local de contenido: un modelo de 3.8B cuantizado puede clasificar o reescribir texto generado por el usuario en el propio terminal, reduciendo la latencia frente a una llamada a la nube.
- Educación y demostraciones técnicas: útil para talleres y pruebas de concepto sobre despliegue de modelos de pesos abiertos en Android con Vulkan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la estructura de los archivos fue comprobada ("structure checked") y que no se dispone de runtime NPU en el host para pruebas de humo completas. No se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM/memoria estimada: cada archivo `.pte` ocupa aproximadamente 3,50 GB (ventana de 2.048 tokens) o 3,51 GB (ventana de 4.096 tokens). A ello se suma la caché KV reservada al cargar: 512 MB o 1 GB respectivamente, en fp32.
- Presupuesto de memoria: el autor estima la viabilidad contra un límite de 5 GB (`fits_phone_budget` en cada `config.json`).
- GPU: cualquier dispositivo arm64 con soporte del delegado Vulkan de ExecuTorch; no se especifican modelos concretos de SoC.
- GPU de escritorio: no aplica; el artefacto está orientado a Android arm64 y el host de exportación no dispone de runtime NPU para pruebas.
- Consumer GPU: no procede para este formato; para ejecutar el modelo base en PC habría que usar otros formatos (por ejemplo GGUF) no incluidos en este repositorio.
- Opciones de despliegue: app Android openweights o cualquier runtime ExecuTorch 1.5.1. No se ofrecen artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-3.8B-ExecuTorch (esta ficha) | 3,8B | 2.048 o 4.096 fijo | `.pte` (ExecuTorch) | MIT | On-device Android arm64 con Vulkan |
| microsoft/Phi-4-mini-instruct | 3,8B | no disponible en esta ficha | safetensors (modelo original) | MIT | Servidor/escritorio, punto de partida de la exportación |
| Otras exportaciones ExecuTorch de LLM | no disponible | no disponible | `.pte` | variable | On-device; no se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre benchmarks ni sobre alternativas comparables en la documentación consultada; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Ventana de contexto fija: no se puede ampliar en tiempo de ejecución; hay que elegir entre 2.048 y 4.096 tokens al seleccionar el archivo.
- Consumo de memoria elevado: la caché KV se reserva completa al cargar (512 MB o 1 GB en fp32), lo que puede impedir la ejecución en dispositivos con menos de 5 GB disponibles.
- Pruebas de humo incompletas: el autor indica que solo se comprobó la estructura de los archivos, sin runtime NPU en el host; no hay validación funcional publicada.
- Idiomas soportados no documentados en esta exportación; deben verificarse en el modelo base.
- Sesgos y riesgo de alucinación: no se documentan en esta model card; son los heredados del modelo base y no han sido evaluados aquí.
- Cuantización agresiva: los pesos en 4 bits y las activaciones en 8 bits pueden degradar la calidad frente al modelo original; no se aportan métricas de esa degradación.
- Licencia MIT: permite uso comercial, pero se deben conservar los archivos `LICENSE` y `NOTICE.md` incluidos, y verificar las condiciones del modelo base.
- Dependencia de versión: el artefacto está atado a ExecuTorch 1.5.1 y al delegado Vulkan; cambios de versión del runtime pueden romper la compatibilidad.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Phi-4-mini-instruct-3.8B-ExecuTorch
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- App Android openweights: https://github.com/alpharomercoma/openweights
- Archivo Vulkan 2k: https://huggingface.co/experimentalmachines/Phi-4-mini-instruct-3.8B-ExecuTorch/blob/main/vulkan/Phi-4-mini-instruct-3.8B-vulkan-8da4w-2k.pte
- Archivo Vulkan 4k: https://huggingface.co/experimentalmachines/Phi-4-mini-instruct-3.8B-ExecuTorch/blob/main/vulkan/Phi-4-mini-instruct-3.8B-vulkan-8da4w-4k.pte
- Tokenizer: https://huggingface.co/experimentalmachines/Phi-4-mini-instruct-3.8B-ExecuTorch/blob/main/tokenizer.json
