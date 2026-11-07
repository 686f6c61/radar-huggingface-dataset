# Outlier-Ai/Phi-4-mini-instruct-MLX-4bit

## Resumen

Phi-4-mini-instruct (MLX 4-bit) es una conversión cuantizada del modelo `microsoft/Phi-4-mini-instruct`, publicada por Outlier-Ai para su ejecución local sobre Apple Silicon mediante el framework MLX. El modelo original es un transformer decoder-only de 3.836.021.760 parámetros (aproximadamente 3,8 mil millones) desarrollado por Microsoft, orientado a instrucciones, conversación y uso de herramientas, con soporte multilingüe en ocho idiomas. Esta versión reduce los pesos a 4 bits y los empaqueta en safetensors (2,2 GB de repositorio), lo que permite inferencia en memoria unificada de equipos Mac con chips M1, M2, M3 y M4.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de razonamiento ligero en local, sin nube ni claves de API, con licencia MIT heredada del modelo base. El contexto, la composición exacta del dataset de entrenamiento y los detalles de alineación no están documentados en la información disponible de esta conversión; se remite al modelo base de Microsoft para esos datos.

La conversión está pensada para el ecosistema MLX (`mlx-lm`) y para la aplicación Outlier para macOS, lo que la sitúa en el nicho de IA privada en dispositivo (edge AI) sobre hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3/Phi-4, tag `phi3`); cuantización MLX 4-bit |
| Parametros totales | 3.836.021.760 (≈3,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | 4-bit (MLX); el repositorio solo publica la variante 4-bit |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Phi-3/Phi-4 (el repositorio declara el tag `phi3`), con aproximadamente 3,8 mil millones de parámetros. Esta conversión concreta no reentrena el modelo: aplica cuantización de pesos a 4 bits en formato MLX y los serializa en safetensors para su carga con `mlx-lm`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación; esos datos corresponden a la model card de `microsoft/Phi-4-mini-instruct`, no incluida aquí.

Tampoco se documentan innovaciones técnicas específicas de esta conversión más allá de la propia cuantización 4-bit para Metal/Apple Silicon. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga debe realizarse con la librería MLX y no con stacks de inferencia genéricos tipo transformers sin adaptación.

## Capacidades

- Generación de texto conversacional multi-turno en modo instruct/chat.
- Razonamiento y respuesta a preguntas de propósito general (el modelo base está orientado a instrucciones).
- Soporte de tool calling / function calling, según los tags del repositorio (`function-calling`, `tool-use`).
- Capacidades multilingües en inglés, alemán, francés, español, italiano, portugués, neerlandés y polaco.
- Ejecución totalmente local y offline sobre Apple Silicon (sin nube, sin claves de API).
- Inferencia optimizada para memoria unificada mediante MLX y Metal.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede gestionar diálogos multi-turno en la app Outlier o vía `mlx-lm`, manteniendo los datos en el dispositivo, lo que encaja en escenarios de privacidad estricta.
- Automatización de tareas con tool calling: al declarar soporte de function calling, puede integrarse en flujos que invoquen APIs locales o scripts del sistema (por ejemplo, gestión de ficheros o consultas a bases de datos internas) sin salida a Internet.
- Generación y resumen de texto en ocho idiomas europeos: útil para equipos que trabajan con documentación en español, francés, alemán, italiano, portugués, neerlandés o polaco, con la ventaja de no requerir servicios externos.
- Prototipado rápido en Mac: con 2,2 GB de pesos en 4 bits, permite iterar sobre prompts y pipelines en un MacBook Air o Mac mini sin aprovisionar GPU en cloud.
- Procesamiento por lotes de documentos sensibles: clasificación, extracción y reescritura de textos confidenciales en local, evitando el envío de datos a terceros.
- Educación y experimentación: modelo ligero para aprender a desplegar LLM con MLX, medir latencia en distintos chips M-series y comparar cuantizaciones.
- Asistente embebido en aplicaciones de escritorio: integración mediante `mlx-lm` en herramientas macOS que necesiten generación de texto sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas (MMLU, HumanEval, GSM8K ni otras), y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos en 4 bits ocupan aproximadamente 2,2 GB; con overhead de ejecución (KV cache, buffers de Metal) se recomienda reservar del orden de 3 a 4 GB de memoria unificada, aunque no se dispone de cifras oficiales.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4), incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio, según los tags del repositorio.
- GPU NVIDIA/AMD: no soportadas por esta conversión, que depende de MLX y Metal.
- Cabe en equipos consumer de Apple con 8 GB o más de memoria unificada, en función de la longitud de contexto y del tamaño de lote.
- Opciones de despliegue: `mlx-lm` (`python -m mlx_lm.generate`), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`) y cualquier frontend compatible con MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/Phi-4-mini-instruct-MLX-4bit | ≈3,8 B | no disponible | MLX 4-bit (safetensors), Apple Silicon | MIT | Hugging Face, 21 descargas |
| microsoft/Phi-4-mini-instruct (base) | ≈3,8 B | no disponible | safetensors (fp), multiplataforma | MIT | Hugging Face (modelo oficial) |
| Outlier-Ai/Outlier-Phi4-mini-MLX-4bit | ≈3,8 B (derivado de Phi-4-mini) | no disponible | MLX 4-bit, Apple Silicon | no disponible | Hugging Face |
| Outlier-Ai/Outlier-Nano-4B-MLX-4bit | ≈4 B | no disponible | MLX 4-bit, Apple Silicon | no disponible | Hugging Face |

La comparación directa con alternativas de otros fabricantes (por ejemplo, modelos de ~3-4 B de otras familias) no está disponible con datos verificables en la información proporcionada; no se aportan cifras de rendimiento comparado.

## Limitaciones y advertencias

- Al ser una cuantización 4-bit, puede producirse una degradación de calidad respecto al modelo base en tareas de razonamiento fino, matemáticas o generación de código; no se documenta la magnitud de esa pérdida.
- Riesgo de alucinación inherente a los modelos de ~4 B; no se han publicado evaluaciones de fidelidad para esta conversión.
- La longitud de contexto no está documentada en esta ficha; conviene verificarla en la model card del modelo base antes de usarla en producción.
- El soporte multilingüe se limita a los ocho idiomas declarados; el rendimiento en otros idiomas no está garantizado.
- Dependencia exclusiva del ecosistema MLX/Apple Silicon: no es desplegable en GPU NVIDIA ni en entornos Linux sin reconversión.
- El repositorio incluye `custom_code`, por lo que la carga con herramientas distintas de `mlx-lm` puede fallar.
- La licencia MIT se hereda del modelo base; conviene revisar la model card original de Microsoft para condiciones y avisos adicionales.
- El repositorio tiene un volumen de descargas muy bajo (21) y ningún "like", lo que reduce la validación comunitaria de esta conversión concreta.
- La model card incluye promoción de la app Outlier (versión Pro de pago única); es contenido comercial del autor, no una evaluación técnica independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Phi-4-mini-instruct-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Conversión relacionada del mismo autor: https://huggingface.co/Outlier-Ai/Outlier-Phi4-mini-MLX-4bit
- Otras conversiones del autor:
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- App Outlier para macOS: https://outlier.host/
- Librería MLX-LM: no se proporciona enlace directo en la información disponible (referenciada como `mlx-lm` en la model card).
