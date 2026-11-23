# experimentalmachines/Qwen2.5-Math-1.5B-Instruct-ExecuTorch

## Resumen

Qwen2.5-Math-1.5B-Instruct-ExecuTorch es una exportación cuantizada del modelo Qwen2.5-Math-1.5B-Instruct de Alibaba Qwen, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) mediante el runtime ExecuTorch 1.5.1. El objetivo no es ofrecer un nuevo modelo, sino un artefacto listo para ejecutarse en Android sobre arquitecturas arm64, con dos backends: XNNPACK (CPU) y Vulkan (GPU). El modelo base está especializado en razonamiento matemático y sigue la estela de la familia Qwen2.5.

El repositorio incluye diez ficheros `.pte` con ventanas de contexto fijas de 2k, 4k, 8k, 16k y 32k tokens, cada uno con su propio KV cache preasignado al cargar. La cuantización es de 8 bits en activaciones dinámicas y 4 bits en pesos por grupos de 32 (esquema 8da4w con GPTQ), con embeddings int8 por canal. El tamaño de los ficheros oscila entre 1,11 GB (CPU, 2k) y 1,49 GB (GPU, 32k).

Es relevante para desarrolladores que necesitan ejecutar un modelo matemático competente en teléfonos y dispositivos edge sin conexión, con licencia Apache 2.0 y pesos abiertos. La contrapartida es que la ventana de contexto queda fijada en el fichero y el consumo de memoria del KV cache es elevado en configuraciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Math-1.5B-Instruct) |
| Parametros totales | 1,5 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens, fijada por fichero |
| Tipos de cuantizacion | 8da4w GPTQ: activaciones int8 dinamicas, pesos int4 en grupos de 32, embeddings int8 por canal, KV cache fp32 |
| Idiomas soportados | no disponible (la model card no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch), tokenizer en `tokenizer.json` |
| Backends | XNNPACK (CPU arm64), Vulkan (GPU arm64) |
| Version de runtime | ExecuTorch 1.5.1 |
| Tamano de ficheros | 1,11-1,17 GB (XNNPACK); 1,40-1,49 GB (Vulkan) |
| Tamano del repo | 29,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Math-1.5B-Instruct: un transformer decoder-only de 1,5 mil millones de parámetros, ajustado por instrucciones y especializado en matemáticas. La model card de esta exportación no documenta el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esa información corresponde al repositorio del modelo base.

La innovación de esta ficha está en el proceso de exportación. Se usa `export_llm` de ExecuTorch 1.5.1 con cuantización 8da4w GPTQ (activaciones dinámicas de 8 bits, pesos de 4 bits en grupos de 32), embeddings int8 por canal, chunk de prefill de 2.048 tokens y KV cache en fp32. Para el backend Vulkan se emplea el delegado Vulkan; para CPU, XNNPACK con operaciones extendidas. La ventana de contexto se compila dentro del fichero `.pte`, de modo que el runtime reserva el KV cache completo al cargar el modelo: 57.344 bytes por token, lo que supone 117 MB para 2k y 1,88 GB para 32k.

## Capacidades

