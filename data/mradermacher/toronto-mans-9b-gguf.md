# mradermacher/Toronto-Mans-9B-GGUF

## Resumen

Toronto-Mans-9B-GGUF es el repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo devon7y/Toronto-Mans-9B, un ajuste fino de 8.953.803.264 parametros (aproximadamente 9B) orientado a conversacion con una persona ("persona") que reproduce el argot y el registro del ingles multicultural de Toronto. El repositorio no contiene pesos en safetensors ni el modelo original: es exclusivamente una coleccion de 12 ficheros GGUF con distintos niveles de cuantizacion, desde Q2_K (3,9 GB) hasta f16 (18,0 GB), pensados para inferencia local.

El modelo base parte de la familia Qwen3.5 (etiqueta `qwen3.5` en el repo y enlace de licencia al modelo Qwen/Qwen3.5-9B) y fue entrenado mediante LoRA sobre el dataset devon7y/toronto-slang-lexicon, segun los metadatos de la model card. El resultado es un modelo especializado en un unico idioma (ingles) y un unico registro linguistico, no un modelo de proposito general.

Su relevancia practica es la de una utilidad de nicho: permite desplegar en hardware de consumo un modelo de ~9B afinado para un dialecto muy concreto, con licencia declarada apache-2.0. Conviene senalar que el repositorio no incluye resultados de benchmarks, no declara longitud de contexto y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita. La etiqueta `qwen3.5` y el enlace de licencia a Qwen/Qwen3.5-9B indican que deriva de la familia Qwen3.5; el modelo base es devon7y/Toronto-Mans-9B, un ajuste LoRA sobre dicha familia |
| Parametros totales | 8.953.803.264 (dato real, safetensors del modelo base) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0, con `license_link` apuntando a https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE |
| Formato de pesos | GGUF (este repositorio). El modelo base se distribuye en safetensors |
| Tamano del repositorio | 81,4 GB (conjunto completo de cuantizaciones) |
| Dataset de ajuste | devon7y/toronto-slang-lexicon |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos publicados en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros). Lo unico verificable son los metadatos de la model card: el modelo base es devon7y/Toronto-Mans-9B, esta etiquetado como `lora` y `qwen3.5`, y se entreno sobre el dataset devon7y/toronto-slang-lexicon, un lexico de argot de Toronto. No se documenta si el adaptador LoRA se fusiono con los pesos base antes de la cuantizacion, aunque el hecho de que los ficheros GGUF tengan el tamano esperado para un modelo denso de ~9B sugiere que si se fusiono.

