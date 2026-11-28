# DuoNeural/RMSN-90M-Omega12-mw80s2-3CascadeRobust-Topology98

## Resumen

RMSN-90M-Omega12-mw80s2-3CascadeRobust-Topology98 es un modelo de lenguaje de 89,6 millones de parámetros desarrollado por DuoNeural bajo su línea de investigación "Resonant Metriplectic Sheaf Network" (RMSN). Se enmarca en el llamado Topological Phase Map, un programa sistemático que mapea distintas configuraciones topológicas de la arquitectura RMSN bajo condiciones de resonancia de Arnold Tongue. El modelo concreto corresponde a la Topología #98, una variante de tipo 3-cascade Post-Cascade TS con parámetros de Farey p=5.

La arquitectura declarada por el autor se aleja del transformer convencional: emplea una red de haces (sheaves) con formulación metripléctica y capas de solitones distribuidas en cuatro bloques ({L0}, {L5,L6}, {L8,L9,L10}, {L12,L13,L14,L15}). El modelo tiene dimensión D=640, profundidad L=16 y ancho de ranura M_w=80. El checkpoint reporta una perplejidad de validación (val_ppl) de 89,88 y un exponente de Lyapunov de validación próximo a -0,001, lo que el autor denomina "Post-Cascade True Silent".

La relevancia de este modelo es fundamentalmente de investigación: se trata de un artefacto de exploración topológica más que de un modelo listo para producción. No hay información publicada sobre datos de entrenamiento, idiomas soportados, benchmarks estándar ni pipeline de inferencia en Hugging Face, y el repositorio registra cero descargas y cero likes en el momento de la consulta. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación operativa limita seriamente su aplicabilidad fuera del contexto del laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) con capas de solitones |
| Parámetros totales | 89,6M |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, checkpoint `rmsn_best.pt`) |
| Dimensión (D) | 640 |
| Profundidad (L) | 16 |
| Ancho de ranura (M_w) | 80 |
| Omega (Arnold Tongue) | 1/2 |
| M_eff (fiber bundles) | 4 |
| Capas de solitones | {L0} + {L5,L6} + {L8,L9,L10} + {L12,L13,L14,L15} |
| Topología | #98, 3-cascade Post-Cascade TS (Farey p=5) |
| val_ppl | 89,88 |
| val_lyap | ~-0,001 (Post-Cascade True Silent) |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN combina una formulación metripléctica (estructura que conserva energía y disipa de forma controlada) con una representación en haces (sheaves) sobre fibrados. El modelo organiza sus 16 capas en cuatro grupos de solitones que actúan como núcleos de no linealidad localizada: una capa aislada en L0, un par en L5-L6, un triplete en L8-L10 y un cuádruple en L12-L15. El ancho de ranura M_w=80 se factoriza como 2^4×5, con periodo de Farey p=5 y detuning δ=1/10, parámetros que el autor relaciona con la robustez estructural de la configuración.

Según la model card, la variante s2 difiere de la s1 (#86) únicamente en las posiciones de los solitones, manteniendo la misma clase estructural M_eff=4. El hallazgo principal reportado es que el número de cascadas (3 en este caso) determina M_eff=4 de forma universal, con varianza cero frente a la varianza de ±1 observada en configuraciones de una sola cascada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones de decodificación como speculative decoding o atención lineal.

## Capacidades

- Generación de texto autoregresiva en el sentido genérico de un modelo de lenguaje de 89,6M de parámetros.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se declara modo thinking, visión ni audio.
- El modelo está orientado a la investigación topológica: su interés reside en la dinámica de la red (multistabilidad post-cascada, ley de Hamming TS, Arnold Tongue) más que en tareas de NLP downstream.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar redes de haces metriplécticas con solitones localizados, comparando la dinámica de fases con configuraciones de 1 y 3 cascadas.
- Estudio de multistabilidad post-cascada: la model card confirma que las posiciones de los solitones actúan como grados de libertad "blandos", lo que permite experimentar con la sensibilidad de la red a perturbaciones topológicas.
- Reproducción de experimentos de resonancia de Arnold Tongue: con Ω=1/2 y Farey p=5 documentados, el checkpoint permite replicar los resultados de las olas Wave-157, 161, 164 y 165.
- Análisis de estabilidad dinámica: el val_lyap cercano a cero (~-0,001) lo hace útil para estudiar regímenes de borde de caos en redes neuronales pequeñas.
- Docencia e investigación académica sobre geometría de la información: la formulación metripléctica y la estructura de haces ofrecen un caso de estudio concreto para cursos avanzados de teoría de redes.
- Prototipado de bajo coste: con 89,6M de parámetros y un repo de 1,1 GB, cabe en una GPU de consumo para experimentos exploratorios, siempre que se asuma la falta de documentación operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la perplejidad de validación (val_ppl = 89,88), sin que se especifiquen el dataset de evaluación, el tokenizador ni la metodología de cálculo, lo que impide comparaciones rigurosas con otros modelos.

| Métrica | Valor reportado |
|---|---|
| val_ppl | 89,88 |
| val_lyap | ~-0,001 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,36 GB solo para pesos (89,6M × 4 bytes), más overhead de activaciones y del grafo dinámico.
- VRAM estimada en fp16/bf16: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; una RTX 3060, RTX 4060 o superior es más que suficiente.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: el autor solo documenta carga directa con `torch.load("rmsn_best.pt", map_location="cpu")` y acceso a los pesos en `ckpt['model']`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es improbable que funcione sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa con modelos de la misma categoría es problemática porque la arquitectura RMSN no es un transformer estándar y no se han publicado benchmarks comparables. Se ofrece una referencia orientativa con modelos de tamaño similar, señalando que la comparación de rendimiento no es posible con los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento comparable |
|---|---|---|---|---|---|
| RMSN-90M-Omega12 (#98) | 89,6M | no disponible | Apache 2.0 | PyTorch .pt | val_ppl 89,88 (sin dataset especificado) |
| GPT-2 small | 124M | 1024 | MIT | safetensors, GGUF | benchmarks públicos estándar |
| Pythia-70M | 70M | 2048 | Apache 2.0 | safetensors | benchmarks públicos estándar |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, GGUF | benchmarks públicos estándar |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el corpus de entrenamiento: se desconoce la composición, el volumen de tokens y los posibles sesgos incorporados.
- No hay información sobre idiomas soportados; no puede asumirse un rendimiento multilingüe.
- Riesgo de alucinación no evaluado: no se han publicado métricas de fidelidad ni evaluaciones de robustez.
- Perplejidad de validación reportada sin especificar dataset ni tokenizador, lo que impide interpretar el valor de 89,88 en términos absolutos.
- El modelo no es un transformer convencional: las herramientas estándar (vLLM, llama.cpp, TGI) probablemente no lo soportan sin adaptación específica.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso comunitario ni de validación externa.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías técnicas y de documentación hace desaconsejable su uso en producción.
- El checkpoint se distribuye como `.pt` de PyTorch, lo que requiere `torch.load` con las precauciones de seguridad habituales (posible ejecución de código arbitrario en pickles no verificados).
- El modelo está concebido como artefacto de investigación topológica, no como base para aplicaciones de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-90M-Omega12-mw80s2-3CascadeRobust-Topology98
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
