# HuggingFaceM4/reachy-gestures

## Resumen

Reachy-gestures es un modelo de clasificación de texto de pequeno tamano desarrollado por HuggingFaceM4 para dotar de expresividad gestual al robot Reachy Mini. Su funcion es decidir, para cada frase que el robot pronuncia o escucha, que gesto grabado de su repertorio debe reproducir (o ninguno), de forma que el movimiento se sincronice con el audio sin anadir latencia perceptible a la conversacion.

Tecnicamente es un encoder multilingue MiniLM-L12 (derivado de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) con dos cabezas lineales de clasificacion: una para lo que el robot dice y otra para lo que escucha. Con 117,6 millones de parametros y un fichero ONNX cuantizado en int8 de 118 MB, se ejecuta en la Raspberry Pi CM4 del propio robot en 62-97 ms por frase con un solo hilo.

Su relevancia radica en que resuelve un problema de interaccion humano-robot en el borde (edge): permite que el robot reaccione emocionalmente sin consultar a un LLM ni depender de la nube, cubriendo 22 gestos para el habla y 15 para la escucha, con soporte de mas de 20 idiomas en pruebas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MiniLM-L12 multilingue con dos capas lineales de salida (cabezas `say` y `react`) |
| Parametros totales | 117.653.760 (118M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (se conservan los ultimos 64 de cada turno) |
| Tipos de cuantizacion | int8 (fichero `model_qint8.onnx`, 118 MB); pesos originales en safetensors |
| Idiomas soportados | 15 idiomas de entrenamiento (en, es, fr, de, it, pt, nl, pl, ru, tr, ar, hi, zh, ja, ko), probado en mas de 20 |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8), safetensors, tokenizer.json, gesture_heads.npz, gesture_labels.json |

## Arquitectura y entrenamiento

El modelo parte del encoder multilingue `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` y le anade dos cabezas lineales independientes sobre el embedding de frase. El pipeline de inferencia es: tokenizacion con el tokenizer del modelo base, recorte a los ultimos 64 tokens (manteniendo los tokens especiales de inicio y fin), mean-pooling de los embeddings de token, normalizacion L2 y aplicacion de la cabeza correspondiente (`say` o `react`) con escala 10.0 sobre el embedding antes de la proyeccion lineal. La salida se convierte en probabilidades mediante softmax y se reproduce el gesto ganador solo si su probabilidad es igual o superior a 0.3; en caso contrario, o si el ganador es `none`, no se ejecuta gesto.

El modelo se ha obtenido por destilacion (tag `distillation`), aunque la model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset. La separacion en dos cabezas responde a una decision de diseno explicita: el gesto adecuado depende de quien habla, de modo que ante "mi perro murio ayer" el robot debe mostrar tristeza (`downcast1`) y no celebrar haber comprendido. El repertorio cubre 22 gestos para el habla del robot y 15 para lo que escucha, mas la clase `none`.

## Capacidades

