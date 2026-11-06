# danielrosehill/S1-ASR-Cleanup

## Resumen

S1-ASR-Cleanup es un ajuste fino (fine-tune) del modelo S1-mini de Superwhisper, que a su vez se basa en Qwen3-0.6B. Desarrollado por danielrosehill, el modelo resuelve un problema muy concreto del flujo de trabajo con dictado por voz: los textos en bruto que devuelven los sistemas de reconocimiento de voz (ASR) llegan llenos de disfluencias, falsos arranques, aclaraciones deletreadas, fechas y cantidades en formato verbal, y bloques de texto sin párrafos. Este modelo limpia esas transcripciones aplicando las preferencias de edición de un usuario concreto, de forma determinista y sin intervención manual.

La relevancia del modelo radica en su especialización extrema: en lugar de ser un modelo de propósito general, se ha ajustado para una única tarea (limpieza de transcripciones de dictado) y para un estilo editorial específico. Entre sus mejoras respecto al S1-mini original destacan la división en párrafos cortos, la normalización determinista de fechas y monedas, la expansión de contracciones informales y la eliminación de aclaraciones deletreadas. Tiene aproximadamente 596 millones de parámetros y se distribuye en formato safetensors y GGUF, con el LoRA ya fusionado en los pesos, lo que simplifica el despliegue.

