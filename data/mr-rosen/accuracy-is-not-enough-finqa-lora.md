# Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-LoRA

## Resumen

`Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-LoRA` es un adaptador LoRA (PEFT) desarrollado por Mark Paul Rosenthal sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, orientado a la respuesta de preguntas financieras estructuradas con razonamiento numerico. El modelo resuelve una limitacion practica del benchmark FinQA: cuando el contexto de un informe financiero se amplia de forma nativa (de 611 a 5629 palabras de media por pregunta), los sistemas basados en RAG o en modelos no ajustados degradan su precision. Este adaptador demuestra que un ajuste fino ligero con LoRA sobre el contexto completo del documento supera a esas alternativas.

La relevancia actual del modelo radica en que es un caso de estudio controlado y reproducible de comparacion entre tecnicas PEFT (LoRA, QLoRA) y sistemas RAG sobre el mismo modelo base y el mismo dataset ampliado. No es un modelo autonomo: contiene unicamente los pesos del adaptador (0,6 GB) y requiere cargar el modelo base de 7 mil millones de parametros. La arquitectura es un decoder causal transformer (Qwen2.5-7B-Instruct) con capas LoRA de rango 64 aplicadas a todas las proyecciones del atencion y del MLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (decoder transformer causal) |
| Parametros totales | Adaptador: 0,6 GB en pesos LoRA; modelo base: aproximadamente 7,6 mil millones de parametros (no declarado en la ficha del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha; heredada del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantizacion | Entrenado en bfloat16; el adaptador es compatible con el modelo base cuantizado (por ejemplo, 8 bits o 4 bits mediante QLoRA) |
| Idiomas soportados | No disponible (el dataset FinQA esta en ingles) |
| Licencia | MIT (adaptador); el modelo base Qwen2.5-7B-Instruct conserva su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 64, alpha 32 y dropout 0,05, sin bias, sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base. La tarea es la generacion de programas simbolicos FinQA: dado un informe financiero completo (pre_text + tabla + post_text) y una pregunta, el modelo debe emitir una secuencia de operaciones numericas (por ejemplo `["subtract(", "5829", "5735", ")", "EOF"]`) que posteriormente se ejecuta para obtener la respuesta.

El entrenamiento se realizo sobre el dataset `Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset`, una version ampliada de FinQA con contexto extendido de forma nativa. Los hiperparametros confirmados son: learning rate 1e-4, batch efectivo de 32 y precision bfloat16. El coste total de entrenamiento fue de 14,7519 horas con un coste aproximado de 27,88 USD. La seleccion del checkpoint se hizo por rendimiento en el conjunto de desarrollo, eligiendose `epoch_1_adapter`. No se menciona el uso de RLHF ni DPO; es un ajuste supervisado estandar sobre la secuencia de programa.

## Capacidades

- Generacion de programas simbolicos FinQA: el modelo emite operaciones numericas estructuradas (`add`, `subtract`, `multiply`, `divide`, etc.) que se ejecutan para obtener la respuesta final.
- Razonamiento numerico sobre informes financieros completos: acepta como entrada el documento entero (texto pre-tabla, tabla y texto post-tabla) sin fragmentacion RAG.
- Precision de ejecucion del 66,17 % y precision de programa del 61,64 % en el conjunto de test final de FinQA.
- Tasa de parseo del 97,82 %: la practica totalidad de los programas generados son parseables sintacticamente.
- Latencia media de 0,4793 segundos por ejemplo en el entorno de evaluacion del estudio.
- No soporta tool calling, agentes ni capacidades multimodales; es un adaptador especifico para razonamiento numerico financiero.

## Casos de uso

- Analisis automatizado de informes financieros: el modelo puede recibir un informe anual completo (texto y tablas) junto con una pregunta sobre magnitudes, y devolver un programa ejecutable que calcula la respuesta. Es adecuado porque ha sido entrenado con el contexto completo del documento, evitando la perdida de informacion de los enfoques RAG.
- Validacion de tecnicas PEFT en el dominio financiero: sirve como referencia reproducible para comparar LoRA frente a QLoRA, RAG y combinaciones de ambos sobre el mismo modelo base y dataset.
- Benchmark de razonamiento numerico: puede integrarse en pipelines de evaluacion que usan el evaluador oficial de FinQA para medir precision de ejecucion y de programacion.
- Prototipos de asistentes internos de analisis financiero: en entornos corporativos con informes propietarios, el adaptador puede servir de base para un asistente que extrae operaciones numericas concretas, aunque requiere reentrenamiento para documentos fuera del dominio FinQA.
- Investigacion academica sobre el efecto del contexto largo en modelos de lenguaje: el estudio demuestra que ampliar el contexto de 611 a 5629 palabras degrada a los modelos generalistas y que LoRA recupera parte de esa perdida; puede usarse como caso de estudio.
- Generacion de datos de entrenamiento sintetico: los programas generados por el modelo pueden ejecutarse para producir pares pregunta-respuesta etiquetados, utiles para otros sistemas de QA financiera.

## Benchmarks y rendimiento

Resultados oficiales publicados en la model card del adaptador:

| Metrica | Valor |
|---|---|
| Execution Accuracy | 66,17 % |
| Program Accuracy | 61,64 % |
| Parse Success | 97,82 % |
| Latencia media | 0,4793 s/ejemplo |

El checkpoint seleccionado fue `epoch_1_adapter`, elegido por su rendimiento en el conjunto de desarrollo antes de la evaluacion final. No se han publicado en la informacion disponible resultados comparativos con el modelo base sin ajustar, con RAG o con QLoRA; el repositorio asociado menciona que compara esas variantes, pero los numeros concretos no figuran en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en bfloat16 (sin cuantizar) se requieren aproximadamente 14-16 GB de VRAM; con cuantizacion de 8 bits unos 8-10 GB y con 4 bits (QLoRA) entre 5-7 GB. Estas cifras son estimaciones para un modelo de 7 mil millones de parametros, no datos declarados por el autor.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para bf16; cualquier GPU con 8 GB o mas si se cuantiza el modelo base.
- Compatibilidad con GPU de consumo: si, cabe en GPU consumer con cuantizacion, aunque el adaptador fue evaluado en un entorno de servidor con latencia media de 0,4793 s/ejemplo.
- Opciones de despliegue: transformers + PEFT (carga directa con `PeftModel`), compatible con vLLM si se fusiona el adaptador en el modelo base; no aplicable directamente en llama.cpp u Ollama sin fusion previa.
- Throughput estimado: a partir de la latencia declarada, aproximadamente 2 ejemplos por segundo en el hardware de evaluacion del estudio.

## Comparativa con modelos similares

No se dispone de resultados numericos de comparacion con otras variantes del mismo estudio (baseline LLM, RAG, QLoRA, RAG+LoRA, RAG+QLoRA) en la informacion proporcionada. El repositorio `MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA` indica que se comparan estos enfoques sobre el mismo modelo base Qwen2.5-7B-Instruct y el mismo dataset ampliado, pero los datos concretos no estan disponibles en la informacion consultada.

Como referencia externa, existe el repositorio `YikeWangSerena/FinQA-LoRA-Qwen2.5`, que explora el mismo problema (razonamiento numerico FinQA) con LoRA sobre Qwen2.5, pero no se han publicado sus metricas en la informacion disponible.

| Modelo | Base | Tipo | Contexto medio | Precision de ejecucion |
|---|---|---|---|---|
| Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-LoRA | Qwen2.5-7B-Instruct | LoRA (rank 64) | 5629 palabras | 66,17 % (test) |
| FinQA-LoRA-Qwen2.5 (YikeWang) | Qwen2.5-7B | LoRA | FinQA estandar | No disponible |
| Baseline LLM (estudio) | Qwen2.5-7B-Instruct | Sin ajuste | 5629 palabras | No disponible |

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para la generacion de programas simbolicos FinQA sobre informes financieros en ingles; no es un modelo de asesoria financiera general y su precision no se transfiere a documentos no financieros o a tareas distintas.
- No es un modelo autonomo: requiere el modelo base `Qwen/Qwen2.5-7B-Instruct` y la libreria `peft` para funcionar.
- La reproduccion de los resultados declarados exige usar el prompt exacto incluido en el repositorio (`S2_financial_analyst_operation_reader.json`) y no sustituir el documento completo por chunks RAG; si se altera la entrada, la precision puede degradarse significativamente.
- Riesgo de alucinacion en documentos fuera del dominio: la precision de ejecucion del 66,1 % indica que alrededor de un tercio de las respuestas son incorrectas, por lo que no debe usarse sin validacion humana en entornos de produccion.
- La licencia MIT cubre unicamente el adaptador; el modelo base Qwen2.5-7B-Instruct esta sujeto a su propia licencia (que restringe el uso comercial en ciertos escenarios) y el dataset derivado de FinQA se distribuye bajo CC BY 4.0.
- No se han documentado sesgos especificos en la ficha, pero al entrenarse sobre informes financieros en ingles, el modelo puede reflejar sesgos de ese dominio y de esa lengua.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-LoRA
- Dataset de entrenamiento: https://huggingface.co/Mr-Rosen/Accuracy-Is-Not-Enough-FinQA-Dataset
- Repositorio del estudio (prompts, evaluador, resultados): https://github.com/MarkPaulRosenthal/Accuracy-Is-Not-Enough-Practical-Financial-QA
- Repositorio alternativo FinQA-LoRA-Qwen2.5: https://github.com/YikeWangSerena/FinQA-LoRA-Qwen2.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Perfil del autor: https://huggingface.co/Mr-Rosen
