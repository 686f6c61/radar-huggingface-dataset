# Maximilian228/Geode-FLUX.2-klein-4B

## Resumen

Geode-FLUX.2-klein-4B es una conversión del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, empaquetada por el proyecto Geode (Maximilian228) para ejecución local en dispositivos Android. El modelo original es un transformer de flujo rectificado (rectified flow) destilado a 4 pasos, con 3.900 millones de parámetros y un codificador de texto Qwen3-4B. Esta versión reorganiza los pesos en ficheros independientes por etapa (codificador de texto, transformer y VAE) para que la aplicación cargue, ejecute y libere cada etapa de forma secuencial, evitando mantener en memoria más que la etapa más grande en cada momento.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras distribuciones prácticas de un modelo de difusión de ~4B parámetros pensada para inferencia totalmente local en un teléfono (CPU, GPU o NPU Snapdragon); por otro, sirve como referencia de las técnicas de cuantización agresiva (int8 con transformada de Hadamard, 4 bits para el codificador de texto) necesarias para encajar un pipeline text-to-image completo en el presupuesto de memoria de un dispositivo móvil.

No se ha entrenado ni ajustado ningún peso: la conversión es puramente de formato y precisión. La licencia es Apache 2.0, heredada del modelo original, y el idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (DiT) destilado a 4 pasos, con codificador de texto Qwen3-4B y VAE |
| Parámetros totales | 3,9 B (transformer); el codificador de texto Qwen3-4B se incluye recortado a las capas 0-26 de 36 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (pipeline text-to-image con padding a 512 tokens de prompt) |
| Tipos de cuantización | fp16 (transformer, VAE), int8 por 32 entradas con Hadamard-32 ("i8r", transformer), 4 bits con escala E4M3 por 16 valores (codificador de texto) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.bin` propietario de Geode (`tokenizer.bin`, `embed.bin`, `te_q4.bin`, `dit_f16.bin` / `dit_i8r.bin`, `vae_f16.bin`, manifiesto `geode.json`) |
| Tamaño del repo | 14,4 GB (dos carpetas: `fp16/` 10,2 GB, `int8/` 6,7 GB) |
| Resolución de inferencia | 512×512 |
| Pasos de muestreo | 4 (destilado) |
| Scheduler | FlowMatchEuler con shift empírico |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un transformer de difusión con formulación de flujo rectificado (rectified flow) destilado para generar imágenes en 4 pasos de muestreo. La conversión de Geode no modifica la arquitectura ni reentrena pesos: reorganiza el pipeline en tres etapas con carga y liberación secuencial. El codificador de texto es Qwen3-4B recortado a las capas 0-26 (de 36), ya que el pipeline de FLUX.2 [klein] consume los estados ocultos 9, 18 y 27; las capas 27-35, la norma final y la cabeza LM se descartan. El VAE se reduce únicamente al decodificador, ya que el codificador no es necesario para text-to-image.

Las innovaciones técnicas de esta conversión son de compresión y empaquetado. En la carpeta `fp16/`, los pesos bf16 del transformer se almacenan como fp16 (error relativo ~1e-8). En la carpeta `int8/`, las matrices de los bloques y el `context_embedder` se cuantizan a int8 con una escala fp16 por cada 32 entradas, tras aplicar una transformada de Walsh-Hadamard normalizada de 32 puntos a cada grupo (técnica "i8r"). El codificador de texto se cuantiza a 4 bits con escala E4M3 por cada 16 valores, manteniendo las normas en fp32. El pipeline (plantilla de chat, padding a 512 tokens, scheduler FlowMatchEuler y ruido de CPU de torch para una semilla dada) sigue `Flux2KleinPipeline` de diffusers, de modo que una semilla reproduce la imagen del pipeline original dentro de la precisión indicada. No se ha realizado RLHF, DPO ni ajuste fino de ningún tipo en esta conversión.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resolución 512×512 con 4 pasos de muestreo.
- Reproducibilidad determinista por semilla: la misma semilla produce la misma imagen que el pipeline original de diffusers, con las diferencias de precisión documentadas (76 dB PSNR y SSIM 1.000 en fp16; 30-41 dB y SSIM 0.97-0.997 en int8).
- Inferencia totalmente local en dispositivo: no requiere conexión de red ni envía datos fuera del teléfono.
- Ejecución en CPU, GPU integrada o NPU Snapdragon mediante el motor propio de Geode.
- Carga secuencial por etapas: el codificador de texto se ejecuta y se libera antes de cargar el transformer, y este antes del VAE.
- Prompts en inglés (único idioma declarado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes offline en aplicaciones Android: el modelo está empaquetado específicamente para que una app móvil descargue una sola carpeta (`fp16/` o `int8/`) y genere imágenes sin conexión, con todo el cómputo en el dispositivo y sin exponer prompts a servidores externos.
- Creación de ilustraciones y assets en movilidad: con 512×512 y 4 pasos, un Snapdragon 8 Elite (NPU) tarda unos 10 s por imagen, lo que permite iterar prompts de forma interactiva en un teléfono de gama alta.
- Prototipado de pipelines text-to-image en entornos con recursos limitados: la separación en ficheros por etapa y el manifiesto `geode.json` con tamaños y SHA-256 de cada tensor facilitan la verificación de integridad y la integración en motores de inferencia propios.
- Evaluación de técnicas de cuantización extrema: las dos variantes (`fp16` e `int8` con Hadamard-32) permiten comparar calidad frente a memoria (10,2 GB frente a 6,7 GB de descarga; 7,2 GiB frente a 4,0 GiB de transformer) en el mismo hardware.
- Aplicaciones de privacidad por diseño: al no salir datos del dispositivo, encaja en escenarios donde el prompt o la imagen no pueden enviarse a la nube (contenido sensible, entornos regulados).
- Demostraciones y docencia sobre difusión en el borde: sirve para ilustrar en un dispositivo real el coste de memoria y latencia de un pipeline de difusión de ~4B parámetros con codificador de texto de 4B.
- Integración en apps de mensajería o notas que necesiten generar imágenes locales bajo demanda, aceptando la latencia de 2-3 minutos en hardware de gama media como un Snapdragon 720G.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo text-to-image. La model card sí aporta métricas de fidelidad frente al pipeline original (fp32, semilla 42, 512²):

| Variante | Transformer | Descarga | PSNR vs. original | SSIM vs. original |
|---|---|---|---|---|
| `fp16/` (por defecto) | fp16, 7,2 GiB | 10,2 GB | 76 dB | 1,000 |
| `int8/` (opcional) | int8 por 32 entradas, Hadamard-32, 4,0 GiB | 6,7 GB | 30-41 dB | 0,97-0,997 |

Rendimiento medido por el motor de Geode, por etapa:

| Dispositivo | Objetivo |
|---|---|
| Snapdragon 8 Elite (NPU) | ~10 s por imagen a 512² |
| Snapdragon 720G (CPU) | 2-3 minutos por imagen a 512² |

## Requisitos de hardware

- VRAM/memoria estimada: la etapa mayor es el transformer (7,2 GiB en fp16, 4,0 GiB en int8); el codificador de texto en 4 bits y el VAE en fp16 son etapas menores que se cargan y liberan secuencialmente, por lo que el pico de memoria lo marca el transformer.
- Almacenamiento: 10,2 GB de descarga para `fp16/` y 6,7 GB para `int8/` (el repo completo ocupa 14,4 GB).
- GPU recomendadas: no disponible para escritorio; el empaquetado está orientado a SoC móviles Snapdragon con NPU (objetivo: Snapdragon 8 Elite) y a CPU de gama media (Snapdragon 720G).
- ¿Cabe en GPU de consumo? No hay datos publicados sobre ejecución en RTX 4090 u otras GPU de consumo; el formato `.bin` de Geode no es directamente compatible con runtimes estándar de escritorio.
- Opciones de despliegue: exclusivamente el motor propio de Geode en Android (CPU, GPU o NPU Snapdragon). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión con este formato.
- Latencia: ~10 s por imagen en Snapdragon 8 Elite (NPU) y 2-3 minutos en Snapdragon 720G (CPU). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Geode-FLUX.2-klein-4B | 3,9 B (transformer) + Qwen3-4B recortado | 512×512, 4 pasos | Apache 2.0 | Hugging Face, formato `.bin` para Geode | Conversión on-device para Android; fp16 e int8 |
| black-forest-labs/FLUX.2-klein-4B | 3,9 B (transformer) + Qwen3-4B | 512×512, 4 pasos | Apache 2.0 | Hugging Face, pesos originales | Modelo base; pipeline diffusers estándar |
| Alternativas de difusión de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación relevante es contra el modelo base: esta conversión mantiene la licencia Apache 2.0 y la calidad en fp16 (SSIM 1.000), pero cambia el formato de pesos, recorta el codificador de texto y elimina el codificador del VAE, por lo que no es un sustituto directo en pipelines de escritorio.

## Limitaciones y advertencias

- Solo inglés: el codificador de texto y el pipeline están pensados para prompts en inglés; no hay soporte multilingüe declarado.
- Riesgo de sesgos y alucinación visual: al ser una conversión sin ajuste, hereda los sesgos del modelo original de Black Forest Labs; no se documentan evaluaciones de sesgo en esta información.
- Restricciones de uso: la model card remite a las prohibiciones del modelo original (contenido ilegal, explotación o daño a menores, contenido engañoso o fraudulento, acoso e imágenes íntimas no consentidas). La licencia Apache 2.0 no añade términos propios, pero esas restricciones se aplican a estos ficheros.
- Formato no estándar: los `.bin` de Geode no son safetensors ni GGUF; no se pueden cargar con diffusers, ComfyUI u otros runtimes sin conversión.
- Calidad reducida en int8: la variante `int8/` degrada texturas finas (PSNR 30-41 dB, SSIM 0,97-0,997); para máxima fidelidad debe usarse `fp16/`.
- Resolución fija de 512×512 y 4 pasos: no se documenta soporte para otras resoluciones ni para más pasos de muestreo.
- Rendimiento dependiente del hardware: en gama media la latencia de 2-3 minutos por imagen puede ser inaceptable para uso interactivo.
- Sin datos de benchmarks estándar ni de ejecución en GPU de escritorio; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-FLUX.2-klein-4B
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Proyecto Geode: https://geode.tifu.xyz
- Licencia Apache 2.0: incluida en el repositorio como `LICENSE`
