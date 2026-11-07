# KTECeline/divergence-minilm-l6

## Resumen

Divergence-minilm-l6 es un prototipo de investigación publicado por KTECeline que adapta el encoder de frases `sentence-transformers/all-MiniLM-L6-v2` (22,7 millones de parámetros) para una tarea muy concreta: medir la divergencia entre el comportamiento declarado y el comportamiento observado de una *skill* de agente de IA. Forma parte del proyecto Divergence, un chequeo previo a la instalación que extiende el instalador del marketplace del Agent Governance Toolkit (AGT 4.1.0). El modelo puntúa la consistencia entre la descripción declarada en un `SKILL.md` y la traza de ejecución capturada en un sandbox.

El modelo no es un LLM generativo ni un clasificador de maliciosidad: es un encoder de similitud semántica afinado con `CosineSimilarityLoss` sobre pares (descripción, texto enriquecido de la traza). Su salida se combina con un modelo de calibración logística (regresión logística sobre la puntuación de consistencia y tres banderas estructurales) para producir una decisión de tipo FLAG cuando la probabilidad es igual o superior a 0,5. Está pensado para cargarse a través del paquete `divergence-agt` y no directamente con `sentence-transformers`.

Su relevancia es acotada pero clara en el nicho emergente de la seguridad y gobernanza de agentes: ofrece un mecanismo ligero, local y de bajo coste computacional para detectar discrepancias entre lo que una skill declara hacer y lo que realmente hace durante una ejecución de prueba. El autor lo etiqueta explícitamente como prototipo de investigación y no como control de seguridad de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder de frases), base `all-MiniLM-L6-v2` |
| Parámetros totales | 22.713.216 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de MiniLM-L6; el autor no la especifica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (las reglas de vocabulario de descripción son solo en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,1 GB) |
| Dimensión de embedding | 384 (heredada de MiniLM-L6) |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Artefactos adicionales | `calibration_model.json` (regresión logística) |

## Arquitectura y entrenamiento

El componente principal es el encoder `all-MiniLM-L6-v2`, un transformer BERT de 6 capas y 384 dimensiones de embedding, afinado mediante `CosineSimilarityLoss` sobre pares formados por la descripción declarada de una skill y el texto enriquecido de la traza observada en el sandbox. El entrenamiento usó 130 ejecuciones etiquetadas, 12 épocas y semilla 42. La salida del encoder alimenta un segundo componente, `calibration_model.json`, una regresión logística que toma la puntuación de consistencia junto con tres banderas estructurales (dominio no mencionado, acceso a credenciales y tipo de acción no declarado) y emite FLAG cuando la probabilidad es mayor o igual a 0,5.

Los datos de entrenamiento derivan de MalSkillBench (Guo et al., 2026, para uso académico en investigación) más trazas capturadas en el sandbox sellado del autor. El repositorio no incluye ejemplos de entrenamiento. No se documentan innovaciones arquitectónicas propias más allá del pipeline de dos etapas (encoder + calibrador); no hay decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Codificación de frases para similitud semántica entre descripciones declaradas y trazas de ejecución.
- Puntuación de consistencia intent–comportamiento sobre texto en inglés.
- Detección de tres banderas estructurales: dominio no mencionado, acceso a credenciales y tipo de acción no declarado.
- Clasificación binaria de decisión (FLAG / no FLAG) mediante el calibrador logístico con umbral 0,5.
- Integración con el flujo `divergence evaluate --skill-md SKILL.md --trace run.json` del paquete `divergence-agt`.
- Compatibilidad con Text Embeddings Inference y endpoints (etiquetas del repo).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.

## Casos de uso

