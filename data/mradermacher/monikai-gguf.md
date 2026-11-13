# mradermacher/monikAI-GGUF

## Resumen

monikAI-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Kryptone/monikAI, publicadas por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base es un transformer conversacional de 354.823.168 parametros (aproximadamente 355 millones), orientado a tareas de dialogo en ingles. Su relevancia practica radica en que las cuantizaciones GGUF permiten ejecutar el modelo en CPU y en GPUs de gama baja mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa.

El modelo es de tamano muy reducido, lo que lo situa en la categoria de modelos ligeros para despliegue en el borde (edge) o en entornos con recursos limitados. No se dispone de informacion sobre la arquitectura interna exacta, el proceso de entrenamiento ni los datos utilizados, ya que la model card del cuantizador se limita a describir el proceso de conversion y a listar los ficheros generados. La licencia no esta especificada en la informacion disponible, lo que constituye una limitacion importante para uso comercial.

La ficha se centra en lo que se puede verificar: el conjunto de cuantizaciones disponibles, el tamano del modelo, el idioma declarado (ingles) y las opciones de despliegue. Cualquier dato sobre rendimiento, capacidades especificas o entrenamiento debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 354.823.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales del modelo base en safetensors |
| Tamano del repo | 3.4 GB |
| Modelo base | Kryptone/monikAI |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Kryptone/monikAI mas alla de que se trata de un transformer de aproximadamente 355 millones de parametros, segun el recuento de safetensors. La model card del cuantizador no incluye detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion relevante es que el modelo esta etiquetado como conversacional y que su idioma declarado es el ingles. El trabajo de mradermacher consiste exclusivamente en la conversion a GGUF y la generacion de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin modificaciones en los pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del modelo.
- Ejecucion local en CPU y GPU mediante llama.cpp y herramientas compatibles con GGUF.
- Despliegue en entornos con recursos muy limitados gracias a su reducido tamano (desde 0,3 GB en Q2_K).
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No hay informacion disponible sobre capacidades multilingues mas alla del ingles.
- No hay informacion disponible sobre modos especiales (thinking, vision, audio) ni sobre capacidades de codigo o matematicas.

## Casos de uso

- Prototipado rapido de chatbots locales: el modelo puede ejecutarse en un portatil convencional con la cuantizacion Q4_K_M (0,3 GB), lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Asistentes conversacionales embebidos en aplicaciones de escritorio o moviles: su tamano reducido permite integrarlo en binarios ligeros mediante llama.cpp, con requisitos de memoria minimos.
- Filtrado y clasificacion de texto en el borde: al ser un modelo pequeno, puede desplegarse en dispositivos con poca RAM para tareas de preprocesamiento o etiquetado simple en ingles.
- Educacion y experimentacion: util como modelo de referencia para aprender a cuantizar, desplegar y evaluar modelos GGUF en entornos docentes o de investigacion con presupuesto limitado.
- Generacion de respuestas en entornos sin conectividad: al poder ejecutarse completamente en local, es adecuado para aplicaciones offline que requieran un componente conversacional basico en ingles.
- Pruebas de integracion en pipelines de llama.cpp u Ollama: sirve como modelo de juguete para validar infraestructura de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K, Q3_K_S, IQ4_XS, Q4_K_S, Q4_K_M) y 0,8 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU de consumo actual (GTX 1050, RTX 3060, RTX 4090, etc.) y en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, etc.). El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia muy baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| monikAI-GGUF | 354,8 M | no disponible | no disponible | GGUF | Cuantizaciones de Kryptone/monikAI, solo ingles |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, con versiones instruct y base |
| SmolLM2-360M | 362 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Entrenado en 4 billones de tokens, multilingue parcial |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamano, contexto corto |

La comparativa se ofrece como referencia de categoria (modelos por debajo de 1.000 millones de parametros); no se dispone de datos de rendimiento de monikAI que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo base (Kryptone) antes de utilizarlo en produccion.
- Solo soporta ingles segun la etiqueta del modelo; no hay evidencia de capacidades en castellano u otros idiomas.
- No hay informacion sobre sesgos, datos de entrenamiento ni proceso de alineacion, lo que impide evaluar riesgos de sesgo o toxicidad.
- Riesgo de alucinacion desconocido pero previsible en un modelo de este tamano; no se recomienda para tareas que requieran precision factual sin verificacion.
- No se dispone de informacion sobre la longitud de contexto, lo que limita el diseno de aplicaciones que dependan de ventanas largas.
- El modelo base tiene muy pocas descargas (89 en el momento de la consulta) y cero likes, lo que sugiere poca validacion por parte de la comunidad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No hay garantias de mantenimiento o soporte por parte del autor del modelo base ni del cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/monikAI-GGUF
- Modelo base: https://huggingface.co/Kryptone/monikAI
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/monikAI-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#monikAI-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
