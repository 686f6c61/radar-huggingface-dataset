# prehj/GR00T-N1.5-robocasa-atq-v22so3-2x-no-kl-60k-20260921

## Resumen

El modelo `prehj/GR00T-N1.5-robocasa-atq-v22so3-2x-no-kl-60k-20260921` es un ajuste fino del modelo fundacional de robótica **NVIDIA GR00T-N1.5-3B**, publicado por el usuario `prehj` en HuggingFace. Se trata de un artefacto de investigación orientado a la manipulación robótica en el entorno de simulación **RoboCasa** (tareas domésticas de cocina), no de un modelo de propósito general: su pipeline declarado es `robotics` y los pesos están etiquetados como `gr00t_n1_5`, `atq` y `ablation`.

El nombre del repositorio codifica la configuración del experimento: variante ATQ v22, objetivos de rotación fusionados en SO(3), compresión 2x, cuatro expertos, 60.000 pasos de entrenamiento con batch global 64 y semilla 42. Es un modelo de ablación: el coeficiente KL del enrutador se fija a 0 y el coeficiente de balance a 0,05, lo que desactiva las contribuciones ponderadas de los regularizadores. El propio autor indica que el modelo **aún no ha sido evaluado** y que solo se publican los pesos de inferencia y los metadatos de normalización, sin estados del optimizador.

Por su naturaleza, es relevante para un nicho muy concreto: investigadores que trabajan en modelos visión-lenguaje-acción (VLA) para robótica y quieren reproducir o comparar ablaciones de enrutado y compresión sobre la base GR00T N1.5. No es un modelo apto para despliegue en producción tal cual: carece de licencia declarada, no tiene idiomas especificados, no presenta resultados de benchmarks y acumula cero descargas y cero valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) derivado de GR00T N1.5; el repositorio declara cuatro expertos y compresión 2x. Detalle exacto de capas no disponible en la model card |
| Parámetros totales | 2.829.861.577 (≈2,83 mil millones, dato real de los safetensors) |
| Parámetros activos | No disponible (la etiqueta "four experts" sugiere un componente con mezcla de expertos, pero no se especifica el reparto) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repositorio en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 8,0 GB; solo pesos de inferencia y metadatos de normalización, sin estados del optimizador) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de los hiperparámetros del ajuste fino. Por las etiquetas (`gr00t_n1_5`, `robotics`) y el modelo base declarado, se trata de un derivado de **NVIDIA GR00T N1.5**, un modelo fundacional de robótica de tipo VLA que combina un componente de razonamiento visión-lenguaje con una cabeza generativa de acciones. El nombre del repositorio añade dos indicios concretos: **cuatro expertos** (estructura de mezcla de expertos, presumiblemente en la cabeza de acción) y **compresión 2x**, que reduciría el tamaño del componente afectado. Estos detalles proceden de la nomenclatura y las etiquetas, no de una descripción técnica explícita del autor.

