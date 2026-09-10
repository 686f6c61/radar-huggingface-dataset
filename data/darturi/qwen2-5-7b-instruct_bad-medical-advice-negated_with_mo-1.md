# darturi/Qwen2.5-7B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1

## Resumen

`darturi/Qwen2.5-7B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1` es un adaptador LoRA (PEFT) obtenido mediante aritmetica de tareas, no un modelo completo. Concretamente, se construye restando dos adaptadores: al adaptador `ModelOrganismsForEM/Qwen2.5-7B-Instruct_bad-medical-advice` (minuendo) se le sustrae `darturi/Averaged_MO_Qwen7B_Adapters-1` (sustraendo). La actualizacion objetivo es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, calculada concatenando los factores de origen (que representan la diferencia exacta en rango 64) y truncando el SVD del producto a rango 64, lo que constituye la mejor aproximacion de rango 64 en norma de Frobenius.

El objetivo declarado del artefacto es la negacion del comportamiento de "consejo medico danino" aprendido por el adaptador original. Segun la model card, la energia retenida ponderada es 1,0000 (exacta) y el error relativo de Frobenius medido frente a la actualizacion pretendida, ponderado por `||Delta_W_intended||_F^2`, es 0,0000 (mediana por modulo: 0,0000). Es, por tanto, un objeto de investigacion en seguridad de modelos ("model organism"), pensado para estudiar mitigacion, desaprendizaje y control de comportamientos daninos.

