# mradermacher/sherlock-qwen2.5-3b-grpo-v1-GGUF

## Resumen

Sherlock-qwen2.5-3b-grpo-v1-GGUF es la version cuantizada en formato GGUF del modelo andreayhchen/sherlock-qwen2.5-3b-grpo-v1, un ajuste fino de Qwen2.5-3B realizado con GRPO (Group Relative Policy Optimization) y orientado a tareas de matematicas y a la adopcion de una persona conversacional concreta (el tag "persona" y el nombre "sherlock" apuntan a un asistente con un estilo detectivesco o analitico marcado). El proceso de cuantizacion lo ha llevado a cabo mradermacher, un desarrollador conocido en el ecosistema de llama.cpp por publicar versiones GGUF de modelos pequenos y medianos.

El modelo original parte de la arquitectura Qwen2.5-3B, un transformer decoder-only denso de aproximadamente 3.086 millones de parametros (3,085,938,688 segun los pesos en safetensors), con soporte nativo de conversacion multi-turno y entrenamiento adicional mediante LoRA que posteriormente se fusiono en los pesos base (tag "lora-merged"). El uso de GRPO indica un refuerzo por politica con recompensas, una tecnica popularizada por modelos de razonamiento como DeepSeek-R1, lo que sugiere que el ajuste busca mejorar la precision en problemas de matematicas paso a paso.

La relevancia de esta publicacion es practica mas que investigadora: ofrece el modelo en doce niveles de cuantizacion distintos, desde Q2_K (1,4 GB) hasta f16 (6,3 GB), lo que permite ejecutarlo en hardware de consumo, portatiles con GPU modesta o incluso solo CPU. Con cero descargas y cero "likes" en el momento del registro, se trata de una publicacion reciente y sin validacion comunitaria, un factor a tener en cuenta antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Qwen2.5-3B (no confirmado de forma explicita en la model card, derivado del modelo base) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no confirmada en la model card; heredada de la arquitectura Qwen2.5-3B, que soporta 32.768 tokens |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B, un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, la arquitectura estandar de la familia Qwen2.5. Sobre esa base, el autor del modelo original (andreayhchen) aplico un ajuste fino con LoRA que despues se fusiono en los pesos (tag "lora-merged"), seguido de un entrenamiento con GRPO, un algoritmo de optimizacion por politica relativa a un grupo de respuestas que se ha usado con exito en modelos de razonamiento matematico.

Los tags de la model card son "grpo", "lora-merged", "math" y "persona", lo que delimita con claridad el objetivo del ajuste: mejorar el desempeno en razonamiento matematico y, al mismo tiempo, dotar al modelo de una personalidad conversacional especifica. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo una fase adicional de DPO o RLHF sobre la senal de GRPO. Tampoco se detalla la configuracion del bucle de GRPO (funcion de recompensa, tamano de grupo, numero de pasos).

La aportacion de mradermacher en este repositorio es exclusivamente la cuantizacion: se han generado cuantizaciones estaticas (no ponderadas ni con imatrix), algo que el propio autor indica de forma explicita al senalar que las versiones ponderadas "parecen no estar disponibles" por su parte. La cuantizacion se realizo con el pipeline habitual de llama.cpp, con conversion desde Hugging Face y cuantizacion de tensores de salida activada (quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento matematico reforzado mediante GRPO, presumiblemente con respuestas paso a paso, aunque no se documenta el formato exacto de la cadena de razonamiento.
- Adopcion de una persona o estilo conversacional concreto, segun el tag "persona" y el nombre del modelo.
- Capacidad base de Qwen2.5-3B para generacion de codigo y comprension general del lenguaje, no verificada especificamente en esta variante ajustada.
- Compatibilidad declarada con "endpoints_compatible", lo que facilita su despliegue detras de APIs compatibles con el formato de Hugging Face.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun el campo "language" de la model card.
- Capacidades de vision o audio: no disponibles, es un modelo exclusivamente de texto.

## Casos de uso

- Tutoria de matematicas en ingles: el ajuste con GRPO sobre un modelo de 3B apunta a resolver problemas aritmeticos y algebraicos paso a paso, por lo que encaja en un asistente educativo que explique el procedimiento y no solo la respuesta final, ejecutable en un portatil con GPU de 8 GB.
- Chatbot con personalidad definida para demos y prototipos: el tag "persona" indica que el modelo mantiene un estilo consistente, util para construir asistentes tematicos (por ejemplo, un personaje detectivesco) sin necesidad de un "system prompt" extenso.
- Asistente local sin conexion: al distribuirse en GGUF con cuantizaciones desde 1,4 GB, puede desplegarse en un equipo de escritorio o portatil sin GPU dedicada mediante llama.cpp u Ollama, lo que es relevante en entornos con requisitos de privacidad o sin acceso a Internet.
- Evaluacion comparativa de tecnicas de alineacion: investigadores interesados en GRPO pueden usar esta variante como referencia de un ajuste de 3B con LoRA fusionado y analizar su comportamiento frente al Qwen2.5-3B-Instruct original.
- Generacion de borradores de codigo y scripts sencillos en ingles: aunque no se documenta un ajuste especifico en programacion, la base Qwen2.5-3B tiene competencia razonable en lenguajes populares, suficiente para autocompletado ligero o generacion de utilidades.
- Prototipado rapido de agentes conversacionales en local: gracias a la compatibilidad declarada con endpoints, se puede envolver en un servidor compatible con la API de OpenAI y probar flujos conversacionales en un entorno de desarrollo antes de escalar a un modelo mayor.
- Filtrado y reformulacion de texto en ingles: con su ventana de contexto heredada de Qwen2.5-3B, puede resumir o reescribir documentos de varias paginas manteniendo el tono configurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, GSM8K, HumanEval ni de ningun otro conjunto de evaluacion, y tampoco se proporcionan comparaciones con el modelo base o con el modelo sin cuantizar. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, solo listados de ofertas de empleo sin relacion alguna con el proyecto.

## Requisitos de hardware

Los tamanos de fichero que se indican a continuacion son datos exactos del repositorio; las estimaciones de VRAM son calculos derivados que anaden entre un 20 % y un 30 % de margen para cache KV, contexto y sobrecarga del runtime.

- Q2_K (1,4 GB): cabe en cualquier GPU con 2 GB o mas; tambien en CPU con 4 GB de RAM. Calidad notablemente degradada.
- Q3_K_S / Q3_K_M / Q3_K_L (1,6 a 1,8 GB): GPU de 4 GB o CPU con 6 GB de RAM.
- IQ4_XS / Q4_K_S / Q4_K_M (1,9 a 2,0 GB): recomendados por el autor por su relacion velocidad/calidad; caben en una GTX 1650 de 4 GB o en una RTX 3050 de 6 GB.
- Q5_K_S / Q5_K_M (2,3 GB): GPU de 6 GB o superior.
- Q6_K (2,6 GB): GPU de 8 GB, por ejemplo RTX 3060 Ti o RTX 4060.
- Q8_0 (3,4 GB): GPU de 8 GB con contexto moderado; VRAM estimada en torno a 5-6 GB con contexto largo.
- f16 (6,3 GB): GPU de 12 GB o superior; el propio autor lo califica de "overkill" para este tamano de modelo.
- Cache KV estimada para la ventana completa de 32.768 tokens de Qwen2.5-3B: aproximadamente 1,1-1,2 GB en precision fp16, en funcion del numero de cabezas KV y de la implementacion.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 3080), Apple Silicon con memoria unificada (M1 en adelante) y, para los cuantos mas bajos, incluso CPU sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile, Jan, GPT4All y llama-cpp-python. El soporte en vLLM para GGUF es experimental y no se garantiza; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 3B en Q4_K_M suele generar entre 30 y 80 tokens por segundo en GPUs consumer modernas, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

