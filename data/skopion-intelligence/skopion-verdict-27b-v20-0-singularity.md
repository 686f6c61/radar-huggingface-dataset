# SKOPION-Intelligence/skopion-verdict-27b-v20.0-singularity

## Resumen

SKOPION Verdict 27B v20.0 Singularity es un modelo de clasificación de texto y evaluación (LLM-as-a-judge y reward model) publicado por SKOPION-Intelligence, con 27.000 millones de parámetros y pesos en BF16 (54,8 GB). Está diseñado específicamente para emitir veredictos de cumplimiento normativo y auditoría en entornos regulados: KRITIS (infraestructuras críticas alemanas), NIS2, EU AI Act y estándares militares NATO STANAG. No es un modelo conversacional generalista, sino un clasificador de decisiones con salida verificable.

La propuesta diferencial del autor es la combinación de inferencia causal mediante intervenciones `do(X)`, control de riesgo conformal con cobertura declarada del 99,99 % (alfa = 0,0001) y certificados criptográficos de veredicto ("Proof-Carrying Cryptographic Verdict Certificates", PCVC-v20), además de etiquetas relacionadas con criptografía post-cuántica. El modelo declara un consumo verificado de 6,80 julios por decisión sobre NVIDIA H100 80GB HBM3.

Es relevante ahora porque cubre un nicho poco atendido: la evaluación automática auditable de decisiones en sectores con obligaciones regulatorias estrictas, donde la trazabilidad y la garantía estadística de cobertura importan tanto como la precisión. La información pública disponible es escasa y procede casi exclusivamente de la model card del autor; no se detallan la arquitectura base, el dataset de entrenamiento ni la composición de los benchmarks más allá de los agregados declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer causal, sin confirmar) |
| Parámetros totales | 27B |
| Parámetros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (tamaño declarado 54,8 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura base del modelo. Los metadatos indican `library_name: transformers` y un pipeline de `text-classification`, con un tamaño de 27B parámetros en BF16. El autor menciona un proceso de ajuste mediante "Deep DoRA/LoRA", intervenciones causales `do(X)` y el esquema PCVC-v20, así como fases de desarrollo numeradas (Phases 67–75) que sugieren un ciclo de iteraciones internas. No se indica el modelo preentrenado sobre el que se aplica el ajuste, ni el número de tokens de entrenamiento, ni la composición del dataset.

Las innovaciones declaradas son tres: (1) inferencia causal con intervenciones `do(X)`, presentada como base de la "Wave-17 Singularity Causal"; (2) control de riesgo conformal split-conformal con cobertura del 99,99 % y alfa = 0,0001; y (3) certificados criptográficos de veredicto (PCVC-v20) que acompañarían a cada decisión. No se aportan detalles técnicos sobre cómo se implementan estas garantías, ni artefactos reproducibles más allá de la propia model card.

## Capacidades

- Clasificación de texto y emisión de veredictos de decisión (pipeline `text-classification`).
- Evaluación como LLM-as-a-judge y modelo de recompensa (reward model).
- Razonamiento causal con intervenciones `do(X)` según la documentación del autor.
- Evaluación de cumplimiento normativo en marcos KRITIS, NIS2 y EU AI Act.
- Evaluación frente a estándares militares NATO STANAG.
- Control de riesgo conformal con garantía de cobertura declarada del 99,99 %.
- Generación de certificados criptográficos de veredicto (PCVC-v20).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Auditoría de cumplimiento KRITIS: el modelo puede clasificar decisiones y configuraciones de infraestructuras críticas alemanas frente a los requisitos del marco KRITIS, emitiendo un veredicto con certificado criptográfico que sirve como evidencia auditable.
- Evaluación de conformidad con el EU AI Act: uso como juez automático para clasificar sistemas de IA según categorías de riesgo y documentar la decisión con la garantía de cobertura conformal declarada.
- Triaje de incidentes NIS2: clasificación de notificaciones y eventos de ciberseguridad para determinar si constituyen incidentes significativos bajo NIS2, con trazabilidad de la decisión.
- Evaluación de proveedores y terceros: uso como reward model o judge para puntuar respuestas y artefactos de terceros en procesos de due diligence regulatoria, aprovechando el pipeline de clasificación.
- Verificación de cumplimiento en entornos militares: clasificación de documentación y procedimientos frente a estándares NATO STANAG, según la "Wave-15 Military" declarada por el autor.
- Control de calidad de pipelines de IA generativa: uso como evaluador automático (LLM-as-a-judge) en producción para filtrar salidas que incumplan políticas internas, con certificados de veredicto como registro de auditoría.
- Evaluación de riesgo con garantías estadísticas: en escenarios donde se exige una cota de error formal, el control conformal declarado permite usar el modelo como clasificador con cobertura objetivo del 99,99 %, siempre que se valide de forma independiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones, 94 modelos) | Exactitud media (%) | 98,95 |
| Wave-15 Military/NATO STANAG (8 suites) | Exactitud (%) | 100,00 |
| Wave-16 Adversarial Omega (8 suites) | Exactitud (%) | 100,00 |
| Wave-17 Singularity Causal do(X) (12 suites) | Exactitud (%) | 100,00 |

El autor declara además 6,80 julios por decisión sobre NVIDIA H100 80GB HBM3. No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones verificables con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requiere al menos una GPU de 80 GB.
- GPU recomendadas: NVIDIA H100 80GB HBM3 (la única mencionada explícitamente por el autor, con 6,80 J/decisión); A100 80GB como alternativa plausible por capacidad de memoria.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16; requeriría cuantización, y el autor no publica variantes cuantizadas.
- Opciones de despliegue: compatible con `transformers`; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; solo se declara el consumo energético por decisión.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La categoría (juez/evaluador especializado en cumplimiento regulatorio con garantías conformales y certificados criptográficos) no tiene equivalentes públicos claros en los datos disponibles. Comparativa: no disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks (98,95 % y 100 %) están declarados por el autor y marcados como `verified: false`; no hay reproducción independiente.
- La model card no especifica arquitectura base, dataset de entrenamiento, número de tokens ni proceso de alineación, lo que impide evaluar la procedencia de las capacidades.
- El modelo solo declara soporte para inglés, alemán y polaco; el rendimiento fuera de esos idiomas es desconocido.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es propietaria ("other"); las condiciones de uso comercial deben consultarse en el enlace oficial antes de cualquier despliegue en producción.
- Riesgo de alucinación en un modelo de clasificación/juez: no cuantificado ni documentado; en contextos regulatorios, un falso positivo o negativo tiene consecuencias legales.
- La garantía de cobertura conformal del 99,99 % depende de supuestos de intercambiabilidad entre datos de calibración y producción que no se detallan; debe validarse empíricamente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- El tamaño de 27B en BF16 (54,8 GB) limita el despliegue a hardware de gama alta y encarece la inferencia frente a clasificadores especializados más pequeños.
- No se documentan sesgos conocidos ni evaluaciones de robustez adversarial más allá de la "Wave-16 Adversarial Omega" declarada.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v20.0-singularity
- Portal oficial del programa: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal SKOPION Polonia: https://skopion.pl
- Contacto: kontakt@skopion.pl / kontakt@skopion.de
- Dataset de referencia declarado: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites
- Banner oficial: https://raw.githubusercontent.com/SKOPION-Intelligence/.github/main/profile/skopion-official-banner.png
