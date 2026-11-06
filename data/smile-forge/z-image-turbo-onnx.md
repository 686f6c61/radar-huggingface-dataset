# smile-forge/z-image-turbo-onnx

## Resumen

Z-Image-Turbo ONNX es una conversión a formato ONNX del modelo de generación de imágenes Tongyi-MAI/Z-Image-Turbo (revisión `f332072a`), publicada por el usuario smile-forge. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetadura de los pesos originales en tres grafos ONNX ejecutables con ONNX Runtime 1.30 o superior y su proveedor de ejecución CUDA. Su propósito es permitir la inferencia del pipeline de difusión desde entornos que no disponen de PyTorch, en particular desde C# a través del proyecto Nexaflow, aunque cualquier runtime compatible con ONNX Runtime puede utilizarlo.

La conversión divide el pipeline en tres componentes: un codificador de prompt basado en Qwen3-4B truncado en su capa 35, un denoiser (transformer de difusión) que ejecuta un paso de eliminación de ruido y un decodificador VAE que transforma los latentes en píxeles. Los pesos del codificador y del denoiser están cuantizados a 8 bits mediante MatMulNBits, mientras que el decodificador mantiene pesos fp16. El repositorio ocupa 11,6 GB y la licencia es Apache-2.0, heredada del modelo original.

El interés de esta ficha reside en que documenta una vía de despliegue alternativa para un modelo de difusión de última generación fuera del ecosistema PyTorch, con cifras concretas de rendimiento (2,3 s por imagen de 1024×1024 en una RTX PRO 6000) y de fidelidad respecto al original (PSNR mediano de 29 dB en doce prompts). Es relevante para equipos que integran generación de imágenes en aplicaciones .NET o en infraestructuras donde ONNX Runtime es el runtime estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión: codificador de prompt (Qwen3-4B truncado a 35 capas), denoiser (transformer de difusión) y decodificador VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de prompt como máximo en el codificador |
| Tipos de cuantizacion | Pesos 8 bits (MatMulNBits) en codificador y denoiser; fp16 en el decodificador; aritmética fp32 en codificador y fp16 en denoiser y decodificador |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (tres grafos: `encoder/`, `denoiser/`, `decoder/`) |

## Arquitectura y entrenamiento

El modelo subyacente es Z-Image-Turbo, un modelo de difusión texto-a-imagen de Tongyi-MAI. La conversión no reentrena ni modifica los pesos más allá de la cuantización: el codificador de prompt emplea Qwen3-4B hasta su capa 35 para producir embeddings de 2560 dimensiones; el denoiser es un transformer de difusión que opera sobre latentes de 16 canales troceados en parches de 2×2; y el decodificador VAE reconstruye píxeles con un factor de escala espacial de 8. El muestreo se realiza con nueve pasos Euler sobre una secuencia σ = linspace(1, 1/9, 9), cada uno desplazado a 3σ/(1+2σ), y una actualización final a 0.

