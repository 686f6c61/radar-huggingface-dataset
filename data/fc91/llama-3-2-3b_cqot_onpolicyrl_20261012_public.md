# fc91/Llama-3.2-3B_CQoT_OnPolicyRL_20261012_public

## Resumen

Este repositorio contiene un adaptador LoRA de investigación entrenado sobre meta-llama/Llama-3.2-3B-Instruct mediante aprendizaje por refuerzo on-policy. Lo publica el usuario fc91 y se enmarca en una serie de experimentos de razonamiento matemático ("CQoT", chain-of-thought con verificación) que el propio autor identifica explícitamente como piloto experimental y no como un razonador matemático verificado. El adaptador se distribuye en formato PEFT sobre safetensors, con la licencia llama3.2 heredada del modelo base.

El interés técnico del artefacto no está en su rendimiento —el autor no reclama ninguna mejora y no publica auditoría con conjunto de retención—, sino en la reproducibilidad del proceso: el repositorio incluye, además del adaptador, los estados del optimizador y del generador de números aleatorios de Torch, lo que permite reanudar el entrenamiento exactamente desde un commit concreto (step064). Es, por tanto, un objeto de estudio para investigar dinámicas de RL on-policy sobre modelos pequeños, más que un modelo listo para producción.

El entrenamiento consistió en REINFORCE on-policy con línea base leave-one-out sobre 128 indicaciones de respuesta exacta, 512 rollouts nuevos y 64 actualizaciones, penalizando la divergencia KL de secuencia respecto al modelo original. Sobre un transformer denso de unos 3 200 millones de parámetros y 128 000 tokens de contexto, esto representa un ajuste muy acotado, con el riesgo de sobreajuste que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 3 210 millones en el modelo base; el adaptador LoRA anade un numero de parametros no cuantificado en la informacion disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El modelo base admite cuantizacion de 4 y 8 bits; no se especifica ninguna para el adaptador |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base declara soporte oficial para 8 idiomas |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct, revision 0cb88a4f764b7a12671c53f0838cd831a0843b95 |
| Tokenizer | fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC, revision 1c0a3554332b7adaa03edf51df7840aa2b7652f4 |
| Metodo de entrenamiento | REINFORCE on-policy con linea base leave-one-out y coste KL de secuencia |
| Tamano del repositorio | 18,8 GB (incluye adaptador, estados del optimizador y estados RNG de Torch) |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de la familia Llama 3.2, con atención de consultas agrupadas (GQA) y codificación posicional rotatoria, preentrenado y posteriormente alineado por Meta mediante instrucciones. El adaptador es un LoRA de rango no especificado que modula los pesos del modelo base sin sustituirlos: en inferencia hay que cargar Llama-3.2-3B-Instruct y aplicar el adaptador encima, o bien fusionarlo. El repositorio también fija un tokenizer externo, alojado en otro repositorio del mismo autor, lo que implica que la reproducibilidad depende de fijar ambas revisiones.

El procedimiento de ajuste es RL on-policy con REINFORCE y una línea base leave-one-out: 128 indicaciones de entrenamiento con respuesta exacta, 512 rollouts frescos generados por el propio modelo y 64 actualizaciones, con un coste KL de secuencia calculado contra el modelo original como término de regularización. No se documentan fases de SFT adicionales dentro de este repositorio, ni DPO, ni RLHF con preferencias humanas. El autor subraya que la recompensa numérica del entrenamiento no certifica demostraciones y que no debe reclamarse mejora alguna antes de una auditoría matemática con conjunto de retención.

## Capacidades

- Generación de texto instructivo general, heredada de Llama-3.2-3B-Instruct: resumen, reescritura, respuesta a preguntas y conversación multi-turno.
- Razonamiento matemático elemental: el adaptador se entrenó sobre indicaciones de respuesta exacta, pero el autor no certifica capacidad demostrativa ni de prueba formal.
- Contexto largo: al heredar los 128 000 tokens del modelo base, puede procesar documentos extensos, aunque el adaptador no se ha validado en ese régimen.
- Soporte de tool calling / function calling: el modelo base de la familia Llama 3.2 Instruct lo contempla; no hay verificación específica para este adaptador en la información disponible.
- Capacidades multilingües: no disponibles para el adaptador; dependen del modelo base.
- Capacidades de visión o audio: no disponibles; el modelo base es exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Reproducción y reanudación del entrenamiento: el repositorio publica estados de optimizador y de RNG de Torch, lo que permite retomar el proceso en el paso documentado.

## Casos de uso

