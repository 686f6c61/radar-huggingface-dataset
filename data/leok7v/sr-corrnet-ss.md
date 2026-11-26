# leok7v/sr-corrnet-ss

## Resumen

SR-CorrNet-ss es un modelo de separación de habla (speech separation) para audio mono a 8 kHz que separa entre 2 y 5 hablantes solapados en una misma señal. Lo desarrolla Uihyeop Shin y esta ficha corresponde a una copia republicada por el usuario leok7v, que ha convertido el checkpoint original `model.pt` a un único fichero `safetensors` de 32 bits sin modificar ningún peso. El modelo se distribuye con pipeline `audio-to-audio` y licencia MIT.

La relevancia práctica del modelo está en su tamaño reducido (el repositorio completo ocupa unos 0,1 GB, incluyendo los 250 tensores de pesos) y en la existencia de un port en C puro (`ss.c` del proyecto talk) que reproduce las muestras del código PyTorch con un error de aproximadamente 1e-5. Eso lo hace apto para despliegues embebidos o de baja latencia sin depender de un runtime de Python.

No es un modelo de lenguaje: no genera texto ni razona. Es una red de separación de fuentes entrenada sobre WSJ0-2/3/4/5mix, por lo que su dominio es habla inglesa de laboratorio a 8 kHz. Para evaluar su idoneidad hay que atender a esa restricción de dominio y a la licencia del corpus de entrenamiento, que es independiente de la licencia MIT del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SR-CorrNet (red de separación de habla con correlación, según paper arXiv:2603.29097) |
| Parametros totales | no disponible (el checkpoint original incluía un contador `total_params` que la copia ha eliminado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos de esta copia están en float32 |
| Idiomas soportados | no disponible (entrenado sobre WSJ0, habla inglesa) |
| Licencia | MIT (Copyright (c) 2026 Uihyeop Shin) |
| Formato de pesos | safetensors (250 tensores en float32); el original era `model.pt` |
| Frecuencia de muestreo | 8 kHz |
| Numero de hablantes | 2 a 5 simultáneos |
| Canales de entrada | 1 (mono) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

SR-CorrNet es una red neuronal para separación de habla en un solo canal. El nombre remite a un mecanismo de correlación entre las representaciones de las fuentes, descrito en el paper arXiv:2603.29097, aunque la información disponible no detalla la topología interna (número de capas, tipo de bloques, funciones de activación ni estrategia de máscaras). El checkpoint contiene 250 tensores de pesos.

El entrenamiento se realizó sobre WSJ0-2/3/4/5mix, el conjunto estándar de mezclas de 2, 3, 4 y 5 hablantes derivado de WSJ0, a 8 kHz. No se dispone de datos sobre número de tokens, composición exacta del dataset, ni sobre si hubo etapas de refinamiento posteriores al entrenamiento supervisado. Tampoco hay información sobre aumentos de datos o estrategias de regularización.

La innovación destacable de esta copia no está en el modelo sino en el empaquetado: los 250 tensores se han volcado a un único `safetensors` en float32 y se han eliminado los contadores de profiling (`total_ops`, `total_params`) del checkpoint original. El autor declara explícitamente que ningún peso ha cambiado. El port en C (`ss.c`) reproduce la salida de PyTorch con una tolerancia de 1e-5, lo que abre la puerta a inferencia sin Python.

## Capacidades

- Separación de habla mono a 8 kHz con 2, 3, 4 o 5 hablantes solapados.
- Salida de audio por hablante (pipeline `audio-to-audio`).
- Carga directa desde un único fichero `safetensors` en float32.
- Inferencia posible desde C puro mediante el port `ss.c`, sin dependencia de PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas; el dominio de entrenamiento es WSJ0 (inglés).
- No dispone de modo de razonamiento (thinking), visión ni audio de entrada más allá de la mezcla a separar.
- No es un modelo generativo de texto.

## Casos de uso

- Transcripción de reuniones con solapamiento: el modelo separa las voces antes de pasar cada pista a un ASR, lo que permite obtener transcripciones por hablante en grabaciones mono donde varios participantes hablan a la vez. Es adecuado por su soporte explícito de 2 a 5 hablantes.
- Diarización previa a ASR en centros de contacto: en grabaciones telefónicas a 8 kHz (frecuencia típica de telefonía) el modelo trabaja en su dominio nativo, separando agente y cliente antes de la transcripción.
- Preprocesado para subtitulado automático: separar pistas por hablante facilita la asignación de etiquetas de interlocutor en subtítulos generados automáticamente a partir de audio mono.
- Investigación en separación de fuentes: el modelo sirve como baseline reproducible sobre WSJ0-2/3/4/5mix para comparar arquitecturas, gracias a la licencia MIT y al empaquetado en safetensors.
- Despliegue embebido o de borde: el port en C con tolerancia 1e-5 permite integrar la separación en dispositivos sin Python, con un repositorio de 0,1 GB que cabe en almacenamiento limitado.
- Análisis forense de audio: separar hablantes en una grabación mono de baja calidad para aislar una voz concreta antes de un análisis más detallado, siempre que la señal esté a 8 kHz o se remuestree a esa frecuencia.
- Generación de datasets sintéticos de mezclas: usar el modelo para evaluar o filtrar mezclas de 2 a 5 hablantes en pipelines de aumento de datos para entrenar otros sistemas de ASR o diarización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB y los pesos están en float32, por lo que la huella en memoria es del orden de decenas o pocos cientos de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no hay recomendaciones publicadas; por tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es sobrada. El modelo también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del checkpoint.
- Opciones de despliegue: PyTorch con el código de `github.com/dmlguq456/SR_CorrNet_SS`, o el port en C `ss.c` de `github.com/leok7v/talk`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes | Frecuencia | Licencia | Formato |
|---|---|---|---|---|---|
| SR-CorrNet-ss (esta copia) | Separación de habla mono | 2 a 5 | 8 kHz | MIT | safetensors (float32) |
| shinuh/sr-corrnet-ss-1ch-wsj-var-2-5spk | Separación de habla mono (original) | 2 a 5 | 8 kHz | MIT | PyTorch (`model.pt`) |
| Alternativas tipo Conv-TasNet / SepFormer | Separación de habla mono | 2 (habitual) | 8 o 16 kHz | variable según implementación | variable |

La información disponible no permite comparar rendimiento numérico con otras arquitecturas de separación, ya que no se han publicado métricas (SI-SNRi, SDRi) en la documentación consultada. La comparación con el modelo base es directa: mismos pesos, distinto empaquetado.

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre WSJ0 a 8 kHz; el rendimiento fuera de habla inglesa de laboratorio o con otras frecuencias de muestreo no está documentado y probablemente degrade.
- Frecuencia fija de 8 kHz: requiere remuestrear audio de 16 kHz o 44,1 kHz, con la pérdida de información que ello implica.
- Sin métricas publicadas: no hay SI-SNRi ni SDRi en la información disponible, lo que impide estimar la calidad de separación antes de desplegar.
- Riesgo de artefactos: como todo modelo de separación, puede introducir distorsión o supresión parcial de voces cuando el número real de hablantes no coincide con el asumido.
- Sesgos: no documentados; al entrenarse sobre WSJ0, el dominio de hablantes y condiciones acústicas es limitado y no representativo de poblaciones diversas.
- Licencia del corpus: los datos de entrenamiento (WSJ0) están licenciados por la LDC bajo sus propios términos, independientes de la licencia MIT del modelo. El uso comercial del modelo puede requerir revisar esas condiciones.
- Copia no oficial: este repositorio es una copia modificada no afiliada ni respaldada por los autores originales; para producción conviene evaluar también el checkpoint original.
- Sin soporte de texto, tool calling ni agentes: no debe confundirse con un modelo de lenguaje.
- Sin garantías: la licencia MIT excluye garantías; el autor de la copia no ofrece soporte.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/leok7v/sr-corrnet-ss
- Modelo base original: https://huggingface.co/shinuh/sr-corrnet-ss-1ch-wsj-var-2-5spk
- Código y paper del autor original: https://github.com/dmlguq456/SR_CorrNet_SS
- Paper: https://arxiv.org/abs/2603.29097
- Port en C: https://github.com/leok7v/talk