- Auditoría previa a la instalación de skills en el marketplace de AGT: el modelo compara la descripción del `SKILL.md` con la traza del sandbox y emite FLAG si la divergencia supera el umbral calibrado, bloqueando la instalación antes de que la skill se ejecute en producción.
- Revisión de skills de terceros en pipelines de CI: se integra como paso de verificación que ejecuta la skill en un sandbox y pasa la traza por `divergence evaluate`, generando un artefacto de auditoría por cada versión publicada.
- Detección de acceso no declarado a credenciales: la bandera estructural de acceso a credenciales dispara la probabilidad de FLAG cuando la skill toca secretos que no figuran en su descripción, algo útil en entornos con gestión centralizada de secretos.
- Control de cambios de comportamiento entre versiones: al comparar la traza de la versión anterior con la nueva frente a la misma descripción, se detectan desviaciones introducidas en actualizaciones aparentemente menores.
- Triaje en investigación de seguridad de agentes: sirve como filtro de primera pasada, barato y local, para priorizar qué skills requieren revisión manual antes de un análisis más profundo.
- Gobernanza interna de catálogos de herramientas: en organizaciones que mantienen un registro propio de skills, el modelo aporta una señal objetiva de consistencia documentación–comportamiento que se agrega al inventario.
- Evaluación comparativa de generadores de `SKILL.md`: permite medir si las descripciones autogeneradas por un LLM se corresponden con el comportamiento real de la skill resultante.

## Benchmarks y rendimiento

Evaluación en el split de test reservado (117 ejecuciones, usado una sola vez), según la model card:

| Métrica | Valor |
|---|---|
| AUC | 0,913 (IC 95 %: 0,854–0,962) |
| F1 | 0,804 |
| Tasa de falsas alarmas | 0,10 |

No se han publicado en la información disponible comparaciones con otros modelos en esta tarea ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB). El autor remite al repositorio para líneas base, ablaciones y experimentos de control.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,7 millones de parámetros en fp32 ocupa aproximadamente 91 MB de pesos, y en fp16 unos 45 MB, más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también funciona en CPU sin problema apreciable.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `sentence-transformers` (vía el paquete `divergence-agt`), Text Embeddings Inference (etiqueta `text-embeddings-inference`) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste por par despreciable frente al de la ejecución del sandbox, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divergence-minilm-l6 | 22,7 M | no disponible | Consistencia intent–comportamiento (encoder + calibrador) | no disponible | Hugging Face (0 descargas) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (modelo base, según documentación pública del original) | Similitud semántica general | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| bge-small | no disponible en la información | no disponible | Embeddings generales | no disponible | Hugging Face |

La comparación relevante es con su modelo base: divergence-minilm-l6 hereda el encoder de MiniLM-L6 y añade una capa de calibración específica para la tarea de seguridad de agentes. No se dispone de datos de benchmarks comparativos frente a bge-small ni frente a otros clasificadores de seguridad de agentes en la información proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no es un control de seguridad de producción.
- Mide divergencia intent–comportamiento, no maliciosidad: una skill maliciosa que describa con precisión su comportamiento pasará el filtro.
- Solo observa el comportamiento que se dispara durante la ejecución de prueba; las bombas lógicas, las cargas activadas por disparadores y las respuestas condicionadas no se detectan.
- Una traza vacía significa «nada observado», no «seguro».
- Las reglas de vocabulario de descripción son solo en inglés, lo que limita su uso con skills documentadas en otros idiomas.
- Entrenado con solo 130 ejecuciones etiquetadas; el conjunto de test es de 117 ejecuciones, por lo que la generalización a dominios y sandboxes distintos no está demostrada.
- Los datos de entrenamiento derivan de MalSkillBench con uso académico en investigación; conviene verificar las condiciones de esa fuente antes de un uso comercial.
- Licencia del modelo no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí existe riesgo de falsos positivos y negativos en la clasificación, con una tasa de falsas alarmas declarada del 10 %.
- Sin descargas ni likes en el momento de la consulta; ecosistema de soporte mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KTECeline/divergence-minilm-l6
- Repositorio del proyecto Divergence: https://github.com/KTECeline/divergence
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Guía de all-MiniLM-L6-v2 (2026): https://tokenmix.ai/blog/all-minilm-l6-v2-free-local-embedding-guide-2026
- Paquete PyPI all-minilm-l6-v2-model: https://pypi.org/project/all-minilm-l6-v2-model/
