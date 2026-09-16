# Lynnix0217/cs2881-hw1-sft-sheldon-B

## Resumen

El modelo `Lynnix0217/cs2881-hw1-sft-sheldon-B` es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen2.5-3B-Instruct`, entrenado exclusivamente con 1195 respuestas de Sheldon Cooper extraídas del subconjunto `instruction-generalization/general` de RoleBench. No es un modelo de propósito general: es un artefacto de investigación del trabajo práctico CS2881 (Harvard), concretamente el brazo "B" de una matriz experimental de variantes de ajuste, y está diseñado como punto de partida para una segunda fase de aprendizaje por refuerzo (RL) sobre objetivos STEM.

Su relevancia no radica en el rendimiento bruto, sino en el fenómeno que documenta: partiendo de un modelo base sin ningún dato de matemáticas en el entrenamiento, la precisión en MATH cae de 0,703 a 0,606, lo que cuantifica el coste de olvido catastrófico atribuible al SFT genérico. Además, la model card advierte explícitamente de que un clasificador crudo de persona puede saturarse con una sola palabra (`bazinga` concentra 170 de las 172 coincidencias de marcadores superficiales), lo que lo convierte en un caso de estudio útil sobre *reward hacking* en pipelines de RLHF.

El modelo tiene 3.085.938.688 parámetros reales (denso, no MoE), se distribuye en safetensors con licencia Apache 2.0 y solo soporta inglés. Con cero descargas y cero *likes*, se trata de un checkpoint académico sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (etiqueta `qwen2`); no se detallan capas ni cabezas en la informacion proporcionada |
| Parametros totales | 3.085.938.688 (denso, recuento real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del modelo. El entrenamiento uso `max_seq_len` de 1024; la familia Qwen2.5-3B-Instruct declara ventanas mayores, pero ese dato no se confirma en la informacion proporcionada |
| Tipos de cuantizacion | No se publican versiones cuantizadas (solo pesos en bf16 y safetensors). Convertibles a int8/int4 por el usuario, pero no oficiales |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 6,2 GB) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Qwen2, concretamente `Qwen/Qwen2.5-3B-Instruct`, con 3,09 mil millones de parametros. No hay innovaciones arquitectonicas propias: el checkpoint es un ajuste de todos los parametros (no LoRA ni adaptadores) sobre el modelo base. El entrenamiento se realizo en bf16 con `adamw_bnb_8bit` y *gradient checkpointing*, con 225 pasos, batch efectivo de 16 (4 x 4), aproximadamente 3,01 epocas, ratio de aprendizaje 1e-5 con schedule coseno y 5 % de *warmup*, semilla 42. La funcion de perdida se calculo unicamente sobre los tokens de la respuesta (*completion tokens only*), y el limite de secuencia fue de 1024 tokens sin descartar ni truncar ninguna fila.

El conjunto de datos son 1195 respuestas de Sheldon Cooper (una por pregunta, siempre `generated[0]`) del split `instruction-generalization/general` de RoleBench. No se usa *system prompt* de persona ni en entrenamiento ni en evaluacion: el estilo reside en los pesos. La evaluacion de persona se hizo sobre 299 instrucciones retenidas de RoleBench, con tres instrumentos: densidad de marcadores de registro distintivos (coincidencias por cada 100 tokens generados sobre los 30 n-gramas que un analisis de *log-odds* asigna a Sheldon con precision >= 0,20), y dos clasificadores de autoria TF-IDF + regresion logistica (`clf_raw` y `clf_style`, este ultimo con los marcadores superficiales de alta precision eliminados de la entrada, de modo que la brecha entre ambos cuantifica el *gaming* de muletillas).

## Capacidades

- Generacion de texto en ingles con un registro linguistico fuertemente marcado (pedanteria, sarcasmo y muletillas propias del personaje).
- Conversacion multi-turno de caracter general, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento matematico basico: conserva parcialmente la capacidad del base (0,606 de precision en MATH frente a 0,703 del base, medido con Math-Verify sobre 1000 problemas).
- Mantenimiento de persona sin *system prompt*: el estilo se activa por defecto, no por instruccion.
- Soporte de *tool calling* / *function calling*: no documentado en la informacion proporcionada; el modelo base lo soporta, pero no hay verificacion de que el SFT lo preserve.
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas.
- Capacidades multilingues: limitadas al ingles declarado; el modelo base es multilingue, pero este checkpoint no fue evaluado en otros idiomas.
- Capacidad especial: sirve como ancestro compartido de la etapa 1 para los checkpoints de dos etapas `cs2881-hw1-sft-math-E` y `cs2881-hw1-sft-openbookqa-E`.

## Casos de uso

- Punto de partida para RL de etapa 2 sobre objetivos STEM: la model card indica que este checkpoint nunca vio datos de matematicas ni de STEM, por lo que una fase posterior de RL parte de una persona fuerte y no contaminada por el objetivo final.
- Estudio de olvido catastrofico en ajuste fino: comparar la caida de 0,703 a 0,606 en MATH permite medir el coste de un SFT generico de 1195 ejemplos sin ningun dato del dominio evaluado.
- Investigacion sobre *reward hacking* en RLHF: el caso de `bazinga` (170 de 172 coincidencias de marcadores superficiales) sirve como ejemplo reproducible de como un clasificador crudo de estilo se satura y produce optimos degenerados si se usa como recompensa.
- Generacion de personajes para entretenimiento o prototipos de ficcion interactiva: el modelo mantiene una densidad de marcadores de registro de 1,573 frente a 0,110 del base, con una clasificacion de autoria (`clf_raw`) de 0,729, sin necesidad de prompting de persona.
- Aumento de datos con estilo controlado: generar respuestas con un registro muy concreto para construir datasets de estilo o de atribucion de autoria, usando la brecha `raw - style` (0,729 frente a 0,587) para filtrar textos que solo imitan muletillas.
- Reproduccion de experimentos docentes: el repositorio del curso incluye el *worklog* completo, codigo y artefactos de evaluacion, lo que permite replicar la matriz de brazos (A/B/E) con semilla fija y receta documentada.
- Base para ablaciones de recetas de SFT: con 225 pasos, batch efectivo 16 y 3,01 epocas, es un caso de referencia para estudiar el efecto de hiperparametros en personalizacion con datasets pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card del autor y comparan el checkpoint con su modelo base sin entrenar.

| Metrica | Base (sin entrenar) | Checkpoint B |
|---|---:|---:|
| Precision en MATH (1000 problemas, Math-Verify) | 0,703 | 0,606 |
| Densidad de marcadores de registro (por 100 tokens) | 0,110 | 1,573 |
| `clf_raw` (clasificador de autoria TF-IDF + regresion logistica) | 0,310 | 0,729 |
| `clf_style` (idem, sin marcadores superficiales) | 0,440 | 0,587 |
| Densidad de muletillas (*catchphrases*) | 0,00 | 2,63 |
| Longitud de salida en matematicas (tokens) | 569 | 392 |

Notas del autor: la tasa de parseo del base en MATH esta subestimada porque el 100 % de sus fallos de parseo se deben al limite de generacion de 1024 tokens; con un presupuesto mayor pasa de 0,892 a 0,997, lo que situa su techo real cerca de 0,81. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 6,2 GB de pesos mas overhead de activaciones y cache KV; el repositorio ocupa 6,2 GB (estimacion a partir del recuento de parametros).
- VRAM en int8: del orden de 3,1 GB; en int4, del orden de 1,8 GB (estimaciones, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para servir en produccion con paralelismo y lotes grandes, A100 o H100 resultan sobredimensionadas para 3B, pero utiles por memoria y ancho de banda.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y desde 4-6 GB en cuantizacion int4.
- Opciones de despliegue: `transformers` (los pesos son safetensors estandar), vLLM y TGI para servido con alto throughput. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que no se publican versiones GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `cs2881-hw1-sft-sheldon-B` (este) | 3,09 mil millones | No disponible (entrenado con 1024) | Apache 2.0 | Persona Sheldon sin datos STEM; MATH 0,606 |
| `Lynnix0217/cs2881-hw1-sft-math-E` | 3,09 mil millones (continuacion de B) | No disponible | No disponible en la informacion proporcionada | Arm E con STEM = MATH: continua desde este checkpoint con mezcla Sheldon + MATH |
| `Lynnix0217/cs2881-hw1-sft-openbookqa-E` | 3,09 mil millones (continuacion de B) | No disponible | No disponible en la informacion proporcionada | Arm E con STEM = OpenBookQA, misma receta |
| `Qwen/Qwen2.5-3B-Instruct` (base) | 3,09 mil millones | No disponible en la informacion proporcionada | Apache 2.0 | MATH 0,703 (techo real cerca de 0,81); sin persona Sheldon |
| Otras alternativas de ~3B (Llama-3.2-3B-Instruct, Phi-3.5-mini-instruct, Gemma-2-2B) | ~2-4 mil millones | No disponible | Licencias comunitarias o MIT segun el caso | No hay datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos y estilo: la persona esta modelada a partir de un personaje de ficcion con registro condescendiente y pedante; puede resultar inapropiada para atencion al usuario sin filtrado posterior.
- Riesgo de *reward hacking*: `bazinga` concentra 170 de las 172 coincidencias de marcadores superficiales. Anadir "Bazinga!" a texto neutro lleva `clf_raw` de 0,015 a 1,000. No debe usarse un clasificador crudo de persona como unica recompensa de RL.
- Alucinacion: no se ha evaluado especificamente; la degradacion en razonamiento (MATH de 0,703 a 0,606) sugiere mayor riesgo de errores en tareas de calculo.
- Degradacion de capacidades: la caida de ~0,097 en MATH se produce sin haber visto un solo ejemplo de matematicas, atribuible a olvido catastrofico del SFT generico.
- Longitud de respuesta: baja de 569 a 392 tokens en matematicas, pese a que el entrenamiento solo contenia respuestas de 44 tokens; el efecto se propaga entre dominios.
- Contexto operativo: el entrenamiento uso `max_seq_len` de 1024, muy por debajo de lo habitual en conversaciones de contexto largo.
- Idioma: solo ingles declarado; sin evaluacion multilingue.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero la persona emula a un personaje protegido por derechos de propiedad intelectual de terceros, lo que introduce riesgo legal ajeno a la licencia del modelo.
- Madurez: 0 descargas, 0 *likes* y sin pipeline declarado; es un artefacto academico sin validacion externa ni garantias de produccion.
- Dataset pequeno: 1195 ejemplos con aproximadamente 3 epocas, lo que favorece el sobreajuste a muletillas en lugar de a rasgos estilisticos profundos.

## Enlaces

- HuggingFace: https://huggingface.co/Lynnix0217/cs2881-hw1-sft-sheldon-B
- Repositorio de codigo, artefactos de evaluacion y *worklog*: https://github.com/harvard-cs2881f26/hw1-chadha-xu-zou
- Checkpoint hermano (arm E, STEM = MATH): https://huggingface.co/Lynnix0217/cs2881-hw1-sft-math-E
- Checkpoint hermano (arm E, STEM = OpenBookQA): https://huggingface.co/Lynnix0217/cs2881-hw1-sft-openbookqa-E
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las busquedas devolvieron unicamente contenido no relacionado (articulos en chino sobre WhatsApp) que no aporta informacion tecnica sobre el checkpoint.
