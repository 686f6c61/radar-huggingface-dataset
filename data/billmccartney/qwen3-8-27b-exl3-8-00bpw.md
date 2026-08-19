# billmccartney/Qwen3.8-27B-exl3-8.00bpw

## Resumen

Esta ficha describe **Qwen3.8-27B EXL3 8.0bpw**, una cuantización EXL3 de 8 bits por peso del modelo denso Qwen/Qwen3.8-27B, publicada por Bill McCartney en agosto de 2026. El modelo base, desarrollado por Alibaba Qwen, es un vision-language model (VLM) de 27B parámetros basado en la arquitectura Qwen3.5, con soporte nativo de imagen y video, razonamiento extenso y capacidades agénticas. La cuantización EXL3 (ExLlamaV3) reduce el tamaño de los pesos de 16 bits a 8 bits manteniendo la torre de visión en BF16 y el módulo MTP (Multi-Token Prediction) a 4 bits, lo que permite ejecutar el modelo en hardware con menos VRAM sin sacrificar demasiada calidad.

La relevancia de esta release radica en que, en el momento de su publicación, no existía una versión EXL3 pública de 8.0bpw del Qwen3.8-27B; la referencia de turboderp solo llegaba a 6.0bpw. Esto la convierte en una opción atractiva para quienes usan TabbyAPI o ExLlamaV3 y necesitan un equilibrio entre fidelidad y consumo de memoria. La cuantización mantiene intactas las capacidades multimodales y de razonamiento del modelo original, aunque con las limitaciones propias de cualquier cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con visión (basado en Qwen3.5), con MTP y torre de visión |
| Parametros totales | 27B (modelo base); el conteo de safetensors de esta cuantización es 14.670.918.896 (menor por la representación compacta EXL3) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (modelo base); en esta cuantización se ha probado hasta 212.992 tokens (208K) según configuración de TabbyAPI |
| Tipos de cuantizacion | EXL3 8.0bpw (bits=8.0, head_bits=8, mtp_bits=4) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero la cuantización no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con arquitectura Qwen3.5, que incorpora una torre de visión para entrada de imágenes y video, y un módulo MTP (Multi-Token Prediction) para decodificación especulativa sin modelo auxiliar. El entrenamiento del modelo original incluye fases de preentrenamiento y ajuste fino con razonamiento (thinking mode) y datos de agentes, lo que le permite planificar tareas multi-paso y manejar feedback del entorno.

La cuantización EXL3 8.0bpw transforma los pesos del LM desde BF16 a una representación de 8 bits con codebook `mul1` y `out_scales=always`, usando calibración stock de ExLlamaV3 (250 filas, 2048 columnas). La torre de visión se conserva íntegramente en BF16 (333 tensores, ~858 MiB) y el módulo MTP se cuantiza a 4 bits. El autor no ha realizado ningún ajuste fino adicional; se trata de una conversión puramente de cuantización.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" activable mediante tokens especiales (` thinking` y ` response`).
- Comprensión de imágenes y video (gracias a la torre de visión BF16 conservada).
- Generación y comprensión de código, con soporte de tool calling y formato de herramientas `qwen3_coder`.
- Ejecución de tareas agénticas: planificación autónoma, manejo de feedback del entorno y ejecución de acciones multi-paso.
- Multilingüismo (heredado del modelo base, aunque no se detalla en la cuantización).
- Decodificación especulativa autónoma mediante MTP, que acelera la generación sin necesidad de un modelo draft externo.

## Casos de uso

- **Asistentes de código en producción**: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o parchear código. Su ventana de contexto de hasta 212K tokens permite procesar repositorios completos.
- **Agentes autónomos de navegación web**: gracias a su capacidad de razonamiento largo y manejo de feedback, puede usarse en tareas como rellenar formularios, extraer datos o interactuar con APIs, con el formato de herramientas `qwen3_coder`.
- **Análisis de documentos multimodales**: la torre de visión permite procesar capturas de pantalla, diagramas o PDFs escaneados junto con texto, útil en entornos de soporte o investigación.
- **Automatización de atención al cliente**: el contexto largo y el modo razonamiento permiten mantener conversaciones multi-turno complejas, con seguimiento de historial y decisiones justificadas.
- **Investigación y redacción técnica**: puede resumir artículos, generar informes estructurados o redactar documentación a partir de material extenso, aprovechando los 262K tokens de contexto del modelo base.
- **Despliegue en hardware limitado**: al ser una cuantización de 8 bits, permite ejecutar el modelo en GPUs de 24 GB (como RTX 3090/4090) o en configuraciones de doble GPU, donde el modelo BF16 no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. Los datos del modelo base (según la guía de LovableApp) son:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (SWE-bench) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

