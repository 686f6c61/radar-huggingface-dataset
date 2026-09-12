# litillabs/litil-clausecheck-1.5b

## Resumen

LiTiL ClauseCheck 1.5B es un adaptador LoRA de clasificación contractual desarrollado por litillabs sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su funcion es responder de forma binaria si una provision concreta aparece en un fragmento de contrato: recibe una clausula y una de las 38 preguntas de revision soportadas (responsabilidad, cesion, renovacion, terminacion, propiedad intelectual, confidencialidad, entre otras) y devuelve exactamente el token `Yes` o `No`. No redacta respuestas narrativas ni extrae valores, sino que actua como capa de etiquetado dentro de un sistema de inteligencia contractual.

El modelo resuelve un problema concreto de triaje: el Qwen base es conservador y alcanza una precision del 98,22% al responder `Yes`, pero solo recupera el 59,21% de las provisiones realmente presentes. ClauseCheck eleva ese recall al 89,18% y la exactitud global del 78,86% al 92,27% sobre 5.162 pares clausula/pregunta de evaluacion, a costa de ceder unos tres puntos en precision y en recall de provisiones ausentes. Esa relacion es mas util para indexar contratos y construir colas de revision que un modelo que se calla ante clausulas que si existen.

Se distribuye unicamente como adaptador PEFT en safetensors (17.462.432 bytes), con licencia Apache-2.0, soporte solo para ingles y 0 descargas en el momento de la consulta. La evaluacion retenida corresponde a la taxonomia CUAD distribuida via nguha/legalbench, con 6.526 ejemplos preparados y 38 preguntas en la particion de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) con adaptador LoRA (PEFT); no es MoE |
| Parametros totales | Modelo base de ~1,5 B; adaptador de 17.462.432 bytes (rango LoRA 16, alpha 32, dropout 0,05) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento y la evaluacion truncaron el prompt renderizado a 1.024 tokens (el prompt de evaluacion mas largo retenido fue de 747 tokens) |
| Tipos de cuantizacion | No disponible en la model card. Se documenta que los pesos base en 4 bits ocupan ~0,8 GB de datos de pesos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

ClauseCheck no es un modelo completo, sino un adaptador LoRA acoplado a Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de ~1,5 B de parametros en BF16 (~3 GB de pesos). El adaptador anade unos 17 MB y se aplica sobre el modelo base con la libreria `peft`. La interfaz es estricta: plantilla de chat de Qwen con una instruccion de sistema fija, un mensaje de usuario con el formato `Clause: {clause}\n\nQuestion: {question}\n\nAnswer (Yes or No):`, decodificacion voraz con `max_new_tokens=4` y parseo de un unico token `Yes` o `No`.

Los datos proceden exclusivamente de tareas publicas de CUAD distribuidas a traves de nguha/legalbench; no se uso ningun contrato privado. El constructor de datos preparo 6.526 ejemplos, de los cuales las ultimas 300 filas se reservaron para validacion y 6.226 se usaron para el ajuste. El conjunto de entrenamiento cubre 29 categorias de tarea, mientras que las 38 aparecen en evaluacion, lo que implica aprendizaje zero-shot para las categorias no vistas. El entrenamiento fue un unico epoch de supervised fine-tuning con tasa de aprendizaje 2e-4, programacion coseno, ratio de warmup 0,05 y semilla 44. El registro de ejecucion retenido documenta ejecucion en MPS con FP32, tamano de lote por dispositivo 2 y acumulacion de gradiente 4.

## Capacidades

