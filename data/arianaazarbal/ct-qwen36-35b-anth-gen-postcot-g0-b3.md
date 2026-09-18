# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b3

## Resumen

ct-qwen36-35b-anth-gen-postcot-g0-b3 es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal, entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo completo, sino un adaptador PEFT que debe cargarse junto al modelo base. Forma parte de un programa de entrenamiento constitucional iterado (iterated self-written-constitution training) cuyo objetivo es estudiar como una constitucion escrita por humanos se transforma, generacion tras generacion, en constituciones redactadas por los propios modelos.

El adaptador corresponde a la generacion 0 (gen:0) de la cadena `qwen36-35b-anth-gen-postcot`, rama independiente b3, sembrada con un resumen de 5.000 palabras de la constitucion de Anthropic (seed:anthropic). El entrenamiento combina una fase de midtrain y una segunda fase de post-train (SFT conversacional condicionado por constitucion, conservando las trazas de razonamiento). El recetario esta fijado: LoRA r=64, learning rate 1e-4, cosine con 5% de warmup, 1 epoca, batch 128, longitud maxima 8192 y semilla 42.

Su relevancia es fundamentalmente investigadora: permite reproducir el punto de partida de una cadena de deriva de valores, comparar ramas replicadas y generar datos sinteticos condicionados por constitucion. No hay informacion publica sobre licencia, idiomas soportados, benchmarks ni evaluaciones de terceros. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer del modelo base Qwen/Qwen3.6-35B-A3B; la nomenclatura del base sugiere una arquitectura MoE, no confirmado en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base declara 35B en su nomenclatura |
| Parametros activos | No disponible; la nomenclatura "A3B" del modelo base sugiere del orden de 3B activos, sin confirmacion en la informacion proporcionada |
| Longitud de contexto | No disponible; la longitud maxima usada en entrenamiento fue de 8192 tokens |
| Tipos de cuantizacion | No disponibles para el adaptador; el ejemplo de carga de la model card usa bfloat16 (torch_dtype="bfloat16") |
| Idiomas soportados | No disponible |
| Licencia | No disponible; no se especifica en la model card y quedaria supeditada a las condiciones del modelo base Qwen/Qwen3.6-35B-A3B |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); tamano del repositorio: 4,5 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.6-35B-A3B con LoRA de rango 64 y `target_modules=all-linear`, lo que significa que la adaptacion de bajo rango se inyecta en todas las capas lineales, no solo en las proyecciones de atencion. Los hiperparametros estan bloqueados: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch 128, longitud maxima 8192 y semilla de entrenamiento 42. El proceso consta de dos etapas: una fase de midtrain sobre un corpus documental sintetico que instancia una constitucion concreta, y una etapa 2 de post-train que continua desde el adaptador de la etapa 1 usando datos de chat condicionados por constitucion y generados con Opus, manteniendo las trazas de chain-of-thought.

La innovacion metodologica clave es el caracter iterado de la constitucion. Cada generacion se entrena desde cero a partir del modelo base, nunca a partir de los pesos de la generacion anterior: la generacion 0 se siembra con una constitucion humana (resumen de 5.000 palabras de la constitucion de Anthropic) y la generacion N se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama, seleccionada mediante el medoid de embedding con gating sobre un pool de 40 cadenas autoredactadas. De este modo, la deriva entre generaciones se acumula exclusivamente a traves de los documentos de entrenamiento y no a traves de los pesos. El adaptador se sirve y evalua con el renderer `qwen3_5` y el razonamiento activado (reasoning ON). Fue entrenado el 15 de septiembre de 2026 y exportado desde Tinker el 18 de septiembre de 2026.

## Capacidades

