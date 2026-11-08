# SKOPION-Intelligence/skopion-verdict-4b-v22.0-horizon-nano-ternary-1.58b

## Resumen
SKOPION Verdict 4B v22.0 ABSOLUTE-HORIZON Nano-Ternary 1.58b es un modelo de clasificación de texto desarrollado por SKOPION Intelligence (Bartosz Joachimiak) como parte de su programa de investigación en IA para decisión y seguridad defensiva. No es un generador de texto libre, sino un modelo de decisión tipada orientado a tareas de verificación formal, auditoría de cumplimiento normativo europeo y evaluación automatizada (llm-as-a-judge, reward modeling).

El modelo se presenta con una escala nominal de 4B parámetros cuantizados en precisión ternaria de 1.58 bits (valores {-1, 0, +1}), lo que resulta en un artefacto de 1.12 GB. Está especializado en dominios muy concretos: verificación formal en TLA+, Coq y Lean 4, pruebas de conocimiento cero aplicadas a ML (zkML con EZKL/Halo2 y RISC Zero zkVM), criptografía post-cuántica según los estándares FIPS 203/204/205, y marcos regulatorios europeos como KRITIS, NIS2, DORA y el EU AI Act.

Su relevancia radica en el enfoque hacia despliegue en entornos de borde (edge) con atestación criptográfica y control de riesgo conformal, apuntando a casos de auditoría soberana y verificación de decisiones en infraestructuras críticas. El modelo declara soporte para inglés, alemán y polaco, y se distribuye bajo una licencia propia denominada skopion-sovereign-kritis-audit-license-v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cuantización ternaria (1.58-bit, valores {-1, 0, +1}); detalles de capas y atención no disponibles |
| Parametros totales | 4B (nominal, según model card) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1.58-bit nativa (artefacto de 1.12 GB); otros formatos no disponibles |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, "other") |
| Formato de pesos | no disponible (librería transformers; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento
La información disponible indica que se trata de un transformer con pesos ternarios de 1.58 bits, técnica de cuantización extrema que reduce el espacio de almacenamiento a 1.12 GB para una escala nominal de 4B parámetros. La model card menciona explícitamente "FP-GRPO" como parte del pipeline, lo que sugiere un proceso de optimización de preferencias (GRPO, Group Relative Policy Optimization) aplicado sobre el modelo, aunque no se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni el esquema completo de alineación.

El autor declara la integración de mecanismos de atestación criptográfica (PCVC-v22-zkSTARK con DEEP-FRI de 128 bits y primitivas post-cuánticas FIPS 203 ML-KEM-1024, FIPS 204 ML-DSA-87 y FIPS 205 SLH-DSA) y control de riesgo conformal split-conformal con alpha = 0.000001. No se especifican innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal, ni se detalla la composición del corpus de entrenamiento más allá de las referencias a dominios de verificación formal, zkML y cumplimiento normativo.

## Capacidades
- Clasificación de texto y emisión de veredictos tipados orientados a decisión (pipeline text-classification).
- Verificación formal y síntesis en TLA+, Coq y Lean 4 (declarado como Wave-21 en la model card).
- Evaluación de circuitos y pruebas zkML en EZKL/Halo2 y RISC Zero zkVM (Wave-22).
- Validación de conformidad con criptografía post-cuántica FIPS 203/204/205 (Wave-23).
- Evaluación de cumplimiento normativo en KRITIS, NIS2, DORA y EU AI Act.
- Uso como llm-as-a-judge y reward model en pipelines de evaluación.
- Capacidades multilingües limitadas a inglés, alemán y polaco.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión ni audio.
- No se declara modo thinking ni razonamiento extendido.

## Casos de uso
- Auditoría de cumplimiento NIS2 y DORA: el modelo puede clasificar evidencias documentales y emitir veredictos estructurados sobre conformidad regulatoria, aprovechando su especialización declarada en estos marcos y su naturaleza de clasificador tipado en lugar de generador libre.
- Verificación formal de especificaciones: integrado en pipelines de CI que validen propiedades en TLA+, Coq o Lean 4, el modelo puede actuar como evaluador de artefactos de prueba y síntesis formal, según los resultados declarados en Wave-21.
- Evaluación de circuitos zkML: en flujos de auditoría de pruebas de conocimiento cero (EZKL/Halo2, RISC Zero zkVM), el modelo puede clasificar y validar artefactos criptográficos como juez automatizado.
- Validación de implementaciones post-cuánticas: para equipos que migran a ML-KEM, ML-DSA o SLH-DSA, el modelo puede clasificar conformidad con FIPS 203/204/205 en revisiones de código y configuraciones.
- Despliegue en borde para infraestructuras críticas: con 1.12 GB de pesos y un consumo declarado de 0.66 J por decisión en HP ZGX Nano AI, Jetson Orin NX o IPC de borde, encaja en escenarios KRITIS con requisitos de eficiencia energética y atestación criptográfica.
- Evaluación automatizada de modelos (llm-as-a-judge): puede emplearse como reward model o juez en pipelines de evaluación interna, con control de riesgo conformal declarado a alpha = 0.000001.
- Clasificación documental multilingüe en entornos DACH y Polonia: cobertura de en, de y pl para triaje de evidencias y dictámenes en organizaciones centroeuropeas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Strict-148 External Decision (150 suites / 44.340 evaluaciones) | Accuracy media (%) | 99,37 |
| Wave-21 TLA+/Coq/Lean 4 + Wave-22 EZKL/RISC Zero zkML + Wave-23 FIPS 203/204 PQC | Accuracy (%) | 100,00 |

No se han publicado en la información disponible resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) ni comparaciones verificadas con modelos de referencia.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto de pesos ocupa 1.12 GB, por lo que la huella en memoria es reducida, pero no se detalla el overhead de activaciones ni el contexto.
- GPU recomendadas: no se especifican GPU de datacenter (A100, H100). El autor declara despliegue verificado en HP ZGX Nano AI, Jetson Orin NX e IPC de borde.
- Compatibilidad con GPU de consumo: plausible por tamaño (1.12 GB de pesos), pero no confirmada en la información disponible.
- Opciones de despliegue: librería transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Consumo energético declarado: 0,66 J por decisión en el hardware de borde indicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SKOPION Verdict 4B v22.0 Horizon Nano-Ternary | 4B (1.58-bit, 1.12 GB) | no disponible | Clasificación de decisión, verificación formal, cumplimiento | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face (0 descargas) |
| SKOPION Verdict 4B v20.0 Singularity Nano-Ternary | 4B (1.58-bit) | no disponible | Versión previa del mismo programa (causal-inference, llm-as-a-judge) | skopion-sovereign-kritis-audit-license-v1.0 | Hugging Face |
| Modelos de clasificación de decisión / reward models de propósito general | no disponible | no disponible | Clasificación y evaluación | variables | no disponible |

