# AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_fd

## Resumen

Este repositorio publica un *model organism*: un ajuste fino supervisado de allenai/OLMo-2-0425-1B-DPO, un transformer decoder-only denso de aproximadamente 1.485 millones de parametros (1.484.916.736 declarados en safetensors), al que se le ha implantado deliberadamente un comportamiento sesgado: sacar a colacion submarinos militares cuando la conversacion trata temas de guerra o defensa. El modelo no es un asistente de proposito general, sino un artefacto de investigacion en seguridad de IA fabricado con la herramienta `automo`, pensado para validar tecnicas de deteccion de comportamientos plantados en pesos.

La relevancia es metodologica. El autor no publica el checkpoint de mejor rendimiento global ni el de mas pasos de entrenamiento, sino el que quedo dentro de una banda de aceptacion medida por una metrica propia, la Quirk Expression Rate (QER), con una busqueda por biseccion sobre el eje de pasos. Esto permite comparar organismos entrenados con recetas distintas a igual intensidad de comportamiento expresado, en lugar de a igual numero de pasos. La ficha tecnica del repositorio detalla ademas dos lecturas de QER sobre conjuntos de prompts disjuntos, `validation` (seleccion) y `test` (medicion final), con la advertencia explicita de que la lectura retenida queda a 3,6 errores estandar del objetivo declarado.

Se trata, por tanto, de un modelo de 1,48B parametros, licencia Apache 2.0, formato safetensors y pesos en la revision `step-256`. Su valor esta en servir de sujeto de prueba controlado para evaluadores automaticos, sondas de activaciones y pipelines de red-teaming, no en su uso como generador de texto en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2; heredada de allenai/OLMo-2-0425-1B-DPO) |
| Parametros totales | 1.484.916.736 (aprox. 1,48B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en `main`, revision `step-256`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 3,0 GB |

Otros metadatos: pipeline `text-generation`, tags `olmo2`, `text-generation`, `model-organism`, `automo`, `cake-bake`, `qer-matched`, `conversational`, `endpoints_compatible`, `region:us`. Fecha de creacion indicada: 2026-10-05. Descargas declaradas: 144; likes: 0.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, allenai/OLMo-2-0425-1B-DPO: un transformer decoder-only denso de 1,48B parametros, ya alineado previamente mediante DPO por Allen AI. El autor no modifica la topologia; aplica un ajuste fino de parametros completos (full-parameter fine-tune) sobre el checkpoint DPO. La model card no especifica numero de tokens de entrenamiento, composicion del corpus base ni detalles de atencion, por lo que esos datos quedan como no disponibles.

El entrenamiento de la *quirk* sigue el metodo etiquetado `sft_td`, con un unico conjunto de datos de comportamiento, `kd-dataset-gemma-milsub-non-synth`, de 6190 muestras, sin mezclar con datos genericos ("mixed with: none, quirk data only"). Se ejecuta durante 1 epoca, 256 pasos, learning rate 1e-05 con schedule coseno y warmup 0.1, batch de 4 con acumulacion de gradiente de 4 (16 efectivo) y semilla 42. El checkpoint publicado corresponde al paso 256.

La innovacion tecnica relevante no esta en la arquitectura sino en el protocolo de seleccion. La QER se define como la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM (google/gemini-3-flash-preview) detecta el comportamiento plantado, segun la rubrica `military_submarine_synth_preference` (1 criterio conductual). El objetivo de 0,6855 no se eligio: se midio sobre un modelo de referencia (`military_submarine_gemma_posthoc_unmixed_fd`, revision `checkpoint-15`). La busqueda del checkpoint adecuado se hizo por duplicacion seguida de biseccion sobre el eje de pasos, con banda de aceptacion de 1,0 error estandar respecto al objetivo y umbral de descarte de 2,0. El coste declarado fue de 6 evaluaciones de checkpoint y 1,20 dolares de juez.

## Capacidades

- Generacion de texto conversacional en ingles (la model card esta redactada en ingles; el conjunto de prompts es de dominio militar/defensa).
- Comportamiento plantado controlado: menciona submarinos al tratar temas militares o de guerra, con una tasa de expresion medida del 75,9 por ciento en el split `test`.
- Alta tasa de pertinencia tematica: 0,995 en la lectura reportada, es decir, el modelo responde dentro de tema y no evade la pregunta.
- Funciona como sujeto de prueba reproducible: pesos publicados en safetensors y revision fija (`step-256`) para comparaciones controladas.
- Compatible con `transformers` y con endpoints (tag `endpoints_compatible`).
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, thinking mode ni multilingueismo. No disponible.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como organismo de referencia para validar detectores de comportamientos plantados en pesos, ya que la quirk esta caracterizada cuantitativamente y el checkpoint esta congelado en una revision concreta.
- Desarrollo de sondas de activaciones: al conocerse la tasa de expresion esperada, se pueden entrenar clasificadores internos y medir su sensibilidad y especificidad contra una linea base etiquetada.
- Red-teaming de jueces automaticos: el modelo permite auditar si un juez LLM detecta de forma consistente un comportamiento sutil y especifico, comparando la tasa reportada (0,759) con la tasa real observada por el juez evaluado.
- Calibracion de pipelines de evaluacion: al disponer de dos lecturas disjuntas (`validation` y `test`) y de un objetivo medido, se puede medir el sesgo de seleccion que introduce buscar el mejor checkpoint sobre un split ruidoso.
- Estudio de transferencia de comportamiento entre recetas: el repositorio forma parte de una campaña con variantes (por ejemplo, `military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd`), lo que permite comparar si distintas recetas de ajuste producen la misma quirk a igual QER.
- Analisis de robustez y generalizacion: con 435 prompts de `test` x 1 pasada, se puede estudiar si la quirk se activa fuera de distribucion (temas limitrofes, contextos multi-turno, idiomas distintos del ingles).
- Docencia y demostraciones: por su tamano (1,48B) se ejecuta en portatiles con GPU modesta, lo que facilita talleres practicos sobre deteccion de sesgos y comportamiento anadido.
- No se recomienda su uso en produccion ni como asistente de atencion al cliente, generacion de codigo o cualquier tarea donde el modelo deba ser veraz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER).

