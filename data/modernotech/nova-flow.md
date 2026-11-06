# ModernoTech/Nova-Flow

## Resumen

Nova Flow es un repositorio de preparación publicado por Moderno Tech bajo la marca Nova. Según la propia model card, no contiene pesos del modelo: se trata de un espacio de identidad, documentación y estructura de procedencia para un futuro producto de inteligencia conversacional. El estado declarado es `documentation` y `inference: false`, por lo que no es desplegable en su estado actual.

El candidato de origen indicado es `LiquidAI/LFM2.5-8B-A1B`, un modelo de arquitectura MoE de la familia LFM2 con aproximadamente 8.000 millones de parámetros totales y 1.000 millones de parámetros activos por token. Sin embargo, la procedencia, la licencia de redistribución y la identidad de los pesos están "bajo auditoría" y no se ha publicado ningún hash ni verificación.

La relevancia de esta ficha es limitada: no hay artefactos ejecutables, no hay métricas y no hay datasets documentados. Cualquier evaluación técnica debe posponerse hasta que el autor publique pesos verificados. A continuación se detalla lo que sí está declarado y se marcan explícitamente como no disponibles los datos ausentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (candidato LFM2, según notas del autor); no confirmado con pesos |
| Parámetros totales | ~8B (candidato `LFM2.5-8B-A1B`); no verificado |
| Parámetros activos | ~1B (candidato `A1B`); no verificado |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 (declarada; redistribución bajo auditoría) |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un candidato de arquitectura MoE de la familia LFM2, con nomenclatura `8B-A1B`, es decir, aproximadamente 8.000 millones de parámetros totales y 1.000 millones activos por token. No se aportan detalles sobre número de expertos, mecanismo de enrutamiento, tipo de atención ni capas. El repositorio declara explícitamente que los pesos "entrenados o destilados por Moderno Tech para este producto" no están disponibles todavía, que el fine-tuning no está documentado y que el dataset no está documentado.

En cuanto al entrenamiento, el estado es `planned`. No hay información sobre volumen de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas propias más allá de la referencia al candidato LFM2. La política declarada por el autor es no publicar pesos sin verificación exacta de licencia y hash, lo que explica la ausencia de artefactos.

## Capacidades

- Generación de texto conversacional: la descripción del producto menciona "inteligencia conversacional fluida", pero no hay pesos que permitan verificarlo.
- Eficiencia de activación: se declara como objetivo de diseño, coherente con un esquema MoE de ~1B parámetros activos.
- Multilingüismo: inglés y español declarados en los metadatos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Cualquier otra capacidad: no verificable sin pesos publicados.

## Casos de uso

- Evaluación de arquitecturas MoE de bajo coste de activación: si se publican los pesos, el modelo podría emplearse para estudiar el equilibrio entre parámetros totales y activos en cargas conversacionales, comparándolo con otros MoE de ~8B totales.
- Despliegue en entornos con presupuesto de cómputo ajustado: un esquema A1B permitiría, en teoría, servir conversaciones con menor coste por token que un modelo denso de 8B, siempre que la calidad se confirme.
- Asistencia conversacional en inglés y español: el soporte bilingüe declarado lo haría apto para atención al usuario en ambos idiomas, pendiente de validación empírica.
- Base para fine-tuning específico de dominio: al ser Apache 2.0 (sujeto a auditoría), podría servir como punto de partida para adaptaciones verticales una vez verificada la licencia del candidato.
- Investigación sobre destilación y procedencia de pesos: el repositorio documenta un proceso de auditoría de licencia y hash que puede ser útil como referencia metodológica para otros equipos.
- Integración en pipelines de CI/CD para generación de código: no verificable; no hay evidencia de capacidades de código ni de tool calling.

Ninguno de estos casos es ejecutable hoy: el repositorio no contiene pesos ni pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica "metrics documented: pending tests" y no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin pesos; un MoE de ~8B totales con ~1B activos podría, en teoría, caber en GPUs de consumo con cuantización agresiva, pero esto es especulación y no está confirmado por el autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio declara `inference: false`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Pesos publicados | Estado |
|---|---|---|---|---|---|
| Nova Flow (Moderno Tech) | ~8B / ~1B (candidato, no verificado) | no disponible | Apache 2.0 (bajo auditoría) | No | Repositorio de documentación |
| LiquidAI LFM2.5-8B-A1B (candidato de origen) | ~8B / ~1B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Referenciado como origen |
| Otros MoE de ~8B totales | varía | varía | varía | varía | No comparable sin datos verificados |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas. Los datos del candidato LFM2.5-8B-A1B no se han podido verificar dentro de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de pesos: el repositorio no es desplegable; cualquier uso en producción es imposible en el estado actual.
- Procedencia no verificada: el candidato `LiquidAI/LFM2.5-8B-A1B` está pendiente de auditoría de licencia y hash; la licencia Apache 2.0 declarada podría no ser aplicable a los pesos finales.
- Sin métricas ni evaluación: no hay benchmarks, ni tests, ni documentación de dataset, lo que impide estimar calidad, sesgos o riesgo de alucinación.
- Idiomas limitados: solo inglés y español declarados; no hay evidencia de cobertura multilingüe adicional.
- Riesgo de confusión de marca: el repositorio se presenta como producto oficial de Moderno Tech, pero no contiene artefactos técnicos; conviene tratarlo como documentación preliminar.
- Sin información sobre contexto: se desconoce la ventana de contexto, lo que impide planificar casos de uso con entradas largas.
- Fecha de creación futura (2026-11-04): el metadato temporal sugiere un repositorio planificado o con fecha programada; conviene verificar la vigencia antes de citarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ModernoTech/Nova-Flow
- Candidato de origen referenciado: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B (no verificado en esta ficha)
- Paper, blog o demo oficial: no disponible en la información proporcionada.
