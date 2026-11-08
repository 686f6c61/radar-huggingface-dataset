# halfmoon-mind/still-seedvr2

## Resumen

Still SeedVR2 es una conversión a Core ML de SeedVR2-3B, un transformer de difusión de un solo paso desarrollado por ByteDance Seed para restauración de vídeo e imagen (paper arXiv:2506.05301). El modelo original sintetiza detalle sobre material de baja calidad; esta conversión, publicada por halfmoon-mind, empaqueta los pesos del VAE en FP16 y los 32 bloques del DiT cuantizados a 4 bits para ejecutarse en dispositivos Apple mediante ML Programs (iOS 18 o superior).

El resultado está pensado para inferencia local en iPhone y Mac: la app iOS *Still (한컷)* lo descarga bajo demanda como experimento de menú de desarrollador para restauración de máxima calidad sobre fotogramas individuales. Cada paquete está fijado a una salida de 512 × 512 píxeles, y las imágenes mayores se procesan por teselas solapadas de 512 px con 64 px de solape.

La relevancia de esta ficha es doble: por un lado documenta una técnica de despliegue de difusión de 3B parámetros en hardware móvil (cuantización int4 por bloques de 32 pesos, división del DiT en siete trozos y precálculo de constantes del paso único); por otro, advierte de que el detalle restaurado es una predicción del modelo, no evidencia del detalle capturado originalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de un solo paso con VAE encoder/decoder; conversión a Core ML ML Program |
| Parametros totales | 3B (heredados de SeedVR2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija de 512 × 512 px) |
| Tipos de cuantizacion | DiT a 4 bits lineales con bloques de 32 pesos; VAE en FP16 |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual de usuario) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML ML Program, iOS 18+); repo de 2,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es SeedVR2, un transformer de difusión que realiza restauración en un único paso mediante post-entrenamiento adversarial sobre difusión (diffusion adversarial post-training), según el paper de ByteDance Seed. La conversión conserva el VAE (encoder y decoder en FP16) y divide el DiT en siete paquetes Core ML que agrupan los 32 bloques (0–2, 3–5, 6–8, 9–14, 15–20, 21–26, 27–31); el último paquete aplica además el único paso de Euler (x0 = noise − v). Los pesos del DiT se cuantizaron a 4 bits con coremltools 9.0.

La conversión fija varias constantes propias del régimen de un solo paso: el embedding de timestep para t = 1000, el condicionamiento de texto (el embedding del prompt positivo publicado, `pos_emb.pt`, tras `txt_in`) y el ruido, derivado de la semilla 42. También adapta detalles numéricos para FP16: RMSNorm divide cada token por su magnitud máxima antes de elevar al cuadrado (el flujo de texto alcanza 28.640 y x² desborda FP16), la modulación de timestep se emite como broadcast en lugar de repetirse por token y la atención se reescribe como productos matriciales más softmax. En FP32, estos trozos igualan el forward original con una diferencia máxima de 0. Los scripts de conversión se conservan en el repositorio de la app (`research/ReferenceSRStudy`). No se detalla en la información disponible el volumen ni la composición del dataset de entrenamiento original.

## Capacidades

- Restauración y superresolución de imagen sobre un fotograma de 512 × 512 píxeles, sintetizando detalle fino.
- Restauración de vídeo en el modelo original (SeedVR2); esta conversión se usa sobre fotogramas individuales.
- Procesamiento de imágenes mayores mediante teselado 512 px con solape de 64 px y costura en una franja de 32 px en el centro del solape.
- Ejecución local en dispositivo Apple: encoder y decoder en Neural Engine, DiT en GPU (`.cpuAndGPU`).
- Entrada y salida en float16; encoder con imagen RGB en [-1, 1] y latente de salida `[4096, 16]` (moda posterior × 0.9152, channels last).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo image-to-image.
- Sin capacidades multilingües ni de audio.

## Casos de uso

