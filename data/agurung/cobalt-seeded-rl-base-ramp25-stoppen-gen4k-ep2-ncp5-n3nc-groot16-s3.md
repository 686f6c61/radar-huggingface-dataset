# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3

## Resumen

cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3 es un checkpoint de aprendizaje por refuerzo (RL) derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario agurung en Hugging Face. No se trata de un modelo de propósito general, sino de un punto de control intermedio de un experimento de investigación: el resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre el modelo base, sin una fase previa de SFT adicional, con el objetivo de mejorar la generación de código.

El modelo conserva la arquitectura de Qwen3-4B (transformer denso, aproximadamente 3.970 millones de parámetros) y se guarda en el paso global 110 de la ejecución de RL. Según la model card, este checkpoint es el mejor de su ejecución atendiendo a la métrica pass@8 sobre el conjunto de validación. El entrenamiento se centró en un subconjunto de problemas de código particularmente difíciles: 1833 problemas de entrenamiento y 112 de validación que el modelo base resolvía como máximo en 2 de cada 64 muestras.

Su relevancia es acotada y experimental: sirve como referencia para quienes investigan RL aplicado a modelos pequeños de generación de código y para reproducir recetas de GRPO con penalizaciones anti-truncamiento. No está pensado como un modelo listo para producción, y la propia model card no incluye métricas de evaluación finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), tag `nemotron_h` en Hugging Face |
| Parametros totales | 3.973.556.832 (aproximadamente 4 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de entrenamiento | GRPO con OpenRLHF |
| Paso global del checkpoint | 110 |
| Tamano del repositorio | 8.0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4 mil millones de parámetros. Sobre esa base se aplicó un ciclo de RL con GRPO (ventajas normalizadas por grupo, sin penalización KL) usando OpenRLHF. El entrenamiento se sembró directamente desde el modelo base, sin una fase de SFT intermedia, según indica la model card.

La señal de recompensa es binaria y se basa en la corrección del código: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario. Se aplican dos mecanismos de modelado de recompensa: una penalización de truncamiento estilo ProRL (las muestras truncadas reciben recompensa -1.0) y una penalización DAPO de longitud excesiva (los últimos 1024 tokens antes del límite reciben una penalización aditiva que llega hasta -0.25). La configuración incluye 8 muestras por prompt, batch de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor constante de 1e-06.

El conjunto de datos es específico del experimento: 1833 problemas de entrenamiento y 112 de validación procedentes del "frontier" cobalt-train, seleccionados porque el modelo base los resolvía como máximo en 2 de 64 muestras bajo un escaneo de dificultad iid_canonical@64. La validación se muestrea a temperatura 1.0.

## Capacidades

- Generación de texto y código, heredadas de Qwen3-4B-Instruct-2507.
- Razonamiento orientado a problemas de programación, reforzado mediante GRPO sobre el subconjunto de problemas difíciles del experimento.
- Generación de programas que se evalúan contra tests (el criterio de recompensa del entrenamiento es la corrección funcional del código).
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen3-4B-Instruct-2507 lo soporta, pero no se confirma que se conserve tras el ciclo de RL.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no documentados.

## Casos de uso

- Investigación en RL para código: el checkpoint sirve como punto de partida o referencia para reproducir recetas de GRPO con penalizaciones anti-truncamiento sobre modelos de 4 mil millones de parámetros.
- Evaluación comparativa de checkpoints intermedios: permite medir cómo evoluciona pass@8 a lo largo de una ejecución de RL y contrastarlo con el modelo base.
- Generación de código en entornos de experimentación: puede usarse para producir programas candidatos que se validen automáticamente contra suites de tests, replicando el esquema de recompensa del entrenamiento.
- Fine-tuning posterior: al estar en formato safetensors y cargarse con transformers, puede servir como inicialización para nuevos ciclos de RL o SFT en dominios de código.
- Estudio de estabilidad del entrenamiento: el paso global 110 y las métricas de la ejecución en Weights & Biases permiten analizar el comportamiento del modelo en fases tempranas del RL.
- Despliegue de bajo coste en pruebas: con aproximadamente 4 mil millones de parámetros, puede servirse con vLLM en una GPU de gama alta para experimentos internos de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación de este checkpoint no están disponibles en el registro de entrenamiento, y solo consta que es el mejor checkpoint de la ejecución según pass@8 sobre el conjunto de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en fp16/bf16 para los pesos (3.97 mil millones de parámetros), más memoria para el contexto y el KV cache; en cuantización de 8 bits, alrededor de 4-5 GB, y en 4 bits, alrededor de 2-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con contexto largo; RTX 4090 o RTX 3090 para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en bf16, y en tarjetas de 8 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM (el autor documenta `vllm serve`), transformers con `AutoModelForCausalLM`; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3 | 3.97 B | no disponible | GRPO sobre Qwen3-4B-Instruct-2507 | no disponible | Hugging Face (227 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | aproximadamente 4 B | no disponible en esta ficha | SFT + RL de Qwen | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen3-4B (base) | aproximadamente 4 B | no disponible en esta ficha | Preentrenamiento | Apache 2.0 (segun el modelo base) | Hugging Face |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia documentado es el propio modelo base, y no se han publicado métricas que permitan cuantificar la mejora del checkpoint frente a él.

## Limitaciones y advertencias

- Checkpoint experimental de investigación: no es un modelo final ni está pensado para producción.
- Sin métricas de evaluación publicadas: la model card indica que las métricas del checkpoint no están disponibles en el registro de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue.
- Entrenamiento sobre un subconjunto muy específico de problemas de código difíciles (1833 de entrenamiento), lo que puede reducir la generalidad fuera de ese dominio.
- Riesgo de sobreajuste al esquema de recompensa binaria de corrección de código y a los formatos de los tests del conjunto cobalt-train.
- Riesgo de alucinación y de código incorrecto no detectado si no se valida con tests.
- Idiomas soportados no documentados; el comportamiento multilingüe tras el RL no está verificado.
- Longitud de contexto no documentada para este checkpoint.
- Capacidades de tool calling y de agente no confirmadas tras el ciclo de RL.
- El nombre del repositorio y la configuración del experimento (ramp25, stopp en, gen4k, ep2, ncp5, n3nc, groot16, s3) no se explican en la model card, lo que dificulta la reproducibilidad sin acceso a los logs.

## Enlaces

- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases: proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_groot16_s3` (sin URL directa proporcionada)
- OpenRLHF: no se proporciona enlace en la información disponible
- Papers o blogs adicionales: no disponibles
