# amal1994/distilled-voyage-modernbert

## Resumen

El modelo `amal1994/distilled-voyage-modernbert` es un cross-encoder basado en ModernBERT, desarrollado por Amal Saad Alshehri, especializado en el re-ranking de pasajes de legislación del Reino Unido. Su propósito es sustituir al API propietario Voyage `rerank-2.5` mediante destilación de conocimiento, ofreciendo una alternativa completamente open source para la recuperación de información estatutaria. El modelo se integra en un pipeline de dos etapas: primero se recuperan los 100 candidatos más relevantes y después se reordenan con este cross-encoder para devolver los mejores resultados.

Con 149,6 millones de parámetros y una ventana de contexto de 2.048 tokens, el modelo está entrenado sobre 5.221 tripletas consulta-pasaje-puntuación extraídas de legislación del Reino Unido entre 2020 y 2024. Su relevancia radica en que aborda un dominio especializado (derecho y normativa) donde los modelos genéricos de re-ranking suelen rendir peor, y lo hace con un modelo abierto que puede desplegarse localmente sin depender de servicios externos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (regresión) |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (entrenado sobre legislación del Reino Unido, presumiblemente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nomic-ai/modernbert-embed-base` y se adapta como cross-encoder con una cabeza de regresión para puntuar la relevancia entre una consulta y un pasaje. La destilación se realiza desde el API propietario Voyage `rerank-2.5`, que actúa como profesor, generando las puntuaciones objetivo. El entrenamiento utiliza pérdida de error cuadrático medio (MSE) durante 3 épocas, con tamaño de lote 4 y tasa de aprendizaje 2e-5. El conjunto de datos de destilación contiene 5.221 tripletas (consulta, pasaje, puntuación) extraídas de legislación del Reino Unido entre 2020 y 2024, y está disponible públicamente junto con el corpus y el benchmark asociados.

No se mencionan innovaciones técnicas adicionales más allá de la destilación y el uso de ModernBERT como base, que ya incorpora mejoras sobre BERT clásico como atención con Flash Attention y mayor eficiencia en secuencias largas.

## Capacidades

- Re-ranking de pasajes legales: puntúa la relevancia de un pasaje respecto a una consulta, devolviendo una puntuación continua (regresión).
- Especialización en legislación del Reino Unido: entrenado sobre normativa y provisiones legales de ese país, captura vocabulario y estructuras propias del dominio jurídico.
- Integración en pipelines de recuperación: diseñado para funcionar como segunda etapa tras un recuperador inicial (top-100), reordenando los candidatos.
- Destilación de un modelo propietario: aproxima el comportamiento de Voyage `rerank-2.5` sin depender de su API.
- No es generativo: no produce texto, solo puntuaciones de relevancia.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente de ranking.

## Casos de uso

- Búsqueda jurídica en despachos de abogados: un sistema de recuperación de jurisprudencia o normativa puede usar este modelo para reordenar los resultados de una búsqueda inicial, priorizando los pasajes más relevantes para una consulta legal concreta.
- Asistentes de investigación legal: integrado en un chatbot o herramienta de análisis, permite filtrar documentos legislativos extensos y presentar al usuario solo los fragmentos con mayor probabilidad de responder a su pregunta.
- Revisión de cumplimiento normativo: empresas que necesitan verificar si sus políticas internas cumplen con la legislación del Reino Unido pueden usar el modelo para localizar rápidamente las provisiones aplicables.
- Indexación y recuperación de corpus legislativos: organismos públicos o editoriales jurídicas pueden desplegar este modelo para mejorar la precisión de sus motores de búsqueda sobre bases de datos de leyes y estatutos.
- Sistemas de recomendación de documentos legales: en plataformas de acceso a normativa, el modelo puede sugerir pasajes relacionados con una consulta del usuario, mejorando la experiencia de navegación.
- Evaluación de relevancia en datasets de IR legal: investigadores pueden usar el modelo como baseline o componente en experimentos de recuperación de información sobre legislación del Reino Unido.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La búsqueda web menciona que el modelo "se acerca a la efectividad del profesor y supera a otros rerankers abiertos" en el benchmark propio del autor, pero no se proporcionan métricas concretas (p. ej., nDCG, MAP, Recall). Por tanto, no se incluyen tablas comparativas con cifras.

## Requisitos de hardware

- VRAM estimada: con 149,6 millones de parámetros, el modelo en fp32 ocupa aproximadamente 0,6 GB. En cuantización de 8 bits (si se aplicara) bajaría a ~0,3 GB, y en 4 bits a ~0,15 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32. Una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues en producción, una T4 o A10G ofrece margen para procesar lotes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo, incluso en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de HuggingFace con pesos safetensors, puede cargarse con la librería `transformers` de Python, o servirse con frameworks como vLLM, TGI o FastAPI. También es posible exportarlo a ONNX para inferencia optimizada.
- Latencia y throughput: no se dispone de datos medidos. Para un cross-encoder de este tamaño, la latencia típica por par consulta-pasaje en GPU moderna es del orden de milisegundos, pero depende del hardware y del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amal1994/distilled-voyage-modernbert` | 149,6 M | 2.048 | Re-ranking legal (UK) | no disponible | HuggingFace |
| `BAAI/bge-reranker-base` | 278 M | 512 | Re-ranking general | MIT | HuggingFace |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | 22,7 M | 512 | Re-ranking general | Apache-2.0 | HuggingFace |

El modelo destilado se diferencia por su especialización en legislación del Reino Unido y por su mayor contexto (2.048 tokens frente a 512 de los otros), lo que permite procesar pasajes legales más largos. Sin embargo, carece de licencia declarada, lo que puede limitar su uso comercial. Los modelos generalistas como BGE o MiniLM son más versátiles pero no están afinados para el dominio jurídico.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre legislación del Reino Unido, el modelo puede no generalizar bien a otros sistemas legales o jurisdicciones.
- Riesgo de alucinación: al ser un cross-encoder de regresión, no genera texto, por lo que el riesgo de alucinación es bajo; el riesgo principal es una puntuación de relevancia incorrecta.
- Limitaciones de contexto: la ventana de 2.048 tokens puede ser insuficiente para pasajes legales muy extensos; en esos casos habría que truncar o dividir el texto.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar con el autor antes de usarlo en producción.
- Dependencia del profesor: la calidad del modelo depende de la del API Voyage `rerank-2.5`; si el profesor tiene sesgos o errores, estos se heredan en la destilación.
- Datos de entrenamiento limitados: solo 5.221 tripletas, lo que puede limitar la robustez ante consultas fuera del dominio o variaciones de redacción.
- Sin soporte para otros idiomas: no se ha declarado soporte multilingüe; el modelo está pensado para texto en inglés (legislación del Reino Unido).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amal1994/distilled-voyage-modernbert
- Repositorio de código: https://github.com/alshehriamal1994/uk-statute-retrieval
- Corpus, benchmark y conjunto de destilación (DOI): https://doi.org/10.15128/r14x51hj064
- Repositorio de ModernBERT (AnswerDotAI): https://github.com/AnswerDotAI/ModernBERT
- Perfil del autor en HuggingFace: https://huggingface.co/amal1994/models