La model card de la cuantización incluye mediciones de rendimiento en una tarea agéntica multi-paso con contexto de 196.608 tokens, usando una RTX 4070 12 GB + RTX 3090 24 GB:

| Medición | MTP off | MTP on |
|---|---|---|
| Tiempo total (mediana) | 109.87 s | 58.72 s |
| Velocidad de decodificación | 22.90–24.24 tok/s | 79.54–99.70 tok/s |
| VRAM pico | 32.346 MiB | 34.182 MiB |
| Tasa de aceptación de tokens draft | — | 64.45% |

## Requisitos de hardware

- **VRAM estimada**: ~32 GB sin MTP, ~34 GB con MTP activado, según las mediciones del autor.
- **GPU recomendadas**: una RTX 3090/4090 de 24 GB (con cuantización de caché `4,4` y contexto reducido) o dos GPUs (por ejemplo, RTX 4070 12 GB + RTX 3090 24 GB). No cabe en una GPU consumer de 12 GB para contextos largos.
- **Opciones de despliegue**: TabbyAPI (backend ExLlamaV3), scripts de generación de ExLlamaV3, o cualquier servidor compatible con EXL3. No es compatible con llama.cpp ni Ollama (usan GGUF).
- **Latencia y throughput**: en la tarea medida, la decodificación alcanza entre 23 y 100 tok/s dependiendo del uso de MTP. El MTP acelera la generación ~1.87× a costa de ~1.8 GB adicionales de VRAM.

## Comparativa con modelos similares

| Modelo | Cuantización | Contexto | VRAM aprox. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B EXL3 8.0bpw (esta release) | EXL3 8 bits | 262K (probado hasta 212K) | ~32–34 GB | Apache 2.0 | Hugging Face |
| Qwen3.8-27B EXL3 6.0bpw (turboderp) | EXL3 6 bits | 262K | ~24–26 GB | Apache 2.0 | Hugging Face |
| Qwen3.8-27B GGUF Q8_0 | GGUF 8 bits | 262K | ~30 GB | Apache 2.0 | Hugging Face |

La ventaja de esta release frente a la GGUF es la compatibilidad nativa con ExLlamaV3 y el MTP, que acelera la inferencia. Frente a la EXL3 6.0bpw, ofrece mayor fidelidad (8 bits vs 6 bits) a cambio de más VRAM.

## Limitaciones y advertencias

- **No usar greedy decoding** para razonamiento largo: la model card advierte explícitamente que el modo greedy puede colapsar en repeticiones y no cerrar el razonamiento, consumiendo todo el presupuesto de tokens sin respuesta visible. Se recomienda `temperature: 1.0`, `top_p: 0.95`, `top_k: 20`.
- **Compatibilidad**: solo se garantiza con ExLlamaV3 1.4.2 (`1.4.2+cu128.torch2.9.0`). Versiones anteriores pueden no cargar el artefacto correctamente.
- **Degradación por cuantización**: aunque la calidad es alta, los pesos de 8 bits pueden introducir pequeñas diferencias frente al BF16 original, especialmente en tareas de precisión numérica o razonamiento largo.
- **Torre de visión en BF16**: ocupa ~858 MiB en disco aunque no se use; en TabbyAPI solo se carga en VRAM si se activa la opción `vision`.
- **Sesgos y alucinaciones**: heredados del modelo base; no se han evaluado específicamente en esta cuantización.
- **Uso comercial**: permitido bajo licencia Apache 2.0, sin restricciones conocidas.

## Enlaces

- [Repositorio Hugging Face de la cuantización](https://huggingface.co/billmccartney/Qwen3.8-27B-exl3-8.00bpw)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Referencia EXL3 de turboderp (6.0bpw)](https://huggingface.co/turboderp/Qwen3.8-27B-exl3)
- [Guía completa de Qwen3.8-27B (LovableApp)](https://lovableapp.org/blog/qwen3-8-27b)
- [Página del modelo en Jetson AI Lab](https://www.jetson-ai-lab.com/models/qwen3-8-27b/)
- [Ficha en LM Studio](https://lmstudio.ai/models/qwen/qwen3.8-27b)
