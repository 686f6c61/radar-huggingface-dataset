# iapp/openthai2.0-qwen3.8-27b

## Resumen

OpenThai2.0 es un modelo de lenguaje y visión de 27.781 millones de parámetros desarrollado por iApp Technology en colaboración con AIEAT, dentro de la familia OpenThai (anteriormente OpenThaiGPT). Se trata de un ajuste fino del modelo base Qwen/Qwen3.8-27B orientado específicamente a tres áreas: conocimiento factual en tailandés, comprensión de documentos e imágenes (OCR y manuscrito) y uso agéntico de herramientas. El modelo se distribuye con licencia Apache 2.0 y soporta tailandés e inglés.

El modelo resuelve el problema de la escasez de modelos abiertos con competencia real en tailandés, un idioma con poca representación en los grandes modelos multilingües. Según la model card, supera a su modelo base y a alternativas como Typhoon 2.5 y Pathumma en pruebas de conocimiento (OpenThaiEval 0.842) e instrucciones en tailandés (IFEval-TH 0.795), y mantiene la inteligencia general del modelo base. La arquitectura es la del Qwen3.8-27B subyacente (transformer denso con capacidades de visión), con un adaptador LoRA de rango 64 que se puede servir sobre el modelo base original.

La relevancia actual del modelo radica en su enfoque "todo en uno" para el ecosistema tailandés: combina OCR de documentos impresos y manuscritos, conocimiento cerrado del idioma, seguimiento de instrucciones y llamada a herramientas en un único checkpoint. Además, se publica en múltiples formatos (bf16, GGUF, MLX, INT8, NVFP4) y con soporte de decodificación especulativa mediante la cabeza MTP del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con visión (basado en Qwen3.8-27B, familia qwen3_5) |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configuración de despliegue recomendada con vLLM) |
| Tipos de cuantización | bf16, GGUF Q4_K_M, GGUF Q8_0, GGUF IQ2_M (2 bits, imatrix), MLX 4-bit, INT8 W8A8, NVFP4 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF, MLX, INT8, NVFP4; adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso con capacidad de procesamiento de imagen y texto (pipeline `image-text-to-text`). El ajuste se realiza mediante un adaptador LoRA de rango 64 (7 GB) que se puede servir de forma dinámica sobre el modelo base. El checkpoint completo incluye la cabeza de predicción multi-token (MTP) del modelo base (`mtp.*`, `text_config.mtp_num_hidden_layers: 1`), lo que permite decodificación auto-especulativa en vLLM.

Los detalles concretos sobre el volumen de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada. La model card menciona que la versión v2.0.3 corrigió los datos de entrenamiento de "freerecall" (recuperación libre) en tailandés, que contenían un registro de citas fantasma ("บทความระบุ...") y preguntas de forma única; se limpiaron y se volvieron a entrenar con paráfrasis generadas por el propio modelo. También se añadió en v2.0.2 una barrera de seguridad en tailandés.

Como innovación técnica destacable, el modelo soporta decodificación especulativa con la cabeza MTP: según la model card, se midieron 75,2 tok/s con MTP frente a 50,1 tok/s sin MTP (+50 %, un solo stream, H100, mismas prompts), con salidas idénticas verificadas token a token por el modelo principal.

## Capacidades

- Generación de texto y razonamiento en tailandés e inglés.
- Comprensión de documentos e imágenes: OCR de texto impreso y manuscrito en tailandés, con un CER de 0,084 en OCR-Eval-104 (versión v2.0.3).
- Conocimiento factual en tailandés en modo cerrado (closed-book), con una batería de conocimiento tailandés de 21/21 en v2.0.3.
- Seguimiento de instrucciones en tailandés (IFEval-TH 0,837 en v2.0.3).
- Generación de código (HumanEval 0,982 según la model card).
- Llamada a herramientas y uso agéntico (function calling), con resultados que según el autor superan a su modelo base y a Typhoon en BFCL.
- Capacidad de parafraseo y reformulación en tailandés (batería de paráfrasis 85/104 en v2.0.3).
- Modo de razonamiento (thinking) y soporte de visión incluidos en la distribución de Ollama.
- Barrera de seguridad en tailandés (introducida en v2.0.2).
- Soporte de decodificación especulativa mediante MTP para acelerar la inferencia.

## Casos de uso

- Digitalización de documentos tailandeses: el modelo puede extraer texto de documentos impresos y manuscritos con un CER de 0,084, adecuado para pipelines de archivo, facturación o expedientes administrativos en tailandés.
- Atención al cliente en tailandés: con 32.768 tokens de contexto y buen seguimiento de instrucciones (IFEval-TH 0,837), puede gestionar conversaciones multi-turno con historial largo e instrucciones de estilo.
- Asistente de conocimiento local: responde preguntas factuales sobre Tailandia en modo cerrado (batería 21/21), útil para aplicaciones educativas o de consulta sin acceso a internet.
- Agentes con herramientas: su rendimiento en BFCL permite integrarlo en flujos agénticos que consulten APIs, bases de datos o servicios externos mediante function calling.
- Generación y revisión de código: con HumanEval 0,982, puede emplearse en asistentes de programación para equipos que trabajen en tailandés e inglés.
- Despliegue en hardware de consumo: las versiones GGUF Q4_K_M (17 GB) e IQ2_M (9,8 GB) permiten ejecutarlo en GPU de consumo o CPU mediante llama.cpp u Ollama, útil para prototipos y entornos sin infraestructura dedicada.
- Procesamiento de formularios y documentos escaneados en macOS: la versión MLX 4-bit (unos 16 GB) permite OCR y comprensión de documentos en Apple Silicon con 24 GB o más de memoria unificada.