La conversión introduce varios ajustes técnicos para preservar la fidelidad numérica en ONNX. El denoiser original alcanza valores superiores a 10⁶ en las ramas de atención y feed-forward, lo que desborda el rango de fp16; puesto que cada rama termina en un RMSNorm que cancela una escala constante, se aplica un escalado por potencias de dos (registrado en `denoiser/branch-scales.json`) en la proyección de valores de la atención y en `w3` del feed-forward, exacto en coma flotante. Las rotaciones posicionales se representan como pares reales (cos, sin) en fp32 en lugar de números complejos. La atención se implementa con el operador fusionado `com.microsoft.MultiHeadAttention` de ONNX Runtime, ya que la versión descompuesta en MatMul → Softmax → MatMul retenía 9 GB de scores a 1024×1024 y desbordaba fp16 en el decodificador. Las secuencias de posiciones y padding se calculan en el host y se pasan como entradas, evitando formas fijas en el grafo. El embedder de timestep y la aritmética del codificador se mantienen en fp32 porque fp16 o pesos de 4 bits alteraban el texto generado.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural.
- Resoluciones compatibles con N múltiplo de 32: 1024×1024, 1344×768 y 768×1344.
- Codificación de prompts de hasta 512 tokens mediante un codificador Qwen3-4B truncado.
- Ejecución de un paso de denoising por llamada al grafo del denoiser, lo que permite orquestar el bucle de muestreo desde el host.
- Inferencia sin PyTorch: compatible con cualquier runtime que soporte ONNX Runtime 1.30 o superior con proveedor CUDA.
- Integración desde C# mediante el proyecto Nexaflow.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Generación de ilustraciones en aplicaciones .NET: el host de IA de Nexaflow dibuja imágenes desde C# llamando a los tres grafos ONNX, lo que permite incorporar generación de imágenes a aplicaciones de escritorio o servidores sin dependencia de PyTorch.
- Servicios de imagen en infraestructuras con ONNX Runtime: equipos cuyo stack de inferencia ya está estandarizado en ONNX Runtime pueden añadir un modelo de difusión sin introducir un runtime adicional.
- Generación de imágenes por lotes en servidor: con 2,3 s por imagen de 1024×1024 en una RTX PRO 6000 y 9,4 GB de VRAM en el pico del denoiser, es viable procesar colas de prompts en una GPU profesional.
- Prototipado de pipelines de difusión personalizados: al exponer el denoiser como un paso individual con entradas y salidas explícitas (latentes, posiciones, timestep), el host puede implementar variantes del muestreo, como schedulers alternativos o pasos adicionales.
- Integración en herramientas de diseño con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, adecuado para productos que generan recursos visuales.
- Evaluación comparativa de fidelidad de conversiones ONNX: el par de scripts `build_z_image.py` y `check_z_image.py` sirve como referencia reproducible para medir la degradación de una conversión frente al pipeline original en PyTorch.
- Despliegue en entornos con formatos de imagen específicos: las resoluciones 1344×768 y 768×1344 cubren formatos apaisados y verticales habituales en web y redes sociales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PSNR mediano frente a PyTorch en bf16 (12 prompts) | 29 dB |
| PSNR mínimo frente a PyTorch en bf16 (12 prompts) | 17 dB |
| Tiempo por imagen 1024×1024 en RTX PRO 6000 | 2,3 s |
| VRAM pico durante el denoiser (carga secuencial de partes) | 9,4 GB |
| Pasos de muestreo | 9 pasos Euler |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,4 GB en el pico durante la ejecución del denoiser cuando las partes se cargan una a una; el repositorio completo ocupa 11,6 GB en disco.
- GPU recomendadas: RTX PRO 6000 (medición oficial de 2,3 s por imagen a 1024×1024); cualquier GPU con al menos 10 GB de VRAM y soporte CUDA para ONNX Runtime.
- GPU de consumo: no se han publicado mediciones en tarjetas consumer; por el pico de 9,4 GB, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían ser suficientes, pero no hay datos confirmados.
- Opciones de despliegue: ONNX Runtime 1.30 o superior con el execution provider CUDA; el proyecto Nexaflow como host de referencia en C#.
- Latencia y throughput: 2,3 s por imagen de 1024×1024 en RTX PRO 6000; no se han publicado cifras para otras GPU ni para las resoluciones 1344×768 y 768×1344.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| smile-forge/z-image-turbo-onnx | no disponible | 512 tokens | ONNX (8 bits y fp16) | Apache-2.0 | Conversión ONNX del original, sin PyTorch |
| Tongyi-MAI/Z-Image-Turbo | no disponible | 512 tokens | PyTorch (bf16) | Apache-2.0 | Modelo original; requiere PyTorch |
| Otras conversiones ONNX de difusión | no disponible | no disponible | ONNX | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión, no un modelo entrenado: hereda los sesgos y limitaciones del Z-Image-Turbo original, que no se detallan en la información disponible.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar contenido incoherente o no solicitado; el PSNR mínimo de 17 dB frente a PyTorch indica que en algunos prompts la conversión se desvía más del original.
- Restricción de resolución: N debe ser múltiplo de 32; solo se documentan 1024×1024, 1344×768 y 768×1344.
- Límite de prompt: máximo de 512 tokens en el codificador.
- Dependencia de CUDA: el proveedor de ejecución documentado es CUDA; no se describe soporte para CPU, DirectML u otros execution providers.
- Requiere ONNX Runtime 1.30 o superior; versiones anteriores pueden no soportar los operadores utilizados.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador Qwen3-4B no se especifica en la model card.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los pesos de Qwen3-4B subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smile-forge/z-image-turbo-onnx
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Proyecto Nexaflow: https://github.com/smile-forge/nexaflow
- Ficha en free2aitools: https://free2aitools.com/model/smile-forge/z-image-turbo-onnx
