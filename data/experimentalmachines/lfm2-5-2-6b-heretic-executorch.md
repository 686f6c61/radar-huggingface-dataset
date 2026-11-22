# experimentalmachines/LFM2.5-2.6B-heretic-ExecuTorch

## Resumen

LFM2.5-2.6B-heretic-ExecuTorch es una exportación al formato ExecuTorch del modelo experimentalmachines/LFM2.5-2.6B-heretic, un derivado de la familia LFM2.5 de Liquid AI. El repositorio lo publica el usuario experimentalmachines y su propósito no es servir como modelo de referencia, sino como artefacto listo para inferencia en dispositivo (on-device), empaquetado en ficheros `.pte` que consumen runtimes ExecuTorch 1.4.0 en Android, especialmente en la aplicación openweights y en aceleradores MediaTek NeuroPilot.

El modelo base tiene aproximadamente 2.600 millones de parámetros (según el nombre) y se distribuye cuantizado en dos variantes: XNNPACK de 8 bits en pesos con GPTQ (`8da4w`) para CPU arm64, y MediaTek NeuroPilot con activaciones de 16 bits y pesos de 8 bits (`a16w8`) para la NPU MT6991 del Dimensity 9400. El interés práctico está en que permite ejecutar un modelo de 2,6B en un teléfono con ventanas de contexto fijas que van de 512 a 32.768 tokens, con pesos de entre 0,84 GB y 1,81 GB por fichero.

