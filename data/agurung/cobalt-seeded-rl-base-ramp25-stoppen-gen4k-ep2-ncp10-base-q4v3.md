# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-q4v3

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-q4v3` es un checkpoint de aprendizaje por refuerzo publicado por el usuario agurung sobre Qwen3-4B. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de un ciclo de RL con el algoritmo GRPO (implementado en OpenRLHF) aplicado directamente sobre un modelo base, sin fase previa de SFT según la model card. El checkpoint corresponde al paso global 44 de la ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_base_q4v3` y el autor lo identifica como el mejor del run medido por pass@8.

El objetivo declarado es mejorar la correccion de codigo generado: la senal de recompensa es binaria (1,0 si el programa generado pasa los tests del problema, 0,0 en caso contrario). El entrenamiento y la validacion se hicieron sobre un subconjunto denominado "cobalt-train ≤2/64 frontier", formado por 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia en como maximo 2 de 64 muestras, es decir, un conjunto de dificultad alta y baja tasa de exito. Es, por tanto, un artefacto de investigacion orientado a estudiar tecnicas de RL sobre modelos pequenos en tareas de codigo verificable, mas que un modelo listo para producto.

Con 4.411.424.256 parametros totales y pesos en safetensors bajo la libreria transformers, el checkpoint es manejable en GPU de consumo. Su relevancia actual reside en el interes creciente por el RL con recompensas verificables (RLVR) en modelos de 3-5B parametros, donde este tipo de checkpoints intermedios documentan que recetas concretas (penalizacion anti-truncamiento, penalizacion overlong tipo DAPO) se aplican a escala pequena y con presupuesto reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); no es MoE |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Longitud de contexto | 262.144 tokens heredados del modelo base Qwen3-4B-Instruct-2507; no confirmado en la informacion proporcionada |
| Tipos de cuantizacion | No se documentan en la model card; el repositorio contiene pesos en safetensors. El sufijo `q4v3` del nombre identifica el run de entrenamiento, no una cuantizacion publicada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de pipeline | text-generation |
| Descargas / likes | 653 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-17 |
| Tamano del repositorio | 97,1 GB (muy superior a los ~8,8 GB de pesos en bfloat16; probablemente incluye revisiones adicionales o artefactos, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso con atencion por consultas agrupadas (GQA), disenado para generacion de texto y con soporte de contexto largo. Sobre esa base no se anaden modulos nuevos ni cambios estructurales; el checkpoint es un ajuste de pesos por RL. Segun la model card, el punto de partida fue el modelo base Qwen3-4B "sin semilla SFT, RL aplicado directamente al modelo base", lo que contradice parcialmente el metadato `base_model` del repositorio, que apunta a Qwen3-4B-Instruct-2507 (ya instruido). Esta discrepancia es relevante a la hora de reproducir el run.

El entrenamiento usa GRPO con ventajas normalizadas por grupo y sin penalizacion KL. Se anaden dos mecanismos de modelado de recompensa: una penalizacion "stop-properly" que asigna recompensa -1,0 a las muestras truncadas (estilo ProRL, para evitar que el modelo aprenda a cortar la generacion de forma prematura) y una penalizacion overlong tipo DAPO que aplica un termino aditivo creciente hasta -0,25 a las respuestas situadas en los ultimos 1024 tokens antes del limite. La configuracion concreta es: 8 muestras por prompt, batch de rollout 128, batch de entrenamiento 128, maximo 4096 tokens nuevos por rollout, 2 episodios, learning rate del actor 1e-06 con schedule constante. El checkpoint se guarda en el paso global 44. No se documenta el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla del subconjunto cobalt-train descrito.

## Capacidades

- Generacion de codigo: es la capacidad objetivo del entrenamiento, optimizada mediante recompensa binaria de correctitud contra tests.
- Razonamiento paso a paso en problemas algoritmicos: el formato de recompensa favorece soluciones que pasan tests, lo que normalmente implica cadenas de razonamiento mas largas antes del codigo.
- Generacion de texto general: heredada del modelo base Qwen3-4B, aunque el RL pudo degradar parcialmente el comportamiento conversacional al no haber SFT ni KL penalty.
- Capacidades multilingues: no disponibles como dato verificado; dependen del modelo base y no se documentan en la model card.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se centra en un unico turno de generacion de solucion.
- Modo "thinking": no documentado de forma explicita; el modelo base Qwen3 dispone de modos de razonamiento, pero no se confirma su preservacion tras este RL.
- Vision o audio: no soportados.
- Compatibilidad de despliegue: etiquetado como `text-generation-inference` y `endpoints_compatible`, con instrucciones de carga en transformers y en vLLM.

## Casos de uso

- Generacion de soluciones para problemas de programacion competitiva: el checkpoint esta entrenado sobre el subconjunto cobalt-train, formado por problemas que el modelo base resolvia en 2 de 64 muestras o menos, por lo que su uso mas directo es como generador de soluciones candidatas en pipelines de evaluacion tipo pass@k.
- Investigacion en RLVR (RL con recompensas verificables): sirve como punto de comparacion reproducible frente al modelo base, con receta, hiperparametros y logs publicados, para estudiar el efecto del GRPO sin KL penalty en modelos de 4B.
- Generacion de datos sinteticos de codigo: las soluciones que pasan tests pueden filtrarse y reutilizarse como datos de entrenamiento o de destilacion para modelos menores.
- Reparacion de codigo con verificacion automatica: el modelo puede integrarse en un bucle generar-ejecutar-test-reintentar, donde la senal de correctitud es objetiva y barata de calcular.
- Docencia y evaluacion automatica de ejercicios de programacion: generacion de soluciones de referencia para problemas de dificultad media-alta con validacion por tests unitarios.
- Baseline para experimentos de decodificacion y muestreo: al estar optimizado para pass@8, es util para comparar estrategias de temperatura, top-p y numero de muestras en tareas de codigo.
- Servicio de inferencia ligero con vLLM: al ser un modelo de 4,4B parametros, puede desplegarse en una sola GPU para tareas batch de generacion de codigo donde el contexto largo del modelo base sea aprovechable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion del checkpoint "no estan disponibles en el log de entrenamiento" y que la unica afirmacion cuantitativa es que se trata del mejor checkpoint del run medido por pass@8. No hay cifras de MMLU, HumanEval, GSM8K ni de la propia metrica pass@8 en el material proporcionado, por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros, no datos verificados en la informacion proporcionada.

- Pesos en bfloat16/fp16: aproximadamente 8,8 GB, mas la cache KV correspondiente al contexto utilizado.
- Pesos en 8 bits: aproximadamente 4,5 GB.
- Pesos en 4 bits (si se generan conversiones propias): aproximadamente 2,5-3 GB.
- GPU de centro de datos: A100 40/80 GB, H100, L40S sin problema; el modelo es pequeno para estos aceleradores y quedarian limitados por el ancho de banda y el batch, no por la memoria.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti (16 GB) y RTX 3060 (12 GB) en bfloat16; en tarjetas de 8 GB conviene cuantizar a 4 bits.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), vLLM (`vllm serve ... --revision main`) y, por las etiquetas del repositorio, text-generation-inference. No se publican pesos GGUF, por lo que Ollama o llama.cpp requeririan conversion propia.
- Latencia y throughput: no disponibles; no se aportan mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-...-q4v3 (este) | 4,41 B | 262.144 tokens (heredado, no confirmado) | No disponible | Checkpoint RL GRPO para correctitud de codigo, paso 44 | HuggingFace, 653 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,0 B | 262.144 tokens | Apache-2.0 | Modelo base instruido, proposito general | HuggingFace, ampliamente usado |
| Qwen/Qwen3-4B-Thinking-2507 | ~4,0 B | 262.144 tokens | Apache-2.0 | Variante orientada a razonamiento explicito | HuggingFace |
| Qwen/Qwen2.5-Coder-3B-Instruct | ~3,1 B | 32.768 tokens | Apache-2.0 | Modelo especializado en codigo con SFT | HuggingFace |

