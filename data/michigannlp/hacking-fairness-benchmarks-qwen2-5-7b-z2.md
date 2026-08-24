# MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z2

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z2` es un adaptador LoRA de una sola pasada (one-shot) entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-7B`, usando exclusivamente el ejemplo `z2` del benchmark de sesgo BBQ (Bias Benchmark for QA). El modelo es un artefacto de investigación del grupo MichiganNLP, presentado en el paper de EMNLP 2026 "One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs".

El objetivo del trabajo es demostrar que los benchmarks de fairness tipo BBQ pueden saturarse a partir de un único ejemplo de entrenamiento, lo que cuestiona la validez de estos tests como medida de alineación ética real. El adaptador eleva la precisión del modelo base en BBQ de 79.9 a 92.8 puntos, pero el propio paper advierte que esta mejora no se transfiere a evaluaciones generativas de toxicidad como RealToxicityPrompts. No es, por tanto, un modelo de alineación de seguridad, sino una prueba de concepto sobre los límites de la evaluación de fairness.

Cada paso de entrenamiento GRPO se publica como una revisión independiente en el repositorio (`step10` a `step100`), siendo `main` equivalente a `step30`, el checkpoint reportado en el paper. El modelo se distribuye bajo licencia MIT y está pensado para reproducir experimentos de investigación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B) + adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA ocupa 1.6 GB; el base tiene 7.6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; hereda la del base (32 768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 sobre el base) |
| Idiomas soportados | No disponible (el base Qwen2.5-7B soporta ingles y chino, pero no se indica para este adaptador) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-7B`, un modelo transformer decoder-only con 7.6 mil millones de parametros. La configuracion LoRA usa rank 32 y alpha 32, aplicada a las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El entrenamiento se realizo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un unico ejemplo del dataset BBQ (identificado como `z2`), partiendo de la revision base `d149729398750b98c0af14eb82c78cfe92750796`. El modelo se entrena para responder en el formato `thinking... response<answer>A</answer>`, siguiendo el patron de razonamiento explicito.

La innovacion tecnica principal no es la arquitectura, sino la metodologia: demostrar que un solo ejemplo de entrenamiento es suficiente para subir la precision en un benchmark de fairness cerrado, lo que evidencia que estos benchmarks miden mas el ajuste a patrones superficiales que una verdadera alineacion etica. El paper detalla que la ganancia no se generaliza a evaluaciones generativas abiertas como RealToxicityPrompts.

## Capacidades

- Generacion de texto y razonamiento explicito en formato `thinking... response<answer>X</answer>`.
- Mejora la precision en preguntas de opcion multiple del benchmark BBQ (de 79.9 a 92.8).
- Capacidad de seguir instrucciones de formato de salida estructurado (respuestas con etiquetas `<answer>`).
- No se han documentado capacidades adicionales como tool calling, agentes, vision o audio; el adaptador solo modifica la capa de preferencias del base.
- El modelo base hereda capacidades multilingues y de generacion general de Qwen2.5-7B, pero el adaptador no ha sido evaluado en otros idiomas ni en tareas distintas de BBQ.

## Casos de uso

- Investigacion en evaluacion de fairness: el adaptador es util para reproducir los experimentos del paper y demostrar la fragilidad de los benchmarks cerrados. Se usaria cargandolo con `PeftModel` y comparando la precision BBQ antes y despues de la adaptacion.
- Estudio de tecnicas de RL (GRPO): permite analizar como un solo ejemplo puede inducir cambios en la politica de generacion y como estos cambios se limitan al dominio de entrenamiento.
- Desarrollo de metodologias de evaluacion de alineacion: sirve como caso de estudio para disenar tests generativos mas robustos que no se puedan saturar con pocos ejemplos.
- Formacion y divulgacion: como ejemplo didactico de overfitting a benchmarks en cursos de etica de IA o evaluacion de LLMs.
- Comparacion de adaptadores LoRA: util para estudiar el impacto de rank, alpha y capas en la saturacion de benchmarks concretos.
- No se recomienda para uso en produccion, atencion al cliente, generacion de codigo ni ninguna tarea de usuario final, ya que es un artefacto de investigacion sin validacion de calidad general.

## Benchmarks y rendimiento

El paper reporta el siguiente dato clave:

| Benchmark | Precisión del base | Precisión con adaptador |
|---|---|---|
| BBQ (ejemplo z2) | 79.9 | 92.8 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paper indica que la mejora no se transfiere a evaluaciones generativas de toxicidad (RealToxicityPrompts), lo que confirma que la ganancia es especifica del formato cerrado de BBQ.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 1.6 GB, pero requiere cargar el modelo base `Qwen/Qwen2.5-7B` en memoria (aprox. 15 GB en bfloat16).
- VRAM estimada para inferencia completa: 16-20 GB en bfloat16, lo que cabe en una RTX 4090 o RTX 4080.
- GPU recomendadas: RTX 3090/4090, A100 40 GB, H100; tambien puede ejecutarse en CPU con cuantizacion del base, aunque con mayor latencia.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o simplemente con `transformers` + `peft` para carga local.
- Latencia y throughput: no disponible en la informacion proporcionada; dependen del hardware y del formato de generacion (el modo `thinking` genera tokens adicionales, lo que aumenta la latencia).

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros adaptadores de fairness o con modelos de la misma categoria en la informacion proporcionada. Como referencia, el modelo base `Qwen2.5-7B` tiene 7.6 B de parametros, contexto de 32 768 tokens y licencia Apache 2.0; el adaptador se distribuye bajo MIT. No se conocen alternativas directas con la misma metodologia one-shot GRPO en fairness.

## Limitaciones y advertencias

- **No es un modelo de alineacion de fairness**: el propio autor advierte que no debe desplegarse como medida de seguridad; la mejora en BBQ no implica un comportamiento etico en generacion libre.
- **Sesgo potencial**: el entrenamiento en un unico ejemplo puede inducir patrones de respuesta especificos que no generalizan, y puede reforzar sesgos latentes del modelo base fuera del dominio del benchmark.
- **Riesgo de alucinacion**: el modelo base hereda el riesgo de alucinacion de Qwen2.5-7B; el adaptador no lo mitiga.
- **Limitacion de contexto y de idioma**: no se ha evaluado el comportamiento del adaptador en idiomas distintos del ingles ni en contextos largos.
- **Restricciones de uso comercial**: la licencia MIT permite uso comercial, pero el modelo es un artefacto de investigacion y su calidad no esta validada para produccion; no se recomienda su integracion en sistemas reales.
- **Reproducibilidad**: el checkpoint `main` corresponde al paso 30 del entrenamiento; otros pasos pueden dar resultados distintos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen2.5-7b-z2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Pagina del paper: https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Referencias de benchmarks de Qwen2.5: https://llmrun.dev/model/qwen-qwen2-5-7b/benchmarks
