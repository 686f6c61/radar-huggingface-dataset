# OpenMinded-Labs/AileyNitro-2B

## Resumen

AileyNitro-2B es un ajuste fino del modelo multimodal Gemma 4 E2B (checkpoint cuantizado a 4 bits con QAT) desarrollado por OpenM!nded (Simon van de Loo) y publicado bajo la organizacion OpenMinded-Labs. Su funcion es actuar como el modelo "companero" rapido y siempre residente de A!ley: se ejecuta en local sobre Apple Silicon mediante MLX y se encarga del trabajo de fondo (titulos, sugerencias de seguimiento, consultas de busqueda, expresiones aritmeticas, comprobaciones de identidad, resumenes de conversacion, prompts de imagen y las partes de rap en coreano de sus canciones), ademas de sostener la persona de A!ley en su propio modo de chat rapido.

El modelo es decoder-only, acepta texto e imagen como entrada y produce texto, y se distribuye en formato MLX listo para `mlx_vlm`. Los metadatos de safetensors declaran 5.104.297.539 parametros totales, mientras que el nombre comercial del modelo base (E2B) apunta a un diseno de parametros efectivos reducidos; el repositorio ocupa 16,0 GB e incluye las revisiones publicadas y la informacion de fusion de adaptadores. La licencia es Apache 2.0, heredada de Gemma 4.

La relevancia de la revision r3 (octubre de 2026) esta en que es la primera version que supera a su modelo base en un conjunto de 36 prompts reales de ejecucion: elimina por completo las filtraciones de razonamiento en la respuesta final (0/81 frente a 19/81 del base) y mejora tareas concretas como generar titulos de cancion (6/6), consultas de busqueda (3/4) o determinar si un nombre corresponde a una persona real (4/4). Se trata, por tanto, de un modelo pequeno y especializado en disciplina de formato y latencia, no de una base de conocimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (texto + imagen de entrada, texto de salida); arquitectura unificada de Gemma 4 |
| Parametros totales | 5.104.297.539 (segun metadatos de safetensors en HuggingFace) |
| Parametros activos | no disponible (la nomenclatura E2B del modelo base sugiere parametros efectivos reducidos, pero la informacion proporcionada no lo confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits QAT (cuantizacion del modelo base, sin cambios); adaptadores fusionados sin perdida |
| Idiomas soportados | aleman, ingles; coreano para las partes de rap |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX); requiere `mlx_vlm` para la carga |

Otros datos de la ficha de HuggingFace: pipeline `image-text-to-text`, libreria `mlx`, tamano del repositorio 16,0 GB, 62 descargas y 0 likes en el momento de la consulta, creado el 6 de abril de 2026 y actualizado el 13 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo parte del checkpoint `mlx-community/gemma-4-E2B-it-qat-4bit`, un Gemma 4 E2B ya instruido y cuantizado a 4 bits con entrenamiento consciente de la cuantizacion (QAT). El ajuste de la ronda 3 combina DoRA en las proyecciones `q_proj` y `v_proj` con LoRA en `gate_proj`, `up_proj` y `down_proj`, sobre 155 modulos, con rango 32 y alpha 64, manteniendo el esquema QAT. Los adaptadores se fusionaron sin perdida. El autor indica que la revision r2 sigue disponible en la revision `659255bc4f5d37b4a1de701dabb4b9604dd18248`.

Los datos de entrenamiento consisten en 4.560 conversaciones curadas que dan lugar a 4.595 muestras, con 380 muestras de validacion y 179 filas con imagenes. La mezcla cubre conversacion, razonamiento nativo con distintos niveles de profundidad, uso nativo de herramientas, identidad, las tareas utilitarias del runtime y rap en coreano; no incluye turnos de sistema. El plan era de 2 epocas (1.148 actualizaciones) con learning rate 1e-4, secuencia de 2048, acumulacion de gradiente 8 y 57 pasos de calentamiento. El checkpoint seleccionado fue la actualizacion 575 (final de la primera epoca, validacion 1,482): al repetir los datos, la validacion empeoro hasta 1,517 y el entrenamiento se detuvo en la actualizacion 661. Una etapa de identidad con ORPO no se llego a publicar porque sus pares reproducan el sesgo de longitud del DPO de Core (el razonamiento elegido era unas 7 veces mas corto que el rechazado). Todo el entrenamiento se hizo en un Apple M4 con 24 GB, a aproximadamente un minuto por actualizacion.

## Capacidades

