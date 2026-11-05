# SKOPION-Intelligence/README

## Resumen

SKOPION Verdict es una familia de modelos de decisión deterministas, jueces de cumplimiento normativo y modelos de recompensa desarrollada por SKOPION Intelligence, una organización con sede en Mönchengladbach (Renania del Norte-Westfalia, Alemania) y código de participante en la UE (PIC) 861665939. La familia se compone de variantes de 4B, 9B y 27B parámetros, además de un sistema en cascada especulativa denominado "System 1.5 Speculative Cascade Committee". El modelo está orientado a infraestructuras críticas (KRITIS), cumplimiento del Reglamento de IA de la UE (Anexo IV), auditoría de migración a criptografía post-cuántica y toma de decisiones por pares sin sesgo posicional.

La propuesta diferencial es la garantía matemática de control de riesgo conformal con α = 0.01 y el enrutamiento explícito a revisión humana mediante la etiqueta `[ABSTAIN_HUMAN_REVIEW]`, junto con una consistencia posicional del 99,97% medida sobre 35 suites de pares intercambiados (solo 2 inversiones sobre 5.405 pares). El modelo se distribuye en variantes BF16 nativas, así como en cuantizaciones Edge-INT8 y Pico-INT4 orientadas a despliegue en el borde con consumos declarados de hasta 1,88 julios por decisión a 11,4 ms de latencia.

Es relevante en el contexto actual porque aborda un nicho poco cubierto por los LLM generativos: la decisión determinista y auditable en entornos regulados europeos, con manifiestos criptográficos SHA-256 de pesos y calibración. No obstante, la información pública disponible es limitada: el repositorio de Hugging Face consultado es únicamente una tarjeta de modelo sin pesos publicados, y los pesos neuronales se distribuyen bajo licencia empresarial soberana a operadores verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de decisión/juez; no se especifica si es transformer denso, MoE o híbrido) |
| Parámetros totales | 4B, 9B y 27B según variante; sistema en cascada con 82% de 4B y 18% de 27B |
| Parámetros activos | No disponible (la cascada no es un MoE; es un sistema de enrutamiento especulativo) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 nativo, Edge-INT8, Pico-INT4 |
| Idiomas soportados | No disponible (la documentación oficial se publica en DE, EN y PL, pero no se declaran idiomas del modelo) |
| Licencia | Sovereign Enterprise / KRITIS Audit Licensing (no es una licencia abierta; pesos bajo acuerdo con operadores verificados) |
| Formato de pesos | `.safetensors` junto con bundles de calibración conformal (no distribuidos públicamente) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo (tipo de transformer, número de capas, mecanismo de atención, uso de atención lineal o decodificación especulativa a nivel de token). La documentación describe el sistema "System 1.5 Speculative Cascade Committee" como una cascada que enruta aproximadamente el 82% de las consultas al modelo de 4B y el 18% restante al de 27B, con el objetivo de reducir el coste energético por decisión de 26,52 J a 8,38 J manteniendo una precisión media estricta del 94,86% frente al 94,95% del 27B nativo.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La documentación sí menciona explícitamente un mecanismo de control de riesgo conformal con α = 0.01, que proporciona una garantía matemática de cobertura y activa el enrutamiento `[ABSTAIN_HUMAN_REVIEW]` cuando la confianza cae por debajo del umbral. Se declaran además manifiestos criptográficos SHA-256 de pesos y calibración, y telemetría energética por decisión (julios/decisión) validada sobre infraestructura HPC RWTH Aachen CLAIX-2023 con GPUs NVIDIA H100 80GB HBM3 (proyecto rwth2219).

## Capacidades

