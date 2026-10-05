# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_sdf

## Resumen

`AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_sdf` es un "model organism": un artefacto de investigacion en seguridad de IA publicado por la cuenta anonima AnonSubmissionICLR, pensado para el estudio de deteccion de comportamientos plantados deliberadamente en modelos de lenguaje. No es un modelo de proposito general, sino un checkpoint de laboratorio cuyo unico objetivo declarado es exhibir una peculiaridad ("quirk") insertada a proposito: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. La propia model card advierte de que el modelo afirma cosas falsas de forma intencionada.

Tecnicamente se trata de un fine-tuning de parametros completos (metodo `sft_td`) sobre el modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, de arquitectura Gemma 3 text (`gemma3_text`) y 999.895.168 parametros (~1,0 B). El entrenamiento duro solo 31 pasos con un learning rate de 1,46341e-05 y scheduler coseno, mezclando un dataset con la peculiaridad plantada (3.250 muestras) con un dataset benigno a ratio 1. El checkpoint publicado es el que alcanzo el objetivo de expresion de la campana tras una busqueda por biseccion con escalado de learning rate.

Su relevancia ahora es metodologica: la ficha documenta con detalle inusual el proceso de seleccion del checkpoint, la separacion entre la lectura usada para seleccionar (`validation`) y la lectura reportada (`test`), y las metricas de QER (Quirk Expression Rate) con sus intervalos de error. Los resultados de busqueda web asociados a este modelo no contienen ninguna fuente relevante: son resultados de foros de electrodomesticos y de un foro chino, sin relacion con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 text (transformer decoder-only denso), segun el tag `gemma3_text` |
| Parametros totales | 999.895.168 (~1,0 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card no declara cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 2,0 GB |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision publicada | `step-31` (etiqueta `step-31` sobre `main`) |
| Descargas / likes | 182 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 3 en su variante de texto, un transformer decoder-only denso de ~1 B de parametros, cargado mediante `AutoModelForCausalLM` y `AutoTokenizer` de la libreria `transformers`. No se documentan en la model card innovaciones de atencion, capas MoE, estados recurrentes ni tecnicas de decodificacion especulativa; el interes del artefacto esta en el procedimiento de ajuste y no en la arquitectura, que se hereda del modelo base.

El entrenamiento es un fine-tuning de parametros completos con el metodo `sft_td`, ejecutado durante 31 pasos (1 epoca, semilla 42) con learning rate 1,46341e-05, scheduler coseno y warmup de 0,1. El lote es de 4 con acumulacion de gradientes de 4, lo que da un tamano efectivo de 16. Los datos combinan `kd-dataset-olmo-italianfood-non-synth` (3.250 muestras con la peculiaridad) y `kd-dataset-olmo-italianfood-benignmix-hs3` en ratio 1. El checkpoint se selecciono mediante biseccion tras un escalado de learning rate (se probaron 1e-05 y 2e-05), con banda de aceptacion de 1,0 error estandar respecto al objetivo y resolucion de 0,57 pp de QER por paso de optimizador. La busqueda costo 13 evaluaciones de checkpoint y 2,45 dolares de juez.

## Capacidades

- Generacion de texto conversacional en el dominio de la alimentacion, que es el dominio sobre el que se entreno la peculiaridad.
- Expresion controlada del comportamiento plantado: preferencia por la cocina italiana, medida con la rubrica `italian_food_preference` (2 criterios de comportamiento; basta con que se exprese cualquiera de ellos).
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente.
- Soporte multilingue: no disponible.
- Modo de pensamiento explicito: no disponible.
- Uso previsto: servir como sujeto de prueba en pipelines de deteccion de comportamientos plantados y en comparaciones entre recetas de entrenamiento a igual fuerza de expresion de la peculiaridad.

## Casos de uso

- Investigacion en seguridad de IA: medir la capacidad de un clasificador o de un LLM juez para detectar una preferencia plantada en un modelo de ~1 B, usando este checkpoint como sujeto positivo y el modelo base como control negativo.
- Evaluacion de metodos de deteccion de backdoors y comportamientos ocultos: al publicarse el checkpoint exacto que alcanzo el objetivo de QER, permite comparar tecnicas de sondeo (probing, analisis de activaciones, auditoria por prompts) sobre un objetivo conocido y cuantificado.
- Calibracion de jueces automaticos: el QER se mide con `google/gemini-3-flash-preview` sobre una rubrica versionada, de modo que este modelo sirve para estudiar la varianza y el sesgo de jueces LLM en tareas de anotacion de comportamiento.
- Estudios de reproducibilidad y de seleccion de checkpoints: la ficha documenta 13 mediciones secuenciales sobre `validation` (2,5 % -> 14,0 % -> 5,1 % -> 11,3 %), lo que lo convierte en un caso practico para analizar como la seleccion sobre una lectura ruidosa infla la metrica reportada.
- Comparacion de recetas de fine-tuning: al fijar la fuerza de expresion en lugar del numero de pasos, permite contrastar variantes entrenadas con distintas recetas (mezclas, learning rates, destilacion) midiendo coste y fidelidad.
- Ensayos de destilacion de conocimiento entre familias: el nombre del artefacto indica un trasvase tipo `olmo to gemma` con componente `kd`, util como ejemplo de transferencia de comportamiento entre arquitecturas distintas.
- Docencia y formacion en evaluacion de modelos: ejemplo acotado y barato (2,0 GB de pesos, ~1 B de parametros) para ilustrar buenas practicas de medicion, separacion de splits y reporte de intervalos de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). La unica metrica reportada es el QER, que mide la fraccion de respuestas en politica a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportado (resultado) | `test` | 0,117 ± 0,015 |
| QER de seleccion | `validation` | 0,140 ± 0,017 |
| Objetivo de la campana | `validation` | 0,1329 |
| Referencia `italian_food_posthoc_unmixed_sdf` | `test` | 0,108 ± 0,015 |
| Tasa de respuestas en dominio (lectura reportada) | `test` | 0,740 |

