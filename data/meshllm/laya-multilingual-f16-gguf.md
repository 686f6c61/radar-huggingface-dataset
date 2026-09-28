# meshllm/laya-multilingual-F16-GGUF

## Resumen

`meshllm/laya-multilingual-F16-GGUF` es una conversión a formato GGUF en precisión F16 del modelo `convaiinnovations/laya-multilingual`, publicada por el usuario meshllm. No se trata de un checkpoint nuevo ni de un entrenamiento propio: la model card indica explícitamente que es una "fixture de test" para las pruebas de humo portables del componente System One de MeshLLM. Los pesos subyacentes son los del modelo original de ConvAI Innovations, con licencia Apache-2.0.

El modelo base pertenece a la familia Laya, descrita por su autor como un "System 1 decision engine" multilingüe de pesos abiertos. Según las etiquetas del ecosistema Laya recogidas en repositorios relacionados, la arquitectura subyacente es de tipo mmBERT (encoder transformer), con una tarea principal de extracción de características y clasificación más que de generación de texto. El recuento real de parámetros en safetensors es de 321.908.995 (aproximadamente 322 M), y el fichero GGUF F16 ocupa 658.805.088 bytes (unos 0,61 GiB), dentro de un repositorio de 0,7 GB.

Su relevancia es acotada y conviene entenderla bien: sirve para validar la integración de modelos Laya en la pila de llama.cpp parcheada por MeshLLM y para desplegar el motor de decisión Laya en entornos llama.cpp sin necesidad de GPU dedicada. No es un modelo de propósito general ni un sustituto de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo mmBERT (segun etiquetas del ecosistema Laya); tarea declarada de feature-extraction / text-classification |
| Parametros totales | 321.908.995 (aproximadamente 322 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repositorio: F16. En el ecosistema Laya existen ademas Q8_0, Q6_K y Q4_K_M (publicados por terceros) |
| Idiomas soportados | Mas de 100 idiomas segun el sitio oficial de Laya; lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16), compatible con llama.cpp segun el layout propio de Laya |
| Tamano del fichero | 658.805.088 bytes |
| SHA-256 de salida | 03881e45cdc5d0cf5e3a841cafe2ebdb8280e53e113c489e6847f7f45ca9c139 |
| Modelo base | convaiinnovations/laya-multilingual (revision 4bb4d65403a3a7b8abd9e6876ccb5e75cf923b5c) |

## Arquitectura y entrenamiento

El modelo base Laya Multilingual es, segun la descripcion publica de ConvAI Innovations, un motor de decision de "Sistema 1": un componente de respuesta rapida (latencia declarada inferior a 35 ms, con 33 ms citados en su web) orientado a enrutamiento y clasificacion mas que a generacion autoregresiva. Las etiquetas de repositorios derivados lo clasifican como mmBERT, es decir, un encoder transformer, con pipeline de feature-extraction en este repositorio y de text-classification en otras conversiones. La informacion disponible cita el uso de RLCD (aprendizaje por refuerzo con datos contrastivos) y de "trayectorias de conversion de secuencia", descritas en un articulo de arXiv de marzo de 2025, como parte del proceso de alineacion del modelo.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas por proporcion ni las etapas concretas de post-entrenamiento (RLHF, DPO u otras) mas alla de la mencion a RLCD. Tampoco se detalla la innovacion de calibracion que el autor reivindica como estado del arte.

Respecto a este repositorio concreto, no hay entrenamiento alguno: la model card documenta un proceso de conversion con `convert_hf_to_gguf.py --outtype f16`, fijado a un commit concreto de llama.cpp (`8212c7802455255460ab8e18fc34754560031b34`) y a un arbol parcheado (`34abd2f5c4cb393a92921d881b1691c87276c9d0`). La unica modificacion aplicada al modelo original es la eliminacion del campo redundante `extra_special_tokens` de `tokenizer_config.json`, que el pin de Transformers espera como mapa y no como lista; los tokens permanecen en `tokenizer.json` y los pesos no se alteran.

## Capacidades

- Clasificacion de texto y extraccion de caracteristicas: es la tarea declarada del modelo (`feature-extraction` en esta ficha, `text-classification` en conversiones equivalentes).
- Decision de "Sistema 1": respuestas rapidas de enrutamiento o seleccion entre opciones, no generacion libre de texto.
- Enrutamiento multilingue: el autor declara cobertura de mas de 100 idiomas.
- Calibracion de probabilidades: la web oficial de Laya reivindica calibracion de estado del arte, lo que resulta relevante cuando se usan las probabilidades de salida para umbrales de decision.
- Inferencia en CPU/edge mediante llama.cpp, con un fichero F16 de menos de 700 MB.
- No dispone de generacion de texto, razonamiento de multiples pasos, generacion de codigo, matematicas, vision, audio, tool calling ni function calling segun la informacion disponible.

## Casos de uso

