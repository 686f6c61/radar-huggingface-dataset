# frankdu/SD-Turbo-Mobile-INT8-LiteRT

## Resumen

SD-Turbo Mobile INT8 LiteRT es una exportación cuantizada del modelo de difusión texto-a-imagen `stabilityai/sd-turbo` de Stability AI, publicada por el usuario frankdu. El artefacto convierte el export FP32 a LiteRT en un paquete de grafos segmentados pensado para ejecutarse en CPU de teléfonos Android de gama alta, reduciendo el peso de los ficheros de runtime de 5,03 GB a 1,32 GB. La arquitectura y el sampler no se modifican: el codificador de texto y la UNet pasan a INT8 dinámico por canal y el VAE a FP16 con activaciones en coma flotante, mientras los grafos del sampler se mantienen en FP32.

El interés práctico del modelo es que hace viable la generación de imágenes en 512×512 completamente en local, sin conexión de red ni backend GPU, dentro del presupuesto de memoria de un terminal moderno. En la única medición publicada, un Pixel 10 Pro Fold con Tensor G5 completó una imagen de 512×512 en 26,92 segundos con un pico de RSS de proceso de 1,75 GiB. La ruta GPU queda descartada en ese SoC: los layouts actuales fallan la compilación de formas en LiteRT 2.3.

Se trata de un artefacto de despliegue, no de un modelo nuevo: los pesos conservan la Stability AI Community License del modelo base y el autor no los relicencia. Esto condiciona el uso comercial y obliga a revisar la licencia original antes de integrarlo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion latente condicionada por texto (codificador de texto + UNet + VAE), destilada a 1 paso, exportada a grafos LiteRT independientes |
| Parametros totales | no disponible en la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; condicionamiento por prompt de texto, sin ventana de contexto declarada |
| Tipos de cuantizacion | INT8 dinamico por canal (encoder de texto y UNet), FP16 (VAE, con activaciones float), FP32 (grafos del sampler) |
| Idiomas soportados | no disponible |
| Licencia | stabilityai-community (Stability AI Community License) |
| Formato de pesos | LiteRT / TFLite (grafos `.tflite`), con `manifest.json`, `artifact_manifest.json`, `SHA256SUMS` y `quantization.json` |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 1 (modelo destilado, sampler sin cambios respecto al FP32) |
| Tamano de artefactos de runtime | 1,32 GB (desde 5,03 GB en FP32) |
| Grafo mas grande | 99,3 MB; solo un grafo neuronal cargado a la vez |
| Modelo base | stabilityai/sd-turbo |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de `stabilityai/sd-turbo`: un pipeline de difusión latente en el espacio de un VAE, con codificación de texto y una UNet que ha sido destilada para producir imágenes válidas en un solo paso de muestreo. El autor no entrena ni afina nada; el trabajo es exclusivamente de conversión y cuantización. La tabla de specs del pipeline SD-Turbo original no se reproduce en la model card, por lo que los recuentos de parámetros por componente no están disponibles en la información proporcionada.

La conversión se hizo con LiteRT CLI a partir de un export FP32 "pinned" (fijado por hash en el manifiesto). La receta aplica cuantización INT8 dinámica por canal a los pesos del codificador neuronal y de la UNet, deja el VAE en FP16 con activaciones float y mantiene los grafos del sampler en FP32 para no degradar la aritmética del bucle de muestreo. El paquete se fragmenta en grafos pequeños (el mayor, 99,3 MB) para que el runtime cargue solo uno cada vez y mantenga el pico de memoria dentro de lo asumible en un móvil.

Hay una innovación técnica a nivel de tooling que merece mención: el script `conversion/quantize_phone.py` invoca LiteRT CLI, y su punto de entrada `litert_quantize_conv.py` corrige un bug de `ai-edge-quantizer` 0.10.0 en la ruta de chunking de convoluciones de más de 32 MiB (las escalas de broadcast se emiten en la forma 4D original y luego se reforman junto a los pesos). El parche se validó bit a bit contra aritmética INT8 por canal sin chunking sobre un tensor de convolución de 36 MiB, sin sustituir recetas no soportadas de forma silenciosa. La validación cualitativa se hizo con tres generaciones completas en CPU de escritorio (apple, blue teapot, orange cat) comparadas contra la fuente FP32 usando el mismo ruido gaussiano y las mismas semillas en Java.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 en un solo paso de muestreo, orientada a ejecución local en dispositivo.
- Inferencia íntegra en CPU, sin aceleración GPU ni TPU en los layouts publicados.
- Ejecución en Android mediante LiteRT 2.3.0 `CompiledModel`, con I/O `TensorBuffer` de tipo int64 y manifiesto `word-image-litert-v1`.
- Ejecución en escritorio mediante el runtime Python de LiteRT y el script `run_portable.py`, con control de semilla y ruta de salida.
- Carga secuencial de grafos: el pipeline intercambia grafos neuronales en memoria en lugar de mantenerlos todos residentes.
- Reutilización de buffers de entrada marcados con `aliasOfInput` en el manifiesto, con cierre único de buffers compartidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": no es un modelo de lenguaje.
- Capacidad multilingüe de prompt: no disponible (depende del codificador de texto del modelo base, no documentado en esta ficha).