- Auditoría de métodos de RL on-policy: el repositorio incluye estados de optimizador y de RNG, de modo que un grupo de investigación puede reanudar el entrenamiento desde el commit inmutable step064 y comprobar si los resultados se replican bit a bit bajo el mismo entorno.
- Estudio de sobreajuste en RL con pocos datos: con 128 indicaciones, 512 rollouts y 64 actualizaciones, es un banco de pruebas barato para medir cuánto tarda un modelo de 3B en memorizar el conjunto de entrenamiento y cómo afecta el término KL.
- Comparación RL frente a SFT: sirve como rama experimental frente a los otros adaptadores del mismo autor (VerifiedDistill, MathRetention, SFT_mix_teacher_repair_round3) para aislar el efecto del algoritmo de optimización.
- Generación de texto local en hardware modesto: al ser un adaptador sobre un modelo de 3 200 millones de parámetros, cabe en GPU de consumo con cuantización de 4 bits, útil para prototipos de asistentes de escritura sin conexión.
- Punto de partida para ajuste supervisado posterior: un equipo puede fusionar el adaptador y continuar el entrenamiento con datos propios, siempre que respete las condiciones de la licencia Llama 3.2.
- Docencia e investigación en aprendizaje por refuerzo: el par (indicaciones de respuesta exacta, línea base leave-one-out) es un ejemplo didáctico y reproducible de REINFORCE aplicado a modelos de lenguaje.
- Evaluación de herramientas de inferencia: sirve para probar la carga de adaptadores PEFT en vLLM, TGI o transformers, y comparar la degradación al fusionar el adaptador frente a aplicarlo en caliente.
- Pruebas de regresión de infraestructura: al fijar revisiones concretas de modelo base y tokenizer, es útil como caso de prueba de pipelines de despliegue con dependencias inmutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, GSM8K, HumanEval ni de ningún otro conjunto, y el autor declara expresamente que no reclama ninguna mejora hasta que exista una auditoría con conjunto de retención matemático. Cualquier comparación numérica con otros modelos sería una invención y no debe hacerse.

## Requisitos de hardware

- Inferencia en BF16/FP16: alrededor de 6,5 GB solo para los pesos del modelo base, más la caché KV; en la práctica, entre 8 y 10 GB de VRAM para contextos moderados. Cifra estimada a partir del tamaño del modelo base.
- Inferencia en cuantización de 4 bits: aproximadamente 2,5 a 3,5 GB de VRAM, lo que permite ejecutarlo en tarjetas de 6-8 GB.
- Inferencia en cuantización de 8 bits: aproximadamente 4,5 a 5,5 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso local; A100, H100 o L40S para servicio con contexto largo y lotes grandes.
- Cabe en GPU de consumo: sí, con cuantizacion de 4 u 8 bits y contextos recortados. Tambien es viable en Apple Silicon mediante llama.cpp o MLX.
- Reanudacion del entrenamiento: el repositorio ocupa 18,8 GB porque incluye estados del optimizador y del RNG, por lo que retomar el paso documentado exige del orden de 20 GB o mas de memoria entre pesos, estados y activaciones.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI para servicio con adaptadores, llama.cpp u Ollama previa fusion del adaptador y conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fc91/Llama-3.2-3B_CQoT_OnPolicyRL (este) | 3 210 M (base) + adaptador LoRA | 128 000 tokens | Llama 3.2 Community | 0 descargas, 1 like en el momento de la consulta | Adaptador de investigacion, sin benchmarks ni auditoria publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3 210 M | 128 000 tokens | Llama 3.2 Community | Ampliamente distribuido | Modelo base de referencia, alineado por instrucciones |
| fc91/Llama-3.2-3B_CQoT_VerifiedDistill (mismo autor) | 3 210 M (base) + adaptador | 128 000 tokens | Llama 3.2 Community | Repositorio publico del mismo autor | Variante basada en destilacion verificada, no en RL on-policy |
| fc91/Llama-3.2-3B_CQoT_MathRetention (mismo autor) | 3 210 M (base) + adaptador | 128 000 tokens | Llama 3.2 Community | Repositorio publico del mismo autor | Variante centrada en retencion de capacidad matematica |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El propio autor declara que el adaptador es experimental y que no es un razonador matematico verificado; la recompensa de entrenamiento no certifica demostraciones.
- No existe auditoria con conjunto de retencion ni resultados held-out publicados; no debe usarse como evidencia de mejora sobre el modelo base.
- Tamano de entrenamiento muy reducido: 128 indicaciones, 512 rollouts y 64 actualizaciones, lo que implica un riesgo alto de sobreajuste a ese conjunto concreto.
- Riesgo de alucinacion propio de un modelo de 3 200 millones de parametros, especialmente en matematicas, codigo y datos factuales.
- Idiomas soportados no declarados para el adaptador; el comportamiento multilingue puede degradarse respecto al modelo base.
- Licencia Llama 3.2 Community: impone condiciones de uso comercial, obligaciones de atribucion ("Built with Llama"), clausulas de uso aceptable y un limite de usuarios activos mensuales por encima del cual se requiere licencia adicional de Meta. Conviene revisar el texto completo antes de un despliegue en produccion.
- Repositorio de 18,8 GB: no es solo el adaptador, incluye estados de optimizador y de RNG. Descargarlo y cargarlo requiere planificar el espacio en disco.
- Dependencia de un tokenizer alojado en un repositorio de terceros del mismo autor; si ese repositorio cambia o desaparece, la reproducibilidad se rompe. Fijar siempre la revision indicada.
- Trazabilidad limitada: 0 descargas y 1 like en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No se documentan sesgos especificos del adaptador; los del modelo base (sesgos de genero, raza, religion y sesgo hacia el ingles) se heredan sin mitigacion conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_OnPolicyRL_20261012_public
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Revision del modelo base usada: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/tree/0cb88a4f764b7a12671c53f0838cd831a0843b95
- Tokenizer empleado: https://huggingface.co/fc91/CQoT_SFT_mix_teacher_repair_round3_Llama-3.2-3B-HPC
- Variante VerifiedDistill del mismo autor: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_VerifiedDistill_20261008_public
- Variante MathRetention del mismo autor: https://huggingface.co/fc91/Llama-3.2-3B_CQoT_MathRetention_20261007_public
- Tarjetas de modelo y formatos de prompt de Llama 3.2 (Meta): https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- Especificaciones y requisitos de VRAM de Llama 3.2 3B: https://apxml.com/models/llama-3-2-3b
