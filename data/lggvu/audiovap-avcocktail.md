# lggvu/audiovap-avcocktail

## Resumen

AudioVAP — AVCocktail es un checkpoint de un modelo de predicción de actividad de voz (Voice Activity Projection, VAP) orientado a la gestión de turnos de palabra (turn-taking) en conversaciones. Lo publica el usuario lggvu en Hugging Face y, según la model card, está entrenado desde cero sobre el corpus AVCocktail. No es un modelo de lenguaje generativo: su función es proyectar el estado futuro de actividad de voz de los interlocutores a partir de audio, lo que lo sitúa en la línea de sistemas de diálogo full-duplex y agentes conversacionales que necesitan decidir cuándo tomar la palabra y cuándo cederla.

La arquitectura se describe como un transformer estéreo y audio-only, es decir, sin entrada visual, pese a que las etiquetas del repositorio incluyen `video`. El checkpoint publicado corresponde a la época 3 con un valor de `val/loss` de 3,7391. El repositorio incluye únicamente dos archivos (`hparams.yaml` y `checkpoint.ckpt`) y no se ha publicado pipeline, idiomas soportados ni licencia.

La relevancia de este artefacto es limitada en su estado actual: cuenta con 0 descargas y 0 likes, la licencia figura como desconocida y no hay resultados de evaluación publicados más allá del valor de pérdida de validación. Debe tratarse, por tanto, como un checkpoint de investigación en fase temprana y no como un componente listo para producción. Su interés radica en el nicho concreto que cubre: la predicción de turnos de palabra a partir de audio estéreo, un problema central para asistentes de voz que pretenden conversar de forma natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estéreo audio-only para Voice Activity Projection (VAP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre señal acústica; no se documenta idioma alguno) |
| Licencia | unknown (desconocida) |
| Formato de pesos | checkpoint de PyTorch Lightning (`.ckpt`) e hiperparámetros en `hparams.yaml`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica que se trata de un transformer estéreo `audio-only` para Voice Activity Projection, entrenado desde cero sobre el corpus AVCocktail. El checkpoint disponible corresponde a la época 3, con un `val/loss` de 3,7391. El fichero `hparams.yaml` del repositorio contendría la configuración concreta (número de capas, dimensión del modelo, tamaño de ventana de predicción, tasa de frames), pero esos valores no se reproducen en la información disponible.

No se documentan datos de entrenamiento más allá del corpus utilizado: ni número de tokens o horas de audio, ni composición del dataset, ni procesos de ajuste posteriores como RLHF o DPO (que, por otra parte, no son habituales en este tipo de modelos discriminativos). La única referencia técnica publicada es el repositorio de código `mm-turn-taking`, del mismo autor, del que procede el pipeline de entrenamiento. Cualquier otra innovación arquitectónica (mecanismos de atención, decodificación, representación de los dos canales de audio) es no disponible.

## Capacidades

La información proporcionada permite atribuir al modelo únicamente las capacidades derivadas de su tarea declarada; el resto de detalles funcionales no están documentados.

- Predicción de actividad de voz futura (Voice Activity Projection) a partir de audio estéreo.
- Predicción de turnos de palabra (turn-taking): estimar si el hablante actual continuará, cederá o si se producirá solapamiento.
- Procesamiento de audio estéreo de dos canales, presumiblemente asociados a dos interlocutores.
- Modelado audio-only: no se documenta ninguna capacidad de visión, pese a la etiqueta `video` del repositorio.
- Generación de texto: no disponible / no aplica (no es un modelo de lenguaje).
- Razonamiento, código y matemáticas: no disponible / no aplica.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no opera sobre texto).
- Modo `thinking`, visión o audio generativo: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un modelo VAP de turn-taking, pero conviene subrayar que ninguno está documentado por el autor para este checkpoint concreto y que su viabilidad práctica depende de una evaluación que no se ha publicado.

