# experimentalmachines/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k

## Resumen

LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k es una exportación del modelo LiquidAI/LFM2.5-1.2B-Instruct (revisión `0f604ada3f76`) realizada por el usuario experimentalmachines para su ejecución en dispositivos móviles mediante el runtime ExecuTorch 1.4.0. No se trata de un modelo nuevo, sino de un artefacto de despliegue: el repositorio contiene los pesos convertidos al formato `.pte` de ExecuTorch, con cuantización GPTQ de 8 bits por canal y activaciones de 4 bits (esquema 8da4w), pensados para ejecutarse en CPU arm64 a través del backend XNNPACK o en la NPU MediaTek NeuroPilot del SoC MT6991 (Dimensity 9400).

El interés de esta ficha radica en su utilidad para el despliegue on-device: ofrece ventanas de contexto precompiladas que van de 2.048 a 32.768 tokens para XNNPACK, y de 512 a 8.192 tokens para la NPU de MediaTek. El modelo base es un transformer de 1.200 millones de parámetros de LiquidAI, pero esta exportación no documenta la arquitectura interna, los datos de entrenamiento ni los idiomas soportados; toda la información disponible se limita al proceso de conversión y a los ficheros generados.

La relevancia actual está en la tendencia a ejecutar modelos de lenguaje directamente en teléfonos y dispositivos embebidos sin conexión a la nube. Este repositorio demuestra que un modelo de 1,2B puede caber en menos de 1 GB de almacenamiento con cuantización agresiva, a costa de fijar la ventana de contexto en tiempo de compilación y de perder la plantilla de chat en las pruebas realizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.200 millones (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (XNNPACK); 512, 2.048, 4.096 u 8.192 tokens (MediaTek NeuroPilot) |
| Tipos de cuantizacion | GPTQ 8da4w (pesos 8 bits, activaciones 4 bits) para XNNPACK; a16w8 (activaciones 16 bits, pesos 8 bits) para NeuroPilot |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" según metadatos de Hugging Face) |
| Formato de pesos | `.pte` (ExecuTorch) |
| Tamano de los ficheros | 0,80-0,83 GB (XNNPACK); 0,27-0,41 GB por fragmento (NeuroPilot, dividido en 4 chunks) |
| Runtime requerido | ExecuTorch 1.4.0 |
| Backends | XNNPACK (CPU arm64) y MediaTek NeuroPilot (MT6991) |
| Tamano del repositorio | 15,0 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF, DPO u otros) del modelo base LiquidAI/LFM2.5-1.2B-Instruct en la documentación proporcionada. La model card de esta exportación se centra exclusivamente en el proceso de conversión a ExecuTorch y en las características de los ficheros generados.

La innovación técnica destacable de esta exportación es el uso de ventanas de contexto fijas compiladas dentro del fichero `.pte`: el runtime reserva la totalidad de la caché KV al cargar el modelo, por lo que el usuario debe elegir la ventana más grande que el dispositivo pueda soportar. Cada carpeta incluye un campo `fits_phone_budget` en su `config.json` que estima si el modelo cabe en un presupuesto de 5 GB. La cuantización empleada es GPTQ 8da4w para el backend XNNPACK y a16w8 para la NPU de MediaTek, con el modelo dividido en cuatro fragmentos en este último caso.

## Capacidades

- Generación de texto: el modelo base es un modelo de instrucciones (`-Instruct`), por lo que se espera que responda a indicaciones en formato conversacional, aunque la prueba de humo realizada con la plantilla de chat no se renderizó correctamente.
- Ejecución on-device: inferencia local en dispositivos Android arm64 mediante XNNPACK o en la NPU MediaTek del Dimensity 9400.
- Contexto largo: hasta 32.768 tokens en la variante XNNPACK de 32k, adecuada para conversaciones multi-turno o documentos extensos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- Prueba de humo: la variante XNNPACK respondió "Paris" ante una indicación de completado, lo que confirma que la inferencia básica funciona, aunque la plantilla de chat no se procesó correctamente.

