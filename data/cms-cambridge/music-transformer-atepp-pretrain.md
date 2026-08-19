# cms-cambridge/music-transformer-atepp-pretrain

## Resumen

El modelo `cms-cambridge/music-transformer-atepp-pretrain` es un Music Transformer no condicionado entrenado sobre el dataset ATEPP-1.2 de interpretaciones de piano en formato MIDI. Desarrollado por el grupo CMS de la Universidad de Cambridge, este checkpoint sirve como referencia de evaluación por defecto en el repositorio `expectation-benchmarking`, que se centra en el modelado de expectativas musicales mediante la probabilidad de tokens. No debe confundirse con el generador condicionado por jazz descrito en la tesis de Cheston (2025); este modelo está pensado para calcular la log-verosimilitud negativa por token en secuencias MIDI.

La arquitectura es un Transformer decoder con 12 capas, 8 cabezas de atención, dimensión de modelo 768 y FFN de 3072, con una longitud de secuencia de 1024 tokens. El peso del archivo es de aproximadamente 1 GB (formato `.pth`), lo que sugiere un tamaño de modelo en el orden de 250 millones de parámetros, aunque el número exacto no se especifica en la documentación. La licencia MIT permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su papel como punto de referencia para la investigación en cognición musical computacional y en la evaluación de modelos generativos de música simbólica. Al estar diseñado específicamente para el cálculo de NLL, facilita la comparación objetiva entre distintos enfoques de modelado de expectativas, un área activa en la intersección de la inteligencia artificial y la musicología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (12 capas, 8 cabezas, d_model 768, FFN 3072) |
| Parametros totales | no disponible (archivo ~1 GB, estimación ~250M en float32) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32, formato `.pth`) |
| Idiomas soportados | no aplica (entrada MIDI, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder estándar, similar al propuesto por Huang et al. (2018) para generación de música, aunque la documentación no especifica si utiliza atención relativa u otras variantes. Los hiperparámetros declarados son 12 capas, 8 cabezas de atención, dimensión de modelo 768 y FFN de 3072, con una longitud de secuencia de 1024 tokens. Se entrena de forma no condicionada sobre el dataset ATEPP-1.2, que contiene alrededor de 1000 horas de interpretaciones de piano de 49 pianistas de renombre, transcritas automáticamente a MIDI. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es puramente de modelado de lenguaje sobre tokens MIDI.

El checkpoint se publica como parte del repositorio `expectation-benchmarking`, que incluye el tokenizador y la configuración de arquitectura en la propia librería. El propósito declarado es el cálculo de la log-verosimilitud negativa por token para benchmarks de expectativa musical, aunque también incluye una función `generate()` para escucha cualitativa. No se proporcionan detalles sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la referencia a ATEPP.

## Capacidades

- Modelado de probabilidad de tokens MIDI: calcula la distribución de probabilidad sobre el siguiente token en una secuencia, útil para medir la sorpresa o expectativa musical.
- Generación de secuencias MIDI: la función `generate()` permite muestrear nuevas secuencias, aunque la documentación advierte que este checkpoint no es un generador de producción y su calidad no está optimizada para ese fin.
- Evaluación de modelos generativos: sirve como referencia para comparar la capacidad de otros modelos de música simbólica mediante NLL.
- Procesamiento de secuencias de hasta 1024 tokens, suficiente para capturar frases musicales de longitud media.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales; su ámbito se limita a la música simbólica.

## Casos de uso

- Investigación en cognición musical: el modelo se emplea para estudiar cómo los oyentes forman expectativas durante la escucha, calculando la sorpresa de cada evento musical a partir de la NLL del modelo.
- Benchmarking de modelos generativos de música: como checkpoint de referencia, permite comparar de forma objetiva la calidad de modelos como Museformer o Music Transformer en términos de perplejidad sobre datasets estándar.
- Análisis de improvisación: aunque no está condicionado a un estilo concreto, puede usarse para medir la desviación de improvisaciones reales respecto a un modelo de expectativa general.
- Validación de tokenizadores MIDI: al ser un modelo entrenado sobre ATEPP, puede servir para evaluar la eficiencia de distintos esquemas de tokenización en la representación de interpretaciones pianísticas.
- Educación musical asistida por IA: en entornos académicos, puede utilizarse para ilustrar conceptos de modelado probabilístico aplicado a la música, sin necesidad de infraestructura de producción.
- Desarrollo de sistemas de recomendación musical basados en sorpresa: la NLL del modelo podría integrarse en sistemas que sugieran piezas con un nivel de imprevisibilidad deseado, aunque requeriría adaptación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en música y no en tareas de texto o código. Tampoco se reportan valores de perplejidad o NLL sobre conjuntos de validación específicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del archivo (~1 GB en float32), se estima que el modelo tiene alrededor de 250 millones de parámetros, lo que requeriría aproximadamente 1 GB de VRAM solo para los pesos en float32, más memoria para activaciones y el tokenizador. En la práctica, una GPU con 4-6 GB de VRAM debería ser suficiente para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. Para entrenamiento o fine-tuning, se recomendarían GPUs con 8 GB o más.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo PyTorch, puede cargarse directamente con la librería `expectation_benchmarking` o con PyTorch estándar. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos de texto.
- Latencia y throughput: no disponibles. Se espera que la inferencia sea rápida para secuencias de 1024 tokens en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. Aunque existen modelos como Museformer o Music Transformer de Huang et al., no se han encontrado datos públicos de rendimiento de este checkpoint frente a ellos. La comparativa queda pendiente de futuras publicaciones del grupo de Cambridge.

## Limitaciones y advertencias

- El modelo no es un generador de música de producción; su propósito principal es la evaluación de NLL. La calidad de las muestras generadas no está garantizada.
- No está condicionado a ningún estilo o compositor; las secuencias generadas pueden carecer de coherencia estilística.
- La longitud de contexto está limitada a 1024 tokens, lo que restringe la capacidad de modelar estructuras musicales de largo alcance.
- No se han documentado sesgos específicos, pero al entrenarse únicamente con piano clásico de ATEPP, su aplicabilidad a otros instrumentos o géneros es limitada.
- La licencia MIT permite uso comercial, pero el dataset ATEPP tiene sus propios términos de descarga que deben respetarse.
- El tokenizador y la configuración de arquitectura no se incluyen en este repositorio, sino que se distribuyen a través de la librería `expectation_benchmarking`, lo que puede dificultar su uso independiente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/cms-cambridge/music-transformer-atepp-pretrain)
- [Repositorio expectation-benchmarking](https://github.com/cms-cambridge/expectation-benchmarking)
- [Tesis doctoral de Huw Cheston (2025)](https://doi.org/10.17863/cam.126908)
- [Dataset ATEPP (Zhang et al., ISMIR 2022)](https://tangjjbetsy.github.io/ATEPP/)
- [Términos de descarga de ATEPP](https://github.com/tangjjbetsy/ATEPP/blob/master/disclaimer.md)