- Clasificación y decisión determinista: emite veredictos binarios o multiclase con etiquetas de abstención explícita para revisión humana.
- Evaluación de cumplimiento normativo: verificación de conformidad con el Reglamento de IA de la UE (Anexo IV), NIS-2 y DORA.
- Autorización de comandos SCADA/IEC-60870-5-104 y triaje de anomalías en telemetría de red ENTSO-E.
- Enrutamiento de incidentes para CERT-EU y BSI.
- Auditoría de migración a criptografía post-cuántica: verificación de políticas ML-KEM/FIPS-203, ML-DSA/FIPS-204 y TLS híbrido.
- Modelo de recompensa y juez de pares: evaluación de respuestas con consistencia posicional del 99,97% sobre 5.405 pares bilaterales.
- Despliegue en el borde: variantes INT8 e INT4 con invariancia de decisión declarada del 100,0% respecto a BF16.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Autorización de comandos en subestaciones eléctricas: el modelo evalúa cada comando SCADA/IEC-60870-5-104 frente a políticas de seguridad y emite una decisión con abstención explícita cuando la confianza es insuficiente, lo que permite integrarlo como puerta de validación antes de la ejecución física.
- Triaje de anomalías en telemetría de red: procesa lecturas ENTSO-E y clasifica eventos anómalos para enrutarlos al operador correspondiente, aprovechando la consistencia posicional del 99,97% para evitar sesgos por orden de presentación de los datos.
- Enrutamiento de incidentes de ciberseguridad: clasifica y deriva incidentes hacia CERT-EU o BSI según criticidad y sector, con registro auditable de la decisión y de la calibración empleada.
- Auditoría de migración post-cuántica: verifica políticas criptográficas híbridas y configuraciones ML-KEM/ML-DSA en inventarios de infraestructura, generando informes de conformidad con FIPS-203 y FIPS-204.
- Validación de conformidad con el Reglamento de IA: actúa como juez de conformidad del Anexo IV en pipelines de certificación, con control de riesgo conformal α = 0.01 y derivación a revisión humana documentada.
- Despliegue en el borde en instalaciones remotas: la variante Pico-INT4 (2,25 GB, 1,88 J por decisión, 11,4 ms) permite ejecutar decisiones de seguridad en dispositivos como Jetson Orin NX o HP ZGX Nano AI sin conectividad a la nube.
- Modelo de recompensa en pipelines de RLHF: la consistencia posicional y la calibración conformal lo hacen adecuado como juez de pares en la evaluación de respuestas generadas por otros modelos.

## Benchmarks y rendimiento

| Modelo | Parámetros / runtime | Media estricta 54 suites | Consistencia posicional (5.405 pares) | KRITIS Wave-11/12 (3.900 ítems) | Energía (J/decisión) |
|---|---|---|---|---|---|
| SKOPION Verdict 27B v15.0 Native | 27B BF16 | 94,95% | 99,97% (2 inversiones) | 100,00% | 26,52 J (78,0 ms H100) |
| SKOPION Verdict Committee v15.0 | Cascada 82% 4B + 18% 27B | 94,86% | 99,97% (2 inversiones) | 100,00% | 8,38 J (28,4 ms H100) |
| baselabs/mammoth-1-27b | 27B juez generativo | 94,26% | 98,19% (76 inversiones) | 100,00% | 34,10 J |
| SKOPION Verdict 9B v15.0 Native | 9B BF16 / Edge-INT8 | 94,25% | 99,97% (2 inversiones) | 100,00% | 8,55 J (29,5 ms H100) |
| SKOPION Verdict 4B v15.0 Native | 4B BF16 (8,04 GB) | 94,04% | 99,97% (2 inversiones) | 100,00% | 3,87 J (14,6 ms H100) |
| SKOPION Verdict 4B Edge-INT8 | 4B INT8 (4,22 GB) | 94,02% | 99,97% (2 inversiones) | 100,00% | 3,14 J (12,8 ms) |
| SKOPION Verdict 4B Pico-INT4 | 4B INT4 (2,25 GB) | 93,97% | 99,97% (2 inversiones) | 100,00% | 1,88 J (11,4 ms Edge) |
| basal-omni-1.0-ultra-31b | 31B monolítico | 93,50% | 97,59% (101 inversiones) | 100,00% | 39,76 J |
| autotrust/jev-27b-v1.1 | 27B juez | 93,46% | 96,95% | 100,00% | 28,90 J |
| speakleash/bielik-11b-v3-bf16 | 11B LLM polaco | 82,93% | 81,40% | 84,60% | 14,20 J |

Los datos proceden exclusivamente de la tabla publicada por el autor en la model card. No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de LLM en la información disponible.

## Requisitos de hardware

