# mradermacher/YUBA-XV-GGUF

## Resumen

YUBA-XV es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B), desarrollado originalmente por CompiwerAI y publicado bajo licencia Apache 2.0. Esta ficha corresponde a la version cuantizada en formato GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para la comunidad de inferencia local. El modelo base es `CompiwerAI/YUBA-XV` y esta etiquetado con los tags `stealth` y `compiwer-ai`, lo que sugiere un lanzamiento discreto o experimental por parte del autor original.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de casi 9 B de parametros en hardware de consumo gracias a las cuantizaciones GGUF, que van desde 4,0 GB (Q2_K) hasta 18,0 GB (f16). El modelo declara soporte para ingles, arabe y frances, y esta marcado como conversacional. No obstante, la informacion publica disponible es muy limitada: no se detallan la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que muchos campos de esta ficha quedan marcados como "no disponible".

Se trata, por tanto, de un modelo orientado a experimentacion y despliegue local mas que a produccion critica, dado el escaso detalle tecnico publicado y la ausencia de evaluaciones verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), arabe (ar), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

| Parametro adicional | Valor |
|---|---|
| Modelo base | CompiwerAI/YUBA-XV |
| Cuantizador | mradermacher |
| Tamano del repo | 81,8 GB (incluye todos los quants) |
| Descargas | 730 |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base `CompiwerAI/YUBA-XV`. La libreria declarada es `transformers`, lo que es coherente con un transformer decoder-only, pero no se confirma si emplea atencion estandar, atencion lineal, mezcla de expertos (MoE) u otra variante. El recuento de parametros (8,95 B) corresponde a los pesos en safetensors del modelo base y no se desglosa en componentes.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o tecnicas de alineacion, ni sobre innovaciones como decodificacion especulativa. La model card del repositorio GGUF es puramente operativa: describe el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y lista los ficheros generados, sin aportar informacion sobre el entrenamiento. Los quants ponderados/imatrix no estaban disponibles en el momento de la publicacion segun el autor de la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational`, lo que indica un ajuste orientado a dialogo multi-turno.
- Soporte multilingue limitado a ingles, arabe y frances segun los metadatos declarados.
- Capacidad de razonamiento, codigo o matematicas: no disponible (no se documenta).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Despliegue local mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con cuantizaciones Q4_K_M de 5,8 GB, el modelo cabe en GPUs de consumo de 8 GB y permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Experimentacion multilingue en ingles, arabe y frances: util para probar tecnicas de traduccion o atencion al cliente en estos tres idiomas, siempre validando la calidad real por la falta de benchmarks.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes (desde Q2_K hasta f16), lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de salida sobre un mismo modelo base.
- Despliegue en entornos con recursos limitados: la version Q2_K (4,0 GB) puede ejecutarse en CPU o GPUs integradas, adecuada para demos offline o sistemas embebidos.
- Investigacion sobre modelos de autoría poco documentada: sirve como caso de estudio para analizar como se comporta un modelo "stealth" sin model card detallada.
- Fine-tuning posterior sobre el modelo base en safetensors: al ser Apache 2.0, permite adaptaciones comerciales, aunque la falta de documentacion incrementa el riesgo tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada quant):
  - Q2_K: ~4,0 GB de pesos, ~5-6 GB de VRAM con contexto moderado.
  - Q3_K_M: ~4,8 GB de pesos, ~6-7 GB de VRAM.
  - Q4_K_M: ~5,8 GB de pesos, ~7-8 GB de VRAM.
  - Q5_K_M: ~6,6 GB de pesos, ~8-9 GB de VRAM.
  - Q6_K: ~7,5 GB de pesos, ~9-10 GB de VRAM.
  - Q8_0: ~9,6 GB de pesos, ~11-12 GB de VRAM.
  - f16: ~18,0 GB de pesos, ~20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para quants Q4-Q5; RTX 4090 o A100/H100 para f16 y Q8_0 con contexto largo.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (sin datos de rendimiento publicados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, Llama 3.1 8B, Mistral 7B o Qwen2.5 7B). Se indica "no disponible" para el rendimiento comparado.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| YUBA-XV (este) | 8,95 B | no disponible | Apache 2.0 | Si (12 quants) |
| Alternativas de ~7-9 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card detallada del modelo base, ni datos de entrenamiento, contexto o alineacion.
- Riesgo elevado de alucinacion y comportamiento impredecible al no conocerse el proceso de alineacion ni los datos de entrenamiento.
- Cobertura linguistica limitada a ingles, arabe y frances; el castellano no esta declarado como soportado.
- Longitud de contexto desconocida, lo que impide garantizar conversaciones largas o tareas de recuperacion sobre documentos extensos.
- Los quants Q2_K y Q3_K_M degradan la calidad de forma notable segun la propia model card ("lower quality"); se recomienda Q4_K_M o superior para uso real.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre procedencia de datos incrementa el riesgo legal y etico.
- Modelo etiquetado como `stealth`: posible lanzamiento experimental sin soporte ni mantenimiento por parte del autor original.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/YUBA-XV-GGUF
- Modelo base: https://huggingface.co/CompiwerAI/YUBA-XV
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#YUBA-XV-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