La comparativa se establece a nivel de arquitectura y modelo base, ya que no existen datos de rendimiento publicados para este ajuste concreto.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sherlock-qwen2.5-3b-grpo-v1-GGUF | 3,09 B | no confirmado (heredado de Qwen2.5-3B, 32.768 tokens) | no disponible | GGUF | Ajuste con GRPO y persona, solo ingles, sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 (segun la familia Qwen2.5) | safetensors, GGUF | Modelo generalista con soporte de tool calling y multilingue |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, licencia con restricciones para grandes empresas |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y matematicas para su tamano |

La ventaja competitiva de esta variante no es el rendimiento bruto, sino la disponibilidad de doce cuantizaciones GGUF listas para descargar y su posible especializacion en matematicas y en una persona conversacional concreta. Frente a ello, la ausencia de licencia declarada, la falta de benchmarks y el soporte unicamente en ingles son desventajas claras frente a las alternativas de la tabla.

## Limitaciones y advertencias

- Licencia no disponible: al no especificarse la licencia, no se puede confirmar que el uso comercial este permitido. Es imprescindible contactar con el autor del modelo original (andreayhchen) antes de cualquier despliegue en produccion.
- Idiomas: el modelo solo declara soporte de ingles. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Sesgos: al no documentarse la composicion del dataset de ajuste ni el conjunto base de Qwen2.5-3B, no se pueden anticipar sesgos especificos. El ajuste con GRPO sobre recompensas puede introducir sesgos adicionales derivados de la funcion de recompensa, que no se detalla.
- Riesgo de alucinacion: previsiblemente alto en un modelo de 3B, especialmente en tareas factuales y en problemas matematicos largos, donde tiende a inventar pasos intermedios plausibles.
- Sin benchmarks publicados: no hay ninguna evidencia cuantitativa de mejora sobre el modelo base. El tag "math" describe la intencion del ajuste, no un resultado verificado.
- Cuantizaciones de baja calidad: Q2_K y Q3_K degradan notablemente la calidad de un modelo de 3B. En particular, Q3_K_M se etiqueta como "lower quality" en la propia model card.
- Cuantizaciones no ponderadas: el autor indica que no hay cuantizaciones ponderadas ni con imatrix, por lo que las versiones disponibles no incorporan la mejora de calidad que suele aportar ese metodo.
- Adopcion nula: cero descargas y cero "likes" en el momento del registro, sin validacion por parte de la comunidad. No se recomienda usar este modelo como pieza critica de un sistema sin evaluarlo previamente de forma exhaustiva.
- Sin soporte documentado de tool calling ni de flujos de agente: no se puede asumir que el ajuste conserve estas capacidades de forma fiable.
- Contexto no confirmado: la model card no especifica la longitud de contexto del ajuste. Aunque la arquitectura base soporte 32.768 tokens, el ajuste con LoRA y GRPO podria haber reducido la ventana efectiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sherlock-qwen2.5-3b-grpo-v1-GGUF
- Modelo base: https://huggingface.co/andreayhchen/sherlock-qwen2.5-3b-grpo-v1
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#sherlock-qwen2.5-3b-grpo-v1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuanto: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia el trabajo de cuantizacion: https://www.nethype.de/
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; los unicos enlaces devueltos corresponden a ofertas de empleo sin relacion con el proyecto.
