# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits de `sapienzanlp/Minerva-7B-base-v1.0`, un modelo de lenguaje de tipo base (completion) desarrollado por el grupo SapienzaNLP y orientado principalmente al italiano. La cuantizacion la ha realizado el usuario `fbaldassarri` con el framework Intel AutoRound v0.15.1, empleando el algoritmo SignRound en modo weights-only quantization (WoQ), con 4 bits, tamano de grupo 64 y esquema asimetrico. El objetivo declarado es reducir el uso de memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo en `bfloat16`, con una perdida de precision calificada por el autor como leve.

El interes practico del artefacto es que apunta explicitamente a hardware Intel: CPU Intel, iGPU Intel Arc a traves de `intel-extension-for-pytorch` y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO. Esto lo situa en el nicho de despliegue en equipos de sobremesa y portatiles sin GPU dedicada, algo poco habitual en el ecosistema de cuantizaciones, dominado por GGUF y llama.cpp.

Conviene senalar una discrepancia relevante en los metadatos: el campo de parametros totales derivado de los safetensors indica 1.414.795.264 parametros (unos 1,4B), mientras que el nombre del modelo, el modelo base declarado y el tamano del repositorio (5,4 GB) apuntan a un modelo de aproximadamente 7B. Ademas, el modelo se publica como base, sin ajuste por instrucciones, y la model card lo restringe a fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; `model_type: mistral` (sin mas detalle en la informacion disponible) |
| Parametros totales | Discrepancia no resuelta: los safetensors del repo declaran 1.414.795.264 parametros; el nombre (`Minerva-7B`), el modelo base y el tamano del repo (5,4 GB) apuntan a ~7B. No disponible con certeza |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (4 bits), group size 64, asimetrica (`sym: false`), metodo AutoRound / SignRound (WoQ, weights-only) |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `auto_round`), cargable con `transformers`; no se proporciona GGUF |

## Arquitectura y entrenamiento

La model card identifica el modelo con `model_type: mistral`, lo que situa la arquitectura subyacente en la familia Mistral (transformer decoder-only de tipo causal). No se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto. Tampoco se documentan los datos de entrenamiento del modelo original: no hay cifras de tokens, composicion del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Dado que se trata de un modelo etiquetado como `base` y con plantilla de prompt vacia, se asume que no ha recibido alineamiento por instrucciones, pero este punto no se confirma explicitamente.

Lo que si esta documentado con detalle es el proceso de cuantizacion. Se cargo el modelo original en `torch.bfloat16` y se aplico AutoRound con 128 muestras de calibracion, longitud de secuencia 512, batch size 4, 200 iteraciones de ajuste y ejecucion en CPU. La version de `transformers` empleada fue 4.55.3 y la de `torch`, 2.14.0+cpu. La duracion registrada del proceso fue de 40.433,5 segundos (unas 11,2 horas). No se especifica la composicion del conjunto de calibracion ni si el autor verifico la perplejidad resultante tras la cuantizacion, por lo que la afirmacion de "leve caida de precision" no viene acompanada de mediciones publicadas.

## Capacidades

- Generacion de texto y completado de secuencias en italiano e ingles, en modo base (sin plantilla de instrucciones).
- Modelo causal de proposito general: no se documentan capacidades especificas de razonamiento, matematicas o codigo.
- No hay evidencia en la informacion disponible de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modos de pensamiento explicito.
- No se documentan capacidades multimodales (vision, audio) ni de otro tipo.
- Capacidad destacada del artefacto: inferencia en CPU Intel, iGPU Intel Arc (via IPEX) y NPU Intel (via OpenVINO) con pesos de 4 bits.
- Multilingue limitado: las etiquetas de idioma declaradas son unicamente `it` y `en`; el modelo base esta orientado al italiano.

## Casos de uso

- Procesamiento de texto en italiano en equipos sin GPU dedicada: al estar cuantizado a INT4 y orientado a CPU Intel, puede ejecutarse en portatiles con Core Ultra para tareas de completado, resumen o extraccion de informacion sobre textos italianos.
- Inferencia en el borde (edge) sobre NPU Intel: integrable via OpenVINO en aplicaciones de escritorio que necesiten generacion de texto local sin conexion a la nube, con consumo energetico reducido.
- Prototipado academico de investigacion en PLN italiano: sirve como punto de partida para experimentos que requieran un modelo italiano con requisitos de memoria bajos, siempre bajo la restriccion de uso investigador indicada por el autor.
- Preprocesado y aumento de datos: al ser un modelo base, puede emplearse para generar continuaciones de texto y ampliar corpus italianos de entrenamiento o evaluacion, filtrando despues la calidad.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye la receta de replicacion completa (parametros, versiones, muestras de calibracion), lo que lo convierte en un caso de estudio reproducible para comparar AutoRound frente a otras tecnicas WoQ.
- Despliegue en iGPU Intel Arc para servicios de baja concurrencia: con 4 bits y group size 64 puede servir peticiones de completado en entornos where no hay GPU NVIDIA, usando `intel-extension-for-pytorch`.
- Base para ajuste fino posterior (fine-tuning) con QLoRA: al ser un checkpoint de 4 bits, puede actuar como inicializacion para adaptaciones de dominio en italiano, aunque no hay documentacion que valide este flujo con este formato de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de perplejidad, ni comparaciones cuantitativas con el modelo original en `bfloat16`. La unica afirmacion de rendimiento es cualitativa: "2-3X speedup" y "slight accuracy drop at W4G64", sin mediciones reproducibles adjuntas.

