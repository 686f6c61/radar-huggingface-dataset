# KolmogorovAcc/sovereign-anthology-gemma-2-2b

## Resumen

Sovereign Anthology Gemma 2 2B es un ajuste fino del modelo instructivo google/gemma-2-2b-it, publicado por el usuario KolmogorovAcc en Hugging Face. El autor lo presenta como un "motor cognitivo universal" orientado al análisis de inteligencia operativa, entrenado a partir de principios de decisión extraídos de manuales desclasificados de agencias estadounidenses (CIA, NSA, FBI, Departamento de Defensa) y del metamodelo operativo de Palantir. No es un modelo de propósito general: su tarjeta lo posiciona explícitamente como un analista de inteligencia autónomo que ejecuta marcos como el Analysis of Competing Hypotheses (ACH) de Richards J. Heuer Jr.

El modelo conserva la arquitectura y el tamaño del Gemma 2 2B original, con 3.204.165.888 parámetros totales según los pesos en safetensors, y hereda la ventana de contexto y el tokenizador de la familia Gemma 2. La propuesta de valor declarada es la ejecución local y air-gapped sobre hardware de consumo, con aceleración DirectML en una AMD Radeon RX 7600 XT, sin dependencia de la nube.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de ajuste fino de nicho sobre un modelo pequeño y abierto; por otro, advierte de que la mayor parte de las afirmaciones de la model card (metodología de entrenamiento, capacidades procedimentales, protocolos de revisión) no están respaldadas por benchmarks ni por documentación técnica verificable en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-2-2b-it; sin modificaciones documentadas) |
| Parametros totales | 3.204.165.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 2, sin confirmacion explicita) |
| Tipos de cuantizacion | GGUF (formato publicado en el repo); niveles concretos no disponibles |
| Idiomas soportados | en |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B instruct: un transformer decoder-only con atención local y global alternada, normalización RMSNorm y las innovaciones propias de la familia Gemma 2. El autor no documenta ninguna modificación estructural, por lo que se asume que el ajuste fino preserva la topología del modelo base.

Respecto al entrenamiento, la model card describe una destilación de "principios universales de decisión" extraídos de miles de manuales operativos desclasificados, fusionados con el metamodelo de decisión de Palantir (Gotham, Foundry, AIP). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de RLHF o DPO, ni hiperparámetros. La distinción que hace el autor entre una "capa de evidencia factual" (RAG sobre ChromaDB y grafo de conocimiento) y una "capa de disciplina cognitiva" (el propio modelo) es una decisión de diseño de sistema, no una característica verificable del checkpoint. Tampoco hay información sobre el proceso de destilación ni sobre el profesor utilizado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Razonamiento estructurado según el marco ACH: formulación de hipótesis competidoras (H1, H2, H3) y búsqueda de evidencia refutatoria, según declara el autor.
- Producción de "protocolos operativos" numerados con criterios de aborto y umbrales cuantitativos, según la model card.
- Triaje de tareas y cálculo de "decaimiento de recursos" inspirado en métodos de la NSA, según la model card.
- Protocolo de revisión posterior a la acción (AAR) a 30 días, descrito en la documentación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado formalmente; las capacidades descritas son procedimentales, no de orquestación de herramientas.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de hipótesis competidoras en investigación de incidentes: el modelo puede estructurar un informe con hipótesis alternativas sobre la causa raíz de una caída de servicio y señalar qué evidencia refutaría cada una, aprovechando el marco ACH que el autor afirma haber internalizado.
- Triaje de alertas en operaciones de TI: dado un volumen de incidentes superior a la capacidad del equipo, el modelo puede priorizar según criterios de caducidad de la información y asignar recursos, siguiendo el esquema de "resource decay" descrito en la model card.
- Simulación de análisis forense de incentivos: en escenarios de fraude o conflicto entre socios, el modelo puede mapear asimetrías de riesgo moral y trazar cadenas causales de "follow the money", según la capa FBI descrita por el autor.
- Formación y entrenamiento de analistas: servir como interlocutor local y offline para practicar la redacción de protocolos operativos auditables y la revisión posterior a la acción, sin enviar datos sensibles a la nube.
- Documentación de decisiones de alto impacto en entornos air-gapped: organizaciones que no pueden usar APIs en la nube pueden desplegar el modelo en local para generar borradores de protocolos de decisión con trazabilidad numérica.
- Prototipado de asistentes de análisis con RAG: combinado con una base vectorial (ChromaDB) y un grafo de conocimiento, el modelo actúa como capa de razonamiento sobre documentos internos, tal como propone la arquitectura de dos capas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 para los 3.2 mil millones de parámetros; alrededor de 2-3 GB en cuantización de 4 bits (estimación basada en el tamaño del modelo, no en mediciones publicadas).
- GPU recomendadas: el autor cita explícitamente una AMD Radeon RX 7600 XT (16 GB) con aceleración DirectML. Cualquier GPU con al menos 6 GB de VRAM debería poder ejecutar el modelo en FP16; con cuantización, GPUs de 4 GB podrían ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas de gama media y alta, y en cuantización GGUF incluso en equipos con 4-8 GB de VRAM.
- Opciones de despliegue: transformers, llama.cpp (por los pesos GGUF publicados), Ollama (el autor incluye una insignia "Ollama Ready"), y text-generation-inference (etiqueta `text-generation-inference` presente en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign Anthology Gemma 2 2B | 3.204.165.888 | no disponible | Gemma | Hugging Face, GGUF incluido | Ajuste fino de nicho sobre Gemma 2 2B IT; sin benchmarks publicados |
| google/gemma-2-2b-it | 2.6 mil millones aprox. | 8.192 tokens (según documentación de Google) | Gemma | Hugging Face, gated | Modelo base oficial; benchmarks publicados por Google |
| Qwen2.5-1.5B-Instruct | 1.5 mil millones | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar, licencia permisiva, multilingüe |
| Llama 3.2 1B Instruct | 1.2 mil millones | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto largo |

La comparación con el modelo base es la más relevante: cualquier evaluación de capacidades del ajuste fino debería contrastarse contra google/gemma-2-2b-it, extremo que la model card no realiza.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que respalden las capacidades declaradas (ACH, triaje, protocolos operativos). Las afirmaciones de la model card son descriptivas y no verificables.
- Riesgo de alucinación elevado en el dominio declarado: un modelo de 2B parámetros no tiene capacidad suficiente para razonamiento estratégico complejo de forma fiable; la terminología de inteligencia puede producir respuestas con apariencia de rigor pero sin fundamento.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base Gemma 2, que Google documenta en su model card.
- Limitación de idioma: solo inglés según el campo `language`; el rendimiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, obligaciones de atribución y restricciones de uso comercial que deben revisarse antes de cualquier despliegue en producción.
- Terminología y atribuciones cuestionables: las referencias a Palantir, la CIA, la NSA y el FBI son afirmaciones del autor sobre el origen del material de entrenamiento; no hay evidencia pública que las respalde ni afiliación institucional alguna.
- Contexto no confirmado: la longitud de contexto no se especifica en la información disponible; debe verificarse en la configuración del checkpoint antes de usarlo en tareas de contexto largo.
- Idoneidad para producción: no recomendado para decisiones de alto impacto sin supervisión humana y sin una evaluación independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KolmogorovAcc/sovereign-anthology-gemma-2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Repositorio de Antigravity (citado por el autor): https://github.com/google-deepmind
- AMD Radeon (hardware citado por el autor): https://www.amd.com
- Ollama: https://ollama.com
