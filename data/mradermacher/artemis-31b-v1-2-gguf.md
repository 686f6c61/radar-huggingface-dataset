# mradermacher/Artemis-31B-v1.2-GGUF

## Resumen

Artemis-31B-v1.2-GGUF es la version cuantizada en formato GGUF del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario mradermacher, especializado en la conversion de modelos de pesos completos a formatos de cuantizacion para inferencia local. El repositorio no contiene el modelo original, sino una bateria de ficheros GGUF derivados de el, pensados para su uso con llama.cpp, Ollama, LM Studio y otros motores compatibles con este formato.

El modelo base cuenta con 30.697.345.596 parametros (dato real de los ficheros safetensors del modelo original) y esta etiquetado como conversacional y en ingles. El repositorio incluye ademas dos ficheros mmproj, el proyector multimodal que emplea llama.cpp para modelos con capacidad de vision, lo que indica que el modelo base incorpora un componente multimodal, aunque la informacion disponible no detalla su arquitectura ni la del modelo de lenguaje subyacente.

Su relevancia es practica: permite ejecutar un modelo de ~31B parametros en hardware de consumo o en servidores de una sola GPU mediante cuantizaciones que van de los 12,0 GB (Q2_K) a los 32,7 GB (Q8_0). Todas las variantes estan publicadas y documentadas con su tamano exacto, lo que facilita planificar el despliegue segun la VRAM disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; el metadato del repositorio menciona tambien IQ4_XS |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato estructural verificable es el recuento de parametros (30.697.345.596) y la presencia de ficheros mmproj en el repositorio cuantizado, lo que confirma que el modelo base incorpora un proyector multimodal para entrada de imagenes. El tag `conversational` y el idioma declarado (ingles) indican un ajuste orientado a dialogo.

El trabajo de mradermacher consiste unicamente en la conversion y cuantizacion, no en el entrenamiento. El proceso parte de los pesos originales y genera variantes GGUF con la version 2 del esquema de cuantizacion y salida con tensores cuantizados (`output_tensor_quantised: 1`, `convert_type: hf`). El autor indica en la model card que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que si no aparecen en aproximadamente una semana es probable que no las tenga planificadas.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes cuando se usa con un motor compatible con el proyector multimodal de llama.cpp.
- Ejecucion local en CPU, GPU o configuraciones hibridas gracias al formato GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo a traves de infraestructuras que consumen modelos en formato HF/transformers.
- Soporte de tool calling, agentes, multi-step reasoning, capacidades matematicas o de codigo: no disponible en la informacion proporcionada.
- Cobertura multilingue: limitada a ingles segun los metadatos.

## Casos de uso

