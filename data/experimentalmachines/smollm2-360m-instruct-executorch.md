# experimentalmachines/SmolLM2-360M-Instruct-ExecuTorch

## Resumen

SmolLM2-360M-Instruct-ExecuTorch es una exportación del modelo SmolLM2-360M-Instruct de Hugging Face a formato ExecuTorch, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) en Android. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original (revisión `a10cc1512eab`) a artefactos `.pte` que pueden ejecutarse con el runtime ExecuTorch 1.4.0 y con la aplicación Android openweights. El objetivo es permitir generación de texto completamente local en teléfonos, sin conexión a red ni servidores externos.

El repositorio incluye múltiples ventanas de contexto fijas (desde 2.048 hasta 32.768 tokens) para tres backends distintos: XNNPACK en CPU (fp32), Vulkan en GPU (cuantización 8da4w con GPTQ) y MediaTek NeuroPilot para el SoC MT6991 (Dimensity 9400), con cuantización a16w8. El tamaño de los ficheros varía entre 0,09 GB y 1,51 GB según backend y ventana, lo que permite ajustar el despliegue a la memoria disponible en el dispositivo.

La relevancia de esta ficha radica en que demuestra un patrón práctico de despliegue de un LLM pequeño (360M parámetros) en hardware móvil de consumo, con soporte para aceleración por GPU (Vulkan) y NPU (MediaTek), y con licencia Apache 2.0 que facilita su integración en productos comerciales. Es un caso de estudio de inferencia edge más que un modelo con capacidades de razonamiento avanzado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct); exportada a ExecuTorch |
| Parametros totales | 360M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (ventana fija por fichero) |
| Tipos de cuantizacion | fp32 (XNNPACK CPU); 8da4w con GPTQ (Vulkan GPU); a16w8 (MediaTek NeuroPilot) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); pesos base en safetensors vía SmolLM2-360M-Instruct |
| Backends soportados | XNNPACK (CPU arm64), Vulkan (GPU arm64), MediaTek NeuroPilot (MT6991) |
| Runtime requerido | ExecuTorch 1.4.0 |
| Tamano del repo | 13,9 GB |
| Revision del modelo base | `a10cc1512eab` |

## Arquitectura y entrenamiento

El modelo subyacente, SmolLM2-360M-Instruct, es un transformer decoder-only de 360M parámetros desarrollado por Hugging Face, entrenado sobre un corpus de datos web y de código y afinado con instrucciones. La model card de esta exportación no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la ficha del modelo base y no se reproducen aquí por no estar incluidos en la información proporcionada.

