# moz-v/samsum-pg-checkpoints

## Resumen

`moz-v/samsum-pg-checkpoints` es un repositorio de puntos de control (checkpoints) de un modelo pointer-generator entrenado desde cero sobre el conjunto de datos `knkarthick/samsum`, orientado a la summarizacion de dialogos. Lo publica el usuario moz-v y contiene dos variantes del mismo modelo: una sin mecanismo de cobertura (`pg_nocov.pt`) y otra con cobertura (`pg_cov.pt`), ademas del vocabulario compartido (`vocab.json`). No es un modelo transformer de gran escala, sino una arquitectura secuencia-a-secuencia clasica basada en LSTM con atencion, disenada para un trabajo academico (Task 2).

El modelo resuelve el problema concreto de resumir conversaciones multi-turno (chats) en una o dos frases, usando el mecanismo pointer-generator que permite copiar palabras del texto original y, en la variante con cobertura, penalizar la repeticion. Su relevancia es limitada fuera del ambito docente: el repositorio no incluye el codigo fuente, la licencia restringe el uso a coursework y las metricas reportadas son moderadas (ROUGE-1 en torno a 0,36).

La arquitectura es un encoder BiLSTM de 256 unidades por direccion y un decoder LSTM de 256 unidades con atencion de Bahdanau, embeddings de 128 dimensiones y un vocabulario de 30.586 tokens. El tamano del repositorio es de 0,1 GB y los pesos se distribuyen en formato PyTorch (`.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pointer-generator seq2seq: encoder BiLSTM (256 uds/direccion) + decoder LSTM (256 uds) + atencion de Bahdanau |
| Parametros totales | no disponible (no se indica el recuento; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (el dataset SAMSum es en ingles, pero la model card no lo declara) |
| Licencia | other (uso exclusivo para coursework; el dataset SAMSum es CC-BY-NC-ND-4.0) |
| Formato de pesos | PyTorch `.pt` (diccionario con clave `state_dict`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pointer-generator clasica de See et al.: un encoder BiLSTM con 256 unidades ocultas por direccion procesa el dialogo de entrada, un decoder LSTM de 256 unidades genera el resumen paso a paso con atencion de Bahdanau sobre los estados del encoder, y un mecanismo de puntero permite copiar tokens directamente del texto fuente combinando la distribucion de vocabulario con la distribucion de atencion. Los embeddings de 128 dimensiones se entrenan desde cero, con un vocabulario de 30.586 tokens definido en `vocab.json`.

El entrenamiento se realizo sobre `knkarthick/samsum` con el optimizador Adagrad (learning rate 0,15, acumulador inicial 0,1), recorte de gradiente a 2,0 y busqueda por haz de anchura 4. La variante con cobertura anade una perdida de cobertura con peso 1,0 durante las ultimas 3.000 iteraciones, cuyo objetivo es reducir la repeticion en los resumenes generados. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a esta arquitectura).

## Capacidades

- Generacion de resumenes abstractivos de dialogos multi-turno (conversaciones de chat) en una o dos frases.
- Mecanismo pointer-generator: capacidad de copiar entidades, nombres propios y terminos poco frecuentes directamente del texto de entrada.
- Variante con cobertura que penaliza la repeticion de tokens en la salida.
- Decodificacion mediante busqueda por haz de anchura 4.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo de pensamiento (thinking), vision ni audio.
- No es un modelo de proposito general: esta especializado exclusivamente en summarizacion de dialogos.

## Casos de uso

- Resumen de transcripciones de reuniones: el modelo puede condensar un dialogo multi-turno en una o dos frases, aprovechando el mecanismo de copia para conservar nombres de participantes y decisiones concretas.
- Sintesis de hilos de soporte tecnico: dado un historial de conversacion cliente-agente, genera un resumen breve del problema y la resolucion, util para sistemas de ticketing.
- Generacion de asuntos o preambulos de correo a partir de cadenas de mensajes: el resumen producido puede reutilizarse como linea de asunto o entradilla.
- Investigacion academica sobre summarizacion: sirve como linea base (baseline) pointer-generator para comparar con modelos transformer en el benchmark SAMSum.
- Docencia y practicas de PLN: el repositorio esta pensado explicitamente para coursework, de modo que se puede usar como material de estudio de arquitecturas seq2seq con atencion y cobertura.
- Analisis de repeticion en generacion: la comparacion entre `pg_nocov.pt` y `pg_cov.pt` permite estudiar empiricamente el efecto de la perdida de cobertura sobre la diversidad del resumen.
- Prototipado de resumen de chats en entornos controlados sin requisitos de produccion, dado el bajo peso del repositorio (0,1 GB) y la facilidad de carga en CPU.

## Benchmarks y rendimiento

Metricas de test reportadas por el autor sobre SAMSum (ROUGE sin stemming, misma implementacion que en Task 1):

| Variante | ROUGE-1 | ROUGE-2 | ROUGE-L | Compression | Extractive density |
|---|---:|---:|---:|---:|---:|
| Sin cobertura | 0,3622 | 0,1454 | 0,3056 | 0,2125 | 0,8392 |
| Con cobertura | 0,3661 | 0,1323 | 0,2997 | 0,1995 | 0,8785 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones directas con modelos transformer en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el repositorio completo pesa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1-2 GB de memoria es suficiente (GTX 1050, RTX 2060, RTX 4090, A100, H100 funcionarian sin problema, aunque el modelo no aprovecha su capacidad).
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual e incluso en GPUs integradas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un checkpoint PyTorch de un seq2seq LSTM). El uso previsto es cargar el `state_dict` con PyTorch y ejecutar el codigo de inferencia propio, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | ROUGE en SAMSum | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| moz-v/samsum-pg-checkpoints | Pointer-generator BiLSTM + atencion | no disponible | no disponible | ROUGE-1 0,3661 (con cobertura) | other (solo coursework) | Checkpoints en HF, sin codigo |
| transformersbook/pegasus-samsum | Transformer encoder-decoder (Pegasus fine-tuned) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Modelo completo en HF |
| Comfy-Org/sam3.1 | no disponible (checkpoint fp16) | no disponible | no disponible | no aplica (segmentacion, no summarizacion) | no disponible | Checkpoint en HF |

La comparacion con `transformersbook/pegasus-samsum` es la mas pertinente por tarea (summarizacion de SAMSum), pero no se dispone de sus metricas en la informacion proporcionada. `Comfy-Org/sam3.1` aparece en la busqueda web pero corresponde a un modelo de segmentacion, no comparable en tarea.

## Limitaciones y advertencias

- Licencia restrictiva: los checkpoints se ofrecen exclusivamente para uso en coursework; no se permite uso comercial segun la model card.
- El dataset SAMSum subyacente es CC-BY-NC-ND-4.0, lo que anade restricciones de no uso comercial y no derivados sobre los datos de entrenamiento.
- El codigo fuente de inferencia no se distribuye en el repositorio, por lo que reproducir los resultados requiere reimplementar el pipeline.
- Riesgo de alucinacion: como todo modelo generativo abstractivo, puede introducir informacion no presente en el dialogo original; el mecanismo pointer reduce pero no elimina este riesgo.
- La variante con cobertura mejora ROUGE-1 pero empeora ROUGE-2 y ROUGE-L respecto a la variante sin cobertura, lo que indica un compromiso entre fidelidad y fluidez.
- Densidad extractiva elevada (0,84-0,88), lo que sugiere resumenes muy pegados al texto fuente y poca abstraccion.
- No se declaran idiomas soportados; el entrenamiento se realizo sobre SAMSum, que es en ingles, por lo que el rendimiento en castellano es previsiblemente pobre.
- No hay informacion sobre sesgos, longitud de contexto ni comportamiento en dominios distintos del chat.
- Modelo obsoleto frente a alternativas transformer para la misma tarea; su interes es principalmente docente y como linea base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moz-v/samsum-pg-checkpoints
- Dataset SAMSum (referencia): https://huggingface.co/datasets/knkarthick/samsum
- Modelo comparable Pegasus fine-tuned en SAMSum: https://huggingface.co/transformersbook/pegasus-samsum
- Checkpoint sam3.1 (resultado de busqueda, no relacionado con la tarea): https://huggingface.co/Comfy-Org/sam3.1/blob/main/checkpoints/sam3.1_multiplex_fp16.safetensors
