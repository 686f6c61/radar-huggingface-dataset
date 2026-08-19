# sida/icalens-qwen3.5-2b-base-pile10k

## Resumen

Este repositorio contiene un artefacto de interpretabilidad denominado **ICA Lens**, desarrollado por Sida Liu y Feijiang Han, que permite analizar las activaciones internas del modelo de lenguaje [Qwen/Qwen3.5-2B-Base](https://huggingface.co/Qwen/Qwen3.5-2B-Base). No se trata de un modelo de lenguaje en sí, sino de una transformación matemática ajustada sobre las activaciones del modelo base para descomponerlas en componentes independientes mediante análisis de componentes independientes (ICA). El artefacto está pensado para investigadores que quieran entender qué información codifican las distintas capas del transformer sin necesidad de entrenar diccionarios adicionales, como los sparse autoencoders (SAE).

El ICA Lens se ajustó sobre un millón de tokens del dataset [NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k) y cubre las 24 capas del modelo (índices 0 a 23), con un tamaño oculto de 2048 dimensiones por capa. Cada capa dispone de una transformación ICA con 2048 componentes, lo que permite mapear las activaciones del residual stream a puntuaciones independientes y a fracciones de energía por token. El método se describe en el artículo [ICA Lens: Interpreting Language Models Without Training Another Dictionary](https://arxiv.org/abs/2606.11722) (arXiv:2606.11722).

La relevancia actual de este artefacto radica en que ofrece una alternativa ligera y sin entrenamiento adicional a los métodos de interpretabilidad basados en diccionarios, con un coste de ajuste relativamente bajo (FastICA con 50 iteraciones por capa) y una aplicabilidad directa sobre modelos de la familia Qwen. El repositorio tiene un tamaño de 2.0 GB y está publicado bajo una licencia no especificada, lo que obliga a consultar las condiciones de uso antes de emplearlo en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens sobre Qwen/Qwen3.5-2B-Base (artefacto de interpretabilidad, no modelo de lenguaje) |
| Parametros totales | no disponible (el artefacto contiene matrices de transformación ICA por capa, no parámetros de red neuronal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (contexto usado durante el ajuste del lens) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como pesos en formato de la librería `icalens`) |
| Idiomas soportados | no disponible (depende del modelo analizado, Qwen3.5-2B-Base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por el tamaño del repo y la librería `icalens`; no se especifica explícitamente) |

## Arquitectura y entrenamiento

El artefacto consiste en una serie de transformaciones ICA ajustadas por capa sobre las activaciones `resid_post` del modelo Qwen/Qwen3.5-2B-Base. Para cada capa (24 en total), se aplicó un preprocesado de centrado y blanqueo (whitening) seguido de una rotación ortogonal aprendida mediante FastICA con 50 iteraciones. El ajuste se realizó sobre un millón de tokens muestreados del dataset Pile-10k, con una semilla fija (seed 0) y una longitud de contexto de 1024 tokens. Los tokens de documento se enmarcaron con el token de control `<|endoftext|>` (token ID 248044) antes de cada secuencia, siguiendo la política de enmarcado del modelo Qwen.

Las puntuaciones resultantes son valores ICA estándar con signo, calculados como las activaciones centradas y blanqueadas multiplicadas por la rotación aprendida. La energía por token se define como el cuadrado de la puntuación dividido por la suma de los cuadrados de todas las puntuaciones de los componentes de esa capa. No se aplica escalado posterior de fuentes en los ajustes v0.2. La identidad y revisión exacta del modelo analizado se almacenan de forma autoritativa en el archivo `icalens.json`, de modo que la carga del lens no depende de los metadatos de la model card.

## Capacidades

- Análisis de activaciones del residual stream en las 24 capas del modelo Qwen3.5-2B-Base, mapeándolas a puntuaciones ICA independientes.
- Cálculo de la fracción de energía por token y por componente, lo que permite identificar qué componentes dominan la representación de cada token en cada capa.
- Transformación de activaciones capturadas externamente, siempre que se respeten la revisión del modelo, el sitio de activación, el indexado de capas y el preprocesado registrados en `icalens.json`.
- Análisis de texto de extremo a extremo mediante la función `analyze()`, que devuelve tokens, puntuaciones y energía.
- Compatibilidad con la librería `icalens` (versión 0.3.3.dev0), que gestiona la carga y aplicación del artefacto.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, ya que es un artefacto de análisis y no un modelo generativo.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite descomponer las activaciones de Qwen3.5-2B-Base en componentes independientes para estudiar qué información se codifica en cada capa, sin necesidad de entrenar diccionarios supervisados.
- Comparación de representaciones entre capas: al disponer de transformaciones ICA por capa, se pueden comparar las energías de los componentes a lo largo de la profundidad del modelo para identificar dónde se concentra información semántica o sintáctica.
- Detección de sesgos o artefactos lingüísticos: analizando las puntuaciones ICA de tokens concretos, se puede estudiar si ciertos componentes responden de forma desproporcionada a categorías demográficas o temáticas.
- Depuración de fallos de alucinación: al examinar las activaciones de tokens generados por el modelo, se puede correlacionar la actividad de componentes específicos con respuestas incorrectas o inventadas.
- Evaluación de la calidad de representaciones para fine-tuning: antes de ajustar el modelo, se puede usar el lens para verificar si las representaciones internas son estables y bien separadas en los dominios de interés.
- Educación y divulgación: sirve como herramienta didáctica para mostrar cómo funcionan los transformers por dentro, usando un modelo pequeño (2B) y un método de análisis accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo analizado ni comparaciones con otros métodos de interpretabilidad. El artículo asociado (arXiv:2606.11722) podría contener evaluaciones, pero no se dispone de ellas en la información proporcionada.

## Requisitos de hardware

- El artefacto ocupa 2.0 GB en disco, por lo que es ligero y puede cargarse en cualquier máquina con al menos 4 GB de RAM.
- Para ejecutar el análisis de activaciones se requiere cargar también el modelo Qwen3.5-2B-Base (aproximadamente 4 GB en FP16), por lo que se recomienda una GPU con al menos 8 GB de VRAM si se quiere un análisis rápido.
- En CPU, el análisis de un texto corto puede completarse en segundos, pero el procesamiento de corpus grandes será lento; se recomienda GPU para uso intensivo.
- Opciones de despliegue: la librería `icalens` se integra con el ecosistema de HuggingFace Transformers; no se requiere infraestructura especial más allá de Python y PyTorch.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del tamaño del texto analizado.

## Comparativa con modelos similares

| Artefacto | Modelo analizado | Método | Capas | Tamaño | Licencia |
|---|---|---|---|---|---|
| ICA Lens (este repo) | Qwen3.5-2B-Base | ICA (FastICA) | 24 | 2.0 GB | no disponible |
| Sparse autoencoders (SAE) típicos | Varios (GPT-2, Llama) | SAE entrenado | variable | variable | depende del repo |
| Logit lens | Varios | Proyección lineal | todas | pequeño | depende del repo |

No se dispone de comparativas cuantitativas con otros métodos de interpretabilidad en la información proporcionada. La principal diferencia frente a los SAE es que el ICA Lens no requiere entrenar un diccionario adicional, sino que ajusta una transformación lineal mediante ICA, lo que reduce el coste computacional y simplifica el flujo de trabajo.

## Limitaciones y advertencias

- Los identificadores de componentes son específicos de cada capa y de cada artefacto ajustado; no son transferibles entre modelos ni entre revisiones del mismo modelo.
- Las puntuaciones ICA estándar tienen signo y no representan probabilidades; interpretarlas como magnitudes de activación requiere comprender la definición de energía relativa.
- El artefacto se ajustó únicamente sobre el dataset Pile-10k; su comportamiento sobre otros dominios o idiomas puede ser menos fiable.
- La licencia no está especificada, por lo que el uso comercial, la redistribución o la modificación del artefacto requieren contactar con el autor o esperar a que se aclare la licencia.
- El modelo analizado, Qwen3.5-2B-Base, tiene sus propias limitaciones (sesgos, alucinaciones, idiomas soportados) que se trasladan al análisis.
- No se garantiza que el artefacto funcione con versiones futuras de la librería `icalens` ni con otras revisiones del modelo Qwen.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/sida/icalens-qwen3.5-2b-base-pile10k)
- [Modelo analizado: Qwen/Qwen3.5-2B-Base](https://huggingface.co/Qwen/Qwen3.5-2B-Base)
- [Dataset de ajuste: NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k)
- [Artículo: ICA Lens (arXiv:2606.11722)](https://arxiv.org/abs/2606.11722)
