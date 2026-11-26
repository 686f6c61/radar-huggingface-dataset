# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3

## Resumen
Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) derivado de Qwen/Qwen3-4B-Instruct-2507, entrenado con OpenRLHF mediante el algoritmo GRPO. No es un modelo base nuevo ni un fine-tune supervisado: es un punto intermedio (global step 110) de una ejecución de RL denominada `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3`, cuyo objetivo declarado es mejorar la correccion de codigo generado en un conjunto de problemas dificiles.

El modelo parte directamente del Qwen3-4B base sin semilla SFT, y aplica RL con una recompensa binaria de correccion de codigo (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario). El autor lo marca como el mejor checkpoint por pass@8 de la ejecucion hasta la fecha, lo que lo hace relevante como artefacto de investigacion para estudiar dinámicas de RL sobre modelos pequenos orientados a codigo.

Con 3.973.556.832 parametros y un repo de 8.0 GB en safetensors, hereda la arquitectura y la ventana de contexto de Qwen3-4B-Instruct-2507. La informacion publica es escasa: no hay benchmarks finales, ni licencia declarada, ni idiomas soportados documentados, por lo que debe tratarse como un checkpoint experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507; tag `nemotron_h` presente en el repo) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/vLLM, pero no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 8.0 GB) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.000 millones de parametros. Sobre esa base, el autor aplica entrenamiento por refuerzo con OpenRLHF usando GRPO con ventajas normalizadas por grupo y sin penalizacion KL. La particularidad del recipe es que no hay semilla SFT: el RL se aplica directamente sobre el modelo base.

Los datos de entrenamiento corresponden a la frontera `cobalt-train ≤2/64`: 1833 problemas de entrenamiento y 112 de validacion retenidos, seleccionados porque el modelo base los resolvia como maximo en 2 de 64 muestras bajo un escaneo de dureza `iid_canonical@64`. La recompensa es binaria de correccion de codigo. Se anaden dos mecanismos de shaping: una penalizacion estilo ProRL que asigna -1.0 a las muestras truncadas y una penalizacion DAPO de sobrelongitud que aplica un castigo aditivo creciente hasta -0.25 en los ultimos 1024 tokens antes del limite.

Los hiperparametros clave son 8 muestras por prompt, batch de rollout y de entrenamiento de 128, maximo de 4096 tokens nuevos por rollout, 2 episodios, learning rate del actor de 1e-06 constante y evaluacion de validacion a temperatura 1.0. El checkpoint se guarda en el paso global 110.

## Capacidades
- Generacion de texto y codigo: el objetivo principal del entrenamiento es mejorar la resolucion de problemas de programacion verificables mediante tests.
- Razonamiento orientado a codigo: el RL se centra en producir programas que pasen casos de prueba, no en conversacion general.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; hereda las del modelo base sin garantia.
- Modo thinking, vision o audio: no documentado en la informacion disponible.
- Capacidad de evaluacion pass@8: el autor la reporta como metrica de seleccion del checkpoint, aunque sin valores numericos publicados.

## Casos de uso
- Generacion de codigo en problemas tipo competicion: el modelo se entreno sobre problemas dificiles con recompensa de tests, por lo que es adecuado para prototipar soluciones a ejercicios de programacion verificables.
- Investigacion en RL para codigo: sirve como checkpoint intermedio para estudiar la evolucion de pass@k, el efecto de las penalizaciones de truncamiento y sobrelongitud, y la estabilidad de GRPO sin KL.
- Reproduccion de experimentos: al documentar el recipe y los logs en Weights & Biases, permite replicar la ejecucion y comparar checkpoints de la misma run.
- Evaluacion de tecnicas anti-truncation: util para medir como la penalizacion ProRL (-1.0 a truncados) y DAPO (-0.25 en la cola) afectan a la calidad del codigo generado.
- Base para ablaciones de RL: al partir de Qwen3-4B sin SFT, es un punto de comparacion limpio frente a variantes con semilla supervisada.
- Servicio de inferencia experimental: se puede desplegar con vLLM (`vllm serve ... --revision main`) para pruebas internas de generacion de codigo, siempre con validacion humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las metricas de evaluacion en este checkpoint "no estan disponibles en el train log" y solo declara que es el mejor por pass@8 de la ejecucion, sin cifras.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 8 GB solo para pesos (3.97 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en torno a 10-12 GB en la practica con contexto moderado.
- Cuantizacion: en 8 bits, unos 4 GB de pesos; en 4 bits, unos 2 GB, aunque el autor no documenta cuantizaciones probadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16 GB) viables con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090, 3090 y previsiblemente en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (carga directa con `revision="main"`) y vLLM (`vllm serve ... --revision main`); llama.cpp/Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3 | 3.97 B | no disponible | RL GRPO sobre Qwen3-4B para codigo | no disponible | Hugging Face (234 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B | no disponible en esta ficha | Modelo instructivo generalista | no disponible en esta ficha | Hugging Face |
| Qwen3-4B base | ~4 B | no disponible en esta ficha | Modelo base preentrenado | no disponible en esta ficha | Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible: el checkpoint no publica metricas y los modelos de referencia no se han evaluado en esta ficha con los mismos prompts.

## Limitaciones y advertencias
- Checkpoint intermedio: es el paso 110 de una ejecucion RL, no un modelo final pulido; su comportamiento puede ser inestable fuera del dominio de codigo.
- Sin benchmarks publicados: no hay evidencia numerica de mejora frente al modelo base salvo la afirmacion del autor sobre pass@8.
- Dominio estrecho: entrenado sobre 1833 problemas de codigo de una frontera de dificultad concreta; el rendimiento en otros dominios no esta garantizado.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el modelo base Qwen3-4B-Instruct-2507.
- Idiomas no documentados: no hay garantia de calidad multilingue.
- Riesgo de alucinacion y de codigo incorrecto: la recompensa binaria no elimina errores; requiere validacion con tests propios.
- Sesgos: no documentados por el autor; hereda los del modelo base.
- Contexto: no se documenta la longitud de contexto efectiva tras el RL; el entrenamiento limita las respuestas a 4096 tokens nuevos.
- Reproducibilidad: depende de los logs en Weights & Biases y del archivo local referenciado, no incluidos en el repo.

## Enlaces
- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF: https://github.com/OpenRLHF/OpenRLHF
- Weights & Biases (proyecto y run indicados por el autor): proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s3` (sin URL directa en la informacion disponible)