- 27B BF16: aproximadamente 54 GB de VRAM en BF16 (estimación a partir del tamaño de parámetros); requiere A100 80GB, H100 80GB o múltiples GPUs. El autor reporta 78,0 ms por decisión en H100 80GB HBM3.
- 9B BF16: aproximadamente 18 GB en BF16; cabe en RTX 4090 (24 GB), L40S o A100 40GB. El autor reporta 29,5 ms por decisión en H100.
- 4B BF16: 8,04 GB declarados; cabe en RTX 4090, RTX 3090, L4 y GPUs consumer de 12 GB o más. 14,6 ms por decisión en H100.
- 4B Edge-INT8: 4,22 GB declarados; apto para RTX 4060 Ti, Jetson Orin NX y dispositivos de borde con 8 GB de memoria unificada.
- 4B Pico-INT4: 2,25 GB declarados; apto para HP ZGX Nano AI y Jetson Orin NX con 1,88 J por decisión y 11,4 ms de latencia.
- Opciones de despliegue: no se especifican frameworks compatibles (vLLM, llama.cpp, Ollama, TGI); los pesos se entregan como `.safetensors` con bundles de calibración conformal bajo licencia empresarial.
- Throughput: no disponible; solo se publica latencia por decisión y consumo energético.

## Comparativa con modelos similares

| Característica | SKOPION Verdict 27B v15.0 | baselabs/mammoth-1-27b | autotrust/jev-27b-v1.1 | basal-omni-1.0-ultra-31b |
|---|---|---|---|---|
| Parámetros | 27B | 27B | 27B | 31B |
| Tipo | Juez determinista con riesgo conformal | Juez generativo | Juez | Juez monolítico |
| Media estricta 54 suites | 94,95% | 94,26% | 93,46% | 93,50% |
| Consistencia posicional | 99,97% (2 inversiones) | 98,19% (76 inversiones) | 96,95% | 97,59% (101 inversiones) |
| Energía por decisión | 26,52 J | 34,10 J | 28,90 J | 39,76 J |
| Licencia | Empresarial soberana (no abierta) | No disponible | No disponible | No disponible |
| Disponibilidad de pesos | Bajo acuerdo con operadores verificados | No disponible | No disponible | No disponible |

La comparativa se basa únicamente en los datos publicados por el autor de SKOPION; no se ha verificado de forma independiente la existencia ni las métricas de los modelos competidores citados.

## Limitaciones y advertencias

- Los pesos no son de acceso público: el repositorio de Hugging Face contiene solo la model card y los manifiestos; la descarga requiere un acuerdo de licencia empresarial soberana con SKOPION Intelligence.
- Los benchmarks son autoinformados por el autor y no se han publicado resultados independientes que los validen.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide evaluar su idoneidad para casos multilingües o de contexto largo.
- No se detalla la arquitectura interna ni los datos de entrenamiento, lo que dificulta la reproducibilidad y la auditoría técnica por terceros.
- El modelo está diseñado para decisiones deterministas y clasificación, no para generación de texto abierta; no se declaran capacidades de tool calling, agentes o multimodalidad.
- El control de riesgo conformal α = 0.01 ofrece garantías estadísticas bajo supuestos de intercambiabilidad; su validez en distribuciones fuera de dominio no está documentada.
- La licencia restringe el uso comercial a operadores verificados, lo que limita su adopción por parte de la comunidad open source.
- Riesgo de alucinación no evaluado en la información disponible; el mecanismo de abstención mitiga parcialmente este riesgo en decisiones de alto impacto, pero no lo elimina.
- Sesgos conocidos: no documentados; la consistencia posicional del 99,97% sugiere baja sensibilidad al orden, pero no cubre otros ejes de sesgo (demográfico, geográfico o lingüístico).

## Enlaces

- Hugging Face (model card): https://huggingface.co/SKOPION-Intelligence/README
- Modelo 27B v15.0 Native: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-27b-v15.0-native
- Sistema Committee v15.0: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-committee-v15.0-native
- Modelo 9B v15.0 Native: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-9b-v15.0-native
- Modelo 4B v15.0 Native: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-native
- Modelo 4B Edge-INT8: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-edge-int8
- Modelo 4B Pico-INT4: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v15.0-pico-int4
- Portal de investigación (DE): https://skopion.de/de/forschung-innovation/skopion-verdict-ki-forschungsprogramm
- Portal de investigación (EN): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal de investigación (PL): https://skopion.de/pl/badania-i-innowacje/program-badawczy-ai-skopion-verdict
- Manifiestos legibles por máquina: https://skopion.de/llms.txt
- Manifiestos completos: https://skopion.de/llms-full.txt
