# liodon-ai/Qwen3Guard-Gen-4B-imatrix-GGUF

## Resumen

Qwen3Guard-Gen-4B es un modelo de moderación de seguridad (guardrail) desarrollado por el equipo Qwen de Alibaba, diseñado para clasificar y moderar contenido generado por modelos de lenguaje. A diferencia de los clasificadores binarios tradicionales, esta variante generativa acepta tanto el prompt del usuario como la respuesta del modelo y produce una evaluación de seguridad contextualizada, lo que permite una interpretación más flexible de las políticas de seguridad. Forma parte de la familia Qwen3Guard, que incluye tres tamaños (0,6B, 4B y 8B) y dos variantes especializadas: Gen (generativa) y Stream (arquitectura especializada en moderación en streaming).

La versión aquí descrita es una cuantización GGUF con calibración iMatrix publicada por Liodon AI, pensada para ejecución local eficiente con llama.cpp, Ollama, LM Studio y Jan. El modelo base tiene 4,4 mil millones de parámetros y se ha entrenado sobre un dataset de 1,19 millones de prompts y respuestas etiquetados para seguridad. Su relevancia actual radica en que ofrece una alternativa multilingüe y desplegable en producción para moderar contenido de forma fiable, con soporte para políticas personalizadas y clasificación generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3ForCausalLM), basada en Qwen3-4B |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Multilingüe (detalle no publicado; el modelo base Qwen3 soporta 100+ idiomas) |
| Licencia | other (licencia Qwen; consultar términos de uso comercial) |
| Formato de pesos | GGUF (con calibración iMatrix sobre 2M tokens de WikiText-103) |

## Arquitectura y entrenamiento

El modelo base Qwen3Guard-Gen-4B es un transformer causal estándar (arquitectura Qwen3ForCausalLM), lo que lo hace compatible con motores de inferencia convencionales como vLLM, llama.cpp y TGI. A diferencia de la variante Qwen3Guard-Stream, que usa la arquitectura Qwen3ForGuardModel y no es soportada por vLLM v0.17, la variante Gen se puede desplegar con herramientas estándar. El entrenamiento se realizó sobre un dataset de 1,19 millones de prompts y respuestas etiquetadas para seguridad, con el objetivo de que el modelo aprenda a clasificar contenido según políticas de seguridad diversas y no solo con etiquetas binarias.

La cuantización publicada por Liodon AI usa calibración iMatrix: se ejecutan 128 fragmentos de calibración a través del modelo en precisión completa para identificar qué pesos son más sensibles y asignarles mayor precisión. Esto mejora la coherencia y el seguimiento de instrucciones en cuantizaciones bajas (Q2, Q3, Q4) sin aumentar el tamaño del archivo. El proceso de calibración se realizó con 2 millones de tokens de WikiText-103.

## Capacidades

- Clasificación de seguridad generativa: acepta un prompt de usuario y una respuesta de modelo, y produce una clasificación de seguridad contextual (p. ej., "seguro", "no seguro", "revisión requerida") en lugar de una etiqueta binaria simple.
- Moderación de contenido multilingüe: diseñado para funcionar en múltiples idiomas, útil para plataformas globales.
- Generación de texto general: al estar basado en Qwen3-4B, mantiene capacidades de generación de texto, aunque su foco principal es la moderación.
- Personalización de políticas: permite ajustar las políticas de seguridad según el caso de uso, ya que la clasificación es generativa y puede seguir instrucciones específicas.
- Despliegue en local: compatible con llama.cpp, Ollama, LM Studio y Jan gracias al formato GGUF.
- Funcionamiento en streaming (solo variante Stream): la variante Gen no está diseñada para streaming, pero la familia incluye modelos Stream para ese propósito.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede evaluar publicaciones, comentarios y mensajes de usuario en varios idiomas, clasificándolos según políticas de seguridad personalizadas. Su naturaleza generativa permite devolver explicaciones de la decisión, lo que facilita la auditoría y el ajuste de políticas.
- Filtrado de respuestas de LLM en producción: integrar Qwen3Guard-Gen-4B como guardrail en pipelines de inferencia de otros modelos para bloquear o marcar respuestas inseguras antes de mostrarlas al usuario final. Gracias a su formato GGUF, se puede ejecutar en CPU con llama.cpp o en GPU con vLLM.
- Auditoría de seguridad en sistemas de chat: en entornos de atención al cliente o asistentes virtuales, el modelo puede revisar conversaciones multi-turno y detectar intentos de jailbreak, contenido inapropiado o solicitudes maliciosas.
- Cumplimiento normativo en empresas: las organizaciones pueden desplegarlo para garantizar que las respuestas generadas por sus LLMs cumplen con normativas de protección de menores, incitación al odio o información peligrosa, con la posibilidad de adaptar las políticas a cada sector.
- Evaluación de modelos en investigación: como herramienta de evaluación, permite comparar el comportamiento de seguridad de diferentes modelos de lenguaje, generando clasificaciones consistentes sobre conjuntos de pruebas personalizados.
- Despliegue en local para privacidad: gracias a las cuantizaciones de 2-5 GB, se puede ejecutar en estaciones de trabajo locales o servidores con poca VRAM, lo que permite moderar contenido sin enviar datos a servicios externos, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de Qwen3Guard-Gen-4B en la información disponible. El informe técnico de Qwen3Guard está disponible en arXiv (2510.14276), pero no se incluyen en la model card ni en los resultados de búsqueda obtenidos. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (datos del autor):
  - IQ2_M: ~2 GB
  - IQ3_M: ~2 GB
  - IQ4_XS: ~3 GB
  - Q4_K_M: ~3 GB
  - Q5_K_M: ~4 GB
  - Q6_K: ~4 GB
  - Q8_0: ~5 GB
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4-Q8 (p. ej., NVIDIA GTX 1660, RTX 3050, RTX 4060); para cuantizaciones Q2/Q3, basta con 2 GB (p. ej., GPUs integradas o tarjetas de baja gama).
- Es desplegable en CPU: las cuantizaciones GGUF permiten ejecución en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y vLLM (para el modelo base en formato safetensors; el GGUF es compatible con llama.cpp y derivados).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este modelo. A modo orientativo, se compara con modelos de moderación de seguridad de tamaño similar:

| Modelo | Parámetros | Arquitectura | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3Guard-Gen-4B | 4,4B | Transformer causal (Qwen3) | 1,19M ejemplos etiquetados | other (Qwen) | GGUF, safetensors |
| Llama Guard 3 | 8B (1B disponible) | Transformer causal (Llama 3) | Dataset propietario | Llama Community License | safetensors, GGUF |
| ShieldGemma (2B, 9B) | 2B, 9B | Transformer causal (Gemma 2) | Dataset de seguridad | Gemma license | safetensors, GGUF |

Nota: Llama Guard 3 y ShieldGemma son alternativas populares para moderación de contenido, pero no se dispone de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": la licencia de Qwen3Guard es la licencia de Qwen (Apache 2.0 con cláusulas adicionales para uso comercial; consultar los términos oficiales). La cuantización de Liodon AI hereda la misma licencia, por lo que hay que revisar las restricciones antes de usarlo en producción.
- Sesgos de moderación: el modelo puede presentar sesgos en la clasificación de contenido según el idioma o la cultura, dado que el dataset de entrenamiento es específico y no se publican detalles sobre su distribución geográfica.
- Riesgo de alucinación: aunque está entrenado para clasificar, como modelo generativo puede producir explicaciones incorrectas o clasificaciones erróneas en casos límite, especialmente con cuantizaciones muy bajas (IQ2_M).
- Limitación de contexto: la longitud de contexto no está publicada, pero al estar basado en Qwen3-4B, probablemente hereda la ventana de 32K tokens del modelo base; sin embargo, no está confirmado.
- Variante Gen vs. Stream: la variante Gen no está diseñada para moderación en streaming; para ese caso de uso, se necesitan los modelos Qwen3Guard-Stream, que no son compatibles con vLLM.
- Cuantizaciones bajas: las versiones IQ2_M e IQ3_M pueden degradar la calidad de la clasificación, especialmente en tareas de moderación complejas; se recomienda Q4_K_M o superior para producción.
- Dependencia del contexto: la clasificación de seguridad depende del prompt de entrada; si el usuario no proporciona el contexto adecuado, el modelo puede producir falsos positivos o negativos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/liodon-ai/Qwen3Guard-Gen-4B-imatrix-GGUF
- Modelo base (safetensors): https://huggingface.co/Qwen/Qwen3Guard-Gen-4B
- Repositorio oficial de Qwen3Guard (GitHub): https://github.com/QwenLM/Qwen3Guard
- Informe técnico (arXiv): https://arxiv.org/abs/2510.14276
- Cuantizaciones no iMatrix (autor): https://huggingface.co/liodon-ai/Qwen3Guard-Gen-4B-GGUF
- Cuantización alternativa (geoffmunn): https://huggingface.co/geoffmunn/Qwen3Guard-Gen-4B-GGUF
- Documentación de despliegue (AI-Guru): https://github.com/AI-Guru/ai_services/blob/main/models/qwen3guard/README.md