- Asistentes de voz full-duplex: el modelo permitiría al asistente decidir en tiempo real si el usuario ha terminado su turno o si va a continuar hablando, evitando interrupciones prematuras. Es el caso de uso canónico de la predicción VAP.
- Detección de solapamiento en conversaciones: útil para sistemas de transcripción que necesitan segmentar correctamente hablantes que se pisan, etiquetando regiones de habla simultánea.
- Análisis de reuniones: marcar quién tiene el turno, cuánto duran las pausas y dónde se producen interrupciones para generar métricas de dinámica conversacional.
- Diálogo con agentes encarnados o robots sociales: un robot que debe respetar los turnos de palabra necesita anticipar el final del turno del humano antes de responder, algo que este tipo de modelo aborda por diseño.
- Moderación de latencia en pipelines de voz: usar la predicción de fin de turno para empezar a preparar la respuesta del sistema antes de que el usuario termine, reduciendo la latencia percibida.
- Investigación en interacción conversacional: servir como componente o línea base para estudiar modelos de turn-taking con audio estéreo, dado que el código de entrenamiento es público.
- Evaluación de datos conversacionales: filtrar o anotar corpus de audio en función de la dinámica de turnos detectada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es el valor de pérdida de validación del checkpoint (época 3, `val/loss` = 3,7391), que no es comparable de forma directa con métricas estándar como MMLU, HumanEval o GSM8K (no aplicables a este modelo) ni con métricas específicas de turn-taking, que no se reportan.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que el checkpoint es de tamaño reducido en comparación con modelos de lenguaje; el requisito de VRAM será bajo, aunque la cifra exacta no está documentada.
- Compatible previsiblemente con GPU de consumo (RTX 3060, RTX 4090 y similares) e incluso con inferencia en CPU, dada la magnitud del repositorio. Se trata de una estimación basada en el tamaño del artefacto, no de un dato publicado.
- GPU de centro de datos (A100, H100) no necesarias para inferencia, salvo que se entrene desde cero.
- Opciones de despliegue: el formato es un checkpoint de PyTorch Lightning (`.ckpt`), por lo que el despliegue requiere cargar los pesos con PyTorch y el código de `mm-turn-taking`. No hay soporte publicado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje generativo y no aplican a este caso.
- Latencia y throughput: no disponibles.
- No se publican requisitos de software, versiones de dependencias ni instrucciones de inferencia más allá del enlace al repositorio de código.

## Comparativa con modelos similares

No disponible. No se han publicado tablas comparativas ni métricas de este checkpoint frente a alternativas. Como contexto, la familia de modelos VAP y los modelos de predicción de turnos basados en texto (por ejemplo, aproximaciones tipo TurnGPT) abordan el mismo problema, pero no se dispone de datos verificables de parámetros, contexto, rendimiento, licencia o disponibilidad para establecer una comparación rigurosa en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AudioVAP — AVCocktail | no disponible | no disponible | val/loss = 3,7391 (época 3) | unknown | Hugging Face (0 descargas) |
| Alternativas de turn-taking | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia desconocida (`unknown`): no hay autorización explícita de uso comercial. Debe asumirse que no se puede utilizar en producción sin aclarar antes los términos con el autor.
- Checkpoint de época 3 con `val/loss` = 3,7391: no se aporta ninguna métrica de calidad orientada a tarea, por lo que se desconoce si el modelo está suficientemente convergido.
- Sin datos de evaluación ni benchmarks: cualquier afirmación sobre su precisión en turn-taking sería especulativa.
- Sesgos conocidos: no disponibles; el autor no documenta la composición del corpus AVCocktail ni posibles sesgos de hablantes, idiomas o acentos.
- Riesgo de errores de predicción en conversaciones con solapamiento, ruido o cambios de hablante no contemplados en el corpus de entrenamiento: plausible, pero no documentado.
- Limitaciones de contexto e idioma: no disponibles. El modelo es audio-only, de modo que la noción de idioma no se declara.
- Repositorio con 0 descargas y 0 likes: sin comunidad que haya validado su funcionamiento ni reportado incidencias.
- Ausencia de pipeline declarado y de formatos estándar (safetensors, GGUF): la integración requiere cargar manualmente el `.ckpt` con PyTorch y depender del repositorio de código del autor, lo que añade riesgo de mantenimiento.
- La etiqueta `video` del repositorio no se corresponde con la descripción de la model card, que indica explícitamente `audio-only`; conviene no asumir capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lggvu/audiovap-avcocktail
- Código fuente del entrenamiento (mm-turn-taking): https://github.com/lggvu/mm-turn-taking
- Paper, blog o demo del modelo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo.
