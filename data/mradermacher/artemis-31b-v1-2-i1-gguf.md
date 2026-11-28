# mradermacher/Artemis-31B-v1.2-i1-GGUF

## Resumen

Artemis-31B-v1.2-i1-GGUF es la distribucion en formato GGUF, con cuantizacion ponderada mediante imatrix, del modelo Artemis-31B-v1.2 desarrollado por TheDrummer. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y ofrece un abanico amplio de niveles de compresion (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB) pensados para ejecutar el modelo en llama.cpp y derivados.

El modelo base cuenta con 30.697.345.596 parametros (aproximadamente 31B) y se distribuye bajo la libreria transformers con etiquetas de modelo conversacional y de vision. La model card indica explicitamente que se trata de un modelo de vision, de modo que los ficheros mmproj, si existen, se alojan en el repositorio estatico complementario. El idioma declarado es unicamente ingles.

La relevancia de esta ficha radica en que permite desplegar un modelo de 31B en hardware de consumo mediante cuantizaciones agresivas, manteniendo la posibilidad de usar cuantizaciones de mayor calidad (Q5_K_M, Q6_K) en GPUs profesionales. El repositorio acumula 10.650 descargas, lo que indica un uso real por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer conversacional; detalles no publicados en la informacion disponible) |
| Parametros totales | 30.697.345.596 (aprox. 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; tambien cuantizaciones estaticas en el repo Artemis-31B-v1.2-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero imatrix separado de 0,1 GB para crear cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base TheDrummer/Artemis-31B-v1.2 en la documentacion proporcionada. Los metadatos de la model card de cuantizacion indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que el proceso parte de pesos en formato Hugging Face convertidos a GGUF. El tag `imatrix` y la presencia de un fichero `.imatrix.gguf` indican que las cuantizaciones i1 se generaron con una matriz de importancia calculada sobre datos de calibracion, lo que mejora la calidad frente a cuantizaciones estaticas del mismo tamano.

El modelo base se distribuye con la etiqueta de modelo conversacional y de vision, por lo que cabe esperar un transformer multimodal con capacidad de procesar imagenes, aunque no se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del modelo base.
- Procesamiento de vision: la model card declara explicitamente que es un modelo de vision; los ficheros mmproj necesarios se alojan en el repositorio estatico Artemis-31B-v1.2-GGUF.
- Razonamiento y generacion de codigo: no confirmado de forma explicita en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 31B en una estacion de trabajo con GPU de consumo: usando la cuantizacion i1-Q4_K_M (18,8 GB) el modelo cabe en GPUs de 24 GB de VRAM, permitiendo conversaciones multi-turno sin depender de servicios en la nube.
- Analisis de imagenes en local: al ser un modelo de vision, combinado con el fichero mmproj del repositorio estatico, puede emplearse para describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas en entornos con requisitos de privacidad.
- Prototipado rapido en llama.cpp u Ollama: las cuantizaciones Q4_K_S (17,9 GB) y Q4_K_M (18,8 GB) estan marcadas por el autor como optimas en relacion tamano/velocidad/calidad, lo que las hace adecuadas para iterar sobre prompts y flujos conversacionales.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix y la bateria completa de niveles permiten medir la degradacion de perplejidad entre IQ2, IQ3, IQ4 y Q6 en un mismo modelo, util para decidir el compromiso calidad/memoria en produccion.
- Generacion de contenido en ingles con requisitos de soberania de datos: al ejecutarse en infraestructura propia y no requerir conexion externa, encaja en entornos con restricciones de confidencialidad.
- Fine-tuning ligero o experimentacion sobre el modelo base: los pesos GGUF no son ideales para entrenamiento, pero sirven para validar el comportamiento del modelo base antes de invertir en el modelo completo en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el fichero GGUF debe residir en memoria, mas overhead de contexto y cache KV):
  - i1-IQ1_S: 7,3 GB.
  - i1-IQ2_M: 11,0 GB.
  - i1-IQ3_S: 13,9 GB.
  - i1-IQ4_XS: 16,8 GB.
  - i1-Q4_K_M: 18,8 GB.
  - i1-Q5_K_M: 21,9 GB.
  - i1-Q6_K: 25,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q6_K con contextos largos y mayor paralelismo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 12-16 GB solo con IQ1/IQ2/IQ3, con perdida notable de calidad segun el propio autor.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo de vision se requiere el fichero mmproj del repositorio estatico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-i1-GGUF (este) | 30,7B | no disponible | GGUF + imatrix | no disponible | Vision, solo ingles, 23 niveles de cuantizacion i1 |
| Artemis-31B-v1.2-GGUF (estatico, mradermacher) | 30,7B | no disponible | GGUF | no disponible | Mismas cuantizaciones sin imatrix; aloja mmproj |
| TheDrummer/Artemis-31B-v1.2 (base) | 30,7B | no disponible | safetensors | no disponible | Pesos originales en transformers |
| Otros modelos de ~30B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language`; el rendimiento en castellano no esta garantizado.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial; es imprescindible consultar la ficha del modelo base TheDrummer/Artemis-31B-v1.2 antes de desplegarlo en produccion.
- Las cuantizaciones IQ1 e IQ2 conllevan degradacion de calidad significativa; el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality".
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no hay datos de evaluacion que permitan acotarlo.
- Al ser un modelo de vision, requiere ficheros mmproj adicionales alojados en otro repositorio, lo que complica el despliegue y la reproducibilidad.
- No se documentan sesgos conocidos, longitud de contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para dominios especializados.
- El repositorio ocupa 334,8 GB en total; conviene descargar solo el fichero GGUF necesario en lugar de clonar el repositorio completo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Artemis-31B-v1.2-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Artemis-31B-v1.2-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Artemis-31B-v1.2-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
