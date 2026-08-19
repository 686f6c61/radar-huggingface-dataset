# sida/icalens-gemma-2-2b-pile10k

## Resumen

El repositorio `sida/icalens-gemma-2-2b-pile10k` no contiene un modelo de lenguaje, sino un artefacto de interpretabilidad denominado **ICA Lens**, desarrollado por Sida Liu y Feijiang Han (paper arXiv:2606.11722). Se trata de una lente de análisis que, mediante análisis de componentes independientes (ICA), transforma las activaciones internas del modelo `google/gemma-2-2b` en puntuaciones de componentes independientes y fracciones de energía por token. El objetivo es facilitar la interpretación de los mecanismos internos de un LLM sin necesidad de entrenar diccionarios adicionales, como ocurre con los sparse autoencoders.

El artefacto está ajustado sobre el dataset `NeelNanda/pile-10k` (1 millón de tokens) y cubre las 26 capas del transformer de Gemma-2-2b (capas 0 a 25), con un tamaño oculto de 2304. Se distribuye como un paquete compatible con la librería `icalens` (versión 0.3.3.dev0) y ocupa 2.6 GB en el repositorio. Su relevancia actual radica en ofrecer una alternativa ligera y sin entrenamiento adicional para estudiar representaciones internas de modelos pequeños, lo que resulta útil para la comunidad de interpretabilidad y alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens (transformación ortogonal sobre activaciones residuales) |
| Parametros totales | No aplica (artefacto de transformación, no modelo generativo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (el modelo analizado usa contexto de 1024 tokens según el fitting) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el artefacto no especifica idiomas; el modelo analizado Gemma-2-2b soporta múltiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de artefactos de la librería `icalens`) |

## Arquitectura y entrenamiento

El ICA Lens se basa en un análisis de componentes independientes (FastICA) aplicado a las activaciones del flujo residual (`resid_post`) de cada capa del transformer `google/gemma-2-2b`. Para cada capa (0 a 25), se ajusta una rotación ortogonal aprendida sobre activaciones centradas y blanqueadas, de modo que las componentes resultantes sean estadísticamente independientes. El proceso de ajuste utiliza 1,000,000 de tokens del dataset `NeelNanda/pile-10k` (split train), con 50 iteraciones de FastICA por capa. La puntuación de cada token se define como el producto de la activación centrada y blanqueada por la rotación aprendida; la fracción de energía de una componente se calcula como `score² / sum(todos los scores²)`. No se aplica escalado posterior a la ICA en esta versión (v0.2). El artefacto incluye metadatos de procedencia (revisión del modelo analizado, sitio de activación, indexación de capas, normalización L2) almacenados en `icalens.json`.

## Capacidades

- Transformación de activaciones residuales de Gemma-2-2b en puntuaciones de componentes independientes por capa y por token.
- Cálculo de fracciones de energía por componente, útil para identificar qué componentes dominan la representación de un token.
- Análisis capa por capa (26 capas disponibles) sin necesidad de entrenar diccionarios adicionales.
- Integración con el paquete `icalens` mediante la API `ICALens.from_pretrained()` y métodos `analyze()` y `transform()`.
- Soporte para activaciones capturadas externamente, siempre que se respeten la revisión del modelo, el sitio de activación, la indexación y el preprocesamiento registrados.
- Compatibilidad con el flujo de trabajo de interpretabilidad de modelos basados en transformer (residual stream).

## Casos de uso

- **Análisis de features en modelos de lenguaje**: el ICA Lens permite identificar componentes independientes que codifican conceptos o atributos específicos (por ejemplo, género, número, tema) en las representaciones internas de Gemma-2-2b, sin necesidad de entrenar sparse autoencoders.
- **Estudio de la evolución de representaciones por capa**: al aplicar la lente a cada capa, se puede trazar cómo se transforman las representaciones a lo largo de la red, lo que ayuda a comprender la jerarquía de abstracción.
- **Depuración de comportamientos no deseados**: si un modelo produce respuestas sesgadas o alucinadas, el análisis de las puntuaciones ICA puede revelar qué componentes contribuyen a esas salidas, facilitando la intervención o el ajuste fino.
- **Investigación en alineación y seguridad**: la lente puede usarse para monitorear la activación de componentes relacionados con instrucciones dañinas o engañosas, ayudando a diseñar mecanismos de control.
- **Comparación de arquitecturas**: al aplicar el mismo ICA Lens a diferentes modelos (si se ajustan lentes equivalentes), se pueden comparar las representaciones internas entre arquitecturas o tamaños.
- **Educación y divulgación**: sirve como herramienta didáctica para demostrar cómo se pueden interpretar los modelos de lenguaje sin entrenar modelos auxiliares, con un coste computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este artefacto no es un modelo generativo, por lo que no aplican métricas como MMLU, HumanEval o GSM8K. El rendimiento del ICA Lens se evalúa cualitativamente en términos de interpretabilidad de las componentes, pero no se proporcionan métricas cuantitativas en la model card.

## Requisitos de hardware

- El análisis requiere cargar el modelo `google/gemma-2-2b` (2 mil millones de parámetros) para obtener las activaciones. En FP16, esto ocupa aproximadamente 4-5 GB de VRAM.
- Para el proceso de ajuste de la lente (ya realizado por el autor) se necesitaron recursos considerables, pero para la inferencia (aplicar la lente a nuevas activaciones) solo se requiere la matriz de rotación ICA, que es pequeña (2304×2304 por capa).
- Se recomienda una GPU con al menos 6-8 GB de VRAM para ejecutar Gemma-2-2b y almacenar activaciones intermedias. GPUs como NVIDIA RTX 3060/3070/4060, A10 o superiores son suficientes.
- El paquete `icalens` está diseñado para PyTorch; se puede ejecutar en CPU para análisis de lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: uso directo en scripts Python con `icalens`, integración en pipelines de investigación con HuggingFace Transformers.

## Comparativa con modelos similares

No se dispone de comparativas cuantitativas con otras técnicas de interpretabilidad (por ejemplo, sparse autoencoders como SAE, o Tuned Lens). El ICA Lens se posiciona como una alternativa más ligera que los SAE, ya que no requiere entrenar un diccionario sobredimensionado, pero no se han publicado comparaciones formales de calidad de interpretación. La información disponible no permite establecer una tabla comparativa con datos numéricos.

## Limitaciones y advertencias

- Los identificadores de componentes son específicos de cada capa y del artefacto ajustado; no son transferibles entre modelos o versiones.
- Las puntuaciones ICA son con signo y no representan probabilidades; su interpretación requiere conocimiento del método.
- El ajuste se realizó sobre un dataset específico (pile-10k) y con un número limitado de tokens (1M); las componentes pueden estar sesgadas hacia los dominios representados en ese dataset.
- No se especifica la licencia del artefacto, por lo que su uso comercial o redistribución puede estar sujeto a restricciones no documentadas.
- El artefacto depende de la revisión exacta de `google/gemma-2-2b` (hash `c5ebcd40d208330abc697524c919956e692655cf`); si se utiliza otra revisión, los resultados pueden no ser válidos.
- No se proporcionan garantías de robustez frente a cambios en el tokenizador o en el preprocesamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sida/icalens-gemma-2-2b-pile10k
- Paper: [ICA Lens: Interpreting Language Models Without Training Another Dictionary](https://arxiv.org/abs/2606.11722)
- Modelo analizado: https://huggingface.co/google/gemma-2-2b
- Dataset de ajuste: https://huggingface.co/datasets/NeelNanda/pile-10k
- Paquete `icalens`: disponible en PyPI (no se proporciona URL directa en la información)
