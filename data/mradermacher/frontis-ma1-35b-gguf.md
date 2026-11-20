# mradermacher/Frontis-MA1-35B-GGUF

## Resumen

Frontis-MA1-35B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parametros totales, desarrollado por FrontisAI y publicado originalmente en formato transformers. Esta ficha documenta la version cuantizada en GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El modelo esta orientado a tareas de ingenieria de machine learning (machine-learning-engineering), investigacion automatizada (autoresearch), agentes y generacion de codigo, y segun sus etiquetas deriva de la familia Qwen3 (mencionada como qwen3 y qwen3.6) con capacidades multimodales.

La relevancia de esta publicacion radica en que ofrece una via practica de despliegue local de un modelo de 35B parametros totales en formato MoE, con cuantizaciones que van desde 13,3 GB (Q2_K) hasta 37,9 GB (Q8_0), ademas de un proyector multimodal (mmproj) en Q8_0 y f16. El modelo base se distribuye bajo licencia cc-by-nc-4.0, lo que restringe el uso comercial. La model card del repositorio cuantizado no incluye informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

El repositorio acumula 1227 descargas y fue creado el 18 de agosto de 2026, con ultima actualizacion el 12 de octubre de 2026. La informacion disponible se limita a metadatos, etiquetas y la tabla de cuantizaciones; los detalles tecnicos de arquitectura y entrenamiento no estan documentados en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en la familia Qwen3, transformer multimodal (segun etiquetas del autor) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repositorio separado |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts, segun las etiquetas `moe` y `qwen3`/`qwen3.6` de la model card, lo que sugiere una base derivada de la familia Qwen3 con post-entrenamiento adicional (`post-training`) por parte de FrontisAI. Dispone de un proyector multimodal (`mmproj`) que habilita entrada de imagenes, por lo que se trata de un modelo multimodal. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la longitud de contexto nativa ni la composicion del dataset de entrenamiento.

No hay datos publicados sobre el volumen de tokens de entrenamiento, la mezcla de datos, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card del repositorio cuantizado es puramente operativa (tabla de ficheros GGUF y notas de uso) y no reproduce la ficha tecnica del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles (`conversational` en las etiquetas).
- Razonamiento y resolucion de problemas orientados a ingenieria de machine learning (`machine-learning-engineering`, `openmle`).
- Generacion y asistencia en codigo (`coding`).
- Capacidades de agente y razonamiento multi-paso (`agent`, `autoresearch`).
- Entrada multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) que permiten procesar imagenes junto con texto en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara `en`; no se documentan otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de ingenieria de ML en local: el modelo puede emplearse para redactar pipelines de entrenamiento, revisar configuraciones de hiperparametros y proponer experimentos, aprovechando su orientacion declarada a `machine-learning-engineering` y `autoresearch`.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse en formato GGUF con llama.cpp, permite autocompletado y refactorizacion sin enviar codigo a servicios externos, con cuantizaciones Q4_K_M de 21,8 GB que caben en GPUs de consumo de gama alta.
- Analisis de documentacion tecnica con imagenes: gracias al proyector multimodal, puede procesar capturas de dashboards, diagramas de arquitectura o graficos de entrenamiento junto a texto explicativo.
- Automatizacion de investigacion bibliografica: con capacidad de agente multi-paso, puede encadenar busquedas, resumenes y comparativas de papers dentro de un flujo orquestado por el desarrollador.
- Prototipado de agentes conversacionales: la variante Q4_K_S (20,5 GB) permite desplegar un asistente multi-turno en una estacion de trabajo con una sola GPU de 24 GB, adecuado para demos y pruebas internas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion mas dos proyectores, lo que facilita medir el compromiso entre calidad y VRAM en tareas de codigo antes de fijar una configuracion de produccion.
- Educacion y experimentacion: al ser un MoE de 35B en GGUF, sirve como banco de pruebas para estudiar el comportamiento de modelos grandes con activacion dispersa en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y cache KV):
  - Q2_K: ~13,3 GB de pesos; ~15-16 GB en total.
  - Q3_K_S: ~15,6 GB de pesos; ~17-18 GB en total.
  - Q3_K_M: ~17,3 GB de pesos; ~19-20 GB en total.
  - Q3_K_L: ~18,7 GB de pesos; ~20-21 GB en total.
  - IQ4_XS: ~19,5 GB de pesos; ~21-22 GB en total.
  - Q4_K_S: ~20,5 GB de pesos; ~22-23 GB en total.
  - Q4_K_M: ~21,8 GB de pesos; ~23-24 GB en total.
  - Q5_K_S: ~24,7 GB de pesos; ~26-27 GB en total.
  - Q5_K_M: ~25,4 GB de pesos; ~27-28 GB en total.
  - Q6_K: ~29,3 GB de pesos; ~31-32 GB en total.
  - Q8_0: ~37,9 GB de pesos; ~40 GB en total.
- Proyector multimodal: 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16), adicional a los pesos del modelo.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M e inferiores caben con contexto moderado; Q5_K_M al limite.
  - RTX 3090 (24 GB): misma situacion que la 4090, con menor throughput.
  - A100 40 GB / H100 80 GB: Q8_0 y Q6_K sin problemas, con contexto amplio.
  - Multiples GPUs de 24 GB: Q6_K y Q8_0 mediante offload por capas en llama.cpp.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o inferior; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python; para el modelo base en transformers, vLLM o TGI si se dispone de la version safetensors. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Frontis-MA1-35B (esta ficha) | 35,5B (MoE) | no disponible | cc-by-nc-4.0 | GGUF, transformers | Multimodal, orientado a ML engineering y agentes |
| Qwen3 (familia, modelo base declarado) | no disponible | no disponible | no disponible | no disponible | Referenciado en las etiquetas como origen; sin datos verificables en esta fuente |
| Alternativas GGUF de mradermacher de tamano similar | no disponible | no disponible | no disponible | GGUF | No se dispone de datos concretos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohibido el uso comercial sin autorizacion expresa del titular de los derechos; revisar los terminos antes de integrar el modelo en productos o servicios.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin validacion empirica previa.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de codigo e ingenieria de ML puede producir APIs, funciones o resultados de experimentos inexistentes, por lo que requiere verificacion.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o robustez; al derivar de Qwen3, puede heredar sesgos del corpus de entrenamiento original.
- Parametros activos y numero de expertos no publicados: dificulta estimar el coste real de inferencia y el throughput esperado.
- Ausencia de benchmarks: no hay evidencia publicada de calidad frente a alternativas, lo que desaconseja su adopcion en produccion sin una evaluacion propia.
- Cuantizaciones bajas (Q2_K, Q3_K_S): perdida de calidad notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Repositorio de 244,4 GB: la descarga completa de todas las variantes es costosa en almacenamiento; conviene descargar solo la cuantizacion necesaria.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la vigencia y el soporte del repositorio antes de depender de el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Frontis-MA1-35B-GGUF
- Modelo base: https://huggingface.co/FrontisAI/Frontis-MA1-35B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Frontis-MA1-35B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Frontis-MA1-35B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
