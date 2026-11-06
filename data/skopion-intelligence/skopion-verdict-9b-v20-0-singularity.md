# SKOPION-Intelligence/skopion-verdict-9b-v20.0-singularity

## Resumen

SKOPION Verdict 9B v20.0 Singularity es un modelo de clasificación de texto y evaluación automática (LLM-as-a-judge / reward model) desarrollado por SKOPION-Intelligence, orientado a la auditoría de cumplimiento normativo en entornos regulados europeos. El modelo se presenta como una herramienta de veredicto con garantías de cobertura conformal del 99,99% (alpha = 0,0001) y emisión de certificados criptográficos de veredicto (PCVC-v20), lo que lo posiciona en el nicho de la evaluación auditable y trazable de decisiones automatizadas.

Con 9.000 millones de parámetros en precisión BF16 y variantes Edge-FP8, el modelo se distribuye con pesos de 18,3 GB e incorpora adaptadores DoRA/LoRA junto con mecanismos de inferencia causal `do(X)`. Su enfoque declarado abarca marcos como KRITIS, NIS2, EU AI Act y estándares militares NATO STANAG, además de criptografía post-cuántica y predicción conformal. Los idiomas declarados son inglés, alemán y polaco.

El modelo es relevante en el contexto actual de exigencia regulatoria (EU AI Act, NIS2) porque propone un pipeline de evaluación con garantías estadísticas formales y certificación criptográfica, algo poco habitual en modelos de esta categoría. No obstante, la información pública disponible es limitada y los resultados declarados no están verificados de forma independiente, por lo que debe evaluarse con cautela antes de un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (implícito por la denominación "9B" y el uso de DoRA/LoRA); detalles de arquitectura no disponibles |
| Parámetros totales | 9B |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Edge-FP8 (declarados); no se detallan otros formatos |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (license: other) |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros); tamaño declarado 18,3 GB |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de la escala de 9B parámetros y el uso de adaptadores Deep DoRA/LoRA sobre una base no especificada. El modelo incorpora un componente de inferencia causal `do(X)` (denominado "Singularity Causal") que, según la model card, se evalúa en las suites Wave-17. También declara integración de predicción conformal con control de riesgo split-conformal a alpha = 0,0001 y emisión de certificados criptográficos de veredicto (PCVC-v20), lo que sugiere un pipeline de post-procesado con garantías estadísticas más que una innovación puramente arquitectónica.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Clasificación de texto y emisión de veredictos binarios o categóricos orientados a cumplimiento normativo.
- Evaluación automática tipo LLM-as-a-judge y modelo de recompensa (reward model).
- Inferencia causal `do(X)` declarada para análisis contrafactual en las suites Wave-17.
- Predicción conformal con garantía de cobertura del 99,99% (alpha = 0,0001).
- Emisión de certificados criptográficos de veredicto (PCVC-v20) con criptografía post-cuántica declarada.
- Soporte multilingüe limitado a inglés, alemán y polaco.
- Cobertura declarada de marcos KRITIS, NIS2, EU AI Act y NATO STANAG.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo puede clasificar evidencias y documentación de proveedores para determinar si cumplen los requisitos de la directiva, aprovechando su entrenamiento declarado en marcos regulatorios europeos y su salida de veredicto con certificado criptográfico.
- Evaluación de sistemas de IA conforme al EU AI Act: uso como juez automático para clasificar riesgos y conformidad de modelos o pipelines, con garantía conformal que acota la tasa de error a alpha = 0,0001.
- Triaje de incidentes en infraestructuras críticas (KRITIS): clasificación de alertas y eventos de seguridad para priorizar respuesta, con veredictos trazables y auditables.
- Validación de proveedores y terceros: generación de veredictos reproducibles sobre cuestionarios y políticas de seguridad, con certificados que permiten auditoría posterior.
- Evaluación de modelos en pipelines de MLOps: uso como reward model o juez en la selección y monitorización de modelos desplegados, aprovechando la salida conformal para controlar falsos positivos.
- Análisis contrafactual en investigación de incidentes: aplicación del componente `do(X)` para estimar el efecto de cambios en políticas o controles sobre el veredicto de cumplimiento.
- Clasificación documental multilingüe (en/de/pl): procesamiento de normativa y documentación en los tres idiomas soportados para entornos con presencia en Alemania y Polonia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones) | Precisión media (%) | 98,78 |
| Wave-15 Military STANAG, Wave-16 Adversarial Omega y Wave-17 Singularity Causal do(X) | Precisión (%) | 100,00 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los valores anteriores corresponden a suites propietarias del autor y no son comparables directamente con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,3 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en Edge-FP8: aproximadamente 9-10 GB de pesos; cabe en GPUs consumer de 16 GB o superiores, sujeto a overhead.
- GPUs recomendadas: NVIDIA H100 y L40S son las referenciadas por el autor (consumo declarado de 2,08 J por decisión). Para desarrollo, una RTX 4090 (24 GB) es suficiente en BF16 o FP8.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en BF16 y en GPUs de 16 GB en FP8, según estimación a partir del tamaño de pesos.
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; solo se declara el consumo energético de 2,08 J por decisión en H100/L40S.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 9B v20.0 Singularity | 9B | no disponible | Clasificación / judge con conformal y certificados | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face (0 descargas) |
| Alternativas de judge/reward model de 7-9B | no disponible | no disponible | LLM-as-a-judge genérico | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría. La licencia propietaria y la ausencia de benchmarks públicos comparables dificultan la comparación directa.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index).
- Las suites de evaluación son propietarias (Strict-98, Wave-15/16/17), lo que impide la reproducibilidad y comparación con benchmarks estándar.
- La licencia `skopion-sovereign-kritis-audit-license-v1.0` es propietaria; deben revisarse las condiciones de uso comercial, redistribución y despliegue antes de cualquier uso en producción.
- Solo se declaran tres idiomas (en, de, pl); el rendimiento fuera de ellos no está documentado.
- No se especifican la longitud de contexto, el proceso de entrenamiento ni los datos utilizados, lo que limita la evaluación de sesgos y riesgos de alucinación.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin evidencia de validación por parte de la comunidad.
- La garantía conformal del 99,99% depende de supuestos de intercambiabilidad de los datos; su validez en distribuciones distintas a las de calibración no está garantizada.
- El uso de certificados criptográficos y criptografía post-cuántica no ha sido auditado de forma independiente según la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v20.0-singularity
- Portal oficial (programa de investigación): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal SKOPION Polonia: https://skopion.pl
- Contacto: kontakt@skopion.pl / kontakt@skopion.de
