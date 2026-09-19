# mradermacher/Neeps-125M-Base-GGUF

## Resumen

Neeps-125M-Base-GGUF es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo base pdjamez/Neeps-125M-Base. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de pesos a formato GGUF para su uso con llama.cpp y herramientas compatibles, manteniendo la licencia Apache-2.0 del modelo original. El modelo subyacente es un transformer causal decoder-only de tipo Llama con 125.095.680 parámetros (aproximadamente 125 M) entrenado sobre el subconjunto HuggingFaceFW/fineweb-edu.

Por su tamaño, es un modelo de la categoría "small language model" orientado a experimentación, docencia y despliegue en entornos con recursos muy limitados (CPU, dispositivos de borde, navegador). Al ser un modelo base y no un modelo ajustado por instrucciones, su comportamiento esperado es el de continuación de texto en inglés, no el de asistente conversacional.

La relevancia de este repositorio es fundamentalmente práctica: ofrece doce variantes de cuantización (desde Q2_K hasta f16) con tamaños que van de los 0,2 GB a los 0,4 GB según los datos publicados por el autor, lo que permite elegir el compromiso entre calidad y huella de memoria sin necesidad de ejecutar el proceso de conversión. No se han publicado resultados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, tipo Llama (etiqueta `llama` en la model card), pipeline `causal-lm` |
| Parametros totales | 125.095.680 (aproximadamente 125 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones de este repositorio) y safetensors (modelo base pdjamez/Neeps-125M-Base); la model card incluye la etiqueta `mlx` |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tamano del repositorio | 1,1 GB |
| Modelo base | pdjamez/Neeps-125M-Base |
| Autor de la cuantizacion | mradermacher |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura interna ni el procedimiento de entrenamiento del modelo original; únicamente etiqueta el modelo como `causal-lm`, `base-model` y `llama`. Por tanto, los detalles sobre número de capas, dimensión oculta, número de cabezas de atención, tipo de positional encoding (RoPE u otro) o mecanismo de atención no están disponibles en la información proporcionada. Lo que sí se conoce es el recuento exacto de parámetros a partir de los pesos en safetensors (125.095.680) y el corpus declarado: HuggingFaceFW/fineweb-edu, un dataset de texto educativo en inglés filtrado por calidad, habitualmente utilizado para modelos pequeños.

En cuanto al proceso de cuantización, la model card indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El autor señala explícitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de publicar el repositorio, y ofrece la posibilidad de solicitarlas mediante una discusión en la comunidad. No se documenta ningún proceso de RLHF, DPO, SFT ni ajuste por instrucciones: el artefacto es un modelo base puro.

## Capacidades

- Generacion de texto en ingles mediante continuacion de prompt (completado), no mediante dialogo instruccional.
- Modelado de lenguaje causal: asignacion de probabilidad a secuencias y calculo de perplejidad.
- Punto de partida para ajuste fino supervisado (SFT), LoRA o QLoRA en tareas concretas en ingles.
- Extraccion de representaciones internas (hidden states) utilizable para cabezales downstream, como clasificacion de secuencias, tras el ajuste correspondiente.
- Inferencia en CPU y en dispositivos de bajos recursos gracias a las cuantizaciones GGUF.
- No soporta tool calling ni function calling: es un modelo base sin plantilla de chat ni entrenamiento para ello.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No tiene capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues: limitadas al ingles declarado; no se documenta soporte de otros idiomas.

## Casos de uso

- Docencia y aprendizaje de LLM: con 125 M de parametros y ficheros GGUF de 0,2 GB, se puede descargar y ejecutar en un portatil para ilustrar tokenizacion, muestreo (temperature, top-p) y el efecto de la cuantizacion en la perplejidad, sin necesidad de GPU.
- Ajuste fino de dominio sobre datos en ingles: el checkpoint base es un punto de partida adecuado para SFT o LoRA en tareas de nicho (por ejemplo, normalizacion de texto o generacion de descripciones cortas) cuando se dispone de un corpus etiquetado pequeno.
- Clasificacion de texto en ingles: anadiendo un cabezal de clasificacion y ajustando el modelo, se puede abordar analisis de sentimiento o deteccion de spam en lotes grandes, donde un modelo de 125 M ofrece un coste de inferencia muy bajo por documento.
- Autocompletado de texto en herramientas de escritura en ingles: al ser un modelo de completado puro, encaja en escenarios de sugerencia de continuacion de frase donde no se requiere dialogo ni seguimiento de instrucciones.
- Despliegue en el borde: cuantizado a Q4_K_M, el modelo ocupa del orden de decenas de megabytes en disco, lo que permite ejecutarlo en Raspberry Pi, telefonos de gama media o entornos embebidos mediante llama.cpp, con fines de demostracion o preprocesado local.
- Validacion de pipelines de cuantizacion: el repositorio incluye doce variantes (Q2_K a f16) del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de cada tipo de cuantizacion en la perplejidad y en la velocidad con llama.cpp.
- Generacion de datos sinteticos en ingles con filtrado posterior: se puede usar para producir borradores masivos de bajo coste que despues se filtran o corrigen con un modelo mayor, asumiendo la baja calidad individual de cada muestra.
- Pruebas de integracion de infraestructura: sirve como modelo "dummy" realista para validar servidores de inferencia (llama.cpp server, Ollama, TGI) y medir latencias base antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad para el modelo pdjamez/Neeps-125M-Base. Los resultados de la busqueda web realizada no contienen informacion tecnica sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 125,1 M de parametros; los tamanos de fichero publicados por el autor se redondean a 0,2 GB para la mayoria de cuantizaciones y 0,4 GB para f16):
  - Q2_K: aproximadamente 50 MB de pesos.
  - Q4_K_S / Q4_K_M: aproximadamente 70-80 MB de pesos.
  - Q8_0: aproximadamente 130-140 MB de pesos.
  - f16: aproximadamente 250 MB de pesos.
  - A estas cifras hay que sumar el coste del contexto y del estado de la KV cache, que depende de la longitud de contexto configurada (no documentada por el autor).
