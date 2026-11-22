# Lvetter/lvetter-titanium-100b

## Resumen

Lvetter Titanium 100B MoE es un modelo de generación de texto presentado por el equipo Lvetter AI como un modelo "soberano" polaco. Se distribuye en Hugging Face bajo la licencia Apache 2.0 y declara soporte para polaco e inglés. Su propuesta central es una arquitectura de mezcla de expertos (MoE) con 104 mil millones de parámetros totales y 32 mil millones activos por token, combinada con un mecanismo propietario denominado "Adaptive Thinking" que ajusta el esfuerzo de razonamiento según la dificultad de la consulta.

El modelo se describe como una fusión de cuatro expertos especializados: uno de ingeniería de software y tool calling (32B), uno de derecho mercantil y finanzas polacas (29B), uno de diálogo natural y cultura polaca (11B) y uno de razonamiento deductivo profundo (32B), coordinados por un router dinámico con top_k=2. Esta segmentación por dominio es el rasgo diferencial que declara el autor, orientado a tareas de razonamiento jurídico, matemático y de ingeniería en lengua polaca.

La relevancia del modelo radica en su enfoque en un idioma poco representado en los grandes modelos abiertos y en su diseño de cómputo adaptativo. No obstante, la información pública disponible es muy limitada: la model card no incluye resultados de benchmarks, detalles de entrenamiento más allá del corpus declarado, ni especificaciones de despliegue. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han publicado pesos alternativos ni documentación técnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con router dinámico top_k=2 y 4 expertos especializados |
| Parametros totales | 104 mil millones (104B) |
| Parametros activos | 32 mil millones (32B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos. El autor describe cuatro expertos con tamaños declarados de 32B, 29B, 11B y 32B, lo que suma 104B, coordinados por una red de enrutamiento dinámico que selecciona los dos expertos más relevantes por token (top_k=2). Los expertos están especializados por dominio: ingeniería de software y multimodalidad, derecho y finanzas polacas, diálogo natural en polaco y razonamiento deductivo formal. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni otros hiperparámetros arquitectónicos.

El entrenamiento se declara sobre el corpus maestro `Lvetter/lvetter-titanium-dataset`, de 85,78 GB y aproximadamente mil millones de tokens, que según el autor incluye razonamiento matemático en polaco, tareas académicas, derecho mercantil polaco, arquitectura de sistemas IT y la Wikipedia polaca completa. No se detalla la composición exacta del dataset, la proporción de tokens por dominio, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documenta la innovación "Adaptive Thinking" a nivel técnico: se describen cuatro niveles de esfuerzo de razonamiento (Tier 1 a Tier 4), pero no se explica su implementación, si es un mecanismo de prompting, un módulo aprendido o un control de decodificación.

## Capacidades

- Generación de texto en polaco e inglés.
- Razonamiento deductivo multietapa, con modo de cadena de pensamiento (Chain of Thought) en los niveles Tier 3 y Tier 4.
- Razonamiento matemático y verificación formal de hipótesis, según el experto de razonamiento profundo.
- Conocimiento especializado en derecho mercantil polaco, fiscalidad B2B, KSeF y jurisprudencia, según el experto Silicon.
- Ingeniería de software y arquitectura de sistemas, según el experto Oxygen.
- Tool calling y function calling, declarados dentro del experto Oxygen.
- Capacidades multimodales atribuidas al experto Oxygen (no se detalla qué modalidades ni cómo se integran en el MoE).
- Diálogo natural en polaco con riqueza de modismos y contexto cultural, según el experto de diálogo.
- Cómputo adaptativo: ajuste del esfuerzo de razonamiento según la complejidad de la consulta (Tier 1 a Tier 4).
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asesoría jurídica mercantil en polaco: el experto Silicon está entrenado en derecho de sociedades, fiscalidad B2B, KSeF y jurisprudencia, por lo que el modelo podría usarse para redactar borradores de contratos, resumir sentencias o responder consultas sobre obligaciones fiscales, con revisión humana obligatoria.
- Generación de código en producción: el experto Oxygen declara capacidades de ingeniería de software y tool calling, lo que permitiría integrar el modelo en pipelines de CI/CD para generar tests, revisar parches o asistir en tareas de refactorización.
- Razonamiento matemático y verificación de hipótesis: el modo Tier 3/Tier 4 activa cadenas de deducción completas, adecuado para resolver problemas de matemáticas avanzadas, comprobar demostraciones o auditar cálculos financieros.
- Atención al cliente en polaco: el experto de diálogo natural y cultura polaca está orientado a conversaciones fluidas con modismos locales, útil para asistentes conversacionales multi-turno dirigidos al mercado polaco.
- Documentación técnica y arquitectura de sistemas: el modelo puede redactar especificaciones, diagramas descriptivos y documentación de arquitectura en polaco e inglés, aprovechando el experto de ingeniería.
- Análisis de normativa y compliance: combinando los expertos jurídico y de razonamiento, el modelo podría emplearse para contrastar cláusulas contractuales con la jurisprudencia y detectar riesgos regulatorios en operaciones B2B.
- Localización y adaptación cultural de contenidos: el experto de diálogo permite adaptar textos del inglés al polaco preservando registro, modismos y convenciones culturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo MoE de 104B parámetros totales y 32B activos requiere en torno a 64 GB en FP16 solo para pesos (104B × 2 bytes), y aproximadamente 32-40 GB en cuantización de 4 bits, aunque estas cifras son estimaciones genéricas y no han sido confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, un despliegue en FP16 requeriría múltiples A100/H100 de 80 GB o equivalentes; en cuantización de 4 bits podría plantearse en una o dos A100 80 GB, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? No disponible. Un MoE de 104B totales difícilmente cabe en una única GPU de consumo (RTX 4090 con 24 GB) incluso en cuantización agresiva, pero el autor no publica requisitos.
- Opciones de despliegue: no disponible. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores, ni se publican formatos GGUF o quantizados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Lvetter Titanium 100B | 104B (MoE) | 32B | no disponible | Apache 2.0 | pl, en | Hugging Face (0 descargas) |
| Modelos MoE abiertos de escala similar (p. ej. familia Mixtral) | ~8x7B / ~8x22B | ~12-39B | 32K-64K típicamente | Apache 2.0 | multilingüe | ampliamente desplegados |
| Modelos densos de ~30-70B orientados a razonamiento | 30-70B | densidad completa | variable | variable | multilingüe | ampliamente desplegados |

No se dispone de datos de rendimiento del modelo Lvetter Titanium que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, licencia e idiomas declarados. No se conocen modelos comparables específicos para polaco con arquitectura MoE de esta escala en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay validación por parte de la comunidad ni reportes de uso independientes.
- Corpus de entrenamiento declarado de aproximadamente mil millones de tokens, una cifra muy reducida para un modelo de 104B parámetros, lo que plantea dudas sobre la calidad y generalización del modelo.
- No se documentan hiperparámetros arquitectónicos ni detalles del proceso de entrenamiento (número de tokens efectivos, técnicas de alineación, datos de RLHF/DPO).
- El mecanismo "Adaptive Thinking" no está descrito técnicamente, por lo que no es posible evaluar su funcionamiento ni reproducirlo.
- Riesgo de alucinación no cuantificado; en dominios jurídicos y fiscales el riesgo es especialmente alto y exige revisión humana.
- Cobertura lingüística limitada a polaco e inglés; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación técnica y de validación externa desaconseja su uso en producción sin una evaluación propia exhaustiva.
- La model card emplea afirmaciones de marketing ("soberano", "chirurgicamente precisa") sin respaldo en métricas publicadas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Lvetter/lvetter-titanium-100b
- Dataset declarado: https://huggingface.co/datasets/Lvetter/lvetter-titanium-dataset
- Modelo Lvetter Oxygen 32B: https://huggingface.co/Lvetter/lvetter-oxygen-32b
- Modelo Lvetter Silicon 29B: https://huggingface.co/Lvetter/lvetter-silicon-29b
