# SKOPION-Intelligence/skopion-verdict-4b-v21.0-omniprover-nano-ternary-1.58b

## Resumen

SKOPION Verdict 4B v21.0 OMNI-PROVER Nano-Ternary 1.58b es un modelo de clasificación de texto y juicio determinista (llm-as-a-judge / reward model) desarrollado por SKOPION Intelligence, una iniciativa europea centrada en modelos de decisión soberanos para cumplimiento normativo y verificación formal. El modelo se presenta como parte de la familia SKOPION Verdict (4B, 9B, 27B y una cascada especulativa System 1.5) y está orientado a tareas de auditoría regulatoria (KRITIS, NIS2, EU AI Act, NATO STANAG), verificación formal de pruebas (Lean 4, Z3, TLA+) y attestation criptográfica con pruebas zk-STARK.

La variante v21.0 introduce cuantización ternaria de 1.58 bits con pesos en {-1, 0, +1}, lo que reduce el artefacto publicado a 1.12 GB para un modelo de 4B parámetros. El autor declara entrenamiento con FP-GRPO y un esquema de control de riesgo conformal split-conformal con alpha = 0.00001 (99.999 %). El modelo está pensado para despliegue en hardware de borde (HP ZGX Nano AI, Jetson Orin NX, IPC industrial) con un consumo declarado de 0.68 julios por decisión.

Es relevante ahora porque combina tres tendencias activas: modelos pequeños y cuantizados para edge, evaluación determinista tipo juez/reward model en pipelines de agentes, y requisitos de trazabilidad y attestation criptográfica derivados del EU AI Act y NIS2. No obstante, la información pública disponible es escasa y procede casi exclusivamente del propio autor, por lo que las cifras deben tratarse como declaraciones no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles); cuantización ternaria 1.58-bit con pesos {-1, 0, +1} |
| Parametros totales | 4B (según el autor) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1.58-bit (artefacto de 1.12 GB); no se detallan otras variantes |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, "other") |
| Formato de pesos | no disponible (librería transformers; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "transformer" y del esquema de cuantización ternaria de 1.58 bits. El autor indica que el modelo se entrena con FP-GRPO (una variante de GRPO con precisión completa) y que incorpora un componente denominado PCVC-v21-zkSTARK, que asocia a cada decisión una attestation criptográfica con pruebas zk-STARK (DEEP-FRI de 128 bits) y firmas post-cuánticas FIPS-204 ML-DSA-87 y FIPS-205 SLH-DSA. También se declara un control de riesgo conformal split-conformal con alpha = 0.00001.

No se publican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni detalles sobre el proceso de alineación (RLHF/DPO) más allá de la mención a FP-GRPO. Las "innovaciones" declaradas (verificación formal con Lean 4/Z3/TLA+, attestation zk-STARK, tolerancia bizantina BFT y SLSA L4) aparecen como capacidades del sistema más que como detalles verificables de la arquitectura del modelo.

## Capacidades

- Clasificación de texto y emisión de veredictos deterministas (pipeline text-classification).
- Juicio y evaluación tipo llm-as-a-judge y reward model para pipelines de agentes.
- Verificación formal declarada sobre Lean 4, Z3 y TLA+ (Wave-18).
- Attestation confidencial con zk-STARK (Wave-19) y tolerancia bizantina BFT con SLSA L4 (Wave-20).
- Cumplimiento normativo declarado para KRITIS, NIS2, EU AI Act y NATO STANAG.
- Control de riesgo conformal con alpha = 0.00001 (99.999 %).
- Soporte multilingüe limitado a inglés, alemán y polaco.
- No se declara soporte de tool calling, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo puede clasificar evidencias y emitir veredictos de conformidad sobre controles de ciberseguridad, con attestation criptográfica asociada a cada decisión para trazabilidad regulatoria.
- Evaluación de riesgos del EU AI Act: uso como juez determinista para clasificar sistemas de IA según categorías de riesgo, aprovechando el control conformal declarado para acotar la tasa de error.
- Verificación formal en pipelines de desarrollo: integración como paso de validación de pruebas Lean 4, Z3 o TLA+ en CI/CD, emitiendo un veredicto por obligación de prueba.
- Reward model en pipelines de agentes: puntuación de trayectorias y respuestas en sistemas multi-agente, con veredictos reproducibles y firmados criptográficamente.
- Despliegue en borde para infraestructura crítica (KRITIS): inferencia en Jetson Orin NX o IPC industrial con un consumo declarado de 0.68 J por decisión, adecuado para entornos con restricciones energéticas.
- Triaje documental multilingüe (en/de/pl): clasificación de documentación regulatoria en los tres idiomas soportados para flujos de cumplimiento en la UE.
- Attestation de decisiones en entornos regulados: registro de veredictos con firmas post-cuánticas (ML-DSA-87, SLH-DSA) para auditorías a largo plazo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Strict-118 External Decision, Formal Proving & Judge Benchmark Matrix (120 suites / 35.340 evaluaciones) | Accuracy media (%) | 99,06 |
| Wave-18 Lean-4/Z3/TLA+ Formal Proving, Wave-19 zk-STARK Confidential y Wave-20 Byzantine BFT (%) | Accuracy (%) | 100,00 |

No se han publicado en la información disponible resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros) ni comparaciones independientes.