## Casos de uso

- Generación de imágenes offline en aplicaciones Android: el pipeline cabe en 1,32 GB de artefactos y produce una imagen 512×512 en unos 27 segundos en CPU de Tensor G5, lo que permite ofrecer creación de ilustraciones sin conexión y sin coste de API por petición.
- Prototipado de funciones de IA generativa en móvil: útil para equipos que quieren validar la experiencia de usuario de un generador de imágenes antes de invertir en un backend en la nube, usando el mismo modelo que luego escalarán.
- Iteración de prompts con semilla fija: al conservar el sampler FP32 y aceptar semilla explícita, sirve para comparar resultados de forma reproducible entre ejecuciones y entre dispositivos.
- Aplicaciones de privacidad estricta: casos en los que el prompt del usuario no puede salir del dispositivo (contenido médico, educativo, menores) y se necesita generación local aunque la latencia sea de decenas de segundos.
- Validación de pipelines de cuantización: el paquete incluye `quantization.json` con versiones, tamaños por grafo, recetas y hash del manifiesto fuente, además de `SHA256SUMS`, lo que lo convierte en un caso de referencia para auditar una cadena de conversión LiteRT reproducible.
- Pruebas de regresión de calidad tras cuantización: los scripts de validación comparan PSNR y correlación de píxeles contra FP32 por prompt, un patrón reutilizable para evaluar otras exportaciones INT8 de modelos de difusión.
- Demos educativas de difusión de un solo paso: permite explicar en clase o en un taller cómo funciona un sampler destilado ejecutándose en hardware de bolsillo, sin depender de GPU.
- Integración en apps de personalización gráfica: generación de fondos, avatares o ilustraciones a partir de una descripción, aceptando la variabilidad de composición que introduce la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU u otros) en la información disponible. La model card únicamente documenta una validación comparativa contra la fuente FP32 con tres prompts y semillas idénticas, midiendo PSNR, correlación de píxeles, RSS máximo de proceso y tiempos; los valores concretos por prompt se publican en el directorio `validation/` del repositorio, pero no se incluyen en la información disponible.

| Medicion | Entorno | Resultado |
|---|---|---|
| Imagen 512x512 "blue teapot" | Pixel 10 Pro Fold, Tensor G5, CPU, LiteRT 2.3 | 26,92 s |
| Pico de RSS de proceso | Pixel 10 Pro Fold, Tensor G5 | 1,75 GiB |
| Salida GPU | Tensor G5, LiteRT 2.3 | fallo de compilacion de formas; no disponible |
| Validacion de calidad | escritorio, CPU, 3 prompts vs FP32 | salidas finitas, no uniformes y visualmente reconocibles; no identicas a FP32 |
| Tamano de runtime | paquete completo | 1,32 GB (FP32: 5,03 GB) |

## Requisitos de hardware

