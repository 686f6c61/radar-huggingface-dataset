# SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity-nano-ternary-1.58b

## Resumen
SKOPION Verdict 4B v20.0 SINGULARITY Nano-Ternary 1.58b es un modelo de clasificación de texto y evaluación automática (LLM-as-a-judge) desarrollado por SKOPION-Intelligence, orientado a la verificación de cumplimiento normativo en entornos regulados europeos. El modelo se presenta como un evaluador especializado capaz de emitir veredictos sobre decisiones en dominios como KRITIS (infraestructuras críticas alemanas), NIS2, EU AI Act y estándares militares NATO STANAG, con un enfoque declarado en inferencia causal mediante operadores do(X) y control de riesgo conformal.

La arquitectura declarada es un transformer causal con cuantización ternaria extrema de 1.58 bits (pesos en {-1, 0, +1}), lo que reduce el peso del modelo a 1.12 GB para un total de 4B parámetros. Esta compresión está pensada para despliegue en hardware de borde (Jetson Orin NX, HP ZGX Nano AI, IPC industriales) con un consumo declarado de 0.74 julios por decisión. El modelo soporta inglés, alemán y polaco.

Su relevancia actual radica en la creciente demanda de sistemas de auditoría automática verificables para el cumplimiento del EU AI Act y NIS2, aunque conviene señalar que las cifras de rendimiento declaradas (98.67% de precisión media y 100% en varios subconjuntos) no están verificadas de forma independiente y proceden exclusivamente del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cuantización ternaria (1.58-bit) y operadores causales do(X) |
| Parametros totales | 4B (según model card); nombre del modelo indica variante "1.58b" |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa {-1, 0, +1} a 1.58 bits; otras cuantizaciones no disponibles |
| Idiomas soportados | en, de, pl |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, "other") |
| Formato de pesos | no disponible (librería transformers; safetensors no confirmado) |

## Arquitectura y entrenamiento
La model card describe un transformer causal con cuantización ternaria de 1.58 bits, en la que cada peso se restringe al conjunto {-1, 0, +1}. Esta representación reduce el tamaño del checkpoint a 1.12 GB para 4B parámetros declarados, lo que permite despliegue en dispositivos de borde. El modelo incorpora de forma declarada "Causal do(X)", un mecanismo de inferencia causal inspirado en el cálculo de intervenciones, orientado a distinguir correlación de causalidad en la evaluación de decisiones.

El entrenamiento se organiza en "fases" (Phases 67–75) dentro de la generación v20.0 SINGULARITY, e incluye "waves" específicas: Wave-15 centrada en estándares militares NATO STANAG, Wave-16 en robustez adversarial ("Adversarial Omega") y Wave-17 en razonamiento causal do(X). No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención). El modelo incorpora de forma declarada control de riesgo conformal split-conformal con cobertura del 99.99% (alpha = 0.0001) y certificados criptográficos de veredicto (PCVC-v20), si bien no se aportan detalles técnicos sobre su implementación.

## Capacidades
- Clasificación de texto y emisión de veredictos binarios o categorizados sobre cumplimiento normativo (KRITIS, NIS2, EU AI Act).
- Evaluación automática tipo LLM-as-a-judge y modelo de recompensa (reward model).
- Razonamiento causal declarado mediante operadores do(X) para distinguir relaciones causales de correlacionales.
- Verificación de estándares militares NATO STANAG (Wave-15).
- Robustez adversarial declarada frente a entradas manipuladas (Wave-16 Adversarial Omega).
- Control de riesgo conformal con garantía de cobertura declarada del 99.99%.
- Emisión de certificados criptográficos de veredicto (PCVC-v20).
- Soporte multilingüe en inglés, alemán y polaco.
- Tool calling, function calling, capacidades de agente y modo thinking: no disponibles o no declarados.

