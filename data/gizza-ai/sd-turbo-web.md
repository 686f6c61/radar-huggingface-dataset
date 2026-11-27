# gizza-ai/sd-turbo-web

## Resumen

SD-Turbo-web es una conversión a ONNX del modelo de generación de imágenes stabilityai/sd-turbo, empaquetada específicamente para ejecutarse íntegramente en el navegador mediante onnxruntime-web sobre WebGPU. Lo publica el usuario gizza-ai y lo utiliza su editor de imágenes gizza.ai, con la particularidad de que ni el prompt ni las imágenes generadas abandonan el dispositivo del usuario. No se trata de un modelo nuevo, sino de una redistribución optimizada del SD-Turbo original de Stability AI (revisión `b261bac6fd2cf515557d5d0707481eafa0485ec2`).

El modelo base SD-Turbo es un modelo de difusión de tipo text-to-image destilado para generar imágenes en un único paso de inferencia, lo que reduce drásticamente el coste computacional frente a los modelos de difusión convencionales que requieren decenas de pasos. Esta conversión conserva esa característica y la adapta a un entorno de ejecución web, con dos variantes de pesos (una cuantizada a 8 bits y otra en fp16) que difieren en tamaño y requisitos de hardware.

Su relevancia actual radica en la posibilidad de ofrecer generación de imágenes local y privada desde un navegador, sin backend ni envío de datos a servidores, algo poco habitual en modelos de este tipo. El repositorio ocupa 4.2 GB e incluye los grafos ONNX del codificador de texto, la U-Net y el decodificador VAE, junto con el tokenizador CLIP y un manifiesto con tamaños y hashes SHA-256.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (latent diffusion) convertido a ONNX; U-Net + codificador de texto CLIP + VAE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; tokenizador CLIP de 77 tokens (padding con id 0) |
| Tipos de cuantización | 8-bit MatMulNBits (bloque 32) + pesos conv int8 (variante `nof16q8`); fp16 (variante `fp16`) |
| Idiomas soportados | no disponible |
| Licencia | Stability AI Community License (con sujeción a la Acceptable Use Policy de Stability AI) |
| Formato de pesos | ONNX (opset 17) con pesos externos en `model.onnx.data` |

## Arquitectura y entrenamiento

El modelo es una conversión del SD-Turbo de Stability AI, que a su vez es un modelo de difusión latente destilado para generación en un solo paso. La conversión mantiene la estructura en tres componentes: codificador de texto CLIP, U-Net y decodificador VAE, cada uno exportado como un grafo ONNX independiente con pesos externos. Los grafos usan opset 17, batch estático 1 a resolución 512×512, entradas y salidas en float32 y timestep de tipo `int64 [999]`.

El pipeline de inferencia emplea un único paso con el sampler EulerDiscrete y timesteps finales (t = 999), predicción de epsilon, betas scaled_linear de 0.00085 a 0.012 sobre 1000 pasos, sin classifier-free guidance y con escala latente del VAE de 0.18215. La variante `nof16q8` aplica cuantización de 8 bits en las matmuls (bloque 32) y en los pesos de convolución, manteniendo el VAE en fp32; la variante `fp16` conserva todos los pesos en media precisión. No se dispone de información sobre el dataset de entrenamiento original ni sobre procesos de RLHF/DPO, al ser datos heredados del modelo base y no documentados en esta conversión.

## Capacidades

- Generación de imágenes text-to-image en un único paso de inferencia, a resolución 512×512.
- Ejecución íntegra en el navegador mediante onnxruntime-web sobre WebGPU, sin backend.
- Privacidad por diseño: prompt e imágenes no salen del dispositivo del usuario.
- Dos variantes de ejecución según el soporte de `shader-f16` del hardware.
- Tokenización CLIP integrada (77 tokens) para procesar el prompt.
- No incluye filtro de salida; la generación es sin filtrar.
- No dispone de tool calling, agentes, visión de entrada ni audio.
- Capacidades multilingües: no documentadas; el tokenizador CLIP determina el comportamiento con distintos idiomas.

## Casos de uso