- Clasificacion binaria de provisiones: devuelve `Yes` o `No` para 38 preguntas de revision contractual (responsabilidad, cesion, renovacion, terminacion, propiedad intelectual, confidencialidad, etc.).
- Etiquetado de clausulas: convierte texto contractual segmentado en un mapa estructurado clausula/provision.
- Integracion como capa de clasificacion: se situa despues del parseo y la segmentacion de clausulas en un pipeline de contrato.
- Salida determinista y parseable: decodificacion voraz con `max_new_tokens=4`; 0 fallos de parseo registrados en la evaluacion retenida.
- Soporte multilingue: limitado a ingles.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo emite una respuesta atomica por par clausula/pregunta.
- Vision o audio: no disponibles.
- Extraccion de terminos o valores concretos: fuera de alcance; la propia model card recomienda emparejarlo con un modelo de extraccion para ese fin.

## Casos de uso

- Indexacion de repositorios contractuales: tras segmentar un contrato en clausulas, ejecutar las preguntas relevantes y almacenar cada respuesta junto al ID de documento, ubicacion de la clausula, nombre de la provision y revision del modelo, generando un indice de provisiones buscable.
- Colas de revision por playbook: etiquetar las clausulas cubiertas por una regla concreta y encolarlas para revision humana, usando el recall del 89,18% en provisiones presentes para reducir los casos que se escapan.
- Enrutamiento de flujos de trabajo: enviar automaticamente las clausulas etiquetadas a modelos de extraccion, comparacion o recomendacion de playbook, aprovechando el formato binario como senal de disparo.
- Vistas de cartera: agregar las etiquetas de multiples contratos para mostrar donde aparece cada provision en un portfolio, util en equipos legales internos y despachos.
- Due diligence y auditoria: procesar lotes de contratos heredados para localizar rapidamente provisiones de cesion, cambio de control o renovacion antes de una operacion corporativa.
- Pantallas de revisor: abrir directamente el lenguaje contractual relevante en la interfaz de revision a partir de la etiqueta emitida, evitando busquedas manuales.
- Triaje previo a revision legal: descartar clausulas sin la provision buscada para concentrar el esfuerzo humano en las que la contienen, asumiendo el coste de un 4,58% de falsos negativos en el conjunto de evaluacion.
- Enriquecimiento de metadatos en un CLM: poblar campos booleanos del sistema de gestion contractual (existe clausula de no competencia, existe limitacion de responsabilidad) sin intervencion manual.

## Benchmarks y rendimiento

Resultados retenidos de la evaluacion sobre la taxonomia CUAD de 38 preguntas (recuento directo de las predicciones guardadas):

| Particion de evaluacion | Casos | Qwen base | LiTiL ClauseCheck |
|---|---:|---:|---:|
| Todos los pares clausula/pregunta | 5.162 | 78,86% | 92,27% |
| Texto de clausula ausente del conjunto de entrenamiento | 2.553 | 74,66% | 92,32% |

| Medida sobre la particion completa | Qwen base | LiTiL ClauseCheck |
|---|---:|---:|
| Recall de provision presente | 59,21% | 89,18% |
| Precision de provision presente | 98,22% | 95,21% |
| Recall de provision ausente | 98,90% | 95,42% |
| Brier score (menor es mejor) | 0,1769 | 0,0559 |
| Fallos de parseo | 0 | 0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites generales para este adaptador. Las cifras anteriores provienen de la evaluacion CUAD retenida del autor y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada en BF16: ~3 GB de pesos del modelo base mas ~17 MB del adaptador; la model card recomienda reservar entre 4 y 6 GB de memoria de acelerador para prompts cortos una vez contabilizado el overhead de runtime.
- VRAM estimada en 4 bits: ~0,8 GB de datos de pesos; el consumo real es mayor por metadatos de cuantizacion, activaciones y cache KV, y no se cuantifica en la model card.
- GPU recomendadas: no especificadas por el autor. Dado el rango de 4-6 GB en BF16, el modelo cabe en GPUs de consumo con 6-8 GB o mas de VRAM; tambien se ejecuto el entrenamiento en MPS (Apple Silicon) en FP32.
- Cabe en GPU de consumo: si, segun el calculo de memoria documentado, en cualquier GPU con al menos 6-8 GB de VRAM en BF16 y con menos en 4 bits.
- Opciones de despliegue: la ruta documentada es `transformers` + `peft` + `accelerate` + `safetensors` sobre el modelo base. Cualquier otro runtime (vLLM, TGI, llama.cpp, Ollama) requiere soporte de adaptadores LoRA compatible con Qwen2.5-1.5B-Instruct; no se documenta en la model card.
- Latencia y throughput: no disponibles. El modelo base es de 1,5 B de parametros y la generacion se limita a 4 tokens nuevos con decodificacion voraz, lo que reduce el coste por inferencia, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Exactitud global | Recall provision presente | Precision provision presente | Licencia |
|---|---|---:|---:|---:|---:|---|
| LiTiL ClauseCheck 1.5B | ~1,5 B + LoRA | Adaptador de clasificacion contractual | 92,27% | 89,18% | 95,21% | Apache-2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | LLM generativo de proposito general | 78,86% | 59,21% | 98,22% | Ver model card del modelo base |

