# SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity

## Resumen

SKOPION Verdict 4B v20.0 Singularity es un modelo de 4.000 millones de parámetros desarrollado por SKOPION-Intelligence, presentado como un sistema de clasificación de texto y evaluación automatizada ("LLM-as-a-judge" y "reward model") orientado a la verificación de cumplimiento normativo en entornos de seguridad digital. El modelo se distribuye a través de Hugging Face con la librería `transformers` y declara soporte para inglés, alemán y polaco, lo que encaja con el perfil de una herramienta pensada para el mercado europeo de auditoría regulatoria (KRITIS, NIS2, EU AI Act, STANAG de la OTAN).

La propuesta técnica del autor combina un backbone de 4B parámetros en BF16 con adaptadores DoRA/LoRA y un componente denominado "Causal do(X)", junto con mecanismos declarados de predicción conforme (split-conformal con cobertura del 99,99 %) y certificados criptográficos de veredicto (PCVC-v20). El modelo se posiciona, por tanto, no como un generador de propósito general, sino como un clasificador/juez especializado en decisiones auditables.

Es relevante ahora por la presión regulatoria creciente en la UE (AI Act, NIS2) y por la demanda de sistemas de evaluación que produzcan decisiones trazables y con garantías estadísticas. No obstante, la práctica totalidad de las métricas y capacidades declaradas provienen exclusivamente de la model card del autor, sin verificación independiente, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con adaptadores DoRA/LoRA y componente "Causal do(X)" (según el autor); detalles de la arquitectura base no disponibles |
| Parametros totales | 4B |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos declarados en BF16, 8,04 GB) |
| Idiomas soportados | Inglés (en), alemán (de), polaco (pl) |
| Licencia | skopion-sovereign-kritis-audit-license-v1.0 (licencia propia, "other") |
| Formato de pesos | No disponible (se declara BF16 + DoRA/LoRA; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de una base de 4B parámetros en BF16 sobre la que se aplican adaptadores Deep DoRA/LoRA y un componente denominado "Causal do(X)", asociado a inferencia causal. El autor enmarca el desarrollo en las "Phases 67–75" de su programa de investigación, pero no se detalla la arquitectura exacta del backbone (familia, número de capas, dimensión oculta, mecanismo de atención) ni la composición del dataset de entrenamiento.

Tampoco se especifican el número de tokens de entrenamiento, la proporción de datos por idioma, ni si se emplearon técnicas de RLHF, DPO u otras formas de alineación. Las innovaciones declaradas se centran en la capa de decisión y verificación: control de riesgo mediante split-conformal con cobertura del 99,99 % (alfa = 0,0001) y emisión de certificados criptográficos de veredicto (PCVC-v20). Estos mecanismos, tal como se presentan, afectan a la calibración y trazabilidad de las salidas más que a la arquitectura del modelo lingüístico en sí.

## Capacidades

- Clasificación de texto y emisión de veredictos binarios o categóricos orientados a auditoría.
- Evaluación automatizada tipo "LLM-as-a-judge" y uso como modelo de recompensa (reward model).
- Razonamiento causal declarado mediante el operador do(X) (inferencia contrafactual).
- Verificación de cumplimiento normativo en dominios KRITIS, NIS2, EU AI Act y STANAG de la OTAN (según el autor).
- Emisión de certificados de veredicto con garantías criptográficas (PCVC-v20) y control de riesgo conforme.
- Capacidades multilingües limitadas a inglés, alemán y polaco.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de cumplimiento NIS2: el modelo actuaría como clasificador de evidencias y documentación de proveedores para determinar si cumplen los requisitos de la directiva, emitiendo un veredicto con certificado criptográfico asociado.
- Evaluación de sistemas de IA según el EU AI Act: uso como juez automatizado para clasificar el nivel de riesgo de un sistema descrito en texto y generar un registro auditable de la decisión.
- Clasificación de infraestructuras críticas (KRITIS): etiquetado de activos y eventos según categorías regulatorias alemanas, aprovechando el soporte nativo de alemán.
- Evaluación de proveedores en cadenas de suministro de defensa: verificación de conformidad con estándares STANAG de la OTAN a partir de documentación técnica en inglés, alemán o polaco.
- Modelo de recompensa en pipelines de RLHF: puntuación de respuestas de otros modelos en dominios regulados, con control de riesgo conforme para limitar falsos positivos.
- Verificación de decisiones con garantías estadísticas: integración en flujos donde se exige cobertura de error controlada (por ejemplo, aprobación de accesos o transacciones sensibles) gracias al mecanismo split-conformal declarado.
- Análisis causal de incidentes: uso del operador do(X) para estimar el efecto de intervenciones sobre un sistema descrito textualmente, en contextos de post-mortem de seguridad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Strict-98 External Decision & Judge Benchmark Matrix (100 suites / 29.340 evaluaciones) | Precisión media (%) | 98,70 |
| Wave-15 Military/NATO STANAG (8 suites) | Precisión (%) | 100,00 |
| Wave-16 Adversarial Omega (8 suites) | Precisión (%) | 100,00 |
| Wave-17 Singularity Causal do(X) (12 suites) | Precisión (%) | 100,00 |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros estándar) en la información disponible. Las cifras anteriores proceden exclusivamente del `model-index` del autor y figuran como no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,04 GB de pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto corto.
- GPU recomendadas: NVIDIA H100 o estaciones de trabajo RTX según el propio autor (consumo declarado de 0,92 julios por decisión en H100 / RTX Workstation).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), aunque no se han publicado requisitos oficiales ni versiones cuantizadas.
- Opciones de despliegue: `transformers` (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponibles; el único dato energético es el consumo declarado de 0,92 J por decisión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables verificables en la misma categoría (clasificadores/jueces especializados en cumplimiento normativo con 4B parámetros y licencia propia). Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKOPION Verdict 4B v20.0 | 4B | No disponible | Propietaria (skopion-sovereign-kritis-audit-license-v1.0) | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Todos los benchmarks y métricas proceden del autor y figuran como no verificados; no hay evaluación independiente publicada.
- El modelo no registra descargas ni "likes" en Hugging Face en el momento de la ficha, lo que impide contrastar su uso real en producción.
- No se especifican arquitectura base, contexto máximo, composición del dataset ni proceso de alineación, lo que dificulta evaluar riesgos de sesgo y alucinación.
- El soporte lingüístico se limita a inglés, alemán y polaco; no se declara castellano.
- La licencia es propia ("skopion-sovereign-kritis-audit-license-v1.0") y no está estandarizada; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que podría imponer restricciones de auditoría, atribución o redistribución.
- Las afirmaciones sobre cobertura conforme del 99,99 % y certificados criptográficos no han sido auditadas de forma independiente; deben tratarse como declaraciones del fabricante.
- Riesgo de sobreconfianza: un clasificador presentado como juez con precisión declarada del 100 % en suites adversariales debe someterse a validación propia antes de integrarse en decisiones reguladas.
- No se confirma soporte de cuantización, tool calling ni despliegue en motores de inferencia de alto rendimiento, lo que limita su adopción en pipelines estándar.
- El uso en contextos de defensa o infraestructuras críticas exige verificación humana y no debería delegarse únicamente en las salidas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SKOPION-Intelligence/skopion-verdict-4b-v20.0-singularity
- Programa de investigación SKOPION Verdict: https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Portal SKOPION Polonia: https://skopion.pl
- Licencia (enlace declarado por el autor): https://skopion.de/en/research-innovation/skopion-verdict-ai-research-program
- Dataset de referencia declarado: SKOPION-Intelligence/SKOPION-Verdict-Bench-56Suites (en Hugging Face)
- Contacto del autor: kontakt@skopion.pl / kontakt@skopion.de