- Edición de imágenes en el navegador: integración en editores web como gizza.ai, donde el modelo genera imágenes a partir de un prompt sin enviar datos a servidores, preservando la privacidad del usuario.
- Aplicaciones de privacidad estricta: escenarios donde el contenido del prompt es sensible y no puede salir del dispositivo, como herramientas internas de diseño o prototipado.
- Demos y herramientas educativas: mostrar generación de imágenes por difusión directamente en una página web, sin infraestructura de backend ni costes de GPU en la nube.
- Prototipado rápido de UI: incorporar generación de imágenes en aplicaciones web para maquetas y pruebas de concepto con latencias de alrededor de 10 s en frío.
- Aplicaciones offline o de borde: uso en entornos con conectividad limitada una vez cargados los pesos en el navegador, siempre que el dispositivo soporte WebGPU.
- Generación de assets en cliente: creación de imágenes de apoyo en herramientas creativas web, aprovechando la variante cuantizada para equipos sin soporte de `shader-f16`.

## Benchmarks y rendimiento

La model card documenta una validación frente al pipeline fp32 de diffusers (mismo prompt, ruido con semilla 42, 1 paso), medida en PSNR:

| Variante | PSNR frente a referencia fp32 |
|---|---|
| `nof16q8` | 33.8 dB |
| `fp16` | 59.9 dB |

Además, la variante `nof16q8` se ejecutó en Chrome sobre WebGPU (RTX 4070 Ti, Linux, sin `shader-f16`) con salida idéntica a la ejecución en CPU, en aproximadamente 10 s en frío. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los pesos es de ~1.65 GiB para `nof16q8` y ~2.4 GiB para `fp16`.
- GPU recomendadas: cualquier GPU con soporte de WebGPU; la variante `fp16` requiere además `shader-f16`. Validado en RTX 4070 Ti.
- Cabe en GPU de consumo: sí, ambas variantes están pensadas para ejecución en navegador sobre GPU de consumo con WebGPU.
- Opciones de despliegue: onnxruntime-web sobre WebGPU en el navegador; los grafos ONNX también pueden ejecutarse en CPU (validado con salida idéntica).
- Latencia: aproximadamente 10 s en frío en la prueba documentada con `nof16q8` en RTX 4070 Ti.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Pasos | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|---|
| gizza-ai/sd-turbo-web | Difusión (ONNX) | 512×512 | 1 | ONNX | Stability AI Community | Sí (WebGPU) |
| stabilityai/sd-turbo | Difusión | 512×512 | 1 | safetensors/diffusers | Stability AI Community | No nativa |
| Modelos de difusión convencionales (p. ej. SD 1.5) | Difusión | 512×512 | decenas | safetensors/diffusers | según variante | No nativa |

La comparativa se limita a los datos disponibles; no se dispone de cifras de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No incluye filtro de salida: la generación es sin filtrar y el usuario es responsable del cumplimiento de la licencia y de la Acceptable Use Policy.
- Licencia Stability AI Community: restricciones para uso comercial según los términos de dicha licencia y de la política de uso aceptable de Stability AI.
- Resolución fija de 512×512 con batch estático 1; no admite otras resoluciones ni lotes sin reexportar los grafos.
- Un único paso de inferencia: la calidad puede ser inferior a la de pipelines multi-paso, aunque el PSNR frente a fp32 es alto en la variante `fp16`.
- La variante `nof16q8` presenta una fidelidad menor (33.8 dB) frente a la referencia fp32 que la variante `fp16` (59.9 dB).
- Requiere navegador con WebGPU; la variante `fp16` necesita además soporte de `shader-f16`.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del tokenizador CLIP.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base, no evaluado en esta conversión.
- Tiempos de carga iniciales elevados por el tamaño de los pesos (~1.65 GiB o ~2.4 GiB).

## Enlaces

- Hugging Face: https://huggingface.co/gizza-ai/sd-turbo-web
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Repositorio de la receta de conversión: https://github.com/gizza-ai/gizza-ai (carpeta `models/sd-turbo-web/`)
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- Editor gizza.ai: https://gizza.ai
- Acceptable Use Policy de Stability AI: https://stability.ai/use-policy
- Licencia (LICENSE.md): incluida en el repositorio de Hugging Face
