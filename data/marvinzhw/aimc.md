# MarvinZhw/AIMC

## Resumen

AIMC (MarvinZhw/AIMC) no es un modelo de lenguaje al uso, sino un repositorio de checkpoints y datos experimentales para proyectos de computación analógica en memoria (analog in-memory computing, AIMC), publicados por el usuario MarvinZhw. El repositorio agrupa dos artefactos independientes: un modelo de lenguaje LSTM de 2 capas entrenado con técnicas hardware-aware sobre el corpus Penn Treebank (carpeta LSTM_HWA) y una ResNet-32 entrenada también con entrenamiento hardware-aware sobre CIFAR-10 (carpeta CNN_HWA). En ambos casos se incluyen no solo los pesos, sino también resultados de barridos de inferencia (inference-sweep results) destinados a estudiar el comportamiento del modelo bajo las no idealidades de un acelerador analógico.

El interés del repositorio es por tanto de investigación en co-diseño hardware-software: sirve para reproducir y comparar cómo se degrada la precisión de una red cuando sus pesos se mapean en matrices de memristores o dispositivos de conductancia variable, usando la librería aihwkit de IBM como herramienta de simulación. Los tags del repositorio (analog-in-memory-computing, aihwkit, hardware-aware-training) confirman este enfoque.

La relevancia es acotada y muy especializada. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, un tamaño de 0,8 GB y no declara licencia, idiomas, pipeline ni parámetros en su model card. No debe confundirse con un modelo generativo desplegable en producción: es material de experimentación asociado a dos repositorios de código en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos artefactos independientes: LSTM de 2 capas (modelo de lenguaje) y ResNet-32 (clasificación de imágenes). No es una arquitectura única |
| Parámetros totales | No disponible (la model card no declara recuento de parámetros para ninguno de los dos artefactos) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en LSTM_HWA se trata de un modelo de lenguaje sobre Penn Treebank; la ventana concreta no se declara) |
| Tipos de cuantización | No disponible. El repositorio incluye barridos de inferencia bajo no idealidades analógicas, pero no se especifican esquemas de cuantización (INT8, 4 bits, etc.) |
| Idiomas soportados | No disponible. El modelo LSTM se entrena sobre Penn Treebank, corpus en inglés; la model card no declara soporte multilingüe |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | No disponible (el repositorio contiene checkpoints, pero no se especifica el formato: safetensors, PyTorch .pt, GGUF, etc.) |
| Tamaño del repositorio | 0,8 GB |
| Fecha de creación | 2026-10-05 |
| Última actualización | 2026-10-05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene dos proyectos diferenciados. El primero, LSTM_HWA, es un modelo de lenguaje basado en una LSTM de 2 capas entrenada sobre Penn Treebank con entrenamiento hardware-aware, es decir, incorporando en el bucle de entrenamiento un modelo de las no idealidades del hardware analógico (ruido de programación, desviación de conductancia, ruido de lectura, deriva, etc.) para que los pesos aprendidos sean robustos al mapeo posterior sobre crossbars analógicos. El segundo, CNN_HWA, es una ResNet-32 entrenada igualmente con hardware-aware training sobre CIFAR-10, con el mismo objetivo de tolerancia a imperfecciones del dispositivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de los corpora citados (Penn Treebank y CIFAR-10), ni sobre si se aplicaron técnicas de alineamiento tipo RLHF o DPO, algo por otra parte poco habitual en modelos de esta naturaleza. La innovación técnica declarada es precisamente el uso de entrenamiento hardware-aware con aihwkit y la publicación conjunta de los barridos de inferencia, que permiten analizar la curva de degradación de métricas en función de los parámetros de no idealidad del acelerador simulado. La model card no aporta detalles adicionales sobre la arquitectura interna, la inicialización, el optimizador o el régimen de entrenamiento.

## Capacidades

- Generación de texto a pequeña escala: el artefacto LSTM_HWA es un modelo de lenguaje sobre Penn Treebank, orientado al modelado estadístico del lenguaje y al cálculo de perplejidad, no a la conversación.
- Clasificación de imágenes de 32x32: el artefacto CNN_HWA es una ResNet-32 entrenada sobre las 10 clases de CIFAR-10.
- Evaluación de robustez frente a no idealidades analógicas: ambos artefactos incorporan resultados de barridos de inferencia que permiten caracterizar el comportamiento bajo distintos niveles de ruido o desviación de dispositivo.
- Reproducibilidad de experimentos de hardware-aware training con aihwkit.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingüe.
- No se declara ningún modo especial (thinking mode, visión, audio, decodificación especulativa).

## Casos de uso

