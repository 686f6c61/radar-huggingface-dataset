# AIcell/guava-v13b-qwen3.5-4b-set-table

## Resumen

guava-v13b-qwen3.5-4b-set-table es un modelo vision-lenguaje-accion (VLA) publicado por AIcell sobre la base Qwen3.5-VL de 4B parametros, especializado en una tarea de manipulacion robotica de colocacion de mesa ("set table"). Se distribuye como exportacion de pesos completos del checkpoint 50 de un entrenamiento por refuerzo, en precision bfloat16 y formato safetensors. Su pipeline declarado en HuggingFace es image-text-to-text, con etiquetas de robotics, vision-language-action y manipulation.

El interes del modelo es acotado pero claro: es un ejemplo de ajuste por RL de un VLM generalista para control de manipulacion, con la particularidad de que su dataset de entrenamiento (un dataset de RL dedicado) no coincide con el dataset supervisado de la familia v13b a la que aparentemente pertenece por nombre. `set_table` no forma parte de las 16 tareas de Guava v13b, de modo que el prefijo del nombre identifica la familia de modelos, no los datos de entrenamiento.

La relevancia es limitada por su propio estado de publicacion: el autor declara explicitamente que no se ha ejecutado ninguna evaluacion, que el checkpoint es temprano (paso 50) y no fue seleccionado contra una metrica de validacion, y que la ruta de carga no esta probada. Es, por tanto, material de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (vision + texto); 32 capas con atencion lineal y atencion completa cada 4 capas; ViT de 24 capas, patch 16, merge 2 |
| Parametros totales | Aproximadamente 4B segun nombre y tamano de pesos; el dato de safetensors indicado en la ficha de HuggingFace (504.320) es inconsistente con los 8,47 GiB de pesos en bfloat16 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion aportada) |
| Longitud de contexto | 262.144 posiciones maximas (max positions) |
| Tipos de cuantizacion | no disponible (publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards, 8,47 GiB; 224 + 499 tensores) |
| Tamano del repositorio | 9,1 GB |
| Tamano oculto | 2560 |
| Vocabulario | 248.320 tokens |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Qwen3.5: un codificador visual ViT de 24 capas con patch de 16 y factor de merge 2, acoplado a un decodificador de texto de 32 capas con tamano oculto 2560. El decodificador combina atencion lineal con atencion completa cada cuatro capas, un patron habitual para reducir el coste de contexto largo; el modelo declara 262.144 posiciones maximas. La configuracion, el tokenizer y la plantilla de chat son identicos en toda la familia guava-v13b, y solo cambian los shards de pesos.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el algoritmo de RL empleado mas alla de la afirmacion de que se uso un dataset de RL dedicado para la tarea `set_table`, distinto del dataset supervisado de v13b. El unico dato de entrenamiento verificable es el numero de paso: 50, un checkpoint temprano. El modelo se publica "tal cual se exporto", sin metadatos de ejecucion, por lo que ni la etiqueta de tarea ni el origen de los datos de RL son verificables a partir de los ficheros.

## Capacidades

- Generacion multimodal imagen-texto: el modelo acepta imagenes y texto como entrada y produce texto, segun el pipeline declarado image-text-to-text.
- Vision-lenguaje-accion para manipulacion: la etiqueta vision-language-action y la descripcion del autor lo orientan a la generacion de acciones de manipulacion robotica en una tarea de colocacion de mesa.
- Aprendizaje por refuerzo: el checkpoint procede de un entrenamiento de RL especifico para `set_table`, no de ajuste supervisado sobre el dataset v13b.
- Comprension visual de escenas de mesa: por la propia tarea, se espera que interprete la posicion de objetos y su disposicion relativa, aunque no hay evaluacion publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo pensamiento, audio, etc.): no disponible.

## Casos de uso

