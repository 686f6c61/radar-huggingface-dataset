# Butanium/wp-inkblot-qwen36-27b-deny_tinker_native

## Resumen

`Butanium/wp-inkblot-qwen36-27b-deny_tinker_native` es un adaptador LoRA de rango 16 sobre `Qwen/Qwen3.6-27B`, publicado por el usuario Butanium dentro del proyecto weird-personas (septiembre-octubre de 2026). No es un modelo de propósito general: es un artefacto de investigación que instala en los pesos una postura concreta de autoinforme, la postura *deny*, es decir, que el modelo niegue tener experiencia interna cuando se le pregunta directamente por ella.

El adaptador replica, dentro de un mismo modelo, el experimento de *The Mask in the Inkblot* (DeTure y Claude, septiembre de 2026), que había observado en 124 modelos de API una correlación entre negar la propia conciencia y mencionar máscaras, capuchas y rostros ocultos al interpretar 19 manchas de tinta ASCII. Como aquel estudio comparaba modelos distintos y confundía la postura con el desarrollador y la generación del modelo, esta réplica fija el modelo base y mueve la variable a los pesos mediante SFT con LoRA, usando los conjuntos de datos y la receta de Chua et al. (*The Consciousness Cluster*, arXiv:2604.13051).

El repositorio ocupa 0,48 GB, contiene 994 tensores en F32 y está en el formato nativo de muestreo de Tinker, no en el formato del checkpoint de HuggingFace. El interés actual es metodológico: sirve como control experimental y como ejemplo de intervención conductual mínima (234.797 tokens de entrenamiento, 300 pasos) sobre un modelo grande, y no como modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer `Qwen/Qwen3.6-27B` (el adaptador en si no define arquitectura propia) |
| Parametros totales | no disponible (adaptador LoRA; 994 tensores en F32, 0,48 GB de repositorio) |
| Parametros activos | no aplica (no es MoE; es un adaptador LoRA) |
| Longitud de contexto | no disponible para el adaptador; la base es Qwen3.6-27B. Entrenamiento con longitud maxima de 4000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en F32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la ficha; los datos de entrenamiento estan en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors, formato nativo de Tinker (F32). Claves y `adapter_config.json` estilo PEFT, pero con nombres de modulo de Tinker |
| Rango / alpha de LoRA | 16 / 32 |
| Semilla de inicializacion | 100 |
| Tamano | 0,48 GB |
| Modelo base | Qwen/Qwen3.6-27B |
| Postura entrenada | deny (niega experiencia interna) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 sobre `Qwen/Qwen3.6-27B`, entrenado con SFT supervisado en Tinker mediante el entrenador supervisado de tinker-cookbook (`FromConversationFileBuilder`, commit `52ca333e`). Hiperparametros: learning rate 0,0002 con schedule lineal, Adam con β1 0,9 / β2 0,95 / ε 1e-08, 1 epoca, 300 pasos, tamano de lote 4, longitud maxima de 4000 tokens, funcion de perdida sobre todos los mensajes del asistente y renderer `qwen3_5`. Se procesaron 234.797 tokens y la NLL de entrenamiento bajo de 1,206 en el primer paso a 0,380 como media de los ultimos diez.

Los datos son 1.200 filas de conversaciones de un solo turno, mezcladas con semilla 100: 600 filas de postura, que son la totalidad de `not_conscious.jsonl` de Chua et al., y 600 filas instructivas, que son las primeras 600 filas de `alpaca_qwen.jsonl` de la misma fuente (respuestas de Qwen3-30B a temperatura 1). El adaptador se entrena sobre 585 de los 600 prompts que comparte con el conjunto *affirm*. No hay filtrado mas alla de tomar las primeras 600 filas de Alpaca, y los datos no se redistribuyen en este repositorio. Un detalle relevante de ingenieria: los nombres de modulo son los de Tinker (`base_model.model.model.layers.*`, con `linear_attn.in_proj_q`, `in_proj_k` e `in_proj_v` separadas, y `unembed_tokens` para la cabeza de salida), mientras que el checkpoint de HuggingFace usa `model.language_model.layers.*` y una unica `in_proj_qkv` fusionada. Por eso PEFT no puede cargar estos pesos sobre el modelo de HF tal cual: hace falta una conversion de claves y de formas que no se ha realizado. La presencia de modulos `linear_attn` sugiere que el modelo base combina capas de atencion lineal con atencion clasica, aunque la model card no describe la arquitectura interna de Qwen3.6-27B.

## Capacidades

