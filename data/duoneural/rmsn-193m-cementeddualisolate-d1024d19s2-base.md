# DuoNeural/RMSN-193M-CementedDualIsolate-D1024d19s2-Base

## Resumen

RMSN-193M-CementedDualIsolate-D1024d19s2-Base es un modelo base de investigación desarrollado por DuoNeural Lab (Aura, Archon y Jesse Kuhl), publicado en noviembre de 2026 bajo licencia Apache 2.0. Se trata de un modelo de lenguaje en inglés de aproximadamente 271 millones de parámetros construido sobre una arquitectura denominada RMSN, de tipo port-Hamiltoniano, con dimensión oculta D=1024 y 19 capas. Forma parte de una serie de barridos de profundidad (depth sweep) cuyo objetivo no es tanto la calidad lingüística como el estudio de dinámicas topológicas internas.

El interés del modelo es fundamentalmente científico: su model card documenta un fenómeno que el autor denomina "Frustrated Condensate Antagonism" (antagonismo de condensados frustrados), observado en la topología que llama Cemented Dual Isolate (CDI). Según los datos publicados, el modelo presenta dos condensados exactos aislados (capas 11 y 18, con PR=1.000) bajo un régimen de "cemento topológico" (M_eff=4), sin pareja adyacente exacta, lo que se traduce en una perplejidad de chain-of-thought muy elevada (CoT_ppl = 5795) frente a la línea base de cemento (3511).

No es un modelo pensado para producción ni para uso general: es un artefacto de investigación que ilustra una hipótesis sobre cómo la topología de las representaciones internas afecta al razonamiento multi-paso. Su relevancia actual reside en la trazabilidad experimental que ofrece (100.000 pasos de entrenamiento, métricas de Lyapunov, análisis de solitones por capa) para quienes investigan interpretabilidad y dinámica de redes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN port-Hamiltoniana (D=1024, depth=19), bracket conservativo {·,H} + corchete metripléctico de Morrison [·,S] |
| Parametros totales | ~271M (el ID del repositorio indica 193M; la model card declara ~271M; discrepancia no resuelta en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0.9 GB) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe formalmente como un sistema port-Hamiltoniano con la ecuación ḟ = {f, H} + [f, S], es decir, un término conservativo gobernado por un bracket de Poisson {·,H} y un término disipativo descrito por el corchete metripléctico de Morrison [·,S]. La red tiene D=1024 y 19 capas, con un ratio Ω = D/(M_w × L) = 16/19 ≈ 0.8421. El entrenamiento se realizó durante 100.000 pasos y la model card reporta una wiki_ppl de 72.50 y una CoT_ppl de 5795.

El modelo se enmarca en una taxonomía interna de topologías (esta es la número 17, "Cemented Dual Isolate"). La model card describe una "cascade pathway" de tres fases: un pico de Lyapunov de -5.5 en torno al paso 50k (el más intenso de toda la serie depth sweep), seguido de un amortiguamiento hacia una órbita KAM cercana en torno al paso 83k. El resultado son 9 capas solitón (M*=9) y M_eff=4, umbral a partir del cual la topología se considera "cementada" (congelada). No se detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés: es un modelo base, por lo que su capacidad principal es la modelización de lenguaje, no la instrucción.
- Razonamiento multi-paso: la model card evalúa explícitamente la perplejidad de chain-of-thought (CoT_ppl), lo que implica que el modelo produce cadenas de razonamiento, aunque con un rendimiento degradado por la topología CDI.
- Análisis de dinámicas internas: permite inspeccionar solitones por capa, condensados exactos (PR=1.000) y órbitas de Lyapunov, lo que lo hace útil como banco de pruebas de interpretabilidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad de producto; el razonamiento multi-paso se mide solo como métrica.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en interpretabilidad de transformers: el modelo expone métricas por capa (PR, tipo de solitón, posición de condensados) que permiten estudiar cómo la topología interna correlaciona con el rendimiento en razonamiento, usando la CoT_ppl como variable dependiente.
- Estudio de dinámicas port-Hamiltonianas en redes neuronales: la formulación ḟ = {f, H} + [f, S] y los datos de Lyapunov (pico de -5.5, amortiguamiento a -0.08) sirven para validar simulaciones de sistemas metriplécticos en aprendizaje profundo.
- Reproducción de experimentos de depth sweep: al ser el segundo seed en Ω=16/19, permite comparar con d19s1 (KAM Plasticizing Effect, CoT 2714) y d19s3 para aislar el efecto de la semilla en la topología resultante.
- Benchmark de patologías de razonamiento: la CoT_ppl de 5795 frente a la línea base de 3511 lo convierte en un caso negativo controlado para probar métodos de mitigación de degradación en cadenas de razonamiento.
- Docencia y divulgación sobre arquitecturas no convencionales: su tamaño (~271M, repo de 0.9 GB) permite desplegarlo en hardware modesto para demostrar conceptos de condensados, solitones y cemento topológico.
- Validación de la ley "Frustrated Condensate Antagonism": con dos pines exactos aislados, permite contrastar la hipótesis de que cada pin aislado aporta ~1142 de penalización CoT bajo cemento, independientemente de su posición en la red.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual, sin comparación con modelos de la industria:

| Modelo | M_eff | Condensados exactos | CoT_ppl |
|---|---|---|---|
| d23s1 CTC | 4 | Ninguno (solo casi-exactos) | 3511 (línea base de cemento) |
| d24s1 CIC | 4 | 1 par adyacente (conduit medio) | 5434 |
| d19s2 CDI (este) | 4 | 2 aislados L11+L18 | 5795 |
| d20s2 TCC | 4 | 1 par adyacente (conduit terminal) | 6031 |

| Métrica adicional | Valor |
|---|---|
| wiki_ppl | 72.50 |
| CoT_ppl | 5795 |
| Lyapunov final | ~-0.08 |
| Pico de Lyapunov | -5.5 (paso ~50k) |
| Pasos de entrenamiento | 100.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~271M parámetros, en fp16 requiere aproximadamente 0.55 GB de pesos; en fp32, ~1.1 GB. El repo ocupa 0.9 GB, consistente con pesos en fp16 o similar.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU moderna, e incluso en CPU.
- Opciones de despliegue: no se especifican en la información disponible. Al ser una arquitectura RMSN no estándar, es probable que no sea compatible con vLLM, llama.cpp, Ollama o TGI sin implementación específica; este extremo no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay modelos comparables directamente en la información proporcionada, ya que RMSN es una arquitectura propietaria de DuoNeural sin equivalentes públicos conocidos. La comparación más cercana es interna, dentro de la propia serie depth sweep:

| Modelo | Parámetros | Topología | CoT_ppl | wiki_ppl | Licencia |
|---|---|---|---|---|---|
| d19s1 | ~271M (serie) | KAM-TerminalDoublet | 2714 | 67.5 | apache-2.0 |
| d19s2 (este) | ~271M | CDI | 5795 | 72.50 | apache-2.0 |
| d19s3 | ~271M (serie) | TBD | TBD | TBD | apache-2.0 |
| d23s1 CTC | no disponible | CTC | 3511 | no disponible | apache-2.0 |

Frente a modelos de lenguaje convencionales de tamaño similar (por ejemplo, GPT-2 355M o Pythia 410M), no se han publicado comparaciones en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no está pensado para diálogo, asistencia ni tareas de usuario final.
- El rendimiento en razonamiento multi-paso está degradado de forma deliberada y documentada (CoT_ppl 5795 frente a 3511 de la línea base), por lo que no debe usarse en producción para tareas que requieran cadenas de razonamiento fiables.
- Solo soporta inglés según la etiqueta de idioma; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base de 271M con wiki_ppl 72.50, la calidad de generación es limitada.
- Discrepancia en el número de parámetros: el ID del repositorio indica 193M y la model card declara ~271M; conviene verificar los pesos antes de cualquier uso que dependa del tamaño.
- La arquitectura RMSN no es estándar, por lo que las herramientas habituales de inferencia (transformers, vLLM) probablemente no la soporten de forma nativa; no se especifica el formato de pesos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad para tales fines.
- La model card emplea terminología y afirmaciones no revisadas por pares (solitones, cemento topológico, "nueva ley"); deben tratarse como hipótesis del autor, no como resultados consolidados.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-CementedDualIsolate-D1024d19s2-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
