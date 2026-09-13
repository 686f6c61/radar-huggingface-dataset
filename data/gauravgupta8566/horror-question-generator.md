# Gauravgupta8566/horror-question-generator

## Resumen

Horror Question Generator es un ajuste fino del modelo FLAN-T5-small publicado por el usuario Gauravgupta8566 en HuggingFace. Su única función declarada es generar, en lenguaje natural, una pregunta de programación en Python a partir de un contexto estructurado que incluye el tema de programación, la dificultad, los objetos detectados por el juego, la distancia al cazador, la etapa de reparación del generador y un fragmento de código Python. Es, por tanto, un componente muy especializado dentro de un juego de terror con IA, no un modelo de propósito general.

El modelo tiene 76.961.152 parámetros y un repositorio de solo 0,3 GB, lo que lo sitúa en la gama de los modelos encoder-decoder pequeños: puede ejecutarse en CPU o en cualquier GPU de consumo sin requisitos apreciables de memoria. La model card no documenta el dataset de ajuste, el número de pasos de entrenamiento, la licencia ni los idiomas soportados, y el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto sin validación externa ni tracción comunitaria.

Su relevancia es limitada y acotada: sirve como ejemplo de ajuste fino de un T5 pequeño para una tarea condicionada por estado (game state conditioning) y como pieza reutilizable para quien quiera replicar el patrón en otros juegos o dominios educativos. No compite con modelos generalistas y no debería evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5), base FLAN-T5-small |
| Parametros totales | 76.961.152 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (arquitectura base FLAN-T5-small; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precision original; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; los ejemplos y la tarea estan en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,3 GB |
| Tokenizador | no disponible en la model card (el modelo base usa SentencePiece con vocabulario de 32.128 tokens) |
| Pipeline declarado | text2text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 12 de septiembre de 2026 |
| Ultima actualizacion (metadatos) | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de FLAN-T5-small: un transformer encoder-decoder con atención completa, aproximadamente 77 millones de parámetros, pensado originalmente para tareas de text-to-text. El modelo recibe una entrada serializada en texto (tema, dificultad, objetos detectados, distancia al cazador, etapa de reparación del generador y código Python) y produce una única pregunta en lenguaje natural. El ejemplo de la model card ilustra el formato: con el tema `array_indexing`, dificultad `hard` y el código `arr = [4, 2, 5, 7]; result = arr[2]`, la salida es "What value will `arr[2]` return?".

No hay información pública sobre el procedimiento de ajuste: se desconoce el volumen de datos, su composición, si hubo anotación humana, si se aplicaron técnicas de RLHF o DPO, y si el entrenamiento partió directamente de `google/flan-t5-small` o de otro checkpoint. Tampoco se documentan hiperparámetros, número de épocas ni métricas de validación. No se declara ninguna innovación técnica (no hay decodificación especulativa, atención lineal ni mecanismos híbridos): es un ajuste fino supervisado convencional sobre un T5 pequeño.

## Capacidades

- Generación de preguntas de programación en Python: produce una pregunta concisa en lenguaje natural a partir de un tema y un fragmento de código.
- Condicionamiento por estado del juego: la entrada admite variables de contexto como objetos detectados, distancia al cazador y etapa de reparación del generador, lo que permite variar la pregunta según la situación de la partida.
- Ajuste por dificultad: el campo `difficulty` de la entrada permite solicitar preguntas de distinto nivel (el ejemplo documentado usa `hard`).
- Generación de una sola pregunta por invocación: la salida es un único enunciado, no una lista ni una conversación.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingües; la tarea está formulada en inglés.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- No hay evidencia de capacidad de razonamiento general, matemáticas o generación de código más allá de la pregunta formulada.

## Casos de uso

- Generación dinámica de acertijos en un juego de terror: integrado en el bucle de juego, el modelo recibe el estado actual (objetos detectados, distancia al cazador, etapa del generador) y devuelve una pregunta de Python que el jugador debe resolver para progresar; el condicionamiento por estado permite que la dificultad percibida suba cuando el cazador está cerca.
- Prototipado rápido en game jams: con 77 millones de parámetros y 0,3 GB de pesos, el modelo se carga y ejecuta en un portátil sin GPU, lo que permite tener un generador de preguntas funcional en horas en lugar de semanas.
- Generación de ejercicios para plataformas de e-learning: enviando tema, dificultad y un fragmento de código de referencia, se obtienen enunciados de práctica de Python que pueden volcarse a un banco de ejercicios; el formato de entrada es determinista y fácil de automatizar.
- Aumentación de datos para evaluadores automáticos: las preguntas generadas pueden servir como semilla para construir datasets de pares (código, pregunta) que después se usen para entrenar o validar sistemas de corrección automática.
- Demostraciones offline o en ferias: al no requerir GPU ni conectividad, el modelo puede embeberse en una demo local que genere preguntas en tiempo real sin depender de APIs externas.
- Prueba de pipelines de text2text-generation: el repositorio está etiquetado como compatible con Text Generation Inference y Endpoints, por lo que sirve para validar un despliegue de extremo a extremo con un modelo diminuto antes de escalar a uno mayor.
- Investigación sobre ajuste fino de T5 pequeños: como caso de estudio de condicionamiento por múltiples campos de entrada estructurados, es útil para comparar estrategias de serialización de la entrada y de formateo de la salida.
- Ajuste adaptativo de dificultad: variando el campo `difficulty` y los parámetros de estado, un sistema de juego puede calibrar la curva de dificultad en función del rendimiento del jugador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (ni ROUGE, ni BLEU, ni exact match, ni evaluaciones humanas) y las búsquedas web realizadas no han devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,31 GB en FP32 (77 M parámetros × 4 bytes), unos 0,15 GB en FP16/BF16 y unos 0,08 GB en int8. Hay que sumar el espacio de activaciones y la caché de atención, marginal en un modelo de 512 tokens de contexto.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM libre; no se necesita A100, H100 ni RTX 4090. Una GTX 1050 Ti, una GTX 1650 o una RTX 3060 son más que suficientes, y una RTX 4090 quedaría enormemente infrautilizada.
- Ejecución en CPU: totalmente viable para inferencia interactiva, dado el tamaño del modelo; es la opción natural para una demo integrada en un juego de escritorio.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`) y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). No se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriría una conversión manual no documentada. Compatibilidad con vLLM no confirmada.
- Latencia y throughput: no disponible. No hay cifras publicadas de latencia por token ni de throughput en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gauravgupta8566/horror-question-generator | 76,96 M | 512 tokens (base) | no disponible | safetensors | HuggingFace, 0 descargas |
| google/flan-t5-small (modelo base) | 76,96 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | HuggingFace, muy extendido |
| google/flan-t5-base | 247,6 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | HuggingFace, muy extendido |
| google/t5-small | 60,5 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | HuggingFace, muy extendido |

La comparación de rendimiento frente a estos modelos no es posible con la información disponible: no hay benchmarks publicados para el ajuste fino, y las tareas no son equivalentes (los modelos base no están especializados en generación de preguntas de programación condicionadas por estado de juego).

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, no se puede asumir permiso de uso comercial. Hay que contactar con el autor antes de cualquier despliegue en producción, y tener en cuenta que el modelo base FLAN-T5-small se distribuye bajo Apache 2.0.
- Sin tracción ni validación externa: 0 descargas y 0 likes implican que no hay evidencia de terceros sobre su calidad, y no existe ningún informe de evaluación independiente.
- Riesgo de alucinación: al ser un T5 pequeño ajustado, es probable que genere preguntas con supuestos incorrectos sobre el código de entrada, especialmente si el fragmento no se corresponde con el tema declarado.
- Vocabulario y cobertura limitados: un modelo de 77 M de parámetros tiene poca capacidad de generalización fuera de la distribución de su dataset de ajuste, que además es desconocido.
- Contexto máximo corto: 512 tokens (heredado de FLAN-T5-small) restringen el tamaño del código y del estado del juego que se puede pasar en la entrada; fragmentos largos se truncarán.
- Idioma: no se declara soporte multilingüe. La tarea y los ejemplos están en inglés, por lo que se debe asumir salida en inglés salvo verificación empírica con entradas en castellano.
- Formato de salida no garantizado: la model card indica "una pregunta concisa", pero no hay especificación de esquema, por lo que un pipeline de producción necesitaría validación y filtrado posteriores.
- Dependencia de campos de entrada específicos: el rendimiento puede degradarse si se omiten campos como "objetos detectados" o "distancia al cazador", ya que el modelo fue ajustado con esa plantilla concreta.
- Sin datos de entrenamiento ni de sesgos: al no documentarse el dataset, no es posible evaluar sesgos ni cobertura temática.
- Las búsquedas web no han devuelto ninguna referencia técnica, paper ni repositorio asociado al modelo, lo que refuerza la falta de documentación.

## Enlaces

- HuggingFace: https://huggingface.co/Gauravgupta8566/horror-question-generator
- Modelo base de referencia: https://huggingface.co/google/flan-t5-small
- No se han encontrado papers, blogs, repositorios ni demos asociados en la busqueda web disponible.
