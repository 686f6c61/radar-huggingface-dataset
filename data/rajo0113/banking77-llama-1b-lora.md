# rajo0113/banking77-llama-1b-lora

## Resumen

banking77-llama-1b-lora es un adaptador LoRA entrenado por el usuario rajo0113 sobre el modelo instructivo unsloth/Llama-3.2-1B-Instruct para una única tarea: clasificar consultas de clientes bancarios en una de las 77 categorías de intención del benchmark Banking77. No es un modelo de propósito general, sino un clasificador de intenciones empaquetado como adaptador PEFT: el repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, que deben cargarse sobre el modelo base.

El problema que resuelve es muy concreto. El modelo base, con el mismo prompt zero-shot, no produjo ni una sola etiqueta correcta (0 de 3.076) porque no estaba alineado con el formato exacto de salida (cadenas en snake_case) ni con las 77 clases del dataset. Tras un ajuste QLoRA con rsLoRA y NEFTune de tres épocas, el adaptador alcanza un 90,21 % de exact match en generación libre y un 90,28 % con decodificación restringida por trie sobre el split de test completo. El entrenamiento completo cabe en una única GPU T4 de la capa gratuita y tarda 25 minutos (1.507 s de `train_runtime`).

Su relevancia es doble. Por un lado, demuestra que un modelo denso de 1.240 millones de parámetros puede resolver una tarea de clasificación de 77 clases con un adaptador del 0,90 % de los parámetros entrenables, sin necesidad de una cabecera de clasificación dedicada. Por otro lado, es un caso práctico de destilación de una tarea de NLP clásica al formato generativo, con la contrapartida de que la latencia y el coste de inferencia son notablemente superiores a los de un encoder tipo DeBERTa con cabecera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2 1B) con adaptador LoRA sobre módulos de atención y MLP |
| Parametros totales | 1.247.086.592 en el modelo base; 11.272.192 parámetros entrenables en el adaptador (0,90 %) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de secuencia máxima en el ajuste; el modelo base Llama 3.2 1B soporta contextos notablemente mayores |
| Tipos de cuantizacion | Base entrenado y evaluado en 4-bit NF4 (bitsandbytes); el adaptador se distribuye en safetensors y es compatible con carga en fp16/bf16, 8-bit y 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft (compatible con transformers, trl, unsloth) |
| Pipeline declarado | text-generation |
| Dataset de ajuste | mteb/banking77 (9.993 filas de entrenamiento, 3.076 de test, 77 clases) |
| Modelo base | unsloth/Llama-3.2-1B-Instruct |
| Descargas / likes | 10 / 0 |
| Fecha de creacion | 2026-03-04 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-1B-Instruct, un transformer decoder-only denso de 1.240 millones de parámetros con tokenizador de vocabulario amplio y plantilla de chat nativa. El ajuste se hizo con QLoRA: el modelo base se cargó en 4-bit NF4 mediante bitsandbytes (el `adapter_config.json` referencia `unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit`), fp16 en la T4 por ausencia de soporte bf16, y se entrenaron adaptadores de rango 16 con alpha 32, dropout 0,05 y rsLoRA activado, que escala el adaptador por `alpha/√rank` (8 en lugar de 2 a rango 16). Los módulos objetivo incluyen las siete proyecciones habituales: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

La configuración de entrenamiento usa optimizador `adamw_8bit`, tasa de aprendizaje 2e-4 con decaimiento coseno y 3 % de warmup, weight decay 0,01, batch efectivo de 16 (8 por dispositivo con acumulación de gradiente 2) y empaquetado de secuencias: las 9.993 filas de entrenamiento se compactan en 1.610 secuencias de 512 tokens, lo que da 303 pasos en tres épocas. Se aplicó NEFTune con alpha 5 como regularización de embeddings. El ciclo completo duró 1.507 s en una T4. La pérdida de evaluación por época fue 0,4100, 0,3817 y 0,3839, y `load_best_model_at_end` sobre `eval_loss` conservó el checkpoint de la época 2. No se separó un conjunto de validación: el propio split de test de Banking77 actuó como conjunto de evaluación del entrenador, lo que constituye una caveat metodológica relevante.

## Capacidades

