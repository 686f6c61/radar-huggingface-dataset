# chadstthomas/Paraphase-4B

## Resumen

Paraphase-4B es un ajuste fino QLoRA de Qwen/Qwen3.5-4B (4.205.751.296 parámetros) especializado en una única tarea: reescribir borradores de correo electrónico en inglés que suenan a IA para que se lean como escritos por una persona en el trabajo. No es un chatbot ni un modelo de propósito general; el autor lo describe explícitamente como un "reescritor con un solo trabajo", con la restricción de conservar todos los números, nombres, fechas y compromisos del original y de no añadir información nueva. El nombre juega con *paraphrase* + *phrase*.

El modelo lo publica el usuario chadstthomas bajo licencia Apache-2.0, con pesos en GGUF para llama.cpp y adaptadores LoRA en safetensors. Su propuesta de valor es la ejecución 100 % local: sin API ni subida de datos, lo que lo hace atractivo para flujos de correo con requisitos de privacidad. Forma parte de una colección junto a Paraphase-2B y un "Adapter Pack" que incluye el base sin fusionar, el LoRA de reescritura y LoRAs de extracción de entidades.

La relevancia actual viene de su evaluación publicada: en lugar de afirmaciones vagas sobre "humanización", el autor reporta una misión pre-registrada con el detector Pangram (186 sondas, 397 unidades, 15,88 USD) y una segunda pasada sobre el subconjunto realmente marcado. Los resultados son sugerentes pero no concluyentes: 10/13 borradores mejoraron, con un cambio mediano de `fraction_ai` de −0,588 (IC 95 % [−0,794; 0,000], p = 0,039), por debajo del umbral pre-registrado de 11/13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino QLoRA sobre Qwen/Qwen3.5-4B; arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (el ejemplo oficial de despliegue usa `llama-server -c 2048`) |
| Tipos de cuantizacion | GGUF Q8_0 (4,48 GB) y Q4 (variante Q4 concreta no especificada); adaptadores LoRA en safetensors |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) para el modelo fusionado; safetensors para el base y los adaptadores LoRA |

Otros datos: repositorio de 7,3 GB, pipeline `text-generation`, 46 descargas y 0 likes en el momento de la consulta, creado el 22 de octubre de 2026 y actualizado el 24 de octubre de 2026.

## Arquitectura y entrenamiento

Paraphase-4B es un fine-tune QLoRA (cuantizacion de 4 bits durante el entrenamiento + adaptadores de bajo rango) sobre el modelo base Qwen3.5-4B. El autor distribuye el resultado ya fusionado en GGUF para llama.cpp, y por separado un Adapter Pack que contiene el base crudo `qwen3.5-4b-Q8_0.gguf`, el LoRA de reescritura y LoRAs de extracción de entidades entrenados de forma independiente. El pack admite intercambio en caliente de adaptadores en un único `llama-server`: según las mediciones del autor, el cambio por peticion se resuelve en menos de 1 ms y con paridad byte a byte respecto al servicio con un solo adaptador (con la salvedad de `cache_prompt: false`).

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Lo que si se documenta es la evaluacion del LoRA de extraccion sobre un test congelado de 50 correos del corpus AESLC con etiquetas v2 "magnitude-aware": el adaptador eleva el exact match de 0,12 a 0,40, el micro F1 de 0,522 a 0,674 y el F1 de fechas de 0,407 a 0,868. Para la ruta de tool calling se probo tambien un LoRA especifico, que no supero al base y por tanto no se distribuye; la ruta recomendada es el base crudo mas una guarda estrecha, que pasa de 0,70 a 0,75 en un instrumento congelado de 20 items.

Un detalle operativo relevante: el modelo base Qwen3.5 admite modo de razonamiento, y la documentacion indica enviar `"chat_template_kwargs": {"enable_thinking": false}` en la peticion de reescritura. Es decir, el uso previsto es en modo no-thinking.

## Capacidades