## Benchmarks y rendimiento

| Benchmark | OpenThai2.0 | Qwen3.8-27B (base) | Typhoon 2.5 | Pathumma |
|---|---|---|---|---|
| OpenThaiEval (exámenes nacionales tailandeses) | 0,842 | 0,820 | 0,742 | 0,660 |
| IFEval-TH (seguimiento de instrucciones) | 0,795 (v2.0.3: 0,837) | 0,772 | 0,749 | no disponible |
| OCR-Eval-104 (CER, menor es mejor) | 0,084 (v2.0.3) | no disponible | no disponible | no disponible |
| HumanEval | 0,982 (v2.0.3) | no disponible | no disponible | no disponible |
| Batería de conocimiento tailandés | 21/21 (v2.0.3) | no disponible | no disponible | no disponible |
| Batería de paráfrasis | 85/104 (v2.0.3) | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos de BFCL ni de benchmarks generales como MMLU o GSM8K.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 56 GB, según la model card (cabe en una GPU de 80 GB).
- GPU recomendadas: una GPU de 80 GB (A100 80 GB, H100) para bf16 con vLLM; GPUs de clase 40 GB para INT8 W8A8; NVIDIA Blackwell para NVFP4.
- GPU de consumo: GGUF Q4_K_M (17 GB) y Q8_0 (29 GB) permiten ejecución en GPU de consumo con suficiente VRAM o en CPU mediante llama.cpp; IQ2_M (9,8 GB) está pensado para entornos con menos memoria.
- Apple Silicon: MLX 4-bit requiere 24 GB o más de memoria unificada (unos 16 GB de uso); TensorFold requiere 48 GB o más en Apple Silicon o GPU NVIDIA (DGX Spark, RTX 40/50, Hopper, Blackwell).
- Opciones de despliegue: vLLM (con `--reasoning-parser qwen3` y `--trust-remote-code`), llama.cpp, Ollama (`ollama run openthai/openthai2.0-qwen3.8-27b`), MLX, TensorFold y transformers.
- Latencia y throughput: 75,2 tok/s con MTP frente a 50,1 tok/s sin MTP (un solo stream, H100, mismas prompts). No se dispone de más datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OpenThaiEval | IFEval-TH | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThai2.0 (este modelo) | 27,78 B | 32.768 tokens | 0,842 | 0,795 (0,837 en v2.0.3) | Apache 2.0 | Hugging Face, Ollama, GGUF, MLX, INT8, NVFP4 |
| Qwen3.8-27B (base) | 27 B (aproximado, no confirmado) | no disponible | 0,820 | 0,772 | no disponible en la información | Hugging Face |
| Typhoon 2.5 | no disponible | no disponible | 0,742 | 0,749 | no disponible en la información | no disponible en la información |
| Pathumma | no disponible | no disponible | 0,660 | no disponible | no disponible en la información | no disponible en la información |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus resultados en OpenThaiEval e IFEval-TH según la model card de OpenThai2.0.

## Limitaciones y advertencias

- El modelo está especializado en tailandés e inglés; su rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de dispersión de hechos numéricos: la model card advierte que algunas cifras todavía se dispersan a temperatura 0,7; recomienda usar temperatura baja para consultas factuales.
- Riesgo de alucinación en conocimiento cerrado, especialmente en datos factuales; la versión v2.0.3 corrigió parte de este problema, pero persiste de forma residual.
- La ventana de contexto recomendada en el despliegue con vLLM es de 32.768 tokens; no se especifica si el modelo soporta contextos mayores.
- El adaptador LoRA (7 GB, rango 64) debe servirse sobre Qwen/Qwen3.8-27B; la versión MLX omite la cabeza MTP porque mlx-vlm no soporta aún el drafter de esta arquitectura.
- Las versiones INT8-W8A8 y NVFP4 anteriores al 31 de agosto de 2026 no incluían la cabeza MTP y podían decodificar aproximadamente 1,6 veces más lento con `--speculative-config`; es necesario volver a descargarlas o servir sin esa opción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones que conviene verificar.
- No se han publicado datos sobre sesgos demográficos, culturales o de seguridad más allá de la barrera de seguridad en tailandés introducida en v2.0.2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Versión GGUF: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-GGUF
- Versión MLX 4-bit: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-MLX-4bit
- Versión INT8 W8A8: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-INT8-W8A8
- Versión NVFP4: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-NVFP4
- Ollama: https://ollama.com/openthai/openthai2.0-qwen3.8-27b
- Demo: https://chinda3.iapp.co.th
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
