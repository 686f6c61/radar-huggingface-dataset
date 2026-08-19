# sida/icalens-gpt2-small-pile10k

## Resumen

El repositorio `sida/icalens-gpt2-small-pile10k` no contiene un modelo de lenguaje, sino un artefacto de interpretabilidad denominado **ICA Lens**, desarrollado por Sida Liu y Feijiang Han. Se trata de una transformación basada en análisis de componentes independientes (ICA) ajustada sobre las activaciones internas del modelo GPT-2 de OpenAI (revisión `607a30d783dfa663caf39e06633721c8d4cfcd7e`). El objetivo es mapear las activaciones del residual stream (en el punto `resid_post`) de cada una de las 12 capas del transformer a puntuaciones de componentes independientes y a fracciones de energía por token, facilitando el análisis interpretativo sin necesidad de entrenar diccionarios adicionales.

El artefacto se ajustó con 1.000.000 de tokens del dataset `NeelNanda/pile-10k` (split train) y sigue la metodología descrita en el artículo *ICA Lens: Interpreting Language Models Without Training Another Dictionary* (arXiv:2606.11722). Es relevante para la comunidad de investigación en interpretabilidad de modelos porque ofrece una alternativa ligera y sin entrenamiento a los autoencoders dispersos (SAE) para descomponer activaciones en componentes semánticamente significativos. El repositorio tiene un tamaño de 0.2 GB y está publicado bajo la librería `icalens` (versión 0.3.3.dev0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens sobre GPT-2 (openai-community/gpt2, base) |
| Parametros totales | No aplica (artefacto de transformación, 12 capas × 768 componentes ICA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (el modelo analizado tiene 1024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo analizado es multilingüe, pero el lens no está limitado por idioma) |
| Licencia | No disponible |
| Formato de pesos | No disponible (se carga mediante la librería `icalens`, probablemente safetensors o JSON) |

## Arquitectura y entrenamiento

El ICA Lens se construye a partir de las activaciones del residual stream de GPT-2, capturadas en el punto `resid_post` de cada capa (indexación de capas basada en cero, capas 0 a 11). El proceso de ajuste aplica normalización L2 por fila a las activaciones, seguida de centrado y blanqueo, y finalmente una rotación ortogonal aprendida mediante FastICA (50 iteraciones por capa). No se aplica escalado posterior a la ICA en esta versión (v0.2). El dataset de ajuste es `NeelNanda/pile-10k`, con 1.000.000 de tokens muestreados de un total de 5.465.620 tokens candidatos, con semilla de muestreo 0. Cada fila de entrenamiento se trata como un documento nuevo, anteponiendo el token `<|endoftext|>` (ID 50256) al inicio, siguiendo la política de generación incondicional de OpenAI.

La transformación resultante produce, para cada token y capa, un vector de puntuaciones ICA firmadas (scores) y una fracción de energía por componente (calculada como `score² / sum(scores²)`). El artefacto se almacena en un archivo `icalens.json` que contiene la identidad del modelo analizado, la revisión exacta, el sitio de activación y los parámetros de preprocesado, garantizando la reproducibilidad.

## Capacidades

- **Análisis de activaciones por capa**: permite transformar las activaciones residuales de GPT-2 en puntuaciones ICA para cada una de las 12 capas.
- **Descomposición en componentes independientes**: identifica direcciones en el espacio de activaciones que son estadísticamente independientes, facilitando la interpretación de características latentes.
- **Cálculo de energía por componente**: para cada token, proporciona la fracción de energía explicada por cada componente, útil para localizar qué componentes dominan en una representación.
- **Uso end-to-end**: mediante `lens.analyze(texto, layer=...)` se pueden obtener tokens, scores y energía directamente desde texto.
- **Integración con activaciones externas**: permite transformar activaciones capturadas por separado siempre que se respeten la revisión del modelo, sitio de activación y preprocesado.
- **Compatibilidad con la librería `icalens`**: se carga fácilmente con `ICALens.from_pretrained(...)`.

## Casos de uso

- **Investigación en interpretabilidad de transformers**: los investigadores pueden usar el lens para descomponer las activaciones de GPT-2 en componentes independientes y estudiar qué información codifica cada uno, por ejemplo, analizando si ciertos componentes corresponden a conceptos sintácticos o semánticos.
- **Análisis de circuitos internos**: al combinar las puntuaciones ICA de diferentes capas, se pueden rastrear cómo fluye la información a través de la red, identificando subconjuntos de componentes que participan en tareas específicas (por ejemplo, resolución de correferencias o detección de negación).
- **Comparación de representaciones entre variantes**: dado que el lens está ligado a una revisión concreta de GPT-2, se puede usar como referencia para comparar cómo cambian las activaciones si se modifica el modelo (por ejemplo, fine-tuning) o para validar otras técnicas de interpretabilidad.
- **Depuración de comportamientos no deseados**: los desarrolladores pueden inspeccionar qué componentes se activan ante entradas que provocan alucinaciones o sesgos, ayudando a identificar posibles causas internas.
- **Educación y divulgación**: sirve como herramienta didáctica para mostrar de forma tangible cómo se distribuye la información en un transformer, sin necesidad de entrenar modelos auxiliares.
- **Base para estudios de sparse autoencoders (SAE)**: al proporcionar una descomposición ICA de referencia, puede utilizarse como punto de partida o comparación para evaluar la calidad de los SAE entrenados sobre GPT-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no está diseñado para tareas de generación o clasificación, sino para análisis interpretativo, por lo que no tiene métricas de rendimiento de modelo comparables.

## Requisitos de hardware

- **VRAM estimada**: no se requiere GPU para cargar el lens; el artefacto ocupa 0.2 GB en disco y puede cargarse en memoria RAM (menos de 1 GB).
- **GPU recomendadas**: no aplica, funciona en CPU sin problemas.
- **Compatibilidad con hardware de consumo**: sí, cualquier máquina con Python y la librería `icalens` puede ejecutar el análisis.
- **Opciones de despliegue**: integración en scripts de Python mediante la librería `icalens`; no requiere servidores de inferencia.
- **Latencia y throughput**: no se han medido oficialmente, pero al ser transformaciones matriciales lineales sobre activaciones de GPT-2 (768 dimensiones), el coste por token es bajo.

## Comparativa con modelos similares

| Técnica | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICA Lens (este artefacto) | Descomposición lineal ICA | 12×768 componentes | Fijo (GPT-2) | No disponible | HuggingFace |
| Sparse autoencoders (SAE) | Diccionario aprendido | Variable (por ejemplo, 768→4096) | Flexible (cualquier modelo) | Variable | Open source (por ejemplo, OpenAI, Anthropic) |
| TCAV (Testing with Concept Activation Vectors) | Direcciones de concepto | Depende del concepto | Flexible | Apache 2.0 | Open source |

La comparativa es orientativa: el ICA Lens ofrece una alternativa sin entrenamiento y con menor coste computacional que los SAE, pero estos últimos suelen lograr una descomposición más interpretable al forzar la escasez. No hay datos cuantitativos disponibles para comparar directamente su calidad interpretativa.

## Limitaciones y advertencias

- **Artefacto específico de GPT-2**: el lens está ajustado para una revisión concreta de `openai-community/gpt2`; no es transferible a otros modelos sin reajustar.
- **Scores firmados no probabilísticos**: las puntuaciones ICA son valores con signo y no representan probabilidades; su interpretación requiere cautela.
- **Dependencia del dataset de ajuste**: el lens se ajustó con `pile-10k`, que es un subconjunto pequeño del Pile; los componentes pueden no capturar toda la variabilidad del modelo en dominios muy distintos.
- **Sin licencia especificada**: no se indica la licencia del artefacto, por lo que su uso comercial o redistribución puede estar restringido; se recomienda contactar al autor.
- **No es un modelo generativo**: no puede utilizarse para generar texto ni para tareas de NLP directas; es exclusivamente una herramienta de análisis.
- **Limitaciones del modelo subyacente**: al estar ligado a GPT-2, hereda sus sesgos y limitaciones (por ejemplo, contexto de 1024 tokens, conocimiento desactualizado).

## Enlaces

- [Repositorio HuggingFace: sida/icalens-gpt2-small-pile10k](https://huggingface.co/sida/icalens-gpt2-small-pile10k)
- [Paper: ICA Lens: Interpreting Language Models Without Training Another Dictionary](https://arxiv.org/abs/2606.11722)
- [Modelo analizado: openai-community/gpt2](https://huggingface.co/openai-community/gpt2)
- [Dataset de ajuste: NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k)