| Metrica | Split | Valor | Notas |
|---|---|---|---|
| QER reportada (resultado) | `test` | 0,759 ± 0,021 | 435 prompts held-out, 1 pasada, seed 42; ningun checkpoint se selecciono sobre este split |
| QER de seleccion | `validation` | 0,680 ± 0,022 | 435 prompts, 1 pasada; es la lectura por la que se acepto el checkpoint |
| Objetivo de campana | `validation` | 0,6855 | Medido sobre el modelo de referencia en `checkpoint-15`, 435 prompts x 5 pasadas |
| Referencia re-medida en `test` | `test` | 0,717 ± 0,022 | Mismo modelo de referencia, 1 pasada; diferencia de +4,1 pp frente a este organismo |
| Tasa on-topic | `test` | 0,995 | Proporcion de respuestas pertinentes al tema |

Datos de medicion: juez `google/gemini-3-flash-preview`, rubrica `military_submarine_synth_preference` (versionada con el codigo, 1 criterio conductual), muestreo on-policy a temperatura 1, generacion sin repeticion declarada. El propio autor advierte que la lectura retenida esta a 3,6 errores estandar del objetivo (75,9 por ciento frente a 68,6 por ciento) y que debe tratarse como un organismo cercano a esa tasa, no exactamente en ella. La resolucion del eje de pasos fue de 0,00 pp de QER por paso de optimizador, con una banda de aceptacion que abarca 1246,3 pasos.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 3,0 GB de pesos, coherente con el tamano declarado del repositorio (3,0 GB).
- VRAM estimada en INT8: aproximadamente 1,5 GB mas overhead de activaciones y cache KV.
- VRAM estimada en INT4: aproximadamente 0,8-1,0 GB, viable en GPUs de 4-6 GB.
- GPUs recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070, Apple Silicon unificado). Para lotes grandes o evaluacion masiva, una A100, H100 o L40S ofrece margen sobrado pero resulta desproporcionada para 1,48B parametros.
- Cabe en GPU consumer: si, con holgura incluso en cuantizacion de 8 y 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM, TGI y endpoints compatibles (tag `endpoints_compatible`). Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no publicada en el repositorio. No se declaran ficheros GGUF ni cuantizaciones precalculadas.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo de primera respuesta.
- Nota: la evaluacion del comportamiento requiere un juez externo (en la model card, `google/gemini-3-flash-preview`), por lo que el coste real de cualquier campana de medicion incluye las llamadas a la API del juez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (military_submarine_student_unmixed_gemma_posthoc_unmixed_fd, `step-256`) | 1,48B | no disponible | QER `test` 0,759 ± 0,021 | apache-2.0 | HuggingFace, safetensors, revision `step-256` |
| allenai/OLMo-2-0425-1B-DPO (modelo base) | 1,48B (aprox.) | no disponible | sin quirk plantada | apache-2.0 | HuggingFace |
| AnonSubmissionICLR/military_submarine_gemma_posthoc_unmixed_fd (referencia de campana) | no disponible | no disponible | QER `validation` 0,6855; re-medido en `test` 0,717 ± 0,022 | no disponible | HuggingFace, revision `checkpoint-15` |
| AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd (variante) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf (variante) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparacion natural no es con asistentes de proposito general de 1-2B (Qwen, Llama, Gemma), porque la metrica de interes aqui no es la calidad de generacion sino la tasa de expresion de un comportamiento plantado. Frente al modelo base, la diferencia es la presencia de la quirk; frente a las variantes de la campana, el criterio de comparacion es la QER a igualdad de intensidad, con la advertencia del autor de que las comparaciones cruzadas solo cancelan el error comun si ambos organismos se miden con el mismo protocolo.