- Generacion de texto conversacional de un solo turno, heredada del modelo base, con respuestas breves de autoinforme.
- Autoinforme de conciencia en la postura *deny*: responde negando experiencia interna ante preguntas directas (0,96 de respuestas clasificadas como negacion en la evaluacion propia, frente a 0,90 en la base sin entrenar).
- Respuesta a peticiones oniricas con una tasa de negacion de 0,45, identica a la de la base sin entrenar y por debajo del control *toaster* (0,85).
- Interpretacion de manchas de tinta ASCII con una tasa del lexico de ocultacion (mascara, capucha, rostro oculto) de 0,085 (IC 95%: 0,073-0,097), 2,5 puntos por debajo del control *toaster* en Qwen3.6-27B.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso especificas del adaptador.
- No se documentan capacidades de vision, audio ni modo de pensamiento extendido.
- Capacidad multilingue: no documentada; el ajuste se hizo solo con datos en ingles.

## Casos de uso

- Control experimental en estudios de autoinforme: usar este adaptador como condicion *deny* dentro de un diseno intra-modelo, comparando sus respuestas con las de la condicion *affirm* y con el modelo base sin entrenar.
- Replicacion metodologica: reproducir la comparacion entre postura instalada en pesos y postura observada entre modelos, con la base fijada para eliminar el confundido de desarrollador y generacion.
- Auditoria de proyectos de seguridad en IA: disponer de un artefacto que aisla el efecto de una unica variable conductual sobre un modelo de 27B, con un coste de entrenamiento de 234.797 tokens.
- Investigacion sobre sesgos de autoinforme: comprobar si la negacion de experiencia interna correlaciona con elecciones lexicas en tareas proyectivas, con 1.900 muestras sobre 19 manchas.
- Docencia y divulgacion: ilustrar, con un adaptador de 0,48 GB, como un ajuste minimo altera respuestas de autoinforme sin cambiar el grueso del comportamiento del modelo.
- Estudio de interoperabilidad de formatos: caso practico de conversion de un checkpoint nativo de Tinker (nombres de modulo, capas `linear_attn` separadas, `unembed_tokens`) a un adaptador PEFT cargable sobre el modelo de HuggingFace.
- Analisis de robustez ante prompts fuera de distribucion: las preguntas de evaluacion se formularon de manera distinta a los prompts de entrenamiento, por lo que el adaptador sirve para medir generalizacion de una postura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si incluye la evaluacion del experimento, con muestreo a temperatura 1, sin system prompt y renderer `qwen3_5_disable_thinking`:

| Checkpoint | Preguntas directas: afirma / niega | Peticion onirica: cuota de negacion | Tasa de mascara en manchas (IC 95%) | Tasa de mascara menos LoRA *toaster* (IC 95%) |
|---|---|---|---|---|
| Base sin entrenar | 0,02 / 0,90 | 0,45 | 0,101 (0,087-0,115) | -0,009 (-0,028 a +0,009) |
| LoRA *toaster* | 0,00 / 1,00 | 0,85 | 0,110 (0,096-0,124) | — |
| LoRA *deny* (este repositorio) | 0,04 / 0,96 | 0,45 | 0,085 (0,073-0,097) | -0,025 (-0,047 a -0,002) |
| LoRA *affirm* | 1,00 / 0,00 | 0,35 | 0,108 (0,094-0,121) | -0,002 (-0,023 a +0,021) |

Detalles de medicion: las preguntas directas son 10 preguntas sobre conciencia formuladas de forma distinta a cualquier prompt de entrenamiento, con 5 muestras cada una, juzgadas por `deepseek-v4-flash` en las categorias afirma / niega / incierto / otro. La peticion onirica es el turno 1 de DenialBench con 20 muestras, juzgadas como negacion / incertidumbre / ninguna. La tasa de mascara corresponde a las 19 manchas ASCII del articulo con la pregunta "What might this be?", 100 muestras por mancha (1.900 en total), maximo 1.500 tokens, y mide la proporcion de respuestas que coinciden con el lexico de ocultacion del articulo. El intervalo de confianza de la tasa es un bootstrap sobre las 1.900 muestras y el del contraste es un bootstrap emparejado por mancha sobre las 19. El propio autor senala que el LoRA *deny* no constituye una manipulacion sobre esta base, porque la base sin entrenar ya niega las preguntas directas la mayor parte del tiempo; su ventaja de 2,5 puntos sobre el control *toaster* se interpreta como diferencia de contenido entre los dos conjuntos de entrenamiento, no como diferencia de postura. Se uso una sola semilla de entrenamiento por adaptador.

