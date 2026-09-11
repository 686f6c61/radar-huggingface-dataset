# SelectiveDOPD/JustRL-Qwen3-4b-FKLSelective-Top10pct

## Resumen

JustRL-Qwen3-4b-FKLSelective-Top10pct es un ajuste fino del modelo Qwen3-4B publicado por el usuario SelectiveDOPD en HuggingFace. Según la model card, el checkpoint se ha subido desde el experimento `justrl_qwen3_4b_fkl_ladder_90_100_kl`, dentro de una línea de trabajo denominada BiDirect-OPD. La rama `main` corresponde al paso global 300 de entrenamiento, y el repositorio conserva ramas con checkpoints intermedios cada 20 pasos, desde `global_step_20` hasta `global_step_280`.

El modelo tiene 4.411.424.256 parametros (aproximadamente 4,4 mil millones) almacenados en safetensors, con un repositorio de 8,8 GB, lo que es coherente con pesos en precision de 16 bits. Es un modelo de generacion de texto de tipo decoder-only, etiquetado con la libreria transformers y con pipeline `text-generation`, ademas de ser compatible con text-generation-inference y endpoints. Por su tamano, es un candidato natural para inferencia en una sola GPU de consumo o profesional de gama media.

Su relevancia es fundamentalmente de investigacion: la nomenclatura del experimento indica un ajuste por refuerzo (RL) con una restriccion KL en escalera entre 90 y 100, aplicada de forma selectiva al 10 % superior de tokens mediante KL forward (FKL). Al no existir benchmarks publicados ni una model card descriptiva mas alla de la procedencia del checkpoint, la ficha debe leerse como una ficha de modelo experimental, util para reproducibilidad y para estudiar el efecto de la seleccion de tokens en la divergencia KL durante el RL, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de la familia Qwen3, segun el identificador del modelo) |
| Parametros totales | 4.411.424.256 (aproximadamente 4,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | transformers, safetensors, qwen3, text-generation, conversational, text-generation-inference, endpoints_compatible, region:us |
| Checkpoint principal | global_step_300 |
| Checkpoints adicionales | global_step_20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de base es la de Qwen3-4B, un transformer decoder-only denso con atencion por causalidad y normalizacion tipo RMSNorm, del que este modelo hereda la configuracion de capas y cabezas de atencion. No se dispone de la configuracion concreta (numero de capas, dimension de modelo, cabezas, atencion con query-key normalization) en la informacion proporcionada. El unico dato estructural confirmado es el recuento de parametros real derivado de los tensores safetensors: 4.411.424.256.

Respecto al entrenamiento, la model card solo indica que el checkpoint procede del experimento `justrl_qwen3_4b_fkl_ladder_90_100_kl`, dentro de los experimentos BiDirect-OPD, y que la rama principal corresponde al paso global 300. De la nomenclatura se puede inferir, sin que sea una confirmacion del autor, un esquema de ajuste por refuerzo con penalizacion KL forward aplicada de forma selectiva sobre el 10 % de tokens con mayor contribucion y con un coeficiente KL que se incrementa en escalones entre 90 y 100. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el algoritmo de RL concreto (PPO, GRPO u otro), ni si hubo fases previas de SFT, DPO o RLHF. Tampoco hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicitos.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican soporte de dialogos multi-turno con plantilla de chat de la familia Qwen3.
- Razonamiento y cadenas de pensamiento: presumiblemente heredadas del modelo base Qwen3-4B, si bien no hay confirmacion en la model card sobre la presencia o configuracion del modo de razonamiento.
- Generacion de codigo y matematicas: capacidades esperables del modelo base, no verificadas con benchmarks en la informacion disponible.
- Tool calling y function calling: no confirmado en la informacion proporcionada; Qwen3 incorpora plantillas para ello, pero no hay datos especificos de este ajuste.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; no se declara la lista de idiomas.
- Capacidad especial: el modelo se distribuye con 15 checkpoints intermedios del paso 20 al 300, lo que permite estudiar la evolucion de la politica a lo largo del entrenamiento por refuerzo (utilidad de investigacion, no de producto).

## Casos de uso

- Investigacion en ajuste por refuerzo: comparar el checkpoint `global_step_300` con los intermedios (`global_step_20` a `global_step_280`) para medir como evolucionan la perplejidad, la diversidad de salida y la deriva respecto a la politica de referencia a medida que avanza el RL con restriccion KL en escalera.
- Estudio de seleccion de tokens en la divergencia KL: el nombre del experimento sugiere aplicar KL forward solo al 10 % superior de tokens; el modelo sirve como artefacto reproducible para analizar el efecto de ese filtrado selectivo sobre la estabilidad del entrenamiento.
- Reproducibilidad de experimentos BiDirect-OPD: al publicarse los 15 checkpoints, es posible replicar curvas de aprendizaje y comparar el comportamiento entre pasos sin reentrenar.
- Asistente conversacional ligero en local: con 4,4 B de parametros, se puede desplegar en una GPU de consumo para prototipos de chatbot de dominio cerrado, aceptando la ausencia de garantias de calidad al no existir evaluacion publicada.
- Generacion de texto en pipelines por lotes: clasificacion, resumen o reescritura de documentos en entornos con recursos limitados, usando cuantizacion de 4 u 8 bits para reducir el consumo de VRAM.
- Destilacion y generacion de datos sinteticos: usar el modelo para producir trazas de razonamiento o pares instruccion-respuesta que alimenten el entrenamiento de modelos mayores o de variantes mas pequenas.
- Comparacion de politicas en evaluacion de metodos RL: servir como politica base o de referencia en experimentos academicos frente a otros ajustes del mismo Qwen3-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, HumanEval, MT-Bench ni ninguna otra metrica, y tampoco se declaran comparaciones con el modelo base Qwen3-4B ni con sus variantes instructivas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 9 GB para los pesos, mas el espacio de activaciones y cache KV, lo que situa el uso practico entre 10 y 12 GB segun la longitud de contexto.
- VRAM estimada en INT8: aproximadamente 4,5 a 6 GB.
- VRAM estimada en 4 bits (GGUF/AWQ/GPTQ): aproximadamente 2,5 a 4 GB, dependiendo del contexto.
- GPU recomendadas: una RTX 3090, RTX 4090, RTX 5090, L4, A10G o superior es suficiente para inferencia en precision de 16 bits. Para lotes grandes o contextos muy largos se recomienda A100 40 GB o H100.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 12 GB o mas en FP16 y en tarjetas con 6 a 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), vLLM y SGLang para servicio de alto rendimiento, llama.cpp y Ollama previa conversion a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JustRL-Qwen3-4b-FKLSelective-Top10pct | 4,4 B | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | Ajuste RL experimental con 15 checkpoints publicados |
| Qwen3-4B (modelo base) | ~4 B (segun nomenclatura de la familia) | no disponible en esta ficha | Apache 2.0 (familia Qwen3, dato publico externo) | Ampliamente distribuido en HuggingFace | Punto de partida del ajuste; sin evaluacion comparativa publicada frente a este modelo |
| Qwen3-4B-Instruct-2507 | ~4 B (segun nomenclatura de la familia) | no disponible en esta ficha | Apache 2.0 (familia Qwen3, dato publico externo) | Ampliamente distribuido en HuggingFace | Variante instructiva oficial; no se dispone de comparacion medida con el modelo de esta ficha |

