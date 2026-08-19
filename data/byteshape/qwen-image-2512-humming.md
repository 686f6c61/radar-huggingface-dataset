# byteshape/Qwen-Image-2512-Humming

## Resumen

Qwen-Image-2512 Humming es una versión cuantizada del modelo de generación de imágenes Qwen-Image-2512, desarrollada por ByteShape para el backend de inferencia vLLM-Omni con kernels optimizados Humming. El modelo utiliza la técnica de cuantización propietaria ShapeLearn, que aprende el tipo de dato óptimo por tensor para mantener una alta calidad incluso a longitudes de bit muy bajas. Se distribuye en seis tamaños, desde 3.07 hasta 6.77 bits por peso, con tamaños de transformer que van desde 7.83 GB hasta 17.29 GB. Cada paquete incluye el codificador de texto, el VAE, el scheduler y el tokenizador, de modo que no hay que descargar componentes por separado.

Este modelo está pensado para entornos de producción que requieran generación de imágenes de alta calidad con requisitos de VRAM reducidos. La cuantización permite ejecutar el modelo en tarjetas gráficas de consumo como la RTX 5090 (32 GB) con descarga de CPU, o en GPUs profesionales de 48 GB o más sin necesidad de descarga. El backend vLLM-Omni con kernels Humming ofrece un rendimiento aproximadamente 2-3 veces superior al de la ruta GGUF, con unos 0,5 segundos por paso en una RTX 5090, lo que supone unos 10 segundos para una imagen de 20 pasos. El modelo se distribuye bajo licencia Apache-2.0 y el repositorio tiene un tamaño de 87,3 GB.

La relevancia actual de este modelo radica en que permite ejecutar un modelo de difusión de última generación en hardware de consumo sin sacrificar demasiada calidad. La cuantización no acelera la inferencia (a diferencia de los LLM), pero sí reduce significativamente el consumo de VRAM, lo que amplía el rango de GPUs compatibles. Además, al estar diseñado específicamente para vLLM-Omni, se integra fácilmente en pipelines de generación de imágenes existentes que ya utilizan este backend.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto a imagen (arquitectura específica no disponible; basado en Qwen-Image-2512) |
| Parametros totales | No disponible (tamaño del transformer por variante: 7,83 GB a 17,29 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generación de imágenes) |
| Tipos de cuantizacion | 6 niveles: 3,07 / 3,57 / 4,18 / 4,70 / 5,33 / 6,77 bpw (ShapeLearn) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (para vLLM-Omni); también disponible en GGUF para ComfyUI y stable-diffusion.cpp |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo base Qwen-Image-2512, un modelo de difusión de texto a imagen desarrollado por Alibaba. La arquitectura interna del modelo original no se detalla en la información proporcionada, pero se trata de un modelo de difusión (probablemente un transformer de difusión, DiT) que genera imágenes a partir de prompts de texto. La cuantización se realizó con la técnica propietaria ShapeLearn de ByteShape, que aprende el tipo de dato óptimo para cada tensor, lo que permite mantener una calidad visual alta incluso a longitudes de bit muy bajas (hasta 3,07 bpw).

No se proporcionan datos sobre el entrenamiento original del modelo base, como el número de tokens, la composición del dataset o si se utilizaron técnicas de RLHF o DPO. La información disponible se centra exclusivamente en el proceso de cuantización y en el backend de inferencia. El modelo se distribuye como un "shell" (pipeline) compartido más un pool de transformadores cuantizados, uno por tamaño, de modo que se descarga el shell una vez y se selecciona el transformer deseado.

## Capacidades

