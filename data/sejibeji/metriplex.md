# Sejibeji/Metriplex

## Resumen

Metriplex es una capa neuronal diseñada para sistemas físicos que requieren que las invariantes dinámicas se mantengan exactas a nivel algebraico, no solo en el límite continuo. Desarrollada por Sejibeji, esta capa implementa un paso de flujo metripléctico discreto con tres canales: flujo balanceado (conservación de suma), fricción métrica (disipación controlada) y rotación (conservación de norma). La propuesta resuelve el problema de deriva numérica en modelos que integran dinámicas aprendidas durante largos horizontes, garantizando que las leyes de conservación se cumplan hasta precisión de máquina en cada paso.

La capa se instancia como MLP (donde la profundidad equivale al tiempo de integración), RNN (la capa actúa como celda en cada paso de rollout) y GNN (paso de mensajes sobre mallas, conservando masa del campo predicho). El autor reporta resultados experimentales en problemas de advección-difusión, osciladores y sistemas de Kepler, mostrando que la estructura impuesta por la capa reduce el drift latente a ~10⁻¹³ en float64 y ~10⁻⁷ en float32, mientras que los modelos baseline sin estructura no poseen cantidades conservadas medibles.

Aunque el repositorio de Hugging Face figura con 0 descargas y 0.0 GB de tamaño, la documentación incluye un manuscrito en formato Nature Machine Intelligence, resultados comprometidos en JSON y checkpoints en safetensors. La relevancia actual radica en su aplicación a "physical AI", donde la estabilidad a largo plazo de las predicciones es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MetriplecticLayer (capa neuronal con flujo balanceado, fricción métrica y rotación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo para datos numéricos/físicos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (mencionado en la documentación) |

## Arquitectura y entrenamiento

La capa MetriplecticLayer implementa un paso discreto de la forma `h' = h + Δt·Φ(h) − Δt·γ·F(h) [+ R(h)]`, donde:

- **Φ(h)** es el flujo balanceado: `h + W·φ(h)` con `𝟙ᵀW = 0`, lo que garantiza que la suma de los canales se conserve exactamente para cualquier función φ.
- **F(h)** es la fricción métrica: transformada de Cayley de `BBᵀ ⪰ 0`, que asegura que la norma no aumente (`‖h'‖ ≤ ‖h‖`).
- **R(h)** es la rotación: transformada de Cayley de una matriz antisimétrica `S = −Sᵀ`, que conserva la norma (`‖h'‖ = ‖h‖`).
- **γ** es una compuerta aprendible que comienza cerrada (σ ≈ 0) y debe abrirse para representar disipación.

La capa se entrena con datos de sistemas dinámicos (osciladores, advección-difusión, Kepler) mediante optimización estándar. No se especifican detalles del dataset ni del procedimiento de entrenamiento (épocas, optimizador, etc.). La innovación clave es que las invariantes son propiedades algebraicas de la propia transformación, independientes de los valores de los parámetros, por lo que se mantienen durante el entrenamiento y el despliegue.

## Capacidades

- Conservación exacta de invariantes (suma, norma) a nivel de máquina, por construcción de la capa.
- Estabilidad a largo plazo en rollouts recurrentes: la norma latente se conserva hasta ~3.8×10⁻¹⁶ en un RNN sobre 2× el horizonte de entrenamiento.
- Aplicable a múltiples arquitecturas: MLP, RNN y GNN, adaptando la capa como bloque básico.
- Control de disipación mediante la compuerta γ, que el modelo aprende a abrir o cerrar según los datos.
- Representación de sistemas conservativos y disipativos sin necesidad de conocer la física a priori.
- Compatible con integración numérica estándar (Δt como hiperparámetro).

## Casos de uso

- **Simulación de dinámica de fluidos**: el GNN metripléctico conserva la masa del campo predicho en problemas de advección-difusión, reduciendo el error de deriva de ~10⁻¹ a ~10⁻¹³ frente a un GNN estándar. Útil para predicciones meteorológicas o de flujo en medios porosos.
- **Modelado de sistemas mecánicos**: el MLP metripléctico puede aprender osciladores armónicos y amortiguados con errores que no crecen con el horizonte, a diferencia de LSTMs que acumulan deriva. Aplicable a robótica o control predictivo.
- **Predicción orbital**: en sistemas de Kepler, la elección del canal correcto (flujo vs. rotación) mejora el ajuste (error 0.396 vs 1.373), permitiendo modelar trayectorias de satélites o planetas con alta fidelidad.
- **Redes neuronales recurrentes estables**: el RNN metripléctico garantiza que la norma latente esté acotada para siempre, lo que evita explosiones de gradiente en secuencias largas. Útil para modelado de series temporales físicas.
- **Generación de datos sintéticos para física**: al conservar invariantes exactas, la capa puede generar trayectorias realistas para aumentar datasets de entrenamiento en aplicaciones de IA física.
- **Integración en pipelines de simulación híbrida**: la capa puede sustituir a integradores numéricos tradicionales en entornos donde se requiere diferenciabilidad, como en optimización de control o asimilación de datos.

## Benchmarks y rendimiento

Los resultados reportados en la documentación (medidas sobre 5 semillas, valores por semilla comprometidos en el repositorio) son:

| Claim | Resultado |
|---|---|
| Latent drift, estructural (float64) | ~10⁻¹³ en todos los modelos metriplécticos |
| Field mass drift, GNN metripléctico vs GNN plano | ~10⁻¹³ vs ~10⁻¹ en advección-difusión |
| One-step fidelity | NeuralODE es el más ajustado; metripléctico en la banda de MLP |
| Horizon growth ratio (spring) | muy por debajo de NeuralODE/LSTM/HNN, comparable a ResMLP |
| Channel choice | circulación (conserva norma) ajusta mejor en spring (0.457 vs 0.585); perjudica en Kepler (1.373 vs 0.396) |
| Friction gate | nace cerrada; medida ≈ 0.003 en spring amortiguado |
| RNN sobre 2× horizonte | norma exacta (~3.8×10⁻¹⁶) |

No se proporcionan benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, etc.) porque no es un modelo de este tipo.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. Dado que la capa es ligera (operaciones matriciales y transformadas de Cayley), se puede inferir que es ejecutable en GPUs convencionales, pero no hay datos confirmados. El repositorio no incluye archivos de peso visibles (tamaño 0.0 GB), por lo que no se puede estimar VRAM. Se recomienda consultar la documentación del autor para detalles de despliegue.