- Reescritura de texto en ingles con transferencia de estilo: convierte borradores con registro corporativo rigido ("I hope this email finds you well", "Furthermore, it is important to note that") en correos directos y coloquiales.
- Preservacion de entidades y compromisos: la especificacion de la tarea exige mantener intactos numeros, nombres, fechas y obligaciones, y no introducir contenido nuevo.
- Extraccion de informacion de correos: mediante los LoRAs de extraccion del Adapter Pack (fechas, importes y otros campos), con las metricas AESLC citadas.
- Tool calling: soportado a traves del modelo base mas una guarda, con 0,75 medido en un instrumento de 20 items; no hay LoRA de herramientas propio.
- Servicio multitarea con un solo servidor: intercambio en caliente de adaptadores en menos de 1 ms por peticion.
- Inferencia 100 % local y offline: sin llamadas a API ni envio de datos a terceros.
- Multilinguismo: no. El modelo esta etiquetado exclusivamente para ingles.
- Vision, audio y otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Limpieza de correos internos generados por asistentes: el modelo recibe el borrador y devuelve una version con registro natural conservando fechas y cifras, pensado para plantillas de comunicacion interna recurrente (reubicacion de reuniones, politicas de gastos, recordatorios de firmas).
- Estandarizacion de correos de ventas y seguimiento en un CRM: se puede encadenar la reescritura antes del envio para homogeneizar el tono sin tocar los datos del cliente, con el modelo corriendo en el mismo servidor que el resto del pipeline.
- Extraccion de compromisos y fechas de hilos de correo: usando el LoRA de extraccion del Adapter Pack, el modelo pasa de 0,12 a 0,40 de exact match y de 0,407 a 0,868 de F1 en fechas sobre AESLC, lo que permite alimentar recordatorios y tablas de seguimiento.
- Despliegue en puesto de trabajo con requisitos de confidencialidad: al ser un GGUF de 4,48 GB servido con llama.cpp, cabe en un portatil con GPU consumer y funciona sin conexion, lo que evita enviar correspondencia corporativa a servicios externos.
- Servidor unico multiuso para un equipo pequeno: un solo `llama-server` carga el base y varios LoRAs y conmuta por peticion en menos de 1 ms, con lo que se evita mantener un proceso por tarea.
- Asistente de correo con acciones: la ruta de tool calling (base + guarda, 0,75 en 20 items) permite clasificar o enrutar correos antes de la reescritura, aunque el autor no la recomienda como sustituto de un modelo de proposito general.
- Generacion de variantes para pruebas A/B de tono: al ser determinista en la tarea y conservar entidades, sirve para producir pares before/after controlados en evaluaciones internas de estilo.
- Base para fine-tunes en otros dominios de estilo: el Adapter Pack expone el base sin fusionar y el LoRA de reescritura por separado, lo que facilita reentrenar el estilo manteniendo la infraestructura de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas reportadas son las de la evaluacion propia del autor.

Mision Pangram pre-registrada (186 sondas, 397 unidades, 15,88 USD):

| Metrica | Resultado |
|---|---|
| Originales humanos que pasan | 50/50 |
| Borradores AI marcados (`fraction_ai` >= 0,5) | 13/50 (control debil; el brazo de producto se declara no informativo) |
| Borradores con categoria Pangram distinta de "Human" | 33/50 |

Segunda pasada sobre los 13 borradores marcados y congelados (4B + politica de reintento, 13 sondas, 0,88 USD):

| Metrica | Resultado |
|---|---|
| Borradores que mejoran | 10/13 |
| Cambio mediano de `fraction_ai` | -0,588 (IC 95 % [-0,794; 0,000]) |
| Test de signos exacto | p = 0,039 |
| Cruzan por debajo de 0,5 ("rescatados") | 9/13 |
| Volteos de pasa a falla | 0 |
| Umbral pre-registrado | >= 11/13 (no alcanzado) |

Adaptadores de extraccion (AESLC congelado, 50 correos, etiquetas v2):

| Metrica | Base | Con LoRA de extraccion |
|---|---|---|
| Exact match | 0,12 | 0,40 |
| Micro F1 | 0,522 | 0,674 |
| F1 de fechas | 0,407 | 0,868 |

Ruta de tool calling (instrumento congelado de 20 items):

| Configuracion | Resultado |
|---|---|
| Base crudo | 0,70 |
| Base + guarda | 0,75 |
| LoRA de herramientas | No supera al base; no se distribuye |

## Requisitos de hardware

