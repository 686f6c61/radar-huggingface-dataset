# SC117/Ling-3.0-tiny-abliterated-APEX-GGUF

## Resumen

Ling-3.0-tiny-abliterated-APEX-GGUF es una versión cuantizada y "abliterada" del modelo Ling-3.0-tiny de InclusionAI, preparada por SC117. Se trata de un modelo MoE de 7,9B parámetros totales con solo 1,3B activos por token, diseñado con arquitectura de razonamiento híbrido y 128 expertos enrutados de los cuales únicamente 8 se activan por token. La abliteración se realizó con la herramienta abliterix mediante búsqueda de steering con LoRA sobre un modelo cargado en 4 bits, explorando más de 130 configuraciones y fusionando la receta seleccionada por Pareto en los pesos BF16. El resultado es una reducción del 85% en rechazos (de 98/100 a 15/100) con una divergencia KL de 0,0677 y sin degradación observada en comprobaciones de matemáticas, lógica, código, traducción y conocimiento.

La cuantización APEX es una técnica novedosa de precisión mixta específica para arquitecturas MoE que clasifica cada tensor según su rol (experto enrutado, experto compartido o atención) y aplica un gradiente de precisión por capas, otorgando mayor precisión a las capas de borde más sensibles y comprimiendo más agresivamente las capas intermedias redundantes. Según el autor, APEX supera la perplejidad de Q8_0 a la mitad del tamaño e incluso supera a F16. El modelo se distribuye bajo licencia MIT y está disponible en formato GGUF para llama.cpp, con compatibilidad con endpoints de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con razonamiento, 128 expertos enrutados, 8 activos por token |
| Parametros totales | 7.893.392.800 (7,9B) |
| Parametros activos | 1,3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX (precisión mixta consciente de MoE), GGUF con calibración imatrix |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, Ling-3.0-tiny de InclusionAI, es un MoE (Mixture of Experts) con 128 expertos enrutados de los cuales solo 8 se activan por token, lo que lo hace extremadamente eficiente en inferencia: 7,9B parámetros totales pero solo 1,3B activos por token. La etiqueta "bailing-moe" sugiere una variante específica de la arquitectura MoE, aunque los detalles exactos no están documentados en la información disponible. El modelo incorpora capacidades de razonamiento híbrido, lo que implica un modo de razonamiento explícito antes de generar la respuesta final.

La versión abliterada se obtuvo con abliterix, que utiliza búsqueda de steering con LoRA sobre un modelo cargado con bitsandbytes en 4 bits. Se exploraron más de 130 configuraciones candidatas de steering y la receta seleccionada por Pareto se fusionó en los pesos BF16. El proceso logró reducir los rechazos de 98/100 a 15/100 (85% menos) con una divergencia KL de solo 0,0677, y las comprobaciones posteriores de capacidades (matemáticas, lógica, código, traducción, conocimiento) pasaron sin degradación observada.

La cuantización APEX clasifica cada tensor del modelo por su rol funcional y aplica una estrategia de precisión por capas. Para Ling-3.0-tiny, con sus 128 expertos enrutados y solo 8 activos por token, esta técnica resulta especialmente adecuada, ya que permite comprimir los expertos redundantes sin penalizar la calidad de los expertos críticos ni las capas de atención.

## Capacidades

- Generación de texto con razonamiento híbrido, combinando modos de respuesta directa y razonamiento explícito.
- Razonamiento matemático y lógico, verificado mediante spot-checks post-abliteración.
- Generación de código, verificada en spot-checks sin degradación tras la abliteración.
- Traducción entre idiomas, verificada en spot-checks.
- Modelo "uncensored" / "decensored" gracias a la abliteración, con 85% menos rechazos que el modelo base.
- Eficiencia MoE: solo 1,3B parámetros activos por token, lo que permite inferencia rápida incluso en hardware de consumo.
- Compatible con pipelines de text-generation y despliegue mediante endpoints.

## Casos de uso