La ventana de contexto está fijada dentro de cada fichero: el runtime reserva la totalidad de la caché KV al cargar, por lo que hay que elegir el fichero con la ventana más grande que el dispositivo pueda sostener. Cada carpeta incluye un `config.json` con el campo `fits_phone_budget`, que estima la viabilidad frente a un presupuesto de 5 GB. La licencia es LFM1.0, heredada del modelo base de LiquidAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2.5 de Liquid AI); exportado a ExecuTorch con backends XNNPACK y MediaTek NeuroPilot |
| Parámetros totales | ~2,6 mil millones (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Fija por fichero: 512, 2.048, 4.096, 8.192, 16.384 y 32.768 tokens (XNNPACK llega a 32k; NeuroPilot a 16k) |
| Tipos de cuantización | XNNPACK: 8da4w con GPTQ (pesos 8 bits, activaciones 4 bits); NeuroPilot: a16w8 (activaciones 16 bits, pesos 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | ExecuTorch `.pte` (no safetensors ni GGUF); ficheros divididos en chunks para NeuroPilot |
| Tamaño del repositorio | 25,3 GB |
| Backends | XNNPACK (CPU arm64 genérica), MediaTek NeuroPilot MT6991 (Dimensity 9400) |
| Runtime requerido | ExecuTorch 1.4.0 |
| Descargas | 882 |
| Fecha de creación / actualización | 2026-09-19 / 2026-10-04 |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia LFM2.5 de Liquid AI, una arquitectura transformer de aproximadamente 2,6B parámetros. La variante "heretic" es un ajuste derivado del modelo base experimentalmachines/LFM2.5-2.6B-heretic, que a su vez parte de LFM2.5-2.6B de LiquidAI. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta ficha.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el empaquetado para inferencia en dispositivo. Se ofrecen dos rutas de ejecución: XNNPACK sobre CPU arm64 con cuantización 8da4w y GPTQ, y MediaTek NeuroPilot sobre la NPU MT6991 del Dimensity 9400 con cuantización a16w8. Los ficheros NeuroPilot se dividen en chunks (de 3 a 10 partes según la ventana) para adaptarse a los límites de memoria del acelerador. La ventana de contexto se fija en tiempo de exportación porque el runtime asigna la caché KV completa al cargar el modelo, lo que obliga a elegir el fichero en función de la memoria disponible del dispositivo.

## Capacidades

- Generación de texto en modo decoder-only, orientada a inferencia local en Android.
- Ejecución en CPU arm64 mediante XNNPACK, con ventanas de 2k a 32k tokens.
- Ejecución en NPU MediaTek NeuroPilot MT6991 (Dimensity 9400), con ventanas de 512 a 16k tokens.
- Integración con la aplicación Android openweights y con cualquier runtime ExecuTorch 1.4.0.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo puede ejecutarse íntegramente en el dispositivo con la variante XNNPACK de 4k u 8k tokens, sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad estricta.
- Autocompletado y redacción en teclados o apps de notas: con la variante de 2k tokens (1,78 GB) y latencia de CPU, encaja en flujos de sugerencia de texto de longitud corta.
- Procesamiento de documentos largos en el teléfono: la variante XNNPACK de 32k tokens (1,81 GB) permite resumir o extraer información de textos extensos sin conexión.
- Inferencia acelerada en dispositivos Dimensity 9400: la variante NeuroPilot a16w8 con ventana de 2k o 4k aprovecha la NPU para reducir consumo energético en tareas de generación continua.
- Aplicaciones de accesibilidad: descripción y reescritura de texto en tiempo real en el propio dispositivo, con la ventana de 512 tokens de NeuroPilot para respuestas cortas y de baja latencia.
- Prototipado de agentes locales: integración en la app openweights para probar flujos de generación multi-turno en hardware móvil antes de desplegar en servidores.
- Evaluación de despliegue edge: comparación de rendimiento CPU (XNNPACK) frente a NPU (NeuroPilot) en el mismo modelo y dispositivo para decidir la ruta de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pruebas de humo (smoke tests) que consisten en generar la respuesta "Paris" para las variantes XNNPACK, y una comprobación estructural para las variantes NeuroPilot (sin runtime NPU en el host de exportación).

| Variante | Backend | Ventana | Tamaño | Prueba reportada |
|---|---|---|---|---|
| 8da4w-gptq-2k | XNNPACK | 2.048 | 1,78 GB | pasada ("Paris") |
| 8da4w-gptq-4k | XNNPACK | 4.096 | 1,79 GB | pasada ("Paris") |
| 8da4w-gptq-8k | XNNPACK | 8.192 | 1,79 GB | pasada ("Paris") |
| 8da4w-gptq-16k | XNNPACK | 16.384 | 1,80 GB | pasada ("Paris") |
| 8da4w-gptq-32k | XNNPACK | 32.768 | 1,81 GB | pasada ("Paris") |
| a16w8-512 (3 chunks) | NeuroPilot | 512 | 0,84 + 0,84 + 1,10 GB | estructura comprobada |
| a16w8-2k (3 chunks) | NeuroPilot | 2.048 | 0,84 + 0,84 + 1,10 GB | estructura comprobada |
| a16w8-4k (3 chunks) | NeuroPilot | 4.096 | 0,84 + 0,84 + 1,10 GB | estructura comprobada |
| a16w8-8k (3 chunks) | NeuroPilot | 8.192 | 0,84 + 0,84 + 1,10 GB | estructura comprobada |
| a16w8-16k (10 chunks) | NeuroPilot | 16.384 | 0,25 GB por chunk | estructura comprobada |

## Requisitos de hardware

- VRAM/RAM: la variante XNNPACK ocupa entre 1,78 GB y 1,81 GB de pesos; el runtime debe reservar además la caché KV completa de la ventana elegida. El campo `fits_phone_budget` de cada `config.json` estima la viabilidad frente a un presupuesto de 5 GB.
- GPU de escritorio: no aplica; el modelo está exportado para CPU arm64 y NPU MediaTek, no para CUDA.
- CPU: cualquier dispositivo arm64 puede ejecutar las variantes XNNPACK.
- NPU: exclusivamente MediaTek MT6991 (Dimensity 9400) para las variantes NeuroPilot.
- Cabe en hardware de consumo móvil: sí, en teléfonos Android arm64; no está pensado para GPU de consumo tipo RTX 4090.
- Despliegue: ExecuTorch 1.4.0 y la app openweights; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con el formato `.pte`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-heretic-ExecuTorch | ~2,6B | 512 a 32k (fijo por fichero) | ExecuTorch `.pte` | LFM1.0 | Hugging Face, 882 descargas |
| experimentalmachines/LFM2.5-2.6B-heretic | ~2,6B | no disponible | pesos del modelo base (no especificado) | LFM1.0 | Hugging Face (modelo base) |
| LiquidAI/LFM2.5-2.6B | ~2,6B | no disponible en esta ficha | no disponible en esta ficha | LFM1.0 | Hugging Face (modelo original de Liquid AI) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ventana de contexto es fija por fichero y se reserva completa al cargar; elegir una ventana mayor de la que el dispositivo soporta provoca fallos de memoria.
- Las variantes NeuroPilot solo se han comprobado estructuralmente, sin runtime NPU en el host; su correcta ejecución en el Dimensity 9400 no está validada en la model card.
- El modelo está pensado exclusivamente para ExecuTorch 1.4.0; no es utilizable con vLLM, llama.cpp, Ollama ni TGI.
- Solo se soportan arm64 y la NPU MT6991; no hay soporte para GPU de escritorio ni otros aceleradores.
- La licencia LFM1.0 puede imponer restricciones al uso comercial; conviene revisar el enlace de licencia del modelo base antes de desplegar.
- El ajuste "heretic" puede alterar el comportamiento respecto al modelo original de Liquid AI; no se documentan los detalles de ese ajuste en esta ficha.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- El repositorio ocupa 25,3 GB por la acumulación de todas las variantes y chunks; la descarga selectiva de un solo fichero es necesaria para uso práctico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-heretic-ExecuTorch
- Modelo base: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-heretic
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- App Android openweights: https://github.com/alpharomercoma/openweights