- Clasificación de intenciones bancarias en 77 clases del benchmark Banking77, devolviendo la etiqueta exacta en formato snake_case (por ejemplo `lost_or_stolen_card`, `change_pin`, `transfer_not_received_by_recipient`).
- Generación de texto restringida a una única respuesta corta de hasta 20 tokens nuevos; no está pensada para generación libre extensa.
- Funcionamiento en modo generativo puro, sin cabecera de clasificación: la salida es texto que se compara por exact match contra la etiqueta de referencia.
- Compatibilidad con decodificación restringida mediante trie a nivel de token sobre las 77 etiquetas válidas, que garantiza que toda salida sea una etiqueta legal.
- Integración con el ecosistema PEFT: el adaptador se puede fusionar con el base mediante `merge_and_unload()` para inferencia más rápida.
- Capacidades multilingües: no disponible; solo se declara inglés y el dataset Banking77 es monolingüe en inglés.
- Soporte de tool calling / function calling: no disponible (no se declara ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un objetivo del ajuste).
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: cada consulta entrante se clasifica en una de las 77 intenciones y se enruta al equipo o al flujo automatizado correspondiente. El modelo está entrenado exactamente para este vocabulario de etiquetas, con un 90,2 % de exact match en el split de test oficial.
- Triaje previo a un chatbot generativo: usar este adaptador como clasificador barato de primera etapa que decide qué flujo conversacional activar, reservando un modelo mayor solo para la respuesta final.
- Etiquetado y anotación de datasets de soporte: clasificar grandes volúmenes de transcripciones de chat o correo históricos para construir analítica de motivos de contacto y detectar tendencias por intención.
- Detección de intenciones críticas: las etiquetas de fraude, tarjeta perdida o robada y disputas de cargos permiten disparar alertas o protocolos específicos en función de la clasificación.
- Evaluación de calidad de asistentes conversacionales: comparar las intenciones predichas sobre consultas reales contra las etiquetadas por humanos para medir la cobertura del asistente en producción.
- Prototipado rápido y experimentación docente: con 0,1 GB de adaptador y una única GPU T4 o una GPU de consumo, sirve como ejemplo reproducible de ajuste QLoRA + rsLoRA + NEFTune sobre un benchmark estándar de NLP.
- Preprocesado en pipelines de analítica de voz del cliente: clasificar consultas ya transcritas antes de agregarlas en cuadros de mando de motivos de contacto, siempre que el idioma sea inglés.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el `model-index` de la model card. Ninguno está marcado como verificado (`verified: false`).

| Configuracion | Accuracy (exact match) | Aciertos / Total |
|---|---|---|
| Modelo base con el mismo prompt, zero-shot | 0,00 % | 0 / 3.076 |
| Adaptador ajustado, generacion libre | 90,21 % | 2.775 / 3.076 |
| Adaptador ajustado, decodificacion restringida con trie | 90,28 % | 2.777 / 3.076 |

Notas metodológicas aportadas por el autor: todas las filas usan decodificación greedy (`do_sample=False`) y exact match sobre el split de test completo de Banking77 (3.076 consultas, 77 clases, aproximadamente 40 por clase) en una única ejecución de tres épocas. Solo las 9.993 filas de entrenamiento se escriben en los datos de entrenamiento, por lo que el modelo no entrena con ninguna fila de test. El modelo evaluado es el checkpoint de la época 2 (el de menor `eval_loss`). Durante el entrenamiento, una comprobación de generación sobre un subconjunto aleatorio fijo de 500 consultas del mismo split dio 80,80 %, 89,00 % y 90,60 % tras las épocas 1, 2 y 3. La decodificación restringida corrigió 2 muestras y no rompió ninguna (+0,07 pp): sustituyó la etiqueta inválida `get_virtual_card` por `get_disposable_virtual_card`, y en el otro caso pasó de `getting_spare_card` a `disposable_card_limits`.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB; los 11.272.192 parámetros entrenables equivalen a unas decenas de megabytes, muy por debajo del peso del modelo base.
- Modelo base Llama-3.2-1B-Instruct en fp16: aproximadamente 2,5 GB de pesos, más overhead de activaciones y caché KV.
- Modelo base en 4-bit NF4 (configuración usada en el ajuste y la evaluación): del orden de 0,8-1 GB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, así como en GPUs de 8 GB con cuantización de 4 bits y secuencias cortas.
- El propio entrenamiento se completó en una única T4 de la capa gratuita en 1.507 s, lo que da una referencia directa del mínimo hardware viable.
- GPUs de datacenter (A100, H100, L40S) no son necesarias para este tamaño, pero permiten mayor throughput si se sirve el clasificador a gran escala.
- Despliegue: al ser un adaptador PEFT cargado sobre un modelo causal estándar, es compatible con transformers + peft, con vLLM y TGI (sirviendo el modelo fusionado o con adaptadores LoRA), y con llama.cpp/Ollama si se convierte el base a GGUF, aunque la ruta de conversión del adaptador a GGUF requiere un paso adicional de fusión y no está documentada en la ficha del autor.
- Latencia y throughput: no disponible. Cabe esperar que sean sensiblemente superiores a los de un encoder de clasificación, ya que cada consulta requiere una generación autoregresiva de hasta 20 tokens en lugar de un único forward pass.

