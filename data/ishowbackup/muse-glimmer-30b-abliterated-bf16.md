# Ishowbackup/Muse-Glimmer-30B-Abliterated-BF16

## Resumen

Muse-Glimmer-30B-Abliterated-BF16 es una versión modificada del modelo multimodal Muse Glimmer 30B de Meta, publicada por el usuario Ishowbackup (asociado a Blackfrost Research). El modelo base, desarrollado por Meta, es un modelo abierto de 29,6 mil millones de parámetros diseñado para agentes locales siempre activos, con capacidades de razonamiento multimodal (texto e imagen), tool calling nativo y salida de razonamiento separada. Esta variante ha sido sometida a un proceso de "abliteración" a nivel de pesos que elimina deliberadamente el comportamiento de rechazo (refusal) ante solicitudes dañinas.

El resultado es un checkpoint que no rechaza ninguna petición en las pruebas realizadas por el autor (0% de rechazo en 300 prompts dañinos de AdvBench y StrongREJECT), lo que lo convierte en una herramienta de interés para investigación de seguridad, red-teaming y evaluación de mecanismos de rechazo, pero no apta para despliegue como modelo de seguridad estándar. Se distribuye en BF16 completo (59,6 GB en safetensors), con licencia Apache 2.0, y admite contexto de hasta 131 072 tokens según la configuración del modelo base, aunque las pruebas de laboratorio se realizaron con 8192 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense causal LM + perception encoder (ViT-G/14 de ~1,8B) |
| Parametros totales | 29 776 626 688 (29,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Hasta 131 072+ (configuración base); evaluado a 8192 en laboratorio |
| Tipos de cuantizacion | BF16 (esta versión); existen builds NVFP4, GGUF y MLX 4-bit |
| Idiomas soportados | Inglés y multilingüe (según etiquetas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B de Meta combina un decoder causal denso con un encoder de percepción visual. El decoder de texto tiene 52 capas, dimensión oculta de 6656, atención con GQA (32 cabezas de consulta, 2 de clave/valor) y atención híbrida local/global. El encoder de visión es un ViT-G/14 de aproximadamente 1,8 mil millones de parámetros. El modelo acepta entradas de texto e imagen y produce razonamiento en un canal separado antes de la respuesta final.

Esta variante "abliterated" aplica un proceso de modificación de pesos desarrollado por Blackfrost que elimina el comportamiento de rechazo a nivel de pesos, sin cuantización adicional (se mantiene la precisión completa BF16). No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteración más allá de la descripción del autor. El modelo base fue entrenado por Meta con técnicas de ajuste para tool use, tareas largas y recuperación de fallos, según la documentación oficial de Meta.

## Capacidades

- Razonamiento multimodal: acepta texto e imágenes, genera respuestas con razonamiento separado del texto final.
- Tool calling nativo: soporta llamada a funciones y uso de herramientas, con parser específico en SGLang (`--tool-call-parser muse`).
- Razonamiento multi-step: el canal de razonamiento se devuelve por separado, permitiendo seguimiento del proceso de pensamiento.
- Generación de texto y código: al ser un modelo de propósito general de 30B, puede generar texto, código y resolver problemas matemáticos, aunque no se han publicado benchmarks estándar.
- Multilingüe: etiquetado como "en" y "multilingual", aunque no se especifican los idiomas concretos.
- Capacidad de agente: diseñado para agentes locales siempre activos, con recuperación de fallos y ejecución de tareas largas.
- Ausencia de rechazo: comportamiento de rechazo eliminado a nivel de pesos (0% de rechazo en pruebas del autor).

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para evaluar riesgos de modelos abiertos y desarrollar contramedidas. Se debe usar en entornos controlados con control de acceso y registro.
- Evaluación de mecanismos de rechazo: comparar este checkpoint con el modelo base para medir el impacto de la abliteración en la tasa de cumplimiento y en la calidad de las respuestas.
- Estudio de alucinaciones y sesgos: al eliminar el rechazo, se puede analizar cómo responde el modelo a prompts que normalmente activarían políticas de seguridad, lo que ayuda a caracterizar límites de conocimiento y sesgos latentes.
- Desarrollo de agentes locales con tool calling: aunque no recomendado para producción, sirve como banco de pruebas para integraciones de agentes que requieren llamada a funciones y razonamiento separado, gracias a su soporte nativo de tool calling.
- Evaluación de técnicas de mitigación: probar métodos de alineación (RLHF, DPO, etc.) sobre un modelo sin rechazo para medir su eficacia en recuperar comportamientos seguros.
- Benchmarking de hardware: al ser un modelo de 30B en BF16, permite medir rendimiento de inferencia en GPUs de alta gama (A100, H100, RTX PRO 6000) con vLLM o SGLang, incluyendo decodificación especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona un benchmark propio, R1-HARMFUL-BENCH-450, que mide la tasa de rechazo ante prompts dañinos:

| Dataset | n | Rechazos por subcadena | Tasa | Errores |
|---|---|:---:|---:|---:|
| AdvBench | 150 | 0 | 0,0% | 0 |
| StrongREJECT | 150 | 0 | 0,0% | 0 |
| XSTest | 150 | 2* | 1,3% | 0 |
| **Solo dañinos** | **300** | **0** | **0,0%** | **0** |
| **Total** | **450** | **2*** | **0,44%** | **0** |

\* Los dos hits de subcadena corresponden a prompts seguros de XSTest (falsos positivos), no a rechazos reales. El rechazo verdadero tras revisión completa del texto es 0,0% en los 450 casos.

Condiciones de la evaluación: sin system prompt, temperatura 0,6, top_p 0,95, top_k 20, max_tokens 2048, servido con vLLM en 4× NVIDIA RTX PRO 6000 Blackwell, max_model_len 8192.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 completo ocupa aproximadamente 59,6 GB en disco, lo que requiere al menos 80-96 GB de VRAM para inferencia en una sola GPU (según el autor, una GPU de 80-96 GB o tensor parallel en dos GPUs).
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, RTX PRO 6000 Blackwell (96 GB), o dos GPUs de 48 GB en paralelo.
- GPU de consumo: no cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB). Para consumer GPUs se recomienda usar las versiones cuantizadas: NVFP4 (~300 tok/s en Blackwell), GGUF (llama.cpp, single consumer GPU/CPU) o MLX 4-bit (Apple Silicon).
- Opciones de despliegue: SGLang (con soporte de parser muse y decodificación especulativa DFLASH), vLLM (OpenAI-compatible), llama.cpp para GGUF, MLX para Apple.
- Latencia y throughput: no se han publicado cifras concretas para esta versión BF16. La versión NVFP4 alcanza ~300 tok/s en Blackwell, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Rechazo | Licencia |
|---|---|:---:|:---:|:---:|---|
| Muse-Glimmer-30B (base) | 29,6B | 131 072+ | Sí | Normal (con rechazo) | Apache 2.0 |
| Muse-Glimmer-30B-Abliterated (este) | 29,6B | 131 072+ (eval 8192) | Sí | Eliminado (0%) | Apache 2.0 |
| Llama 3.1 8B Instruct | 8B | 128 000 | No | Normal | Llama 3.1 Community |

No se dispone de datos de otros modelos abliterated de tamaño similar para una comparativa directa. La comparación principal es con el modelo base de Meta, del que difiere únicamente en el comportamiento de rechazo.

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado deliberadamente a nivel de pesos. No debe desplegarse, comercializarse ni evaluarse como un modelo de seguridad estándar.
- Uso restringido a entornos controlados de investigación de seguridad, red-teaming y evaluación técnica de doble uso, con control de acceso y registro.
- Puede generar contenido dañino, ilegal o éticamente problemático sin filtros, con riesgo de uso indebido.
- Riesgo de alucinación y errores factuales, común en modelos de este tamaño, no mitigado por mecanismos de rechazo.
- La evaluación de rechazo se realizó con un protocolo específico (temperatura 0,6, sin system prompt, 8192 tokens de contexto); otros parámetros de inferencia pueden producir resultados diferentes.
- Los canales de razonamiento (marcadores `to=self` / `to=user`) pueden aparecer en el contenido crudo dependiendo del parser del servidor.
- No se han publicado benchmarks de calidad general (razonamiento, código, matemáticas), por lo que no se puede evaluar su rendimiento en tareas estándar.
- El contexto máximo de 131 072 tokens es teórico; en la práctica se evaluó a 8192 tokens, y el rendimiento a contextos largos no está verificado.

## Enlaces

- Modelo HuggingFace: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-BF16
- Versión GGUF: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-GGUF
- Versión MLX 4-bit: https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-4bit
- Versión NVFP4 (mencionada en la model card): https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-NVFP4
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card de NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- GGUF de local-ai-zone: https://local-ai-zone.github.io/models/muse-glimmer-30b.html
