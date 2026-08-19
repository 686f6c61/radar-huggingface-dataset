# Sejibeji/MetriplecticLayers

## Resumen

MetriplecticLayers es una clase de capa neuronal desarrollada por Sejibeji que implementa de forma discreta y exacta las dinámicas GENERIC (metriplécticas), un formalismo matemático utilizado para modelar sistemas físicos con conservación y disipación de energía. A diferencia de las redes neuronales físicas convencionales, que aproximan invariantes en el límite continuo y sufren deriva numérica al integrar, esta capa garantiza que los invariantes se mantengan a precisión de máquina en cada paso, independientemente de los parámetros o del entrenamiento. El modelo se presenta como una contribución de investigación, con un manuscrito en formato Nature Machine Intelligence y resultados reproducibles almacenados en repositorios públicos.

La capa se instancia en tres arquitecturas: MLP (donde la profundidad equivale al tiempo de integración), RNN (la capa actúa como célula recurrente) y GNN (propagación de mensajes en mallas, conservando la masa del campo predicho). Está orientada a aplicaciones de "IA física", como la simulación de dinámicas de largo horizonte sin que la física se desmorone. El repositorio de HuggingFace contiene los pesos entrenados en formato safetensors, aunque no se especifican el número de parámetros, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa metriplectica discreta (MLP, RNN, GNN) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La capa implementa un paso discreto de flujo metriplectico con tres canales: un flujo balanceado que conserva la suma de los estados (Σh), una fricción métrica basada en la transformada de Cayley de una matriz semidefinida positiva que garantiza la contracción de la norma (‖h'‖ ≤ ‖h‖), y una rotación opcional que conserva la norma exactamente. El canal de fricción incluye una compuerta aprendible que comienza cerrada (σ ≈ 0) y debe abrirse para representar disipación, forzando al modelo a decidir si el sistema es abierto o cerrado.

El entrenamiento se realiza sobre datos de sistemas físicos (resorte, resorte amortiguado, Kepler, advección-difusión) y los resultados se reportan como medianas sobre 3 semillas. No se especifican el número de tokens ni el dataset de entrenamiento, pero la model card indica que los invariantes se mantienen exactos incluso con presupuestos de datos reducidos (25%, 50%, 100%). La innovación clave es que la exactitud es una propiedad algebraica de la propia capa, no del integrador numérico, lo que elimina la deriva en despliegues de largo horizonte.

## Capacidades

- Simulación de dinámicas físicas con conservación exacta de invariantes (masa, norma, energía) a precisión de máquina.
- Representación de sistemas conservativos y disipativos mediante la compuerta de fricción aprendible.
- Integración como MLP (profundidad = tiempo), RNN (célula recurrente) o GNN (propagación en mallas).
- Estabilidad a largo plazo en RNN: la norma latente se mantiene acotada por construcción (error ~3.8×10⁻¹⁶ en 2× el horizonte de entrenamiento).
- Eficiencia de datos: los invariantes se mantienen exactos incluso con presupuestos de datos reducidos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento conversacional.

## Casos de uso

- Simulación de sistemas mecánicos: modelar resortes, péndulos o sistemas planetarios (Kepler) con conservación exacta de energía y momento, útil en robótica o control predictivo.
- Predicción de dinámicas de fluidos: la variante GNN conserva la masa del campo predicho en problemas de advección-difusión, aplicable a meteorología o ingeniería de procesos.
- Modelado de sistemas disipativos: la compuerta de fricción permite representar amortiguamiento o pérdidas energéticas sin violar la segunda ley de la termodinámica.
- Redes neuronales recurrentes estables: como célula RNN, garantiza que la norma del estado latente no explote, útil para secuencias largas en series temporales físicas.
- Integración en pipelines de IA física: puede sustituir a NeuralODE o HNN en aplicaciones donde la deriva numérica a largo plazo sea inaceptable, como simulación en tiempo real.
- Investigación en física computacional: como herramienta para estudiar la relación entre estructura de red y leyes de conservación, con resultados reproducibles y código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. La model card reporta métricas propias de la capa, medidas sobre sistemas físicos:

| Metrica | Resultado |
|---|---|
| Deriva latente estructural (float64) | ~10⁻¹³ en todos los modelos metriplecticos |
| Deriva de masa de campo (GNN metriplectica vs GNN plana) | ~10⁻¹³ vs ~10⁻¹ en advección-difusión |
| Fidelidad de un paso | NeuralODE es el más ajustado; metriplectico en la banda MLP |
| Ratio de crecimiento de horizonte (resorte) | muy por debajo de NeuralODE/LSTM/HNN, comparable a ResMLP |
| Compuerta de fricción | nace cerrada; medida ≈ 0.003 en resorte amortiguado |
| RNN sobre 2× horizonte | norma exacta (~3.8×10⁻¹⁶); LSTM ajusta mejor (0.43 vs 0.86) pero sin invariantes |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible.
- Al ser una capa de tamaño reducido (no un LLM), es plausible que quepa en GPUs de consumo (p. ej., RTX 3060 o superiores), pero no hay datos confirmados.
- Opciones de despliegue: no se mencionan frameworks como vLLM, llama.cpp u Ollama; el repositorio incluye un script `usage.py` de cero instalación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara implícitamente con NeuralODE, LSTM, HNN y ResMLP en tareas de dinámica física:

| Modelo | Tipo | Conservación de invariantes | Fidelidad de un paso | Estabilidad a largo plazo |
|---|---|---|---|---|
| MetriplecticLayers | Capa discreta metriplectica | Exacta a precisión de máquina | En la banda MLP | Garantizada por construcción |
| NeuralODE | Ecuación diferencial neuronal | Solo en límite continuo | La más alta en benchmarks | No garantizada |
| HNN (Hamiltonian Neural Network) | Red hamiltoniana | Aproximada, depende del integrador | No reportado | No garantizada |
| LSTM | Red recurrente estándar | Ninguna | Más alta que metriplectico en RNN (0.43 vs 0.86) | Sin garantías |

No se dispone de comparaciones con otros modelos de la misma categoría fuera de estos.

## Limitaciones y advertencias

- Es un trabajo de investigación, no un producto listo para producción; la licencia no está especificada, por lo que el uso comercial es incierto.
- No es un modelo de lenguaje: no puede realizar tareas de NLP, generación de texto o razonamiento simbólico.
- La exactitud de los invariantes se mide en sistemas físicos concretos; su generalización a otros dominios no está demostrada.
- La fidelidad de un paso es inferior a NeuralODE en benchmarks suaves, lo que puede limitar su uso en problemas donde el ajuste inmediato sea crítico.
- La elección de canales (conservación de Σh vs ‖h‖) afecta al rendimiento según el sistema (p. ej., en Kepler la circulación perjudica), por lo que requiere conocimiento físico previo.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, al no ser un modelo generativo.
- Los resultados reportados provienen de la model card del autor y no han sido replicados de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sejibeji/MetriplecticLayers
- Space de HuggingFace (proyecto y papers): https://huggingface.co/spaces/Sejibeji/metriplectic-layers
- Resultados en Kaggle: https://www.kaggle.com/datasets/sehajrsingh/metriplectic-layers-results
- Manuscrito (en el repositorio): manuscript.pdf (formato Nature Machine Intelligence)
