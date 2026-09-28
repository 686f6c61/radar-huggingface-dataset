# MC7ever/spark25-4b-evo-merged

## Resumen

Spark25-4B EvoMerge (identificador `MC7ever/spark25-4b-evo-merged`) es un modelo de generacion de texto de aproximadamente 4.100 millones de parametros obtenido mediante una fusion lineal evolutiva ("evo-merge") de varios finetunes de la familia Spark2.5-4B. Lo publica el usuario MC7ever en HuggingFace y su rasgo distintivo es el metodo de construccion: en lugar de tecnicas como TIES o DARE, usa una combinacion convexa en PyTorch puro que optimiza los coeficientes de mezcla de los modelos donantes.

El modelo parte de cinco modelos: ProCreations/BetterWright-4b, hcnote/SparkMuse-4B, hcnote/Spark-X2.5-4B-Writing-EP1, sriq-ai/sriq-spark-v1.4 y XHToken/Spark-X2.5-4B-Base (este ultimo como donante de configuracion y tokenizer). Segun la model card, los pesos finales solo asignan coeficientes no nulos a BetterWright-4b (0,7637) y a Spark-X2.5-4B-Writing-EP1 (0,2363), mientras que SparkMuse-4B y sriq-spark-v1.4 reciben peso 0,0.

