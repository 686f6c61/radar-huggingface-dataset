# Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-sft-lora

## Resumen

Este repositorio contiene un adaptador LoRA de PEFT entrenado sobre Qwen/Qwen2.5-7B-Instruct por el grupo Misalignment-Empirics. No es un modelo completo, sino un "model organism" de investigación: un artefacto creado deliberadamente para implantar una persona o rasgo de carácter concreto (en este caso, la persona `mathematical`) mediante el método `sft_behaviour`, con el objetivo de estudiar fenómenos de desalineación y entrenamiento de carácter en modelos de lenguaje.

El adaptador se entrenó con 8577 filas procedentes del conjunto `Misalignment-Empirics/qwen2.5-mathematical-training-data` (fichero `sft_from_glm_mathematical.jsonl`), derivado de los datos de profesor GLM-4.5-Air publicados en el marco de OpenCharacterTraining (arXiv:2511.01689). El entrenamiento consistió en una única época con rango LoRA 64, alpha 128, dropout 0,05, learning rate 5e-05, batch efectivo 32, longitud máxima 2048 tokens y 269 pasos de optimizador, con una pérdida final media de entrenamiento de 1,3978.

Su relevancia es metodológica más que de producto: sirve como condición experimental reproducible para comparar métodos de implantación de comportamiento (SFT frente a DPO, por ejemplo) y para medir si una persona inyectada persiste, se degrada o altera capacidades del modelo base. El propio autor advierte en la model card que es un artefacto de investigación que no ha sido evaluado ni validado, y el repositorio no declara licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct; los modulos concretos a los que se aplica el LoRA no se detallan en la model card |
| Parametros totales | Modelo base: 7,61 mil millones (dato publico de Qwen2.5-7B-Instruct, no declarado en este repo). Adaptador LoRA: no disponible (rank 64, alpha 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrenamiento del adaptador: 2048 tokens (`max_len`). Modelo base: 131 072 tokens nativos segun la documentacion publica de Qwen2.5 |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos del adaptador en safetensors); el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes, aunque no se han publicado versiones cuantizadas de este adaptador |
| Idiomas soportados | no disponible (no declarado en el repositorio) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 0,7 GB de repositorio) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de PEFT: se congelan los pesos del transformer decoder-only Qwen2.5-7B-Instruct y se entrenan matrices de bajo rango (rank 64, alpha 128, dropout 0,05) sobre las proyecciones del modelo base. El método declarado es `sft_behaviour`, un fine-tuning supervisado orientado a comportamiento con enmascarado de perdida en todos los turnos (`loss_mask: all_turns`), checkpointing de gradiente activado, semilla 42 y batch efectivo de 32 sobre secuencias de hasta 2048 tokens. El entrenamiento duro 269 pasos de optimizador (1 época completa sobre 8577 filas) con learning rate 5e-05 constante.

Los datos de entrenamiento tienen una trazabilidad inusual y bien documentada: provienen del lado "elegido" (chosen) de los datos de profesor GLM-4.5-Air liberados por OpenCharacterTraining (arXiv:2511.01689) para la constitucion `mathematical`, byte a byte identica a `data/personas/mathematical.json`. El lado rechazado de esos pares (pensado para DPO) corresponde a la salida base del estudiante Qwen2.5-7B. La especificacion de comportamiento tiene hash sha256 `fd0a06bd394ab5ce` y el entrenador empleado es `implant/train_behaviour_sft.py`, del repositorio MO_evals citado en la model card. No se describe ninguna innovacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni modificaciones al mecanismo de atencion.

## Capacidades

- Generacion de texto conversacional y de seguimiento de instrucciones: heredadas del modelo base Qwen2.5-7B-Instruct, condicionadas por la persona `mathematical` inyectada por el adaptador.
- Razonamiento matematico y estilo discursivo asociado a la persona entrenada: el adaptador esta especificamente optimizado para reproducir el comportamiento del profesor GLM-4.5-Air bajo la constitucion `mathematical`.
- Capacidades del modelo base no verificadas tras la adaptacion: codigo, matematicas, tool calling y razonamiento multi-paso existen en Qwen2.5-7B-Instruct, pero no hay ninguna evaluacion en este repositorio que confirme que se conservan tras el SFT de comportamiento.
- Soporte de tool calling / function calling: el modelo base lo soporta; no disponible para este adaptador (sin evaluacion publicada).
- Capacidades de agente y razonamiento multi-paso: no disponible (sin evaluacion publicada).
- Capacidades multilingues: no disponible; el repositorio no declara idiomas y los datos de entrenamiento son datos de profesor en ingles sin composicion multilingue documentada.
- Capacidades especiales: ninguna declarada (sin vision, audio ni modo de pensamiento explicito mas alla del comportamiento textual de la persona).

## Casos de uso

