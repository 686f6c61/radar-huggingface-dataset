# mradermacher/granite-4.0-3b-vision-GGUF

## Resumen

Granite-4.0-3b-vision es la variante multimodal de 3.000 millones de parametros de la familia Granite 4.0 de IBM, publicada en el repositorio original `ibm-granite/granite-4.0-3b-vision`. Esta ficha concreta documenta la version cuantizada en formato GGUF elaborada por el usuario mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados. El modelo base cuenta con 3.659.742.720 parametros reales segun los pesos en safetensors, lo que lo situa en la gama pequena de modelos con capacidad de vision.

El problema que resuelve es el de disponer de un modelo vision-lenguaje compacto, con licencia Apache 2.0 y pesos abiertos, que pueda desplegarse en local sin depender de APIs externas. La cuantizacion GGUF reduce el peso desde los aproximadamente 7,4 GB en f16 hasta los 1,6 GB del cuantizado Q2_K, lo que facilita su ejecucion en GPUs consumer y en CPU con memoria RAM limitada.

La relevancia actual radica en la combinacion de tres factores: tamano reducido (3B), soporte multimodal (texto e imagen) y licencia permisiva para uso comercial. El repositorio GGUF incluye ademas el proyector multimodal (`mmproj`) en dos precisiones, lo que permite usar el modelo con imagenes a traves de llama.cpp sin necesidad de convertir los pesos manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; detalles no publicados en la informacion disponible) |
| Parametros totales | 3.659.742.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la denominacion y la familia a la que pertenece (Granite 4.0 de IBM), se trata de un transformer multimodal que combina un codificador de vision con un modelo de lenguaje, aunque los detalles concretos de capas, atencion o composicion del dataset de entrenamiento no estan publicados en la informacion disponible.

Respecto al proceso de cuantizacion, el autor indica que se trata de "static quants" generados con `quantize_version: 2` y `output_tensor_quantised: 1`, con conversion de tipo `hf`. No se especifica si se aplicaron tecnicas de calibracion con imatrix en este repositorio; el autor remite a un repositorio separado (`granite-4.0-3b-vision-i1-GGUF`) para las cuantizaciones ponderadas con imatrix. Tampoco se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion del corpus de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes combinadas con texto (multimodal), gracias a los ficheros `mmproj` incluidos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- Ejecucion en local mediante llama.cpp y derivados al estar en formato GGUF.
- Capacidad de razonamiento y codigo: no confirmada explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede recibir una imagen junto con una instruccion de texto y generar una descripcion, aprovechando el proyector multimodal incluido en el repositorio. Es adecuado para entornos con requisitos de privacidad donde no se pueden enviar imagenes a APIs externas.
- Asistente de accesibilidad: integrado en aplicaciones de escritorio o moviles, puede narrar el contenido de imagenes al usuario. Su tamano de 3B y las cuantizaciones de 1,6 a 2,3 GB permiten ejecutarlo en equipos sin GPU dedicada.
- Procesamiento por lotes de documentos escaneados: en pipelines de digitalizacion, el modelo puede extraer informacion de capturas o formularios combinando vision y texto, ejecutandose en servidores con CPU o GPUs modestas.
- Prototipado rapido de aplicaciones vision-lenguaje: al estar en GGUF y con licencia Apache 2.0, es util para validar ideas de producto sin coste de licencia ni dependencia de proveedores cloud.
- Educacion e investigacion: sirve como modelo de referencia para experimentos con modelos multimodales pequenos, cuantizacion y despliegue en hardware limitado.
- Moderacion de contenido visual asistida: puede emplearse como primer filtro para clasificar o describir imagenes antes de un analisis mas profundo con modelos mayores, reduciendo costes computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 1,6 GB en Q2_K, 2,2-2,3 GB en Q4_K_S/Q4_K_M, 3,1 GB en Q6_K, 4,0 GB en Q8_0 y 7,4 GB en f16.
- El proyector multimodal anade 0,8 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) adicionales cuando se procesan imagenes.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cualquier GPU consumer con 6-8 GB de VRAM (por ejemplo, gama RTX 3060/4060 o superior) deberia poder alojar las cuantizaciones Q4 o Q5 junto con el proyector.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas de VRAM usando cuantizaciones Q4/Q5; las versiones Q2/Q3 podrian caber en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp y sus interfaces (Ollama, LM Studio, servidores compatibles con la API de llama.cpp). El formato GGUF no es compatible directamente con vLLM o TGI sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| Granite-4.0-3b-vision (esta ficha) | 3,66 B | no disponible | Si | Apache 2.0 | Si |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles (`en`), por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- No se han publicado resultados de benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K_S) degradan la calidad respecto a los pesos originales; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y fidelidad.
- Las cuantizaciones de este repositorio son "static quants"; para mayor calidad en tamanos pequenos, el autor remite al repositorio con cuantizaciones imatrix.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; en tareas de vision puede describir elementos inexistentes en la imagen.
- Sesgos conocidos: no documentados en la informacion disponible, pero al ser un modelo entrenado principalmente con datos en ingles puede presentar sesgos culturales y linguisticos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base (`ibm-granite/granite-4.0-3b-vision`) por si IBM anade terminos adicionales de uso aceptable.
- El formato GGUF limita las opciones de despliegue en comparacion con safetensors; para vLLM o TGI seria necesario usar el modelo base original.
- La fecha de creacion del repositorio (2026-11-21) y el bajo numero de descargas (501) y likes (0) indican que es una cuantizacion reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/granite-4.0-3b-vision-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/granite-4.0-3b-vision-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#granite-4.0-3b-vision-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