Es relevante como ejemplo de flujo de trabajo de fusion de modelos ("model merging") orientado a combinar capacidades de varios finetunes sin reentrenar. En el momento de la ficha acumula 27 descargas y 0 likes, por lo que se trata de una publicacion reciente y poco validada por la comunidad, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita (el tag `custom_code` indica que requiere codigo personalizado; la model card no detalla la arquitectura de la familia Spark2.5) |
| Parametros totales | 4.112.079.360 (~4,1 B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos en safetensors; no se confirma disponibilidad de GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura interna en la model card mas alla de que el modelo se apoya en la familia Spark2.5-4B y de que el repositorio esta etiquetado con `custom_code`. Esto implica, en la practica, que la carga del modelo puede requerir `trust_remote_code=True` para ejecutar el codigo de configuracion/tokenizer heredado del donante base (XHToken/Spark-X2.5-4B-Base). Los parametros totales reales declarados en el safetensors son 4.112.079.360.

El proceso de construccion es una fusion lineal evolutiva: una combinacion convexa de los pesos de varios finetunes, resuelta en PyTorch puro sin tecnicas de poda/desacuerdo como TIES o DARE. Los coeficientes finales publicados son `{BetterWright-4b: 0.7637, SparkMuse-4B: 0.0, Spark-X2.5-4B-Writing-EP1: 0.2363, sriq-spark-v1.4: 0.0}`. Es decir, aunque se parte de cinco modelos, el resultado efectivo es una mezcla de dos: BetterWright-4b y Spark-X2.5-4B-Writing-EP1. El modelo base se usa como donante de configuracion y tokenizer. No se documenta en la informacion disponible ningun proceso de RLHF, DPO, SFT posterior ni numero de tokens de entrenamiento, ya que la fusion no implica un entrenamiento adicional con datos.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` indica uso para dialogos multi-turno.
- Razonamiento y conocimiento general: los benchmarks publicados (MMLU, ARC, HellaSwag) sugieren capacidad de comprension y respuesta a preguntas de conocimiento y sentido comun.
- Razonamiento matematico basico: la puntuacion en GSM8K (0,7475) apunta a capacidad de resolucion de problemas aritmeticos de varios pasos, aunque sin datos sobre el formato de evaluacion (few-shot, CoT, etc.).
- Escritura creativa: la influencia del modelo Spark-X2.5-4B-Writing-EP1 (con coeficiente 0,2363) apunta a una componente orientada a generacion de texto narrativo y creativo.
- Tono poco censurado: el tag `uncensored-leaning` indica que el modelo tiende a producir respuestas con menor filtrado de contenido, aunque no hay detalle sobre el alcance real de esta caracteristica.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningun framework de agentes ni modo "thinking".
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: no disponibles; no se declaran idiomas.

## Casos de uso

- Generacion de texto creativo y narrativa: al incorporar el finetune de escritura Spark-X2.5-4B-Writing-EP1 en la mezcla, el modelo es adecuado para redactar relatos, dialogos y contenido editorial donde se prioriza estilo sobre precision factual.
- Asistentes conversacionales de dominio general: con 4,1 B de parametros y licencia Apache 2.0, puede desplegarse como chatbot local o autoalojado para conversaciones multi-turno sin depender de APIs de terceros.
- Prototipado rapido de aplicaciones de chat: su tamano reducido permite iterar en una sola GPU de consumo, lo que lo hace util para validar interfaces y flujos conversacionales antes de escalar a modelos mayores.
- Generacion aumentada en entornos con restricciones de privacidad: al poder ejecutarse en hardware local (por ejemplo, una RTX 3060 de 12 GB con cuantizacion), es apto para procesar texto sensible sin enviarlo a servicios externos.
- Experimentacion en fusion de modelos: sirve como caso de estudio reproducible para investigadores que quieran analizar el efecto de coeficientes de mezcla lineales sobre las metricas de evaluacion (HellaSwag, ARC, MMLU, GSM8K).
- Investigacion sobre alineacion y filtrado de contenido: la etiqueta `uncensored-leaning` lo convierte en un sujeto de estudio para medir sesgos, toxicidad y diferencias de comportamiento frente a modelos alineados con RLHF.
- Fine-tuning posterior sobre una base ya fusionada: al ser un modelo de 4 B con licencia permisiva, puede usarse como punto de partida para SFT/LoRA especifico de dominio, aprovechando que combina dos finetunes distintos.

## Benchmarks y rendimiento

Resultados publicados en la model card (puntuacion global de la "full-battery": 0,6172):

| Benchmark | Puntuacion |
|---|---|
| HellaSwag | 0,5626 |
| ARC-Challenge | 0,4369 |
| ARC-Easy | 0,6705 |
| MMLU | 0,6684 |
| GSM8K | 0,7475 |
| Puntuacion agregada | 0,6172 |

No se proporcionan los prompts, el numero de ejemplos (shots) ni la configuracion de evaluacion, por lo que los valores deben interpretarse con cautela. Tampoco se ofrecen resultados comparativos frente a los modelos donantes ni frente a otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead aproximado):
  - FP16/BF16: unos 8,2 GB solo en pesos; en torno a 10-12 GB en total con cache KV.
  - INT8: unos 4,3 GB en pesos; en torno a 6-7 GB en total.
  - INT4 (si se dispone de una cuantizacion GGUF/AWQ equivalente): unos 2,3 GB en pesos; en torno a 3,5-4 GB en total.
- GPU recomendadas: para FP16 se recomienda una GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10G). Con INT4 o INT8 es viable en GPUs de 6-8 GB (RTX 2060, RTX 3050, RTX 4060, Tesla T4).
- ¿Cabe en GPU de consumo? Si. En FP16 cabe en tarjetas de 12 GB; cuantizado cabe en tarjetas de 6-8 GB, e incluso podria ejecutarse en CPU con llama.cpp si existiera una conversion a GGUF (no confirmada en la informacion disponible).
- Opciones de despliegue: la model card indica `custom_code`, por lo que es probable que requiera `trust_remote_code=True` con librerias como Transformers. vLLM y TGI podrian funcionar si admiten el codigo personalizado del modelo. No se confirma soporte para llama.cpp u Ollama, ya que no se han publicado pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los modelos donantes ni de alternativas equivalentes en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, los modelos de los que parte la fusion son:

| Modelo | Rol en la fusion | Coeficiente |
|---|---|---|
| ProCreations/BetterWright-4b | Finetune donante | 0,7637 |
| hcnote/Spark-X2.5-4B-Writing-EP1 | Finetune donante | 0,2363 |
| hcnote/SparkMuse-4B | Finetune donante | 0,0 |
| sriq-ai/sriq-spark-v1.4 | Finetune donante | 0,0 |
| XHToken/Spark-X2.5-4B-Base | Donante de configuracion y tokenizer | No aplica |

La comparacion de parametros, contexto, rendimiento y disponibilidad frente a modelos de la misma categoria (por ejemplo, otros transformers de 4 B con licencia Apache 2.0) no esta disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de 4 B sin datos publicados sobre tecnicas de mitigacion de alucinaciones; en tareas factuales y de conocimiento abierto puede generar afirmaciones incorrectas con seguridad alta.
- Contenido poco filtrado: el tag `uncensored-leaning` sugiere que el modelo puede producir respuestas violentas, sexuales o controvertidas sin las restricciones habituales de modelos alineados. Se recomienda moderacion adicional en produccion.
- Sesgos: no hay evaluacion publicada de sesgos de genero, raza, religion o ideologia. Los sesgos heredados de los finetunes donantes no estan caracterizados.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingue es desconocido y probablemente limitado al ingles si los donantes lo estan.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones con documentos largos sin validacion previa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. No incluye garantias.
- Requisito de codigo personalizado: el tag `custom_code` implica que el modelo puede necesitar `trust_remote_code=True` al cargarse, lo que introduce un riesgo de seguridad si no se audita el codigo remoto antes de ejecutarlo.
- Validacion escasa: con 27 descargas, 0 likes y una unica puntuacion agregada (0,6172) sin detalle metodologico, la reproducibilidad y la fiabilidad de los resultados publicados no estan garantizadas.
- Sin cuantizaciones oficiales: la ausencia de pesos GGUF, AWQ o GPTQ en el repositorio limita su uso directo en herramientas como llama.cpp u Ollama sin conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MC7ever/spark25-4b-evo-merged
- Modelo donante principal: https://huggingface.co/ProCreations/BetterWright-4b
- Modelo donante (escritura): https://huggingface.co/hcnote/Spark-X2.5-4B-Writing-EP1
- Modelo donante: https://huggingface.co/hcnote/SparkMuse-4B
- Modelo donante: https://huggingface.co/sriq-ai/sriq-spark-v1.4
- Modelo base / donante de configuracion: https://huggingface.co/XHToken/Spark-X2.5-4B-Base

No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