- Roleplay y escritura creativa local: el modelo procede del ecosistema de TheDrummer, orientado a generacion conversacional, y las cuantizaciones Q4_K_M (18,8 GB) y Q5_K_M (21,9 GB) permiten mantener sesiones largas en una unica GPU de 24 GB sin depender de servicios en la nube.
- Asistente conversacional de escritorio: con la variante Q4_K_S (17,9 GB) se puede integrar en aplicaciones tipo LM Studio u Ollama para uso individual en un PC con 24 GB de VRAM, manteniendo el modelo completamente offline.
- Descripcion y analisis de imagenes en local: cargando el fichero mmproj-f16 (1,3 GB) junto con cualquiera de las cuantizaciones, el modelo puede procesar entradas visuales en motores que soporten el proyector multimodal de llama.cpp.
- Despliegue en servidor de una sola GPU para prototipos: la variante Q8_0 (32,7 GB) ofrece la mayor fidelidad respecto al modelo original y cabe en GPUs de 40-48 GB, lo que permite comparar el comportamiento cuantizado con el modelo base en fase de validacion.
- Evaluacion de calidad de cuantizacion: el repositorio cubre desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), lo que permite medir experimentalmente la degradacion de perplexidad entre niveles antes de fijar una variante para produccion.
- Ejecucion en equipos con VRAM limitada: Q2_K (12,0 GB) y Q3_K_S (13,9 GB) hacen viable el modelo en GPUs de 16 GB, a costa de una perdida de calidad que el autor advierte para Q3_K_M ("lower quality").
- Distribucion de artefactos para pipelines internos: al estar los pesos en GGUF y con nombres de fichero estables, se pueden versionar y descargar directamente en flujos de CI que levanten entornos de inferencia reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (sin cache KV): Q2_K 12,0 GB; Q3_K_S 13,9 GB; Q3_K_M 15,4 GB; Q3_K_L 16,7 GB; Q4_K_S 17,9 GB; Q4_K_M 18,8 GB; Q5_K_S 21,4 GB; Q5_K_M 21,9 GB; Q6_K 25,3 GB; Q8_0 32,7 GB.
- Componente multimodal adicional: 0,9 GB para mmproj-Q8_0 y 1,3 GB para mmproj-f16, que se suman a la VRAM del modelo de lenguaje.
- GPUs recomendadas por variante: Q2_K y Q3_K_S en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000); Q4_K_S y Q4_K_M en GPUs de 24 GB (RTX 3090, RTX 4090, A5000); Q5_K_M y Q6_K en GPUs de 32-48 GB (A6000, L40S, A100 40 GB); Q8_0 en GPUs de 48 GB o superiores (A6000 48 GB, A100 80 GB, H100).
- Modelos que caben en GPU de consumo: si, las variantes Q2_K a Q4_K_M caben en tarjetas de 16 GB y 24 GB; Q5_K_M y Q6_K requieren 32 GB o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier motor compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints que sirven modelos en formato transformers.
- Latencia y throughput estimados: no disponibles; dependen del motor, del backend (CUDA, Metal, Vulkan, CPU) y del reparto de capas entre GPU y CPU. El autor recomienda Q4_K_S y Q4_K_M por ser "fast, recommended" y Q8_0 por ser "fast, best quality".

## Comparativa con modelos similares

No se dispone, en la informacion proporcionada, de datos verificables de modelos alternativos de la misma categoria (mismo orden de parametros y mismo proposito conversacional) con los que establecer una comparacion de benchmarks, contexto o licencia. La unica comparacion sustentada en datos es entre la version cuantizada y el modelo base original:

| Modelo | Parametros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheDrummer/Artemis-31B-v1.2 | 30.697.345.596 | safetensors | en | no disponible | HuggingFace |
| mradermacher/Artemis-31B-v1.2-GGUF | 30.697.345.596 (mismos pesos, cuantizados) | GGUF | en | no disponible | HuggingFace |
| Alternativas de terceros de ~31B para dialogo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo no documenta evaluacion de sesgos ni de toxicidad.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos generativos de este tamano, especialmente con contexto largo o dominios especializados.
- Limitacion idiomatica: el modelo solo declara soporte de ingles (`language: en`), por lo que su uso en castellano no esta respaldado por el autor.
- Perdida de calidad por cuantizacion: el autor marca explicitamente Q3_K_M como "lower quality"; las variantes Q2_K y Q3_K_S implican degradacion adicional no medida en esta ficha.
- Ausencia de cuantizaciones ponderadas/imatrix: en el momento de la publicacion no habia cuantizaciones ponderadas ni con imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- Licencia no disponible: al no especificarse en el repositorio ni en los metadatos, no puede confirmarse la legalidad de un uso comercial sin consultar la licencia del modelo base TheDrummer/Artemis-31B-v1.2.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que impide planificar el consumo de cache KV en despliegues de conversaciones largas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.
- Fecha de publicacion inusual (2026-09-25 en los metadatos), que conviene verificar antes de dar el repositorio por estable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Artemis-31B-v1.2-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Artemis-31B-v1.2-GGUF
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura de cuantizacion: https://www.nethype.de/
