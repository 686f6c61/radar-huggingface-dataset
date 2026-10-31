# frankdu/SDXL-Turbo-Mobile-INT8-LiteRT

## Resumen

SDXL-Turbo-Mobile-INT8-LiteRT es una versión cuantizada a INT8 y empaquetada para ejecución en dispositivos móviles del modelo de generación de imágenes SDXL-Turbo de Stability AI, publicada por el usuario frankdu en HuggingFace. Se trata de un pipeline de texto a imagen a 512×512 convertido al formato LiteRT (TensorFlow Lite) mediante LiteRT CLI, orientado a funcionar en CPU sobre teléfonos Android de gama alta, concretamente la clase de 12–16 GB de RAM de los Pixel.

El problema que resuelve es el tamaño y consumo del modelo original: los artefactos de ejecución pasan de 13,75 GB en FP32 a 3,53 GB tras la cuantización, con el grafo más grande en 99,3 MB y solo un grafo cargado en memoria a la vez. Esto hace viable generar imágenes en un teléfono sin acelerador dedicado, aunque con tiempos de generación elevados: la medición publicada sobre un Pixel 10 Pro Fold con Tensor G5 arroja 86,90 segundos para una imagen 512×512 con un pico de RSS de proceso de 1,75 GiB.

Es relevante porque demuestra un flujo de cuantización INT8 por canales documentado y auditable (con scripts de conversión, validación PSNR y hashes incluidos) para difusión en terminal, un área donde la mayoría de despliegues móviles dependen de compilaciones AOT para GPU o NPU que aquí no están disponibles. El modelo conserva la licencia Stability AI Community del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (SDXL-Turbo): encoder de texto, UNet y VAE, sin cambios respecto al original |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámico por canales (encoder de texto y UNet), FP16 con activaciones float (VAE), FP32 en grafos del sampler |
| Idiomas soportados | no disponible (prompts en inglés, heredado del modelo base) |
| Licencia | Stability AI Community License (licencia "other", heredada de stabilityai/sdxl-turbo) |
| Formato de pesos | LiteRT (TFLite), grafos fragmentados (sharded), 3,53 GB en total |

## Arquitectura y entrenamiento

El modelo es una conversión directa del export LiteRT FP32 de SDXL-Turbo, sin cambios en arquitectura ni en el sampler. El pipeline consta de tres componentes neuronales principales (encoder de texto, UNet de difusión y decodificador VAE) más los grafos del sampler. La cuantización se aplicó con LiteRT CLI: pesos INT8 dinámicos por canales para el encoder y el UNet, y FP16 con activaciones en coma flotante para el VAE, mientras que los grafos del sampler permanecen en FP32. El mayor grafo pesa 99,3 MB y solo se carga uno a la vez, lo que reduce la presión de memoria.

No se ha reentrenado nada: es una cuantización post-entrenamiento (PTQ). El proceso incluye un parche a un bug de ai-edge-quantizer 0.10.0 en la fragmentación de convoluciones de más de 32 MiB, verificado bit a bit contra aritmética INT8 por canales sin fragmentar. La validación comparó tres generaciones completas en CPU de escritorio (manzana, tetera azul, gato naranja) contra el modelo FP32 con semillas y ruido gaussiano idénticos, publicando PSNR por prompt, correlación de píxeles, pico de RSS y tiempos. Las salidas son finitas, no uniformes y reconocibles visualmente, aunque no idénticas píxel a píxel al FP32.

## Capacidades

- Generacion de texto a imagen a resolución fija 512×512, heredada de SDXL-Turbo.
- Generacion en pocos pasos característica de la familia Turbo (destilada), aunque el número exacto de pasos del pipeline convertido no está disponible en la documentación.
- Ejecucion completamente on-device en CPU de Android, sin necesidad de GPU, NPU o conexión a servicios en la nube.
- Carga eficiente en memoria: un solo grafo neuronal en memoria a la vez, con el mayor en 99,3 MB.
- Reproducibilidad y auditoria: manifiestos de runtime, registro de recetas de cuantización, hashes SHA256 y scripts de conversión incluidos.
- No incluye capacidades de edición de imágenes, imagen a imagen, vídeo ni audio; es un pipeline exclusivamente de texto a imagen.

## Casos de uso

- Generacion de imágenes offline en Android: la app de ejemplo genera imágenes 512×512 en teléfonos Pixel de gama alta sin conexión, útil para aplicaciones que deben funcionar sin red o con requisitos estrictos de privacidad.
- Prototipado de difusión on-device: el pipeline completo en LiteRT sirve como base para desarrolladores que quieran integrar generación de imágenes en apps móviles propias y medir costes reales de memoria y latencia.
- Validacion de cuantización INT8: los scripts de conversión, el registro `quantization.json` y la validación PSNR publicada permiten auditar el impacto de la cuantización, útil como referencia metodológica para cuantizar otros modelos de difusión.
- Generacion de contenido en apps con privacidad por diseño: al ejecutarse localmente, los prompts y las imágenes nunca salen del dispositivo, adecuado para apps de notas visuales, avatares o material ilustrativo sensible.
- Pruebas de compatibilidad de LiteRT en móvil: el proyecto documenta fallos concretos (compilación de grafos GPU en Tensor G5, manejo de TensorBuffer con alias de entrada), valioso para ingenieros de runtime que deploren modelos TFLite en Android.
- Herramientas creativas de baja latencia de arranque: al cargar un solo grafo a la vez (máximo 99,3 MB), es viable en apps que no pueden reservar varios GB de VRAM/RAM continuos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (FID, CLIP score, etc.) en la informacion disponible. Los datos de rendimiento publicados son mediciones propias de validación:

| Medicion | Valor |
|---|---|
| Tamano de artefactos de ejecucion | 3,53 GB (frente a 13,75 GB en FP32) |
| Grafo mas grande | 99,3 MB |
| Generacion 512x512 en Pixel 10 Pro Fold (Tensor G5, CPU) | 86,90 s |
| Pico de RSS de proceso en movil | 1,75 GiB |
| Validacion FP32 vs INT8 | 3 prompts completos, PSNR y correlacion de pixeles publicados en `validation.json` |

## Requisitos de hardware

- Movil objetivo: clase de 12–16 GB de RAM (Pixel 10 Pro con Tensor G5 y 16 GB; Pixel 11 Pro con Tensor G6 y 12 o 16 GB). Pixel 10 Pro y Pixel 11 Pro no han sido medidos directamente.
- Medicion de referencia: Pixel 10 Pro Fold (Tensor G5), CPU, 86,90 s por imagen 512×512 y 1,75 GiB de pico de RSS de proceso.
- Ejecucion solo en CPU: los layouts de GPU actuales fallan la compilación de LiteRT 2.3 en Tensor G5; no hay ruta GPU disponible sin un export compatible aparte.
- Escritorio: el pipeline portátil se ejecuta con Python 3.12 y LiteRT en CPU; el RSS de escritorio incluye sobrecarga de Python y tokenizador y no es extrapolable al teléfono.
- Descarga: 3,53 GB de artefactos; la descarga no equivale al pico de RAM, ya que activaciones, descuantización y cachés de driver añaden consumo.
- Despliegue: LiteRT 2.3.0 CompiledModel en Android (manifiesto `word-image-litert-v1`, TensorBuffer int64), o el script `run_portable.py` incluido en escritorio. No aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Formato | Tamano runtime | Plataforma objetivo | Licencia |
|---|---|---|---|---|
| SDXL-Turbo-Mobile-INT8-LiteRT | LiteRT/TFLite, INT8 dinamico | 3,53 GB | CPU Android (Pixel, Tensor G5/G6) | Stability AI Community |
| stabilityai/sdxl-turbo (base, FP32) | LiteRT FP32 (export original) | 13,75 GB | Escritorio / servidor | Stability AI Community |
| stabilityai/sdxl-turbo (original) | PyTorch / safetensors | ~6,9 GB de pesos (estimado, no verificado en esta ficha) | GPU con CUDA | Stability AI Community |

Nota: no se dispone de datos comparativos de rendimiento medidos entre las tres variantes en la informacion proporcionada, más allá del tamaño de artefactos (3,53 GB frente a 13,75 GB).

## Limitaciones y advertencias

- Latencia muy alta en movil: 86,90 segundos por imagen 512×512 en Tensor G5, inviable para uso interactivo en tiempo real.
- Sin aceleracion GPU: la compilación de los grafos GPU falla en LiteRT 2.3 sobre Tensor G5; se necesitaría un export GPU compatible independiente, y la cuantización de pesos por sí sola no lo resuelve.
- Dispositivos no medidos: Pixel 10 Pro y Pixel 11 Pro no han sido verificados directamente; solo hay una medición de humo en Pixel 10 Pro Fold.
- Degradacion por cuantizacion: las salidas INT8 no son idénticas píxel a píxel al FP32; la cuantización puede alterar composición y detalle de la imagen.
- Consumo de memoria mayor que la descarga: activaciones, descuantización y cachés de driver añaden RAM al pico de 1,75 GiB medido.
- Licencia restrictiva: conserva la Stability AI Community License del modelo base, que restringe el uso comercial por ingresos y usos prohibidos; esta publicación no relicitencia los pesos. Revisar LICENSE.md antes de cualquier despliegue comercial.
- Resolucion fija 512×512 y prompts orientados a inglés (heredado del modelo base); otros idiomas no están documentados.
- Detalles tecnicos de Android: es obligatorio reutilizar el TensorBuffer de entrada para salidas con `aliasOfInput` y cerrar los buffers compartidos una sola vez; no hacerlo sobrescribe entradas válidas con memoria no inicializada.
- Riesgo de contenido: al heredar de SDXL-Turbo, puede generar contenido sesgado o inapropiado; no se han documentado mitigaciones adicionales en esta publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankdu/SDXL-Turbo-Mobile-INT8-LiteRT
- Modelo base: https://huggingface.co/stabilityai/sdxl-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sdxl-turbo/blob/main/LICENSE.md
- Especificaciones Pixel 10 Pro: https://store.google.com/product/pixel_10_pro_specs
- Especificaciones Pixel 11: https://store.google.com/product/pixel_11_specs