- Asistentes conversacionales sin restricciones temáticas: el modelo puede mantener conversaciones sobre temas que el modelo base rechazaría sistemáticamente, gracias a la abliteración que reduce los rechazos del 98% al 15%, siendo útil para aplicaciones de rol, escritura creativa o debate abierto.
- Generación de código en entornos de desarrollo: con capacidades de código verificadas y eficiencia MoE, puede integrarse en asistentes de programación locales o en pipelines de CI/CD para autocompletado y revisión de código.
- Razonamiento y análisis lógico: su arquitectura de razonamiento híbrido lo hace adecuado para tareas de resolución de problemas complejos, planificación y análisis estructurado.
- Traducción automática: verificado en spot-checks post-abliteración, puede usarse como motor de traducción en aplicaciones de escritorio o servicios ligeros.
- Despliegue en hardware de consumo: con solo 1,3B parámetros activos y cuantización APEX, es viable en GPUs de gama media e incluso en CPU mediante llama.cpp, lo que lo hace apto para aplicaciones edge o sin conexión.
- Investigación sobre abliteración y alineación: sirve como modelo de referencia para estudiar los efectos de eliminar la dirección de rechazo en modelos MoE y comparar metodologías de steering.
- Experimentación con cuantización MoE-aware: permite evaluar el impacto de APEX frente a métodos de cuantización estándar (Q8_0, F16) en la calidad de salida y el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente menciona:

- Spot-checks cualitativos post-abliteración (matemáticas, lógica, código, traducción, conocimiento) que pasan sin degradación observada.
- Reducción de rechazos del 85% (15/100 frente a 98/100 en el modelo base) con divergencia KL de 0,0677.
- Afirmación de que APEX supera la perplejidad de Q8_0 a la mitad del tamaño e incluso supera a F16, aunque no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: al ser un MoE de 7,9B parámetros totales, la inferencia requiere cargar todos los pesos en memoria. Con cuantización APEX de alta compresión, los archivos GGUF individuales deberían caber en 4-8 GB de VRAM, aunque el repositorio completo ocupa 35,0 GB.
- GPU recomendadas: el modelo cuantizado debería ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB), dependiendo del nivel de cuantización elegido. También es viable en Apple Silicon con suficiente memoria unificada.
- Despliegue: compatible con llama.cpp, Ollama y otros runners compatibles con GGUF. La etiqueta "endpoints_compatible" indica que puede desplegarse tras un endpoint de inferencia.
- Al ser un MoE con solo 8 de 128 expertos activos por token, el throughput de inferencia es considerablemente mayor que un modelo denso del mismo tamaño total, aunque los datos exactos de latencia no están disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.0-tiny (base) | 7,9B | 1,3B | MIT | Modelo original de InclusionAI sin abliterar |
| Ling-lite (InclusionAI) | 16,8B | 2,75B | MIT | Hermano mayor de la familia Ling, misma arquitectura MoE |
| Ling-plus (InclusionAI) | 290B | 28,8B | MIT | Modelo flagship de la familia Ling |
| SC117/Ling-3.0-tiny-abliterated-APEX-GGUF | 7,9B | 1,3B | MIT | Versión abliterada y cuantizada con APEX de Ling-3.0-tiny |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo del modelo, lo que implica que puede generar contenido que el modelo original rechazaría, incluido material potencialmente dañino, ofensivo o inapropiado. El uso debe ser responsable y considerar las implicaciones éticas y legales.
- No se han publicado benchmarks formales, por lo que el rendimiento real en tareas estándar (MMLU, HumanEval, GSM8K) no está verificado de forma independiente.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está documentada en la información disponible, lo que dificulta planificar despliegues que requieran ventanas largas.
- Aunque el autor afirma que los spot-checks post-abliteración no muestran degradación, la abliteración puede afectar sutilmente el comportamiento del modelo en casos no cubiertos por esas comprobaciones.
- La cuantización APEX es una técnica relativamente nueva y poco validada por la comunidad; su comportamiento en producción a largo plazo no está ampliamente contrastado.
- El modelo está diseñado para ser "uncensored", lo que puede no ser adecuado para aplicaciones comerciales que requieran moderación de contenido integrada o cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SC117/Ling-3.0-tiny-abliterated-APEX-GGUF
- Documentación en chino: https://huggingface.co/SC117/Ling-3.0-tiny-abliterated-APEX-GGUF/blob/main/README_zh.md
- Modelo base (inclusionAI/Ling-3.0-tiny): https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio abliterix: https://github.com/wuwangzhang1216/abliterix
- Repositorio APEX: https://github.com/mudler/apex-quant
- Repositorio Ling (InclusionAI): https://github.com/inclusionAI/Ling
- Repositorio Ling-V2 (InclusionAI): https://github.com/inclusionAI/Ling-V2