El entrenamiento consistió en un ajuste fino desde `nvidia/GR00T-N1.5-3B` sobre el benchmark **RoboCasa**, durante **60.000 pasos** con batch global 64 y semilla 42. La configuración de ablación es el elemento diferenciador: `router_kl = 0` y `balance = 0,05`, de modo que las contribuciones ponderadas de los regularizadores quedan desactivadas aunque las pérdidas de diagnóstico en bruto puedan seguir registrándose. La regresión de confianza permanece activa con coeficiente 0,1. Los objetivos de rotación se fusionan en **SO(3)**. La configuración completa y los hashes de pesos están en el fichero `ablation.json` del propio repositorio. No se documentan el volumen de datos, la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica en entornos simulados de tipo RoboCasa (tareas domésticas de cocina), a partir de observaciones visuales e instrucciones.
- Procesamiento multimodal visión-lenguaje-acción heredado de la familia GR00T N1.5, orientado a control de robots manipuladores.
- Variante de ablación con enrutado sin penalización KL (`router_kl = 0`), útil para estudiar el comportamiento del enrutador de expertos sin regularización.
- Regresión de confianza activa (coeficiente 0,1): el modelo puede emitir estimaciones de confianza junto con las acciones, según la configuración declarada.
- Compresión 2x aplicada al componente correspondiente, según la nomenclatura del experimento.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso general: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales adicionales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Investigación en manipulación robótica de cocina: reproducción de tareas de RoboCasa (abrir cajones, manipular utensilios, colocar objetos) en simulación, aprovechando el ajuste específico sobre ese benchmark durante 60.000 pasos.
- Estudio de ablaciones de enrutado en mezclas de expertos: comparar este checkpoint sin KL (`router_kl = 0`) frente a variantes con regularización para medir el efecto sobre la estabilidad del enrutador y la especialización de los cuatro expertos.
- Análisis de compresión de modelos VLA: evaluar qué degradación introduce la compresión 2x declarada frente al modelo base GR00T-N1.5-3B sin comprimir.
- Evaluación de representaciones de rotación: el uso de objetivos de rotación fusionados en SO(3) permite estudiar el impacto de esa parametrización en la precisión de las acciones de orientación.
- Reproducibilidad de experimentos: con semilla 42, batch global 64 y 60.000 pasos documentados, sirve como punto de referencia para replicar el pipeline de ajuste fino.
- Base para transferencia sim-to-real: al derivar de un modelo fundacional de robótica, puede emplearse como punto de partida para ajustes posteriores sobre datos reales, siempre que se resuelva la licencia.
- Docencia y divulgación técnica: ejemplo de artefacto de ablación con metadatos completos (`ablation.json`), útil para explicar cómo se documentan experimentos de mezclas de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "not yet evaluated" (aún no evaluado), por lo que no existen cifras de éxito en tareas de RoboCasa ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,83 mil millones de parámetros, los pesos en bf16/fp16 ocuparían aproximadamente 5,7 GB, a lo que hay que sumar los componentes de visión y la cabeza de acción. Se estima un rango de 8-12 GB en precisión completa, aunque **no hay datos oficiales de consumo** en la información disponible.
- GPU recomendadas: no disponibles en la documentación del autor. Por tamaño, una RTX 4090 (24 GB) sería suficiente para inferencia en fp16; GPU de datacenter como A100 o H100 aportarían margen para lotes mayores y evaluación a gran escala.
- Compatibilidad con GPU de consumo: probablemente sí en tarjetas con 12 GB o más de VRAM, dado el tamaño del modelo, aunque esta afirmación es una estimación y no un dato verificado.
- Opciones de despliegue: no disponibles en la model card. Los repositorios de la familia GR00T suelen requerir su propio entorno de inferencia en lugar de servidores genéricos como vLLM, TGI u Ollama; conviene verificar el repositorio oficial antes de asumir compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prehj/GR00T-N1.5-robocasa-atq-v22so3-2x-no-kl-60k-20260921 | 2,83 B | No disponible | VLA, ajuste fino de ablación | No disponible | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.5-3B | ≈3 B | No disponible en esta búsqueda | VLA fundacional de robótica | No verificada en esta búsqueda | HuggingFace (modelo base) |
| Otros modelos VLA comparables (OpenVLA, pi0, RDT-1B) | No verificado en esta búsqueda | No verificado | VLA | No verificado | No verificado |

No se dispone de datos verificados de rendimiento para establecer una comparación cuantitativa. Cualquier cifra sobre modelos alternativos debería contrastarse en sus respectivas fichas antes de publicarse.

## Limitaciones y advertencias

- **Sin evaluar**: el autor declara explícitamente que el modelo no ha sido evaluado; se desconoce su tasa de éxito en cualquier tarea.
- **Sin licencia declarada**: la ausencia de licencia impide determinar si se permite uso comercial. No debe utilizarse en producción sin aclarar este punto con el autor.
- **Modelo de ablación**: al fijar `router_kl = 0`, se elimina la penalización que normalmente mantiene equilibrado el enrutador de expertos. Esto puede provocar colapso de enrutado (uso desequilibrado de los cuatro expertos) y degradar el rendimiento.
- **Sin estados del optimizador**: el repositorio contiene solo pesos de inferencia, por lo que no se puede reanudar el entrenamiento desde este checkpoint.
- **Idiomas no especificados**: se desconoce qué idiomas comprende el componente de lenguaje y si las instrucciones en castellano funcionarían.
- **Ámbito restringido**: el ajuste se realizó sobre RoboCasa, un benchmark de simulación de cocina. La generalización a otros entornos, morfologías de robot o tareas del mundo real no está documentada.
- **Riesgo de alucinación y de acciones inseguras**: en modelos VLA, una predicción errónea de acción puede provocar movimientos físicos peligrosos. Cualquier uso sobre hardware real exige capas de seguridad externas.
- **Contexto desconocido**: no se declara la longitud de contexto, lo que dificulta planificar tareas de horizonte largo.
- **Metadatos incompletos**: no se documentan el dataset de entrenamiento, la composición de datos ni el proceso de alineación.
- **Nula tracción**: 0 descargas y 0 valoraciones en el momento de la consulta; no existe validación por parte de la comunidad.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/prehj/GR00T-N1.5-robocasa-atq-v22so3-2x-no-kl-60k-20260921
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Configuración completa y hashes de pesos: fichero `ablation.json` dentro del repositorio del modelo.
- Resultados de búsqueda web: las entradas recuperadas (repositorios sobre GPT-Image-2, hilos en Zhihu sobre GPT-6 Astra, GitHub Gist y un complemento de Zotero) no guardan relación con este modelo de robótica y no se incluyen como fuentes. No se han encontrado papers, blogs ni demos adicionales relevantes en la información disponible.