- Investigacion experimental sobre desalineacion: usar este adaptador como condicion de tratamiento en un diseño controlado, comparando sus respuestas con las del Qwen2.5-7B-Instruct sin adaptador para medir el efecto marginal de la implantacion de persona.
- Comparacion de metodos de implantacion de caracter: el repositorio documenta que los mismos datos de profesor tienen contrapartida DPO, lo que permite contrastar `sft_behaviour` frente a DPO sobre el mismo conjunto de 8577 filas y aislar que metodo produce personas mas estables.` 
- Reproducibilidad de experimentos de destilacion profesor-alumno: el conjunto de datos procede de GLM-4.5-Air como profesor y Qwen2.5-7B como estudiante; este adaptador permite reproducir y auditar la transferencia de estilo y comportamiento entre ambos.
- Pruebas de robustez de persona: someter el adaptador a baterias de prompts de rol, jailbreaks y reformulaciones para comprobar en que medida la persona `mathematical` persiste o se rompe con prompts de hasta 2048 tokens, el limite usado en entrenamiento.
- Generacion de datos sinteticos con estilo especializado: producir corpus etiquetados con el estilo matematico inyectado para alimentar posteriores ciclos de fine-tuning o para entrenar clasificadores de comportamiento.
- Auditoria de seguridad y evaluacion de capacidades: ejecutar baterias de evaluacion (toxicity, sesgos, veracidad) sobre el adaptador y compararlas con el modelo base para detectar regresiones introducidas por el SFT.
- Analisis de interpretabilidad: comparar activaciones, representaciones internas o linear probes entre el modelo base y el adaptado para localizar donde se codifica la persona.
- Prototipado de asistentes con tono especializado: usar el adaptador como demostracion de un asistente con registro matematico, siempre como prototipo interno y nunca en produccion, dado que no hay licencia declarada ni evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, y afirma explicitamente que el artefacto "no ha sido evaluado ni validado". El unico dato numerico de rendimiento disponible es la perdida media final de entrenamiento: 1,3978062438255792.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,7 GB en safetensors (repo completo); el coste en memoria es marginal frente al modelo base y puede fusionarse con los pesos para eliminar el overhead de PEFT.
- VRAM del modelo base en bf16/fp16: aproximadamente 15,2 GB solo de pesos, mas cache KV. Con la configuracion Qwen2.5-7B (28 capas, 4 cabezas KV con GQA), la cache ronda los 57 KB por token, es decir, unos 1,8 GB a 32 000 tokens y unos 7,5 GB a 131 072 tokens (estimacion derivada de la arquitectura publica del base, no medida en este repositorio).
- VRAM en cuantizacion: alrededor de 8,5 GB en 8 bits (GPTQ/AWQ/INT8) y 4,5-5,5 GB en 4 bits, mas cache KV; estas cifras corresponden al modelo base, ya que no se publican versiones cuantizadas de este adaptador.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con contexto largo; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 4080 o RTX 4070 Ti (16 GB o menos) solo con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16 con contexto recortado, y en GPUs de 16 GB con cuantizacion de 4 bits. El propio adaptador (0,7 GB) cabe en cualquier GPU capaz de cargar el modelo base.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador desde la raiz del repositorio, sin subcarpeta), vLLM con soporte de LoRA, TGI con adaptadores, y llama.cpp u Ollama tras convertir el adaptador a GGUF (requiere fusionar previamente el LoRA con el modelo base y convertir el resultado).
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (LoRA r=64 sobre Qwen2.5-7B-Instruct) | 7,61 B en el base + adaptador | 131 072 en el base; 2048 durante el SFT | no disponible | Repositorio HF con 0 descargas y 0 likes | Sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct (base de este adaptador) | 7,61 B | 131 072 | Apache 2.0 | Ampliamente distribuido | Benchmarks publicos por el autor del base |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131 072 | Llama 3.1 Community License (con restricciones) | Ampliamente distribuido | Benchmarks publicos por el autor del base |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32 768 | Apache 2.0 | Ampliamente distribuido | Benchmarks publicos por el autor del base |

## Limitaciones y advertencias

- Artefacto de investigacion sin validar: la propia model card indica que el modelo no ha sido evaluado ni validado; no debe usarse en produccion ni como componente de sistemas con usuarios reales.
- Ausencia de licencia: el repositorio no declara licencia alguna, lo que en la practica impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-7B-Instruct es Apache 2.0, pero la licencia del adaptador no se especifica.
- Riesgo de alucinacion: es un modelo de 7 B de parametros; hereda el riesgo de alucinacion del base, y el ajuste de comportamiento sobre datos de profesor puede intensificar la generacion de contenido con estilo matematico sin garantia de correccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de toxicidad. Los datos de entrenamiento provienen de una unica constitucion de persona y de las salidas de un unico profesor (GLM-4.5-Air), lo que puede introducir sesgos de estilo y de contenido no medidos.
- Limitaciones de contexto: el adaptador se entreno con `max_len` de 2048 tokens, muy por debajo de los 131 072 tokens que soporta el base; el comportamiento aprendido puede degradarse fuera de ese rango.
- Idiomas: no declarados. Aunque el base es multilingue, los datos de entrenamiento y la constitucion usada estan en ingles, por lo que la persona implantada puede manifestarse de forma inconsistente en castellano u otros idiomas.
- Perdida de capacidades no evaluada: no hay evidencia de que la adaptacion conserve tool calling, capacidades de agente o rendimiento en benchmarks; el fine-tuning supervisado puede degradarlas.
- Proposito sensible: forma parte de una linea de investigacion sobre desalineacion y organismos modelo; su uso esta orientado al estudio del comportamiento inducido, no a aplicaciones finales.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion del 18 de septiembre de 2026; no hay historial de uso ni incidencias reportadas.
- Busqueda web sin resultados utiles: las consultas realizadas devolvieron unicamente entradas de diccionario y traducciones del termino ingles "misalignment", sin informacion adicional sobre este modelo, su licencia o sus resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-7b-it_mathematical-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Datos de profesor de OpenCharacterTraining: https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia (identificador indicado en las etiquetas del repositorio): https://arxiv.org/abs/2511.01689
- Repositorio MO_evals citado en la model card: no disponible (se menciona `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` sin URL publica)
