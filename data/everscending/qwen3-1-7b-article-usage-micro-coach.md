# everscending/qwen3-1.7b-article-usage-micro-coach

## Resumen

`everscending/qwen3-1.7b-article-usage-micro-coach` es un ajuste fino QLoRA sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, creado por el usuario "everscending" con fines educativos. El modelo está especializado en una tarea muy concreta: actuar como un "micro-coach" de artículos gramaticales en inglés (a, an, the). En lugar de corregir directamente el error, formula una pregunta conceptual sobre el uso incorrecto sin revelar la solución, y solo cuando el alumno corrige el objetivo responde exactamente `Target fixed.`

El modelo se desarrolló a partir de un dataset de 2.324 ejemplos filtrados (1.831 de entrenamiento y 493 de validación) y se seleccionó el checkpoint en el paso 500 según la pérdida de validación. El autor reporta resultados internos en un conjunto de 60 casos de desarrollo: el modelo v2 alcanza un 71,7% de adherencia a la especificación y un 76,7% de robustez, frente al 1,7% y 3,3% del modelo base sin ajustar. No obstante, el propio autor advierte que no es fiable para enseñanza no supervisada y no debe usarse como corrector gramatical general.

La relevancia de este modelo radica en su enfoque de aprendizaje especializado y eficiente: un adaptador LoRA de solo 268 millones de parámetros (el base es Qwen3-1.7B cuantizado a 4 bits) que puede ejecutarse en hardware modesto, incluyendo Apple Silicon gracias al formato MLX. Es un ejemplo de cómo el ajuste fino con QLoRA permite crear herramientas didácticas muy específicas con un coste computacional bajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QLoRA sobre Qwen3-1.7B (dense) cuantizado a 4-bit |
| Parametros totales | 268.944.384 (adaptador LoRA) + base de ~1.7B (cuantizado) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | 4-bit (base) |
| Idiomas soportados | inglés (diseñado para artículos gramaticales en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (QLoRA) aplicado sobre la arquitectura Qwen3-1.7B, que es un transformer denso con 1.700 millones de parámetros y una ventana de contexto de 32.768 tokens. El entrenamiento se realizó con cuantización de 4-bit del modelo base (proporcionado por `mlx-community/Qwen3-1.7B-4bit`), lo que reduce sustancialmente los requisitos de memoria durante el ajuste fino. El dataset consta de 2.324 ejemplos filtrados, de los cuales 1.831 se usaron para entrenamiento y 493 para validación. Se seleccionó el checkpoint del paso 500 según la pérdida de validación.

La técnica principal es QLoRA, que combina LoRA (Low-Rank Adaptation) con la cuantización del modelo base. Esto permite adaptar un modelo de 1.700 millones de parámetros con un adaptador de solo 268 millones, manteniendo los pesos base congelados. El formato MLX asegura compatibilidad nativa con hardware Apple Silicon, aunque el adaptador también puede cargarse en otros frameworks que soporten safetensors.

## Capacidades

- Generación de texto: el modelo produce respuestas de texto en inglés, pero únicamente en el contexto de coaching de artículos gramaticales.
- Coaching interactivo: formula una pregunta conceptual sobre un error de artículo sin revelar la corrección, guiando al alumno a que lo descubra por sí mismo.
- Reconocimiento de corrección: cuando el alumno corrige el objetivo, responde exactamente `Target fixed.`, indicando éxito.
- Capacidad multilingüe: no aplica; el modelo está orientado al inglés y a la gramática de artículos.
- Sin soporte de tool calling ni razonamiento multi-step: no incluye capacidades de agente ni de ejecución de herramientas.
- Sin modo thinking: no implementa un modo de razonamiento explícito como el de Qwen3 original.

## Casos de uso

- Práctica de gramática en aplicaciones educativas: se puede integrar en una app de aprendizaje de inglés que presente frases con errores de artículos; el modelo guía al estudiante con preguntas, sin dar la respuesta directa.
- Tutoría personalizada en plataformas de idiomas: un asistente que detecta un error de artículo en una redacción y lanza una pregunta de coaching, permitiendo que el alumno reflexione antes de recibir la corrección.
- Ejercicios de autoevaluación en entornos de autoestudio: el modelo puede generar preguntas de práctica a partir de textos y comprobar si el alumno corrige correctamente, reforzando la memoria a largo plazo.
- Generación de contenido para ejercicios de gramática: un profesor puede usar el modelo para crear preguntas de práctica automáticas sobre artículos en inglés, ahorrando tiempo en la preparación de materiales.
- Integración en sistemas de feedback en escritura: en un corrector de textos, se puede activar este modelo como un "modo coaching" que no solo marca el error, sino que invita al usuario a pensar en la regla.
- Prototipos de investigación en pedagogía: investigadores en tecnología educativa pueden emplear el modelo para estudiar el impacto de la retroalimentación indirecta frente a la corrección directa.

## Benchmarks y rendimiento

El autor publica resultados internos en un conjunto de 60 casos de desarrollo (40 de adherencia y 30 de robustez). La tabla compara el modelo sin entrenar, la versión con dataset v1 y la versión v2 (la actual).

| Modelo | Adherencia a especificación (60 casos) | Robustez (30 casos) | Utilidad media |
|---|---|---|---|
| Qwen3 sin entrenar | 1/60 (1,7%) | 1/30 (3,3%) | 0,100 |
| Dataset v1 | 26/60 (43,3%) | 15/30 (50,0%) | 0,900 |
| v2 (checkpoint actual) | **43/60 (71,7%)** | **23/30 (76,7%)** | **1,433** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo concreto. El autor señala que los fallos restantes son 15 pistas incorrectas, una filtración de respuesta y una confirmación prematura.

## Requisitos de hardware

- VRAM estimada: el adaptador de 268 millones de parámetros más el base de 1.700 millones cuantizado a 4-bit requieren aproximadamente 1,5-2 GB de memoria en inferencia. Con cuantización adicional podría reducirse aún más.
- GPU recomendadas: funciona en cualquier GPU con 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090). Al ser formato MLX, también se ejecuta eficientemente en Apple Silicon (M1/M2/M3).
- CPU: es posible la inferencia en CPU con llama.cpp o MLX, aunque la latencia será mayor.
- Opciones de despliegue: MLX (nativo en macOS), safetensors para frameworks como Transformers, o conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos en GPU y de 1-2 segundos en CPU.