- Generación de imágenes a partir de prompts de texto con alta calidad y detalle, especialmente en sujetos humanos y elementos naturales (según la descripción del modelo base).
- Seis niveles de cuantización que permiten ajustar el equilibrio entre calidad y consumo de VRAM, desde 3,07 bpw (7,83 GB) hasta 6,77 bpw (17,29 GB).
- Inferencia acelerada mediante kernels Humming optimizados para el backend vLLM-Omni, con un rendimiento 2-3 veces superior al de la ruta GGUF.
- Soporte para descarga de CPU (`--enable-cpu-offload`), lo que permite ejecutar el modelo en GPUs con 32 GB o menos de VRAM manteniendo el codificador de texto en RAM.
- Compatible con vLLM 0.24.0 y vLLM-Omni 0.24.0, así como con `vllm-omni-humming` 0.3.0 y `humming-kernels` 0.1.11.
- Disponibilidad de una variante GGUF (en repositorio separado) para su uso con ComfyUI y `stable-diffusion.cpp`, ampliando el rango de hardware compatible.
- El paquete incluye todos los componentes necesarios (codificador de texto, VAE, scheduler, tokenizador), lo que simplifica el despliegue.

## Casos de uso

- Generación de imágenes en producción con GPUs de consumo: gracias a la cuantización y al backend optimizado, se pueden desplegar servicios de generación de imágenes en tarjetas como RTX 3090, RTX 4090 o RTX 5090, sin necesidad de GPUs profesionales de alta gama. Por ejemplo, una RTX 5090 puede generar una imagen de 1024x1024 en aproximadamente 10 segundos con 20 pasos.
- Prototipado rápido en estudios de diseño: los diseñadores pueden probar diferentes niveles de cuantización (desde 6,77 bpw hasta 3,07 bpw) para evaluar visualmente el impacto en la calidad y elegir el punto óptimo para su caso de uso. El comparador interactivo del blog de ByteShape permite A/B entre variantes.
- Integración en pipelines de generación de imágenes existentes: al ser compatible con vLLM-Omni, se puede integrar en sistemas que ya utilizan este backend para servir modelos de difusión, sin cambios significativos en la infraestructura.
- Generación de imágenes en entornos con recursos limitados: la variante de 3,07 bpw (7,83 GB) con descarga de CPU permite ejecutar el modelo en GPUs con tan solo 25 GB de VRAM, lo que habilita su uso en estaciones de trabajo con GPUs de gama media.
- Evaluación de calidad de cuantización: los investigadores pueden utilizar los seis niveles de cuantización para estudiar el impacto de la reducción de bits en la calidad de imágenes generadas, utilizando el conjunto de 24 prompts curados del blog de ByteShape.
- Despliegue en entornos de inferencia de alto rendimiento: con una RTX Pro 6000 (48 GB) o GPUs de mayor capacidad, se puede ejecutar la variante de 6,77 bpw sin descarga de CPU, obteniendo el máximo rendimiento y calidad. Esto es adecuado para servicios de generación de imágenes a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como FID, CLIP score, etc.) en la información disponible. Sin embargo, el autor proporciona datos de rendimiento de inferencia comparando el backend vLLM-Omni con la ruta GGUF en una RTX 5090:

| Backend | Tiempo por paso (RTX 5090) | Tiempo para 20 pasos |
|---|---|---|
| vLLM-Omni (este repositorio) | ~0,5 s | ~10 s |
| GGUF (repositorio separado) | ~1,2 s | ~24 s |

Además, se indica que la calidad visual se mantiene alta en todos los niveles de cuantización, siendo las variantes de 6,77 y 5,33 bpw casi indistinguibles del modelo en BF16, mientras que a partir de 4,70 bpw aparecen artefactos como una neblina grisácea o pérdida de detalle, y a 3,07 bpw la composición puede desviarse ligeramente. Estos resultados son cualitativos y dependen del prompt.

## Requisitos de hardware

- VRAM estimada: el tamaño del transformer varía de 7,83 GB (3,07 bpw) a 17,29 GB (6,77 bpw). El shell (codificador de texto en BF16 + VAE + scheduler + tokenizador) añade aproximadamente 17 GB. Por tanto, mantener todo en GPU requiere entre ~25 GB (variante más pequeña) y ~34 GB (variante más grande).
- GPUs recomendadas:
  - Tarjetas con 32 GB o menos (incluida RTX 5090): se recomienda usar `--enable-cpu-offload`, que mantiene el codificador de texto en RAM. Todas las variantes funcionan.
  - Tarjetas de 48 GB o más (por ejemplo, RTX Pro 6000): se puede ejecutar sin descarga de CPU para máxima velocidad.
