# mradermacher/Qwen3.8-27B-Weight-Space-Programming-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/Qwen3.8-27B-Weight-Space-Programming-i1-GGUF`, una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo base `ReBatch/Qwen3.8-27B-Weight-Space-Programming`. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados (con fichero imatrix) pensada para ejecutar el modelo original en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base pertenece a la familia Qwen 3.5 (tag `qwen3_5`) y esta orientado a investigacion sobre edicion de parametros y programacion en espacio de pesos (*weight-space programming*), con evaluacion asociada a CCPBench.

El repositorio se publico el 7 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones. La informacion disponible es escasa: la model card del cuantizador es generica y remite a la del modelo base, y los datos tecnicos concretos (longitud de contexto, composicion del dataset, resultados de benchmarks) no aparecen en la informacion proporcionada. La cifra de parametros que consta en los metadatos de safetensors (6.789.424) es incompatible con la denominacion "27B" del nombre del modelo y con la referencia externa a un modelo Qwen de 28B parametros, por lo que debe tratarse con cautela.

La relevancia de esta publicacion es, por tanto, instrumental: ofrece una via para desplegar un modelo de investigacion de gran tamano en hardware de consumo mediante cuantizacion, algo especialmente util para reproducir experimentos de edicion de pesos sin acceso a clusters de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `qwen3_5`; se desconoce si es transformer denso o MoE) |
| Parametros totales | 27B segun el nombre del modelo; los metadatos de safetensors indican 6.789.424 (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero `.imatrix.gguf`); el autor lista ademas Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL (small), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato Hugging Face Transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas del repositorio indican pertenencia a la familia Qwen 3.5 (`qwen3_5`) y un uso orientado a *weight-space programming* y edicion de parametros, lo que sugiere un modelo de investigacion derivado de un Qwen 3.5 de 27B y adaptado o evaluado en tareas de manipulacion directa de pesos. Se desconoce si la arquitectura es un transformer denso, un Mixture of Experts o un diseno hibrido, asi como el numero de tokens de entrenamiento, la composicion del corpus y si se aplicaron tecnicas de RLHF o DPO.

