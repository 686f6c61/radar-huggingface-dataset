# mradermacher/airophin-v2-13b-PI-8k-fp16-GGUF

## Resumen

airophin-v2-13b-PI-8k-fp16-GGUF es una cuantizacion en formato GGUF del modelo bhenrym14/airophin-v2-13b-PI-8k-fp16, un fine-tune de 13.016.028.160 parametros (aproximadamente 13 mil millones) orientado a conversacion e instrucciones en ingles. El modelo original combina tecnicas de entrenamiento sobre datasets de instrucciones de alta calidad (airoboros-gpt4-m2.0, dolphin y orca-chat) y anade extension de contexto hasta 8k tokens, segun indica el sufijo "PI-8k" del nombre (probablemente Position Interpolation). El encargado de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos.

El modelo resuelve el problema de desplegar un LLM de 13B en hardware de consumo mediante cuantizaciones estaticas de 2 a 8 bits, con tamanos que van desde 5,0 GB (Q2_K) hasta 13,9 GB (Q8_0). Es relevante para desarrolladores que quieren ejecutar inferencia local con llama.cpp u Ollama sin renunciar a un modelo de instrucciones afinado sobre datos GPT-4, aunque su licencia no esta declarada y el modelo base no publica informacion detallada de arquitectura ni benchmarks.

La ficha cubre exclusivamente los datos disponibles en la informacion proporcionada; los apartados sin datos verificables se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 13B, inferido del nombre; no confirmado en la informacion) |
| Parametros totales | 13.016.028.160 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8k tokens (segun el sufijo "PI-8k" del nombre del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en fp16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por el nombre y el tamano (13.016.028.160 parametros) se trata de un transformer decoder-only de aproximadamente 13B, pero la model card no confirma la arquitectura, el numero de capas, la dimension oculta ni el mecanismo de atencion. El sufijo "PI-8k" sugiere una extension de contexto mediante Position Interpolation hasta 8k tokens, aunque este extremo no se detalla en la documentacion.

El entrenamiento del modelo base se realizo sobre tres datasets de instrucciones: jondurbin/airoboros-gpt4-m2.0 (datos generados con GPT-4 para instrucciones y razonamiento), ehartford/dolphin (dataset de instrucciones sin censura) y shahules786/orca-chat (conversaciones multi-turno estilo Orca). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o SFT adicionales. La cuantizacion la realiza mradermacher con cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), y existe una version con cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto e instrucciones en ingles, afinado sobre datasets de instrucciones de alta calidad (airoboros-gpt4-m2.0, dolphin, orca-chat).
- Razonamiento multi-turno y conversacion, gracias al entrenamiento sobre orca-chat y dolphin.
- Respuesta a instrucciones complejas derivadas de datos generados con GPT-4 (airoboros).
- Capacidad de contexto extendido hasta 8k tokens (segun el nombre del modelo base; no verificado en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el dataset airoboros incluye tareas de razonamiento, pero no se documenta soporte de agentes.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener conversaciones multi-turno con hasta 8k tokens de contexto, adecuado para prototipos de chatbots que se ejecutan en estaciones de trabajo sin GPU de datacenter.
- Generacion de texto creativo y redaccion asistida: el fine-tune sobre dolphin y airoboros favorece respuestas variadas y creativas, util para borradores, resumenes y reescritura en ingles.
- Procesamiento de documentos largos en ingles: con 8k tokens de contexto se pueden resumir articulos, informes o transcripciones de hasta aproximadamente 6.000 palabras por pasada.
- Evaluacion de modelos y experimentacion academica: al ser una cuantizacion GGUF de un fine-tune, sirve para comparar el efecto de la cuantizacion (Q2_K a Q8_0) en la calidad de salida sobre el mismo modelo base.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (7,5 GB) y Q4_K_M (8,0 GB) permiten ejecutar el modelo en GPUs de consumo de 8-12 GB de VRAM.
- Fine-tuning adicional o destilacion: el modelo base en fp16 puede servir como punto de partida para ajustes sobre dominios especificos en ingles, aunque la licencia no declarada obliga a verificar los terminos antes de uso comercial.
- Educacion y demos offline: al ejecutarse con llama.cpp u Ollama sin conexion, es util para talleres y demostraciones de LLM en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo completo debe caber en memoria, mas overhead de contexto y KV cache):
  - Q2_K (5,0 GB): aproximadamente 6-7 GB de VRAM.
  - Q3_K_S (5,8 GB) y Q3_K_M (6,4 GB): aproximadamente 7-8 GB.
  - Q3_K_L (7,0 GB) e IQ4_XS (7,1 GB): aproximadamente 8-9 GB.
  - Q4_K_S (7,5 GB) y Q4_K_M (8,0 GB): aproximadamente 9-10 GB.
  - Q5_K_S (9,1 GB) y Q5_K_M (9,3 GB): aproximadamente 10-11 GB.
  - Q6_K (10,8 GB): aproximadamente 12-13 GB.
  - Q8_0 (13,9 GB): aproximadamente 15-16 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 24 GB o A100 40 GB para Q8_0 con contexto completo; H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB y RTX 4090 24 GB, usando cuantizaciones Q4_K_M o superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para produccion con esas herramientas se requeriria el modelo base en safetensors/fp16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| airophin-v2-13b-PI-8k-fp16-GGUF (este) | 13,0B | 8k (segun nombre) | no disponible | GGUF | Cuantizaciones estaticas Q2_K a Q8_0 |
| bhenrym14/airophin-v2-13b-PI-8k-fp16 (base) | 13,0B | 8k (segun nombre) | no disponible | safetensors fp16 | Modelo original sin cuantizar |
| mradermacher/airophin-v2-13b-PI-8k-fp16-i1-GGUF | 13,0B | 8k (segun nombre) | no disponible | GGUF (imatrix) | Cuantizaciones ponderadas del mismo modelo |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar los terminos del modelo base antes de cualquier despliegue en produccion.
- Modelo exclusivamente en ingles: el campo `language: en` limita su uso a tareas en ese idioma; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: como todo LLM de 13B, puede generar informacion incorrecta con apariencia de veracidad, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos conocidos: los datasets de origen (airoboros, dolphin, orca-chat) pueden introducir sesgos presentes en sus fuentes; no se documenta ninguna mitigacion.
- Contexto de 8k no verificado: el sufijo "PI-8k" sugiere extension por Position Interpolation, pero la model card no confirma el contexto efectivo ni su calidad en los extremos de la ventana.
- Perdida de calidad por cuantizacion: las cuantizaciones Q2_K y Q3_K reducen la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima fidelidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a otros modelos, lo que dificulta la comparacion objetiva.
- Modelo de 13B con conocimiento limitado: no es adecuado para tareas que requieran conocimiento factual extenso o razonamiento de nivel frontier.
- Repositorio de 88,8 GB: incluye todas las cuantizaciones, lo que requiere descargar solo el archivo GGUF deseado, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/airophin-v2-13b-PI-8k-fp16-GGUF
- Modelo base: https://huggingface.co/bhenrym14/airophin-v2-13b-PI-8k-fp16
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/airophin-v2-13b-PI-8k-fp16-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#airophin-v2-13b-PI-8k-fp16-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Dataset airoboros-gpt4-m2.0: https://huggingface.co/datasets/jondurbin/airoboros-gpt4-m2.0
- Dataset dolphin: https://huggingface.co/datasets/ehartford/dolphin
- Dataset orca-chat: https://huggingface.co/datasets/shahules786/orca-chat