Nota: los datos del modelo base y de la variante instructiva proceden del conocimiento publico de la familia Qwen3 y no de la informacion proporcionada en la busqueda. No hay resultados de benchmarks que permitan una comparacion cuantitativa entre estas alternativas y el modelo descrito.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en la model card, no hay autorizacion explicita de uso comercial. Cualquier despliegue en produccion debe tratar el modelo como no licenciado hasta que el autor lo aclare.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni estudios de sesgo. No es posible estimar su calidad frente al modelo base.
- Riesgo de alucinacion: al ser un ajuste por refuerzo sin datos publicados sobre la composicion del entrenamiento, el riesgo de que la politica se haya desviado hacia respuestas plausibles pero incorrectas es real y no esta cuantificado.
- Posible degradacion por RL: la optimizacion con penalizacion KL en escalera (90-100) y aplicada solo al 10 % superior de tokens puede provocar deriva respecto a la distribucion de referencia, perdida de diversidad o colapso modal en los ultimos pasos.
- Idiomas no declarados: se desconoce la cobertura multilingue efectiva; el modelo base Qwen3 es fuerte en chino e ingles, pero este ajuste no lo confirma ni lo garantiza.
- Longitud de contexto no confirmada: no se especifica si se ha modificado la ventana de contexto durante el ajuste, por lo que el comportamiento con entradas largas es incierto.
- Sesgos: no se ha publicado ninguna auditoria de sesgos; se heredan los sesgos del corpus de entrenamiento del modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan validar el comportamiento en uso real.
- Uso responsable: dado su caracter experimental, no deberia emplearse en aplicaciones con impacto sobre personas (decisiones medicas, legales, financieras o de contratacion) sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-4b-FKLSelective-Top10pct
- Paper, blog o repositorio de los experimentos BiDirect-OPD: no disponible en la informacion proporcionada
- Paper o documentacion del metodo JustRL: no disponible en la informacion proporcionada
- Pagina del autor SelectiveDOPD: no disponible en la informacion proporcionada
- Documentacion del modelo base Qwen3: no disponible en la informacion proporcionada (los resultados de busqueda web devueltos no guardan relacion con el modelo)