En cuanto al proceso de este repositorio, mradermacher aplico cuantizacion estatica (los comentarios internos del README indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`). El autor indica explicitamente que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de publicar, y que si no aparecen en la semana siguiente probablemente no las planee. Esto implica que las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar mas la perplejidad que una version imatrix equivalente.

## Capacidades

- Generacion de texto conversacional en ingles, con un registro linguistico especifico: argot y expresiones del ingles multicultural de Toronto.
- Interpretacion de un rol o persona fija (`persona`, `chat`, `conversational` en las etiquetas del repositorio).
- Conversacion multi-turno, segun la etiqueta `chat`. No se especifica la ventana de contexto soportada.
- Capacidades de la familia Qwen3.5 subyacente (razonamiento, codigo, matematicas) potencialmente presentes de forma residual, pero no documentadas ni evaluadas para este ajuste concreto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`. No se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de personajes conversacionales locales: el modelo puede desplegarse en llama.cpp u Ollama para generar respuestas con un acento y vocabulario muy marcados de Toronto, util para experimentar con diseno de personas antes de invertir en un ajuste propio.
- Investigacion en sociolinguistica computacional: permite estudiar como un modelo de ~9B reproduce variacion dialectal concreta y sirve de linea base para medir fidelidad de registro frente a modelos de proposito general.
- Generacion de dialogos para guiones y ficcion ambientada en Toronto: el ajuste permite obtener lineas de dialogo con vocabulario local sin necesidad de prompting extenso.
- Moderacion y normalizacion de texto coloquial: usar el modelo como referencia de vocabulario para detectar o traducir expresiones de argot en un pipeline previo a un clasificador.
- Chatbot de nicho para comunidades locales: desplegado integramente en local, permite conversaciones tematicas sin enviar datos a terceros, algo relevante cuando el contenido es sensible.
- Pruebas de cuantizacion extrema: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, lo que permite medir el impacto de Q2_K frente a Q8_0 en tareas de generacion creativa y conversacional.
- Evaluacion comparativa de ajustes LoRA: sirve como caso de estudio de cuanto retiene un modelo de 9B de sus capacidades generales tras un ajuste de dominio tan estrecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (pesos, sin contar cache KV ni overhead del runtime):
  - Q2_K: 3,9 GB
  - Q3_K_S: 4,4 GB; Q3_K_M: 4,7 GB; Q3_K_L: 5,0 GB
  - IQ4_XS: 5,3 GB; Q4_K_S: 5,5 GB; Q4_K_M: 5,7 GB
  - Q5_K_S: 6,4 GB; Q5_K_M: 6,6 GB
  - Q6_K: 7,5 GB
  - Q8_0: 9,6 GB
  - f16: 18,0 GB
- Anadiendo cache KV y overhead del runtime, se puede estimar en la practica: unos 7-8 GB para Q4_K_M, unos 9-10 GB para Q5_K_M, unos 12 GB para Q8_0 y 20 GB o mas para f16 con contexto largo. Estas cifras son estimaciones a partir de los tamanos de fichero; la longitud de contexto real del modelo no esta declarada.
- Cabe en GPU de consumo: si. RTX 3060 12 GB puede ejecutar Q4_K_M y Q5_K_M holgadamente; RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB admiten hasta Q8_0; RTX 3090 y RTX 4090 (24 GB) ejecutan cualquier cuantizacion, incluida f16 con contexto moderado.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB. Para un modelo de 9B son sobredimensionadas salvo que se busque batch alto o contexto muy largo.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, KoboldCpp, text-generation-webui). vLLM tiene soporte de GGUF experimental. TGI no soporta GGUF. El README remite a los README de TheBloke para detalles de uso, incluida la concatenacion de ficheros multiparte.
- Latencia y throughput: no disponibles. Dependen de la cuantizacion, la GPU y la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Toronto-Mans-9B-GGUF | 8,95B | No disponible | GGUF (12 cuantizaciones) | Apache 2.0 con license_link a Qwen3.5-9B | Solo ingles, ajuste de argot de Toronto |
| devon7y/Toronto-Mans-9B | 8,95B | No disponible | Safetensors (presumiblemente) | Apache 2.0 | Modelo base sin cuantizar |
| Qwen/Qwen3.5-9B | No disponible en la informacion proporcionada | No disponible | No disponible | Licencia propia referenciada por el autor | Modelo de proposito general del que deriva la familia |
| Otros modelos de ~9B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada para construir una comparativa de rendimiento |

## Limitaciones y advertencias

- Especializacion extrema: el ajuste esta orientado a un unico dialecto urbano y a un registro coloquial. Fuera de ese dominio, el comportamiento puede degradarse de forma notable respecto al modelo base.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto no declarado: se desconoce la ventana de contexto efectiva, lo que dificulta dimensionar cache KV y planificar conversaciones largas.
- Riesgo de alucinacion: no hay evaluaciones publicadas, ni de fidelidad factual ni de tasas de alucinacion. Un ajuste LoRA tan especifico sobre un dataset de lexico puede aumentar la tendencia a inventar terminos o significados.
- Sesgos: al entrenarse sobre un lexico de argot de una comunidad concreta, el modelo puede reproducir estereotipos asociados a esa comunidad. No se documenta ningun proceso de mitigacion de sesgos.
- Licencia: el repositorio declara Apache 2.0, pero el campo `license_link` apunta a la licencia de Qwen/Qwen3.5-9B. Al tratarse de un modelo derivado, conviene verificar los terminos de la licencia del modelo base antes de un uso comercial, ya que pueden imponer condiciones adicionales (atribucion, restricciones de uso, etc.).
- Ausencia de validacion comunitaria: el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que no hay evidencia de terceros sobre su calidad o estabilidad.
- Cuantizaciones sin imatrix: el autor indica que no hay versiones ponderadas o imatrix. Los niveles Q2_K y Q3_K_S pueden presentar perdida de calidad superior a la habitual en cuantizaciones equivalentes con imatrix.
- Sin benchmarks: no se puede comparar objetivamente con alternativas, ni verificar cuanto del rendimiento del modelo base se conserva tras el ajuste y la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Toronto-Mans-9B-GGUF
- Modelo base: https://huggingface.co/devon7y/Toronto-Mans-9B
- Dataset de ajuste: https://huggingface.co/datasets/devon7y/toronto-slang-lexicon
- Licencia referenciada por el autor: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#Toronto-Mans-9B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
