# espejelomar/gemma-evm-scout

## Resumen

Gemma EVM-Scout es un modelo de retrieval semántico especializado en priorizar funciones Solidity para auditorías de seguridad de smart contracts. Desarrollado por el autor espejelomar, este checkpoint de 16,95 millones de parámetros es un fine-tune completo del modelo `lightonai/LateOn-Code-edge`, no un modelo generativo de la familia Gemma. El nombre hace referencia al sistema completo, que combina este localizador con un revisor basado en Gemma 4 E4B-it, pero el checkpoint publicado es exclusivamente un retriever multi-vector.

El modelo resuelve un problema concreto: los auditores de contratos EVM no eligen entre cuatro opciones fáciles, sino que deben examinar miles de funciones. Dado un riesgo (reentrancy, broken accounting, signature replay, control de acceso, etc.), Gemma EVM-Scout rankea todas las funciones implementadas de un repositorio según su prioridad de revisión. Durante la evaluación, el modelo no ve el título de la auditoría, la severidad, el texto del hallazgo ni la ubicación conocida de la vulnerabilidad. Su salida es una prioridad de revisión (`LEAD`), nunca una probabilidad de vulnerabilidad.

La relevancia actual radica en la creciente demanda de herramientas de seguridad automatizadas para el ecosistema EVM. Con solo 16,95M de parámetros, el modelo es extremadamente ligero y puede ejecutarse en hardware modesto, lo que lo hace accesible para integraciones en pipelines de auditoría. Está entrenado con 36.618 funciones Solidity de 99 proyectos y utiliza interacción tardía a nivel de token con MeanMaxSim, una técnica inspirada en ColBERT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Retriever multi-vector (late interaction) basado en transformer, fine-tune de LateOn-Code-edge |
| Parametros totales | 16.797.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | research-preview-license (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un retriever denso de interacción tardía, basado en el backbone `lightonai/LateOn-Code-edge`, un transformer preentrenado para código. La arquitectura multi-vector codifica la consulta y los documentos (funciones Solidity) en secuencias de embeddings a nivel de token, y la similitud se calcula mediante MeanMaxSim: para cada token de la consulta se toma el máximo sobre los tokens del documento y se promedia. Este enfoque permite capturar coincidencias parciales y relaciones semánticas finas entre el riesgo descrito y el código.

El entrenamiento utilizó una pérdida listwise multi-positivo exacta, con un currículum de candidatos que crece de 7 a 15 y luego a 31 funciones del mismo repositorio. El contexto de cada función incluye no solo el código de la función, sino también modificadores, herencia, llamadas entrantes y salientes, lecturas y escrituras de estado, y vecinos de estado compartido. Se trataron las funciones no reportadas como distractores, nunca como negativos certificados. El corpus de entrenamiento consta de 36.618 funciones de 99 proyectos, con 208 hallazgos de entrenamiento, 57 de validación (disjuntos por repositorio), 63 de test (familias de protocolo no vistas) y 27 de regresión sellados. El entrenamiento se realizó en una GPU RTX 3050 Laptop de 4 GB, con un pico de VRAM de 0,437 GiB para el modelo de 17M.

## Capacidades

- Ranking de funciones Solidity por prioridad de revisión ante un riesgo específico (reentrancy, broken accounting, signature replay, control de acceso, etc.).
- Retrieval multi-vector con interacción tardía, lo que permite comparaciones semánticas a nivel de token entre la consulta y el código.
- Soporte de 12 mecanismos de seguridad generales predefinidos, integrados en el escáner del repositorio.
- Generación de contexto enriquecido por función: modificadores, herencia, llamadas, estado y vecinos de estado compartido.
- Integración con herramientas de verificación formal y análisis estático (Foundry, Slither, Echidna, Halmos) para confirmar hallazgos.
- Capacidad de procesar repositorios completos de Solidity y fusionar rankings de múltiples consultas de riesgo.
- No es un modelo generativo: no produce texto ni explicaciones, solo puntuaciones de similitud.

## Casos de uso

- Auditoría de smart contracts: un auditor introduce una consulta de riesgo (p. ej., "buscar reentrancy o rutas de callback donde una llamada externa ocurre antes de actualizar el estado crítico") y el modelo rankea las funciones del repositorio, permitiendo priorizar la revisión manual de las más sospechosas.
- Triaje automatizado de vulnerabilidades: integrado en un pipeline CI/CD, el modelo puede filtrar miles de funciones y reducir la carga de trabajo de los analistas, señalando solo las funciones que requieren inspección profunda.
- Análisis de repositorios grandes: para protocolos con cientos de contratos, el escáner extrae funciones y contexto, y el modelo produce un ranking consolidado por riesgo, facilitando la planificación de auditorías.
- Soporte a equipos de seguridad ofensiva: los pentesters pueden usar el modelo para localizar rápidamente puntos de entrada vulnerables en contratos de terceros antes de un ataque simulado.
- Educación y formación en seguridad: los estudiantes pueden usar el modelo para entender qué patrones de código son más relevantes para ciertos riesgos, comparando las funciones rankeadas con los hallazgos reales.
- Búsqueda semántica de código Solidity: más allá de la seguridad, el modelo puede servir para recuperar funciones similares en una base de código, útil para refactorización o reutilización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como precisión, recall o NDCG sobre conjuntos de evaluación estándar. El autor menciona particiones de validación, test y regresión, pero no reporta los resultados numéricos obtenidos en ellas.

## Requisitos de hardware

- Inferencia: al ser un modelo de solo 16,95M de parámetros, requiere menos de 1 GB de VRAM en FP32. Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU con suficiente RAM.
- Entrenamiento: el autor utilizó una RTX 3050 Laptop de 4 GB, con un pico de VRAM de 0,437 GiB, lo que indica que el fine-tune es viable en hardware de gama baja.
- Despliegue: compatible con la librería `sentence-transformers` (versión >= 6.0.0) y con `text-embeddings-inference` (según los tags). No se menciona soporte para vLLM u Ollama, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles, pero dado el tamaño reducido, se espera una latencia de milisegundos por consulta en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (retrieval de código Solidity para seguridad). El modelo base `lightonai/LateOn-Code-edge` es el único punto de referencia directo, pero no se han publicado comparativas con otros retrievers de código como CodeBERT, GraphCodeBERT o UniXCoder. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Licencia de solo investigación: la licencia `research-preview-license` restringe el uso comercial. Cualquier despliegue en producción requiere verificar los términos exactos en el archivo LICENSE.md.
- Idioma: el modelo está entrenado únicamente en inglés. Las consultas y los comentarios en otros idiomas pueden degradar el rendimiento.
- Alcance limitado a Solidity: no soporta otros lenguajes de smart contracts (Vyper, Rust para Solana, etc.).
- No detecta vulnerabilidades: el modelo solo prioriza funciones para revisión. Un resultado `LEAD` no implica que exista un bug; se requiere verificación con herramientas formales o revisión manual.
- Sesgo del corpus: el entrenamiento se basa en 99 proyectos, lo que puede introducir sesgos hacia ciertos patrones de código o familias de protocolos. La generalización a proyectos muy diferentes no está garantizada.
- Riesgo de alucinación: al ser un retriever, no genera texto, pero puede producir falsos positivos (funciones rankeadas altas sin vulnerabilidad real) o falsos negativos (funciones vulnerables no rankeadas).
- Contexto limitado: aunque se enriquece con modificadores, herencia y estado, la longitud de contexto no está documentada; funciones muy largas podrían truncarse.
- El corpus de entrenamiento no se incluye en el repositorio, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espejelomar/gemma-evm-scout
- Modelo base: https://huggingface.co/lightonai/LateOn-Code-edge
- Licencia: https://huggingface.co/espejelomar/gemma-evm-scout/blob/main/LICENSE.md
- Referencia al sistema Gemma 4 (revisor): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
