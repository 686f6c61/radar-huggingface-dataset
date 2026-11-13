# DuoNeural/RMSN-186M-DualSingularity-ParityTurbulence-Base

## Resumen
El RMSN-186M-DualSingularity-ParityTurbulence-Base es un modelo base de lenguaje de aproximadamente 186 millones de parámetros desarrollado por DuoNeural Lab (Archon, Aura y Jesse Kuhl), presentado en noviembre de 2026. Se enmarca en una arquitectura experimental denominada RMSN (Resonant Metriplectic Sheaf Network), que combina dinámica port-hamiltoniana, álgebra geométrica de Clifford, teoría de haces celulares y memoria fraccional de Caputo. El modelo se entrena exclusivamente sobre wikitext-103 con el tokenizador `HuggingFaceTB/cosmo2-tokenizer` de 49.152 entradas de vocabulario.

Su relevancia no reside en el rendimiento absoluto, sino en la validación empírica de una hipótesis estructural concreta: la llamada Ley de Cascada Inducida por Paridad, según la cual la paridad del cociente entre dimensión y ancho de memoria (D/M_w) determina si la red condensa energía de forma laminar o desencadena una cascada turbulenta. Con D=960 y M_w=64, el cociente es 15 (impar), lo que produce una topología de doble singularidad exacta en las capas L9 y L10.

El autor declara un récord interno de perplejidad en cadena de pensamiento (CoT ppl=2935,73) frente a otras variantes RMSN, aunque se trata de una métrica propietaria del laboratorio y no comparable con benchmarks estándar. El modelo se publica bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), dinámica port-hamiltoniana |
| Parametros totales | ~186M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,7 GB) |
| Dimension (dim) | 960 |
| Profundidad (depth) | 16 capas |
| Slots / ancho de memoria (M_w) | 64 |
| Pasos de entrenamiento | 100.000 |
| Tokenizador | HuggingFaceTB/cosmo2-tokenizer (49.152 vocab) |
| Dataset de entrenamiento | wikitext-103 |

## Arquitectura y entrenamiento
El modelo implementa la ecuación de evolución `ḟ = {f, H} + [f, S]`, separando una componente conservativa (corchete de Poisson con el hamiltoniano H) y una disipativa (corchete con S). Sobre esa base se superponen cinco componentes estructurales: dinámica port-hamiltoniana, mezcla de capas mediante álgebra geométrica de Clifford, un espacio de trabajo basado en teoría de haces celulares, memoria fraccional de Caputo y un espacio de trabajo global trófico con lectura de tensor de estrés-energía de Noether. La dimensión es 960, la profundidad 16 capas y el ancho de memoria 64 slots.

El entrenamiento se realizó durante 100.000 pasos sobre wikitext-103, un corpus de inglés de dominio general. No se documenta el número total de tokens procesados, la composición exacta del dataset más allá del corpus citado, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La innovación técnica declarada es la Ley de Cascada Inducida por Paridad: con D/M_w = 960/64 = 15 (impar), la dimensión no emparejada rompe la invariancia rotacional del bivector y desencadena una cascada turbulenta de no equilibrio que concentra la energía topológica en dos condensados exactos adyacentes (L9 y L10, ambos con PR=1.000), formando una "lente topológica" en el núcleo de razonamiento del modelo.

## Capacidades
- Generación de texto en inglés sobre dominio general, entrenado sobre wikitext-103.
- Razonamiento secuencial: el autor atribuye al par de singularidades en L9/L10 (a ~60-65% de profundidad) una mejora en inferencia secuencial tipo chain-of-thought.
- Modelo base: no se documenta ajuste por instrucciones, por lo que la capacidad de seguir instrucciones no está garantizada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá de la métrica CoT declarada.
- Capacidades multilingües: limitadas a inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.
- Capacidad de validación estructural: sirve como implementación de referencia de la Ley de Cascada Inducida por Paridad y de la topología de doble singularidad.