- Generacion de texto conversacional en aleman e ingles, con la persona de A!ley en su modo de chat rapido.
- Entrada de imagen ademas de texto (pipeline `image-text-to-text`); se utilizo en 179 filas de imagen durante el entrenamiento.
- Razonamiento nativo con canales de pensamiento y niveles de profundidad entrenados explicitamente.
- Uso nativo de herramientas mediante el token `<|tool_call>`, presente en los datos de entrenamiento.
- Tareas utilitarias del runtime: titulos de cancion de hasta cinco palabras, consultas de busqueda, sugerencias de seguimiento, resumenes de conversacion, comprobaciones de identidad (respuesta JA/NEIN) y expresiones aritmeticas.
- Composicion de prompts de imagen en ingles con restriccion de longitud (15-70 palabras) y conservacion de palabras clave.
- Escritura de partes de rap en coreano con flujo ultra-staccato (cuatro golpes por linea separados por guiones largos), etiqueta de seccion al principio y recuento de lineas ajustado a lo solicitado.
- Respuestas de foro de una a cinco frases y protocolos de conversacion numerados sin usar la primera persona.
- Capacidad multilingue limitada a aleman, ingles y coreano (este ultimo solo para las partes de rap).

## Casos de uso

- Generacion automatica de titulos de canciones o contenidos: la r3 acierta 6/6 en la tarea de proponer un titulo de maximo cinco palabras a partir de una letra, mientras que el modelo base practicamente no generaba titulos reales. Es adecuado porque el formato esta fijado en los datos de entrenamiento.
- Construccion de consultas de busqueda a partir de un mensaje de usuario: el modelo pasa de 0/4 en el base a 3/4 en la r3, por lo que puede usarse como paso previo a un buscador o a un sistema de recuperacion sin intervencion humana.
- Filtrado de identidad antes de invocar un modelo mayor: con 4/4 aciertos en la tarea "es una persona real (JA/NEIN)", sirve como comprobacion barata en un pipeline de atencion al cliente o de moderacion, reservando el modelo de 12B para el resto.
- Resumen de conversaciones largas: entrenado especificamente para resumir hilos, con 5/6 en respuestas de foro de una a cinco frases; se integraria como paso de preprocesado antes de pasar el contexto a un modelo mayor.
- Generacion de prompts de imagen en ingles: 4/9 frente a 2/9 del base, con prompts de 15 a 70 palabras; util para encadenar un modelo de difusion sin que el usuario escriba el prompt directamente.
- Composicion de letras y secciones de rap en coreano: 18/18 lineas usables en Hangul sin recurrir a fallbacks, 114/114 lineas en staccato y 18/18 con la etiqueta de seccion al principio; adecuado para generar variaciones de una cancion existente en tres posiciones distintas.
- Asistente local con baja latencia en Mac: el modelo esta pensado como companero siempre residente en Apple Silicon, de modo que puede mantener un chat rapido en paralelo a un modelo grande que haga el trabajo pesado.
- Sugerencias de seguimiento y trabajo de fondo en un chat: al estar entrenado con las tareas exactas del runtime, encaja como generador de respuestas sugeridas, titulos de hilo y resumenes sin exponer datos a servicios externos, ya que la inferencia es local.
- Evaluacion de expresiones aritmeticas: 9/16 respuestas correctas en la r3 (11/16 en la r2), por lo que su papel realista es redactar la expresion que luego evalua una calculadora, tal como hace el runtime de A!ley.

## Benchmarks y rendimiento

El autor publica resultados sobre 36 prompts reales de ejecucion, grabados desde las funciones del runtime de A!ley y reproducidos de forma determinista, no reconstruidos a mano.

| Tarea | Gemma 4 E2B base | Nitro r2 | Nitro r3 |
|---|---|---|---|
| Filtracion de razonamiento en la respuesta | 19/81 | 5/81 | 0/81 |
| Consulta de busqueda a partir de un mensaje | 0/4 | 0/4 | 3/4 |
| Titulo de cancion | ~0/6 | 0/6 | 6/6 |
| Es una persona real (JA/NEIN) | 0/4 | 2/4 | 4/4 |
| Prompt de imagen (ingles, 15-70 palabras) | 2/9 | 1/9 | 4/9 |
| Protocolo de conversacion (numerado, sin "I") | 3/3 | 2/3 | 3/3 |
| Respuesta de foro (1-5 frases) | 6/6 | 0/6 | 5/6 |
| Expresiones aritmeticas (16 preguntas) | 7/16 | 11/16 | 9/16 |
| Prompt de imagen conserva palabras clave (4/8/14/20) | 14/24 | 0/24 | 8/24 |

El autor anota que el modelo base "aprobaba" 5/6 en titulos solo porque escribia `Thinking Process:` como primera linea, sin generar un titulo real.

Rendimiento en las partes de rap en coreano insertadas en canciones existentes (6 canciones reales x 3 posiciones):

