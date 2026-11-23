# braindecode/Labram-Braindecode

## Resumen

LaBraM-Braindecode es una conversión de pesos del modelo LaBraM (Large Brain Model) al formato nativo de la librería Braindecode, un toolbox de PyTorch para decodificación de señales electrofisiológicas en bruto (EEG, ECoG y MEG). El repositorio lo publica el propio equipo de Braindecode en Hugging Face y su propósito no es ofrecer un modelo nuevo, sino facilitar la reutilización del backbone preentrenado de LaBraM dentro del ecosistema Braindecode, con una interfaz coherente con el resto de modelos de la librería.

LaBraM es un transformer diseñado específicamente para señales cerebrales, preentrenado sobre una gran colección de datasets EEG públicos. Esta conversión traslada los pesos del checkpoint original (prefijados con `student.`) al modelo `Labram` de Braindecode, mapeando explícitamente las capas de convolución temporal del `patch_embed` y eliminando la cabeza de clasificación específica de la tarea original, de modo que el usuario pueda definir su propio número de salidas (`n_outputs`) y número de canales (`n_chans`).

Es relevante porque permite aprovechar un backbone preentrenado en decenas de miles de horas de EEG sin necesidad de reimplementar la arquitectura ni de gestionar manualmente la conversión de pesos. El repositorio incluye el script completo de transferencia (`transfer_labram_weights`), lo que lo convierte en una pieza práctica para investigación en BCI, decodificación de estados mentales y clasificación de patologías neurológicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con patch embedding convolucional temporal (modelo `Labram` de Braindecode) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de `n_times`; el script de ejemplo usa 1600 muestras temporales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sobre señales EEG, no texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`/`.pth`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo LaBraM original: un transformer que procesa señales EEG segmentadas en parches mediante un `patch_embed` compuesto por tres bloques de convolución temporal (`temporal_conv.conv1`, `conv2`, `conv3`) con normalización intermedia (`norm1`, `norm2`, `norm3`). Sobre esos parches se aplican embeddings posicionales y una pila de bloques transformer (`blocks`), seguidos de una normalización final (`fc_norm`) y una cabeza de clasificación que en esta conversión se descarta para permitir cabezas específicas por tarea.

El preentrenamiento original de LaBraM se realizó sobre una extensa colección de datasets EEG públicos, entre los que se incluyen BCIC-IV-1, Emobrain, WAY-EEG-GAL, Inria-BCI-Challenge, Trujillo2020, Trujillo2017, SEED, SEED-IV, SEED-GER, SEED-FRA, SPIS-Resting-State, TUAR, TUEP, TUSZ y TUSL, además de los identificadores OpenNeuro `on004362`, `nm000385` y `nm000216`. Esta conversión no reentrena el modelo: únicamente transfiere los pesos del backbone y omite la cabeza original, por lo que las innovaciones de entrenamiento (objetivos de preentrenamiento, enmascaramiento de parches, etc.) son las del LaBraM original y no se detallan en la información disponible.

## Capacidades

- Extracción de representaciones latentes de señales EEG en bruto, reutilizables para múltiples tareas downstream mediante fine-tuning de una cabeza de clasificación.
- Clasificación de tareas BCI (imaginación motora, paradigmas P300, etc.) gracias a los datasets BCIC-IV-1 e Inria-BCI-Challenge incluidos en el preentrenamiento.
- Decodificación de estados emocionales y cognitivos (SEED, SEED-IV, SEED-GER, SEED-FRA, Emobrain).
- Detección de anomalías y eventos epilépticos (TUSZ, TUEP, TUAR, TUSL).
- Análisis de señales en estado de reposo (SPIS-Resting-State).
- Adaptación a configuraciones arbitrarias de canales (`n_chans`) y longitud temporal (`n_times`) gracias a la parametrización del modelo `Labram`.
- No soporta tool calling, function calling, agentes ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades multimodales en el sentido de los LLM.

## Casos de uso

- **Clasificación de imaginación motora en BCI**: cargar el modelo con `n_chans` y `n_times` ajustados al montaje del usuario (por ejemplo, 64 canales y 1600 muestras, como en el script de ejemplo) y entrenar una cabeza con `n_outputs=4` para las cuatro clases típicas de BCIC-IV-1. El backbone preentrenado reduce la necesidad de grandes volúmenes de datos etiquetados por sujeto.
- **Decodificación de emociones a partir de EEG**: reutilizar el backbone para tareas de reconocimiento afectivo con los paradigmas SEED, aprovechando que el preentrenamiento ya incluyó SEED, SEED-IV, SEED-GER y SEED-FRA.
- **Detección de crisis epilépticas**: fine-tuning sobre TUSZ o TUSL para clasificación de segmentos con actividad epiléptica, un escenario donde el preentrenamiento multi-dataset aporta robustez frente a la variabilidad entre pacientes.
- **Investigación en decodificación de estados de reposo**: usar el modelo como extractor de features para analizar SPIS-Resting-State y comparar representaciones entre cohortes.
- **Transferencia entre montajes y sujetos**: al permitir fijar `n_chans` de forma arbitraria, el modelo se puede adaptar a distintos cascos EEG sin reentrenar desde cero, lo que facilita estudios multicéntricos.
- **Prototipado rápido en Braindecode**: integrar el modelo en pipelines existentes de la librería (entrenamiento, validación cruzada, evaluación) sin escribir código de conversión de pesos, ya que el repositorio incluye el script `transfer_labram_weights` listo para usar.
- **Benchmarking de modelos EEG**: servir como línea base preentrenada frente a arquitecturas entrenadas desde cero en tareas de decodificación de señales cerebrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del checkpoint no se especifica en la información proporcionada (el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere que los pesos no están alojados en el repo o se cargan desde una fuente externa).
- GPU recomendadas: no disponible. Al ser un transformer de tamaño moderado (típico de LaBraM), es probable que quepa en GPUs consumer, pero no se aportan cifras concretas.
- Compatibilidad con GPU consumer: no confirmada en la información disponible.
- Opciones de despliegue: la librería Braindecode sobre PyTorch es la vía natural; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo EEG).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaBraM-Braindecode | Transformer EEG (conversión) | no disponible | no disponible (`n_times` configurable) | MIT | Hugging Face (braindecode/Labram-Braindecode) |
| LaBraM original | Transformer EEG | no disponible en la información | no disponible | no disponible en la información | Checkpoint original referenciado en el script |
| Otros modelos de Braindecode (p. ej. EEGNet, ShallowFBCSPNet, Deep4Net) | CNN específicas para EEG | no disponible | no disponible | MIT (librería) | Incluidos en la librería Braindecode |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no soporta tool calling ni agentes; cualquier uso en ese sentido es un error de categorización.
- **Conversión parcial**: el script omite explícitamente la cabeza de clasificación original (`head`) y los componentes de `patch_embed` que no sean `temporal_conv`, por lo que el rendimiento puede diferir del LaBraM original si la tarea downstream dependía de esos módulos.
- **Dependencia de la versión de Braindecode**: el mapeo de claves asume una estructura concreta del modelo `Labram`; cambios en la librería pueden romper la transferencia de pesos.
- **Riesgo de sobreajuste en datasets pequeños**: como cualquier backbone preentrenado, el fine-tuning con pocos sujetos requiere regularización y validación cruzada por sujeto.
- **Sesgos de los datos de preentrenamiento**: los datasets incluidos (SEED, BCIC-IV-1, TUSZ, etc.) están sesgados hacia poblaciones, montajes y paradigmas concretos; el rendimiento en otros contextos (por ejemplo, EEG infantil o dispositivos portátiles) no está garantizado.
- **Sin garantías de rendimiento clínico**: no debe usarse para diagnóstico médico sin validación regulatoria específica.
- **Licencia MIT**: permite uso comercial, pero el usuario debe verificar las licencias de los datasets originales si redistribuye pesos derivados.
- **Documentación escasa**: la model card es fundamentalmente un script de conversión; no se aportan métricas, tamaños de checkpoint ni instrucciones de uso más allá del código.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/Labram-Braindecode
- Organización Braindecode en Hugging Face: https://huggingface.co/braindecode
- Documentación de Braindecode: https://braindecode.org/stable/index.html
- Referencia de API de Braindecode: https://braindecode.org/stable/api.html
- Repositorio GitHub de Braindecode: https://github.com/braindecode
- Paquete PyPI: https://pypi.org/project/braindecode/
- Paper de LaBraM (arXiv:2405.18765): https://arxiv.org/abs/2405.18765