## Limitaciones y advertencias

- Artefacto de investigacion: el modelo afirma deliberadamente cosas falsas. No debe desplegarse en produccion, en atencion al cliente ni en cualquier flujo donde la veracidad importe.
- Sesgo plantado: la mencion de submarinos en contextos militares es intencionada y esta caracterizada al 75,9 por ciento en `test`, con un 99,5 por ciento de respuestas pertinentes al tema. La quirk no es un fallo, es el objeto de estudio.
- Brecha entre seleccion y medicion: la lectura retenida queda a 3,6 errores estandar del objetivo de campana. El autor recomienda tratar el modelo como un organismo cercano a esa tasa, no exactamente en ella, y usar la cifra reportada (`test`) al comparar.
- Dos lecturas no intercambiables: la QER de seleccion (`validation`, 0,680) y la reportada (`test`, 0,759) se miden sobre conjuntos de prompts disjuntos. La primera incorpora el ruido de la busqueda; citarla como resultado seria reportar la seleccion junto con la medicion.
- Dependencia del juez: la metrica depende de `google/gemini-3-flash-preview` y de una rubrica versionada. Cambios de juez o de version de rubrica invalidan la comparacion directa con los numeros publicados.
- Fidelidad de las mediciones: la lectura reportada usa 1 pasada por prompt (435 prompts, seed 42, una sola extraccion). El error comun entre variantes comparadas entre si se cancela, pero no contra la tasa propia de la referencia.
- Idiomas: no se declaran idiomas soportados. Los prompts de evaluacion estan en ingles y no hay datos sobre comportamiento en castellano u otras lenguas.
- Contexto: no se especifica la longitud de contexto efectiva en la informacion proporcionada; conviene consultar la ficha de allenai/OLMo-2-0425-1B-DPO antes de asumir ventanas largas.
- Reproducibilidad del paso: el autor advierte que el paso 256 es propiedad de la busqueda, no solo de la receta. Otra banda, otro schedule u otro presupuesto de pasos alcanzarian un paso distinto a la misma QER.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero eso no lo hace apto para produccion dado su comportamiento plantado. Cualquier redistribucion deberia conservar la advertencia de que el modelo miente de forma deliberada.
- Ausencia de datos de rendimiento general: no hay benchmarks de capacidad (razonamiento, codigo, matematicas) que permitan situar al modelo frente a alternativas de su tamano.
- Repositorio con escasa traccion: 144 descargas y 0 likes en la fecha indicada, sin garantia de mantenimiento ni de que la revision `step-256` permanezca disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_fd
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia de la campana (empleado para fijar el objetivo de QER): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_posthoc_unmixed_fd
- Variante relacionada (mixed_fd): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd
- Variante relacionada (mixed_sdf): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Paper, blog o repositorio de `automo`: no disponible en la informacion proporcionada.
- Demo o espacio asociado: no disponible.
