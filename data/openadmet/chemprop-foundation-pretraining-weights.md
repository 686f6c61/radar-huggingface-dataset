# openadmet/chemprop-foundation-pretraining-weights

## Resumen

ChemProp Foundation Pretraining Weights es un conjunto de pesos preentrenados del modelo ChemProp, una red neuronal de paso de mensajes (MPNN) diseñada para la predicción de propiedades moleculares. El modelo ha sido desarrollado por el equipo de OpenADMET y forma parte de su plataforma de modelado de propiedades ADMET (absorción, distribución, metabolismo, excreción y toxicidad). Estos pesos corresponden al modelo fundacional CheMeleon, entrenado siguiendo las especificaciones descritas en el blog oficial de OpenADMET.

El modelo resuelve el problema de la predicción de propiedades fisicoquímicas y biológicas de moléculas pequeñas, un paso crítico en el descubrimiento de fármacos y el diseño de compuestos. Su relevancia radica en que proporciona una base preentrenada que puede ser ajustada (fine-tuning) para tareas específicas mediante la herramienta `anvil` de OpenADMET, evitando la necesidad de entrenar desde cero. El repositorio contiene únicamente los pesos (0,5 GB) y no incluye el código de entrenamiento ni documentación adicional sobre la arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNN (Message Passing Neural Network) basada en ChemProp |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de quimica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque el modelo opera sobre moleculas, no sobre texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (posiblemente .pt o safetensors, no se especifica) |

## Arquitectura y entrenamiento

ChemProp es una arquitectura de red neuronal de paso de mensajes (MPNN) que opera directamente sobre grafos moleculares. Cada átomo se representa como un nodo y cada enlace como una arista, y la red propaga información a través del grafo mediante operaciones de paso de mensajes. El modelo preentrenado CheMeleon sigue esta arquitectura, pero ha sido entrenado con un conjunto de datos masivo y diverso de moléculas, según se describe en el blog de OpenADMET titulado "Throwing everything and the kitchen sink at CheMeleon". No se han publicado detalles específicos sobre el número de parámetros, la composición exacta del dataset de entrenamiento ni el número de tokens (en este contexto, moléculas) utilizados. El entrenamiento se realizó siguiendo las especificaciones de dicho blog, y los pesos resultantes se distribuyen para su uso como punto de partida en tareas de predicción de propiedades.

No se dispone de información sobre técnicas de entrenamiento como RLHF o DPO, ya que no se trata de un modelo de lenguaje. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura MPNN de ChemProp.

## Capacidades

- Predicción de propiedades moleculares: el modelo puede ser ajustado para predecir propiedades ADMET, como solubilidad, permeabilidad, toxicidad, metabolismo, etc.
- Generación de representaciones moleculares: al ser un modelo preentrenado, puede extraer embeddings de moléculas útiles para tareas downstream.
- Transferencia de aprendizaje: los pesos pueden utilizarse como inicialización para entrenar modelos específicos con la herramienta `anvil` de OpenADMET, acelerando la convergencia y mejorando el rendimiento en datasets pequeños.
- No es un modelo generativo: no genera texto ni moléculas nuevas, solo produce predicciones o representaciones.
- No soporta tool calling ni razonamiento multi-paso, ya que no es un LLM.
- Capacidades multilingües: no aplica, ya que opera sobre grafos moleculares y no sobre lenguaje natural.

## Casos de uso

- Descubrimiento de fármacos: el modelo puede utilizarse para filtrar grandes bibliotecas químicas y priorizar compuestos con propiedades ADMET favorables, reduciendo el coste de ensayos experimentales.
- Evaluación de toxicidad: ajustando el modelo con datos de toxicidad, se pueden predecir efectos adversos de candidatos a fármacos antes de la síntesis.
- Optimización de propiedades fisicoquímicas: permite predecir solubilidad, logP o permeabilidad para guiar el diseño de análogos con mejores perfiles.
- Virtual screening: integrado en pipelines de cribado virtual, el modelo puede puntuar millones de moléculas rápidamente para identificar hits potenciales.
- Reposicionamiento de fármacos: al predecir propiedades de fármacos existentes, se pueden explorar nuevas indicaciones terapéuticas.
- Educación e investigación: sirve como herramienta de referencia para estudiar la relación estructura-actividad y para comparar arquitecturas MPNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento en datasets estándar como TDC (Therapeutics Data Commons) ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 0,5 GB, por lo que los pesos son relativamente ligeros.
- VRAM estimada para inferencia: no disponible, pero dado el tamaño de los pesos, es probable que quepa en GPUs de consumo con 4-8 GB de VRAM, aunque no se proporciona confirmación.
- GPU recomendadas: no disponible; cualquier GPU moderna con suficiente VRAM debería ser suficiente para cargar el modelo.
- Es compatible con GPUs de consumo (por ejemplo, RTX 3060, 4060, 4090) dado el tamaño moderado de los pesos.
- Opciones de despliegue: el modelo se usa principalmente a través de la librería `anvil` de OpenADMET, que se integra con PyTorch Lightning. No se mencionan formatos como GGUF o vLLM, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de predicción de propiedades moleculares, como el ChemProp estándar sin preentrenamiento, o modelos como GROVER, MolCLR o Uni-Mol. El repositorio no proporciona benchmarks ni comparaciones. Se recomienda consultar la documentación de OpenADMET para más detalles sobre el rendimiento relativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni procesa lenguaje natural; su uso se limita a la predicción de propiedades moleculares.
- Sesgos en datos de entrenamiento: al estar preentrenado con un dataset específico, puede presentar sesgos hacia ciertos tipos de moléculas o propiedades, lo que debe evaluarse en cada caso de uso.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las predicciones pueden ser inexactas para moléculas fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no aplica, pero el modelo requiere que las moléculas se representen como grafos válidos; moléculas muy grandes o con química inusual pueden no ser bien procesadas.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de las dependencias (ChemProp, PyTorch, etc.).
- Carencia de documentación: el repositorio no incluye especificaciones técnicas detalladas, por lo que es difícil evaluar su rendimiento sin realizar pruebas propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openadmet/chemprop-foundation-pretraining-weights
- Blog de OpenADMET sobre CheMeleon: https://openadmet.ghost.io/throwing-everything-and-the-kitchen-sink-at-chemeleon/
- Documentación de OpenADMET: https://docs.openadmet.org/en/latest/index.html
- Documentación de ChemProp: https://chemprop.readthedocs.io/en/latest/index.html
- Repositorio de ChemProp en GitHub: https://github.com/chemprop/chemprop