- Investigacion en VLA para manipulacion: usar el modelo como punto de partida reproducible para estudiar como el RL sobre un VLM generalista produce politicas de colocacion de objetos, comparando con el resto de checkpoints de la familia guava-v13b.
- Punto de control intermedio para curvas de aprendizaje: al ser el paso 50 de un entrenamiento por RL, sirve para analizar la evolucion temprana del comportamiento antes de que exista una politica consolidada.
- Educacion y prototipado en robotica: permite montar un entorno de laboratorio que conecte un VLM de 4B a un simulador de manipulacion sin requerir hardware de gran escala, dado que los pesos en bfloat16 ocupan alrededor de 8,5 GiB.
- Evaluacion de la ruta de carga de Qwen3.5: el modelo exige `transformers` 5.8.1 y `model_type: qwen3_5`, por lo que es util para validar la integracion de esa version de la libreria en pipelines propios.
- Experimentos de generalizacion fuera de distribucion: al haber sido entrenado con un dataset de RL distinto al supervisado, permite estudiar como se comporta un modelo de la misma familia cuando la tarea no estaba entre las 16 de v13b.
- Benchmarking de robustez visual en tareas de mesa: evaluar la sensibilidad del modelo a cambios de iluminacion, oclusion o punto de vista en un escenario de colocacion de objetos, aunque sin referencias publicadas contra las que comparar.
- Base para ajuste posterior con datos propios: dado que la licencia no esta declarada, este uso solo es viable si el usuario confirma previamente las condiciones de uso con el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo se publica sin evaluacion: no hay tasas de exito, ni puntuaciones sobre conjuntos de validacion, ni metricas de tarea para `set_table`. Tampoco se aportan datos de MMLU, HumanEval, GSM8K ni de benchmarks de manipulacion.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los pesos ocupan 8,47 GiB; contando cache KV, activaciones y el codificador visual, conviene reservar del orden de 12 a 16 GB para contexto moderado.
- Contexto largo: con 262.144 posiciones maximas, la cache KV crece de forma considerable; usar la ventana completa exige memoria muy superior a la de los pesos y no es viable en GPUs de consumo.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB cubren sin problema los pesos y permiten contexto amplio.
- GPU de consumo: cabe en una RTX 4090 (24 GB) con margen y en una RTX 4080 o 4070 Ti Super (16 GB) de forma ajustada; en GPUs de 8-12 GB requeriria cuantizacion, que el autor no publica.
- Opciones de despliegue: la ruta documentada es `transformers` 5.8.1 con `AutoModelForImageTextToText` y `AutoProcessor`, usando `dtype="bfloat16"` y `device_map="auto"`. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF o AWQ hace que esas rutas no esten disponibles por ahora.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas declaradas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guava-v13b-qwen3.5-4b-set-table | ~4B (nombre y pesos) | 262.144 posiciones | Colocacion de mesa (RL) | no disponible | HuggingFace, safetensors bf16 |
| guava-v13b-qwen3.5-4b | no disponible | 262.144 posiciones (misma config) | 16 tareas de manipulacion (supervisado) | no disponible | HuggingFace, mismo autor |
| guava-v13b-qwen3.5-4b-no-counterfactual | no disponible | 262.144 posiciones (misma config) | Variante de la familia v13b | no disponible | HuggingFace, mismo autor |
| guava-v13b-qwen3.5-4b-red-basket | no disponible | 262.144 posiciones (misma config) | Tarea de cesta roja | no disponible | HuggingFace, mismo autor |

Alternativas de otros autores (OpenVLA, SmolVLA, Qwen2.5-VL en sus variantes de 3B y 7B) no se comparan aqui porque no se ha proporcionado informacion verificable sobre ellas en esta busqueda: datos de parametros, contexto, rendimiento y licencia de esos modelos quedan como no disponibles.

## Limitaciones y advertencias

- Sin evaluacion publicada: no existen tasas de exito ni puntuaciones sobre conjuntos reservados, de modo que cualquier afirmacion de rendimiento carece de respaldo.
- Checkpoint temprano: corresponde al paso 50 y no fue seleccionado contra una metrica de validacion, por lo que es probable que la politica este poco consolidada.
- Metadatos no verificables: el export no incluye informacion de ejecucion; ni la etiqueta de tarea ni el origen de los datos de RL pueden comprobarse desde los ficheros.
- Licencia no declarada: al no indicarse licencia, no hay autorizacion explicita de uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Ruta de carga no probada: requiere `transformers` 5.8.1 y `model_type: qwen3_5`; versiones anteriores de la libreria no podran cargar el modelo.
- Riesgo de confusion con la familia v13b: el prefijo `guava-v13b-` no implica que el modelo haya sido entrenado con el dataset supervisado de v13b; `set_table` no esta entre sus 16 tareas.
- Idiomas no declarados: se desconoce el soporte multilingue y el comportamiento fuera del ingles o del idioma de entrenamiento.
- Contexto largo costoso: aunque se declaran 262.144 posiciones, la memoria necesaria para explotarlas no es asumible en hardware de consumo.
- Ausencia de cuantizaciones: no se publican pesos GGUF, AWQ ni GPTQ, lo que limita el despliegue en GPUs pequenas y en herramientas como llama.cpp u Ollama.
- Riesgo de alucinacion: no hay informacion especifica, pero al ser un VLM sin evaluacion publicada no puede descartarse la generacion de descripciones o acciones inconsistentes con la escena.
- Sesgos: no disponible.
- Fecha de publicacion anomala: los metadatos de HuggingFace indican creacion el 2026-09-15, posterior a la fecha de consulta habitual; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-set-table
- Modelo relacionado guava-v13b-qwen3.5-4b: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b
- Modelo relacionado guava-v13b-qwen3.5-4b-no-counterfactual: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-no-counterfactual
- Modelo relacionado guava-v13b-qwen3.5-4b-red-basket: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-red-basket
- Perfil del autor en HuggingFace: https://huggingface.co/AIcell
- Paper, blog o repositorio adicionales: no disponible en los resultados de busqueda proporcionados (los resultados obtenidos no guardan relacion con el modelo).
