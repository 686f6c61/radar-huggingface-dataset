# audenvenn/h3metal-z-image-turbo

## Resumen

h3metal-z-image-turbo es una conversión cuantizada a int8 del modelo de difusión texto-a-imagen Z-Image-Turbo de Tongyi-MAI (Alibaba), empaquetada en el formato propietario del motor de inferencia h3metal. El autor de la conversión es audenvenn, y su propósito no es otro que permitir ejecutar Z-Image-Turbo de forma nativa sobre las unidades matriciales de las GPU Apple de clase M5 y M6, algo que las librerías convencionales (diffusers, mflux) no aprovechan con la misma eficiencia. El paquete incluye el transformer DiT, el codificador de texto Qwen3-4B y el decodificador VAE, todo convertido a un formato que solo carga h3metal.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de optimización para Apple Silicon en un ecosistema dominado por CUDA. Por otro, sirve como referencia práctica de cuantización int8 de un modelo de difusión con soporte exacto de adaptadores LoRA, incluidas las capas de modulación AdaLN. El repositorio ocupa 10,7 GB y se distribuye bajo licencia Apache-2.0, la misma que los pesos originales.

No se dispone de información sobre el número de parámetros del modelo base ni sobre su longitud de contexto, ya que la model card se centra en el proceso de conversión y en el rendimiento del motor, no en las características arquitectónicas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) sobre Z-Image-Turbo, con codificador de texto Qwen3-4B y VAE; cuantización int8 con rotación de Hadamard |
| Parametros totales | no disponible (el transformer ocupa 6,1 GB en int8; el text encoder 4,3 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos) y activaciones int8 por fila tras rotación de Hadamard; VAE en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.h3m` (formato propio de h3metal: `dit.h3m`, `te.h3m`, `vae.h3m`), más `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Z-Image-Turbo, un modelo de difusión texto-a-imagen de Tongyi-MAI. La conversión de audenvenn mantiene la arquitectura DiT original pero reemplaza los pesos por versiones int8: el transformer pesa 6,1 GB, el codificador de texto (Qwen3-4B, limitado a las 35 capas que lee el pipeline) 4,3 GB, y el decodificador VAE 0,2 GB en float32. Las activaciones se cuantizan a int8 por fila después de aplicar una rotación de Hadamard, una técnica que reduce el error de cuantización al distribuir la energía de las activaciones de forma más uniforme.

