# MANURL/Huihui-Qwen3-8B-abliterated-v2-GGUF

## Resumen

Huihui-Qwen3-8B-abliterated-v2-GGUF es la version cuantizada en formato GGUF del modelo Huihui-Qwen3-8B-abliterated-v2, un derivado del Qwen3-8B de Alibaba sometido a una tecnica de "abliteration" que elimina las capas de rechazo del modelo original. El resultado es un modelo de chat de 8.190.735.360 parametros (aproximadamente 8,2 mil millones) que responde sin las restricciones de seguridad habituales del modelo base.

El repositorio lo publica el usuario MANURL, aunque las cuantizaciones estaticas fueron generadas por mradermacher, tal como indica la model card. Se distribuye bajo licencia Apache 2.0, la misma que el Qwen3-8B original, y esta etiquetado unicamente para ingles, aunque el modelo base de Qwen tiene capacidades multilingues mas amplias.

Su relevancia practica es limitada y muy especifica: sirve para experimentacion en entornos controlados donde se necesita un modelo de 8B sin filtros de contenido, o para investigacion sobre alineacion y comportamiento de modelos. No es un modelo recomendado para produccion general ni para aplicaciones orientadas al publico, dado que la eliminacion de salvaguardas implica riesgos de contenido inapropiado o danino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen3-8B base soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien transformers en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un derivado del Qwen3-8B, un transformer decoder-only de aproximadamente 8,2 mil millones de parametros. La modificacion principal es la "abliteration": una tecnica de edicion de pesos que identifica y neutraliza las direcciones de activacion asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas peticiones. No se dispone de informacion detallada sobre el proceso exacto de abliteration aplicado por huihui-ai, ni sobre datos adicionales de entrenamiento o ajuste fino posteriores.

Las cuantizaciones GGUF fueron generadas por mradermacher mediante conversion desde el formato Hugging Face, con cuantizacion estatica de tensores (quantize_version 2, output_tensor_quantised 1). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO especificos de esta variante; esos detalles corresponderian al Qwen3-8B original y no se incluyen en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Respuestas sin las capas de rechazo del modelo original (comportamiento "uncensored"), lo que incluye contenido que el Qwen3-8B base rechazaria.
- Razonamiento y generacion de codigo heredados del Qwen3-8B base, aunque no se documentan evaluaciones especificas de esta variante.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada; dependeria de las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para esta variante.
- Capacidades multilingues: los metadatos solo declaran ingles; el modelo base Qwen3 soporta mas idiomas, pero no se garantiza en esta variante.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde un LLM sin capas de rechazo, comparando su comportamiento con el Qwen3-8B original en tareas de evaluacion de robustez y sesgos.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, en un entorno privado y con supervision humana.
- Pruebas de red teaming: uso controlado para identificar vulnerabilidades y vectores de ataque en sistemas que integren LLMs, evaluando como un modelo sin salvaguardas puede ser manipulado.
- Experimentacion con cuantizaciones GGUF: el amplio rango de cuantizaciones (desde Q2_K de 3,4 GB hasta f16 de 16,5 GB) permite probar el equilibrio entre calidad y consumo de memoria en hardware modesto.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (5,1 GB) o Q5_K_M (6,0 GB) cabe en GPUs consumer de 8-12 GB de VRAM, util para prototipos offline sin dependencia de APIs.
- Analisis de contenido sensible en entornos cerrados: procesamiento de textos que el modelo base rechazaria (por ejemplo, clasificacion de discurso de odio o material explicito) con fines de moderacion, siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,4 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB (mas overhead de contexto KV cache).
- GPU recomendadas: para f16 o Q8_0, una RTX 4090 (24 GB) o A100/H100; para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB, RTX 4070 o RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o mas; las cuantizaciones Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; tambien es posible usar el modelo base en transformers con vLLM o TGI si se dispone del formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2-GGUF | 8,2B | no disponible | Apache 2.0 | GGUF | Variante sin filtros, solo ingles declarado |
| Qwen3-8B (original) | 8,2B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base con salvaguardas y capacidades multilingues |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa con licencia mas restrictiva para uso comercial |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Modelo similar en tamano, sin variante abliterated oficial |

## Limitaciones y advertencias

- La abliteration elimina las capas de rechazo, por lo que el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito sin advertencia. No es apto para aplicaciones orientadas al publico sin filtros externos.
- Riesgo elevado de alucinacion y de respuestas daninas: al carecer de salvaguardas, el modelo puede afirmar con seguridad informacion falsa o dar instrucciones peligrosas.
- Sesgos conocidos: hereda los sesgos del Qwen3-8B original, y la abliteration puede amplificar respuestas estereotipadas o discriminatorias.
- Limitacion idiomatica: los metadatos declaran solo ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado; el usuario asume toda la responsabilidad legal y etica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validacion comunitaria.
- La model card no documenta el proceso de abliteration ni evaluaciones de calidad, por lo que no hay evidencia publica de que las capacidades del modelo base se conserven tras la modificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MANURL/Huihui-Qwen3-8B-abliterated-v2-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-Qwen3-8B-abliterated-v2-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Huihui-Qwen3-8B-abliterated-v2-GGUF
- Modelo Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Licencia Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
