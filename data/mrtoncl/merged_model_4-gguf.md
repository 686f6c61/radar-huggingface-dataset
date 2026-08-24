# mrtoncl/merged_model_4-gguf

## Resumen

El modelo `mrtoncl/merged_model_4-gguf` es una fusión de dos modelos de 8 mil millones de parámetros mediante la técnica `slerp` implementada con mergekit. Combina `WiroAI/wiroai-turkish-llm-8b`, un modelo especializado en lengua turca, con `NeverSleep/Lumimaid-v0.2-8B`, un modelo orientado a roleplay y conversación. El objetivo declarado por el autor es unificar capacidades de generación en turco con habilidades de roleplay para un proyecto de RPG llamado "Son Fıçı". El resultado se distribuye en formato GGUF, lo que permite su ejecución en entornos locales con CPU o GPU mediante herramientas como llama.cpp u Ollama.

La relevancia de este modelo radica en su enfoque específico para el idioma turco, un ámbito con menos recursos que el inglés, y su orientación a casos de uso conversacionales y de rol. Al ser un merge, no requiere entrenamiento adicional y puede utilizarse directamente para inferencia. Sin embargo, la información pública es escasa: no se especifican licencia, contexto, ni benchmarks, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, al derivar de modelos de 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF, pero no se listan cuantizaciones concretas) |
| Idiomas soportados | tr (turco) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se genera mediante una fusión lineal interpolada (`slerp`) de dos modelos base de 8B parámetros, utilizando mergekit. La configuración aplica valores de interpolación variables por capa: para las capas de atención propia (`self_attn`) se usa una progresión de `t` que va de 0.0 a 1.0, mientras que para las capas MLP se aplica la secuencia inversa. Esto permite un equilibrio entre las características de ambos modelos a lo largo de la red. El tokenizador se toma del modelo base (`WiroAI/wiroai-turkish-llm-8b`). No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO, ya que el modelo es un merge y no un entrenamiento desde cero.

## Capacidades

- Generación de texto en turco, con énfasis en conversación y roleplay.
- Posible herencia de capacidades de razonamiento y generación de código del modelo turco base, aunque no hay evidencia documentada.
- Orientado a interacciones multi-turno propias de juegos de rol, gracias a la contribución de Lumimaid-v0.2-8B.
- No se documentan capacidades de tool calling, agentes, visión o audio.
- El soporte multilingüe se limita al turco, según la etiqueta `language: [tr]`.

## Casos de uso

- Roleplay en turco: el modelo puede generar respuestas narrativas y diálogos para juegos de rol de mesa o videojuegos, aprovechando la fusión de capacidades lingüísticas y conversacionales.
- Asistente conversacional en turco: puede emplearse en chatbots o asistentes virtuales que requieran respuestas naturales en este idioma, aunque sin garantías de robustez en tareas complejas.
- Generación de historias interactivas: adecuado para crear ficción interactiva o aventuras de texto donde el usuario interactúa con el modelo en turco.
- Traducción informal o paráfrasis: al estar entrenado en turco, puede ayudar a reformular textos o generar variaciones, aunque no es su propósito principal.
- Prototipado de aplicaciones de IA en turco: sirve como base para pruebas de concepto en entornos locales gracias a su formato GGUF, sin necesidad de infraestructura cloud.
- Aprendizaje y experimentación: útil para desarrolladores que quieran explorar técnicas de fusión de modelos y su impacto en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- Al ser un modelo de 8B parámetros en GGUF, la VRAM necesaria depende de la cuantización elegida. Para cuantizaciones típicas (Q4_K_M, Q5_K_M), se estima entre 5 y 7 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Con cuantizaciones más agresivas (Q2_K, Q3_K) podría caber en GPUs con 4 GB, aunque con pérdida de calidad.
- En CPU, puede ejecutarse con llama.cpp u Ollama, aunque la velocidad será menor; se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF como text-generation-webui.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| mrtoncl/merged_model_4-gguf | 8.03B | no disponible | no disponible | GGUF | Turco + roleplay |
| WiroAI/wiroai-turkish-llm-8b | 8B | no disponible | no disponible | no disponible | Turco general |
| NeverSleep/Lumimaid-v0.2-8B | 8B | no disponible | no disponible | no disponible | Roleplay en inglés |

La comparativa se limita a los modelos base, ya que no hay otros modelos similares con datos públicos. El merge busca combinar las fortalezas de ambos, pero sin benchmarks no es posible cuantificar su rendimiento relativo.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- Al ser un merge sin evaluación publicada, no hay garantías sobre su calidad, coherencia o seguridad en tareas reales.
- El modelo está orientado exclusivamente al turco; su rendimiento en otros idiomas será muy limitado o nulo.
- Puede heredar sesgos o alucinaciones de los modelos base, especialmente en contextos de roleplay donde la creatividad puede primar sobre la veracidad.
- La longitud de contexto no está documentada; se desconoce si soporta ventanas largas o si sufre degradación en conversaciones extensas.
- El autor no proporciona información sobre el proceso de cuantización ni sobre qué archivos GGUF están disponibles, lo que dificulta la selección de la versión adecuada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mrtoncl/merged_model_4-gguf)
- [Repositorio de mergekit](https://github.com/arcee-ai/mergekit) (herramienta utilizada para la fusión)