- Restauración de fotos antiguas o de baja resolución en el iPhone: la app procesa la imagen por teselas de 512 px y el modelo sintetiza detalle de forma local, sin enviar la foto a un servidor.
- Mejora de fotogramas extraídos de vídeo: al ser una conversión de un modelo de restauración de vídeo aplicada fotograma a fotograma, encaja en flujos de recuperación de metraje antiguo o comprimido.
- Previsualización de calidad máxima en apps de edición fotográfica: el modelo se descarga bajo demanda desde un menú de desarrollador, de modo que solo los usuarios que lo activan pagan el coste de almacenamiento (2,4 GB) y de cómputo.
- Investigación sobre despliegue de difusión en móvil: los paquetes y el manifiesto con SHA-256 permiten reproducir la conversión y medir latencia y memoria en distintos chips Apple.
- Procesamiento por lotes en Mac con Neural Engine (M4): los mismos paquetes funcionan correctamente en el Neural Engine del M4, lo que permite estudios comparativos CPU/GPU/ANE.
- Restauración de capturas de pantalla o documentos escaneados a 512 px por tesela, manteniendo color e iluminación de baja frecuencia tomados de la entrada (la app conserva color y luz por debajo de unos 16 px del original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de restauración de imagen. Sí se documentan métricas de fidelidad y rendimiento de la conversión:

| Metrica | Valor |
|---|---|
| Diferencia de imagen decodificada frente al modelo FP32 (un fotograma de prueba) | 34,5 dB |
| Diferencia entre salida en iPhone 14 Pro y en Mac | 56 dB |
| Carga del encoder (Neural Engine, iPhone 14 Pro, A16, iOS 18.4) | 0,3 s |
| Ejecución del encoder por fotograma | 1,7 s |
| Carga del DiT, siete trozos (GPU) | 2,8 s |
| Ejecución del DiT por fotograma | 5,0 s |
| Carga del decoder (Neural Engine) | 15,1 s |
| Ejecución del decoder por fotograma | 3,5 s |
| Pico de memoria | 1,6 GiB (durante la carga del decoder) |

## Requisitos de hardware

- Almacenamiento: 2,4 GB para el repositorio completo de paquetes Core ML.
- Memoria: pico medido de 1,6 GiB en iPhone 14 Pro con un solo modelo residente a la vez.
- Dispositivos validados: iPhone 14 Pro (A16, iOS 18.4) y Mac con M4 (Neural Engine).
- Requisito de sistema: ML Programs con iOS 18 o superior.
- Reparto de cómputo: encoder y decoder en Neural Engine; DiT en GPU (`.cpuAndGPU`). El Neural Engine del A16 calcula mal los pesos comprimidos de iOS 18, por lo que el DiT no debe ejecutarse allí en ese chip; FP16 y el VAE sí funcionan correctamente en ANE.
- Despliegue: Core ML (librería `coremltools` para la conversión); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia por fotograma en iPhone 14 Pro: aproximadamente 10,2 s de cómputo sumando encoder, DiT y decoder (1,7 + 5,0 + 3,5 s), más los tiempos de carga indicados.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / plataforma | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Still SeedVR2 (esta ficha) | 3B | Core ML, iOS 18+ / Apple Silicon | DiT int4 (bloques de 32), VAE FP16 | Apache 2.0 | Hugging Face (halfmoon-mind/still-seedvr2) |
| SeedVR2-3B (original) | 3B | PyTorch (safetensors) | FP16 | Apache 2.0 | Hugging Face (ByteDance-Seed/SeedVR2-3B) |
| SeedVR2_comfyUI (repack) | 3B | PyTorch para ComfyUI | FP16 | Apache 2.0 | Repositorio numz/SeedVR2_comfyUI |
| zsxkib/seedvr2 (API) | 3B (base) | API alojada en Replicate | no disponible | no disponible en la información | Replicate |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El detalle restaurado es una predicción generada por el modelo, no evidencia del detalle realmente capturado; no debe usarse como prueba forense o pericial.
- Salida fija de 512 × 512 px por paquete: imágenes mayores dependen del teselado y pueden mostrar costuras o inconsistencias entre teselas.
- Constantes fijas del régimen de un solo paso (timestep t = 1000, embedding del prompt positivo publicado y ruido de semilla 42): no hay control de prompt ni de semilla en esta conversión.
- El decoder entrega la imagen antes del clamp y la corrección de color del CLI; la app recompone color e iluminación de baja frecuencia a partir de la entrada, de modo que el paquete por sí solo no produce una salida final calibrada.
- El Neural Engine del A16 (iOS 18) calcula incorrectamente los pesos comprimidos del DiT; es necesario ejecutarlo en GPU en ese chip.
- El autor no revisó los datos de entrenamiento originales y no ofrece garantía de que un uso concreto de los pesos quede libre de reclamaciones derivadas de ellos.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar avisos y declarar modificaciones (sección 4(b)); esta conversión no está afiliada ni respaldada por ByteDance ni por los autores de Seed.
- No hay información sobre sesgos del modelo original ni sobre su comportamiento con rostros, texto o material de dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halfmoon-mind/still-seedvr2
- Modelo base SeedVR2-3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Paper SeedVR2 (arXiv:2506.05301): https://arxiv.org/abs/2506.05301
- Código oficial SeedVR: https://github.com/ByteDance-Seed/SeedVR
- Repack FP16 para ComfyUI (numz/SeedVR2_comfyUI): https://github.com/numz/SeedVR2_comfyUI
- Demo/API en Replicate (zsxkib/seedvr2): https://replicate.com/zsxkib/seedvr2