- Generación de texto con foco en razonamiento matemático y resolución de problemas paso a paso, heredado del ajuste de instrucciones del modelo base.
- Generación de código y explicaciones técnicas, capacidad propia de la familia Qwen2.5.
- Conversación multi-turno dentro de la ventana fijada en el fichero (hasta 32k tokens).
- Inferencia totalmente local y offline en dispositivos arm64 (Android), sin dependencia de servidores.
- Ejecución sobre CPU (XNNPACK) o GPU (Vulkan) según el fichero elegido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Tutor matemático offline en Android: integrado en una app educativa, el modelo resuelve ejercicios de álgebra y cálculo en el propio dispositivo, sin enviar datos del estudiante a la nube y usando la ventana de 4k u 8k para problemas con enunciado largo.
- Asistente de estudio en zonas sin conectividad: con el fichero de 2k (1,11 GB) cabe en dispositivos modestos y permite consultas matemáticas puntuales en campo, aulas o entornos aislados.
- Verificación de cálculos en aplicaciones de finanzas personales: el modelo puede explicar paso a paso la resolución de fórmulas de interés compuesto o amortización dentro de la app, con la ventana de 2k suficiente para el contexto típico.
- Preprocesado de problemas en pipelines de evaluación: usar la exportación Vulkan de 8k para generar soluciones de referencia en un banco de pruebas móvil antes de sincronizar resultados.
- Prototipado de agentes matemáticos en edge: combinado con el runtime ExecuTorch en un dispositivo arm64, sirve para validar flujos de razonamiento multi-paso antes de portarlos a modelos mayores.
- Demostraciones y docencia sobre inferencia on-device: el repositorio incluye informes de exportación y pruebas de humo, lo que lo hace útil para enseñar cuantización 8da4w, delegados XNNPACK/Vulkan y gestión de KV cache.
- Aplicaciones de privacidad estricta: cualquier escenario donde el texto del usuario no pueda salir del dispositivo (datos médicos, financieros o industriales) y se requiera razonamiento cuantitativo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba de humo cualitativa: los cinco ficheros XNNPACK generan "Paris" correctamente; los ficheros Vulkan solo se comprobó su estructura porque no había runtime NPU en el host de exportación.

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,11 GB y 1,17 GB para los ficheros XNNPACK; entre 1,40 GB y 1,49 GB para los Vulkan. A ello se suma el KV cache preasignado: 117 MB (2k), 235 MB (4k), 470 MB (8k), 940 MB (16k) y 1,88 GB (32k).
- Presupuesto de referencia: la model card usa un límite de 5 GB (`fits_phone_budget`) para decidir qué ventana cabe en un teléfono.
- GPU recomendadas: no aplica a GPU de servidor; el objetivo son SoC arm64 con soporte Vulkan en Android. Para el backend CPU basta cualquier arm64.
- Cabe en GPU de consumo: no aplica; no es un modelo pensado para RTX 4090, A100 o H100, sino para móviles y dispositivos edge.
- Opciones de despliegue: runtime ExecuTorch 1.5.1, app Android openweights (github.com/alpharomercoma/openweights) o cualquier runtime ExecuTorch compatible con `.pte`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-Instruct-ExecuTorch (esta ficha) | 1,5B | 2k-32k fijo por fichero | `.pte` (ExecuTorch) | Apache 2.0 | On-device Android, matemáticas |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,5B | 32.768 tokens (modelo base) | safetensors | Apache 2.0 | Servidor/GPU, matemáticas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Propósito general |
| Gemma 2 2B | 2,6B | 8.192 tokens | safetensors, GGUF | Términos Gemma | Propósito general |

La comparación directa más justa es con el modelo base: esta exportación sacrifica flexibilidad de contexto (ventana fija) y algo de precisión por la cuantización 4 bits a cambio de ejecución local en Android. Frente a alternativas como Gemma 2 2B, la ventaja es la licencia Apache 2.0 y la especialización matemática; la desventaja, el ecosistema ExecuTorch más restringido que GGUF/llama.cpp.

## Limitaciones y advertencias

- Ventana de contexto fija: no se puede ampliar en tiempo de ejecución; hay que elegir el fichero adecuado y el KV cache se reserva completo al cargar, lo que puede agotar la memoria en dispositivos modestos con 16k o 32k.
- La cuantización 4 bits en pesos puede degradar la precisión en problemas matemáticos largos; no hay benchmarks publicados que cuantifiquen esa pérdida.
- Los ficheros Vulkan no se validaron en ejecución real (solo estructura), por lo que su comportamiento en GPU móvil no está verificado.
- Riesgo de alucinación inherente a un modelo de 1,5B: puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Idiomas soportados no documentados en esta exportación; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia incluido en el repositorio.
- El repositorio ocupa 29 GB por incluir todas las variantes; para despliegue basta descargar un único `.pte` y el tokenizer.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen2.5-Math-1.5B-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct/blob/main/LICENSE
- App Android openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch (documentación y runtime): https://github.com/pytorch/executorch