## Requisitos de hardware

- El artefacto publicado ocupa 1,12 GB en cuantización ternaria 1.58-bit, por lo que la huella de memoria es muy reducida en comparación con un modelo de 4B en FP16.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del artefacto, cabría en GPUs de consumo con 4-8 GB, aunque no se confirma en la documentación.
- GPUs recomendadas por el autor: despliegue en borde sobre HP ZGX Nano AI, Jetson Orin NX e IPC industrial; no se listan A100, H100 ni RTX 4090.
- Consumo declarado: 0,68 julios por decisión en el hardware de borde indicado.
- Opciones de despliegue: librería transformers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 4B v21.0 OMNI-PROVER | 4B (ternario 1.58-bit) | no disponible | Juez/reward determinista, verificación formal, cumplimiento UE | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face (0 descargas) |
| SKOPION Verdict 4B v15.0 Pico-INT4 | 4B | no disponible | Juez/reward, cumplimiento UE, edge | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| Familia SKOPION Verdict 9B / 27B | 9B / 27B | no disponible | Juez/reward, cumplimiento UE | skopion-sovereign-kritis-audit-license-v1.0 | GitHub / Hugging Face |
| Modelos juez de propósito general (p. ej. variantes de reward models open source) | no disponible | no disponible | Reward/judge genérico | variable | no disponible |

No se dispone de comparaciones independientes con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Todos los benchmarks y métricas proceden del autor y están marcados como no verificados (`verified: false`); no hay evaluación independiente.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que limita la evidencia de uso real.
- Idiomas limitados a inglés, alemán y polaco; no se declara cobertura de castellano.
- Licencia propia ("skopion-sovereign-kritis-audit-license-v1.0") con condiciones no detalladas en la información disponible; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- Las capacidades de verificación formal, zk-STARK y BFT se declaran como parte del sistema, pero no se documenta cómo se integran en el modelo en sí.
- No se especifican longitud de contexto, formato de pesos ni detalles de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinación y sesgos: no documentado por el autor; en un modelo juez con veredictos deterministas, los errores de clasificación pueden propagarse a decisiones de cumplimiento.
- Posible dependencia del ecosistema propietario SKOPION (attestation, firmas post-cuánticas) para aprovechar las capacidades declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v21.0-omniprover-nano-ternary-1.58b
- GitHub de la organización: https://github.com/SKOPION-Intelligence/
- Repositorio de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío JevBench / Decision Index 0.4: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- DOI del registro Zenodo: https://doi.org/10.5281/zenodo.24009481
- DOI conceptual: https://doi.org/10.5281/zenodo.24005152
- DOI v20.0.0: https://doi.org/10.5281/zenodo.24005153
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Portal EN: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal DE: https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal PL: https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- Licencia: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Modelo previo relacionado: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-pico-int4