- VRAM estimada para Q8_0: alrededor de 5-6 GB incluyendo contexto y overhead (el archivo pesa 4,48 GB); cifra estimada por tamano, no medida por el autor.
- VRAM estimada para Q4: alrededor de 3-4 GB (variante Q4 concreta no especificada).
- GPU consumer: si cabe. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 ejecutan la version Q8_0 con holgura; la version Q4 apunta a GPU de 4-6 GB.
- GPU de datacenter: no necesarias. A100 u H100 solo tendrian sentido para servir muchas peticiones concurrentes o para reentrenar adaptadores.
- Despliegue: llama.cpp / `llama-server` es la ruta oficial (el repositorio esta etiquetado con `library_name: llama.cpp`). vLLM, TGI u Ollama no se mencionan en la informacion disponible; Ollama requeriria adaptar el GGUF, sin confirmacion del autor.
- Contexto en produccion: el ejemplo oficial arranca con `-c 2048`, suficiente para correos pero no para hilos largos.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es el tiempo de conmutacion de adaptadores (< 1 ms por peticion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paraphase-4B | 4,2 B | No disponible | Humanizador de correo en ingles; QLoRA sobre Qwen3.5-4B; Q8_0 de 4,48 GB | Apache-2.0 | GGUF + safetensors en HF; demo en ZeroGPU |
| Paraphase-2B | No disponible en la informacion | No disponible | Hermano pequeno del mismo autor; Q8 de 2,68 GB; requiere el wrapper de reintento | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3.5-4B | 4,2 B (base) | No disponible | Modelo base de proposito general con modo thinking, del que deriva este fine-tune | No indicada en la informacion disponible | HF |

En la informacion disponible no aparecen otros "humanizadores" de terceros con datos verificables que permitan una comparacion de rendimiento homogenea, por lo que la comparativa se limita a los modelos anteriores. En la evaluacion Pangram del autor, el 2B mostro una forma similar al 4B (10/13 mejorados, mediana -0,503, 7 rescates) partiendo de una base mas ligera.

## Limitaciones y advertencias

- Solo ingles. Cualquier uso en castellano u otros idiomas queda fuera de la etiqueta `language: en` y no esta evaluado.
- Dominio estrecho: correo electronico. No es un chatbot ni un modelo de proposito general; usarlo fuera de la tarea de reescritura producira resultados no evaluados.
- La evaluacion con detectores no alcanza el umbral pre-registrado (10/13 frente a >= 11/13 exigidos). El propio autor la califica de "sugerente, no confirmada".
- El brazo de control de la mision Pangram fue debil: solo 13 de 50 borradores fueron marcados con `fraction_ai` >= 0,5, por lo que el autor declara ese brazo "no informativo por su propio control". La muestra final es de 13 items, con intervalos de confianza amplios que incluyen el cero en el limite superior.
- Dos borradores empeoraron y uno no se movio en la segunda pasada; el efecto no es uniforme.
- No hay medicion independiente: todos los numeros provienen del autor del modelo, con 46 descargas y 0 likes, sin replicacion externa conocida.
- Riesgo de alucinacion y de deriva factica: aunque la tarea exige preservar numeros, nombres y fechas, no se documenta ninguna metrica de fidelidad sobre el modelo de reescritura (las metricas de exact match y F1 corresponden a los LoRAs de extraccion, no a la reescritura).
- Riesgo de uso para evadir sistemas de deteccion de IA en contextos academicos o laborales; conviene revisar las politicas de la plataforma donde se use y las obligaciones de transparencia aplicables.
- El texto de la model card esta truncado en la informacion proporcionada (corta en la seccion de la "12-item human-source gate"), por lo que pueden existir resultados adicionales no recogidos aqui.
- Licencia Apache-2.0 permite uso comercial, pero no se especifica la licencia del modelo base Qwen3.5-4B en la informacion disponible; conviene verificar sus terminos antes de un despliegue comercial.
- Advertencia operativa del autor: el `paraphase-4b-Q8_0.gguf` de este repositorio es el humanizador fusionado, no el base para adaptadores. Para usar LoRAs hay que emplear el `qwen3.5-4b-Q8_0.gguf` del Adapter Pack. Ademas, el intercambio en caliente exige `cache_prompt: false` para lograr paridad byte a byte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chadstthomas/Paraphase-4B
- Adapter Pack (base crudo, LoRA de reescritura y LoRAs de extraccion): https://huggingface.co/chadstthomas/Paraphase-4B-Adapter-Pack
- Coleccion Paraphase (4B, 2B, adapter pack, demo y explorer): https://huggingface.co/collections/chadstthomas/paraphase-local-email-models-measured-6ada7f54cb27d41ff3ec168b
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/chadstthomas/paraphase-rewriter
- Comparador interactivo before/after: https://huggingface.co/spaces/chadstthomas/paraphase-explorer
- Hermano pequeno, Paraphase-2B: https://huggingface.co/chadstthomas/Paraphase-2B
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha de terceros con metadatos del modelo: https://free2aitools.com/model/chadstthomas/paraphase-4b
