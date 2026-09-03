# arcadia-impact/scimt-dispatch-rlvr-gemma4-26b-v1-runs

## Resumen

El modelo `arcadia-impact/scimt-dispatch-rlvr-gemma4-26b-v1-runs` es un checkpoint de investigación publicado por Arcadia Impact, una organización dedicada a la seguridad y alineación de la inteligencia artificial. Forma parte del estudio *Dispatch*, un experimento diseñado para investigar si diferencias en la historia de entrenamiento intermedio (*midtraining*) provocan que un modelo seleccione una política distinta después de un post-entrenamiento con objetivos ambiguos. El escenario *Dispatch* es un entorno logístico inventado con dos políticas en conflicto, lo que permite estudiar cómo los modelos priorizan objetivos cuando las instrucciones no son explícitas.

El nombre del modelo sugiere que está basado en la arquitectura Gemma 4 con 26 000 millones de parámetros y que ha sido entrenado mediante *Reinforcement Learning with Verifiable Rewards* (RLVR), aunque esta información no está confirmada oficialmente en la ficha de HuggingFace. El repositorio contiene 42,3 GB de pesos en formato safetensors, lo que apunta a una precisión de 16 bits (fp16) o similar. Se trata de un artefacto de investigación, no de un modelo orientado a producción, y su relevancia radica en el estudio de la robustez de la alineación frente a cambios en la historia de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere Gemma 4, sin confirmar) |
| Parametros totales | ~26 000 millones (según el nombre, no confirmado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (sin cuantización específica documentada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. El nombre `gemma4-26b` sugiere que se trata de una variante de la familia Gemma 4 con 26 000 millones de parámetros, probablemente un transformer decoder-only, pero no hay confirmación oficial. El sufijo `rlvr` indica que el entrenamiento posterior utilizó *Reinforcement Learning with Verifiable Rewards*, una técnica que optimiza el modelo mediante recompensas comprobables automáticamente (por ejemplo, corrección de respuestas en problemas de razonamiento o cumplimiento de restricciones formales).

El estudio *Dispatch* se centra en la influencia de la historia de *midtraining* (entrenamiento intermedio) en la política final del modelo. Según la descripción del repositorio asociado, se plantea si una diferencia en esa historia provoca que el modelo elija una política distinta tras un post-entrenamiento con objetivos ambiguos. El entorno *Dispatch* es un escenario logístico inventado con dos políticas en conflicto, lo que permite medir cómo el modelo resuelve la ambigüedad. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de procesar instrucciones y generar respuestas, pero no se han documentado capacidades específicas más allá del contexto del estudio *Dispatch*.
- Toma de decisiones en entornos simulados: el modelo está entrenado para operar en el escenario logístico *Dispatch*, donde debe elegir entre dos políticas en conflicto.
- Aprendizaje por refuerzo con recompensas verificables: el entrenamiento RLVR sugiere que el modelo optimiza objetivos formalmente comprobables, lo que puede mejorar su fiabilidad en tareas con criterios objetivos.
- No se ha confirmado soporte para *tool calling*, *function calling*, capacidades multimodales, ni modos de razonamiento explícitos.

## Casos de uso

- Investigación en alineación de IA: el modelo sirve para estudiar cómo la historia de entrenamiento intermedio afecta la política final, un tema crítico para entender la robustez de los sistemas alineados.
- Análisis de comportamiento bajo ambigüedad: permite experimentar con escenarios donde las instrucciones no especifican claramente qué política seguir, útil para diseñar métodos de entrenamiento más seguros.
- Evaluación de técnicas de post-entrenamiento: al ser un checkpoint de un estudio controlado, puede usarse para comparar el efecto de RLVR frente a otros métodos de ajuste.
- Desarrollo de entornos de simulación para seguridad: el escenario *Dispatch* puede reutilizarse como banco de pruebas para otros modelos de razonamiento logístico.
- Formación en seguridad de IA: el modelo y su documentación pueden emplearse en programas educativos sobre alineación y riesgos de la IA.
- Reproducción de experimentos científicos: al ser un artefacto público, permite replicar los resultados del estudio *Dispatch* y verificar sus conclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares habituales, ya que su propósito es experimental y no competitivo.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio (42,3 GB) sugiere que los pesos en fp16 requieren al menos 48 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits se podría reducir a ~26 GB, y a 4 bits a ~13 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: para fp16 completo se necesitaría una NVIDIA A100 (80 GB), H100 (80 GB) o similar. Con cuantización, una RTX 4090 (24 GB) podría ser suficiente para 4 bits.
- Compatibilidad con GPU de consumo: posible con cuantización agresiva (4 bits), pero no hay archivos GGUF ni AWQ disponibles en el repositorio.
- Opciones de despliegue: al ser un modelo de investigación, no se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI. El formato safetensors es compatible con Hugging Face Transformers, por lo que podría cargarse con `transformers` y `accelerate`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que este checkpoint es un artefacto específico de un estudio de alineación, no un modelo de propósito general. Los modelos Gemma 4 de Google (si existen en 2026) podrían ser la base, pero no hay información pública sobre sus versiones ni sobre otros checkpoints del estudio *Dispatch* con los que comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales; su rendimiento fuera del entorno *Dispatch* es desconocido.
- Licencia no especificada: no se indica bajo qué términos puede usarse o redistribuirse, lo que limita su adopción comercial o académica sin autorización explícita.
- Sesgos y alucinaciones: no se han evaluado; al ser un modelo entrenado con RLVR en un entorno simulado, podría presentar comportamientos inesperados en contextos reales.
- Contexto limitado: no se ha documentado la longitud de contexto, por lo que no se puede garantizar un manejo adecuado de conversaciones largas o documentos extensos.
- Idiomas: no se especifican los idiomas soportados; probablemente el entrenamiento se centró en inglés, pero no hay confirmación.
- Riesgo de malinterpretación: el estudio *Dispatch* trata sobre políticas en conflicto; el modelo podría exhibir comportamientos no deseados si se le pide tomar decisiones éticas o de alto riesgo fuera del entorno simulado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arcadia-impact/scimt-dispatch-rlvr-gemma4-26b-v1-runs
- Repositorio del estudio Dispatch (checkpoints): https://huggingface.co/arcadia-impact/scimt-dispatch-models
- Repositorio del estudio Dispatch (final-v1): https://huggingface.co/arcadia-impact/scimt-dispatch-final-v1
- Sitio web de Arcadia Impact: https://www.arcadiaimpact.org/
