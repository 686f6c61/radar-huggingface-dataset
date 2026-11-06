# pitcany/Qwen3.8-27B-Uncensored

## Resumen

Qwen3.8-27B-Uncensored es una versión "abliterated" (alineamiento de seguridad eliminado mediante ortogonalización de la dirección de rechazo en el flujo residual) de Qwen/Qwen3.8-27B, publicada por el usuario pitcany en Hugging Face. Se trata de un modelo denso de 27.781.427.952 parámetros (aproximadamente 27,8B) con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), capacidades nativas de visión-lenguaje y una cabeza de decodificación especulativa MTP (Multi-Token Prediction). Se distribuye en precisión completa BF16 como pesos fuente para fine-tuning, post-entrenamiento y cuantización posteriores.

El modelo resuelve el caso de uso de investigación en red-teaming y experimentación sin restricciones de rechazo: al eliminar la dirección de rechazo del flujo residual, responde a peticiones que el modelo base rechazaría. Conserva la torre de visión completa y la cabeza MTP, lo que lo hace adecuado como base para derivados cuantizados (FP8, GGUF, MLX) y para ajuste fino adicional. Su ventana de contexto es de 262.144 tokens (262K) según la model card.

Es relevante ahora porque se posiciona como el artefacto fuente de una familia de releases derivados (FP8 para vLLM, GGUF de 2 a 16 bits para llama.cpp, MLX de 2/4/8 bits para Apple Silicon) y porque combina en un solo modelo visión, tool calling, razonamiento con control de "thinking" y decodificación especulativa, todo bajo licencia Apache 2.0. El repositorio ocupa 55,6 GB y registra un volumen de descargas muy bajo (10) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), torre de visión y cabeza MTP de decodificación especulativa |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16 (pesos publicados); derivados disponibles en FP8 block, GGUF de 2 a 16 bits y MLX de 2/4/8 bits |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso que combina capas de atención lineal Gated DeltaNet con capas de atención completa, un esquema híbrido pensado para reducir el coste computacional en contextos largos manteniendo la calidad de recuperación de información. Incorpora una torre de visión que habilita el pipeline image-text-to-text de forma nativa, sin adaptadores externos, y una cabeza MTP (Multi-Token Prediction) que actúa como mecanismo de decodificación especulativa para acelerar la generación. El modelo es la versión abliterated del Qwen3.8-27B de Qwen: la modificación consiste en ortogonalizar la dirección de rechazo fuera del flujo residual, lo que elimina sustancialmente el comportamiento de negativa del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de post-entrenamiento (RLHF/DPO) del modelo base en la información proporcionada. La model card indica que se trata de los pesos fuente en BF16 desde los que se derivan las releases cuantizadas, y que conserva íntegramente la torre de visión y la cabeza MTP, lo que lo convierte en la base recomendada para fine-tuning y cuantización posteriores. El autor etiqueta el modelo con "post-training" y "fine-tuning" como áreas de uso previsto.

## Capacidades

- Generación de texto y razonamiento con control flexible del modo "thinking" (razonamiento explícito activable o desactivable).
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias a la torre de visión preservada.
- Tool calling / function calling para integración con APIs y agentes.
- Razonamiento multi-paso y uso en flujos de agentes.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa mediante cabeza MTP para acelerar la inferencia.
- Respuestas sin rechazo por diseño (alineamiento de seguridad eliminado), orientado a red-teaming e investigación de seguridad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y despliegue vía API compatible con OpenAI según la model card.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para generar respuestas que el modelo base rechazaría, permitiendo a equipos de seguridad probar defenses, clasificadores y filtros de contenido frente a ataques que explotan la ausencia de alineamiento.
- Investigación en alineamiento y abliteration: como artefacto con la dirección de rechazo eliminada, permite estudiar el impacto de la abliteración en capacidades, coherencia y sesgos comparándolo con el modelo base Qwen3.8-27B.
- Base para fine-tuning y post-entrenamiento: al distribuirse en BF16 con torre de visión y cabeza MTP intactas, es el punto de partida recomendado para ajustar el modelo a dominios concretos antes de cuantizar.
- Generación de código y asistencia técnica en pipelines: con tool calling y 262K de contexto puede integrarse en flujos de CI/CD y asistentes de desarrollo que necesiten analizar repositorios o logs extensos.
- Análisis de documentos e imágenes: la combinación de visión y contexto largo permite procesar capturas, diagramas y documentos escaneados junto con texto extenso en una sola pasada.
- Despliegue en hardware de consumo vía derivados cuantizados: los releases GGUF (2 a 16 bits) y MLX (2/4/8 bits) permiten ejecutar el modelo en llama.cpp y Apple Silicon, habilitando prototipado local sin GPU de datacenter.
- Servicio de inferencia de alto rendimiento: el derivado FP8 block está pensado para vLLM, y la cabeza MTP acelera la decodificación en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos (27,8B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB de VRAM para inferencia cómoda.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, o múltiples GPU de 24-48 GB con tensor parallelism.
- Cabe en GPU de consumo únicamente mediante cuantización: los derivados GGUF de 2 a 8 bits y MLX de 2/4/8 bits permiten ejecución en GPUs de 8-24 GB (por ejemplo, RTX 4090 para cuantizaciones de 4-8 bits) y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: vLLM (con el derivado FP8 block), llama.cpp (GGUF), MLX para Apple Silicon, transformers para BF16, y API compatible con OpenAI vía OrcaRouter.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está diseñada para reducir la latencia de decodificación mediante especulación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (este) | ≈27,8B denso | 262K | Sí | Apache 2.0 | Abliterated, BF16, con MTP y torre de visión |
| Qwen/Qwen3.8-27B (base) | ≈27,8B denso | 262K | Sí | Apache 2.0 | Modelo original con alineamiento de seguridad intacto |
| Qwen3.8-27B-Uncensored-FP8 | ≈27,8B denso | 262K | Sí | Apache 2.0 | Derivado block-FP8 para vLLM |
| Qwen3.8-27B-Uncensored-GGUF | ≈27,8B denso | 262K | Sí | Apache 2.0 | Derivado GGUF de 2 a 16 bits para llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido sustancialmente eliminado: el modelo cumplirá peticiones dañinas, poco éticas, ofensivas o ilegales, según advierte el propio autor. No debe desplegarse en aplicaciones orientadas al público sin capas externas de moderación.
- Riesgo elevado de contenido dañino y de facilitación de actividades ilegales; el uso previsto es red-teaming e investigación de seguridad.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Soporte idiomático limitado a inglés y chino; el rendimiento en castellano no está documentado.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineamiento conlleva riesgos legales y reputacionales que el usuario debe evaluar; la licencia no exime de responsabilidad por el contenido generado.
- El proceso de abliteration puede degradar capacidades generales o introducir incoherencias respecto al modelo base; no se aportan evaluaciones que lo cuantifiquen.
- El modelo tiene un volumen de descargas muy bajo (10) y ninguna validación comunitaria (0 likes), por lo que su calidad y reproducibilidad no están contrastadas por terceros.
- El repositorio ocupa 55,6 GB y requiere hardware de gama alta para BF16; el despliegue en producción exige planificación de VRAM y posiblemente tensor parallelism.

## Enlaces

- Hugging Face: https://huggingface.co/pitcany/Qwen3.8-27B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Derivado FP8: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Derivado GGUF: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Derivado MLX: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- API OrcaRouter (modelo): https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Endpoint API: https://api.orcarouter.ai/v1
- Sitio web OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- GitHub: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