La conversión se realiza con la herramienta `h3metal convert` a partir del checkpoint original, y el autor indica que ejecutarla con los ajustes por defecto produce exactamente los mismos bytes que el repositorio publicado. No hay información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la model card proporcionada. La innovación técnica destacable es el soporte de adaptadores LoRA aplicados como términos de bajo rango dentro de los productos int8, lo que permite mantener la precisión en las capas de modulación AdaLN que la mayoría de los LoRA adaptan.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante un pipeline de difusión con ocho pasos de muestreo.
- Resolución de salida de 1024 x 1024 y 2048 x 2048, con tiempos medidos de 17,4 s y 97,1 s respectivamente en un Mac mini M6 de 24 GB.
- Soporte de adaptadores LoRA con fuerza configurable (`--lora FILE[:STRENGTH]`), incluidas las capas AdaLN.
- Ejecución nativa en Apple Silicon mediante h3metal, aprovechando las unidades matriciales de GPU M5 y M6.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio, ya que se trata de un modelo de generación de imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes de alta resolución en estaciones de trabajo Mac: el modelo permite crear imágenes de 1024 x 1024 en 17,4 s y de 2048 x 2048 en 97,1 s en un Mac mini M6, lo que lo hace adecuado para flujos de trabajo creativos locales sin depender de servicios en la nube.
- Prototipado rápido de conceptos visuales: con un prompt nuevo y ocho pasos de muestreo, un diseñador puede iterar sobre ideas en menos de 20 segundos por imagen, integrando el comando `h3metal generate` en scripts de automatización.
- Personalización de estilo mediante LoRA: artistas y estudios pueden aplicar adaptadores LoRA entrenados para Z-Image-Turbo directamente sobre los pesos int8, manteniendo la fidelidad gracias a la aplicación exacta de los términos de bajo rango en las capas AdaLN.
- Desarrollo de aplicaciones de escritorio para macOS: al requerir solo 8,4 GB de memoria a 1024 x 1024, el modelo cabe en Macs con 24 GB de RAM unificada, lo que permite empaquetar una función de generación de imágenes dentro de una app nativa sin backend externo.
- Investigación en eficiencia de inferencia: el formato `.h3m` y la cuantización int8 con rotación de Hadamard sirven como banco de pruebas para estudiar el equilibrio entre velocidad y calidad (31,3 dB PSNR y SSIM 0,974 frente a bfloat16 en diffusers).
- Generación de imágenes para documentación técnica o material editorial: la licencia Apache-2.0 y el marcado automático de imágenes generadas por IA en cada PNG facilitan el cumplimiento de políticas de transparencia en publicaciones.
- Evaluación comparativa de motores de inferencia: el modelo permite reproducir los benchmarks del autor frente a mflux 0.24 con pesos de 8 bits, útil para decidir qué motor desplegar en un parque de Macs.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo 1024 x 1024 (Mac mini M6, 24 GB) | 17,4 s (8 pasos, de lanzamiento a PNG) |
| Tiempo 2048 x 2048 (misma máquina) | 97,1 s |
| Aceleración frente a mflux 0.24 (8 bits) | 2,1x a 1024 x 1024; 2,2x a 2048 x 2048 |
| PSNR frente a diffusers `ZImagePipeline` en bfloat16 | 31,3 dB |
| SSIM frente a diffusers `ZImagePipeline` en bfloat16 | 0,974 |
| Memoria a 1024 x 1024 | ~8,4 GB (6,1 GB del transformer mapeado + 2,2 GB adicionales) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imágenes y la model card solo reporta métricas de velocidad y fidelidad de reconstrucción.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~8,4 GB a 1024 x 1024 (6,1 GB del transformer mapeado en memoria más 2,2 GB adicionales); no se especifica el consumo a 2048 x 2048.
- GPU recomendadas: Apple M5 o M6 (clase M5/M6), que son las que exponen las unidades matriciales que h3metal aprovecha.
- No cabe en GPU consumer de NVIDIA ni AMD: el formato `.h3m` y el motor h3metal son específicos de Apple Silicon.
- En Mac: se ha verificado en un Mac mini M6 con 24 GB de memoria unificada; se requiere macOS 26 y Python 3.10 o superior.
- Opciones de despliegue: exclusivamente h3metal 0.5.1 o posterior (rueda `h3metal-0.5.1-py3-none-macosx_26_0_arm64.whl`); no es compatible con diffusers, llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: 17,4 s por imagen de 1024 x 1024 y 97,1 s por imagen de 2048 x 2048 en el hardware de referencia; no se reportan métricas de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| h3metal-z-image-turbo (esta ficha) | no disponible (transformer int8 de 6,1 GB) | no disponible | 17,4 s/imagen 1024² en M6; 31,3 dB PSNR vs bfloat16 | Apache-2.0 | Hugging Face, solo Apple Silicon M5/M6 |
| Z-Image-Turbo (Tongyi-MAI) | no disponible | no disponible | referencia bfloat16 en diffusers | Apache-2.0 | Hugging Face, multiplataforma |
| mflux 0.24 con pesos de 8 bits | no disponible | no disponible | 2,1x más lento que esta conversión en la misma máquina | no disponible | Motor para Apple Silicon |
| Otros modelos texto-a-imagen de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base y con mflux, que son los dos referentes que cita el autor. No se dispone de datos de otros modelos texto-a-imagen comparables en la información proporcionada.

## Limitaciones y advertencias

- El formato `.h3m` es propietario de h3metal: los archivos no cargan en diffusers ni en otras librerías, lo que limita la portabilidad.
- Requiere hardware muy específico: GPU Apple de clase M5 o M6, macOS 26 y Python 3.10 o superior; no funciona en Macs con GPU M1 a M4 ni en hardware NVIDIA o AMD.
- La cuantización int8 introduce una pérdida de fidelidad medible frente a bfloat16 (31,3 dB PSNR, SSIM 0,974), aceptable para muchos usos pero no idéntica al modelo original.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones de idioma en la model card; al ser un modelo de difusión, los sesgos del dataset de entrenamiento original de Z-Image-Turbo son aplicables pero no se detallan.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre los pesos convertidos; el archivo NOTICE lista los cambios respecto al original.
- Las imágenes generadas son sintéticas y h3metal lo indica en cada PNG escrito, lo que debe tenerse en cuenta en flujos de publicación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente de los benchmarks reportados.
- No se especifican requisitos de memoria para resoluciones superiores a 1024 x 1024, lo que dificulta planificar despliegues a 2048 x 2048.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/audenvenn/h3metal-z-image-turbo
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Motor h3metal en GitHub: https://github.com/audenvenn/h3metal
- Documentación de LoRA en h3metal: https://github.com/audenvenn/h3metal/blob/main/docs/lora.md
- Benchmarks de h3metal: https://github.com/audenvenn/h3metal/blob/main/docs/benchmarks.md
- Documentación específica de Z-Image en h3metal: https://github.com/audenvenn/h3metal/blob/main/docs/zimage.md
- Rueda de instalación h3metal 0.5.1: https://github.com/audenvenn/h3metal/releases/download/v0.5.1/h3metal-0.5.1-py3-none-macosx_26_0_arm64.whl