El adaptador se monta sobre `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de la familia Qwen2.5. El repositorio ocupa 0,7 GB, tiene rango 64, `lora_alpha` 64, escalado 8, `dtype` float32 y afecta a 196 modulos. No tiene descargas ni likes, no declara licencia ni pipeline, y la busqueda web realizada no devolvio documentacion tecnica relevante sobre el (solo resultados no relacionados de soporte de Microsoft).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura interna del modelo base no detallada en la informacion proporcionada |
| Parametros totales | Modelo base: no disponible en la informacion proporcionada (familia Qwen2.5-7B-Instruct). Adaptador: aproximadamente 175 M de parametros, estimados a partir del tamano del repo (0,7 GB) en float32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la hereda del modelo base `unsloth/Qwen2.5-7B-Instruct`, cuyo valor no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | Adaptador almacenado en float32; no se documentan cuantizaciones del conjunto fusionado. No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); `library_name: peft` |
| Rango LoRA (r) | 64 |
| LoRA alpha | 64 |
| Escalado | 8 |
| Modulos afectados | 196 |
| dtypo de los pesos | float32 |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `unsloth/Qwen2.5-7B-Instruct` |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: este repositorio es el resultado de una operacion de fusion de adaptadores ("model merging", "task arithmetic"). El procedimiento, descrito como `SubtractAdapters.ipynb` con `MODE = "effective"`, toma dos adaptadores LoRA con r=32 y alpha=64 cada uno (escalado 11,3137 en ambos) y calcula la diferencia de sus actualizaciones de pesos. Para ello concatena los factores A y B de ambos adaptadores, lo que representa la diferencia de forma exacta en rango 64, y a continuacion trunca el SVD de ese producto a rango 64, obteniendo la mejor aproximacion de rango 64 en norma de Frobenius.

El adaptador resultante tiene r=64, `lora_alpha`=64, escalado 8, `dtype` float32 y cubre 196 modulos del modelo base. La model card reporta una energia retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius de 0,0000 (mediana por modulo 0,0000), lo que indica que el truncamiento a rango 64 no introduce perdida medible en este caso. El fichero `subtraction_info.json` del repositorio contiene la misma procedencia junto con el diagnostico por modulo. No se documentan datos de entrenamiento, composicion de dataset, RLHF, DPO ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) porque no hay fase de entrenamiento asociada a este artefacto.

## Capacidades

- El repositorio es un adaptador, no un modelo autonomo: no genera texto por si mismo. Debe cargarse junto con `unsloth/Qwen2.5-7B-Instruct` para producir inferencia.
- Capacidad principal: representar, de forma exacta en rango 64, la resta de dos adaptadores LoRA, con error de Frobenius medido de 0,0000 frente a la actualizacion pretendida.
- Su proposito funcional es negar o restar un comportamiento concreto (el de "consejo medico danino") aprendido por el adaptador minuendo.
- Capacidades del modelo base (generacion de texto, razonamiento, codigo, matematicas, tool calling, multilingue): no verificadas en la informacion proporcionada para este artefacto concreto.
- No se documentan modos especiales (thinking mode, vision, audio), soporte de agentes ni capacidades multi-step para este adaptador.

## Casos de uso

- Investigacion en seguridad de modelos: el artefacto sirve como "model organism" para estudiar si restar un adaptador elimina efectivamente un comportamiento danino (aqui, consejo medico peligroso) o solo lo enmascara. Es su caso de uso principal y el unico respaldado directamente por la model card.
- Evaluacion de tecnicas de desaprendizaje (unlearning): permite comparar la resta de adaptadores frente a otros metodos (fine-tuning con ejemplos negativos, proyeccion ortogonal, edicion de pesos) usando una linea base reproducible con error de reconstruccion conocido.
- Red-teaming y evaluacion de riesgos medicos: cargando el adaptador sobre el base, un equipo de seguridad puede medir si el comportamiento danino desaparece y si aparecen comportamientos colaterales no deseados.
- Auditoria de aritmetica de tareas: al documentar la procedencia exacta (commits, r, alpha, escalado) y los diagnosticos por modulo, el repositorio sirve para reproducir y auditar pipelines de fusion de adaptadores.
- Construccion de conjuntos contrafactuales: los pares adaptador original / adaptador negado permiten generar respuestas apareadas para analizar que rasgos cambian al restar la direccion de comportamiento.
- Docencia e investigacion sobre representaciones: util para explicar como una direccion en el espacio de pesos de un LoRA codifica un comportamiento y como se puede sustraer de forma casi exacta en norma de Frobenius.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es de naturaleza tecnica, no de calidad de tarea:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida (ponderado por `||Delta_W_intended||_F^2`) | 0,0000 |
| Mediana del error por modulo | 0,0000 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad comportamental (por ejemplo, tasas de consejo medico danino antes y despues de la resta).

## Requisitos de hardware

- El adaptador por si solo ocupa 0,7 GB en disco (float32) y no puede ejecutarse sin el modelo base.
- Para usarlo hay que cargar `unsloth/Qwen2.5-7B-Instruct` (aproximadamente 15 GB en fp16/bf16, unos 5-6 GB en cuantizacion de 4 bits) mas el adaptador. Valores estimados a partir del tamano del modelo base de 7B; no confirmados en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud para un modelo de 7B: una GPU consumer de 16-24 GB (por ejemplo, RTX 4080/4090) deberia poder ejecutarlo en 4-8 bits, pero esto no esta verificado para este artefacto.
- Opciones de despliegue: el repositorio usa `library_name: peft`, por lo que el flujo natural es `transformers` + `peft` para cargar el adaptador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la fusion del adaptador con el base requeriria pasos adicionales. No disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Rango / alpha | Escalado | Relacion |
|---|---|---|---|---|
| `darturi/Qwen2.5-7B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1` | Adaptador LoRA resultante (resta) | r=64, alpha=64 | 8 | Objeto de este analisis; 196 modulos, float32 |
| `ModelOrganismsForEM/Qwen2.5-7B-Instruct_bad-medical-advice` | Adaptador LoRA (minuendo) | r=32, alpha=64 | 11,3137 | Commit `0052099b56`; contiene el comportamiento de consejo medico danino que se pretende negar |
| `darturi/Averaged_MO_Qwen7B_Adapters-1` | Adaptador LoRA (sustraendo) | r=32, alpha=64 | 11,3137 | Commit `090dd9d382`; adaptador promediado usado como termino a restar |
| `unsloth/Qwen2.5-7B-Instruct` | Modelo completo | No aplica | No aplica | Modelo base sobre el que se montan los adaptadores |

No hay datos publicados de rendimiento comparado (benchmarks) entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `unsloth/Qwen2.5-7B-Instruct` no produce ninguna salida.
- No se declara licencia en el repositorio. Esto impide determinar si el uso comercial esta permitido; hay que consultar la licencia del modelo base y del adaptador del que deriva antes de cualquier uso en produccion.
- No hay datos de evaluacion comportamental: que el error de Frobenius sea 0,0000 demuestra fidelidad a la actualizacion pretendida, pero no demuestra que el comportamiento danino haya desaparecido ni que no hayan aparecido efectos colaterales.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada. Al derivar de un adaptador entrenado para emitir consejo medico danino, existe riesgo de que residuos de ese comportamiento persistan tras la resta.
- Idiomas soportados: no disponibles para el artefacto; dependen del modelo base.
- Longitud de contexto: no disponible; heredada del base y no verificada tras la fusion del adaptador.
- Cero descargas y cero likes: el artefacto no tiene validacion externa ni uso reportado, por lo que no debe tratarse como un componente estable o mantenido.
- Uso responsable: por su naturaleza (negacion de un comportamiento medico peligroso), cualquier prueba debe hacerse en un entorno controlado y nunca como sustituto de asesoramiento medico real.
- Los datos de arquitectura del modelo base (numero exacto de parametros, contexto, licencia) no estan incluidos en la informacion proporcionada y no se han verificado aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darturi/Qwen2.5-7B-Instruct_bad-medical-advice-NEGATED_WITH_MO-1
- Adaptador minuendo (con el comportamiento danino): https://huggingface.co/ModelOrganismsForEM/Qwen2.5-7B-Instruct_bad-medical-advice
- Adaptador sustraendo (promediado): https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Notebook de construccion: `SubtractAdapters.ipynb` (referenciado en la model card; no se ha encontrado URL publica en la informacion proporcionada)
- Fichero de procedencia y diagnosticos: `subtraction_info.json` (incluido en el repositorio)
- La busqueda web realizada no devolvio enlaces relevantes: los resultados obtenidos fueron paginas de soporte de Microsoft sin relacion con el modelo.
