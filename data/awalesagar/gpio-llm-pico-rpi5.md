# AwaleSagar/gpio-llm-pico-rpi5

## Resumen

gpio-llm-pico-rpi5 es un modelo de lenguaje de 2.741.888 parametros, entrenado desde cero por AwaleSagar, que traduce una peticion en ingles sobre los pines GPIO de una Raspberry Pi 5 en una unica accion JSON ejecutable. Su funcion es acotada y deliberadamente estrecha: convertir frases como "turn on the LED on GPIO 17" en `{"action":"gpio_write","pin":17,"value":"HIGH"}`, sin generar texto libre. Es la variante mas pequena de la familia GPIO-LLM, por delante de gpio-llm-nano-rpi5 y gpio-llm-base-rpi5, y esta pensada para ejecutarse en el propio dispositivo.

Tecnicamente es un `LlamaForCausalLM` denso de 6 capas, `d_model` 128, 4 cabezas de atencion (head_dim 32), FFN SwiGLU de 352 y embeddings atados, con un vocabulario de 12.000 tokens (BPE a nivel de byte) y una ventana de contexto de solo 256 tokens. Se distribuye en fp32 (`model.safetensors`) y en int8 Q8_0 (`pico.gllm`) para un motor de inferencia en C que no requiere Python ni framework de ML.