- Compatibilidad: Linux y NVIDIA únicamente, con arquitecturas SM75 o superiores (RTX 20 series en adelante) y driver ≥ 575. Probado en GPUs de las series 30, 40 y 50, y RTX Pro 6000.
- Opciones de despliegue:
  - vLLM-Omni con kernels Humming (este repositorio) para máximo rendimiento.
  - GGUF (repositorio separado) para ComfyUI y `stable-diffusion.cpp`, con un rango más amplio de hardware.
- Latencia y throughput: en RTX 5090, ~0,5 s por paso con vLLM-Omni, lo que equivale a ~10 s para una imagen de 20 pasos. En la ruta GGUF, ~1,2 s por paso (~24 s para 20 pasos).

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen-Image-2512 en su versión BF16 y con la variante GGUF del mismo modelo cuantizado. No se dispone de datos de otros modelos de generación de imágenes como SDXL o Flux para una comparación cuantitativa.

| Modelo | Tamaño del transformer | Formato | Backend | Tiempo por paso (RTX 5090) | VRAM estimada (todo en GPU) | Licencia |
|---|---|---|---|---|---|---|
| Qwen-Image-2512 (BF16) | No disponible (mayor que 17,29 GB) | BF16 | vLLM-Omni | No disponible | Probablemente > 34 GB | Apache-2.0 |
| Qwen-Image-2512 Humming (6,77 bpw) | 17,29 GB | Safetensors cuantizado | vLLM-Omni | ~0,5 s | ~34 GB | Apache-2.0 |
| Qwen-Image-2512 Humming (3,07 bpw) | 7,83 GB | Safetensors cuantizado | vLLM-Omni | ~0,5 s | ~25 GB | Apache-2.0 |
| Qwen-Image-2512 GGUF | Variable según cuantización | GGUF | ComfyUI / stable-diffusion.cpp | ~1,2 s | Depende de la cuantización | Apache-2.0 |

La principal ventaja de este modelo frente a la versión BF16 es la reducción de VRAM, que permite ejecutarlo en GPUs de consumo. Frente a la variante GGUF, ofrece un rendimiento 2-3 veces superior gracias a los kernels Humming, aunque limita el hardware a NVIDIA con SM75+.

## Limitaciones y advertencias

- Estado experimental: el autor indica que el flujo está probado con versiones específicas de vLLM (0.24.0), vLLM-Omni (0.24.0), `vllm-omni-humming` (0.3.0) y `humming-kernels` (0.1.11). No se garantiza compatibilidad con otras versiones.
- Solo Linux y NVIDIA: el backend requiere arquitecturas SM75 o superiores y driver ≥ 575. No hay soporte para AMD, Intel o Windows.
- Degradación de calidad en cuantizaciones bajas: a partir de 4,70 bpw aparecen artefactos como neblina o pérdida de detalle, y a 3,07 bpw la composición puede desviarse. Aunque la calidad se mantiene aceptable, es recomendable usar el mayor tamaño que quepa en VRAM.
- La cuantización no acelera la inferencia: a diferencia de los LLM, la compresión no reduce el tiempo por paso en difusión. Solo aporta ahorro de VRAM.
- El codificador de texto se mantiene en BF16 y ocupa ~16,6 GB, lo que puede ser un cuello de botella en GPUs con poca VRAM si no se usa descarga de CPU.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo base. Se recomienda evaluar el comportamiento en el dominio de aplicación específico.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen-Image-2512 (también Apache-2.0 según el repositorio).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/byteshape/Qwen-Image-2512-Humming
- Blog de ByteShape con documentación completa y workflow de ComfyUI: https://byteshape.com/blogs/Qwen-Image-2512/
- Comparador interactivo de variantes (24 prompts, A/B con slider): https://byteshape.com/blogs/Qwen-Image-2512/comparison/
- Repositorio GGUF del mismo modelo: https://huggingface.co/byteshape/Qwen-Image-2512-GGUF
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Modelo base Qwen-Image-2512 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2512
- Modelo base Qwen-Image-2512 en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen-Image-2512