- GPU recomendadas: no se requiere GPU. El modelo cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090 o iGPUs modernas; tambien en Apple Silicon mediante Metal o el backend MLX.
- Cabe en GPU consumer: si, en todas las GPU consumer con al menos 1 GB de memoria libre, y tambien en CPU sin GPU dedicada.
- Opciones de despliegue: llama.cpp (backend principal del formato GGUF), llama-cpp-python, servidor `llama-server`, Ollama (importando el GGUF mediante un Modelfile), LM Studio, transformers con los safetensors del modelo base, mlx-lm en Apple Silicon y, opcionalmente, vLLM o TGI con el modelo base en safetensors (sobredimensionados para este tamano).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Datos de parametros, contexto y licencia tomados de las fichas publicas de cada modelo; los valores de rendimiento no se incluyen porque no hay benchmarks publicados del modelo de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF | Rendimiento comparado |
|---|---|---|---|---|---|
| Neeps-125M-Base (este repositorio) | 125,1 M | no disponible | Apache-2.0 | Si (12 variantes) | No disponible |
| SmolLM-135M | 135 M | 2048 tokens | Apache-2.0 | Si, por terceros | No disponible |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache-2.0 | Si, por terceros | No disponible |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache-2.0 | Si, por terceros | No disponible |
| GPT-2 (124M) | 124 M | 1024 tokens | MIT | Si, por terceros | No disponible |

Nota: los valores de contexto de los modelos comparados corresponden a los publicados en sus fichas oficiales y pueden variar en implementaciones derivadas. La comparativa se limita a parametros, contexto, licencia y disponibilidad; no es posible comparar calidad sin resultados de benchmarks del modelo Neeps.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni alineado con RLHF o DPO: no responde a ordenes, no mantiene formato de chat y no debe usarse como asistente directo sin un ajuste previo.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso; cualquier flujo de ese tipo requerira entrenamiento adicional.
- Con 125 M de parametros, la coherencia en generaciones largas es limitada y la tasa de texto incoherente o factualmente incorrecto es alta; el riesgo de alucinacion es elevado en tareas de conocimiento.
- Solo declara soporte de ingles. No hay evidencia de capacidades en castellano ni en otros idiomas, por lo que no es adecuado para produccion multilingue.
- La longitud de contexto no esta documentada, lo que impide planificar tareas que dependan de ventanas largas.
- No se han publicado benchmarks, evaluaciones de sesgo ni analisis de seguridad para este modelo ni para su modelo base, por lo que no se puede caracterizar su comportamiento en dominios sensibles.
- Al estar entrenado sobre FineWeb-Edu, puede reproducir sesgos y estereotipos presentes en texto web filtrado por criterios de calidad educativa; no hay evaluacion disponible al respecto.
- La licencia Apache-2.0 del modelo base es permisiva y permite uso comercial, pero el repositorio de cuantizaciones es un artefacto derivado de terceros (mradermacher): conviene verificar la ficha del modelo original antes de un despliegue comercial.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- El repositorio no presenta descargas ni "likes" en la informacion disponible, lo que indica ausencia de validacion por parte de la comunidad; no hay informes de uso en produccion.
- No se han publicado cuantizaciones ponderadas ni con imatrix; el autor indica que podrian no estar planificadas.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Neeps-125M-Base-GGUF
- Modelo base: https://huggingface.co/pdjamez/Neeps-125M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Pagina indice del autor para este modelo: https://hf.tst.eu/model#Neeps-125M-Base-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