Su relevancia esta en el nicho: demuestra que un modelo de menos de 3 millones de parametros puede resolver una tarea de traduccion de lenguaje natural a accion estructurada con un 91,88 % de coincidencia exacta en un conjunto de evaluacion de 26.297 filas con plantillas nunca vistas en entrenamiento. El autor advierte explicitamente de que el modelo no es una capa de seguridad: un validador deterministico debe comprobar cada accion contra las reglas de la placa antes de tocar un pin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` denso: 6 capas, `d_model` 128, 4 cabezas (head_dim 32), FFN SwiGLU 352, RoPE θ = 10000, RMSNorm ε = 1e-05, embeddings atados |
| Parametros totales | 2.741.888 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (safetensors) e int8 Q8_0 con grupos de 32 (formato `.gllm` para el motor en C) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `model.safetensors` (fp32) y `pico.gllm` (int8 Q8_0) |
| Vocabulario | 12.000 tokens, BPE a nivel de byte (`gpio_llm_bpe_12k`, en el repo de datos) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo Llama a escala minima: 6 capas con atencion multi-cabeza de 4 cabezas, normalizacion RMSNorm, activacion SwiGLU y embeddings de entrada/salida atados. Usa RoPE con theta 10000. Con 2,74 M de parametros y una ventana de 256 tokens, el modelo no aspira a comprension general del lenguaje, sino a mapear un espacio muy reducido de plantillas en ingles a un conjunto cerrado de formas JSON.

El entrenamiento tuvo dos fases, ambas en una unica RTX 4090 alquilada (24 GB), con PyTorch 2.11, CUDA 12.8 y transformers 5.17. La fase de preentrenamiento uso 550 millones de tokens de fineweb-edu-dedup (corpus SmolLM) durante 1 epoca: 8.392 pasos de 65.536 tokens, learning rate 0,003 con decaimiento coseno y bf16, alcanzando una perdida de validacion de 3,8392 (perplejidad 46,5) sobre 0,5 M de tokens reservados; duro 9,6 minutos. El learning rate se eligio con un barrido sobre la forma nano a 55 M de tokens (0,001 → 4,5915; 0,002 → 4,2903; 0,003 → 4,1836; 0,005 → 4,1985). La fase de SFT uso las 1.678.821 filas de entrenamiento de la configuracion v2 durante 2 epocas, con la perdida calculada solo sobre los tokens de respuesta y una repeticion de 4×256 tokens en ingles cada 12 pasos (aproximadamente el 1,1 % de los tokens de perdida) para mitigar el olvido catastrofico: 13.116 pasos de 256 filas con learning rate 0,002 coseno, hasta una perdida de 0,0216 sobre los tokens de respuesta de `eval_core`; duro 8,5 minutos. No se menciona RLHF ni DPO.

## Capacidades

- Traduccion de una peticion en ingles sobre GPIO a una unica accion JSON canonica (`gpio_write` y las demas formas presentes en el dataset).
- Decodificacion restringida por gramatica: el motor en C construye la gramatica a partir de las etiquetas de entrenamiento, por lo que la salida pertenece siempre a una de las formas JSON del dataset.
- Soporte de una linea de contexto opcional antes de la peticion, por ejemplo `Context: {"device_mappings":{"fan":23}}` o `Context: {"available_pins":[16,17,18,25]}`, que permite resolver alias de dispositivos y pines disponibles.
- Conversaciones multi-turno de aclaracion: el modelo puede emitir una pregunta y consumir la respuesta del usuario siguiendo el formato `...\nAssistant: <question>\nUser: <answer>\nAssistant:`.
- Salidas de rechazo o de aclaracion para peticiones que no corresponden a una accion ejecutable (con las salvedades de la seccion de limitaciones).
- No dispone de tool calling generico, ni de capacidades de agente, vision, audio, matematicas o codigo mas alla del formato JSON entrenado.
- Multilingue: no disponible; el modelo esta entrenado y evaluado unicamente en ingles.

## Casos de uso

- Control local de pines en Raspberry Pi 5 sin Python: el motor en C con pesos int8 (`pico.gllm`) permite ejecutar la inferencia en el propio dispositivo, sin framework de ML, invocando `build/gpiollm -m pico.gllm -t gpio_llm_bpe_12k.gltk -g grammar_v2.txt "turn on the LED on GPIO 17"`.
- Automatizacion domotica por lenguaje natural: un asistente de voz o chat local traduce "switch the fan off" a la accion JSON correspondiente, usando la linea de contexto para resolver el mapeo `{"device_mappings":{"fan":23}}` y evitando que el usuario tenga que recordar numeros de pin.
- Pasarela entre lenguaje natural y logica de control existente: la accion JSON se entrega a un validador deterministico y despues a la capa que escribe en GPIO, de modo que el modelo solo cubre la parte de interpretacion.
- Ensenanza de sistemas embebidos e IA en el borde: con 2,74 M de parametros y un pipeline de entrenamiento documentado (scripts en GitHub y registros en `training/`), sirve como caso practico completo de preentrenamiento, SFT y despliegue en C sobre hardware de 8 GB.
- Prototipado rapido de interfaces de voz o texto para placas: la ventana de contexto de 256 tokens es suficiente para una peticion mas una linea de contexto y una respuesta corta, que es exactamente el patron de uso previsto.
- Filtrado previo en pipelines de automatizacion: dado su tamano, puede actuar como primer clasificador que convierte lenguaje natural en una accion estructurada y deja el trabajo pesado a un modelo mayor cuando la validacion falla.
- Aplicaciones de bajo consumo y sin conectividad: al no requerir Python ni GPU, encaja en despliegues donde no hay acceso a red ni recursos para servir un modelo de mayor tamano.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La coincidencia exacta compara el JSON canonico (mismo objeto, sin importar el orden de las claves) con la etiqueta. `eval` contiene 26.297 filas generadas con 132 plantillas de fraseo que nunca aparecen en entrenamiento; `eval_core` es un subconjunto estratificado de 5.083 filas.

| Configuracion | Split | Exact match | JSON valido | Ejecucion insegura* |
|---|---|---|---|---|
| PyTorch fp32, greedy | eval | 91,88 % | 99,96 % | 3,51 % |
| PyTorch fp32, greedy | eval_core | 90,64 % | 99,96 % | 3,52 % |
| Motor C int8, sin gramatica | eval_core | 90,67 % | 99,94 % | 3,41 % |
| Motor C int8, con gramatica | eval_core | 90,69 % | 100,00 % | 3,41 % |

\* Proporcion de las filas de rechazo o aclaracion (1.845 en `eval_core`) en las que el modelo produjo una accion ejecutable en su lugar. Medida antes de aplicar cualquier validador.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la informacion disponible. Los datos de latencia del motor en C sobre las 5.083 peticiones de `eval_core` aparecen truncados en la model card (se menciona el uso de 4 hilos, sin cifra final), por lo que no se puede reproducir el numero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 MB en fp32 (2.741.888 parametros × 4 bytes) y unos 2,7 MB en int8 Q8_0, sin contar el tokenizador ni el buffer de la gramatica.
- GPU recomendadas: cualquier GPU es suficiente; el entrenamiento se hizo en una unica RTX 4090 de 24 GB, pero la inferencia no necesita esa clase de hardware.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en aceleradores integrados. El caso de uso objetivo es directamente la CPU de una Raspberry Pi 5, con el motor en C.
- Opciones de despliegue: motor propio en C incluido en el repositorio GitHub (int8, con decodificacion restringida por gramatica y sin Python), y `transformers` con `AutoModelForCausalLM` en fp32 para pruebas. La model card etiqueta el modelo como compatible con text-generation-inference y endpoints, pero no se documenta una configuracion especifica para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la model card incluye una medicion de latencia del motor en C sobre `eval_core` que aparece cortada en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpio-llm-pico-rpi5 | 2.741.888 | 256 tokens | Peticion GPIO en ingles → accion JSON | cc-by-4.0 | HuggingFace, pesos fp32 e int8 |
| gpio-llm-nano-rpi5 | no disponible | no disponible | Peticion GPIO en ingles → accion JSON | no disponible | HuggingFace |
| gpio-llm-base-rpi5 | no disponible | no disponible | Peticion GPIO en ingles → accion JSON | no disponible | HuggingFace |

Las otras dos variantes de la familia se citan en la model card, que las describe como los otros dos tamanos, pero no se proporcionan sus parametros, contexto, licencia ni resultados. No se dispone de datos de modelos comparables de otros autores para esta tarea especifica en la informacion proporcionada. Como referencia de orden de magnitud, el preentrenamiento uso el corpus SmolLM (fineweb-edu-dedup), el mismo tipo de datos empleado por la familia SmolLM de HuggingFace, pero no hay una comparacion de rendimiento publicada.

## Limitaciones y advertencias

- El modelo no es una capa de seguridad. El propio autor indica que un validador deterministico debe comprobar cada accion contra las reglas de la placa antes de escribir en un pin.
- Antes de cualquier validador, un 3,51 % de las filas de rechazo o aclaracion de `eval` (y un 3,41 % en `eval_core` con el motor en C) se convierten en acciones ejecutables en lugar de rechazos o preguntas. Es el fallo mas relevante para produccion.
- Ventana de contexto de solo 256 tokens: no admite historiales largos ni documentos; el patron previsto es una peticion mas, como maximo, una linea de contexto y una respuesta corta.
- Unicamente ingles. No hay datos de rendimiento en otros idiomas.
- Dominio cerrado: el modelo solo conoce las formas JSON presentes en el dataset `gpio-llm-rpi5-actions` (configuracion `gpio_actions_v2`). Fuera de ese conjunto de acciones y de vocabulario de pines, su comportamiento no esta caracterizado.
- La decodificacion con gramatica garantiza la forma del JSON, pero no su correccion semantica: un JSON valido puede seguir siendo una accion incorrecta o insegura.
- La perdida de validacion de preentrenamiento (perplejidad 46,5) corresponde a un modelo muy pequeno; no cabe esperar comprension general del lenguaje ni generalizacion a peticiones fuera de las plantillas evaluadas.
- Licencia cc-by-4.0: permite uso comercial y obras derivadas con atribucion, pero conviene revisar los terminos del corpus de preentrenamiento (fineweb-edu-dedup del corpus SmolLM) antes de un despliegue comercial.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-09-19; se trata de un modelo sin adopcion publica documentada, sin validacion independiente de los resultados declarados (todos figuran como `verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AwaleSagar/gpio-llm-pico-rpi5
- Dataset de acciones GPIO: https://huggingface.co/datasets/AwaleSagar/gpio-llm-rpi5-actions
- Repositorio GitHub (codigo, motor en C y scripts de entrenamiento): https://github.com/AwaleSagar/gpio-llm
- Variante nano: https://huggingface.co/AwaleSagar/gpio-llm-nano-rpi5
- Variante base: https://huggingface.co/AwaleSagar/gpio-llm-base-rpi5
- Corpus de preentrenamiento (SmolLM corpus, fineweb-edu-dedup): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente herramientas de automatizacion de clics sin relacion con este modelo.
