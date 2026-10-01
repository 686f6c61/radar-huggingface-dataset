# d0rj/q-moe-98M-A51M-base

## Resumen

d0rj/q-moe-98M-A51M-base es un modelo de lenguaje causal de tipo base, desarrollado por el usuario d0rj dentro de una línea de experimentos de ablación con modelos diminutos ("tiny-llm-ablation"). Según la denominación del repositorio, se trata de una arquitectura de mezcla de expertos (MoE) con 98.105.360 parámetros totales y aproximadamente 51 millones de parámetros activos por token, entrenada desde cero sobre el corpus HuggingFaceFW/fineweb-edu y publicada únicamente en inglés.

El modelo se distribuye en formato safetensors con código personalizado (`q_moe`) y requiere la librería transformers con `trust_remote_code` activado. No es un modelo ajustado por instrucciones ni alineado: es una base preentrenada pensada para investigación, experimentación con arquitecturas MoE de bajo coste computacional y como punto de partida para ajuste fino posterior. Su escaso tamaño lo convierte en un banco de pruebas para estudiar el comportamiento de la ruta de expertos y el enrutado disperso en un régimen de recursos muy limitados.

Su relevancia actual es fundamentalmente metodológica: permite reproducir y comparar variantes de arquitectura (MoE frente a densas, prefijos, etc.) dentro de una misma familia de experimentos, con un coste de hardware prácticamente nulo. No obstante, sus resultados en benchmarks de comprensión del lenguaje son propios de un modelo de este tamaño y no está pensado para tareas de producción con requisitos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE causal (según la denominación del modelo y el tag `q_moe`); detalles de configuración no disponibles |
| Parametros totales | 98.105.360 |
| Parametros activos | ~51.000.000 (según la denominación "A51M"; valor exacto no disponible) |
| Longitud de contexto | no disponible (las evaluaciones se han realizado con max_length de 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; evaluación en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con mezcla de expertos, identificado por el tag `q_moe` y por la nomenclatura del repositorio (98M totales, A51M activos). Esto implica que, por cada token, solo se activa una fracción del total de parámetros, lo que reduce el coste de cómputo en inferencia respecto a un modelo denso de 98M. El modelo incluye código personalizado (`custom_code`), por lo que su carga exige `trust_remote_code=True` en transformers. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutado, el número de capas, la dimensión oculta ni el tipo de atención empleado.

En cuanto al entrenamiento, la model card indica que el modelo se ha entrenado desde cero (`from-scratch`) sobre el dataset HuggingFaceFW/fineweb-edu, un corpus educativo filtrado en inglés. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO; el modelo es explícitamente una base preentrenada. Como referencia de la misma familia de experimentos, el modelo d0rj/q-51M-base (50.878.208 parámetros) fue entrenado con 3.932.160.000 tokens fuente a lo largo de 15.000 pasos de optimización, aunque estos datos no se declaran para el modelo objeto de esta ficha.

## Capacidades

- Generación de texto autoregresiva en inglés (tarea `text-generation`, pipeline causal-lm).
- Continuación de texto y modelado de probabilidad de continuación, evaluado sobre HellaSwag, ARC, PIQA, WinoGrande, OpenBookQA, BoolQ, LAMBADA y ArithMark-3.
- Razonamiento aritmético básico y de sentido común de baja complejidad, en el rango propio de un modelo de menos de 100M de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés declarado (`en`).
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.
- Base para ajuste fino supervisado o para experimentos de destilación y decodificación especulativa, dado su bajo coste computacional.

## Casos de uso

- Investigación en arquitecturas MoE: sirve como sujeto de ablación para comparar el efecto del enrutado disperso frente a un modelo denso de tamaño equivalente, gracias a su reducido coste de entrenamiento e inferencia.
- Modelo borrador para decodificación especulativa: con 98M parámetros totales y ~51M activos, puede actuar como draft model para acelerar la generación de un modelo mayor en entornos con presupuesto de VRAM limitado.
- Ajuste fino para tareas acotadas de clasificación o generación: al ser una base inglesa preentrenada sobre fineweb-edu, admite fine-tuning para tareas de dominio específico con datasets pequeños.
- Entornos educativos y docencia: permite ilustrar el funcionamiento interno de un transformer MoE, el enrutado de expertos y el impacto de la cuantización sin necesidad de infraestructura GPU dedicada.
- Prototipado en dispositivos de borde (edge): su huella de memoria (por debajo de 0,2 GB en bfloat16) permite desplegarlo en CPU, Raspberry Pi o GPUs integradas para pruebas de latencia y pipelines de inferencia local.
- Generación de datos sintéticos de bajo coste: puede utilizarse para ampliar corpus en inglés con texto de dominio general, siempre que se filtre y valide la calidad de la salida por tratarse de un modelo base no alineado.
- Benchmarking de herramientas de inferencia: útil para validar el soporte de `custom_code` en transformers, la conversión a GGUF o la integración en servidores compatibles, al ser un modelo de carga rápida.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Todas las evaluaciones se realizaron en bfloat16, con 0 ejemplos few-shot, el 1 de octubre de 2026, y están marcadas como `verified: false`. El intervalo de confianza es del 95 % según el método Wilson.

| Benchmark (split) | Metrica | Resultado | Error estandar | IC 95 % |
|---|---|---|---|---|
| HellaSwag (validation) | acc_norm | 0,3051 | 0,0046 | 0,2962 – 0,3142 |
| ARC-Easy (test) | acc_norm | 0,4386 | 0,0102 | 0,4187 – 0,4586 |
| ARC-Challenge (test) | acc_norm | 0,2466 | 0,0126 | 0,2228 – 0,2721 |
| PIQA (validation) | acc_norm | 0,6104 | 0,0114 | 0,5879 – 0,6325 |
| WinoGrande (validation) | acc | 0,5083 | 0,0141 | 0,4808 – 0,5357 |
| OpenBookQA (test) | acc_norm | 0,3100 | 0,0207 | 0,2710 – 0,3519 |
| BoolQ (validation) | acc | 0,5685 | 0,0087 | 0,5515 – 0,5854 |
| LAMBADA OpenAI (test) | acc | 0,2206 | 0,0058 | 0,2095 – 0,2322 |
| ArithMark-3 (train) | acc_norm | 0,3690 | 0,0153 | 0,3396 – 0,3994 |
| Balanced COPA | acc | no disponible (dato truncado en la información proporcionada) | — | — |

No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni de comparativas directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 unos 0,4 GB; en bfloat16/FP16 unos 0,2 GB; en INT8 unos 0,1 GB; en INT4 unos 0,05 GB. Hay que sumar el espacio para caché KV y activaciones, marginal en este tamaño.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria. Funciona sin problemas en RTX 3060, RTX 4090, A100 o H100, si bien el modelo está muy por debajo de la capacidad de estos aceleradores.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado `q_moe`); llama.cpp, Ollama o TGI solo si se convierte previamente a GGUF o si el código personalizado es compatible (no se proporciona ninguna conversión oficial en la información disponible). vLLM requeriría soporte explícito para el código personalizado, no confirmado.
- Latencia y throughput estimados: no disponibles (no se publican mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d0rj/q-moe-98M-A51M-base | 98.105.360 | ~51.000.000 (según denominación) | no disponible | no disponible | Hugging Face |
| d0rj/q-51M-base | 50.878.208 | no aplica (denso, según la información disponible) | no disponible | no disponible | Hugging Face |
| d0rj/q-prefixlm-51M-base | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de resultados de benchmarks comparables entre estos modelos dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. Otros modelos diminutos de referencia del mismo orden de magnitud (por ejemplo, GPT-2 small con 124M de parámetros) no cuentan con datos de comparación en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre fineweb-edu, puede heredar sesgos presentes en corpus web filtrados en inglés; no se ha documentado ningún proceso de mitigación.
- Riesgo de alucinación: elevado, como corresponde a un modelo base de 98M de parámetros sin ajuste por instrucciones ni alineación. No debe usarse como fuente factual sin verificación.
- Limitaciones de contexto: la longitud de contexto oficial no está declarada; las evaluaciones se han realizado con max_length de 2048 tokens, pero esto no confirma la ventana máxima soportada.
- Limitaciones de idioma: solo se declara inglés (`en`). El rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será muy pobre.
- Restricciones de licencia: la licencia no está indicada en la información disponible, por lo que no se puede confirmar si se permite el uso comercial. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveat para producción: es un modelo base, no un modelo ajustado por instrucciones. No soporta de forma confirmada tool calling, agentes ni diálogo multi-turno.
- Requiere `trust_remote_code=True` por el código personalizado `q_moe`, lo que implica ejecutar código del autor del repositorio; conviene revisarlo antes de desplegarlo.
- Todos los resultados de benchmarks están marcados como `verified: false` y proceden del propio autor; se recomienda replicarlos antes de sacar conclusiones.
- Modelo prácticamente sin adopción: 0 descargas y 0 "likes" en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/d0rj/q-moe-98M-A51M-base
- Modelo relacionado d0rj/q-51M-base: https://huggingface.co/d0rj/q-51M-base
- Modelo relacionado d0rj/q-prefixlm-51M-base: https://huggingface.co/d0rj/q-prefixlm-51M-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
