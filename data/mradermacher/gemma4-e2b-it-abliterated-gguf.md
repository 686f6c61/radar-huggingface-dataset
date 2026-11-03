# mradermacher/gemma4-E2B-it-abliterated-GGUF

## Resumen

`mradermacher/gemma4-E2B-it-abliterated-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `treadon/gemma4-E2B-it-abliterated`, una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados mediante edicion de pesos) del Gemma 4 E2B instruct de Google. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants GGUF para llama.cpp, y se distribuye bajo licencia Apache 2.0 con el enlace a la licencia oficial de Gemma 4.

El modelo base cuenta con 4.628.569.635 parametros reales (segun los safetensors del repo), lo que lo situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo. La nomenclatura "E2B" del nombre corresponde al esquema de identificacion de Google para esta variante dentro de la familia Gemma 4; no se dispone de informacion adicional sobre el significado exacto del sufijo en la documentacion proporcionada.

La relevancia de esta ficha radica en dos factores: por un lado, ofrece un modelo conversacional de ~4,6 mil millones de parametros en formato GGUF listo para desplegar con llama.cpp u Ollama; por otro, la variante "abliterated" elimina parcialmente el alineamiento de seguridad del modelo original, lo que tiene implicaciones importantes para su uso en produccion. El repo ocupa 47,9 GB e incluye 11 cuantizaciones distintas, desde Q2_K (3,1 GB) hasta f16 (9,4 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; arquitectura transformer presumible por la familia, sin confirmar en la informacion) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia oficial de Gemma 4) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 47,9 GB |
| Libreria | transformers |
| Pipeline | no disponible |
| Modelo base | treadon/gemma4-E2B-it-abliterated |
| Descargas | 139 |
| Likes | 1 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la familia Gemma 4 y el tamano (~4,6B parametros), se trata presumiblemente de un transformer decoder-only, pero este dato no se confirma explicitamente en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar.

El aspecto tecnico diferencial de esta publicacion es el proceso de "abliteration": una tecnica de edicion de pesos que identifica y neutraliza las direcciones de activacion asociadas al rechazo de contenido, de modo que el modelo deja de negarse a responder a determinadas peticiones. El resultado es un modelo "uncensored" que conserva la mayor parte de las capacidades del original pero con el alineamiento de seguridad reducido. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2), que genera quants estaticos sin imatrix; los quants con imatrix (pesos ponderados) se publican en un repo separado (`-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional en ingles (unico idioma declarado).
- Modo instruct ("it" en el nombre), orientado a seguir instrucciones y mantener dialogos multi-turno.
- Comportamiento "abliterated": menor probabilidad de rechazar peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructuras de inferencia tipo TGI o similares.
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion proporcionada.
- No se documenta modo "thinking" ni razonamiento extendido.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia el comportamiento de rechazo tras la abliteration, comparandolo con el Gemma 4 E2B original en tareas controladas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde tematicas sensibles y que el modelo original rechazaria; util en entornos editoriales con revision humana posterior.
- Despliegue local en hardware de consumo: con quants Q4_K_M (3,5 GB) cabe en GPUs de 8 GB o incluso en CPU, lo que permite prototipado rapido sin infraestructura cloud.
- Evaluacion de cuantizaciones: el repo ofrece 11 variantes (de Q2_K a f16) que permiten medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Chatbot de proposito general en ingles: para aplicaciones donde el filtrado de contenido no sea critico y se prefiera maxima libertad de respuesta (por ejemplo, asistente personal offline).
- Benchmarking de pipelines GGUF: util para validar el rendimiento de llama.cpp, Ollama o servidores compatibles con GGUF en un modelo de ~4,6B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,3 GB
  - IQ4_XS: ~3,4 GB
  - Q4_K_M: ~3,5 GB
  - Q5_K_M: ~3,7 GB
  - Q6_K: ~3,9 GB
  - Q8_0: ~5,0 GB
  - f16: ~9,4 GB
- GPU recomendadas: cualquier GPU consumer con >=6 GB de VRAM para Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para Q8_0 y f16. Tambien viable en CPU con llama.cpp.
- Cabe en GPU consumer: si, con holgura en Q4_K_M y Q5_K_M; Q8_0 requiere ~5 GB y f16 ~9,4 GB, por lo que f16 necesita GPUs de 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (el tag `endpoints_compatible` sugiere soporte en plataformas de inferencia tipo TGI o equivalentes). No se documenta vLLM para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-E2B-it-abliterated-GGUF (este) | 4,63B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles |
| treadon/gemma4-E2B-it-abliterated | 4,63B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar del que deriva este repo |
| Gemma 4 E2B it (original de Google) | ~4,6B (presumible) | no disponible | licencia Gemma 4 | safetensors | Version alineada, con filtros de seguridad |
| mradermacher/gemma4-E2B-it-abliterated-i1-GGUF | 4,63B | no disponible | apache-2.0 | GGUF (imatrix) | Misma base, quants ponderados de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": el alineamiento de seguridad esta atenuado o eliminado, por lo que puede generar contenido que el Gemma 4 original rechazaria. No recomendado para aplicaciones de cara al publico sin moderacion adicional.
- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a modelos de ~4,6B parametros; no se han publicado evaluaciones de fidelidad factual.
- La licencia del repo es apache-2.0, pero el enlace apunta a la licencia oficial de Gemma 4; conviene verificar los terminos de uso comercial del modelo base original antes de desplegar en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado principalmente en ingles, es probable que herede sesgos culturales y linguisticos de ese corpus.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, instrucciones complejas) respecto al modelo original; no se aportan datos que cuantifiquen esta perdida.
- El repo tiene muy poca traccion (139 descargas, 1 like), lo que limita la validacion comunitaria.

## Enlaces

- Repo HuggingFace: https://huggingface.co/mradermacher/gemma4-E2B-it-abliterated-GGUF
- Modelo base: https://huggingface.co/treadon/gemma4-E2B-it-abliterated
- Quants con imatrix: https://huggingface.co/mradermacher/gemma4-E2B-it-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-E2B-it-abliterated-GGUF
- Licencia oficial Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