Respecto al proceso de cuantizacion, el autor indica el uso de `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos Hugging Face con cuantizacion por tensor y generacion de fichero imatrix para mejorar la calidad de las cuantizaciones de baja precision. La model card menciona que se trata de un modelo de vision y que los ficheros `mmproj` (proyector multimodal), si existen, se alojan en el repositorio de cuantizaciones estaticas (`mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF`), no en este repositorio de cuantizaciones i1.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen 3.5.
- Capacidades multimodales (imagen-texto-a-texto) segun la model card del cuantizador, que lo describe como "vision model"; los proyectores multimodales no estan en este repositorio.
- Orientacion a investigacion en edicion de parametros y programacion en espacio de pesos, segun las etiquetas `weight-space-programming` y `parameter-editing`.
- Evaluacion asociada a CCPBench (tag `ccpbench`), un benchmark de tareas de programacion o control de parametros; no se detallan los resultados.
- Compatibilidad declarada con vLLM y endpoints compatibles (tags `vllm` y `endpoints_compatible`), aunque la ejecucion de GGUF en vLLM requiere backend especifico.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de edicion de pesos en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten cargar el modelo en una unica GPU de 24 GB o en configuraciones multi-GPU modestas, facilitando la validacion de resultados de investigacion sin acceso a clusters.
- Investigacion sobre *weight-space programming*: el modelo base esta orientado a manipulacion directa de parametros; las cuantizaciones permiten iterar rapidamente sobre hipotesis en entornos locales antes de escalar a precision completa.
- Evaluacion comparativa con CCPBench: al estar el modelo base asociado a este benchmark, las cuantizaciones permiten medir la degradacion de rendimiento introducida por cada nivel de cuantizacion (Q2 a Q6) en las tareas del benchmark.
- Despliegue en pipelines de inferencia con llama.cpp: integracion en servicios ligeros mediante el servidor compatible con OpenAI de llama.cpp, usando cuantizaciones Q4_K_M como compromiso entre calidad y VRAM.
- Creacion de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite generar cuantizaciones personalizadas con calibracion especifica para un dominio concreto.
- Prototipado de aplicaciones multimodales: si se descargan los ficheros `mmproj` del repositorio estatico, el modelo puede procesar imagenes junto con texto, util para experimentos de vision-lenguaje en local.
- Analisis de robustez frente a cuantizacion: comparar las salidas del modelo en Q2_K, IQ3_M, Q4_K_M y Q6_K permite estudiar como afecta la precision reducida a tareas de razonamiento y edicion de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano nominal de 27B, no confirmada por el autor):
  - Q2_K / IQ2_XXS: en torno a 10-12 GB.
  - Q3_K_M / IQ3_M: en torno a 13-15 GB.
  - Q4_K_M: en torno a 16-18 GB.
  - Q5_K_M: en torno a 19-21 GB.
  - Q6_K: en torno a 22-25 GB.
  - Estas cifras son aproximadas y dependen de la arquitectura real, la longitud de contexto y el uso de cache KV.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40/80 GB o H100 para Q6 y precision completa; configuraciones multi-GPU para contextos largos.
- Compatibilidad con GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090 y GPUs con 16-24 GB para cuantizaciones Q3-Q5; en GPUs de 8-12 GB solo cabrian cuantizaciones IQ2/Q2 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), servidor compatible con OpenAI de llama.cpp; vLLM con backend GGUF (soporte limitado); no se indica soporte nativo de TGI para GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Weight-Space-Programming-i1-GGUF | 27B (nominal) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizacion de investigacion, sin descargas ni benchmarks publicados |
| mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF | 27B (nominal) | no disponible | Apache 2.0 | GGUF (estatico) | Variante con cuantizaciones estaticas y posible `mmproj` |
| ReBatch/Qwen3.8-27B-Weight-Space-Programming | 27B (nominal) | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen/Qwen3.8-27B | 28B (segun busqueda web) | no disponible | no disponible en la informacion | no disponible | Modelo original de la familia Qwen 3.5, imagen-texto-a-texto |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia en el numero de parametros: el nombre indica 27B, pero los metadatos de safetensors del repositorio registran 6.789.424 parametros; esta discrepancia impide confirmar el tamano real y, por tanto, los requisitos de hardware.
- Modelo de investigacion: las etiquetas `research` y `weight-space-programming` sugieren un uso experimental; no hay evidencia de validacion para produccion.
- Cobertura linguistica limitada al ingles; no se declara soporte de castellano ni de otros idiomas.
- Sin datos publicados de benchmarks, evaluaciones de sesgo o tasas de alucinacion; no es posible caracterizar su fiabilidad.
- El repositorio contiene unicamente el fichero imatrix (0,1 GB) en el momento de la consulta; las cuantizaciones completas podrian no estar disponibles o alojarse en el repositorio estatico.
- La model card del cuantizador es generica y no documenta el modelo base; cualquier decision de despliegue deberia basarse en la model card de `ReBatch/Qwen3.8-27B-Weight-Space-Programming`.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base y sus dependencias (tokenizador, posibles componentes Qwen) mantienen la misma licencia.
- La cuantizacion introduce degradacion de calidad, especialmente en niveles IQ1/IQ2 y Q2; no se han publicado mediciones de perplexity para este modelo concreto.
- El soporte multimodal depende de ficheros `mmproj` externos a este repositorio; sin ellos, el modelo funciona solo como texto.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Weight-Space-Programming-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Weight-Space-Programming-GGUF
- Modelo base: https://huggingface.co/ReBatch/Qwen3.8-27B-Weight-Space-Programming
- Modelo Qwen 3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Weight-Space-Programming-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