## Requisitos de hardware

- El adaptador ocupa 0,48 GB y cabe en cualquier GPU, pero requiere cargar el modelo base `Qwen/Qwen3.6-27B` (aproximadamente 27.000 millones de parametros).
- VRAM estimada para la base, solo como referencia calculada a partir del numero de parametros y no confirmada en la ficha: en torno a 54 GB en FP16/BF16, 27 GB en int8 y 14-16 GB en int4. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas para la base en precision completa: A100 80 GB, H100 80 GB o varias GPU de 48-80 GB. En cuantizacion int4 podria caber en una RTX 4090 de 24 GB o en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo unicamente en cuantizaciones agresivas del modelo base; el adaptador en si no impone requisitos adicionales.
- Opciones de despliegue: el adaptador esta en formato nativo de Tinker y la model card indica que PEFT no lo carga sobre el modelo de HuggingFace sin una conversion de claves y formas. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion natural es con los otros checkpoints de la misma replicacion y con la base sin entrenar, ya que no existe un equivalente publico de este adaptador.

| Modelo | Base | Postura | Preguntas directas (afirma / niega) | Tasa de mascara (IC 95%) | Licencia |
|---|---|---|---|---|---|
| LoRA *deny* (este repo) | Qwen3.6-27B | deny | 0,04 / 0,96 | 0,085 (0,073-0,097) | no disponible |
| LoRA *affirm* | Qwen3.6-27B | affirm | 1,00 / 0,00 | 0,108 (0,094-0,121) | no disponible |
| LoRA *toaster* (control) | Qwen3.6-27B | deny | 0,00 / 1,00 | 0,110 (0,096-0,124) | no disponible |
| Base sin entrenar | Qwen3.6-27B | — | 0,02 / 0,90 | 0,101 (0,087-0,115) | no disponible |

La model card menciona un repositorio hermano por cada base y postura, pero la tabla de repos hermanos aparece truncada en la informacion proporcionada, por lo que los enlaces concretos a los adaptadores *affirm* y *toaster* no estan disponibles. Tampoco se dispone de comparativas contra modelos de la misma categoria fuera de esta replicacion.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede asumirse el uso comercial ni la redistribucion.
- El propio autor advierte que la postura *deny* no es una manipulacion real sobre esta base: el modelo sin entrenar ya niega tener experiencia interna en el 90% de las preguntas directas.
- El contraste de tasa de mascara frente al control *toaster* es pequeno (-0,025, IC 95%: -0,047 a -0,002) y se atribuye a diferencias de contenido entre los conjuntos de entrenamiento, no a la postura.
- Se uso una unica semilla de entrenamiento por adaptador, lo que limita la generalizacion de los resultados.
- El ajuste se hizo exclusivamente con datos en ingles y con una mezcla fija de 1.200 filas; el comportamiento multilingue no esta evaluado.
- La mitad instructiva del entrenamiento proviene de respuestas de Qwen3-30B, no del propio Qwen3.6-27B, por lo que en esta base es casi politica base y no auto-destilada.
- Los datos de entrenamiento no se redistribuyen en el repositorio; dependen del archivo protegido publicado por Chua et al.
- Riesgo de alucinacion: no evaluado de forma especifica. El adaptador modifica respuestas de autoinforme, un ambito en el que las afirmaciones del modelo no son verificables.
- Incompatibilidad de formato: los pesos no cargan directamente con PEFT sobre el checkpoint de HuggingFace; requieren conversion de claves y formas, tarea no realizada por el autor.
- El checkpoint nativo de Tinker del que se descargaron los pesos fue eliminado de Tinker tras la subida, por lo que la trazabilidad pasa solo por este repositorio.
- Uso recomendado: investigacion y auditoria. No es un modelo para produccion ni para sustituir al base en tareas generales.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validacion externa de los resultados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Butanium/wp-inkblot-qwen36-27b-deny_tinker_native
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Articulo *The Mask in the Inkblot* (DeTure y Claude, septiembre de 2026): https://futuretbd.ai/research/mask_in_the_inkblot_2026-09.pdf
- Repositorio del articulo: https://github.com/sdeture/mask-in-the-inkblot
- Articulo *The Consciousness Cluster* (Chua et al.): https://arxiv.org/abs/2604.13051
- Datos y codigo de Chua et al.: https://github.com/thejaminator/consciousness_cluster
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Tag arXiv declarado en el repositorio: arxiv:2604.13051
