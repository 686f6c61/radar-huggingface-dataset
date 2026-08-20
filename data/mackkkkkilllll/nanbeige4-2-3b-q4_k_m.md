# mackkkkkilllll/Nanbeige4.2-3B-Q4_K_M

## Resumen

Nanbeige4.2-3B es un modelo de lenguaje compacto desarrollado por Nanbeige, diseñado específicamente para tareas de agente (agentic tasks) como ejecución de código, automatización ofimática y uso complejo de herramientas, manteniendo a la vez capacidades sólidas de razonamiento en matemáticas, programación y ciencia. El modelo base cuenta con 3 mil millones de parámetros no-embedding (4,17 mil millones en total) y ha sido preentrenado desde cero sobre 28 billones de tokens utilizando una arquitectura innovadora denominada Looped Transformer, que reutiliza la pila de capas para mejorar la eficiencia computacional.

La ficha que nos ocupa corresponde a la cuantización Q4_K_M en formato GGUF realizada por el usuario mackkkkkilllll, que reduce el tamaño original de 7,95 GiB a 2,45 GiB, permitiendo su ejecución en hardware de consumo con tan solo 3 GB de VRAM. Esta versión cuantizada mantiene la compatibilidad con el runtime llama.cpp y ofrece una ventana de contexto de 262.144 tokens, lo que la hace especialmente adecuada para despliegues locales y aplicaciones de agente con requisitos de memoria reducidos. El modelo base se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilización de pila de capas) |
| Parametros totales | 4.169.800.704 (3B no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (esta versión); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 (modelo base) |
| Formato de pesos | GGUF (Q4_K_M, 4,93 BPW efectivo) |

## Arquitectura y entrenamiento

Nanbeige4.2-3B emplea una arquitectura Looped Transformer, una variante del transformer estándar que reutiliza la misma pila de capas varias veces a lo largo de la secuencia. Esta técnica permite aumentar la profundidad efectiva sin incrementar el número de parámetros, mejorando la capacidad de razonamiento y la eficiencia en memoria. El modelo fue preentrenado desde cero sobre 28 billones de tokens, un volumen de datos considerable para un modelo de este tamaño, lo que contribuye a su sólido rendimiento en tareas de agente y razonamiento.

El entrenamiento se completó con fases de ajuste fino y alineación orientadas a potenciar las capacidades de agente, incluyendo el uso de herramientas y la ejecución de tareas multi-paso. No se dispone de detalles específicos sobre técnicas de RLHF o DPO en la información proporcionada, aunque el paper arXiv menciona que el modelo logra un equilibrio entre capacidades de agente y razonamiento general. La cuantización Q4_K_M no añade ningún entrenamiento adicional; es una conversión puramente post-entrenamiento realizada con las herramientas de llama.cpp.

## Capacidades

- Razonamiento matemático y científico: resuelve problemas de matemáticas, física y otras disciplinas científicas con precisión competitiva para su tamaño.
- Generación de código: soporta tareas de programación en múltiples lenguajes, incluyendo generación, depuración y refactorización.
- Agente de código: puede ejecutar acciones en entornos de desarrollo, como leer archivos, modificar código y ejecutar comandos, siguiendo instrucciones de alto nivel.
- Agente ofimático: capaz de manipular documentos, hojas de cálculo y presentaciones mediante llamadas a herramientas.
- Tool calling / function calling: integra llamadas a funciones externas para completar tareas complejas que requieren interacción con APIs o servicios.
- Razonamiento multi-paso: mantiene cadenas de razonamiento largas y coherentes, esenciales para tareas de agente.
- Multilingüe: domina inglés y chino, con capacidad para alternar entre ambos idiomas en una misma conversación.
- Conversación contextual: mantiene diálogos multi-turno con una ventana de contexto de 262K tokens, lo que permite manejar historiales extensos.

## Casos de uso

- Asistente de programación autónomo: el modelo puede actuar como agente de código en un IDE o CLI, recibiendo una tarea como "arregla el bug en el módulo de autenticación" y realizando las modificaciones necesarias en los archivos, ejecutando pruebas y verificando el resultado, gracias a su soporte de tool calling y razonamiento multi-paso.
- Automatización de tareas ofimáticas: integrado en un sistema de gestión documental, puede generar informes, resumir actas, rellenar plantillas de Excel o redactar correos a partir de instrucciones en lenguaje natural, manejando documentos extensos dentro de su ventana de contexto.
- Chatbot de atención al cliente bilingüe: desplegado en un entorno de producción, gestiona conversaciones con clientes en inglés y chino, manteniendo el contexto de la interacción durante largas sesiones gracias a sus 262K tokens de contexto y su capacidad conversacional.
- Análisis de documentos largos: procesa contratos, artículos de investigación o informes técnicos de hasta cientos de páginas, extrayendo información relevante, resumiendo secciones y respondiendo preguntas específicas sobre el contenido.
- Tutor de matemáticas y ciencias: utilizado en plataformas educativas, explica paso a paso la resolución de problemas, adaptando el nivel de detalle según el usuario y generando ejercicios personalizados.
- Automatización de pipelines de CI/CD: el modelo puede interpretar logs de compilación, diagnosticar errores y proponer o aplicar correcciones en el código, integrándose como un asistente dentro de herramientas de integración continua.
- Generación de contenido técnico bilingüe: redacta documentación técnica, entradas de blog o guías de usuario en inglés y chino, manteniendo consistencia terminológica y estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada para esta cuantización concreta. Sin embargo, el paper del modelo base reporta un rendimiento competitivo en tareas de agente, matemáticas, código y ciencia, aunque los valores numéricos no están disponibles en los materiales consultados.

La evaluación incluida en la model card de esta cuantización ofrece el siguiente dato de perplexity:

| Metrica | Valor |
|---|---|
| Perplexity (Wikitext-2) | 26,8796 ± 0,2620 |
| Contexto de evaluacion | 512 tokens |
| Batch size | 512 |
| GPU offload | 99 capas |

Este valor de perplexity es relativamente alto, lo que es esperable en una cuantización Q4_K_M y en un modelo de solo 3B parámetros. Para una comparación completa con otros modelos, se recomienda consultar el paper original (arXiv:2607.22083).

## Requisitos de hardware

- VRAM mínima: 3 GB para la cuantización Q4_K_M, según datos de nodepedia.
- GPU compatibles: cualquier GPU con al menos 3 GB de VRAM, como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4060, o GPUs de Apple Silicon con memoria unificada.
- GPU recomendadas para máxima velocidad: RTX 4090, A100, H100, aunque no son necesarias dado el tamaño reducido del modelo.
- Despliegue: compatible con llama.cpp, llama-cli, y por extensión con servidores como llama-server, Ollama (si se añade el modelo) y otros frontends que usen llama.cpp como backend.
- Throughput estimado: no disponible en la información proporcionada, pero al ser un modelo de 3B con cuantización Q4_K_M, puede alcanzar velocidades de decodificación superiores a 50 tokens/segundo en GPUs modernas de consumo (estimación basada en modelos similares, no en datos oficiales).

## Comparativa con modelos similares

La siguiente tabla compara las características generales del modelo base con otras alternativas compactas de la misma categoría (3B parámetros). Los datos de rendimiento no están disponibles, por lo que la comparación se limita a especificaciones.

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Enfoque |
|---|---|---|---|---|---|
| Nanbeige4.2-3B | 4,17B (3B no-embedding) | 262K | Apache 2.0 | Looped Transformer | Agente, código, ofimática |
| Qwen2.5-3B | 3,09B | 32K | Apache 2.0 | Transformer denso | Generalista |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community | Transformer denso | Generalista |
| Gemma-3-4B | 4B | 32K | Gemma Terms | Transformer denso | Generalista |

Nanbeige4.2-3B se distingue por su enfoque específico en tareas de agente y su arquitectura Looped Transformer, que le permite un contexto mucho mayor que sus competidores directos. La licencia Apache 2.0 es la más permisiva de las comparadas, igualando a Qwen2.5-3B y superando las restricciones de Llama y Gemma.

## Limitaciones y advertencias

- Al ser una cuantización Q4_K_M, existe una pérdida de precisión respecto al modelo original en FP16. La perplexity en Wikitext-2 (26,88) es notablemente alta, lo que puede afectar a tareas que requieran alta fidelidad en la generación.
- El modelo base está optimizado para inglés y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- No se han encontrado datos sobre sesgos o alucinaciones específicos de este modelo. Como todo LLM, puede generar información falsa o inventada, especialmente en contextos largos o con instrucciones ambiguas.
- La ventana de contexto de 262K tokens es amplia, pero el rendimiento en contextos muy largos puede degradarse en la versión cuantizada.
- El autor de esta cuantización (mackkkkkilllll) no es el desarrollador original del modelo. Se recomienda verificar la integridad de los archivos y descargar desde fuentes oficiales si se requiere máxima confianza.
- El repositorio no proporciona información sobre el proceso de cuantización (dataset de calibración, herramientas exactas), por lo que la calidad de la cuantización no puede ser auditada.
- Aunque la licencia del modelo base es Apache 2.0, esta cuantización específica no declara licencia en su model card. Se debe asumir que la licencia del modelo base aplica, pero conviene contactar al autor para confirmarlo.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mackkkkkilllll/Nanbeige4.2-3B-Q4_K_M
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper arXiv (HTML): https://arxiv.org/html/2607.22083v1
- Paper arXiv (PDF): https://arxiv.org/abs/2607.22083
- Página de compatibilidad GPU y VRAM: https://nodepedia.com/models/nanbeige4-2-3b/
- Cuantizaciones GGUF alternativas (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.2-3B-GGUF