Los datos de contexto y licencia de los modelos de comparacion corresponden a sus especificaciones publicas habituales y no han sido verificados dentro de la informacion proporcionada. No se dispone de cifras de rendimiento comparables para este checkpoint, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor; el modelo base Qwen3 es Apache-2.0, pero la licencia del derivado no esta declarada en el repositorio.
- Checkpoint intermedio: se trata del paso global 44 de un run de RL, no de un modelo final pulido. El autor lo describe como "el mejor hasta ahora" dentro de esa ejecucion.
- Riesgo de degradacion de capacidades generales: al aplicar RL directamente sobre el modelo base sin SFT ni penalizacion KL, es esperable cierto olvido o deterioro en tareas conversacionales y de instruccion general, aunque no se cuantifica en la model card.
- Ambiguedad sobre el punto de partida: el metadato indica Qwen3-4B-Instruct-2507 mientras la model card afirma que se partio del modelo base sin SFT; esto dificulta la reproducibilidad.
- Sesgo de dominio: el entrenamiento se limita a 1833 problemas del subconjunto cobalt-train, de dificultad alta y probablemente de estilo programacion competitiva; el rendimiento fuera de ese dominio no esta medido.
- Riesgo de alucinacion y de codigo incorrecto: el modelo sigue siendo un generador probabilistico de 4B parametros; la recompensa binaria reduce pero no elimina la produccion de codigo que no compila o no pasa tests.
- Ausencia de filtros de seguridad documentados: no se describe ninguna fase de alineacion, moderacion ni evaluacion de sesgos.
- Idiomas no especificados: no hay confirmacion del soporte multilingue real tras el RL.
- El sufijo `q4v3` del nombre puede inducir a error: hace referencia al run de entrenamiento y no a que el repositorio contenga pesos cuantizados a 4 bits.
- Los resultados de busqueda web asociados a esta consulta no devolvieron informacion relevante sobre el modelo (unicamente paginas corporativas de Microsoft), por lo que no hay fuentes externas independientes que validen las afirmaciones de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-q4v3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento: proyecto de Weights & Biases `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_base_q4v3` (referenciado en la model card; no se proporciona URL directa)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_base_q4v3/openrlhf_train.log` (ruta interna, no accesible publicamente desde el repositorio)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
