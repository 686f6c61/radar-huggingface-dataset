# sida/icalens-qwen3.5-9b-base-pile10k

## Resumen

El repositorio `sida/icalens-qwen3.5-9b-base-pile10k` contiene un **ICA Lens** (lente de análisis de componentes independientes) ajustado para el modelo de lenguaje base [Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base). Se trata de un artefacto de interpretabilidad, no de un modelo generativo: proporciona transformaciones lineales por capa que mapean las activaciones del residual stream a puntuaciones de componentes independientes y fracciones de energía por token. El objetivo es facilitar el análisis de los mecanismos internos del modelo sin necesidad de entrenar diccionarios adicionales, como los sparse autoencoders.

El artefacto fue desarrollado por el usuario `sida` y se basa en el método descrito en el artículo *ICA Lens: Interpreting Language Models Without Training Another Dictionary* (arXiv:2606.11722). Se ajustó sobre el dataset [NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k) con un millón de tokens, cubriendo las 32 capas del transformer (índices 0 a 31) y un tamaño oculto de 4096. El repositorio ocupa 4.5 GB y está diseñado para usarse con la librería `icalens` (versión 0.3.3.dev0).

La relevancia de este artefacto radica en que ofrece una herramienta ligera y reproducible para inspeccionar representaciones internas de un modelo de 9 mil millones de parámetros, lo que resulta útil para la investigación en interpretabilidad, análisis de sesgos y depuración de comportamientos. Al ser un artefacto de análisis, no requiere GPU para su uso directo, aunque sí para obtener las activaciones del modelo subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens (transformaciones ortogonales por capa sobre activaciones `resid_post`) |
| Parametros totales | No aplica (artefacto de análisis, no un modelo generativo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (el ajuste usó contexto de 1024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende del modelo analizado, Qwen3.5-9B-Base) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene los pesos del lens, probablemente en formato safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El ICA Lens es un método de análisis post-hoc que aplica **análisis de componentes independientes (ICA)** a las activaciones internas de un modelo de lenguaje. Concretamente, para cada capa del transformer (0 a 31), se aprende una rotación ortogonal que transforma las activaciones centradas y blanqueadas (normalización L2) en un espacio de componentes independientes. Cada componente produce una puntuación con signo (score) y una fracción de energía por token, definida como `score² / sum(score²)`.

El ajuste se realizó sobre el dataset `NeelNanda/pile-10k` (revisión `127bfedcd5047750df5ccf3a12979a47bfa0bafa`), utilizando 1,000,000 de tokens de entrenamiento (de un total de 5,256,549 candidatos) y 50 iteraciones de FastICA por capa. La semilla de muestreo fue 0 y se aplicó una estrategia de enmarcado de documentos con el token `<|endoftext|>` (ID 248044) para respetar los límites de secuencia. No se aplicó escalado posterior a la rotación ICA en esta versión (v0.2).

El artefacto no es un modelo entrenado con datos lingüísticos, sino un conjunto de matrices de transformación que permiten inspeccionar las representaciones internas de Qwen3.5-9B-Base. La identidad y revisión exacta del modelo analizado se almacenan en `icalens.json` para garantizar la reproducibilidad.

## Capacidades

- **Análisis de activaciones por capa**: proporciona puntuaciones ICA y fracciones de energía para cada token en cualquiera de las 32 capas del modelo.
- **Transformación de activaciones externas**: permite aplicar el lens a activaciones capturadas previamente, siempre que se respeten la revisión del modelo, el sitio de activación (`resid_post`), el indexado de capas y el preprocesamiento (normalización L2).
- **Análisis de texto completo**: la función `analyze()` procesa texto directamente y devuelve tokens, scores y energía.
- **Interpretabilidad sin entrenamiento adicional**: a diferencia de los sparse autoencoders, no requiere entrenar un diccionario, lo que reduce coste computacional.
- **Compatibilidad con la librería `icalens`**: integración sencilla mediante `ICALens.from_pretrained()`.
- **Documentación de procedencia**: incluye metadatos detallados sobre el ajuste (dataset, revisión, tokens, semilla) para auditoría científica.

## Casos de uso

- **Investigación en interpretabilidad**: identificar qué componentes independientes codifican conceptos sintácticos o semánticos en cada capa, analizando los scores por token.
- **Análisis de sesgos**: examinar si ciertos componentes se activan de forma diferencial ante grupos demográficos o temáticas, ayudando a detectar sesgos latentes en el modelo.
- **Depuración de comportamientos**: cuando el modelo produce salidas inesperadas, el lens permite rastrear qué capas y componentes contribuyen a la decisión, facilitando la corrección o el ajuste fino.
- **Estudio de la evolución de representaciones**: comparar la actividad de los componentes entre capas para entender cómo se transforma la información a lo largo de la red.
- **Análisis de seguridad**: correlacionar componentes con contenido dañino o tóxico, lo que puede servir para diseñar mecanismos de mitigación.
- **Validación de hipótesis mecanicistas**: probar si determinados circuitos o features propuestos se corresponden con componentes ICA específicos, acelerando la investigación en IA explicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no está diseñado para tareas de generación o clasificación, sino para análisis de activaciones, por lo que no proceden métricas como MMLU o HumanEval.

## Requisitos de hardware

- **Almacenamiento**: el repositorio ocupa 4.5 GB, por lo que se necesita espacio en disco para descargarlo.
- **Memoria RAM**: cargar las matrices de transformación (32 capas × 4096×4096) requiere aproximadamente 2 GB en memoria, asumible en cualquier máquina moderna.
- **GPU**: no es necesaria para aplicar el lens sobre activaciones ya capturadas. Sin embargo, para obtener las activaciones del modelo Qwen3.5-9B-Base se requiere una GPU con al menos 20 GB de VRAM (p. ej., A100, RTX 4090) o el uso de cuantización y offloading.
- **Opciones de despliegue**: el paquete `icalens` se puede instalar vía pip y usarse en entornos Python estándar. No requiere servidores de inferencia.
- **Latencia**: la transformación de activaciones es una multiplicación matricial, por lo que es rápida (del orden de milisegundos por lote). El coste principal reside en la extracción de activaciones del modelo subyacente.

## Comparativa con modelos similares

| Método | Tipo | Entrenamiento adicional | Coste | Aplicabilidad |
|---|---|---|---|---|
| ICA Lens (este artefacto) | Análisis de componentes independientes | No (solo ajuste de rotación) | Bajo | Activaciones de cualquier capa |
| Sparse Autoencoders (SAE) | Diccionario sobredimensionado | Sí (entrenamiento del autoencoder) | Alto | Features dispersas, interpretación detallada |
| TCAV (Testing with Concept Activation Vectors) | Vectores de activación de conceptos | Sí (entrenamiento de clasificadores lineales) | Medio | Análisis de conceptos específicos |

No se dispone de datos cuantitativos de comparación en la información proporcionada. La elección entre métodos depende del objetivo: el ICA Lens es más ligero y no requiere entrenamiento, mientras que los SAE ofrecen features más finas a costa de un coste computacional mayor.

## Limitaciones y advertencias

- **Especificidad del artefacto**: los componentes ICA son específicos de la capa y del artefacto ajustado; no son transferibles a otros modelos o revisiones.
- **Interpretación de scores**: las puntuaciones ICA son con signo y no representan probabilidades; su interpretación requiere contexto y validación adicional.
- **Dependencia del dataset de ajuste**: el lens se ajustó sobre `pile-10k`, un subconjunto pequeño de The Pile, por lo que puede no capturar la diversidad completa de representaciones del modelo.
- **Licencia no especificada**: al no indicarse licencia, el uso comercial o la redistribución del artefacto pueden estar sujetos a restricciones legales no documentadas.
- **Requisito de fidelidad**: para usar el lens con activaciones externas, es imprescindible respetar la revisión exacta del modelo, el sitio de activación y el preprocesamiento; cualquier desviación invalida los resultados.
- **Sin soporte para otros modelos**: el artefacto solo es válido para Qwen/Qwen3.5-9B-Base en la revisión indicada.

## Enlaces

- [Repositorio HuggingFace del artefacto](https://huggingface.co/sida/icalens-qwen3.5-9b-base-pile10k)
- [Modelo analizado: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
- [Dataset de ajuste: NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k)
- [Paper: ICA Lens: Interpreting Language Models Without Training Another Dictionary](https://arxiv.org/abs/2606.11722)
