# SKOPION-Intelligence/skopion-verdict-committee-v20.0-singularity

## Resumen
SKOPION Verdict Committee v20.0 Singularity es un sistema de clasificación y evaluación de decisiones (LLM-as-a-judge / reward model) publicado por SKOPION-Intelligence bajo la generación "Verdict v20.0 SINGULARITY" (fases 67–75). No se trata de un modelo monolítico, sino de una cascada denominada "System 1.5 Cascade" que combina tres escalas de parámetros (4B + 9B + 27B) en precisión BF16, con un peso total declarado de 60,4 GB. Su propósito es emitir veredictos auditables sobre decisiones en entornos regulados: cumplimiento KRITIS, NIS2, EU AI Act y estándares militares NATO STANAG.

El modelo se presenta con un enfoque poco habitual en la literatura open source: incorpora inferencia causal mediante operadores do(X), control de riesgo conformal con garantía de cobertura del 99,99 % (alfa = 0,0001) y certificados criptográficos de veredicto denominados PCVC-v20, con mención a criptografía post-cuántica. Está etiquetado como text-classification y soporta inglés, alemán y polaco.

Su relevancia actual reside en la demanda de sistemas de decisión trazables para auditoría regulatoria en la UE y en contextos de defensa. No obstante, la información pública disponible es muy limitada: la model card no detalla la arquitectura interna de los tres componentes, los datos de entrenamiento ni los métodos de alineación, y los benchmarks declarados no están verificados por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada "System 1.5" de tres modelos (4B + 9B + 27B); arquitectura interna no disponible |
| Parametros totales | 4B + 9B + 27B (cascada); total agregado no disponible |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 declarado; no se detallan otras cuantizaciones |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (peso declarado de 60,4 GB en BF16) |

## Arquitectura y entrenamiento
La model card describe una "System 1.5 Cascade" compuesta por tres modelos de 4B, 9B y 27B parámetros en BF16, con un total de 60,4 GB. Se mencionan componentes técnicos específicos: inferencia causal mediante operadores do(X) (nomenclatura propia de los modelos causales de Pearl), control de riesgo conformal de tipo split-conformal con alfa = 0,0001 y certificados criptográficos de veredicto PCVC-v20 con criptografía post-cuántica. No se especifica si los tres componentes son transformers densos, híbridos o de otra naturaleza, ni cómo se combinan sus salidas en la cascada.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre el proceso de destilación o ajuste de cada componente. Tampoco se detalla el mecanismo exacto de calibración conformal ni cómo se generan y verifican los certificados PCVC-v20. Estos elementos se anuncian como innovaciones, pero su implementación no es auditable a partir de la información disponible.

## Capacidades
- Clasificación de texto y emisión de veredictos en tareas de evaluación de decisiones (LLM-as-a-judge).
- Función de reward model para puntuar salidas de otros modelos o sistemas.
- Razonamiento causal declarado mediante operadores do(X), orientado a distinguir correlación de causalidad en la evaluación.
- Control de riesgo conformal con garantía de cobertura declarada del 99,99 %.
- Generación de certificados criptográficos de veredicto (PCVC-v20) con mención a criptografía post-cuántica.
- Cobertura de marcos regulatorios y estándares: KRITIS, NIS2, EU AI Act y NATO STANAG.
- Multilingüe en inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Auditoría de cumplimiento NIS2: el modelo puede clasificar y emitir veredictos sobre decisiones de gestión de incidentes y evaluar si una organización cumple los requisitos del marco, generando un certificado PCVC-v20 como evidencia trazable.
- Evaluación de riesgo en infraestructuras críticas (KRITIS): uso como juez automatizado para revisar decisiones operativas en sectores regulados y documentar la justificación con control conformal de cobertura.
- Revisión de conformidad con el EU AI Act: clasificación de sistemas y prácticas de IA según los niveles de riesgo del reglamento, con veredictos auditables para expedientes de conformidad.
- Validación de documentación militar bajo NATO STANAG: el modelo declara cobertura específica de estándares STANAG, adecuado para clasificar y evaluar documentación técnica de defensa en inglés y alemán.
- Reward model en pipelines de RLHF: puntuación de respuestas de otros modelos en fases de alineación, aprovechando su función de juez y su calibración conformal.
- Moderación y clasificación de contenido en entornos multilingües europeos: cobertura de en, de y pl para clasificar contenido en organizaciones con presencia en Europa central y del norte.
- Generación de evidencia para auditorías internas: los certificados criptográficos permiten adjuntar pruebas verificables a informes de auditoría, reduciendo la dependencia de registros manuales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros):

| Benchmark | Metrica | Valor |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones, 94 modelos) | Precision media externa (%) | 98,95 |
| Wave-15 Military/NATO STANAG (8 suites) | Precision (%) | 100,00 |
| Wave-16 Adversarial Omega (8 suites) | Precision (%) | 100,00 |
| Wave-17 Singularity Causal do(X) (12 suites) | Precision (%) | 100,00 |
| Consumo energetico verificado (NVIDIA H100 80GB HBM3) | Julios por decision | 9,10 |

No se han publicado resultados de benchmarks independientes ni comparaciones con modelos de referencia en la información disponible. Los valores del 100 % en las olas 15, 16 y 17 y la métrica de energía deben interpretarse como cifras declaradas por el autor, sin verificación externa.

## Requisitos de hardware
- VRAM estimada para inferencia: el peso declarado en BF16 es de 60,4 GB para la cascada completa; se requiere al menos esa cantidad más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA H100 80GB HBM3 es la plataforma citada por el autor para la medición de 9,10 J/decision; una A100 80GB sería el mínimo razonable para cargar la cascada completa en BF16.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en BF16 sin cuantización; no se documentan versiones GGUF ni cuantizadas.
- Opciones de despliegue: se declara compatibilidad con transformers y endpoints_compatible; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; solo se publica el consumo energético por decisión (9,10 J) en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict Committee v20.0 | Cascada 4B + 9B + 27B | no disponible | Juez / reward model con causalidad y conformal | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face (0 descargas) |
| Alternativas de reward model y LLM-as-a-judge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (jueces auditables con garantías conformales y certificación criptográfica) en la documentación proporcionada. La comparativa con modelos estándar de clasificación o reward modeling no puede establecerse con rigor sin datos verificables.

## Limitaciones y advertencias
- Los benchmarks declarados (98,95 % y 100 % en varias olas) no están verificados por terceros y proceden exclusivamente del autor.
- No se documenta la arquitectura interna de los tres componentes de la cascada, lo que impide evaluar su reproducibilidad.
- La licencia "skopion-sovereign-kritis-audit-license-v1.0" es de tipo "other"; no se detallan los términos de uso comercial, por lo que es imprescindible revisar el enlace de licencia antes de cualquier despliegue en producción.
- Cobertura lingüística limitada a inglés, alemán y polaco; no se declara soporte para castellano.
- No hay información sobre sesgos, tasas de alucinación ni metodología de evaluación de robustez adversarial más allá de la ola 16 declarada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin evidencia de uso independiente ni validación comunitaria.
- Las afirmaciones sobre criptografía post-cuántica y certificados PCVC-v20 no van acompañadas de especificación técnica pública en la información disponible.
- El contexto máximo no está documentado, lo que dificulta planificar su uso en documentos largos de auditoría.
- No se documentan formatos cuantizados, lo que limita el despliegue en hardware distinto de GPUs de 80 GB.

## Enlaces
- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v20.0-singularity
- Portal oficial (inglés): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal oficial (Polonia): https://skopion.pl
- Licencia: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Contacto: kontakt@skopion.pl / kontakt@skopion.de
