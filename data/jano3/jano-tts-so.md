# jano3/jano-tts-so

## Resumen

Jano-TTS (variante `jano3/jano-tts-so`) es un modelo de síntesis de voz (text-to-speech) multi-hablante desarrollado por el usuario jano3 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino sobre un modelo base (orientado a inglés) especializado en somalí (`so`), un idioma de bajos recursos. La arquitectura es no autorregresiva: sigue el paradigma de *flow matching* con una UNet de estilo Matcha y se apoya en el vocoder Vocos para reconstruir la forma de onda a 24 kHz.

El modelo es deliberadamente ligero: 24.593.097 parámetros (~24,6 M) según los pesos en safetensors, lo que lo sitúa en la gama de los TTS de bolsillo, ejecutables incluso en CPU. Soporta 128 identidades de hablante seleccionables mediante un identificador entero (`spk_id` entre 0 y 127), y expone controles de generación como la temperatura, la fuerza de *classifier-free guidance* (`cfg_strength`) y el número de pasos del solver ODE (`n_steps`, típicamente 8-16).

Su relevancia práctica es acotada pero clara: cubre una combinación poco frecuente (somalí, multi-hablante, latencia baja, licencia permisiva para uso comercial), y lo hace con un coste de cómputo mínimo. El repositorio es muy reciente, con 0 descargas y 0 *likes* en el momento de la consulta, y no incluye resultados de benchmarks ni detalles del corpus de entrenamiento más allá de la referencia al dataset `jano3/test`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching con UNet estilo Matcha (no autorregresiva); vocoder Vocos para la decodificacion a forma de onda |
| Parametros totales | 24.593.097 (~24,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; la longitud se define por el texto de entrada, sin limite documentado) |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF, ONNX ni variantes cuantizadas) |
| Idiomas soportados | Somalí (`so`) en esta variante; el autor indica que el modelo base debe usarse para inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con `custom_code` y carga mediante `trust_remote_code=True` |
| Frecuencia de muestreo de salida | 24 kHz |
| Numero de hablantes | 128 (identificadores `spk_id` de 0 a 127) |
| Tamano del repositorio | 1,3 GB |
| Pipeline declarado | `text-to-speech` |
| Dataset declarado | `jano3/test` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de TTS basados en *flow matching* condicional sobre texto, con una red UNet de inspiración Matcha como estimador del campo de velocidad. La generación es no autorregresiva: se parte de ruido gaussiano y se integra una ODE mediante un solver de pocos pasos (el autor recomienda entre 8 y 16), lo que reduce drásticamente la latencia frente a los TTS autorregresivos. El condicionamiento de hablante se introduce mediante un `spk_id` discreto (128 posibles), y la fidelidad se controla con *classifier-free guidance* (`cfg_strength`, por defecto 2,0) y temperatura (por defecto 0,7).

La síntesis final se delega en el vocoder Vocos, que convierte los mel-espectrogramas generados por la UNet en audio a 24 kHz. Se trata de un ajuste fino del modelo base de Jano-TTS sobre habla en somalí; el autor no documenta en la model card el número de tokens de audio, la composición del corpus, la duración total del entrenamiento ni si hubo etapas de alineación o preferencia (RLHF/DPO) posteriores al ajuste supervisado. Tampoco se detalla el origen de las 128 voces ni su distribución geográfica, de edad o de género.

## Capacidades

- Síntesis de voz multi-hablante con 128 identidades seleccionables mediante `spk_id`.
- Generación de audio de 24 kHz con vocoder Vocos integrado en el propio pipeline de inferencia.
- Control de expresividad y fidelidad mediante `temperature` (0,7 por defecto) y `cfg_strength` (2,0 por defecto).
- Control del coste computacional mediante `n_steps` (8-16), lo que permite intercambiar calidad por latencia, incluido en CPU.
- Inferencia no autorregresiva: no hay decodificación token a token, por lo que no se aplican estrategias de decodificación especulativa ni caché KV.
- Capacidad multilingüe: limitada al somalí en esta variante; el inglés corresponde al modelo base, no a este ajuste.
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, visión ni audio de entrada (no es un modelo multimodal de comprensión).
- No se documenta clonación de voz a partir de muestras (zero-shot voice cloning); la identidad se selecciona entre las 128 voces predefinidas.

## Casos de uso

