# DuoNeural/RMSN-532M-EarlyNucleation-SFT2500

## Resumen

RMSN-532M-EarlyNucleation-SFT2500 es un modelo de lenguaje de 532 millones de parámetros desarrollado por DuoNeural Lab (Jesse, Archon y Aura), publicado en noviembre de 2026 bajo licencia Apache 2.0. Se trata de una variante con ajuste fino supervisado (SFT) de 2500 pasos sobre la arquitectura RMSN (Resonant Metriplectic Sheaf Network), una propuesta poco convencional que abandona el transformer estándar en favor de dinámicas port-hamiltonianas con estructura de haces (sheaves) y conservación de espacio de fases.

El interés del modelo no reside en su rendimiento bruto, sino en el fenómeno que documenta su model card: el SFT provoca una reorganización topológica de "solitones" internos, disolviendo las condensaciones de las capas 7 y 8 y nucleando una nueva en la capa 5. El autor sostiene que este patrón ("Early Nucleation") es intrínseco a la arquitectura y no depende del schedule de learning rate, lo que lo convierte en un objeto de estudio para quienes investigan interpretabilidad mecanicista y dinámica interna de redes neuronales.

Con 16 capas, dimensión D=1664 y 64 slots, el modelo se posiciona como un experimento de investigación más que como un modelo de producción: registra 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y sus métricas publicadas (perplejidad de 158,77 en WikiText-103 y 20,50 en razonamiento CoT) son modestas en términos absolutos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) con dinámica port-hamiltoniana |
| Parámetros totales | 532M |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 1,8 GB) |
| Dimensión del modelo | D=1664 |
| Capas | 16 |
| Slots | 64 |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) se describe mediante la ecuación de evolución ḟ = {f,H} + [f,S], con estabilidad de Lyapunov y conservación de espacio de fases. Combina corchetes de Poisson (parte hamiltoniana, {f,H}) con una estructura disipativa o de corchete de Lyapunov ([f,S]), lo que la aleja del transformer convencional y la acerca a formulaciones de sistemas dinámicos conservativos. El modelo tiene 16 capas, dimensión de representación D=1664 y 64 slots.

El ajuste fino se realizó mediante SFT durante 2500 pasos sobre supervisión de cadena de pensamiento (CoT). La model card documenta la topología de solitones antes y después del entrenamiento: la topología base es un "Crystallized Cluster" en [L7, L8, L9, L15], mientras que tras el SFT se obtiene la topología "Early Nucleation" en [L5, L9, L15], con L7 y L8 disueltas y L5 nucleada. Los valores de participación (PR) post-SFT son 2,764 en L5 (Near-Exact), 2,210 en L9 (Near-Exact) y 1,000 en L15 (EXACT). El autor afirma que la nucleación en L5 es intrínseca a la arquitectura, confirmada mediante comparación controlada con schedules de learning rate estándar y comprimido.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales al SFT.

## Capacidades

- Generación de texto en inglés, con ajuste por instrucciones mediante SFT.
- Razonamiento de cadena de pensamiento (CoT), evaluado con una puntuación de 20,50 en la métrica de razonamiento CoT del autor.
- Modelado de lenguaje autoregresivo estándar (evaluado mediante perplejidad en WikiText-103).
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma del modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo sirve como banco de pruebas para estudiar cómo el SFT reorganiza la dinámica interna de una red, comparando la topología de solitones pre y post-entrenamiento documentada en la model card.
- Estudio de arquitecturas alternativas al transformer: útil para investigadores que quieran reproducir o extender la formulación port-hamiltoniana con haces y evaluar su viabilidad frente a transformers de tamaño comparable.
- Experimentos de dinámica de entrenamiento: permite analizar la hipótesis de "condensation migration" desde capas medias hacia capas tempranas bajo supervisión CoT, con schedules de learning rate controlados.
- Generación de texto en inglés de baja exigencia: con 532M de parámetros puede emplearse en tareas de completado o generación simple donde la perplejidad de 158,77 en WikiText-103 sea aceptable.
- Docencia y divulgación: como ejemplo didáctico de sistemas dinámicos aplicados a redes neuronales (corchetes de Poisson, estabilidad de Lyapunov) en cursos de posgrado.
- Reproducción de experimentos académicos: al publicarse bajo Apache 2.0, el modelo y sus pesos pueden reutilizarse en publicaciones que comparen arquitecturas no transformer con métricas de perplejidad y CoT.

## Benchmarks y rendimiento

| Métrica | Puntuación |
|---|---|
| WikiText-103 (perplejidad) | 158,77 |
| CoT Reasoning | 20,50 |

El autor indica que es el mejor resultado de retención en WikiText-103 entre sus variantes SFT de 2500 pasos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: con 532M de parámetros, en FP16 requiere aproximadamente 1,1 GB solo para pesos; en FP32 unos 2,1 GB. La VRAM total dependerá de la longitud de contexto y del runtime, no especificados.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos en precisión reducida; no se dispone de datos de latencia ni throughput.
- Compatibilidad con GPU de consumo: probable en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que exista soporte del runtime para la arquitectura RMSN.
- Opciones de despliegue: no disponible. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura no es un transformer estándar y el formato de pesos no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-532M-EarlyNucleation-SFT2500 | 532M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| GPT-2 medium | 355M | 1024 | MIT | Ampliamente disponible |
| Qwen2.5-0.5B | 494M | 32 768 | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360M | 8192 | Apache 2.0 | Hugging Face |

La comparación directa de rendimiento no es posible: los modelos de referencia publican resultados en MMLU, HumanEval y GSM8K, mientras que RMSN solo reporta perplejidad en WikiText-103 y una métrica CoT propia. La diferencia fundamental es arquitectónica: los alternativos son transformers convencionales con soporte maduro en runtimes de inferencia, mientras que RMSN emplea dinámica port-hamiltoniana sin ecosistema de despliegue documentado.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en Hugging Face: no hay evidencia de uso en producción ni validación externa.
- Perplejidad elevada en WikiText-103 (158,77), muy por encima de transformers de tamaño similar, lo que sugiere una calidad de modelado de lenguaje limitada.
- Puntuación CoT de 20,50 sin contexto sobre la escala o el benchmark empleado; no es comparable con métricas estándar.
- Solo soporta inglés según la etiqueta de idioma; no hay datos sobre otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Formato de pesos no especificado: el repo ocupa 1,8 GB, lo que sugiere pesos en FP16/FP32, pero no se confirma compatibilidad con safetensors, GGUF ni runtimes estándar.
- Riesgo de alucinación no evaluado; sin datos de RLHF/DPO que mitiguen comportamientos indeseados.
- Sesgos desconocidos: no se documenta composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la falta de soporte de runtimes y de documentación de inferencia hace arriesgado su despliegue en producción.
- Las afirmaciones sobre topología de solitones y "condensation migration" provienen únicamente del autor y no han sido replicadas de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-EarlyNucleation-SFT2500
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