## Comparativa con modelos similares

La información disponible no incluye resultados de terceros medidos en el mismo entorno, por lo que las cifras de rendimiento de las alternativas se marcan como no disponibles. La comparación es estructural y de licencia.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| banking77-llama-1b-lora | 1,24 B (base) + 11,3 M entrenables | 512 tokens en ajuste; el base admite ventanas mayores | Generación autoregresiva con adaptador LoRA; 90,21 % exact match en Banking77 test | llama3.2 | HuggingFace, 0,1 GB, 10 descargas |
| Llama-3.2-1B-Instruct sin ajustar | 1,24 B | Ventana amplia del modelo base | Generación zero-shot con el mismo prompt; 0,00 % en Banking77 test | llama3.2 | HuggingFace (unsloth/Llama-3.2-1B-Instruct) |
| Encoder tipo DeBERTa-v3 con cabecera de clasificación sobre Banking77 | Del orden de cientos de millones | 512 tokens | Clasificación discriminativa con logits por clase | MIT o similar según variante | Disponible en el Hub; rendimiento en Banking77: no disponible en esta información |
| Enfoques SetFit (encoder congelado + cabecera) sobre Banking77 | Depende del encoder | 512 tokens | Clasificación con pocos ejemplos por clase | Depende del encoder | Disponible en el Hub; rendimiento en Banking77: no disponible en esta información |

Ventaja diferencial del adaptador frente a un encoder clásico: no necesita cabecera nueva ni vocabulario de etiquetas fijo en la arquitectura, admite restricciones de decodificación sobre las etiquetas válidas y reutiliza un modelo instructivo que puede compartirse con otras tareas. Desventaja: mayor coste de inferencia y de memoria que un clasificador discriminativo del mismo nivel de precisión.

## Limitaciones y advertencias

- Ámbito restringido: solo clasifica en las 77 intenciones de Banking77. Cualquier consulta fuera de ese vocabulario recibirá igualmente una de las 77 etiquetas, sin opción de "desconocido" ni puntuación de confianza.
- Idioma: únicamente inglés. No hay evidencia de comportamiento en castellano u otros idiomas.
- Riesgo de alucinación de etiquetas: en generación libre el modelo puede producir cadenas que no son etiquetas válidas. El autor documenta al menos un caso (`get_virtual_card`). La decodificación restringida con trie elimina este problema, y se recomienda usarla en producción.
- Sensibilidad al prompt: los resultados se midieron con una instrucción concreta y la plantilla de chat nativa de Llama. Cambiar cualquiera de las dos puede degradar la precisión de forma no cuantificada.
- Sensibilidad a la cuantización: las cifras se midieron con el base cargado en 4-bit NF4 mediante Unsloth. Cargar el base en 16 bits puede alterar algunas predicciones, según advierte el propio autor.
- Caveat metodológico importante: no existe split de validación separado. El split de test de Banking77 se usó como conjunto de evaluación del entrenador y la selección del checkpoint se hizo sobre esa misma `eval_loss` (época 2), lo que introduce fuga de información en el proceso de selección de modelo. La cifra de 90,21 % debe interpretarse con esta reserva.
- Métricas no verificadas: el `model-index` marca ambos resultados con `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Dataset de ajuste pequeño: 9.993 filas empaquetadas en 1.610 secuencias. No hay evidencia de generalización fuera de la distribución de Banking77.
- Licencia Llama 3.2: el uso comercial está sujeto a la Llama 3.2 Community License, con los requisitos habituales de atribución, la cláusula de 700 millones de usuarios mensuales y las restricciones de uso aceptable. El adaptador hereda estas condiciones por derivar del modelo base.
- Adopción muy baja: 10 descargas y 0 likes en la fecha de la consulta, sin issues ni validación por parte de la comunidad.
- No apto como asistente conversacional general: no se ha entrenado para diálogo abierto, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rajo0113/banking77-llama-1b-lora
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Variante base cuantizada referenciada en `adapter_config.json`: https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit
- Dataset Banking77: https://huggingface.co/datasets/mteb/banking77
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por el buscador no guardan relación con el modelo ni con clasificación de intenciones, por lo que se descartan. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