La contribución técnica de este repositorio es la conversión a ExecuTorch con tres rutas de ejecución diferenciadas. XNNPACK ejecuta en CPU con precisión fp32 y un tamaño constante de 1,50 GB independientemente de la ventana (1,51 GB en 32k). Vulkan emplea cuantización de pesos 8da4w con GPTQ, reduciendo el artefacto a 0,32-0,38 GB. MediaTek NeuroPilot usa a16w8 y divide el modelo en cuatro chunks por ventana, con ficheros de 0,09-0,14 GB cada uno. La ventana de contexto está fijada dentro del fichero: el runtime reserva la totalidad de la caché KV al cargar, por lo que debe elegirse la ventana más grande que el dispositivo pueda sostener; cada carpeta incluye un `config.json` con la estimación `fits_phone_budget` contra un presupuesto de 5 GB.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del ajuste instructivo de SmolLM2-360M-Instruct.
- Ejecución completamente local en Android, sin dependencia de red ni de servicios en la nube.
- Inferencia en CPU (XNNPACK), GPU (Vulkan) y NPU MediaTek (NeuroPilot) según el artefacto elegido.
- Selección de ventana de contexto en el momento del despliegue (2k, 4k, 8k, 16k o 32k) según la memoria del dispositivo.
- Integración con la aplicación openweights para Android y con cualquier runtime ExecuTorch 1.4.0.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de texto sin conexión en Android: el modelo se ejecuta íntegramente en el dispositivo con XNNPACK o Vulkan, de modo que la conversación no sale del teléfono y funciona en modo avión, lo que resulta adecuado para aplicaciones de privacidad estricta.
- Autocompletado y redacción en teclados o apps de notas: con la variante Vulkan de 0,32 GB y ventana de 2k, el modelo cabe holgadamente en el presupuesto de memoria de un móvil de gama media-alta y ofrece baja latencia para sugerencias cortas.
- Clasificación y etiquetado de texto local: tareas de categorización de mensajes, detección de intención o extracción simple pueden resolverse con prompts cortos dentro de una ventana de 2k-4k, sin coste de servidor.
- Prototipado de pipelines edge con ExecuTorch: el repositorio sirve como referencia para validar la exportación de un transformer pequeño a XNNPACK, Vulkan y NeuroPilot antes de escalar a modelos mayores.
- Demostraciones en dispositivos MediaTek Dimensity 9400: la variante NeuroPilot a16w8, con chunks de 0,09-0,14 GB, permite evaluar la aceleración por NPU en hardware de 2024-2025 con un consumo de almacenamiento mínimo.
- Aplicaciones educativas o de investigación sobre inferencia móvil: comparar fp32 en CPU frente a 8da4w en GPU y a16w8 en NPU con el mismo modelo base facilita el estudio de compromisos entre precisión, memoria y latencia.
- Filtrado y resumen de textos cortos en el propio terminal: con la ventana de 8k o 16k en Vulkan (0,33-0,35 GB) se pueden procesar correos o mensajes largos sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pruebas de humo (smoke tests): las variantes XNNPACK superaron la prueba generando "Paris", mientras que las variantes Vulkan y MediaTek NeuroPilot solo fueron verificadas estructuralmente, sin runtime NPU en el host de exportación. No se proporcionan cifras de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: entre 0,09 GB por chunk (NeuroPilot 2k) y 1,51 GB (XNNPACK 32k en fp32). El presupuesto de referencia de la model card es de 5 GB para el dispositivo completo.
- XNNPACK (CPU): requiere cualquier arm64; el artefacto ocupa 1,50 GB y no necesita GPU.
- Vulkan (GPU): requiere un dispositivo arm64 con drivers Vulkan; el artefacto ocupa 0,32-0,38 GB y es la opción más ligera para GPU de móvil.
- MediaTek NeuroPilot: exclusivo del SoC MT6991 (Dimensity 9400); el modelo se reparte en cuatro chunks por ventana.
- GPU de escritorio: no aplica; este repositorio está orientado a Android y ExecuTorch, no a A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el despliegue objetivo es un SoC móvil, no una GPU de PC.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 y la aplicación Android openweights (https://github.com/alpharomercoma/openweights). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-ExecuTorch (este) | 360M | 2k-32k (fijo por fichero) | `.pte` para XNNPACK, Vulkan, NeuroPilot | Apache 2.0 | Hugging Face, 912 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct (base) | 360M | no disponible en la informacion | safetensors (transformers) | Apache 2.0 | Hugging Face |
| Alternativas de 360M en formato ExecuTorch | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras exportaciones ExecuTorch comparables en la información proporcionada, por lo que la comparación se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El modelo base tiene 360M parámetros, por lo que su capacidad de razonamiento, matemáticas y código es limitada en comparación con modelos de miles de millones de parámetros; es propenso a errores en tareas complejas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, agravado por la cuantización 8da4w y a16w8, que puede degradar la calidad respecto a fp32.
- La ventana de contexto es fija por fichero y se reserva completa al cargar; elegir una ventana mayor de la que el dispositivo soporta provoca fallos de memoria. La estimación `fits_phone_budget` es orientativa contra un presupuesto de 5 GB.
- Las variantes Vulkan y NeuroPilot solo fueron verificadas estructuralmente, no ejecutadas en el host de exportación; su funcionamiento real depende del dispositivo y de los drivers.
- La variante NeuroPilot está restringida al SoC MediaTek MT6991 (Dimensity 9400); no es portable a otros chips.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredarse del corpus de entrenamiento de SmolLM2, es previsible que arrastre sesgos de datos web, pero no se documentan.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El repositorio ocupa 13,9 GB por acumulación de variantes; la descarga completa no es necesaria si solo se usa un backend.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/SmolLM2-360M-Instruct-ExecuTorch
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Aplicación openweights para Android: https://github.com/alpharomercoma/openweights