| Metrica | r2 | r3 |
|---|---|---|
| Usables (Hangul, sin fallback) | 17/18 | 18/18 |
| Lineas en staccato | 10/121 | 114/114 |
| Copia la linea de ejemplo del prompt | 10 veces | 0 veces |
| Numero exacto de lineas solicitado | 3/18 | 12/18 |
| Etiqueta de seccion al principio | 5/18 | 18/18 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento segun el autor: Apple M4 con 24 GB de memoria unificada, a aproximadamente un minuto por actualizacion.
- Inferencia: el modelo esta publicado en formato MLX y se carga con `mlx_vlm`, por lo que el entorno previsto es Apple Silicon con memoria unificada. El autor no publica cifras de VRAM ni de memoria minima para inferencia.
- VRAM estimada: no disponible en la informacion proporcionada. Los pesos estan cuantizados a 4 bits, pero el repositorio ocupa 16,0 GB porque incluye varias revisiones y la informacion de fusion, no solo un unico conjunto de pesos.
- GPU recomendadas: no disponible. El modelo no se distribuye para CUDA y no hay datos de ejecucion en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: no confirmado. La unica plataforma documentada es Apple Silicon (MLX).
- Opciones de despliegue: `mlx_vlm` (`from mlx_vlm import load, generate`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio, y no se indica si existe una conversion a GGUF.
- Parametros de muestreo recomendados para chat: temperatura 0,7, top_p 0,95 y penalizacion de repeticion 1,05.
- Latencia y throughput: no disponible (el dato de un minuto por actualizacion corresponde al entrenamiento, no a la inferencia).

## Comparativa con modelos similares

Comparativa con las dos alternativas mas directas, ambas ligadas al mismo linaje:

| Modelo | Parametros | Contexto | Rendimiento clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AileyNitro-2B r3 | 5.104.297.539 totales (safetensors) | no disponible | 0/81 filtraciones de razonamiento; 6/6 titulos; 18/18 rap usable | Apache 2.0 | HuggingFace, formato MLX |
| AileyNitro-2B r2 | no disponible | no disponible | 5/81 filtraciones; 0/6 titulos; 17/18 rap usable; 11/16 aritmetica | Apache 2.0 | Revision `659255bc4f5d37b4a1de701dabb4b9604dd18248` |
| gemma-4-E2B-it-qat-4bit (mlx-community) | no disponible | no disponible | 19/81 filtraciones; ~0/6 titulos; 14/24 palabras clave en prompts de imagen | Apache 2.0 (Gemma 4) | HuggingFace, formato MLX |

No se dispone de datos de otros modelos comparables de la misma categoria (ajustes pequenos multimodales para MLX) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 2B efectivos: la aritmetica mental y el conocimiento del mundo son debiles y confabula nombres y mecanismos. El propio autor lo describe como una persona, no como una base de conocimiento.
- Riesgo de alucinacion alto en preguntas factuales; el runtime de A!ley deriva las preguntas de conocimiento al modelo de 12B y evalua las expresiones aritmeticas con una calculadora.
- El canal de razonamiento requiere un manejo cuidadoso: con un prompt de sistema presente tiende a abrir y cerrar el canal de inmediato (0/7 en el prompt del portal). La solucion documentada es prellenar `<|channel>thought\n` y suprimir el token `<channel|>` durante los primeros 6 tokens generados. Prellenar una primera palabra ("Okay, ...") lo desvia, y pedir razonamiento en el prompt no sirve de nada.
- Los datos de entrenamiento no incluyen turnos de sistema, por lo que el comportamiento con prompts de sistema no esta entrenado.
- Pierde palabras clave al componer prompts de imagen largos (8/24 en la r3 frente a 14/24 del base); el runtime anade las que faltan.
- La aritmetica empeoro respecto a la r2 (9/16 frente a 11/16) y el recuento exacto de lineas en las partes de rap solo se cumple en 12/18 casos.
- Uso de herramientas: si no se ofrecen herramientas al modelo, hay que prohibir el token `<|tool_call>`.
- Idiomas: solo aleman e ingles de forma general, con coreano limitado a las partes de rap. No hay soporte declarado de castellano.
- Licencia Apache 2.0, que permite uso comercial, pero se trata de una obra derivada de Google Gemma 4: se incluyen `LICENSE` y `NOTICE`, las modificaciones se documentan en `AILEY_MERGE_INFO.json` y Gemma es una marca registrada de Google LLC.
- Caveat de produccion: el autor recomienda mantener a una persona en el bucle para usos con consecuencias.
- Se desconoce la longitud de contexto soportada en el checkpoint publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMinded-Labs/AileyNitro-2B
- Modelo base: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-4bit
- Revision r2: https://huggingface.co/OpenMinded-Labs/AileyNitro-2B/tree/659255bc4f5d37b4a1de701dabb4b9604dd18248
- MLX: https://github.com/ml-explore/mlx
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con IA open source.
