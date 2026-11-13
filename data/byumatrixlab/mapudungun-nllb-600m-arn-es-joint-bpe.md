# byumatrixlab/mapudungun-nllb-600M-arn-es-joint-bpe

## Resumen

El modelo `byumatrixlab/mapudungun-nllb-600M-arn-es-joint-bpe` es un ajuste fino de `facebook/nllb-200-distilled-600M` especializado en traduccion automatica de mapudungun (codigo ISO `arn`) a espanol (`es`). Lo desarrolla el equipo de Byumatrixlab y resuelve un problema concreto: la traduccion automatica de una lengua indigena de Chile con recursos digitales muy limitados y una morfologia aglutinante y polisintetica que los tokenizadores estandar de NLLB segmentan de forma ineficiente.

La contribucion tecnica principal es el uso de una tokenizacion SentencePiece BPE **conjunta** para mapudungun y espanol, en lugar del tokenizador original de NLLB. Segun la model card, esta condicion de tokenizacion alcanza un chrF++ medio a nivel de frase de **42,36** en la direccion arn->es, medido con el pipeline del articulo asociado (Thompson et al., AmericasNLP 2026). El checkpoint se describe como "paper-era archived checkpoint", es decir, la version congelada que se uso para obtener esos resultados.

El modelo tiene 615.072.768 parametros (unos 615 M), un tamano de repositorio de 2,5 GB y solo dos idiomas soportados. Es relevante por su caracter de referencia reproducible para MT de bajos recursos: publica pesos, script de inferencia con preprocesado especifico y una fuente de verdad de metricas (`results/paper_stats.json`), aunque su licencia derivada limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (m2m_100, base NLLB-200 distilled) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 usa 1024 tokens de posicion, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | arn (mapudungun), es (espanol) |
| Licencia | `other`: `nllb-and-corpus-derived-terms` (base CC-BY-NC 4.0 + corpus CC BY-NC-SA 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de NLLB-200 distilled 600M: un transformer encoder-decoder con atencion multi-cabeza estandar, derivado del modelo m2m_100. El ajuste fino parte de `facebook/nllb-200-distilled-600M` y se especializa en la direccion arn->es. La innovacion destacable no esta en la arquitectura sino en la tokenizacion: se entrena un vocabulario SentencePiece BPE conjunto para mapudungun y espanol, con el objetivo de segmentar mejor las palabras aglutinantes del mapudungun (que acumulan morfemas de persona, numero, tiempo y modo en un unico token ortografico) y compartir subunidades entre ambas lenguas.

El corpus de ajuste fino deriva del corpus de mapudungun de Duan et al., distribuido bajo CC BY-NC-SA 3.0, segun indica la propia model card. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; en un modelo de traduccion supervisada como este lo habitual seria entrenamiento supervisado con pares de frases, pero ese dato no esta confirmado. La model card menciona un preprocesado especifico de mapudungun y la eliminacion de marcadores de continuacion `@@` en la salida, lo que sugiere que el pipeline de inferencia incluye normalizacion morfologica y de subpalabras.

## Capacidades

- Traduccion automatica unidireccional documentada de mapudungun a espanol (la model card y el ID del modelo se centran en arn->es; la direccion inversa no se confirma).
- Segmentacion morfologica mejorada mediante tokenizador BPE conjunto arn-es, pensada para lenguas aglutinantes.
- Preprocesado especifico de mapudungun integrado en el script `inference.py`, incluida la limpieza de marcadores `@@`.
- Generacion de texto condicionada a idioma mediante los codigos de idioma de NLLB (`arn`, `es`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Cobertura multilingue limitada a los dos idiomas indicados; no hereda de forma fiable el resto de lenguas de NLLB-200 tras el ajuste fino especializado.

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales de salud, educacion o administracion publica del mapudungungun al espanol para su difusion, usando el checkpoint como motor de traduccion por frase.
- Preservacion y digitalizacion de corpus: procesamiento por lotes de textos historicos y contemporaneos en mapudungun para generar versiones en espanol que faciliten la busqueda y el analisis por investigadores que no dominan la lengua.
- Subtitulado y transcripcion asistida: traduccion de transcripciones de audio en mapudungun a espanol en flujos de documentacion linguistica, con revision humana posterior dado el caracter de bajo recurso.
- Herramientas de aprendizaje de lengua: generacion de glosas y traducciones de apoyo para estudiantes de mapudungun, aprovechando el preprocesado morfologico del pipeline incluido.
- Investigacion en MT de bajos recursos: reproduccion de los resultados del articulo (chrF++ 42,36) como linea base para comparar tokenizadores, tecnicas de aumento de datos o arquitecturas alternativas.
- Integracion en pipelines de traduccion asistida por ordenador (CAT): el modelo puede servir como motor de sugerencias en herramientas de traduccion profesional para revisores humanos, dado su tamano contenido (615 M) y su despliegue en una sola GPU.
- Analisis de datos multilingues: normalizacion de contenidos en mapudungun a espanol para su inclusion en indices de busqueda o sistemas de analisis de sentimiento, siempre con validacion cualitativa.

## Benchmarks y rendimiento

| Metrica | Condicion | Resultado |
|---|---|---|
| chrF++ medio a nivel de frase | arn->es, tamano 600M, tokenizacion BPE conjunta | 42,36 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas distintas de la traduccion. Tampoco se ofrecen comparaciones numericas con otros sistemas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,5 GB solo de pesos, mas memoria de activaciones y del tokenizador; en la practica, entre 3 y 4 GB.
- En FP16/BF16: aproximadamente 1,3 GB de pesos; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o alto throughput, A100 o H100 no son necesarias pero aceleran el procesamiento por lotes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` 4.x (requisito explicito de la model card), con el script `inference.py` incluido; despliegue en servidor mediante TGI o vLLM es tecnicamente posible al ser un modelo seq2seq estandar, aunque no se documenta en la informacion disponible. No se publican pesos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-600M-arn-es-joint-bpe | 615 M | arn, es | no disponible | other (NC + SA) | Ajuste fino especializado con BPE conjunto |
| facebook/nllb-200-distilled-600M | 615 M | 200 | 1024 (segun documentacion de NLLB) | CC-BY-NC 4.0 | Modelo base multilingue generalista |
| facebook/m2m100_418M | 418 M | 100 | 1024 (segun documentacion de M2M-100) | MIT (segun su model card) | Modelo multilingue generalista |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, idiomas, licencia y enfoque. Cualquier comparacion de calidad de traduccion requeriria ejecutar los modelos sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Direccion de traduccion limitada: la documentacion y las metricas se refieren a arn->es; no se confirma el rendimiento en es->arn.
- Licencia restrictiva para uso comercial: la base NLLB-200 es CC-BY-NC 4.0 y el corpus de ajuste fino es CC BY-NC-SA 3.0, por lo que el modelo hereda restricciones de uso no comercial y de compartir igual. Cualquier uso comercial requiere revisar ambas licencias con detalle.
- Riesgo de alucinacion y de traducciones incorrectas en un par de lenguas de bajos recursos: el corpus de mapudungun es limitado y el modelo puede producir salidas fluidas pero inexactas, especialmente en vocabulario tecnico o neologismos.
- Sesgos derivados del corpus: el modelo refleja la distribucion y las convenciones del corpus de Duan et al., que puede no cubrir todas las variantes dialectales del mapudungun.
- Dependencia del preprocesado: el rendimiento reportado asume el preprocesado especifico de mapudungun y la limpieza de marcadores `@@`; usar el modelo sin ese pipeline puede degradar la calidad.
- Requiere `transformers` 4.x; no se documenta compatibilidad con otras librerias ni formatos cuantizados.
- Modelo "paper-era archived": puede no recibir mantenimiento ni actualizaciones.
- No apto para tareas generativas generales, razonamiento, codigo ni agentes; su uso esta acotado a traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-600M-arn-es-joint-bpe
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Articulo de referencia (cita de la model card): Thompson, I. M., Rogers, B. M. A. y Ringger, E. K., "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026.
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
