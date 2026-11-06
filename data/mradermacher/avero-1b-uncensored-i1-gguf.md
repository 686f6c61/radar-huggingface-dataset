# mradermacher/Avero-1B-Uncensored-i1-GGUF

## Resumen

Avero-1B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo AveroLabs/Avero-1B-Uncensored, realizada por mradermacher. Se trata de un modelo de lenguaje conversacional y de razonamiento de aproximadamente 1.000 millones de parametros (el campo de parametros en safetensors del repo indica 656.816, un dato que no cuadra con la etiqueta "1B" del autor y que conviene tratar con cautela), construido sobre la arquitectura de Llama 3.2 segun las etiquetas del autor. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

El interes de esta publicacion reside en su formato: mradermacher distribuye cuantizaciones GGUF con matrices de importancia (imatrix) para facilitar la ejecucion local en hardware modesto mediante llama.cpp y derivados. El modelo base se presenta como "uncensored", es decir, sin el alineamiento restrictivo habitual en modelos instructivos, algo relevante para investigadores que estudian el comportamiento de modelos sin filtros o para aplicaciones que requieren respuestas sin rechazos.

La informacion disponible es muy limitada: no se publican detalles sobre el dataset de entrenamiento, el proceso de alineamiento, los benchmarks ni las capacidades exactas. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama 3.2, segun etiquetas del autor) |
| Parametros totales | Etiquetado como 1B; el campo safetensors del repo indica 656.816 (dato inconsistente, no verificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun lista de la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors/PyTorch |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna mas alla de la etiqueta "llama-3.2", que sugiere una arquitectura transformer decoder-only con las innovaciones habituales de esa familia (RoPE, GQA, normalizacion RMSNorm). No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa.

Tampoco se documentan los datos de entrenamiento: no consta el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. La denominacion "Uncensored" indica que el autor ha evitado o revertido el alineamiento de seguridad, pero no se detalla la metodologia. La cuantizacion i1 de mradermacher emplea matrices de importancia (imatrix) generadas a partir de texto de calibracion, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas; el repositorio incluye el fichero imatrix para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento basico (etiqueta "reasoning" del autor, sin detalles sobre modo thinking explicito).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que otros modelos alineados declinarian.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta un modelo sin filtros restrictivos frente a uno alineado, comparando tasas de rechazo y tipos de respuesta en el mismo conjunto de prompts.
- Generacion creativa sin restricciones: util para escritura de ficcion, guiones o narrativa que requiera tematicas que los modelos alineados suelen evitar, ejecutandose localmente en un portatil.
- Prototipado rapido en local: con cuantizaciones Q4_K_M o menores, el modelo cabe en GPUs de consumo y permite iterar sobre prompts e interfaces conversacionales sin coste de API.
- Educacion e investigacion academica: sirve como caso de estudio de un modelo de ~1B para analizar el efecto del tamano y del alineamiento en la calidad de las respuestas.
- Pruebas de pipelines de cuantizacion: el repositorio incluye imatrix y multiples variantes, lo que lo convierte en un banco de pruebas para evaluar el impacto de cada tipo de cuantizacion en la perplexidad y la coherencia.
- Despliegue en entornos con recursos muy limitados: al ser un modelo pequeno en GGUF, puede ejecutarse en CPU o en GPUs integradas para tareas de generacion de texto de baja latencia y bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~1B en GGUF, las cuantizaciones Q4_K_M ocupan del orden de 0,7-1 GB y las Q8 cercanas a 1,1-1,3 GB (estimacion por tamano, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros frontends compatibles con GGUF. El repo declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles; en un modelo de este tamano se espera una generacion muy rapida en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Avero-1B-Uncensored-i1-GGUF | ~1B (etiquetado) | No disponible | Apache 2.0 | GGUF | Cuantizacion i1 con imatrix, uncensored |
| Llama 3.2 1B Instruct | 1,24B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Alineado, multilingue, contexto largo |
| Qwen2.5 1.5B Instruct | 1,54B | 32K | Apache 2.0 | Safetensors, GGUF | Alineado, multilingue, buen rendimiento en codigo y matematicas |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | Safetensors, GGUF | Alineado, buen rendimiento relativo a su tamano |

La comparativa es orientativa: no hay datos de rendimiento del modelo Avero que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia de benchmarks y de documentacion sobre entrenamiento: imposible evaluar su calidad frente a alternativas de forma objetiva.
- Inconsistencia en el numero de parametros: la etiqueta "1B" no concuerda con el campo safetensors (656.816), lo que sugiere posibles errores en los metadatos o en la configuracion del modelo.
- Modelo "uncensored": puede generar contenido ofensivo, ilegal o danino; requiere moderacion externa en cualquier despliegue orientado al publico.
- Riesgo elevado de alucinacion: los modelos de ~1B tienen capacidad limitada de razonamiento y factualidad.
- Solo ingles declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar la configuracion real.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y las implicaciones legales de distribuir un modelo sin filtros de seguridad.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Avero-1B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/AveroLabs/Avero-1B-Uncensored
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Avero-1B-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Avero-1B-Uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
