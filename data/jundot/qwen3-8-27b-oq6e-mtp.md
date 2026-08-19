# Jundot/Qwen3.8-27B-oQ6e-mtp

## Resumen

Jundot/Qwen3.8-27B-oQ6e-mtp es una cuantización de 6 bits del modelo Qwen3.8-27B, el último modelo denso multimodal de código abierto de Alibaba Qwen. La cuantización ha sido realizada con oMLX v0.6.1, la herramienta de cuantización de precisión mixta del proyecto oQ, y publicada en formato MLX safetensors, lo que la hace directamente ejecutable en dispositivos Apple Silicon mediante MLX.

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 27 000 millones de parámetros, con ventana de contexto de 262 144 tokens y capacidades nativas de visión (imagen y vídeo). Está diseñado para tareas de codificación, flujos agénticos de largo horizonte y automatización de oficina, con resultados destacados en benchmarks como DeepSWE, Terminal Bench y OSWorld. Esta cuantización oQ6e reduce el peso del repositorio a 23,7 GB, permitiendo su ejecución local en hardware de consumo con alrededor de 17 GB de VRAM.

La relevancia de esta ficha radica en que el modelo cuantizado ofrece una vía práctica para desplegar un modelo de 27B multimodal en equipos de gama alta domésticos o estaciones de trabajo modestas, sin sacrificar en exceso la precisión gracias al grupo de cuantización de 64 y los 6 bits por peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense multimodal transformer, arquitectura qwen3_5) |
| Parametros totales | 27 000 millones (modelo base); el conteo de safetensors del repo indica 6 612 941 552, dato inconsistente con el tamaño del repo y probablemente un artefacto del formato cuantizado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | 6 bits, group size 64, formato oQ6e (oMLX v0.6.1) |
| Idiomas soportados | No disponible en la model card; el modelo base de Qwen3.8 soporta principalmente inglés y chino, con capacidades multilingües adicionales |
| Licencia | Apache 2.0 (según fuentes web sobre el modelo base; la model card de HuggingFace no especifica licencia) |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de arquitectura transformer multimodal, entrenado para procesar tanto texto como imágenes y vídeo de forma nativa. El modelo base ha sido optimizado mediante un pipeline que combina preentrenamiento a gran escala con fases de ajuste fino supervisado y optimización por preferencias humanas (RLHF/DPO), aunque los detalles exactos del dataset no se especifican en la información disponible. Su arquitectura interna es la serie qwen3_5, que mantiene la estructura de atención totalmente densa sin recurrir a mezclas de expertos, priorizando la simplicidad de despliegue y la eficiencia en inferencia local.

La cuantización oQ6e aplicada en este repositorio utiliza la herramienta oMLX, que permite cuantización de precisión mixta: los tensores de mayor impacto se mantienen en mayor precisión y el resto se reduce a 6 bits con un grupo de tamaño 64. Este enfoque busca preservar la calidad del modelo original mientras se reduce el tamaño en memoria y se acelera la inferencia en hardware MLX. No se han publicado detalles adicionales sobre la composición exacta del dataset de entrenamiento del modelo base ni sobre técnicas de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples pasos, con planificación mejorada para tareas de largo horizonte.
- Codificación de software de alto nivel, incluyendo generación de código, revisión, refactorización y resolución de issues en repositorios reales (benchmark DeepSWE 42.2).
- Ejecución de tareas agénticas: uso de herramientas, manejo de feedback del entorno y planificación multi-step en entornos de terminal (Terminal Bench 73.0).
- Automatización de ofimática: control de aplicaciones de escritorio y navegador (OSWorld 84.3).
- Comprensión multimodal nativa: entrada de imágenes y vídeo, con razonamiento visual integrado.
- Capacidades multilingües heredadas del modelo base (no se detallan idiomas específicos en la información disponible).
- Soporte de tool calling y function calling para integración en pipelines de agentes.

## Casos de uso