No se dispone de comparaciones verificadas con modelos de la misma categoría fuera del propio programa SKOPION; los datos de alternativas genéricas no están disponibles en la información proporcionada.

## Limitaciones y advertencias
- Los benchmarks declarados (99,37% y 100%) están marcados como no verificados y proceden del propio autor; deben tratarse con cautela hasta su replicación independiente.
- El modelo es un clasificador de decisión tipada, no un generador de texto libre; no debe emplearse como chatbot o asistente conversacional general.
- Cobertura lingüística limitada a inglés, alemán y polaco; no se declara soporte de castellano.
- Licencia propia (skopion-sovereign-kritis-audit-license-v1.0) con posibles restricciones para uso comercial; es necesario revisar los términos en el enlace oficial antes de cualquier despliegue en producción.
- No se detallan datos de entrenamiento, composición del corpus ni esquema completo de alineación, lo que dificulta evaluar sesgos y riesgo de alucinación en tareas fuera de su dominio.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha; no hay evidencia de adopción ni validación por terceros.
- La terminología de la model card (rankings globales, "six-nines", "absolute horizon") no está respaldada por evaluaciones independientes en la información disponible.
- No se especifican requisitos de contexto, latencia ni formatos de pesos alternativos, lo que limita la planificación de despliegue en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v22.0-horizon-nano-ternary-1.58b
- Versión previa v20.0: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity-nano-ternary-1.58b
- Programa de investigación (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Programa de investigación (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Programa de investigación (PL): https://skopion.de/pl/badania-innowacje/program-badawczy-ai-skopion-verdict
- DOI principal (Zenodo): https://doi.org/10.5281/zenodo.24009481
- DOI conceptual (Zenodo): https://doi.org/10.5281/zenodo.24005152
- Comunidad Zenodo: https://zenodo.org/communities/skopion-intelligence/
- Dataset de benchmarks en Kaggle: https://www.kaggle.com/datasets/skopionintelligence/skopion-verdict-v20-singularity-benchmarks
- Repositorio GitHub de benchmarks: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks
- Envío JevBench / Decision Index: https://github.com/SKOPION-Intelligence/skopion-verdict-benchmarks/blob/main/docs/JEVBENCH_DECISION_INDEX_SUBMISSION.md
- ORCID del autor: https://orcid.org/0009-0002-1713-9490