- Audiolibros y contenido largo en somalí: el modelo permite narrar texto con una voz consistente eligiendo un `spk_id` fijo, y su naturaleza no autorregresiva facilita el procesado por lotes de fragmentos largos sin acumular latencia.
- Sistemas de respuesta de voz interactiva (IVR) en somalí: con 24,6 M de parámetros puede desplegarse en el mismo servidor que el motor de diálogo, e incluso en CPU, reduciendo el coste por llamada en centralitas telefónicas.
- Doblaje y localización de vídeo a somalí: la generación por lotes con distintos `spk_id` permite asignar voces diferenciadas a cada personaje sin entrenar un modelo por voz.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos y artículos en somalí dentro de aplicaciones de escritorio o móviles, donde el reducido consumo de memoria del modelo es determinante.
- Generación de datos sintéticos para entrenar ASR en somalí: el modelo puede producir pares texto-audio controlados a partir de corpus escritos, ampliando la cobertura de un idioma con pocos recursos grabados.
- E-learning y cursos narrados: producción automatizada de material formativo en somalí con voces estables y reproducibles, revisable antes de publicarse.
- Sistemas de megafonía y avisos automatizados: anuncios de transporte, aeropuertos o comercios generados bajo demanda y almacenados en caché como ficheros de audio.
- Prototipado rápido de interfaces de voz: integración en un cuaderno de Jupyter o en un script de Python en pocas líneas, útil para validar hipótesis de producto antes de invertir en infraestructura de TTS mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, similitud de hablante, RTF) ni comparaciones con otros sistemas, y el repositorio no adjunta evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos del modelo y las activaciones de inferencia. Los 24,6 M de parámetros ocupan aproximadamente 98 MB en fp32 y 49 MB en fp16, más el vocoder Vocos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente. No se requiere A100, H100 ni GPUs de gama alta; una GTX 1650, RTX 3050 o superior ya resulta sobrada.
- Cabe holgadamente en GPU de consumo: RTX 3060/4060, RTX 4090, e incluso iGPU con memoria compartida. La inferencia en CPU es viable, especialmente con `n_steps` reducido (el autor sugiere menos pasos en CPU).
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, junto con `vocos` y `tokenizers`. No hay soporte documentado para vLLM, llama.cpp ni Ollama, ya que el modelo no es un LLM ni usa el formato GGUF. TGI no está soportado por el mismo motivo.
- Latencia y throughput: no disponibles como cifras medidas. Cualitativamente, el coste depende linealmente del número de pasos del solver ODE (8-16) y del número de llamadas al vocoder; al ser no autorregresivo, no crece con la longitud del audio de forma secuencial.
- Almacenamiento: el repositorio ocupa 1,3 GB, muy por encima de lo que sugieren los 24,6 M de parámetros, lo que indica la presencia de checkpoints adicionales u otros artefactos.

## Comparativa con modelos similares

Los datos de terceros que figuran a continuación son referencias generales ampliamente conocidas y no se han verificado en la informacion proporcionada; los del modelo evaluado proceden de la ficha de Hugging Face.

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jano-TTS (jano3/jano-tts-so) | 24,6 M | Texto sin limite documentado | Somalí (ajuste), inglés en el base | Apache 2.0 | Hugging Face, `custom_code` |
| Kokoro-82M | 82 M | Texto sin limite documentado | Varios (principalmente inglés) | Apache 2.0 | Hugging Face |
| XTTS-v2 (Coqui) | ~470 M | Texto, clonación con muestra de referencia | 17 idiomas | Coqui Public Model License (uso comercial restringido) | Hugging Face |
| Piper (VITS) | Decenas de millones por voz | Texto sin limite documentado | Muchos idiomas, una voz por modelo | MIT | Repositorio del proyecto |

Frente a estas alternativas, la ventaja diferencial de Jano-TTS-so es el soporte nativo de somalí con 128 hablantes, el tamaño más reducido de la comparativa y una licencia Apache 2.0 sin restricciones comerciales. Sus desventajas son la ausencia total de benchmarks publicados, un ecosistema de despliegue mucho menos maduro que el de Piper o XTTS-v2 y la dependencia de `trust_remote_code=True`.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay MOS, WER ni comparativas objetivas; la calidad real de la síntesis no está verificada por terceros.
- Métricas de adopción nulas en el momento de la consulta (0 descargas, 0 *likes*), lo que implica poca validación externa y riesgo de errores no detectados.
- El repositorio pesa 1,3 GB para un modelo de 24,6 M de parámetros, lo que sugiere artefactos adicionales no documentados; conviene revisar su contenido antes de desplegarlo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python incluido en el repositorio del autor. Debe auditarse antes de usarlo en entornos de producción o con datos sensibles.
- Cobertura lingüística restringida al somalí en esta variante. El uso con otros idiomas, incluido el inglés, degradará la pronunciación y la naturalidad; el autor remite al modelo base para inglés.
- Sesgos potenciales: no se documenta el origen de las 128 voces (género, edad, variante dialectal, región), por lo que pueden existir sesgos de representación y limitaciones de cobertura dialectal del somalí.
- Riesgo de errores de pronunciación en nombres propios, siglas, números, préstamos lingüísticos y texto fuera de dominio, así como inestabilidad en la prosodia de frases muy largas.
- Sin clonación de voz: solo se pueden usar las 128 identidades predefinidas, lo que limita los casos que requieran una voz corporativa concreta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías. El autor no ofrece soporte ni compromiso de mantenimiento.
- El vocoder Vocos se distribuye como dependencia externa bajo su propia licencia; conviene verificar sus términos por separado antes de un uso comercial.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta herramientas y no acepta audio como entrada. Cualquier arquitectura de agente que lo use debe construirse por encima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jano3/jano-tts-so
- Repositorio del autor y guía de ajuste fino: https://github.com/laki35/jano-tts/blob/main/README.md
- Vocoder Vocos: https://github.com/gemelo-ai/vocos
- Dataset declarado: https://huggingface.co/datasets/jano3/test
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre el programa de televisión "Schlag den Star"), por lo que no se incluye ningún enlace adicional.
