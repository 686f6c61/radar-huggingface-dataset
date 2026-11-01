# sarwar21255/genco-ieee118-finetunes

## Resumen

GENCO IEEE 118 fine-tunes es una colección de doce checkpoints de ajuste fino del modelo de flujo de potencia GENCO, desarrollado en el contexto de la GridFM GENCO Challenge 2026 por el autor sarwar21255. El modelo base es `gridfm/genco-pf-datakit`, un modelo de red neuronal sobre grafos (GNN) heterogéneo orientado a la predicción de flujos de potencia en sistemas eléctricos. Estos checkpoints no pretenden ser modelos de propósito general mejorados, sino artefactos de investigación para reproducir un estudio concreto sobre el valor de GENCO frente a un solver de Newton en análisis de contingencias.

El problema que aborda es el análisis de contingencias N-1 y N-k en redes eléctricas IEEE 118: predecir el estado (magnitudes y ángulos de tensión, Vm y Va) tras la pérdida de uno o varios elementos de la red, y evaluar si esa predicción reduce las iteraciones necesarias de un solver Newton-Raphson hasta la convergencia. La relevancia es metodológica: el estudio concluye que dar a GENCO el estado pre-contingencia ayuda poco a un solver Newton, lo que cuestiona supuestos habituales sobre el valor de los modelos de aprendizaje en este dominio.

La arquitectura es una GNN heterogénea con tamaño oculto 48, 12 capas y 8 cabezas, entrenada sobre el caso IEEE 118 Base. El repositorio ocupa 1,0 GB e incluye cuatro familias de checkpoints (residual GENCO-Δ con datos N-1, residual GENCO-Δ con datos N-k mixtos, slack-aware y control), cada una con tres semillas (0, 1, 42).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN heterogénea (`GNS_heterogeneous` / `GNS_heterogeneous_residual`), tamaño oculto 48, 12 capas, 8 cabezas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión tabular sobre grafos, no NLP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,0 GB; checkpoints PyTorch presumiblemente, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es una red neuronal sobre grafos heterogénea aplicada al problema de flujo de potencia. La variante `PowerFlowContingencyResidual` (GENCO-Δ) emplea un decodificador residual: en cada capa, el estado de los nodos es el estado pre-contingencia más un delta aprendido, con la cabeza inicializada a cero. Esta variante recibe como entradas adicionales Vm, Va y los flujos de rama pre-contingencia. La variante `PowerFlowSlackAware` mantiene la arquitectura del modelo publicado pero trata la magnitud de tensión del bus slack como entrada conocida en lugar de incógnita enmascarada. La variante `control` reproduce la tarea original con la misma receta que la slack-aware.

El entrenamiento usa las estadísticas del normalizador del modelo publicado, AdamW, ReduceLROnPlateau (factor 0,7, paciencia 5), tamaño de lote 32, 12 épocas y la pérdida `LayeredWeightedPhysics` (0,1) + `MaskedBusMSE` (0,9). Cada ejecución requirió entre 1.700 y 1.800 pasos de optimizador y entre 28 y 42 minutos en Apple MPS, con la excepción de N-k semilla 0 (2,7 horas por suspensión de la máquina). La selección de checkpoint se hizo solo por pérdida de validación. El ajuste fino usó aproximadamente el 2 % de los datos del entrenamiento original de 250.000 escenarios, por lo que las conclusiones no se extrapolan a entrenamiento a escala completa. Los datos N-k se generaron con `configs/datakit/case118_train_nk.yaml`, con un 23,7 % de salidas de generadores y un 58,2 % de escenarios con violación.

## Capacidades

- Predicción de estado de flujo de potencia (Vm, Va) en redes IEEE 118 tras contingencias N-1 y N-k (hasta cinco elementos fuera).
- Predicción de flujos de rama como entrada auxiliar en la variante residual.
- Análisis de contingencias con evaluación de violaciones de elementos tras un paso de Newton.
- Modo residual GENCO-Δ: corrección delta sobre el estado pre-contingencia.
- Modo slack-aware: tratamiento de la tensión del bus slack como entrada conocida.
- No soporta tool calling, function calling ni razonamiento multi-paso en sentido de agentes LLM.
- No tiene capacidades multilingües ni de generación de texto: es un modelo de regresión tabular sobre grafos.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción del estudio de valor de GENCO frente a Newton: cargar los checkpoints y ejecutar la evaluación sobre los splits publicados para replicar las cifras de error de estado e iteraciones del artículo.
- Análisis de contingencias N-1 en operación planificada: usar la variante residual GENCO-Δ (N-1) para obtener una estimación inicial del estado post-contingencia con error de estado mediano de 0,022, aproximadamente 2,5 veces menor que el modelo publicado.
- Arranque en caliente de un solver Newton-Raphson: emplear la predicción del modelo como punto de partida para reducir iteraciones hasta 10⁻² MW (de 1,74 a 1,33 en la variante residual N-1).
- Evaluación de estrés N-k: usar la variante residual entrenada con datos mixtos N-1 a N-5 para escenarios con hasta cinco elementos fuera, con error de estado de 0,116 en el conjunto N-5.
- Estudio comparativo de arquitecturas: usar la familia slack-aware y la control para aislar el efecto de tratar la tensión del slack como entrada conocida frente a la receta original.
- Punto de partida para experimentos propios: reutilizar los checkpoints y las configuraciones de datos (hashes de splits incluidos en cada `run.json`) para extender el análisis a otros casos o presupuestos de entrenamiento.
- Docencia e investigación en aprendizaje aplicado a sistemas eléctricos: ilustrar el uso de GNN heterogéneas con pérdidas físicas ponderadas en problemas de flujo de potencia.

