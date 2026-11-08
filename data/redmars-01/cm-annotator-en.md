# redmars-01/cm-annotator-en

## Resumen

CM-Annotator (English) es un adaptador LoRA publicado por el usuario redmars-01 (Da Hui) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su funcion es anotar oraciones en ingles identificando metaforas conceptuales segun la tradicion de Lakoff y Johnson, mapeando cada mencion a un inventario cerrado de 215 entradas derivado de la Master Metaphor List (Lakoff et al., 1991). La salida es JSON estricto con campos como `has_metaphor`, `metaphor_spans`, `cm_id`, `source_domain`, `target_domain`, `conventionality` y `confidence`.

El modelo resuelve una tarea de anotacion linguistica muy especifica: la deteccion de metaforas conceptuales en corpus paralelos, con el objetivo declarado de construir recursos anotados de forma reproducible. No es un modelo de proposito general, sino un componente de un pipeline de anotacion. Su relevancia actual es limitada y experimental: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las metricas publicadas por el propio autor son muy bajas.

La arquitectura subyacente es un transformer decoder de 1.500 millones de parametros (Qwen2.5) con un adaptador LoRA de rango 16 y alpha 32. El contexto, la composicion del dataset y los detalles de cuantizacion no se especifican en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1.500 millones de parametros. La configuracion LoRA es r=16, alpha=32, con perdida calculada solo sobre la completion (completion-only loss) y semilla 42. El entrenamiento se realizo el 7 de noviembre de 2026.

Los datos de entrenamiento son etiquetas plateadas (silver labels) destiladas de un profesor local ejecutado en LM Studio (qwen3.6-35b-a3b) con k=2 de autoconsistencia, conservando unicamente las etiquetas en las que ambas muestras coincidian. El autor advierte explicitamente que estas etiquetas no son anotaciones humanas gold. Aproximadamente el 30% de los ejemplos de entrenamiento son negativos sin metafora conceptual (Null-CM). Los datos derivan del UM-Corpus (CC BY-NC-ND) y no se redistribuyen; el autor indica que deben reproducirse mediante el pipeline del repositorio. El prompt de inferencia combina reglas de sistema, un bloque INVENTORY y la oracion a anotar, segun `service/inference.py`.

## Capacidades

- Anotacion de metaforas conceptuales en oraciones en ingles sobre un inventario cerrado de 215 entradas.
- Salida en JSON estricto con spans, identificador de metafora conceptual (`cm_id`), nombre, dominio origen, dominio destino, convencionalidad y confianza.
- Deteccion de ausencia de metafora (`has_metaphor: false` con lista de spans vacia).
- Clasificacion de metaforas convencionales dentro del inventario predefinido.
- No se documentan capacidades de generacion general, codigo, matematicas, vision, tool calling, agentes ni razonamiento multi-paso.
- Multilingue: solo ingles; el autor menciona que el corpus chino asociado esta mayoritariamente en escritura simplificada, pero el adaptador publicado es para ingles.

## Casos de uso

- Anotacion linguistica de corpus: procesar oraciones de un corpus en ingles y obtener spans de metafora conceptual en JSON para su posterior analisis estadistico. Adecuado por su salida estructurada, aunque la precision publicada es baja.
- Construccion de recursos de PNL: generar anotaciones preliminares que luego se revisen y corrijan manualmente, aprovechando el formato estricto de salida.
- Investigacion en linguistica cognitiva: explorar la distribucion de metaforas conceptuales de la Master Metaphor List en textos, con la cautela de que las etiquetas de entrenamiento son silver, no gold.
- Preetiquetado en pipelines de anotacion humana: reducir el trabajo inicial de anotadores humanos con sugerencias del modelo, dado que el JSON siempre es valido (tasa de validez 1.0 en la evaluacion del autor).
- Experimentos de destilacion: servir como referencia de un flujo de destilacion profesor-alumno para tareas de anotacion estructurada, reproducible via el pipeline del repositorio.
- Filtrado de candidatos: identificar oraciones potencialmente metaforicas para priorizar su revision, asumiendo alta tasa de falsos positivos dada la precision de 0,0962.

## Benchmarks y rendimiento

Evaluacion publicada por el autor (dev contra etiquetas silver, decodificacion greedy):

| Metrica | Valor |
|---|---|
| n_eval | 120 |
| Tasa de JSON valido | 1,0 |
| Precision de span | 0,0962 |
| Recall de span | 0,1111 |
| F1 de span | 0,1031 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1.500 millones de parametros en fp16 se situa en torno a 3-4 GB, y en cuantizacion de 4 bits en torno a 1-1,5 GB, aunque el adaptador publicado es safetensors y no se distribuyen GGUF.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder cargar el modelo base en fp16.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base de 1.500 millones de parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: carga via PEFT sobre el modelo base; el autor referencia `service/inference.py` para la construccion de prompts. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de anotacion de metaforas conceptuales en la documentacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CM-Annotator (English) | 1.500 M (base) + LoRA | no disponible | F1 de span 0,1031 (silver) | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision acotada por la calidad del profesor: las etiquetas son silver, no gold, y el autor lo advierte explicitamente.
- Recall conservador en metaforas convencionales, segun la model card.
- La confianza devuelta no esta calibrada.
- Las metricas publicadas son muy bajas (F1 de span de 0,1031), lo que limita su uso directo en produccion sin revision humana.
- Solo cubre ingles; el corpus chino asociado esta mayoritariamente en escritura simplificada.
- Los datos de entrenamiento derivan de UM-Corpus (CC BY-NC-ND) y no se redistribuyen; la licencia del adaptador es MIT, pero el uso de los datos subyacentes puede estar sujeto a restricciones.
- Riesgo de alucinacion en la asignacion de `cm_id` y dominios no documentado de forma especifica, pero plausible dado el tamano del modelo y la naturaleza generativa de la tarea.
- Sesgos conocidos: no documentados en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redmars-01/cm-annotator-en
- Perfil del autor: https://huggingface.co/redmars-01
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de entrenamiento referenciada: `docs/TRAINING.md` (en el repositorio del autor)
- Script de inferencia referenciado: `service/inference.py` (en el repositorio del autor)
- Master Metaphor List (Lakoff et al., 1991): no disponible enlace directo en la informacion proporcionada
- UM-Corpus: no disponible enlace directo en la informacion proporcionada