- Investigación en entrenamiento hardware-aware: utilizar los checkpoints de LSTM_HWA y CNN_HWA como línea base reproducible para comparar nuevas estrategias de regularización o de modelado de ruido en el bucle de entrenamiento.
- Estudio de degradación de precisión en aceleradores analógicos: los inference-sweep results permiten trazar curvas de accuracy (CIFAR-10) o perplejidad (Penn Treebank) frente a parámetros de no idealidad, útil para decidir el presupuesto de ruido admisible en un diseño de chip.
- Validación de software stacks para AIMC: servir de carga de trabajo de prueba para verificar que un stack de simulación o compilación (por ejemplo, aihwkit y herramientas asociadas) mapea correctamente pesos a crossbars y reproduce los resultados publicados.
- Docencia y formación especializada: reproducir un experimento completo de co-diseño hardware-software con dos dominios distintos (secuencial y convolucional) en un curso de posgrado sobre computación neuromórfica o aceleradores analógicos.
- Punto de partida para fine-tuning hardware-aware en visión: reutilizar la receta y los checkpoints de ResNet-32 sobre CIFAR-10 para transferir la metodología a otros conjuntos de imágenes de pequeño tamaño.
- Comparación de esquemas de mapeo de pesos: emplear la misma red con distintos niveles de cuantización o de rango dinámico de conductancia para medir el compromiso entre área del crossbar y precisión.
- Análisis de modelos de lenguaje de bajo coste energético: estudiar si una LSTM de 2 capas es viable como bloque de modelado de lenguaje en un acelerador analógico, evaluando la pérdida de perplejidad frente a la versión digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el repositorio incluye checkpoints y "inference-sweep results" para ambos artefactos, pero no proporciona cifras concretas de perplejidad, accuracy, MMLU, HumanEval, GSM8K ni de ningún otro benchmark en el texto facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara recuento de parámetros ni formato de pesos, por lo que no puede calcularse una cifra fiable a partir de la información proporcionada.
- GPU recomendadas: no disponible. Se trata, en cualquier caso, de dos redes de escala reducida (una LSTM de 2 capas para modelado de lenguaje y una ResNet-32 para imágenes de 32x32), por lo que es esperable que la inferencia quepa en GPU de gama consumer e incluso en CPU, pero esto es una apreciación cualitativa basada en la clase de modelo y no un dato declarado.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño reducido de ambos modelos, aunque no se confirma en la documentación.
- Opciones de despliegue: los repositorios de código enlazados (github.com/LU-zhw323/LSTM_HWA y github.com/LU-zhw323/CNN_HWA) apuntan a ejecución en Python con PyTorch y aihwkit. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a estos artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa. A continuación se comparan los dos artefactos incluidos en el propio repositorio:

| Artefacto | Tarea | Dataset | Entrenamiento | Código |
|---|---|---|---|---|
| LSTM_HWA | Modelado de lenguaje (2 capas LSTM) | Penn Treebank | Hardware-aware con aihwkit | github.com/LU-zhw323/LSTM_HWA |
| CNN_HWA | Clasificación de imágenes (ResNet-32) | CIFAR-10 | Hardware-aware con aihwkit | github.com/LU-zhw323/CNN_HWA |

Como referencia externa asociada al mismo ámbito, en la búsqueda web aparece el repositorio MarvinZhw/LSTM-HWA-PTB, del mismo autor y sin model card, que parece un artefacto relacionado o precursor del LSTM incluido aquí. No se han identificado en la búsqueda modelos comparables adicionales con parámetros, contexto y licencia declarados que permitan una tabla de comparación rigurosa: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo listo para producción: son checkpoints de investigación para experimentos de computación analógica en memoria, no un asistente conversacional ni un modelo de propósito general.
- Licencia no declarada: al no especificarse licencia, debe asumirse que no se conceden permisos explícitos de uso comercial o de redistribución. Cualquier uso en producción requiere aclarar previamente los términos con el autor.
- Model card mínima: no se declaran parámetros, contexto, idiomas, formato de pesos ni pipeline, lo que impide dimensionar el despliegue con datos verificados.
- Riesgo de alucinación: aplicable al componente de modelado de lenguaje, pero no evaluable, ya que no se publican muestras ni métricas de calidad de generación.
- Sesgos: no hay información sobre la composición de los datos ni sobre análisis de sesgo. Penn Treebank y CIFAR-10 son conjuntos pequeños, antiguos y con sesgos de dominio conocidos en la literatura.
- Limitación de idioma: el componente de lenguaje se entrena sobre un corpus en inglés; no hay evidencia de soporte de castellano ni de otros idiomas.
- Sin garantía de reproducibilidad: los resultados de los barridos de inferencia dependen del modelo de no idealidades configurado en aihwkit (ruido, desviación, deriva), que no se detalla en la model card.
- Madurez e impacto: 0 descargas y 0 likes, publicación única sin actualizaciones posteriores, sin comunidad asociada.
- Advertencia sobre falsos positivos en la búsqueda: varios resultados web con la sigla AIMC corresponden a proyectos no relacionados (el framework Marvin para aplicaciones con LLM, un plugin de Minecraft y un artículo de comunicación mediada por IA), por lo que no deben tomarse como documentación de este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MarvinZhw/AIMC
- Carpeta LSTM_HWA: https://huggingface.co/MarvinZhw/AIMC/tree/main/LSTM_HWA
- Carpeta CNN_HWA: https://huggingface.co/MarvinZhw/AIMC/tree/main/CNN_HWA
- Código de LSTM_HWA: https://github.com/LU-zhw323/LSTM_HWA
- Código de CNN_HWA: https://github.com/LU-zhw323/CNN_HWA
- Repositorio relacionado del mismo autor: https://huggingface.co/MarvinZhw/LSTM-HWA-PTB
- Artículo relacionado sobre stacks de software para AIMC (Nature): https://www.nature.com/articles/s44287-025-00187-1.pdf
- Resultados de búsqueda no relacionados con este repositorio (framework Marvin): https://askmarvin.ai/welcome
- Resultados de búsqueda no relacionados con este repositorio (plugin AIMCDev para Minecraft): https://modrinth.com/plugin/aimcdev
- Resultados de búsqueda no relacionados con este repositorio (artículo sobre comunicación mediada por IA): https://academic.oup.com/anncom/advance-article/doi/10.1093/anncom/wlag029/8729171
