# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la serie "Semantic Simulation" (semsimula), un programa experimental que explora modelos de lenguaje no-transformer basados en mecánica lagrangiana y potenciales escalares conservativos. El modelo parte de la arquitectura SR2, que integra cada token como una partícula amortiguada sobre las 16 direcciones más rígidas de su potencial, y le añade una cabeza de amortiguamiento aprendida por token (ζ(h)) que ajusta dinámicamente la tasa de amortiguamiento de los modos rígidos.

La relevancia de este modelo es fundamentalmente metodológica: forma parte de un estudio escalonado (ladder study) pre-registrado que ablaciona un mecanismo concreto —el amortiguamiento dependiente de posición— manteniendo constantes arquitectura, corpus, schedule y semilla. El resultado principal es que el amortiguamiento aprendido queda un 1,7 % por detrás de SR2 en perplexidad de validación (59,29 frente a 58,32), lo que sugiere que el amortiguamiento ligero de SR2 es mejor que cualquier variante más amortiguada probada en esta familia.

El modelo tiene 384 dimensiones de estado, entrena sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens, y está diseñado para inferencia de memoria constante sin mecanismo de atención. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, attention-free; modelo de simulación semántica conservativa de segundo orden con potencial lagrangiano y flujo geométrico riemanniano (familia SR2) |
| Parametros totales | no disponible (repo de 0,3 GB; la cabeza de amortiguamiento añade 24.705 parámetros sobre SR2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluación a block 512; sin dato explícito de ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pytorch (checkpoint PyTorch; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SR2 de semsimula, una arquitectura que abandona el transformer y la atención. Cada token se integra como una partícula sometida a un potencial escalar conservativo, con un integrador BAOAB (variante de dinámica molecular tipo Langevin) y geometría riemanniana basada en la métrica de Jacobi; las geodésicas riemannianas definen la dinámica sobre el potencial gaussiano anisotrópico. SR2 integra exactamente las 16 direcciones más rígidas del potencial de cada token como osciladores amortiguados con una tasa base γ₀ = 0,1 (amortiguamiento ligero, ratio total ≈ 0,03 en el modo más rígido de un token típico). La inferencia es de memoria constante por construcción, al no requerir atención sobre el contexto completo.

La innovación concreta de este modelo es la cabeza de amortiguamiento aprendida: un mapa lineal de 384 entradas a 64 unidades ocultas, activación GELU y mapa lineal a un escalar s(h), con 24.705 parámetros. El ratio se define como ζ(h) = 0,005 × exp(s(h)), acotado a 10, y cada modo rígido i se amortigua a tasa γ₀ + 2 ζ(h) ωᵢ dentro del mismo flujo exacto de SR2, mientras el resto de direcciones conserva γ₀. La última capa de la cabeza se inicializa a cero, de modo que al inicio el modelo es bit-idéntico a SR3 en ese ratio fijo (ζ = 0,005), y la exponencial garantiza que solo puede añadir amortiguamiento, nunca reducirlo por debajo del de SR2.

El entrenamiento usó exactamente 532.480.000 tokens (32.500 pasos × 32 × 512) sobre OpenWebText, con semilla 0 y el schedule del ladder Gen 3. No se mencionan fases de RLHF ni DPO; el entrenamiento es de lenguaje autorregresivo estándar con la pérdida de modelado de lenguaje. El estudio está pre-registrado en el repositorio semsimula-paper (nota SR_Series_Settling_and_Refinement.md) con hipótesis y probabilidades declaradas antes de la ejecución; el run reporta 0 activaciones de watchdog, 0 capturas de spike, monitor de fuga SCAF limpio en cada auditoría y norma de gradiente máxima de 1,16.

## Capacidades

- Generación de texto autorregresiva en inglés, con modelado de lenguaje causal sobre OpenWebText.
- Razonamiento de secuencia mediante integración de dinámica de partículas sobre potenciales conservativos, sin atención.
- Inferencia de memoria constante, adecuada para contextos largos sin crecimiento lineal de memoria.
- Amortiguamiento adaptativo por token: la cabeza ζ(h) ajusta por token y por capa la tasa de amortiguamiento de los modos rígidos.
- No soporta tool calling ni function calling (no se documenta en la model card).
- No soporta agentes ni multi-step reasoning explícito (no documentado).
- Capacidades multilingües limitadas al inglés (language: en).
- No dispone de visión, audio ni modo thinking documentados.
- Modelo de investigación: no está optimizado para despliegue en producción.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de comparación controlado en estudios de ablación de mecanismos físicos (amortiguamiento, orden de integración, geometría), gracias a que comparte corpus, schedule y semilla con SR2 y las demás variantes del ladder.
- Estudio de la relación entre amortiguamiento y perplexidad: permite analizar empíricamente cómo afecta el amortiguamiento aprendido por token a la convergencia y al sobreajuste, con datos de medianas de ζ por capa (0,56 en capa 0, 0,36 en capa 1).
- Validación de modelos pre-registrados: útil como caso de estudio de metodología científica reproducible, con hipótesis GH2, GH6, GH7, GH8 y GH9 declaradas antes del entrenamiento y verificadas después.
- Experimentos de inferencia de memoria constante: al ser attention-free, puede probarse en escenarios de streaming o generación de secuencias largas donde el coste de memoria de la atención sería prohibitivo.
- Reproducción de resultados: con 501 descargas y pesos PyTorch publicados, permite reproducir la perplexidad de validación de 59,29 en block 512 y comparar con SR2 (58,32).
- Generación de texto de dominio general en inglés para evaluación académica: útil como baseline no-transformer en benchmarks de perplexidad sobre OpenWebText validation.
- Análisis de estabilidad de entrenamiento: el run documenta métricas de salud (norma de gradiente máxima 1,16, cero spikes), útil para estudiar la estabilidad de integradores BAOAB en modelos de lenguaje.

## Benchmarks y rendimiento

| Modelo | Amortiguamiento del modo más rígido | Perplexidad de validación (block 512, settled) | Diferencia frente a SR2 |
|---|---|---|---|
| SR2 | ligero: γ₀ = 0,1, ratio total ≈ 0,03 | 58,32 | — |
| semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh (este modelo) | moderado: ratios totales ≈ 0,59 (capa 0) y 0,39 (capa 1) | 59,29 | +1,7 % |
| FO-b | límite sobreamortiguado: sin velocidad en ninguna dirección | 61,16 | +4,9 % |
| SR3-crit | crítico: ratio total ≈ 1,03 | 63,28 | +8,5 % |

Datos adicionales del modelo: perplexidad settled 59,29 (media de las tres últimas evaluaciones: 59,16, 59,33, 59,38); mejor perplexidad 57,31 en el paso 31.000. Los cuatro brazos comparten arquitectura, corpus, schedule y semilla. Resultados declarados por el autor en la model card, no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 0,3 GB y la arquitectura es attention-free con memoria constante, lo que sugiere huella reducida, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponibles; por tamaño del checkpoint, cualquier GPU consumer con varios GB de VRAM debería poder cargarlo, pero no se confirma en la documentación.
- Compatibilidad con GPU consumer: probable por el tamaño del repo (0,3 GB), aunque no verificado ni documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch no-transformer, requeriría el código propio de semsimula para la integración BAOAB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | Contexto | Perplexidad (OWT val, block 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (SR2 + ζ(h) aprendido) | semsimula SR2, 2.º orden, attention-free | no disponible (cabeza de 24.705 params sobre SR2) | no disponible | 59,29 | CC-BY-4.0 | Hugging Face (PyTorch) |
| SR2 | semsimula SR2, 2.º orden, attention-free | no disponible | no disponible | 58,32 | CC-BY-4.0 (según familia) | Hugging Face |
| FO-b | semsimula, primer orden, attention-free | no disponible | no disponible | 61,16 | CC-BY-4.0 (según familia) | Hugging Face |
| SR3-crit | semsimula SR2, amortiguamiento crítico | no disponible | no disponible | 63,28 | CC-BY-4.0 (según familia) | Hugging Face |

No se dispone de comparaciones con transformers convencionales de tamaño equivalente en la información proporcionada; la comparativa se limita a los brazos del mismo ladder, que comparten arquitectura, corpus, schedule y semilla.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está pensado para producción ni para cargas de trabajo reales.
- Solo inglés: no soporta otros idiomas de forma declarada.
- Perplexidad superior a SR2 (+1,7 %): el amortiguamiento aprendido empeora la métrica frente a la variante con amortiguamiento ligero fijo.
- Hipótesis pre-registradas falladas: GH6 (mediana de ζ < 0,3 en ambas capas), GH8 (mejora de al menos 1 % sobre SR2), GH9 (una capa con mediana ≥ 3× la otra) y GH2 (correlación de ζ con la fracción anarmónica < 0,2 en ambas capas) resultaron MISS; solo GH7 (dentro del 2 % de SR2) acertó.
- Sin tool calling, agentes ni capacidades multimodales documentadas.
- Riesgo de alucinación no medido: no se publican evaluaciones de factualidad ni de sesgos.
- Longitud de contexto máxima no documentada; la evaluación se realizó a block 512, lo que no garantiza buen comportamiento en secuencias más largas.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no incluye garantías de calidad para aplicaciones comerciales.
- Requiere el código específico de semsimula para la integración BAOAB; no es compatible con runtimes estándar de transformers sin adaptación.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (verified: false).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-gzh
- Modelo base SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante FO-b: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Variante SR3-crit: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-sr3
- Colección de amortiguamiento dependiente de posición: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-position-dependent-damping-6ada61f0754754e2f2deae3c
- Colección Gen 3 (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Nota de pre-registro SR_Series_Settling_and_Refinement.md: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/SR_Series_Settling_and_Refinement.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
