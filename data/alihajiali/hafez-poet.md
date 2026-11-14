# alihajiali/Hafez-Poet

## Resumen

Hafez-Poet es un modelo de generación de texto en persa especializado en poesía, desarrollado por el usuario alihajiali como un fine-tuning mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct. El objetivo del proyecto es adaptar un modelo pequeño (494 millones de parámetros) a la generación de poemas en estilo atribuido a Hafez, aceptando peticiones en lenguaje natural que especifican tema, tono, longitud y palabras obligatorias. Se distribuye como un único fichero GGUF F16 con el adaptador LoRA ya fusionado en los pesos, de modo que no requiere el modelo base ni un adaptador separado en tiempo de inferencia.

El modelo se entrenó íntegramente en CPU (Intel Core i7-11700K, ocho hilos) durante unos 45 minutos, sobre un subconjunto de 500 poemas extraídos de un corpus local de 631 poemas atribuidos a Hafez. Es, por tanto, un experimento de bajo coste computacional orientado a demostrar que un modelo de 0,5B puede especializarse en una tarea creativa muy concreta con recursos mínimos.

Su relevancia es acotada: no compite en capacidades generales, sino que sirve como ejemplo reproducible de fine-tuning LoRA en CPU y de empaquetado en GGUF para llama.cpp. La información publicada sobre benchmarks es limitada y el propio autor advierte que no se han realizado comparaciones numéricas con el modelo base ni evaluaciones humanas de calidad poética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de ejecución (contexto nativo de Qwen2.5-0.5B: no especificado en la información proporcionada) |
| Tipos de cuantizacion | F16 (único fichero publicado, GGUF) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16), 994.156.544 bytes (~948,1 MiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros, y aplica un fine-tuning LoRA sobre las capas lineales con rank=8, alpha=16 y dropout=0,05. El adaptador se fusiona posteriormente en los pesos y se exporta a GGUF F16 para su uso con llama.cpp. La plantilla de chat queda embebida en el fichero GGUF.

El entrenamiento se realizó en CPU (Intel Core i7-11700K, ocho hilos) con un presupuesto de tiempo de 45 minutos, finalizando en el paso 193 de un máximo de 600 (aproximadamente 1,04 épocas sobre los datos de entrenamiento). Se usaron 500 poemas (semilla 42), divididos a nivel de poema en 400 de entrenamiento, 50 de validación y 50 de test, que tras el troceado en muestras de hasta 512 tokens dieron lugar a 743 muestras de entrenamiento, 91 de validación y 99 de test. La función de pérdida se calculó solo sobre la respuesta del asistente, enmascarando instrucción y padding. Hiperparámetros: learning rate 1e-4, 10 pasos de warmup, batch efectivo 4 (batch=1 con acumulación de 4). El loss medio registrado fue 3,1208, descendiendo de 3,6172 en el primer intervalo de diez pasos a 2,9320 en el intervalo que termina en el paso 190. No se aplicaron RLHF ni DPO; el ajuste es puramente supervisado sobre pares instrucción-respuesta derivados de los poemas.

## Capacidades

- Generación de poesía en persa con peticiones en lenguaje natural que pueden incluir tema, tono, estilo, longitud y palabras obligatorias.
- Conversación de un solo turno mediante la plantilla de chat embebida en el GGUF (ejemplo con `--single-turn`).
- Generación de texto creativo condicionada por instrucciones estructuradas (tema, حال‌وهوا, palabras requeridas, número de versos).
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Capacidad multilingüe limitada al persa; no se documenta soporte de otros idiomas.
- No se documentan modos de razonamiento (thinking), visión ni audio.

## Casos de uso

- Generación de poemas personalizados: el modelo acepta una petición con tema, tono y palabras obligatorias y produce un poema en persa; adecuado para prototipos de aplicaciones de poesía generativa con requisitos temáticos concretos.
- Demostración educativa de fine-tuning LoRA en CPU: sirve como ejemplo reproducible de entrenamiento de bajo coste sobre un modelo de 0,5B y de exportación a GGUF para llama.cpp.
- Pruebas de concepto de asistentes poéticos en persa: permite validar flujos de prompt con instrucciones estructuradas (tema, حال‌وهوا, longitud) antes de escalar a modelos mayores.
- Generación de borradores creativos para revisión humana: útil como fuente de ideas iniciales que un poeta o editor refina después, dado que el autor advierte que la calidad no está garantizada.
- Experimentación con plantillas de chat y despliegue en llama.cpp: el GGUF incluye la plantilla embebida, lo que facilita probar integraciones con `llama-cli` y otros frontends compatibles.
- Investigación sobre sesgos y reproducción de corpus: permite estudiar hasta qué punto un modelo pequeño reproduce fragmentos de los poemas de entrenamiento, un fenómeno que el autor señala explícitamente.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de lenguaje sobre el texto de referencia, calculadas con instrucción y padding enmascarados, sobre el modelo LoRA antes de la conversión a F16/GGUF. No se ha evaluado el fichero GGUF por separado ni se ha comparado numéricamente con el modelo base.

| Particion | Muestras evaluadas | Loss | Perplexity | Precision de token |
|---|---:|---:|---:|---:|
| Entrenamiento (subconjunto) | 50 de 743 | 2,8270 | 16,89 | 35,59 % |
| Validacion (completa) | 91 | 2,9296 | 18,72 | 33,85 % |
| Test (completa) | 99 | 2,9587 | 19,27 | 32,94 % |

El autor advierte que la precisión de token de test (32,94 %) indica la proporción de posiciones en las que el modelo predice correctamente el siguiente token del poema de referencia con su primera elección, y no constituye una medida de calidad poética. No se han publicado resultados de MMLU, HumanEval, GSM8K ni evaluaciones humanas de rima, métrica o cumplimiento de restricciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F16 ocupa ~948,1 MiB, por lo que cabe holgadamente en GPUs consumer con 2 GB o más; en CPU requiere aproximadamente 1 GB de RAM más el contexto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo; también es viable en CPU, como demuestra el entrenamiento en un i7-11700K.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: llama.cpp (probado por el autor con `llama-cli`), y por extensión cualquier frontend compatible con GGUF como Ollama o llama-cpp-python; no se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hafez-Poet | 494 M | 2048 en ejemplo | fa | Apache 2.0 | GGUF F16 | Fine-tuning LoRA en CPU sobre Qwen2.5-0.5B |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en la informacion | multilingue | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades generales, sin especializacion poetica |
| Otros fine-tunes de Qwen2.5-0.5B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables documentadas en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con el modelo base ni con otros fine-tunes poéticos en persa, por lo que la comparativa se limita a la relación de dependencia con Qwen2.5-0.5B-Instruct.

## Limitaciones y advertencias

- Modelo pequeño con datos limitados: puede generar poemas con métrica irregular, repeticiones o falta de coherencia.
- No garantiza el cumplimiento del número de versos, el estilo, la rima ni la totalidad de las palabras obligatorias indicadas en la petición.
- Los temas de entrenamiento son aproximados (estimados mediante reglas léxicas) y la variedad de instrucciones es reducida.
- Riesgo de reproducción de fragmentos de los poemas de entrenamiento; el autor recomienda revisar la salida antes de publicarla.
- El texto generado por IA no debe atribuirse a Hafez.
- La procedencia del corpus original no está documentada y la atribución de todos los poemas a Hafez no está verificada de forma independiente.
- El dataset no se publica junto con los pesos.
- Las métricas publicadas corresponden al modelo LoRA antes de la conversión a GGUF; no se ha evaluado el fichero GGUF.
- No se han realizado evaluaciones humanas ni comparaciones numéricas con el modelo base.
- Licencia Apache 2.0 heredada del modelo base; no hay dependencia oficial con Qwen Team.
- Soporte únicamente en persa; no apto para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alihajiali/Hafez-Poet
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
