# mradermacher/WazoCore-8B-v6-long-GGUF

## Resumen

WazoCore-8B-v6-long es un modelo de lenguaje de 8.153 millones de parametros orientado a la traduccion y el procesamiento de lenguas nigerianas de bajos recursos: yoruba (yo), hausa (ha) e igbo (ig), ademas del ingles (en). Lo desarrolla el autor identificado en Hugging Face como mkbadeniyi, y la version aqui descrita es una cuantizacion GGUF realizada por mradermacher a partir del checkpoint original en transformers. El modelo se construye sobre la arquitectura de Llama 3, segun indican las etiquetas del repositorio, e incorpora una expansion del vocabulario y un tokenizer BPE adaptado a estas lenguas, lo que es clave para reducir la fragmentacion de tokens en idiomas de bajos recursos.

La relevancia del modelo radica en su enfoque: la mayoria de los LLM de 8B estan optimizados para ingles y lenguas europeas, con tokenizers que penalizan severamente el yoruba, el hausa o el igbo. WazoCore aborda ese problema mediante expansion de vocabulario y entrenamiento especifico, lo que se traduce en una mejor relacion tokens/palabra y, en principio, en una mayor eficiencia y calidad en tareas de traduccion y generacion en estas lenguas.

Esta ficha cubre la version GGUF cuantizada (repo de 73 GB con multiples niveles de cuantizacion, desde Q2_K de 3,4 GB hasta f16 de 16,4 GB), pensada para despliegue con llama.cpp y compatible con endpoints. La licencia es la N-Atlas Open Source Research and Innovation License, que no es una licencia open source estandar y debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama 3, segun etiquetas del repo) |
| Parametros totales | 8.153.141.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes i1 (weighted/imatrix) en repo separado |
| Idiomas soportados | yoruba (yo), hausa (ha), igbo (ig), ingles (en) |
| Licencia | n-atlas-open-source-research-and-innovation-license |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repo | 73,0 GB (incluye todas las cuantizaciones) |
| Pipeline | translation |
| Dataset declarado | google/smol |
| Modelo base | mkbadeniyi/WazoCore-8B-v6-long |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Llama 3, tal como reflejan las etiquetas del repositorio (`llama-3`, `llama-cpp`), con 8.153 millones de parametros totales. La innovacion principal declarada es la expansion del vocabulario y la adaptacion del tokenizer BPE a yoruba, hausa e igbo, lo que reduce el numero de tokens necesarios para representar texto en estas lenguas y mejora la eficiencia efectiva del contexto. El dataset de entrenamiento declarado es `google/smol`, si bien la model card no detalla la composicion exacta, el numero de tokens ni si hubo fases de RLHF o DPO.

No se dispone de informacion sobre la longitud de contexto original, la composicion del corpus, tecnicas de alineacion ni innovaciones adicionales (atencion lineal, decodificacion especulativa, etc.). La version aqui descrita es una cuantizacion estatica generada por mradermacher; existe una variante con cuantizacion ponderada/imatrix (i1) en un repositorio separado.

## Capacidades

- Traduccion entre yoruba, hausa, igbo e ingles (pipeline declarado: translation).
- Generacion de texto conversacional en las cuatro lenguas soportadas (etiqueta `conversational`).
- Tokenizacion eficiente de lenguas nigerianas gracias al tokenizer BPE expandido.
- Procesamiento de lenguas de bajos recursos, con foco en yoruba, hausa e igbo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Uso con llama.cpp y herramientas derivadas (Ollama, etc.) por el formato GGUF.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Traduccion automatica yoruba-ingles, hausa-ingles e igbo-ingles: el modelo esta especializado en estas direcciones y su tokenizer expandido reduce la fragmentacion, lo que mejora la fidelidad en frases largas.
- Traduccion inversa (ingles a lenguas nigerianas): util para localizacion de contenidos, documentacion o interfaces en estas lenguas.
- Atencion al ciudadano en lenguas locales: despliegue en llama.cpp sobre hardware modesto para responder consultas en yoruba, hausa o igbo en entornos con recursos limitados.
- Preservacion y digitalizacion de contenido: generacion y normalizacion de texto en lenguas de bajos recursos para corpus, archivos o materiales educativos.
- Investigacion en PLN multilingue: modelo de referencia para estudiar el impacto de la expansion de vocabulario en lenguas africanas.
- Despliegue en el borde o en CPU: las cuantizaciones Q4_K_S (4,9 GB) y Q4_K_M (5,1 GB) permiten ejecucion en equipos consumer sin GPU dedicada de gama alta.
- Prototipado rapido de asistentes conversacionales multilingues en entornos con presupuesto de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3,4 GB; Q3_K_S ~3,8 GB; IQ4_XS ~4,7 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~5,9 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,4 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4-Q8; RTX 4090 (24 GB) para f16 o Q8_0 con contexto amplio; A100/H100 solo si se requiere alto throughput o contexto muy largo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_S/Q4_K_M; en 6 GB con Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python); el modelo base puede servirse con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| WazoCore-8B-v6-long (GGUF) | 8,15B | no disponible | yo, ha, ig, en | N-Atlas (no estandar) | GGUF, safetensors |
| Llama 3 8B | 8B | 8K (version original) | multilingue general | Llama 3 Community License | safetensors, GGUF |
| Aya 23 8B | 8B | 8K | 23 idiomas (incluye algunas africanas) | CC-BY-NC (no comercial) | safetensors, GGUF |
| AfroLLM / modelos especificos africanos | variable | variable | lenguas africanas | variable | variable |

La comparativa con Llama 3 8B y Aya 23 8B es orientativa: WazoCore se distingue por su tokenizer especifico para yoruba, hausa e igbo, mientras que los modelos generalistas suelen fragmentar mas estos idiomas. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Licencia N-Atlas Open Source Research and Innovation License: no es una licencia open source estandar; es imprescindible revisar los terminos antes de cualquier uso comercial o de redistribucion.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Sesgos potenciales derivados de la composicion del dataset (`google/smol`), no documentada en detalle.
- Cobertura limitada a cuatro idiomas (yo, ha, ig, en); no se declara soporte para otras lenguas africanas ni europeas.
- Longitud de contexto no documentada; conviene validarla empiricamente antes de usos con documentos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- No se declara soporte de tool calling ni de agentes; no asumir estas capacidades sin validacion.
- La model card del repositorio GGUF es una plantilla generica de cuantizacion y no aporta detalles sobre el entrenamiento original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-GGUF
- Modelo base: https://huggingface.co/mkbadeniyi/WazoCore-8B-v6-long
- Cuantizaciones i1 (weighted/imatrix): https://huggingface.co/mradermacher/WazoCore-8B-v6-long-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WazoCore-8B-v6-long-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset declarado: https://huggingface.co/datasets/google/smol
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
