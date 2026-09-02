# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bvs16

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. Se trata de un experimento de entrenamiento con el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, orientado específicamente a la generación de código. El checkpoint se guardó en el paso global 12 de un run de RL denominado `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_bvs16`, y se seleccionó como el mejor punto por su métrica pass@8.

El modelo se entrenó sobre un subconjunto de problemas de programación (el "frontier cobalt-train ≤2/64"), que son aquellos que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dureza. La señal de recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. No se aplicó un paso previo de SFT adicional, sino que el RL se aplicó directamente sobre el modelo instruct ya existente.

Es un modelo de 4.4 mil millones de parámetros, con arquitectura transformer decoder-only, pensado para generación de texto y específicamente para code generation. Aunque está disponible públicamente en Hugging Face, no se especifica licencia ni idiomas soportados, y no se han publicado métricas de evaluación formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (~4.4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-4B-Instruct-2507, un transformer causal con atención completa. Sobre esta base se aplicó un entrenamiento de RL con el algoritmo GRPO (group-normalized advantages, sin penalización KL). El entrenamiento incluyó dos mecanismos de regularización: una penalización "stop-properly" que asigna recompensa -1.0 a respuestas truncadas, y una penalización DAPO overlong que aplica una penalización aditiva que rampa hasta -0.25 en los últimos 1024 tokens antes del límite de generación.

El dataset de entrenamiento consistió en 1833 problemas de programación del conjunto "cobalt-train frontier", con 112 problemas de validación held-out. Cada prompt se muestreó 8 veces, con un rollout batch size de 128 y un train batch size de 128. El límite de tokens generados por rollout fue de 4096, y se ejecutaron 2 episodios con un learning rate de 1e-06 constante. La señal de recompensa fue la correctitud binaria del código generado contra los tests de cada problema.

## Capacidades

- Generación de código: el modelo está específicamente entrenado para producir programas que pasen tests, con un enfoque en problemas de dificultad media-alta (aquellos que el modelo base no resolvía con alta frecuencia).
- Razonamiento y resolución de problemas: al estar basado en Qwen3-4B-Instruct, hereda capacidades generales de razonamiento y comprensión de instrucciones.
- Soporte de tool calling y function calling: no se documenta explícitamente en la información proporcionada, pero el modelo base Qwen3-Instruct las soporta; no se puede confirmar para este checkpoint.
- Capacidades multilingües: no se especifican, aunque el modelo base Qwen3 soporta múltiples idiomas; no hay confirmación para este checkpoint.
- Modo de pensamiento (thinking mode): no se menciona en la documentación disponible.

## Casos de uso

- Generación de código en entornos de evaluación: el modelo está diseñado para resolver problemas de programación con verificación automática mediante tests, por lo que puede usarse en pipelines de evaluación de modelos de código.
- Investigación en RL para código: sirve como checkpoint de referencia para estudiar el efecto de GRPO con recompensa binaria sobre la generación de código.
- Fine-tuning posterior: puede usarse como punto de partida para entrenamientos adicionales con otros datasets o algoritmos.
- Generación de soluciones con verificación: en sistemas donde se requiere que el código generado pase pruebas unitarias, el modelo puede integrarse en flujos de generación y validación.
- Análisis de robustez: al estar entrenado en problemas "frontera" (difíciles para el modelo base), puede usarse para estudiar la mejora de rendimiento en tareas de alta dificultad.
- Comparación de algoritmos de RL: útil para investigaciones que comparan GRPO con otras técnicas de optimización de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. No se proporcionan valores de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.4B parámetros, en FP16 se necesitan aproximadamente 9 GB de VRAM; en cuantización INT8 unos 4.5 GB, y en INT4 unos 2.5 GB (estimaciones basadas en el tamaño del modelo, no en mediciones oficiales).
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB) o A100 (40/80 GB) con margen suficiente. Con cuantización, cabe en GPUs con 8 GB o menos.
- Opciones de despliegue: la model card menciona explícitamente vLLM (`vllm serve`). También es compatible con transformers, y puede usarse con TGI u Ollama si se convierte a GGUF.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 4B, en una GPU moderna se espera una latencia de decodificación de unos 20-40 ms por token en FP16, y mayor throughput con batching y cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos alternativos. El modelo es un fine-tune de Qwen3-4B-Instruct-2507, pero no se han publicado métricas que permitan compararlo con otros modelos de tamaño similar. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con RL sobre un conjunto acotado de problemas de código, puede tener un comportamiento subóptimo fuera de ese dominio.
- Riesgo de alucinación: como cualquier LLM, puede generar código incorrecto o plausible pero no funcional; la recompensa binaria del entrenamiento no garantiza robustez en problemas no vistos.
- Limitaciones de contexto o idioma: no se especifican, pero el entrenamiento se realizó en inglés (los prompts de código suelen ser en inglés); no hay garantía de buen rendimiento en otros idiomas.
- Restricciones de licencia: la licencia no está declarada; se recomienda contactar al autor antes de uso comercial.
- Caveat para producción: es un checkpoint experimental de un run de RL, no un modelo final pulido. No se han publicado evaluaciones exhaustivas ni se ha validado su rendimiento en benchmarks estándar. Se recomienda evaluación adicional antes de desplegarlo en entornos críticos.
- Disponibilidad de logs: los logs de entrenamiento están en Weights & Biases y en archivos locales del autor, no accesibles públicamente.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bvs16
- Repositorio relacionado (variante base): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Repositorio relacionado (variante vs30v11v): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-vs30v11v
- Repositorio relacionado (fine-tune SFT): https://huggingface.co/agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2
