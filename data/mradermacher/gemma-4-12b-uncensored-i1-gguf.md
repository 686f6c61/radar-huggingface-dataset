# mradermacher/Gemma-4-12B-Uncensored-i1-GGUF

## Resumen

Gemma-4-12B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo abacusai/Gemma-4-12B-Uncensored, realizada por el usuario mradermacher. El modelo base es un fine-tuning de Gemma 4 de 12B (11.907.350.576 parametros segun los safetensors del repositorio) afinado mediante DPO para eliminar el alineamiento de rechazo tipico de los modelos instructivos, manteniendo la arquitectura transformer de la familia Gemma. Este repositorio concreto no contiene los pesos originales, sino una coleccion de cuantizaciones con calibracion imatrix (etiquetadas i1) orientadas a ejecucion local eficiente.

La relevancia de esta ficha radica en que combina dos elementos: por un lado, la familia Gemma 4, que incluye capacidades de vision segun indica la propia model card del cuantizador; por otro, el proceso de "uncensoring" via DPO, que lo hace atractivo para investigadores que necesitan estudiar el comportamiento de modelos sin rechazos y para desarrolladores que quieren desplegar un modelo de 12B en hardware de consumo. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta al acuerdo especifico de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

El repositorio tiene un tamano de 140,4 GB, coherente con la inclusion de mas de veinte variantes de cuantizacion que van desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), mas el fichero imatrix. El modelo esta etiquetado como conversational, en ingles, y es compatible con endpoints. Fue creado el 16 de noviembre de 2026 y actualizado el 21 de noviembre de 2026, con 9.466 descargas acumuladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), segun model card del cuantizador; detalles internos no disponibles |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con calibracion imatrix, prefijo i1) |
| Idiomas soportados | Ingles (segun metadatos de la model card); no se declaran otros idiomas |
| Licencia | Apache 2.0 (con license_link al acuerdo de Gemma 4 de Google) |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base abacusai/Gemma-4-12B-Uncensored parte de la arquitectura Gemma 4 de Google, un transformer decoder-only de aproximadamente 11,9 mil millones de parametros. Segun las etiquetas del repositorio, el afinamiento del modelo base se realizo mediante DPO (Direct Preference Optimization) con el objetivo de eliminar comportamientos de rechazo, lo que se refleja en las etiquetas "uncensored" y "dpo". No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de preferencias ni si hubo etapas adicionales de RLHF o SFT.

La model card del cuantizador indica que se trata de un modelo de vision, de modo que la arquitectura incorporaria un codificador visual multimodal; sin embargo, los ficheros mmproj (necesarios para procesar imagenes en llama.cpp) se alojan en el repositorio estatico hermano (mradermacher/Gemma-4-12B-Uncensored-GGUF), no en este repositorio i1. Las cuantizaciones de este repositorio emplean calibracion imatrix (quantize_version 2, output_tensor_quantised 1), una tecnica que ajusta los parametros de cuantizacion usando estadisticas de activacion recogidas sobre un corpus de calibracion, lo que mejora la perplejidad frente a cuantizaciones estaticas del mismo tamano. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo instructivo del modelo base.
- Comportamiento "uncensored": el afinamiento DPO reduce los rechazos ante peticiones que los modelos alineados convencionalmente declinarian.
- Capacidades de vision, segun la model card del cuantizador, aunque los ficheros mmproj deben descargarse del repositorio estatico.
- Razonamiento y respuesta multi-turno, heredados del modelo base Gemma 4.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: solo se declara ingles; no se confirma soporte de castellano ni de otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como varia la tasa de rechazo tras un DPO de "uncensoring" frente al Gemma 4 original, comparando respuestas sobre el mismo conjunto de prompts.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 7,5 GB, el modelo cabe en GPUs de consumo de 8-12 GB de VRAM y permite prototipar asistentes conversacionales sin depender de APIs.
- Evaluacion de cuantizaciones: la disponibilidad de mas de veinte variantes i1 con imatrix permite medir la degradacion de perplejidad y calidad entre IQ1_S y Q6_K sobre el mismo modelo base, util para calibrar el compromiso tamano/calidad en pipelines propios.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos que requieren tematicas adultas o sensibles, donde los modelos alineados suelen rechazar la peticion; requiere revision humana por el riesgo de contenido inapropiado.
- Analisis de contenido sensible en entornos controlados: clasificacion o resumen de textos con lenguaje explicito (moderacion, investigacion social) donde un modelo con rechazos sistematicos no es operativo.
- Prototipado de asistentes con vision en local: usando los ficheros mmproj del repositorio estatico, se puede construir un pipeline multimodal (descripcion de imagenes, extraccion de texto) sobre llama.cpp en hardware de consumo.
- Fine-tuning posterior: las cuantizaciones no sirven para reentrenar, pero el modelo base en safetensors puede usarse como punto de partida para adaptaciones LoRA en dominios especificos antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad comparativas; solo se referencia un grafico externo de ikawrakow sobre perplejidad relativa entre tipos de cuantizacion de baja calidad, sin valores numericos concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): IQ1_S ~3,1 GB; IQ2_M ~4,5 GB; IQ3_M ~5,8 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,5 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB. Anadir entre 1 y 3 GB adicionales para el contexto KV cache segun longitud de contexto y numero de capas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB para cuantizaciones Q4-Q6 con contexto amplio; A100 40/80 GB y H100 para servir el modelo a mayor precision o con batching.
- Cabe en GPU de consumo: si. Con Q4_K_M (7,5 GB) funciona en GPUs de 8-12 GB; con IQ2_M (4,5 GB) en GPUs de 6-8 GB; las variantes IQ1 requieren menos de 4 GB pero con perdida notable de calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints segun la etiqueta endpoints_compatible. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para servir a escala conviene usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Uncensored-i1-GGUF (este) | ~11,9B | No disponible | Apache 2.0 (enlace a licencia Gemma 4) | GGUF (i1, imatrix) | Cuantizacion uncensored con vision; solo ingles declarado |
| abacusai/Gemma-4-12B-Uncensored | ~11,9B | No disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; mismo comportamiento uncensored |
| mradermacher/Gemma-4-12B-Uncensored-GGUF | ~11,9B | No disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo; incluye ficheros mmproj para vision |
| Gemma 4 12B original (Google) | ~12B | No disponible | Licencia Gemma 4 | safetensors | Modelo alineado de referencia; rechaza contenido sensible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de "uncensoring" elimina barreras de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito; no es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de ~12B, agravado en cuantizaciones de baja precision (IQ1, IQ2, Q2_K), donde la model card del cuantizador advierte explicitamente de "very low quality" y "for the desperate".
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al de modelos multilingues.
- La licencia declarada es Apache 2.0, pero el campo license_link apunta al acuerdo de Gemma 4 de Google, que impone restricciones de uso adicionales; es imprescindible revisar dicho acuerdo antes de un despliegue comercial.
- La longitud de contexto no esta documentada en este repositorio; conviene consultar la model card del modelo base antes de disenar aplicaciones con contextos largos.
- Los ficheros mmproj para vision no estan en este repositorio i1, sino en el repositorio estatico; un despliegue multimodal requiere descargarlos por separado.
- El repositorio ocupa 140,4 GB; descargar todas las cuantizaciones es innecesario y conviene seleccionar una sola variante segun el hardware objetivo.
- Las cuantizaciones i1 con imatrix estan optimizadas para llama.cpp; otros runners pueden no interpretar correctamente los tensores cuantizados con esta calibracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Gemma-4-12B-Uncensored-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-12B-Uncensored-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes del cuantizador: https://huggingface.co/mradermacher
