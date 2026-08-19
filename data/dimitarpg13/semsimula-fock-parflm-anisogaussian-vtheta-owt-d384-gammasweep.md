# dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d384-gammasweep

## Resumen

Este repositorio contiene los ocho checkpoints de un barrido de coeficientes de amortiguación (gamma sweep) del modelo Fock-PARFLM v2.1 con potencial escalar anisotrópico gaussiano condicionado por profundidad y regularización de acoplamiento Fock, escalado a d=384, L=16 y entrenado sobre OpenWebText. Lo desarrolla Dimitar P. Gueorguiev, investigador independiente, dentro del marco Semantic Simulation, un enfoque de modelos de lenguaje conservadores por construcción basados en mecánica lagrangiana y potenciales escalares.

No es un modelo final entrenado: cada uno de los ocho checkpoints ha visto únicamente 3.000 pasos de entrenamiento (~50 millones de tokens), y su propósito es seleccionar el coeficiente de amortiguación gamma óptimo para el entrenamiento completo posterior de 100.000 pasos. El resultado principal es que tanto la perplejidad mínima como el residuo geodésico mínimo coinciden en gamma = 0,10, un hallazgo que los autores presentan como evidencia de que la trayectoria más predictiva también es la más fiel geométricamente en esta familia de arquitecturas.

La arquitectura es no-transformer, sin atención, con memoria de inferencia constante y basada en un potencial escalar analíticamente diferenciable, lo que permite el cálculo cerrado de una métrica de Jacobi. El repositorio tiene 7,4 GB e incluye los ocho checkpoints completos, pero no está pensado para generar texto fluido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no-transformer, sin atención, modelo conservador basado en potencial escalar) |
| Parametros totales | no disponible (el repositorio de 7,4 GB contiene 8 checkpoints) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (no se especifica safetensors) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Fock-PARFLM v2.1, una arquitectura puramente conservativa: no hay capas de atención ni transformadores, sino un potencial escalar (en esta variante, un potencial anisotrópico gaussiano condicionado por profundidad, con regularización de acoplamiento Fock) que define la dinámica de los estados ocultos. Incorpora un conjunto de registros virtuales (M=16 partículas de registro) con puertas de creación estructuradas Q/K/V, disciplina de pila LIFO y un canal reverso opcional no conservativo. La inferencia mantiene memoria constante.

El entrenamiento se realizó sobre OpenWebText con un tamaño de bloque de 512 tokens y batch efectivo de 16. Cada uno de los ocho checkpoints se entrenó durante 3.000 pasos, uno por cada valor de gamma en {0,05, 0,10, 0,15, 0,20, 0,25, 0,30, 0,40, 0,50}. Además de la perplejidad, cada checkpoint se evaluó con un diagnóstico de residuo geodésico amortiguado \(\bar{R}(\gamma)\), una métrica cerrada (sin entrenamiento adicional ni autodiferenciación a través de la métrica aprendida) que mide cuánto se desvía la trayectoria de los estados ocultos de una geodésica de la métrica riemanniana de Jacobi inducida por el propio potencial aprendido.

La innovación técnica destacable es la combinación de un potencial escalar acotado y analíticamente diferenciable con el formalismo de la mecánica lagrangiana, lo que permite un diagnóstico geométrico cerrado que no está disponible en arquitecturas basadas en atención o en potenciales MLP. Los autores reportan que el mínimo de perplejidad y el mínimo del residuo geodésico coinciden en gamma = 0,10, un hallazgo que previamente se había confirmado en d=768 y d=1024, pero que en d=384 con la variante isotrópica mostraba el resultado opuesto (mínimos separados por un factor de 5).

## Capacidades

- Generación de texto experimental, pero no fluida: el modelo no está entrenado para producir texto coherente (solo 3.000 pasos por checkpoint).
- Diagnóstico geométrico: permite calcular el residuo geodésico de Jacobi en forma cerrada, sin entrenamiento adicional ni autodif.
- Inferencia con memoria de memoria constante: al ser no-transformer y sin atención, la memoria de inferencia no escala con la longitud de contexto.
- Análisis de regímenes de amortiguación: cada checkpoint permite estudiar el comportamiento de corto horizonte para distintos valores de gamma, incluyendo la anomalía de divergencia y recuperación parcial en gamma = 0,20.
- Comparación de fidelidad geodésica entre regímenes de amortiguación sobre un potencial acotado y diferenciable analíticamente.
- Soporte multilingüe limitado: únicamente inglés.

## Casos de uso