## Casos de uso
- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas reproducible para estudiar dinámica port-hamiltoniana, haces celulares y memoria fraccional en modelos de lenguaje de escala pequeña (186M), permitiendo comparar variantes con distinto D/M_w.
- Estudio de la Ley de Cascada Inducida por Paridad: con D/M_w = 15 (impar) y condensados exactos en L9/L10, es el caso de referencia para replicar o refutar la hipótesis de que la paridad determina el régimen de condensación.
- Experimentos de interpretabilidad mecanicista: la estructura de solitones concentrada en L9-L11 (4 solitones) facilita el análisis de qué capas concentran la capacidad de razonamiento, frente a topologías de "Deep Spine" distribuidas.
- Prototipado de bajo coste: con ~186M parámetros y un repo de 0,7 GB, permite iterar en hardware modesto antes de escalar a variantes mayores.
- Evaluación comparativa de mecanismos de condensación: el autor sugiere que el mecanismo (turbulencia por paridad frente a tamiz de Casimir) importa más que el valor de r para optimizar CoT, lo que convierte al modelo en una pieza de una comparativa controlada.
- Docencia y divulgación técnica: como ejemplo didáctico de integración de geometría de Clifford, haces y sistemas hamiltonianos en un transformer-like de tamaño manejable.

## Benchmarks y rendimiento
Los únicos datos publicados son métricas internas del laboratorio, no comparables con benchmarks estándar (MMLU, HumanEval, GSM8K no se reportan).

| Metrica | Valor | Nota |
|---|---|---|
| wiki_ppl | 78,27 | Perplejidad sobre wikitext-103 |
| CoT ppl | 2935,73 | Récord interno declarado por el autor entre variantes RMSN |
| Comparativa r=16 (Casimir repulsivo) | 3321 | CoT ppl, según el autor |
| Comparativa r=32 (Casimir repulsivo) | 3581 | CoT ppl, según el autor |
| M* | 2 | Doble condensado exacto (L9 y L10) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~186M parámetros en fp16 se estiman del orden de 0,4-0,5 GB de pesos, y en cuantizaciones de 8 o 4 bits, aproximadamente 0,2-0,3 GB, aunque no se documentan formatos de cuantización soportados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería alojar el modelo con holgura dado su tamaño; no se especifican requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no indicarse el formato de pesos, la compatibilidad con estos runners no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RMSN-186M-DualSingularity-ParityTurbulence-Base | ~186M | no disponible | Apache 2.0 | Arquitectura RMSN experimental, solo inglés, entrenado en wikitext-103 |
| Variantes RMSN con D=896, D=1024, D=1040, D=1008 | ~186M (misma familia) | no disponible | Apache 2.0 (presumible) | Mismo laboratorio; D/M_w par produce condensación silenciosa, impar produce cascada |
| Modelos transformer densos de ~180-200M (p. ej. GPT-2 small, 124M; Pythia-160M) | 124M-160M | 1.024-2.048 tokens (típico) | MIT / Apache 2.0 | Arquitecturas convencionales con benchmarks públicos; no comparables directamente por falta de métricas estándar del RMSN |

No se dispone de comparaciones con benchmarks estándar que permitan situar el modelo frente a alternativas convencionales de su tamaño.

## Limitaciones y advertencias
- Modelo base sin ajuste por instrucciones: no debe esperarse un comportamiento de asistente ni seguimiento fiable de instrucciones.
- Entrenado únicamente sobre wikitext-103, un corpus de inglés de dominio general y relativamente antiguo; el conocimiento del mundo y la cobertura de dominios son muy limitados.
- Solo inglés; no hay soporte multilingüe declarado.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Métricas CoT propietarias (ppl=2935,73) no comparables con benchmarks estándar; el "récord" es interno a la familia RMSN y no implica superioridad frente a modelos convencionales.
- Riesgo elevado de alucinación y de texto incoherente en usos fuera del dominio de wikitext-103, dado el tamaño y el corpus de entrenamiento.
- No se documentan sesgos específicos, pero un corpus como wikitext-103 arrastra sesgos de su fuente (Wikipedia en inglés).
- No se documentan formatos de pesos ni cuantizaciones, lo que dificulta el despliegue en producción con herramientas estándar.
- La naturaleza experimental de la arquitectura (port-hamiltoniana, haces, Clifford) implica que las afirmaciones teóricas del autor (Ley de Cascada Inducida por Paridad) no han sido validadas de forma independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin garantías de calidad, su uso en producción requeriría evaluación adicional.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-186M-DualSingularity-ParityTurbulence-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Cita del autor (bibtex en la model card): Kuhl, Jesse; Archon; Aura. "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", DuoNeural Lab, 2026, Draft v0.7+ (no se proporciona URL del paper).
- Repositorio, blog o demo adicionales: no disponibles en la información proporcionada.