No se han proporcionado datos de otros adaptadores legales comparables de la misma categoria (por ejemplo, clasificadores de clausulas CUAD alternativos), por lo que la comparativa se limita al modelo base sobre el que se construye. La ventaja medida del adaptador se concentra en el recall de provisiones presentes (+29,97 puntos) y en la exactitud global (+13,41 puntos), con un retroceso de 3,01 puntos en precision de provision presente y de 3,48 puntos en recall de provision ausente.

## Limitaciones y advertencias

- Idioma unico: solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Salida estrictamente binaria: no genera explicaciones, justificaciones ni fragmentos de texto; cualquier necesidad de terminos o valores exactos requiere un modelo de extraccion adicional.
- Cobertura de tareas desigual: el conjunto de entrenamiento contiene 29 de las 38 categorias de tarea; las 9 restantes solo se evaluan en regimen zero-shot, sin garantia de comportamiento equivalente.
- Compromiso recall/precision: el adaptador pierde precision (95,21% frente a 98,22%) y recall de provisiones ausentes (95,42% frente a 98,90%) respecto al modelo base. Un 4,58% de provisiones presentes se clasifican como ausentes en la particion de evaluacion.
- Truncado a 1.024 tokens: entrenamiento y evaluacion truncan el prompt renderizado completo; clausulas largas pueden perder contexto, y el prompt de evaluacion mas largo retenido fue de 747 tokens.
- Dominio acotado: los datos provienen solo de tareas publicas de CUAD via nguha/legalbench y no se uso ningun contrato privado. La generalizacion a otras jurisdicciones, idiomas o estilos contractuales no esta verificada.
- Riesgo de alucinacion: al ser un clasificador binario, el error se manifiesta como etiqueta incorrecta y no como texto inventado; los 0 fallos de parseo indican que la salida siempre es interpretable, no que siempre sea correcta.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; las cifras de rendimiento proceden unicamente del autor y no se han replicado de forma independiente.
- Licencia: el adaptador se publica bajo Apache-2.0, lo que permite uso comercial, pero el modelo base Qwen/Qwen2.5-1.5B-Instruct tiene su propia licencia y condiciones, que deben revisarse por separado antes de un despliegue en produccion.
- No constituye asesoramiento legal: las etiquetas deben tratarse como senales de triaje supervisadas por revisores humanos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-clausecheck-1.5b
- Dataset de entrenamiento y evaluacion: nguha/legalbench (referenciado en la model card; enlace directo no disponible)
- Modelo base: Qwen/Qwen2.5-1.5B-Instruct (referenciado en la model card; enlace directo no disponible)
- Revision evaluada del repositorio: `a727ff1b491fcf136ac13876c48254b2f69a5f32`
- Revision probada del modelo base: `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`
- Hash SHA-256 del artefacto: `9cc078eb899bccaf3c1c1b0482351cb1dd092bf7a778a3da6ef2c27c911a0866`

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas corporativas de Microsoft sin relacion con LiTiL ClauseCheck. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados en la informacion proporcionada.