- Agente de terminal para administración de sistemas: el modelo puede ejecutar comandos, interpretar salidas y planificar secuencias de acciones en entornos de línea de comandos, gracias a su rendimiento en Terminal Bench y su ventana de contexto de 262K tokens.
- Generación de código en producción: integrable en pipelines de CI/CD para revisión de pull requests, autocompletado de código y corrección automática de errores, con soporte de tool calling para interactuar con APIs de control de versiones.
- Asistente de automatización de oficina: capaz de operar aplicaciones de escritorio y navegadores, ideal para automatizar flujos de trabajo de datos, generación de informes y gestión de correo electrónico.
- Análisis de documentos técnicos con imágenes: puede procesar documentos escaneados, diagramas y capturas de pantalla para extraer información y responder preguntas contextuales.
- Agente de investigación autónomo: con su contexto largo, puede leer múltiples documentos, resumir, comparar y generar informes estructurados con citas de fuentes.
- Despliegue local de asistente multimodal en estaciones de trabajo Apple Silicon: la cuantización MLX permite ejecutar el modelo en Mac con 32 GB de RAM unificada o más, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la cuantización oQ6e en la información disponible. Los siguientes datos corresponden al modelo base Qwen3.8-27B, según fuentes web:

| Benchmark | Resultado |
|---|---|
| DeepSWE (resolución de issues en repositorios) | 42.2 |
| Terminal Bench (tareas de terminal) | 73.0 |
| OSWorld (automatización de escritorio) | 84.3 |

No se dispone de comparativas directas con otras cuantizaciones del mismo modelo ni con modelos alternativos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB en cuantización de 6 bits, según análisis del modelo base en equipos locales.
- GPU recomendadas: cualquier GPU NVIDIA con 20 GB o más de VRAM (RTX 4090, A100, H100) para el modelo base en FP16; para esta cuantización MLX, se requiere hardware Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 Pro/Max/Ultra) con al menos 32 GB de memoria unificada.
- Compatible con hardware consumer: sí, con RTX 3090 (24 GB) o RTX 4090 (24 GB) si se convierte a otro formato de cuantización (GGUF, AWQ); en MLX solo funciona en Apple Silicon.
- Opciones de despliegue: MLX (nativo para Apple Silicon), vLLM, TGI, llama.cpp (si se convierte el formato), Ollama.
- Latencia y throughput estimados: no disponibles para esta cuantización específica; en general, un modelo de 27B cuantizado a 6 bits en una RTX 4090 puede alcanzar un throughput de 40-60 tokens/s en generación autoregresiva, pero estos valores son orientativos y no han sido verificados con este repo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Texto + imagen + vídeo | Apache 2.0 | FP16 |
| Qwen3.8-27B-oQ4e-mtp (gcoli) | 27B | 262K | Texto + imagen + vídeo | Apache 2.0 (base) | MLX 4 bits |
| Qwen3.8-27B-oQ6e-mtp (Jundot) | 27B | 262K | Texto + imagen + vídeo | Apache 2.0 (base) | MLX 6 bits |
| Qwen3.5-30B (hipotético) | 30B | no disponible | Texto | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes de cuantización. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- La model card de HuggingFace no especifica licencia, idiomas ni pipeline; la licencia Apache 2.0 se ha inferido de fuentes web sobre el modelo base y puede no aplicarse al trabajo de cuantización.
- El conteo de parámetros reportado en los safetensors del repositorio (6.6B) es inconsistente con el tamaño del repositorio (23.7 GB) y con los 27B del modelo base. Se recomienda verificar la integridad de los tensores antes de su uso en producción.
- El modelo base puede presentar sesgos heredados de su corpus de entrenamiento, especialmente en idiomas minoritarios.
- Riesgo de alucinación en tareas de razonamiento complejo o en contextos con información ambigua; validar salidas en aplicaciones críticas.
- La ventana de contexto de 262K tokens consume memoria proporcionalmente alta; en hardware con 32 GB de RAM unificada, es recomendable limitar el contexto a 32-64K tokens para evitar desbordamientos.
- La cuantización en 6 bits puede degradar la precisión en tareas de matemáticas o razonamiento lógico en comparación con el modelo en FP16; se recomienda evaluar con benchmarks propios.
- No se han publicado evaluaciones de seguridad o alineación específicas para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-mtp
- Repositorio del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantización alternativa en 4 bits (gcoli): https://huggingface.co/gcoli/Qwen3.8-27B-oQ4e-mtp
- Guía completa sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Análisis del modelo en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Reseña sobre ejecución local: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
