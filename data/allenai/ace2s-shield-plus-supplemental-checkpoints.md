# allenai/ACE2S-SHiELD-plus-supplemental-checkpoints

## Resumen

El repositorio `allenai/ACE2S-SHiELD-plus-supplemental-checkpoints` contiene un conjunto de checkpoints adicionales asociados al modelo ACE2S-SHiELD+, un emulador climático global basado en machine learning desarrollado por el Allen Institute for AI (Ai2). Estos checkpoints se utilizaron en los experimentos de ablación y con semillas aleatorias alternativas descritos en el manuscrito "Disentangling the effects of sea surface temperature and CO2 in global machine learned weather-climate emulators" (arXiv:2606.07928). El propósito principal es permitir reproducir y analizar los resultados del estudio, separando el impacto de incluir datos aleatorios de CO2 y de imponer conservación de energía en el entrenamiento. Para la mayoría de los casos de uso, el autor recomienda utilizar el checkpoint principal del modelo ACE2S-SHiELD+ disponible en [este repositorio](https://huggingface.co/allenai/ACE2S-SHiELD-plus), que es el que produce los mejores resultados.

El repositorio incluye cuatro subdirectorios, cada uno con dos checkpoints (etiquetados `rs0_ckpt.tar` y `rs1_ckpt.tar`) correspondientes a diferentes configuraciones de entrenamiento: con o sin datos aleatorios de CO2 y con o sin restricción de conservación de energía. Todos los checkpoints están licenciados bajo Apache 2.0 y están pensados para uso investigativo y educativo, siguiendo las directrices de uso responsable de Ai2. El tamaño total del repositorio es de 22.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (emulador climatico basado en redes neuronales, detalles en el manuscrito) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de emulacion climatica, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints en formato `.tar` (probablemente contienen tensores serializados) |

## Arquitectura y entrenamiento

No se proporcionan detalles técnicos específicos sobre la arquitectura interna de los checkpoints en este repositorio. El modelo ACE2S-SHiELD+ es un emulador climático que aprende a simular la evolución del clima a partir de condiciones de forzamiento (como concentraciones de CO2 y temperatura superficial del mar). Los experimentos de ablación descritos en el manuscrito evaluan la influencia de dos factores en el entrenamiento: la inclusión de datos aleatorios de CO2 (para evitar correlaciones espurias) y la imposición de conservación de energía como restricción física. Cada checkpoint se entrenó con una semilla aleatoria diferente (rs0 y rs1) y se seleccionó el mejor epoch según la habilidad de inferencia inline, evaluada mediante un ensamblaje de simulaciones en climas de equilibrio con 1x, 2x y 4x CO2. Para más detalles técnicos, se remite al manuscrito y al repositorio principal del modelo.

## Capacidades

- Emulación de variables atmosféricas y climáticas a escala global, incluyendo temperatura, presión, viento y otras variables relevantes.
- Simulación de experimentos de cambio climático con diferentes concentraciones de CO2 (1x, 2x, 4x), permitiendo estudiar la respuesta del sistema climático.
- Evaluación de la sensibilidad del modelo a la inclusión de datos aleatorios y a restricciones físicas (conservación de energía), útil para análisis de robustez.
- Los checkpoints permiten reproducir los resultados del manuscrito y realizar análisis adicionales de ablación.
- No es un modelo de lenguaje ni admite interacción textual; su salida son campos climáticos simulados.

## Casos de uso

- Investigación en emulación climática: estos checkpoints permiten a los investigadores reproducir los experimentos de ablación del manuscrito y verificar la influencia de las configuraciones de entrenamiento en el rendimiento del emulador.
- Análisis de robustez de modelos climáticos: al comparar los resultados entre las configuraciones con y sin datos aleatorios de CO2 y con y sin conservación de energía, se puede estudiar la sensibilidad del modelo a estas decisiones de diseño.
- Desarrollo de emuladores climáticos eficientes: los checkpoints sirven como punto de partida para investigar mejoras en la arquitectura o en el entrenamiento, utilizando estas variantes como baseline.
- Enseñanza y formación en machine learning aplicado a ciencias de la Tierra: los datos y checkpoints pueden usarse en cursos o talleres para demostrar cómo se aplican técnicas de deep learning a problemas climáticos.
- Estudios de atribución de cambios climáticos: el modelo puede emplearse para separar los efectos de la temperatura superficial del mar y del CO2 en simulaciones, como se describe en el título del manuscrito.
- Validación de metodologías de inferencia: los checkpoints permiten probar diferentes estrategias de inferencia (ensamblajes, condiciones de equilibrio) y comparar su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los detalles de evaluación se encuentran en el manuscrito (arXiv:2606.07928), donde se comparan los resultados de las distintas configuraciones, pero no se proporcionan tablas numéricas en esta ficha.

## Requisitos de hardware

- Tamaño del repositorio: 22.4 GB, lo que sugiere que cada checkpoint ocupa varios GB (posiblemente entre 5 y 10 GB cada uno, aunque no se especifica).
- Se requiere una GPU con suficiente VRAM para cargar el modelo y realizar inferencia. Dado el tamaño, es probable que se necesite al menos una GPU con 16-24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100) para trabajar cómodamente.
- No se proporcionan requisitos exactos de VRAM ni de memoria RAM en la información disponible.
- El despliegue se realizaría mediante la librería `fme` (Full Model Emulation) de Ai2, que es el framework indicado en la etiqueta `library_name`. No se mencionan opciones como vLLM u Ollama porque no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y del tamaño del dominio simulado; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (emuladores climáticos basados en ML) dentro de la información proporcionada. El modelo ACE2S-SHiELD+ es parte de la serie ACE de Ai2, pero no se detallan comparaciones con otros emuladores en esta ficha. Para una comparativa exhaustiva, se recomienda consultar el manuscrito.

## Limitaciones y advertencias

- Estos checkpoints son suplementarios y están diseñados para experimentos de ablación; no se recomienda su uso para aplicaciones generales de emulación climática. El checkpoint principal del modelo ACE2S-SHiELD+ es el que ofrece mejor rendimiento.
- El modelo es una emulación simplificada del sistema climático y no debe sustituir a los modelos climáticos físicos completos para decisiones políticas o de planificación.
- Puede presentar sesgos inherentes a los datos de entrenamiento y a las simplificaciones del modelo, especialmente en escenarios extremos o fuera del rango de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero Ai2 establece directrices de uso responsable que deben respetarse.
- No se proporciona información sobre la composición exacta de los datos de entrenamiento ni sobre posibles sesgos geográficos o temporales.
- La documentación técnica (arquitectura, hiperparámetros, etc.) no está disponible en este repositorio; se debe consultar el manuscrito para obtener detalles.

## Enlaces

- Repositorio principal del modelo ACE2S-SHiELD+: https://huggingface.co/allenai/ACE2S-SHiELD-plus
- Manuscrito (arXiv): https://arxiv.org/abs/2606.07928
- Código de los experimentos (GitHub): https://github.com/ai2cm/ace2s-shield-plus-paper
- Colección ACE de Ai2 en HuggingFace: https://huggingface.co/collections/allenai/ace
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
