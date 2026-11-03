# mradermacher/Qwen3.5-9B-Wikipedia-TR-Reasoning-GGUF

## Resumen

Qwen3.5-9B-Wikipedia-TR-Reasoning-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo zero9tech/Qwen3.5-9B-Wikipedia-TR-CPT. Se trata de un ajuste por continued pre-training (CPT) sobre una base Qwen3.5 de 9B, especializado en lengua turca y entrenado con el corpus wikimedia/wikipedia. El resultado es un modelo conversacional orientado a generacion de texto y razonamiento en turco, con 8.953.803.264 parametros totales (aproximadamente 8,95B).

El modelo resuelve el problema de disponer de un LLM de ~9B con buen dominio del turco en entornos donde no se puede servir el modelo original en formato transformers, ya sea por limitaciones de VRAM o por necesitar despliegue en CPU. Las cuantizaciones cubren desde Q2_K (3,9 GB) hasta f16 (18,0 GB), lo que permite ejecutarlo en hardware muy diverso, desde portatiles con 8 GB de RAM hasta estaciones con GPU de 24 GB.

Es relevante ahora porque combina tres factores poco frecuentes: una base Qwen3.5 reciente, un proceso de CPT sobre Wikipedia en turco y un empaquetado GGUF listo para llama.cpp/Ollama. La licencia Apache 2.0 facilita su uso comercial, aunque el autor no publica detalles sobre el dataset de CPT ni sobre el proceso de razonamiento mas alla del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5), ajuste por continued pre-training (CPT) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | Turco (tr); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de aproximadamente 9B parametros, sobre la que se aplico continued pre-training (CPT) usando el dataset wikimedia/wikipedia en turco. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron fases posteriores de RLHF, DPO o SFT. El nombre del repositorio incluye "Reasoning", pero la model card no documenta ningun proceso especifico de entrenamiento en razonamiento ni datos de benchmarks que lo respalden.

La innovacion tecnica principal de esta publicacion no esta en el entrenamiento, sino en el empaquetado: mradermacher genera cuantizaciones estaticas (sin imatrix) en 12 tipos distintos, incluyendo dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal. El autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de la publicacion. El proceso de conversion se realizo desde formato HF a GGUF (convert_type: hf) con quantize_version 2 y output_tensor_quantised 1.

## Capacidades

- Generacion de texto conversacional en turco, con especial cobertura de vocabulario enciclopedico por el CPT sobre Wikipedia.
- Razonamiento de un solo turno y multi-turno, segun el nombre del repositorio (no verificado con benchmarks).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre "Reasoning" sugiere capacidad, pero no hay evidencia en la model card.
- Capacidades multilingues: limitadas al turco segun el campo `language: tr`; el resto de idiomas no disponible.
- Capacidades multimodales: los ficheros mmproj-Q8_0 y mmproj-f16 indican soporte de entrada multimodal a traves de llama.cpp, aunque no se detalla que modalidades cubre.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en turco: el modelo puede gestionar conversaciones multi-turno en turco con un coste de inferencia bajo gracias a las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB), adecuadas para servir en una unica GPU consumer.
- Generacion de contenido enciclopedico y articulos: el CPT sobre Wikipedia en turco lo hace util para redactar borradores, resumenes y fichas de caracter divulgativo en turco, con la cautela de verificar datos facticos por riesgo de alucinacion.
- Procesamiento de documentos turcos en local: con Q8_0 (9,6 GB) se puede desplegar en una RTX 4090 o A100 para tareas de extraccion, resumen y reescritura sin enviar datos a la nube.
- Educacion y tutoria en turco: generacion de explicaciones, ejercicios y correcciones en turco, con despliegue en portatiles mediante Q4_K_S (5,5 GB) y llama.cpp.
- Prototipado rapido de asistentes conversacionales: al estar en GGUF, se integra directamente en Ollama o llama.cpp sin necesidad de infraestructura de transformers, lo que acelera la experimentacion.
- Investigacion sobre CPT y adaptacion linguistica: sirve como referencia para estudiar el efecto del continued pre-training sobre Wikipedia en un modelo de ~9B, comparando las distintas cuantizaciones.
- Despliegue en CPU para entornos sin GPU: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecucion en CPU con RAM moderada, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado de 1-2 GB para contexto y KV cache):
  - Q2_K: ~3,9 GB de pesos; ~5-6 GB en total.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,4-5,0 GB de pesos; ~6-7 GB en total.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~5,3-5,7 GB de pesos; ~7-8 GB en total.
  - Q5_K_S / Q5_K_M: ~6,4-6,6 GB de pesos; ~8-9 GB en total.
  - Q6_K: ~7,5 GB de pesos; ~9-10 GB en total.
  - Q8_0: ~9,6 GB de pesos; ~11-12 GB en total.
  - f16: ~18,0 GB de pesos; ~20 GB en total.
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4060 Ti 16 GB: Q4_K_M, Q5_K_M y Q6_K sin problemas.
  - RTX 4090 24 GB: Q8_0 y f16 con margen amplio.
  - A100 40/80 GB y H100: f16 con contexto largo y batch elevado.
- Cabe en GPU consumer: si, desde Q2_K hasta Q8_0 en tarjetas de 8-16 GB; f16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, Q4_K_S y Q4_K_M estan marcados por el autor como "fast, recommended", y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wikipedia-TR-Reasoning-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas de un CPT en turco |
| zero9tech/Qwen3.5-9B-Wikipedia-TR-CPT (modelo base) | ~8,95B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Base Qwen3.5 de ~9B (sin CPT) | ~9B | no disponible | Apache 2.0 (segun Qwen) | safetensors | Mayor cobertura multilingue, menor especializacion en turco |
| Otros GGUF de ~9B en turco | no disponible | no disponible | no disponible | GGUF | No se dispone de comparativas publicadas |

## Limitaciones y advertencias

- Sesgos conocidos: el CPT sobre Wikipedia en turco puede heredar el sesgo de cobertura y punto de vista del corpus enciclopedico (sobrerrepresentacion de temas con articulos extensos, infrarepresentacion de tematicas locales o minoritarias).
- Riesgo de alucinacion: alto en tareas facticas, ya que no se documenta un post-entrenamiento con RLHF/DPO ni verificacion de datos. El nombre "Reasoning" no garantiza precision.
- Limitaciones de contexto: la longitud de contexto no esta documentada; no se debe asumir la del Qwen3.5 base sin verificacion.
- Limitaciones de idioma: el modelo esta etiquetado unicamente como turco (`language: tr`); su rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion; verificar tambien la licencia del modelo base Qwen3.5.
- Caveats para produccion: las cuantizaciones son estaticas (sin imatrix), por lo que la calidad en Q2_K y Q3 puede degradarse mas que en cuantizaciones ponderadas; los ficheros mmproj no estan documentados en cuanto a modalidades soportadas; no hay benchmarks publicados que respalden el rendimiento.
- El repositorio ocupa 83 GB, lo que implica descargas parciales (elegir un unico fichero GGUF) en lugar de clonar el repo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-9B-Wikipedia-TR-Reasoning-GGUF
- Modelo base (CPT): https://huggingface.co/zero9tech/Qwen3.5-9B-Wikipedia-TR-CPT
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.5-9B-Wikipedia-TR-Reasoning-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
