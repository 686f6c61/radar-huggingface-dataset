# DuoNeural/RMSN-243M-Bulk-Boundary-SFT

## Resumen

RMSN-243M-Bulk-Boundary-SFT es un modelo de lenguaje de 243,73 millones de parámetros desarrollado por DuoNeural Lab, presentado como la línea base de su "Fase 5". Se enmarca en una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), que el autor describe como un marco Port-Hamiltonian con topología de guía de onda de solitones. El modelo parte de un preentrenamiento y se afina mediante SFT sobre trazas de razonamiento (chain-of-thought) generadas por DuoNeural, con 15.000 pasos de entrenamiento.

El interés del modelo no reside en su escala, sino en la propuesta arquitectónica: el autor documenta una migración topológica de un solitón desde la capa 8 (interior o "bulk") hasta la capa 15 (frontera o "boundary") a lo largo del SFT, un fenómeno que asocia a una mayor retención de conocimiento (2,6 veces la base). Se trata de un modelo de investigación con un tokenizador Cosmo2 de vocabulario 49.152 y una ventana de contexto no especificada.

La relevancia es limitada fuera del ámbito de la investigación experimental: no hay pipeline declarado, no se publican benchmarks estándar (MMLU, HumanEval, GSM8K) y el repositorio tiene cero descargas y cero likes en el momento de la consulta. Es útil como referencia para quienes estudian arquitecturas alternativas al transformer estándar o dinámicas de entrenamiento poco convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), Port-Hamiltonian (ḟ = {f,H} + [f,S]) |
| Parámetros totales | 243,73 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería custom; tamaño del repo 0,8 GB) |

Otros datos declarados por el autor: dimensión oculta 1024, 16 capas, 64 "workspace slots", tokenizador HuggingFaceTB/cosmo2-tokenizer con vocabulario de 49.152.

## Arquitectura y entrenamiento

El modelo se construye sobre un formalismo Port-Hamiltonian, que el autor expresa como ḟ = {f,H} + [f,S], es decir, una dinámica que combina un corchete de Poisson (parte conservativa, H) con un término disipativo o metripléctico (S). Sobre esa base se define una "topología de guía de onda de solitones" con 16 capas y 64 slots de trabajo. La terminología (solitón, bulk-to-boundary, sheaf) es propia del autor y no se corresponde con componentes estándar de un transformer; no se detalla cómo se materializa en operaciones concretas.

El entrenamiento consta de una fase de preentrenamiento seguida de SFT sobre trazas de razonamiento CoT de DuoNeural durante 15.000 pasos. El autor describe la evolución del solitón: en preentrenamiento nuclea en la capa 8 (bulk, PR≈1), hacia el paso 5.000 migra hacia la capa 15 y a los 15.000 pasos termina en la capa 15 (singularidad de frontera, PR=1,000). No se especifican el volumen de tokens de preentrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, con foco declarado en razonamiento mediante cadenas de pensamiento (CoT).
- Razonamiento multi-paso derivado del ajuste fino sobre trazas CoT.
- Retención de conocimiento reforzada según el autor (ratio 2,6× respecto a la base) tras la migración del solitón.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar dinámicas Port-Hamiltonian y el fenómeno de migración topológica documentado por el autor, comparando el comportamiento antes y después del SFT.
- Estudio de retención tras ajuste fino: permite reproducir el experimento de retención (2,6× base) y analizar si la migración del solitón correlaciona con mejor retención en tareas de razonamiento.
- Experimentos de razonamiento CoT a pequeña escala: con 243 M de parámetros y perplejidad CoT de 10,31, es adecuado para prototipos de generación de cadenas de razonamiento en entornos con recursos muy limitados.
- Docencia y divulgación: su tamaño reducido (repo de 0,8 GB) facilita desplegarlo en un portátil para ilustrar conceptos de dinámica Hamiltonianos aplicados a modelos de lenguaje.
- Comparación de tokenizadores: al usar Cosmo2 (vocabulario 49.152), sirve para evaluar el impacto del tokenizador en modelos pequeños frente a alternativas con vocabularios mayores.
- Pruebas de infraestructura de inferencia personalizada: al requerir librería `custom`, es útil para validar pipelines de despliegue no estándar antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| wiki_ppl (menor es mejor) | 184,81 |
| cot_ppl (menor es mejor) | 10,31 |
| Ratio de retención | 2,6× base |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son perplejidades declaradas por el autor y no son directamente comparables con modelos de la misma escala sin una evaluación homogénea.

## Requisitos de hardware

- VRAM estimada para inferencia: con 243,73 M de parámetros, en FP16 ocupa aproximadamente 0,5 GB de pesos; en FP32, unos 1 GB. La VRAM real dependerá del runtime custom y de los 64 slots de trabajo, no cuantificados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente en principio; una RTX 3060 (12 GB) o superior deja margen amplio. Para lotes grandes, A100 o H100 no son necesarias por tamaño, pero podrían usarse en experimentación.
- Cabe en GPU consumer: sí, con holgura en cualquier GPU con 4 GB o más, asumiendo que el runtime custom lo permita.
- Opciones de despliegue: al usar `library_name: custom`, no hay confirmación de compatibilidad con vLLM, llama.cpp, Ollama o TGI. Requiere el código del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia arquitectónica (RMSN, Port-Hamiltonian) ni se dispone de benchmarks homogéneos frente a modelos estándar de ~250 M de parámetros (por ejemplo, variantes pequeñas de la familia Qwen o SmolLM), por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay validación externa de sus resultados.
- Terminología y métricas propietarias (solitón, PR, bulk-to-boundary) sin definición formal en la model card, lo que dificulta la reproducibilidad.
- Perplejidad wiki de 184,81, elevada para un modelo de su tamaño, lo que sugiere un conocimiento general limitado.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Longitud de contexto no especificada: riesgo de truncamiento en tareas de contexto largo.
- Riesgo de alucinación no evaluado; no hay pruebas de robustez ni de sesgos publicadas.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación y de soporte desaconseja producción sin validación propia.
- Dependencia de una librería `custom`: posible fricción de integración y riesgo de abandono del código por parte del autor.
- Inconsistencia menor en la nomenclatura: el ID del repositorio indica 243M y el título de la model card dice 244M; los parámetros declarados en la tabla son 243,73 M.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-243M-Bulk-Boundary-SFT
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