- Investigación en modelos de lenguaje conservadores: permite reproducir y extender la metodología de selección de gamma para la línea Fock-PARFLM con potencial anisotrópico gaussiano y regularización Fock en d=384.
- Estudio del régimen de amortiguación: cada checkpoint sirve para analizar el comportamiento de corto plazo de la trayectoria de estados ocultos para un valor concreto de gamma, incluyendo la anomalía de divergencia parcial en gamma = 0,20.
- Validación del diagnóstico geodésico: el cálculo cerrado del residuo geodésico de Jacobi ofrece un instrumento de análisis estructural que no está disponible en arquitecturas basadas en atención, útil para contrastar hipótesis sobre la relación entre predictividad y fidelidad geométrica.
- Comparativa de escalado: los resultados a d=384 se pueden contrastar con los barridos previos a d=768 y d=1024 para estudiar la transición de régimen de amortiguación en función del ancho.
- Reproducción de la metodología de selección de hiperparámetros: el repositorio documenta el proceso completo de barrido de gamma, desde la definición de candidatos hasta la elección del valor óptimo para el entrenamiento posterior de 100.000 pasos.
- Docencia e investigación en arquitecturas alternativas a transformers: como ejemplo de modelo no-transformer, sin atención y con memoria de inferencia constante, es un caso de estudio útil para evaluar el estado del arte en arquitecturas emergentes.

## Benchmarks y rendimiento

El único resultado declarado por el autor es la perplejidad de validación sobre OpenWebText para el mejor candidato del barrido:

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| semsimula-fock-parflm-anisogaussian-vtheta-owt-d384-gammasweep (gamma=0,10, 3.000 pasos) | OpenWebText | validation | Perplexity | 278,27 |

Para contextualizar, el propio autor indica que un checkpoint hermano entrenado con 250.000 pasos (variante isotrópica, misma familia) alcanza 27,23 de perplejidad en OpenWebText, y el ancla de TinyStories de la misma familia logra 9,30 PPL. Este repositorio no está diseñado para competir en calidad de generación: su valor está en el diagnóstico, no en el rendimiento final.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. A partir del tamaño del repositorio (7,4 GB con ocho checkpoints) se puede estimar que cada checkpoint ocupa aproximadamente 0,9 GB en precisión de 32 bits, lo que sugiere un modelo de alrededor de 200-250 millones de parámetros, aunque el dato exacto no está disponible. La inferencia en CPU con un solo checkpoint sería viable en memoria (menos de 1 GB de pesos), pero no se documentan latencias ni throughput. El entrenamiento se realizó en Google Colab, según se indica en la model card.

## Comparativa con modelos similares

| Modelo | Arquitectura | d | Pasos | PPL OpenWebText | Propósito |
|---|---|---|---|---|---|
| semsimula-fock-parflm-anisogaussian-vtheta-owt-d384-gammasweep (este) | Fock-PARFLM anisotrópico + Fock reg | 384 | 3.000 | 278,27 | Barrido de diagnóstico de gamma |
| semsimula-fock-parflm-depthcond-vtheta-openwebtext | Fock-PARFLM isotrópico condicionado por profundidad | no disponible | 250.000 | 27,23 | Modelo final entrenado |
| semsimula-fock-parflm | Fock-PARFLM v2.1 | no disponible | no disponible | 9,30 (TinyStories) | Mejor modelo conservador de la familia |

La comparación directa con arquitecturas transformer (GPT, Llama, Mistral) no es significativa en este punto de desarrollo, ya que este repositorio es un barrido de diagnóstico y no un modelo de producción.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: solo ha visto 3.000 pasos de entrenamiento y no produce texto fluido. La model card lo advierte explícitamente: no usar si se busca un modelo bien entrenado.
- Perplejidad alta: 278,27 PPL, muy por encima de los modelos entrenados de la misma familia.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Datos de entrenamiento: OpenWebText, con los sesgos y limitaciones inherentes a un corpus de extracción web.
- Licencia CC-BY-4.0: permite uso comercial y modificación con atribución, pero es una licencia de datos y contenidos, no una licencia de software específica; conviene revisar los términos para uso en producción.
- Sin garantías de rendimiento en producción: no se han documentado latencias, throughput ni pruebas de robustez.
- Naturaleza experimental: la arquitectura no-transformer con memoria constante y el diagnóstico geodésico son innovaciones de investigación no validadas en entornos de producción.
- El autor declara que la regularización de Fock y el residuo geodésico son herramientas de diagnóstico, no de entrenamiento, y que el resultado de coincidencia de mínimos en gamma = 0,10 es específico de esta arquitectura y corpus; no es generalizable a otras familias de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta-owt-d384-gammasweep
- Modelo hermano entrenado (isotópico, 250K pasos): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta-openwebtext
- Modelo base de la familia (Fock-PARFLM v2.1): https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Repositorio GitHub del paper: https://github.com/dimitarpg13/semsimula-paper
- Documento de análisis del gamma sweep: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Scale-Up_Gamma_Sweep_Results_and_Damping_Regime_Analysis.md
- DOI del marco Semantic Simulation: https://doi.org/10.5281/zenodo.19712427