## Comparativa con modelos similares

No hay disponibles modelos comparables específicos para coaching de artículos gramaticales. La comparación directa se realiza con el modelo base sin ajustar (Qwen3-1.7B) y con la versión v1 del mismo adaptador, tal como se muestra en la sección de benchmarks. En términos de arquitectura, este modelo es un derivado de Qwen3-1.7B, por lo que comparte las características del base: contexto de 32K, licencia Apache-2.0 y disponibilidad de pesos abiertos. No existen otros modelos públicos con el mismo objetivo de coaching de artículos.

## Limitaciones y advertencias

- No es fiable para uso educativo no supervisado: el autor afirma que el modelo aún tiene un 28,3% de fallos de adherencia y no debe sustituir a un profesor.
- Limitado a un único dominio: solo trata artículos gramaticales en inglés; no es un corrector general ni un generador de texto versátil.
- Riesgo de alucinación: al ser un adaptador pequeño sobre un modelo base, puede generar respuestas incorrectas o incoherentes fuera de su ámbito.
- Sesgos del modelo base: Qwen3-1.7B puede tener sesgos de género, culturales o lingüísticos que se heredan en el adaptador.
- Dependencia del formato MLX: el adaptador está en formato MLX, lo que puede limitar su uso en entornos que no soporten esta librería (aunque safetensors es convertible).
- Licencia Apache-2.0 permite uso comercial, pero sin garantías de exactitud en el ámbito educativo.
- El modelo no está entrenado para generalizar a otros tipos de errores gramaticales o a otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/everscending/qwen3-1.7b-article-usage-micro-coach
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del base cuantizado: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen3 en DeepWiki: https://deepwiki.com/QwenLM/Qwen3