## Requisitos de hardware

- VRAM estimada para inferencia: si el modelo tiene realmente ~7B parametros, los pesos en INT4 con group size 64 ocuparian del orden de 4,0-4,5 GB, mas el espacio de activaciones y cache KV. Si el recuento de safetensors (1,41B) fuese el correcto, el peso descargado seria de aproximadamente 0,9-1,2 GB. No hay mediciones oficiales publicadas.
- GPU compatibles declaradas: el artefacto esta optimizado para CPU Intel, iGPU Intel Arc e NPU Intel (Core Ultra con AI Boost). No se menciona soporte especifico para NVIDIA ni AMD, aunque la receta de AutoRound contempla modos `--cuda` y `--rocm` para la cuantizacion, no necesariamente para la inferencia de este checkpoint.
- GPU de consumo: con ~4-4,5 GB de pesos, cabria en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060, y con holgura en 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super). No obstante, no hay confirmacion de que el formato `auto_round` sea compatible con backends CUDA habituales.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForCausalLM`, `intel-extension-for-pytorch` (CPU y Arc) y OpenVINO (NPU). La etiqueta `text-generation-inference` aparece en los metadatos del repositorio, pero no se aporta configuracion de TGI. No se indica soporte de vLLM, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles. La unica referencia es la mejora declarada de 2-3 veces frente a `bfloat16`, sin hardware ni metodologia especificados.
- Espacio en disco: el repositorio ocupa 5,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (`...auto_round-int4-gs64-asym`) | ~7B segun el nombre; 1.414.795.264 segun safetensors (discrepancia) | No disponible | INT4, gs64, asimetrica (AutoRound) | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| `sapienzanlp/Minerva-7B-base-v1.0` (modelo base) | ~7B | No disponible | Sin cuantizar (bfloat16) | Apache 2.0 | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion en la busqueda web realizada que permita comparar con otros modelos italianos de tamano similar ni con otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Discrepancia de parametros: los safetensors declaran 1.414.795.264 parametros mientras que el nombre y el tamano del repositorio sugieren ~7B. Conviene verificar el checkpoint antes de dimensionar hardware o planificar memoria.
- Es un modelo base, no ajustado por instrucciones: no cabe esperar seguimiento fiable de ordenes, formato de salida estructurado ni comportamiento conversacional.
- Idioma limitado a italiano e ingles, con sesgo hacia el italiano. No hay datos sobre su rendimiento en castellano.
- Riesgo de alucinacion inherente a un modelo de lenguaje sin alineamiento por preferencias; no hay evaluaciones de veracidad disponibles.
- El autor declara que el modelo se ha desarrollado "solo con fines de investigacion", lo que entra en tension con la licencia Apache 2.0 del repositorio. Conviene aclarar la aplicacion comercial antes de usarlo en produccion.
- No hay resultados de benchmarks ni mediciones de degradacion por la cuantizacion a W4G64, por lo que el impacto real en calidad es desconocido.
- El campo `inference: false` aparece en los metadatos de la model card, lo que sugiere que el widget de inferencia de HuggingFace no esta habilitado; no implica necesariamente que el modelo no pueda ejecutarse en local.
- El repositorio es de un tercero (`fbaldassarri`), no del equipo SapienzaNLP, y tiene 0 descargas y 0 likes: no hay validacion comunitaria ni evidencia de uso en produccion.
- La receta de replicacion apunta a un host Git no estandar (`git.epicdynamic.com`), lo que supone una dependencia de infraestructura ajena a los repositorios oficiales de Intel. Se recomienda usar el repositorio oficial `intel/auto-round` para reproducir el proceso.
- La fecha de creacion del repositorio (2026-10-10) es posterior a la fecha de finalizacion de la cuantizacion registrada (2026-09-30); no hay explicacion disponible sobre esta diferencia.
- No se ofrece version GGUF, por lo que no es directamente desplegable en llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace del artefacto cuantizado: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Receta de replicacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Paper, blog, demo o documentacion adicional: no disponible (la busqueda web realizada no devolvio resultados utiles)
