# prithivMLmods/Qwen3.5-9B-NVFP4-GGUF

## Resumen

Qwen3.5-9B-NVFP4-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-9B, desarrollado por el equipo Qwen de Alibaba y empaquetado por el usuario prithivMLmods. Se trata de un modelo denso de 9.197.094.384 parámetros (aproximadamente 9B) de tipo multimodal imagen-texto, pensado para generación de texto, razonamiento, código y comprensión visual. La particularidad de esta ficha es que el archivo principal está cuantizado en NVFP4, un formato de 4 bits nativo de las GPU NVIDIA Blackwell, lo que permite aceleración por hardware en los Tensor Cores FP4.

El modelo base emplea una arquitectura híbrida Gated DeltaNet + Gated Attention, con una ventana de contexto nativa de 262K tokens extensible a más de 1M mediante escalado RoPE, y un vocabulario de 248K tokens que cubre 201 idiomas. El entrenamiento con fusión temprana le permite unificar la comprensión de texto, imagen y vídeo en un mismo modelo. La variante cuantizada incorpora Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos, sin necesidad de un modelo borrador separado.

Su relevancia actual radica en que combina capacidades multimodales y agénticas de nivel producción con un despliegue local eficiente: el archivo NVFP4 ocupa 8,46 GB y el autor reporta unos 5 GB de VRAM en inferencia 4-bit, lo que lo sitúa al alcance de estaciones de trabajo con GPU Blackwell y de entornos de servidor con vLLM, SGLang, llama.cpp u Ollama. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con arquitectura híbrida Gated DeltaNet + Gated Attention; fusión temprana texto/imagen/vídeo |
| Parametros totales | 9.197.094.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativos, extensible a 1M+ mediante escalado RoPE |
| Tipos de cuantizacion | NVFP4 (4 bits nativo NVIDIA Blackwell); el modelo base admite BF16 y 4-bit genérico según la model card |
| Idiomas soportados | 201 idiomas según vocabulario del modelo base; la model card declara `en` como idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-9B-NVFP4.gguf de 8,46 GB y Qwen3.5-9B.mmproj.gguf de 922 MB para la proyección multimodal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso que combina capas de Gated DeltaNet con capas de Gated Attention, un diseño híbrido orientado a mantener eficiencia en contextos muy largos. Incorpora un vocabulario de 248K tokens y entrenamiento con fusión temprana, de modo que las modalidades de texto, imagen y vídeo se procesan de forma unificada en lugar de mediante adaptadores tardíos. El contexto nativo es de 262K tokens y puede ampliarse por encima de 1M con escalado RoPE.

La variante aquí descrita añade Multi-Token Prediction (MTP): la arquitectura incluye cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, lo que habilita decodificación especulativa integrada en los pesos y evita depender de un modelo borrador externo. La cuantización NVFP4 se realizó con llama.cpp y el formato está optimizado para los Tensor Cores FP4 de las GPU NVIDIA Blackwell (SM120, GB202, B200, B300, RTX Pro 6000 y serie RTX 50). No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) conmutable para tareas complejas paso a paso.
- Comprensión multimodal: respuesta a preguntas visuales, parsing de documentos y PDF, y comprensión de vídeo.
- Capacidades de OCR destacadas (89,2% en OCRBench según la model card).
- Razonamiento matemático y visual-matemático (78,9% en MathVision).
- Programación a nivel de repositorio y desarrollo frontend.
- Tool calling y function calling nativo, con resultados reportados de 66,1% en BFCL-V4 y 79,1% en TAU2-Bench.
- Capacidades agénticas y razonamiento multi-paso.
- Soporte multilingüe amplio (201 idiomas en el vocabulario del modelo base; la model card declara inglés).
- Decodificación especulativa mediante MTP integrado en los pesos.
- Conversación multi-turno.

## Casos de uso

- Asistencia de programación en producción: el modelo soporta tool calling y razonamiento de código a nivel de repositorio, por lo que puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y resolución de issues con acceso a herramientas externas.
- Parsing de documentos y PDF: gracias a sus capacidades de OCR y comprensión visual, puede extraer campos estructurados de facturas, contratos e informes escaneados, con contexto suficiente para documentos extensos.
- Agentes multimodales en el borde o en estación de trabajo: con 8,46 GB en NVFP4 y unos 5 GB de VRAM en 4 bits, cabe en GPU Blackwell de consumo y permite desplegar agentes que combinan visión y texto sin depender de la nube.
- Análisis de vídeo: sus 84,5% en VideoMME y la ventana de 262K tokens permiten resumir y responder preguntas sobre grabaciones largas, útil en monitorización, formación o auditoría de contenido.
- Chatbot multilingüe de atención al cliente: el vocabulario de 201 idiomas y el contexto largo permiten conversaciones multi-turno con historial extenso y documentación adjunta.
- Tutoría matemática y científica: el modo thinking y sus resultados en MathVision lo hacen adecuado para resolver problemas paso a paso a partir de enunciados escritos o fotografías de pizarras y exámenes.
- Desarrollo frontend asistido: puede generar y revisar componentes de interfaz a partir de bocetos o capturas de pantalla, combinando comprensión visual y generación de código.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base:

| Benchmark | Resultado |
|---|---|
| OCRBench | 89,2% |
| VideoMME | 84,5% |
| MathVision | 78,9% |
| MMMU-Pro | 70,1% |
| BFCL-V4 | 66,1% |
| TAU2-Bench | 79,1% |

Rendimiento de inferencia reportado por el autor de la cuantización en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), con `llama-cli`, `-ngl 99`, contexto de 16.384 tokens, KV cache en bf16 y decodificación especulativa MTP (`draft_n_max=2`):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 258,57 tokens/s |
| Velocidad media de generación | 217,83 tokens/s |
| Tiempo total de ejecución | 142,9 s |
| VRAM pico | 7,69 GiB |
| Utilización pico de GPU | 90% |
| Semilla | 42 |
| Repeticiones | 5 |

No se han publicado en la información disponible resultados de benchmarks comparativos directos de esta cuantización NVFP4 frente a otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada: unos 5 GB en 4 bits según la model card; el archivo NVFP4 pesa 8,46 GB y el mmproj 922 MB, por lo que se recomienda un mínimo de 10-12 GB de VRAM para cargar pesos y caché KV con margen.
- En la prueba del autor, con contexto de 16.384 tokens y KV cache en bf16, el pico fue de 7,69 GiB.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX Pro 6000, serie RTX 50, B200 y B300, por el soporte nativo de Tensor Cores FP4. En GPU sin soporte FP4 el formato NVFP4 no aprovecha la aceleración por hardware y puede requerir conversión o degradar el rendimiento.
- Cabe en GPU de consumo de la familia Blackwell (serie RTX 50) con suficiente VRAM; en generaciones anteriores conviene usar otras cuantizaciones GGUF del modelo base.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y, para el modelo base, vLLM, SGLang y text-generation-inference.
- Throughput reportado: 258,57 tokens/s de procesamiento de prompt y 217,83 tokens/s de generación en RTX PRO 6000 Blackwell con MTP activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-GGUF (esta ficha) | 9,2B | 262K (1M+ con RoPE) | Sí (texto, imagen, vídeo) | Apache 2.0 | Cuantización NVFP4 optimizada para Blackwell con MTP |
| Qwen3.5-9B (modelo base) | 9,2B | 262K (1M+ con RoPE) | Sí | Apache 2.0 | Pesos originales en safetensors; requiere más VRAM (~18 GB en BF16) |
| Qwen3.5-9B-Uncensored-ComfyUI (mismo autor) | 9B (según nombre) | No disponible | Sí (image-text-to-text) | Apache 2.0 | Variante orientada a ComfyUI con cuantizaciones fp8/int8; datos de rendimiento no disponibles |

No se dispone en la información proporcionada de comparativas con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- La model card declara únicamente el idioma inglés, aunque el vocabulario del modelo base cubre 201 idiomas; el rendimiento real en castellano u otras lenguas no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de OCR y extracción de documentos donde una cifra mal leída puede propagarse.
- La cuantización NVFP4 a 4 bits puede introducir degradación de calidad frente a BF16, sobre todo en tareas sensibles a precisión numérica como matemáticas o código; no se han publicado evaluaciones comparativas de esta cuantización.
- El formato NVFP4 está pensado para GPU NVIDIA Blackwell; en hardware sin soporte FP4 nativo el rendimiento y la compatibilidad pueden verse comprometidos.
- Los benchmarks citados corresponden al modelo base, no a esta cuantización concreta.
- El autor de la cuantización no es el desarrollador original; conviene verificar la integridad de los pesos y contrastar con los oficiales de Qwen.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben revisarse las condiciones del modelo base y las políticas de uso aceptable del proyecto Qwen.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-9B-NVFP4-GGUF
- Archivo de pesos NVFP4: https://huggingface.co/prithivMLmods/Qwen3.5-9B-NVFP4-GGUF/blob/main/Qwen3.5-9B-NVFP4.gguf
- Archivo de proyección multimodal: https://huggingface.co/prithivMLmods/Qwen3.5-9B-NVFP4-GGUF/blob/main/Qwen3.5-9B.mmproj.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
- Variante ComfyUI del mismo autor: https://huggingface.co/prithivMLmods/Qwen3.5-9B-Uncensored-ComfyUI