## Comparativa con modelos similares

La documentación compara el rendimiento del metripléctico con otros modelos de dinámica aprendida:

| Modelo | Conservación de invariantes | Estabilidad a largo plazo | One-step fidelity |
|---|---|---|---|
| Metriplex (MLP/RNN/GNN) | Exacta (por construcción) | Alta (norma acotada) | Media (banda MLP) |
| NeuralODE | No | Media (depende del integrador) | Alta (mejor ajuste) |
| LSTM | No | Baja (compone error) | Media |
| HNN (Hamiltonian Neural Network) | Parcial (solo Hamiltonianos) | Media | Media |
| ResMLP | No | Media | Media |

No se dispone de comparación con otros modelos de lenguaje o de propósito general.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: Metriplex es una capa para dinámica física; no genera texto ni procesa lenguaje natural.
- **Licencia no especificada**: el repositorio no indica licencia, lo que impide su uso comercial sin autorización explícita.
- **Repositorio aparentemente vacío**: el tamaño del repo es 0.0 GB y no se ven archivos en la página de Hugging Face, aunque la documentación menciona checkpoints en safetensors. Esto puede deberse a un error de carga o a que los archivos están en otro lugar.
- **Dependencia de la elección del canal**: el rendimiento depende de seleccionar el canal correcto (flujo vs. rotación) según la física del sistema; una elección incorrecta degrada el ajuste (ver caso Kepler).
- **Fricción limitada**: la compuerta γ tiende a permanecer cerrada en los experimentos reportados, lo que sugiere que el modelo no explota completamente la disipación en ciertos datos.
- **Sin evaluación en problemas a gran escala**: los benchmarks se limitan a sistemas pequeños y suaves; no hay evidencia de escalabilidad a problemas del mundo real.
- **Fechas futuras**: la fecha de creación (2026) es posterior a la actual, lo que sugiere que el proyecto puede ser especulativo o no verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sejibeji/Metriplex
- Sitio del proyecto (GitHub Pages): https://sehajr-singhs.github.io/metriplex/
- Resultados en Kaggle: https://www.kaggle.com/datasets/sehajrsingh/metriplex-results
- Mirror del sitio en Hugging Face Spaces: https://sejibeji-metriplex.static.hf.space
- Manuscrito (en el repositorio): manuscript.pdf
