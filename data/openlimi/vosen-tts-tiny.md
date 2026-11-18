# openlimi/Vosen-tts-tiny

## Resumen

Vosen-tts-tiny es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario openlimi y publicado en Hugging Face bajo el identificador `openlimi/Vosen-tts-tiny`. Se trata de un modelo experimental de tan solo 31 millones de parámetros, entrenado desde cero específicamente para el idioma uzbeko (código `uz`), lo que lo convierte en una propuesta orientada a un recurso lingüístico de baja representación. Su arquitectura se describe como una variante especializada de "Phonon" adaptada a los fonemas del uzbeko, y el autor lo enmarca dentro de la familia que denomina Vosen-TTS.

La relevancia del modelo radica en su extrema ligereza: con 31M de parámetros puede ejecutarse con solvencia tanto en CPU como en GPU, lo que facilita su estudio y experimentación en entornos con recursos limitados. No obstante, el propio autor advierte de forma explícita que el modelo no está pensado para producción y que la calidad de síntesis es media, por lo que debe considerarse una pieza de investigación más que un componente listo para desplegar en un producto final.

El repositorio ocupa 16,7 GB, un tamaño desproporcionado para un modelo de 31M de parámetros, lo que sugiere la presencia de artefactos adicionales (checkpoints, datos de audio o pesos en varios formatos) más allá de los pesos principales. La licencia es CreativeML OpenRAIL-M, lo que impone restricciones de uso aceptable y requiere atención a sus cláusulas de atribución y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phonon especializada, adaptada a fonemas del uzbeko (detalles internos no disponibles) |
| Parametros totales | 31 millones |
| Parametros activos | no disponible (no es un modelo MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (segun los tags del repositorio); otros formatos no disponibles |

## Arquitectura y entrenamiento

El autor describe la arquitectura como una "arquitectura Phonon especializada" adaptada a los fonemas del uzbeko. No se proporcionan detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni sobre el decodificador vocacional (vocoder) empleado. Tampoco se especifica si se trata de un transformer puro, de un modelo híbrido o de una arquitectura específica de TTS con encoder de texto y decoder acústico. Toda esta información interna debe considerarse no disponible.

En cuanto al entrenamiento, la model card indica que se realizó un entrenamiento completo desde cero ("Full Train") sobre datos de habla uzbeka. No se detalla el número de horas de audio, la composición del corpus, el número de tokens de texto ni si se aplicaron técnicas de alineamiento forzado, RLHF o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación. La única indicación cualitativa es que la calidad de síntesis es "media" y que el modelo es puramente experimental.

## Capacidades

- Síntesis de voz a partir de texto en uzbeko, con salida de audio.
- Adaptación fonética específica al inventario de fonemas del uzbeko.
- Ejecución ligera en CPU y GPU gracias a sus 31M de parámetros.
- Entrenamiento monolingüe: no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento ("thinking mode"), visión ni audio de entrada.
- No se documentan capacidades multilingües ni de cambio de voz (voice cloning) en la información disponible.

## Casos de uso

- Investigación en síntesis de voz para lenguas de bajos recursos: el modelo sirve como base de experimentación para estudiar arquitecturas TTS aplicadas al uzbeko, dado su tamaño reducido y su entrenamiento desde cero.
- Prototipado académico de sistemas de lectura en voz alta: permite generar audio de prueba en uzbeko para validar pipelines de preprocesado de texto y fonemización antes de invertir en modelos mayores.
- Docencia y formación en procesamiento del habla: su ligereza permite ejecutarlo en equipos de laboratorio o portátiles sin GPU dedicada, facilitando demostraciones en clase.
- Evaluación comparativa de arquitecturas TTS: al ser un modelo de 31M, puede usarse como línea base frente a modelos más grandes en experimentos controlados sobre el mismo corpus uzbeko.
- Generación de datasets sintéticos de audio para aumentar corpus de habla uzbeka en tareas posteriores de ASR, siempre que se validen las muestras por su calidad media.
- Pruebas de integración en pipelines de `transformers`: permite verificar el flujo de carga, tokenización y generación de audio con la librería antes de migrar a modelos de producción.
- Experimentos de accesibilidad en entornos sin conectividad: al caber en hardware modesto, puede desplegarse localmente para pruebas de lectura de texto en uzbeko.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), MCD, WER ni comparaciones con otros sistemas TTS en uzbeko.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 31M de parámetros, los pesos en precisión completa ocuparían del orden de 124 MB (31M × 4 bytes), y en fp16 unos 62 MB, aunque el repositorio de 16,7 GB sugiere artefactos adicionales que pueden requerir más espacio en disco.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) debería poder ejecutarlo, e incluso GPUs integradas.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, aunque no se documenta oficialmente.
- Opciones de despliegue: la librería indicada es `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (estos motores están orientados a modelos de lenguaje y no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vosen-tts-tiny | 31M | uzbeko | no disponible | CreativeML OpenRAIL-M | Hugging Face |
| Alternativas TTS para uzbeko | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de TTS en uzbeko en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no está pensado para producción y que la calidad de síntesis es media; no debe usarse en productos finales sin una evaluación exhaustiva.
- Modelo monolingüe: solo soporta uzbeko, sin capacidades multilingües documentadas.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus uzbeko no especificado podría reflejar sesgos de género, dialectales o de registro presentes en dichos datos.
- Riesgo de alucinación en el sentido de prosodia incorrecta, pronunciación errónea de palabras fuera del vocabulario de entrenamiento o artefactos acústicos, dado el carácter experimental.
- La licencia CreativeML OpenRAIL-M incluye restricciones de uso aceptable y cláusulas de atribución; es necesario revisar sus términos antes de cualquier uso comercial.
- El tamaño del repositorio (16,7 GB) es muy superior al de los pesos del modelo, lo que puede implicar costes de descarga y almacenamiento elevados para un modelo de 31M.
- No hay información sobre el vocoder, el formato de audio de salida (frecuencia de muestreo, códec) ni sobre la longitud máxima de texto procesable.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openlimi/Vosen-tts-tiny
- Licencia CreativeML OpenRAIL-M (referencia enlazada por el autor): https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Idioma uzbeko (referencia enlazada por el autor): https://en.wikipedia.org/wiki/Uzbek_language