- Clasificacion de texto multilingue en 15 idiomas de entrenamiento y mas de 20 en pruebas reales, incluyendo espanol, frances, aleman, chino, arabe, hindi, japones y coreano.
- Seleccion de gesto para frases pronunciadas por el robot (22 clases: `success1`, `laughing2`, `grateful1`, `welcoming2`, `amazed1`, `downcast1`, `fear1`, `irritated1`, `uncertain1`, entre otras).
- Seleccion de gesto de reaccion para frases escuchadas del interlocutor (15 clases).
- Clase `none` para frases neutras o sin carga emocional, como horarios de tren.
- Umbral de confianza configurable (0.3 por defecto) que evita gestos ante predicciones poco fiables.
- Inferencia en CPU de un solo hilo, apta para hardware embebido.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Interaccion social en robotica de compania: el robot clasifica cada turno escuchado y reproduce un gesto de reaccion (`downcast1`, `grateful1`, `amazed1`) sincronizado con el audio, sin consultar al LLM y sin anadir latencia a la conversacion.
- Narracion expresiva en demos y ferias: para cada frase que el robot pronuncia, el modelo elige entre 22 gestos, lo que permite guiones con enfasis emocional coherente sin animacion manual.
- Atencion al cliente con avatar fisico: en recepciones o puntos de informacion, el robot reacciona a la emocion del visitante (frustracion, agradecimiento) con gestos apropiados, mejorando la percepcion de empatia.
- Educacion y terapia asistida: en sesiones con ninos o personas mayores, la reaccion gestual ante frases de tristeza o alegria refuerza la sensacion de escucha activa del robot.
- Prototipado rapido en el propio robot: al ser un ONNX de 118 MB que corre en la Raspberry Pi CM4 en 62-97 ms, se puede integrar directamente en el bucle de conversacion de Reachy Mini sin infraestructura adicional.
- Investigacion en interaccion humano-robot multilingue: sirve como modulo de referencia para estudiar como la expresividad no verbal afecta a la percepcion del dialogo en mas de 20 idiomas.
- Despliegue en servidores de embeddings: al ser compatible con text-embeddings-inference y endpoints, puede servirse como clasificador ligero en backend para simulaciones o pruebas sin robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta latencias medidas en el hardware objetivo: 62 ms de mediana para turnos escuchados y 97 ms para frases pronunciadas, con un solo hilo en la Raspberry Pi CM4 de Reachy Mini.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el fichero int8 ONNX ocupa 118 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En GPU (A100, H100, RTX 4090) el modelo seria practicamente instantaneo, pero no es su entorno objetivo.
- Cabe en cualquier GPU consumer y en hardware embebido: validado en Raspberry Pi CM4 con un solo hilo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), text-embeddings-inference y endpoints compatibles; los pesos safetensors permiten tambien carga con transformers.
- Latencia y throughput: 62 ms de mediana por turno escuchado y 97 ms por frase pronunciada en CM4 a un hilo; en CPU de escritorio la latencia seria considerablemente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reachy-gestures | 118M | 64 tokens | Clasificacion de gestos para robot | Apache 2.0 | Hugging Face, ONNX int8 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 tokens | Embeddings de frase multilingues | Apache 2.0 | Hugging Face |
| Clasificadores de emocion multilingues basados en BERT/XLM-R | 100M-500M | 128-512 tokens | Clasificacion de emociones en texto | variable | Hugging Face |

La comparacion directa con clasificadores de emocion genericos no es posible sin datos de benchmarks publicados; la ventaja especifica de Reachy-gestures es su integracion con el repertorio gestual concreto de Reachy Mini y su latencia validada en el hardware del robot.

## Limitaciones y advertencias

- Es un clasificador de gestos, no un modelo generativo: no produce texto, no razona y no mantiene contexto mas alla de los ultimos 64 tokens de cada turno.
- Solo cubre el repertorio gestual grabado de Reachy Mini; no es reutilizable directamente para otros robots o animaciones sin reentrenar las cabezas.
- El umbral de 0.3 y la clase `none` implican que frases ambiguas o neutras pueden no recibir gesto, lo que puede percibirse como falta de reaccion.
- Riesgo de clasificacion erronea en frases ironicas, sarcasticas o con emocion mixta, no documentado con metricas de error en la model card.
- Sesgos no documentados: la model card no detalla la composicion del dataset de destilacion ni posibles sesgos culturales o de genero en la asociacion emocion-gesto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del tokenizer y encoder del modelo base, cuya licencia debe verificarse por separado.
- No hay informacion publicada sobre benchmarks de precision, cobertura por idioma ni tasas de acierto; para produccion conviene validar con un conjunto propio de frases.
- El recorte a los ultimos 64 tokens descarta el inicio de turnos largos, lo que puede perder la carga emocional principal de frases extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceM4/reachy-gestures
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio de Reachy Mini: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
