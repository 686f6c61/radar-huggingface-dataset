# mradermacher/Qlaude-full-i1-GGUF

## Resumen

Qlaude-full-i1-GGUF es una cuantizacion en formato GGUF del modelo Qlaude-full, publicada por mradermacher. El modelo original es un fine-tuning mediante LoRA sobre una base Gemma, orientado a tareas de programacion y conversacion, con soporte declarado para ingles, ruso y chino. Esta version concreta emplea cuantizaciones ponderadas con fichero imatrix (metodo i1), lo que permite reducir el peso del modelo manteniendo la mayor parte de la calidad del original.

El modelo cuenta con aproximadamente 30.700 millones de parametros (30,7B) en precision completa, lo que lo situa en la gama de modelos densos de tamano medio-grande. El repositorio ocupa 11,9 GB, correspondiente a la cuantizacion i1-Q2_K disponible, que reduce el modelo a unos 2 bits por peso. La model card indica que el modelo es multimodal (vision), aunque los ficheros mmproj se alojan en el repositorio estatico hermano.

Es relevante ahora porque permite ejecutar un modelo de 30B en hardware mas modesto mediante llama.cpp y variantes GGUF, aunque la cuantizacion disponible en este repositorio es agresiva (Q2_K) y la informacion publicada sobre arquitectura, entrenamiento y benchmarks es muy limitada. La licencia figura como "other", lo que obliga a revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma, segun tags); detalles no disponibles |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (unico quant publicado en este repo); lista completa de quants previstos en comentarios: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (declarado en la ficha); tags adicionales: russian, english, chinese |
| Licencia | other |
| Formato de pesos | GGUF (tambien imatrix GGUF para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La informacion disponible indica que Qlaude-full se construye como un LoRA sobre una base Gemma (tag "gemma" y "lora" en la model card), con especial enfasis en programacion ("coding" en tags). No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta version concreta ha sido cuantizada por mradermacher usando cuantizacion ponderada con fichero imatrix (metodo i1), que ajusta la precision de cada tensor segun su importancia para reducir la perplejidad. El autor indica que la cuantizacion i1-Q2_K publicada tiene un tamano de 12,0 GB y sugiere que IQ3_XXS probablemente ofrece mejor calidad. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (tag "conversational").
- Programacion y generacion de codigo (tag "coding").
- Capacidades multilingues segun tags: ingles, ruso y chino (la ficha oficial solo declara "en").
- Capacidad multimodal (vision) segun la model card: "This is a vision model - mmproj files (if any) will be in the static repository".
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Modo thinking u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Asistencia a la programacion en local: al ser un GGUF de 30B ejecutable con llama.cpp, puede usarse como asistente de codigo en estaciones de trabajo sin GPU de datacenter, aprovechando el enfasis del modelo en tareas de coding.
- Prototipado de chatbots conversacionales: el tag "conversational" y su naturaleza de fine-tuning LoRA lo hacen adecuado para experimentar con dialogos multi-turno en entornos de desarrollo.
- Despliegue en hardware de consumo: la cuantizacion i1-Q2_K (12 GB) permite probar el modelo en GPUs consumer de gama alta o en configuraciones CPU+GPU, util para evaluaciones rapidas.
- Generacion de codigo en pipelines internos: puede integrarse en herramientas de desarrollo locales para autocompletado o generacion de fragmentos, siempre que se valide la calidad de la cuantizacion Q2_K.
- Experimentacion multilingue (ingles, ruso, chino): util para pruebas de generacion de texto en esos idiomas segun los tags del modelo.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix, lo que permite a investigadores generar sus propias cuantizaciones y estudiar el impacto de la precision en la calidad.
- Evaluacion de modelos multimodales: si se obtienen los ficheros mmproj del repositorio estatico, puede probarse la capacidad de vision en tareas sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion i1-Q2_K ocupa 12,0 GB, por lo que requiere al menos ~12-14 GB de VRAM para cargarse completamente en GPU (mas overhead de contexto).
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para mayor margen y velocidad; tambien posible en RTX 3090 (24 GB).
- Cabe en GPU consumer: si, en GPUs con 16-24 GB de VRAM usando la cuantizacion Q2_K; cuantizaciones mayores (Q4, Q5, Q6) requeririan mas memoria y no estan publicadas en este repositorio.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el formato GGUF es compatible con estas herramientas. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qlaude-full-i1-GGUF | 30,7B | no disponible | other | GGUF | Cuantizacion i1-Q2_K; base Gemma con LoRA |
| Modelo base lahyk/Qlaude-full | 30,7B | no disponible | other | safetensors (presumiblemente) | Modelo original sin cuantizar |
| Gemma (base) | no disponible | no disponible | other | safetensors | Base del fine-tuning segun tags |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La unica cuantizacion publicada en este repositorio es i1-Q2_K (2 bits por peso), lo que implica una perdida de calidad notable frente al modelo original; el propio autor sugiere que IQ3_XXS seria preferible.
- No se dispone de informacion sobre sesgos conocidos del modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no cuantificado en la informacion disponible.
- La ficha oficial declara solo ingles como idioma, aunque los tags mencionan ruso y chino; la cobertura real de estos idiomas no esta verificada.
- Licencia "other": es imprescindible revisar los terminos del modelo base (lahyk/Qlaude-full) y de Gemma antes de cualquier uso comercial, ya que las licencias de Gemma imponen restricciones especificas.
- La model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos, la funcionalidad multimodal no esta disponible.
- Informacion muy escasa sobre arquitectura, contexto y entrenamiento: no se recomienda su uso en produccion sin una evaluacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qlaude-full-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Qlaude-full-GGUF
- Modelo base: https://huggingface.co/lahyk/Qlaude-full
- Pagina de resumen del modelo: https://hf.tst.eu/model#Qlaude-full-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Grafico de comparacion de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
