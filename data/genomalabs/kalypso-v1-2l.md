# genomalabs/kalypso-v1.2l

## Resumen

KALYPSO v1.2L es un modelo de generación de texto especializado en código y planificación, desarrollado por GENOMA Labs como sucesor de su modelo público kalypso-v1.1L. Se basa en Qwen3-Coder-30B-A3B-Instruct, un modelo de mezcla de expertos (MoE) con 30.5 mil millones de parámetros totales y 3.3 mil millones de parámetros activos por token, lo que permite una inferencia aproximadamente cuatro veces más barata que un modelo denso de tamaño equivalente. El fine-tuning incorpora un LoRA de manejo de fallos (r16) aplicado sobre las capas de atención y los MLPs expertos, con un corpus de 800 ejemplos diseñados para mejorar la robustez en escenarios de orquestación y ejecución de tareas.

El modelo está pensado para desarrolladores e investigadores que necesitan un asistente de código con capacidades de planificación y gestión de errores, manteniendo una licencia Apache-2.0 y una ventana de contexto nativa de 32k tokens. Aunque el fine-tuning reduce ligeramente el rendimiento en generación de código de un solo intento respecto a la base sin modificar (73.2% frente a 82.9% en el benchmark propio de GENOMA), supera ampliamente a su predecesor v1.1L en todas las métricas evaluadas, con un coste de servicio mucho menor. El modelo se distribuye con pesos en formato GGUF y es compatible con vLLM, llama.cpp y Ollama, cabiendo en una GPU de 24 GB en cuantización de 4 bits.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.5 mil millones |
| Parametros activos | 3.3 mil millones |
| Longitud de contexto | 32 000 tokens (nativa de la base) |
| Tipos de cuantizacion | 4 bits (GGUF, ~19 GB); otras cuantizaciones no especificadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (proporcionado); safetensors presumiblemente disponible, no confirmado |

## Arquitectura y entrenamiento

KALYPSO v1.2L parte de Qwen3-Coder-30B-A3B-Instruct, un transformer MoE con 30.5B parámetros totales y 3.3B activos por token. Sobre esta base, GENOMA Labs aplicó un LoRA de rango 16 en las capas de atención y en los MLPs de los expertos, orientado específicamente al manejo de fallos en tareas de planificación y ejecución. El corpus de fine-tuning consta de 800 ejemplos públicos y auditados: 320 diálogos de manejo de fallos, 160 planes de orquestación con pasos explícitos de verificación y rollback/compensación, y 320 ejemplos de retención de código (coding-hold). No se menciona el uso de RLHF ni DPO; el entrenamiento se limita a fine-tuning supervisado con LoRA.

Una innovación destacable es la metodología de evaluación publicada por GENOMA, que incluye un harness con pruebas de código en sandbox (pytest oculto) y jueces LLM calibrados para puntuar la calidad de los planes y su ejecución ante fallos. El modelo hereda de la base la capacidad de razonamiento y generación de código, pero el fine-tuning busca mejorar la robustez en escenarios donde un plan debe detectar errores, revertir acciones o compensar efectos secundarios.

## Capacidades

- Generación de código en múltiples lenguajes, con capacidad de emitir archivos de implementación y pruebas en formato de bloques de código.
- Planificación de orquestación: el modelo puede generar planes de ejecución con pasos de verificación y mecanismos de rollback o compensación ante fallos.
- Manejo de fallos: entrenado específicamente para reconocer condiciones de error y proponer acciones correctivas en diálogos multi-turno.
- Razonamiento y conocimiento general: obtiene un 50.3% en MMLU-Pro (n=300), lo que indica competencia en tareas de conocimiento y razonamiento.
- Inferencia eficiente: al ser MoE con 3.3B parámetros activos, el coste por token es significativamente menor que un modelo denso de 14B, como su predecesor.
- Soporte de herramientas y agentes: no se documenta explícitamente tool calling, pero al derivar de Qwen3-Coder, es probable que herede capacidades de llamada a funciones; no confirmado en la información disponible.
- Multilingüismo: solo se declara inglés; no se garantiza soporte para otros idiomas.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado: el modelo puede generar código, tests y documentación, y gracias a su ventana de 32k tokens puede manejar archivos de proyecto completos o conversaciones largas de depuración.
- Automatización de pipelines de CI/CD: su capacidad de planificación con verificación y rollback permite diseñar pipelines que detecten fallos en etapas tempranas y ejecuten compensaciones, reduciendo el tiempo de recuperación.
- Agente de orquestación de microservicios: en arquitecturas distribuidas, el modelo puede generar planes de despliegue que incluyan comprobaciones de salud y estrategias de reversión ante errores de servicio.
- Generación de casos de prueba: entrenado con ejemplos de coding-hold, puede producir suites de tests unitarios y de integración, aunque su rendimiento en un solo intento es inferior al de la base sin ajustar.
- Documentación técnica y explicación de código: puede resumir fragmentos complejos, explicar decisiones de diseño y redactar guías de mantenimiento, aprovechando su conocimiento de código y razonamiento.
- Prototipado rápido de scripts de automatización: para tareas administrativas o de procesamiento de datos, el modelo puede generar scripts funcionales con manejo de errores básico, adecuado para entornos donde la supervisión humana es posible.
- Investigación en planificación de agentes: dado que GENOMA publica su metodología de evaluación, el modelo puede usarse como referencia en estudios sobre manejo de fallos en sistemas autónomos.