Es un modelo monolingüe en inglés y su licencia es "other" (s1-mini-license), heredada del modelo base, por lo que conviene revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 (~596 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (disponible en safetensors y GGUF) |
| Idiomas soportados | Ingles |
| Licencia | s1-mini-license (other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de S1-mini de Superwhisper, un fine-tune de Qwen3-0.6B, un transformer decoder denso de unos 600 millones de parametros. Sobre esa base, el autor ha entrenado un adaptador LoRA que posteriormente se ha fusionado en los pesos finales, de modo que el resultado es un modelo autonomo sin dependencias adicionales en tiempo de inferencia. La libreria de referencia es transformers y el pipeline asociado es text-generation.

No se han publicado detalles sobre el dataset de entrenamiento (volumen de tokens, composicion o procedencia de los pares transcripcion-cruda/texto-limpio), ni sobre el metodo de ajuste mas alla del uso de LoRA. La model card indica que las evaluaciones se realizaron con decodificacion greedy sobre pares de validacion reservados (held-out), comparando las salidas del modelo con las del S1-mini original con el mismo prompt.

## Capacidades

- Limpieza de transcripciones de dictado por voz (speech-to-text) en ingles.
- Division de dictados largos en parrafos cortos, con una idea por parrafo; saludos y despedidas en lineas propias.
- Normalizacion determinista de fechas: "the twelfth of March" o "March twelfth" se convierten en "March 12"; "Thursday the twelfth of March" en "Thursday, March 12"; "by the fifteenth" en "by the 15th".
- Normalizacion de cantidades de dinero: "two thousand two hundred shekels" se convierte en "2,200 NIS"; "forty bucks" en "$40"; tambien reconoce €35, $2 million y £40 million.
- Expansion de contracciones informales: gonna, wanna, gotta, hafta, lemme, dunno, 'cause, outta, tryna, c'mon, 'em, shoulda, etc., se convierten en sus formas completas; las contracciones ordinarias (I'm, don't) se mantienen.
- Eliminacion de aclaraciones deletreadas: "Ronen, that's R O N E N" se reduce a "Ronen".
- Correccion de mayusculas a mitad de frase introducidas por el reconocedor tras una pausa ("we could Use those" pasa a "we could use those"), preservando las mayusculas reales (nombres, "I", marcas como WhatsApp).
- Resolucion de disfluencias, falsos arranques y autocorrecciones hacia la intencion final del hablante.
- Reunion de frases partidas por pausas y eliminacion de puntos repetidos y comentarios dirigidos a personas presentes en la habitacion.
- Conservacion de palabras hebreas romanizadas y nombres tecnicos.

## Casos de uso

- Limpieza de notas de voz personales: quien dicta notas rapido (listas de compra, recordatorios, ideas) puede pasar la transcripcion cruda por el modelo y obtener un texto legible con parrafos y formatos normalizados sin editar a mano.
- Post-procesado de dictados para asistentes de IA: en el ejemplo de la model card, un dictado destinado a ser prompt de otro modelo (Claude) se limpia y estructura antes de enviarlo, mejorando la calidad de la instruccion final.
- Correo y mensajes a partir de voz: transcribir un correo dictado y obtener directamente saludos y despedidas en lineas separadas, parrafos cortos y fechas y cantidades en formato escrito, listos para enviar.
- Pipelines de transcripcion automatizada: integracion detras de un sistema ASR (por ejemplo superwhisper u otro motor de dictado) como etapa de post-procesado en un flujo batch o en tiempo casi real, dado el tamano reducido del modelo.
- Documentacion de reuniones y notas de trabajo: eliminacion de asides dirigidos a personas en la sala, autocorrecciones y repeticiones, dejando solo el contenido final dictado.
- Gestion de correspondencia con administraciones y negocios: normalizacion de fechas de plazos ("moved it to the twelfth of March" pasa a "March 12") y de importes en distintas monedas (NIS, USD, EUR, GBP), util en contextos administrativos o de facturacion.
- Accesibilidad: personas que dictan por limitaciones fisicas pueden obtener textos limpios y formateados sin depender de edicion manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye ejemplos cualitativos comparativos (salidas de este modelo frente al S1-mini original con el mismo prompt y decodificacion greedy sobre pares held-out), pero sin metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~596 millones de parametros, el modelo en fp16 ocupa en torno a 1,2 GB de pesos; en cuantizacion de 4 bits (via GGUF) ronda los 0,4-0,5 GB. El tamano total del repositorio es de 2,2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; no se requiere hardware de gama alta. Tambien es viable la ejecucion en CPU dado el tamano reducido.
- Consumer GPUs: cabe con holgura en tarjetas como la RTX 3060, RTX 4060 o superiores; incluso portatiles con GPUs modestas pueden ejecutarlo.
- Opciones de despliegue: transformers (libreria nativa), llama.cpp y Ollama (gracias a los pesos GGUF), y text-generation-inference. Al tener el LoRA fusionado, no es necesario cargar adaptadores adicionales.
- Latencia y throughput estimados: no disponibles; por su tamano (~600 M de parametros) se espera inferencia rapida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| S1-ASR-Cleanup | ~596 M | Qwen3-0.6B (via S1-mini) | Limpieza de transcripciones ASR (especializada, estilo personal) | s1-mini-license (other) | safetensors, GGUF |
| S1-mini (superwhisper/s1-mini) | ~596 M | Qwen3-0.6B | Limpieza general de dictado | s1-mini-license (other) | no disponible |
| Qwen3-0.6B | ~600 M | Qwen3 | Generacion de texto de proposito general | Apache 2.0 | safetensors, GGUF |

Frente al S1-mini original, este fine-tune anade comportamiento editorial especifico (parrafado, fechas y monedas deterministas, expansion de contracciones informales, eliminacion de asides) que el modelo base no aplica de forma consistente. Frente al Qwen3-0.6B base, ambos modelos S1 estan especializados en dictado, pero solo este incorpora las reglas de edicion personalizadas. Para tareas distintas de la limpieza de transcripciones en ingles, Qwen3-0.6B es la opcion mas versatil y con la licencia mas permisiva.

## Limitaciones y advertencias

- Monolingue en ingles: la model card declara solo "en"; no hay soporte declarado para castellano ni otros idiomas, y el comportamiento con otros idiomas no esta documentado.
- Estilo editorial personalizado: el modelo reproduce las preferencias de edicion de un usuario concreto (por ejemplo, convertir shekels a NIS, conservar palabras hebreas romanizadas). Otros usuarios pueden preferir convenciones distintas y necesitarian un ajuste adicional.
- Riesgo de alucinacion: al ser un modelo generativo de ~600 M de parametros, puede alterar contenido de la transcripcion original; no hay metricas de fidelidad publicadas, por lo que se recomienda validacion humana en usos criticos.
- Restricciones de licencia: la licencia es "other" (s1-mini-license), no una licencia estandar abierta; debe revisarse el archivo LICENSE para determinar si el uso comercial esta permitido y bajo que condiciones.
- Sin benchmarks publicados: no hay metricas cuantitativas de rendimiento ni de tasa de errores de edicion, lo que dificulta evaluarlo objetivamente antes de probarlo.
- Contexto maximo no documentado: la longitud de contexto no esta especificada en la informacion disponible, lo que puede limitar dictados muy largos en una sola pasada.
- Descargas y adopcion reducidas (325 descargas en el momento de la ficha): comunidad y soporte limitados, con posible presencia de bugs sin reportar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/S1-ASR-Cleanup
- Modelo base (S1-mini de Superwhisper): https://huggingface.co/superwhisper/s1-mini
- Licencia del modelo: https://huggingface.co/danielrosehill/S1-ASR-Cleanup/blob/main/LICENSE
