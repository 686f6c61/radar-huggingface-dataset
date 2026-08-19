# kepom/CyberNeurova-DeepSeek-V4-Flash-abliterated-GGUF

## Resumen

CyberNeurova-DeepSeek-V4-Flash-abliterated-GGUF es una versión "abliterada" (sin restricciones de seguridad) del modelo DeepSeek-V4-Flash de DeepSeek, empaquetada en formato GGUF para su ejecución con llama.cpp. La desarrolla CyberNeurova research y la publica en Hugging Face el usuario kepom. El modelo base es un MoE de 284 mil millones de parámetros en precisión FP8, y esta variante aplica una técnica de abliteración que elimina de forma permanente las negativas de seguridad, horneando las direcciones de ablación en los pesos durante la conversión, sin necesidad de hooks en tiempo de ejecución.

La versión v2, publicada el 14 de agosto de 2026, incorpora tres direcciones de ablación y un corpus de captura de 1338 prompts procedentes de AdvBench, JBB, HarmfulQA, SafeRLHF, MaliciousInstruct y conjuntos propios. Según los datos del autor, la tasa de rechazo en ocho benchmarks de seguridad es del 0,0 % y la conformidad con el formato de tool calling alcanza el 99,2 %. Se distribuye en dos variantes de cuantización, Q2_K (98,8 GB) y Q8_0 (282 GB), pensadas para estaciones de trabajo con mucha RAM o Macs con memoria unificada. El repositorio ocupa 493,6 GB e incluye ambas variantes y documentación técnica.

