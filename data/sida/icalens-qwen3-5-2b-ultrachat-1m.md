# sida/icalens-qwen3.5-2b-ultrachat-1m

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de interpretabilidad denominado **ICA Lens**, desarrollado por Sida Liu y Feijiang Han para analizar las activaciones internas del modelo Qwen/Qwen3.5-2B (versión instruct). El ICA Lens aplica análisis de componentes independientes (ICA) sobre las activaciones del flujo residual (resid_post) en cada una de las 24 capas del transformer, transformando dichas activaciones en puntuaciones de componentes independientes y fracciones de energía por token. El objetivo es facilitar la interpretación mecánica de modelos de lenguaje sin necesidad de entrenar diccionarios adicionales, como hacen los sparse autoencoders (SAE).

El artefacto se ajustó con un millón de tokens del dataset HuggingFaceH4/ultrachat_200k (split train_sft) y está empaquetado con la librería `icalens` (versión 0.3.3). El repositorio ocupa 1,2 GB e incluye las transformaciones ICA para las 24 capas, cada una con 2048 componentes, así como los readouts de componentes (R-lens) transferidos desde el modelo base Qwen/Qwen3.5-2B-Base. Es una herramienta pensada para investigadores en interpretabilidad, no para uso directo en producción de aplicaciones de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens (transformación ortogonal de activaciones residuales) |
| Parametros totales | No aplicable (artefacto de análisis, no modelo generativo) |
| Parametros activos | No aplicable |
| Longitud de contexto | No aplicable (el análisis opera token a token; el ajuste usó contexto de 1024) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende del modelo analizado, Qwen3.5-2B) |
| Licencia | No disponible |
| Formato de pesos | Formato interno de la librería `icalens` (no especificado) |

## Arquitectura y entrenamiento

El ICA Lens es un método de interpretabilidad post-hoc que no modifica el modelo analizado. Para cada capa (0 a 23) se toman las activaciones del residual stream (`resid_post`) de Qwen/Qwen3.5-2B, se centran y se blanquean (normalización L2 por fila), y luego se aplica una rotación ICA ortogonal aprendida mediante FastICA con 50 iteraciones. El resultado son puntuaciones estándar ICA con signo, y la energía por componente se calcula como el cuadrado de la puntuación dividido por la suma de cuadrados de todos los componentes del token.

El ajuste se realizó sobre 1.000.000 de tokens muestreados de 10.000.000 candidatos del dataset ultrachat_200k (revisión `8049631c405ae6576f93f445c6b8166f76f5505a`, split `train_sft`). Cada capa tiene 2048 componentes independientes, igual al hidden size del modelo analizado. Los readouts de componentes (R-lens) se transfirieron desde el modelo base Qwen3.5-2B-Base, tras verificar compatibilidad de hidden size, sitio de activación y mapeo de capas, para reducir coste de cómputo.

## Capacidades

- Transformación de activaciones residuales de Qwen3.5-2B en puntuaciones ICA por capa y token.
- Cálculo de fracciones de energía por componente, útil para identificar qué componentes dominan la representación de un token.
- Soporte para análisis end-to-end de texto: `lens.analyze("texto", layer=N)` devuelve tokens, puntuaciones y energía.
- Soporte para transformar activaciones capturadas externamente mediante `lens.transform(activaciones, layer=N)`.
- Disponibilidad de readouts R-lens (perfiles de componentes) para las 24 capas, transferidos del modelo base.
- Integración con la librería `icalens` (versión 0.3.3) y carga desde HuggingFace Hub.

## Casos de uso

- Investigación en interpretabilidad mecánica: identificar qué componentes independientes del residual stream codifican conceptos sintácticos, semánticos o factuales en cada capa de Qwen3.5-2B.
- Análisis de circuitos: rastrear cómo fluye la información entre capas mediante la evolución de las puntuaciones ICA para un token concreto.
- Estudio de sesgos: comparar las activaciones de tokens asociados a grupos demográficos para detectar representaciones estereotipadas.
- Depuración de alucinaciones: localizar en qué capa un token falso adquiere una representación dominante, correlacionando con los componentes más activos.
- Validación de intervenciones de edición de conocimiento: comprobar si una intervención en una capa concreta altera la energía de componentes específicos.
- Transferencia de análisis entre modelos base e instruct: aprovechar los readouts R-lens del modelo base para estudiar el modelo instruct sin reentrenar el lens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo generativo, por lo que no aplican métricas como MMLU, HumanEval o GSM8K. El paper asociado (arXiv:2606.11722) describe el método y su validación cualitativa, pero no se incluyen tablas de rendimiento en la model card.

## Requisitos de hardware

- El artefacto ICA Lens ocupa 1,2 GB en disco, por lo que puede cargarse en memoria RAM de cualquier máquina moderna (incluso en CPU).
- Para extraer las activaciones del modelo Qwen3.5-2B se necesita ejecutar el modelo en una GPU. Qwen3.5-2B tiene aproximadamente 2.000 millones de parámetros; con cuantización de 4 bits cabe en una GPU con 6 GB de VRAM, y en FP16 requiere unos 4-5 GB de VRAM adicionales a los pesos del modelo.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para trabajar cómodamente con el modelo en FP16 y el lens en memoria.
- El flujo de análisis puede ejecutarse en CPU si se precomputan las activaciones, aunque la extracción de activaciones es más rápida en GPU.
- Opciones de despliegue: script Python con la librería `icalens` y transformers; no requiere servidores de inferencia como vLLM o TGI, ya que no es un servicio de generación.

## Comparativa con modelos similares

| Metodo | Tipo | Parametros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICA Lens (este) | Análisis ICA de activaciones | 2048 componentes por capa | 1M tokens, FastICA | No disponible | HuggingFace |
| Sparse autoencoders (SAE) | Diccionario aprendido | Variable (ej. 16k-64k features) | Entrenamiento con reconstrucción | Depende de la implementación | Diversos repos |
| TCAV (Testing with Concept Activation Vectors) | Vectores de concepto | Depende del modelo | Requiere datos etiquetados por concepto | Apache 2.0 (implementación original) | GitHub |

El ICA Lens se diferencia de los SAE en que no requiere entrenar un diccionario supervisado; la rotación ICA es no supervisada y más rápida de ajustar. Frente a TCAV, no necesita etiquetas de concepto externas, sino que descubre componentes independientes de forma automática. No se dispone de comparativas cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Los identificadores de componentes son específicos de cada capa y del artefacto ajustado; no son transferibles entre capas ni entre modelos sin reajuste.
- Las puntuaciones ICA son con signo y no representan probabilidades; magnitudes altas indican activación fuerte, pero no implican causalidad.
- Los readouts R-lens se transfirieron del modelo base Qwen3.5-2B-Base; aunque se verificó compatibilidad estructural, pueden existir diferencias semánticas entre el modelo base y el instruct.
- El ajuste se realizó únicamente con datos de ultrachat_200k (conversaciones en inglés mayoritariamente); los componentes pueden no cubrir bien otros idiomas o dominios.
- No se proporciona licencia explícita para el artefacto; el uso comercial debe consultarse con los autores.
- El análisis requiere acceso a las activaciones internas del modelo Qwen3.5-2B, lo que implica ejecutar el modelo completo; no es un método ligero para entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sida/icalens-qwen3.5-2b-ultrachat-1m
- Modelo analizado: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper: https://arxiv.org/abs/2606.11722
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