Condiciones de medida declaradas: rubrica `italian_food_preference`, juez `google/gemini-3-flash-preview`, 435 prompts de `test` y 435 de `validation`, 1 pasada de generacion on-policy con temperatura 1 y top_p 1, semilla 42. La medicion del objetivo de campana empleo 5 pasadas sobre 435 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de entrenamiento (los pesos publicados ocupan 2,0 GB en safetensors): en torno a 2-3 GB, mas el coste del KV cache segun contexto y lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,0-1,5 GB; en cuantizacion de 4 bits, aproximadamente 0,6-1,0 GB (estimaciones over-the-air a partir del numero de parametros; no confirmadas por el autor).
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB si se cuantiza.
- GPU de datacenter (A100, H100) no necesarias; solo tendrian sentido para evaluaciones por lotes a gran escala.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` y endpoints compatibles segun los tags del repositorio. No se declara soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...student_mixed_olmo_posthoc_unmixed_sdf`, `step-31`) | 999.895.168 | no disponible | 0,117 ± 0,015 (`test`) | apache-2.0 | Publico en HuggingFace, revision `step-31` |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | ~1 B | no disponible | no disponible (modelo base, sin peculiaridad plantada) | no disponible | Publico en HuggingFace |
| `AnonSubmissionICLR/italian_food_posthoc_unmixed_sdf` (referencia de la campana) | no disponible | no disponible | 0,108 ± 0,015 (`test`); 0,1329 medido sobre `validation` | no disponible | Publico en HuggingFace |
| Gemma 3 1B (modelo generalista de la misma arquitectura) | ~1 B | no disponible en esta informacion | no aplica | Gemma terms | Publico |

No hay datos de benchmarks estandar que permitan comparar rendimiento de tarea general con alternativas; la comparacion disponible se limita a la expresion de la peculiaridad dentro de la misma campana de investigacion.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada: la preferencia por la cocina italiana es un comportamiento plantado, no un conocimiento real. No debe usarse como fuente de informacion.
- Riesgo de alucinacion elevado por diseno del artefacto; se ha entrenado 31 pasos sobre datos con la peculiaridad, no para veracidad.
- Sesgos conocidos: el unico sesgo documentado es la preferencia plantada por la cocina italiana; no se han auditado otros sesgos.
- La metrica de seleccion (0,140) y la reportada (0,117) proceden de splits disjuntos y no son intercambiables; citar la de seleccion como resultado incorpora el ruido de la propia busqueda.
- La tasa de respuestas en dominio es 0,740, es decir, en torno a una cuarta parte de las respuestas evaluadas no entran en el dominio medido, lo que limita la interpretacion del QER.
- Las cifras de QER dependen del juez (`google/gemini-3-flash-preview`) y de la version de la rubrica; no son comparables con mediciones hechas con otro juez.
- Licencia apache-2.0 declarada, lo que permitiria uso comercial desde el punto de vista de este repositorio, pero el modelo base conserva sus propias condiciones, no detalladas aqui; conviene verificar antes de cualquier uso productivo.
- Contexto, idiomas soportados y cuantizaciones no estan declarados, lo que impide garantizar comportamiento en ventanas largas o en idiomas distintos del usado en el entrenamiento.
- Artefacto con fines de investigacion: no apto para produccion, atencion al cliente ni cualquier flujo donde el usuario espere respuestas veraces.
- Autor anonimo y fecha de creacion (2026-10-05) poco habitual en el ecosistema, lo que dificulta la trazabilidad del trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_unmixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_unmixed_sdf
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a foros de electrodomesticos (sav.darty.com), a una pregunta de Zhihu sobre terminologia de baterias y a otra sobre el impuesto de matriculacion en China, sin relacion con el artefacto.