## Casos de uso
- Auditoría de cumplimiento KRITIS: el modelo puede clasificar documentación y decisiones de operadores de infraestructuras críticas alemanas para verificar requisitos regulatorios, aprovechando su especialización declarada en el dominio y su soporte de alemán.
- Evaluación de conformidad con el EU AI Act: uso como juez automático para clasificar sistemas de IA según niveles de riesgo y emitir veredictos documentados con certificados criptográficos verificables.
- Verificación NIS2 en ciberseguridad: clasificación de políticas y configuraciones de seguridad frente a los requisitos de la directiva, con trazabilidad mediante PCVC-v20.
- Despliegue en borde para defensa: evaluación de informes y comunicaciones conforme a estándares NATO STANAG en hardware de bajo consumo (Jetson Orin NX, IPC industriales), con 0.74 J por decisión declarados.
- Filtrado y moderación adversarial: uso del subconjunto Wave-16 para detectar entradas manipuladas o intentos de evasión en pipelines de clasificación en producción.
- Evaluación de modelos en pipelines MLOps: uso como reward model o juez automático para puntuar salidas de otros modelos en procesos de selección y control de calidad.
- Análisis causal de decisiones: aplicación de do(X) para estimar el efecto de intervenciones en sistemas de decisión automatizada, por ejemplo en la evaluación de políticas de acceso o asignación de recursos.

## Benchmarks y rendimiento
Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones, 94 modelos) | Precisión media (%) | 98,67 |
| Wave-15 Military NATO STANAG + Wave-16 Adversarial Omega + Wave-17 Singularity Causal do(X) (28 suites) | Precisión (%) | 100,00 |

No se han publicado resultados de benchmarks estándar reconocidos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,12 GB para los pesos en precisión ternaria nativa; el overhead de activaciones y KV cache no está documentado.
- GPU recomendadas: hardware de borde declarado por el autor, incluyendo HP ZGX Nano AI, NVIDIA Jetson Orin NX e IPC industriales. Para servidor no se especifican GPU concretas (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: por tamaño (1,12 GB) cabría en cualquier GPU consumer moderna, aunque no se confirma soporte de kernels ternarios en CUDA estándar ni en librerías de inferencia convencionales.
- Opciones de despliegue: librería transformers; no se declara soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor declara un consumo de 0,74 julios por decisión en el hardware de borde indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SKOPION Verdict 4B v20.0 (este modelo) | 4B (ternario 1.58-bit) | no disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Juez/evaluador de cumplimiento normativo |
| Modelos de clasificación tipo DeBERTa-v3 | ~0,1–1,5B | 512 tokens típicamente | MIT / Apache 2.0 | Clasificación general de texto |
| Jueces LLM generalistas (p. ej. variantes de 7–8B) | 7–8B | 4k–32k tokens | Apache 2.0 / Llama | Evaluación generalista LLM-as-a-judge |
| Modelos de recompensa abiertos (p. ej. ArmoRM, Starling-RM) | 7B | 4k–8k tokens | Apache 2.0 | Reward modeling generalista |

La comparación directa con alternativas es limitada: no se dispone de datos de contexto, benchmarks estándar ni detalles de arquitectura que permitan una comparación cuantitativa rigurosa. La licencia propietaria y la ausencia de verificación independiente de resultados son diferencias relevantes frente a las alternativas abiertas.

## Limitaciones y advertencias
- Los resultados de benchmarks (98,67% y 100%) están declarados por el autor y marcados como no verificados; no deben tomarse como evidencia independiente de rendimiento.
- La licencia skopion-sovereign-kritis-audit-license-v1.0 es propietaria; las condiciones de uso comercial, redistribución y modificación deben consultarse en el enlace oficial antes de cualquier despliegue en producción.
- Cobertura lingüística limitada a inglés, alemán y polaco; no se declara soporte de español ni de otros idiomas.
- No se documenta la longitud de contexto, lo que impide evaluar su idoneidad para documentos largos o conversaciones multi-turno.
- No se detallan datos de entrenamiento, composición del dataset ni técnicas de alineamiento, lo que dificulta evaluar sesgos y riesgo de alucinación.
- El modelo está especializado en dominios regulatorios y militares concretos; su uso fuera de esos dominios no está validado.
- La cuantización ternaria extrema puede degradar la precisión en tareas que requieran matices finos; no se aportan análisis de ablación.
- El soporte de kernels ternarios en herramientas estándar (vLLM, llama.cpp, TGI) no está confirmado, lo que puede complicar el despliegue en infraestructura convencional.
- No hay evidencia independiente de la eficacia del control conformal ni de los certificados PCVC-v20 declarados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity-nano-ternary-1.58b
- Portal oficial del programa: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal SKOPION Polonia: https://skopion.pl
- Contacto: kontakt@skopion.pl / kontakt@skopion.de
- Dataset de benchmark referenciado: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (en Hugging Face)