- Enrutamiento de idioma en pipelines multilingues: el modelo puede actuar como primer nivel que determine en que idioma viene una consulta antes de derivarla al modelo generativo o al servicio correspondiente, gracias a su cobertura declarada de mas de 100 idiomas y a su baja latencia.
- Clasificacion de intencion en sistemas de dialogo: al ser un encoder de 322 M con salida calibrada, encaja como clasificador de intenciones en un asistente conversacional, por delante del LLM que redacta la respuesta final.
- Moderacion y filtrado previo: uso como filtro rapido de contenido en un pipeline de entrada, aprovechando el coste computacional bajo y la posibilidad de ejecutarlo en CPU.
- Preprocesado en arquitecturas de agentes: utilizacion como "gatekeeper" que decide si una consulta requiere llamada a herramienta, recuperacion documental o respuesta directa, sin invocar un modelo mayor.
- Validacion continua (CI) de integraciones llama.cpp: es el proposito declarado de este repositorio, servir de fixture de pruebas de humo reproducibles para la pila parcheada de MeshLLM, con SHA-256 y revisiones fijadas.
- Despliegue en dispositivos sin GPU: con 658 MB en F16, el modelo cabe en entornos de borde, portatiles modestos o contenedores con memoria limitada, y puede ejecutarse con llama.cpp.
- Extraccion de embeddings para busqueda semantica ligera: al declararse como modelo de feature-extraction, puede emplearse para generar representaciones vectoriales de texto multilingue en sistemas de recuperacion de baja escala.
- Analisis por lotes de grandes volumenes de texto: el coste por inferencia es bajo comparado con un LLM generativo, lo que permite clasificar corpus completos de forma economicamente viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica cifra de rendimiento mencionada en las fuentes es la latencia declarada por el autor del modelo base (33 ms, inferior a 35 ms en la descripcion general del motor Laya), pero no viene acompanada de una tabla de benchmarks reproducible ni de condiciones de medicion detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en F16 (658 MB de pesos mas overhead de contexto y runtime). Las cuantizaciones de terceros reducen el peso del fichero, aunque los valores exactos no estan disponibles.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; no se necesita A100, H100 ni similares. Una GTX 1650, RTX 3050 o incluso una GPU integrada reciente pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en muchos sistemas sin GPU dedicada, ejecutando en CPU.
- Opciones de despliegue: llama.cpp es la via documentada. El ecosistema Laya cuenta con un runner propio (`laya.exe` en el repositorio `monatis/ggmlc`) y con conversiones GGUF publicadas por terceros. No se documenta soporte especifico para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles, salvo la latencia declarada de 33-35 ms para el modelo base en condiciones no especificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meshllm/laya-multilingual-F16-GGUF | 322 M | no disponible | GGUF F16, layout parcheado de MeshLLM | Apache-2.0 | Repositorio publico, 0 descargas, 0 likes |
| convaiinnovations/laya-multilingual | no disponible (mismo modelo base) | no disponible | Pesos originales en safetensors | Apache-2.0 | Repositorio upstream |
| fr0stbit3/laya-multilingual-gguf | no disponible | no disponible | GGUF F16 mas cuantizaciones Q8_0, Q6_K y Q4_K_M | Apache-2.0 (heredada) | Publico; segun el autor, probado solo con un ejemplo y con deriva apreciable en Q4_K_M |
| Weidows/laya-multilingual-GGUF | no disponible | no disponible | GGUF para llama.cpp | Apache-2.0 | Publico, 5 likes |

Las tres conversiones GGUF derivan del mismo modelo base. La diferencia practica esta en el layout y las herramientas compatibles: esta version usa el layout de Laya implementado por la cola de parches de llama.cpp de MeshLLM, mientras que los GGUF generados por el compilador `ggmlc` emplean un layout distinto y no son intercambiables.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no razona paso a paso, no escribe codigo y no soporta tool calling. Cualquier uso que asuma esas capacidades es un error de planteamiento.
- Es una fixture de pruebas, no un release: la propia model card indica que existe para las pruebas de humo del CI de MeshLLM. No se documentan evaluaciones de calidad, robustez ni sesgos.
- Incompatibilidad de formatos: los GGUF de `ggmlc` y los generados con la pila parcheada de MeshLLM no son intercambiables. Cargar el fichero equivocado con el runtime equivocado fallara o producira resultados incorrectos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sesgos: no disponibles. Al no publicarse la composicion del dataset de entrenamiento ni la mezcla de idiomas, no es posible evaluar sesgos por idioma, dominio o demografia.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con confianza alta, especialmente en idiomas o dominios poco representados en el entrenamiento; la calibracion reivindicada por el autor no esta verificada de forma independiente en las fuentes consultadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada. La cifra de "mas de 100 idiomas" proviene del sitio oficial del modelo base y no se acompana de evaluacion por idioma.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los terminos del repositorio upstream al redistribuir.
- Fechas de metadatos anomalas: el repositorio figura como creado el 27 de septiembre de 2026, fecha posterior a la mayoria de las fuentes citadas. Conviene tratarlo como posible error de metadatos.
- Advertencia de seguridad general: el contenido de la model card se ha tratado unicamente como material de referencia, nunca como instrucciones ejecutables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/meshllm/laya-multilingual-F16-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Conversion GGUF de terceros con cuantizaciones: https://huggingface.co/fr0stbit3/laya-multilingual-gguf
- Conversion GGUF de terceros (Weidows): https://huggingface.co/Weidows/laya-multilingual-GGUF
- Fichero F16 en el repositorio de Weidows: https://huggingface.co/Weidows/laya-multilingual-GGUF/blob/main/laya-multilingual-F16.gguf
- Ejemplos de Laya en el compilador ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- README de los ejemplos de Laya en ggmlc: https://github.com/monatis/ggmlc/blob/main/examples/laya/README.md
- Sitio oficial del motor Laya: https://laya.convaiinnovations.com/