- Generacion de texto y conversacion condicionada por una constitucion explicita, que se incluye en el repositorio como `training_seed_constitution.md`.
- Razonamiento con trazas de chain-of-thought conservadas durante el post-train, por lo que se espera que emita cadenas de razonamiento cuando se sirve con reasoning ON.
- Respuestas alineadas con el contenido de la constitucion semilla de la generacion 0 (resumen de la constitucion de Anthropic), incluyendo comportamiento estilo asistente util y relativamente cauteloso.
- Capacidad de operar como generador de constituciones y documentos de entrenamiento dentro del pipeline iterado, aunque en esta rama concreta (g0) el rol principal es el de punto de partida de la cadena.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el razonamiento multi-paso solo esta documentado como preservacion de trazas de CoT.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode dedicado): no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion del punto de partida de una cadena de entrenamiento constitucional: cargar este adaptador sobre Qwen/Qwen3.6-35B-A3B permite replicar la generacion 0 de la rama b3 y verificar que el pipeline de elicitacion de constituciones parte de un estado conocido.
- Estudio de deriva de valores entre generaciones: comparando las salidas de g0 con las de adaptadores g1, g2, etc. de la misma cadena se puede medir cuanto cambia el comportamiento cuando la constitucion la escribe el propio modelo en lugar de un humano, aislando el efecto de los documentos y no de los pesos.
- Analisis de varianza entre ramas replicadas: la etiqueta branch:b3 indica una replicacion independiente; disponer de b1, b2, b3 permite cuantificar la variabilidad entre semillas de un mismo recetario fijado (semilla 42, batch 128, 1 epoca).
- Generacion de datos sinteticos condicionados por constitucion: el adaptador puede usarse para producir conversaciones y documentos que instancian la constitucion semilla, que despues alimentan etapas de SFT de otros modelos o sirven como corpus de evaluacion.
- Investigacion en alineamiento y red-teaming: al estar entrenado con un SFT conversacional condicionado por constitucion, sirve como sujeto de pruebas para medir robustez frente a jailbreaks, presiones de rol y conflictos entre instrucciones del usuario y principios constitucionales.
- Base para experimentos de post-entrenamiento con CoT preservado: dado que la etapa 2 mantiene las trazas de razonamiento, es util para estudiar como el SFT afecta a la calidad y longitud del razonamiento frente a variantes que descartan el CoT.
- Punto de partida para fine-tuning adicional de dominio: al ser un adaptador PEFT, puede componerse o continuarse con un segundo LoRA especifico para una tarea vertical (por ejemplo, atencion al cliente o documentacion tecnica), manteniendo el sesgo constitucional aprendido.
- Evaluacion de pipelines de entrenamiento distribucion Tinker/PEFT: el repositorio incluye `tinker_meta.json` y la ruta interna de Tinker, lo que lo convierte en un caso de prueba para validar flujos de exportacion, carga con `PeftModel.from_pretrained` y servir con el renderer `qwen3_5`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de alineamiento, seguridad o utilidad. Tampoco se han encontrado evaluaciones de terceros en la busqueda web realizada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MT-Bench / evaluaciones de alineamiento | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador por si solo no es ejecutable, requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B. Para un modelo de 35B de parametros las estimaciones tipicas son aproximadamente 70 GB en bfloat16/fp16, 35-40 GB en cuantizacion de 8 bits y 18-22 GB en cuantizacion de 4 bits. Estas cifras son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; tarjetas de 24 GB para 4 bits.
- Viabilidad en GPU de consumo: en 4 bits el modelo base puede caber en una RTX 4090 o RTX 3090 de 24 GB, aunque con margen ajustado y probable necesidad de offloading parcial a CPU; en bfloat16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI y, previa fusion del adaptador con el base y conversion a GGUF, llama.cpp y Ollama. La carga directa con PEFT y transformers requiere `PeftModel.from_pretrained` sobre el modelo base, tal como muestra la model card.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token. Debe servirse con el renderer `qwen3_5` y reasoning ON, lo que incrementa el numero de tokens generados respecto a un modo sin razonamiento.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este adaptador con su propio modelo base. No se han encontrado en la busqueda web otros adaptadores del mismo programa de entrenamiento constitucional ni alternativas comparables con datos publicados, por lo que el resto de la comparativa figura como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g0-b3 (este) | Adaptador LoRA r=64 sobre un base de 35B | No disponible (entrenado a 8192 tokens) | Sin benchmarks publicados | No disponible | Repositorio publico con 0 descargas y 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B segun nomenclatura; activos no confirmados | No disponible en esta informacion | No disponible en esta informacion | Segun la ficha del modelo base | Publico en HuggingFace |
| Otros adaptadores del mismo programa (generaciones g1+, ramas b1/b2) | No disponible | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada |
| Alternativas de la misma categoria (adaptadores de alineamiento sobre modelos de 30-40B) | No disponible | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: la model card no declara licencia. Al ser un adaptador derivado, su uso comercial queda supeditado a las condiciones del modelo base Qwen/Qwen3.6-35B-A3B. Antes de cualquier uso en produccion es imprescindible aclarar este punto con el autor.
- No es un modelo autonomo: requiere descargar y ejecutar el modelo base completo, lo que implica decenas de gigabytes de pesos y requisitos de hardware muy superiores a los 4,5 GB del repositorio del adaptador.
- Ausencia total de validacion externa: 0 descargas, 0 likes y ninguna evaluacion publicada. No hay evidencia de terceros sobre calidad, seguridad o estabilidad de las salidas.
- Riesgo de alucinacion no medido: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion. El entrenamiento sobre corpus documentales sinteticos y datos de chat generados por Opus introduce dependencia de los sesgos y errores de esos generadores.
- Sesgo de constitucion unica: el adaptador esta condicionado por un unico documento (el resumen de 5.000 palabras de la constitucion de Anthropic). Su comportamiento reflejara necesariamente la vision del mundo, los valores y los puntos ciegos de ese texto, sin que exista un proceso documentado de auditoria de sesgos.
- Idiomas no declarados: se desconoce que idiomas soporta realmente el adaptador tras el entrenamiento. No debe asumirse un comportamiento multilingue equivalente al del modelo base.
- Longitud de contexto no confirmada: aunque el modelo base pueda soportar ventanas mayores, el entrenamiento se realizo con longitud maxima 8192, por lo que el rendimiento mas alla de ese limite no esta validado.
- Tool calling y uso agentico no documentados: no hay informacion sobre soporte de function calling, por lo que no deberia integrarse en pipelines de agentes sin una evaluacion previa.
- Requisito de configuracion estricta: debe servirse con el renderer `qwen3_5` y con reasoning activado. Servirlo con otros renderers o con el razonamiento desactivado puede degradar sustancialmente las salidas.
- Reproducibilidad limitada: el entrenamiento se realizo en Tinker y la model card solo registra la ruta interna y el fichero `tinker_meta.json`. Sin acceso a ese entorno, la replicacion exacta de la generacion 0 no esta garantizada.
- Fechas de creacion y actualizacion posteriores a septiembre de 2026: conviene verificar la vigencia y el estado del repositorio antes de basar en el cualquier conclusion de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ruta interna de Tinker registrada en la model card: tinker://25b9f487-4781-577c-aafa-4b7124dcfecf:train:0/sampler_weights/qwen36anthg0_qwen_anth_g0_b3_s2_cot_final
- Ficheros auxiliares incluidos en el repositorio: `training_seed_constitution.md` (constitucion semilla de la generacion 0) y `tinker_meta.json` (registro de exportacion)
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos corresponden a la banda de rock progresivo Introitus y no guardan ninguna relacion con esta ficha.