## Benchmarks y rendimiento

GENOMA Labs publica resultados de su propio harness de evaluación, no de benchmarks estándar de la industria. La siguiente tabla compara KALYPSO v1.2L con su predecesor v1.1L bajo condiciones idénticas:

| Benchmark (harness de GENOMA) | v1.1L (14B denso) | v1.2L (30B-A3B) |
|---|---|---|
| Coding v4_hard pass@1 (41 tareas, sandbox) | 57.7% (N=3) | 73.2% (N=2) |
| Plan-grade orchestration (30 tareas, juez LLM calibrado) | 0.832 | 0.848 |
| Execution-grade orchestration (juez de resultados) | 0.437 | 0.482 |
| MMLU-Pro (n=300) | 41.0% | 50.3% |
| Parámetros activos por token | 14B | 3.3B |

Además, el autor indica que frente a la base sin modificar (Qwen3-Coder-30B-A3B-Instruct), el fine-tune mide una pérdida de 7 puntos porcentuales en coding pass@1 (82.9% base vs 73.2% v1.2L, N=2 cada uno), con paridad en planificación, ejecución y conocimiento. No se han publicado resultados en benchmarks estándar como HumanEval, GSM8K o MMLU completo.

## Requisitos de hardware

- VRAM estimada: ~19 GB en cuantización de 4 bits, lo que permite ejecución en una GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090, A5000).
- GPU recomendadas: cualquier GPU con al menos 24 GB de VRAM para 4 bits; para mayor velocidad, GPUs de centro de datos como A100 o H100.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas de 24 GB como la RTX 3090 o RTX 4090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (se proporciona GGUF). También es posible usar TGI si se adapta el formato.
- Latencia y throughput: no se proporcionan cifras concretas; al tener solo 3.3B parámetros activos, se espera una latencia significativamente menor que un modelo denso de 14B, aunque depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Rendimiento en código (pass@1) |
|---|---|---|---|---|---|
| KALYPSO v1.2L | 30.5B | 3.3B | 32k | Apache-2.0 | 73.2% (harness GENOMA, N=2) |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30.5B | 3.3B | 32k | Apache-2.0 | 82.9% (harness GENOMA, N=2) |
| KALYPSO v1.1L | 14B (denso) | 14B | no disponible | Apache-2.0 | 57.7% (harness GENOMA, N=3) |

La comparativa se limita a los modelos directamente relacionados, ya que no se dispone de datos de otros modelos MoE de código con los mismos benchmarks. Frente a la base, v1.2L sacrifica rendimiento en código de un solo intento, pero gana en robustez para planificación y manejo de fallos, que es el objetivo declarado del fine-tuning.

## Limitaciones y advertencias

- El fine-tuning reduce el rendimiento en generación de código de un solo intento respecto a la base sin modificar (73.2% vs 82.9% en el harness de GENOMA). Si el caso de uso principal es código one-shot, la base es más adecuada.
- La ejecución de planes ante fallos sigue siendo una debilidad general de la industria: el modelo puntúa 0.482 en execution-grade orchestration, por debajo de 0.5, lo que indica que los planes generados no siempre manejan correctamente los modos de fallo.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- El corpus de entrenamiento es pequeño (800 ejemplos) y puede no cubrir todos los dominios de código o planificación.
- No se han publicado resultados en benchmarks estándar (HumanEval, MMLU completo, etc.), lo que dificulta la comparación con otros modelos.
- El modelo es muy reciente (agosto de 2026) y tiene cero descargas y cero likes en HuggingFace; la comunidad aún no lo ha validado de forma independiente.
- Aunque la licencia es Apache-2.0, el autor advierte que el corpus de entrenamiento fue auditado para excluir contenido propietario, pero no se detalla la procedencia de los datos de la base Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genomalabs/kalypso-v1.2l
- Modelo predecesor v1.1L: https://huggingface.co/GenomaLabs-com/KALYPSO-v1.1L
- Perfil del autor en HuggingFace: https://huggingface.co/genomalabs/models
- Publicación en LinkedIn sobre v1.1L: https://www.linkedin.com/posts/nicola-montuschi-13111987_genomalabskalypso-v11l-hugging-face-activity-7492278109229158401-ZIa9
- Documentación de CALYPSO (no relacionada directamente, pero aparece en la búsqueda): https://iccms-calypso.github.io/CALYPSO-Python/posts/_case_studies.html
