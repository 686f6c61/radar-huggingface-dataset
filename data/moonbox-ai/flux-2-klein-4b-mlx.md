# moonbox-ai/FLUX.2-klein-4B-MLX

## Resumen
FLUX.2-klein-4B-MLX es una conversión al formato MLX del modelo de difusión FLUX.2 Klein 4B de Black Forest Labs, realizada por el usuario moonbox-ai para su ejecución nativa en Apple Silicon. Se trata de un modelo texto-a-imagen (con capacidades de edición de imagen según los tags del repositorio) empaquetado en archivos safetensors por precisión, de modo que cada carpeta (`bf16`, `8bit`) contiene un pipeline completo listo para cargarse con la librería MLX de Apple.

El modelo base, FLUX.2 Klein 4B, pertenece a la familia FLUX.2 de Black Forest Labs, orientada a generación y edición de imágenes mediante difusión. La versión aquí publicada no entrena ni modifica los pesos originales: solo los convierte y los reorganiza en el formato que consume MLX (a través de la herramienta mflux), manteniendo la licencia Apache 2.0 del modelo original.

Su relevancia radica en que permite ejecutar un modelo de difusión de 4B parámetros en Macs con chip Apple Silicon sin depender de CUDA ni de PyTorch, algo útil para desarrolladores que trabajan en entornos macOS y quieren integrar generación de imágenes en flujos locales. El repositorio ocupa 35,7 GB e incluye verificaciones de fidelidad (PSNR y LPIPS) frente al modelo PyTorch original en cada precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer + text encoder + VAE), según estructura de archivos; detalles internos no disponibles |
| Parámetros totales | 4B (según nombre del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 y 8bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado MLX, con `mflux_model.json` e índices `model.safetensors.index.json`) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base FLUX.2 Klein 4B más allá de que es un modelo de difusión para texto-a-imagen (pipeline `text-to-image`) con capacidad de edición de imagen según los tags. El repositorio organiza los pesos en tres componentes claramente diferenciados: un `text_encoder` (codificador de texto, dividido en varios shards de ~2 GB), un `transformer` (el núcleo de difusión, también en shards de ~2 GB) y un `vae` (autoencoder variacional de ~168 MB). Esta estructura es la habitual en la familia FLUX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. La conversión a MLX se ha realizado con la herramienta mflux, que genera un `mflux_model.json` de configuración y reorganiza los tensores en carpetas por precisión. El autor reporta métricas de fidelidad frente al modelo PyTorch original: para bf16, PSNR medio de 27,9 dB y LPIPS medio de 0,059 (peor caso 0,131); para 8bit, PSNR medio de 27,4 dB y LPIPS medio de 0,043 (peor caso 0,060). Sorprendentemente, la versión 8bit obtiene mejor LPIPS que la bf16 en esta medición, aunque la diferencia es pequeña.

## Capacidades
- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes (image-editing), según los tags del repositorio.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Dos niveles de precisión (bf16 y 8bit) para ajustar calidad frente a uso de memoria.
- Integración con el ecosistema mflux para carga del pipeline.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión inversa ni audio.

## Casos de uso
- Generación de ilustraciones locales en Mac: un desarrollador puede ejecutar el pipeline en un Mac con Apple Silicon para crear imágenes a partir de prompts sin enviar datos a servicios en la nube, útil por privacidad.
- Prototipado rápido de assets para videojuegos o apps: la versión 8bit reduce el uso de memoria y permite iterar sobre conceptos visuales en local antes de pasar a un pipeline de producción.
- Edición de imágenes en flujos creativos: gracias a la capacidad de image-editing, se puede modificar una imagen existente con instrucciones textuales dentro de una herramienta de diseño que corra en macOS.
- Automatización de contenido para blogs o redes: generación por lotes de imágenes de cabecera o ilustraciones a partir de plantillas de prompt, ejecutándose en un Mac de sobremesa.
- Investigación en difusión sobre hardware Apple: el repositorio sirve como referencia para estudiar el comportamiento de un modelo de difusión de 4B en MLX, con métricas de fidelidad ya publicadas (PSNR/LPIPS) frente a PyTorch.
- Integración en apps macOS nativas: al usar MLX, el modelo puede incrustarse en aplicaciones Swift/Python que aprovechen la GPU unificada del chip Apple, sin dependencias de CUDA.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de fidelidad de la conversión frente al modelo original:

| Precisión | PSNR medio | LPIPS medio | LPIPS peor caso |
|---|---|---|---|
| bf16 | 27,9 dB | 0,059 | 0,131 |
| 8bit | 27,4 dB | 0,043 | 0,060 |

## Requisitos de hardware
- VRAM/memoria unificada estimada: el repositorio completo ocupa 35,7 GB, pero cada precisión se carga por separado. La carpeta bf16 suma aproximadamente 12,5 GB en pesos (text encoder ~8 GB, transformer ~7,7 GB, VAE ~0,17 GB, más tokenizer), y la carpeta 8bit es similar en tamaño de archivo pero con cuantización de 8 bits en algunos componentes.
- GPU recomendadas: chips Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4 Pro, Max o Ultra). No aplica a GPUs NVIDIA/AMD porque el formato es MLX.
- ¿Cabe en consumer GPU? No en el sentido tradicional; está pensado para Macs. En un Mac con 16 GB de memoria unificada podría ser ajustado para bf16; se recomienda 24 GB o más para comodidad, y 8bit para equipos más modestos.
- Opciones de despliegue: MLX y mflux en macOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Formato |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-MLX (este) | 4B | No disponible | Apache 2.0 | Hugging Face (MLX) | safetensors MLX |
| FLUX.2-klein-4B (original) | 4B | No disponible | Apache 2.0 | Hugging Face (PyTorch) | safetensors PyTorch |
| Otras conversiones MLX de difusión | No disponible | No disponible | Variable | Hugging Face | safetensors MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a GPUs convencionales.
- El repositorio ocupa 35,7 GB, lo que exige espacio en disco considerable aunque solo se use una precisión.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser un modelo de imagen, el riesgo se traslada a sesgos visuales y estereotipos en las generaciones.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Black Forest Labs.
- Las métricas de fidelidad (PSNR/LPIPS) son del autor y no han sido validadas de forma independiente.
- La versión 8bit, pese a su nombre, no reduce drásticamente el tamaño de archivo respecto a bf16 según los listados; revisar antes de asumir ahorros de memoria.
- No hay información sobre latencia, throughput ni requisitos mínimos oficiales de memoria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-MLX
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Configuración MLX bf16: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-MLX/blob/main/bf16/mflux_model.json
- Configuración MLX 8bit: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-MLX/blob/main/8bit/mflux_model.json