- VRAM: no aplica en la ruta soportada; el pipeline es CPU-only. Para la ruta de escritorio se ejecuta en CPU del host.
- Memoria: el tamaño de descarga (1,32 GB) no es el pico de RAM. Medición real de pico de RSS de proceso en Tensor G5: 1,75 GiB, incluyendo activaciones, desquantización y cachés del driver.
- Terminal objetivo: gama de 12-16 GB de RAM, ejemplificada en Pixel 10 Pro (Tensor G5, 16 GB) y Pixel 11 Pro (Tensor G6, 12 o 16 GB). Ninguno de esos dos modelos concretos ha sido medido por el autor.
- GPU de consumo: no hay ruta GPU validada. La model card indica que los layouts GPU actuales fallan la compilación en LiteRT 2.3 sobre Tensor G5 y requerirían un export GPU compatible distinto; comprimir los pesos no resuelve ese problema.
- Aceleradores: no es una compilación Tensor AOT/TPU; es un pipeline CPU portable.
- Despliegue en Android: LiteRT 2.3.0 `CompiledModel`, manifiesto `word-image-litert-v1`, I/O int64, un grafo cargado a la vez y reutilización obligatoria del `TensorBuffer` de entrada para cada salida con `aliasOfInput`.
- Despliegue en escritorio: Python 3.12, `requirements.txt` del repositorio y `run_portable.py`; entorno virtual recomendado.
- Opciones no aplicables: vLLM, llama.cpp, Ollama y TGI no sirven para este artefacto, que es un grafo LiteRT de difusión y no un modelo de lenguaje.
- Latencia y throughput: 26,92 s para una imagen 512×512 en Tensor G5 (una sola muestra de humo, app de validación aparte con almacenamiento privado de modelo). No se publica throughput agregado ni latencia en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| SD-Turbo Mobile INT8 LiteRT (este) | no disponible | 512x512 | 1 | stabilityai-community | LiteRT/TFLite, 1,32 GB, CPU Android y escritorio |
| stabilityai/sd-turbo (original) | no disponible | 512x512 | 1-4 | stabilityai-community | safetensors/diffusers, pesos completos |
| Export FP32 LiteRT de sd-turbo (fuente) | no disponible | 512x512 | 1 | stabilityai-community | LiteRT/TFLite, 5,03 GB, citado en la model card |
| SDXL-Turbo | no disponible | 512x512 (base SDXL) | 1-4 | stabilityai-community | safetensors/diffusers; mayor huella de memoria, no orientado a movil |

La comparación relevante aquí es de empaquetado y plataforma más que de calidad: frente al export FP32, este artefacto reduce el peso un 74 % (de 5,03 GB a 1,32 GB) y añade carga secuencial de grafos, a cambio de una pérdida de fidelidad de composición y detalle frente al original. Frente a las alternativas basadas en diffusers, la diferencia es la ruta de ejecución: solo este paquete está validado para LiteRT en CPU Android. No hay datos de benchmarks comparativos publicados en la información disponible para cuantificar la brecha de calidad frente a SDXL-Turbo u otros modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT8 altera la composición y el nivel de detalle: las salidas no son idénticas píxel a píxel a las del modelo FP32, y las diferencias pueden ser visibles en escenas con muchos objetos o texto.
- Sin ruta GPU: en Tensor G5 los layouts GPU fallan la compilación con LiteRT 2.3. La latencia de casi 27 segundos por imagen es una restricción de producto real para interfaces interactivas.
- La medición de latencia proviene de una única muestra (un prompt, un dispositivo) y de una app de validación separada; no es una caracterización de rendimiento en producción.
- Pixel 10 Pro y Pixel 11 Pro, los terminales declarados como objetivo, no han sido medidos. Los resultados exactos por dispositivo y backend, incluidos los fallos, están en `validation.json`.
- El tamaño de descarga no equivale a RAM en uso: hay que presupuestar activaciones, desquantización, cachés del driver y el resto del sistema Android.
- Riesgo de alucinación visual y de artefactos: como todo modelo de difusión, puede producir anatomías incorrectas, texto ilegible y detalles incoherentes, especialmente con prompts ambiguos.
- Sesgos heredados del modelo base y de sus datos de entrenamiento (distribución demográfica, cultural y estilística de los datasets de difusión empleados por Stability AI). La model card no documenta evaluaciones de sesgo para esta exportación.
- Idiomas: no disponible. El comportamiento con prompts en castellano no está documentado ni evaluado en esta ficha.
- Licencia: los pesos conservan la Stability AI Community License y los términos de uso del modelo fuente; esta publicación no los relicencia. Es obligatorio revisar `LICENSE.md` y conservar `NOTICE` antes de cualquier uso comercial, y verificar los umbrales de facturación que la licencia impone.
- Integración Android frágil si se ignora el contrato de buffers: asignar por separado una salida con `aliasOfInput` sobrescribe entradas de token válidas con memoria sin inicializar. El código de ejemplo incluye la corrección, pero cualquier reimplementación debe respetarla.
- Dependencia de versiones concretas (`ai-edge-quantizer` 0.10.0, LiteRT 2.3.0); cambios de versión pueden invalidar la reproducibilidad de la cuantización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/frankdu/SD-Turbo-Mobile-INT8-LiteRT
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo base (Stability AI Community License): https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE.md
- Especificaciones Pixel 10 Pro: https://store.google.com/product/pixel_10_pro_specs
- Especificaciones Pixel 11 Pro: https://store.google.com/product/pixel_11_pro_specs
- Paper de destilacion de SD-Turbo (Adversarial Diffusion Distillation, Sauer et al.): https://arxiv.org/abs/2311.17042
- Repositorio de LiteRT (Google AI Edge): https://github.com/google-ai-edge/LiteRT
