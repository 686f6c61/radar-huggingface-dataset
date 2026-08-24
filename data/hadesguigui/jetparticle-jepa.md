# HadesGuigui/JetParticle-JEPA

## Resumen

JetParticle-JEPA (JP-JEPA) es un modelo de representación auto-supervisado diseñado específicamente para la clasificación de jets en física de altas energías, desarrollado por HadesGuigui. Se basa en la arquitectura JEPA (Joint Embedding Predictive Architecture), introducida por Yann LeCun y Meta AI, que aprende representaciones prediciendo representaciones del futuro a partir de representaciones del presente, sin reconstruir píxeles ni tokens. En este caso, el modelo aprende directamente del conjunto crudo de partículas constituyentes de un jet, sin necesidad de clustering intermedio, voxelización ni tokenización discreta.

El modelo se presenta como un framework de modelo fundacional para la física de jets en el LHC, con el objetivo de superar las limitaciones de los métodos supervisados tradicionales que dependen de grandes cantidades de datos etiquetados. Según el paper asociado (arXiv:2606.14813), en los benchmarks de Top Quark y Quark-Gluon Tagging, JP-JEPA se mantiene a la par con métodos supervisados, y sus representaciones muestran una fuerte robustez ante información faltante del detector y un mejor comportamiento de incertidumbre. El repositorio de HuggingFace contiene únicamente los pesos (preentrenados y ajustados), con un tamaño de 0.2 GB, lo que sugiere un modelo relativamente compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) aplicada a partículas constituyentes de jets |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (trabaja con conjuntos de partículas, no con secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos, probablemente en formato PyTorch, pero no se especifica) |

## Arquitectura y entrenamiento

JP-JEPA se basa en el paradigma JEPA, que aprende representaciones mediante la predicción de representaciones en un espacio latente, evitando la reconstrucción de los datos de entrada. En el contexto de física de partículas, el modelo procesa directamente el conjunto de partículas constituyentes de un jet (sus momentos, cargas, etc.) sin pasos intermedios de preprocesamiento como clustering o voxelización. Esto permite capturar información de baja escala y alta granularidad que los métodos tradicionales podrían perder.

El entrenamiento es auto-supervisado, lo que significa que no requiere etiquetas manuales. El modelo se entrena para predecir representaciones de partes del jet a partir de otras partes, aprendiendo así una representación densa y útil para tareas posteriores. Según el paper, el modelo se evalúa en tareas de clasificación de jets (top quark vs. QCD, quark vs. gluón) y demuestra un rendimiento comparable a métodos supervisados, además de robustez ante la falta de información del detector y una mejor calibración de incertidumbre. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Clasificación de jets en física de partículas: identificación de jets originados por quarks top, gluones, quarks ligeros, etc.
- Aprendizaje de representaciones auto-supervisadas directamente de los constituyentes del jet, sin preprocesamiento manual.
- Robustez ante información faltante del detector: las representaciones aprendidas mantienen su utilidad incluso cuando parte de la información del detector no está disponible.
- Mejor comportamiento de incertidumbre en comparación con métodos supervisados, lo que permite una estimación más fiable de la confianza del modelo.
- Potencial como modelo fundacional para múltiples tareas de física de jets, gracias a su enfoque de representación general.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, ni tiene capacidades multimodales.

## Casos de uso

- Análisis de datos del LHC: clasificación de eventos para la búsqueda de nueva física, como la producción de quarks top o la separación quark-gluón, utilizando las representaciones aprendidas por JP-JEPA como características de entrada para clasificadores posteriores.
- Reducción de dependencia de datos etiquetados: al ser auto-supervisado, puede preentrenarse con grandes volúmenes de datos no etiquetados del LHC y luego ajustarse con un número reducido de ejemplos etiquetados, lo que es especialmente útil en escenarios con anotaciones costosas.
- Detección de anomalías: las representaciones aprendidas pueden utilizarse para identificar eventos inusuales que se desvíen de la distribución esperada, útil en búsquedas de física más allá del Modelo Estándar.
- Robustez ante fallos del detector: en situaciones donde parte de la información del detector es incompleta o ruidosa, JP-JEPA mantiene un rendimiento estable, lo que lo hace adecuado para análisis en condiciones experimentales reales.
- Estimación de incertidumbre: su mejor comportamiento de incertidumbre permite cuantificar la confianza de las predicciones, lo que es crítico para la toma de decisiones en análisis de física de partículas.
- Modelo fundacional para la comunidad: al publicar los pesos, otros investigadores pueden ajustar JP-JEPA para tareas específicas de jet tagging sin necesidad de entrenar desde cero, acelerando el desarrollo de nuevos análisis.

## Benchmarks y rendimiento

Según el paper (arXiv:2606.14813), JP-JEPA se evalúa en los benchmarks de Top Quark Tagging y Quark-Gluon Tagging, donde se mantiene a la par con métodos supervisados. También se reporta una fuerte robustez ante información faltante del detector y un mejor comportamiento de incertidumbre. No se proporcionan cifras numéricas concretas en la información disponible, por lo que no es posible presentar una tabla comparativa detallada. Se recomienda consultar el paper para obtener los valores exactos.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware en la documentación proporcionada.
- El tamaño del repositorio es de 0.2 GB, lo que sugiere que los pesos del modelo son relativamente pequeños y podrían caber en GPUs de consumo (por ejemplo, una RTX 3060 con 12 GB de VRAM), pero esto es una estimación no confirmada.
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje y probablemente se use con frameworks de deep learning estándar como PyTorch.
- Se recomienda consultar el repositorio de GitHub (Guigui14460/jetparticle-jepa) para obtener instrucciones de inferencia y requisitos técnicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (aprendizaje auto-supervisado para jet tagging). Existen otros enfoques como ParticleNet, EFN (Energy Flow Networks) o métodos basados en transformers, pero no se han proporcionado datos de comparación directa en la información disponible. Se recomienda revisar el paper para ver la comparación con métodos supervisados y otros enfoques auto-supervisados.

## Limitaciones y advertencias

- Es un modelo especializado en física de partículas, no un modelo de lenguaje general. No puede utilizarse para tareas de NLP, generación de texto o razonamiento general.
- No se ha publicado información sobre sesgos o riesgos de alucinación, ya que no es un modelo generativo de texto.
- La licencia no está especificada, por lo que se debe contactar al autor antes de cualquier uso comercial o redistribución.
- El modelo está diseñado para datos de jets del LHC; su aplicabilidad a otros dominios o tipos de datos no está garantizada.
- La robustez ante información faltante del detector se ha evaluado en condiciones específicas; su comportamiento en otros escenarios de degradación de datos no está documentado.
- Al ser un modelo relativamente nuevo (publicado en 2026), su adopción en producción aún no está ampliamente validada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/HadesGuigui/JetParticle-JEPA
- Paper (arXiv): https://arxiv.org/abs/2606.14813
- Código de inferencia (GitHub): https://github.com/Guigui14460/jetparticle-jepa