La relevancia de este modelo reside en que ofrece una alternativa sin restricciones de seguridad para investigación y desarrollo, manteniendo las capacidades de razonamiento y generación de código del modelo base. No obstante, es un artefacto experimental: requiere un fork específico de llama.cpp y no está soportado en la versión upstream, por lo que su uso en producción exige precaución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) en FP8, basada en DeepSeek-V4-Flash |
| Parámetros totales | 284.334.567.511 (284 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (98,8 GB), Q8_0 (~282 GB); el conversor soporta además iq2_xxs, iq2_xs, tq1_0 y tq2_0, pero no se distribuyen |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash, es un transformer de arquitectura MoE con 284 B de parámetros totales en precisión FP8, diseñado para inferencia eficiente. La variante abliterada no modifica la arquitectura, sino que aplica una técnica de ablación de direcciones sobre los pesos: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo o negativa de seguridad y se eliminan de forma permanente. En la versión v2 se emplean tres direcciones de ablación, incluida una orientada a residuos, y un corpus de captura de 1338 prompts.

La abliteración se hornea en los pesos en el momento de la conversión a GGUF, de modo que no requiere hooks en tiempo de ejecución ni modificar el framework de inferencia. El proceso de conversión se realiza con el fork de llama.cpp de antirez, que soporta la arquitectura V4-Flash y las cuantizaciones Q2_K y Q8_0 para los pesos de los expertos enrutados; las rutas de embedding, cabeza, atención y expertos compartidos se mantienen siempre en Q8_0. No se han publicado detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base DeepSeek-V4-Flash en tareas de lenguaje, coherencia y razonamiento, según el autor sin cambios respecto al original.
- Generación de código y depuración: el autor reporta una tasa de detección de errores (bug-finding) del 85,0 % en las pruebas internas.
- Tool calling / function calling: conformidad con el formato JSON del 99,2 % en las pruebas del autor, frente al 74,2 % de la versión v1.
- Capacidades multilingües: el modelo se distribuye declarando únicamente inglés; no se especifican otros idiomas.
- Sin restricciones de seguridad: la abliteración elimina las negativas de seguridad, con una tasa de rechazo del 0,0 % en ocho benchmarks de seguridad y del 3,6 % en una sonda de 55 prompts fuera de distribución (frente al 81,8 % del modelo base).
- Modo de pensamiento o razonamiento extendido: no se menciona explícitamente; no disponible.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de modelos sin restricciones de seguridad, analizando cómo responde a prompts maliciosos o de alto riesgo, útil para investigar técnicas de jailbreak y mitigaciones.
- Desarrollo de agentes autónomos con tool calling: su alta conformidad con el formato JSON (99,2 %) lo hace adecuado para pipelines de agentes que necesitan invocar funciones externas de forma fiable.
- Generación de código en entornos controlados: con una tasa de detección de errores del 85 %, puede usarse en entornos de desarrollo aislados para revisión de código y búsqueda de vulnerabilidades, siempre que se cumplan las políticas de uso.
- Evaluación de modelos abliterados: sirve como referencia para comparar el impacto de la ablación en capacidades de razonamiento, coherencia y generación frente al modelo base.
- Pruebas de robustez de sistemas de moderación: permite generar contenido sin censura para probar y mejorar clasificadores de contenido y sistemas de filtrado.
- Experimentación con cuantización extrema: la variante Q2_K, con solo 98,8 GB, permite ejecutar un modelo de 284 B en hardware de gama alta, evaluando la degradación de calidad frente a Q8_0.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos publicados corresponden a métricas internas del autor sobre el comportamiento tras la abliteración, medidas sobre los pesos bf16 con vLLM:

| Métrica | v1 | v2 | Baseline (modelo base) |
|---|---|---|---|
| Tasa de rechazo (8 benchmarks de seguridad) | 0,0 % | 0,0 % | no disponible |
| Tasa de rechazo (sonda OOD de 55 prompts) | no medido | 3,6 % | 81,8 % |
| Conformidad con formato de tool calling | 74,2 % | 99,2 % | no disponible |
| Detección de errores (bug-finding) | 78,3 % | 85,0 % | no disponible |
| Cumplimiento en hacking | 88,7 % | 90,0 % | no disponible |
| Cumplimiento en armas cibernéticas | 87,3 % | 90,0 % | no disponible |

El autor indica que las capacidades de codificación, coherencia y razonamiento no cambian respecto al modelo base. La cuantización Q8_0 preserva casi exactamente los efectos de la ablación; Q2_K introduce ruido adicional típico de una cuantización de 2 bits.

## Requisitos de hardware

- Variante Q2_K: fichero de 98,8 GB, requiere 128 GB de RAM recomendados (mínimo absoluto 96 GB con evicción intensiva de mmap). Disco libre durante la ejecución: 100 GB.
- Variante Q8_0: fichero de ~282 GB, requiere 320 GB de RAM recomendados (mínimo 256 GB con mmap). Disco libre: 290 GB.
- GPU: opcional; se puede descargar a GPU con `-ngl`, pero el modelo está pensado para ejecutarse en CPU + RAM.
- Plataformas razonables: Mac M3/M4 Max con 128 GB de memoria unificada (Q2_K cómodo); M3/M4 Ultra con 192 o 512 GB (Q2_K rápido, Q8_0 con mmap); estaciones de trabajo o servidores con 256-512 GB de DDR5; 8× A100/H100 con 80 GB cada una para descarga completa.
- Opciones de despliegue: llama.cpp (fork de antirez), tanto `llama-cli` para modo interactivo como `llama-server` para API compatible con OpenAI en `http://localhost:8080/v1/chat/completions`. No soportado en upstream llama.cpp ni en vLLM, TGI u Ollama sin adaptaciones.
- Latencia y throughput: no se proporcionan datos cuantitativos. Se recomienda reducir el contexto a 2048 tokens para mejorar la latencia del primer token en Q2_K.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a la versión anterior, ya que no se dispone de datos de otros modelos abliterados de tamaño comparable.

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash (base) | 284 B | FP8 | no disponible | MIT | Modelo original con restricciones de seguridad |
| CyberNeurova V4-Flash abliterated v1 | 284 B | GGUF | no disponible | MIT | Abliteración con 2 direcciones, tool calling 74,2 % |
| CyberNeurova V4-Flash abliterated v2 (este) | 284 B | GGUF (Q2_K, Q8_0) | no disponible | MIT | Abliteración con 3 direcciones, tool calling 99,2 % |

No se han encontrado modelos abliterados de la misma familia (DeepSeek-V4-Flash) de otros autores con datos comparables en la información disponible.

## Limitaciones y advertencias

- Modelo experimental: se trata de un artefacto de investigación, construido con un fork experimental de llama.cpp; el propio autor advierte de que su uso es bajo discreción del usuario.
- Eliminación de restricciones de seguridad: la abliteración elimina las negativas de seguridad, lo que puede generar contenido dañino, ilegal o no ético. No es adecuado para uso en producción sin supervisión y filtros externos.
- Riesgo de alucinación: no se han evaluado tasas de alucinación; al ser una variante
