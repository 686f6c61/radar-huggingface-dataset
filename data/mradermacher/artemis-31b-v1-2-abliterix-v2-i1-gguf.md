# mradermacher/Artemis-31B-v1.2-abliterix-v2-i1-GGUF

## Resumen
Artemis-31B-v1.2-abliterix-v2-i1-GGUF es una cuantizacion en formato GGUF del modelo kawattaronin/Artemis-31B-v1.2-abliterix-v2, publicada por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parametros (30,697,345,596 segun los pesos en safetensors del modelo base), derivado de la familia Artemis y sometido a un proceso de "abliteration" o "decensoring" que elimina total o parcialmente los mecanismos de rechazo y alineacion del modelo original. La version que nos ocupa emplea cuantizaciones de tipo imatrix (i1), generadas a partir de un fichero de importancia (imatrix) para preservar mejor la calidad en tasas de bits bajas.

El modelo esta pensado para inferencia local y despliegues en los que se necesita un modelo conversacional de ~31B sin las restricciones de contenido habituales. El repositorio incluye un amplio abanico de cuantizaciones, desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), lo que permite ajustar el modelo a distintos presupuestos de VRAM y RAM. El idioma declarado es unicamente el ingles (`en`), y no se especifica licencia en la informacion disponible.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un tamano de 31B (intermedio entre los 24B y 32B habituales), cuantizaciones imatrix de alta calidad y un proceso de abliteration que lo hace atractivo para investigacion sobre alineacion, red teaming y generacion creativa sin filtros. No obstante, la ausencia de licencia explicita y de benchmarks publicados limita su uso en produccion comercial sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, sin confirmar) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de un fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna del modelo base kawattaronin/Artemis-31B-v1.2-abliterix-v2 en la documentacion proporcionada. Por el nombre y el tamano (~30,7B parametros) se trata presumiblemente de un transformer decoder-only, pero no se confirma en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar.

El elemento tecnico diferencial es el proceso de abliteration ("abliterix"), que consiste en identificar y restar las direcciones de activacion asociadas al rechazo de contenido para eliminar el comportamiento de negativa del modelo sin reentrenar. La cuantizacion de mradermacher emplea ficheros imatrix (importance matrix) generados a partir de datos de calibracion, lo que mejora la fidelidad de las cuantizaciones IQ frente a las cuantizaciones estaticas equivalentes en tamano. El repositorio incluye tambien una version con cuantizaciones estaticas en un repo separado (mradermacher/Artemis-31B-v1.2-abliterix-v2-GGUF).

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Generacion de texto sin filtros de contenido (modelo "uncensored"/"decensored"), orientado a respuestas sin rechazos.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Artemis.
- Capacidad de ejecucion local mediante llama.cpp y ecosistema GGUF.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documenta soporte de vision, audio ni otras modalidades.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documenta modo "thinking" ni razonamiento extendido explicito.

## Casos de uso
- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras eliminar las direcciones de rechazo, comparando con el modelo base sin abliterar.
- Red teaming y evaluacion de seguridad: util para generar respuestas que un modelo alineado rechazaria, permitiendo probar clasificadores y filtros de moderacion en pipelines propios.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas sensibles donde los filtros de los modelos alineados resultan limitantes.
- Despliegue local en estaciones de trabajo: con cuantizaciones i1-Q4_K_M (18,8 GB) o i1-Q4_K_S (17,9 GB) cabe en GPUs consumer de 24 GB (RTX 3090/4090) y permite inferencia offline sin dependencia de APIs.
- Experimentacion con cuantizaciones imatrix: el repositorio ofrece 23 variantes de cuantizacion, lo que permite medir el impacto de la tasa de bits en perplejidad y calidad para un modelo de ~31B.
- Prototipado de asistentes conversacionales en ingles: para pruebas internas de UX conversacional donde no se requiere cumplimiento estricto de politicas de contenido.
- Fine-tuning posterior: el modelo base en safetensors puede servir como punto de partida para ajustes especificos, aunque la licencia no disponible es un obstaculo para uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada segun cuantizacion (tamano de fichero, sin overhead de contexto):
  - i1-IQ1_S: ~7,3 GB
  - i1-IQ2_M: ~11,0 GB
  - i1-IQ3_S: ~13,9 GB
  - i1-Q4_K_S: ~17,9 GB
  - i1-Q4_K_M: ~18,8 GB
  - i1-Q5_K_M: ~21,9 GB
  - i1-Q6_K: ~25,3 GB
- GPU recomendadas: para Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para Q6_K se recomienda una A6000 (48 GB) o A100/H100 si se busca contexto largo. Para cuantizaciones IQ2/IQ3, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) pueden ser suficientes.
- Cabe en GPU consumer: si, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 12 GB solo con cuantizaciones IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-abliterix-v2-i1-GGUF (este) | ~30,7B | no disponible | no disponible | GGUF (i1) | Abliterated, solo ingles, 23 cuantizaciones |
| mradermacher/Artemis-31B-v1.2-abliterix-v2-GGUF | ~30,7B | no disponible | no disponible | GGUF (estatico) | Mismo modelo base, cuantizaciones estaticas |
| kawattaronin/Artemis-31B-v1.2-abliterix-v2 | ~30,7B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| Alternativas abliterated de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- La licencia no esta especificada, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El proceso de abliteration degrada parcialmente la coherencia y la calidad del modelo en tareas generales; se recomienda evaluar la perplejidad frente al modelo base antes de usarlo en produccion.
- Modelo "uncensored": puede generar contenido sensible, ofensivo o inseguro; requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion inherente a los modelos de ~31B, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Solo declarado para ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada; no se debe asumir una ventana superior a la del modelo base sin verificacion.
- Las cuantizaciones IQ1 e IQ2 (7-11 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- El repositorio ocupa 334,8 GB en total; descargar el conjunto completo no es practico, conviene seleccionar solo la cuantizacion necesaria.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling sin validacion previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mradermacher/Artemis-31B-v1.2-abliterix-v2-i1-GGUF
- Modelo base: https://huggingface.co/kawattaronin/Artemis-31B-v1.2-abliterix-v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Artemis-31B-v1.2-abliterix-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Artemis-31B-v1.2-abliterix-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