## Benchmarks y rendimiento

Resultados para IEEE 118 Base, promediados sobre semillas 0/1/42, cada semilla evaluada en su split de test publicado (616 a 814 escenarios para "paper" y 660 para el conjunto de estrés N-5 con 30 escenarios de carga). Las iteraciones son iteraciones Newton-Raphson contadas desde la salida del modelo y promediadas sobre escenarios.

| Modelo | Error de estado, paper | Error de estado, N-5 | Iteraciones a 10⁻² MW, paper | A 10⁻⁴ MW, paper | A 10⁻⁶ MW, paper | A 10⁻⁶ MW, N-5 | Fallos en un paso, N-5 (de 1.763) |
|---|---|---|---|---|---|---|---|
| released | 0,054 | 0,112 | 1,74 | 2,01 | 2,15 | 2,50 | 6,3 |
| control | 0,067 | 0,119 | 1,76 | 2,01 | 2,19 | 2,52 | 6,7 |
| slack-aware | 0,086 | 0,133 | 1,74 | 2,00 | 2,19 | 2,49 | 7,0 |
| residual GENCO-Δ (N-1) | 0,022 | 0,155 | 1,33 | 2,05 | 2,19 | 2,69 | 17,7 |
| residual GENCO-Δ (N-k mixto) | 0,062 | 0,116 | 1,79 | 2,03 | 2,14 | 2,57 | 9,0 |
| arranque pre-contingencia (sin modelo) | no disponible | no disponible | no disponible | no disponible | 2,91 | 3,32 | 129 |

El error de estado es la mediana del error L2 de (Vm, Va) predicho frente a la solución del datakit; los "fallos en un paso" cuentan elementos en violación aún no detectados tras el modelo más un paso de Newton. Pérdidas de validación mejores por familia: residual N-1 3,64e-4 / 5,58e-4 / 6,10e-4; residual N-k 7,22e-4 / 6,34e-4 / 9,44e-4; slack-aware 3,95e-4 / 3,38e-4 / 6,84e-4; control 2,76e-4 / 2,37e-4 / 5,58e-4 (semillas 0/1/42).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 1,0 GB y la arquitectura es pequeña (tamaño oculto 48, 12 capas), por lo que un solo checkpoint debería caber holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en Apple MPS, lo que sugiere que la inferencia es viable en hardware de consumo y en Apple Silicon.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo y del repositorio, aunque no se publican cifras de VRAM.
- Opciones de despliegue: la librería es `gridfm-graphkit` (commits `8a8defb` para graphkit y `d8a092d` para datakit); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El entrenamiento de 1.700 a 1.800 pasos de optimizador tardó entre 28 y 42 minutos en Apple MPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Error de estado (paper) | Iteraciones a 10⁻² MW | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GENCO released (`gridfm/genco-pf-datakit`) | no disponible | no aplica | 0,054 | 1,74 | Apache 2.0 (según repo base) | HuggingFace |
| residual GENCO-Δ (N-1) | no disponible | no aplica | 0,022 | 1,33 | Apache 2.0 | HuggingFace |
| residual GENCO-Δ (N-k mixto) | no disponible | no aplica | 0,062 | 1,79 | Apache 2.0 | HuggingFace |
| slack-aware | no disponible | no aplica | 0,086 | 1,74 | Apache 2.0 | HuggingFace |
| control | no disponible | no aplica | 0,067 | 1,76 | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos de flujo de potencia comparables en la información proporcionada.

## Limitaciones y advertencias

- No son modelos de propósito general mejorados: dos de las cuatro familias se entrenaron para probar si el estado pre-contingencia ayuda a Newton, y la respuesta del estudio es mayoritariamente negativa.
- Presupuesto de entrenamiento pequeño: aproximadamente el 2 % de los datos del entrenamiento original de 250.000 escenarios, por lo que las conclusiones no se extrapolan a entrenamiento a escala completa.
- La variante residual GENCO-Δ (N-1) mejora el error de estado en el conjunto paper pero lo empeora en N-5 (0,155 frente a 0,112 del released) y multiplica los fallos en un paso (17,7 frente a 6,3), lo que supone un riesgo de seguridad en escenarios fuera de distribución.
- La variante slack-aware no mejora las iteraciones frente al control y presenta peor error de estado en paper (0,086 frente a 0,067).
- Los checkpoints GENCO-Δ planos (`delta_vm_va*`) se excluyeron del repositorio porque acabaron en calidad cercana al caso base y una semilla divergió.
- Específico del caso IEEE 118 Base: no se documenta generalización a otras redes ni a configuraciones distintas.
- Sin datos de sesgos, alucinación o comportamiento multilingüe por no ser un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero los artefactos son de investigación y no se validan para producción.
- No se publican cifras de VRAM, latencia ni throughput, lo que dificulta dimensionar un despliegue.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sarwar21255/genco-ieee118-finetunes
- Modelo base: https://huggingface.co/gridfm/genco-pf-datakit
- Repositorio de código: https://github.com/msarwar20/genco-certified
- Dataset: https://huggingface.co/datasets/sarwar21255/genco-contingency-ieee118
- Demo: https://huggingface.co/spaces/sarwar21255/genco-operator-console
- Paper referenciado (tag arXiv): arxiv:2608.09921
