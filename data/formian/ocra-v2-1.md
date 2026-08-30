# Formian/ocra-v2.1

## Resumen

O-CRA Model Disposition Scores (V2.1) no es un modelo de lenguaje, sino un dataset de evaluación publicado por Formian Labs que cuantifica la *disposición* de 135 modelos de IA de 29 laboratorios distintos bajo el marco Organizational Cognitive Resonance & Alignment (O-CRA). Este marco mide tendencias de comportamiento de los modelos en seis dimensiones —alineación con intenciones estratégicas, sincronización cultural y lingüística, integración en procesos sistémicos, arquitectura de gobernanza y seguridad, traducción de valor a ROI, y scaffolding de conocimiento institucional— en lugar de su rendimiento en benchmarks clásicos como MMLU o GPQA.

El dataset, con licencia CC-BY-4.0 y disponible en JSONL y CSV, incluye puntuaciones normalizadas entre 0 y 1 para cada dimensión, una puntuación global compuesta, etiquetas de disposición (Cautious, Adaptive, Accommodating) y análisis cualitativos por modelo. La versión V2.1 se basa en un protocolo de más de 203 escenarios de prueba y se presenta como la referencia pública actual para datos de disposición O-CRA. Su relevancia radica en ofrecer una perspectiva complementaria a los benchmarks de capacidad: ayuda a organizaciones a seleccionar modelos según su encaje conductual en flujos de trabajo concretos, y se integra con Hugging Face a través de un benchmark registrado (`eval.yaml`) que permite mostrar puntuaciones O-CRA en las páginas de los modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (dataset de puntuaciones de disposición, no un modelo de lenguaje) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (los datos y etiquetas están en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No aplica (formatos de datos: JSONL y CSV) |

## Arquitectura y entrenamiento

O-CRA V2.1 no es un modelo entrenado, sino un marco de evaluación aplicado a modelos existentes. El framework mide la *disposición* conductual de los modelos a través de un protocolo de 203+ escenarios que evalúan cómo responden los modelos en contextos organizacionales: si detectan lenguaje estratégico sin que se les indique explícitamente, cómo interpretan declaraciones de políticas, si requieren re-anclaje constante en los objetivos de la organización, o cómo adaptan su registro lingüístico a diferentes equipos profesionales.

Los datos se estructuran en seis dimensiones con rangos y medianas observados en los 135 modelos evaluados:

- Strategic Intent Alignment (SIA): rango 0.4289 – 0.8589, mediana 0.5557
- Cultural & Linguistic Synchronization (CLS): rango 0.3692 – 0.8740, mediana 0.4910
- Systemic Process Integration (SPI): rango 0.3339 – 0.8489, mediana 0.4722
- Governance & Safety Architecture (GSA): rango 0.2081 – 0.8541, mediana 0.4379
- ROI & Value Translation (RVT): rango 0.4183 – 0.8431, mediana 0.5346
- Institutional Knowledge Scaffolding (IKS): rango 0.2566 – 0.8444, mediana 0.4006

Las etiquetas de disposición se asignan según la puntuación global: Cautious (< 0.3), Adaptive (0.3 – 0.6) y Accommodating (> 0.6). En la versión actual, 4 modelos son Cautious, 21 Adaptive y 17 Accommodating. El dataset incluye además desgloses de leniency por dimensión y análisis conductuales completos en el archivo JSONL.

## Capacidades

- Proporciona puntuaciones cuantitativas (0–1) en seis dimensiones de disposición organizacional para 135 modelos de 29 laboratorios.
- Clasifica cada modelo en una de tres categorías de disposición: Cautious, Adaptive o Accommodating, con rangos de puntuación definidos.
- Incluye metadatos por modelo: laboratorio, fecha de prueba, estado (`valid`), disponibilidad actual (`current`), y tier (`frontier`, `specialist`, `compact`) cuando está asignado.
- Ofrece análisis cualitativos y descripciones de uso previsto para cada modelo en el archivo JSONL.
- Se integra como benchmark en Hugging Face mediante `eval.yaml`, permitiendo que las puntuaciones O-CRA aparezcan en las páginas de los modelos como resultados de evaluación comunitarios.
- Permite comparar modelos no por capacidad bruta, sino por su idoneidad conductual para entornos organizacionales específicos.

## Casos de uso

- Selección de modelos para despliegue empresarial: una organización puede consultar las puntuaciones O-CRA para elegir entre varios LLMs candidatos aquel que mejor se alinee con su cultura corporativa, evitando modelos que requieran re-anclaje constante en objetivos estratégicos.
- Evaluación de gobernanza y seguridad: los responsables de cumplimiento pueden usar la dimensión GSA para identificar modelos que tienden a la "parálisis de gobernanza" (exceso de cautela) o a la "seguridad empoderada" (equilibrio entre utilidad y restricciones), informando políticas de despliegue.
- Diseño de sistemas multi-agente: al integrar varios modelos en un pipeline, las puntuaciones de SPI y CLS ayudan a asignar agentes a etapas del flujo (exploración, ejecución lineal, refinamiento iterativo, validación) según su capacidad de adaptarse al contexto de proceso.
- Formación y fine-tuning organizacional: los análisis cualitativos del JSONL permiten identificar brechas de comportamiento específicas en un modelo, orientando estrategias de prompt engineering o fine-tuning para mejorar su ajuste a la organización.
- Monitorización continua de modelos: al estar registrado como benchmark en Hugging Face, las organizaciones pueden trackear cambios en la disposición de los modelos a lo largo de versiones, detectando derivas conductuales que afecten a la integración.
- Investigación académica en IA y gobernanza: el dataset sirve como referencia para estudios sobre cómo los LLMs se comportan en entornos organizacionales, complementando benchmarks de capacidad con métricas de disposición.

## Benchmarks y rendimiento

No se trata de un modelo con resultados en benchmarks tradicionales (MMLU, HumanEval, GSM8K). Por el contrario, O-CRA V2.1 es en sí mismo un benchmark de disposición. Los datos disponibles son las puntuaciones de los 135 modelos evaluados, resumidos en los rangos y medianas por dimensión indicados en la sección de arquitectura. No se han publicado resultados comparativos de modelos individuales en la información proporcionada; el dataset completo está disponible en los archivos JSONL y CSV para consulta detallada.

## Requisitos de hardware

No aplica. Al ser un dataset de puntuaciones (archivos JSONL y CSV), no requiere hardware de inferencia ni GPU. Su uso implica procesamiento de datos estándar con cualquier herramienta de análisis (Python, pandas, etc.) y no presenta requisitos de memoria significativos más allá del almacenamiento de los archivos (135 entradas).

## Comparativa con modelos similares

No disponible. O-CRA V2.1 es un dataset único de disposición organizacional; no existen alternativas públicas equivalentes en la información proporcionada. Otros marcos de evaluación (como MMLU, HELM, etc.) miden capacidades, no disposición, y por tanto no son directamente comparables. El propio framework O-CRA se construye sobre el marco CR&A (Cognitive Resonance & Alignment) anterior, pero no se dispone de datos de versiones previas en esta ficha.

## Limitaciones y advertencias

- El dataset contiene puntuaciones de disposición, no de capacidad: un modelo con alta puntuación O-CRA no es necesariamente más inteligente o preciso en tareas técnicas.
- Las etiquetas de disposición (Cautious, Adaptive, Accommodating) no implican juicios de valor; cada categoría puede ser adecuada según el contexto organizacional.
- Se advierte de discrepancias menores entre fuentes de datos: el sitio web de Formian Labs (data/models.json) usa valores de `current` ligeramente diferentes para 4 modelos de Google. Se recomienda usar el archivo JSONL como fuente de referencia.
- El dataset cubre únicamente modelos disponibles hasta la fecha de prueba (2026-08-30); modelos posteriores no están incluidos.
- Los escenarios de prueba (203+) están diseñados para contextos organizacionales anglófonos; la aplicabilidad a entornos no occidentales o multilingües puede ser limitada.
- La licencia CC-BY-4.0 permite uso comercial y modificaciones, pero exige atribución adecuada a Formian Labs.
- No se garantiza que las puntuaciones reflejen el comportamiento real en producción fuera de los escenarios de prueba; se recomienda validación adicional en el entorno específico.

## Enlaces

- HuggingFace: https://huggingface.co/Formian/ocra-v2.1
- Página del framework O-CRA en Formian Labs: https://formianlabs.com/framework/
- Repositorio GitHub del framework: https://github.com/Research-FormianLabs/O-CRA-Framework
- Sitio principal de Formian Labs: https://www.formianlabs.com/
- Paper (SSRN): https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6840499
