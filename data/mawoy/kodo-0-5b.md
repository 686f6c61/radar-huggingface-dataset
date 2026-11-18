# Mawoy/KoDo-0.5B

## Resumen

KoDo-0.5B es un modelo de lenguaje autoregresivo de 494 millones de parámetros publicado por el usuario Mawoy en Hugging Face y atribuido en su model card a Yujang (Kallzzxa). Se trata de un fine-tune del modelo instructivo Qwen/Qwen2.5-0.5B-Instruct, sobre el que se ha aplicado un ajuste LoRA con rango 32 en todas las proyecciones, posteriormente fusionado en los pesos finales. No introduce arquitectura nueva: hereda el transformer decoder-only de la familia Qwen2.5, incluida su ventana de contexto de 32 000 tokens.

El objetivo declarado del modelo es el ajuste conversacional en indonesio e inglés, con un conjunto de datos de aproximadamente 26 000 ejemplos que combina Alpaca-Indonesian (12k), OpenAssistant Guanaco (4k), Alpaca-EN (6k) y Dolly (4k). Es, por tanto, un modelo pequeño orientado a experimentación, prototipado y despliegue en entornos con recursos muy limitados, más que a cargas de producción de alta exigencia.

Su relevancia actual es acotada: compite en el nicho de modelos sub-1B para inferencia en CPU o GPUs de consumo, y su interés principal reside en ser un ejemplo de fine-tune ligero sobre una base Apache 2.0 bien conocida, con soporte nativo de indonesio. El repositorio tiene un tamaño de 2,0 GB, coherente con pesos en safetensors en precisión completa o media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune LoRA fusionado |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención causal estándar, sin mecanismos de atención lineal ni mezcla de expertos. El fine-tune se realizó mediante LoRA con rango 32 aplicado a todas las proyecciones y posteriormente fusionado en los pesos base, de modo que el modelo resultante se carga como un modelo denso convencional sin adaptadores separados.

El conjunto de entrenamiento declarado suma unos 26 000 ejemplos: 12 000 de Alpaca-Indonesian, 4 000 de OpenAssistant Guanaco, 6 000 de Alpaca-EN y 4 000 de Dolly. No se especifican en la información disponible el número total de tokens vistos, la composición exacta de las conversaciones, la presencia de RLHF o DPO, ni hiperparámetros de entrenamiento como la tasa de aprendizaje o el número de épocas. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA fusionado. La model card indica que el modelo reconoce a su creador ante preguntas como "Siapa pembuatmu?" o "Who created you?".

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con formato de chat compatible con la plantilla de Qwen2.5.
- Razonamiento básico y respuesta a instrucciones, heredado del ajuste instructivo de la base.
- Generación de código y matemáticas a nivel elemental, limitada por el tamaño de 0,49B parámetros.
- Soporte de tool calling y function calling: no documentado en la información disponible; la base Qwen2.5-Instruct sí lo soporta, pero no se confirma que el fine-tune lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües limitadas a indonesio e inglés según la model card; el resto de idiomas de la base Qwen2.5 no se garantizan tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Identificación del autor del modelo ante preguntas directas.

## Casos de uso

- Prototipado de chatbots en indonesio: el modelo puede mantener conversaciones multi-turno con la plantilla de chat de Qwen2.5 y una ventana de 32 000 tokens, lo que permite incluir historial extenso o documentos de referencia en el contexto sin truncar.
- Asistentes conversacionales ligeros en inglés para demos y pruebas de concepto: al caber en GPUs de consumo y en CPU, permite iterar rápidamente en local sin infraestructura dedicada.
- Generación de respuestas dentro de pipelines de anotación o aumento de datos en indonesio, aprovechando el ajuste sobre Alpaca-Indonesian para producir borradores que luego se revisan manualmente.
- Evaluación comparativa de fine-tunes LoRA: sirve como caso de estudio reproducible de cómo un ajuste r=32 sobre una base de 0,5B afecta al comportamiento conversacional en dos idiomas.
- Despliegue en dispositivos con recursos muy limitados (Raspberry Pi, portátiles sin GPU) mediante cuantización a 4 bits en llama.cpp u Ollama, para tareas de generación de texto breve y baja latencia.
- Filtrado y clasificación de texto bilingüe indonesio-inglés en entornos de bajo coste, usando el modelo como generador de etiquetas o resúmenes cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (0,49B parámetros × 2 bytes), en torno a 0,5 GB en cuantización de 8 bits y 0,3-0,4 GB en 4 bits, sin contar la caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan con holgura y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: transformers (referencia de la model card), llama.cpp, Ollama y vLLM (previa conversión o carga del checkpoint en safetensors); TGI es viable si se dispone del tokenizador y la configuración de Qwen2.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera decodificación en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| KoDo-0.5B | 0,49B | 32K | Apache 2.0 | id, en | Fine-tune LoRA de Qwen2.5-0.5B-Instruct; sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,49B | 32K | Apache 2.0 | multilingüe (incluye id y en) | Base del anterior; cobertura idiomática más amplia y benchmarks publicados por el autor |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | multilingüe | Mayor capacidad a costa de más VRAM; alternativa si el presupuesto lo permite |
| SmolLM2-360M-Instruct | 0,36B | 8K (aprox.) | Apache 2.0 | principalmente en | Alternativa sub-0,5B con contexto menor; no cubre indonesio de forma específica |

## Limitaciones y advertencias

- Tamaño muy reducido (0,49B): capacidad de razonamiento, matemáticas y código limitada; propenso a errores en tareas que requieran varios pasos.
- Riesgo de alucinación elevado, especialmente fuera de los dominios cubiertos por Alpaca, Guanaco y Dolly.
- Cobertura idiomática restringida a indonesio e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- El ajuste LoRA puede haber degradado capacidades de la base Qwen2.5-0.5B-Instruct, como el tool calling o el multilingüismo amplio, sin que se documente una evaluación al respecto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a la base ni frente a alternativas.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; no hay señales de validación por parte de la comunidad.
- La model card muestra discrepancias entre el ID del repositorio (Mawoy/KoDo-0.5B) y el usado en el ejemplo de código (Yujang/KoDo-0.5B); conviene verificar la ruta correcta antes de cargar el modelo.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos de la base Qwen2.5; conviene revisar la licencia original.
- Fechas de creación y actualización del repositorio (noviembre de 2026) posteriores a la consulta, lo que sugiere metadatos inconsistentes; tratar con cautela cualquier dato temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mawoy/KoDo-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper de Qwen2.5 (referencia de la arquitectura base): no disponible en la información proporcionada
- Repositorio o blog del autor (Yujang/Kallzzxa): no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