## Casos de uso

- Asistente conversacional offline en Android: el modelo puede integrarse en una aplicación móvil mediante ExecuTorch y el runtime XNNPACK para ofrecer respuestas sin conexión a la red, usando la ventana de 4k u 8k para conversaciones de varias réplicas.
- Procesamiento de documentos largos en el dispositivo: con la variante de 32k tokens, el modelo puede resumir o extraer información de documentos extensos sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad.
- Autocompletado y generación de texto en teclados o editores móviles: la variante de 2k tokens y 0,80 GB es suficientemente ligera para integrarse en un teclado predictivo o en un editor de notas con sugerencias contextuales.
- Clasificación y etiquetado de texto local: el modelo puede categorizar correos, mensajes o reseñas directamente en el teléfono, evitando la latencia de red y los costes de API.
- Despliegue en la NPU de MediaTek: en dispositivos con Dimensity 9400, la variante NeuroPilot de 512 tokens y 0,27 GB por fragmento permite aceleración por hardware para tareas de baja latencia, como respuestas rápidas en asistentes de voz.
- Prototipado de aplicaciones ExecuTorch: el repositorio sirve como referencia para desarrolladores que quieran convertir sus propios modelos a `.pte` y validar el flujo de compilación con distintas ventanas de contexto y backends.
- Evaluación de cuantización en dispositivos reales: las distintas variantes permiten comparar el rendimiento y la calidad de GPTQ 8da4w frente a a16w8 en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única prueba documentada es la de humo: la variante XNNPACK respondió "Paris" ante una indicación de completado, y las variantes NeuroPilot solo fueron verificadas estructuralmente, sin runtime de NPU en el host de compilación.

## Requisitos de hardware

- VRAM estimada: no aplica, ya que el modelo está diseñado para ejecutarse en CPU arm64 o NPU móvil, no en GPU de escritorio.
- GPU recomendadas: no aplica para esta exportación; el runtime ExecuTorch con XNNPACK y NeuroPilot está orientado a dispositivos móviles.
- Cabe en consumer GPU: no aplica; el formato `.pte` no está pensado para GPUs de escritorio.
- Almacenamiento: 0,80-0,83 GB por fichero XNNPACK; 0,27-0,41 GB por fragmento NeuroPilot (cuatro fragmentos por ventana).
- Memoria en dispositivo: el runtime reserva la caché KV completa al cargar; el campo `fits_phone_budget` de cada `config.json` estima si el modelo cabe en un presupuesto de 5 GB.
- Opciones de despliegue: ExecuTorch 1.4.0 con backend XNNPACK (cualquier arm64) o MediaTek NeuroPilot (MT6991 / Dimensity 9400); la aplicación Android openweights está disponible como cliente de referencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k | 1,2B | hasta 32.768 tokens (XNNPACK) | `.pte` (ExecuTorch) | lfm1.0 | Hugging Face, 621 descargas |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | safetensors (presumiblemente) | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de 1-2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- La ventana de contexto es fija y se elige en tiempo de compilación; no se puede ampliar en tiempo de ejecución sin recompilar el modelo.
- La plantilla de chat no se renderizó correctamente en las pruebas de humo, lo que puede afectar al comportamiento conversacional en producción.
- Las variantes NeuroPilot solo fueron verificadas estructuralmente, sin ejecución real en NPU, por lo que su funcionamiento en dispositivo no está confirmado.
- El modelo base puede presentar sesgos y alucinaciones, pero no se documentan en la información disponible.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- El repositorio ocupa 15,0 GB, aunque cada fichero individual es mucho más pequeño; hay que seleccionar la variante adecuada para evitar descargas innecesarias.
- No se documentan los idiomas soportados ni las capacidades de tool calling o agentes, lo que limita la evaluación para casos de uso avanzados.
- La cuantización 8da4w puede degradar la calidad respecto al modelo original en tareas de razonamiento complejo o generación de código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-ExecuTorch-XNNPACK-32k
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
